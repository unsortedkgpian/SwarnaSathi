import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, X, Send, AlertCircle } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';

// NewsLetterForm Component
export const NewsLetterForm = () => {
  const { id } = useParams();
  const url = process.env.REACT_APP_API_URL;
  const navigate = useNavigate();
  const { authAxios } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    status: 'active',
    offers: []
  });

  useEffect(() => {
    if (id) {
      fetchSubscriber();
    }
  }, [id]);

  const fetchSubscriber = async () => {
    try {
      const response = await authAxios.get(url+`/api/newsletter/subscribers/${id}`);
      const subscriber = response.data.data;
      setFormData({
        email: subscriber.email,
        status: subscriber.status,
        offers: subscriber.offers || []
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching subscriber');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (id) {
        await authAxios.put(url+`/api/newsletter/subscribers/${id}`, formData);
      } else {
        await authAxios.post(url+'/api/newsletter/subscribers', formData);
      }
      navigate('/dashboard/newsletter');
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving subscriber');
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">
          {id ? 'Edit Subscriber' : 'New Subscriber'}
        </h2>
        <div className="flex space-x-4">
          <button
            type="button"
            onClick={() => navigate('/dashboard/newsletter')}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <X className="h-5 w-5 mr-2" />
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
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
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Status</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="active">Active</option>
            <option value="blocked">Blocked</option>
            <option value="unsubscribed">Unsubscribed</option>
          </select>
        </div>

        {id && formData.offers.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Offer History</label>
            <div className="bg-gray-50 rounded-lg p-4">
              <ul className="divide-y divide-gray-200">
                {formData.offers.map((offer, index) => (
                  <li key={index} className="py-3">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Offer #{offer.offerId}</span>
                      <span className="text-sm text-gray-500">
                        {new Date(offer.sentDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="mt-1 text-sm text-gray-500">
                      Opened: {offer.opened ? 'Yes' : 'No'} | 
                      Clicked: {offer.clicked ? 'Yes' : 'No'}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </form>
  );
};
