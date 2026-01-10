import { GachaPack } from "@/components/features/gacha-pack";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export default function Home() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-slate-50">
      
      {/* LEFT SIDE*/}
      <div className="w-1/2 p-12 flex flex-col justify-center space-y-8 border-r border-slate-200 bg-white">
        <div className="space-y-2">
          <h1 className="text-5xl font-extrabold tracking-tight text-slate-900">
            Welcome Back, <span className="text-indigo-600">Player</span>
          </h1>
          <p className="text-slate-500 text-xl">Here is your daily study progress.</p>
        </div>

        {/*stats*/}
        <div className="grid gap-6">
          <StatCard title="Daily Streak" value="12 Days" icon="🔥" />
          <StatCard title="Tasks Completed" value="8/10" icon="✅" />
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">XP to Next Level</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-2">2,450 / 3,000</div>
              <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-600 w-[80%] rounded-full" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* RIGHT SIDE*/}
      <div className="w-1/2 relative bg-slate-100 flex items-center justify-center overflow-hidden">
        
        {/*Background Elements */}
        <div className="absolute inset-0 grid grid-cols-6 grid-rows-6 opacity-5">
            {Array.from({ length: 36 }).map((_, i) => (
                <div key={i} className="border border-indigo-900"></div>
            ))}
        </div>
        
        <div className="z-10">
            <GachaPack />
        </div>

      </div>
    </div>
  );
}

function StatCard({ title, value, icon }: { title: string, value: string, icon: string }) {
  return (
    <Card>
      <div className="flex items-center p-6 space-x-4">
        <div className="text-4xl bg-slate-100 p-3 rounded-xl">{icon}</div>
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <h3 className="text-2xl font-bold">{value}</h3>
        </div>
      </div>
    </Card>
  )
}