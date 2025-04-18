import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Save, X, Phone, Mail, MapPin, Globe, Plus } from "lucide-react";
import { AuthContext } from "../../context/AuthContext";

export default function SocialMedia() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { authAxios } = useContext(AuthContext);
    const url = process.env.REACT_APP_API_URL;

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [socialMediaExists, setSocialMediaExists] = useState(false);
    const [formData, setFormData] = useState({
        // phone: "",
        // telephone: "",
        // email: "",
        // address: "",
        facebook: "",
        twitter: "",
        linkedin: "",
        instagram: "",
    });

    useEffect(() => {
        fetchSocialMediaDetails();
    }, []);

    const fetchSocialMediaDetails = async () => {
        try {
            setLoading(true);
            const response = await authAxios.get(`${url}/api/social`);
            setFormData(response.data);
            setSocialMediaExists(true);
        } catch (err) {
            if (err.response?.status === 404) {
                // No social media entry exists yet
                setSocialMediaExists(false);
            } else {
                setError(
                    err.response?.data?.message || "Error fetching social media details"
                );
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            // Use PUT to update existing record
            await authAxios.put(`${url}/api/social`, formData);
            navigate("/dashboard/social-link");
        } catch (err) {
            setError(
                err.response?.data?.message || "Error updating social media links"
            );
        } finally {
            setLoading(false);
        }
    };

    const createSocialMedia = async () => {
        setError(null);
        setLoading(true);

        try {
            // Use POST to create a new record
            await authAxios.post(`${url}/api/social`, formData);
            setSocialMediaExists(true);
            navigate("/dashboard/social-link");
        } catch (err) {
            setError(
                err.response?.data?.message || "Error creating social media links"
            );
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    if (loading && !socialMediaExists) {
        return <div className="text-center py-10">Loading...</div>;
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="space-y-6 bg-white p-6 rounded-lg shadow-md max-w-lg mx-auto"
        >
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">
                    {socialMediaExists 
                        ? "Update Social Media Links" 
                        : "Create Social Media Links"}
                </h2>
                <div className="flex space-x-4">
                    <button
                        type="button"
                        onClick={() => navigate("/dashboard")}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                        <X className="h-5 w-5 mr-2 inline" /> Cancel
                    </button>
                    {socialMediaExists ? (
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                        >
                            <Save className="h-5 w-5 mr-2 inline" />
                            {loading ? "Saving..." : "Save"}
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={createSocialMedia}
                            disabled={loading}
                            className="px-4 py-2 rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
                        >
                            <Plus className="h-5 w-5 mr-2 inline" />
                            {loading ? "Creating..." : "Create"}
                        </button>
                    )}
                </div>
            </div>

            {error && (
                <div className="text-red-600 bg-red-100 p-3 rounded">
                    {error}
                </div>
            )}

            <div className="grid gap-4">
                {/* Social Media Links */}
                <div className="flex items-center gap-2">
                    <Globe className="text-blue-500" />
                    <input
                        type="url"
                        name="facebook"
                        value={formData.facebook}
                        onChange={handleChange}
                        className="w-full border p-2 rounded-md"
                        placeholder="Facebook URL"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Globe className="text-blue-500" />
                    <input
                        type="url"
                        name="twitter"
                        value={formData.twitter}
                        onChange={handleChange}
                        className="w-full border p-2 rounded-md"
                        placeholder="Twitter/X URL"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Globe className="text-blue-500" />
                    <input
                        type="url"
                        name="linkedin"
                        value={formData.linkedin}
                        onChange={handleChange}
                        className="w-full border p-2 rounded-md"
                        placeholder="LinkedIn URL"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Globe className="text-blue-500" />
                    <input
                        type="url"
                        name="instagram"
                        value={formData.instagram}
                        onChange={handleChange}
                        className="w-full border p-2 rounded-md"
                        placeholder="Instagram URL"
                    />
                </div>
            </div>
        </form>
    );
}