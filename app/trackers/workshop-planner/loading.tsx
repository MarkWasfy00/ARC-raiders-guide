export default function Loading() {
  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-xl font-semibold">جاري تحميل مخطط الورشة</h2>
          <p className="text-muted-foreground text-sm">قد يستغرق هذا بضع ثوان...</p>
        </div>
      </div>
    </div>
  );
}
