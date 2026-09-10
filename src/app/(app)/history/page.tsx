"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  History,
  Search,
  Copy,
  Trash2,
  ExternalLink,
  Sparkles,
  Check,
  Bookmark,
  Calendar,
  Send,
  Wand2,
  BarChart3,
  Bot,
  Languages,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { formatDate, formatDateTime } from "@/lib/utils";

const filterTabs = [
  { id: "ALL", label: "All History" },
  { id: "GENERATE", label: "Generated", icon: Sparkles },
  { id: "REPLY", label: "Replies", icon: Send },
  { id: "IMPROVE", label: "Improved", icon: Wand2 },
  { id: "ANALYZE", label: "Analyzed", icon: BarChart3 },
  { id: "HUMANIZE", label: "Humanized", icon: Bot },
  { id: "TRANSLATE", label: "Translated", icon: Languages },
];

export default function HistoryPage() {
  const router = useRouter();
  const { success, error } = useToast();

  const [activeFilter, setActiveFilter] = React.useState("ALL");
  const [search, setSearch] = React.useState("");
  const [historyItems, setHistoryItems] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  // Selected item detail modal
  const [selectedItem, setSelectedItem] = React.useState<any | null>(null);
  const [copied, setCopied] = React.useState(false);

  const fetchHistory = React.useCallback(async () => {
    setLoading(true);
    try {
      let url = "/api/history?";
      if (activeFilter !== "ALL") url += `type=${activeFilter}&`;
      if (search) url += `search=${encodeURIComponent(search)}&`;

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setHistoryItems(data);
      }
    } catch {
      error("Failed to fetch history");
    } finally {
      setLoading(false);
    }
  }, [activeFilter, search]);

  React.useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleDelete = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!confirm("Are you sure you want to remove this from your history?")) return;

    try {
      const res = await fetch(`/api/history/${id}`, { method: "DELETE" });
      if (res.ok) {
        setHistoryItems((prev) => prev.filter((item) => item.id !== id));
        if (selectedItem?.id === id) setSelectedItem(null);
        success("Removed from history");
      }
    } catch {
      error("Failed to delete history item");
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground">Saved History</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Access past email generations, replies, and improvements.</p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search history..."
            className="pl-8.5 rounded-lg h-9 text-xs"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {filterTabs.map((tab) => {
          const isSelected = activeFilter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors ${
                isSelected
                  ? "bg-foreground text-background font-semibold"
                  : "bg-card text-muted-foreground hover:bg-secondary hover:text-foreground border border-border"
              }`}
            >
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* History Items List */}
      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 rounded-lg border border-border bg-secondary/30 animate-pulse" />
          ))}
        </div>
      ) : historyItems.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center flex flex-col items-center gap-2">
          <History className="h-8 w-8 text-muted-foreground/50" />
          <h3 className="text-sm font-semibold text-foreground">No history items found</h3>
          <p className="text-xs text-muted-foreground">
            Generate emails or replies to have them automatically recorded here.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {historyItems.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedItem(item)}
              className="flex items-start justify-between rounded-lg border border-border bg-card p-3.5 shadow-sm hover:border-foreground/30 transition-colors cursor-pointer group"
            >
              <div className="flex flex-col gap-1 max-w-3xl">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] uppercase font-medium text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">
                    {item.type || "EMAIL"}
                  </span>
                  <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDate(item.createdAt)}
                  </span>
                  {item.tone && (
                    <span className="text-[10px] text-muted-foreground capitalize border border-border px-1.5 py-0.2 rounded">
                      {item.tone}
                    </span>
                  )}
                </div>
                <h4 className="text-xs sm:text-sm font-semibold text-foreground group-hover:underline">
                  {item.outputSubject || item.prompt || "Email Generation"}
                </h4>
                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {item.outputBody}
                </p>
              </div>

              <div className="flex items-center gap-1 shrink-0 ml-3">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopy(item.outputSubject ? `Subject: ${item.outputSubject}\n\n${item.outputBody}` : item.outputBody);
                  }}
                  className="h-7 w-7 p-0 rounded-md text-muted-foreground hover:text-foreground"
                >
                  <Copy className="h-3.5 w-3.5" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => handleDelete(item.id, e)}
                  className="h-7 w-7 p-0 rounded-md text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Item Detail Modal */}
      {selectedItem && (
        <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
          <DialogHeader>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] uppercase font-medium text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">
                {selectedItem.type || "EMAIL"}
              </span>
              <span className="text-xs text-muted-foreground">
                {formatDateTime(selectedItem.createdAt)}
              </span>
            </div>
            <DialogTitle className="text-base font-semibold">
              {selectedItem.outputSubject || "Saved Email"}
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-3 py-2">
            {selectedItem.prompt && (
              <div className="rounded-lg bg-secondary/30 p-2.5 border border-border text-xs">
                <span className="font-medium text-muted-foreground block mb-0.5">Original Intent:</span>
                <span className="text-foreground">{selectedItem.prompt}</span>
              </div>
            )}

            <div className="rounded-lg border border-border bg-card p-3.5 text-xs sm:text-sm whitespace-pre-wrap leading-relaxed font-normal">
              {selectedItem.outputBody}
            </div>
          </div>

          <DialogFooter className="gap-1.5 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDelete(selectedItem.id)}
              className="h-8 text-xs text-destructive hover:bg-destructive/10"
            >
              Delete
            </Button>
            <Button
              size="sm"
              onClick={() => handleCopy(selectedItem.outputSubject ? `Subject: ${selectedItem.outputSubject}\n\n${selectedItem.outputBody}` : selectedItem.outputBody)}
              className="h-8 text-xs font-medium gap-1.5"
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? "Copied" : "Copy Email"}</span>
            </Button>
          </DialogFooter>
        </Dialog>
      )}
    </div>
  );
}
