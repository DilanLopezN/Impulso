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

export interface UserDataExport {
  schemaVersion: 1;
  generatedAt: string;
  user: PublicUser;
  sessions: UserDataExportSession[];
}
