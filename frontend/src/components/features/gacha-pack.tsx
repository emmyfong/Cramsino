"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";
import { ThreeDObject } from "./three-d-pack";

type GachaState = "idle" | "centering" | "spinning" | "ripping" | "flash" | "reveal";

const MOCK_PULL = [
  { id: 1, name: "Rusty Dagger", rarity: "Common" },
  { id: 2, name: "Mana Potion", rarity: "Common" },
  { id: 3, name: "Golden Shield", rarity: "Rare" },
  { id: 4, name: "Ancient Scroll", rarity: "Epic" },
  { id: 5, name: "Dragon Scale", rarity: "Legendary" },
];

export function GachaPack() {
  const [status, setStatus] = useState<GachaState>("idle");
  const [cards, setCards] = useState(MOCK_PULL);

  const handlePackClick = () => {
    if (status !== "idle") return;
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
      {/* IDLE STATE */}
      <div 
        className={`relative h-80 w-56 cursor-pointer group perspective-1000 z-10 transition-opacity duration-500 ${isCinematic ? "opacity-0 pointer-events-none delay-500" : ""}`}
        onClick={handlePackClick}
      >
        <ThreeDObject className="h-full w-full">
           <PackVisual />
        </ThreeDObject>
        <div className="absolute -bottom-10 w-full text-center animate-bounce text-slate-500 font-bold text-sm">
          Click to Open
        </div>
      </div>

      {/* CINEMATIC OVERLAY */}
      <AnimatePresence>
        {isCinematic && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }} 
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/95"
          >
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
                   <div className="absolute inset-x-0 bottom-0 h-[85%] bg-gradient-to-br from-indigo-600 to-purple-800 rounded-b-xl border-x-4 border-b-4 border-yellow-400 shadow-[0_0_80px_rgba(250,204,21,0.6)] flex items-center justify-center overflow-hidden">
                      <div className="text-white text-center animate-pulse">
                        <Sparkles className="w-12 h-12 mx-auto text-yellow-300" />
                      </div>
                   </div>
                   <motion.div 
                     animate={status === "ripping" ? { y: -200, x: 100, rotate: 60, opacity: 0, scale: 1.2 } : {}}
                     transition={{ duration: 0.4, ease: "backIn" }}
                     className="absolute inset-x-0 top-0 h-[15%] bg-indigo-500 border-x-4 border-t-4 border-yellow-400 rounded-t-xl z-20"
                   >
                       <div className="absolute -bottom-2 w-full h-4 bg-indigo-500" style={{ clipPath: "polygon(0% 0%, 5% 100%, 10% 0%, 15% 100%, 20% 0%, 25% 100%, 30% 0%, 35% 100%, 40% 0%, 45% 100%, 50% 0%, 55% 100%, 60% 0%, 65% 100%, 70% 0%, 75% 100%, 80% 0%, 85% 100%, 90% 0%, 95% 100%, 100% 0%)" }}></div>
                   </motion.div>
                </div>
              </motion.div>
            )}

            {/* THE FLASH */}
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

            {/* THE REVEAL */}
            {status === "reveal" && (
              <>
                  <motion.div 
                    className="grid grid-cols-5 gap-4 w-full max-w-6xl px-4 z-50"
                    initial="hidden"
                    animate="visible"
                    variants={{
                      visible: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } }
                    }}
                  >
                    {cards.map((card) => (
                      <motion.div
                        key={card.id}
                        variants={{
                          hidden: { y: 150, opacity: 0, scale: 0.5, rotateX: -45 },
                          visible: { 
                              y: 0, opacity: 1, scale: 1, rotateX: 0,
                              transition: { type: "spring", bounce: 0.4, duration: 0.8 } 
                          }
                        }}
                      >
                        <ResultCard card={card} />
                      </motion.div>
                    ))}
                  </motion.div>
                  
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5 }}
                    className="absolute bottom-10 inset-x-0 text-center z-[80] cursor-pointer"
                    onClick={reset}
                  >
                      <span className="text-white/70 font-bold text-sm uppercase tracking-[0.3em] animate-pulse hover:text-white transition-colors border-b-2 border-transparent hover:border-white pb-2">
                          Tap to Continue
                      </span>
                      <div className="fixed inset-0 z-40" onClick={reset}></div>
                  </motion.div>
              </>
            )}

          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// =========================================
// FX COMPONENTS
// =========================================

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
    <div className="h-full w-full bg-gradient-to-br from-indigo-600 to-purple-800 rounded-xl border-4 border-yellow-400 shadow-xl flex items-center justify-center relative overflow-hidden">
       <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30 mix-blend-overlay"></div>
       <div className="text-center text-white relative z-20">
        <Sparkles className="w-12 h-12 mx-auto mb-2 text-yellow-300 drop-shadow-md" />
        <h2 className="text-xl font-black tracking-widest uppercase">Gacha<br/>Gen 1</h2>
      </div>
    </div>
  );
}

function ResultCard({ card }: { card: { name: string, rarity: string } }) {
  const isLegendary = card.rarity === "Legendary";
  return (
    <div className={`h-80 rounded-lg p-1.5 relative group transition-transform hover:-translate-y-4 hover:scale-105 duration-300 ${isLegendary ? 'bg-gradient-to-b from-yellow-300 via-yellow-500 to-amber-600 shadow-[0_0_40px_rgba(250,204,21,0.6)]' : 'bg-slate-700 shadow-xl'}`}>
      <div className="h-full w-full bg-slate-900 rounded-md flex flex-col items-center justify-center p-4 text-center border border-white/10 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <div className="text-6xl mb-6 drop-shadow-lg">{isLegendary ? "🐲" : "⚔️"}</div>
        <div className="font-black text-white text-xl uppercase tracking-tight">{card.name}</div>
        <div className={`text-xs uppercase tracking-[0.2em] mt-2 font-bold py-1 px-3 rounded-full ${isLegendary ? "bg-yellow-500 text-yellow-950" : "bg-slate-800 text-slate-400"}`}>
          {card.rarity}
        </div>
      </div>
    </div>
  )
}