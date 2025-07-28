import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import axiosInstance from './api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        const token = localStorage.getItem("token");
        console.log("Current token:", token);
        if (token) {
            console.log("Decoded token data:", decodeToken(token));
        }
    }, [user]);
    const decodeToken = (token) => {
        if (!token) return null;
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            console.log("Token payload:", payload); // أضف هذا السطر للتحقق
            return {
                email: payload.sub,
                userId: payload.userId || payload.id || payload.sub, // المزيد من الاحتياطات
                role: payload.role
            };
        } catch (e) {
            console.error("Token decoding error:", e);
            return null;
        }
    };

    const fetchUserProfile = useCallback(async () => {
        try {
            const response = await axiosInstance.get("/api/users/profile");
            console.log("Full profile response:", response); // أضف هذا للتحقق

            if (!response.data.id) {
                throw new Error("User ID not found in profile response");
            }

            return {
                email: response.data.email,
                userId: response.data.id, // تأكد من أن السيرفر يعيد id
                fullName: response.data.fullName,
                role: response.data.role?.roleName || response.data.role
            };
        } catch (err) {
            console.error("Profile load error:", err);
            throw err;
        }
    }, []);

    const initializeAuth = useCallback(async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            setLoading(false);
            return;
        }

        try {
            const tokenData = decodeToken(token);
            if (!tokenData) throw new Error("Invalid token");

            const profile = await fetchUserProfile();
            setUser({
                ...profile,
                role: profile.role || tokenData.role
            });
        } catch (err) {
            console.error("Auth init failed:", err);
            localStorage.removeItem("token");
            setError(err);
        } finally {
            setLoading(false);
        }
    }, [fetchUserProfile]);

    const login = async (credentials) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axiosInstance.post("api/auth/login", credentials);
            console.log("Login response:", response.data); // أضف للتحقق

            if (!response.data.token) {
                throw new Error("No token received");
            }

            localStorage.setItem("token", response.data.token);
            axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;

            const profile = await fetchUserProfile();
            console.log("Fetched profile:", profile); // أضف للتحقق

            setUser({
                ...profile,
                role: profile.role || (decodeToken(response.data.token)?.role)
            });

            return true;
        } catch (err) {
            console.error("Login error:", err);
            setError(err.message || "Login failed");
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const value = {
        user,
        loading,
        error,
        login,
        logout: () => {
            localStorage.removeItem("token");
            setUser(null);
            window.location.href = "/";
        },
        isAuthenticated: !!localStorage.getItem("token"),
        getUserId: () => user?.userId, // استبدل getResidentId بـ getUserId
        isAdmin: () => user?.role?.toUpperCase() === "ADMIN",
        role: user?.role || null
    };

    useEffect(() => {
        initializeAuth();
    }, [initializeAuth]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within AuthProvider");
    }
    return context;
};