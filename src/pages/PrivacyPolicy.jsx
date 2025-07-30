import React from "react";
import { useTranslation } from "react-i18next";

const PrivacyPolicy = () => {
    const { t } = useTranslation();

    return (
        <div style={{ padding: '1.5rem' }}>
            <h2>{t("privacy.title")}</h2>
            <p>{t("privacy.text")}</p>
        </div>
    );
};

export default PrivacyPolicy;
