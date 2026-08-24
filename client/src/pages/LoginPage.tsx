import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Eye, EyeOff, Info, KeyRound, Loader2, ShieldCheck, UserCheck } from "lucide-react";
import { toast } from "sonner";

import loginBg from "@/assets/login-bg.jpg";
import { RoofiLogo } from "@/components/common/brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useSession } from "@/context/session-context";

const demoCredentials = [
  {
    roleName: "HO Admin",
    title: "HO Admin (Head Office All India)",
    email: "admin@roofi.in",
    password: "roofi@2026",
    scope: "Full system administration & all-India reports",
  },
  {
    roleName: "State Admin",
    title: "State Admin (Tamil Nadu)",
    email: "tn.admin@roofi.in",
    password: "roofi@2026",
    scope: "State HO jurisdiction for Tamil Nadu clusters",
  },
  {
    roleName: "Cluster Manager",
    title: "Cluster Manager (Coimbatore)",
    email: "coimbatore@roofi.in",
    password: "roofi@2026",
    scope: "Operational hub for Coimbatore leads & billing",
  },
];

export function LoginPage() {
  const { user, ready, signIn } = useSession();
  const navigate = useNavigate();

  const [email, setEmail] = useState("admin@roofi.in");
  const [password, setPassword] = useState("roofi@2026");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoOpen, setInfoOpen] = useState(false);

  useEffect(() => {
    if (ready && user) navigate("/dashboard");
  }, [ready, user, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);
    try {
      await signIn({ email: email.trim(), password });
      toast.success("Signed in successfully!");
      navigate("/dashboard");
    } catch (err: any) {
      setError("Invalid email or password. Credentials mismatch.");
      toast.error("Invalid credentials from MongoDB database.");
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (item: (typeof demoCredentials)[0]) => {
    setEmail(item.email);
    setPassword(item.password);
    setInfoOpen(false);
    toast.info(`Filled credentials for ${item.roleName}`);
  };

  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      {/* Left Banner */}
      <section className="relative hidden overflow-hidden lg:block">
        <img
          src={loginBg}
          alt="Modern villa roofed with ROOFI stone coated metal tiles"
          width={1280}
          height={1600}
          className="absolute inset-0 size-full object-cover"
        />
        <div className="absolute inset-0 bg-[linear-gradient(150deg,oklch(0.28_0.05_180/0.92),oklch(0.32_0.09_160/0.72))]" />
        <div className="relative flex h-full flex-col justify-between p-12">
          <RoofiLogo size="lg" invert />
          <div className="max-w-md">
            <h1 className="text-4xl leading-tight font-extrabold text-white">
              Every lead, from campaign to invoice.
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-white/75">
              ROOFI Lead Management System connects Head Office, State HOs and Clusters on one
              platform — assignment, follow-ups, quotations, proforma invoices and invoicing for
              stone coated metal tile projects across South India.
            </p>
            <div className="mt-8 flex flex-wrap gap-6 text-white/80">
              {[
                ["4", "States"],
                ["12", "Clusters"],
                ["42", "Active Leads"],
              ].map(([v, l]) => (
                <div key={l}>
                  <p className="text-2xl font-bold text-white">{v}</p>
                  <p className="text-xs tracking-wide uppercase">{l}</p>
                </div>
              ))}
            </div>
          </div>
          <p className="text-xs text-white/50">© 2026 ROOFI Stone Coated Metal Tile</p>
        </div>
      </section>

      {/* Right Form */}
      <section className="flex items-center justify-center bg-background px-5 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <RoofiLogo size="md" />
          </div>

          <div className="card-elevated p-7">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-foreground">Sign in to your account</h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  Validates strictly against MongoDB{" "}
                  <code className="font-mono text-primary">users</code> collection
                </p>
              </div>

              {/* Info Button for Demo Roles & Credentials */}
              <Dialog open={infoOpen} onOpenChange={setInfoOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1.5 text-xs cursor-pointer">
                    <Info className="size-4 text-primary" /> Credentials Info
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-base">
                      <KeyRound className="size-4 text-primary" /> System Login Credentials
                    </DialogTitle>
                    <DialogDescription className="text-xs">
                      All accounts below are stored in the MongoDB{" "}
                      <code className="font-mono">users</code> collection. Click{" "}
                      <strong>"Use Credentials"</strong> to auto-fill inputs.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-3 pt-2">
                    {demoCredentials.map((c) => (
                      <div
                        key={c.email}
                        className="flex items-center justify-between rounded-lg border border-border p-3 bg-muted/30"
                      >
                        <div className="space-y-0.5 min-w-0 pr-2">
                          <p className="text-xs font-bold text-foreground">{c.roleName}</p>
                          <p className="text-xs font-mono text-primary truncate">{c.email}</p>
                          <p className="text-xs font-mono text-muted-foreground">
                            Password:{" "}
                            <span className="font-semibold text-foreground">{c.password}</span>
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => fillCredentials(c)}
                          className="shrink-0 text-xs gap-1 cursor-pointer"
                        >
                          <UserCheck className="size-3.5" /> Use Credentials
                        </Button>
                      </div>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <form onSubmit={submit} className="mt-6 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@roofi.in"
                  autoComplete="username"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password">Password *</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={show ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                    className="pr-10 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShow((s) => !s)}
                    className="absolute top-1/2 right-2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground"
                    aria-label={show ? "Hide password" : "Show password"}
                  >
                    {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive">
                  {error}
                </div>
              )}

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Checkbox defaultChecked /> Remember me
                </label>
                <button
                  type="button"
                  onClick={() => toast.info("Contact HO IT administrator to reset your password.")}
                  className="text-xs font-medium text-primary hover:underline cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>

              <Button
                type="submit"
                className="h-11 w-full text-sm font-semibold cursor-pointer"
                disabled={loading}
              >
                {loading && <Loader2 className="size-4 animate-spin" />}
                {loading ? "Validating with MongoDB…" : "Sign In"}
              </Button>
            </form>

            <p className="mt-5 flex items-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="size-3.5 text-primary" />
              Strictly validates email & password against MongoDB Compass database.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
