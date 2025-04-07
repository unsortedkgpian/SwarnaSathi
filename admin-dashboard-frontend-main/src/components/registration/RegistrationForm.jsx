// "use client";

// import React, { useState, useEffect, useContext } from "react";
// import { useNavigate } from "react-router-dom";
// import { Pencil, Trash2 } from "lucide-react";
// import { AuthContext } from "../../context/AuthContext";

// export default function CommunityMembersList() {
//     const navigate = useNavigate();
//     const { authAxios } = useContext(AuthContext);
//     const url = process.env.REACT_APP_API_URL;

//     const [members, setMembers] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);

//     useEffect(() => {
//         fetchMembers();
//     }, []);

//     const fetchMembers = async () => {
//         try {
//             const response = await authAxios.get(`${url}/api/registration`);
//             setMembers(Array.isArray(response.data) ? response.data : []);
//             setLoading(false);
//         } catch (err) {
//             console.error("Error fetching members:", err);
//             setError(err.response?.data?.message || "Error fetching members");
//             setLoading(false);
//         }
//     };

//     const handleDelete = async (id) => {
//         if (window.confirm("Are you sure you want to delete this member?")) {
//             try {
//                 await authAxios.delete(`${url}/api/registration/${id}`);
//                 setMembers((prev) =>
//                     prev.filter((member) => member._id !== id)
//                 );
//             } catch (err) {
//                 setError(
//                     err.response?.data?.message || "Error deleting member"
//                 );
//             }
//         }
//     };

//     if (loading) return <div className="text-center p-6">Loading...</div>;
//     if (error) return <div className="text-red-700 p-6">{error}</div>;

//     return (
//         <div className="bg-white p-6 rounded-lg shadow">
//             <div className="flex justify-between items-center mb-6">
//                 <h2 className="text-2xl font-bold text-gray-900">
//                     Community Members
//                 </h2>
//                 <button
//                     onClick={() => navigate("/dashboard/member/new")}
//                     className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
//                 >
//                     + New Registration
//                 </button>
//             </div>

//             <div className="overflow-x-auto">
//                 <table className="min-w-full divide-y divide-gray-200">
//                     <thead className="bg-gray-50">
//                         <tr>
//                             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                                 Name
//                             </th>
//                             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                                 Phone
//                             </th>
//                             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                                 Role Type
//                             </th>
//                             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                                 Pincode
//                             </th>
//                             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                                 Verified
//                             </th>
//                             <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
//                                 Actions
//                             </th>
//                         </tr>
//                     </thead>

//                     <tbody className="bg-white divide-y divide-gray-200">
//                         {members.length > 0 ? (
//                             members.map((member) => (
//                                 <tr key={member._id}>
//                                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                                         {member.name}
//                                     </td>
//                                     <td className="px-6 py-4 text-sm text-gray-500">
//                                         {member.phone}
//                                     </td>
//                                     <td className="px-6 py-4 text-sm text-gray-500 capitalize">
//                                         {member.type}
//                                     </td>
//                                     <td className="px-6 py-4 text-sm text-gray-500">
//                                         {member.pincode || "-"}
//                                     </td>
//                                     <td className="px-6 py-4 text-sm text-gray-500">
//                                         {member.verified ? (
//                                             <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
//                                                 Verified
//                                             </span>
//                                         ) : (
//                                             <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
//                                                 Pending
//                                             </span>
//                                         )}
//                                     </td>
//                                     <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
//                                         <button
//                                             onClick={() =>
//                                                 navigate(
//                                                     `/dashboard/member/edit/${member._id}`
//                                                 )
//                                             }
//                                             className="text-indigo-600 hover:text-indigo-900 mr-4"
//                                         >
//                                             <Pencil className="h-5 w-5" />
//                                         </button>
//                                         <button
//                                             onClick={() =>
//                                                 handleDelete(member._id)
//                                             }
//                                             className="text-red-600 hover:text-red-900"
//                                         >
//                                             <Trash2 className="h-5 w-5" />
//                                         </button>
//                                     </td>
//                                 </tr>
//                             ))
//                         ) : (
//                             <tr>
//                                 <td
//                                     colSpan="6"
//                                     className="text-center py-4 text-gray-500"
//                                 >
//                                     No registered members found
//                                 </td>
//                             </tr>
//                         )}
//                     </tbody>
//                 </table>
//             </div>
//         </div>
//     );
// }

"use client";

import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

export default function CommunityMembersList() {
    const navigate = useNavigate();
    const { authAxios } = useContext(AuthContext);
    const url = process.env.REACT_APP_API_URL;

    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchMembers();
    }, []);

    const fetchMembers = async () => {
        try {
            const response = await authAxios.get(`${url}/api/registration`);
            setMembers(Array.isArray(response.data) ? response.data : []);
            setLoading(false);
        } catch (err) {
            console.error("Error fetching members:", err);
            setError(err.response?.data?.message || "Error fetching members");
            setLoading(false);
        }
    };

    if (loading) return <div className="text-center p-6">Loading...</div>;
    if (error) return <div className="text-red-700 p-6">{error}</div>;

    return (
        <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                    Community Members
                </h2>
                <button
                    onClick={() => navigate("/dashboard/member/new")}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                >
                    + New Registration
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Phone
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Role Type
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Pincode
                            </th>
                            
                        </tr>
                    </thead>

                    <tbody className="bg-white divide-y divide-gray-200">
                        {members.length === 0 ? (
                            <tr>
                                <td
                                    colSpan="5"
                                    className="text-center py-8 text-gray-500"
                                >
                                    No registered members found
                                </td>
                            </tr>
                        ) : (
                            members.map((member) => (
                                <tr key={member._id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {member.name}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {member.phone}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500 capitalize">
                                        {member.type}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {member.pincode || "-"}
                                    </td>
                                    
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
