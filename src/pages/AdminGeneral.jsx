import React, { useState, useEffect } from 'react';
import {
    Container, Row, Col, Card, Button, Table, Modal,
    Alert, Spinner, Badge, Form
} from 'react-bootstrap';
import {
    FiUsers, FiDollarSign, FiPlus, FiCalendar,
    FiHome, FiFileText, FiDroplet, FiMapPin, FiActivity,FiImage,
    FiEye, FiTrash2, FiEdit,FiRefreshCw
} from 'react-icons/fi';
import './AdminGeneral.css';
import { axiosInstance } from '../api.js';

const AdminGeneral = () => {
    // States العامة
    const [activeTab, setActiveTab] = useState('dashboard');
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState(null);

    // States للمستخدمين والفواتير
    const [users, setUsers] = useState([]);
    const [payments, setPayments] = useState([]);
    const [showBillsModal, setShowBillsModal] = useState(false);
    const [currentBillType, setCurrentBillType] = useState('');
    const [pagination, setPagination] = useState({ page: 0, size: 10 });
    const [waterReadings, setWaterReadings] = useState({});
    // States للفعاليات
    const [events, setEvents] = useState([]);
    const [showEventModal, setShowEventModal] = useState(false);
    const [newEvent, setNewEvent] = useState({
        title: '',
        description: '',
        location: '',
        image: null,
        date: ''
    });

    const [showAddPropertyModal, setShowAddPropertyModal] = useState(false);
    const [newProperty, setNewProperty] = useState({
        userId: '',
        address: '',
        area: '',
        numberOfUnits: 1
    });

    const [showEditEventModal, setShowEditEventModal] = useState(false);
    const [currentEvent, setCurrentEvent] = useState(null);
    const [showImageModal, setShowImageModal] = useState(false);
    const [newImage, setNewImage] = useState(null);

    // دالة فتح نموذج التعديل
    const handleEditEvent = (event) => {
        setCurrentEvent(event);
        setNewEvent({
            title: event.title,
            description: event.description,
            location: event.location,
            image: null,
            date: event.startDate ? event.startDate.split('T')[0] : ''
        });
        setShowEditEventModal(true);
    };

    // دالة حذف الفعالية
    const handleDeleteEvent = async (eventId) => {
        try {
            setLoading(true);
            await axiosInstance.delete(`api/events/${eventId}`);
            await fetchEvents();
            setNotification({ type: 'success', message: 'تم حذف الفعالية بنجاح' });
        } catch (error) {
            console.log(error);
            setNotification({ type: 'danger', message: 'فشل في حذف الفعالية' });
        } finally {
            setLoading(false);
        }
    };

    // دالة تحديث الفعالية
    const handleUpdateEvent = async () => {
        try {
            setLoading(true);

            if (!currentEvent || !currentEvent.id) {
                console.error('Event ID is not defined');
                setNotification({ type: 'danger', message: 'حدث خطأ في استرجاع معلومات الفعالية' });
                return;
            }

            const eventObj = {
                title: newEvent.title,
                description: newEvent.description,
                location: newEvent.location,
                startDate: newEvent.date ? newEvent.date + 'T00:00:00' : null,
                endDate: newEvent.date ? newEvent.date + 'T00:00:00' : null,
                active: true
            };

            const formData = new FormData();
            formData.append(
                'event',
                new Blob([JSON.stringify(eventObj)], { type: 'application/json' })
            );
            if (newEvent.image) {
                formData.append('image', newEvent.image);
            }

            console.log('Current Event ID:', currentEvent.id);
            console.log('Event Data:', eventObj);
            console.log('Image:', newEvent.image);

            await axiosInstance.put(`api/events/${currentEvent.id}`, formData, {
                headers: { 'Content-Type': undefined }
            });

            await fetchEvents();
            setShowEditEventModal(false);
            setNotification({ type: 'success', message: 'تم تحديث الفعالية بنجاح' });
        } catch (error) {
            console.error('خطأ في تحديث الفعالية:', error);
            setNotification({ type: 'danger', message: error.response?.data?.message || 'فشل في تحديث الفعالية' });
        } finally {
            setLoading(false);
        }
    };


    const generateRandomWaterReadings = () => {
        const readings = {};
        users.forEach(user => {
            if (user.properties && user.properties.length > 0) {
                user.properties.forEach(property => {
                    // استخدام property.id أو property.propertyId أيهما متاح
                    const propId = property.id || property.propertyId;
                    if (propId && user.id) {
                        readings[propId] = {
                            userId: user.id,
                            reading: Math.floor(Math.random() * 21) + 10
                        };
                    }
                });
            }
        });
        console.log('Generated readings:', readings);
        return readings;
    };
    const handleOpenWaterBillsModal = () => {
        setCurrentBillType('WATER');
        setWaterReadings(generateRandomWaterReadings());
        setShowBillsModal(true);
    };

    // دالة تغيير الصورة
    const handleChangeImage = async () => {
        try {
            setLoading(true);

            const formData = new FormData();
            const eventObj = { // أضف تعريف eventObj هنا
                title: currentEvent.title,
                description: currentEvent.description,
                location: currentEvent.location,
                startDate: currentEvent.startDate,
                endDate: currentEvent.endDate,
                active: true
            };

            formData.append(
                'event',
                new Blob([JSON.stringify(eventObj)], { type: 'application/json' })
            );
            if (newImage) {
                formData.append('image', newImage);
            }

            await axiosInstance.put(`api/events/${currentEvent.id}`, formData, {
                headers: { 'Content-Type': undefined }
            });

            await fetchEvents();
            setShowImageModal(false);
            setNotification({ type: 'success', message: 'تم تغيير صورة الفعالية بنجاح' });
        } catch (error) {
            console.log(error);
            setNotification({ type: 'danger', message: 'فشل في تغيير الصورة' });
        } finally {
            setLoading(false);
        }
    };
    // دالة لجلب عقارات المستخدم

    // دالة إضافة قراءات المياه

    const handleAddProperty = async () => {
        try {
            setLoading(true);
            await axiosInstance.post('/api/properties', {
                address: newProperty.address,
                area: parseFloat(newProperty.area),
                numberOfUnits: parseInt(newProperty.numberOfUnits),
                userId: newProperty.userId
            });

            // تحديث قائمة المستخدمين
            const updatedUsers = await fetchUsersWithProperties();
            setUsers(updatedUsers);

            setShowAddPropertyModal(false);
            setNewProperty({
                userId: '',
                address: '',
                area: '',
                numberOfUnits: 1
            });
            setNotification({ type: 'success', message: 'تمت إضافة العقار بنجاح' });
        } catch (error) {
            setNotification({ type: 'danger', message: 'فشل في إضافة العقار: ' + (error.response?.data?.message || error.message) });
        } finally {
            setLoading(false);
        }
    };

    // ===================== دوال جلب البيانات =====================
    const fetchUsersWithProperties = async () => {
        try {
            const response = await axiosInstance.get("api/users/all", {
                params: {
                    page: pagination.page,
                    size: pagination.size
                }
            });
            const users = response.data.content || []; // تأكد من هيكل الاستجابة
            return users
                .filter(u => u.properties?.length > 0)
                .map(u => ({ ...u, property: u.properties[0] }));
        } catch (error) {
            console.error('Error fetching users:', error);
            throw error;
        }
    };

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

    const fetchEvents = async () => {
        try {
            const response = await axiosInstance.get('api/events');
            setEvents(response.data);
        } catch (error) {
            console.error('Error fetching events:', error);
        }
    };

    // تحميل البيانات الأولية
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                if (activeTab === 'payments') {
                    const paymentsRes = await fetchPayments();
                    setPayments(paymentsRes);
                } else if (activeTab === 'events') {
                    await fetchEvents();
                } else {
                    const [usersRes, paymentsRes] = await Promise.all([
                        fetchUsersWithProperties(),
                        fetchPayments().catch(() => [])
                    ]);
                    setUsers(usersRes);
                    setPayments(paymentsRes);
                    await fetchEvents();
                }
            } catch (error) {
                console.log(error);
                setNotification({ type: 'danger', message: 'فشل في تحميل البيانات' });
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [activeTab]);

    // ===================== إدارة الفعاليات =====================
    const handleAddEvent = async () => {
        try {
            setLoading(true);

            // 1. إنشاء كائن JSON بالأسماء الصحيحة
            const eventObj = {
                title: newEvent.title,
                description: newEvent.description,
                location: newEvent.location,
                startDate: newEvent.date ? newEvent.date + 'T00:00:00' : null,
                endDate: newEvent.date ? newEvent.date + 'T00:00:00' : null,
                active: true
            };

            // 2. إضافة الحقل بالاسم "event"
            const formData = new FormData();
            formData.append(
                'event',
                new Blob([JSON.stringify(eventObj)], { type: 'application/json' })
            );

            // 3. إضافة الصورة إن وُجدت
            if (newEvent.image) formData.append('image', newEvent.image);

            await axiosInstance.post('api/events', formData, {
                headers: { 'Content-Type': undefined }
            });

            await fetchEvents();
            setShowEventModal(false);
            setNewEvent({ title: '', description: '', location: '', image: null, date: '' });
            setNotification({ type: 'success', message: 'تمت إضافة الفعالية بنجاح' });
        } catch (error) {
            console.error(error);
            setNotification({ type: 'danger', message: error.response?.data?.message || 'فشل في إضافة الفعالية' });
        } finally {
            setLoading(false);
        }
    };

    // ===================== إدارة الفواتير =====================
    const handleGenerateBills = async () => {
        try {
            setLoading(true);
            const currentDate = new Date();
            const month = currentDate.getMonth() + 1;
            const year = currentDate.getFullYear();
            console.log('جميع المستخدمين:', users);
            console.log('المستخدمون مع العقارات:', users.filter(u => u.properties?.length > 0));
            // تحقق من وجود مستخدمين بعقارات
            const validUsers = users.filter(user =>
                user.properties?.length > 0 &&
                user.userId &&
                user.properties.every(p => p.propertyId)
            );

            if (validUsers.length === 0) {
                setNotification({
                    type: 'danger',
                    message: 'لا يوجد مستخدمين لديهم عقارات صالحة حالياً'
                });
                return;
            }

            if (currentBillType === 'WATER') {
                // إنشاء فواتير المياه لكل عقار
                const billsData = validUsers.flatMap(user =>
                    user.properties.map(property => ({
                        userId: user.userId,
                        propertyId: property.propertyId,
                        amount: (waterReadings[property.propertyId]?.reading || 15) * 30,
                        reading: waterReadings[property.propertyId]?.reading || 15
                    }))
                );

                console.log('بيانات الفواتير المرسلة:', billsData);

                // استخدام API الجديد بدلاً من الحلقة
                const response = await axiosInstance.post('api/payments/generate-custom-water', billsData);

                if (response.data.success) {
                    setNotification({
                        type: 'success',
                        message: `تم توليد ${billsData.length} فاتورة مياه بنجاح`
                    });
                } else {
                    throw new Error(response.data.message || 'فشل في توليد الفواتير');
                }
            } else {
                // توليد فواتير الأرنونا
                await axiosInstance.post('api/payments/generate-arnona', null, {
                    params: { month, year }
                });
            }

            const updatedPayments = await fetchPayments();
            setPayments(updatedPayments);
            setShowBillsModal(false);

        } catch (error) {
            console.error('Error generating bills:', error);
            setNotification({
                type: 'danger',
                message: error.response?.data?.message || error.message || 'فشل في توليد الفواتير'
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
        <div className="admin-dashboard">
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
                            <FiHome /> لوحة التحكم
                        </li>
                        <li className={activeTab === 'payments' ? 'active' : ''}
                            onClick={() => setActiveTab('payments')}>
                            <FiDollarSign /> إدارة الفواتير
                        </li>
                        <li className={activeTab === 'events' ? 'active' : ''}
                            onClick={() => setActiveTab('events')}>
                            <FiCalendar /> إدارة الفعاليات
                        </li>
                    </ul>
                </Col>

                <Col md={9} className="main-content">
                    {loading ? (
                        <div className="text-center py-5">
                            <Spinner animation="border" variant="primary" />
                            <p className="mt-3">جاري التحميل...</p>
                        </div>
                    ) : (
                        <>
                            {/* لوحة التحكم */}
                            {activeTab === 'dashboard' && (
                                <div className="dashboard-overview">
                                    <h3>نظرة عامة</h3>
                                    <Row className="mb-4">
                                        <Col md={4}>
                                            <Card className="stat-card">
                                                <Card.Body>
                                                    <div className="d-flex justify-content-between align-items-center">
                                                        <div>
                                                            <h6>عدد الفعاليات</h6>
                                                            <h3>{events.length}</h3>
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
                                                            <h6>فواتير المياه</h6>
                                                            <h3>
                                                                {payments.filter(p => p.paymentType === 'WATER').length}
                                                            </h3>
                                                        </div>
                                                        <FiDroplet size={30} className="text-success" />
                                                    </div>
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                        <Col md={4}>
                                            <Card className="stat-card">
                                                <Card.Body>
                                                    <div className="d-flex justify-content-between align-items-center">
                                                        <div>
                                                            <h6>فواتير الأرنونا</h6>
                                                            <h3>
                                                                {payments.filter(p => p.paymentType === 'ARNONA').length}
                                                            </h3>
                                                        </div>
                                                        <FiFileText size={30} className="text-warning" />
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
                                                <Card.Body className="quick-actions">
                                                    <Button variant="success" onClick={handleOpenWaterBillsModal}>
                                                        <FiPlus /> توليد فواتير المياه
                                                    </Button>
                                                    <Button variant="info" onClick={() => { setCurrentBillType('ARNONA'); setShowBillsModal(true); }}>
                                                        <FiPlus /> توليد فواتير الأرنونا
                                                    </Button>
                                                    <Button variant="primary" onClick={() => setShowEventModal(true)}>
                                                        <FiPlus /> إضافة فعالية جديدة
                                                    </Button>
                                                    <Button variant="warning" onClick={() => setShowAddPropertyModal(true)}>
                                                        <FiMapPin /> إضافة عقار جديد
                                                    </Button>
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                        <Col md={6}>
                                            <Card>
                                                <Card.Header>
                                                    <h5>آخر الفعاليات</h5>
                                                </Card.Header>
                                                <Card.Body>
                                                    {events.slice(0, 3).map(event => (
                                                        <div key={event.id} className="mb-3">
                                                            <h6>{event.title}</h6>
                                                            <small className="text-muted">
                                                                {new Date(event.date).toLocaleDateString()} - {event.location}
                                                            </small>
                                                        </div>
                                                    ))}
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                    </Row>
                                </div>
                            )}

                            {/* مودال إضافة عقار جديد */}
                            <Modal show={showAddPropertyModal} onHide={() => setShowAddPropertyModal(false)}>
                                <Modal.Header closeButton>
                                    <Modal.Title>إضافة عقار جديد</Modal.Title>
                                </Modal.Header>
                                <Modal.Body>
                                    <Form>
                                        <Form.Group className="mb-3">
                                            <Form.Label>رقم المستخدم (ID)</Form.Label>
                                            <Form.Control
                                                type="text"
                                                value={newProperty.userId}
                                                onChange={(e) => setNewProperty({...newProperty, userId: e.target.value})}
                                                placeholder="أدخل رقم المستخدم"
                                            />
                                        </Form.Group>
                                        <Form.Group className="mb-3">
                                            <Form.Label>عنوان العقار</Form.Label>
                                            <Form.Control
                                                type="text"
                                                value={newProperty.address}
                                                onChange={(e) => setNewProperty({...newProperty, address: e.target.value})}
                                                placeholder="أدخل عنوان العقار"
                                            />
                                        </Form.Group>
                                        <Row>
                                            <Col md={6}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>مساحة العقار (م²)</Form.Label>
                                                    <Form.Control
                                                        type="number"
                                                        value={newProperty.area}
                                                        onChange={(e) => setNewProperty({...newProperty, area: e.target.value})}
                                                        placeholder="أدخل المساحة"
                                                        min="0"
                                                        step="0.01"
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col md={6}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>عدد الوحدات</Form.Label>
                                                    <Form.Control
                                                        type="number"
                                                        value={newProperty.numberOfUnits}
                                                        onChange={(e) => setNewProperty({...newProperty, numberOfUnits: e.target.value})}
                                                        placeholder="أدخل عدد الوحدات"
                                                        min="1"
                                                    />
                                                </Form.Group>
                                            </Col>
                                        </Row>
                                    </Form>
                                </Modal.Body>
                                <Modal.Footer>
                                    <Button variant="secondary" onClick={() => setShowAddPropertyModal(false)}>
                                        إلغاء
                                    </Button>
                                    <Button variant="primary" onClick={handleAddProperty} disabled={loading}>
                                        {loading ? 'جاري الحفظ...' : 'حفظ العقار'}
                                    </Button>
                                </Modal.Footer>
                            </Modal>

                            {/* إدارة الفواتير */}
                            {activeTab === 'payments' && (
                                <div className="payments-section">
                                    <h3>إدارة الفواتير الشهرية</h3>
                                    <Table striped bordered hover responsive>
                                        <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>اسم المواطن</th>
                                            <th>نوع الفاتورة</th>
                                            <th>المبلغ (شيكل)</th>
                                            <th>حالة الدفع</th>
                                            <th>عنوان العقار</th>
                                            <th>عدد الوحدات</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {payments.length > 0 ? (
                                            payments.map((payment, index) => (
                                                <tr key={payment.paymentId || index}>
                                                    <td>{index + 1}</td>
                                                    <td>{payment.userName || payment.user?.fullName || '--'}</td>
                                                    <td>{payment.paymentType === 'WATER' ? 'مياه' : 'أرنونا'}</td>
                                                    <td>{payment.amount ? payment.amount.toFixed(2) : '--'}</td>
                                                    <td>
                                                        <Badge bg={formatPaymentStatus(payment.status).variant}>
                                                            {formatPaymentStatus(payment.status).text}
                                                        </Badge>
                                                    </td>
                                                    <td>{payment.propertyAddress || payment.property?.address || '--'}</td>
                                                    <td>{payment.propertyUnits || payment.property?.numberOfUnits || '--'}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="7" className="text-center">
                                                    لا توجد فواتير متاحة
                                                </td>
                                            </tr>
                                        )}
                                        </tbody>
                                    </Table>
                                </div>
                            )}

                            {/* إدارة الفعاليات */}
                            {activeTab === 'events' && (
                                <div className="events-section">
                                    <div className="d-flex justify-content-between align-items-center mb-4">
                                        <h3>إدارة الفعاليات</h3>
                                        <Button variant="primary" onClick={() => setShowEventModal(true)}>
                                            <FiPlus /> إضافة فعالية جديدة
                                        </Button>
                                    </div>
                                    <Row>
                                        {events.map(event => (
                                            <Col md={4} key={event.id} className="mb-4">
                                                <Card className="event-card">
                                                    {event.imageUrl && (
                                                        <div className="event-image-container">
                                                            <Card.Img
                                                                variant="top"
                                                                src={event.imageUrl}
                                                                onClick={() => {
                                                                    setCurrentEvent(event);
                                                                    setShowImageModal(true);
                                                                    console.log('Current Event ID:', currentEvent.id);

                                                                }}
                                                                style={{ cursor: 'pointer' }}
                                                            />
                                                            <div className="event-image-overlay">
                                                                <FiImage size={24} color="#fff" />
                                                            </div>
                                                        </div>
                                                    )}
                                                    <Card.Body>
                                                        <Card.Title>{event.title}</Card.Title>
                                                        <Card.Text>{event.description}</Card.Text>
                                                        <div className="d-flex justify-content-between">
                                                            <small className="text-muted">
                                                                <FiCalendar /> {new Date(event.startDate).toLocaleDateString()}
                                                            </small>
                                                            <small className="text-muted">
                                                                <FiHome /> {event.location}
                                                            </small>
                                                        </div>
                                                    </Card.Body>
                                                    <Card.Footer className="d-flex justify-content-between">
                                                        <Button
                                                            variant="warning"
                                                            size="sm"
                                                            onClick={() => handleEditEvent(event)}
                                                        >
                                                            <FiEdit /> تعديل
                                                        </Button>
                                                        <Button
                                                            variant="danger"
                                                            size="sm"
                                                            onClick={() => handleDeleteEvent(event.id)}
                                                        >
                                                            <FiTrash2 /> حذف
                                                        </Button>
                                                    </Card.Footer>
                                                </Card>
                                            </Col>
                                        ))}
                                    </Row>
                                </div>
                            )}
                        </>
                    )}
                </Col>
            </Row>

            <Modal show={showEditEventModal} onHide={() => setShowEditEventModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>تعديل الفعالية</Modal.Title>
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
                            <Form.Label>وصف الفعالية</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={newEvent.description}
                                onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                            />
                        </Form.Group>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>المكان</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={newEvent.location}
                                        onChange={(e) => setNewEvent({...newEvent, location: e.target.value})}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>التاريخ</Form.Label>
                                    <Form.Control
                                        type="date"
                                        value={newEvent.date}
                                        onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Form.Group className="mb-3">
                            <Form.Label>صورة جديدة (اختياري)</Form.Label>
                            <Form.Control
                                type="file"
                                onChange={(e) => setNewEvent({...newEvent, image: e.target.files[0]})}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowEditEventModal(false)}>
                        إلغاء
                    </Button>
                    <Button variant="primary" onClick={handleUpdateEvent} disabled={loading}>
                        {loading ? 'جاري الحفظ...' : 'حفظ التعديلات'}
                    </Button>
                </Modal.Footer>
            </Modal>

            // إضافة مودال تغيير الصورة
            <Modal show={showImageModal} onHide={() => setShowImageModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>تغيير صورة الفعالية</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {currentEvent?.imageUrl && (
                        <div className="text-center mb-3">
                            <img
                                src={currentEvent.imageUrl}
                                alt="صورة الفعالية الحالية"
                                style={{ maxWidth: '100%', maxHeight: '300px' }}
                            />
                        </div>
                    )}
                    <Form>
                        <Form.Group>
                            <Form.Label>اختر صورة جديدة</Form.Label>
                            <Form.Control
                                type="file"
                                onChange={(e) => setNewImage(e.target.files[0])}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowImageModal(false)}>
                        إلغاء
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleChangeImage}
                        disabled={loading || !newImage}
                    >
                        {loading ? 'جاري التحميل...' : 'تغيير الصورة'}
                    </Button>
                </Modal.Footer>
            </Modal>
            {/* مودال إضافة فعالية جديدة */}
            <Modal show={showEventModal} onHide={() => setShowEventModal(false)} size="lg">
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
                            <Form.Label>وصف الفعالية</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={newEvent.description}
                                onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                            />
                        </Form.Group>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>المكان</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={newEvent.location}
                                        onChange={(e) => setNewEvent({...newEvent, location: e.target.value})}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>التاريخ</Form.Label>
                                    <Form.Control
                                        type="date"
                                        value={newEvent.date}
                                        onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
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
                    <Button variant="primary" onClick={handleAddEvent} disabled={loading}>
                        {loading ? 'جاري الحفظ...' : 'حفظ الفعالية'}
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* مودال توليد الفواتير */}
            <Modal show={showBillsModal} onHide={() => setShowBillsModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>
                        {currentBillType === 'ARNONA' ? 'توليد فواتير الأرنونا' : 'توليد فواتير المياه'}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {currentBillType === 'WATER' && (
                        <Alert variant="info" className="mb-4">
                            <strong>آلية توليد فواتير المياه:</strong>
                            <ul className="mb-0">
                                <li>سعر المتر المكعب الواحد = 30 شيكل</li>
                                <li>المبلغ النهائي = القراءة × 30</li>
                            </ul>
                        </Alert>
                    )}

                    <Table striped bordered hover responsive>
                        <thead>
                        <tr>
                            <th>#</th>
                            <th>اسم المستخدم</th>
                            <th>عنوان العقار</th>
                            {currentBillType === 'WATER' && (
                                <>
                                    <th>قراءة المياه (م³)</th>
                                    <th>المبلغ (شيكل)</th>
                                </>
                            )}
                            {currentBillType === 'ARNONA' && (
                                <>
                                    <th>مساحة العقار (م²)</th>
                                    <th>عدد الوحدات</th>
                                </>
                            )}
                        </tr>
                        </thead>
                        <tbody>
                        {users.filter(user => user.properties && user.properties.length > 0).length === 0 ? (
                            <tr>
                                <td colSpan={currentBillType === 'WATER' ? 5 : 4} className="text-center text-danger">
                                    لا يوجد مستخدمين لديهم عقارات حالياً
                                </td>
                            </tr>
                        ) : (
                            users
                                .filter(user => user.properties && user.properties.length > 0)
                                .flatMap((user, userIndex) =>
                                    user.properties.map((property, propertyIndex) => (
                                        <tr key={`${user.userId}-${property.propertyId}`}>
                                            <td>{userIndex + propertyIndex + 1}</td>
                                            <td>{user.fullName}</td>
                                            <td>{property.address}</td>
                                            {currentBillType === 'WATER' && (
                                                <>
                                                    <td>
                                                        {waterReadings[property.propertyId]?.reading ||
                                                            Math.floor(Math.random() * 21) + 10}
                                                    </td>
                                                    <td>
                                                        {(waterReadings[property.propertyId]?.reading * 30) ||
                                                            (Math.floor(Math.random() * 21) + 10) * 30}
                                                    </td>
                                                </>
                                            )}
                                            {currentBillType === 'ARNONA' && (
                                                <>
                                                    <td>{property.area}</td>
                                                    <td>{property.numberOfUnits}</td>
                                                </>
                                            )}
                                        </tr>
                                    ))
                                )
                        )}
                        </tbody>
                    </Table>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowBillsModal(false)}>
                        إلغاء
                    </Button>

                    {currentBillType === 'WATER' && (
                        <Button
                            variant="outline-info"
                            onClick={() => setWaterReadings(generateRandomWaterReadings())}
                            disabled={loading}
                        >
                            <FiRefreshCw /> توليد قراءات جديدة
                        </Button>
                    )}

                    <Button
                        variant="primary"
                        onClick={handleGenerateBills}
                        disabled={loading || users.filter(u => u.properties?.length > 0).length === 0}
                    >
                        {loading ? (
                            <>
                                <Spinner as="span" animation="border" size="sm" />
                                <span className="ms-2">جاري التوليد...</span>
                            </>
                        ) : `توليد ${currentBillType === 'ARNONA' ? 'الأرنونا' : 'المياه'}`}
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default AdminGeneral;