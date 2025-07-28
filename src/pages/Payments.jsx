import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useTranslation } from 'react-i18next'; // Add this import
import {
    Card, Tabs, Tab, Button, Alert, Spinner, Container, ListGroup, Badge, Row, Col
} from 'react-bootstrap';
import {
    FiCreditCard, FiCheckCircle, FiClock, FiDollarSign, FiDownload
} from 'react-icons/fi';
import './Payment.css';

import { getUserPayments, processPayment } from '../api';

const Payments = () => {
    const { t } = useTranslation(); // Add this line
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('water');
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState(null);
    const [payments, setPayments] = useState({
        water: { status: 'PENDING', amount: 0, dueDate: null, history: [] },
        arnona: { status: 'PENDING', amount: 0, dueDate: null, history: [] },
        kindergarten: { status: 'PENDING', amount: 0, dueDate: null, history: [] }
    });
    const [debt, setDebt] = useState(0);

    const statusVariants = { PENDING: 'warning', PAID: 'success', OVERDUE: 'danger' };
    const statusLabels = {
        PENDING: t('payments.status.PENDING'),
        PAID: t('payments.status.PAID'),
        OVERDUE: t('payments.status.OVERDUE')
    };

    const formatDate = (d) => d ? new Date(d).toLocaleDateString() : '--';

    // تحميل البيانات
    useEffect(() => {
        const load = async () => {
            try {
                const data = await getUserPayments(user?.userId);
                console.log('🧾 Raw API response:', data);
                console.log('🔑 Keys received:', Object.keys(data));
                Object.values(data).forEach((v, i) =>
                    console.log(`📦 Item ${i} :`, v)
                );
                const map = data.reduce((acc, item) => {
                    const key = item.paymentType.toLowerCase();
                    acc[key] = acc[key] || { status: 'PENDING', amount: 0, dueDate: null, history: [] };
                    acc[key].amount += item.amount;
                    acc[key].status = item.status;
                    acc[key].dueDate = item.date; // يمكنك تعديله لاحقًا
                    acc[key].history.unshift({ date: item.date, amount: item.amount });
                    return acc;
                }, {});
                setPayments(map);
            } catch {
                setNotification({ type: 'danger', message: 'فشل تحميل البيانات' });
            } finally {
                setLoading(false);
            }
        };
        if (user) load();
    }, [user]);

    // حساب الدين التراكمي
    useEffect(() => {
        const totalDebt = Object.values(payments).reduce(
            (sum, p) => (p?.status === 'PENDING' ? sum + p.amount : sum), 0
        );
        setDebt(totalDebt);
    }, [payments]);

    // توليد PDF
    const handleDownloadPDF = (type) => {
        const element = document.getElementById(`invoice-${type}`);
        html2canvas(element, { scale: 2 }).then((canvas) => {
            const img = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const w = pdf.internal.pageSize.getWidth();
            const h = (canvas.height * w) / canvas.width;
            pdf.addImage(img, 'PNG', 0, 0, w, h);
            pdf.save(`invoice-${type}-${Date.now()}.pdf`);
        });
    };

    // الدفع الحقيقي عبر الباك-إند
    const handlePayment = async (paymentType) => {
        setLoading(true);
        try {
            const amount = Math.round(payments[paymentType].amount * 100);
            const { clientSecret } = await processPayment({
                userId: user.userId,
                amount,
                currency: 'ils',
                paymentType,
                description: `${t('payments.invoice.payNow')} ${t(`payments.types.${paymentType}`)}`
            });

            window.open(`https://checkout.stripe.com/pay/${clientSecret}`, '_blank');

            setPayments(prev => ({
                ...prev,
                [paymentType]: {
                    ...prev[paymentType],
                    status: 'PAID',
                    history: [
                        { date: new Date().toISOString(), amount: prev[paymentType].amount },
                        ...prev[paymentType].history
                    ]
                }
            }));
            setNotification({
                type: 'success',
                message: `${t('payments.notifications.paymentSuccess')} ${t(`payments.types.${paymentType}`)}`
            });
        } catch (e) {
            setNotification({
                type: 'danger',
                message: t('payments.notifications.paymentError')
            });
        } finally {
            setLoading(false);
        }
    };

    const renderTab = (key, titleKey) => {
        const item = payments[key];
        if (!item) return null;
        return (
            <Tab eventKey={key} title={t(`payments.types.${key}`)}>
                <div id={`invoice-${key}`} className="payment-details mt-3 p-3">
                    <Row className="align-items-center mb-3">
                        <Col><h5><FiCreditCard className="me-2" />{t(`payments.types.${key}`)}</h5></Col>
                        <Col xs="auto">
                            <Badge pill bg={statusVariants[item.status] || 'secondary'}>
                                {statusLabels[item.status] || t('payments.status.UNKNOWN')}
                            </Badge>
                        </Col>
                    </Row>

                    <p>{t('payments.invoice.amount')}: <strong>{item.amount} {t('payments.currency')}</strong></p>
                    <p>{t('payments.invoice.dueDate')}: <strong>{formatDate(item.dueDate)}</strong></p>

                    {item.status === 'PAID' ? (
                        <>
                            <Alert variant="success"><FiCheckCircle /> {t('payments.invoice.paidSuccess')}</Alert>
                            <Button variant="outline-success" onClick={() => handleDownloadPDF(key)}>
                                <FiDownload /> {t('payments.invoice.downloadPdf')}
                            </Button>
                        </>
                    ) : (
                        <Button
                            variant="primary"
                            disabled={loading}
                            onClick={() => handlePayment(key)}
                        >
                            {loading ? (
                                <>
                                    <Spinner animation="border" size="sm" className="me-2" />
                                    {t('payments.processing')}
                                </>
                            ) : (
                                t('payments.invoice.payNow')
                            )}
                        </Button>
                    )}

                    <div className="mt-4">
                        <h6><FiClock className="me-2" />{t('payments.invoice.paymentHistory')}</h6>
                        <ListGroup>
                            {(item.history || []).map((p, i) => (
                                <ListGroup.Item key={i}>
                                    <div className="d-flex justify-content-between">
                                        <span>{formatDate(p.date)}</span>
                                        <span>{p.amount} {t('payments.currency')}</span>
                                        <Badge bg="success">{t('payments.status.PAID')}</Badge>
                                    </div>
                                </ListGroup.Item>
                            ))}
                        </ListGroup>
                    </div>
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

            <Card className="shadow-sm">
                <Card.Header className="bg-primary text-white">
                    <h4 className="mb-0"><FiDollarSign className="me-2" />{t('payments.title')}</h4>
                </Card.Header>

                <Card.Body>
                    <div className="d-flex justify-content-between mb-3">
                        <span>{t('payments.totalDebt')}: <strong className="text-danger">{debt} {t('payments.currency')}</strong></span>
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
                            {renderTab('kindergarten')}
                        </Tabs>
                    )}
                </Card.Body>
            </Card>
        </Container>
    );
};

export default Payments;