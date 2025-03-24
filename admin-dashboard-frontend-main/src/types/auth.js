// src/types/auth.js

/**
 * @typedef {Object} User
 * @property {number} _id - User ID
 * @property {string} name - User's name
 * @property {string} email - User's email
 * @property {string} role - User's role ('user' or 'admin')
 */

/**
 * @typedef {Object} AuthState
 * @property {boolean} isAuthenticated - Whether user is authenticated
 * @property {string|null} token - JWT token
 * @property {User|null} user - User data
 */

/**
 * @typedef {Object} LoginCredentials
 * @property {string} email - User's email
 * @property {string} password - User's password
 */

/**
 * @typedef {Object} RegisterData
 * @property {string} name - User's name
 * @property {string} email - User's email
 * @property {string} password - User's password
 * @property {string} role - User's role
 */

/**
 * @typedef {Object} AuthContextType
 * @property {AuthState} auth - Authentication state
 * @property {boolean} loading - Loading state
 * @property {string|null} error - Error message
 * @property {Function} setError - Function to set error message
 * @property {Function} register - Register function
 * @property {Function} login - Login function
 * @property {Function} logout - Logout function
 * @property {import('axios').AxiosInstance} authAxios - Axios instance with auth header
 */