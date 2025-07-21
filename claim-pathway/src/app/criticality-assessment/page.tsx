
'use client';

import { useState, type FormEvent } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { assessClaimCriticality, type AssessClaimCriticalityInput, type AssessClaimCriticalityOutput } from '@/ai/flows/assess-claim-criticality';
import { Loader2, AlertCircle, CheckCircle, Beaker } from 'lucide-react';

export default function CriticalityAssessmentPage() {
  const [diagnosisInfo, setDiagnosisInfo] = useState('');
  const [procedureInfo, setProcedureInfo] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AssessClaimCriticalityOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setResult(null);
    setError(null);

    const parsedDiagnosisInfo = diagnosisInfo.split(',').map(code => code.trim()).filter(code => code.length > 0);
    const parsedProcedureInfo = procedureInfo.split(',').map(code => code.trim()).filter(code => code.length > 0);

    if (parsedDiagnosisInfo.length === 0 || parsedProcedureInfo.length === 0) {
      setError('Please enter at least one piece of diagnosis information and one piece of procedure/intervention information.');
      setIsLoading(false);
      return;
    }

    try {
      const input: AssessClaimCriticalityInput = {
        diagnosisInformation: parsedDiagnosisInfo,
        procedureOrInterventionInformation: parsedProcedureInfo,
      };
      const assessment = await assessClaimCriticality(input);
      setResult(assessment);
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <Beaker className="h-7 w-7 text-primary" />
        <h1 className="text-3xl font-bold tracking-tight">Criticality Assessment</h1>
      </div>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Assess Conceptual Pairing Criticality</CardTitle>
          <CardDescription>
            Enter diagnosis and procedure/intervention information (codes from any system like ICD-10, SNOMED CT, CPT, or layman's terms, comma-separated) 
            to determine if the conceptual pairing is considered critical.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="grid gap-6">
            <div className="space-y-2">
              <Label htmlFor="diagnosisInfo">Diagnosis Information (Codes/Terms)</Label>
              <Input
                id="diagnosisInfo"
                placeholder="e.g., I21.3, SNOMED:74492003, acute appendicitis"
                value={diagnosisInfo}
                onChange={(e) => setDiagnosisInfo(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="procedureInfo">Procedure/Intervention Information (Codes/Terms)</Label>
              <Input
                id="procedureInfo"
                placeholder="e.g., 36.10, CPT:99213, antibiotic therapy, appendix removal"
                value={procedureInfo}
                onChange={(e) => setProcedureInfo(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Assess Criticality
            </Button>
          </CardFooter>
        </form>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {result && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {result.isCritical ? (
                <AlertCircle className="h-6 w-6 text-destructive" />
              ) : (
                <CheckCircle className="h-6 w-6 text-green-600" />
              )}
              Assessment Result
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold">Is Critical:</h3>
              <p className={`text-lg font-bold ${result.isCritical ? 'text-destructive' : 'text-green-600'}`}>
                {result.isCritical ? 'Yes' : 'No'}
              </p>
            </div>
            <div>
              <h3 className="font-semibold">Reason:</h3>
              <p className="text-muted-foreground">{result.reason}</p>
            </div>
            <div>
              <h3 className="font-semibold">Suggested Pathway:</h3>
              <p className="text-muted-foreground">{result.suggestedPathway}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
