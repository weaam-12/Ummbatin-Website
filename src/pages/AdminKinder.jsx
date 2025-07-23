// AdminKinder.jsx
import React, { useEffect, useState } from 'react';
import {
    fetchKindergartens,
    createKindergarten,
    deleteKindergarten,
    getAllUsers,
    updateKindergarten,
} from '../api';
import './AdminKinder.css';

export default function AdminKinder() {
    /* ---------- state ---------- */
    const [kindergartens, setKindergartens] = useState([]);
    const [users, setUsers] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [currentKg, setCurrentKg] = useState({});
    const [newKg, setNewKg] = useState({ name: '', location: '', capacity: '', monthlyFee: '' });
    const [childrenMap, setChildrenMap] = useState({});
    const [stats, setStats] = useState({ totalChildren: 0, pendingRequests: 0, totalRevenue: 0 });
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState(null);

    /* ---------- load data ---------- */
    useEffect(() => {
        loadAll();
    }, []);

    const loadAll = async () => {
        setLoading(true);
        try {
            const [kgs, usersData] = await Promise.all([
                fetchKindergartens(),
                getAllUsers().catch(() => []),
            ]);

            setKindergartens(kgs);
            setUsers(usersData);

            // Calculate statistics
            let totalChildren = 0;
            let pendingRequests = 0;
            let totalRevenue = 0;

            const map = {};
            await Promise.all(
                kgs.map(async (kg) => {
                    try {
                        const { data: children } = await axiosInstance.get(
                            `/api/kindergartens/${kg.kindergartenId}/children`
                        );
                        const { data: requests } = await axiosInstance.get(
                            `/api/kindergartens/${kg.kindergartenId}/requests`
                        );

                        totalChildren += children.length;
                        pendingRequests += requests.filter(r => r.status === 'PENDING').length;
                        totalRevenue += children.filter(c => c.paid).reduce((sum, child) => sum + kg.monthlyFee, 0);

                        map[kg.kindergartenId] = { children, requests };
                    } catch (error) {
                        console.error(`Error loading data for KG ${kg.kindergartenId}:`, error);
                        map[kg.kindergartenId] = { children: [], requests: [] };
                    }
                })
            );

            setChildrenMap(map);
            setStats({
                totalChildren,
                pendingRequests,
                totalRevenue
            });
        } catch (error) {
            setNotification({ type: 'danger', message: 'Failed to load data' });
        } finally {
            setLoading(false);
        }
    };

    /* ---------- kindergarten CRUD ---------- */
    const handleAddKg = async (e) => {
        e.preventDefault();
        try {
            await createKindergarten(newKg);
            setShowAddModal(false);
            setNewKg({ name: '', location: '', capacity: '', monthlyFee: '' });
            setNotification({ type: 'success', message: 'تمت إضافة الحضانة بنجاح' });
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

    /* ---------- enrollment actions ---------- */
    const handleApprove = async (requestId, approve) => {
        try {
            await axiosInstance.patch(`/api/enrollments/${requestId}`, {
                status: approve ? 'APPROVED' : 'REJECTED'
            });
            setNotification({ type: 'success', message: approve ? 'تم قبول الطلب' : 'تم رفض الطلب' });
            loadAll();
        } catch (error) {
            setNotification({ type: 'danger', message: 'فشل في معالجة الطلب' });
        }
    };

    const handleMarkPaid = async (requestId) => {
        try {
            await axiosInstance.patch(`/api/enrollments/${requestId}/pay`);
            setNotification({ type: 'success', message: 'تم تسجيل الدفع بنجاح' });
            loadAll();
        } catch (error) {
            setNotification({ type: 'danger', message: 'فشل في تسجيل الدفع' });
        }
    };

    const moveChild = async (childId, targetKgId) => {
        try {
            await axiosInstance.put(`/api/children/${childId}/move`, {
                kindergartenId: targetKgId
            });
            setNotification({ type: 'success', message: 'تم نقل الطفل بنجاح' });
            loadAll();
        } catch (error) {
            setNotification({ type: 'danger', message: 'فشل في نقل الطفل' });
        }
    };

    const toggleKindergartenStatus = async (kgId, currentStatus) => {
        try {
            await axiosInstance.patch(`/api/kindergartens/${kgId}/status`, {
                status: currentStatus === 'OPEN' ? 'CLOSED' : 'OPEN'
            });
            setNotification({ type: 'success', message: `تم ${currentStatus === 'OPEN' ? 'إغلاق' : 'فتح'} الحضانة` });
            loadAll();
        } catch (error) {
            setNotification({ type: 'danger', message: 'فشل في تغيير حالة الحضانة' });
        }
    };

    /* ---------- render ---------- */
    return (
        <div className="admin-kinder">
            {notification && (
                <div className={`notification ${notification.type}`}>
                    {notification.message}
                    <button onClick={() => setNotification(null)}>×</button>
                </div>
            )}

            <div className="toolbar">
                <h1>إدارة الحضانات</h1>
                <button
                    className="admin-btn primary"
                    onClick={() => setShowAddModal(true)}
                >
                    <FiPlus /> إضافة حضانة جديدة
                </button>
            </div>

            {/* Statistics Cards */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon">
                        <FiHome />
                    </div>
                    <div className="stat-info">
                        <h3>عدد الحضانات</h3>
                        <p>{kindergartens.length}</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">
                        <FiUsers />
                    </div>
                    <div className="stat-info">
                        <h3>عدد الأطفال</h3>
                        <p>{stats.totalChildren}</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">
                        <FiFileText />
                    </div>
                    <div className="stat-info">
                        <h3>طلبات الانتظار</h3>
                        <p>{stats.pendingRequests}</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">
                        <FiDollarSign />
                    </div>
                    <div className="stat-info">
                        <h3>إجمالي الإيرادات</h3>
                        <p>{stats.totalRevenue} شيكل</p>
                    </div>
                </div>
            </div>

            {/* Kindergartens Table */}
            <div className="table-container">
                <table className="admin-table">
                    <thead>
                    <tr>
                        <th>#</th>
                        <th>اسم الحضانة</th>
                        <th>الموقع</th>
                        <th>السعة</th>
                        <th>المشغول</th>
                        <th>الرسوم الشهرية</th>
                        <th>الحالة</th>
                        <th>الإجراءات</th>
                    </tr>
                    </thead>
                    <tbody>
                    {kindergartens.map((kg) => {
                        const enrolled = childrenMap[kg.kindergartenId]?.children?.length || 0;
                        const available = kg.capacity - enrolled;
                        return (
                            <tr key={kg.kindergartenId}>
                                <td>{kg.kindergartenId}</td>
                                <td>
                                    <strong>{kg.name}</strong>
                                </td>
                                <td>{kg.location}</td>
                                <td>
                                    {kg.capacity}
                                    {available <= 0 && <span className="badge danger">مكتمل</span>}
                                    {available > 0 && available <= 5 && <span className="badge warning">أماكن محدودة</span>}
                                </td>
                                <td>{enrolled}</td>
                                <td>{kg.monthlyFee} شيكل</td>
                                <td>
                                        <span className={`status ${kg.status?.toLowerCase()}`}>
                                            {kg.status === 'OPEN' ? 'مفتوحة' : 'مغلقة'}
                                        </span>
                                </td>
                                <td className="actions">
                                    <button
                                        className="admin-btn primary"
                                        onClick={() => {
                                            setCurrentKg(kg);
                                            setShowEditModal(true);
                                        }}
                                    >
                                        تعديل
                                    </button>
                                    <button
                                        className="admin-btn danger"
                                        onClick={() => handleDeleteKg(kg.kindergartenId)}
                                    >
                                        حذف
                                    </button>
                                    <button
                                        className="admin-btn success"
                                        onClick={() => toggleKindergartenStatus(kg.kindergartenId, kg.status)}
                                    >
                                        {kg.status === 'OPEN' ? 'إغلاق' : 'فتح'}
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                    </tbody>
                </table>
            </div>

            {/* Kindergarten Details */}
            {kindergartens.map((kg) => {
                const { children = [], requests = [] } = childrenMap[kg.kindergartenId] || {};
                const pendingRequests = requests.filter(r => r.status === 'PENDING');

                return (
                    <details key={kg.kindergartenId} className="kg-details">
                        <summary>
                            {kg.name} - {children.length} / {kg.capacity} طفل
                            <span className="ml-1">
                                {pendingRequests.length > 0 && (
                                    <span className="badge danger">{pendingRequests.length} طلب جديد</span>
                                )}
                            </span>
                        </summary>

                        <div className="content">
                            {/* Children Table */}
                            <h3>الأطفال المسجلين</h3>
                            {children.length > 0 ? (
                                <div className="table-responsive">
                                    <table className="admin-table">
                                        <thead>
                                        <tr>
                                            <th>الاسم</th>
                                            <th>العمر</th>
                                            <th>ولي الأمر</th>
                                            <th>تاريخ التسجيل</th>
                                            <th>حالة الدفع</th>
                                            <th>نقل إلى</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {children.map((child) => (
                                            <tr key={child.childId}>
                                                <td>
                                                    <strong>{child.name}</strong>
                                                    {child.specialNeeds && <span className="badge warning">احتياجات خاصة</span>}
                                                </td>
                                                <td>{child.age} سنوات</td>
                                                <td>
                                                    {users.find(u => u.userId === child.userId)?.fullName || 'غير معروف'}
                                                    <div className="text-xs">{child.userPhone}</div>
                                                </td>
                                                <td>{new Date(child.enrollmentDate).toLocaleDateString()}</td>
                                                <td>
                                                    {child.paid ? (
                                                        <span className="badge success">تم الدفع</span>
                                                    ) : (
                                                        <button
                                                            className="admin-btn success sm"
                                                            onClick={() => handleMarkPaid(child.enrollmentId)}
                                                        >
                                                            تسديد
                                                        </button>
                                                    )}
                                                </td>
                                                <td>
                                                    <select
                                                        className="admin-select"
                                                        onChange={(e) => moveChild(child.childId, e.target.value)}
                                                        defaultValue=""
                                                    >
                                                        <option value="" disabled>اختر حضانة</option>
                                                        {kindergartens
                                                            .filter(k => k.kindergartenId !== kg.kindergartenId)
                                                            .map(k => (
                                                                <option key={k.kindergartenId} value={k.kindergartenId}>
                                                                    {k.name} ({k.capacity - (childrenMap[k.kindergartenId]?.children?.length || 0)} متبقي)
                                                                </option>
                                                            ))}
                                                    </select>
                                                </td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <p className="text-center">لا يوجد أطفال مسجلين في هذه الحضانة</p>
                            )}

                            {/* Pending Requests */}
                            {pendingRequests.length > 0 && (
                                <>
                                    <h3>طلبات الانتظار</h3>
                                    <div className="table-responsive">
                                        <table className="admin-table">
                                            <thead>
                                            <tr>
                                                <th>الاسم</th>
                                                <th>العمر</th>
                                                <th>ولي الأمر</th>
                                                <th>التاريخ</th>
                                                <th>حالة الدفع</th>
                                                <th>الإجراءات</th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {pendingRequests.map((req) => (
                                                <tr key={req.requestId}>
                                                    <td>
                                                        <strong>{req.childName}</strong>
                                                        {req.specialNeeds && <span className="badge warning">احتياجات خاصة</span>}
                                                    </td>
                                                    <td>{req.childAge} سنوات</td>
                                                    <td>
                                                        {users.find(u => u.userId === req.userId)?.fullName || 'غير معروف'}
                                                        <div className="text-xs">{req.userPhone}</div>
                                                    </td>
                                                    <td>{new Date(req.requestDate).toLocaleDateString()}</td>
                                                    <td>
                                                        {req.paid ? (
                                                            <span className="badge success">تم الدفع</span>
                                                        ) : (
                                                            <button
                                                                className="admin-btn success sm"
                                                                onClick={() => handleMarkPaid(req.requestId)}
                                                            >
                                                                تسديد
                                                            </button>
                                                        )}
                                                    </td>
                                                    <td className="actions">
                                                        <button
                                                            className="admin-btn primary sm"
                                                            onClick={() => handleApprove(req.requestId, true)}
                                                        >
                                                            قبول
                                                        </button>
                                                        <button
                                                            className="admin-btn danger sm"
                                                            onClick={() => handleApprove(req.requestId, false)}
                                                        >
                                                            رفض
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </>
                            )}
                        </div>
                    </details>
                );
            })}

            {/* Add Kindergarten Modal */}
            {showAddModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h2>إضافة حضانة جديدة</h2>
                        <form onSubmit={handleAddKg}>
                            <div className="form-group">
                                <label>اسم الحضانة</label>
                                <input
                                    type="text"
                                    value={newKg.name}
                                    onChange={(e) => setNewKg({...newKg, name: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>الموقع</label>
                                <input
                                    type="text"
                                    value={newKg.location}
                                    onChange={(e) => setNewKg({...newKg, location: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>السعة</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={newKg.capacity}
                                        onChange={(e) => setNewKg({...newKg, capacity: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>الرسوم الشهرية (شيكل)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={newKg.monthlyFee}
                                        onChange={(e) => setNewKg({...newKg, monthlyFee: e.target.value})}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="modal-actions">
                                <button
                                    type="button"
                                    className="admin-btn secondary"
                                    onClick={() => setShowAddModal(false)}
                                >
                                    إلغاء
                                </button>
                                <button type="submit" className="admin-btn primary">
                                    حفظ
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Kindergarten Modal */}
            {showEditModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h2>تعديل بيانات الحضانة</h2>
                        <form onSubmit={handleEditKg}>
                            <div className="form-group">
                                <label>اسم الحضانة</label>
                                <input
                                    type="text"
                                    value={currentKg.name}
                                    onChange={(e) => setCurrentKg({...currentKg, name: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>الموقع</label>
                                <input
                                    type="text"
                                    value={currentKg.location}
                                    onChange={(e) => setCurrentKg({...currentKg, location: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>السعة</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={currentKg.capacity}
                                        onChange={(e) => setCurrentKg({...currentKg, capacity: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>الرسوم الشهرية (شيكل)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={currentKg.monthlyFee}
                                        onChange={(e) => setCurrentKg({...currentKg, monthlyFee: e.target.value})}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="modal-actions">
                                <button
                                    type="button"
                                    className="admin-btn secondary"
                                    onClick={() => setShowEditModal(false)}
                                >
                                    إلغاء
                                </button>
                                <button type="submit" className="admin-btn primary">
                                    حفظ التعديلات
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}