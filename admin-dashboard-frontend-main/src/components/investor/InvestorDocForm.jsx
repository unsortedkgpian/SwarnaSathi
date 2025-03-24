import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, X, Upload } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';

export default function InvestorDeskDocumentForm() {
  const { sectionId, docId } = useParams();
  const url = process.env.REACT_APP_API_URL;
  const navigate = useNavigate();
  const { authAxios } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    file: null
  });
  const [currentFile, setCurrentFile] = useState(null);

  useEffect(() => {
    if (docId) {
      fetchDocument();
    }
  }, [docId]);

  const fetchDocument = async () => {
    try {
      const response = await authAxios.get(url+`/api/investor-desk/sections/${sectionId}/documents/${docId}`);
      setFormData({
        title: response.data.title,
        file: null
      });
      setCurrentFile({
        filename: response.data.filename,
        fileUrl: response.data.fileUrl
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching document');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const form = new FormData();
      form.append('title', formData.title);
      if (formData.file) {
        form.append('file', formData.file);
      }

      if (docId) {
        await authAxios.put(url+`/api/investor-desk/sections/${sectionId}/documents/${docId}`, form, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await authAxios.post(url+`/api/investor-desk/sections/${sectionId}/documents`, form, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      navigate('/dashboard/investor-desk');
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving document');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === 'file') {
      setFormData(prev => ({
        ...prev,
        file: files[0]
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
          {docId ? 'Edit Document' : 'New Document'}
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
          <label className="block text-sm font-medium text-gray-700">Document Title</label>
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
          <label className="block text-sm font-medium text-gray-700">Document File</label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
            <div className="space-y-1 text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <div className="flex text-sm text-gray-600">
                <label
                  htmlFor="file-upload"
                  className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                >
                  <span>Upload a file</span>
                  <input
                    id="file-upload"
                    name="file"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleChange}
                    className="sr-only"
                    required={!docId}
                  />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500">PDF, DOC up to 10MB</p>
            </div>
          </div>
          {formData.file && (
            <p className="mt-2 text-sm text-gray-500">
              Selected file: {formData.file.name}
            </p>
          )}
          {currentFile && !formData.file && (
            <div className="mt-2">
              <p className="text-sm text-gray-500">Current file: {currentFile.filename}</p>
              <a
                href={currentFile.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-indigo-600 hover:text-indigo-500"
              >
                View current file
              </a>
            </div>
          )}
        </div>
      </div>
    </form>
  );
}