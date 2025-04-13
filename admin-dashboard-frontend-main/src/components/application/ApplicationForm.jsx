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
                setResumePreview(response.data.resume.originalName);
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
            case "resume":
                if (!value) error = "Resume is required";
                const allowedTypes = [
                    'application/pdf',
                    'application/msword',
                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                ];
                if (value && !allowedTypes.includes(value.type)) {
                    error = "Only PDF, DOC, and DOCX files are allowed";
                }
                if (value && value.size > 10 * 1024 * 1024) { // 10MB
                    error = "File size exceeds 10MB limit";
                }
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

        // Validate resume for new applications
        if (!id && !resumeFile) {
            newErrors.resume = "Resume is required";
        } else if (resumeFile) {
            const resumeError = validateField("resume", resumeFile);
            if (resumeError) newErrors.resume = resumeError;
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setLoading(true);
        try {
            const formPayload = new FormData();
            formPayload.append("data", JSON.stringify(formData));
            
            if (resumeFile) {
                formPayload.append("resume", resumeFile);
            }

            if (id) {
                await authAxios.put(
                    `${url}/api/application/${id}`,
                    formPayload,
                    {
                        headers: {
                            'Content-Type': 'multipart/form-data'
                        }
                    }
                );
            } else {
                await authAxios.post(
                    `${url}/api/application`,
                    formPayload,
                    {
                        headers: {
                            'Content-Type': 'multipart/form-data'
                        }
                    }
                );
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

    const renderResumeSection = () => (
        <div className="col-span-6">
            <label className="block text-sm font-medium text-gray-700">
                Resume
                {!id && <span className="text-red-500">*</span>}
            </label>
            <div className="mt-1 flex items-center">
                <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                            // Clear previous error
                            setErrors(prev => ({ ...prev, resume: undefined }));
                            
                            // Validate file
                            const error = validateField("resume", file);
                            if (error) {
                                setErrors(prev => ({ ...prev, resume: error }));
                                e.target.value = ''; // Clear the input
                                return;
                            }

                            setResumeFile(file);
                            setResumePreview(file.name);
                        }
                    }}
                    className="block w-full text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-full file:border-0
                        file:text-sm file:font-semibold
                        file:bg-indigo-50 file:text-indigo-700
                        hover:file:bg-indigo-100"
                />
            </div>
            {resumePreview && (
                <div className="mt-2 text-sm text-gray-500">
                    Current resume: {resumePreview}
                </div>
            )}
            {errors.resume && (
                <p className="mt-2 text-sm text-red-600">{errors.resume}</p>
            )}
            <p className="mt-2 text-xs text-gray-500">
                Accepted formats: PDF, DOC, DOCX. Maximum size: 10MB
            </p>
        </div>
    );

    return (
        <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                    {id ? "Edit Application" : "New Application"}
                </h2>
                <button
                    onClick={() => navigate("/dashboard/application")}
                    className="text-gray-600 hover:text-gray-900"
                >
                    <X className="h-6 w-6" />
                </button>
            </div>

            {errors.general && (
                <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md">
                    {errors.general}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Personal Information */}
                <div>
                    <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
                        Personal Information
                    </h3>
                    <div className="grid grid-cols-6 gap-6">
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
                            "date",
                            { required: true }
                        )}
                        {renderField(
                            "Email",
                            "personalInfo.email",
                            formData.personalInfo.email,
                            "email",
                            { required: true }
                        )}
                        {renderField(
                            "Phone",
                            "personalInfo.phone",
                            formData.personalInfo.phone,
                            "tel",
                            { required: true }
                        )}
                        {renderField(
                            "Current Address",
                            "personalInfo.currentAddress",
                            formData.personalInfo.currentAddress,
                            "textarea",
                            { required: true }
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
                <div>
                    <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
                        Position Details
                    </h3>
                    <div className="grid grid-cols-6 gap-6">
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
                            "date",
                            { required: true }
                        )}
                        {renderField(
                            "Preferred Location",
                            "positionDetails.preferredLocation",
                            formData.positionDetails.preferredLocation,
                            "text"
                        )}
                        <div className="col-span-6 sm:col-span-3">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={
                                        formData.positionDetails.willingToRelocate
                                    }
                                    onChange={(e) =>
                                        handleChange(
                                            "positionDetails.willingToRelocate",
                                            e.target.checked
                                        )
                                    }
                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                />
                                <span className="ml-2 text-sm text-gray-600">
                                    Willing to Relocate
                                </span>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Educational Background */}
                <div>
                    <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
                        Educational Background
                    </h3>
                    {formData.educationalBackground.map((edu, index) => (
                        <div
                            key={index}
                            className="grid grid-cols-6 gap-6 p-4 border rounded-lg mb-4"
                        >
                            {renderField(
                                "Qualification",
                                `educationalBackground.${index}.qualification`,
                                edu.qualification,
                                "text",
                                { required: true }
                            )}
                            {renderField(
                                "Institution",
                                `educationalBackground.${index}.institution`,
                                edu.institution,
                                "text",
                                { required: true }
                            )}
                            {renderField(
                                "Year of Passing",
                                `educationalBackground.${index}.yearPassing`,
                                edu.yearPassing,
                                "number",
                                { required: true }
                            )}
                            {renderField(
                                "Percentage/CGPA",
                                `educationalBackground.${index}.percentage`,
                                edu.percentage,
                                "text",
                                { required: true }
                            )}
                            {formData.educationalBackground.length > 1 && (
                                <div className="col-span-6 flex justify-end">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            removeArrayItem(
                                                "educationalBackground",
                                                index
                                            )
                                        }
                                        className="text-red-600 hover:text-red-900"
                                    >
                                        Remove
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
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
                        className="mt-2 text-sm text-indigo-600 hover:text-indigo-900"
                    >
                        + Add Education
                    </button>
                </div>

                {/* Work Experience */}
                <div>
                    <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
                        Work Experience
                    </h3>
                    {formData.workExperience.map((exp, index) => (
                        <div
                            key={index}
                            className="grid grid-cols-6 gap-6 p-4 border rounded-lg mb-4"
                        >
                            {renderField(
                                "Organization",
                                `workExperience.${index}.organization`,
                                exp.organization,
                                "text"
                            )}
                            {renderField(
                                "Job Title",
                                `workExperience.${index}.jobTitle`,
                                exp.jobTitle,
                                "text"
                            )}
                            {renderField(
                                "From Date",
                                `workExperience.${index}.duration.from`,
                                exp.duration.from,
                                "date"
                            )}
                            {renderField(
                                "To Date",
                                `workExperience.${index}.duration.to`,
                                exp.duration.to,
                                "date"
                            )}
                            {renderField(
                                "Reason for Leaving",
                                `workExperience.${index}.reasonLeaving`,
                                exp.reasonLeaving,
                                "text"
                            )}
                            <div className="col-span-6">
                                <label className="block text-sm font-medium text-gray-700">
                                    Responsibilities
                                </label>
                                {exp.responsibilities.map((resp, respIndex) => (
                                    <div
                                        key={respIndex}
                                        className="flex items-center mt-2"
                                    >
                                        <input
                                            type="text"
                                            value={resp}
                                            onChange={(e) =>
                                                handleArrayChange(
                                                    "workExperience",
                                                    index,
                                                    `responsibilities.${respIndex}`,
                                                    e.target.value
                                                )
                                            }
                                            className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                                        />
                                        {exp.responsibilities.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const newExp = {
                                                        ...exp,
                                                        responsibilities:
                                                            exp.responsibilities.filter(
                                                                (_, i) =>
                                                                    i !== respIndex
                                                            ),
                                                    };
                                                    handleArrayChange(
                                                        "workExperience",
                                                        index,
                                                        "",
                                                        newExp
                                                    );
                                                }}
                                                className="ml-2 text-red-600 hover:text-red-900"
                                            >
                                                Remove
                                            </button>
                                        )}
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => {
                                        const newExp = {
                                            ...exp,
                                            responsibilities: [
                                                ...exp.responsibilities,
                                                "",
                                            ],
                                        };
                                        handleArrayChange(
                                            "workExperience",
                                            index,
                                            "",
                                            newExp
                                        );
                                    }}
                                    className="mt-2 text-sm text-indigo-600 hover:text-indigo-900"
                                >
                                    + Add Responsibility
                                </button>
                            </div>
                            {formData.workExperience.length > 1 && (
                                <div className="col-span-6 flex justify-end">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            removeArrayItem(
                                                "workExperience",
                                                index
                                            )
                                        }
                                        className="text-red-600 hover:text-red-900"
                                    >
                                        Remove Experience
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
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
                        className="mt-2 text-sm text-indigo-600 hover:text-indigo-900"
                    >
                        + Add Experience
                    </button>
                </div>

                {/* Skills */}
                <div>
                    <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
                        Skills
                    </h3>
                    <div className="space-y-2">
                        {formData.skills.map((skill, index) => (
                            <div key={index} className="flex items-center">
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
                                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                                />
                                {formData.skills.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            removeArrayItem("skills", index)
                                        }
                                        className="ml-2 text-red-600 hover:text-red-900"
                                    >
                                        Remove
                                    </button>
                                )}
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={() => addArrayItem("skills", "")}
                            className="text-sm text-indigo-600 hover:text-indigo-900"
                        >
                            + Add Skill
                        </button>
                    </div>
                </div>

                {/* References */}
                <div>
                    <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
                        References
                    </h3>
                    {formData.references.map((ref, index) => (
                        <div
                            key={index}
                            className="grid grid-cols-6 gap-6 p-4 border rounded-lg mb-4"
                        >
                            {renderField(
                                "Name",
                                `references.${index}.name`,
                                ref.name,
                                "text"
                            )}
                            {renderField(
                                "Contact",
                                `references.${index}.contact`,
                                ref.contact,
                                "text"
                            )}
                            {renderField(
                                "Relation",
                                `references.${index}.relation`,
                                ref.relation,
                                "text"
                            )}
                            {formData.references.length > 1 && (
                                <div className="col-span-6 flex justify-end">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            removeArrayItem("references", index)
                                        }
                                        className="text-red-600 hover:text-red-900"
                                    >
                                        Remove
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                    <button
                        type="button"
                        onClick={() =>
                            addArrayItem("references", {
                                name: "",
                                contact: "",
                                relation: "",
                            })
                        }
                        className="mt-2 text-sm text-indigo-600 hover:text-indigo-900"
                    >
                        + Add Reference
                    </button>
                </div>

                {/* Resume Upload */}
                {renderResumeSection()}

                <div className="flex justify-end space-x-4">
                    <button
                        type="button"
                        onClick={() => navigate("/dashboard/application")}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                        {loading ? (
                            "Saving..."
                        ) : (
                            <>
                                <Save className="w-4 h-4 mr-2" />
                                Save
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}