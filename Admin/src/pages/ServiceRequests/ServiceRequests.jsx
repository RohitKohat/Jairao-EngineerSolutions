import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { FaUserCog } from 'react-icons/fa';
import api from '../../api/api';
import './ServiceRequests.css';

const ServiceRequests = () => {
  const [requests, setRequests] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    
    // Fetch Services
    try {
      const reqRes = await api.get('/api/admin/services');
      setRequests(reqRes.data || []);
    } catch (error) {
      console.error("Failed to fetch services:", error);
      // Shows the exact error from FastAPI, or the network error
      toast.error(`Error: ${error.response?.data?.detail || error.message}`);
    }

    // Fetch Technicians
    try {
      const techRes = await api.get('/api/admin/technicians?limit=100');
      setTechnicians(techRes.data.technicians || []);
    } catch (error) {
      console.error("Failed to fetch technicians:", error);
    } finally {
      // ✅ ALWAYS stops loading, even if API fails
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAssign = async (requestId, techId) => {
    if (!techId) return;
    try {
      await api.put(`/api/admin/services/${requestId}/assign`, {
        technician_id: Number(techId)
      });
      toast.success('Technician assigned successfully!');
      fetchData(); 
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to assign technician');
    }
  };

  const getStatusClass = (status) => {
    if (status === 'PENDING') return 'badge-pending';
    if (status === 'ASSIGNED' || status === 'IN_PROGRESS') return 'badge-shipped';
    if (status === 'COMPLETED' || status === 'PAID') return 'badge-completed';
    return 'badge-pending';
  };

  if (loading) return <p style={{ padding: 40, textAlign: 'center', color: 'white' }}>Loading service requests...</p>;

  return (
    <div className="admin-service-page">
      <div className="page-header">
        <h1>Customer Service Requests</h1>
        <p>Review incoming bookings and assign them to a technician</p>
      </div>

      <div className="table-container">
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Request Details</th>
                <th>Customer</th>
                <th>Preferred Date</th>
                <th>Status</th>
                <th>Assign Technician</th>
              </tr>
            </thead>
            <tbody>
              {requests.length === 0 ? (
                <tr><td colSpan={5} className="empty-state">No service requests found.</td></tr>
              ) : (
                requests.map((req) => (
                  <tr key={req.id}>
                    <td>
                      <div className="font-semibold" style={{ color: '#3b82f6' }}>{req.service_name}</div>
                      <div style={{ fontSize: 12, color: '#94a3b8' }}>#{req.request_number}</div>
                    </td>
                    <td>
                      <div className="font-semibold">{req.customer_name}</div>
                      <div style={{ fontSize: 12, color: '#94a3b8' }}>{req.phone}</div>
                    </td>
                    <td>
                      {req.preferred_date ? new Date(req.preferred_date).toLocaleDateString() : '—'}
                    </td>
                    <td>
                      <span className={`badge ${getStatusClass(req.status)}`}>
                        {req.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td>
                      <div className="assign-select-wrap">
                        <FaUserCog className="assign-icon" />
                        <select 
                          className="tech-select"
                          value={req.technician_id || ''}
                          onChange={(e) => handleAssign(req.id, e.target.value)}
                          disabled={req.status === 'COMPLETED'}
                        >
                          <option value="">-- Select Technician --</option>
                          {technicians.map(tech => (
                            <option key={tech.id} value={tech.id}>
                              {tech.name} ({tech.primary_skill || 'General'})
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ServiceRequests;