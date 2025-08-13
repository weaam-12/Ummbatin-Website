// AdminKinder.jsx – complete & self-contained
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
    const [pendingChildren, setPendingChildren] = useState([]);
    const [approvedChildren, setApprovedChildren] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [currentKg, setCurrentKg] = useState({});
    const [newKg, setNewKg] = useState({ name: '', location: '', capacity: '' });
    const [stats, setStats] = useState({ totalChildren: 0, pendingCount: 0, approvedCount: 0 });
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState(null);

    /* ---------- load all data ---------- */
    const loadAll = async () => {
        setLoading(true);
        try {
            const kgs = await fetchKindergartens();
            setKindergartens(kgs);

            const allChildren = kgs.flatMap(kg => kg.children || []);
            const pending = allChildren.filter(c => c.monthlyFee === 2.5);
            const approved = allChildren.filter(c => c.monthlyFee === 3.5);

            setPendingChildren(pending);
            setApprovedChildren(approved);
            setStats({
                totalChildren: allChildren.length,
                pendingCount: pending.length,
                approvedCount: approved.length
            });
        } catch {
            setNotification({ type: 'danger', message: t('loadError') });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadAll(); }, []);

    /* ---------- approve / reject child ---------- */
    const handleApproveChild = async (childId, approved) => {
        try {
            const res = await fetch(`/api/children/${childId}/approve?approved=${approved}`, {
                method: 'PATCH',
                credentials: 'include'
            });
            if (!res.ok) throw new Error();
            setNotification({ type: 'success', message: approved ? t('approved') : t('rejected') });
            loadAll();
        } catch {
            setNotification({ type: 'danger', message: t('updateError') });
        }
    };

    /* ---------- kindergarten CRUD ---------- */
    const handleAddKg = async (e) => {
        e.preventDefault();
        try {
            await createKindergarten(newKg);
            setShowAddModal(false);
            setNewKg({ name: '', location: '', capacity: '' });
            setNotification({ type: 'success', message: t('addSuccess') });
            loadAll();
        } catch {
            setNotification({ type: 'danger', message: t('addError') });
        }
    };

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

    /* ---------- render ---------- */
    return (
        <div className={styles.container}>
            <div className={styles.card}>
                {/* header */}
                <div className={styles.header}>
                    <div className={styles.headerTitle}>
                        <FiHome />
                        <h1>{t('title')} – {t('municipality')}</h1>
                    </div>
                    <button className={`${styles.btn} ${styles.btnPrimary}`}
                            onClick={() => setShowAddModal(true)}>
                        <FiPlus /> {t('addKindergarten')}
                    </button>
                </div>

                {/* notification */}
                {notification && (
                    <div className={`${styles.notification} ${
                        notification.type === 'danger' ? styles.alertDanger : styles.alertSuccess
                    }`}>
                        {notification.message}
                        <button onClick={() => setNotification(null)}><FiX /></button>
                    </div>
                )}

                {/* stats */}
                <div className={styles.statsGrid}>
                    <div className={styles.statCard}>
                        <div className={styles.statIcon}><FiHome /></div>
                        <div className={styles.statInfo}><h3>{t('totalKindergartens')}</h3><p>{kindergartens.length}</p></div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statIcon}><FiUsers /></div>
                        <div className={styles.statInfo}><h3>{t('totalChildren')}</h3><p>{stats.totalChildren}</p></div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statIcon}><FiFileText /></div>
                        <div className={styles.statInfo}><h3>{t('pendingRequests')}</h3><p>{stats.pendingCount}</p></div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statIcon}><FiDollarSign /></div>
                        <div className={styles.statInfo}><h3>{t('approvedCount')}</h3><p>{stats.approvedCount}</p></div>
                    </div>
                </div>

                {/* pending children */}
                {pendingChildren.length > 0 && (
                    <section className={styles.pendingStrip}>
                        <h2>בקשות مמתינة – أطفال ({pendingChildren.length})</h2>
                        <div className={styles.tableContainer}>
                            <table className={styles.table}>
                                <thead>
                                <tr>
                                    <th>#</th><th>{t('childName')}</th><th>{t('motherName')}</th><th>{t('actions')}</th>
                                </tr>
                                </thead>
                                <tbody>
                                {pendingChildren.map(c => (
                                    <tr key={c.childId}>
                                        <td>{c.childId}</td>
                                        <td>{c.name}</td>
                                        <td>{c.motherName || '–'}</td>
                                        <td>
                                            <button className={`${styles.btn} ${styles.btnSuccess} ${styles.btnSm}`}
                                                    onClick={() => handleApproveChild(c.childId, true)}>
                                                <FiCheck /> {t('approve')}
                                            </button>
                                            <button className={`${styles.btn} ${styles.btnDanger} ${styles.btnSm}`}
                                                    onClick={() => handleApproveChild(c.childId, false)}>
                                                <FiX /> {t('reject')}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                )}

                {/* approved children */}
                {approvedChildren.length > 0 && (
                    <section className={styles.approvedStrip}>
                        <h2>{t('approvedChildren')} ({approvedChildren.length})</h2>
                        <div className={styles.tableContainer}>
                            <table className={styles.table}>
                                <thead>
                                <tr>
                                    <th>#</th><th>{t('childName')}</th><th>{t('motherName')}</th>
                                </tr>
                                </thead>
                                <tbody>
                                {approvedChildren.map(c => (
                                    <tr key={c.childId}>
                                        <td>{c.childId}</td>
                                        <td>{c.name}</td>
                                        <td>{c.motherName || '–'}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                )}

                {/* kindergartens CRUD table */}
                <div className={styles.tableContainer}>
                    <table className={styles.table}>
                        <thead>
                        <tr>
                            <th>#</th><th>{t('name')}</th><th>{t('location')}</th><th>{t('capacity')}</th>
                            <th>{t('occupied')}</th><th>{t('actions')}</th>
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

                {/* add modal */}
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

                {/* edit modal */}
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