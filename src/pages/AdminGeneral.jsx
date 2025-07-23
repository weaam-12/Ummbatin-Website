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
    const [showBillsModal, setShowBillsModal] = useState(false);
    const [currentBillType, setCurrentBillType] = useState('');

    // Fetch all users with their properties
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
                    year: currentDate.getYear() + 1900
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
            } catch (error) {
                setNotification({ type: 'danger', message: 'فشل في تحميل البيانات' });
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    // Handle generate bills
    const handleGenerateBills = async () => {
        try {
            setLoading(true);
            const currentDate = new Date();
            const month = currentDate.getMonth() + 1;
            const year = currentDate.getFullYear();

            let response;
            if (currentBillType === 'WATER') {
                response = await axiosInstance.post('api/payments/generate-custom-water',
                    users.map(user => ({
                        userId: user.userId,
                        propertyId: user.properties?.[0]?.propertyId,
                        amount: 100 // يمكن تغيير هذا الرقم حسب احتياجك
                    }))
                );
            } else {
                // للأرنونا نستخدم generate-arnona بدون الحاجة لبيانات إضافية
                response = await axiosInstance.post('api/payments/generate-arnona', null, {
                    params: { month, year }
                });
            }

            setNotification({
                type: 'success',
                message: `تم إنشاء فواتير ${currentBillType === 'WATER' ? 'المياه' : 'الأرنونا'} بنجاح`
            });

            setShowBillsModal(false);
            // Refresh data
            const paymentsRes = await getCurrentMonthPayments();
            setPayments(paymentsRes || []);
        } catch (error) {
            console.error('Error generating bills:', error);
            setNotification({
                type: 'danger',
                message: error.response?.data?.message || 'فشل في إنشاء الفواتير'
            });
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

    // Open bills modal
    const openBillsModal = (type) => {
        setCurrentBillType(type);
        setShowBillsModal(true);
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
                                                onClick={() => openBillsModal('WATER')}
                                            >
                                                <FiPlus className="me-2" /> توليد فواتير المياه
                                            </Button>
                                            <Button
                                                variant="info"
                                                className="w-100"
                                                onClick={() => openBillsModal('ARNONA')}
                                            >
                                                <FiPlus className="me-2" /> توليد فواتير الأرنونا
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
                                            <th>العقار</th>
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
                                                <td>
                                                    {payment.property?.address || '--'}
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

            {/* Bills Modal */}
            <Modal
                show={showBillsModal}
                onHide={() => setShowBillsModal(false)}
                size="lg"
                fullscreen="md-down"
            >
                <Modal.Header closeButton>
                    <Modal.Title>
                        {currentBillType === 'WATER' ? 'توليد فواتير المياه' : 'توليد فواتير الأرنونا'}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p className="text-center">
                        {currentBillType === 'WATER'
                            ? 'سيتم إنشاء فواتير المياه لجميع المستخدمين'
                            : 'سيتم إنشاء فواتير الأرنونا لجميع المستخدمين بناءً على مساحة العقار وعدد الوحدات السكنية'}
                    </p>
                    <Table striped bordered hover responsive>
                        <thead>
                        <tr>
                            <th>#</th>
                            <th>اسم المستخدم</th>
                            <th>العقار</th>
                            <th>عدد الوحدات</th>
                        </tr>
                        </thead>
                        <tbody>
                        {users.map((user, index) => (
                            <tr key={user.userId}>
                                <td>{index + 1}</td>
                                <td>{user.fullName}</td>
                                <td>{user.properties?.[0]?.address || '--'}</td>
                                <td>{user.properties?.[0]?.numberOfUnits || '--'}</td>
                            </tr>
                        ))}
                        </tbody>
                    </Table>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowBillsModal(false)}>
                        إلغاء
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleGenerateBills}
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                                <span className="ms-2">جاري التوليد...</span>
                            </>
                        ) : (
                            'توليد الفواتير'
                        )}
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default AdminGeneral;