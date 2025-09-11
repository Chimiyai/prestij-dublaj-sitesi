import { UserRole } from "@prisma/client";

// Hem page.tsx hem de UsersClientPage.tsx bu tipleri kullanacak
export type Game = { 
  id: number; 
  title: string; 
};

export type User = {
  id: number;
  username: string;
  email: string;
  role: UserRole;
  createdAt: Date;
  isBanned: boolean;
  banExpiresAt: Date | null;
  ownedGames: Game[];
};