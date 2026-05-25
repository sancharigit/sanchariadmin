import React, { useState, useEffect, useCallback } from 'react';
import {
    Search, Plus, MapPin, Tag, Trash2, AlertCircle, 
    Image as ImageIcon, Loader2, X, Edit2
} from 'lucide-react';
import axios from 'axios';
import { motion } from 'framer-motion';

const PromotedRoutes = () => {
    const [activeTab, setActiveTab] = useState('trending_route');
    const [routes, setRoutes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        startingPrice: '',
        pickup: '',
        destination: '',
        subtitle: '',
        tag: '',
        discount: ''
    });
    const [imageFile, setImageFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const fetchRoutes = useCallback(async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('adminToken');
            const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/admin/promoted-routes`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.data.success) {
                setRoutes(res.data.data);
            } else {
                setError(res.data.message);
            }
        } catch (err) {
            console.error('Failed to fetch routes:', err);
            setError(err.response?.data?.message || 'Failed to connect to server');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRoutes();
    }, [fetchRoutes]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleAddRoute = async (e) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            const token = localStorage.getItem('adminToken');
            
            const data = new FormData();
            data.append('name', formData.name);
            data.append('category', activeTab);
            
            if (activeTab === 'trending_route') {
                data.append('startingPrice', formData.startingPrice);
                data.append('pickup', formData.pickup);
                data.append('destination', formData.destination);
                if (formData.subtitle) data.append('subtitle', formData.subtitle);
                if (formData.tag) data.append('tag', formData.tag);
                if (formData.discount) data.append('discount', formData.discount);
            }

            if (imageFile) {
                data.append('image', imageFile);
            } else if (editingId && previewUrl && !previewUrl.startsWith('blob:')) {
                data.append('image', previewUrl);
            }

            const url = editingId 
                ? `${import.meta.env.VITE_API_BASE_URL}/api/admin/promoted-routes/${editingId}`
                : `${import.meta.env.VITE_API_BASE_URL}/api/admin/promoted-routes`;
            const method = editingId ? 'put' : 'post';

            const res = await axios[method](url, data, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (res.data.success) {
                if (editingId) {
                    setRoutes(routes.map(r => r._id === editingId ? res.data.data : r));
                } else {
                    setRoutes([res.data.data, ...routes]);
                }
                
                setIsModalOpen(false);
                setEditingId(null);
                setFormData({ 
                    name: '', startingPrice: '',
                    pickup: '', destination: '', subtitle: '', tag: '', 
                    discount: ''
                });
                setImageFile(null);
                setPreviewUrl(null);
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to save route');
        } finally {
            setSubmitting(false);
        }
    };

    const handleEditClick = (route) => {
        setEditingId(route._id);
        setFormData({
            name: route.name || '',
            startingPrice: route.startingPrice || '',
            pickup: route.pickup || '',
            destination: route.destination || '',
            subtitle: route.subtitle || '',
            tag: route.tag || '',
            discount: route.discount || ''
        });
        setPreviewUrl(route.image || null);
        setImageFile(null);
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this route?')) return;
        try {
            const token = localStorage.getItem('adminToken');
            await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/api/admin/promoted-routes/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setRoutes(routes.filter(r => r._id !== id));
        } catch (err) {
            alert('Failed to delete route');
        }
    };

    const filteredRoutes = routes.filter(route => route.category === activeTab);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-col gap-2">
                    <h1 className="text-2xl font-bold text-white">Promoted Content</h1>
                    <p className="text-white/60 text-sm">Manage trending destinations and banners.</p>
                </div>
                <div className="flex gap-2 p-1 bg-white/5 border border-white/10 rounded-2xl">
                    <button
                        onClick={() => setActiveTab('trending_route')}
                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                            activeTab === 'trending_route' 
                                ? 'bg-emerald-500 text-white shadow-lg' 
                                : 'text-white/40 hover:text-white hover:bg-white/5'
                        }`}
                    >
                        Trending Routes
                    </button>
                    <button
                        onClick={() => setActiveTab('trending_now')}
                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                            activeTab === 'trending_now' 
                                ? 'bg-emerald-500 text-white shadow-lg' 
                                : 'text-white/40 hover:text-white hover:bg-white/5'
                        }`}
                    >
                        Trending Now (Images)
                    </button>
                </div>
                <button
                    onClick={() => {
                        setEditingId(null);
                        setFormData({ 
                            name: '', startingPrice: '',
                            pickup: '', destination: '', subtitle: '', tag: '', 
                            discount: ''
                        });
                        setPreviewUrl(null);
                        setImageFile(null);
                        setIsModalOpen(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
                >
                    <Plus size={18} />
                    <span>Add New {activeTab === 'trending_now' ? 'Image' : 'Route'}</span>
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
                                <th className="px-8 py-5 text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">{activeTab === 'trending_now' ? 'Image Name' : 'Route Info'}</th>
                                {activeTab === 'trending_route' && (
                                    <>
                                        <th className="px-8 py-5 text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Route Path</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Starting Price</th>
                                    </>
                                )}
                                <th className="px-8 py-5 text-[10px] font-black text-white/40 uppercase tracking-[0.2em] text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr>
                                    <td colSpan={activeTab === 'trending_now' ? 2 : 4} className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center gap-4 text-white/40">
                                            <Loader2 size={40} className="animate-spin text-emerald-500" />
                                            <p className="font-bold uppercase tracking-widest text-xs">Loading Content...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredRoutes.length === 0 ? (
                                <tr>
                                    <td colSpan={activeTab === 'trending_now' ? 2 : 4} className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center gap-4 text-white/20">
                                            {activeTab === 'trending_now' ? <ImageIcon size={40} /> : <MapPin size={40} />}
                                            <p className="font-bold uppercase tracking-widest text-xs">No Content Found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredRoutes.map(route => (
                                <tr key={route._id} className="hover:bg-white/[0.02] transition-colors group">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className={`${activeTab === 'trending_now' ? 'h-24 w-24 rounded-lg' : 'h-12 w-12 rounded-2xl'} bg-white/5 flex items-center justify-center text-white/20 overflow-hidden border border-white/10 group-hover:border-emerald-500/50 transition-colors`}>
                                                {route.image ? (
                                                    <img src={route.image} alt={route.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <MapPin size={20} />
                                                )}
                                            </div>
                                            <div>
                                                <div className="text-sm font-black text-white group-hover:text-emerald-400 transition-colors">{route.name}</div>
                                                {activeTab === 'trending_route' && (
                                                    <>
                                                        <div className="text-[10px] font-bold text-white/40 mt-1">{route.subtitle}</div>
                                                        {route.tag && <div className="text-[10px] font-bold text-emerald-500 mt-1">{route.tag}</div>}
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    {activeTab === 'trending_route' && (
                                        <>
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-2">
                                                    <div className="flex flex-col">
                                                        <div className="text-xs font-bold text-white/60">From: {route.pickup}</div>
                                                        <div className="text-xs font-bold text-white/60">To: {route.destination}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="text-sm font-black text-white">₹{route.startingPrice}</div>
                                                {route.discount && <div className="text-[10px] font-bold text-emerald-400 mt-1">{route.discount}</div>}
                                            </td>
                                        </>
                                    )}
                                    <td className="px-8 py-5 text-right space-x-2 whitespace-nowrap">
                                        <button 
                                            onClick={() => handleEditClick(route)}
                                            className="p-2 text-white/20 hover:text-emerald-500 hover:bg-emerald-500/10 rounded-xl transition-all"
                                        >
                                            <Edit2 size={18} />
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(route._id)}
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

            {/* Add Route Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0f172a]/80 backdrop-blur-sm overflow-y-auto">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="glass-card w-full max-w-2xl rounded-[40px] p-8 border border-white/10 shadow-2xl relative my-8"
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
                            <h2 className="text-2xl font-black text-white">{editingId ? 'Edit' : 'Add'} {activeTab === 'trending_now' ? 'Trending Now Image' : 'Trending Route'}</h2>
                            <p className="text-white/40 text-sm font-bold uppercase tracking-widest mt-1">Configure content</p>
                        </div>

                        <form onSubmit={handleAddRoute} className="space-y-6">
                            <div className={`grid ${activeTab === 'trending_route' ? 'grid-cols-2' : 'grid-cols-1'} gap-6`}>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-4">{activeTab === 'trending_now' ? 'Name (Internal)' : 'Name (Internal)'}</label>
                                    <div className="relative group">
                                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-emerald-500 transition-colors" size={20} />
                                        <input
                                            required
                                            type="text"
                                            placeholder={activeTab === 'trending_now' ? "e.g. Summer Promo Image" : "e.g. Hyderabad to Warangal"}
                                            className="w-full bg-white/5 border border-white/10 rounded-[20px] pl-12 pr-4 py-4 text-white focus:outline-none focus:border-emerald-500/50 focus:bg-white/[0.08] transition-all font-bold"
                                            value={formData.name}
                                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                                        />
                                    </div>
                                </div>
                                
                                {activeTab === 'trending_route' && (
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-4">Subtitle</label>
                                        <div className="relative group">
                                            <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-emerald-500 transition-colors" size={20} />
                                            <input
                                                type="text"
                                                placeholder="e.g. Heritage & Food Trail"
                                                className="w-full bg-white/5 border border-white/10 rounded-[20px] pl-12 pr-4 py-4 text-white focus:outline-none focus:border-emerald-500/50 focus:bg-white/[0.08] transition-all font-bold"
                                                value={formData.subtitle}
                                                onChange={(e) => setFormData({...formData, subtitle: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {activeTab === 'trending_route' && (
                                <>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-4">Pickup Point</label>
                                            <div className="relative group">
                                                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-emerald-500 transition-colors" size={20} />
                                                <input
                                                    required
                                                    type="text"
                                                    placeholder="e.g. Hyderabad"
                                                    className="w-full bg-white/5 border border-white/10 rounded-[20px] pl-12 pr-4 py-4 text-white focus:outline-none focus:border-emerald-500/50 focus:bg-white/[0.08] transition-all font-bold"
                                                    value={formData.pickup}
                                                    onChange={(e) => setFormData({...formData, pickup: e.target.value})}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-4">Destination Point</label>
                                            <div className="relative group">
                                                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-emerald-500 transition-colors" size={20} />
                                                <input
                                                    required
                                                    type="text"
                                                    placeholder="e.g. Warangal"
                                                    className="w-full bg-white/5 border border-white/10 rounded-[20px] pl-12 pr-4 py-4 text-white focus:outline-none focus:border-emerald-500/50 focus:bg-white/[0.08] transition-all font-bold"
                                                    value={formData.destination}
                                                    onChange={(e) => setFormData({...formData, destination: e.target.value})}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-4">Starting Price</label>
                                            <div className="relative group">
                                                <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-emerald-500 transition-colors" size={20} />
                                                <input
                                                    required
                                                    type="number"
                                                    placeholder="299"
                                                    className="w-full bg-white/5 border border-white/10 rounded-[20px] pl-12 pr-4 py-4 text-white focus:outline-none focus:border-emerald-500/50 focus:bg-white/[0.08] transition-all font-bold"
                                                    value={formData.startingPrice}
                                                    onChange={(e) => setFormData({...formData, startingPrice: e.target.value})}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-4">Discount Text</label>
                                            <div className="relative group">
                                                <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-emerald-500 transition-colors" size={20} />
                                                <input
                                                    type="text"
                                                    placeholder="e.g. Save up to 20%"
                                                    className="w-full bg-white/5 border border-white/10 rounded-[20px] pl-12 pr-4 py-4 text-white focus:outline-none focus:border-emerald-500/50 focus:bg-white/[0.08] transition-all font-bold"
                                                    value={formData.discount}
                                                    onChange={(e) => setFormData({...formData, discount: e.target.value})}
                                                />
                                            </div>
                                        </div>
                                        
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-4">Badge Tag</label>
                                            <div className="relative group">
                                                <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-emerald-500 transition-colors" size={20} />
                                                <input
                                                    type="text"
                                                    placeholder="e.g. 🔥 Weekend Favorite"
                                                    className="w-full bg-white/5 border border-white/10 rounded-[20px] pl-12 pr-4 py-4 text-white focus:outline-none focus:border-emerald-500/50 focus:bg-white/[0.08] transition-all font-bold"
                                                    value={formData.tag}
                                                    onChange={(e) => setFormData({...formData, tag: e.target.value})}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-4">Route Image</label>
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
                                    <span>{editingId ? 'Save Changes' : 'Save Content'}</span>
                                )}
                            </button>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default PromotedRoutes;
