
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Share2 } from "lucide-react";

export default function IntegrationsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <Share2 className="h-7 w-7 text-primary" />
        <h1 className="text-3xl font-bold tracking-tight">External Integration Management</h1>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>API & Integration Configuration</CardTitle>
          <CardDescription>
            This section is for configuring and monitoring APIs that allow external systems to 
            consume AI recommendations or provide data to ClaimFlow.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <section>
              <h2 className="text-xl font-semibold mb-2">API Management</h2>
              <p className="text-muted-foreground">
                Future functionality will allow administrators to:
              </p>
              <ul className="list-disc list-inside text-muted-foreground ml-4">
                <li>View available API endpoints and their documentation.</li>
                <li>Generate and manage API keys for external systems.</li>
                <li>Configure rate limits and access controls for APIs.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">Integration Monitoring</h2>
              <p className="text-muted-foreground">
                Future functionality will enable administrators to:
              </p>
              <ul className="list-disc list-inside text-muted-foreground ml-4">
                <li>Monitor the status and health of connections to external systems.</li>
                <li>View logs of API requests and responses.</li>
                <li>Track API usage metrics (e.g., request volume, error rates).</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">Webhook Configuration</h2>
              <p className="text-muted-foreground">
                Future functionality will allow setup of:
              </p>
              <ul className="list-disc list-inside text-muted-foreground ml-4">
                <li>Outgoing webhooks to notify external systems of events within ClaimFlow.</li>
                <li>Incoming webhooks to receive data or triggers from external applications.</li>
              </ul>
            </section>

            <p className="text-center text-muted-foreground pt-4">
              (Detailed UI for these integration management functions will be implemented here.)
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
