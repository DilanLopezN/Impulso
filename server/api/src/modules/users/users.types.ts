import type { PublicUser } from '../auth/auth.types';

export interface UserDataExportSession {
  id: string;
  deviceId: string | null;
  deviceName: string | null;
  userAgent: string | null;
  ipAddress: string | null;
  createdAt: string;
  lastSeenAt: string;
  revokedAt: string | null;
}

export interface UserDataExportMilestone {
  id: string;
  title: string;
  date: string | null;
  done: boolean;
  xp: number;
  order: number;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserDataExportGoal {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  type: string;
  icon: string | null;
  color: string | null;
  deadline: string | null;
  targetValue: number | null;
  targetUnit: string | null;
  frequency: string | null;
  progress: number;
  archivedAt: string | null;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  milestones: UserDataExportMilestone[];
}

export interface UserDataExport {
  schemaVersion: 1;
  generatedAt: string;
  user: PublicUser;
  sessions: UserDataExportSession[];
  goals: UserDataExportGoal[];
}
