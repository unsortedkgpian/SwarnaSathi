import React, { useState,useContext } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { AuthContext } from "../../../context/AuthContext";

const CreateQuickStep = () => {
  const { id } = useParams();
  const { authAxios } = useContext(AuthContext);
  const url = process.env.REACT_APP_API_URL;
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    image: null,
    steps: [{ icon: null, title: "", description: "" }],
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, image: e.target.files[0] });
};

  const handleStepChange = (index, key, value) => {
    const updatedSteps = [...formData.steps];

    if (key === "icon") {
        updatedSteps[index][key] = value.target.files[0]; // Ensure file is stored as a `File` object
    } else {
        updatedSteps[index][key] = value;
    }

    setFormData({ ...formData, steps: updatedSteps });
};

  const addStep = () => {
    setFormData({ ...formData, steps: [...formData.steps, { icon: null, title: "", description: "" }] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const quickStepData = new FormData();
    quickStepData.append("title", formData.title);
    quickStepData.append("subtitle", formData.subtitle);
    quickStepData.append("image", formData.image);

    // Debugging - Log FormData values
    console.log("FormData before sending:");
    for (let pair of quickStepData.entries()) {
        console.log(pair[0], pair[1]);
    }

    quickStepData.append("steps", JSON.stringify(formData.steps)); 

    try {
        await authAxios.post(url  + `/api/products/quicksteps`, quickStepData, {
            headers: { "Content-Type": "multipart/form-data" },
        });

        alert("QuickStep Created Successfully");
        window.location.href = `/dashboard/products/${id}`;
    } catch (err) {
        console.error("API Error:", err.response?.data);
        alert("Error creating QuickStep");
    }
};
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Create QuickStep</h1>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow">
        
        <label className="block mb-2">Title</label>
        <input type="text" name="title" value={formData.title} onChange={handleChange} className="w-full border p-2 mb-4" required />

        <label className="block mb-2">Subtitle</label>
        <input type="text" name="subtitle" value={formData.subtitle} onChange={handleChange} className="w-full border p-2 mb-4" required />

        <label className="block mb-2">Upload Image</label>
        <input type="file" onChange={handleFileChange} className="mb-4" required />

        <h2 className="text-xl font-semibold mt-6">Steps</h2>
        {formData.steps.map((step, index) => (
          <div key={index} className="mb-4 p-2 border rounded">
            <label className="block mb-2">Step Title</label>
            <input type="text" value={step.title} onChange={(e) => handleStepChange(index, "title", e.target.value)} className="w-full border p-2 mb-2" required />

            <label className="block mb-2">Step Description</label>
            <textarea value={step.description} onChange={(e) => handleStepChange(index, "description", e.target.value)} className="w-full border p-2 mb-2" required />

            <label className="block mb-2">Upload Icon</label>
            <input type="file" onChange={(e) => handleStepChange(index, "icon", e.target.files[0])} className="mb-2" />
          </div>
        ))}

        <button type="button" onClick={addStep} className="bg-gray-500 text-white px-4 py-2 rounded mt-2">Add Step</button>

        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded mt-4">Create QuickStep</button>
      </form>
    </div>
  );
};

export default CreateQuickStep;