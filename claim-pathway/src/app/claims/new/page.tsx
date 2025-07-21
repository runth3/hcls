
'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ArrowLeft, Beaker, Info, Loader2, CheckCircle, AlertTriangle, DollarSign } from "lucide-react";
import Link from "next/link";
import { claimSources, claimTypes } from "@/lib/mock-data"; 
import type { ClaimSource, ClaimType } from "@/lib/types";
import { useState, type FormEvent } from "react";
import { enrichClaimData, type EnrichClaimDataInput, type EnrichClaimDataOutput } from "@/ai/flows/enrich-claim-data-flow";

export default function NewClaimPage() {
  const [selectedClaimSource, setSelectedClaimSource] = useState<ClaimSource | undefined>(claimSources[0]); // Default to first source
  const [selectedClaimType, setSelectedClaimType] = useState<ClaimType | undefined>(claimTypes[0]); // Default to first type
  const [isLoading, setIsLoading] = useState(false);
  const [enrichedResult, setEnrichedResult] = useState<EnrichClaimDataOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setEnrichedResult(null);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const data = Object.fromEntries(formData.entries()) as Omit<EnrichClaimDataInput, 'claimAmount'> & { claimAmount: string };

    const inputForAI: EnrichClaimDataInput = {
        ...data,
        claimAmount: parseFloat(data.claimAmount) || 0,
        claimSource: selectedClaimSource || '', // Ensure this is passed
        claimType: selectedClaimType || '', // Ensure this is passed
    };

    try {
      const result = await enrichClaimData(inputForAI);
      setEnrichedResult(result);
    } catch (e) {
      console.error("Error enriching data:", e);
      setError(e instanceof Error ? e.message : "An unexpected error occurred during AI enrichment.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/batches"> {/* Updated link to go back to batches page */}
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back to Batches</span>
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Beaker className="h-7 w-7 text-primary" />
           Simulate Claim Data Enrichment & Quality Check
        </h1>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Simulate AI Processing of Claim Data</CardTitle>
            <CardDescription>
              Input hypothetical claim information. The AI will attempt to enrich this data (e.g., predict service dates, look up provider details, assess claim amount plausibility)
              and assess its initial quality. If the AI deems the data 'Requires Review', in a real system, it would be routed for human intervention.
              This enriched and assessed data would then typically be saved to a database for further use.
              This does not create a real claim in any operational system.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="patientName">Patient Name</Label>
                <Input id="patientName" name="patientName" placeholder="Enter patient's full name" defaultValue="John Doe" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="memberId">Member ID</Label>
                <Input id="memberId" name="memberId" placeholder="Enter member ID" defaultValue="MBR12345" required />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="policyNumber">Policy Number</Label>
                <Input id="policyNumber" name="policyNumber" placeholder="Enter policy number" defaultValue="POL98765" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="providerName">Provider Name</Label>
                <Input id="providerName" name="providerName" placeholder="Enter provider name (e.g., 'City General Hospital')" defaultValue="Hope Medical Center" required />
              </div>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="claimAmount">Claim Amount</Label>
                <Input id="claimAmount" name="claimAmount" type="number" placeholder="Enter claim amount" defaultValue="1500.00" required />
              </div>
               <div className="space-y-2">
                <Label htmlFor="submissionDate">Submission Date</Label>
                <Input id="submissionDate" name="submissionDate" type="date" defaultValue={new Date().toISOString().split('T')[0]} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="serviceDate">Service Date (Optional)</Label>
                <Input id="serviceDate" name="serviceDate" type="date" />
                 <p className="text-xs text-muted-foreground">If left blank, AI will attempt to predict.</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="claimSource">Claim Source (Simulation Context)</Label>
                <Select name="claimSource" onValueChange={(value) => setSelectedClaimSource(value as ClaimSource)} value={selectedClaimSource} required>
                  <SelectTrigger id="claimSource">
                    <SelectValue placeholder="Select simulated claim source" />
                  </SelectTrigger>
                  <SelectContent>
                    {claimSources.map(source => (
                      <SelectItem key={source} value={source}>{source}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                 <p className="text-xs text-muted-foreground">Indicates how the claim data might originate.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="claimType">Claim Type (Simulation Context)</Label>
                <Select name="claimType" onValueChange={(value) => setSelectedClaimType(value as ClaimType)} value={selectedClaimType} required>
                  <SelectTrigger id="claimType">
                    <SelectValue placeholder="Select simulated claim type" />
                  </SelectTrigger>
                  <SelectContent>
                    {claimTypes.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="diagnosisInfo">Diagnosis Information (Codes/Terms, comma-separated)</Label>
              <Input id="diagnosisInfo" name="diagnosisInfo" placeholder="e.g., I21.3, SNOMED:74492003, acute appendicitis" defaultValue="I10, R05" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="procedureInfo">Procedure/Intervention Information (Codes/Terms, comma-separated)</Label>
              <Input id="procedureInfo" name="procedureInfo" placeholder="e.g., 36.10, CPT:99213, antibiotic therapy, appendix removal" defaultValue="CPT:99213, J0171" required />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="claimScenarioDetails">Additional Claim Scenario Details (Optional)</Label>
              <Textarea id="claimScenarioDetails" name="claimScenarioDetails" placeholder="Provide any other relevant details for the AI to consider..." rows={3} defaultValue="Patient presented with cough and high blood pressure."/>
            </div>

          </CardContent>
          <CardFooter className="flex justify-end gap-2">
              <Button variant="outline" asChild disabled={isLoading}>
                  <Link href="/batches">Cancel</Link>
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Enrich & Assess Data
              </Button>
          </CardFooter>
        </Card>
      </form>

      {error && (
        <Alert variant="destructive" className="mt-6">
          <Info className="h-4 w-4" />
          <AlertTitle>Enrichment Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {enrichedResult && (
        <Card className="mt-6 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5 text-accent" />AI Processed Data (Simulation)</CardTitle>
            <CardDescription>
              Below is the data after AI enrichment and quality assessment.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            
            <div className="p-4 border rounded-md bg-muted/50">
                <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                    {enrichedResult.aiDataQualityAssessment === 'Clean' ? 
                        <CheckCircle className="h-5 w-5 text-green-600" /> : 
                        <AlertTriangle className="h-5 w-5 text-orange-500" />
                    }
                    AI Data Quality Assessment: 
                    <span className={`font-bold ${enrichedResult.aiDataQualityAssessment === 'Clean' ? 'text-green-700' : 'text-orange-600'}`}>
                        {enrichedResult.aiDataQualityAssessment}
                    </span>
                </h3>
                <p className="text-sm text-muted-foreground"><strong>AI Review Notes:</strong> {enrichedResult.aiReviewNotes}</p>
            </div>

            <div className="p-4 border rounded-md bg-muted/50">
                <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-blue-600" />
                    AI Claim Amount Assessment
                </h3>
                <p className="text-sm text-muted-foreground"><strong>Notes:</strong> {enrichedResult.aiAmountAssessmentNotes}</p>
            </div>

            <div>
              <h3 className="font-semibold text-md mb-2 mt-4">Enriched/Derived Fields:</h3>
              {enrichedResult.predictedServiceDate && (
                  <p><strong>Predicted Service Date:</strong> {enrichedResult.serviceDate} (AI Predicted)</p>
              )}
              {!enrichedResult.predictedServiceDate && enrichedResult.serviceDate && (
                  <p><strong>Service Date:</strong> {enrichedResult.serviceDate} (User Provided)</p>
              )}
              {!enrichedResult.serviceDate && !enrichedResult.predictedServiceDate && (
                  <p><strong>Service Date:</strong> Not provided and not predicted.</p>
              )}
              <p><strong>Provider Full Address:</strong> {enrichedResult.providerFullAddress}</p>
              <p><strong>Provider Type:</strong> {enrichedResult.providerType}</p>
              <p><strong>Submission Season:</strong> {enrichedResult.submissionSeason}</p>
              <p><strong>General AI Enrichment Notes:</strong> {enrichedResult.enrichedNotes}</p>
            </div>
            
            <details className="mt-4 cursor-pointer">
                <summary className="font-semibold text-muted-foreground hover:text-foreground">Show Full Processed Data (JSON)</summary>
                <pre className="mt-2 p-4 bg-muted rounded-md text-xs overflow-x-auto">
                {JSON.stringify(enrichedResult, null, 2)}
                </pre>
            </details>
          </CardContent>
           <CardFooter>
            <p className="text-sm text-muted-foreground">This data is for simulation. 'Clean' data would proceed for pairing analysis; 'Requires Review' data would go to a human work queue.</p>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
