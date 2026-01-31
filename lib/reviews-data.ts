export interface Review {
  id: string;
  productId?: string;
  productName?: string;
  username: string;
  avatar: string;
  rating: number;
  text: string;
  date: string;
  verified: boolean;
  image_url?: string;
}

export const allReviews: Review[] = [
  // Apex Legends (Armani)
  {
    id: "rev_apex_1",
    productName: "Apex Legends",
    username: "ApexPredator",
    avatar: "A",
    rating: 5,
    text: "The Apex cheat is incredible! Smooth aimbot and the ESP helps me track every squad. Been using for 3 weeks with zero issues.",
    date: "Jan 2026",
    verified: true,
  },
  {
    id: "rev_apex_2",
    productName: "Apex Legends",
    username: "LegendSeeker",
    avatar: "L",
    rating: 5,
    text: "Finally a working Apex cheat. The item ESP is a game changer for looting. Support helped me set everything up perfectly.",
    date: "Jan 2026",
    verified: true,
  },
  {
    id: "rev_apex_3",
    productName: "Apex Legends",
    username: "BRKing",
    avatar: "B",
    rating: 4,
    text: "Solid cheat for Apex. Had some FPS drops initially but after tweaking settings it runs smooth now.",
    date: "Jan 2026",
    verified: true,
  },
  {
    id: "rev_apex_4",
    productName: "Apex Legends",
    username: "WraithMain",
    avatar: "W",
    rating: 5,
    text: "Unbelievable performance. The prediction is spot on for snipers.",
    date: "Dec 2025",
    verified: true,
  },
  {
    id: "rev_apex_5",
    productName: "Apex Legends",
    username: "Pathfinder_01",
    avatar: "P",
    rating: 3,
    text: "It works well but the menu could be a bit more user friendly. Takes time to configure.",
    date: "Dec 2025",
    verified: true,
  },

  // Fortnite
  {
    id: "rev_fn_1",
    productName: "Fortnite",
    username: "BuildMaster",
    avatar: "B",
    rating: 5,
    text: "Dominating every match now! The silent aim is unreal and the player ESP helps me plan my rotations perfectly.",
    date: "Jan 2026",
    verified: true,
  },
  {
    id: "rev_fn_2",
    productName: "Fortnite",
    username: "VictoryRoyal",
    avatar: "V",
    rating: 5,
    text: "Been playing Fortnite for years, this cheat takes it to another level. Chest ESP alone is worth it.",
    date: "Jan 2026",
    verified: true,
  },
  {
    id: "rev_fn_3",
    productName: "Fortnite",
    username: "FN_Elite",
    avatar: "F",
    rating: 5,
    text: "Quick setup, great features, amazing support team. What more could you ask for?",
    date: "Jan 2026",
    verified: true,
  },
  {
    id: "rev_fn_4",
    productName: "Fortnite",
    username: "Crank90s",
    avatar: "C",
    rating: 4,
    text: "Very good but sometimes the ESP flickers in crowded endgames. Still easily wins me games.",
    date: "Dec 2025",
    verified: true,
  },

  // Call of Duty / Warzone
  {
    id: "rev_cod_1",
    productName: "Call of Duty",
    username: "COD_Veteran",
    avatar: "C",
    rating: 5,
    text: "Best COD cheat I've used. The aimbot is smooth and the ESP is perfect for tracking enemies through walls.",
    date: "Jan 2026",
    verified: true,
  },
  {
    id: "rev_cod_2",
    productName: "Warzone",
    username: "WarzonePro",
    avatar: "W",
    rating: 5,
    text: "Dominating Warzone lobbies! The UAV hack and loot ESP make every game easy mode.",
    date: "Jan 2026",
    verified: true,
  },
  {
    id: "rev_cod_3",
    productName: "ModernWarfare",
    username: "Ghost141",
    avatar: "G",
    rating: 5,
    text: "Undetected for 2 months now. Customer support is top tier, helped me configure everything perfectly.",
    date: "Jan 2026",
    verified: true,
  },
  {
    id: "rev_cod_4",
    productName: "Warzone",
    username: "SniperElite",
    avatar: "S",
    rating: 3,
    text: "Good features but slightly expensive compared to others. Quality is high though.",
    date: "Dec 2025",
    verified: true,
  },

  // Rust
  {
    id: "rev_rust_1",
    productName: "Rust",
    username: "RustLord",
    avatar: "R",
    rating: 5,
    text: "Raiding bases has never been easier. The player ESP through walls is insanely useful.",
    date: "Jan 2026",
    verified: true,
  },
  {
    id: "rev_rust_2",
    productName: "Rust",
    username: "Survivor2026",
    avatar: "S",
    rating: 5,
    text: "Dominating servers now. Silent aim makes every PVP encounter a guaranteed win.",
    date: "Jan 2026",
    verified: true,
  },
  {
    id: "rev_rust_3",
    productName: "Rust",
    username: "BaseBuilder",
    avatar: "B",
    rating: 4,
    text: "The resource ESP alone is worth the price. Finding sulfur has never been easier. Sometimes laggy with too many items shown.",
    date: "Jan 2026",
    verified: true,
  },

  // Valorant
  {
    id: "rev_val_1",
    productName: "Valorant",
    username: "RadiantPlayer",
    avatar: "R",
    rating: 5,
    text: "Finally hit Radiant with this cheat! The triggerbot is insane and the ESP shows abilities perfectly.",
    date: "Jan 2026",
    verified: true,
  },
  {
    id: "rev_val_2",
    productName: "Valorant",
    username: "ValorantKing",
    avatar: "V",
    rating: 5,
    text: "Bypasses Vanguard flawlessly. Been using for weeks with zero detection. Worth every penny.",
    date: "Jan 2026",
    verified: true,
  },
  {
    id: "rev_val_3",
    productName: "Valorant",
    username: "JettMain",
    avatar: "J",
    rating: 3,
    text: "It works but you have to be very careful with settings to look legit. Not for rage hacking.",
    date: "Dec 2025",
    verified: true,
  },

  // Overwatch 2
  {
    id: "rev_ow_1",
    productName: "Overwatch 2",
    username: "OW2Master",
    avatar: "O",
    rating: 5,
    text: "Climbing to Grandmaster has never been easier! The aimbot works perfectly with every hero.",
    date: "Jan 2026",
    verified: true,
  },
  {
    id: "rev_ow_2",
    productName: "Overwatch 2",
    username: "SupportMain",
    avatar: "S",
    rating: 5,
    text: "Even as a support main, this cheat helps me survive and track flankers. Amazing ESP features.",
    date: "Jan 2026",
    verified: true,
  },

  // CS2
  {
    id: "rev_cs2_1",
    productName: "CS2",
    username: "CS_Legend",
    avatar: "C",
    rating: 5,
    text: "Best CS2 cheat on the market. The bhop and triggerbot work flawlessly. Climbing ranks fast!",
    date: "Jan 2026",
    verified: true,
  },
  {
    id: "rev_cs2_2",
    productName: "CS2",
    username: "GlobalElite",
    avatar: "G",
    rating: 4,
    text: "Smooth aimbot that doesn't look suspicious. The skin changer is a nice bonus feature.",
    date: "Jan 2026",
    verified: true,
  },

  // Escape From Tarkov
  {
    id: "rev_eft_1",
    productName: "Escape From Tarkov",
    username: "TarkovRat",
    avatar: "T",
    rating: 5,
    text: "Loot runs are so profitable now. The item ESP finds all the good stuff.",
    date: "Jan 2026",
    verified: true,
  },
  {
    id: "rev_eft_2",
    productName: "Escape From Tarkov",
    username: "PMC_Slayer",
    avatar: "P",
    rating: 5,
    text: "Finally surviving raids consistently. Player ESP is a must-have.",
    date: "Jan 2026",
    verified: true,
  },

  // Rainbow Six Siege
  {
    id: "rev_r6_1",
    productName: "Rainbow Six Siege",
    username: "SiegeMain",
    avatar: "S",
    rating: 5,
    text: "Wallhacks are perfect for holding angles. No one flanks me anymore.",
    date: "Jan 2026",
    verified: true,
  },
  {
    id: "rev_r6_2",
    productName: "Rainbow Six Siege",
    username: "OperatorX",
    avatar: "O",
    rating: 4,
    text: "The aimbot feels natural with good smoothing settings. Very satisfied.",
    date: "Jan 2026",
    verified: true,
  },

  // HWID Spoofer
  {
    id: "rev_hwid_1",
    productName: "HWID Spoofer",
    username: "CleanSlate",
    avatar: "C",
    rating: 5,
    text: "Got HWID banned from 3 games. This spoofer got me back in all of them within minutes. Absolute lifesaver!",
    date: "Jan 2026",
    verified: true,
  },
  {
    id: "rev_hwid_2",
    productName: "HWID Spoofer",
    username: "SecondChance",
    avatar: "S",
    rating: 5,
    text: "Works perfectly with every anti-cheat. Registry cleaner feature is super useful too.",
    date: "Jan 2026",
    verified: true,
  },

  // General / Mixed
  {
    id: "rev_gen_1",
    username: "Mabz",
    avatar: "M",
    rating: 5,
    text: "Really happy with the overall service. Purchase was instant, setup was straightforward, and everything ran smoothly on my system. Support answered quickly and actually stayed engaged until my questions were fully solved.",
    date: "Dec 2025",
    verified: true,
  },
  {
    id: "rev_gen_2",
    username: "Jibegz",
    avatar: "J",
    rating: 5,
    text: "Fast responses and clear communication. I had a couple setup questions and support replied quickly with step-by-step guidance. The product feels well maintained and the UI is clean and easy to understand.",
    date: "Dec 2025",
    verified: true,
  },
  {
    id: "rev_gen_3",
    username: "Markky15_",
    avatar: "M",
    rating: 5,
    text: "Bought a 1-day key to test and it exceeded expectations. Installation was smooth, performance stayed stable, and the features were laid out clearly. Support was respectful, quick, and helped me confirm everything was configured properly.",
    date: "Nov 2025",
    verified: true,
  },
  {
    id: "rev_gen_4",
    username: "Milanek",
    avatar: "M",
    rating: 5,
    text: "Ticket response time was great. Support explained what I needed to do in plain language and didn’t rush me. After following the steps, everything worked exactly as expected.",
    date: "Nov 2025",
    verified: true,
  },
  {
    id: "rev_gen_5",
    username: "Philthiest",
    avatar: "P",
    rating: 5,
    text: "Great customer support. Quick response, clear troubleshooting steps, and a fast resolution. The product feels polished and the updates/install process is simple.",
    date: "Nov 2025",
    verified: true,
  },
  {
    id: "rev_gen_6",
    username: "Mamirose",
    avatar: "M",
    rating: 5,
    text: "First time customer and the experience was smooth. The team replied fast, answered all my questions, and pointed me to the right settings. Overall, it feels like a premium service with real support behind it.",
    date: "Nov 2025",
    verified: true,
  },
  {
    id: "rev_gen_7",
    username: "GamerX",
    avatar: "G",
    rating: 3,
    text: "Product quality is good and everything worked once set up. The only downside for me was the verification/onboarding process took longer than expected. After that, support was helpful and the experience improved.",
    date: "Oct 2025",
    verified: true,
  },
  {
    id: "rev_gen_8",
    username: "Kas",
    avatar: "K",
    rating: 5,
    text: "Legit service. Checkout was instant, setup was easy, and the dashboard/menu feels clean (not cluttered). I like that the team actually communicates during updates and responds fast when you open a ticket.",
    date: "Jan 2026",
    verified: true,
  },
  {
    id: "rev_gen_9",
    username: "admin",
    avatar: "A",
    rating: 5,
    text: "Genuinely impressed with the polish and stability. The instructions were clear, everything loaded correctly on first try, and performance stayed consistent across multiple sessions. Support is fast and professional.",
    date: "Jan 2026",
    verified: true,
  },
  {
    id: "rev_gen_10",
    username: "Nova",
    avatar: "N",
    rating: 5,
    text: "Bought to test for a weekend and ended up renewing. The UI is simple, settings are easy to understand, and it feels actively maintained. The biggest difference vs others I tried is the support speed and clarity.",
    date: "Jan 2026",
    verified: true,
  },
];

export function getReviewsByProductId(productId: string): Review[] {
  return allReviews.filter((r) => r.productId === productId);
}

export function getAverageRating(): number {
  const total = allReviews.reduce((acc, r) => acc + r.rating, 0);
  return Math.round((total / allReviews.length) * 10) / 10;
}

export function getTotalReviews(): number {
  return allReviews.length;
}
