"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { BalatroCard, type CardItem } from "@/components/features/balatro-card";
import { Loader2 } from "lucide-react";

const getRarityStyles = (rarity: string) => {
  const r = rarity?.toLowerCase() || "common";
  return {
    color: "bg-slate-900/50 border-slate-600",
    glowColor: "rgba(148, 163, 184, 0.4)",
  };
};

const normalizeFinish = (value?: string): "base" | "holo" | "foil" => {
  const finish = value?.toLowerCase();
  if (finish === "holo" || finish === "foil" || finish === "base") {
    return finish;
  }
  return "base";
};

const toLh3Link = (url: string) => {
  if (!url) return "/cardbase.png";
  
  if (!url.includes("drive.google.com")) return url;

  const idMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  
  if (idMatch && idMatch[1]) {
    return `https://lh3.googleusercontent.com/d/${idMatch[1]}`;
  }

  return url;
};

export default function InventoryPage() {
  const [cards, setCards] = useState<CardItem[]>([]);
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const API_BASE = "https://cramsino.onrender.com"; 

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
            
            cardArt: toLh3Link(item.image_url), 
            
            cardBase: "/cardbase.png", 
            color: styles.color,
            glowColor: styles.glowColor,
            finish: normalizeFinish(item.type),
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

  const filteredCards =
    typeFilter === "all"
      ? cards
      : cards.filter((card) => card.finish === typeFilter);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
        <div className="flex flex-wrap items-center gap-3 px-6 py-6">
          <span className="text-xs uppercase tracking-wider text-slate-400">Filter by type</span>
          {["all", "base", "holo", "foil"].map((type) => (
            <button
              key={type}
              onClick={() => setTypeFilter(type)}
              className={`rounded-full border px-4 py-1 text-xs font-semibold uppercase tracking-wider transition ${
                typeFilter === type
                  ? "border-indigo-400 bg-indigo-500/20 text-indigo-100"
                  : "border-slate-800 bg-slate-900/40 text-slate-300 hover:border-indigo-400/60"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
        {!loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 justify-items-center">
            {filteredCards.map((card) => (
              <div key={card.id} className="scale-90 hover:scale-100 transition-transform duration-300">
                <BalatroCard item={card} />
              </div>
            ))}
          </div>
        )}
    </div>
  );
}
