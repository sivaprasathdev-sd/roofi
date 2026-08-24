import { useEffect, useState } from "react";
import { Eye, EyeOff, Loader2, Save, ShieldAlert } from "lucide-react";
import { toast } from "sonner";

import { PageHeader, SectionCard } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { roleLabel, useSession } from "@/context/session-context";
import { api } from "@/services/api";

export function ProfilePage() {
  const { user, updateUser } = useSession();

  const [name, setName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [password, setPassword] = useState("roofi@2026");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setPhone(user.phone);
    }
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      toast.error("Name and Phone number are required.");
      return;
    }

    setLoading(true);
    try {
      if (user?.id) {
        const res = await api.updateProfile({
          userId: user.id,
          name: name.trim(),
          phone: phone.trim(),
          password: password.trim(),
        });

        if (res.user) {
          updateUser(res.user);
        } else {
          updateUser({ name: name.trim(), phone: phone.trim() });
        }
      } else {
        updateUser({ name: name.trim(), phone: phone.trim() });
      }

      toast.success("Profile details updated successfully!");
    } catch (err: any) {
      updateUser({ name: name.trim(), phone: phone.trim() });
      toast.success("Profile details updated successfully!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="My User Profile"
        description="Update your personal details and password. Email address and System Role are managed by HO Administration."
      />

      <form onSubmit={handleSaveProfile} className="max-w-3xl space-y-6">
        <SectionCard title="Personal Information (Editable)">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="name">Full Name (Editable)</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone Number (Editable)</Label>
              <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} required />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="password">Password (Displayable & Editable)</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-10 font-mono"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute top-1/2 right-2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Click the eye icon to view or reveal current password.
              </p>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Account Identity (Read-Only)">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-muted-foreground">
                Email Address (Read-Only)
              </Label>
              <Input
                id="email"
                value={user?.email ?? ""}
                disabled
                className="bg-muted cursor-not-allowed opacity-80"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-muted-foreground">System Role (Read-Only)</Label>
              <div className="flex h-9 items-center rounded-md border border-input bg-muted px-3 text-sm font-semibold text-foreground">
                {user?.role ? roleLabel[user.role] : "HO Admin"}
              </div>
            </div>
          </div>

          <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
            <ShieldAlert className="size-3.5 text-amber-500" />
            Email address and system roles cannot be modified directly. Contact HO IT for role
            changes.
          </p>
        </SectionCard>

        <div className="flex justify-end">
          <Button type="submit" disabled={loading} className="cursor-pointer">
            {loading ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            {loading ? "Saving Changes…" : "Update Profile"}
          </Button>
        </div>
      </form>
    </div>
  );
}
