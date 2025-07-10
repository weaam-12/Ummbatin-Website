import { useNavigate } from "react-router-dom";
import './Home.css';
import bkg from "./bkg.jpg";

const Home = () => {
    const navigate = useNavigate();

    const services = [
        { name: "מים", icon: "💧" },
        { name: "ארנונה", icon: "🏠" },
        { name: "שירות אשפה", icon: "🗑️" },
        { name: "רישום גן", icon: "🧒" },
        { name: "פעולות", icon: "📝" },
        { name: "מוקד חירום", icon: "🚨" },
        { name: "תשלומים מקוונים", icon: "💳" },
        { name: "קביעת תור", icon: "📅" },
        { name: "מצב פניות", icon: "📬" },
        { name: "חדשות ועדכונים", icon: "📰" }
    ];

    const activities = [
        { title: "יום ספורט קהילתי", date: "2025-07-10", duration: 3 },
        { title: "שוק קיץ", date: "2025-07-15", duration: 4 },
        { title: "ערב תרבות", date: "2025-07-20", duration: 2 }
    ];

    return (
        <div className="home-container" dir="rtl">
            <div className="visitor-info-card">
                <img src={bkg} alt="אום בטין" className="city-image"/>

                <h1 className="city-title">ברוכים הבאים לאום בטין</h1>
                <p className="city-description">
                    אום בטין היא יישוב קהילתי מתפתח בנגב, עם שירותים עירוניים מתקדמים, חינוך איכותי, ואירועים תרבותיים לכל המשפחה.
                </p>
            </div>

            {/* الخدمات */}
            <section className="services-section">
                <h2 className="section-title">שירותים לתושבים</h2>
                <div className="services-grid">
                    {services.map((service, index) => (
                        <div key={index} className="service-circle">
                            <div className="service-icon">{service.icon}</div>
                            <div className="service-name">{service.name}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* الفعاليات */}
            <section className="activities-section">
                <h2 className="section-title">הפעילויות הקרובות</h2>
                <div className="activities-list">
                    {activities.map((activity, idx) => (
                        <div key={idx} className="activity-card">
                            <h3>{activity.title}</h3>
                            <p><strong>תאריך:</strong> {activity.date}</p>
                            <p><strong>משך:</strong> {activity.duration} שעות</p>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default Home;
