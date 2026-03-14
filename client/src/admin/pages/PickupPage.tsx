import { PageTransition } from "../components/AdminLayout";
import { useTranslation } from "react-i18next";
import { useAdminPickupActive } from "../hooks/use-admin-api";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Phone, User, Clock, MapPin } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const COLUMNS = [
  { id: "CREATED", label: "Requested", color: "bg-blue-500", light: "bg-blue-50" },
  { id: "ARRIVED", label: "Arrived", color: "bg-amber-500", light: "bg-amber-50" },
  { id: "CHILD_PREPARING", label: "Preparing", color: "bg-purple-500", light: "bg-purple-50" },
  { id: "SECURITY_VERIFICATION", label: "Verified", color: "bg-green-500", light: "bg-green-50" },
  { id: "DELIVERED", label: "Delivered", color: "bg-emerald-600", light: "bg-emerald-50" },
];

const STATUS_MAP: Record<string, string> = {
    'CREATED': 'CREATED',
    'ARRIVED': 'ARRIVED',
    'CHILD_PREPARING': 'CHILD_PREPARING',
    'SECURITY_VERIFICATION': 'SECURITY_VERIFICATION',
    'HANDED_TO_PARENT': 'DELIVERED',
    'HANDED_TO_DELEGATE': 'DELIVERED',
    'DELIVERED': 'DELIVERED'
};

export default function PickupPage() {
  const { t } = useTranslation();
  const { data: pickups, isLoading } = useAdminPickupActive();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-[#002626]" />
      </div>
    );
  }

  const grouped = COLUMNS.reduce((acc, col) => {
    acc[col.id] = (pickups || []).filter((p: any) => STATUS_MAP[p.status] === col.id);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <PageTransition className="flex flex-col h-full -m-8">
      <div className="p-8 pb-4">
        <h1 className="text-3xl font-bold tracking-tight text-[#002626]">{t("Pickup Pipeline")}</h1>
        <p className="text-muted-foreground mt-2">{t("Real-time monitoring of active child pickups")}</p>
      </div>

      <div className="flex-1 overflow-x-auto p-8 pt-0 min-w-max flex gap-6 pb-12">
        {COLUMNS.map((col) => (
          <div key={col.id} className="w-80 flex flex-col gap-4">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${col.color}`} />
                <h3 className="font-bold text-[#002626] uppercase text-xs tracking-wider">{t(col.label)}</h3>
                <Badge variant="secondary" className="bg-black/[0.05] text-[10px] h-5 px-1.5 font-bold">
                  {grouped[col.id]?.length || 0}
                </Badge>
              </div>
            </div>

            <div className="flex-1 flex flex-col gap-3 p-2 rounded-2xl bg-black/[0.02] border border-black/[0.03] min-h-[500px]">
              <AnimatePresence>
                {grouped[col.id]?.map((pickup) => (
                  <PickupCard key={pickup.id} pickup={pickup} colorClass={col.color} />
                ))}
              </AnimatePresence>
              {grouped[col.id]?.length === 0 && (
                <div className="flex-1 flex items-center justify-center italic text-muted-foreground text-xs opacity-50">
                   {t("No pickups in this stage")}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </PageTransition>
  );
}

function PickupCard({ pickup, colorClass }: { pickup: any, colorClass: string }) {
  const { t } = useTranslation();
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -2 }}
      className="group"
    >
      <Card className="glass-card hover:border-black/10 transition-all cursor-pointer shadow-sm border-black/5 overflow-hidden">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10 border border-black/5 shadow-sm rounded-xl">
                <AvatarImage src={pickup.student?.photoUrl} />
                <AvatarFallback className="bg-blue-50 text-blue-700 font-bold text-xs uppercase">
                  {pickup.student?.name.substring(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="font-bold text-sm text-[#002626] leading-none mb-1">{pickup.student?.name}</span>
                <span className="text-[10px] text-muted-foreground font-medium uppercase">{pickup.student?.grade?.name}</span>
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-black/[0.03]">
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-medium">
               <User className="w-3 h-3 text-muted-foreground/60" />
               <span className="text-foreground/80">{pickup.delegate?.name || t("Parent")}</span>
            </div>
            {pickup.delegate?.phone && (
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-medium">
                    <Phone className="w-3 h-3 text-muted-foreground/60" />
                    <span>{pickup.delegate.phone}</span>
                </div>
            )}
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-medium">
               <Clock className="w-3 h-3 text-muted-foreground/60" />
               <span>{formatDistanceToNow(new Date(pickup.timestamp))} {t("ago")}</span>
            </div>
          </div>

          <div className="pt-1 flex items-center justify-between">
              <div className="flex gap-1">
                 {pickup.student?.pickupMethod === 'BUS' && <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 text-[8px] h-4 px-1 shadow-none">BUS</Badge>}
                 {pickup.pickupType === 'DELEGATE' && <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 text-[8px] h-4 px-1 shadow-none">DELEGATE</Badge>}
              </div>
              <div className={`w-1.5 h-1.5 rounded-full ${colorClass} opacity-50`} />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
