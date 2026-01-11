"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
  const apiBase = "https://cramsino.onrender.com";
  const clientId = "af8835c5-d0be-49b1-8e22-12228c48444c";
  const pollIntervalMs = 2000;
  const [hasStarted, setHasStarted] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [status, setStatus] = useState<{
    face_present?: boolean;
    looking_forward?: boolean;
    talking?: boolean;
    distracted?: boolean;
    updated_at?: string;
  } | null>(null);
  const [talkingStreak, setTalkingStreak] = useState(0);
  const [distractedStreak, setDistractedStreak] = useState(0);
  const [autoPaused, setAutoPaused] = useState(false);
  const [coinBalance, setCoinBalance] = useState(0);
  const packCost = 500;
  const coinAwardIntervalSeconds = 5;
  const lastAwardedBatchRef = useRef(0);
  const [activeQuest, setActiveQuest] = useState<any>(null);
  const [availableQuests, setAvailableQuests] = useState<any[]>([]);
  const [questCompleted, setQuestCompleted] = useState(false);
  const [cleanFocusSeconds, setCleanFocusSeconds] = useState(0);
  const [isLoadingQuest, setIsLoadingQuest] = useState(false);
  const questRewardedRef = useRef(false);
  const statusFlagsRef = useRef({ talking: false, distracted: false });
  const [level, setLevel] = useState(1);
  const [currentXP, setCurrentXP] = useState(0);

  const xpToNextLevel = level * 100;
  const xpPercentage = Math.min(100, Math.max(0, (currentXP / xpToNextLevel) * 100));

  // Mock data for streak
  const today = new Date();
  const streakDays = Array.from({ length: 12 }).map((_, i) => {
    const date = new Date();
    date.setDate(today.getDate() - i);
    return date;
  });

  const formattedTime = useMemo(() => {
    const minutes = Math.floor(elapsedSeconds / 60)
      .toString()
      .padStart(2, "0");
    const seconds = (elapsedSeconds % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
  }, [elapsedSeconds]);

  const formatMinutesSeconds = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60)
      .toString()
      .padStart(2, "0");
    const seconds = (totalSeconds % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  useEffect(() => {
    const isTalking = Boolean((status as any)?.status?.talking);
    const isDistracted = Boolean((status as any)?.status?.distracted);
    statusFlagsRef.current = { talking: isTalking, distracted: isDistracted };
  }, [status]);

  useEffect(() => {
    if (!hasStarted || !isRunning) {
      return;
    }

    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
      setCleanFocusSeconds((prev) => {
        const { talking, distracted } = statusFlagsRef.current;
        if (talking || distracted) {
          return 0;
        }
        return prev + 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [hasStarted, isRunning]);

  useEffect(() => {
    if (!hasStarted || !clientId.trim()) {
      return;
    }

    const poll = async () => {
      try {
        const response = await fetch(
          `${apiBase}/status?client_id=${encodeURIComponent(clientId.trim())}`
        );
        if (!response.ok) {
          return;
        }
        const data = await response.json();
        setStatus(data);

        const isTalking = Boolean(data?.status?.talking);
        const isDistracted = Boolean(data?.status?.distracted);

        const tickSeconds = pollIntervalMs / 1000;
        setTalkingStreak((prev) => (isTalking ? prev + tickSeconds : 0));
        setDistractedStreak((prev) => (isDistracted ? prev + tickSeconds : 0));
      } catch {
        // Ignore polling errors
      }
    };

    poll();
    const interval = setInterval(poll, pollIntervalMs);
    return () => clearInterval(interval);
  }, [clientId, hasStarted, pollIntervalMs]);

  useEffect(() => {
    if (!hasStarted) {
      return;
    }

    const shouldPause = talkingStreak >= 5 || distractedStreak >= 5;
    if (shouldPause) {
      setAutoPaused(true);
      setIsRunning(false);
      return;
    }

    if (autoPaused) {
      setAutoPaused(false);
      setIsRunning(true);
    }
  }, [autoPaused, distractedStreak, hasStarted, talkingStreak]);

  useEffect(() => {
    if (!hasStarted || !isRunning) {
      return;
    }

    const totalBatches = Math.floor(elapsedSeconds / coinAwardIntervalSeconds);
    if (totalBatches > lastAwardedBatchRef.current) {
      const newlyEarned = totalBatches - lastAwardedBatchRef.current;
      setCoinBalance((prev) => prev + newlyEarned * 500);
      lastAwardedBatchRef.current = totalBatches;
    }
  }, [elapsedSeconds, hasStarted, isRunning, coinAwardIntervalSeconds]);

  useEffect(() => {
    if (!activeQuest || questCompleted || !hasStarted || !isRunning) {
      return;
    }

    const targetMinutes = Number(
      activeQuest.target_minutes ?? activeQuest.target ?? activeQuest.minutes ?? 0
    );
    if (!targetMinutes || Number.isNaN(targetMinutes)) {
      return;
    }

    if (cleanFocusSeconds >= targetMinutes * 60 && !questRewardedRef.current) {
      questRewardedRef.current = true;
      setQuestCompleted(true);
      if (activeQuest.reward_gold) {
        setCoinBalance((prev) => prev + Number(activeQuest.reward_gold));
      }
      if (activeQuest.reward_xp) {
        addExperience(Number(activeQuest.reward_xp));
      }
    }
  }, [activeQuest, cleanFocusSeconds, hasStarted, isRunning, questCompleted]);

  useEffect(() => {
    const storedCoinsRaw = localStorage.getItem("cramsinoCoins");
    const storedCoins = storedCoinsRaw === null ? 10000 : Number.parseInt(storedCoinsRaw, 10);

    const nextCoins = Number.isNaN(storedCoins) ? 10000 : storedCoins;

    setCoinBalance(nextCoins);

    if (storedCoinsRaw === null) {
      localStorage.setItem("cramsinoCoins", nextCoins.toString());
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("cramsinoCoins", coinBalance.toString());
    window.dispatchEvent(new Event("cramsinoCoinsUpdated"));
  }, [coinBalance]);

  useEffect(() => {
    const storedQuest = localStorage.getItem("cramsinoActiveQuest");
    if (storedQuest) {
      try {
        const parsed = JSON.parse(storedQuest);
        if (parsed.quest) {
          const targetMinutes = Number(
            parsed.quest.target_minutes ?? parsed.quest.target ?? parsed.quest.minutes ?? 0
          );
          setActiveQuest({
            ...parsed.quest,
            target_minutes: Number.isNaN(targetMinutes) ? 0 : targetMinutes,
          });
        } else {
          setActiveQuest(null);
        }
        setQuestCompleted(Boolean(parsed.completed));
        questRewardedRef.current = Boolean(parsed.completed);
      } catch {
        // Ignore malformed quest data
      }
    }
  }, []);

  useEffect(() => {
    if (!activeQuest) {
      localStorage.removeItem("cramsinoActiveQuest");
      return;
    }
    localStorage.setItem(
      "cramsinoActiveQuest",
      JSON.stringify({ quest: activeQuest, completed: questCompleted })
    );
  }, [activeQuest, questCompleted]);

  const onStart = () => {
    setHasStarted(true);
    setIsRunning(true);
  };

  const onPause = () => {
    setIsRunning(false);
    setAutoPaused(false);
  };

  const onReset = () => {
    setHasStarted(false);
    setIsRunning(false);
    setAutoPaused(false);
    setElapsedSeconds(0);
    setTalkingStreak(0);
    setDistractedStreak(0);
    setStatus(null);
    setCleanFocusSeconds(0);
    lastAwardedBatchRef.current = 0;
  };

  const handleSpendPack = (amount: number) => {
    setCoinBalance((prev) => Math.max(0, prev - amount));
  };

  const handleGenerateQuest = async () => {
      setIsLoadingQuest(true);
      try {
          const quests = [];
          // Generate 2 Gemini quests
          for (let i = 0; i < 2; i++) {
              const res = await fetch("/api", {
                  method: "POST",
                  body: JSON.stringify({
                      duration: 25,
                      distractionCount: 2,
                      wasTalking: false
                  })
              });
              const quest = await res.json();
              const targetMinutes = Number(
                quest.target_minutes ?? quest.target ?? quest.minutes ?? 5
              );
              quests.push({
                ...quest,
                type: quest.type || "no_distractions",
                target_minutes: targetMinutes,
              });
          }
          // Add 1 hardcoded test quest
          const hardcodedQuest = {
            id: Date.now().toString() + "-hardcoded",
            title: "Quick Focus Test",
            description: "Study for 10 seconds without distractions to test the XP system.",
            reward_gold: 50,
            reward_xp: 20,
            type: "min_duration",
            target: 10,
            target_minutes: 0.1667
          };
          quests.push(hardcodedQuest);
          setAvailableQuests(quests);
          setActiveQuest(null);
          setQuestCompleted(false);
          setCleanFocusSeconds(0);
          questRewardedRef.current = false;
      } catch (e) {
          console.error("Quest gen failed", e);
      } finally {
          setIsLoadingQuest(false);
      }
  };

  const addExperience = (amount: number) => {
    let newXP = currentXP + amount;
    let newLevel = level;
    let required = newLevel * 100;

    // While loop handles multi-level ups (e.g. if you gain huge XP at once)
    while (newXP >= required) {
      newXP -= required;
      newLevel++;
      required = newLevel * 100;
      // Optional: You could trigger a "Level Up" toast/sound here
    }

    setLevel(newLevel);
    setCurrentXP(newXP);
  };

  // LOAD on mount
  useEffect(() => {
    const storedLevel = parseInt(localStorage.getItem("cramsinoLevel") || "1", 10);
    const storedXP = parseInt(localStorage.getItem("cramsinoXP") || "0", 10);
    
    setLevel(isNaN(storedLevel) ? 1 : storedLevel);
    setCurrentXP(isNaN(storedXP) ? 0 : storedXP);
  }, []);

  // SAVE on change
  useEffect(() => {
    localStorage.setItem("cramsinoLevel", level.toString());
    localStorage.setItem("cramsinoXP", currentXP.toString());
  }, [level, currentXP]);

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
                          {/* DYNAMIC LEVEL */}
                          <div className="text-3xl font-bold mb-1 text-white">Level {level}</div>
                          
                          {/* DYNAMIC XP TEXT */}
                          <p className="text-xs text-slate-400 mb-6">
                              {Math.floor(currentXP)} / {xpToNextLevel} XP
                          </p>
                          
                          {/* PROGRESS BAR */}
                          <div className="h-4 w-full bg-slate-800 rounded-full overflow-hidden relative">
                              <div className="absolute inset-0 bg-slate-700/30 w-full"></div>
                              <motion.div
                                // Animate the width based on percentage
                                animate={{ width: `${xpPercentage}%` }}
                                transition={{ duration: 0.5, ease: "easeOut" }}
                                className="h-full bg-indigo-500 rounded-full relative"
                              >
                                <div className="absolute right-0 top-0 h-full w-4 bg-indigo-400 blur-[4px] opacity-50"></div>
                              </motion.div>
                          </div>
                          <p className="text-right text-xs text-indigo-300 mt-2">
                              Next Level: {xpToNextLevel - currentXP} XP needed
                          </p>
                        </CardContent>
                    </div>
                  </Card>

                  <Card className="border border-slate-200 shadow-sm bg-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Focus Timer</CardTitle>
                      <Badge variant="secondary">
                        {autoPaused ? "Auto-paused" : isRunning ? "Running" : hasStarted ? "Paused" : "Ready"}
                      </Badge>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="text-4xl font-bold text-slate-900">{formattedTime}</div>

                      <div className="flex flex-wrap gap-3">
                        <Button onClick={onStart} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                          Start
                        </Button>
                        <Button onClick={onPause} variant="outline">
                          Pause
                        </Button>
                        <Button onClick={onReset} variant="outline">
                          Reset
                        </Button>
                      </div>

                      <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-500">
                        <div>Talking streak: {talkingStreak}s</div>
                        <div>Distracted streak: {distractedStreak}s</div>
                        <div>Last update: {status?.updated_at ?? "—"}</div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Tasks Section */}
                <Card className="shadow-md bg-white">
                      <CardHeader className="flex flex-row items-center justify-between">
                          <div>
                            <CardTitle>Quests</CardTitle>
                            <CardDescription>Generate and complete missions for rewards.</CardDescription>
                          </div>
                          <Button 
                            onClick={handleGenerateQuest} 
                            disabled={isLoadingQuest}
                            size="sm"
                            className="bg-indigo-600 text-white"
                          >
                            {isLoadingQuest ? "Generating..." : "New Quests!"}
                          </Button>
                      </CardHeader>
                      <CardContent>
                          {activeQuest ? (
                            <div className="p-4 border-2 border-indigo-100 rounded-xl bg-indigo-50/50">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold text-lg text-indigo-900">{activeQuest.title}</h3>
                                    <div className="flex gap-2">
                                      <Badge className="bg-amber-400 text-amber-900 hover:bg-amber-500">
                                          {activeQuest.reward_gold} G
                                      </Badge>
                                      <Badge className="bg-purple-400 text-purple-900 hover:bg-purple-500">
                                          {activeQuest.reward_xp} XP
                                      </Badge>
                                    </div>
                                </div>
                                <p className="text-sm text-slate-600 mb-4">{activeQuest.description}</p>
                                
                                <div className="flex gap-2 text-xs font-mono uppercase text-slate-400">
                                    <span className="px-2 py-1 bg-white rounded border">Condition: {activeQuest.type}</span>
                                    <span className="px-2 py-1 bg-white rounded border">Target: {activeQuest.target_minutes} min</span>
                                </div>

                                <div className="mt-4 text-xs text-slate-500">
                                  Clean focus: {formatMinutesSeconds(cleanFocusSeconds)} / {formatMinutesSeconds((activeQuest.target_minutes || 0) * 60)}
                                </div>
                                {questCompleted && (
                                  <div className="mt-2 text-sm font-semibold text-emerald-600">
                                    Quest completed! Reward granted.
                                  </div>
                                )}
                            </div>
                          ) : availableQuests.length > 0 ? (
                            <div className="space-y-4">
                              <p className="text-sm text-slate-600">Choose a quest to start:</p>
                              {availableQuests.map((quest, index) => (
                                <div key={index} className="p-4 border border-indigo-200 rounded-xl bg-indigo-50/30 hover:bg-indigo-50/50 cursor-pointer" onClick={() => {
                                  setActiveQuest(quest);
                                  setQuestCompleted(false);
                                  setCleanFocusSeconds(0);
                                  questRewardedRef.current = false;
                                }}>
                                  <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold text-lg text-indigo-900">{quest.title}</h3>
                                    <div className="flex gap-2">
                                      <Badge className="bg-amber-400 text-amber-900 hover:bg-amber-500">
                                          {quest.reward_gold} G
                                      </Badge>
                                      <Badge className="bg-purple-400 text-purple-900 hover:bg-purple-500">
                                          {quest.reward_xp} XP
                                      </Badge>
                                    </div>
                                  </div>
                                  <p className="text-sm text-slate-600 mb-4">{quest.description}</p>
                                  <div className="flex gap-2 text-xs font-mono uppercase text-slate-400">
                                    <span className="px-2 py-1 bg-white rounded border">Condition: {quest.type}</span>
                                    <span className="px-2 py-1 bg-white rounded border">Target: {quest.target_minutes} min</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-8 text-slate-400 italic">
                                No quests available. Click the button to generate.
                            </div>
                          )}
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
                        <GachaPack
                          balance={coinBalance}
                          packCost={packCost}
                          canOpen={coinBalance >= packCost}
                          onSpend={handleSpendPack}
                          apiBase={apiBase}
                        />
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
                            : "bg-white border-slate-200 hover:bg-indigo-600 hover:shadow-md hover:-translate-y-0.5"
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
