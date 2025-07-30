import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import axiosInstance from '../api';
import './Children.css';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const PaymentForm = ({ child, kindergarten, onSuccess, onClose }) => {
    const stripe = useStripe();
    const elements = useElements();
    const { t } = useTranslation();
    const [clientSecret, setClientSecret] = useState(null);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        const fetchClientSecret = async () => {
            const response = await axiosInstance.post('/api/stripe/setup-intent');
            setClientSecret(response.data.clientSecret);
        };
        fetchClientSecret();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setProcessing(true);
        setError(null);

        try {
            const result = await stripe.confirmCardSetup(clientSecret, {
                payment_method: {
                    card: elements.getElement(CardElement),
                },
            });

            if (result.error) {
                setError(result.error.message);
            } else {
                setSuccess(true); // تمت المصادقة
            }
        } catch (err) {
            setError(t('children.payment.error'));
        } finally {
            setProcessing(false);
        }
    };

    if (success) {
        return (
            <div className="payment-modal">
                <div className="payment-content">
                    <FaCheckCircle size={48} color="green" />
                    <h3>{t('children.cardValidated')}</h3>
                    <p>{t('children.noCharge')}</p>
                    <button className="confirm-btn" onClick={() => {
                        onSuccess();
                        onClose();
                    }}>
                        {t('children.close')}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="payment-modal">
            <div className="payment-content">
                <h3>{t('children.cardInfo')}</h3>
                <form onSubmit={handleSubmit} className="payment-form">
                    <div className="card-element-container">
                        <CardElement options={{ hidePostalCode: true }} />
                    </div>
                    {error && <div className="error-message"><FaTimesCircle /> {error}</div>}
                    <div className="payment-buttons">
                        <button type="button" onClick={onClose} className="cancel-btn" disabled={processing}>
                            {t('children.cancel')}
                        </button>
                        <button type="submit" className="confirm-btn" disabled={!stripe || !clientSecret || processing}>
                            {processing ? t('children.processing') : t('children.validateCard')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PaymentForm;
