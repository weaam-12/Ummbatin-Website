import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Elements, useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import {
    fetchKindergartens,
    getChildrenByUser,
    createChild,
    createKindergartenPayment,
    confirmKindergartenPayment
} from './api';
import './Children.css';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

const CheckoutForm = ({ childId, kindergartenId, amount, onSuccess, onClose }) => {
    const stripe = useStripe();
    const elements = useElements();
    const { t } = useTranslation();
    const [error, setError] = useState(null);
    const [processing, setProcessing] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setProcessing(true);

        if (!stripe || !elements) {
            return;
        }

        try {
            // 1. Create Payment Intent
            const { clientSecret } = await createKindergartenPayment(
                childId,
                kindergartenId,
                amount * 100 // Convert to cents
            );

            // 2. Confirm Payment
            const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: elements.getElement(CardElement),
                }
            });

            if (stripeError) {
                setError(stripeError.message);
                setProcessing(false);
                return;
            }

            if (paymentIntent.status === 'succeeded') {
                // 3. Confirm Enrollment
                await confirmKindergartenPayment(paymentIntent.id);
                onSuccess();
            }
        } catch (err) {
            setError(err.message || t('children.errors.paymentFailed'));
            console.error('Payment error:', err);
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="payment-form-container">
            <h3>{t('children.paymentTitle')}</h3>
            <p>{t('children.paymentAmount')}: ${amount}</p>

            <form onSubmit={handleSubmit} className="payment-form">
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

                {error && <div className="payment-error">{error}</div>}

                <div className="payment-actions">
                    <button
                        type="button"
                        onClick={onClose}
                        className="btn-secondary"
                    >
                        {t('children.cancel')}
                    </button>
                    <button
                        type="submit"
                        disabled={!stripe || processing}
                        className="btn-primary"
                    >
                        {processing ? t('children.processing') : t('children.payAndEnroll')}
                    </button>
                </div>
            </form>
        </div>
    );
};

const Children = ({ userId }) => {
    const { t, i18n } = useTranslation();
    const [kindergartens, setKindergartens] = useState([]);
    const [children, setChildren] = useState([]);
    const [newChild, setNewChild] = useState({
        name: '',
        birthDate: '',
        kindergartenId: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showPayment, setShowPayment] = useState(false);
    const [selectedChild, setSelectedChild] = useState(null);
    const [selectedKindergarten, setSelectedKindergarten] = useState(null);
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [kgs, userChildren] = await Promise.all([
                    fetchKindergartens(),
                    getChildrenByUser(userId)
                ]);
                setKindergartens(kgs);
                setChildren(userChildren);
            } catch (err) {
                setError(t('children.errors.loading'));
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [userId, t, refreshKey]);

    const handleChildChange = (e) => {
        setNewChild({ ...newChild, [e.target.name]: e.target.value });
    };

    const handleAddChild = async () => {
        if (!newChild.name || !newChild.birthDate) {
            setError(t('children.errors.requiredFields'));
            return;
        }

        try {
            const child = await createChild({
                name: newChild.name,
                birthDate: newChild.birthDate,
                userId: userId
            });
            setChildren([...children, child]);
            setNewChild({ name: '', birthDate: '', kindergartenId: '' });
            setError(null);
        } catch (err) {
            setError(t('children.errors.addChild'));
        }
    };

    const handleInitiateEnrollment = (childId, kindergartenId) => {
        setSelectedChild(childId);
        setSelectedKindergarten(kindergartenId);
        setShowPayment(true);
    };

    const handlePaymentSuccess = () => {
        setShowPayment(false);
        setRefreshKey(prev => prev + 1); // Refresh children list
    };

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
        return new Date(dateString).toLocaleDateString(i18n.language === 'he' ? 'he-IL' : 'ar-SA', options);
    };

    if (loading) {
        return (
            <div className="loader" aria-live="polite" aria-busy="true">
                <div className="spinner"></div>
                <p>{t('children.loading')}</p>
            </div>
        );
    }

    return (
        <div className={`children-page ${i18n.language === 'he' ? 'rtl' : 'ltr'}`} dir={i18n.language === 'he' ? 'rtl' : 'ltr'}>
            <h1 className="page-title" tabIndex="0">{t('children.title')}</h1>

            <div className="card" aria-labelledby="register-child-heading">
                <h2 id="register-child-heading" className="card-title">{t('children.registerTitle')}</h2>

                {error && <div className="alert-error" role="alert">{error}</div>}

                <div className="form-group">
                    <label htmlFor="child-name">{t('children.childName')} *</label>
                    <input
                        id="child-name"
                        type="text"
                        name="name"
                        value={newChild.name}
                        onChange={handleChildChange}
                        aria-required="true"
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="birth-date">{t('children.birthDate')} *</label>
                    <input
                        id="birth-date"
                        type="date"
                        name="birthDate"
                        value={newChild.birthDate}
                        onChange={handleChildChange}
                        aria-required="true"
                        required
                    />
                </div>

                <button
                    onClick={handleAddChild}
                    className="btn-primary"
                    disabled={!newChild.name || !newChild.birthDate}
                    aria-disabled={!newChild.name || !newChild.birthDate}
                >
                    {t('children.addChild')}
                </button>
            </div>

            <div className="card" aria-labelledby="registered-children-heading">
                <h2 id="registered-children-heading" className="card-title">{t('children.registeredTitle')}</h2>

                {children.length === 0 ? (
                    <div className="empty-state">
                        <p>{t('children.noChildren')}</p>
                        <p>{t('children.addNewChild')}</p>
                    </div>
                ) : (
                    <ul className="children-list" aria-live="polite">
                        {children.map(child => {
                            const kindergarten = kindergartens.find(k => k.id === child.kindergartenId);
                            return (
                                <li key={child.id} className="child-item">
                                    <div className="child-info">
                                        <h3>{child.name}</h3>
                                        <p>{t('children.birthDate')}: {formatDate(child.birthDate)}</p>
                                        <p>{t('children.kindergarten')}: {kindergarten?.name || t('children.notRegistered')}</p>
                                        {child.enrollmentStatus && (
                                            <p className={`status-${child.enrollmentStatus.toLowerCase()}`}>
                                                {t(`children.status.${child.enrollmentStatus.toLowerCase()}`)}
                                            </p>
                                        )}
                                    </div>
                                    {!child.kindergartenId && (
                                        <div className="enroll-section">
                                            <select
                                                value={child.selectedKindergarten || ''}
                                                onChange={(e) => setChildren(children.map(c =>
                                                    c.id === child.id ? {...c, selectedKindergarten: e.target.value} : c
                                                ))}
                                            >
                                                <option value="">{t('children.selectKindergarten')}</option>
                                                {kindergartens.map(k => (
                                                    <option key={k.id} value={k.id}>{k.name}</option>
                                                ))}
                                            </select>
                                            <button
                                                onClick={() => handleInitiateEnrollment(child.id, child.selectedKindergarten)}
                                                className="btn-enroll"
                                                disabled={!child.selectedKindergarten}
                                            >
                                                {t('children.enroll')}
                                            </button>
                                        </div>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>

            {showPayment && (
                <div className="payment-modal">
                    <div className="payment-modal-content">
                        <Elements stripe={stripePromise}>
                            <CheckoutForm
                                childId={selectedChild}
                                kindergartenId={selectedKindergarten}
                                amount={500} // Enrollment fee
                                onSuccess={handlePaymentSuccess}
                                onClose={() => setShowPayment(false)}
                            />
                        </Elements>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Children;