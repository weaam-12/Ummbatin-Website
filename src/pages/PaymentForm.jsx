import React, { useState } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import axios from 'axios';
import { FaCreditCard, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import './PaymentForm.css';
import { createPaymentIntent} from '../api';

const PaymentForm = ({ child, kindergarten, onSuccess, onClose }) => {
    const { t } = useTranslation();
    const stripe = useStripe();
    const elements = useElements();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [paymentSuccess, setPaymentSuccess] = useState(false);
    const [receipt, setReceipt] = useState(null);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        setError('');

        if (!stripe || !elements) {
            setError(t('payment.stripeNotLoaded'));
            setLoading(false);
            return;
        }

        try {
            // 1. إنشاء Payment Intent
            const { clientSecret } = await createPaymentIntent({
                amount: kindergarten.monthlyFee * 100,
                currency: 'ils',
                description: `رسوم الحضانة لـ ${child.name}`,
                metadata: { childId: child.childId, kindergartenId: kindergarten.kindergartenId }
            });

            // 2. تأكيد الدفع مع Stripe
            const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: elements.getElement(CardElement),
                    billing_details: {
                        name: child.name,
                    },
                }
            });

            if (stripeError) {
                setError(stripeError.message);
                setLoading(false);
                return;
            }

            // 3. التحقق من أن الدفع ناجح قبل المتابعة
            if (paymentIntent.status !== 'succeeded') {
                setError(t('payment.paymentNotCompleted'));
                setLoading(false);
                return;
            }

            // 4. حفظ الفاتورة في قاعدة البيانات
            const { data: invoice } = await axios.post('/api/payments/save-invoice', {
                paymentIntentId: paymentIntent.id,
                amount: paymentIntent.amount / 100,
                currency: paymentIntent.currency,
                status: paymentIntent.status,
                childId: child.childId,
                kindergartenId: kindergarten.kindergartenId,
                paymentMethod: 'card',
                receiptEmail: paymentIntent.receipt_email
            });

            // 5. تحديث حالة التسجيل
            await axios.post('/api/children/enroll', {
                childId: child.childId,
                kindergartenId: kindergarten.kindergartenId,
                paymentId: invoice.paymentId,
                status: 'paid' // تأكد من إضافة هذه الحالة
            });

            setReceipt(invoice);
            setPaymentSuccess(true);
            onSuccess(invoice); // تعديل الدالة لتمرير الفاتورة
        } catch (err) {
            console.error('Payment error:', err);
            setError(err.response?.data?.message || t('payment.generalError'));
        } finally {
            setLoading(false);
        }
    };

    if (paymentSuccess && receipt) {
        return (
            <div className="payment-success">
                <div className="success-icon">
                    <FaCheckCircle />
                </div>
                <h3>{t('payment.successTitle')}</h3>
                <p>{t('payment.successMessage')}</p>

                <div className="receipt-details">
                    <h4>{t('payment.receiptDetails')}</h4>
                    <p><strong>{t('payment.childName')}:</strong> {child.name}</p>
                    <p><strong>{t('payment.kindergarten')}:</strong> {kindergarten.name}</p>
                    <p><strong>{t('payment.amount')}:</strong> {receipt.amount} {t('payment.currency')}</p>
                    <p><strong>{t('payment.paymentDate')}:</strong> {new Date(receipt.createdAt).toLocaleString()}</p>
                    <p><strong>{t('payment.transactionId')}:</strong> {receipt.paymentIntentId}</p>
                </div>

                <button
                    className="close-button"
                    onClick={onClose}
                >
                    {t('payment.close')}
                </button>
            </div>
        );
    }

    return (
        <div className="payment-form-container">
            <div className="payment-header">
                <h3>{t('payment.title')}</h3>
                <button className="close-button" onClick={onClose}>
                    &times;
                </button>
            </div>

            <div className="payment-summary">
                <h4>{t('payment.summary')}</h4>
                <p><strong>{t('payment.child')}:</strong> {child.name}</p>
                <p><strong>{t('payment.kindergarten')}:</strong> {kindergarten.name}</p>
                <p><strong>{t('payment.amount')}:</strong> {kindergarten.monthlyFee} {t('payment.currency')}</p>
            </div>

            <form onSubmit={handleSubmit} className="payment-form">
                <div className="card-element-container">
                    <label>{t('payment.cardDetails')}</label>
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
                                    color: '#9e2146',
                                },
                            },
                        }}
                    />
                </div>

                {error && (
                    <div className="payment-error">
                        <FaTimesCircle /> {error}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={!stripe || loading}
                    className="submit-button"
                >
                    {loading ? (
                        <span>{t('payment.processing')}...</span>
                    ) : (
                        <>
                            <FaCreditCard /> {t('payment.payNow')}
                        </>
                    )}
                </button>
            </form>
        </div>
    );
};

export default PaymentForm;