import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import XLSX from 'xlsx-js-style';
import { Download, Search, Eye } from 'lucide-react';
import { StudentDetailsModal } from "../components/DetailModals";
export default function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => {
    fetch('https://campusflow-wt6t.onrender.com/api/students', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
      .then((res) => res.json())
      .then((data) => setStudents(data))
      .catch((err) => console.error('Error fetching students:', err));
  }, []);

  const downloadStudentExcel = () => {
    const exportData = students.map((s) => ({
      'Student Name': s.fullName,
      'Email': s.email,
      'Phone': s.phone,
      'College': s.college,
      'Course': s.course,
      'Year': s.year,
      'Event Name': s.eventName,
      'Registration Type': s.regType,
      'Team Name': s.teamName || 'N/A',
      'Role': s.teamName ? (s.isLead ? 'Team Lead' : 'Member') : 'Individual Participant',
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Students');
    XLSX.writeFile(workbook, 'CampusFlow_Students.xlsx');
  };

  const filtered = students.filter(
    (s) =>
      s.fullName.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Student Directory</h1>
          <p className="text-xs text-slate-500 mt-1">Unified directory for all registered student participants.</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={downloadStudentExcel}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-sm transition-all"
        >
          <Download className="w-4 h-4" /> Download Student Excel
        </motion.button>
      </div>

      <div className="relative max-w-sm">
        <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
        <input
          type="text"
          placeholder="Search by student name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-x-auto shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase">
            <tr>
              <th className="px-6 py-3.5">Student Name</th>
              <th className="px-6 py-3.5">College</th>
              <th className="px-6 py-3.5">Course & Year</th>
              <th className="px-6 py-3.5">Event</th>
              <th className="px-6 py-3.5">Type</th>
              <th className="px-6 py-3.5">Team Role</th>
              <th className="px-6 py-3.5">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
            <AnimatePresence>
              {filtered.map((s, idx) => (
                <motion.tr
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2, delay: idx * 0.03 }}
                  className="hover:bg-slate-50/80 transition-colors"
                >
                  <td className="px-6 py-4 font-bold text-slate-900">{s.fullName}</td>
                  <td className="px-6 py-4">{s.college}</td>
                  <td className="px-6 py-4">{s.course} ({s.year})</td>
                  <td className="px-6 py-4">{s.eventName}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${s.regType === 'Team' ? 'bg-amber-50 text-amber-700' : 'bg-purple-50 text-purple-700'}`}>
                      {s.regType}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {s.teamName ? (
                      <span className="text-slate-600">{s.teamName} ({s.isLead ? 'Lead' : 'Member'})</span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => setSelectedStudent(s)}
                      className="flex items-center gap-1 text-blue-600 hover:text-blue-800 font-bold"
                    >
                      <Eye className="w-3.5 h-3.5" /> View Details
                    </button>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      <StudentDetailsModal student={selectedStudent} onClose={() => setSelectedStudent(null)} />
    </motion.div>
  );
}