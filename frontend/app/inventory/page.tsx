import { Badge } from "@/components/ui/badge";
import { BalatroCard, type CardItem } from "@/components/features/balatro-card";

// Mock Data for display
const inventoryItems: CardItem[] = [
  { 
    id: 1, 
    name: "Unicorn Card", 
    rarity: "Base", 
    color: "bg-transparent", 
    glowColor: "rgba(100, 116, 139, 0.5)", 
    finish: "base",
    cardBase: "/cardbase.png",
    cardArt: "/uvicornart.png",
    cardNumber: 1,
    auraValue: 54
  },
  { 
    id: 2, 
    name: "Unicorn Card", 
    rarity: "Holo", 
    color: "bg-transparent", 
    glowColor: "rgba(168, 85, 247, 0.8)", 
    finish: "holo",
    cardBase: "/cardbase.png",
    cardArt: "/uvicornart.png",
    cardNumber: 2,
    auraValue: 54
  },
  { 
    id: 3, 
    name: "Unicorn Card", 
    rarity: "Foil", 
    color: "bg-transparent", 
    glowColor: "rgba(212, 212, 216, 0.9)", 
    finish: "foil",
    cardBase: "/cardbase.png",
    cardArt: "/uvicornart.png",
    cardNumber: 3,
    auraValue: 54
  },
];

export default function InventoryPage() {
  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Your Inventory</h1>
        <Badge variant="outline" className="text-lg px-4 py-1">
          {inventoryItems.length} Items
        </Badge>
      </div>

      <div className="flex flex-wrap justify-center gap-8 py-8">
        {inventoryItems.map((item) => (
          <BalatroCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}