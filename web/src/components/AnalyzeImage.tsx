import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Sparkles, Send, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import apiService from "@/services/api";

export function AnalyzeImage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [result, setResult] = useState<{
    extracted_text: string;
    simplified_text: string;
    actions: string[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggest, setShowSuggest] = useState(false);
  const [suggestType, setSuggestType] = useState("");
  const [suggestNotes, setSuggestNotes] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) {
      toast.error("Please select an image");
      return;
    }

    setIsLoading(true);
    try {
      const data = await apiService.analyzeImage(selectedFile);
      setResult(data);
      toast.success("Image analyzed successfully");
    } catch (error) {
      toast.error("Failed to analyze image");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitSuggestion = () => {
    if (!suggestType.trim()) {
      toast.error("Please tell us what type of document this is");
      return;
    }
    
    toast.success("Thank you! We'll work on improving this.");
    setSuggestType("");
    setSuggestNotes("");
    setShowSuggest(false);
  };

  if (showSuggest) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <Button
          variant="ghost"
          onClick={() => setShowSuggest(false)}
          className="mb-2"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Analyze
        </Button>

        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Report Document Type</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Help us improve by sharing what issues you encountered!
          </p>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Document Type
              </label>
              <Input
                placeholder="e.g., 'Birth Certificate', 'Medical Bill', 'Court Summons'"
                value={suggestType}
                onChange={(e) => setSuggestType(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                What went wrong? (Optional)
              </label>
              <Textarea
                placeholder="e.g., 'Text was blurry', 'Handwriting not recognized', 'Wrong language detected'..."
                value={suggestNotes}
                onChange={(e) => setSuggestNotes(e.target.value)}
                className="min-h-[100px]"
              />
            </div>

            <Button onClick={handleSubmitSuggestion} className="w-full">
              <Send className="h-4 w-4 mr-2" />
              Submit Feedback
            </Button>
          </div>
        </Card>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="p-6 border">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Upload Image
              </label>
              <Input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="cursor-pointer"
              />
            </div>

            {preview && (
              <div className="rounded-md border overflow-hidden">
                <img src={preview} alt="Preview" className="w-full h-auto" />
              </div>
            )}

            <Button
              onClick={handleAnalyze}
              disabled={isLoading || !selectedFile}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Analyze Image
                </>
              )}
            </Button>
          </div>
        </Card>
      </motion.div>

      {result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="p-6 border">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Simplified Text
                </label>
                <div className="p-4 rounded-md bg-green-50 border border-green-200">
                  <p className="text-sm leading-relaxed">{result.simplified_text}</p>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Suggest Feature */}
      <Card className="p-4 bg-green-50 border-green-200">
        <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
          <Send className="h-4 w-4 text-green-600" />
          Report Document Type
        </h3>
        <p className="text-sm text-muted-foreground mb-3">
          Run into any issues? Let us know!
        </p>
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full"
          onClick={() => setShowSuggest(true)}
        >
          Submit Feedback
        </Button>
      </Card>
    </div>
  );
}
