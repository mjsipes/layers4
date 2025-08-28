import { Navbar } from "@/components/ui/navbar";
import { ChatProvider } from "@/components/chat-context";
import AppHooks from "@/components/AppHooks";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ChatProvider>
      <main className="h-screen w-screen flex flex-col items-center">
        <AppHooks />
        <div className="flex-1 w-full flex flex-col items-center">
          <Navbar showDashboardButton={false} />
          <div className="flex-1 w-full">{children}</div>
        </div>
      </main>
    </ChatProvider>
  );
}
