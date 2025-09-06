// src/app/page.tsx
import HeroSection from "@/components/home/HeroSection";
import DubbedGamesSection from "@/components/home/DubbedGamesSection";
import DubbedAnimeSection from "@/components/home/DubbedAnimeSection";
import PopularContentSection from "@/components/home/PopularContentSection";
import SuggestGameSection from "@/components/home/SuggestGameSection";
import CountdownSection from "@/components/home/CountdownSection";
import JoinDiscordSection from "@/components/home/JoinDiscordSection";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <DubbedGamesSection />
      <DubbedAnimeSection />
      <PopularContentSection />
      <SuggestGameSection />
      <CountdownSection />
      <JoinDiscordSection />
    </>
  );
}