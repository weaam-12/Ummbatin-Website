import React, { useState } from "react";
import "../components/styles/PaymentForm.css";

const PaymentForm = () => {
    const [formData, setFormData] = useState({
        fullName: "",
        idNumber: "",
        serviceType: "water", // Default service: water
        serviceDetails: "", // Will change based on the selected service
        email: "",
    });

    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    // Handle form field changes
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMessage("");

        try {
            const response = await fetch("http://localhost:8080/api/receipt", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                // Get the response as a Blob (binary data)
                const blob = await response.blob();
                // Create a temporary URL for the Blob
                const url = window.URL.createObjectURL(blob);
                // Create a download link
                const link = document.createElement("a");
                // Set the download attribute with a file name
                link.href = url;
                link.download = "receipt.pdf";  // File name for the downloaded file
                // Trigger the download by simulating a click
                link.click();
                setSubmitted(true);  // Mark form as submitted successfully
            } else {
                setErrorMessage("שגיאה בשליחת הבקשה. אנא נסה שוב.");
            }
        } catch (error) {
            setErrorMessage("שגיאה בחיבור לשרת. אנא נסה שוב מאוחר יותר.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="payment-form-container">
            {submitted ? (
                <div className="success-message">
                    <h2>✅ הבקשה נשלחה בהצלחה!</h2>
                    <p>הקבלה תורד באופן אוטומטי.</p>
                </div>
            ) : (
                <>
                    <h1>טופס תשלום</h1>
                    <p>אנא מלא את הפרטים כדי לקבל קבלה על התשלום.</p>

                    {errorMessage && <p className="error-message">{errorMessage}</p>}

                    <form onSubmit={handleSubmit}>
                        <label>שם מלא:</label>
                        <input
                            type="text"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleChange}
                            required
                        />

                        <label>מספר תעודת זהות:</label>
                        <input
                            type="text"
                            name="idNumber"
                            value={formData.idNumber}
                            onChange={handleChange}
                            required
                        />

                        {/* Select service type */}
                        <label>בחר שירות:</label>
                        <select
                            name="serviceType"
                            value={formData.serviceType}
                            onChange={handleChange}
                        >
                            <option value="water">תשלום מים</option>
                            <option value="kindergarten">רישום לגן ילדים</option>
                        </select>

                        {/* Dynamic fields based on the selected service */}
                        {formData.serviceType === "water" && (
                            <div>
                                <label>מספר מונה מים:</label>
                                <input
                                    type="text"
                                    name="serviceDetails"
                                    value={formData.serviceDetails}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        )}

                        {formData.serviceType === "kindergarten" && (
                            <div>
                                <label>שם הילד:</label>
                                <input
                                    type="text"
                                    name="serviceDetails"
                                    value={formData.serviceDetails}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        )}

                        <label>אימייל:</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />

                        <button type="submit" disabled={loading}>
                            {loading ? "מעבד את הבקשה..." : "שלח תשלום"}
                        </button>
                    </form>
                </>
            )}
        </div>
    );
};

export default PaymentForm;
