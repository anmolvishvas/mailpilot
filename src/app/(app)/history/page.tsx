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
    <div className="flex flex-col gap-6 max-w-5xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <History className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Saved History</h2>
            <p className="text-xs text-muted-foreground">Access your past email generations, replies, and improvements.</p>
          </div>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search history..."
            className="pl-9 rounded-xl"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {filterTabs.map((tab) => {
          const isSelected = activeFilter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap transition-all ${
                isSelected
                  ? "bg-primary text-primary-foreground shadow-sm font-bold"
                  : "bg-card text-muted-foreground hover:bg-muted border border-border"
              }`}
            >
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* History Items List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 rounded-2xl border border-border bg-card/60 animate-pulse" />
          ))}
        </div>
      ) : historyItems.length === 0 ? (
        <div className="rounded-3xl border border-border bg-card p-12 text-center flex flex-col items-center gap-2">
          <History className="h-10 w-10 text-muted-foreground/50" />
          <h3 className="text-base font-bold text-foreground">No history items found</h3>
          <p className="text-xs text-muted-foreground">
            Generate emails or replies to have them automatically recorded here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {historyItems.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedItem(item)}
              className="flex items-start justify-between rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-sm hover:border-primary/50 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex flex-col gap-1.5 max-w-3xl">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="secondary" className="text-[10px] uppercase font-bold">
                    {item.type || "EMAIL"}
                  </Badge>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDate(item.createdAt)}
                  </span>
                  {item.tone && (
                    <Badge variant="outline" className="text-[10px] capitalize">
                      {item.tone}
                    </Badge>
                  )}
                </div>
                <h4 className="text-sm sm:text-base font-bold text-foreground group-hover:text-primary transition-colors">
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
                  className="h-8 w-8 p-0 rounded-lg text-muted-foreground hover:text-foreground"
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => handleDelete(item.id, e)}
                  className="h-8 w-8 p-0 rounded-lg text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
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
              <Badge variant="secondary" className="text-[10px] uppercase font-bold">
                {selectedItem.type || "EMAIL"}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {formatDateTime(selectedItem.createdAt)}
              </span>
            </div>
            <DialogTitle className="text-lg font-bold">
              {selectedItem.outputSubject || "Saved Email"}
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-2">
            {selectedItem.prompt && (
              <div className="rounded-xl bg-muted/40 p-3 border border-border/60 text-xs">
                <span className="font-semibold text-muted-foreground block mb-0.5">Original Intent:</span>
                <span className="text-foreground">{selectedItem.prompt}</span>
              </div>
            )}

            <div className="rounded-xl border border-border bg-card p-4 text-sm whitespace-pre-wrap leading-relaxed font-medium">
              {selectedItem.outputBody}
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDelete(selectedItem.id)}
              className="text-destructive hover:bg-destructive/10"
            >
              Delete
            </Button>
            <Button
              size="sm"
              onClick={() => handleCopy(selectedItem.outputSubject ? `Subject: ${selectedItem.outputSubject}\n\n${selectedItem.outputBody}` : selectedItem.outputBody)}
              className="gap-1.5"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              <span>{copied ? "Copied" : "Copy to Clipboard"}</span>
            </Button>
          </DialogFooter>
        </Dialog>
      )}
    </div>
  );
}
