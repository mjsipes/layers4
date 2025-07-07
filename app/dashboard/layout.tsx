import { EnvVarWarning } from "@/components/auth/env-var-warning";
import { AuthButton } from "@/components/auth/auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { hasEnvVars } from "@/lib/utils";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="h-screen w-screen flex flex-col items-center">
      <div className="flex-1 w-full flex flex-col items-center">
        <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
          <div className="w-full flex justify-between items-center p-3 px-5 text-sm">
            <h1 className="text-4xl font-extrabold tracking-tight text-primary">
              Layers
            </h1>
            <div className="flex flex-row items-center gap-3">
              <AuthButton />
              <ThemeSwitcher />
            </div>
          </div>
        </nav>
        <div className="flex-1 w-full">{children}</div>
      </div>
    </main>
  );
}
