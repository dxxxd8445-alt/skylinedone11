"use client";

import Image from "next/image";
import Link from "next/link";
import { Shield, ShoppingCart, Clock } from "lucide-react";
import { useCurrency } from "@/lib/currency-context";
import { useI18n } from "@/lib/i18n-context";
import { formatMoney } from "@/lib/money";

type Product = {
  id: string;
  name: string;
  slug: string;
  game: string;
  image: string;
  status: string;
  pricing?: { duration: string; price: number; stock: number }[];
};

function gameToSlug(game: string): string {
  return game.toLowerCase().replace(/[:\s]+/g, "-").replace(/--+/g, "-");
}

export function GameProductsGrid({
  products,
  gameSlug,
  accentColor,
  cardGradients,
  title,
}: {
  products: Product[];
  gameSlug: string;
  accentColor: string;
  cardGradients: string[];
  title: string;
}) {
  const { currency } = useCurrency();
  const { locale, t } = useI18n();

  return (
    <>
      <p className="text-white/50 text-sm mb-6 text-center">
        <span className="text-white font-semibold">{products.length}</span>{" "}
        {products.length === 1 ? t("product") : t("products")} {t("in_this_category")}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product, index) => {
          const cardGradient = cardGradients[index % cardGradients.length];
          const prices = product.pricing?.length ? product.pricing.map((p) => p.price) : [0];
          const lowestPrice = Math.min(...prices);

          return (
            <div
              key={product.id}
              className="group relative rounded-xl overflow-hidden bg-[#111111] border border-[#1a1a1a] hover:border-[#333] transition-all duration-300"
            >
              <div className={`relative aspect-[4/3] overflow-hidden bg-gradient-to-br ${cardGradient}`}>
                <Image
                  src={product.image || "/placeholder.svg"}
                  alt={product.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-transparent to-transparent" />

                {index === 0 && (
                  <div className="absolute top-3 left-3 px-2.5 py-1 bg-[#111111]/90 backdrop-blur-sm rounded text-[10px] font-bold uppercase tracking-wider text-white">
                    {t("most_popular")}
                  </div>
                )}
                {index === 1 && products.length > 1 && (
                  <div className="absolute top-3 left-3 px-2.5 py-1 bg-[#111111]/90 backdrop-blur-sm rounded text-[10px] font-bold uppercase tracking-wider text-green-400">
                    {t("safest")}
                  </div>
                )}
              </div>

              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-white font-bold text-lg truncate pr-2">{product.name}</h3>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <span className="text-white/50 text-xs">{t("from").toUpperCase()}</span>
                    <span
                      className="font-bold text-sm px-2 py-0.5 rounded"
                      style={{ backgroundColor: `${accentColor}20`, color: accentColor }}
                    >
                      {formatMoney({ amountUsd: lowestPrice, currency, locale })}
                    </span>
                  </div>
                </div>

                <div className="mb-4">
                  {product.status === "active" ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-medium">
                      <Shield className="w-3 h-3" />
                      {t("undetected_working")}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-yellow-500/20 text-yellow-400 text-xs font-medium">
                      <Clock className="w-3 h-3" />
                      {t("maintenance")}
                    </span>
                  )}
                </div>

                <Link
                  href={`/store/${gameSlug}/${product.slug}`}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#1a1a1a] hover:bg-[#252525] border border-[#333] rounded-lg text-white font-medium transition-all duration-200 active:scale-[0.98]"
                >
                  <ShoppingCart className="w-4 h-4" />
                  {t("buy_now")}
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-12 text-center">
        <Link
          href="/store"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1a1a1a] border border-[#262626] text-white/80 hover:text-white hover:border-[#dc2626]/50 hover:bg-[#1f1f1f] transition-all"
        >
          <span>&larr;</span>
          {t("back_to_all_games")}
        </Link>
      </div>

      <div className="sr-only">{title}</div>
    </>
  );
}
