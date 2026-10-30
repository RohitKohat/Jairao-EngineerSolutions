import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { 
  FaTools, FaClipboardList, FaWallet, FaHourglassHalf, 
  FaCheckCircle, FaPlay, FaPlus, FaRupeeSign 
} from 'react-icons/fa';
import './TechnicianDashboard.css';

const TechnicianDashboard = () => {
    const categories = ["Washing Machine", "Refrigerator", "AC", "Solar", "Water Purifier"];
    
    const subCategories = {
        "Washing Machine": ["No Drain", "Not Spinning", "Water Leakage"],
        "Refrigerator": ["No Cooling", "Gas Leak", "Compressor Issue"],
        "AC": ["No Cooling", "Gas Refill", "Fan Issue"]
    };

    const serviceRates = {
        "No Drain": 500, "Not Spinning": 600, "Water Leakage": 400,
        "No Cooling": 700, "Gas Leak": 800, "Compressor Issue": 900,
        "Gas Refill": 750, "Fan Issue": 550
    };

    const sparePartsList = {
        "Washing Machine": [{ name: "Drain Pipe", rate: 150 }, { name: "Motor", rate: 1200 }],
        "Refrigerator": [{ name: "Thermostat", rate: 500 }, { name: "Compressor", rate: 3000 }],
        "AC": [{ name: "Coolant Gas", rate: 800 }, { name: "Fan Motor", rate: 1200 }]
    };

    const paymentMethods = ["Cash", "Online"];

    // Mock technician wallet data
    const [wallet] = useState({
        availableBalance: 1200,
        pendingEscrow: 450,
        jobsCompleted: 24,
        totalEarnings: 8500,
    });

    const [service, setService] = useState({
        category: "", subCategory: "", rate: "",
        spareParts: [], paymentMethod: ""
    });

    // ✅ Mock assigned jobs (with customer info like real data)
    const [addedServices, setAddedServices] = useState([
        { title: "AC - No Cooling", customer: "Alice Brown", price: 700, status: "Pending" },
        { title: "Refrigerator - Gas Leak", customer: "Bob White", price: 800, status: "Started" },
    ]);

    const handleCategoryChange = (e) => {
        setService({ ...service, category: e.target.value, subCategory: "", rate: "", spareParts: [] });
    };

    const handleSubCategoryChange = (e) => {
        const selectedSubCategory = e.target.value;
        setService({ 
            ...service, 
            subCategory: selectedSubCategory, 
            rate: serviceRates[selectedSubCategory] || "" 
        });
    };

    const handleSparePartsChange = (e) => {
        const selectedParts = [...e.target.options].filter(option => option.selected).map(option => ({
            name: option.value,
            rate: sparePartsList[service.category].find(sp => sp.name === option.value).rate
        }));
        setService({ ...service, spareParts: selectedParts });
    };

    const handleConfirm = async () => {
        if (!service.category || !service.subCategory || !service.rate || !service.paymentMethod) {
            toast.error("Please fill all fields.");
            return;
        }

        const newService = {
            title: `${service.category} - ${service.subCategory}`,
            customer: "Walk-in Customer",
            price: service.rate + service.spareParts.reduce((acc, part) => acc + part.rate, 0),
            status: "Pending"
        };

        setAddedServices([...addedServices, newService]);
        toast.success("Service added and invoice generated!");

        try {
            const response = await axios.post("http://localhost:5000/api/invoice/generate", service);
            console.log("Invoice:", response.data.invoiceUrl);
        } catch (error) {
            console.error("Error generating invoice:", error);
        }

        // Reset form
        setService({ category: "", subCategory: "", rate: "", spareParts: [], paymentMethod: "" });
    };

    const updateServiceStatus = (index, newStatus) => {
        const updatedServices = [...addedServices];
        updatedServices[index].status = newStatus;
        setAddedServices(updatedServices);
        toast.success(`Job marked as ${newStatus}!`);
    };

    const formatCurrency = (amount) => 
        new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount || 0);

    return (
        <div className="tech-dashboard">
            {/* Header */}
            <div className="tech-page-header">
                <div className="tech-page-header-icon"><FaTools /></div>
                <div>
                    <h2>Technician Dashboard</h2>
                    <p>Manage your jobs, generate invoices, and track earnings</p>
                </div>
            </div>

            {/* ✅ Wallet / Earnings Stats */}
            <div className="tech-stats-grid">
                <div className="tech-stat-card">
                    <div className="stat-icon icon-green"><FaWallet /></div>
                    <div className="stat-info">
                        <p>Available Balance</p>
                        <h3>{formatCurrency(wallet.availableBalance)}</h3>
                    </div>
                </div>
                <div className="tech-stat-card">
                    <div className="stat-icon icon-yellow"><FaHourglassHalf /></div>
                    <div className="stat-info">
                        <p>Pending Escrow</p>
                        <h3>{formatCurrency(wallet.pendingEscrow)}</h3>
                    </div>
                </div>
                <div className="tech-stat-card">
                    <div className="stat-icon icon-blue"><FaCheckCircle /></div>
                    <div className="stat-info">
                        <p>Jobs Completed</p>
                        <h3>{wallet.jobsCompleted}</h3>
                    </div>
                </div>
                <div className="tech-stat-card">
                    <div className="stat-icon icon-purple"><FaRupeeSign /></div>
                    <div className="stat-info">
                        <p>Total Earnings</p>
                        <h3>{formatCurrency(wallet.totalEarnings)}</h3>
                    </div>
                </div>
            </div>

            {/* Assigned Services */}
            <div className="tech-card">
                <div className="tech-card-header">
                    <FaClipboardList className="tech-card-icon" />
                    <h3>Assigned Jobs</h3>
                </div>
                <div className="tech-jobs-list">
                    {addedServices.length === 0 ? (
                        <p className="tech-empty">No jobs assigned yet.</p>
                    ) : (
                        addedServices.map((job, index) => (
                            <div key={index} className="tech-job-item">
                                <div className="job-info">
                                    <h4>{job.title}</h4>
                                    <p className="job-customer">👤 {job.customer}</p>
                                    <p className="job-price">{formatCurrency(job.price)}</p>
                                </div>
                                <div className="job-status-actions">
                                    <span className={`tech-badge badge-${job.status.toLowerCase()}`}>
                                        {job.status}
                                    </span>
                                    <div className="job-buttons">
                                        {job.status === "Pending" && (
                                            <button className="btn-start" onClick={() => updateServiceStatus(index, "Started")}>
                                                <FaPlay /> Start
                                            </button>
                                        )}
                                        {job.status === "Started" && (
                                            <button className="btn-complete" onClick={() => updateServiceStatus(index, "Completed")}>
                                                <FaCheckCircle /> Complete
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* New Service Form */}
            <div className="tech-card">
                <div className="tech-card-header">
                    <FaPlus className="tech-card-icon" />
                    <h3>Create New Service / Invoice</h3>
                </div>
                <div className="tech-form">
                    <div className="form-row">
                        <div className="form-field">
                            <label>Category</label>
                            <select onChange={handleCategoryChange} value={service.category}>
                                <option value="">Select Category</option>
                                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                        </div>

                        {service.category && (
                            <div className="form-field">
                                <label>Service Type</label>
                                <select onChange={handleSubCategoryChange} value={service.subCategory}>
                                    <option value="">Select Service</option>
                                    {subCategories[service.category].map(sub => (
                                        <option key={sub} value={sub}>{sub} (₹{serviceRates[sub]})</option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>

                    {service.category && sparePartsList[service.category] && (
                        <div className="form-field">
                            <label>Spare Parts (Hold Ctrl/Cmd for multiple)</label>
                            <select multiple onChange={handleSparePartsChange}>
                                {sparePartsList[service.category].map(part => (
                                    <option key={part.name} value={part.name}>{part.name} (₹{part.rate})</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className="form-field">
                        <label>Payment Method</label>
                        <select 
                            onChange={(e) => setService({ ...service, paymentMethod: e.target.value })} 
                            value={service.paymentMethod}
                        >
                            <option value="">Select Payment</option>
                            {paymentMethods.map(method => <option key={method} value={method}>{method}</option>)}
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

export default TechnicianDashboard;