import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import "./RegistrationPage.css";

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
        <div className="registration-container">
            <div className="registration-card">
                <h1>تسجيل عائلة جديدة</h1>

                {error && <div className="error-message">{error}</div>}

                <div className="steps">
                    <div className={`step ${step === 1 ? 'active' : ''}`}>1. الحساب</div>
                    <div className={`step ${step === 2 ? 'active' : ''}`}>2. الزوجات</div>
                    <div className={`step ${step === 3 ? 'active' : ''}`}>3. الأبناء</div>
                    <div className={`step ${step === 4 ? 'active' : ''}`}>4. التأكيد</div>
                </div>

                {step === 1 && (
                    <div className="form-section">
                        <h2>معلومات الحساب</h2>
                        <input
                            type="text"
                            placeholder="الاسم الكامل"
                            value={account.fullName}
                            onChange={(e) => setAccount({...account, fullName: e.target.value})}
                        />
                        <input
                            type="email"
                            placeholder="البريد الإلكتروني"
                            value={account.email}
                            onChange={(e) => setAccount({...account, email: e.target.value})}
                        />
                        <input
                            type="password"
                            placeholder="كلمة المرور"
                            value={account.password}
                            onChange={(e) => setAccount({...account, password: e.target.value})}
                        />
                        <input
                            type="text"
                            placeholder="رقم الهاتف"
                            value={account.phone}
                            onChange={(e) => setAccount({...account, phone: e.target.value})}
                        />
                    </div>
                )}

                {step === 2 && (
                    <div className="form-section">
                        <h2>الزوجات</h2>
                        {wives.map((wife, index) => (
                            <div key={index} className="input-row">
                                <input
                                    type="text"
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
                                        className="remove-btn"
                                    >
                                        <FiTrash2 />
                                    </button>
                                )}
                            </div>
                        ))}
                        <button type="button" onClick={addWife} className="add-btn">
                            <FiPlus /> إضافة زوجة
                        </button>
                    </div>
                )}

                {step === 3 && (
                    <div className="form-section">
                        <h2>الأبناء</h2>
                        {children.map((child, index) => (
                            <div key={index} className="child-row">
                                <input
                                    type="text"
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
                                    value={child.birthDate}
                                    onChange={(e) => {
                                        const newChildren = [...children];
                                        newChildren[index].birthDate = e.target.value;
                                        setChildren(newChildren);
                                    }}
                                />
                                <select
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
                                    className="remove-btn"
                                >
                                    <FiTrash2 />
                                </button>
                            </div>
                        ))}
                        <button type="button" onClick={addChild} className="add-btn">
                            <FiPlus /> إضافة طفل
                        </button>
                    </div>
                )}

                {step === 4 && (
                    <div className="confirmation-section">
                        <h2>تأكيد المعلومات</h2>
                        <div className="info-box">
                            <h3>معلومات الحساب</h3>
                            <p><strong>الاسم:</strong> {account.fullName}</p>
                            <p><strong>البريد:</strong> {account.email}</p>
                            <p><strong>الهاتف:</strong> {account.phone}</p>
                        </div>
                        <div className="info-box">
                            <h3>الزوجات ({wives.filter(w => w.name.trim()).length})</h3>
                            <ul>
                                {wives.filter(w => w.name.trim()).map((wife, i) => (
                                    <li key={i}>{wife.name}</li>
                                ))}
                            </ul>
                        </div>
                        <div className="info-box">
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

                <div className="navigation-buttons">
                    {step > 1 && (
                        <button onClick={() => setStep(step - 1)} className="secondary-btn">
                            السابق
                        </button>
                    )}
                    {step < 4 ? (
                        <button
                            onClick={() => setStep(step + 1)}
                            className="primary-btn"
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
                            className="submit-btn"
                            disabled={loading}
                        >
                            {loading ? "جاري التسجيل..." : "تسجيل العائلة"}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RegistrationPage;