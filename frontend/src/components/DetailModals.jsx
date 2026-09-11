import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Phone, School, User, Trophy, ShieldCheck, Tag, Calendar, Hash } from 'lucide-react';

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 15 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', duration: 0.3 } },
  exit: { opacity: 0, scale: 0.95, y: 15, transition: { duration: 0.2 } },
};

/**
 * Team Details Modal Component
 */
export function TeamDetailsModal({ team, onClose }) {
  if (!team) return null;

  const lead = team.members?.find((m) => m.isLead) || team.members?.[0];
  const members = team.members || [];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
        <motion.div
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          onClick={onClose}
          className="absolute inset-0"
        />

        <motion.div
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="relative z-10 w-full max-w-2xl bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-6 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
                Team Registration Roster
              </span>
              <h2 className="text-xl font-black text-slate-900 mt-1.5">{team.teamName}</h2>
              <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                <Hash className="w-3.5 h-3.5 text-slate-400" />
                <span>Reg ID: <strong>{team.registrationId || team._id}</strong></span>
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-6 overflow-y-auto space-y-6">
            {/* Event Info Card */}
            <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Registered Event</span>
                <p className="text-sm font-bold text-slate-900 mt-0.5">{team.eventId?.title || 'N/A'}</p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                {team.status || 'Confirmed'}
              </span>
            </div>

            {/* Members Roster */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Team Members ({members.length})
              </h3>
              <div className="space-y-3">
                {members.map((member, index) => (
                  <div
                    key={member._id || index}
                    className={`p-4 rounded-xl border transition-all ${
                      member.isLead
                        ? 'bg-blue-50/30 border-blue-200/80 shadow-xs'
                        : 'bg-white border-slate-200/80'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-slate-400" />
                        <span className="text-sm font-bold text-slate-900">{member.fullName}</span>
                      </div>
                      {member.isLead ? (
                        <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 bg-blue-600 text-white rounded-md flex items-center gap-1 shadow-xs">
                          <ShieldCheck className="w-3 h-3" /> Team Lead
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          Member #{index + 1}
                        </span>
                      )}
                    </div>

                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{member.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{member.phone || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-2 col-span-1 sm:col-span-2">
                        <School className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{member.college || 'N/A'} ({member.course} - {member.year})</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold rounded-xl transition-colors"
            >
              Close Roster
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

/**
 * Student Details Modal Component
 */
export function StudentDetailsModal({ student, onClose }) {
  if (!student) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
        <motion.div
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          onClick={onClose}
          className="absolute inset-0"
        />

        <motion.div
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="relative z-10 w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="p-6 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-600 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-100">
                Participant Record
              </span>
              <h2 className="text-xl font-black text-slate-900 mt-1.5">{student.fullName}</h2>
              <p className="text-xs text-slate-500 mt-0.5">{student.college}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-6 space-y-5 text-xs text-slate-700">
            <div className="space-y-2.5 bg-slate-50/70 p-4 rounded-xl border border-slate-100">
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="font-medium">{student.email}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="font-medium">{student.phone || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <School className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="font-medium">{student.course} ({student.year})</span>
              </div>
            </div>

            <div className="pt-2 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Participation Context</h3>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Registered Event</span>
                  <span className="text-xs font-bold text-slate-900 mt-0.5 block">{student.eventName}</span>
                </div>
                
                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Type</span>
                  <span className="text-xs font-bold text-slate-900 mt-0.5 block">{student.regType}</span>
                </div>
              </div>

              {student.teamName && (
                <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-200/60 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-amber-700 font-bold uppercase block">Associated Team</span>
                    <span className="text-xs font-bold text-slate-900">{student.teamName}</span>
                  </div>
                  <span className="px-2 py-0.5 text-[10px] font-extrabold rounded bg-amber-100 text-amber-800 uppercase">
                    {student.isLead ? 'Team Lead' : 'Member'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold rounded-xl transition-colors"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}