"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

type BillingReturnNoticeProps = {
  status: "success" | "cancelled" | null;
  awaitingSync?: boolean;
};

export function BillingReturnNotice({
  status,
  awaitingSync = false,
}: BillingReturnNoticeProps) {
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
      <div className="rounded-[1.5rem] border border-emerald-300/30 bg-emerald-400/10 p-4 text-sm leading-6 text-emerald-50">
        <p className="font-medium text-white">Pago completado</p>
        <p className="mt-2 text-emerald-100/90">
          {awaitingSync
            ? "Estamos confirmando tu plan con Stripe y actualizando el estado de la cuenta. Si tarda unos segundos, esta pantalla se refrescará sola."
            : "Tu suscripción ya está activa y el estado de tu cuenta se ha actualizado."}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-[1.5rem] border border-amber-300/30 bg-amber-300/10 p-4 text-sm leading-6 text-amber-50">
      <p className="font-medium text-white">Checkout cancelado</p>
      <p className="mt-2 text-amber-100/90">
        No se realizó ningún cargo. Puedes volver a intentarlo cuando quieras desde esta misma pantalla.
      </p>
    </div>
  );
}