import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, X, Plus, Trash2 } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';

export default function CategoryForm() {
  const { id } = useParams();
  const url = process.env.REACT_APP_API_URL;
  const navigate = useNavigate();
  const { authAxios } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    mediaType: 'image',
    image: null,
    video: null,
    gallery: []
  });
  const [files, setFiles] = useState({
    image: null,
    video: null,
    gallery: []
  });

  useEffect(() => {
    if (id) {
      fetchCategory();
    }
  }, [id]);

  const fetchCategory = async () => {
    try {
      const response = await authAxios.get(url+`/api/category/${id}`);
      setFormData(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching category');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const form = new FormData();
      form.append('title', formData.title);
      form.append('description', formData.description);
      form.append('mediaType', formData.mediaType);

      // Handle main media
      if (formData.mediaType === 'image') {
        if (files.image) {
          form.append('image', files.image);
        } else if (formData.image?.url) {
          form.append('imageUrl', formData.image.url);
          form.append('imageAlt', formData.image.alt || '');
        }
      } else {
        if (files.video) {
          form.append('video', files.video);
        } else if (formData.video?.url) {
          form.append('videoUrl', formData.video.url);
          form.append('videoType', formData.video.type || 'youtube');
        }
      }

      // Handle gallery
      if (files.gallery?.length > 0) {
        files.gallery.forEach(file => {
          form.append('gallery', file);
        });
      }

      if (formData.gallery?.length > 0) {
        const urlImages = formData.gallery
          .filter(img => img.media?.url)
          .map(img => ({
            url: img.media.url,
            alt: img.media.alt || '',
            title: img.title || '',
            order: img.order
          }));
        
        if (urlImages.length > 0) {
          form.append('urlImages', JSON.stringify(urlImages));
        }
      }

      if (id) {
        await authAxios.put(url+`/api/category/${id}`, form, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await authAxios.post(url+'/api/category', form, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      navigate('/dashboard/categories');
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving category');
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const { name, files: uploadedFiles } = e.target;
    if (name === 'gallery') {
      setFiles(prev => ({
        ...prev,
        gallery: [...prev.gallery, ...uploadedFiles]
      }));
    } else {
      setFiles(prev => ({
        ...prev,
        [name]: uploadedFiles[0]
      }));
    }
  };

  const handleUrlChange = (e) => {
    const { name, value } = e.target;
    const [parent, child] = name.split('.');
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [child]: value
      }
    }));
  };

  const addGalleryUrl = () => {
    setFormData(prev => ({
      ...prev,
      gallery: [
        ...prev.gallery,
        { url: '', alt: '', title: '', order: prev.gallery.length }
      ]
    }));
  };

  const removeGalleryItem = (index) => {
    setFormData(prev => ({
      ...prev,
      gallery: prev.gallery.filter((_, i) => i !== index)
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">
          {id ? 'Edit Category' : 'New Category'}
        </h2>
        <div className="flex space-x-4">
          <button
            type="button"
            onClick={() => navigate('/dashboard/categories')}
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

      <div className="grid grid-cols-1 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            maxLength={100}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            maxLength={500}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Media Type</label>
          <select
            name="mediaType"
            value={formData.mediaType}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="image">Image</option>
            <option value="video">Video</option>
          </select>
        </div>

        {formData.mediaType === 'image' ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Upload Image</label>
              <input
                type="file"
                name="image"
                accept="image/*"
                onChange={handleFileChange}
                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              />
            </div>
            <div className="- divider">OR</div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Image URL</label>
                <input
                  type="url"
                  name="image.url"
                  value={formData.image?.url || ''}
                  onChange={handleUrlChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Alt Text</label>
                <input
                  type="text"
                  name="image.alt"
                  value={formData.image?.alt || ''}
                  onChange={handleUrlChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Upload Video</label>
              <input
                type="file"
                name="video"
                accept="video/*"
                onChange={handleFileChange}
                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              />
            </div>
            <div className="- divider">OR</div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Video URL</label>
                <input
                  type="url"
                  name="video.url"
                  value={formData.video?.url || ''}
                  onChange={handleUrlChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Video Type</label>
                <select
                  name="video.type"
                  value={formData.video?.type || 'youtube'}
                  onChange={handleUrlChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="youtube">YouTube</option>
                  <option value="url">Direct URL</option>
                </select>
              </div>
            </div>
          </div>
        )}

        <div>
          <div className="flex justify-between items-center mb-4">
            <label className="block text-sm font-medium text-gray-700">Gallery</label>
            <div className="flex space-x-4">
              <input
                type="file"
                name="gallery"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                className="hidden"
                id="gallery-upload"
              />
              <label
                htmlFor="gallery-upload"
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
              >
                <Plus className="h-4 w-4 mr-2" />
                Upload Images
              </label>
              <button
                type="button"
                onClick={addGalleryUrl}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add URL
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {files.gallery.length > 0 && (
              <div className="border p-4 rounded-md">
                <h4 className="font-medium mb-2">Selected Files:</h4>
                <ul className="space-y-2">
                  {Array.from(files.gallery).map((file, index) => (
                    <li key={index} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setFiles(prev => ({
                            ...prev,
                            gallery: prev.gallery.filter((_, i) => i !== index)
                          }));
                        }}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {formData.gallery?.map((image, index) => (
              <div key={index} className="grid grid-cols-4 gap-4 items-end border p-4 rounded-md">
                <div>
                  <label className="block text-sm font-medium text-gray-700">URL</label>
                  <input
                    type="url"
                    value={image.url}
                    onChange={(e) => {
                      const newGallery = [...formData.gallery];
                      newGallery[index] = { ...image, url: e.target.value };
                      setFormData(prev => ({ ...prev, gallery: newGallery }));
                    }}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Alt Text</label>
                  <input
                    type="text"
                    value={image.alt}
                    onChange={(e) => {
                      const newGallery = [...formData.gallery];
                      newGallery[index] = { ...image, alt: e.target.value };
                      setFormData(prev => ({ ...prev, gallery: newGallery }));
                    }}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Title</label>
                  <input
                    type="text"
                    value={image.title}
                    onChange={(e) => {
                      const newGallery = [...formData.gallery];
                      newGallery[index] = { ...image, title: e.target.value };
                      setFormData(prev => ({ ...prev, gallery: newGallery }));
                    }}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeGalleryItem(index)}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </form>
  );
}