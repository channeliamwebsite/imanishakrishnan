"use client";

import { AdminPageHeader } from "@/components/admin/AdminShell";
import { SectionEditor } from "@/components/admin/SectionEditor";
import { STATISTIC_FIELDS } from "@/lib/cms/forms";

export default function StatisticsAdminPage() {
  return (
    <>
      <AdminPageHeader
        title="Statistics"
        description="The figures under the hero. The eye icon hides a figure without deleting it; the arrows set the order."
      />
      <SectionEditor
        section="statistics"
        title="Statistics"
        fields={STATISTIC_FIELDS}
        itemLabel="Statistic"
        summary={(item) => [item.value, item.title].filter(Boolean).join(" · ")}
        preview="statistics"
      />
    </>
  );
}
