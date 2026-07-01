import React, { useEffect, useState } from "react";
import axios from "axios";
import { Calendar as CalendarIcon, ShieldAlert } from "lucide-react";

interface ScheduleEvent {
  id: string;
  title: string;
  date: string; // "YYYY-MM-DD"
  type: "Review" | "Meeting" | "Defense";
}

const Schedule: React.FC = () => {
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // We pre-render June 2026 as standard month calendar
  const year = 2026;
  const month = 5; // 0-indexed (June)
  const monthName = "June 2026";

  const fetchSchedule = async () => {
    try {
      setLoading(true);
      const res = await axios.get<ScheduleEvent[]>("/api/student/schedule");
      setEvents(res.data);
    } catch (err) {
      console.error("Schedule load failed:", err);
      setError("Failed to fetch schedule events.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedule();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-[450px] bg-white border border-gray-200 rounded-lg p-6" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-6 bg-white border border-gray-200 rounded-lg shadow-xs">
        <ShieldAlert className="text-[#FF6B35] mb-4" size={48} />
        <h3 className="text-lg font-bold text-gray-800 mb-1">Retrieval Mismatch</h3>
        <p className="text-sm text-gray-500 max-w-sm mb-4">{error || "No events found."}</p>
        <button 
          onClick={fetchSchedule} 
          className="bg-primary hover:bg-primaryDark text-white text-xs font-semibold px-4 py-2 rounded-sm shadow-xs transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  // Pre-calculate cells list for June 2026 (Starts on Monday, has 30 days)
  const totalDays = 30;
  const startDayOffset = 1; // Monday (Sunday=0, Monday=1, etc.)
  const calendarCells = [];

  // Empty cells for offset
  for (let i = 0; i < startDayOffset; i++) {
    calendarCells.push(null);
  }

  // Days numbering
  for (let d = 1; d <= totalDays; d++) {
    calendarCells.push(d);
  }

  const getEventBadgeStyle = (type: ScheduleEvent["type"]) => {
    switch (type) {
      case "Review":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "Defense":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-gray-50 text-gray-600 border-gray-200";
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      {/* Calendar Grid (2 Cols) */}
      <div className="xl:col-span-2 bg-white border border-gray-200 rounded-lg p-6 shadow-xs">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2.5">
            <CalendarIcon className="text-primary" size={16} />
            <h3 className="text-sm font-bold text-gray-800">{monthName}</h3>
          </div>
          <span className="text-[10px] text-gray-400">Milestone Deadlines</span>
        </div>

        {/* Days of Week Headers */}
        <div className="grid grid-cols-7 gap-1 text-center font-bold text-gray-400 text-[10px] uppercase tracking-wider mb-2">
          <span>Sun</span>
          <span>Mon</span>
          <span>Tue</span>
          <span>Wed</span>
          <span>Thu</span>
          <span>Fri</span>
          <span>Sat</span>
        </div>

        {/* Calendar Matrix */}
        <div className="grid grid-cols-7 gap-2">
          {calendarCells.map((day, idx) => {
            if (day === null) {
              return <div key={`empty-${idx}`} className="aspect-square bg-gray-50/50 rounded-sm border border-transparent" />;
            }

            // Check if day has events (June 2026 = "2026-06-XX" or check simple index)
            const dateString = `2026-07-${day < 10 ? "0" + day : day}`; // mock maps to July events
            const dayEvents = events.filter(e => e.date.endsWith(day < 10 ? "0" + day : String(day)));

            return (
              <div 
                key={`day-${day}`} 
                className="aspect-square bg-white border border-gray-150 rounded-sm p-1.5 flex flex-col justify-between hover:border-primary/50 transition-colors cursor-pointer group min-h-[60px]"
              >
                <span className="text-[10px] font-bold text-gray-400 group-hover:text-primary transition-colors">{day}</span>
                {dayEvents.length > 0 && (
                  <div className="space-y-0.5 mt-1 overflow-hidden">
                    {dayEvents.map(e => (
                      <span 
                        key={e.id}
                        className={`text-[8px] font-bold px-1.5 py-0.5 rounded-sm border block truncate leading-tight ${getEventBadgeStyle(e.type)}`}
                        title={e.title}
                      >
                        {e.title.split(" ").slice(0, 2).join(" ")}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Events Roster Panel (1 Col) */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-xs flex flex-col h-full">
        <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-4 pb-2 border-b border-gray-100 shrink-0">
          Scheduled Milestones
        </h3>
        
        {events.length === 0 ? (
          <p className="text-xs text-gray-400 italic py-6">No scheduled defense or meetings found.</p>
        ) : (
          <div className="space-y-4 overflow-y-auto grow pr-1">
            {events.map((event) => (
              <div key={event.id} className="border border-gray-150 rounded-lg p-3.5 flex gap-3.5 items-start hover:border-gray-300 transition-colors">
                <div className={`text-[10px] font-bold px-2 py-0.5 rounded-sm border shrink-0 ${getEventBadgeStyle(event.type)}`}>
                  {event.type}
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-gray-800 leading-tight">{event.title}</h4>
                  <span className="text-[9px] text-gray-400 mt-1 block">Scheduled Date: <span className="font-semibold text-gray-600">{event.date}</span></span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Schedule;
