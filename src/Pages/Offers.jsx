import React, { useState, useEffect, useCallback } from 'react';
import {
    Search, Plus, Tag, Trash2, AlertCircle, 
    Sparkles, Percent, Loader2, X, FileText
} from 'lucide-react';
import axios from 'axios';
import { motion } from 'framer-motion';

const Offers = () => {
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        badge: 'CITY COMMUTE',
        actionText: 'LEARN MORE',
        targetScreen: ''
    });
    const [submitting, setSubmitting] = useState(false);

    const fetchOffers = useCallback(async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('adminToken');
            const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/admin/offers`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.data.success) {
                setOffers(res.data.data);
            } else {
                setError(res.data.message);
            }
        } catch (err) {
            console.error('Failed to fetch offers:', err);
            setError(err.response?.data?.message || 'Failed to connect to server');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchOffers();
    }, [fetchOffers]);

    const handleAddOffer = async (e) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            const token = localStorage.getItem('adminToken');
            
            const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/admin/offers`, formData, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (res.data.success) {
                setOffers([res.data.data, ...offers]);
                setIsModalOpen(false);
                setFormData({
                    title: '',
                    description: '',
                    badge: 'CITY COMMUTE',
                    actionText: 'LEARN MORE',
                    targetScreen: ''
                });
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to add offer');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this offer?')) return;
        try {
            const token = localStorage.getItem('adminToken');
            await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/api/admin/offers/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setOffers(offers.filter(o => o._id !== id));
        } catch (err) {
            alert('Failed to delete offer');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-col gap-2">
                    <h1 className="text-2xl font-bold text-white">Recommended Offers</h1>
                    <p className="text-white/60 text-sm">Manage dynamic promotional and commuted offers displayed in the payment screen of the mobile app.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
                >
                    <Plus size={18} />
                    <span>Add New Offer</span>
                </button>
            </div>

            {/* Content Card */}
            <div className="glass-card rounded-[32px] overflow-hidden border border-white/5 shadow-2xl">
                {error && (
                    <div className="m-6 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-2xl flex items-center gap-3">
                        <AlertCircle size={20} />
                        <span className="font-bold">{error}</span>
                    </div>
                )}

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-white/5 bg-white/5">
                                <th className="px-8 py-5 text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Offer Info</th>
                                <th className="px-8 py-5 text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Description</th>
                                <th className="px-8 py-5 text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Badge</th>
                                <th className="px-8 py-5 text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Action Button</th>
                                <th className="px-8 py-5 text-[10px] font-black text-white/40 uppercase tracking-[0.2em] text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center gap-4 text-white/40">
                                            <Loader2 size={40} className="animate-spin text-emerald-500" />
                                            <p className="font-bold uppercase tracking-widest text-xs">Loading Offers...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : offers.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center gap-4 text-white/20">
                                            <Sparkles size={40} />
                                            <p className="font-bold uppercase tracking-widest text-xs">No Offers Found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : offers.map(offer => (
                                <tr key={offer._id} className="hover:bg-white/[0.02] transition-colors group">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/20 border border-white/10 group-hover:border-emerald-500/50 transition-colors">
                                                <Percent size={20} className="text-emerald-500" />
                                            </div>
                                            <div>
                                                <div className="text-sm font-black text-white group-hover:text-emerald-400 transition-colors">{offer.title}</div>
                                                <div className="text-[10px] font-bold text-white/30 uppercase tracking-widest mt-1">ID: {offer._id.slice(-6).toUpperCase()}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="text-xs font-bold text-white/70 max-w-sm">{offer.description}</div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                                            offer.badge === 'CITY COMMUTE' 
                                            ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'
                                            : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                        }`}>
                                            {offer.badge}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="text-xs font-black text-white/80">{offer.actionText}</div>
                                        {offer.targetScreen && (
                                            <div className="text-[9px] font-bold text-white/30 uppercase tracking-widest mt-1">Screen: {offer.targetScreen}</div>
                                        )}
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <button 
                                            onClick={() => handleDelete(offer._id)}
                                            className="p-2 text-white/20 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Offer Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0f172a]/80 backdrop-blur-sm">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="glass-card w-full max-w-lg rounded-[40px] p-8 border border-white/10 shadow-2xl relative"
                    >
                        <button 
                            onClick={() => {
                                setIsModalOpen(false);
                            }}
                            className="absolute top-6 right-6 p-2 text-white/20 hover:text-white rounded-xl transition-colors"
                        >
                            <X size={24} />
                        </button>

                        <div className="mb-8">
                            <h2 className="text-2xl font-black text-white">Add Recommended Offer</h2>
                            <p className="text-white/40 text-sm font-bold uppercase tracking-widest mt-1">Configure offer for payments screen</p>
                        </div>

                        <form onSubmit={handleAddOffer} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-4">Offer Title</label>
                                <div className="relative group">
                                    <Sparkles className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-emerald-500 transition-colors" size={20} />
                                    <input
                                        required
                                        type="text"
                                        placeholder="e.g. Weekday Office Route"
                                        className="w-full bg-white/5 border border-white/10 rounded-[20px] pl-12 pr-4 py-4 text-white focus:outline-none focus:border-emerald-500/50 focus:bg-white/[0.08] transition-all font-bold"
                                        value={formData.title}
                                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-4">Description</label>
                                <div className="relative group">
                                    <FileText className="absolute left-4 top-5 text-white/20 group-focus-within:text-emerald-500 transition-colors" size={20} />
                                    <textarea
                                        required
                                        rows="3"
                                        placeholder="e.g. Save 10% on your morning commute to Tech Park."
                                        className="w-full bg-white/5 border border-white/10 rounded-[20px] pl-12 pr-4 py-4 text-white focus:outline-none focus:border-emerald-500/50 focus:bg-white/[0.08] transition-all font-bold resize-none"
                                        value={formData.description}
                                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-4">Badge / Category</label>
                                    <select
                                        className="w-full bg-white/5 border border-white/10 rounded-[20px] px-4 py-4 text-white focus:outline-none focus:border-emerald-500/50 focus:bg-white/[0.08] transition-all font-bold appearance-none cursor-pointer"
                                        value={formData.badge}
                                        onChange={(e) => setFormData({...formData, badge: e.target.value})}
                                    >
                                        <option value="CITY COMMUTE">CITY COMMUTE</option>
                                        <option value="INTER-CITY">INTER-CITY</option>
                                        <option value="MEGA OFFER">MEGA OFFER</option>
                                        <option value="WALLET BONUS">WALLET BONUS</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-4">Action Button Text</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="e.g. LEARN MORE"
                                        className="w-full bg-white/5 border border-white/10 rounded-[20px] px-4 py-4 text-white focus:outline-none focus:border-emerald-500/50 focus:bg-white/[0.08] transition-all font-bold"
                                        value={formData.actionText}
                                        onChange={(e) => setFormData({...formData, actionText: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-4">Target Screen (Optional)</label>
                                <div className="relative group">
                                    <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-emerald-500 transition-colors" size={20} />
                                    <input
                                        type="text"
                                        placeholder="e.g. Outstation (opens Outstation screen)"
                                        className="w-full bg-white/5 border border-white/10 rounded-[20px] pl-12 pr-4 py-4 text-white focus:outline-none focus:border-emerald-500/50 focus:bg-white/[0.08] transition-all font-bold"
                                        value={formData.targetScreen}
                                        onChange={(e) => setFormData({...formData, targetScreen: e.target.value})}
                                    />
                                </div>
                            </div>

                            <button
                                disabled={submitting}
                                type="submit"
                                className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-500/50 text-white py-5 rounded-[24px] font-black text-lg transition-all shadow-xl shadow-emerald-500/20 active:scale-95 mt-4 flex items-center justify-center gap-3"
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 className="animate-spin" size={24} />
                                        <span>Saving...</span>
                                    </>
                                ) : (
                                    <span>Save Offer</span>
                                )}
                            </button>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default Offers;
