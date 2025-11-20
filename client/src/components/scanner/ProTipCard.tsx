import { Lightbulb } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function ProTipCard() {
  return (
    <Card className="border-amber-200 dark:border-amber-800 bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-50 dark:from-amber-950/30 dark:via-yellow-950/30 dark:to-amber-950/30">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center shadow-md">
            <Lightbulb className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-amber-900 dark:text-amber-100 mb-1 flex items-center gap-2">
              💡 Did You Know?
            </h3>
            <p className="text-sm text-amber-800 dark:text-amber-200 leading-relaxed">
              The order in which ingredients are listed on a product's label tells you how much of each ingredient is used. 
              <span className="font-semibold"> If sugar is listed first, it means sugar is the most used ingredient in that product!</span> 
              {" "}This can help you make healthier choices by checking what's really in your food.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
