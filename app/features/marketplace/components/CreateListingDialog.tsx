"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ItemSelector } from "./ItemSelector";
import { ShoppingCart, DollarSign, Sparkles, Plus, Trash2 } from "lucide-react";

interface CreateListingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

type ListingType = "WTS" | "WTB" | null;
type PaymentType = "SEEDS" | "ITEMS" | "OPEN_OFFERS" | null;

interface PaymentItem {
  itemId: string;
  quantity: number;
}

export function CreateListingDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateListingDialogProps) {
  const [step, setStep] = useState(1);
  const [listingType, setListingType] = useState<ListingType>(null);
  const [paymentType, setPaymentType] = useState<PaymentType>(null);
  const [itemId, setItemId] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [seedsAmount, setSeedsAmount] = useState("");
  const [description, setDescription] = useState("");
  const [paymentItems, setPaymentItems] = useState<PaymentItem[]>([]);
  const [newPaymentItemId, setNewPaymentItemId] = useState("");
  const [newPaymentItemQuantity, setNewPaymentItemQuantity] = useState("1");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [accepted, setAccepted] = useState(false);

  const resetForm = () => {
    setStep(1);
    setListingType(null);
    setPaymentType(null);
    setItemId("");
    setQuantity("1");
    setSeedsAmount("");
    setDescription("");
    setPaymentItems([]);
    setNewPaymentItemId("");
    setNewPaymentItemQuantity("1");
    setError("");
    setAccepted(false);
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  const handleListingTypeSelect = (type: ListingType) => {
    setListingType(type);
    setStep(2);
  };

  const handlePaymentTypeSelect = (type: PaymentType) => {
    setPaymentType(type);
    setStep(3);
  };

  const handleAddPaymentItem = () => {
    if (newPaymentItemId && newPaymentItemQuantity) {
      setPaymentItems([
        ...paymentItems,
        { itemId: newPaymentItemId, quantity: parseInt(newPaymentItemQuantity) },
      ]);
      setNewPaymentItemId("");
      setNewPaymentItemQuantity("1");
    }
  };

  const handleRemovePaymentItem = (index: number) => {
    setPaymentItems(paymentItems.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    setError("");
    setSubmitting(true);

    try {
      const response = await fetch("/api/marketplace/listings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: listingType,
          itemId,
          quantity: parseInt(quantity),
          paymentType,
          seedsAmount: seedsAmount ? parseInt(seedsAmount) : null,
          description,
          paymentItems:
            paymentType === "ITEMS"
              ? paymentItems
              : [],
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "فشل في إنشاء القائمة");
      }

      // Wait for the marketplace to refresh before closing the dialog
      await onSuccess();
      handleClose();
    } catch (err: any) {
      console.error("Error creating listing:", err);
      setError(err.message || "حدث خطأ ما");
    } finally {
      setSubmitting(false);
    }
  };

  const canSubmit = () => {
    if (!itemId || !quantity || !description) return false;
    if (paymentType === "SEEDS" && !seedsAmount) return false;
    if (paymentType === "ITEMS" && paymentItems.length === 0) return false;
    return true;
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-black uppercase tracking-wide">
            {step === 1 && "اختر نوع القائمة"}
            {step === 2 && "ما الذي تريده في المقابل؟"}
            {step === 3 && "أدخل تفاصيل القائمة"}
            {step === 4 && "مراجعة وموافقة"}
          </DialogTitle>
        </DialogHeader>

        {/* Step 1: Choose Listing Type */}
        {step === 1 && (
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => handleListingTypeSelect("WTS")}
              className="flex h-full min-h-[200px] w-full flex-col items-center justify-center gap-3 rounded-xl bg-background/70 p-4 text-center transition hover:shadow-lg opacity-80 hover:opacity-100 duration-200 ease-out cursor-pointer border border-orange-500/60 hover:border-orange-400"
            >
              <div className="space-y-1">
                <p className="text-xl font-semibold text-orange-300">
                  أريد البيع
                </p>
                <p className="text-sm text-muted-foreground">WTS - Want to Sell</p>
              </div>
              <div className="mt-4 flex h-14 w-14 items-center justify-center rounded-full border border-orange-500/50 bg-orange-500/15 text-orange-300">
                <ShoppingCart className="h-7 w-7" />
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleListingTypeSelect("WTB")}
              className="flex h-full min-h-[200px] w-full flex-col items-center justify-center gap-3 rounded-xl bg-background/70 p-4 text-center transition hover:shadow-lg opacity-80 hover:opacity-100 duration-200 ease-out cursor-pointer border border-sky-400/60 hover:border-sky-300"
            >
              <div className="space-y-1">
                <p className="text-xl font-semibold text-sky-300">
                  أريد الشراء
                </p>
                <p className="text-sm text-muted-foreground">WTB - Want to Buy</p>
              </div>
              <div className="mt-4 flex h-14 w-14 items-center justify-center rounded-full border border-sky-400/50 bg-sky-400/15 text-sky-300">
                <DollarSign className="h-7 w-7" />
              </div>
            </button>
          </div>
        )}

        {/* Step 2: Choose Payment Type */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <button
                type="button"
                onClick={() => handlePaymentTypeSelect("SEEDS")}
                className="flex h-full min-h-[200px] w-full flex-col items-center justify-center gap-3 rounded-xl border border-border bg-background/70 p-4 text-center transition hover:border-primary/60 hover:shadow-lg opacity-80 hover:opacity-100 duration-200 ease-out cursor-pointer"
              >
                <div className="space-y-1">
                  <p className="text-xl font-semibold uppercase text-foreground">بذور</p>
                  <p className="text-sm text-muted-foreground">
                    أريد بذور في المقابل
                  </p>
                </div>
                <div className="mt-4 flex h-14 w-14 items-center justify-center rounded-full bg-secondary/30 text-primary">
                  <Sparkles className="h-7 w-7" />
                </div>
              </button>

              <button
                type="button"
                onClick={() => handlePaymentTypeSelect("ITEMS")}
                className="flex h-full min-h-[200px] w-full flex-col items-center justify-center gap-3 rounded-xl border border-border bg-background/70 p-4 text-center transition hover:border-primary/60 hover:shadow-lg opacity-80 hover:opacity-100 duration-200 ease-out cursor-pointer"
              >
                <div className="space-y-1">
                  <p className="text-xl font-semibold uppercase text-foreground">عناصر</p>
                  <p className="text-sm text-muted-foreground">
                    أريد عناصر محددة في المقابل
                  </p>
                </div>
                <div className="mt-4 flex h-14 w-14 items-center justify-center rounded-full bg-secondary/30 text-primary">
                  <ShoppingCart className="h-7 w-7" />
                </div>
              </button>

              <button
                type="button"
                onClick={() => handlePaymentTypeSelect("OPEN_OFFERS")}
                className="flex h-full min-h-[200px] w-full flex-col items-center justify-center gap-3 rounded-xl border border-border bg-background/70 p-4 text-center transition hover:border-primary/60 hover:shadow-lg opacity-80 hover:opacity-100 duration-200 ease-out cursor-pointer"
              >
                <div className="space-y-1">
                  <p className="text-xl font-semibold uppercase text-foreground">مفتوح للعروض</p>
                  <p className="text-sm text-muted-foreground">
                    سأقبل أي عرض جيد
                  </p>
                </div>
                <div className="mt-4 flex h-14 w-14 items-center justify-center rounded-full bg-secondary/30 text-primary">
                  <DollarSign className="h-7 w-7" />
                </div>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setStep(1)}
              className="rounded-lg border border-border px-3 py-2 text-sm text-muted-foreground transition hover:bg-secondary"
            >
              رجوع
            </button>
          </div>
        )}

        {/* Step 3: Fill Details */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>
                {listingType === "WTS" ? "العنصر للبيع" : "العنصر للشراء"}
              </Label>
              <ItemSelector
                selectedItemId={itemId}
                onSelect={setItemId}
                placeholder="اختر عنصراً"
              />
            </div>

            <div className="space-y-2">
              <Label>الكمية</Label>
              <Input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="1"
              />
            </div>

            {paymentType === "SEEDS" && (
              <div className="space-y-2">
                <Label>عدد البذور المطلوبة</Label>
                <Input
                  type="number"
                  min="1"
                  value={seedsAmount}
                  onChange={(e) => setSeedsAmount(e.target.value)}
                  placeholder="1000"
                />
              </div>
            )}

            {paymentType === "ITEMS" && (
              <div className="space-y-3">
                <Label>العناصر المطلوبة</Label>

                {paymentItems.length > 0 && (
                  <div className="space-y-2">
                    {paymentItems.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg"
                      >
                        <Badge variant="outline" className="flex-1">
                          عنصر {index + 1} - الكمية: {item.quantity}
                        </Badge>
                        <button
                          type="button"
                          onClick={() => handleRemovePaymentItem(index)}
                          className="rounded-lg p-2 text-muted-foreground transition hover:bg-secondary"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="space-y-2 p-3 border rounded-lg">
                  <ItemSelector
                    selectedItemId={newPaymentItemId}
                    onSelect={setNewPaymentItemId}
                    placeholder="اختر عنصراً"
                  />
                  <Input
                    type="number"
                    min="1"
                    value={newPaymentItemQuantity}
                    onChange={(e) => setNewPaymentItemQuantity(e.target.value)}
                    placeholder="الكمية"
                  />
                  <button
                    type="button"
                    onClick={handleAddPaymentItem}
                    disabled={!newPaymentItemId}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-semibold transition hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Plus className="h-4 w-4" />
                    إضافة عنصر
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label>الوصف</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="أضف أي تفاصيل إضافية..."
                rows={4}
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="rounded-lg border border-border px-3 py-2 text-sm text-muted-foreground transition hover:bg-secondary"
              >
                رجوع
              </button>
              <button
                type="button"
                onClick={() => setStep(4)}
                disabled={!canSubmit()}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-md transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                التالي
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Review and Accept */}
        {step === 4 && (
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="rounded-lg border border-border bg-secondary/10 p-3">
                <p className="text-sm font-semibold text-foreground">مراجعة</p>
                <p className="text-sm text-muted-foreground">
                  {listingType} {quantity}× {itemId ? "عنصر محدد" : "عنصر"} مقابل{" "}
                  {paymentType === "SEEDS"
                    ? `${seedsAmount || 0} بذور`
                    : paymentType === "ITEMS"
                    ? "عناصر محددة"
                    : "عروض مفتوحة"}
                </p>
              </div>

              <div className="rounded-lg border border-border bg-secondary/10 p-3 space-y-2 text-sm text-muted-foreground">
                <p className="font-semibold text-foreground">المنصة والمسؤولية</p>
                <ul className="list-disc space-y-1 pl-5">
                  <li>
                    <span className="font-semibold text-foreground">نطاق المنصة:</span> موقعنا هو منصة قوائم وإعادة توجيه فقط. نحن لا نوفر الدردشة أو التفاوض أو تنفيذ التداول. النقر على قائمة يعيد توجيه المستخدمين إلى خادم Discord، حيث تتم جميع الاتصالات والتداول.
                  </li>
                  <li>
                    <span className="font-semibold text-foreground">مسؤولية التداول:</span> جميع التداولات تتم بالكامل على Discord. نحن لا نراقب أو نتحقق أو نفرض التداولات ولسنا مسؤولين عن نتائج التداول أو النزاعات أو الاحتيال أو الخسائر أو سلوك المستخدمين على Discord.
                  </li>
                  <li>
                    <span className="font-semibold text-foreground">مسؤولية المستخدم:</span> أنت وحدك المسؤول عن سلامتك وأمانك وقراراتك عند التداول. يجب عليك التحقق من الطرف الآخر بنفسك والتداول على مسؤوليتك الخاصة.
                  </li>
                  <li>
                    <span className="font-semibold text-foreground">القوائم:</span> إنشاء قائمة لا يضمن تداولًا ناجحًا أو استجابة من مستخدمين آخرين.
                  </li>
                  <li>
                    <span className="font-semibold text-foreground">إخلاء المسؤولية:</span> نحن نعمل فقط كدليل وخدمة إعادة توجيه ولا نقدم أي ضمانات أو كفالات فيما يتعلق بالتداولات أو المستخدمين.
                  </li>
                </ul>
              </div>

              <label className="flex items-start gap-3 text-sm text-muted-foreground">
                <input
                  type="checkbox"
                  checked={accepted}
                  onChange={(e) => setAccepted(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-primary"
                />
                <span>
                  لقد قرأت وأقبل نطاق المنصة ومسؤولية التداول ومسؤولية المستخدم وتوقعات القوائم وإخلاء المسؤولية أعلاه.
                </span>
              </label>
            </div>

            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-lg">
                {error}
              </div>
            )}

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="rounded-lg border border-border px-3 py-2 text-sm text-muted-foreground transition hover:bg-secondary"
              >
                رجوع
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!accepted || submitting}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-md transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "جاري النشر..." : "نشر القائمة"}
              </button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
