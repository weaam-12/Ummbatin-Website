import React from "react";
import { useTranslation } from "react-i18next";
import { Info } from "lucide-react";

const About = () => {
    const { t } = useTranslation();

    return (
        <div className="flex justify-center items-start min-h-screen bg-gray-50 py-10 px-4">
            <div className="max-w-3xl w-full bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
                <div className="flex items-center mb-6">
                    <Info className="text-green-600 w-6 h-6 mr-2" />
                    <h2 className="text-2xl font-bold text-gray-800">
                        {t("about.title")}
                    </h2>
                </div>

                <p className="text-gray-700 leading-relaxed text-lg whitespace-pre-line mb-6">
                    {t("about.description")}
                </p>

                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    {t("about.servicesTitle")}
                </h3>

                <p className="text-gray-700 leading-relaxed text-lg mb-4">
                    {t("about.servicesDescription")}
                </p>

                <ul className="list-disc list-inside text-gray-700 text-lg space-y-2">
                    <li>🧾 {t("about.services.waterAndArnona")}</li>
                    <li>🎉 {t("about.services.eventsRegistration")}</li>
                    <li>🏫 {t("about.services.kindergartenRegistration")}</li>
                    <li>📅 {t("about.services.updatesFollowup")}</li>
                </ul>

                <p className="text-gray-700 leading-relaxed text-lg mt-6">
                    {t("about.closingNote")}
                </p>
            </div>
        </div>
    );
};

export default About;
