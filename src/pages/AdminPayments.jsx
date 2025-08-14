// src/pages/AdminPayments.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { FiDollarSign, FiRefreshCw, FiCalendar } from 'react-icons/fi';
import styles from './AdminPayments.module.css';
import { getAllPayments, getAllUsers } from '../api';

const AdminPayments = () => {
    const { t } = useTranslation();
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
        WATER: t('admin.payments.types.WATER'),
        ARNONA: t('admin.payments.types.ARNONA'),
        KINDERGARTEN: t('admin.payments.types.KINDERGARTEN'),
        ALL: t('admin.payments.types.ALL')
    };

    const statusVariants = {
        PENDING: 'badgePending',
        PAID: 'badgePaid',
        COMPLETED: 'badgePaid',
        OVERDUE: 'badgeOverdue',
        ALL: ''
    };

    const statusLabels = {
        PENDING: t('admin.payments.statuses.PENDING'),
        PAID: t('admin.payments.statuses.PAID'),
        COMPLETED: t('admin.payments.statuses.COMPLETED'),
        OVERDUE: t('admin.payments.statuses.OVERDUE'),
        ALL: t('admin.payments.statuses.ALL')
    };

    const formatDate = (dateValue) => {
        if (!dateValue) return '--';
        const date = new Date(dateValue);
        return date.toLocaleDateString('en-GB');
    };

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await getAllUsers();
                let usersArray = [];
                if (Array.isArray(response)) {
                    usersArray = response;
                } else if (response && Array.isArray(response.content)) {
                    usersArray = response.content;
                } else {
                    throw new Error(t('admin.payments.notifications.loadError'));
                }
                setUsers(usersArray);
            } catch (error) {
                console.error('Error fetching users:', error);
                setNotification({
                    type: 'danger',
                    message: t('admin.payments.notifications.loadError')
                });
            }
        };
        fetchUsers();
    }, [t]);

    useEffect(() => {
        loadPayments();
    }, [month, year, selectedUser, users]);

    const loadPayments = async () => {
        setLoading(true);
        try {
            const response = await getAllPayments(month, year, selectedUser);

            if (!Array.isArray(response)) {
                console.error('Expected array but got:', response);
                setNotification({
                    type: 'danger',
                    message: t('admin.payments.notifications.invalidData')
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
                    (users.find(u => u.id === (p.user_id || p.userId))?.fullName ||
                        users.find(u => u.user_id === (p.user_id || p.userId))?.fullName ||
                        t('common.unknown'))
            }));

            setPayments(enhanced);
            setNotification(null);
        } catch (error) {
            console.error('Error loading payments:', error);
            setNotification({
                type: 'danger',
                message: error.message || t('admin.payments.notifications.loadError')
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
                        <h1>{t('admin.payments.title')} - {t('common.municipality')}</h1>
                    </div>

                    <button
                        onClick={handleRefresh}
                        disabled={loading}
                        className={`${styles.btn} ${styles.btnLight}`}
                    >
                        <FiRefreshCw className={loading ? styles.spinner : ''} />
                        {t('common.refresh')}
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
                            <option value="">{t('admin.payments.filters.allUsers')}</option>
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
                                    {t('admin.payments.filters.month')} {i + 1}
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
                                    {t('admin.payments.filters.year')} {new Date().getFullYear() - 2 + i}
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
                        <p>{t('admin.payments.loading')}</p>
                    </div>
                ) : (
                    <div className={styles.tableContainer}>
                        <table className={styles.table}>
                            <thead>
                            <tr>
                                <th>{t('admin.payments.userId')}</th>
                                <th>{t('admin.payments.userName')}</th>
                                <th>{t('admin.payments.paymentType')}</th>
                                <th>{t('admin.payments.amount')}</th>
                                <th>{t('admin.payments.dueDate')}</th>
                                <th>{t('admin.payments.status')}</th>
                                <th>{t('admin.payments.paymentDate')}</th>
                            </tr>
                            </thead>
                            <tbody>
                            {Array.isArray(filteredPayments) && filteredPayments.length > 0 ? (
                                filteredPayments.map((payment) => (
                                    <tr key={`payment-${payment.paymentId}`}>
                                        <td>{payment.userId || '--'}</td>
                                        <td>{payment.fullName || '--'}</td>
                                        <td>{paymentTypes[payment.paymentType] || payment.paymentType || '--'}</td>
                                        <td>{payment.amount !== undefined ? `${payment.amount} ${t('common.currency')}` : '--'}</td>
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
                                        {t('admin.payments.noPayments')}
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