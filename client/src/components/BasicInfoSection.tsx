import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { User, Mail, Calendar, Activity } from "lucide-react";

export default function BasicInfoSection({
  form,
  isEditing,
}: {
  form: any;
  isEditing: boolean;
}) {
  const maskSensitive = (value: string) => {
    if (!value) return "";
    const [name, domain] = value.split("@");
    return name && domain ? `${name[0]}***@${domain}` : value;
  };

  return (
    <div className="p-6 rounded-2xl bg-white border border-border shadow-lg">
      {/* Section Header */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Full Name */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem className="space-y-1">
              <FormLabel className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <User className="w-4 h-4 text-blue-500" />
                Full Name
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  disabled={!isEditing}
                  className={`bg-white border border-gray-200 rounded-lg text-foreground focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 ${
                    !isEditing ? "opacity-75 cursor-not-allowed" : ""
                  }`}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Email */}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem className="space-y-1">
              <FormLabel className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Mail className="w-4 h-4 text-blue-500" />
                Email
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  value={isEditing ? field.value : maskSensitive(field.value)}
                  disabled={!isEditing}
                  className={`bg-white border border-gray-200 rounded-lg text-foreground focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all duration-200 ${
                    !isEditing ? "opacity-75 cursor-not-allowed" : ""
                  }`}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Age */}
        <FormField
          control={form.control}
          name="age"
          render={({ field }) => (
            <FormItem className="space-y-1">
              <FormLabel className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Calendar className="w-4 h-4 text-blue-500" />
                Age
              </FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  disabled={!isEditing}
                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                  className={`bg-white border border-gray-200 rounded-lg text-foreground focus:ring-2 focus:ring-green-400 focus:border-green-400 transition-all duration-200 ${
                    !isEditing ? "opacity-75 cursor-not-allowed" : ""
                  }`}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Primary Condition */}
        <FormField
          control={form.control}
          name="primaryCondition"
          render={({ field }) => (
            <FormItem className="space-y-1">
              <FormLabel className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Activity className="w-4 h-4 text-blue-500" />
                Primary Condition
              </FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={!isEditing}
              >
                <FormControl>
                  <SelectTrigger
                    className={`bg-white border border-gray-200 rounded-lg text-foreground focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition-all duration-200 ${
                      !isEditing ? "opacity-75 cursor-not-allowed" : ""
                    }`}
                  >
                    <SelectValue placeholder="Select condition" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-white text-gray-800">
                  <SelectItem value="diabetes">Diabetes</SelectItem>
                  <SelectItem value="hypertension">Hypertension</SelectItem>
                  <SelectItem value="both">Both</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
