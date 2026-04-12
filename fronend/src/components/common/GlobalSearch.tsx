import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from '@/components/ui/command';
import {
  LayoutDashboard, Package, ShoppingCart, Users, Building2,
  BarChart3, Bell, Settings, Pill, FolderTree,
  CreditCard, Star, FileText, ClipboardList, Shield, Zap,
  Search, User, Home, Info, Phone, Globe, BookOpen
} from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageProvider';

interface SearchItem {
  label: string;
  labelEn: string;
  icon: typeof Search;
  href: string;
  group: 'dashboard' | 'admin' | 'public' | 'products' | 'drugs';
}

const dashboardPages: SearchItem[] = [
  { label: 'لوحة التحكم', labelEn: 'Dashboard', icon: LayoutDashboard, href: '/', group: 'dashboard' },

  { label: 'نقطة البيع', labelEn: 'POS', icon: Zap, href: '/pos', group: 'dashboard' },
  { label: 'المبيعات', labelEn: 'Sales', icon: ShoppingCart, href: '/sales', group: 'dashboard' },

  { label: 'المنتجات', labelEn: 'Products', icon: Package, href: '/products', group: 'dashboard' },
  { label: 'المخزون', labelEn: 'Inventory', icon: ClipboardList, href: '/inventory', group: 'dashboard' },

  { label: 'المشتريات', labelEn: 'Purchases', icon: CreditCard, href: '/purchases', group: 'dashboard' },

  { label: 'الموردون', labelEn: 'Suppliers', icon: Building2, href: '/suppliers', group: 'dashboard' },
  { label: 'العملاء', labelEn: 'Customers', icon: Users, href: '/customers', group: 'dashboard' },

  { label: 'الفروع', labelEn: 'Branches', icon: Building2, href: '/branches', group: 'dashboard' },
  { label: 'الفروع (نسخة 2)', labelEn: 'Branches V2', icon: Building2, href: '/branches2', group: 'dashboard' },

  { label: 'الموظفون', labelEn: 'Employees', icon: Users, href: '/employees', group: 'dashboard' },
  { label: 'الحضور والانصراف', labelEn: 'Attendance', icon: ClipboardList, href: '/attendance', group: 'dashboard' },

  { label: 'الأدوار والصلاحيات', labelEn: 'Roles & Permissions', icon: Shield, href: '/roles', group: 'dashboard' },

  { label: 'التقارير', labelEn: 'Reports', icon: BarChart3, href: '/reports', group: 'dashboard' },
  { label: 'تقارير التدقيق', labelEn: 'Audit Reports', icon: FileText, href: '/audit-reports', group: 'dashboard' },
  { label: 'سجل النشاطات', labelEn: 'Audit Log', icon: FileText, href: '/audit-log', group: 'dashboard' },

  { label: 'الإعدادات', labelEn: 'Settings', icon: Settings, href: '/settings', group: 'dashboard' },
  { label: 'الملف الشخصي', labelEn: 'Profile', icon: User, href: '/profile', group: 'dashboard' },
];

const adminPages: SearchItem[] = [
  { label: 'لوحة تحكم الإدارة', labelEn: 'Admin Dashboard', icon: LayoutDashboard, href: '/admin', group: 'admin' },
  { label: 'إدارة الصيدليات', labelEn: 'Manage Pharmacies', icon: Building2, href: '/admin/pharmacies', group: 'admin' },
  { label: 'إدارة المستخدمين', labelEn: 'Manage Users', icon: Users, href: '/admin/users', group: 'admin' },
  { label: 'إدارة الكتالوج', labelEn: 'Manage Catalog', icon: Pill, href: '/admin/catalog', group: 'admin' },
  { label: 'الأدوية المعلقة', labelEn: 'Pending Drugs', icon: Pill, href: '/admin/catalog/pending', group: 'admin' },
  { label: 'إدارة الاشتراكات', labelEn: 'Manage Subscriptions', icon: CreditCard, href: '/admin/subscriptions', group: 'admin' },
  { label: 'خطط الاشتراك', labelEn: 'Subscription Plans', icon: CreditCard, href: '/admin/subscriptions/plans', group: 'admin' },
  { label: 'المدونة (إدارة)', labelEn: 'Blog (Admin)', icon: FileText, href: '/admin/blog', group: 'admin' },
  { label: 'الملاحظات والشكاوى', labelEn: 'Feedback', icon: Star, href: '/admin/feedback', group: 'admin' },
  { label: 'تحليلات المنصة', labelEn: 'Analytics', icon: BarChart3, href: '/admin/analytics', group: 'admin' },
  { label: 'سجلات التدقيق', labelEn: 'Audit Logs', icon: FileText, href: '/admin/audit-logs', group: 'admin' },
];

const publicPages: SearchItem[] = [
  { label: 'الرئيسية', labelEn: 'Home', icon: Home, href: '/', group: 'public' },
  { label: 'عن المنصة', labelEn: 'About', icon: Info, href: '/about', group: 'public' },
  { label: 'اتصل بنا', labelEn: 'Contact', icon: Phone, href: '/contact', group: 'public' },
  { label: 'خطط الأسعار', labelEn: 'Pricing', icon: CreditCard, href: '/subscription-plans', group: 'public' },
  { label: 'المدونة', labelEn: 'Blog', icon: BookOpen, href: '/blog', group: 'public' },
  { label: 'دليل الصيدليات', labelEn: 'Pharmacies', icon: Globe, href: '/pharmacies', group: 'public' },
];

const mockProducts: SearchItem[] = [
  { label: 'باراسيتامول 500mg', labelEn: 'Paracetamol 500mg', icon: Package, href: '/products/1', group: 'products' },
  { label: 'أموكسيسيلين 250mg', labelEn: 'Amoxicillin 250mg', icon: Package, href: '/products/2', group: 'products' },
  { label: 'إيبوبروفين 400mg', labelEn: 'Ibuprofen 400mg', icon: Package, href: '/products/3', group: 'products' },
];

const mockDrugs: SearchItem[] = [
  { label: 'باراسيتامول', labelEn: 'Paracetamol', icon: Pill, href: '/catalog/1', group: 'drugs' },
  { label: 'أموكسيسيلين', labelEn: 'Amoxicillin', icon: Pill, href: '/catalog/2', group: 'drugs' },
  { label: 'إيبوبروفين', labelEn: 'Ibuprofen', icon: Pill, href: '/catalog/3', group: 'drugs' },
  { label: 'أوميبرازول', labelEn: 'Omeprazole', icon: Pill, href: '/catalog/4', group: 'drugs' },
];

const allItems = [...dashboardPages, ...adminPages, ...publicPages, ...mockProducts, ...mockDrugs];

const GlobalSearch = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const {locale: language} = useLanguage();
  // console.log('Current language in GlobalSearch:', language);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const handleSelect = useCallback((href: string) => {
    setOpen(false);
    navigate(href);
  }, [navigate]);

  const getLabel = (item: SearchItem) => language === 'ar' ? item.label : item.labelEn;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-muted/50 hover:bg-muted text-muted-foreground text-sm transition-colors"
      >
        <Search className="w-4 h-4" />
        <span className="hidden md:inline">
          {language === 'ar' ? 'بحث...' : 'Search...'}
        </span>
        <kbd className="hidden md:inline-flex h-5 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder={language === 'ar' ? 'ابحث في الصفحات والمنتجات والأدوية...' : 'Search pages, products, drugs...'} />
        <CommandList>
          <CommandEmpty>
            {language === 'ar' ? 'لا توجد نتائج.' : 'No results found.'}
          </CommandEmpty>

          <CommandGroup heading={language === 'ar' ? 'صفحات لوحة التحكم' : 'Dashboard Pages'}>
            {dashboardPages.map((item) => (
              <CommandItem key={item.href} onSelect={() => handleSelect(item.href)} className="gap-3 cursor-pointer">
                <item.icon className="w-4 h-4 text-muted-foreground" />
                <span>{getLabel(item)}</span>
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading={language === 'ar' ? 'المنتجات' : 'Products'}>
            {mockProducts.map((item) => (
              <CommandItem key={item.href} onSelect={() => handleSelect(item.href)} className="gap-3 cursor-pointer">
                <item.icon className="w-4 h-4 text-muted-foreground" />
                <span>{getLabel(item)}</span>
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading={language === 'ar' ? 'الكتالوج الدوائي' : 'Drug Catalog'}>
            {mockDrugs.map((item) => (
              <CommandItem key={item.href} onSelect={() => handleSelect(item.href)} className="gap-3 cursor-pointer">
                <item.icon className="w-4 h-4 text-muted-foreground" />
                <span>{getLabel(item)}</span>
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading={language === 'ar' ? 'لوحة الإدارة' : 'Admin Panel'}>
            {adminPages.map((item) => (
              <CommandItem key={item.href} onSelect={() => handleSelect(item.href)} className="gap-3 cursor-pointer">
                <item.icon className="w-4 h-4 text-muted-foreground" />
                <span>{getLabel(item)}</span>
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading={language === 'ar' ? 'صفحات عامة' : 'Public Pages'}>
            {publicPages.map((item) => (
              <CommandItem key={item.href} onSelect={() => handleSelect(item.href)} className="gap-3 cursor-pointer">
                <item.icon className="w-4 h-4 text-muted-foreground" />
                <span>{getLabel(item)}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
};

export default GlobalSearch;
