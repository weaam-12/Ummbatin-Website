import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Modal, Alert, Spinner, Badge } from 'react-bootstrap';
import { FiUsers, FiDollarSign, FiPlus } from 'react-icons/fi';
import './AdminGeneral.css';
import { axiosInstance } from '../api.js';

const AdminGeneral = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [usersWithProperties, setUsersWithProperties] = useState([]);
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState(null);
    const [showBillsModal, setShowBillsModal] = useState(false);
    const [currentBillType, setCurrentBillType] = useState('');

    // Fetch users with their properties and payments
    const fetchData = async () => {
        setLoading(true);
        try {
            const currentDate = new Date();
            const [usersRes, paymentsRes] = await Promise.all([
                axiosInstance.get('api/users/all'),
                axiosInstance.get('api/payments/current-month', {
                    params: {
                        month: currentDate.getMonth() + 1,
                        year: currentDate.getFullYear()
                    }
                })
            ]);

            // Get users with their first property
            const usersWithProps = usersRes.data.map(user => ({
                ...user,
                property: user.properties?.[0] || null
            }));

            setUsersWithProperties(usersWithProps);
            setPayments(paymentsRes.data || []);
        } catch (error) {
            console.error('Error fetching data:', error);
            setNotification({ type: 'danger', message: 'فشل في تحميل البيانات' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleGenerateBills = async () => {
        try {
            setLoading(true);
            const currentDate = new Date();

            if (currentBillType === 'ARNONA') {
                await axiosInstance.post('api/payments/generate-arnona', null, {
                    params: {
                        month: currentDate.getMonth() + 1,
                        year: currentDate.getFullYear()
                    }
                });
            } else {
                await axiosInstance.post('api/payments/generate-water', null, {
                    params: {
                        month: currentDate.getMonth() + 1,
                        year: currentDate.getFullYear(),
                        rate: 10 // يمكن تغيير سعر المياه حسب الحاجة
                    }
                });
            }

            setNotification({
                type: 'success',
                message: `تم توليد فواتير ${currentBillType === 'ARNONA' ? 'الأرنونا' : 'المياه'} بنجاح`
            });

            setShowBillsModal(false);
            // Refresh data after generation
            await fetchData();
        } catch (error) {
            console.error('Error generating bills:', error);
            setNotification({
                type: 'danger',
                message: error.response?.data?.message || 'فشل في توليد الفواتير'
            });
        } finally {
            setLoading(false);
        }
    };

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
                <Col md={3} className="sidebar">
                    <div className="sidebar-header">
                        <h4>لوحة تحكم الإدمن</h4>
                    </div>
                    <ul className="sidebar-menu">
                        <li className={activeTab === 'dashboard' ? 'active' : ''}
                            onClick={() => setActiveTab('dashboard')}>
                            <FiUsers className="me-2" /> نظرة عامة
                        </li>
                        <li className={activeTab === 'payments' ? 'active' : ''}
                            onClick={() => setActiveTab('payments')}>
                            <FiDollarSign className="me-2" /> إدارة الدفعات
                        </li>
                    </ul>
                </Col>

                <Col md={9} className="main-content">
                    {loading ? (
                        <div className="text-center py-5">
                            <Spinner animation="border" variant="primary" />
                        </div>
                    ) : activeTab === 'dashboard' ? (
                        <div className="dashboard-overview">
                            <h3 className="mb-4">نظرة عامة</h3>

                            <Row className="mb-4">
                                <Col md={4}>
                                    <Card className="stat-card">
                                        <Card.Body>
                                            <div className="d-flex justify-content-between align-items-center">
                                                <div>
                                                    <h6>عدد المستخدمين</h6>
                                                    <h3>{usersWithProperties.length}</h3>
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
                                                    setShowBillsModal(true);
                                                }}
                                            >
                                                <FiPlus className="me-2" /> توليد فواتير المياه
                                            </Button>
                                            <Button
                                                variant="info"
                                                className="w-100"
                                                onClick={() => {
                                                    setCurrentBillType('ARNONA');
                                                    setShowBillsModal(true);
                                                }}
                                            >
                                                <FiPlus className="me-2" /> توليد فواتير الأرنونا
                                            </Button>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            </Row>
                        </div>
                    ) : (
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
                                            <th>عدد الوحدات</th>
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
                                                <td>{payment.property?.address || '--'}</td>
                                                <td>{payment.property?.numberOfUnits || '--'}</td>
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

            {/* Bills Generation Modal */}
            <Modal show={showBillsModal} onHide={() => setShowBillsModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>
                        {currentBillType === 'ARNONA' ? 'توليد فواتير الأرنونا' : 'توليد فواتير المياه'}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p className="text-center mb-4">
                        {currentBillType === 'ARNONA'
                            ? 'سيتم توليد فواتير الأرنونا لجميع المستخدمين بناءً على مساحة العقار وعدد الوحدات السكنية'
                            : 'سيتم توليد فواتير المياه لجميع المستخدمين'}
                    </p>

                    <Table striped bordered hover>
                        <thead>
                        <tr>
                            <th>#</th>
                            <th>اسم المستخدم</th>
                            <th>عنوان العقار</th>
                            <th>عدد الوحدات</th>
                            <th>مساحة العقار</th>
                        </tr>
                        </thead>
                        <tbody>
                        {usersWithProperties.map((user, index) => (
                            <tr key={user.userId}>
                                <td>{index + 1}</td>
                                <td>{user.fullName}</td>
                                <td>{user.property?.address || '--'}</td>
                                <td>{user.property?.numberOfUnits || '--'}</td>
                                <td>{user.property?.area ? `${user.property.area} م²` : '--'}</td>
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
                                <Spinner as="span" animation="border" size="sm" />
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