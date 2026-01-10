import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CurrencyDisplay } from "@/components/features/currency-display";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container flex h-16 items-center justify-between px-4 mx-auto">
        
        {/* Left: Currency Module */}
        <div className="flex-1 flex justify-start">
          <CurrencyDisplay amount={2500} />
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