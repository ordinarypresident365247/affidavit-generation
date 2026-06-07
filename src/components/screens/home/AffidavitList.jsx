import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';
//import { getAffidavits } from '../../../utils/database'; // Assuming this exists
import { getAffidavitsByUserId } from '../../../utils/database'; 

import { useAuth } from '../../../contexts/authContext';

const AffidavitList = () => {
  const { currentUser } = useAuth();
  const [affidavits, setAffidavits] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search and Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCaseType, setFilterCaseType] = useState('all');

  useEffect(() => {
    const fetchAffidavits = async () => {
      try {
        const data = await getAffidavitsByUserId(currentUser.uid);
        setAffidavits(data);
      } catch (error) {
        Swal.fire('Error', 'Failed to load records', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchAffidavits();
  }, [currentUser.uid]);

  // Filter Logic
  const filteredData = affidavits.filter(item => {
    const searchStr = searchTerm.toLowerCase();
    const matchesSearch = 
      item.fullName?.toLowerCase().includes(searchStr) || 
      item.phoneNumber?.includes(searchStr) ||
      (item.affidavitIdentifier || item.affidavitCode)?.toLowerCase().includes(searchStr);
    
    const matchesType = filterCaseType === 'all' || item.caseType === filterCaseType;

    return matchesSearch && matchesType;
  });

  const caseTypes = [
    { value: 'change_of_name', label: 'Change of Name' },
    { value: 'loss_of_documents', label: 'Loss of Documents' },
    { value: 'age_declaration', label: 'Age Declaration' },
    { value: 'state_of_origin', label: 'State of Origin' },
    { value: 'others', label: 'Others' }
  ];

  const handlePrint = (id) => {
    const baseUrl = window.location.href.split('#')[0];
    const url = `${process.env.REACT_APP_TYPE === 'desktop' ? baseUrl+'#' : '' }/print/preview/${id}`;
    
    const windowName = "AffidavitPrintPreview";
    const windowFeatures = "width=900,height=1000,scrollbars=yes,resizable=yes";
    window.open(url, windowName, windowFeatures);
  };

  return (
    <div className="card shadow-sm border-0 p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="mb-0">Affidavit Records</h3>
        <Link to="/home/create" className="btn btn-primary btn-sm">
          <i className="bi bi-plus-lg me-1"></i> New Affidavit
        </Link>
      </div>

      {/* Filters Section */}
      <div className="row g-3 mb-4">
        <div className="col-md-7">
          <div className="input-group">
            <span className="input-group-text bg-white border-end-0">
              <i className="bi bi-search text-muted"></i>
            </span>
            <input 
              type="text" 
              className="form-control border-start-0" 
              placeholder="Search name, phone, or ID..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="col-md-5">
          <select 
            className="form-select" 
            value={filterCaseType} 
            onChange={(e) => setFilterCaseType(e.target.value)}
          >
            <option value="all">All Case Types</option>
            {caseTypes.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
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
              <th>Case Type</th>
              <th>Date Created</th>
              <th className="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" className="text-center py-5"><div className="spinner-border text-primary"></div></td></tr>
            ) : filteredData.length > 0 ? (
              filteredData.map((item) => (
                <tr key={item.id}>
                  <td>
                    <small className="fw-bold text-primary">
                      {item.affidavitIdentifier || item.affidavitCode}
                    </small>
                  </td>
                  <td>{item.fullName}</td>
                  <td>
                    <span className="badge bg-light text-dark border text-capitalize">
                      {item.caseType?.replace('_', ' ')}
                    </span>
                  </td>
                  <td>{item.createdAt?.toDate ? item.createdAt.toDate().toLocaleDateString() : 'N/A'}</td>
                  <td className="text-center">
                    <Link to={`/home/view/${item.id}`} className="btn btn-sm btn-outline-primary me-2">View</Link>
                    <button 
                      onClick={() => handlePrint(item.id)} 
                      className="btn btn-sm btn-outline-success"
                    >
                      Print
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center py-4 text-muted">
                  No records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AffidavitList;