import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { submitComplaint, getComplaints } from '../api';
import './Complaints.css';

const Complaints = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [complaints, setComplaints] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [notification, setNotification] = useState(null);
    const [formData, setFormData] = useState({
        type: '',
        description: '',
        location: '',
        image: null
    });

    useEffect(() => {
        if (!user) {
            navigate('/login');
        } else {
            loadComplaints();
        }
    }, [user, navigate]);

    const loadComplaints = async () => {
        try {
            const data = await getComplaints(user.id);
            setComplaints(data);
        } catch (error) {
            console.error('Failed to load complaints:', error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleFileChange = (e) => {
        setFormData({
            ...formData,
            image: e.target.files[0]
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const complaintData = new FormData();
            complaintData.append('type', formData.type);
            complaintData.append('description', formData.description);
            complaintData.append('location', formData.location);
            if (formData.image) {
                complaintData.append('image', formData.image);
            }
            complaintData.append('userId', user.id);

            const response = await submitComplaint(complaintData);

            setComplaints([...complaints, response]);
            setNotification({
                type: 'success',
                message: `הדיווח התקבל בהצלחה! מספר פניה: ${response.ticketNumber}`
            });
            setShowForm(false);
            setFormData({ type: '', description: '', location: '', image: null });

            setTimeout(() => setNotification(null), 5000);
        } catch (error) {
            setNotification({
                type: 'error',
                message: 'שגיאה בשליחת התלונה: ' + (error.message || 'נסה שוב מאוחר יותר')
            });
            console.error('Submission error:', error);
        }
    };

    return (
        <div className="complaints-container" dir="rtl">
            <h1>מערכת תלונות</h1>

            {notification && (
                <div className={`notification ${notification.type}`}>
                    {notification.message}
                </div>
            )}

            <button
                className="btn-primary"
                onClick={() => setShowForm(true)}
            >
                דווח על בעיה חדשה
            </button>

            {showForm && (
                <form onSubmit={handleSubmit} className="complaint-form">
                    <div className="form-group">
                        <label htmlFor="type">סוג הבעיה:</label>
                        <select
                            id="type"
                            name="type"
                            value={formData.type}
                            onChange={handleInputChange}
                            required
                        >
                            <option value="">בחר סוג בעיה</option>
                            <option value="תשתיות">תשתיות</option>
                            <option value="ניקיון">ניקיון</option>
                            <option value="בטיחות">בטיחות</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="description">תיאור הבעיה:</label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            required
                            rows="4"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="location">מיקום:</label>
                        <input
                            type="text"
                            id="location"
                            name="location"
                            value={formData.location}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="image">העלאת תמונה (אופציונלי):</label>
                        <input
                            type="file"
                            id="image"
                            name="image"
                            onChange={handleFileChange}
                            accept="image/*"
                        />
                    </div>

                    <div className="form-actions">
                        <button
                            type="button"
                            className="btn-secondary"
                            onClick={() => {
                                setShowForm(false);
                                setFormData({ type: '', description: '', location: '', image: null });
                            }}
                        >
                            ביטול
                        </button>
                        <button
                            type="submit"
                            className="btn-primary"
                            disabled={!formData.type || !formData.description || !formData.location}
                        >
                            שלח דיווח
                        </button>
                    </div>
                </form>
            )}

            <div className="complaints-list">
                <h2>התלונות שלי</h2>
                {complaints.length > 0 ? (
                    <ul>
                        {complaints.map(complaint => (
                            <li key={complaint.id}>
                                <h3>{complaint.type}</h3>
                                <p>{complaint.description}</p>
                                <p>מיקום: {complaint.location}</p>
                                <p>מספר פניה: {complaint.ticketNumber}</p>
                                <p>סטטוס: {complaint.status}</p>
                                {complaint.imageUrl && (
                                    <img src={complaint.imageUrl} alt="תלונה" className="complaint-image" />
                                )}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>לא נמצאו תלונות</p>
                )}
            </div>
        </div>
    );
};

export default Complaints;