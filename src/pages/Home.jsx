import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { FaHome, FaWater, FaLightbulb, FaSchool, FaBell, FaFileAlt, FaChartLine, FaUserShield } from "react-icons/fa";
import AnnouncementBar from "./AnnouncementBar";
import ServiceCard from "./ServiceCard";
import NewsCard from "./NewsCard";
import { useUser } from "./UserContext";

import { fetchServices, fetchAnnouncements, fetchRecentPayments } from "../api";
import "./Home.css";

const Home = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const { user, isAdmin } = useUser();

    const [services, setServices] = useState([]);
    const [announcements, setAnnouncements] = useState([]);
    const [recentPayments, setRecentPayments] = useState([]);
    const [loading, setLoading] = useState({
        services: true,
        announcements: true,
        payments: true
    });
    const [errors, setErrors] = useState({
        services: null,
        announcements: null,
        payments: null
    });

    useEffect(() => {
        const loadData = async () => {
            try {
                // Load services
                const servicesData = await fetchServices();
                setServices(servicesData);
                setLoading(prev => ({ ...prev, services: false }));

                // Load announcements
                const announcementsData = await fetchAnnouncements();
                setAnnouncements(announcementsData.slice(0, 3));
                setLoading(prev => ({ ...prev, announcements: false }));

                // Load recent payments if user is logged in
                if (user) {
                    const paymentsData = await fetchRecentPayments(user.id);
                    setRecentPayments(paymentsData.slice(0, 3));
                }
                setLoading(prev => ({ ...prev, payments: false }));
            } catch (err) {
                setErrors({
                    services: t("error.loadServices"),
                    announcements: t("error.loadAnnouncements"),
                    payments: t("error.loadPayments")
                });
                setLoading({
                    services: false,
                    announcements: false,
                    payments: false
                });
            }
        };

        loadData();
    }, [user, t]);

    const getServiceIcon = (serviceType) => {
        switch (serviceType) {
            case 'arnona':
                return <FaHome className="text-blue-600" size={24} />;
            case 'water':
                return <FaWater className="text-blue-400" size={24} />;
            case 'electricity':
                return <FaLightbulb className="text-yellow-500" size={24} />;
            case 'education':
                return <FaSchool className="text-green-600" size={24} />;
            case 'reports':
                return <FaFileAlt className="text-red-500" size={24} />;
            case 'statistics':
                return <FaChartLine className="text-purple-600" size={24} />;
            default:
                return <FaHome className="text-gray-600" size={24} />;
        }
    };

    return (
        <div className={`home-container ${i18n.dir()}`}>
            {/* Announcement Bar for urgent messages */}
            <AnnouncementBar
                message={t("urgentMessage")}
                link="/announcements"
                linkText={t("viewAll")}
            />

            {/* User Greeting Section */}
            {user ? (
                <section className="user-greeting-section bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg shadow-sm mb-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">
                                {t("welcomeBack")}, {user.name}!
                            </h2>
                            <p className="text-gray-600 mt-1">
                                {t("lastLogin")}: {new Date(user.lastLogin).toLocaleString()}
                            </p>
                        </div>
                        <div className="flex space-x-4 mt-4 md:mt-0">
                            {user.unreadNotifications > 0 && (
                                <button
                                    onClick={() => navigate("/notifications")}
                                    className="relative bg-white px-4 py-2 rounded-lg shadow hover:shadow-md transition-all"
                                >
                                    <FaBell className="text-yellow-500" size={20} />
                                    <span className="notification-badge bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                        {user.unreadNotifications}
                                    </span>
                                </button>
                            )}
                            <button
                                onClick={() => navigate("/dashboard")}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg shadow hover:shadow-md transition-all"
                            >
                                {t("goToDashboard")}
                            </button>
                        </div>
                    </div>
                </section>
            ) : (
                <section className="hero-section bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-8 rounded-lg shadow-lg mb-8">
                    <div className="max-w-4xl mx-auto text-center">
                        <h1 className="text-3xl md:text-4xl font-bold mb-4">
                            {t("hero.mainTitle")}
                        </h1>
                        <p className="text-xl mb-6 opacity-90">
                            {t("hero.subtitle")}
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                            <button
                                onClick={() => navigate("/signup")}
                                className="bg-white text-blue-600 hover:bg-gray-100 px-6 py-3 rounded-lg font-medium shadow hover:shadow-md transition-all"
                            >
                                {t("registerNow")}
                            </button>
                            <button
                                onClick={() => navigate("/about")}
                                className="bg-transparent border-2 border-white hover:bg-white hover:bg-opacity-10 px-6 py-3 rounded-lg font-medium shadow hover:shadow-md transition-all"
                            >
                                {t("learnMore")}
                            </button>
                        </div>
                    </div>
                </section>
            )}

            {/* Quick Actions Section */}
            <section className="quick-actions mb-10">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">
                    {t("quickActions")}
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <button
                        onClick={() => navigate("/services/arnona")}
                        className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-all flex flex-col items-center"
                    >
                        <FaHome className="text-blue-600 mb-2" size={24} />
                        <span>{t("payArnona")}</span>
                    </button>
                    <button
                        onClick={() => navigate("/services/water")}
                        className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-all flex flex-col items-center"
                    >
                        <FaWater className="text-blue-400 mb-2" size={24} />
                        <span>{t("payWaterBill")}</span>
                    </button>
                    <button
                        onClick={() => navigate("/reports/new")}
                        className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-all flex flex-col items-center"
                    >
                        <FaFileAlt className="text-red-500 mb-2" size={24} />
                        <span>{t("reportIssue")}</span>
                    </button>
                    <button
                        onClick={() => navigate("/services/education")}
                        className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-all flex flex-col items-center"
                    >
                        <FaSchool className="text-green-600 mb-2" size={24} />
                        <span>{t("registerChild")}</span>
                    </button>
                </div>
            </section>

            {/* Main Services Section */}
            <section className="services-section mb-10">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">
                        {t("ourServices")}
                    </h2>
                    {user && (
                        <button
                            onClick={() => navigate("/services")}
                            className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                            {t("viewAllServices")}
                        </button>
                    )}
                </div>

                {loading.services ? (
                    <div className="flex justify-center py-10">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                ) : errors.services ? (
                    <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
                        <p>{errors.services}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="mt-2 text-red-700 underline"
                        >
                            {t("tryAgain")}
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {services.map((service) => (
                            <ServiceCard
                                key={service.id}
                                icon={getServiceIcon(service.type)}
                                title={t(service.title)}
                                description={t(service.description)}
                                onClick={() => navigate(service.path)}
                                stats={service.stats}
                                isNew={service.isNew}
                            />
                        ))}
                    </div>
                )}
            </section>

            {/* Recent Activity Section (for logged in users) */}
            {user && (
                <section className="recent-activity mb-10">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">
                        {t("recentActivity")}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Recent Payments */}
                        <div className="bg-white p-6 rounded-lg shadow">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-gray-800">
                                    {t("recentPayments")}
                                </h3>
                                <button
                                    onClick={() => navigate("/payments")}
                                    className="text-blue-600 hover:text-blue-800 text-sm"
                                >
                                    {t("viewAll")}
                                </button>
                            </div>
                            {loading.payments ? (
                                <div className="flex justify-center py-4">
                                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                                </div>
                            ) : errors.payments ? (
                                <div className="text-red-600 text-sm">
                                    {errors.payments}
                                </div>
                            ) : recentPayments.length > 0 ? (
                                <ul className="space-y-3">
                                    {recentPayments.map((payment) => (
                                        <li key={payment.id} className="flex justify-between items-center border-b pb-2">
                                            <div>
                                                <p className="font-medium">{t(payment.service)}</p>
                                                <p className="text-sm text-gray-500">
                                                    {new Date(payment.date).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-semibold">{payment.amount} ₪</p>
                                                <p className={`text-xs ${payment.status === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>
                                                    {t(payment.status)}
                                                </p>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-gray-500 text-center py-4">
                                    {t("noRecentPayments")}
                                </p>
                            )}
                        </div>

                        {/* Recent Reports */}
                        <div className="bg-white p-6 rounded-lg shadow">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-gray-800">
                                    {t("recentReports")}
                                </h3>
                                <button
                                    onClick={() => navigate("/reports")}
                                    className="text-blue-600 hover:text-blue-800 text-sm"
                                >
                                    {t("viewAll")}
                                </button>
                            </div>
                            {user.recentReports && user.recentReports.length > 0 ? (
                                <ul className="space-y-3">
                                    {user.recentReports.map((report) => (
                                        <li key={report.id} className="border-b pb-2">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="font-medium">{report.title}</p>
                                                    <p className="text-sm text-gray-500">
                                                        {new Date(report.date).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <span className={`px-2 py-1 text-xs rounded-full ${
                                                    report.status === 'open' ? 'bg-yellow-100 text-yellow-800' :
                                                        report.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                                                            'bg-green-100 text-green-800'
                                                }`}>
                                                    {t(report.status)}
                                                </span>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="text-center py-4">
                                    <p className="text-gray-500 mb-3">
                                        {t("noRecentReports")}
                                    </p>
                                    <button
                                        onClick={() => navigate("/reports/new")}
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm"
                                    >
                                        {t("reportNewIssue")}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            )}

            {/* Announcements Section */}
            <section className="announcements-section mb-10">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">
                        {t("latestAnnouncements")}
                    </h2>
                    <button
                        onClick={() => navigate("/announcements")}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                        {t("viewAllAnnouncements")}
                    </button>
                </div>
                {loading.announcements ? (
                    <div className="flex justify-center py-10">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                ) : errors.announcements ? (
                    <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
                        <p>{errors.announcements}</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {announcements.map((announcement) => (
                            <NewsCard
                                key={announcement.id}
                                title={announcement.title}
                                date={new Date(announcement.date)}
                                content={announcement.content}
                                isUrgent={announcement.isUrgent}
                                onClick={() => navigate(`/announcements/${announcement.id}`)}
                            />
                        ))}
                    </div>
                )}
            </section>

            {/* Community Statistics Section */}
            <section className="community-stats bg-blue-50 p-6 rounded-lg shadow-inner mb-10">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">
                    {t("communityStatistics")}
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-lg shadow text-center">
                        <p className="text-gray-500 text-sm">{t("totalResidents")}</p>
                        <p className="text-3xl font-bold text-blue-600">1,240</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow text-center">
                        <p className="text-gray-500 text-sm">{t("arnonaCollection")}</p>
                        <p className="text-3xl font-bold text-green-600">82%</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow text-center">
                        <p className="text-gray-500 text-sm">{t("reportsThisMonth")}</p>
                        <p className="text-3xl font-bold text-yellow-600">47</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow text-center">
                        <p className="text-gray-500 text-sm">{t("avgResponseTime")}</p>
                        <p className="text-3xl font-bold text-purple-600">2.3 {t("days")}</p>
                    </div>
                </div>
            </section>

            {/* Call to Action Section */}
            {!user && (
                <section className="cta-section bg-gradient-to-r from-green-600 to-teal-600 text-white p-8 rounded-lg shadow-lg">
                    <div className="max-w-4xl mx-auto text-center">
                        <h2 className="text-2xl md:text-3xl font-bold mb-4">
                            {t("joinOurCommunity")}
                        </h2>
                        <p className="text-lg mb-6 opacity-90">
                            {t("ctaDescription")}
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                            <button
                                onClick={() => navigate("/signup")}
                                className="bg-white text-green-600 hover:bg-gray-100 px-6 py-3 rounded-lg font-medium shadow hover:shadow-md transition-all"
                            >
                                {t("registerNow")}
                            </button>
                            <button
                                onClick={() => navigate("/contact")}
                                className="bg-transparent border-2 border-white hover:bg-white hover:bg-opacity-10 px-6 py-3 rounded-lg font-medium shadow hover:shadow-md transition-all"
                            >
                                {t("contactSupport")}
                            </button>
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
};

export default Home;