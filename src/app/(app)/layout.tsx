import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Header } from "@/components/layout/Header";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAuthSession();

  if (!session?.user?.id) {
    redirect("/login");
  }

  // Fetch user organizations for sidebar and header context
  const memberships = await prisma.organizationMember.findMany({
    where: { userId: session.user.id },
    include: {
      organization: {
        select: { id: true, name: true, slug: true },
      },
    },
  });

  const userOrgs = memberships.map((m) => ({
    id: m.organization.id,
    name: m.organization.name,
    slug: m.organization.slug,
    userRole: m.role,
  }));

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <AppSidebar userOrgs={userOrgs} className="hidden md:flex shrink-0" />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header userOrgs={userOrgs} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
