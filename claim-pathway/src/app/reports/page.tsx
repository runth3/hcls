
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChartHorizontalBig } from "lucide-react";

export default function ReportsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <BarChartHorizontalBig className="h-7 w-7 text-primary" />
        <h1 className="text-3xl font-bold tracking-tight">Reporting & Analytics</h1>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>System Performance & Insights</CardTitle>
          <CardDescription>
            This section will provide structured reports on AI accuracy, common override patterns, 
            shifts in commonality scores, overall data quality, and other key performance indicators.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <section>
              <h2 className="text-xl font-semibold mb-2">AI Performance Reports</h2>
              <p className="text-muted-foreground">
                Future functionality will allow users to generate reports on:
              </p>
              <ul className="list-disc list-inside text-muted-foreground ml-4">
                <li>AI recommendation accuracy over time.</li>
                <li>Frequency and reasons for user overrides of AI suggestions.</li>
                <li>Impact of AI assistance on claim processing times and outcomes.</li>
                <li>Effectiveness of fraud detection models.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">Knowledge Graph & Data Trends</h2>
              <p className="text-muted-foreground">
                Future functionality will enable insights into:
              </p>
              <ul className="list-disc list-inside text-muted-foreground ml-4">
                <li>Evolution of commonality scores for medical concepts and pairings.</li>
                <li>Identification of emerging trends in diagnoses or procedures.</li>
                <li>Data quality metrics and areas for improvement.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">Operational & Compliance Reports</h2>
              <p className="text-muted-foreground">
                Future functionality will provide reports such as:
              </p>
              <ul className="list-disc list-inside text-muted-foreground ml-4">
                <li>Claim processing throughput and bottlenecks.</li>
                <li>User activity and productivity.</li>
                <li>Compliance with processing guidelines and SLAs.</li>
              </ul>
            </section>

            <p className="text-center text-muted-foreground pt-4">
              (Detailed UI for generating and viewing these reports will be implemented here.)
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
