import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AuthForm from "@/components/AuthForm";
import { getUser } from "@/lib/session";

export const metadata: Metadata = { title: "Sign up" };

export default async function SignupPage() {
  if (await getUser()) redirect("/dashboard");
  return <AuthForm mode="signup" />;
}
