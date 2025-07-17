import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: { 'Content-Type': 'application/json' },
});

// Request Interceptor
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token.trim()}`;
        }
        if (config.data instanceof FormData) {
            delete config.headers['Content-Type'];
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            return Promise.reject({
                customMessage: "Session expired. Please login again.",
                isAuthError: true,
                originalError: error
            });
        }
        if (error.response?.data?.message?.includes("user")) { // تغيير "resident" إلى "user"
            return Promise.reject({
                customMessage: "User ID not available - please login again", // تحديث الرسالة
                isUserError: true // تغيير isResidentError إلى isUserError
            });
        }
        return Promise.reject(error);
    }
);

//===================== USER =====================
export const getAllUsers = async () => {
    const response = await axiosInstance.get('/users/all'); // تغيير من '/api/users' إلى '/users'
    return response.data;
};

export const fetchUserProfile = async () => {
    const response = await axiosInstance.get('/users/profile');
    return {
        ...response.data,
        userId: response.data.userId || response.data.id
    };
};

//===================== PAYMENTS =====================
export const getAllPayments = async (month, year, userId = null) => {
    const params = { month, year };
    if (userId) params.userId = userId;
    const response = await axiosInstance.get('/payments/all', { params }); // تغيير من '/api/payments/all' إلى '/payments/all'
    return response.data;
};

export const getUserPayments = async (userId) => {
    const response = await axiosInstance.get(`/payments/user/${userId}`);
    return response.data;
};

export const fetchRecentPayments = async (userId) => {
    const response = await axiosInstance.get(`/payments/user/${userId}/recent`);
    return response.data;
};

export const generateWaterBills = async (month, year, rate, userId = null) => {
    const params = { month, year, rate };
    if (userId) params.userId = userId;
    const response = await axiosInstance.post('/payments/generate-water', null, { params });
    return response.data;
};

export const generateArnonaBills = async (month, year, userId = null) => {
    const params = { month, year };
    if (userId) params.userId = userId;
    const response = await axiosInstance.post('/payments/generate-arnona', null, { params });
    return response.data;
};

export const updatePaymentFee = async (userId, paymentType, newAmount) => {
    const response = await axiosInstance.put('/payments/update-fee', null, {
        params: { userId, paymentType, newAmount }
    });
    return response.data;
};

export const updatePaymentStatus = async (paymentId, status) => {
    const response = await axiosInstance.patch(`/payments/${paymentId}/status`, { status });
    return response.data;
};

export const processPayment = async (paymentData) => {
    const response = await axiosInstance.post('/payments/process', paymentData);
    return response.data;
};

//===================== PROPERTIES =====================
export const getUserProperties = async (userId) => {
    const response = await axiosInstance.get(`/properties/user/${userId}`);
    return response.data;
};

//===================== WATER READING =====================
export const addWaterReading = async (readingData) => {
    const response = await axiosInstance.post('/water-readings', readingData);
    return response.data;
};

//===================== COMPLAINTS =====================
export const getComplaints = async (userId, isAdmin = false) => {
    const endpoint = isAdmin ? '/complaints/all' : `/complaints/resident/${userId}`;
    const response = await axiosInstance.get(endpoint);
    return response.data;
};

export const submitComplaint = async (data) => {
    const formData = new FormData();
    formData.append('userId', data.userId);
    formData.append('type', data.type);
    formData.append('description', data.description);
    formData.append('location', data.location);
    if (data.image) formData.append('image', data.image);

    const response = await axiosInstance.post('/complaints', formData);
    return response.data;
};

export const updateComplaintStatus = async (complaintId, status) => {
    const response = await axiosInstance.patch(`/complaints/${complaintId}/status`, { status });
    return response.data;
};

export const deleteComplaint = async (complaintId) => {
    await axiosInstance.delete(`/complaints/${complaintId}`);
    return true;
};

export const respondToComplaint = async (complaintId, response) => {
    const res = await axiosInstance.post(`/complaints/${complaintId}/response`, { response });
    return res.data;
};

export const fetchComplaintHistory = async (userId) => {
    const response = await axiosInstance.get(`/complaints?residentId=${userId}`);
    return response.data;
};

//===================== SERVICE =====================
export const submitServiceRequest = async (serviceData) => {
    const formData = new FormData();
    Object.entries(serviceData).forEach(([key, value]) => formData.append(key, value));
    const response = await axiosInstance.post('/garbage-service', formData);
    return response.data;
};

export const fetchServiceHistory = async () => {
    const response = await axiosInstance.get('/garbage-service/history');
    return response.data;
};

//===================== NOTIFICATIONS =====================
export const fetchUserNotifications = async () => {
    const response = await axiosInstance.get('/notifications/me');
    return response.data;
};

//===================== ANNOUNCEMENTS =====================
export const fetchAnnouncements = async () => {
    const response = await axiosInstance.get('/announcements');
    return response.data;
};

//===================== KINDERGARTENS =====================
export const fetchKindergartens = async () => {
    const response = await axiosInstance.get('/kindergartens');
    return response.data;
};

export const fetchKindergartenById = async (kindergartenId) => {
    const response = await axiosInstance.get(`/kindergartens/${kindergartenId}`);
    return response.data;
};

export const createKindergarten = async (kindergartenData) => {
    const response = await axiosInstance.post('/kindergartens', kindergartenData);
    return response.data;
};

export const updateKindergarten = async (kindergartenId, kindergartenData) => {
    const response = await axiosInstance.put(`/kindergartens/${kindergartenId}`, kindergartenData);
    return response.data;
};

export const deleteKindergarten = async (kindergartenId) => {
    const response = await axiosInstance.delete(`/kindergartens/${kindergartenId}`);
    return response.data;
};

export const searchKindergartensByLocation = async (location) => {
    const response = await axiosInstance.get(`/kindergartens/search?location=${encodeURIComponent(location)}`);
    return response.data;
};

export const getKindergartenCapacity = async (kindergartenId) => {
    const response = await axiosInstance.get(`/kindergartens/${kindergartenId}/capacity`);
    return response.data;
};
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
export const getAllEvents = async () => {
    const response = await axiosInstance.get('/events');
    return response.data;
};

export const addNewEvent = async (formData) => {
    const response = await axiosInstance.post('/events', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
};

// الأخبار
export const getAllNews = async () => {
    const response = await axiosInstance.get('/news');
    return response.data;
};
export default axiosInstance;