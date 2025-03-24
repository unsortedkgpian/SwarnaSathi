import React, { useContext, useState } from "react";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";

const CreateProduct = () => {
  const { authAxios } = useContext(AuthContext);
  const url = process.env.REACT_APP_API_URL;
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    icon: null, // Image file for S3
    eligibility: [""],
    applicationProcess: [""],
    rateDetails: [{ title: "", description: "" }],
    seo: {
      metaTitle: "",
      metaDescription: "",
      metaKeywords: [], // start as an empty array
    },
  });

  // Handler for top-level fields (title, description, etc.)
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Separate handler for SEO fields
  const handleSeoChange = (e) => {
    const { name, value } = e.target;
    // For keywords, convert the comma-separated string into an array
    if (name === "metaKeywords") {
      const keywordsArray = value.split(",").map((keyword) => keyword.trim());
      setFormData((prevData) => ({
        ...prevData,
        seo: {
          ...prevData.seo,
          [name]: keywordsArray,
        },
      }));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        seo: {
          ...prevData.seo,
          [name]: value,
        },
      }));
    }
  };

  // File change handler for the icon
  const handleFileChange = (e) => {
    setFormData((prevData) => ({
      ...prevData,
      icon: e.target.files[0],
    }));
  };

  // Submit handler remains mostly unchanged
  const handleSubmit = async (e) => {
    e.preventDefault();

  if (!formData.title || !formData.description || !formData.icon) {
    alert("Title, Description, and Icon are required.");
    return;
  }
    
    const productData = new FormData();
    productData.append("title", formData.title);
    productData.append("description", formData.description);
    productData.append("icon", formData.icon);
    productData.append("eligibility", JSON.stringify(formData.eligibility));
    productData.append("applicationProcess", JSON.stringify(formData.applicationProcess));
    productData.append("rateDetails", JSON.stringify(formData.rateDetails));
    productData.append("seo", JSON.stringify(formData.seo));

    try {
      await authAxios.post(url + "/api/products", productData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("Product Created Successfully");
      window.location.href = "/dashboard/products";
    } catch (err) {
      alert("Error creating product");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Create New Product</h1>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow">
        
        {/* Title */}
        <label className="block mb-2">Title</label>
        <input 
          type="text" 
          name="title" 
          value={formData.title} 
          onChange={handleChange} 
          className="w-full border p-2 mb-4" 
          required 
        />

        {/* Description */}
        <label className="block mb-2">Description</label>
        <textarea 
          name="description" 
          value={formData.description} 
          onChange={handleChange} 
          className="w-full border p-2 mb-4" 
          required 
        />

        {/* Icon Upload */}
        <label className="block mb-2">Upload Icon</label>
        <input 
          type="file" 
          onChange={handleFileChange} 
          className="mb-4" 
          required 
        />

        {/* SEO Fields */}
        <label className="block mb-2">SEO Meta Title</label>
        <input 
          type="text" 
          name="metaTitle" 
          value={formData.seo.metaTitle} 
          onChange={handleSeoChange} 
          className="w-full border p-2 mb-4" 
        />

        <label className="block mb-2">SEO Meta Description</label>
        <textarea 
          name="metaDescription" 
          value={formData.seo.metaDescription} 
          onChange={handleSeoChange} 
          className="w-full border p-2 mb-4" 
        />

        <label className="block mb-2">SEO Keywords (comma-separated)</label>
        <input 
          type="text" 
          name="metaKeywords" 
          // Convert the keywords array to a comma-separated string for display
          value={formData.seo.metaKeywords.join(", ")} 
          onChange={handleSeoChange} 
          className="w-full border p-2 mb-4" 
        />

        {/* Submit Button */}
        <button 
          type="submit" 
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Create Product
        </button>
      </form>
    </div>
  );
};

export default CreateProduct;