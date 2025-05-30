import React from 'react';

const statusColors = {
    'טיפול': 'orange',
    'נפתרה': 'green',
    'לא רלוונטית': 'gray'
};

const ComplaintStatusBadge = ({ status }) => {
    return (
        <span
            className="status-badge"
            style={{ backgroundColor: statusColors[status] || 'gray' }}
        >
            {status}
        </span>
    );
};

export default ComplaintStatusBadge;