import {
  LayoutDashboard,
  ShoppingCart,
  Receipt,
  Package,
  Boxes,
  ClipboardList,
  Users,
  Truck,
  BarChart3,
  Settings,
  Building2,
  Shield,
  UsersRound,
  Pill,
  Sun,
  Moon,
  Monitor,
  Languages,
  ClipboardCheck,
  UserCheck,
  ScrollText,
  type LucideIcon,
} from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { useLanguage } from "@/i18n/LanguageProvider";

import { Button } from "@/components/ui/button";
import { NavLink } from "@/components/NavLink";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { SyncStatusBadge } from "@/components/SyncStatusBadge";
import type { TranslationKey } from "@/i18n/translations";

interface NavItem {
  titleKey: TranslationKey;
  url: string;
  icon: LucideIcon;
}

const mainNav: NavItem[] = [
  { titleKey: "dashboard", url: "/", icon: LayoutDashboard },
  { titleKey: "pos", url: "/pos", icon: ShoppingCart },
  { titleKey: "sales", url: "/sales", icon: Receipt },
];

const inventoryNav: NavItem[] = [
  { titleKey: "products", url: "/products", icon: Package },
  { titleKey: "inventoryPage", url: "/inventory", icon: Boxes },
];

const operationsNav: NavItem[] = [
  { titleKey: "purchases", url: "/purchases", icon: ClipboardList },
  { titleKey: "suppliers", url: "/suppliers", icon: Truck },
  { titleKey: "customers", url: "/customers", icon: Users },
];

const managementNav: NavItem[] = [
  { titleKey: "branches", url: "/branches", icon: Building2 },
  { titleKey: "employees", url: "/employees", icon: UsersRound },
  { titleKey: "rolesPermissions", url: "/roles", icon: Shield },
  { titleKey: "attendance", url: "/attendance", icon: UserCheck },
];

const insightsNav: NavItem[] = [
  { titleKey: "reports", url: "/reports", icon: BarChart3 },
  { titleKey: "auditReports", url: "/audit-reports", icon: ClipboardCheck },
  { titleKey: "auditLog", url: "/audit-log", icon: ScrollText },
  { titleKey: "settings", url: "/settings", icon: Settings },
];

function NavGroup({ label, items, collapsed }: { label: string; items: NavItem[]; collapsed: boolean }) {
  const { t } = useLanguage();

  return (
    <SidebarGroup>
      {!collapsed && <SidebarGroupLabel className="text-sidebar-foreground/50 uppercase text-[10px] tracking-widest font-semibold">{label}</SidebarGroupLabel>}
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.titleKey}>
              <SidebarMenuButton asChild>
                <NavLink
                  to={item.url}
                  end={item.url === "/"}
                  className="text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
                  activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                >
                  <item.icon className="h-4 w-4 shrink-0 ltr:mr-2 rtl:ml-2" />
                  {!collapsed && <span>{t(item.titleKey)}</span>}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

function ThemeToggle({ collapsed }: { collapsed: boolean }) {
  const { theme, setTheme, resolved } = useTheme();
  const { t } = useLanguage();
  const next = () => {
    const order: Array<"light" | "dark" | "system"> = ["light", "dark", "system"];
    const idx = order.indexOf(theme);
    setTheme(order[(idx + 1) % 3]);
  };
  const Icon = theme === "system" ? Monitor : resolved === "dark" ? Moon : Sun;
  const label = theme === "system" ? t("system") : resolved === "dark" ? t("dark") : t("light");

  return (
    <Button variant="ghost" size="sm" onClick={next} className="w-full justify-start gap-2 text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground h-8 px-2">
      <Icon className="h-4 w-4 shrink-0" />
      {!collapsed && <span className="text-xs">{label}</span>}
    </Button>
  );
}

function LanguageToggle({ collapsed }: { collapsed: boolean }) {
  const { locale, setLocale } = useLanguage();
  const toggle = () => setLocale(locale === "en" ? "ar" : "en");

  return (
    <Button variant="ghost" size="sm" onClick={toggle} className="w-full justify-start gap-2 text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground h-8 px-2">
      <Languages className="h-4 w-4 shrink-0" />
      {!collapsed && <span className="text-xs">{locale === "en" ? "العربية" : "English"}</span>}
    </Button>
  );
}

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { t, isRTL } = useLanguage();

  return (
    <Sidebar collapsible="icon" side={isRTL ? "right" : "left"} className="border-r-0" style={{ background: "var(--gradient-sidebar)" }}>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center shrink-0">
            <Pill className="h-4 w-4 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div>
              <h2 className="text-sm font-bold text-sidebar-accent-foreground font-display">{t("appName")}</h2>
              <p className="text-[10px] text-sidebar-foreground/50">{t("managementSystem")}</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <NavGroup label={t("overview")} items={mainNav} collapsed={collapsed} />
        <NavGroup label={t("inventory")} items={inventoryNav} collapsed={collapsed} />
        <NavGroup label={t("operations")} items={operationsNav} collapsed={collapsed} />
        <NavGroup label={t("management")} items={managementNav} collapsed={collapsed} />
        <NavGroup label={t("insights")} items={insightsNav} collapsed={collapsed} />
      </SidebarContent>

      <SidebarFooter className="p-3 space-y-2">
        <LanguageToggle collapsed={collapsed} />
        <ThemeToggle collapsed={collapsed} />
        <SyncStatusBadge collapsed={collapsed} />
      </SidebarFooter>
    </Sidebar>
  );
}
