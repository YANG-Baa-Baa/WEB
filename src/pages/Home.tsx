import { useState } from 'react';
import { LinkCard } from '../components/LinkCard';
import { LinkForm } from '../components/LinkForm';
import { SearchBar } from '../components/SearchBar';
import { TagFilter } from '../components/TagFilter';
import { ImportExportTools } from '../components/ImportExportTools';
import { useLinks } from '../contexts/linksContext';
import { useTheme } from '../hooks/useTheme';
import { motion } from 'framer-motion';
import { LinkItem } from '../types';
import { Empty } from '../components/Empty';

export default function Home() {
  const { filteredLinks } = useLinks();
  const { toggleTheme, isDark } = useTheme();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editLink, setEditLink] = useState<LinkItem | null>(null);

  const handleAddLink = () => {
    setEditLink(null);
    setIsFormOpen(true);
  };

  const handleEditLink = (link: LinkItem) => {
    setEditLink(link);
    setIsFormOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <header className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <motion.h1
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400"
              >
                网站工具共享平台
              </motion.h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                集中管理和快速访问您常用的网站链接
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                aria-label={isDark ? '切换到亮色模式' : '切换到暗色模式'}
              >
                {isDark ? (
                  <i className="fa-solid fa-sun"></i>
                ) : (
                  <i className="fa-solid fa-moon"></i>
                )}
              </button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleAddLink}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition flex items-center gap-2"
              >
                <i className="fa-solid fa-plus"></i>
                添加链接
              </motion.button>
            </div>
          </div>
        </header>

        {/* Search and Filters */}
        <SearchBar />
        <TagFilter />

        {/* Links Grid */}
        <div className="mb-8">
          {filteredLinks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredLinks.map((link) => (
                <LinkCard key={link.id} link={link} onEdit={handleEditLink} />
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-8 text-center"
            >
              <Empty />
              <p className="text-gray-500 dark:text-gray-400 mt-2">
                {filteredLinks.length === 0 ? '没有找到匹配的链接' : '还没有添加任何链接'}
              </p>
              {filteredLinks.length === 0 && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleAddLink}
                  className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm hover:shadow transition"
                >
                  添加第一个链接
                </motion.button>
              )}</motion.div>
          )}
        </div>

        {/* Import/Export Tools */}
        <ImportExportTools />
      </div>

      {/* Link Form Modal */}
      <LinkForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        editLink={editLink}
      />
    </div>
  );
}