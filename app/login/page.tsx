import { Suspense } from "react";
import LoginForm from "./LoginForm";
import { Toaster } from "@/components/ui/sonner";

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
      <Toaster />
    </Suspense>
  );
}
