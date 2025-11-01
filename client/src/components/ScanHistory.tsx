import { useState } from 'react';
import { Calendar, Filter, Search, Trash2, Eye } from 'lucide-react';
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
  prediction: 'safe' |'risky';
  foodName?: string;
  nutritionData: {
    calories: number;
    carbs: number;
    sodium: number;
  };
}

interface ScanHistoryProps {
  records: ScanRecord[];
  onViewDetails: (record: ScanRecord) => void;
  onDeleteRecord: (id: string) => void;
}

export default function ScanHistory({ records, onViewDetails, onDeleteRecord }: ScanHistoryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCondition, setFilterCondition] = useState<string>('all');
  const [filterPrediction, setFilterPrediction] = useState<string>('all');

  const filteredRecords = records.filter(record => {
    const matchesSearch = !searchTerm || 
      (record.foodName?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      record.date.includes(searchTerm);
    
    const matchesCondition = filterCondition === 'all' || record.condition === filterCondition;
    const matchesPrediction = filterPrediction === 'all' || record.prediction === filterPrediction;

    return matchesSearch && matchesCondition && matchesPrediction;
  });

  const getPredictionColor = (prediction: string) => {
    switch (prediction) {
      case 'safe': return 'bg-green-100 text-green-800';
      case 'moderate': return 'bg-orange-100 text-orange-800';
      case 'risky': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Scan History
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search scans..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="input-search-history"
              />
            </div>
          </div>
          
          <Select value={filterCondition} onValueChange={setFilterCondition}>
            <SelectTrigger className="w-full sm:w-[160px]" data-testid="select-filter-condition">
              <SelectValue placeholder="All Conditions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Conditions</SelectItem>
              <SelectItem value="diabetes">Diabetes</SelectItem>
              <SelectItem value="hypertension">Hypertension</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterPrediction} onValueChange={setFilterPrediction}>
            <SelectTrigger className="w-full sm:w-[160px]" data-testid="select-filter-prediction">
              <SelectValue placeholder="All Results" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Results</SelectItem>
              <SelectItem value="safe">Safe</SelectItem>
              <SelectItem value="risky">Risky</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* History List */}
        <div className="space-y-3">
          {filteredRecords.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No scan records found. Start by scanning your first nutrition label!
            </div>
          ) : (
            filteredRecords.map((record) => (
              <Card key={record.id} className="p-4 hover-elevate">
                <div className="flex items-center justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <Badge className={getPredictionColor(record.prediction)}>
                        {String(record.prediction).toUpperCase()}
                      </Badge>
                      <Badge variant="outline">
                        {record.condition === 'diabetes' ? 'Diabetes' : 'Hypertension'}
                      </Badge>
                    </div>
                    
                    {record.foodName && (
                      <p className="font-medium" data-testid={`text-food-name-${record.id}`}>
                        {record.foodName}
                      </p>
                    )}
                    
                    <div className="text-sm text-muted-foreground flex gap-4">
                      <span>{record.nutritionData.calories} cal</span>
                      <span>{record.nutritionData.carbs}g carbs</span>
                      <span>{record.nutritionData.sodium}mg sodium</span>
                    </div>
                    
                    <p className="text-xs text-muted-foreground">
                      {new Date(record.date).toLocaleDateString()} at{' '}
                      {new Date(record.date).toLocaleTimeString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onViewDetails(record)}
                      data-testid={`button-view-${record.id}`}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDeleteRecord(record.id)}
                      data-testid={`button-delete-${record.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}