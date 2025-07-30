import React, { useEffect, useState } from "react";
import { axiosInstance } from "../api";
import { useAuth } from "../AuthContext";
import { useTranslation } from "react-i18next";
import { PDFDownloadLink } from "@react-pdf/renderer";
import {
    FaUser, FaUsers, FaFileDownload, FaSignOutAlt, FaUserEdit,
    FaHome, FaFileAlt
} from "react-icons/fa";
import ProfileDocument from "./ProfileDocument.jsx";
import './Profile.css';

const Profile = () => {
    const { t, i18n } = useTranslation();
    const [profile, setProfile] = useState(null);
    const [children, setChildren] = useState([]);
    const [properties, setProperties] = useState([]);
    const [error, setError] = useState("");
    const { user, loading, logout } = useAuth();

    useEffect(() => {
        const loadProfile = async () => {
            try {
                const response = await axiosInstance.get('/api/users/profile');

                if (!response.data) {
                    throw new Error(t("errors.noDataReceived"));
                }

                setProfile(response.data);

                if (response.data.id) {
                    try {
                        const [childrenRes, propertiesRes] = await Promise.all([
                            axiosInstance.get(`/api/children/user/${response.data.id}`),
                            axiosInstance.get(`/api/properties/user/${response.data.id}`)
                        ]);

                        setChildren(Array.isArray(childrenRes?.data) ? childrenRes.data : []);
                        setProperties(Array.isArray(propertiesRes?.data) ? propertiesRes.data : []);

                    } catch (secondaryError) {
                        console.error("Error loading additional data:", secondaryError);
                        setError(t("errors.additionalDataError"));
                    }
                }
            } catch (err) {
                console.error("Profile error details:", err);

                if (err.response) {
                    if (err.response.status === 401) {
                        logout();
                        setError(t("errors.sessionExpired"));
                    } else if (err.response.status === 500) {
                        setError(t("errors.serverError"));
                    } else {
                        setError(err.response.data?.message || t("errors.unexpectedError"));
                    }
                } else if (err.request) {
                    setError(t("errors.noConnection"));
                } else {
                    setError(t("errors.requestError"));
                }
            }
        };

        if (user) {
            loadProfile();
        }
    }, [user, logout, t]);

    // وثائق الموافقات
    const documents = [
        { id: 1, name: t("profile.documents.residenceApproval"), date: new Date().toLocaleDateString(i18n.language) },
        { id: 2, name: t("profile.documents.familyRecord"), date: new Date().toLocaleDateString(i18n.language) },
        { id: 3, name: t("profile.documents.housingCertificate"), date: new Date().toLocaleDateString(i18n.language) }
    ];

    if (loading) return <div className="loading-spinner">{t("general.loading")}</div>;

    return (
        <div className="profile-container">
            {error && <div className="error-message">{error}</div>}

            <div className="profile-header">
                <h1>{t("profile.title")}</h1>
                <p>{t("profile.subtitle")}</p>
            </div>

            {profile && (
                <div className="profile-content">
                    {/* معلومات المستخدم الأساسية */}
                    <div className="profile-section">
                        <div className="section-title">
                            <FaUser/> {t("profile.sections.residentInfo")}
                        </div>
                        <div className="info-card">
                            <div className="info-row">
                                <span className="info-label">{t("profile.labels.fullName")}:</span>
                                <span className="info-value">{profile.fullName || t("general.notSpecified")}</span>
                            </div>
                            <div className="info-row">
                                <span className="info-label">{t("profile.labels.email")}:</span>
                                <span className="info-value">{profile.email}</span>
                            </div>
                            <div className="info-row">
                                <span className="info-label">{t("profile.labels.phone")}:</span>
                                <span className="info-value">{profile.phone || t("general.notSpecified")}</span>
                            </div>
                            <div className="info-row">
                                <span className="info-label">{t("profile.labels.idNumber")}:</span>
                                <span className="info-value">{profile.idNumber || t("general.notSpecified")}</span>
                            </div>
                        </div>
                    </div>

                    {/* معلومات العائلة */}
                    <div className="profile-section">
                        <div className="section-title">
                            <FaUsers/> {t("profile.sections.familyInfo")}
                        </div>

                        {profile.wives && profile.wives.length > 0 && (
                            <div className="family-members">
                                {profile.wives.map((wife, index) => (
                                    <div className="member-card" key={`wife-${index}`}>
                                        <div className="member-name">{wife.name}</div>
                                        <span className="member-relation">{t("profile.labels.wife")}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {children.length > 0 && (
                            <>
                                <h4 style={{marginTop: '20px', color: '#475569'}}>{t("profile.labels.children")}:</h4>
                                <div className="family-members">
                                    {children.map((child) => (
                                        <div className="member-card" key={`child-${child.childId}`}>
                                            <div className="member-name">{child.name}</div>
                                            <div style={{marginTop: '5px'}}>
                                                <span className="member-relation">{t("profile.labels.child")}</span>
                                            </div>
                                            {child.birthDate && (
                                                <div style={{marginTop: '8px', fontSize: '0.9rem', color: '#64748b'}}>
                                                    {t("profile.labels.birthDate")}: {new Date(child.birthDate).toLocaleDateString(i18n.language)}
                                                </div>
                                            )}
                                            {child.kindergartenName && (
                                                <div style={{marginTop: '8px', fontSize: '0.9rem', color: '#64748b'}}>
                                                    {t("profile.labels.kindergarten")}: {child.kindergartenName}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                    {/* العقارات المملوكة */}
                    <div className="profile-section">
                        <div className="section-title">
                            <FaHome/> {t("profile.sections.properties")}
                        </div>
                        {properties.length > 0 ? (
                            <div className="properties-grid">
                                {properties.map((property) => (
                                    <div className="property-card" key={property.propertyId}>
                                        <div className="property-title">{property.address || t("profile.labels.noAddress")}</div>
                                        <div className="property-details">
                                            <div className="property-detail">
                                                <span className="detail-label">{t("profile.labels.units")}:</span>
                                                <span className="detail-value">
                                                    {property.numberOfUnits || t("general.notSpecified")}
                                                </span>
                                            </div>
                                            <div className="property-detail">
                                                <span className="detail-label">{t("profile.labels.area")}:</span>
                                                <span className="detail-value">
                                                    {property.area ? `${property.area} ${t("general.squareMeters")}` : t("general.notSpecified")}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p style={{color: '#64748b', textAlign: 'center'}}>
                                {t("profile.labels.noProperties")}
                            </p>
                        )}
                    </div>

                    {/* الوثائق والموافقات */}
                    <div className="profile-section">
                        <div className="section-title">
                            <FaFileAlt/> {t("profile.sections.documents")}
                        </div>
                        <div className="documents-list">
                            {documents.map((doc) => (
                                <div className="document-item" key={doc.id}>
                                    <div>
                                        <div className="document-name">{doc.name}</div>
                                        <div style={{fontSize: '0.8rem', color: '#94a3b8'}}>
                                            {t("profile.labels.issueDate")}: {doc.date}
                                        </div>
                                    </div>
                                    <PDFDownloadLink
                                        document={<ProfileDocument document={doc} profile={profile} t={t} />}
                                        fileName={`${doc.name}.pdf`}
                                    >
                                        {({ loading }) => (
                                            <button className="download-btn" disabled={loading}>
                                                <FaFileDownload style={{marginLeft: '5px'}}/>
                                                {loading ? t("general.loading") : t("profile.labels.download")}
                                            </button>
                                        )}
                                    </PDFDownloadLink>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* أزرار التحكم */}
                    <div className="profile-actions">
                        <button className="action-btn secondary-btn">
                            <FaUserEdit/> {t("profile.labels.editProfile")}
                        </button>
                        <button onClick={logout} className="action-btn primary-btn">
                            <FaSignOutAlt/> {t("profile.labels.logout")}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;