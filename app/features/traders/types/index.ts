export interface TraderItem {
  id: string;
  icon: string;
  name: string;
  value: number;
  rarity: "Common" | "Uncommon" | "Rare" | "Epic";
  item_type: "Quick Use" | "Topside Material" | "Basic Material" | "Nature" | "Augment" | "Shield" | "Gadget" | "Key" | "Modification" | "Weapon" | "Ammunition";
  description: string;
  trader_price: number;
}

export type TraderName = "Apollo" | "Celeste" | "Lance" | "Shani" | "TianWen";

export interface TradersData {
  Apollo: TraderItem[];
  Celeste: TraderItem[];
  Lance: TraderItem[];
  Shani: TraderItem[];
  TianWen: TraderItem[];
}

export interface ArcRaidersAPIResponse {
  success: boolean;
  data: TradersData;
}
