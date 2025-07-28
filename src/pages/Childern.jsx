import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { fetchKindergartens, getChildrenByUser, createChild, enrollChild } from '../api';
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

            const paymentResult = await enrollChild({
                childId: child.id,
                kindergartenId: kindergarten.id,
                paymentMethodId: paymentMethod.id,
                amount: 500 // Registration fee
            });

            if (paymentResult.success) {
                onSuccess();
            } else {
                setError(paymentResult.message || t('payment.error'));
            }
        } catch (err) {
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
                <p>{t('enrollment.fee')}: 500 {t('currency')}</p>

                <form onSubmit={handleSubmit}>
                    <CardElement />
                    {error && <div className="error">{error}</div>}
                    <div className="buttons">
                        <button type="button" onClick={onClose}>
                            {t('cancel')}
                        </button>
                        <button type="submit" disabled={processing}>
                            {processing ? t('processing') : t('confirmPayment')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const Children = ({ userId }) => {
    const { t } = useTranslation();
    const [children, setChildren] = useState([]);
    const [kindergartens, setKindergartens] = useState([]);
    const [newChild, setNewChild] = useState({ name: '', birthDate: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showPayment, setShowPayment] = useState(false);
    const [selectedChild, setSelectedChild] = useState(null);
    const [selectedKindergarten, setSelectedKindergarten] = useState(null);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const [kids, kgs] = await Promise.all([
                    getChildrenByUser(userId),
                    fetchKindergartens()
                ]);
                setChildren(kids);
                setKindergartens(kgs);
            } catch (error) {
                console.error("Failed to load data", error);
                setError(t('loadError'));
            } finally {
                setLoading(false);
            }
        };

        if (userId) loadData();
    }, [userId]);

    const handleAddChild = async () => {
        if (!newChild.name || !newChild.birthDate) return;

        try {
            const child = await createChild({
                ...newChild,
                userId
            });
            setChildren([...children, child]);
            setNewChild({ name: '', birthDate: '' });
        } catch (error) {
            console.error("Failed to add child", error);
        }
    };

    const handleEnroll = (child, kindergarten) => {
        setSelectedChild(child);
        setSelectedKindergarten(kindergarten);
        setShowPayment(true);
    };

    return (
        <div className="children-page">
            <h1>{t('myChildren')}</h1>

            {/* Add New Child */}
            <div className="add-child">
                <h2>{t('addNewChild')}</h2>
                <input
                    type="text"
                    placeholder={t('childName')}
                    value={newChild.name}
                    onChange={(e) => setNewChild({...newChild, name: e.target.value})}
                />
                <input
                    type="date"
                    value={newChild.birthDate}
                    onChange={(e) => setNewChild({...newChild, birthDate: e.target.value})}
                />
                <button onClick={handleAddChild}>{t('add')}</button>
            </div>

            {/* List of Children */}
            <div className="children-list">
                <h2>{t('registeredChildren')}</h2>
                {children.length === 0 ? (
                    <p>{t('noChildren')}</p>
                ) : (
                    <ul>
                        {children.map(child => (
                            <li key={child.id}>
                                <div>
                                    <h3>{child.name}</h3>
                                    <p>{t('birthDate')}: {new Date(child.birthDate).toLocaleDateString()}</p>
                                    {child.kindergartenId ? (
                                        <p className="enrolled">
                                            {t('enrolledIn')}: {
                                            kindergartens.find(k => k.id === child.kindergartenId)?.name || ''
                                        }
                                        </p>
                                    ) : (
                                        <div className="enroll-options">
                                            <select onChange={(e) => {
                                                const kg = kindergartens.find(k => k.id === e.target.value);
                                                if (kg) handleEnroll(child, kg);
                                            }}>
                                                <option value="">{t('selectKindergarten')}</option>
                                                {kindergartens.map(kg => (
                                                    <option key={kg.id} value={kg.id}>{kg.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Payment Modal */}
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