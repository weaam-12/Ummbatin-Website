import React, { useEffect, useState } from "react";
import { fetchServiceHistory } from "../api";
import "../components/styles/UserServiceRequests.css";

const UserServiceRequests = () => {
    const [serviceHistory, setServiceHistory] = useState([]);
    const [loading, setLoading] = useState(false);

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

    return (
        <div className="user-service-requests">
            <h2>Your Service Requests</h2>
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
                            <td>{request.feedback || "No feedback yet"}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default UserServiceRequests;
