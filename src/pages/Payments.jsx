import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import {
    Card,
    Tabs,
    Tab,
    Button,
    Alert,
    Spinner,
    Container,
    ListGroup,
    Badge
} from 'react-bootstrap';
import {
    FiCreditCard,
    FiCheckCircle,
    FiClock,
    FiDollarSign
} from 'react-icons/fi';
import './Payment.css';

// دالة محاكاة لجلب بيانات الدفعات من API
const getUserPayments = async () => {
    // هذه مجرد محاكاة - في التطبيق الحقيقي ستكون استدعاء لAPI حقيقي
    return {
        water: {
            status: 'PENDING',
            amount: 150,
            dueDate: '2023-12-15',
            history: [
                { date: '2023-11-15', amount: 140 },
                { date: '2023-10-15', amount: 135 }
            ]
        },
        arnona: {
            status: 'PENDING',
            amount: 300,
            dueDate: '2023-12-20',
            history: [
                { date: '2023-11-20', amount: 300 },
                { date: '2023-10-20', amount: 300 }
            ]
        },
        kindergarten: {
            status: 'PAID',
            amount: 500,
            dueDate: '2023-12-05',
            history: [
                { date: '2023-11-05', amount: 500 },
                { date: '2023-10-05', amount: 500 }
            ]
        }
    };
};

const Payments = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('water');
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState(null);
    const [payments, setPayments] = useState({
        water: { status: 'PENDING', amount: 0, dueDate: null, history: [] },
        arnona: { status: 'PENDING', amount: 0, dueDate: null, history: [] },
        kindergarten: { status: 'PENDING', amount: 0, dueDate: null, history: [] }
    });

    useEffect(() => {
        const loadPayments = async () => {
            try {
                const data = await getUserPayments(user?.userId);
                setPayments(data);
            } catch (error) {
                console.error('Failed to load payments:', error);
                setNotification({
                    type: 'danger',
                    message: 'فشل في تحميل بيانات الدفعات'
                });
            }
        };

        if (user) {
            loadPayments();
        }
    }, [user]);

    const statusVariants = {
        PENDING: 'warning',
        PAID: 'success',
        OVERDUE: 'danger'
    };

    const statusLabels = {
        PENDING: 'قيد الانتظار',
        PAID: 'تم الدفع',
        OVERDUE: 'متأخر'
    };

    const formatDate = (dateString) => {
        if (!dateString) return '--';
        const date = new Date(dateString);
        return date.toLocaleDateString('ar-SA');
    };

    const handlePayment = async (paymentType) => {
        setLoading(true);
        try {
            // محاكاة عملية الدفع
            await new Promise(resolve => setTimeout(resolve, 1000));

            // تحديث حالة الدفع بعد الدفع الناجح
            setPayments(prev => ({
                ...prev,
                [paymentType]: {
                    ...prev[paymentType],
                    status: 'PAID',
                    history: [
                        {
                            date: new Date().toISOString(),
                            amount: prev[paymentType].amount
                        },
                        ...prev[paymentType].history
                    ]
                }
            }));

            setNotification({
                type: 'success',
                message: `تم دفع ${paymentType === 'water' ? 'فاتورة المياه' :
                    paymentType === 'arnona' ? 'الأرنونا' : 'الحضانة'} بنجاح`
            });
        } catch (error) {
            console.error('Payment error:', error);
            setNotification({
                type: 'danger',
                message: 'فشل في عملية الدفع، يرجى المحاولة لاحقاً'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="user-payments-container py-4">
            <Card className="shadow-sm">
                <Card.Header className="bg-primary text-white">
                    <h4 className="mb-0">
                        <FiDollarSign className="me-2" />
                        الدفعات الشهرية
                    </h4>
                </Card.Header>
                <Card.Body>
                    {notification && (
                        <Alert variant={notification.type} onClose={() => setNotification(null)} dismissible>
                            {notification.message}
                        </Alert>
                    )}

                    <Tabs
                        activeKey={activeTab}
                        onSelect={(k) => setActiveTab(k)}
                        className="mb-4"
                    >
                        <Tab eventKey="water" title="فاتورة المياه">
                            <div className="payment-details mt-3">
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <h5>
                                        <FiCreditCard className="me-2" />
                                        فاتورة المياه الشهرية
                                    </h5>
                                    <Badge pill bg={statusVariants[payments.water.status]}>
                                        {statusLabels[payments.water.status]}
                                    </Badge>
                                </div>
                                <p>المبلغ: <strong>{payments.water.amount} شيقل</strong></p>
                                <p>تاريخ الاستحقاق: <strong>{formatDate(payments.water.dueDate)}</strong></p>

                                <Button
                                    variant="primary"
                                    onClick={() => handlePayment('water')}
                                    disabled={loading || payments.water.status === 'PAID'}
                                    className="mt-3"
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

                                <div className="mt-4">
                                    <h6>
                                        <FiClock className="me-2" />
                                        سجل الدفعات السابقة
                                    </h6>
                                    <ListGroup>
                                        {payments.water.history.map((payment, index) => (
                                            <ListGroup.Item key={index}>
                                                <div className="d-flex justify-content-between">
                                                    <span>{formatDate(payment.date)}</span>
                                                    <span>{payment.amount} شيقل </span>
                                                    <Badge bg="success">تم الدفع</Badge>
                                                </div>
                                            </ListGroup.Item>
                                        ))}
                                    </ListGroup>
                                </div>
                            </div>
                        </Tab>
                        <Tab eventKey="arnona" title="الأرنونا">
                            <div className="payment-details mt-3">
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <h5>
                                        <FiCreditCard className="me-2" />
                                        ضريبة الأرنونا
                                    </h5>
                                    <Badge pill bg={statusVariants[payments.arnona.status]}>
                                        {statusLabels[payments.arnona.status]}
                                    </Badge>
                                </div>
                                <p>المبلغ: <strong>{payments.arnona.amount} شيقل</strong></p>
                                <p>تاريخ الاستحقاق: <strong>{formatDate(payments.arnona.dueDate)}</strong></p>

                                <Button
                                    variant="primary"
                                    onClick={() => handlePayment('arnona')}
                                    disabled={loading || payments.arnona.status === 'PAID'}
                                    className="mt-3"
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

                                <div className="mt-4">
                                    <h6>
                                        <FiClock className="me-2" />
                                        سجل الدفعات السابقة
                                    </h6>
                                    <ListGroup>
                                        {payments.arnona.history.map((payment, index) => (
                                            <ListGroup.Item key={index}>
                                                <div className="d-flex justify-content-between">
                                                    <span>{formatDate(payment.date)}</span>
                                                    <span>{payment.amount}شيقل</span>
                                                    <Badge bg="success">تم الدفع</Badge>
                                                </div>
                                            </ListGroup.Item>
                                        ))}
                                    </ListGroup>
                                </div>
                            </div>
                        </Tab>
                        <Tab eventKey="kindergarten" title="الحضانة">
                            <div className="payment-details mt-3">
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <h5>
                                        <FiCreditCard className="me-2" />
                                        رسوم الحضانة
                                    </h5>
                                    <Badge pill bg={statusVariants[payments.kindergarten.status]}>
                                        {statusLabels[payments.kindergarten.status]}
                                    </Badge>
                                </div>
                                <p>المبلغ: <strong>{payments.kindergarten.amount}  شيقل </strong></p>
                                <p>تاريخ الاستحقاق: <strong>{formatDate(payments.kindergarten.dueDate)}</strong></p>

                                <Button
                                    variant="primary"
                                    onClick={() => handlePayment('kindergarten')}
                                    disabled={loading || payments.kindergarten.status === 'PAID'}
                                    className="mt-3"
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

                                <div className="mt-4">
                                    <h6>
                                        <FiClock className="me-2" />
                                        سجل الدفعات السابقة
                                    </h6>
                                    <ListGroup>
                                        {payments.kindergarten.history.map((payment, index) => (
                                            <ListGroup.Item key={index}>
                                                <div className="d-flex justify-content-between">
                                                    <span>{formatDate(payment.date)}</span>
                                                    <span>{payment.amount} شيقل </span>
                                                    <Badge bg="success">تم الدفع</Badge>
                                                </div>
                                            </ListGroup.Item>
                                        ))}
                                    </ListGroup>
                                </div>
                            </div>
                        </Tab>
                    </Tabs>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default Payments;