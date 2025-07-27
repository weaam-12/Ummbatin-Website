import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import axiosInstance from "../api";
import { useTranslation } from "react-i18next";
import {
    FiTrash2,
    FiUserPlus,
    FiRefreshCw,
    FiEdit,
    FiMoreVertical,
    FiEye,
    FiX,
    FiCheck,
    FiUser,
    FiShield,
    FiHome,
    FiCheckCircle
} from "react-icons/fi";
import "./AdminDashboard.css";

function AdminDashboard() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [pagination, setPagination] = useState({ page: 0, size: 10, total: 0 });
    const [showDropdownId, setShowDropdownId] = useState(null);

    const { user: currentUser } = useAuth();
    const navigate = useNavigate();
    const { t } = useTranslation();

    useEffect(() => {
        fetchUsers();
    }, [pagination.page]);

    const stats = {
        totalUsers: users.length,
        totalAdmins: users.filter(u => u.role === 'ADMIN').length,
        totalResidents: users.filter(u => u.role === 'RESIDENT').length,
        activeUsers: users.filter(u => u.isActive).length
    };
    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get("api/users/all", {
                params: {
                    page: pagination.page,
                    size: pagination.size
                }
            });

            const usersWithValidRoles = response.data.content.map(user => ({
                ...user,
                role: typeof user.role === 'string' ? user.role : user.role?.name || 'USER',
                userId: user.userId || user.id
            }));

            setUsers(usersWithValidRoles);
            setPagination(prev => ({
                ...prev,
                total: response.data.totalElements
            }));
        } catch (err) {
            setError(t("errors.fetchUsers") || "فشل جلب بيانات المستخدمين");
        } finally {
            setLoading(false);
        }
    };

    const deleteUser = async (id) => {
        if (!window.confirm(t("confirmDelete") || "هل أنت متأكد من حذف هذا المستخدم؟")) return;
        try {
            await axiosInstance.delete(`/api/users/${id}`);
            setUsers(prev => prev.filter(user => user.userId !== id));
            setShowDropdownId(null);
        } catch (err) {
            setError(t("errors.deleteUser") || "فشل حذف المستخدم");
        }
    };

    const changeRole = async (id, currentRole) => {
        const newRole = currentRole === "USER" ? "ADMIN" : "USER";
        try {
            await axiosInstance.patch(`/api/users/${id}/role`, { role: newRole });
            setUsers(prev => prev.map(user =>
                user.userId === id ? { ...user, role: newRole } : user
            ));
            setShowDropdownId(null);
        } catch (err) {
            setError(t("errors.updateRole") || "فشل تحديث صلاحية المستخدم");
        }
    };

    const openUserDetails = (user) => {
        setSelectedUser(user);
        setShowModal(true);
        setShowDropdownId(null);
    };

    const toggleDropdown = (userId) => {
        setShowDropdownId(showDropdownId === userId ? null : userId);
    };

    const getRoleVariant = (role) => {
        if (typeof role === 'string') {
            return role === 'ADMIN' ? 'danger' :
                role === 'RESIDENT' ? 'success' : 'secondary';
        } else if (role?.id) {
            return role.id === 1 ? 'danger' :  // Admin
                role.id === 2 ? 'success' : // Resident
                    'secondary';                // User
        }
        return 'secondary';
    };


    if (loading) {
        return (
            <div className="admin-dashboard">
                <div className="loading-container">
                    <div className="spinner">
                        <FiRefreshCw className="spinner-icon" />
                    </div>
                    <p>{t("loading") || "جاري التحميل..."}</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="admin-dashboard">
                <div className="error-alert">
                    {error}
                    <button className="retry-btn" onClick={fetchUsers}>
                        <FiRefreshCw /> {t("retry") || "إعادة المحاولة"}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-dashboard">
            <div className="dashboard-card">
                {/* Header */}
                <div className="dashboard-header">
                    <h1 className="dashboard-title">
                        <FiUser /> {t("userManagement") || "إدارة المستخدمين"}
                    </h1>
                    <div className="action-buttons">
                        <button
                            className="btn btn-primary"
                            onClick={() => navigate("/register")}
                        >
                            <FiUserPlus /> {t("register") || "تسجيل مستخدم"}
                        </button>
                        <button
                            className="btn btn-secondary"
                            onClick={fetchUsers}
                        >
                            <FiRefreshCw /> {t("refresh") || "تحديث"}
                        </button>
                    </div>
                </div>

                {/* Statistics */}
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon">
                            <FiUser />
                        </div>
                        <div className="stat-info">
                            <h3>إجمالي المستخدمين</h3>
                            <p>{stats.totalUsers}</p>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">
                            <FiShield />
                        </div>
                        <div className="stat-info">
                            <h3>عدد المديرين</h3>
                            <p>{stats.totalAdmins}</p>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">
                            <FiHome />
                        </div>
                        <div className="stat-info">
                            <h3>عدد المقيمين</h3>
                            <p>{stats.totalResidents}</p>
                        </div>
                    </div>

                </div>

                {/* Users Table */}
                <div className="table-container">
                    {users.length === 0 ? (
                        <div className="no-results">
                            {t("noResults") || "لا توجد نتائج"}
                        </div>
                    ) : (
                        <table className="users-table">
                            <thead>
                            <tr>
                                <th>#</th>
                                <th>{t("email") || "البريد الإلكتروني"}</th>
                                <th>{t("name") || "الاسم"}</th>
                                <th>{t("role") || "الصلاحية"}</th>
                                <th>{t("actions") || "إجراءات"}</th>
                            </tr>
                            </thead>
                            <tbody>
                            {users.map((user, index) => (
                                <tr key={user.userId}>
                                    <td>{index + 1}</td>
                                    <td>{user.email}</td>
                                    <td>{user.fullName || "--"}</td>
                                    <td>
                                        <span className={`role-badge badge-${getRoleVariant(user.role)}`}>
                                               {user.role === 1 || user.role?.id === 1 ? 'مدير' :
                                                user.role === 2 || user.role?.id === 2 ? 'مقيم' : 'مستخدم'}
                                          </span>
                                    </td>
                                    <td>
                                        <div className="action-dropdown">
                                            <button
                                                className="dropdown-toggle"
                                                onClick={() => toggleDropdown(user.userId)}
                                            >
                                                <FiMoreVertical/>
                                            </button>
                                            <div
                                                className={`dropdown-menu ${showDropdownId === user.userId ? 'show' : ''}`}>
                                                <button
                                                    className="dropdown-item"
                                                    onClick={() => openUserDetails(user)}
                                                >
                                                    <FiEye/> {t("view") || "عرض"}
                                                </button>
                                                {user.userId !== currentUser?.userId && (
                                                    <>
                                                        <button
                                                            className="dropdown-item"
                                                            onClick={() => changeRole(user.userId, user.role)}
                                                        >
                                                            <FiEdit/> {t("changeRole") || "تغيير الصلاحية"}
                                                        </button>
                                                        <button
                                                            className="dropdown-item danger"
                                                            onClick={() => deleteUser(user.userId)}
                                                        >
                                                            <FiTrash2/> {t("delete") || "حذف"}
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Pagination */}
                <div className="pagination">
                    <button
                        className="btn btn-secondary"
                        disabled={pagination.page === 0}
                        onClick={() => setPagination(prev => ({...prev, page: prev.page - 1}))}
                    >
                        السابق
                    </button>
                    <span>الصفحة {pagination.page + 1}</span>
                    <button
                        className="btn btn-secondary"
                        disabled={(pagination.page + 1) * pagination.size >= pagination.total}
                        onClick={() => setPagination(prev => ({...prev, page: prev.page + 1}))}
                    >
                        التالي
                    </button>
                </div>
            </div>

            {/* User Details Modal */}
            {showModal && selectedUser && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2 className="modal-title">تفاصيل المستخدم</h2>
                            <button
                                className="close-btn"
                                onClick={() => setShowModal(false)}
                            >
                                <FiX />
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="user-section">
                                <h3>معلومات الحساب</h3>
                                <p><strong>الاسم الكامل:</strong> {selectedUser.fullName || "--"}</p>
                                <p><strong>البريد الإلكتروني:</strong> {selectedUser.email}</p>
                                <p>
                                    <strong>الحالة:</strong>
                                    <span className={`role-badge badge-${selectedUser.isActive ? 'success' : 'danger'}`}>
                            {selectedUser.isActive ? 'نشط' : 'غير نشط'}
                        </span>
                                </p>
                                <p>
                                    <strong>الصلاحية:</strong>
                                    <span className={`role-badge badge-${getRoleVariant(selectedUser.role)}`}>
                            {selectedUser.role === 'ADMIN' || selectedUser.role?.id === 1 ? 'مدير' :
                                selectedUser.role === 'RESIDENT' || selectedUser.role?.id === 2 ? 'مقيم' : 'مستخدم'}
                        </span>
                                </p>
                            </div>

                            {selectedUser.wives?.length > 0 && (
                                <div className="user-section">
                                    <h3>الزوجات</h3>
                                    <ul>
                                        {selectedUser.wives.map((wife, i) => (
                                            <li key={i}>
                                                <strong>الاسم:</strong> {wife.name || "--"}<br />
                                                {wife.birthDate && <><strong>تاريخ الميلاد:</strong> {wife.birthDate}</>}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {selectedUser.children?.length > 0 && (
                                <div className="user-section">
                                    <h3>الأبناء</h3>
                                    <ul>
                                        {selectedUser.children.map((child, i) => (
                                            <li key={i}>
                                                <strong>الاسم:</strong> {child.name || "--"}<br />
                                                {child.birthDate && <><strong>تاريخ الميلاد:</strong> {child.birthDate}</>}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button
                                className="btn btn-secondary"
                                onClick={() => setShowModal(false)}
                            >
                                إغلاق
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminDashboard;