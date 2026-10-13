"use client";

import { use } from "react";
import { useSearchParams } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/AdminShell";
import { ArticleEditor } from "@/components/admin/ArticleEditor";

export default function EditArticlePage({ params }: PageProps<"/admin/blogs/edit/[id]">) {
  const { id } = use(params);
  const isNew = useSearchParams().get("new") === "1";
  return (
    <>
      <AdminPageHeader title={isNew ? "New article" : "Edit article"} />
      <ArticleEditor key={id} id={id} isNew={isNew} />
    </>
  );
}
