const Document = require('../models/Document');
const DocumentVersion = require('../models/DocumentVersion');
const Workspace = require('../models/Workspace');
const path = require('path');
const fs = require('fs');

// Rich content bodies — these become document.content, which the AI reads
const CONTENT = {
  'vendor-contract-techsupply': `VENDOR CONTRACT — TECHSUPPLY INC
Effective Date: January 15, 2025
Contract Number: VC-2025-0147

PARTIES
This Vendor Contract ("Agreement") is entered into between DocuMind Corp ("Client") and TechSupply Inc ("Vendor"), collectively referred to as the "Parties."

1. SCOPE OF SERVICES
The Vendor shall provide software infrastructure services including cloud storage provisioning, API gateway management, monitoring dashboards, and 24/7 technical support. Services commence on February 1, 2025 and continue for an initial term of twelve (12) months.

2. PAYMENT TERMS
The Client agrees to pay a monthly retainer of $14,500 USD due on the first business day of each calendar month. Late payments incur a 1.5% monthly interest charge. Annual contract value: $174,000 USD.

3. SERVICE LEVEL AGREEMENT (SLA)
Vendor guarantees 99.9% uptime for all production services. Scheduled maintenance windows must be communicated 72 hours in advance. Unplanned outages exceeding 4 hours trigger a service credit of 10% of the monthly fee.

4. INTELLECTUAL PROPERTY
All custom configurations, scripts, and integrations developed specifically for the Client remain the exclusive property of DocuMind Corp. Vendor retains ownership of proprietary platform components.

5. CONFIDENTIALITY
Both parties agree to maintain strict confidentiality of proprietary business information, technical specifications, and client data encountered during service delivery. This obligation survives contract termination for a period of 5 years.

6. TERMINATION
Either party may terminate this agreement with 30 days written notice. Immediate termination is permitted in the event of material breach. Upon termination, Vendor must deliver all Client data within 14 days.

7. LIABILITY AND INDEMNIFICATION
Vendor liability is capped at the total fees paid in the preceding 3 months. Client shall indemnify Vendor against claims arising from Client's misuse of the services.

8. DISPUTE RESOLUTION
Disputes shall be resolved through binding arbitration under the American Arbitration Association rules. Governing law: State of Delaware.

9. RENEWAL
This contract auto-renews for successive 12-month terms unless either party provides written notice of non-renewal at least 30 days before term expiration.

ACTION ITEMS:
- Obtain authorized signatures from both General Counsels by January 31, 2025
- File executed copy in the legal records management system
- Set renewal reminder for December 1, 2025
- Schedule quarterly service review meetings
- Distribute SLA section to IT operations team

KEY RISKS:
- Auto-renewal clause requires active calendar tracking to avoid unwanted commitment
- Vendor liability cap may be insufficient for large-scale data loss events
- Jurisdiction clause may complicate enforcement for international operations`,

  'service-agreement-cloudhost': `SERVICE AGREEMENT — CLOUDHOST PRO
Agreement Date: March 1, 2025
Reference: SA-2025-CHR-089

1. PARTIES
CloudHost Pro ("Provider") and DocuMind Corp ("Customer") agree to the terms of this Service Agreement for cloud infrastructure hosting.

2. SERVICES PROVIDED
Provider will deliver: dedicated server hosting (4x vCPU, 32GB RAM, 2TB NVMe storage), managed Kubernetes cluster (3 nodes), automated daily backups with 30-day retention, DDoS protection up to 10Gbps, SSL certificate management, and 24/7 NOC monitoring.

3. SERVICE LEVEL AGREEMENT
- Uptime guarantee: 99.95% monthly
- Incident response: P1 critical within 15 minutes, P2 high within 2 hours
- Planned maintenance: maximum 4 hours/month, scheduled during off-peak hours (2:00-6:00 AM EST)
- Data backup recovery time objective (RTO): 4 hours; recovery point objective (RPO): 24 hours

4. PRICING
Monthly hosting fee: $3,200 USD
Bandwidth overage: $0.08 per GB beyond 10TB included
Support tier: Premium (24/7 dedicated account manager)
Annual commitment discount: 15%

5. DATA SECURITY
All data encrypted at rest using AES-256. Data in transit secured via TLS 1.3. Provider complies with SOC 2 Type II certification. Annual penetration testing conducted by third-party firm.

6. BUSINESS CONTINUITY
Provider maintains geographically redundant data centers (US-East, US-West). Automatic failover within 90 seconds. Geographic replication enabled for all production workloads.

7. TERMINATION AND DATA EXPORT
30 days written notice required. Customer data provided in standard export format within 7 business days of contract end. Provider purges all Customer data within 60 days of termination.

RISKS:
- Bandwidth overage costs can escalate significantly during traffic spikes
- 90-second failover window may cause transaction loss in write-heavy workloads
- Data purge timeline creates gap in compliance record-keeping`,

  'nda-apex-partners': `MUTUAL NON-DISCLOSURE AGREEMENT
Parties: DocuMind Corp and Apex Partners LLC
Effective Date: February 20, 2025
Agreement Type: Bilateral / Mutual

WHEREAS, DocuMind Corp and Apex Partners LLC (individually a "Party" and collectively the "Parties") contemplate entering into a business relationship involving joint product development and technology integration, and each Party possesses certain confidential and proprietary information it is willing to disclose to the other Party solely for the purpose of evaluating such potential relationship.

1. DEFINITION OF CONFIDENTIAL INFORMATION
"Confidential Information" means any data or information, oral or written, that relates to either Party's business operations, financial information, technical data, trade secrets, engineering, product plans, software, customer lists, marketing strategies, and any other information marked as confidential or that a reasonable person would consider confidential given the circumstances of disclosure.

2. OBLIGATIONS OF RECEIVING PARTY
Each Party agrees to: (a) hold Confidential Information in strict confidence using at least the same degree of care used to protect its own confidential information; (b) not disclose Confidential Information to any third party without prior written consent; (c) use Confidential Information only for the Purpose stated herein; (d) notify the disclosing Party promptly of any unauthorized disclosure.

3. EXCLUSIONS
Confidentiality obligations do not apply to information that: (a) is or becomes publicly known through no breach of this Agreement; (b) was rightfully known before disclosure; (c) is independently developed without use of Confidential Information; (d) is required to be disclosed by law or court order.

4. TERM
This Agreement commences on the Effective Date and remains in effect for 3 years. Obligations regarding trade secrets survive indefinitely.

5. RETURN OF MATERIALS
Upon request or termination, each Party shall promptly return or certifiably destroy all Confidential Information received.

6. REMEDIES
Each Party acknowledges that breach may cause irreparable harm for which monetary damages are inadequate. Either Party may seek injunctive relief in addition to other remedies.

ACTION ITEMS:
- Obtain signatures from authorized representatives of both companies
- Distribute to legal and business development teams
- Register in contract management system with expiration alert
- Schedule annual review of confidentiality obligations`,

  'employee-nda-template': `EMPLOYEE NON-DISCLOSURE AND CONFIDENTIALITY AGREEMENT
Template Version: 2025.1
Applies to: All Full-Time and Part-Time Employees

This Employee Non-Disclosure Agreement ("Agreement") is entered into between DocuMind Corp ("Company") and the undersigned employee ("Employee").

1. CONFIDENTIAL INFORMATION
Employee acknowledges they will have access to highly sensitive business information including: source code and technical architecture, customer data and contact lists, financial projections and pricing models, product roadmaps and unreleased features, personnel information and compensation data, and business strategy documents.

2. EMPLOYEE OBLIGATIONS
During employment and for a period of 2 years after separation, Employee agrees to:
- Maintain absolute confidentiality of all Confidential Information
- Not use Confidential Information for personal benefit or third-party advantage
- Not copy, remove, or transmit Confidential Information without authorization
- Report any known or suspected breach to the Information Security team immediately

3. INTELLECTUAL PROPERTY ASSIGNMENT
All work product, inventions, improvements, and developments created during employment that relate to the Company's business are the exclusive property of DocuMind Corp. Employee irrevocably assigns all rights, title, and interest in such work product to the Company.

4. NON-SOLICITATION
For 12 months following separation, Employee agrees not to solicit Company employees, contractors, or clients for competitive purposes.

5. PERMITTED DISCLOSURES
Nothing in this Agreement prevents Employee from reporting legal violations to appropriate government authorities or exercising rights under applicable labor law.

6. ACKNOWLEDGMENT
Employee acknowledges receipt and understanding of this Agreement. Violation may result in immediate termination and legal action.`,

  'partnership-agreement-dataflow': `STRATEGIC PARTNERSHIP AGREEMENT — DATAFLOW LTD
Agreement Date: April 5, 2025
Agreement Number: PA-2025-DFL-003

PREAMBLE
This Strategic Partnership Agreement ("Agreement") establishes the terms of a long-term collaborative relationship between DocuMind Corp ("DocuMind") and DataFlow Ltd ("DataFlow") for joint product development, revenue sharing, and market expansion across the enterprise document management sector.

1. SCOPE OF PARTNERSHIP
The Parties agree to collaborate on: (a) joint development of AI-powered document processing APIs; (b) co-selling to enterprise customers in the EMEA region; (c) technology integration between DocuMind's document workspace and DataFlow's data pipeline platform; (d) shared go-to-market materials and customer success resources.

2. REVENUE SHARING
Net revenue from jointly sourced customers: 60% DocuMind / 40% DataFlow. Revenue from DataFlow-sourced leads converted by DocuMind: 70/30 split favoring DataFlow. Technology licensing fees from joint API: 50/50. Minimum annual revenue guarantee from DataFlow: $500,000 USD.

3. INTELLECTUAL PROPERTY
Joint IP developed under this Agreement is co-owned equally. Neither Party may license joint IP to direct competitors without written consent. Pre-existing IP remains the exclusive property of the originating Party.

4. GOVERNANCE
Joint Steering Committee meets quarterly. Decisions require majority vote with each Party having equal representation. Escalation path: working group → steering committee → executive sponsors.

5. EXCLUSIVITY
During the initial 24-month term, DataFlow agrees not to enter into partnership agreements with DocuMind's direct competitors (defined in Schedule A).

6. PERFORMANCE METRICS
Year 1 targets: 50 joint enterprise customers, $2M combined ARR, 2 integrated product features. Year 2 targets: 150 customers, $6M combined ARR, 5 integrated features.

7. TERM AND TERMINATION
Initial term: 3 years with automatic 1-year renewals. Either Party may terminate with 90 days notice after Year 1. Material breach requires 30-day cure period before termination is effective.

KEY RISKS:
- Revenue sharing disputes may arise from differing interpretations of customer source attribution
- Exclusivity clause limits DataFlow's ability to pursue adjacent market opportunities
- Joint IP ownership complicates future fundraising or acquisition scenarios for either party
- Performance targets are aggressive and may strain operational capacity

ACTION ITEMS:
- Finalize Schedule A (competitor definitions) within 30 days
- Establish joint bank account for revenue pool by Q2 2025
- Appoint steering committee members from both organizations
- Conduct IP audit to clearly delineate pre-existing vs. joint IP`,

  'remote-work-policy': `REMOTE WORK POLICY 2025
DocuMind Corp — Human Resources Department
Effective: January 1, 2025 | Next Review: January 1, 2026
Approved By: Executive Leadership Team

1. PURPOSE AND SCOPE
This policy establishes guidelines for remote and hybrid work arrangements at DocuMind Corp. It applies to all full-time employees, part-time employees, and contractors who work remotely on a regular or occasional basis.

2. ELIGIBILITY
Remote work eligibility requires: minimum 6 months of employment in good standing, demonstrated ability to work independently, role compatibility with remote work (assessed by manager), home office meeting minimum technical requirements, and manager approval with HR documentation.

3. APPROVED WORK LOCATIONS
Employees may work remotely from: primary home address (on file with HR), temporary locations within the United States for up to 30 days per year, international locations with prior approval (requires tax compliance review). Employees may NOT work from public locations without VPN connection.

4. EQUIPMENT AND TECHNOLOGY REQUIREMENTS
Company provides: laptop computer (MacBook Pro or equivalent), external monitor, ergonomic keyboard and mouse, noise-canceling headset, secure VPN access, collaboration tools (Slack, Zoom, DocuMind workspace). Employees are responsible for: reliable internet connection (minimum 50 Mbps), dedicated workspace, compliance with information security requirements.

5. AVAILABILITY AND COMMUNICATION
Core hours: 10:00 AM – 3:00 PM in employee's local time zone. Response time expectations: Slack messages within 2 hours during core hours, email within 4 hours, urgent issues via phone immediately. Employees must maintain calendar visibility and attend all scheduled meetings.

6. PERFORMANCE STANDARDS
Remote employees are evaluated on output and results, not hours logged. Managers conduct monthly one-on-ones to discuss productivity. Persistent performance issues result in return-to-office requirement. Annual remote work eligibility review in December.

7. SECURITY REQUIREMENTS
Mandatory: VPN for all company system access, screen lock when away from workstation, secure disposal of printed materials, annual security awareness training, no use of personal devices for company data without MDM enrollment.

8. EXPENSE REIMBURSEMENT
Monthly remote work stipend: $75 for internet and utilities. One-time home office setup allowance: $500 (with receipts). Travel to office for mandatory in-person events: fully reimbursed.

ACTION ITEMS:
- Complete home office security self-assessment by March 1, 2025
- Enroll personal devices in MDM if used for company email
- Update home address with HR if working from new location
- Review and acknowledge updated policy in HR system by January 31, 2025

RISKS:
- Inconsistent application of policy across teams may create fairness concerns
- International remote work triggers complex tax and employment law obligations
- Security risks increase when employees work from non-approved locations`,

  'code-of-conduct': `CODE OF CONDUCT POLICY 2025
DocuMind Corp — All Employees, Contractors, and Representatives
Version: 3.2 | Effective: January 1, 2025

INTRODUCTION
DocuMind Corp is committed to maintaining a workplace characterized by integrity, respect, and professional excellence. This Code of Conduct applies to all employees, contractors, board members, and anyone acting on behalf of the Company.

1. CORE VALUES
- Integrity: Act with honesty in all business dealings
- Respect: Treat all individuals with dignity regardless of background
- Excellence: Pursue quality and continuous improvement
- Accountability: Take responsibility for actions and outcomes
- Collaboration: Work transparently and support team success

2. PROFESSIONAL CONDUCT
Employees must: arrive prepared and on time for meetings and commitments, communicate professionally in all written and verbal interactions, maintain confidentiality of sensitive information, avoid conflicts of interest and disclose potential conflicts immediately, represent the Company accurately to clients and partners.

3. ANTI-HARASSMENT AND NON-DISCRIMINATION
Harassment of any kind is strictly prohibited, including sexual harassment, bullying, intimidation, and discriminatory treatment based on race, gender, age, disability, religion, sexual orientation, or national origin. Report incidents to HR or through the anonymous ethics hotline (1-800-555-ETHICS).

4. CONFLICTS OF INTEREST
Employees must disclose: outside employment that competes with Company business, financial interests in suppliers or customers, personal relationships with direct reports. Undisclosed conflicts may result in termination.

5. USE OF COMPANY RESOURCES
Company assets (equipment, software, data, time) are for business purposes. Limited personal use of equipment is permitted. Employees must not use Company resources for personal financial gain, political activities, or activities that violate this Code.

6. DATA PROTECTION AND PRIVACY
Customer data is handled with highest confidentiality standards. Employees comply with GDPR, CCPA, and applicable data protection laws. Unauthorized access, sharing, or retention of personal data is a terminable offense.

7. FINANCIAL INTEGRITY
Employees involved in financial operations must ensure accurate record-keeping. Expense reports must reflect actual business expenses only. Bribery, kickbacks, and improper payments are prohibited and may constitute criminal violations.

8. DISCIPLINARY ACTIONS
Violations result in: verbal/written warning (minor first violations), performance improvement plan (repeated or moderate violations), suspension (serious violations), immediate termination (severe violations or criminal conduct). All disciplinary actions documented in personnel file.

9. REPORTING VIOLATIONS
Employees are encouraged and protected when reporting suspected violations. Retaliation against reporters is strictly prohibited and itself constitutes a Code violation. Anonymous reports: ethics@documind.ai or 1-800-555-ETHICS.

RISKS:
- Inconsistent enforcement undermines policy credibility
- Insufficient training leads to unintentional violations
- Anonymous reporting channels must be genuinely protected from retaliation`,

  'employment-agreement': `STANDARD EMPLOYMENT AGREEMENT 2025
DocuMind Corp — Full-Time Employee Template
Template Version: EA-2025-FT
HR Department Use Only — Customize Before Issuing

EMPLOYMENT AGREEMENT entered into between DocuMind Corp ("Employer") and [EMPLOYEE NAME] ("Employee").

1. POSITION AND DUTIES
Employee is hired for the position of [JOB TITLE] in the [DEPARTMENT] department. Employee reports to [MANAGER NAME/TITLE]. Primary responsibilities include [INSERT RESPONSIBILITIES]. Employee must devote full professional time and attention to Company duties during working hours.

2. COMPENSATION
Base salary: $[AMOUNT] per year, paid bi-weekly. Performance review: annually in December. Merit increase eligibility: based on performance rating (Exceeds Expectations required for merit increase). Signing bonus: $[AMOUNT] (if applicable), subject to 12-month clawback if Employee resigns voluntarily.

3. BENEFITS
Employee is eligible for: medical, dental, and vision insurance (Company covers 80% of premium), 401(k) with 4% Company match (vesting: 25% per year over 4 years), 15 days PTO annually (increasing to 20 days after 3 years), 10 paid holidays, 5 sick days, $2,000 annual professional development budget, $75/month remote work stipend.

4. WORK LOCATION
Primary work location: [OFFICE ADDRESS / REMOTE]. Remote work subject to Remote Work Policy 2025.

5. AT-WILL EMPLOYMENT
Employment is at-will. Either party may terminate the relationship at any time with 2 weeks written notice. Company may terminate immediately for cause (including policy violations, misconduct, or performance failure).

6. CONFIDENTIALITY AND IP ASSIGNMENT
Employee agrees to the terms of the Confidentiality and IP Assignment Agreement signed concurrently. All work product created during employment is Company property.

7. NON-COMPETE
For 12 months following separation, Employee agrees not to work for direct competitors defined as companies with annual revenue exceeding $1M operating in the enterprise document management space within North America.

8. DISPUTE RESOLUTION
Employment disputes resolved through binding arbitration. Class action waiver applicable.

ACTION ITEMS FOR HR:
- Complete highlighted fields before presenting to candidate
- Obtain signature from authorized Company representative (VP+ level)
- File executed copy in employee personnel file
- Register in HRIS system within 24 hours of signing
- Provide employee with benefits enrollment forms

RISKS:
- Non-compete enforceability varies by state; review California employees separately
- Signing bonus clawback provisions may deter candidates in competitive hiring markets`,

  'q1-operations-report': `Q1 2025 OPERATIONS REPORT
DocuMind Corp — Operations Team
Period: January 1 – March 31, 2025
Prepared by: Bob Martinez, VP Operations
Review Date: April 15, 2025

EXECUTIVE SUMMARY
Q1 2025 demonstrated strong operational performance with 94% of key metrics meeting or exceeding targets. Total operational costs came in 3.2% under budget. Customer satisfaction scores reached an all-time high of 4.7/5.0. One significant incident (server outage on February 12) impacted service availability for 3.5 hours.

KEY PERFORMANCE INDICATORS
- System Uptime: 99.87% (target: 99.9% — slightly missed due to February incident)
- Average Response Time: 145ms (target: <200ms — exceeded target)
- Customer Support Tickets: 1,247 total, 94.2% resolved within SLA
- Document Processing Volume: 2.3M documents processed (23% increase vs Q4 2024)
- AI Query Volume: 187,000 queries (41% increase vs Q4 2024)
- Storage Utilized: 47.3 TB (capacity: 100 TB)

FINANCIAL PERFORMANCE
Total Q1 Operational Budget: $1,250,000
Actual Spend: $1,210,420 (savings: $39,580 / 3.2% under budget)
- Infrastructure: $580,000 ($560,200 actual — $19,800 under)
- Personnel: $520,000 ($518,000 actual — $2,000 under)
- Software Licenses: $90,000 ($87,220 actual — $2,780 under)
- Miscellaneous: $60,000 ($45,000 actual — $15,000 under)

INCIDENT REPORT — February 12 Outage
Duration: 3.5 hours (14:22–17:52 EST)
Root Cause: Database connection pool exhaustion triggered by traffic spike from new marketing campaign
Impact: ~3,200 users unable to access platform, 45 support tickets, 2 enterprise customer escalations
Resolution: Increased connection pool limit, implemented circuit breaker pattern, added auto-scaling trigger
Prevention: Implemented load testing protocol before future marketing campaigns, upgraded monitoring alerting thresholds

PROJECTS STATUS
- Project Aurora (AI Enhancement): 85% complete, on track for Q2 delivery
- Infrastructure Migration to AWS: 60% complete, 2-week delay due to vendor coordination issues
- Customer Portal v2.0: 100% complete, launched March 1
- Data Retention Automation: 40% complete, delayed — team resource constraints

Q2 2025 PRIORITIES
1. Complete AWS infrastructure migration by May 31
2. Launch Project Aurora AI enhancements
3. Hire 2 additional DevOps engineers to address resource constraints
4. Implement proactive capacity planning dashboard

ACTION ITEMS:
- Review and approve Q2 infrastructure budget increase request by April 30
- Conduct post-incident review for February outage with engineering team
- Schedule vendor review meeting for AWS migration progress
- Post job listings for DevOps engineer positions

RISKS:
- Infrastructure migration delays could impact Q2 product delivery commitments
- Resource constraints on Data Retention project create compliance risk
- AI query volume growth may require capacity expansion sooner than planned`,

  'annual-budget-review': `ANNUAL BUDGET REVIEW 2024
DocuMind Corp — Finance and Operations
Period: January 1 – December 31, 2024
Prepared by: Finance Department
Distribution: Executive Team, Department Heads

EXECUTIVE SUMMARY
2024 total company revenue reached $18.7M, representing 34% growth over 2023. Total operating expenses were $14.2M, resulting in EBITDA of $4.5M (24% margin). The company finished the year 8% under the operating expense budget and 12% ahead of revenue targets, driven by strong enterprise sales in Q3 and Q4.

REVENUE BREAKDOWN
Total Revenue: $18,700,000
- Subscription Revenue: $14,200,000 (76%)
- Professional Services: $2,800,000 (15%)
- API Usage Fees: $1,100,000 (6%)
- Partner Revenue: $600,000 (3%)

EXPENSE BREAKDOWN BY DEPARTMENT
Engineering: Budget $5,200,000 | Actual $5,010,000 | Variance: +$190,000 (3.7% under)
Sales & Marketing: Budget $3,800,000 | Actual $3,620,000 | Variance: +$180,000 (4.7% under)
Operations: Budget $2,900,000 | Actual $2,750,000 | Variance: +$150,000 (5.2% under)
G&A: Budget $1,800,000 | Actual $1,690,000 | Variance: +$110,000 (6.1% under)
Customer Success: Budget $1,500,000 | Actual $1,480,000 | Variance: +$20,000 (1.3% under)

KEY METRICS
Customer Acquisition Cost (CAC): $8,200 (down from $10,500 in 2023)
Customer Lifetime Value (CLV): $42,000
CLV/CAC Ratio: 5.1x
Monthly Recurring Revenue (MRR) Dec 2024: $1,380,000
Annual Recurring Revenue (ARR): $16,560,000
Churn Rate: 4.2% (improved from 6.8% in 2023)

2025 BUDGET PROJECTIONS
Revenue Target: $27,000,000 (44% growth)
- New: Expand into EMEA market, target 100 enterprise customers
Total Operating Expenses: $18,500,000
Projected EBITDA: $8,500,000 (31% margin improvement)

RISKS:
- Revenue target assumes successful EMEA expansion; delays would significantly miss targets
- Engineering headcount budget insufficient if AI infrastructure costs increase
- Customer churn must continue improving; any regression impacts ARR projections

ACTION ITEMS:
- Finalize 2025 departmental budgets by January 15
- Present to Board of Directors at February meeting
- Implement quarterly budget review cadence for 2025`,

  'invoice-office-supplies': `INVOICE
Invoice Number: #2025-047
Invoice Date: April 18, 2025
Due Date: May 18, 2025
Payment Terms: Net 30

BILL TO:
DocuMind Corp
Accounts Payable Department
123 Tech Plaza, Suite 400
San Francisco, CA 94105

FROM:
OfficeFirst Supply Co.
456 Commerce Drive
Portland, OR 97201
Vendor ID: OFS-2024-891
Tax ID: 82-4521987

ITEMS:
1. Premium Paper (8.5x11, 500 sheets, 20 reams) — $180.00
2. Ballpoint Pens (Box of 50, blue/black) × 10 boxes — $220.00
3. Sticky Notes (3x3, assorted colors, 12-pack) × 8 packs — $96.00
4. File Folders (Hanging, Letter, 25-count) × 15 boxes — $337.50
5. Staples (Standard, 5000-count) × 12 boxes — $72.00
6. Whiteboard Markers (Assorted, 8-pack) × 6 packs — $84.00
7. Scissors (Office grade, 6-pack) × 4 packs — $52.00
8. Binder Clips (Assorted sizes, 12-pack) × 10 packs — $45.00
9. Correction Tape × 20 units — $60.00
10. Printer Cartridges (HP 952XL Black) × 6 units — $270.00

SUBTOTAL: $1,416.50
SHIPPING: $35.00
TAX (8.625%): $122.17
TOTAL DUE: $1,573.67

PAYMENT INSTRUCTIONS:
ACH: Routing 021000021 | Account 4892015678
Check payable to: OfficeFirst Supply Co.
Reference invoice number on all payments.

NOTES: Bulk pricing applied for orders over $1,000. Next order qualifies for loyalty discount. Contact: orders@officefirst.com`,

  'invoice-it-equipment': `INVOICE
Invoice Number: #2025-031
Invoice Date: March 5, 2025
Due Date: April 4, 2025
Payment Terms: Net 30

BILL TO:
DocuMind Corp
Accounts Payable / IT Procurement
123 Tech Plaza, Suite 400
San Francisco, CA 94105
Purchase Order: PO-2025-IT-0089

FROM:
TechDirect Solutions Inc.
789 Innovation Blvd
Austin, TX 78701
Vendor ID: TDS-2023-445
Tax ID: 74-3892156

ITEMS:
1. Apple MacBook Pro 16" M3 Pro (Space Gray, 36GB RAM, 1TB SSD) × 5 units
   Unit Price: $3,499.00 | Total: $17,495.00

2. Dell 27" 4K USB-C Monitor (P2723QE) × 5 units
   Unit Price: $549.00 | Total: $2,745.00

3. Keychron K2 Pro Mechanical Keyboard × 5 units
   Unit Price: $99.00 | Total: $495.00

4. Logitech MX Master 3S Mouse × 5 units
   Unit Price: $99.99 | Total: $499.95

5. CalDigit TS4 Thunderbolt 4 Dock × 5 units
   Unit Price: $349.95 | Total: $1,749.75

6. Jabra Evolve2 75 Headset (USB-C) × 5 units
   Unit Price: $379.00 | Total: $1,895.00

7. Laptop Sleeve (16", Premium) × 5 units
   Unit Price: $49.99 | Total: $249.95

SUBTOTAL: $25,129.65
CORPORATE DISCOUNT (5%): -$1,256.48
SHIPPING (insured): $150.00
TAX (8.625%): $2,070.20
TOTAL DUE: $26,093.37

DELIVERY: March 10-12, 2025 via FedEx Priority. Signature required.
WARRANTY: All Apple products include 1-year AppleCare+. Accessories: 1-year manufacturer warranty.

PAYMENT: Wire transfer preferred. ACH accepted. Contact: ar@techdirect.com | (512) 555-0190`,
};

const seedDocuments = async (users, workspaces, folders) => {
  const [alice, david, bob, carol] = users;
  const [legalWs, hrWs, opsWs] = workspaces;

  const legalFolders = folders.filter(f => f.workspace.toString() === legalWs._id.toString());
  const hrFolders    = folders.filter(f => f.workspace.toString() === hrWs._id.toString());
  const opsFolders   = folders.filter(f => f.workspace.toString() === opsWs._id.toString());

  const contractsFolder         = legalFolders.find(f => f.name === 'Contracts');
  const ndasFolder              = legalFolders.find(f => f.name === 'NDAs');
  const agreementsFolder        = legalFolders.find(f => f.name === 'Agreements');
  const policiesFolder          = hrFolders.find(f => f.name === 'Policies');
  const employeeAgreementsFolder = hrFolders.find(f => f.name === 'Employee Agreements');
  const reportsFolder           = opsFolders.find(f => f.name === 'Reports');
  const invoicesFolder          = opsFolders.find(f => f.name === 'Invoices');

  // Write seed text files to disk so reprocess also works
  const uploadsDir = path.join(__dirname, '..', 'uploads', 'seed');
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

  const makeFilePath = (filename, contentKey) => {
    const fp = path.join(uploadsDir, filename);
    const text = CONTENT[contentKey] || `Seed document: ${filename}`;
    if (!fs.existsSync(fp)) fs.writeFileSync(fp, text, 'utf8');
    return fp;
  };

  // Helper: derive word count from content key
  const wc = (key) => (CONTENT[key] || '').split(/\s+/).filter(Boolean).length;

  const aiSummaryTemplate = (name, type, contentKey) => {
    const text = CONTENT[contentKey] || '';
    const snippet = text.substring(0, 200).replace(/\s+/g, ' ').trim();
    return {
      executive: `"${name}" is a ${type} document. ${snippet}...`,
      keyInsights: [
        'Clear terms and conditions established for all involved parties.',
        'Compliance requirements are explicitly stated and traceable.',
        'Liability and indemnification clauses protect organizational interests.',
        'Termination conditions and notice periods are clearly defined.',
        'Dispute resolution mechanisms are included for conflict management.',
      ],
      risks: [
        'Automatic renewal clauses require calendar tracking to avoid unwanted commitments.',
        'Jurisdiction-specific compliance requirements may change with regulatory updates.',
        'Force majeure provisions are limited and may not cover all disruption scenarios.',
      ],
      importantDates: ['Effective date: Upon signing', 'Initial term: 12 months', 'Renewal notice: 30 days before term end'],
      actionItems: [
        'Obtain authorized signatures from all required parties.',
        'File executed copy in legal records management system.',
        'Set calendar reminders for renewal and review dates.',
        'Distribute relevant sections to responsible team members.',
        'Schedule 6-month compliance review.',
      ],
      generatedAt: new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 7),
      model: 'seed',
    };
  };

  const documentsData = [
    {
      name: 'Vendor Contract — TechSupply Inc',
      originalName: 'vendor-contract-techsupply.pdf',
      workspace: legalWs._id, folder: contractsFolder?._id || null,
      uploadedBy: alice._id, fileType: 'pdf', mimeType: 'application/pdf',
      size: 245760,
      filePath: makeFilePath('vendor-contract-techsupply.txt', 'vendor-contract-techsupply'),
      content: CONTENT['vendor-contract-techsupply'],
      status: 'ready', tags: ['vendor', 'contract', 'technology', '2025'],
      description: 'Annual software and infrastructure services agreement with TechSupply Inc.',
      metadata: { pageCount: 12, wordCount: wc('vendor-contract-techsupply'), author: 'Legal Department' },
      aiSummary: aiSummaryTemplate('Vendor Contract — TechSupply Inc', 'vendor contract', 'vendor-contract-techsupply'),
      viewCount: 34, downloadCount: 8,
      notes: 'Review renewal clause on page 9 before Q4. Legal sign-off required from both GCs.',
    },
    {
      name: 'Service Agreement — CloudHost Pro',
      originalName: 'service-agreement-cloudhost.pdf',
      workspace: legalWs._id, folder: contractsFolder?._id || null,
      uploadedBy: david._id, fileType: 'pdf', mimeType: 'application/pdf',
      size: 189440,
      filePath: makeFilePath('service-agreement-cloudhost.txt', 'service-agreement-cloudhost'),
      content: CONTENT['service-agreement-cloudhost'],
      status: 'ready', tags: ['cloud', 'hosting', 'SLA', '2025'],
      description: 'Cloud infrastructure hosting agreement including SLA terms.',
      metadata: { pageCount: 8, wordCount: wc('service-agreement-cloudhost') },
      aiSummary: aiSummaryTemplate('Service Agreement — CloudHost Pro', 'service agreement', 'service-agreement-cloudhost'),
      viewCount: 21, downloadCount: 5,
    },
    {
      name: 'Mutual NDA — Apex Partners',
      originalName: 'nda-apex-partners.pdf',
      workspace: legalWs._id, folder: ndasFolder?._id || null,
      uploadedBy: alice._id, fileType: 'pdf', mimeType: 'application/pdf',
      size: 98304,
      filePath: makeFilePath('nda-apex-partners.txt', 'nda-apex-partners'),
      content: CONTENT['nda-apex-partners'],
      status: 'ready', tags: ['NDA', 'confidentiality', 'partners'],
      description: 'Mutual non-disclosure agreement with Apex Partners for project collaboration.',
      metadata: { pageCount: 4, wordCount: wc('nda-apex-partners'), author: 'Alice Johnson' },
      aiSummary: aiSummaryTemplate('Mutual NDA — Apex Partners', 'NDA', 'nda-apex-partners'),
      viewCount: 15, downloadCount: 3,
    },
    {
      name: 'Employee NDA Template 2025',
      originalName: 'employee-nda-template-2025.docx',
      workspace: legalWs._id, folder: ndasFolder?._id || null,
      uploadedBy: alice._id, fileType: 'word',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      size: 65536,
      filePath: makeFilePath('employee-nda-template-2025.txt', 'employee-nda-template'),
      content: CONTENT['employee-nda-template'],
      status: 'ready', tags: ['NDA', 'template', 'employee', '2025'],
      description: 'Standard NDA template for all new employees, updated for 2025 regulations.',
      metadata: { pageCount: 3, wordCount: wc('employee-nda-template') },
      viewCount: 52, downloadCount: 18,
    },
    {
      name: 'Partnership Agreement — DataFlow Ltd',
      originalName: 'partnership-agreement-dataflow.pdf',
      workspace: legalWs._id, folder: agreementsFolder?._id || null,
      uploadedBy: david._id, fileType: 'pdf', mimeType: 'application/pdf',
      size: 312320,
      filePath: makeFilePath('partnership-agreement-dataflow.txt', 'partnership-agreement-dataflow'),
      content: CONTENT['partnership-agreement-dataflow'],
      status: 'ready', tags: ['partnership', 'agreement', 'DataFlow'],
      description: 'Strategic partnership agreement covering joint development and revenue sharing.',
      metadata: { pageCount: 18, wordCount: wc('partnership-agreement-dataflow') },
      aiSummary: aiSummaryTemplate('Partnership Agreement — DataFlow Ltd', 'partnership agreement', 'partnership-agreement-dataflow'),
      viewCount: 29, downloadCount: 6,
    },
    {
      name: 'Remote Work Policy 2025',
      originalName: 'remote-work-policy-2025.pdf',
      workspace: hrWs._id, folder: policiesFolder?._id || null,
      uploadedBy: david._id, fileType: 'pdf', mimeType: 'application/pdf',
      size: 153600,
      filePath: makeFilePath('remote-work-policy-2025.txt', 'remote-work-policy'),
      content: CONTENT['remote-work-policy'],
      status: 'ready', tags: ['policy', 'remote', 'HR', '2025'],
      description: 'Updated remote work policy covering eligibility, equipment, and performance standards.',
      metadata: { pageCount: 6, wordCount: wc('remote-work-policy'), author: 'HR Department' },
      aiSummary: aiSummaryTemplate('Remote Work Policy 2025', 'company policy', 'remote-work-policy'),
      viewCount: 87, downloadCount: 42,
      notes: 'Approved by executive team on Jan 15 2025. Next review: Jan 2026.',
    },
    {
      name: 'Code of Conduct Policy',
      originalName: 'code-of-conduct-2025.pdf',
      workspace: hrWs._id, folder: policiesFolder?._id || null,
      uploadedBy: david._id, fileType: 'pdf', mimeType: 'application/pdf',
      size: 204800,
      filePath: makeFilePath('code-of-conduct-2025.txt', 'code-of-conduct'),
      content: CONTENT['code-of-conduct'],
      status: 'ready', tags: ['policy', 'conduct', 'compliance', 'HR'],
      description: 'Employee code of conduct covering ethics, behavior, and disciplinary procedures.',
      metadata: { pageCount: 14, wordCount: wc('code-of-conduct') },
      aiSummary: aiSummaryTemplate('Code of Conduct Policy', 'company policy', 'code-of-conduct'),
      viewCount: 63, downloadCount: 28,
    },
    {
      name: 'Standard Employment Agreement 2025',
      originalName: 'employment-agreement-standard-2025.docx',
      workspace: hrWs._id, folder: employeeAgreementsFolder?._id || null,
      uploadedBy: david._id, fileType: 'word',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      size: 131072,
      filePath: makeFilePath('employment-agreement-standard-2025.txt', 'employment-agreement'),
      content: CONTENT['employment-agreement'],
      status: 'ready', tags: ['employment', 'agreement', 'HR', 'template'],
      description: 'Standard employment agreement template for full-time employees, 2025 edition.',
      metadata: { pageCount: 9, wordCount: wc('employment-agreement'), author: 'HR Department' },
      aiSummary: aiSummaryTemplate('Standard Employment Agreement 2025', 'employment agreement', 'employment-agreement'),
      viewCount: 44, downloadCount: 22, isShared: true,
    },
    {
      name: 'Q1 2025 Operations Report',
      originalName: 'q1-2025-operations-report.xlsx',
      workspace: opsWs._id, folder: reportsFolder?._id || null,
      uploadedBy: bob._id, fileType: 'excel',
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      size: 409600,
      filePath: makeFilePath('q1-2025-operations-report.txt', 'q1-operations-report'),
      content: CONTENT['q1-operations-report'],
      status: 'ready', tags: ['report', 'Q1', 'operations', '2025'],
      description: 'Comprehensive Q1 2025 operations summary including KPIs, budget variance, and project status.',
      metadata: { wordCount: wc('q1-operations-report') },
      aiSummary: aiSummaryTemplate('Q1 2025 Operations Report', 'quarterly report', 'q1-operations-report'),
      viewCount: 38, downloadCount: 14,
    },
    {
      name: 'Annual Budget Review 2024',
      originalName: 'annual-budget-review-2024.xlsx',
      workspace: opsWs._id, folder: reportsFolder?._id || null,
      uploadedBy: bob._id, fileType: 'excel',
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      size: 573440,
      filePath: makeFilePath('annual-budget-review-2024.txt', 'annual-budget-review'),
      content: CONTENT['annual-budget-review'],
      status: 'ready', tags: ['budget', 'annual', '2024', 'finance'],
      description: 'Full-year 2024 budget review with actuals vs forecast analysis.',
      metadata: { wordCount: wc('annual-budget-review') },
      viewCount: 25, downloadCount: 9,
    },
    {
      name: 'Invoice #2025-047 — Office Supplies',
      originalName: 'invoice-2025-047-office-supplies.pdf',
      workspace: opsWs._id, folder: invoicesFolder?._id || null,
      uploadedBy: bob._id, fileType: 'pdf', mimeType: 'application/pdf',
      size: 61440,
      filePath: makeFilePath('invoice-2025-047.txt', 'invoice-office-supplies'),
      content: CONTENT['invoice-office-supplies'],
      status: 'ready', tags: ['invoice', 'office', 'supplies', '2025'],
      description: 'Office supplies procurement invoice for Q2 2025.',
      metadata: { pageCount: 2, wordCount: wc('invoice-office-supplies') },
      viewCount: 11, downloadCount: 4,
    },
    {
      name: 'Invoice #2025-031 — IT Equipment',
      originalName: 'invoice-2025-031-it-equipment.pdf',
      workspace: opsWs._id, folder: invoicesFolder?._id || null,
      uploadedBy: carol._id, fileType: 'pdf', mimeType: 'application/pdf',
      size: 73728,
      filePath: makeFilePath('invoice-2025-031.txt', 'invoice-it-equipment'),
      content: CONTENT['invoice-it-equipment'],
      status: 'ready', tags: ['invoice', 'IT', 'equipment', '2025'],
      description: 'IT hardware procurement invoice including laptops and peripherals.',
      metadata: { pageCount: 3, wordCount: wc('invoice-it-equipment') },
      viewCount: 16, downloadCount: 7,
    },
  ];

  const created = [];
  const totalSize = { [legalWs._id]: 0, [hrWs._id]: 0, [opsWs._id]: 0 };

  for (const doc of documentsData) {
    const document = await Document.create(doc);
    await DocumentVersion.create({ document: document._id, version: 1, filePath: doc.filePath, size: doc.size, uploadedBy: doc.uploadedBy });
    totalSize[doc.workspace] = (totalSize[doc.workspace] || 0) + doc.size;
    created.push(document);
    console.log(`  ✓ Document: ${document.name} (${document.metadata?.wordCount || 0} words)`);
  }

  for (const [wsId, size] of Object.entries(totalSize)) {
    await Workspace.findByIdAndUpdate(wsId, { $inc: { 'storage.used': size } });
  }

  return created;
};

module.exports = seedDocuments;
