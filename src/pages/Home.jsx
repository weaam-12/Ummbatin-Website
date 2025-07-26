// src/pages/Home.jsx
import React from 'react';
import { useNavigate } from "react-router-dom";
import styles from './Home.module.css';
import bkg from "./bkg.jpg";

const Home = () => {
    const navigate = useNavigate();

    const services = [
        { name: "المياه", icon: "💧", path: "/water" },
        { name: "الأرنونا", icon: "🏠", path: "/arnona" },
        { name: "خدمة النفايات", icon: "🗑️", path: "/waste" },
        { name: "تسجيل الروضة", icon: "🧒", path: "/kindergarten" },
        { name: "المعاملات", icon: "📝", path: "/transactions" },
        { name: "طوارئ", icon: "🚨", path: "/emergency" },
        { name: "دفع إلكتروني", icon: "💳", path: "/payments" },
        { name: "حجز موعد", icon: "📅", path: "/appointments" },
        { name: "متابعة الطلبات", icon: "📬", path: "/requests" },
        { name: "أخبار وتحديثات", icon: "📰", path: "/news" }
    ];

    const activities = [
        { title: "يوم رياضي مجتمعي", date: "2025-07-10", duration: 3 },
        { title: "سوق صيفي", date: "2025-07-15", duration: 4 },
        { title: "أمسية ثقافية", date: "2025-07-20", duration: 2 }
    ];

    const handleServiceClick = (path) => {
        navigate(path);
    };

    return (
        <div className={styles.container}>
            <div className={styles.mainCard}>
                {/* البانر الرئيسي */}
                <img src={bkg} alt="بلدة أم بطين" className={styles.bannerImage} />

                {/* العنوان والوصف */}
                <h1 className={styles.title}>مرحباً بكم في بلدية أم بطين</h1>
                <p className={styles.description}>
                    أم بطين هي بلدة متطورة في النقب، تقدم خدمات بلدية متكاملة، تعليم ذو جودة عالية، وفعاليات ثقافية واجتماعية لكل أفراد العائلة.
                </p>

                {/* قسم الخدمات */}
                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>خدمات البلدية</h2>
                    <div className={styles.servicesGrid}>
                        {services.map((service, index) => (
                            <div
                                key={index}
                                className={styles.serviceItem}
                                onClick={() => handleServiceClick(service.path)}
                            >
                                <div className={styles.serviceIcon}>{service.icon}</div>
                                <div className={styles.serviceName}>{service.name}</div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* قسم الفعاليات */}
                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>الفعاليات القادمة</h2>
                    <div className={styles.activitiesGrid}>
                        {activities.map((activity, idx) => (
                            <div key={idx} className={styles.activityCard}>
                                <h3 className={styles.activityTitle}>{activity.title}</h3>
                                <p className={styles.activityDetail}>
                                    <strong>التاريخ:</strong> {activity.date}
                                </p>
                                <p className={styles.activityDetail}>
                                    <strong>المدة:</strong> {activity.duration} ساعات
                                </p>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Home;