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
    const [showWaterModal, setShowWaterModal] = useState(false);
    const [showArnonaModal, setShowArnonaModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [waterAmount, setWaterAmount] = useState('');
    const [arnonaAmount, setArnonaAmount] = useState('');

    // دالة لجلب جميع المستخدمين
    const getAllUsers = async () => {
        try {
            const response = await axiosInstance.get('api/users/all');
            return response.data;
        } catch (error) {
            throw error;
        }
    };

    // دالة لجلب دفعات الشهر الحالي
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

    // تحميل البيانات الأولية
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
            } catch (error) {
                setNotification({ type: 'danger', message: 'فشل في تحميل البيانات' });
            } finally {
                setLoading(false);
                console.log("Loading state after operation:", loading);
            }
        };

        loadData();
    }, []);

    const handleCreateWaterPayment = async () => {
        if (!selectedUser || !waterAmount) {
            setNotification({ type: 'danger', message: 'الرجاء اختيار مستخدم وإدخال المبلغ' });
            return;
        }

        try {
            setLoading(true);
            const response = await axiosInstance.post('api/payments/create-water', null, {
                params: {
                    userId: selectedUser.userId,
                    amount: waterAmount
                }
            });
            console.log('API Response:', response.data); // تسجيل الاستجابة
            setNotification({ type: 'success', message: 'تم إنشاء فاتورة المياه بنجاح' });
            setShowWaterModal(false);
            setWaterAmount('');
            await loadData(); // انتظار اكتمال تحميل البيانات
        } catch (error) {
            console.error('API Error:', error); // تسجيل الخطأ
            setNotification({
                type: 'danger',
                message: error.response?.data?.message || 'فشل في إنشاء الفاتورة'
            });
        } finally {
            setLoading(false);
            console.log("Loading state after operation:", loading);
        }
    };
    // إنشاء فاتورة أرنونا
    const handleCreateArnonaPayment = async () => {
        if (!selectedUser || !arnonaAmount) {
            setNotification({ type: 'danger', message: 'الرجاء اختيار مستخدم وإدخال المبلغ' });
            return;
        }

        try {
            setLoading(true);
            await axiosInstance.post('api/payments/create-arnona', null, {
                params: {
                    userId: selectedUser.userId,
                    amount: arnonaAmount
                }
            });
            setNotification({ type: 'success', message: 'تم إنشاء فاتورة الأرنونا بنجاح' });
            setShowArnonaModal(false);
            setArnonaAmount('');
            loadData();
        } catch (error) {
            setNotification({
                type: 'danger',
                message: error.response?.data?.message || 'فشل في إنشاء الفاتورة'
            });
        } finally {
            setLoading(false);
            console.log("Loading state after operation:", loading);
        }
    };

    // إعادة تحميل البيانات

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
            console.log("Loading state after operation:", loading);
        }
    };


    // تنسيق حالة الدفع
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
                                            <Button variant="success" className="w-100 mb-3" onClick={() => setShowWaterModal(true)}>
                                                <FiPlus className="me-2" /> فاتورة مياه
                                            </Button>
                                            <Button variant="info" className="w-100" onClick={() => setShowArnonaModal(true)}>
                                                <FiPlus className="me-2" /> فاتورة أرنونا
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

            {/* Water Payment Modal */}
            <Modal show={showWaterModal} onHide={() => setShowWaterModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>فاتورة مياه جديدة</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group className="mb-3">
                        <Form.Label>اختر المستخدم</Form.Label>
                        <Form.Select
                            value={selectedUser?.userId || ''}
                            onChange={(e) => {
                                const userId = e.target.value;
                                const user = users.find(u => u.userId == userId);
                                setSelectedUser(user);
                            }}
                        >
                            <option value="">اختر مستخدم</option>
                            {users.map(user => (
                                <option key={user.userId} value={user.userId}>
                                    {user.fullName}
                                </option>
                            ))}
                        </Form.Select>
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>مبلغ فاتورة المياه (شيكل)</Form.Label>
                        <Form.Control
                            type="number"
                            value={waterAmount}
                            onChange={(e) => setWaterAmount(e.target.value)}
                            min="0"
                            step="0.1"
                        />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowWaterModal(false)}>
                        إلغاء
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleCreateWaterPayment}
                        disabled={!selectedUser || !waterAmount || loading }
                    >
                        {loading ? <Spinner size="sm" /> : 'إنشاء الفاتورة'}
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Arnona Payment Modal */}
            <Modal show={showArnonaModal} onHide={() => setShowArnonaModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>فاتورة أرنونا جديدة</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group className="mb-3">
                        <Form.Label>اختر المستخدم</Form.Label>
                        <Form.Select
                            value={selectedUser?.userId || ''}
                            onChange={(e) => {
                                const userId = e.target.value;
                                const user = users.find(u => u.userId == userId);
                                setSelectedUser(user);
                            }}
                        >
                            <option value="">اختر مستخدم</option>
                            {users.map(user => (
                                <option key={user.userId} value={user.userId}>
                                    {user.fullName}
                                </option>
                            ))}
                        </Form.Select>
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>مبلغ فاتورة الأرنونا (شيكل)</Form.Label>
                        <Form.Control
                            type="number"
                            value={arnonaAmount}
                            onChange={(e) => setArnonaAmount(e.target.value)}
                            min="0"
                            step="0.1"
                        />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowArnonaModal(false)}>
                        إلغاء
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleCreateArnonaPayment}
                        disabled={!selectedUser || !arnonaAmount|| loading}
                    >
                        {loading ? <Spinner size="sm" /> : 'إنشاء الفاتورة'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default AdminGeneral;