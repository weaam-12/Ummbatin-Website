import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { enrollChild } from '../api';
import './Children.css';
import { FaMoneyBillWave } from 'react-icons/fa';

const PaymentForm = ({ child, kindergarten, onSuccess, onClose }) => {
    const stripe = useStripe();
    const elements = useElements();
    const { t } = useTranslation();
    const [error, setError] = useState(null);
    const [processing, setProcessing] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!stripe || !elements) {
            // Stripe.js hasn't loaded yet
            return;
        }

        setProcessing(true);
        setError(null);

        try {
            const { error: stripeError, paymentMethod } = await stripe.createPaymentMethod({
                type: 'card',
                card: elements.getElement(CardElement),
            });

            if (stripeError) {
                setError(stripeError.message);
                setProcessing(false);
                return;
            }

            const paymentResult = await enrollChild({
                childId: child.childId, // تغيير من child.id إلى child.childId
                kindergartenId: kindergarten.kindergartenId, // تغيير من kindergarten.id إلى kindergarten.kindergartenId
                paymentMethodId: paymentMethod.id,
                amount: kindergarten.monthlyFee // استخدام القيمة الفعلية من الروضة بدلاً من القيمة الثابتة
            });

            if (paymentResult.success) {
                onSuccess();
            } else {
                setError(paymentResult.message || t('children.payment.error'));
            }
        } catch (err) {
            console.error('Payment error:', err);
            setError(t('children.payment.error'));
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="payment-modal">
            <div className="payment-content">
                <h3>{t('children.paymentTitle')}</h3>
                <div className="payment-details">
                    <p><strong>{t('children.enrollment.child')}:</strong> {child.name}</p>
                    <p><strong>{t('children.enrollment.kindergarten')}:</strong> {kindergarten.name}</p>
                    <p><strong>{t('children.enrollment.fee')}:</strong> {kindergarten.monthlyFee} {t('general.currency')}</p>
                </div>

                <form onSubmit={handleSubmit} className="payment-form">
                    <div className="card-element-container">
                        <CardElement
                            options={{
                                style: {
                                    base: {
                                        fontSize: '16px',
                                        color: '#424770',
                                        '::placeholder': {
                                            color: '#aab7c4',
                                        },
                                    },
                                    invalid: {
                                        color: '#e53935',
                                    },
                                },
                                hidePostalCode: true
                            }}
                        />
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <div className="payment-buttons">
                        <button
                            type="button"
                            onClick={onClose}
                            className="cancel-btn"
                            disabled={processing}
                        >
                            {t('children.cancel')}
                        </button>
                        <button
                            type="submit"
                            disabled={!stripe || processing}
                            className="confirm-btn"
                        >
                            {processing ? (
                                t('children.processing')
                            ) : (
                                <>
                                    <FaMoneyBillWave /> {t('children.payAndEnroll')}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PaymentForm;