import React, { useState, useEffect } from 'react';
import { getPendingEnrollments, updateEnrollmentStatus } from './api';

const AdminEnrollments = () => {
    const [enrollments, setEnrollments] = useState([]);

    useEffect(() => {
        const fetchEnrollments = async () => {
            const data = await getPendingEnrollments();
            setEnrollments(data);
        };
        fetchEnrollments();
    }, []);

    const handleApprove = async (enrollmentId) => {
        await updateEnrollmentStatus(enrollmentId, 'APPROVED');
        setEnrollments(enrollments.filter(e => e.id !== enrollmentId));
    };

    return (
        <div>
            <h2>طلبات التسجيل المعلقة</h2>
            {enrollments.map(enrollment => (
                <div key={enrollment.id}>
                    <p>الطفل: {enrollment.child.name}</p>
                    <p>الحضانة: {enrollment.kindergarten.name}</p>
                    <button onClick={() => handleApprove(enrollment.id)}>موافقة</button>
                </div>
            ))}
        </div>
    );
};