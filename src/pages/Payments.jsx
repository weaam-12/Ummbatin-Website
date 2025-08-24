import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useTranslation } from 'react-i18next';
import {
    Card, Tabs, Tab, Button, Alert, Spinner, Container, ListGroup, Badge, Row, Col, Accordion,
    Modal, Form
} from 'react-bootstrap';
import {
    FiCreditCard, FiCheckCircle, FiClock, FiDollarSign, FiDownload, FiHome, FiX
} from 'react-icons/fi';
import './Payment.css';
import { getUserPayments, getPropertiesByUserId } from '../api';
import { axiosInstance } from '../api';

import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

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
    const stripe = useStripe();
    const elements = useElements();
    const [properties, setProperties] = useState([]);
    const [debt, setDebt] = useState(0);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [currentPayment, setCurrentPayment] = useState(null);
    const [cardData, setCardData] = useState({
        number: '',
        name: '',
        expiry: '',
        cvc: ''
    });
    const [paymentSuccess, setPaymentSuccess] = useState(false);

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

    useEffect(() => {
        const loadData = async () => {
            try {
                const props = await getPropertiesByUserId(user?.userId);
                const data = await getUserPayments(user?.userId);

                setPayments({
                    water: organizePaymentsByProperty(
                        data.filter(p => p.paymentType === 'WATER'),
                        props
                    ),
                    arnona: organizePaymentsByProperty(
                        data.filter(p => p.paymentType === 'ARNONA'),
                        props
                    )
                });
                setProperties(props);
            } catch (e) {
                setNotification({
                    type: 'danger',
                    message: t('payments.notifications.loadError')
                });
            } finally {
                setLoading(false);
            }
        };

        if (user) loadData();
    }, [user]);

    const organizePaymentsByProperty = (payments, properties = []) => {
        const byProperty = {};
        payments.forEach(payment => {
            const property = properties.find(p => p.propertyId == payment.propertyId) ||
                properties.find(p => p.address?.trim() === payment.propertyAddress?.trim());
            const propertyId = property?.propertyId || payment.propertyAddress || 'unknown';

            if (!byProperty[propertyId]) {
                byProperty[propertyId] = {
                    propertyInfo: {
                        address: property?.address || payment.propertyAddress || t('common.notSpecified'),
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

    useEffect(() => {
        const totalDebt = Object.values(payments).reduce((sum, paymentType) => {
            return sum + Object.values(paymentType).reduce((typeSum, propertyPayments) => {
                return typeSum + propertyPayments.payments.reduce((propertySum, payment) => {
                    return (payment.status === 'PENDING' || payment.status === 'FAILED') ?
                        propertySum + payment.amount : propertySum;
                }, 0);
            }, 0);
        }, 0);
        setDebt(totalDebt);
    }, [payments]);

    const handleDownloadPDF = (type, propertyId) => {
        setLoading(true);
        const element = document.getElementById(`invoice-${type}-${propertyId}`);
        html2canvas(element, { scale: 2 }).then((canvas) => {
            const pdf = new jsPDF('p', 'mm', 'a4');
            const w = pdf.internal.pageSize.getWidth();
            const h = (canvas.height * w) / canvas.width;
            pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, w, h);
            pdf.save(`${t(`payments.types.${type}`)}-${propertyId}-${new Date().toLocaleDateString()}.pdf`);
            setLoading(false);
        }).catch(() => {
            setNotification({ type: 'danger', message: t('payments.notifications.pdfError') });
            setLoading(false);
        });
    };

    const handlePayment = async (paymentType, paymentId) => {
        setLoading(true);
        try {
            const payment = Object.values(payments[paymentType] || {})
                .flatMap(pp => pp.payments || [])
                .find(p => p.paymentId === paymentId);

            if (!payment) throw new Error(t('payments.notifications.loadError'));

            // find propertyId from the grouped data
            const propEntry = Object.values(payments[paymentType] || {})
                .find(pp => pp.payments.some(p => p.paymentId === paymentId));

            setCurrentPayment({
                type: paymentType,
                id: paymentId,
                amount: payment.amount,
                description: t('payments.description', { type: t(`payments.types.${paymentType}`) }),
                propertyId: propEntry?.propertyInfo?.originalPropertyId || payment.propertyId
            });
            setShowPaymentModal(true);
        } catch (error) {
            setNotification({ type: "danger", message: error.message || t('payments.notifications.paymentError') });
        } finally {
            setLoading(false);
        }
    };

    const processPayment = async () => {
        if (!stripe || !elements) {
            setNotification({ type: 'danger', message: t('stripe.notReady') });
            return;
        }

        setLoading(true);
        try {
            const { data } = await axiosInstance.post('/api/stripe/setup-intent');
            const clientSecret = data.clientSecret;

            const cardElement = elements.getElement(CardElement);
            const { setupIntent, error } = await stripe.confirmCardSetup(clientSecret, {
                payment_method: { card: cardElement }
            });

            if (error) {
                setNotification({ type: 'danger', message: t('payments.cardVerificationFailed') });
            } else {
                // ✅ mark existing invoice as PAID
                await axiosInstance.patch(`/api/payments/${currentPayment.id}/status`, {
                    status: 'PAID'
                });

                setPaymentSuccess(true);
                setNotification({ type: 'success', message: t('payments.paymentSuccess') });

                // notify admin
                await axiosInstance.post('/api/notifications', {
                    userId: 4,
                    message: t('payments.adminNotification', {
                        userId: user.userId,
                        type: currentPayment.type === 'arnona' ? t('payments.types.arnona') : t('payments.types.water'),
                        amount: currentPayment.amount
                    }),
                    type: 'PAYMENT'
                });

                // refresh payments list (optional)
                const refreshed = await getUserPayments(user?.userId);
                setPayments(prev => ({
                    ...prev,
                    [currentPayment.type]: organizePaymentsByProperty(
                        refreshed.filter(p => p.paymentType.toLowerCase() === currentPayment.type),
                        properties
                    )
                }));
            }
        } catch (e) {
            setNotification({ type: 'danger', message: t('payments.paymentError') });
        } finally {
            setLoading(false);
        }
    };
    const resetPaymentModal = () => {
        setShowPaymentModal(false);
        setPaymentSuccess(false);
        setCardData({ number: '', name: '', expiry: '', cvc: '' });
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
                            {propertyInfo.address}
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

                        {/* الفواتير غير المدفوعة */}
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
                                                    <small className="text-muted">
                                                        {t('payments.invoiceNumber')}: {payment.paymentId}
                                                    </small>
                                                </div>
                                                <span className="fw-bold">{payment.amount} {t('payments.currency')}</span>
                                                <Badge bg={statusVariants[payment.status] || 'secondary'}>
                                                    {statusLabels[payment.status] || t('payments.status.UNKNOWN')}
                                                </Badge>
                                            </div>

                                            {/* قراءة المياه */}
                                            {paymentType === 'water' && (
                                                <div className="mt-2 text-primary fw-bold">
                                                    💧 {t('payment.readingApproximation', {
                                                    amount: (payment.amount / 30).toFixed(2),
                                                    unitPrice: 30,
                                                    unitsCount: Math.ceil(payment.amount / 30)
                                                })}
                                                </div>
                                            )}

                                            {/* حساب الأرنونا */}
                                            {paymentType === 'arnona' && (
                                                <div className="mt-2 text-primary fw-bold">
                                                    {t('payment.arnona.calculation', {
                                                        area: propertyInfo.area,
                                                        price: 50,
                                                        total: propertyInfo.area * 50
                                                    })}
                                                </div>
                                            )}

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

                        {/* الفواتير المدفوعة */}
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
                                            <small className="text-muted">
                                                {t('payments.invoiceNumber')}: {payment.paymentId}
                                            </small>
                                        </div>
                                        <span className="fw-bold">{payment.amount} {t('payments.currency')}</span>
                                        <Badge bg="success">
                                            {statusLabels.PAID}
                                        </Badge>
                                    </div>

                                    {/* قراءة المياه */}
                                    {paymentType === 'water' && (
                                        <div className="mt-2 text-primary fw-bold">
                                            💧 {t('payment.readingApproximation', {
                                            amount: (payment.amount / 30).toFixed(2),
                                            unitPrice: 30,
                                            unitsCount: Math.ceil(payment.amount / 30)
                                        })}
                                        </div>
                                    )}

                                    {/* حساب الأرنونا */}
                                    {paymentType === 'arnona' && (
                                        <div className="mt-2 text-primary fw-bold">
                                            {t('payment.arnona.calculation', {
                                                area: propertyInfo.area,
                                                units: propertyInfo.units,
                                                price: 50,
                                                total: propertyInfo.area * propertyInfo.units * 50
                                            })}
                                        </div>
                                    )}

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

            <Modal show={showPaymentModal} onHide={resetPaymentModal} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>{t('payment.title')}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {paymentSuccess ? (
                        <div className="text-center py-4">
                            <FiCheckCircle className="text-success mb-3" size={48} />
                            <h4>{t('payments.successTitle')}</h4>
                            <p className="text-muted">
                                {t('payments.successMessage')} {currentPayment?.amount} {t('payments.currency')}
                            </p>
                            <Button variant="success" onClick={resetPaymentModal}>
                                {t('common.close')}
                            </Button>
                        </div>
                    ) : (
                        <>
                            <div className="mb-4">
                                <h5 className="mb-3">
                                    {t('payments.types.' + currentPayment?.type)}
                                </h5>
                                <div className="d-flex justify-content-between">
                                    <span>{t('payment.invoice.amount')}:</span>
                                    <strong>{currentPayment?.amount} {t('payments.currency')}</strong>
                                </div>
                            </div>

                            <Form>
                                <Form.Group className="mb-3">
                                    <Form.Label>{t('payment.cardDetails')}</Form.Label>
                                    <div className="stripe-card-element">
                                        <CardElement options={{ hidePostalCode: true }} />
                                    </div>
                                </Form.Group>

                                <div className="d-flex justify-content-between mt-4">
                                    <Button variant="secondary" onClick={resetPaymentModal}>
                                        {t('common.cancel')}
                                    </Button>
                                    <Button
                                        variant="primary"
                                        onClick={processPayment}
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <>
                                                <Spinner animation="border" size="sm" className="me-2" />
                                                {t('payments.processing')}
                                            </>
                                        ) : (
                                            t('payment.payNow')
                                        )}
                                    </Button>
                                </div>
                            </Form>
                        </>
                    )}
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