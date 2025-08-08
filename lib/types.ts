export interface User {
  id: string;
  name: string | null;
  email: string;
  skills: string[];
  githubUrl?: string | null;
}

export interface Member {
  user: User;
}

export interface Tag {
  id: string;
  name: string;
}

export interface BaseProject {
  id: string;
  title: string;
  description: string;
  teamSize: number;
  createdAt: string;
  requests: { userId: string; status: RequestStatus }[]; 
  hasSentRequest?: boolean;
  isAlreadyMember?: boolean;
  requestStatus?: RequestStatus;
}

export interface ProjectDetails extends BaseProject {
  city: string | null;
  owner: User;
  members: Member[];
  technologies: Tag[];
  categories: Tag[];
  industries: Tag[];
}

export interface ProjectSummary extends BaseProject {
  owner: {
    id: string;
    name: string | null;
  };
  technologies: Array<{
    technology: { id: string; name: string };
  }>;
  categories: Array<{
    category: { id: string; name: string };
  }>;
  members: Array<{
    userId: string;
  }>;
  _count: {
    members: number | null;
  };
}

export interface JoinRequest {
    id: string;
    message: string | null;
    user: User;
}

export enum RequestStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  WITHDRAWN = "WITHDRAWN"
}