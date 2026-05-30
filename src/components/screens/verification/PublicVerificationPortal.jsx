import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const PublicVerificationPortal = () => {
    const [identifier, setIdentifier] = useState('');
    const navigate = useNavigate();

    const handleVerify = (e) => {
        e.preventDefault();
        if (identifier.trim()) {
            navigate(`/verify/${identifier.trim()}`);
        }
    };

    return (
        <div className="min-vh-100 bg-white d-flex align-items-center">
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-md-6 text-center">
                        <div className="mb-4">
                            <i className="bi bi-shield-lock-fill text-primary" style={{ fontSize: '4rem' }}></i>
                        </div>
                        <h1 className="fw-bold mb-3">Document Verification</h1>
                        <p className="text-muted mb-5">
                            Enter the official <strong>Affidavit Identifier</strong> found on your document to verify its authenticity.
                        </p>
                        
                        <div className="card shadow-lg border-0 p-4 p-md-5 bg-light">
                            <form onSubmit={handleVerify}>
                                <div className="mb-4 text-start">
                                    <label className="form-label fw-bold small text-uppercase text-muted">Affidavit Identifier</label>
                                    <input 
                                        type="text" 
                                        className="form-control form-control-lg border-2" 
                                        placeholder="e.g. FCT-2026-000124"
                                        value={identifier}
                                        onChange={(e) => setIdentifier(e.target.value.toUpperCase())}
                                        required
                                        autoFocus
                                    />
                                    <div className="form-text mt-2">Format: STATE-YEAR-SERIAL (e.g., LA-2025-000001)</div>
                                </div>
                                <button type="submit" className="btn btn-primary btn-lg w-100 shadow-sm py-3 fw-bold">
                                    <i className="bi bi-search me-2"></i> Verify Now
                                </button>
                            </form>
                        </div>
                        
                        <div className="mt-5">
                            <a href="/" className="text-decoration-none text-muted small">
                                <i className="bi bi-arrow-left me-1"></i> Back to Login Portal
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PublicVerificationPortal;