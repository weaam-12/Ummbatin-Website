import React, { useState } from 'react';

const Forms = ({ onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
        type: '',
        description: '',
        location: '',
        image: null
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleImageChange = (e) => {
        setFormData({ ...formData, image: e.target.files[0] });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="complaint-form">
            <h3>טופס דיווח בעיה</h3>

            <div className="form-group">
                <label>סוג הבעיה:</label>
                <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    required
                >
                    <option value="">בחר סוג בעיה</option>
                    <option value="תשתיות">תשתיות</option>
                    <option value="ניקיון">ניקיון</option>
                    <option value="בטיחות">בטיחות</option>
                    <option value="אחר">אחר</option>
                </select>
            </div>

            <div className="form-group">
                <label>תיאור הבעיה:</label>
                <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                />
            </div>

            <div className="form-group">
                <label>מיקום:</label>
                <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    required
                />
            </div>

            <div className="form-group">
                <label>העלאת תמונה (אופציונלי):</label>
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                />
            </div>

            <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={onCancel}>
                    ביטול
                </button>
                <button type="submit" className="btn-primary">
                    שלח דיווח
                </button>
            </div>
        </form>
    );
};

export default Forms;