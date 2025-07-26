import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FiPlus, FiTrash2, FiCheckCircle } from "react-icons/fi";

const steps = ["الحساب", "الزوجة/الزوجات", "الأبناء", "المراجعة"];
import './Register.css'
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
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden">
                {/* Header */}
                <div className="bg-blue-600 px-6 py-4 text-white text-center">
                    <h1 className="text-2xl font-bold">تسجيل عائلة جديدة – بلدية أبو ديس</h1>
                </div>

                {/* Progress bar */}
                <div className="flex items-center justify-around bg-blue-50 px-4 py-3">
                    {steps.map((label, idx) => (
                        <div key={idx} className="flex flex-col items-center">
                            <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                    step >= idx + 1 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-500"
                                }`}
                            >
                                {idx + 1}
                            </div>
                            <span className="text-xs mt-1 text-gray-700">{label}</span>
                        </div>
                    ))}
                </div>

                {/* Body */}
                <div className="p-6 space-y-6">
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                            {error}
                        </div>
                    )}

                    {/* Step 1: Account */}
                    {step === 1 && (
                        <div>
                            <h2 className="text-xl font-bold text-blue-700 mb-4">بيانات الحساب</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input name="fullName" placeholder="الاسم الكامل" value={account.fullName} onChange={handleAccount} className="input" />
                                <input name="email" type="email" placeholder="البريد الإلكتروني" value={account.email} onChange={handleAccount} className="input" />
                                <input name="password" type="password" placeholder="كلمة المرور" value={account.password} onChange={handleAccount} className="input" />
                                <input name="phone" placeholder="رقم الهاتف" value={account.phone} onChange={handleAccount} className="input" />
                            </div>
                        </div>
                    )}

                    {/* Step 2: Wives */}
                    {step === 2 && (
                        <div>
                            <h2 className="text-xl font-bold text-blue-700 mb-4">الزوجة / الزوجات</h2>
                            {wives.map((w, i) => (
                                <div key={i} className="flex items-center gap-2 mb-2">
                                    <input
                                        placeholder={`الزوجة ${i + 1}`}
                                        value={w.name}
                                        onChange={(e) => {
                                            const arr = [...wives];
                                            arr[i].name = e.target.value;
                                            setWives(arr);
                                        }}
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                    {wives.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeWife(i)}
                                            className="p-2 rounded-full text-red-500 hover:bg-red-100"
                                        >
                                            <FiTrash2 />
                                        </button>
                                    )}
                                </div>
                            ))}
                            <button type="button" onClick={addWife} className="text-blue-600 text-sm font-medium flex items-center gap-1 hover:underline">
                                <FiPlus /> إضافة زوجة
                            </button>
                        </div>
                    )}

                    {/* Step 3: Children */}
                    {step === 3 && (
                        <div>
                            <h2 className="text-xl font-bold text-blue-700 mb-4">الأبناء</h2>
                            {children.map((c, i) => (
                                <div key={i} className="grid grid-cols-1 md:grid-cols-12 gap-2 mb-3">
                                    <input placeholder="اسم الطفل" value={c.name} onChange={(e) => updateChild(i, "name", e.target.value)} className="md:col-span-4 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                                    <input type="date" value={c.birthDate} onChange={(e) => updateChild(i, "birthDate", e.target.value)} className="md:col-span-3 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                                    <select value={c.wifeIndex} onChange={(e) => updateChild(i, "wifeIndex", +e.target.value)} className="md:col-span-4 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                                        {wives.map((w, idx) => (
                                            <option key={idx} value={idx}>
                                                {w.name || `الزوجة ${idx + 1}`}
                                            </option>
                                        ))}
                                    </select>
                                    <button type="button" onClick={() => removeChild(i)} className="md:col-span-1 p-2 rounded-full text-red-500 hover:bg-red-100">
                                        <FiTrash2 />
                                    </button>
                                </div>
                            ))}
                            <button type="button" onClick={addChild} className="text-blue-600 text-sm font-medium flex items-center gap-1 hover:underline">
                                <FiPlus /> إضافة طفل
                            </button>
                        </div>
                    )}

                    {/* Step 4: Review */}
                    {step === 4 && (
                        <div className="text-center">
                            <FiCheckCircle className="mx-auto text-green-500 text-6xl mb-4" />
                            <h2 className="text-xl font-bold text-blue-700 mb-2">المراجعة</h2>
                            <p><strong>الاسم:</strong> {account.fullName}</p>
                            <p><strong>الزوجات:</strong> {wives.filter(w => w.name).length}</p>
                            <p><strong>الأبناء:</strong> {children.filter(c => c.name).length}</p>
                        </div>
                    )}

                    {/* Navigation */}
                    <div className="flex justify-between items-center pt-4 border-t">
                        {step > 1 && (
                            <button onClick={() => setStep(step - 1)} className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition">
                                السابق
                            </button>
                        )}
                        {step < 4 ? (
                            <button onClick={() => setStep(step + 1)} className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition ms-auto">
                                التالي
                            </button>
                        ) : (
                            <button onClick={submit} disabled={loading} className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition ms-auto disabled:opacity-50">
                                {loading ? "جاري التسجيل…" : "تسجيل العائلة"}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}