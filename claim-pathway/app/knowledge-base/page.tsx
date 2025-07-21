
'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { LibraryBig, BookMarked, Link2, PlusCircle } from "lucide-react";
import { mockMedicalConcepts, mockClinicalPairings, getConceptNameById } from "@/lib/mock-data";
import type { MedicalConcept, ClinicalPairing } from "@/lib/types";

function formatCodes(codes: Record<string, string[]>): React.ReactNode {
  return Object.entries(codes).map(([system, codeArray]) => (
    <div key={system} className="mb-1">
      <strong className="text-xs text-muted-foreground">{system.replace('_', ' ')}: </strong>
      {codeArray.map(code => (
        <Badge key={code} variant="secondary" className="mr-1 mb-1 text-xs whitespace-normal text-left">{code}</Badge>
      ))}
    </div>
  ));
}

const conceptTypes: MedicalConcept['conceptType'][] = ['Diagnosis', 'Procedure', 'Intervention', 'Medication', 'Finding', 'Observation'];

export default function KnowledgeBasePage() {
  const [medicalConcepts, setMedicalConcepts] = React.useState<MedicalConcept[]>(mockMedicalConcepts);
  const [clinicalPairings, setClinicalPairings] = React.useState<ClinicalPairing[]>(mockClinicalPairings);

  const [isAddConceptDialogOpen, setIsAddConceptDialogOpen] = React.useState(false);
  const [newConceptName, setNewConceptName] = React.useState('');
  const [newConceptType, setNewConceptType] = React.useState<MedicalConcept['conceptType'] | ''>('');
  const [newConceptCodes, setNewConceptCodes] = React.useState(''); // Format: ICD-10:A01.0;SNOMED_CT:123,456
  const [newConceptDescription, setNewConceptDescription] = React.useState('');

  const handleAddMedicalConcept = (event: React.FormEvent) => {
    event.preventDefault();
    if (!newConceptName || !newConceptType) {
      // Basic validation
      alert("Concept Name and Type are required.");
      return;
    }

    const parsedCodes: Record<string, string[]> = {};
    if (newConceptCodes) {
      newConceptCodes.split(';').forEach(systemEntry => {
        const [system, codesString] = systemEntry.split(':');
        if (system && codesString) {
          parsedCodes[system.trim()] = codesString.split(',').map(c => c.trim()).filter(c => c);
        }
      });
    }

    const newConcept: MedicalConcept = {
      id: `CONCEPT_${newConceptName.replace(/\s+/g, '_').toUpperCase()}_${Date.now()}`,
      conceptName: newConceptName,
      conceptType: newConceptType as MedicalConcept['conceptType'], // Cast as type is validated
      codes: parsedCodes,
      description: newConceptDescription,
    };

    setMedicalConcepts(prevConcepts => [...prevConcepts, newConcept]);
    
    // Reset form and close dialog
    setNewConceptName('');
    setNewConceptType('');
    setNewConceptCodes('');
    setNewConceptDescription('');
    setIsAddConceptDialogOpen(false);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <LibraryBig className="h-7 w-7 text-primary" />
        <h1 className="text-3xl font-bold tracking-tight">Knowledge Base Management</h1>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Global Medical Concept Lexicon & Clinical Pairing Knowledge Graph</CardTitle>
          <CardDescription>
            View and manage the AI's core intelligence. Define abstract medical concepts 
            (diagnoses, procedures, interventions) and their relationships (Clinical Pairings).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="concepts" className="w-full">
            <TabsList className="grid w-full grid-cols-1 md:grid-cols-2 md:w-[400px]">
              <TabsTrigger value="concepts">
                <BookMarked className="mr-2 h-4 w-4" /> Medical Concepts
              </TabsTrigger>
              <TabsTrigger value="pairings">
                <Link2 className="mr-2 h-4 w-4" /> Clinical Pairings
              </TabsTrigger>
            </TabsList>
            <TabsContent value="concepts" className="mt-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Medical Concept Lexicon</CardTitle>
                    <CardDescription>
                      List of defined abstract medical concepts and their code mappings.
                    </CardDescription>
                  </div>
                  <Dialog open={isAddConceptDialogOpen} onOpenChange={setIsAddConceptDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline">
                        <PlusCircle className="mr-2 h-4 w-4" /> Add New Concept
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[525px]">
                      <form onSubmit={handleAddMedicalConcept}>
                        <DialogHeader>
                          <DialogTitle>Add New Medical Concept</DialogTitle>
                          <DialogDescription>
                            Define a new abstract medical concept and its associated codes.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="conceptName" className="text-right">Name</Label>
                            <Input id="conceptName" value={newConceptName} onChange={(e) => setNewConceptName(e.target.value)} className="col-span-3" placeholder="e.g., Typhoid Fever" required />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="conceptType" className="text-right">Type</Label>
                            <Select value={newConceptType} onValueChange={(value) => setNewConceptType(value as MedicalConcept['conceptType'] | '')} required>
                              <SelectTrigger id="conceptType" className="col-span-3">
                                <SelectValue placeholder="Select concept type" />
                              </SelectTrigger>
                              <SelectContent>
                                {conceptTypes.map(type => (
                                  <SelectItem key={type} value={type}>{type}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="conceptCodes" className="text-right">Codes</Label>
                            <Textarea 
                              id="conceptCodes" 
                              value={newConceptCodes} 
                              onChange={(e) => setNewConceptCodes(e.target.value)} 
                              className="col-span-3" 
                              placeholder="e.g., ICD-10:A01.0;SNOMED_CT:12345,67890" 
                              rows={3}
                            />
                          </div>
                           <div className="grid grid-cols-4 items-center gap-4">
                              <p className="col-start-2 col-span-3 text-xs text-muted-foreground">
                                Format: SYSTEM:CODE1,CODE2; SYSTEM2:CODE3...
                              </p>
                            </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="conceptDescription" className="text-right">Description</Label>
                            <Textarea id="conceptDescription" value={newConceptDescription} onChange={(e) => setNewConceptDescription(e.target.value)} className="col-span-3" placeholder="Optional description of the concept" />
                          </div>
                        </div>
                        <DialogFooter>
                          <DialogClose asChild>
                            <Button type="button" variant="outline">Cancel</Button>
                          </DialogClose>
                          <Button type="submit">Add Concept</Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent>
                  {medicalConcepts.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Concept Name</TableHead>
                          <TableHead>Concept Type</TableHead>
                          <TableHead>Mapped Codes</TableHead>
                          <TableHead>Description</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {medicalConcepts.map((concept) => (
                          <TableRow key={concept.id}>
                            <TableCell className="font-medium">{concept.conceptName}</TableCell>
                            <TableCell><Badge variant="outline">{concept.conceptType}</Badge></TableCell>
                            <TableCell>{formatCodes(concept.codes)}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">{concept.description || 'N/A'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">No medical concepts defined yet. Click "Add New Concept" to begin.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="pairings" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Clinical Pairing Knowledge Graph</CardTitle>
                  <CardDescription>
                    Defined relationships between medical concepts, including commonality and criticality.
                    (Editing functionality for pairings will be added in a future step.)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {clinicalPairings.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Primary Concept</TableHead>
                          <TableHead>Relationship</TableHead>
                          <TableHead>Related Concept</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Commonality</TableHead>
                          <TableHead>Critical</TableHead>
                          <TableHead>Reason / Notes</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {clinicalPairings.map((pairing) => (
                          <TableRow key={pairing.id}>
                            <TableCell className="font-medium">{getConceptNameById(pairing.primaryConceptId, medicalConcepts)}</TableCell>
                            <TableCell className="text-sm">{pairing.relationshipType}</TableCell>
                            <TableCell className="font-medium">{getConceptNameById(pairing.relatedConceptId, medicalConcepts)}</TableCell>
                            <TableCell><Badge variant="outline">{pairing.pairingCategory || 'N/A'}</Badge></TableCell>
                            <TableCell className="text-sm text-center">{pairing.commonalityScore?.toFixed(2) || 'N/A'}</TableCell>
                            <TableCell>
                              {pairing.isCritical ? (
                                <Badge variant="destructive">Yes</Badge>
                              ) : (
                                <Badge variant="secondary">No</Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground max-w-xs truncate" title={pairing.criticalityReason || pairing.notes}>
                              {pairing.isCritical ? pairing.criticalityReason : pairing.notes || 'N/A'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">No clinical pairings defined yet.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

    