import React, { useEffect, useState } from "react";
import axios from "axios";
import { 
  FileText, 
  Upload, 
  History, 
  Download, 
  User, 
  Calendar, 
  HardDrive,
  X,
  Clock,
  ShieldAlert
} from "lucide-react";

interface FileHistory {
  version: number;
  date: string;
  uploader: string;
  size: string;
}

interface ProjectDoc {
  id: string;
  stageId: number;
  name: string;
  size: string;
  uploader: string;
  date: string;
  version: number;
  history: FileHistory[];
}

const Docs: React.FC = () => {
  const [activeTab, setActiveTab] = useState<number>(1);
  const [docs, setDocs] = useState<ProjectDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // File Upload states
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Version drawer states
  const [drawerDoc, setDrawerDoc] = useState<ProjectDoc | null>(null);

  const fetchDocs = async () => {
    try {
      setLoading(true);
      const res = await axios.get<ProjectDoc[]>("/api/student/docs");
      setDocs(res.data);
    } catch (err) {
      console.error("Docs list load failed:", err);
      setError("Failed to fetch project documents.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      await uploadFile(files[0]);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await uploadFile(files[0]);
    }
  };

  const uploadFile = async (file: File) => {
    // Validate size (max 50MB)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      alert("File size exceeds 50MB limit.");
      return;
    }

    // Validate type
    const validExtensions = ["pdf", "pptx", "docx", "zip"];
    const fileExt = file.name.split(".").pop()?.toLowerCase() || "";
    if (!validExtensions.includes(fileExt)) {
      alert("Invalid file format. Please upload PDF, PPTX, DOCX, or ZIP files.");
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(10);
      
      // Simulate file upload progress bar values
      const progressTimer = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressTimer);
            return 90;
          }
          return prev + 15;
        });
      }, 200);

      // Perform POST upload
      const fileSizeString = `${(file.size / (1024 * 1024)).toFixed(1)} MB`;
      const res = await axios.post<{ message: string; files: ProjectDoc[] }>("/api/student/docs/upload", {
        name: file.name,
        size: fileSizeString,
        stageId: activeTab,
        uploader: "Rajesh Kumar"
      });

      clearInterval(progressTimer);
      setUploadProgress(100);
      
      setTimeout(() => {
        setDocs(res.data.files);
        setUploading(false);
        setUploadProgress(0);
      }, 500);

    } catch (err) {
      console.error("File upload failed:", err);
      alert("Failed to upload document.");
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-44 bg-white border border-gray-200 rounded-lg p-6" />
        <div className="h-64 bg-white border border-gray-200 rounded-lg p-6" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-6 bg-white border border-gray-200 rounded-lg shadow-xs">
        <ShieldAlert className="text-[#FF6B35] mb-4" size={48} />
        <h3 className="text-lg font-bold text-gray-800 mb-1">Retrieval Mismatch</h3>
        <p className="text-sm text-gray-500 max-w-sm mb-4">{error || "No documents found."}</p>
        <button 
          onClick={fetchDocs} 
          className="bg-primary hover:bg-primaryDark text-white text-xs font-semibold px-4 py-2 rounded-sm shadow-xs transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  const activeDocs = docs.filter((d) => d.stageId === activeTab);

  return (
    <div className="space-y-6 relative">
      {/* 5-Stage Tabs Header */}
      <div className="flex border-b border-gray-200 overflow-x-auto bg-white rounded-t-lg p-1 shrink-0">
        {[1, 2, 3, 4, 5].map((stage) => (
          <button
            key={stage}
            onClick={() => setActiveTab(stage)}
            className={`flex-1 min-w-[120px] text-center py-3 text-xs font-bold transition-colors focus:outline-none border-b-2 ${
              activeTab === stage 
                ? "text-primary border-primary bg-orange-50/10 font-bold" 
                : "text-gray-400 border-transparent hover:text-gray-600"
            }`}
          >
            Stage {stage}
          </button>
        ))}
      </div>

      {/* Upload Drag area */}
      <div 
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`bg-white border border-dashed rounded-lg p-8 text-center transition-colors relative ${
          dragOver ? "border-primary bg-orange-50/10" : "border-gray-300"
        }`}
      >
        <div className="flex flex-col items-center justify-center space-y-3.5">
          <div className="p-3 bg-gray-50 text-gray-400 rounded-full border border-gray-150">
            <Upload size={22} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-gray-800">Drag & Drop files to upload</h4>
            <p className="text-[10px] text-gray-400 mt-1">PDF, PPTX, DOCX, or ZIP files up to 50MB permitted</p>
          </div>
          <label className="bg-[#0B132B] hover:bg-[#1C2541] text-white text-xs font-semibold px-4 py-2 rounded-sm shadow-xs cursor-pointer transition-colors">
            Choose File
            <input 
              type="file" 
              className="hidden" 
              accept=".pdf,.pptx,.docx,.zip"
              onChange={handleFileChange}
            />
          </label>
        </div>

        {/* Upload Progress Bar */}
        {uploading && (
          <div className="absolute inset-0 bg-white/90 backdrop-blur-xs flex flex-col items-center justify-center p-6 rounded-lg">
            <HardDrive className="text-primary animate-bounce mb-3" size={24} />
            <span className="text-xs font-bold text-gray-700">Uploading Document...</span>
            <div className="w-64 bg-gray-100 h-2 rounded-full overflow-hidden mt-3 border">
              <div 
                className="bg-primary h-full rounded-full transition-all duration-150"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <span className="text-[10px] text-gray-400 mt-1.5">{uploadProgress}% Completed</span>
          </div>
        )}
      </div>

      {/* Documents Table */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-xs overflow-hidden">
        {activeDocs.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="text-gray-300 mx-auto mb-3" size={36} />
            <h4 className="text-xs font-semibold text-gray-700">No documents found</h4>
            <p className="text-[10px] text-gray-400 mt-1">Upload slides, reports, or ZIP archives for Stage {activeTab}.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-200">
                  <th className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-6 py-4">File Name</th>
                  <th className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-6 py-4">Size</th>
                  <th className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-6 py-4">Uploader</th>
                  <th className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-6 py-4">Modified Date</th>
                  <th className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-6 py-4">Version</th>
                  <th className="px-6 py-4" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-150 text-xs">
                {activeDocs.map((doc) => (
                  <tr key={doc.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-gray-800 max-w-[200px] truncate">{doc.name}</td>
                    <td className="px-6 py-4 text-gray-500">{doc.size}</td>
                    <td className="px-6 py-4 text-gray-500 flex items-center gap-1.5 mt-0.5">
                      <div className="w-5 h-5 rounded-full bg-[#0B132B]/5 flex items-center justify-center text-[9px] font-semibold text-[#0B132B]">
                        {doc.uploader.split(" ").map(s => s[0]).join("")}
                      </div>
                      <span>{doc.uploader}</span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">{doc.date}</td>
                    <td className="px-6 py-4">
                      <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-sm border border-blue-200 text-[10px] font-semibold">
                        V{doc.version}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2 shrink-0">
                      <button
                        onClick={() => setDrawerDoc(doc)}
                        className="p-1.5 text-gray-400 hover:text-[#0B132B] hover:bg-gray-100 rounded-sm focus:outline-none"
                        title="Version History"
                      >
                        <History size={14} />
                      </button>
                      <button
                        className="p-1.5 text-gray-400 hover:text-primary hover:bg-gray-100 rounded-sm focus:outline-none"
                        title="Download File"
                      >
                        <Download size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Version History Drawer (Right Slide-out Panel) */}
      {drawerDoc && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/45 backdrop-blur-xs"
            onClick={() => setDrawerDoc(null)}
          />
          {/* Panel */}
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col p-6 overflow-y-auto">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-150">
              <div className="flex items-center gap-2.5">
                <Clock size={16} className="text-primary" />
                <h3 className="text-sm font-bold text-gray-800">Version History</h3>
              </div>
              <button 
                onClick={() => setDrawerDoc(null)}
                className="p-1 text-gray-400 hover:text-gray-800 rounded-sm hover:bg-gray-100 focus:outline-none"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 border border-gray-150 rounded-lg p-4">
                <h4 className="text-xs font-bold text-gray-800 truncate mb-1">{drawerDoc.name}</h4>
                <p className="text-[10px] text-gray-400">Current active file version: <span className="font-semibold text-gray-600">V{drawerDoc.version}</span></p>
              </div>

              <div className="border-l-2 border-gray-100 ml-3 pl-6 space-y-6 pt-2">
                {drawerDoc.history.map((hist) => (
                  <div key={hist.version} className="relative">
                    {/* Ring dot */}
                    <div className="absolute -left-[31px] top-1.5 w-3.5 h-3.5 rounded-full bg-white border-2 border-blue-500" />
                    
                    <div className="text-xs space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-gray-800">Version {hist.version}</span>
                        <span className="text-[9px] text-gray-400">{hist.date}</span>
                      </div>
                      <p className="text-[10px] text-gray-500 flex items-center gap-1">
                        <User size={10} />
                        Uploaded by: <span className="font-semibold text-gray-700">{hist.uploader}</span>
                      </p>
                      <p className="text-[10px] text-gray-500 flex items-center gap-1">
                        <Calendar size={10} />
                        Size: <span className="font-semibold text-gray-700">{hist.size}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Docs;
