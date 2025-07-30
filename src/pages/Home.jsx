import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import styles from './Home.module.css';
import bkg from "./bkg.jpg";
import { getAllEvents } from '../api';

const Home = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const data = await getAllEvents();
                const formattedEvents = data
                    .filter(event => event.active)
                    .map(event => ({
                        ...event,
                        startDate: new Date(event.startDate).toLocaleDateString(i18n.language === 'ar' ? 'ar-EG' : 'he-IL'),
                        endDate: new Date(event.endDate).toLocaleDateString(i18n.language === 'ar' ? 'ar-EG' : 'he-IL')
                    }));
                setEvents(formattedEvents);
            } catch (error) {
                console.error('Error fetching events:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchEvents();
    }, [i18n.language]);

    const services = [
        { name: t("services.water"), icon: "💧", path: "" },
        { name: t("services.arnona"), icon: "🏠", path: "/arnona" },
        { name: t("services.waste"), icon: "🗑️", path: "/waste" },
        { name: t("services.kindergarten"), icon: "🧒", path: "/kindergarten" },
        { name: t("services.transactions"), icon: "📝", path: "/transactions" },
        { name: t("services.emergency"), icon: "🚨", path: "/emergency" },
        { name: t("services.payments"), icon: "💳", path: "/payments" },
        { name: t("services.requests"), icon: "📬", path: "/requests" },
        { name: t("services.news"), icon: "📰", path: "/news" }
    ];

    const handleServiceClick = (path) => {
        navigate(path);
    };

    return (
        <div className={styles.container} dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
            <div className={styles.mainCard}>
                <img src={bkg} alt={t("homePage.bannerAlt")} className={styles.bannerImage} />

                <h1 className={styles.title}>{t("homePage.title")}</h1>
                <p className={styles.description}>
                    {t("homePage.description")}
                </p>

                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>{t("homePage.servicesTitle")}</h2>
                    <div className={styles.servicesGrid}>
                        {services.map((service, index) => (
                            <div
                                key={index}
                                className={styles.serviceItem}
                            >
                                <div className={styles.serviceIcon}>{service.icon}</div>
                                <div className={styles.serviceName}>{service.name}</div>
                            </div>
                        ))}
                    </div>
                </section>

                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>{t("homePage.eventsTitle")}</h2>
                    {loading ? (
                        <p className={styles.loading}>{t("common.loading")}</p>
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
                                                e.target.src = bkg;
                                            }}
                                        />
                                    )}
                                    <div className={styles.eventContent}>
                                        <h3 className={styles.eventTitle}>{event.title}</h3>
                                        <p className={styles.eventDescription}>{event.description}</p>
                                        <div className={styles.eventDetails}>
                                            <p>
                                                <strong>{t("event.date")}:</strong> {t("event.from")} {event.startDate} {t("event.to")} {event.endDate}
                                            </p>
                                            <p>
                                                <strong>{t("event.location")}:</strong> {event.location}
                                            </p>
                                            <p>
                                                <strong>{t("event.organizer")}:</strong> {event.organizer}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className={styles.noEvents}>{t("homePage.noEvents")}</p>
                    )}
                </section>
            </div>
        </div>
    );
};

export default Home;