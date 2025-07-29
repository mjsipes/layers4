import { Navbar } from "@/components/ui/navbar";
import Script from "next/script";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="h-screen w-screen flex flex-col items-center">
      <div className="flex-1 w-full flex flex-col items-center">
        <Navbar showDashboardButton={false} />
        {/* <Script
          src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`}
          strategy="beforeInteractive"
        /> */}
        <div className="flex-1 w-full">{children}</div>
      </div>
    </main>
  );
}
