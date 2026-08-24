import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Bell,
  ChevronRight,
  HelpCircle,
  Laptop,
  LogOut,
  Moon,
  Search,
  Sun,
  UserCog,
} from "lucide-react";
import { toast } from "sonner";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { roleLabel, useSession } from "@/context/session-context";
import { useTheme, type Theme } from "@/context/theme-context";
import { clusterName, stateName } from "@/data/mock-data";
import type { Role } from "@/types";
import { navItems } from "./app-sidebar";

export function AppHeader() {
  const { user, switchRole, signOut } = useSession();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;
  const segments = pathname.split("/").filter(Boolean);
  const current = navItems.find(
    (i) => pathname.startsWith(i.url) && i.roles.includes(user?.role ?? "ho"),
  );

  const ThemeIcon = theme === "system" ? Laptop : resolvedTheme === "dark" ? Moon : Sun;

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-card/85 backdrop-blur print:hidden">
      <div className="flex h-16 items-center gap-3 px-4">
        <SidebarTrigger className="text-muted-foreground" />

        <div className="min-w-0">
          <nav className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <Link to="/dashboard" className="hover:text-primary">
              ROOFI LMS
            </Link>
            {segments.map((s, i) => (
              <span key={s + i} className="flex items-center gap-1">
                <ChevronRight className="size-3" />
                <span className="capitalize">{s.replace(/-/g, " ")}</span>
              </span>
            ))}
          </nav>
          <h2 className="truncate text-sm font-semibold text-foreground">
            {current?.title ?? "Dashboard"}
          </h2>
        </div>

        <div className="relative ml-auto hidden w-72 lg:block">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search leads, customers, documents…"
            className="pl-9"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                navigate("/leads");
                toast.info("Showing lead results for your search");
              }
            }}
          />
        </div>

        {/* Theme Toggle Button */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Toggle theme">
              <ThemeIcon className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuLabel className="text-[11px] text-muted-foreground uppercase">
              Theme Mode
            </DropdownMenuLabel>
            <DropdownMenuRadioGroup value={theme} onValueChange={(v) => setTheme(v as Theme)}>
              <DropdownMenuRadioItem value="light" className="gap-2">
                <Sun className="size-3.5" /> Light
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="dark" className="gap-2">
                <Moon className="size-3.5" /> Dark
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="system" className="gap-2">
                <Laptop className="size-3.5" /> System
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant="ghost"
          size="icon"
          className="relative"
          onClick={() => navigate("/notifications")}
          aria-label="Notifications"
        >
          <Bell className="size-4" />
          <span className="absolute top-2 right-2 size-2 rounded-full bg-primary" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Help"
          onClick={() => toast.info("ROOFI LMS help centre — contact support@roofi.in")}
        >
          <HelpCircle className="size-4" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-full border border-border py-1 pr-3 pl-1 transition-colors hover:bg-accent cursor-pointer">
              <span className="grid size-7 place-items-center rounded-full brand-gradient text-xs font-bold text-primary-foreground">
                {user?.name.slice(0, 1)}
              </span>
              <span className="hidden text-left sm:block">
                <span className="block text-xs font-semibold text-foreground">{user?.name}</span>
                <span className="block text-[10px] text-muted-foreground">
                  {roleLabel[user?.role ?? "ho"]}
                </span>
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuLabel>
              <p className="text-sm font-semibold">{user?.name}</p>
              <p className="text-xs font-normal text-muted-foreground">
                {user?.clusterId
                  ? clusterName(user.clusterId)
                  : user?.stateId
                    ? stateName(user.stateId)
                    : "Head Office"}
              </p>
            </DropdownMenuLabel>
            {user?.role === "ho" && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-[11px] tracking-wide text-muted-foreground uppercase">
                  Demo role preview
                </DropdownMenuLabel>
                <DropdownMenuRadioGroup
                  value={user?.role ?? "ho"}
                  onValueChange={(v) => {
                    switchRole(v as Role);
                    navigate("/dashboard");
                    toast.success(`Switched to ${roleLabel[v as Role]} view`);
                  }}
                >
                  <DropdownMenuRadioItem value="ho">HO Admin</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="state">State HO / Admin</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="cluster">Cluster</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="gap-2">
                <ThemeIcon className="size-4" /> Theme:{" "}
                <span className="capitalize text-muted-foreground ml-auto">{theme}</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="w-36">
                <DropdownMenuRadioGroup value={theme} onValueChange={(v) => setTheme(v as Theme)}>
                  <DropdownMenuRadioItem value="light" className="gap-2">
                    <Sun className="size-3.5" /> Light
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="dark" className="gap-2">
                    <Moon className="size-3.5" /> Dark
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="system" className="gap-2">
                    <Laptop className="size-3.5" /> System
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuItem onSelect={() => navigate("/profile")}>
              <UserCog className="size-4" /> My Profile
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => {
                signOut();
                navigate("/");
              }}
            >
              <LogOut className="size-4" /> Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
