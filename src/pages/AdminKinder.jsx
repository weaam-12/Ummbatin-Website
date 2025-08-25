import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
    FiHome, FiUsers, FiFileText, FiDollarSign,
    FiPlus, FiEdit, FiTrash2, FiCheck, FiX, FiChevronDown, FiChevronUp
} from 'react-icons/fi';
import styles from './AdminKinder.module.css';
import {
    fetchKindergartens,
    createKindergarten,
    deleteKindergarten,
    updateKindergarten,
    updateChildAssignment,
} from '../api';
import { axiosInstance } from '../api';

const AdminKinder = () => {
    const { t } = useTranslation();

    // State management
    const [kindergartens, setKindergartens] = useState([]);
    const [pendingChildren, setPendingChildren] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [currentChildToAssign, setCurrentChildToAssign] = useState(null);
    const [currentKg, setCurrentKg] = useState({});
    const [newKg, setNewKg] = useState({ name: '', location: '', capacity: '' });
    const [stats, setStats] = useState({ totalChildren: 0, pendingRequests: 0, approvedCount: 0 });
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState(null);
    const [expandedSections, setExpandedSections] = useState({});

    // Load all data
    const loadAll = async () => {
        setLoading(true);
        try {
            const kgs = await fetchKindergartens();
            setKindergartens(kgs);
            const allChildren = kgs.flatMap(kg => kg.children || []);
            const pending = allChildren.filter(c => c.monthlyFee === 2.5);
            const approved = allChildren.filter(c => c.monthlyFee === 3.5);

            setPendingChildren(pending);
            setStats({
                totalChildren: allChildren.length,
                pendingRequests: pending.length,
                approvedCount: approved.length
            });
        } catch {
            setNotification({ type: 'danger', message: t('loadError') });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadAll(); }, []);

    // Toggle section expansion
    const toggleSection = (id) => {
        setExpandedSections(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    // Handle child assignment
    const handleAssignChild = async (child, kindergartenId, monthlyFee) => {
        try {
            await updateChildAssignment(child.childId, { kindergartenId, monthlyFee });

            // البحث عن الحضانة للحصول على اسمها
            const kindergarten = kindergartens.find(kg => kg.kindergartenId === kindergartenId);
            const kindergartenName = kindergarten ? kindergarten.name : 'الحضانة';

            // إرسال الإشعار إلى المستخدم
            await axiosInstance.post('/api/notifications', {
                userId: child.user.id, // تأكد أن child تحتوي على userId
                message: `התקבלה אישור להרשמת ${child.name} לגן ${kindergartenName}.`,
                type: 'KINDERGARTEN_APPROVED'
            });

            setNotification({ type: 'success', message: t('assigned') });
            setShowAssignModal(false);
            setCurrentChildToAssign(null);
            loadAll();
        } catch (error) {
            console.error('Assign error:', error);
            setNotification({ type: 'danger', message: t('updateError') });
        }
    };

    // Kindergarten CRUD operations
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

    // Render components
    const renderStats = () => (
        <div className={styles.statsGrid}>
            {[
                { icon: FiHome, label: t('totalKindergartens'), value: kindergartens.length },
                { icon: FiUsers, label: t('totalChildren'), value: stats.totalChildren },
                { icon: FiFileText, label: t('pendingRequests'), value: stats.pendingRequests },
                { icon: FiDollarSign, label: t('approvedCount'), value: stats.approvedCount }
            ].map(({ icon: Icon, label, value }) => (
                <div className={styles.statCard} key={label}>
                    <div className={styles.statIcon}><Icon /></div>
                    <div className={styles.statInfo}>
                        <h3>{label}</h3>
                        <p>{value}</p>
                    </div>
                </div>
            ))}
        </div>
    );

    const renderKindergartensTable = () => (
        <div className={styles.tableContainer}>
            <table className={styles.table}>
                <thead>
                <tr>
                    <th>#</th>
                    <th>{t('name')}</th>
                    <th>{t('location')}</th>
                    <th>{t('capacity')}</th>
                    <th>{t('occupied')}</th>
                    <th>{t('actions')}</th>
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
                            <div className={styles.actionButtons}>
                                <button
                                    className={`${styles.btn} ${styles.btnPrimary} ${styles.btnSm}`}
                                    onClick={() => { setCurrentKg(kg); setShowEditModal(true); }}
                                >
                                    <FiEdit /> {t('edit')}
                                </button>
                                <button
                                    className={`${styles.btn} ${styles.btnDanger} ${styles.btnSm}`}
                                    onClick={() => handleDeleteKg(kg.kindergartenId)}
                                >
                                    <FiTrash2 /> {t('delete')}
                                </button>
                            </div>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );

    const renderPendingRequests = () => (
        pendingChildren.length > 0 && (
            <section className={styles.pendingSection}>
                <div className={styles.sectionHeader}>
                    <h2>{t('pendingRequests')} <span className={styles.badge}>{pendingChildren.length}</span></h2>
                </div>
                <div className={styles.tableContainer}>
                    <table className={styles.table}>
                        <thead>
                        <tr>
                            <th>#</th>
                            <th>{t('childName')}</th>
                            <th>{t('motherName')}</th>
                            <th>{t('kindergarten')}</th> {/* 👈 جديد */}
                            <th>{t('actions')}</th>
                        </tr>
                        </thead>
                        <tbody>
                        {pendingChildren.map(c => {
                            const kg = kindergartens.find(k => k.kindergartenId === c.kindergartenId);
                            return (
                                <tr key={c.childId}>
                                    <td>{c.childId}</td>
                                    <td>{c.name}</td>
                                    <td>{c.motherName || '–'}</td>
                                    <td>{kg ? kg.name : '–'}</td> {/* 👈 جديد */}
                                    <td>
                                        <div className={styles.actionButtons}>
                                            <button
                                                className={`${styles.btn} ${styles.btnSuccess} ${styles.btnSm}`}
                                                onClick={() => handleAssignChild(c, c.kindergartenId, 3.5)}
                                            >
                                                <FiCheck /> {t('approve')}
                                            </button>
                                            <button
                                                className={`${styles.btn} ${styles.btnDanger} ${styles.btnSm}`}
                                                onClick={() => { setCurrentChildToAssign(c); setShowAssignModal(true); }}
                                            >
                                                <FiX /> {t('reject')}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                        </tbody>
                    </table>
                </div>
            </section>
        )
    );

    const renderKindergartenDetails = () => (
        kindergartens.map(kg => (
            <div key={kg.kindergartenId} className={styles.detailsSection}>
                <div
                    className={styles.sectionHeader}
                    onClick={() => toggleSection(kg.kindergartenId)}
                >
                    <h2>
                        {kg.name}
                        <span className={styles.occupancy}>
                            ({kg.children?.filter(c => c.monthlyFee !== 2.5).length || 0}/{kg.capacity})
                        </span>
                    </h2>
                    <div className={styles.chevron}>
                        {expandedSections[kg.kindergartenId] ? <FiChevronUp /> : <FiChevronDown />}
                    </div>
                </div>

                {expandedSections[kg.kindergartenId] && (
                    <div className={styles.sectionContent}>
                        <h3>{t('registeredChildren')}</h3>
                        {kg.children?.filter(c => c.monthlyFee !== 2.5).length ? (
                            <div className={styles.tableContainer}>
                                <table className={styles.table}>
                                    <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>{t('childName')}</th>
                                        <th>{t('motherName')}</th>
                                        <th>{t('status')}</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {kg.children.filter(c => c.monthlyFee !== 2.5).map(child => (
                                        <tr key={child.childId}>
                                            <td>{child.childId}</td>
                                            <td>{child.name}</td>
                                            <td>{child.motherName || '–'}</td>

                                            <td>
                                                {child.monthlyFee === 3.5
                                                    ? <span
                                                        className={`${styles.badge} ${styles.badgeSuccess}`}>{t('approvedCount')}</span>
                                                    : <span
                                                        className={`${styles.badge} ${styles.badgeSecondary}`}>{t('notRegistered')}</span>}
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className={styles.noData}>{t('noChildren')}</p>
                        )}
                    </div>
                )}
            </div>
        ))
    );

    const renderAddModal = () => (
        <div className={styles.modalOverlay}>
            <div className={styles.modal}>
                <div className={styles.modalHeader}>
                    <h2>{t('addNew')}</h2>
                    <button onClick={() => setShowAddModal(false)} className={styles.closeButton}>
                        <FiX />
                    </button>
                </div>
                <form onSubmit={handleAddKg} className={styles.modalBody}>
                    <div className={styles.formGroup}>
                        <label>{t('name')}</label>
                        <input
                            type="text"
                            value={newKg.name}
                            onChange={e => setNewKg({...newKg, name: e.target.value})}
                            required
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label>{t('location')}</label>
                        <input
                            type="text"
                            value={newKg.location}
                            onChange={e => setNewKg({...newKg, location: e.target.value})}
                            required
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label>{t('capacity')}</label>
                        <input
                            type="number"
                            min="1"
                            value={newKg.capacity}
                            onChange={e => setNewKg({...newKg, capacity: e.target.value})}
                            required
                        />
                    </div>
                    <div className={styles.modalFooter}>
                        <button
                            type="button"
                            className={`${styles.btn} ${styles.btnSecondary}`}
                            onClick={() => setShowAddModal(false)}
                        >
                            {t('cancel')}
                        </button>
                        <button
                            type="submit"
                            className={`${styles.btn} ${styles.btnPrimary}`}
                        >
                            {t('save')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );

    const renderEditModal = () => (
        <div className={styles.modalOverlay}>
            <div className={styles.modal}>
                <div className={styles.modalHeader}>
                    <h2>{t('editKg')}</h2>
                    <button onClick={() => setShowEditModal(false)} className={styles.closeButton}>
                        <FiX />
                    </button>
                </div>
                <form onSubmit={handleEditKg} className={styles.modalBody}>
                    <div className={styles.formGroup}>
                        <label>{t('name')}</label>
                        <input
                            type="text"
                            value={currentKg.name}
                            onChange={e => setCurrentKg({...currentKg, name: e.target.value})}
                            required
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label>{t('location')}</label>
                        <input
                            type="text"
                            value={currentKg.location}
                            onChange={e => setCurrentKg({...currentKg, location: e.target.value})}
                            required
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label>{t('capacity')}</label>
                        <input
                            type="number"
                            min="1"
                            value={currentKg.capacity}
                            onChange={e => setCurrentKg({...currentKg, capacity: e.target.value})}
                            required
                        />
                    </div>
                    <div className={styles.modalFooter}>
                        <button
                            type="button"
                            className={`${styles.btn} ${styles.btnSecondary}`}
                            onClick={() => setShowEditModal(false)}
                        >
                            {t('cancel')}
                        </button>
                        <button
                            type="submit"
                            className={`${styles.btn} ${styles.btnPrimary}`}
                        >
                            {t('save')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );

    const renderAssignModal = () => (
        showAssignModal && currentChildToAssign && (
            <div className={styles.modalOverlay}>
                <div className={styles.modal}>
                    <div className={styles.modalHeader}>
                        <h2>{t('assignChild')}</h2>
                        <button onClick={() => setShowAssignModal(false)} className={styles.closeButton}>
                            <FiX />
                        </button>
                    </div>
                    <div className={styles.modalBody}>
                        <p className={styles.assignText}>
                            {t('chooseKindergarten')} <strong>{currentChildToAssign.name}</strong>
                        </p>
                        <select
                            className={styles.selectInput}
                            onChange={(e) => {
                                const [id] = e.target.value.split('|');
                                handleAssignChild(currentChildToAssign.childId, Number(id), 1.5);
                            }}
                        >
                            <option value="">{t('select')}</option>
                            {kindergartens.map(kg => (
                                <option key={kg.kindergartenId} value={`${kg.kindergartenId}|${kg.name}`}>
                                    {kg.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className={styles.modalFooter}>
                        <button
                            className={`${styles.btn} ${styles.btnSecondary}`}
                            onClick={() => setShowAssignModal(false)}
                        >
                            {t('cancel')}
                        </button>
                    </div>
                </div>
            </div>
        )
    );

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                {/* Header */}
                <div className={styles.header}>
                    <div className={styles.headerTitle}>
                        <FiHome />
                        <h1>{t('title')} – {t('municipality')}</h1>
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
                        <button onClick={() => setNotification(null)} className={styles.notificationClose}>
                            <FiX />
                        </button>
                    </div>
                )}

                {/* Main Content */}
                <div className={styles.content}>
                    {renderStats()}
                    {renderKindergartensTable()}
                    {renderPendingRequests()}
                    {renderKindergartenDetails()}
                </div>

                {/* Modals */}
                {showAddModal && renderAddModal()}
                {showEditModal && renderEditModal()}
                {renderAssignModal()}
            </div>
        </div>
    );
};

export default AdminKinder;