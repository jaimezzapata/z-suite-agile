import { GroupsScreen } from "@/modules/projects/screens/GroupsScreen";
import { getGroups } from "@/modules/projects/actions/project-actions";

export const dynamic = "force-dynamic"; // Para asegurar que no quede cacheado de forma estática siempre

export default async function GroupsPage() {
  const result = await getGroups();
  
  // Si falla la consulta, pasamos un array vacío o manejamos el error
  const groups = result.success && result.groups ? result.groups : [];

  return <GroupsScreen initialGroups={groups} />;
}
