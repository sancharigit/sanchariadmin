import React, { useState, useEffect } from 'react';
import {
    Search, Filter, MoreVertical, Ban, CheckCircle, Clock,
    MapPin, IndianRupee, FileText, User, ChevronDown, Download, Eye, X
} from 'lucide-react';
import axios from 'axios';


// const initialPassengers = [ ... ]; // Removed as unused

const mockRides = [
    { id: 'R-101', passenger: 'Alice Johnson', driver: 'Mike Ross', date: '2025-02-10', time: '14:30', from: 'Central Station', to: 'Airport Terminal 1', amount: 25.50, status: 'completed' },
    { id: 'R-102', passenger: 'Bob Smith', driver: 'Harvey Specter', date: '2025-02-09', time: '09:15', from: 'Downtown', to: 'City Mall', amount: 12.00, status: 'cancelled' },
    { id: 'R-103', passenger: 'Alice Johnson', driver: 'Louis Litt', date: '2025-02-08', time: '18:45', from: 'Office Park', to: 'Home', amount: 18.75, status: 'completed' },
    { id: 'R-104', passenger: 'Diana Prince', driver: 'Donna Paulsen', date: '2025-02-08', time: '12:00', from: 'Museum', to: 'Cafe', amount: 8.50, status: 'completed' },
    { id: 'R-105', passenger: 'Alice Johnson', driver: 'Mike Ross', date: '2025-02-07', time: '08:00', from: 'Home', to: 'Office Park', amount: 19.00, status: 'completed' },
    { id: 'R-106', passenger: 'Alice Johnson', driver: 'Harvey Specter', date: '2025-02-05', time: '19:30', from: 'Airport', to: 'Home', amount: 28.00, status: 'cancelled' },
];

const mockTransactions = [
    { id: 'TX-501', passenger: 'Alice Johnson', type: 'Payment', amount: 25.50, date: '2025-02-10', method: 'Credit Card', status: 'success' },
    { id: 'TX-502', passenger: 'Bob Smith', type: 'Refund', amount: 12.00, date: '2025-02-09', method: 'Wallet', status: 'processed' },
    { id: 'TX-503', passenger: 'Charlie Brown', type: 'Payment', amount: 15.00, date: '2025-02-08', method: 'Cash', status: 'success' },
];

const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
                <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                    <h3 className="text-lg font-bold text-slate-900">{title}</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <X size={20} />
                    </button>
                </div>
                <div className="p-6 overflow-y-auto">
                    {children}
                </div>
            </div>
        </div>
    );
};

const PassengerManagement = ({ view = 'directory' }) => {
    const [passengers, setPassengers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [selectedPassenger, setSelectedPassenger] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [viewingImage, setViewingImage] = useState(null);

    useEffect(() => {
        fetchPassengers();
    }, []);

    const fetchPassengers = async () => {
        try {
            setError(null);
            const token = localStorage.getItem('adminToken');
            if (!token) {
                setError('No admin token found. Please sign in again.');
                return;
            }
            const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/admin/passengers`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                const formatted = res.data.data.map(p => ({
                    id: p._id,
                    name: p.name,
                    phone: p.phone,
                    email: p.email,
                    status: p.isBlocked ? 'blocked' : 'active',
                    joinDate: new Date(p.createdAt).toLocaleDateString(),
                    totalRides: 0, // Mock for now until history API is synced
                    rating: p.ratings?.average || 5.0,
                    address: p.address || 'Location Unavailable',
                    avatar: p.profileImage ? (() => {
                        if (p.profileImage.startsWith('http')) return p.profileImage;
                        const baseUrl = import.meta.env.VITE_API_BASE_URL.replace(/\/$/, '');
                        const filePath = p.profileImage.startsWith('/') ? p.profileImage : `/${p.profileImage}`;
                        return `${baseUrl}${filePath}`;
                    })() : `https://ui-avatars.com/api/?name=${p.name}&background=random`
                }));
                setPassengers(formatted);
            } else {
                setError('Failed to fetch: ' + res.data.message);
            }
        } catch (err) {
            console.error('Failed to fetch passengers:', err);
            setError(err.response?.data?.message || err.message || 'Network Error or server unreachable');
        } finally {
            setLoading(false);
        }
    };

    // --- Search & Filter Logic ---
    const filteredPassengers = passengers.filter(p => {
        const query = searchQuery.toLowerCase();
        const matchesSearch = (p.name || '').toLowerCase().includes(query) ||
            (p.phone || '').includes(searchQuery) ||
            (p.email || '').toLowerCase().includes(query);
        const matchesStatus = filterStatus === 'all' || p.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    // --- Actions ---
    const toggleBlockStatus = async (id) => {
        try {
            const token = localStorage.getItem('adminToken');
            if (!token) {
                alert("Session expired. Please log in again.");
                return;
            }

            const res = await axios.put(`${import.meta.env.VITE_API_BASE_URL}/api/admin/passengers/${id}/block`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.data.success) {
                // Update local state to reflect the change
                setPassengers(passengers.map(p =>
                    p.id === id ? { ...p, status: res.data.data.isBlocked ? 'blocked' : 'active' } : p
                ));
            } else {
                alert(res.data.message || "Failed to block/unblock passenger");
            }
        } catch (error) {
            console.error('Error toggling block status:', error);
            alert(error.response?.data?.message || 'Error communicating with server');
        }
    };

    const [passengerRides, setPassengerRides] = useState([]);
    const [passengerTransactions, setPassengerTransactions] = useState([]);
    const [detailsLoading, setDetailsLoading] = useState(false);

    useEffect(() => {
        if (selectedPassenger) {
            fetchPassengerDetails(selectedPassenger.id);
        }
    }, [selectedPassenger]);

    const fetchPassengerDetails = async (id) => {
        try {
            setDetailsLoading(true);
            const token = localStorage.getItem('adminToken');

            const [ridesRes, txRes] = await Promise.all([
                axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/admin/passengers/${id}/rides`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/admin/passengers/${id}/transactions`, { headers: { Authorization: `Bearer ${token}` } })
            ]);

            if (ridesRes.data.success) {
                setPassengerRides(ridesRes.data.data);
            }
            if (txRes.data.success) {
                setPassengerTransactions(txRes.data.data);
            }
        } catch (err) {
            console.error('Failed to fetch passenger details:', err);
        } finally {
            setDetailsLoading(false);
        }
    };

    // --- Render Helpers ---

    const StatusBadge = ({ status }) => (
        <span className={`px-2 py-1 rounded-full text-xs font-semibold flex items-center w-fit gap-1 capitalize
            ${status === 'active' || status === 'success' || status === 'completed' || status === 'processed'
                ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                : status === 'blocked' || status === 'cancelled'
                    ? 'bg-rose-100 text-rose-700 border border-rose-200'
                    : 'bg-slate-100 text-slate-600 border border-slate-200'
            }`}>
            {status === 'active' || status === 'success' || status === 'completed' || status === 'processed' ? <CheckCircle size={10} /> :
                status === 'blocked' || status === 'cancelled' ? <Ban size={10} /> : <Clock size={10} />}
            {status}
        </span>
    );

    // --- Views ---

    const renderPassengerDetails = () => {
        const p = selectedPassenger;
        const completedRides = passengerRides.filter(r => r.status === 'completed');
        // const cancelledRides = passengerRides.filter(r => r.status === 'cancelled'); // Removed as unused

        return (
            <div className="space-y-6">
                <button
                    onClick={() => setSelectedPassenger(null)}
                    className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors font-medium"
                >
                    <ChevronDown className="rotate-90" size={20} /> Back to Directory
                </button>

                {/* Profile Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                    <div className="flex flex-col md:flex-row gap-6 items-start">
                        <div className="h-32 w-32 rounded-full border-4 border-slate-100 overflow-hidden flex-shrink-0 cursor-pointer hover:border-blue-200 transition-colors" onClick={() => setViewingImage({ url: p.avatar, title: `${p.name}'s Profile` })}>
                            <img src={p.avatar} alt={p.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 space-y-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-900">{p.name}</h2>
                                    <div className="flex items-center gap-2 mt-1">
                                        <StatusBadge status={p.status} />
                                        <span className="text-sm text-slate-500">• Joined {p.joinDate}</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-lg font-bold text-slate-900">{p.rating} ⭐</div>
                                    <div className="text-sm text-slate-500">{passengerRides.length} Total Rides</div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-slate-50 rounded-lg text-slate-500"><User size={18} /></div>
                                    <div>
                                        <p className="text-xs text-slate-500">Contact</p>
                                        <p className="text-sm font-medium text-slate-900">{p.phone}</p>
                                        <p className="text-sm text-slate-600">{p.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-slate-50 rounded-lg text-slate-500"><MapPin size={18} /></div>
                                    <div>
                                        <p className="text-xs text-slate-500">Address</p>
                                        <p className="text-sm font-medium text-slate-900">{p.address}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {detailsLoading ? (
                    <div className="p-8 text-center text-sm text-slate-500">Loading passenger details...</div>
                ) : (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                        {/* Accepted Rides */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
                                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                                    <CheckCircle size={18} className="text-emerald-500" />
                                    Completed Rides ({completedRides.length})
                                </h3>
                            </div>
                            <div className="overflow-x-auto max-h-[400px]">
                                <table className="w-full">
                                    <thead className="bg-slate-50 border-b border-slate-200 sticky top-0">
                                        <tr>
                                            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Route</th>
                                            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Details</th>
                                            <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Amt</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {completedRides.length > 0 ? completedRides.map(ride => (
                                            <tr key={ride._id} className="hover:bg-slate-50">
                                                <td className="px-4 py-3 max-w-[200px] truncate">
                                                    <div className="flex flex-col gap-1">
                                                        <span className="text-xs text-slate-600 flex items-center gap-1 truncate" title={ride.pickup?.address}><div className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0"></div> {ride.pickup?.address}</span>
                                                        <span className="text-xs text-slate-600 flex items-center gap-1 truncate" title={ride.dropoff?.address}><div className="w-1.5 h-1.5 rounded-full bg-rose-500 flex-shrink-0"></div> {ride.dropoff?.address}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="text-xs font-medium text-slate-900">{new Date(ride.createdAt).toLocaleDateString()}</div>
                                                    <div className="text-xs text-slate-500">{ride.durationMins}m • {ride.driver ? ride.driver.name : 'Unassigned'}</div>
                                                </td>
                                                <td className="px-4 py-3 text-right font-medium text-emerald-600 text-sm">
                                                    ₹{(ride.finalFare || ride.offeredFare || 0).toFixed(2)}
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr><td colSpan="3" className="px-6 py-8 text-center text-sm text-slate-500">No completed rides found.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Recent Transactions / Cancelled */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
                                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                                    <IndianRupee size={18} className="text-blue-500" />
                                    Recent Transactions ({passengerTransactions.length})
                                </h3>
                            </div>
                            <div className="overflow-x-auto max-h-[400px]">
                                <table className="w-full">
                                    <thead className="bg-slate-50 border-b border-slate-200 sticky top-0">
                                        <tr>
                                            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Type / Date</th>
                                            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Related To</th>
                                            <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Amt</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {passengerTransactions.length > 0 ? passengerTransactions.map(tx => (
                                            <tr key={tx.id} className="hover:bg-slate-50">
                                                <td className="px-4 py-3">
                                                    <div className="flex flex-col gap-1">
                                                        <span className="text-xs font-medium text-slate-900 flex items-center gap-1">{tx.type}</span>
                                                        <span className="text-xs text-slate-500">{new Date(tx.date).toLocaleDateString()}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="text-xs text-slate-900 truncate max-w-[150px]">{tx.relatedTo}</div>
                                                    <div className="text-xs text-slate-500 capitalize">{tx.method}</div>
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <div className={`font-medium text-sm ${tx.type === 'Refund' ? 'text-rose-600' : 'text-emerald-600'}`}>
                                                        {tx.type === 'Refund' ? '-' : '+'}₹{(tx.amount || 0).toFixed(2)}
                                                    </div>
                                                    <div className="mt-1 flex justify-end"><StatusBadge status={tx.status} /></div>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr><td colSpan="3" className="px-6 py-8 text-center text-sm text-slate-500">No transactions recorded.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const renderDirectory = () => (
        <div className="space-y-6">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row justify-between gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search passengers by name, phone, email..."
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white text-slate-800 placeholder:text-slate-400"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="relative">
                    <select
                        className="appearance-none bg-white border border-slate-200 pl-4 pr-10 py-2 rounded-lg text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        <option value="all" className="text-slate-800 bg-white">All Status</option>
                        <option value="active" className="text-slate-800 bg-white">Active</option>
                        <option value="blocked" className="text-slate-800 bg-white">Blocked</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                {error && (
                    <div className="p-4 m-4 bg-red-50 text-red-600 border border-red-200 rounded-lg flex items-center gap-2">
                        <span>{error}</span>
                    </div>
                )}

                {!error && (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider w-16">S.No.</th>
                                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Passenger</th>
                                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Contact Info</th>
                                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Join Date</th>
                                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Rides</th>
                                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredPassengers.map((passenger, index) => (
                                    <tr
                                        key={passenger.id}
                                        onClick={() => setSelectedPassenger(passenger)}
                                        className="hover:bg-slate-50 transition-colors cursor-pointer group"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-500">
                                            {index + 1}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full border border-slate-100 overflow-hidden">
                                                    <img src={passenger.avatar} alt={passenger.name} className="w-full h-full object-cover" />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-medium text-slate-900 group-hover:text-blue-600 transition-colors">{passenger.name}</div>
                                                    <div className="text-xs text-slate-500">Rating: {passenger.rating} ⭐</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-slate-600">{passenger.phone}</div>
                                            <div className="text-xs text-slate-400">{passenger.email}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <StatusBadge status={passenger.status} />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                                            {passenger.joinDate}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                                            {passenger.totalRides}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right" onClick={(e) => e.stopPropagation()}>
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => setSelectedPassenger(passenger)}
                                                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                                                    title="View Details"
                                                >
                                                    <Eye size={18} />
                                                </button>
                                                <button
                                                    onClick={() => toggleBlockStatus(passenger.id)}
                                                    className={`p-2 rounded-full transition-colors
                                                            ${passenger.status === 'blocked'
                                                            ? 'text-emerald-500 hover:bg-emerald-50 hover:text-emerald-700'
                                                            : 'text-rose-500 hover:bg-rose-50 hover:text-rose-700'}`}
                                                    title={passenger.status === 'blocked' ? 'Unblock' : 'Block'}
                                                >
                                                    {passenger.status === 'blocked' ? <CheckCircle size={18} /> : <Ban size={18} />}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                {!error && filteredPassengers.length === 0 && (
                    <div className="p-8 text-center text-sm text-slate-500">
                        {loading ? 'Loading passengers...' : 'No passengers found matching your search.'}
                    </div>
                )}
            </div>
        </div>
    );

    const renderRideHistory = () => (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Ride ID</th>
                            <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Passenger</th>
                            <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Driver</th>
                            <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Route</th>
                            <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date & Time</th>
                            <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount</th>
                            <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {mockRides.map((ride) => (
                            <tr key={ride.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{ride.id}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{ride.passenger}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{ride.driver}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-1 text-xs text-slate-500"><div className="w-2 h-2 rounded-full bg-blue-500"></div> {ride.from}</div>
                                        <div className="flex items-center gap-1 text-xs text-slate-500"><div className="w-2 h-2 rounded-full bg-rose-500"></div> {ride.to}</div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                                    <div>{ride.date}</div>
                                    <div className="text-xs text-slate-400">{ride.time}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">₹{ride.amount.toFixed(2)}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <StatusBadge status={ride.status} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderTransactions = () => (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Transaction ID</th>
                            <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Passenger</th>
                            <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</th>
                            <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Method</th>
                            <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                            <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount</th>
                            <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {mockTransactions.map((tx) => (
                            <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{tx.id}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{tx.passenger}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{tx.type}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{tx.method}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{tx.date}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                                    <span className={tx.type === 'Refund' ? 'text-rose-600' : 'text-emerald-600'}>
                                        {tx.type === 'Refund' ? '-' : '+'}₹{tx.amount.toFixed(2)}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <StatusBadge status={tx.status} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            {selectedPassenger ? (
                <div className="p-6">
                    {renderPassengerDetails()}
                </div>
            ) : (
                <>
                    <div className="flex justify-between items-center">
                        <h1 className="text-2xl font-bold text-white">
                            {view === 'directory' && 'Passenger Directory'}
                            {view === 'ride_history' && 'Passenger Ride History'}
                            {view === 'transactions' && 'Payment & Refund History'}
                        </h1>
                    </div>
                    {view === 'directory' && renderDirectory()}
                    {view === 'ride_history' && renderRideHistory()}
                    {view === 'transactions' && renderTransactions()}
                </>
            )}

            {/* Image Viewer Modal */}
            <Modal
                isOpen={!!viewingImage}
                onClose={() => setViewingImage(null)}
                title={viewingImage?.title || 'Profile View'}
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

export default PassengerManagement;
