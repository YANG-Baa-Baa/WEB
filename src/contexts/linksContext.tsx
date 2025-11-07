import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { LinkItem, SortOption, SortOrder } from '../types';
import { toast } from 'sonner';

interface LinksContextType {
  links: LinkItem[];
  filteredLinks: LinkItem[];
  searchQuery: string;
  selectedTags: string[];
  sortOption: SortOption;
  sortOrder: SortOrder;
  addLink: (link: Omit<LinkItem, 'id' | 'createdAt' | 'updatedAt' | 'clickCount'>) => Promise<void> | void;
  updateLink: (id: string, link: Partial<LinkItem>) => Promise<void> | void;
  deleteLink: (id: string) => Promise<void> | void;
  setSearchQuery: (query: string) => void;
  toggleTagFilter: (tag: string) => void;
  setSortOption: (option: SortOption) => void;
  toggleSortOrder: () => void;
  incrementClickCount: (id: string) => Promise<void> | void;
  togglePin: (id: string) => Promise<void> | void;
  importLinks: (jsonData: string) => Promise<void> | void;
  exportLinks: () => string;
  clearAllLinks: () => Promise<void> | void;
  getAllTags: () => string[];
}

const LinksContext = createContext<LinksContextType | undefined>(undefined);

interface LinksProviderProps {
  children: ReactNode;
}

/** ====== 云端 API（Cloudflare Tunnel） ====== */
const API = 'https://api.knive.online'; // 你的固定公网 HTTPS API
const h = (method: string, body?: any) => ({
  method,
  headers: { 'Content-Type': 'application/json' },
  ...(body ? { body: JSON.stringify(body) } : {}),
});

const normalize = (row: any): LinkItem => ({
  id: String(row.id),
  url: row.url,
  name: row.name,
  description: row.description || '',
  tags: Array.isArray(row.tags) ? row.tags : JSON.parse(row.tags || '[]'),
  favicon: row.favicon || '',
  clickCount: row.clickCount ?? 0,
  isPinned: !!row.isPinned,
  createdAt: row.createdAt || new Date().toISOString(),
  updatedAt: row.updatedAt || new Date().toISOString(),
});

export const LinksProvider = ({ children }: LinksProviderProps) => {
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortOption, setSortOption] = useState<SortOption>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  /** 初始化：从云端拉取（失败时回退 localStorage，方便离线） */
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API}/links`);
        const data = await res.json();
        const list = (Array.isArray(data) ? data : []).map(normalize);
        setLinks(list);
        localStorage.setItem('websiteLinks', JSON.stringify(list));
      } catch (e) {
        console.error('Fetch links failed, fallback to cache:', e);
        const saved = localStorage.getItem('websiteLinks');
        if (saved) {
          try { setLinks(JSON.parse(saved)); } catch {}
        }
      }
    })();
  }, []);

  /** 同步离线缓存（可选） */
  useEffect(() => {
    localStorage.setItem('websiteLinks', JSON.stringify(links));
  }, [links]);

  /** 过滤+排序（前端内存） */
  const filteredLinks = links
    .filter(link => {
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        q === '' ||
        link.name.toLowerCase().includes(q) ||
        (link.description || '').toLowerCase().includes(q) ||
        link.url.toLowerCase().includes(q) ||
        link.tags.some(tag => tag.toLowerCase().includes(q));

      const matchesTags = selectedTags.length === 0 ||
        selectedTags.every(tag => link.tags.includes(tag));

      return matchesSearch && matchesTags;
    })
    .sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      let cmp = 0;
      switch (sortOption) {
        case 'createdAt': cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(); break;
        case 'name': cmp = a.name.localeCompare(b.name); break;
        case 'clickCount': cmp = a.clickCount - b.clickCount; break;
      }
      return sortOrder === 'asc' ? cmp : -cmp;
    });

  /** 新增（云端） */
  const addLink: LinksContextType['addLink'] = async (linkData) => {
    try {
      const resp = await fetch(`${API}/links`, h('POST', linkData));
      if (!resp.ok) throw new Error(await resp.text());
      const res2 = await fetch(`${API}/links`);
      setLinks((await res2.json()).map(normalize));
      toast.success('链接添加成功');
    } catch (e) { console.error(e); toast.error('添加失败'); }
  };

  /** 更新（云端） */
  const updateLink: LinksContextType['updateLink'] = async (id, patch) => {
    try {
      const resp = await fetch(`${API}/links/${id}`, h('PATCH', patch));
      if (!resp.ok) throw new Error(await resp.text());
      const res2 = await fetch(`${API}/links`);
      setLinks((await res2.json()).map(normalize));
      toast.success('链接更新成功');
    } catch (e) { console.error(e); toast.error('更新失败'); }
  };

  /** 删除（云端） */
  const deleteLink: LinksContextType['deleteLink'] = async (id) => {
    try {
      const resp = await fetch(`${API}/links/${id}`, h('DELETE'));
      if (!resp.ok) throw new Error(await resp.text());
      setLinks(prev => prev.filter(l => l.id !== id));
      toast.success('链接删除成功');
    } catch (e) { console.error(e); toast.error('删除失败'); }
  };

  /** 标签筛选（前端状态） */
  const toggleTagFilter = (tag: string) => {
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  /** 排序顺序切换 */
  const toggleSortOrder = () => setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));

  /** 点击 +1（前端先更新、后台异步上报） */
  const incrementClickCount: LinksContextType['incrementClickCount'] = async (id) => {
    setLinks(prev => prev.map(link => (link.id === id ? { ...link, clickCount: link.clickCount + 1 } : link)));
    fetch(`${API}/links/${id}/click`, h('POST')).catch(() => {});
  };

  /** 置顶切换（云端） */
  const togglePin: LinksContextType['togglePin'] = async (id) => {
    const link = links.find(l => l.id === id);
    if (!link) return;
    try {
      const resp = await fetch(`${API}/links/${id}`, h('PATCH', { isPinned: !link.isPinned }));
      if (!resp.ok) throw new Error(await resp.text());
      const res2 = await fetch(`${API}/links`);
      setLinks((await res2.json()).map(normalize));
    } catch (e) { console.error(e); toast.error('置顶失败'); }
  };

  /** 导入（批量写入云端） */
  const importLinks: LinksContextType['importLinks'] = async (jsonData) => {
    try {
      const arr = JSON.parse(jsonData);
      if (!Array.isArray(arr)) throw new Error('无效的链接数据格式');
      await Promise.all(
        arr.map((l: any) =>
          fetch(`${API}/links`, h('POST', {
            url: l.url,
            name: l.name,
            description: l.description || '',
            tags: l.tags || [],
            favicon: l.favicon || '',
            isPinned: !!l.isPinned,
          }))
        )
      );
      const res2 = await fetch(`${API}/links`);
      setLinks((await res2.json()).map(normalize));
      toast.success(`成功导入 ${arr.length} 个链接`);
    } catch (e) {
      console.error(e);
      toast.error('导入失败');
    }
  };

  /** 导出（当前列表快照） */
  const exportLinks = (): string => JSON.stringify(links, null, 2);

  /** 清空（仅本地缓存，云端清空如需可加接口） */
  const clearAllLinks: LinksContextType['clearAllLinks'] = async () => {
    if (!confirm('确定要清空所有链接吗？此操作不可恢复。')) return;
    setLinks([]);
    localStorage.removeItem('websiteLinks');
    toast.success('所有链接已清空（仅本地缓存已清除）');
  };

  /** 所有标签 */
  const getAllTags = (): string[] => {
    const tagSet = new Set<string>();
    links.forEach(link => link.tags.forEach(tag => tagSet.add(tag)));
    return Array.from(tagSet).sort();
  };

  return (
    <LinksContext.Provider value={{
      links,
      filteredLinks,
      searchQuery,
      selectedTags,
      sortOption,
      sortOrder,
      addLink,
      updateLink,
      deleteLink,
      setSearchQuery,
      toggleTagFilter,
      setSortOption,
      toggleSortOrder,
      incrementClickCount,
      togglePin,
      importLinks,
      exportLinks,
      clearAllLinks,
      getAllTags,
    }}>
      {children}
    </LinksContext.Provider>
  );
};

export const useLinks = () => {
  const context = useContext(LinksContext);
  if (context === undefined) throw new Error('useLinks must be used within a LinksProvider');
  return context;
};
