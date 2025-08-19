import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { axiosInstance } from '../api';
import './NewsTicker.css';

const NewsTicker = () => {
    const { t } = useTranslation();
    const [announcements, setAnnouncements] = React.useState([]);
    const tickerRef = useRef(null);

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await axiosInstance.get('/api/announcements');
                setAnnouncements(res.data);
            } catch (e) {
                console.error(e);
            }
        };
        fetch();
        const iv = setInterval(fetch, 60000);
        return () => clearInterval(iv);
    }, []);

    // تكرار الرسائل لتكوين شريط طويل
    const repeated = [...announcements, ...announcements, ...announcements];

    if (!announcements.length) return null;

    return (
        <div className="news-ticker">
            <div className="news-ticker-track" ref={tickerRef}>
                {repeated.map((a, i) => (
                    <span key={i} className="news-ticker-item">
                        {t('announcements.title')}: {a.content}
                    </span>
                ))}
            </div>
        </div>
    );
};

export default NewsTicker;