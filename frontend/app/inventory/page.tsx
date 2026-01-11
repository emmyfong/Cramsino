"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { BalatroCard, type CardItem } from "@/components/features/balatro-card";
import { Loader2 } from "lucide-react";

// ... (keep your getRarityStyles function here) ...
const getRarityStyles = (rarity: string) => {
    // ... same as before
    const r = rarity?.toLowerCase() || "common";
    // ...
    return {
      color: "bg-slate-900/50 border-slate-600",
      glowColor: "rgba(148, 163, 184, 0.4)",
      finish: "base" as const,
    };
};

// CRITICAL FIX 1: Remove 'async' from this line!
// Wrong: export default async function InventoryPage() {
// Right:
export default function InventoryPage() {
  const [cards, setCards] = useState<CardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const API_BASE = "https://cramsino.onrender.com/"; 

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        setLoading(true);
        
        const res = await fetch(`${API_BASE}/cards`); 
        
        if (!res.ok) {
            console.error("Fetch failed:", res.status, res.statusText); 
            throw new Error(`Failed to fetch inventory: ${res.status}`);
        }
        
        const data = await res.json();

        const mappedCards: CardItem[] = data.map((item: any, index: number) => {
          const styles = getRarityStyles(item.rarity || "common");
          return {
            id: item.id,
            name: item.name,
            rarity: item.rarity,
            cardArt: item.image_url, 
            cardBase: "/cardbase.png", 
            color: styles.color,
            glowColor: styles.glowColor,
            finish: styles.finish,
            cardNumber: index + 1,
            auraValue: item.aura ?? Math.floor(Math.random() * 100),
          };
        });

        setCards(mappedCards);
      } catch (err) {
        console.error(err);
        setError("Could not load inventory.");
      } finally {
        setLoading(false);
      }
    };

    fetchInventory();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
        {!loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 justify-items-center">
            {cards.map((card) => (
              <div key={card.id} className="scale-90 hover:scale-100 transition-transform duration-300">
                <BalatroCard item={card} />
              </div>
            ))}
          </div>
        )}
    </div>
  );
}