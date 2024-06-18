import axios from 'axios';

const API_URL = 'http://localhost:3000';

export const register = async (username: string, password: string, permissions: string[]) => {
    const response = await axios.post(`${API_URL}/register`, { username, password, permissions });
    return response.data;
};

export const login = async (username: string, password: string) => {
    const response = await axios.post(`${API_URL}/login`, { username, password });
    if (response.data.accessToken) {
        localStorage.setItem('accessToken', response.data.accessToken);
        localStorage.setItem('refreshToken', response.data.refreshToken);
    }
    return response.data;
};

export const getProtectedResource = async () => {
    const token = localStorage.getItem('accessToken');
    const response = await axios.get(`${API_URL}/protected`, {
        headers: {
            Authorization: token
        }
    });
    return response.data;
};

export const refreshToken = async () => {
    const response = await axios.post(`${API_URL}/refresh-token`, {}, {
        withCredentials: true
    });
    if (response.data.accessToken) {
        localStorage.setItem('accessToken', response.data.accessToken);
    }
    return response.data;
};

export const hasPermission = (requiredPermissions: string[]): boolean => {
    const token = localStorage.getItem('accessToken');
    if (!token) return false;

    const { permissions } = JSON.parse(atob(token.split('.')[1]));
    return requiredPermissions.every(permission => permissions.includes(permission));
};
