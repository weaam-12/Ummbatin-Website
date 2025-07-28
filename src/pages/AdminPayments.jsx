// src/pages/AdminPayments.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { FiDollarSign, FiRefreshCw, FiCalendar } from 'react-icons/fi';
import styles from './AdminPayments.module.css';
import { getAllPayments, getAllUsers } from '../api';

const AdminPayments = () => {
    const [payments, setPayments] = useState([]);
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
        PENDING: 'badgePending',
        PAID: 'badgePaid',
        COMPLETED: 'badgePaid',
        OVERDUE: 'badgeOverdue',
        ALL: ''
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
            const date = new Date(dateValue);
            return isNaN(date.getTime()) ? '--' : date.toLocaleDateString('ar-SA');
        } catch (e) {
            console.error('Error formatting date:', e);
            return '--';
        }
    };

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await getAllUsers();
                if (Array.isArray(response)) {
                    setUsers(response);
                } else {
                    console.error('Expected array but got:', response);
                    setNotification({
                        type: 'danger',
                        message: 'بيانات المستخدمين غير صالحة'
                    });
                }
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
        loadPayments();
    }, [month, year, selectedUser, users]);

    const loadPayments = async () => {
        setLoading(true);
        try {
            const response = await getAllPayments(month, year, selectedUser);

            // تحقق جيد من أن البيانات مصفوفة
            if (!Array.isArray(response)) {
                console.error('Expected array but got:', response);
                setNotification({
                    type: 'danger',
                    message: 'بيانات المدفوعات غير صالحة'
                });
                setPayments([]);
                return;
            }

            const enhanced = response.map((p) => ({
                ...p,
                paymentId: p.payment_id || p.paymentId || p.id || Math.random().toString(36).substr(2, 9),
                userId: p.user_id || p.userId || '--',
                paymentType: p.type || p.paymentType || 'UNKNOWN',
                paymentDate: p.payment_date || p.paymentDate || null,
                amount: p.amount || p.fee || 0,
                status: p.status || 'PENDING',
                date: p.date || p.due_date || null,
                fullName: p.fullName ||
                    (users.find((u) => u.user_id === (p.user_id || p.userId))?.fullName ||
                    'غير معروف')
            }));

            setPayments(enhanced);
            setNotification(null);
        } catch (error) {
            console.error('🚨 خطأ أثناء تحميل الدفعات:', error);
            setNotification({
                type: 'danger',
                message: error.message || 'فشل في تحميل الدفعات',
            });
            setPayments([]);
        } finally {
            setLoading(false);
        }
    };

    const filteredPayments = useMemo(() => {
        if (!Array.isArray(payments)) return [];

        let result = [...payments];
        if (paymentTypeFilter !== 'ALL') {
            result = result.filter(p => p.paymentType === paymentTypeFilter);
        }
        if (statusFilter !== 'ALL') {
            result = result.filter(p => p.status === statusFilter);
        }
        return result;
    }, [payments, paymentTypeFilter, statusFilter]);

    const handleRefresh = () => {
        loadPayments();
    };

    return (
        <div className={styles.bgContainer}>
            <div className={styles.card}>
                {/* Header */}
                <div className={styles.header}>
                    <div className={styles.headerTitle}>
                        <FiDollarSign />
                        <h1>إدارة المدفوعات - بلدية أم بطين</h1>
                    </div>

                    <button
                        onClick={handleRefresh}
                        disabled={loading}
                        className={`${styles.btn} ${styles.btnLight}`}
                    >
                        <FiRefreshCw className={loading ? styles.spinner : ''} />
                        تحديث البيانات
                    </button>
                </div>

                {/* Filters */}
                <div className={styles.filters}>
                    <div className={styles.filterGroup}>
                        <select
                            value={selectedUser || ''}
                            onChange={(e) => setSelectedUser(e.target.value || null)}
                            className={styles.filterSelect}
                        >
                            <option value="">جميع المستخدمين</option>
                            {Array.isArray(users) && users.map(user => (
                                <option key={`user-${user.user_id}`} value={user.user_id}>
                                    {user.fullName}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.filterGroup}>
                        <select
                            value={month}
                            onChange={(e) => setMonth(parseInt(e.target.value))}
                            className={styles.filterSelect}
                        >
                            {Array.from({ length: 12 }, (_, i) => (
                                <option key={`month-${i + 1}`} value={i + 1}>
                                    الشهر {i + 1}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.filterGroup}>
                        <select
                            value={year}
                            onChange={(e) => setYear(parseInt(e.target.value))}
                            className={styles.filterSelect}
                        >
                            {Array.from({ length: 5 }, (_, i) => (
                                <option key={`year-${i}`} value={new Date().getFullYear() - 2 + i}>
                                    سنة {new Date().getFullYear() - 2 + i}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.filterGroup}>
                        <select
                            value={paymentTypeFilter}
                            onChange={(e) => setPaymentTypeFilter(e.target.value)}
                            className={styles.filterSelect}
                        >
                            {Object.entries(paymentTypes).map(([key, val]) => (
                                <option key={`type-${key}`} value={key}>{val}</option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.filterGroup}>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className={styles.filterSelect}
                        >
                            {Object.entries(statusLabels).map(([key, val]) => (
                                <option key={`status-${key}`} value={key}>{val}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Notification */}
                {notification && (
                    <div className={`${styles.alert} ${
                        notification.type === 'danger' ? styles.alertDanger : styles.alertSuccess
                    }`}>
                        {notification.message}
                    </div>
                )}

                {/* Content */}
                {loading ? (
                    <div className={styles.loading}>
                        <div className={styles.spinner}></div>
                        <p>جاري تحميل بيانات المدفوعات...</p>
                    </div>
                ) : (
                    <div className={styles.tableContainer}>
                        <table className={styles.table}>
                            <thead>
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
                            {Array.isArray(filteredPayments) && filteredPayments.length > 0 ? (
                                filteredPayments.map((payment) => (
                                    <tr key={`payment-${payment.paymentId}`}>
                                        <td>{payment.userId || '--'}</td>
                                        <td>{payment.fullName || '--'}</td>
                                        <td>{paymentTypes[payment.paymentType] || payment.paymentType || '--'}</td>
                                        <td>{payment.amount !== undefined ? `${payment.amount} شيكل` : '--'}</td>
                                        <td>{formatDate(payment.date)}</td>
                                        <td>
                                            <span className={`${styles.badge} ${styles[statusVariants[payment.status]] || ''}`}>
                                                {statusLabels[payment.status] || payment.status || '--'}
                                            </span>
                                        </td>
                                        <td>{formatDate(payment.paymentDate)}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" style={{ textAlign: 'center', padding: '1rem' }}>
                                        لا توجد مدفوعات لعرضها
                                    </td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminPayments;