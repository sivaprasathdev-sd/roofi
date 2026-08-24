import { useState, useEffect, type ReactNode } from "react";
import { Settings, Save, Upload } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useScope, roleLabel } from "@/context/session-context";
import { clusterById, stateName } from "@/data/mock-data";
import { api } from "@/services/api";

export function InvoiceSettingsDialog({ trigger }: { trigger?: ReactNode }) {
  const { role, stateId, clusterId } = useScope();
  const currentCluster = clusterById(clusterId);

  const [open, setOpen] = useState(false);
  const [companyTitle, setCompanyTitle] = useState("");
  const [address, setAddress] = useState("");
  const [gstNumber, setGstNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [footerTerms, setFooterTerms] = useState(
    "1. 50% Advance with order confirmation, 50% before dispatch.\n2. Prices inclusive of GST as applicable.\n3. Goods once sold will not be taken back.",
  );
  const [loading, setLoading] = useState(false);

  const loadSettings = async () => {
    setLoading(true);
    const defaultTitle = currentCluster
      ? currentCluster.company
      : role === "state"
        ? `ROOFI ${stateName(stateId || "TN")} State HO`
        : "ROOFI Roofing Solutions Pvt Ltd";
    const defaultAddr = currentCluster
      ? currentCluster.address
      : "Industrial Estate, Chennai, Tamil Nadu";
    const defaultGst = currentCluster ? currentCluster.gst : "33AABCR1234K1Z0";
    const defaultPhone = currentCluster ? currentCluster.phone : "+91 98400 11223";
    const defaultEmail = currentCluster ? currentCluster.email : "admin@roofi.in";

    try {
      const s = await api.getSettings({
        stateId: stateId || undefined,
        clusterId: clusterId || undefined,
      });
      if (s) {
        setCompanyTitle(s.companyName || defaultTitle);
        setAddress(s.address || defaultAddr);
        setGstNumber(s.gstNumber || defaultGst);
        setPhone(s.supportPhone || defaultPhone);
        setEmail(s.supportEmail || defaultEmail);
        setLogoUrl(s.logoUrl || "");
        if (s.footerTerms) setFooterTerms(s.footerTerms);
      } else {
        setCompanyTitle(defaultTitle);
        setAddress(defaultAddr);
        setGstNumber(defaultGst);
        setPhone(defaultPhone);
        setEmail(defaultEmail);
      }
    } catch {
      setCompanyTitle(defaultTitle);
      setAddress(defaultAddr);
      setGstNumber(defaultGst);
      setPhone(defaultPhone);
      setEmail(defaultEmail);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      loadSettings();
    }
  }, [open, stateId, clusterId]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Logo file size must be less than 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setLogoUrl(base64);
      toast.success("Logo uploaded successfully");
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    try {
      await api.updateSettings({
        stateId: stateId || undefined,
        clusterId: clusterId || undefined,
        companyName: companyTitle,
        address,
        gstNumber,
        supportPhone: phone,
        supportEmail: email,
        logoUrl,
        footerTerms,
      });
      toast.success("Invoice settings saved successfully!");
      setOpen(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to save invoice settings");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Settings className="size-4" /> Invoice Settings
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Invoice Branding &amp; Template Settings</DialogTitle>
          <DialogDescription>
            Configure custom logo, title, GSTIN, contact info, and footer terms used for creating invoices in {roleLabel[role] || role} scope.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2 text-xs">
          <div className="space-y-3 border-b pb-4">
            <Label className="text-xs font-semibold">Invoice Header Logo</Label>
            <div className="flex items-center gap-4">
              {logoUrl ? (
                <div className="relative border rounded p-2 bg-background flex items-center gap-2">
                  <img src={logoUrl} alt="Invoice Logo" className="h-10 object-contain" />
                  <Button variant="ghost" size="sm" onClick={() => setLogoUrl("")} className="text-xs">
                    Remove
                  </Button>
                </div>
              ) : (
                <label className="flex items-center gap-2 rounded-md bg-muted px-3 py-2 cursor-pointer hover:bg-muted/80 text-foreground font-medium">
                  <Upload className="size-4" /> Upload Logo File (PNG/JPG)
                  <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                </label>
              )}
            </div>
            <div className="mt-2">
              <Label className="text-[11px] text-muted-foreground">Or Logo Image URL</Label>
              <Input
                value={logoUrl.startsWith("data:") ? "" : logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="https://example.com/invoice-logo.png"
                className="mt-1"
              />
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <Label className="text-xs">Company Header / Title *</Label>
              <Input
                value={companyTitle}
                onChange={(e) => setCompanyTitle(e.target.value)}
                placeholder="e.g. ROOFI Coimbatore Roofing Solutions Pvt Ltd"
                className="mt-1 font-semibold"
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label className="text-xs">GSTIN Number *</Label>
                <Input
                  value={gstNumber}
                  onChange={(e) => setGstNumber(e.target.value)}
                  placeholder="e.g. 33AABCR1234K1Z0"
                  className="mt-1 uppercase"
                />
              </div>
              <div>
                <Label className="text-xs">Contact Phone *</Label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98400 10000"
                  className="mt-1"
                />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label className="text-xs">Contact Email *</Label>
                <Input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="coimbatore@roofi.in"
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">Company Address *</Label>
                <Input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Address details..."
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label className="text-xs">Terms &amp; Conditions *</Label>
              <Textarea
                rows={4}
                value={footerTerms}
                onChange={(e) => setFooterTerms(e.target.value)}
                placeholder="1. 50% Advance with PO..."
                className="mt-1"
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            <Save className="size-4" /> Save Invoice Settings
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
