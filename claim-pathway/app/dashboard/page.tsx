
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getMockClaims, getRecentClaims, getFlaggedClaims } from "@/lib/mock-data";
import type { Claim } from "@/lib/types";
import { ArrowUpRight, DollarSign, FileText, AlertTriangle, CheckCircle2, Clock, BarChart3, ShieldAlert, ListChecks, HeartPulse, DatabaseZap, MessageSquare } from "lucide-react";
import Link from "next/link";
import { DashboardCharts } from "@/components/dashboard/dashboard-charts";


const StatCard = ({ title, value, icon: Icon, trend, trendDirection, description, linkTo }: { title: string, value: string | number, icon: React.ElementType, trend?: string, trendDirection?: 'up' | 'down', description: string, linkTo?: string }) => (
  <Card className="hover:shadow-md transition-shadow">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-5 w-5 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      {trend && (
        <p className={`text-xs ${trendDirection === 'up' ? 'text-green-600' : 'text-red-600'}`}>
          {trendDirection === 'up' ? '+' : '-'}{trend} {description}
        </p>
      )}
      {!trend && <p className="text-xs text-muted-foreground">{description}</p>}
      {linkTo && (
        <Button variant="link" size="sm" asChild className="p-0 h-auto mt-1 text-xs">
            <Link href={linkTo}>View Details <ArrowUpRight className="ml-1 h-3 w-3" /></Link>
        </Button>
      )}
    </CardContent>
  </Card>
);

const claimsData = getMockClaims();
const totalClaims = claimsData.length;
const pendingClaims = claimsData.filter(c => c.status === 'Pending Review' || c.status === 'Under Review').length;
const highRiskClaimsCount = claimsData.filter(c => c.riskLevel === 'High' || c.riskLevel === 'Critical').length;
const totalClaimAmount = claimsData.reduce((sum, c) => sum + c.claimAmount, 0);

// Mock data for critical findings count, in a real app, this would come from a data source.
// Based on the mockCriticalFindings in src/app/critical-findings/page.tsx
const criticalCodePairAlertsCount = 4; 

const recentClaims = getRecentClaims(5);
const flaggedClaimsList = getFlaggedClaims(5);


export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1> {/* Main page title remains Dashboard for now, header title is changed */}
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Claims" value={totalClaims} icon={FileText} description="in the system" linkTo="/claims" />
        <StatCard title="Pending Review" value={pendingClaims} icon={Clock} trend="5.2%" trendDirection="up" description="from last week" />
        <StatCard title="AI Flagged High Risk" value={highRiskClaimsCount} icon={AlertTriangle} description="claims needing attention" linkTo="/claims?riskLevel=High" />
        <StatCard title="Critical Code Pair Alerts" value={criticalCodePairAlertsCount} icon={ListChecks} description="known critical combinations" linkTo="/critical-findings" />
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
         <StatCard title="Total Claim Value" value={`Rp ${totalClaimAmount.toLocaleString()}`} icon={DollarSign} description="processed this month" />
         <StatCard title="AI Model Health" value="Nominal" icon={HeartPulse} description="Real-time Status" />
         <StatCard title="Data Ingestion" value="Active" icon={DatabaseZap} description="Last sync: 2m ago" />
         <StatCard title="AI Recommendations" value="82% Accepted" icon={MessageSquare} description="User feedback rate" />
      </div>

      <DashboardCharts />

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Claims</CardTitle>
            <Button asChild variant="outline" size="sm">
              <Link href="/claims">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <ClaimsMiniTable claims={recentClaims} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Flagged for Audit</CardTitle>
             <Button asChild variant="outline" size="sm">
              <Link href="/claims?status=Flagged+for+Audit">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <ClaimsMiniTable claims={flaggedClaimsList} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ClaimsMiniTable({ claims }: { claims: Claim[] }) {
  if (!claims.length) {
    return <p className="text-sm text-muted-foreground">No claims to display.</p>;
  }
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Claim ID</TableHead>
          <TableHead>Patient</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Amount</TableHead>
          <TableHead className="text-right">Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {claims.map((claim) => (
          <TableRow key={claim.id}>
            <TableCell className="font-medium">{claim.claimNumber}</TableCell>
            <TableCell>{claim.patientName}</TableCell>
            <TableCell><Badge variant={getStatusVariant(claim.status)}>{claim.status}</Badge></TableCell>
            <TableCell className="text-right">Rp {claim.claimAmount.toLocaleString()}</TableCell>
            <TableCell className="text-right">
              <Button asChild variant="ghost" size="sm">
                <Link href={`/claims/${claim.id}`}>Details</Link>
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function getStatusVariant(status: Claim['status']): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case 'Approved': return 'default'; // Primary color for approved
    case 'Partially Approved': return 'default';
    case 'Pending Review':
    case 'Under Review': 
    case 'Additional Info Required':
    case 'Submitted':
    case 'Appealed':
      return 'secondary';
    case 'Denied': return 'destructive';
    case 'Flagged for Audit': return 'destructive'; // Or a specific "warning" variant if available
    case 'Closed': return 'outline';
    default: return 'outline';
  }
}

