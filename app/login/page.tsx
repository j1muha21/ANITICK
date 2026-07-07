import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AuthForm from "@/components/AuthForm";
import { getUser } from "@/lib/session";

export const metadata: Metadata = { title: "Log in" };

export default async function LoginPage() {
  if (await getUser()) redirect("/dashboard");
  return <AuthForm mode="login" />;
}
