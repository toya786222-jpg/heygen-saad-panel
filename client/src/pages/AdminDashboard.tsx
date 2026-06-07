import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { trpc } from "@/lib/trpc";
import { format } from "date-fns";
import { AlertCircle, CheckCircle2, XCircle, Clock } from "lucide-react";
import { useEffect } from "react";
import { useLocation } from "wouter";

export default function AdminDashboard() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!isAuthenticated) {
      setLocation("/");
    }
  }, [isAuthenticated, setLocation]);

  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>Only admins can access this page.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const { data: licenses, isLoading } = trpc.licenses.list.useQuery();
  const approveMutation = trpc.licenses.approve.useMutation({
    onSuccess: () => {
      utils.licenses.list.invalidate();
    },
  });
  const revokeMutation = trpc.licenses.revoke.useMutation({
    onSuccess: () => {
      utils.licenses.list.invalidate();
    },
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case "revoked":
        return <XCircle className="w-4 h-4 text-red-600" />;
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case "revoked":
        return <Badge className="bg-red-100 text-red-800">Revoked</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">HeyGen License Admin</h1>
          <p className="text-slate-600">Manage user license requests and approvals</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Total Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{licenses?.length || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Approved</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {licenses?.filter((l) => l.status === "approved").length || 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">
                {licenses?.filter((l) => l.status === "pending").length || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Licenses Table */}
        <Card>
          <CardHeader>
            <CardTitle>License Requests</CardTitle>
            <CardDescription>View and manage all license requests from users</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Spinner />
              </div>
            ) : licenses && licenses.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Device Code</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Requested</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {licenses.map((license) => (
                      <TableRow key={license.id}>
                        <TableCell className="font-medium">{license.userName || "—"}</TableCell>
                        <TableCell>{license.contactEmail || "—"}</TableCell>
                        <TableCell className="font-mono text-sm">{license.deviceCode}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(license.status)}
                            {getStatusBadge(license.status)}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-slate-600">
                          {format(new Date(license.createdAt), "MMM dd, yyyy")}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {license.status !== "approved" && (
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() =>
                                  approveMutation.mutate({ deviceCode: license.deviceCode })
                                }
                                disabled={approveMutation.isPending}
                              >
                                {approveMutation.isPending ? "..." : "Approve"}
                              </Button>
                            )}
                            {license.status !== "revoked" && (
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() =>
                                  revokeMutation.mutate({ deviceCode: license.deviceCode })
                                }
                                disabled={revokeMutation.isPending}
                              >
                                {revokeMutation.isPending ? "..." : "Revoke"}
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500">
                <p>No license requests yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
