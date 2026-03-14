import { PageTransition } from "@/components/layout/AppLayout";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export default function SettingsPage() {
  const { t, i18n } = useTranslation();

  const handleLanguageChange = (value: string) => {
    i18n.changeLanguage(value);
    localStorage.setItem("super_admin_lang", value);
  };

  return (
    <PageTransition>
      <div className="space-y-8 max-w-4xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#002626]">{t("Settings")}</h1>
          <p className="text-muted-foreground mt-2">{t("Language Configuration")}</p>
        </div>

        <Card className="glass-card border-black/5">
          <CardHeader>
            <CardTitle>{t("Language Settings")}</CardTitle>
            <CardDescription>{t("Choose your preferred language for the dashboard interface.")}</CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup
              defaultValue={localStorage.getItem("super_admin_lang") || i18n.language}
              onValueChange={handleLanguageChange}
              className="flex flex-col space-y-4 mt-2"
            >
              <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-black/[0.02] transition-colors border border-transparent hover:border-black/5 cursor-pointer">
                <RadioGroupItem value="ar" id="ar" />
                <Label htmlFor="ar" className="text-base cursor-pointer flex-1 font-medium">العربية</Label>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-black/[0.02] transition-colors border border-transparent hover:border-black/5 cursor-pointer">
                <RadioGroupItem value="en" id="en" />
                <Label htmlFor="en" className="text-base cursor-pointer flex-1 font-medium">English</Label>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-black/[0.02] transition-colors border border-transparent hover:border-black/5 cursor-pointer">
                <RadioGroupItem value="ur" id="ur" />
                <Label htmlFor="ur" className="text-base cursor-pointer flex-1 font-medium">اردو</Label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}
