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
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState("");
    const [filterRole, setFilterRole] = useState("ALL");
    const [showModal, setShowModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [showDropdownId, setShowDropdownId] = useState(null);

    const { user: currentUser } = useAuth();
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        filterAndSearch();
    }, [users, search, filterRole]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await axiosInstance.get("api/users/all");
            setUsers(response.data || []);
        } catch (err) {
            console.error("Failed to fetch users", err);
            setError(t("errors.fetchUsers") || "فشل جلب بيانات المستخدمين");
        } finally {
            setLoading(false);
        }
    };

    const deleteUser = async (id) => {
        if (!window.confirm(t("confirmDelete") || "هل أنت متأكد من حذف هذا المستخدم؟")) return;
        try {
            await axiosInstance.delete(`/users/${id}`);
            setUsers(prev => prev.filter(user => user.userId !== id));
            setShowDropdownId(null);
        } catch (err) {
            console.error("Delete failed", err);
            setError(t("errors.deleteUser") || "فشل حذف المستخدم");
        }
    };

    const changeRole = async (id, newRole) => {
        try {
            await axiosInstance.patch(`/users/${id}`, { role: newRole });
            setUsers(prev =>
                prev.map(user =>
                    user.userId === id ? { ...user, role: newRole } : user
                )
            );
            setShowDropdownId(null);
        } catch (err) {
            console.error("Role update failed", err);
            setError(t("errors.updateRole") || "فشل تحديث صلاحية المستخدم");
        }
    };

    const getRoleVariant = (role) => {
        if (!role) return "secondary";
        const roleName = typeof role === "object" ? role.roleName : role;
        switch (roleName) {
            case "ADMIN": return "danger";
            case "USER": return "primary";
            case "RESIDENT": return "success";
            default: return "secondary";
        }
    };

    const getRoleName = (role) => {
        if (!role) return "UNKNOWN";
        return typeof role === "object" ? role.roleName : role;
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return "--";
        try {
            const date = new Date(dateStr);
            return date.toLocaleDateString(i18n.language === 'ar' ? 'ar-EG' : 'he-IL');
        } catch {
            return "--";
        }
    };

    const filterAndSearch = () => {
        let result = [...users];
        if (filterRole !== "ALL") {
            result = result.filter(user => {
                const roleName = getRoleName(user?.role)?.toUpperCase();
                return roleName === filterRole;
            });
        }
        if (search.trim()) {
            const term = search.trim().toLowerCase();
            result = result.filter(user => {
                const email = user?.email?.toLowerCase() || "";
                const fullName = user?.fullName?.toLowerCase() || "";
                return email.includes(term) || fullName.includes(term);
            });
        }
        setFilteredUsers(result);
    };

    const openUserDetails = (user) => {
        setSelectedUser(user);
        setShowModal(true);
        setShowDropdownId(null);
    };

    const handleCloseModal = () => {
        setSelectedUser(null);
        setShowModal(false);
    };

    const handleRegisterUser = () => navigate("/register");

    const toggleDropdown = (userId) => {
        setShowDropdownId(showDropdownId === userId ? null : userId);
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

    // حساب الإحصائيات
    const stats = {
        totalUsers: users.length,
        totalAdmins: users.filter(u => getRoleName(u?.role) === 'ADMIN').length,
        totalResidents: users.filter(u => getRoleName(u?.role) === 'RESIDENT').length,
        activeUsers: users.filter(u => u.isActive).length
    };

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
                            onClick={handleRegisterUser}
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

                    <div className="stat-card">
                        <div className="stat-icon">
                            <FiCheckCircle />
                        </div>
                        <div className="stat-info">
                            <h3>المستخدمين النشطين</h3>
                            <p>{stats.activeUsers}</p>
                        </div>
                    </div>
                </div>

                {/* Search and Filter */}
                <div className="search-filter-container">
                    <input
                        type="text"
                        className="search-box"
                        placeholder={t("searchPlaceholder") || "بحث..."}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <select
                        className="role-filter"
                        value={filterRole}
                        onChange={(e) => setFilterRole(e.target.value)}
                    >
                        <option value="ALL">{t("allRoles") || "جميع الصلاحيات"}</option>
                        <option value="ADMIN">{t("admin") || "مدير"}</option>
                        <option value="USER">{t("user") || "مستخدم"}</option>
                        <option value="RESIDENT">{t("resident") || "مقيم"}</option>
                    </select>
                </div>

                {/* Users Table */}
                <div className="table-container">
                    {filteredUsers.length === 0 ? (
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
                                <th>{t("registered") || "تاريخ التسجيل"}</th>
                                <th>{t("actions") || "إجراءات"}</th>
                            </tr>
                            </thead>
                            <tbody>
                            {filteredUsers.map((user, index) => (
                                <tr key={user.userId}>
                                    <td>{index + 1}</td>
                                    <td>{user.email || "--"}</td>
                                    <td>{user.fullName || "--"}</td>
                                    <td>
                      <span className={`role-badge badge-${getRoleVariant(user?.role)}`}>
                        {t(getRoleName(user?.role).toLowerCase())}
                      </span>
                                    </td>
                                    <td>{formatDate(user?.createdAt)}</td>
                                    <td>
                                        <div className="action-dropdown">
                                            <button
                                                className="dropdown-toggle"
                                                onClick={() => toggleDropdown(user.userId)}
                                            >
                                                <FiMoreVertical />
                                            </button>
                                            <div className={`dropdown-menu ${showDropdownId === user.userId ? 'show' : ''}`}>
                                                <button
                                                    className="dropdown-item"
                                                    onClick={() => openUserDetails(user)}
                                                >
                                                    <FiEye /> {t("viewDetails") || "عرض التفاصيل"}
                                                </button>
                                                {user.userId !== currentUser?.userId && (
                                                    <>
                                                        <button
                                                            className="dropdown-item"
                                                            onClick={() => changeRole(
                                                                user.userId,
                                                                getRoleName(user?.role) === "USER" ? "ADMIN" : "USER"
                                                            )}
                                                        >
                                                            <FiEdit /> {t("changeRoleTo") || "تغيير الصلاحية إلى"} {t(getRoleName(user?.role) === "USER" ? "admin" : "user")}
                                                        </button>
                                                        <button
                                                            className="dropdown-item danger"
                                                            onClick={() => deleteUser(user.userId)}
                                                        >
                                                            <FiTrash2 /> {t("delete") || "حذف"}
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
            </div>

            {/* User Details Modal */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2 className="modal-title">
                                {t("userDetails") || "تفاصيل المستخدم"}
                            </h2>
                            <button
                                className="close-btn"
                                onClick={handleCloseModal}
                            >
                                <FiX />
                            </button>
                        </div>
                        <div className="modal-body">
                            {selectedUser ? (
                                <>
                                    <p>
                                        <strong>{t("email") || "البريد الإلكتروني"}:</strong> {selectedUser.email || "--"}
                                    </p>
                                    <p>
                                        <strong>{t("name") || "الاسم"}:</strong> {selectedUser.fullName || "--"}
                                    </p>
                                    <p>
                                        <strong>{t("role") || "الصلاحية"}:</strong> {t(getRoleName(selectedUser?.role).toLowerCase())}
                                    </p>
                                    <p>
                                        <strong>{t("registered") || "تاريخ التسجيل"}:</strong> {formatDate(selectedUser?.createdAt)}
                                    </p>
                                </>
                            ) : (
                                <p>{t("noData") || "لا توجد بيانات متاحة"}</p>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button
                                className="btn btn-secondary"
                                onClick={handleCloseModal}
                            >
                                {t("close") || "إغلاق"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminDashboard;