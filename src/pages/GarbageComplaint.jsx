import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { submitComplaint, fetchComplaintHistory } from "../api";
import Form from "../pages/Forms";
import "../components/styles/GarbageComplaint.css";

const GarbageComplaint = () => {
    const { t } = useTranslation();
    const [complaintHistory, setComplaintHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const history = await fetchComplaintHistory();
                setComplaintHistory(history);
            } catch (error) {
                console.error("שגיאה בטעינת היסטוריית תלונות:", error);
            }
        };
        fetchHistory();
    }, []);

    const fields = [
        { name: "complaint", label: "תיאור התלונה", type: "textarea", required: true },
        {
            name: "category",
            label: "קטגוריה",
            type: "select",
            required: true,
            options: [
                { value: "uncollected", label: "אשפה שלא נאספה" },
                { value: "newOne", label: "הזמנת פח חדש" },
            ],
        },
        { name: "images", label: "העלאת תמונות", type: "file", required: false },
    ];

    const handleSubmit = async (formData) => {
        setLoading(true);
        setMessage("");

        try {
            const response = await submitComplaint(formData);
            if (response.status === "success") {
                setMessage("התלונה נשלחה בהצלחה.");
                setComplaintHistory((prevHistory) => [...prevHistory, response.complaint]);
            } else {
                setMessage("שגיאה בשליחת התלונה.");
            }
        } catch (error) {
            setMessage("שגיאה בשליחת התלונה.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="complaint-page">
            <h1>תלונת אשפה</h1>
            <p>כאן תוכלו להגיש תלונה בנוגע לבעיות איסוף אשפה.</p>

            <Form fields={fields} onSubmit={handleSubmit} loading={loading} submitButtonText="שלח" />

            <div className="complaint-history">
                <h2>היסטוריית תלונות</h2>
                {complaintHistory.length > 0 ? (
                    <ul>
                        {complaintHistory.map((complaint, index) => (
                            <li key={index}>
                                <p><strong>קטגוריה:</strong> {complaint.category}</p>
                                <p><strong>סטטוס:</strong> {complaint.status}</p>
                                <p><strong>תאריך:</strong> {new Date(complaint.date).toLocaleDateString()}</p>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>לא נמצאו תלונות קודמות.</p>
                )}
            </div>

            {message && <p className="message">{message}</p>}
        </div>
    );
};

export default GarbageComplaint;
