import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, UserPlus, User, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { api } from '../services/api';
import toast from 'react-hot-toast';
import BlurIn from '../components/ui/BlurIn';
import GlassCard from '../components/ui/GlassCard';
import SectionLabel from '../components/ui/SectionLabel';

const Field = ({
    id, label, type = 'text', value, onChange, required = true,
    icon: Icon, showToggle = false, show, onToggle, placeholder = ''
}: any) => (
    <div className="relative">
        <Icon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted pointer-events-none z-10" />
        <input
            id={id} type={showToggle ? (show ? 'text' : 'password') : type}
            value={value} onChange={onChange} required={required}
            placeholder={placeholder || label} minLength={type === 'password' ? 6 : undefined}
            className="w-full bg-surface-2 border border-border rounded-xl pl-11 pr-12 py-4 text-foreground text-sm outline-none transition-colors duration-200 focus:border-primary placeholder:text-muted"
        />
        {showToggle && (
            <button type="button" onClick={onToggle}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition-colors">
                {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
        )}
    </div>
);

const RegisterPage = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) { toast.error('Passwords do not match'); return; }
        setIsLoading(true);
        try {
            const response = await api.auth.register({ name, email, password });
            login(response);
            toast.success('Account created successfully!');
            navigate('/dashboard');
        } catch (err) {
            console.error('Registration error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen flex items-center justify-center px-6 pt-24 pb-16 bg-background overflow-hidden">
            <div className="pointer-events-none absolute inset-0 z-0">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px]" />
                <div className="dot-grid absolute inset-0" />
            </div>

            <span aria-hidden className="corner-marker top-24 left-6 z-10">+</span>
            <span aria-hidden className="corner-marker top-24 right-6 z-10">+</span>
            <span aria-hidden className="corner-marker bottom-8 left-6 z-10">+</span>
            <span aria-hidden className="corner-marker bottom-8 right-6 z-10">+</span>

            <div className="relative z-10 w-full max-w-md">
                <BlurIn className="mb-10 text-center">
                    <SectionLabel number="02" path="~/auth/register" className="justify-center mb-6" />
                    <h1 className="font-display font-black text-4xl md:text-5xl text-foreground mt-4">
                        Join <span className="text-primary">GoalSense.</span>
                    </h1>
                    <p className="text-muted text-sm mt-3">Create your free account and start analyzing.</p>
                </BlurIn>

                <BlurIn delay={0.15}>
                    <GlassCard className="p-8">
                        <form onSubmit={handleRegister} className="flex flex-col gap-4">
                            <Field id="reg-name" label="Username" value={name}
                                onChange={(e: any) => setName(e.target.value)} icon={User} placeholder="Your name" />
                            <Field id="reg-email" label="Email address" type="email" value={email}
                                onChange={(e: any) => setEmail(e.target.value)} icon={Mail} placeholder="you@example.com" />
                            <Field id="reg-pass" label="Password" type="password" value={password}
                                onChange={(e: any) => setPassword(e.target.value)} icon={Lock}
                                showToggle show={showPassword} onToggle={() => setShowPassword(!showPassword)}
                                placeholder="Min. 6 characters" />
                            <Field id="reg-confirm" label="Confirm Password" type="password" value={confirmPassword}
                                onChange={(e: any) => setConfirmPassword(e.target.value)} icon={Lock}
                                showToggle show={showPassword} onToggle={() => setShowPassword(!showPassword)}
                                placeholder="Repeat your password" />

                            <motion.button
                                type="submit" disabled={isLoading}
                                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                className="btn-primary h-12 text-sm mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <span className="flex items-center gap-2">
                                        <span className="h-4 w-4 rounded-full border-2 border-background/40 border-t-background animate-spin" />
                                        Creating Account…
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        <UserPlus className="h-4 w-4" /> Create Account
                                    </span>
                                )}
                            </motion.button>
                        </form>

                        <p className="mt-6 text-center text-muted text-xs">
                            Already have an account?{' '}
                            <Link to="/login" className="text-primary hover:text-primary-dark font-semibold transition-colors">
                                Sign In
                            </Link>
                        </p>
                    </GlassCard>
                </BlurIn>
            </div>
        </div>
    );
};

export default RegisterPage;
