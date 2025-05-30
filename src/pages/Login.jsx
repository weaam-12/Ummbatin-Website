// src/pages/Login.jsx
import React, { useState } from 'react';
import { useAuth } from "../AuthContext";  // Use custom hook
import { useNavigate } from "react-router-dom";
import './Login.css';

const Login = () => {
    const { login, user, loading } = useAuth();  // Get login function and user state from context
    const navigate = useNavigate();
    const [loginRequest, setLoginRequest] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const userData = await login(loginRequest);  // Use return value from login

            if (userData && userData.role === "ADMIN") {
                navigate("/admin");
            } else {
                navigate("/dashboard");
            }
        } catch (err) {
            setError(err.message || 'Login failed. Please try again.');
        }
    };


    return (
        <div className="login-container" dir="rtl">
            <form className="login-form" onSubmit={handleSubmit}>
                <div className="login-header">
                    <h2>ברוך שובך</h2>
                    <p>אנא הזן את פרטי הכניסה שלך</p>
                </div>

                <div className="input-container">
                    <label htmlFor="email">אימייל</label>
                    <input
                        id="email"
                        type="email"
                        value={loginRequest.email}
                        onChange={(e) =>
                            setLoginRequest({ ...loginRequest, email: e.target.value })
                        }
                        required
                        placeholder="הזן את כתובת האימייל שלך"
                    />
                </div>

                <div className="input-container">
                    <label htmlFor="password">סיסמה</label>
                    <input
                        id="password"
                        type="password"
                        value={loginRequest.password}
                        onChange={(e) =>
                            setLoginRequest({ ...loginRequest, password: e.target.value })
                        }
                        required
                        placeholder="הזן את הסיסמה שלך"
                    />
                </div>

                <div className="submit-container">
                    <button
                        type="submit"
                        className="login-button"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <span className="spinner"></span> מתחבר...
                            </>
                        ) : (
                            'כניסה'
                        )}
                    </button>
                </div>

                {error && <div className="error-message">{error}</div>}

                <div className="login-footer">
                    אין לך חשבון? <a href="/register">הירשם עכשיו</a><br />
                </div>
            </form>
        </div>
    );
};

export default Login;
