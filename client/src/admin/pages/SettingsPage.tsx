import { PageTransition } from "../components/AdminLayout";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SettingsPage() {
  const { t } = useTranslation();

  return (
    <PageTransition>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#002626]">{t("School Settings")}</h1>
          <p className="text-muted-foreground mt-2">{t("Configure school details, pickup timings, and geofence")}</p>
        </div>

        <Card className="glass-card border-black/5">
          <CardHeader>
            <CardTitle>{t("General Settings")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] flex items-center justify-center border-2 border-dashed border-black/5 rounded-xl bg-black/[0.01]">
                <p className="text-muted-foreground">{t("Content for Settings coming soon...")}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}
