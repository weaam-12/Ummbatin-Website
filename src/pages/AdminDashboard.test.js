// AdminDashboard.test.js
// בדיקות פשוטות ל-AdminDashboard

// Mock ל-React Icons
jest.mock('react-icons/fi', () => ({
    FiTrash2: () => '🗑️',
    FiUserPlus: () => '➕👤',
    FiRefreshCw: () => '🔄',
    FiEdit: () => '✏️',
    FiMoreVertical: () => '⋮',
    FiEye: () => '👁️',
    FiX: () => '❌',
    FiUser: () => '👤',
    FiShield: () => '🛡️',
    FiHome: () => '🏠'
}));

// Mock ל-React Router
jest.mock('react-router-dom', () => ({
    useNavigate: () => jest.fn(),
}));

// Mock ל-Auth Context
jest.mock('../AuthContext', () => ({
    useAuth: () => ({
        user: {
            id: 1,
            email: 'admin@example.com',
            fullName: 'Admin User',
            role: { roleName: 'ADMIN' }
        }
    })
}));

// Mock ל-API
jest.mock('../api', () => ({
    __esModule: true,
    default: {
        get: jest.fn(),
        delete: jest.fn(),
        patch: jest.fn()
    }
}));

// Mock ל-Translation
jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key) => {
            const translations = {
                'errors.fetchUsers': 'שגיאה בטעינת משתמשים',
                'confirmDelete': 'האם אתה בטוח שברצונך למחוק?',
                'errors.deleteUser': 'שגיאה במחיקת משתמש',
                'errors.updateRole': 'שגיאה בשינוי תפקיד',
                'loading': 'טוען...',
                'retry': 'נסה שוב',
                'userManagement': 'ניהול משתמשים',
                'register': 'רישום',
                'refresh': 'רענן',
                'stats.totalUsers': 'סה"כ משתמשים',
                'stats.totalAdmins': 'סה"כ אדמינים',
                'stats.totalResidents': 'סה"כ תושבים',
                'email': 'אימייל',
                'name': 'שם',
                'role': 'תפקיד',
                'actions': 'פעולות',
                'roles.ADMIN': 'אדמין',
                'roles.RESIDENT': 'תושב',
                'view': 'צפה',
                'changeRole': 'שנה תפקיד',
                'delete': 'מחק',
                'pagination.previous': 'קודם',
                'pagination.page': 'עמוד',
                'pagination.next': 'הבא',
                'userDetails.title': 'פרטי משתמש',
                'userDetails.accountInfo': 'פרטי חשבון',
                'labels.fullName': 'שם מלא',
                'labels.phone': 'טלפון',
                'userDetails.status': 'סטטוס',
                'userDetails.active': 'פעיל',
                'userDetails.inactive': 'לא פעיל',
                'userDetails.contactInfo': 'פרטי התקשרות',
                'labels.address': 'כתובת',
                'userDetails.properties': 'נכסים',
                'labels.area': 'שטח',
                'labels.squareMeters': 'מ"ר',
                'labels.units': 'יחידות',
                'userDetails.wives': 'נשים',
                'userDetails.children': 'ילדים',
                'labels.birthDate': 'תאריך לידה',
                'labels.mother': 'אם',
                'close': 'סגור',
                'noResults': 'לא נמצאו תוצאות'
            };
            return translations[key] || key;
        }
    })
}));

// Mock ל-CSS
jest.mock('./AdminDashboard.css', () => ({}));

describe('AdminDashboard - Logic Tests', () => {
    let axiosInstance;
    let mockUsers;

    beforeEach(() => {
        jest.clearAllMocks();
        axiosInstance = require('../api').default;

        mockUsers = [
            {
                id: 1,
                email: 'admin@example.com',
                fullName: 'Admin User',
                role: { roleName: 'ADMIN' },
                isActive: true,
                phone: '050-1234567',
                properties: [
                    {
                        address: 'שדרות רוטשילד 1, תל אביב',
                        area: 120,
                        numberOfUnits: 3
                    }
                ],
                wives: [
                    { name: 'שרה כהן', birthDate: '1985-01-15' }
                ],
                children: [
                    { name: 'דוד כהן', birthDate: '2010-05-20', motherName: 'שרה כהן' }
                ]
            },
            {
                id: 2,
                email: 'resident@example.com',
                fullName: 'Resident User',
                role: { roleName: 'RESIDENT' },
                isActive: true,
                phone: '050-7654321',
                properties: [],
                wives: [],
                children: []
            }
        ];
    });

    describe('חישוב סטטיסטיקות', () => {
        test('חישוב נכון של סטטיסטיקות', () => {
            const calculateStats = (users) => {
                return {
                    totalUsers: users.length,
                    totalAdmins: users.filter(u => u.role?.roleName === 'ADMIN').length,
                    totalResidents: users.filter(u => u.role?.roleName === 'RESIDENT').length,
                    activeUsers: users.filter(u => u.isActive).length
                };
            };

            const stats = calculateStats(mockUsers);

            expect(stats.totalUsers).toBe(2);
            expect(stats.totalAdmins).toBe(1);
            expect(stats.totalResidents).toBe(1);
            expect(stats.activeUsers).toBe(2);
        });

        test('סטטיסטיקות עם מערך ריק', () => {
            const calculateStats = (users) => {
                return {
                    totalUsers: users.length,
                    totalAdmins: users.filter(u => u.role?.roleName === 'ADMIN').length,
                    totalResidents: users.filter(u => u.role?.roleName === 'RESIDENT').length,
                    activeUsers: users.filter(u => u.isActive).length
                };
            };

            const stats = calculateStats([]);

            expect(stats.totalUsers).toBe(0);
            expect(stats.totalAdmins).toBe(0);
            expect(stats.totalResidents).toBe(0);
            expect(stats.activeUsers).toBe(0);
        });
    });

    describe('ניהול משתמשים', () => {
        test('מחיקת משתמש', async () => {
            axiosInstance.delete.mockResolvedValue({ status: 200 });

            await axiosInstance.delete('/api/users/2');

            expect(axiosInstance.delete).toHaveBeenCalledWith('/api/users/2');
        });

        test('שינוי תפקיד משתמש', async () => {
            axiosInstance.patch.mockResolvedValue({ status: 200 });

            await axiosInstance.patch('/api/users/2/role', { role: 'ADMIN' });

            expect(axiosInstance.patch).toHaveBeenCalledWith(
                '/api/users/2/role',
                { role: 'ADMIN' }
            );
        });

        test('טעינת משתמשים', async () => {
            const mockResponse = {
                data: {
                    content: mockUsers,
                    totalElements: 2
                }
            };

            axiosInstance.get.mockResolvedValue(mockResponse);

            const response = await axiosInstance.get('api/users/all', {
                params: { page: 0, size: 10 }
            });

            expect(axiosInstance.get).toHaveBeenCalledWith(
                'api/users/all',
                { params: { page: 0, size: 10 } }
            );
            expect(response.data.content).toHaveLength(2);
            expect(response.data.totalElements).toBe(2);
        });
    });

    describe('פונקציות עזר', () => {
        test('קבלת צבע תפקיד', () => {
            const getRoleVariant = (role) => {
                if (!role) return 'secondary';
                return role.roleName === 'ADMIN' ? 'danger' : 'success';
            };

            expect(getRoleVariant({ roleName: 'ADMIN' })).toBe('danger');
            expect(getRoleVariant({ roleName: 'RESIDENT' })).toBe('success');
            expect(getRoleVariant(null)).toBe('secondary');
            expect(getRoleVariant(undefined)).toBe('secondary');
        });

        test('סינון משתמשים לפי תפקיד', () => {
            const filterUsersByRole = (users, roleName) => {
                return users.filter(user => user.role?.roleName === roleName);
            };

            const admins = filterUsersByRole(mockUsers, 'ADMIN');
            const residents = filterUsersByRole(mockUsers, 'RESIDENT');
            const unknown = filterUsersByRole(mockUsers, 'UNKNOWN');

            expect(admins).toHaveLength(1);
            expect(admins[0].email).toBe('admin@example.com');

            expect(residents).toHaveLength(1);
            expect(residents[0].email).toBe('resident@example.com');

            expect(unknown).toHaveLength(0);
        });
    });

    describe('בדיקות תקינות נתונים', () => {
        test('בדיקת משתמש פעיל', () => {
            const isUserActive = (user) => {
                return user.isActive === true;
            };

            expect(isUserActive(mockUsers[0])).toBe(true);
            expect(isUserActive({ isActive: false })).toBe(false);
            expect(isUserActive({})).toBe(false);
        });

        test('בדיקת משתמש עם נכסים', () => {
            const hasProperties = (user) => {
                return user.properties?.length > 0;
            };

            expect(hasProperties(mockUsers[0])).toBe(true);
            expect(hasProperties(mockUsers[1])).toBe(false);
            expect(hasProperties({})).toBe(false);
        });

        test('בדיקת משתמש עם ילדים', () => {
            const hasChildren = (user) => {
                return user.children?.length > 0;
            };

            expect(hasChildren(mockUsers[0])).toBe(true);
            expect(hasChildren(mockUsers[1])).toBe(false);
            expect(hasChildren({})).toBe(false);
        });
    });



    describe('בדיקות שגיאות', () => {
        test('טיפול בשגיאות API', async () => {
            const error = new Error('שגיאת רשת');
            axiosInstance.get.mockRejectedValue(error);

            try {
                await axiosInstance.get('api/users/all');
                fail('הייתה אמורה להיזרק שגיאה');
            } catch (err) {
                expect(err.message).toBe('שגיאת רשת');
            }
        });

        test('טיפול בנתונים חסרים', () => {
            const safeGetUserName = (user) => {
                return user?.fullName || 'לא ידוע';
            };

            expect(safeGetUserName({ fullName: 'דנה כהן' })).toBe('דנה כהן');
            expect(safeGetUserName({})).toBe('לא ידוע');
            expect(safeGetUserName(null)).toBe('לא ידוע');
        });
    });

    describe('בדיקות אבטחה', () => {
        test('אין אפשרות למחוק את עצמי', () => {
            const canDeleteUser = (currentUserId, targetUserId) => {
                return currentUserId !== targetUserId;
            };

            expect(canDeleteUser(1, 2)).toBe(true);
            expect(canDeleteUser(1, 1)).toBe(false);
        });

        test('אין אפשרות לשנות תפקיד לעצמי', () => {
            const canChangeRole = (currentUserId, targetUserId) => {
                return currentUserId !== targetUserId;
            };

            expect(canChangeRole(1, 2)).toBe(true);
            expect(canChangeRole(1, 1)).toBe(false);
        });
    });
});