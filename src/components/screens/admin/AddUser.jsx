import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { /*registerWithEmailAndPassword,*/ adminCreateUser, checkEmailExists } from '../../../utils/auth';
import { useAuth } from '../../../contexts/authContext';
import { storage } from '../../../utils/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

import Swal from 'sweetalert2';

const AddUser = () => {
    const navigate = useNavigate();
    const { currentUser } = useAuth();

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        accountType: 'court-account',
        courtTitle: '',
        courtTitleLine2: '',
        courtState: ''
    });
    
    const [ courtSealFile, setCourtSealFile ] = useState(null);

    const nigerianStates = [
        "Abuja", "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno", 
        "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "Gombe", 
        "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", 
        "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", 
        "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara"
    ];

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        if (e.target.files[0]) {
            setCourtSealFile(e.target.files[0]);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            return Swal.fire('Error', 'Passwords do not match', 'error');
        }
        if (formData.password.length < 6) {
            return Swal.fire('Weak Password', 'Password should be at least 6 characters.', 'warning');
        }

        // Show loading state
        Swal.fire({
            title: 'Validating...',
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading()
        });

        try {
            // Proactive Email Check
            const emailExists = await checkEmailExists(formData.email);
            if (emailExists) {
                return Swal.fire({
                    icon: 'error',
                    title: 'Email Taken',
                    text: 'A user with this email address already exists.',
                    confirmButtonColor: '#0d6efd'
                });
            }

            Swal.update({ title: 'Uploading Seal & Creating Account...' });

            let courtSealUrl = "";
            if (courtSealFile) {
                const sealRef = ref(storage, `seals/${formData.email}_${Date.now()}_seal`);
                const uploadResult = await uploadBytes(sealRef, courtSealFile);
                courtSealUrl = await getDownloadURL(uploadResult.ref);
            }

            const finalData = {
                ...formData,
                courtSealUrl
            };

            console.log('finalData:', finalData);
    
            await adminCreateUser(finalData);
            Swal.close();
            
            // Swal.fire({
            //     icon: 'success',
            //     title: 'User Created Successfully',
            //     text: `${formData.fullName} has been added to the system.`,
            //     confirmButtonColor: '#0d6efd'
            // });

            navigate('/admin/users');

            // Reset form
            setFormData({
                fullName: '', email: '', password: '', confirmPassword: '',
                accountType: 'court-account', courtTitle: '', courtTitleLine2: '', courtState: ''
            });
            
            setCourtSealFile(null);
        } catch (err) {
            Swal.fire('Registration Failed', err.message, 'error');
        }
    };

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-7">
                    <div className="card shadow border-0">
                        <div className="card-body p-4">
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <h2 className="mb-0">Create New System User</h2>
                                <Link to="/admin" className="btn btn-sm btn-outline-secondary">Back to Dashboard</Link>
                            </div>
                            <form onSubmit={handleRegister}>
                                <div className="mb-3">
                                    <label className="form-label">Full Name</label>
                                    <input name="fullName" type="text" className="form-control" onChange={handleChange} required />
                                </div>
                                
                                <div className="mb-3">
                                    <label className="form-label">Email Address</label>
                                    <input name="email" type="email" className="form-control" onChange={handleChange} required />
                                </div>

                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Password</label>
                                        <input name="password" type="password" className="form-control" onChange={handleChange} required />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Confirm Password</label>
                                        <input name="confirmPassword" type="password" className="form-control" onChange={handleChange} required />
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Account Type</label>
                                    <select name="accountType" className="form-select" value={formData.accountType} onChange={handleChange} required>
                                        <option value="court-account">Court Account</option>
                                        {currentUser.accountType === 'super-admin' && 
                                            <option value="super-admin">Super Admin</option>
                                        }
                                        {currentUser.accountType === 'super-admin' && 
                                            <option value="limited-admin">Limited Admin</option>
                                        }
                                    </select>
                                </div>

                                { formData.accountType === 'court-account' && (
                                    <div className="animate__animated animate__fadeIn">
                                        <div className="row">
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label">Court Title (Line 1)</label>
                                                <input name="courtTitle" type="text" className="form-control" placeholder="e.g: High Court of Justice" onChange={handleChange} required />
                                            </div>
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label">Court Title (Line 2)</label>
                                                <input name="courtTitleLine2" type="text" className="form-control" placeholder="e.g: Federal Capital Territory" onChange={handleChange} />
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label">Court State</label>
                                                <select name="courtState" className="form-select" onChange={handleChange} required>
                                                    <option value="">Select State</option>
                                                    {nigerianStates.map(state => <option key={state} value={state}>{state}</option>)}
                                                </select>
                                            </div>
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label">Upload Court Seal</label>
                                                <input type="file" className="form-control" onChange={handleFileChange} accept="image/*" required/>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <button type="submit" className="btn btn-primary w-100 py-2 shadow-sm">
                                    Register Account
                                </button>
                            </form>
                            
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddUser;