import { useLinks } from '../contexts/linksContext';
import { motion } from 'framer-motion';

export const TagFilter = () => {
  const { getAllTags, selectedTags, toggleTagFilter } = useLinks();
  const allTags = getAllTags();

  if (allTags.length === 0) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 mb-6">
      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">标签筛选</h3>
      <div className="flex flex-wrap gap-2">
        {allTags.map((tag) => {
          const isSelected = selectedTags.includes(tag);
          return (
            <motion.button
              key={tag}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => toggleTagFilter(tag)}
              className={`px-3 py-1 rounded-full text-sm transition ${
                isSelected
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {tag}
              {isSelected && (
                <span className="ml-1">
                  <i className="fa-solid fa-times text-xs"></i>
                </span>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};