import { useRef } from 'react';
import { useLinks } from '../contexts/linksContext';
import { toast } from 'sonner';

export const ImportExportTools = () => {
  const { exportLinks, importLinks, clearAllLinks } = useLinks();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    try {
      const jsonData = exportLinks();
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `website-links-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('链接导出成功');
    } catch (error) {
      console.error('导出链接失败:', error);
      toast.error('导出链接失败');
    }
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        importLinks(content);
        // 重置文件输入
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } catch (error) {
        console.error('导入链接失败:', error);
        toast.error('导入链接失败，请检查文件格式');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex gap-3 mt-4">
      <button
        onClick={handleExport}
        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition flex items-center gap-1"
      >
        <i className="fa-solid fa-download"></i>
        导出
      </button>
      <button
        onClick={() => fileInputRef.current?.click()}
        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition flex items-center gap-1"
      >
        <i className="fa-solid fa-upload"></i>
        导入
      </button>
      <input
        type="file"
        accept=".json"
        ref={fileInputRef}
        onChange={handleImport}
        className="hidden"
      />
      <button
        onClick={clearAllLinks}
        className="px-4 py-2 border border-red-300 dark:border-red-700 rounded-lg text-sm font-medium text-red-700 dark:text-red-400 bg-white dark:bg-gray-700 hover:bg-red-50 dark:hover:bg-gray-600 transition flex items-center gap-1 ml-auto"
      >
        <i className="fa-solid fa-trash-can"></i>
        清空全部
      </button>
    </div>
  );
};