import { Coins } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface CurrencyDisplayProps {
  amount?: number;
}

export function CurrencyDisplay({ amount = 0 }: CurrencyDisplayProps) {
  return (
    <Badge variant="secondary" className="flex items-center gap-2 px-3 py-1 text-md border-yellow-500/20 bg-yellow-500/10 text-yellow-700 hover:bg-yellow-500/20">
      <Coins className="w-4 h-4 text-yellow-600" />
      <span className="font-bold">{amount.toLocaleString()} G</span>
    </Badge>
  );
}