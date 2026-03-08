import { useState } from "react";
import { PageTransition } from "@/components/layout/AppLayout";
import { MapPin, ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSchools } from "@/hooks/use-schools";
import { motion } from "framer-motion";

export default function MapView() {
  const { data: schools = [], isLoading } = useSchools();
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  // Calculate bounds
  if (schools.length === 0 && !isLoading) {
    return (
      <PageTransition className="h-full flex flex-col space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Global Map</h1>
          <p className="text-muted-foreground mt-1">Live visualization of school locations and active pickups.</p>
        </div>
        <div className="flex-1 glass rounded-2xl border border-white/10 flex items-center justify-center">
          <p className="text-muted-foreground">No schools available</p>
        </div>
      </PageTransition>
    );
  }

  // Get map bounds
  const lats = schools.map(s => s.latitude);
  const lons = schools.map(s => s.longitude);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLon = Math.min(...lons);
  const maxLon = Math.max(...lons);
  const latRange = maxLat - minLat || 0.1;
  const lonRange = maxLon - minLon || 0.1;

  // SVG dimensions
  const svgWidth = 1200;
  const svgHeight = 600;
  const padding = 60;

  // Convert lat/lon to SVG coordinates
  const toSvgX = (lon: number) => {
    const normalized = (lon - minLon) / lonRange;
    return padding + normalized * (svgWidth - 2 * padding);
  };

  const toSvgY = (lat: number) => {
    const normalized = 1 - ((lat - minLat) / latRange);
    return padding + normalized * (svgHeight - 2 * padding);
  };

  // Convert meters to SVG pixels (rough estimate)
  const geofenceToPx = (meters: number) => {
    const metersPerDegree = 111000;
    const degreesPerPixel = lonRange / (svgWidth - 2 * padding);
    return (meters / metersPerDegree) / degreesPerPixel;
  };

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.2, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.2, 0.5));

  return (
    <PageTransition className="h-full flex flex-col space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Global Map</h1>
          <p className="text-muted-foreground mt-1">
            {schools.length} schools • {schools.reduce((sum, s) => sum + s.activePickups, 0)} active pickups
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            size="icon"
            variant="outline"
            onClick={handleZoomOut}
            data-testid="button-zoom-out"
          >
            <ZoomOut className="w-4 h-4" />
          </Button>
          <Button
            size="icon"
            variant="outline"
            onClick={handleZoomIn}
            data-testid="button-zoom-in"
          >
            <ZoomIn className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex-1 glass rounded-2xl border border-white/10 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center animate-spin mx-auto">
              <MapPin className="w-6 h-6 text-primary" />
            </div>
            <p className="text-muted-foreground">Loading map data...</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 glass rounded-2xl border border-white/10 overflow-auto">
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-full bg-background/50"
            style={{ minWidth: svgWidth, minHeight: svgHeight }}
          >
            {/* Grid background */}
            <defs>
              <pattern id="grid" width="100" height="100" patternUnits="userSpaceOnUse">
                <path d="M 100 0 L 0 0 0 100" fill="none" stroke="hsl(var(--border))" strokeWidth="0.5" opacity="0.3" />
              </pattern>
            </defs>
            <rect width={svgWidth} height={svgHeight} fill="url(#grid)" />

            {/* Geofence circles */}
            {schools.map((school) => (
              <circle
                key={`geofence-${school.id}`}
                cx={toSvgX(school.longitude)}
                cy={toSvgY(school.latitude)}
                r={geofenceToPx(school.geofenceRadius)}
                fill="hsl(var(--primary))"
                opacity="0.05"
                stroke="hsl(var(--primary))"
                strokeWidth="1"
                strokeDasharray="4,4"
              />
            ))}

            {/* School markers */}
            {schools.map((school) => (
              <motion.g
                key={`school-${school.id}`}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: schools.indexOf(school) * 0.05 }}
              >
                {/* Pulse ring for active pickups */}
                {school.activePickups > 0 && (
                  <circle
                    cx={toSvgX(school.longitude)}
                    cy={toSvgY(school.latitude)}
                    r="8"
                    fill="none"
                    stroke="hsl(var(--accent))"
                    strokeWidth="1"
                    opacity="0.6"
                    className="animate-pulse"
                  />
                )}

                {/* Main marker */}
                <circle
                  cx={toSvgX(school.longitude)}
                  cy={toSvgY(school.latitude)}
                  r="6"
                  fill={school.status === 'active' ? 'hsl(var(--primary))' : 'hsl(var(--muted))'}
                  stroke="hsl(var(--background))"
                  strokeWidth="2"
                />

                {/* Tooltip group */}
                <g className="group">
                  <title>{school.name}</title>

                  {/* Background for info */}
                  <rect
                    x={toSvgX(school.longitude) - 85}
                    y={toSvgY(school.latitude) - 50}
                    width="170"
                    height="50"
                    rx="6"
                    fill="hsl(var(--card))"
                    stroke="hsl(var(--border))"
                    strokeWidth="1"
                    opacity="0"
                    className="group-hover:opacity-100 transition-opacity"
                  />

                  {/* School name */}
                  <text
                    x={toSvgX(school.longitude)}
                    y={toSvgY(school.latitude) - 32}
                    textAnchor="middle"
                    fontSize="12"
                    fontWeight="600"
                    fill="hsl(var(--foreground))"
                    opacity="0"
                    className="group-hover:opacity-100 transition-opacity"
                    pointerEvents="none"
                  >
                    {school.name.substring(0, 16)}
                  </text>

                  {/* Users info */}
                  <text
                    x={toSvgX(school.longitude)}
                    y={toSvgY(school.latitude) - 18}
                    textAnchor="middle"
                    fontSize="11"
                    fill="hsl(var(--muted-foreground))"
                    opacity="0"
                    className="group-hover:opacity-100 transition-opacity"
                    pointerEvents="none"
                  >
                    Users: {school.totalUsers}
                  </text>

                  {/* Active pickups */}
                  <text
                    x={toSvgX(school.longitude)}
                    y={toSvgY(school.latitude) - 5}
                    textAnchor="middle"
                    fontSize="11"
                    fill="hsl(var(--accent))"
                    fontWeight="600"
                    opacity="0"
                    className="group-hover:opacity-100 transition-opacity"
                    pointerEvents="none"
                  >
                    Active: {school.activePickups}
                  </text>
                </g>
              </motion.g>
            ))}

            {/* Legend */}
            <g>
              <rect x="20" y={svgHeight - 100} width="200" height="80" rx="6" fill="hsl(var(--card))" stroke="hsl(var(--border))" strokeWidth="1" opacity="0.9" />
              <circle cx="40" cy={svgHeight - 72} r="4" fill="hsl(var(--primary))" />
              <text x="55" y={svgHeight - 68} fontSize="12" fill="hsl(var(--foreground))">Active School</text>
              <circle cx="40" cy={svgHeight - 50} r="4" fill="hsl(var(--accent))" opacity="0.6" />
              <text x="55" y={svgHeight - 46} fontSize="12" fill="hsl(var(--foreground))">Active Pickups</text>
              <circle cx="40" cy={svgHeight - 28} r="4" fill="hsl(var(--muted))" />
              <text x="55" y={svgHeight - 24} fontSize="12" fill="hsl(var(--foreground))">Inactive</text>
            </g>
          </svg>
        </div>
      )}
    </PageTransition>
  );
}
