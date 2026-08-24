import { Link, useLocation } from "react-router-dom";
import {
  BarChart3,
  Bell,
  Building2,
  FileSpreadsheet,
  FileText,
  FolderOpen,
  LayoutDashboard,
  Map,
  Receipt,
  ScrollText,
  Settings,
  Settings2,
  Share2,
  UserCircle,
  UserPlus,
  Users,
  UsersRound,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { RoofiLogo } from "@/components/common/brand";
import { roleLabel, useSession } from "@/context/session-context";
import { clusterName, stateName } from "@/data/mock-data";
import type { Role } from "@/types";
import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

interface NavItem {
  title: string;
  url: string;
  icon: LucideIcon;
  roles: Role[];
  group: string;
}

export const navItems: NavItem[] = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
    roles: ["ho", "state", "cluster"],
    group: "Overview",
  },
  { title: "Leads", url: "/leads", icon: Users, roles: ["ho", "state"], group: "Sales" },
  { title: "My Leads", url: "/leads", icon: Users, roles: ["cluster"], group: "Sales" },
  {
    title: "Lead Assignment",
    url: "/assignments",
    icon: Share2,
    roles: ["ho", "state"],
    group: "Sales",
  },
  {
    title: "Customers",
    url: "/customers",
    icon: UserCircle,
    roles: ["ho", "state", "cluster"],
    group: "Sales",
  },
  {
    title: "Quotations",
    url: "/quotations",
    icon: FileText,
    roles: ["ho", "state", "cluster"],
    group: "Documents",
  },
  {
    title: "Invoices",
    url: "/proforma-invoices",
    icon: FileSpreadsheet,
    roles: ["ho", "state", "cluster"],
    group: "Documents",
  },
  { title: "States", url: "/states", icon: Map, roles: ["ho"], group: "Network" },
  {
    title: "Clusters",
    url: "/clusters",
    icon: Building2,
    roles: ["ho", "state"],
    group: "Network",
  },
  {
    title: "Materials",
    url: "/materials",
    icon: FolderOpen,
    roles: ["ho", "state", "cluster"],
    group: "Resources",
  },
  {
    title: "Reports",
    url: "/reports",
    icon: BarChart3,
    roles: ["ho", "state", "cluster"],
    group: "Resources",
  },
  {
    title: "Users",
    url: "/users",
    icon: UsersRound,
    roles: ["ho", "state"],
    group: "Administration",
  },
  {
    title: "Create User",
    url: "/users/create",
    icon: UserPlus,
    roles: ["ho", "state"],
    group: "Administration",
  },
  {
    title: "Quotation Settings",
    url: "/quotations/settings",
    icon: Settings,
    roles: ["ho"],
    group: "Administration",
  },
  {
    title: "Network & Roles Setup",
    url: "/network/setup",
    icon: Settings2,
    roles: ["ho"],
    group: "Administration",
  },
  {
    title: "Activity Logs",
    url: "/activity-logs",
    icon: ScrollText,
    roles: ["ho"],
    group: "Administration",
  },
  { title: "Settings", url: "/settings", icon: Settings, roles: ["ho"], group: "Administration" },
  {
    title: "Notifications",
    url: "/notifications",
    icon: Bell,
    roles: ["state", "cluster"],
    group: "Account",
  },
  {
    title: "Profile",
    url: "/profile",
    icon: UserCircle,
    roles: ["ho", "state", "cluster"],
    group: "Account",
  },
];

export function AppSidebar() {
  const { user } = useSession();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const pathname = location.pathname;
  const role = user?.role ?? "ho";
  const items = navItems.filter((i) => i.roles.includes(role));
  const groups = [...new Set(items.map((i) => i.group))];

  const isActive = (url: string) => pathname === url || pathname.startsWith(url + "/");

  return (
    <Sidebar collapsible="icon" className="border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border px-3 py-4">
        {collapsed ? (
          <RoofiLogo
            size="sm"
            invert
            showTagline={false}
            className="justify-center [&>div]:hidden"
          />
        ) : (
          <RoofiLogo invert />
        )}
      </SidebarHeader>

      <SidebarContent className="px-1">
        {groups.map((group) => (
          <SidebarGroup key={group}>
            {!collapsed && (
              <SidebarGroupLabel className="text-[10px] tracking-[0.14em] text-sidebar-foreground/45 uppercase">
                {group}
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu>
                {items
                  .filter((i) => i.group === group)
                  .map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={item.title}>
                        <Link to={item.url} className="flex items-center gap-2.5">
                          <item.icon className="size-4" />
                          {!collapsed && <span className="truncate">{item.title}</span>}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-3">
        <div className={cn("flex items-center gap-2.5", collapsed && "justify-center")}>
          <span className="grid size-8 shrink-0 place-items-center rounded-full brand-gradient text-xs font-bold text-primary-foreground">
            {user?.name.slice(0, 1) ?? "R"}
          </span>
          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-sidebar-foreground">{user?.name}</p>
              <p className="truncate text-[11px] text-sidebar-foreground/55">
                {roleLabel[role]}
                {user?.clusterId
                  ? ` · ${clusterName(user.clusterId)}`
                  : user?.stateId
                    ? ` · ${stateName(user.stateId)}`
                    : ""}
              </p>
            </div>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
