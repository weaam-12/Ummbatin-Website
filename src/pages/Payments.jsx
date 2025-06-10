import React, { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import axios from "axios";
import '../components/styles/Payment.css'; // Adjust path as needed

const stripePromise = loadStripe("pk_test_51R1OZgLRTUhs7L3YQf5hipWLLfM040gykDmcOpBp1cUG92qv5B0SmhKKgrT0UmLKMGtnm0ICgy1MAyiyxdRo6aXr008vtNe4C9");

function CheckoutForm({ formData, setFormData, onPaymentSuccess }) {
    const stripe = useStripe();
    const elements = useElements();

    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState("");

    // Handle CardElement input changes for error display
    const handleCardChange = (event) => {
        if (event.error) {
            setError(event.error.message);
        } else {
            setError("");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!stripe || !elements) return;

        setProcessing(true);
        setError("");

        try {
            // 1. Create PaymentIntent on backend with amount (converted to cents)
            const amountCents = Math.round(parseFloat(formData.amount) * 100);
            const { data: paymentIntent } = await axios.post("/api/payments/", {
                amount: amountCents,
            });

            // 2. Confirm Card Payment
            const cardElement = elements.getElement(CardElement);
            const result = await stripe.confirmCardPayment(paymentIntent.client_secret, {
                payment_method: {
                    card: cardElement,
                    billing_details: {
                        name: formData.fullName,
                        email: formData.email,

                    },
                },
            });

            if (result.error) {
                setError(result.error.message);
                setProcessing(false);
            } else if (result.paymentIntent && result.paymentIntent.status === "succeeded") {
                setProcessing(false);
                onPaymentSuccess();
            }
        } catch (err) {
            setError("אירעה שגיאה בתשלום. אנא נסה שוב.");
            setProcessing(false);
            console.error(err);
        }
    };

    return (
        <>
            <div className="form-group">
                <label>סכום (ש"ח)</label>
                <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    required
                    placeholder="הזן סכום"
                />
            </div>

            <div className="form-group">
                <label>שם מלא</label>
                <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    required
                    placeholder="הזן שם מלא"
                />
            </div>

            <div className="form-group">
                <label>אימייל</label>
                <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    placeholder="הזן כתובת אימייל"
                />
            </div>

            <div className="form-group">
                <label>פרטי כרטיס אשראי</label>
                <div className="card-element-wrapper">
                    <CardElement options={{ hidePostalCode: true }} onChange={handleCardChange} />
                </div>
            </div>

            {error && <div className="payment-error">{error}</div>}

            <button type="submit" disabled={!stripe || processing} className="submit-btn">
                {processing ? "מעבד..." : `ביצוע תשלום`}
            </button>
        </>
    );
}

const Payments = () => {
    const [paymentType, setPaymentType] = useState("receipt");
    const [formData, setFormData] = useState({
        amount: "",
        fullName: "",
        idNumber: "",
        serviceType: "water",
        serviceDetails: "",
        email: "",
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const resetForm = () => {
        setFormData({
            amount: "",
            fullName: "",
            idNumber: "",
            serviceType: "water",
            serviceDetails: "",
            email: "",
        });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handlePaymentTypeChange = (e) => {
        setPaymentType(e.target.value);
        setMessage("");
        setError("");
        resetForm();
    };

    // For receipt payment submission
    const handleReceiptSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");
        setError("");

        try {
            const response = await axios.post("http://localhost:8080/api/receipt", formData);
            if (response.data.status === "success") {
                setMessage("קבלה נוצרה בהצלחה!");
                resetForm();
            } else {
                setError("הבקשה נכשלה");
            }
        } catch (err) {
            setError("אירעה שגיאה. נסה שוב מאוחר יותר");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const onCardPaymentSuccess = () => {
        setMessage("התשלום בוצע בהצלחה!");
        resetForm();
    };

    return (
        <div className="payment-container" dir="rtl">
            <div className="payment-card">
                <div className="payment-header">
                    <h2>תשלומים</h2>
                    <p>אנא הזן את פרטי התשלום</p>
                </div>

                {message && <div className="payment-message success">{message}</div>}
                {error && <div className="payment-message error">{error}</div>}

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

                {paymentType === "receipt" ? (
                    <form onSubmit={handleReceiptSubmit} className="payment-form">
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
                        <button type="submit" disabled={loading} className="submit-btn">
                            {loading ? "מעבד..." : "שלח בקשה"}
                        </button>
                    </form>
                ) : (
                    <Elements stripe={stripePromise}>
                        <form onSubmit={(e) => e.preventDefault()} className="payment-form">
                            <CheckoutForm
                                formData={formData}
                                setFormData={setFormData}
                                onPaymentSuccess={onCardPaymentSuccess}
                            />
                        </form>
                    </Elements>
                )}
            </div>
        </div>
    );
};

export default Payments;
