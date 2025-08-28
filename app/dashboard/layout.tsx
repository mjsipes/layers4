import { Navbar } from "@/components/ui/navbar";
import { ChatProvider } from "@/components/chat-context";
import AppHooks from "@/components/AppHooks";
import { ViewportHeightProvider } from "@/components/ViewportHeightProvider";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ChatProvider>
      <main className="h-screen-dynamic w-screen flex flex-col items-center">
        <ViewportHeightProvider />
        <AppHooks />
        <div className="flex-1 w-full flex flex-col items-center">
          <Navbar showDashboardButton={false} />
          <div className="flex-1 w-full">{children}</div>
        </div>
      </main>
    </ChatProvider>
  );
}
