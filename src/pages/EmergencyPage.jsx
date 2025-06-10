import React from 'react';
import { FaAmbulance, FaFireExtinguisher, FaShieldAlt, FaPhoneAlt, FaMapMarkedAlt } from 'react-icons/fa';
import { MdLocalPolice } from 'react-icons/md';
import '../components/styles/EmergencyPage.css';

const shelters = [
    { id: 1, location: 'רחוב הראשי 1', description: 'מקלט ציבורי ראשי' },
    { id: 2, location: 'רחוב השלום 5', description: 'מקלט שכונתי' },
    { id: 3, location: 'שכונת אלחאדר 8', description: 'מקלט בית ספר' },
    { id: 4, location: 'רחוב אלנור 3', description: 'מקלט משותף' },
];

const emergencyLinks = [
    {
        icon: <MdLocalPolice size={24} />, label: 'משטרה', url: 'https://www.police.gov.il'
    },
    {
        icon: <FaFireExtinguisher size={24} />, label: 'כבאות והצלה', url: 'https://www.gov.il/he/departments/firefighting_and_rescue_israel/govil-landing-page'
    },
    {
        icon: <FaAmbulance size={24} />, label: 'מד"א', url: 'https://www.mdais.org'
    },
    {
        icon: <FaShieldAlt size={24} />, label: 'פיקוד העורף', url: 'https://www.oref.org.il'
    },
];

export default function EmergencyPage() {
    return (
        <div className="flex flex-col md:flex-row gap-6 p-6 bg-gray-50 min-h-screen">
            {/* Side Menu */}
            <aside className="md:w-1/4 space-y-6 bg-white p-6 rounded-xl shadow-lg">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">קישורים חשובים</h2>
                {emergencyLinks.map((link, idx) => (
                    <a
                        key={idx}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 text-blue-600 hover:text-blue-800 transition duration-300 transform hover:scale-105"
                    >
                        {link.icon}
                        <span className="font-medium">{link.label}</span>
                    </a>
                ))}
            </aside>

            {/* Main Table */}
            <section className="md:w-3/4 bg-white p-6 rounded-xl shadow-lg">
                <h1 className="text-3xl font-semibold text-gray-800 mb-6">ריכוז מקלטים בכפר אום בטין</h1>
                <table className="w-full table-auto border-collapse rounded-lg shadow-md">
                    <thead className="bg-blue-100 text-right">
                    <tr>
                        <th className="p-4 text-gray-700">#</th>
                        <th className="p-4 text-gray-700">מיקום</th>
                        <th className="p-4 text-gray-700">תיאור</th>
                    </tr>
                    </thead>
                    <tbody>
                    {shelters.map((shelter) => (
                        <tr
                            key={shelter.id}
                            className="border-b hover:bg-gray-50 transition duration-200"
                        >
                            <td className="p-4 text-center">{shelter.id}</td>
                            <td className="p-4">{shelter.location}</td>
                            <td className="p-4">{shelter.description}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </section>
        </div>
    );
}
