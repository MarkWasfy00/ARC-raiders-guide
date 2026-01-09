"use client";

import { useState, useEffect } from "react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface Item {
  id: string;
  name: string;
  icon: string | null;
  rarity: string | null;
  item_type: string | null;
}

interface ItemSelectorProps {
  selectedItemId?: string;
  onSelect: (itemId: string) => void;
  placeholder?: string;
}

export function ItemSelector({
  selectedItemId,
  onSelect,
  placeholder = "اختر عنصراً",
}: ItemSelectorProps) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await fetch("/api/items?pageSize=1000");
        const data = await response.json();
        setItems(data.data || data.items || []);
      } catch (error) {
        console.error("Error fetching items:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  const selectedItem = items.find((item) => item.id === selectedItemId);

  const getRarityColor = (rarity: string | null) => {
    switch (rarity?.toUpperCase()) {
      case "LEGENDARY":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-500 border-amber-500/20";
      case "EPIC":
        return "bg-purple-500/10 text-purple-600 dark:text-purple-500 border-purple-500/20";
      case "RARE":
        return "bg-blue-500/10 text-blue-600 dark:text-blue-500 border-blue-500/20";
      case "UNCOMMON":
        return "bg-green-500/10 text-green-600 dark:text-green-500 border-green-500/20";
      default:
        return "bg-gray-500/10 text-gray-600 dark:text-gray-500 border-gray-500/20";
    }
  };

  const filteredItems = searchQuery
    ? items.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : items;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selectedItem ? (
            <div className="flex items-center gap-2">
              {selectedItem.icon && (
                <img
                  src={selectedItem.icon}
                  alt={selectedItem.name}
                  className="h-5 w-5 object-contain"
                />
              )}
              <span>{selectedItem.name}</span>
              <Badge
                variant="outline"
                className={cn("text-xs", getRarityColor(selectedItem.rarity))}
              >
                {selectedItem.rarity || "عادي"}
              </Badge>
            </div>
          ) : (
            placeholder
          )}
          <ChevronsUpDown className="mr-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0 z-[2002]" align="start" side="bottom" sideOffset={8}>
        <Command>
          <CommandInput
            placeholder="ابحث عن عنصر..."
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <CommandList>
            {loading ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                جاري التحميل...
              </div>
            ) : filteredItems.length === 0 ? (
              <CommandEmpty>لم يتم العثور على عناصر</CommandEmpty>
            ) : (
              <CommandGroup>
                {filteredItems.slice(0, 100).map((item) => (
                  <CommandItem
                    key={item.id}
                    value={item.id}
                    onSelect={(currentValue) => {
                      onSelect(currentValue === selectedItemId ? "" : currentValue);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "ml-2 h-4 w-4",
                        selectedItemId === item.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex items-center gap-2 flex-1">
                      {item.icon && (
                        <img
                          src={item.icon}
                          alt={item.name}
                          className="h-6 w-6 object-contain"
                        />
                      )}
                      <span className="flex-1">{item.name}</span>
                      <Badge
                        variant="outline"
                        className={cn("text-xs", getRarityColor(item.rarity))}
                      >
                        {item.rarity || "عادي"}
                      </Badge>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
