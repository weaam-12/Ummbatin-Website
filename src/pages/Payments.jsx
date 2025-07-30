import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useTranslation } from 'react-i18next';
import {
    Card, Tabs, Tab, Button, Alert, Spinner, Container, ListGroup, Badge, Row, Col, Accordion,
    Modal
} from 'react-bootstrap';
import {
    FiCreditCard, FiCheckCircle, FiClock, FiDollarSign, FiDownload, FiHome, FiX
} from 'react-icons/fi';
import './Payment.css';

import { getUserPayments, getPropertiesByUserId } from '../api';
import axios from 'axios';

const Payments = () => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('water');
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState(null);
    const [payments, setPayments] = useState({
        water: [],
        arnona: []
    });
    const [properties, setProperties] = useState([]);
    const [debt, setDebt] = useState(0);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [currentPayment, setCurrentPayment] = useState(null);

    const statusVariants = {
        PENDING: 'warning',
        PAID: 'success',
        OVERDUE: 'danger',
        FAILED: 'danger'
    };
    const statusLabels = {
        PENDING: t('payments.status.PENDING'),
        PAID: t('payments.status.PAID'),
        OVERDUE: t('payments.status.OVERDUE'),
        FAILED: t('payments.status.FAILED')
    };

    const formatDate = (d) => d ? new Date(d).toLocaleDateString() : '--';

    // تحميل البيانات
    useEffect(() => {
        const load = async () => {
            try {
                // جلب العقارات أولاً
                const props = await getPropertiesByUserId(user?.userId);
                console.log('العقارات المحملة:', props);

                // جلب الدفعات
                const data = await getUserPayments(user?.userId);
                console.log('الدفعات المحملة:', data);

                // تنظيم الدفعات مع ربطها بالعقارات
                const organizedPayments = {
                    water: organizePaymentsByProperty(
                        data.filter(p => p.paymentType === 'WATER'),
                        props
                    ),
                    arnona: organizePaymentsByProperty(
                        data.filter(p => p.paymentType === 'ARNONA'),
                        props
                    )
                };

                console.log('الدفعات المنظمة:', organizedPayments);
                setPayments(organizedPayments);
                setProperties(props);
            } catch (e) {
                console.error('Error loading data:', e);
                setNotification({
                    type: 'danger',
                    message: 'فشل تحميل البيانات: ' + e.message
                });
            } finally {
                setLoading(false);
            }
        };

        if (user) load();
    }, [user]);

    const organizePaymentsByProperty = (payments, properties = []) => {
        const byProperty = {};

        payments.forEach(payment => {
            let property = properties.find(p => p.propertyId == payment.propertyId);

            if (!property && payment.propertyAddress) {
                property = properties.find(p =>
                    p.address && payment.propertyAddress &&
                    p.address.trim() === payment.propertyAddress.trim()
                );
            }

            const propertyId = property?.propertyId || payment.propertyAddress || 'unknown';

            if (!byProperty[propertyId]) {
                byProperty[propertyId] = {
                    propertyInfo: {
                        address: property?.address || payment.propertyAddress || 'عنوان غير معروف',
                        area: property?.area || payment.propertyArea || 0,
                        units: property?.numberOfUnits || payment.propertyUnits || 0,
                        originalPropertyId: property?.propertyId
                    },
                    payments: []
                };
            }
            byProperty[propertyId].payments.push(payment);
        });

        return byProperty;
    };

    // حساب الدين التراكمي (يشمل PENDING و FAILED فقط)
    useEffect(() => {
        const totalDebt = Object.values(payments).reduce((sum, paymentType) => {
            return sum + Object.values(paymentType).reduce((typeSum, propertyPayments) => {
                return typeSum + propertyPayments.payments.reduce((propertySum, payment) => {
                    return (payment.status === 'PENDING' || payment.status === 'FAILED') ?
                        propertySum + payment.amount :
                        propertySum;
                }, 0);
            }, 0);
        }, 0);
        setDebt(totalDebt);
    }, [payments]);

    // توليد PDF
    const handleDownloadPDF = (type, propertyId) => {
        setLoading(true);
        const element = document.getElementById(`invoice-${type}-${propertyId}`);
        html2canvas(element, {
            scale: 2,
            logging: false,
            useCORS: true
        }).then((canvas) => {
            const img = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const w = pdf.internal.pageSize.getWidth();
            const h = (canvas.height * w) / canvas.width;
            pdf.addImage(img, 'PNG', 0, 0, w, h);
            pdf.save(`${t(`payments.types.${type}`)}-${propertyId}-${new Date().toLocaleDateString()}.pdf`);
            setLoading(false);
        }).catch(() => {
            setNotification({ type: 'danger', message: t('payments.notifications.pdfError') });
            setLoading(false);
        });
    };

    // الدفع الحقيقي عبر الباك-إند
    const handlePayment = async (paymentType, paymentId) => {
        setLoading(true);
        try {
            // البحث عن الدفع المحدد في state `payments`
            const payment = Object.values(payments[paymentType] || {})
                .flatMap(propertyPayments => propertyPayments.payments || [])
                .find(p => p.paymentId === paymentId);

            if (!payment) {
                throw new Error("Payment not found");
            }

            setCurrentPayment({
                type: paymentType,
                id: paymentId,
                amount: payment.amount,
                description: `دفع ${paymentType}`
            });
            setShowPaymentModal(true);

        } catch (error) {
            console.error("Payment error:", error);
            setNotification({
                type: "danger",
                message: error.message || "فشل في إعداد الدفع"
            });
        } finally {
            setLoading(false);
        }
    };

    const processPayment = async () => {
        setLoading(true);
        try {
            const { data } = await axios.post("/api/payments/process", {
                amount: Math.round(currentPayment.amount * 100),
                currency: "ils",
                description: currentPayment.description,
                userId: user.userId,
                paymentId: currentPayment.id
            });

            // هنا يمكنك استخدام Stripe.js لمعالجة الدفع
            // أو عرض رسالة نجاح مباشرة للمشروع الجامعي
            setNotification({
                type: "success",
                message: "تم الدفع بنجاح!"
            });

            // تحديث حالة الدفع في الواجهة
            const updatedPayments = { ...payments };
            Object.values(updatedPayments[currentPayment.type]).forEach(propertyPayments => {
                propertyPayments.payments.forEach(p => {
                    if (p.paymentId === currentPayment.id) {
                        p.status = "PAID";
                        p.paymentDate = new Date().toISOString();
                    }
                });
            });
            setPayments(updatedPayments);

            setShowPaymentModal(false);
        } catch (error) {
            console.error("Payment processing error:", error);
            setNotification({
                type: "danger",
                message: error.message || "فشل في عملية الدفع"
            });
        } finally {
            setLoading(false);
        }
    };

    const renderPropertyPayments = (propertyId, paymentsData, paymentType) => {
        const { propertyInfo, payments } = paymentsData;
        const pendingPayments = payments.filter(p => p.status === 'PENDING' || p.status === 'FAILED');
        const paidPayments = payments.filter(p => p.status === 'PAID');

        return (
            <Accordion.Item key={propertyId} eventKey={propertyId} className="mb-3">
                <Accordion.Header>
                    <div className="d-flex justify-content-between w-100">
                        <span>
                            <FiHome className="me-2" />
                            {propertyInfo.address} (مساحة: {propertyInfo.area} م²، وحدات: {propertyInfo.units})
                        </span>
                        {pendingPayments.length > 0 && (
                            <Badge bg="danger" className="ms-2">
                                {pendingPayments.length} {t('payments.pending')}
                            </Badge>
                        )}
                    </div>
                </Accordion.Header>
                <Accordion.Body>
                    <div id={`invoice-${paymentType}-${propertyId}`} className="payment-details p-3">
                        <h5 className="mb-3">{t(`payments.types.${paymentType}`)}</h5>

                        {/* الدفعات المعلقة */}
                        {pendingPayments.length > 0 && (
                            <>
                                <h6 className="mt-3 text-danger">
                                    <FiClock className="me-2" />
                                    {t('payments.pendingPayments')}
                                </h6>
                                <ListGroup className="mb-4">
                                    {pendingPayments.map((payment, i) => (
                                        <ListGroup.Item key={`pending-${i}`} className="position-relative">
                                            <div className="d-flex justify-content-between align-items-center">
                                                <div>
                                                    <span className="d-block">{formatDate(payment.date)}</span>
                                                    <small className="text-muted">رقم الفاتورة: {payment.paymentId}</small>
                                                </div>
                                                <span className="fw-bold">{payment.amount} {t('payments.currency')}</span>
                                                <Badge bg={statusVariants[payment.status] || 'secondary'}>
                                                    {statusLabels[payment.status] || t('payments.status.UNKNOWN')}
                                                </Badge>
                                            </div>
                                            <Button
                                                variant={payment.status === 'FAILED' ? 'danger' : 'primary'}
                                                size="sm"
                                                className="mt-2"
                                                onClick={() => handlePayment(paymentType, payment.paymentId)}
                                                disabled={loading}
                                            >
                                                {loading ? (
                                                    <Spinner animation="border" size="sm" className="me-2" />
                                                ) : (
                                                    payment.status === 'FAILED' ? t('payments.retryPayment') : t('payments.invoice.payNow')
                                                )}
                                            </Button>
                                        </ListGroup.Item>
                                    ))}
                                </ListGroup>
                            </>
                        )}

                        {/* سجل الدفعات */}
                        <h6 className="mt-3">
                            <FiClock className="me-2" />
                            {t('payments.invoice.paymentHistory')}
                        </h6>
                        <ListGroup>
                            {paidPayments.map((payment, i) => (
                                <ListGroup.Item key={`paid-${i}`}>
                                    <div className="d-flex justify-content-between align-items-center">
                                        <div>
                                            <span className="d-block">{formatDate(payment.paymentDate || payment.date)}</span>
                                            <small className="text-muted">رقم الفاتورة: {payment.paymentId}</small>
                                        </div>
                                        <span className="fw-bold">{payment.amount} {t('payments.currency')}</span>
                                        <Badge bg="success">
                                            {statusLabels.PAID}
                                        </Badge>
                                    </div>
                                    <Button
                                        variant="outline-success"
                                        size="sm"
                                        className="mt-2"
                                        onClick={() => handleDownloadPDF(paymentType, propertyId)}
                                        disabled={loading}
                                    >
                                        <FiDownload className="me-1" />
                                        {t('payments.invoice.downloadPdf')}
                                    </Button>
                                </ListGroup.Item>
                            ))}
                        </ListGroup>
                    </div>
                </Accordion.Body>
            </Accordion.Item>
        );
    };

    const renderTab = (key) => {
        const paymentData = payments[key];
        if (!paymentData || Object.keys(paymentData).length === 0) {
            return (
                <Tab eventKey={key} title={t(`payments.types.${key}`)}>
                    <Alert variant="info" className="mt-3">
                        {t('payments.noPaymentsFound')}
                    </Alert>
                </Tab>
            );
        }

        return (
            <Tab eventKey={key} title={t(`payments.types.${key}`)}>
                <div className="mt-3">
                    <Accordion defaultActiveKey={Object.keys(paymentData)[0]}>
                        {Object.entries(paymentData).map(([propertyId, paymentsData]) =>
                            renderPropertyPayments(propertyId, paymentsData, key)
                        )}
                    </Accordion>
                </div>
            </Tab>
        );
    };

    return (
        <Container className="user-payments-container py-4">
            {notification && (
                <Alert variant={notification.type} dismissible onClose={() => setNotification(null)}>
                    {notification.message}
                </Alert>
            )}

            {/* Modal لتأكيد الدفع */}
            <Modal show={showPaymentModal} onHide={() => setShowPaymentModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>تأكيد الدفع</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>هل تريد تأكيد دفع فاتورة {currentPayment?.type} بقيمة {currentPayment?.amount} شيكل؟</p>
                    <div className="d-flex justify-content-between mt-4">
                        <Button variant="secondary" onClick={() => setShowPaymentModal(false)}>
                            إلغاء
                        </Button>
                        <Button variant="primary" onClick={processPayment} disabled={loading}>
                            {loading ? (
                                <>
                                    <Spinner animation="border" size="sm" className="me-2" />
                                    جاري المعالجة...
                                </>
                            ) : (
                                'تأكيد الدفع'
                            )}
                        </Button>
                    </div>
                </Modal.Body>
            </Modal>

            <Card className="shadow-sm">
                <Card.Header className="bg-primary text-white">
                    <h4 className="mb-0"><FiDollarSign className="me-2" />{t('payments.title')}</h4>
                </Card.Header>

                <Card.Body>
                    <div className="d-flex justify-content-between mb-3">
                        <span>{t('payments.totalDebt')}:
                            <strong className={debt > 0 ? 'text-danger' : 'text-success'}>
                                {debt} {t('payments.currency')}
                            </strong>
                        </span>
                    </div>

                    {loading ? (
                        <div className="text-center py-5">
                            <Spinner animation="border" role="status" />
                            <p className="mt-2">{t('payments.loading')}</p>
                        </div>
                    ) : (
                        <Tabs activeKey={activeTab} onSelect={k => setActiveTab(k)} className="mb-4">
                            {renderTab('water')}
                            {renderTab('arnona')}
                        </Tabs>
                    )}
                </Card.Body>
            </Card>
        </Container>
    );
};

export default Payments;