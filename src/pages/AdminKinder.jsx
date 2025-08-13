// AdminKinder.jsx  (fully bilingual Arabic/Hebrew)
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
    FiHome, FiUsers, FiFileText, FiDollarSign,
    FiPlus, FiEdit, FiTrash2, FiCheck, FiX
} from 'react-icons/fi';
import styles from './AdminKinder.module.css';
import {
    fetchKindergartens,
    createKindergarten,
    deleteKindergarten,
    updateKindergarten
} from '../api';

const AdminKinder = () => {
    const { t } = useTranslation();
    const [kindergartens, setKindergartens] = useState([]);
    const [pendingKgs, setPendingKgs]   = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [currentKg, setCurrentKg] = useState({});
    const [newKg, setNewKg] = useState({ name: '', location: '', capacity: '', monthlyFee: '' });
    const [stats, setStats] = useState({ totalChildren: 0, pendingRequests: 0, approvedCount: 0 });
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState(null);

    /* ----------  Load data  ---------- */
    const loadAll = async () => {
        setLoading(true);
        try {
            const kgs = await fetchKindergartens();
            setKindergartens(kgs);

            const pending = kgs.filter(kg => kg.monthlyFee === 2.5);
            setPendingKgs(pending);

            const totalChildren = kgs.reduce((sum, kg) => sum + (kg.children?.length || 0), 0);
            const approved = kgs.filter(kg => kg.monthlyFee === 3.5).length;
            setStats({
                totalChildren,
                pendingRequests: pending.length,
                approvedCount: approved
            });
        } catch (err) {
            setNotification({ type: 'danger', message: t('loadError') });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadAll(); }, []);

    /* ----------  Approve / Reject  ---------- */
    const handleApprove = async (id, approved) => {
        try {
            const res = await fetch(
                `/api/kindergartens/${id}/approve?approved=${approved}`,
                { method: 'PATCH', credentials: 'include' }
            );
            if (!res.ok) throw new Error();
            setNotification({
                type: 'success',
                message: approved ? t('approved') : t('rejected')
            });
            loadAll();
        } catch {
            setNotification({ type: 'danger', message: t('updateError') });
        }
    };

    /* ----------  Add  ---------- */
    const handleAddKg = async (e) => {
        e.preventDefault();
        try {
            await createKindergarten({ ...newKg, monthlyFee: 1.5 });
            setShowAddModal(false);
            setNewKg({ name: '', location: '', capacity: '', monthlyFee: '' });
            setNotification({ type: 'success', message: t('addSuccess') });
            loadAll();
        } catch {
            setNotification({ type: 'danger', message: t('addError') });
        }
    };

    /* ----------  Edit  ---------- */
    const handleEditKg = async (e) => {
        e.preventDefault();
        try {
            await updateKindergarten(currentKg.kindergartenId, currentKg);
            setShowEditModal(false);
            setNotification({ type: 'success', message: t('editSuccess') });
            loadAll();
        } catch {
            setNotification({ type: 'danger', message: t('updateError') });
        }
    };

    /* ----------  Delete  ---------- */
    const handleDeleteKg = async (id) => {
        if (!window.confirm(t('confirmDelete'))) return;
        try {
            await deleteKindergarten(id);
            setNotification({ type: 'success', message: t('deleteSuccess') });
            loadAll();
        } catch {
            setNotification({ type: 'danger', message: t('deleteError') });
        }
    };

    /* ----------  Render  ---------- */
    return (
        <div className={styles.container}>
            <div className={styles.card}>
                {/* Header */}
                <div className={styles.header}>
                    <div className={styles.headerTitle}>
                        <FiHome />
                        <h1>{t('title')} - {t('municipality')}</h1>
                    </div>
                    <button className={`${styles.btn} ${styles.btnPrimary}`}
                            onClick={() => setShowAddModal(true)}>
                        <FiPlus /> {t('addKindergarten')}
                    </button>
                </div>

                {/* Notification */}
                {notification && (
                    <div className={`${styles.notification} ${
                        notification.type === 'danger' ? styles.alertDanger : styles.alertSuccess
                    }`}>
                        {notification.message}
                        <button onClick={() => setNotification(null)}><FiX /></button>
                    </div>
                )}

                {/* Statistics */}
                <div className={styles.statsGrid}>
                    <div className={styles.statCard}>
                        <div className={styles.statIcon}><FiHome /></div>
                        <div className={styles.statInfo}>
                            <h3>{t('totalKindergartens')}</h3>
                            <p>{kindergartens.length}</p>
                        </div>
                    </div>

                    <div className={styles.statCard}>
                        <div className={styles.statIcon}><FiUsers /></div>
                        <div className={styles.statInfo}>
                            <h3>{t('totalChildren')}</h3>
                            <p>{stats.totalChildren}</p>
                        </div>
                    </div>

                    <div className={styles.statCard}>
                        <div className={styles.statIcon}><FiFileText /></div>
                        <div className={styles.statInfo}>
                            <h3>{t('pendingRequests')}</h3>
                            <p>{stats.pendingRequests}</p>
                        </div>
                    </div>

                    <div className={styles.statCard}>
                        <div className={styles.statIcon}><FiDollarSign /></div>
                        <div className={styles.statInfo}>
                            <h3>{t('approvedCount')}</h3>
                            <p>{stats.approvedCount}</p>
                        </div>
                    </div>
                </div>

                {/* Pending Approvals Strip */}
                {pendingKgs.length > 0 && (
                    <section className={styles.pendingStrip}>
                        <h2>בקשות ממתינות ({pendingKgs.length})</h2>
                        {pendingKgs.map(kg => (
                            <div key={kg.kindergartenId} className={styles.pendingCard}>
                                <span>{kg.name} – {kg.location}</span>
                                <div>
                                    <button
                                        className={`${styles.btn} ${styles.btnSuccess} ${styles.btnSm}`}
                                        onClick={() => handleApprove(kg.kindergartenId, true)}>
                                        <FiCheck /> {t('approve')}
                                    </button>
                                    <button
                                        className={`${styles.btn} ${styles.btnDanger} ${styles.btnSm}`}
                                        onClick={() => handleApprove(kg.kindergartenId, false)}>
                                        <FiX /> {t('reject')}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </section>
                )}

                {/* Main Table */}
                <div className={styles.tableContainer}>
                    <table className={styles.table}>
                        <thead>
                        <tr>
                            <th>#</th><th>{t('name')}</th><th>{t('location')}</th>
                            <th>{t('capacity')}</th><th>{t('occupied')}</th>
                            <th>{t('status')}</th><th>{t('actions')}</th>
                        </tr>
                        </thead>
                        <tbody>
                        {kindergartens.map(kg => (
                            <tr key={kg.kindergartenId}>
                                <td>{kg.kindergartenId}</td>
                                <td><strong>{kg.name}</strong></td>
                                <td>{kg.location}</td>
                                <td>{kg.capacity}</td>
                                <td>{kg.children?.length || 0}</td>
                                <td>
                                    {kg.monthlyFee === 3.5
                                        ? <span className={`${styles.badge} ${styles.badgeSuccess}`}>{t('approved')}</span>
                                        : kg.monthlyFee === 2.5
                                            ? <span className={`${styles.badge} ${styles.badgeWarning}`}>{t('pending')}</span>
                                            : <span className={`${styles.badge} ${styles.badgeSecondary}`}>{t('notRegistered')}</span>}
                                </td>
                                <td>
                                    <button className={`${styles.btn} ${styles.btnPrimary} ${styles.btnSm}`}
                                            onClick={() => { setCurrentKg(kg); setShowEditModal(true); }}>
                                        <FiEdit /> {t('edit')}
                                    </button>
                                    <button className={`${styles.btn} ${styles.btnDanger} ${styles.btnSm}`}
                                            onClick={() => handleDeleteKg(kg.kindergartenId)}>
                                        <FiTrash2 /> {t('delete')}
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>

                {/* Add Modal */}
                {showAddModal && (
                    <div className={styles.modalOverlay}>
                        <div className={styles.modal}>
                            <div className={styles.modalHeader}><h2>{t('addNew')}</h2></div>
                            <form onSubmit={handleAddKg} className={styles.modalBody}>
                                <div className={styles.formGroup}>
                                    <label>{t('name')}</label>
                                    <input type="text" value={newKg.name}
                                           onChange={e => setNewKg({ ...newKg, name: e.target.value })} required />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>{t('location')}</label>
                                    <input type="text" value={newKg.location}
                                           onChange={e => setNewKg({ ...newKg, location: e.target.value })} required />
                                </div>
                                <div className={styles.formRow}>
                                    <div className={styles.formGroup}>
                                        <label>{t('capacity')}</label>
                                        <input type="number" min="1" value={newKg.capacity}
                                               onChange={e => setNewKg({ ...newKg, capacity: e.target.value })} required />
                                    </div>
                                </div>
                                <div className={styles.modalFooter}>
                                    <button type="button" className={`${styles.btn} ${styles.btnSecondary}`}
                                            onClick={() => setShowAddModal(false)}>
                                        <FiX /> {t('cancel')}
                                    </button>
                                    <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`}>
                                        <FiCheck /> {t('save')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Edit Modal */}
                {showEditModal && (
                    <div className={styles.modalOverlay}>
                        <div className={styles.modal}>
                            <div className={styles.modalHeader}><h2>{t('editKg')}</h2></div>
                            <form onSubmit={handleEditKg} className={styles.modalBody}>
                                <div className={styles.formGroup}>
                                    <label>{t('name')}</label>
                                    <input type="text" value={currentKg.name}
                                           onChange={e => setCurrentKg({ ...currentKg, name: e.target.value })} required />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>{t('location')}</label>
                                    <input type="text" value={currentKg.location}
                                           onChange={e => setCurrentKg({ ...currentKg, location: e.target.value })} required />
                                </div>
                                <div className={styles.formRow}>
                                    <div className={styles.formGroup}>
                                        <label>{t('capacity')}</label>
                                        <input type="number" min="1" value={currentKg.capacity}
                                               onChange={e => setCurrentKg({ ...currentKg, capacity: e.target.value })} required />
                                    </div>
                                </div>
                                <div className={styles.modalFooter}>
                                    <button type="button" className={`${styles.btn} ${styles.btnSecondary}`}
                                            onClick={() => setShowEditModal(false)}>
                                        <FiX /> {t('cancel')}
                                    </button>
                                    <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`}>
                                        <FiCheck /> {t('save')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminKinder;