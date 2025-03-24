import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Save, X, Send, AlertCircle, Plus, Trash2, Edit } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
export const NewsLetterList = () => {
    const [subscribers, setSubscribers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showOfferForm, setShowOfferForm] = useState(false);
    const [offerData, setOfferData] = useState({
      offerId: '',
      subject: '',
      content: ''
    });
    const { authAxios } = useContext(AuthContext);
    const url = process.env.REACT_APP_API_URL;
  
    useEffect(() => {
      fetchSubscribers();
    }, []);
  
    const fetchSubscribers = async () => {
      try {
        const response = await authAxios.get(url+'/api/newsletter/subscribers');
        setSubscribers(response.data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Error fetching subscribers');
      } finally {
        setLoading(false);
      }
    };
  
    const handleDelete = async (id) => {
      if (!window.confirm('Are you sure you want to delete this subscriber?')) return;
  
      try {
        await authAxios.delete(url+`/api/newsletter/subscribers/${id}`);
        setSubscribers(subscribers.filter(subscriber => subscriber._id !== id));
      } catch (err) {
        setError(err.response?.data?.message || 'Error deleting subscriber');
      }
    };
  
    const handleSendOffer = async (e) => {
      e.preventDefault();
      try {
        setLoading(true);
        await authAxios.post(url+'/api/newsletter/send-offer', offerData);
        setShowOfferForm(false);
        setOfferData({ offerId: '', subject: '', content: '' });
        fetchSubscribers();
      } catch (err) {
        setError(err.response?.data?.message || 'Error sending offer');
      } finally {
        setLoading(false);
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
          <h2 className="text-2xl font-bold text-gray-900">Newsletter Subscribers</h2>
          <div className="flex space-x-4">
            <button
              onClick={() => setShowOfferForm(!showOfferForm)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <Send className="h-5 w-5 mr-2" />
              {showOfferForm ? 'Hide Offer Form' : 'Send Offer'}
            </button>
            <Link
              to="/dashboard/newsletter/new"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <Plus className="h-5 w-5 mr-2" />
              New Subscriber
            </Link>
          </div>
        </div>
  
        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="text-sm text-red-700">{error}</div>
          </div>
        )}
  
        {showOfferForm && (
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Send New Offer</h3>
            <form onSubmit={handleSendOffer} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Offer ID</label>
                <input
                  type="number"
                  value={offerData.offerId}
                  onChange={(e) => setOfferData(prev => ({ ...prev, offerId: e.target.value }))}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Subject</label>
                <input
                  type="text"
                  value={offerData.subject}
                  onChange={(e) => setOfferData(prev => ({ ...prev, subject: e.target.value }))}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Content</label>
                <textarea
                  value={offerData.content}
                  onChange={(e) => setOfferData(prev => ({ ...prev, content: e.target.value }))}
                  rows={4}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                <Send className="h-5 w-5 mr-2" />
                {loading ? 'Sending...' : 'Send Offer'}
              </button>
            </form>
          </div>
        )}
  
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {subscribers.map((subscriber) => (
              <li key={subscriber._id} className="hover:bg-gray-50">
                <div className="px-4 py-4 flex items-center sm:px-6">
                  <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {subscriber.email}
                        <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                          subscriber.status === 'active' ? 'bg-green-100 text-green-800' :
                          subscriber.status === 'blocked' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {subscriber.status}
                        </span>
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Subscribed: {new Date(subscriber.subscriptionDate).toLocaleDateString()}
                      </p>
                      {subscriber.lastEmailSent && (
                        <p className="mt-1 text-sm text-gray-500">
                          Last Email: {new Date(subscriber.lastEmailSent).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <div className="mt-4 flex-shrink-0 sm:mt-0 sm:ml-5">
                      <div className="flex space-x-2">
                        <Link
                          to={`/dashboard/newsletter/${subscriber._id}/edit`}
                          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(subscriber._id)}
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
  };