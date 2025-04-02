import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Save, X, Phone, Mail, MapPin } from "lucide-react";
import { AuthContext } from "../../context/AuthContext";

export default function ContactUs() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { authAxios } = useContext(AuthContext);
    const url = process.env.REACT_APP_API_URL;

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        phone: "",
        telephone:"",
        email: "",
        address: "",
    });

    useEffect(() => {
        fetchContactDetails();
    }, []);

    const fetchContactDetails = async () => {
        try {
            const response = await authAxios.get(`${url}/api/contact-us`);
            setFormData(response.data);
        } catch (err) {
            setError(
                err.response?.data?.message || "Error fetching contact details"
            );
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            await authAxios.put(`${url}/api/contact-us`, formData);
            navigate("/dashboard/contact-us");
        } catch (err) {
            setError(
                err.response?.data?.message || "Error updating contact details"
            );
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="space-y-6 bg-white p-6 rounded-lg shadow-md max-w-lg mx-auto"
        >
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Update Contact Details</h2>
                <div className="flex space-x-4">
                    <button
                        type="button"
                        onClick={() => navigate("/dashboard")}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                        <X className="h-5 w-5 mr-2 inline" />
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                    >
                        <Save className="h-5 w-5 mr-2 inline" />
                        {loading ? "Saving..." : "Save"}
                    </button>
                </div>
            </div>

            {error && (
                <div className="text-red-600 bg-red-100 p-3 rounded">
                    {error}
                </div>
            )}

            <div className="grid gap-4">
                {/* Contact Number */}
                <div className="flex items-center gap-2">
                    <Phone className="text-blue-500" />
                    <input
                        type="text"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full border p-2 rounded-md"
                        placeholder="Enter contact number"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <Phone className="text-blue-500" />
                    <input
                        type="text"
                        name="telephone"
                        value={formData.telephone}
                        onChange={handleChange}
                        className="w-full border p-2 rounded-md"
                        placeholder="Enter contact number"
                    />
                </div>

                {/* Email */}
                <div className="flex items-center gap-2">
                    <Mail className="text-blue-500" />
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full border p-2 rounded-md"
                        placeholder="Enter email address"
                    />
                </div>

                {/* Address */}
                <div className="flex items-center gap-2">
                    <MapPin className="text-blue-500" />
                    <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        className="w-full border p-2 rounded-md"
                        rows={2}
                        placeholder="Enter address"
                    />
                </div>
            </div>
        </form>
    );
}
