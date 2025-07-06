import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import WeatherCard from "@/components/WeatherCard";
import RecomendationCard from "@/components/RecomendationCard";
import WardobeCard from "@/components/WardobeCard";
import ChatCard from "@/components/ChatCard";


export default async function ProtectedPage() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect("/auth/login");
  }

  return (
    <ResizablePanelGroup direction="horizontal" className="w-screen h-full">
      <ResizablePanel defaultSize={75}>
        <div className="flex flex-col h-full items-center ">
          <WeatherCard />
          <RecomendationCard />
          <WardobeCard />
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={25}>
          <ChatCard/>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
