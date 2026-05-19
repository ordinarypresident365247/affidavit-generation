import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { resetPassword } from '../../../utils/auth';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleReset = async (e) => {
        e.preventDefault();
        try {
            await resetPassword(email);
            setMessage('Check your inbox for further instructions.');
            setError('');
        } catch (err) {
            setError('Failed to reset password. Ensure the email is correct.');
            setMessage('');
        }
    };

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-4">
                    <div className="card shadow border-0">
                        <div className="card-body p-4">
                            <h2 className="text-center mb-4">Reset Password</h2>
                            {error && <div className="alert alert-danger">{error}</div>}
                            {message && <div className="alert alert-success">{message}</div>}
                            <form onSubmit={handleReset}>
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
                                <button type="submit" className="btn btn-primary w-100 mb-3">Send Reset Link</button>
                            </form>
                            <div className="text-center mt-3">
                                <Link to="/login" className="text-decoration-none">Back to Login</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;