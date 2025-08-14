import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axiosInstance from '../api';
import { useAuth } from '../AuthContext';
import { FaChild, FaCheckCircle, FaMoneyBillWave, FaClock } from 'react-icons/fa';
import { FiDownload } from 'react-icons/fi';
import './Children.css';
import {
    Card, Button, Alert, Spinner, Container, Modal, Form, Row, Col
} from 'react-bootstrap';
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
                    <p>
                        {t('children.selectedKindergarten')}: <strong>{kg.name}</strong>
                    </p>
                    <p>
                        {t('children.monthlyFees')}:{' '}
                        <strong>35 {t('general.currency')}</strong>
                    </p>
                    <p>
                        {t('children.availableSlots')}: <strong>19</strong>
                    </p>
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
    const [children, setChildren] = useState([]);
    const [kindergartens, setKindergartens] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showPayment, setShowPayment] = useState(false);
    const [selectedChild, setSelectedChild] = useState(null);
    const [selectedKindergarten, setSelectedKindergarten] = useState(null);
    const [paymentSuccess, setPaymentSuccess] = useState(false);
    const [receipt, setReceipt] = useState(null);
    const [cardData, setCardData] = useState({
        number: '',
        name: '',
        expiry: '',
        cvc: ''
    });
    const [notification, setNotification] = useState(null);

    // ----------  load data  ----------
    const loadData = async () => {
        setLoading(true);
        try {
            const [kgs, childrenRes] = await Promise.all([
                axiosInstance.get('/api/kindergartens'),
                axiosInstance.get('/api/children/my-children')
            ]);
            setKindergartens(kgs.data);
            setChildren(childrenRes.data);
        } catch (error) {
            console.error('Error loading data', error);
            setError(t('children.loadError'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) loadData();
    }, [user]);

    // ----------  helpers  ----------
    const handleDownloadReceipt = () => {
        setLoading(true);
        const element = document.getElementById('kindergarten-receipt');
        html2canvas(element, { scale: 2 }).then((canvas) => {
            const pdf = new jsPDF('p', 'mm', 'a4');
            const w = pdf.internal.pageSize.getWidth();
            const h = (canvas.height * w) / canvas.width;
            pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, w, h);
            pdf.save(`receipt-${selectedChild.name}-${new Date().toLocaleDateString()}.pdf`);
            setLoading(false);
        }).catch(() => {
            setNotification({ type: 'danger', message: t('payment.pdfError') });
            setLoading(false);
        });
    };

    const generateReceipt = (child, kindergarten) => {
        setLoading(true);
        const receiptData = {
            paymentId: `RCPT-${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
            amount: 250,
            paymentDate: new Date().toISOString(),
            childName: child.name,
            kindergartenName: kindergarten?.name || t('children.unknownKindergarten')
        };

        const element = document.createElement('div');
        element.innerHTML = `
            <div id="temp-receipt" style="padding:20px;font-family:Arial">
                <h2 style="text-align:center">${t('payment.receipt')}</h2><hr>
                <div style="margin-bottom:15px">
                    <strong>${t('payment.childName')}:</strong> ${receiptData.childName}
                </div>
                <div style="margin-bottom:15px">
                    <strong>${t('payment.kindergarten')}:</strong> ${receiptData.kindergartenName}
                </div>
                <div style="margin-bottom:15px">
                    <strong>${t('payment.amount')}:</strong> 250₪
                </div>
                <div style="margin-bottom:15px">
                    <strong>${t('payment.paymentDate')}:</strong> ${new Date(receiptData.paymentDate).toLocaleString()}
                </div>
                <div style="margin-bottom:15px">
                    <strong>${t('payment.transactionId')}:</strong> ${receiptData.paymentId}
                </div>
                <hr><p style="text-align:center;font-style:italic">${t('payment.thankYou')}</p>
            </div>
        `;
        document.body.appendChild(element);

        html2canvas(element.querySelector('#temp-receipt'), { scale: 2 })
            .then(canvas => {
                const pdf = new jsPDF('p', 'mm', 'a4');
                const w = pdf.internal.pageSize.getWidth();
                const h = (canvas.height * w) / canvas.width;
                pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, w, h);
                pdf.save(`receipt-${child.name}-${new Date().toLocaleDateString()}.pdf`);
                document.body.removeChild(element);
                setLoading(false);
            })
            .catch(() => {
                document.body.removeChild(element);
                setNotification({ type: 'danger', message: t('payment.pdfError') });
                setLoading(false);
            });
    };

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
        setReceipt(null);
    };

    const resetPaymentModal = () => {
        setShowPayment(false);
        setPaymentSuccess(false);
        setCardData({ number: '', name: '', expiry: '', cvc: '' });
    };

    // ----------  card input formatter  ----------
    const handleCardInput = e => {
        const { name, value } = e.target;
        if (name === 'number') {
            const v = value.replace(/\s+/g, '').replace(/(\d{4})/g, '$1 ').trim();
            setCardData({ ...cardData, [name]: v });
        } else if (name === 'expiry') {
            const v = value.replace(/\D/g, '').replace(/(\d{2})(\d{0,2})/, '$1/$2');
            setCardData({ ...cardData, [name]: v });
        } else if (name === 'cvc') {
            const v = value.replace(/\D/g, '').substring(0, 3);
            setCardData({ ...cardData, [name]: v });
        } else {
            setCardData({ ...cardData, [name]: value });
        }
    };

    // ----------  payment processor  ----------
    const processPayment = async () => {
        setLoading(true);
        try {
            await axiosInstance.post('/api/payments/create-kindergarten', {
                childId: selectedChild.childId,
                kindergartenId: selectedKindergarten.kindergartenId,
                amount: 3500, // 35 USD in cents
                userId: user.userId
            });
            // بعد الدفع يصبح monthlyFee = 2.5 (انتظار)
            await axiosInstance.patch(`/api/children/${selectedChild.childId}/approve`, null, {
                params: { approved: false }
            });
            setPaymentSuccess(true);
            setNotification({ type: 'success', message: t('payment.successMessage') });
            await reloadChildren();
        } catch (error) {
            setNotification({
                type: 'danger',
                message: error.response?.data?.message || t('payment.generalError')
            });
        } finally {
            setLoading(false);
        }
    };

    // ----------  group children  ----------
    const grouped = {
        needsPayment: children.filter(c => c.monthlyFee === 1.5),
        pending:      children.filter(c => c.monthlyFee === 2.5),
        approved:     children.filter(c => c.monthlyFee === 3.5)
    };

    if (!user) return (
        <div className="auth-error">
            <h3>{t('auth.loginRequired')}</h3>
            <button onClick={() => window.location.href = '/login'}>{t('auth.login')}</button>
        </div>
    );

    return (
        <div className={`children-page modern ${i18n.language}`} dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
            <h1 className="page-title">👶 {t('children.myChildren')}</h1>

            {loading && <div className="loading-indicator">{t('general.loading')}</div>}
            {error && <div className="error-message">{error}</div>}
            {notification && (
                <Alert variant={notification.type} onClose={() => setNotification(null)} dismissible>
                    {notification.message}
                </Alert>
            )}

            {/* ----------  stats  ---------- */}
            <div className="stats-cards">
                <div className="stat-card">
                    <div className="stat-icon">💳</div>
                    <div className="stat-value">{grouped.needsPayment.length}</div>
                    <div className="stat-label">{t('children.needsPayment')}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon"><FaClock/></div>
                    <div className="stat-value">{grouped.pending.length}</div>
                    <div className="stat-label">{t('children.pending')}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon"><FaCheckCircle/></div>
                    <div className="stat-value">{grouped.approved.length}</div>
                    <div className="stat-label">{t('children.approved')}</div>
                </div>
            </div>

            {/* ----------  needs payment  ---------- */}
            {grouped.needsPayment.length > 0 && (
                <section>
                    <h2 className="section-title">{t('children.needsPayment')}</h2>
                    <div className="cards-section">
                        {grouped.needsPayment.map(child => (
                            <ChildCard
                                key={child.childId}
                                child={child}
                                kindergartens={kindergartens}
                                handleEnroll={handleEnrollClick}
                                t={t}
                                i18n={i18n}
                            />
                        ))}
                    </div>
                </section>
            )}

            {/* ----------  pending  ---------- */}
            {grouped.pending.length > 0 && (
                <section>
                    <h2 className="section-title">{t('children.pending')}</h2>
                    <table className="children-table">
                        <thead>
                        <tr>
                            <th>{t('children.childName')}</th>
                            <th>{t('children.birthDate')}</th>
                            <th>{t('children.kindergarten')}</th>
                            <th>{t('children.status')}</th>
                        </tr>
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

            {/* ----------  approved  ---------- */}
            {grouped.approved.length > 0 && (
                <section>
                    <h2 className="section-title">{t('children.registeredTitle')}</h2>
                    <table className="children-table">
                        <thead>
                        <tr>
                            <th>{t('children.childName')}</th>
                            <th>{t('children.birthDate')}</th>
                            <th>{t('children.kindergarten')}</th>
                            <th>{t('children.paymentStatus')}</th>
                            <th>{t('children.actions')}</th>
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
                                    <td><span className="badge bg-success">{t('children.paid')} 250₪</span></td>
                                    <td>
                                        <Button variant="outline-primary" size="sm" onClick={() => generateReceipt(child, kg)}>
                                            <FiDownload/> {t('children.downloadReceipt')}
                                        </Button>
                                    </td>
                                </tr>
                            );
                        })}
                        </tbody>
                    </table>
                </section>
            )}

            {/* ----------  payment modal  ---------- */}
            <Modal show={showPayment} onHide={resetPaymentModal} size="lg" centered>
                <Modal.Header closeButton>
                    <Modal.Title>{t('payment.title')}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {paymentSuccess ? (
                        <div className="payment-success">
                            <div id="kindergarten-receipt" className="receipt-details">
                                <div className="text-center mb-4">
                                    <FaCheckCircle className="text-success" size={48}/>
                                    <h3 className="mt-2">{t('payment.successTitle')}</h3>
                                </div>
                                <h4 className="mb-3">{t('payment.receiptDetails')}</h4>
                                <div className="receipt-item">
                                    <span>{t('payment.childName')}:</span><strong>{selectedChild?.name}</strong>
                                </div>
                                <div className="receipt-item">
                                    <span>{t('payment.kindergarten')}:</span><strong>{selectedKindergarten?.name}</strong>
                                </div>
                                <div className="receipt-item">
                                    <span>{t('payment.amount')}:</span><strong>35 {t('payment.currency')}</strong>
                                </div>
                                <div className="receipt-item">
                                    <span>{t('payment.paymentDate')}:</span><strong>{new Date().toLocaleString()}</strong>
                                </div>
                                <div className="receipt-item">
                                    <span>{t('payment.transactionId')}:</span><strong>{receipt?.paymentId}</strong>
                                </div>
                            </div>
                            <div className="d-flex justify-content-between mt-4">
                                <Button variant="success" onClick={handleDownloadReceipt}>{t('payment.downloadReceipt')}</Button>
                                <Button variant="primary" onClick={resetPaymentModal}>{t('payment.close')}</Button>
                            </div>
                        </div>
                    ) : (
                        <Form>
                            <div className="payment-summary mb-4">
                                <h5>{t('payment.summary')}</h5>
                                <div className="summary-item">
                                    <span>{t('payment.child')}:</span><strong>{selectedChild?.name}</strong>
                                </div>
                                <div className="summary-item">
                                    <span>{t('payment.kindergarten')}:</span><strong>{selectedKindergarten?.name}</strong>
                                </div>
                                <div className="summary-item">
                                    <span>{t('payment.amount')}:</span><strong>35 {t('payment.currency')}</strong>
                                </div>
                            </div>

                            <Form.Group className="mb-3">
                                <Form.Label>{t('payment.cardDetails')}</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="number"
                                    placeholder="1234 5678 9012 3456"
                                    value={cardData.number}
                                    onChange={handleCardInput}
                                    maxLength={19}
                                />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>{t('payment.cardName')}</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="name"
                                    placeholder={t('payment.cardNamePlaceholder')}
                                    value={cardData.name}
                                    onChange={handleCardInput}
                                />
                            </Form.Group>

                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>{t('payment.cardExpiry')}</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="expiry"
                                            placeholder="MM/YY"
                                            value={cardData.expiry}
                                            onChange={handleCardInput}
                                            maxLength={5}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>{t('payment.cardCvv')}</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="cvc"
                                            placeholder="123"
                                            value={cardData.cvc}
                                            onChange={handleCardInput}
                                            maxLength={3}
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>

                            <div className="d-flex justify-content-between mt-4">
                                <Button variant="secondary" onClick={resetPaymentModal}>{t('payment.cancel')}</Button>
                                <Button variant="primary" onClick={processPayment} disabled={loading}>
                                    {loading ? (
                                        <>
                                            <Spinner animation="border" size="sm" className="me-2"/>
                                            {t('payment.processing')}
                                        </>
                                    ) : (
                                        t('payment.payNow')
                                    )}
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