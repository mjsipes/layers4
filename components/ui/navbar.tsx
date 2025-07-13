import { AuthButton } from "@/components/auth/auth-button";
import { ThemeSwitcher } from "@/components/ui/theme-switcher";

interface NavbarProps {
  showDashboardButton?: boolean;
}

export function Navbar({ showDashboardButton = false }: NavbarProps) {
  return (
    <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16 bg-background/50 backdrop-blur-sm pointer-events-auto">
      <div className="w-full flex justify-between items-center p-3 px-5 text-sm">
        <div className="flex gap-5 items-center font-semibold">
          <h1 className="text-4xl font-extrabold tracking-tight text-primary">
            Layers
          </h1>
          <ThemeSwitcher />
        </div>
        <div className="flex flex-row gap-3 items-center">
          <AuthButton showDashboardButton={showDashboardButton} />
        </div>
      </div>
    </nav>
  );
} 