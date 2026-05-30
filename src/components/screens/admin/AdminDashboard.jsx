import React from 'react';
import { useAuth } from '../../../contexts/authContext';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const { currentUser } = useAuth();
  
  return (
    <div className="card shadow-sm p-5 text-center border-0">
      <h1 className="display-4 text-primary">Admin Dashboard</h1>
      <p className="lead mt-3 text-muted">
        System Overview for <strong>{currentUser?.fullName || currentUser?.displayName || currentUser?.email}</strong>
      </p>
      <div className="badge bg-danger mb-4 px-3 py-2 text-uppercase">
        {currentUser?.accountType?.replace('-', ' ')}
      </div>
      <hr className="my-4" />
      <div className="row g-4 text-start">
        <div className="col-md-6">
          <div className="card h-100 border-0 shadow-sm p-4">
            <h5 className="fw-bold"><i className="bi bi-people me-2 text-primary"></i>Manage Users</h5>
            <p className="text-muted small">Control system access and court accounts.</p>
            <div className="mt-auto d-grid gap-2">
                <Link to="/admin/users" className="btn btn-primary btn-sm">
                View User List
                </Link>
                <Link to="/admin/add-user" className="btn btn-outline-primary btn-sm">
                Add New User
                </Link>
            </div>
            </div>
        </div>
        <div className="col-md-6">
          <div className="card h-100 border-0 shadow-sm p-4">
            <h5 className="fw-bold">All Affidavits</h5>
            <p className="text-muted small">Monitor and audit all generated legal documents.</p>
            <Link to="/admin/affidavits" className="btn btn-outline-primary btn-sm mt-auto w-100">
                View All Records
            </Link>
          </div>
        </div>
        {/* <div className="col-md-4">
          <div className="card h-100 border-0 shadow-sm p-4">
            <h5 className="fw-bold">System Reports</h5>
            <p className="text-muted small">Generate analytics and activity logs.</p>
            <button className="btn btn-outline-primary btn-sm mt-auto w-100">Download Reports</button>
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default AdminDashboard;