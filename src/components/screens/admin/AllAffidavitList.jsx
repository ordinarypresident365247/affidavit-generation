import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import { getAllAffidavits } from '../../../utils/database';

const AllAffidavitList = () => {
  const [affidavits, setAffidavits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCaseType, setFilterCaseType] = useState('all');
  const [filterCourtState, setFilterCourtState] = useState('all'); // Added state

  const nigerianStates = [
    "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno", 
    "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT", "Gombe", "Imo", 
    "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos", 
    "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", 
    "Sokoto", "Taraba", "Yobe", "Zamfara"
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await getAllAffidavits();
      setAffidavits(data);
    } catch (error) {
      Swal.fire('Error', 'Failed to load records', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filteredData = affidavits.filter(item => {
    const searchStr = searchTerm.toLowerCase();
    const matchesSearch = 
      item.fullName?.toLowerCase().includes(searchStr) || 
      item.courtTitle?.toLowerCase().includes(searchStr) ||
      (item.affidavitIdentifier || item.affidavitCode)?.toLowerCase().includes(searchStr);
    
    const matchesType = filterCaseType === 'all' || item.caseType === filterCaseType;
    const matchesState = filterCourtState === 'all' || item.courtState === filterCourtState; // Added logic

    return matchesSearch && matchesType && matchesState;
  });

  return (
    <div className="card shadow-sm border-0 p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3>All System Affidavits</h3>
        <button onClick={fetchData} className="btn btn-outline-primary btn-sm">
          <i className="bi bi-arrow-clockwise me-1"></i> Refresh
        </button>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="input-group">
            <span className="input-group-text bg-white border-end-0"><i className="bi bi-search text-muted"></i></span>
            <input 
              type="text" 
              className="form-control border-start-0" 
              placeholder="Search by Name, Court, or ID..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="col-md-4">
          <select className="form-select" value={filterCaseType} onChange={(e) => setFilterCaseType(e.target.value)}>
            <option value="all">All Case Types</option>
            <option value="change_of_name">Change of Name</option>
            <option value="loss_of_documents">Loss of Documents</option>
            <option value="age_declaration">Age Declaration</option>
            <option value="state_of_origin">State of Origin</option>
            <option value="others">Others</option>
          </select>
        </div>
        <div className="col-md-4">
          <select className="form-select" value={filterCourtState} onChange={(e) => setFilterCourtState(e.target.value)}>
            <option value="all">All States</option>
            {nigerianStates.map(state => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="table-responsive">
        <table className="table table-hover align-middle">
          <thead className="table-light">
            <tr>
              <th>ID</th>
              <th>Full Name</th>
              <th>Court / State</th>
              <th>Case Type</th>
              <th>Date Created</th>
              <th className="text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" className="text-center py-5"><div className="spinner-border text-primary"></div></td></tr>
            ) : filteredData.length > 0 ? (
              filteredData.map((item) => (
                <tr key={item.id}>
                  <td><small className="fw-bold text-primary">{item.affidavitIdentifier || item.affidavitCode}</small></td>
                  <td>{item.fullName}</td>
                  <td>
                    <div className="small fw-bold">{item.courtTitle}</div>
                    <div className="small text-muted">{item.courtState}</div>
                  </td>
                  <td><span className="badge bg-light text-dark border text-capitalize">{item.caseType?.replace('_', ' ')}</span></td>
                  <td>{item.createdAt?.toDate ? item.createdAt.toDate().toLocaleDateString() : 'N/A'}</td>
                  <td className="text-center">
                    <Link to={`/admin/view/${item.id}`} className="btn btn-sm btn-outline-primary">View</Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="6" className="text-center py-4 text-muted">No records found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="mt-2 text-muted small">
        Showing {filteredData.length} records
      </div>
    </div>
  );
};

export default AllAffidavitList;