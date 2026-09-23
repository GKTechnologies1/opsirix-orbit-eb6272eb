// Nexus service catalog, version 1. Source: Opsirix Nexus Prompt 2.
// Service IDs are permanent. Rename labels freely; never reuse or change an ID.
// This file seeds the database catalog. The database is the source of truth at runtime.

export type PartnerTypeId = "attorney" | "cpa" | "it_services";

export type CatalogService = {
  id: string;
  label: string;
  description: string;
  aliases: string[];
  /** Kind of qualification a reviewer should check privately. Never verified automatically. */
  qualification?: string;
};

export type CatalogCategory = {
  id: string;
  label: string;
  /** Less prominent groups are collapsed in the default business-focused view. */
  prominent: boolean;
  services: CatalogService[];
};

export type CatalogPartnerType = { id: PartnerTypeId; label: string; categories: CatalogCategory[] };

export const CATALOG_VERSION = 1;

const LAW = "Licensed attorney";
const s = (id: string, label: string, description: string, aliases: string[] = [], qualification?: string): CatalogService => ({ id, label, description, aliases, qualification });
const law = (id: string, label: string, description: string, aliases: string[] = []) => s(`law-${id}`, label, description, aliases, LAW);

export const SERVICE_CATALOG: CatalogPartnerType[] = [
  {
    id: "attorney",
    label: "Attorney / law firm",
    categories: [
      { id: "law-formation-governance", label: "Business formation & governance", prominent: true, services: [
        law("entity-formation", "Entity formation", "Forming LLCs, corporations, and partnerships and filing the required documents.", ["starting a company", "start a business", "form an llc", "incorporate", "register my business"]),
        law("operating-agreements-bylaws", "Operating agreements and bylaws", "Drafting the rules for how an LLC or corporation is owned and run.", ["llc agreement", "bylaws", "ownership rules"]),
        law("founder-agreements", "Founder agreements", "Agreements between co-founders on equity, roles, vesting, and exits.", ["co-founder agreement", "founder equity", "vesting"]),
        law("corporate-governance", "Corporate governance", "Board matters, resolutions, shareholder meetings, and ongoing corporate compliance.", ["board of directors", "shareholder meeting", "minutes"]),
        law("nonprofit-formation", "Nonprofit formation", "Forming nonprofit organizations and preparing tax-exemption applications.", ["501c3", "charity", "tax exempt"]),
        law("franchise-counsel", "Franchise legal counsel", "Advising franchisors and franchisees on disclosure documents and franchise agreements.", ["franchise", "fdd", "buy a franchise"]),
      ] },
      { id: "law-contracts-commercial", label: "Contracts & commercial transactions", prominent: true, services: [
        law("contract-drafting-review", "Contract drafting and review", "Writing new contracts and reviewing agreements before you sign.", ["review a contract", "contract lawyer", "check an agreement"]),
        law("vendor-customer-agreements", "Vendor and customer agreements", "Terms of service, master service agreements, and supplier contracts.", ["terms and conditions", "msa", "supplier contract"]),
        law("saas-software-licensing", "SaaS and software licensing", "Subscription terms, software licenses, and end-user agreements.", ["software license", "saas terms", "eula"]),
        law("partnership-jv-agreements", "Partnership and joint venture agreements", "Agreements for businesses working together on shared projects or ventures.", ["joint venture", "business partnership"]),
        law("purchase-sale-agreements", "Purchase and sale agreements", "Agreements for buying or selling goods, assets, or property.", ["purchase agreement", "sales contract"]),
        law("commercial-negotiations", "Commercial negotiations", "Representing a business in negotiating commercial deals and terms.", ["negotiate a deal", "deal negotiation"]),
      ] },
      { id: "law-ma-finance", label: "Mergers, acquisitions & finance", prominent: true, services: [
        law("acquisitions-sales", "Business acquisitions and sales", "Legal support for buying or selling a business.", ["buy a business", "sell my business", "m&a"]),
        law("due-diligence", "Due diligence", "Reviewing legal records and risks before a transaction closes.", ["legal due diligence", "deal review"]),
        law("asset-stock-purchase", "Asset and stock purchase documents", "Drafting and negotiating asset purchase and stock purchase agreements.", ["apa", "spa", "stock purchase"]),
        law("investment-financing", "Investment and financing agreements", "SAFEs, convertible notes, priced rounds, and loan documents.", ["raise money", "investors", "safe note", "convertible note", "fundraising"]),
        law("succession-transactions", "Succession transactions", "Transferring ownership to family, managers, or employees.", ["exit planning", "pass on the business", "buyout"]),
      ] },
      { id: "law-employment", label: "Employment & workplace", prominent: true, services: [
        law("employment-agreements", "Employment agreements", "Offer letters, employment contracts, and restrictive covenants.", ["offer letter", "non-compete", "hire employees"]),
        law("policies-handbooks", "Policies and handbooks", "Employee handbooks and workplace policies.", ["employee handbook", "hr policies"]),
        law("contractor-classification", "Independent contractor classification", "Advising whether workers should be classified as contractors or employees.", ["1099 or w2", "misclassification", "freelancer"]),
        law("workplace-disputes", "Workplace disputes", "Advising on complaints, investigations, and terminations before litigation.", ["fire an employee", "hr dispute", "harassment complaint"]),
        law("employee-benefits", "Employee benefits counsel", "Legal advice on retirement, health, and equity benefit plans.", ["erisa", "401k plan", "stock options"]),
      ] },
      { id: "law-ip-technology", label: "Intellectual property & technology", prominent: true, services: [
        law("trademarks", "Trademarks", "Searching, registering, and protecting brand names and logos.", ["protect my brand", "register a trademark", "logo protection"]),
        law("copyright", "Copyright", "Registering and enforcing rights in creative work and software code.", ["copyright registration"]),
        law("patents", "Patents", "Patent searches, applications, and prosecution. Patent practice requires registration with the patent office.", ["patent my invention", "patent application"]),
        law("trade-secrets", "Trade secrets", "Protecting confidential business information, including NDAs.", ["nda", "confidentiality agreement"]),
        law("technology-transactions", "Technology transactions", "Development agreements, technology licensing, and IP transfers.", ["software development contract", "ip assignment"]),
        law("privacy-data-protection", "Privacy and data protection", "Privacy policies and compliance with data protection laws.", ["privacy policy", "gdpr", "ccpa", "data privacy"]),
        law("cybersecurity-incident", "Cybersecurity incident counsel", "Legal response to data breaches, including notification duties.", ["data breach", "hacked", "breach notification"]),
        law("ai-governance", "AI governance counsel", "Legal advice on AI use policies, risk, and emerging AI regulation.", ["ai policy", "ai regulation"]),
      ] },
      { id: "law-immigration", label: "Immigration", prominent: true, services: [
        law("business-immigration", "Business immigration", "Immigration strategy for founders, investors, and companies.", ["investor visa", "founder visa", "e-2", "l-1"]),
        law("employment-visas", "Employment visas", "Work visa petitions such as H-1B, O-1, and TN.", ["h1b", "o1", "work visa", "sponsor an employee"]),
        law("family-immigration", "Family immigration", "Family-based petitions for relatives.", ["spouse visa", "family petition"]),
        law("permanent-residence", "Permanent residence", "Green card applications through employment, family, or investment.", ["green card", "eb-5", "eb-2"]),
        law("work-authorization-compliance", "Compliance and work authorization matters", "I-9 compliance, work authorization, and immigration audits.", ["i-9", "work permit", "ead"]),
      ] },
      { id: "law-tax-property-regulated", label: "Tax, property & regulated industries", prominent: true, services: [
        law("tax-controversy", "Tax controversy", "Legal representation in tax audits, appeals, and disputes.", ["irs dispute", "tax audit lawyer"]),
        law("commercial-real-estate", "Commercial real estate", "Buying, selling, and financing commercial property.", ["buy commercial property", "real estate lawyer"]),
        law("leasing", "Leasing", "Reviewing and negotiating commercial leases.", ["office lease", "retail lease", "rent a space"]),
        law("construction", "Construction", "Construction contracts, liens, and project disputes.", ["contractor agreement", "mechanics lien"]),
        law("licensing-regulatory", "Licensing and regulatory compliance", "Business licenses, permits, and industry regulatory requirements.", ["business license", "permits", "regulations"]),
        law("hospitality-retail-regulatory", "Hospitality and retail regulatory matters", "Liquor licensing, food service, and retail compliance.", ["liquor license", "restaurant license"]),
      ] },
      { id: "law-disputes", label: "Disputes & resolution", prominent: true, services: [
        law("commercial-litigation", "Commercial litigation", "Representing businesses in lawsuits over contracts and commercial matters.", ["sue a company", "business lawsuit", "being sued"]),
        law("arbitration-mediation", "Arbitration and mediation", "Resolving disputes outside court.", ["mediation", "arbitration"]),
        law("collections", "Collections", "Recovering unpaid invoices and judgments.", ["unpaid invoice", "debt collection", "client won't pay"]),
        law("employment-litigation", "Employment litigation", "Representation in employment lawsuits and agency claims.", ["wrongful termination", "eeoc"]),
      ] },
      { id: "law-individuals-families", label: "Individuals & families", prominent: false, services: [
        law("estate-planning", "Estate planning", "Wills, trusts, and powers of attorney.", ["will", "trust", "power of attorney"]),
        law("probate", "Probate", "Administering an estate after someone passes away.", ["estate administration"]),
        law("family-law", "Family law", "Divorce, custody, and related family matters.", ["divorce", "custody"]),
        law("personal-injury", "Personal injury", "Representation for people injured through another party's negligence.", ["accident lawyer", "injury claim"]),
        law("criminal-defense", "Criminal defense", "Defending people charged with criminal offenses.", ["criminal lawyer", "dui"]),
      ] },
    ],
  },
  {
    id: "cpa",
    label: "CPA / accounting firm",
    categories: [
      { id: "cpa-tax", label: "Tax", prominent: true, services: [
        s("cpa-individual-tax-prep", "Individual tax preparation", "Preparing and filing personal income tax returns.", ["personal taxes", "file my taxes", "1040"]),
        s("cpa-business-tax-prep", "Business tax preparation", "Preparing and filing business income tax returns.", ["business taxes", "corporate tax return", "1120", "1065"]),
        s("cpa-tax-planning", "Tax planning", "Planning ahead to manage tax liability legally.", ["reduce taxes", "save on taxes", "tax strategy"]),
        s("cpa-multistate-tax", "Multistate tax", "Tax filings and nexus questions for businesses in more than one state.", ["nexus", "state taxes"]),
        s("cpa-sales-use-tax", "Sales and use tax", "Sales tax registration, filings, and exposure reviews.", ["sales tax", "collect sales tax"]),
        s("cpa-payroll-tax", "Payroll tax", "Payroll tax filings and resolving payroll tax issues.", ["941", "payroll tax problem"]),
        s("cpa-international-tax", "International tax", "Cross-border tax filings for businesses and individuals.", ["foreign income", "fbar", "expat taxes"]),
        s("cpa-tax-notice-controversy", "Tax notice and controversy support", "Responding to tax notices and representing clients before tax authorities.", ["irs letter", "tax notice", "audit help"], "Representation rights before tax authorities"),
        s("cpa-tax-credits-incentives", "Tax credit and incentive advisory", "Identifying and claiming credits such as R&D and employment credits.", ["r&d credit", "tax credits"]),
      ] },
      { id: "cpa-bookkeeping-accounting", label: "Bookkeeping & accounting", prominent: true, services: [
        s("cpa-monthly-bookkeeping", "Monthly bookkeeping", "Recording transactions and keeping the books current each month.", ["fix my books", "bookkeeper", "catch up bookkeeping"]),
        s("cpa-reconciliations", "Reconciliations", "Matching accounts to bank, card, and loan statements.", ["bank reconciliation"]),
        s("cpa-ap-ar", "Accounts payable and receivable", "Managing bills to pay and invoices to collect.", ["pay bills", "invoicing", "ap ar"]),
        s("cpa-month-end-close", "Month-end close", "Closing the books accurately and on schedule each month.", ["close the books"]),
        s("cpa-financial-statements", "Financial statement preparation", "Preparing balance sheets, income statements, and cash-flow statements.", ["p&l", "balance sheet", "financials"]),
        s("cpa-system-cleanup", "Accounting system cleanup", "Correcting and reorganizing messy accounting records.", ["fix my books", "clean up quickbooks", "messy books"]),
        s("cpa-inventory-cost", "Inventory and cost accounting", "Tracking inventory values and product or job costs.", ["cost of goods sold", "cogs", "job costing"]),
      ] },
      { id: "cpa-payroll-operations", label: "Payroll & operations", prominent: true, services: [
        s("cpa-payroll-processing", "Payroll processing", "Running payroll and issuing pay to employees.", ["run payroll", "pay employees"]),
        s("cpa-payroll-setup", "Payroll setup and compliance support", "Setting up payroll systems and staying current with payroll requirements.", ["set up payroll", "first employee"]),
        s("cpa-1099-reporting", "1099 reporting", "Collecting contractor information and filing 1099 forms.", ["1099", "contractor forms", "w-9"]),
        s("cpa-expense-processes", "Employee expense processes", "Designing reimbursement and expense-tracking processes.", ["expense reports", "reimbursements"]),
      ] },
      { id: "cpa-audit-assurance", label: "Audit, assurance & attest", prominent: true, services: [
        s("cpa-financial-audit", "Financial statement audit", "Independent audit of financial statements. Requires a licensed CPA firm.", ["audit", "audited financials"], "Licensed CPA firm with attest authority"),
        s("cpa-review", "Review", "Limited assurance review of financial statements. Requires a licensed CPA firm.", ["review engagement", "reviewed financials"], "Licensed CPA firm with attest authority"),
        s("cpa-compilation", "Compilation", "Compiling financial statements without providing assurance.", ["compiled financials"], "Licensed CPA firm"),
        s("cpa-agreed-upon-procedures", "Agreed-upon procedures", "Performing specific procedures agreed with the client and reporting findings.", ["aup"], "Licensed CPA firm with attest authority"),
        s("cpa-other-attestation", "Other attestation", "Other attest engagements, such as SOC reports. Requires a licensed CPA firm.", ["soc 2", "soc report", "attestation"], "Licensed CPA firm with attest authority"),
      ] },
      { id: "cpa-business-advisory", label: "Business advisory", prominent: true, services: [
        s("cpa-cash-flow-planning", "Cash-flow planning", "Forecasting and managing cash coming in and going out.", ["cash flow", "running out of money"]),
        s("cpa-budgeting-forecasting", "Budgeting and forecasting", "Building budgets and financial projections.", ["budget", "financial projections", "forecast"]),
        s("cpa-outsourced-controller", "Outsourced controller", "Part-time controller oversight of accounting operations.", ["controller"]),
        s("cpa-fractional-cfo", "Fractional CFO", "Part-time senior finance leadership and strategy.", ["cfo", "part-time cfo", "finance lead"]),
        s("cpa-kpi-reporting", "KPI and reporting", "Designing management reports and key performance metrics.", ["kpis", "management reports", "dashboard"]),
        s("cpa-startup-setup", "Startup accounting setup", "Setting up accounting systems and processes for a new business.", ["starting a company", "new business accounting", "set up books"]),
        s("cpa-business-valuation", "Business valuation", "Estimating the value of a business. Some purposes require an accredited valuation professional.", ["value my business", "what is my business worth"], "Valuation credential, where required"),
        s("cpa-transaction-support", "Transaction and due-diligence support", "Financial due diligence and quality-of-earnings analysis for deals.", ["quality of earnings", "financial due diligence", "buy a business"]),
        s("cpa-succession-planning", "Succession planning", "Financial planning for ownership transition or exit.", ["exit planning", "retire from business"]),
      ] },
      { id: "cpa-systems-specialist", label: "Systems & specialist support", prominent: true, services: [
        s("cpa-accounting-software", "QuickBooks and accounting software implementation", "Selecting, setting up, and migrating accounting software.", ["quickbooks setup", "xero", "accounting software"]),
        s("cpa-erp-integration", "ERP accounting integration", "Connecting accounting with ERP and operational systems.", ["erp", "netsuite"]),
        s("cpa-nonprofit-accounting", "Nonprofit accounting", "Fund accounting and nonprofit reporting, including Form 990.", ["990", "fund accounting", "charity accounting"]),
        s("cpa-grant-reporting", "Grant reporting", "Tracking and reporting on grant funds.", ["grant compliance"]),
        s("cpa-industry-specific", "Industry-specific accounting", "Accounting for industries with specialized requirements, such as construction or healthcare.", ["construction accounting", "restaurant accounting"]),
        s("cpa-forensic-fraud", "Forensic accounting and fraud support", "Investigating financial records for fraud or disputes.", ["fraud investigation", "embezzlement"], "Forensic credential, where claimed"),
        s("cpa-personal-financial-planning", "Personal financial planning", "Personal planning for owners, such as retirement and cash management.", ["financial planner", "retirement planning"], "Advisory registration, where required"),
      ] },
    ],
  },
  {
    id: "it_services",
    label: "Custom software development / IT services firm",
    categories: [
      { id: "it-discovery-product", label: "Discovery & product", prominent: true, services: [
        s("it-requirements-discovery", "Requirements discovery", "Clarifying what needs to be built before development begins.", ["scope a project", "requirements", "build an app"]),
        s("it-product-strategy", "Product strategy", "Planning product direction, priorities, and roadmap.", ["product roadmap", "mvp planning"]),
        s("it-ux-research", "UX research", "Interviewing and testing with users to understand their needs.", ["user research", "usability testing"]),
        s("it-ui-ux-design", "UI/UX design", "Designing interfaces and user flows.", ["app design", "website design", "ux design"]),
        s("it-prototyping", "Prototyping", "Clickable or working prototypes to test ideas early.", ["prototype", "mockup", "proof of concept"]),
        s("it-technical-architecture", "Technical architecture", "Designing the structure and technology choices of a system.", ["system design", "tech stack"]),
      ] },
      { id: "it-application-development", label: "Application development", prominent: true, services: [
        s("it-business-web-apps", "Business web applications", "Custom web applications for business operations.", ["build an app", "web app", "custom software"]),
        s("it-customer-portals", "Customer portals", "Secure portals for customers to log in, view records, or manage accounts.", ["client portal", "customer login"]),
        s("it-mobile-apps", "Mobile apps", "iOS and Android applications.", ["build an app", "iphone app", "android app"]),
        s("it-ecommerce", "E-commerce", "Online stores and checkout experiences.", ["online store", "shopify", "sell online"]),
        s("it-saas-products", "SaaS products", "Building subscription software products.", ["saas", "software product", "build an app"]),
        s("it-internal-tools", "Internal tools and workflow automation", "Tools that streamline internal processes and remove manual work.", ["automate my business", "internal dashboard", "workflow"]),
        s("it-legacy-modernization", "Legacy modernization", "Updating or rebuilding outdated systems.", ["old software", "rewrite system", "modernize"]),
      ] },
      { id: "it-integration-data", label: "Integration & data", prominent: true, services: [
        s("it-api-development", "API development", "Designing and building APIs for other systems to connect.", ["api", "rest api"]),
        s("it-systems-integration", "Systems integration", "Connecting separate software systems so data moves between them.", ["connect my systems", "integrations"]),
        s("it-erp-crm-pos-integration", "ERP, CRM, and POS integration", "Integrating business platforms such as Salesforce, NetSuite, or point-of-sale systems.", ["salesforce", "crm integration", "pos integration"]),
        s("it-payment-integration", "Payment integration", "Adding card, bank, or subscription payments to software.", ["stripe", "accept payments", "payment gateway"]),
        s("it-data-pipelines", "Data pipelines", "Moving and transforming data between sources and destinations.", ["etl", "data warehouse"]),
        s("it-dashboards-bi", "Dashboards and business intelligence", "Reporting dashboards and analytics.", ["dashboard", "power bi", "reporting", "analytics"]),
        s("it-database-design", "Database design and migration", "Designing databases and moving data between systems.", ["database", "data migration"]),
      ] },
      { id: "it-cloud-operations", label: "Cloud & operations", prominent: true, services: [
        s("it-cloud-migration", "Cloud architecture and migration", "Designing cloud environments and moving systems into them.", ["aws", "azure", "google cloud", "move to cloud"]),
        s("it-devops-cicd", "DevOps and CI/CD", "Automated build, test, and release pipelines.", ["devops", "deployment pipeline"]),
        s("it-infrastructure-automation", "Infrastructure automation", "Managing infrastructure through code.", ["terraform", "infrastructure as code"]),
        s("it-hosting-deployment", "Hosting and deployment", "Hosting and releasing applications reliably.", ["hosting", "deploy my app"]),
        s("it-monitoring-observability", "Monitoring and observability", "Tracking system health, logs, and alerts.", ["monitoring", "alerts", "uptime"]),
        s("it-performance-reliability", "Performance and reliability engineering", "Making systems faster and more dependable.", ["slow website", "downtime", "scalability"]),
      ] },
      { id: "it-security-quality", label: "Security & quality", prominent: true, services: [
        s("it-secure-development", "Secure software development", "Building software with security practices throughout.", ["secure coding"]),
        s("it-appsec-review", "Application security review", "Reviewing code and design for security weaknesses.", ["security audit", "code review"]),
        s("it-penetration-testing", "Penetration testing", "Authorized testing that simulates attacks to find vulnerabilities. Requires written client authorization.", ["pen test", "pentest", "ethical hacking"], "Penetration testing qualifications and authorization process"),
        s("it-qa-test-automation", "QA and test automation", "Manual and automated software testing.", ["testing", "qa", "bug testing"]),
        s("it-accessibility", "Accessibility implementation", "Making software usable for people with disabilities, aligned to WCAG.", ["ada compliance", "wcag", "accessible website"]),
        s("it-backup-dr", "Backup and disaster recovery planning", "Protecting data and planning recovery after an outage.", ["backups", "disaster recovery"]),
      ] },
      { id: "it-ai-automation", label: "AI & automation", prominent: true, services: [
        s("it-ai-workflow", "AI workflow integration", "Adding AI to existing business processes.", ["use ai", "ai automation"]),
        s("it-private-ai", "Private or on-device AI solutions", "AI that runs on private infrastructure or devices.", ["private ai", "on-premise ai", "local llm"]),
        s("it-document-automation", "Document automation", "Automating document creation, extraction, and processing.", ["automate paperwork", "ocr"]),
        s("it-chatbots-agents", "Chatbot and agent implementation", "Building chat assistants and task-performing AI agents.", ["chatbot", "ai agent", "ai assistant"]),
        s("it-model-evaluation", "Model evaluation and governance", "Testing AI models for quality and risk, and setting controls.", ["ai testing", "ai governance"]),
      ] },
      { id: "it-connected-systems", label: "Connected systems", prominent: true, services: [
        s("it-iot-apps", "IoT applications", "Software for connected devices and sensors.", ["iot", "sensors", "smart devices"]),
        s("it-device-cloud", "Device and cloud integration", "Connecting hardware devices to cloud services.", ["device connectivity"]),
        s("it-retail-pos-tech", "Retail and POS technology", "Point-of-sale and in-store technology.", ["pos system", "retail technology"]),
        s("it-networking", "Networking and systems integration", "Office networks and integration of on-site systems.", ["office network", "wifi setup", "it setup"]),
      ] },
      { id: "it-ongoing-delivery", label: "Ongoing delivery", prominent: true, services: [
        s("it-maintenance", "Software maintenance", "Ongoing updates, fixes, and improvements for existing software.", ["maintain my app", "bug fixes"]),
        s("it-incident-support", "Incident support", "Responding when systems break or go down.", ["site is down", "emergency support"]),
        s("it-staff-augmentation", "Staff augmentation", "Adding developers or specialists to an existing team.", ["hire developers", "contract developers"]),
        s("it-training-docs", "Training and documentation", "Training teams and documenting systems.", ["documentation", "training"]),
        s("it-fractional-tech-leadership", "Fractional technical leadership", "Part-time CTO or technical lead.", ["fractional cto", "part-time cto", "tech lead"]),
      ] },
    ],
  },
];
