import { prisma } from "@/modules/core/lib/prisma";
import { getGroupStudents } from "@/modules/projects/actions/student-actions";
import { GroupDetailScreen } from "@/modules/projects/screens/GroupDetailScreen";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function GroupDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  
  const group = await prisma.groups.findUnique({
    where: { id: resolvedParams.id }
  });

  if (!group) {
    notFound();
  }

  const result = await getGroupStudents(resolvedParams.id);
  const students = result.success && result.students ? result.students : [];

  return <GroupDetailScreen group={group} students={students} />;
}


