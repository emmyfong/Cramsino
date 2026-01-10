"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CurrencyDisplay } from "@/components/features/currency-display";

export function Navbar() {
  const [coins, setCoins] = useState(10000);

  useEffect(() => {
    const loadCoins = () => {
      const stored = localStorage.getItem("cramsinoCoins");
      const parsed = stored === null ? 10000 : Number.parseInt(stored, 10);
      setCoins(Number.isNaN(parsed) ? 10000 : parsed);
    };

    loadCoins();
    window.addEventListener("storage", loadCoins);
    window.addEventListener("cramsinoCoinsUpdated", loadCoins);

    return () => {
      window.removeEventListener("storage", loadCoins);
      window.removeEventListener("cramsinoCoinsUpdated", loadCoins);
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container flex h-16 items-center justify-between px-4 mx-auto">
        
        {/* Left: Currency Module */}
        <div className="flex-1 flex justify-start">
          <CurrencyDisplay amount={coins} />
        </div>

        {/* Center: Title */}
        <div className="flex-1 flex justify-center">
          <Link href="/" className="font-extrabold text-xl tracking-tighter hover:opacity-80 transition-opacity">
            CRAMSINO
          </Link>
        </div>

        {/* Right: Inventory Module */}
        <div className="flex-1 flex justify-end">
          <Button asChild variant="default" size="sm">
            <Link href="/inventory">
              View Inventory
            </Link>
          </Button>
        </div>

      </div>
    </header>
  );
}
