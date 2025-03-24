import React, { useState } from 'react';
import { AlertCircle, Mail, Lock, User, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AuthInterface = () => {
  const navigate = useNavigate();
  const url = process.env.REACT_APP_API_URL;
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [userData, setUserData] = useState(JSON.parse(localStorage.getItem('user')));

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user'
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage('');

    try {
      const endpoint = isLogin ? url + '/api/auth/login' : url + '/api/auth/register';
      const bodyData = isLogin 
        ? { email: formData.email, password: formData.password }
        : formData;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(bodyData)
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message);
      }

      // Store token and user data
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setToken(data.token);
      setUserData(data.user);
      setSuccessMessage(isLogin ? 'Login successful!' : 'Registration successful!');
      navigate("/Dashboard")
      // Clear form
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'user'
      });

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-6 mx-auto space-y-6">
      <div className="p-6 bg-white rounded-lg shadow-md">
        <h2 className="mb-6 text-2xl font-bold">
          {isLogin ? 'Login' : 'Register'}
        </h2>

        <form onSubmit={handleAuth} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block mb-1 text-sm font-medium">Name</label>
              <div className="relative">
                <User className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full p-2 pl-10 border rounded"
                  required
                  minLength={2}
                  maxLength={50}
                />
              </div>
            </div>
          )}

          <div>
            <label className="block mb-1 text-sm font-medium">Email</label>
            <div className="relative">
              <Mail className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full p-2 pl-10 border rounded"
                required
              />
            </div>
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">Password</label>
            <div className="relative">
              <Lock className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full p-2 pl-10 border rounded"
                required
                minLength={6}
              />
            </div>
          </div>

          {!isLogin && (
            <div>
              <label className="block mb-1 text-sm font-medium">Role</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full p-2 text-white bg-blue-500 rounded hover:bg-blue-600 disabled:bg-blue-300"
          >
            {loading ? 'Processing...' : (isLogin ? 'Login' : 'Register')}
          </button>
        </form>

        <button
          onClick={() => {
            setIsLogin(!isLogin);
            setError(null);
            setSuccessMessage('');
          }}
          className="w-full mt-4 text-blue-500 hover:text-blue-600"
        >
          {isLogin ? "Don't have an account? Register" : 'Already have an account? Login'}
        </button>

        {successMessage && (
          <alert className="mt-4 bg-green-100">
            <p>{successMessage}</p>
          </alert>
        )}

        {error && (
          <alert variant="destructive" className="mt-4">
            <AlertCircle className="w-4 h-4" />
            <p>{error}</p>
          </alert>
        )}
      </div>
    </div>
  );
};

export default AuthInterface;