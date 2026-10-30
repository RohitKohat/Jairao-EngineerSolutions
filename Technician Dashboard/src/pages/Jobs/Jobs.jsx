import { useEffect, useState } from 'react';
import { FaClipboardList, FaPlay, FaCheckCircle, FaPlus } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../../api/api';
import './Jobs.css';

const Jobs = () => {
  const categories = ["Washing Machine", "Refrigerator", "AC", "Solar", "Water Purifier"];
  const subCategories = {
    "Washing Machine": ["No Drain", "Not Spinning", "Water Leakage"],
    "Refrigerator": ["No Cooling", "Gas Leak", "Compressor Issue"],
    "AC": ["No Cooling", "Gas Refill", "Fan Issue"],
  };
  const serviceRates = {
    "No Drain": 500, "Not Spinning": 600, "Water Leakage": 400,
    "No Cooling": 700, "Gas Leak": 800, "Compressor Issue": 900,
    "Gas Refill": 750, "Fan Issue": 550,
  };
  const sparePartsList = {
    "Washing Machine": [{ name: "Drain Pipe", rate: 150 }, { name: "Motor", rate: 1200 }],
    "Refrigerator": [{ name: "Thermostat", rate: 500 }, { name: "Compressor", rate: 3000 }],
    "AC": [{ name: "Coolant Gas", rate: 800 }, { name: "Fan Motor", rate: 1200 }],
  };
  const paymentMethods = ["Cash", "Online"];

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [service, setService] = useState({
    category: "", subCategory: "", rate: "", spareParts: [], paymentMethod: "",
  });

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const { data } = await api.get('/technician/jobs');
        setJobs(data.jobs || []);
      } catch {
        setJobs([
          { _id: 'j1', title: 'AC - No Cooling', customer: 'Alice Brown', price: 700, status: 'Pending' },
          { _id: 'j2', title: 'Refrigerator - Gas Leak', customer: 'Bob White', price: 800, status: 'Started' },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  const handleCategoryChange = (e) =>
    setService({ ...service, category: e.target.value, subCategory: "", rate: "", spareParts: [] });

  const handleSubCategoryChange = (e) => {
    const sub = e.target.value;
    setService({ ...service, subCategory: sub, rate: serviceRates[sub] || "" });
  };

  const handleSparePartsChange = (e) => {
    const parts = [...e.target.options].filter((o) => o.selected).map((o) => ({
      name: o.value,
      rate: sparePartsList[service.category].find((sp) => sp.name === o.value).rate,
    }));
    setService({ ...service, spareParts: parts });
  };

  const handleConfirm = async () => {
    if (!service.category || !service.subCategory || !service.rate || !service.paymentMethod) {
      return toast.error("Please fill all fields.");
    }
    const newService = {
      title: `${service.category} - ${service.subCategory}`,
      customer: "Walk-in Customer",
      price: service.rate + service.spareParts.reduce((a, p) => a + p.rate, 0),
      status: "Pending",
    };
    try {
      await api.post('/technician/jobs', newService);
    } catch { /* ignore */ }
    setJobs([newService, ...jobs]);
    toast.success("Service added!");
    setService({ category: "", subCategory: "", rate: "", spareParts: [], paymentMethod: "" });
  };

  const updateJobStatus = async (index, newStatus) => {
    const updated = [...jobs];
    updated[index].status = newStatus;
    setJobs(updated);
    toast.success(`Job marked as ${newStatus}!`);
    try {
      await api.put(`/technician/jobs/${updated[index]._id}/status`, { status: newStatus });
    } catch (err) { console.error(err); }
  };

  const formatCurrency = (n) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(n || 0);

  return (
    <div className="jobs-page">
      <div className="page-header">
        <h1>Active Jobs</h1>
        <p>Manage assigned jobs and create new service invoices</p>
      </div>

      <div className="table-container">
        <div className="table-header">
          <div className="table-title-wrap">
            <FaClipboardList className="table-title-icon" />
            <h2>Assigned Jobs</h2>
          </div>
        </div>
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Job</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="empty-state">Loading...</td></tr>
              ) : jobs.length === 0 ? (
                <tr><td colSpan={5} className="empty-state">No jobs assigned yet.</td></tr>
              ) : (
                jobs.map((job, index) => (
                  <tr key={job._id || index}>
                    <td className="font-semibold">{job.title}</td>
                    <td>{job.customer}</td>
                    <td className="text-green font-bold">{formatCurrency(job.price)}</td>
                    <td>
                      <span className={`badge badge-${job.status.toLowerCase()}`}>{job.status}</span>
                    </td>
                    <td>
                      {job.status === 'Pending' && (
                        <button className="btn-start" onClick={() => updateJobStatus(index, 'Started')}>
                          <FaPlay /> Start
                        </button>
                      )}
                      {job.status === 'Started' && (
                        <button className="btn-complete" onClick={() => updateJobStatus(index, 'Completed')}>
                          <FaCheckCircle /> Complete
                        </button>
                      )}
                      {job.status === 'Completed' && <span className="text-muted">Done</span>}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="table-container" style={{ marginTop: 24 }}>
        <div className="table-header">
          <div className="table-title-wrap">
            <FaPlus className="table-title-icon" />
            <h2>Create New Service</h2>
          </div>
        </div>
        <div className="job-form">
          <div className="form-row">
            <div className="form-field">
              <label>Category</label>
              <select onChange={handleCategoryChange} value={service.category}>
                <option value="">Select Category</option>
                {categories.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            {service.category && (
              <div className="form-field">
                <label>Service Type</label>
                <select onChange={handleSubCategoryChange} value={service.subCategory}>
                  <option value="">Select Service</option>
                  {subCategories[service.category].map((s) => (
                    <option key={s} value={s}>{s} (₹{serviceRates[s]})</option>
                  ))}
                </select>
              </div>
            )}
          </div>
          {service.category && sparePartsList[service.category] && (
            <div className="form-field">
              <label>Spare Parts (Ctrl/Cmd + click for multiple)</label>
              <select multiple onChange={handleSparePartsChange}>
                {sparePartsList[service.category].map((p) => (
                  <option key={p.name} value={p.name}>{p.name} (₹{p.rate})</option>
                ))}
              </select>
            </div>
          )}
          <div className="form-field">
            <label>Payment Method</label>
            <select onChange={(e) => setService({ ...service, paymentMethod: e.target.value })} value={service.paymentMethod}>
              <option value="">Select Payment</option>
              {paymentMethods.map((m) => <option key={m}>{m}</option>)}
            </select>
          </div>
          <button className="btn-confirm" onClick={handleConfirm}>
            <FaCheckCircle /> Confirm & Generate Invoice
          </button>
        </div>
      </div>
    </div>
  );
};

export default Jobs;