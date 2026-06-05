import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { getAffidavitById, getUserById } from '../../../utils/database';
import { useAuth } from '../../../contexts/authContext';
import { useReactToPrint } from 'react-to-print';


const AffidavitPrintPreview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [creatorData, setCreatorData] = useState(null);
  const [loading, setLoading] = useState(true);

  const componentRef = useRef(null);

  // const handlePrint = () => {
  //   window.print();
  // };

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
  });

  // useEffect(() => {
  //   if (!loading && data) {
  //     // Small delay ensures images (QR, Seal) are rendered before print dialog
  //     setTimeout(() => {
  //       window.print();
  //     }, 1000);
  //   }
  // }, [loading, data]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getAffidavitById(id);
        setData(result);
        
        // Fetch court information using creatorId
        if (result.creatorId) {
          const userData = await getUserById(result.creatorId);
          setCreatorData(userData);
        }
      } catch (error) {
        Swal.fire('Error', 'Could not find the record', 'error');
        navigate('/home/list');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, navigate]);

  if (loading) return <div className="text-center mt-5"><div className="spinner-border"></div></div>;

  const date = data.createdAt?.toDate ? data.createdAt.toDate() : new Date();
  const day = date.getDate();
  const month = date.toLocaleString('default', { month: 'long' });
  const year = date.getFullYear();

  return (
    <>
      <div className="d-flex justify-content-center align-items-center mb-2 mt-2 no-print">
        <button className="btn btn-sm btn-outline-success" onClick={handlePrint}>
          <i className="bi bi-printer"></i> Print Affidavit
        </button>
      </div>

      <div ref={componentRef}>
        <style>
          {`
            @page {
              size: A4;
              margin: 0;
            }
            @media print {
              .no-print { display: none !important; }
              body { 
                background: white !important; 
                margin: 0 !important; 
                padding: 0 !important;
                -webkit-print-color-adjust: exact !important; 
                print-color-adjust: exact !important;  
              }
              .affidavit-container { 
                box-shadow: none !important; 
                border: none !important; 
                width: 100% !important; 
                height: 297mm !important;
                /*width: 210mm !important;*/ 
                max-width: 100% !important;
                margin: 0 !important;
                overflow: hidden;
              }
            }
            .affidavit-container {
              /*width: 210mm;*/
              width: 210mm;
              height: 297mm;
              margin: auto;
              background: white;
              position: relative;
              box-sizing: border-box;
              display: flex;
              flex-direction: column;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .affidavit-container::before {
              content: "";
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              width: 600px;
              height: 600px;
              background-image: url('${process.env.PUBLIC_URL}/favicon.png');
              background-repeat: no-repeat;
              background-position: center;
              background-size: contain;
              opacity: 0.18;
              z-index: 0;
              pointer-events: none;
            }
            .green-header {
              background-color: #1a4a1a;
              color: white;
              padding: 20px;
              display: flex;
              align-items: center;
              justify-content: space-between;
              border-bottom: 5px solid #d4af37 !important;
            }
            .maroon-header {
              background: radial-gradient(circle at center, #8e1b1b 0%, #4a0000 100%);
              color: white;
              padding: 20px;
              display: flex;
              align-items: center;
              justify-content: space-between;
              border-bottom: 5px solid #d4af37 !important;

            }
            .side-bar {
              position: absolute;
              left: 20px;
              top: 114px;
              bottom: 83px;
              width: 15px;
              border-left: 5px solid #800000 !important;
              border-right: 5px solid #800000 !important;
            }
            /*
            .side-bar {
              position: absolute;
              left: 20px;
              top: 114px;
              bottom: 83px;
              width: 15px;
              border-left: 5px solid #1a4a1a !important;
              border-right: 5px solid #1a4a1a !important;
            }
            */
            .affidavit-title {
              text-decoration: underline;
              font-weight: bold;
              text-align: center;
              margin: 40px 0 40px 40px;
              text-transform: uppercase;
              font-size: 18px;
            }
            .stamp-box {
              border: 2px solid #a52a2a !important;
              color: #a52a2a !important;
              padding: 5px 15px;
              text-align: center;
              font-size: 12px;
              font-weight: bold;
              display: inline-block;
            }
            .content-text {
              line-height: 1.8;
              text-align: justify;
              margin-left: 50px;
              margin-right: 30px;
              font-size: 12px;
              flex-grow: 1;
              font-weight: bold;

            }
            .footer-section {
              margin-left: 40px;
              margin-right: 20px;
              margin-bottom: 20px;
            }
            .seal-img {
              width: 100%;
            }
            .qr-box {
              font-size: 10px;
              text-align: center;
            }
          `}
        </style>

        <div className="affidavit-container shadow-lg">
          {/* Top Header */}
          <div className="maroon-header">
            {/* <img src="/fct-logo.png" alt="FCT Logo" style={{ height: '70px' }} /> */}
            
            <img src={`${process.env.PUBLIC_URL}/assets/logos/${data.courtState?.replace(' ', '-').toLowerCase()}.png`} alt={`${data.courtState} Logo`} style={{ height: '70px', borderRadius: "50%" }} />
            <div className="text-center">
              {/* <h1 className="m-0" style={{ fontSize: '38px', letterSpacing: '2px' }}>HIGH COURT OF JUSTICE</h1>
              <p className="m-0" style={{ fontSize: '14px', letterSpacing: '3px' }}>FEDERAL CAPITAL TERRITORY, ABUJA</p> */}
              <h1 className="m-0" style={{ fontSize: '38px', letterSpacing: '2px' }}>
                {creatorData?.courtTitle?.toUpperCase() || 'HIGH COURT OF JUSTICE'}
              </h1>
              <p className="m-0" style={{ fontSize: '14px', letterSpacing: '3px' }}>
                {`${creatorData?.courtTitleLine2?.toUpperCase()}, ${creatorData?.courtState?.toUpperCase()}`}
              </p>
            </div>
            
            <img src={`${process.env.PUBLIC_URL}/coat-of-arms.png`} alt="Coat of Arms" style={{ height: '70px', backgroundColor: "white", borderRadius: '50%' }} />
          </div>

          <div className="side-bar"></div>

          {/* Content Body */}
          <div className="px-4">

            <div className='row align-items-center' style={{ marginTop: "10px" }}>
              <div className='col-10' >
                <h5 className="affidavit-title">
                  AFFIDAVIT OF BREKETE FAMILY / HUMAN RIGHTS RADIO AND TELEVISION {/*data.caseType?.replace('_', ' ').toUpperCase()*/}
                </h5>
              </div>
              <div className='col-2'>
                { data.passportUrl ? (
                  <img src={data.passportUrl} alt="Passport" style={{ height: '100px', border: '1px solid #ccc', objectFit: 'cover' }} />
                ) : (
                  <div className="border rounded bg-light d-flex flex-column align-items-center justify-content-center shadow-sm" style={{ width: '100px', height: '100px' }}>
                    <i className="bi bi-person-bounding-box fs-2 text-muted"></i>
                    <small className="text-muted" style={{ fontSize: '10px' }}>No photo found</small>
                  </div>
                )}
              </div>
            </div>

            <div className="d-flex justify-content-end mt-2 mb-4">   
              <div className="stamp-box">
                {creatorData?.courtTitle || 'High Court of Justice'}<br/>
                {creatorData?.courtTitleLine2 || 'Federal Capital Territory'}
              </div>
            </div>

            <div className="content-text">
              <p>
                I, <strong>{data.fullName?.toUpperCase()}</strong>, {data.gender?.toUpperCase() || 'PERSON'}, NIGERIAN CITIZEN, RESIDING AT {data.address?.toUpperCase()}, DO HEREBY DECLARE ON OATH AND STATE AS FOLLOWS:
              </p>

              <ol>
                <li className="mb-3">THAT I AM THE ABOVE-NAMED PERSON AND THE DEPONENT HEREIN TO THIS AFFIDAVIT.</li>
                <li className="mb-3">THAT THE FACTS I SHALL PRESENT IN THIS DOCUMENT ARE TRUE AND CORRECT TO THE BEST OF MY KNOWLEDGE.</li>
                <li className="mb-3">THAT I SOLELY MAKE THIS DECLARATION AND I HEREBY ADOPT THE CONTENTS IN ITS ENTIRETY.</li>
                <li className="mb-3">THAT I SHALL BEAR/ INDEMNIFY THE COURT AND ANY RELEVANT PARTIES OF ANY COST OR DAMAGES THAT MIGHT ARISE FROM LITIGATION AGAINST THIRD PARTIES AS A RESULT OF MISINFORMATION/MISREPRESENTATION.</li>
                <li className="mb-3">THAT NO MONEY WAS PAID TO ANY UNAUTHORIZED AGENTS. I UNDERTAKE TO BE LIABLE FOR PROSECUTION IF THE SAID INFORMATION FACTS GIVEN ARE FALSE.</li>
                <li className="mb-3">THAT THIS MATTER IS NOT BEFORE ANY COURT OF COMPETENT JURISDICTION FOR ADJUDICATION. I MAKE THIS AFFIDAVIT IN GOOD FAITH AND FOR RECORD PURPOSES.</li>
                <li className="mb-3">THAT I DEPOSE TO THIS AFFIDAVIT IN GOOD FAITH CONSCIENTIOUSLY BELIEVING THAT SAME TO BE TRUE AND CORRECT IN ACCORDANCE WITH THE PROVISION OF THE OATH ACT.</li>
              </ol>

              <div className="row mt-4 mb-3 align-items-center">
                <div className="col-4">
                  <p className="mb-0">Sworn to at the {creatorData?.courtTitle || 'High Court of Justice'}</p>
                  <p className="mb-0">{`${creatorData?.courtTitleLine2}, ${creatorData?.courtState}`}</p>
                  {/* <p className="mb-0">Sworn to at the High Court of Justice</p>
                  <p className="mb-0">Maitama, Federal Capital Territory this <span className="text-decoration-underline">{day}th</span></p> */}
                  <p>This <span className="text-decoration-underline">{day}th</span> day of <span className="text-decoration-underline">{month}</span> {year}</p>
                </div>
                <div className="col-4 text-center">
                  <div className="border border-3 rounded border-dark p-2" style={{ fontSize: '11px', lineHeight: '1.2' }}>
                    
                    <label className="text-muted">{data.registrarTitle?.toUpperCase() || 'N/A'}</label>
                    <p className="mb-1 fw-bold">{data.registrarName || 'N/A'} </p>
                    {/* <small className="text-muted d-block mb-1 small fw-bold"></small> */}
                    {data.registrarSignatureUrl && (
                      <img src={data.registrarSignatureUrl} alt="Registrar Signature" style={{ height: '40px' }} />
                    )}
                  </div>
                </div>
                <div className="col-4 text-center">
                  <div className="d-flex align-items-center justify-content-center" style={{ height: '80px' }}>
                    {data.fingerprintUrl ? (
                      <img src={data.fingerprintUrl} alt="Fingerprint" style={{ maxHeight: '70px' }} />
                    ) : (
                      <div className="text-center text-muted">
                        <i className="bi bi-fingerprint fs-2 d-block text-primary opacity-50"></i>
                        <small style={{ fontSize: '10px' }}>No biometric data</small>
                      </div>
                    )}
                  </div>
                  <div className="border-top border-dark pt-1">
                    <strong>DEPONENT</strong>
                  </div>
                </div>
              </div>
              
            </div>

            {/* Footer Seals & QR */}
            <div className="footer-section">
              <div className="row align-items-center mx-0">
                <div className="col-4" style={{ padding: 0 }}>
                  <div className="row  align-items-center" >
                    <div className='col-4' style={{ padding: 0 }}>
                      <div className="qr-box">
                        <img 
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(process.env.REACT_APP_BASE_URL + '/verify/' + data.affidavitIdentifier)}`} 
                          alt="QR Code" 
                          style={{ width: '100%' }}
                        />
                        <div className="mt-1">
                          {/* <strong>{data.affidavitIdentifier}</strong><br/> */}
                          <small>SCAN TO VERIFY AFFIDAVIT</small>
                        </div>
                      </div>
                    </div>
                    <div className='col-8' style={{ padding: 0 }}>
                      <div className="text-center">
                          <small style={{ fontSize: 11 }}>AFFIDAVIT CODE</small><br/>
                          <strong style={{ fontSize: 13 }}>{data.affidavitIdentifier}</strong><br/>
                        </div>
                    </div>
                  </div>
                </div>
                
                <div className="col-6 text-center">
                  <div className="row  align-items-center" >
                    <div className='col-4' style={{ padding: 0 }}>
                      <div className="mb-2">
                        {data.commissionerSignatureUrl && (
                          <img src={data.commissionerSignatureUrl} alt="Commissioner Signature" style={{ height: '40px' }} />
                        )}
                      </div>
                      <strong style={{ fontSize: 13 }}>BEFORE ME</strong>
                    </div>
                    <div className='col-8'>
                      <div className="border border-3 rounded border-dark p-2" style={{ fontSize: '11px', lineHeight: '1.2' }}>
                        {data.commissionerTitle?.toUpperCase()}<br/>
                        COMMISSIONER FOR OATH<br/>
                        <strong>{ data.commissionerName?.toUpperCase() }</strong>
                      </div>
                    </div>
                  </div>
                
                </div>

                <div className="col-2 text-center position-relative" style={{ padding: 0 }}>
                  <img src={creatorData?.courtSealUrl} alt="Seal" className="seal-img" />
                  {/* <div className="position-absolute top-50 start-50 translate-middle text-danger fw-bold" style={{ fontSize: '12px', transform: 'rotate(-15deg)' }}>
                    SEAL<br/>FCT - ABUJA
                  </div> */}
                </div>
              </div>
            </div>

          </div>

          <div className="text-center pt-2 pb-2 border-top border-secondary border-3" style={{ borderTopColor: '#800000' }}>
            <small className="text-muted">
              Kindly scan QR code or visit <strong>{ process.env.REACT_APP_BASE_URL + '/verify' }</strong> to verify affidavit.
            </small>
            <p className="text-danger small mt-1"><i>~ Please note this affidavit cost N1,500.00 only</i></p>
          </div>
          
        </div>
      </div>
    </>
  );
};

export default AffidavitPrintPreview;