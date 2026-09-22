"use client";

import { DashboardScreen } from "@/modules/dashboard/screens/DashboardScreen";
import { StudentDashboardScreen } from "@/modules/student/screens/StudentDashboardScreen";
import { useRole } from "@/modules/core/contexts/RoleProvider";

export default function DashboardPage() {
  const { role } = useRole();

  if (role === "student") {
    return <StudentDashboardScreen />;
  }

  return <DashboardScreen />;
}
