// Children.jsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axiosInstance, {getUserPayments} from '../api';
import { useAuth } from '../AuthContext';
import { FaChild, FaCheckCircle, FaMoneyBillWave, FaClock } from 'react-icons/fa';
import { FiDownload } from 'react-icons/fi';
import './Children.css';

import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button, Alert, Spinner, Modal, Form, Row, Col } from 'react-bootstrap';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// ----------  ChildCard  ----------
const ChildCard = ({ child, kindergartens, handleEnroll, t, i18n }) => {
    const [selectedKg, setSelectedKg] = useState('');
    const kg = kindergartens.find(k => String(k.kindergartenId) === selectedKg);

    return (
        <div className="child-card">
            <h3>{child.name}</h3>
            <p>
                {t('children.birthDate')}:{' '}
                {new Date(child.birthDate).toLocaleDateString(i18n.language)}
            </p>

            <select
                value={selectedKg}
                onChange={e => setSelectedKg(e.target.value)}
            >
                <option value="">{t('children.selectKindergarten')}</option>
                {kindergartens.map(kg => (
                    <option key={kg.kindergartenId} value={kg.kindergartenId}>
                        {kg.name}
                    </option>
                ))}
            </select>

            {selectedKg && kg && (
                <div className="payment-info">
                    <p>{t('children.selectedKindergarten')}: <strong>{kg.name}</strong></p>
                    <p>{t('children.monthlyFees')}: <strong>35 {t('general.currency')}</strong></p>
                    <p>{t('children.availableSlots')}: <strong>19</strong></p>
                </div>
            )}

            <button
                className="enroll-button"
                onClick={() => handleEnroll(child, kg)}
                disabled={!selectedKg}
            >
                <FaMoneyBillWave /> {t('children.payAndRegister')}
            </button>
        </div>
    );
};

// ----------  Main Component  ----------
const Children = () => {
    const { t, i18n } = useTranslation();
    const { user } = useAuth();
    const stripe = useStripe();
    const elements = useElements();

    const [children, setChildren] = useState([]);
    const [kindergartens, setKindergartens] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showPayment, setShowPayment] = useState(false);
    const [selectedChild, setSelectedChild] = useState(null);
    const [selectedKindergarten, setSelectedKindergarten] = useState(null);
    const [paymentSuccess, setPaymentSuccess] = useState(false);
    const [notification, setNotification] = useState(null);

    // load data
    const loadData = async () => {
        setLoading(true);
        try {
            const [kgs, childrenRes] = await Promise.all([
                axiosInstance.get('/api/kindergartens'),
                axiosInstance.get('/api/children/my-children')
            ]);
            setKindergartens(kgs.data);
            setChildren(childrenRes.data);
        } catch (err) {
            console.error(err);
            setError(t('children.loadError'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { if (user) loadData(); }, [user]);

    const reloadChildren = async () => {
        const res = await axiosInstance.get('/api/children/my-children');
        setChildren(res.data);
    };

    const handleEnrollClick = (child, kg) => {
        if (!kg) return;
        setSelectedChild(child);
        setSelectedKindergarten(kg);
        setShowPayment(true);
        setPaymentSuccess(false);
    };

    const resetPaymentModal = () => {
        setShowPayment(false);
        setPaymentSuccess(false);
    };


    const processPayment = async () => {
        if (!stripe || !elements) {
            setNotification({ type: 'danger', message: t('stripe.notReady') });
            return;
        }

        setLoading(true);
        try {
            const { data } = await axiosInstance.post('/api/stripe/setup-intent');
            const clientSecret = data.clientSecret;

            const cardElement = elements.getElement(CardElement);
            const { setupIntent, error } = await stripe.confirmCardSetup(clientSecret, {
                payment_method: { card: cardElement }
            });

            if (error) {
                setNotification({ type: 'danger', message: t('payments.cardVerificationFailed') });
            } else {
                await axiosInstance.patch(
                    `/api/children/${selectedChild.childId}/assign`,
                    null,
                    { params: { kindergartenId: selectedKindergarten.kindergartenId, monthlyFee: 2.5 } }
                );
                setPaymentSuccess(true);
                await axiosInstance.post('/api/notifications', {
                    userId: 4,
                    message: `המשתמש מספר ${user.userId} ביקש להירשם לגן ילדים – הילד: ${selectedChild?.name} – הגן: ${selectedKindergarten?.name}.`,
                    type: 'ENROLLMENT'
                });
                setNotification({ type: 'success', message: 'تم الدفع والتسجيل بنجاح!' });
                await reloadChildren();
            }
        } catch (e) {
            setNotification({ type: 'danger', message: t('payments.paymentError') });
        } finally {
            setLoading(false);
        }
    };


    // helpers
    const grouped = {
        notEnrolled: children.filter(c => c.monthlyFee === 0 || c.monthlyFee === 1.5),
        pending: children.filter(c => c.monthlyFee === 2.5),
        approved: children.filter(c => c.monthlyFee === 3.5)
    };

    if (!user) return (
        <div className="auth-error">
            <h3>{t('auth.loginRequired')}</h3>
            <button onClick={() => window.location.href = '/login'}>{t('auth.login')}</button>
        </div>
    );

    return (
        <div className={`children-page modern ${i18n.language}`} dir={i18n.language === 'ar' ? 'rtl' : 'rtl'}>
            <h1 className="page-title">👶 {t('children.myChildren')}</h1>

            {loading && <div className="loading-indicator">{t('general.loading')}</div>}
            {error && <div className="error-message">{error}</div>}
            {notification && (
                <Alert variant={notification.type} onClose={() => setNotification(null)} dismissible>
                    {notification.message}
                </Alert>
            )}

            {/* stats */}
            <div className="stats-cards">
                <div className="stat-card"><div className="stat-icon">💳</div><div>{grouped.notEnrolled.length}</div><div>{t('children.notEnrolled')}</div></div>
                <div className="stat-card"><FaClock /><div>{grouped.pending.length}</div><div>{t('children.pending')}</div></div>
                <div className="stat-card"><FaCheckCircle /><div>{grouped.approved.length}</div><div>{t('children.approved')}</div></div>
            </div>

            {loading ? (
                <div className="loading-indicator">{t('general.loading')}</div>
            ) : (
                <>
                    {grouped.notEnrolled.length > 0 && (
                        <section>
                            <h2 className="section-title">{t('children.notEnrolled')}</h2>
                            <div className="cards-section">
                                {grouped.notEnrolled.map(child => (
                                    <ChildCard key={child.childId} child={child} kindergartens={kindergartens} handleEnroll={handleEnrollClick} t={t} i18n={i18n} />
                                ))}
                            </div>
                        </section>
                    )}

                    {grouped.pending.length > 0 && (
                        <section>
                            <h2 className="section-title">{t('children.pending')}</h2>
                            <table className="children-table">
                                <thead>
                                <tr><th>{t('children.childName')}</th><th>{t('children.birthDate')}</th><th>{t('children.kindergarten')}</th><th>{t('children.approvalStatus')}</th></tr>
                                </thead>
                                <tbody>
                                {grouped.pending.map(child => {
                                    const kg = kindergartens.find(k => k.kindergartenId === child.kindergartenId);
                                    return (
                                        <tr key={child.childId}>
                                            <td>{child.name}</td>
                                            <td>{new Date(child.birthDate).toLocaleDateString(i18n.language)}</td>
                                            <td>{kg?.name || '–'}</td>
                                            <td><span className="badge bg-warning text-dark">{t('children.waitingApproval')}</span></td>
                                        </tr>
                                    );
                                })}
                                </tbody>
                            </table>
                        </section>
                    )}

                    {grouped.approved.length > 0 && (
                        <section>
                            <h2 className="section-title">{t('children.registeredTitle')}</h2>
                            <table className="children-table">
                                <thead>
                                <tr>
                                    <th>{t('children.childName')}</th><th>{t('children.birthDate')}</th><th>{t('children.kindergarten')}</th>
                                    <th>{t('children.paymentStatus')}</th><th>{t('children.approvalStatus')}</th><th>{t('children.actions')}</th>
                                </tr>
                                </thead>
                                <tbody>
                                {grouped.approved.map(child => {
                                    const kg = kindergartens.find(k => k.kindergartenId === child.kindergartenId);
                                    return (
                                        <tr key={child.childId}>
                                            <td>{child.name}</td>
                                            <td>{new Date(child.birthDate).toLocaleDateString(i18n.language)}</td>
                                            <td>{kg?.name || '–'}</td>
                                            <td><span className="badge bg-success">250₪</span></td>
                                            <td><span className="badge bg-success">{t('children.approved')}</span></td>
                                            <td>
                                                <Button variant="outline-primary" size="sm" onClick={() => alert('Receipt')}>
                                                    <FiDownload /> {t('children.downloadReceipt')}
                                                </Button>
                                            </td>
                                        </tr>
                                    );
                                })}
                                </tbody>
                            </table>
                        </section>
                    )}
                </>
            )}

            {/* payment modal */}
            <Modal show={showPayment} onHide={resetPaymentModal} size="lg" centered>
                <Modal.Header closeButton><Modal.Title>{t('payment.title')}</Modal.Title></Modal.Header>
                <Modal.Body>
                    {paymentSuccess ? (
                        <div className="payment-success">
                            <div id="kindergarten-receipt">
                                <h3 className="text-center">{t('payment.successTitle')}</h3>
                                <p>{t('payment.childName')}: <strong>{selectedChild?.name}</strong></p>
                                <p>{t('payment.kindergarten')}: <strong>{selectedKindergarten?.name}</strong></p>
                                <p>{t('payment.amount')}: <strong>35 {t('payment.currency')}</strong></p>
                                <p>{t('payment.transactionId')}: <strong>TXN-{Date.now()}</strong></p>
                            </div>
                            <div className="d-flex justify-content-between mt-4">
                                <Button variant="success" onClick={() => alert('Download')}>{t('payment.downloadReceipt')}</Button>
                                <Button variant="primary" onClick={resetPaymentModal}>{t('payment.close')}</Button>
                            </div>
                        </div>
                    ) : (
                        <Form>
                            <div className="payment-summary mb-4">
                                <h5>{t('payment.summary')}</h5>
                                <p>{t('payment.child')}: <strong>{selectedChild?.name}</strong></p>
                                <p>{t('payment.kindergarten')}: <strong>{selectedKindergarten?.name}</strong></p>
                                <p>{t('payment.amount')}: <strong>35 {t('payment.currency')}</strong></p>
                            </div>

                            <Form.Group className="mb-3">
                                <Form.Label>{t('payment.cardDetails')}</Form.Label>
                                <div className="stripe-card-element">
                                    <CardElement options={{ hidePostalCode: true }} />
                                </div>
                            </Form.Group>

                            <div className="d-flex justify-content-between mt-4">
                                <Button variant="secondary" onClick={resetPaymentModal}>{t('payment.cancel')}</Button>
                                <Button variant="primary" onClick={processPayment} disabled={loading}>
                                    {loading ? <><Spinner animation="border" size="sm" className="me-2" />{t('payment.processing')}</> : t('payment.payNow')}
                                </Button>
                            </div>
                        </Form>
                    )}
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default Children;