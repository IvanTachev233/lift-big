import axios, { InternalAxiosRequestConfig } from 'axios';

const getApiBaseUrl = (): string => {
    if (import.meta.env?.VITE_API_URL) {
        return import.meta.env.VITE_API_URL as string;
    }

    // Default fallback for local development
    return 'http://127.0.0.1:8000/api/';
};

const baseURL = getApiBaseUrl();

console.log("API Base URL:", baseURL); // For debugging during development

// Axios instance
const apiClient = axios.create({
    baseURL:baseURL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// Request interceptor
apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('accessToken');
        console.log(token);
        if (token) {
            // Make sure the headers object exists
            config.headers = config.headers ?? {};
            // Set the token
            console.log(token);

            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        console.error('Request Error Interceptor:', error);
        // Reject the promise so the calling code's .catch() can handle it
        return Promise.reject(error);
    }
);

// Response interceptor

apiClient.interceptors.response.use(
    (response) => response,

    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry =true;

            try {
                const refreshToken = localStorage.getItem('refreshToken');
                if(!refreshToken) throw new Error('No refresh token available');

                console.log("Access token expired, attempting refresh...");

                const refreshResponse = await axios.post<{ access: string }>(`${baseURL}/token/refresh/`, {
                    refreshToken,
                });

                const newAccessToken = refreshResponse.data.access;
                localStorage.setItem('accesstoken', newAccessToken);

                // Update the Authorization header for the original request and default for future ones
                apiClient.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
                originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;

                console.log("Token refreshed, retrying original request...");
                return apiClient(originalRequest); // Retry the original request
            } catch (refreshError: any) {
                console.error("Token refresh failed:", refreshError.response?.data || refreshError.message);

                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                window.location.href = '/login'; // Force redirect to login
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
)

// Export the configured instance as the default export
export default apiClient;
