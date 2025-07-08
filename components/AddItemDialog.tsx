"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AddItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activeTab: string;
}

const AddItemDialog: React.FC<AddItemDialogProps> = ({
  open,
  onOpenChange,
  activeTab,
}) => {
  const getDialogContent = () => {
    switch (activeTab) {
      case "layers":
        return {
          title: "Add Layer",
          description: "Add a new layer to your wardrobe",
        };
      case "outfits":
        return {
          title: "Add Clothing",
          description: "Add a new clothing item to your wardrobe",
        };
      case "logs":
        return {
          title: "Add Log",
          description: "Add a new log entry",
        };
      default:
        return {
          title: "Add Item",
          description: "Add a new item",
        };
    }
  };

  const { title, description } = getDialogContent();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <form>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-3">
              <Label htmlFor="name-1">Name</Label>
              <Input id="name-1" name="name" placeholder="Enter name..." />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="description-1">Description</Label>
              <Input id="description-1" name="description" placeholder="Enter description..." />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit">Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
};

export default AddItemDialog;
