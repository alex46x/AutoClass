'use client';

import { useState } from 'react';
import { findEmptyRooms } from '@/app/actions/rooms';
import { Search, Monitor, Users, Beaker, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import GlassSelect from '@/components/GlassSelect';
import GlassTimePicker from '@/components/GlassTimePicker';

export default function FindRoomsClient() {
  const [day, setDay] = useState(new Date().getDay());
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:30');
  const [capacity, setCapacity] = useState(30);
  const [projector, setProjector] = useState(false);
  const [lab, setLab] = useState(false);

  const [loading, setLoading] = useState(false);
  const [rooms, setRooms] = useState<any[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setHasSearched(true);
    try {
      const res = await findEmptyRooms(Number(day), startTime, endTime, capacity, projector, lab);
      setRooms(res);
    } catch (e) {
      console.error(e);
      alert('Failed to find rooms');
    } finally {
      setLoading(false);
    }
  };

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    <div className="space-y-8">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-full blur-3xl opacity-50 z-0"></div>
        
        <div className="relative z-10">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <Search className="w-5 h-5 text-indigo-500" />
            Smart Room Finder
          </h2>

          <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Day of Week</label>
              <GlassSelect
                value={day} 
                onChange={(e) => setDay(Number(e.target.value))}
                className="w-full"
              >
                {days.map((d, i) => <option key={i} value={i}>{d}</option>)}
              </GlassSelect>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Time Slot</label>
              <div className="grid grid-cols-2 gap-2">
                <GlassTimePicker
                  value={startTime}
                  onChange={setStartTime}
                  className="w-full"
                />
                <GlassTimePicker
                  value={endTime}
                  onChange={setEndTime}
                  className="w-full"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Min Capacity</label>
              <input 
                type="number" 
                min="1"
                value={capacity}
                onChange={(e) => setCapacity(Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              />
            </div>

            <div className="lg:col-span-3 flex flex-wrap gap-4 items-center">
              <label className="flex items-center gap-2 cursor-pointer bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-3 rounded-xl select-none hover:bg-slate-100 dark:hover:bg-slate-750 transition-colors">
                <input type="checkbox" checked={projector} onChange={e => setProjector(e.target.checked)} className="rounded text-indigo-500" />
                <Monitor className="w-4 h-4 text-slate-500" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Needs Projector</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-3 rounded-xl select-none hover:bg-slate-100 dark:hover:bg-slate-750 transition-colors">
                <input type="checkbox" checked={lab} onChange={e => setLab(e.target.checked)} className="rounded text-indigo-500" />
                <Beaker className="w-4 h-4 text-slate-500" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Requires Lab Equipment</span>
              </label>
              
              <div className="flex-1"></div>
              
              <button 
                type="submit"
                disabled={loading}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-medium shadow-md transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? 'Searching...' : 'Find Rooms'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {hasSearched && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">
            Search Results <span className="text-sm font-normal text-slate-500 ml-2">({rooms.length} rooms found)</span>
          </h3>

          {rooms.length === 0 ? (
            <div className="text-center py-12 px-4">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                <Search className="w-8 h-8" />
              </div>
              <p className="text-slate-900 dark:text-white font-medium text-lg">No rooms available</p>
              <p className="text-slate-500 text-sm mt-1">Try adjusting your filters or time slot to find available rooms.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {rooms.map((room, idx) => (
                 <motion.div 
                   key={room.id}
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: idx * 0.05 }}
                   className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 hover:border-indigo-400 dark:hover:border-indigo-500 transition-colors group cursor-pointer"
                 >
                   <div className="flex justify-between items-start mb-4">
                     <h4 className="text-xl font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
                       <MapPin className="w-5 h-5 text-indigo-500" />
                       {room.name}
                     </h4>
                     <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 bg-slate-200 dark:bg-slate-700 px-2.5 py-1 rounded-lg">
                       {room.is_lab ? 'Lab' : 'Class'}
                     </span>
                   </div>

                   <div className="space-y-2">
                     <p className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                       <Users className="w-4 h-4 text-slate-400" /> 
                       Capacity: <span className="font-medium text-slate-900 dark:text-white">{room.capacity}</span>
                     </p>
                     <p className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                       <Monitor className="w-4 h-4 text-slate-400" /> 
                       Projector: <span className="font-medium text-slate-900 dark:text-white">{room.has_projector ? 'Yes' : 'No'}</span>
                     </p>
                   </div>
                   
                   <button className="mt-6 w-full py-2 bg-indigo-100 hover:bg-indigo-200 dark:bg-indigo-900/40 dark:hover:bg-indigo-800 text-indigo-700 dark:text-indigo-300 rounded-xl text-sm font-medium transition-colors opacity-0 group-hover:opacity-100">
                     Request Makeup Class Here
                   </button>
                 </motion.div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
