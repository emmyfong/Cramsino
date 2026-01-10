import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center p-4 bg-slate-50">
      
      <Card className="w-full max-w-md text-center shadow-lg border-slate-200">
        <CardHeader>
          <CardTitle className="text-3xl font-black uppercase tracking-wide">Summon Gate</CardTitle>
          <CardDescription>
            Spend your currency to acquire legendary items.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Button size="lg" className="w-full bg-blue-600 hover:bg-blue-700 h-24 flex flex-col gap-2">
              <span className="text-lg font-bold">1x Pull</span>
              <span className="text-xs opacity-80">100 G</span>
            </Button>
            
            <Button size="lg" className="w-full bg-purple-600 hover:bg-purple-700 h-24 flex flex-col gap-2">
              <span className="text-lg font-bold">10x Pull</span>
              <span className="text-xs opacity-80">1000 G</span>
            </Button>
          </div>
          
          <div className="pt-4">
            <Button variant="outline" asChild className="w-full">
              <Link href="/inventory">Check Collection</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}