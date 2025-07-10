import React from "react";
import "./LoadingSpinner.css";

const LoadingSpinner = ({ size = "medium", color = "primary" }) => {
    // تحديد حجم السبينر حسب الخاصية
    const sizeClasses = {
        small: "w-8 h-8 border-3",
        medium: "w-12 h-12 border-4",
        large: "w-16 h-16 border-6"
    };

    // تحديد لون السبينر حسب الخاصية
    const colorClasses = {
        primary: "border-t-blue-500",
        secondary: "border-t-gray-500",
        danger: "border-t-red-500",
        success: "border-t-green-500"
    };

    return (
        <div className="flex flex-col items-center justify-center">
            <div
                className={`rounded-full border-solid border-transparent animate-spin ${
                    sizeClasses[size] || sizeClasses.medium
                } ${
                    colorClasses[color] || colorClasses.primary
                }`}
            ></div>
            <p className="mt-2 text-gray-600">جاري التحميل...</p>
        </div>
    );
};

export default LoadingSpinner;