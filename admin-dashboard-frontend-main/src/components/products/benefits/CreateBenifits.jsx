import React, { useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

const CreateBenefit = () => {
  const { id } = useParams();
  const url = process.env.REACT_APP_API_URL;
  const [formData, setFormData] = useState({
    title: "",
    description: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(url  + `/api/products/benefits`, { ...formData, productId: id });
      alert("Benefit Created Successfully");
      window.location.href = `/dashboard/products/${id}`;
    } catch (err) {
      alert("Error creating Benefit");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Create Benefit</h1>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow">
        
        <label className="block mb-2">Title</label>
        <input type="text" name="title" value={formData.title} onChange={handleChange} className="w-full border p-2 mb-4" required />

        <label className="block mb-2">Description</label>
        <textarea name="description" value={formData.description} onChange={handleChange} className="w-full border p-2 mb-4" required />

        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Create Benefit</button>
      </form>
    </div>
  );
};

export default CreateBenefit;