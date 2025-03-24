import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pencil, Trash2 } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';

export default function FaqList() {
  const navigate = useNavigate();
  const { authAxios } = useContext(AuthContext);
  const url = process.env.REACT_APP_API_URL;

  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchFaqs();
  }, []);

  const fetchFaqs = async () => {
    try {
      const response = await authAxios.get(`${url}/api/faqs`);
      setFaqs(response.data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching FAQs');
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this FAQ?')) {
      try {
        await authAxios.delete(`${url}/api/faqs/${id}`);
        setFaqs(faqs.filter(faq => faq._id !== id));
      } catch (err) {
        setError(err.response?.data?.message || 'Error deleting FAQ');
      }
    }
  };

  if (loading) return <div className="text-center p-6">Loading...</div>;
  if (error) return <div className="text-red-700 p-6">{error}</div>;

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">FAQs</h2>
        <button
          onClick={() => navigate('/dashboard/faqs/new')}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          + New FAQ
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {faqs.map(faq => (
              <tr key={faq._id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{faq.title}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{faq.description.substring(0, 50)}...</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => navigate(`/dashboard/faqs/edit/${faq._id}`)}
                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                  >
                    <Pencil className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(faq._id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}