// AdminKinder.jsx  (fully bilingual Arabic/Hebrew)
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FiHome, FiUsers, FiFileText, FiDollarSign, FiPlus, FiEdit, FiTrash2, FiCheck, FiX } from 'react-icons/fi';
import styles from './AdminKinder.module.css';
import { fetchKindergartens, createKindergarten, deleteKindergarten, getAllUsers, updateKindergarten } from '../api';

const AdminKinder = () => {
    const { t } = useTranslation();
    const [kindergartens, setKindergartens] = useState([]);
    const [users, setUsers] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [currentKg, setCurrentKg] = useState({});
    const [newKg, setNewKg] = useState({ name: '', location: '', capacity: '', monthlyFee: '' });
    const [stats, setStats] = useState({ totalChildren: 0, pendingRequests: 0, totalRevenue: 0 });
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState(null);

    const loadAll = async () => {
        setLoading(true);
        try {
            const kgs = await fetchKindergartens();
            setKindergartens(kgs);
            console.table(kgs);       // لو array يطلعها جدول
            const totalChildren = kgs.reduce((sum, kg) => sum + kg.children.length, 0);
            const pendingRequests = kgs.reduce((sum, kg) => sum + (kg.pendingRequests || 0), 0);
            const totalRevenue = kgs.reduce((sum, kg) => sum + (kg.revenue || 0), 0);
            setStats({ totalChildren, pendingRequests, totalRevenue });
        } catch (error) {
            setNotification({ type: 'danger', message: t('loadError') });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAll();
    }, []);

    const handleAddKg = async (e) => {
        e.preventDefault();
        try {
            await createKindergarten(newKg);
            setShowAddModal(false);
            setNewKg({ name: '', location: '', capacity: '', monthlyFee: '' });
            setNotification({ type: 'success', message: t('addSuccess') });
            loadAll();
        } catch (error) {
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
        } catch (error) {
            setNotification({ type: 'danger', message: t('updateError') });
        }
    };

    const handleDeleteKg = async (id) => {
        if (window.confirm(t('confirmDelete'))) {
            try {
                await deleteKindergarten(id);
                setNotification({ type: 'success', message: t('deleteSuccess') });
                loadAll();
            } catch (error) {
                setNotification({ type: 'danger', message: t('deleteError') });
            }
        }
    };

    const toggleKindergartenStatus = async (kg) => {
        const newStatus = kg.status === 'OPEN' ? 'CLOSED' : 'OPEN';
        try {
            await updateKindergarten(kg.kindergartenId, { ...kg, status: newStatus });
            setNotification({ type: 'success', message: t('statusChanged') });
            loadAll();
        } catch (error) {
            setNotification({ type: 'danger', message: t('updateError') });
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                {/* Header */}
                <div className={styles.header}>
                    <div className={styles.headerTitle}>
                        <FiHome />
                        <h1>{t('title')} - {t('municipality')}</h1>
                    </div>

                    <button
                        className={`${styles.btn} ${styles.btnPrimary}`}
                        onClick={() => setShowAddModal(true)}
                    >
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
                            <h3>{t('totalRevenue')}</h3>
                            <p>{stats.totalRevenue} {t('currency')}</p>
                        </div>
                    </div>
                </div>

                {/* Kindergartens Table */}
                <div className={styles.tableContainer}>
                    <table className={styles.table}>
                        <thead>
                        <tr>
                            <th>#</th>
                            <th>{t('name')}</th>
                            <th>{t('location')}</th>
                            <th>{t('capacity')}</th>
                            <th>{t('occupied')}</th>
                            <th>{t('fees')}</th>
                            <th>{t('status')}</th>
                            <th>{t('actions')}</th>
                        </tr>
                        </thead>
                        <tbody>
                        {kindergartens.map(kg => (
                            <tr key={kg.kindergartenId}>
                                <td>{kg.kindergartenId}</td>
                                <td>
                                    <strong>{kg.name}</strong>
                                    {kg.pendingRequests > 0 && (
                                        <span className={`${styles.badge} ${styles.badgeDanger}`}>
                                            {kg.pendingRequests} {t('newRequests')}
                                        </span>
                                    )}
                                </td>
                                <td>{kg.location}</td>
                                <td>
                                    {kg.capacity}
                                    {kg.capacity - kg.children.length <= 0 && (
                                        <span className={`${styles.badge} ${styles.badgeDanger}`}>{t('full')}</span>
                                    )}
                                    {kg.capacity - kg.children.length > 0 && kg.capacity - kg.children.length <= 5 && (
                                        <span className={`${styles.badge} ${styles.badgeWarning}`}>{t('limited')}</span>
                                    )}
                                </td>
                                <td>{kg.children.length}</td>
                                <td>{kg.monthlyFee} {t('currency')}</td>
                                <td>
                                    <span className={`${styles.badge} ${kg.status === 'OPEN' ? styles.badgeSuccess : styles.badgeDanger}`}>
                                        {kg.status === 'OPEN' ? t('open') : t('closed')}
                                    </span>
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
                                    <button className={`${styles.btn} ${kg.status === 'OPEN' ? styles.btnDanger : styles.btnSuccess} ${styles.btnSm}`}
                                            onClick={() => toggleKindergartenStatus(kg)}>
                                        {kg.status === 'OPEN' ? t('close') : t('openBtn')}
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>

                {/* Kindergarten Details */}
                {kindergartens.map(kg => (
                    <details key={kg.kindergartenId} className={styles.details}>
                        <summary className={styles.detailsHeader}>
                            {kg.name} - {kg.children.length} / {kg.capacity} {t('childrens').toLowerCase()}
                        </summary>
                        <div className={styles.detailsContent}>
                            <h3>{t('childrens')}</h3>
                            {kg.children.length > 0 ? (
                                <div className={styles.tableContainer}>
                                    <table className={styles.table}>
                                        <thead>
                                        <tr>
                                            <th>{t('childName')}</th>
                                            <th>{t('age')}</th>
                                            <th>{t('parent')}</th>
                                            <th>{t('paymentStatus')}</th>
                                            <th>{t('status')}</th>

                                        </tr>
                                        </thead>
                                        <tbody>
                                        {kg.children.map(child => (
                                            <tr key={child.childId}>
                                                <td>{child.name}</td>
                                                <td>{new Date(child.birthDate).getFullYear()}-{new Date(child.birthDate).getMonth() + 1}</td>
                                                <td>{users.find(u => u.id === child.user?.id)?.fullName || '—'}</td>
                                                <td>
                                                    <span
                                                        className={`${styles.badge} ${child.paid ? styles.badgeSuccess : styles.badgeDanger}`}>
                                                        {child.paid ? t('paid') : t('paid')}
                                                    </span>
                                                </td>
                                                <td>{child.monthly_fee}</td>

                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <p style={{ textAlign: 'center', color: '#666' }}>{t('noChildren')}</p>
                            )}
                        </div>
                    </details>
                ))}

                {/* Add Modal */}
                {showAddModal && (
                    <div className={styles.modalOverlay}>
                        <div className={styles.modal}>
                            <div className={styles.modalHeader}><h2>{t('addNew')}</h2></div>
                            <form onSubmit={handleAddKg} className={styles.modalBody}>
                                <div className={styles.formGroup}>
                                    <label>{t('name')}</label>
                                    <input type="text" value={newKg.name} onChange={e => setNewKg({...newKg, name: e.target.value})} required />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>{t('location')}</label>
                                    <input type="text" value={newKg.location} onChange={e => setNewKg({...newKg, location: e.target.value})} required />
                                </div>
                                <div className={styles.formRow}>
                                    <div className={styles.formGroup}>
                                        <label>{t('capacity')}</label>
                                        <input type="number" min="1" value={newKg.capacity} onChange={e => setNewKg({...newKg, capacity: e.target.value})} required />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>{t('monthlyFee')} ({t('currency')})</label>
                                        <input type="number" min="0" value={newKg.monthlyFee} onChange={e => setNewKg({...newKg, monthlyFee: e.target.value})} required />
                                    </div>
                                </div>
                                <div className={styles.modalFooter}>
                                    <button type="button" className={`${styles.btn} ${styles.btnSecondary}`} onClick={() => setShowAddModal(false)}>
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
                                    <input type="text" value={currentKg.name} onChange={e => setCurrentKg({...currentKg, name: e.target.value})} required />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>{t('location')}</label>
                                    <input type="text" value={currentKg.location} onChange={e => setCurrentKg({...currentKg, location: e.target.value})} required />
                                </div>
                                <div className={styles.formRow}>
                                    <div className={styles.formGroup}>
                                        <label>{t('capacity')}</label>
                                        <input type="number" min="1" value={currentKg.capacity} onChange={e => setCurrentKg({...currentKg, capacity: e.target.value})} required />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>{t('monthlyFee')} ({t('currency')})</label>
                                        <input type="number" min="0" value={currentKg.monthlyFee} onChange={e => setCurrentKg({...currentKg, monthlyFee: e.target.value})} required />
                                    </div>
                                </div>
                                <div className={styles.modalFooter}>
                                    <button type="button" className={`${styles.btn} ${styles.btnSecondary}`} onClick={() => setShowEditModal(false)}>
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