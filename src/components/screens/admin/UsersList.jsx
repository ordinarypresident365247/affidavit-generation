import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { useAuth } from '../../../contexts/authContext'; // Added useAuth
import { getAllUsers, deleteUser } from '../../../utils/database';

const UsersList = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth(); // Access currentUser
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await getAllUsers();
      setUsers(data);
    } catch (error) {
      Swal.fire('Error', 'Failed to fetch users', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `You are about to delete ${userName}. This action cannot be undone!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        await deleteUser(userId);
        Swal.fire('Deleted!', 'User has been removed.', 'success');
        fetchUsers(); // Refresh list
      } catch (error) {
        Swal.fire('Error', 'Failed to delete user.', 'error');
      }
    }
  };

  // Filter Logic with Account Type Restriction
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Check if current user is limited admin
    const isLimitedAdmin = currentUser?.accountType === 'limited-admin';
    
    // If limited admin, they can ONLY see court-accounts
    const matchesRole = isLimitedAdmin 
      ? user.accountType === 'court-account' 
      : (filterRole === 'all' || user.accountType === filterRole);

    return matchesSearch && matchesRole;
  });

  return (
    <div className="card shadow-sm border-0 p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3>System Users</h3>
        <Link to="/admin/add-user" className="btn btn-primary btn-sm">
          <i className="bi bi-person-plus me-1"></i> Add New User
        </Link>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-md-8">
          <div className="input-group">
            <span className="input-group-text bg-white border-end-0">
              <i className="bi bi-search text-muted"></i>
            </span>
            <input 
              type="text" 
              className="form-control border-start-0" 
              placeholder="Search by name or email..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="col-md-4">
          <select 
            className="form-select" 
            value={filterRole} 
            onChange={(e) => setFilterRole(e.target.value)}
            disabled={currentUser?.accountType === 'limited-admin'} // Disable for limited admins
          >
            {currentUser?.accountType === 'limited-admin' ? (
              <option value="court-account">Court Accounts (Restricted)</option>
            ) : (
              <>
                <option value="all">All Roles</option>
                <option value="super-admin">Super Admin</option>
                <option value="limited-admin">Limited Admin</option>
                <option value="court-account">Court Account</option>
              </>
            )}
          </select>
        </div>
      </div>

      <div className="table-responsive">
        <table className="table table-hover align-middle">
          <thead className="table-light">
            <tr>
              <th>Full Name</th>
              <th>Email</th>
              <th>Account Type</th>
              <th>Court Info</th>
              <th>Created At</th>
              <th className="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" className="text-center py-5"><div className="spinner-border text-primary"></div></td></tr>
            ) : filteredUsers.length > 0 ? (
              filteredUsers.map(user => (
                <tr key={user.id}>
                  <td>{user.fullName}</td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`badge ${user.accountType === 'super-admin' ? 'bg-danger' : user.accountType === 'limited-admin' ? 'bg-warning text-dark' : 'bg-info text-dark'}`}>
                      {user.accountType?.replace('-', ' ')}
                    </span>
                  </td>
                  <td>{user.accountType === 'court-account' ? `${user.courtTitle || 'N/A'} (${user.courtState || 'N/A'})` : <span className="text-muted small">N/A</span>}</td>
                  <td>{user.createdAt?.toDate ? user.createdAt.toDate().toLocaleDateString() : 'N/A'}</td>
                  <td className="text-center">
                    <Link to={`/admin/edit-user/${user.id}`} className="btn btn-sm btn-outline-secondary me-1" title="Edit User">
                      <i className="bi bi-pencil"></i>
                    </Link>
                    {/* Only super-admins can delete */}
                    {currentUser?.accountType === 'super-admin' && (
                      <button 
                        className="btn btn-sm btn-outline-danger" 
                        title="Delete User"
                        onClick={() => handleDeleteUser(user.id, user.fullName)}
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center py-4 text-muted">
                  No users found matching your criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      <div className="mt-2 text-muted small">
        Showing {filteredUsers.length} users
      </div>
    </div>
  );
};

export default UsersList;