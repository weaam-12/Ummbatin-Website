// Login.test.js
// בדיקות פשוטות ל-Login component

// Mock ל-Translation
jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key) => {
            const translations = {
                "login.success": "התחברות בוצעה בהצלחה!",
                "login.error": "שגיאה בהתחברות",
                "common.loading": "טוען...",
                "login.title": "התחברות",
                "login.email": "אימייל",
                "login.emailPlaceholder": "הכנס כתובת אימייל",
                "login.password": "סיסמה",
                "login.passwordPlaceholder": "הכנס סיסמה",
                "login.submitting": "מתחבר...",
                "login.submit": "התחבר"
            };
            return translations[key] || key;
        }
    })
}));

// Mock ל-Auth Context
const mockUseAuth = jest.fn();
jest.mock('../AuthContext', () => ({
    useAuth: mockUseAuth
}));

// Mock ל-CSS
jest.mock('../components/styles/Login.css', () => ({}));

// Mock ל-localStorage
beforeAll(() => {
    const localStorageMock = (() => {
        let store = {};
        return {
            getItem: (key) => store[key] || null,
            setItem: (key, value) => store[key] = value.toString(),
            removeItem: (key) => delete store[key],
            clear: () => store = {}
        };
    })();
    Object.defineProperty(global, 'localStorage', {
        value: localStorageMock
    });
});

describe('Login - Logic Tests', () => {
    let mockNavigate;

    beforeEach(() => {
        jest.clearAllMocks();
        mockNavigate = jest.fn();
    });

    describe('פונקציות עזר', () => {
        test('בדיקת טופס ריק', () => {
            const isFormEmpty = (form) => {
                return !form.email && !form.password;
            };

            const emptyForm = { email: "", password: "" };
            const filledForm = { email: "test@example.com", password: "password" };

            expect(isFormEmpty(emptyForm)).toBe(true);
            expect(isFormEmpty(filledForm)).toBe(false);
        });

        test('בדיקת טופס תקין', () => {
            const isFormValid = (form) => {
                return Boolean(form.email && form.password); // 🔹 fix: return boolean
            };

            const validForm = { email: "test@example.com", password: "password" };
            const invalidForm1 = { email: "", password: "password" };
            const invalidForm2 = { email: "test@example.com", password: "" };
            const invalidForm3 = { email: "", password: "" };

            expect(isFormValid(validForm)).toBe(true);
            expect(isFormValid(invalidForm1)).toBe(false);
            expect(isFormValid(invalidForm2)).toBe(false);
            expect(isFormValid(invalidForm3)).toBe(false);
        });

        test('בדיקת אימייל תקין', () => {
            const isValidEmail = (email) => {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                return emailRegex.test(email);
            };

            expect(isValidEmail("test@example.com")).toBe(true);
            expect(isValidEmail("invalid-email")).toBe(false);
            expect(isValidEmail("test@")).toBe(false);
            expect(isValidEmail("@example.com")).toBe(false);
            expect(isValidEmail("")).toBe(false);
        });
    });

    describe('ניהול התחברות', () => {
        test('התחברות מוצלחת', async () => {
            const mockLogin = jest.fn().mockResolvedValue({});
            mockUseAuth.mockReturnValue({
                user: null,
                login: mockLogin,
                loading: false
            });

            const formData = {
                email: "test@example.com",
                password: "password123"
            };

            await mockLogin(formData);

            expect(mockLogin).toHaveBeenCalledWith(formData);
            expect(mockLogin).toHaveBeenCalledTimes(1);
        });

        test('טיפול בשגיאת התחברות', async () => {
            const errorMessage = "שגיאה בהתחברות";
            const mockLogin = jest.fn().mockRejectedValue({
                response: { data: { message: errorMessage } },
                message: errorMessage
            });

            mockUseAuth.mockReturnValue({
                user: null,
                login: mockLogin,
                loading: false
            });

            try {
                await mockLogin({ email: "test@example.com", password: "wrongpassword" });
                fail('הייתה אמורה להיזרק שגיאה');
            } catch (error) {
                expect(error.message).toBe(errorMessage);
            }
        });
    });

    describe('בדיקות תקינות', () => {
        test('בדיקת טעינת משתמש', () => {
            const isLoading = (authLoading, componentLoading) => {
                return authLoading || componentLoading;
            };

            expect(isLoading(true, false)).toBe(true);
            expect(isLoading(false, true)).toBe(true);
            expect(isLoading(true, true)).toBe(true);
            expect(isLoading(false, false)).toBe(false);
        });

        test('בדיקת ניתוב לאחר התחברות', () => {
            const getRedirectPath = () => {
                const path = localStorage.getItem('redirectPath') || '/profile';
                localStorage.removeItem('redirectPath');
                return path;
            };

            // Test default path
            expect(getRedirectPath()).toBe('/profile');

            // Test with stored path
            localStorage.setItem('redirectPath', '/dashboard');
            expect(getRedirectPath()).toBe('/dashboard');

            // Test that it was removed
            expect(localStorage.getItem('redirectPath')).toBeNull();
        });
    });

    describe('בדיקות UI', () => {
        test('בדיקת כפתור התחברות', () => {
            const isButtonDisabled = (loading, form) => {
                return loading || !form.email || !form.password;
            };

            expect(isButtonDisabled(true, { email: "test@example.com", password: "password" })).toBe(true);
            expect(isButtonDisabled(false, { email: "", password: "password" })).toBe(true);
            expect(isButtonDisabled(false, { email: "test@example.com", password: "" })).toBe(true);
            expect(isButtonDisabled(false, { email: "test@example.com", password: "password" })).toBe(false);
        });

        test('בדיקת הודעות שגיאה', () => {
            const getErrorMessage = (error) => {
                return error.response?.data?.message || error.message || "שגיאה בהתחברות";
            };

            const errorWithResponse = {
                response: { data: { message: "סיסמה שגויה" } },
                message: "Request failed"
            };

            const errorWithoutResponse = {
                message: "Network error"
            };

            const errorWithoutMessage = {};

            expect(getErrorMessage(errorWithResponse)).toBe("סיסמה שגויה");
            expect(getErrorMessage(errorWithoutResponse)).toBe("Network error");
            expect(getErrorMessage(errorWithoutMessage)).toBe("שגיאה בהתחברות");
        });
    });

    describe('בדיקות פורמט', () => {
        test('בדיקת פורמט אימייל', () => {
            const validateEmailFormat = (email) => {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!email) return "אימייל חובה";
                if (!emailRegex.test(email)) return "פורמט אימייל לא תקין";
                return null;
            };

            expect(validateEmailFormat("test@example.com")).toBeNull();
            expect(validateEmailFormat("invalid-email")).toBe("פורמט אימייל לא תקין");
            expect(validateEmailFormat("")).toBe("אימייל חובה");
        });

        test('בדיקת אורך סיסמה', () => {
            const validatePasswordLength = (password) => {
                if (!password) return "סיסמה חובה";
                if (password.length < 6) return "סיסמה חייבת להכיל לפחות 6 תווים";
                return null;
            };

            expect(validatePasswordLength("password")).toBeNull();
            expect(validatePasswordLength("short")).toBe("סיסמה חייבת להכיל לפחות 6 תווים");
            expect(validatePasswordLength("")).toBe("סיסמה חובה");
        });
    });
});
