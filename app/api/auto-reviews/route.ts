import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const games = ['Apex', 'Fortnite', 'Warzone', 'Valorant', 'Rust', 'Escape From Tarkov'];

const usernames = [
  'ProGamer2024', 'ShadowHunter', 'NightRaider', 'EliteSniper', 'PhantomKing',
  'DarkAssassin', 'StealthMaster', 'VictoryRoyal', 'LegendSeeker', 'ApexPredator',
  'BuildMaster', 'QuickScope', 'HeadshotKing', 'TacticalGod', 'FN_Elite',
  'WarzonePro', 'ValorantAce', 'RustLegend', 'TarkovSurvivor', 'BattleChamp'
];

const reviewTemplates = [
  "This {game} cheat is incredible! Smooth aimbot and the ESP helps me track every squad. Been using for 3 weeks with zero issues.",
  "Finally! A working {game} cheat. The silent aim is perfect and customer support helped me set everything up perfectly.",
  "Been playing {game} for years, this takes it to another level. Cheat alone is worth it. What more could you ask for?",
  "Dominating every match now! The {game} ESP makes loot so easy and the aimbot never misses. Support team is incredible.",
  "Quick setup, great features, amazing support team. What more could you ask for? Been using this {game} cheat for 2 months now.",
  "Undetected for weeks now. The {game} cheat alone is worth it. Silent aim works flawlessly and ESP is perfect.",
  "Best {game} cheat I've used. The aimbot is smooth and the ESP helps me plan my rotations perfectly.",
  "Customer support is top tier! Helped me configure everything for {game}. Been dominating lobbies ever since.",
  "This {game} ESP is a game changer. I can see loot through walls and track enemy positions easily.",
  "Insane value for the price. The {game} features are unreal and it's been undetected for over a month now."
];

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function generateReview() {
  const game = getRandomElement(games);
  const username = getRandomElement(usernames);
  const template = getRandomElement(reviewTemplates);
  const rating = Math.random() > 0.2 ? 5 : 4; // 80% 5-star, 20% 4-star
  
  return {
    username,
    rating,
    text: template.replace('{game}', game),
    avatar: username[0].toUpperCase(),
    verified: true,
    is_approved: true, // Auto-approve generated reviews
  };
}

export async function GET(request: Request) {
  try {
    // Verify this is being called by a cron job or authorized source
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const review = generateReview();
    
    const { data, error } = await supabase
      .from('reviews')
      .insert(review)
      .select()
      .single();

    if (error) {
      console.error('Error creating auto-review:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      review: data,
      message: 'Auto-review created successfully'
    });
  } catch (error) {
    console.error('Exception in auto-reviews:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
