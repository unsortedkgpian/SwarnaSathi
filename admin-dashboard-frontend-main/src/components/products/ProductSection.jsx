import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, X, Plus, Trash2 } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';

export default function ProductSections() {
  const { id } = useParams();
  const url = process.env.REACT_APP_API_URL;
  const navigate = useNavigate();
  const { authAxios } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // formData holds the sections as JSON objects
  const [formData, setFormData] = useState({
    mainSection: {
      eligibility: [],
      applicationProcess: [],
      rateDetails: []
    },
    quickstepsSection: {
      title: '',
      subtitle: '',
      image: '', // this field is ignored when file is uploaded
      steps: []
    },
    benefitsSection: {
      benefits: []
    }
  });

  // sectionFiles holds the file objects for quicksteps section image and quickstep icons
  const [sectionFiles, setSectionFiles] = useState({
    quickstepsSectionImage: null,
    quickstepIcons: [] // array corresponding to each quickstep in formData.quickstepsSection.steps
  });

  useEffect(() => {
    fetchSections();
  }, [id]);

  const fetchSections = async () => {
    try {
      const response = await authAxios.get(url + `/api/products/${id}/sections`);
      setFormData(response.data);
      // Initialize quickstepIcons array with nulls matching the steps length
      setSectionFiles({
        quickstepsSectionImage: null,
        quickstepIcons: Array(response.data.quickstepsSection.steps.length).fill(null)
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching sections');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const data = new FormData();
      // Append JSON fields as strings
      data.append('mainSection', JSON.stringify(formData.mainSection));
      
      // For quickstepsSection, remove the image field and remove empty "icon" fields from steps
      const quickstepsCopy = { ...formData.quickstepsSection };
      delete quickstepsCopy.image;
      quickstepsCopy.steps = quickstepsCopy.steps.map(({ icon, ...rest }) => rest);
      data.append('quickstepsSection', JSON.stringify(quickstepsCopy));
      
      data.append('benefitsSection', JSON.stringify(formData.benefitsSection));
      
      // Append file for quickstepsSection image if exists
      if (sectionFiles.quickstepsSectionImage) {
        data.append('quickstepsSectionImage', sectionFiles.quickstepsSectionImage);
      }
      
      // Append files for each quickstep icon in order
      if (sectionFiles.quickstepIcons && sectionFiles.quickstepIcons.length > 0) {
        sectionFiles.quickstepIcons.forEach((file) => {
          if (file) {
            data.append('quickstepIcon', file);
          }
        });
      }
      
      await authAxios.put(url + `/api/products/${id}/sections`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      navigate('/dashboard/products');
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving sections');
    } finally {
      setLoading(false);
    }
  };


  // Helper functions for mainSection arrays
  const addArrayItem = (section, field) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: [
          ...prev[section][field],
          section === 'mainSection' && field === 'rateDetails'
            ? { title: '', details: '' }
            : ''
        ]
      }
    }));
  };

  const removeArrayItem = (section, field, index) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: prev[section][field].filter((_, i) => i !== index)
      }
    }));
    // Also update quickstepIcons if removing a step in quickstepsSection.steps
    if (section === 'quickstepsSection' && field === 'steps') {
      setSectionFiles(prev => ({
        ...prev,
        quickstepIcons: prev.quickstepIcons.filter((_, i) => i !== index)
      }));
    }
  };

  const updateArrayItem = (section, field, index, value, subfield = null) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: prev[section][field].map((item, i) => {
          if (i === index) {
            return subfield ? { ...item, [subfield]: value } : value;
          }
          return item;
        })
      }
    }));
  };

  // Quicksteps section helpers
  const addQuickstep = () => {
    if (formData.quickstepsSection.steps.length >= 4) return;
    setFormData(prev => ({
      ...prev,
      quickstepsSection: {
        ...prev.quickstepsSection,
        steps: [
          ...prev.quickstepsSection.steps,
          { icon: '', title: '', content: '' }
        ]
      }
    }));
    setSectionFiles(prev => ({
      ...prev,
      quickstepIcons: [...prev.quickstepIcons, null]
    }));
  };

  const updateQuickstep = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      quickstepsSection: {
        ...prev.quickstepsSection,
        steps: prev.quickstepsSection.steps.map((step, i) => {
          if (i === index) {
            return { ...step, [field]: value };
          }
          return step;
        })
      }
    }));
  };

  // For file input for each quickstep icon
  const handleQuickstepIconChange = (index, file) => {
    setSectionFiles(prev => {
      const newIcons = [...prev.quickstepIcons];
      newIcons[index] = file;
      return { ...prev, quickstepIcons: newIcons };
    });
  };

  // Benefits section helpers
  const addBenefit = () => {
    setFormData(prev => ({
      ...prev,
      benefitsSection: {
        ...prev.benefitsSection,
        benefits: [
          ...prev.benefitsSection.benefits,
          { benefitTitle: '', content: '' }
        ]
      }
    }));
  };

  const updateBenefit = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      benefitsSection: {
        ...prev.benefitsSection,
        benefits: prev.benefitsSection.benefits.map((benefit, i) => {
          if (i === index) {
            return { ...benefit, [field]: value };
          }
          return benefit;
        })
      }
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Edit Product Sections</h2>
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

      {/* Main Section */}
      <div className="space-y-6">
        <h3 className="text-lg font-medium text-gray-900">Main Section</h3>
        
        {/* Eligibility */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-medium text-gray-700">Eligibility</h4>
            <button
              type="button"
              onClick={() => addArrayItem('mainSection', 'eligibility')}
              className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Point
            </button>
          </div>
          {formData.mainSection.eligibility.map((point, index) => (
            <div key={index} className="flex items-center space-x-2">
              <input
                type="text"
                value={point}
                onChange={(e) => updateArrayItem('mainSection', 'eligibility', index, e.target.value)}
                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
              <button
                type="button"
                onClick={() => removeArrayItem('mainSection', 'eligibility', index)}
                className="text-red-600 hover:text-red-800"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Application Process */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-medium text-gray-700">Application Process</h4>
            <button
              type="button"
              onClick={() => addArrayItem('mainSection', 'applicationProcess')}
              className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Step
            </button>
          </div>
          {formData.mainSection.applicationProcess.map((step, index) => (
            <div key={index} className="flex items-center space-x-2">
              <input
                type="text"
                value={step}
                onChange={(e) => updateArrayItem('mainSection', 'applicationProcess', index, e.target.value)}
                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
              <button
                type="button"
                onClick={() => removeArrayItem('mainSection', 'applicationProcess', index)}
                className="text-red-600 hover:text-red-800"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Rate Details */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-medium text-gray-700">Rate Details</h4>
            <button
              type="button"
              onClick={() => addArrayItem('mainSection', 'rateDetails')}
              className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Rate
            </button>
          </div>
          {formData.mainSection.rateDetails.map((rate, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={rate.title}
                  onChange={(e) => updateArrayItem('mainSection', 'rateDetails', index, e.target.value, 'title')}
                  placeholder="Rate Title"
                  className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
                <button
                  type="button"
                  onClick={() => removeArrayItem('mainSection', 'rateDetails', index)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <textarea
                value={rate.details}
                onChange={(e) => updateArrayItem('mainSection', 'rateDetails', index, e.target.value, 'details')}
                placeholder="Rate Details"
                rows={2}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Quicksteps Section */}
      <div className="space-y-6">
        <h3 className="text-lg font-medium text-gray-900">Quicksteps Section</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Title</label>
            <input
              type="text"
              value={formData.quickstepsSection.title}
              onChange={(e) =>
                setFormData(prev => ({
                  ...prev,
                  quickstepsSection: {
                    ...prev.quickstepsSection,
                    title: e.target.value
                  }
                }))
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Subtitle</label>
            <input
              type="text"
              value={formData.quickstepsSection.subtitle}
              onChange={(e) =>
                setFormData(prev => ({
                  ...prev,
                  quickstepsSection: {
                    ...prev.quickstepsSection,
                    subtitle: e.target.value
                  }
                }))
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Image</label>
          <input
            type="file"
            name="quickstepsSectionImage"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                setSectionFiles(prev => ({
                  ...prev,
                  quickstepsSectionImage: e.target.files[0]
                }));
              }
            }}
            className="mt-1 block w-full"
          />
          {sectionFiles.quickstepsSectionImage && (
            <p className="text-sm text-gray-500">
              Selected file: {sectionFiles.quickstepsSectionImage.name}
            </p>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-medium text-gray-700">Steps</h4>
            <button
              type="button"
              onClick={addQuickstep}
              disabled={formData.quickstepsSection.steps.length >= 4}
              className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Step
            </button>
          </div>
          {formData.quickstepsSection.steps.map((step, index) => (
            <div key={index} className="space-y-2 p-4 border border-gray-200 rounded-md">
              <div className="flex justify-between">
                <h5 className="text-sm font-medium text-gray-700">Step {index + 1}</h5>
                <button
                  type="button"
                  onClick={() => removeArrayItem('quickstepsSection', 'steps', index)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Icon</label>
                <input
                  type="file"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      // Reset the quickstep icon value in formData (if needed)
                      updateQuickstep(index, 'icon', '');
                      handleQuickstepIconChange(index, e.target.files[0]);
                    }
                  }}
                  className="mt-1 block w-full"
                />
                {sectionFiles.quickstepIcons[index] && (
                  <p className="text-sm text-gray-500">
                    Selected file: {sectionFiles.quickstepIcons[index].name}
                  </p>
                )}
              </div>
              <input
                type="text"
                value={step.title}
                onChange={(e) => updateQuickstep(index, 'title', e.target.value)}
                placeholder="Step Title"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
              <textarea
                value={step.content}
                onChange={(e) => updateQuickstep(index, 'content', e.target.value)}
                placeholder="Step Content"
                rows={2}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Benefits Section */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">Benefits Section</h3>
          <button
            type="button"
            onClick={addBenefit}
            className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Benefit
          </button>
        </div>
        {formData.benefitsSection.benefits.map((benefit, index) => (
          <div key={index} className="space-y-2 p-4 border border-gray-200 rounded-md">
            <div className="flex justify-between">
              <h4 className="text-sm font-medium text-gray-700">Benefit {index + 1}</h4>
              <button
                type="button"
                onClick={() => removeArrayItem('benefitsSection', 'benefits', index)}
                className="text-red-600 hover:text-red-800"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <input
              type="text"
              value={benefit.benefitTitle}
              onChange={(e) => updateBenefit(index, 'benefitTitle', e.target.value)}
              placeholder="Benefit Title"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
            <textarea
              value={benefit.content}
              onChange={(e) => updateBenefit(index, 'content', e.target.value)}
              placeholder="Benefit Content"
              rows={2}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
        ))}
      </div>
    </form>
  );
}