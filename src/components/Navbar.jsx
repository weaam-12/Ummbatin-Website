import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
    FaBars,
    FaTimes,
    FaUserCircle,
    FaSearch,
    FaUserShield,
    FaHome,
    FaExclamationCircle,
    FaMoneyBillWave,
    FaBell,
    FaTrash,
    FaGraduationCap,
    FaCog,
    FaChartLine
} from "react-icons/fa";
import logo from "./styles/img.png";
import { useAuth } from "../AuthContext";
import "./Navbar.css";

const Navbar = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const { user, isAdmin, logout } = useAuth();
    const [menuOpen, setMenuOpen] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [currentLanguage, setCurrentLanguage] = useState(i18n.language);

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

    const closeDropdown = () => {
        setShowDropdown(false);
    };

    const handleLogout = () => {
        logout();
        closeDropdown();
        navigate("/login");
    };

    // روابط المستخدم العادي
    const userLinks = [
        { path: "/", icon: <FaHome />, text: t("home") },
        { path: "/complaints", icon: <FaExclamationCircle />, text: t("complaints") },
        { path: "/payments", icon: <FaMoneyBillWave />, text: t("payments") },
        { path: "/emergency", icon: <FaBell />, text: t("emergency") },
        { path: "/garbage-complaints", icon: <FaTrash />, text: t("garbageService") },
        { path: "/children", icon: <FaGraduationCap />, text: t("education") }
    ];

    // روابط الأدمن فقط
    const adminLinks = [
        { path: "/admin", icon: <FaChartLine />, text: t("controlPanel") },
        { path: "/admin/general", icon: <FaCog />, text: t("generalManagement") },
        { path: "/admin/education", icon: <FaGraduationCap />, text: t("educationManagement") },
        { path: "/admin/payments", icon: <FaMoneyBillWave />, text: t("paymentsManagement") },
        { path: "/admin/complaints", icon: <FaExclamationCircle />, text: t("complaintsManagement") }
    ];

    return (
        <nav className="navbar">
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
                    <div className="search-bar">
                        <FaSearch className="search-icon" />
                        <input
                            type="text"
                            placeholder={t("search")}
                        />
                    </div>

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
                            <FaUserCircle className="profile-icon" />
                            {user ? (
                                <span>{user.fullName || user.email}</span>
                            ) : (
                                <span>{t("login")}</span>
                            )}
                        </div>

                        {showDropdown && (
                            <div className="dropdown-menu show">
                                {user ? (
                                    <>
                                        <NavLink
                                            to="/profile"
                                            className="dropdown-item"
                                            onClick={closeDropdown}
                                        >
                                            <FaUserCircle />
                                            {t("profile")}
                                        </NavLink>
                                        {isAdmin() && (
                                            <NavLink
                                                to="/admin"
                                                className="dropdown-item"
                                                onClick={closeDropdown}
                                            >
                                                <FaUserShield />
                                                {t("adminPanel")}
                                            </NavLink>
                                        )}
                                        <div
                                            className="dropdown-item logout"
                                            onClick={handleLogout}
                                        >
                                            <FaTimes />
                                            {t("logout")}
                                        </div>
                                    </>
                                ) : (
                                    <NavLink
                                        to="/login"
                                        className="dropdown-item"
                                        onClick={closeDropdown}
                                    >
                                        <FaUserCircle />
                                        {t("login")}
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