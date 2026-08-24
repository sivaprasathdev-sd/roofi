import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { api } from "@/services/api";

export interface ProjectSettings {
  projectTitle: string;
  logoUrl?: string;
  icoUrl?: string;
  companyName?: string;
  gstNumber?: string;
  supportEmail?: string;
  supportPhone?: string;
  address?: string;
  currency?: string;
}

interface SettingsContextValue {
  settings: ProjectSettings;
  updateSettingsState: (updated: Partial<ProjectSettings>) => void;
  reloadSettings: () => Promise<void>;
}

const defaultSettings: ProjectSettings = {
  projectTitle: "ROOFI STONE COATED METAL TILE",
  logoUrl: "",
  icoUrl: "",
  companyName: "ROOFI Roofing Solutions Pvt Ltd",
  gstNumber: "29AABCR1234K1Z0",
  supportEmail: "support@roofi.in",
  supportPhone: "+91 98400 11223",
  address: "Headquarters, Industrial Estate, Chennai, India",
  currency: "INR (₹)",
};

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<ProjectSettings>(() => {
    const saved = localStorage.getItem("roofi.settings");
    if (saved) {
      try {
        return { ...defaultSettings, ...JSON.parse(saved) };
      } catch (e) {
        console.warn("Failed to parse local settings", e);
      }
    }
    return defaultSettings;
  });

  const fetchSettings = async () => {
    try {
      const res = await api.getSettings();
      if (res) {
        setSettings((prev) => {
          const merged = { ...prev, ...res };
          localStorage.setItem("roofi.settings", JSON.stringify(merged));
          return merged;
        });
      }
    } catch (e) {
      console.warn("Could not fetch remote settings, using local settings");
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    // Dynamic Page Title
    if (settings.projectTitle) {
      document.title = settings.projectTitle;
    }

    // Dynamic Titlebar Favicon / ICO Icon
    if (settings.icoUrl) {
      let link = document.querySelector<HTMLLinkElement>("link[rel*='icon']");
      if (!link) {
        link = document.createElement("link");
        link.rel = "icon";
        document.head.appendChild(link);
      }
      link.href = settings.icoUrl;
    }
  }, [settings]);

  const updateSettingsState = (updated: Partial<ProjectSettings>) => {
    setSettings((prev) => {
      const merged = { ...prev, ...updated };
      localStorage.setItem("roofi.settings", JSON.stringify(merged));
      return merged;
    });
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateSettingsState,
        reloadSettings: fetchSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
}
