import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { submitComplaint, getComplaints } from '../api';
import { useTranslation } from 'react-i18next'; // Add this import
import {
    Card,
    Button,
    Modal,
    Form,
    Alert,
    Badge,
    Table,
    Spinner,
    Container
} from 'react-bootstrap';
import { FiPlus, FiImage, FiX, FiCheck } from 'react-icons/fi';
import './Complaints.css';

const Complaints = () => {
    const { t } = useTranslation(); // Add this line
    const { user, getUserId } = useAuth();
    const navigate = useNavigate();
    const [complaints, setComplaints] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [notification, setNotification] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        type: '',
        description: '',
        location: '',
        image: null
    });

    const statusVariants = {
        SUBMITTED: 'primary',
        IN_PROGRESS: 'warning',
        RESOLVED: 'success',
        REJECTED: 'danger'
    };

    const statusLabels = {
        SUBMITTED: t('complaints.status.SUBMITTED'),
        IN_PROGRESS: t('complaints.status.IN_PROGRESS'),
        RESOLVED: t('complaints.status.RESOLVED'),
        REJECTED: t('complaints.status.REJECTED')
    };
    const complaintTypes = [
        { value: "uncollected", label: t("garbageComplaint.types.uncollected") },
        { value: "overflowing", label: t("garbageComplaint.types.overflowing") },
        { value: "damagedBin", label: t("garbageComplaint.types.damagedBin") },
        { value: "missingBin", label: t("garbageComplaint.types.missingBin") },
        { value: "illegalDumping", label: t("garbageComplaint.types.illegalDumping") },
        { value: "Infrastructure", label: t("complaints.complaintForm.types.Infrastructure") },
        { value: "Cleanliness", label: t("complaints.complaintForm.types.Cleanliness") },
        { value: "Safety", label: t("complaints.complaintForm.types.Safety") },
        { value: "Other", label: t("complaints.complaintForm.types.Other") },
    ];
    useEffect(() => {
        if (!user) {
            navigate('/login');
        } else {
            loadComplaints();
        }
    }, [user, navigate]);

    const loadComplaints = async () => {
        try {
            setLoading(true);
            const userId = getUserId();
            if (!userId) {
                throw new Error('User ID not available');
            }
            const data = await getComplaints(userId);
            setComplaints(data || []);
        } catch (error) {
            console.error('Error loading complaints:', error);
            setNotification({
                type: 'danger',
                message: t('complaints.error.loadError') + (error.message || t('common.error'))
            });
            if (error.isAuthError) {
                navigate('/login');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileChange = (e) => {
        setFormData(prev => ({
            ...prev,
            image: e.target.files[0]
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const userId = getUserId();
            if (!userId) {
                throw new Error('User ID not available');
            }

            const response = await submitComplaint({
                userId: userId,
                type: formData.type,
                description: formData.description,
                location: formData.location,
                image: formData.image
            });

            setComplaints(prev => [response, ...prev]);
            setNotification({
                type: 'success',
                message: `Complaint submitted successfully! Ticket #: ${response.ticketNumber}`
            });
            setShowForm(false);
            setFormData({ type: '', description: '', location: '', image: null });
        } catch (error) {
            console.error('Error submitting complaint:', error);
            setNotification({
                type: 'danger',
                message: 'Failed to submit complaint: ' +
                    (error.response?.data?.message || error.message || 'Please try again later')
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '--';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US');
    };

    return (
        <Container className="user-complaints-container py-4">
            <Card className="shadow-sm border-0">
                <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
                    <h4 className="mb-0">{t('complaints.myComplaints')}</h4>
                    <Button
                        variant="light"
                        onClick={() => setShowForm(true)}
                        disabled={isSubmitting}
                    >
                        <FiPlus className="me-1" /> {t('complaints.newComplaint')}
                    </Button>
                </Card.Header>

                <Card.Body>
                    {notification && (
                        <Alert variant={notification.type} onClose={() => setNotification(null)} dismissible>
                            {notification.message}
                        </Alert>
                    )}

                    {loading ? (
                        <div className="text-center py-5">
                            <Spinner animation="border" variant="primary" />
                            <p className="mt-3">{t('complaints.loading')}</p>
                        </div>
                    ) : complaints.length > 0 ? (
                        <Table striped bordered hover responsive>
                            <thead className="table-light">
                            <tr>
                                <th>{t('complaints.table.ticketNumber')}</th>
                                <th>{t('complaints.table.type')}</th>
                                <th>{t('complaints.table.description')}</th>
                                <th>{t('complaints.table.location')}</th>
                                <th>{t('complaints.table.status')}</th>
                                <th>{t('complaints.table.date')}</th>
                                <th>{t('complaints.table.response')}</th>
                                <th>{t('complaints.table.image')}</th>
                            </tr>
                            </thead>
                            <tbody>
                            {complaints.map(complaint => (
                                <tr key={complaint.complaintId}>
                                    <td>{complaint.ticketNumber || '--'}</td>
                                    <td>
                                        {(() => {
                                            const typeTranslation = complaintTypes.find(type => type.value === complaint.type);
                                            return typeTranslation ? typeTranslation.label : (complaint.type || '--');
                                        })()}
                                    </td>                                    <td>{complaint.description || '--'}</td>
                                    <td>{complaint.location || '--'}</td>
                                    <td>
                                        <Badge bg={statusVariants[complaint.status]}>
                                            {statusLabels[complaint.status] || complaint.status}
                                        </Badge>
                                    </td>
                                    <td>{formatDate(complaint.date)}</td>
                                    <td>{complaint.response || t('complaints.table.noResponse')}</td>
                                    <td>
                                        {complaint.imageUrl && (
                                            <Button
                                                variant="link"
                                                size="sm"
                                                onClick={() => window.open(complaint.imageUrl, '_blank')}
                                            >
                                                <FiImage /> {t('complaints.table.view')}
                                            </Button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </Table>
                    ) : (
                        <div className="text-center py-5">
                            <p className="text-muted">{t('complaints.noComplaints')}</p>
                            <Button variant="primary" onClick={() => setShowForm(true)}>
                                <FiPlus className="me-1" /> {t('complaints.submitFirstComplaint')}
                            </Button>
                        </div>
                    )}
                </Card.Body>
            </Card>

            {/* Complaint Form Modal */}
            <Modal show={showForm} onHide={() => setShowForm(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>{t('complaints.complaintForm.title')}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>{t('complaints.complaintForm.type')}</Form.Label>
                            <Form.Select
                                name="type"
                                value={formData.type}
                                onChange={handleInputChange}
                                required
                                disabled={isSubmitting}
                            >
                                <option value="">{t('complaints.complaintForm.selectType')}</option>
                                <option value="Infrastructure">{t('complaints.complaintForm.types.Infrastructure')}</option>
                                <option value="Cleanliness">{t('complaints.complaintForm.types.Cleanliness')}</option>
                                <option value="Safety">{t('complaints.complaintForm.types.Safety')}</option>
                                <option value="Other">{t('complaints.complaintForm.types.Other')}</option>
                            </Form.Select>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>{t('complaints.complaintForm.description')}</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={5}
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                required
                                disabled={isSubmitting}
                                placeholder={t('complaints.complaintForm.descriptionPlaceholder')}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>{t('complaints.complaintForm.location')}</Form.Label>
                            <Form.Control
                                type="text"
                                name="location"
                                value={formData.location}
                                onChange={handleInputChange}
                                required
                                disabled={isSubmitting}
                                placeholder={t('complaints.complaintForm.locationPlaceholder')}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>{t('complaints.complaintForm.image')}</Form.Label>
                            <Form.Control
                                type="file"
                                name="image"
                                onChange={handleFileChange}
                                accept="image/*"
                                disabled={isSubmitting}
                            />
                            {formData.image && (
                                <div className="mt-2 small text-muted">
                                    {t('common.selected')}: {formData.image.name}
                                </div>
                            )}
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowForm(false)} disabled={isSubmitting}>
                        <FiX /> {t('complaints.complaintForm.cancel')}
                    </Button>
                    <Button
                        variant="primary"
                        type="submit"
                        onClick={handleSubmit}
                        disabled={!formData.type || !formData.description || !formData.location || isSubmitting}
                    >
                        {isSubmitting ? (
                            <>
                                <Spinner animation="border" size="sm" className="me-2" />
                                {t('complaints.submitting')}
                            </>
                        ) : (
                            <>
                                <FiCheck /> {t('complaints.complaintForm.submit')}
                            </>
                        )}
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default Complaints;