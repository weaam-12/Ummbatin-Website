import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axiosInstance from '../api';
import PaymentForm from './PaymentForm';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { useAuth } from '../AuthContext';
import { FaChild, FaCheckCircle, FaTimesCircle, FaMoneyBillWave } from 'react-icons/fa';
import './Children.css';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

const ChildCard = ({ child, kindergartens, handleEnroll, t, i18n }) => {
    const [selectedKg, setSelectedKg] = useState('');
    const kg = kindergartens.find(k => {
        console.log("🧪 Matching KG:", k.kindergartenId, selectedKg);
        return String(k.kindergartenId) === selectedKg;
    });
    return (
        <div className="child-card">
            <h3>{child.name}</h3>
            <p>{t('children.birthDate')}: {new Date(child.birthDate).toLocaleDateString(i18n.language)}</p>

            <select
                value={selectedKg}
                onChange={(e) => setSelectedKg(e.target.value)}
            >
                <option value="">{t('children.selectKindergarten')}</option>
                {kindergartens.map(kg => (
                    <option key={kg.kindergartenId} value={kg.kindergartenId}>
                        {kg.name} ({t('children.fees')}: {kg.monthlyFee} {t('general.currency')})
                    </option>
                ))}
            </select>

            {selectedKg && kg && (
                <div className="payment-info">
                    <p>{t('children.selectedKindergarten')}: <strong>{kg.name}</strong></p>
                    <p>{t('children.monthlyFees')}: <strong>{"250₪"} {t('general.currency')}</strong></p>
                    <p>{t('children.availableSlots')}: <strong>{kg.availableSlots}</strong></p>
                </div>
            )}

            <button
                className="enroll-button"
                onClick={() => {
                    console.log("🔘 Enroll Clicked:", child.name, "Selected KG ID:", selectedKg);
                    const kg = kindergartens.find(k => {
                        console.log("🧪 Matching KG:", k.kindergartenId, selectedKg);
                        return String(k.kindergartenId) === selectedKg;
                    });

                    if (!kg) {
                        console.warn("❌ No matching kindergarten found!");
                    }

                    handleEnroll(child, kg);
                }}                disabled={!selectedKg}
            >
                <FaMoneyBillWave /> {t('children.payAndRegister')}
            </button>
        </div>
    );
};

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
    const [totalChildren, setTotalChildren] = useState(0);
    const [enrolledChildren, setEnrolledChildren] = useState(0);
    const [unenrolledChildren, setUnenrolledChildren] = useState(0);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const [kgs, childrenRes] = await Promise.all([
                    axiosInstance.get('/api/kindergartens'),
                    axiosInstance.get('/api/children/my-children')
                ]);
                setKindergartens(kgs.data);
                setChildren(childrenRes.data);
                const total = childrenRes.data.length;
                const enrolled = childrenRes.data.filter(child => child.kindergartenId).length;
                const unenrolled = total - enrolled;
                setTotalChildren(total);
                setEnrolledChildren(enrolled);
                setUnenrolledChildren(unenrolled);
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

    const handleEnroll = (child, kg) => {
        console.log("📥 handleEnroll called", child, kg);
        setSelectedChild(child);
        setSelectedKindergarten(kg);
        setShowPayment(true);
    };

    const reloadChildren = async () => {
        const res = await axiosInstance.get('/api/children/my-children');
        setChildren(res.data);
        const total = res.data.length;
        const enrolled = res.data.filter(child => child.kindergartenId).length;
        const unenrolled = total - enrolled;
        setTotalChildren(total);
        setEnrolledChildren(enrolled);
        setUnenrolledChildren(unenrolled);
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
        <div className={`children-page modern ${i18n.language}`} dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
            <h1 className="page-title">👶 {t('children.myChildren')}</h1>

            {loading && <div className="loading-indicator">{t('general.loading')}</div>}
            {error && <div className="error-message">{error}</div>}

            <div className="stats-cards">
                <div className="stat-card">
                    <div className="stat-icon">🧒</div>
                    <div className="stat-value">{totalChildren}</div>
                    <div className="stat-label">{t('children.totalChildren')}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">🏫</div>
                    <div className="stat-value">{enrolledChildren}</div>
                    <div className="stat-label">{t('children.enrolledChildren')}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">❓</div>
                    <div className="stat-value">{unenrolledChildren}</div>
                    <div className="stat-label">{t('children.unenrolledChildren')}</div>
                </div>
            </div>

            {unenrolledChildren > 0 ? (
                <div className="cards-section">
                    {children.filter(c => !c.kindergartenId).map(child => (
                        <ChildCard
                            key={child.childId}
                            child={child}
                            kindergartens={kindergartens}
                            handleEnroll={handleEnroll}
                            t={t}
                            i18n={i18n}
                        />
                    ))}
                </div>
            ) : (
                <div className="all-enrolled-msg">
                    🎉 {t('children.allEnrolled')}
                </div>
            )}


            <div className="registered-children-section">
                <h2 className="section-title">{t('children.registeredTitle')}</h2>
                <table className="children-table">
                    <thead>
                    <tr>
                        <th>{t('children.childName')}</th>
                        <th>{t('children.birthDate')}</th>
                        <th>{t('children.status')}</th>
                    </tr>
                    </thead>
                    <tbody>
                    {children.filter(c => c.kindergartenId).map(child => {
                        const kg = kindergartens.find(k => k.kindergartenId === child.kindergartenId);
                        return (
                            <tr key={child.childId}>
                                <td>{child.name}</td>
                                <td>{new Date(child.birthDate).toLocaleDateString(i18n.language)}</td>
                                <td>{kg ? kg.name : t('children.enrolled')}</td>
                            </tr>
                        );
                    })}
                    </tbody>
                </table>
            </div>

            {showPayment && selectedChild && selectedKindergarten && (
                <>
                    {console.log("🔵 Payment Modal Triggered", selectedChild, selectedKindergarten, showPayment)}
                    <div className="payment-modal">
                        <div className="payment-content">
                            <Elements stripe={stripePromise}>
                                <PaymentForm
                                    child={selectedChild}
                                    kindergarten={selectedKindergarten}
                                    onSuccess={() => {
                                        setShowPayment(false);
                                        reloadChildren();
                                    }}
                                    onClose={() => setShowPayment(false)}
                                />
                            </Elements>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default Children;