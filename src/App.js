import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/authContext';

// import Login from './components/screens/auth/Login';
// import ForgotPassword from './components/screens/auth/ForgotPassword';
// import HomeTopNav from './components/screens/home/HomeTopNav';
// import AdminTopNav from './components/screens/admin/AdminTopNav';
// import Dashboard from './components/screens/home/Dashboard';
// import CreateAffidavit from './components/screens/home/CreateAffidavit';
// import AffidavitList from './components/screens/home/AffidavitList';
// import ViewAffidavit from './components/screens/home/ViewAffidavit';
// import AffidavitPrintPreview from './components/screens/home/AffidavitPrintPreview';
// import AdminDashboard from './components/screens/admin/AdminDashboard';

// import UsersList from './components/screens/admin/UsersList';
// import AddUser from './components/screens/admin/AddUser';
// import EditUser from './components/screens/admin/EditUser';
// import AllAffidavitList from './components/screens/admin/AllAffidavitList';

// import CommissionersList from './components/screens/home/CommissionersList';
// import AddCommissioner from './components/screens/home/AddCommissioner';
// import EditCommissioner from './components/screens/home/EditCommissioner';

// import PublicVerifyAffidavit from './components/screens/verification/PublicVerifyAffidavit';
// import PublicVerificationPortal from './components/screens/verification/PublicVerificationPortal';

// // import SetupAdmin from './components/screens/auth/SetupAdmin';

// import RegistrarsList from './components/screens/home/RegistrarsList';
// import AddRegistrar from './components/screens/home/AddRegistrar';
// import EditRegistrar from './components/screens/home/EditRegistrar'; // Assume this exists or will be created

// Lazy load components for code splitting
const Login = lazy(() => import('./components/screens/auth/Login'));
const ForgotPassword = lazy(() => import('./components/screens/auth/ForgotPassword'));
const HomeTopNav = lazy(() => import('./components/screens/home/HomeTopNav'));
const AdminTopNav = lazy(() => import('./components/screens/admin/AdminTopNav'));
const Dashboard = lazy(() => import('./components/screens/home/Dashboard'));
const CreateAffidavit = lazy(() => import('./components/screens/home/CreateAffidavit'));
const AffidavitList = lazy(() => import('./components/screens/home/AffidavitList'));
const ViewAffidavit = lazy(() => import('./components/screens/home/ViewAffidavit'));
const AffidavitPrintPreview = lazy(() => import('./components/screens/home/AffidavitPrintPreview'));
const AdminDashboard = lazy(() => import('./components/screens/admin/AdminDashboard'));

const UsersList = lazy(() => import('./components/screens/admin/UsersList'));
const AddUser = lazy(() => import('./components/screens/admin/AddUser'));
const EditUser = lazy(() => import('./components/screens/admin/EditUser'));
const AllAffidavitList = lazy(() => import('./components/screens/admin/AllAffidavitList'));

const CommissionersList = lazy(() => import('./components/screens/home/CommissionersList'));
const AddCommissioner = lazy(() => import('./components/screens/home/AddCommissioner'));
const EditCommissioner = lazy(() => import('./components/screens/home/EditCommissioner'));

const PublicVerifyAffidavit = lazy(() => import('./components/screens/verification/PublicVerifyAffidavit'));
const PublicVerificationPortal = lazy(() => import('./components/screens/verification/PublicVerificationPortal'));

//const SetupAdmin = lazy(() => import('./components/screens/auth/SetupAdmin'));

const RegistrarsList = lazy(() => import('./components/screens/home/RegistrarsList'));
const AddRegistrar = lazy(() => import('./components/screens/home/AddRegistrar'));
const EditRegistrar = lazy(() => import('./components/screens/home/EditRegistrar'));

const LoadingFallback = () => (
  <div className="d-flex justify-content-center align-items-center vh-100">
    <div className="spinner-border text-primary" role="status">
      <span className="visually-hidden">Loading...</span>
    </div>
  </div>
);

// Redirect to /login if not authenticated
const PrivateRoute = ({ children }) => {
  const { userLoggedIn, loading } = useAuth();
  if (loading) return <div className="text-center mt-5">Loading...</div>;
  return userLoggedIn ? children : <Navigate to="/login" />;
};

// Protect admin routes: only super-admin or limited-admin
const AdminRoute = ({ children }) => {
  const { currentUser, userLoggedIn, loading } = useAuth();
  if (loading) return <div className="text-center mt-5">Loading...</div>;
  
  if (!userLoggedIn) return <Navigate to="/login" />;

  const isAdmin = currentUser?.accountType === 'super-admin' || currentUser?.accountType === 'limited-admin';
  return isAdmin ? children : <Navigate to="/" />;
};

// Protect court routes: only court-account
// const CourtRoute = ({ children }) => {
//   const { currentUser, loading } = useAuth();
//   if (loading) return <div className="text-center mt-5">Loading...</div>;
  
//   const isCourt = currentUser?.accountType === 'court-account';
//   return isCourt ? children : <Navigate to="/" />;
// };

// Role-based dispatcher for the base "/" route
// const RoleRedirect = () => {
//   const { currentUser } = useAuth();
//   if (currentUser?.accountType === 'super-admin' || currentUser?.accountType === 'limited-admin') {
//     return <Navigate to="/admin" />;
//   }
//   return <Navigate to="/home" />;
// };

// Role-based dispatcher for the base "/" route
const RoleRedirect = () => {
  const { currentUser, loading } = useAuth();
  
  if (loading) return <div className="text-center mt-5">Loading...</div>;

  // Check for admin roles first
  if (currentUser?.accountType === 'super-admin' || currentUser?.accountType === 'limited-admin') {
    return <Navigate to="/admin" replace />;
  }
  
  // If they are a court account, go to home
  if (currentUser?.accountType === 'court-account') {
    return <Navigate to="/home" replace />;
  }

  // If no role matches, DO NOT redirect back to /home to avoid loops.
  // Instead, show a "No Access" message or a default landing.
  return (
    <div className="container mt-5 text-center">
      <div className="alert alert-warning">
        <h4>Access Denied</h4>
        <p>Your account type (<strong>{currentUser?.accountType || 'None'}</strong>) is not recognized. Please contact an administrator.</p>
        <button className="btn btn-primary" onClick={() => window.location.href = '/login'}>Back to Login</button>
      </div>
    </div>
  );
};

// Update CourtRoute to prevent bouncing to / if the user is already authenticated
const CourtRoute = ({ children }) => {
  const { currentUser, userLoggedIn, loading } = useAuth();
  if (loading) return <div className="text-center mt-5">Loading...</div>;
  
  if (!userLoggedIn) return <Navigate to="/login" />;

  const isCourt = currentUser?.accountType === 'court-account';
  // If not court, show an error instead of redirecting to / (which might redirect back here)
  return isCourt ? children : <div className="text-center mt-5">Access Denied: Court Personnel Only</div>;
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
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              {/* Public Verification Route */}
              <Route path="/verify" element={<PublicVerificationPortal />} />
              <Route path="/verify/:identifier" element={<PublicVerifyAffidavit />} />

              {/* <Route path="/setup-initial-admin-xyz" element={<SetupAdmin />} /> */}

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
                <Route path="view/:id" element={<ViewAffidavit />} />
                <Route path="commissioners" element={<CommissionersList />} />
                <Route path="add-commissioner" element={<AddCommissioner />} />
                <Route path="edit-commissioner/:id" element={<EditCommissioner />} />

                <Route path="registrars" element={<RegistrarsList />} />
                <Route path="add-registrar" element={<AddRegistrar />} />
                <Route path="edit-registrar/:id" element={<EditRegistrar />} />
              </Route>

              {/* Catch-all */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </Suspense>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;


// Official Gmail: 
// E-mail: ordinarypresident365247@gmail.com
// Paass: aliyu-ordinarypresident365247

// I used Logged in with G-mail:
// Official Repository Github: https://github.com/ordinarypresident365247/affidavit-generation

// Godady hosting: https://www.godaddy.com/hosting
// Domain name registered: https://affidavit.pro
// E-mail: ordinarypresident365247@gmail.com
// Paass: aliyu-ordinarypresident365247