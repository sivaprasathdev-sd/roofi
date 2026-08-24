import { Link, useParams } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import { ArrowLeft, Download, Send } from "lucide-react";
import { toast } from "sonner";

import { SectionCard } from "@/components/layout/page-header";
import { DocStatusBadge, InfoRow, ItemsTable } from "@/components/common/doc-common";
import { RoofiLogo } from "@/components/common/brand";
import { Button } from "@/components/ui/button";
import {
  clusterById,
  clusterName,
  customers as mockCustomers,
  quotations as mockQuotations,
} from "@/data/mock-data";
import { fmtDate } from "@/lib/format";
import { api } from "@/services/api";
import type { Customer, Quotation } from "@/types";

export function QuotationDetailPage() {
  const { docId } = useParams<{ docId: string }>();

  const [quotation, setQuotation] = useState<Quotation | undefined>(undefined);
  const [customer, setCustomer] = useState<Customer | undefined>(undefined);
  const [adminSettings, setAdminSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchQuotationAndCustomer = useCallback(async () => {
    try {
      const [qList, cList, settings] = await Promise.all([
        api.getQuotations().catch(() => mockQuotations),
        api.getCustomers().catch(() => mockCustomers),
        api.getSettings({}).catch(() => null),
      ]);
      const foundQ =
        qList.find((q: any) => q.id === docId) || mockQuotations.find((q) => q.id === docId);
      setQuotation(foundQ);
      if (settings) setAdminSettings(settings);

      if (foundQ) {
        const foundC =
          cList.find((c: any) => c.id === foundQ.customerId) ||
          mockCustomers.find((c) => c.id === foundQ.customerId);
        setCustomer(foundC);
      }
    } catch (e) {
      console.warn("Using fallback quotation details");
    } finally {
      setLoading(false);
    }
  }, [docId]);

  useEffect(() => {
    fetchQuotationAndCustomer();
  }, [fetchQuotationAndCustomer]);

  if (!quotation) {
    return (
      <div className="space-y-4 text-center py-12">
        <h2 className="text-xl font-bold">Quotation Not Found</h2>
        <p className="text-sm text-muted-foreground">Quotation {docId} does not exist.</p>
        <Link to="/quotations">
          <Button variant="outline">Back to Quotations</Button>
        </Link>
      </div>
    );
  }

  const cluster = clusterById(quotation.clusterId);
  const logoToDisplay = adminSettings?.logoUrl || quotation.logo;
  const titleToDisplay = adminSettings?.companyName || quotation.companyTitle || (cluster ? cluster.company : "ROOFI Roofing Solutions Pvt Ltd");
  const addressToDisplay = adminSettings?.address || quotation.companyAddress || (cluster ? cluster.address : "Industrial Estate Road, Chennai, India");
  const gstToDisplay = adminSettings?.gstNumber || quotation.companyGst || (cluster ? cluster.gst : "33AABCR1234K1Z0");
  const phoneToDisplay = adminSettings?.supportPhone || quotation.companyPhone || (cluster ? cluster.phone : "+91 98400 11223");
  const emailToDisplay = adminSettings?.supportEmail || quotation.companyEmail || (cluster ? cluster.email : "admin@roofi.in");
  const termsToDisplay = adminSettings?.footerTerms || quotation.footerTerms || "1. 50% Advance with order confirmation, 50% before dispatch.\n2. Prices inclusive of GST as applicable.\n3. Goods once sold will not be taken back.";

  const handleDownloadPDF = () => {
    window.print();
  };

  return (
    <div className="space-y-4 print:space-y-2 print:p-0">
      <div className="flex items-center justify-between text-xs text-muted-foreground print:hidden">
        <Link to="/quotations" className="flex items-center gap-1 hover:text-primary">
          <ArrowLeft className="size-3" /> Back to Quotations
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

          <Link to="/proforma-invoices/new">
            <Button variant="outline" size="sm" className="gap-1">
              Generate Invoice
            </Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              toast.success(`Quotation ${quotation.id} sent to ${customer?.name || "Customer"}`)
            }
          >
            <Send className="size-3.5" /> Send to Customer
          </Button>
        </div>
      </div>

      {/* Official Quotation Document Shell */}
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
            <p className="font-extrabold text-primary text-xl tracking-tight">{quotation.id}</p>
            <div className="flex justify-end">
              <DocStatusBadge status={quotation.status} />
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
              {customer?.name || quotation.customerId}
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
            <InfoRow label="Quotation Date" value={fmtDate(quotation.date)} />
            <InfoRow label="Valid Until" value={fmtDate(quotation.validUntil)} />
            <InfoRow label="Prepared By" value={quotation.createdBy} />
            <InfoRow label="Servicing Hub" value={clusterName(quotation.clusterId)} />
          </div>
        </div>

        {/* Itemized Table (Qty, Price, Qty x Price, Discount, GST, Net Line Amount) */}
        <ItemsTable items={quotation.items} stateId={quotation.stateId || customer?.stateId} />

        {/* Footer Terms & Conditions */}
        <div className="mt-4 print:mt-2 border-t border-border pt-3 print:pt-2 text-[11px] text-muted-foreground space-y-1">
          <p className="font-bold text-foreground uppercase tracking-wider text-[10px]">
            Terms &amp; Conditions:
          </p>
          <div className="whitespace-pre-line text-[11px] leading-snug rounded-lg bg-muted/30 p-2.5 border print:p-2">
            {termsToDisplay}
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
