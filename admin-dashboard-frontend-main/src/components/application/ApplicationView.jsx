"use client";
import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Download } from "lucide-react";
import { AuthContext } from "../../context/AuthContext";

export default function ApplicationView() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { authAxios } = useContext(AuthContext);
    const url = process.env.REACT_APP_API_URL;

    const [application, setApplication] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchApplication();
    }, [id]);

    const fetchApplication = async () => {
        try {
            const response = await authAxios.get(`${url}/api/application/${id}`);
            setApplication(response.data);
            setLoading(false);
        } catch (err) {
            setError(err.response?.data?.message || "Error fetching application");
            setLoading(false);
        }
    };

    const handleViewResume = () => {
        if (application?.resume?.path) {
            // Directly use the file path from backend
            const resumeUrl = `${url}/${application.resume.path}`;
            window.open(resumeUrl, '_blank');
        } else {
            alert('Resume not found');
        }
    };

    if (loading) return <div className="text-center p-6">Loading...</div>;
    if (error) return <div className="text-red-700 p-6">{error}</div>;
    if (!application) return <div className="text-center p-6">Application not found</div>;

    return (
        <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center mb-6">
                <button
                    onClick={() => navigate("/dashboard/application")}
                    className="mr-4 text-gray-600 hover:text-gray-900"
                >
                    <ArrowLeft className="h-6 w-6" />
                </button>
                <h2 className="text-2xl font-bold text-gray-900">Application Details</h2>
            </div>

            <div className="space-y-8">
                {/* Personal Information */}
                <section>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-gray-500">Full Name</p>
                            <p className="text-base">{application.personalInfo.fullName}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Date of Birth</p>
                            <p className="text-base">{new Date(application.personalInfo.dob).toLocaleDateString()}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Email</p>
                            <p className="text-base">{application.personalInfo.email}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Phone</p>
                            <p className="text-base">{application.personalInfo.phone}</p>
                        </div>
                        <div className="col-span-2">
                            <p className="text-sm text-gray-500">Current Address</p>
                            <p className="text-base">{application.personalInfo.currentAddress}</p>
                        </div>
                        {application.personalInfo.permanentAddress && (
                            <div className="col-span-2">
                                <p className="text-sm text-gray-500">Permanent Address</p>
                                <p className="text-base">{application.personalInfo.permanentAddress}</p>
                            </div>
                        )}
                    </div>
                </section>

                {/* Position Details */}
                <section>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Position Details</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-gray-500">Position Applied</p>
                            <p className="text-base">{application.positionDetails.positionApplied}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Expected Salary</p>
                            <p className="text-base">${application.positionDetails.expectedSalary}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Available Joining Date</p>
                            <p className="text-base">{new Date(application.positionDetails.availableJoiningDate).toLocaleDateString()}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Preferred Location</p>
                            <p className="text-base">{application.positionDetails.preferredLocation || 'Not specified'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Willing to Relocate</p>
                            <p className="text-base">{application.positionDetails.willingToRelocate ? 'Yes' : 'No'}</p>
                        </div>
                    </div>
                </section>

                {/* Educational Background */}
                <section>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Educational Background</h3>
                    <div className="space-y-4">
                        {application.educationalBackground.map((edu, index) => (
                            <div key={index} className="border p-4 rounded-lg">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-500">Qualification</p>
                                        <p className="text-base">{edu.qualification}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Institution</p>
                                        <p className="text-base">{edu.institution}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Year of Passing</p>
                                        <p className="text-base">{edu.yearPassing}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Percentage/CGPA</p>
                                        <p className="text-base">{edu.percentage}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Work Experience */}
                <section>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Work Experience</h3>
                    <div className="space-y-4">
                        {application.workExperience.map((exp, index) => (
                            <div key={index} className="border p-4 rounded-lg">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-500">Organization</p>
                                        <p className="text-base">{exp.organization}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Job Title</p>
                                        <p className="text-base">{exp.jobTitle}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Duration</p>
                                        <p className="text-base">
                                            {new Date(exp.duration.from).toLocaleDateString()} - 
                                            {exp.duration.to ? new Date(exp.duration.to).toLocaleDateString() : 'Present'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Reason for Leaving</p>
                                        <p className="text-base">{exp.reasonLeaving}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <p className="text-sm text-gray-500">Responsibilities</p>
                                        <ul className="list-disc list-inside">
                                            {exp.responsibilities.map((resp, idx) => (
                                                <li key={idx} className="text-base">{resp}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Skills */}
                <section>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Skills</h3>
                    <div className="flex flex-wrap gap-2">
                        {application.skills.map((skill, index) => (
                            <span key={index} className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                                {skill}
                            </span>
                        ))}
                    </div>
                </section>

                {/* References */}
                <section>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">References</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {application.references.map((ref, index) => (
                            <div key={index} className="border p-4 rounded-lg">
                                <div className="space-y-2">
                                    <div>
                                        <p className="text-sm text-gray-500">Name</p>
                                        <p className="text-base">{ref.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Contact</p>
                                        <p className="text-base">{ref.contact}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Relation</p>
                                        <p className="text-base">{ref.relation}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Resume */}
                {application.resume && (
                    <section>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Resume</h3>
                        <div className="flex items-center space-x-4">
                            <div className="flex-1">
                                <p className="text-sm text-gray-500">File Name</p>
                                <p className="text-base">{application.resume.originalName}</p>
                            </div>
                            <div className="flex-1">
                                <p className="text-sm text-gray-500">File Size</p>
                                <p className="text-base">{Math.round(application.resume.size / 1024)} KB</p>
                            </div>
                            {application.resume.mimeType && (
                                <div className="flex-1">
                                    <p className="text-sm text-gray-500">File Type</p>
                                    <p className="text-base">{application.resume.mimeType}</p>
                                </div>
                            )}
                            <button
                                onClick={handleViewResume}
                                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                            >
                                <Download className="h-4 w-4 mr-2" />
                                View Resume
                            </button>
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
} 