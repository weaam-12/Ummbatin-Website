import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Modal, Alert, Spinner, Badge } from 'react-bootstrap';
import { FiUsers, FiDollarSign, FiPlus } from 'react-icons/fi';
import './AdminGeneral.css';
import { axiosInstance } from '../api.js';

const AdminGeneral = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [users, setUsers] = useState([]);
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState(null);
    const [showBillsModal, setShowBillsModal] = useState(false);
    const [currentBillType, setCurrentBillType] = useState('');
    const [events, setEvents] = useState([]);
    const [showEventModal, setShowEventModal] = useState(false);
    const [newEvent, setNewEvent] = useState({
        title: '',
        description: '',
        location: '',
        image: null,
        date: ''
    });

    // دالة لجلب الفعاليات
    const fetchEvents = async () => {
        try {
            const response = await axiosInstance.get('api/events');
            setEvents(response.data);
        } catch (error) {
            console.error('Error fetching events:', error);
        }
    };

// دالة لإضافة فعالية جديدة
    const handleAddEvent = async () => {
        try {
            setLoading(true);
            const formData = new FormData();
            formData.append('title', newEvent.title);
            formData.append('description', newEvent.description);
            formData.append('location', newEvent.location);
            formData.append('date', newEvent.date);
            if (newEvent.image) {
                formData.append('image', newEvent.image);
            }

            await axiosInstance.post('api/events', formData);
            await fetchEvents();
            setShowEventModal(false);
            setNotification({ type: 'success', message: 'تمت إضافة الفعالية بنجاح' });
        } catch (error) {
            setNotification({ type: 'danger', message: 'فشل في إضافة الفعالية' });
        } finally {
            setLoading(false);
        }
    };

    // Fetch users with their properties
    const fetchUsersWithProperties = async () => {
        try {
            const response = await axiosInstance.get('api/users/all');
            console.log('Raw API response:', response.data); // تسجيل البيانات الخام
            const filteredUsers = response.data
                .filter(u => u.properties && u.properties.length > 0)
                .map(u => ({ ...u, property: u.properties[0] }));
            console.log('Filtered users:', filteredUsers); // تسجيل البيانات المصفاة
            return filteredUsers;
        } catch (error) {
            console.error('Error fetching users:', error);
            throw error;
        }
    };

    // Fetch payments with property details
    const fetchPayments = async () => {
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
            console.error('Error fetching payments:', error);
            throw error;
        }
    };

    // Load initial data
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const [usersRes, paymentsRes] = await Promise.all([
                    fetchUsersWithProperties(),

                fetchPayments().catch(() => []) // Continue if payments fail
                ]);
                setUsers(usersRes);
                console.log('Users with property:', usersRes);
                setPayments(paymentsRes);
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

            let endpoint, params;
            if (currentBillType === 'ARNONA') {
                endpoint = 'api/payments/generate-arnona';
                params = { month, year };
            } else {
                endpoint = 'api/payments/generate-water';
                params = { month, year, rate: 10 };
            }

            await axiosInstance.post(endpoint, null, { params });

            // ✅ تحديث الجدول فورًا
            const updatedPayments = await fetchPayments();
            setPayments(updatedPayments);

            setNotification({
                type: 'success',
                message: `تم توليد فواتير ${
                    currentBillType === 'ARNONA' ? 'الأرنونا' : 'المياه'
                } بنجاح`
            });

            setShowBillsModal(false);
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
                            <FiUsers className="me-2"/> نظرة عااامة
                        </li>
                        <li className={activeTab === 'payments' ? 'active' : ''}
                            onClick={() => setActiveTab('payments')}>
                            <FiDollarSign className="me-2"/> إدارة الدفعات
                        </li>
                        <li className={activeTab === 'events' ? 'active' : ''}
                            onClick={() => setActiveTab('events')}>
                            <FiCalendar className="me-2"/> إدارة الفعاليات
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
                                                    <h6>دفعات المياه المكتملة</h6>
                                                    <h3>
                                                        {payments?.filter(p => p.paymentType === 'WATER').length || 0}

                                                    </h3>
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
                                                    <h6>دفعات الأرنونا المكتملة</h6>
                                                    <h3>
                                                        {payments?.filter(p => p.paymentType === 'ARNONA').length || 0}

                                                    </h3>
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
                                            <th>عنوان العقار</th>
                                            <th>عدد الوحدات</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {payments.map((payment, index) => (
                                            <tr key={payment.paymentId}>
                                                <td>{index + 1}</td>
                                                <td>{payment.userName || '--'}</td>
                                                <td>{payment.paymentType === 'WATER' ? 'مياه' : 'أرنونا'}</td>
                                                <td>{payment.amount || '--'}</td>
                                                <td>
                                                    <Badge bg={formatPaymentStatus(payment.status).variant}>
                                                        {formatPaymentStatus(payment.status).text}
                                                    </Badge>
                                                </td>
                                                <td>{payment.propertyAddress || '--'}</td>
                                                <td>{payment.propertyUnits || '--'}</td>
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
            {activeTab === 'events' && (
                <div className="events-section">
                    <h3 className="mb-4">إدارة الفعاليات</h3>
                    <Button variant="primary" onClick={() => setShowEventModal(true)}>
                        <FiPlus className="me-2" /> إضافة فعالية جديدة
                    </Button>

                    <Row className="mt-4">
                        {events.map(event => (
                            <Col md={4} key={event.id} className="mb-4">
                                <Card>
                                    {event.imageUrl && (
                                        <Card.Img variant="top" src={event.imageUrl} />
                                    )}
                                    <Card.Body>
                                        <Card.Title>{event.title}</Card.Title>
                                        <Card.Text>{event.description}</Card.Text>
                                        <div className="d-flex justify-content-between">
                                            <small className="text-muted">{event.location}</small>
                                            <small className="text-muted">
                                                {new Date(event.date).toLocaleDateString()}
                                            </small>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </div>
            )}

            // مودال إضافة فعالية
            <Modal show={showEventModal} onHide={() => setShowEventModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>إضافة فعالية جديدة</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>عنوان الفعالية</Form.Label>
                            <Form.Control
                                type="text"
                                value={newEvent.title}
                                onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>الوصف</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={newEvent.description}
                                onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>المكان</Form.Label>
                            <Form.Control
                                type="text"
                                value={newEvent.location}
                                onChange={(e) => setNewEvent({...newEvent, location: e.target.value})}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>التاريخ</Form.Label>
                            <Form.Control
                                type="date"
                                value={newEvent.date}
                                onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>صورة الفعالية</Form.Label>
                            <Form.Control
                                type="file"
                                onChange={(e) => setNewEvent({...newEvent, image: e.target.files[0]})}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowEventModal(false)}>
                        إلغاء
                    </Button>
                    <Button variant="primary" onClick={handleAddEvent}>
                        {loading ? 'جاري الحفظ...' : 'حفظ الفعالية'}
                    </Button>
                </Modal.Footer>
            </Modal>
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
                        {users.filter(u => u.properties && u.properties.length > 0).length === 0 ? (
                            <tr>
                                <td colSpan={5} className="text-center text-danger">
                                    لا يوجد مستخدمين لديهم عقارات حالياً
                                </td>
                            </tr>
                        ) : (
                            users.filter(u => u.property).map((u, idx) => (
                                <tr key={u.userId}>
                                    <td>{idx + 1}</td>
                                    <td>{u.fullName}</td>
                                    <td>{u.property.address}</td>
                                    <td>{u.property.numberOfUnits}</td>
                                    <td>{u.property.area} م²</td>
                                </tr>
                            ))
                        )}
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