import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { User, Mail, Activity, Calendar, Shield, Heart, Scale, UserCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export interface UserDetails {
  id: string;
  name: string;
  email: string;
  active: boolean;
  primaryCondition?: string;
  lastActive?: string;
  createdAt?: string;
  role?: string;
  demographics?: {
    age?: number;
    biologicalSex?: string;
    heightCm?: number;
    weightKg?: number;
    activityLevel?: string;
  };
  diabetesStatus?: {
    bloodSugar?: number;
  };
  hypertensionStatus?: {
    bloodPressure?: {
      systolic?: number;
      diastolic?: number;
    };
  };
  otherConditions?: {
    kidneyDisease?: boolean;
    heartDisease?: boolean;
  };
  recentActions?: {
    action: string;
    timestamp: string;
  }[];
}

interface UserDetailsModalProps {
  user: UserDetails | null;
  open: boolean;
  onClose: () => void;
}

export function UserDetailsModal({ user, open, onClose }: UserDetailsModalProps) {
  if (!user) return null;

  const calculateBMI = () => {
    if (user.demographics?.heightCm && user.demographics?.weightKg) {
      const heightM = user.demographics.heightCm / 100;
      const bmi = user.demographics.weightKg / (heightM * heightM);
      return bmi.toFixed(1);
    }
    return null;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <UserCircle className="h-6 w-6 text-blue-600" />
            User Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h3 className="text-xl font-semibold">{user.name}</h3>
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Mail className="h-4 w-4" />
                {user.email}
              </p>
            </div>
            <div className="flex gap-2">
              <Badge variant={user.active ? "default" : "secondary"} className={user.active ? "bg-green-500" : ""}>
                {user.active ? 'Active' : 'Inactive'}
              </Badge>
              <Badge variant="outline">
                <Shield className="h-3 w-3 mr-1" />
                {user.role || 'User'}
              </Badge>
            </div>
          </div>

          <Separator />

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <User className="h-4 w-4 text-blue-600" />
                Basic Information
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">User ID:</span>
                  <span className="font-mono">{user.id.slice(0, 12)}...</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Primary Condition:</span>
                  <Badge variant="outline" className="capitalize">
                    {user.primaryCondition || 'Not Set'}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Joined:</span>
                  <span>{user.createdAt || 'Unknown'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last Active:</span>
                  <span>{user.lastActive || 'Never'}</span>
                </div>
              </div>
            </div>

            {user.demographics && (
              <div className="space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <Scale className="h-4 w-4 text-blue-600" />
                  Demographics
                </h4>
                <div className="space-y-2 text-sm">
                  {user.demographics.age && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Age:</span>
                      <span>{user.demographics.age} years</span>
                    </div>
                  )}
                  {user.demographics.biologicalSex && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Sex:</span>
                      <span>{user.demographics.biologicalSex}</span>
                    </div>
                  )}
                  {user.demographics.heightCm && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Height:</span>
                      <span>{user.demographics.heightCm} cm</span>
                    </div>
                  )}
                  {user.demographics.weightKg && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Weight:</span>
                      <span>{user.demographics.weightKg} kg</span>
                    </div>
                  )}
                  {calculateBMI() && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">BMI:</span>
                      <span className="font-semibold">{calculateBMI()}</span>
                    </div>
                  )}
                  {user.demographics.activityLevel && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Activity Level:</span>
                      <span>{user.demographics.activityLevel}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <Separator />

        </div>
      </DialogContent>
    </Dialog>
  );
}
