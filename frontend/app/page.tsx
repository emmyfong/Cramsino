"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, LayoutDashboard, Trophy, Flame } from "lucide-react";
import { GachaPack } from "@/components/features/gacha-pack";
import { cn } from "@/lib/utils";

export default function Home() {
  const [isGachaOpen, setIsGachaOpen] = useState(true);

  // Mock data for streak
  const today = new Date();
  const streakDays = Array.from({ length: 12 }).map((_, i) => {
    const date = new Date();
    date.setDate(today.getDate() - i);
    return date;
  });

  return (
    // FIX 1: 'h-auto' allows scrolling on mobile/split. 'lg:h-[...]' locks it on desktop.
    <div className="flex h-auto lg:h-[calc(100vh-4rem)] w-full flex-col lg:flex-row bg-slate-50 relative overflow-x-hidden lg:overflow-hidden">
      
      {/* =======================
          LEFT SIDE: DASHBOARD 
          (Takes up all remaining space)
         ======================= */}
      <div className="flex-1 min-w-0 transition-all duration-500 ease-in-out bg-white/50">
        
        {/* FIX 2: Conditional ScrollArea. 
            On Desktop (lg), we use ScrollArea to keep the header fixed.
            On Mobile, we render a normal div so the whole page scrolls. 
        */}
        <div className="lg:h-full">
           <ConditionalScrollArea className="h-full">
              <div className="p-6 space-y-8 max-w-5xl mx-auto pb-10 lg:pb-20">
                
                {/* Header */}
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
                      Dashboard
                    </h1>
                    <p className="text-slate-500">Track your progress and earn rewards.</p>
                  </div>
                  
                  {!isGachaOpen && (
                    <Button 
                        onClick={() => setIsGachaOpen(true)}
                        className="hidden lg:flex shadow-xl bg-indigo-600 hover:bg-indigo-700 text-white gap-2 animate-in fade-in slide-in-from-right-4"
                    >
                        <LayoutDashboard size={16} /> Open Gacha
                    </Button>
                  )}
                </div>

                {/* Top Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Streak Card */}
                  <Card className="border-l-4 border-l-orange-500 shadow-sm hover:shadow-md transition-shadow bg-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Study Streak</CardTitle>
                      <Flame className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent className="flex flex-col xl:flex-row gap-6 items-center pt-4">
                      <div className="text-center">
                          <div className="text-5xl font-bold text-orange-500">12</div>
                          <div className="text-xs text-muted-foreground uppercase tracking-wider font-bold mt-1">Days Streak</div>
                      </div>
                      <div className="scale-90 origin-top xl:origin-left">
                          <Calendar
                              mode="single"
                              selected={today}
                              className="rounded-md border shadow-sm pointer-events-none bg-white p-2"
                              modifiers={{ streak: streakDays }}
                              modifiersClassNames={{
                                streak: "bg-orange-100 text-orange-700 font-bold relative overflow-visible after:content-['🔥'] after:absolute after:-top-1 after:-right-1 after:text-[0.6rem]"
                              }}
                          />
                      </div>
                    </CardContent>
                  </Card>

                  {/* XP Card */}
                  <Card className="relative bg-slate-900 border-slate-800 shadow-md hover:shadow-lg transition-all overflow-hidden group">
                    <div className="absolute inset-0 opacity-25 bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>
                    <div className="relative z-10">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium text-slate-200">Level Progress</CardTitle>
                          <Trophy className="h-4 w-4 text-indigo-400" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-3xl font-bold mb-1 text-white">Level 42</div>
                          <p className="text-xs text-slate-400 mb-6">2,450 / 3,000 XP</p>
                          <div className="h-4 w-full bg-slate-800 rounded-full overflow-hidden relative">
                              <div className="absolute inset-0 bg-slate-700/30 w-full"></div>
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: "65%" }}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                                className="h-full bg-indigo-500 rounded-full relative"
                              >
                                <div className="absolute right-0 top-0 h-full w-4 bg-indigo-400 blur-[4px] opacity-50"></div>
                              </motion.div>
                          </div>
                          <p className="text-right text-xs text-indigo-300 mt-2">+20 XP from last session</p>
                        </CardContent>
                    </div>
                  </Card>
                </div>

                {/* Tasks Section */}
                <Card className="shadow-md bg-white">
                  <CardHeader>
                      <CardTitle>Daily Quests</CardTitle>
                      <CardDescription>Complete tasks to earn Gacha Currency.</CardDescription>
                  </CardHeader>
                  <CardContent>
                      <TaskList />
                  </CardContent>
                </Card>

              </div>
           </ConditionalScrollArea>
        </div>
      </div>

      {/*RIGHT SIDE*/}
      <AnimatePresence mode="popLayout">
        {isGachaOpen && (
            <motion.div
                layout
                initial={{ width: 0, opacity: 0 }}
                animate={{ 
                    width: "auto", 
                    opacity: 1,
                    flexBasis: "45%" 
                }} 
                exit={{ width: 0, opacity: 0, flexBasis: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="relative bg-slate-100 border-t lg:border-t-0 lg:border-l border-slate-200 w-full lg:w-auto shrink-0 flex flex-col"
            >
                {/* Close Button */}
                <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setIsGachaOpen(false)}
                    className="absolute top-4 right-4 z-20 text-slate-400 hover:text-slate-800 hover:bg-slate-200 hidden lg:flex"
                >
                    <ChevronRight size={20} />
                </Button>

                {/* Grid Background */}
                <div className="absolute inset-0 grid grid-cols-6 grid-rows-6 opacity-5 pointer-events-none">
                    {Array.from({ length: 36 }).map((_, i) => (
                        <div key={i} className="border border-indigo-900"></div>
                    ))}
                </div>

                {/* Gacha Content Container */}
                <div className="relative z-10 flex-1 flex items-center justify-center p-8 min-h-[500px] lg:min-h-0">
                    <div className="scale-100 transition-transform">
                        <GachaPack />
                    </div>
                </div>
            </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

function ConditionalScrollArea({ children, className }: { children: React.ReactNode, className?: string }) {
    return (
        <>
            {/* Mobile View: Standard Div */}
            <div className="block lg:hidden h-auto w-full">
                {children}
            </div>
            {/* Desktop View: Scroll Area */}
            <div className="hidden lg:block h-full w-full">
                <ScrollArea className={className}>
                    {children}
                </ScrollArea>
            </div>
        </>
    )
}

// --- SUB-COMPONENT: TASK LIST ---
const TASKS = [
    { id: "1", label: "Review React Hooks Notes", completed: true, reward: "50 G" },
    { id: "2", label: "Complete 2 LeetCode Problems", completed: false, reward: "100 G" },
    { id: "3", label: "Watch System Design Video", completed: false, reward: "30 G" },
    { id: "4", label: "Commit Code to GitHub", completed: true, reward: "20 G" },
];

function TaskList() {
    return (
        <div className="space-y-3">
            {TASKS.map((task) => (
                <div 
                    key={task.id} 
                    className={cn(
                        "flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl border transition-all duration-200 gap-3 sm:gap-0",
                        task.completed 
                            ? "bg-slate-50 border-slate-100 opacity-60" 
                            : "bg-white border-slate-200 hover:border-indigo-300 hover:shadow-md hover:-translate-y-0.5"
                    )}
                >
                    <div className="flex items-center space-x-3 w-full sm:w-auto">
                        <Checkbox id={task.id} checked={task.completed} className="data-[state=checked]:bg-indigo-500 data-[state=checked]:border-indigo-500" />
                        <label 
                            htmlFor={task.id} 
                            className={cn(
                                "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer select-none break-words",
                                task.completed && "line-through text-slate-500"
                            )}
                        >
                            {task.label}
                        </label>
                    </div>
                    <Badge variant={task.completed ? "secondary" : "default"} className={cn("ml-7 sm:ml-0", task.completed ? "bg-slate-200" : "bg-amber-400 hover:bg-amber-500 text-amber-950 border-amber-500/20")}>
                        {task.reward}
                    </Badge>
                </div>
            ))}
        </div>
    )
}