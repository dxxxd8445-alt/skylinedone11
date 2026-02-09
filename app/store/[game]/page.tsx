import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { getProducts } from "@/lib/supabase/data";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { GameProductsGrid } from "@/components/game-products-grid";

export const dynamic = "force-dynamic";
export const revalidate = 60;

// Map of game slugs to display names and gradient colors
const gameConfig: Record<string, { name: string; gradient: string; accentColor: string }> = {
  "apex-legends": { name: "Apex Legends", gradient: "from-blue-600/40 via-orange-500/30 to-blue-800/40", accentColor: "#2563eb" },
  "fortnite": { name: "Fortnite", gradient: "from-blue-500/40 via-purple-500/30 to-blue-700/40", accentColor: "#3b82f6" },
  "universal": { name: "HWID Spoofer", gradient: "from-emerald-500/40 via-teal-500/30 to-emerald-700/40", accentColor: "#10b981" },
  "marvel-rivals": { name: "Marvel Rivals", gradient: "from-blue-500/40 via-yellow-500/30 to-blue-700/40", accentColor: "#3b82f6" },
  "delta-force": { name: "Delta Force", gradient: "from-green-600/40 via-emerald-500/30 to-green-800/40", accentColor: "#22c55e" },
  "pubg": { name: "PUBG", gradient: "from-orange-500/40 via-yellow-500/30 to-orange-700/40", accentColor: "#f97316" },
  "dayz": { name: "DayZ", gradient: "from-gray-600/40 via-green-600/30 to-gray-800/40", accentColor: "#4ade80" },
  "dune-awakening": { name: "Dune Awakening", gradient: "from-amber-600/40 via-orange-500/30 to-amber-800/40", accentColor: "#f59e0b" },
  "dead-by-daylight": { name: "Dead by Daylight", gradient: "from-blue-700/40 via-blue-600/30 to-blue-900/40", accentColor: "#b91c1c" },
  "arc-raiders": { name: "ARC Raiders", gradient: "from-cyan-500/40 via-teal-400/30 to-cyan-700/40", accentColor: "#06b6d4" },
  "rainbow-six-siege": { name: "Rainbow Six Siege", gradient: "from-yellow-500/40 via-amber-500/30 to-yellow-700/40", accentColor: "#eab308" },
  "battlefield": { name: "Battlefield", gradient: "from-orange-600/40 via-blue-500/30 to-orange-800/40", accentColor: "#ea580c" },
  "battlefield-6": { name: "Battlefield 6", gradient: "from-orange-600/40 via-blue-500/30 to-orange-800/40", accentColor: "#ea580c" },
  "call-of-duty-bo7": { name: "Call of Duty: BO7", gradient: "from-green-500/40 via-emerald-400/30 to-green-700/40", accentColor: "#22c55e" },
  "call-of-duty-bo6": { name: "Call of Duty: BO6", gradient: "from-orange-500/40 via-blue-500/30 to-orange-700/40", accentColor: "#f97316" },
  "black-ops-7-and-warzone": { name: "Black Ops 7 & Warzone", gradient: "from-green-500/40 via-emerald-400/30 to-green-700/40", accentColor: "#22c55e" },
  "rust": { name: "Rust", gradient: "from-orange-700/40 via-blue-600/30 to-orange-900/40", accentColor: "#c2410c" },
  "escape-from-tarkov": { name: "Escape from Tarkov", gradient: "from-gray-700/40 via-gray-600/30 to-gray-900/40", accentColor: "#71717a" },
  "valorant": { name: "Valorant", gradient: "from-blue-500/40 via-pink-500/30 to-blue-700/40", accentColor: "#3b82f6" },
  "hwid-spoofer": { name: "HWID Spoofer", gradient: "from-emerald-500/40 via-teal-500/30 to-emerald-700/40", accentColor: "#10b981" },
};

// Convert game name to slug
function gameToSlug(game: string): string {
  return game.toLowerCase()
    .replace(/&/g, "and")
    .replace(/[:\s]+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/--+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Card gradient colors for variety
const cardGradients = [
  "from-blue-500/30 via-blue-600/20 to-blue-700/30",
  "from-orange-500/30 via-orange-600/20 to-orange-700/30",
  "from-cyan-500/30 via-teal-600/20 to-cyan-700/30",
  "from-amber-500/30 via-yellow-600/20 to-amber-700/30",
  "from-pink-500/30 via-rose-600/20 to-pink-700/30",
  "from-emerald-500/30 via-green-600/20 to-emerald-700/30",
];

export default async function GameCheatSelectionPage({
  params,
}: {
  params: Promise<{ game: string }>;
}) {
  const { game: gameSlug } = await params;
  
  // Get all products
  const allProducts = await getProducts();
  
  const gameSlugNorm = gameSlug.toLowerCase().trim();
  const gameProducts = allProducts.filter((p) => {
    const g = (p.game || "").trim();
    const productSlug = gameToSlug(g);
    return productSlug === gameSlugNorm || g.toLowerCase() === gameSlugNorm.replace(/-/g, " ");
  });

  // If no products found, this might be a direct product slug - redirect to not found
  if (gameProducts.length === 0) {
    notFound();
  }

  const config = gameConfig[gameSlugNorm] || gameConfig[gameSlug] || { 
    name: gameProducts[0]?.game || "Game", 
    gradient: "from-blue-600/40 via-blue-500/30 to-blue-800/40",
    accentColor: "#2563eb"
  };

  // Get the first product's image for the banner background
  const bannerImage = gameProducts[0]?.image;

  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      <Header />

      {/* Hero Banner */}
      <div className="relative pt-20">
        {/* Background with game image */}
        <div className="absolute inset-0 overflow-hidden">
          {bannerImage && (
            <Image
              src={bannerImage || "/placeholder.svg"}
              alt={config.name}
              fill
              className="object-cover opacity-30 blur-sm"
            />
          )}
          <div className={`absolute inset-0 bg-gradient-to-b ${config.gradient}`} />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0a0a0a]/50 to-[#0a0a0a]" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-3">
            {config.name} Hacks
          </h1>
          <p 
            className="text-xl md:text-2xl font-medium"
            style={{ color: config.accentColor }}
          >
            Select Your Cheat
          </p>
        </div>
      </div>

      {/* Cheats Grid */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <GameProductsGrid
          products={gameProducts}
          gameSlug={gameSlugNorm}
          accentColor={config.accentColor}
          cardGradients={cardGradients}
          title={`${config.name} Hacks`}
        />
      </div>

      <Footer />
    </main>
  );
}
