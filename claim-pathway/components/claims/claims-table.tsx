
"use client";

import * as React from "react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Claim, ClaimProcessingStatus } from "@/lib/types";
import { ArrowUpDown, MoreHorizontal, Eye, Activity, CheckSquare, AlertOctagon, Archive } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { format, parseISO } from 'date-fns';

interface ClaimsTableProps {
  claims: Claim[];
}

export function ClaimsTable({ claims }: ClaimsTableProps) {
  const [sortConfig, setSortConfig] = React.useState<{ key: keyof Claim | null; direction: 'ascending' | 'descending' } | null>(null);

  const sortedClaims = React.useMemo(() => {
    let sortableClaims = [...claims];
    if (sortConfig !== null && sortConfig.key) {
      sortableClaims.sort((a, b) => {
        const valA = a[sortConfig.key!];
        const valB = b[sortConfig.key!];

        if (valA === undefined || valB === undefined) return 0;

        if (typeof valA === 'number' && typeof valB === 'number') {
            return sortConfig.direction === 'ascending' ? valA - valB : valB - valA;
        }
        if (typeof valA === 'string' && typeof valB === 'string') {
            if (['submissionDate', 'lastUpdateDate'].includes(sortConfig.key! as string)) {
                 const dateA = parseISO(valA as string).getTime();
                 const dateB = parseISO(valB as string).getTime();
                 return sortConfig.direction === 'ascending' ? dateA - dateB : dateB - dateA;
            }
            return sortConfig.direction === 'ascending' ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }
        return 0;
      });
    }
    return sortableClaims;
  }, [claims, sortConfig]);

  const requestSort = (key: keyof Claim) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortIndicator = (key: keyof Claim) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <ArrowUpDown className="ml-2 h-4 w-4 opacity-50 inline-block" />;
    }
    return sortConfig.direction === 'ascending' ? '🔼' : '🔽';
  };

  const getStatusVariant = (status: Claim['status']): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'Approved': return 'default';
      case 'Partially Approved': return 'default';
      case 'Pending Review':
      case 'Under Review':
      case 'Additional Info Required':
      case 'Submitted':
      case 'Appealed':
       return 'secondary';
      case 'Denied': return 'destructive';
      case 'Flagged for Audit': return 'destructive';
      case 'Closed': return 'outline';
      default: return 'outline';
    }
  };

  const getRiskVariant = (risk: Claim['riskLevel']): "default" | "secondary" | "destructive" | "outline" => {
    switch(risk) {
      case 'Low': return 'secondary';
      case 'Medium': return 'default';
      case 'High':
      case 'Critical': return 'destructive';
      default: return 'outline';
    }
  };

  const getProcessingStatusVariant = (status: ClaimProcessingStatus): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'Raw': return 'outline';
      case 'EnrichmentPending': return 'secondary';
      case 'Enriched': return 'default';
      case 'ReviewRequired': return 'destructive';
      case 'Processed': return 'default'; // Consider a different color like green if 'default' is blue
      case 'Archived': return 'outline';
      default: return 'secondary';
    }
  };

  const getProcessingStatusIcon = (status: ClaimProcessingStatus) => {
    switch (status) {
      case 'Raw': return <Activity className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" />;
      case 'EnrichmentPending': return <Activity className="mr-1.5 h-3.5 w-3.5 text-blue-500" />;
      case 'Enriched': return <CheckSquare className="mr-1.5 h-3.5 w-3.5 text-green-600" />;
      case 'ReviewRequired': return <AlertOctagon className="mr-1.5 h-3.5 w-3.5 text-red-600" />;
      case 'Processed': return <CheckSquare className="mr-1.5 h-3.5 w-3.5 text-purple-600" />;
      case 'Archived': return <Archive className="mr-1.5 h-3.5 w-3.5 text-gray-500" />;
      default: return <Activity className="mr-1.5 h-3.5 w-3.5" />;
    }
  };


  return (
    <div className="rounded-lg border shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40px]">
              <Checkbox aria-label="Select all rows" />
            </TableHead>
            <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => requestSort('claimNumber')}>
              Claim ID {getSortIndicator('claimNumber')}
            </TableHead>
            <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => requestSort('patientName')}>
              Patient {getSortIndicator('patientName')}
            </TableHead>
            <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => requestSort('submissionDate')}>
              Submitted {getSortIndicator('submissionDate')}
            </TableHead>
            <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => requestSort('claimSource')}>
              Source {getSortIndicator('claimSource')}
            </TableHead>
            <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => requestSort('claimType')}>
              Type {getSortIndicator('claimType')}
            </TableHead>
            <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => requestSort('status')}>
              Status {getSortIndicator('status')}
            </TableHead>
             <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => requestSort('processingStatus')}>
              Proc. Status {getSortIndicator('processingStatus')}
            </TableHead>
            <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => requestSort('riskLevel')}>
              Risk {getSortIndicator('riskLevel')}
            </TableHead>
            <TableHead className="text-right cursor-pointer hover:bg-muted/50" onClick={() => requestSort('claimAmount')}>
              Amount ({claims[0]?.currency || 'N/A'}) {getSortIndicator('claimAmount')}
            </TableHead>
            <TableHead className="text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedClaims.map((claim) => (
            <TableRow key={claim.id} data-state={/* selectedRows.includes(claim.id) && */ "selected"}>
              <TableCell>
                 <Checkbox aria-label={`Select row ${claim.claimNumber}`} />
              </TableCell>
              <TableCell className="font-medium">
                <Link href={`/claims/${claim.id}`} className="hover:underline text-primary">
                  {claim.claimNumber}
                </Link>
              </TableCell>
              <TableCell>{claim.patientName}</TableCell>
              <TableCell>{format(parseISO(claim.submissionDate), 'dd MMM yyyy')}</TableCell>
              <TableCell><Badge variant="outline" className="whitespace-nowrap">{claim.claimSource}</Badge></TableCell>
              <TableCell><Badge variant="outline" className="whitespace-nowrap">{claim.claimType}</Badge></TableCell>
              <TableCell>
                <Badge variant={getStatusVariant(claim.status)}>{claim.status}</Badge>
              </TableCell>
              <TableCell>
                <Badge variant={getProcessingStatusVariant(claim.processingStatus)} className="flex items-center">
                  {getProcessingStatusIcon(claim.processingStatus)}
                  {claim.processingStatus}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant={getRiskVariant(claim.riskLevel)}>{claim.riskLevel}</Badge>
              </TableCell>
              <TableCell className="text-right">{claim.claimAmount.toLocaleString()}</TableCell>
              <TableCell className="text-center">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem asChild>
                       <Link href={`/claims/${claim.id}`} className="flex items-center">
                        <Eye className="mr-2 h-4 w-4" /> View Details
                       </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>Edit Claim (TBD)</DropdownMenuItem>
                    {claim.processingStatus === 'Raw' && <DropdownMenuItem>Process/Enrich Claim (TBD)</DropdownMenuItem>}
                    {claim.processingStatus === 'ReviewRequired' && <DropdownMenuItem>Review Claim Data (TBD)</DropdownMenuItem>}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive">Delete Claim (TBD)</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
