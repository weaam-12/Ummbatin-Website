import React, { useState } from "react";
import axios from "axios";
import "./Payment.css";

const Payments = () => {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [paymentType, setPaymentType] = useState("receipt");
    const [formData, setFormData] = useState({
        amount: "",
        cardNumber: "",
        expiryDate: "",
        cvv: "",
        fullName: "",
        idNumber: "",
        serviceType: "water",
        serviceDetails: "",
        email: ""
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");
        setError("");

        try {
            let response;
            const endpoint = paymentType === "receipt"
                ? "http://localhost:8080/api/receipt"
                : "http://localhost:8080/api/payments";

            response = await axios.post(endpoint, formData);

            setMessage(response.data.status === "success"
                ? (paymentType === "receipt" ? "קבלה נוצרה בהצלחה!" : "התשלום בוצע בהצלחה!")
                : "התשלום נכשל");

            if (response.data.status === "success") {
                setFormData({
                    amount: "",
                    cardNumber: "",
                    expiryDate: "",
                    cvv: "",
                    fullName: "",
                    idNumber: "",
                    serviceType: "water",
                    serviceDetails: "",
                    email: ""
                });
            }
        } catch (error) {
            setError("אירעה שגיאה. נסה שוב מאוחר יותר");
            console.error("Payment error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handlePaymentTypeChange = (e) => {
        setPaymentType(e.target.value);
    };

    return (
        <div className="payment-container" dir="rtl">
            <div className="payment-card">
                <div className="payment-header">
                    <h2>תשלומים</h2>
                    <p>אנא הזן את פרטי התשלום</p>
                </div>

                {message && (
                    <div className={`payment-message ${message.includes("הצלחה") ? "success" : "error"}`}>
                        {message}
                    </div>
                )}
                {error && <div className="payment-error">{error}</div>}

                <div className="payment-type-selector">
                    <label>שיטת תשלום:</label>
                    <div className="radio-group">
                        <label className="radio-option">
                            <input
                                type="radio"
                                name="paymentType"
                                value="receipt"
                                checked={paymentType === "receipt"}
                                onChange={handlePaymentTypeChange}
                            />
                            <span>תשלום בקבלה</span>
                        </label>
                        <label className="radio-option">
                            <input
                                type="radio"
                                name="paymentType"
                                value="card"
                                checked={paymentType === "card"}
                                onChange={handlePaymentTypeChange}
                            />
                            <span>כרטיס אשראי</span>
                        </label>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="payment-form">
                    {paymentType === "receipt" ? (
                        <>
                            <div className="form-group">
                                <label>שם מלא</label>
                                <input
                                    type="text"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="הזן שם מלא"
                                />
                            </div>
                            <div className="form-group">
                                <label>תעודת זהות</label>
                                <input
                                    type="text"
                                    name="idNumber"
                                    value={formData.idNumber}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="הזן מספר תעודת זהות"
                                />
                            </div>
                            <div className="form-group">
                                <label>סוג שירות</label>
                                <select
                                    name="serviceType"
                                    value={formData.serviceType}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="water">מים</option>
                                    <option value="kindergarten">גן ילדים</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>פרטי השירות</label>
                                <input
                                    type="text"
                                    name="serviceDetails"
                                    value={formData.serviceDetails}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="הזן פרטי שירות"
                                />
                            </div>
                            <div className="form-group">
                                <label>אימייל</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="הזן כתובת אימייל"
                                />
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="form-group">
                                <label>סכום</label>
                                <input
                                    type="number"
                                    name="amount"
                                    value={formData.amount}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="הזן סכום"
                                />
                            </div>
                            <div className="form-group">
                                <label>מספר כרטיס</label>
                                <input
                                    type="text"
                                    name="cardNumber"
                                    value={formData.cardNumber}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="1234 5678 9012 3456"
                                />
                            </div>
                            <div className="form-row">
                                <div className="form-group half-width">
                                    <label>תאריך תפוגה</label>
                                    <input
                                        type="text"
                                        name="expiryDate"
                                        value={formData.expiryDate}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="MM/YY"
                                    />
                                </div>
                                <div className="form-group half-width">
                                    <label>קוד אבטחה</label>
                                    <input
                                        type="password"
                                        name="cvv"
                                        value={formData.cvv}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="•••"
                                    />
                                </div>
                            </div>
                        </>
                    )}

                    <button
                        type="submit"
                        className="submit-btn"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <span className="spinner"></span>
                                "מעבד..."
                            </>
                        ) : paymentType === "receipt" ? (
                            "שלח בקשה"
                        ) : (
                            "ביצוע תשלום"
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Payments;