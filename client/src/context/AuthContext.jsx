import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Setup axios interceptor for token handling
    useEffect(() => {
        const requestInterceptor = axios.interceptors.request.use(
            (config) => {
                const token = localStorage.getItem('accessToken');
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        const responseInterceptor = axios.interceptors.response.use(
            (response) => response,
            async (error) => {
                const originalRequest = error.config;

                if (error.response.status === 401 && !originalRequest._retry) {
                    originalRequest._retry = true;

                    try {
                        const response = await axios.post('http://localhost:5005/api/auth/refresh-token');
                        const { accessToken } = response.data;

                        localStorage.setItem('accessToken', accessToken);
                        axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

                        return axios(originalRequest);
                    } catch (refreshError) {
                        // If refresh token fails, log out user
                        logout();
                        return Promise.reject(refreshError);
                    }
                }
                return Promise.reject(error);
            }
        );

        return () => {
            axios.interceptors.request.eject(requestInterceptor);
            axios.interceptors.response.eject(responseInterceptor);
        };
    }, []);

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            checkAuth();
        } else {
            setLoading(false);
        }
    }, []);

    const checkAuth = async () => {
        try {
            const res = await axios.get('http://localhost:5005/api/auth/me');
            setUser(res.data);
        } catch (error) {
            localStorage.removeItem('accessToken');
            delete axios.defaults.headers.common['Authorization'];
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password, googleData = null) => {
        try {
            let res;
            if (googleData) {
                // If googleData is provided, use that directly
                res = { data: googleData };
            } else {
                // Otherwise, perform normal login
                res = await axios.post('http://localhost:5005/api/auth/login', { email, password });
            }

            const { accessToken, ...userData } = res.data;
            setUser(userData);
            localStorage.setItem('accessToken', accessToken);
            axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
            return userData;
        } catch (error) {
            throw error;
        }
    };

    const register = async (userData) => {
        const res = await axios.post('http://localhost:5005/api/auth/register', userData);
        const { accessToken, ...user } = res.data;
        setUser(user);
        localStorage.setItem('accessToken', accessToken);
        axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        return user;
    };

    const logout = async () => {
        try {
            await axios.post('http://localhost:5005/api/auth/logout');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setUser(null);
            localStorage.removeItem('accessToken');
            delete axios.defaults.headers.common['Authorization'];
        }
    };

    const updateProfile = async (userData) => {
        try {
            const res = await axios.put('http://localhost:5005/api/auth/me', userData);
            const { accessToken, ...user } = res.data;

            if (res.status === 200) {
                setUser(user);
                localStorage.setItem('accessToken', accessToken);
                axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
            }
            return user;
        } catch (error) {
            throw error.response?.data?.message || 'Failed to update profile';
        }
    };
    const deleteAccount = async () => {
        try {
            await axios.delete('http://localhost:5005/api/auth/me');
            setUser(null);
            localStorage.removeItem('accessToken');
            delete axios.defaults.headers.common['Authorization'];
        } catch (error) {
            console.error('Delete account error:', error);
            throw error;
        }
    };
    return (
        <AuthContext.Provider value={{
            user,
            loading,
            login,
            register,
            logout,
            updateProfile,
            deleteAccount,
        }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);