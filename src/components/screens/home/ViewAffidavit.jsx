import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { getAffidavitById } from '../../../utils/database';
import { useAuth } from '../../../contexts/authContext';

const ViewAffidavit = () => {
  const { id } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getAffidavitById(id);
        setData(result);
      } catch (error) {
        Swal.fire('Error', 'Could not find the record', 'error');
        navigate('/home/list');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, navigate]);

  const handlePrintNavigation = () => {
    // navigate(`/${currentUser.accountType === 'court-account' ? 'home/print/preview' : 'admin/print/preview' }/${id}`);
    const url = `/print/preview/${id}`;
    const windowName = "AffidavitPrintPreview";
    const windowFeatures = "width=900,height=1000,scrollbars=yes,resizable=yes";
    window.open(url, windowName, windowFeatures);
  };

  if (loading) return <div className="text-center mt-5"><div className="spinner-border"></div></div>;

  // Safe Date Formatting
  const formattedDate = data.createdAt?.toDate 
    ? data.createdAt.toDate().toLocaleString('en-GB', { 
        dateStyle: 'medium', 
        timeStyle: 'short' 
      }) 
    : 'N/A';

  return (
    <>
      <style>
        {`
          @media print {
            .no-print { display: none !important; }
            .card { border: none !important; box-shadow: none !important; }
            body { background: white !important; }
          }
        `}
      </style>

      <div className="card shadow-sm border-0 p-4">
        <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3 no-print">
          <div>
            <h3 className="mb-0">Affidavit Details</h3>
            <small className="text-muted">Record created on {formattedDate}</small>
          </div>
          <div>
            <button className="btn btn-primary btn-sm me-2" onClick={handlePrintNavigation}>
                <i className="bi bi-printer me-1"></i> Print / Preview
            </button>
            <button className="btn btn-outline-secondary btn-sm" onClick={() => navigate(`/${currentUser.accountType === 'court-account' ? 'home/list' : 'admin/affidavits' }`)}>
              <i className="bi bi-arrow-left me-1"></i> Back to List
            </button>
          </div>
        </div>

        {/* Header for Printed Version */}
        <div className="text-center mb-4 d-none d-print-block">
          <h2 className="text-uppercase fw-bold">Official Affidavit Record</h2>
          <p className="text-muted small">Generated on: {formattedDate}</p>
          <hr />
        </div>

        <div className="row g-4">
          {/* Unified Images Section (Sidebar) */}
          <div className="col-md-3 text-center border-end">
            <div className="d-flex flex-column align-items-center gap-4">
              {/* Passport Photo */}
              <div>
                <label className="text-muted small d-block mb-2 text-uppercase fw-bold">Passport</label>
                <div className="border rounded bg-light d-flex align-items-center justify-content-center shadow-sm" style={{ height: '130px', width: '130px', overflow: 'hidden' }}>
                  {data.passportUrl ? (
                    <img src={data.passportUrl} alt="Passport" className="img-fluid" style={{ minHeight: '100%', objectFit: 'cover' }} />
                  ) : (
                    
                    <div className="text-muted small">
                      <i className="bi bi-person-bounding-box fs-1 d-block mb-2"></i>
                      No photo found
                    </div>
                  )}
                </div>
              </div>

              {/* Fingerprint Scan */}
              <div>
                <label className="text-muted small d-block mb-2 text-uppercase fw-bold">Biometric</label>
                <div className="border rounded bg-light d-flex align-items-center justify-content-center shadow-sm" style={{ height: '130px', width: '130px', overflow: 'hidden' }}>
                  {data.fingerprintUrl ? (
                    <img src={data.fingerprintUrl} alt="Fingerprint" className="img-fluid p-2" style={{ maxHeight: '100%' }} />
                  ) : (
                    <div className="text-center text-muted">
                      <i className="bi bi-fingerprint fs-1 d-block mb-2 text-primary opacity-50"></i>
                      <span className="small">No biometric data</span>
                    </div>
                  )}
                </div>
              </div>

              {/* QR Verification Code */}
              <div>
                <label className="text-muted small d-block mb-2 text-uppercase fw-bold">Verification</label>
                <div className="border rounded bg-white d-flex align-items-center justify-content-center shadow-sm p-1" style={{ height: '130px', width: '130px' }}>
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(window.location.origin + '/verify/' + data.affidavitIdentifier)}`} 
                    alt="Verification QR" 
                    className="img-fluid"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Data Section */}
          <div className="col-md-9">
            <div className="row g-3">
              <div className="col-md-6">
                <label className="text-muted small">Full Name</label>
                <p className="fw-bold border-bottom pb-1">{data.fullName}</p>
              </div>
              <div className="col-md-6">
                <label className="text-muted small">Phone Number</label>
                <p className="fw-bold border-bottom pb-1">{data.phoneNumber}</p>
              </div>

              <div className="col-12">
                <label className="text-muted small">Residential Address</label>
                <p className="fw-bold border-bottom pb-1">{data.address}</p>
              </div>

              <div className="col-md-4">
                <label className="text-muted small">Gender</label>
                <p className="fw-bold border-bottom pb-1 text-capitalize">{data.gender}</p>
              </div>
              <div className="col-md-4">
                <label className="text-muted small">State of Origin</label>
                <p className="fw-bold border-bottom pb-1">{data.stateOfOrigin}</p>
              </div>
              <div className="col-md-4">
                <label className="text-muted small">LGA</label>
                <p className="fw-bold border-bottom pb-1">{data.lga}</p>
              </div>

              <div className="col-md-6">
                <label className="text-muted small">Family Name</label>
                <p className="fw-bold border-bottom pb-1">{data.familyName || "N/A"}</p>
              </div>
              <div className="col-md-6">
                <label className="text-muted small">Court Issued</label>
                <p className="fw-bold border-bottom pb-1 text-primary">
                    {data.courtTitle ? `${data.courtTitle} (${data.courtState})` : "Standard Court"}
                </p>
              </div>

              <div className="col-md-6">
                <label className="text-muted small">Father's Name & Village</label>
                <p className="fw-bold border-bottom pb-1">{data.fathersName} — {data.fathersVillage}</p>
              </div>
              <div className="col-md-6">
                <label className="text-muted small">Mother's Name & Village</label>
                <p className="fw-bold border-bottom pb-1">{data.mothersName} — {data.mothersVillage}</p>
              </div>

              <div className="col-md-6">
                <label className="text-muted small">Type of Case</label>
                <p className="fw-bold border-bottom pb-1 text-uppercase text-danger">{data.caseType?.replace('_', ' ')}</p>
              </div>
              {/* <div className="col-md-6">
                <label className="text-muted small">Affidavit Code</label>
                <p className="fw-bold"><code className="bg-light p-1 px-2 rounded text-dark border">{data.affidavitCode}</code></p>
              </div> */}

              <div className="col-md-6">
                <label className="text-muted small">Official Affidavit Identifier</label>
                <p className="fw-bold mb-0">
                  <code className="bg-light p-0 text-primary fs-5">
                    {data.affidavitIdentifier}
                  </code>
                </p>
              </div>

              <div className="col-md-12">
                <label className="text-muted small">Commissioner of Oaths</label>
                <p className="fw-bold mb-0">{data.commissionerName}</p>
                <small className="text-muted d-block mb-1">{data.commissionerTitle}</small>
                {data.commissionerSignatureUrl && (
                  <img src={data.commissionerSignatureUrl} alt="Commissioner Signature" style={{ height: '40px' }} />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer for Printed Version */}
        <div className="mt-5 pt-5 d-none d-print-block">
          <div className="row">
            <div className="col-6 text-center">
              <div className="border-top pt-2" style={{ width: '200px', margin: '0 auto' }}>Deponent Signature</div>
            </div>
            <div className="col-6 text-center">
              <div className="border-top pt-2" style={{ width: '200px', margin: '0 auto' }}>Commissioner for Oaths</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ViewAffidavit;