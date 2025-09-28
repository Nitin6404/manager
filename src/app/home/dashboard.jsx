"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, RefreshCw } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { createCompany } from "../apis/createCompany";
import { getCompany } from "../apis/getCompany";

export default function Dashboard() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadErr, setLoadErr] = useState(null);

  const resetForm = useCallback(() => {
    setName("");
    setDescription("");
  }, []);

  const fetchCompanies = useCallback(async () => {
    try {
      setLoading(true);
      setLoadErr(null);
      const res = await getCompany();
      // Shape guard: normalize to array
      const list = Array.isArray(res)
        ? res
        : Array.isArray(res?.data)
        ? res.data
        : [];
      setCompanies(
        list.map((item) => ({
          id: item.id ?? item._id ?? item.uuid ?? item.name,
          name: item.name ?? "",
          description: item.description ?? "",
        }))
      );
    } catch (e) {
      setLoadErr(e?.message || "Failed to load companies");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  const handleSave = useCallback(async () => {
    if (!name?.trim()) {
      console.warn("Validation: name is required");
      return;
    }
    const body = {
      name: name.trim(),
      description: description?.trim() || "",
    };
    try {
      setSaving(true);
      await createCompany({ data: body });
      resetForm();
      setOpen(false);
      // Refresh list after create
      fetchCompanies();
    } catch (err) {
      // Optional: surface toast or error UI
    } finally {
      setSaving(false);
    }
  }, [name, description, resetForm, fetchCompanies]);

  return (
    <div className="min-h-screen bg-white text-black">
      <div className="flex">
        <div className="md:w-[206px] relative">
          <header className="sticky top-0 bg-white">
            <div className="h-12 flex items-center gap-9 px-3">
              <h1 className="text-[15px] font-semibold leading-none mr-4">
                Home
              </h1>

              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button className="h-8 px-3">
                    <Plus
                      className="w-[14px] h-[14px]"
                      strokeWidth={2.5}
                      absoluteStrokeWidth
                    />
                    <span className="text-sm">Create</span>
                  </Button>
                </DialogTrigger>

                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Create a Company</DialogTitle>
                    <DialogDescription>
                      A company delivering innovative solutions with customized
                      services and expertise.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4 py-2">
                    <div className="grid w-full gap-2">
                      <Label htmlFor="company_name">Company Name</Label>
                      <Input
                        id="company_name"
                        placeholder="Enter company name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>

                    <div className="grid w-full gap-2">
                      <Label htmlFor="description">
                        Description (Optional)
                      </Label>
                      <Textarea
                        id="description"
                        rows={4}
                        placeholder="Add a short description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                      />
                    </div>
                  </div>

                  <DialogFooter className="gap-2">
                    <DialogClose asChild>
                      <Button variant="outline" disabled={saving}>
                        Cancel
                      </Button>
                    </DialogClose>
                    <Button
                      type="button"
                      onClick={handleSave}
                      disabled={saving}
                    >
                      {saving ? "Saving..." : "Save"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <div className="px-3 py-2 flex items-center justify-between">
              <p className="text-[12px] font-semibold leading-none">Company</p>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={fetchCompanies}
                disabled={loading}
                aria-label="Refresh companies"
                title="Refresh"
              >
                <RefreshCw
                  className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                />
              </Button>
            </div>
          </header>

          <div className="px-3 pb-3">
            {loading ? (
              <p className="text-xs text-neutral-500">Loading companies…</p>
            ) : loadErr ? (
              <p className="text-xs text-red-600">Error: {loadErr}</p>
            ) : companies.length === 0 ? (
              <p className="text-xs text-neutral-500">No companies found.</p>
            ) : (
              <ul className="space-y-1">
                {companies.map((c) => (
                  <li
                    key={c.id}
                    className="text-sm px-2 py-1 rounded hover:bg-black/5"
                    title={c.description || c.name}
                  >
                    {c.name}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="absolute right-0 top-0 bottom-0 w-px bg-black/10" />
        </div>

        <main className="flex-1 min-h-[calc(100vh-1px)] bg-white" />
      </div>
    </div>
  );
}
