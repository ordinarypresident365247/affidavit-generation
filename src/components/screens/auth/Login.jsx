import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginWithEmailAndPassword, loginWithGoogle } from '../../../utils/auth';
import Swal from 'sweetalert2'; // Added import

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        
        Swal.fire({
            title: 'Authenticating...',
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading()
        });

        try {
            await loginWithEmailAndPassword(email, password);
            Swal.close();
            navigate('/');
        } catch (err) {
            Swal.fire({
                icon: 'error',
                title: 'Login Failed',
                text: 'Invalid email or password. Please try again.',
                confirmButtonColor: '#0d6efd'
            });
        }
    };

    // const handleGoogleLogin = async () => {
    //     Swal.fire({
    //         title: 'Connecting to Google...',
    //         allowOutsideClick: false,
    //         didOpen: () => Swal.showLoading()
    //     });

    //     try {
    //         await loginWithGoogle();
    //         Swal.close();
    //         navigate('/');
    //     } catch (err) {
    //         Swal.fire({
    //             icon: 'error',
    //             title: 'Google Login Failed',
    //             text: 'Could not authenticate with Google.',
    //             confirmButtonColor: '#0d6efd'
    //         });
    //     }
    // };

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-4">
                    <div className="card shadow border-0">
                        <div className="card-body p-4">
                            <h2 className="text-center mb-4">Login</h2>
                            <form onSubmit={handleLogin}>
                                <div className="mb-3">
                                    <label className="form-label">Email address</label>
                                    <input 
                                        type="email" 
                                        className="form-control" 
                                        value={email} 
                                        onChange={(e) => setEmail(e.target.value)} 
                                        required 
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Password</label>
                                    <input 
                                        type="password" 
                                        className="form-control" 
                                        value={password} 
                                        onChange={(e) => setPassword(e.target.value)} 
                                        required 
                                    />
                                </div>
                                <button type="submit" className="btn btn-primary w-100 mb-3 py-2 shadow-sm">Login</button>
                            </form>
                            
                            {/* <div className="position-relative my-4">
                                <hr />
                                <span className="position-absolute top-50 start-50 translate-middle bg-white px-2 text-muted small">OR</span>
                            </div>

                            <button onClick={handleGoogleLogin} className="btn btn-outline-danger w-100 mb-3">
                                <i className="bi bi-google me-2"></i> Login with Google
                            </button> */}
                            
                            <div className="text-center mt-3">
                                <Link to="/forgot-password" size="small" className="text-decoration-none">Forgot Password?</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;