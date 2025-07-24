import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { submitComplaint, getComplaints } from '../api';
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
        SUBMITTED: 'Received',
        IN_PROGRESS: 'In Progress',
        RESOLVED: 'Resolved',
        REJECTED: 'Rejected'
    };

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
                message: 'Failed to load complaints: ' + (error.message || 'Unexpected error')
            });
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

    export const submitComplaint = async ({ userId, type, description, location, image }) => {
        const formData = new FormData();
        formData.append('data', new Blob([JSON.stringify({ userId, type, description, location })], {
            type: 'application/json'
        }));
        if (image) formData.append('image', image);

        const { data } = await axios.post(`${BASE_URL}/api/complaints`, formData, {
            headers: { 'Content-Type': undefined } // يترك المتصفح يحدد الحدود
        });
        return data;
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
                    <h4 className="mb-0">My Complaints</h4>
                    <Button
                        variant="light"
                        onClick={() => setShowForm(true)}
                        disabled={isSubmitting}
                    >
                        <FiPlus className="me-1" /> New Complaint
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
                            <p className="mt-3">Loading your complaints...</p>
                        </div>
                    ) : complaints.length > 0 ? (
                        <Table striped bordered hover responsive>
                            <thead className="table-light">
                            <tr>
                                <th>Ticket #</th>
                                <th>Type</th>
                                <th>Description</th>
                                <th>Location</th>
                                <th>Status</th>
                                <th>Date</th>
                                <th>Response</th>
                                <th>Image</th>
                            </tr>
                            </thead>
                            <tbody>
                            {complaints.map(complaint => (
                                <tr key={complaint.complaintId}>
                                    <td>{complaint.ticketNumber || '--'}</td>
                                    <td>{complaint.type || '--'}</td>
                                    <td>{complaint.description || '--'}</td>
                                    <td>{complaint.location || '--'}</td>
                                    <td>
                                        <Badge bg={statusVariants[complaint.status]}>
                                            {statusLabels[complaint.status] || complaint.status}
                                        </Badge>
                                    </td>
                                    <td>{formatDate(complaint.date)}</td>
                                    <td>{complaint.response || 'No response yet'}</td>
                                    <td>
                                        {complaint.imageUrl && (
                                            <Button
                                                variant="link"
                                                size="sm"
                                                onClick={() => window.open(complaint.imageUrl, '_blank')}
                                            >
                                                <FiImage /> View
                                            </Button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </Table>
                    ) : (
                        <div className="text-center py-5">
                            <p className="text-muted">No complaints found</p>
                            <Button variant="primary" onClick={() => setShowForm(true)}>
                                <FiPlus className="me-1" /> Submit Your First Complaint
                            </Button>
                        </div>
                    )}
                </Card.Body>
            </Card>

            {/* Complaint Form Modal */}
            <Modal show={showForm} onHide={() => setShowForm(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>New Complaint</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>Complaint Type</Form.Label>
                            <Form.Select
                                name="type"
                                value={formData.type}
                                onChange={handleInputChange}
                                required
                                disabled={isSubmitting}
                            >
                                <option value="">Select complaint type</option>
                                <option value="Infrastructure">Infrastructure</option>
                                <option value="Cleanliness">Cleanliness</option>
                                <option value="Safety">Safety</option>
                                <option value="Other">Other</option>
                            </Form.Select>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Description</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={5}
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                required
                                disabled={isSubmitting}
                                placeholder="Please describe the problem in detail"
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Location</Form.Label>
                            <Form.Control
                                type="text"
                                name="location"
                                value={formData.location}
                                onChange={handleInputChange}
                                required
                                disabled={isSubmitting}
                                placeholder="Example: Building A, 2nd floor near elevator"
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Upload Image (Optional)</Form.Label>
                            <Form.Control
                                type="file"
                                name="image"
                                onChange={handleFileChange}
                                accept="image/*"
                                disabled={isSubmitting}
                            />
                            {formData.image && (
                                <div className="mt-2 small text-muted">
                                    Selected: {formData.image.name}
                                </div>
                            )}
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowForm(false)} disabled={isSubmitting}>
                        <FiX /> Cancel
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
                                Submitting...
                            </>
                        ) : (
                            <>
                                <FiCheck /> Submit Complaint
                            </>
                        )}
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default Complaints;