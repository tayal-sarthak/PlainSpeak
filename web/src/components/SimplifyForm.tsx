import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2, Sparkles, Volume2, Copy, Check, Send, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import apiService from "@/services/api";

export function SimplifyForm() {
  const [inputText, setInputText] = useState("");
  const [simplifiedText, setSimplifiedText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showSuggest, setShowSuggest] = useState(false);
  const [suggestText, setSuggestText] = useState("");
  const [suggestNotes, setSuggestNotes] = useState("");

  const handleSimplify = async () => {
    if (!inputText.trim()) {
      toast.error("Please enter some text to simplify");
      return;
    }

    setIsLoading(true);
    try {
      // Get reading level from localStorage and convert to grade number
      const readingLevel = localStorage.getItem("plainspeak-reading-level") || "middle";
      const gradeMap: Record<string, number> = {
        elementary: 5,
        middle: 8,
        high: 12,
        college: 16
      };
      const targetGrade = gradeMap[readingLevel];

      // Get language setting from localStorage
      const selectedLang = localStorage.getItem("plainspeak-language") || "en";
      // Only send target_lang if it's not English
      const targetLang = selectedLang !== "en" ? selectedLang : undefined;

      const result = await apiService.simplifyText(inputText, targetGrade, targetLang);
      
      // Use translated text if available, otherwise use simplified text
      const displayText = result.translated_text || result.simplified_text;
      
      setSimplifiedText(displayText);
      toast.success("Text simplified successfully");
    } catch (error) {
      toast.error("Failed to simplify text");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSpeak = () => {
    if (!simplifiedText) return;
    
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(simplifiedText);
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  const handleCopy = async () => {
    if (!simplifiedText) return;
    
    await navigator.clipboard.writeText(simplifiedText);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmitSuggestion = () => {
    if (!suggestText.trim()) {
      toast.error("Please provide the text that's confusing");
      return;
    }
    
    toast.success("Thank you! We'll work on improving simplification for this type of text.");
    setSuggestText("");
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
          Back to Simplify
        </Button>

        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Report Confusing Text</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Found text that PlainSpeak didn't simplify well? Let us know!
          </p>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Confusing Text
              </label>
              <Textarea
                placeholder="Paste the text that was difficult to simplify..."
                value={suggestText}
                onChange={(e) => setSuggestText(e.target.value)}
                className="min-h-[150px]"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Additional Notes (Optional)
              </label>
              <Input
                placeholder="What made it confusing?"
                value={suggestNotes}
                onChange={(e) => setSuggestNotes(e.target.value)}
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
                Enter Complex Text
              </label>
              <Textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Paste or type complex text here..."
                className="min-h-[150px] resize-none"
              />
            </div>

            <Button
              onClick={handleSimplify}
              disabled={isLoading || !inputText.trim()}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Simplifying...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Simplify Text
                </>
              )}
            </Button>
          </div>
        </Card>
      </motion.div>

      {simplifiedText && (
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
                <div className="p-4 rounded-md bg-green-50 border border-green-200 min-h-[150px]">
                  <p className="text-sm leading-relaxed">{simplifiedText}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleSpeak}
                  className="flex-1"
                >
                  <Volume2 className="mr-2 h-4 w-4" />
                  {isSpeaking ? "Stop" : "Read Aloud"}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCopy}
                  className="flex-1"
                >
                  {copied ? (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="mr-2 h-4 w-4" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Suggest Feature */}
      <Card className="p-4 bg-green-50 border-green-200">
        <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
          <Send className="h-4 w-4 text-green-600" />
          Report Confusing Text
        </h3>
        <p className="text-sm text-muted-foreground mb-3">
          Did PlainSpeak struggle with something? Help us improve!
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
