import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import './Children.css';

const Children = () => {
    const { currentUser } = useAuth();
    const [children, setChildren] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [newChild, setNewChild] = useState({
        name: '',
        birthDate: '',
        kindergartenId: ''
    });

    useEffect(() => {
        if (currentUser?.userId) {
            const fetchChildren = async () => {
                try {
                    const response = await fetch(`/api/children/user/${currentUser.userId}`);
                    if (!response.ok) {
                        throw new Error('Failed to fetch children data');
                    }
                    const data = await response.json();
                    setChildren(data);
                } catch (err) {
                    setError(err.message);
                } finally {
                    setLoading(false);
                }
            };
            fetchChildren();
        } else {
            setLoading(false);
        }
    }, [currentUser]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewChild(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleAddChild = async () => {
        if (!newChild.name || !newChild.birthDate) {
            setError('Name and birth date are required');
            return;
        }

        try {
            setLoading(true);
            const response = await fetch('/api/children', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...newChild,
                    userId: currentUser.userId
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to add child');
            }

            const addedChild = await response.json();
            setChildren([...children, addedChild]);
            setNewChild({ name: '', birthDate: '', kindergartenId: '' });
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="loader">Loading...</div>;
    }

    if (error) {
        return <div className="error-message">Error: {error}</div>;
    }

    return (
        <div className="children-container">
            <h2>My Children</h2>

            <div className="add-child-form">
                <h3>Add New Child</h3>
                <div className="form-group">
                    <label>Name:</label>
                    <input
                        type="text"
                        name="name"
                        value={newChild.name}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Birth Date:</label>
                    <input
                        type="date"
                        name="birthDate"
                        value={newChild.birthDate}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <button
                    onClick={handleAddChild}
                    disabled={!newChild.name || !newChild.birthDate}
                >
                    Add Child
                </button>
            </div>

            <div className="children-list">
                {children.length === 0 ? (
                    <p>No children registered yet</p>
                ) : (
                    <ul>
                        {children.map(child => (
                            <li key={child.id} className="child-item">
                                <h3>{child.name}</h3>
                                <p>Birth Date: {new Date(child.birthDate).toLocaleDateString()}</p>
                                {child.kindergartenId && (
                                    <p>Kindergarten: {child.kindergartenId}</p>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default Children;