import React, { useState, useEffect, useCallback } from 'react';
import {
    Search, Filter, MapPin, Navigation, Clock, Users,
    CheckCircle, XCircle, AlertCircle, Eye, MoreVertical,
    Calendar, Car, DollarSign, ChevronDown
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const PoolManagement = () => {
    const navigate = useNavigate();
    const [pools, setPools] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');

    const fetchPools = useCallback(async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('adminToken');
            const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/admin/pools`, {
                params: { type: filterType !== 'all' ? filterType : undefined, status: filterStatus !== 'all' ? filterStatus : undefined },
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.data.success) {
                setPools(res.data.data);
            } else {
                setError(res.data.message);
            }
        } catch (err) {
            console.error('Failed to fetch pools:', err);
            setError(err.response?.data?.message || 'Failed to connect to server');
        } finally {
            setLoading(false);
        }
    }, [filterType, filterStatus]);

    useEffect(() => {
        fetchPools();
    }, [fetchPools]);

    const filteredPools = pools.filter(pool => {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
            (pool.origin?.name?.toLowerCase().includes(query)) ||
            (pool.destination?.name?.toLowerCase().includes(query)) ||
            (pool.host?.name?.toLowerCase().includes(query)) ||
            (pool.vehicle?.toLowerCase().includes(query));
        return matchesSearch;
    });

    const StatusBadge = ({ status }) => {
        const styles = {
            scheduled: 'bg-amber-100 text-amber-700 border-amber-200',
            ongoing: 'bg-blue-100 text-blue-700 border-blue-200',
            completed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
            cancelled: 'bg-rose-100 text-rose-700 border-rose-200',
        };

        return (
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 w-fit border ${styles[status] || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                <span className="capitalize">{status}</span>
            </span>
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold text-white">Pool Management</h1>
                <p className="text-white text-sm">Monitor and manage all City and Outstation pooling rides.</p>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search by city or host..."
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-800 placeholder:text-slate-400"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex gap-4">
                    <select
                        className="bg-white border border-slate-200 px-4 py-2 rounded-lg text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                    >
                        <option value="all" className="text-slate-800 bg-white">All Types</option>
                        <option value="local" className="text-slate-800 bg-white">City Pool</option>
                        <option value="outstation" className="text-slate-800 bg-white">Outstation</option>
                    </select>
                    <select
                        className="bg-white border border-slate-200 px-4 py-2 rounded-lg text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        <option value="all" className="text-slate-800 bg-white">All Status</option>
                        <option value="scheduled" className="text-slate-800 bg-white">Scheduled</option>
                        <option value="ongoing" className="text-slate-800 bg-white">Ongoing</option>
                        <option value="completed" className="text-slate-800 bg-white">Completed</option>
                        <option value="cancelled" className="text-slate-800 bg-white">Cancelled</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                {error && (
                    <div className="p-4 m-4 bg-red-50 text-red-600 border border-red-200 rounded-lg flex items-center gap-2">
                        <AlertCircle size={18} />
                        <span>{error}</span>
                    </div>
                )}

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Pool Info</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Host / Vehicle</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Route</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Seats & Price</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Status</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                                        Loading pools...
                                    </td>
                                </tr>
                            ) : filteredPools.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                                        No pools found.
                                    </td>
                                </tr>
                            ) : filteredPools.map(pool => (
                                <tr key={pool._id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-slate-900 capitalize">{pool.type} Pool</div>
                                        <div className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                                            <Calendar size={12} /> {new Date(pool.scheduledTime).toLocaleDateString()}
                                            <Clock size={12} className="ml-1" /> {new Date(pool.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-full bg-slate-100 overflow-hidden">
                                                <img src={pool.host?.profileImage || `https://ui-avatars.com/api/?name=${pool.host?.name}`} alt="" className="w-full h-full object-cover" />
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-slate-900">{pool.host?.name}</div>
                                                <div className="text-xs text-slate-500">{pool.vehicle}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1 text-xs">
                                            <span className="flex items-center gap-1.5 text-slate-600 truncate max-w-[200px]" title={pool.origin?.name}>
                                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" /> {pool.origin?.name}
                                            </span>
                                            <span className="flex items-center gap-1.5 text-slate-600 truncate max-w-[200px]" title={pool.destination?.name}>
                                                <div className="w-1.5 h-1.5 rounded-full bg-rose-500 flex-shrink-0" /> {pool.destination?.name}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-medium text-slate-900">
                                            {pool.totalSeats - pool.availableSeats} / {pool.totalSeats} Seats
                                        </div>
                                        <div className="text-xs text-emerald-600 font-semibold mt-0.5">₹{pool.pricePerSeat} / Seat</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <StatusBadge status={pool.status} />
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => navigate(`/rides/pools/${pool._id}`)}
                                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                                        >
                                            <Eye size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default PoolManagement;
