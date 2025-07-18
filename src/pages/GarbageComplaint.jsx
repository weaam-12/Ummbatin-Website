import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../AuthContext";
import { submitComplaint, getComplaints } from "../api";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./GarbageComplaint.css";
import { useNavigate } from "react-router-dom";

const GarbageComplaint = () => {
    const { t, i18n } = useTranslation();
    const { user, loading: authLoading, error: authError } = useAuth();
    const navigate = useNavigate();
    const [complaints, setComplaints] = useState([]);
    const [formLoading, setFormLoading] = useState(false);
    const [formData, setFormData] = useState({
        description: "",
        type: "uncollected",
        location: "",
        image: null,
        imagePreview: null,
    });

    // أنواع الشكاوى المتاحة
    const complaintTypes = [
        { value: "uncollected", label: t("garbageComplaint.types.uncollected") },
        { value: "overflowing", label: t("garbageComplaint.types.overflowing") },
        { value: "damagedBin", label: t("garbageComplaint.types.damagedBin") },
        { value: "missingBin", label: t("garbageComplaint.types.missingBin") },
        { value: "illegalDumping", label: t("garbageComplaint.types.illegalDumping") },
    ];

    useEffect(() => {
        if (!authLoading && !user) {
            navigate("/login");
        }
    }, [authLoading, user, navigate]);

    useEffect(() => {
        const fetchComplaints = async () => {
            if (!user?.userId) return;

            try {
                const data = await getComplaints(user.userId);
                setComplaints(data);
            } catch (error) {
                toast.error(t("garbageComplaint.errors.loadFailed"));
            }
        };

        fetchComplaints();
    }, [user, t]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleImageChange = (e) => {
        if (e.target.files[0]) {
            const file = e.target.files[0];
            setFormData({
                ...formData,
                image: file,
                imagePreview: URL.createObjectURL(file),
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!user?.userId) {
            toast.error(t("auth.loginRequired"));
            return;
        }

        setFormLoading(true);

        try {
            const formDataToSend = new FormData();
            formDataToSend.append("description", formData.description);
            formDataToSend.append("type", formData.type);
            formDataToSend.append("location", formData.location || "N/A");
            formDataToSend.append("userId", user.userId);

            if (formData.image) {
                formDataToSend.append("image", formData.image);
            }

            const newComplaint = await submitComplaint(formDataToSend);

            setComplaints([newComplaint, ...complaints]);
            setFormData({
                description: "",
                type: "uncollected",
                location: "",
                image: null,
                imagePreview: null,
            });

            toast.success(t("garbageComplaint.success.submit"));
        } catch (error) {
            console.error("Submission error:", error);
            toast.error(error.response?.data?.message || t("garbageComplaint.errors.submitFailed"));
        } finally {
            setFormLoading(false);
        }
    };

    if (authLoading) {
        return <div className="loading-spinner">{t("general.loading")}</div>;
    }

    if (authError || !user) {
        return (
            <div className="auth-error">
                <p>{authError || t("auth.loginRequired")}</p>
                <button onClick={() => navigate("/login")} className="login-btn">
                    {t("auth.login")}
                </button>
            </div>
        );
    }

    const statusColors = {
        SUBMITTED: "status-submitted",
        IN_PROGRESS: "status-in-progress",
        RESOLVED: "status-resolved",
        REJECTED: "status-rejected",
    };

    return (
        <div className={`garbage-complaint ${i18n.language === 'he' ? 'rtl' : ''}`}>
            <div className="complaint-header">
                <h1>{t("garbageComplaint.title")}</h1>
                <p>{t("garbageComplaint.subtitle")}</p>
            </div>

            <form onSubmit={handleSubmit} className="complaint-form">
                <div className="form-section">
                    <label>{t("garbageComplaint.description")} *</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        required
                        placeholder={t("garbageComplaint.descriptionPlaceholder")}
                        dir={i18n.language === 'he' ? 'rtl' : 'ltr'}
                    />
                </div>

                <div className="form-section">
                    <label>{t("garbageComplaint.type")} *</label>
                    <div className="type-options">
                        {complaintTypes.map((type) => (
                            <label key={type.value} className="type-option">
                                <input
                                    type="radio"
                                    name="type"
                                    value={type.value}
                                    checked={formData.type === type.value}
                                    onChange={handleInputChange}
                                    required
                                />
                                <span>{type.label}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <div className="form-section">
                    <label>{t("garbageComplaint.location")}</label>
                    <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        placeholder={t("garbageComplaint.locationPlaceholder")}
                    />
                </div>

                <div className="form-section">
                    <label>{t("garbageComplaint.image")}</label>
                    <div className="image-upload">
                        <label className="upload-btn">
                            {t("garbageComplaint.chooseImage")}
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                style={{ display: 'none' }}
                            />
                        </label>
                        {formData.imagePreview && (
                            <div className="image-preview">
                                <img src={formData.imagePreview} alt="Preview" />
                                <button
                                    type="button"
                                    onClick={() => setFormData({...formData, image: null, imagePreview: null})}
                                    className="remove-image"
                                >
                                    {t("garbageComplaint.removeImage")}
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <button type="submit" disabled={formLoading} className="submit-btn">
                    {formLoading ? t("garbageComplaint.submitting") : t("garbageComplaint.submit")}
                </button>
            </form>

            <div className="complaint-history">
                <h2>{t("garbageComplaint.historyTitle")}</h2>

                {complaints.length === 0 ? (
                    <p className="no-complaints">{t("garbageComplaint.noComplaints")}</p>
                ) : (
                    <div className="complaints-list">
                        {complaints.map((complaint) => (
                            <div key={complaint.complaintId} className="complaint-item">
                                <div className="complaint-header">
                                    <span className={`status ${statusColors[complaint.status]}`}>
                                        {t(`garbageComplaint.statuses.${complaint.status}`)}
                                    </span>
                                    <span className="ticket">#{complaint.ticketNumber}</span>
                                    <span className="date">
                                        {new Date(complaint.date).toLocaleDateString(i18n.language === 'he' ? 'he-IL' : 'en-US')}
                                    </span>
                                </div>

                                <div className="complaint-details">
                                    <p className="description">{complaint.description}</p>

                                    <div className="detail-row">
                                        <span>{t("garbageComplaint.type")}:</span>
                                        <span>{t(`garbageComplaint.types.${complaint.complaintType}`)}</span>
                                    </div>

                                    {complaint.location && (
                                        <div className="detail-row">
                                            <span>{t("garbageComplaint.location")}:</span>
                                            <span>{complaint.location}</span>
                                        </div>
                                    )}

                                    {complaint.imageUrl && (
                                        <div className="complaint-image">
                                            <img src={complaint.imageUrl} alt="Complaint" />
                                        </div>
                                    )}

                                    {complaint.response && (
                                        <div className="response">
                                            <h4>{t("garbageComplaint.response")}</h4>
                                            <p>{complaint.response}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default GarbageComplaint;