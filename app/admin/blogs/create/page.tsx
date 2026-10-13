"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/admin/ui";
import { newId } from "@/lib/cms/sections";

/** Starts a new article: nothing is stored until its first "Save draft". */
export default function CreateArticlePage() {
  const router = useRouter();
  useEffect(() => {
    router.replace(`/admin/blogs/edit/${newId("article")}?new=1`);
  }, [router]);
  return <Spinner label="Starting a new article…" />;
}
