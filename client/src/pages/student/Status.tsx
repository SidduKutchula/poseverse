import React, { useEffect, useState } from "react";
import axios from "axios";
import { CheckCircle2, Circle, Clock, MessageSquare, ShieldAlert } from "lucide-react";

interface Stage {
  id: number;
  name: string;
  status: "Approved" | "In Progress" | "Ready for Review" | "Pending";
  dueDate: string;
  marks: number | null;
  feedback: string | null;
}

const Status: React.FC = () => {
  const [stages, setStages] = useState<Stage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submittingId, setSubmittingId] = useState<number | null>(null);

  // Leader role stub ( రాజేష్ కుమార్ is leader, so matches true )
  const isLeader = true;

  const fetchStages = async () => {
    try {
      setLoading(true);
      const res = await axios.get<Stage[]>("/api/student/status");
      setStages(res.data);
    } catch (err) {
      console.error("Status timeline load failed:", err);
      setError("Failed to fetch milestone statuses.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStages();
  }, []);

  const handleMarkReady = async (stageId: number) => {
    try {
      setSubmittingId(stageId);
      const res = await axios.post<{ message: string; stages: Stage[] }>(`/api/student/status/ready/${stageId}`);
      setStages(res.data.stages);
    } catch (err) {
      console.error("Submission failed:", err);
      alert("Failed to submit milestone.");
    } finally {
      setSubmittingId(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-96 bg-white border border-gray-200 rounded-lg p-6" />
      </div>
    );
  }

  if (error || stages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-6 bg-white border border-gray-200 rounded-lg shadow-xs">
        <ShieldAlert className="text-[#FF6B35] mb-4" size={48} />
        <h3 className="text-lg font-bold text-gray-800 mb-1">Retrieval Mismatch</h3>
        <p className="text-sm text-gray-500 max-w-sm mb-4">{error || "No status stages configured."}</p>
        <button 
          onClick={fetchStages} 
          className="bg-primary hover:bg-primaryDark text-white text-xs font-semibold px-4 py-2 rounded-sm shadow-xs transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  const getStatusStyle = (status: Stage["status"]) => {
    switch (status) {
      case "Approved":
        return "bg-green-50 text-green-700 border-green-200";
      case "In Progress":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "Ready for Review":
        return "bg-amber-50 text-amber-700 border-amber-200";
      default:
        return "bg-gray-50 text-gray-500 border-gray-200";
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-xs">
      <div className="flex justify-between items-center mb-10 pb-4 border-b border-gray-100">
        <h3 className="text-sm font-bold text-gray-800">Project Evaluation Roadmap</h3>
        <span className="text-[10px] text-gray-400">Track reviews and defense progress</span>
      </div>

      {/* Vertical Timeline */}
      <div className="relative border-l-2 border-gray-200 ml-4 pl-8 space-y-10">
        {stages.map((stage) => {
          const isSubmitted = stage.status === "Approved" || stage.status === "Ready for Review";
          const isInProgress = stage.status === "In Progress";
          const isPending = stage.status === "Pending";

          return (
            <div key={stage.id} className="relative group">
              {/* Vertical marker node */}
              <div className="absolute -left-[41px] top-0.5">
                {isSubmitted ? (
                  <div className="bg-green-500 text-white rounded-full p-0.5 border-4 border-white shadow-xs">
                    <CheckCircle2 size={16} />
                  </div>
                ) : isInProgress ? (
                  <div className="bg-blue-500 text-white rounded-full p-0.5 border-4 border-white shadow-xs">
                    <Clock size={16} />
                  </div>
                ) : (
                  <div className="bg-white text-gray-300 rounded-full p-0.5 border-4 border-gray-200 shadow-xs">
                    <Circle size={16} />
                  </div>
                )}
              </div>

              {/* Node Details */}
              <div className="space-y-2">
                <div className="flex flex-wrap justify-between items-center gap-2">
                  <div className="flex items-center gap-3">
                    <h4 className="text-xs font-bold text-gray-800">Stage {stage.id}: {stage.name}</h4>
                    <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-sm border ${getStatusStyle(stage.status)}`}>
                      {stage.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="text-[10px] text-gray-400">Due Date: <span className="font-semibold text-gray-600">{stage.dueDate}</span></span>
                    
                    {/* Mark Ready Button (Only visible to leader and for 'In Progress' stage) */}
                    {isLeader && isInProgress && (
                      <button
                        onClick={() => handleMarkReady(stage.id)}
                        disabled={submittingId === stage.id}
                        className="bg-[#0B132B] hover:bg-[#1C2541] text-white text-[10px] font-semibold px-2.5 py-1 rounded-sm shadow-xs transition-colors focus:outline-none"
                      >
                        {submittingId === stage.id ? "Submitting..." : "Mark Ready"}
                      </button>
                    )}
                  </div>
                </div>

                {/* Feedback / Marks Section */}
                {stage.marks !== null && (
                  <div className="flex items-center gap-4 bg-gray-50 border border-gray-150 rounded-sm p-3.5 text-xs text-gray-600 max-w-2xl">
                    <div className="border-r border-gray-200 pr-4 shrink-0 text-center">
                      <span className="text-[9px] text-gray-400 font-semibold uppercase block">Guide Score</span>
                      <span className="text-sm font-bold text-gray-800">{stage.marks} / 20</span>
                    </div>
                    {stage.feedback && (
                      <div className="flex gap-2 items-start">
                        <MessageSquare className="text-gray-400 shrink-0 mt-0.5" size={13} />
                        <p className="leading-relaxed italic">"{stage.feedback}"</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Status;
