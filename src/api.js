import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL|| 'http://localhost:8080';

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
        return Promise.reject(error);
    }
);

// Complaint Functions
export const getComplaints = async (userId, isAdmin = false) => {
    try {
        const endpoint = isAdmin ? '/complaints/all' : `/complaints/user/${userId}`; // أزل /api من هنا
        const response = await axiosInstance.get(endpoint);
        return response.data;
    } catch (error) {
        console.error('Get complaints error:', error);
        throw error;
    }
};
export const submitComplaint = async (data) => {
    const formData = new FormData();
    formData.append('userId', data.userId);
    formData.append('type', data.type);
    formData.append('description', data.description);
    formData.append('location', data.location);
    if (data.image) formData.append('image', data.image);

    try {
        const response = await axiosInstance.post('/complaints', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    } catch (error) {
        console.error('Submit complaint error:', error);
        throw error;
    }
};

export const updateComplaintStatus = async (complaintId, status) => {
    try {
        const response = await axiosInstance.patch(`/complaints/${complaintId}/status`, { status });
        return response.data;
    } catch (error) {
        console.error('Update status error:', error);
        throw error;
    }
};

export const deleteComplaint = async (complaintId) => {
    try {
        await axiosInstance.delete(`/complaints/${complaintId}`);
        return true;
    } catch (error) {
        console.error('Delete complaint error:', error);
        throw error;
    }
};

export const respondToComplaint = async (complaintId, response) => {
    try {
        const res = await axiosInstance.post(`/complaints/${complaintId}/response`, { response });
        return res.data;
    } catch (error) {
        console.error('Respond to complaint error:', error);
        throw error;
    }
};

axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Clear invalid token
            localStorage.removeItem('token');

            // Return custom error structure
            return Promise.reject({
                customMessage: "Session expired. Please login again.",
                isAuthError: true,
                originalError: error
            });
        }

        // Handle missing resident ID specifically
        if (error.response?.data?.message?.includes("resident")) {
            return Promise.reject({
                customMessage: "Resident ID not available - please login again",
                isResidentError: true
            });
        }

        return Promise.reject(error);
    }
);
export const fetchComplaintHistory = async (userId) => {
    const response = await axiosInstance.get(`/complaints?residentId=${userId}`);
    return response.data;
};

// Service Functions
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

// User Functions
// in api.js
export const fetchUserProfile = async () => {
    const response = await axiosInstance.get('/users/profile');
    // تأكد أن الخادم يعيد userId وليس فقط id
    return {
        ...response.data,
        userId: response.data.userId || response.data.id
    };
};


export const fetchUserNotifications = async () => {
    const response = await axiosInstance.get('/notifications/me')

    return response.data;
};

export const fetchRecentPayments = async (userId) => {
    const response = await axiosInstance.get(`/user/${userId}/payments/recent`);
    return response.data;
};

// Community Functions
export const fetchAnnouncements = async () => {
    const response = await axiosInstance.get('/announcements');
    return response.data;
};

export const fetchKindergartens = async () => {
    try {
        const response = await axiosInstance.get('/kindergartens');
        return response.data;
    } catch (error) {
        console.error('Fetch kindergartens error:', error);
        throw error;
    }
};

export const fetchKindergartenById = async (kindergartenId) => {
    try {
        const response = await axiosInstance.get(`/kindergartens/${kindergartenId}`);
        return response.data;
    } catch (error) {
        console.error('Fetch kindergarten by ID error:', error);
        throw error;
    }
};

export const createKindergarten = async (kindergartenData) => {
    try {
        const response = await axiosInstance.post('/kindergartens', kindergartenData);
        return response.data;
    } catch (error) {
        console.error('Create kindergarten error:', error);
        throw error;
    }
};

export const updateKindergarten = async (kindergartenId, kindergartenData) => {
    try {
        const response = await axiosInstance.put(`/kindergartens/${kindergartenId}`, kindergartenData);
        return response.data;
    } catch (error) {
        console.error('Update kindergarten error:', error);
        throw error;
    }
};

export const deleteKindergarten = async (kindergartenId) => {
    try {
        const response = await axiosInstance.delete(`/kindergartens/${kindergartenId}`);
        return response.data;
    } catch (error) {
        console.error('Delete kindergarten error:', error);
        throw error;
    }
};

export const searchKindergartensByLocation = async (location) => {
    try {
        const response = await axiosInstance.get(`/kindergartens/search?location=${encodeURIComponent(location)}`);
        return response.data;
    } catch (error) {
        console.error('Search kindergartens by location error:', error);
        throw error;
    }
};

export const getKindergartenCapacity = async (kindergartenId) => {
    try {
        const response = await axiosInstance.get(`/kindergartens/${kindergartenId}/capacity`);
        return response.data;
    } catch (error) {
        console.error('Get kindergarten capacity error:', error);
        throw error;
    }
};

export const getUserPayments = async (userId) => {
    try {
        const response = await axiosInstance.get(`/payments/user/${userId}`);
        return response.data;
    } catch (error) {
        console.error('Error getting user payments:', error);
        throw error;
    }
};

export const getAllPayments = async () => {
    try {
        const response = await axiosInstance.get('/payments/all');
        return response.data;
    } catch (error) {
        console.error('Error getting all payments:', error);
        throw error;
    }
};


export const processPayment = async (paymentData) => {
    try {
        const response = await axiosInstance.post('/payments/process', paymentData);
        return response.data;
    } catch (error) {
        console.error('Error processing payment:', error);
        throw error;
    }
};

export const generateWaterBills = async (month, year, rate, userId = null) => {
    try {
        const params = { month, year, rate };
        if (userId) params.userId = userId;

        const response = await axiosInstance.post('/payments/generate-water', null, { params });
        return response.data;
    } catch (error) {
        console.error('Error generating water bills:', error);
        throw error;
    }
};

export const generateArnonaBills = async (month, year, userId = null) => {
    try {
        const params = { month, year };
        if (userId) params.userId = userId;

        const response = await axiosInstance.post('/payments/generate-arnona', null, { params });
        return response.data;
    } catch (error) {
        console.error('Error generating arnona bills:', error);
        throw error;
    }
};

export const updatePaymentFee = async (userId, paymentType, newAmount) => {
    try {
        const response = await axiosInstance.put('/payments/update-fee', null, {
            params: { userId, paymentType, newAmount }
        });
        return response.data;
    } catch (error) {
        console.error('Error updating payment fee:', error);
        throw error;
    }
};

export const updatePaymentStatus = async (paymentId, status) => {
    try {
        const response = await axiosInstance.patch(`/payments/${paymentId}/status`, { status });
        return response.data;
    } catch (error) {
        console.error('Error updating payment status:', error);
        throw error;
    }
};

// User and Property Functions
export const getUsers = async () => {
    try {
        const response = await axiosInstance.get('/api/users');
        return response.data;
    } catch (error) {
        console.error('Error getting users:', error);
        throw error;
    }
};

export const getUserProperties = async (userId) => {
    try {
        const response = await axiosInstance.get(`/api/properties/user/${userId}`);
        return response.data;
    } catch (error) {
        console.error('Error getting user properties:', error);
        throw error;
    }
};

export const addWaterReading = async (readingData) => {
    try {
        const response = await axiosInstance.post('/api/water-readings', readingData);
        return response.data;
    } catch (error) {
        console.error('Error adding water reading:', error);
        throw error;
    }
};
export default axiosInstance;