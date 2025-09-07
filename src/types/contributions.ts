// src/types/contributions.ts

export interface UserSession {
    id: string;
    firstName?: string | null;
    lastName?: string | null;
}

export interface ContributionSubmission {
    id: number;
    audioFilePublicId: string;
}

export interface ContributionDialogue {
    id: number;
    dialogueText: string;
    originalVoiceUrl: string | null;
    currentUserSubmissions: ContributionSubmission[];
}

export interface ContributionCharacter {
    id: number;
    name: string;
    dialogues: ContributionDialogue[];
}