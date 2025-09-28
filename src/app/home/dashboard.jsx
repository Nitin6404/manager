"use client";

import { Plus } from "lucide-react";
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

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-white text-black">
      <div className="flex">
        <div className="md:w-[206px] relative">
          <header className="sticky top-0 bg-white">
            <div className="h-12 flex items-center gap-10 px-3">
              <h1 className="text-[15px] font-semibold leading-none mr-4">
                Home
              </h1>

              <Dialog>
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
                      <Label htmlFor="title">Company Name</Label>
                      <Input id="title" placeholder="Enter company name" />
                    </div>
                    <div className="grid w-full gap-2">
                      <Label htmlFor="description">Description(Optional)</Label>
                      <Textarea
                        id="description"
                        rows={4}
                        placeholder="Add a short description"
                      />
                    </div>
                  </div>
                  <DialogFooter className="gap-2">
                    <DialogClose asChild>
                      <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button type="submit">Save</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </header>
          <div className="absolute right-0 top-0 bottom-0 w-px bg-black/10" />
        </div>
        <main className="flex-1 min-h-[calc(100vh-56px)] bg-white" />
      </div>
    </div>
  );
}
