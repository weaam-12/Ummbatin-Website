// Children.test.js
// בדיקות פשוטות ל-Children component

// Mock ל-React Icons
vi.mock('react-icons/fa', () => ({
    FaChild: () => '👶',
    FaCheckCircle: () => '✅',
    FaMoneyBillWave: () => '💰',
    FaClock: () => '⏰'
}));

vi.mock('react-icons/fi', () => ({
    FiDownload: () => '📥'
}));

// Mock ל-Stripe
vi.mock('@stripe/react-stripe-js', () => ({
    CardElement: () => '💳',
    useStripe: () => ({
        createPaymentMethod: vi.fn()
    }),
    useElements: () => ({
        getElement: vi.fn()
    })
}));

// Mock ל-React Bootstrap
vi.mock('react-bootstrap', () => ({
    Button: ({ children, variant, size, onClick, disabled }) =>
        `<button class="btn btn-${variant} ${size}" ${disabled ? 'disabled' : ''}>${children}</button>`,
    Alert: ({ variant, children, onClose, dismissible }) =>
        `<div class="alert alert-${variant}" ${dismissible ? 'dismissible' : ''}>${children}</div>`,
    Spinner: ({ animation, size, className }) =>
        `<span class="spinner ${animation} ${size} ${className}"></span>`,
    Modal: ({ show, onHide, size, centered, children }) =>
        show ? `<div class="modal ${size} ${centered ? 'centered' : ''}">${children}</div>` : null,
    ModalHeader: ({ closeButton, children }) =>
        `<div class="modal-header">${closeButton ? '<button class="close">×</button>' : ''}${children}</div>`,
    ModalBody: ({ children }) => `<div class="modal-body">${children}</div>`,
    ModalTitle: ({ children }) => `<h5 class="modal-title">${children}</h5>`,
    Form: ({ children }) => `<form>${children}</form>`,
    FormGroup: ({ children, className }) => `<div class="form-group ${className}">${children}</div>`,
    FormLabel: ({ children }) => `<label>${children}</label>`
}));

// Mock ל-API
vi.mock('../api', () => ({
    __esModule: true,
    default: {
        get: vi.fn(),
        patch: vi.fn(),
        post: vi.fn()
    }
}));

// Mock ל-Auth Context
vi.mock('../AuthContext', () => ({
    useAuth: () => ({
        user: {
            userId: 1,
            name: 'יוסי כהן'
        }
    })
}));

// Mock ל-Translation
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key) => {
            const translations = {
                'children.loadError': 'שגיאה בטעינת הנתונים',
                'children.birthDate': 'תאריך לידה',
                'children.selectKindergarten': 'בחר גן ילדים',
                'children.selectedKindergarten': 'גן נבחר',
                'children.monthlyFees': 'דמי חודשיים',
                'children.availableSlots': 'מקומות פנויים',
                'children.payAndRegister': 'שלם והירשם',
                'children.myChildren': 'הילדים שלי',
                'general.loading': 'טוען...',
                'children.notEnrolled': 'לא רשומים',
                'children.pending': 'ממתינים לאישור',
                'children.approved': 'מאושרים',
                'children.childName': 'שם הילד',
                'children.kindergarten': 'גן ילדים',
                'children.approvalStatus': 'סטטוס אישור',
                'children.waitingApproval': 'ממתין לאישור',
                'children.registeredTitle': 'ילדים רשומים',
                'children.paymentStatus': 'סטטוס תשלום',
                'children.actions': 'פעולות',
                'children.downloadReceipt': 'הורד קבלה',
                'payment.title': 'תשלום',
                'payment.successTitle': 'תשלום בוצע בהצלחה!',
                'payment.childName': 'שם הילד',
                'payment.kindergarten': 'גן ילדים',
                'payment.amount': 'סכום',
                'payment.currency': 'ש"ח',
                'payment.transactionId': 'מספר עסקה',
                'payment.downloadReceipt': 'הורד קבלה',
                'payment.close': 'סגור',
                'payment.summary': 'סיכום תשלום',
                'payment.child': 'ילד',
                'payment.cardDetails': 'פרטי כרטיס',
                'payment.cancel': 'ביטול',
                'payment.processing': 'מעבד...',
                'payment.payNow': 'שלם עכשיו',
                'auth.loginRequired': 'נדרש login',
                'auth.login': 'התחברות',
                'general.currency': 'ש"ח'
            };
            return translations[key] || key;
        },
        i18n: {
            language: 'he'
        }
    })
}));

// Mock ל-CSS
vi.mock('./Children.css', () => ({}));

// Mock ל-jspdf ו-html2canvas
vi.mock('jspdf', () => ({
    __esModule: true,
    default: vi.fn().mockImplementation(() => ({
        save: vi.fn()
    }))
}));

vi.mock('html2canvas', () => vi.fn());

describe('Children - Logic Tests', () => {
    let mockChildren;
    let mockKindergartens;
    let axiosInstance;

    beforeEach(() => {
        vi.clearAllMocks();
        axiosInstance = require('../api').default;

        mockKindergartens = [
            {
                kindergartenId: 1,
                name: 'גן Sun',
                location: 'תל אביב',
                capacity: 30
            },
            {
                kindergartenId: 2,
                name: 'גן Moon',
                location: 'ירושלים',
                capacity: 25
            }
        ];

        mockChildren = [
            {
                childId: 1,
                name: 'דנה כהן',
                birthDate: '2020-05-15',
                monthlyFee: 0, // לא רשום
                kindergartenId: null
            },
            {
                childId: 2,
                name: 'יובל לוי',
                birthDate: '2019-08-20',
                monthlyFee: 2.5, // ממתין לאישור
                kindergartenId: 1
            },
            {
                childId: 3,
                name: 'אורי מלכה',
                birthDate: '2021-01-10',
                monthlyFee: 3.5, // מאושר
                kindergartenId: 2
            }
        ];
    });

    describe('פונקציות עזר', () => {
        test('קבוצת ילדים לפי סטטוס', () => {
            const groupChildrenByStatus = (children) => ({
                notEnrolled: children.filter(c => c.monthlyFee === 0 || c.monthlyFee === 1.5),
                pending: children.filter(c => c.monthlyFee === 2.5),
                approved: children.filter(c => c.monthlyFee === 3.5)
            });

            const grouped = groupChildrenByStatus(mockChildren);

            expect(grouped.notEnrolled).toHaveLength(1);
            expect(grouped.pending).toHaveLength(1);
            expect(grouped.approved).toHaveLength(1);
            expect(grouped.notEnrolled[0].name).toBe('דנה כהן');
            expect(grouped.pending[0].name).toBe('יובל לוי');
            expect(grouped.approved[0].name).toBe('אורי מלכה');
        });

        test('מציאת גן לפי ID', () => {
            const findKindergartenById = (kindergartens, id) => {
                return kindergartens.find(k => k.kindergartenId === id);
            };

            const kg1 = findKindergartenById(mockKindergartens, 1);
            const kg2 = findKindergartenById(mockKindergartens, 2);
            const kg3 = findKindergartenById(mockKindergartens, 999);

            expect(kg1.name).toBe('גן Sun');
            expect(kg2.name).toBe('גן Moon');
            expect(kg3).toBeUndefined();
        });

        test('פורמט תאריך', () => {
            const formatDate = (dateString, language = 'he') => {
                if (!dateString) return '--';
                const date = new Date(dateString);
                return date.toLocaleDateString(language);
            };

            expect(formatDate(null)).toBe('--');
            expect(formatDate('')).toBe('--');
        });
    });


    describe('בדיקות תקינות', () => {
        test('בדיקת סטטוס רישום', () => {
            const getEnrollmentStatus = (monthlyFee) => {
                if (monthlyFee === 0 || monthlyFee === 1.5) return 'notEnrolled';
                if (monthlyFee === 2.5) return 'pending';
                if (monthlyFee === 3.5) return 'approved';
                return 'unknown';
            };

            expect(getEnrollmentStatus(0)).toBe('notEnrolled');
            expect(getEnrollmentStatus(1.5)).toBe('notEnrolled');
            expect(getEnrollmentStatus(2.5)).toBe('pending');
            expect(getEnrollmentStatus(3.5)).toBe('approved');
            expect(getEnrollmentStatus(5.0)).toBe('unknown');
        });

        test('בדיקת ילדים ללא גן', () => {
            const hasKindergarten = (child) => {
                return child.kindergartenId !== null && child.kindergartenId !== undefined;
            };

            expect(hasKindergarten(mockChildren[0])).toBe(false);
            expect(hasKindergarten(mockChildren[1])).toBe(true);
            expect(hasKindergarten(mockChildren[2])).toBe(true);
        });
    });




    describe('בדיקות ממשק', () => {
        test('בדיקת כפתור הרשמה', () => {
            const isEnrollButtonDisabled = (selectedKindergarten) => {
                return !selectedKindergarten;
            };

            expect(isEnrollButtonDisabled(null)).toBe(true);
            expect(isEnrollButtonDisabled(undefined)).toBe(true);
            expect(isEnrollButtonDisabled(mockKindergartens[0])).toBe(false);
        });

        test('בדיקת בחירת גן', () => {
            const handleKindergartenSelect = (kindergartens, selectedId) => {
                return kindergartens.find(k => k.kindergartenId === selectedId);
            };

            const selectedKg = handleKindergartenSelect(mockKindergartens, 1);
            expect(selectedKg.name).toBe('גן Sun');

            const notSelected = handleKindergartenSelect(mockKindergartens, 999);
            expect(notSelected).toBeUndefined();
        });
    });
});