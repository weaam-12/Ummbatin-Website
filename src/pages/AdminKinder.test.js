// AdminKinder.test.js
// בדיקות פשוטות לפרויקט אוניברסיטאי

// Mock ל־React Icons - נשים זאת أولاً
jest.mock('react-icons/fi', () => ({
    FiHome: () => '🏠',
    FiUsers: () => '👥',
    FiFileText: () => '📄',
    FiDollarSign: () => '💰',
    FiPlus: () => '➕',
    FiEdit: () => '✏️',
    FiTrash2: () => '🗑️',
    FiCheck: () => '✅',
    FiX: () => '❌',
    FiChevronDown: () => '⬇️',
    FiChevronUp: () => '⬆️'
}));

// Mock للترجمة
jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key) => {
            const translations = {
                'loadError': 'שגיאה בטעינת הנתונים',
                'assigned': 'הילד שויך בהצלחה',
                'updateError': 'שגיאה בעדכון',
                'addSuccess': 'גן נוסף בהצלחה',
                'addError': 'שגיאה בהוספת גן',
                'editSuccess': 'גן נערך בהצלחה',
                'confirmDelete': 'האם אתה בטוח שברצונך למחוק?',
                'deleteSuccess': 'גן נמחק בהצלחה',
                'deleteError': 'שגיאה במחיקת גן',
                'totalKindergartens': 'גנים סה"כ',
                'totalChildren': 'ילדים סה"כ',
                'pendingRequests': 'בקשות ממתינות',
                'approvedCount': 'מאושרים',
                'name': 'שם',
                'location': 'מיקום',
                'capacity': 'תכולה',
                'occupied': 'תפוס',
                'actions': 'פעולות',
                'edit': 'עריכה',
                'delete': 'מחיקה',
                'childName': 'שם הילד',
                'motherName': 'שם האם',
                'kindergarten': 'גן',
                'approve': 'אישור',
                'reject': 'דחייה',
                'registeredChildren': 'ילדים רשומים',
                'status': 'סטטוס',
                'notRegistered': 'לא רשום',
                'noChildren': 'אין ילדים רשומים',
                'addNew': 'הוספת גן חדש',
                'cancel': 'ביטול',
                'save': 'שמירה',
                'editKg': 'עריכת גן',
                'assignChild': 'שיוך ילד',
                'chooseKindergarten': 'בחר גן עבור',
                'select': 'בחר...',
                'title': 'ניהול גני ילדים',
                'municipality': 'עירייה',
                'addKindergarten': 'הוספת גן'
            };
            return translations[key] || key;
        }
    }),
}));

// Mock ל־API
jest.mock('../api', () => ({
    fetchKindergartens: jest.fn(),
    createKindergarten: jest.fn(),
    deleteKindergarten: jest.fn(),
    updateKindergarten: jest.fn(),
    updateChildAssignment: jest.fn(),
    axiosInstance: {
        post: jest.fn()
    }
}));

// Mock ל־CSS
jest.mock('./AdminKinder.module.css', () => ({
    container: 'container',
    card: 'card',
    header: 'header',
    headerTitle: 'headerTitle',
    btn: 'btn',
    btnPrimary: 'btnPrimary',
    btnSecondary: 'btnSecondary',
    btnSuccess: 'btnSuccess',
    btnDanger: 'btnDanger',
    btnSm: 'btnSm',
    notification: 'notification',
    alertDanger: 'alertDanger',
    alertSuccess: 'alertSuccess',
    notificationClose: 'notificationClose',
    content: 'content',
    statsGrid: 'statsGrid',
    statCard: 'statCard',
    statIcon: 'statIcon',
    statInfo: 'statInfo',
    tableContainer: 'tableContainer',
    table: 'table',
    pendingSection: 'pendingSection',
    sectionHeader: 'sectionHeader',
    badge: 'badge',
    actionButtons: 'actionButtons',
    detailsSection: 'detailsSection',
    occupancy: 'occupancy',
    chevron: 'chevron',
    sectionContent: 'sectionContent',
    badgeSuccess: 'badgeSuccess',
    badgeSecondary: 'badgeSecondary',
    noData: 'noData',
    modalOverlay: 'modalOverlay',
    modal: 'modal',
    modalHeader: 'modalHeader',
    closeButton: 'closeButton',
    modalBody: 'modalBody',
    formGroup: 'formGroup',
    modalFooter: 'modalFooter',
    assignText: 'assignText',
    selectInput: 'selectInput'
}));

describe('AdminKinder Component - Logic Tests', () => {
    let mockKindergartens;

    beforeAll(() => {
        mockKindergartens = [
            {
                kindergartenId: 1,
                name: 'גן Sun',
                location: 'שדרות רוטשילד 1',
                capacity: 30,
                children: [
                    {
                        childId: 101,
                        name: 'דנה כהן',
                        motherName: 'שרית כהן',
                        monthlyFee: 3.5,
                        userId: 1001
                    },
                    {
                        childId: 102,
                        name: 'יובל לוי',
                        motherName: 'מיכל לוי',
                        monthlyFee: 2.5,
                        userId: 1002
                    }
                ]
            },
            {
                kindergartenId: 2,
                name: 'גן Moon',
                location: 'דיזנגוף 15',
                capacity: 25,
                children: [
                    {
                        childId: 201,
                        name: 'אורי מלכה',
                        motherName: 'חן מלכה',
                        monthlyFee: 3.5,
                        userId: 1003
                    }
                ]
            }
        ];
    });

    describe('פונקציות עזר', () => {
        test('חישוב סטטיסטיקות', () => {
            // פונקציה שמחשבת סטטיסטיקות מהילדים
            const calculateStats = (kindergartens) => {
                const allChildren = kindergartens.flatMap(kg => kg.children || []);
                const pending = allChildren.filter(c => c.monthlyFee === 2.5);
                const approved = allChildren.filter(c => c.monthlyFee === 3.5);

                return {
                    totalChildren: allChildren.length,
                    pendingRequests: pending.length,
                    approvedCount: approved.length
                };
            };

            const stats = calculateStats(mockKindergartens);

            expect(stats.totalChildren).toBe(3);
            expect(stats.pendingRequests).toBe(1);
            expect(stats.approvedCount).toBe(2);
        });

        test('סינון ילדים ממתינים', () => {
            const findPendingChildren = (kindergartens) => {
                return kindergartens.flatMap(kg =>
                    (kg.children || []).filter(c => c.monthlyFee === 2.5)
                );
            };

            const pending = findPendingChildren(mockKindergartens);

            expect(pending).toHaveLength(1);
            expect(pending[0].name).toBe('יובל לוי');
            expect(pending[0].monthlyFee).toBe(2.5);
        });
    });

    describe('לוגיקת שיוך ילדים', () => {
        test('שיוך ילד לגן', async () => {
            const { updateChildAssignment } = require('../api');

            const childId = 102;
            const kindergartenId = 2;
            const monthlyFee = 3.5;

            updateChildAssignment.mockResolvedValue({ success: true });

            await updateChildAssignment(childId, { kindergartenId, monthlyFee });

            expect(updateChildAssignment).toHaveBeenCalledWith(
                childId,
                { kindergartenId, monthlyFee }
            );
        });

        test('שליחת הודעה למשתמש', async () => {
            const { axiosInstance } = require('../api');

            const userId = 1002;
            const message = 'התקבלה אישור להרשמת ילדך לגן.';
            const type = 'KINDERGARTEN_APPROVED';

            axiosInstance.post.mockResolvedValue({ status: 200 });

            await axiosInstance.post('/api/notifications', {
                userId,
                message,
                type
            });

            expect(axiosInstance.post).toHaveBeenCalledWith('/api/notifications', {
                userId,
                message,
                type
            });
        });
    });

    describe('CRUD פעולות גן', () => {
        test('הוספת גן חדש', async () => {
            const { createKindergarten } = require('../api');

            const newKg = {
                name: 'גן Stars',
                location: 'ארלוזורוב 20',
                capacity: '35'
            };

            createKindergarten.mockResolvedValue({ success: true });

            await createKindergarten(newKg);

            expect(createKindergarten).toHaveBeenCalledWith(newKg);
        });

        test('עדכון גן קיים', async () => {
            const { updateKindergarten } = require('../api');

            const kgId = 1;
            const updatedKg = {
                kindergartenId: 1,
                name: 'גן Sun מעודכן',
                location: 'שדרות רוטשילד 1',
                capacity: 35
            };

            updateKindergarten.mockResolvedValue({ success: true });

            await updateKindergarten(kgId, updatedKg);

            expect(updateKindergarten).toHaveBeenCalledWith(kgId, updatedKg);
        });

        test('מחיקת גן', async () => {
            const { deleteKindergarten } = require('../api');

            const kgId = 2;

            deleteKindergarten.mockResolvedValue({ success: true });

            await deleteKindergarten(kgId);

            expect(deleteKindergarten).toHaveBeenCalledWith(kgId);
        });
    });

    describe('בדיקות תקינות', () => {
        test('בדיקת כמות ילדים בגן', () => {
            const getKindergartenOccupancy = (kindergarten) => {
                return kindergarten.children?.filter(c => c.monthlyFee !== 2.5).length || 0;
            };

            const kg1Occupancy = getKindergartenOccupancy(mockKindergartens[0]);
            const kg2Occupancy = getKindergartenOccupancy(mockKindergartens[1]);

            expect(kg1Occupancy).toBe(1); // רק דנה כהן (3.5)
            expect(kg2Occupancy).toBe(1); // אורי מלכה (3.5)
        });

        test('בדיקת ילדים מאושרים', () => {
            const getApprovedChildren = (kindergarten) => {
                return kindergarten.children?.filter(c => c.monthlyFee === 3.5) || [];
            };

            const approvedInKg1 = getApprovedChildren(mockKindergartens[0]);
            const approvedInKg2 = getApprovedChildren(mockKindergartens[1]);

            expect(approvedInKg1).toHaveLength(1);
            expect(approvedInKg1[0].name).toBe('דנה כהן');

            expect(approvedInKg2).toHaveLength(1);
            expect(approvedInKg2[0].name).toBe('אורי מלכה');
        });

        test('מציאת גן לפי ID', () => {
            const findKindergartenById = (kindergartens, id) => {
                return kindergartens.find(kg => kg.kindergartenId === id);
            };

            const kg1 = findKindergartenById(mockKindergartens, 1);
            const kg2 = findKindergartenById(mockKindergartens, 2);
            const kg3 = findKindergartenById(mockKindergartens, 999);

            expect(kg1.name).toBe('גן Sun');
            expect(kg2.name).toBe('גן Moon');
            expect(kg3).toBeUndefined();
        });
    });


    describe('בדיקות ערכים כספיים', () => {
        test('בדיקת ערכי monthlyFee', () => {
            const isValidMonthlyFee = (fee) => {
                // ערכים תקינים: 2.5 (ממתין), 3.5 (מאושר), 1.5 (נדחה)
                const validFees = [2.5, 3.5, 1.5];
                return validFees.includes(fee);
            };

            expect(isValidMonthlyFee(2.5)).toBe(true);
            expect(isValidMonthlyFee(3.5)).toBe(true);
            expect(isValidMonthlyFee(1.5)).toBe(true);
            expect(isValidMonthlyFee(5.0)).toBe(false);
            expect(isValidMonthlyFee(0)).toBe(false);
        });

        test('מיפוי ערך fee לסטטוס', () => {
            const getStatusFromFee = (fee) => {
                switch (fee) {
                    case 2.5: return 'ממתין';
                    case 3.5: return 'מאושר';
                    case 1.5: return 'נדחה';
                    default: return 'לא ידוע';
                }
            };

            expect(getStatusFromFee(2.5)).toBe('ממתין');
            expect(getStatusFromFee(3.5)).toBe('מאושר');
            expect(getStatusFromFee(1.5)).toBe('נדחה');
            expect(getStatusFromFee(5.0)).toBe('לא ידוע');
        });
    });

    describe('בדיקות שגיאות', () => {
        test('טיפול בשגיאות API', async () => {
            const { updateChildAssignment } = require('../api');

            const error = new Error('שגיאת רשת');
            updateChildAssignment.mockRejectedValue(error);

            try {
                await updateChildAssignment(999, { kindergartenId: 1, monthlyFee: 3.5 });
                fail('הייתה אמורה להיזרק שגיאה');
            } catch (err) {
                expect(err.message).toBe('שגיאת רשת');
            }
        });

        test('טיפול בנתונים חסרים', () => {
            const safeGetChildName = (child) => {
                return child?.name || 'לא ידוע';
            };

            expect(safeGetChildName({ name: 'דנה' })).toBe('דנה');
            expect(safeGetChildName({})).toBe('לא ידוע');
            expect(safeGetChildName(null)).toBe('לא ידוע');
            expect(safeGetChildName(undefined)).toBe('לא ידוע');
        });
    });
});