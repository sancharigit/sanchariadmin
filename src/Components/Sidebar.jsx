import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion'; // eslint-disable-line no-unused-vars
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, Users, GraduationCap, Bike, School, Banknote,
    CalendarCheck, Settings, LogOut, ChevronDown, ChevronRight,
    UserCog, Building2, UsersRound, FileText, CreditCard, Key, ClipboardList,
    ShieldCheck, Bell, Activity, UserPlus, Shield, Mail, Calendar, MapPin, List, Car, AlertCircle, User,
    X, Search, Filter, MoreVertical, Wallet, Tag, MessageSquare, Sparkles
} from 'lucide-react';

const Sidebar = ({ isOpen, toggleSidebar }) => {
    const location = useLocation();
    const navigate = useNavigate();

    const adminUser = JSON.parse(localStorage.getItem('adminUser') || '{}');

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        navigate('/login');
    };
    // Initialize with the top-level group managed expanded
    const [expandedGroups, setExpandedGroups] = useState(['finance']);

    const toggleGroup = (groupId) => {
        setExpandedGroups(prev =>
            prev.includes(groupId)
                ? prev.filter(id => id !== groupId)
                : [...prev, groupId]
        );
    };

    const isActive = (path) => location.pathname === path;

    // Helper to check if any child of a group is active
    const isGroupActive = (item) => {
        if (item.path && isActive(item.path)) return true;
        if (item.subMenus) {
            return item.subMenus.some(subItem => isGroupActive(subItem));
        }
        return false;
    };

    const menuGroups = [
        {
            id: 'dashboard',
            title: 'Dashboard',
            icon: LayoutDashboard,
            path: '/',
            type: 'single'
        },
        {
            id: 'user-management',
            title: 'User Management',
            icon: Users,
            type: 'group',
            subMenus: [
                { title: 'Passengers', path: '/passengers', icon: User },
                { title: 'Drivers', path: '/drivers', icon: UserCog },
                { title: 'Driver Offers', path: '/drivers/offers', icon: Sparkles },
            ]
        },
        {
            id: 'ride-management',
            title: 'Ride Management',
            icon: MapPin,
            type: 'group',
            subMenus: [
                { title: 'Live Rides', path: '/rides/live', icon: Activity },
                { title: 'Pool Management', path: '/rides/pools', icon: List },
                { title: 'Promoted Routes', path: '/rides/promoted', icon: Tag },
                { title: 'Recommended Offers', path: '/rides/offers', icon: Sparkles },
                { title: 'Ride History', path: '/rides/history', icon: CalendarCheck },
                // { title: 'Disputes', path: '/rides/disputes', icon: AlertCircle },
            ]
        },
        {
            id: 'payments',
            title: 'Payments & Earnings',
            icon: Banknote,
            type: 'group',
            subMenus: [
                { title: 'Driver Wallets', path: '/payments/wallets/drivers', icon: Wallet },
                { title: 'Passenger Wallets', path: '/payments/wallets/passengers', icon: Wallet },
                { title: 'Transactions', path: '/payments/transactions', icon: FileText },
            ]
        },
    ];

    return (
        <motion.div
            initial={{ x: -280 }}
            animate={{ x: isOpen ? 0 : -280 }}
            transition={{ type: "spring", damping: 20, stiffness: 100 }}
            className="h-screen w-72 glass-panel flex flex-col fixed left-0 top-0 z-50 rounded-r-[40px] border-r border-white/10"
        >
            {/* Header / Logo Section */}
            <div className="p-8 border-b border-white/5">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 grad-emerald rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 rotate-3">
                            <Bike size={28} strokeWidth={2.5} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-white tracking-tight leading-none">SANCHARI</h1>
                            <div className="flex items-center gap-1.5 mt-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <p className="text-[10px] font-bold text-emerald-500/80 uppercase tracking-[0.2em]">Partner Admin</p>
                            </div>
                        </div>
                    </div>
                    <button onClick={toggleSidebar} className="lg:hidden text-white/40 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>
            </div>

            {/* Navigation Section */}
            <nav className="flex-1 overflow-y-auto pt-8 px-6 space-y-8 scrollbar-hide">
                {menuGroups.map((group) => (
                    <div key={group.id} className="space-y-3">
                        <p className="px-4 text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">
                            {group.title}
                        </p>
                        <ul className="space-y-1.5">
                            {group.type === 'single' ? (
                                renderMenuItem(group, 0)
                            ) : (
                                group.subMenus.map(subItem => renderMenuItem(subItem, 1))
                            )}
                        </ul>
                    </div>
                ))}
            </nav>

            {/* Footer / Profile Section */}
            <div className="p-6">
                <div className="glass-card rounded-[32px] p-4 flex items-center gap-4 group">
                    <div className="relative">
                        <div className="h-12 w-12 rounded-2xl grad-indigo flex items-center justify-center text-white font-black text-lg shadow-inner">
                            {adminUser?.name?.charAt(0)?.toUpperCase() || 'A'}
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-4 border-[#0f172a]" />
                    </div>

                    <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-white truncate group-hover:text-emerald-400 transition-colors">
                            {adminUser?.name || 'Super Admin'}
                        </h4>
                        <p className="text-[10px] font-medium text-white/40 truncate uppercase tracking-wider">
                            {adminUser?.role || 'Authority'}
                        </p>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="h-10 w-10 rounded-xl flex items-center justify-center text-white/20 hover:text-rose-500 hover:bg-rose-500/10 transition-all duration-300"
                        title="Sign Out"
                    >
                        <LogOut size={20} />
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

// --- Updated Item Rendering for Glass Theme ---
const renderMenuItem = (item, level = 0) => {
    const location = useLocation();
    const active = location.pathname === item.path;
    const Icon = item.icon;

    return (
        <li key={item.path || item.title}>
            <Link
                to={item.path}
                className={`
                    group flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300 relative overflow-hidden
                    ${active
                        ? 'bg-emerald-500/10 border border-emerald-500/20 shadow-lg shadow-emerald-500/5'
                        : 'hover:bg-white/5 border border-transparent'
                    }
                `}
            >
                {/* Active Indicator Glow */}
                {active && (
                    <motion.div
                        layoutId="active-pill"
                        className="absolute left-0 top-1/4 bottom-1/4 w-1 grad-emerald rounded-r-full"
                    />
                )}

                <Icon
                    size={20}
                    className={`transition-colors duration-300 ${active ? 'text-emerald-500' : 'text-white/40 group-hover:text-white'}`}
                    strokeWidth={active ? 2.5 : 2}
                />

                <span className={`text-sm font-bold tracking-tight transition-colors duration-300 ${active ? 'text-white' : 'text-white/40 group-hover:text-white'}`}>
                    {item.title}
                </span>

                {active && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="ml-auto"
                    >
                        <ChevronRight size={14} className="text-emerald-500/50" />
                    </motion.div>
                )}
            </Link>
        </li>
    );
};

export default Sidebar;
