import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";

export default function Home() {
  const { user, isAuthenticated, logout } = useAuth();
  const [, setLocation] = useLocation();

  const handleAdminClick = () => {
    if (isAuthenticated && user?.role === "admin") {
      setLocation("/admin");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold">HeyGen Saad Panel</CardTitle>
            <CardDescription>License Management System</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isAuthenticated ? (
              <>
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <p className="text-sm text-slate-600">Logged in as</p>
                  <p className="font-semibold text-slate-900">{user?.name || user?.email}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Role: <span className="font-mono">{user?.role}</span>
                  </p>
                </div>

                {user?.role === "admin" && (
                  <Button onClick={handleAdminClick} className="w-full" size="lg">
                    Go to Admin Dashboard
                  </Button>
                )}

                <Button onClick={() => logout()} variant="outline" className="w-full">
                  Logout
                </Button>
              </>
            ) : (
              <>
                <p className="text-center text-slate-600 text-sm">
                  Only admins can access the license management system.
                </p>
                <Button asChild className="w-full" size="lg">
                  <a href={getLoginUrl()}>Login with Manus</a>
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        <div className="mt-8 text-center text-sm text-slate-600">
          <p>HeyGen License Admin Panel v1.0</p>
        </div>
      </div>
    </div>
  );
}
