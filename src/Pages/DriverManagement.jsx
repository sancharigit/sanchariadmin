import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    Search, Filter, MoreVertical, Ban, CheckCircle, Clock,
    MapPin, DollarSign, FileText, User, ChevronDown, Download,
    Plus, AlertTriangle, Star, X, Eye, ThumbsUp, ThumbsDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion'; // eslint-disable-line no-unused-vars
import axios from 'axios';

// --- Mock Data ---

// API configuration removed in favor of environment variables

const mockRides = [
    { id: 'R-201', passenger: 'Rachel Zane', driver: 'Mike Ross', date: '2025-02-10', time: '10:00', from: 'Court House', to: 'Firm', amount: 15.00, status: 'completed' },
    { id: 'R-202', passenger: 'Jessica Pearson', driver: 'Harvey Specter', date: '2025-02-09', time: '14:30', from: 'Firm', to: 'Restaurant', amount: 25.00, status: 'completed' },
    { id: 'R-203', passenger: 'Sheila Sazs', driver: 'Louis Litt', date: '2025-02-08', time: '18:00', from: 'Harvard', to: 'Hotel', amount: 10.00, status: 'cancelled' },
    { id: 'R-204', passenger: 'Trevor Evans', driver: 'Mike Ross', date: '2025-02-07', time: '09:00', from: 'Apartment', to: 'Office', amount: 12.00, status: 'completed' },
    { id: 'R-205', passenger: 'Scottie', driver: 'Harvey Specter', date: '2025-02-06', time: '20:00', from: 'Airport', to: 'Penthouse', amount: 45.00, status: 'cancelled' },
];

const earningsData = [
    { id: 1, driver: 'Mike Ross', daily: 150.00, weekly: 850.00, monthly: 3200.00, rating: 4.9, rides: 124 },
    { id: 2, driver: 'Harvey Specter', daily: 450.00, weekly: 2800.00, monthly: 11500.00, rating: 5.0, rides: 89 },
    { id: 3, driver: 'Louis Litt', daily: 45.00, weekly: 200.00, monthly: 800.00, rating: 4.1, rides: 22 },
];

const complaintsData = [
    { id: 'C-001', driver: 'Louis Litt', passenger: 'Alice Johnson', date: '2025-02-05', issue: 'Rude behavior', status: 'pending' },
    { id: 'C-002', driver: 'Mike Ross', passenger: 'Bob Brown', date: '2025-01-20', issue: 'Late arrival', status: 'resolved' },
];

// --- Components ---

const Modal = ({ isOpen, onClose, title, children }) => (
    <AnimatePresence>
        {isOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col"
                >
                    <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                        <h3 className="text-lg font-bold text-slate-900">{title}</h3>
                        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                            <X size={20} />
                        </button>
                    </div>
                    <div className="p-6 overflow-y-auto">
                        {children}
                    </div>
                </motion.div>
            </div>
        )}
    </AnimatePresence>
);

const DriverManagement = ({ view = 'directory' }) => {
    const [drivers, setDrivers] = useState([]);
    const [onboardingList, setOnboardingList] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterVehicleType, setFilterVehicleType] = useState('all');

    // Modals & Selection State
    const [isAddDriverModalOpen, setIsAddDriverModalOpen] = useState(false);
    const [isDocModalOpen, setIsDocModalOpen] = useState(false);
    const [selectedApplicant, setSelectedApplicant] = useState(null);
    const [selectedDriver, setSelectedDriver] = useState(null);
    const [driverRides, setDriverRides] = useState([]);
    const [viewingImage, setViewingImage] = useState(null);
    const [selectedDriverDocs, setSelectedDriverDocs] = useState({});
    const [isLoadingDocs, setIsLoadingDocs] = useState(false);

    // Fetch Drivers
    React.useEffect(() => {
        fetchDrivers();
    }, []);

    const fetchDrivers = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/admin/drivers`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.data.success) {
                // Transform data for UI
                const allDrivers = res.data.data.map(d => ({
                    id: d._id,
                    name: d.name,
                    phone: d.phone,
                    email: d.email,
                    status: d.driverApprovalStatus === 'approved' ? 'active' : (d.driverApprovalStatus === 'rejected' ? 'rejected' : 'pending'),
                    rejectionReason: d.rejectionReason,
                    vehicleMake: d.driverDetails?.vehicle?.make || '',
                    vehicleModel: d.driverDetails?.vehicle?.model || 'Pending',
                    vehicle: `${d.driverDetails?.vehicle?.make || ''} ${d.driverDetails?.vehicle?.model || ''}`.trim() || 'Pending',
                    vehicleType: d.driverDetails?.vehicle?.type || 'CAR',
                    plateNumber: d.driverDetails?.vehicle?.plateNumber || 'N/A',
                    joinDate: new Date(d.createdAt).toLocaleDateString(),
                    address: 'Location Pending',
                    rating: d.ratings?.average || d.driverDetails?.ratings?.average || 5.0,
                    totalEarnings: d.driverDetails?.earnings || 0,
                    avatar: d.profileImage ? (() => {
                        if (d.profileImage.startsWith('http')) return d.profileImage;
                        const baseUrl = import.meta.env.VITE_API_BASE_URL.replace(/\/$/, '');
                        const filePath = d.profileImage.startsWith('/') ? d.profileImage : `/${d.profileImage}`;
                        return `${baseUrl}${filePath}`;
                    })() : `https://ui-avatars.com/api/?name=${d.name}&background=random`,
                    driverDetails: d.driverDetails,
                    documents: d.driverDetails?.documents ? Object.fromEntries(
                        Object.entries(d.driverDetails.documents).map(([k, v]) => {
                            if (v.startsWith('http')) return [k, v];
                            const baseUrl = import.meta.env.VITE_API_BASE_URL.replace(/\/$/, '');
                            const filePath = v.startsWith('/') ? v : `/${v}`;
                            return [k, `${baseUrl}${filePath}`];
                        })
                    ) : {}
                }));

                setDrivers(allDrivers.filter(d => d.status === 'active' || d.status === 'blocked'));
                setOnboardingList(allDrivers.filter(d => d.status === 'pending' || d.status === 'rejected'));
            }
        } catch (error) {
            console.error("Failed to fetch drivers", error);
        } finally {
            // setIsLoading(false);
        }
    };

    const fetchDriverRides = async (driverId) => {
        try {
            const token = localStorage.getItem('adminToken');
            const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/admin/drivers/${driverId}/rides`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                setDriverRides(res.data.data);
            }
        } catch (error) {
            console.error("Failed to fetch driver rides", error);
            setDriverRides([]);
        }
    };

    const fetchDriverDocuments = async (driverId) => {
        setIsLoadingDocs(true);
        try {
            const token = localStorage.getItem('adminToken');
            const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/admin/drivers/${driverId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                const rawDocs = res.data.data?.driverDetails?.documents || {};
                const mappedDocs = Object.fromEntries(
                    Object.entries(rawDocs).map(([k, v]) => {
                        if (!v) return [k, v];
                        if (v.startsWith('http')) return [k, v];
                        const baseUrl = import.meta.env.VITE_API_BASE_URL.replace(/\/$/, '');
                        const filePath = v.startsWith('/') ? v : `/${v}`;
                        return [k, `${baseUrl}${filePath}`];
                    })
                );
                setSelectedDriverDocs(mappedDocs);
            }
        } catch (error) {
            console.error("Failed to fetch driver documents", error);
            setSelectedDriverDocs({});
        } finally {
            setIsLoadingDocs(false);
        }
    };

    React.useEffect(() => {
        if (selectedDriver) {
            fetchDriverRides(selectedDriver.id);
            fetchDriverDocuments(selectedDriver.id);
        } else {
            setDriverRides([]);
            setSelectedDriverDocs({});
        }
    }, [selectedDriver]);

    // Filter Logic
    const filteredDrivers = drivers.filter(d => {
        const query = searchQuery.toLowerCase();
        const matchesSearch = (d.name || '').toLowerCase().includes(query) || (d.phone || '').includes(searchQuery);
        const matchesStatus = filterStatus === 'all' || d.status === filterStatus;
        const matchesVehicleType = filterVehicleType === 'all' || (d.vehicleType || '').toUpperCase() === filterVehicleType.toUpperCase();
        return matchesSearch && matchesStatus && matchesVehicleType;
    });

    // --- Actions ---

    const toggleDriverStatus = (/* id */) => {
        // Placeholder for blocking logic
        alert("Blocking/Unblocking not implemented in backend yet.");
    };

    const handleApprove = async (id) => {
        try {
            const token = localStorage.getItem('adminToken');
            const res = await axios.put(`${import.meta.env.VITE_API_BASE_URL}/api/admin/drivers/${id}/verify`, { action: 'approve' }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.data.success) {
                // Refresh list
                fetchDrivers();
                setIsDocModalOpen(false);
            }
        } catch (error) {
            console.error(error);
            alert("Approval failed");
        }
    };

    const handleReject = async (id) => {
        const reason = prompt("Enter a reason for rejection:", "Missing or unclear documents.");
        if (reason === null) return; // Cancelled

        try {
            const token = localStorage.getItem('adminToken');
            const res = await axios.put(`${import.meta.env.VITE_API_BASE_URL}/api/admin/drivers/${id}/verify`,
                { action: 'reject', rejectionReason: reason },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (res.data.success) {
                // Refresh list
                fetchDrivers();
                setIsDocModalOpen(false);
            }
        } catch (error) {
            console.error(error);
            alert("Rejection failed");
        }
    };

    // --- Actions ---

    // Replaced by API calls above

    const handleAddDriver = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const newDriver = {
            id: drivers.length + 1,
            name: formData.get('name'),
            phone: formData.get('phone'),
            email: formData.get('email'),
            status: 'active',
            vehicle: formData.get('vehicle'),
            rating: 5.0,
            totalEarnings: 0,
            joinDate: new Date().toISOString().split('T')[0],
            address: 'Address Pending',
            avatar: `https://ui-avatars.com/api/?name=${formData.get('name')}&background=random`,
            documents: { /* Placeholder docs for manually added */ }
        };
        setDrivers([...drivers, newDriver]);
        setIsAddDriverModalOpen(false);
    };

    // --- Render Functions ---

    // const handleViewDetails = (/* id */) => { ... }; // Removed as unused

    const renderDriverDetails = () => {
        const d = selectedDriver;
        const completedRides = driverRides.filter(r => r.status === 'completed');
        const cancelledRides = driverRides.filter(r => r.status === 'cancelled');

        return (
            <div className="space-y-6">
                <button
                    onClick={() => setSelectedDriver(null)}
                    className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors font-medium"
                >
                    <ChevronDown className="rotate-90" size={20} /> Back to Directory
                </button>

                {/* Profile Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                    <div className="flex flex-col md:flex-row gap-6 items-start">
                        <div className="h-32 w-32 rounded-full border-4 border-slate-100 overflow-hidden flex-shrink-0 cursor-pointer hover:border-blue-200 transition-colors" onClick={() => setViewingImage({ url: d.avatar, title: `${d.name}'s Profile` })}>
                            <img src={d.avatar} alt={d.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 space-y-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-900">{d.name}</h2>
                                    <div className="flex items-center gap-2 mt-1">
                                        <div className={`px-2 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1 border ${d.status === 'active' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-rose-100 text-rose-700 border-rose-200'}`}>
                                            {d.status === 'active' ? <CheckCircle size={10} /> : <Ban size={10} />} {d.status}
                                        </div>
                                        <span className="text-sm text-slate-500">• Joined {d.joinDate}</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-lg font-bold text-slate-900">{d.rating} ⭐</div>
                                    <div className="text-sm text-slate-500">Total Earnings: ₹{d.totalEarnings}</div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-slate-50 rounded-lg text-slate-500"><User size={18} /></div>
                                    <div>
                                        <p className="text-xs text-slate-500">Contact</p>
                                        <p className="text-sm font-medium text-slate-900">{d.phone}</p>
                                        <p className="text-sm text-slate-600">{d.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-slate-50 rounded-lg text-slate-500"><MapPin size={18} /></div>
                                    <div>
                                        <p className="text-xs text-slate-500">Address</p>
                                        <p className="text-sm font-medium text-slate-900">{d.address}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-slate-50 rounded-lg text-slate-500"><div className="w-4 h-4 rounded-full border-2 border-slate-400"></div></div>
                                    <div>
                                        <p className="text-xs text-slate-500">Vehicle</p>
                                        <p className="text-sm font-medium text-slate-900">
                                            {d.vehicleMake && <span className="mr-1">{d.vehicleMake}</span>}
                                            {d.vehicleModel} ({d.vehicleType})
                                        </p>
                                        <p className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 mt-1 inline-block">
                                            {d.plateNumber}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Documents Section */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                    <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><FileText size={18} className="text-blue-500" /> Verified Documents</h3>
                    {isLoadingDocs ? (
                        <div className="text-center py-8 text-slate-500">
                            Loading documents...
                        </div>
                    ) : Object.keys(selectedDriverDocs).length === 0 ? (
                        <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-slate-500 text-sm">
                            No documents uploaded yet.
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                            {Object.entries(selectedDriverDocs).map(([key, url]) => (
                                <div key={key} className="group cursor-pointer" onClick={() => setViewingImage({ url, title: key.replace(/([A-Z])/g, ' $1').trim() })}>
                                    <div className="aspect-video bg-slate-100 rounded-lg overflow-hidden border border-slate-200 mb-2 relative">
                                        <img src={url} alt={key} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                            <Eye className="text-white opacity-0 group-hover:opacity-100 drop-shadow-md" size={32} />
                                        </div>
                                    </div>
                                    <p className="text-xs font-medium text-slate-600 capitalize text-center">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Ride History */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Accepted Rides */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
                            <h3 className="font-bold text-slate-900 flex items-center gap-2">
                                <CheckCircle size={18} className="text-emerald-500" />
                                Completed Rides ({completedRides.length})
                            </h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr>
                                        <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Route</th>
                                        <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Details</th>
                                        <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Amt</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {completedRides.length > 0 ? completedRides.map(ride => (
                                        <tr key={ride.id} className="hover:bg-slate-50">
                                            <td className="px-4 py-3">
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-xs text-slate-600 flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div> {ride.from}</span>
                                                    <span className="text-xs text-slate-600 flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-rose-500"></div> {ride.to}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="text-xs font-medium text-slate-900">{ride.date}</div>
                                                <div className="text-xs text-slate-500">{ride.time} • {ride.passenger}</div>
                                            </td>
                                            <td className="px-4 py-3 text-right font-medium text-emerald-600 text-sm">
                                                ₹{(ride.amount || 0).toFixed(2)}
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan="3" className="px-6 py-8 text-center text-sm text-slate-500">No completed rides found.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Cancelled Rides */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
                            <h3 className="font-bold text-slate-900 flex items-center gap-2">
                                <Ban size={18} className="text-rose-500" />
                                Cancelled Rides ({cancelledRides.length})
                            </h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr>
                                        <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Route</th>
                                        <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Details</th>
                                        <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Amt</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {cancelledRides.length > 0 ? cancelledRides.map(ride => (
                                        <tr key={ride.id} className="hover:bg-slate-50">
                                            <td className="px-4 py-3">
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-xs text-slate-600 flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div> {ride.from}</span>
                                                    <span className="text-xs text-slate-600 flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-rose-500"></div> {ride.to}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="text-xs font-medium text-slate-900">{ride.date}</div>
                                                <div className="text-xs text-slate-500">{ride.time} • {ride.passenger}</div>
                                            </td>
                                            <td className="px-4 py-3 text-right font-medium text-slate-400 text-sm line-through">
                                                ₹{(ride.amount || 0).toFixed(2)}
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan="3" className="px-6 py-8 text-center text-sm text-slate-500">No cancelled rides found.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderDirectory = () => (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search drivers..."
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-white text-slate-800 placeholder:text-slate-400"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex flex-wrap gap-3 items-center">
                    <select
                        className="bg-white text-slate-800 border border-slate-200 px-4 py-2 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        <option value="all" className="text-slate-800 bg-white">All Status</option>
                        <option value="active" className="text-slate-800 bg-white">Active</option>
                        <option value="blocked" className="text-slate-800 bg-white">Blocked</option>
                    </select>
                    <select
                        className="bg-white text-slate-800 border border-slate-200 px-4 py-2 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                        value={filterVehicleType}
                        onChange={(e) => setFilterVehicleType(e.target.value)}
                    >
                        <option value="all" className="text-slate-800 bg-white">All Vehicles</option>
                        <option value="CAR" className="text-slate-800 bg-white">Car</option>
                        <option value="AUTO" className="text-slate-800 bg-white">Auto</option>
                        <option value="BIKE" className="text-slate-800 bg-white">Bike</option>
                        <option value="TRAVELER" className="text-slate-800 bg-white">Traveler</option>
                    </select>
                    {/* <button
                        onClick={() => setIsAddDriverModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
                    >
                        <Plus size={16} /> Add Driver
                    </button> */}

                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase w-16">S.No.</th>
                            <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Driver</th>
                            <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Contact</th>
                            <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Vehicle</th>
                            <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Status</th>
                            <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Highlights</th>
                            <th className="text-right px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredDrivers.map((driver, index) => (
                            <tr
                                key={driver.id}
                                onClick={() => setSelectedDriver(driver)}
                                className="hover:bg-slate-50 transition-colors cursor-pointer group"
                            >
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-500">
                                    {index + 1}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full border border-slate-100 overflow-hidden">
                                            <img src={driver.avatar} alt={driver.name} className="w-full h-full object-cover" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-slate-900 group-hover:text-blue-600 transition-colors">{driver.name}</div>
                                            <div className="text-xs text-slate-500">Joined {driver.joinDate}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-slate-600">{driver.phone}</div>
                                    <div className="text-xs text-slate-400">{driver.email}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-slate-900">{driver.vehicle}</div>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-[10px] font-bold bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 border border-slate-200 uppercase">{driver.vehicleType}</span>
                                        <span className="text-[10px] font-bold bg-blue-50 px-1.5 py-0.5 rounded text-blue-700 border border-blue-100">{driver.plateNumber}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold flex items-center w-fit gap-1 capitalize
                                        ${driver.status === 'active'
                                            ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                                            : 'bg-rose-100 text-rose-700 border-rose-200'}`}>
                                        {driver.status === 'active' ? <CheckCircle size={10} /> : <Ban size={10} />}
                                        {driver.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex gap-4">
                                        <div className="text-center">
                                            <div className="text-sm font-bold text-slate-900">{driver.rating} ⭐</div>
                                            <div className="text-xs text-slate-500">Rating</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-sm font-bold text-slate-900">₹{driver.totalEarnings}</div>
                                            <div className="text-xs text-slate-500">Earnings</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right" onClick={(e) => e.stopPropagation()}>
                                    <div className="flex items-center justify-end gap-2">
                                        <button
                                            onClick={() => setSelectedDriver(driver)}
                                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                                            title="View Details"
                                        >
                                            <Eye size={18} />
                                        </button>
                                        <button
                                            onClick={() => toggleDriverStatus(driver.id)}
                                            className={`p-2 rounded-full transition-colors
                                                ${driver.status === 'blocked'
                                                    ? 'text-emerald-500 hover:bg-emerald-50 hover:text-emerald-700'
                                                    : 'text-rose-500 hover:bg-rose-50 hover:text-rose-700'}`}
                                            title={driver.status === 'blocked' ? 'Activate' : 'Block'}
                                        >
                                            {driver.status === 'blocked' ? <CheckCircle size={18} /> : <Ban size={18} />}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );


    const renderOnboarding = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {onboardingList.length === 0 && (
                <div className="col-span-full text-center py-12 text-slate-500 bg-white rounded-xl border border-slate-200 border-dashed">
                    No pending driver applications.
                </div>
            )}
            {onboardingList.map(applicant => (
                <div key={applicant.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col gap-4">
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-full border border-slate-100 overflow-hidden bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg">
                                {applicant.avatar && !applicant.avatar.includes('ui-avatars.com') ? (
                                    <img src={applicant.avatar} alt={applicant.name} className="w-full h-full object-cover" />
                                ) : (
                                    applicant.name.charAt(0)
                                )}
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900">{applicant.name}</h3>
                                <p className="text-sm text-slate-500">{applicant.phone}</p>
                            </div>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-lg border font-medium ${applicant.status === 'rejected' ? 'bg-rose-100 text-rose-700 border-rose-200' : 'bg-amber-100 text-amber-700 border-amber-200'}`}>
                            {applicant.status === 'rejected' ? 'Rejected' : 'Pending'}
                        </span>
                    </div>
                    <div className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <p>Applied: <span className="font-medium">{applicant.appliedDate || applicant.joinDate}</span></p>
                        <p>Email: {applicant.email}</p>
                        {applicant.status === 'rejected' && (
                            <p className="mt-2 text-rose-600 italic">Reason: {applicant.rejectionReason}</p>
                        )}
                    </div>
                    <button
                        onClick={() => { setSelectedApplicant(applicant); fetchDriverDocuments(applicant.id); setIsDocModalOpen(true); }}
                        className="mt-auto w-full py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                    >
                        <Eye size={18} /> Review Documents
                    </button>
                </div>
            ))}
        </div>
    );

    const renderEarnings = () => (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                        <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Driver</th>
                        <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Daily</th>
                        <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Weekly</th>
                        <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Monthly</th>
                        <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Total Rides</th>
                        <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Rating</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {drivers.map(data => (
                        <tr key={data.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 font-medium text-slate-900">{data.name}</td>
                            <td className="px-6 py-4 text-emerald-600 font-medium">₹{(data.totalEarnings || 0).toFixed(2)}</td>
                            <td className="px-6 py-4 text-slate-600">₹0.00</td>
                            <td className="px-6 py-4 text-slate-900 font-bold">₹{(data.totalEarnings || 0).toFixed(2)}</td>
                            <td className="px-6 py-4 text-slate-600">-</td>
                            <td className="px-6 py-4">
                                <span className={`px-2 py-1 rounded-lg text-xs font-bold border ${data.rating >= 4.5 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                                    {data.rating} ⭐
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    const renderComplaints = () => (
        <div className="grid gap-4">
            {complaintsData.map(complaint => (
                <div key={complaint.id} className="bg-white p-4 rounded-xl border border-slate-200 flex items-start justify-between shadow-sm">
                    <div className="flex gap-4">
                        <div className="p-3 bg-rose-50 rounded-full text-rose-500 h-fit">
                            <AlertTriangle size={20} />
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-900">{complaint.issue}</h4>
                            <p className="text-sm text-slate-500 mt-1">
                                Driver: <span className="font-medium text-slate-700">{complaint.driver}</span> •
                                Passenger: <span className="font-medium text-slate-700">{complaint.passenger}</span>
                            </p>
                            <p className="text-xs text-slate-400 mt-2">{complaint.date}</p>
                        </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${complaint.status === 'resolved' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-amber-50 text-amber-600 border-amber-200'}`}>
                        {complaint.status}
                    </span>
                </div>
            ))}
        </div>
    );

    const location = useLocation();
    const tabs = [
        { id: 'directory', label: `Directory (${drivers.length})`, path: '/drivers' },
        { id: 'onboarding', label: `Onboarding (${onboardingList.length})`, path: '/drivers/onboarding' },


    ];

    return (
        <div className="space-y-6">
            {selectedDriver ? (
                <div className="p-6">
                    {renderDriverDetails()}
                </div>
            ) : (
                <>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <h1 className="text-2xl font-bold text-white">Driver Management</h1>
                    </div>

                    {/* Navigation Tabs */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200">
                        {tabs.map(tab => {
                            const isActive = location.pathname === tab.path;
                            return (
                                <Link
                                    key={tab.id}
                                    to={tab.path}
                                    className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors
                                        ${isActive
                                            ? 'bg-blue-50 text-blue-600'
                                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                        }`}
                                >
                                    {tab.label}
                                </Link>
                            );
                        })}
                    </div>

                    {view === 'directory' && renderDirectory()}
                    {view === 'onboarding' && renderOnboarding()}
                    {view === 'earnings' && renderEarnings()}
                    {view === 'complaints' && renderComplaints()}
                </>
            )}

            {/* Add Driver Modal */}
            <Modal isOpen={isAddDriverModalOpen} onClose={() => setIsAddDriverModalOpen(false)} title="Add New Driver">
                <form onSubmit={handleAddDriver} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                            <input name="name" required type="text" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-800 placeholder:text-slate-400" placeholder="John Doe" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                            <input name="phone" required type="tel" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-800 placeholder:text-slate-400" placeholder="+1 (555) 000-0000" />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                            <input name="email" required type="email" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-800 placeholder:text-slate-400" placeholder="john@example.com" />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Vehicle Details</label>
                            <input name="vehicle" required type="text" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-800 placeholder:text-slate-400" placeholder="Toyota Camry - ABC 1234" />
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <button type="button" onClick={() => setIsAddDriverModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">Add Driver</button>
                    </div>
                </form>
            </Modal>

            {/* Document Verification Modal */}
            <Modal isOpen={isDocModalOpen && selectedApplicant} onClose={() => { setIsDocModalOpen(false); setSelectedDriverDocs({}); }} title="Document Verification">
                {selectedApplicant && (
                    <div className="space-y-6">
                        {/* Applicant Header */}
                        <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
                            <div className="h-12 w-12 rounded-full border border-blue-200 overflow-hidden bg-blue-200 flex items-center justify-center text-blue-700 font-bold text-xl">
                                {selectedApplicant.avatar && !selectedApplicant.avatar.includes('ui-avatars.com') ? (
                                    <img src={selectedApplicant.avatar} alt={selectedApplicant.name} className="w-full h-full object-cover" />
                                ) : (
                                    selectedApplicant.name.charAt(0)
                                )}
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-900">{selectedApplicant.name}</h4>
                                <p className="text-sm text-slate-600">Applied on {selectedApplicant.appliedDate}</p>
                                <p className="text-xs text-slate-500">{selectedApplicant.email} • {selectedApplicant.phone}</p>
                            </div>
                        </div>

                        {/* Vehicle Details Section */}
                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                            <h5 className="font-bold text-slate-700 mb-3 text-sm uppercase tracking-wide">Vehicle Information</h5>
                            <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
                                <div>
                                    <span className="block text-slate-500 text-xs">Vehicle</span>
                                    <span className="font-medium text-slate-900">{selectedApplicant.driverDetails?.vehicle?.make} {selectedApplicant.driverDetails?.vehicle?.model} ({selectedApplicant.driverDetails?.vehicle?.year})</span>
                                </div>
                                <div>
                                    <span className="block text-slate-500 text-xs">License Plate</span>
                                    <span className="font-medium text-slate-900 bg-yellow-100 px-2 py-0.5 rounded text-yellow-800 border border-yellow-200 inline-block mt-0.5">
                                        {selectedApplicant.driverDetails?.vehicle?.plateNumber || 'N/A'}
                                    </span>
                                </div>
                                <div>
                                    <span className="block text-slate-500 text-xs">Color</span>
                                    <span className="font-medium text-slate-900">{selectedApplicant.driverDetails?.vehicle?.color || 'N/A'}</span>
                                </div>
                                <div>
                                    <span className="block text-slate-500 text-xs">Fuel Type</span>
                                    <span className="font-medium text-slate-900">{selectedApplicant.driverDetails?.vehicle?.fuelType || 'N/A'}</span>
                                </div>
                                {selectedApplicant.vehicleType !== 'BIKE' && (
                                    <>
                                        <div>
                                            <span className="block text-slate-500 text-xs">Seating Capacity</span>
                                            <span className="font-medium text-slate-900">{selectedApplicant.driverDetails?.vehicle?.seatingCapacity || 'N/A'} Seats</span>
                                        </div>
                                        <div>
                                            <span className="block text-slate-500 text-xs">Boot Space</span>
                                            <span className="font-medium text-slate-900">{selectedApplicant.driverDetails?.vehicle?.bootSpace || 'N/A'} Liters</span>
                                        </div>
                                    </>
                                )}
                            </div>
                            <div>
                                <h5 className="font-bold text-slate-700 mb-3 text-sm uppercase tracking-wide">Uploaded Documents</h5>
                                {isLoadingDocs ? (
                                    <div className="text-center py-8 text-slate-500">
                                        Loading documents...
                                    </div>
                                ) : Object.keys(selectedDriverDocs).length === 0 ? (
                                    <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-slate-500 text-sm">
                                        No documents uploaded yet.
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {Object.entries(selectedDriverDocs).map(([key, url]) => (
                                            <div key={key} className="border border-slate-200 rounded-xl p-3 hover:border-blue-300 transition-colors cursor-pointer group bg-white shadow-sm" onClick={() => setViewingImage({ url, title: key.replace(/([A-Z])/g, ' $1').trim() })}>
                                                <div className="mb-2 flex justify-between items-center">
                                                    <span className="text-sm font-medium text-slate-700 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                                                    <span className="text-xs text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity hover:underline flex items-center gap-1">
                                                        <Eye size={12} /> View Full
                                                    </span>
                                                </div>
                                                <div className="aspect-video bg-slate-100 rounded-lg overflow-hidden border border-slate-100 relative group-hover:shadow-md transition-shadow">
                                                    <img src={url} alt={key} className="w-full h-full object-cover" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex gap-3 pt-4 border-t border-slate-200 sticky bottom-0 bg-white p-2">
                            <button
                                onClick={() => handleReject(selectedApplicant.id)}
                                className="flex-1 py-3 border border-rose-200 text-rose-600 rounded-xl font-bold hover:bg-rose-50 transition-colors flex items-center justify-center gap-2"
                            >
                                <ThumbsDown size={18} /> Reject
                            </button>
                            <button
                                onClick={() => handleApprove(selectedApplicant.id)}
                                className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-200"
                            >
                                <ThumbsUp size={18} /> Approve & Onboard
                            </button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Image Viewer Modal */}
            <Modal
                isOpen={!!viewingImage}
                onClose={() => setViewingImage(null)}
                title={viewingImage?.title || 'Document View'}
            >
                <div className="flex flex-col items-center">
                    <div className="w-full rounded-lg overflow-hidden border border-slate-200 shadow-inner bg-slate-50">
                        <img
                            src={viewingImage?.url}
                            alt={viewingImage?.title}
                            className="w-full h-auto object-contain max-h-[70vh]"
                        />
                    </div>
                    <a
                        href={viewingImage?.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors"
                    >
                        <Download size={16} /> Open Original Image
                    </a>
                </div>
            </Modal>
        </div>
    );
};

export default DriverManagement;
