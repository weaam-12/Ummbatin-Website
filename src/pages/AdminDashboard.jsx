import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api.js";

function AdminDashboard() {
    const [users, setUsers] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        axiosInstance.get("/users/all")
            .then(res => setUsers(res.data))
            .catch(err => console.error("Failed to fetch users", err));
    }, []);

    const deleteUser = (id) => {
        axiosInstance.delete(`/users/${id}`)
            .then(() => {
                setUsers(users.filter(user => user.id !== id));
            })
            .catch(err => console.error("Delete failed", err));
    };

    // ✅ Change user role securely
    const changeRole = (id, newRole) => {
        axiosInstance.patch(`/users/${id}`, { role: newRole })
            .then(() => {
                setUsers(users.map(user =>
                    user.id === id ? { ...user, role: newRole } : user
                ));
            })
            .catch(err => console.error("Role update failed", err));
    };

    // ✅ Navigate to register page
    const handleRegisterUser = () => {
        navigate("/register");
    };

    return (
        <div style={{ padding: "2rem" }}>
            <h2>Admin Dashboard</h2>
            <button onClick={handleRegisterUser} style={{ marginBottom: "1rem" }}>
                ➕ Register New User
            </button>

            <table border="1" cellPadding="8" cellSpacing="0">
                <thead>
                <tr>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Actions</th>
                </tr>
                </thead>
                <tbody>
                {users.map(user => (
                    <tr key={user.id}>
                        <td>{user.email}</td>
                        <td>{user.role}</td>
                        <td>
                            <button onClick={() => deleteUser(user.id)}>🗑 Delete</button>
                            <button onClick={() =>
                                changeRole(user.id, user.role === "USER" ? "ADMIN" : "USER")
                            }>
                                🔁 Toggle Role
                            </button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}

export default AdminDashboard;
