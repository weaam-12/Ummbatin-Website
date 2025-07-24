// Payments.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import axios from 'axios';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

import {
    Card, Tabs, Tab, Button, Alert, Spinner, Container, ListGroup, Badge, Row, Col
} from 'react-bootstrap';
import {
    FiCreditCard, FiCheckCircle, FiClock, FiDollarSign, FiDownload
} from 'react-icons/fi';
import './Payment.css';

// دالة استدعاء API من ملف api.js
import { getUserPayments, processPayment } from '../api';

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

    const statusVariants = { PENDING: 'warning', PAID: 'success', OVERDUE: 'danger' };
    const statusLabels = { PENDING: 'قيد الانتظار', PAID: 'تم الدفع', OVERDUE: 'متأخر' };

    const formatDate = (d) => d ? new Date(d).toLocaleDateString('ar-SA') : '--';

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
                setPayments(data || {});
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
            const amount = Math.round(payments[paymentType].amount * 100); // بالقروش
            const { clientSecret } = await processPayment({
                userId: user.userId,
                amount,
                currency: 'ils',
                paymentType,
                description: `دفع ${paymentType}`
            });

            // هنا يمكنك فتح نافذة Stripe Checkout أو Checkout Element
            // سنعرض رابط الدفع ببساطة:
            window.open(`https://checkout.stripe.com/pay/${clientSecret}`, '_blank');

            // تحديث الحالة بعد الدفع (يمكنك استخدام webhook لاحقاً)
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
            setNotification({ type: 'success', message: `تم دفع ${paymentType} بنجاح` });
        } catch (e) {
            setNotification({ type: 'danger', message: 'فشل الدفع، حاول لاحقاً' });
        } finally {
            setLoading(false);
        }
    };

    const renderTab = (key, title) => {
        const item = payments[key];
        if (!item) return null;
        return (
            <Tab eventKey={key} title={title}>
                <div id={`invoice-${key}`} className="payment-details mt-3 p-3">
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
                            <Button variant="outline-success" onClick={() => handleDownloadPDF(key)}>
                                <FiDownload /> تنزيل PDF
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
                                    جاري المعالجة...
                                </>
                            ) : (
                                'دفع الآن'
                            )}
                        </Button>
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