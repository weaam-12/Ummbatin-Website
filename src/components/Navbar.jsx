import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FaBars, FaTimes, FaUserCircle, FaSearch, FaUserShield, FaHome, FaExclamationCircle, FaMoneyBillWave, FaBell, FaTrash, FaGraduationCap, FaCog, FaChartLine } from "react-icons/fa";
import logo from "./styles/img.png";
import { useAuth } from "../AuthContext";
import "./Navbar.css";
import { Dropdown } from 'react-bootstrap';

const Navbar = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const { user, isAdmin, logout } = useAuth();
    const [menuOpen, setMenuOpen] = useState(false);
    const [isRTL, setIsRTL] = useState(i18n.language === "ar");

    useEffect(() => {
        document.body.dir = i18n.language === "ar" ? "rtl" : "rtl";
        setIsRTL(i18n.language === "ar");
    }, [i18n.language]);

    const changeLanguage = (lang) => {
        i18n.changeLanguage(lang);
    };

    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
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
        { path: "/admin/emergency", icon: <FaBell />, text: t("emergencyManagement") },
        { path: "/admin/education", icon: <FaGraduationCap />, text: t("educationManagement") },
        { path: "/admin/payments", icon: <FaMoneyBillWave />, text: t("paymentsManagement") },
        { path: "/admin/complaints", icon: <FaExclamationCircle />, text: t("complaintsManagement") }
    ];

    return (
        <div className="nav-wrapper">
            <nav className={`navbar ${isRTL ? "rtl" : "ltr"}`} style={{ background: "#ffffff", borderBottom: "1px solid #e0e0e0", boxShadow: "0 2px 10px rgba(0, 0, 0, 0.05)" }}>
                <div className="navbar-container">

                    <div className="menu-icon" onClick={toggleMenu} style={{ color: "#1c1c1c" }}>
                        {menuOpen ? <FaTimes /> : <FaBars />}
                    </div>

                    {/* Navigation Links */}
                    <ul className={`navbar-links ${menuOpen ? "active" : ""}`}>
                        {/* روابط المستخدم العادي */}
                        {!isAdmin() && userLinks.map((link, index) => (
                            <li key={index}>
                                <NavLink to={link.path} onClick={toggleMenu}>
                                    <span className="nav-icon">{link.icon}</span>
                                    {link.text}
                                </NavLink>
                            </li>
                        ))}

                        {/* روابط الأدمن فقط */}
                        {isAdmin() && adminLinks.map((link, index) => (
                            <li key={index}>
                                <NavLink to={link.path} onClick={toggleMenu} className="admin-link">
                                    <span className="nav-icon">{link.icon}</span>
                                    {link.text}
                                </NavLink>
                            </li>
                        ))}
                    </ul>

                    {/* Right Side Elements */}
                    <div className="navbar-right">
                        <div className="search-bar">
                            <FaSearch className="search-icon" style={{ color: "#777" }} />
                            <input type="text" placeholder={t("search")} style={{ background: "#f7f7f7", color: "#333", border: "none" }} />
                        </div>
                        <div className="language-selector">
                            <button onClick={() => changeLanguage("he")} style={{ color: "#1c1c1c" }}>HE</button>
                            <span style={{ color: "#1c1c1c" }}>|</span>
                            <button onClick={() => changeLanguage("ar")} style={{ color: "#1c1c1c" }}>AR</button>
                        </div>
                        <div className="profile-menu">
                            {user ? (
                                <Dropdown>
                                    <Dropdown.Toggle variant="link" id="dropdown-profile" className="p-0">
                                        <span className="me-2">{user.fullName || user.email}</span>
                                        <FaUserCircle size={24} style={{ color: "#1c1c1c" }} />
                                    </Dropdown.Toggle>
                                    <Dropdown.Menu>
                                        <Dropdown.Item onClick={() => navigate("/profile")}>
                                            <FaUserCircle className="me-2" /> {t("profile")}
                                        </Dropdown.Item>
                                        {isAdmin() && (
                                            <Dropdown.Item onClick={() => navigate("/admin")}>
                                                <FaUserShield className="me-2" /> {t("adminPanel")}
                                            </Dropdown.Item>
                                        )}
                                        <Dropdown.Item onClick={logout} className="text-danger">
                                            <FaTimes className="me-2" /> {t("logout")}
                                        </Dropdown.Item>
                                    </Dropdown.Menu>
                                </Dropdown>
                            ) : (
                                <FaUserCircle size={24} onClick={() => navigate("/login")} style={{ color: "#1c1c1c" }} />
                            )}
                        </div>
                    </div>
                </div>

                {/* Floating Circle in Center Bottom */}
                <div className="floating-circle" style={{ bottom: "-60px", background: "#fff", border: "2px solid #e0e0e0" }}>
                    <img src={logo} alt="Floating Logo" className="floating-logo" />
                </div>
            </nav>
        </div>
    );
};

export default Navbar;