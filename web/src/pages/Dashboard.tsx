import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Image, History, BookOpen, MapPin, Settings, ArrowLeft, Menu } from "lucide-react";
import { SimplifyForm } from "@/components/SimplifyForm";
import { AnalyzeImage } from "@/components/AnalyzeImage";
import { HistoryList } from "@/components/HistoryList";
import { SettingsPanel } from "@/components/SettingsPanel";
import { ItemsToBring } from "@/components/ItemsToBring";
import { TopicSources } from "@/components/TopicSources";

type Section = "home" | "simplify" | "analyze" | "history" | "settings" | "items" | "sources";

export default function Dashboard() {
  const [activeSection, setActiveSection] = useState<Section>("home");

  const menuItems = [
    { id: "simplify" as Section, icon: FileText, label: "Simplify Text", color: "bg-blue-500" },
    { id: "analyze" as Section, icon: Image, label: "Analyze Image", color: "bg-purple-500" },
    { id: "items" as Section, icon: MapPin, label: "Document Checklists", color: "bg-orange-500" },
    { id: "sources" as Section, icon: BookOpen, label: "Topic Sources", color: "bg-teal-500" },
    { id: "history" as Section, icon: History, label: "History", color: "bg-green-500" },
    { id: "settings" as Section, icon: Settings, label: "Settings", color: "bg-gray-500" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <AnimatePresence mode="wait">
        {activeSection === "home" ? (
          <motion.div
            key="home"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen flex flex-col"
          >
            {/* Header */}
            <header className="border-b bg-card">
              <div className="container mx-auto px-4 py-4 max-w-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative h-8 w-8">
                      <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-blue-500 via-purple-500 to-teal-500 opacity-80"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M4 6h16M4 12h12M4 18h8" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
                        </svg>
                      </div>
                    </div>
                    <h1 className="text-xl font-bold tracking-tight">plainspeak</h1>
                  </div>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </header>

            {/* Hero Section */}
            <div className="container mx-auto px-4 py-8 max-w-md">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center mb-8"
              >
                <h2 className="text-3xl font-bold tracking-tight mb-2">
                  Welcome Back
                </h2>
                <p className="text-muted-foreground">
                  What would you like to do today?
                </p>
              </motion.div>

              {/* Menu Grid */}
              <div className="grid grid-cols-2 gap-4">
                {menuItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Card
                      className="p-6 cursor-pointer hover:shadow-lg transition-all border-2 hover:border-primary"
                      onClick={() => setActiveSection(item.id)}
                    >
                      <div className="flex flex-col items-center gap-3 text-center">
                        <div className={`${item.color} p-4 rounded-2xl`}>
                          <item.icon className="h-6 w-6 text-white" />
                        </div>
                        <span className="font-medium text-sm">{item.label}</span>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="min-h-screen"
          >
            {/* Section Header */}
            <header className="border-b bg-card sticky top-0 z-10">
              <div className="container mx-auto px-4 py-4 max-w-md">
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setActiveSection("home")}
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                  <h1 className="text-xl font-bold tracking-tight">
                    {menuItems.find(item => item.id === activeSection)?.label}
                  </h1>
                </div>
              </div>
            </header>

            {/* Section Content */}
            <div className="container mx-auto px-4 py-6 max-w-md">
              {activeSection === "simplify" && <SimplifyForm />}
              {activeSection === "analyze" && <AnalyzeImage />}
              {activeSection === "items" && <ItemsToBring />}
              {activeSection === "sources" && <TopicSources />}
              {activeSection === "history" && <HistoryList />}
              {activeSection === "settings" && <SettingsPanel />}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
