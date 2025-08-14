import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getAllComplaints, updateComplaintStatus } from "../api";
import axiosInstance from "../api"; // تأكدي من مسار axiosInstance
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const statusOptions = ["Submitted", "In Progress", "Resolved", "Rejected"];

const AdminComplaints = () => {
    const [complaints, setComplaints] = useState([]);
    const [responses, setResponses] = useState({}); // لتخزين رد كل شكوى

    useEffect(() => {
        fetchComplaints();
    }, []);

    const fetchComplaints = async () => {
        try {
            const data = await getAllComplaints();
            setComplaints(data);
        } catch (err) {
            console.error("Failed to fetch complaints", err);
            toast.error("فشل في تحميل الشكاوى");
        }
    };

    const handleStatusChange = async (complaintId, newStatus) => {
        try {
            await updateComplaintStatus(complaintId, newStatus.toUpperCase());
            toast.success("تم تحديث الحالة بنجاح");
            fetchComplaints();
        } catch (err) {
            console.error(err);
            toast.error("فشل في تحديث الحالة");
        }
    };

    const handleResponseChange = (complaintId, value) => {
        setResponses(prev => ({ ...prev, [complaintId]: value }));
    };

    const handleResponseSubmit = async (complaintId) => {
        const responseText = responses[complaintId];
        if (!responseText?.trim()) {
            toast.warn("أدخل ردًا أولاً");
            return;
        }

        try {
            await axiosInstance.post(`/api/complaints/${complaintId}/response`, {
                response: responseText
            });

            toast.success("تم إرسال الرد وتحديث الحالة");
            setResponses(prev => ({ ...prev, [complaintId]: "" }));
            await fetchComplaints(); // ✅ إعادة تحميل البيانات من السيرفر
        } catch (err) {
            console.error(err);
            toast.error("فشل في إرسال الرد");
        }
    };

    return (
        <div className="grid gap-4 p-4">
            <ToastContainer position="top-right" rtl />

            {complaints.map((complaint) => (
                <Card key={complaint.complaint_id} className="rounded-2xl shadow">
                    <CardContent className="p-4 space-y-3">
                        <div className="text-xl font-semibold">{complaint.type}</div>

                        {/* عرض الوصف مختصر */}
                        <div className="text-sm text-gray-700">
                            {complaint.description.length > 100
                                ? complaint.description.substring(0, 100) + "..."
                                : complaint.description}
                        </div>

                        {/* عرض التفاصيل الكاملة */}
                        <details className="text-sm text-gray-700">
                            <summary className="cursor-pointer font-semibold">عرض وصف الشكوى الكامل</summary>
                            <p className="mt-1 whitespace-pre-wrap">{complaint.description}</p>
                        </details>

                        {complaint.image_url && (
                            <img src={complaint.image_url} alt="Complaint" className="max-w-xs rounded" />
                        )}

                        <div className="text-sm text-gray-600">التذكرة: {complaint.ticket_number}</div>

                        {/* عرض الرد إذا موجود */}
                        {complaint.response && (
                            <div className="text-sm text-green-700 bg-green-100 p-2 rounded">
                                <strong>الرد:</strong> {complaint.response}
                            </div>
                        )}

                        {/* تغيير الحالة */}
                        <div className="flex items-center space-x-2">
                            <span>الحالة:</span>
                            <Select
                                value={complaint.status}
                                onValueChange={(value) => handleStatusChange(complaint.complaint_id, value)}
                            >
                                <SelectTrigger className="w-[150px]">
                                    <SelectValue />
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

                        {/* إرسال رد */}
                        <div className="space-y-2">
                            <Input
                                placeholder="اكتب ردك هنا..."
                                value={responses[complaint.complaint_id] || ""}
                                onChange={(e) => handleResponseChange(complaint.complaint_id, e.target.value)}
                            />
                            <Button
                                onClick={() => handleResponseSubmit(complaint.complaint_id)}
                                className="bg-blue-600 text-white"
                            >
                                إرسال رد
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
};

export default AdminComplaints;