import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Sparkles, Copy, Volume2, ArrowLeft, Send } from "lucide-react";
import { toast } from "sonner";

interface TopicExample {
  id: string;
  title: string;
  category: string;
  originalText: string;
  simplifiedText?: string;
  actions?: string[];
}

const topics: TopicExample[] = [
  {
    id: "apartment-lease",
    title: "Standard Apartment Lease Agreement",
    category: "Housing",
    originalText: "This Residential Lease Agreement is entered into on this date between the Landlord and Tenant(s) for the leasing of the residential property located at the specified address. The Tenant agrees to pay a monthly rent in the amount specified, due on the first day of each calendar month, with a grace period of five days. Late fees in the amount of $50 will be assessed for payments received after the grace period. The Tenant shall pay a security deposit equal to one month's rent, which will be held in accordance with state law and returned within thirty days of lease termination, less any deductions for damages beyond normal wear and tear. The Tenant is responsible for all utilities unless otherwise specified. Subletting is prohibited without prior written consent of the Landlord. The lease term shall be for twelve months, with automatic month-to-month renewal unless either party provides sixty days written notice of intent to terminate.",
    simplifiedText: "This is a rental agreement between you (the tenant) and your landlord. You pay rent on the 1st of each month. You have 5 days to pay before a $50 late fee is charged. You pay a security deposit equal to one month's rent. You'll get this back within 30 days after moving out, minus any damage costs. You pay for utilities. You cannot sublet without written permission. The lease lasts 12 months and then goes month-to-month unless someone gives 60 days notice to end it.",
    actions: ["Pay rent by the 1st of each month", "Give 60 days notice before moving out"]
  },
  {
    id: "insurance-eob",
    title: "Health Insurance Explanation of Benefits",
    category: "Healthcare",
    originalText: "This Explanation of Benefits (EOB) is not a bill. This statement shows how your health plan processed claims for services you received. The total amount charged by your provider was $2,847.00. Your plan's allowed amount for these services is $1,523.00, representing a provider discount of $1,324.00. Of the allowed amount, your plan paid $1,218.40 (80% after deductible). Your responsibility includes: $200.00 applied to your annual deductible, $104.60 coinsurance (20% of the allowed amount after deductible), for a total patient responsibility of $304.60. The provider has agreed to accept the allowed amount as payment in full and cannot bill you for the difference between the charged amount and allowed amount. Your remaining deductible for the year is $800.00 out of $1,000.00. If you have questions about this EOB, please call the member services number on your insurance card.",
    simplifiedText: "This is NOT a bill - it shows how your insurance handled your doctor visit. The doctor charged $2,847 but your insurance only allows $1,523 (you got a $1,324 discount). Insurance paid $1,218. You owe $305 total: $200 towards your yearly deductible and $105 as your 20% share. The doctor cannot charge you more than the $305. You still have $800 left on your $1,000 yearly deductible. Call your insurance if you have questions.",
    actions: ["You owe $304.60 to the provider", "$200 goes toward your deductible", "You have $800 remaining on your deductible"]
  },
  {
    id: "credit-card-terms",
    title: "Credit Card Terms and Conditions",
    category: "Finance",
    originalText: "Annual Percentage Rate (APR) for Purchases: 18.99% to 28.99% variable APR based on your creditworthiness. This APR will vary with the market based on the Prime Rate. APR for Balance Transfers: 0% introductory APR for the first 12 billing cycles following each qualifying balance transfer. After that, 18.99% to 28.99% variable APR. Balance Transfer Fee: Either $5 or 3% of the amount of each transfer, whichever is greater. APR for Cash Advances: 29.99% variable APR. Cash Advance Fee: Either $10 or 5% of the amount of each cash advance, whichever is greater. Penalty APR: Up to 29.99% variable APR. The Penalty APR may be applied to your account if you make a late payment or if a payment is returned. Grace Period: Your due date is at least 25 days after the close of each billing cycle. We will not charge you interest on purchases if you pay your entire balance by the due date each month. Annual Fee: None. Foreign Transaction Fee: 3% of each transaction in U.S. dollars.",
    simplifiedText: "Interest Rates: You'll pay 19% to 29% interest on purchases (based on your credit score). Balance transfers are 0% interest for the first year, then 19-29%. Cash advances cost 30% interest. Late payments can trigger a 30% penalty rate. Fees: Balance transfers cost $5 or 3% (whichever is higher). Cash advances cost $10 or 5% (whichever is higher). Foreign purchases cost an extra 3%. No yearly fee. You have 25 days to pay your full balance to avoid interest on purchases.",
    actions: ["Pay full balance within 25 days to avoid interest", "Balance transfers must be made within promotional period"]
  },
  {
    id: "miranda-rights",
    title: "Miranda Rights Explanation",
    category: "Legal Rights",
    originalText: "The Miranda warning, also known as being read your rights, is a warning that is required to be given by law enforcement in the United States to criminal suspects in police custody, or in a custodial interrogation, before they are interrogated, to inform them about their constitutional rights. These rights include the Fifth Amendment right against self-incrimination and the Sixth Amendment right to an attorney. The language used in a Miranda warning is derived from the 1966 U.S. Supreme Court case Miranda v. Arizona. The Miranda warning must include the right to remain silent, anything said can be used against them in court, the right to have an attorney present during questioning, and if they cannot afford an attorney, one will be appointed.",
    simplifiedText: "Miranda Rights are warnings police must give before questioning arrested people. They tell you about your constitutional rights. You have the right to stay quiet. Anything you say can be used against you in court. You can have a lawyer during questioning. If you can't pay for a lawyer, one will be provided for free.",
    actions: ["You have the right to remain silent", "Request a lawyer if questioned by police"]
  },
  {
    id: "employment-contract",
    title: "Employment Offer Letter",
    category: "Employment",
    originalText: "We are pleased to offer you the position of Marketing Coordinator with our company, effective November 1, 2025. Your starting salary will be $55,000 per annum, paid bi-weekly via direct deposit. You will be eligible for our comprehensive benefits package, including health insurance (with 80% employer contribution), dental and vision coverage, 401(k) retirement plan with 4% company match, and fifteen days of paid time off annually. Your employment is contingent upon successful completion of a background check and drug screening. This is an at-will employment arrangement, meaning either party may terminate the employment relationship at any time, with or without cause or notice. You will report directly to the Marketing Director and your primary responsibilities will include managing social media accounts, coordinating promotional campaigns, and conducting market research. Standard working hours are Monday through Friday, 9:00 AM to 5:00 PM, with occasional evening or weekend work as needed. Please sign and return this offer letter by October 30, 2025 to accept this position.",
    simplifiedText: "Congratulations! We're offering you the Marketing Coordinator job starting November 1, 2025. You'll earn $55,000 per year, paid every two weeks by direct deposit. Benefits include health insurance (we pay 80%), dental, vision, 401(k) with 4% company match, and 15 vacation days. You must pass a background check and drug test first. This is 'at-will' employment - either you or the company can end the job anytime for any reason. You'll work for the Marketing Director doing social media, promotions, and research. Hours are 9 AM to 5 PM, Monday-Friday, sometimes evenings/weekends. Sign and return by October 30 to accept.",
    actions: ["Sign and return offer letter by October 30, 2025", "Complete background check and drug screening"]
  },
  {
    id: "car-loan",
    title: "Auto Loan Agreement",
    category: "Finance",
    originalText: "This Motor Vehicle Retail Installment Contract is entered into between the Buyer and the Creditor for the purchase of the vehicle described herein. The total cash price of the vehicle is $28,500.00. The Buyer agrees to make a down payment of $3,500.00, resulting in an Amount Financed of $25,000.00. The Finance Charge (interest and fees) totals $4,127.89. The Total of Payments equals $29,127.89. The Annual Percentage Rate (APR) is 6.49%. The Buyer agrees to make 60 monthly payments of $485.46, with the first payment due on December 1, 2025. Payments are due on the first day of each month. A late fee of $25.00 will be charged if payment is received more than 10 days after the due date. The Creditor retains a security interest in the vehicle until all payments are made in full. Failure to make payments as agreed may result in repossession of the vehicle. The Buyer is required to maintain comprehensive and collision insurance coverage on the vehicle with the Creditor listed as lienholder.",
    simplifiedText: "You're buying a car for $28,500. You're putting $3,500 down and borrowing $25,000. With interest and fees, you'll pay back a total of $29,128. Your interest rate is 6.49% APR. You'll make 60 monthly payments of $485.46 (5 years). First payment is December 1, 2025, then the 1st of every month. Late fees are $25 if you pay more than 10 days late. The lender owns the car until you finish paying. If you miss payments, they can take the car back. You must have full car insurance with the lender listed.",
    actions: ["Make first payment of $485.46 on December 1, 2025", "Make insurance company list lender as lienholder", "Pay $485.46 by the 1st of each month for 60 months"]
  },
  {
    id: "medical-consent",
    title: "Medical Treatment Consent Form",
    category: "Healthcare",
    originalText: "I hereby voluntarily consent to the performance of medical treatment, including diagnostic procedures, surgical procedures, and the administration of anesthesia as deemed necessary by the attending physician and medical staff. I understand that the practice of medicine is not an exact science and I acknowledge that no guarantees have been made to me concerning the results of any procedure or treatment. I have been informed of the nature and purpose of the proposed treatment, the known risks and complications, alternative treatments available, and the risks of not receiving treatment. I understand that during the course of treatment, unforeseen conditions may arise which necessitate procedures different from or in addition to those contemplated. I authorize my physician and such associates or assistants as may be selected to perform such procedures as are deemed necessary and desirable in the exercise of professional judgment. I consent to the disposal of any tissue or body parts that may be removed. I understand that I have the right to refuse treatment and that my refusal could result in complications or worsen my condition. I acknowledge that I have had the opportunity to ask questions and all my questions have been answered to my satisfaction.",
    simplifiedText: "You're agreeing to let doctors treat you, including tests, surgery, and anesthesia if needed. You understand that medicine isn't perfect and doctors can't guarantee results. The doctor has explained what they'll do, the risks, other options, and what happens if you don't get treatment. If something unexpected happens during treatment, doctors can do other procedures they think are necessary. You agree they can remove and dispose of any tissue. You know you can refuse treatment, but this might cause problems or make you worse. You've had a chance to ask questions.",
    actions: ["Ask all questions before signing", "You can refuse treatment at any time"]
  },
  {
    id: "jury-duty",
    title: "Jury Duty Summons",
    category: "Civic Duty",
    originalText: "You are hereby summoned to appear for jury service at the Circuit Court located at 1200 N Telegraph Rd, Pontiac, MI 48341 on November 15, 2025 at 8:00 AM. You must report to Jury Assembly Room 201. Failure to appear as summoned may result in being held in contempt of court, punishable by fine, imprisonment, or both. You are required to serve for the duration of one trial or a maximum of two weeks, whichever comes first. You will receive $40 per day for each day of service after the first day, plus mileage reimbursement at the federal rate. Your employer is required by law to allow you time off for jury service, though they are not required to pay you. If you believe you have a valid reason for postponement or excusal, you must submit a written request with supporting documentation at least seven days prior to your report date. Valid reasons include: extreme financial hardship, medical condition preventing service, primary caregiver for someone who cannot be left alone, or prior jury service within the past 12 months. Active military personnel on deployment are automatically excused. For questions, call the Jury Commissioner at (248) 858-0344.",
    simplifiedText: "You must appear for jury duty on November 15, 2025 at 8:00 AM at the Pontiac Circuit Court, Room 201. If you don't show up, you can be fined or jailed. You'll serve for one trial or up to two weeks maximum. You get paid $40 per day (after the first day) plus gas money. Your job must let you go but doesn't have to pay you. To postpone or get excused, send a written request with proof at least 7 days early. Valid excuses: financial hardship, medical issues, caregiving, or recent jury service. Military on deployment are excused. Questions? Call (248) 858-0344.",
    actions: ["Appear at Circuit Court on November 15, 2025 at 8:00 AM", "Go to Jury Assembly Room 201", "Submit excuse request at least 7 days before if needed"]
  },
  {
    id: "fafsa",
    title: "FAFSA Application Guide",
    category: "Education",
    originalText: "The Free Application for Federal Student Aid (FAFSA) is a form completed by current and prospective college students in the United States to determine their eligibility for student financial aid. The FAFSA form is used to apply for federal student aid, such as Federal Pell Grants, student loans, and work-study programs. Many states and colleges also use information from the FAFSA to award their own financial aid. The form requests information about the student's and family's financial situation and must be completed annually. The FAFSA becomes available on October 1st each year for the following academic year. Students must submit all required documentation, including tax returns, W-2 forms, and records of untaxed income. Dependent students must also provide their parents' financial information. The Student Aid Index (SAI) is calculated based on the information provided and determines eligibility for need-based aid.",
    simplifiedText: "FAFSA is a free form students fill out to apply for college financial aid. It helps you get federal grants, loans, and work-study money. States and colleges also use it to give their own aid. You must complete it every year. The form opens October 1st for the next school year. You need tax returns, W-2 forms, and income records. If you're a dependent student, you also need your parents' financial info. Your answers determine how much aid you can get.",
    actions: ["Complete FAFSA annually starting October 1st", "Gather tax returns and W-2 forms before starting", "Dependent students must get parents' financial information"]
  },
  {
    id: "social-security",
    title: "Social Security Disability Benefits",
    category: "Government Benefits",
    originalText: "Social Security Disability Insurance (SSDI) is a payroll tax-funded federal insurance program of the United States government. It is managed by the Social Security Administration and designed to provide monthly benefits to people who have a medically determinable physical or mental impairment that prevents them from engaging in substantial gainful activity, and is expected to last at least 12 months or result in death. To qualify for SSDI benefits, applicants must have worked in jobs covered by Social Security and have a medical condition that meets Social Security's definition of disability. The amount of monthly benefits is based on the worker's lifetime average earnings covered by Social Security.",
    simplifiedText: "Social Security Disability Insurance (SSDI) pays monthly benefits to people who can't work due to disability. To qualify, you must have worked in jobs that pay Social Security taxes. Your disability must prevent you from working and last at least 12 months or result in death. Benefit amounts depend on how much you earned while working.",
    actions: ["Must have worked in Social Security covered jobs", "Disability must last at least 12 months", "Apply at your local Social Security office or online"]
  },
  {
    id: "rental-application",
    title: "Rental Application Terms",
    category: "Housing",
    originalText: "By submitting this rental application, you authorize the landlord or property manager to obtain a consumer credit report, verify employment and income, contact current and previous landlords, and conduct a criminal background check. There is a non-refundable application fee of $50 per adult applicant (18 years or older). If your application is approved, you must pay the first month's rent plus a security deposit equal to one and one-half month's rent within 48 hours of approval, or the unit may be offered to another qualified applicant. Monthly income must be at least three times the monthly rent. Incomplete applications will not be processed. Applications are processed in the order received. Processing typically takes 3-5 business days. Applicants must have no prior evictions, no felony convictions in the past seven years, and a credit score of at least 600. Previous landlord references must be verifiable and show no history of late payments or lease violations. Pet owners must pay an additional pet deposit of $300 per pet (non-refundable) and monthly pet rent of $25 per pet.",
    simplifiedText: "By applying, you let us check your credit, verify your job and income, call your old landlords, and run a background check. The $50 application fee per adult is not refundable. If approved, you have 48 hours to pay first month's rent plus 1.5 months security deposit, or we'll offer it to someone else. Your monthly income must be at least 3 times the rent. We process applications in order received (takes 3-5 days). You must have: no evictions, no felonies in 7 years, credit score of 600+, and good references. Pets cost $300 deposit (non-refundable) plus $25/month per pet.",
    actions: ["Pay $50 application fee per adult", "If approved, pay first month + 1.5 months deposit within 48 hours", "Ensure income is at least 3x monthly rent"]
  },
  {
    id: "power-of-attorney",
    title: "Durable Power of Attorney",
    category: "Legal",
    originalText: "This Durable Power of Attorney authorizes the named Agent to act on behalf of the Principal for all matters relating to financial, legal, and property transactions. This power of attorney shall not be affected by the subsequent disability or incapacity of the Principal. The Agent is granted full authority to: access all bank accounts and safe deposit boxes; buy, sell, mortgage, or lease real property; enter into contracts; file tax returns; manage retirement accounts and investments; pay bills and collect debts owed to the Principal; hire professional services including attorneys and accountants; and make gifts on behalf of the Principal not exceeding $15,000 per recipient per year. The Agent is required to keep accurate records of all transactions and act in the Principal's best interest at all times. The Agent is entitled to reasonable compensation for services rendered. This Power of Attorney shall remain in effect until the death of the Principal or until revoked in writing by the Principal. The Principal retains the right to revoke this Power of Attorney at any time, provided they are mentally competent.",
    simplifiedText: "This legal document lets your chosen Agent handle your money, property, and legal matters. It stays valid even if you become disabled or can't think clearly. Your Agent can: access your bank accounts; buy or sell property; sign contracts; file your taxes; manage investments; pay bills and collect money owed to you; hire lawyers or accountants; and give gifts up to $15,000 per person per year. Your Agent must keep good records and always act in your best interest. They can be paid for their work. This lasts until you die or cancel it in writing (if you're still mentally capable of doing so).",
    actions: ["Choose your Agent carefully - they'll have full financial control", "Agent must keep records of all transactions", "You can cancel this anytime if you're mentally competent"]
  },
  {
    id: "social-media-tos",
    title: "Social Media Terms of Service",
    category: "Terms of Service",
    originalText: "By accessing or using our Services, you agree to be bound by these Terms. If you disagree with any part of the terms, you may not access the Service. You retain all rights to any Content you submit, post, or display on or through the Service. By submitting Content, you grant us a worldwide, non-exclusive, royalty-free license (with the right to sublicense) to use, copy, reproduce, process, adapt, modify, publish, transmit, display and distribute such Content in any and all media or distribution methods now known or later developed. We reserve the right to remove any Content that violates these Terms or is otherwise objectionable in our sole discretion. You are responsible for safeguarding your password and you agree not to disclose your password to any third party. You agree that you will not use the Service for any illegal or unauthorized purpose nor may you, in the use of the Service, violate any laws. We reserve the right to terminate or suspend access to our Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms. We collect information you provide directly to us, information we obtain automatically when you use our Services, and information from third parties. We may share your information with third-party vendors, service providers, contractors, or agents who perform services for us or on our behalf.",
    simplifiedText: "By using our app/website, you agree to these rules. If you don't agree, don't use it. You own what you post, but you give us permission to use, share, and display your content anywhere in the world, forever. We can remove anything we don't like. Keep your password secret. Don't use our service for anything illegal. We can ban you anytime for breaking these rules. We collect your information (what you give us, how you use the app, and info from other companies). We share your info with companies that help run our service.",
    actions: ["Keep your password secure", "Don't post illegal content", "Your content can be used by the platform"]
  },
  {
    id: "app-store-tos",
    title: "Mobile App Store Terms of Service",
    category: "Terms of Service",
    originalText: "This End User License Agreement ('EULA') is a legal agreement between you and the Application Provider. The Application Provider grants you a revocable, non-exclusive, non-transferable, limited license to download, install and use the Application strictly in accordance with the terms of this Agreement. You may not: (a) copy, modify or distribute the Application; (b) reverse engineer or attempt to extract the source code of the Application; (c) rent, lease, lend, sell, redistribute or sublicense the Application; (d) remove, alter or obscure any proprietary notice on the Application. The Application Provider reserves the right to modify, suspend or discontinue the Application at any time without notice. You acknowledge that Apple has no obligation to furnish any maintenance and support services with respect to the Application. In the event of any failure of the Application to conform to any applicable warranty, you may notify Apple, and Apple will refund the purchase price for the Application; to the maximum extent permitted by law, Apple will have no other warranty obligation with respect to the Application. The Application Provider may collect and use technical data and related information to facilitate software updates, product support and other services. You consent to the transmission of this data.",
    simplifiedText: "This is the agreement between you and the app maker. You can download and use the app, but you can't: copy it, modify it, share it, reverse engineer it, rent it, or sell it. Don't remove any copyright notices. The app maker can change or stop the app anytime without warning. Apple (or your app store) doesn't have to provide support. If the app doesn't work, you can get a refund from the app store, but that's all they owe you. The app maker can collect technical data about how you use the app to improve it. By using the app, you agree to let them collect this data.",
    actions: ["You can only use the app - not copy, share, or modify it", "App can be discontinued without notice", "Your usage data will be collected"]
  },
  {
    id: "subscription-tos",
    title: "Software Subscription Terms",
    category: "Terms of Service",
    originalText: "Your subscription will automatically renew at the end of each subscription period unless you cancel before the renewal date. You authorize us to charge your chosen payment method for the applicable fees. Subscription fees are non-refundable except as required by law. We reserve the right to change subscription fees at any time; however, any fee changes will not affect your current subscription period. You will be notified of fee changes at least 30 days before they take effect. If you do not agree to the fee changes, you must cancel your subscription before the changes take effect. Upon cancellation, you will retain access to the Services through the end of your current billing period. No refunds will be provided for partial billing periods. Free trials are only available to new customers and may not be combined with other offers. We may require payment information to start a free trial, and we may charge you when the trial period ends unless you cancel before that date. You may cancel your subscription at any time through your account settings or by contacting customer support. Cancellations take effect at the end of the current billing period.",
    simplifiedText: "Your subscription automatically renews unless you cancel before it ends. We'll charge your credit card each renewal. No refunds, except where legally required. We can change prices, but will tell you 30 days before it affects you. If you don't like the new price, cancel before it takes effect. When you cancel, you keep access until your current billing period ends, but you won't get money back for unused time. Free trials are for new customers only. We might need your credit card for a free trial and will charge you when it ends unless you cancel. You can cancel anytime in settings or by contacting support. Cancellation takes effect at the end of your current billing period.",
    actions: ["Cancel before renewal date to avoid charges", "You must cancel free trial to avoid charges", "No refunds for partial months"]
  },
  {
    id: "privacy-policy",
    title: "Website Privacy Policy",
    category: "Terms of Service",
    originalText: "This Privacy Policy describes how we collect, use, and share your personal information. We collect information you provide to us directly, such as when you create an account, make a purchase, or communicate with us. This includes your name, email address, postal address, phone number, and payment information. We automatically collect certain information when you use our Services, including IP address, browser type, operating system, referring URLs, device identifiers, and usage information through cookies and similar technologies. We use this information to: provide and maintain our Services, process transactions, send you technical notices and support messages, communicate with you about products and services, monitor and analyze trends and usage, personalize content and features, detect and prevent fraud and abuse. We may share your information with: vendors and service providers who perform services on our behalf, in response to legal process or government requests, to protect our rights and safety, with your consent, or in connection with a merger or sale of our business. You have the right to access, correct, or delete your personal information. You may also opt out of receiving promotional communications. We use cookies and similar tracking technologies. You can control cookies through your browser settings. We retain your information for as long as necessary to fulfill the purposes described in this policy unless a longer retention period is required by law.",
    simplifiedText: "We collect info you give us (name, email, address, phone, payment details) and info we automatically get (IP address, browser, device type, how you use our site through cookies). We use this to: run the website, process orders, send you updates, personalize your experience, prevent fraud. We share your info with: companies that help run our service, law enforcement if required, buyers if we sell our business, or anyone you give us permission to share with. You can see, change, or delete your info. You can unsubscribe from emails. We use cookies - you can turn them off in your browser. We keep your info as long as needed or required by law.",
    actions: ["Review and manage your privacy settings", "You can request to see or delete your data", "Opt out of promotional emails anytime"]
  },
  {
    id: "cloud-storage-tos",
    title: "Cloud Storage Service Terms",
    category: "Terms of Service",
    originalText: "You are responsible for all activity that occurs under your account. You agree to notify us immediately of any unauthorized use of your account. You retain ownership of all content you upload to the Service. By uploading content, you grant us permission to store, backup, and share your content as necessary to provide the Service. We are not responsible for any loss or corruption of your content, and you are responsible for maintaining your own backup. We reserve the right to suspend or terminate accounts that exceed storage limits, violate our Acceptable Use Policy, or engage in abusive behavior. Violation of our Acceptable Use Policy includes, but is not limited to: uploading malware, distributing spam, violating intellectual property rights, or storing illegal content. We may access your files only to: provide technical support you request, ensure compliance with our policies, comply with legal obligations, or protect our systems and users. We employ industry-standard security measures to protect your data, but we cannot guarantee absolute security. You use the Service at your own risk. We limit our liability for any data loss, service interruptions, or security breaches to the amount you paid us in the 12 months prior to the incident. Our Service is provided 'as is' without warranties of any kind. We do not guarantee uptime or availability. Scheduled and emergency maintenance may result in service interruptions.",
    simplifiedText: "You're responsible for everything done with your account. Tell us immediately if someone uses it without permission. You own what you upload, but you give us permission to store and backup your files. We're not responsible if your files get lost or corrupted - keep your own backups. We can suspend accounts that use too much storage, break our rules, or are abusive. Don't upload: viruses, spam, pirated content, or illegal files. We only access your files to: help you with support, check you're following rules, comply with law, or protect our systems. We use standard security but can't guarantee perfect safety. If something goes wrong, we only owe you what you paid in the last year. No guarantees the service will always work. Maintenance will cause downtime.",
    actions: ["Keep your own backup of important files", "Report unauthorized account access immediately", "Don't upload illegal or pirated content"]
  }
];

export function TopicSources() {
  const [selectedTopic, setSelectedTopic] = useState<TopicExample | null>(null);
  const [showSimplified, setShowSimplified] = useState(false);
  const [showSuggest, setShowSuggest] = useState(false);
  const [suggestTopic, setSuggestTopic] = useState("");
  const [suggestText, setSuggestText] = useState("");

  const handleShowSimplified = () => {
    setShowSimplified(true);
    toast.success("Showing simplified version!");
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const handleSpeak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    speechSynthesis.speak(utterance);
    toast.success("Reading aloud...");
  };

  const handleSubmitSuggestion = () => {
    if (!suggestTopic.trim() || !suggestText.trim()) {
      toast.error("Please fill in both fields");
      return;
    }
    
    // In a real app, this would send to a backend
    toast.success("Thank you! Your suggestion has been submitted.");
    setSuggestTopic("");
    setSuggestText("");
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
          Back to Topics
        </Button>

        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Suggest a Topic</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Have a complex document or topic you'd like to see simplified? Let us know!
          </p>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Topic Title
              </label>
              <Input
                placeholder="e.g., 'Mortgage Application Process'"
                value={suggestTopic}
                onChange={(e) => setSuggestTopic(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Sample Text or Description
              </label>
              <Textarea
                placeholder="Paste a sample of the complex text or describe what you'd like to see simplified..."
                value={suggestText}
                onChange={(e) => setSuggestText(e.target.value)}
                className="min-h-[150px]"
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
        {!selectedTopic ? (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {/* Intro */}
            <Card className="p-4 bg-teal-50 border-teal-200">
              <div className="flex items-start gap-3">
                <BookOpen className="h-5 w-5 text-teal-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-sm mb-1">Practice with Real Examples</h3>
                  <p className="text-sm text-muted-foreground">
                    Select a complex text to see how PlainSpeak simplifies it
                  </p>
                </div>
              </div>
            </Card>

            {/* Topics Grid */}
            <div className="space-y-3">
              {topics.map((topic, index) => (
                <motion.div
                  key={topic.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card
                    className="p-4 cursor-pointer hover:shadow-md transition-all border-2 hover:border-primary"
                    onClick={() => {
                      setSelectedTopic(topic);
                      setShowSimplified(false);
                    }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <h3 className="font-semibold mb-1">{topic.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                          {topic.originalText.substring(0, 120)}...
                        </p>
                        <span className="text-xs bg-teal-100 text-teal-700 px-2 py-1 rounded">
                          {topic.category}
                        </span>
                      </div>
                      <BookOpen className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Suggest Topic */}
            <Card className="p-4 bg-green-50 border-green-200">
              <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                <Send className="h-4 w-4 text-green-600" />
                Suggest a Topic
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                Have a complex document you'd like to see simplified?
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
              onClick={() => {
                setSelectedTopic(null);
                setShowSimplified(false);
              }}
              className="mb-2"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Topics
            </Button>

            {/* Topic Header */}
            <Card className="p-4 bg-teal-50 border-teal-200">
              <h2 className="font-bold text-lg mb-1">{selectedTopic.title}</h2>
              <span className="text-xs bg-teal-600 text-white px-2 py-1 rounded">
                {selectedTopic.category}
              </span>
            </Card>

            {/* Original Text */}
            <Card className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">Original Text</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopy(selectedTopic.originalText)}
                >
                  <Copy className="h-3 w-3 mr-1" />
                  Copy
                </Button>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {selectedTopic.originalText}
              </p>
            </Card>

            {/* Simplify Button */}
            {!showSimplified && (
              <Button
                onClick={handleShowSimplified}
                className="w-full"
                size="lg"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Show Simplified Version
              </Button>
            )}

            {/* Simplified Text */}
            {showSimplified && selectedTopic.simplifiedText && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <Card className="p-4 bg-green-50 border-green-200">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-green-800">Simplified Text</h3>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSpeak(selectedTopic.simplifiedText || "")}
                      >
                        <Volume2 className="h-3 w-3 mr-1" />
                        Read
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopy(selectedTopic.simplifiedText || "")}
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        Copy
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed">
                    {selectedTopic.simplifiedText}
                  </p>
                </Card>

                {/* Try Another */}
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedTopic(null);
                    setShowSimplified(false);
                  }}
                  className="w-full"
                >
                  Try Another Example
                </Button>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
