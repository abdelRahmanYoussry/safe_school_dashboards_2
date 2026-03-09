import { PageTransition } from "@/components/layout/AppLayout";
import { useAnalytics } from "@/hooks/use-dashboard";
import { Skeleton } from "@/components/ui/skeleton";
import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, LineChart, Line } from "recharts";

export default function Analytics() {
  const { data, isLoading } = useAnalytics();

  return (
    <PageTransition className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground tracking-tight">Platform Analytics</h1>
        <p className="text-muted-foreground mt-1">Deep dive into usage and trends.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass p-6 rounded-2xl border border-white/10">
          <h3 className="text-lg font-semibold mb-6">User Registrations (Trend)</h3>
          <div className="h-[350px]">
            {isLoading ? <Skeleton className="w-full h-full bg-white/5" /> : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data?.userRegistrations}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="rgba(255,255,255,0.4)" fontSize={12} tickLine={false} axisLine={false} />
                  <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={3} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="glass p-6 rounded-2xl border border-white/10">
          <h3 className="text-lg font-semibold mb-6">Safety Incidents Trend</h3>
          <div className="h-[350px]">
            {isLoading ? <Skeleton className="w-full h-full bg-white/5" /> :
              !data?.safetyTrend || data.safetyTrend.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full border border-dashed border-white/10 rounded-xl bg-white/[0.02]">
                  <span className="text-muted-foreground font-medium">Feature Coming Soon</span>
                  <p className="text-xs text-muted-foreground/70 mt-1">Granular safety metrics are currently being implemented.</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data?.safetyTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="rgba(255,255,255,0.4)" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: '#000', borderColor: 'rgba(255,255,255,0.1)' }} />
                    <Bar dataKey="value" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
