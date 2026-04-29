import { getRoomOccupancyData } from '@/app/actions/rooms';
import { MapPin, Info } from 'lucide-react';

export default async function RoomOccupancyPage() {
  const data = await getRoomOccupancyData();

  const getHeatColor = (pct: number) => {
    if (pct === 0) return 'bg-slate-50 dark:bg-slate-800/50 text-slate-300';
    if (pct < 30) return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700';
    if (pct < 60) return 'bg-amber-100 dark:bg-amber-900/30 text-amber-700';
    return 'bg-rose-100 dark:bg-rose-900/30 text-rose-700';
  };

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <MapPin className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          Room Occupancy Heatmap
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Visualize campus-wide room usage to find the best times for makeup classes.</p>
      </header>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm overflow-hidden">
        <div className="flex flex-col gap-6">
          
          <div className="flex items-center justify-between">
             <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-slate-400">
               <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-slate-100 dark:bg-slate-800" /> Empty</div>
               <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-emerald-100" /> Low</div>
               <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-amber-100" /> Medium</div>
               <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-rose-100" /> Busy</div>
             </div>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-[800px]">
              {/* Header: Slots */}
              <div className="grid grid-cols-[100px_repeat(6,1fr)] mb-4">
                <div />
                {data.slots.map(slot => (
                  <div key={slot} className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    {slot}
                  </div>
                ))}
              </div>

              {/* Rows: Days */}
              <div className="space-y-2">
                {data.heatmap.map((dayRow, dayIdx) => (
                  <div key={dayIdx} className="grid grid-cols-[100px_repeat(6,1fr)] gap-2 items-center">
                    <div className="text-sm font-bold text-slate-600 dark:text-slate-400">
                      {data.days[dayIdx]}
                    </div>
                    {dayRow.map((pct, slotIdx) => (
                      <div 
                        key={slotIdx}
                        className={`h-16 rounded-xl flex flex-col items-center justify-center border border-transparent transition-all hover:scale-105 hover:shadow-lg hover:z-10 cursor-help ${getHeatColor(pct)}`}
                        title={`${pct}% of rooms are occupied`}
                      >
                        <span className="text-lg font-black">{pct}%</span>
                        <span className="text-[9px] font-bold uppercase opacity-60">Busy</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-900/40 p-6 rounded-3xl flex gap-4">
        <Info className="w-6 h-6 text-indigo-600 dark:text-indigo-400 shrink-0" />
        <div className="text-sm text-indigo-800 dark:text-indigo-300 leading-relaxed">
          <p className="font-bold mb-1">Pro Tip for CRs</p>
          To increase the chances of your makeup class being approved, look for slots where occupancy is below 30% (Green). These slots have the most available classrooms.
        </div>
      </div>
    </div>
  );
}
