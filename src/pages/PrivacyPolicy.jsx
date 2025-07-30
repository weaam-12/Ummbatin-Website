import React from "react";
import { useTranslation } from "react-i18next";
import { ShieldCheck } from "lucide-react";
import "./PrivacyPolicy.css";

const PrivacyPolicy = () => {
    const { t } = useTranslation();

    return (
        <div className="policy-container">
            <div className="policy-card">
                <div className="policy-header">
                    <ShieldCheck className="policy-icon" />
                    <h2 className="policy-title">{t("privacy.title")}</h2>
                </div>
                <p className="policy-text">{t("privacy.text")}</p>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
