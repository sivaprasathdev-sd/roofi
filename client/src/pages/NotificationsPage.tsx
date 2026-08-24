import { Bell, CheckCheck } from "lucide-react";
import { toast } from "sonner";

import { PageHeader, SectionCard } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { leads } from "@/data/mock-data";
import { fmtDate } from "@/lib/format";
import { useScope } from "@/context/session-context";

export function NotificationsPage() {
  const { scope } = useScope();
  const userLeads = scope(leads);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notification Center"
        description="Alerts for lead assignments, scheduled follow-up reminders and document approvals."
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.success("Marked all notifications as read")}
          >
            <CheckCheck className="size-4" /> Mark All as Read
          </Button>
        }
      />

      <SectionCard title="Recent Notifications">
        <div className="divide-y divide-border">
          {userLeads.slice(0, 8).map((l, i) => (
            <div key={l.id} className="flex items-start justify-between py-3">
              <div className="flex items-start gap-3">
                <span className="mt-1 grid size-8 place-items-center rounded-full bg-primary/10 text-primary">
                  <Bell className="size-4" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    Lead {l.id} ({l.customerName}) is ready for follow-up
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Source: {l.source} · Product: {l.product} ({l.quantity} Nos)
                  </p>
                  <p className="mt-1 text-[11px] text-muted-foreground">{fmtDate(l.createdDate)}</p>
                </div>
              </div>
              <Badge variant="outline" className="text-xs">
                {l.status}
              </Badge>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
