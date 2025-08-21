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

    /* Refs */
    const closeBtnRef = useRef(null);
    const lastFocusedElement = useRef(null);
    const modalRef = useRef(null);

    /* ---------- Fetch data ---------- */
    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const data = await getAllEvents();
                const formatted = data
                    .filter(e => e.active)
                    .map(e => ({
                        ...e,
                        startDate: new Date(e.startDate).toLocaleDateString(
                            i18n.language === 'ar' ? 'ar-EG' : 'he-IL'
                        ),
                        endDate: new Date(e.endDate).toLocaleDateString(
                            i18n.language === 'ar' ? 'ar-EG' : 'he-IL'
                        ),
                        startTime: new Date(e.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        endTime: new Date(e.endDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    }));
                setEvents(formatted);
            } catch (err) {
                console.error('Error fetching events:', err);
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
        setSelectedEvent(null);
        lastFocusedElement.current?.focus();
    };

    /* Close modal on ESC */
    useEffect(() => {
        const onEsc = (e) => {
            if (e.key === 'Escape' && isModalOpen) closeModal();
        };
        document.addEventListener('keydown', onEsc);
        return () => document.removeEventListener('keydown', onEsc);
    }, [isModalOpen]);

    /* Focus trap inside modal */
    useEffect(() => {
        if (!isModalOpen) return;
        // نقل التركيز لزر الإغلاق
        closeBtnRef.current?.focus();

        const handleTab = (e) => {
            if (!isModalOpen || !modalRef.current) return;
            const focusable = modalRef.current.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            if (!focusable.length) return;
            const first = focusable[0];
            const last = focusable[focusable.length - 1];

            if (e.key === 'Tab') {
                if (e.shiftKey && document.activeElement === first) {
                    e.preventDefault();
                    last.focus();
                } else if (!e.shiftKey && document.activeElement === last) {
                    e.preventDefault();
                    first.focus();
                }
            }
        };

        document.addEventListener('keydown', handleTab);
        return () => document.removeEventListener('keydown', handleTab);
    }, [isModalOpen]);

    /* ---------- Accessibility (Negishut) ---------- */
    const [highContrast, setHighContrast] = useState(false);
    const [largeFont, setLargeFont] = useState(false);

    const toggleContrast = () => {
        const next = !highContrast;
        setHighContrast(next);
        localStorage.setItem('highContrast', String(next));
    };
    const toggleFont = () => {
        const next = !largeFont;
        setLargeFont(next);
        localStorage.setItem('largeFont', String(next));
    };

    useEffect(() => {
        setHighContrast(localStorage.getItem('highContrast') === 'true');
        setLargeFont(localStorage.getItem('largeFont') === 'true');
    }, []);

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
            className={`${styles.container} ${highContrast ? styles.highContrast : ''} ${largeFont ? styles.largeFont : ''}`}
            dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}
        >
            {/* Skip link لتخطي مباشرة للمحتوى الرئيسي */}
            <a href="#mainContent" className={styles.skipLink}>{t('common.skipToContent') || 'تخطي إلى المحتوى'}</a>

            {/* منطقة إعلانات حية للمساعدة الصوتية */}
            <div aria-live="polite" className={styles.srOnly}>
                {isModalOpen ? (t('eventDetails.opened') || 'تم فتح نافذة التفاصيل') : ''}
            </div>

            {/* زر الإتاحة */}
            <div className={styles.accessibilityMenu} role="region" aria-label={t('accessibility') || 'إتاحة'}>
                <button
                    onClick={toggleContrast}
                    aria-pressed={highContrast}
                    aria-label={t('accessibility.contrast') || 'تباين عالي'}
                >
                    ♿ {t('accessibility.contrast') || 'تباين عالي'}
                </button>
                <button
                    onClick={toggleFont}
                    aria-pressed={largeFont}
                    aria-label={t('accessibility.font') || 'تكبير الخط'}
                >
                    {largeFont ? 'A-' : 'A+'} {t('accessibility.font') || 'تكبير الخط'}
                </button>
            </div>

            {/* المحتوى الرئيسي كـ landmark واضح */}
            <main
                id="mainContent"
                role="main"
                aria-label={t('homePage.title')}
                className={styles.mainCard}
            >
                <img
                    src={bkg}
                    alt={t('homePage.bannerAlt') || 'صورة بانر توضيحية'}
                    className={styles.bannerImage}
                />

                <h1 className={styles.title}>{t('homePage.title')}</h1>
                <p className={styles.description}>{t('homePage.description')}</p>

                {/* ===== Services ===== */}
                <section className={styles.section} aria-labelledby="services-heading">
                    <h2 id="services-heading" className={styles.sectionTitle}>
                        {t('homePage.servicesTitle')}
                    </h2>

                    {/* قوائم دلالية */}
                    <ul className={styles.servicesGrid} aria-label={t('homePage.servicesTitle')}>
                        {services.map((service, i) => (
                            <li key={i} className={styles.serviceItem}>
                                <button
                                    type="button"
                                    className={styles.serviceBtn}
                                    onClick={() => service.path && navigate(service.path)}
                                    aria-label={service.name}
                                >
                                    <span className={styles.serviceIcon} aria-hidden="true">{service.icon}</span>
                                    <span className={styles.serviceName}>{service.name}</span>
                                </button>
                            </li>
                        ))}
                    </ul>
                </section>

                {/* ===== Events ===== */}
                <section
                    className={styles.section}
                    aria-labelledby="events-heading"
                    aria-busy={loading ? 'true' : 'false'}
                >
                    <h2 id="events-heading" className={styles.sectionTitle}>
                        {t('homePage.eventsTitle')}
                    </h2>

                    {loading ? (
                        <p className={styles.loading} aria-live="polite">
                            {t('common.loading')}
                        </p>
                    ) : events.length > 0 ? (
                        <ul className={styles.eventsGrid} aria-label={t('homePage.eventsTitle')}>
                            {events.map((event, idx) => (
                                <li key={idx} className={styles.eventItem}>
                                    {/* نجعل العنصر زرًا للوصول بالكيبورد وقارئ الشاشة */}
                                    <button
                                        type="button"
                                        className={styles.eventCard}
                                        onClick={() => openModal(event)}
                                        aria-describedby={`event-meta-${idx}`}
                                        aria-label={`${event.title}، ${event.startDate}${event.startTime !== '00:00' ? `، ${event.startTime}` : ''}`}
                                    >
                                        {event.imageUrl ? (
                                            <img
                                                src={event.imageUrl}
                                                alt={event.title}
                                                className={styles.eventImage}
                                                onError={(e) => { e.currentTarget.src = bkg; }}
                                            />
                                        ) : (
                                            // إن لم توجد صورة، لا نعرض صورة زخرفية
                                            null
                                        )}
                                        <div className={styles.eventContent} id={`event-meta-${idx}`}>
                                            <h3 className={styles.eventTitle}>{event.title}</h3>
                                            <p className={styles.eventDate}>
                                                {event.startDate}
                                                {event.startTime !== '00:00' && ` - ${event.startTime}`}
                                            </p>
                                        </div>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className={styles.noEvents}>{t('homePage.noEvents')}</p>
                    )}
                </section>
            </main>

            {/* ===== Modal ===== */}
            {isModalOpen && selectedEvent && (
                <div
                    className={styles.modalOverlay}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="modalTitle"
                    aria-describedby="modalDescription"
                    onClick={(e) => e.target === e.currentTarget && closeModal()}
                >
                    <div className={styles.modal} ref={modalRef}>
                        <button
                            ref={closeBtnRef}
                            className={styles.closeButton}
                            onClick={closeModal}
                            aria-label={t('eventDetails.close') || 'إغلاق'}
                        >
                            {t('eventDetails.close') || 'إغلاق'}
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
                                    onError={(e) => { e.currentTarget.src = bkg; }}
                                />
                            )}

                            <div className={styles.modalDetails}>
                                <p id="modalDescription">
                                    <strong>{t('eventDetails.date') || 'التاريخ'}:</strong>{' '}
                                    {selectedEvent.startDate}
                                    {selectedEvent.startTime !== '00:00' && ` - ${selectedEvent.startTime}`}
                                    {selectedEvent.endDate !== selectedEvent.startDate &&
                                        ` ${t('event.to') || 'حتى'} ${selectedEvent.endDate}`}
                                </p>

                                <p>
                                    <strong>{t('eventDetails.location') || 'المكان'}:</strong>{' '}
                                    {selectedEvent.location}
                                </p>

                                <p>
                                    <strong>{t('eventDetails.description') || 'الوصف'}:</strong>{' '}
                                    {selectedEvent.description}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Home;
