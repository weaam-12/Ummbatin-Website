import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import styles from './Register.module.css';

const RegistrationPage = () => {
    const [step, setStep] = useState(1);
    const [account, setAccount] = useState({
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
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async () => {
        setLoading(true);
        try {
            await axiosInstance.post("/api/auth/register-family", {
                user: account,
                wives: wives.filter(w => w.name.trim()),
                children: children.filter(c => c.name.trim())
            });
            navigate("/admin", {
                state: { message: "تم تسجيل العائلة بنجاح" }
            });
        } catch (err) {
            setError(err.response?.data?.message || "حدث خطأ أثناء التسجيل");
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

    return (
        <div className={styles.bgContainer}>
            <div className={styles.card}>
                <div className={styles.header}>
                    <h1>تسجيل عائلة جديدة</h1>
                </div>

                {error && <div className={styles.errorBox}>{error}</div>}

                <div className={styles.progressBar}>
                    <div className={`${styles.step} ${step === 1 ? styles.active : ''}`}>
                        <div className={styles.stepNumber}>1</div>
                        <span>الحساب</span>
                    </div>
                    <div className={`${styles.step} ${step === 2 ? styles.active : ''}`}>
                        <div className={styles.stepNumber}>2</div>
                        <span>الزوجات</span>
                    </div>
                    <div className={`${styles.step} ${step === 3 ? styles.active : ''}`}>
                        <div className={styles.stepNumber}>3</div>
                        <span>الأبناء</span>
                    </div>
                    <div className={`${styles.step} ${step === 4 ? styles.active : ''}`}>
                        <div className={styles.stepNumber}>4</div>
                        <span>التأكيد</span>
                    </div>
                </div>

                <div className={styles.body}>
                    {step === 1 && (
                        <div className={styles.inputGrid}>
                            <h2 className={styles.sectionTitle}>معلومات الحساب</h2>
                            <input
                                type="text"
                                className={styles.input}
                                placeholder="الاسم الكامل"
                                value={account.fullName}
                                onChange={(e) => setAccount({...account, fullName: e.target.value})}
                            />
                            <input
                                type="email"
                                className={styles.input}
                                placeholder="البريد الإلكتروني"
                                value={account.email}
                                onChange={(e) => setAccount({...account, email: e.target.value})}
                            />
                            <input
                                type="password"
                                className={styles.input}
                                placeholder="كلمة المرور"
                                value={account.password}
                                onChange={(e) => setAccount({...account, password: e.target.value})}
                            />
                            <input
                                type="text"
                                className={styles.input}
                                placeholder="رقم الهاتف"
                                value={account.phone}
                                onChange={(e) => setAccount({...account, phone: e.target.value})}
                            />
                        </div>
                    )}

                    {step === 2 && (
                        <div>
                            <h2 className={styles.sectionTitle}>الزوجات</h2>
                            {wives.map((wife, index) => (
                                <div key={index} className={styles.wifeRow}>
                                    <input
                                        type="text"
                                        className={styles.input}
                                        placeholder={`اسم الزوجة ${index + 1}`}
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
                            <button
                                type="button"
                                onClick={addWife}
                                className={styles.btnAdd}
                            >
                                <FiPlus /> إضافة زوجة
                            </button>
                        </div>
                    )}

                    {step === 3 && (
                        <div>
                            <h2 className={styles.sectionTitle}>الأبناء</h2>
                            {children.map((child, index) => (
                                <div key={index} className={styles.childGrid}>
                                    <input
                                        type="text"
                                        className={styles.input}
                                        placeholder="اسم الطفل"
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
                                                {wife.name || `الزوجة ${i + 1}`}
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
                            <button
                                type="button"
                                onClick={addChild}
                                className={styles.btnAdd}
                            >
                                <FiPlus /> إضافة طفل
                            </button>
                        </div>
                    )}

                    {step === 4 && (
                        <div className={styles.reviewSection}>
                            <h2 className={styles.sectionTitle}>تأكيد المعلومات</h2>
                            <div>
                                <h3>معلومات الحساب</h3>
                                <p><strong>الاسم:</strong> {account.fullName}</p>
                                <p><strong>البريد:</strong> {account.email}</p>
                                <p><strong>الهاتف:</strong> {account.phone}</p>
                            </div>
                            <div>
                                <h3>الزوجات ({wives.filter(w => w.name.trim()).length})</h3>
                                <ul>
                                    {wives.filter(w => w.name.trim()).map((wife, i) => (
                                        <li key={i}>{wife.name}</li>
                                    ))}
                                </ul>
                            </div>
                            <div>
                                <h3>الأبناء ({children.filter(c => c.name.trim()).length})</h3>
                                <ul>
                                    {children.filter(c => c.name.trim()).map((child, i) => (
                                        <li key={i}>
                                            {child.name} - {child.birthDate}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}

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
                                disabled={
                                    (step === 1 && (!account.fullName || !account.email || !account.password)) ||
                                    (step === 2 && wives.every(w => !w.name.trim()))
                                }
                            >
                                التالي
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                className={styles.btnSuccess}
                                disabled={loading}
                            >
                                {loading ? "جاري التسجيل..." : "تسجيل العائلة"}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegistrationPage;