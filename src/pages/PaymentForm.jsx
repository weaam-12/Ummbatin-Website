import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { enrollChild } from '../api';
import { useAuth } from '../AuthContext';
import './Children.css';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

const PaymentForm = ({ child, kindergarten, onSuccess, onClose }) => {
    const stripe = useStripe();
    const elements = useElements();
    const { t } = useTranslation();
    const [error, setError] = useState(null);
    const [processing, setProcessing] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setProcessing(true);

        try {
            const cardElement = elements.getElement(CardElement);
            const { error, paymentMethod } = await stripe.createPaymentMethod({
                type: 'card',
                card: cardElement,
            });

            if (error) {
                setError(error.message);
                setProcessing(false);
                return;
            }

            console.log("Payment method created:", paymentMethod);

            const paymentResult = await enrollChild({
                childId: child.id,
                kindergartenId: kindergarten.id,
                paymentMethodId: paymentMethod.id,
                amount: 500
            });

            if (paymentResult.success) {
                onSuccess();
            } else {
                setError(paymentResult.message || t('children.payment.error'));
            }
        } catch (er) {
            setError(t('children.payment.error'));
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="payment-modal">
            <div className="payment-content">
                <h3>{t('children.enrollment.title')}</h3>
                <div className="payment-details">
                    <p><strong>{t('children.enrollment.child')}:</strong> {child.name}</p>
                    <p><strong>{t('children.enrollment.kindergarten')}:</strong> {kindergarten.name}</p>
                    <p><strong>{t('children.enrollment.fee')}:</strong> 500 {t('children.currency')}</p>
                </div>

                <form onSubmit={handleSubmit} className="payment-form">
                    <div className="card-element-container">
                        <CardElement options={{
                            style: {
                                base: {
                                    fontSize: '16px',
                                    color: '#424770',
                                    '::placeholder': {
                                        color: '#aab7c4',
                                    },
                                },
                                invalid: {
                                    color: '#9e2146',
                                },
                            },
                        }} />
                    </div>
                    {error && <div className="error-message">{error}</div>}
                    <div className="payment-buttons">
                        <button type="button" onClick={onClose} className="cancel-btn">
                            {t('children.cancel')}
                        </button>
                        <button type="submit" disabled={processing} className="confirm-btn">
                            {processing ? t('children.processing') : t('children.confirmPayment')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PaymentForm;