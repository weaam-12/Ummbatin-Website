import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { fetchKindergartens, createChild, enrollChild } from '../api';
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
        } catch (err) {
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

const Children = () => {
    const { t, i18n } = useTranslation();
    const { user, getUserId } = useAuth();
    const [children, setChildren] = useState([]);
    const [kindergartens, setKindergartens] = useState([]);
    const [newChild, setNewChild] = useState({ name: '', birthDate: '' });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showPayment, setShowPayment] = useState(false);
    const [selectedChild, setSelectedChild] = useState(null);
    const [selectedKindergarten, setSelectedKindergarten] = useState(null);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const [kgs] = await Promise.all([
                    fetchKindergartens()
                ]);
                setKindergartens(kgs);

                // جلب بيانات الأطفال للمستخدم الحالي فقط
                if (getUserId()) {
                    const response = await axiosInstance.get('/api/children/my-children');
                    setChildren(response.data);
                }
            } catch (error) {
                console.error("Error loading data", error);
                setError(t('children.loadError'));
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [getUserId(), t]);

    const handleAddChild = async () => {
        if (!newChild.name || !newChild.birthDate) {
            setError(t('children.errors.requiredFields'));
            return;
        }

        try {
            const child = await createChild({
                ...newChild,
                userId: getUserId() // استخدام معرف المستخدم الحالي
            });
            setChildren([...children, child]);
            setNewChild({ name: '', birthDate: '' });
            setError(null);
        } catch (error) {
            console.error("Failed to add child", error);
            setError(t('children.loadError'));
        }
    };

    const handleEnroll = (child, kindergarten) => {
        setSelectedChild(child);
        setSelectedKindergarten(kindergarten);
        setShowPayment(true);
    };

    const handleDeleteChild = async (childId) => {
        if (window.confirm(t('children.deleteChild'))) {
            try {
                // await deleteChild(childId); // Uncomment when you have delete API
                setChildren(children.filter(child => child.id !== childId));
            } catch (error) {
                console.error("Failed to delete child", error);
                setError(t('children.loadError'));
            }
        }
    };

    if (!user) {
        return (
            <div className="auth-error">
                <h3>{t('auth.loginRequired')}</h3>
                <button onClick={() => window.location.href = '/login'}>
                    {t('auth.login')}
                </button>
            </div>
        );
    }

    return (
        <div className={`children-page ${i18n.language}`} dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
            <h1 className="page-title">{t('children.myChildren')}</h1>

            {loading && <div className="loading-indicator">{t('general.loading')}</div>}
            {error && <div className="error-message">{error}</div>}

            {/* Add New Child Section */}
            <div className="add-child-section card">
                <h2 className="section-title">{t('children.registerTitle')}</h2>
                <div className="form-group">
                    <label htmlFor="childName">{t('children.childName')}</label>
                    <input
                        id="childName"
                        type="text"
                        placeholder={t('children.childName')}
                        value={newChild.name}
                        onChange={(e) => setNewChild({...newChild, name: e.target.value})}
                        className="form-input"
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="birthDate">{t('children.birthDate')}</label>
                    <input
                        id="birthDate"
                        type="date"
                        value={newChild.birthDate}
                        onChange={(e) => setNewChild({...newChild, birthDate: e.target.value})}
                        className="form-input"
                    />
                </div>
                <button
                    onClick={handleAddChild}
                    className="primary-btn"
                    disabled={!newChild.name || !newChild.birthDate}
                >
                    {t('children.addChild')}
                </button>
            </div>

            {/* Registered Children Section */}
            <div className="registered-children-section">
                <h2 className="section-title">{t('children.registeredTitle')}</h2>

                {children.length === 0 ? (
                    <div className="empty-state">
                        <p>{t('children.noChildren')}</p>
                        <p>{t('children.addNewChild')}</p>
                    </div>
                ) : (
                    <div className="responsive-table">
                        <table className="children-table">
                            <thead>
                            <tr>
                                <th>{t('children.childName')}</th>
                                <th>{t('children.birthDate')}</th>
                                <th>{t('children.status')}</th>
                                <th>{t('children.actions')}</th>
                            </tr>
                            </thead>
                            <tbody>
                            {children.map(child => {
                                const enrolledKg = kindergartens.find(k => k.id === child.kindergartenId);
                                return (
                                    <tr key={child.id}>
                                        <td data-label={t('children.childName')}>{child.name}</td>
                                        <td data-label={t('children.birthDate')}>
                                            {new Date(child.birthDate).toLocaleDateString(i18n.language)}
                                        </td>
                                        <td data-label={t('children.status')}>
                                            {enrolledKg ? (
                                                <span className="enrolled-status">
                                                        {t('children.enrolledIn')}: {enrolledKg.name}
                                                    </span>
                                            ) : (
                                                <span className="not-enrolled-status">
                                                        {t('children.notEnrolled')}
                                                    </span>
                                            )}
                                        </td>
                                        <td data-label={t('children.actions')}>
                                            {!child.kindergartenId ? (
                                                <div className="enroll-action">
                                                    <select
                                                        onChange={(e) => {
                                                            const kg = kindergartens.find(k => k.id === e.target.value);
                                                            if (kg) handleEnroll(child, kg);
                                                        }}
                                                        className="kindergarten-select"
                                                    >
                                                        <option value="">{t('children.selectKindergarten')}</option>
                                                        {kindergartens.map(kg => (
                                                            <option key={kg.id} value={kg.id}>
                                                                {kg.name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => handleDeleteChild(child.id)}
                                                    className="danger-btn"
                                                >
                                                    {t('children.delete')}
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                            </tbody>
                        </table>
                    </div>
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
                            // إعادة تحميل بيانات الأطفال بعد التسجيل الناجح
                            axiosInstance.get('/api/children/my-children').then(res => setChildren(res.data));
                        }}
                        onClose={() => setShowPayment(false)}
                    />
                </Elements>
            )}
        </div>
    );
};

export default Children;