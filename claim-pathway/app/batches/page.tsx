
'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { mockClaimBatches, getMockClaims } from "@/lib/mock-data";
import type { ClaimBatch, ClaimProcessingStatus } from "@/lib/types";
import { format, parseISO, startOfDay, isSameDay } from 'date-fns';
import Link from "next/link";
import { PackageSearch, PlusCircle, FileInput, DatabaseZap, Users, ChevronDown } from "lucide-react";
import { DatePicker } from "@/components/ui/date-picker";
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

interface BatchClaimCounts {
  raw: number;
  enriched: number;
  reviewRequired: number;
  processed: number;
  other: number;
}

export default function ClaimBatchesPage() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const allBatches = mockClaimBatches;
  const allClaims = getMockClaims();
  const { toast } = useToast();

  const filteredBatches = useMemo(() => {
    if (!selectedDate) return allBatches;
    const startOfSelected = startOfDay(selectedDate);
    return allBatches.filter(batch => 
      isSameDay(parseISO(batch.ingestionTimestamp), startOfSelected)
    );
  }, [allBatches, selectedDate]);

  const getClaimCountsForBatch = (batchId: string): BatchClaimCounts => {
    const relevantClaims = allClaims.filter(claim => claim.batchId === batchId);
    const counts: BatchClaimCounts = {
      raw: 0,
      enriched: 0,
      reviewRequired: 0,
      processed: 0,
      other: 0,
    };
    relevantClaims.forEach(claim => {
      switch (claim.processingStatus) {
        case 'Raw':
          counts.raw++;
          break;
        case 'Enriched':
          counts.enriched++;
          break;
        case 'ReviewRequired':
          counts.reviewRequired++;
          break;
        case 'Processed':
          counts.processed++;
          break;
        default:
          counts.other++;
          break;
      }
    });
    return counts;
  };

  const handleSimulatedIngestion = (sourceType: string) => {
    toast({
      title: "Batch Ingestion Simulated",
      description: `A new batch from '${sourceType}' is being processed (simulated).`,
    });
    // In a real app, this would trigger an API call to create a new batch
    // and potentially add some mock claims to it, then refresh the batch list.
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <PackageSearch className="h-7 w-7 text-primary" />
        <h1 className="text-3xl font-bold tracking-tight">Claim Batches</h1>
      </div>

      <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Claim Ingestion Batches</CardTitle>
            <CardDescription>
              Overview of ingested claim batches. Defaulting to batches from {selectedDate ? format(selectedDate, "PPP") : "selected date"}.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <DatePicker date={selectedDate} setDate={setSelectedDate} />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Simulate Batch Ingestion
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel>Choose Ingestion Source</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/claims/new" className="flex items-center w-full">
                    <Users className="mr-2 h-4 w-4" />
                    Manual Claim Entry
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSimulatedIngestion('Core System Sync')}>
                  <DatabaseZap className="mr-2 h-4 w-4" />
                  Core System Sync
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSimulatedIngestion('External API (HL7 FHIR)')}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-4 w-4 lucide lucide-webhook"><path d="M18 16.99V13a6 6 0 0 0-11.42 2.56"/><path d="M16 17L12 21L8 17"/><path d="M12 12.56V3.5A2.5 2.5 0 0 1 14.5 1h0A2.5 2.5 0 0 1 17 3.5v1"/></svg>
                  External API (HL7 FHIR)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSimulatedIngestion('File Upload (CSV, XML)')}>
                  <FileInput className="mr-2 h-4 w-4" />
                  File Upload (CSV, XML)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent>
          {filteredBatches.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Batch ID</TableHead>
                  <TableHead>Source System</TableHead>
                  <TableHead>Ingested At</TableHead>
                  <TableHead className="text-center">Total Claims</TableHead>
                  <TableHead className="text-center">Raw</TableHead>
                  <TableHead className="text-center">Enriched</TableHead>
                  <TableHead className="text-center">Review Req.</TableHead>
                  <TableHead className="text-center">Processed</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBatches.map((batch) => {
                  const counts = getClaimCountsForBatch(batch.id);
                  return (
                    <TableRow key={batch.id}>
                      <TableCell className="font-medium">
                        <Link href={`/batches/${batch.id}`} className="text-primary hover:underline">
                          {batch.id}
                        </Link>
                      </TableCell>
                      <TableCell>{batch.sourceSystem}{batch.originalFileName ? ` (${batch.originalFileName})` : ''}</TableCell>
                      <TableCell>{format(parseISO(batch.ingestionTimestamp), 'dd MMM yyyy, HH:mm')}</TableCell>
                      <TableCell className="text-center">{batch.claimCountInBatch}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant={counts.raw > 0 ? "secondary" : "outline"}>{counts.raw}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={counts.enriched > 0 ? "default" : "outline"} className={counts.enriched > 0 ? "bg-green-600 text-white" : ""}>{counts.enriched}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={counts.reviewRequired > 0 ? "destructive" : "outline"}>{counts.reviewRequired}</Badge>
                      </TableCell>
                       <TableCell className="text-center">
                        <Badge variant={counts.processed > 0 ? "default" : "outline"} className={counts.processed > 0 ? "bg-purple-600 text-white" : ""}>{counts.processed}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={batch.status === 'Completed' ? 'default' : batch.status === 'Error' ? 'destructive' : 'secondary'}>
                          {batch.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground text-center py-8">No claim batches found for {selectedDate ? format(selectedDate, "PPP") : "the selected date"}.</p>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
            <CardTitle>Understanding Claim Processing Statuses</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
            <p><strong>Raw:</strong> Claim ingested, awaiting AI processing (enrichment, validation).</p>
            <p><strong>Enrichment Pending:</strong> (Intermediate state, not typically shown) Queued for AI enrichment.</p>
            <p><strong>Enriched:</strong> AI has processed the claim, added derived data, and assessed initial quality as 'Clean'. This is a type of 'Clean Claim'.</p>
            <p><strong>Review Required:</strong> AI has flagged the claim for human review due to potential issues, missing data, or anomalies. This is an 'Unprocessed/Bad Claim'.</p>
            <p><strong>Processed:</strong> Claim has passed all AI checks and (if applicable) human review, and is ready for further system actions (e.g., payment, final decisioning). This is another type of 'Clean Claim'.</p>
            <p><strong>Archived:</strong> Claim is finalized and stored for historical purposes.</p>
        </CardContent>
      </Card>
    </div>
  );
}

