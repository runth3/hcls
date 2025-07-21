
'use client';

import { ClaimsTable } from "@/components/claims/claims-table";
import { getMockClaims, mockClaimBatches } from "@/lib/mock-data";
import type { Claim, ClaimBatch } from "@/lib/types";
import { notFound, useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Package } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useMemo, useState, useEffect } from "react";
import { format, parseISO } from "date-fns";

export default function BatchDetailPage() {
  const params = useParams<{ id: string }>();
  const batchId = params.id;

  const batch: ClaimBatch | undefined = useMemo(() => mockClaimBatches.find(b => b.id === batchId), [batchId]);
  const claimsInBatch: Claim[] = useMemo(() => getMockClaims().filter(claim => claim.batchId === batchId), [batchId]);

  const [formattedIngestionTimestamp, setFormattedIngestionTimestamp] = useState<string | null>(null);

  useEffect(() => {
    if (batch?.ingestionTimestamp) {
      // This formatting runs only on the client, after initial hydration
      setFormattedIngestionTimestamp(format(parseISO(batch.ingestionTimestamp), 'PPPp'));
    }
  }, [batch?.ingestionTimestamp]); // Dependency array ensures this runs when batch.ingestionTimestamp is available/changes

  if (!batch) {
    notFound();
    return null;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" asChild>
            <Link href="/batches">
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back to Batches</span>
            </Link>
            </Button>
            <div className="flex items-center gap-2">
                <Package className="h-7 w-7 text-primary" />
                <h1 className="text-3xl font-bold tracking-tight">Batch Details: {batch.id}</h1>
            </div>
        </div>
        {/* Future actions for the batch itself could go here */}
      </div>

      <Card className="shadow-lg">
        <CardHeader>
            <CardTitle>Batch Information</CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-3 gap-4 text-sm">
            <div><strong>Batch ID:</strong> {batch.id}</div>
            <div><strong>Source System:</strong> {batch.sourceSystem}</div>
            <div><strong>Ingested At:</strong> {formattedIngestionTimestamp || (batch.ingestionTimestamp ? format(parseISO(batch.ingestionTimestamp), 'PPP') + ' (loading time...)' : 'N/A')}</div>
            <div><strong>Claims in Batch:</strong> {batch.claimCountInBatch}</div>
            <div><strong>Status:</strong> {batch.status}</div>
            {batch.originalFileName && <div><strong>Original File:</strong> {batch.originalFileName}</div>}
        </CardContent>
      </Card>
      
      <Card className="shadow-lg">
        <CardHeader>
            <CardTitle>Claims in this Batch ({claimsInBatch.length})</CardTitle>
            <CardDescription>List of claims associated with batch {batch.id}.</CardDescription>
        </CardHeader>
        <CardContent>
            {claimsInBatch.length > 0 ? (
                <ClaimsTable claims={claimsInBatch} />
            ) : (
                <p className="text-muted-foreground">No claims found in this batch.</p>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
