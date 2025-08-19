// src/pages/AdminComplaints.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { getComplaints, updateComplaintStatus, respondToComplaint } from '../api';
import { FiEdit, FiMessageSquare, FiX, FiCheck, FiImage, FiRefreshCw } from 'react-icons/fi';
import styles from './AdminComplaints.module.css';
import { useTranslation } from 'react-i18next';

const AdminComplaints = () => {
    const { user } = useAuth();
    const { t } = useTranslation();
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
                message: t('admin.complaints.notifications.loadError') + (error.message || t('general.error'))
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
        SUBMITTED: t('admin.complaints.statuses.SUBMITTED'),
        IN_PROGRESS: t('admin.complaints.statuses.IN_PROGRESS'),
        RESOLVED: t('admin.complaints.statuses.RESOLVED'),
        REJECTED: t('admin.complaints.statuses.REJECTED')
    };

    const handleStatusChange = async (complaintId, newStatus) => {
        try {
            await updateComplaintStatus(complaintId, newStatus);
            setNotification({
                type: 'success',
                message: t('admin.complaints.notifications.updateSuccess')
            });
            loadComplaints();
        } catch (error) {
            console.error('Error updating status:', error);
            setNotification({
                type: 'danger',
                message: t('admin.complaints.notifications.updateError') + (error.message || t('general.error'))
            });
        }
    };

    const handleSubmitResponse = async () => {
        if (!selectedComplaint || !responseText) return;

        try {
            await respondToComplaint(selectedComplaint.complaintId, responseText);
            setNotification({
                type: 'success',
                message: t('admin.complaints.notifications.responseSuccess')
            });
            setSelectedComplaint(null);
            setResponseText('');
            loadComplaints();
        } catch (error) {
            console.error('Error submitting response:', error);
            setNotification({
                type: 'danger',
                message: t('admin.complaints.notifications.responseError') + (error.message || t('general.error'))
            });
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '--';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB');
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                {/* Header */}
                <div className={styles.header}>
                    <div className={styles.headerTitle}>
                        <FiMessageSquare />
                        <h1>{t('admin.complaints.title')} - {t('municipality')}</h1>
                    </div>

                    <div className={styles.filters}>
                        <button
                            onClick={loadComplaints}
                            disabled={loading}
                            className={`${styles.btn} ${styles.btnLight}`}
                        >
                            <FiRefreshCw className={loading ? styles.spinner : ''} />
                            {t('admin.complaints.refresh')}
                        </button>

                        <div className={styles.filterGroup}>
                            <select
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                                className={styles.filterSelect}
                            >
                                <option value="all">{t('admin.complaints.allStatuses')}</option>
                                <option value="SUBMITTED">{t('admin.complaints.statuses.SUBMITTED')}</option>
                                <option value="IN_PROGRESS">{t('admin.complaints.statuses.IN_PROGRESS')}</option>
                                <option value="RESOLVED">{t('admin.complaints.statuses.RESOLVED')}</option>
                                <option value="REJECTED">{t('admin.complaints.statuses.REJECTED')}</option>
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
                        <p>{t('admin.complaints.loading')}</p>
                    </div>
                ) : (
                    <div className={styles.tableContainer}>
                        <table className={styles.table}>
                            <thead>
                            <tr>
                                <th>{t('admin.complaints.ticketNumber')}</th>
                                <th>{t('admin.complaints.type')}</th>
                                <th>{t('admin.complaints.description')}</th>
                                <th>{t('admin.complaints.location')}</th>
                                <th>{t('admin.complaints.status')}</th>
                                <th>{t('admin.complaints.response')}</th>
                                <th>{t('admin.complaints.date')}</th>
                                <th>{t('admin.complaints.actions')}</th>
                            </tr>
                            </thead>
                            <tbody>
                            {filteredComplaints.length > 0 ? (
                                filteredComplaints.map(complaint => (
                                    <tr key={complaint.complaintId}>
                                        <td>#{complaint.ticketNumber || '--'}</td>
                                        <td>{complaint.type || '--'}</td>
                                        <td>
                                            <div style={{
                                                maxWidth: '200px',
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis'
                                            }}>
                                                {complaint.description || '--'}
                                            </div>
                                        </td>
                                        <td>{complaint.location || '--'}</td>
                                        <td>
                                                <span
                                                    className={`${styles.badge} ${styles[statusVariants[complaint.status]]}`}>
                                                    {statusLabels[complaint.status]}
                                                </span>
                                        </td>
                                        <td>
                                            {complaint.response ? (
                                                <div style={{
                                                    maxWidth: '200px',
                                                    whiteSpace: 'nowrap',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis'
                                                }}>
                                                    {complaint.response}
                                                </div>
                                            ) : (
                                                <span style={{color: '#aaa'}}>—</span>
                                            )}
                                        </td>
                                        <td>{formatDate(complaint.date)}</td>
                                        <td>
                                            <div style={{display: 'flex', gap: '0.5rem'}}>
                                                <button
                                                    className={`${styles.btnAction} ${styles.btnPrimary}`}
                                                    onClick={() => setSelectedComplaint(complaint)}
                                                    title={t('admin.complaints.respond')}
                                                >
                                                    <FiMessageSquare/>
                                                </button>

                                                {complaint.imageUrl && (
                                                    <button
                                                        className={`${styles.btnAction} ${styles.btnLight}`}
                                                        onClick={() => window.open(complaint.imageUrl, '_blank')}
                                                        title={t('admin.complaints.viewImage')}
                                                    >
                                                        <FiImage/>
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="8" style={{textAlign: 'center', padding: '2rem'}}>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#666' }}>
                                            <FiMessageSquare size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                                            {t('admin.complaints.noComplaints')}
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
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2>
                                <FiEdit /> {t('admin.complaints.respondToTicket')} #{selectedComplaint.ticketNumber}
                            </h2>
                        </div>

                        {/* عرض وصف الشكوى */}
                        <div className={styles.complaintDetails}>
                            <strong>{t('admin.complaints.complaintDescription')}:</strong>
                            <p>{selectedComplaint.description}</p>
                        </div>

                        <div className={styles.modalBody}>
                            <label>{t('admin.complaints.responseText')}</label>
                            <textarea
                                value={responseText}
                                onChange={(e) => setResponseText(e.target.value)}
                                placeholder={t('admin.complaints.responsePlaceholder')}
                                className={styles.textarea}
                            />
                        </div>

                        <div className={styles.modalFooter}>
                            <button className={`${styles.btn} ${styles.btnLight}`} onClick={() => setSelectedComplaint(null)}>
                                <FiX /> {t('common.cancel')}
                            </button>
                            <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleSubmitResponse} disabled={!responseText}>
                                <FiCheck /> {t('admin.complaints.submitResponse')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminComplaints;