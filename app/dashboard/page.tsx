import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import WardobeCard from "@/components/Wardrobe";
import Chat from "@/components/Chat";
import DynamicCard from "@/components/Dynamic";
import WeatherCard from "@/components/Weather";
import { Separator } from "@/components/ui/separator";
import RecommendationCard from "@/components/RecomendationCard";

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect("/auth/login");
  }

  return (
    <ResizablePanelGroup direction="horizontal" className="w-screen h-full">
      <ResizablePanel defaultSize={30}>
        <Chat />
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={70}>
        <div className="w-full h-full grid grid-cols-2">
          <div className="flex flex-col h-full items-center border-r">
            <DynamicCard />
          </div>
          <WardobeCard />
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
