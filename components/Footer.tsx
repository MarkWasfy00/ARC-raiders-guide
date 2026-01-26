import Link from "next/link";
import { Github, Twitter, Gamepad2 } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-card/50 backdrop-blur-sm mt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* About */}
          <div className="space-y-3">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <Gamepad2 className="h-5 w-5" />
              3RB
            </h3>
            <p className="text-sm text-muted-foreground">
              دليلك الشامل للعبة ARC Raiders - قواعد بيانات، خرائط، أدلة، وأدوات
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="font-semibold">روابط سريعة</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/items"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  العناصر
                </Link>
              </li>
              <li>
                <Link
                  href="/quests"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  المهام
                </Link>
              </li>
              <li>
                <Link
                  href="/traders"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  التجار
                </Link>
              </li>
              <li>
                <Link
                  href="/events"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  الأحداث
                </Link>
              </li>
            </ul>
          </div>

          {/* Community */}
          <div className="space-y-3">
            <h4 className="font-semibold">المجتمع</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/blogs"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  المدونة
                </Link>
              </li>
              <li>
                <Link
                  href="/marketplace"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  السوق
                </Link>
              </li>
              <li>
                <Link
                  href="/guides"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                   الأدلة
                </Link>
              </li>
              <li>
                <Link
                  href="/loadouts"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                   الحمولات
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-3">
            <h4 className="font-semibold">الخرائط</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/maps/dam-battlegrounds"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  السد
                </Link>
              </li>
              <li>
                <Link
                  href="/maps/the-spaceport"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  الميناء الفضائى
                </Link>
              </li>
              <li>
                <Link
                  href="/maps/the-spaceport"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  المدينة المدفونة
                </Link>
              </li>
              <li>
                <Link
                  href="/maps/blue-gate"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  البوابة الزرقاء
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm text-muted-foreground text-center md:text-start">
            <p>© {currentYear} 3RB. جميع الحقوق محفوظة.</p>
            <p className="mt-1">
              البيانات مقدمة من{" "}
              <a
                href="https://metaforge.app/arc-raiders"
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground hover:underline"
              >
                MetaForge
              </a>
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              © {currentYear} 3RB – حقوق الملكية الفكرية وجميع المحتويات الخاصة بلعبة ARC Raiders تعود إلى Embark Studios. هذا الموقع هو مشروع من صنع المعجبين فقط، ولا يمثل أو يتبع شركة Embark Studios بأي شكل من الأشكال.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
