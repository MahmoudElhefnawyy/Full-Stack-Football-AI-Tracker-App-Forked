import { useState } from 'react';
import { User, Lock, Bell, Save, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import BlurIn from '../components/ui/BlurIn';
import GlassCard from '../components/ui/GlassCard';
import SectionLabel from '../components/ui/SectionLabel';

type Tab = 'profile' | 'security' | 'notifications';

const tabs: { id: Tab; label: string; icon: typeof User }[] = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
];

const Field = ({ label, id, type = 'text', defaultValue = '', placeholder = '' }: {
    label: string; id: string; type?: string; defaultValue?: string; placeholder?: string;
}) => (
    <div className="flex flex-col gap-1.5">
        <label htmlFor={id} className="font-mono text-[10px] uppercase tracking-widest text-muted">{label}</label>
        <input
            id={id} type={type} defaultValue={defaultValue} placeholder={placeholder}
            className="w-full bg-surface-2 border border-border rounded-xl px-4 py-3.5 text-sm text-foreground placeholder:text-muted outline-none focus:border-primary transition-colors duration-200"
        />
    </div>
);

const ToggleRow = ({ label, sub, defaultChecked = false }: { label: string; sub: string; defaultChecked?: boolean }) => {
    const [on, setOn] = useState(defaultChecked);
    return (
        <div className="flex items-center justify-between py-4 border-b border-border last:border-0">
            <div>
                <p className="text-sm font-semibold text-foreground">{label}</p>
                <p className="font-mono text-[10px] text-muted mt-0.5">{sub}</p>
            </div>
            <button
                onClick={() => setOn(!on)}
                className={`relative h-6 w-11 rounded-full transition-colors duration-200 ${on ? 'bg-primary' : 'bg-border'}`}
            >
                <motion.span
                    animate={{ x: on ? 20 : 2 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    className="absolute top-1 h-4 w-4 rounded-full bg-background shadow-sm"
                />
            </button>
        </div>
    );
};

const Settings = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<Tab>('profile');
    const [saved, setSaved] = useState(false);

    const handleSave = () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    return (
        <div className="max-w-5xl mx-auto px-6 md:px-10 py-32">

            <BlurIn className="mb-12">
                <SectionLabel number="00" path="~/settings" className="mb-4" />
                <h1 className="font-display font-black text-3xl md:text-4xl text-foreground mt-4">
                    Account <span className="text-primary">Settings.</span>
                </h1>
                <p className="text-muted text-sm mt-2">Manage your profile, security, and notification preferences.</p>
            </BlurIn>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

                {/* Sidebar tabs */}
                <div className="md:col-span-1">
                    <BlurIn delay={0.1}>
                        <GlassCard className="p-2 flex flex-col gap-1">
                            {tabs.map(({ id, label, icon: Icon }) => (
                                <button
                                    key={id}
                                    onClick={() => setActiveTab(id)}
                                    className={[
                                        'relative flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 text-sm font-semibold',
                                        activeTab === id
                                            ? 'text-primary'
                                            : 'text-muted hover:text-foreground',
                                    ].join(' ')}
                                >
                                    {activeTab === id && (
                                        <motion.div
                                            layoutId="settingsTab"
                                            className="absolute inset-0 bg-primary/10 border border-primary/20 rounded-xl"
                                            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                                        />
                                    )}
                                    <Icon className="h-4 w-4 relative z-10" />
                                    <span className="relative z-10">{label}</span>
                                </button>
                            ))}
                        </GlassCard>
                    </BlurIn>
                </div>

                {/* Content */}
                <div className="md:col-span-3 space-y-6">
                    <BlurIn delay={0.15}>

                        {/* Profile Tab */}
                        {activeTab === 'profile' && (
                            <GlassCard className="p-8 space-y-6">
                                {/* Avatar row */}
                                <div className="flex items-center gap-5 pb-6 border-b border-border">
                                    <div className="h-16 w-16 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center font-mono font-bold text-2xl text-primary">
                                        {user?.name?.substring(0, 2).toUpperCase() ?? 'AN'}
                                    </div>
                                    <div>
                                        <p className="font-display font-bold text-base text-foreground">{user?.name ?? 'Anonymous'}</p>
                                        <p className="font-mono text-xs text-muted mt-0.5">{user?.email ?? '—'}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <Field id="s-fname" label="First Name" defaultValue={user?.name?.split(' ')[0] ?? ''} />
                                    <Field id="s-lname" label="Last Name" defaultValue={user?.name?.split(' ')[1] ?? ''} />
                                </div>
                                <Field id="s-email" label="Email Address" type="email" defaultValue={user?.email ?? ''} />
                                <Field id="s-role" label="Role" defaultValue="Coach / Analyst" />
                            </GlassCard>
                        )}

                        {/* Security Tab */}
                        {activeTab === 'security' && (
                            <GlassCard className="p-8 space-y-5">
                                <div className="flex items-center gap-2 pb-4 border-b border-border">
                                    <Lock className="h-4 w-4 text-primary" />
                                    <span className="font-mono text-xs text-muted uppercase tracking-widest">Change Password</span>
                                </div>
                                <Field id="s-curpass" label="Current Password" type="password" placeholder="••••••••" />
                                <Field id="s-newpass" label="New Password" type="password" placeholder="Min. 8 characters" />
                                <Field id="s-confpass" label="Confirm New Password" type="password" placeholder="Repeat new password" />

                                <div className="pt-4 border-t border-border">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Shield className="h-4 w-4 text-primary" />
                                        <span className="font-mono text-xs text-muted uppercase tracking-widest">Security</span>
                                    </div>
                                    <ToggleRow label="Two-factor Authentication" sub="Add an extra layer of security to your account" />
                                    <ToggleRow label="Login Notifications" sub="Get notified on new sign-ins to your account" defaultChecked />
                                </div>
                            </GlassCard>
                        )}

                        {/* Notifications Tab */}
                        {activeTab === 'notifications' && (
                            <GlassCard className="p-8">
                                <div className="flex items-center gap-2 pb-4 mb-2 border-b border-border">
                                    <Bell className="h-4 w-4 text-primary" />
                                    <span className="font-mono text-xs text-muted uppercase tracking-widest">Notification Preferences</span>
                                </div>
                                <ToggleRow label="Analysis Complete" sub="Notify when your video finishes processing" defaultChecked />
                                <ToggleRow label="New Recommendations" sub="Receive AI insights after each analysis" defaultChecked />
                                <ToggleRow label="System Updates" sub="Platform news and feature announcements" />
                                <ToggleRow label="Weekly Digest" sub="Weekly summary of your analytics activity" />
                                <ToggleRow label="Marketing Emails" sub="Tips, tutorials, and product updates" />
                            </GlassCard>
                        )}

                        {/* Save button */}
                        <motion.button
                            onClick={handleSave}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className={`btn-primary h-11 px-8 text-sm w-full sm:w-auto transition-all duration-300 ${saved ? 'bg-primary/80' : ''}`}
                        >
                            <Save className="h-4 w-4" />
                            {saved ? 'Saved ✓' : 'Save Changes'}
                        </motion.button>
                    </BlurIn>
                </div>
            </div>
        </div>
    );
};

export default Settings;
