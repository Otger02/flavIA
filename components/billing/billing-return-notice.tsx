"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

type BillingReturnNoticeProps = {
  status: "success" | "cancelled" | null;
  awaitingSync?: boolean;
};

export function BillingReturnNotice({
  status,
  awaitingSync = false,
}: BillingReturnNoticeProps) {
  const t = useTranslations("billing");
  const router = useRouter();
  const refreshAttemptsRef = useRef(0);

  useEffect(() => {
    if (status !== "success" || !awaitingSync) {
      return;
    }

    const intervalId = window.setInterval(() => {
      refreshAttemptsRef.current += 1;
      router.refresh();

      if (refreshAttemptsRef.current >= 3) {
        window.clearInterval(intervalId);
      }
    }, 2000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [awaitingSync, router, status]);

  if (!status) {
    return null;
  }

  if (status === "success") {
    return (
      <div className="rounded-[1.5rem] border border-emerald-200/50 bg-emerald-50/60 p-4 text-sm leading-6">
        <p className="font-medium text-emerald-800">{t("billing_return.success_title")}</p>
        <p className="mt-2 text-emerald-700">
          {awaitingSync
            ? t("billing_return.success_syncing")
            : t("billing_return.success_ready")}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-[1.5rem] border border-amber-200/50 bg-amber-50/60 p-4 text-sm leading-6">
      <p className="font-medium text-amber-800">{t("billing_return.cancelled_title")}</p>
      <p className="mt-2 text-amber-700">
        {t("billing_return.cancelled_description")}
      </p>
    </div>
  );
}
