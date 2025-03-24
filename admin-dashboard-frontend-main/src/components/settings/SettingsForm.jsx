import React, { useState, useEffect, useContext } from 'react';
import { Save, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

export default function SettingsForm() {
  const navigate = useNavigate();
  const url = process.env.REACT_APP_API_URL;
  const { authAxios } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [settings, setSettings] = useState({
    navbarLogo: '',
    favicon: '',
    phoneNumbers: [],
    emails: [],
    addresses: [],
    contactEmail: '' // Added contactEmail
  });
  const [files, setFiles] = useState({
    navbarLogo: null,
    favicon: null
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await authAxios.get(url + '/api/settings');
      if (response.data.data) {
        setSettings(response.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching settings');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const form = new FormData();
      if (files.navbarLogo) form.append('navbarLogo', files.navbarLogo);
      if (files.favicon) form.append('favicon', files.favicon);
      form.append('phoneNumbers', JSON.stringify(settings.phoneNumbers));
      form.append('emails', JSON.stringify(settings.emails));
      form.append('addresses', JSON.stringify(settings.addresses));
      form.append('contactEmail', settings.contactEmail); // Add contactEmail to form data

      const response = await authAxios.post(url + '/api/settings', form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setSuccess('Settings saved successfully');
      setSettings(response.data.data);
      navigate('/dashboard/settings');
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving settings');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const { name, files: uploadedFiles } = e.target;
    setFiles(prev => ({ ...prev, [name]: uploadedFiles[0] }));
  };

  const handleChange = (e) => {
    setSettings(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Phone Numbers
  const addPhoneNumber = () => {
    setSettings(prev => ({
      ...prev,
      phoneNumbers: [
        ...prev.phoneNumbers,
        { number: '', type: 'mobile', isPrimary: prev.phoneNumbers.length === 0 }
      ]
    }));
  };

  const updatePhoneNumber = (index, field, value) => {
    setSettings(prev => {
      const updatedPhones = [...prev.phoneNumbers];
      updatedPhones[index] = { ...updatedPhones[index], [field]: value };
      if (field === 'isPrimary' && value) {
        updatedPhones.forEach((phone, i) => {
          if (i !== index) phone.isPrimary = false;
        });
      }
      return { ...prev, phoneNumbers: updatedPhones };
    });
  };

  const removePhoneNumber = (index) => {
    setSettings(prev => {
      const updatedPhones = prev.phoneNumbers.filter((_, i) => i !== index);
      if (prev.phoneNumbers[index].isPrimary && updatedPhones.length > 0) {
        updatedPhones[0].isPrimary = true;
      }
      return { ...prev, phoneNumbers: updatedPhones };
    });
  };

  // Emails
  const addEmail = () => {
    setSettings(prev => ({
      ...prev,
      emails: [
        ...prev.emails,
        { email: '', purpose: 'general', isPrimary: prev.emails.length === 0 }
      ]
    }));
  };

  const updateEmail = (index, field, value) => {
    setSettings(prev => {
      const updatedEmails = [...prev.emails];
      updatedEmails[index] = { ...updatedEmails[index], [field]: value };
      if (field === 'isPrimary' && value) {
        updatedEmails.forEach((email, i) => {
          if (i !== index) email.isPrimary = false;
        });
      }
      return { ...prev, emails: updatedEmails };
    });
  };

  const removeEmail = (index) => {
    setSettings(prev => {
      const updatedEmails = prev.emails.filter((_, i) => i !== index);
      if (prev.emails[index].isPrimary && updatedEmails.length > 0) {
        updatedEmails[0].isPrimary = true;
      }
      return { ...prev, emails: updatedEmails };
    });
  };

  // Addresses
  const addAddress = () => {
    setSettings(prev => ({
      ...prev,
      addresses: [
        ...prev.addresses,
        {
          title: '',
          location: { addressText: '', googleMapsLink: '' },
          contactNumbers: { mobile: '', telephone: '', office: '' },
          emails: [''],
          isPrimary: prev.addresses.length === 0
        }
      ]
    }));
  };

  const updateAddress = (index, field, value) => {
    setSettings(prev => {
      const updatedAddresses = [...prev.addresses];
      if (field.includes('.')) {
        const [parent, child] = field.split('.');
        updatedAddresses[index][parent][child] = value;
      } else {
        updatedAddresses[index][field] = value;
        if (field === 'isPrimary' && value) {
          updatedAddresses.forEach((addr, i) => {
            if (i !== index) addr.isPrimary = false;
          });
        }
      }
      return { ...prev, addresses: updatedAddresses };
    });
  };

  const addAddressEmail = (addressIndex) => {
    setSettings(prev => {
      const updatedAddresses = [...prev.addresses];
      updatedAddresses[addressIndex].emails.push('');
      return { ...prev, addresses: updatedAddresses };
    });
  };

  const updateAddressEmail = (addressIndex, emailIndex, value) => {
    setSettings(prev => {
      const updatedAddresses = [...prev.addresses];
      updatedAddresses[addressIndex].emails[emailIndex] = value;
      return { ...prev, addresses: updatedAddresses };
    });
  };

  const removeAddressEmail = (addressIndex, emailIndex) => {
    setSettings(prev => {
      const updatedAddresses = [...prev.addresses];
      updatedAddresses[addressIndex].emails = updatedAddresses[addressIndex].emails.filter((_, i) => i !== emailIndex);
      return { ...prev, addresses: updatedAddresses };
    });
  };

  const removeAddress = (index) => {
    setSettings(prev => {
      const updatedAddresses = prev.addresses.filter((_, i) => i !== index);
      if (prev.addresses[index].isPrimary && updatedAddresses.length > 0) {
        updatedAddresses[0].isPrimary = true;
      }
      return { ...prev, addresses: updatedAddresses };
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">
          {settings.navbarLogo ? 'Edit Website Settings' : 'Configure Website Settings'}
        </h2>
        <div className="flex space-x-4">
          <button
            type="button"
            onClick={() => navigate('/dashboard/settings')}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <X className="h-5 w-5 mr-2" />
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400"
          >
            <Save className="h-5 w-5 mr-2" />
            {loading ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <X className="h-5 w-5 text-red-400" />
            <div className="ml-3 text-sm text-red-700">{error}</div>
          </div>
        </div>
      )}

      {success && (
        <div className="rounded-md bg-green-50 p-4">
          <div className="flex">
            <Save className="h-5 w-5 text-green-400" />
            <div className="ml-3 text-sm text-green-700">{success}</div>
          </div>
        </div>
      )}

      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Branding</h3>
          <p className="mt-1 text-sm text-gray-500">Navbar logo and favicon are optional</p>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Navbar Logo</label>
              <input
                type="file"
                name="navbarLogo"
                accept="image/*"
                onChange={handleFileChange}
                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              />
              {settings.navbarLogo && (
                <img src={settings.navbarLogo} alt="Navbar Logo" className="mt-2 h-12 object-contain" />
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Favicon</label>
              <input
                type="file"
                name="favicon"
                accept="image/*"
                onChange={handleFileChange}
                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              />
              {settings.favicon && (
                <img src={settings.favicon} alt="Favicon" className="mt-2 h-8 w-8 object-contain" />
              )}
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-900">Contact Email</h3>
          <p className="mt-1 text-sm text-gray-500">Email address for receiving contact form submissions</p>
          <div className="mt-4">
            <input
              type="email"
              name="contactEmail"
              value={settings.contactEmail}
              onChange={handleChange}
              placeholder="Enter contact email"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
            />
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-900">Phone Numbers</h3>
          {settings.phoneNumbers.map((phone, index) => (
            <div key={index} className="mt-4 flex items-center space-x-4">
              <input
                type="tel"
                value={phone.number}
                onChange={(e) => updatePhoneNumber(index, 'number', e.target.value)}
                placeholder="Phone Number"
                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
              <select
                value={phone.type}
                onChange={(e) => updatePhoneNumber(index, 'type', e.target.value)}
                className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="mobile">Mobile</option>
                <option value="office">Office</option>
                <option value="support">Support</option>
              </select>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={phone.isPrimary}
                  onChange={(e) => updatePhoneNumber(index, 'isPrimary', e.target.checked)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm">Primary</span>
              </label>
              <button
                type="button"
                onClick={() => removePhoneNumber(index)}
                className="text-red-600 hover:text-red-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addPhoneNumber}
            className="mt-2 inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Add Phone Number
          </button>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-900">Emails</h3>
          {settings.emails.map((email, index) => (
            <div key={index} className="mt-4 flex items-center space-x-4">
              <input
                type="email"
                value={email.email}
                onChange={(e) => updateEmail(index, 'email', e.target.value)}
                placeholder="Email Address"
                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
              <select
                value={email.purpose}
                onChange={(e) => updateEmail(index, 'purpose', e.target.value)}
                className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="general">General</option>
                <option value="support">Support</option>
                <option value="sales">Sales</option>
                <option value="billing">Billing</option>
              </select>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={email.isPrimary}
                  onChange={(e) => updateEmail(index, 'isPrimary', e.target.checked)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm">Primary</span>
              </label>
              <button
                type="button"
                onClick={() => removeEmail(index)}
                className="text-red-600 hover:text-red-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addEmail}
            className="mt-2 inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Add Email
          </button>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-900">Addresses</h3>
          {settings.addresses.map((address, index) => (
            <div key={index} className="mt-4 p-4 border rounded-md space-y-4">
              <div className="flex justify-between items-center">
                <input
                  type="text"
                  value={address.title}
                  onChange={(e) => updateAddress(index, 'title', e.target.value)}
                  placeholder="Address Title (e.g., Head Office)"
                  className="text-lg font-medium rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={address.isPrimary}
                      onChange={(e) => updateAddress(index, 'isPrimary', e.target.checked)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm">Primary</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => removeAddress(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Address Text</label>
                <textarea
                  value={address.location.addressText}
                  onChange={(e) => updateAddress(index, 'location.addressText', e.target.value)}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Google Maps Link</label>
                <input
                  type="url"
                  value={address.location.googleMapsLink || ''}
                  onChange={(e) => updateAddress(index, 'location.googleMapsLink', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Mobile</label>
                  <input
                    type="tel"
                    value={address.contactNumbers.mobile || ''}
                    onChange={(e) => updateAddress(index, 'contactNumbers.mobile', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Telephone</label>
                  <input
                    type="tel"
                    value={address.contactNumbers.telephone || ''}
                    onChange={(e) => updateAddress(index, 'contactNumbers.telephone', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Office</label>
                  <input
                    type="tel"
                    value={address.contactNumbers.office || ''}
                    onChange={(e) => updateAddress(index, 'contactNumbers.office', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Emails</label>
                {address.emails.map((email, emailIndex) => (
                  <div key={emailIndex} className="mt-2 flex items-center space-x-2">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => updateAddressEmail(index, emailIndex, e.target.value)}
                      className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => removeAddressEmail(index, emailIndex)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addAddressEmail(index)}
                  className="mt-2 inline-flex items-center px-2 py-1 border border-gray-300 rounded-md text-xs font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Add Email
                </button>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={addAddress}
            className="mt-2 inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Add Address
          </button>
        </div>
      </div>
    </form>
  );
}