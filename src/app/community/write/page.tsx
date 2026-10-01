import { Suspense } from "react";
import WriteForm from "@/components/community/write/WriteForm";

/** Write a community post — Figma node 564:5704 */
export default function WritePage() {
  // WriteForm reads `?edit=`, which a prerendered page has to suspend on.
  return (
    <Suspense fallback={<div className="min-h-full w-full bg-white" />}>
      <WriteForm />
    </Suspense>
  );
}
