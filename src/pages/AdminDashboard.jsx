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
    FiUser,
    FiShield,
    FiHome
} from "react-icons/fi";
import "./AdminDashboard.css";

function AdminDashboard() {
    const [users, setUsers] = useState([]);
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalAdmins: 0,
        totalResidents: 0,
        activeUsers: 0
    });
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
        fetchStats();
    }, [pagination.page]);

    const fetchStats = async () => {
        try {
            // إذا كان لديك نقطة نهاية خاصة بالإحصائيات
            // const response = await axiosInstance.get("api/users/stats");
            // setStats(response.data);

            // بدلاً من ذلك، يمكنك جلب جميع المستخدمين مرة واحدة لحساب الإحصائيات
            const response = await axiosInstance.get("api/users/all", {
                params: {
                    page: 0,
                    size: 10000 // حجم كبير enough لاستيعاب جميع المستخدمين
                }
            });

            const allUsers = response.data.content;
            setStats({
                totalUsers: response.data.totalElements,
                totalAdmins: allUsers.filter(u => u.role?.roleName === 'ADMIN').length,
                totalResidents: allUsers.filter(u => u.role?.roleName === 'RESIDENT').length,
                activeUsers: allUsers.filter(u => u.isActive).length
            });
        } catch (err) {
            console.error("Error fetching stats:", err);
        }
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

            setUsers(response.data.content);
            setPagination(prev => ({
                ...prev,
                total: response.data.totalElements
            }));
        } catch (err) {
            setError(t("errors.fetchUsers"));
        } finally {
            setLoading(false);
        }
    };

    const deleteUser = async (id) => {
        if (!window.confirm(t("confirmDelete"))) return;
        try {
            await axiosInstance.delete(`/api/users/${id}`);
            setUsers(prev => prev.filter(user => user.id !== id));
            setShowDropdownId(null);
            // تحديث الإحصائيات بعد الحذف
            fetchStats();
        } catch (err) {
            setError(t("errors.deleteUser"));
        }
    };

    const changeRole = async (id, currentRole) => {
        const newRole = currentRole === "RESIDENT" ? "ADMIN" : "RESIDENT";
        try {
            await axiosInstance.patch(`/api/users/${id}/role`, { role: newRole });
            setUsers(prev => prev.map(user =>
                user.id === id ? {
                    ...user,
                    role: {
                        ...user.role,
                        roleName: newRole
                    }
                } : user
            ));
            setShowDropdownId(null);
            // تحديث الإحصائيات بعد تغيير الدور
            fetchStats();
        } catch (err) {
            setError(t("errors.updateRole"));
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
        if (!role) return 'secondary';
        return role.roleName === 'ADMIN' ? 'danger' : 'success';
    };

    if (loading) {
        return (
            <div className="admin-dashboard">
                <div className="loading-container">
                    <div className="spinner">
                        <FiRefreshCw className="spinner-icon" />
                    </div>
                    <p>{t("loading")}</p>
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
                        <FiRefreshCw /> {t("retry")}
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
                        <FiUser /> {t("userManagement")}
                    </h1>
                    <div className="action-buttons">
                        <button
                            className="btn btn-primary"
                            onClick={() => navigate("/register")}
                        >
                            <FiUserPlus /> {t("register")}
                        </button>
                        <button
                            className="btn btn-secondary"
                            onClick={() => {
                                fetchUsers();
                                fetchStats();
                            }}
                        >
                            <FiRefreshCw /> {t("refresh")}
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
                            <h3>{t("stats.totalUsers")}</h3>
                            <p>{stats.totalUsers}</p>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">
                            <FiShield />
                        </div>
                        <div className="stat-info">
                            <h3>{t("stats.totalAdmins")}</h3>
                            <p>{stats.totalAdmins}</p>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">
                            <FiHome />
                        </div>
                        <div className="stat-info">
                            <h3>{t("stats.totalResidents")}</h3>
                            <p>{stats.totalResidents}</p>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">
                            <FiUser />
                        </div>
                        <div className="stat-info">
                            <h3>{t("stats.activeUsers")}</h3>
                            <p>{stats.activeUsers}</p>
                        </div>
                    </div>
                </div>

                {/* Users Table */}
                <div className="table-container">
                    {users.length === 0 ? (
                        <div className="no-results">
                            {t("noResults")}
                        </div>
                    ) : (
                        <table className="users-table">
                            <thead>
                            <tr>
                                <th>#</th>
                                <th>{t("email")}</th>
                                <th>{t("labels.fullName")}</th>
                                <th>{t("role")}</th>
                                <th>{t("actions")}</th>
                            </tr>
                            </thead>
                            <tbody>
                            {users.map((user, index) => (
                                <tr key={user.id}>
                                    <td>{index + 1 + (pagination.page * pagination.size)}</td>
                                    <td>{user.email}</td>
                                    <td>{user.fullName || "--"}</td>
                                    <td>
                                            <span className={`role-badge badge-${getRoleVariant(user.role)}`}>
                                                {t(`roles.${user.role?.roleName}`)}
                                            </span>
                                    </td>
                                    <td>
                                        <div className="action-dropdown">
                                            <button
                                                className="dropdown-toggle"
                                                onClick={() => toggleDropdown(user.id)}
                                            >
                                                <FiMoreVertical/>
                                            </button>
                                            <div
                                                className={`dropdown-menu ${showDropdownId === user.id ? 'show' : ''}`}>
                                                <button
                                                    className="dropdown-item"
                                                    onClick={() => openUserDetails(user)}
                                                >
                                                    <FiEye/> {t("view")}
                                                </button>
                                                {user.id !== currentUser?.id && (
                                                    <>
                                                        <button
                                                            className="dropdown-item"
                                                            onClick={() => changeRole(user.id, user.role?.roleName)}
                                                        >
                                                            <FiEdit/> {t("changeRole")}
                                                        </button>
                                                        <button
                                                            className="dropdown-item danger"
                                                            onClick={() => deleteUser(user.id)}
                                                        >
                                                            <FiTrash2/> {t("delete")}
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
                        {t("pagination.previous")}
                    </button>
                    <span>{t("pagination.page")} {pagination.page + 1}</span>
                    <button
                        className="btn btn-secondary"
                        disabled={(pagination.page + 1) * pagination.size >= pagination.total}
                        onClick={() => setPagination(prev => ({...prev, page: prev.page + 1}))}
                    >
                        {t("pagination.next")}
                    </button>
                </div>
            </div>

            {showModal && selectedUser && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2 className="modal-title">{t("userDetails.title")}</h2>
                            <button
                                className="close-btn"
                                onClick={() => setShowModal(false)}
                            >
                                <FiX />
                            </button>
                        </div>
                        <div className="modal-body">
                            {/* معلومات الحساب */}
                            <div className="user-section">
                                <h3>{t("userDetails.accountInfo")}</h3>
                                <div className="info-grid">
                                    <div className="info-item">
                                        <strong>{t("labels.fullName")}:</strong>
                                        <span>{selectedUser.fullName || "--"}</span>
                                    </div>
                                    <div className="info-item">
                                        <strong>{t("email")}:</strong>
                                        <span>{selectedUser.email}</span>
                                    </div>
                                    <div className="info-item">
                                        <strong>"ת'ז":</strong>
                                        <span>{selectedUser.user_id}</span>
                                    </div>
                                    <div className="info-item">
                                        <strong>{t("labels.phone")}:</strong>
                                        <span>{selectedUser.phone || "--"}</span>
                                    </div>
                                    <div className="info-item">
                                        <strong>{t("role")}:</strong>
                                        <span className={`role-badge badge-${getRoleVariant(selectedUser.role)}`}>
                                {t(`roles.${selectedUser.role?.roleName}`)}
                            </span>
                                    </div>
                                </div>
                            </div>

                            {/* معلومات الاتصال */}
                            <div className="user-section">
                                <h3>{t("userDetails.contactInfo")}</h3>
                                <div className="info-grid">
                                    <div className="info-item">
                                        <strong>{t("labels.phone")}:</strong>
                                        <span>{selectedUser.phone || "--"}</span>
                                    </div>
                                    <div className="info-item">
                                        <strong>{t("labels.address")}:</strong>
                                        <span>
                                {selectedUser.properties?.length > 0
                                    ? selectedUser.properties[0].address
                                    : "אין כתובת"}
                            </span>
                                    </div>
                                </div>
                            </div>

                            {/* العقارات المملوكة */}
                            {selectedUser.properties?.length > 0 && (
                                <div className="user-section">
                                    <h3>{t("userDetails.properties")} ({selectedUser.properties.length})</h3>
                                    <div className="properties-grid">
                                        {selectedUser.properties.map((property, index) => (
                                            <div key={index} className="property-item">
                                                <div className="property-address">
                                                    <strong>{t("labels.address")}:</strong> {property.address}
                                                </div>
                                                <div className="property-details">
                                        <span>
                                            <strong>{t("labels.area")}:</strong> {property.area} {t("labels.squareMeters")}
                                        </span>
                                                    <span>
                                            <strong>{t("labels.units")}:</strong> {property.numberOfUnits}
                                        </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* الزوجات */}
                            {selectedUser.wives?.length > 0 && (
                                <div className="user-section">
                                    <h3>{t("userDetails.wives")} ({selectedUser.wives.length})</h3>
                                    <div className="wives-grid">
                                        {selectedUser.wives.map((wife, index) => (
                                            <div key={index} className="wife-item">
                                                <div className="wife-name">
                                                    <strong>{t("labels.fullName")}:</strong> {wife.name || "--"}
                                                </div>
                                                {wife.birthDate && (
                                                    <div className="wife-birthdate">
                                                        <strong>{t("labels.birthDate")}:</strong> {wife.birthDate}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* الأولاد */}
                            {selectedUser.children?.length > 0 && (
                                <div className="user-section">
                                    <h3>{t("userDetails.children")} ({selectedUser.children.length})</h3>
                                    <div className="children-grid">
                                        {selectedUser.children.map((child, index) => (
                                            <div key={index} className="child-item">
                                                <div className="child-name">
                                                    <strong>{t("labels.fullName")}:</strong> {child.name || "--"}
                                                </div>
                                                {child.birthDate && (
                                                    <div className="child-birthdate">
                                                        <strong>{t("labels.birthDate")}:</strong> {child.birthDate}
                                                    </div>
                                                )}
                                                {child.motherName && (
                                                    <div className="child-mother">
                                                        <strong>{t("labels.mother")}:</strong> {child.motherName}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button
                                className="btn btn-secondary"
                                onClick={() => setShowModal(false)}
                            >
                                {t("close")}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminDashboard;