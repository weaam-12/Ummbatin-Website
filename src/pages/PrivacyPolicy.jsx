import React from "react";
import { useTranslation } from "react-i18next";
import { ShieldCheck } from "lucide-react"; // أيقونة الخصوصية

const PrivacyPolicy = () => {
    const { t } = useTranslation();

    return (
        <div className="flex justify-center items-start min-h-screen bg-gray-50 py-10 px-4">
            <div className="max-w-3xl w-full bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
                <div className="flex items-center mb-6">
                    <ShieldCheck className="text-blue-600 w-6 h-6 mr-2" />
                    <h2 className="text-2xl font-bold text-gray-800">
                        {t("privacy.title")}
                    </h2>
                </div>
                <p className="text-gray-700 leading-relaxed text-lg whitespace-pre-line">
                    {t("privacy.text")}
                </p>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
