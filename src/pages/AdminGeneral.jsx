// AdminGeneral.jsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Container, Row, Col, Card, Button, Table, Modal,
    Alert, Spinner, Badge, Form
} from 'react-bootstrap';
import {
    FiUsers, FiDollarSign, FiPlus, FiCalendar,
    FiHome, FiFileText, FiDroplet, FiMapPin, FiActivity, FiImage,
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

    // Helper to close notification automatically
    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => setNotification(null), 4000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    /* ... باقي الدوال (handleEditEvent, handleDeleteEvent, handleUpdateEvent,
         generateRandomWaterReadings, handleOpenWaterBillsModal, handleChangeImage,
         handleAddProperty, fetchUsersWithProperties, fetchPayments, fetchEvents,
         handleAddEvent, handleGenerateBills, formatPaymentStatus)
         لم يتغيّر شيء فيها، لذلك أبقناها كما هي ... */

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

    const handleChangeImage = async () => { /* ... */ };
    const handleAddProperty = async () => { /* ... */ };
    const fetchUsersWithProperties = async () => { /* ... */ };
    const fetchPayments = async () => { /* ... */ };
    const fetchEvents = async () => { /* ... */ };
    const handleAddEvent = async () => { /* ... */ };
    const handleGenerateBills = async () => { /* ... */ };
    const formatPaymentStatus = (status) => { /* ... */ };

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
                setNotification({ type: 'danger', message: t('admin.general.loadError') });
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [activeTab, t]);

    /* باقي الـ return بدون أي تغيير إلا الجدول داخل Modal */
    return (
        <div className="admin-dashboard">
            {notification && (
                <Alert variant={notification.type} onClose={() => setNotification(null)} dismissible>
                    {notification.message}
                </Alert>
            )}

            <Row>
                <Col md={3} className="sidebar">
                    <div className="sidebar-header"><h4>{t('admin.general.title')}</h4></div>
                    <ul className="sidebar-menu">
                        <li className={activeTab === 'dashboard' ? 'active' : ''} onClick={() => setActiveTab('dashboard')}><FiHome /> {t('admin.menu.dashboard')}</li>
                        <li className={activeTab === 'payments' ? 'active' : ''} onClick={() => setActiveTab('payments')}><FiDollarSign /> {t('admin.menu.payments')}</li>
                        <li className={activeTab === 'events' ? 'active' : ''} onClick={() => setActiveTab('events')}><FiCalendar /> {t('admin.menu.events')}</li>
                    </ul>
                </Col>

                <Col md={9} className="main-content">
                    {loading ? (
                        <div className="text-center py-5"><Spinner animation="border" variant="primary" /><p className="mt-3">{t('common.loading')}</p></div>
                    ) : (
                        <>
                            {activeTab === 'dashboard' && (
                                <div className="dashboard-overview">
                                    <h3>{t('admin.dashboard.overview')}</h3>
                                    <Row className="mb-4">
                                        <Col md={4}><Card className="stat-card"><Card.Body><div className="d-flex justify-content-between align-items-center"><div><h6>{t('admin.dashboard.eventsCount')}</h6><h3>{events.length}</h3></div><FiUsers size={30} className="text-primary" /></div></Card.Body></Card></Col>
                                        <Col md={4}><Card className="stat-card"><Card.Body><div className="d-flex justify-content-between align-items-center"><div><h6>{t('admin.dashboard.waterBills')}</h6><h3>{payments.filter(p => p.paymentType === 'WATER').length}</h3></div><FiDroplet size={30} className="text-success" /></div></Card.Body></Card></Col>
                                        <Col md={4}><Card className="stat-card"><Card.Body><div className="d-flex justify-content-between align-items-center"><div><h6>{t('admin.dashboard.arnonaBills')}</h6><h3>{payments.filter(p => p.paymentType === 'ARNONA').length}</h3></div><FiFileText size={30} className="text-warning" /></div></Card.Body></Card></Col>
                                    </Row>
                                    <Row>
                                        <Col md={6}><Card className="mb-4"><Card.Header><h5>{t('admin.dashboard.quickActions')}</h5></Card.Header><Card.Body className="quick-actions">
                                            <Button variant="success" onClick={handleOpenWaterBillsModal}><FiPlus /> {t('admin.actions.generateWater')}</Button>
                                            <Button variant="info" onClick={() => { setCurrentBillType('ARNONA'); setShowBillsModal(true); }}><FiPlus /> {t('admin.actions.generateArnona')}</Button>
                                            <Button variant="primary" onClick={() => setShowEventModal(true)}><FiPlus /> {t('admin.actions.addEvent')}</Button>
                                            <Button variant="warning" onClick={() => setShowAddPropertyModal(true)}><FiMapPin /> {t('admin.actions.addProperty')}</Button>
                                        </Card.Body></Card></Col>
                                        <Col md={6}><Card><Card.Header><h5>{t('admin.dashboard.recentEvents')}</h5></Card.Header><Card.Body>{events.slice(0, 3).map(event => (<div key={event.id} className="mb-3"><h6>{event.title}</h6><small className="text-muted">{new Date(event.startDate).toLocaleDateString()} - {event.location}</small></div>))}</Card.Body></Card></Col>
                                    </Row>
                                </div>
                            )}

                            {/* باقي الـ Modals بدون تغيير */}
                            {/* ... */}

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
                                                <li>{t('payment.total')} = {t('labels.area')} × 50 × {t('labels.units')}</li>
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
                                                    <th>{t('admin.water.reading')}</th>
                                                    <th>{t('payment.amount')}</th>
                                                </>
                                            )}
                                            {currentBillType === 'ARNONA' && (
                                                <>
                                                    <th>{t('labels.area')} (م²)</th>
                                                    <th>{t('labels.units')}</th>
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
                                                    flatProps.push({ user, prop });
                                                });
                                            });

                                            if (flatProps.length === 0) {
                                                return (
                                                    <tr>
                                                        <td colSpan={currentBillType === 'WATER' ? 5 : 4} className="text-center text-danger">
                                                            {t('admin.properties.noProperties')}
                                                        </td>
                                                    </tr>
                                                );
                                            }

                                            return flatProps.map(({ user, prop }, idx) => (
                                                <tr key={`${user.id}-${prop.id}`}>
                                                    <td>{idx + 1}</td>
                                                    <td>{user.fullName}</td>
                                                    <td>{prop.address}</td>
                                                    {currentBillType === 'WATER' && (
                                                        <>
                                                            <td>
                                                                <Form.Control
                                                                    type="number"
                                                                    min="0"
                                                                    value={waterReadings[prop.id]?.reading ?? 15}
                                                                    onChange={(e) => {
                                                                        const val = Number(e.target.value);
                                                                        setWaterReadings((prev) => ({
                                                                            ...prev,
                                                                            [prop.id]: { userId: user.id, reading: val },
                                                                        }));
                                                                    }}
                                                                />
                                                            </td>
                                                            <td>{(waterReadings[prop.id]?.reading ?? 15) * 30}</td>
                                                        </>
                                                    )}
                                                    {currentBillType === 'ARNONA' && (
                                                        <>
                                                            <td>{prop.area}</td>
                                                            <td>{prop.numberOfUnits}</td>
                                                            <td>{(prop.area * 50 * prop.numberOfUnits).toFixed(2)}</td>
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
                                        <Button variant="outline-info" onClick={() => setWaterReadings(generateRandomWaterReadings())} disabled={loading}>
                                            <FiRefreshCw /> {t('common.refresh')}
                                        </Button>
                                    )}

                                    <Button variant="primary" onClick={handleGenerateBills} disabled={loading || users.filter(u => u.properties?.length > 0).length === 0}>
                                        {loading ? t('common.submitting') : t('common.submit')}
                                    </Button>
                                </Modal.Footer>
                            </Modal>
                        </>
                    )}
                </Col>
            </Row>
        </div>
    );
};

export default AdminGeneral;