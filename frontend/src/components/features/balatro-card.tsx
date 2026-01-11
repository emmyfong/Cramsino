"use client";

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useState } from "react";

export interface CardItem {
  id: number;
  name: string;
  rarity: string;
  color: string;
  glowColor: string;
  finish: "base" | "holo" | "foil";
  icon?: string;
  cardBase?: string; // Path to card base/frame image
  cardArt?: string;  // Path to card artwork image
  cardNumber?: number; // Card number out of 51
  auraValue?: number; // Aura value (e.g., 54)
  cardType?: string; // Card type (e.g., "Fire", "Water", etc.)
}

interface BalatroCardProps {
  item: CardItem;
}

export function BalatroCard({ item }: BalatroCardProps) {
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -15;
    const rotateY = ((x - centerX) / centerX) * 15;
    setRotation({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setRotation({ x: 0, y: 0 });
    setIsHovered(false);
  };

  // Smooth holographic effect with natural prismatic colors
  const holoGradient = item.finish === 'holo' 
    ? `linear-gradient(${rotation.y * 3 + 45}deg, 
       rgba(255,255,255,0.9) 0%, 
       rgba(200,200,220,0.7) 20%,
       rgba(255,255,255,0.9) 40%,
       rgba(180,180,200,0.7) 60%,
       rgba(255,255,255,0.9) 80%,
       rgba(200,200,220,0.7) 100%)`
    : 'none';

  // Foil metallic effect
  const foilGradient = item.finish === 'foil'
    ? `linear-gradient(${rotation.y * 3 + rotation.x * 2}deg, 
       rgba(255,100,200,0.5) 0%, 
       rgba(150,100,255,0.5) 25%, 
       rgba(100,200,255,0.5) 50%, 
       rgba(100,255,150,0.5) 75%, 
       rgba(255,200,100,0.5) 100%)`
    : 'none';

  return (
    <div
      className="relative cursor-pointer transition-all duration-300 ease-out"
      style={{
        width: "280px",
        height: "400px",
        perspective: "1000px",
        pointerEvents: "auto",
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
    >
      <div
        className="relative w-full h-full transition-all duration-300 ease-out"
        style={{
          transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) ${isHovered ? 'translateY(-20px) scale(1.05)' : 'translateY(0) scale(1)'}`,
          transformStyle: "preserve-3d",
        }}
      >
        <Card 
          className={`w-full h-full overflow-hidden ${item.color} border-2 shadow-2xl transition-shadow duration-300 relative`}
          style={{
            boxShadow: isHovered 
              ? `0 30px 60px -15px rgba(0, 0, 0, 0.4), 0 0 40px ${item.glowColor}`
              : '0 10px 30px -10px rgba(0, 0, 0, 0.3)',
          }}
        >
          {/* Card Base Layer (background frame) - Full card coverage */}
          {item.cardBase && (
            <img 
              src={item.cardBase} 
              alt="Card Base"
              className="absolute inset-0 w-full h-full object-cover z-0"
            />
          )}
          
          {/* Card Art Layer - Full card coverage */}
          {item.cardArt && (
            <img 
              src={item.cardArt} 
              alt={item.name}
              className="absolute inset-0 w-full h-full object-cover z-10"
            />
          )}
          
          {/* Rarity Color Tint */}
          <div 
            className="absolute inset-0 pointer-events-none z-15 mix-blend-multiply opacity-20"
            style={{ backgroundColor: item.glowColor }}
          />
          
          {/* Placeholder icon if no images */}
          {!item.cardArt && !item.cardBase && (
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <div className="w-32 h-32 rounded-full bg-white/50 flex items-center justify-center text-6xl shadow-lg backdrop-blur-sm">
                {item.icon || "🐉"}
              </div>
            </div>
          )}

          {/* Smooth holographic effect */}
          {item.finish === 'holo' && (
            <>
              <div 
                className="absolute inset-0 pointer-events-none transition-opacity duration-200 mix-blend-overlay z-20"
                style={{
                  background: holoGradient,
                  opacity: isHovered ? 0.7 : 0.3,
                }}
              />
              <div 
                className="absolute inset-0 pointer-events-none z-20"
                style={{
                  background: `radial-gradient(circle at ${50 + rotation.y * 2}% ${50 + rotation.x * 2}%, rgba(255,255,255,0.6) 0%, transparent 60%)`,
                  opacity: isHovered ? 0.8 : 0.5,
                }}
              />
            </>
          )}
          
          {/* Foil metallic shine effect */}
          {item.finish === 'foil' && (
            <>
              {/* Main holographic sweep */}
              <div 
                className="absolute inset-0 pointer-events-none transition-all duration-200 z-20"
                style={{
                  background: foilGradient,
                  opacity: isHovered ? 0.7 : 0.5,
                  mixBlendMode: 'hard-light',
                }}
              />
              
              {/* Subtle light sweep */}
              <div 
                className="absolute inset-0 pointer-events-none z-20"
                style={{
                  background: `linear-gradient(${rotation.y * -2 + 90}deg, 
                    transparent 0%, 
                    rgba(255,255,255,0.4) 50%, 
                    transparent 100%)`,
                  opacity: isHovered ? 0.5 : 0.3,
                }}
              />
            </>
          )}
          
          {/* Base shine effect */}
          {item.finish === 'base' && (
            <div 
              className="absolute inset-0 pointer-events-none opacity-0 transition-opacity duration-300 z-20"
              style={{
                background: `linear-gradient(135deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)`,
                opacity: isHovered ? 0.6 : 0,
              }}
            />
          )}

          {/* Top: Card Name and Aura */}
          <div className="absolute top-3 left-0 right-0 flex flex-col items-center z-30 px-4">
            <svg viewBox="0 0 280 60" className="w-full max-w-[280px]">
              <defs>
                <path id="curve" d="M 20,55 Q 140,0 260,55" fill="transparent" />
              </defs>
              <text className="font-bold text-lg fill-white" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.9)' }}>
                <textPath href="#curve" startOffset="50%" textAnchor="middle" className="font-bold" style={{ fontSize: '18px', fontWeight: 'bold', letterSpacing: '0.05em' }}>
                  {item.name}
                </textPath>
              </text>
            </svg>
            {item.auraValue !== undefined && (
              <span className="text-sm font-medium text-white/90 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] -mt-2">
                Aura: {item.auraValue}
              </span>
            )}
          </div>

          {/* Bottom Center: Rarity */}
          <div className="absolute bottom-4 left-0 right-0 flex justify-center z-30">
            <span className="text-base font-bold text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)] uppercase tracking-wider">
              {item.rarity}
            </span>
          </div>

          {/* Bottom Left: Card Number */}
          <div className="absolute bottom-4 left-6 z-30">
            <span className="text-sm font-bold text-black drop-shadow-[0_2px_4px_rgba(255,255,255,0.8)]">
              {item.cardNumber ? `${item.cardNumber}/51` : ''}
            </span>
          </div>

          {/* Bottom Right: Card Finish Type */}
          <div className="absolute bottom-4 right-6 z-30">
            <span className="text-sm font-bold text-black drop-shadow-[0_2px_4px_rgba(255,255,255,0.8)] capitalize">
              {item.finish}
            </span>
          </div>
        </Card>
      </div>
    </div>
  );
}
