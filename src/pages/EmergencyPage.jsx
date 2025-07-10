import React from 'react';
import { FaAmbulance, FaFireExtinguisher, FaShieldAlt } from 'react-icons/fa';
import { MdLocalPolice } from 'react-icons/md';
import './EmergencyPage.css'; // ربط ملف CSS

const shelters = [
    { id: 1, location: 'רחוב הראשי 1', description: 'מקלט ציבורי ראשי' },
    { id: 2, location: 'רחוב השלום 5', description: 'מקלט שכונתי' },
    { id: 3, location: 'שכונת אלחאדר 8', description: 'מקלט בית ספר' },
    { id: 4, location: 'רחוב אלנור 3', description: 'מקלט משותף' },
];

const emergencyLinks = [
    { icon: <MdLocalPolice />, label: 'משטרה', url: 'https://www.police.gov.il' },
    { icon: <FaFireExtinguisher />, label: 'כבאות והצלה', url: 'https://www.gov.il/he/departments/firefighting_and_rescue_israel/govil-landing-page' },
    { icon: <FaAmbulance />, label: 'מד"א', url: 'https://www.mdais.org' },
    { icon: <FaShieldAlt />, label: 'פיקוד העורף', url: 'https://www.oref.org.il' },
];

export default function EmergencyPage() {
    return (
        <div className="page-container">
            {/* Sidebar */}
            <aside className="sidebar">
                <h2>🚨 קישורים חשובים</h2>
                <div className="links-list">
                    {emergencyLinks.map((link, idx) => (
                        <a
                            key={idx}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="link-item"
                        >
                            <span className="icon">{link.icon}</span>
                            <span className="label">{link.label}</span>
                        </a>
                    ))}
                </div>
            </aside>

            {/* Main Content */}
            <main className="main-content">
                <h1>🏠 רשימת מקלטים בכפר אום בטין</h1>
                <table className="shelter-table">
                    <thead>
                    <tr>
                        <th>#</th>
                        <th>מיקום</th>
                        <th>תיאור</th>
                    </tr>
                    </thead>
                    <tbody>
                    {shelters.map((shelter) => (
                        <tr key={shelter.id}>
                            <td>{shelter.id}</td>
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
