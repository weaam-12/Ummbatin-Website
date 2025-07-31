import React, { useState, useEffect, useCallback } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
    FaBars,
    FaTimes,
    FaUserCircle,
    FaBell,
    FaUserShield,
    FaHome,
    FaExclamationCircle,
    FaMoneyBillWave,
    FaTrash,
    FaGraduationCap,
    FaCog,
    FaChartLine,
    FaSpinner,
    FaExclamationTriangle
} from "react-icons/fa";
import logo from "./styles/img.png";
import { useAuth } from "../AuthContext";
import "./Navbar.css";
import NewsTicker from "./NewsTicker";
import { axiosInstance } from "../api";

// دالة مساعدة لمعالجة البيانات المتكررة
const sanitizeNotificationData = (data) => {
    if (!data) return [];

    // إذا كانت البيانات مصفوفة بالفعل
    if (Array.isArray(data)) return data;

    try {
        // إذا كانت البيانات سلسلة نصية
        if (typeof data === 'string') {
            // محاولة إصلاح JSON المعطوب
            try {
                // المحاولة الأولى بالتحليل المباشر
                return JSON.parse(data);
            } catch (firstError) {
                console.warn('First JSON parse attempt failed, trying to fix...', firstError);

                // إزالة الأجزاء المتكررة المسببة للمشكلة
                const fixedData = data
                    .replace(/"properties":\[[^\]]*\],?/g, '') // إزالة properties المتكررة
                    .replace(/,\s*}/g, '}') // إصلاح الفواصل الزائدة
                    .replace(/,\s*]/g, ']'); // إصلاح الفواصل قبل الأقواس

                try {
                    return JSON.parse(fixedData);
                } catch (secondError) {
                    console.error('Failed to parse even after fixing:', secondError);
                    return [];
                }
            }
        }

        // إذا كانت البيانات كائن JavaScript
        if (typeof data === 'object') {
            // إزالة التكرارات يدوياً
            const cleanData = {...data};
            if (cleanData.user && cleanData.user.properties) {
                cleanData.user = {
                    userId: cleanData.user.userId,
                    fullName: cleanData.user.fullName
                };
            }
            return [cleanData];
        }

        return [];
    } catch (error) {
        console.error('Error sanitizing notification data:', error);
        return [];
    }
};

const Navbar = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const { user, isAdmin, logout } = useAuth();
    const [menuOpen, setMenuOpen] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [currentLanguage, setCurrentLanguage] = useState(i18n.language);
    const [notifications, setNotifications] = useState([]);
    const [notificationsLoading, setNotificationsLoading] = useState(false);
    const [notificationsError, setNotificationsError] = useState(null);
    const [lastFetchTime, setLastFetchTime] = useState(null);

    const fetchNotifications = useCallback(async () => {
        if (!user) {
            setNotifications([]);
            return;
        }

        setNotificationsLoading(true);
        setNotificationsError(null);

        try {
            const endpoint = isAdmin() ? 'api/notifications/admin' : 'api/notifications/me';
            const response = await axiosInstance.get(endpoint, {
                timeout: 5000, // timeout بعد 5 ثواني
                params: {
                    simple: true // لطلب بيانات مبسطة من الخادم
                }
            });

            const sanitizedData = sanitizeNotificationData(response.data);

            if (!Array.isArray(sanitizedData)) {
                throw new Error('Invalid notifications format');
            }

            const processedNotifications = sanitizedData.map(n => ({
                id: n.notificationId || n.id || Date.now().toString(),
                title: n.message || n.title || 'New notification',
                time: formatTime(n.createdAt || n.date),
                read: n.status === 'READ' || n.read || false
            }));

            setNotifications(processedNotifications);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
            setNotificationsError('Failed to load notifications. Please try again later.');

            // إعادة تعيين الإشعارات فقط إذا لم يكن خطأ مصادقة
            if (error.response?.status !== 401) {
                setNotifications([]);
            }
        } finally {
            setNotificationsLoading(false);
        }
    }, [user, isAdmin, formatTime]);

    useEffect(() => {
        fetchNotifications();

        // تحديث الإشعارات كل دقيقة
        const interval = setInterval(fetchNotifications, 60000);
        return () => clearInterval(interval);
    }, [fetchNotifications]);
    const changeLanguage = (lang) => {
        i18n.changeLanguage(lang);
        setCurrentLanguage(lang);
        localStorage.setItem('selectedLanguage', lang); // حفظ اللغة المختارة
    };
    const formatTime = useCallback((dateString) => {
        if (!dateString) return t('notifications.unknown_time');

        try {
            const now = new Date();
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return t('notifications.unknown_time');

            const diff = Math.floor((now - date) / 1000); // الفرق بالثواني

            if (diff < 60) return t('notifications.just_now');
            if (diff < 3600) {
                const minutes = Math.floor(diff / 60);
                return t('notifications.minutes_ago', { count: minutes });
            }
            if (diff < 86400) {
                const hours = Math.floor(diff / 3600);
                return t('notifications.hours_ago', { count: hours });
            }

            const days = Math.floor(diff / 86400);
            return t('notifications.days_ago', { count: days });
        } catch (e) {
            console.error('Error formatting time:', e);
            return t('notifications.unknown_time');
        }
    }, [t]);

    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };

    const toggleDropdown = () => {
        setShowDropdown(!showDropdown);
        if (!showDropdown) {
            setShowNotifications(false);
        }
    };

    const toggleNotifications = () => {
        setShowNotifications(!showNotifications);
        if (!showNotifications) {
            setShowDropdown(false);
            // جلب أحدث الإشعارات عند فتح القائمة
            fetchNotifications();
        }
    };

    const closeDropdowns = () => {
        setShowDropdown(false);
        setShowNotifications(false);
    };

    const handleLogout = () => {
        logout();
        closeDropdowns();
        navigate("/login");
    };

    const markAsRead = async (id) => {
        try {
            await axiosInstance.patch(`api/notifications/${id}/read`);

            setNotifications(prev =>
                prev.map(notification =>
                    notification.id === id
                        ? { ...notification, read: true }
                        : notification
                )
            );
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await axiosInstance.patch('api/notifications/mark-all-read');

            setNotifications(prev =>
                prev.map(notification => ({ ...notification, read: true }))
            );
        } catch (error) {
            console.error('Failed to mark all notifications as read:', error);
        }
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    const userLinks = [
        { path: "/", icon: <FaHome />, text: t("common.home") },
        { path: "/complaints", icon: <FaExclamationCircle />, text: t("services.complaints") },
        { path: "/payments", icon: <FaMoneyBillWave />, text: t("services.transactions") },
        { path: "/emergency", icon: <FaBell />, text: t("services.emergency") },
        { path: "/garbage-complaints", icon: <FaTrash />, text: t("services.garbage") },
        { path: "/children", icon: <FaGraduationCap />, text: t("navbar.education") }
    ];

    const adminLinks = [
        { path: "/admin", icon: <FaChartLine />, text: t("navbar.controlPanel") },
        { path: "/admin/general", icon: <FaCog />, text: t("navbar.generalManagement") },
        { path: "/admin/education", icon: <FaGraduationCap />, text: t("navbar.educationManagement") },
        { path: "/admin/payments", icon: <FaMoneyBillWave />, text: t("navbar.paymentsManagement") },
        { path: "/admin/complaints", icon: <FaExclamationCircle />, text: t("navbar.complaintsManagement") }
    ];

    const renderNotificationsDropdown = () => {
        if (!showNotifications) return null;

        return (
            <div className="notifications-dropdown">
                <div className="dropdown-header">
                    Notifications
                    {notificationsLoading && <span className="loading-spinner"></span>}
                </div>

                {notificationsError ? (
                    <div className="notification-error">
                        {notificationsError}
                        <button onClick={fetchNotifications}>Retry</button>
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="notification-empty">No notifications available</div>
                ) : (
                    notifications.map(notification => (
                        <div key={notification.id} className={`notification-item ${notification.read ? '' : 'unread'}`}>
                            <div className="notification-title">{notification.title}</div>
                            <div className="notification-time">{notification.time}</div>
                        </div>
                    ))
                )}
            </div>
        );
    };

    return (
        <div className="navbar-wrapper">
            <nav className="navbar">
                <div className="navbar-container">
                    <div className="brand-container">
                        <NavLink to="/" className="navbar-brand">
                            <img src={logo} alt="بلدية أم بطين"/>
                            <span>بلدية أم بطين</span>
                        </NavLink>
                    </div>

                    <div className="menu-icon" onClick={toggleMenu}>
                        {menuOpen ? <FaTimes/> : <FaBars/>}
                    </div>

                    <ul className={`navbar-links ${menuOpen ? "active" : ""}`}>
                        {!isAdmin() && userLinks.map((link, index) => (
                            <li key={index}>
                                <NavLink
                                    to={link.path}
                                    onClick={toggleMenu}
                                    className={({isActive}) => isActive ? "active" : ""}
                                >
                                    {link.icon}
                                    {link.text}
                                </NavLink>
                            </li>
                        ))}

                        {isAdmin() && adminLinks.map((link, index) => (
                            <li key={index}>
                                <NavLink
                                    to={link.path}
                                    onClick={toggleMenu}
                                    className={({isActive}) => isActive ? "active admin-link" : "admin-link"}
                                >
                                    {link.icon}
                                    {link.text}
                                </NavLink>
                            </li>
                        ))}
                    </ul>

                    <div className="navbar-right">
                        {user && (
                            <div className="notifications-menu">
                                <div
                                    className={`notifications-button ${showNotifications ? 'active' : ''}`}
                                    onClick={toggleNotifications}
                                >
                                    <FaBell className="notifications-icon"/>
                                    {unreadCount > 0 && (
                                        <span className="notifications-badge">
                                            {unreadCount > 9 ? '9+' : unreadCount}
                                        </span>
                                    )}
                                </div>
                                {renderNotificationsDropdown()}
                            </div>
                        )}

                        <div className="language-selector">
                            <button
                                onClick={() => changeLanguage("ar")}
                                className={currentLanguage === "ar" ? "active" : ""}
                            >
                                عربي
                            </button>
                            <span>|</span>
                            <button
                                onClick={() => changeLanguage("he")}
                                className={currentLanguage === "he" ? "active" : ""}
                            >
                                עברית
                            </button>
                        </div>

                        <div className="profile-menu">
                            <div
                                className={`profile-button ${showDropdown ? 'active' : ''}`}
                                onClick={toggleDropdown}
                            >
                                <FaUserCircle className="profile-icon"/>
                                {user ? (
                                    <span>{user.fullName || user.email}</span>
                                ) : (
                                    <span>{t("common.login")}</span>
                                )}
                            </div>

                            {showDropdown && (
                                <div className="dropdown-menu show">
                                    {user ? (
                                        <>
                                            <NavLink
                                                to="/profile"
                                                className="dropdown-item"
                                                onClick={closeDropdowns}
                                            >
                                                <FaUserCircle/>
                                                {t("common.profile")}
                                            </NavLink>
                                            {isAdmin() && (
                                                <NavLink
                                                    to="/admin"
                                                    className="dropdown-item"
                                                    onClick={closeDropdowns}
                                                >
                                                    <FaUserShield/>
                                                    {t("common.adminPanel")}
                                                </NavLink>
                                            )}
                                            <div
                                                className="dropdown-item logout"
                                                onClick={handleLogout}
                                            >
                                                <FaTimes/>
                                                {t("common.logout")}
                                            </div>
                                        </>
                                    ) : (
                                        <NavLink
                                            to="/login"
                                            className="dropdown-item"
                                            onClick={closeDropdowns}
                                        >
                                            <FaUserCircle/>
                                            {t("common.login")}
                                        </NavLink>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </nav>
            {(!isAdmin()) && (
                <div className="news-ticker-container">
                    <NewsTicker />
                </div>
            )}
        </div>
    );
};

export default Navbar;