import React, { useState, useEffect } from 'react';
import {
    Card,
    Table,
    Badge,
    Button,
    Form,
    Alert,
    Spinner,
    Container
} from 'react-bootstrap';
import {
    FiDollarSign,
    FiCalendar,
    FiRefreshCw
} from 'react-icons/fi';
import './AdminPayments.css';
import {
    getAllPayments,
    getAllUsers
} from '../api';

const AdminPayments = () => {
    const [payments, setPayments] = useState([]);
    const [filteredPayments, setFilteredPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [paymentTypeFilter, setPaymentTypeFilter] = useState('ALL');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());
    const [selectedUser, setSelectedUser] = useState(null);
    const [users, setUsers] = useState([]);
    const [notification, setNotification] = useState(null);

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

    const formatDate = (dateValue) => {
        if (!dateValue) return '--';

        try {
            // إذا كانت القيمة كائن تاريخ
            if (typeof dateValue === 'object' && dateValue !== null) {
                if (dateValue.toLocaleDateString) {
                    return dateValue.toLocaleDateString('ar-SA');
                }
                return '--';
            }

            // إذا كانت سلسلة نصية
            const dateStr = String(dateValue).endsWith('Z') ? dateValue : dateValue + 'Z';
            const date = new Date(dateStr);
            return isNaN(date.getTime()) ? '--' : date.toLocaleDateString('ar-SA');
        } catch (e) {
            console.error('Error fetching users:', e);

            return '--';
        }
    };

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await getAllUsers();
                setUsers(response);
            } catch (error) {
                console.error('Error fetching users:', error);
                setNotification({
                    type: 'danger',
                    message: 'فشل في تحميل المستخدمين'
                });
            }
        };

        fetchUsers();
    }, []);

    useEffect(() => {
        const loadPayments = async () => {
            setLoading(true);
            try {
                const data = await getAllPayments(month, year, selectedUser);
                const enhanced = data.map((p) => ({
                    ...p,
                    // توحيد أسماء الحقول
                    paymentId: p.payment_id || p.paymentId,
                    userId: p.user_id || p.userId,
                    paymentType: p.type || p.paymentType,
                    paymentDate: p.payment_date || p.paymentDate,
                    // البحث عن اسم المستخدم إذا لم يكن موجوداً
                    fullName: p.fullName || users.find(u => u.user_id === (p.user_id || p.userId))?.fullName || 'غير معروف'
                }));
                setPayments(enhanced);
            } catch (error) {
                setNotification({
                    type: 'danger',
                    message: error.message || 'فشل في تحميل الدفعات'
                });
            } finally {
                setLoading(false);
            }
        };

        loadPayments();
    }, [month, year, selectedUser, users]);

    useEffect(() => {
        let result = [...payments];
        if (paymentTypeFilter !== 'ALL') {
            result = result.filter(p => p.paymentType === paymentTypeFilter);
        }
        if (statusFilter !== 'ALL') {
            result = result.filter(p => p.status === statusFilter);
        }
        console.log('Payment data:', filteredPayments);

        setFilteredPayments(result);
    }, [payments, paymentTypeFilter, statusFilter]);

    return (
        <Container className="admin-payments-container py-4">
            <Card className="shadow-sm">
                <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center py-3">
                    <div className="d-flex align-items-center">
                        <FiDollarSign className="me-2" size={20} />
                        <h5 className="mb-0 fw-bold">عرض الدفعات</h5>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                        <Form.Select
                            size="sm"
                            value={selectedUser || ''}
                            onChange={(e) => setSelectedUser(e.target.value || null)}
                        >
                            <option value="">اختر مستخدم</option>
                            {users.map(user => (
                                <option key={`user-${user.user_id}`} value={user.user_id}>
                                    {user.fullName}
                                </option>
                            ))}
                        </Form.Select>

                        <Form.Select
                            size="sm"
                            value={month}
                            onChange={(e) => setMonth(parseInt(e.target.value))}
                        >
                            {Array.from({ length: 12 }, (_, i) => (
                                <option key={`month-${i + 1}`} value={i + 1}>
                                    {i + 1}
                                </option>
                            ))}
                        </Form.Select>

                        <Form.Select
                            size="sm"
                            value={year}
                            onChange={(e) => setYear(parseInt(e.target.value))}
                        >
                            {Array.from({ length: 5 }, (_, i) => (
                                <option key={`year-${i}`} value={new Date().getFullYear() - 2 + i}>
                                    {new Date().getFullYear() - 2 + i}
                                </option>
                            ))}
                        </Form.Select>

                        <Form.Select
                            size="sm"
                            value={paymentTypeFilter}
                            onChange={(e) => setPaymentTypeFilter(e.target.value)}
                        >
                            {Object.entries(paymentTypes).map(([key, val]) => (
                                <option key={`type-${key}`} value={key}>{val}</option>
                            ))}
                        </Form.Select>

                        <Form.Select
                            size="sm"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            {Object.entries(statusLabels).map(([key, val]) => (
                                <option key={`status-${key}`} value={key}>{val}</option>
                            ))}
                        </Form.Select>

                        <Button
                            variant="light"
                            onClick={() => window.location.reload()}
                            disabled={loading}
                        >
                            <FiRefreshCw className={loading ? 'spin me-1' : 'me-1'} />
                            تحديث
                        </Button>
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
                            <p className="mt-3 text-muted">جاري تحميل الدفعات...</p>
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
                                </tr>
                                </thead>
                                <tbody>
                                {filteredPayments.length > 0 ? (
                                    filteredPayments.map((payment) => (
                                        <tr key={`payment-${payment.payment_id || payment.paymentId}`}>
                                            <td>{payment.user_id || payment.userId || '--'}</td>
                                            <td>{payment.user?.fullName || payment.fullName || '--'}</td>
                                            <td>{paymentTypes[payment.type || payment.paymentType] || '--'}</td>
                                            <td>{payment.amount} شيكل</td>
                                            <td>{formatDate(payment.date)}</td>
                                            <td>
                                                <Badge pill bg={statusVariants[payment.status] || 'secondary'}>
                                                    {statusLabels[payment.status] || payment.status}
                                                </Badge>
                                            </td>
                                            <td>{formatDate(payment.paymentDate)}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="text-center py-4">
                                            لا توجد دفعات لعرضها
                                        </td>
                                    </tr>
                                )}
                                </tbody>
                            </Table>
                        </div>
                    )}
                </Card.Body>
            </Card>
        </Container>
    );
};

export default AdminPayments;
