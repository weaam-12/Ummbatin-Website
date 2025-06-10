import React, { useState } from "react";
import axios from "axios";
import { loadStripe } from "@stripe/stripe-js";
import { useTranslation } from "react-i18next";

const CreditCardPayment = () => {
    const { t } = useTranslation();
    const [form, setForm] = useState({
        cardNumber: "",
        cvv: "",
        expireMonth: "",
        expireYear: "",
        amount: "20.00",//example
        currency: "USD",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handlePayment = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess("");

        // Basic validation
        if (!form.cardNumber || !form.cvv || !form.expireMonth || !form.expireYear) {
            setError(t("fillAllFields"));
            setLoading(false);
            return;
        }

        try {
            const stripe = await loadStripe("YOUR_STRIPE_PUBLIC_KEY");
            const { token } = await stripe.createToken({
                number: form.cardNumber,
                exp_month: form.expireMonth,
                exp_year: form.expireYear,
                cvc: form.cvv,
            });

            const response = await axios.post("/api/payments", {
                token: token.id,
                amount: form.amount,
                currency: form.currency,
            });

            if (response.data.status === "success") {
                setSuccess(t("paymentSuccessful"));
            } else {
                setError(t("paymentFailed"));
            }
        } catch (err) {
            setError(t("paymentError"));
            console.error("Error:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="payment-form-container">
            <h2>{t("creditCardPayment")}</h2>
            <form onSubmit={handlePayment}>
                <input
                    type="text"
                    name="cardNumber"
                    placeholder={t("cardNumber")}
                    value={form.cardNumber}
                    onChange={handleChange}
                    required
                />
                <input
                    type="text"
                    name="cvv"
                    placeholder={t("cvv")}
                    value={form.cvv}
                    onChange={handleChange}
                    required
                />
                <input
                    type="text"
                    name="expireMonth"
                    placeholder={t("expireMonth")}
                    value={form.expireMonth}
                    onChange={handleChange}
                    required
                />
                <input
                    type="text"
                    name="expireYear"
                    placeholder={t("expireYear")}
                    value={form.expireYear}
                    onChange={handleChange}
                    required
                />
                <button type="submit" disabled={loading}>
                    {loading ? t("processing") : t("payNow")}
                </button>
                {error && <p className="error-message">{error}</p>}
                {success && <p className="success-message">{success}</p>}
            </form>
        </div>
    );
};

export default CreditCardPayment;