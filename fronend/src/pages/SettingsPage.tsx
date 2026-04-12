import { useState, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { useSettings } from "@/hooks/useSettings";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Building2, Receipt, Database, Trash2, Download, Save, Sun, Moon, Monitor, Palette, Languages } from "lucide-react";
import { toast } from "sonner";
import { useTheme } from "@/components/ThemeProvider";
import { useLanguage } from "@/i18n/LanguageProvider";

const SettingsPage = () => {
  const { settings, loading, saveSettings, exportData, resetData } = useSettings();
  const { theme, setTheme } = useTheme();
  const { t, locale, setLocale } = useLanguage();
  const [form, setForm] = useState(settings);

  useEffect(() => { setForm(settings); }, [settings]);

  const handleSave = () => {
    saveSettings(form);
    toast.success(t("settingsSaved"));
  };

  if (loading) return <AppLayout title={t("settings")} subtitle={t("configurePharmacy")}><p className="text-muted-foreground p-8">{t("loading")}</p></AppLayout>;

  return (
    <AppLayout title={t("settings")} subtitle={t("configurePharmacy")}>
      <Tabs defaultValue="pharmacy" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pharmacy">{t("pharmacy")}</TabsTrigger>
          <TabsTrigger value="appearance">{t("appearance")}</TabsTrigger>
          <TabsTrigger value="receipt">{t("receipt")}</TabsTrigger>
          <TabsTrigger value="data">{t("data")}</TabsTrigger>
        </TabsList>

        {/* Appearance */}
        <TabsContent value="appearance">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Palette className="h-5 w-5 text-primary" />
                  <CardTitle className="text-base">{t("appearance")}</CardTitle>
                </div>
                <CardDescription>{t("chooseTheme")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-3">
                  {([
                    { value: "light" as const, label: t("light"), icon: Sun },
                    { value: "dark" as const, label: t("dark"), icon: Moon },
                    { value: "system" as const, label: t("system"), icon: Monitor },
                  ]).map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      onClick={() => setTheme(value)}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                        theme === value ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
                      }`}
                    >
                      <Icon className={`h-6 w-6 ${theme === value ? "text-primary" : "text-muted-foreground"}`} />
                      <span className={`text-sm font-medium ${theme === value ? "text-primary" : "text-foreground"}`}>{label}</span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Languages className="h-5 w-5 text-primary" />
                  <CardTitle className="text-base">{t("language")}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {([
                    { value: "en" as const, label: "English" },
                    { value: "ar" as const, label: "العربية" },
                  ]).map(({ value, label }) => (
                    <button
                      key={value}
                      onClick={() => setLocale(value)}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                        locale === value ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
                      }`}
                    >
                      <span className={`text-lg font-semibold ${locale === value ? "text-primary" : "text-foreground"}`}>{label}</span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Pharmacy Profile */}
        <TabsContent value="pharmacy">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                <CardTitle className="text-base">{t("pharmacyProfile")}</CardTitle>
              </div>
              <CardDescription>{t("pharmacyProfileDesc")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="grid gap-1.5">
                  <Label>{t("pharmacyName")}</Label>
                  <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div className="grid gap-1.5">
                  <Label>{t("licenseNumber")}</Label>
                  <Input value={form.license_no} onChange={(e) => setForm({ ...form, license_no: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="grid gap-1.5">
                  <Label>{t("phone")}</Label>
                  <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                </div>
                <div className="grid gap-1.5">
                  <Label>{t("currency")}</Label>
                  <Select value={form.currency} onValueChange={(v) => setForm({ ...form, currency: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EGP">EGP — Egyptian Pound</SelectItem>
                      <SelectItem value="SAR">SAR — Saudi Riyal</SelectItem>
                      <SelectItem value="AED">AED — UAE Dirham</SelectItem>
                      <SelectItem value="USD">USD — US Dollar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-1.5">
                <Label>{t("address")}</Label>
                <Textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
              </div>
              <Separator />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="grid gap-1.5">
                  <Label>{t("taxRate")}</Label>
                  <Input type="number" min={0} max={100} step={0.5} value={form.tax_rate} onChange={(e) => setForm({ ...form, tax_rate: e.target.value })} />
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={handleSave} className="gap-2"><Save className="h-4 w-4" /> {t("saveChanges")}</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Receipt */}
        <TabsContent value="receipt">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Receipt className="h-5 w-5 text-primary" />
                <CardTitle className="text-base">{t("receiptCustomization")}</CardTitle>
              </div>
              <CardDescription>{t("receiptCustomDesc")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-1.5">
                <Label>{t("receiptHeader")}</Label>
                <Textarea placeholder={t("receiptHeaderPlaceholder")} value={form.receipt_header} onChange={(e) => setForm({ ...form, receipt_header: e.target.value })} />
              </div>
              <div className="grid gap-1.5">
                <Label>{t("receiptFooter")}</Label>
                <Textarea placeholder={t("receiptFooterPlaceholder")} value={form.receipt_footer} onChange={(e) => setForm({ ...form, receipt_footer: e.target.value })} />
              </div>
              <Separator />
              <Label className="text-xs text-muted-foreground">{t("preview")}</Label>
              <div className="border rounded-lg p-4 bg-muted/30 font-mono text-xs space-y-2 max-w-sm mx-auto">
                {form.receipt_header && <p className="text-center whitespace-pre-wrap">{form.receipt_header}</p>}
                <p className="text-center font-bold">{form.name || t("pharmacyName")}</p>
                {form.address && <p className="text-center text-muted-foreground">{form.address}</p>}
                {form.phone && <p className="text-center text-muted-foreground">Tel: {form.phone}</p>}
                <Separator />
                <p className="text-muted-foreground">{t("saleNumber")}: INV-0001</p>
                <p className="text-muted-foreground">{t("date")}: {new Date().toLocaleDateString()}</p>
                <Separator />
                <div className="flex justify-between"><span>Item Example x2</span><span>{form.currency} 50.00</span></div>
                <Separator />
                <div className="flex justify-between font-bold"><span>{t("total")}</span><span>{form.currency} 50.00</span></div>
                <Separator />
                {form.receipt_footer && <p className="text-center whitespace-pre-wrap text-muted-foreground">{form.receipt_footer}</p>}
              </div>
              <div className="flex justify-end">
                <Button onClick={handleSave} className="gap-2"><Save className="h-4 w-4" /> {t("saveChanges")}</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Data */}
        <TabsContent value="data">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-primary" />
                  <CardTitle className="text-base">{t("dataManagement")}</CardTitle>
                </div>
                <CardDescription>{t("dataManagementDesc")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">{t("exportDatabase")}</p>
                    <p className="text-sm text-muted-foreground">{t("exportDesc")}</p>
                  </div>
                  <Button variant="outline" onClick={() => { exportData(); toast.success(t("databaseExported")); }} className="gap-2">
                    <Download className="h-4 w-4" /> {t("export")}
                  </Button>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg border-destructive/30">
                  <div>
                    <p className="font-medium text-destructive">{t("resetAllData")}</p>
                    <p className="text-sm text-muted-foreground">{t("resetDesc")}</p>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" className="gap-2"><Trash2 className="h-4 w-4" /> {t("reset")}</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>{t("areYouSure")}</AlertDialogTitle>
                        <AlertDialogDescription>{t("resetWarning")}</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
                        <AlertDialogAction onClick={resetData} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                          {t("yesResetEverything")}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
};

export default SettingsPage;
