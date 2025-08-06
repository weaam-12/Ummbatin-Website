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


            console.log(response.data);
            const usersWithValidRoles = response.data.content.map(user => ({
                ...user,
                role: typeof user.roleName === 'string' ? user.roleName : user.roleName?.name || 'RESIDENT',
                userId: user.userId || user.id
            }));

            setUsers(usersWithValidRoles);
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
            setUsers(prev => prev.filter(user => user.userId !== id));
            setShowDropdownId(null);
        } catch (err) {
            setError(t("errors.deleteUser"));
        }
    };

    const changeRole = async (id, currentRole) => {
        const newRole = currentRole === "RESIDENT" ? "ADMIN" : "RESIDENT";
        try {
            await axiosInstance.patch(`/api/users/${id}/role`, { role: newRole });
            setUsers(prev => prev.map(user =>
                user.userId === id ? { ...user, role: newRole } : user
            ));
            setShowDropdownId(null);
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
        if (typeof role === 'string') {
            return role === 'ADMIN' ? 'danger' :
                role === 'RESIDENT' ? 'success' : 'secondary';
        } else if (role?.id) {
            return role.id === 1 ? 'danger' :
                role.id === 2 ? 'success' :
                    'secondary';
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
                            onClick={fetchUsers}
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
                                <th>{t("name")}</th>
                                <th>{t("role")}</th>
                                <th>{t("actions")}</th>
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
                                                {t(`roles.${user.role}`)}
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
                                                    <FiEye/> {t("view")}
                                                </button>
                                                {user.userId !== currentUser?.userId && (
                                                    <>
                                                        <button
                                                            className="dropdown-item"
                                                            onClick={() => changeRole(user.userId, user.role)}
                                                        >
                                                            <FiEdit/> {t("changeRole")}
                                                        </button>
                                                        <button
                                                            className="dropdown-item danger"
                                                            onClick={() => deleteUser(user.userId)}
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

            {/* User Details Modal */}
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
                            <div className="user-section">
                                <h3>{t("userDetails.accountInfo")}</h3>
                                <p><strong>{t("labels.fullName")}:</strong> {selectedUser.fullName || "--"}</p>
                                <p><strong>{t("email")}:</strong> {selectedUser.email}</p>
                                <p>
                                    <strong>{t("userDetails.status")}:</strong>
                                    <span className={`role-badge badge-${selectedUser.isActive ? 'success' : 'danger'}`}>
                                        {selectedUser.isActive ? t("userDetails.active") : t("userDetails.inactive")}
                                    </span>
                                </p>
                                <p>
                                    <strong>{t("role")}:</strong>
                                    <span className={`role-badge badge-${getRoleVariant(selectedUser.role)}`}>
                                        {t(`roles.${selectedUser.role}`)}
                                    </span>
                                </p>
                            </div>

                            {selectedUser.wives?.length > 0 && (
                                <div className="user-section">
                                    <h3>{t("userDetails.wives")}</h3>
                                    <ul>
                                        {selectedUser.wives.map((wife, i) => (
                                            <li key={i}>
                                                <strong>{t("labels.fullName")}:</strong> {wife.name || "--"}<br />
                                                {wife.birthDate && <><strong>{t("labels.birthDate")}:</strong> {wife.birthDate}</>}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {selectedUser.children?.length > 0 && (
                                <div className="user-section">
                                    <h3>{t("userDetails.children")}</h3>
                                    <ul>
                                        {selectedUser.children.map((child, i) => (
                                            <li key={i}>
                                                <strong>{t("labels.fullName")}:</strong> {child.name || "--"}<br />
                                                {child.birthDate && <><strong>{t("labels.birthDate")}:</strong> {child.birthDate}</>}
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