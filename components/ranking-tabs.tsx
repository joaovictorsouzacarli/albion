"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DpsRanking } from "@/components/dps-ranking"
import { HpsRanking } from "@/components/hps-ranking"

export function RankingTabs() {
  return (
    <Tabs defaultValue="dps" className="w-full">
      <TabsList className="grid w-full grid-cols-2 bg-black border border-amber-900/50">
        <TabsTrigger value="dps" className="data-[state=active]:bg-amber-400 data-[state=active]:text-black">
          TOP DPS
        </TabsTrigger>
        <TabsTrigger value="hps" className="data-[state=active]:bg-amber-400 data-[state=active]:text-black">
          TOP HPS
        </TabsTrigger>
      </TabsList>
      <TabsContent value="dps">
        <DpsRanking />
      </TabsContent>
      <TabsContent value="hps">
        <HpsRanking />
      </TabsContent>
    </Tabs>
  )
}

