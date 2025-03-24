import React, { useState } from "react";
import axios from "axios";
const CategoryForm = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    mediaType: "image",
    image: {
      url: "",
      alt: "",
    },
    gallery: [],
  });

  // Handle changes for title, description, and mediaType
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle changes for the main image fields
  const handleImageChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      image: {
        ...prev.image,
        [name]: value,
      },
    }));
  };

  // Handle changes for gallery items
  const handleGalleryChange = (index, key, value) => {
    const updatedGallery = [...formData.gallery];
    updatedGallery[index] = { ...updatedGallery[index], [key]: value };
    setFormData((prev) => ({ ...prev, gallery: updatedGallery }));
  };

  // Add a new gallery item
  const addGalleryItem = () => {
    setFormData((prev) => ({
      ...prev,
      gallery: [...prev.gallery, { url: "", alt: "", title: "" }],
    }));
  };

  // Remove a gallery item
  const removeGalleryItem = (index) => {
    const updatedGallery = formData.gallery.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, gallery: updatedGallery }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Submitted Payload:", formData);
    try {
        const response = await axios.post('http://localhost:8000/category', {
            title: formData.title,
            description: formData.description,
            mediaType: formData.mediaType,
            image: formData.image,
            gallery: formData.gallery,
            });
        if (response.status === 200) {
            alert('Category created successfully');
            console.log(response.data);
        }        
    } catch (error) {
        alert('Category creation failed');
    }
    // You can replace the above line with an API call to submit the formData
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-lg p-4 mx-auto bg-white rounded-md shadow-md">
      <h2 className="mb-4 text-lg font-semibold">Category Form</h2>

      {/* Title */}
      <div className="mb-4">
        <label className="block mb-2 text-sm font-medium">Title</label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border rounded"
          placeholder="Enter category title"
          required
        />
      </div>

      {/* Description */}
      <div className="mb-4">
        <label className="block mb-2 text-sm font-medium">Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border rounded"
          placeholder="Enter category description"
          required
        />
      </div>

      {/* Media Type */}
      <div className="mb-4">
        <label className="block mb-2 text-sm font-medium">Media Type</label>
        <select
          name="mediaType"
          value={formData.mediaType}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border rounded"
        >
          <option value="image">Image</option>
          <option value="video">Video</option>
        </select>
      </div>

      {/* Image */}
      <div className="mb-4">
        <h3 className="mb-2 text-sm font-medium">Image</h3>
        <div className="space-y-2">
          <input
            type="text"
            name="url"
            value={formData.image.url}
            onChange={handleImageChange}
            className="w-full px-3 py-2 border rounded"
            placeholder="Image URL"
            required
          />
          <input
            type="text"
            name="alt"
            value={formData.image.alt}
            onChange={handleImageChange}
            className="w-full px-3 py-2 border rounded"
            placeholder="Image Alt Text"
            required
          />
        </div>
      </div>

      {/* Gallery */}
      <div className="mb-4">
        <h3 className="mb-2 text-sm font-medium">Gallery</h3>
        {formData.gallery.map((item, index) => (
          <div key={index} className="p-2 mb-4 space-y-2 border rounded">
            <input
              type="text"
              value={item.url}
              onChange={(e) => handleGalleryChange(index, "url", e.target.value)}
              className="w-full px-3 py-2 border rounded"
              placeholder="Gallery Item URL"
            />
            <input
              type="text"
              value={item.alt}
              onChange={(e) => handleGalleryChange(index, "alt", e.target.value)}
              className="w-full px-3 py-2 border rounded"
              placeholder="Gallery Item Alt Text"
            />
            <input
              type="text"
              value={item.title}
              onChange={(e) => handleGalleryChange(index, "title", e.target.value)}
              className="w-full px-3 py-2 border rounded"
              placeholder="Gallery Item Title"
            />
            <button
              type="button"
              onClick={() => removeGalleryItem(index)}
              className="mt-2 text-sm text-red-500"
            >
              Remove
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addGalleryItem}
          className="text-sm text-blue-500"
        >
          Add Gallery Item
        </button>
      </div>

      {/* Submit */}
      <button
        type="submit"
        className="w-full px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
      >
        Submit
      </button>
    </form>
  );
};

export default CategoryForm;