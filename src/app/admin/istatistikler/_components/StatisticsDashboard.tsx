// src/app/admin/istatistikler/_components/StatisticsDashboard.tsx

'use client';

import { Chart, AxisOptions } from 'react-charts';
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from './StatCard';
import { Users, DollarSign, Film, Mic, BarChart2, Star, Gamepad2, Heart, Vote, Flag, ShieldAlert, Briefcase, FileText } from 'lucide-react';
import { DashboardData } from '../page'; // Sunucudan gelen ana veri tipi

// --- YARDIMCI BİLEŞENLER (DEĞİŞİKLİK YOK) ---
type ChartDatum = { primary: string; secondary: number };
type ChartSeries = { label: string; data: ChartDatum[] };

function CustomBarChart({ title, data }: { title: string; data: { name: string; count: number }[] }) {
    const chartData: ChartSeries[] = React.useMemo(() => [{
        label: title,
        data: data.map(item => ({ primary: item.name, secondary: item.count }))
    }], [data, title]);

    const primaryAxis = React.useMemo((): AxisOptions<ChartDatum> => ({ getValue: datum => datum.primary }), []);
    const secondaryAxes = React.useMemo((): AxisOptions<ChartDatum>[] => [{ getValue: datum => datum.secondary, elementType: 'bar' }], []);

    return (
        <Card className="shadow-md">
            <CardHeader><CardTitle>{title}</CardTitle></CardHeader>
            <CardContent><div className="h-[300px]"><Chart options={{ data: chartData, primaryAxis, secondaryAxes, dark: true }} /></div></CardContent>
        </Card>
    );
}

function InfoListCard({ title, items, note }: { title: string; items: { name: string; value: number | string }[]; note?: string }) {
    return (
        <Card className="shadow-md">
            <CardHeader><CardTitle>{title}</CardTitle></CardHeader>
            <CardContent>
                <ul className="space-y-3">
                    {items.filter(item => item.value !== undefined && item.value !== null).map((item, index) => (
                        <li key={index} className="flex justify-between items-center text-sm break-all">
                            <span className="text-gray-300 mr-2">{item.name}</span>
                            <span className="font-bold text-white bg-gray-700 px-2 py-1 rounded-md text-right">{item.value.toLocaleString('tr-TR')}</span>
                        </li>
                    ))}
                </ul>
                {note && <p className="text-xs text-gray-500 mt-4">{note}</p>}
            </CardContent>
        </Card>
    )
}

// --- ANA DASHBOARD BİLEŞENİ (TAMAMLANMIŞ HALİ) ---

export function StatisticsDashboard({ initialData }: { initialData: DashboardData }) {
    const { kpis, userAnalysis, contentAnalysis, financialAnalysis, communityAnalysis, contributionAnalysis, operationalAnalysis } = initialData;
    const formatCurrency = (amount: number) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount);

    return (
        <div className="space-y-12">
            {/* 1. BÖLÜM: GENEL BAKIŞ (KPI'lar) */}
            <section>
                <h2 className="text-2xl font-bold text-white mb-4">Genel Bakış</h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    <StatCard title="Toplam Gelir" value={formatCurrency(kpis.totalRevenue)} icon={DollarSign} note={`Bu ay ${formatCurrency(kpis.revenueThisMonth)}`} />
                    <StatCard title="Toplam Kullanıcı" value={kpis.totalUsers.toLocaleString('tr-TR')} icon={Users} note={`+${kpis.usersThisMonth} bu ay (+${kpis.usersToday} bugün)`} />
                    <StatCard title="Yayınlanan Projeler" value={kpis.totalProjects.toLocaleString('tr-TR')} icon={Film} />
                    <StatCard title="Kayıtlı Sanatçılar" value={kpis.totalArtists.toLocaleString('tr-TR')} icon={Star} />
                    <StatCard title="Toplam Proje Görüntülenmesi" value={kpis.totalProjectViews.toLocaleString('tr-TR')} icon={BarChart2} />
                    <StatCard title="Toplam Proje Beğenisi" value={kpis.totalProjectLikes.toLocaleString('tr-TR')} icon={Heart} />
                    <StatCard title="Satılan Toplam Oyun" value={kpis.totalGamesSold.toLocaleString('tr-TR')} icon={Gamepad2} />
                    <StatCard title="Bekleyen Raporlar" value={kpis.pendingReportsCount.toLocaleString('tr-TR')} icon={ShieldAlert} />
                </div>
            </section>

            {/* 2. BÖLÜM: KULLANICI & İÇERİK ANALİZİ */}
            <section>
                <h2 className="text-2xl font-bold text-white mb-4">Kullanıcı & İçerik Analizi</h2>
                <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
                    <CustomBarChart title="Kullanıcı Rol Dağılımı" data={userAnalysis.roleDistribution} />
                    <CustomBarChart title="Kategorilere Göre Proje Sayısı" data={contentAnalysis.projectCategoryCounts} />
                    <InfoListCard title="En Aktif Kullanıcılar (Yorum)" items={userAnalysis.top5UsersByComments} />
                    <InfoListCard title="En Beğenilen Sanatçılar" items={contributionAnalysis.top5ArtistsByLikes} />
                    <InfoListCard title="En Popüler Projeler" items={[
                        { name: `Beğeni: ${contentAnalysis.mostLikedProject?.title ?? 'N/A'}`, value: contentAnalysis.mostLikedProject?.likeCount ?? 0 },
                        { name: `Favori: ${contentAnalysis.mostFavoritedProject?.title ?? 'N/A'}`, value: contentAnalysis.mostFavoritedProject?.favoriteCount ?? 0 }
                    ]} />
                </div>
            </section>
            
            {/* 3. BÖLÜM: TOPLULUK & KATKI ANALİZİ */}
            <section>
                <h2 className="text-2xl font-bold text-white mb-4">Topluluk & Katkı Analizi</h2>
                <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
                     <CustomBarChart title="Öneri Durumları" data={communityAnalysis.suggestionStatusCounts} />
                     <CustomBarChart title="Başvuru Durumları" data={communityAnalysis.applicationStatusCounts} />
                     <CustomBarChart title="Ses Katkısı Durumları" data={contributionAnalysis.submissionStatusCounts} />
                     <InfoListCard title="Topluluk Nabzı" items={[
                         { name: 'Toplam Öneri Oyu', value: kpis.totalSuggestionVotes },
                         { name: 'En Çok Başvurulan Rol', value: communityAnalysis.mostAppliedRole }
                     ]} />
                </div>
            </section>

            {/* 4. BÖLÜM: FİNANSAL & OPERASYONEL ANALİZ */}
            <section>
                <h2 className="text-2xl font-bold text-white mb-4">Finansal & Operasyonel Analiz</h2>
                <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
                    <InfoListCard title="Finansal Özet" items={[
                        ...(financialAnalysis.mostSoldGame ? [{ name: 'En Çok Satan Oyun', value: `${financialAnalysis.mostSoldGame.name} (${financialAnalysis.mostSoldGame.count} adet)` }] : [])
                    ]} note={`Toplam ${kpis.totalGamesSold} adet oyun satıldı.`}/>
                    <InfoListCard title="Operasyonel Özet" items={[
                        { name: 'Yasaklı Kullanıcı Sayısı', value: userAnalysis.bannedUsersCount },
                        ...(operationalAnalysis.mostReportedUser ? [{ name: 'En Çok Raporlanan', value: `${operationalAnalysis.mostReportedUser.name} (${operationalAnalysis.mostReportedUser.count} rapor)` }] : [])
                    ]} />
                </div>
            </section>
        </div>
    );
}