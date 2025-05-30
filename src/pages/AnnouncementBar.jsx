import React from 'react';
import { useTranslation } from 'react-i18next';
import { FaExclamationCircle, FaTimes } from 'react-icons/fa';

const AnnouncementBar = ({ message, link, linkText, dismissable = true }) => {
    const { t } = useTranslation();
    const [dismissed, setDismissed] = React.useState(false);

    // Don't render if dismissed
    if (dismissed) return null;

    return (
        <div className="announcement-bar bg-yellow-500 text-white px-4 py-2 flex items-center justify-between">
            <div className="flex items-center space-x-2 space-x-reverse">
                <FaExclamationCircle className="flex-shrink-0" />
                <span className="font-medium">{message || t('urgentAnnouncement')}</span>
            </div>

            <div className="flex items-center space-x-4 space-x-reverse">
                {link && (
                    <a
                        href={link}
                        className="underline font-semibold hover:opacity-80 transition-opacity"
                    >
                        {linkText || t('learnMore')}
                    </a>
                )}

                {dismissable && (
                    <button
                        onClick={() => setDismissed(true)}
                        className="hover:opacity-70 transition-opacity"
                        aria-label={t('dismiss')}
                    >
                        <FaTimes />
                    </button>
                )}
            </div>
        </div>
    );
};

export default AnnouncementBar;