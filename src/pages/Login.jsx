import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import axios from 'axios';
import '../components/styles/Login.css';

const Login = () => {
    const [form, setForm] = useState({ email: "", password: "" });
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const { user, login, loading: authLoading } = useAuth();

    useEffect(() => {
        if (user && !loading) {
            const redirectPath = localStorage.getItem('redirectPath') || '/profile';
            localStorage.removeItem('redirectPath');
            navigate(redirectPath, { replace: true });
        }
    }, [user, loading, navigate]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess("");

        try {
            const response = await axios.post(
                'https://backend-wtgq.onrender.com/api/auth/login',
                {
                    email: form.email,
                    password: form.password
                },
                {
                    headers: { 'Content-Type': 'application/json' },
                    withCredentials: true
                }
            );

            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
                await login(response.data.user); // تسجيل المستخدم بالكونتكست
                setSuccess("تم تسجيل الدخول بنجاح!");
            } else {
                setError("فشل تسجيل الدخول، لا يوجد توكن.");
            }

        } catch (err) {
            console.error("Login error:", err);
            const msg =
                err.response?.data?.message ||
                (typeof err.response?.data === "string" ? err.response.data : null) ||
                "حدث خطأ أثناء تسجيل الدخول";
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    if (authLoading) {
        return <div className="loading-message">جاري التحميل...</div>;
    }

    return (
        <div className="login-container">
            <div className="login-card">
                <h2 className="login-title">تسجيل الدخول للنظام</h2>

                {error && (
                    <div className="error-message">
                        {typeof error === "string" ? error : "حدث خطأ غير متوقع"}
                    </div>
                )}

                {success && (
                    <div className="success-message">
                        {success}
                    </div>
                )}

                <form onSubmit={handleLogin} className="login-form">
                    <div className="form-group">
                        <label htmlFor="email" className="form-label">البريد الإلكتروني</label>
                        <input
                            id="email"
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            placeholder="أدخل بريدك"
                            required
                            className="form-input"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password" className="form-label">كلمة المرور</label>
                        <input
                            id="password"
                            type="password"
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            placeholder="كلمة المرور"
                            required
                            className="form-input"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`login-button ${loading ? "loading" : ""}`}
                    >
                        {loading ? "جاري الدخول..." : "دخول"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
