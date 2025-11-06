import { useState, useEffect } from 'react';
import { LinkItem } from '../types';
import { useLinks } from '../contexts/linksContext';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

interface LinkFormProps {
  isOpen: boolean;
  onClose: () => void;
  editLink?: LinkItem | null;
}

export const LinkForm = ({ isOpen, onClose, editLink }: LinkFormProps) => {
  const { addLink, updateLink } = useLinks();
  const [url, setUrl] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [favicon, setFavicon] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (editLink) {
        setUrl(editLink.url);
        setName(editLink.name);
        setDescription(editLink.description || '');
        setTags(editLink.tags.join(','));
        setFavicon(editLink.favicon);
        setIsPinned(editLink.isPinned);
      } else {
        resetForm();
      }
    }
  }, [isOpen, editLink]);

  const resetForm = () => {
    setUrl('');
    setName('');
    setDescription('');
    setTags('');
    setFavicon('');
    setIsPinned(false);
  };

  const extractFavicon = (url: string) => {
    try {
      const urlObj = new URL(url);
      return `${urlObj.protocol}//${urlObj.hostname}/favicon.ico`;
    } catch {
      return '';
    }
  };

  const extractDomainName = (url: string) => {
    try {
      const urlObj = new URL(url);
      let domain = urlObj.hostname;
      if (domain.startsWith('www.')) {
        domain = domain.slice(4);
      }
      return domain.charAt(0).toUpperCase() + domain.slice(1);
    } catch {
      return '';
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value;
    setUrl(newUrl);
    
    // 自动提取域名作为名称（如果名称为空）
    if (!name && newUrl) {
      try {
        const domainName = extractDomainName(newUrl);
        if (domainName) {
          setName(domainName);
        }
      } catch {
        // Ignore errors
      }
    }
    
    // 自动提取favicon
    if (newUrl) {
      setFavicon(extractFavicon(newUrl));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 验证表单
    if (!url) {
      toast.error('请输入网址');
      return;
    }
    
    if (!name) {
      toast.error('请输入网站名称');
      return;
    }
    
    // 处理标签
    const tagsArray = tags
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);
    
    // 确保URL格式正确
    let formattedUrl = url;
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = `https://${formattedUrl}`;
    }
    
    setIsLoading(true);
    
    try {
      // 验证URL是否有效
      await fetch(formattedUrl, { method: 'HEAD', mode: 'no-cors' });
      
      if (editLink) {
        updateLink(editLink.id, {
          url: formattedUrl,
          name,
          description,
          tags: tagsArray,
          favicon,
          isPinned,
        });
      } else {
        addLink({
          url: formattedUrl,
          name,
          description,
          tags: tagsArray,
          favicon,
          isPinned,
        });
      }
      
      resetForm();
      onClose();
    } catch (error) {
      console.error('提交表单失败:', error);
      toast.error('提交失败，请检查网址是否正确');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {editLink ? '编辑链接' : '添加新链接'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
              aria-label="关闭"
            >
              <i className="fa-solid fa-times"></i>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                网址 <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                value={url}
                onChange={handleUrlChange}
                placeholder="https://example.com"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                网站名称 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="输入网站名称"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                描述
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="输入网站描述（可选）"
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                标签
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="输入标签，用逗号分隔"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                例如：工具,开发,设计
              </p>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isPinned"
                checked={isPinned}
                onChange={(e) => setIsPinned(e.target.checked)}
                className="h-4 w-4 text-blue-600 dark:text-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 border-gray-300 dark:border-gray-600 rounded"
              />
              <label htmlFor="isPinned" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                置顶显示
              </label>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition"
              >
                取消
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <i className="fa-solid fa-circle-notch fa-spin mr-1"></i> 保存中...
                  </>
                ) : (
                  '保存'
                )}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
};