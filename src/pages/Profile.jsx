import React, { useEffect, useState } from "react";
import {axiosInstance} from "../api";
import { useAuth } from "../AuthContext";
import './Profile.css';
import {
    FaUser, FaUsers, FaFileDownload, FaSignOutAlt, FaUserEdit,
    FaHome, FaFileInvoiceDollar, FaFileAlt, FaCheck, FaClock
} from "react-icons/fa";

const Profile = () => {
    const [profile, setProfile] = useState(null);
    const [children, setChildren] = useState([]);
    const [properties, setProperties] = useState([]);
    const [error, setError] = useState("");
    const [documentRequest, setDocumentRequest] = useState({
        documentType: "",
        purpose: "",
        additionalNotes: ""
    });
    const { user, loading, logout } = useAuth();

    useEffect(() => {
        const loadProfile = async () => {
            try {
                const response = await axiosInstance.get('/api/users/profile');

                if (!response.data) {
                    throw new Error("لا توجد بيانات مستلمة");
                }

                setProfile(response.data);

                // تحميل البيانات الإضافية إذا كان هناك معرف مستخدم
                if (response.data.id) {
                    try {
                        const [childrenRes, propertiesRes, billsRes] = await Promise.all([
                            axiosInstance.get(`/api/children/user/${response.data.id}`),
                            axiosInstance.get(`/api/properties/user/${response.data.id}`),
                            axiosInstance.get(`/api/payments/user/${response.data.id}`)
                        ]);

                        setChildren(childrenRes.data || []);
                        setProperties(propertiesRes.data || []);
                    } catch (secondaryError) {
                        console.error("Error loading additional data:", secondaryError);
                        setError("تم تحميل البيانات الأساسية ولكن حدث خطأ في بعض البيانات الإضافية");
                    }
                }
            } catch (err) {
                console.error("Profile error details:", err);

                if (err.response) {
                    // خطأ من الخادم
                    if (err.response.status === 401) {
                        logout();
                        setError("انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى");
                    } else if (err.response.status === 500) {
                        setError("حدث خطأ في الخادم، يرجى المحاولة لاحقاً");
                    } else {
                        setError(err.response.data?.message || "حدث خطأ غير متوقع");
                    }
                } else if (err.request) {
                    // لم يتم استلام رد من الخادم
                    setError("لا يوجد اتصال بالخادم، يرجى التحقق من اتصال الإنترنت");
                } else {
                    // خطأ في إعداد الطلب
                    setError("حدث خطأ أثناء إعداد الطلب");
                }
            }
        };

        if (user) {
            loadProfile();
        }
    }, [user, logout]);

    const handleDocumentRequestChange = (e) => {
        const { name, value } = e.target;
        setDocumentRequest(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleDocumentRequestSubmit = async (e) => {
        e.preventDefault();
        try {
            // هنا سيتم إرسال طلب الوثيقة إلى الخادم
            alert("تم إرسال طلب الوثيقة بنجاح، سيتم التواصل معك قريباً");
            setDocumentRequest({
                documentType: "",
                purpose: "",
                additionalNotes: ""
            });
        } catch (err) {
            setError("فشل إرسال الطلب، يرجى المحاولة لاحقاً");
        }
    };

    if (loading) return <div className="loading-spinner">جاري التحميل...</div>;

    // وثائق الموافقات الافتراضية
    const documents = [
        { id: 1, name: "موافقة الإقامة في البلدة", date: "2023-05-15" },
        { id: 2, name: "سجل العائلة", date: "2023-05-15" },
        { id: 3, name: "شهادة السكن", date: "2023-06-20" }
    ];

    // أنواع الوثائق المتاحة للطلب
    const documentTypes = [
        "شهادة إقامة",
        "سجل عائلي",
        "شهادة سكن",
        "موافقة بناء",
        "تصريح تجاري"
    ];

    return (
        <div className="profile-container">
            {error && <div className="error-message">{error}</div>}

            <div className="profile-header">
                <h1>الملف الشخصي للمقيم</h1>
                <p>بلدية أم بطين - بوابة الخدمات الإلكترونية</p>
            </div>

            {profile && (
                <div className="profile-content">
                    {/* معلومات المستخدم الأساسية */}
                    <div className="profile-section">
                        <div className="section-title">
                            <FaUser /> معلومات المقيم
                        </div>
                        <div className="info-card">
                            <div className="info-row">
                                <span className="info-label">الاسم الكامل:</span>
                                <span className="info-value">{profile.fullName || 'غير محدد'}</span>
                            </div>
                            <div className="info-row">
                                <span className="info-label">البريد الإلكتروني:</span>
                                <span className="info-value">{profile.email}</span>
                            </div>
                            <div className="info-row">
                                <span className="info-label">رقم الهاتف:</span>
                                <span className="info-value">{profile.phone || 'غير محدد'}</span>
                            </div>
                            <div className="info-row">
                                <span className="info-label">رقم الهوية:</span>
                                <span className="info-value">{profile.idNumber || 'غير محدد'}</span>
                            </div>
                        </div>
                    </div>

                    {/* معلومات العائلة */}
                    <div className="profile-section">
                        <div className="section-title">
                            <FaUsers /> معلومات العائلة
                        </div>

                        {/* معلومات الزوجة */}
                        {profile.wives && profile.wives.length > 0 && (
                            <div className="family-members">
                                {profile.wives.map((wife, index) => (
                                    <div className="member-card" key={`wife-${index}`}>
                                        <div className="member-name">{wife.name}</div>
                                        <span className="member-relation">زوجة</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* معلومات الأطفال */}
                        {children.length > 0 && (
                            <>
                                <h4 style={{ marginTop: '20px', color: '#475569' }}>الأبناء:</h4>
                                <div className="family-members">
                                    {children.map((child) => (
                                        <div className="member-card" key={`child-${child.childId}`}>
                                            <div className="member-name">{child.name}</div>
                                            <div style={{ marginTop: '5px' }}>
                                                <span className="member-relation">ابن/ابنة</span>
                                            </div>
                                            {child.birthDate && (
                                                <div style={{ marginTop: '8px', fontSize: '0.9rem', color: '#64748b' }}>
                                                    تاريخ الميلاد: {new Date(child.birthDate).toLocaleDateString('ar-EG')}
                                                </div>
                                            )}
                                            {child.kindergartenName && (
                                                <div style={{ marginTop: '8px', fontSize: '0.9rem', color: '#64748b' }}>
                                                    روضة: {child.kindergartenName}
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
                            <FaHome /> <span className="property-icon">العقارات المملوكة</span>
                        </div>
                        {properties.length > 0 ? (
                            <div className="properties-grid">
                                {properties.map((property) => (
                                    <div className="property-card" key={property.propertyId}>
                                        <div className="property-title">{property.address || 'عقار بدون عنوان'}</div>
                                        <div className="property-details">
                                            <div className="property-detail">
                                                <span className="detail-label">نوع العقار:</span>
                                                <span className="detail-value">{property.type || 'غير محدد'}</span>
                                            </div>
                                            <div className="property-detail">
                                                <span className="detail-label">المساحة:</span>
                                                <span className="detail-value">{property.area ? `${property.area} م²` : 'غير محدد'}</span>
                                            </div>
                                            <div className="property-detail">
                                                <span className="detail-label">رقم القطعة:</span>
                                                <span className="detail-value">{property.plotNumber || 'غير محدد'}</span>
                                            </div>
                                            <div className="property-detail">
                                                <span className="detail-label">الحالة:</span>
                                                <span className="detail-value">{property.status || 'غير محدد'}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p style={{ color: '#64748b', textAlign: 'center' }}>لا توجد عقارات مسجلة</p>
                        )}
                    </div>

                    {/* الوثائق والموافقات */}
                    <div className="profile-section">
                        <div className="section-title">
                            <FaFileAlt /> <span className="request-icon">الوثائق والموافقات</span>
                        </div>
                        <div className="documents-list">
                            {documents.map((doc) => (
                                <div className="document-item" key={doc.id}>
                                    <div>
                                        <div className="document-name">{doc.name}</div>
                                        <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>تاريخ الإصدار: {doc.date}</div>
                                    </div>
                                    <button className="download-btn">
                                        <FaFileDownload style={{ marginLeft: '5px' }} />
                                        تنزيل
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* نموذج طلب وثيقة جديدة */}
                        <h3 style={{ marginTop: '30px', color: '#475569' }}>طلب وثيقة جديدة</h3>
                        <form className="document-form" onSubmit={handleDocumentRequestSubmit}>
                            <div className="form-group">
                                <label className="form-label" htmlFor="documentType">نوع الوثيقة المطلوبة</label>
                                <select
                                    id="documentType"
                                    name="documentType"
                                    className="form-select"
                                    value={documentRequest.documentType}
                                    onChange={handleDocumentRequestChange}
                                    required
                                >
                                    <option value="">-- اختر نوع الوثيقة --</option>
                                    {documentTypes.map((type, index) => (
                                        <option key={index} value={type}>{type}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label" htmlFor="purpose">الغرض من الوثيقة</label>
                                <input
                                    type="text"
                                    id="purpose"
                                    name="purpose"
                                    className="form-input"
                                    value={documentRequest.purpose}
                                    onChange={handleDocumentRequestChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label" htmlFor="additionalNotes">ملاحظات إضافية</label>
                                <textarea
                                    id="additionalNotes"
                                    name="additionalNotes"
                                    className="form-textarea"
                                    value={documentRequest.additionalNotes}
                                    onChange={handleDocumentRequestChange}
                                />
                            </div>

                            <button type="submit" className="submit-btn">
                                إرسال طلب الوثيقة
                            </button>
                        </form>
                    </div>

                    {/* أزرار التحكم */}
                    <div className="profile-actions">
                        <button className="action-btn secondary-btn">
                            <FaUserEdit /> تعديل الملف الشخصي
                        </button>
                        <button
                            onClick={logout}
                            className="action-btn primary-btn"
                        >
                            <FaSignOutAlt /> تسجيل خروج
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;