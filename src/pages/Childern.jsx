import '../components/styles/Children.css'

import React, { useState, useEffect } from 'react';
const Children = () => {
    // Mock kindergartens data
    const mockKindergartens = [
        { id: '1', name: 'גן הפרחים' },
        { id: '2', name: 'גן האדום' },
        { id: '3', name: 'גן אלון' },
        { id: '4', name: 'גן תמר' }
    ];

    // State for children data
    const [children, setChildren] = useState([]);
    const [newChild, setNewChild] = useState({
        name: '',
        birthDate: '',
        kindergartenId: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Load initial mock data
    useEffect(() => {
        setLoading(true);
        // Simulate API call with timeout
        setTimeout(() => {
            setChildren([
                {
                    id: '1',
                    name: 'אדם',
                    birthDate: '2020-05-15',
                    kindergartenId: '1'
                },
                {
                    id: '2',
                    name: 'מחמד',
                    birthDate: '2019-11-22',
                    kindergartenId: '3'
                }
            ]);
            setLoading(false);
        }, 1000);
    }, []);

    const handleChildChange = (e) => {
        setNewChild({ ...newChild, [e.target.name]: e.target.value });
    };

    const handleAddChild = () => {
        // Validate inputs
        if (!newChild.name || !newChild.birthDate) {
            setError('נא למלא את כל השדות החובה');
            return;
        }

        // Create new child with mock ID
        const childToAdd = {
            ...newChild,
            id: Date.now().toString() // Using timestamp as temporary ID
        };

        setChildren([...children, childToAdd]);
        setNewChild({ name: '', birthDate: '', kindergartenId: '' });
        setError(null);
    };

    const handleDeleteChild = (childId) => {
        setChildren(children.filter(child => child.id !== childId));
    };

    // Format date for display
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
        return new Date(dateString).toLocaleDateString('he-IL', options);
    };

    if (loading) {
        return (
            <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                <p className="mt-2">טוען נתונים...</p>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-4xl mx-auto" dir="rtl">
            <h2 className="text-2xl font-bold mb-6 text-center">ניהול ילדים</h2>

            {/* Add Child Form */}
            <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
                <h3 className="text-xl font-semibold mb-4">רישום ילד חדש</h3>

                {error && (
                    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 mb-4">
                        <p>{error}</p>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">שם הילד *</label>
                        <input
                            type="text"
                            name="name"
                            value={newChild.name}
                            onChange={handleChildChange}
                            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">תאריך לידה *</label>
                        <input
                            type="date"
                            name="birthDate"
                            value={newChild.birthDate}
                            onChange={handleChildChange}
                            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                            required
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-1">גן ילדים</label>
                        <select
                            name="kindergartenId"
                            value={newChild.kindergartenId}
                            onChange={handleChildChange}
                            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                        >
                            <option value="">בחר גן ילדים</option>
                            {mockKindergartens.map(k => (
                                <option key={k.id} value={k.id}>{k.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <button
                    onClick={handleAddChild}
                    className="mt-4 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                    disabled={!newChild.name || !newChild.birthDate}
                >
                    הוסף ילד
                </button>
            </div>

            {/* Children List */}
            <div className="bg-white shadow-lg rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4">ילדים רשומים</h3>

                {children.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <p>לא נמצאו ילדים רשומים</p>
                        <p className="mt-2 text-sm">ניתן להוסיף ילד חדש באמצעות הטופס למעלה</p>
                    </div>
                ) : (
                    <div className="divide-y">
                        {children.map(child => {
                            const kindergarten = mockKindergartens.find(k => k.id === child.kindergartenId);

                            return (
                                <div key={child.id} className="py-4 flex flex-col md:flex-row md:justify-between md:items-center">
                                    <div className="mb-2 md:mb-0">
                                        <h4 className="font-medium text-lg">{child.name}</h4>
                                        <div className="flex flex-wrap gap-x-4 text-sm text-gray-600">
                                            <p>תאריך לידה: {formatDate(child.birthDate)}</p>
                                            <p>גן: {kindergarten?.name || 'לא רשום'}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteChild(child.id)}
                                        className="text-red-600 hover:text-red-800 transition-colors self-start md:self-auto"
                                    >
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