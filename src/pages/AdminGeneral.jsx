import React, {useState, useEffect, useCallback} from 'react';
import {
    Container, Row, Col, Card, Button, Table, Modal,
    Alert, Spinner, Badge, Form
} from 'react-bootstrap';
import {
    FiUsers, FiDollarSign, FiPlus, FiCalendar,
    FiHome, FiFileText, FiDroplet, FiMapPin, FiActivity, FiImage,
    FiEye, FiTrash2, FiEdit
} from 'react-icons/fi';
import './AdminGeneral.css';
import {
    getPropertiesByUserId,
    addWaterReading,
    getUsersWithProperties, // if this is the correct name
    axiosInstance,
    getCurrentMonthPayments,
    getUsersWithPayments, getAllUsers, getUserProperties
} from '../api.js';
import { useTranslation } from 'react-i18next';

const AdminGeneral = () => {
    const { t, i18n } = useTranslation();

    // States العامة
    const [activeTab, setActiveTab] = useState('dashboard');
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState(null);

    // States للمستخدمين والفواتير
    const [users, setUsers] = useState([]);
    const [payments, setPayments] = useState([]);
    const [showBillsModal, setShowBillsModal] = useState(false);
    const [currentBillType, setCurrentBillType] = useState('');

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

    const [showWaterReadingModal, setShowWaterReadingModal] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState('');
    const [userProperties, setUserProperties] = useState([]);
    const [waterReadings, setWaterReadings] = useState({});
    const [showEditEventModal, setShowEditEventModal] = useState(false);
    const [currentEvent, setCurrentEvent] = useState(null);
    const [showImageModal, setShowImageModal] = useState(false);
    const [newImage, setNewImage] = useState(null);

    // دالة فتح نموذج التعديل
    const handleEditEvent = (event) => {
        if (!event) {
            console.error('Event is undefined');
            return;
        }

        const eventId = event.id || event.event_id;
        if (!eventId) {
            console.error('Event ID is missing:', event);
            return;
        }

        setCurrentEvent({ ...event, id: eventId });
        setNewEvent({
            title: event.title,
            description: event.description,
            location: event.location,
            image: null,
            date: event.startDate ? event.startDate.split('T')[0] : ''
        });
        setShowEditEventModal(true);
    };

    // دالة تحديث الفعالية
    const handleUpdateEvent = async () => {
        try {
            setLoading(true);

            if (!currentEvent?.id) {
                console.error('Event ID is not defined');
                setNotification({ type: 'danger', message: t('admin.events.updateError') });
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

            await axiosInstance.put(`api/events/${currentEvent.id}`, formData, {
                headers: { 'Content-Type': undefined }
            });

            await fetchEvents();
            setShowEditEventModal(false);
            setNotification({ type: 'success', message: t('admin.events.updateSuccess') });
        } catch (error) {
            console.error('Error updating event:', error);
            setNotification({
                type: 'danger',
                message: error.response?.data?.message || t('admin.events.updateError')
            });
        } finally {
            setLoading(false);
        }
    };

    // دالة حذف الفعالية
    const handleDeleteEvent = async (eventId) => {
        try {
            setLoading(true);
            await axiosInstance.delete(`api/events/${eventId}`);
            await fetchEvents();
            setNotification({ type: 'success', message: t('admin.events.deleteSuccess') });
        } catch (error) {
            console.error('Error deleting event:', error);
            setNotification({
                type: 'danger',
                message: error.response?.data?.message || t('admin.events.deleteError')
            });
        } finally {
            setLoading(false);
        }
    };

    // دالة تغيير الصورة
    const handleChangeImage = async () => {
        try {
            setLoading(true);

            const eventObj = {
                title: currentEvent.title,
                description: currentEvent.description,
                location: currentEvent.location,
                startDate: currentEvent.startDate,
                endDate: currentEvent.endDate,
                active: true
            };

            const formData = new FormData();
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
            setNotification({ type: 'success', message: t('admin.events.imageChangeSuccess') });
        } catch (error) {
            setNotification({ type: 'danger', message: t('admin.events.imageChangeError') });
        } finally {
            setLoading(false);
        }
    };

    // دالة لجلب عقارات المستخدم
    const fetchUserProperties = async (userId) => {
        try {
            const properties = await getPropertiesByUserId(userId);
            setUserProperties(properties);

            const readings = {};
            properties.forEach(property => {
                readings[property.property_id] = '';
            });
            setWaterReadings(readings);
        } catch (error) {
            setNotification({ type: 'danger', message: t('admin.properties.fetchError') });
        }
    };

    // دالة إضافة قراءات المياه
    const handleAddWaterReadings = async () => {
        try {
            setLoading(true);

            for (const propertyId in waterReadings) {
                if (waterReadings[propertyId]) {
                    await addWaterReading(propertyId, parseFloat(waterReadings[propertyId]));
                }
            }

            setShowWaterReadingModal(false);
            setSelectedUserId('');
            setUserProperties([]);
            setWaterReadings({});

            setNotification({ type: 'success', message: t('admin.water.readingsSuccess') });
        } catch (error) {
            setNotification({ type: 'danger', message: t('admin.water.readingsError') + (error.response?.data?.message || error.message) });
        } finally {
            setLoading(false);
        }
    };

    const handleAddProperty = async () => {
        try {
            setLoading(true);
            await axiosInstance.post('/api/properties', {
                address: newProperty.address,
                area: parseFloat(newProperty.area),
                numberOfUnits: parseInt(newProperty.numberOfUnits),
                userId: newProperty.userId
            });

            const updatedUsers = await fetchUsersWithProperties();
            setUsers(updatedUsers);

            setShowAddPropertyModal(false);
            setNewProperty({
                userId: '',
                address: '',
                area: '',
                numberOfUnits: 1
            });
            setNotification({ type: 'success', message: t('admin.properties.addSuccess') });
        } catch (error) {
            setNotification({ type: 'danger', message: t('admin.properties.addError') + (error.response?.data?.message || error.message) });
        } finally {
            setLoading(false);
        }
    };

    const fetchUsersWithProperties = async () => {
        const users = await getAllUsers();
        const usersWithProperties = await Promise.all(users.map(async user => {
            const properties = await getUserProperties(user.userId);
            return { ...user, properties };
        }));
        return usersWithProperties;
    };
    // ===================== دوال جلب البيانات =====================
    const fetchUsersWithPayments = async () => {
        try {
            const currentDate = new Date();
            const month = currentDate.getMonth() + 1;
            const year = currentDate.getFullYear();

            const usersWithPayments = await getUsersWithPayments(month, year);
            return usersWithPayments;
        } catch (error) {
            console.error('Error fetching users with payments:', error);
            return [];
        }
    };

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [users, payments] = await Promise.all([
                fetchUsersWithProperties(),
            ]);
            setUsers(users);
            setPayments(payments);
            await fetchEvents();
        } catch (error) {
            setNotification({ type: 'danger', message: t('admin.general.loadError') });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);
    const fetchEvents = async () => {
        try {
            const response = await axiosInstance.get('api/events');
            const eventsWithId = response.data.map(event => ({
                ...event,
                id: event.id || event.event_id
            }));
            setEvents(eventsWithId);
        } catch (error) {
            console.error('Error fetching events:', error);
        }
    };

    // تحميل البيانات الأولية
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const usersRes = await fetchUsersWithPayments();
                const paymentsRes = await getCurrentMonthPayments().catch(() => []);

                setUsers(usersRes);
                setPayments(paymentsRes);
                await fetchEvents();
            } catch (error) {
                setNotification({ type: 'danger', message: t('admin.general.loadError') });
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    // ===================== إدارة الفعاليات =====================
    const handleAddEvent = async () => {
        try {
            setLoading(true);

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

            if (newEvent.image) formData.append('image', newEvent.image);

            await axiosInstance.post('api/events', formData, {
                headers: { 'Content-Type': undefined }
            });

            await fetchEvents();
            setShowEventModal(false);
            setNewEvent({ title: '', description: '', location: '', image: null, date: '' });
            setNotification({ type: 'success', message: t('admin.events.addSuccess') });
        } catch (error) {
            console.error(error);
            setNotification({ type: 'danger', message: error.response?.data?.message || t('admin.events.addError') });
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
            const updatedPayments = await fetchPayments();
            setPayments(updatedPayments);

            setNotification({
                type: 'success',
                message: currentBillType === 'ARNONA'
                    ? t('admin.bills.arnonaSuccess')
                    : t('admin.bills.waterSuccess')
            });
            setShowBillsModal(false);
        } catch (error) {
            setNotification({
                type: 'danger',
                message: error.response?.data?.message || t('admin.bills.generateError')
            });
        } finally {
            setLoading(false);
        }
    };

    const formatPaymentStatus = (status) => {
        switch (status) {
            case 'PAID': return { text: t('payment.status.PAID'), variant: 'success' };
            case 'PENDING': return { text: t('payment.status.PENDING'), variant: 'warning' };
            case 'FAILED': return { text: t('payment.status.FAILED'), variant: 'danger' };
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
                        <h4>{t('admin.general.title')}</h4>
                    </div>
                    <ul className="sidebar-menu">
                        <li className={activeTab === 'dashboard' ? 'active' : ''}
                            onClick={() => setActiveTab('dashboard')}>
                            <FiHome /> {t('admin.menu.dashboard')}
                        </li>
                        <li className={activeTab === 'payments' ? 'active' : ''}
                            onClick={() => setActiveTab('payments')}>
                            <FiDollarSign /> {t('admin.menu.payments')}
                        </li>
                        <li className={activeTab === 'events' ? 'active' : ''}
                            onClick={() => setActiveTab('events')}>
                            <FiCalendar /> {t('admin.menu.events')}
                        </li>
                    </ul>
                </Col>

                <Col md={9} className="main-content">
                    {loading ? (
                        <div className="text-center py-5">
                            <Spinner animation="border" variant="primary" />
                            <p className="mt-3">{t('general.loading')}</p>
                        </div>
                    ) : (
                        <>
                            {/* لوحة التحكم */}
                            {activeTab === 'dashboard' && (
                                <div className="dashboard-overview">
                                    <h3>{t('admin.dashboard.overview')}</h3>
                                    <Row className="mb-4">
                                        <Col md={4}>
                                            <Card className="stat-card">
                                                <Card.Body>
                                                    <div className="d-flex justify-content-between align-items-center">
                                                        <div>
                                                            <h6>{t('admin.dashboard.eventsCount')}</h6>
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
                                                            <h6>{t('admin.dashboard.waterBills')}</h6>
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
                                                            <h6>{t('admin.dashboard.arnonaBills')}</h6>
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
                                                    <h5>{t('admin.dashboard.quickActions')}</h5>
                                                </Card.Header>
                                                <Card.Body className="quick-actions">
                                                    <Button variant="success" onClick={() => { setCurrentBillType('WATER'); setShowBillsModal(true); }}>
                                                        <FiPlus /> {t('admin.actions.generateWater')}
                                                    </Button>
                                                    <Button variant="info" onClick={() => { setCurrentBillType('ARNONA'); setShowBillsModal(true); }}>
                                                        <FiPlus /> {t('admin.actions.generateArnona')}
                                                    </Button>
                                                    <Button variant="primary" onClick={() => setShowEventModal(true)}>
                                                        <FiPlus /> {t('admin.actions.addEvent')}
                                                    </Button>
                                                    <Button variant="warning" onClick={() => setShowAddPropertyModal(true)}>
                                                        <FiMapPin /> {t('admin.actions.addProperty')}
                                                    </Button>
                                                    <Button variant="info" onClick={() => setShowWaterReadingModal(true)}>
                                                        <FiActivity /> {t('admin.actions.addWaterReadings')}
                                                    </Button>
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                        <Col md={6}>
                                            <Card>
                                                <Card.Header>
                                                    <h5>{t('admin.dashboard.recentEvents')}</h5>
                                                </Card.Header>
                                                <Card.Body>
                                                    {events.slice(0, 3).map(event => (
                                                        <div key={event.id} className="mb-3">
                                                            <h6>{event.title}</h6>
                                                            <small className="text-muted">
                                                                <FiCalendar /> {new Date(event.date).toLocaleDateString()} - <FiHome /> {event.location}
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
                                    <Modal.Title>{t('admin.properties.addTitle')}</Modal.Title>
                                </Modal.Header>
                                <Modal.Body>
                                    <Form>
                                        <Form.Group className="mb-3">
                                            <Form.Label>{t('admin.properties.userId')}</Form.Label>
                                            <Form.Control
                                                type="text"
                                                value={newProperty.userId}
                                                onChange={(e) => setNewProperty({...newProperty, userId: e.target.value})}
                                                placeholder={t('admin.properties.userIdPlaceholder')}
                                            />
                                        </Form.Group>
                                        <Form.Group className="mb-3">
                                            <Form.Label>{t('labels.address')}</Form.Label>
                                            <Form.Control
                                                type="text"
                                                value={newProperty.address}
                                                onChange={(e) => setNewProperty({...newProperty, address: e.target.value})}
                                                placeholder={t('admin.properties.addressPlaceholder')}
                                            />
                                        </Form.Group>
                                        <Row>
                                            <Col md={6}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>{t('labels.area')} (m²)</Form.Label>
                                                    <Form.Control
                                                        type="number"
                                                        value={newProperty.area}
                                                        onChange={(e) => setNewProperty({...newProperty, area: e.target.value})}
                                                        placeholder={t('admin.properties.areaPlaceholder')}
                                                        min="0"
                                                        step="0.01"
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col md={6}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>{t('labels.units')}</Form.Label>
                                                    <Form.Control
                                                        type="number"
                                                        value={newProperty.numberOfUnits}
                                                        onChange={(e) => setNewProperty({...newProperty, numberOfUnits: e.target.value})}
                                                        placeholder={t('admin.properties.unitsPlaceholder')}
                                                        min="1"
                                                    />
                                                </Form.Group>
                                            </Col>
                                        </Row>
                                    </Form>
                                </Modal.Body>
                                <Modal.Footer>
                                    <Button variant="secondary" onClick={() => setShowAddPropertyModal(false)}>
                                        {t('common.close')}
                                    </Button>
                                    <Button variant="primary" onClick={handleAddProperty} disabled={loading}>
                                        {loading ? t('general.loading') : t('admin.properties.saveButton')}
                                    </Button>
                                </Modal.Footer>
                            </Modal>

                            {/* إدارة الفواتير */}
                            {activeTab === 'payments' && (
                                <div className="payments-section">
                                    <h3>{t('admin.payments.title')}</h3>
                                    <Table striped bordered hover>
                                        <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>{t('labels.fullName')}</th>
                                            <th>{t('admin.payments.billType')}</th>
                                            <th>{t('payment.invoice.amount')} ({t('general.currency')})</th>
                                            <th>{t('payment.invoice.paymentStatus')}</th>
                                            <th>{t('labels.address')}</th>
                                            <th>{t('labels.units')}</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {payments.map((payment, index) => (
                                            <tr key={payment.paymentId}>
                                                <td>{index + 1}</td>
                                                <td>{payment.userName || '--'}</td>
                                                <td>{payment.paymentType === 'WATER' ? t('payment.types.water') : t('payment.types.arnona')}</td>
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
                                </div>
                            )}

                            {/* إدارة الفعاليات */}
                            {activeTab === 'events' && (
                                <div className="events-section">
                                    <div className="d-flex justify-content-between align-items-center mb-4">
                                        <h3>{t('admin.events.title')}</h3>
                                        <Button variant="primary" onClick={() => setShowEventModal(true)}>
                                            <FiPlus /> {t('admin.actions.addEvent')}
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
                                                            <FiEdit /> {t('common.edit')}
                                                        </Button>
                                                        <Button
                                                            variant="danger"
                                                            size="sm"
                                                            onClick={() => handleDeleteEvent(event.id)}
                                                        >
                                                            <FiTrash2 /> {t('common.delete')}
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

            {/* مودال إضافة قراءات المياه */}
            <Modal show={showWaterReadingModal} onHide={() => setShowWaterReadingModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>{t('admin.water.addReadings')}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>{t('admin.properties.userId')}</Form.Label>
                            <Form.Control
                                type="text"
                                value={selectedUserId}
                                onChange={(e) => {
                                    setSelectedUserId(e.target.value);
                                    if (e.target.value) {
                                        fetchUserProperties(e.target.value);
                                    } else {
                                        setUserProperties([]);
                                        setWaterReadings({});
                                    }
                                }}
                                placeholder={t('admin.properties.userIdPlaceholder')}
                            />
                        </Form.Group>

                        {userProperties.length > 0 && (
                            <Table striped bordered hover>
                                <thead>
                                <tr>
                                    <th>#</th>
                                    <th>{t('labels.address')}</th>
                                    <th>{t('labels.area')}</th>
                                    <th>{t('labels.units')}</th>
                                    <th>{t('admin.water.reading')} (m³)</th>
                                </tr>
                                </thead>
                                <tbody>
                                {userProperties.map((property, index) => (
                                    <tr key={property.property_id}>
                                        <td>{index + 1}</td>
                                        <td>{property.address}</td>
                                        <td>{property.area} {t('general.squareMeters')}</td>
                                        <td>{property.number_of_units}</td>
                                        <td>
                                            <Form.Control
                                                type="number"
                                                value={waterReadings[property.property_id] || ''}
                                                onChange={(e) => setWaterReadings({
                                                    ...waterReadings,
                                                    [property.property_id]: e.target.value
                                                })}
                                                placeholder={t('admin.water.readingPlaceholder')}
                                                min="0"
                                                step="0.1"
                                            />
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </Table>
                        )}
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowWaterReadingModal(false)}>
                        {t('common.close')}
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleAddWaterReadings}
                        disabled={loading || userProperties.length === 0}
                    >
                        {loading ? t('general.loading') : t('admin.water.saveReadings')}
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* مودال تعديل الفعالية */}
            <Modal show={showEditEventModal} onHide={() => setShowEditEventModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>{t('admin.events.editTitle')}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>{t('admin.events.eventTitle')}</Form.Label>
                            <Form.Control
                                type="text"
                                value={newEvent.title}
                                onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>{t('admin.events.description')}</Form.Label>
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
                                    <Form.Label>{t('event.location')}</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={newEvent.location}
                                        onChange={(e) => setNewEvent({...newEvent, location: e.target.value})}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>{t('event.date')}</Form.Label>
                                    <Form.Control
                                        type="date"
                                        value={newEvent.date}
                                        onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Form.Group className="mb-3">
                            <Form.Label>{t('admin.events.newImage')}</Form.Label>
                            <Form.Control
                                type="file"
                                onChange={(e) => setNewEvent({...newEvent, image: e.target.files[0]})}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowEditEventModal(false)}>
                        {t('common.close')}
                    </Button>
                    <Button variant="primary" onClick={handleUpdateEvent} disabled={loading}>
                        {loading ? t('general.loading') : t('admin.events.saveChanges')}
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* مودال تغيير الصورة */}
            <Modal show={showImageModal} onHide={() => setShowImageModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>{t('admin.events.changeImage')}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {currentEvent?.imageUrl && (
                        <div className="text-center mb-3">
                            <img
                                src={currentEvent.imageUrl}
                                alt={t('admin.events.currentImage')}
                                style={{ maxWidth: '100%', maxHeight: '300px' }}
                            />
                        </div>
                    )}
                    <Form>
                        <Form.Group>
                            <Form.Label>{t('admin.events.selectNewImage')}</Form.Label>
                            <Form.Control
                                type="file"
                                onChange={(e) => setNewImage(e.target.files[0])}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowImageModal(false)}>
                        {t('common.close')}
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleChangeImage}
                        disabled={loading || !newImage}
                    >
                        {loading ? t('general.loading') : t('admin.events.changeImageButton')}
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* مودال إضافة فعالية جديدة */}
            <Modal show={showEventModal} onHide={() => setShowEventModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>{t('admin.events.addTitle')}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>{t('admin.events.eventTitle')}</Form.Label>
                            <Form.Control
                                type="text"
                                value={newEvent.title}
                                onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>{t('admin.events.description')}</Form.Label>
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
                                    <Form.Label>{t('event.location')}</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={newEvent.location}
                                        onChange={(e) => setNewEvent({...newEvent, location: e.target.value})}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>{t('event.date')}</Form.Label>
                                    <Form.Control
                                        type="date"
                                        value={newEvent.date}
                                        onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Form.Group className="mb-3">
                            <Form.Label>{t('admin.events.eventImage')}</Form.Label>
                            <Form.Control
                                type="file"
                                onChange={(e) => setNewEvent({...newEvent, image: e.target.files[0]})}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowEventModal(false)}>
                        {t('common.close')}
                    </Button>
                    <Button variant="primary" onClick={handleAddEvent} disabled={loading}>
                        {loading ? t('general.loading') : t('admin.events.saveEvent')}
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* مودال توليد الفواتير */}
            <Modal show={showBillsModal} onHide={() => setShowBillsModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>
                        {currentBillType === 'ARNONA' ? t('admin.bills.generateArnona') : t('admin.bills.generateWater')}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p className="text-center mb-4">
                        {currentBillType === 'ARNONA'
                            ? t('admin.bills.arnonaDescription')
                            : t('admin.bills.waterDescription')}
                    </p>
                    <Table striped bordered hover>
                        <thead>
                        <tr>
                            <th>#</th>
                            <th>{t('labels.fullName')}</th>
                            <th>{t('labels.address')}</th>
                            <th>{t('labels.units')}</th>
                            <th>{t('labels.area')}</th>
                        </tr>
                        </thead>
                        <tbody>
                        {users.filter(u => u.properties && u.properties.length > 0).length === 0 ? (
                            <tr>
                                <td colSpan={5} className="text-center text-danger">
                                    {t('admin.properties.noProperties')}
                                </td>
                            </tr>
                        ) : (
                            users.filter(u => u.property).map((u, idx) => (
                                <tr key={u.userId}>
                                    <td>{idx + 1}</td>
                                    <td>{u.fullName}</td>
                                    <td>{u.property.address}</td>
                                    <td>{u.property.numberOfUnits}</td>
                                    <td>{u.property.area} {t('general.squareMeters')}</td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </Table>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowBillsModal(false)}>
                        {t('common.close')}
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleGenerateBills}
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <Spinner as="span" animation="border" size="sm" />
                                <span className="ms-2">{t('general.loading')}</span>
                            </>
                        ) : t('admin.bills.generateButton')}
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};


export default AdminGeneral;