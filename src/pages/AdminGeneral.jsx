// AdminGeneral.jsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Container, Row, Col, Card, Button, Table, Modal,
    Alert, Spinner, Badge, Form
} from 'react-bootstrap';
import {
    FiUsers, FiDollarSign, FiPlus, FiCalendar,
    FiHome, FiFileText, FiDroplet, FiMapPin, FiSpeaker , FiImage,
    FiEye, FiTrash2, FiEdit, FiRefreshCw
} from 'react-icons/fi';
import './AdminGeneral.css';
import { axiosInstance } from '../api.js';

const AdminGeneral = () => {
    const { t } = useTranslation();
    // States
    const [activeTab, setActiveTab] = useState('dashboard');
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState(null);

    const [users, setUsers] = useState([]);
    const [payments, setPayments] = useState([]);
    const [showBillsModal, setShowBillsModal] = useState(false);
    const [currentBillType, setCurrentBillType] = useState('');
    const [pagination] = useState({ page: 0, size: 10 });
    const [waterReadings, setWaterReadings] = useState({});

    const [events, setEvents] = useState([]);
    const [showEventModal, setShowEventModal] = useState(false);
    const [newEvent, setNewEvent] = useState({ title: '', description: '', location: '', image: null, date: '' });

    const [showAddPropertyModal, setShowAddPropertyModal] = useState(false);
    const [newProperty, setNewProperty] = useState({ userId: '', address: '', area: '', numberOfUnits: 1 });
    const [manualMode, setManualMode] = useState(false);

    const [showEditEventModal, setShowEditEventModal] = useState(false);
    const [currentEvent, setCurrentEvent] = useState(null);
    const [showImageModal, setShowImageModal] = useState(false);
    const [newImage, setNewImage] = useState(null);
    const [announcements, setAnnouncements] = useState([]);
    const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
    const [newAnnouncement, setNewAnnouncement] = useState({
        title: '',
        content: '',
        priority: 0,
        expiresAt: ''
    });
    // Helper to close notification automatically
    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => setNotification(null), 4000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

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

    const handleDeleteEvent = async (eventId) => {
        try {
            setLoading(true);
            await axiosInstance.delete(`api/events/${eventId}`);
            await fetchEvents();
            setNotification({ type: 'success', message: t('admin.events.deleteSuccess') });
        } catch (error) {
            setNotification({ type: 'danger', message: t('admin.events.deleteError') });
        } finally {
            setLoading(false);
        }
    };

    // إرسال إشعار لجميع المستخدمين
    const notifyAllUsers = async (message, type) => {
        try {
            const response = await axiosInstance.post('/api/notifications/broadcast', {
                message,
                type
            });

            console.log('✅ تم إرسال الإشعار الجماعي بنجاح:', response.data);
            return response.data;

        } catch (error) {
            console.error('Error broadcasting notification:', error.response?.data || error.message);
            throw error;
        }
    };

    const handleUpdateEvent = async () => {
        try {
            setLoading(true);
            if (!currentEvent?.id) {
                setNotification({ type: 'danger', message: t('admin.events.updateError') });
                return;
            }
            const eventObj = {
                title: newEvent.title,
                description: newEvent.description,
                location: newEvent.location,
                startDate: newEvent.date ? `${newEvent.date}T00:00:00` : null,
                endDate: newEvent.date ? `${newEvent.date}T00:00:00` : null,
                active: true
            };
            const formData = new FormData();
            formData.append('event', new Blob([JSON.stringify(eventObj)], { type: 'application/json' }));
            if (newEvent.image) formData.append('image', newEvent.image);

            await axiosInstance.put(`api/events/${currentEvent.id}`, formData, {
                headers: { 'Content-Type': undefined }
            });
            await fetchEvents();
            setShowEditEventModal(false);
            setNotification({ type: 'success', message: t('admin.events.updateSuccess') });
        } catch (error) {
            setNotification({ type: 'danger', message: t('admin.events.updateError') });
        } finally {
            setLoading(false);
        }
    };

    const generateRandomWaterReadings = () => {
        const readings = {};
        users.forEach(user => {
            if (user.properties?.length > 0) {
                user.properties.forEach(property => {
                    const propId = property.id || property.propertyId;
                    if (propId && user.id) {
                        readings[propId] = { userId: user.id, reading: Math.floor(Math.random() * 21) + 10 };
                    }
                });
            }
        });
        return readings;
    };

    const handleOpenWaterBillsModal = () => {
        setCurrentBillType('WATER');
        const initial = {};
        users.forEach(u =>
            u.properties?.forEach(p => {
                const propId = p.id || p.propertyId;
                initial[propId] = {
                    userId: u.id,
                    reading: waterReadings[propId]?.reading ?? 15
                };
            })
        );
        setWaterReadings(initial);
        setManualMode(true);
        setShowBillsModal(true);
    };

    const handleChangeImage = async () => {
        try {
            setLoading(true);
            const formData = new FormData();
            const eventObj = {
                title: currentEvent.title,
                description: currentEvent.description,
                location: currentEvent.location,
                startDate: currentEvent.startDate,
                endDate: currentEvent.endDate,
                active: true
            };
            formData.append('event', new Blob([JSON.stringify(eventObj)], { type: 'application/json' }));
            if (newImage) formData.append('image', newImage);

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
            setNewProperty({ userId: '', address: '', area: '', numberOfUnits: 1 });
            setNotification({ type: 'success', message: t('admin.properties.addSuccess') });
        } catch (error) {
            setNotification({ type: 'danger', message: t('admin.properties.addError') });
        } finally {
            setLoading(false);
        }
    };

    const fetchUsersWithProperties = async () => {
        try {
            const response = await axiosInstance.get('api/users/all', {
                params: { page: pagination.page, size: pagination.size }
            });
            const usersData = response.data.content || [];
            return usersData
                .filter(u => u.properties?.length > 0)
                .map(u => ({ ...u, property: u.properties[0] }));
        } catch (error) {
            throw error;
        }
    };

    const fetchPayments = async () => {
        try {
            const currentDate = new Date();
            const response = await axiosInstance.get('api/payments/current-month', {
                params: { month: currentDate.getMonth() + 1, year: currentDate.getFullYear() }
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    };

    const fetchEvents = async () => {
        try {
            const response = await axiosInstance.get('api/events');
            setEvents(response.data);
        } catch (error) {
            console.error(error);
        }
    };


    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                if (activeTab === 'announcements') {
                    await fetchAnnouncements();
                }
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
                setNotification({ type: 'danger', message: t('admin.general.loadError') });
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [activeTab, t]);

    const handleAddEvent = async () => {
        try {
            setLoading(true);
            const eventObj = {
                title: newEvent.title,
                description: newEvent.description,
                location: newEvent.location,
                startDate: newEvent.date ? `${newEvent.date}T00:00:00` : null,
                endDate: newEvent.date ? `${newEvent.date}T00:00:00` : null,
                active: true
            };
            const formData = new FormData();
            formData.append('event', new Blob([JSON.stringify(eventObj)], { type: 'application/json' }));
            if (newEvent.image) formData.append('image', newEvent.image);

            await axiosInstance.post('api/events', formData, {
                headers: { 'Content-Type': undefined }
            });
            await fetchEvents();
            setShowEventModal(false);
            setNewEvent({ title: '', description: '', location: '', image: null, date: '' });
            await notifyAllUsers('התווספה אירוע חדש!', 'NEW_EVENT');
            setNotification({ type: 'success', message: t('admin.events.addSuccess') });
        } catch (error) {
            setNotification({ type: 'danger', message: t('admin.events.addError') });
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateBills = async () => {
        try {
            setLoading(true);
            const currentDate = new Date();
            const month = currentDate.getMonth() + 1;
            const year = currentDate.getFullYear();

            const usersWithProps = users.filter(u => u.properties?.length > 0 && u.id);
            if (usersWithProps.length === 0) {
                setNotification({ type: 'danger', message: t('admin.properties.noProperties') });
                return;
            }

            if (currentBillType === 'WATER') {
                const billsData = usersWithProps.flatMap(user =>
                    user.properties.map(prop => {
                        const propId = prop.id || prop.propertyId;
                        return {
                            userId: user.id,
                            propertyId: propId,
                            amount: (waterReadings[propId]?.reading || 15) * 30,
                            reading: waterReadings[propId]?.reading || 15
                        };
                    })
                );
                const response = await axiosInstance.post('api/payments/generate-custom-water', billsData);
                await notifyAllUsers('נוצרה עבורך חשבונית מים חדשה!', 'WATER_BILL');

                if (response.data.success) {
                    console.log("✅ مياه success - before setNotification");
                    console.log("Message:", t('admin.payments.arnonaSuccess'));
                    setNotification({ type: 'success', message: t('admin.payments.arnonaSuccess') });
                    setNotification({ type: 'success', message: `${t('admin.payments.waterSuccess')} (${billsData.length})` });
                }
            } else {
                await axiosInstance.post('api/payments/generate-arnona', null, { params: { month, year } });
                await notifyAllUsers('נוצרה עבורך חשבונית ארנונה חדשה!', 'ARNONA_BILL');
                console.log("✅ Arnona success - before setNotification");
                console.log("Message:", t('admin.payments.arnonaSuccess'));
                setNotification({ type: 'success', message: t('admin.payments.arnonaSuccess') });
                setNotification({ type: 'success', message: t('admin.payments.arnonaSuccess') });
            }
            const updatedPayments = await fetchPayments();
            setPayments(updatedPayments);
            setShowBillsModal(false);
        } catch (error) {
            setNotification({ type: 'danger', message: t('admin.payments.generateError') });
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
    const fetchAnnouncements = async () => {
        try {
            const response = await axiosInstance.get('/api/announcements');
            setAnnouncements(response.data);
        } catch (error) {
            console.error('Failed to fetch announcements:', error);
        }
    };

    const handleDeleteAnnouncement = async (id) => {
        try {
            setLoading(true);
            await axiosInstance.delete(`/api/announcements/${id}`);
            await fetchAnnouncements();
            setNotification({ type: 'success', message: t('admin.announcements.deleteSuccess') });
        } catch (error) {
            setNotification({ type: 'danger', message: t('admin.announcements.deleteError') });
        } finally {
            setLoading(false);
        }
    };

    const handleAddAnnouncement = async () => {
        try {
            setLoading(true);
            const announcementData = {
                ...newAnnouncement,
                expiresAt: newAnnouncement.expiresAt ? new Date(newAnnouncement.expiresAt) : null
            };
            await axiosInstance.post('/api/announcements', announcementData);
            await notifyAllUsers('התווספה הודעה חדשה!', 'NEW_ANNOUNCEMENT');
            await fetchAnnouncements();
            setShowAnnouncementModal(false);
            setNewAnnouncement({ title: '', content: '', priority: 0, expiresAt: '' });
            setNotification({ type: 'success', message: t('admin.announcements.addSuccess') });
        } catch (error) {
            setNotification({ type: 'danger', message: t('admin.announcements.addError') });
        } finally {
            setLoading(false);
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
                            <FiHome/> {t('admin.menu.dashboard')}
                        </li>
                        <li className={activeTab === 'payments' ? 'active' : ''}
                            onClick={() => setActiveTab('payments')}>
                            <FiDollarSign/> {t('admin.menu.payments')}
                        </li>
                        <li className={activeTab === 'events' ? 'active' : ''}
                            onClick={() => setActiveTab('events')}>
                            <FiCalendar/> {t('admin.menu.events')}
                        </li>
                        <li className={activeTab === 'announcements' ? 'active' : ''}
                            onClick={() => setActiveTab('announcements')}>
                            <FiSpeaker/> {t('admin.menu.announcements')}
                        </li>
                    </ul>
                </Col>

                <Col md={9} className="main-content">
                    {loading ? (
                        <div className="text-center py-5">
                            <Spinner animation="border" variant="primary" />
                            <p className="mt-3">{t('common.loading')}</p>
                        </div>
                    ) : (
                        <>
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
                                                            <h3>{payments.filter(p => p.paymentType === 'WATER').length}</h3>
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
                                                    <h5>{t('admin.dashboard.quickActions')}</h5>
                                                </Card.Header>
                                                <Card.Body className="quick-actions">
                                                    <Button variant="success" onClick={handleOpenWaterBillsModal}>
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
                                                                {new Date(event.startDate).toLocaleDateString()} - {event.location}
                                                            </small>
                                                        </div>
                                                    ))}
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                    </Row>
                                </div>
                            )}

                            <Modal show={showAddPropertyModal} onHide={() => setShowAddPropertyModal(false)}>
                                <Modal.Header closeButton>
                                    <Modal.Title>{t('admin.actions.addProperty')}</Modal.Title>
                                </Modal.Header>
                                <Modal.Body>
                                    <Form>
                                        <Form.Group className="mb-3">
                                            <Form.Label>{t('admin.properties.userId')}</Form.Label>
                                            <Form.Control
                                                type="text"
                                                value={newProperty.userId}
                                                onChange={(e) => setNewProperty({ ...newProperty, userId: e.target.value })}
                                                placeholder={t('admin.properties.userIdPlaceholder')}
                                            />
                                        </Form.Group>
                                        <Form.Group className="mb-3">
                                            <Form.Label>{t('labels.address')}</Form.Label>
                                            <Form.Control
                                                type="text"
                                                value={newProperty.address}
                                                onChange={(e) => setNewProperty({ ...newProperty, address: e.target.value })}
                                                placeholder={t('admin.properties.addressPlaceholder')}
                                            />
                                        </Form.Group>
                                        <Row>
                                            <Col md={6}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>{t('labels.area')}</Form.Label>
                                                    <Form.Control
                                                        type="number"
                                                        value={newProperty.area}
                                                        onChange={(e) => setNewProperty({ ...newProperty, area: e.target.value })}
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
                                                        onChange={(e) => setNewProperty({ ...newProperty, numberOfUnits: e.target.value })}
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
                                        {loading ? t('common.submitting') : t('admin.properties.saveButton')}
                                    </Button>
                                </Modal.Footer>
                            </Modal>

                            {activeTab === 'payments' && (
                                <div className="payments-section">
                                    <h3>{t('admin.payments.title')}</h3>
                                    <Table striped bordered hover responsive>
                                        <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>{t('labels.fullName')}</th>
                                            <th>{t('payment.types.water')}/{t('payment.types.arnona')}</th>
                                            <th>{t('payment.amount')}</th>
                                            <th>{t('payment.paymentStatus')}</th>
                                            <th>{t('labels.address')}</th>
                                            <th>{t('labels.area')}</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {payments.length > 0 ? (
                                            payments.map((payment, index) => (
                                                <tr key={payment.paymentId || index}>
                                                    <td>{index + 1}</td>
                                                    <td>{payment.userName || payment.user?.fullName || '--'}</td>
                                                    <td>{payment.paymentType === 'WATER' ? t('payment.types.water') : t('payment.types.arnona')}</td>
                                                    <td>{payment.amount ? payment.amount.toFixed(2) : '--'}</td>
                                                    <td>
                                                        <Badge bg={formatPaymentStatus(payment.status).variant}>
                                                            {formatPaymentStatus(payment.status).text}
                                                        </Badge>
                                                    </td>
                                                    <td>{payment.propertyAddress || payment.property?.address || '--'}</td>
                                                    <td>{payment.propertyUnits || payment.property?.area || '--'}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="7" className="text-center">{t('common.noData')}</td>
                                            </tr>
                                        )}
                                        </tbody>
                                    </Table>
                                </div>
                            )}
                            {activeTab === 'announcements' && (
                                <div className="announcements-section">
                                    <div className="d-flex justify-content-between align-items-center mb-4">
                                        <h3>{t('admin.announcements.title')}</h3>
                                        <Button variant="primary" onClick={() => setShowAnnouncementModal(true)}>
                                            <FiPlus /> {t('admin.actions.addAnnouncement')}
                                        </Button>
                                    </div>

                                    <Row>
                                        {announcements.map((announcement) => (
                                            <Col md={6} key={announcement.id} className="mb-3">
                                                <Card>
                                                    <Card.Body>
                                                        <Card.Title>{announcement.title}</Card.Title>
                                                        <Card.Text>{announcement.content}</Card.Text>
                                                        <small className="text-muted">
                                                            {t('common.created')}: {new Date(announcement.createdAt).toLocaleDateString()}
                                                        </small>
                                                        <div className="d-flex justify-content-between mt-2">
                                                            <Badge bg={announcement.active ? 'success' : 'secondary'}>
                                                                {announcement.active ? t('common.active') : t('common.inactive')}
                                                            </Badge>
                                                            <Button
                                                                variant="danger"
                                                                size="sm"
                                                                onClick={() => handleDeleteAnnouncement(announcement.id)}
                                                            >
                                                                <FiTrash2 /> {t('common.delete')}
                                                            </Button>
                                                        </div>
                                                    </Card.Body>
                                                </Card>
                                            </Col>
                                        ))}
                                    </Row>
                                </div>
                            )}
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
                                                                onClick={() => { setCurrentEvent(event); setShowImageModal(true); }}
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
                                                        <Button variant="warning" size="sm" onClick={() => handleEditEvent(event)}>
                                                            <FiEdit /> {t('common.edit')}
                                                        </Button>
                                                        <Button variant="danger" size="sm" onClick={() => handleDeleteEvent(event.id)}>
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

            {/* Edit Event Modal */}
            <Modal show={showEditEventModal} onHide={() => setShowEditEventModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>{t('admin.events.editTitle')}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>{t('admin.events.eventTitle')}</Form.Label>
                            <Form.Control type="text" value={newEvent.title} onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })} />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>{t('admin.events.description')}</Form.Label>
                            <Form.Control as="textarea" rows={3} value={newEvent.description} onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })} />
                        </Form.Group>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>{t('event.location')}</Form.Label>
                                    <Form.Control type="text" value={newEvent.location} onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })} />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>{t('event.date')}</Form.Label>
                                    <Form.Control type="date" value={newEvent.date} onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })} />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Form.Group className="mb-3">
                            <Form.Label>{t('admin.events.newImage')}</Form.Label>
                            <Form.Control type="file" onChange={(e) => setNewEvent({ ...newEvent, image: e.target.files[0] })} />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowEditEventModal(false)}>{t('common.close')}</Button>
                    <Button variant="primary" onClick={handleUpdateEvent} disabled={loading}>
                        {loading ? t('common.submitting') : t('admin.events.saveChanges')}
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Change Image Modal */}
            <Modal show={showImageModal} onHide={() => setShowImageModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>{t('admin.events.changeImage')}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {currentEvent?.imageUrl && (
                        <div className="text-center mb-3">
                            <img src={currentEvent.imageUrl} alt={t('admin.events.currentImage')} style={{ maxWidth: '100%', maxHeight: '300px' }} />
                        </div>
                    )}
                    <Form>
                        <Form.Group>
                            <Form.Label>{t('admin.events.selectNewImage')}</Form.Label>
                            <Form.Control type="file" onChange={(e) => setNewImage(e.target.files[0])} />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowImageModal(false)}>{t('common.close')}</Button>
                    <Button variant="primary" onClick={handleChangeImage} disabled={loading || !newImage}>
                        {loading ? t('common.submitting') : t('admin.events.changeImageButton')}
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Add Event Modal */}
            <Modal show={showEventModal} onHide={() => setShowEventModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>{t('admin.events.addTitle')}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>{t('admin.events.eventTitle')}</Form.Label>
                            <Form.Control type="text" value={newEvent.title} onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })} />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>{t('admin.events.description')}</Form.Label>
                            <Form.Control as="textarea" rows={3} value={newEvent.description} onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })} />
                        </Form.Group>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>{t('event.location')}</Form.Label>
                                    <Form.Control type="text" value={newEvent.location} onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })} />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>{t('event.date')}</Form.Label>
                                    <Form.Control type="date" value={newEvent.date} onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })} />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Form.Group className="mb-3">
                            <Form.Label>{t('admin.events.eventImage')}</Form.Label>
                            <Form.Control type="file" onChange={(e) => setNewEvent({ ...newEvent, image: e.target.files[0] })} />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowEventModal(false)}>{t('common.close')}</Button>
                    <Button variant="primary" onClick={handleAddEvent} disabled={loading}>
                        {loading ? t('common.submitting') : t('admin.events.saveEvent')}
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Generate Bills Modal */}
            <Modal show={showBillsModal} onHide={() => setShowBillsModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>
                        {currentBillType === 'ARNONA' ? t('admin.actions.generateArnona') : t('admin.actions.generateWater')}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {currentBillType === 'WATER' && (
                        <Alert variant="info" className="mb-4">
                            <strong>{t('payment.types.water')} – {t('common.description')}</strong>
                            <ul className="mb-0">
                                <li>{t('payment.unitPrice')}: 30 {t('general.currency')}</li>
                                <li>{t('payment.total')} = {t('payment.reading')} × 30</li>
                            </ul>
                        </Alert>
                    )}
                    {currentBillType === 'ARNONA' && (
                        <Alert variant="info" className="mb-4">
                            <strong>{t('payment.types.arnona')} – {t('common.description')}</strong>
                            <ul className="mb-0">
                                <li>{t('payment.unitPrice')}: 50 {t('general.currency')}</li>
                                <li>{t('payment.total')} = {t('labels.area')} × 50 </li>
                            </ul>
                        </Alert>
                    )}
                    <Table striped bordered hover responsive>
                        <thead>
                        <tr>
                            <th>#</th>
                            <th>{t('labels.fullName')}</th>
                            <th>{t('labels.address')}</th>
                            {currentBillType === 'WATER' && (
                                <>
                                    <th>{t('admin.actions.generateWater')} </th>
                                    <th>{t('payment.amount')}</th>
                                </>
                            )}
                            {currentBillType === 'ARNONA' && (
                                <>
                                    <th>{t('labels.area')} </th>
                                    <th>{t('payment.amount')}</th>
                                </>
                            )}
                        </tr>
                        </thead>
                        <tbody>
                        {(() => {
                            const flatProps = [];
                            users.forEach((user) => {
                                user.properties?.forEach((prop) => {
                                    const key = prop.id || prop.propertyId;
                                    flatProps.push({user, prop, key});
                                });
                            });

                            if (flatProps.length === 0) {
                                return (
                                    <tr>
                                        <td colSpan={currentBillType === 'WATER' ? 5 : 4}
                                            className="text-center text-danger">
                                            {t('admin.properties.noProperties')}
                                        </td>
                                    </tr>
                                );
                            }

                            return flatProps.map(({user, prop, key}, idx) => (
                                <tr key={key}>
                                    <td>{idx + 1}</td>
                                    <td>{user.fullName}</td>
                                    <td>{prop.address}</td>
                                    {currentBillType === 'WATER' && (
                                        <>
                                            <td>
                                                <Form.Control
                                                    type="number"
                                                    min="0"
                                                    value={waterReadings[key] ?? 15}
                                                    onChange={(e) => {
                                                        const val = Number(e.target.value);
                                                        setWaterReadings((prev) => ({
                                                            ...prev,
                                                            [key]: val,
                                                        }));
                                                    }}
                                                />
                                            </td>
                                            <td>{(waterReadings[key] ?? 15) * 30}</td>
                                        </>
                                    )}
                                    {currentBillType === 'ARNONA' && (
                                        <>
                                            <td>{prop.area}</td>
                                            <td>{(prop.area * 50).toFixed(2)}</td>
                                        </>
                                    )}
                                </tr>
                            ));
                        })()}
                        </tbody>
                    </Table>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowBillsModal(false)}>{t('common.close')}</Button>

                    {currentBillType === 'WATER' && (
                        <Button variant="outline-info" onClick={() => setWaterReadings(generateRandomWaterReadings())}
                                disabled={loading}>
                            <FiRefreshCw/> {t('common.refresh')}
                        </Button>
                    )}

                    <Button variant="primary" onClick={handleGenerateBills}
                            disabled={loading || users.filter(u => u.properties?.length > 0).length === 0}>
                        {loading ? t('common.submitting') : t('common.submit')}
                    </Button>
                </Modal.Footer>
            </Modal>
            <Modal show={showAnnouncementModal} onHide={() => setShowAnnouncementModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>{t('admin.announcements.addTitle')}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>{t('admin.announcements.title')}</Form.Label>
                            <Form.Control
                                type="text"
                                value={newAnnouncement.title}
                                onChange={(e) => setNewAnnouncement({...newAnnouncement, title: e.target.value})}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>{t('admin.announcements.content')}</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={newAnnouncement.content}
                                onChange={(e) => setNewAnnouncement({...newAnnouncement, content: e.target.value})}
                            />
                        </Form.Group>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>{t('admin.announcements.priority')}</Form.Label>
                                    <Form.Control
                                        type="number"
                                        min="0"
                                        value={newAnnouncement.priority}
                                        onChange={(e) => setNewAnnouncement({...newAnnouncement, priority: parseInt(e.target.value)})}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>{t('admin.announcements.expiresAt')}</Form.Label>
                                    <Form.Control
                                        type="datetime-local"
                                        value={newAnnouncement.expiresAt}
                                        onChange={(e) => setNewAnnouncement({...newAnnouncement, expiresAt: e.target.value})}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowAnnouncementModal(false)}>
                        {t('common.close')}
                    </Button>
                    <Button variant="primary" onClick={handleAddAnnouncement} disabled={loading}>
                        {loading ? t('common.submitting') : t('common.save')}
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default AdminGeneral;