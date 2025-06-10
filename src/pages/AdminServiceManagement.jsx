import React, { useEffect, useState } from "react";
import { fetchServiceHistory, updateRequestStatus } from "../api";
import "../components/styles/AdminServiceManagement.css";

const AdminServiceManagement = () => {
    const [serviceHistory, setServiceHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        const fetchHistory = async () => {
            setLoading(true);
            try {
                const history = await fetchServiceHistory();
                setServiceHistory(history);
            } catch (error) {
                console.error("Error fetching service history:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    const handleStatusChange = async (requestId, newStatus) => {
        setLoading(true);
        try {
            const updatedRequest = await updateRequestStatus(requestId, newStatus);
            setServiceHistory((prevHistory) =>
                prevHistory.map((request) =>
                    request.id === requestId
                        ? { ...request, status: updatedRequest.status }
                        : request
                )
            );
            setMessage("Request status updated successfully.");
        } catch (error) {
            setMessage("Error updating status.");
        } finally {
            setLoading(false);
        }
    };

    const handleFeedbackChange = (requestId, feedback) => {
        setServiceHistory((prevHistory) =>
            prevHistory.map((request) =>
                request.id === requestId ? { ...request, feedback } : request
            )
        );
    };

    return (
        <div className="admin-service-management">
            <h2>Admin: Manage Service Requests</h2>
            {message && <p className="message">{message}</p>}
            {loading ? (
                <p>Loading...</p>
            ) : (
                <table>
                    <thead>
                    <tr>
                        <th>Request ID</th>
                        <th>Service Type</th>
                        <th>Status</th>
                        <th>Date</th>
                        <th>Actions</th>
                        <th>Feedback</th>
                    </tr>
                    </thead>
                    <tbody>
                    {serviceHistory.map((request) => (
                        <tr key={request.id}>
                            <td>{request.id}</td>
                            <td>{request.serviceType}</td>
                            <td className={`status-${request.status.toLowerCase()}`}>{request.status}</td>
                            <td>{new Date(request.date).toLocaleDateString()}</td>
                            <td>
                                <button
                                    onClick={() => handleStatusChange(request.id, "inProgress")}
                                    disabled={request.status === "inProgress"}
                                >
                                    Mark as In Progress
                                </button>
                                <button
                                    onClick={() => handleStatusChange(request.id, "completed")}
                                    disabled={request.status === "completed"}
                                >
                                    Mark as Completed
                                </button>
                            </td>
                            <td>
                                <input
                                    type="text"
                                    placeholder="Enter feedback"
                                    value={request.feedback || ""}
                                    onChange={(e) => handleFeedbackChange(request.id, e.target.value)}
                                />
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default AdminServiceManagement;
