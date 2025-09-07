// src/app/admin/katkilar/_components/SubmissionsList.tsx (NİHAİ VE GÜVENLİ HALİ)
'use client';

import { useMemo, useState } from 'react';
import { WaveformPlayer } from '@/components/ui/WaveformPlayer';
import { getCloudinaryImageUrlOptimized } from '@/lib/cloudinary';
import { ApplicationStatus } from '@prisma/client';
import { Check, X, Download, Trash2, Info, UserPlus, FilterX, Undo2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Link from 'next/link';

// Tipleri daha net hale getirelim
interface Submission {
    id: number;
    notes: string | null;
    audioFilePublicId: string;
    user: { id: number, username: string };
    dialogue: {
        id: number;
        dialogueText: string;
        character: {
            id: number;
            name: string;
            project: { id: number; title: string; slug: string; };
        };
    };
};
interface SubmissionsListProps {
    status: ApplicationStatus;
    submissions: any[];
    assignedCharacters: Set<number>;
    selectedIds: Set<number>;
    onSelectionChange: (id: number) => void;
    onUpdate: () => void; // Artık parametre almıyor
}
interface Filters {
    username?: string;
    projectId?: string;
}

export function SubmissionsList({ status, submissions, assignedCharacters, selectedIds, onSelectionChange, onUpdate }: SubmissionsListProps) {
    const router = useRouter();
    const [processingId, setProcessingId] = useState<number | null>(null);
    const [selectedAssignUser, setSelectedAssignUser] = useState<Record<number, number>>({});
    const [filters, setFilters] = useState<Filters>({});

    const { groupedData, allUsernames, allProjects } = useMemo(() => {
        // 1. En başta, eğer hiç submission yoksa, her şeyi boş döndür.
        if (!submissions || submissions.length === 0) {
            return { groupedData: [], allUsernames: [], allProjects: [] };
        }
    
        // 2. Bozuk veya eksik veriye sahip submission'ları temizle.
        const validSubmissions = submissions.filter(sub => 
            sub && sub.user && sub.dialogue && sub.dialogue.character && sub.dialogue.character.project
        );
    
        // 3. Filtreleme işlemini bu "sağlam" veri üzerinden yap.
        const filteredSubmissions = validSubmissions.filter(sub => {
            const userMatch = !filters.username || sub.user.username === filters.username;
            const projectMatch = !filters.projectId || sub.dialogue.character.project.id.toString() === filters.projectId;
            return userMatch && projectMatch;
        });
    
        // 4. Gruplama işlemini Map ile güvenli bir şekilde yap.
        const projectsMap = new Map<number, any>();
        filteredSubmissions.forEach(sub => {
            const p = sub.dialogue.character.project;
            const c = sub.dialogue.character;
            const d = sub.dialogue;
            if (!projectsMap.has(p.id)) projectsMap.set(p.id, { ...p, characters: new Map() });
            const project = projectsMap.get(p.id);
            if (!project.characters.has(c.id)) project.characters.set(c.id, { ...c, dialogues: new Map() });
            const character = project.characters.get(c.id);
            if (!character.dialogues.has(d.id)) character.dialogues.set(d.id, { ...d, submissions: [] });
            const dialogue = character.dialogues.get(d.id);
            dialogue.submissions.push(sub);
        });
        
        // 5. Map'leri render edilebilir dizilere dönüştür.
        const finalGroupedData = Array.from(projectsMap.values()).map((p: any) => ({
            ...p,
            characters: Array.from(p.characters.values()).map((c: any) => ({
                ...c,
                dialogues: Array.from(c.dialogues.values())
            }))
        }));
    
        // 6. Dropdown listelerini, en baştaki orijinal ve tam `validSubmissions` listesinden OLUŞTUR.
        const usernames = [...new Set(validSubmissions.map(sub => sub.user.username))];
        
        // <<< EN KRİTİK DÜZELTME BURADA: GÜVENLİ PROJE LİSTESİ OLUŞTURMA <<<
        const projectsList = validSubmissions.reduce((acc: {id: number, title: string}[], sub) => {
            const project = sub.dialogue.character.project;
            // Eğer bu proje daha önce listeye eklenmemişse ekle
            if (!acc.some(p => p.id === project.id)) {
                acc.push({ id: project.id, title: project.title });
            }
            return acc;
        }, []); // Başlangıç değeri boş bir dizi
        // -------------------------------------------------------------------
        
        return { groupedData: finalGroupedData, allUsernames: usernames, allProjects: projectsList };
      }, [submissions, filters]);

    const handleFilterChange = (filterType: keyof Filters, value: string) => {
        setFilters(prev => {
            const newFilters = { ...prev };
            if (value) newFilters[filterType] = value;
            else delete newFilters[filterType];
            return newFilters;
        });
    };
    
    const handleUpdateStatus = async (submissionId: number, newStatus: ApplicationStatus) => {
        if (processingId) return;
        setProcessingId(submissionId);
        const toastId = toast.loading('Durum güncelleniyor...');
        try {
            const response = await fetch(`/api/admin/submissions/${submissionId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: newStatus }) });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message);
            toast.success('Durum güncellendi.', { id: toastId });
            onUpdate();
            router.refresh();
        } catch (error) { toast.error((error as Error).message, { id: toastId });
        } finally { setProcessingId(null); }
    };

    const handleAssignArtist = async (characterId: number, userId: number) => {
        // Atanacak olan kullanıcının herhangi bir submission ID'sini bulalım
        const submissionToAssign = submissions.find(s => s.dialogue.character.id === characterId && s.user.id === userId);
        if (!submissionToAssign) {
            toast.error("Atanacak adaya ait bir katkı bulunamadı.");
            return;
        }

        if (processingId) return;
        setProcessingId(submissionToAssign.id);
        const toastId = toast.loading('Sanatçı atanıyor...');
        try {
            const response = await fetch('/api/admin/submissions/assign-artist', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ submissionId: submissionToAssign.id }) });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message);
            toast.success(data.message, { id: toastId });
            onUpdate();
            router.refresh();
        } catch (error) { toast.error((error as Error).message, { id: toastId });
        } finally { setProcessingId(null); }
    };
  
    if (submissions.length === 0) {
        return <div className="p-8 text-center text-gray-500">Bu sekmede gösterilecek katkı yok.</div>;
    }

    return (
        <div className="space-y-6">
            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg flex flex-wrap items-center gap-4">
                {/* Proje Filtresi */}
                <div className="flex items-center gap-2">
                    <label htmlFor="projectFilter" className="text-sm font-medium text-gray-700 dark:text-gray-300">Proje:</label>
                    <select
                        id="projectFilter"
                        onChange={(e) => handleFilterChange('projectId', e.target.value)}
                        className="form-input w-48 text-sm py-1.5"
                        value={filters.projectId || ''}
                    >
                        <option value="">Tüm Projeler</option>
                        {allProjects.map(p => <option key={p.id} value={p.id.toString()}>{p.title}</option>)}
                    </select>
                </div>

                {/* Kullanıcı Filtresi */}
                <div className="flex items-center gap-2">
                    <label htmlFor="userFilter" className="text-sm font-medium text-gray-700 dark:text-gray-300">Kullanıcı:</label>
                    <select
                        id="userFilter"
                        onChange={(e) => handleFilterChange('username', e.target.value)}
                        className="form-input w-48 text-sm py-1.5"
                        value={filters.username || ''}
                    >
                        <option value="">Tüm Kullanıcılar</option>
                        {allUsernames.map(username => <option key={username} value={username}>{username}</option>)}
                    </select>
                </div>
                
                {/* Filtreyi Temizle Butonu */}
                {(filters.username || filters.projectId) && (
                    <button onClick={() => setFilters({})} className="flex items-center gap-1 text-xs text-red-500 hover:underline">
                        <FilterX className="w-3.5 h-3.5"/>
                        Tüm Filtreleri Temizle
                    </button>
                )}
            </div>
            
            {/* Toplu işlem çubuğu (şimdilik mantığı boş) */}
            
            {groupedData.length === 0 && (filters.username || filters.projectId) && (
                <div className="p-8 text-center text-gray-500">Bu filtreyle eşleşen sonuç bulunamadı.</div>
            )}

{groupedData.map((project: any) => (
                <div key={project.id} className="bg-white dark:bg-gray-900 shadow rounded-lg">
                    <h2 className={
        "p-4 text-lg font-semibold text-gray-800 dark:text-gray-100 " +
        "border-b border-gray-200 dark:border-gray-800"
      }
    >{project.title}</h2>
                    <div className="space-y-4 p-4">
                        {project.characters.map((character: any) => { // <<< Artık .map kullanabiliriz
                            const isCharacterAssigned = assignedCharacters?.has(character.id);
                            
                            // flatMap artık çalışacaktır.
                            const uniqueUsers = [...new Map(character.dialogues.flatMap((d: any) => d.submissions).map((s: any) => [s.user.id, s.user])).values()];
                            const selectedUserId = selectedAssignUser[character.id];

                            return (
                                <div key={character.id} className={isCharacterAssigned && status === 'APPROVED' ? 'opacity-60' : ''}>
                                    <div className="flex justify-between items-center mb-2">
                                        <h3 className="font-semibold text-gray-700 dark:text-gray-300">Karakter: {character.name}</h3>
                                        {status === 'APPROVED' && (
                                            isCharacterAssigned ? (
                                                <span className="text-xs font-bold text-green-500">GÖNÜLLÜ ATANDI</span>
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    <select 
                                                        onChange={(e) => setSelectedAssignUser(prev => ({ ...prev, [character.id]: parseInt(e.target.value) }))}
                                                        value={selectedUserId || ''}
                                                        className="form-input text-xs py-1"
                                                    >
                                                        <option value="" disabled>Atanacak Kullanıcıyı Seç...</option>
                                                        {uniqueUsers.map((user: any) => <option key={user.id} value={user.id}>{user.username}</option>)}
                                                    </select>
                                                    <button onClick={() => handleAssignArtist(character.id, selectedUserId)} disabled={!selectedUserId || processingId !== null} className="btn-xs-blue flex items-center gap-1.5"><UserPlus className="w-4 h-4"/> Ata</button>
                                                </div>
                                            )
                                        )}
                                    </div>
                                    <div className="pl-4 mt-2 space-y-3 border-l-2 border-gray-200 dark:border-gray-700">
                                    {character.dialogues.map((dialogue: any) => (
                                            <div key={dialogue.id}>
                                                <p className="text-sm italic text-gray-500">"{dialogue.dialogueText}"</p>
                                                <ul className="mt-2 space-y-2">
                                                    {dialogue.submissions.map((sub: any) => (
                                                        <li key={sub.id} className="flex items-center gap-4 p-2 bg-gray-100 dark:bg-gray-800/50 rounded-md">
                                                            <input type="checkbox" className="h-4 w-4" checked={selectedIds.has(sub.id)} onChange={() => onSelectionChange(sub.id)} />
                                                            <span className="text-sm font-medium w-32 truncate" title={sub.user.username}>{sub.user.username}</span>
                                                            <WaveformPlayer audioUrl={getCloudinaryImageUrlOptimized(sub.audioFilePublicId, { resource_type: 'video' })} />
                                                            <div className="flex items-center gap-2 ml-auto">
                                                                {status === 'PENDING' && (<>
                                                                    <button onClick={() => handleUpdateStatus(sub.id, 'APPROVED')} disabled={processingId === sub.id} title="Onayla" className="p-2 text-green-600 hover:text-green-500"><Check className="w-5 h-5"/></button>
                                                                    <button onClick={() => handleUpdateStatus(sub.id, 'REJECTED')} disabled={processingId === sub.id} title="Reddet" className="p-2 text-red-600 hover:text-red-500"><X className="w-5 h-5"/></button>
                                                                </>)}
                                                                {status === 'APPROVED' && <button onClick={() => handleUpdateStatus(sub.id, 'PENDING')} disabled={processingId === sub.id} title="Bekleyenlere Geri Gönder" className="p-2 text-yellow-500 hover:text-yellow-400"><Undo2 className="w-5 h-5"/></button>}
                                                                {status === 'REJECTED' && <button title="Kalıcı Olarak Sil" className="p-2 text-gray-500 hover:text-gray-400"><Trash2 className="w-5 h-5"/></button>}
                                                                {sub.notes && (
      <div className="group relative p-2"> {/* `group` bu div'in ebeveyni */}
        <Info className="w-4 h-4 text-gray-400"/>
        
        <div 
          className={
            "absolute bottom-full mb-2 right-1/2 translate-x-1/2 " + // Konumlandırma: İkonun üst-ortasında
            "w-48 p-2 bg-gray-900 text-white text-xs rounded-md shadow-lg " + // Stil: Koyu arka plan, gölge
            "opacity-0 group-hover:opacity-100 transition-opacity duration-200 " + // Animasyon: `group`'un üzerine gelince yavaşça belir
            "pointer-events-none z-20" // Diğer elemanların tıklanmasını engellemesin ve üstte görünsün
          }
        >
          {sub.notes}
          <div className="absolute top-full right-1/2 -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-gray-900"></div>
        </div>
        {/* ------------------------------------------- */}
      </div>
    )}
                                                            </div>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
}