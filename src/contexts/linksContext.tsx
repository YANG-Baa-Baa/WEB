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
  addLink: (link: Omit<LinkItem, 'id' | 'createdAt' | 'updatedAt' | 'clickCount'>) => void;
  updateLink: (id: string, link: Partial<LinkItem>) => void;
  deleteLink: (id: string) => void;
  setSearchQuery: (query: string) => void;
  toggleTagFilter: (tag: string) => void;
  setSortOption: (option: SortOption) => void;
  toggleSortOrder: () => void;
  incrementClickCount: (id: string) => void;
  togglePin: (id: string) => void;
  importLinks: (jsonData: string) => void;
  exportLinks: () => string;
  clearAllLinks: () => void;
  getAllTags: () => string[];
}

const LinksContext = createContext<LinksContextType | undefined>(undefined);

interface LinksProviderProps {
  children: ReactNode;
}

export const LinksProvider = ({ children }: LinksProviderProps) => {
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortOption, setSortOption] = useState<SortOption>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // 从 localStorage 加载数据
  useEffect(() => {
    const savedLinks = localStorage.getItem('websiteLinks');
    if (savedLinks) {
      try {
        setLinks(JSON.parse(savedLinks));
      } catch (error) {
        console.error('Failed to parse saved links:', error);
        toast.error('加载保存的链接失败');
      }
    } else {
      // 添加示例数据
      const mockLinks: LinkItem[] = [
        {
          id: '1',
          url: 'https://www.google.com',
          name: 'Google',
          description: '搜索引擎',
          tags: ['搜索引擎', '工具'],
          favicon: 'https://www.google.com/favicon.ico',
          clickCount: 15,
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          updatedAt: new Date(Date.now() - 86400000).toISOString(),
          isPinned: true,
        },
        {
          id: '2',
          url: 'https://github.com',
          name: 'GitHub',
          description: '代码托管平台',
          tags: ['开发', '代码'],
          favicon: 'https://github.com/favicon.ico',
          clickCount: 23,
          createdAt: new Date(Date.now() - 172800000).toISOString(),
          updatedAt: new Date(Date.now() - 172800000).toISOString(),
          isPinned: false,
        },
        {
          id: '3',
          url: 'https://stackoverflow.com',
          name: 'Stack Overflow',
          description: '编程问答社区',
          tags: ['开发', '问答'],
          favicon: 'https://stackoverflow.com/favicon.ico',
          clickCount: 30,
          createdAt: new Date(Date.now() - 259200000).toISOString(),
          updatedAt: new Date(Date.now() - 259200000).toISOString(),
          isPinned: false,
        },
      ];
      setLinks(mockLinks);
      localStorage.setItem('websiteLinks', JSON.stringify(mockLinks));
    }
  }, []);

  // 保存数据到 localStorage
  useEffect(() => {
    if (links.length > 0) {
      localStorage.setItem('websiteLinks', JSON.stringify(links));
    }
  }, [links]);

  // 筛选和排序链接
  const filteredLinks = links
    .filter(link => {
      const matchesSearch = searchQuery === '' || 
        link.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        link.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        link.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
        link.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesTags = selectedTags.length === 0 || 
        selectedTags.every(tag => link.tags.includes(tag));
      
      return matchesSearch && matchesTags;
    })
    .sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      
      let comparison = 0;
      
      switch (sortOption) {
        case 'createdAt':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'clickCount':
          comparison = a.clickCount - b.clickCount;
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  // 添加链接
  const addLink = (linkData: Omit<LinkItem, 'id' | 'createdAt' | 'updatedAt' | 'clickCount'>) => {
    const newLink: LinkItem = {
      ...linkData,
      id: Date.now().toString(),
      clickCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    setLinks(prev => [newLink, ...prev]);
    toast.success('链接添加成功');
  };

  // 更新链接
  const updateLink = (id: string, linkData: Partial<LinkItem>) => {
    setLinks(prev => prev.map(link => 
      link.id === id 
        ? { ...link, ...linkData, updatedAt: new Date().toISOString() }
        : link
    ));
    toast.success('链接更新成功');
  };

  // 删除链接
  const deleteLink = (id: string) => {
    setLinks(prev => prev.filter(link => link.id !== id));
    toast.success('链接删除成功');
  };

  // 切换标签筛选
  const toggleTagFilter = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  // 切换排序顺序
  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  // 增加点击次数
  const incrementClickCount = (id: string) => {
    setLinks(prev => prev.map(link => 
      link.id === id 
        ? { ...link, clickCount: link.clickCount + 1 }
        : link
    ));
  };

  // 切换置顶状态
  const togglePin = (id: string) => {
    setLinks(prev => prev.map(link => 
      link.id === id 
        ? { ...link, isPinned: !link.isPinned }
        : link
    ));
  };

  // 导入链接
  const importLinks = (jsonData: string) => {
    try {
      const importedLinks: LinkItem[] = JSON.parse(jsonData);
      
      // 验证导入的数据格式
      if (!Array.isArray(importedLinks)) {
        throw new Error('无效的链接数据格式');
      }
      
      // 合并链接，避免重复
      const existingIds = new Set(links.map(link => link.id));
      const newLinks = importedLinks.filter(link => !existingIds.has(link.id));
      
      setLinks(prev => [...newLinks, ...prev]);
      toast.success(`成功导入 ${newLinks.length} 个链接`);
    } catch (error) {
      console.error('导入链接失败:', error);
      toast.error('导入链接失败，请检查文件格式');
    }
  };

  // 导出链接
  const exportLinks = (): string => {
    return JSON.stringify(links, null, 2);
  };

  // 清空所有链接
  const clearAllLinks = () => {
    if (confirm('确定要清空所有链接吗？此操作不可恢复。')) {
      setLinks([]);
      localStorage.removeItem('websiteLinks');
      toast.success('所有链接已清空');
    }
  };

  // 获取所有标签
  const getAllTags = (): string[] => {
    const tagSet = new Set<string>();
    links.forEach(link => {
      link.tags.forEach(tag => tagSet.add(tag));
    });
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
  if (context === undefined) {
    throw new Error('useLinks must be used within a LinksProvider');
  }
  return context;
};