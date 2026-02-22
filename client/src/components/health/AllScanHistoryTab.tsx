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
              placeholder="Search by food name"
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
              className="relative border rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-center gap-3 p-3 w-full overflow-hidden">
                
                {/* Image */}
                <div className="flex-shrink-0">
                  {record.imageUrl ? (
                    <img
                      src={record.imageUrl}
                      alt={record.foodName || 'scan'}
                      className="w-14 h-14 rounded-lg object-cover border"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white">
                      <Calendar className="w-6 h-6" />
                    </div>
                  )}
                </div>

                {/* Text + Status */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">
                    {record.foodName || 'Unknown Food'}
                  </p>

                  <p className="text-xs text-muted-foreground truncate flex items-center gap-1 mt-0.5">
                    <Calendar className="w-3 h-3" />
                    {record.date}
                  </p>

                  <div className="mt-1">
                    <Badge
                      className={`
                        ${record.prediction === 'risky'
                          ? 'bg-red-500/10 text-red-700'
                          : 'bg-green-500/10 text-green-700'
                        }
                        px-2 py-0.5 text-[10px] font-medium rounded-md
                      `}
                    >
                      {record.prediction === 'risky'
                        ? 'Not Recommended'
                        : 'Safe'}
                    </Badge>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-shrink-0 items-center gap-1 ml-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onViewDetails(record)}
                    className="h-9 w-9 rounded-md hover:bg-accent"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
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