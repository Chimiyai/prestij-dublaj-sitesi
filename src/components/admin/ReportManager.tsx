// src/components/admin/ReportManager.tsx (YENİ TASARIMA UYGUN GÜNCELLENMİŞ HALİ)
'use client';

import { Dialog, Transition } from '@headlessui/react';
import { useState, useEffect, Fragment } from 'react';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { formatDistanceToNowStrict } from 'date-fns';
import { tr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { EyeIcon, CheckCircleIcon, ArchiveBoxXMarkIcon } from '@heroicons/react/24/outline';
import { formatReportStatus } from '@/lib/utils';

// Tip tanımı aynı kalabilir
type ReportWithUsers = {
  id: number;
  reason: string;
  description: string | null;
  status: string;
  createdAt: string;
  reporter: { id: number; username: string; };
  reported: { id: number; username: string; };
};

export default function ReportManager() {
  // State tanımlamaları ve fonksiyonlar (fetch, handleUpdate, handleDelete) aynı kalabilir.
  // Sadece JSX (render) kısmını güncelleyeceğiz.
  const [reports, setReports] = useState<ReportWithUsers[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'pending' | 'reviewed' | 'resolved' | 'all'>('pending');
  const [isProcessing, setIsProcessing] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<ReportWithUsers | null>(null);

  const openReportModal = (report: ReportWithUsers) => {
    setSelectedReport(report);
    setIsModalOpen(true);
  };
  const closeReportModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedReport(null), 300); 
  };

  useEffect(() => {
    const fetchReports = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/admin/reports');
        if (!response.ok) throw new Error('Raporlar yüklenemedi.');
        const data: ReportWithUsers[] = await response.json();
        setReports(data);
      } catch (error) {
        toast.error((error as Error).message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchReports();
  }, []);

  const handleUpdateStatus = async (reportId: number, newStatus: 'pending' | 'reviewed' | 'resolved') => {
    // Bu fonksiyonun içeriği doğru ve aynı kalabilir.
    setIsProcessing(reportId);
    try {
      const response = await fetch(`/api/admin/reports/${reportId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!response.ok) throw new Error('Durum güncellenemedi.');
      toast.success('Rapor durumu güncellendi.');
      setReports(prev => prev.map(r => r.id === reportId ? { ...r, status: newStatus } : r));
      if (selectedReport && selectedReport.id === reportId) {
        setSelectedReport(prev => prev ? { ...prev, status: newStatus } : null);
      }
    } catch (error) { toast.error((error as Error).message); } 
    finally { setIsProcessing(null); }
  };

  const handleDeleteReport = async (reportId: number) => {
    // Bu fonksiyonun içeriği doğru ve aynı kalabilir.
    if (!confirm('Bu raporu kalıcı olarak silmek istediğinizden emin misiniz?')) return;
    setIsProcessing(reportId);
    try {
      const response = await fetch(`/api/admin/reports/${reportId}`, { method: 'DELETE' });
      if (response.status !== 204) throw new Error('Rapor silinemedi.');
      toast.success('Rapor başarıyla silindi.');
      setReports(prev => prev.filter(r => r.id !== reportId));
      closeReportModal();
    } catch (error) { toast.error((error as Error).message); }
    finally { setIsProcessing(null); }
  };

  const filteredReports = reports.filter(report => filter === 'all' || report.status === filter);

  return (
    <div className="p-6">
      {/* Filtre Butonları (Yeni Stiller) */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <button onClick={() => setFilter('pending')} className={cn("px-4 py-1.5 text-sm font-medium rounded-md transition-colors", filter === 'pending' ? 'bg-yellow-500 text-white shadow-sm' : 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700')}>
          Bekleyen
        </button>
        <button onClick={() => setFilter('reviewed')} className={cn("px-4 py-1.5 text-sm font-medium rounded-md transition-colors", filter === 'reviewed' ? 'bg-blue-500 text-white shadow-sm' : 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700')}>
          İncelenen
        </button>
        <button onClick={() => setFilter('resolved')} className={cn("px-4 py-1.5 text-sm font-medium rounded-md transition-colors", filter === 'resolved' ? 'bg-green-600 text-white shadow-sm' : 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700')}>
          Çözülen
        </button>
        <button onClick={() => setFilter('all')} className={cn("px-4 py-1.5 text-sm font-medium rounded-md transition-colors", filter === 'all' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700')}>
          Tümü
        </button>
      </div>

      {/* Raporlar Tablosu */}
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50 dark:bg-gray-800/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Raporlanan</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Raporlayan</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Sebep</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Tarih</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Durum</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Eylem</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
            {isLoading ? (
              <tr><td colSpan={6} className="text-center py-16 text-gray-500">Yükleniyor...</td></tr>
            ) : filteredReports.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-16 text-gray-500">Bu filtrede gösterilecek rapor bulunamadı.</td></tr>
            ) : filteredReports.map((report) => (
              <tr key={report.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/60">
                <td className="px-6 py-4 whitespace-nowrap"><Link href={`/profil/${report.reported.username}`} className="text-sm font-medium text-red-600 dark:text-red-400 hover:underline">{report.reported.username}</Link></td>
                <td className="px-6 py-4 whitespace-nowrap"><Link href={`/profil/${report.reporter.username}`} className="text-sm text-gray-600 dark:text-gray-300 hover:underline">{report.reporter.username}</Link></td>
                <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-200 max-w-xs truncate">{report.reason}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{formatDistanceToNowStrict(new Date(report.createdAt), { locale: tr, addSuffix: true })}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm"><span className={cn('px-2.5 py-0.5 inline-flex text-xs font-semibold rounded-full', { 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200': report.status === 'pending', 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200': report.status === 'reviewed', 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200': report.status === 'resolved' })}>{formatReportStatus(report.status)}</span></td>
                <td className="px-6 py-4 whitespace-nowrap text-center"><button onClick={() => openReportModal(report)} title="Detaylar" className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"><EyeIcon className="w-5 h-5"/></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Rapor Detay Modalı (Yeni Stiller) */}
      <Transition appear show={isModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={closeReportModal}>
          <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0"><div className="fixed inset-0 bg-black/60 backdrop-blur-sm" /></Transition.Child>
          <div className="fixed inset-0 overflow-y-auto"><div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-xl bg-white dark:bg-gray-900 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title as="h3" className="text-lg font-bold p-6 text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-800">Rapor Detayları</Dialog.Title>
                  {selectedReport && (
                    <div className="p-6 space-y-4">
                      {/* ... (Modal içeriği aynı kalabilir, stiller otomatik uyum sağlar) ... */}
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="font-semibold text-gray-500 dark:text-gray-400">Raporlayan Kullanıcı</p>
                          <Link href={`/profil/${selectedReport.reporter.username}`} className="text-blue-600 dark:text-blue-400 hover:underline">{selectedReport.reporter.username}</Link>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-500 dark:text-gray-400">Raporlanan Kullanıcı</p>
                          <Link href={`/profil/${selectedReport.reported.username}`} className="text-red-600 dark:text-red-400 hover:underline">{selectedReport.reported.username}</Link>
                        </div>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-500 dark:text-gray-400">Rapor Sebebi</p>
                        <p className="text-gray-800 dark:text-gray-100 bg-gray-100 dark:bg-gray-800 p-3 rounded-md">{selectedReport.reason}</p>
                      </div>
                      {selectedReport.description && (
                         <div>
                          <p className="font-semibold text-gray-500 dark:text-gray-400">Detaylı Açıklama</p>
                          <p className="text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 p-3 rounded-md whitespace-pre-wrap break-words">{selectedReport.description}</p>
                        </div>
                      )}
                      <div className="border-t border-gray-200 dark:border-gray-800 pt-4">
                        <p className="font-semibold text-gray-500 dark:text-gray-400 mb-2">Durumu Güncelle</p>
                        <div className="flex flex-wrap items-center gap-3">
                          <button onClick={() => handleUpdateStatus(selectedReport.id, 'reviewed')} disabled={isProcessing != null} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-800/50 dark:text-blue-300 rounded-md hover:bg-blue-200 dark:hover:bg-blue-800 disabled:opacity-50"> <EyeIcon className="w-4 h-4"/> İncelendi Olarak İşaretle</button>
                          <button onClick={() => handleUpdateStatus(selectedReport.id, 'resolved')} disabled={isProcessing != null} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-green-100 text-green-700 dark:bg-green-800/50 dark:text-green-300 rounded-md hover:bg-green-200 dark:hover:bg-green-800 disabled:opacity-50"><CheckCircleIcon className="w-4 h-4"/> Çözüldü Olarak İşaretle</button>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="p-6 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-800 flex justify-between items-center">
                    <button onClick={() => selectedReport && handleDeleteReport(selectedReport.id)} disabled={isProcessing != null} className="flex items-center gap-1.5 text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 font-medium disabled:opacity-50"><ArchiveBoxXMarkIcon className="w-4 h-4"/> Raporu Sil</button>
                    <button type="button" onClick={closeReportModal} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600">Kapat</button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}