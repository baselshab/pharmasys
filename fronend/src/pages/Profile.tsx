import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { useLanguage } from "@/i18n/LanguageProvider";
import { useDatabase } from "@/db/DatabaseProvider";
import { saveDatabase } from "@/db/sqlite";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { User, Lock, Eye, EyeOff } from "lucide-react";
import { z } from "zod";

const profileSchema = z.object({
  full_name: z.string().trim().min(1, "Name is required").max(200),
  email: z.string().email("Invalid email"),
  phone: z.string().max(20).optional().default(""),
});

const passwordSchema = z.object({
  current_password: z.string().min(1, "Current password is required"),
  new_password: z.string().min(6, "Password must be at least 6 characters"),
  confirm_password: z.string().min(1, "Please confirm your password"),
}).refine((d) => d.new_password === d.confirm_password, {
  message: "Passwords do not match",
  path: ["confirm_password"],
});

export default function Profile() {
  const { t } = useLanguage();
  const { db } = useDatabase();

  // Load current user (simulated — user-001)
  const [fullName, setFullName] = useState("Admin User");
  const [email, setEmail] = useState("admin@pharmapos.com");
  const [phone, setPhone] = useState("");
  const [profileErrors, setProfileErrors] = useState<Record<string, string>>({});

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});

  const handleSaveProfile = () => {
    const result = profileSchema.safeParse({ full_name: fullName, email, phone });
    if (!result.success) {
      const errs: Record<string, string> = {};
      result.error.errors.forEach((e) => { errs[e.path[0] as string] = e.message; });
      setProfileErrors(errs);
      return;
    }
    setProfileErrors({});
    if (db) {
      try {
        db.run("UPDATE users SET full_name=?, email=?, phone=?, updated_at=datetime('now') WHERE id='user-001'",
          [fullName, email, phone || null]);
        saveDatabase(db);
      } catch {}
    }
    toast.success(t("settingsSaved"));
  };

  const handleChangePassword = () => {
    const result = passwordSchema.safeParse({ current_password: currentPassword, new_password: newPassword, confirm_password: confirmPassword });
    if (!result.success) {
      const errs: Record<string, string> = {};
      result.error.errors.forEach((e) => { errs[e.path[0] as string] = e.message; });
      setPasswordErrors(errs);
      return;
    }
    setPasswordErrors({});
    // Simulated password change
    toast.success(t("passwordChanged"));
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <AppLayout title={t("profile")} subtitle={t("profileDesc")}>
      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile" className="gap-1.5"><User className="h-3.5 w-3.5" /> {t("profile")}</TabsTrigger>
          <TabsTrigger value="password" className="gap-1.5"><Lock className="h-3.5 w-3.5" /> {t("changePassword")}</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card className="card-pharma">
            <CardHeader>
              <CardTitle className="text-lg">{t("personalInfo")}</CardTitle>
              <CardDescription>{t("updateYourInfo")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 max-w-lg">
              <div className="space-y-1.5">
                <Label>{t("name")}</Label>
                <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
                {profileErrors.full_name && <p className="text-xs text-destructive">{profileErrors.full_name}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>{t("email")}</Label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                {profileErrors.email && <p className="text-xs text-destructive">{profileErrors.email}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>{t("phone")}</Label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              <Button onClick={handleSaveProfile} className="gradient-primary text-primary-foreground">{t("saveChanges")}</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="password">
          <Card className="card-pharma">
            <CardHeader>
              <CardTitle className="text-lg">{t("changePassword")}</CardTitle>
              <CardDescription>{t("changePasswordDesc")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 max-w-lg">
              <div className="space-y-1.5">
                <Label>{t("currentPassword")}</Label>
                <div className="relative">
                  <Input type={showCurrent ? "text" : "password"} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
                  <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute inset-y-0 ltr:right-3 rtl:left-3 flex items-center text-muted-foreground">
                    {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {passwordErrors.current_password && <p className="text-xs text-destructive">{passwordErrors.current_password}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>{t("newPassword")}</Label>
                <div className="relative">
                  <Input type={showNew ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                  <button type="button" onClick={() => setShowNew(!showNew)} className="absolute inset-y-0 ltr:right-3 rtl:left-3 flex items-center text-muted-foreground">
                    {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {passwordErrors.new_password && <p className="text-xs text-destructive">{passwordErrors.new_password}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>{t("confirmPassword")}</Label>
                <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                {passwordErrors.confirm_password && <p className="text-xs text-destructive">{passwordErrors.confirm_password}</p>}
              </div>
              <Button onClick={handleChangePassword} className="gradient-primary text-primary-foreground">{t("changePassword")}</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
}
