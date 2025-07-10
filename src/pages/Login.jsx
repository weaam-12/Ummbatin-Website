import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import '../components/styles/Login.css';

const Login = () => {
    const [form, setForm] = useState({ email: "", password: "" });
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const { user, login, loading: authLoading } = useAuth(); // استخدمنا user و loading من الكونتكست

    // ✅ إذا المستخدم مسجّل دخول بالفعل → نوجّهه مباشرة
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

        try {
            await login(form);
        } catch (err) {
            setError(err.response?.data?.message || "שגיאה בהתחברות. נסה שוב.");
        } finally {
            setLoading(false);
        }
    };


    // ⏳ تحميل من الكونتكست أو من هذا الكمبوننت
    if (authLoading) {
        return <div className="loading-message">טוען...</div>;
    }

    return (
        <div className="login-container">
            <div className="login-card">
                <h2 className="login-title">התחברות למערכת</h2>

                {error && <div className="error-message">{error}</div>}
                {success && <div className="success-message">{success}</div>}

                <form onSubmit={handleLogin} className="login-form">
                    <div className="form-group">
                        <label htmlFor="email" className="form-label">אימייל</label>
                        <input
                            id="email"
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            placeholder="הזן אימייל"
                            required
                            className="form-input"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password" className="form-label">סיסמה</label>
                        <input
                            id="password"
                            type="password"
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            placeholder="הזן סיסמה"
                            required
                            className="form-input"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`login-button ${loading ? "loading" : ""}`}
                    >
                        {loading ? "מתחבר..." : "התחבר"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
