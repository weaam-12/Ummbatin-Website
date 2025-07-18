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
import {
    generateWaterBills,
    generateArnonaBills,
    getAllUsers,
    getAllEvents,
    addNewEvent,
    getAllNews,
    getMonthlyBills
} from '../api';
import './AdminGenral.css';

const AdminGenral = () => {
    // States
    const [activeTab, setActiveTab] = useState('dashboard');
    const [users, setUsers] = useState([]);
    const [bills, setBills] = useState([]);
    const [events, setEvents] = useState([]);
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState(null);

    // Form states
    const [waterRate, setWaterRate] = useState(0);
    const [showWaterModal, setShowWaterModal] = useState(false);
    const [showArnonaModal, setShowArnonaModal] = useState(false);
    const [newEvent, setNewEvent] = useState({
        title: '',
        date: '',
        description: '',
        image: null
    });

    // Load data
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const [usersRes, billsRes, eventsRes, newsRes] = await Promise.all([
                    getAllUsers(),
                    getMonthlyBills(),
                    getAllEvents(),
                    getAllNews()
                ]);
                setUsers(usersRes);
                setBills(billsRes);
                setEvents(eventsRes);
                setNews(newsRes);
            } catch (error) {
                setNotification({ type: 'danger', message: 'فشل في تحميل البيانات' });
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    // Handlers
    const handleGenerateWaterBills = async () => {
        try {
            setLoading(true);
            await generateWaterBills(new Date().getMonth() + 1, new Date().getFullYear(), waterRate);
            const updatedBills = await getMonthlyBills();
            setBills(updatedBills);
            setNotification({ type: 'success', message: 'تم توليد فواتير المياه بنجاح' });
            setShowWaterModal(false);
        } catch (error) {
            setNotification({ type: 'danger', message: error.message || 'فشل في توليد الفواتير' });
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateArnonaBills = async () => {
        try {
            setLoading(true);
            await generateArnonaBills(new Date().getMonth() + 1, new Date().getFullYear());
            const updatedBills = await getMonthlyBills();
            setBills(updatedBills);
            setNotification({ type: 'success', message: 'تم توليد فواتير الأرنونا بنجاح' });
            setShowArnonaModal(false);
        } catch (error) {
            setNotification({ type: 'danger', message: error.message || 'فشل في توليد الفواتير' });
        } finally {
            setLoading(false);
        }
    };

    const handleAddEvent = async () => {
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
        } catch (error) {
            setNotification({ type: 'danger', message: error.message || 'فشل في إضافة الفعالية' });
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '--';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('ar-SA');
        } catch (e) {
            return '--';
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
                            className={activeTab === 'bills' ? 'active' : ''}
                            onClick={() => setActiveTab('bills')}
                        >
                            <FiDollarSign className="me-2" /> إدارة الفواتير
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
                                                    <h6>فواتير المياه هذا الشهر</h6>
                                                    <h3>
                                                        {bills.filter(b => b.waterAmount > 0).length}
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
                                                    <h6>فواتير الأرنونا هذا الشهر</h6>
                                                    <h3>
                                                        {bills.filter(b => b.arnonaAmount > 0).length}
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
                                                onClick={() => setShowWaterModal(true)}
                                            >
                                                <FiPlus className="me-2" /> توليد فواتير المياه
                                            </Button>

                                            <Button
                                                variant="success"
                                                className="w-100 mb-3"
                                                onClick={() => setShowArnonaModal(true)}
                                            >
                                                <FiPlus className="me-2" /> توليد فواتير الأرنونا
                                            </Button>

                                            <Button
                                                variant="info"
                                                className="w-100"
                                                onClick={() => setActiveTab('events')}
                                            >
                                                <FiActivity className="me-2" /> إضافة فعالية جديدة
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
                                            {news.slice(0, 3).map(item => (
                                                <div key={item.id} className="news-item mb-3">
                                                    <h6>{item.title}</h6>
                                                    <p className="text-muted small">{item.content.substring(0, 50)}...</p>
                                                    {item.emergency && (
                                                        <Badge bg="danger">طوارئ</Badge>
                                                    )}
                                                </div>
                                            ))}
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

                    {!loading && activeTab === 'bills' && (
                        <div className="bills-section">
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <h3>إدارة الفواتير الشهرية</h3>
                                <div>
                                    <Button
                                        variant="primary"
                                        className="me-2"
                                        onClick={() => setShowWaterModal(true)}
                                    >
                                        <FiPlus className="me-1" /> توليد فواتير المياه
                                    </Button>
                                    <Button
                                        variant="success"
                                        onClick={() => setShowArnonaModal(true)}
                                    >
                                        <FiPlus className="me-1" /> توليد فواتير الأرنونا
                                    </Button>
                                </div>
                            </div>

                            <Card>
                                <Card.Header>
                                    <h5>الفواتير الشهرية للمواطنين</h5>
                                </Card.Header>
                                <Card.Body>
                                    <Table striped hover responsive>
                                        <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>اسم المواطن</th>
                                            <th>فواتير المياه (شيكل)</th>
                                            <th>فواتير الأرنونا (شيكل)</th>
                                            <th>الشهر</th>
                                            <th>الحالة</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {bills.map((bill, index) => (
                                            <tr key={bill.id}>
                                                <td>{index + 1}</td>
                                                <td>{bill.user?.fullName || '--'}</td>
                                                <td>{bill.waterAmount || '--'}</td>
                                                <td>{bill.arnonaAmount || '--'}</td>
                                                <td>{`${bill.month}/${bill.year}`}</td>
                                                <td>
                                                    <Badge bg={bill.status === 'PAID' ? 'success' : 'warning'}>
                                                        {bill.status === 'PAID' ? 'تم الدفع' : 'قيد الانتظار'}
                                                    </Badge>
                                                </td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </Table>
                                </Card.Body>
                            </Card>
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

                            <Row>
                                {events.map(event => (
                                    <Col md={4} key={event.id} className="mb-4">
                                        <Card className="h-100">
                                            {event.image && (
                                                <Card.Img variant="top" src={event.image} />
                                            )}
                                            <Card.Body>
                                                <Card.Title>{event.title}</Card.Title>
                                                <Card.Subtitle className="mb-2 text-muted">
                                                    {formatDate(event.date)}
                                                </Card.Subtitle>
                                                <Card.Text>
                                                    {event.description.substring(0, 100)}...
                                                </Card.Text>
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
                                            onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label>تاريخ الفعالية</Form.Label>
                                        <Form.Control
                                            type="date"
                                            value={newEvent.date}
                                            onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
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

                                    <Form.Group className="mb-3">
                                        <Form.Label>صورة الفعالية</Form.Label>
                                        <Form.Control
                                            type="file"
                                            onChange={(e) => setNewEvent({...newEvent, image: e.target.files[0]})}
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
                                            حفظ الفعالية
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
                                        {news.map(item => (
                                            <tr key={item.id}>
                                                <td>{item.id}</td>
                                                <td>{item.title}</td>
                                                <td>{item.content.substring(0, 50)}...</td>
                                                <td>
                                                    {item.emergency ? (
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
                                </Card.Body>
                            </Card>
                        </div>
                    )}
                </Col>
            </Row>

            {/* Water Bills Modal */}
            <Modal show={showWaterModal} onHide={() => setShowWaterModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>توليد فواتير المياه</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group className="mb-3">
                        <Form.Label>سعر المتر المكعب (شيكل)</Form.Label>
                        <Form.Control
                            type="number"
                            value={waterRate}
                            onChange={(e) => setWaterRate(parseFloat(e.target.value))}
                        />
                    </Form.Group>
                    <Alert variant="info">
                        سيتم توليد فواتير المياه لجميع المواطنين المسجلين
                    </Alert>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowWaterModal(false)}>
                        إلغاء
                    </Button>
                    <Button variant="primary" onClick={handleGenerateWaterBills}>
                        {loading ? (
                            <Spinner animation="border" size="sm" />
                        ) : (
                            'توليد الفواتير'
                        )}
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Arnona Bills Modal */}
            <Modal show={showArnonaModal} onHide={() => setShowArnonaModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>توليد فواتير الأرنونا</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Alert variant="info">
                        سيتم توليد فواتير الأرنونا لجميع المواطنين المسجلين
                    </Alert>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowArnonaModal(false)}>
                        إلغاء
                    </Button>
                    <Button variant="primary" onClick={handleGenerateArnonaBills}>
                        {loading ? (
                            <Spinner animation="border" size="sm" />
                        ) : (
                            'توليد الفواتير'
                        )}
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default AdminGenral;