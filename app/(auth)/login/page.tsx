import type { Metadata } from "next";
import { Suspense } from "react";

import LoginForm from "./login-form";

export const metadata: Metadata = {
  title: "Iniciar Sesión",
  description:
    "Accede a tu espacio en Flavia. Entra con tu email para continuar tus conversaciones y contenido personalizado.",
};

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
