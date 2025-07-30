import React from "react";
import "./NewsTicker.css";

const NewsTicker = () => {
    const messages = [
        "📢 تم إطلاق خدمة دفع المياه والأرنونا عبر الإنترنت.",
        "🎉 فعاليات للأطفال هذا الأسبوع في المركز الجماهيري.",
        "🧾 يمكنكم الآن التسجيل للحضانات من خلال الموقع.",
        "📌 تابعوا آخر التحديثات من بلدية أم بطين.",
    ];

    return (
        <div className="ticker-wrapper">
            <div className="ticker-content">
                {messages.map((msg, index) => (
                    <span key={index}>{msg}</span>
                ))}
            </div>
        </div>
    );
};

export default NewsTicker;
