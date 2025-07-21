
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ListChecks } from "lucide-react";
import type { IdentifiedCriticalFinding } from "@/lib/types"; 
import { format, parseISO } from 'date-fns';
import { getMockCriticalFindings } from "@/lib/mock-data"; // Import from mock-data


export default function CriticalFindingsPage() {
  const findings = getMockCriticalFindings(); // Use the imported function

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <ListChecks className="h-7 w-7 text-primary" />
        <h1 className="text-3xl font-bold tracking-tight">Identified Critical Pairings Log</h1>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Log of Identified Critical Conceptual Pairings</CardTitle>
          <CardDescription>
            This list shows instances where pairings of diagnosis and procedure/intervention information (which can be from various coding systems or terms) 
            were identified as conceptually critical. The reason explains the underlying medical concepts.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {findings.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Input Diagnosis Info</TableHead>
                  <TableHead>Input Procedure/Intervention Info</TableHead>
                  <TableHead>Reason for Conceptual Criticality</TableHead>
                  <TableHead>Assessed On</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Originating Claim ID</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {findings.map((finding) => (
                  <TableRow key={finding.id}>
                    <TableCell>
                      {finding.diagnosisInformation.map((code, idx) => (
                        <Badge key={idx} variant="secondary" className="mr-1 mb-1 whitespace-normal text-left">{code}</Badge>
                      ))}
                    </TableCell>
                    <TableCell>
                      {finding.procedureOrInterventionInformation.map((code, idx) => (
                        <Badge key={idx} variant="outline" className="mr-1 mb-1 whitespace-normal text-left">{code}</Badge>
                      ))}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{finding.reason}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{format(parseISO(finding.assessedOn), 'dd MMM yyyy')}</TableCell>
                    <TableCell><Badge variant="default">{finding.source.replace('_', ' ')}</Badge></TableCell>
                    <TableCell className="text-sm text-muted-foreground">{finding.claimId || 'N/A'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground text-center py-8">No critical findings logged yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
