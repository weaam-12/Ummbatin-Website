// AdminKinder.jsx
import React, { useEffect, useState } from 'react';
import {
    fetchKindergartens,
    createKindergarten,
    deleteKindergarten,
    getAllUsers,           // returns minimal {userId, name}
} from '../api';           // your existing api.js
import './AdminKinder.css';

// helper to call endpoints you still need to add
import { axiosInstance } from '../api.js';

export default function AdminKinder() {
    /* ---------- state ---------- */
    const [kindergartens, setKindergartens] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newKg, setNewKg] = useState({ name: '', location: '', capacity: '' });

    // { kindergartenId => { children:[], requests:[] } }
    const [childrenMap, setChildrenMap] = useState({});

    /* ---------- load ---------- */
    useEffect(() => {
        loadAll();
    }, []);

    const loadAll = async () => {
        const [kgs, users] = await Promise.all([
            fetchKindergartens(),
            getAllUsers().catch(() => []),
        ]);
        setKindergartens(kgs);

        // fetch children for every kg
        const map = {};
        await Promise.all(
            kgs.map(async (kg) => {
                const { data: children } = await axiosInstance.get(
                    `/api/kindergartens/${kg.kindergartenId}/children`
                );
                const { data: requests } = await axiosInstance.get(
                    `/api/kindergartens/${kg.kindergartenId}/requests`
                );
                map[kg.kindergartenId] = { children, requests };
            })
        );
        setChildrenMap(map);
    };

    /* ---------- kindergarten CRUD ---------- */
    const handleAddKg = async (e) => {
        e.preventDefault();
        await createKindergarten(newKg);
        setShowAddModal(false);
        setNewKg({ name: '', location: '', capacity: '' });
        loadAll();
    };

    /* ---------- enrollment actions ---------- */
    const handleApprove = async (requestId, approve) => {
        await axiosInstance.patch(`/api/enrollments/${requestId}`, { status: approve ? 'APPROVED' : 'REJECTED' });
        loadAll();
    };

    const handleMarkPaid = async (requestId) => {
        await axiosInstance.patch(`/api/enrollments/${requestId}/pay`);
        loadAll();
    };

    const moveChild = async (childId, targetKgId) => {
        await axiosInstance.put(`/api/children/${childId}/move`, { kindergartenId: targetKgId });
        loadAll();
    };

    /* ---------- render ---------- */
    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Kindergartens Administration</h1>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded"
                >
                    + Add Kindergarten
                </button>
            </div>

            {/* Add Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
                    <form
                        onSubmit={handleAddKg}
                        className="bg-white p-6 rounded shadow w-96 space-y-4"
                    >
                        <h2 className="text-lg font-semibold">New Kindergarten</h2>
                        <input
                            placeholder="Name"
                            value={newKg.name}
                            onChange={(e) => setNewKg({ ...newKg, name: e.target.value })}
                            className="w-full border px-3 py-1"
                            required
                        />
                        <input
                            placeholder="Location"
                            value={newKg.location}
                            onChange={(e) => setNewKg({ ...newKg, location: e.target.value })}
                            className="w-full border px-3 py-1"
                            required
                        />
                        <input
                            type="number"
                            placeholder="Capacity"
                            value={newKg.capacity}
                            onChange={(e) => setNewKg({ ...newKg, capacity: e.target.value })}
                            className="w-full border px-3 py-1"
                            required
                        />
                        <div className="flex justify-end space-x-2">
                            <button type="button" onClick={() => setShowAddModal(false)}>
                                Cancel
                            </button>
                            <button className="bg-blue-600 text-white px-3 py-1 rounded">Save</button>
                        </div>
                    </form>
                </div>
            )}

            {/* Kindergartens Table */}
            <table className="w-full border">
                <thead>
                <tr className="bg-gray-100">
                    <th className="border px-2 py-1">ID</th>
                    <th>Name</th>
                    <th>Location</th>
                    <th>Capacity</th>
                    <th>Enrolled</th>
                    <th>Actions</th>
                </tr>
                </thead>
                <tbody>
                {kindergartens.map((kg) => {
                    const enrolled = childrenMap[kg.kindergartenId]?.children?.length || 0;
                    return (
                        <tr key={kg.kindergartenId}>
                            <td className="border px-2 py-1">{kg.kindergartenId}</td>
                            <td className="border px-2 py-1">{kg.name}</td>
                            <td className="border px-2 py-1">{kg.location}</td>
                            <td className="border px-2 py-1">{kg.capacity}</td>
                            <td className="border px-2 py-1">{enrolled}</td>
                            <td className="border px-2 py-1 space-x-2">
                                <button
                                    onClick={() => alert('Edit UI not shown for brevity')}
                                    className="text-blue-600 underline"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={async () => {
                                        await deleteKindergarten(kg.kindergartenId);
                                        loadAll();
                                    }}
                                    className="text-red-600 underline"
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    );
                })}
                </tbody>
            </table>

            {/* Details per kindergarten */}
            {kindergartens.map((kg) => {
                const { children = [], requests = [] } = childrenMap[kg.kindergartenId] || {};
                return (
                    <details key={kg.kindergartenId} className="border rounded p-2">
                        <summary className="cursor-pointer font-semibold">
                            {kg.name} — enrolled {children.length} / {kg.capacity}
                        </summary>

                        {/* Children already enrolled */}
                        <h3 className="mt-3 font-medium">Enrolled Children</h3>
                        <table className="w-full text-sm">
                            <thead>
                            <tr>
                                <th>Child</th>
                                <th>Parent (User)</th>
                                <th>Mother (Wife)</th>
                                <th>Paid</th>
                                <th>Move to</th>
                            </tr>
                            </thead>
                            <tbody>
                            {children.map((ch) => (
                                <tr key={ch.childId}>
                                    <td>{ch.name}</td>
                                    <td>User #{ch.userId}</td>
                                    <td>Wife #{ch.wifeId}</td>
                                    <td>{ch.paid ? '✅' : '❌'}</td>
                                    <td>
                                        <select
                                            onChange={(e) =>
                                                e.target.value && moveChild(ch.childId, e.target.value)
                                            }
                                            className="border"
                                        >
                                            <option value="">-- move --</option>
                                            {kindergartens
                                                .filter((k) => k.kindergartenId !== kg.kindergartenId)
                                                .map((k) => (
                                                    <option key={k.kindergartenId} value={k.kindergartenId}>
                                                        {k.name}
                                                    </option>
                                                ))}
                                        </select>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>

                        {/* Pending requests */}
                        {requests.length > 0 && (
                            <>
                                <h3 className="mt-4 font-medium">Pending Requests</h3>
                                <table className="w-full text-sm">
                                    <thead>
                                    <tr>
                                        <th>Child</th>
                                        <th>Parent</th>
                                        <th>Mother</th>
                                        <th>Paid</th>
                                        <th>Actions</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {requests.map((req) => (
                                        <tr key={req.requestId}>
                                            <td>{req.childName}</td>
                                            <td>User #{req.userId}</td>
                                            <td>Wife #{req.wifeId}</td>
                                            <td>
                                                {req.paid ? (
                                                    '✅'
                                                ) : (
                                                    <button
                                                        onClick={() => handleMarkPaid(req.requestId)}
                                                        className="bg-green-500 text-white px-2 rounded"
                                                    >
                                                        Mark Paid
                                                    </button>
                                                )}
                                            </td>
                                            <td className="space-x-1">
                                                <button
                                                    onClick={() => handleApprove(req.requestId, true)}
                                                    className="bg-blue-500 text-white px-2 rounded"
                                                >
                                                    Accept
                                                </button>
                                                <button
                                                    onClick={() => handleApprove(req.requestId, false)}
                                                    className="bg-red-500 text-white px-2 rounded"
                                                >
                                                    Reject
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </>
                        )}
                    </details>
                );
            })}
        </div>
    );
}