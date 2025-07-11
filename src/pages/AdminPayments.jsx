import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import {
    Card,
    Table,
    Badge,
    Button,
    Modal,
    Form,
    Alert,
    Spinner,
    Container,
    Dropdown,
    Row,
    Col
} from 'react-bootstrap';
import {
    FiEdit,
    FiTrash2,
    FiDollarSign,
    FiFilter,
    FiRefreshCw,
    FiMoreVertical,
    FiPlus,
    FiCalendar,
    FiUser
} from 'react-icons/fi';
import './AdminPayments.css';
import axiosInstance from '../api.js';

const AdminPayments = () => {
    const { user } = useAuth();
    const [payments, setPayments] = useState([]);
    const [filteredPayments, setFilteredPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [paymentTypeFilter, setPaymentTypeFilter] = useState('ALL');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [showModal, setShowModal] = useState(false);
    const [currentPayment, setCurrentPayment] = useState(null);
    const [notification, setNotification] = useState(null);
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());

    // States for user and property management
    const [selectedUser, setSelectedUser] = useState(null);
    const [userProperties, setUserProperties] = useState([]);
    const [users, setUsers] = useState([]);
    const [showAddReadingModal, setShowAddReadingModal] = useState(false);
    const [newReading, setNewReading] = useState({
        propertyId: '',
        amount: '',
        date: new Date().toISOString().split('T')[0]
    });

    const paymentTypes = {
        WATER: 'مياه',
        ARNONA: 'أرنونا',
        KINDERGARTEN: 'حضانة',
        ALL: 'الكل'
    };

    const statusVariants = {
        PENDING: 'warning',
        PAID: 'success',
        COMPLETED: 'success',
        OVERDUE: 'danger',
        ALL: 'secondary'
    };

    const statusLabels = {
        PENDING: 'قيد الانتظار',
        PAID: 'تم الدفع',
        COMPLETED: 'مكتمل',
        OVERDUE: 'متأخر',
        ALL: 'الكل'
    };

    // Fetch users and their properties
    const fetchUsers = async () => {
        try {
            const response = await axiosInstance.get("/users/all");
            setUsers(response.data);
        } catch (error) {
            console.error('Error fetching users:', error);
            setNotification({
                type: 'danger',
                message: 'فشل في تحميل بيانات المستخدمين'
            });
        }
    };

    const fetchUserProperties = async (userId) => {
        try {
            const response = await axiosInstance.get(`/properties/user/${userId}`);
            setUserProperties(response.data);
        } catch (error) {
            console.error('Error fetching user properties:', error);
            setNotification({
                type: 'danger',
                message: 'فشل في تحميل عقارات المستخدم'
            });
        }
    };

    useEffect(() => {
        fetchUsers();
        loadPayments();
    }, [month, year]);

    useEffect(() => {
        applyFilters();
    }, [payments, paymentTypeFilter, statusFilter]);

    const loadPayments = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/payments/all', {
                params: { month, year, userId: selectedUser }
            });

            if (response.data && Array.isArray(response.data)) {
                setPayments(response.data);
            } else {
                setPayments([]);
                setNotification({
                    type: 'warning',
                    message: 'لا توجد بيانات متاحة'
                });
            }
        } catch (error) {
            console.error('Error loading payments:', error);
            setNotification({
                type: 'danger',
                message: error.response?.data?.message || 'فشل في تحميل بيانات الدفعات'
            });
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let result = [...payments];

        if (paymentTypeFilter !== 'ALL') {
            result = result.filter(p => p.type === paymentTypeFilter);
        }

        if (statusFilter !== 'ALL') {
            result = result.filter(p => p.status === statusFilter);
        }

        setFilteredPayments(result);
    };

    const generateWaterBills = async () => {
        if (!selectedUser) {
            setNotification({
                type: 'warning',
                message: 'الرجاء اختيار مستخدم أولاً'
            });
            return;
        }

        try {
            setLoading(true);
            const response = await axiosInstance.post('/payments/generate-water', null, {
                params: {
                    month,
                    year,
                    rate: 5,
                    userId: selectedUser
                }
            });

            if (response.data?.success) {
                setNotification({
                    type: 'success',
                    message: response.data.message || 'تم توليد فواتير المياه بنجاح'
                });
                await loadPayments();
            } else {
                setNotification({
                    type: 'danger',
                    message: response.data?.message || 'حدث خطأ غير متوقع'
                });
            }
        } catch (error) {
            console.error('Error generating water bills:', error);
            let errorMessage = 'فشل في توليد فواتير المياه';

            if (error.response?.data?.message) {
                errorMessage += `: ${error.response.data.message}`;
            }

            setNotification({
                type: 'danger',
                message: errorMessage
            });
        } finally {
            setLoading(false);
        }
    };

    const generateArnonaBills = async () => {
        if (!selectedUser) {
            setNotification({
                type: 'warning',
                message: 'الرجاء اختيار مستخدم أولاً'
            });
            return;
        }

        try {
            setLoading(true);
            await axiosInstance.post('/payments/generate-arnona', null, {
                params: {
                    month,
                    year,
                    userId: selectedUser
                }
            });
            await loadPayments();
            setNotification({
                type: 'success',
                message: 'تم توليد فواتير الأرنونا بنجاح'
            });
        } catch (error) {
            console.error('Error generating arnona bills:', error);
            setNotification({
                type: 'danger',
                message: error.response?.data?.message || 'فشل في توليد فواتير الأرنونا'
            });
        } finally {
            setLoading(false);
        }
    };

    const addWaterReading = async () => {
        try {
            await axiosInstance.post('/water-readings', {
                propertyId: parseInt(newReading.propertyId),
                amount: parseFloat(newReading.amount),
                date: newReading.date,
                approved: true,
                isManual: true
            });

            setNotification({
                type: 'success',
                message: 'تم إضافة قراءة المياه بنجاح'
            });
            setShowAddReadingModal(false);
            setNewReading({
                propertyId: '',
                amount: '',
                date: new Date().toISOString().split('T')[0]
            });
        } catch (error) {
            setNotification({
                type: 'danger',
                message: error.response?.data?.message || 'فشل في إضافة القراءة'
            });
        }
    };

    const handleUpdateFee = async (userId, feeType, newAmount) => {
        try {
            await axiosInstance.put('/payments/update-fee', null, {
                params: {
                    userId,
                    paymentType: feeType,
                    newAmount
                }
            });
            await loadPayments();
            setNotification({
                type: 'success',
                message: 'تم تحديث السعر بنجاح'
            });
        } catch (error) {
            console.error('Error updating fee:', error);
            setNotification({
                type: 'danger',
                message: error.response?.data?.message || 'فشل في تحديث السعر'
            });
        }
    };

    const updatePaymentStatus = async (paymentId, status) => {
        try {
            await axiosInstance.patch(`/payments/${paymentId}/status`, { status });
            await loadPayments();
            setNotification({
                type: 'success',
                message: 'تم تحديث حالة الدفع بنجاح'
            });
        } catch (error) {
            console.error('Error updating payment status:', error);
            setNotification({
                type: 'danger',
                message: error.response?.data?.message || 'فشل في تحديث حالة الدفع'
            });
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '--';
        const date = new Date(dateString);
        return date.toLocaleDateString('ar-SA');
    };

    return (
        <Container className="admin-payments-container py-4">
            <Card className="shadow-sm">
                <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center py-3">
                    <div className="d-flex align-items-center">
                        <FiDollarSign className="me-2" size={20} />
                        <h5 className="mb-0 fw-bold">إدارة الدفعات</h5>
                    </div>
                    <div className="d-flex align-items-center gap-3">
                        {/* User Selection */}
                        <Form.Select
                            size="sm"
                            value={selectedUser || ''}
                            onChange={(e) => {
                                const userId = e.target.value;
                                setSelectedUser(userId);
                                if (userId) fetchUserProperties(userId);
                            }}
                        >
                            <option value="">اختر مستخدم</option>
                            {users.map(user => (
                                <option key={user.userId} value={user.userId}>
                                    {user.fullName} (#{user.userId})
                                </option>
                            ))}
                        </Form.Select>

                        {/* Date Selection */}
                        <div className="d-flex align-items-center bg-white rounded px-2 py-1">
                            <FiCalendar className="me-2 text-primary" />
                            <Form.Select
                                size="sm"
                                className="border-0 shadow-none"
                                value={month}
                                onChange={(e) => setMonth(e.target.value)}
                            >
                                {Array.from({ length: 12 }, (_, i) => (
                                    <option key={i+1} value={i+1}>{i+1}</option>
                                ))}
                            </Form.Select>
                            <Form.Select
                                size="sm"
                                className="border-0 shadow-none"
                                value={year}
                                onChange={(e) => setYear(e.target.value)}
                            >
                                {Array.from({ length: 5 }, (_, i) => (
                                    <option key={i} value={new Date().getFullYear() - 2 + i}>
                                        {new Date().getFullYear() - 2 + i}
                                    </option>
                                ))}
                            </Form.Select>
                        </div>

                        {/* Filters */}
                        <Form.Select
                            size="sm"
                            value={paymentTypeFilter}
                            onChange={(e) => setPaymentTypeFilter(e.target.value)}
                            className="ms-2"
                        >
                            {Object.entries(paymentTypes).map(([key, value]) => (
                                <option key={key} value={key}>{value}</option>
                            ))}
                        </Form.Select>

                        <Form.Select
                            size="sm"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="ms-2"
                        >
                            {Object.entries(statusLabels).map(([key, value]) => (
                                <option key={key} value={key}>{value}</option>
                            ))}
                        </Form.Select>

                        <Button
                            variant="light"
                            className="me-2"
                            onClick={loadPayments}
                            disabled={loading}
                        >
                            <FiRefreshCw className={`me-1 ${loading ? 'spin' : ''}`} />
                            تحديث
                        </Button>

                        <Dropdown>
                            <Dropdown.Toggle variant="success" id="dropdown-generate">
                                <FiPlus className="me-1" /> توليد فواتير
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                                <Dropdown.Item
                                    onClick={generateWaterBills}
                                    disabled={!selectedUser}
                                >
                                    فواتير المياه
                                </Dropdown.Item>
                                <Dropdown.Item
                                    onClick={() => {
                                        if (!selectedUser) {
                                            setNotification({
                                                type: 'warning',
                                                message: 'الرجاء اختيار مستخدم أولاً'
                                            });
                                            return;
                                        }
                                        if (userProperties.length === 0) {
                                            setNotification({
                                                type: 'warning',
                                                message: 'لا توجد عقارات متاحة لهذا المستخدم'
                                            });
                                            return;
                                        }
                                        setShowAddReadingModal(true);
                                    }}
                                    disabled={!selectedUser || userProperties.length === 0}
                                >
                                    <FiPlus className="me-2" /> إضافة قراءة مياه
                                </Dropdown.Item>
                                <Dropdown.Item
                                    onClick={generateArnonaBills}
                                    disabled={!selectedUser}
                                >
                                    فواتير الأرنونا
                                </Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                    </div>
                </Card.Header>

                <Card.Body>
                    {notification && (
                        <Alert
                            variant={notification.type}
                            onClose={() => setNotification(null)}
                            dismissible
                            className="mb-3"
                        >
                            {notification.message}
                        </Alert>
                    )}

                    {loading ? (
                        <div className="text-center py-5">
                            <Spinner animation="border" variant="primary" />
                            <p className="mt-3 text-muted">جاري تحميل بيانات الدفعات...</p>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <Table hover className="mb-0">
                                <thead className="table-light">
                                <tr>
                                    <th>رقم المستخدم</th>
                                    <th>اسم المستخدم</th>
                                    <th>نوع الدفع</th>
                                    <th>المبلغ</th>
                                    <th>تاريخ الاستحقاق</th>
                                    <th>الحالة</th>
                                    <th>تاريخ الدفع</th>
                                    <th>الإجراءات</th>
                                </tr>
                                </thead>
                                <tbody>
                                {filteredPayments.length > 0 ? (
                                    filteredPayments.map(payment => (
                                        <tr key={`payment-${payment.paymentId}`}>
                                            <td>#{payment.userId}</td>
                                            <td>{payment.userName}</td>
                                            <td>{paymentTypes[payment.type]}</td>
                                            <td>{payment.amount} شيكل</td>
                                            <td>{formatDate(payment.dueDate)}</td>
                                            <td>
                                                <Badge
                                                    pill
                                                    bg={statusVariants[payment.status]}
                                                    className="px-3 py-1"
                                                >
                                                    {statusLabels[payment.status]}
                                                </Badge>
                                            </td>
                                            <td>{formatDate(payment.paymentDate)}</td>
                                            <td>
                                                <Dropdown>
                                                    <Dropdown.Toggle variant="link" className="p-0 text-dark">
                                                        <FiMoreVertical />
                                                    </Dropdown.Toggle>
                                                    <Dropdown.Menu>
                                                        <Dropdown.Item
                                                            onClick={() => {
                                                                setCurrentPayment(payment);
                                                                setShowModal(true);
                                                            }}
                                                        >
                                                            <FiEdit className="me-2" /> تعديل السعر
                                                        </Dropdown.Item>
                                                        {payment.status === 'PENDING' && (
                                                            <Dropdown.Item
                                                                onClick={() => updatePaymentStatus(payment.paymentId, 'COMPLETED')}
                                                            >
                                                                <FiEdit className="me-2" /> تعيين كمكتمل
                                                            </Dropdown.Item>
                                                        )}
                                                    </Dropdown.Menu>
                                                </Dropdown>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="8" className="text-center py-4">
                                            <div className="d-flex flex-column align-items-center text-muted">
                                                <FiDollarSign size={48} className="mb-2 opacity-50" />
                                                لا توجد دفعات لعرضها
                                            </div>
                                        </td>
                                    </tr>
                                )}
                                </tbody>
                            </Table>
                        </div>
                    )}
                </Card.Body>
            </Card>

            {/* Modal لتعديل السعر */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton className="border-0 pb-0">
                    <Modal.Title className="fw-bold">
                        <FiEdit className="me-2" />
                        تعديل سعر {currentPayment && paymentTypes[currentPayment.type]}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group className="mb-3">
                        <Form.Label className="fw-bold">المبلغ الجديد (شيكل)</Form.Label>
                        <Form.Control
                            type="number"
                            value={currentPayment?.amount || ''}
                            onChange={(e) => setCurrentPayment({
                                ...currentPayment,
                                amount: e.target.value
                            })}
                            placeholder="أدخل المبلغ الجديد"
                        />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer className="border-0">
                    <Button
                        variant="outline-secondary"
                        onClick={() => setShowModal(false)}
                    >
                        إلغاء
                    </Button>
                    <Button
                        variant="primary"
                        onClick={() => {
                            handleUpdateFee(
                                currentPayment?.userId,
                                currentPayment?.type,
                                currentPayment?.amount
                            );
                            setShowModal(false);
                        }}
                    >
                        حفظ التغييرات
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Modal لإضافة قراءة مياه */}
            <Modal show={showAddReadingModal} onHide={() => setShowAddReadingModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>إضافة قراءة مياه جديدة</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group className="mb-3">
                        <Form.Label>اختر العقار</Form.Label>
                        <Form.Select
                            value={newReading.propertyId}
                            onChange={(e) => setNewReading({...newReading, propertyId: e.target.value})}
                        >
                            <option value="">اختر عقار</option>
                            {userProperties.map(property => (
                                <option key={property.propertyId} value={property.propertyId}>
                                    العقار #{property.propertyId} - {property.address}
                                </option>
                            ))}
                        </Form.Select>
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>كمية الاستهلاك (متر مكعب)</Form.Label>
                        <Form.Control
                            type="number"
                            step="0.01"
                            value={newReading.amount}
                            onChange={(e) => setNewReading({...newReading, amount: e.target.value})}
                            placeholder="أدخل كمية الاستهلاك"
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
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowAddReadingModal(false)}>
                        إلغاء
                    </Button>
                    <Button
                        variant="primary"
                        onClick={addWaterReading}
                        disabled={!newReading.propertyId || !newReading.amount}
                    >
                        حفظ
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default AdminPayments;