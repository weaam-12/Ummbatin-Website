import React, { useState, useEffect } from "react";
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
    FaChartLine
} from "react-icons/fa";
import logo from "./styles/img.png";
import { useAuth } from "../AuthContext";
import "./Navbar.css";
import NewsTicker from "./NewsTicker";
const Navbar = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const { user, isAdmin, logout } = useAuth();
    const [menuOpen, setMenuOpen] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [currentLanguage, setCurrentLanguage] = useState(i18n.language);
    const [notifications, setNotifications] = useState([
        { id: 1, title: "تم دفع الفاتورة بنجاح", time: "منذ ساعتين", read: false },
        { id: 2, title: "شكوى جديدة تحتاج إلى مراجعة", time: "منذ يوم", read: true },
        { id: 3, title: "تمت الموافقة على طلبك", time: "منذ 3 أيام", read: true }
    ]);

    useEffect(() => {
        document.body.dir = "rtl";
    }, []);

    const changeLanguage = (lang) => {
        i18n.changeLanguage(lang);
        setCurrentLanguage(lang);
    };

    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };

    const toggleDropdown = () => {
        setShowDropdown(!showDropdown);
    };

    const toggleNotifications = () => {
        setShowNotifications(!showNotifications);
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

    const markAsRead = (id) => {
        setNotifications(notifications.map(notification =>
            notification.id === id ? { ...notification, read: true } : notification
        ));
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    // روابط المستخدم العادي
    const userLinks = [
        { path: "/", icon: <FaHome />, text: t("common.home") },
        { path: "/complaints", icon: <FaExclamationCircle />, text: t("services.complaints") },
        { path: "/payments", icon: <FaMoneyBillWave />, text: t("services.transactions") },
        { path: "/emergency", icon: <FaBell />, text: t("services.emergency") },
        { path: "/garbage-complaints", icon: <FaTrash />, text: t("services.garbage") },
        { path: "/children", icon: <FaGraduationCap />, text: t("navbar.education") }
    ];

    // روابط الأدمن فقط
    const adminLinks = [
        { path: "/admin", icon: <FaChartLine />, text: t("navbar.controlPanel") },
        { path: "/admin/general", icon: <FaCog />, text: t("navbar.generalManagement") },
        { path: "/admin/education", icon: <FaGraduationCap />, text: t("navbar.educationManagement") },
        { path: "/admin/payments", icon: <FaMoneyBillWave />, text: t("navbar.paymentsManagement") },
        { path: "/admin/complaints", icon: <FaExclamationCircle />, text: t("navbar.complaintsManagement") }
    ];

    return (

        <nav className="navbar">
            {(!isAdmin()) && <NewsTicker />}

            <div className="navbar-container">
                <div className="brand-container">
                    <NavLink to="/" className="navbar-brand">
                        <img src={logo} alt="بلدية أم بطين" />
                        <span>بلدية أم بطين</span>
                    </NavLink>
                </div>

                <div className="menu-icon" onClick={toggleMenu}>
                    {menuOpen ? <FaTimes /> : <FaBars />}
                </div>

                <ul className={`navbar-links ${menuOpen ? "active" : ""}`}>
                    {!isAdmin() && userLinks.map((link, index) => (
                        <li key={index}>
                            <NavLink
                                to={link.path}
                                onClick={toggleMenu}
                                className={({ isActive }) => isActive ? "active" : ""}
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
                                className={({ isActive }) => isActive ? "active admin-link" : "admin-link"}
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
                            <div className="notifications-button" onClick={toggleNotifications}>
                                <FaBell className="notifications-icon" />
                                {unreadCount > 0 && (
                                    <span className="notifications-badge">{unreadCount}</span>
                                )}
                            </div>
                            {showNotifications && (
                                <div className="notifications-dropdown show">
                                    <div className="dropdown-header">الإشعارات</div>
                                    {notifications.map(notification => (
                                        <div
                                            key={notification.id}
                                            className={`notification-item ${!notification.read ? "unread" : ""}`}
                                            onClick={() => markAsRead(notification.id)}
                                        >
                                            <div className="notification-title">{notification.title}</div>
                                            <div className="notification-time">{notification.time}</div>
                                        </div>
                                    ))}
                                    <div className="view-all" onClick={() => {
                                        navigate("/notifications");
                                        closeDropdowns();
                                    }}>
                                        عرض الكل
                                    </div>
                                </div>
                            )}
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
                        <div className="profile-button" onClick={toggleDropdown}>
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
    );
};

export default Navbar;