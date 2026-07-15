export interface Link {
  _id: string;
  owner?: string;
  username?: string;
  alias: string;
  slug: string;
  originalUrl?: string;
  clicks: number;
  maxClicks?: number;
  remainingClicks?: number;
  expiresAt?: string | null;
  active: boolean;
  visits?: any[];
  createdAt: string;
  updatedAt?: string;
}

export interface DashboardStats {
  totalLinks: number;
  activeLinks: number;
  expiredLinks: number;
  disabledLinks: number;
  clickLimitReached: number;
  totalClicks: number;
  remainingClicks: number;
}
