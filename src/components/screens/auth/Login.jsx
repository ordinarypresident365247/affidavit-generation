import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginWithEmailAndPassword, loginWithGoogle } from '../../../utils/auth';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            await loginWithEmailAndPassword(email, password);
            navigate('/');
        } catch (err) {
            setError('Failed to log in. Please check your credentials.');
        }
    };

    const handleGoogleLogin = async () => {
        try {
            await loginWithGoogle();
            navigate('/');
        } catch (err) {
            setError('Google login failed.');
        }
    };

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-4">
                    <div className="card shadow border-0">
                        <div className="card-body p-4">
                            <h2 className="text-center mb-4">Login</h2>
                            {error && <div className="alert alert-danger">{error}</div>}
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
                                <button type="submit" className="btn btn-primary w-100 mb-3">Login</button>
                            </form>
                            <button onClick={handleGoogleLogin} className="btn btn-outline-danger w-100 mb-3">
                                <i className="bi bi-google me-2"></i> Login with Google
                            </button>
                            <div className="text-center mt-3">
                                <Link to="/forgot-password text-decoration-none">Forgot Password?</Link>
                            </div>
                            <div className="text-center mt-2">
                                <span>Don't have an account? </span>
                                <Link to="/register" className="text-decoration-none">Register</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;