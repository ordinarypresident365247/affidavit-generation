import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../contexts/authContext';
import { getCommissioners, deleteCommissioner  } from '../../../utils/database';
import Swal from 'sweetalert2';

const CommissionersList = () => {
    const { currentUser } = useAuth();
    const [commissioners, setCommissioners] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (currentUser) {
            fetchCommissioners();
        }
    }, [currentUser]);

    const fetchCommissioners = async () => {
        try {
            const data = await getCommissioners(currentUser.uid);
            setCommissioners(data);
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to load commissioner records.',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            try {
                await deleteCommissioner(id);
                setCommissioners(prev => prev.filter(c => c.id !== id));
                Swal.fire('Deleted!', 'Commissioner has been deleted.', 'success');
            } catch (error) {
                Swal.fire('Error', 'Failed to delete record.', 'error');
            }
        }
    };

    if (loading) return <div className="p-4 text-center">Loading...</div>;

    return (
        <div className="p-6 bg-white rounded-lg shadow-md">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="text-2xl font-bold">Commissioner Records</h2>
                <Link to="/home/add-commissioner" className="btn btn-primary">
                    <i className="bi bi-plus-lg me-2"></i>Add Commissioner
                </Link>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full border-collapse border border-gray-200">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="border p-3 text-left">Name</th>
                            <th className="border p-3 text-left">Court/Title</th>
                            <th className="border p-3 text-left">Signature</th>
                            <th className="border p-3 text-left">Date Added</th>
                            <th className="border p-3 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {commissioners.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="text-center p-4">No records found.</td>
                            </tr>
                        ) : (
                            commissioners.map((c) => (
                                <tr key={c.id} className="hover:bg-gray-50">
                                    <td className="border p-3 font-semibold">{c.name}</td>
                                    <td className="border p-3">{c.court || 'N/A'}</td>
                                    <td className="border p-3">
                                        {c.signature ? (
                                            <img src={c.signature} alt="signature" style={{ height: '30px', maxWidth: '100px' }} />
                                        ) : 'No Signature'}
                                    </td>
                                    <td className="border p-3">
                                        {c.createdAt?.toDate() ? c.createdAt.toDate().toLocaleDateString() : 'N/A'}
                                    </td>
                                    <td className="border p-3 text-center">
                                        <Link to={`/home/edit-commissioner/${c.id}`} className="btn btn-sm btn-outline-primary me-2">
                                            <i className="bi bi-pencil"></i>
                                        </Link>
                                        <button onClick={() => handleDelete(c.id)} className="btn btn-sm btn-outline-danger">
                                            <i className="bi bi-trash"></i>
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default CommissionersList;