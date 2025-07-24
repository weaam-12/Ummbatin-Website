// Payments.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../AuthContext';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

import {
    Card, Tabs, Tab, Button, Alert, Spinner, Container, ListGroup, Badge, Row, Col
} from 'react-bootstrap';
import {
    FiCreditCard, FiCheckCircle, FiClock, FiDollarSign, FiDownload
} from 'react-icons/fi';
import './Payment.css';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PK);
import { getUserPayments as fetchUserPaymentsAPI, processPayment as processPaymentAPI } from '../api';

// ---------- مكوّن الدفع ----------
const CheckoutForm = ({ amount, onSuccess }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!stripe || !elements) return;
        setLoading(true);
        try {
            const { clientSecret } = await processPaymentAPI({
                amount: Math.round(amount * 100),
                currency: 'ils',
                paymentType: 'WATER'
            });
            const { paymentIntent, error } = await stripe.confirmCardPayment(clientSecret, {
                payment_method: { card: elements.getElement(CardElement) }
            });
            if (error) throw error;
            if (paymentIntent.status === 'succeeded') onSuccess(paymentIntent);
        } catch (err) {
            alert('فشل الدفع: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <CardElement options={{ hidePostalCode: true }} />
            <Button type="submit" disabled={!stripe || loading} variant="primary" className="mt-3 w-100">
                {loading ? <Spinner size="sm" animation="border" /> : 'دفع الآن'}
            </Button>
        </form>
    );
};

// ---------- المكوّن الرئيسي ----------
const Payments = () => {
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
    const printRef = useRef();

    useEffect(() => {
        const totalDebt = Object.values(payments).reduce(
            (sum, p) => (p?.status === 'PENDING' ? sum + p.amount : sum), 0
        );
        setDebt(totalDebt);
    }, [payments]);

    useEffect(() => {
        const load = async () => {
            try {
                const data = await fetchUserPaymentsAPI(user?.userId);
                setPayments(data || {});
            } catch {
                setNotification({ type: 'danger', message: 'فشل تحميل البيانات' });
            } finally {
                setLoading(false);
            }
        };
        if (user) load();
    }, [user]);

    const onPaymentSuccess = (paymentIntent) => {
        const key = activeTab;
        setPayments(prev => ({
            ...prev,
            [key]: {
                ...prev[key],
                status: 'PAID',
                history: [
                    { date: new Date().toISOString(), amount: prev[key]?.amount || 0 },
                    ...(prev[key]?.history || [])
                ]
            }
        }));
        setNotification({ type: 'success', message: `تم دفع ${key} بنجاح` });
    };

    const handleDownloadPDF = () => {
        html2canvas(printRef.current, { scale: 2 }).then(canvas => {
            const img = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const w = pdf.internal.pageSize.getWidth();
            const h = (canvas.height * w) / canvas.width;
            pdf.addImage(img, 'PNG', 0, 0, w, h);
            pdf.save(`invoice-${activeTab}-${Date.now()}.pdf`);
        });
    };

    const statusVariants = { PENDING: 'warning', PAID: 'success', OVERDUE: 'danger' };
    const statusLabels   = { PENDING: 'قيد الانتظار', PAID: 'تم الدفع', OVERDUE: 'متأخر' };
    const formatDate = d => d ? new Date(d).toLocaleDateString('ar-SA') : '--';

    const renderTab = (key, title) => {
        const item = payments[key];
        if (!item) return null;
        return (
            <Tab eventKey={key} title={title}>
                <div ref={printRef} className="payment-details mt-3 p-3">
                    <Row className="align-items-center mb-3">
                        <Col><h5><FiCreditCard className="me-2" />{title}</h5></Col>
                        <Col xs="auto">
                            <Badge pill bg={statusVariants[item.status] || 'secondary'}>
                                {statusLabels[item.status] || 'غير معروف'}
                            </Badge>
                        </Col>
                    </Row>

                    <p>المبلغ: <strong>{item.amount} شيقل</strong></p>
                    <p>تاريخ الاستحقاق: <strong>{formatDate(item.dueDate)}</strong></p>

                    {item.status === 'PAID' ? (
                        <>
                            <Alert variant="success"><FiCheckCircle /> تم الدفع بنجاح</Alert>
                            <Button variant="outline-success" onClick={handleDownloadPDF}>
                                <FiDownload /> تنزيل PDF
                            </Button>
                        </>
                    ) : (
                        <Elements stripe={stripePromise}>
                            <CheckoutForm amount={item.amount} onSuccess={onPaymentSuccess} />
                        </Elements>
                    )}

                    <div className="mt-4">
                        <h6><FiClock className="me-2" />سجل الدفعات السابقة</h6>
                        <ListGroup>
                            {(item.history || []).map((p, i) => (
                                <ListGroup.Item key={i}>
                                    <div className="d-flex justify-content-between">
                                        <span>{formatDate(p.date)}</span>
                                        <span>{p.amount} شيقل</span>
                                        <Badge bg="success">تم الدفع</Badge>
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
                    <h4 className="mb-0"><FiDollarSign className="me-2" />الدفعات الشهرية</h4>
                </Card.Header>

                <Card.Body>
                    <div className="d-flex justify-content-between mb-3">
                        <span>الدين التراكمي: <strong className="text-danger">{debt} شيقل</strong></span>
                    </div>

                    {loading ? (
                        <div className="text-center py-5">
                            <Spinner animation="border" role="status" />
                            <p className="mt-2">جاري التحميل...</p>
                        </div>
                    ) : (
                        <Tabs activeKey={activeTab} onSelect={k => setActiveTab(k)} className="mb-4">
                            {renderTab('water', 'فاتورة المياه')}
                            {renderTab('arnona', 'الأرنونا')}
                            {renderTab('kindergarten', 'الحضانة')}
                        </Tabs>
                    )}
                </Card.Body>
            </Card>
        </Container>
    );
};

export default Payments;