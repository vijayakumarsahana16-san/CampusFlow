import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import logo from '../assets/campusflow.png';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
    console.log('Attempting login with:', { email, password });

        try {
            const response = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();
            console.log('Login response:', data); // Debugging line
            if (!response.ok) throw new Error(data.error || 'Failed to login');

            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            navigate('/dashboard');
        } catch (err) {
            setError(err.message);
        }
    };

    const handleOAuthLogin = (provider) => {
        window.location.href = `http://localhost:5000/api/auth/${provider}`;
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-8 px-4 sm:px-6 lg:px-8">
          
            <div className="sm:mx-auto sm:w-full sm:max-w-md transition-all duration-700 ease-out">
               
                <div className="flex items-center justify-center gap-3">
                    <Link to="/dashboard" className="flex items-center">
                        <img src={logo} alt="Campus Flow Logo" className="h-10 w-auto object-contain" />
                    </Link>
                    <h2 className="font-logo text-2xl sm:text-3xl font-extrabold text-slate-900 animate-fade-in transition-all duration-300">
                        CAMPUS <span className="text-[#0088FF]">FLOW</span>
                    </h2>
                </div>

                <p className="mt-2 text-center text-sm text-slate-600">
                    Sign in to Management Portal
                </p>
            </div>

            {/* Main Form Card */}
            <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-6 shadow-xl shadow-slate-200/50 rounded-2xl border border-slate-200/80 transition-all duration-300 hover:shadow-2xl">
                    {error && (
                        <div className="mb-4 bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg text-sm animate-bounce">
                            {error}
                        </div>
                    )}

                    <form className="space-y-4" onSubmit={handleLogin}>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Email Address</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="mt-1 block w-full px-3 py-2.5 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all duration-200 outline-none"
                            />
                        </div>

                        <div>
                            <div className="flex justify-between items-center">
                                <label className="block text-sm font-medium text-slate-700">Password</label>
                                <button
                                    type="button"
                                    onClick={() => alert('Password reset link sent to your email.')}
                                    className="text-xs text-blue-600 hover:underline font-medium"
                                >
                                    Forgot password?
                                </button>
                            </div>

                            {/* Password Input with Eye Icon */}
                            <div className="relative mt-1">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full px-3 py-2.5 pr-10 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all duration-200 outline-none"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-5 w-5" />
                                    ) : (
                                        <Eye className="h-5 w-5" />
                                    )}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm shadow-md hover:shadow-lg active:scale-[0.98] transition-all duration-150 cursor-pointer"
                        >
                            Sign In
                        </button>
                    </form>

                    {/* Social Divider */}
                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-200" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-white px-3 text-slate-500 font-medium">Or continue with</span>
                            </div>
                        </div>

                        {/* Social Buttons */}
                        <div className="mt-6 flex justify-center">
                            <button
                                type="button"
                                onClick={() => handleOAuthLogin('google')}
                                className="w-full max-w-xs flex items-center justify-center gap-2 py-2.5 px-4 border border-slate-300 rounded-lg shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 active:scale-[0.98] transition-all duration-150 cursor-pointer"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                                </svg>
                                Continue with Google
                            </button>
                        </div>
                    </div>

                    <p className="mt-6 text-center text-sm text-slate-600">
                        Don't have an account?{' '}
                        <Link to="/signup" className="text-blue-600 font-medium hover:underline transition-all">
                            Sign Up
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}