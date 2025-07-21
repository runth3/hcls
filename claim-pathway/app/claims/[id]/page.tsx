
'use client';

import { getMockClaimById } from "@/lib/mock-data";
import type { Claim, ClaimSummaryAI, FraudDetectionAI, TatPredictionAI, CriticalityAssessmentAI, ClaimDataQualityReview, ClaimDataReviewStatus, ClaimDataReviewFlag, PatientChronologyAI } from "@/lib/types";
import { AllClaimDataReviewStatuses, AllClaimDataReviewFlags } from "@/lib/types";
import { notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, CheckCircle2, FileText, DollarSign, User, Briefcase, Stethoscope, History, Brain, ShieldAlert, Clock4, ListChecks, FileArchive, MessageSquare, AlertTriangle, HelpCircle,ThumbsUp, ThumbsDown, Edit3, ExternalLink, Info, RefreshCcw, Loader2, Gavel, Flag, Microscope, CheckSquare, BookText, Footprints, Save, X } from "lucide-react";
import Link from "next/link";
import { format, parseISO, formatISO } from 'date-fns';
import React, { useState, useEffect, use, useCallback } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";


import { generateClaimSummary } from '@/ai/flows/generate-claim-summary';
import { detectClaimFraud } from '@/ai/flows/claim-fraud-detection';
import { predictTat } from '@/ai/flows/tat-prediction';
import { assessClaimCriticality } from '@/ai/flows/assess-claim-criticality';
import { generatePatientChronology } from "@/ai/flows/generate-patient-chronology";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";


interface AIInsightState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  status: 'pending' | 'accepted' | 'overridden'; // Status for user feedback on AI insight, not loading
  overrideReason: string;
}

// Helper to create initial state for AI insights
const createInitialAIState = <T extends any>(): AIInsightState<T> => ({
  data: null,
  isLoading: false,
  error: null,
  status: 'pending',
  overrideReason: '',
});

export default function ClaimDetailPage({ params }: { params: { id: string } }) {
  const resolvedRouteParams = use(params as any);
  const { toast } = useToast();

  const [claim, setClaim] = useState<Claim | null | undefined>(undefined);
  const [isPageLoading, setIsPageLoading] = useState(true);

  const [summaryState, setSummaryState] = useState<AIInsightState<ClaimSummaryAI>>(createInitialAIState());
  const [fraudInfoState, setFraudInfoState] = useState<AIInsightState<FraudDetectionAI>>(createInitialAIState());
  const [tatInfoState, setTatInfoState] = useState<AIInsightState<TatPredictionAI>>(createInitialAIState());
  const [criticalityInfoState, setCriticalityInfoState] = useState<AIInsightState<CriticalityAssessmentAI>>(createInitialAIState());
  const [chronologyState, setChronologyState] = useState<AIInsightState<PatientChronologyAI>>(createInitialAIState());
  
  // State for Data Quality Review Panel
  const [currentDataReview, setCurrentDataReview] = useState<ClaimDataQualityReview>({
    status: 'No Decision Yet',
    flags: [],
    notes: '',
  });
  const [isDataReviewSubmitted, setIsDataReviewSubmitted] = useState(false);

  // State for editable medical record summary
  const [isEditingMedicalSummary, setIsEditingMedicalSummary] = useState(false);
  const [medicalSummaryText, setMedicalSummaryText] = useState("");


  const fetchAllAIInsights = useCallback(async (currentClaim: Claim) => {
    // This function will trigger all AI fetches.
    // It's useful for initial load and for re-fetching after data changes.
    await Promise.all([
      fetchSummary(currentClaim),
      fetchFraudInfo(currentClaim),
      fetchTatInfo(currentClaim),
      fetchCriticalityInfo(currentClaim),
      fetchChronology(currentClaim)
    ]);
  }, []); // Empty dependency array as the functions inside should be stable

  const fetchSummary = useCallback(async (currentClaim: Claim) => {
    setSummaryState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const summary = await generateClaimSummary({ claimDetails: currentClaim.claimDetailsFull });
      if (summary.summary.includes("unavailable") || summary.summary.includes("failed")) {
        setSummaryState({ data: null, isLoading: false, error: summary.summary, status: 'pending', overrideReason: '' });
      } else {
        setSummaryState({ data: summary, isLoading: false, error: null, status: 'pending', overrideReason: '' });
      }
    } catch (error: any) {
      console.error("Error fetching summary:", error);
      setSummaryState({ data: null, isLoading: false, error: error.message || "Failed to load summary.", status: 'pending', overrideReason: '' });
    }
  }, []);

  const fetchFraudInfo = useCallback(async (currentClaim: Claim) => {
    setFraudInfoState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const fraudInfo = await detectClaimFraud({ 
        claimDetails: currentClaim.claimDetailsFull, 
        memberDetails: currentClaim.memberDetailsContext, 
        providerDetails: currentClaim.providerDetailsContext,
        medicalRecordSummary: currentClaim.medicalRecordSummary,
      });
      if (fraudInfo.fraudReason.includes("unavailable") || fraudInfo.fraudReason.includes("failed")) {
         setFraudInfoState({ data: null, isLoading: false, error: fraudInfo.fraudReason, status: 'pending', overrideReason: '' });
      } else {
        setFraudInfoState({ data: fraudInfo, isLoading: false, error: null, status: 'pending', overrideReason: '' });
      }
    } catch (error: any) {
      console.error("Error fetching fraud info:", error);
      setFraudInfoState({ data: null, isLoading: false, error: error.message || "Failed to load fraud analysis.", status: 'pending', overrideReason: '' });
    }
  }, []);

  const fetchTatInfo = useCallback(async (currentClaim: Claim) => {
    setTatInfoState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const tatInfo = await predictTat({ 
        claimDetails: currentClaim.claimDetailsFull, 
        memberDetails: currentClaim.memberDetailsContext, 
        providerDetails: currentClaim.providerDetailsContext, 
        claimHistory: currentClaim.claimHistorySummary 
      });
      if (tatInfo.factors.includes("unavailable") || tatInfo.factors.includes("failed")) {
        setTatInfoState({ data: null, isLoading: false, error: tatInfo.factors, status: 'pending', overrideReason: '' });
      } else {
        setTatInfoState({ data: tatInfo, isLoading: false, error: null, status: 'pending', overrideReason: '' });
      }
    } catch (error: any) {
      console.error("Error fetching TAT info:", error);
      setTatInfoState({ data: null, isLoading: false, error: error.message || "Failed to load TAT prediction.", status: 'pending', overrideReason: '' });
    }
  }, []);

  const fetchCriticalityInfo = useCallback(async (currentClaim: Claim) => {
    setCriticalityInfoState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const criticalityInfo = await assessClaimCriticality({
        diagnosisInformation: currentClaim.diagnosisCodes.map(dc => `${dc.code} (${dc.description})`),
        procedureOrInterventionInformation: currentClaim.procedureCodes.map(pc => `${pc.code} (${pc.description})`),
      });
      if (criticalityInfo.reason.includes("unavailable") || criticalityInfo.reason.includes("failed")) {
        setCriticalityInfoState({ data: null, isLoading: false, error: criticalityInfo.reason, status: 'pending', overrideReason: '' });
      } else {
        setCriticalityInfoState({ data: criticalityInfo, isLoading: false, error: null, status: 'pending', overrideReason: '' });
      }
    } catch (error: any) {
      console.error("Error fetching criticality info:", error);
      setCriticalityInfoState({ data: null, isLoading: false, error: error.message || "Failed to load criticality assessment.", status: 'pending', overrideReason: '' });
    }
  }, []);

  const fetchChronology = useCallback(async (currentClaim: Claim) => {
    setChronologyState(prev => ({...prev, isLoading: true, error: null}));
    try {
        const chronology = await generatePatientChronology({
            submissionDate: currentClaim.submissionDate,
            serviceDates: currentClaim.lineItems?.map(li => li.serviceDate) || [],
            claimDetailsFull: currentClaim.claimDetailsFull,
            medicalRecordSummary: currentClaim.medicalRecordSummary,
            auditTrail: currentClaim.auditTrail
        });
        if (!chronology.chronology || chronology.chronology.length === 0) {
            setChronologyState({ data: null, isLoading: false, error: "Could not generate a patient timeline from the available data.", status: 'pending', overrideReason: ''});
        } else {
            setChronologyState({ data: chronology, isLoading: false, error: null, status: 'pending', overrideReason: ''});
        }
    } catch (error: any) {
        console.error("Error fetching patient chronology:", error);
        setChronologyState({ data: null, isLoading: false, error: error.message || "Failed to load patient chronology.", status: 'pending', overrideReason: '' });
    }
  }, []);

  useEffect(() => {
    const loadClaimData = async () => {
      setIsPageLoading(true);
      const fetchedClaim = getMockClaimById(resolvedRouteParams.id);
      setClaim(fetchedClaim);
      if (fetchedClaim) {
        setMedicalSummaryText(fetchedClaim.medicalRecordSummary || "");
        if (fetchedClaim.dataQualityReview) {
          setCurrentDataReview(fetchedClaim.dataQualityReview);
          setIsDataReviewSubmitted(fetchedClaim.dataQualityReview.status !== 'No Decision Yet');
        } else {
           setCurrentDataReview({ status: 'No Decision Yet', flags: [], notes: '' });
           setIsDataReviewSubmitted(false);
        }
        await fetchAllAIInsights(fetchedClaim);
      }
      setIsPageLoading(false);
    };
    loadClaimData();
  }, [resolvedRouteParams.id, fetchAllAIInsights]);


  const handleInsightAction = <T extends any>(
    setState: React.Dispatch<React.SetStateAction<AIInsightState<T>>>, 
    action: 'accepted' | 'overridden'
  ) => {
    setState(prev => ({ ...prev, status: action }));
    toast({ title: "AI Insight Feedback", description: `Suggestion ${action}.` });
  };

  const handleOverrideReasonChange = <T extends any>(
    setState: React.Dispatch<React.SetStateAction<AIInsightState<T>>>, 
    reason: string
  ) => {
    setState(prev => ({ ...prev, overrideReason: reason }));
  };

  const handleDataReviewStatusChange = (value: ClaimDataReviewStatus) => {
    setCurrentDataReview(prev => ({ ...prev, status: value }));
  };

  const handleDataReviewFlagChange = (flag: ClaimDataReviewFlag, checked: boolean) => {
    setCurrentDataReview(prev => ({
      ...prev,
      flags: checked ? [...prev.flags, flag] : prev.flags.filter(f => f !== flag),
    }));
  };

  const handleDataReviewNotesChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCurrentDataReview(prev => ({ ...prev, notes: event.target.value }));
  };

  const handleSubmitDataReview = () => {
    if (currentDataReview.status === 'No Decision Yet') {
        toast({variant: "destructive", title: "Review Incomplete", description: "Please select a data quality review status."});
        return;
    }
    const finalReview: ClaimDataQualityReview = {
      ...currentDataReview,
      reviewedBy: 'Current User (Simulated)', 
      reviewDate: formatISO(new Date()),
    };

    setClaim(prevClaim => prevClaim ? ({ 
        ...prevClaim, 
        dataQualityReview: finalReview,
        // Optionally update claim's processingStatus based on this review
        processingStatus: finalReview.status === 'Accepted as Clean Data' ? 'Processed' : 
                          finalReview.status === 'Flagged for FWA Investigation' ? 'ReviewRequired' : // Or a specific FWA status
                          finalReview.status === 'Requires Data Correction' ? 'ReviewRequired' : // Or a specific correction status
                          prevClaim.processingStatus // Default to keep current processingStatus
    }) : null);
    
    setIsDataReviewSubmitted(true);
    toast({ title: "Data Quality Review Submitted", description: `Claim data quality status set to ${finalReview.status}.` });
    console.log("Submitting Data Quality Review:", finalReview);
  };
  
  const handleReviseDataReview = () => {
    setIsDataReviewSubmitted(false);
  };

  const handleSaveMedicalSummary = async () => {
    if (!claim) return;
    
    const updatedClaim = { ...claim, medicalRecordSummary: medicalSummaryText };
    setClaim(updatedClaim);
    setIsEditingMedicalSummary(false);

    toast({
        title: "Medical Summary Updated",
        description: "Re-running AI analyses with the new information...",
    });

    // Re-run all AI insights with the updated claim data
    await fetchAllAIInsights(updatedClaim);
  };

  if (isPageLoading && claim === undefined) { 
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-10 w-3/4" />
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 flex flex-col gap-6">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-80 w-full" /> 
          </div>
          <div className="flex flex-col gap-6">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!claim) {
    notFound(); 
    return null; 
  }
  
  const getRiskColor = (risk: Claim['riskLevel']) => {
    if (risk === 'Low') return 'text-green-600';
    if (risk === 'Medium') return 'text-yellow-600';
    if (risk === 'High' || risk === 'Critical') return 'text-red-600';
    return 'text-gray-600';
  }

  const AiInsightCard = <T extends any>({ title, icon: Icon, state, setState, children, onRetry }: {
    title: string;
    icon: React.ElementType;
    state: AIInsightState<T>;
    setState: React.Dispatch<React.SetStateAction<AIInsightState<T>>>;
    children: (data: T) => React.ReactNode;
    onRetry?: () => void;
  }) => (
    <div className={`p-4 border rounded-lg bg-background relative ${state.status !== 'pending' ? (state.status === 'accepted' ? 'border-green-500' : 'border-orange-500') : ''}`}>
      {state.status !== 'pending' && (
        <Badge variant={state.status === 'accepted' ? 'default' : 'secondary'} className={`absolute top-2 right-2 ${state.status === 'accepted' ? 'bg-green-600' : 'bg-orange-500'}`}>
          {state.status === 'accepted' ? 'Accepted' : 'Overridden'}
        </Badge>
      )}
      <h3 className="font-semibold flex items-center gap-2 mb-2"><Icon className="h-5 w-5 text-accent"/>{title}</h3>
      
      {state.isLoading && (
        <div className="flex items-center justify-center h-20">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      )}

      {!state.isLoading && state.error && (
        <div className="text-sm text-destructive p-2 rounded-md border border-destructive bg-destructive/10">
          <p>{state.error}</p>
          {onRetry && (
            <Button onClick={onRetry} variant="destructive" size="sm" className="mt-2">
              <RefreshCcw className="mr-2 h-4 w-4" /> Retry
            </Button>
          )}
        </div>
      )}

      {!state.isLoading && !state.error && state.data && (
        <>
          {children(state.data)}
          <div className="mt-3 pt-3 border-t space-y-2">
            {state.status === 'pending' ? (
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => handleInsightAction(setState, 'accepted')}><ThumbsUp className="mr-2 h-4 w-4" /> Accept Suggestion</Button>
                <Button size="sm" variant="outline" onClick={() => handleInsightAction(setState, 'overridden')}><ThumbsDown className="mr-2 h-4 w-4" /> Override</Button>
              </div>
            ) : state.status === 'overridden' && (
              <>
                <Textarea 
                  placeholder="Reason for overriding this suggestion..." 
                  value={state.overrideReason}
                  onChange={(e) => handleOverrideReasonChange(setState, e.target.value)}
                  className="text-sm"
                  rows={2}
                />
                <Button size="sm" onClick={() => {
                    console.log("Save override reason:", { insightTitle: title, reason: state.overrideReason});
                    toast({title: "Override Reason", description: "Reason noted (simulated)."});
                }}>Save Reason</Button>
                <Button size="sm" variant="link" onClick={() => setState(prev => ({...prev, status: 'pending', overrideReason: ''}))}>Cancel Override</Button>
              </>
            )}
          </div>
        </>
      )}
       {!state.isLoading && !state.error && !state.data && (
         <p className="text-sm text-muted-foreground">No data available for this insight.</p>
       )}
    </div>
  );


  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Claim Details: {claim.claimNumber}</h1>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 flex flex-col gap-6">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <FileText className="h-6 w-6 text-primary" />
                Claim Overview (Source System Data)
              </CardTitle>
              <CardDescription>Key information about claim {claim.claimNumber} as received from the source.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div><strong>Patient:</strong> {claim.patientName} (ID: {claim.memberId})</div>
              <div><strong>Policy:</strong> {claim.policyNumber} ({claim.policyHolderName})</div>
              <div><strong>Provider:</strong> {claim.providerName} (ID: {claim.providerId})</div>
              <div><strong>Submitted:</strong> {format(parseISO(claim.submissionDate), 'dd MMM yyyy, HH:mm')}</div>
              <div><strong>Last Update:</strong> {format(parseISO(claim.lastUpdateDate), 'dd MMM yyyy, HH:mm')}</div>
              <div className="flex items-center gap-2"><strong>Source Status:</strong> <Badge variant={claim.status === "Approved" ? "default" : claim.status === "Denied" ? "destructive" : "secondary"}>{claim.status}</Badge></div>
              <div><strong>Amount:</strong> {claim.currency} {claim.claimAmount.toLocaleString()} {claim.approvedAmount && `(Approved: ${claim.currency} ${claim.approvedAmount.toLocaleString()})`}</div>
              <div className="flex items-center gap-2"><strong>IntelliPath Risk:</strong> <span className={`font-semibold ${getRiskColor(claim.riskLevel)}`}>{claim.riskLevel}</span></div>
              <div><strong>Diagnosis:</strong> {claim.diagnosisCodes.map(dc => `${dc.code} (${dc.description})`).join(', ')}</div>
              <div><strong>Procedures:</strong> {claim.procedureCodes.map(pc => `${pc.code} (${pc.description})`).join(', ')}</div>
              <div><strong>Claim Source:</strong> <Badge variant="outline">{claim.claimSource}</Badge></div>
              <div><strong>Claim Type:</strong> <Badge variant="outline">{claim.claimType}</Badge></div>
            </CardContent>
          </Card>

          {/* Claim Data Quality Review Panel */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Microscope className="h-6 w-6 text-primary" />
                Claim Data Quality Review (for AI Training)
              </CardTitle>
              <CardDescription>
                {isDataReviewSubmitted ? "Review or revise the recorded data quality assessment for this claim." : "Assess this claim's data quality for AI training purposes."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {isDataReviewSubmitted && claim.dataQualityReview ? (
                <div className="space-y-3 p-4 border rounded-md bg-muted/30">
                  <h4 className="font-semibold">Data Quality Assessment Recorded:</h4>
                  <div className="flex items-center gap-2"><strong>Status:</strong> <Badge>{claim.dataQualityReview.status}</Badge></div>
                  {claim.dataQualityReview.flags.length > 0 && (
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1"><strong>Flags:</strong> {claim.dataQualityReview.flags.map(f => <Badge key={f} variant="secondary" className="mr-1">{f}</Badge>)}</div>
                  )}
                  <p className="text-sm"><strong>Notes:</strong> {claim.dataQualityReview.notes || "N/A"}</p>
                  <p className="text-xs text-muted-foreground">
                    By: {claim.dataQualityReview.reviewedBy} on {claim.dataQualityReview.reviewDate ? format(parseISO(claim.dataQualityReview.reviewDate), 'PPPp') : 'N/A'}
                  </p>
                  <Button onClick={handleReviseDataReview} variant="outline" size="sm">
                    <Edit3 className="mr-2 h-4 w-4" /> Revise Review
                  </Button>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="dataReviewStatus">Set Data Quality Status</Label>
                    <Select 
                      value={currentDataReview.status} 
                      onValueChange={(value) => handleDataReviewStatusChange(value as ClaimDataReviewStatus)}
                    >
                      <SelectTrigger id="dataReviewStatus">
                        <SelectValue placeholder="Select data quality status" />
                      </SelectTrigger>
                      <SelectContent>
                        {AllClaimDataReviewStatuses.map(status => (
                          <SelectItem key={status} value={status}>{status}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                     <p className="text-xs text-muted-foreground">This assesses the claim's suitability for AI model training.</p>
                  </div>

                  <div className="space-y-2">
                    <Label>Flag Data Quality Issues (Optional)</Label>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                      {AllClaimDataReviewFlags.map(flag => (
                        <div key={flag} className="flex items-center space-x-2">
                          <Checkbox
                            id={`flag-${flag.replace(/\s+/g, '-')}`}
                            checked={currentDataReview.flags.includes(flag)}
                            onCheckedChange={(checked) => handleDataReviewFlagChange(flag, !!checked)}
                          />
                          <Label htmlFor={`flag-${flag.replace(/\s+/g, '-')}`} className="font-normal text-sm">
                            {flag}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dataReviewNotes">Review Notes / Reason</Label>
                    <Textarea
                      id="dataReviewNotes"
                      value={currentDataReview.notes}
                      onChange={handleDataReviewNotesChange}
                      placeholder="Enter justification for the quality assessment, FWA details, correction needs etc."
                      rows={4}
                    />
                  </div>
                  <Button onClick={handleSubmitDataReview} size="lg">
                    <CheckSquare className="mr-2 h-5 w-5" /> Submit Data Quality Review
                  </Button>
                </>
              )}
            </CardContent>
          </Card>


          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Brain className="h-6 w-6 text-primary" />
                AI-Powered Insights & Recommendations
              </CardTitle>
              <CardDescription>Review AI suggestions and provide feedback for model improvement.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <AiInsightCard 
                title="Claim Summary Suggestion" 
                icon={ListChecks} 
                state={summaryState} 
                setState={setSummaryState}
                onRetry={() => fetchSummary(claim)}
              >
                {(data) => <ScrollArea className="h-20"><p className="text-sm text-muted-foreground">{data.summary}</p></ScrollArea>}
              </AiInsightCard>
              
              <div className="grid md:grid-cols-2 gap-4">
                <AiInsightCard 
                  title="Fraud Detection Analysis" 
                  icon={ShieldAlert} 
                  state={fraudInfoState} 
                  setState={setFraudInfoState}
                  onRetry={() => fetchFraudInfo(claim)}
                >
                  {(data) => (
                    <>
                      <p className="text-sm"><strong>System Suggests Fraudulent:</strong> {data.isFraudulent ? 'Yes' : 'No'}</p>
                      <p className="text-sm"><strong>Confidence Score:</strong> {(data.fraudProbability !== undefined ? data.fraudProbability * 100 : 0).toFixed(1)}%</p>
                      <p className="text-sm text-muted-foreground"><strong>Reasoning:</strong> {data.fraudReason}</p>
                      {data.recommendedAction && <p className="text-sm mt-1"><strong>Recommended Action:</strong> {data.recommendedAction}</p>}
                    </>
                  )}
                </AiInsightCard>

                <AiInsightCard 
                  title="Turnaround Time (TAT) Prediction" 
                  icon={Clock4} 
                  state={tatInfoState} 
                  setState={setTatInfoState}
                  onRetry={() => fetchTatInfo(claim)}
                >
                  {(data) => (
                    <>
                      <p className="text-sm"><strong>Predicted TAT:</strong> {data.predictedTat}</p>
                      <p className="text-sm"><strong>Confidence:</strong> {(data.confidenceScore !== undefined ? data.confidenceScore * 100 : 0).toFixed(1)}%</p>
                      <p className="text-sm text-muted-foreground"><strong>Influencing Factors:</strong> {data.factors}</p>
                    </>
                  )}
                </AiInsightCard>
              </div>

              <AiInsightCard 
                title="Claim Criticality Assessment" 
                icon={criticalityInfoState.data?.isCritical ? AlertTriangle : CheckCircle2} 
                state={criticalityInfoState} 
                setState={setCriticalityInfoState}
                onRetry={() => fetchCriticalityInfo(claim)}
              >
                 {(data) => (
                   <>
                    <p className="text-sm"><strong>System Assesses as Critical:</strong> 
                        <span className={data.isCritical ? 'text-destructive font-semibold' : 'text-green-600 font-semibold'}>
                        {data.isCritical ? ' Yes' : ' No'}
                        </span>
                    </p>
                    <p className="text-sm text-muted-foreground"><strong>Reasoning:</strong> {data.reason}</p>
                    <p className="text-sm"><strong>Suggested Pathway:</strong> {data.suggestedPathway}</p>
                   </>
                 )}
              </AiInsightCard>

            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Info className="h-6 w-6 text-primary" />
                Claim Narrative
              </CardTitle>
              <CardDescription>Contextual details and notes from the source system.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{claim.claimDetailsFull}</p>
            </CardContent>
          </Card>
          
          <Card className="shadow-lg">
            <CardHeader className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookText className="h-6 w-6 text-primary" />
                <CardTitle className="text-xl">Medical Record Summary</CardTitle>
              </div>
              {!isEditingMedicalSummary && (
                <Button variant="outline" size="sm" onClick={() => setIsEditingMedicalSummary(true)}>
                  <Edit3 className="mr-2 h-4 w-4" />
                  Edit
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {isEditingMedicalSummary ? (
                <div className="space-y-4">
                  <Label htmlFor="medicalSummaryEditor">Edit Medical Summary</Label>
                  <Textarea
                    id="medicalSummaryEditor"
                    value={medicalSummaryText}
                    onChange={(e) => setMedicalSummaryText(e.target.value)}
                    rows={6}
                    className="text-sm"
                  />
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={() => {
                        setIsEditingMedicalSummary(false);
                        setMedicalSummaryText(claim.medicalRecordSummary || "");
                    }}>
                      <X className="mr-2 h-4 w-4" />
                      Cancel
                    </Button>
                    <Button size="sm" onClick={handleSaveMedicalSummary}>
                      <Save className="mr-2 h-4 w-4" />
                      Save & Re-run AI
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {claim.medicalRecordSummary || "No medical record summary available."}
                </p>
              )}
            </CardContent>
          </Card>
        
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <FileArchive className="h-6 w-6 text-primary" />
                Documents
              </CardTitle>
            </CardHeader>
            <CardContent>
              {claim.documents.length > 0 ? (
                <ul className="space-y-2 text-sm">
                  {claim.documents.map((doc, index) => (
                    <li key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded-md">
                      <div className="truncate flex items-center gap-1">
                        <Info className="h-4 w-4 text-muted-foreground"/> 
                        {doc.name} ({doc.category})
                      </div>
                      <Button variant="link" size="sm" asChild><Link href={doc.url} target="_blank" className="flex items-center gap-1">View <ExternalLink className="h-3 w-3"/></Link></Button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">No documents attached.</p>
              )}
            </CardContent>
          </Card>
          
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <History className="h-6 w-6 text-primary" />
                Audit Trail (IntelliPath Processing)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[200px]">
                {claim.auditTrail.length > 0 ? (
                  <ul className="space-y-3 text-sm">
                    {claim.auditTrail.slice().reverse().map((event, index) => ( 
                      <li key={index} className="pb-3 border-b last:border-b-0">
                        <p className="font-medium">{event.event}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(parseISO(event.timestamp), 'dd MMM yyyy, HH:mm')} by {event.user}
                        </p>
                        {event.details && <p className="text-xs text-muted-foreground mt-0.5">Details: {event.details}</p>}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">No audit trail available.</p>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <MessageSquare className="h-6 w-6 text-primary" />
                Claim Notes (Operational)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea placeholder="Add general operational notes to this claim (not for quality review)..." rows={3}/>
              <Button variant="outline" size="sm" className="mt-2">Add Note</Button>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Patient Chronology Table */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Footprints className="h-6 w-6 text-primary" />
            Patient Service Chronology
          </CardTitle>
          <CardDescription>
            An AI-generated timeline of the patient's journey related to this claim.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {chronologyState.isLoading && <div className="flex items-center justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}
          {!chronologyState.isLoading && chronologyState.error && <p className="text-destructive text-sm">{chronologyState.error}</p>}
          {!chronologyState.isLoading && !chronologyState.error && chronologyState.data && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date / Time</TableHead>
                  <TableHead>Event</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {chronologyState.data.chronology.map((event, index) => (
                  <TableRow key={index} className={event.isPredicted ? "bg-blue-50 dark:bg-blue-900/20" : ""}>
                    <TableCell className="whitespace-nowrap">{format(parseISO(event.eventDate), 'dd MMM yyyy, HH:mm')}</TableCell>
                    <TableCell>{event.eventName}</TableCell>
                    <TableCell><Badge variant={event.isPredicted ? "default" : "secondary"}>{event.source}</Badge></TableCell>
                    <TableCell className="text-sm text-muted-foreground">{event.details}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}



    