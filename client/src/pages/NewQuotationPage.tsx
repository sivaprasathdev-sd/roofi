import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { ArrowLeft, Building, Image as ImageIcon, Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { PageHeader, SectionCard } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  clusterById,
  clusters,
  customers as mockCustomers,
  docTotals,
  lineTotal,
  stateName,
} from "@/data/mock-data";
import { inr } from "@/lib/format";
import { useScope } from "@/context/session-context";
import { api } from "@/services/api";
import type { Customer, DocItem } from "@/types";

export function NewQuotationPage() {
  const navigate = useNavigate();
  const { scope, user, role, stateId, clusterId } = useScope();

  const [availableCustomers, setAvailableCustomers] = useState<Customer[]>([]);
  const [customerId, setCustomerId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [validUntil, setValidUntil] = useState(
    new Date(Date.now() + 15 * 86400000).toISOString().slice(0, 10),
  );

  // Custom State/Cluster Header & Branding Formats
  const currentCluster = clusterById(clusterId);
  const [companyTitle, setCompanyTitle] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const [companyGst, setCompanyGst] = useState("");
  const [companyPhone, setCompanyPhone] = useState("");
  const [companyEmail, setCompanyEmail] = useState("");
  const [logo, setLogo] = useState("");
  const [footerTerms, setFooterTerms] = useState("");

  const [items, setItems] = useState<DocItem[]>([
    {
      product: "ROOFI Classic Tile",
      description: "Stone coated metal roofing tile with acrylic overglaze",
      size: "1340 x 420 mm",
      color: "Charcoal",
      qty: 450,
      unit: "Nos",
      price: 640,
      discount: 2,
      tax: 18,
    },
  ]);

  // Auto-fetch saved Quotation Template Settings for logged-in State/Cluster
  useEffect(() => {
    const defaultTitle = currentCluster
      ? currentCluster.company
      : role === "state"
        ? `ROOFI ${stateName(stateId || "TN")} State HO`
        : "ROOFI All India Head Office";
    const defaultAddr = currentCluster
      ? currentCluster.address
      : "Industrial Estate Road, Chennai, India";
    const defaultGst = currentCluster ? currentCluster.gst : "33AABCR1234K1Z0";
    const defaultPhone = currentCluster ? currentCluster.phone : "+91 98400 11223";
    const defaultEmail = currentCluster ? currentCluster.email : "admin@roofi.in";
    const defaultTerms =
      "1. 50% Advance with order confirmation, 50% before dispatch.\n2. Prices inclusive of GST as applicable.\n3. Goods once sold will not be taken back.";

    api
      .getSettings({ stateId: stateId || undefined, clusterId: clusterId || undefined })
      .then((s) => {
        if (s) {
          setCompanyTitle(s.companyName || defaultTitle);
          setCompanyAddress(s.address || defaultAddr);
          setCompanyGst(s.gstNumber || defaultGst);
          setCompanyPhone(s.supportPhone || defaultPhone);
          setCompanyEmail(s.supportEmail || defaultEmail);
          setLogo(s.logoUrl || "");
          setFooterTerms(s.footerTerms || defaultTerms);
        } else {
          setCompanyTitle(defaultTitle);
          setCompanyAddress(defaultAddr);
          setCompanyGst(defaultGst);
          setCompanyPhone(defaultPhone);
          setCompanyEmail(defaultEmail);
          setFooterTerms(defaultTerms);
        }
      })
      .catch(() => {
        setCompanyTitle(defaultTitle);
        setCompanyAddress(defaultAddr);
        setCompanyGst(defaultGst);
        setCompanyPhone(defaultPhone);
        setCompanyEmail(defaultEmail);
        setFooterTerms(defaultTerms);
      });
  }, [stateId, clusterId, currentCluster, role]);

  useEffect(() => {
    api
      .getCustomers()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setAvailableCustomers(scope(data));
        } else {
          setAvailableCustomers(scope(mockCustomers));
        }
      })
      .catch(() => setAvailableCustomers(scope(mockCustomers)));
  }, [scope]);

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      {
        product: "ROOFI Shingle Tile",
        description: "Stone coated metal roofing tile with acrylic overglaze",
        size: "1250 x 400 mm",
        color: "Terracotta",
        qty: 100,
        unit: "Nos",
        price: 580,
        discount: 0,
        tax: 18,
      },
    ]);
  };

  const removeItem = (index: number) => {
    if (items.length === 1) {
      toast.error("At least one line item is required");
      return;
    }
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof DocItem, value: any) => {
    setItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index]!, [field]: value };
      return updated;
    });
  };

  const selectedCust = availableCustomers.find((c) => c.id === customerId);
  const currentTaxState = selectedCust?.stateId || stateId || "TN";
  const totals = docTotals(items, currentTaxState);

  const saveQuotation = async () => {
    if (!customerId) {
      toast.error("Please select a customer");
      return;
    }

    const quotationData = {
      customerId,
      leadId: selectedCust?.leadId || `LD-${Date.now().toString().slice(-4)}`,
      stateId: currentTaxState,
      clusterId: clusterId || selectedCust?.clusterId || "CL-001",
      date,
      validUntil,
      companyTitle,
      companyAddress,
      companyGst,
      companyPhone,
      companyEmail,
      logo,
      footerTerms,
      items,
      createdBy: user?.name || "System User",
      createdByRole: role,
      status: "Sent",
    };

    try {
      await api.createQuotation(quotationData);
      toast.success("State/Cluster Quotation generated & saved successfully!");
      navigate("/quotations");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save quotation");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <Link to="/quotations" className="flex items-center gap-1 hover:text-primary">
          <ArrowLeft className="size-3" /> Back to Quotations
        </Link>
        <Link to="/quotations/settings">
          <Button variant="outline" size="sm">
            Edit Template Settings
          </Button>
        </Link>
      </div>

      <PageHeader
        title="Create Custom Quotation"
        description="Select customer and add stone-coated metal tile item list (qty x price, discount %, 18% GST, and final amount to pay)."
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <SectionCard title="Customer & General Details">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label className="text-xs">Select Customer *</Label>
                <Select value={customerId} onValueChange={setCustomerId}>
                  <SelectTrigger className="mt-1 bg-card">
                    <SelectValue placeholder="Choose customer..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCustomers.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name} ({c.location})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs">Quotation Date</Label>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-xs">Valid Until Date</Label>
                <Input
                  type="date"
                  value={validUntil}
                  onChange={(e) => setValidUntil(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-xs">Prepared By</Label>
                <Input defaultValue={user?.name} readOnly className="mt-1 bg-muted" />
              </div>
            </div>
          </SectionCard>

          <SectionCard
            title="Quotation Items List (Qty, Price, Discount & GST Table)"
            action={
              <Button size="sm" variant="outline" onClick={addItem}>
                <Plus className="size-3.5" /> Add Item Row
              </Button>
            }
          >
            <div className="space-y-4">
              {items.map((it, idx) => {
                const grossLine = it.qty * it.price;
                const netLine = lineTotal(it);
                return (
                  <div key={idx} className="rounded-lg border border-border p-4 space-y-3 bg-card">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-primary">Item #{idx + 1}</span>
                      <Button variant="ghost" size="sm" onClick={() => removeItem(idx)}>
                        <Trash2 className="size-3.5 text-destructive" />
                      </Button>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3">
                      <div>
                        <Label className="text-xs">Item Name / Product Profile *</Label>
                        <Input
                          value={it.product}
                          onChange={(e) => updateItem(idx, "product", e.target.value)}
                          className="mt-1 font-medium"
                          placeholder="Item Name"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Size Specification</Label>
                        <Input
                          value={it.size}
                          onChange={(e) => updateItem(idx, "size", e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Color Finish</Label>
                        <Input
                          value={it.color}
                          onChange={(e) => updateItem(idx, "color", e.target.value)}
                          className="mt-1"
                        />
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-5 items-end">
                      <div>
                        <Label className="text-xs">Quantity ({it.unit || "Nos"}) *</Label>
                        <Input
                          type="number"
                          value={it.qty}
                          onChange={(e) => updateItem(idx, "qty", Number(e.target.value))}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Unit Price (₹) *</Label>
                        <Input
                          type="number"
                          value={it.price}
                          onChange={(e) => updateItem(idx, "price", Number(e.target.value))}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Total Price (Qty x Price)</Label>
                        <Input
                          value={inr(grossLine)}
                          readOnly
                          className="mt-1 bg-muted font-semibold"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Discount %</Label>
                        <Input
                          type="number"
                          value={it.discount}
                          onChange={(e) => updateItem(idx, "discount", Number(e.target.value))}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">GST %</Label>
                        <Input value={`${it.tax}%`} readOnly className="mt-1 bg-muted" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </SectionCard>
        </div>

        <div className="space-y-6">
          <SectionCard title="Quotation Amount Summary">
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal (Gross Qty x Price):</span>
                <span className="font-semibold">{inr(totals.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Discount Amount:</span>
                <span className="font-semibold text-destructive">- {inr(totals.discount)}</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="text-muted-foreground">Taxable Value:</span>
                <span className="font-semibold">{inr(totals.taxable)}</span>
              </div>
              {totals.isTN ? (
                <>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">SGST (9%):</span>
                    <span className="font-semibold">{inr(totals.sgst)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">CGST (9%):</span>
                    <span className="font-semibold">{inr(totals.cgst)}</span>
                  </div>
                </>
              ) : (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">CGST (18%):</span>
                  <span className="font-semibold">{inr(totals.cgst)}</span>
                </div>
              )}
              <div className="border-t-2 border-primary pt-3 flex justify-between text-base font-bold bg-primary/5 p-3 rounded-lg">
                <span className="text-foreground">Total Amount Need to Pay:</span>
                <span className="text-primary text-lg">{inr(totals.total)}</span>
              </div>
            </div>

            <Button className="w-full mt-6 cursor-pointer" onClick={saveQuotation}>
              <Save className="size-4" /> Save &amp; Generate Quotation
            </Button>
          </SectionCard>

          <SectionCard title="Custom Terms & Conditions">
            <Textarea
              rows={5}
              value={footerTerms}
              onChange={(e) => setFooterTerms(e.target.value)}
              placeholder="Custom terms, payment conditions, and signatory text..."
            />
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
