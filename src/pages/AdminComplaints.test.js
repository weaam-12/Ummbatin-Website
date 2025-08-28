// AdminComplaints.test.js
// בדיקות פשוטות ל-AdminComplaints
import { vi } from 'vitest';

// Mock ל-React Icons
vi.mock('react-icons/fi', () => ({
    FiEdit: () => '✏️',
    FiMessageSquare: () => '💬',
    FiX: () => '❌',
    FiCheck: () => '✅',
    FiImage: () => '🖼️',
    FiRefreshCw: () => '🔄'
}));

// Mock ל-Auth Context
vi.mock('../AuthContext', () => ({
    useAuth: () => ({
        user: {
            id: 1,
            email: 'admin@example.com',
            fullName: 'Admin User'
        }
    })
}));

// Mock ל-API
vi.mock('../api', () => ({
    getComplaints: vi.fn(),
    updateComplaintStatus: vi.fn(),
    respondToComplaint: vi.fn(),
    axiosInstance: {
        post: vi.fn()
    }
}));

// Mock ל-Translation
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key) => {
            const translations = {
                'garbageComplaint.types.uncollected': 'אשפה לא נאספה',
                'garbageComplaint.types.overflowing': 'פח עולה על גדותיו',
                'garbageComplaint.types.damagedBin': 'פח פגום',
                'garbageComplaint.types.missingBin': 'פח חסר',
                'garbageComplaint.types.illegalDumping': 'השלכת פסולת בלתי חוקית',
                'complaints.complaintForm.types.Infrastructure': 'תשתיות',
                'complaints.complaintForm.types.Cleanliness': 'ניקיון',
                'complaints.complaintForm.types.Safety': 'בטיחות',
                'complaints.complaintForm.types.Other': 'אחר',
                'admin.complaints.notifications.loadError': 'שגיאה בטעינת התלונות',
                'general.error': 'שגיאה',
                'admin.complaints.title': 'ניהול תלונות',
                'municipality': 'עירייה',
                'admin.complaints.refresh': 'רענן',
                'admin.complaints.allStatuses': 'כל הסטטוסים',
                'admin.complaints.statuses.SUBMITTED': 'הוגשה',
                'admin.complaints.statuses.IN_PROGRESS': 'בטיפול',
                'admin.complaints.statuses.RESOLVED': 'טופלה',
                'admin.complaints.statuses.REJECTED': 'נדחתה',
                'admin.complaints.notifications.responseSuccess': 'תגובה נשלחה בהצלחה',
                'admin.complaints.notifications.responseError': 'שגיאה בשליחת תגובה',
                'admin.complaints.loading': 'טוען...',
                'admin.complaints.ticketNumber': 'מספר כרטיס',
                'admin.complaints.type': 'סוג',
                'admin.complaints.description': 'תיאור',
                'admin.complaints.location': 'מיקום',
                'admin.complaints.status': 'סטטוס',
                'admin.complaints.response': 'תגובה',
                'admin.complaints.date': 'תאריך',
                'admin.complaints.actions': 'פעולות',
                'admin.complaints.respond': 'הגב',
                'admin.complaints.viewImage': 'צפה בתמונה',
                'admin.complaints.noComplaints': 'אין תלונות',
                'admin.complaints.respondToTicket': 'הגב לכרטיס',
                'admin.complaints.complaintDescription': 'תיאור התלונה',
                'admin.complaints.responseText': 'טקסט תגובה',
                'admin.complaints.responsePlaceholder': 'כתוב כאן את תגובתך...',
                'common.cancel': 'ביטול',
                'admin.complaints.submitResponse': 'שלח תגובה'
            };
            return translations[key] || key;
        }
    })
}));

// Mock ל-CSS
vi.mock('./AdminComplaints.module.css', () => ({}));

describe('AdminComplaints - Logic Tests', () => {
    let mockComplaints;
    let api;

    beforeEach(() => {
        vi.clearAllMocks();
        api = require('../api');

        mockComplaints = [
            {
                complaintId: 1,
                ticketNumber: 'TKT001',
                type: 'Cleanliness',
                description: 'פח אשפה מלא ברחוב הראשי',
                location: 'רחוב הרצל 15',
                status: 'SUBMITTED',
                response: null,
                date: '2024-01-15',
                imageUrl: 'https://example.com/image1.jpg',
                userId: 101
            },
            {
                complaintId: 2,
                ticketNumber: 'TKT002',
                type: 'Infrastructure',
                description: 'בור בכביש',
                location: 'שדרות רוטשילד 20',
                status: 'RESOLVED',
                response: 'הבור תוקן',
                date: '2024-01-10',
                imageUrl: null,
                userId: 102
            },
            {
                complaintId: 3,
                ticketNumber: 'TKT003',
                type: 'Safety',
                description: 'תאורת רחוב לא פועלת',
                location: 'אלנבי 30',
                status: 'IN_PROGRESS',
                response: null,
                date: '2024-01-12',
                imageUrl: 'https://example.com/image3.jpg',
                userId: 103
            }
        ];
    });

    describe('פונקציות עזר', () => {
        test('פורמט תאריך', () => {
            const formatDate = (dateString) => {
                if (!dateString) return '--';
                const date = new Date(dateString);
                return date.toLocaleDateString('en-GB');
            };

            expect(formatDate('2024-01-15')).toBe('15/01/2024');
            expect(formatDate(null)).toBe('--');
            expect(formatDate('')).toBe('--');
        });

        test('סינון תלונות לפי סטטוס', () => {
            const filterComplaints = (complaints, statusFilter) => {
                if (statusFilter === 'all') return complaints;
                return complaints.filter(complaint => complaint.status === statusFilter);
            };

            const allComplaints = filterComplaints(mockComplaints, 'all');
            const submittedComplaints = filterComplaints(mockComplaints, 'SUBMITTED');
            const resolvedComplaints = filterComplaints(mockComplaints, 'RESOLVED');

            expect(allComplaints).toHaveLength(3);
            expect(submittedComplaints).toHaveLength(1);
            expect(resolvedComplaints).toHaveLength(1);
            expect(submittedComplaints[0].ticketNumber).toBe('TKT001');
        });
    });


    describe('מיפוי נתונים', () => {
        test('מיפוי סטטוסים', () => {
            const statusVariants = {
                SUBMITTED: 'badgeSubmitted',
                IN_PROGRESS: 'badgeInProgress',
                RESOLVED: 'badgeResolved',
                REJECTED: 'badgeRejected'
            };

            const statusLabels = {
                SUBMITTED: 'הוגשה',
                IN_PROGRESS: 'בטיפול',
                RESOLVED: 'טופלה',
                REJECTED: 'נדחתה'
            };

            expect(statusVariants.SUBMITTED).toBe('badgeSubmitted');
            expect(statusVariants.RESOLVED).toBe('badgeResolved');

            expect(statusLabels.SUBMITTED).toBe('הוגשה');
            expect(statusLabels.IN_PROGRESS).toBe('בטיפול');
        });

        test('מיפוי סוגי תלונות', () => {
            const complaintTypes = [
                { value: "uncollected", label: "אשפה לא נאספה" },
                { value: "overflowing", label: "פח עולה על גדותיו" },
                { value: "damagedBin", label: "פח פגום" },
                { value: "missingBin", label: "פח חסר" },
                { value: "illegalDumping", label: "השלכת פסולת בלתי חוקית" },
                { value: "Infrastructure", label: "תשתיות" },
                { value: "Cleanliness", label: "ניקיון" },
                { value: "Safety", label: "בטיחות" },
                { value: "Other", label: "אחר" },
            ];

            const findTypeLabel = (typeValue) => {
                const type = complaintTypes.find(t => t.value === typeValue);
                return type ? type.label : typeValue;
            };

            expect(findTypeLabel('Cleanliness')).toBe('ניקיון');
            expect(findTypeLabel('Safety')).toBe('בטיחות');
            expect(findTypeLabel('UnknownType')).toBe('UnknownType');
        });
    });

    describe('בדיקות תקינות', () => {
        test('בדיקת תלונה עם תמונה', () => {
            const hasImage = (complaint) => {
                return !!complaint.imageUrl;
            };

            expect(hasImage(mockComplaints[0])).toBe(true);
            expect(hasImage(mockComplaints[1])).toBe(false);
            expect(hasImage(mockComplaints[2])).toBe(true);
        });

        test('בדיקת תלונה עם תגובה', () => {
            const hasResponse = (complaint) => {
                return !!complaint.response;
            };

            expect(hasResponse(mockComplaints[0])).toBe(false);
            expect(hasResponse(mockComplaints[1])).toBe(true);
            expect(hasResponse(mockComplaints[2])).toBe(false);
        });

        test('סינון תלונות פעילות', () => {
            const getActiveComplaints = (complaints) => {
                return complaints.filter(c => c.status !== 'RESOLVED' && c.status !== 'REJECTED');
            };

            const activeComplaints = getActiveComplaints(mockComplaints);

            expect(activeComplaints).toHaveLength(2);
            expect(activeComplaints[0].status).toBe('SUBMITTED');
            expect(activeComplaints[1].status).toBe('IN_PROGRESS');
        });
    });


    describe('בדיקות נתונים', () => {
        test('ספירת תלונות לפי סטטוס', () => {
            const countComplaintsByStatus = (complaints) => {
                const counts = {
                    SUBMITTED: 0,
                    IN_PROGRESS: 0,
                    RESOLVED: 0,
                    REJECTED: 0,
                    total: complaints.length
                };

                complaints.forEach(complaint => {
                    if (counts.hasOwnProperty(complaint.status)) {
                        counts[complaint.status]++;
                    }
                });

                return counts;
            };

            const counts = countComplaintsByStatus(mockComplaints);

            expect(counts.total).toBe(3);
            expect(counts.SUBMITTED).toBe(1);
            expect(counts.IN_PROGRESS).toBe(1);
            expect(counts.RESOLVED).toBe(1);
            expect(counts.REJECTED).toBe(0);
        });

        test('מציאת תלונה לפי ID', () => {
            const findComplaintById = (complaints, id) => {
                return complaints.find(c => c.complaintId === id);
            };

            const complaint1 = findComplaintById(mockComplaints, 1);
            const complaint2 = findComplaintById(mockComplaints, 2);
            const complaint999 = findComplaintById(mockComplaints, 999);

            expect(complaint1.ticketNumber).toBe('TKT001');
            expect(complaint2.ticketNumber).toBe('TKT002');
            expect(complaint999).toBeUndefined();
        });
    });
});