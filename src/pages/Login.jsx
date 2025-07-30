import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { useTranslation } from "react-i18next";
import '../components/styles/Login.css';

const Login = () => {
    const { t } = useTranslation();
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
            await login(form);
            setSuccess(t("login.success"));
            navigate('/profile');
        } catch (err) {
            const msg = err.response?.data?.message || err.message || t("login.error");
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    if (authLoading) {
        return <div className="loading-message">{t("common.loading")}</div>;
    }

    return (
        <div className="login-container">
            <div className="login-card">
                <h2 className="login-title">{t("login.title")}</h2>

                {error && <div className="error-message">{error}</div>}
                {success && <div className="success-message">{success}</div>}

                <form onSubmit={handleLogin} className="login-form">
                    <div className="form-group">
                        <label htmlFor="email" className="form-label">{t("login.email")}</label>
                        <input
                            id="email"
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            placeholder={t("login.emailPlaceholder")}
                            required
                            className="form-input"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password" className="form-label">{t("login.password")}</label>
                        <input
                            id="password"
                            type="password"
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            placeholder={t("login.passwordPlaceholder")}
                            required
                            className="form-input"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`login-button ${loading ? "loading" : ""}`}
                    >
                        {loading ? t("login.submitting") : t("login.submit")}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;