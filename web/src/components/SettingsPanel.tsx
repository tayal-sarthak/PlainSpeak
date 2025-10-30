import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Settings as SettingsIcon, Globe, BookOpen, Check } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

const languages = [
  { code: "en", name: "English" },
  { code: "es", name: "Spanish (Español)" },
  { code: "fr", name: "French (Français)" },
  { code: "de", name: "German (Deutsch)" },
  { code: "zh", name: "Chinese (中文)" },
  { code: "ar", name: "Arabic (العربية)" },
  { code: "hi", name: "Hindi (हिन्दी)" },
  { code: "pt", name: "Portuguese (Português)" },
];

const readingLevels = [
  { level: "elementary", grade: "3-5", label: "Elementary School" },
  { level: "middle", grade: "6-8", label: "Middle School" },
  { level: "high", grade: "9-12", label: "High School" },
  { level: "college", grade: "13+", label: "College Level" },
];

export function SettingsPanel() {
  const [selectedLanguage, setSelectedLanguage] = useState(() => {
    return localStorage.getItem("plainspeak-language") || "en";
  });
  const [selectedLevel, setSelectedLevel] = useState(() => {
    return localStorage.getItem("plainspeak-reading-level") || "middle";
  });

  useEffect(() => {
    localStorage.setItem("plainspeak-language", selectedLanguage);
  }, [selectedLanguage]);

  useEffect(() => {
    localStorage.setItem("plainspeak-reading-level", selectedLevel);
  }, [selectedLevel]);

  const handleLanguageChange = (code: string) => {
    setSelectedLanguage(code);
    const langName = languages.find(l => l.code === code)?.name;
    toast.success(`Language changed to ${langName}`);
  };

  const handleLevelChange = (level: string) => {
    setSelectedLevel(level);
    const levelName = readingLevels.find(l => l.level === level)?.label;
    toast.success(`Reading level set to ${levelName}`);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="p-6 bg-gray-50">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <SettingsIcon className="h-5 w-5" />
            <h3 className="font-semibold">Settings</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Configure your PlainSpeak preferences
          </p>
        </div>
      </Card>

      {/* Language Selection */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-3">
            <Globe className="h-5 w-5 text-blue-600" />
            <h4 className="font-medium">Translation Language</h4>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Select the language for translated text
          </p>
          <div className="grid grid-cols-1 gap-2">
            {languages.map((lang) => (
              <motion.button
                key={lang.code}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleLanguageChange(lang.code)}
                className={`p-3 rounded-lg border-2 transition-all text-left flex items-center justify-between ${
                  selectedLanguage === lang.code
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <span className="text-sm font-medium">{lang.name}</span>
                {selectedLanguage === lang.code && (
                  <Check className="h-4 w-4 text-blue-600" />
                )}
              </motion.button>
            ))}
          </div>
        </div>
      </Card>

      {/* Reading Level */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="h-5 w-5 text-green-600" />
            <h4 className="font-medium">Target Reading Level</h4>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Simplify text to this grade level
          </p>
          <div className="grid grid-cols-1 gap-2">
            {readingLevels.map((level) => (
              <motion.button
                key={level.level}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleLevelChange(level.level)}
                className={`p-3 rounded-lg border-2 transition-all text-left flex items-center justify-between ${
                  selectedLevel === level.level
                    ? "border-green-500 bg-green-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div>
                  <div className="text-sm font-medium">{level.label}</div>
                  <div className="text-xs text-muted-foreground">Grade {level.grade}</div>
                </div>
                {selectedLevel === level.level && (
                  <Check className="h-4 w-4 text-green-600" />
                )}
              </motion.button>
            ))}
          </div>
        </div>
      </Card>

      {/* About */}
      <Card className="p-6">
        <div className="space-y-3">
          <h4 className="font-medium">About PlainSpeak</h4>
          <p className="text-sm text-muted-foreground">
            Version 1.0.0
          </p>
          <p className="text-sm text-muted-foreground">
            Making information accessible to everyone through AI-powered text simplification.
          </p>
          <p className="text-xs text-muted-foreground mt-4">
            Congressional App Challenge 2024
          </p>
        </div>
      </Card>
    </div>
  );
}
