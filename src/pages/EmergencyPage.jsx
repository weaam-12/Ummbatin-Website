import React from 'react';
import { FaAmbulance, FaFireExtinguisher, FaShieldAlt } from 'react-icons/fa';
import { MdLocalPolice } from 'react-icons/md';

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
        <div className="min-h-screen bg-white text-blue-900 grid grid-cols-1 md:grid-cols-4">
            {/* Sidebar */}
            <aside className="bg-blue-100 p-4 md:col-span-1 shadow-lg">
                <h2 className="text-xl font-bold mb-4">🚨 קישורים חשובים</h2>
                <div className="space-y-3">
                    {emergencyLinks.map((link, idx) => (
                        <a
                            key={idx}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center space-x-2 bg-white p-2 rounded-lg hover:bg-blue-200 transition"
                        >
                            <span className="text-2xl">{link.icon}</span>
                            <span>{link.label}</span>
                        </a>
                    ))}
                </div>
            </aside>

            {/* Main Content */}
            <main className="p-6 md:col-span-3">
                <h1 className="text-2xl font-bold mb-6">🏠 רשימת מקלטים בכפר אום בטין</h1>

                <p className="mb-4 text-blue-800 bg-blue-50 p-3 rounded">
                    ניתן לעיין ברשימת המיקומים של המיקלטים הציבוריים ולוודא שאתם יודעים היכן הקרוב אליכם. בטחון האזרחים בראש סדר העדיפויות שלנו.
                </p>

                <table className="w-full border border-blue-300 shadow-md">
                    <thead className="bg-blue-200 text-blue-900">
                    <tr>
                        <th className="p-2 border">#</th>
                        <th className="p-2 border">מיקום</th>
                        <th className="p-2 border">תיאור</th>
                    </tr>
                    </thead>
                    <tbody>
                    {shelters.map((shelter) => (
                        <tr key={shelter.id} className="even:bg-blue-50">
                            <td className="p-2 border text-center">{shelter.id}</td>
                            <td className="p-2 border">{shelter.location}</td>
                            <td className="p-2 border">{shelter.description}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </main>
        </div>
    );
}
