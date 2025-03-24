import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, X } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';

export default function ProductForm() {
  const { id } = useParams();
  const url = process.env.REACT_APP_API_URL;
  const navigate = useNavigate();
  const { authAxios } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // formData holds text fields; iconFile will hold the selected file.
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    icon: '', // if editing, this stores the Gallery object id
    seo: {
      metaTitle: '',
      metaDescription: '',
      metaKeywords: ''
    }
  });
  const [iconFile, setIconFile] = useState(null);

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await authAxios.get(url + `/api/products/${id}`);
      const { title, description, icon, category, seo } = response.data;
      setFormData({
        title,
        description,
        category,
        icon: icon?._id || '',
        seo: seo || {}
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching product');
    }
  };

  // For file input change
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setIconFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Use FormData to send multipart/form-data
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('category', formData.category);
      data.append('seo.metaTitle', formData.seo.metaTitle);
      data.append('seo.metaDescription', formData.seo.metaDescription);
      data.append('seo.metaKeywords', formData.seo.metaKeywords);
      // Append the icon file if selected. Otherwise, if editing, pass the current icon id.
      if (iconFile) {
        data.append('iconFile', iconFile);
      } else if (formData.icon) {
        data.append('icon', formData.icon);
      }

      if (id) {
        await authAxios.put(url + `/api/products/${id}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await authAxios.post(url + `/api/products`, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      navigate('/dashboard/products');
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving product');
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
          {id ? 'Edit Product' : 'New Product'}
        </h2>
        <div className="flex space-x-4">
          <button
            type="button"
            onClick={() => navigate('/dashboard/products')}
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
          <label className="block text-sm font-medium text-gray-700">Product Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Catogory</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value={true}>Select a category</option>
              <option value="Business">Business</option>
              <option value="Individual">Individual</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Product Icon</label>
          <input
            type="file"
            name="iconFile"
            onChange={handleFileChange}
            className="mt-1 block w-full"
          />
          {iconFile && <p className="text-sm text-gray-500">Selected file: {iconFile.name}</p>}
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