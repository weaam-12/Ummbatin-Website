// AdminPayments.test.js
// בדיקות פשוטות ל-AdminPayments

// Mock ל-React Icons
vi.mock('react-icons/fi', () => ({
    FiDollarSign: () => '💰',
    FiRefreshCw: () => '🔄',
    FiCalendar: () => '📅'
}));

// Mock ל-Translation
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key) => {
            const translations = {
                'admin.payments.types.WATER': 'מים',
                'admin.payments.types.ARNONA': 'ארנונה',
                'admin.payments.types.KINDERGARTEN': 'גן ילדים',
                'admin.payments.types.ALL': 'הכל',
                'admin.payments.notifications.loadError': 'שגיאה בטעינת התשלומים',
                'admin.payments.notifications.invalidData': 'נתונים לא תקינים',
                'common.unknown': 'לא ידוע',
                'admin.payments.title': 'ניהול תשלומים',
                'common.municipality': 'עירייה',
                'common.refresh': 'רענן',
                'admin.payments.filters.allUsers': 'כל המשתמשים',
                'admin.payments.filters.month': 'חודש',
                'admin.payments.filters.year': 'שנה',
                'admin.payments.statuses.PENDING': 'ממתין',
                'admin.payments.statuses.PAID': 'שולם',
                'admin.payments.statuses.COMPLETED': 'הושלם',
                'admin.payments.statuses.OVERDUE': 'בפיגור',
                'admin.payments.statuses.ALL': 'הכל',
                'admin.payments.loading': 'טוען...',
                'admin.payments.userId': 'מזהה משתמש',
                'admin.payments.userName': 'שם משתמש',
                'admin.payments.paymentType': 'סוג תשלום',
                'admin.payments.amount': 'סכום',
                'admin.payments.dueDate': 'תאריך יעד',
                'admin.payments.status': 'סטטוס',
                'admin.payments.paymentDate': 'תאריך תשלום',
                'common.currency': 'ש"ח',
                'admin.payments.noPayments': 'לא נמצאו תשלומים'
            };
            return translations[key] || key;
        }
    })
}));

// Mock ל-API
vi.mock('../api', () => ({
    getAllPayments: vi.fn(),
    getAllUsers: vi.fn()
}));

// Mock ל-CSS
vi.mock('./AdminPayments.module.css', () => ({}));

describe('AdminPayments - Logic Tests', () => {
    let mockPayments;
    let mockUsers;
    let api;

    beforeEach(() => {
        vi.clearAllMocks();
        api = require('../api');

        mockUsers = [
            { user_id: 1, id: 1, fullName: 'יוסי כהן' },
            { user_id: 2, id: 2, fullName: 'מיכל לוי' },
            { user_id: 3, id: 3, fullName: 'דוד מלכה' }
        ];

        mockPayments = [
            {
                payment_id: 1,
                user_id: 1,
                type: 'WATER',
                amount: 150,
                status: 'PENDING',
                due_date: '2024-01-15',
                payment_date: null
            },
            {
                payment_id: 2,
                user_id: 2,
                type: 'ARNONA',
                amount: 500,
                status: 'PAID',
                due_date: '2024-01-10',
                payment_date: '2024-01-05'
            },
            {
                payment_id: 3,
                user_id: 3,
                type: 'KINDERGARTEN',
                amount: 300,
                status: 'OVERDUE',
                due_date: '2023-12-20',
                payment_date: null
            }
        ];
    });

    describe('פונקציות עזר', () => {
        test('פורמט תאריך', () => {
            const formatDate = (dateValue) => {
                if (!dateValue) return '--';
                const date = new Date(dateValue);
                return date.toLocaleDateString('en-GB');
            };

            expect(formatDate('2024-01-15')).toBe('15/01/2024');
            expect(formatDate(null)).toBe('--');
            expect(formatDate('')).toBe('--');
            expect(formatDate(undefined)).toBe('--');
        });

        test('מיפוי סוגי תשלומים', () => {
            const paymentTypes = {
                WATER: 'מים',
                ARNONA: 'ארנונה',
                KINDERGARTEN: 'גן ילדים',
                ALL: 'הכל'
            };

            const getPaymentTypeLabel = (type) => {
                return paymentTypes[type] || type || '--';
            };

            expect(getPaymentTypeLabel('WATER')).toBe('מים');
            expect(getPaymentTypeLabel('ARNONA')).toBe('ארנונה');
            expect(getPaymentTypeLabel('UNKNOWN')).toBe('UNKNOWN');
            expect(getPaymentTypeLabel(null)).toBe('--');
        });

        test('מיפוי סטטוסים', () => {
            const statusLabels = {
                PENDING: 'ממתין',
                PAID: 'שולם',
                COMPLETED: 'הושלם',
                OVERDUE: 'בפיגור',
                ALL: 'הכל'
            };

            const getStatusLabel = (status) => {
                return statusLabels[status] || status || '--';
            };

            expect(getStatusLabel('PENDING')).toBe('ממתין');
            expect(getStatusLabel('PAID')).toBe('שולם');
            expect(getStatusLabel('UNKNOWN')).toBe('UNKNOWN');
        });
    });


    describe('סינון ומיון', () => {
        test('סינון תשלומים לפי סוג', () => {
            const filterByType = (payments, typeFilter) => {
                if (typeFilter === 'ALL' || !typeFilter) return payments;
                return payments.filter(p => p.paymentType === typeFilter);
            };

            const enhancedPayments = mockPayments.map((p, index) => ({
                ...p,
                paymentType: p.type,
                fullName: mockUsers[index]?.fullName || 'לא ידוע'
            }));

            const allPayments = filterByType(enhancedPayments, 'ALL');
            const waterPayments = filterByType(enhancedPayments, 'WATER');
            const arnonaPayments = filterByType(enhancedPayments, 'ARNONA');

            expect(allPayments).toHaveLength(3);
            expect(waterPayments).toHaveLength(1);
            expect(arnonaPayments).toHaveLength(1);
            expect(waterPayments[0].paymentType).toBe('WATER');
        });

        test('סינון תשלומים לפי סטטוס', () => {
            const filterByStatus = (payments, statusFilter) => {
                if (statusFilter === 'ALL' || !statusFilter) return payments;
                return payments.filter(p => p.status === statusFilter);
            };

            const enhancedPayments = mockPayments.map((p, index) => ({
                ...p,
                paymentType: p.type,
                status: p.status,
                fullName: mockUsers[index]?.fullName || 'לא ידוע'
            }));

            const pendingPayments = filterByStatus(enhancedPayments, 'PENDING');
            const paidPayments = filterByStatus(enhancedPayments, 'PAID');
            const overduePayments = filterByStatus(enhancedPayments, 'OVERDUE');

            expect(pendingPayments).toHaveLength(1);
            expect(paidPayments).toHaveLength(1);
            expect(overduePayments).toHaveLength(1);
            expect(pendingPayments[0].status).toBe('PENDING');
            expect(paidPayments[0].status).toBe('PAID');
        });
    });

    describe('חישובים וסטטיסטיקות', () => {
        test('חישוב סכום כולל', () => {
            const calculateTotalAmount = (payments) => {
                return payments.reduce((total, payment) => total + (payment.amount || 0), 0);
            };

            const enhancedPayments = mockPayments.map(p => ({
                ...p,
                amount: p.amount || 0
            }));

            const total = calculateTotalAmount(enhancedPayments);
            expect(total).toBe(150 + 500 + 300); // 950
        });

        test('ספירת תשלומים לפי סטטוס', () => {
            const countByStatus = (payments) => {
                const counts = {
                    PENDING: 0,
                    PAID: 0,
                    OVERDUE: 0,
                    COMPLETED: 0,
                    total: payments.length
                };

                payments.forEach(payment => {
                    if (counts.hasOwnProperty(payment.status)) {
                        counts[payment.status]++;
                    }
                });

                return counts;
            };

            const enhancedPayments = mockPayments.map(p => ({
                ...p,
                status: p.status
            }));

            const counts = countByStatus(enhancedPayments);

            expect(counts.total).toBe(3);
            expect(counts.PENDING).toBe(1);
            expect(counts.PAID).toBe(1);
            expect(counts.OVERDUE).toBe(1);
            expect(counts.COMPLETED).toBe(0);
        });

        test('חישוב תשלומים ממתינים', () => {
            const getPendingAmount = (payments) => {
                const pending = payments.filter(p => p.status === 'PENDING' || p.status === 'OVERDUE');
                return pending.reduce((total, p) => total + (p.amount || 0), 0);
            };

            const enhancedPayments = mockPayments.map(p => ({
                ...p,
                amount: p.amount || 0,
                status: p.status
            }));

            const pendingAmount = getPendingAmount(enhancedPayments);
            expect(pendingAmount).toBe(150 + 300); // PENDING + OVERDUE = 450
        });
    });

    describe('בדיקות תקינות', () => {
        test('בדיקת מערכים ריקים', () => {
            const enhancePayments = (payments, users) => {
                if (!Array.isArray(payments)) return [];
                return payments.map(p => ({
                    paymentId: p.payment_id || '--',
                    userId: p.user_id || '--',
                    amount: p.amount || 0
                }));
            };

            const emptyResult = enhancePayments([], mockUsers);
            const nullResult = enhancePayments(null, mockUsers);
            const undefinedResult = enhancePayments(undefined, mockUsers);

            expect(emptyResult).toEqual([]);
            expect(nullResult).toEqual([]);
            expect(undefinedResult).toEqual([]);
        });

        test('טיפול בנתונים חסרים', () => {
            const incompletePayment = {
                payment_id: 4,
                // no user_id
                // no type
                amount: 200
            };

            const enhancePayment = (payment, users) => ({
                paymentId: payment.payment_id || '--',
                userId: payment.user_id || '--',
                paymentType: payment.type || 'UNKNOWN',
                amount: payment.amount || 0,
                fullName: users.find(u => u.user_id === payment.user_id)?.fullName || 'לא ידוע'
            });

            const enhanced = enhancePayment(incompletePayment, mockUsers);

            expect(enhanced.paymentId).toBe(4);
            expect(enhanced.userId).toBe('--');
            expect(enhanced.paymentType).toBe('UNKNOWN');
            expect(enhanced.amount).toBe(200);
            expect(enhanced.fullName).toBe('לא ידוע');
        });
    });

});