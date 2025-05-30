import React from 'react';
import { useTranslation } from 'react-i18next';
import { FaBullhorn, FaExclamationTriangle } from 'react-icons/fa';
import PropTypes from 'prop-types';

const NewsCard = ({ title, date, content, isUrgent, onClick }) => {
    const { t, i18n } = useTranslation();

    const formattedDate = date.toLocaleDateString(i18n.language, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });

    return (
        <div
            className={`news-card bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transition-all hover:shadow-lg ${isUrgent ? 'border-l-4 border-red-500' : ''}`}
            onClick={onClick}
        >
            <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-800 line-clamp-2">
                        {title}
                    </h3>
                    {isUrgent && (
                        <FaExclamationTriangle className="text-red-500 flex-shrink-0 mt-1" />
                    )}
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {content}
                </p>

                <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">
                        {formattedDate}
                    </span>
                    <div className="flex items-center text-blue-600 hover:text-blue-800">
                        <span>{t('readMore')}</span>
                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </div>
                </div>
            </div>
        </div>
    );
};

NewsCard.propTypes = {
    title: PropTypes.string.isRequired,
    date: PropTypes.instanceOf(Date).isRequired,
    content: PropTypes.string.isRequired,
    isUrgent: PropTypes.bool,
    onClick: PropTypes.func
};

NewsCard.defaultProps = {
    isUrgent: false,
    onClick: () => {}
};

export default NewsCard;