import { motion } from 'framer-motion';
import { LinkItem } from '../types';
import { useLinks } from '../contexts/linksContext';
import { toast } from 'sonner';

interface LinkCardProps {
  link: LinkItem;
  onEdit: (link: LinkItem) => void;
}

export const LinkCard = ({ link, onEdit }: LinkCardProps) => {
  const { deleteLink, incrementClickCount, togglePin } = useLinks();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    incrementClickCount(link.id);
    window.open(link.url, '_blank', 'noopener,noreferrer');
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(link);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`确定要删除 "${link.name}" 吗？`)) {
      deleteLink(link.id);
    }
  };

  const handlePin = (e: React.MouseEvent) => {
    e.stopPropagation();
    togglePin(link.id);
  };

  const getDomain = (url: string) => {
    try {
      const domain = new URL(url).hostname;
      return domain.startsWith('www.') ? domain.slice(4) : domain;
    } catch {
      return url;
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 border border-gray-100 dark:border-gray-700 flex flex-col`}
    >
      <div className="p-5">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            {link.favicon && (
              <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                <img
                  src={link.favicon}
                  alt={`${link.name} favicon`}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '';
                    target.alt = getInitials(link.name);
                  }}
                />
                <span className="hidden">{getInitials(link.name)}</span>
              </div>
            )}
            {!link.favicon && (
              <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                <span className="font-bold text-blue-600 dark:text-blue-400">
                  {getInitials(link.name)}
                </span>
              </div>
            )}
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                {link.name}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm truncate max-w-[200px]">
                {getDomain(link.url)}
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            {link.isPinned && (
              <button
                onClick={handlePin}
                className="text-yellow-500 hover:text-yellow-600 dark:text-yellow-400 dark:hover:text-yellow-300"
                aria-label="取消置顶"
              >
                <i className="fa-solid fa-thumbtack"></i>
              </button>
            )}
            {!link.isPinned && (
              <button
                onClick={handlePin}
                className="text-gray-400 hover:text-yellow-500 dark:text-gray-500 dark:hover:text-yellow-400"
                aria-label="置顶"
              >
                <i className="fa-regular fa-thumbtack"></i>
              </button>
            )}
          </div>
        </div>

        {link.description && (
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
            {link.description}
          </p>
        )}

        <div className="flex flex-wrap gap-2 mb-3">
          {link.tags.map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 mt-auto">
          <span>点击 {link.clickCount} 次</span>
          <span>{formatDate(link.updatedAt)}</span>
        </div>
      </div>

      <div className="px-5 py-3 bg-gray-50 dark:bg-gray-750 flex justify-between border-t border-gray-100 dark:border-gray-700">
        <button
          onClick={handleClick}
          className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium flex items-center gap-1"
        >
          <i className="fa-solid fa-external-link-alt mr-1"></i>
          访问
        </button>
        <div className="flex gap-3">
          <button
            onClick={handleEdit}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            aria-label="编辑"
          >
            <i className="fa-solid fa-pen-to-square"></i>
          </button>
          <button
            onClick={handleDelete}
            className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300"
            aria-label="删除"
          >
            <i className="fa-solid fa-trash"></i>
          </button>
        </div>
      </div>
    </motion.div>
  );
};