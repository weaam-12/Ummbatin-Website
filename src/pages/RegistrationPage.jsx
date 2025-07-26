import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FiPlus, FiTrash2, FiCheckCircle } from "react-icons/fi";
import styles from './Register.module.css';

const steps = ["الحساب", "الزوجة/الزوجات", "الأبناء", "المراجعة"];

export default function Register() {
    const navigate = useNavigate();

    /* ---------- بيانات التسجيل ---------- */
    const [account, setAccount] = useState({ fullName: "", email: "", password: "", phone: "" });
    const [wives, setWives] = useState([{ name: "" }]);
    const [children, setChildren] = useState([{ name: "", birthDate: "", wifeIndex: 0 }]);

    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    /* ---------- helpers ---------- */
    const handleAccount = (e) => setAccount({ ...account, [e.target.name]: e.target.value });
    const addWife = () => setWives([...wives, { name: "" }]);
    const removeWife = (i) => setWives(wives.filter((_, idx) => idx !== i));
    const addChild = () => setChildren([...children, { name: "", birthDate: "", wifeIndex: 0 }]);
    const removeChild = (i) => setChildren(children.filter((_, idx) => idx !== i));
    const updateChild = (i, field, value) => {
        const arr = [...children];
        arr[i][field] = value;
        setChildren(arr);
    };

    const submit = async () => {
        setLoading(true);
        try {
            await axios.post(
                "/api/auth/register-family",
                { user: account, wives, children },
                { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
            );
            navigate("/login");
        } catch (err) {
            setError(err.response?.data?.message || "حدث خطأ أثناء التسجيل");
        } finally {
            setLoading(false);
        }
    };

    /* ---------- UI ---------- */
    return (
        <div className={styles.bgContainer}>
            <div className={styles.card}>
                {/* Header */}
                <div className={styles.header}>
                    <h1>تسجيل عائلة جديدة – بلدية أبو ديس</h1>
                </div>

                {/* Progress bar */}
                <div className={styles.progressBar}>
                    {steps.map((label, idx) => (
                        <div key={idx} className={`${styles.step} ${step >= idx + 1 ? styles.active : ""}`}>
                            <div className={styles.stepNumber}>{idx + 1}</div>
                            <span>{label}</span>
                        </div>
                    ))}
                </div>

                {/* Body */}
                <div className={styles.body}>
                    {error && (
                        <div className={styles.errorBox}>
                            {error}
                        </div>
                    )}

                    {/* Step 1: Account */}
                    {step === 1 && (
                        <div>
                            <h2 className={styles.sectionTitle}>بيانات الحساب</h2>
                            <div className={styles.inputGrid}>
                                <input
                                    name="fullName"
                                    placeholder="الاسم الكامل"
                                    value={account.fullName}
                                    onChange={handleAccount}
                                    className={styles.input}
                                />
                                <input
                                    name="email"
                                    type="email"
                                    placeholder="البريد الإلكتروني"
                                    value={account.email}
                                    onChange={handleAccount}
                                    className={styles.input}
                                />
                                <input
                                    name="password"
                                    type="password"
                                    placeholder="كلمة المرور"
                                    value={account.password}
                                    onChange={handleAccount}
                                    className={styles.input}
                                />
                                <input
                                    name="phone"
                                    placeholder="رقم الهاتف"
                                    value={account.phone}
                                    onChange={handleAccount}
                                    className={styles.input}
                                />
                            </div>
                        </div>
                    )}

                    {/* Step 2: Wives */}
                    {step === 2 && (
                        <div>
                            <h2 className={styles.sectionTitle}>الزوجة / الزوجات</h2>
                            {wives.map((w, i) => (
                                <div key={i} className={styles.wifeRow}>
                                    <input
                                        placeholder={`الزوجة ${i + 1}`}
                                        value={w.name}
                                        onChange={(e) => {
                                            const arr = [...wives];
                                            arr[i].name = e.target.value;
                                            setWives(arr);
                                        }}
                                        className={styles.input}
                                    />
                                    {wives.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeWife(i)}
                                            className={styles.btnIcon}
                                        >
                                            <FiTrash2 />
                                        </button>
                                    )}
                                </div>
                            ))}
                            <button type="button" onClick={addWife} className={styles.btnAdd}>
                                <FiPlus /> إضافة زوجة
                            </button>
                        </div>
                    )}

                    {/* Step 3: Children */}
                    {step === 3 && (
                        <div>
                            <h2 className={styles.sectionTitle}>الأبناء</h2>
                            {children.map((c, i) => (
                                <div key={i} className={styles.childGrid}>
                                    <input
                                        placeholder="اسم الطفل"
                                        value={c.name}
                                        onChange={(e) => updateChild(i, "name", e.target.value)}
                                        className={styles.input}
                                    />
                                    <input
                                        type="date"
                                        value={c.birthDate}
                                        onChange={(e) => updateChild(i, "birthDate", e.target.value)}
                                        className={styles.input}
                                    />
                                    <select
                                        value={c.wifeIndex}
                                        onChange={(e) => updateChild(i, "wifeIndex", +e.target.value)}
                                        className={styles.input}
                                    >
                                        {wives.map((w, idx) => (
                                            <option key={idx} value={idx}>
                                                {w.name || `الزوجة ${idx + 1}`}
                                            </option>
                                        ))}
                                    </select>
                                    <button
                                        type="button"
                                        onClick={() => removeChild(i)}
                                        className={styles.btnIcon}
                                    >
                                        <FiTrash2 />
                                    </button>
                                </div>
                            ))}
                            <button type="button" onClick={addChild} className={styles.btnAdd}>
                                <FiPlus /> إضافة طفل
                            </button>
                        </div>
                    )}

                    {/* Step 4: Review */}
                    {step === 4 && (
                        <div className={styles.reviewSection}>
                            <FiCheckCircle className={styles.successIcon} />
                            <h2 className={styles.sectionTitle}>المراجعة</h2>
                            <p><strong>الاسم:</strong> {account.fullName}</p>
                            <p><strong>الزوجات:</strong> {wives.filter(w => w.name).length}</p>
                            <p><strong>الأبناء:</strong> {children.filter(c => c.name).length}</p>
                        </div>
                    )}

                    {/* Navigation */}
                    <div className={styles.navigation}>
                        {step > 1 && (
                            <button
                                onClick={() => setStep(step - 1)}
                                className={styles.btnSecondary}
                            >
                                السابق
                            </button>
                        )}
                        {step < 4 ? (
                            <button
                                onClick={() => setStep(step + 1)}
                                className={styles.btnPrimary}
                            >
                                التالي
                            </button>
                        ) : (
                            <button
                                onClick={submit}
                                disabled={loading}
                                className={styles.btnSuccess}
                            >
                                {loading ? "جاري التسجيل…" : "تسجيل العائلة"}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}