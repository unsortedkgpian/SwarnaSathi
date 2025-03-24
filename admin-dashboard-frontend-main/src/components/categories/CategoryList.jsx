import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, Image, Video } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';

export default function CategoryList() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { authAxios } = useContext(AuthContext);
  const url = process.env.REACT_APP_API_URL;
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await authAxios.get(url+'/api/category');
      setCategories(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching categories');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;

    try {
      await authAxios.delete(url+`/api/category/${id}`);
      setCategories(categories.filter(category => category._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || 'Error deleting category');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Categories</h2>
        <Link
          to="/dashboard/categories/new"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <Plus className="h-5 w-5 mr-2" />
          New Category
        </Link>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {categories.map((category) => (
            <li key={category._id}>
              <div className="px-4 py-4 flex items-center sm:px-6">
                <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
                  <div className="flex items-center">
                    {category.mediaType === 'image' ? (
                      <Image className="h-8 w-8 text-gray-400" />
                    ) : (
                      <Video className="h-8 w-8 text-gray-400" />
                    )}
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">{category.title}</h3>
                      <p className="mt-1 text-sm text-gray-500">{category.description}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex-shrink-0 sm:mt-0">
                    <div className="flex space-x-4">
                      <Link
                        to={`/dashboard/categories/${category._id}/edit`}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(category._id)}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}