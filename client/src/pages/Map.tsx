import { PageTransition } from "@/components/layout/AppLayout";
import { MapPin } from "lucide-react";

export default function MapView() {
  return (
    <PageTransition className="h-full flex flex-col space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground tracking-tight">Global Map</h1>
        <p className="text-muted-foreground mt-1">Live visualization of network activity.</p>
      </div>

      <div className="flex-1 glass rounded-2xl border border-white/10 relative overflow-hidden flex items-center justify-center bg-[url('https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center">
        {/* Dark wash over the map background */}
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm"></div>
        
        {/* Mock Map UI Content */}
        <div className="relative z-10 flex flex-col items-center text-center p-8">
          <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mb-6 animate-pulse shadow-[0_0_50px_rgba(59,130,246,0.5)]">
            <MapPin className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Map Integration Required</h2>
          <p className="text-muted-foreground max-w-md">
            Connect Mapbox or Google Maps API to visualize real-time geofence events and delegate tracking across 1,200+ active locations.
          </p>
        </div>
      </div>
    </PageTransition>
  );
}
