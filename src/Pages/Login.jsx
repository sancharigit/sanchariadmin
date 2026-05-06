import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Car, Lock, Mail, AlertCircle, Loader2 } from 'lucide-react';
import axios from 'axios';

const Login = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        // Trim inputs
        const trimmedEmail = formData.email.trim();
        const trimmedPassword = formData.password.trim();

        // Validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!trimmedEmail) {
            setError('Email is required');
            setIsLoading(false);
            return;
        }
        if (!emailRegex.test(trimmedEmail)) {
            setError('Please enter a valid email address');
            setIsLoading(false);
            return;
        }
        if (!trimmedPassword) {
            setError('Password is required');
            setIsLoading(false);
            return;
        }
        if (trimmedPassword.length < 6) {
            setError('Password must be at least 6 characters long');
            setIsLoading(false);
            return;
        }

        try {
            if (!import.meta.env.VITE_API_BASE_URL) {
                setError('API Base URL is not configured. Please check environment variables.');
                setIsLoading(false);
                return;
            }
            const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/auth/login`, {
                email: trimmedEmail,
                password: trimmedPassword,
                role: 'admin'
            });

            const data = res.data; // Axios automatically parses JSON

            if (res.status === 200) { // Check for successful status code
                if (data.data.role !== 'admin') {
                    setError('Access denied. Admin privileges required.');
                    return;
                }

                localStorage.setItem('adminToken', data.data.token);
                localStorage.setItem('adminUser', JSON.stringify(data.data));
                navigate('/');
            } else {
                setError(data.message || 'Login failed');
            }
        } catch (err) {
            console.error(err);
            if (err.response?.status === 404) {
                setError('API endpoint not found (404). Please verify VITE_API_BASE_URL.');
            } else {
                setError('Network error. Is the server running?');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                <div className="p-8 bg-blue-600 text-center">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                        <Car className="text-white" size={32} />
                    </div>
                    <h1 className="text-2xl font-bold text-white">HybridRide Admin</h1>
                    <p className="text-blue-100 mt-2">Sign in to manage your platform</p>
                </div>

                <div className="p-8">
                    {error && (
                        <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-600 text-sm">
                            <AlertCircle size={16} />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="email"
                                    required
                                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="admin@hybridride.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="password"
                                    required
                                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                        >
                            {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Sign In'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
