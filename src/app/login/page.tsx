import { LoginScreen } from "@/modules/auth/screens/LoginScreen";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Iniciar Sesión | Z-Suite",
  description: "Ingresa al workspace de Z-Suite usando tu cédula.",
};

export default function LoginPage() {
  return <LoginScreen />;
}
