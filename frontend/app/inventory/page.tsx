import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Mock Data for display
const inventoryItems = [
  { id: 1, name: "Rusty Sword", rarity: "Common", color: "bg-slate-100" },
  { id: 2, name: "Golden Shield", rarity: "Legendary", color: "bg-yellow-100 border-yellow-200" },
  { id: 3, name: "Magic Potion", rarity: "Rare", color: "bg-blue-100 border-blue-200" },
  { id: 4, name: "Leather Boots", rarity: "Common", color: "bg-slate-100" },
  { id: 5, name: "Ancient Relic", rarity: "Epic", color: "bg-purple-100 border-purple-200" },
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

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {inventoryItems.map((item) => (
          <Card key={item.id} className={`overflow-hidden transition-all hover:scale-105 cursor-pointer ${item.color}`}>
            <CardContent className="p-6 aspect-square flex items-center justify-center">
              {/* Placeholder for Item Image */}
              <div className="w-16 h-16 rounded-full bg-white/50 flex items-center justify-center text-2xl shadow-sm">
                ⚔️
              </div>
            </CardContent>
            <CardFooter className="p-3 bg-white/60 backdrop-blur-sm flex justify-between items-center text-xs font-semibold">
              <span>{item.name}</span>
              <span className="opacity-70">{item.rarity}</span>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}