import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FaBars, FaTimes, FaUserCircle, FaSearch } from "react-icons/fa";
import logo from "./styles/img.png";
import "./Navbar.css";

const Navbar = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);

    const changeLanguage = (lang) => {
        i18n.changeLanguage(lang);
    };

    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };

    return (
        <div className="nav-wrapper">
            <nav className="navbar">
                <div className="navbar-container">
                    {/* Brand Section */}
                    <div className="brand-container">
                        <div className="logo-wrapper">
                        </div>
                        <NavLink to="/" className="navbar-brand">
                            {t("siteName")}
                        </NavLink>
                    </div>

                    {/* Menu Icon */}
                    <div className="menu-icon" onClick={toggleMenu}>
                        {menuOpen ? <FaTimes /> : <FaBars />}
                    </div>

                    {/* Navigation Links */}
                    <ul className={`navbar-links ${menuOpen ? "active" : ""}`}>
                        <li><NavLink to="/" onClick={toggleMenu}>{t("home")}</NavLink></li>
                        <li><NavLink to="/complaints" onClick={toggleMenu}>{t("complaints")}</NavLink></li>
                        <li><NavLink to="/payments" onClick={toggleMenu}>{t("payments")}</NavLink></li>
                        <li><NavLink to="/forms" onClick={toggleMenu}>{t("forms")}</NavLink></li>
                        <li><NavLink to="/emergency" onClick={toggleMenu}>{t("emergency")}</NavLink></li>
                        <li><NavLink to="/about" onClick={toggleMenu}>{t("about")}</NavLink></li>
                        <li><NavLink to="/garbage-complaint" onClick={toggleMenu}>{t("garbageService")}</NavLink></li>
                        <li><NavLink to="/children" onClick={toggleMenu}>{t("חינוך")}</NavLink></li>

                    </ul>

                    {/* Right Side Elements */}
                    <div className="navbar-right">
                    <div className="search-bar">
                            <FaSearch className="search-icon" />
                            <input type="text" placeholder={t("search")} />
                        </div>
                        <div className="language-selector">
                            <button onClick={() => changeLanguage("he")}>HE</button>
                            <span>|</span>
                            <button onClick={() => changeLanguage("ar")}>AR</button>
                        </div>
                        <div className="profile-menu">
                            <FaUserCircle size={24} onClick={() => navigate("/login")} />
                        </div>
                    </div>
                </div>

                {/* Prominent Floating Circle */}
                <div className="floating-circle">
                    <img src={logo} alt="Floating Logo" className="floating-logo" />
                </div>
            </nav>
        </div>
    );
};

export default Navbar;