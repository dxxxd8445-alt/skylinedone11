"use client";

import { useEffect } from "react";
import { useI18n } from "@/lib/i18n-context";

export function I18nDocument() {
  const { language } = useI18n();

  useEffect(() => {
    const el = document.documentElement;
    el.lang = language;
    el.dir = language === "ar" ? "rtl" : "ltr";
  }, [language]);

  return null;
}
