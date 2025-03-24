import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, X } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';

export default function InvestorDeskSectionForm() {
  const { id } = useParams();
  const url = process.env.REACT_APP_API_URL;
  const navigate = useNavigate();
  const { authAxios } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    seo: {
      metaTitle: '',
      metaDescription: '',
      metaKeywords: ''
    }
  });

  useEffect(() => {
    if (id) {
      fetchSection();
    }
  }, [id]);

  const fetchSection = async () => {
    try {
      const response = await authAxios.get(url+`/api/investor-desk/sections/${id}`);
      const { title, seo } = response.data;
      setFormData({ title, seo: seo || {} });
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching section');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (id) {
        await authAxios.put(url+`/api/investor-desk/sections/${id}`, formData);
      } else {
        await authAxios.post(url+'/api/investor-desk/sections', formData);
      }
      navigate('/dashboard/investor-desk');
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving section');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('seo.')) {
      const seoField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        seo: {
          ...prev.seo,
          [seoField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">
          {id ? 'Edit Section' : 'New Section'}
        </h2>
        <div className="flex space-x-4">
          <button
            type="button"
            onClick={() => navigate('/dashboard/investor-desk')}
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

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Section Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">SEO Information</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700">Meta Title</label>
            <input
              type="text"
              name="seo.metaTitle"
              value={formData.seo.metaTitle}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Meta Description</label>
            <textarea
              name="seo.metaDescription"
              value={formData.seo.metaDescription}
              onChange={handleChange}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Meta Keywords</label>
            <input
              type="text"
              name="seo.metaKeywords"
              value={formData.seo.metaKeywords}
              onChange={handleChange}
              placeholder="Comma-separated keywords"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
        </div>
      </div>
    </form>
  );
}