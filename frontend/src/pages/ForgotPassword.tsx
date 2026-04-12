import { useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Pill, ArrowLeft, ArrowRight, CheckCircle } from "lucide-react";
import { toast } from "sonner";

export default function ForgotPassword() {
  const { t, isRTL } = useLanguage();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSent(true);
      toast.success(t("resetEmailSent"));
    }, 800);
  };

  const BackArrow = isRTL ? ArrowRight : ArrowLeft;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-pharma-lg border-0">
        <CardHeader className="text-center space-y-3 pb-2">
          <div className="mx-auto h-14 w-14 rounded-2xl gradient-primary flex items-center justify-center shadow-pharma-md">
            {sent ? (
              <CheckCircle className="h-7 w-7 text-primary-foreground" />
            ) : (
              <Pill className="h-7 w-7 text-primary-foreground" />
            )}
          </div>
          <CardTitle className="text-2xl font-bold">
            {sent ? t("checkYourEmail") : t("forgotPassword")}
          </CardTitle>
          <CardDescription>
            {sent ? t("resetEmailSentDesc") : t("forgotPasswordDesc")}
          </CardDescription>
        </CardHeader>

        {!sent ? (
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t("email")}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@pharmasys.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-3">
              <Button type="submit" className="w-full gradient-primary text-primary-foreground" disabled={loading}>
                {loading ? t("loading") : t("sendResetLink")}
              </Button>
            </CardFooter>
          </form>
        ) : (
          <CardFooter className="pt-0">
            <Button variant="outline" className="w-full" onClick={() => setSent(false)}>
              {t("tryAnotherEmail")}
            </Button>
          </CardFooter>
        )}

        <div className="px-6 pb-6 text-center">
          <Link to="/login" className="text-sm text-primary hover:underline inline-flex items-center gap-1">
            <BackArrow className="h-3 w-3" />
            {t("backToLogin")}
          </Link>
        </div>
      </Card>
    </div>
  );
}
