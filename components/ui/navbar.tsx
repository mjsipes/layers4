import { AuthButton } from "@/components/auth/auth-button";
import { ThemeSwitcher } from "@/components/ui/theme-switcher";

interface NavbarProps {
  showDashboardButton?: boolean;
}

export function Navbar({ showDashboardButton = false }: NavbarProps) {
  return (
    <nav className="w-full flex justify-center border-b border-b-foreground/10 h-14 md:h-16 bg-background/50 backdrop-blur-sm pointer-events-auto">
      <div className="w-full flex justify-between items-center p-3 px-3 md:px-5 text-sm">
        <div className="flex gap-2 md:gap-5 items-center font-semibold">
          <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight text-primary">
            Layers
          </h1>
          <div className="hidden md:block">
            <ThemeSwitcher />
          </div>
        </div>
        <div className="flex flex-row gap-1 md:gap-3 items-center">
          <div className="block md:hidden">
            <ThemeSwitcher />
          </div>
          <AuthButton showDashboardButton={showDashboardButton} />
        </div>
      </div>
    </nav>
  );
} 