import React, { useState, useEffect, useCallback } from 'react';
import {
    Search, Plus, Tag, Trash2, AlertCircle, 
    Sparkles, Percent, Loader2, X, FileText, Edit2,
    Image as ImageIcon
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
        badge: 'CITY POOLING',
        actionText: 'Explore',
        targetScreen: 'PassengerHome',
        pillText: 'Up to ₹60 off'
    });
    const [imageFile, setImageFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [editingId, setEditingId] = useState(null);

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

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleAddOffer = async (e) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            const token = localStorage.getItem('adminToken');
            
            const data = new FormData();
            data.append('title', formData.title);
            data.append('description', formData.description);
            data.append('badge', formData.badge);
            data.append('actionText', formData.actionText);
            data.append('targetScreen', formData.targetScreen);
            data.append('pillText', formData.pillText);

            if (imageFile) {
                data.append('image', imageFile);
            } else if (editingId && previewUrl && !previewUrl.startsWith('blob:')) {
                data.append('image', previewUrl);
            }

            const url = editingId 
                ? `${import.meta.env.VITE_API_BASE_URL}/api/admin/offers/${editingId}`
                : `${import.meta.env.VITE_API_BASE_URL}/api/admin/offers`;
            const method = editingId ? 'put' : 'post';

            const res = await axios[method](url, data, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (res.data.success) {
                if (editingId) {
                    setOffers(offers.map(o => o._id === editingId ? res.data.data : o));
                } else {
                    setOffers([res.data.data, ...offers]);
                }
                
                setIsModalOpen(false);
                setEditingId(null);
                setFormData({
                    title: '',
                    description: '',
                    badge: 'CITY POOLING',
                    actionText: 'Explore',
                    targetScreen: 'PassengerHome',
                    pillText: 'Up to ₹60 off'
                });
                setImageFile(null);
                setPreviewUrl(null);
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to save offer');
        } finally {
            setSubmitting(false);
        }
    };

    const handleEditClick = (offer) => {
        setEditingId(offer._id);
        setFormData({
            title: offer.title || '',
            description: offer.description || '',
            badge: offer.badge || 'CITY POOLING',
            actionText: offer.actionText || 'Explore',
            targetScreen: offer.targetScreen || 'PassengerHome',
            pillText: offer.pillText || ''
        });
        setPreviewUrl(offer.image || null);
        setImageFile(null);
        setIsModalOpen(true);
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
                    onClick={() => {
                        setEditingId(null);
                        setFormData({
                            title: '',
                            description: '',
                            badge: 'CITY POOLING',
                            actionText: 'Explore',
                            targetScreen: 'PassengerHome',
                            pillText: 'Up to ₹60 off'
                        });
                        setPreviewUrl(null);
                        setImageFile(null);
                        setIsModalOpen(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
                >
                    <Plus size={18} />
                    <span>Add New Offer</span>
                </button>
            </div>
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
                                            <div className="h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/20 overflow-hidden border border-white/10 group-hover:border-emerald-500/50 transition-colors">
                                                {offer.image ? (
                                                    <img src={offer.image} alt={offer.title} className="w-full h-full object-cover" />
                                                ) : (
                                                    <Percent size={20} className="text-emerald-500" />
                                                )}
                                            </div>
                                            <div>
                                                <div className="text-sm font-black text-white group-hover:text-emerald-400 transition-colors">{offer.title}</div>
                                                <div className="text-[10px] font-bold text-white/30 uppercase tracking-widest mt-1">ID: {offer._id.slice(-6).toUpperCase()}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="text-xs font-bold text-white/70 max-w-sm">{offer.description}</div>
                                        {offer.pillText && (
                                            <div className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mt-1">Pill: {offer.pillText}</div>
                                        )}
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                                            offer.badge === 'CITY POOLING' 
                                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                            : offer.badge === 'CITY INSTANT'
                                            ? 'bg-sky-500/10 border-sky-500/20 text-sky-400'
                                            : offer.badge === 'OUTSTATION POOLING'
                                            ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                                            : offer.badge === 'OUTSTATION RENTAL'
                                            ? 'bg-purple-500/10 border-purple-500/20 text-purple-400'
                                            : 'bg-gray-500/10 border-gray-500/20 text-gray-400'
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
                                    <td className="px-8 py-5 text-right space-x-2 whitespace-nowrap">
                                        <button 
                                            onClick={() => handleEditClick(offer)}
                                            className="p-2 text-white/20 hover:text-emerald-500 hover:bg-emerald-500/10 rounded-xl transition-all"
                                        >
                                            <Edit2 size={18} />
                                        </button>
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
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0f172a]/80 backdrop-blur-sm overflow-y-auto">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="glass-card w-full max-w-lg rounded-[40px] p-8 border border-white/10 shadow-2xl relative my-8 max-h-[90vh] overflow-y-auto"
                    >
                        <button 
                            onClick={() => {
                                setIsModalOpen(false);
                                setPreviewUrl(null);
                                setImageFile(null);
                            }}
                            className="absolute top-6 right-6 p-2 text-white/20 hover:text-white rounded-xl transition-colors"
                        >
                            <X size={24} />
                        </button>

                        <div className="mb-8">
                            <h2 className="text-2xl font-black text-white">{editingId ? 'Edit' : 'Add'} Recommended Offer</h2>
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
                                        onChange={(e) => {
                                            const badge = e.target.value;
                                            let actionText = 'Explore';
                                            let targetScreen = 'PassengerHome';
                                            let pillText = 'Up to ₹60 off';
                                            if (badge === 'CITY POOLING') {
                                                actionText = 'Explore';
                                                targetScreen = 'PassengerHome';
                                                pillText = 'Up to ₹60 off';
                                            } else if (badge === 'CITY INSTANT') {
                                                actionText = 'Book now';
                                                targetScreen = 'PassengerHome';
                                                pillText = '15% cashback';
                                            } else if (badge === 'OUTSTATION POOLING') {
                                                actionText = 'Check routes';
                                                targetScreen = 'Outstation';
                                                pillText = 'Save up to ₹120';
                                            } else if (badge === 'OUTSTATION RENTAL') {
                                                actionText = 'View plans';
                                                targetScreen = 'Outstation';
                                                pillText = 'Flat ₹200 off';
                                            }
                                            setFormData({
                                                ...formData,
                                                badge,
                                                actionText,
                                                targetScreen,
                                                pillText
                                            });
                                        }}
                                    >
                                         <option className="text-slate-800 bg-white" value="CITY POOLING">CITY POOLING</option>
                                         <option className="text-slate-800 bg-white" value="CITY INSTANT">CITY INSTANT</option>
                                         <option className="text-slate-800 bg-white" value="OUTSTATION POOLING">OUTSTATION POOLING</option>
                                         <option className="text-slate-800 bg-white" value="OUTSTATION RENTAL">OUTSTATION RENTAL</option>
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

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-4">Pill Text (Offer Value)</label>
                                    <div className="relative group">
                                        <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-emerald-500 transition-colors" size={20} />
                                        <input
                                            required
                                            type="text"
                                            placeholder="e.g. Up to ₹60 off"
                                            className="w-full bg-white/5 border border-white/10 rounded-[20px] pl-12 pr-4 py-4 text-white focus:outline-none focus:border-emerald-500/50 focus:bg-white/[0.08] transition-all font-bold"
                                            value={formData.pillText}
                                            onChange={(e) => setFormData({...formData, pillText: e.target.value})}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-4">Target Screen</label>
                                    <div className="relative group">
                                        <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-emerald-500 transition-colors" size={20} />
                                        <input
                                            type="text"
                                            placeholder="e.g. PassengerHome"
                                            className="w-full bg-white/5 border border-white/10 rounded-[20px] pl-12 pr-4 py-4 text-white focus:outline-none focus:border-emerald-500/50 focus:bg-white/[0.08] transition-all font-bold"
                                            value={formData.targetScreen}
                                            onChange={(e) => setFormData({...formData, targetScreen: e.target.value})}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-4">Offer Image</label>
                                <div className="flex flex-col gap-4">
                                    {previewUrl ? (
                                        <div className="relative w-full h-40 rounded-[24px] overflow-hidden border border-white/10 group">
                                            <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                            <button 
                                                type="button"
                                                onClick={() => {
                                                    setPreviewUrl(null);
                                                    setImageFile(null);
                                                }}
                                                className="absolute top-2 right-2 p-2 bg-rose-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    ) : (
                                        <label className="w-full h-40 rounded-[24px] border-2 border-dashed border-white/10 hover:border-emerald-500/50 hover:bg-white/5 transition-all flex flex-col items-center justify-center gap-3 cursor-pointer group">
                                            <div className="p-4 rounded-2xl bg-white/5 text-white/20 group-hover:text-emerald-500 transition-colors">
                                                <ImageIcon size={32} />
                                            </div>
                                            <div className="text-center">
                                                <p className="text-sm font-bold text-white">Click to upload image</p>
                                                <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mt-1">JPG, PNG, WEBP up to 5MB</p>
                                            </div>
                                            <input
                                                type="file"
                                                className="hidden"
                                                accept="image/*"
                                                onChange={handleFileChange}
                                            />
                                        </label>
                                    )}
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
                                    <span>{editingId ? 'Save Changes' : 'Save Offer'}</span>
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
