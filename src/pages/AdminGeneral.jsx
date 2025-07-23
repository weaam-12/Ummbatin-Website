import React, { useState, useEffect } from 'react';
import {
    Container, Row, Col, Card, Button, Table, Form, Alert, Spinner, Badge
} from 'react-bootstrap';
import { FiUsers, FiDollarSign } from 'react-icons/fi';
import { axiosInstance } from '../api';

const AdminGeneral = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [users, setUsers] = useState([]);
    const [payments, setPayments] = useState([]);
    const [bulkPayments, setBulkPayments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState(null);

    const getAllUsers = async () => {
        const response = await axiosInstance.get('api/users/all');
        return response.data;
    };

    const getCurrentMonthPayments = async () => {
        const now = new Date();
        const response = await axiosInstance.get('api/payments/current-month', {
            params: {
                month: now.getMonth() + 1,
                year: now.getFullYear(),
            },
        });
        return response.data;
    };

    const loadData = async () => {
        setLoading(true);
        try {
            const [usersRes, paymentsRes] = await Promise.all([
                getAllUsers(),
                getCurrentMonthPayments().catch(() => []),
            ]);
            setUsers(usersRes);
            setPayments(paymentsRes);

            const initialized = usersRes.map(user => ({
                userId: user.userId,
                fullName: user.fullName,
                waterAmount: '',
                arnonaAmount: '',
            }));
            setBulkPayments(initialized);
        } catch {
            setNotification({ type: 'danger', message: 'فشل في تحميل البيانات' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const formatPaymentStatus = (status) => {
        switch (status) {
            case 'PAID': return { text: 'مدفوع', variant: 'success' };
            case 'PENDING': return { text: 'قيد الانتظار', variant: 'warning' };
            case 'FAILED': return { text: 'فشل', variant: 'danger' };
            default: return { text: status, variant: 'secondary' };
        }
    };

    const handleSubmitUserPayment = async (row) => {
        setLoading(true);
        try {
            if (row.waterAmount) {
                await axiosInstance.post('api/payments/create-water', null, {
                    params: {
                        userId: row.userId,
                        amount: row.waterAmount,
                    },
                });
            }
            if (row.arnonaAmount) {
                await axiosInstance.post('api/payments/create-arnona', null, {
                    params: {
                        userId: row.userId,
                        amount: row.arnonaAmount,
                    },
                });
            }
            setNotification({ type: 'success', message: `تم حفظ دفعات ${row.fullName}` });
            loadData();
        } catch (error) {
            setNotification({ type: 'danger', message: error.response?.data?.message || `فشل في حفظ دفعات ${row.fullName}` });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container fluid>
            {notification && (
                <Alert variant={notification.type} onClose={() => setNotification(null)} dismissible>
                    {notification.message}
                </Alert>
            )}

            <Row>
                <Col md={3} className="sidebar">
                    <div className="sidebar-header">
                        <h4>لوحة التحكم</h4>
                    </div>
                    <ul className="sidebar-menu">
                        <li className={activeTab === 'dashboard' ? 'active' : ''} onClick={() => setActiveTab('dashboard')}>
                            <FiUsers className="me-2" /> نظرة عامة
                        </li>
                        <li className={activeTab === 'payments' ? 'active' : ''} onClick={() => setActiveTab('payments')}>
                            <FiDollarSign className="me-2" /> إدارة الدفعات
                        </li>
                    </ul>
                </Col>

                <Col md={9} className="main-content">
                    {loading ? (
                        <div className="text-center py-5">
                            <Spinner animation="border" />
                        </div>
                    ) : activeTab === 'payments' ? (
                        <>
                            <h3 className="mb-4">دفعات الشهر الحالي</h3>
                            <Card className="mb-4">
                                <Card.Body>
                                    <Table striped hover responsive>
                                        <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>الاسم</th>
                                            <th>النوع</th>
                                            <th>المبلغ</th>
                                            <th>الحالة</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {payments.map((p, i) => (
                                            <tr key={p.paymentId}>
                                                <td>{i + 1}</td>
                                                <td>{p.user?.fullName}</td>
                                                <td>{p.type === 'WATER' ? 'مياه' : 'أرنونا'}</td>
                                                <td>{p.amount}</td>
                                                <td>
                                                    <Badge bg={formatPaymentStatus(p.status).variant}>
                                                        {formatPaymentStatus(p.status).text}
                                                    </Badge>
                                                </td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </Table>
                                </Card.Body>
                            </Card>

                            <Card>
                                <Card.Header>
                                    <h5>إدخال دفعات جديدة</h5>
                                </Card.Header>
                                <Card.Body>
                                    <Table responsive>
                                        <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>الاسم</th>
                                            <th>مياه (₪)</th>
                                            <th>أرنونا (₪)</th>
                                            <th>إجراء</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {bulkPayments.map((row, idx) => (
                                            <tr key={row.userId}>
                                                <td>{idx + 1}</td>
                                                <td>{row.fullName}</td>
                                                <td>
                                                    <Form.Control
                                                        type="number"
                                                        min="0"
                                                        value={row.waterAmount}
                                                        onChange={(e) => {
                                                            const updated = [...bulkPayments];
                                                            updated[idx].waterAmount = e.target.value;
                                                            setBulkPayments(updated);
                                                        }}
                                                    />
                                                </td>
                                                <td>
                                                    <Form.Control
                                                        type="number"
                                                        min="0"
                                                        value={row.arnonaAmount}
                                                        onChange={(e) => {
                                                            const updated = [...bulkPayments];
                                                            updated[idx].arnonaAmount = e.target.value;
                                                            setBulkPayments(updated);
                                                        }}
                                                    />
                                                </td>
                                                <td>
                                                    <Button
                                                        variant="primary"
                                                        size="sm"
                                                        onClick={() => handleSubmitUserPayment(row)}
                                                    >
                                                        حفظ
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </Table>
                                </Card.Body>
                            </Card>
                        </>
                    ) : (
                        <>
                            <h3 className="mb-4">نظرة عامة</h3>
                            <Row>
                                <Col md={6}>
                                    <Card className="stat-card">
                                        <Card.Body className="d-flex justify-content-between align-items-center">
                                            <div>
                                                <h6>عدد المستخدمين</h6>
                                                <h3>{users.length}</h3>
                                            </div>
                                            <FiUsers size={30} />
                                        </Card.Body>
                                    </Card>
                                </Col>
                                <Col md={6}>
                                    <Card className="stat-card">
                                        <Card.Body className="d-flex justify-content-between align-items-center">
                                            <div>
                                                <h6>عدد الدفعات</h6>
                                                <h3>{payments.length}</h3>
                                            </div>
                                            <FiDollarSign size={30} />
                                        </Card.Body>
                                    </Card>
                                </Col>
                            </Row>
                        </>
                    )}
                </Col>
            </Row>
        </Container>
    );
};

export default AdminGeneral;
