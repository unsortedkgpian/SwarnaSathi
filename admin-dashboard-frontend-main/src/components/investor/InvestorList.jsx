import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, FileText, FolderPlus } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';

export default function InvestorDeskList() {
  const [desk, setDesk] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { authAxios } = useContext(AuthContext);
  const url = process.env.REACT_APP_API_URL;
  useEffect(() => {
    fetchInvestorDesk();
  }, []);

  const fetchInvestorDesk = async () => {
    try {
      const response = await authAxios.get(url+'/api/investor-desk');
      setDesk(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching investor desk');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSection = async (sectionId) => {
    if (!window.confirm('Are you sure you want to delete this section?')) return;

    try {
      await authAxios.delete(url+`/api/investor-desk/sections/${sectionId}`);
      fetchInvestorDesk();
    } catch (err) {
      setError(err.response?.data?.message || 'Error deleting section');
    }
  };

  const handleDeleteDocument = async (sectionId, docId) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;

    try {
      await authAxios.delete(url+`/api/investor-desk/sections/${sectionId}/documents/${docId}`);
      fetchInvestorDesk();
    } catch (err) {
      setError(err.response?.data?.message || 'Error deleting document');
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
        <h2 className="text-2xl font-bold text-gray-900">Investor's Desk</h2>
        <Link
          to="/dashboard/investor-desk/sections/new"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <FolderPlus className="h-5 w-5 mr-2" />
          New Section
        </Link>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      <div className="space-y-6">
        {desk?.sections.map((section) => (
          <div key={section._id} className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">{section.title}</h3>
                {section.seo?.metaTitle && (
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">
                    SEO Title: {section.seo.metaTitle}
                  </p>
                )}
              </div>
              <div className="flex space-x-3">
                <Link
                  to={`/dashboard/investor-desk/sections/${section._id}/documents/new`}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Document
                </Link>
                <Link
                  to={`/dashboard/investor-desk/sections/${section._id}/edit`}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Link>
                <button
                  onClick={() => handleDeleteSection(section._id)}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </button>
              </div>
            </div>
            <div className="border-t border-gray-200">
              <ul className="divide-y divide-gray-200">
                {section.documents.map((doc) => (
                  <li key={doc._id} className="px-4 py-4 flex items-center justify-between hover:bg-gray-50">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{doc.title}</p>
                        <p className="text-sm text-gray-500">{doc.filename}</p>
                      </div>
                    </div>
                    <div className="flex space-x-3">
                      <a
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        View
                      </a>
                      <Link
                        to={`/dashboard/investor-desk/sections/${section._id}/documents/${doc._id}/edit`}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDeleteDocument(section._id, doc._id)}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
                {section.documents.length === 0 && (
                  <li className="px-4 py-4 text-sm text-gray-500 italic">
                    No documents in this section
                  </li>
                )}
              </ul>
            </div>
          </div>
        ))}
        {desk?.sections.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No sections</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating a new section.</p>
            <div className="mt-6">
              <Link
                to="/dashboard/investor-desk/sections/new"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                <Plus className="h-5 w-5 mr-2" />
                New Section
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}