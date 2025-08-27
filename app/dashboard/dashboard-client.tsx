"use client";
import { useState, useEffect } from "react";
import { MessageSquare, Calendar, Grid } from "lucide-react";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import WardobeCard from "@/components/Wardrobe";
import Chat from "@/components/Chat";
import DynamicCard from "@/components/Dynamic";

type ActiveView = "chat" | "dynamic" | "wardrobe";

export default function DashboardClient() {
  const [activeView, setActiveView] = useState<ActiveView>("dynamic");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const renderMobileView = () => (
    <div className="flex flex-col h-full">
      {/* Main content area */}
      <div className="flex-1 overflow-hidden">
        {activeView === "chat" && <Chat />}
        {activeView === "dynamic" && <DynamicCard />}
        {activeView === "wardrobe" && <WardobeCard />}
      </div>

      {/* Bottom hamburger menu */}
      <div className="border-t bg-background p-2">
        <div className="flex justify-around items-center">
          <button
            onClick={() => setActiveView("chat")}
            className={`flex items-center justify-center p-2 rounded-sm transition-colors ${
              activeView === "chat"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <MessageSquare size={20} />
          </button>

          <button
            onClick={() => setActiveView("dynamic")}
            className={`flex items-center justify-center p-2 rounded-sm transition-colors ${
              activeView === "dynamic"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Calendar size={20} />
          </button>

          <button
            onClick={() => setActiveView("wardrobe")}
            className={`flex items-center justify-center p-2 rounded-sm transition-colors ${
              activeView === "wardrobe"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Grid size={20} />
          </button>
        </div>
      </div>
    </div>
  );

  const renderDesktopView = () => (
    <ResizablePanelGroup direction="horizontal" className="w-screen h-full">
      <ResizablePanel defaultSize={30}>
        <Chat />
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={70}>
        <div className="w-full h-full grid grid-cols-2">
          <div className="border-r">
            <DynamicCard />
          </div>
          <WardobeCard />
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );

  return isMobile ? renderMobileView() : renderDesktopView();
}
