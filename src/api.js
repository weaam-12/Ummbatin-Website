import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://backend-wtgq.onrender.com';

export const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: { 'Content-Type': 'application/json' }, withCredentials: true // أضف هذا السطر

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
    const response = await axiosInstance.get('api/users/all'); // تغيير من '/api/users' إلى '/users'
    return response.data;
};

export const fetchUserProfile = async () => {
    const response = await axiosInstance.get('/api/users/profile');
    return {
        ...response.data,
        userId: response.data.userId || response.data.id
    };
};

//===================== PAYMENTS =====================
export const getAllPayments = async (month, year, userId = null) => {
    const params = { month, year };
    if (userId) params.userId = userId;
    const response = await axiosInstance.get('api/payments/all', { params }); // تغيير من '/api/payments/all' إلى '/payments/all'
    return response.data;
};

export const getUserPayments = (userId) =>
    axiosInstance.get(`/api/payments/user/${userId}`).then(r => r.data);

export const fetchRecentPayments = async (userId) => {
    const response = await axiosInstance.get(`api/payments/user/${userId}/recent`);
    return response.data;
};
export const registerFamily = async (familyPayload) => {
    const response = await axiosInstance.post('/api/auth/register-family', familyPayload);
    return response.data;
};
export const generateWaterBills = async (month, year, rate, userId = null) => {
    const params = { month, year, rate };
    if (userId) params.userId = userId;
    const response = await axiosInstance.post('api/payments/generate-water', null, { params });
    return response.data;
};

export const generateArnonaBills = async (month, year, userId = null) => {
    const params = { month, year };
    if (userId) params.userId = userId;
    const response = await axiosInstance.post('api/payments/generate-arnona', null, { params });
    return response.data;
};

export const updatePaymentFee = async (userId, paymentType, newAmount) => {
    const response = await axiosInstance.put('api/payments/update-fee', null, {
        params: { userId, paymentType, newAmount }
    });
    return response.data;
};

export const updatePaymentStatus = async (paymentId, status) => {
    const response = await axiosInstance.patch(`api/payments/${paymentId}/status`, { status });
    return response.data;
};

export const processPayment = async (paymentData) => {
    const response = await axiosInstance.post('api/payments/process', paymentData);
    return response.data;
};

//===================== PROPERTIES =====================
export const getUserProperties = async (userId) => {
    const response = await axiosInstance.get(`api/properties/user/${userId}`);
    return response.data;
};

//===================== WATER READING =====================


//===================== COMPLAINTS =====================
export const getComplaints = async (userId, isAdmin = false) => {
    const endpoint = isAdmin ? 'api/complaints/all' : `api/complaints/resident/${userId}`;
    const response = await axiosInstance.get(endpoint);
    return response.data;
};

export const submitComplaint = async ({ userId, type, description, location, image }) => {
    const formData = new FormData();
    formData.append('data', new Blob([JSON.stringify({ userId, type, description, location })], {
        type: 'application/json'
    }));
    if (image) formData.append('image', image);

    const response = await axiosInstance.post('api/complaints', formData, {
        headers: { 'Content-Type': undefined } });
        return response.data;
};

export const updateComplaintStatus = async (complaintId, status) => {
    const response = await axiosInstance.patch(`api/complaints/${complaintId}/status`, { status });
    return response.data;
};

export const deleteComplaint = async (complaintId) => {
    await axiosInstance.delete(`api/complaints/${complaintId}`);
    return true;
};

export const respondToComplaint = async (complaintId, response) => {
    const res = await axiosInstance.post(`api/complaints/${complaintId}/response`, { response });
    return res.data;
};

export const fetchComplaintHistory = async (userId) => {
    const response = await axiosInstance.get(`api/complaints?residentId=${userId}`);
    return response.data;
};

//===================== SERVICE =====================
export const submitServiceRequest = async (serviceData) => {
    const formData = new FormData();
    Object.entries(serviceData).forEach(([key, value]) => formData.append(key, value));
    const response = await axiosInstance.post('api/garbage-service', formData);
    return response.data;
};

export const fetchServiceHistory = async () => {
    const response = await axiosInstance.get('api/garbage-service/history');
    return response.data;
};

//===================== NOTIFICATIONS =====================
export const fetchUserNotifications = async () => {
    const response = await axiosInstance.get('api/notifications/me');
    return response.data;
};

//===================== ANNOUNCEMENTS =====================
export const fetchAnnouncements = async () => {
    const response = await axiosInstance.get('api/announcements');
    return response.data;
};

//===================== KINDERGARTENS =====================
export const fetchKindergartens = async () => {
    const response = await axiosInstance.get('api/kindergartens');
    return response.data;
};

export const fetchKindergartenById = async (kindergartenId) => {
    const response = await axiosInstance.get(`api/kindergartens/${kindergartenId}`);
    return response.data;
};

export const createKindergarten = async (kindergartenData) => {
    const response = await axiosInstance.post('api/kindergartens', kindergartenData);
    return response.data;
};

export const updateKindergarten = async (kindergartenId, kindergartenData) => {
    const response = await axiosInstance.put(`api/kindergartens/${kindergartenId}`, kindergartenData);
    return response.data;
};

export const deleteKindergarten = async (kindergartenId) => {
    const response = await axiosInstance.delete(`api/kindergartens/${kindergartenId}`);
    return response.data;
};

export const searchKindergartensByLocation = async (location) => {
    const response = await axiosInstance.get(`api/kindergartens/search?location=${encodeURIComponent(location)}`);
    return response.data;
};

export const getKindergartenCapacity = async (kindergartenId) => {
    const response = await axiosInstance.get(`api/kindergartens/${kindergartenId}/capacity`);
    return response.data;
};
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
export const getAllEvents = async () => {
    const response = await axiosInstance.get('api/events');
    return response.data;
};

export const addNewEvent = async (formData) => {
    const response = await axiosInstance.post('api/events', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
};

// الأخبارMonthlyPayments
export const getMonthlyPayments = async () => {
    const response = await axiosInstance.get('api/payments/monthly');
    return response.data;
};

export const generateWaterPayments = async (month, year, rate, userId = null) => {
    const params = { month, year, rate };
    if (userId) params.userId = userId;
    const response = await axiosInstance.post('api/payments/generate-water', null, { params });
    return response.data;
};

export const generateArnonaPayments = async (month, year, userId = null) => {
    const params = { month, year };
    if (userId) params.userId = userId;
    const response = await axiosInstance.post('api/payments/generate-arnona', null, { params });
    return response.data;
};

export const getCurrentMonthPayments = async () => {
    const response = await axiosInstance.get('api/payments/current-month');
    return response.data;
};

export const generateCustomWaterPayments = async (paymentRequests) => {
    const response = await axiosInstance.post('api/payments/generate-custom-water', paymentRequests);
    return response.data;
};

export const getUsersWithPayments = async (month, year) => {
    const response = await axiosInstance.get('api/payments/users-with-payments', {
        params: { month, year }
    });
    return response.data;
};
// الأخبار
export const getAllNews = async () => {
    const response = await axiosInstance.get('api/news');
    return response.data;
};

export const getWaterReadings = async () => {
    const response = await axiosInstance.get('api/water-readings');
    return response.data;
};
export const addNewProperty = async (propertyData) => {
    const response = await axiosInstance.post('api/properties', propertyData);
    return response.data;
};
export const addWaterReading = async (propertyId, amount) => {
    const response = await axiosInstance.post('api/water-readings', {
        property_id: propertyId,
        amount: amount
    });
    return response.data;
};

export const getPropertiesByUserId = async (userId) => {
    const response = await axiosInstance.get(`api/properties/user/${userId}`);
    return response.data;
};
export default axiosInstance;