import { Bell, Package, CreditCard, ShoppingCart, UserPlus, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/i18n/LanguageProvider';

const typeConfig: Record<string, { icon: typeof Bell; color: string }> = {
  low_stock: { icon: Package, color: 'text-warning bg-warning/10' },
  subscription_expiry: { icon: CreditCard, color: 'text-destructive bg-destructive/10' },
  sale_created: { icon: ShoppingCart, color: 'text-success bg-success/10' },
  user_invited: { icon: UserPlus, color: 'text-info bg-info/10' },
  drug_approved: { icon: CheckCircle, color: 'text-success bg-success/10' },
};

const mockNotifications = [
  { id: '1', type: 'low_stock', title: 'مخزون منخفض', body: 'باراسيتامول 500mg وصل للحد الأدنى', isRead: false, createdAt: 'منذ 10 دقائق' },
  { id: '2', type: 'sale_created', title: 'عملية بيع جديدة', body: 'فاتورة INV-2026-025 بقيمة ₪ 85.00', isRead: false, createdAt: 'منذ 30 دقيقة' },
  { id: '3', type: 'subscription_expiry', title: 'اشتراكك ينتهي', body: 'ينتهي اشتراكك بعد 7 أيام', isRead: true, createdAt: 'منذ ساعتين' },
  { id: '4', type: 'user_invited', title: 'دعوة موظف', body: 'تم قبول دعوة فاطمة خالد', isRead: true, createdAt: 'منذ يوم' },
];

const NotificationsDropdown = () => {
  const { t } = useLanguage();
  const unreadCount = mockNotifications.filter((n) => !n.isRead).length;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="relative p-2 rounded-lg hover:bg-muted">
          <Bell className="w-5 h-5 text-muted-foreground" />
          {unreadCount > 0 && (
            <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-destructive rounded-full text-[10px] text-destructive-foreground flex items-center justify-center font-bold">
              {unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-80 p-0"
        align="end"
        sideOffset={8}
      >
        <div className="p-3 border-b border-border flex items-center justify-between">
          <h3 className="font-bold text-sm">{t('notificationsTitle')}</h3>
          <button className="text-xs text-primary hover:underline">{t('notificationsMarkAllRead')}</button>
        </div>

        <div className="max-h-[320px] overflow-y-auto">
          {mockNotifications.map((n) => {
            const config = typeConfig[n.type] || { icon: Bell, color: 'text-muted-foreground bg-muted' };
            const Icon = config.icon;
            return (
              <div
                key={n.id}
                className={`flex items-start gap-3 p-3 hover:bg-muted/30 cursor-pointer transition-colors border-b border-border last:border-0 ${
                  !n.isRead ? 'bg-primary/[0.02]' : ''
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${config.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold truncate">{n.title}</span>
                    {!n.isRead && <span className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0" />}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{n.body}</p>
                  <span className="text-[10px] text-muted-foreground">{n.createdAt}</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-2 border-t border-border">
          <Button variant="ghost" size="sm" className="w-full text-xs" asChild>
            <Link to="/dashboard/notifications">{t('notificationsViewAll')}</Link>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationsDropdown;
