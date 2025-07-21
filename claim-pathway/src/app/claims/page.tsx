
import { ClaimsTable } from "@/components/claims/claims-table";
import { Button } from "@/components/ui/button";
import { getMockClaims } from "@/lib/mock-data";
import { PlusCircle } from "lucide-react";
import Link from "next/link";

// This page should ideally be a client component if filters are interactive client-side
// or use URL query params for server-side filtering.
// For now, we pass all claims and let ClaimsTable handle basic display.

export default function ClaimsPage() {
  const claims = getMockClaims();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Claims Management</h1>
        {/* "New Claim" button removed from here */}
      </div>
      {/* Placeholder for filter controls */}
      {/* <div className="p-4 border rounded-lg bg-card">
        <p className="text-sm text-muted-foreground">Filter controls will be here (Date, Status, Risk Level)</p>
      </div> */}
      <ClaimsTable claims={claims} />
    </div>
  );
}
