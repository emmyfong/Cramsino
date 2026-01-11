"use client";

import { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";
import { ThreeDObject } from "./three-d-pack";
import { BalatroCard, type CardItem } from "./balatro-card";

type GachaState = "idle" | "centering" | "spinning" | "ripping" | "flash" | "reveal";

const MOCK_PULL = [
  { id: 1, name: "Rusty Dagger", rarity: "Common" },
  { id: 2, name: "Mana Potion", rarity: "Common" },
  { id: 3, name: "Golden Shield", rarity: "Rare" },
  { id: 4, name: "Ancient Scroll", rarity: "Epic" },
  { id: 5, name: "Dragon Scale", rarity: "Legendary" },
];

type GachaPackProps = {
  balance: number;
  packCost: number;
  canOpen: boolean;
  onSpend: (amount: number) => void;
  apiBase: string;
};

type ApiCard = {
  id: string;
  name: string;
  rarity: string;
  image_url: string;
  aura: string;
  type: string;
};

function isApiCard(value: unknown): value is ApiCard {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.id === "string" &&
    typeof candidate.name === "string" &&
    typeof candidate.rarity === "string" &&
    typeof candidate.image_url === "string" &&
    typeof candidate.aura === "string" &&
    typeof candidate.type === "string"
  );
}

export function GachaPack({ balance, packCost, canOpen, onSpend, apiBase }: GachaPackProps) {
  const [status, setStatus] = useState<GachaState>("idle");
  const [cards, setCards] = useState(MOCK_PULL);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handlePackClick = async () => {
    if (status !== "idle" || isLoading) return;
    if (!canOpen) {
      setErrorMessage("Not enough coins to open a pack.");
      return;
    }
    setErrorMessage("");
    setIsLoading(true);

    try {
      const response = await fetch(`${apiBase}/pack`);
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data?.cards) && data.cards.length > 0) {
          const apiCards = data.cards.filter(isApiCard);
          if (apiCards.length > 0) {
            setCards(apiCards);
          }
        }
      }
    } catch {
      // Keep existing cards on error.
    } finally {
      setIsLoading(false);
    }

    onSpend(packCost);
    setStatus("centering");
    setTimeout(() => setStatus("spinning"), 1000);
    setTimeout(() => setStatus("ripping"), 3500);
    setTimeout(() => setStatus("flash"), 4000);
    setTimeout(() => setStatus("reveal"), 4100);
  };

  const reset = () => setStatus("idle");

  const isCinematic = status !== "idle";
  const showPack = status !== "reveal" && status !== "flash";

  return (
    <>
      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center gap-3 rounded-full bg-white/80 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm">
          <span>Coins: {balance}</span>
          <span className="h-4 w-px bg-slate-200" />
          <span>Pack Cost: {packCost}</span>
        </div>
        {errorMessage && (
          <div className="text-xs font-semibold text-rose-500">{errorMessage}</div>
        )}
        <div
          className={`relative h-96 w-72 cursor-pointer group perspective-1000 z-10 transition-opacity duration-500 drop-shadow-2xl ${isCinematic || isLoading ? "opacity-0 pointer-events-none delay-500" : ""}`}
          onClick={handlePackClick}
        >
          <ThreeDObject className="h-full w-full">
            <PackVisual />
          </ThreeDObject>
          <div className="absolute -bottom-10 w-full text-center animate-bounce text-slate-500 font-bold text-sm">
            Click to Open
          </div>
        </div>
      </div>

      <Portal>
        <AnimatePresence>
          {isCinematic && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }} 
              className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/95"
              onClick={status === "reveal" ? reset : undefined}
            >
              
              {/* FX LAYERS */}
              {status !== "centering" && <SparkleOverlay />}
              <FireworkOrchestrator status={status} />

              {/* PACK ANIMATION */}
              {showPack && (
                <motion.div
                  layoutId="cinematic-pack"
                  initial={{ scale: 0.8, y: 0 }}
                  animate={
                    status === "centering" ? { scale: 1.2, y: 0 } :
                    status === "spinning" ? { rotateY: 1800, scale: 1.2 } :
                    status === "ripping" ? { rotateY: 1800, scale: 1.8, y: 50 } : {}
                  }
                  transition={
                      status === "centering" ? { duration: 1, ease: "easeInOut" } :
                      status === "spinning" ? { duration: 2.5, ease: "circIn" } : 
                      status === "ripping" ? { duration: 0.4, ease: "easeOut" } :
                      { duration: 0 }
                  }
                  className="relative perspective-1000"
                >
                  <div className="relative w-64 h-96">
                     <div className="absolute inset-x-0 bottom-0 h-[85%] rounded-b-xl border-x-4 border-b-4 border-yellow-400 shadow-[0_0_80px_rgba(250,204,21,0.6)] flex items-center justify-center overflow-hidden">
                        <img 
                          src="/Pack%20Art.png" 
                          alt="Pack Art"
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                     </div>
                     <motion.div 
                       animate={status === "ripping" ? { y: -200, x: 100, rotate: 60, opacity: 0, scale: 1.2 } : {}}
                       transition={{ duration: 0.4, ease: "backIn" }}
                       className="absolute inset-x-0 top-0 h-[15%] border-x-4 border-t-4 border-yellow-400 rounded-t-xl z-20 overflow-hidden"
                     >
                         <img 
                           src="/lid.png" 
                           alt="Pack Lid"
                           className="absolute inset-0 w-full h-full object-cover"
                         />
                         <div className="absolute -bottom-2 w-full h-4 bg-white" style={{ clipPath: "polygon(0% 0%, 5% 100%, 10% 0%, 15% 100%, 20% 0%, 25% 100%, 30% 0%, 35% 100%, 40% 0%, 45% 100%, 50% 0%, 55% 100%, 60% 0%, 65% 100%, 70% 0%, 75% 100%, 80% 0%, 85% 100%, 90% 0%, 95% 100%, 100% 0%)" }}></div>
                     </motion.div>
                  </div>
                </motion.div>
              )}

              <AnimatePresence>
                  {status === "flash" && (
                      <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0, transition: { duration: 0.8, ease: "easeOut" } }}
                          transition={{ duration: 0.1 }}
                          className="absolute inset-0 bg-white z-[70]"
                      />
                  )}
              </AnimatePresence>

              {status === "reveal" && (
                <>
                    <motion.div 
                      className="grid grid-cols-5 gap-8 w-full max-w-7xl px-8 z-50 pointer-events-auto"
                      initial="hidden"
                      animate="visible"
                      variants={{
                        visible: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } }
                      }}
                    >
                    {cards.map((card, index) => (
                        <motion.div
                          key={card.id ?? index}
                          className="pointer-events-auto"
                          style={{ perspective: "1000px", transformStyle: "preserve-3d" }}
                          variants={{
                            hidden: { y: 150, opacity: 0, scale: 0.5, rotateX: -45 },
                            visible: { 
                                y: 0, opacity: 1, scale: 1, rotateX: 0,
                                transition: { type: "spring", bounce: 0.4, duration: 0.8 } 
                            }
                          }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <BalatroCard item={toBalatroCard(card, index)} />
                        </motion.div>
                      ))}
                    </motion.div>
                    
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1.5 }}
                      className="absolute bottom-10 inset-x-0 text-center z-[80] pointer-events-none"
                    >
                        <span className="text-white/70 font-bold text-sm uppercase tracking-[0.3em] animate-pulse hover:text-white transition-colors border-b-2 border-transparent hover:border-white pb-2 pointer-events-auto cursor-pointer" onClick={(e) => { e.stopPropagation(); reset(); }}>
                            Tap to Continue
                        </span>
                    </motion.div>
                </>
              )}

            </motion.div>
          )}
        </AnimatePresence>
      </Portal>
    </>
  );
}


function Portal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(children, document.body);
}


function SparkleOverlay() {
    const sparkles = useMemo(() => Array.from({ length: 50 }).map((_, i) => ({
        id: i,
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        delay: Math.random() * 2,
        scale: Math.random() * 1 + 0.5,
        drift: Math.random() * -100 - 50,
    })), []);
 
    return (
        <div className="fixed inset-0 z-30 pointer-events-none overflow-hidden">
            {sparkles.map(s => (
                <motion.div
                    key={s.id}
                    initial={{ opacity: 0, y: 0 }}
                    animate={{ 
                        opacity: [0, 1, 0], 
                        scale: [0, s.scale, 0],
                        y: [0, s.drift]
                    }}
                    transition={{ 
                        duration: 3 + Math.random() * 2, 
                        repeat: Infinity, 
                        delay: s.delay, 
                        ease: "easeInOut" 
                    }}
                    style={{ top: s.top, left: s.left }}
                    className="absolute w-1 h-1 md:w-1.5 md:h-1.5 bg-yellow-100 rounded-full blur-[1px] drop-shadow-[0_0_8px_rgba(255,255,200,0.9)]"
                />
            ))}
        </div>
    );
 }

function FireworkOrchestrator({ status }: { status: GachaState }) {
    return (
        <div className="fixed inset-0 z-40 pointer-events-none">
             <AnimatePresence>
                {status === "ripping" && (
                     <SuperFirework 
                        key="rip-burst" 
                        x="50%" y="40%" 
                        colors={["#fbbf24", "#f59e0b", "#ffffff"]} 
                        particleCount={30}
                        scale={1.5}
                     />
                )}
                {status === "reveal" && (
                    <>
                     <SuperFirework key="fw-1" delay={0.1} x="20%" y="30%" colors={["#ef4444", "#fcd34d", "#ffffff"]} />
                     <SuperFirework key="fw-2" delay={0.3} x="80%" y="40%" colors={["#3b82f6", "#8b5cf6", "#ffffff"]} />
                     <SuperFirework key="fw-3" delay={0.5} x="50%" y="20%" colors={["#10b981", "#f59e0b", "#ffffff"]} scale={1.2} />
                     <SuperFirework key="fw-4" delay={0.7} x="30%" y="60%" colors={["#ec4899", "#fcd34d"]} particleCount={20} />
                     <SuperFirework key="fw-5" delay={0.9} x="70%" y="55%" colors={["#8b5cf6", "#ef4444"]} particleCount={20} />
                    </>
                )}
             </AnimatePresence>
        </div>
    )
}

interface FireworkProps {
    delay?: number; x: string; y: string; colors: string[]; particleCount?: number; scale?: number;
}

function SuperFirework({ delay = 0, x, y, colors, particleCount = 24, scale = 1 }: FireworkProps) {
    const particles = useMemo(() => Array.from({ length: particleCount }).map((_, i) => {
        const angle = (i / particleCount) * 360; 
        const velocity = 150 + Math.random() * 100;
        const gravity = 100 + Math.random() * 50;
        return {
            id: i,
            angle: angle * (Math.PI / 180),
            velocity,
            gravity,
            color: colors[Math.floor(Math.random() * colors.length)],
            size: Math.random() * 4 + 3,
        };
    }), [colors, particleCount]);

    return (
         <div className="absolute" style={{ top: y, left: x }}>
            <motion.div 
                initial={{ scale: 0, opacity: 1 }}
                animate={{ scale: [0, 2.5 * scale], opacity: 0 }}
                transition={{ duration: 0.4, delay: delay, ease: "easeOut" }}
                className="absolute -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-white blur-2xl rounded-full z-10"
            />
            {particles.map((p) => {
                const initialX = Math.cos(p.angle) * p.velocity * scale;
                const initialY = Math.sin(p.angle) * p.velocity * scale;
                
                return (
                    <motion.div
                        key={p.id}
                        initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
                        animate={{
                            x: initialX,
                            y: [0, initialY * 0.5, initialY + p.gravity], 
                            opacity: [1, 1, 0],
                            scale: [1, 1, 0]
                        }}
                        transition={{ duration: 1.8, delay: delay, ease: [0.25, 0.1, 0.25, 1] }}
                        style={{ backgroundColor: p.color, width: p.size, height: p.size }}
                        className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full blur-[2px] drop-shadow-[0_0_6px_currentColor]"
                    />
                );
            })}
         </div>
    );
}

function PackVisual() {
  return (
    <div className="h-full w-full rounded-xl border-4 border-yellow-400 shadow-xl flex items-center justify-center relative overflow-hidden">
       <img 
         src="/Pack%20Art.png" 
         alt="Pack Art"
         className="absolute inset-0 w-full h-full object-cover"
       />
    </div>
  );
}

function getDisplayImageUrl(url?: string) {
  if (!url) return "";
  if (!url.includes("drive.google.com")) return url;

  const idMatch =
    url.match(/\/d\/([^/]+)/) ||
    url.match(/id=([^&]+)/);

  if (!idMatch) return url;

  return `https://lh3.googleusercontent.com/d/${idMatch[1]}`;
}

function toBalatroCard(card: { name: string; rarity: string; image_url?: string; aura?: string; type?: string }, index: number): CardItem {
  const rarity = card.rarity?.toLowerCase() || "common";
  const finish = (card.type || "base").toLowerCase() as CardItem["finish"];

  const palette: Record<string, { color: string; glowColor: string }> = {
    common: { color: "bg-slate-200", glowColor: "rgba(148,163,184,0.6)" },
    uncommon: { color: "bg-emerald-200", glowColor: "rgba(52,211,153,0.6)" },
    rare: { color: "bg-sky-200", glowColor: "rgba(56,189,248,0.6)" },
    "super rare": { color: "bg-indigo-200", glowColor: "rgba(129,140,248,0.7)" },
    legendary: { color: "bg-yellow-200", glowColor: "rgba(250,204,21,0.8)" },
  };

  const { color, glowColor } = palette[rarity] || palette.common;

  return {
    id: index + 1,
    name: card.name,
    rarity: card.rarity,
    color,
    glowColor,
    finish,
    cardBase: "/cardbase.png",
    cardArt: getDisplayImageUrl(card.image_url),
    auraValue: card.aura ? Number.parseInt(card.aura, 10) : undefined,
    cardType: card.type,
  };
}
