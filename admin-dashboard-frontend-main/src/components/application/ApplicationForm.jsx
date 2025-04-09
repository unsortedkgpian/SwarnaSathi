// ApplicationForm.js
"use client";
import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Save, X } from "lucide-react";
import { AuthContext } from "../../context/AuthContext";

export default function ApplicationForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { authAxios } = useContext(AuthContext);
    const url = process.env.REACT_APP_API_URL;

    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [formData, setFormData] = useState({
        personalInfo: {
            fullName: "",
            dob: "",
            email: "",
            phone: "",
            currentAddress: "",
            permanentAddress: "",
        },
        positionDetails: {
            positionApplied: "",
            expectedSalary: "",
            availableJoiningDate: "",
            preferredLocation: "",
            willingToRelocate: false,
        },
        educationalBackground: [
            {
                qualification: "",
                institution: "",
                yearPassing: "",
                percentage: "",
            },
        ],
        workExperience: [
            {
                organization: "",
                jobTitle: "",
                duration: { from: "", to: "" },
                responsibilities: [""],
                reasonLeaving: "",
            },
        ],
        skills: [""],
        references: [
            {
                name: "",
                contact: "",
                relation: "",
            },
        ],
    });
    const [resumeFile, setResumeFile] = useState(null);
    const [resumePreview, setResumePreview] = useState(null);

    useEffect(() => {
        if (id) {
            fetchApplication();
        }
    }, [id]);

    const fetchApplication = async () => {
        try {
            const response = await authAxios.get(
                `${url}/api/application/${id}`
            );
            setFormData(response.data);
            if (response.data.resume) {
                setResumePreview(`${url}/${response.data.resume}`);
            }
        } catch (err) {
            setErrors({ general: "Error fetching application" });
        }
    };

    const validateField = (name, value) => {
        let error = "";
        switch (name) {
            case "personalInfo.fullName":
                if (!value.trim()) error = "Full name is required";
                break;
            case "personalInfo.email":
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
                    error = "Invalid email";
                break;
            case "personalInfo.phone":
                if (!/^\d{10}$/.test(value)) error = "Invalid phone number";
                break;
            case "positionDetails.positionApplied":
                if (!value.trim()) error = "Position is required";
                break;
            case "positionDetails.expectedSalary":
                if (isNaN(value) || value < 0) error = "Invalid salary";
                break;
            case "educationalBackground":
                if (value.some((edu) => !edu.qualification.trim()))
                    error = "All education entries require qualification";
                break;
            case "workExperience":
                if (value.some((exp) => !exp.organization.trim()))
                    error = "All experiences require organization";
                break;
            case "skills":
                if (value.length === 0) error = "At least one skill required";
                break;
        }
        return error;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = {};

        // Validate all fields
        Object.entries(formData).forEach(([section, data]) => {
            if (Array.isArray(data)) {
                const error = validateField(section, data);
                if (error) newErrors[section] = error;
            } else if (typeof data === "object") {
                Object.entries(data).forEach(([field, value]) => {
                    const error = validateField(`${section}.${field}`, value);
                    if (error) newErrors[`${section}.${field}`] = error;
                });
            }
        });

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setLoading(true);
        try {
            const formPayload = new FormData();
            formPayload.append("data", JSON.stringify(formData));
            if (resumeFile) formPayload.append("resume", resumeFile);

            if (id) {
                await authAxios.put(
                    `${url}/api/application/${id}`,
                    formPayload
                );
            } else {
                await authAxios.post(`${url}/api/application`, formPayload);
            }
            navigate("/dashboard/application");
        } catch (err) {
            setErrors({
                general: err.response?.data?.message || "Submission failed",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (path, value) => {
        setFormData((prev) => {
            const keys = path.split(".");
            const updated = JSON.parse(JSON.stringify(prev));
            let current = updated;

            for (let i = 0; i < keys.length - 1; i++) {
                current = current[keys[i]];
            }

            current[keys[keys.length - 1]] = value;
            return updated;
        });

        // Clear error when changing
        setErrors((prev) => ({ ...prev, [path]: undefined }));
    };

    const handleArrayChange = (arrayName, index, fieldPath, value) => {
        setFormData((prev) => {
            const newArray = prev[arrayName].map((item, i) => {
                if (i === index) {
                    const keys = fieldPath.split(".");
                    const updatedItem = { ...item };
                    let current = updatedItem;

                    for (let j = 0; j < keys.length - 1; j++) {
                        current = current[keys[j]] = { ...current[keys[j]] };
                    }

                    current[keys[keys.length - 1]] = value;
                    return updatedItem;
                }
                return item;
            });
            return { ...prev, [arrayName]: newArray };
        });
    };

    const addArrayItem = (arrayName, initialItem) => {
        setFormData((prev) => ({
            ...prev,
            [arrayName]: [...prev[arrayName], initialItem],
        }));
    };

    const removeArrayItem = (arrayName, index) => {
        setFormData((prev) => ({
            ...prev,
            [arrayName]: prev[arrayName].filter((_, i) => i !== index),
        }));
    };

    const renderField = (label, name, value, type = "text", options = {}) => {
        const error = errors[name];
        return (
            <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                    {label}
                </label>
                {type === "checkbox" ? (
                    <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => handleChange(name, e.target.checked)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                ) : type === "date" ? (
                    <input
                        type="date"
                        value={value}
                        onChange={(e) => handleChange(name, e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        {...options}
                    />
                ) : type === "textarea" ? (
                    <textarea
                        value={value}
                        onChange={(e) => handleChange(name, e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        {...options}
                    />
                ) : (
                    <input
                        type={type}
                        value={value}
                        onChange={(e) => handleChange(name, e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        {...options}
                    />
                )}
                {error && <p className="text-sm text-red-500">{error}</p>}
            </div>
        );
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="space-y-6 bg-white p-6 rounded-lg shadow"
        >
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">
                    {id ? "Edit Application" : "New Application"}
                </h2>
                <div className="flex space-x-4">
                    <button
                        type="button"
                        onClick={() => navigate("/dashboard/application")}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                        <X className="h-5 w-5 mr-2" />
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                    >
                        <Save className="h-5 w-5 mr-2" />
                        {loading ? "Saving..." : "Save"}
                    </button>
                </div>
            </div>

            {errors.general && (
                <div className="rounded-md bg-red-50 p-4">
                    <p className="text-sm text-red-700">{errors.general}</p>
                </div>
            )}

            {/* Personal Information */}
            <div className="border-t pt-6">
                <h3 className="text-lg font-medium mb-4">
                    Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {renderField(
                        "Full Name",
                        "personalInfo.fullName",
                        formData.personalInfo.fullName,
                        "text",
                        { required: true }
                    )}
                    {renderField(
                        "Date of Birth",
                        "personalInfo.dob",
                        formData.personalInfo.dob,
                        "date"
                    )}
                    {renderField(
                        "Email",
                        "personalInfo.email",
                        formData.personalInfo.email,
                        "email"
                    )}
                    {renderField(
                        "Phone",
                        "personalInfo.phone",
                        formData.personalInfo.phone,
                        "tel"
                    )}
                    {renderField(
                        "Current Address",
                        "personalInfo.currentAddress",
                        formData.personalInfo.currentAddress,
                        "textarea"
                    )}
                    {renderField(
                        "Permanent Address",
                        "personalInfo.permanentAddress",
                        formData.personalInfo.permanentAddress,
                        "textarea"
                    )}
                </div>
            </div>

            {/* Position Details */}
            <div className="border-t pt-6">
                <h3 className="text-lg font-medium mb-4">Position Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {renderField(
                        "Position Applied",
                        "positionDetails.positionApplied",
                        formData.positionDetails.positionApplied,
                        "text",
                        { required: true }
                    )}
                    {renderField(
                        "Expected Salary",
                        "positionDetails.expectedSalary",
                        formData.positionDetails.expectedSalary,
                        "number"
                    )}
                    {renderField(
                        "Available Joining Date",
                        "positionDetails.availableJoiningDate",
                        formData.positionDetails.availableJoiningDate,
                        "date"
                    )}
                    {renderField(
                        "Preferred Location",
                        "positionDetails.preferredLocation",
                        formData.positionDetails.preferredLocation,
                        "text"
                    )}
                    {renderField(
                        "Willing to Relocate",
                        "positionDetails.willingToRelocate",
                        formData.positionDetails.willingToRelocate,
                        "checkbox"
                    )}
                </div>
            </div>

            {/* Education */}
            <div className="border-t pt-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">
                        Educational Background
                    </h3>
                    <button
                        type="button"
                        onClick={() =>
                            addArrayItem("educationalBackground", {
                                qualification: "",
                                institution: "",
                                yearPassing: "",
                                percentage: "",
                            })
                        }
                        className="text-indigo-600 hover:text-indigo-900 text-sm"
                    >
                        + Add Education
                    </button>
                </div>
                {formData.educationalBackground.map((edu, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg mb-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {renderField(
                                "Qualification",
                                `educationalBackground[${index}].qualification`,
                                edu.qualification,
                                "text"
                            )}
                            {renderField(
                                "Institution",
                                `educationalBackground[${index}].institution`,
                                edu.institution,
                                "text"
                            )}
                            {renderField(
                                "Year Passing",
                                `educationalBackground[${index}].yearPassing`,
                                edu.yearPassing,
                                "number"
                            )}
                            {renderField(
                                "Percentage",
                                `educationalBackground[${index}].percentage`,
                                edu.percentage,
                                "number"
                            )}
                        </div>
                        <button
                            type="button"
                            onClick={() =>
                                removeArrayItem("educationalBackground", index)
                            }
                            className="mt-2 text-red-600 hover:text-red-900 text-sm"
                        >
                            Remove
                        </button>
                    </div>
                ))}
            </div>

            {/* Work Experience */}
            <div className="border-t pt-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">Work Experience</h3>
                    <button
                        type="button"
                        onClick={() =>
                            addArrayItem("workExperience", {
                                organization: "",
                                jobTitle: "",
                                duration: { from: "", to: "" },
                                responsibilities: [""],
                                reasonLeaving: "",
                            })
                        }
                        className="text-indigo-600 hover:text-indigo-900 text-sm"
                    >
                        + Add Experience
                    </button>
                </div>
                {formData.workExperience.map((exp, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg mb-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {renderField(
                                "Organization",
                                `workExperience[${index}].organization`,
                                exp.organization,
                                "text"
                            )}
                            {renderField(
                                "Job Title",
                                `workExperience[${index}].jobTitle`,
                                exp.jobTitle,
                                "text"
                            )}
                            {renderField(
                                "From Date",
                                `workExperience[${index}].duration.from`,
                                exp.duration.from,
                                "date"
                            )}
                            {renderField(
                                "To Date",
                                `workExperience[${index}].duration.to`,
                                exp.duration.to,
                                "date"
                            )}
                            {renderField(
                                "Responsibilities",
                                `workExperience[${index}].responsibilities`,
                                exp.responsibilities.join("\n"),
                                "textarea"
                            )}
                            {renderField(
                                "Reason Leaving",
                                `workExperience[${index}].reasonLeaving`,
                                exp.reasonLeaving,
                                "text"
                            )}
                        </div>
                        <button
                            type="button"
                            onClick={() =>
                                removeArrayItem("workExperience", index)
                            }
                            className="mt-2 text-red-600 hover:text-red-900 text-sm"
                        >
                            Remove
                        </button>
                    </div>
                ))}
            </div>

            {/* Skills */}
            <div className="border-t pt-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">Skills</h3>
                    <button
                        type="button"
                        onClick={() => addArrayItem("skills", "")}
                        className="text-indigo-600 hover:text-indigo-900 text-sm"
                    >
                        + Add Skill
                    </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {formData.skills.map((skill, index) => (
                        <div key={index} className="flex items-center gap-2">
                            <input
                                type="text"
                                value={skill}
                                onChange={(e) =>
                                    handleArrayChange(
                                        "skills",
                                        index,
                                        "",
                                        e.target.value
                                    )
                                }
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            />
                            <button
                                type="button"
                                onClick={() => removeArrayItem("skills", index)}
                                className="text-red-600 hover:text-red-900"
                            >
                                ×
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* References */}
            <div className="border-t pt-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">References</h3>
                    <button
                        type="button"
                        onClick={() =>
                            addArrayItem("references", {
                                name: "",
                                contact: "",
                                relation: "",
                            })
                        }
                        className="text-indigo-600 hover:text-indigo-900 text-sm"
                    >
                        + Add Reference
                    </button>
                </div>
                {formData.references.map((ref, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg mb-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {renderField(
                                "Name",
                                `references[${index}].name`,
                                ref.name,
                                "text"
                            )}
                            {renderField(
                                "Contact",
                                `references[${index}].contact`,
                                ref.contact,
                                "text"
                            )}
                            {renderField(
                                "Relation",
                                `references[${index}].relation`,
                                ref.relation,
                                "text"
                            )}
                        </div>
                        <button
                            type="button"
                            onClick={() => removeArrayItem("references", index)}
                            className="mt-2 text-red-600 hover:text-red-900 text-sm"
                        >
                            Remove
                        </button>
                    </div>
                ))}
            </div>

            {/* Resume Upload */}
            <div className="border-t pt-6">
                {renderField("Resume", "resume", resumeFile, "file", {
                    accept: ".pdf,.doc,.docx",
                    onChange: (e) => setResumeFile(e.target.files[0]),
                })}
                {resumePreview && (
                    <a
                        href={resumePreview}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-block text-indigo-600 hover:text-indigo-900"
                    >
                        View Current Resume
                    </a>
                )}
            </div>
        </form>
    );
}
