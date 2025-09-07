// src/app/admin/katkilar/_components/ContributionsClientPage.tsx
'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SubmissionsList } from './SubmissionsList';
import { ApplicationStatus } from '@prisma/client';

type SubmissionWithDetails = any; 
type InitialSubmissions = Record<ApplicationStatus, SubmissionWithDetails[]>;

export function ContributionsClientPage({ 
  initialSubmissions, 
  initialAssignedCharacters 
}: { 
  initialSubmissions: InitialSubmissions, 
  initialAssignedCharacters: number[] 
}) {
  const [submissions, setSubmissions] = useState(initialSubmissions);
  const [assignedCharacters, setAssignedCharacters] = useState(new Set(initialAssignedCharacters));
  const [selectedIds, setSelectedIds] = useState(new Set<number>());
  const [activeTab, setActiveTab] = useState<ApplicationStatus>('PENDING');

  const handleSelectionChange = (id: number) => {
    setSelectedIds(prev => {
      const newSelection = new Set(prev);
      if (newSelection.has(id)) {
        newSelection.delete(id);
      } else {
        newSelection.add(id);
      }
      return newSelection;
    });
  };

  const handleUpdate = () => {
    setSelectedIds(new Set());
  };
  // ------------------------------------------

  return (
    <Tabs defaultValue="PENDING" onValueChange={(value) => {
        const tabValue = value as ApplicationStatus;
        setActiveTab(tabValue);
        setSelectedIds(new Set());
    }}>
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="PENDING">Bekleyenler ({initialSubmissions.PENDING.length})</TabsTrigger>
        <TabsTrigger value="APPROVED">Onaylananlar ({initialSubmissions.APPROVED.length})</TabsTrigger>
        <TabsTrigger value="REJECTED">Reddedilenler ({initialSubmissions.REJECTED.length})</TabsTrigger>
      </TabsList>

      <TabsContent value="PENDING">
        <SubmissionsList
          status="PENDING"
          submissions={initialSubmissions.PENDING}
          onUpdate={handleUpdate}
          selectedIds={selectedIds}
          onSelectionChange={handleSelectionChange}
          assignedCharacters={new Set(initialAssignedCharacters)}
        />
      </TabsContent>
      <TabsContent value="APPROVED">
        <SubmissionsList
          status="APPROVED"
          submissions={initialSubmissions.APPROVED}
          onUpdate={handleUpdate}
          selectedIds={selectedIds}
          onSelectionChange={handleSelectionChange}
          assignedCharacters={new Set(initialAssignedCharacters)}
        />
      </TabsContent>
       <TabsContent value="REJECTED">
        <SubmissionsList
          status="REJECTED"
          submissions={initialSubmissions.REJECTED}
          onUpdate={handleUpdate}
          selectedIds={selectedIds}
          onSelectionChange={handleSelectionChange}
          assignedCharacters={new Set(initialAssignedCharacters)}
        />
      </TabsContent>
    </Tabs>
  );
}