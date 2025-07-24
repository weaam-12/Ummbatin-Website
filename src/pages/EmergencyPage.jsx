import React from 'react';
import { FaAmbulance, FaFireExtinguisher, FaShieldAlt, FaPhoneAlt, FaEnvelope } from 'react-icons/fa';
import { MdLocalPolice } from 'react-icons/md';
import './EmergencyPage.css';

const emergencyLinks = [
    {
        label: 'משטרה',
        phone: '100',
        email: 'contact@police.gov.il',
        url: 'https://www.police.gov.il',
        icon: <MdLocalPolice />
    },
    {
        label: 'כבאות והצלה',
        phone: '102',
        url: 'https://www.gov.il/he/departments/firefighting_and_rescue_israel/govil-landing-page',
        icon: <FaFireExtinguisher />
    },
    {
        label: 'מד"א',
        phone: '101',
        url: 'https://www.mdais.org',
        icon: <FaAmbulance />
    },
    {
        label: 'פיקוד העורף',
        phone: '104',
        url: 'https://www.oref.org.il',
        icon: <FaShieldAlt />
    }
];

export default function EmergencyPage() {
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
                <h1>🏠 רשימת מקלטים בכפר אום בטין</h1>
                <p className="description">
                    ניתן לעיין ברשימת המיקומים של המקלטים הציבוריים ולוודא שאתם יודעים היכן הקרוב אליכם.
                </p>
                <table className="shelter-table">
                    <thead>
                    <tr>
                        <th>#</th>
                        <th>מיקום</th>
                        <th>תיאור</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr>
                        <td>1</td><td>רחוב הראשי 1</td><td>מקלט ציבורי ראשי</td>
                    </tr>
                    <tr>
                        <td>2</td><td>רחוב השלום 5</td><td>מקלט שכונתי</td>
                    </tr>
                    <tr>
                        <td>3</td><td>שכונת אלחאדר 8</td><td>מקלט בית ספר</td>
                    </tr>
                    <tr>
                        <td>4</td><td>רחוב אלנור 3</td><td>מקלט משותף</td>
                    </tr>
                    </tbody>
                </table>
            </main>
        </div>
    );
}
