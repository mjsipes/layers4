import { EnvVarWarning } from "@/components/auth/env-var-warning";
import { AuthButton } from "@/components/auth/auth-button";
import { ThemeSwitcher } from "@/components/ui/theme-switcher";
import { hasEnvVars } from "@/lib/utils";
import { Boxes } from "@/components/ui/background-boxes";

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
          <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16 bg-background/50 backdrop-blur-sm pointer-events-auto">
            <div className="w-full flex justify-between items-center p-3 px-5 text-sm">
              <div className="flex gap-5 items-center font-semibold">
                <h1 className="text-4xl font-extrabold tracking-tight text-primary">
                  Layers
                </h1>
              </div>
              <div className="flex flex-row gap-3 items-center">
                {!hasEnvVars ? <EnvVarWarning /> : <AuthButton />}
                <ThemeSwitcher />
              </div>
            </div>
          </nav>
          
          <div className="pointer-events-none">
              <h1 className="text-9xl font-extrabold tracking-tight text-primary text-center mb-6">
                Layers
              </h1>
              <h1 className="text-5xl font-bold tracking-tight text-foreground text-center">
                Not too hot, not too cold.
              </h1>
          </div>
        </div>
      </div>
    </main>
  );
}
