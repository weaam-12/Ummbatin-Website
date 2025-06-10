import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../AuthContext";

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, loading } = useAuth();

    if (loading) return <div>Loading...</div>; // You can use a Spinner component

    if (!user) return <Navigate to="/login" />;

    // If roles are provided, check user role
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to="/" />; // or a 403 page
    }

    return children;
};

export default ProtectedRoute;
