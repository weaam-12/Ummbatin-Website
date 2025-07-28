// src/pages/Home.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import styles from './Home.module.css';
import bkg from "./bkg.jpg";
import { getAllEvents } from '../api';

const Home = () => {
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const data = await getAllEvents();
                // تصفية الفعاليات النشطة فقط وتنسيق التاريخ
                const formattedEvents = data
                    .filter(event => event.active)
                    .map(event => ({
                        ...event,
                        startDate: new Date(event.startDate).toLocaleDateString('ar-EG'),
                        endDate: new Date(event.endDate).toLocaleDateString('ar-EG')
                    }));
                setEvents(formattedEvents);
            } catch (error) {
                console.error('Error fetching events:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchEvents();
    }, []);

    const services = [
        { name: "المياه", icon: "💧", path: "/water" },
        { name: "الأرنونا", icon: "🏠", path: "/arnona" },
        { name: "خدمة النفايات", icon: "🗑️", path: "/waste" },
        { name: "تسجيل الروضة", icon: "🧒", path: "/kindergarten" },
        { name: "المعاملات", icon: "📝", path: "/transactions" },
        { name: "طوارئ", icon: "🚨", path: "/emergency" },
        { name: "دفع إلكتروني", icon: "💳", path: "/payments" },
        { name: "متابعة الطلبات", icon: "📬", path: "/requests" },
        { name: "أخبار وتحديثات", icon: "📰", path: "/news" }
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
                    {loading ? (
                        <p className={styles.loading}>جاري تحميل الفعاليات...</p>
                    ) : events.length > 0 ? (
                        <div className={styles.eventsGrid}>
                            {events.map((event, idx) => (
                                <div key={idx} className={styles.eventCard}>
                                    {event.imageUrl && (
                                        <img
                                            src={event.imageUrl}
                                            alt={event.title}
                                            className={styles.eventImage}
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = bkg; // صورة بديلة في حالة الخطأ
                                            }}
                                        />
                                    )}
                                    <div className={styles.eventContent}>
                                        <h3 className={styles.eventTitle}>{event.title}</h3>
                                        <p className={styles.eventDescription}>{event.description}</p>
                                        <div className={styles.eventDetails}>
                                            <p>
                                                <strong>التاريخ:</strong> من {event.startDate} إلى {event.endDate}
                                            </p>
                                            <p>
                                                <strong>المكان:</strong> {event.location}
                                            </p>
                                            <p>
                                                <strong>المنظم:</strong> {event.organizer}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className={styles.noEvents}>لا توجد فعاليات قادمة حالياً</p>
                    )}
                </section>
            </div>
        </div>
    );
};

export default Home;