import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import axiosInstance from "../api";
import { useTranslation } from "react-i18next";
import { FiTrash2, FiUserPlus, FiRefreshCw, FiEdit, FiEye } from "react-icons/fi";
import "./AdminDashboard.css";

function AdminDashboard() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [pagination, setPagination] = useState({ page: 0, size: 10, total: 0 });

    const { user: currentUser } = useAuth();
    const navigate = useNavigate();
    const { t } = useTranslation();

    useEffect(() => {
        fetchUsers();
    }, [pagination.page]);

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
        } catch (err) {
            setError(t("errors.updateRole") || "فشل تحديث صلاحية المستخدم");
        }
    };

    const openUserDetails = (user) => {
        setSelectedUser(user);
        setShowModal(true);
    };

    if (loading) return <div className="loading-spinner" />;

    return (
        <div className="admin-dashboard">
            <div className="dashboard-header">
                <h1>{t("userManagement") || "إدارة المستخدمين"}</h1>
                <button className="btn-primary" onClick={() => navigate("/register")}>
                    <FiUserPlus /> {t("register") || "تسجيل مستخدم"}
                </button>
            </div>

            {error && <div className="error-alert">{error}</div>}

            <div className="users-table-container">
                <table>
                    <thead>
                    <tr>
                        <th>#</th>
                        <th>{t("email") || "البريد"}</th>
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
                                    <span className={`role-badge ${user.role?.toLowerCase()}`}>
                                        {t(user.role?.toLowerCase())}
                                    </span>
                            </td>
                            <td className="actions-cell">
                                <button onClick={() => openUserDetails(user)}>
                                    <FiEye /> {t("view")}
                                </button>
                                {user.userId !== currentUser?.userId && (
                                    <>
                                        <button onClick={() => changeRole(user.userId, user.role)}>
                                            <FiEdit /> {t("changeRole")}
                                        </button>
                                        <button className="danger" onClick={() => deleteUser(user.userId)}>
                                            <FiTrash2 /> {t("delete")}
                                        </button>
                                    </>
                                )}
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {/* User Details Modal */}
            {showModal && selectedUser && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>تفاصيل المستخدم</h2>
                            <button onClick={() => setShowModal(false)}>×</button>
                        </div>
                        <div className="modal-body">
                            <div className="user-section">
                                <h3>معلومات الحساب</h3>
                                <p><strong>الاسم:</strong> {selectedUser.fullName || "--"}</p>
                                <p><strong>البريد:</strong> {selectedUser.email}</p>
                                <p><strong>الصلاحية:</strong> {t(selectedUser.role?.toLowerCase())}</p>
                            </div>

                            <div className="user-section">
                                <h3>الزوجات</h3>
                                {selectedUser.wives?.length > 0 ? (
                                    <ul>
                                        {selectedUser.wives.map((wife, i) => (
                                            <li key={i}>{wife.name}</li>
                                        ))}
                                    </ul>
                                ) : <p>لا يوجد زوجات</p>}
                            </div>

                            <div className="user-section">
                                <h3>الأبناء</h3>
                                {selectedUser.children?.length > 0 ? (
                                    <ul>
                                        {selectedUser.children.map((child, i) => (
                                            <li key={i}>
                                                {child.name} - {child.birthDate}
                                            </li>
                                        ))}
                                    </ul>
                                ) : <p>لا يوجد أبناء</p>}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Pagination */}
            <div className="pagination">
                <button
                    disabled={pagination.page === 0}
                    onClick={() => setPagination(prev => ({...prev, page: prev.page - 1}))}
                >
                    السابق
                </button>
                <span>الصفحة {pagination.page + 1}</span>
                <button
                    disabled={(pagination.page + 1) * pagination.size >= pagination.total}
                    onClick={() => setPagination(prev => ({...prev, page: prev.page + 1}))}
                >
                    التالي
                </button>
            </div>
        </div>
    );
}

export default AdminDashboard;