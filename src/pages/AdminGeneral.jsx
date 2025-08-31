import React, { useEffect, useState } from 'react';
import { Table, Button, Badge, Modal, Form, Alert } from 'react-bootstrap';
import axiosInstance from '../axiosInstance';
import { useTranslation } from 'react-i18next';

const AdminGeneral = () => {
    const { t } = useTranslation();

    const [users, setUsers] = useState([]);
    const [payments, setPayments] = useState([]);
    const [events, setEvents] = useState([]);
    const [announcements, setAnnouncements] = useState([]);

    const [showBillsModal, setShowBillsModal] = useState(false);
    const [currentBillType, setCurrentBillType] = useState('');
    const [waterReadings, setWaterReadings] = useState({});
    const [newEvent, setNewEvent] = useState({});
    const [newAnnouncement, setNewAnnouncement] = useState({});
    const [notification, setNotification] = useState(null);

    // ✅ הוספתי state חסר
    const [currentEvent, setCurrentEvent] = useState(null);

    useEffect(() => {
        fetchUsers();
        fetchPayments();
        fetchEvents();
        fetchAnnouncements();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await axiosInstance.get('api/users/all');
            setUsers(response.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchPayments = async () => {
        try {
            const response = await axiosInstance.get('api/payments/all');
            setPayments(response.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchEvents = async () => {
        try {
            const response = await axiosInstance.get('api/events/all');
            setEvents(response.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchAnnouncements = async () => {
        try {
            const response = await axiosInstance.get('api/announcements/all');
            setAnnouncements(response.data);
        } catch (err) {
            console.error(err);
        }
    };

    // ✅ פונקציה חסרה
    const formatPaymentStatus = (status) => {
        switch (status) {
            case 'PAID':
                return { variant: 'success', text: t('payment.statusPaid') };
            case 'PENDING':
                return { variant: 'warning', text: t('payment.statusPending') };
            case 'FAILED':
                return { variant: 'danger', text: t('payment.statusFailed') };
            default:
                return { variant: 'secondary', text: status };
        }
    };

    const handleGenerateBills = async (type) => {
        setCurrentBillType(type);
        if (type === 'WATER') {
            const readings = generateRandomWaterReadings();
            setWaterReadings(readings);
        }
        setShowBillsModal(true);
    };

    const generateRandomWaterReadings = () => {
        const readings = {};
        users.forEach((user) => {
            user.properties?.forEach((prop) => {
                readings[prop.id] = Math.floor(Math.random() * 100) + 1;
            });
        });
        return readings;
    };

    const handleConfirmBills = async () => {
        try {
            let billsData = [];
            if (currentBillType === 'WATER') {
                billsData = users.flatMap((user) =>
                    user.properties?.map((prop) => ({
                        user_id: user.id,
                        property_id: prop.id,
                        type: 'WATER',
                        amount: (waterReadings[prop.id] ?? 0) * 30,
                        date: new Date().toISOString().slice(0, 10),
                        status: 'PENDING',
                    })) || []
                );
                await axiosInstance.post('api/payments/generate-custom-water', billsData);

                // ✅ תיקון Template string
                setNotification({
                    type: 'success',
                    message: `${t('admin.payments.waterSuccess')} (${billsData.length})`,
                });
            } else {
                billsData = users.flatMap((user) =>
                    user.properties?.map((prop) => ({
                        user_id: user.id,
                        property_id: prop.id,
                        type: 'ARNONA',
                        amount: prop.area * 50,
                        date: new Date().toISOString().slice(0, 10),
                        status: 'PENDING',
                    })) || []
                );
                await axiosInstance.post('api/payments/generate-custom-arnona', billsData);

                setNotification({
                    type: 'success',
                    message: `${t('admin.payments.arnonaSuccess')} (${billsData.length})`,
                });
            }

            fetchPayments();
            setShowBillsModal(false);
        } catch (err) {
            console.error(err);
            setNotification({ type: 'danger', message: t('admin.payments.error') });
        }
    };

    // דוגמאות בסיסיות כדי לא להתרסק
    const handleAddEvent = async () => {
        console.log('Add Event', newEvent);
    };
    const handleEditEvent = async (event) => {
        console.log('Edit Event', event);
    };
    const handleDeleteEvent = async (eventId) => {
        console.log('Delete Event', eventId);
    };

    return (
        <div className="container mt-4">
            <h2>{t('admin.general.title')}</h2>

            {/* 🔔 Notification */}
            {notification && <Alert variant={notification.type}>{notification.message}</Alert>}

            {/* Payments Section */}
            <section>
                <h4>{t('admin.payments.title')}</h4>
                <Button onClick={() => handleGenerateBills('WATER')}>
                    {t('admin.payments.generateWater')}
                </Button>{' '}
                <Button onClick={() => handleGenerateBills('ARNONA')}>
                    {t('admin.payments.generateArnona')}
                </Button>

                <Table striped bordered hover responsive className="mt-3">
                    <thead>
                    <tr>
                        <th>{t('common.user')}</th>
                        <th>{t('common.type')}</th>
                        <th>{t('common.amount')}</th>
                        <th>{t('common.date')}</th>
                        <th>{t('common.status')}</th>
                    </tr>
                    </thead>
                    <tbody>
                    {payments.map((p) => (
                        <tr key={p.id}>
                            <td>{p.user?.username || p.user_id}</td>
                            <td>{t(`payment.types.${p.type.toLowerCase()}`)}</td>
                            <td>{p.amount}</td>
                            <td>{p.date}</td>
                            <td>
                                <Badge bg={formatPaymentStatus(p.status).variant}>
                                    {formatPaymentStatus(p.status).text}
                                </Badge>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </Table>
            </section>

            {/* Bills Modal */}
            <Modal show={showBillsModal} onHide={() => setShowBillsModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>{t('admin.payments.preview')}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {currentBillType === 'WATER' && (
                        <Alert variant="info">
                            <strong>{t('payment.types.water')}</strong>
                            <ul>
                                <li>מחיר למ"ק מים: 30 ש"ח</li>
                                <li>סכום = קריאת מים × 30</li>
                            </ul>
                        </Alert>
                    )}
                    {currentBillType === 'ARNONA' && (
                        <Alert variant="info">
                            <strong>{t('payment.types.arnona')}</strong>
                            <ul>
                                <li>מחיר למ"ר: 50 ש"ח</li>
                                <li>סכום = שטח × 50</li>
                            </ul>
                        </Alert>
                    )}

                    <Table striped bordered hover responsive>
                        <thead>
                        <tr>
                            <th>{t('common.user')}</th>
                            <th>{t('common.property')}</th>
                            {currentBillType === 'WATER' && <th>{t('admin.payments.reading')}</th>}
                            {currentBillType === 'ARNONA' && <th>{t('common.area')}</th>}
                            <th>{t('common.amount')}</th>
                        </tr>
                        </thead>
                        <tbody>
                        {users.map((user) =>
                            user.properties?.map((prop) => (
                                <tr key={prop.id}>
                                    <td>{user.username}</td>
                                    <td>{prop.name}</td>
                                    {currentBillType === 'WATER' && (
                                        <>
                                            <td>
                                                <Form.Control
                                                    type="number"
                                                    min="0"
                                                    value={waterReadings[prop.id] ?? 0}
                                                    onChange={(e) => {
                                                        const val = Number(e.target.value);
                                                        setWaterReadings((prev) => ({ ...prev, [prop.id]: val }));
                                                    }}
                                                />
                                            </td>
                                            <td>{(waterReadings[prop.id] ?? 0) * 30}</td>
                                        </>
                                    )}
                                    {currentBillType === 'ARNONA' && (
                                        <>
                                            <td>{prop.area}</td>
                                            <td>{prop.area * 50}</td>
                                        </>
                                    )}
                                </tr>
                            ))
                        )}
                        </tbody>
                    </Table>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowBillsModal(false)}>
                        {t('common.cancel')}
                    </Button>
                    <Button variant="primary" onClick={handleConfirmBills}>
                        {t('common.confirm')}
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Events Section */}
            <section className="mt-5">
                <h4>{t('admin.events.title')}</h4>
                <Button onClick={() => handleAddEvent()}>{t('admin.events.add')}</Button>
                <Table striped bordered hover responsive className="mt-3">
                    <thead>
                    <tr>
                        <th>{t('common.title')}</th>
                        <th>{t('common.date')}</th>
                        <th>{t('common.description')}</th>
                        <th>{t('common.image')}</th>
                        <th>{t('common.actions')}</th>
                    </tr>
                    </thead>
                    <tbody>
                    {events.map((e) => (
                        <tr key={e.id}>
                            <td>{e.title}</td>
                            <td>{e.date}</td>
                            <td>{e.description}</td>
                            <td>
                                {e.image && (
                                    <img
                                        src={e.image}
                                        alt="event"
                                        style={{ width: '100px', cursor: 'pointer' }}
                                        onClick={() => {
                                            setCurrentEvent(e);
                                        }}
                                    />
                                )}
                            </td>
                            <td>
                                <Button size="sm" onClick={() => handleEditEvent(e)}>
                                    {t('common.edit')}
                                </Button>{' '}
                                <Button size="sm" variant="danger" onClick={() => handleDeleteEvent(e.id)}>
                                    {t('common.delete')}
                                </Button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </Table>
            </section>

            {/* Announcements Section */}
            <section className="mt-5">
                <h4>{t('admin.announcements.title')}</h4>
                <Button onClick={() => setNewAnnouncement({})}>
                    {t('admin.announcements.add')}
                </Button>
                <Table striped bordered hover responsive className="mt-3">
                    <thead>
                    <tr>
                        <th>{t('common.title')}</th>
                        <th>{t('common.message')}</th>
                        <th>{t('common.date')}</th>
                        <th>{t('common.active')}</th>
                        <th>{t('common.actions')}</th>
                    </tr>
                    </thead>
                    <tbody>
                    {announcements.map((a) => (
                        <tr key={a.id}>
                            <td>{a.title}</td>
                            <td>{a.message}</td>
                            <td>{a.date}</td>
                            <td>
                                <Badge bg={a.active ? 'success' : 'secondary'}>
                                    {a.active ? t('common.active') : t('common.inactive')}
                                </Badge>
                            </td>
                            <td>
                                <Button size="sm" onClick={() => setNewAnnouncement(a)}>
                                    {t('common.edit')}
                                </Button>{' '}
                                <Button size="sm" variant="danger" onClick={() => console.log('Delete announcement', a.id)}>
                                    {t('common.delete')}
                                </Button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </Table>
            </section>
        </div>
    );
};

export default AdminGeneral;
