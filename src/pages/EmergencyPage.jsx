import React from 'react';
import { FaAmbulance, FaFireExtinguisher, FaShieldAlt, FaPhoneAlt, FaEnvelope } from 'react-icons/fa';
import { MdLocalPolice } from 'react-icons/md';
import { useTranslation } from 'react-i18next'; // Add this import
import './EmergencyPage.css';

export default function EmergencyPage() {
    const { t } = useTranslation(); // Add this line

    const emergencyLinks = [
        {
            label: t('emergency.services.police.label'),
            phone: t('emergency.services.police.phone'),
            email: t('emergency.services.police.email'),
            url: t('emergency.services.police.url'),
            icon: <MdLocalPolice />
        },
        {
            label: t('emergency.services.fire.label'),
            phone: t('emergency.services.fire.phone'),
            url: t('emergency.services.fire.url'),
            icon: <FaFireExtinguisher />
        },
        {
            label: t('emergency.services.medic.label'),
            phone: t('emergency.services.medic.phone'),
            url: t('emergency.services.medic.url'),
            icon: <FaAmbulance />
        },
        {
            label: t('emergency.services.homefront.label'),
            phone: t('emergency.services.homefront.phone'),
            url: t('emergency.services.homefront.url'),
            icon: <FaShieldAlt />
        }
    ];

    return (
        <div className="page-wrapper">
            {/* Top horizontal emergency links */}
            <nav className="emergency-bar">
                {emergencyLinks.map((link, idx) => (
                    <a
                        key={idx}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="emergency-link"
                    >
                        <span className="icon">{link.icon}</span>
                        <span className="label">{link.label}</span>
                        <span className="phone">
                            <FaPhoneAlt className="phone-icon" /> {link.phone}
                        </span>
                        {link.email && (
                            <span className="email">
                                <FaEnvelope className="email-icon" /> {link.email}
                            </span>
                        )}
                    </a>
                ))}
            </nav>

            {/* Main content */}
            <main className="main-content">
                <h1>🏠 {t('emergency.title')}</h1>
                <p className="description">
                    {t('emergency.description')}
                </p>
                <table className="shelter-table">
                    <thead>
                    <tr>
                        <th>{t('emergency.tableHeaders.number')}</th>
                        <th>{t('emergency.tableHeaders.location')}</th>
                        <th>{t('emergency.tableHeaders.description')}</th>
                    </tr>
                    </thead>
                    <tbody>
                    {t('emergency.shelters', { returnObjects: true }).map((shelter, index) => (
                        <tr key={index}>
                            <td>{shelter.number}</td>
                            <td>{shelter.location}</td>
                            <td>{shelter.description}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </main>
        </div>
    );
}