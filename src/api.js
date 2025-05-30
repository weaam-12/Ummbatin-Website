import axios from 'axios';

// Base API URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

// Create an Axios instance
const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: { 'Content-Type': 'application/json' },
});

// Request Interceptor - Adds JWT to headers
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token.trim()}`;
            console.log("Authorization Header:", config.headers.Authorization);
        }

        // Automatically handle FormData
        if (config.data instanceof FormData) {
            delete config.headers['Content-Type']; // Let Axios set it
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor - Handle Errors
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            console.log('Unauthorized access detected.');
            localStorage.removeItem('token');

            return Promise.reject({
                ...error,
                customMessage: "Unauthorized access. Please login again.",
                isAuthError: true,
            });
        }

        return Promise.reject(error);
    }
);

// Complaint Functions
export const submitComplaint = async (complaintData) => {
    const formData = new FormData();
    Object.entries(complaintData).forEach(([key, value]) => formData.append(key, value));
    const response = await axiosInstance.post('/complaints', formData);
    return response.data;
};

export const getComplaints = async () => {
    const response = await axiosInstance.get('/complaints');
    return response.data;
};

export const fetchComplaintHistory = async () => {
    const response = await axiosInstance.get('/complaints/history');
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
    const response = await axiosInstance.get('/user/profile');
    return response.data;
};


export const fetchUserNotifications = async (userId) => {
    const response = await axiosInstance.get(`/user/${userId}/notifications`);
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

export const fetchServices = async () => {
    const response = await axiosInstance.get('/services');
    return Array.isArray(response.data) ? response.data : [];
};




export default axiosInstance;