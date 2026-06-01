import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { useAuth } from '../../../contexts/authContext';
import { logout } from '../../../utils/auth';

const HomeTopNav = () => {
  const { currentUser } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };


  // // Now you can access:
  // console.log(currentUser.accountType); 
  // console.log(currentUser.fullName);
  // console.log(currentUser.courtTitle);
  // console.log(currentUser.email);

  return (
    <div>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm">
        <div className="container">
          <Link className="navbar-brand d-flex align-items-center" to="/">
            <i className="bi bi-file-earmark-text-fill me-2"></i>
            <span>AffidavitPro</span>
          </Link>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav me-auto">
              <li className="nav-item">
                <Link className="nav-link" to="/home/create">Create Affidavit</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/home/list">Affidavits Lists</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/home/commissioners">Commissioners</Link>
              </li>
            </ul>
            <div className="d-flex align-items-center">
              <span className="text-light me-3 small">{currentUser?.fullName}</span>
              <button onClick={handleLogout} className="btn btn-sm btn-outline-light">Logout</button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-10">
            {/* This is where the nested route content will appear */}
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeTopNav;