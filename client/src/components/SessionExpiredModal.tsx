import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { useLocation } from "wouter";

interface SessionExpiredModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SessionExpiredModal({ isOpen, onClose }: SessionExpiredModalProps) {
  const [, setLocation] = useLocation();

  const handleOk = () => {
    // Clear all auth data
    localStorage.removeItem("safe_school_remember_me_super");
    localStorage.removeItem("safe_school_remember_me_admin");
    localStorage.removeItem("auth_tokens");
    
    // Redirect to appropriate login page
    const isAdminRoute = window.location.pathname.startsWith('/admin');
    setLocation(isAdminRoute ? '/admin/login' : '/login');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <DialogTitle>Session Expired</DialogTitle>
          </div>
        </DialogHeader>
        
        <div className="py-4">
          <p className="text-sm text-muted-foreground">
            Your session has expired due to inactivity. For security reasons, please log in again to continue.
          </p>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleOk} className="w-full">
            OK
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
