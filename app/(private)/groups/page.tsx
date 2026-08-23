import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getGroups } from "@/lib/data/groups";
import { GroupCard } from "@/components/GroupCard";
import { ArrowLeft } from "lucide-react";
import GroupsAddButton from "@/components/GroupsAddButton";
import { GroupStatus } from "@/lib/generated/prisma/enums";

export default async function Groups() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) redirect("/login");

  const groups = await getGroups(userId);

  const activeGroups = groups.filter((g) => g.status === GroupStatus.ACTIVE);
  const archivedGroups = groups.filter(
    (g) => g.status === GroupStatus.ARCHIVED,
  );

  return (
    <div className="w-full min-h-dvh p-4 max-w-md mx-auto">
      <div className="flex items-center justify-between pb-4">
        <a href="/home">
          <ArrowLeft className="w-5 h-5" />
        </a>
        <h1 className="font-semibold text-base">Groups</h1>
        <GroupsAddButton />
      </div>

      {groups.length === 0 ? (
        <p className="text-center py-16 text-sm text-muted-foreground">
          No groups yet. Create one for your next trip or shared occasion.
        </p>
      ) : (
        <>
          {activeGroups.length > 0 && (
            <>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">
                Active
              </p>
              <div className="flex flex-col gap-3 mb-5">
                {activeGroups.map((group) => (
                  <GroupCard key={group.id} group={group} />
                ))}
              </div>
            </>
          )}

          {archivedGroups.length > 0 && (
            <>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">
                Archived
              </p>
              <div className="flex flex-col gap-3">
                {archivedGroups.map((group) => (
                  <GroupCard key={group.id} group={group} />
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
