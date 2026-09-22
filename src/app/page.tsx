import { redirect } from "next/navigation";

export default function RootPage() {
  // Redirigir siempre a la pantalla de login como interfaz inicial
  redirect("/login");
}
