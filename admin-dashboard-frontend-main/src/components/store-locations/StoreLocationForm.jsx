import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, X } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';

export default function StoreLocationForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { authAxios } = useContext(AuthContext);
  const url = process.env.REACT_APP_API_URL;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    locationName: '',
    locationLink: '',
  });

  useEffect(() => {
    if (id) {
      fetchStoreLocation();
    }
  }, [id]);

  const fetchStoreLocation = async () => {
    try {
      const response = await authAxios.get(`${url}/api/store-locations/${id}`);
      setFormData(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching store location');
    }
  };

  const validateForm = () => {
    if (!formData.locationName.trim()) {
      setError('Location Name is required');
      return false;
    }
    if (!formData.locationLink.trim()) {
      setError('Google Maps Link is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) return;

    setLoading(true);
    try {
      if (id) {
        await authAxios.put(`${url}/api/store-locations/${id}`, formData);
      } else {
        await authAxios.post(`${url}/api/store-locations`, formData);
      }
      navigate('/dashboard/store-locations');
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving store location');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">{id ? 'Edit Store Location' : 'New Store Location'}</h2>
        <div className="flex space-x-4">
          <button
            type="button"
            onClick={() => navigate('/dashboard/store-locations')}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <X className="h-5 w-5 mr-2" />
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
          >
            <Save className="h-5 w-5 mr-2" />
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Location Name</label>
          <input
            type="text"
            name="locationName"
            value={formData.locationName}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Google Maps Link</label>
          <input
            type="url"
            name="locationLink"
            value={formData.locationLink}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
      </div>
    </form>
  );
}