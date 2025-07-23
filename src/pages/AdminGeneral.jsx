import React, { useState, useEffect } from 'react';
import {
    Container, Row, Col, Card, Button, Table, Modal,
    Alert, Spinner, Badge, Form, Tab, Tabs
} from 'react-bootstrap';
import {
    FiUsers, FiDollarSign, FiPlus, FiCalendar,
    FiDroplet, FiHome, FiFileText, FiSettings
} from 'react-icons/fi';
import './AdminGeneral.css';
import { axiosInstance } from '../api.js';

const AdminGeneral = () => {
    // States العامة
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState(null);
    const [activeTab, setActiveTab] = useState('dashboard');

    // States للمستخدمين والعقارات
    const [users, setUsers] = useState([]);
    const [properties, setProperties] = useState([]);
    const [showPropertyModal, setShowPropertyModal] = useState(false);
    const [newProperty, setNewProperty] = useState({
        address: '',
        area: '',
        numberOfUnits: '',
        userId: ''
    });

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

    // States لقراءات المياه
    const [waterReadings, setWaterReadings] = useState([]);
    const [showWaterReadingModal, setShowWaterReadingModal] = useState(false);
    const [newReading, setNewReading] = useState({
        propertyId: '',
        amount: '',
        date: new Date().toISOString().split('T')[0]
    });

    // States للفواتير
    const [payments, setPayments] = useState([]);
    const [showBillsModal, setShowBillsModal] = useState(false);
    const [currentBillType, setCurrentBillType] = useState('');

    // ===================== دوال جلب البيانات =====================
    const fetchAllData = async () => {
        setLoading(true);
        try {
            const [usersRes, propertiesRes, eventsRes, readingsRes, paymentsRes] = await Promise.all([
                axiosInstance.get('api/users/all').then(res => res.data),
                axiosInstance.get('api/properties/all').then(res => res.data),
                axiosInstance.get('api/events').then(res => res.data),
                axiosInstance.get('api/water-readings').then(res => res.data),
                axiosInstance.get('api/payments/current-month').then(res => res.data)
            ]);

            setUsers(usersRes);
            setProperties(propertiesRes);
            setEvents(eventsRes);
            setWaterReadings(readingsRes);
            setPayments(paymentsRes);
        } catch (error) {
            console.error('Error fetching data:', error);
            setNotification({ type: 'danger', message: 'فشل في تحميل البيانات' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllData();
    }, []);

    // ===================== إدارة العقارات =====================
    const handleAddProperty = async () => {
        try {
            setLoading(true);
            await axiosInstance.post('api/properties', newProperty);
            await fetchAllData();
            setShowPropertyModal(false);
            setNotification({ type: 'success', message: 'تمت إضافة العقار بنجاح' });
        } catch (error) {
            setNotification({ type: 'danger', message: 'فشل في إضافة العقار' });
        } finally {
            setLoading(false);
        }
    };

    // ===================== إدارة الفعاليات =====================
    const handleAddEvent = async () => {
        try {
            setLoading(true);
            const formData = new FormData();
            formData.append('title', newEvent.title);
            formData.append('description', newEvent.description);
            formData.append('location', newEvent.location);
            formData.append('date', newEvent.date);
            if (newEvent.image) formData.append('image', newEvent.image);

            await axiosInstance.post('api/events', formData);
            await fetchAllData();
            setShowEventModal(false);
            setNotification({ type: 'success', message: 'تمت إضافة الفعالية بنجاح' });
        } catch (error) {
            setNotification({ type: 'danger', message: 'فشل في إضافة الفعالية' });
        } finally {
            setLoading(false);
        }
    };

    // ===================== إدارة قراءات المياه =====================
    const handleAddWaterReading = async () => {
        try {
            setLoading(true);
            await axiosInstance.post('api/water-readings', {
                propertyId: parseInt(newReading.propertyId),
                amount: parseFloat(newReading.amount),
                date: newReading.date
            });
            await fetchAllData();
            setShowWaterReadingModal(false);
            setNotification({ type: 'success', message: 'تمت إضافة قراءة المياه بنجاح' });
        } catch (error) {
            setNotification({ type: 'danger', message: 'فشل في إضافة قراءة المياه' });
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

            const endpoint = currentBillType === 'ARNONA'
                ? 'api/payments/generate-arnona'
                : 'api/payments/generate-water';

            const params = currentBillType === 'ARNONA'
                ? { month, year }
                : { month, year, rate: 10 };

            await axiosInstance.post(endpoint, null, { params });
            await fetchAllData();
            setShowBillsModal(false);
            setNotification({
                type: 'success',
                message: `تم توليد فواتير ${currentBillType === 'ARNONA' ? 'الأرنونا' : 'المياه'} بنجاح`
            });
        } catch (error) {
            setNotification({
                type: 'danger',
                message: error.response?.data?.message || 'فشل في توليد الفواتير'
            });
        } finally {
            setLoading(false);
        }
    };

    // ===================== واجهة المستخدم =====================
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
                            <FiHome className="me-2" /> لوحة التحكم
                        </li>
                        <li className={activeTab === 'users' ? 'active' : ''}
                            onClick={() => setActiveTab('users')}>
                            <FiUsers className="me-2" /> إدارة المستخدمين
                        </li>
                        <li className={activeTab === 'properties' ? 'active' : ''}
                            onClick={() => setActiveTab('properties')}>
                            <FiHome className="me-2" /> إدارة العقارات
                        </li>
                        <li className={activeTab === 'events' ? 'active' : ''}
                            onClick={() => setActiveTab('events')}>
                            <FiCalendar className="me-2" /> إدارة الفعاليات
                        </li>
                        <li className={activeTab === 'water' ? 'active' : ''}
                            onClick={() => setActiveTab('water')}>
                            <FiDroplet className="me-2" /> قراءات المياه
                        </li>
                        <li className={activeTab === 'payments' ? 'active' : ''}
                            onClick={() => setActiveTab('payments')}>
                            <FiDollarSign className="me-2" /> إدارة الفواتير
                        </li>
                    </ul>
                </Col>

                <Col md={9} className="main-content">
                    {loading ? (
                        <div className="text-center py-5">
                            <Spinner animation="border" variant="primary" />
                        </div>
                    ) : (
                        <>
                            {/* لوحة التحكم */}
                            {activeTab === 'dashboard' && (
                                <div className="dashboard-overview">
                                    <h3 className="mb-4">نظرة عامة</h3>
                                    <Row className="mb-4">
                                        <Col md={3}>
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
                                        <Col md={3}>
                                            <Card className="stat-card">
                                                <Card.Body>
                                                    <div className="d-flex justify-content-between align-items-center">
                                                        <div>
                                                            <h6>عدد العقارات</h6>
                                                            <h3>{properties.length}</h3>
                                                        </div>
                                                        <FiHome size={30} className="text-info" />
                                                    </div>
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                        <Col md={3}>
                                            <Card className="stat-card">
                                                <Card.Body>
                                                    <div className="d-flex justify-content-between align-items-center">
                                                        <div>
                                                            <h6>فواتير المياه</h6>
                                                            <h3>{payments.filter(p => p.paymentType === 'WATER').length}</h3>
                                                        </div>
                                                        <FiDroplet size={30} className="text-success" />
                                                    </div>
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                        <Col md={3}>
                                            <Card className="stat-card">
                                                <Card.Body>
                                                    <div className="d-flex justify-content-between align-items-center">
                                                        <div>
                                                            <h6>فواتير الأرنونا</h6>
                                                            <h3>{payments.filter(p => p.paymentType === 'ARNONA').length}</h3>
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
                                                <Card.Body>
                                                    <Button variant="success" className="w-100 mb-3"
                                                            onClick={() => { setCurrentBillType('WATER'); setShowBillsModal(true); }}>
                                                        <FiPlus className="me-2" /> توليد فواتير المياه
                                                    </Button>
                                                    <Button variant="info" className="w-100 mb-3"
                                                            onClick={() => { setCurrentBillType('ARNONA'); setShowBillsModal(true); }}>
                                                        <FiPlus className="me-2" /> توليد فواتير الأرنونا
                                                    </Button>
                                                    <Button variant="primary" className="w-100 mb-3"
                                                            onClick={() => setShowWaterReadingModal(true)}>
                                                        <FiPlus className="me-2" /> إضافة قراءة مياه
                                                    </Button>
                                                    <Button variant="secondary" className="w-100"
                                                            onClick={() => setShowEventModal(true)}>
                                                        <FiPlus className="me-2" /> إضافة فعالية جديدة
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

                            {/* إدارة المستخدمين */}
                            {activeTab === 'users' && (
                                <div className="users-section">
                                    <h3 className="mb-4">إدارة المستخدمين</h3>
                                    <Table striped bordered hover>
                                        <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>الاسم الكامل</th>
                                            <th>البريد الإلكتروني</th>
                                            <th>الهاتف</th>
                                            <th>عدد العقارات</th>
                                            <th>الدور</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {users.map((user, index) => (
                                            <tr key={user.userId}>
                                                <td>{index + 1}</td>
                                                <td>{user.fullName}</td>
                                                <td>{user.email}</td>
                                                <td>{user.phone || '--'}</td>
                                                <td>{user.properties?.length || 0}</td>
                                                <td>{user.role?.roleName || '--'}</td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </Table>
                                </div>
                            )}

                            {/* إدارة العقارات */}
                            {activeTab === 'properties' && (
                                <div className="properties-section">
                                    <div className="d-flex justify-content-between align-items-center mb-4">
                                        <h3>إدارة العقارات</h3>
                                        <Button variant="primary" onClick={() => setShowPropertyModal(true)}>
                                            <FiPlus className="me-2" /> إضافة عقار جديد
                                        </Button>
                                    </div>
                                    <Table striped bordered hover>
                                        <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>العنوان</th>
                                            <th>المساحة (م²)</th>
                                            <th>عدد الوحدات</th>
                                            <th>المالك</th>
                                            <th>قراءة المياه الأخيرة</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {properties.map((property, index) => {
                                            const owner = users.find(u => u.userId === property.userId);
                                            const lastReading = waterReadings
                                                .filter(r => r.propertyId === property.propertyId)
                                                .sort((a, b) => new Date(b.date) - new Date(a.date))[0];

                                            return (
                                                <tr key={property.propertyId}>
                                                    <td>{index + 1}</td>
                                                    <td>{property.address}</td>
                                                    <td>{property.area}</td>
                                                    <td>{property.numberOfUnits}</td>
                                                    <td>{owner?.fullName || '--'}</td>
                                                    <td>
                                                        {lastReading ? `${lastReading.amount} م³` : '--'}
                                                    </td>
                                                </tr>
                                            );
                                        })}
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
                                            <FiPlus className="me-2" /> إضافة فعالية جديدة
                                        </Button>
                                    </div>
                                    <Row>
                                        {events.map(event => (
                                            <Col md={4} key={event.id} className="mb-4">
                                                <Card>
                                                    {event.imageUrl && (
                                                        <Card.Img variant="top" src={event.imageUrl} style={{ height: '200px', objectFit: 'cover' }} />
                                                    )}
                                                    <Card.Body>
                                                        <Card.Title>{event.title}</Card.Title>
                                                        <Card.Text>{event.description}</Card.Text>
                                                        <div className="d-flex justify-content-between">
                                                            <small className="text-muted">
                                                                <FiCalendar className="me-1" />
                                                                {new Date(event.date).toLocaleDateString()}
                                                            </small>
                                                            <small className="text-muted">
                                                                <FiHome className="me-1" />
                                                                {event.location}
                                                            </small>
                                                        </div>
                                                    </Card.Body>
                                                </Card>
                                            </Col>
                                        ))}
                                    </Row>
                                </div>
                            )}

                            {/* قراءات المياه */}
                            {activeTab === 'water' && (
                                <div className="water-readings-section">
                                    <div className="d-flex justify-content-between align-items-center mb-4">
                                        <h3>إدارة قراءات المياه</h3>
                                        <Button variant="primary" onClick={() => setShowWaterReadingModal(true)}>
                                            <FiPlus className="me-2" /> إضافة قراءة جديدة
                                        </Button>
                                    </div>
                                    <Table striped bordered hover>
                                        <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>العقار</th>
                                            <th>الكمية (م³)</th>
                                            <th>التاريخ</th>
                                            <th>الحالة</th>
                                            <th>المستخدم</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {waterReadings.map((reading, index) => {
                                            const property = properties.find(p => p.propertyId === reading.propertyId);
                                            const user = users.find(u => u.userId === property?.userId);

                                            return (
                                                <tr key={reading.id}>
                                                    <td>{index + 1}</td>
                                                    <td>{property?.address || '--'}</td>
                                                    <td>{reading.amount}</td>
                                                    <td>{new Date(reading.date).toLocaleDateString()}</td>
                                                    <td>
                                                        <Badge bg={reading.approved ? 'success' : 'warning'}>
                                                            {reading.approved ? 'مقبولة' : 'قيد المراجعة'}
                                                        </Badge>
                                                    </td>
                                                    <td>{user?.fullName || '--'}</td>
                                                </tr>
                                            );
                                        })}
                                        </tbody>
                                    </Table>
                                </div>
                            )}

                            {/* إدارة الفواتير */}
                            {activeTab === 'payments' && (
                                <div className="payments-section">
                                    <h3 className="mb-4">إدارة الفواتير الشهرية</h3>
                                    <Tabs defaultActiveKey="all" className="mb-3">
                                        <Tab eventKey="all" title="جميع الفواتير">
                                            <Table striped bordered hover className="mt-3">
                                                <thead>
                                                <tr>
                                                    <th>#</th>
                                                    <th>نوع الفاتورة</th>
                                                    <th>المستخدم</th>
                                                    <th>المبلغ</th>
                                                    <th>الحالة</th>
                                                    <th>العقار</th>
                                                    <th>تاريخ الإنشاء</th>
                                                </tr>
                                                </thead>
                                                <tbody>
                                                {payments.map((payment, index) => {
                                                    const user = users.find(u => u.userId === payment.userId);
                                                    const property = properties.find(p => p.propertyId === payment.propertyId);

                                                    return (
                                                        <tr key={payment.paymentId}>
                                                            <td>{index + 1}</td>
                                                            <td>{payment.paymentType === 'WATER' ? 'مياه' : 'أرنونا'}</td>
                                                            <td>{user?.fullName || '--'}</td>
                                                            <td>{payment.amount} شيكل</td>
                                                            <td>
                                                                <Badge bg={
                                                                    payment.status === 'PAID' ? 'success' :
                                                                        payment.status === 'PENDING' ? 'warning' : 'danger'
                                                                }>
                                                                    {payment.status === 'PAID' ? 'مدفوع' :
                                                                        payment.status === 'PENDING' ? 'قيد الانتظار' : 'فشل'}
                                                                </Badge>
                                                            </td>
                                                            <td>{property?.address || '--'}</td>
                                                            <td>{new Date(payment.createdAt).toLocaleDateString()}</td>
                                                        </tr>
                                                    );
                                                })}
                                                </tbody>
                                            </Table>
                                        </Tab>
                                        <Tab eventKey="water" title="فواتير المياه">
                                            {/* ... نفس الجدول مع تصفية حسب نوع الفاتورة ... */}
                                        </Tab>
                                        <Tab eventKey="arnona" title="فواتير الأرنونا">
                                            {/* ... نفس الجدول مع تصفية حسب نوع الفاتورة ... */}
                                        </Tab>
                                    </Tabs>
                                </div>
                            )}
                        </>
                    )}
                </Col>
            </Row>

            {/* ===================== جميع المودالات ===================== */}

            {/* مودال إضافة عقار جديد */}
            <Modal show={showPropertyModal} onHide={() => setShowPropertyModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>إضافة عقار جديد</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>اختر المالك</Form.Label>
                            <Form.Select
                                value={newProperty.userId}
                                onChange={(e) => setNewProperty({...newProperty, userId: e.target.value})}
                            >
                                <option value="">اختر المالك</option>
                                {users.map(user => (
                                    <option key={user.userId} value={user.userId}>
                                        {user.fullName} - {user.email}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>عنوان العقار</Form.Label>
                            <Form.Control
                                type="text"
                                value={newProperty.address}
                                onChange={(e) => setNewProperty({...newProperty, address: e.target.value})}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>المساحة (م²)</Form.Label>
                            <Form.Control
                                type="number"
                                step="0.01"
                                value={newProperty.area}
                                onChange={(e) => setNewProperty({...newProperty, area: e.target.value})}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>عدد الوحدات</Form.Label>
                            <Form.Control
                                type="number"
                                value={newProperty.numberOfUnits}
                                onChange={(e) => setNewProperty({...newProperty, numberOfUnits: e.target.value})}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowPropertyModal(false)}>
                        إلغاء
                    </Button>
                    <Button variant="primary" onClick={handleAddProperty} disabled={loading}>
                        {loading ? 'جاري الحفظ...' : 'حفظ العقار'}
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

            {/* مودال إضافة قراءة مياه */}
            <Modal show={showWaterReadingModal} onHide={() => setShowWaterReadingModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>إضافة قراءة مياه جديدة</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>اختر العقار</Form.Label>
                            <Form.Select
                                value={newReading.propertyId}
                                onChange={(e) => setNewReading({...newReading, propertyId: e.target.value})}
                            >
                                <option value="">اختر العقار</option>
                                {properties.map(property => {
                                    const owner = users.find(u => u.userId === property.userId);
                                    return (
                                        <option key={property.propertyId} value={property.propertyId}>
                                            {property.address} (المالك: {owner?.fullName || 'غير معروف'})
                                        </option>
                                    );
                                })}
                            </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>كمية الاستهلاك (م³)</Form.Label>
                            <Form.Control
                                type="number"
                                step="0.01"
                                value={newReading.amount}
                                onChange={(e) => setNewReading({...newReading, amount: e.target.value})}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>تاريخ القراءة</Form.Label>
                            <Form.Control
                                type="date"
                                value={newReading.date}
                                onChange={(e) => setNewReading({...newReading, date: e.target.value})}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowWaterReadingModal(false)}>
                        إلغاء
                    </Button>
                    <Button variant="primary" onClick={handleAddWaterReading} disabled={loading}>
                        {loading ? 'جاري الحفظ...' : 'حفظ القراءة'}
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
                    <p className="text-center mb-4">
                        {currentBillType === 'ARNONA'
                            ? 'سيتم توليد فواتير الأرنونا لجميع العقارات بناءً على المساحة وعدد الوحدات'
                            : 'سيتم توليد فواتير المياه لجميع العقارات بناءً على قراءات المياه'}
                    </p>
                    <Table striped bordered hover>
                        <thead>
                        <tr>
                            <th>#</th>
                            <th>العقار</th>
                            <th>المالك</th>
                            {currentBillType === 'WATER' && <th>آخر قراءة مياه</th>}
                            {currentBillType === 'ARNONA' && <th>المساحة (م²)</th>}
                            <th>عدد الوحدات</th>
                            <th>حالة الفاتورة الحالية</th>
                        </tr>
                        </thead>
                        <tbody>
                        {properties.length === 0 ? (
                            <tr>
                                <td colSpan={currentBillType === 'WATER' ? 6 : 5} className="text-center text-danger">
                                    لا يوجد عقارات مسجلة
                                </td>
                            </tr>
                        ) : (
                            properties.map((property, idx) => {
                                const owner = users.find(u => u.userId === property.userId);
                                const lastReading = waterReadings
                                    .filter(r => r.propertyId === property.propertyId)
                                    .sort((a, b) => new Date(b.date) - new Date(a.date))[0];
                                const propertyPayments = payments.filter(p => p.propertyId === property.propertyId);
                                const lastPayment = propertyPayments
                                    .filter(p => p.paymentType === currentBillType)
                                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];

                                return (
                                    <tr key={property.propertyId}>
                                        <td>{idx + 1}</td>
                                        <td>{property.address}</td>
                                        <td>{owner?.fullName || '--'}</td>
                                        {currentBillType === 'WATER' && (
                                            <td>{lastReading ? `${lastReading.amount} م³` : '--'}</td>
                                        )}
                                        {currentBillType === 'ARNONA' && (
                                            <td>{property.area}</td>
                                        )}
                                        <td>{property.numberOfUnits}</td>
                                        <td>
                                            {lastPayment ? (
                                                <Badge bg={
                                                    lastPayment.status === 'PAID' ? 'success' :
                                                        lastPayment.status === 'PENDING' ? 'warning' : 'danger'
                                                }>
                                                    {lastPayment.status === 'PAID' ? 'مدفوع' :
                                                        lastPayment.status === 'PENDING' ? 'قيد الانتظار' : 'فشل'}
                                                </Badge>
                                            ) : '--'}
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                        </tbody>
                    </Table>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowBillsModal(false)}>
                        إلغاء
                    </Button>
                    <Button variant="primary" onClick={handleGenerateBills} disabled={loading}>
                        {loading ? (
                            <>
                                <Spinner as="span" animation="border" size="sm" />
                                <span className="ms-2">جاري التوليد...</span>
                            </>
                        ) : 'توليد الفواتير'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default AdminGeneral;