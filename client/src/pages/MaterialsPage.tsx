import { useEffect, useState } from "react";
import {
  Download,
  Eye,
  FileSpreadsheet,
  FileText,
  FolderOpen,
  Image as ImageIcon,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  Upload,
  Video,
} from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { materialCategories, materials as mockMaterials } from "@/data/mock-data";
import { fmtDate } from "@/lib/format";
import { useSession } from "@/context/session-context";
import { api } from "@/services/api";
import { cn } from "@/lib/utils";

export function MaterialsPage() {
  const { user } = useSession();
  const isHoAdmin = user?.role === "ho";

  const [materialsList, setMaterialsList] = useState<any[]>([]);
  const [selectedCat, setSelectedCat] = useState("All");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  // Upload Modal State
  const [uploadOpen, setUploadOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Product Catalog");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // Edit Modal State
  const [editOpen, setEditOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<any | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editCategory, setEditCategory] = useState("Product Catalog");
  const [savingEdit, setSavingEdit] = useState(false);

  const fetchMaterials = async () => {
    try {
      const res = await api.getMaterials();
      if (res && Array.isArray(res)) {
        setMaterialsList(res);
      } else {
        setMaterialsList(mockMaterials);
      }
    } catch (e) {
      console.warn("Using fallback materials");
      setMaterialsList(mockMaterials);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  // Dynamically compute uploaded categories present in current materials list
  const uploadedCategories = Array.from(
    new Set(materialsList.map((m) => m.category).filter(Boolean)),
  );
  const filterCategories = ["All", ...uploadedCategories];

  // If selected category was deleted, fallback to 'All'
  useEffect(() => {
    if (selectedCat !== "All" && !uploadedCategories.includes(selectedCat)) {
      setSelectedCat("All");
    }
  }, [uploadedCategories, selectedCat]);

  const filtered = materialsList.filter((m) => {
    if (selectedCat !== "All" && m.category !== selectedCat) return false;
    if (query.trim() && !m.name.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });

  const getIcon = (type: string) => {
    switch (type) {
      case "PDF":
        return FileText;
      case "Image":
        return ImageIcon;
      case "Spreadsheet":
        return FileSpreadsheet;
      case "Video":
        return Video;
      default:
        return FolderOpen;
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !category) {
      toast.error("Title and Category are required.");
      return;
    }

    setUploading(true);
    try {
      let fileData = "";
      let fileName = "";

      if (file) {
        fileName = file.name;
        fileData = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      }

      const res = await api.createMaterial({
        name: title.trim(),
        category,
        fileData,
        fileName,
        uploadedBy: user?.name || "HO Admin",
      });

      toast.success(res.message || "Material uploaded to root /uploads directory!");
      setUploadOpen(false);
      setTitle("");
      setFile(null);
      fetchMaterials();
    } catch (err: any) {
      toast.error(err.message || "Failed to upload material");
    } finally {
      setUploading(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMaterial || !editTitle.trim()) return;

    setSavingEdit(true);
    try {
      const res = await api.updateMaterial(editingMaterial.id, {
        name: editTitle.trim(),
        category: editCategory,
      });
      toast.success(res.message || "Material updated successfully!");
      setEditOpen(false);
      fetchMaterials();
    } catch (err: any) {
      toast.error(err.message || "Failed to update material");
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDeleteConfirm = async (id: string) => {
    try {
      const res = await api.deleteMaterial(id);
      toast.success(res.message || "Material deleted!");
      fetchMaterials();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete material");
    }
  };

  const handleView = (m: any) => {
    if (m.fileUrl) {
      window.open(m.fileUrl, "_blank");
    } else {
      toast.info(`Viewing document preview for "${m.name}"`);
    }
  };

  const handleDownload = (m: any) => {
    if (m.fileUrl) {
      const a = document.createElement("a");
      a.href = m.fileUrl;
      a.download = m.fileName || m.name;
      a.target = "_blank";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success(`Downloading ${m.name}`);
    } else {
      toast.success(`Downloading resource file ${m.name}`);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Resource Materials"
        description="Central library of product catalogues, technical datasheets, brochures, and price lists."
        actions={
          isHoAdmin && (
            <Button size="sm" onClick={() => setUploadOpen(true)} className="cursor-pointer">
              <Plus className="size-4" /> Upload Material (HO Admin)
            </Button>
          )
        }
      />

      <div className="card-elevated p-4 space-y-3">
        {/* Dynamic Filter Section: Displays only uploaded categories */}
        <div className="flex flex-wrap gap-2">
          {filterCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCat(cat)}
              className={cn(
                "rounded-full px-3.5 py-1 text-xs font-semibold transition-colors cursor-pointer border",
                selectedCat === cat
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-muted text-muted-foreground border-border hover:bg-accent hover:text-foreground",
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        <Input
          placeholder="Filter materials by keyword..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="max-w-md"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="card-elevated p-8 text-center text-muted-foreground space-y-2">
          <FolderOpen className="size-10 mx-auto text-muted-foreground/50" />
          <p className="text-sm font-semibold">No materials found</p>
          <p className="text-xs">
            {selectedCat !== "All"
              ? `No documents uploaded under '${selectedCat}' category.`
              : "Upload a material document to display it here."}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((m) => {
            const Icon = getIcon(m.type);
            return (
              <div key={m.id} className="card-elevated flex flex-col justify-between p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="size-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">{m.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {m.category} · {m.size}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-border pt-3 text-xs">
                  <span className="text-muted-foreground">
                    By {m.uploadedBy || "HO Admin"} · {fmtDate(m.uploadDate)}
                  </span>
                  <div className="flex items-center gap-1">
                    {/* View / Preview */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 cursor-pointer"
                      title="View Document"
                      onClick={() => handleView(m)}
                    >
                      <Eye className="size-3.5" />
                    </Button>

                    {/* Download */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 cursor-pointer"
                      title="Download Document"
                      onClick={() => handleDownload(m)}
                    >
                      <Download className="size-3.5" />
                    </Button>

                    {/* Edit (HO Admin Only) */}
                    {isHoAdmin && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7 text-amber-500 hover:text-amber-600 cursor-pointer"
                        title="Edit Material"
                        onClick={() => {
                          setEditingMaterial(m);
                          setEditTitle(m.name);
                          setEditCategory(m.category);
                          setEditOpen(true);
                        }}
                      >
                        <Pencil className="size-3.5" />
                      </Button>
                    )}

                    {/* Delete (HO Admin Only) */}
                    {isHoAdmin && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7 text-destructive hover:text-destructive cursor-pointer"
                        title="Delete Material"
                        onClick={() => handleDeleteConfirm(m.id)}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Upload Material Modal (HO Admin Only) */}
      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Upload New Resource Material</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUploadSubmit} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="mtitle">Document Title *</Label>
              <Input
                id="mtitle"
                placeholder="e.g. Stone Coated Metal Tile Brochure 2026.pdf"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label>Material Category *</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="bg-card">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {materialCategories.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="file">Upload Document File (PDF, Image, Doc) *</Label>
              <Input
                id="file"
                type="file"
                accept="*/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                required
              />
              <p className="text-[11px] text-muted-foreground">
                Files are saved to root `/uploads` folder.
              </p>
            </div>

            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setUploadOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={uploading} className="cursor-pointer">
                {uploading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Upload className="size-4" />
                )}
                {uploading ? "Uploading…" : "Upload Material"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Material Modal (HO Admin Only) */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Material Information</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="etitle">Document Title *</Label>
              <Input
                id="etitle"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label>Category *</Label>
              <Select value={editCategory} onValueChange={setEditCategory}>
                <SelectTrigger className="bg-card">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {materialCategories.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setEditOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={savingEdit} className="cursor-pointer">
                {savingEdit ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Pencil className="size-4" />
                )}
                {savingEdit ? "Saving Changes…" : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
