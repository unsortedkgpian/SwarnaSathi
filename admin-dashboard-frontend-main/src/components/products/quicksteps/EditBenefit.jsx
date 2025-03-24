import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

const EditBenefit = () => {
  const { id, benefitId } = useParams();
  const url = process.env.REACT_APP_API_URL;
  const [formData, setFormData] = useState(null);

  useEffect(() => {
    axios.get(url  + `/api/products/benefits/${benefitId}`).then((response) => {
      setFormData(response.data.benefit);
    }).catch(() => {
      alert("Error fetching Benefit details");
    });
  }, [benefitId]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(url  + `/api/products/benefits/${benefitId}`, formData);
      alert("Benefit Updated Successfully");
      window.location.href = `/dashboard/products/${id}`;
    } catch (err) {
      alert("Error updating Benefit");
    }
  };

  if (!formData) return <div className="text-center">Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Edit Benefit</h1>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow">
        
        <label className="block mb-2">Title</label>
        <input type="text" name="title" value={formData.title} onChange={handleChange} className="w-full border p-2 mb-4" required />

        <label className="block mb-2">Description</label>
        <textarea name="description" value={formData.description} onChange={handleChange} className="w-full border p-2 mb-4" required />

        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Update Benefit</button>
      </form>
    </div>
  );
};

export default EditBenefit;