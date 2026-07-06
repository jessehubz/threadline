export interface TemplateNode {
  title: string;
  dependencies: number[]; // indices of nodes this depends on
}

export interface Template {
  name: string;
  description: string;
  nodes: TemplateNode[];
}

export const templates: Template[] = [
  {
    name: "Web Application",
    description: "Full-stack web app development workflow",
    nodes: [
      { title: "Requirements & Planning", dependencies: [] },
      { title: "UI/UX Design", dependencies: [0] },
      { title: "Database Schema Design", dependencies: [0] },
      { title: "Frontend Development", dependencies: [1] },
      { title: "Backend API Development", dependencies: [2] },
      { title: "Integration & Testing", dependencies: [3, 4] },
      { title: "Performance Optimization", dependencies: [5] },
      { title: "Deployment & Launch", dependencies: [6] },
    ],
  },
  {
    name: "Marketing Campaign",
    description: "End-to-end marketing campaign planning",
    nodes: [
      { title: "Market Research", dependencies: [] },
      { title: "Define Target Audience", dependencies: [0] },
      { title: "Campaign Strategy", dependencies: [1] },
      { title: "Content Creation", dependencies: [2] },
      { title: "Design Assets", dependencies: [2] },
      { title: "Channel Setup", dependencies: [3, 4] },
      { title: "Launch Campaign", dependencies: [5] },
      { title: "Monitor & Optimize", dependencies: [6] },
      { title: "Report & Analysis", dependencies: [7] },
    ],
  },
  {
    name: "Event Planning",
    description: "Organize a professional event from scratch",
    nodes: [
      { title: "Define Event Goals", dependencies: [] },
      { title: "Budget Planning", dependencies: [0] },
      { title: "Venue Selection", dependencies: [1] },
      { title: "Speaker/Entertainment Booking", dependencies: [1] },
      { title: "Marketing & Invitations", dependencies: [2, 3] },
      { title: "Catering & Logistics", dependencies: [2] },
      { title: "Technical Setup", dependencies: [2] },
      { title: "Rehearsal & Final Check", dependencies: [4, 5, 6] },
      { title: "Event Day Execution", dependencies: [7] },
      { title: "Post-Event Follow-up", dependencies: [8] },
    ],
  },
  {
    name: "Product Launch",
    description: "Launch a new product to market",
    nodes: [
      { title: "Product Finalization", dependencies: [] },
      { title: "Pricing Strategy", dependencies: [0] },
      { title: "Marketing Materials", dependencies: [0] },
      { title: "Sales Training", dependencies: [1, 2] },
      { title: "Press & Media Outreach", dependencies: [2] },
      { title: "Landing Page & Website", dependencies: [2] },
      { title: "Beta Testing", dependencies: [0] },
      { title: "Launch Day", dependencies: [3, 4, 5, 6] },
      { title: "Customer Support Setup", dependencies: [7] },
    ],
  },
  {
    name: "Mobile App",
    description: "Mobile application development lifecycle",
    nodes: [
      { title: "App Concept & Requirements", dependencies: [] },
      { title: "Wireframing", dependencies: [0] },
      { title: "UI Design (Screens)", dependencies: [1] },
      { title: "Architecture & Tech Stack", dependencies: [0] },
      { title: "Core Features Development", dependencies: [2, 3] },
      { title: "API Integration", dependencies: [4] },
      { title: "Testing & QA", dependencies: [5] },
      { title: "App Store Submission", dependencies: [6] },
      { title: "Launch & Marketing", dependencies: [7] },
    ],
  },
  {
    name: "Research Paper",
    description: "Academic research paper workflow",
    nodes: [
      { title: "Topic Selection & Research Question", dependencies: [] },
      { title: "Literature Review", dependencies: [0] },
      { title: "Methodology Design", dependencies: [1] },
      { title: "Data Collection", dependencies: [2] },
      { title: "Data Analysis", dependencies: [3] },
      { title: "Write Results", dependencies: [4] },
      { title: "Write Discussion", dependencies: [5] },
      { title: "Introduction & Abstract", dependencies: [6] },
      { title: "Review & Revision", dependencies: [7] },
      { title: "Submission", dependencies: [8] },
    ],
  },
  {
    name: "Design Project",
    description: "Creative design project workflow",
    nodes: [
      { title: "Creative Brief", dependencies: [] },
      { title: "Mood Board & Inspiration", dependencies: [0] },
      { title: "Concept Sketches", dependencies: [1] },
      { title: "Client Feedback Round 1", dependencies: [2] },
      { title: "Refined Designs", dependencies: [3] },
      { title: "Client Feedback Round 2", dependencies: [4] },
      { title: "Final Polishing", dependencies: [5] },
      { title: "Asset Export & Delivery", dependencies: [6] },
    ],
  },
];
