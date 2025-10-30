import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Phone, ChevronRight, Search, Building2, FileText, CreditCard, ArrowLeft, Send } from "lucide-react";
import { toast } from "sonner";

interface Purpose {
  id: string;
  name: string;
  items: string[];
  tips?: string[];
  source?: string;
}

interface Location {
  id: string;
  name: string;
  address: string;
  phone: string;
  type: string;
  purposes: Purpose[];
  source?: string;
}

const locations: Location[] = [
  {
    id: "novi-dmv",
    name: "Novi DMV",
    address: "43250 Grand River Ave, Novi, MI 48375",
    phone: "(248) 305-5605",
    type: "DMV",
    source: "https://www.michigan.gov/sos",
    purposes: [
      {
        id: "new-license",
        name: "Getting a New Driver's License",
        items: [
          "Proof of Identity (Passport, Birth Certificate, or State ID)",
          "Social Security Card",
          "Two Proofs of Michigan Residency (Utility bill dated within 90 days, Lease agreement, Bank statement)",
          "Completed Driver's License Application (RI-10)",
          "Payment: $25 (Cash, Check, or Card)",
          "Vision test (done on-site or bring results from eye doctor)"
        ],
        tips: [
          "If under 18, bring a parent/guardian",
          "Schedule appointment online to avoid wait",
          "Bring glasses/contacts if you need them for vision test"
        ],
        source: "https://www.michigan.gov/sos/registration-and-title/license-and-id/new-license"
      },
      {
        id: "renew-license",
        name: "Renewing Driver's License",
        items: [
          "Current Michigan Driver's License (even if expired)",
          "Payment: $18 for 4-year renewal (Cash, Check, or Card)",
          "Social Security Number",
          "Vision test (done on-site)"
        ],
        tips: [
          "Can renew up to 1 year before expiration",
          "May be eligible for online renewal if no address change"
        ],
        source: "https://www.michigan.gov/sos/registration-and-title/license-and-id/renew-license"
      },
      {
        id: "state-id",
        name: "Getting a State ID",
        items: [
          "Proof of Identity (Passport, Birth Certificate)",
          "Social Security Card",
          "Two Proofs of Michigan Residency",
          "Payment: $10 (Cash, Check, or Card)"
        ],
        source: "https://www.michigan.gov/sos/registration-and-title/license-and-id/state-id"
      },
      {
        id: "title-registration",
        name: "Vehicle Title & Registration",
        items: [
          "Current title or Manufacturer's Certificate of Origin",
          "Proof of Michigan No-Fault Insurance",
          "Valid Driver's License or State ID",
          "Payment for title ($15) and registration fees (varies by vehicle)",
          "Bill of sale (if purchased from private seller)"
        ],
        tips: [
          "Must register within 15 days of purchase or moving to Michigan",
          "Bring VIN number and odometer reading"
        ],
        source: "https://www.michigan.gov/sos/registration-and-title/vehicle-title"
      }
    ]
  },
  {
    id: "ann-arbor-dmv",
    name: "Ann Arbor Secretary of State",
    address: "2728 Plymouth Rd, Ann Arbor, MI 48105",
    phone: "(734) 205-4200",
    type: "DMV",
    source: "https://www.michigan.gov/sos",
    purposes: [
      {
        id: "new-license-aa",
        name: "Getting a New Driver's License",
        items: [
          "Proof of Identity (Passport, Birth Certificate, or State ID)",
          "Social Security Card or W-2",
          "Two Proofs of Residency in Michigan",
          "Completed Application",
          "Payment: $25"
        ],
        source: "https://www.michigan.gov/sos/registration-and-title/license-and-id/new-license"
      },
      {
        id: "license-plate",
        name: "Getting License Plates",
        items: [
          "Vehicle title",
          "Proof of Michigan Auto Insurance",
          "Driver's License",
          "Payment for plate and registration fees"
        ],
        source: "https://www.michigan.gov/sos/registration-and-title/license-plates"
      }
    ]
  },
  {
    id: "uscis-detroit",
    name: "USCIS Detroit Field Office",
    address: "11911 E Jefferson Ave, Detroit, MI 48214",
    phone: "(800) 375-5283",
    type: "Immigration",
    source: "https://www.uscis.gov/",
    purposes: [
      {
        id: "green-card-interview",
        name: "Green Card Interview",
        items: [
          "Appointment notice (printed)",
          "Valid Passport",
          "Form I-94 Arrival/Departure Record",
          "All USCIS receipts and correspondence",
          "Two passport-style photos (if requested)",
          "Birth Certificate (original + English translation if needed)",
          "Marriage Certificate (if applicable)",
          "Police certificates from all countries lived in",
          "Medical examination results (Form I-693 in sealed envelope)",
          "Financial documents (tax returns, employment letter, bank statements)"
        ],
        tips: [
          "Arrive 15 minutes early",
          "Bring originals AND copies of all documents",
          "No phones or electronics allowed inside"
        ],
        source: "https://www.uscis.gov/green-card/green-card-processes-and-procedures/green-card-interview"
      },
      {
        id: "citizenship-interview",
        name: "Citizenship/Naturalization Interview",
        items: [
          "Appointment notice",
          "Permanent Resident Card (Green Card)",
          "Valid Passport",
          "State ID or Driver's License",
          "All passports used in last 5 years",
          "Tax returns for last 5 years",
          "Marriage certificate and spouse's citizenship proof (if applicable)",
          "Divorce decrees (if applicable)",
          "Children's birth certificates"
        ],
        tips: [
          "Study the 100 civics questions",
          "Bring a translator if needed",
          "Dress professionally"
        ],
        source: "https://www.uscis.gov/citizenship/learn-about-citizenship/the-naturalization-interview-and-test"
      },
      {
        id: "work-permit",
        name: "Employment Authorization (EAD)",
        items: [
          "Appointment notice",
          "Form I-765 receipt",
          "Valid Passport and I-94",
          "Two passport photos",
          "Previous EAD card (if renewing)"
        ],
        source: "https://www.uscis.gov/working-in-the-united-states/employment-authorization-document"
      }
    ]
  },
  {
    id: "social-security",
    name: "Social Security Administration Office",
    address: "300 W Congress St, Detroit, MI 48226",
    phone: "(866) 964-4514",
    type: "Social Security",
    source: "https://www.ssa.gov/",
    purposes: [
      {
        id: "new-ss-card",
        name: "Getting a New Social Security Card",
        items: [
          "Proof of U.S. Citizenship (Birth Certificate, Passport)",
          "Proof of Identity (Driver's License, State ID, or Passport)",
          "Completed Application (Form SS-5)"
        ],
        tips: [
          "Service is FREE - never pay for SS card",
          "Cards arrive in mail within 10-14 days"
        ],
        source: "https://www.ssa.gov/number-card/request-number-card"
      },
      {
        id: "replacement-card",
        name: "Replacing Lost Social Security Card",
        items: [
          "Photo ID (Driver's License, State ID, Passport)",
          "Completed Application (Form SS-5)"
        ],
        tips: [
          "Limited to 3 replacement cards per year, 10 in lifetime"
        ],
        source: "https://www.ssa.gov/number-card/replace-card"
      },
      {
        id: "ssdi-application",
        name: "Applying for Disability Benefits (SSDI)",
        items: [
          "Photo ID",
          "Birth Certificate",
          "Social Security Card",
          "Medical records documenting disability",
          "List of all doctors, hospitals, and clinics visited",
          "Medications and dosages",
          "W-2 forms and tax returns for last 2 years",
          "Work history (job titles, duties, dates)",
          "Bank account information for direct deposit"
        ],
        tips: [
          "Apply as soon as you become disabled",
          "Can apply online at SSA.gov before visiting",
          "Approval can take 3-6 months"
        ],
        source: "https://www.ssa.gov/benefits/disability/"
      },
      {
        id: "retirement-benefits",
        name: "Applying for Retirement Benefits",
        items: [
          "Photo ID",
          "Birth Certificate",
          "Social Security Card",
          "W-2 forms or tax returns for last year",
          "Bank account information for direct deposit",
          "Marriage certificate (if married)",
          "Divorce papers (if applicable)"
        ],
        tips: [
          "Can apply online 4 months before you want benefits to start",
          "Full retirement age is 66-67 depending on birth year"
        ],
        source: "https://www.ssa.gov/benefits/retirement/"
      }
    ]
  }
];

export function ItemsToBring() {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [selectedPurpose, setSelectedPurpose] = useState<Purpose | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showSuggest, setShowSuggest] = useState(false);
  const [suggestOrg, setSuggestOrg] = useState("");
  const [suggestPurpose, setSuggestPurpose] = useState("");
  const [suggestDetails, setSuggestDetails] = useState("");

  const filteredLocations = locations.filter(loc =>
    loc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    loc.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    loc.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmitSuggestion = () => {
    if (!suggestOrg.trim() || !suggestPurpose.trim()) {
      toast.error("Please fill in organization and purpose");
      return;
    }
    
    toast.success("Thank you! Your suggestion has been submitted.");
    setSuggestOrg("");
    setSuggestPurpose("");
    setSuggestDetails("");
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
          Back to Locations
        </Button>

        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Suggest a Location</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Know a location we should add? Help others by suggesting it!
          </p>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Organization Name
              </label>
              <Input
                placeholder="e.g., 'Detroit Probate Court'"
                value={suggestOrg}
                onChange={(e) => setSuggestOrg(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                What are you going there for?
              </label>
              <Input
                placeholder="e.g., 'Filing for probate'"
                value={suggestPurpose}
                onChange={(e) => setSuggestPurpose(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Additional Details (Optional)
              </label>
              <Textarea
                placeholder="Address, phone, or items you know are needed..."
                value={suggestDetails}
                onChange={(e) => setSuggestDetails(e.target.value)}
                className="min-h-[100px]"
              />
            </div>

            <Button onClick={handleSubmitSuggestion} className="w-full">
              <Send className="h-4 w-4 mr-2" />
              Submit Suggestion
            </Button>
          </div>
        </Card>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      <AnimatePresence mode="wait">
        {!selectedLocation ? (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search locations or type (DMV, Immigration...)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Intro */}
            <Card className="p-4 bg-blue-50 border-blue-200">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-sm mb-1">Find What to Bring</h3>
                  <p className="text-sm text-muted-foreground">
                    Select a location to see what you need for different purposes
                  </p>
                </div>
              </div>
            </Card>

            {/* Locations List */}
            <div className="space-y-3">
              {filteredLocations.map((location, index) => (
                <motion.div
                  key={location.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card
                    className="p-4 cursor-pointer hover:shadow-md transition-all border-2 hover:border-primary"
                    onClick={() => setSelectedLocation(location)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          <h3 className="font-semibold">{location.name}</h3>
                        </div>
                        <p className="text-sm text-muted-foreground flex items-center gap-1 mb-1">
                          <MapPin className="h-3 w-3" />
                          {location.address}
                        </p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {location.phone}
                        </p>
                        <div className="mt-2">
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                            {location.type}
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Suggest Organization */}
            <Card className="p-4 bg-green-50 border-green-200">
              <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                <FileText className="h-4 w-4 text-green-600" />
                Suggest a Location
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                Don't see the location you need? Let us know!
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={() => setShowSuggest(true)}
              >
                Submit Suggestion
              </Button>
            </Card>
          </motion.div>
        ) : !selectedPurpose ? (
          <motion.div
            key="purposes"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            {/* Back Button */}
            <Button
              variant="ghost"
              onClick={() => setSelectedLocation(null)}
              className="mb-2"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Locations
            </Button>

            {/* Location Header */}
            <Card className="p-4 bg-blue-50 border-blue-200">
              <h2 className="font-bold text-lg mb-2">{selectedLocation.name}</h2>
              <p className="text-sm text-muted-foreground flex items-center gap-1 mb-1">
                <MapPin className="h-3 w-3" />
                {selectedLocation.address}
              </p>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Phone className="h-3 w-3" />
                {selectedLocation.phone}
              </p>
            </Card>

            {/* Purpose Selection */}
            <div>
              <h3 className="font-semibold mb-3">What are you going there for?</h3>
              <div className="space-y-3">
                {selectedLocation.purposes.map((purpose, index) => (
                  <motion.div
                    key={purpose.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card
                      className="p-4 cursor-pointer hover:shadow-md transition-all border-2 hover:border-primary"
                      onClick={() => setSelectedPurpose(purpose)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <CreditCard className="h-5 w-5 text-primary" />
                          <h4 className="font-medium">{purpose.name}</h4>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="detail"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            {/* Back Button */}
            <Button
              variant="ghost"
              onClick={() => setSelectedPurpose(null)}
              className="mb-2"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Purposes
            </Button>

            {/* Purpose Header */}
            <Card className="p-4 bg-blue-50 border-blue-200">
              <h2 className="font-bold text-lg mb-2">{selectedPurpose.name}</h2>
              <p className="text-sm text-muted-foreground">{selectedLocation.name}</p>
            </Card>

            {/* Items Checklist */}
            <Card className="p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Required Items Checklist
              </h3>
              <div className="space-y-2">
                {selectedPurpose.items.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="h-5 w-5 rounded border-2 border-primary mt-0.5 flex-shrink-0" />
                    <p className="text-sm">{item}</p>
                  </motion.div>
                ))}
              </div>
            </Card>

            {/* Tips */}
            {selectedPurpose.tips && selectedPurpose.tips.length > 0 && (
              <Card className="p-4 bg-yellow-50 border-yellow-200">
                <h3 className="font-semibold text-sm mb-2">Pro Tips</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {selectedPurpose.tips.map((tip, index) => (
                    <li key={index}>• {tip}</li>
                  ))}
                </ul>
              </Card>
            )}

            {/* Source */}
            {selectedPurpose.source && (
              <Card className="p-4 bg-blue-50 border-blue-200">
                <h3 className="font-semibold text-sm mb-2">Official Information</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  This checklist is based on requirements from:
                </p>
                <a 
                  href={selectedPurpose.source} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline font-medium inline-flex items-center gap-1"
                >
                  View official requirements →
                </a>
              </Card>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
