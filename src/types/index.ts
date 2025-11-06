export interface LinkItem {
  id: string;
  url: string;
  name: string;
  description?: string;
  tags: string[];
  favicon: string;
  clickCount: number;
  createdAt: string;
  updatedAt: string;
  isPinned: boolean;
}

export type SortOption = 'createdAt' | 'name' | 'clickCount';
export type SortOrder = 'asc' | 'desc';