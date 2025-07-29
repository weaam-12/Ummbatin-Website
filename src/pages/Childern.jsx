import React, { useState, useEffect } from 'react';
import { useTranslation, useAuth } from 'react-i18next';
import axiosInstance from '../api';
import PaymentForm from './PaymentForm';
import './Children.css';
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

const Children = () => {
    const { t, i18n } = useTranslation();
    const { user } = useAuth();
    const [children, setChildren] = useState([]);
    const [kindergartens, setKindergartens] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showPayment, setShowPayment] = useState(false);
    const [selectedChild, setSelectedChild] = useState(null);
    const [selectedKindergarten, setSelectedKindergarten] = useState(null);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const [kgs, childrenRes] = await Promise.all([
                    axiosInstance.get('/api/kindergartens'),
                    axiosInstance.get('/api/children/my-children')
                ]);
                console.log("Kindergartens:", kgs.data);
                console.log("Children:", childrenRes.data);
                setKindergartens(kgs.data);
                setChildren(childrenRes.data);
            } catch (error) {
                console.error("Error loading data", error);
                setError(t('children.loadError'));
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            loadData();
        }
    }, [user, t]);

    const handleEnroll = (child, kindergarten) => {
        setSelectedChild(child);
        setSelectedKindergarten(kindergarten);
        setShowPayment(true);
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

            <div className="registered-children-section">
                <h2 className="section-title">{t('children.registeredTitle')}</h2>

                {children.length === 0 ? (
                    <div className="empty-state">
                        <p>{t('children.noChildren')}</p>
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
                                console.log("Enrolled Kindergarten for child", child.id, enrolledKg);
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
                                            {!child.kindergartenId && (
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

            {showPayment && selectedChild && selectedKindergarten && (
                <Elements stripe={stripePromise}>
                    <PaymentForm
                        child={selectedChild}
                        kindergarten={selectedKindergarten}
                        onSuccess={() => {
                            setShowPayment(false);
                            axiosInstance.get('/api/children/my-children').then(res => {
                                console.log("Updated Children Data:", res.data);
                                setChildren(res.data);
                            });
                        }}
                        onClose={() => setShowPayment(false)}
                    />
                </Elements>
            )}
        </div>
    );
};

export default Children;