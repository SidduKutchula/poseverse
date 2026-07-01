import React, { useEffect, useState } from "react";
import axios from "axios";
import { Users, Trash2, Mail, Award, ShieldAlert, Check } from "lucide-react";

interface Member {
  id: string;
  name: string;
  avatar: string;
  cgpa: number;
  role: "Leader" | "Member";
}

interface TeamData {
  teamName: string;
  projectTitle: string;
  averageCGPA: number;
  members: Member[];
  guide: {
    name: string;
    designation: string;
    email: string;
  };
  panel: Array<{ name: string; role: string }>;
}

const Team: React.FC = () => {
  const [data, setData] = useState<TeamData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Invite member inputs
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);
  const [inviteMessage, setInviteMessage] = useState<string | null>(null);

  // Leader role stub (We hardcode that Rajesh Kumar is current leader)
  const isLeader = true;

  const fetchTeam = async () => {
    try {
      setLoading(true);
      const res = await axios.get<TeamData>("/api/student/team");
      setData(res.data);
    } catch (err: any) {
      console.error("Team load failed:", err);
      setError("Failed to fetch team configuration. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeam();
  }, []);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;

    try {
      setInviting(true);
      setInviteMessage(null);
      const res = await axios.post<{ message: string; members: Member[] }>("/api/student/team/invite", {
        email: inviteEmail,
        role: "Member"
      });
      setInviteMessage(res.data.message);
      setInviteEmail("");
      if (data) {
        setData({
          ...data,
          members: res.data.members,
          averageCGPA: parseFloat((res.data.members.reduce((acc, m) => acc + m.cgpa, 0) / res.data.members.length).toFixed(2))
        });
      }
    } catch (err) {
      console.error("Invite member failed:", err);
      setInviteMessage("Failed to send invitation link.");
    } finally {
      setInviting(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm("Are you sure you want to remove this team member?")) return;

    try {
      const res = await axios.delete<{ message: string; members: Member[] }>(`/api/student/team/member/${memberId}`);
      if (data) {
        setData({
          ...data,
          members: res.data.members,
          averageCGPA: res.data.members.length > 0 
            ? parseFloat((res.data.members.reduce((acc, m) => acc + m.cgpa, 0) / res.data.members.length).toFixed(2))
            : 0
        });
      }
    } catch (err) {
      console.error("Remove member failed:", err);
      alert("Failed to remove member.");
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-28 bg-white border border-gray-200 rounded-lg p-6" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-64 bg-white border border-gray-200 rounded-lg p-6" />
          </div>
          <div className="h-64 bg-white border border-gray-200 rounded-lg p-6" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-6 bg-white border border-gray-200 rounded-lg shadow-xs">
        <ShieldAlert className="text-[#FF6B35] mb-4" size={48} />
        <h3 className="text-lg font-bold text-gray-800 mb-1">Retrieval Mismatch</h3>
        <p className="text-sm text-gray-500 max-w-sm mb-4">{error || "No team settings available."}</p>
        <button 
          onClick={fetchTeam} 
          className="bg-primary hover:bg-primaryDark text-white text-xs font-semibold px-4 py-2 rounded-sm shadow-xs transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview stats */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">{data.teamName}</h2>
          <p className="text-xs text-gray-500 mt-1">Project Title: <span className="font-semibold text-gray-700">{data.projectTitle}</span></p>
        </div>
        <div className="flex gap-4 border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6 shrink-0">
          <div>
            <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider block">Average CGPA</span>
            <span className="text-lg font-bold text-gray-800 mt-0.5">{data.averageCGPA}</span>
          </div>
          <div>
            <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider block">Members count</span>
            <span className="text-lg font-bold text-gray-800 mt-0.5">{data.members.length} / 4</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Members column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-xs">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-bold text-gray-800">Team Roster</h3>
              <span className="text-[10px] text-gray-400">Manage students configuration</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {data.members.map((member) => (
                <div key={member.id} className="border border-gray-200 rounded-lg p-4 flex gap-3.5 items-center relative group">
                  <img 
                    src={member.avatar} 
                    alt={member.name}
                    className="w-12 h-12 rounded-full object-cover shrink-0" 
                  />
                  <div className="grow min-w-0">
                    <h4 className="text-xs font-semibold text-gray-800 truncate">{member.name}</h4>
                    <div className="flex gap-1.5 items-center mt-1">
                      <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-sm ${
                        member.role === "Leader" 
                          ? "bg-amber-50 text-amber-700 border border-amber-200" 
                          : "bg-blue-50 text-blue-700 border border-blue-200"
                      }`}>
                        {member.role}
                      </span>
                      <span className="text-[9px] bg-gray-50 text-gray-600 border border-gray-200 px-2 py-0.5 rounded-sm">
                        CGPA: {member.cgpa}
                      </span>
                    </div>
                  </div>
                  {/* Delete button (only for Leader on other members) */}
                  {isLeader && member.role !== "Leader" && (
                    <button
                      onClick={() => handleRemoveMember(member.id)}
                      className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-red-500 rounded-sm hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity focus:outline-none"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Leader invitation panel */}
            {isLeader && (
              <div className="mt-8 pt-6 border-t border-gray-100">
                <h4 className="text-xs font-bold text-gray-800 mb-3">Invite Team Member</h4>
                <form onSubmit={handleInvite} className="flex flex-col sm:flex-row gap-3">
                  <div className="grow relative">
                    <input 
                      type="email" 
                      placeholder="Enter student email address"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-sm px-3.5 py-2 pl-9 text-xs focus:outline-none focus:border-primary"
                      required
                    />
                    <Mail className="absolute left-3.5 top-3 text-gray-400" size={13} />
                  </div>
                  <button 
                    type="submit"
                    disabled={inviting}
                    className="bg-[#0B132B] hover:bg-[#1C2541] text-white text-xs font-semibold px-5 py-2.5 rounded-sm shadow-xs shrink-0 transition-colors"
                  >
                    {inviting ? "Sending..." : "Send Invite"}
                  </button>
                </form>
                {inviteMessage && (
                  <div className="flex gap-2 items-center text-[10px] text-green-700 mt-2 bg-green-50 p-2 rounded-xs border border-green-200">
                    <Check size={12} />
                    <span>{inviteMessage}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Advisor Details column */}
        <div className="space-y-6">
          {/* Assigned Guide */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-xs">
            <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-4">Assigned Guide</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-50 text-amber-600 rounded-sm border border-amber-200">
                  <Award size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-800">{data.guide.name}</h4>
                  <p className="text-[10px] text-gray-400">{data.guide.designation}</p>
                </div>
              </div>
              <div className="text-[11px] text-gray-500 pt-1 border-t border-gray-50 flex items-center justify-between">
                <span>Email Address:</span>
                <span className="font-semibold text-gray-700">{data.guide.email}</span>
              </div>
            </div>
          </div>

          {/* Assigned Panel */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-xs">
            <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-4">Assigned Evaluation Panel</h3>
            {data.panel.length === 0 ? (
              <p className="text-xs text-gray-400 italic py-4">No evaluation panel assigned.</p>
            ) : (
              <div className="space-y-3.5">
                {data.panel.map((panelist, idx) => (
                  <div key={idx} className="flex justify-between items-center border-b border-gray-50 pb-2.5 last:border-b-0 last:pb-0">
                    <div>
                      <h4 className="text-xs font-semibold text-gray-800">{panelist.name}</h4>
                      <p className="text-[9px] text-gray-400 mt-0.5">{panelist.role}</p>
                    </div>
                    <span className="text-[9px] font-semibold px-2 py-0.5 bg-gray-50 border border-gray-150 rounded-sm text-gray-600">
                      Panelist
                    </span>
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

export default Team;
