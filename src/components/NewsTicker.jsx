import React from "react";
import "./Ticker.css";

const NewsTicker = () => {
    const messages = [
        "📢 تم إطلاق خدمة دفع المياه والأرنونا عبر الإنترنت.",
        "🎉 فعاليات للأطفال هذا الأسبوع في المركز الجماهيري.",
        "🧾 يمكنكم الآن التسجيل للحضانات من خلال الموقع.",
        "📌 تابعوا آخر التحديثات من بلدية أم بطين.",
    ];

    const repeatedMessages = messages.concat(messages).concat(messages); // تكرار الرسائل لملء الشريط باستمرار

    return (
        <div className="ticker-wrapper">
            <div className="ticker-content">
                {repeatedMessages.map((msg, index) => (
                    <span key={index} style={{ margin: "0 2rem" }}>
            {msg}
          </span>
                ))}
            </div>
        </div>
    );
};

export default NewsTicker;
