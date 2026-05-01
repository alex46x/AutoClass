'use client';

import { useState } from 'react';
import { Plus, Edit2, X } from 'lucide-react';
import { createSemester, updateSemester, createSection } from '@/app/actions/admin';
import { motion, AnimatePresence } from 'framer-motion';

export default function SemesterManager({ semesters, sections, departmentId }: { semesters: any[], sections: any[], departmentId: number }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSectionOpen, setIsSectionOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [name, setName] = useState('');
  const [editId, setEditId] = useState<number | null>(null);
  
  const [sectionName, setSectionName] = useState('');
  const [sectionMaxStudents, setSectionMaxStudents] = useState<number>(40);
  const [selectedSemesterId, setSelectedSemesterId] = useState<number | null>(null);

  const handleCreateSemester = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createSemester(name, departmentId);
      setIsOpen(false);
      setName('');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSemester = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editId) return;
    setLoading(true);
    try {
      await updateSemester(editId, name);
      setIsEditOpen(false);
      setName('');
      setEditId(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSemesterId) return;
    setLoading(true);
    try {
      await createSection(sectionName, selectedSemesterId, sectionMaxStudents, departmentId);
      setIsSectionOpen(false);
      setSectionName('');
      setSectionMaxStudents(40);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 mb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Semesters & Sections</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage academic terms and their class sections.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setIsOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium shadow-sm transition-colors text-sm">
            <Plus className="w-4 h-4" /> Add Semester
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {semesters.map(semester => {
          const semesterSections = sections.filter(s => s.semesterId === semester.id);
          return (
            <div key={semester.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm relative group">
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-bold text-slate-900 dark:text-white text-lg">{semester.name}</h3>
                <button 
                  onClick={() => {
                    setEditId(semester.id);
                    setName(semester.name);
                    setIsEditOpen(true);
                  }}
                  className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
                  title="Promote / Edit Semester"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Sections</div>
                <div className="flex flex-wrap gap-2">
                  {semesterSections.map(sec => (
                    <span key={sec.id} className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-md text-xs font-medium border border-slate-200 dark:border-slate-700">
                      {sec.name}
                    </span>
                  ))}
                  {semesterSections.length === 0 && <span className="text-xs text-slate-400">No sections</span>}
                </div>
              </div>
              
              <button 
                onClick={() => {
                  setSelectedSemesterId(semester.id);
                  setIsSectionOpen(true);
                }}
                className="w-full py-2 flex items-center justify-center gap-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/20 dark:hover:bg-indigo-900/40 rounded-xl transition-colors"
              >
                <Plus className="w-4 h-4" /> Add Section
              </button>
            </div>
          );
        })}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {(isOpen || isEditOpen) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">{isOpen ? 'Add Semester' : 'Promote/Update Semester'}</h3>
                <button onClick={() => { setIsOpen(false); setIsEditOpen(false); setName(''); }} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={isOpen ? handleCreateSemester : handleUpdateSemester} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Semester Name</label>
                  <input required type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g., 1st Year 1st Semester (Spring 26)" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500" />
                  {isEditOpen && <p className="text-xs text-slate-500 mt-2">Updating the name will promote all associated sections and students to this new semester.</p>}
                </div>
                <div className="pt-4 flex gap-3">
                  <button type="button" onClick={() => { setIsOpen(false); setIsEditOpen(false); setName(''); }} className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-medium transition-colors">Cancel</button>
                  <button type="submit" disabled={loading} className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium shadow-sm transition-colors disabled:opacity-70">{loading ? 'Saving...' : 'Save Semester'}</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {isSectionOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Add Section</h3>
                <button onClick={() => { setIsSectionOpen(false); setSectionName(''); }} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleCreateSection} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Section Name</label>
                  <input required type="text" value={sectionName} onChange={e => setSectionName(e.target.value)} placeholder="e.g., A, B, C" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Max Students</label>
                  <input required type="number" min="1" max="200" value={sectionMaxStudents} onChange={e => setSectionMaxStudents(parseInt(e.target.value) || 0)} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div className="pt-4 flex gap-3">
                  <button type="button" onClick={() => { setIsSectionOpen(false); setSectionName(''); }} className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-medium transition-colors">Cancel</button>
                  <button type="submit" disabled={loading} className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium shadow-sm transition-colors disabled:opacity-70">{loading ? 'Saving...' : 'Add Section'}</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
