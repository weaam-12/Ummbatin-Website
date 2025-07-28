import React, { useState, useEffect } from 'react';
import { FiHome, FiUsers, FiFileText, FiDollarSign, FiPlus, FiEdit, FiTrash2, FiCheck, FiX } from 'react-icons/fi';
import styles from './AdminKinder.module.css';
import { fetchKindergartens, createKindergarten, deleteKindergarten, getAllUsers, updateKindergarten } from '../api';

const AdminKinder = () => {
    const [kindergartens, setKindergartens] = useState([]);
    const [users, setUsers] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [currentKg, setCurrentKg] = useState({});
    const [newKg, setNewKg] = useState({ name: '', location: '', capacity: '', monthlyFee: '' });
    const [stats, setStats] = useState({ totalChildren: 0, pendingRequests: 0, totalRevenue: 0 });
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState(null);

    useEffect(() => {
        const loadAll = async () => {
            setLoading(true);
            try {
                const kgs = await fetchKindergartens();
                console.log('Fetched kindergartens:', kgs); // Verify the data received

                setKindergartens(kgs);

                // Calculate statistics
                const totalChildren = kgs.reduce((sum, kg) => sum + kg.children.length, 0);
                const pendingRequests = kgs.reduce((sum, kg) => sum + (kg.pendingRequests || 0), 0);
                const totalRevenue = kgs.reduce((sum, kg) => sum + (kg.revenue || 0), 0);

                setStats({ totalChildren, pendingRequests, totalRevenue });
            } catch (error) {
                console.error('Error loading data:', error);
                setNotification({ type: 'danger', message: 'فشل في تحميل البيانات' });
            } finally {
                setLoading(false);
            }
        };
        loadAll();
    }, []);

    const handleAddKg = async (e) => {
        e.preventDefault();
        try {
            await createKindergarten(newKg);
            setShowAddModal(false);
            setNewKg({ name: '', location: '', capacity: '', monthlyFee: '' });
            setNotification({ type: 'success', message: 'تم إضافة الحضانة بنجاح' });
            loadAll();
        } catch (error) {
            setNotification({ type: 'danger', message: 'فشل في إضافة الحضانة' });
        }
    };

    const handleEditKg = async (e) => {
        e.preventDefault();
        try {
            await updateKindergarten(currentKg.kindergartenId, currentKg);
            setShowEditModal(false);
            setNotification({ type: 'success', message: 'تم تحديث بيانات الحضانة' });
            loadAll();
        } catch (error) {
            setNotification({ type: 'danger', message: 'فشل في تحديث البيانات' });
        }
    };

    const handleDeleteKg = async (id) => {
        if (window.confirm('هل أنت متأكد من حذف هذه الحضانة؟ سيتم حذف جميع البيانات المرتبطة بها.')) {
            try {
                await deleteKindergarten(id);
                setNotification({ type: 'success', message: 'تم حذف الحضانة بنجاح' });
                loadAll();
            } catch (error) {
                setNotification({ type: 'danger', message: 'فشل في حذف الحضانة' });
            }
        }
    };

    const toggleKindergartenStatus = async (kg) => {
        try {
            await updateKindergarten(kg.kindergartenId, {
                ...kg,
                status: kg.status === 'OPEN' ? 'CLOSED' : 'OPEN'
            });
            setNotification({
                type: 'success',
                message: `تم ${kg.status === 'OPEN' ? 'إغلاق' : 'فتح'} الحضانة بنجاح`
            });
            loadAll();
        } catch (error) {
            setNotification({ type: 'danger', message: 'فشل في تغيير حالة الحضانة' });
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                {/* Header */}
                <div className={styles.header}>
                    <div className={styles.headerTitle}>
                        <FiHome />
                        <h1>إدارة الحضانات - بلدية أم بطين</h1>
                    </div>

                    <button
                        className={`${styles.btn} ${styles.btnPrimary}`}
                        onClick={() => setShowAddModal(true)}
                    >
                        <FiPlus /> إضافة حضانة
                    </button>
                </div>

                {/* Notification */}
                {notification && (
                    <div className={`${styles.notification} ${
                        notification.type === 'danger' ? styles.alertDanger : styles.alertSuccess
                    }`}>
                        {notification.message}
                        <button onClick={() => setNotification(null)}>
                            <FiX />
                        </button>
                    </div>
                )}

                {/* Statistics */}
                <div className={styles.statsGrid}>
                    <div className={styles.statCard}>
                        <div className={styles.statIcon}>
                            <FiHome />
                        </div>
                        <div className={styles.statInfo}>
                            <h3>عدد الحضانات</h3>
                            <p>{kindergartens.length}</p>
                        </div>
                    </div>

                    <div className={styles.statCard}>
                        <div className={styles.statIcon}>
                            <FiUsers />
                        </div>
                        <div className={styles.statInfo}>
                            <h3>عدد الأطفال</h3>
                            <p>{stats.totalChildren}</p>
                        </div>
                    </div>

                    <div className={styles.statCard}>
                        <div className={styles.statIcon}>
                            <FiFileText />
                        </div>
                        <div className={styles.statInfo}>
                            <h3>طلبات الانتظار</h3>
                            <p>{stats.pendingRequests}</p>
                        </div>
                    </div>

                    <div className={styles.statCard}>
                        <div className={styles.statIcon}>
                            <FiDollarSign />
                        </div>
                        <div className={styles.statInfo}>
                            <h3>إجمالي الإيرادات</h3>
                            <p>{stats.totalRevenue} شيكل</p>
                        </div>
                    </div>
                </div>

                {/* Kindergartens Table */}
                <div className={styles.tableContainer}>
                    <table className={styles.table}>
                        <thead>
                        <tr>
                            <th>#</th>
                            <th>اسم الحضانة</th>
                            <th>الموقع</th>
                            <th>السعة</th>
                            <th>المشغول</th>
                            <th>الرسوم</th>
                            <th>الحالة</th>
                            <th>الإجراءات</th>
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
                                            {kg.pendingRequests} طلب جديد
                                        </span>
                                    )}
                                </td>
                                <td>{kg.location}</td>
                                <td>
                                    {kg.capacity}
                                    {kg.capacity - kg.children.length <= 0 && (
                                        <span className={`${styles.badge} ${styles.badgeDanger}`}>مكتمل</span>
                                    )}
                                    {kg.capacity - kg.children.length > 0 && kg.capacity - kg.children.length <= 5 && (
                                        <span className={`${styles.badge} ${styles.badgeWarning}`}>أماكن محدودة</span>
                                    )}
                                </td>
                                <td>{kg.children.length}</td>
                                <td>{kg.monthlyFee} شيكل</td>
                                <td>
                                    <span className={`${styles.badge} ${kg.status === 'OPEN' ? styles.badgeSuccess : styles.badgeDanger}`}>
                                        {kg.status === 'OPEN' ? 'مفتوحة' : 'مغلقة'}
                                    </span>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button
                                            className={`${styles.btn} ${styles.btnPrimary} ${styles.btnSm}`}
                                            onClick={() => {
                                                setCurrentKg(kg);
                                                setShowEditModal(true);
                                            }}
                                        >
                                            <FiEdit /> تعديل
                                        </button>
                                        <button
                                            className={`${styles.btn} ${styles.btnDanger} ${styles.btnSm}`}
                                            onClick={() => handleDeleteKg(kg.kindergartenId)}
                                        >
                                            <FiTrash2 /> حذف
                                        </button>
                                        <button
                                            className={`${styles.btn} ${kg.status === 'OPEN' ? styles.btnDanger : styles.btnSuccess} ${styles.btnSm}`}
                                            onClick={() => toggleKindergartenStatus(kg)}
                                        >
                                            {kg.status === 'OPEN' ? 'إغلاق' : 'فتح'}
                                        </button>
                                    </div>
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
                            {kg.name} - {kg.children.length} / {kg.capacity} طفل
                        </summary>
                        <div className={styles.detailsContent}>
                            <h3>الأطفال المسجلين</h3>
                            {kg.children.length > 0 ? (
                                <div className={styles.tableContainer}>
                                    <table className={styles.table}>
                                        <thead>
                                        <tr>
                                            <th>اسم الطفل</th>
                                            <th>العمر</th>
                                            <th>ولي الأمر</th>
                                            <th>حالة الدفع</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {kg.children.map(child => (
                                            <tr key={child.childId}>
                                                <td>{child.name}</td>
                                                <td>{new Date(child.birthDate).getFullYear()}-{new Date(child.birthDate).getMonth() + 1} سنوات</td>
                                                <td>
                                                    {users.find(u => u.id === child.user.id)?.fullName || 'غير معروف'}
                                                </td>
                                                <td>
                                                    {child.paid ? (
                                                        <span className={`${styles.badge} ${styles.badgeSuccess}`}>تم الدفع</span>
                                                    ) : (
                                                        <span className={`${styles.badge} ${styles.badgeDanger}`}>غير مدفوع</span>
                                                    )}
                                                </td>
                                            </tr>
                                        )))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <p style={{ textAlign: 'center', color: '#666' }}>لا يوجد أطفال مسجلين في هذه الحضانة</p>
                            )}
                        </div>
                    </details>
                ))}

                {/* Add Kindergarten Modal */}
                {showAddModal && (
                    <div className={styles.modalOverlay}>
                        <div className={styles.modal}>
                            <div className={styles.modalHeader}>
                                <h2>إضافة حضانة جديدة</h2>
                            </div>
                            <form onSubmit={handleAddKg} className={styles.modalBody}>
                                <div className={styles.formGroup}>
                                    <label>اسم الحضانة</label>
                                    <input
                                        type="text"
                                        value={newKg.name}
                                        onChange={(e) => setNewKg({ ...newKg, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>الموقع</label>
                                    <input
                                        type="text"
                                        value={newKg.location}
                                        onChange={(e) => setNewKg({ ...newKg, location: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className={styles.formRow}>
                                    <div className={styles.formGroup}>
                                        <label>السعة</label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={newKg.capacity}
                                            onChange={(e) => setNewKg({ ...newKg, capacity: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>الرسوم الشهرية (شيكل)</label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={newKg.monthlyFee}
                                            onChange={(e) => setNewKg({ ...newKg, monthlyFee: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className={styles.modalFooter}>
                                    <button
                                        type="button"
                                        className={`${styles.btn} ${styles.btnSecondary}`}
                                        onClick={() => setShowAddModal(false)}
                                    >
                                        <FiX /> إلغاء
                                    </button>
                                    <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`}>
                                        <FiCheck /> حفظ
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Edit Kindergarten Modal */}
                {showEditModal && (
                    <div className={styles.modalOverlay}>
                        <div className={styles.modal}>
                            <div className={styles.modalHeader}>
                                <h2>تعديل بيانات الحضانة</h2>
                            </div>
                            <form onSubmit={handleEditKg} className={styles.modalBody}>
                                <div className={styles.formGroup}>
                                    <label>اسم الحضانة</label>
                                    <input
                                        type="text"
                                        value={currentKg.name}
                                        onChange={(e) => setCurrentKg({ ...currentKg, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>الموقع</label>
                                    <input
                                        type="text"
                                        value={currentKg.location}
                                        onChange={(e) => setCurrentKg({ ...currentKg, location: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className={styles.formRow}>
                                    <div className={styles.formGroup}>
                                        <label>السعة</label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={currentKg.capacity}
                                            onChange={(e) => setCurrentKg({ ...currentKg, capacity: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>الرسوم الشهرية (شيكل)</label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={currentKg.monthlyFee}
                                            onChange={(e) => setCurrentKg({ ...currentKg, monthlyFee: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className={styles.modalFooter}>
                                    <button
                                        type="button"
                                        className={`${styles.btn} ${styles.btnSecondary}`}
                                        onClick={() => setShowEditModal(false)}
                                    >
                                        <FiX /> إلغاء
                                    </button>
                                    <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`}>
                                        <FiCheck /> حفظ التعديلات
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