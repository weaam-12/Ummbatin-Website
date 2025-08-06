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
                console.log(error);
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
            console.log("Submitting complaint with data:", {
                userId: user.userId,
                type: formData.type,
                description: formData.description,
                location: formData.location,
                image: formData.image ? "Exists" : "None"
            });
            const formDataToSend = new FormData();
            formDataToSend.append('userId', user.userId);
            formDataToSend.append('type', formData.type);
            formDataToSend.append('description', formData.description);
            formDataToSend.append('location', formData.location || "N/A");

            if (formData.image) {
                formDataToSend.append('image', formData.image);
            }

            const newComplaint = await submitComplaint({
                userId: user.userId,
                type: formData.type,
                description: formData.description,
                location: formData.location || "N/A",
                image: formData.image
            });

            setComplaints([newComplaint, ...complaints]);
            setFormData({
                description: "",
                type: "uncollected",
                location: "",
                image: null,
                imagePreview: null,
            });

            toast.success(t("garbageComplaint.success.submit", {
                ticketNumber: newComplaint.ticketNumber
            }), {
                position: "top-center",
                autoClose: 8000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "colored",
                icon: "✅",
            });
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
                        aria-label={t("garbageComplaint.description")}
                    />
                </div>

                <div className="form-section">
                    <label>{t("garbageComplaint.type")} *</label>
                    <div className="type-options" role="group" aria-label={t("garbageComplaint.type")}>
                        {complaintTypes.map((type) => (
                            <label key={type.value} className="type-option">
                                <input
                                    type="radio"
                                    name="type"
                                    value={type.value}
                                    checked={formData.type === type.value}
                                    onChange={handleInputChange}
                                    required
                                    aria-checked={formData.type === type.value}
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
                        aria-label={t("garbageComplaint.location")}
                    />
                </div>

                <div className="form-section">
                    <label>{t("garbageComplaint.image")}</label>
                    <div className="image-upload">
                        <label className="upload-btn" aria-label={t("garbageComplaint.chooseImage")}>
                            {t("garbageComplaint.chooseImage")}
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                style={{ display: 'none' }}
                                aria-hidden="true"
                            />
                        </label>
                        {formData.imagePreview && (
                            <div className="image-preview">
                                <img src={formData.imagePreview} alt={t("garbageComplaint.imagePreview")} />
                                <button
                                    type="button"
                                    onClick={() => setFormData({...formData, image: null, imagePreview: null})}
                                    className="remove-image"
                                    aria-label={t("garbageComplaint.removeImage")}
                                >
                                    {t("garbageComplaint.removeImage")}
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={formLoading}
                    className="submit-btn"
                    aria-busy={formLoading}
                >
                    {formLoading ? t("garbageComplaint.submitting") : t("garbageComplaint.submit")}
                </button>
            </form>
            <ToastContainer
                position="top-center"
                autoClose={5000}
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
            />
       </div>
    );
};

export default GarbageComplaint;