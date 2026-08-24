import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Building2, Image as ImageIcon, Save, ShieldCheck, Upload } from "lucide-react";
import { toast } from "sonner";

import { PageHeader, SectionCard } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useScope, roleLabel } from "@/context/session-context";
import { clusterById, stateName } from "@/data/mock-data";
import { api } from "@/services/api";

export function QuotationSettingsPage() {
  const { role, stateId, clusterId, user } = useScope();
  const currentCluster = clusterById(clusterId);

  const [companyTitle, setCompanyTitle] = useState("");
  const [address, setAddress] = useState("");
  const [gstNumber, setGstNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [footerTerms, setFooterTerms] = useState(
    "1. 50% Advance with order confirmation, 50% before dispatch.\n2. Prices inclusive of GST as applicable.\n3. Goods once sold will not be taken back.",
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const defaultTitle = "ROOFI Roofing Solutions Pvt Ltd";
    const defaultAddr = "Industrial Estate Road, Chennai, Tamil Nadu";
    const defaultGst = "33AABCR1234K1Z0";
    const defaultPhone = "+91 98400 11223";
    const defaultEmail = "admin@roofi.in";

    api
      .getSettings({})
      .then((s) => {
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
      })
      .catch(() => {
        setCompanyTitle(defaultTitle);
        setAddress(defaultAddr);
        setGstNumber(defaultGst);
        setPhone(defaultPhone);
        setEmail(defaultEmail);
      })
      .finally(() => setLoading(false));
  }, []);

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
        companyName: companyTitle,
        address,
        gstNumber,
        supportPhone: phone,
        supportEmail: email,
        logoUrl,
        footerTerms,
      });
      toast.success("Master Admin Quotation Settings saved successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save settings");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Link to="/quotations" className="flex items-center gap-1 hover:text-primary">
          <ArrowLeft className="size-3" /> Back to Quotations
        </Link>
      </div>

      <PageHeader
        title="Quotation Branding & Template Settings"
        description={`Configure default logo, title, GSTIN, and terms for ${roleLabel[role] || role} jurisdiction.`}
        actions={
          <Button size="sm" onClick={handleSave}>
            <Save className="size-4" /> Save Settings
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <SectionCard title="Header Branding Details">
            <div className="space-y-4">
              <div>
                <Label className="text-xs">Company Header / Title *</Label>
                <Input
                  value={companyTitle}
                  onChange={(e) => setCompanyTitle(e.target.value)}
                  placeholder="e.g. ROOFI Coimbatore Roofing Solutions Pvt Ltd"
                  className="mt-1 font-semibold"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
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

              <div className="grid gap-4 sm:grid-cols-2">
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
                    placeholder="12 Industrial Estate Road, Peelamedu, Coimbatore"
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Default Footer Terms & Conditions">
            <Textarea
              rows={6}
              value={footerTerms}
              onChange={(e) => setFooterTerms(e.target.value)}
              placeholder="1. 50% Advance with PO..."
            />
          </SectionCard>
        </div>

        <div className="space-y-6">
          <SectionCard title="Quotation Logo Upload">
            <div className="space-y-4 text-center border-2 border-dashed border-border rounded-lg p-6">
              {logoUrl ? (
                <div className="space-y-3">
                  <img
                    src={logoUrl}
                    alt="Quotation Logo Preview"
                    className="mx-auto h-20 object-contain rounded border p-2 bg-background"
                  />
                  <p className="text-xs text-muted-foreground">Current Quotation Logo</p>
                  <Button variant="outline" size="sm" onClick={() => setLogoUrl("")}>
                    Remove Logo
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="mx-auto grid size-12 place-items-center rounded-full bg-primary/10 text-primary">
                    <ImageIcon className="size-6" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Upload Quotation Logo</p>
                    <p className="text-xs text-muted-foreground">PNG, JPG, or SVG (Max 2MB)</p>
                  </div>
                  <label className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow hover:bg-primary/90 cursor-pointer">
                    <Upload className="size-3.5" /> Choose Image File
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleLogoUpload}
                    />
                  </label>
                </div>
              )}

              <div className="border-t pt-3 text-left">
                <Label className="text-xs">Or Enter Logo Image URL</Label>
                <Input
                  value={logoUrl.startsWith("data:") ? "" : logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="https://example.com/logo.png"
                  className="mt-1 text-xs"
                />
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Live Template Preview">
            <div className="rounded border p-4 space-y-2 bg-card text-xs">
              <div className="flex items-center justify-between border-b pb-2">
                <div>
                  <p className="font-bold text-foreground">{companyTitle || "Company Name"}</p>
                  <p className="text-[11px] text-muted-foreground">{address}</p>
                  <p className="text-[10px] text-muted-foreground">GSTIN: {gstNumber}</p>
                </div>
                {logoUrl && <img src={logoUrl} alt="Logo" className="h-8 object-contain" />}
              </div>
              <p className="text-[11px] text-primary font-semibold">QUOTATION TEMPLATE READY</p>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
