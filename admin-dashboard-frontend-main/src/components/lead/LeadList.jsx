"use client";
import React, { useState, useEffect, useContext } from "react";
import { Trash2, Eye } from "lucide-react";
import { AuthContext } from "../../context/AuthContext";

export default function LeadList() {
    const { authAxios } = useContext(AuthContext);
    const url = process.env.REACT_APP_API_URL;

    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchLeads();
    }, []);

    const fetchLeads = async () => {
        try {
            let los_url = 'http://localhost:4000'
            const response = await authAxios.get(`${los_url}/api/lead`);
            console.log(response);
            setLeads(Array.isArray(response.data.data) ? response.data.data : []);
            setLoading(false);
        } catch (err) {
            setError(
                err.response?.data?.message || "Error fetching leads"
            );
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this lead?")) {
            try {
                await authAxios.delete(`${url}/api/lead/${id}`);
                setLeads((prev) => prev.filter((lead) => lead._id !== id));
            } catch (err) {
                setError(
                    err.response?.data?.message || "Error deleting lead"
                );
            }
        }
    };

    if (loading) return <div className="text-center p-6">Loading...</div>;
    if (error) return <div className="text-red-700 p-6">{error}</div>;

    return (
        <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Leads</h2>

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
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>

                    <tbody className="bg-white divide-y divide-gray-200">
                        {leads.length > 0 ? (
                            leads.map((lead) => (
                                <tr key={lead._id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{lead.leadId}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{lead.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{lead.phone}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{lead.pincode}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{lead.qualityOfGold || '-'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{lead.quantityOfGold || '-'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {new Date(lead.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => alert(JSON.stringify(lead, null, 2))}
                                            className="text-blue-600 hover:text-blue-900 mr-4"
                                            title="View Details"
                                        >
                                            <Eye className="h-5 w-5" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(lead._id)}
                                            className="text-red-600 hover:text-red-900"
                                            title="Delete"
                                        >
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
        </div>
    );
}
