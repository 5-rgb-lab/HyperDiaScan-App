import { useState } from 'react';
import { Camera, History, Zap, Shield, Clock } from 'lucide-react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
// Page component for the home page
export default function Home() {
  const [recentScans] = useState([
    { name: 'Greek Yogurt', result: 'safe', time: '2 hours ago' },
    { name: 'Frozen Pizza', result: 'risky', time: 'Yesterday' },
  ]);

  const features = [
    {
      icon: Zap,
      title: 'Instant OCR Scanning',
      description: 'Upload nutrition labels and get instant text extraction using advanced OCR technology'
    },
    {
      icon: Shield,
      title: 'AI Health Analysis',
      description: 'Get personalized risk assessment for diabetes and hypertension management'
    },
    {
      icon: Clock,
      title: 'Scan History',
      description: 'Track your food choices over time with comprehensive scan history'
    }
  ];

  const getResultColor = (result: string) => {
    switch (result) {
      case 'safe': return 'bg-green-100 text-green-800';
      case 'risky': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-6 py-8">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-foreground" data-testid="text-hero-title">
            HyperDiaScan
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Quick-scan food analyzer for diabetes and hypertension management. 
            Make informed food choices with instant nutrition label analysis.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/scanner">
            <Button size="lg" className="w-full sm:w-auto" data-testid="button-start-scanning">
              <Camera className="w-5 h-5 mr-2" />
              Start Scanning
            </Button>
          </Link>
          <Link href="/history">
            <Button variant="outline" size="lg" className="w-full sm:w-auto" data-testid="button-view-history">
              <History className="w-5 h-5 mr-2" />
              View History
            </Button>
          </Link>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <Card key={index} className="text-center hover-elevate">
              <CardHeader>
                <Icon className="w-12 h-12 text-primary mx-auto mb-4" />
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Activity */}
      {recentScans.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="w-5 h-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentScans.map((scan, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium" data-testid={`text-recent-scan-${index}`}>
                      {scan.name}
                    </p>
                    <p className="text-sm text-muted-foreground">{scan.time}</p>
                  </div>
                  <Badge className={getResultColor(scan.result)}>
                    {scan.result.toUpperCase()}
                  </Badge>
                </div>
              ))}
            </div>
            <Link href="/history">
              <Button variant="outline" className="w-full mt-4" data-testid="button-see-all-scans">
                See All Scans
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Health Tips */}
      <Card className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <Shield className="w-8 h-8 text-blue-600 mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                Health Tip of the Day
              </h3>
              <p className="text-blue-800 dark:text-blue-200">
                Always check sodium content when managing hypertension. The American Heart Association 
                recommends no more than 2,300mg per day, with 1,500mg being ideal for most adults.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}