import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../contexts/authContext';

const Dashboard = () => {
  const { currentUser } = useAuth();
  return (
    <div className="card shadow-sm p-5 text-center border-0">
      <h1 className="display-4">Welcome</h1>
      <p className="lead mt-3 text-muted">
        Hello, <strong>{currentUser?.displayName || currentUser?.email}</strong>!
      </p>
      <hr className="my-4" />
      <p>Ready to generate your legal documents today?</p>
      <div className="d-grid gap-2 d-md-block mt-4">
        <Link to="/home/create" className="btn btn-primary btn-lg px-4 me-md-2">
          Get Started
        </Link>
        <Link to="/home/list" className="btn btn-outline-secondary btn-lg px-4">
          View History
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;