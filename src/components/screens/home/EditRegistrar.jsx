import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import { getRegistrarById, updateRegistrar } from '../../../utils/database';

const EditRegistrar = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [signaturePreview, setSignaturePreview] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    signature: null
  });

  useEffect(() => {
    const fetchRegistrar = async () => {
      try {
        const data = await getRegistrarById(id);
        setFormData({
          name: data.name,
          title: data.title,
          signature: data.signature 
        });
        setSignaturePreview(data.signature);
      } catch (err) {
        Swal.fire('Error', 'Failed to load registrar details.', 'error');
        navigate('/home/registrars');
      } finally {
        setLoading(false);
      }
    };
    fetchRegistrar();
  }, [id, navigate]);

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
    setIsSubmitting(true);
    try {
      await updateRegistrar(id, formData);
      Swal.fire('Success', 'Registrar updated successfully!', 'success');
      navigate('/home/registrars');
    } catch (err) {
      Swal.fire('Error', err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="p-4 text-center">Loading...</div>;

  return (
    <div className="card shadow-sm p-4 border-0">
      <h3>Edit Registrar</h3>
      <form onSubmit={handleSubmit} className="mt-4">
        <div className="mb-3">
          <label className="form-label">Full Name</label>
          <input 
            name="name" 
            className="form-control" 
            value={formData.name} 
            onChange={handleChange} 
            required 
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Title/Designation</label>
          <input 
            name="title" 
            className="form-control" 
            placeholder="e.g. Chief Registrar" 
            value={formData.title} 
            onChange={handleChange} 
            required 
          />
        </div>
        <div className="mb-4">
          <label className="form-label">Signature (Upload new to change)</label>
          <input 
            type="file" 
            className="form-control" 
            accept="image/*" 
            onChange={handleSignatureChange} 
          />
          {signaturePreview && (
            <div className="mt-2">
                <p className="small text-muted mb-1">Current/New Signature Preview:</p>
                <img src={signaturePreview} className="img-thumbnail" style={{ height: '80px' }} alt="signature preview" />
            </div>
          )}
        </div>
        <div className="d-flex gap-2">
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                {isSubmitting ? 'Updating...' : 'Update Registrar'}
            </button>
            <button type="button" className="btn btn-light" onClick={() => navigate('/home/registrars')}>
                Cancel
            </button>
        </div>
      </form>
    </div>
  );
};

export default EditRegistrar;