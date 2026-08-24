import { Link, useParams } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import { ArrowLeft, BadgeIndianRupee, Download } from "lucide-react";
import { toast } from "sonner";

import { SectionCard } from "@/components/layout/page-header";
import { DocStatusBadge, InfoRow, ItemsTable } from "@/components/common/doc-common";
import { RoofiLogo } from "@/components/common/brand";
import { Button } from "@/components/ui/button";
import {
  clusterById,
  clusterName,
  customers as mockCustomers,
  docTotals,
  invoices as mockInvoices,
} from "@/data/mock-data";
import { fmtDate, inr } from "@/lib/format";
import { api } from "@/services/api";
import type { Customer, Invoice } from "@/types";

export function InvoiceDetailPage() {
  const { docId } = useParams<{ docId: string }>();

  const [invoice, setInvoice] = useState<Invoice | undefined>(undefined);
  const [customer, setCustomer] = useState<Customer | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  const fetchInvoiceAndCustomer = useCallback(async () => {
    try {
      const [iList, cList] = await Promise.all([
        api.getInvoices().catch(() => mockInvoices),
        api.getCustomers().catch(() => mockCustomers),
      ]);
      const foundI =
        iList.find((i: any) => i.id === docId) || mockInvoices.find((i) => i.id === docId);
      setInvoice(foundI);

      if (foundI) {
        const foundC =
          cList.find((c: any) => c.id === foundI.customerId) ||
          mockCustomers.find((c) => c.id === foundI.customerId);
        setCustomer(foundC);
      }
    } catch (e) {
      console.warn("Using fallback invoice details");
    } finally {
      setLoading(false);
    }
  }, [docId]);

  useEffect(() => {
    fetchInvoiceAndCustomer();
  }, [fetchInvoiceAndCustomer]);

  if (!invoice) {
    return (
      <div className="space-y-4 text-center py-12">
        <h2 className="text-xl font-bold">Tax Invoice Not Found</h2>
        <p className="text-sm text-muted-foreground">Invoice {docId} does not exist.</p>
        <Link to="/invoices">
          <Button variant="outline">Back to Invoices</Button>
        </Link>
      </div>
    );
  }

  const cluster = clusterById(invoice.clusterId);
  const totals = docTotals(invoice.items);
  const balance = totals.total - invoice.paid;

  const handleDownloadPDF = () => {
    window.print();
  };

  return (
    <div className="space-y-4 print:space-y-2 print:p-0">
      <div className="flex items-center justify-between text-xs text-muted-foreground print:hidden">
        <Link to="/invoices" className="flex items-center gap-1 hover:text-primary">
          <ArrowLeft className="size-3" /> Back to Invoices
        </Link>
        <div className="flex items-center gap-2">
          <Button
            variant="default"
            size="sm"
            onClick={handleDownloadPDF}
            className="gap-1 font-semibold"
          >
            <Download className="size-3.5" /> Download PDF
          </Button>

          {balance > 0 && (
            <Button
              size="sm"
              onClick={() => toast.success(`Payment recorded for Invoice ${invoice.id}`)}
            >
              <BadgeIndianRupee className="size-3.5" /> Record Payment
            </Button>
          )}
        </div>
      </div>

      {/* Official Tax Invoice Document Shell */}
      <SectionCard title="" className="p-6 print:p-3 print:border-none print:shadow-none bg-card">
        {/* Custom Header Branding */}
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-4 print:pb-2">
          <div className="space-y-1 max-w-md">
            {invoice.logo ? (
              <img src={invoice.logo} alt="Company Logo" className="h-10 object-contain mb-1" />
            ) : (
              <RoofiLogo size="md" />
            )}
            <div>
              <p className="font-bold text-foreground text-sm">
                {invoice.companyTitle ||
                  (cluster ? cluster.company : "ROOFI Roofing Solutions Pvt Ltd")}
              </p>
              <p className="text-[11px] text-muted-foreground whitespace-pre-line">
                {invoice.companyAddress ||
                  (cluster ? cluster.address : "Industrial Estate Road, Chennai, India")}
              </p>
              <div className="mt-0.5 text-[11px] text-muted-foreground flex flex-wrap gap-x-3">
                <p>
                  <span className="font-semibold text-foreground">GSTIN:</span>{" "}
                  {invoice.companyGst || (cluster ? cluster.gst : "33AABCR1234K1Z0")}
                </p>
                <p>
                  <span className="font-semibold text-foreground">Ph:</span>{" "}
                  {invoice.companyPhone || (cluster ? cluster.phone : "+91 98400 11223")}
                </p>
                <p>
                  <span className="font-semibold text-foreground">Email:</span>{" "}
                  {invoice.companyEmail || (cluster ? cluster.email : "admin@roofi.in")}
                </p>
              </div>
            </div>
          </div>

          <div className="text-right space-y-1">
            <h2 className="text-xl font-black tracking-tight text-foreground uppercase">
              TAX INVOICE
            </h2>
            <p className="font-extrabold text-primary text-lg tracking-tight">{invoice.id}</p>
            <div className="flex justify-end">
              <DocStatusBadge status={invoice.status} />
            </div>
          </div>
        </div>

        {/* Customer & Document Information */}
        <div className="my-4 print:my-2 grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-border p-3 space-y-1 bg-muted/20 print:p-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-primary">
              Billed To Customer:
            </p>
            <p className="font-bold text-foreground text-sm">
              {customer?.name || invoice.customerId}
            </p>
            <p className="text-[11px] text-muted-foreground">
              {customer?.address || "Site Address"}
            </p>
            <p className="text-[11px] text-muted-foreground">
              Ph: <span className="font-medium text-foreground">{customer?.phone || "—"}</span> ·
              Email: <span className="font-medium text-foreground">{customer?.email || "—"}</span>
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 rounded-lg border border-border p-3 bg-muted/20 print:p-2">
            <InfoRow label="Invoice Date" value={fmtDate(invoice.date)} />
            <InfoRow label="Due Date" value={fmtDate(invoice.dueDate)} />
            <InfoRow
              label="Amount Paid"
              value={<span className="text-primary font-bold">{inr(invoice.paid)}</span>}
            />
            <InfoRow
              label="Balance Due"
              value={
                <span
                  className={balance > 0 ? "text-destructive font-bold" : "text-muted-foreground"}
                >
                  {inr(balance)}
                </span>
              }
            />
          </div>
        </div>

        {/* Itemized Table (Qty, Price, Qty x Price, Discount, GST, Net Line Amount) */}
        <ItemsTable items={invoice.items} stateId={invoice.stateId || customer?.stateId} />

        {/* Footer Terms & Statutory Declaration */}
        <div className="mt-4 print:mt-2 border-t border-border pt-3 print:pt-2 text-[11px] text-muted-foreground space-y-1">
          <p className="font-bold text-foreground uppercase tracking-wider text-[10px]">
            Tax Declaration &amp; Statutory Terms:
          </p>
          <div className="whitespace-pre-line text-[11px] leading-snug rounded-lg bg-muted/30 p-2.5 border print:p-2">
            {invoice.footerTerms || (
              <>
                We declare that this invoice shows the actual price of the goods described and that
                all particulars are true and correct.
                <br />
                Goods once sold will not be taken back or exchanged. Subject to local jurisdiction.
              </>
            )}
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
