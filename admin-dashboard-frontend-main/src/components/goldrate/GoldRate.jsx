import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Save, X } from "lucide-react";
import { AuthContext } from "../../context/AuthContext";

export default function GoldRateSettings() {
    const navigate = useNavigate();
    const { authAxios } = useContext(AuthContext);
    const url = process.env.REACT_APP_API_URL;

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [settingsExist, setSettingsExist] = useState(false);
    const [formData, setFormData] = useState({
        merchant: "",
        apiaccesstoken: "",
        basecurrency: "" , 
        rate: "",       
    });

    const [goldRateInput, setGoldRateInput] = useState("");

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const response = await authAxios.get(`${url}/api/goldrate`);
            setFormData(response.data);
            setSettingsExist(true);
        } catch (err) {
            if (err.response?.status === 404) {
                setSettingsExist(false);
            } else {
                setError(err.response?.data?.message || "Error fetching settings");
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
            if (settingsExist) {
                await authAxios.put(`${url}/api/goldrate`, formData);
            } else {
                await authAxios.post(`${url}/api/goldrate`, formData);
            }
            navigate("/dashboard/goldrate");
        } catch (err) {
            setError(err.response?.data?.message || "Error saving settings");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // const handleGetGoldRate = () => {
    //     console.log("Gold Rate Input:", goldRateInput);
        // You can add logic to fetch/display based on this input
    // };

    if (loading && !settingsExist) {
        return <div className="text-center py-10">Loading...</div>;
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <form
                onSubmit={handleSubmit}
                className="space-y-6 bg-white p-6 rounded-lg shadow-md"
            >
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold">
                        {settingsExist ? "Update Gold Rate Settings" : "Create Gold Rate Settings"}
                    </h2>
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
                    {/* Merchant Selection */}
                    <div className="flex flex-col">
                        <label className="mb-1 font-medium text-gray-700">Select Gold Rate Merchant</label>
                        <select
                            name="merchant"
                            value={formData.merchant}
                            onChange={handleChange}
                            className="border p-2 rounded-md"
                        >
                            <option value="">-- Select Merchant --</option>
                            <option value="metal">Metal</option>
                            <option value="goldapi.io">Gold API.IO</option>
                        </select>
                    </div>

                    {/* API Access Token */}
                    <div className="flex flex-col">
                        <label className="mb-1 font-medium text-gray-700">API Access Token</label>
                        <input
                            type="text"
                            name="apiaccesstoken"
                            value={formData.apiaccesstoken}
                            onChange={handleChange}
                            className="w-full border p-2 rounded-md"
                            placeholder="Enter API Access Token"
                        />
                    </div>

                    {/* Base Currency */}
                    <div className="flex flex-col">
                        <label className="mb-1 font-medium text-gray-700">Select Base Currency</label>
                        <select
                            name="basecurrency"
                            value={formData.basecurrency}
                            onChange={handleChange}
                            className="border p-2 rounded-md"
                        >
                            <option value="">-- Select Base Currency --</option>
                            <option value="INR">INR</option>
                            <option value="USD">USD</option>
                        </select>
                    </div>                                        
                </div>

                {/* Gold Rate Input and Button */}
                <div className="mt-6">
                    <label className="block mb-2 font-medium text-gray-700">Gold Rate Input</label>
                    <input
                        type="number"
                        name="rate"
                        value={formData.rate}
                        onChange={handleChange}
                        className="w-full border p-2 rounded-md mb-4"
                        placeholder="Enter value to get gold rate"
                        disabled
                    />
                    <button
                        type="button"                        
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                        Refresh Rate
                    </button>
                </div>
            </form>

            <div className="bg-gray-50 p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold mb-4">Current Configuration</h3>
                <ul className="space-y-2">
                    <li><strong>Merchant:</strong> {formData.merchant || "Not Set"}</li>
                    <li><strong>API Token:</strong> {formData.apiaccesstoken ? "*****" : "Not Set"}</li>
                    <li><strong>Base Currency:</strong> {formData.basecurrency || "Not Set"}</li>                    
                </ul>
            </div>
        </div>
    );
}