import React, { createContext, useContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { fetchUserProfile, fetchUserNotifications } from '../api';
const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const { t } = useTranslation();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadUserData = async () => {
        try {
            setLoading(true);
            const userData = await fetchUserProfile();
            const notifications = await fetchUserNotifications(userData.id);

            setUser({
                ...userData,
                unreadNotifications: notifications.filter(n => !n.read).length,
                recentReports: userData.recentReports || []
            });
        } catch (err) {
            setError(t('error.loadUserProfile'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUserData();
    }, []);

    const updateUser = (newData) => {
        setUser(prev => ({ ...prev, ...newData }));
    };

// Use uppercase consistently
    const isAdmin = () => user?.role?.toUpperCase() === 'ADMIN';

    const value = {
        user,
        loading,
        error,
        updateUser,
        isAdmin,
        refreshUser: loadUserData
    };

    return (
        <UserContext.Provider value={value}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};
