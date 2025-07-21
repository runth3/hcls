
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter } from "lucide-react";
import { getMockClaims } from "@/lib/mock-data";
import type { Claim } from "@/lib/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Link from "next/link";
import { format, parseISO } from 'date-fns';

export default function AuditPage() {
  const claims = getMockClaims(); // In a real app, fetch claims with rich audit data

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Audit Trail</h1>
        {/* Add any high-level actions if needed */}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search & Filter Audits</CardTitle>
          <CardDescription>Use the controls below to search and filter audit events across claims.</CardDescription>
        </CardHeader>
        <CardContent className="flex gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input placeholder="Search by Claim ID, Patient, Event, User..." className="pl-10" />
          </div>
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" /> Filters
          </Button>
          <Button>Search</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Claim Audit Activity Overview</CardTitle>
          <CardDescription>
            Overview of recent claim activities and their audit trails. Click on a claim to view its detailed audit log.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {claims.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Claim ID</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Last Event</TableHead>
                  <TableHead>Last Event Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {claims.map((claim) => {
                  const lastEvent = claim.auditTrail.length > 0 ? claim.auditTrail[claim.auditTrail.length - 1] : null;
                  return (
                  <TableRow key={claim.id}>
                    <TableCell className="font-medium">{claim.claimNumber}</TableCell>
                    <TableCell>{claim.patientName}</TableCell>
                    <TableCell>{lastEvent ? lastEvent.event : 'N/A'}</TableCell>
                    <TableCell>{lastEvent ? format(parseISO(lastEvent.timestamp), 'dd MMM yyyy, HH:mm') : 'N/A'}</TableCell>
                    <TableCell>{claim.status}</TableCell>
                    <TableCell className="text-center">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/claims/${claim.id}`}>View Full Audit</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                )})}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground">No audit activity found matching criteria.</p>
          )}
        </CardContent>
      </Card>
      
      {/* 
        For a truly detailed, globally searchable log of ALL AI interactions, user decisions, 
        and system events as requested, a dedicated data store and backend for audit logs 
        would typically be required, rather than relying solely on audit trails embedded within 
        individual claim objects. The UI below would be where such a global log could be displayed.
      */}
      {/* 
      <Card>
        <CardHeader>
          <CardTitle>Comprehensive Audit Log</CardTitle>
          <CardDescription>Detailed stream of all system and user events.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Detailed, filterable, and searchable event log would appear here if a global audit data source was available.</p>
        </CardContent>
      </Card> 
      */}
    </div>
  );
}
