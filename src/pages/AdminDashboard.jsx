import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import axiosInstance from "../api";
import { useTranslation } from "react-i18next";

import {
    Table,
    Button,
    Spinner,
    Alert,
    Container,
    Badge,
    Dropdown,
    Form,
    Row,
    Col,
    Modal
} from "react-bootstrap";

import {
    FiTrash2,
    FiUserPlus,
    FiRefreshCw,
    FiEdit,
    FiMoreVertical,
    FiEye
} from "react-icons/fi";

function AdminDashboard() {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState("");
    const [filterRole, setFilterRole] = useState("ALL");
    const [showModal, setShowModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

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
            const response = await axiosInstance.get("/users/all");
            setUsers(response.data || []);
        } catch (err) {
            console.error("Failed to fetch users", err);
            setError(t("errors.fetchUsers") || "Failed to fetch users");
        } finally {
            setLoading(false);
        }
    };

    const deleteUser = async (id) => {
        if (!window.confirm(t("confirmDelete") || "Are you sure you want to delete this user?")) return;
        try {
            await axiosInstance.delete(`/users/${id}`);
            setUsers(prev => prev.filter(user => user.userId !== id));
        } catch (err) {
            console.error("Delete failed", err);
            setError(t("errors.deleteUser") || "Failed to delete user");
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
        } catch (err) {
            console.error("Role update failed", err);
            setError(t("errors.updateRole") || "Failed to update role");
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
    };

    const handleCloseModal = () => {
        setSelectedUser(null);
        setShowModal(false);
    };

    const handleRegisterUser = () => navigate("/register");

    if (loading) {
        return (
            <div className="text-center mt-5">
                <Spinner animation="border" variant="primary" />
                <p className="mt-2">{t("loading") || "Loading..."}</p>
            </div>
        );
    }

    if (error) {
        return (
            <Container className="mt-4">
                <Alert variant="danger">
                    {error}
                    <Button variant="link" onClick={fetchUsers} className="p-0 ms-2">
                        <FiRefreshCw /> {t("retry") || "Retry"}
                    </Button>
                </Alert>
            </Container>
        );
    }

    return (
        <Container className="py-4">
            <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
                <h4 className="mb-0">{t("userManagement") || "User Management"}</h4>
                <div className="d-flex flex-wrap gap-2">
                    <Button
                        variant="primary"
                        onClick={handleRegisterUser}
                        className="px-4 py-2 d-flex align-items-center justify-content-center"
                        style={{minWidth: '120px'}}
                    >
                        <FiUserPlus className="me-2" size={16}/>
                        <span>{t("register") || "Register"}</span>
                    </Button>
                    <Button
                        variant="primary"
                        onClick={fetchUsers}
                        className="px-4 py-2 d-flex align-items-center justify-content-center"
                        style={{minWidth: '120px'}}
                    >
                        <FiRefreshCw className="me-2" size={16}/>
                        <span>{t("refresh") || "Refresh"}</span>
                    </Button>
                </div>
            </div>

            <Row className="mb-3 g-2">
                <Col xs={12} md={5}>
                    <Form.Control
                        type="text"
                        placeholder={t("searchPlaceholder") || "Search..."}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </Col>
                <Col xs={12} md={3}>
                    <Form.Select
                        value={filterRole}
                        onChange={(e) => setFilterRole(e.target.value)}
                    >
                        <option value="ALL">{t("allRoles") || "All Roles"}</option>
                        <option value="ADMIN">{t("admin") || "Admin"}</option>
                        <option value="USER">{t("user") || "User"}</option>
                        <option value="RESIDENT">{t("resident") || "Resident"}</option>
                    </Form.Select>
                </Col>
            </Row>

            {filteredUsers.length === 0 ? (
                <Alert variant="info">{t("noResults") || "No results found"}</Alert>
            ) : (
                <Table responsive striped hover>
                    <thead>
                    <tr>
                        <th>#</th>
                        <th>{t("email") || "Email"}</th>
                        <th>{t("name") || "Name"}</th>
                        <th>{t("role") || "Role"}</th>
                        <th>{t("registered") || "Registered"}</th>
                        <th>{t("actions") || "Actions"}</th>
                    </tr>
                    </thead>
                    <tbody>
                    {filteredUsers.map((user, index) => (
                        <tr key={user.userId}>
                            <td>{index + 1}</td>
                            <td>{user.email || "--"}</td>
                            <td>{user.fullName || "--"}</td>
                            <td>
                                <Badge bg={getRoleVariant(user?.role)}>
                                    {t(getRoleName(user?.role).toLowerCase())}
                                </Badge>
                            </td>
                            <td>{formatDate(user?.createdAt)}</td>
                            <td>
                                <Dropdown>
                                    <Dropdown.Toggle
                                        variant="link"
                                        id={`dropdown-actions-${user.userId}`}
                                        className="p-0"
                                    >
                                        <FiMoreVertical />
                                    </Dropdown.Toggle>
                                    <Dropdown.Menu>
                                        <Dropdown.Item onClick={() => openUserDetails(user)}>
                                            <FiEye className="me-2" />
                                            {t("viewDetails") || "View Details"}
                                        </Dropdown.Item>
                                        {user.userId !== currentUser?.userId && (
                                            <>
                                                <Dropdown.Item
                                                    onClick={() => changeRole(
                                                        user.userId,
                                                        getRoleName(user?.role) === "USER" ? "ADMIN" : "USER"
                                                    )}
                                                >
                                                    <FiEdit className="me-2" />
                                                    {t("changeRoleTo") || "Change role to"} {t(getRoleName(user?.role) === "USER" ? "admin" : "user")}
                                                </Dropdown.Item>
                                                <Dropdown.Item
                                                    onClick={() => deleteUser(user.userId)}
                                                    className="text-danger"
                                                >
                                                    <FiTrash2 className="me-2" />
                                                    {t("delete") || "Delete"}
                                                </Dropdown.Item>
                                            </>
                                        )}
                                    </Dropdown.Menu>
                                </Dropdown>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </Table>
            )}

            <Modal show={showModal} onHide={handleCloseModal} centered>
                <Modal.Header closeButton>
                    <Modal.Title>{t("userDetails") || "User Details"}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedUser ? (
                        <>
                            <p><strong>{t("email") || "Email"}:</strong> {selectedUser.email || "--"}</p>
                            <p><strong>{t("name") || "Name"}:</strong> {selectedUser.fullName || "--"}</p>
                            <p><strong>{t("role") || "Role"}:</strong> {t(getRoleName(selectedUser?.role).toLowerCase())}</p>
                            <p><strong>{t("registered") || "Registered"}:</strong> {formatDate(selectedUser?.createdAt)}</p>
                        </>
                    ) : (
                        <p>{t("noData") || "No data available"}</p>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseModal}>
                        {t("close") || "Close"}
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
}

export default AdminDashboard;