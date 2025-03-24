import React, { useEffect, useState } from "react";
import axios from "axios";
const CategoryList = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch categories from the API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get("http://localhost:8000/category");
        if (!response.ok) {
          throw new Error(`Error: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        setCategories(data);
      } catch (err) {
        setError(err.message || "An unexpected error occurred.");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading categories...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">No categories found.</div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl p-4 mx-auto">
      <h2 className="mb-6 text-2xl font-semibold">Categories</h2>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {categories.map((category) => (
          <div key={category.id} className="p-4 bg-white rounded-md shadow-md">
            {/* Category Header */}
            <h3 className="mb-2 text-xl font-bold">{category.title}</h3>
            <p className="mb-4 text-gray-700">{category.description}</p>

            {/* Media */}
            <div className="mb-4">
              {category.mediaType === "image" ? (
                <img
                  src={category.image.url}
                  alt={category.image.alt}
                  className="object-cover w-full h-48 rounded-md"
                />
              ) : (
                <video
                  controls
                  src={category.image.url}
                  alt={category.image.alt}
                  className="object-cover w-full h-48 rounded-md"
                >
                  Your browser does not support the video tag.
                </video>
              )}
            </div>

            {/* Gallery */}
            {category.gallery && category.gallery.length > 0 && (
              <div>
                <h4 className="mb-2 text-lg font-semibold">Gallery</h4>
                <div className="flex flex-wrap gap-2">
                  {category.gallery.map((item, index) => (
                    <div key={index} className="relative w-24 h-24">
                      {category.mediaType === "image" ? (
                        <img
                          src={item.url}
                          alt={item.alt}
                          className="object-cover w-full h-full rounded-md"
                        />
                      ) : (
                        <video
                          controls
                          src={item.url}
                          alt={item.alt}
                          className="object-cover w-full h-full rounded-md"
                        >
                          Your browser does not support the video tag.
                        </video>
                      )}
                      <span className="absolute bottom-0 left-0 px-1 text-xs text-white bg-black bg-opacity-50">
                        {item.title}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryList;