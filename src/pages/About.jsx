import React from "react";
import { useTranslation } from "react-i18next";
import { Info } from "lucide-react";
import "./About.css"; // <-- إضافة ملف CSS

const About = () => {
    const { t } = useTranslation();

    return (
        <div className="about-container">
            <div className="about-card">
                <div className="about-header">
                    <Info />
                    <h2 className="about-title">{t("about.title")}</h2>
                </div>

                <p className="about-text">{t("about.description")}</p>

                <h3 className="about-subtitle">{t("about.servicesTitle")}</h3>
                <p className="about-text">{t("about.servicesDescription")}</p>

                <ul className="about-list">
                    <li>🧾 {t("about.services.waterAndArnona")}</li>
                    <li>🎉 {t("about.services.eventsRegistration")}</li>
                    <li>🏫 {t("about.services.kindergartenRegistration")}</li>
                    <li>📅 {t("about.services.updatesFollowup")}</li>
                </ul>

                <p className="about-text">{t("about.closingNote")}</p>
            </div>
        </div>
    );
};

export default About;
