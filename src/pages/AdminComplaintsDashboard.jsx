import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { getAllComplaints, updateComplaintStatus } from "../api";
import toast from "react-bootstrap/Toast";

const statusOptions = ["Submitted", "In Progress", "Resolved", "Rejected"];

const AdminComplaintsDashboard = () => {
    const [complaints, setComplaints] = useState([]);

    useEffect(() => {
        fetchComplaints();
    }, []);

    const fetchComplaints = async () => {
        try {
            const data = await getAllComplaints();
            setComplaints(data);
        } catch (err) {
            console.error("Failed to fetch complaints", err);
        }
    };

    const handleStatusChange = async (complaintId, newStatus) => {
        try {
            await updateComplaintStatus(complaintId, newStatus.toUpperCase());
            fetchComplaints();
            toast.success("تم تحديث حالة الشكوى بنجاح");
        } catch (err) {
            console.error("Failed to update status", err);
            toast.error("فشل في تحديث الحالة: " + (err.response?.data || err.message));
        }
    };

    return (
        <div className="grid gap-4 p-4">
            {complaints.map((complaint) => (
                <Card key={complaint.complaint_id} className="rounded-2xl shadow">
                    <CardContent className="p-4 space-y-2">
                        <div className="text-xl font-semibold">{complaint.title}</div>
                        <div>{complaint.description}</div>
                        {complaint.image_url && (
                            <img src={complaint.image_url} alt="Complaint" className="max-w-xs rounded" />
                        )}
                        <div className="text-sm text-gray-600">Ticket: {complaint.ticket_number}</div>
                        <div className="flex items-center space-x-2">
                            <span>Status:</span>
                            <Select
                                value={complaint.status}
                                onValueChange={(value) => handleStatusChange(complaint.complaint_id, value)}
                            >
                                <SelectTrigger className="w-[150px]">
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    {statusOptions.map((status) => (
                                        <SelectItem key={status} value={status}>
                                            {status}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
};

export default AdminComplaintsDashboard;
