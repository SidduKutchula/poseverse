import express from "express";

const router = express.Router();

// In-Memory state for the Student Project
let projectData = {
  title: "AI-Powered Vision Assistant for Navigation",
  problemStatement: "Navigating unfamiliar environments poses a challenge for visually impaired individuals. Existing tools are bulky and expensive. This project designs a lightweight camera-based assistant to classify obstacles and deliver audio guidance.",
  technologies: ["React", "TensorFlow", "Node.js", "OpenCV", "TailwindCSS"],
  domain: "Computer Vision & Assistive Tech"
};

let teamMembers = [
  {
    id: "m1",
    name: "Rajesh Kumar",
    avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&h=100&fit=crop",
    cgpa: 9.1,
    role: "Leader"
  },
  {
    id: "m2",
    name: "Anjali Sharma",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop",
    cgpa: 8.8,
    role: "Member"
  },
  {
    id: "m3",
    name: "Saurav Das",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
    cgpa: 8.7,
    role: "Member"
  }
];

let stageStatus = [
  { id: 1, name: "Project Proposal", status: "Approved", dueDate: "2026-07-15", marks: 18, feedback: "Solid problem statement and scope defined. Approved for implementation." },
  { id: 2, name: "System Architecture & Design", status: "In Progress", dueDate: "2026-08-30", marks: null, feedback: null },
  { id: 3, name: "Mid-Term Implementation", status: "Pending", dueDate: "2026-10-15", marks: null, feedback: null },
  { id: 4, name: "Final Integration", status: "Pending", dueDate: "2026-12-01", marks: null, feedback: null },
  { id: 5, name: "Project Defense", status: "Pending", dueDate: "2027-02-10", marks: null, feedback: null }
];

let documentsList = [
  {
    id: "doc1",
    stageId: 1,
    name: "Project_Proposal_Draft_V1.pdf",
    size: "3.2 MB",
    uploader: "Rajesh Kumar",
    date: "2026-06-20",
    version: 1,
    history: [
      { version: 1, date: "2026-06-20", uploader: "Rajesh Kumar", size: "3.2 MB" }
    ]
  },
  {
    id: "doc2",
    stageId: 1,
    name: "Proposal_Final_Presentation.pptx",
    size: "8.5 MB",
    uploader: "Anjali Sharma",
    date: "2026-06-25",
    version: 2,
    history: [
      { version: 2, date: "2026-06-25", uploader: "Anjali Sharma", size: "8.5 MB" },
      { version: 1, date: "2026-06-22", uploader: "Anjali Sharma", size: "8.1 MB" }
    ]
  }
];

let scheduleEvents = [
  { id: "e1", title: "Project Proposal Review", date: "2026-07-10", type: "Review" },
  { id: "e2", title: "Guide Discussion on Architecture", date: "2026-07-22", type: "Meeting" },
  { id: "e3", title: "System Design Presentation", date: "2026-08-25", type: "Review" },
  { id: "e4", title: "Mid-Term Project Defense", date: "2026-10-12", type: "Defense" }
];

let notifications = [
  { id: "n1", title: "Marks Published", message: "Guide Dr. A. K. Sen published 18/20 marks for Stage 1", date: "2 Hours ago" },
  { id: "n2", title: "Document Uploaded", message: "Anjali Sharma uploaded Proposal_Final_Presentation.pptx", date: "1 Day ago" },
  { id: "n3", title: "Schedule Change", message: "Proposal Review postponed to 2026-07-10", date: "3 Days ago" }
];

// Stats Helper
const getDashboardStats = () => {
  const currentStageNode = stageStatus.find(s => s.status === "In Progress" || s.status === "Pending") || { id: 5 };
  return {
    currentStage: currentStageNode.name || "Completed",
    daysToReview: 11,
    teamCount: teamMembers.length,
    docsCount: documentsList.length,
    progressPercent: Math.round(((stageStatus.filter(s => s.status === "Approved").length) / 5) * 100),
    similarityRisk: "Low",
    upcomingEvents: scheduleEvents.slice(0, 2),
    recentNotifications: notifications.slice(0, 3),
    aiSuggestion: "Verify your TensorFlow dependencies. Since you are building a lightweight assistant, look into TensorFlow Lite or ONNX runtime optimization for edge devices to improve obstacle classification frames-per-second."
  };
};

// GET Dashboard Stats
router.get("/dashboard", (req, res) => {
  res.json(getDashboardStats());
});

// GET Team Profile
router.get("/team", (req, res) => {
  const avgCgpa = parseFloat((teamMembers.reduce((acc, m) => acc + m.cgpa, 0) / teamMembers.length).toFixed(2));
  res.json({
    teamName: "Code Wizards",
    projectTitle: projectData.title,
    averageCGPA: avgCgpa,
    members: teamMembers,
    guide: {
      name: "Dr. A. K. Sen",
      designation: "Associate Professor, CSE Dept",
      email: "ak.sen@university.edu"
    },
    panel: [
      { name: "Dr. S. Roy", role: "Internal Reviewer" },
      { name: "Prof. R. Dutta", role: "External Panelist" }
    ]
  });
});

// POST Team Invite
router.post("/team/invite", (req, res) => {
  const { email, role } = req.body;
  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  // Simulate inviting a member by appending a mock user
  const newMember = {
    id: "m" + (teamMembers.length + 1),
    name: email.split("@")[0],
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop",
    cgpa: 8.5,
    role: role || "Member"
  };
  teamMembers.push(newMember);

  res.json({ message: `Invitation successfully dispatched to ${email}`, members: teamMembers });
});

// DELETE Team Member
router.delete("/team/member/:id", (req, res) => {
  const { id } = req.params;
  teamMembers = teamMembers.filter(m => m.id !== id);
  res.json({ message: "Member successfully removed", members: teamMembers });
});

// GET Project details
router.get("/project", (req, res) => {
  res.json(projectData);
});

// POST Project details (Auto-saved)
router.post("/project", (req, res) => {
  const { title, problemStatement, technologies, domain } = req.body;
  projectData = {
    title: title || projectData.title,
    problemStatement: problemStatement || projectData.problemStatement,
    technologies: Array.isArray(technologies) ? technologies : projectData.technologies,
    domain: domain || projectData.domain
  };
  res.json({ message: "Project configuration successfully updated", project: projectData });
});

// GET Status Timeline
router.get("/status", (req, res) => {
  res.json(stageStatus);
});

// POST Mark Stage Ready (Leader only)
router.post("/status/ready/:stageId", (req, res) => {
  const stageId = parseInt(req.params.stageId);
  const stage = stageStatus.find(s => s.id === stageId);
  if (stage) {
    stage.status = "Ready for Review";
    return res.json({ message: `Stage ${stageId} successfully submitted for guide review`, stages: stageStatus });
  }
  res.status(404).json({ message: "Stage ID not found" });
});

// GET Documents
router.get("/docs", (req, res) => {
  res.json(documentsList);
});

// POST Upload Document (PDF/PPTX/DOCX/ZIP, Max 50MB)
router.post("/docs/upload", (req, res) => {
  const { name, size, stageId, uploader } = req.body;
  if (!name || !stageId) {
    return res.status(400).json({ message: "File name and Stage ID are required" });
  }

  // Simulate file save/history appending
  const existingDoc = documentsList.find(d => d.name === name && d.stageId === parseInt(stageId));
  if (existingDoc) {
    existingDoc.version += 1;
    existingDoc.date = new Date().toISOString().split("T")[0];
    existingDoc.uploader = uploader || "Rajesh Kumar";
    existingDoc.size = size || "1.5 MB";
    existingDoc.history.unshift({
      version: existingDoc.version,
      date: existingDoc.date,
      uploader: existingDoc.uploader,
      size: existingDoc.size
    });
    return res.json({ message: "File version successfully updated", file: existingDoc, files: documentsList });
  }

  const newDoc = {
    id: "doc" + (documentsList.length + 1),
    stageId: parseInt(stageId),
    name,
    size: size || "2.1 MB",
    uploader: uploader || "Rajesh Kumar",
    date: new Date().toISOString().split("T")[0],
    version: 1,
    history: [
      { version: 1, date: new Date().toISOString().split("T")[0], uploader: uploader || "Rajesh Kumar", size: size || "2.1 MB" }
    ]
  };
  documentsList.push(newDoc);
  res.json({ message: "File successfully uploaded", file: newDoc, files: documentsList });
});

// GET Schedule
router.get("/schedule", (req, res) => {
  res.json(scheduleEvents);
});

export default router;
