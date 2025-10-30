import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { FileText, Image, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import apiService from "@/services/api";

interface HistoryItem {
  id: number;
  timestamp: string;
  original_text: string;
  simplified_text: string;
  actions: string[];
  type: string;
}

export function HistoryList() {
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch history from backend
    const fetchHistory = async () => {
      try {
        const response = await apiService.getHistory();
        setHistoryItems(response.items || []);
      } catch (error) {
        console.error("Failed to fetch history:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  if (loading) {
    return (
      <Card className="p-12 text-center">
        <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4 animate-pulse" />
        <p className="text-muted-foreground">Loading history...</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {historyItems.length === 0 ? (
        <Card className="p-12 text-center">
          <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No history yet</p>
          <p className="text-sm text-muted-foreground mt-2">
            Start simplifying text to see your history here
          </p>
        </Card>
      ) : (
        historyItems.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="p-4 cursor-pointer hover:shadow-md transition-all">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  {item.type === 'image' ? (
                    <Image className="h-6 w-6" />
                  ) : (
                    <FileText className="h-6 w-6" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <h3 className="font-medium">
                      {item.type === 'image' ? 'Image Analysis' : 'Text Simplification'}
                    </h3>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(item.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                    {item.original_text}
                  </p>
                  <p className="text-sm font-medium line-clamp-2">
                    {item.simplified_text}
                  </p>
                  {item.actions && item.actions.length > 0 && (
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                        {item.actions.length} action{item.actions.length > 1 ? 's' : ''}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>
        ))
      )}
    </div>
  );
}
