import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FiPlus, FiTrash2 } from "react-icons/fi";

const steps = ["חשבון", "נשים", "ילדים", "סיכום"];

export default function Register() {
    const navigate = useNavigate();

    /* ---------- step 1 : basic account ---------- */
    const [account, setAccount] = useState({
        fullName: "",
        email: "",
        password: "",
        phone: ""
    });

    /* ---------- step 2 : wives ---------- */
    const [wives, setWives] = useState([{ name: "" }]);

    /* ---------- step 3 : children ---------- */
    const [children, setChildren] = useState([
        { name: "", birthDate: "", wifeIndex: 0 }
    ]);

    /* ---------- wizard state ---------- */
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    /* ---------- helpers ---------- */
    const handleAccount = (e) =>
        setAccount({ ...account, [e.target.name]: e.target.value });

    const addWife = () => setWives([...wives, { name: "" }]);
    const removeWife = (i) =>
        setWives(wives.filter((_, idx) => idx !== i));

    const addChild = () =>
        setChildren([...children, { name: "", birthDate: "", wifeIndex: 0 }]);
    const removeChild = (i) =>
        setChildren(children.filter((_, idx) => idx !== i));

    const updateChild = (i, field, value) => {
        const arr = [...children];
        arr[i][field] = value;
        setChildren(arr);
    };

    /* ---------- submit ---------- */
    const submit = async () => {
        setLoading(true);
        try {
            await axios.post(
                "http://localhost:8080/api/auth/register-family",
                { user: account, wives, children },
                { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
            );
            navigate("/login");
        } catch (err) {
            setError(err.response?.data?.message || "שגיאה בהרשמה");
        } finally {
            setLoading(false);
        }
    };

    /* ---------- UI ---------- */
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 rtl">
            <div className="bg-white p-6 sm:p-8 rounded shadow-md w-full max-w-lg">
                {/* progress */}
                <div className="flex justify-between mb-6 text-sm">
                    {steps.map((label, idx) => (
                        <div
                            key={idx}
                            className={`w-1/4 text-center pb-1 border-b-2 ${
                                step >= idx + 1 ? "border-green-500 text-green-600" : "border-gray-300"
                            }`}
                        >
                            {idx + 1}. {label}
                        </div>
                    ))}
                </div>

                {error && <p className="text-red-500 text-sm mb-3 text-center">{error}</p>}

                {/* STEP 1 */}
                {step === 1 && (
                    <>
                        <h2 className="text-xl font-bold mb-4 text-center">פרטי חשבון</h2>
                        <input
                            name="fullName"
                            placeholder="שם מלא"
                            value={account.fullName}
                            onChange={handleAccount}
                            className="w-full mb-3 px-3 py-2 border rounded"
                        />
                        <input
                            name="email"
                            type="email"
                            placeholder="דוא״ל"
                            value={account.email}
                            onChange={handleAccount}
                            className="w-full mb-3 px-3 py-2 border rounded"
                        />
                        <input
                            name="password"
                            type="password"
                            placeholder="סיסמה"
                            value={account.password}
                            onChange={handleAccount}
                            className="w-full mb-3 px-3 py-2 border rounded"
                        />
                        <input
                            name="phone"
                            placeholder="טלפון"
                            value={account.phone}
                            onChange={handleAccount}
                            className="w-full mb-3 px-3 py-2 border rounded"
                        />
                    </>
                )}

                {/* STEP 2 */}
                {step === 2 && (
                    <>
                        <h2 className="text-xl font-bold mb-4 text-center">פרטי נשים</h2>
                        {wives.map((w, i) => (
                            <div key={i} className="flex items-center gap-2 mb-2">
                                <input
                                    placeholder={`אישה ${i + 1}`}
                                    value={w.name}
                                    onChange={(e) => {
                                        const arr = [...wives];
                                        arr[i].name = e.target.value;
                                        setWives(arr);
                                    }}
                                    className="flex-1 px-3 py-2 border rounded"
                                />
                                {wives.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeWife(i)}
                                        className="text-red-500"
                                    >
                                        <FiTrash2 />
                                    </button>
                                )}
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={addWife}
                            className="text-sm text-green-600 flex items-center gap-1"
                        >
                            <FiPlus /> הוסף אישה
                        </button>
                    </>
                )}

                {/* STEP 3 */}
                {step === 3 && (
                    <>
                        <h2 className="text-xl font-bold mb-4 text-center">פרטי ילדים</h2>
                        {children.map((c, i) => (
                            <div key={i} className="grid grid-cols-12 gap-2 mb-3">
                                <input
                                    placeholder="שם הילד"
                                    value={c.name}
                                    onChange={(e) => updateChild(i, "name", e.target.value)}
                                    className="col-span-4 px-2 py-1 border rounded"
                                />
                                <input
                                    type="date"
                                    value={c.birthDate}
                                    onChange={(e) => updateChild(i, "birthDate", e.target.value)}
                                    className="col-span-3 px-2 py-1 border rounded"
                                />
                                <select
                                    value={c.wifeIndex}
                                    onChange={(e) => updateChild(i, "wifeIndex", Number(e.target.value))}
                                    className="col-span-4 px-2 py-1 border rounded"
                                >
                                    {wives.map((w, idx) => (
                                        <option key={idx} value={idx}>
                                            {w.name || `אישה ${idx + 1}`}
                                        </option>
                                    ))}
                                </select>
                                <button
                                    type="button"
                                    onClick={() => removeChild(i)}
                                    className="col-span-1 text-red-500"
                                >
                                    <FiTrash2 />
                                </button>
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={addChild}
                            className="text-sm text-green-600 flex items-center gap-1"
                        >
                            <FiPlus /> הוסף ילד
                        </button>
                    </>
                )}

                {/* STEP 4 */}
                {step === 4 && (
                    <div>
                        <h2 className="text-xl font-bold mb-4 text-center">סיכום</h2>
                        <p>שם: {account.fullName}</p>
                        <p>נשים: {wives.filter((w) => w.name).length}</p>
                        <p>ילדים: {children.filter((c) => c.name).length}</p>
                    </div>
                )}

                {/* navigation */}
                <div className="flex justify-between mt-6">
                    {step > 1 && (
                        <button
                            type="button"
                            onClick={() => setStep(step - 1)}
                            className="px-4 py-2 bg-gray-200 rounded"
                        >
                            חזור
                        </button>
                    )}
                    {step < 4 ? (
                        <button
                            type="button"
                            onClick={() => setStep(step + 1)}
                            className="px-4 py-2 bg-blue-600 text-white rounded ms-auto"
                        >
                            הבא
                        </button>
                    ) : (
                        <button
                            onClick={submit}
                            disabled={loading}
                            className="px-4 py-2 bg-green-600 text-white rounded ms-auto disabled:opacity-50"
                        >
                            {loading ? "..." : "סיים רישום"}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}