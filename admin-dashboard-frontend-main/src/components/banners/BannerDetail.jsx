import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Edit, ArrowLeft } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';

export default function BannerDetail() {
  const { id } = useParams();
  const { authAxios } = useContext(AuthContext);
  const [banner, setBanner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const url = process.env.REACT_APP_API_URL;

  useEffect(() => {
    fetchBanner();
  }, [id]);

  const fetchBanner = async () => {
    try {
      const response = await authAxios.get(`${url}/api/banners/${id}`);
      setBanner(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching banner');
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

  if (!banner) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Banner not found</h2>
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-white p-6 rounded-lg shadow">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Link
            to="/dashboard/banners"
            className="inline-flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Banners
          </Link>
          <h2 className="text-2xl font-bold text-gray-900">{banner.title}</h2>
        </div>
        <Link
          to={`/dashboard/banners/${id}/edit`}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <Edit className="h-5 w-5 mr-2" />
          Edit Banner
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-8">
        {/* Left Column: Basic and SEO Information */}
        <div className="space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
            <dl className="mt-2 grid grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Background Type</dt>
                <dd className="mt-1 text-sm text-gray-900">{banner.backgroundType}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Media Type</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {banner.media?.mediaType || '-'}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Status</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      banner.active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {banner.active ? 'Active' : 'Inactive'}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Priority</dt>
                <dd className="mt-1 text-sm text-gray-900">{banner.priority}</dd>
              </div>
            </dl>
          </div>

          {/* SEO Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900">SEO Information</h3>
            <dl className="mt-2 space-y-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Meta Title</dt>
                <dd className="mt-1 text-sm text-gray-900">{banner.seo?.metaTitle || '-'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Meta Description</dt>
                <dd className="mt-1 text-sm text-gray-900">{banner.seo?.metaDescription || '-'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Slug</dt>
                <dd className="mt-1 text-sm text-gray-900">{banner.seo?.slug || '-'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Canonical URL</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {banner.seo?.canonicalUrl ? (
                    <a
                      href={banner.seo.canonicalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      {banner.seo.canonicalUrl}
                    </a>
                  ) : (
                    '-'
                  )}
                </dd>
              </div>
              {banner.seo?.tags && banner.seo.tags.length > 0 && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Tags</dt>
                  <dd className="mt-1 flex flex-wrap gap-2">
                    {banner.seo.tags.map((tag, index) => (
                      <span key={index} className="px-2 py-1 text-xs bg-gray-100 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>

        {/* Right Column: Media & Created Information */}
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Media</h3>
            <div className="mt-2">
              {banner.media ? (
                <img
                  src={banner.media.file}
                  alt={banner.media.alt}
                  className="w-full h-auto rounded-lg object-cover"
                />
              ) : (
                <p>No media available.</p>
              )}
            </div>
          </div>

          {/* If your API ever returns a featuredImage, render it conditionally */}
          {banner.featuredImage && (
            <div>
              <h3 className="text-lg font-medium text-gray-900">Featured Image</h3>
              <div className="mt-2">
                <img
                  src={banner.featuredImage.file}
                  alt={banner.featuredImage.alt}
                  className="w-full h-auto rounded-lg object-cover"
                />
              </div>
            </div>
          )}

          {/* If gallery exists */}
          {banner.gallery && banner.gallery.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-gray-900">Gallery</h3>
              <div className="mt-2 grid grid-cols-2 gap-4">
                {banner.gallery.map((item, index) => (
                  <div key={index} className="relative">
                    <img
                      src={item.file}
                      alt={item.alt}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    {item.title && (
                      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2 rounded-b-lg">
                        <p className="text-sm truncate">{item.title}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <h3 className="text-lg font-medium text-gray-900">Created Information</h3>
            <dl className="mt-2 grid grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Created At</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(banner.createdAt).toLocaleDateString()}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(banner.updatedAt).toLocaleDateString()}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}