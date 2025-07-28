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
                    <p>© 2025 {t("siteName")}. {t("allRightsReserved")}.</p>
                    <address>
                        <p><FaMapMarkerAlt /> {t("address")}: أم بطين</p>
                        <p><FaPhoneAlt /> {t("phone")}: +972 2 1234 5678</p>
                        <p><FaPhoneAlt /> {t("fax")}: +972 2 8765 4321</p>
                        <p><FaEnvelope /> {t("email")}: info@umbateen.gov.il</p>
                    </address>
                </div>

                <nav className="footer-links">
                    <a href="/about">{t("aboutMunicipality")}</a>
                    <a href="/services">{t("services")}</a>
                    <a href="/privacy-policy">{t("privacyPolicy")}</a>
                    <a href="/contact">{t("contactUs")}</a>
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
                <a href="https://linkedin.com/company/umbateen" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                    <FaLinkedin />
                </a>
            </div>
        </footer>
    );
};

export default Footer;