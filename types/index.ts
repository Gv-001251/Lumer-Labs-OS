export type ClientStatus = "Lead" | "Onboarding" | "Active" | "Paused" | "Closed";

export interface Client {
  id: string;
  name: string;
  industry: string;
  contactPerson: string;
  email: string;
  phone: string;
  services: string[];
  monthlyPackage: number; // in INR
  amountDue: number; // in INR
  lastPaymentDate: string;
  nextBillingDate: string;
  accountStatus: ClientStatus;
  avatarUrl?: string;
  notes?: string;
  createdAt: string;
}

export type ProjectStatus = "Planned" | "In Progress" | "Awaiting Approval" | "Delivered" | "Completed";

export interface ShootDetails {
  shootDate: string;
  timeSlot: string;
  location: string;
  equipment: string[];
  crewMembers: string[];
  shootCost: number;
  editingCost: number;
  deliveryStatus: "Scheduled" | "Filming" | "Editing" | "Review" | "Delivered";
}

export interface Project {
  id: string;
  clientId: string;
  clientName: string;
  title: string;
  serviceType: "Website Development" | "Social Media Management" | "Video Shoot" | "Branding" | "Editing";
  startDate: string;
  dueDate: string;
  budget: number;
  actualCost: number;
  assignedTeamIds: string[];
  status: ProjectStatus;
  progress: number; // 0 - 100
  shootDetails?: ShootDetails;
}

export type TransactionType = "Income" | "Expense";

export type IncomeCategory =
  | "Monthly Subscription"
  | "Website Development"
  | "Social Media Management"
  | "Video Shoot"
  | "Editing"
  | "Other Income";

export type ExpenseCategory =
  | "Team Wages"
  | "Equipment"
  | "Travel"
  | "Advertising"
  | "Software"
  | "External Payments"
  | "Other Expenses";

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: IncomeCategory | ExpenseCategory;
  date: string;
  clientId?: string;
  clientName?: string;
  projectId?: string;
  description: string;
  paymentMethod: "Bank Transfer" | "UPI" | "Credit Card" | "Cash" | "Check";
  status: "Completed" | "Pending" | "Failed";
  receiptUrl?: string;
  referenceNo?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: "Director" | "Cinematographer" | "Video Editor" | "Full Stack Dev" | "Social Media Strategist" | "Freelancer";
  email: string;
  phone: string;
  monthlySalary: number;
  shootRate: number; // rate per shoot
  editingRate: number; // rate per project
  activeProjectsCount: number;
  status: "Active" | "On Leave" | "Contractor";
  avatarUrl?: string;
  bankDetails?: {
    accountNo: string;
    ifsc: string;
    upiId: string;
  };
}

export interface WagePayment {
  id: string;
  teamMemberId: string;
  teamMemberName: string;
  amount: number;
  period: string; // e.g. "September 2026"
  type: "Monthly Salary" | "Shoot Payout" | "Editing Bonus" | "Freelance Payment";
  paymentDate: string;
  status: "Paid" | "Pending" | "Scheduled";
  notes?: string;
}

export interface PostPerformance {
  id: string;
  thumbnailUrl: string;
  title: string;
  type: "Reel" | "Carousel" | "Static Post";
  publishDate: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  reach: number;
}

export interface SocialAccount {
  id: string;
  clientId: string;
  clientName: string;
  handle: string;
  platform: "Instagram" | "LinkedIn" | "YouTube";
  followers: number;
  followerGrowth: number; // e.g. +14.2%
  reach: number;
  impressions: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  engagementRate: number; // percentage e.g. 4.8
  history: { month: string; followers: number; reach: number; engagement: number }[];
  topPosts: PostPerformance[];
}

export type AIInboxStatus = "Pending Verification" | "Approved" | "Rejected" | "Needs Edit";

export interface AIInboxItem {
  id: string;
  source: "WhatsApp" | "Email Upload" | "Manual Receipt";
  senderName: string;
  senderPhone?: string;
  rawText?: string;
  screenshotUrl?: string;
  receivedAt: string;
  extractedData: {
    clientName: string;
    matchedClientId?: string;
    amount: number;
    transactionType: TransactionType;
    category: IncomeCategory | ExpenseCategory;
    paymentMethod: "UPI" | "Bank Transfer" | "Cash";
    referenceNumber?: string;
    date: string;
    notes: string;
  };
  confidenceScore: number; // percentage e.g. 94
  isPotentialDuplicate: boolean;
  status: AIInboxStatus;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: "payment" | "project" | "ai" | "shoot";
  read: boolean;
  link?: string;
}

export type DateRangePeriod = "This Month" | "Last Month" | "Q3 2026" | "YTD 2026" | "All Time";
