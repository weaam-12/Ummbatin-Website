// src/pages/AdminComplaints.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { getComplaints, updateComplaintStatus, respondToComplaint } from '../api';
import { FiEdit, FiMessageSquare, FiX, FiCheck, FiImage, FiRefreshCw } from 'react-icons/fi';
import styles from './AdminComplaints.module.css';

const AdminComplaints = () => {
    const { user } = useAuth();
    const [complaints, setComplaints] = useState([]);
    const [selectedComplaint, setSelectedComplaint] = useState(null);
    const [responseText, setResponseText] = useState('');
    const [notification, setNotification] = useState(null);
    const [filter, setFilter] = useState('all');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadComplaints();
    }, []);

    const loadComplaints = async () => {
        try {
            setLoading(true);
            const data = await getComplaints(null, true);
            setComplaints(data || []);
        } catch (error) {
            console.error('Error loading complaints:', error);
            setNotification({
                type: 'danger',
                message: 'فشل في تحميل الشكاوى: ' + (error.message || 'خطأ غير متوقع')
            });
        } finally {
            setLoading(false);
        }
    };

    const filteredComplaints = complaints.filter(complaint => {
        if (filter === 'all') return true;
        return complaint.status === filter;
    });

    const statusVariants = {
        SUBMITTED: 'badgeSubmitted',
        IN_PROGRESS: 'badgeInProgress',
        RESOLVED: 'badgeResolved',
        REJECTED: 'badgeRejected'
    };

    const statusLabels = {
        SUBMITTED: 'مستلمة',
        IN_PROGRESS: 'قيد المعالجة',
        RESOLVED: 'تم الحل',
        REJECTED: 'مرفوضة'
    };

    const handleStatusChange = async (complaintId, newStatus) => {
        try {
            await updateComplaintStatus(complaintId, newStatus);
            setNotification({
                type: 'success',
                message: 'تم تحديث حالة الشكوى بنجاح'
            });
            loadComplaints();
        } catch (error) {
            console.error('Error updating status:', error);
            setNotification({
                type: 'danger',
                message: 'فشل في تحديث الحالة: ' + (error.message || 'خطأ غير متوقع')
            });
        }
    };

    const handleSubmitResponse = async () => {
        if (!selectedComplaint || !responseText) return;

        try {
            await respondToComplaint(selectedComplaint.complaintId, responseText);
            setNotification({
                type: 'success',
                message: 'تم إرسال الرد بنجاح'
            });
            setSelectedComplaint(null);
            setResponseText('');
            loadComplaints();
        } catch (error) {
            console.error('Error submitting response:', error);
            setNotification({
                type: 'danger',
                message: 'فشل في إرسال الرد: ' + (error.message || 'خطأ غير متوقع')
            });
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '--';
        const date = new Date(dateString);
        return date.toLocaleDateString('ar-SA');
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                {/* Header */}
                <div className={styles.header}>
                    <div className={styles.headerTitle}>
                        <FiMessageSquare />
                        <h1>إدارة الشكاوى - بلدية أم بطين</h1>
                    </div>

                    <div className={styles.filters}>
                        <button
                            onClick={loadComplaints}
                            disabled={loading}
                            className={`${styles.btn} ${styles.btnLight}`}
                        >
                            <FiRefreshCw className={loading ? styles.spinner : ''} />
                            تحديث البيانات
                        </button>

                        <div className={styles.filterGroup}>
                            <select
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                                className={styles.filterSelect}
                            >
                                <option value="all">جميع الشكاوى</option>
                                <option value="SUBMITTED">مستلمة</option>
                                <option value="IN_PROGRESS">قيد المعالجة</option>
                                <option value="RESOLVED">تم الحل</option>
                                <option value="REJECTED">مرفوضة</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Notification */}
                {notification && (
                    <div className={`${styles.alert} ${
                        notification.type === 'danger' ? styles.alertDanger : styles.alertSuccess
                    }`}>
                        {notification.type === 'success' ? <FiCheck /> : <FiX />}
                        {notification.message}
                    </div>
                )}

                {/* Content */}
                {loading ? (
                    <div className={styles.loading}>
                        <div className={styles.spinner}></div>
                        <p>جاري تحميل الشكاوى...</p>
                    </div>
                ) : (
                    <div className={styles.tableContainer}>
                        <table className={styles.table}>
                            <thead>
                            <tr>
                                <th>رقم التذكرة</th>
                                <th>النوع</th>
                                <th>الوصف</th>
                                <th>الموقع</th>
                                <th>الحالة</th>
                                <th>التاريخ</th>
                                <th>الإجراءات</th>
                            </tr>
                            </thead>
                            <tbody>
                            {filteredComplaints.length > 0 ? (
                                filteredComplaints.map(complaint => (
                                    <tr key={complaint.complaintId}>
                                        <td>#{complaint.ticketNumber || '--'}</td>
                                        <td>{complaint.type || '--'}</td>
                                        <td>
                                            <div style={{ maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {complaint.description || '--'}
                                            </div>
                                        </td>
                                        <td>{complaint.location || '--'}</td>
                                        <td>
                                                <span className={`${styles.badge} ${styles[statusVariants[complaint.status]]}`}>
                                                    {statusLabels[complaint.status]}
                                                </span>
                                        </td>
                                        <td>{formatDate(complaint.date)}</td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button
                                                    className={`${styles.btnAction} ${styles.btnPrimary}`}
                                                    onClick={() => setSelectedComplaint(complaint)}
                                                    title="الرد"
                                                >
                                                    <FiMessageSquare />
                                                </button>

                                                {complaint.imageUrl && (
                                                    <button
                                                        className={`${styles.btnAction} ${styles.btnLight}`}
                                                        onClick={() => window.open(complaint.imageUrl, '_blank')}
                                                        title="عرض الصورة"
                                                    >
                                                        <FiImage />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#666' }}>
                                            <FiMessageSquare size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                                            لا توجد شكاوى لعرضها
                                        </div>
                                    </td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Response Modal */}
            {selectedComplaint && (
                <div className="modal" style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div className={styles.modalContent} style={{
                        background: 'white',
                        width: '90%',
                        maxWidth: '600px',
                        padding: '1.5rem'
                    }}>
                        <div className={styles.modalHeader}>
                            <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <FiEdit />
                                الرد على التذكرة #{selectedComplaint.ticketNumber}
                            </h2>
                        </div>

                        <div className={styles.modalBody}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                                نص الرد
                            </label>
                            <textarea
                                value={responseText}
                                onChange={(e) => setResponseText(e.target.value)}
                                placeholder="اكتب ردك هنا..."
                                className={styles.textarea}
                            />
                        </div>

                        <div className={styles.modalFooter} style={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                            gap: '0.5rem',
                            marginTop: '1rem'
                        }}>
                            <button
                                className={`${styles.btn} ${styles.btnLight}`}
                                onClick={() => setSelectedComplaint(null)}
                            >
                                <FiX /> إلغاء
                            </button>
                            <button
                                className={`${styles.btn} ${styles.btnPrimary}`}
                                onClick={handleSubmitResponse}
                                disabled={!responseText}
                            >
                                <FiCheck /> إرسال الرد
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminComplaints;