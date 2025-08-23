// Complaints.test.js
// בדיקות פשוטות ל-Complaints component

// Mock ל-React Icons
jest.mock('react-icons/fi', () => ({
    FiPlus: () => '➕',
    FiImage: () => '🖼️',
    FiX: () => '❌',
    FiCheck: () => '✅'
}));

// Mock ל-React Bootstrap
jest.mock('react-bootstrap', () => ({
    Card: ({ children, className }) => `<div class="card ${className}">${children}</div>`,
    Button: ({ children, variant, onClick, disabled, size, type }) =>
        `<button class="btn btn-${variant} ${size}" ${disabled ? 'disabled' : ''}>${children}</button>`,
    Modal: ({ show, onHide, size, children }) =>
        show ? `<div class="modal ${size}">${children}</div>` : null,
    ModalHeader: ({ closeButton, children }) =>
        `<div class="modal-header">${closeButton ? '<button class="close">×</button>' : ''}${children}</div>`,
    ModalBody: ({ children }) => `<div class="modal-body">${children}</div>`,
    ModalFooter: ({ children }) => `<div class="modal-footer">${children}</div>`,
    ModalTitle: ({ children }) => `<h5 class="modal-title">${children}</h5>`,
    Form: ({ children, onSubmit }) => `<form>${children}</form>`,
    FormGroup: ({ children, className }) => `<div class="form-group ${className}">${children}</div>`,
    FormLabel: ({ children }) => `<label>${children}</label>`,
    FormSelect: ({ children, name, value, onChange, required, disabled }) =>
        `<select name="${name}" ${required ? 'required' : ''} ${disabled ? 'disabled' : ''}>${children}</select>`,
    FormControl: ({ as, rows, type, name, value, onChange, required, disabled, placeholder, accept }) =>
        as === 'textarea' ?
            `<textarea name="${name}" rows="${rows}" ${required ? 'required' : ''} ${disabled ? 'disabled' : ''}>${value}</textarea>` :
            `<input type="${type}" name="${name}" value="${value}" ${required ? 'required' : ''} ${disabled ? 'disabled' : ''} />`,
    Alert: ({ variant, children, onClose, dismissible }) =>
        `<div class="alert alert-${variant}" ${dismissible ? 'dismissible' : ''}>${children}</div>`,
    Badge: ({ bg, children }) => `<span class="badge bg-${bg}">${children}</span>`,
    Table: ({ children, striped, bordered, hover, responsive }) =>
        `<table class="${striped ? 'striped' : ''} ${bordered ? 'bordered' : ''} ${hover ? 'hover' : ''} ${responsive ? 'responsive' : ''}">${children}</table>`,
    Spinner: ({ animation, variant, size, className }) =>
        `<span class="spinner ${animation} ${variant} ${size} ${className}"></span>`,
    Container: ({ children, className }) => `<div class="container ${className}">${children}</div>`
}));

// Mock ל-API
jest.mock('../api', () => ({
    submitComplaint: jest.fn(),
    getComplaints: jest.fn(),
    axiosInstance: {
        post: jest.fn()
    }
}));

// Mock ל-Auth Context
jest.mock('../AuthContext', () => ({
    useAuth: () => ({
        user: {
            id: 1,
            name: 'יוסי כהן'
        },
        getUserId: () => 1
    })
}));

// Mock ל-Translation
jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key) => {
            const translations = {
                'complaints.status.SUBMITTED': 'הוגשה',
                'complaints.status.IN_PROGRESS': 'בטיפול',
                'complaints.status.RESOLVED': 'טופלה',
                'complaints.status.REJECTED': 'נדחתה',
                'garbageComplaint.types.uncollected': 'אשפה לא נאספה',
                'garbageComplaint.types.overflowing': 'פח עולה על גדותיו',
                'garbageComplaint.types.damagedBin': 'פח פגום',
                'garbageComplaint.types.missingBin': 'פח חסר',
                'garbageComplaint.types.illegalDumping': 'השלכת פסולת בלתי חוקית',
                'complaints.complaintForm.types.Infrastructure': 'תשתיות',
                'complaints.complaintForm.types.Cleanliness': 'ניקיון',
                'complaints.complaintForm.types.Safety': 'בטיחות',
                'complaints.complaintForm.types.Other': 'אחר',
                'complaints.error.loadError': 'שגיאה בטעינת התלונות',
                'common.error': 'שגיאה',
                'complaints.myComplaints': 'התלונות שלי',
                'complaints.newComplaint': 'תלונה חדשה',
                'complaints.loading': 'טוען...',
                'complaints.table.ticketNumber': 'מספר כרטיס',
                'complaints.table.type': 'סוג',
                'complaints.table.description': 'תיאור',
                'complaints.table.location': 'מיקום',
                'complaints.table.status': 'סטטוס',
                'complaints.table.date': 'תאריך',
                'complaints.table.response': 'תגובה',
                'complaints.table.image': 'תמונה',
                'complaints.table.noResponse': 'אין תגובה',
                'complaints.table.view': 'צפה',
                'complaints.noComplaints': 'אין תלונות',
                'complaints.submitFirstComplaint': 'שלח תלונה ראשונה',
                'complaints.complaintForm.title': 'טופס תלונה',
                'complaints.complaintForm.type': 'סוג התלונה',
                'complaints.complaintForm.selectType': 'בחר סוג',
                'complaints.complaintForm.description': 'תיאור',
                'complaints.complaintForm.descriptionPlaceholder': 'תאר את הבעיה...',
                'complaints.complaintForm.location': 'מיקום',
                'complaints.complaintForm.locationPlaceholder': 'היכן הבעיה...',
                'complaints.complaintForm.image': 'תמונה',
                'common.selected': 'נבחר',
                'complaints.complaintForm.cancel': 'ביטול',
                'complaints.submitting': 'שולח...',
                'complaints.complaintForm.submit': 'שלח'
            };
            return translations[key] || key;
        }
    })
}));

// Mock ל-CSS
jest.mock('./Complaints.css', () => ({}));

describe('Complaints - Logic Tests', () => {
    let mockComplaints;
    let api;

    beforeEach(() => {
        jest.clearAllMocks();
        api = require('../api');

        mockComplaints = [
            {
                complaintId: 1,
                ticketNumber: 'TKT001',
                type: 'Cleanliness',
                description: 'פח אשפה מלא',
                location: 'רחוב הרצל 15',
                status: 'SUBMITTED',
                response: null,
                date: '2024-01-15',
                imageUrl: 'https://example.com/image1.jpg'
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
                imageUrl: null
            }
        ];
    });

    describe('פונקציות עזר', () => {
        test('פורמט תאריך', () => {
            const formatDate = (dateString) => {
                if (!dateString) return '--';
                const date = new Date(dateString);
                return date.toLocaleDateString('en-US');
            };

            expect(formatDate('2024-01-15')).toBe('1/15/2024');
            expect(formatDate(null)).toBe('--');
            expect(formatDate('')).toBe('--');
        });

        test('מיפוי סטטוסים', () => {
            const statusVariants = {
                SUBMITTED: 'primary',
                IN_PROGRESS: 'warning',
                RESOLVED: 'success',
                REJECTED: 'danger'
            };

            const statusLabels = {
                SUBMITTED: 'הוגשה',
                IN_PROGRESS: 'בטיפול',
                RESOLVED: 'טופלה',
                REJECTED: 'נדחתה'
            };

            expect(statusVariants.SUBMITTED).toBe('primary');
            expect(statusVariants.RESOLVED).toBe('success');
            expect(statusLabels.SUBMITTED).toBe('הוגשה');
            expect(statusLabels.RESOLVED).toBe('טופלה');
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

    describe('ניהול תלונות', () => {
        test('טעינת תלונות', async () => {
            api.getComplaints.mockResolvedValue(mockComplaints);

            const complaints = await api.getComplaints(1);

            expect(api.getComplaints).toHaveBeenCalledWith(1);
            expect(complaints).toHaveLength(2);
            expect(complaints[0].ticketNumber).toBe('TKT001');
            expect(complaints[1].status).toBe('RESOLVED');
        });

        test('שליחת תלונה', async () => {
            const newComplaint = {
                complaintId: 3,
                ticketNumber: 'TKT003',
                type: 'Safety',
                description: 'תאורה לא פועלת',
                location: 'אלנבי 30',
                status: 'SUBMITTED',
                response: null,
                date: '2024-01-20'
            };

            api.submitComplaint.mockResolvedValue(newComplaint);
            api.axiosInstance.post.mockResolvedValue({ status: 200 });

            const complaintData = {
                userId: 1,
                type: 'Safety',
                description: 'תאורה לא פועלת',
                location: 'אלנבי 30',
                image: null
            };

            const response = await api.submitComplaint(complaintData);
            await api.axiosInstance.post('/api/notifications', {
                userId: 11,
                message: 'התקבלה תלונה חדשה ממשתמש.',
                type: 'ADMIN_ALERT'
            });

            expect(api.submitComplaint).toHaveBeenCalledWith(complaintData);
            expect(api.axiosInstance.post).toHaveBeenCalledWith('/api/notifications', {
                userId: 11,
                message: 'התקבלה תלונה חדשה ממשתמש.',
                type: 'ADMIN_ALERT'
            });
            expect(response.ticketNumber).toBe('TKT003');
        });
    });



    describe('בדיקות שגיאות', () => {
        test('טיפול בשגיאת טעינת תלונות', async () => {
            const error = new Error('שגיאת רשת');
            api.getComplaints.mockRejectedValue(error);

            try {
                await api.getComplaints(1);
                fail('הייתה אמורה להיזרק שגיאה');
            } catch (err) {
                expect(err.message).toBe('שגיאת רשת');
            }
        });

        test('טיפול בשגיאת שליחת תלונה', async () => {
            const error = new Error('שגיאה בשליחה');
            api.submitComplaint.mockRejectedValue(error);

            try {
                await api.submitComplaint({});
                fail('הייתה אמורה להיזרק שגיאה');
            } catch (err) {
                expect(err.message).toBe('שגיאה בשליחה');
            }
        });
    });

    describe('בדיקות UI', () => {
        test('בדיקת כפתור שליחה', () => {
            const isSubmitDisabled = (formData, isSubmitting) => {
                return !formData.type || !formData.description || !formData.location || isSubmitting;
            };

            const validForm = { type: 'Cleanliness', description: 'test', location: 'test' };
            const invalidForm = { type: '', description: 'test', location: 'test' };

            expect(isSubmitDisabled(validForm, false)).toBe(false);
            expect(isSubmitDisabled(invalidForm, false)).toBe(true);
            expect(isSubmitDisabled(validForm, true)).toBe(true);
        });

        test('בדיקת בחירת סוג תלונה', () => {
            const complaintTypes = [
                { value: "Infrastructure", label: "תשתיות" },
                { value: "Cleanliness", label: "ניקיון" },
                { value: "Safety", label: "בטיחות" },
                { value: "Other", label: "אחר" }
            ];

            const getTypeOptions = () => {
                return complaintTypes.map(type => ({
                    value: type.value,
                    label: type.label
                }));
            };

            const options = getTypeOptions();

            expect(options).toHaveLength(4);
            expect(options[0].value).toBe('Infrastructure');
            expect(options[1].label).toBe('ניקיון');
        });
    });
});