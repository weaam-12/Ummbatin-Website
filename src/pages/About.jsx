import React from "react";
import { useTranslation } from "react-i18next";

const About = () => {
    const { t } = useTranslation();

    return (
        <div style={{ padding: '1.5rem' }}>
            <h2>{t("about.title")}</h2>
            <p>{t("about.description")}</p>

            <h3>{t("about.servicesTitle")}</h3>
            <p>{t("about.servicesDescription")}</p>
            <ul>
                <li>🧾 {t("about.services.waterAndArnona")}</li>
                <li>🎉 {t("about.services.eventsRegistration")}</li>
                <li>🏫 {t("about.services.kindergartenRegistration")}</li>
                <li>📅 {t("about.services.updatesFollowup")}</li>
            </ul>

            <p>{t("about.closingNote")}</p>
        </div>
    );
};

export default About;
