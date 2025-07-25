import { Suspense } from "react";
import ResumeScoringClient from "./ResumeScoringClient";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResumeScoringClient />
    </Suspense>
  );
}
