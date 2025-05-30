import React, { createContext, useContext, useState, useEffect } from "react";
import axiosInstance from './api/axiosInstance';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) {
            setLoading(false);
            return;
        }

        axiosInstance
            .get("/user/profile")
            .then((res) => {
                setUser(res.data);
            })
            .catch((err) => {
                console.error("AuthContext: Failed to fetch profile", err);
                localStorage.removeItem("token");
            })
            .finally(() => setLoading(false));
    }, []);

    const login = async ({ email, password }) => {
        try {
            // Login request (no token yet, so use bare axios or axiosInstance without token)
            // To handle this, you could create a separate axios instance without interceptor for auth calls,
            // or just use axios directly here.
            // But for simplicity, let's use bare axios just for login:
            const axios = (await import("axios")).default;

            const response = await axios.post(
                `${import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api"}/auth/login`,
                { email, password }
            );
            const { token } = response.data;
            localStorage.setItem("token", token);

            // Now that token is set, axiosInstance interceptor will add auth header automatically
            const profileResponse = await axiosInstance.get("/user/profile");
            const user = profileResponse.data;
            setUser(user);
            return user;
        } catch (error) {
            throw error; // Let caller handle error (Login.jsx does it)
        }
    };

    const logout = () => {
        localStorage.removeItem("token");
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
