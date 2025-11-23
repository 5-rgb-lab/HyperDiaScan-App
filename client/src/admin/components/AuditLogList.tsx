"use client";

import { useState, useEffect } from "react";
import {
  collection,
  query,
  orderBy,
  startAfter,
  limit,
  getDocs,
  where,
  QueryConstraint,
  DocumentData,
  QueryDocumentSnapshot,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { AlertCircle, Check, Filter, Clock } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import { AuditLogEntry, AuditCategory } from "../lib/auditLog";

type TimeFilter = "all" | "1h" | "24h" | "7d" | "30d";
const PAGE_SIZE = 20;

export default function AuditLogList() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingPage, setLoadingPage] = useState(false);
  const [lastDocs, setLastDocs] = useState<QueryDocumentSnapshot<DocumentData>[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [selectedCategories, setSelectedCategories] = useState<AuditCategory[]>([]);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all");

  const categories: AuditCategory[] = ["auth", "profile", "scan"];

  // ---------------------
  // BUILD QUERY CONSTRAINTS
  // ---------------------
  const buildQueryConstraints = (): QueryConstraint[] => {
    const constraints: QueryConstraint[] = [];

    // Category filter
    if (selectedCategories.length === 1) {
      constraints.push(where("category", "==", selectedCategories[0]));
    } else if (selectedCategories.length > 1) {
      // Firestore does not allow "in" with >10 items but fine for small array
      constraints.push(where("category", "in", selectedCategories));
    }

    // Time filter
    if (timeFilter !== "all") {
      const now = new Date();
      const fromTime = new Date();
      switch (timeFilter) {
        case "1h":
          fromTime.setHours(now.getHours() - 1);
          break;
        case "24h":
          fromTime.setHours(now.getHours() - 24);
          break;
        case "7d":
          fromTime.setDate(now.getDate() - 7);
          break;
        case "30d":
          fromTime.setDate(now.getDate() - 30);
          break;
      }
      constraints.push(where("timestamp", ">=", fromTime));
    }

    return constraints;
  };

  // ---------------------
  // LOAD PAGE
  // ---------------------
  const loadPage = async (page: number) => {
    setLoadingPage(true);

    let qConstraints = [...buildQueryConstraints()];
    let baseQuery = query(
      collection(db, "auditLogs"),
      orderBy("timestamp", "desc"),
      limit(PAGE_SIZE),
      ...qConstraints
    );

    // apply startAfter if page > 1
    if (page > 1 && lastDocs[page - 2]) {
      baseQuery = query(
        collection(db, "auditLogs"),
        orderBy("timestamp", "desc"),
        startAfter(lastDocs[page - 2]),
        limit(PAGE_SIZE),
        ...qConstraints
      );
    }

    const snapshot = await getDocs(baseQuery);

    const newLogs: AuditLogEntry[] = snapshot.docs.map((doc) => {
      const data = doc.data();
      const rawTs = data.timestamp;
      const ts =
        typeof rawTs?.toDate === "function"
          ? rawTs.toDate()
          : rawTs
          ? new Date(rawTs)
          : null;

      return {
        userId: data.userId,
        category: data.category,
        action: data.action,
        description: data.description,
        timestamp: ts,
        status: data.status,
        severity: data.severity,
        metadata: data.metadata,
      } as AuditLogEntry;
    });

    setLogs(newLogs);

    // Save last doc for this page
    const newLastDocs = [...lastDocs];
    newLastDocs[page - 1] = snapshot.docs[snapshot.docs.length - 1];
    setLastDocs(newLastDocs);

    // Estimate total pages (very basic, could be improved with count collection)
    if (snapshot.docs.length < PAGE_SIZE) setTotalPages(page);

    setCurrentPage(page);
    setLoading(false);
    setLoadingPage(false);
  };

    // ---------------------
    // FILTER CHANGE
    // ---------------------
    useEffect(() => {
      const updateTotalPagesAndLoad = async () => {
        setLastDocs([]);
        setCurrentPage(1);

        // Build the same constraints as your loadPage
        const constraints = buildQueryConstraints();

        // Count total logs matching filters
        const countQuery = query(collection(db, "auditLogs"), ...constraints);
        const snapshot = await getDocs(countQuery);
        const totalLogs = snapshot.size;
        const pages = Math.ceil(totalLogs / PAGE_SIZE) || 1;

        setTotalPages(pages);
        loadPage(1);
      };

      updateTotalPagesAndLoad();
    }, [selectedCategories, timeFilter]);


  // ---------------------
  // UI HELPERS
  // ---------------------
  const formatAction = (action: string) =>
    action
      .split(".")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ")
      .replace(/_/g, " ");

  const getCategoryColor = (category: AuditCategory) =>
    ({
      auth: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      profile: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      health: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      scan: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      system: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
    }[category] || "bg-gray-100 text-gray-800");

  const getSeverityColor = (sev: string) =>
    ({
      info: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      warning: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      error: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    }[sev] || "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200");

  const toggleCategory = (cat: AuditCategory) =>
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );

  const getTimeFilterLabel = (filter: TimeFilter) =>
    ({
      all: "All Time",
      "1h": "Last Hour",
      "24h": "Last 24 Hours",
      "7d": "Last 7 Days",
      "30d": "Last 30 Days",
    }[filter]);

  // ---------------------
  // RENDER
  // ---------------------
  if (loading && !loadingPage) {
    return (
      <div className="flex justify-center items-center h-32">
        Loading...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">Activity Log</h3>
        </div>

        <div className="flex gap-2">
          {/* Time Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Clock className="h-4 w-4" /> Time Filter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Filter by Time</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup
                value={timeFilter}
                onValueChange={(v) => setTimeFilter(v as TimeFilter)}
              >
                {["all", "1h", "24h", "7d", "30d"].map((f) => (
                  <DropdownMenuRadioItem key={f} value={f}>
                    {getTimeFilterLabel(f as TimeFilter)}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Category Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="h-4 w-4" /> Category
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Filter by Category</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {categories.map((category) => (
                <DropdownMenuCheckboxItem
                  key={category}
                  checked={selectedCategories.includes(category)}
                  onCheckedChange={() => toggleCategory(category)}
                >
                  <span className="capitalize">{category}</span>
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>User ID</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Severity</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    No logs found
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log, index) => (
                  <TableRow key={index} className="hover:bg-muted/30">
                    <TableCell>
                      {log.timestamp
                        ? formatDistanceToNow(log.timestamp, { addSuffix: true })
                        : "N/A"}
                    </TableCell>
                    <TableCell>
                      <Badge className={getCategoryColor(log.category) + " capitalize"}>
                        {log.category}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatAction(log.action)}</TableCell>
                    <TableCell className="truncate max-w-md">
                      {log.description}
                    </TableCell>
                    <TableCell className="font-mono text-xs">{log.userId.slice(0, 8)}...</TableCell>
                    <TableCell className="text-center">
                      {log.status === "success" ? (
                        <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/20">
                          <Check className="h-4 w-4 text-green-600" />
                        </div>
                      ) : (
                        <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/20">
                          <AlertCircle className="h-4 w-4 text-red-600" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className={getSeverityColor(log.severity) + " capitalize"}>
                        {log.severity}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex justify-center gap-2 mt-2">
        <Button
          onClick={() => loadPage(currentPage - 1)}
          disabled={currentPage === 1 || loadingPage}
        >
          Prev
        </Button>

        {[...Array(totalPages)].map((_, idx) => {
          const pageNum = idx + 1;
          return (
            <Button
              key={pageNum}
              variant={pageNum === currentPage ? "default" : "outline"}
              onClick={() => loadPage(pageNum)}
              disabled={loadingPage}
            >
              {pageNum}
            </Button>
          );
        })}

        <Button
          onClick={() => loadPage(currentPage + 1)}
          disabled={currentPage === totalPages || loadingPage}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
