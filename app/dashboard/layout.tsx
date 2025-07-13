import { Navbar } from "@/components/ui/navbar";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="h-screen w-screen flex flex-col items-center">
      <div className="flex-1 w-full flex flex-col items-center">
        <Navbar showDashboardButton={false} />
        <div className="flex-1 w-full">{children}</div>
      </div>
    </main>
  );
}
