import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Calendar, MapPin, Users, User, ArrowRight, CheckCircle2, 
  AlertCircle, ShieldCheck, Clock, Mail, Phone, GraduationCap, Info, Plus, Trash2 
} from 'lucide-react';

const API_BASE_URL = 'http://localhost:5000/api';

export default function PublicRegistrationPage() {
  const { eventCode } = useParams();

  // Stage Management: 'DETAILS' | 'FORM' | 'SUCCESS'
  const [stage, setStage] = useState('DETAILS');
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successData, setSuccessData] = useState(null);

  // Form State
  const [registrationType, setRegistrationType] = useState('INDIVIDUAL');
  const [studentData, setStudentData] = useState({
    fullName: '',
    email: '',
    phone: '',
    dob: '',
    college: '',
    course: '',
    year: '',
  });

  const [teamName, setTeamName] = useState('');
  const [members, setMembers] = useState([]);

  // Helper: Calculate age from DOB string
  const getAge = (dobString) => {
    if (!dobString) return 0;
    const birthDate = new Date(dobString);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/events/public/${eventCode}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Event not found');

        setEvent(data);
        const defaultType = data.registrationAllowed === 'TEAM' ? 'TEAM' : 'INDIVIDUAL';
        setRegistrationType(defaultType);

        const minSize = data.minTeamSize || 2;
        setMembers(
          Array.from({ length: minSize }, () => ({
            fullName: '',
            email: '',
            phone: '',
            dob: '',
            college: '',
            course: '',
            year: '',
          }))
        );
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [eventCode]);

  // Form Handlers
  const handleStudentChange = (e) => {
    setStudentData({ ...studentData, [e.target.name]: e.target.value });
  };

  const handleMemberChange = (index, field, value) => {
    const updated = [...members];
    updated[index][field] = value;
    setMembers(updated);
  };

  const addMember = () => {
    if (members.length < (event?.maxTeamSize || 4)) {
      setMembers([
        ...members,
        { fullName: '', email: '', phone: '', dob: '', college: '', course: '', year: '' },
      ]);
    }
  };

  const removeMember = (index) => {
    if (members.length > (event?.minTeamSize || 2)) {
      setMembers(members.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Client-side Age Validation
    if (registrationType === 'INDIVIDUAL') {
      if (getAge(studentData.dob) < 16) {
        setError('Sorry, you must be at least 16 years old to participate in this event.');
        return;
      }
    } else {
      for (let i = 0; i < members.length; i++) {
        if (getAge(members[i].dob) < 16) {
          setError(`Member ${i + 1} (${members[i].fullName || 'Unnamed'}) must be at least 16 years old.`);
          return;
        }
      }
    }

    const payload = {
      eventCode,
      registrationType,
      ...(registrationType === 'INDIVIDUAL'
        ? { studentData }
        : { teamData: { teamName, members } }),
    };

    try {
      const res = await fetch(`${API_BASE_URL}/events/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Registration failed');

      setSuccessData(data);
      setStage('SUCCESS');
      window.scrollTo(0, 0);
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center font-sans">
        <div className="animate-pulse flex items-center gap-3 text-blue-400 font-medium">
          <div className="w-4 h-4 rounded-full bg-blue-500 animate-ping"></div>
          Loading Event Details...
        </div>
      </div>
    );
  }

  if (error && !event) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-6 text-center font-sans">
        <div className="max-w-md space-y-4">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
          <h2 className="text-xl font-bold">{error}</h2>
          <p className="text-slate-400 text-sm">Please check your event link and try again.</p>
        </div>
      </div>
    );
  }

  // =========================================================================
  // STAGE 1: EVENT DETAILS (Dark Premium Hero UI)
  // =========================================================================
  if (stage === 'DETAILS') {
    return (
      <div className="min-h-screen bg-[#090A0F] text-slate-100 font-sans selection:bg-blue-500 selection:text-white">
        {/* Animated Background Gradients */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-1/3 -right-40 w-[30rem] h-[30rem] bg-indigo-600/10 rounded-full blur-3xl"></div>
        </div>

        {/* Top Header / Branding */}
        <header className="relative z-10 max-w-6xl mx-auto px-6 py-8 flex justify-between items-center">
          <div className="flex items-center gap-2 font-black text-xl tracking-tight">
            <span className="w-3 h-3 bg-blue-500 rounded-full shadow-[0_0_12px_#3b82f6]"></span>
            CAMPUS<span className="text-blue-500">FLOW</span>
          </div>
          <span className="text-xs uppercase tracking-widest text-slate-400 bg-slate-900/80 border border-slate-800 px-3 py-1.5 rounded-full backdrop-blur-md">
            {event.category || 'Special Event'}
          </span>
        </header>

        {/* Hero Section */}
        <section className="relative z-10 max-w-4xl mx-auto px-6 pt-12 pb-20 text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-xs font-semibold">
            <Clock className="w-3.5 h-3.5" /> Registration Open
          </div>

          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-tight">
            {event.title}
          </h1>

          <p className="text-slate-400 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            {event.description}
          </p>

          <div className="flex flex-wrap justify-center items-center gap-6 text-sm text-slate-300">
            {event.registrationDeadline && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-400" />
                <span>{new Date(event.registrationDeadline).toLocaleDateString()}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-400" />
              <span>{event.venue || 'Campus Main Stage'}</span>
            </div>
          </div>

          <div className="pt-4">
            <button
              onClick={() => {
                setStage('FORM');
                window.scrollTo(0, 0);
              }}
              className="group relative inline-flex items-center gap-3 px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold text-base rounded-full shadow-[0_0_25px_rgba(37,99,235,0.4)] transition-all transform hover:-translate-y-0.5"
            >
              REGISTER NOW
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </section>

        {/* Info Grid */}
        <section className="relative z-10 max-w-4xl mx-auto px-6 pb-24 grid md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm space-y-3">
            <div className="flex items-center gap-2 text-blue-400 font-semibold text-sm">
              <Info className="w-4 h-4" /> About The Event
            </div>
            <p className="text-slate-300 text-sm leading-relaxed">
              {event.description || 'Join fellow students for an immersive collaborative experience.'}
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm space-y-3">
            <div className="flex items-center gap-2 text-blue-400 font-semibold text-sm">
              <ShieldCheck className="w-4 h-4" /> Rules & Eligibility
            </div>
            <ul className="text-slate-300 text-sm space-y-2 list-disc list-inside">
              <li>Must be at least 16 years old to participate.</li>
              <li>Valid student college ID required during event entry.</li>
              <li>Registration Mode: <strong>{event.registrationAllowed?.replace('_', ' ')}</strong></li>
              {event.minTeamSize && <li>Team limits: {event.minTeamSize} to {event.maxTeamSize} members.</li>}
            </ul>
          </div>
        </section>

        <footer className="relative z-10 border-t border-slate-900 py-8 text-center text-xs text-slate-500">
          Campus Flow • College Event Management Platform
        </footer>
      </div>
    );
  }

  // =========================================================================
  // STAGE 2: REGISTRATION FORM (Clean Form UI)
  // =========================================================================
  if (stage === 'FORM') {
    return (
      <div className="min-h-screen bg-slate-50 font-sans text-slate-900 py-12 px-6">
        <div className="max-w-xl mx-auto space-y-8">
          {/* Header */}
          <div className="space-y-2">
            <button
              onClick={() => setStage('DETAILS')}
              className="text-xs text-slate-500 hover:text-slate-900 transition-colors"
            >
              ← Back to Event Details
            </button>
            <div className="flex items-center gap-2 font-bold text-sm text-slate-400">
              CAMPUS<span className="text-blue-600">FLOW</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900">Register for {event.title}</h2>
          </div>

          <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-8">
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start gap-3">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div>{error}</div>
              </div>
            )}

            {/* Registration Type Selector (If Both Allowed) */}
            {event.registrationAllowed === 'INDIVIDUAL_AND_TEAM' && (
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                  How would you like to register?
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRegistrationType('INDIVIDUAL')}
                    className={`py-3 px-4 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                      registrationType === 'INDIVIDUAL'
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <User className="w-4 h-4" /> Individual
                  </button>
                  <button
                    type="button"
                    onClick={() => setRegistrationType('TEAM')}
                    className={`py-3 px-4 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                      registrationType === 'TEAM'
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <Users className="w-4 h-4" /> Team
                  </button>
                </div>
              </div>
            )}

            {/* INDIVIDUAL FORM */}
            {registrationType === 'INDIVIDUAL' && (
              <div className="space-y-6">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b pb-2">
                  Personal Information
                </h3>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Full Name *</label>
                  <input
                    type="text"
                    name="fullName"
                    required
                    placeholder="John Doe"
                    value={studentData.fullName}
                    onChange={handleStudentChange}
                    className="w-full py-2 bg-transparent border-b border-slate-300 focus:border-blue-600 focus:outline-none text-slate-900 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="john@example.com"
                    value={studentData.email}
                    onChange={handleStudentChange}
                    className="w-full py-2 bg-transparent border-b border-slate-300 focus:border-blue-600 focus:outline-none text-slate-900 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    placeholder="+91 9876543210"
                    value={studentData.phone}
                    onChange={handleStudentChange}
                    className="w-full py-2 bg-transparent border-b border-slate-300 focus:border-blue-600 focus:outline-none text-slate-900 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Date of Birth (Must be 16+) *</label>
                  <input
                    type="date"
                    name="dob"
                    required
                    value={studentData.dob}
                    onChange={handleStudentChange}
                    className="w-full py-2 bg-transparent border-b border-slate-300 focus:border-blue-600 focus:outline-none text-slate-900 text-sm"
                  />
                  {studentData.dob && (
                    <span className="text-[11px] text-slate-400 mt-1 block">
                      Calculated Age: {getAge(studentData.dob)} years old
                    </span>
                  )}
                </div>

                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b pb-2 pt-4">
                  Academic Information
                </h3>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">College / Institute *</label>
                  <input
                    type="text"
                    name="college"
                    required
                    placeholder="University Name"
                    value={studentData.college}
                    onChange={handleStudentChange}
                    className="w-full py-2 bg-transparent border-b border-slate-300 focus:border-blue-600 focus:outline-none text-slate-900 text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Course / Major</label>
                    <input
                      type="text"
                      name="course"
                      placeholder="Computer Science"
                      value={studentData.course}
                      onChange={handleStudentChange}
                      className="w-full py-2 bg-transparent border-b border-slate-300 focus:border-blue-600 focus:outline-none text-slate-900 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Year of Study</label>
                    <input
                      type="text"
                      name="year"
                      placeholder="3rd Year"
                      value={studentData.year}
                      onChange={handleStudentChange}
                      className="w-full py-2 bg-transparent border-b border-slate-300 focus:border-blue-600 focus:outline-none text-slate-900 text-sm"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TEAM FORM */}
            {registrationType === 'TEAM' && (
              <div className="space-y-8">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Team Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Binary Beasts"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    className="w-full py-2 bg-transparent border-b border-slate-300 focus:border-blue-600 focus:outline-none text-slate-900 text-sm font-semibold"
                  />
                </div>

                {members.map((member, idx) => (
                  <div key={idx} className="space-y-4 pt-4 border-t border-slate-200">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                        {idx === 0 ? 'Team Lead Details' : `Member ${idx + 1}`}
                      </span>
                      {idx >= (event.minTeamSize || 2) && (
                        <button
                          type="button"
                          onClick={() => removeMember(idx)}
                          className="text-xs text-red-500 hover:underline flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" /> Remove
                        </button>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Full Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="Full Name"
                        value={member.fullName}
                        onChange={(e) => handleMemberChange(idx, 'fullName', e.target.value)}
                        className="w-full py-2 bg-transparent border-b border-slate-300 focus:border-blue-600 focus:outline-none text-slate-900 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Email Address *</label>
                      <input
                        type="email"
                        required
                        placeholder="Email Address"
                        value={member.email}
                        onChange={(e) => handleMemberChange(idx, 'email', e.target.value)}
                        className="w-full py-2 bg-transparent border-b border-slate-300 focus:border-blue-600 focus:outline-none text-slate-900 text-sm"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Phone Number *</label>
                        <input
                          type="tel"
                          required
                          placeholder="Phone Number"
                          value={member.phone}
                          onChange={(e) => handleMemberChange(idx, 'phone', e.target.value)}
                          className="w-full py-2 bg-transparent border-b border-slate-300 focus:border-blue-600 focus:outline-none text-slate-900 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Date of Birth (16+) *</label>
                        <input
                          type="date"
                          required
                          value={member.dob}
                          onChange={(e) => handleMemberChange(idx, 'dob', e.target.value)}
                          className="w-full py-2 bg-transparent border-b border-slate-300 focus:border-blue-600 focus:outline-none text-slate-900 text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">College / Institute *</label>
                      <input
                        type="text"
                        required
                        placeholder="College Name"
                        value={member.college}
                        onChange={(e) => handleMemberChange(idx, 'college', e.target.value)}
                        className="w-full py-2 bg-transparent border-b border-slate-300 focus:border-blue-600 focus:outline-none text-slate-900 text-sm"
                      />
                    </div>
                  </div>
                ))}

                {members.length < (event?.maxTeamSize || 4) && (
                  <button
                    type="button"
                    onClick={addMember}
                    className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 pt-2"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Team Member
                  </button>
                )}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition-colors shadow-sm"
            >
              SUBMIT REGISTRATION
            </button>
          </form>
        </div>
      </div>
    );
  }

  // =========================================================================
  // STAGE 3: REGISTRATION SUCCESS (Receipt UI)
  // =========================================================================
  if (stage === 'SUCCESS') {
    return (
      <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-slate-200 shadow-lg text-center space-y-6">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <h2 className="text-2xl font-black text-slate-900">Registration Successful!</h2>
            <p className="text-slate-500 text-sm mt-1">You are registered for {successData?.eventName}</p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-left space-y-3 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Registration ID</span>
              <span className="font-mono font-bold text-slate-900">{successData?.registrationId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Registrant</span>
              <span className="font-semibold text-slate-800">{successData?.studentName}</span>
            </div>
            {successData?.teamName && (
              <div className="flex justify-between">
                <span className="text-slate-400">Team Name</span>
                <span className="font-semibold text-slate-800">{successData?.teamName}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-slate-400">Type</span>
              <span className="font-semibold text-slate-800">{successData?.registrationType}</span>
            </div>
          </div>

          <button
            onClick={() => setStage('DETAILS')}
            className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  return null;
}