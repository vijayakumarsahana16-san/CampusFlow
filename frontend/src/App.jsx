import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useSearchParams } from 'react-router-dom';
import Login from './pages/Login.jsx';
import SignUp from './pages/SignUp.jsx';
import Dashboard from './pages/Dashboard.jsx';
import EventsPage from './pages/EventsPage.jsx';
import TeamsPage from './pages/TeamsPage.jsx';
import StudentsPage from './pages/StudentsPage.jsx';
import PublicRegister from './pages/PublicRegister.jsx';
import ManagementLayout from './layouts/ManagementLayout.jsx';
import ProfileModal from './components/ProfileModal.jsx';

function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col justify-between">
      {/* Navigation Bar */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-slate-800">
        <h1 className="text-2xl font-extrabold tracking-tight text-blue-500">CAMPUS FLOW</h1>
        <div className="space-x-4">
          <Link
            to="/login"
            className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-all"
          >
            Sign In
          </Link>
          <Link
            to="/signup"
            className="px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-4xl mx-auto text-center px-4 py-20">
        <h2 className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-6">
          Streamline Your Campus Events Effortlessly
        </h2>
        <p className="text-lg text-slate-400 mb-8 max-w-2xl mx-auto">
          Campus Flow is the all-in-one event management platform built for universities, clubs, and student organizations.
        </p>
        <div className="flex justify-center gap-4">
          <Link
            to="/signup"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-blue-500/20 transition-all"
          >
            Create Your Account
          </Link>
          <Link
            to="/login"
            className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-lg border border-slate-700 transition-all"
          >
            Sign In
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-6 text-sm text-slate-500 border-t border-slate-800">
        © 2026 Campus Flow. All rights reserved.
      </footer>
    </div>
  );
}

// Wrapper to capture OAuth URL token parameters on redirect
function ProtectedLayoutWrapper({ user, fetchUserProfile, onLogout, onOpenProfile }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const tokenFromUrl = searchParams.get('token');

  useEffect(() => {
    if (tokenFromUrl) {
      localStorage.setItem('token', tokenFromUrl);
      setSearchParams({}, { replace: true });
      if (fetchUserProfile) fetchUserProfile();
    }
  }, [tokenFromUrl, setSearchParams, fetchUserProfile]);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <ManagementLayout
      user={user}
      onLogout={onLogout}
      onOpenProfile={onOpenProfile}
    />
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // 1. Memoized fetch profile function to avoid unnecessary re-renders
  const fetchUserProfile = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        localStorage.removeItem('token');
        setUser(null);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  // 2. Save profile updates directly to MongoDB backend
  const handleSaveProfile = async (updatedProfile) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('http://localhost:5000/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(updatedProfile)
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUser(updatedUser);
      } else {
        alert('Failed to update profile information.');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  // 3. Clear token and clear state on Logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center font-sans">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span>Loading session...</span>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login onLoginSuccess={fetchUserProfile} />} />
        <Route path="/signup" element={<SignUp />} />

        {/* Public Student Registration Route */}
        <Route path="/register/:eventCode" element={<PublicRegister />} />

        {/* Protected Management Routes wrapped in ManagementLayout */}
        <Route
          element={
            <ProtectedLayoutWrapper
              user={user}
              fetchUserProfile={fetchUserProfile}
              onLogout={handleLogout}
              onOpenProfile={() => setIsProfileOpen(true)}
            />
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/teams" element={<TeamsPage />} />
          <Route path="/students" element={<StudentsPage />} />
        </Route>

        {/* Catch-all Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Global Profile Modal */}
      <ProfileModal
        user={user}
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        onSave={handleSaveProfile}
      />
    </Router>
  );
}