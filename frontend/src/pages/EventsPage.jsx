import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Copy, Check, Trash2, Edit, Tag, Calendar as CalendarIcon, MapPin, X, Users, User } from 'lucide-react';

const API_BASE_URL = 'http://localhost:5000/api';

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [copiedCode, setCopiedCode] = useState('');
  
  // State for Create Form Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'General',
    venue: '',
    registrationDeadline: '',
    eventCode: '',
    registrationAllowed: 'INDIVIDUAL_AND_TEAM', // Default selection
    minTeamSize: 2,
    maxTeamSize: 4,
  });

  // --- FETCH ALL EVENTS ---
  const fetchEvents = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/events`, {
        headers: { 
          Authorization: `Bearer ${localStorage.getItem('token') || ''}` 
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server returned ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      setEvents(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching events:', err.message);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // Handle Form Input Changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // --- CREATE EVENT HANDLER ---
  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const rawText = await response.text();
        let errorMessage = `Server Error (${response.status})`;
        try {
          const parsedJson = JSON.parse(rawText);
          errorMessage = parsedJson.message || errorMessage;
        } catch (_) {
          errorMessage = `Endpoint not found (${response.status}). Verify backend route exists.`;
        }
        alert(errorMessage);
        return;
      }

      // Successful save
      setIsModalOpen(false);
      setFormData({
        title: '',
        description: '',
        category: 'General',
        venue: '',
        registrationDeadline: '',
        eventCode: '',
        registrationAllowed: 'INDIVIDUAL_AND_TEAM',
        minTeamSize: 2,
        maxTeamSize: 4,
      });
      fetchEvents();
    } catch (err) {
      console.error('Error creating event:', err.message);
      alert(`Network/Client Error: ${err.message}`);
    }
  };

  // --- DELETE EVENT HANDLER ---
  const handleDeleteEvent = async (id) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/events/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
        },
      });

      if (!response.ok) {
        const rawText = await response.text();
        alert(`Failed to delete (${response.status}): ${rawText}`);
        return;
      }

      fetchEvents();
    } catch (err) {
      console.error('Error deleting event:', err.message);
    }
  };

  const handleCopy = (code) => {
    const link = `${window.location.origin}/register/${code}`;
    navigator.clipboard.writeText(link);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(''), 2000);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Events Directory</h1>
          <p className="text-xs text-slate-500 mt-1">Manage created events and public registration codes.</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" /> Create New Event
        </motion.button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {events.map((event, idx) => (
            <motion.div
              key={event._id || idx}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.25, delay: idx * 0.05 }}
              whileHover={{ y: -4 }}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between"
            >
              <div className="p-5 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] font-bold px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full flex items-center gap-1">
                    <Tag className="w-3 h-3" /> {event.category || 'General'}
                  </span>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700">
                    {event.status || 'Active'}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900">{event.title}</h3>
                <p className="text-xs text-slate-500 line-clamp-2">{event.description}</p>

                <div className="pt-2 border-t border-slate-100 text-xs text-slate-600 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
                    <span>Deadline: <strong>{event.registrationDeadline ? new Date(event.registrationDeadline).toLocaleDateString() : 'N/A'}</strong></span>
                  </div>
                  {event.venue && (
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{event.venue}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span className="capitalize">
                      Type: <strong>{event.registrationAllowed ? event.registrationAllowed.replace(/_/g, ' ').toLowerCase() : 'Individual & Team'}</strong>
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => handleCopy(event.eventCode)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
                >
                  {copiedCode === event.eventCode ? (
                    <><Check className="w-3.5 h-3.5 text-emerald-600" /> Copied Link</>
                  ) : (
                    <><Copy className="w-3.5 h-3.5" /> Copy Link</>
                  )}
                </button>
                <button className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                  <Edit className="w-4 h-4" />
                </button>
                
                <button 
                  onClick={() => handleDeleteEvent(event._id)}
                  className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* --- CREATE EVENT FORM MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl border border-slate-200 relative my-8">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-bold text-slate-900 mb-4">Create New Event</h2>

            <form onSubmit={handleCreateEvent} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Event Title</label>
                <input
                  type="text"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. Hackathon 2026"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Description</label>
                <textarea
                  name="description"
                  rows="3"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Short overview of event..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Category</label>
                  <input
                    type="text"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    placeholder="Technical, Cultural..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Event Code</label>
                  <input
                    type="text"
                    name="eventCode"
                    required
                    value={formData.eventCode}
                    onChange={handleChange}
                    placeholder="e.g. HACK26"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* REGISTRATION TYPE SELECTION */}
              <div className="space-y-1.5 pt-1">
                <label className="block text-slate-700 font-semibold">Allowed Registration Types</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'INDIVIDUAL', label: 'Individual', icon: User },
                    { id: 'TEAM', label: 'Team', icon: Users },
                    { id: 'INDIVIDUAL_AND_TEAM', label: 'Both', icon: Users },
                  ].map((item) => {
                    const Icon = item.icon;
                    const isSelected = formData.registrationAllowed === item.id;
                    return (
                      <button
                        type="button"
                        key={item.id}
                        onClick={() => setFormData({ ...formData, registrationAllowed: item.id })}
                        className={`p-2.5 rounded-lg border text-center transition-all flex flex-col items-center gap-1 ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50 text-blue-700 font-bold'
                            : 'border-slate-200 text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="text-[11px]">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* CONDITIONAL TEAM SIZES */}
              {(formData.registrationAllowed === 'TEAM' || formData.registrationAllowed === 'INDIVIDUAL_AND_TEAM') && (
                <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Min Team Size</label>
                    <input
                      type="number"
                      name="minTeamSize"
                      min="1"
                      value={formData.minTeamSize}
                      onChange={handleChange}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Max Team Size</label>
                    <input
                      type="number"
                      name="maxTeamSize"
                      min="1"
                      value={formData.maxTeamSize}
                      onChange={handleChange}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Venue</label>
                  <input
                    type="text"
                    name="venue"
                    value={formData.venue}
                    onChange={handleChange}
                    placeholder="Auditorium B"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Deadline</label>
                  <input
                    type="date"
                    name="registrationDeadline"
                    value={formData.registrationDeadline}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold"
                >
                  Save Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </motion.div>
  );
}