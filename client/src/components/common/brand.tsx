import emblem from "@/assets/roofi-emblem.png";
import { cn } from "@/lib/utils";
import { useSettings } from "@/context/settings-context";

export function RoofiLogo({
  className,
  size = "md",
  invert = false,
  showTagline = true,
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
  invert?: boolean;
  showTagline?: boolean;
}) {
  const { settings } = useSettings();
  const dims = size === "lg" ? 64 : size === "md" ? 40 : 30;

  const logoSource = settings.logoUrl || emblem;
  const title = settings.projectTitle || "ROOFI";

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <img
        src={logoSource}
        alt="Brand Logo"
        width={dims}
        height={dims}
        style={{ width: dims, height: dims }}
        className="shrink-0 object-contain rounded-md"
      />
      <div className="leading-none min-w-0">
        <div
          className={cn(
            "font-extrabold tracking-[0.14em] truncate",
            size === "lg" ? "text-2xl" : size === "md" ? "text-lg" : "text-base",
            invert ? "text-sidebar-foreground" : "text-foreground",
          )}
        >
          {title.split(" ")[0] || "ROOFI"}
        </div>
        {showTagline && (
          <div
            className={cn(
              "mt-1 tracking-[0.14em] uppercase truncate max-w-[170px]",
              size === "lg" ? "text-[11px]" : "text-[8px]",
              invert ? "text-sidebar-foreground/60" : "text-muted-foreground",
            )}
          >
            {title.split(" ").slice(1).join(" ") || "Stone Coated Metal Tile"}
          </div>
        )}
      </div>
    </div>
  );
}
