import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Register = () => {
    const [form, setForm] = useState({ name: "", email: "", password: "", role: "" });
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("token");
            await axios.post("http://localhost:8080/api/auth/register", form, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setMessage("המשתמש נרשם בהצלחה!");
            setForm({ name: "", email: "", password: "", role: "" });
        } catch (err) {
            setError("שגיאה בהרשמה. אנא בדוק את הפרטים.");
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 rtl">
            <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6 text-center">רישום משתמש חדש</h2>
                {message && <p className="text-green-600 text-center mb-4">{message}</p>}
                {error && <p className="text-red-500 text-center mb-4">{error}</p>}
                <form onSubmit={handleRegister} className="space-y-4">
                    <input
                        type="text"
                        name="name"
                        placeholder="שם"
                        value={form.name}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded"
                        required
                    />
                    <input
                        type="email"
                        name="email"
                        placeholder="דוא״ל"
                        value={form.email}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded"
                        required
                    />
                    <input
                        type="password"
                        name="password"
                        placeholder="סיסמה"
                        value={form.password}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded"
                        required
                    />
                    <select
                        name="role"
                        value={form.role}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded"
                        required
                    >
                        <option value="">בחר תפקיד</option>
                        <option value="ADMIN">מנהל</option>
                        <option value="RESIDENT">תושב</option>
                    </select>
                    <button
                        type="submit"
                        className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
                    >
                        רישום
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Register;
