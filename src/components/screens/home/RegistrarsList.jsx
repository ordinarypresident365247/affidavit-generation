import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../contexts/authContext';
import { getRegistrars, deleteRegistrar } from '../../../utils/database';
import Swal from 'sweetalert2';

const RegistrarsList = () => {
    const { currentUser } = useAuth();
    const [registrars, setRegistrars] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (currentUser) {
            fetchRegistrars();
        }
    }, [currentUser]);

    const fetchRegistrars = async () => {
        try {
            const data = await getRegistrars(currentUser.uid);
            setRegistrars(data);
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to load registrar records.',
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
                await deleteRegistrar(id);
                setRegistrars(prev => prev.filter(r => r.id !== id));
                Swal.fire('Deleted!', 'Registrar has been deleted.', 'success');
            } catch (error) {
                Swal.fire('Error', 'Failed to delete record.', 'error');
            }
        }
    };

    if (loading) return <div className="p-4 text-center">Loading...</div>;

    return (
        <div className="p-6 bg-white rounded-lg shadow-md">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="text-2xl font-bold">Registrar Records</h2>
                <Link to="/home/add-registrar" className="btn btn-primary">
                    <i className="bi bi-plus-lg me-2"></i>Add Registrar
                </Link>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full border-collapse border border-gray-200">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="border p-3 text-left">Name</th>
                            <th className="border p-3 text-left">Title</th>
                            <th className="border p-3 text-left">Signature</th>
                            <th className="border p-3 text-left">Date Added</th>
                            <th className="border p-3 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {registrars.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="text-center p-4">No records found.</td>
                            </tr>
                        ) : (
                            registrars.map((r) => (
                                <tr key={r.id} className="hover:bg-gray-50">
                                    <td className="border p-3 font-semibold">{r.name}</td>
                                    <td className="border p-3">{r.title || 'N/A'}</td>
                                    <td className="border p-3">
                                        {r.signature ? (
                                            <img src={r.signature} alt="signature" style={{ height: '30px', maxWidth: '100px' }} />
                                        ) : 'No Signature'}
                                    </td>
                                    <td className="border p-3">
                                        {r.createdAt?.toDate() ? r.createdAt.toDate().toLocaleDateString() : 'N/A'}
                                    </td>
                                    <td className="border p-3 text-center">
                                        <Link to={`/home/edit-registrar/${r.id}`} className="btn btn-sm btn-outline-primary me-2">
                                            <i className="bi bi-pencil"></i>
                                        </Link>
                                        <button onClick={() => handleDelete(r.id)} className="btn btn-sm btn-outline-danger">
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

export default RegistrarsList;