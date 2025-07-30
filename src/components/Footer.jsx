import React from "react";
import { useTranslation } from "react-i18next";
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaPhoneAlt, FaEnvelope, FaMapMarkerAlt } from "react-icons/fa";
import "./Footer.css";

const Footer = () => {
    const { t } = useTranslation();

    return (
        <footer className="footer">
            <div className="footer-content">
                <div className="footer-info">
                    <p>© 2025 {t("footer.siteName")}. {t("footer.allRightsReserved")}.</p>
                    <address>
                        <p><FaMapMarkerAlt /> {t("footer.address")}</p>
                        <p><FaPhoneAlt /> {t("footer.phone")}</p>
                        <p><FaPhoneAlt /> {t("footer.fax")}</p>
                        <p><FaEnvelope /> {t("footer.email")}</p>
                    </address>
                </div>

                <nav className="footer-links">
                    <a href="/about">{t("footer.aboutMunicipality")}</a>
                    <a href="/privacy-policy">{t("footer.privacyPolicy")}</a>
                </nav>
            </div>

            <div className="footer-divider"></div>

            <div className="footer-social">
                <a href="https://facebook.com/umbateen" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                    <FaFacebook />
                </a>
                <a href="https://twitter.com/umbateen" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                    <FaTwitter />
                </a>
                <a href="https://instagram.com/umbateen" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                    <FaInstagram />
                </a>
            </div>
        </footer>
    );
};

export default Footer;