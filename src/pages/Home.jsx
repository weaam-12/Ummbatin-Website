import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api.js";
import '../components/styles/Login.css';

const Login = ({ setUser }) => {
    const [form, setForm] = useState({ email: "", password: "" });
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess("");

        try {
            const response = await axiosInstance.post(
                "http://localhost:8080/api/auth/login",
                form,
                {
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

         //Save user data to state
            setUser(response.data.user);

           //success message
            setSuccess("התחברת בהצלחה! מעביר אותך לדף הבית...");

            //  Redirect after 2 seconds
            setTimeout(() => {
                navigate("/dashboard");
            }, 2000);

        } catch (err) {
            setError(err.response?.data?.message || "שגיאה בהתחברות. אנא נסה שוב.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <h2 className="login-title">התחברות למערכת</h2>

                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="success-message">
                        {success}
                    </div>
                )}

                <form onSubmit={handleLogin} className="login-form">

                </form>
            </div>
        </div>
    );
};

export default Login;