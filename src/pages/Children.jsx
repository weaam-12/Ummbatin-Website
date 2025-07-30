import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axiosInstance from '../api';
import { useAuth } from '../AuthContext';
import { FaChild, FaCheckCircle, FaMoneyBillWave } from 'react-icons/fa';
import './Children.css';
import {
    Card, Button, Alert, Spinner, Container, Modal, Form, Row, Col
} from 'react-bootstrap';
import { FiCreditCard, FiX } from 'react-icons/fi';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const ChildCard = ({ child, kindergartens, handleEnroll, t, i18n }) => {
    const [selectedKg, setSelectedKg] = useState('');
    const kg = kindergartens.find(k => String(k.kindergartenId) === selectedKg);

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
                        {kg.name}
                    </option>
                ))}
            </select>

            {selectedKg && kg && (
                <div className="payment-info">
                    <p>{t('children.selectedKindergarten')}: <strong>{kg.name}</strong></p>
                    <p>{t('children.monthlyFees')}: <strong>{"35"} {t('general.currency')}</strong></p>
                    <p>{t('children.availableSlots')}: <strong>{"19"}</strong></p>
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
    const [paymentSuccess, setPaymentSuccess] = useState(false);
    const [receipt, setReceipt] = useState(null);
    const [cardData, setCardData] = useState({
        number: '',
        name: '',
        expiry: '',
        cvc: ''
    });
    const [notification, setNotification] = useState(null);

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
        setSelectedChild(child);
        setSelectedKindergarten(kg);
        setShowPayment(true);
        setPaymentSuccess(false);
        setReceipt(null);
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

    const handleCardInput = (e) => {
        const { name, value } = e.target;
        if (name === 'number') {
            const v = value.replace(/\s+/g, '').replace(/(\d{4})/g, '$1 ').trim();
            setCardData({...cardData, [name]: v});
        }
        else if (name === 'expiry') {
            const v = value.replace(/\D/g, '').replace(/(\d{2})(\d{0,2})/, '$1/$2');
            setCardData({...cardData, [name]: v});
        }
        else if (name === 'cvc') {
            const v = value.replace(/\D/g, '').substring(0, 3);
            setCardData({...cardData, [name]: v});
        }
        else {
            setCardData({...cardData, [name]: value});
        }
    };

    const validateCard = () => {
        if (!/^\d{4}\s\d{4}\s\d{4}\s\d{4}$/.test(cardData.number)) {
            return t('payment.cardNumberError');
        }
        if (!/^\d{2}\/\d{2}$/.test(cardData.expiry)) {
            return t('payment.cardExpiryError');
        }
        if (!/^\d{3}$/.test(cardData.cvc)) {
            return t('payment.cardCvcError');
        }
        if (cardData.name.trim().length < 3) {
            return t('payment.cardNameError');
        }
        const [month, year] = cardData.expiry.split('/');
        const currentYear = new Date().getFullYear() % 100;
        const currentMonth = new Date().getMonth() + 1;
        if (parseInt(year) < currentYear ||
            (parseInt(year) === currentYear && parseInt(month) < currentMonth)) {
            return t('payment.cardExpiredError');
        }
        return null;
    };

    const processPayment = async () => {
        const validationError = validateCard();
        if (validationError) {
            setNotification({ type: 'danger', message: validationError });
            return;
        }

        setLoading(true);
        try {
            // 1. إنشاء الدفع
            const paymentResponse = await axiosInstance.post('/api/payments/create-kindergarten', {
                childId: selectedChild.childId,
                kindergartenId: selectedKindergarten.kindergartenId,
                amount: 35,
                userId: user.userId
            });

            // 2. تأكيد التسجيل
            await axiosInstance.post('/api/payments/enroll-child', {
                childId: selectedChild.childId,
                kindergartenId: selectedKindergarten.kindergartenId,
                paymentId: paymentResponse.data.paymentId
            });

            // 3. إنشاء الفاتورة
            setReceipt({
                paymentId: paymentResponse.data.paymentId,
                amount: 35,
                paymentDate: new Date().toISOString(),
                childName: selectedChild.name,
                kindergartenName: selectedKindergarten.name
            });

            setPaymentSuccess(true);
            setNotification({ type: 'success', message: t('payment.successMessage') });
            await reloadChildren();
        } catch (error) {
            console.error("Payment processing error:", error);
            setNotification({
                type: "danger",
                message: error.response?.data?.message || t('payment.generalError')
            });
        } finally {
            setLoading(false);
        }
    };

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

    const resetPaymentModal = () => {
        setShowPayment(false);
        setPaymentSuccess(false);
        setCardData({ number: '', name: '', expiry: '', cvc: '' });
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
            {notification && (
                <Alert variant={notification.type} onClose={() => setNotification(null)} dismissible>
                    {notification.message}
                </Alert>
            )}

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

            <Modal show={showPayment} onHide={resetPaymentModal} size="lg" centered>
                <Modal.Header closeButton>
                    <Modal.Title>{t('payment.title')}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {paymentSuccess && receipt ? (
                        <div className="payment-success">
                            <div id="kindergarten-receipt" className="receipt-details">
                                <div className="text-center mb-4">
                                    <FaCheckCircle className="text-success" size={48} />
                                    <h3 className="mt-2">{t('payment.successTitle')}</h3>
                                </div>

                                <h4 className="mb-3">{t('payment.receiptDetails')}</h4>
                                <div className="receipt-item">
                                    <span>{t('payment.childName')}:</span>
                                    <strong>{receipt.childName}</strong>
                                </div>
                                <div className="receipt-item">
                                    <span>{t('payment.kindergarten')}:</span>
                                    <strong>{receipt.kindergartenName}</strong>
                                </div>
                                <div className="receipt-item">
                                    <span>{t('payment.amount')}:</span>
                                    <strong>{"35"} {t('payment.currency')}</strong>
                                </div>
                                <div className="receipt-item">
                                    <span>{t('payment.paymentDate')}:</span>
                                    <strong>{new Date(receipt.paymentDate).toLocaleString()}</strong>
                                </div>
                                <div className="receipt-item">
                                    <span>{t('payment.transactionId')}:</span>
                                    <strong>{receipt.paymentId}</strong>
                                </div>
                            </div>

                            <div className="d-flex justify-content-between mt-4">
                                <Button variant="success" onClick={handleDownloadReceipt}>
                                    {t('payment.downloadReceipt')}
                                </Button>
                                <Button variant="primary" onClick={resetPaymentModal}>
                                    {t('payment.close')}
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="payment-summary mb-4">
                                <h5>{t('payment.summary')}</h5>
                                <div className="summary-item">
                                    <span>{t('payment.child')}:</span>
                                    <strong>{selectedChild?.name}</strong>
                                </div>
                                <div className="summary-item">
                                    <span>{t('payment.kindergarten')}:</span>
                                    <strong>{selectedKindergarten?.name}</strong>
                                </div>
                                <div className="summary-item">
                                    <span>{t('payment.amount')}:</span>
                                    <strong>{"35"} {t('payment.currency')}</strong>
                                </div>
                            </div>

                            <Form>
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
                                    <Button variant="secondary" onClick={resetPaymentModal}>
                                        {t('payment.cancel')}
                                    </Button>
                                    <Button
                                        variant="primary"
                                        onClick={processPayment}
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <>
                                                <Spinner animation="border" size="sm" className="me-2" />
                                                {t('payment.processing')}
                                            </>
                                        ) : (
                                            t('payment.payNow')
                                        )}
                                    </Button>
                                </div>
                            </Form>
                        </>
                    )}
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default Children;