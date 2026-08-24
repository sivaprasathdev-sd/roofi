import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { ArrowLeft, Plus, Save, Trash2 } from "lucide-react";
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
  customers as mockCustomers,
  docTotals,
  lineTotal,
  stateName,
} from "@/data/mock-data";
import { inr } from "@/lib/format";
import { useScope } from "@/context/session-context";
import { api } from "@/services/api";
import type { Customer, DocItem } from "@/types";

export function NewProformaPage() {
  const navigate = useNavigate();
  const { scope, user, role, stateId, clusterId } = useScope();

  const [availableCustomers, setAvailableCustomers] = useState<Customer[]>([]);
  const [customerId, setCustomerId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 10 * 86400000).toISOString().slice(0, 10),
  );

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

  // Auto-fetch saved Template Settings for logged-in State/Cluster
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
      "Bank: HDFC Bank · Branch: Industrial Estate · A/C No: 50200084920192 · IFSC: HDFC0001294\n1. 50% Advance with order confirmation, 50% before dispatch.\n2. Prices inclusive of GST as applicable.";

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

  const saveProforma = async () => {
    if (!customerId) {
      toast.error("Please select a customer");
      return;
    }

    const proformaData = {
      customerId,
      quotationId: `QT-${Date.now().toString().slice(-4)}`,
      stateId: currentTaxState,
      clusterId: clusterId || selectedCust?.clusterId || "CL-001",
      date,
      dueDate,
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
      status: "Issued",
    };

    try {
      await api.createProforma(proformaData);
      toast.success("Invoice generated & issued successfully!");
      navigate("/proforma-invoices");
    } catch (err) {
      console.error(err);
      toast.error("Failed to create Invoice");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <Link to="/proforma-invoices" className="flex items-center gap-1 hover:text-primary">
          <ArrowLeft className="size-3" /> Back to Invoices
        </Link>
      </div>

      <PageHeader
        title="Create Invoice"
        description="Issue payment bills for roofing orders (with itemized pricing, discount, 18% GST, and payment terms)."
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
                        {c.name} · {c.location || c.id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs">Invoice Date *</Label>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-xs">Payment Due Date *</Label>
                <Input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-xs">Servicing Cluster / Hub</Label>
                <Input
                  value={currentCluster ? currentCluster.name : "Coimbatore Central"}
                  readOnly
                  className="mt-1 bg-muted"
                />
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Invoice Header & Branding">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label className="text-xs font-semibold">Header Title / Company Name</Label>
                <Input
                  value={companyTitle}
                  onChange={(e) => setCompanyTitle(e.target.value)}
                  className="mt-1 font-medium"
                />
              </div>
              <div>
                <Label className="text-xs font-semibold">GSTIN Number</Label>
                <Input
                  value={companyGst}
                  onChange={(e) => setCompanyGst(e.target.value)}
                  className="mt-1 uppercase"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 mt-4">
              <div>
                <Label className="text-xs font-semibold">Contact Phone</Label>
                <Input
                  value={companyPhone}
                  onChange={(e) => setCompanyPhone(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs font-semibold">Contact Email</Label>
                <Input
                  value={companyEmail}
                  onChange={(e) => setCompanyEmail(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>

            <div className="mt-4">
              <Label className="text-xs font-semibold">Company Address</Label>
              <Input
                value={companyAddress}
                onChange={(e) => setCompanyAddress(e.target.value)}
                className="mt-1"
              />
            </div>
          </SectionCard>

          <SectionCard
            title="Line Items (Roofing Materials & Fitting Charges)"
            action={
              <Button size="sm" variant="outline" onClick={addItem}>
                <Plus className="size-4" /> Add Item
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
                      <p className="text-xs font-bold text-primary uppercase tracking-wider">
                        Item #{idx + 1}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-foreground">
                          Net: {inr(netLine)}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7 text-destructive"
                          onClick={() => removeItem(idx)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3">
                      <div className="sm:col-span-2">
                        <Label className="text-xs">Product Name</Label>
                        <Input
                          value={it.product}
                          onChange={(e) => updateItem(idx, "product", e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Color / Spec</Label>
                        <Input
                          value={it.color}
                          onChange={(e) => updateItem(idx, "color", e.target.value)}
                          className="mt-1"
                        />
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-4 items-end">
                      <div>
                        <Label className="text-xs">Quantity</Label>
                        <Input
                          type="number"
                          value={it.qty}
                          onChange={(e) => updateItem(idx, "qty", Number(e.target.value))}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Unit Rate (₹)</Label>
                        <Input
                          type="number"
                          value={it.price}
                          onChange={(e) => updateItem(idx, "price", Number(e.target.value))}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Total Price</Label>
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
                    </div>
                  </div>
                );
              })}
            </div>
          </SectionCard>
        </div>

        <div className="space-y-6">
          <SectionCard title="Invoice Amount Summary">
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

            <Button className="w-full mt-6 cursor-pointer" onClick={saveProforma}>
              <Save className="size-4" /> Save &amp; Issue Invoice
            </Button>
          </SectionCard>

          <SectionCard title="Payment Info & Terms">
            <Textarea
              rows={5}
              value={footerTerms}
              onChange={(e) => setFooterTerms(e.target.value)}
              placeholder="Bank account details, payment terms, and notes..."
            />
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
