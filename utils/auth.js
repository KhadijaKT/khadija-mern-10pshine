// utils/auth.js
export const storeToken = (token) => localStorage.setItem('token', token);
export const getToken = () => localStorage.getItem('token');
export const removeToken = () => localStorage.removeItem('token');

export const isAuthenticated = () => !!getToken();

// Optional: JWT decoding helpers
export const getUserFromToken = (token) => {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
};