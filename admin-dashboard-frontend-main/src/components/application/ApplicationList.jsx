// ApplicationList.js
"use client";
import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil, Trash2 } from "lucide-react";
import { AuthContext } from "../../context/AuthContext";

export default function ApplicationList() {
    const navigate = useNavigate();
    const { authAxios } = useContext(AuthContext);
    const url = process.env.REACT_APP_API_URL;

    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchApplications();
    }, []);

    const fetchApplications = async () => {
        try {
            const response = await authAxios.get(`${url}/api/application`);
            setApplications(Array.isArray(response.data) ? response.data : []);
            setLoading(false);
        } catch (err) {
            setError(
                err.response?.data?.message || "Error fetching applications"
            );
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (
            window.confirm("Are you sure you want to delete this application?")
        ) {
            try {
                await authAxios.delete(`${url}/api/application/${id}`);
                setApplications((prev) => prev.filter((app) => app._id !== id));
            } catch (err) {
                setError(
                    err.response?.data?.message || "Error deleting application"
                );
            }
        }
    };

    if (loading) return <div className="text-center p-6">Loading...</div>;
    if (error) return <div className="text-red-700 p-6">{error}</div>;

    return (
        <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                    Applications
                </h2>
                {/* <button
                    onClick={() => navigate("/dashboard/applications/new")}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                >
                    + New Application
                </button> */}
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Position
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Applied Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Status
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                Actions
                            </th>
                        </tr>
                    </thead>

                    <tbody className="bg-white divide-y divide-gray-200">
                        {applications.length > 0 ? (
                            applications.map((application) => (
                                <tr key={application._id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">
                                            {application.personalInfo.fullName}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {application.personalInfo.email}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">
                                            {
                                                application.positionDetails
                                                    .positionApplied
                                            }
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            $
                                            {
                                                application.positionDetails
                                                    .expectedSalary
                                            }
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {new Date(
                                            application.createdAt
                                        ).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                            New
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() =>
                                                navigate(
                                                    `/dashboard/application/${application._id}`
                                                )
                                            }
                                            className="text-indigo-600 hover:text-indigo-900 mr-4"
                                        >
                                            <Pencil className="h-5 w-5" />
                                        </button>
                                        <button
                                            onClick={() =>
                                                handleDelete(application._id)
                                            }
                                            className="text-red-600 hover:text-red-900"
                                        >
                                            <Trash2 className="h-5 w-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan="5"
                                    className="text-center py-4 text-gray-500"
                                >
                                    No applications found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
