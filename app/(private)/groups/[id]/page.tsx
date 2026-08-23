import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getGroupDetail } from "@/lib/data/groups";
import GroupDetailView from "@/components/GroupDetailView";

type PageParams = { params: Promise<{ id: string }> };

export default async function GroupDetail({ params }: PageParams) {
  const { id } = await params;
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) redirect("/login");

  const group = await getGroupDetail(userId, id);

  // Also lands here right after the group is deleted from this same page —
  // the delete confirm calls router.refresh() rather than navigating away.
  if (!group) {
    redirect("/groups");
  }

  return <GroupDetailView group={group} />;
}
