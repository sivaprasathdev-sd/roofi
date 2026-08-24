import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { docTotals, lineTotal } from "@/data/mock-data";
import { inr, num } from "@/lib/format";
import type { DocItem } from "@/types";
import { cn } from "@/lib/utils";

const tone: Record<string, string> = {
  Draft: "bg-muted text-muted-foreground border-transparent",
  Sent: "bg-sky-500/10 text-sky-600 border-sky-500/30 dark:bg-sky-500/20 dark:text-sky-300 dark:border-sky-500/40",
  Issued:
    "bg-sky-500/10 text-sky-600 border-sky-500/30 dark:bg-sky-500/20 dark:text-sky-300 dark:border-sky-500/40",
  Accepted:
    "bg-emerald-500/10 text-emerald-600 border-emerald-500/30 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/40",
  Converted:
    "bg-emerald-500/10 text-emerald-600 border-emerald-500/30 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/40",
  Paid: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/40",
  "Partially Paid":
    "bg-amber-500/10 text-amber-600 border-amber-500/30 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/40",
  Pending:
    "bg-amber-500/10 text-amber-600 border-amber-500/30 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/40",
  Rejected:
    "bg-rose-500/10 text-rose-600 border-rose-500/30 dark:bg-rose-500/20 dark:text-rose-300 dark:border-rose-500/40",
  Cancelled:
    "bg-rose-500/10 text-rose-600 border-rose-500/30 dark:bg-rose-500/20 dark:text-rose-300 dark:border-rose-500/40",
  Expired:
    "bg-rose-500/10 text-rose-600 border-rose-500/30 dark:bg-rose-500/20 dark:text-rose-300 dark:border-rose-500/40",
};

export function DocStatusBadge({ status }: { status: string }) {
  return (
    <Badge variant="outline" className={cn("font-medium", tone[status] ?? tone["Draft"])}>
      {status}
    </Badge>
  );
}

export function InfoRow({ label, value }: { label: string; value?: ReactNode }) {
  return (
    <div>
      <p className="text-[11px] tracking-wide text-muted-foreground uppercase">{label}</p>
      <div className="mt-0.5 text-sm font-medium text-foreground">{value ?? "—"}</div>
    </div>
  );
}

export function ItemsTable({
  items,
  stateId = "TN",
}: {
  items: DocItem[];
  stateId?: string | undefined;
}) {
  const t = docTotals(items, stateId);
  return (
    <div className="space-y-3 print:space-y-1.5">
      <div className="overflow-x-auto print:overflow-visible rounded-lg border border-border">
        <table className="w-full text-xs sm:text-sm print:text-[11px]">
          <thead className="bg-muted/60 text-xs print:text-[10px] text-muted-foreground">
            <tr>
              {[
                { name: "#", className: "w-[4%] print:w-[3%]" },
                { name: "Item / Product Name", className: "print:w-[26%]" },
                { name: "Size / Colour", className: "print:w-[15%]" },
                { name: "Qty", className: "print:w-[8%]" },
                { name: "Unit Price", className: "print:w-[11%]" },
                { name: "Total Price", className: "print:w-[13%]" },
                { name: "Disc %", className: "print:w-[7%]" },
                { name: "GST %", className: "print:w-[7%]" },
                { name: "Net Line Amount", className: "print:w-[10%]" },
              ].map((h) => (
                <th
                  key={h.name}
                  className={cn(
                    "px-2.5 py-2 print:px-1.5 print:py-1 text-left font-semibold whitespace-nowrap print:whitespace-normal",
                    h.className,
                  )}
                >
                  {h.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((it, i) => {
              const gross = it.qty * it.price;
              return (
                <tr key={i} className="border-t border-border">
                  <td className="px-2.5 py-1.5 print:px-1.5 print:py-1 text-muted-foreground">
                    {i + 1}
                  </td>
                  <td className="px-2.5 py-1.5 print:px-1.5 print:py-1">
                    <p className="font-semibold text-foreground">{it.product}</p>
                    {it.description && (
                      <p className="text-[11px] print:text-[9.5px] text-muted-foreground leading-tight">
                        {it.description}
                      </p>
                    )}
                  </td>
                  <td className="px-2.5 py-1.5 print:px-1.5 print:py-1 whitespace-nowrap print:whitespace-normal">
                    {it.size}
                    <span className="block text-[11px] print:text-[9.5px] text-muted-foreground">
                      {it.color}
                    </span>
                  </td>
                  <td className="px-2.5 py-1.5 print:px-1.5 print:py-1 whitespace-nowrap font-medium">
                    {num(it.qty)} {it.unit || "Nos"}
                  </td>
                  <td className="px-2.5 py-1.5 print:px-1.5 print:py-1 whitespace-nowrap">
                    {inr(it.price)}
                  </td>
                  <td className="px-2.5 py-1.5 print:px-1.5 print:py-1 whitespace-nowrap font-semibold">
                    {inr(gross)}
                  </td>
                  <td className="px-2.5 py-1.5 print:px-1.5 print:py-1">{it.discount}%</td>
                  <td className="px-2.5 py-1.5 print:px-1.5 print:py-1">{it.tax}%</td>
                  <td className="px-2.5 py-1.5 print:px-1.5 print:py-1 font-bold whitespace-nowrap text-primary">
                    {inr(lineTotal(it))}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="ml-auto w-full max-w-xs sm:max-w-sm print:max-w-[280px] space-y-1.5 text-xs sm:text-sm print:text-[11px] bg-muted/20 p-3 print:p-2 rounded-lg border">
        <Row label="Subtotal (Gross Qty x Price)" value={inr(t.subtotal)} />
        <Row label="Total Discount Amount" value={`- ${inr(t.discount)}`} />
        <Row label="Taxable Amount" value={inr(t.taxable)} />
        {t.isTN ? (
          <>
            <Row label="SGST (9%)" value={inr(t.sgst)} />
            <Row label="CGST (9%)" value={inr(t.cgst)} />
          </>
        ) : (
          <Row label="CGST (18%)" value={inr(t.cgst)} />
        )}
        <div className="flex items-center justify-between border-t border-border pt-1.5 text-sm sm:text-base print:text-xs font-bold text-foreground">
          <span>Total Amount Need to Pay</span>
          <span className="text-primary text-base sm:text-lg print:text-sm">{inr(t.total)}</span>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
