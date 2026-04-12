import { User, LogOut, Settings, HelpCircle, Edit, Lock } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageProvider";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function HeaderProfileMenu() {
  const { t, locale: language } = useLanguage();
  const navigate = useNavigate();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 rounded-full hover:bg-muted/60 p-0.5 transition-colors focus:outline-none focus:ring-2 focus:ring-ring">
          <Avatar className="h-8 w-8 border-2 border-primary/20">
            <AvatarImage src={"https://res.cloudinary.com/obada-cloud/image/upload/v1758809661/satrco/uploads/liahsg9wjoe5onasghn7.jpg"} alt={"عبادة يحيى"} />
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
              <User className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
          <div className="hidden md:block text-right">
            <p className="text-sm font-medium">عبادة يحيى</p>
            <p className="text-xs text-muted-foreground">المالك</p>
          </div>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium">{t("pharmacyName")}</p>
            <p className="text-xs text-muted-foreground">admin@pharmasys.com</p>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        {/* Profile */}
        <DropdownMenuItem
          onClick={() => navigate("/profile")}
          className="cursor-pointer"
        >
          <User className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
          {language === "ar" ? "ملفي الشخصي" : "My Profile"}
        </DropdownMenuItem>

        {/* Edit Profile */}
        <DropdownMenuItem
          onClick={() => navigate("/profile/edit")}
          className="cursor-pointer"
        >
          <Edit className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
          {language === "ar" ? "تعديل الملف الشخصي" : "Update My Profile"}
        </DropdownMenuItem>

        {/* Change Password */}
        <DropdownMenuItem
          onClick={() => navigate("/profile/change-password")}
          className="cursor-pointer"
        >
          <Lock className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
          {language === "ar" ? "تغيير كلمة المرور" : "Change Password"}
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Settings */}
        <DropdownMenuItem
          onClick={() => navigate("/settings")}
          className="cursor-pointer"
        >
          <Settings className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
          {t("settings")}
        </DropdownMenuItem>

        <DropdownMenuItem className="cursor-pointer">
          <HelpCircle className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
          {t("help")}
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Logout */}
        <DropdownMenuItem
          onClick={() => navigate("/login")}
          className="cursor-pointer text-destructive focus:text-destructive"
        >
          <LogOut className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
          {language === "ar" ? "تسجيل الخروج" : "Logout"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}