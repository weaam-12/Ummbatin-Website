import React, { useState, useEffect } from 'react';
import {
    Container, Row, Col, Card, Button, Table, Modal,
    Alert, Spinner, Badge, Form
} from 'react-bootstrap';
import {
    FiUsers, FiDollarSign, FiPlus, FiDroplet, FiHome
} from 'react-icons/fi';
import {
    axiosInstance,
    getWaterReadings,
    addWaterReading,
    addArnonaPayment
} from '../api.js';
import './AdminGeneral.css';

const AdminGeneral = () => {
    // States الأساسية
    const [activeTab, setActiveTab] = useState('dashboard');
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState(null);

    // States للبيانات
    const [users, setUsers] = useState([]);
    const [payments, setPayments] = useState([]);
    const [properties, setProperties] = useState([]);
    const [waterReadings, setWaterReadings] = useState([]);

    // States للنماذج
    const [showWaterModal, setShowWaterModal] = useState(false);
    const [showArnonaModal, setShowArnonaModal] = useState(false);
    const [showBillsModal, setShowBillsModal] = useState(false);

    const [waterForm, setWaterForm] = useState({
        propertyId: '',
        amount: '',
        date: new Date().toISOString().split('T')[0]
    });

    const [arnonaForm, setArnonaForm] = useState({
        userId: '',
        amount: '',
        year: new Date().getFullYear()
    });

    // دوال جلب البيانات
    const fetchData = async () => {
        setLoading(true);
        try {
            const [usersRes, paymentsRes, propertiesRes, readingsRes] = await Promise.all([
                axiosInstance.get('api/users/all'),
                axiosInstance.get('api/payments/current-month'),
                axiosInstance.get('api/properties/all'),
                getWaterReadings()
            ]);

            setUsers(usersRes.data);
            setPayments(paymentsRes.data);
            setProperties(propertiesRes.data);
            setWaterReadings(readingsRes);
        } catch (error) {
            setNotification({ type: 'danger', message: 'فشل في تحميل البيانات' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // دوال الإضافة
    const handleAddWaterReading = async () => {
        try {
            setLoading(true);
            await addWaterReading(
                waterForm.propertyId,
                waterForm.amount,
                waterForm.date
            );
            await fetchData();
            setShowWaterModal(false);
            setNotification({ type: 'success', message: 'تمت إضافة قراءة المياه بنجاح' });
        } catch (error) {
            setNotification({ type: 'danger', message: 'فشل في إضافة القراءة' });
        } finally {
            setLoading(false);
        }
    };

    const handleAddArnona = async () => {
        try {
            setLoading(true);
            await addArnonaPayment(
                arnonaForm.userId,
                arnonaForm.amount,
                arnonaForm.year
            );
            await fetchData();
            setShowArnonaModal(false);
            setNotification({ type: 'success', message: 'تمت إضافة الأرنونا بنجاح' });
        } catch (error) {
            setNotification({ type: 'danger', message: 'فشل في إضافة الأرنونا' });
        } finally {
            setLoading(false);
        }
    };
    // ===================== توليد الفواتير =====================
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
                            <FiHome className="me-2" /> لوحة التحكم
                        </li>
                        <li className={activeTab === 'water' ? 'active' : ''}
                            onClick={() => setActiveTab('water')}>
                            <FiDroplet className="me-2" /> قراءات المياه
                        </li>
                        <li className={activeTab === 'arnona' ? 'active' : ''}
                            onClick={() => setActiveTab('arnona')}>
                            <FiFileText className="me-2" /> إدارة الأرنونا
                        </li>
                        <li className={activeTab === 'payments' ? 'active' : ''}
                            onClick={() => setActiveTab('payments')}>
                            <FiDollarSign className="me-2" /> الفواتير
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
                                                            <h6>قراءات المياه</h6>
                                                            <h3>{waterReadings.length}</h3>
                                                        </div>
                                                        <FiDroplet size={30} className="text-info" />
                                                    </div>
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                        <Col md={4}>
                                            <Card className="stat-card">
                                                <Card.Body>
                                                    <div className="d-flex justify-content-between align-items-center">
                                                        <div>
                                                            <h6>الفواتير</h6>
                                                            <h3>{payments.length}</h3>
                                                        </div>
                                                        <FiDollarSign size={30} className="text-success" />
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
                                                    <Button variant="info" className="w-100 mb-3"
                                                            onClick={() => setShowWaterModal(true)}>
                                                        <FiPlus className="me-2" /> إضافة قراءة مياه
                                                    </Button>
                                                    <Button variant="warning" className="w-100 mb-3"
                                                            onClick={() => setShowArnonaModal(true)}>
                                                        <FiPlus className="me-2" /> إضافة أرنونا
                                                    </Button>
                                                    <Button variant="success" className="w-100"
                                                            onClick={() => { setCurrentBillType('WATER'); setShowBillsModal(true); }}>
                                                        <FiPlus className="me-2" /> توليد فواتير
                                                    </Button>
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                    </Row>
                                </div>
                            )}

                            {/* إدارة قراءات المياه */}
                            {activeTab === 'water' && (
                                <div className="water-section">
                                    <div className="d-flex justify-content-between align-items-center mb-4">
                                        <h3>إدارة قراءات المياه</h3>
                                        <Button variant="primary" onClick={() => setShowWaterModal(true)}>
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
                                                    <td>{user?.fullName || '--'}</td>
                                                </tr>
                                            );
                                        })}
                                        </tbody>
                                    </Table>
                                </div>
                            )}

                            {/* إدارة الأرنونا */}
                            {activeTab === 'arnona' && (
                                <div className="arnona-section">
                                    <div className="d-flex justify-content-between align-items-center mb-4">
                                        <h3>إدارة الأرنونا</h3>
                                        <Button variant="primary" onClick={() => setShowArnonaModal(true)}>
                                            <FiPlus className="me-2" /> إضافة أرنونا جديدة
                                        </Button>
                                    </div>
                                    <Table striped bordered hover>
                                        <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>اسم المستخدم</th>
                                            <th>المبلغ</th>
                                            <th>السنة</th>
                                            <th>حالة الدفع</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {payments
                                            .filter(p => p.paymentType === 'ARNONA')
                                            .map((payment, index) => {
                                                const user = users.find(u => u.userId === payment.userId);
                                                return (
                                                    <tr key={payment.paymentId}>
                                                        <td>{index + 1}</td>
                                                        <td>{user?.fullName || '--'}</td>
                                                        <td>{payment.amount} شيكل</td>
                                                        <td>{new Date(payment.createdAt).getFullYear()}</td>
                                                        <td>
                                                            <Badge bg={formatPaymentStatus(payment.status).variant}>
                                                                {formatPaymentStatus(payment.status).text}
                                                            </Badge>
                                                        </td>
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
                                    <h3 className="mb-4">إدارة الفواتير</h3>
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
                                                    <th>التاريخ</th>
                                                </tr>
                                                </thead>
                                                <tbody>
                                                {payments.map((payment, index) => {
                                                    const user = users.find(u => u.userId === payment.userId);
                                                    return (
                                                        <tr key={payment.paymentId}>
                                                            <td>{index + 1}</td>
                                                            <td>{payment.paymentType === 'WATER' ? 'مياه' : 'أرنونا'}</td>
                                                            <td>{user?.fullName || '--'}</td>
                                                            <td>{payment.amount} شيكل</td>
                                                            <td>
                                                                <Badge bg={formatPaymentStatus(payment.status).variant}>
                                                                    {formatPaymentStatus(payment.status).text}
                                                                </Badge>
                                                            </td>
                                                            <td>{new Date(payment.createdAt).toLocaleDateString()}</td>
                                                        </tr>
                                                    );
                                                })}
                                                </tbody>
                                            </Table>
                                        </Tab>
                                    </Tabs>
                                </div>
                            )}
                        </>
                    )}
                </Col>
            </Row>

            {/* مودال إضافة قراءة مياه */}
            <Modal show={showWaterModal} onHide={() => setShowWaterModal(false)}>
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
                    <Button variant="secondary" onClick={() => setShowWaterModal(false)}>
                        إلغاء
                    </Button>
                    <Button variant="primary" onClick={handleAddWaterReading} disabled={loading}>
                        {loading ? 'جاري الحفظ...' : 'حفظ القراءة'}
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* مودال إضافة الأرنونا */}
            <Modal show={showArnonaModal} onHide={() => setShowArnonaModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>إضافة أرنونا للمستخدم</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>اختر المستخدم</Form.Label>
                            <Form.Select
                                value={arnonaData.userId}
                                onChange={(e) => setArnonaData({...arnonaData, userId: e.target.value})}
                            >
                                <option value="">اختر المستخدم</option>
                                {users.map(user => (
                                    <option key={user.userId} value={user.userId}>
                                        {user.fullName} - {user.email}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>المبلغ (شيكل)</Form.Label>
                            <Form.Control
                                type="number"
                                step="0.01"
                                value={arnonaData.amount}
                                onChange={(e) => setArnonaData({...arnonaData, amount: e.target.value})}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>السنة</Form.Label>
                            <Form.Control
                                type="number"
                                value={arnonaData.year}
                                onChange={(e) => setArnonaData({...arnonaData, year: e.target.value})}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowArnonaModal(false)}>
                        إلغاء
                    </Button>
                    <Button variant="primary" onClick={handleAddArnona} disabled={loading}>
                        {loading ? 'جاري الحفظ...' : 'حفظ الأرنونا'}
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
                            ? 'سيتم توليد فواتير الأرنونا لجميع المستخدمين'
                            : 'سيتم توليد فواتير المياه لجميع العقارات'}
                    </p>
                    <Table striped bordered hover>
                        <thead>
                        <tr>
                            <th>#</th>
                            <th>اسم المستخدم</th>
                            {currentBillType === 'WATER' && <th>عنوان العقار</th>}
                            <th>{currentBillType === 'WATER' ? 'آخر قراءة' : 'المبلغ'}</th>
                        </tr>
                        </thead>
                        <tbody>
                        {currentBillType === 'WATER' ? (
                            properties.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="text-center text-danger">
                                        لا يوجد عقارات مسجلة
                                    </td>
                                </tr>
                            ) : (
                                properties.map((property, idx) => {
                                    const owner = users.find(u => u.userId === property.userId);
                                    const lastReading = waterReadings
                                        .filter(r => r.propertyId === property.propertyId)
                                        .sort((a, b) => new Date(b.date) - new Date(a.date))[0];

                                    return (
                                        <tr key={property.propertyId}>
                                            <td>{idx + 1}</td>
                                            <td>{owner?.fullName || '--'}</td>
                                            <td>{property.address}</td>
                                            <td>{lastReading ? `${lastReading.amount} م³` : '--'}</td>
                                        </tr>
                                    );
                                })
                            )
                        ) : (
                            users.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="text-center text-danger">
                                        لا يوجد مستخدمين مسجلين
                                    </td>
                                </tr>
                            ) : (
                                users.map((user, idx) => (
                                    <tr key={user.userId}>
                                        <td>{idx + 1}</td>
                                        <td>{user.fullName}</td>
                                        <td>حسب المساحة والوحدات</td>
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
                        ) : 'توليد الفواتير'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default AdminGeneral;