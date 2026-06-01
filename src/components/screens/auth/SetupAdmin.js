import React, { useState } from 'react';
import { registerWithEmailAndPassword } from '../../../utils/auth';

const SetupAdmin = () => {
    const [status, setStatus] = useState('');

    const handleSetup = async () => {
        try {
            setStatus('Processing...');
            // Change these values to your desired admin credentials
            await registerWithEmailAndPassword(
                "aliyu@gistoneer.com", 
                "aminu123!", 
                {
                    fullName: "System Administrator",
                    accountType: "super-admin",
                    courtTitle: "",
                    courtState: ""
                }
            );
            setStatus('Super-admin created successfully! Log in now and DELETE this route.');
        } catch (error) {
            setStatus(`Error: ${error.message}`);
        }
    };

    return (
        <div className="container mt-5 text-center">
            <div className="card p-4 shadow-sm mx-auto" style={{ maxWidth: '400px' }}>
                <h3>System Bootstrap</h3>
                <p className="text-muted">Click below to create the initial super-admin account.</p>
                <button className="btn btn-danger w-100" onClick={handleSetup}>
                    Create Super Admin
                </button>
                {status && <div className="alert alert-info mt-3">{status}</div>}
            </div>
        </div>
    );
};

export default SetupAdmin;