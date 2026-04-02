import { Suspense } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-providers";
import ClientShell from "@/app/components/general/ClientShell";
import { NotificationsProvider } from "@/context/NotificationsContext";

async function ProtectedContent({ children }: { children: React.ReactNode }) {

  const session = await getServerSession(authOptions);
  const userId = session?.user?.id || null;

  return (
    <NotificationsProvider>
      <ClientShell userId={userId}>{children}</ClientShell>
    </NotificationsProvider>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F8FAFD] flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-4 border-[#5865F2] border-t-transparent rounded-full"></div>
        </div>
      }
    >
      <ProtectedContent>{children}</ProtectedContent>
    </Suspense>
  );
}
