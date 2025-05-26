"use client";
import React, { useState, useEffect, useContext } from "react";
import { Trash2, Eye, Search } from "lucide-react";
import { AuthContext } from "../../context/AuthContext";

export default function LeadList() {
    const { authAxios } = useContext(AuthContext);
    const url = process.env.REACT_APP_API_URL;

    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [phoneSearch, setPhoneSearch] = useState("");

    useEffect(() => {
        fetchLeads(); // initial fetch
    }, []);

    const fetchLeads = async (phone = "") => {
    try {
        setLoading(true);
        setError(null);
        const baseUrl = "http://localhost:4000";
        const endpoint = phone ? `${url}/api/lead/${phone}` : `${url}/api/lead`;
        const response = await authAxios.get(endpoint);
        
        // Make sure the backend returns an array (or wrap in array if it's a single object)
        const leadData = Array.isArray(response.data.data)
            ? response.data.data
            : [response.data.data];

        setLeads(leadData);
        } catch (err) {
            setError(err.response?.data?.message || "Error fetching leads");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyToggle = async (id, newStatus) => {
    try {
        const baseUrl = "http://localhost:4000";
        const response = await authAxios.patch(`${url}/api/lead/${id}/verify`, {
        isVerified: newStatus,
        });
        setLeads((prevLeads) =>
        prevLeads.map((lead) =>
            lead._id === id ? { ...lead, isVerified: newStatus } : lead
        )
        );
        } catch (err) {
            setError(err.response?.data?.message || "Error updating verification status");
        }
    };



    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this lead?")) {
            try {
                const baseUrl = "http://localhost:4000";
                await authAxios.delete(`${url}/api/lead/${id}`);
                setLeads((prev) => prev.filter((lead) => lead._id !== id));
            } catch (err) {
                setError(err.response?.data?.message || "Error deleting lead");
            }
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchLeads(phoneSearch.trim());
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Leads</h2>

            {/* 🔍 Search Form */}
            <form onSubmit={handleSearch} className="mb-6 flex items-center gap-2">
                <input
                    type="text"
                    placeholder="Search by Phone Number"
                    value={phoneSearch}
                    onChange={(e) => setPhoneSearch(e.target.value)}
                    className="border border-gray-300 rounded px-4 py-2 w-full md:w-1/3"
                />
                <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-1"
                >
                    <Search className="w-4 h-4" />
                    Search
                </button>
            </form>

            {/* ⚙️ Data Table */}
            {loading ? (
                <div className="text-center p-6">Loading...</div>
            ) : error ? (
                <div className="text-red-700 p-6">{error}</div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lead ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pincode</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Gold Quality</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Gold Quantity</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Verified</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {leads.length > 0 ? (
                                leads.map((lead) => (
                                    <tr key={lead._id}>
                                        <td className="px-6 py-4 text-sm text-gray-900">{lead.leadId}</td>
                                        <td className="px-6 py-4 text-sm text-gray-900">{lead.name}</td>
                                        <td className="px-6 py-4 text-sm text-gray-900">{lead.phone}</td>
                                        <td className="px-6 py-4 text-sm text-gray-900">{lead.pincode}</td>
                                        <td className="px-6 py-4 text-sm text-gray-900">{lead.qualityOfGold || '-'}</td>
                                        <td className="px-6 py-4 text-sm text-gray-900">{lead.quantityOfGold || '-'}</td>
                                        <td className="px-6 py-4 text-sm text-gray-900">{new Date(lead.createdAt).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        <input
                                            type="checkbox"
                                            checked={lead.isVerified}
                                            onChange={() => handleVerifyToggle(lead._id, !lead.isVerified)}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                        </td>
                                        <td className="px-6 py-4 text-right text-sm font-medium">
                                            <button onClick={() => alert(JSON.stringify(lead, null, 2))} className="text-blue-600 hover:text-blue-900 mr-4" title="View">
                                                <Eye className="h-5 w-5" />
                                            </button>
                                            <button onClick={() => handleDelete(lead._id)} className="text-red-600 hover:text-red-900" title="Delete">
                                                <Trash2 className="h-5 w-5" />
                                            </button>
                                            
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="8" className="text-center py-4 text-gray-500">
                                        No leads found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
