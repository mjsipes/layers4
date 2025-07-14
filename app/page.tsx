import { Boxes } from "@/components/ui/background-boxes";
import { Navbar } from "@/components/ui/navbar";

export default function Home() {
  return (
    <main className="min-h-screen relative overflow-hidden">
      {/* Background boxes with proper layering */}
      <div className="absolute inset-0 w-full h-full">
        <Boxes />
      </div>
      
      {/* Content layer */}
      <div className="relative z-20 flex flex-col items-center min-h-screen pointer-events-none">
        <div className="flex-1 w-full flex flex-col gap-20 items-center">
          <Navbar showDashboardButton={true} />
          
          <div className="pointer-events-none">
              <h1 className="text-9xl font-extrabold tracking-tight text-primary text-center mb-6">
                Layers
              </h1>
              <h1 className="text-5xl font-bold tracking-tight text-foreground text-center">
                AI integrated wardrobe.
                So you never dress too hot or too cold.
              </h1>
              </div>
        </div>
      </div>
    </main>
  );
}
