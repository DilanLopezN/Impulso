import { Injectable } from '@nestjs/common';

import type { AuthenticatedRequestUser } from '../auth/auth.types';
import { ListRankingsQuery } from './dto/list-rankings.query';

export interface RankingEntryView {
  position: number;
  userId: string;
  displayName: string;
  avatarUrl?: string | null;
  totalXp: number;
  checkinsCount: number;
  lastActivityAt: string;
}

export interface RankingListView {
  period: string;
  scope: string;
  generatedAt: string;
  tieBreakers: string[];
  items: RankingEntryView[];
}

@Injectable()
export class RankingsBridgeService {
  async list(user: AuthenticatedRequestUser, query: ListRankingsQuery): Promise<RankingListView> {
    const baseUrl = (process.env.GO_WORKERS_BASE_URL ?? '').trim();
    if (!baseUrl) {
      throw new Error('GO_WORKERS_BASE_URL is not configured');
    }

    const params = new URLSearchParams({
      period: query.period,
      scope: query.scope,
      limit: String(query.limit ?? 50),
      offset: String(query.offset ?? 0),
    });

    if (query.scope === 'friends') {
      params.set('viewerId', user.userId);
    }
    if (query.scope === 'team' && query.teamId) {
      params.set('teamId', query.teamId);
    }

    const response = await fetch(`${baseUrl.replace(/\/$/, '')}/rankings?${params.toString()}`);
    if (!response.ok) {
      throw new Error(`workers rankings request failed (${response.status})`);
    }

    return (await response.json()) as RankingListView;
  }

  async refreshSnapshots(): Promise<void> {
    const baseUrl = (process.env.GO_WORKERS_BASE_URL ?? '').trim();
    if (!baseUrl) return;

    const token = (process.env.GO_WORKERS_TOKEN ?? '').trim();
    const headers: Record<string, string> = {};
    if (token.length > 0) {
      headers['X-Worker-Token'] = token;
    }

    const response = await fetch(`${baseUrl.replace(/\/$/, '')}/internal/rankings/snapshot`, {
      method: 'POST',
      headers,
    });
    if (!response.ok) {
      const body = await response.text();
      throw new Error(`workers snapshot endpoint failed (${response.status}): ${body}`);
    }
  }
}
