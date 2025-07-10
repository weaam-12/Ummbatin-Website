import './Children.css';
import React, { useState, useEffect } from 'react';

const Children = () => {
    const mockKindergartens = [
        { id: '1', name: 'גן הפרחים' },
        { id: '2', name: 'גן האדום' },
        { id: '3', name: 'גן אלון' },
        { id: '4', name: 'גן תמר' }
    ];

    const [children, setChildren] = useState([]);
    const [newChild, setNewChild] = useState({
        name: '',
        birthDate: '',
        kindergartenId: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        setLoading(true);
        setTimeout(() => {
            setChildren([
                { id: '1', name: 'אדם', birthDate: '2020-05-15', kindergartenId: '1' },
                { id: '2', name: 'מחמד', birthDate: '2019-11-22', kindergartenId: '3' }
            ]);
            setLoading(false);
        }, 1000);
    }, []);

    const handleChildChange = (e) => {
        setNewChild({ ...newChild, [e.target.name]: e.target.value });
    };

    const handleAddChild = () => {
        if (!newChild.name || !newChild.birthDate) {
            setError('נא למלא את כל השדות החובה');
            return;
        }
        const childToAdd = { ...newChild, id: Date.now().toString() };
        setChildren([...children, childToAdd]);
        setNewChild({ name: '', birthDate: '', kindergartenId: '' });
        setError(null);
    };

    const handleDeleteChild = (childId) => {
        setChildren(children.filter(child => child.id !== childId));
    };

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
        return new Date(dateString).toLocaleDateString('he-IL', options);
    };

    if (loading) {
        return (
            <div className="loader">
                <div className="spinner"></div>
                <p>טוען נתונים...</p>
            </div>
        );
    }

    return (
        <div className="children-page" dir="rtl">
            <h2 className="page-title">ניהול ילדים</h2>

            <div className="card">
                <h3 className="card-title">רישום ילד חדש</h3>

                {error && <div className="alert-error">{error}</div>}

                <div className="form-group">
                    <label>שם הילד *</label>
                    <input
                        type="text"
                        name="name"
                        value={newChild.name}
                        onChange={handleChildChange}
                    />
                </div>

                <div className="form-group">
                    <label>תאריך לידה *</label>
                    <input
                        type="date"
                        name="birthDate"
                        value={newChild.birthDate}
                        onChange={handleChildChange}
                    />
                </div>

                <div className="form-group">
                    <label>גן ילדים</label>
                    <select
                        name="kindergartenId"
                        value={newChild.kindergartenId}
                        onChange={handleChildChange}
                    >
                        <option value="">בחר גן ילדים</option>
                        {mockKindergartens.map(k => (
                            <option key={k.id} value={k.id}>{k.name}</option>
                        ))}
                    </select>
                </div>

                <button
                    onClick={handleAddChild}
                    className="btn-primary"
                    disabled={!newChild.name || !newChild.birthDate}
                >
                    הוסף ילד
                </button>
            </div>

            <div className="card">
                <h3 className="card-title">ילדים רשומים</h3>

                {children.length === 0 ? (
                    <div className="empty-state">
                        <p>לא נמצאו ילדים רשומים</p>
                        <p>ניתן להוסיף ילד חדש באמצעות הטופס למעלה</p>
                    </div>
                ) : (
                    <div className="children-list">
                        {children.map(child => {
                            const kindergarten = mockKindergartens.find(k => k.id === child.kindergartenId);
                            return (
                                <div key={child.id} className="child-item">
                                    <div className="child-info">
                                        <h4>{child.name}</h4>
                                        <p>תאריך לידה: {formatDate(child.birthDate)}</p>
                                        <p>גן: {kindergarten?.name || 'לא רשום'}</p>
                                    </div>
                                    <button onClick={() => handleDeleteChild(child.id)} className="btn-delete">
                                        הסר מהרשימה
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Children;
