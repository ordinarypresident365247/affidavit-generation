import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getAffidavitByIdentifier } from '../../../utils/database';

const PublicVerifyAffidavit = () => {
  const { identifier } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const verifyRecord = async () => {
      try {
        const result = await getAffidavitByIdentifier(identifier);
        setData(result);
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    verifyRecord();
  }, [identifier]);

  // if (loading) return (
  //   <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
  //     <div className="text-center">
  //       <div className="spinner-border text-primary mb-3"></div>
  //       <p className="text-muted">Verifying authenticity...</p>
  //     </div>
  //   </div>
  // );

  if (loading) return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-white">
      <div className="text-center">
        <div className="spinner-grow text-primary mb-3" role="status" style={{ width: '3rem', height: '3rem' }}></div>
        <h4 className="fw-bold text-dark">Validating Document</h4>
        <p className="text-muted">Communicating with the Judiciary Secure Registry...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="container py-5 text-center">
      <div className="card shadow-sm border-0 p-5 mx-auto" style={{ maxWidth: '500px' }}>
        <i className="bi bi-exclamation-triangle text-danger display-1 mb-4"></i>
        <h2 className="fw-bold">Verification Failed</h2>
        <p className="text-muted">The record identifier <strong>{identifier}</strong> could not be found in our official registry.</p>
        <a href="/" className="btn btn-primary mt-3">Back to Portal</a>
      </div>
    </div>
  );

  return (
    <div className="bg-light min-vh-100 py-5">
      <div className="container" style={{ maxWidth: '700px' }}>
        <div className="text-center mb-4">
          <i className="bi bi-patch-check-fill text-success display-4"></i>
          <h2 className="fw-bold mt-2 text-uppercase">Verified Legal Document</h2>
          <span className="badge bg-success px-3 py-2">OFFICIAL RECORD FOUND</span>
        </div>

        <div className="card shadow border-0 overflow-hidden">
          <div className="card-header bg-white border-0 py-3 text-center border-bottom">
            <h5 className="mb-0 text-muted">Affidavit Identifier: <span className="text-dark">{data.affidavitIdentifier}</span></h5>
          </div>
          <div className="card-body p-4 p-md-5">
            <div className="row align-items-center mb-4">
              <div className="col-8">
                <h4 className="fw-bold mb-1">{data.fullName}</h4>
                <p className="text-muted mb-0">{data.address}</p>
                <p className="text-muted small">ID: {data.affidavitCode}</p>
              </div>
              <div className="col-4 text-end">
                {data.passportUrl && (
                  <img src={data.passportUrl} alt="Passport" className="img-thumbnail rounded" style={{ width: '100px' }} />
                )}
              </div>
            </div>

            <div className="row g-4 border-top pt-4">
              <div className="col-6">
                <label className="text-muted small d-block">CASE TYPE</label>
                <span className="fw-bold text-uppercase">{data.caseType?.replace('_', ' ')}</span>
              </div>
              <div className="col-6">
                <label className="text-muted small d-block">DATE ISSUED</label>
                <span className="fw-bold">{data.createdAt?.toDate?.().toLocaleDateString('en-GB')}</span>
              </div>
              <div className="col-6">
                <label className="text-muted small d-block">ISSUING COURT</label>
                <span className="fw-bold">{data.courtTitle}</span>
              </div>
              <div className="col-6">
                <label className="text-muted small d-block">REGION</label>
                <span className="fw-bold">{data.courtState}</span>
              </div>
            </div>

            <div className="mt-5 p-3 bg-light rounded text-center">
              <p className="small text-muted mb-0">
                This document is electronically verified by the Judiciary System. 
                Any alterations to the physical document not reflected here render it void.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicVerifyAffidavit;