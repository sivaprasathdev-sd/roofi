import { Link, useParams } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import { ArrowLeft, Download, Receipt } from "lucide-react";
import { toast } from "sonner";

import { SectionCard } from "@/components/layout/page-header";
import { DocStatusBadge, InfoRow, ItemsTable } from "@/components/common/doc-common";
import { RoofiLogo } from "@/components/common/brand";
import { Button } from "@/components/ui/button";
import {
  clusterById,
  clusterName,
  customers as mockCustomers,
  proformas as mockProformas,
} from "@/data/mock-data";
import { fmtDate } from "@/lib/format";
import { api } from "@/services/api";
import type { Customer, Proforma } from "@/types";

export function ProformaDetailPage() {
  const { docId } = useParams<{ docId: string }>();

  const [proforma, setProforma] = useState<Proforma | undefined>(undefined);
  const [customer, setCustomer] = useState<Customer | undefined>(undefined);
  const [invoiceSettings, setInvoiceSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchProformaAndCustomer = useCallback(async () => {
    try {
      const [pList, cList] = await Promise.all([
        api.getProformas().catch(() => mockProformas),
        api.getCustomers().catch(() => mockCustomers),
      ]);
      const foundP =
        pList.find((p: any) => p.id === docId) || mockProformas.find((p) => p.id === docId);
      setProforma(foundP);

      if (foundP) {
        const [foundC, settings] = await Promise.all([
          cList.find((c: any) => c.id === foundP.customerId) ||
            mockCustomers.find((c) => c.id === foundP.customerId),
          api.getSettings({ stateId: foundP.stateId, clusterId: foundP.clusterId }).catch(() => null),
        ]);
        setCustomer(foundC);
        if (settings) setInvoiceSettings(settings);
      }
    } catch (e) {
      console.warn("Using fallback invoice details");
    } finally {
      setLoading(false);
    }
  }, [docId]);

  useEffect(() => {
    fetchProformaAndCustomer();
  }, [fetchProformaAndCustomer]);

  if (!proforma) {
    return (
      <div className="space-y-4 text-center py-12">
        <h2 className="text-xl font-bold">Invoice Not Found</h2>
        <p className="text-sm text-muted-foreground">Invoice {docId} does not exist.</p>
        <Link to="/proforma-invoices">
          <Button variant="outline">Back to Invoices</Button>
        </Link>
      </div>
    );
  }

  const cluster = clusterById(proforma.clusterId);
  const logoToDisplay = invoiceSettings?.logoUrl || proforma.logo;
  const titleToDisplay = invoiceSettings?.companyName || proforma.companyTitle || (cluster ? cluster.company : "ROOFI Roofing Solutions Pvt Ltd");
  const addressToDisplay = invoiceSettings?.address || proforma.companyAddress || (cluster ? cluster.address : "Industrial Estate Road, Chennai, India");
  const gstToDisplay = invoiceSettings?.gstNumber || proforma.companyGst || (cluster ? cluster.gst : "33AABCR1234K1Z0");
  const phoneToDisplay = invoiceSettings?.supportPhone || proforma.companyPhone || (cluster ? cluster.phone : "+91 98400 11223");
  const emailToDisplay = invoiceSettings?.supportEmail || proforma.companyEmail || (cluster ? cluster.email : "admin@roofi.in");
  const termsToDisplay = invoiceSettings?.footerTerms || proforma.footerTerms || "1. 50% Advance with order confirmation, 50% before dispatch.\n2. Prices inclusive of GST as applicable.";

  const handleDownloadPDF = () => {
    window.print();
  };

  return (
    <div className="space-y-4 print:space-y-2 print:p-0">
      <div className="flex items-center justify-between text-xs text-muted-foreground print:hidden">
        <Link to="/proforma-invoices" className="flex items-center gap-1 hover:text-primary">
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
        </div>
      </div>

      {/* Official Invoice Document Shell */}
      <SectionCard title="" className="p-6 print:p-3 print:border-none print:shadow-none bg-card">
        {/* Custom Header Branding */}
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-4 print:pb-2">
          <div className="space-y-1 max-w-md">
            {logoToDisplay ? (
              <img src={logoToDisplay} alt="Company Logo" className="h-10 object-contain mb-1" />
            ) : (
              <RoofiLogo size="md" />
            )}
            <div>
              <p className="font-bold text-foreground text-sm">
                {titleToDisplay}
              </p>
              <p className="text-[11px] text-muted-foreground whitespace-pre-line">
                {addressToDisplay}
              </p>
              <div className="mt-0.5 text-[11px] text-muted-foreground flex flex-wrap gap-x-3">
                <p>
                  <span className="font-semibold text-foreground">GSTIN:</span>{" "}
                  {gstToDisplay}
                </p>
                <p>
                  <span className="font-semibold text-foreground">Ph:</span>{" "}
                  {phoneToDisplay}
                </p>
                <p>
                  <span className="font-semibold text-foreground">Email:</span>{" "}
                  {emailToDisplay}
                </p>
              </div>
            </div>
          </div>

          <div className="text-right space-y-1">
            <h2 className="text-xl font-black tracking-tight text-foreground uppercase">
              INVOICE
            </h2>
            <p className="font-extrabold text-primary text-lg tracking-tight">{proforma.id}</p>
            <div className="flex justify-end">
              <DocStatusBadge status={proforma.status} />
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
              {customer?.name || proforma.customerId}
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
            <InfoRow label="Invoice Date" value={fmtDate(proforma.date)} />
            <InfoRow label="Payment Due Date" value={fmtDate(proforma.dueDate)} />
            <InfoRow label="Prepared By" value={proforma.createdBy} />
            <InfoRow label="Servicing Hub" value={clusterName(proforma.clusterId)} />
          </div>
        </div>

        {/* Itemized Table (Qty, Price, Qty x Price, Discount, GST, Net Line Amount) */}
        <ItemsTable items={proforma.items} stateId={proforma.stateId || customer?.stateId} />

        {/* Footer Terms & Payment Info */}
        <div className="mt-4 print:mt-2 border-t border-border pt-3 print:pt-2 text-[11px] text-muted-foreground space-y-1">
          <p className="font-bold text-foreground uppercase tracking-wider text-[10px]">
            Payment Information &amp; Terms:
          </p>
          <div className="whitespace-pre-line text-[11px] leading-snug rounded-lg bg-muted/30 p-2.5 border print:p-2">
            {termsToDisplay}
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
