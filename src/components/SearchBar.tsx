import { useLinks } from '../contexts/linksContext';
import { SortOption } from '../types';

export const SearchBar = () => {
  const {
    searchQuery,
    setSearchQuery,
    sortOption,
    setSortOption,
    toggleSortOrder,
    sortOrder,
  } = useLinks();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 mb-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <i className="fa-solid fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索链接名称、描述、网址或标签..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
          />
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as SortOption)}
              className="appearance-none bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-2 pl-3 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            >
              <option value="createdAt">创建时间</option>
              <option value="name">名称</option>
              <option value="clickCount">点击次数</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
              <i className="fa-solid fa-chevron-down text-xs"></i>
            </div>
          </div>
          <button
            onClick={toggleSortOrder}
            className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition flex items-center justify-center"
            aria-label={sortOrder === 'asc' ? '降序排列' : '升序排列'}
          >
            {sortOrder === 'asc' ? (
              <i className="fa-solid fa-sort-amount-up-alt"></i>
            ) : (
              <i className="fa-solid fa-sort-amount-down-alt"></i>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};