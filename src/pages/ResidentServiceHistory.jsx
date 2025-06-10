import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { fetchServiceHistory } from "../api"; // Assuming API is set up for this
import "../components/styles/GarbageComplaint.css";

const ResidentServiceHistory = ({ userId }) => {
    const { t } = useTranslation();
    const [serviceHistory, setServiceHistory] = useState([]);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const history = await fetchServiceHistory();
                const filteredHistory = history.filter(
                    (request) => request.userId === userId
                );
                setServiceHistory(filteredHistory);
            } catch (error) {
                console.error("Error fetching service history:", error);
            }
        };
        fetchHistory();
    }, [userId]);

    return (
        <div className="max-w-3xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6">{t("serviceHistory")}</h1>
            {serviceHistory.length > 0 ? (
                <ul>
                    {serviceHistory.map((request, index) => (
                        <li key={index} className="bg-gray-100 p-4 rounded-md mb-4">
                            <p><strong>{t("serviceType")}:</strong> {request.serviceType}</p>
                            <p><strong>{t("status")}:</strong> {request.status}</p>
                            <p><strong>{t("date")}:</strong> {new Date(request.date).toLocaleDateString()}</p>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-gray-500">{t("noRequests")}</p>
            )}
        </div>
    );
};

export default ResidentServiceHistory;
