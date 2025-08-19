import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { axiosInstance } from '../api';
import './NewsTicker.css';

const NewsTicker = () => {
    const { t } = useTranslation();
    const [announcements, setAnnouncements] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnnouncements();
        const interval = setInterval(fetchAnnouncements, 60000); // Refresh every minute
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (announcements.length > 0) {
            const tickerInterval = setInterval(() => {
                setCurrentIndex((prev) => (prev + 1) % announcements.length);
            }, 5000); // Change message every 5 seconds
            return () => clearInterval(tickerInterval);
        }
    }, [announcements]);

    const fetchAnnouncements = async () => {
        try {
            const response = await axiosInstance.get('/api/announcements');
            setAnnouncements(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch announcements:', error);
            setLoading(false);
        }
    };

    if (loading) return <div className="news-ticker-loading">{t('common.loading')}...</div>;
    if (announcements.length === 0) return null;

    return (
        <div className="news-ticker">
            <div className="news-ticker-content">
                <span className="news-ticker-label">{t('announcements.title')}:</span>
                <span className="news-ticker-message">
                    {announcements[currentIndex]?.content}
                </span>
            </div>
        </div>
    );
};

export default NewsTicker;