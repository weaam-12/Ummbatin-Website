import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { getComplaints, updateComplaintStatus, respondToComplaint } from '../api';
import {
    Card,
    Table,
    Badge,
    Button,
    Modal,
    Form,
    Alert,
    Spinner,
    Container,
    Dropdown
} from 'react-bootstrap';
import {
    FiEdit,
    FiMessageSquare,
    FiX,
    FiCheck,
    FiImage,
    FiFilter,
    FiRefreshCw,
    FiMoreVertical
} from 'react-icons/fi';
import './AdminComplaints.css';

const AdminComplaints = () => {
    const { user } = useAuth();
    const [complaints, setComplaints] = useState([]);
    const [selectedComplaint, setSelectedComplaint] = useState(null);
    const [responseText, setResponseText] = useState('');
    const [notification, setNotification] = useState(null);
    const [filter, setFilter] = useState('all');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadComplaints();
    }, []);

    const loadComplaints = async () => {
        try {
            setLoading(true);
            const data = await getComplaints(null, true);
            setComplaints(data || []);
        } catch (error) {
            console.error('Error loading complaints:', error);
            setNotification({
                type: 'danger',
                message: 'Failed to load complaints: ' + (error.message || 'Unexpected error')
            });
        } finally {
            setLoading(false);
        }
    };

    const filteredComplaints = complaints.filter(complaint => {
        if (filter === 'all') return true;
        return complaint.status === filter;
    });

    const statusVariants = {
        SUBMITTED: 'primary',
        IN_PROGRESS: 'warning',
        RESOLVED: 'success',
        REJECTED: 'danger'
    };

    const statusLabels = {
        SUBMITTED: 'Received',
        IN_PROGRESS: 'In Progress',
        RESOLVED: 'Resolved',
        REJECTED: 'Rejected'
    };

    const handleStatusChange = async (complaintId, newStatus) => {
        try {
            await updateComplaintStatus(complaintId, newStatus);
            setNotification({
                type: 'success',
                message: 'Complaint status updated successfully'
            });
            loadComplaints();
        } catch (error) {
            console.error('Error updating status:', error);
            setNotification({
                type: 'danger',
                message: 'Failed to update status: ' + (error.message || 'Unexpected error')
            });
        }
    };

    const handleSubmitResponse = async () => {
        if (!selectedComplaint || !responseText) return;

        try {
            await respondToComplaint(selectedComplaint.complaintId, responseText);
            setNotification({
                type: 'success',
                message: 'Response submitted successfully'
            });
            setSelectedComplaint(null);
            setResponseText('');
            loadComplaints();
        } catch (error) {
            console.error('Error submitting response:', error);
            setNotification({
                type: 'danger',
                message: 'Failed to submit response: ' + (error.message || 'Unexpected error')
            });
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '--';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US');
    };

    return (
        <Container className="admin-complaints-container py-4">
            <Card className="shadow-sm">
                <Card.Header className="text-white d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center">
                        <h4 className="mb-0 fw-bold">
                            <FiMessageSquare className="me-2" />
                            إدارة الشكاوى
                        </h4>
                    </div>
                    <div className="d-flex align-items-center">
                        <Button
                            variant="light"
                            className="me-3 d-flex align-items-center"
                            onClick={loadComplaints}
                        >
                            <FiRefreshCw className={loading ? "refresh-animation me-1" : "me-1"} />
                            تحديث
                        </Button>
                        <div className="d-flex align-items-center bg-white rounded px-2 py-1">
                            <FiFilter className="me-2 text-primary" />
                            <Form.Select
                                size="sm"
                                className="border-0 shadow-none"
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                            >
                                <option value="all">الكل</option>
                                <option value="SUBMITTED">مستلمة</option>
                                <option value="IN_PROGRESS">قيد المعالجة</option>
                                <option value="RESOLVED">تم الحل</option>
                                <option value="REJECTED">مرفوضة</option>
                            </Form.Select>
                        </div>
                    </div>
                </Card.Header>

                <Card.Body>
                    {notification && (
                        <Alert
                            variant={notification.type}
                            onClose={() => setNotification(null)}
                            dismissible
                            className="border-0"
                        >
                            <div className="d-flex align-items-center">
                                {notification.type === 'success' ?
                                    <FiCheck className="me-2" /> :
                                    <FiX className="me-2" />
                                }
                                {notification.message}
                            </div>
                        </Alert>
                    )}

                    {loading ? (
                        <div className="text-center py-5">
                            <Spinner animation="border" variant="primary" />
                            <p className="mt-3 text-muted">جاري تحميل الشكاوى...</p>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <Table hover className="mb-0">
                                <thead>
                                <tr>
                                    <th>رقم التذكرة</th>
                                    <th>النوع</th>
                                    <th>الوصف</th>
                                    <th>الموقع</th>
                                    <th>الحالة</th>
                                    <th>التاريخ</th>
                                    <th>الرد</th>
                                    <th>الصورة</th>
                                    <th>الإجراءات</th>
                                </tr>
                                </thead>
                                <tbody>
                                {filteredComplaints.length > 0 ? (
                                    filteredComplaints.map(complaint => (
                                        <tr key={complaint.complaintId}>
                                            <td className="fw-semibold">#{complaint.ticketNumber || '--'}</td>
                                            <td>{complaint.type || '--'}</td>
                                            <td className="text-truncate">
                                                {complaint.description || '--'}
                                            </td>
                                            <td>{complaint.location || '--'}</td>
                                            <td>
                                                <Badge
                                                    pill
                                                    bg={statusVariants[complaint.status]}
                                                    className="px-3 py-2"
                                                >
                                                    {statusLabels[complaint.status]}
                                                </Badge>
                                            </td>
                                            <td>{formatDate(complaint.date)}</td>
                                            <td className="text-truncate">
                                                {complaint.response || 'لا يوجد رد'}
                                            </td>
                                            <td>
                                                {complaint.imageUrl && (
                                                    <Button
                                                        variant="link"
                                                        size="sm"
                                                        className="text-primary p-0"
                                                        onClick={() => window.open(complaint.imageUrl, '_blank')}
                                                    >
                                                        <FiImage size={18} />
                                                    </Button>
                                                )}
                                            </td>
                                            <td>
                                                <Button
                                                    variant="outline-primary"
                                                    size="sm"
                                                    className="btn-action"
                                                    onClick={() => setSelectedComplaint(complaint)}
                                                    title="الرد"
                                                >
                                                    <FiMessageSquare />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="9" className="text-center py-4">
                                            <div className="d-flex flex-column align-items-center text-muted">
                                                <FiMessageSquare size={48} className="mb-2 opacity-50" />
                                                لا توجد شكاوى لعرضها
                                            </div>
                                        </td>
                                    </tr>
                                )}
                                </tbody>
                            </Table>
                        </div>
                    )}
                </Card.Body>
            </Card>

            {/* Response Modal */}
            <Modal show={selectedComplaint !== null} onHide={() => setSelectedComplaint(null)} centered>
                <Modal.Header closeButton className="border-0 pb-0">
                    <Modal.Title className="fw-bold">
                        <FiEdit className="me-2" />
                        الرد على التذكرة #{selectedComplaint?.ticketNumber}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group>
                        <Form.Label className="fw-bold">نص الرد</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={5}
                            value={responseText}
                            onChange={(e) => setResponseText(e.target.value)}
                            placeholder="اكتب ردك هنا..."
                            className="mb-3"
                        />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer className="border-0">
                    <Button
                        variant="outline-secondary"
                        onClick={() => setSelectedComplaint(null)}
                        className="px-4"
                    >
                        <FiX className="me-1" /> إلغاء
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleSubmitResponse}
                        disabled={!responseText}
                        className="px-4"
                    >
                        <FiCheck className="me-1" /> إرسال الرد
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default AdminComplaints;