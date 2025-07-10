import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import LoadingSpinner from "./LoadingSpinner";

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, loading, isAuthenticated } = useAuth();

    if (loading) {
        return <LoadingSpinner />;
    }

    if (!isAuthenticated) {
        localStorage.setItem('redirectPath', window.location.pathname);
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles) {
        const userRole = user?.role?.toUpperCase();
        const isAllowed = allowedRoles.some(role => role.toUpperCase() === userRole);

        if (!isAllowed) {
            // إذا كان أدمن يتم توجيهه للوحة التحكم
            if (userRole === 'ADMIN') {
                return <Navigate to="/admin" replace />; // تغيير المسار هنا
            }
            // إذا كان مستخدم عادي يتم توجيهه للصفحة الرئيسية
            return <Navigate to="/" replace />;
        }
    }

    return children;
};

export default ProtectedRoute;