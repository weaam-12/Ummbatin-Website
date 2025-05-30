import React from "react";

const HeroSection = () => {
    return (
        <section className="hero-banner">
            <div className="hero-content">
                <h1>ברוכים הבאים לישוב שלנו</h1>
                <p>גלו את הפעילויות והשירותים הקהילתיים שלנו</p>
                <button className="cta-button">לכל השירותים</button>
            </div>
            <div className="hero-image">
                <img src="/מרכז-הישוב.jpg" alt="פעילויות במרכז הישוב"/>
            </div>
        </section>
    );
};

export default HeroSection;
