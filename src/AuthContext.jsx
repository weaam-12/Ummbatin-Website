import React, { createContext, useContext, useState, useEffect } from "react";
import axiosInstance from './api';

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
            .get("/users/profile")
            .then((res) => {
                setUser(res.data);
            })
            .catch((err) => {
                console.error("AuthContext: Failed to fetch profile", err);
                localStorage.removeItem("token");
            })
            .finally(() => setLoading(false));
    }, []);

    const login = async (credentials) => {
        try {
            const response = await axiosInstance.post("/auth/login", credentials, {
                withCredentials: true
            });

            localStorage.setItem("token", response.data.token);
            axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${response.data.token}`;

            const profileResponse = await axiosInstance.get("/users/profile");
            setUser(profileResponse.data);

            return true;
        } catch (error) {
            console.error("Login error:", error);
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem("token");
        delete axiosInstance.defaults.headers.common["Authorization"];
        setUser(null);
    };

    const register = async ({ email, password }) => {
        const response = await axiosInstance.post('/auth/register', { email, password });
        return response.data;
    };




    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
