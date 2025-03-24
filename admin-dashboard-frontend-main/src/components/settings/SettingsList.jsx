import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { Edit, Globe } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';

export default function SettingsList() {
  const { authAxios } = useContext(AuthContext);
  const url = process.env.REACT_APP_API_URL;
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await authAxios.get(url + '/api/settings');
      setSettings(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching settings');
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

  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-4">
        <div className="text-sm text-red-700">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Website Settings</h2>
        <Link
          to="/dashboard/settings/edit"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <Edit className="h-5 w-5 mr-2" />
          {settings ? 'Edit Settings' : 'Configure Settings'}
        </Link>
      </div>

      {!settings ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <Globe className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No settings configured</h3>
          <p className="mt-1 text-sm text-gray-500">Click "Configure Settings" to set up your website settings.</p>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900">Current Configuration</h3>
            <p className="mt-1 text-sm text-gray-500">Summary of configured settings</p>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
              {settings.navbarLogo && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Navbar Logo</h4>
                  <img src={settings.navbarLogo} alt="Navbar Logo" className="mt-2 h-12 object-contain" />
                </div>
              )}
              {settings.favicon && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Favicon</h4>
                  <img src={settings.favicon} alt="Favicon" className="mt-2 h-8 w-8 object-contain" />
                </div>
              )}
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-500">Phone Numbers: {settings.phoneNumbers?.length || 0}</p>
              <p className="text-sm text-gray-500">Emails: {settings.emails?.length || 0}</p>
              <p className="text-sm text-gray-500">Addresses: {settings.addresses?.length || 0}</p>
              {settings.addresses?.length > 0 && (
                <ul className="mt-2 list-disc list-inside text-sm text-gray-500">
                  {settings.addresses.map((address, index) => (
                    <li key={index}>{address.title}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}