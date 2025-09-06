// src/components/admin/CategoryManager.tsx
'use client';

import { useState, useEffect, FormEvent } from 'react';
import toast from 'react-hot-toast';
import { Category } from '@prisma/client';
import { PencilIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';

type CategoryWithCount = Category & {
  _count: { projects: number; };
};

export default function CategoryManager() {
  const [categories, setCategories] = useState<CategoryWithCount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryWithCount | null>(null);
  const [editingName, setEditingName] = useState('');

  // Fonksiyonlar (fetch, add, delete, update) aynı kalabilir, sadece JSX'i güncelleyeceğiz.
  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/admin/categories');
        if (!response.ok) throw new Error('Kategoriler yüklenemedi. Bu sayfayı görmek için yönetici olmalısınız.');
        const data: CategoryWithCount[] = await response.json();
        setCategories(data);
      } catch (error) { toast.error((error as Error).message);
      } finally { setIsLoading(false); }
    };
    fetchCategories();
  }, []);

  const handleAddCategory = async (e: FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCategoryName }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Kategori eklenemedi.');
      toast.success(`"${data.name}" kategorisi başarıyla eklendi.`);
      setNewCategoryName('');
      setCategories(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
    } catch (error) { toast.error((error as Error).message);
    } finally { setIsSubmitting(false); }
  };
  
  const handleUpdateCategory = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingCategory || !editingName.trim() || editingName === editingCategory.name) {
      setEditingCategory(null); return;
    }
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/admin/categories/${editingCategory.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editingName }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Kategori güncellenemedi.');
      toast.success(`Kategori güncellendi.`);
      setEditingCategory(null);
      setCategories(prev => prev.map(c => c.id === data.id ? data : c));
    } catch (error) { toast.error((error as Error).message);
    } finally { setIsSubmitting(false); }
  };
  
  const handleDeleteCategory = async (id: number, name: string) => {
    if (!confirm(`'${name}' kategorisini silmek istediğinizden emin misiniz?`)) return;
    try {
      const response = await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' });
      if (response.status !== 204) {
        const data = await response.json();
        throw new Error(data.message || 'Kategori silinemedi.');
      }
      toast.success(`'${name}' kategorisi silindi.`);
      setCategories(prev => prev.filter(c => c.id !== id));
    } catch (error) { toast.error((error as Error).message); }
  };

  const startEditing = (category: CategoryWithCount) => {
    setEditingCategory(category);
    setEditingName(category.name);
  };

  return (
    <div className="p-6 space-y-8">
      {/* Yeni Kategori Ekleme Formu */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Yeni Kategori Ekle</h3>
        <form onSubmit={handleAddCategory} className="flex flex-col sm:flex-row items-end gap-4">
          <div className="flex-grow w-full">
            <label htmlFor="newCategoryName" className="sr-only">Kategori Adı</label>
            <input
              id="newCategoryName" type="text" value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="Yeni kategori adı..."
              className="w-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md py-2 px-3 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              disabled={isSubmitting}
            />
          </div>
          <button type="submit" disabled={isSubmitting || !newCategoryName.trim()}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md transition-colors disabled:opacity-50">
            <PlusIcon className="w-5 h-5" />
            {isSubmitting ? 'Ekleniyor...' : 'Ekle'}
          </button>
        </form>
      </div>

      {/* Mevcut Kategoriler Listesi */}
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50 dark:bg-gray-800/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Kategori Adı</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Proje Sayısı</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Eylemler</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
            {isLoading ? (
              <tr><td colSpan={3} className="text-center py-16 text-gray-500">Yükleniyor...</td></tr>
            ) : categories.map((cat) => (
              <tr key={cat.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/60">
                <td className="px-6 py-4 whitespace-nowrap">
                  {editingCategory?.id === cat.id ? (
                    <form onSubmit={handleUpdateCategory} className="flex gap-2">
                      <input type="text" value={editingName} onChange={(e) => setEditingName(e.target.value)}
                        className="bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md py-1 px-2 text-gray-800 dark:text-gray-100 w-full"
                        autoFocus onBlur={() => setEditingCategory(null)}
                      />
                    </form>
                  ) : (
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{cat.name}</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{cat._count.projects}</td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <div className="flex items-center justify-center gap-4">
                    <button onClick={() => startEditing(cat)} title="Düzenle" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"><PencilIcon className="w-5 h-5" /></button>
                    <button onClick={() => handleDeleteCategory(cat.id, cat.name)} title="Sil"
                      disabled={cat._count.projects > 0}
                      className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 disabled:text-gray-400 dark:disabled:text-gray-600 disabled:cursor-not-allowed">
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}