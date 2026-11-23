import Header from "@/components/layout/Header";
import LoginForm from "@/components/auth/LoginForm";
import { getRequestSession } from "@/lib/session";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Sign in",
};

export default async function LoginPage() {
  const session = await getRequestSession();
  if (session) redirect("/profile");

  return (
    <div className="flex flex-1 flex-col bg-[var(--color-bg-main)] text-[var(--color-black)]">
      <Header />
      <main className="container-grid items-center justify-center">
        <LoginForm />
      </main>
    </div>
  );
}
