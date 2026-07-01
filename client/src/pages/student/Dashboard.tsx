import React, { useEffect, useState } from "react";
import axios from "axios";
import { 
  Calendar, 
  Bell, 
  Sparkles, 
  Users, 
  FileText, 
  Clock, 
  ShieldAlert 
} from "lucide-react";

interface DashboardData {
  currentStage: string;
  daysToReview: number;
  teamCount: number;
  docsCount: number;
  progressPercent: number;
  similarityRisk: "Low" | "Medium" | "High";
  upcomingEvents: Array<{ id: string; title: string; date: string; type: string }>;
  recentNotifications: Array<{ id: string; title: string; message: string; date: string }>;
  aiSuggestion: string;
}

const Dashboard: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        // Point to our newly registered backend endpoints
        const res = await axios.get<DashboardData>("/api/student/dashboard");
        setData(res.data);
      } catch (err: any) {
        console.error("Dashboard load failed:", err);
        setError("Failed to fetch dashboard metrics. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        {/* Skeleton Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-white border border-gray-200 rounded-lg p-5 space-y-3">
              <div className="w-1/3 h-4 bg-gray-200 rounded-sm" />
              <div className="w-2/3 h-8 bg-gray-200 rounded-sm" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-44 bg-white border border-gray-200 rounded-lg p-6" />
            <div className="h-56 bg-white border border-gray-200 rounded-lg p-6" />
          </div>
          <div className="space-y-6">
            <div className="h-48 bg-white border border-gray-200 rounded-lg p-6" />
            <div className="h-52 bg-white border border-gray-200 rounded-lg p-6" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
        <ShieldAlert className="text-[#FF6B35] mb-4" size={48} />
        <h3 className="text-lg font-bold text-gray-800 mb-1">Retrieval Mismatch</h3>
        <p className="text-sm text-gray-500 max-w-sm mb-4">{error || "No dashboard stats data available."}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="bg-primary hover:bg-primaryDark text-white text-xs font-semibold px-4 py-2 rounded-sm shadow-xs transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  const riskColors = {
    Low: "bg-green-50 text-green-700 border-green-200",
    Medium: "bg-yellow-50 text-yellow-700 border-yellow-200",
    High: "bg-red-50 text-red-700 border-red-200"
  };

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-[#FF6B35]/10 text-[#FF6B35] rounded-sm">
            <Clock size={20} />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Current Stage</p>
            <h3 className="text-lg font-bold text-gray-800 mt-0.5 truncate max-w-[150px]">{data.currentStage}</h3>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-sm">
            <Calendar size={20} />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Days to Review</p>
            <h3 className="text-2xl font-bold text-gray-800 mt-0.5">{data.daysToReview} Days</h3>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-sm">
            <Users size={20} />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Team Members</p>
            <h3 className="text-2xl font-bold text-gray-800 mt-0.5">{data.teamCount} Members</h3>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-green-50 text-green-600 rounded-sm">
            <FileText size={20} />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Docs Uploaded</p>
            <h3 className="text-2xl font-bold text-gray-800 mt-0.5">{data.docsCount} Files</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Progress & Recommendations column */}
        <div className="lg:col-span-2 space-y-6 flex flex-col justify-between">
          {/* Progress Card */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-xs flex-1 flex flex-col justify-center">
            <div className="flex justify-between items-center mb-3">
              <div>
                <h3 className="text-sm font-bold text-gray-800">Project Completion Status</h3>
                <p className="text-xs text-gray-500">Stage 1 of 5 milestones approved</p>
              </div>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-sm border ${riskColors[data.similarityRisk]}`}>
                Similarity Risk: {data.similarityRisk}
              </span>
            </div>
            {/* Progress bar */}
            <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden mt-2">
              <div 
                className="bg-[#FF6B35] h-full rounded-full transition-all duration-500" 
                style={{ width: `${data.progressPercent}%` }}
              />
            </div>
            <div className="flex justify-between items-center mt-3 text-xs text-gray-400">
              <span>0% Start</span>
              <span className="font-semibold text-gray-700">{data.progressPercent}% Completed</span>
              <span>100% Defense</span>
            </div>
          </div>

          {/* AI Suggestion Card */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-xs bg-linear-to-r from-white to-orange-50/20 border-l-4 border-l-[#FF6B35] mt-6 flex-1 flex flex-col justify-center">
            <div className="flex items-center gap-2 text-primary font-bold text-sm mb-3">
              <Sparkles size={16} className="text-[#FF6B35]" />
              <span>Project Advisor AI Advice</span>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed italic">
              "{data.aiSuggestion}"
            </p>
          </div>
        </div>

        {/* Schedule & Notifications column */}
        <div className="space-y-6">
          {/* Upcoming events */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-xs">
            <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-4">Upcoming Reviews</h3>
            {data.upcomingEvents.length === 0 ? (
              <p className="text-xs text-gray-400 italic py-4">No reviews currently scheduled.</p>
            ) : (
              <div className="space-y-3.5">
                {data.upcomingEvents.map((event) => (
                  <div key={event.id} className="flex gap-3 items-start border-b border-gray-100 pb-3 last:border-b-0 last:pb-0">
                    <div className={`text-[10px] font-semibold px-2 py-0.5 rounded-xs shrink-0 ${
                      event.type === "Review" 
                        ? "bg-blue-50 text-blue-600" 
                        : event.type === "Defense" 
                        ? "bg-red-50 text-red-600" 
                        : "bg-gray-50 text-gray-600"
                    }`}>
                      {event.type}
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-gray-800 line-clamp-1">{event.title}</h4>
                      <p className="text-[10px] text-gray-400 mt-0.5">{event.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent notifications */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-xs">
            <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-4">Activity Timeline</h3>
            {data.recentNotifications.length === 0 ? (
              <p className="text-xs text-gray-400 italic py-4">No recent activities.</p>
            ) : (
              <div className="space-y-3.5">
                {data.recentNotifications.map((notif) => (
                  <div key={notif.id} className="flex gap-3 items-start">
                    <div className="p-1 bg-[#0B132B]/5 rounded-full text-[#0B132B] mt-0.5">
                      <Bell size={12} />
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-gray-800 leading-tight">{notif.title}</h4>
                      <p className="text-[10px] text-gray-500 mt-0.5">{notif.message}</p>
                      <span className="text-[9px] text-gray-400 mt-1 block">{notif.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
