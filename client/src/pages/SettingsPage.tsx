import { useEffect, useState } from "react";
import {
  Image as ImageIcon,
  Loader2,
  Save,
  Upload,
  Globe,
  Sun,
  Moon,
  Laptop,
  Palette,
} from "lucide-react";
import { toast } from "sonner";

import { PageHeader, SectionCard } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useSettings } from "@/context/settings-context";
import { useTheme } from "@/context/theme-context";
import { api } from "@/services/api";

export function SettingsPage() {
  const { settings, updateSettingsState, reloadSettings } = useSettings();
  const { theme, setTheme } = useTheme();

  const [projectTitle, setProjectTitle] = useState(
    settings.projectTitle || "ROOFI STONE COATED METAL TILE",
  );
  const [logoUrl, setLogoUrl] = useState(settings.logoUrl || "");
  const [icoUrl, setIcoUrl] = useState(settings.icoUrl || "");

  const [companyName, setCompanyName] = useState(
    settings.companyName || "ROOFI Roofing Solutions Pvt Ltd",
  );
  const [gstNumber, setGstNumber] = useState(settings.gstNumber || "29AABCR1234K1Z0");
  const [supportEmail, setSupportEmail] = useState(settings.supportEmail || "support@roofi.in");
  const [supportPhone, setSupportPhone] = useState(settings.supportPhone || "+91 98400 11223");
  const [address, setAddress] = useState(
    settings.address || "Headquarters, Industrial Estate, Chennai, India",
  );

  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingIco, setUploadingIco] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (settings) {
      if (settings.projectTitle) setProjectTitle(settings.projectTitle);
      if (settings.logoUrl) setLogoUrl(settings.logoUrl);
      if (settings.icoUrl) setIcoUrl(settings.icoUrl);
      if (settings.companyName) setCompanyName(settings.companyName);
      if (settings.gstNumber) setGstNumber(settings.gstNumber);
      if (settings.supportEmail) setSupportEmail(settings.supportEmail);
      if (settings.supportPhone) setSupportPhone(settings.supportPhone);
      if (settings.address) setAddress(settings.address);
    }
  }, [settings]);

  // Handle Logo Upload
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      setUploadingLogo(true);
      try {
        const res = await api.uploadSettingsFile({
          fileName: file.name,
          fileData: base64,
          type: "logo",
        });
        setLogoUrl(res.url);
        updateSettingsState({ logoUrl: res.url });
        toast.success("Brand Logo uploaded to root uploads/ directory!");
      } catch (err: any) {
        toast.error(err.message || "Failed to upload logo");
      } finally {
        setUploadingLogo(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle Favicon ICO Upload
  const handleIcoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      setUploadingIco(true);
      try {
        const res = await api.uploadSettingsFile({
          fileName: file.name,
          fileData: base64,
          type: "ico",
        });
        setIcoUrl(res.url);
        updateSettingsState({ icoUrl: res.url });
        toast.success("Favicon ICO uploaded to root uploads/ directory!");
      } catch (err: any) {
        toast.error(err.message || "Failed to upload favicon");
      } finally {
        setUploadingIco(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectTitle.trim()) {
      toast.error("Project Title is required.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        projectTitle: projectTitle.trim(),
        logoUrl,
        icoUrl,
        companyName: companyName.trim(),
        gstNumber: gstNumber.trim(),
        supportEmail: supportEmail.trim(),
        supportPhone: supportPhone.trim(),
        address: address.trim(),
      };

      const res = await api.updateSettings(payload);

      updateSettingsState(payload);
      await reloadSettings();

      toast.success(res.message || "System branding and configuration saved!");
    } catch (err: any) {
      updateSettingsState({
        projectTitle,
        logoUrl,
        icoUrl,
        companyName,
        gstNumber,
        supportEmail,
        supportPhone,
        address,
      });
      toast.success("Branding settings saved locally!");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="System Branding & Settings"
        description="Global system configuration: Appearance & Theme, Project Title, Brand Logo, Titlebar Favicon (ICO), and Company Details."
      />

      <div className="space-y-6 max-w-3xl">
        {/* Appearance & Theme Selection Card */}
        <SectionCard title="Appearance & Theme Mode">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Palette className="size-4 text-primary" />
              <p className="text-sm font-semibold text-foreground">Select Display Mode</p>
            </div>
            <p className="text-xs text-muted-foreground">
              Customize the look and feel of the ROOFI Lead Management System. Choose between Light
              mode, Dark mode, or match your system settings.
            </p>
            <div className="grid grid-cols-3 gap-4 pt-2">
              <button
                type="button"
                onClick={() => setTheme("light")}
                className={`flex flex-col items-center justify-center gap-2.5 rounded-xl border p-4 transition-all cursor-pointer ${
                  theme === "light"
                    ? "border-primary bg-primary/10 text-primary shadow-sm"
                    : "border-border bg-card text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                <div className="grid size-10 place-items-center rounded-lg bg-amber-500/10 text-amber-500">
                  <Sun className="size-5" />
                </div>
                <span className="text-xs font-semibold">Light Mode</span>
              </button>

              <button
                type="button"
                onClick={() => setTheme("dark")}
                className={`flex flex-col items-center justify-center gap-2.5 rounded-xl border p-4 transition-all cursor-pointer ${
                  theme === "dark"
                    ? "border-primary bg-primary/10 text-primary shadow-sm"
                    : "border-border bg-card text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                <div className="grid size-10 place-items-center rounded-lg bg-indigo-500/10 text-indigo-500">
                  <Moon className="size-5" />
                </div>
                <span className="text-xs font-semibold">Dark Mode</span>
              </button>

              <button
                type="button"
                onClick={() => setTheme("system")}
                className={`flex flex-col items-center justify-center gap-2.5 rounded-xl border p-4 transition-all cursor-pointer ${
                  theme === "system"
                    ? "border-primary bg-primary/10 text-primary shadow-sm"
                    : "border-border bg-card text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                <div className="grid size-10 place-items-center rounded-lg bg-cyan-500/10 text-cyan-500">
                  <Laptop className="size-5" />
                </div>
                <span className="text-xs font-semibold">System Default</span>
              </button>
            </div>
          </div>
        </SectionCard>

        <form onSubmit={handleSaveSettings} className="space-y-6">
          {/* Project Branding & Logo Customization */}
          <SectionCard title="Project Title & Brand Media (Uploads to Root /uploads Directory)">
            <div className="space-y-6">
              <div className="space-y-1.5">
                <Label htmlFor="title" className="text-sm font-semibold flex items-center gap-1.5">
                  <Globe className="size-4 text-primary" /> Project Title / Website Title *
                </Label>
                <Input
                  id="title"
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
                  placeholder="e.g. ROOFI STONE COATED METAL TILE"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  This title updates the browser tab title (`document.title`) and website
                  application headers.
                </p>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 pt-2 border-t border-border">
                {/* Sidebar Brand Logo Upload */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold">Sidebar & Header Brand Logo</Label>
                  <div className="flex items-center gap-4">
                    <div className="size-16 rounded-lg border border-border bg-muted flex items-center justify-center overflow-hidden shrink-0">
                      {logoUrl ? (
                        <img
                          src={logoUrl}
                          alt="Uploaded Logo"
                          className="size-full object-contain p-1"
                        />
                      ) : (
                        <ImageIcon className="size-6 text-muted-foreground" />
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <label className="cursor-pointer inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90">
                        {uploadingLogo ? (
                          <Loader2 className="size-3.5 animate-spin" />
                        ) : (
                          <Upload className="size-3.5" />
                        )}
                        Upload Logo
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="hidden"
                          disabled={uploadingLogo}
                        />
                      </label>
                      <p className="text-[11px] text-muted-foreground">
                        PNG, SVG, or JPG (Saved to root `/uploads` folder).
                      </p>
                    </div>
                  </div>
                </div>

                {/* Browser Favicon / ICO Upload */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold">
                    Browser Titlebar Icon (Favicon / ICO)
                  </Label>
                  <div className="flex items-center gap-4">
                    <div className="size-16 rounded-lg border border-border bg-muted flex items-center justify-center overflow-hidden shrink-0">
                      {icoUrl ? (
                        <img
                          src={icoUrl}
                          alt="Uploaded Favicon"
                          className="size-8 object-contain"
                        />
                      ) : (
                        <Globe className="size-6 text-muted-foreground" />
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <label className="cursor-pointer inline-flex items-center gap-1.5 rounded-md bg-secondary px-3 py-1.5 text-xs font-semibold text-secondary-foreground hover:bg-secondary/80">
                        {uploadingIco ? (
                          <Loader2 className="size-3.5 animate-spin" />
                        ) : (
                          <Upload className="size-3.5" />
                        )}
                        Upload Favicon (.ico / png)
                        <input
                          type="file"
                          accept="image/*,.ico"
                          onChange={handleIcoUpload}
                          className="hidden"
                          disabled={uploadingIco}
                        />
                      </label>
                      <p className="text-[11px] text-muted-foreground">
                        Updates browser tab icon live (Saved to `/uploads`).
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </SectionCard>

          {/* Company & Financial Configurations */}
          <SectionCard title="Company Information & Contact Details">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs">Company Entity Name</Label>
                <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">GSTIN Number</Label>
                <Input
                  value={gstNumber}
                  onChange={(e) => setGstNumber(e.target.value)}
                  className="font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Support Email</Label>
                <Input value={supportEmail} onChange={(e) => setSupportEmail(e.target.value)} />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Support Phone Number</Label>
                <Input value={supportPhone} onChange={(e) => setSupportPhone(e.target.value)} />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-xs">Registered Office Address</Label>
                <Textarea rows={2} value={address} onChange={(e) => setAddress(e.target.value)} />
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Lead Assignment & Operational Rules">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    Auto-assign Manual Leads by Pincode
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Automatically route manual leads to the nearest cluster based on district
                    pincode.
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between border-t border-border pt-4">
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    State Admin Mandatory Approval
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Require State Admin confirmation before Meta ad campaign leads reach clusters.
                  </p>
                </div>
                <Switch />
              </div>
            </div>
          </SectionCard>

          <div className="flex justify-end">
            <Button type="submit" disabled={saving} className="cursor-pointer">
              {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
              {saving ? "Saving Settings…" : "Save System Settings"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
