import './Children.css';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const Children = () => {
    const { t, i18n } = useTranslation();

    const mockKindergartens = [
        { id: '1', name: t('children.kindergartens.flowers') },
        { id: '2', name: t('children.kindergartens.red') },
        { id: '3', name: t('children.kindergartens.oak') },
        { id: '4', name: t('children.kindergartens.palm') }
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
                { id: '1', name: t('children.sampleChildren.adam'), birthDate: '2020-05-15', kindergartenId: '1' },
                { id: '2', name: t('children.sampleChildren.mohammed'), birthDate: '2019-11-22', kindergartenId: '3' }
            ]);
            setLoading(false);
        }, 1000);
    }, [t]);

    const handleChildChange = (e) => {
        setNewChild({ ...newChild, [e.target.name]: e.target.value });
    };

    const handleAddChild = () => {
        if (!newChild.name || !newChild.birthDate) {
            setError(t('children.errors.requiredFields'));
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
        return new Date(dateString).toLocaleDateString(i18n.language === 'he' ? 'he-IL' : 'ar-SA', options);
    };

    if (loading) {
        return (
            <div className="loader" aria-live="polite" aria-busy="true">
                <div className="spinner"></div>
                <p>{t('children.loading')}</p>
            </div>
        );
    }

    return (
        <div className={`children-page ${i18n.language === 'he' ? 'rtl' : 'ltr'}`} dir={i18n.language === 'he' ? 'rtl' : 'ltr'}>
            <h1 className="page-title" tabIndex="0">{t('children.title')}</h1>

            <div className="card" aria-labelledby="register-child-heading">
                <h2 id="register-child-heading" className="card-title">{t('children.registerTitle')}</h2>

                {error && <div className="alert-error" role="alert">{error}</div>}

                <div className="form-group">
                    <label htmlFor="child-name">{t('children.childName')} *</label>
                    <input
                        id="child-name"
                        type="text"
                        name="name"
                        value={newChild.name}
                        onChange={handleChildChange}
                        aria-required="true"
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="birth-date">{t('children.birthDate')} *</label>
                    <input
                        id="birth-date"
                        type="date"
                        name="birthDate"
                        value={newChild.birthDate}
                        onChange={handleChildChange}
                        aria-required="true"
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="kindergarten">{t('children.kindergarten')}</label>
                    <select
                        id="kindergarten"
                        name="kindergartenId"
                        value={newChild.kindergartenId}
                        onChange={handleChildChange}
                    >
                        <option value="">{t('children.selectKindergarten')}</option>
                        {mockKindergartens.map(k => (
                            <option key={k.id} value={k.id}>{k.name}</option>
                        ))}
                    </select>
                </div>

                <button
                    onClick={handleAddChild}
                    className="btn-primary"
                    disabled={!newChild.name || !newChild.birthDate}
                    aria-disabled={!newChild.name || !newChild.birthDate}
                >
                    {t('children.addChild')}
                </button>
            </div>

            <div className="card" aria-labelledby="registered-children-heading">
                <h2 id="registered-children-heading" className="card-title">{t('children.registeredTitle')}</h2>

                {children.length === 0 ? (
                    <div className="empty-state">
                        <p>{t('children.noChildren')}</p>
                        <p>{t('children.addNewChild')}</p>
                    </div>
                ) : (
                    <ul className="children-list" aria-live="polite">
                        {children.map(child => {
                            const kindergarten = mockKindergartens.find(k => k.id === child.kindergartenId);
                            return (
                                <li key={child.id} className="child-item">
                                    <div className="child-info">
                                        <h3>{child.name}</h3>
                                        <p>{t('children.birthDate')}: {formatDate(child.birthDate)}</p>
                                        <p>{t('children.kindergarten')}: {kindergarten?.name || t('children.notRegistered')}</p>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteChild(child.id)}
                                        className="btn-delete"
                                        aria-label={`${t('children.deleteChild')} ${child.name}`}
                                    >
                                        {t('children.delete')}
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default Children;