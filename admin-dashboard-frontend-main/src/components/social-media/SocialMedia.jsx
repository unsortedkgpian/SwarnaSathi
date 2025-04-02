// import React, { useState, useEffect, useContext } from "react";
// import { useNavigate, useParams } from "react-router-dom";
// import {
//     Save,
//     X,
//     Phone,
//     Mail,
//     MapPin,
//     Facebook,
//     Twitter,
//     Linkedin,
//     Instagram,
// } from "lucide-react";
// import { AuthContext } from "../../context/AuthContext";

// export default function ContactUs() {
//     const { id } = useParams();
//     const navigate = useNavigate();
//     const { authAxios } = useContext(AuthContext);
//     const url = process.env.REACT_APP_API_URL;

//     const [loading, setLoading] = useState(false);
//     const [error, setError] = useState(null);
//     const [formData, setFormData] = useState({
//         phone: "",
//         telephone: "",
//         email: "",
//         address: "",
//         facebook: "",
//         twitter: "",
//         linkedin: "",
//         instagram: "",
//     });

//     // ... (keep existing useEffect and fetchContactDetails the same)

//     // ... (keep handleSubmit and handleChange the same)

//     return (
//         <form
//             onSubmit={handleSubmit}
//             className="space-y-6 bg-white p-6 rounded-lg shadow-md max-w-lg mx-auto"
//         >
//             {/* ... (keep existing header and buttons the same) */}

//             <div className="grid gap-4">
//                 {/* ... (keep existing contact fields the same) */}

//                 {/* Social Media Links */}
//                 <div className="flex items-center gap-2">
//                     <Facebook className="text-blue-500" />
//                     <input
//                         type="url"
//                         name="facebook"
//                         value={formData.facebook}
//                         onChange={handleChange}
//                         className="w-full border p-2 rounded-md"
//                         placeholder="Enter Facebook URL"
//                     />
//                 </div>

//                 <div className="flex items-center gap-2">
//                     <Twitter className="text-blue-500" />
//                     <input
//                         type="url"
//                         name="twitter"
//                         value={formData.twitter}
//                         onChange={handleChange}
//                         className="w-full border p-2 rounded-md"
//                         placeholder="Enter Twitter/X URL"
//                     />
//                 </div>

//                 <div className="flex items-center gap-2">
//                     <Linkedin className="text-blue-500" />
//                     <input
//                         type="url"
//                         name="linkedin"
//                         value={formData.linkedin}
//                         onChange={handleChange}
//                         className="w-full border p-2 rounded-md"
//                         placeholder="Enter LinkedIn URL"
//                     />
//                 </div>

//                 <div className="flex items-center gap-2">
//                     <Instagram className="text-blue-500" />
//                     <input
//                         type="url"
//                         name="instagram"
//                         value={formData.instagram}
//                         onChange={handleChange}
//                         className="w-full border p-2 rounded-md"
//                         placeholder="Enter Instagram URL"
//                     />
//                 </div>
//             </div>
//         </form>
//     );
// }
import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Save, X, Phone, Mail, MapPin, Globe } from "lucide-react";
import { AuthContext } from "../../context/AuthContext";

export default function SocialMedia() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { authAxios } = useContext(AuthContext);
    const url = process.env.REACT_APP_API_URL;

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
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
        fetchContactDetails();
    }, []);

    const fetchContactDetails = async () => {
        try {
            const response = await authAxios.get(`${url}/api/social`);
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
            await authAxios.post(`${url}/api/social`, formData);
            navigate("/dashboard/social-link");
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
                        <X className="h-5 w-5 mr-2 inline" /> Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                    >
                        <Save className="h-5 w-5 mr-2 inline" />{" "}
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