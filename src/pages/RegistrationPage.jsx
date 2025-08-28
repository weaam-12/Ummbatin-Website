import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import axiosInstance from "../api";
import { FiPlus, FiTrash2, FiSkipForward } from "react-icons/fi";
import styles from './Register.module.css';

const RegistrationPage = () => {
    const { t } = useTranslation();
    const [step, setStep] = useState(1);
    const [account, setAccount] = useState({
        userId: "",
        fullName: "",
        email: "",
        password: "",
        phone: ""
    });
    const [wives, setWives] = useState([{ name: "" }]);
    const [children, setChildren] = useState([{
        name: "",
        birthDate: "",
        wifeIndex: 0
    }]);
    const [hasWives, setHasWives] = useState(true); // جديد: لتتبع إذا كان لديه زوجات
    const [hasChildren, setHasChildren] = useState(true); // جديد: لتتبع إذا كان لديه أولاد
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.post("/api/auth/register-family", {
                user: {
                    userId: parseInt(account.userId),
                    fullName: account.fullName,
                    email: account.email,
                    password: account.password,
                    phone: account.phone
                },
                wives: hasWives ? wives.filter(w => w.name.trim()) : [],
                children: hasChildren ? children.filter(c => c.name.trim()).map(child => ({
                    name: child.name,
                    birthDate: child.birthDate,
                    motherName: wives[child.wifeIndex]?.name || ""
                })) : []
            });
            navigate("/admin", {
                state: { message: t('registration.successMessage') }
            });
        } catch (err) {
            console.error("Registration error:", err.response?.data);
            setError(err.response?.data?.message || t('registration.errorMessage'));
        } finally {
            setLoading(false);
        }
    };
    const addWife = () => setWives([...wives, { name: "" }]);
    const removeWife = (index) => setWives(wives.filter((_, i) => i !== index));

    const addChild = () => setChildren([...children, {
        name: "",
        birthDate: "",
        wifeIndex: 0
    }]);
    const removeChild = (index) => setChildren(children.filter((_, i) => i !== index));

    const skipWives = () => {
        setHasWives(false);
        setStep(3); // التخطي إلى خطوة الأولاد مباشرة
    };

    const skipChildren = () => {
        setHasChildren(false);
        setStep(4); // التخطي إلى خطوة التأكيد
    };

    return (
        <div className={styles.bgContainer}>
            <div className={styles.card}>
                <div className={styles.header}>
                    <h1>{t('registration.title')}</h1>
                </div>

                {error && <div className={styles.errorBox}>{error}</div>}

                <div className={styles.progressBar}>
                    <div className={`${styles.step} ${step === 1 ? styles.active : ''}`}>
                        <div className={styles.stepNumber}>1</div>
                        <span>{t('registration.steps.account')}</span>
                    </div>
                    <div className={`${styles.step} ${step === 2 ? styles.active : ''}`}>
                        <div className={styles.stepNumber}>2</div>
                        <span>{t('registration.steps.wives')}</span>
                    </div>
                    <div className={`${styles.step} ${step === 3 ? styles.active : ''}`}>
                        <div className={styles.stepNumber}>3</div>
                        <span>{t('registration.steps.children')}</span>
                    </div>
                    <div className={`${styles.step} ${step === 4 ? styles.active : ''}`}>
                        <div className={styles.stepNumber}>4</div>
                        <span>{t('registration.steps.confirmation')}</span>
                    </div>
                </div>

                <div className={styles.body}>
                    {step === 1 && (
                        <div className={styles.inputGrid}>
                            <h2 className={styles.sectionTitle}>{t('registration.accountInfo')}</h2>
                            <input
                                type="text"
                                className={styles.input}
                                placeholder={t('registration.placeholders.fullName')}
                                value={account.fullName}
                                onChange={(e) => setAccount({...account, fullName: e.target.value})}
                            />
                            <input
                                type="number"
                                className={styles.input}
                                placeholder="ת'ז"
                                value={account.userId}
                                onChange={(e) => setAccount({...account, userId: e.target.value})}
                            />
                            <input
                                type="email"
                                className={styles.input}
                                placeholder={t('registration.placeholders.email')}
                                value={account.email}
                                onChange={(e) => setAccount({...account, email: e.target.value})}
                            />
                            <input
                                type="password"
                                className={styles.input}
                                placeholder={t('registration.placeholders.password')}
                                value={account.password}
                                onChange={(e) => setAccount({...account, password: e.target.value})}
                            />
                            <input
                                type="text"
                                className={styles.input}
                                placeholder={t('registration.placeholders.phone')}
                                value={account.phone}
                                onChange={(e) => setAccount({...account, phone: e.target.value})}
                            />
                        </div>
                    )}

                    {step === 2 && (
                        <div>
                            <h2 className={styles.sectionTitle}>{t('registration.wives')}</h2>
                            {wives.map((wife, index) => (
                                <div key={index} className={styles.wifeRow}>
                                    <input
                                        type="text"
                                        className={styles.input}
                                        placeholder={t('registration.placeholders.wifeName', { number: index + 1 })}
                                        value={wife.name}
                                        onChange={(e) => {
                                            const newWives = [...wives];
                                            newWives[index].name = e.target.value;
                                            setWives(newWives);
                                        }}
                                    />
                                    {wives.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeWife(index)}
                                            className={styles.btnIcon}
                                        >
                                            <FiTrash2 />
                                        </button>
                                    )}
                                </div>
                            ))}
                            <div className={styles.buttonGroup}>
                                <button
                                    type="button"
                                    onClick={addWife}
                                    className={styles.btnAdd}
                                >
                                    <FiPlus /> {t('registration.addWife')}
                                </button>
                                <button
                                    type="button"
                                    onClick={skipWives}
                                    className={styles.btnSkip}
                                >
                                    <FiSkipForward /> {t('registration.skipWives')}
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div>
                            <h2 className={styles.sectionTitle}>{t('registration.children')}</h2>
                            {children.map((child, index) => (
                                <div key={index} className={styles.childGrid}>
                                    <input
                                        type="text"
                                        className={styles.input}
                                        placeholder={t('registration.placeholders.childName')}
                                        value={child.name}
                                        onChange={(e) => {
                                            const newChildren = [...children];
                                            newChildren[index].name = e.target.value;
                                            setChildren(newChildren);
                                        }}
                                    />
                                    <input
                                        type="date"
                                        className={styles.input}
                                        value={child.birthDate}
                                        onChange={(e) => {
                                            const newChildren = [...children];
                                            newChildren[index].birthDate = e.target.value;
                                            setChildren(newChildren);
                                        }}
                                    />
                                    <select
                                        className={styles.input}
                                        value={child.wifeIndex}
                                        onChange={(e) => {
                                            const newChildren = [...children];
                                            newChildren[index].wifeIndex = parseInt(e.target.value);
                                            setChildren(newChildren);
                                        }}
                                    >
                                        {wives.map((wife, i) => (
                                            <option key={i} value={i}>
                                                {wife.name || t('registration.wifeDefault', { number: i + 1 })}
                                            </option>
                                        ))}
                                    </select>
                                    <button
                                        type="button"
                                        onClick={() => removeChild(index)}
                                        className={styles.btnIcon}
                                    >
                                        <FiTrash2 />
                                    </button>
                                </div>
                            ))}
                            <div className={styles.buttonGroup}>
                                <button
                                    type="button"
                                    onClick={addChild}
                                    className={styles.btnAdd}
                                >
                                    <FiPlus /> {t('registration.addChild')}
                                </button>
                                <button
                                    type="button"
                                    onClick={skipChildren}
                                    className={styles.btnSkip}
                                >
                                    <FiSkipForward /> {t('registration.skipChildren')}
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 4 && (
                        <div className={styles.reviewSection}>
                            <h2 className={styles.sectionTitle}>{t('registration.confirmation')}</h2>
                            <div>
                                <h3>{t('registration.accountInfo')}</h3>
                                <p><strong>{t('registration.labels.name')}:</strong> {account.fullName}</p>
                                <p><strong>{t('registration.labels.email')}:</strong> {account.email}</p>
                                <p><strong>{t('registration.labels.phone')}:</strong> {account.phone}</p>
                            </div>
                            {hasWives && (
                                <div>
                                    <h3>{t('registration.wives')} ({wives.filter(w => w.name.trim()).length})</h3>
                                    <ul>
                                        {wives.filter(w => w.name.trim()).map((wife, i) => (
                                            <li key={i}>{wife.name}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            {hasChildren && (
                                <div>
                                    <h3>{t('registration.children')} ({children.filter(c => c.name.trim()).length})</h3>
                                    <ul>
                                        {children.filter(c => c.name.trim()).map((child, i) => (
                                            <li key={i}>
                                                {child.name} - {child.birthDate}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}

                    <div className={styles.navigation}>
                        {step > 1 && (
                            <button
                                onClick={() => setStep(step - 1)}
                                className={styles.btnSecondary}
                            >
                                {t('common.previous')}
                            </button>
                        )}
                        {step < 4 ? (
                            <button
                                onClick={() => setStep(step + 1)}
                                className={styles.btnPrimary}
                                disabled={
                                    (step === 1 && (!account.fullName || !account.email || !account.password)) ||
                                    (step === 2 && hasWives && wives.every(w => !w.name.trim()))
                                }
                            >
                                {t('common.next')}
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                className={styles.btnSuccess}
                                disabled={loading}
                            >
                                {loading ? t('registration.registering') : t('registration.registerFamily')}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegistrationPage;