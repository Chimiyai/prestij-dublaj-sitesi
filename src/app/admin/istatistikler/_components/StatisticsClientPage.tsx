// src/app/admin/istatistikler/_components/StatisticsClientPage.tsx

'use client';

import { StatisticsDashboard } from './StatisticsDashboard';
// page.tsx'de oluşturduğumuz ve export ettiğimiz veri tipini import ediyoruz
import { DashboardData } from '../page'; 

export function StatisticsClientPage({ initialData }: { initialData: DashboardData }) {
  // Gelen veriyi doğrudan StatisticsDashboard'a iletiyoruz.
  // Bu dosya artık dinamik import yapmıyor, çünkü react-charts buna ihtiyaç duymuyor.
  return <StatisticsDashboard initialData={initialData} />;
}