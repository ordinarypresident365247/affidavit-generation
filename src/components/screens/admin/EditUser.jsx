import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../../contexts/authContext';
import { getUserById, updateUser } from '../../../utils/database';
import { storage } from '../../../utils/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import Swal from 'sweetalert2';

const EditUser = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useAuth();

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        accountType: 'court-account',
        courtTitle: '',
        courtTitleLine2: '',
        courtState: ''
    });
    
    const [courtSealFile, setCourtSealFile] = useState(null);
    const [loading, setLoading] = useState(true);

    const nigerianStates = [
        "Abuja", "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno", 
        "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "Gombe", 
        "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", 
        "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", 
        "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara"
    ];

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const data = await getUserById(id);
                setFormData({
                    fullName: data.fullName || '',
                    email: data.email || '',
                    accountType: data.accountType || 'court-account',
                    courtTitle: data.courtTitle || '',
                    courtTitleLine2: data.courtTitleLine2 || '',
                    courtState: data.courtState || '',
                    courtSealUrl: data.courtSealUrl || ''
                });
            } catch (err) {
                Swal.fire('Error', 'Could not load user data', 'error');
                navigate('/admin/users');
            } finally {
                setLoading(false);
            }
        };
        fetchUserData();
    }, [id, navigate]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        if (e.target.files[0]) {
            setCourtSealFile(e.target.files[0]);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();

        Swal.fire({
            title: 'Updating User...',
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading()
        });

        try {
            let courtSealUrl = formData.courtSealUrl;
            if (courtSealFile) {
                const sealRef = ref(storage, `seals/${formData.email}_${Date.now()}_seal`);
                const uploadResult = await uploadBytes(sealRef, courtSealFile);
                courtSealUrl = await getDownloadURL(uploadResult.ref);
            }

            const finalData = {
                ...formData,
                ...(courtSealUrl && { courtSealUrl })
            };
    
            await updateUser(id, finalData);
            Swal.fire('Success', 'User updated successfully', 'success');
            navigate('/admin/users');
        } catch (err) {
            Swal.fire('Update Failed', err.message, 'error');
        }
    };

    if (loading) return <div className="text-center mt-5"><div className="spinner-border"></div></div>;

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-7">
                    <div className="card shadow border-0">
                        <div className="card-body p-4">
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <h2 className="mb-0">Edit User Details</h2>
                                <Link to="/admin/users" className="btn btn-sm btn-outline-secondary">Back to List</Link>
                            </div>
                            <form onSubmit={handleUpdate}>
                                <div className="mb-3">
                                    <label className="form-label">Full Name</label>
                                    <input name="fullName" type="text" className="form-control" value={formData.fullName} onChange={handleChange} required />
                                </div>
                                
                                <div className="mb-3">
                                    <label className="form-label">Email Address</label>
                                    <input name="email" type="email" className="form-control" value={formData.email} disabled />
                                    <small className="text-muted">Email cannot be changed.</small>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Account Type</label>
                                    <select name="accountType" className="form-select" value={formData.accountType} onChange={handleChange} required>
                                        <option value="court-account">Court Account</option>
                                        {currentUser.accountType === 'super-admin' && <option value="super-admin">Super Admin</option>}
                                        {currentUser.accountType === 'super-admin' && <option value="limited-admin">Limited Admin</option>}
                                    </select>
                                </div>

                                { formData.accountType === 'court-account' && (
                                    <div className="animate__animated animate__fadeIn">
                                        <div className="row">
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label">Court Title (Line 1)</label>
                                                <input name="courtTitle" type="text" className="form-control" value={formData.courtTitle} onChange={handleChange} required />
                                            </div>
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label">Court Title (Line 2)</label>
                                                <input name="courtTitleLine2" type="text" className="form-control" value={formData.courtTitleLine2} onChange={handleChange} />
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label">Court State</label>
                                                <select name="courtState" className="form-select" value={formData.courtState} onChange={handleChange} required>
                                                    <option value="">Select State</option>
                                                    {nigerianStates.map(state => <option key={state} value={state}>{state}</option>)}
                                                </select>
                                            </div>
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label">Update Court Seal (Optional)</label>
                                                <input type="file" className="form-control" onChange={handleFileChange} accept="image/*" />
                                                {formData.courtSealUrl && (
                                                    <div className="mt-2">
                                                        <small className="text-muted d-block mb-1">Current Seal:</small>
                                                        <img src={formData.courtSealUrl} alt="Court Seal" style={{ maxHeight: '80px', border: '1px solid #dee2e6', padding: '2px' }} className="rounded" />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <button type="submit" className="btn btn-primary w-100 py-2 shadow-sm">
                                    Save Changes
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditUser;