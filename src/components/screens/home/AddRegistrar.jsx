import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { useAuth } from '../../../contexts/authContext';
import { saveRegistrarData } from '../../../utils/database';

const AddRegistrar = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [signaturePreview, setSignaturePreview] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    signature: null
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSignatureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSignaturePreview(URL.createObjectURL(file));
      setFormData(prev => ({ ...prev, signature: file }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.signature) {
      return Swal.fire('Missing Signature', 'Please upload a signature photo.', 'warning');
    }

    setIsSubmitting(true);
    try {
      await saveRegistrarData(currentUser.uid, formData);
      Swal.fire('Success', 'Registrar added successfully!', 'success');
      navigate('/home/registrars');
    } catch (err) {
      Swal.fire('Error', err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="card shadow-sm p-4 border-0">
      <h3>Add Registrar</h3>
      <form onSubmit={handleSubmit} className="mt-4">
        <div className="mb-3">
          <label className="form-label">Full Name</label>
          <input name="name" className="form-control" onChange={handleChange} required />
        </div>
        <div className="mb-3">
          <label className="form-label">Title/Designation</label>
          <input name="title" className="form-control" placeholder="e.g. Chief Registrar" onChange={handleChange} required />
        </div>
        <div className="mb-4">
          <label className="form-label">Signature (Upload)</label>
          <input type="file" className="form-control" accept="image/*" onChange={handleSignatureChange} required />
          {signaturePreview && <img src={signaturePreview} className="mt-2 img-thumbnail" style={{ height: '80px' }} />}
        </div>
        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save Registrar'}
        </button>
      </form>
    </div>
  );
};

export default AddRegistrar;