import { Activity, Info } from "lucide-react";
import { analyzeBMI, getBMIRanges, type BMIStandard } from "@/lib/bmiUtils";
import { useState } from "react";

export default function BMISection({ form }: { form: any }) {
  const { getValues } = form;
  const [showRanges, setShowRanges] = useState(false);

  const h = getValues("demographics.heightCm");
  const w = getValues("demographics.weightKg");
  const bmiStandard = getValues("demographics.bmiStandard") || "WHO";

  const height = Number(h);
  const weight = Number(w);

  const result = analyzeBMI(height, weight, bmiStandard as BMIStandard);
  const ranges = getBMIRanges(bmiStandard as BMIStandard);

  return (
    <div className="p-4 rounded-lg border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-purple-500" />
          <h3 className="text-sm font-semibold text-foreground">
            Body Mass Index (BMI)
          </h3>
        </div>
        <button
          type="button"
          onClick={() => setShowRanges(!showRanges)}
          className="text-muted-foreground hover:text-foreground transition-colors"
          title="Show BMI ranges"
        >
          <Info className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between items-center">
          <div>
            <p>
              <strong className="text-foreground">BMI:</strong>{" "}
              <span className="font-medium text-purple-600">
                {result.bmi > 0 ? result.bmi.toFixed(1) : "0.0"}
              </span>
            </p>
            <p>
              <strong className="text-foreground">Category:</strong>{" "}
              <span className={`font-semibold ${result.categoryColor}`}>
                {result.category}
              </span>
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs px-2 py-1 rounded-md bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 font-medium">
              {result.standard} Standard
            </span>
          </div>
        </div>

        {showRanges && (
          <div className="mt-3 pt-3 border-t border-border">
            <p className="text-xs font-semibold text-muted-foreground mb-2">
              {result.standard} BMI Classification:
            </p>
            <div className="space-y-1">
              {ranges.map((item, index) => (
                <div
                  key={index}
                  className="flex justify-between text-xs"
                >
                  <span className="text-muted-foreground">{item.range}</span>
                  <span className="font-medium">{item.category}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
