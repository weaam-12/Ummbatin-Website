import React, { useState, useEffect } from 'react';
import {
    Container,
    Row,
    Col,
    Card,
    Button,
    Table,
    Form,
    Modal,
    Alert,
    Spinner,
    Badge
} from 'react-bootstrap';
import {
    FiUsers,
    FiDollarSign,
    FiCalendar,
    FiPlus,
    FiAlertTriangle,
    FiActivity
} from 'react-icons/fi';
import axios from 'axios';
import './AdminGeneral.css';
import { axiosInstance } from './api';


const AdminGeneral = () => {
    // States
    const [activeTab, setActiveTab] = useState('dashboard');
    const [users, setUsers] = useState([]);
    const [payments, setPayments] = useState([]);
    const [events, setEvents] = useState([]);
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState(null);
    const [usersWithPayments, setUsersWithPayments] = useState([]);
    const [showGenerateModal, setShowGenerateModal] = useState(false);
    const [waterRate, setWaterRate] = useState(0);
    const [showWaterModal, setShowWaterModal] = useState(false);
    const [showArnonaModal, setShowArnonaModal] = useState(false);
    const [newEvent, setNewEvent] = useState({
        title: '',
        date: '',
        description: '',
        image: null
    });

    // دالة لجلب خصائص المستخدم
    const getUserProperties = async (userId) => {
        try {
            const response = await axiosInstance.get(`/properties/user/${userId}`);
            return response.data;
        } catch (error) {
            console.error('Failed to fetch user properties:', error);
            return [];
        }
    };

    // دالة لجلب جميع المستخدمين
    const getAllUsers = async () => {
        try {
            const response = await axiosInstance.get('api/users/all');
            return response.data;
        } catch (error) {
            throw error;
        }
    };

    // دالة لجلب الفعاليات
    const getAllEvents = async () => {
        try {
            const response = await axiosInstance.get('/events');
            return response.data;
        } catch (error) {
            throw error;
        }
    };

    // دالة لجلب الأخبار
    const getAllNews = async () => {
        try {
            const response = await axiosInstance.get('/news');
            return response.data;
        } catch (error) {
            throw error;
        }
    };

    // دالة لجلب دفعات الشهر الحالي
    const getCurrentMonthPayments = async () => {
        try {
            const currentDate = new Date();
            const response = await axiosInstance.get('/payments/current-month', {
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

    // دالة لجلب المستخدمين مع دفعاتهم
    const getUsersWithPayments = async (month, year) => {
        try {
            const response = await axiosInstance.get('/payments/users-with-payments', {
                params: { month, year }
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    };

    // دالة لإضافة فعالية جديدة
    const addNewEvent = async (formData) => {
        try {
            const response = await axiosInstance.post('/events', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    };

    // دالة لتوليد دفعات الأرنونا
    const generateArnonaPayments = async (month, year, userIds) => {
        try {
            await axiosInstance.post('/payments/generate-arnona', null, {
                params: { month, year, userIds }
            });
        } catch (error) {
            throw error;
        }
    };

    // تحميل البيانات الأولية
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const [usersRes, eventsRes, newsRes] = await Promise.all([
                    getAllUsers(),
                    getAllEvents().catch(() => []),
                    getAllNews().catch(() => [])
                ]);
                setUsers(usersRes || []);
                setEvents(eventsRes || []);
                setNews(newsRes || []);
            } catch (error) {
                console.error("Profile error details:", error);

                setNotification({ type: 'danger', message: 'فشل في تحميل البيانات' });
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    // تحميل الدفعات عند تغيير التبويب
    useEffect(() => {
        if (activeTab === 'payments') {
            loadCurrentMonthPayments();
        }
    }, [activeTab]);

    const loadCurrentMonthPayments = async () => {
        setLoading(true);
        try {
            const currentDate = new Date();
            const payments = await getCurrentMonthPayments();
            const users = await getUsersWithPayments(
                currentDate.getMonth() + 1,
                currentDate.getFullYear()
            );

            const usersWithProperties = await Promise.all(
                users.map(async (user) => {
                    const properties = await getUserProperties(user.userId);
                    return {
                        ...user,
                        propertyId: properties[0]?.propertyId,
                        propertyAddress: properties[0]?.address
                    };
                })
            );

            setPayments(payments);
            setUsersWithPayments(usersWithProperties);
        } catch (error) {
            console.error("Profile error details:", error);
            setNotification({ type: 'danger', message: 'فشل في تحميل الدفعات' });
        } finally {
            setLoading(false);
        }
    };

    // معالجة توليد دفعات المياه
    const handleGenerateWaterPayments = async () => {
        if (!waterRate || isNaN(waterRate)) {
            setNotification({ type: 'danger', message: 'الرجاء إدخال سعر صحيح للمياه' });
            return;
        }

        try {
            setLoading(true);

            const paymentRequests = usersWithPayments.map((user) => ({
                userId: user.userId,
                propertyId: user.propertyId,
                amount: user.waterAmount || 0,
                currentReading: user.currentWaterReading || 0,
                manual: false
            }));

            await axiosInstance.post('/payments/generate-custom-water', paymentRequests);
            await loadCurrentMonthPayments();
            setNotification({ type: 'success', message: 'تم توليد دفعات المياه بنجاح' });
            setShowWaterModal(false);
            setWaterRate(0);
        } catch (error) {
            const errorMsg = error.response?.data?.message || error.message || 'فشل في توليد الدفعات';
            setNotification({ type: 'danger', message: errorMsg });
        } finally {
            setLoading(false);
        }
    };

    // معالجة توليد دفعات الأرنونا
    const handleGenerateArnonaPayments = async () => {
        try {
            setLoading(true);

            const userIds = usersWithPayments
                .filter((user) => user.arnonaAmount)
                .map((user) => user.userId)
                .join(',');

            await generateArnonaPayments(
                new Date().getMonth() + 1,
                new Date().getFullYear(),
                userIds || null
            );

            await loadCurrentMonthPayments();
            setNotification({ type: 'success', message: 'تم توليد دفعات الأرنونا بنجاح' });
            setShowArnonaModal(false);
        } catch (error) {
            const errorMsg = error.response?.data?.message || error.message || 'فشل في توليد الدفعات';
            setNotification({ type: 'danger', message: errorMsg });
        } finally {
            setLoading(false);
        }
    };

    // معالجة إضافة فعالية جديدة
    const handleAddEvent = async () => {
        if (!newEvent.title || !newEvent.date) {
            setNotification({ type: 'danger', message: 'الرجاء إدخال عنوان الفعالية وتاريخها' });
            return;
        }

        try {
            setLoading(true);
            const formData = new FormData();
            formData.append('title', newEvent.title);
            formData.append('date', newEvent.date);
            formData.append('description', newEvent.description);
            if (newEvent.image) formData.append('image', newEvent.image);

            const event = await addNewEvent(formData);
            setEvents([...events, event]);
            setNewEvent({ title: '', date: '', description: '', image: null });
            setNotification({ type: 'success', message: 'تمت إضافة الفعالية بنجاح' });
            setActiveTab('events');
        } catch (error) {
            const errorMsg = error.response?.data?.message || error.message || 'فشل في إضافة الفعالية';
            setNotification({ type: 'danger', message: errorMsg });
        } finally {
            setLoading(false);
        }
    };

    // معالجة تغيير المبالغ
    const handleAmountChange = (userId, type, value) => {
        setUsersWithPayments((prev) =>
            prev.map((user) => {
                if (user.userId === userId) {
                    if (type === 'CURRENT_WATER_READING') {
                        return {
                            ...user,
                            currentWaterReading: value ? parseFloat(value) : null,
                            waterAmount: value ? parseFloat(value) * waterRate : null
                        };
                    } else {
                        return {
                            ...user,
                            [`${type.toLowerCase()}Amount`]: value ? parseFloat(value) : null
                        };
                    }
                }
                return user;
            })
        );
    };

    // معالجة حفظ الدفعات
    const handleSavePayments = async () => {
        try {
            setLoading(true);
            const currentDate = new Date();

            const waterPaymentRequests = usersWithPayments
                .filter((user) => user.waterAmount)
                .map((user) => ({
                    userId: user.userId,
                    propertyId: user.propertyId,
                    amount: user.waterAmount,
                    currentReading: user.currentWaterReading,
                    manual: false
                }));

            const arnonaPaymentRequests = usersWithPayments
                .filter((user) => user.arnonaAmount)
                .map((user) => ({
                    userId: user.userId,
                    propertyId: user.propertyId,
                    amount: user.arnonaAmount
                }));

            if (waterPaymentRequests.length > 0) {
                await axiosInstance.post('/payments/generate-custom-water', waterPaymentRequests);
            }

            if (arnonaPaymentRequests.length > 0) {
                await axiosInstance.post(
                    '/payments/generate-arnona',
                    null,
                    {
                        params: {
                            month: currentDate.getMonth() + 1,
                            year: currentDate.getFullYear(),
                            userIds: arnonaPaymentRequests.map((req) => req.userId).join(',')
                        }
                    }
                );
            }

            setNotification({ type: 'success', message: 'تم حفظ الفواتير بنجاح' });
            setShowGenerateModal(false);
            loadCurrentMonthPayments();
        } catch (error) {
            setNotification({ type: 'danger', message: 'فشل في حفظ الفواتير: ' + error.message });
        } finally {
            setLoading(false);
        }
    };

    // تنسيق التاريخ
    const formatDate = (dateString) => {
        if (!dateString) return '--';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('ar-SA');
        } catch (e) {
            return '--';
        }
    };

    // تنسيق حالة الدفع
    const formatPaymentStatus = (status) => {
        switch (status) {
            case 'PAID':
                return { text: 'مدفوع', variant: 'success' };
            case 'PENDING':
                return { text: 'قيد الانتظار', variant: 'warning' };
            case 'FAILED':
                return { text: 'فشل', variant: 'danger' };
            default:
                return { text: status, variant: 'secondary' };
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
                        <li
                            className={activeTab === 'dashboard' ? 'active' : ''}
                            onClick={() => setActiveTab('dashboard')}
                        >
                            <FiUsers className="me-2" /> نظرة عامة
                        </li>
                        <li
                            className={activeTab === 'payments' ? 'active' : ''}
                            onClick={() => setActiveTab('payments')}
                        >
                            <FiDollarSign className="me-2" /> إدارة الدفعات
                        </li>
                        <li
                            className={activeTab === 'events' ? 'active' : ''}
                            onClick={() => setActiveTab('events')}
                        >
                            <FiCalendar className="me-2" /> الفعاليات
                        </li>
                        <li
                            className={activeTab === 'news' ? 'active' : ''}
                            onClick={() => setActiveTab('news')}
                        >
                            <FiAlertTriangle className="me-2" /> الأخبار والطوارئ
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
                                                    <h6>دفعات المياه هذا الشهر</h6>
                                                    <h3>
                                                        {payments.filter((p) => p.type === 'WATER').length}
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
                                                    <h6>دفعات الأرنونا هذا الشهر</h6>
                                                    <h3>
                                                        {payments.filter((p) => p.type === 'ARNONA').length}
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
                                        <Card.Header className="d-flex justify-content-between align-items-center">
                                            <h5>إجراءات سريعة</h5>
                                        </Card.Header>
                                        <Card.Body>
                                            <Button
                                                variant="primary"
                                                className="w-100 mb-3"
                                                onClick={() => setShowGenerateModal(true)}
                                            >
                                                <FiPlus className="me-2" />توليد وتعديل الفواتير
                                            </Button>

                                            <Button
                                                variant="success"
                                                className="w-100 mb-3"
                                                onClick={() => setShowWaterModal(true)}
                                            >
                                                <FiPlus className="me-2" /> توليد دفعات المياه
                                            </Button>

                                            <Button
                                                variant="info"
                                                className="w-100"
                                                onClick={() => setShowArnonaModal(true)}
                                            >
                                                <FiActivity className="me-2" /> توليد دفعات الأرنونا
                                            </Button>
                                        </Card.Body>
                                    </Card>
                                </Col>

                                <Col md={6}>
                                    <Card>
                                        <Card.Header>
                                            <h5>آخر الأخبار</h5>
                                        </Card.Header>
                                        <Card.Body>
                                            {news.length > 0 ? (
                                                news.slice(0, 3).map((item) => (
                                                    <div key={item.id} className="news-item mb-3">
                                                        <h6>{item.title}</h6>
                                                        <p className="text-muted small">{item.content.substring(0, 50)}...</p>
                                                        {item.isEmergency && <Badge bg="danger">طوارئ</Badge>}
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-muted text-center">لا توجد أخبار متاحة</p>
                                            )}
                                            <Button
                                                variant="link"
                                                onClick={() => setActiveTab('news')}
                                            >
                                                عرض الكل
                                            </Button>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            </Row>
                        </div>
                    )}

                    {!loading && activeTab === 'payments' && (
                        <div className="payments-section">
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <h3>إدارة الدفعات الشهرية</h3>
                                <div>
                                    <Button
                                        variant="primary"
                                        onClick={() => setShowGenerateModal(true)}
                                    >
                                        <FiPlus className="me-1" /> توليد/تعديل الفواتير
                                    </Button>
                                </div>
                            </div>

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
                                            <tr key={payment.id}>
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

                            {/* Modal لتوليد الفواتير */}
                            <Modal show={showGenerateModal} onHide={() => setShowGenerateModal(false)} size="lg">
                                <Modal.Header closeButton>
                                    <Modal.Title>توليد وتعديل الفواتير</Modal.Title>
                                </Modal.Header>
                                <Modal.Body>
                                    <Form>
                                        <Form.Group className="mb-3">
                                            <Form.Label>سعر المتر المكعب للمياه (شيكل)</Form.Label>
                                            <Form.Control
                                                type="number"
                                                value={waterRate}
                                                onChange={(e) => setWaterRate(parseFloat(e.target.value))}
                                                min="0"
                                                step="0.1"
                                            />
                                        </Form.Group>
                                        <Table striped bordered>
                                            <thead>
                                            <tr>
                                                <th>اسم المواطن</th>
                                                <th>رقم العقار</th>
                                                <th>قراءة المياه الحالية</th>
                                                <th>مبلغ المياه (شيكل)</th>
                                                <th>مبلغ الأرنونا (شيكل)</th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {usersWithPayments.map((user) => (
                                                <tr key={user.userId}>
                                                    <td>{user.userName}</td>
                                                    <td>{user.propertyId || '--'}</td>
                                                    <td>
                                                        <Form.Control
                                                            type="number"
                                                            value={user.currentWaterReading || ''}
                                                            onChange={(e) =>
                                                                handleAmountChange(
                                                                    user.userId,
                                                                    'CURRENT_WATER_READING',
                                                                    e.target.value
                                                                )
                                                            }
                                                        />
                                                    </td>
                                                    <td>
                                                        <Form.Control
                                                            type="number"
                                                            value={user.waterAmount || ''}
                                                            onChange={(e) =>
                                                                handleAmountChange(user.userId, 'WATER', e.target.value)
                                                            }
                                                        />
                                                    </td>
                                                    <td>
                                                        <Form.Control
                                                            type="number"
                                                            value={user.arnonaAmount || ''}
                                                            onChange={(e) =>
                                                                handleAmountChange(user.userId, 'ARNONA', e.target.value)
                                                            }
                                                        />
                                                    </td>
                                                </tr>
                                            ))}
                                            </tbody>
                                        </Table>
                                    </Form>
                                </Modal.Body>
                                <Modal.Footer>
                                    <Button variant="secondary" onClick={() => setShowGenerateModal(false)}>
                                        إلغاء
                                    </Button>
                                    <Button variant="primary" onClick={handleSavePayments}>
                                        حفظ التعديلات
                                    </Button>
                                </Modal.Footer>
                            </Modal>
                        </div>
                    )}

                    {!loading && activeTab === 'events' && (
                        <div className="events-section">
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <h3>إدارة الفعاليات</h3>
                                <Button
                                    variant="primary"
                                    onClick={() => setActiveTab('add-event')}
                                >
                                    <FiPlus className="me-1" /> إضافة فعالية
                                </Button>
                            </div>

                            {events.length > 0 ? (
                                <Row>
                                    {events.map((event) => (
                                        <Col md={4} key={event.id} className="mb-4">
                                            <Card className="h-100">
                                                {event.image && (
                                                    <Card.Img
                                                        variant="top"
                                                        src={`${process.env.REACT_APP_API_URL}/${event.image}`}
                                                    />
                                                )}
                                                <Card.Body>
                                                    <Card.Title>{event.title}</Card.Title>
                                                    <Card.Subtitle className="mb-2 text-muted">
                                                        {formatDate(event.date)}
                                                    </Card.Subtitle>
                                                    <Card.Text>{event.description.substring(0, 100)}...</Card.Text>
                                                </Card.Body>
                                                <Card.Footer>
                                                    <Button variant="outline-primary" size="sm">
                                                        التفاصيل
                                                    </Button>
                                                </Card.Footer>
                                            </Card>
                                        </Col>
                                    ))}
                                </Row>
                            ) : (
                                <Alert variant="info">لا توجد فعاليات متاحة</Alert>
                            )}
                        </div>
                    )}

                    {!loading && activeTab === 'add-event' && (
                        <div className="add-event-section">
                            <h3 className="mb-4">إضافة فعالية جديدة</h3>

                            <Card>
                                <Card.Body>
                                    <Form.Group className="mb-3">
                                        <Form.Label>عنوان الفعالية</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={newEvent.title}
                                            onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                                            required
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label>تاريخ الفعالية</Form.Label>
                                        <Form.Control
                                            type="date"
                                            value={newEvent.date}
                                            onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                                            required
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label>وصف الفعالية</Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            rows={3}
                                            value={newEvent.description}
                                            onChange={(e) =>
                                                setNewEvent({ ...newEvent, description: e.target.value })
                                            }
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label>صورة الفعالية</Form.Label>
                                        <Form.Control
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) =>
                                                setNewEvent({ ...newEvent, image: e.target.files[0] })
                                            }
                                        />
                                    </Form.Group>

                                    <div className="d-flex justify-content-end">
                                        <Button
                                            variant="secondary"
                                            className="me-2"
                                            onClick={() => setActiveTab('events')}
                                        >
                                            إلغاء
                                        </Button>
                                        <Button
                                            variant="primary"
                                            onClick={handleAddEvent}
                                            disabled={!newEvent.title || !newEvent.date}
                                        >
                                            {loading ? <Spinner animation="border" size="sm" /> : 'حفظ الفعالية'}
                                        </Button>
                                    </div>
                                </Card.Body>
                            </Card>
                        </div>
                    )}

                    {!loading && activeTab === 'news' && (
                        <div className="news-section">
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <h3>الأخبار والطوارئ</h3>
                                <Button variant="primary">
                                    <FiPlus className="me-1" /> إضافة خبر
                                </Button>
                            </div>

                            <Card>
                                <Card.Header>
                                    <div className="d-flex justify-content-between">
                                        <h5>آخر الأخبار</h5>
                                        <Form.Check
                                            type="switch"
                                            label="إظهار الطوارئ فقط"
                                        />
                                    </div>
                                </Card.Header>
                                <Card.Body>
                                    {news.length > 0 ? (
                                        <Table striped hover responsive>
                                            <thead>
                                            <tr>
                                                <th>#</th>
                                                <th>العنوان</th>
                                                <th>المحتوى</th>
                                                <th>النوع</th>
                                                <th>التاريخ</th>
                                                <th>إجراءات</th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {news.map((item) => (
                                                <tr key={item.id}>
                                                    <td>{item.id}</td>
                                                    <td>{item.title}</td>
                                                    <td>{item.content.substring(0, 50)}...</td>
                                                    <td>
                                                        {item.isEmergency ? (
                                                            <Badge bg="danger">طوارئ</Badge>
                                                        ) : (
                                                            <Badge bg="info">خبر</Badge>
                                                        )}
                                                    </td>
                                                    <td>{formatDate(item.createdAt)}</td>
                                                    <td>
                                                        <Button variant="outline-primary" size="sm">
                                                            تعديل
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))}
                                            </tbody>
                                        </Table>
                                    ) : (
                                        <Alert variant="info">لا توجد أخبار متاحة</Alert>
                                    )}
                                </Card.Body>
                            </Card>
                        </div>
                    )}
                </Col>
            </Row>

            {/* Water Payments Modal */}
            <Modal show={showWaterModal} onHide={() => setShowWaterModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>توليد دفعات المياه</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group className="mb-3">
                        <Form.Label>سعر المتر المكعب (شيكل)</Form.Label>
                        <Form.Control
                            type="number"
                            value={waterRate}
                            onChange={(e) => setWaterRate(parseFloat(e.target.value))}
                            min="0"
                            step="0.1"
                            required
                        />
                    </Form.Group>
                    <Alert variant="info">
                        سيتم توليد دفعات المياه لجميع المواطنين المسجلين
                    </Alert>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowWaterModal(false)}>
                        إلغاء
                    </Button>
                    <Button variant="primary" onClick={handleGenerateWaterPayments}>
                        {loading ? <Spinner animation="border" size="sm" /> : 'توليد الدفعات'}
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Arnona Payments Modal */}
            <Modal show={showArnonaModal} onHide={() => setShowArnonaModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>توليد دفعات الأرنونا</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Alert variant="info">
                        سيتم توليد دفعات الأرنونا لجميع المواطنين المسجلين
                    </Alert>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowArnonaModal(false)}>
                        إلغاء
                    </Button>
                    <Button variant="primary" onClick={handleGenerateArnonaPayments}>
                        {loading ? <Spinner animation="border" size="sm" /> : 'توليد الدفعات'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default AdminGeneral;