import React, { useState, useEffect, useRef } from 'react';
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
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    /* Ref for the modal’s close button so we can return focus */
    const closeBtnRef = useRef(null);
    const lastFocusedElement = useRef(null);

    /* ---------- Fetch data ---------- */
    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const data = await getAllEvents();
                const formattedEvents = data
                    .filter(event => event.active)
                    .map(event => ({
                        ...event,
                        startDate: new Date(event.startDate).toLocaleDateString(
                            i18n.language === 'ar' ? 'ar-EG' : 'he-IL'
                        ),
                        endDate: new Date(event.endDate).toLocaleDateString(
                            i18n.language === 'ar' ? 'ar-EG' : 'he-IL'
                        ),
                        startTime: new Date(event.startDate).toLocaleTimeString([], {
                            hour: '2-digit', minute: '2-digit'
                        }),
                        endTime: new Date(event.endDate).toLocaleTimeString([], {
                            hour: '2-digit', minute: '2-digit'
                        })
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

    /* ---------- Modal helpers ---------- */
    const openModal = (event) => {
        lastFocusedElement.current = document.activeElement;
        setSelectedEvent(event);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        lastFocusedElement.current?.focus();
    };

    /* Close modal on ESC */
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape' && isModalOpen) closeModal();
        };
        document.addEventListener('keydown', handleEsc);
        return () => document.removeEventListener('keydown', handleEsc);
    }, [isModalOpen]);

    /* Focus-trap inside modal */
    useEffect(() => {
        if (!isModalOpen) return;
        closeBtnRef.current?.focus();
    }, [isModalOpen]);

    /* ---------- Accessibility (Negishut) ---------- */
    const [highContrast, setHighContrast] = useState(false);
    const [largeFont, setLargeFont] = useState(false);

    const toggleContrast = () => setHighContrast(!highContrast);
    const toggleFont = () => setLargeFont(!largeFont);

    /* ---------- Content ---------- */
    const services = [
        { name: t('services.water'), icon: '💧', path: '' },
        { name: t('services.arnona'), icon: '🏠', path: '/arnona' },
        { name: t('services.waste'), icon: '🗑️', path: '/waste' },
        { name: t('services.kindergarten'), icon: '🧒', path: '/kindergarten' },
        { name: t('services.transactions'), icon: '📝', path: '/transactions' },
        { name: t('services.emergency'), icon: '🚨', path: '/emergency' },
        { name: t('services.payments'), icon: '💳', path: '/payments' },
        { name: t('services.requests'), icon: '📬', path: '/requests' },
        { name: t('services.news'), icon: '📰', path: '/news' }
    ];

    return (
        <div
            className={`${styles.container} 
                ${highContrast ? styles.highContrast : ''} 
                ${largeFont ? styles.largeFont : ''}`}
            dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}
            role="main"
            aria-label={t('homePage.title')}
        >
            {/* زر الإتاحة */}
            <div className={styles.accessibilityMenu}>
                <button onClick={toggleContrast}>♿ {t('accessibility.contrast') || "تباين عالي"}</button>
                <button onClick={toggleFont}>{t('accessibility.font') || "تكبير الخط"}</button>
            </div>

            <div className={styles.mainCard}>
                <img
                    src={bkg}
                    alt={t('homePage.bannerAlt')}
                    className={styles.bannerImage}
                />

                <h1 className={styles.title}>{t('homePage.title')}</h1>
                <p className={styles.description}>{t('homePage.description')}</p>

                {/* ===== Services ===== */}
                <section className={styles.section} aria-labelledby="services-heading">
                    <h2 id="services-heading" className={styles.sectionTitle}>
                        {t('homePage.servicesTitle')}
                    </h2>
                    <div
                        className={styles.servicesGrid}
                        role="list"
                    >
                        {services.map((service, index) => (
                            <div
                                key={index}
                                className={styles.serviceItem}
                                role="listitem"
                                tabIndex={0}
                                aria-label={service.name}
                                onClick={() => service.path && navigate(service.path)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        service.path && navigate(service.path);
                                    }
                                }}
                            >
                                <span className={styles.serviceIcon} aria-hidden="true">
                                    {service.icon}
                                </span>
                                <span className={styles.serviceName}>{service.name}</span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ===== Events ===== */}
                <section className={styles.section} aria-labelledby="events-heading">
                    <h2 id="events-heading" className={styles.sectionTitle}>
                        {t('homePage.eventsTitle')}
                    </h2>

                    {loading ? (
                        <p className={styles.loading} aria-live="polite">
                            {t('common.loading')}
                        </p>
                    ) : events.length > 0 ? (
                        <div className={styles.eventsGrid} role="list">
                            {events.map((event, idx) => (
                                <article
                                    key={idx}
                                    className={styles.eventCard}
                                    role="button"
                                    tabIndex={0}
                                    aria-label={`${event.title} ${event.startDate}`}
                                    onClick={() => openModal(event)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault();
                                            openModal(event);
                                        }
                                    }}
                                >
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
                                        <p className={styles.eventDate}>
                                            {event.startDate}
                                            {event.startTime !== '00:00' && ` - ${event.startTime}`}
                                        </p>
                                    </div>
                                </article>
                            ))}
                        </div>
                    ) : (
                        <p className={styles.noEvents}>{t('homePage.noEvents')}</p>
                    )}
                </section>

                {/* ===== Modal ===== */}
                {isModalOpen && selectedEvent && (
                    <div
                        className={styles.modalOverlay}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="modalTitle"
                        onClick={(e) => e.target === e.currentTarget && closeModal()}
                    >
                        <div className={styles.modal}>
                            <button
                                ref={closeBtnRef}
                                className={styles.closeButton}
                                onClick={closeModal}
                                aria-label={t('eventDetails.close')}
                            >
                                {t('eventDetails.close')}
                            </button>

                            <h2 id="modalTitle" className={styles.modalTitle}>
                                {selectedEvent.title}
                            </h2>

                            <div className={styles.modalContent}>
                                {selectedEvent.imageUrl && (
                                    <img
                                        src={selectedEvent.imageUrl}
                                        alt={selectedEvent.title}
                                        className={styles.modalImage}
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = bkg;
                                        }}
                                    />
                                )}

                                <div className={styles.modalDetails}>
                                    <p>
                                        <strong>{t('eventDetails.date')}:</strong>{' '}
                                        {selectedEvent.startDate}
                                        {selectedEvent.startTime !== '00:00' && ` - ${selectedEvent.startTime}`}
                                        {selectedEvent.endDate !== selectedEvent.startDate &&
                                            ` ${t('event.to')} ${selectedEvent.endDate}`}
                                    </p>

                                    <p>
                                        <strong>{t('eventDetails.location')}:</strong>{' '}
                                        {selectedEvent.location}
                                    </p>

                                    <p>
                                        <strong>{t('eventDetails.description')}:</strong>{' '}
                                        {selectedEvent.description}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Home;
