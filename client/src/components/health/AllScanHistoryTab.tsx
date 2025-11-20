import React, { useState } from 'react';
import { Calendar, Eye, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface ScanRecord {
  id: string;
  date: string;
  condition: 'diabetes' | 'hypertension';
  prediction: 'safe' | 'risky';
  reasoning?: string;
  foodName?: string;
  nutritionData: Record<string, number>;
  imageUrl?: string;
  userId?: string;
}

interface AllScanHistoryTabProps {
  records: ScanRecord[];
  loading: boolean;
  onViewDetails: (record: ScanRecord) => void;
}

export default function AllScanHistoryTab({ records, loading, onViewDetails }: AllScanHistoryTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCondition, setFilterCondition] = useState<string>('all');
  const [filterPrediction, setFilterPrediction] = useState<string>('all');

  const filteredRecords = records.filter((record) => {
    const matchesSearch =
      !searchTerm ||
      record.foodName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.date.includes(searchTerm) ||
      record.userId?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCondition = filterCondition === 'all' || record.condition === filterCondition;
    const matchesPrediction = filterPrediction === 'all' || record.prediction === filterPrediction;

    return matchesSearch && matchesCondition && matchesPrediction;
  });

  const getPredictionColor = (prediction: string) => {
    switch (prediction) {
      case 'safe':
        return 'bg-gradient-to-r from-blue-600 to-teal-600 text-white';
      case 'risky':
        return 'bg-gradient-to-r from-red-500 to-orange-500 text-white';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12 sm:py-16 text-gray-500 dark:text-gray-400">
        Loading all scan history...
      </div>
    );
  }

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="pb-4 px-4 sm:px-6">
        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
          <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
          All Scan History
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-2">
          View all scanned records from all users
        </p>
      </CardHeader>

      <CardContent className="space-y-4 px-4 sm:px-6">
        {/* Filters - Mobile Optimized */}
        <div className="flex flex-col gap-3 sm:gap-4">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by food name, date, or user ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-11 sm:h-10 text-base sm:text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 sm:flex sm:gap-4">
            <Select value={filterCondition} onValueChange={setFilterCondition}>
              <SelectTrigger className="h-11 sm:h-10 text-base sm:text-sm sm:w-[160px]">
                <SelectValue placeholder="All Conditions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Conditions</SelectItem>
                <SelectItem value="diabetes">Diabetes</SelectItem>
                <SelectItem value="hypertension">Hypertension</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterPrediction} onValueChange={setFilterPrediction}>
              <SelectTrigger className="h-11 sm:h-10 text-base sm:text-sm sm:w-[160px]">
                <SelectValue placeholder="All Results" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Results</SelectItem>
                <SelectItem value="safe">Safe</SelectItem>
                <SelectItem value="risky">Not Recommended</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Separator className="my-2" />

        {/* History List - Mobile Optimized */}
        <div className="space-y-3 sm:space-y-4">
          {filteredRecords.length === 0 ? (
            <div className="text-center py-12 sm:py-16 text-muted-foreground px-4">
              <Calendar className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-base sm:text-lg font-medium">No scan records found</p>
              <p className="text-sm sm:text-base mt-1">
                {searchTerm || filterCondition !== 'all' || filterPrediction !== 'all'
                  ? 'Try adjusting your filters'
                  : 'No scans available yet'}
              </p>
            </div>
          ) : (
            filteredRecords.map((record) => (
              <Card
                key={record.id}
                className="group relative overflow-hidden border-2 border-transparent hover:border-primary/50 transition-all duration-300 hover:shadow-xl"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative p-4 sm:p-5">
                  {/* Mobile: Stack vertically, Desktop: Horizontal layout */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    {/* Content Section */}
                    <div className="flex items-start gap-3 sm:gap-4 min-w-0 flex-1">
                      {/* Image */}
                      <div className="flex-shrink-0">
                        {record.imageUrl ? (
                          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 border-white shadow-lg ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all">
                            <img 
                              src={record.imageUrl} 
                              alt={record.foodName || 'scan'} 
                              className="w-full h-full object-cover" 
                            />
                          </div>
                        ) : (
                          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center shadow-lg">
                            <Calendar className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                          </div>
                        )}
                      </div>

                      {/* Text Content */}
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-base sm:text-lg truncate bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                          {record.foodName || 'Unknown Food'}
                        </p>
                        <p className="text-xs sm:text-sm text-muted-foreground truncate flex items-center gap-1.5 mt-1">
                          <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
                          <span className="truncate">{record.date}</span>
                        </p>
                        {record.userId && (
                          <p className="text-xs text-muted-foreground/70 truncate mt-1">
                            User: {record.userId.substring(0, 8)}...
                          </p>
                        )}
                        <Badge className={`${getPredictionColor(record.prediction)} mt-2 shadow-md font-medium px-2.5 py-1 text-xs sm:text-sm`}>
                          {record.prediction === 'risky' ? '⚠️ Not Recommended' : '✅ Safe for Consumption'}
                        </Badge>
                      </div>
                    </div>

                    {/* Action Button - View Details Only */}
                    <div className="flex items-center gap-2 sm:gap-3 justify-end sm:ml-4">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onViewDetails(record)}
                        className="h-11 w-11 sm:h-10 sm:w-10 rounded-xl bg-gradient-to-br from-primary via-secondary to-accent text-white hover:shadow-lg hover:scale-110 transition-all duration-200 active:scale-95"
                      >
                        <Eye className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Results Summary */}
        {filteredRecords.length > 0 && (
          <div className="text-center text-sm text-muted-foreground pt-4 border-t">
            Showing {filteredRecords.length} of {records.length} total scans
          </div>
        )}
      </CardContent>
    </Card>
  );
}
