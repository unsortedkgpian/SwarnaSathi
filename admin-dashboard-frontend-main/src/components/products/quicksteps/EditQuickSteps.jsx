import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

const EditQuickStep = () => {
  const { id, quickStepId } = useParams();
  const url = process.env.REACT_APP_API_URL;
  const [formData, setFormData] = useState(null);

  useEffect(() => {
    axios.get(url  + `/api/products/quicksteps/${quickStepId}`).then((response) => {
      setFormData(response.data.quickStep);
    }).catch(() => {
      alert("Error fetching QuickStep details");
    });
  }, [quickStepId]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(url  + `/api/products/quicksteps/${quickStepId}`, formData);
      alert("QuickStep Updated Successfully");
      window.location.href = `/dashboard/products/${id}`;
    } catch (err) {
      alert("Error updating QuickStep");
    }
  };

  if (!formData) return <div className="text-center">Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Edit QuickStep</h1>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow">
        
        <label className="block mb-2">Title</label>
        <input type="text" name="title" value={formData.title} onChange={handleChange} className="w-full border p-2 mb-4" required />

        <label className="block mb-2">Subtitle</label>
        <input type="text" name="subtitle" value={formData.subtitle} onChange={handleChange} className="w-full border p-2 mb-4" required />

        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Update QuickStep</button>
      </form>
    </div>
  );
};

export default EditQuickStep;