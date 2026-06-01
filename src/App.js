import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/authContext';

import Login from './components/screens/auth/Login';
import ForgotPassword from './components/screens/auth/ForgotPassword';
import HomeTopNav from './components/screens/home/HomeTopNav';
import AdminTopNav from './components/screens/admin/AdminTopNav';
import Dashboard from './components/screens/home/Dashboard';
import CreateAffidavit from './components/screens/home/CreateAffidavit';
import AffidavitList from './components/screens/home/AffidavitList';
import ViewAffidavit from './components/screens/home/ViewAffidavit';
import AffidavitPrintPreview from './components/screens/home/AffidavitPrintPreview';
import AdminDashboard from './components/screens/admin/AdminDashboard';

import UsersList from './components/screens/admin/UsersList';
import AddUser from './components/screens/admin/AddUser';
import EditUser from './components/screens/admin/EditUser';
import AllAffidavitList from './components/screens/admin/AllAffidavitList';

import CommissionersList from './components/screens/home/CommissionersList';
import AddCommissioner from './components/screens/home/AddCommissioner';
import EditCommissioner from './components/screens/home/EditCommissioner';

import PublicVerifyAffidavit from './components/screens/verification/PublicVerifyAffidavit';
import PublicVerificationPortal from './components/screens/verification/PublicVerificationPortal';

// Redirect to /login if not authenticated
const PrivateRoute = ({ children }) => {
  const { userLoggedIn, loading } = useAuth();
  if (loading) return <div className="text-center mt-5">Loading...</div>;
  return userLoggedIn ? children : <Navigate to="/login" />;
};

// Protect admin routes: only super-admin or limited-admin
const AdminRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  if (loading) return <div className="text-center mt-5">Loading...</div>;
  
  const isAdmin = currentUser?.accountType === 'super-admin' || currentUser?.accountType === 'limited-admin';
  return isAdmin ? children : <Navigate to="/" />;
};

// Protect court routes: only court-account
const CourtRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  if (loading) return <div className="text-center mt-5">Loading...</div>;
  
  const isCourt = currentUser?.accountType === 'court-account';
  return isCourt ? children : <Navigate to="/" />;
};

// Role-based dispatcher for the base "/" route
const RoleRedirect = () => {
  const { currentUser } = useAuth();
  if (currentUser?.accountType === 'super-admin' || currentUser?.accountType === 'limited-admin') {
    return <Navigate to="/admin" />;
  }
  return <Navigate to="/home" />;
};

// Redirect to / if already authenticated (for Login/Register pages)
const AuthRoute = ({ children }) => {
  const { userLoggedIn, loading } = useAuth();
  if (loading) return <div className="text-center mt-5">Loading...</div>;
  return !userLoggedIn ? children : <Navigate to="/" />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-vh-100 bg-light">
          <Routes>
            {/* Public Verification Route */}
            <Route path="/verify" element={<PublicVerificationPortal />} />
            <Route path="/verify/:identifier" element={<PublicVerifyAffidavit />} />

            {/* Auth Routes */}
            <Route path="/login" element={<AuthRoute><Login /></AuthRoute>} />
            {/* <Route path="/register" element={<AuthRoute><Register /></AuthRoute>} /> */}
            <Route path="/forgot-password" element={<AuthRoute><ForgotPassword /></AuthRoute>} />

            {/* Root Dispatcher */}
            <Route path="/" element={<PrivateRoute><RoleRedirect /></PrivateRoute>} />

            {/* Admin Section (Restricted to Admins) */}
            <Route path="/admin" element={<AdminRoute><AdminTopNav /></AdminRoute>}>
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<UsersList />} />
              <Route path="add-user" element={<AddUser />} />
              <Route path="edit-user/:id" element={<EditUser />} />
              <Route path="affidavits" element={<AllAffidavitList />} />
              <Route path="view/:id" element={<ViewAffidavit />} /> {/* Reuse for admin view */}
            </Route>

            {/* Print Route (Standalone without Top Navigation) */}
            <Route path="/print/preview/:id" element={<PrivateRoute><AffidavitPrintPreview /></PrivateRoute>} />

            {/* Court Section (Restricted to Court Accounts) */}
            <Route path="/home" element={<CourtRoute><HomeTopNav /></CourtRoute>}>
              <Route index element={<Dashboard />} />
              <Route path="create" element={<CreateAffidavit />} />
              <Route path="list" element={<AffidavitList />} />
              <Route path="commissioners" element={<CommissionersList />} />
              <Route path="add-commissioner" element={<AddCommissioner />} />
              <Route path="edit-commissioner/:id" element={<EditCommissioner />} />
              <Route path="view/:id" element={<ViewAffidavit />} />
              {/* <Route path="print/preview/:id" element={<AffidavitPrintPreview />} /> */}
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;


// Official Gmail: 
// E-mail: ordinarypresident365247@gmail.com
// Paass: aliyu-ordinarypresident365247

// Official Repository Github: https://github.com/ordinarypresident365247/affidavit-generation