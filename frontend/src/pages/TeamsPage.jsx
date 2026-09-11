import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import XLSX from 'xlsx-js-style';
import { Download, Search, Eye } from 'lucide-react';
import { TeamDetailsModal } from "../components/DetailModals";
export default function TeamsPage() {
  const [teams, setTeams] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedTeam, setSelectedTeam] = useState(null);

  useEffect(() => {
    fetch('https://campusflow-wt6t.onrender.com/api/teams', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
      .then((res) => res.json())
      .then((data) => setTeams(data))
      .catch((err) => console.error('Error fetching teams:', err));
  }, []);

  const downloadTeamExcel = () => {
    const exportData = teams.map((t) => {
      const lead = t.members?.find((m) => m.isLead) || t.members?.[0];
      return {
        'Team Name': t.teamName,
        'Event Name': t.eventId?.title || 'N/A',
        'Registration ID': t.registrationId,
        'Team Lead Name': lead?.fullName || 'N/A',
        'Lead Email': lead?.email || 'N/A',
        'Lead Phone': lead?.phone || 'N/A',
        'Member Count': t.members?.length || 0,
        'College': lead?.college || 'N/A',
        'Registration Date': new Date(t.createdAt).toLocaleDateString(),
        'Status': t.status,
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Teams');
    XLSX.writeFile(workbook, 'CampusFlow_Teams.xlsx');
  };

  const filtered = teams.filter((t) =>
    t.teamName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Teams Directory</h1>
          <p className="text-xs text-slate-500 mt-1">Structured team registrations and complete rosters.</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={downloadTeamExcel}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-sm transition-all"
        >
          <Download className="w-4 h-4" /> Download Team Excel
        </motion.button>
      </div>

      <div className="relative max-w-sm">
        <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
        <input
          type="text"
          placeholder="Filter by team name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-x-auto shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase">
            <tr>
              <th className="px-6 py-3.5">Team Name</th>
              <th className="px-6 py-3.5">Event Name</th>
              <th className="px-6 py-3.5">Team Lead</th>
              <th className="px-6 py-3.5">Members</th>
              <th className="px-6 py-3.5">College</th>
              <th className="px-6 py-3.5">Status</th>
              <th className="px-6 py-3.5">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
            <AnimatePresence>
              {filtered.map((t, idx) => {
                const lead = t.members?.find((m) => m.isLead) || t.members?.[0];
                return (
                  <motion.tr
                    key={t._id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.2, delay: idx * 0.03 }}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="px-6 py-4 font-bold text-slate-900">{t.teamName}</td>
                    <td className="px-6 py-4">{t.eventId?.title || 'N/A'}</td>
                    <td className="px-6 py-4">{lead?.fullName || 'N/A'}</td>
                    <td className="px-6 py-4">{t.members?.length || 0}</td>
                    <td className="px-6 py-4">{lead?.college || 'N/A'}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 font-semibold text-[11px]">
                        {t.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setSelectedTeam(t)}
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-800 font-bold"
                      >
                        <Eye className="w-3.5 h-3.5" /> View Details
                      </button>
                    </td>
                  </motion.tr>
                );
              })}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      <TeamDetailsModal team={selectedTeam} onClose={() => setSelectedTeam(null)} />
    </motion.div>
  );
}