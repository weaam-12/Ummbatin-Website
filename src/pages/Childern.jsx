// استيراد React والمكتبات
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { fetchKindergartens, getChildrenByUser, createChild, enrollChild } from '../api';
import './Children.css';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

// 🧾 نموذج الدفع
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
            const { error, paymentMethod } = await stripe.createPaymentMethod({ type: 'card', card: cardElement });

            if (error) {
                setError(error.message);
                setProcessing(false);
                return;
            }

            const paymentResult = await enrollChild({
                childId: child.id,
                kindergartenId: kindergarten.id,
                paymentMethodId: paymentMethod.id,
                amount: 500
            });

            if (paymentResult.success) {
                onSuccess();
            } else {
                setError(paymentResult.message || t('payment.error'));
            }
        } catch {
            setError(t('payment.error'));
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="payment-modal">
            <div className="payment-content">
                <h3>{t('enrollment.title')}</h3>
                <p>{t('enrollment.child')}: {child.name}</p>
                <p>{t('enrollment.kindergarten')}: {kindergarten.name}</p>
                <form onSubmit={handleSubmit}>
                    <CardElement />
                    {error && <div className="error">{error}</div>}
                    <div className="buttons">
                        <button type="button" onClick={onClose}>{t('cancel')}</button>
                        <button type="submit" disabled={processing}>
                            {processing ? t('processing') : t('confirmPayment')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// 📄 الصفحة الرئيسية
const Children = ({ userId }) => {
    const { t } = useTranslation();
    const [children, setChildren] = useState([]);
    const [kindergartens, setKindergartens] = useState([]);
    const [newChild, setNewChild] = useState({ name: '', birthDate: '' });
    const [selectedChild, setSelectedChild] = useState(null);
    const [selectedKindergarten, setSelectedKindergarten] = useState(null);
    const [showPayment, setShowPayment] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            const [kids, kgs] = await Promise.all([
                getChildrenByUser(userId),
                fetchKindergartens()
            ]);
            setChildren(kids);
            setKindergartens(kgs);
        };
        if (userId) loadData();
    }, [userId]);

    const handleAddChild = async () => {
        if (!newChild.name || !newChild.birthDate) return;
        const child = await createChild({ ...newChild, userId });
        setChildren([...children, child]);
        setNewChild({ name: '', birthDate: '' });
    };

    const handleEnroll = (child, kindergartenId) => {
        const selectedKg = kindergartens.find(k => k.id === kindergartenId);
        if (selectedKg) {
            setSelectedChild(child);
            setSelectedKindergarten(selectedKg);
            setShowPayment(true);
        }
    };

    return (
        <div className="children-page">
            <h1>{t('myChildren')}</h1>

            {/* جدول الأطفال */}
            <table className="children-table">
                <thead>
                <tr>
                    <th>{t('childName')}</th>
                    <th>{t('birthDate')}</th>
                    <th>{t('kindergarten')}</th>
                    <th>{t('paymentStatus')}</th>
                    <th>{t('actions')}</th>
                </tr>
                </thead>
                <tbody>
                {children.map(child => (
                    <tr key={child.id}>
                        <td>{child.name}</td>
                        <td>{new Date(child.birthDate).toLocaleDateString()}</td>
                        <td>{kindergartens.find(k => k.id === child.kindergartenId)?.name || t('notEnrolled')}</td>
                        <td>{child.kindergartenId ? t('paid') : t('notPaid')}</td>
                        <td>
                            {!child.kindergartenId && (
                                <select onChange={(e) => handleEnroll(child, e.target.value)}>
                                    <option value="">{t('selectKindergarten')}</option>
                                    {kindergartens.map(kg => (
                                        <option key={kg.id} value={kg.id}>{kg.name}</option>
                                    ))}
                                </select>
                            )}
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>

            {/* إضافة طفل جديد */}
            <div className="add-child-section">
                <h2>{t('addNewChild')}</h2>
                <input
                    type="text"
                    placeholder={t('childName')}
                    value={newChild.name}
                    onChange={(e) => setNewChild({ ...newChild, name: e.target.value })}
                />
                <input
                    type="date"
                    value={newChild.birthDate}
                    onChange={(e) => setNewChild({ ...newChild, birthDate: e.target.value })}
                />
                <button onClick={handleAddChild}>{t('add')}</button>
            </div>

            {/* مودال الدفع */}
            {showPayment && selectedChild && selectedKindergarten && (
                <Elements stripe={stripePromise}>
                    <PaymentForm
                        child={selectedChild}
                        kindergarten={selectedKindergarten}
                        onSuccess={() => {
                            setShowPayment(false);
                            getChildrenByUser(userId).then(setChildren);
                        }}
                        onClose={() => setShowPayment(false)}
                    />
                </Elements>
            )}
        </div>
    );
};

export default Children;
