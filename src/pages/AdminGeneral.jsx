import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Form, Modal, Alert, Spinner, Badge } from 'react-bootstrap';
import { FiUsers, FiDollarSign, FiCalendar, FiPlus, FiAlertTriangle, FiActivity } from 'react-icons/fi';
import './AdminGeneral.css';
import { axiosInstance } from '../api.js';

const AdminGeneral = () => {
    // States
    const [activeTab, setActiveTab] = useState('dashboard');
    const [users, setUsers] = useState([]);
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState(null);

    // States for water and arnona bills
    const [waterBills, setWaterBills] = useState([]);
    const [arnonaBills, setArnonaBills] = useState([]);
    const [showSubmitModal, setShowSubmitModal] = useState(false);
    const [currentBillType, setCurrentBillType] = useState('');

    // Fetch all users
    const getAllUsers = async () => {
        try {
            const response = await axiosInstance.get('api/users/all');
            return response.data;
        } catch (error) {
            throw error;
        }
    };

    // Fetch current month payments
    const getCurrentMonthPayments = async () => {
        try {
            const currentDate = new Date();
            const response = await axiosInstance.get('api/payments/current-month', {
                params: {
                    month: currentDate.getMonth() + 1,
                    year: currentDate.getFullYear()
                }
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    };

    // Load initial data
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const [usersRes, paymentsRes] = await Promise.all([
                    getAllUsers(),
                    getCurrentMonthPayments().catch(() => [])
                ]);
                setUsers(usersRes || []);
                setPayments(paymentsRes || []);

                // Initialize water and arnona bills
                const initialWaterBills = usersRes.map(user => ({
                    userId: user.userId,
                    fullName: user.fullName,
                    amount: ''
                }));

                const initialArnonaBills = usersRes.map(user => ({
                    userId: user.userId,
                    fullName: user.fullName,
                    amount: ''
                }));

                setWaterBills(initialWaterBills);
                setArnonaBills(initialArnonaBills);
            } catch (error) {
                setNotification({ type: 'danger', message: 'فشل في تحميل البيانات' });
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    // Handle amount change for water bills
    const handleWaterAmountChange = (userId, amount) => {
        setWaterBills(prevBills =>
            prevBills.map(bill =>
                bill.userId === userId ? { ...bill, amount } : bill
            )
        );
    };

    // Handle amount change for arnona bills
    const handleArnonaAmountChange = (userId, amount) => {
        setArnonaBills(prevBills =>
            prevBills.map(bill =>
                bill.userId === userId ? { ...bill, amount } : bill
            )
        );
    };

    // Submit bills
    const handleSubmitBills = async () => {
        const billsToSubmit = currentBillType === 'WATER' ? waterBills : arnonaBills;
        const apiEndpoint = currentBillType === 'WATER' ? 'api/payments/create-water' : 'api/payments/create-arnona';

        try {
            setLoading(true);

            // Filter out bills with empty amounts
            const validBills = billsToSubmit.filter(bill => bill.amount && bill.amount > 0);

            if (validBills.length === 0) {
                setNotification({ type: 'danger', message: 'الرجاء إدخال مبالغ للفواتير' });
                return;
            }

            // Submit each bill
            for (const bill of validBills) {
                await axiosInstance.post(apiEndpoint, null, {
                    params: {
                        userId: bill.userId,
                        amount: bill.amount
                    }
                });
            }

            setNotification({ type: 'success', message: `تم إنشاء فواتير ${currentBillType === 'WATER' ? 'المياه' : 'الأرنونا'} بنجاح` });
            setShowSubmitModal(false);
            loadData();
        } catch (error) {
            setNotification({
                type: 'danger',
                message: error.response?.data?.message || 'فشل في إنشاء الفواتير'
            });
        } finally {
            setLoading(false);
        }
    };

    // Reload data
    const loadData = async () => {
        setLoading(true);
        try {
            const [usersRes, paymentsRes] = await Promise.all([
                getAllUsers(),
                getCurrentMonthPayments()
            ]);
            setUsers(usersRes);
            setPayments(paymentsRes);
        } catch (error) {
            setNotification({ type: 'danger', message: 'فشل في تحديث البيانات' });
        } finally {
            setLoading(false);
        }
    };

    // Format payment status
    const formatPaymentStatus = (status) => {
        switch (status) {
            case 'PAID': return { text: 'مدفوع', variant: 'success' };
            case 'PENDING': return { text: 'قيد الانتظار', variant: 'warning' };
            case 'FAILED': return { text: 'فشل', variant: 'danger' };
            default: return { text: status, variant: 'secondary' };
        }
    };

    return (
        <Container fluid className="admin-dashboard">
            {notification && (
                <Alert variant={notification.type} onClose={() => setNotification(null)} dismissible>
                    {notification.message}
                </Alert>
            )}

            <Row>
                {/* Sidebar */}
                <Col md={3} className="sidebar">
                    <div className="sidebar-header">
                        <h4>لوحة تحكم الإدمن</h4>
                    </div>
                    <ul className="sidebar-menu">
                        <li className={activeTab === 'dashboard' ? 'active' : ''} onClick={() => setActiveTab('dashboard')}>
                            <FiUsers className="me-2" /> نظرة عامة
                        </li>
                        <li className={activeTab === 'payments' ? 'active' : ''} onClick={() => setActiveTab('payments')}>
                            <FiDollarSign className="me-2" /> إدارة الدفعات
                        </li>
                    </ul>
                </Col>

                {/* Main Content */}
                <Col md={9} className="main-content">
                    {loading && (
                        <div className="text-center py-5">
                            <Spinner animation="border" variant="primary" />
                        </div>
                    )}

                    {!loading && activeTab === 'dashboard' && (
                        <div className="dashboard-overview">
                            <h3 className="mb-4">نظرة عامة</h3>

                            <Row className="mb-4">
                                <Col md={4}>
                                    <Card className="stat-card">
                                        <Card.Body>
                                            <div className="d-flex justify-content-between align-items-center">
                                                <div>
                                                    <h6>عدد المستخدمين</h6>
                                                    <h3>{users.length}</h3>
                                                </div>
                                                <FiUsers size={30} className="text-primary" />
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </Col>

                                <Col md={4}>
                                    <Card className="stat-card">
                                        <Card.Body>
                                            <div className="d-flex justify-content-between align-items-center">
                                                <div>
                                                    <h6>دفعات المياه</h6>
                                                    <h3>{payments.filter(p => p.type === 'WATER').length}</h3>
                                                </div>
                                                <FiDollarSign size={30} className="text-success" />
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </Col>

                                <Col md={4}>
                                    <Card className="stat-card">
                                        <Card.Body>
                                            <div className="d-flex justify-content-between align-items-center">
                                                <div>
                                                    <h6>دفعات الأرنونا</h6>
                                                    <h3>{payments.filter(p => p.type === 'ARNONA').length}</h3>
                                                </div>
                                                <FiDollarSign size={30} className="text-warning" />
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            </Row>

                            <Row>
                                <Col md={6}>
                                    <Card className="mb-4">
                                        <Card.Header>
                                            <h5>إجراءات سريعة</h5>
                                        </Card.Header>
                                        <Card.Body>
                                            <Button
                                                variant="success"
                                                className="w-100 mb-3"
                                                onClick={() => {
                                                    setCurrentBillType('WATER');
                                                    setShowSubmitModal(true);
                                                }}
                                            >
                                                <FiPlus className="me-2" /> فواتير المياه
                                            </Button>
                                            <Button
                                                variant="info"
                                                className="w-100"
                                                onClick={() => {
                                                    setCurrentBillType('ARNONA');
                                                    setShowSubmitModal(true);
                                                }}
                                            >
                                                <FiPlus className="me-2" /> فواتير الأرنونا
                                            </Button>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            </Row>
                        </div>
                    )}

                    {!loading && activeTab === 'payments' && (
                        <div className="payments-section">
                            <h3 className="mb-4">إدارة الدفعات الشهرية</h3>

                            <Card>
                                <Card.Header>
                                    <h5>دفعات الشهر الحالي</h5>
                                </Card.Header>
                                <Card.Body>
                                    <Table striped hover responsive>
                                        <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>اسم المواطن</th>
                                            <th>نوع الدفعة</th>
                                            <th>المبلغ (شيكل)</th>
                                            <th>حالة الدفع</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {payments.map((payment, index) => (
                                            <tr key={payment.paymentId}>
                                                <td>{index + 1}</td>
                                                <td>{payment.user?.fullName || '--'}</td>
                                                <td>{payment.type === 'WATER' ? 'مياه' : 'أرنونا'}</td>
                                                <td>{payment.amount || '--'}</td>
                                                <td>
                                                    <Badge bg={formatPaymentStatus(payment.status).variant}>
                                                        {formatPaymentStatus(payment.status).text}
                                                    </Badge>
                                                </td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </Table>
                                </Card.Body>
                            </Card>
                        </div>
                    )}
                </Col>
            </Row>

            {/* Bills Submission Modal */}
            <Modal
                show={showSubmitModal}
                onHide={() => setShowSubmitModal(false)}
                size="lg"
                fullscreen="md-down"
            >
                <Modal.Header closeButton>
                    <Modal.Title>
                        {currentBillType === 'WATER' ? 'فواتير المياه' : 'فواتير الأرنونا'}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                    <Table striped bordered hover responsive>
                        <thead>
                        <tr>
                            <th>#</th>
                            <th>اسم المستخدم</th>
                            <th>المبلغ (شيكل)</th>
                        </tr>
                        </thead>
                        <tbody>
                        {(currentBillType === 'WATER' ? waterBills : arnonaBills).map((bill, index) => (
                            <tr key={bill.userId}>
                                <td>{index + 1}</td>
                                <td>{bill.fullName}</td>
                                <td>
                                    <Form.Control
                                        type="number"
                                        value={bill.amount}
                                        onChange={(e) =>
                                            currentBillType === 'WATER'
                                                ? handleWaterAmountChange(bill.userId, e.target.value)
                                                : handleArnonaAmountChange(bill.userId, e.target.value)
                                        }
                                        min="0"
                                        step="0.1"
                                        placeholder="أدخل المبلغ"
                                    />
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </Table>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowSubmitModal(false)}>
                        إلغاء
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleSubmitBills}
                        disabled={loading}
                    >
                        {loading ? <Spinner size="sm" /> : 'إنشاء الفواتير'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default AdminGeneral;