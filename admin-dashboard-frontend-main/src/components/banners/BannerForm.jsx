import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, X, PlayCircle, ImageIcon, Youtube } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';

export default function BannerForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { authAxios } = useContext(AuthContext);
  const url = process.env.REACT_APP_API_URL;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    downloadUrl: '',
    backgroundType: 'image',
    youtubeUrl: '',
    active: true,
    priority: 0,
    seo: {
      metaTitle: '',
      metaDescription: '',
      tags: [],
      canonicalUrl: '',
      slug: ''
    }
  });

  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);

  useEffect(() => {
    if (id) {
      fetchBanner();
    }
  }, [id]);

  const fetchBanner = async () => {
    try {
      const response = await authAxios.get(`${url}/api/banners/${id}`);
      const banner = response.data.data;
      setFormData({
        ...banner,
        seo: banner.seo || {
          metaTitle: '',
          metaDescription: '',
          tags: [],
          canonicalUrl: '',
          slug: ''
        }
      });
      if (banner.media?.file) {
        setMediaPreview(banner.media.file);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching banner');
    }
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      setError('Title is required');
      return false;
    }
    if (!formData.description.trim()) {
      setError('Description is required');
      return false;
    }
    if (!formData.downloadUrl.trim()) {
      setError('Download URL is required');
      return false;
    }
    if (formData.backgroundType === 'youtube' && !formData.youtubeUrl.trim()) {
      setError('YouTube URL is required for YouTube background type');
      return false;
    }
    if (formData.backgroundType !== 'youtube' && !mediaFile && !mediaPreview) {
      setError(`${formData.backgroundType === 'image' ? 'Image' : 'Video'} is required`);
      return false;
    }
    // Validate YouTube URL format if provided
    if (formData.backgroundType === 'youtube' && formData.youtubeUrl) {
      try {
        const youtubeUrl = new URL(formData.youtubeUrl);
        if (
          !youtubeUrl.hostname.includes('youtube.com') &&
          !youtubeUrl.hostname.includes('youtu.be')
        ) {
          setError('Invalid YouTube URL');
          return false;
        }
      } catch {
        setError('Invalid YouTube URL');
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
  
    if (!validateForm()) {
      return;
    }
  
    setLoading(true);
  
    try {
      const form = new FormData();
  
      // Append basic fields (excluding seo, media, and gallery)
      Object.keys(formData).forEach(key => {
        if (key !== 'seo' && key !== 'media' && key !== 'gallery' && formData[key] !== null) {
          form.append(key, formData[key]);
        }
      });
  
      // Append SEO data as a JSON string
      form.append('seo', JSON.stringify(formData.seo));
  
      // Append media file if available and not a YouTube background
      if (mediaFile && formData.backgroundType !== 'youtube') {
        form.append('media', mediaFile);
      }
  
      const config = {
        headers: { 'Content-Type': 'multipart/form-data' }
      };
      // Use PUT for updating an existing banner
      if (id) {
        console.log(form)
        await authAxios.put(`${url}/api/banners/${id}`, form);
        console.log(formData);
      } else {
        await authAxios.post(`${url}/api/banners`, form);
      }
  
      navigate('/dashboard/banners');
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving banner');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear media related fields when changing background type
    if (name === 'backgroundType') {
      setMediaFile(null);
      setMediaPreview(null);
      setFormData(prev => ({
        ...prev,
        youtubeUrl: '',
        [name]: value
      }));
    }
  };

  const handleSeoChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      seo: {
        ...prev.seo,
        [name]: value
      }
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMediaFile(file);
      // Create a preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setMediaPreview(reader.result);
        };
        reader.readAsDataURL(file);
      } else {
        setMediaPreview(null);
      }
    }
  };

  const handleTagsChange = (e) => {
    const tags = e.target.value.split(',').map(tag => tag.trim()).filter(Boolean);
    setFormData(prev => ({
      ...prev,
      seo: {
        ...prev.seo,
        tags
      }
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">
          {id ? 'Edit Banner' : 'New Banner'}
        </h2>
        <div className="flex space-x-4">
          <button
            type="button"
            onClick={() => navigate('/dashboard/banners')}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <X className="h-5 w-5 mr-2" />
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
          >
            <Save className="h-5 w-5 mr-2" />
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        {/* Basic Information */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="Enter banner title"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Download URL</label>
            <input
              type="url"
              name="downloadUrl"
              value={formData.downloadUrl}
              onChange={handleChange}
              required
              placeholder="https://"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="Enter banner description"
          />
        </div>

        {/* Background Configuration */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Background Type</label>
            <div className="mt-2 grid grid-cols-3 gap-3">
              <div
                className={`relative flex cursor-pointer rounded-lg border p-4 focus:outline-none ${
                  formData.backgroundType === 'image'
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-300'
                }`}
                onClick={() => handleChange({ target: { name: 'backgroundType', value: 'image' } })}
              >
                <div className="flex items-center justify-center">
                  <ImageIcon
                    className={`h-6 w-6 ${
                      formData.backgroundType === 'image' ? 'text-indigo-600' : 'text-gray-400'
                    }`}
                  />
                  <span className="ml-2">Image</span>
                </div>
              </div>
              <div
                className={`relative flex cursor-pointer rounded-lg border p-4 focus:outline-none ${
                  formData.backgroundType === 'video'
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-300'
                }`}
                onClick={() => handleChange({ target: { name: 'backgroundType', value: 'video' } })}
              >
                <div className="flex items-center justify-center">
                  <PlayCircle
                    className={`h-6 w-6 ${
                      formData.backgroundType === 'video' ? 'text-indigo-600' : 'text-gray-400'
                    }`}
                  />
                  <span className="ml-2">Video</span>
                </div>
              </div>
              <div
                className={`relative flex cursor-pointer rounded-lg border p-4 focus:outline-none ${
                  formData.backgroundType === 'youtube'
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-300'
                }`}
                onClick={() => handleChange({ target: { name: 'backgroundType', value: 'youtube' } })}
              >
                <div className="flex items-center justify-center">
                  <Youtube
                    className={`h-6 w-6 ${
                      formData.backgroundType === 'youtube' ? 'text-indigo-600' : 'text-gray-400'
                    }`}
                  />
                  <span className="ml-2">YouTube</span>
                </div>
              </div>
            </div>
          </div>

          {/* Background Content */}
          {formData.backgroundType === 'youtube' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700">YouTube URL</label>
              <input
                type="url"
                name="youtubeUrl"
                value={formData.youtubeUrl}
                onChange={handleChange}
                required
                placeholder="https://www.youtube.com/watch?v=..."
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                {formData.backgroundType === 'image' ? 'Background Image' : 'Background Video'}
              </label>
              <input
                type="file"
                onChange={handleFileChange}
                accept={formData.backgroundType === 'image' ? 'image/*' : 'video/*'}
                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              />
              {mediaPreview && formData.backgroundType === 'image' && (
                <div className="mt-2">
                  <img
                    src={mediaPreview}
                    alt="Preview"
                    className="h-32 w-auto object-cover rounded-md"
                  />
                </div>
              )}
              {mediaPreview && formData.backgroundType === 'video' && (
                <div className="mt-2">
                  <video
                    src={mediaPreview}
                    className="h-32 w-auto rounded-md"
                    controls
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* SEO Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">SEO (Optional)</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Meta Title</label>
              <input
                type="text"
                name="metaTitle"
                value={formData.seo?.metaTitle || ''}
                onChange={handleSeoChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Slug</label>
              <input
                type="text"
                name="slug"
                value={formData.seo?.slug || ''}
                onChange={handleSeoChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="url-friendly-slug"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Meta Description</label>
            <textarea
              name="metaDescription"
              value={formData.seo?.metaDescription || ''}
              onChange={handleSeoChange}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="Enter SEO description"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Tags</label>
            <input
              type="text"
              name="tags"
              value={formData.seo?.tags?.join(', ') || ''}
              onChange={handleTagsChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="Enter tags separated by commas"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Canonical URL</label>
            <input
              type="url"
              name="canonicalUrl"
              value={formData.seo?.canonicalUrl || ''}
              onChange={handleSeoChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="https://"
            />
          </div>
        </div>

        {/* Priority and Status */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Priority</label>
            <input
              type="number"
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              min="0"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
            <p className="mt-1 text-sm text-gray-500">
              Lower numbers will be displayed first
            </p>
          </div>
          <div className="flex items-center mt-6">
            <input
              type="checkbox"
              name="active"
              checked={formData.active}
              onChange={handleChange}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-900">
              Active banner (will be displayed on the website)
            </label>
          </div>
        </div>
      </div>
    </form>
  );
}