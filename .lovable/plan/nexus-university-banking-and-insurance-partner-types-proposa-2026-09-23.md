# Nexus: University, Banking, and Insurance partner types (proposal)

Status: proposal for review. Nothing below is built or published. The three professional service catalogs (Attorney, CPA, IT services) and the verification from the previous request are done.

## 1. One model, three partner tracks

Every partner type is a row, not code. Each type belongs to a track that decides which profile fields and introduction flow it uses.

```text
Track                  Types                                   Relationship to clients
professional_service   Attorney, CPA, IT services (live)       Firm delivers paid services
institution            University Partner (proposed)           Collaborates; never endorses
brokerage              Banking Partner, Insurance Broker       Accepts introductions; no eligibility promised
```

Already in place: the partner type table has a track, a registration switch (types stay hidden until opened), and the selector only lists open professional-service types. The UI no longer presents the first three as the full list.

## 2. Shared registration flow (all six types)

1. Account
2. Choose partner track and type (a firm may hold several types; each keeps its own choices)
3. Organization and authorized representative (name, title, work email, confirmation they are authorized to represent the organization)
4. Track-specific details (below)
5. Grouped choices from that type's catalog, with the same search, summary, featured limit, and "Other" suggestion held for review
6. Private review details (licenses, authorization letters)
7. Review and submit; everything stays draft until Opsirix approves

Shared welcome line: "Tell us how you work with founders and businesses. A person on our team will review your details before anything is shown publicly."

## 3. University Partners

**Profile fields:** institution; authorized representative and office (for example, entrepreneurship center, career services); campus or program; geographic reach (campus, city, state, national, online); who they serve (students, alumni, faculty founders, local businesses); representative's authority to speak for the program (private).

**Collaboration choices (grouped):**
- Founder and student programs: incubator or accelerator referrals; entrepreneurship course guest sessions; student venture support; alumni founder support
- Talent and experiential learning: internships and co-ops; capstone and class projects; student consulting projects; career fair participation
- International students and founders: international student entrepreneurship guidance events; referrals to campus international offices; OPT/CPT awareness sessions (information only, not legal advice)
- Research and commercialization: technology transfer contacts; faculty startup support; research partnership inquiries
- Community and events: workshops and speaker events; pitch competitions; small-business outreach programs

**Introduction flow:** collaboration request, not a client referral. The request goes to the program office, which accepts, declines, or asks for details.

**Required wording:** "Listing reflects a program's participation in Nexus. It does not mean the university endorses Opsirix or any business." Individual applicants without program authority are held for verification and cannot publish the institution name as a partner.

## 4. Banking Partners

**Profile fields:** institution; authorized representative and role (for example, business banker, relationship manager); branch or regional service areas; segments served (startups, small businesses, immigrant founders, nonprofits, specific industries); languages; preferred introduction method and response time.

**Introduction choices (grouped):**
- Business accounts: business checking and savings; merchant services; treasury and cash management; foreign-owned or non-resident business account inquiries
- Lending and credit: SBA loan inquiries; lines of credit; equipment financing; commercial real estate lending; business credit cards
- Founder and startup banking: startup banking packages; venture-backed company banking; banking for newly formed entities
- International: international wires and FX; trade finance inquiries

**Introduction flow:** the founder chooses a topic and shares only a short, consented summary. The bank decides whether to follow up. No credit data, SSNs, or financial documents pass through Nexus.

**Required wording:** "An introduction is not an application. Account opening, credit, and financing decisions are made only by the bank under its own requirements." No "pre-qualified", "approved", or rate claims are allowed in profiles.

## 5. Insurance Brokers

**Profile fields:** brokerage; authorized representative; licensed states and lines of authority (private, for review); resident license number and producer ID (private); client and industry focus; carriers or markets they can access (optional); languages.

**Coverage choices (grouped):**
- Core business coverage: general liability; business owner's policy; commercial property; commercial auto
- Professional and management liability: professional liability / E&O; directors and officers; employment practices liability; fiduciary liability
- Cyber and technology: cyber liability; technology E&O
- People and benefits: workers' compensation; group health; group dental and vision; group life and disability
- Specialty: product liability; surety bonds; inland marine and equipment; event and hospitality coverage

**Introduction flow:** a coverage inquiry (topic, industry, state, rough timing). Only brokers licensed for that state and line are eligible to receive it once their license review is complete.

**Required wording:** "Brokers quote and place coverage under their own licenses. An inquiry does not bind coverage or guarantee eligibility."

## 6. What differs from professional service firms

| Area | Professional services | University | Banking | Insurance |
|---|---|---|---|---|
| Pricing fields | Optional | Hidden | Hidden | Hidden |
| Authorized representative proof | Optional | Required (private) | Required (private) | Required (private) |
| License data | Per service | None | None | Required per state and line (private) |
| Introduction | Client inquiry | Collaboration request | Consented topic introduction | Coverage inquiry, routed by state and line |
| Public disclaimer | Independent professionals | No endorsement | No eligibility | No binding coverage |
| Directory filters | Service, location | Program, reach | Segment, area | Line, licensed state |

## Technical details (when approved)

- Seed three new partner types with their track, hidden until opened; seed each catalog through the same category and service tables and stable IDs.
- Add a track-specific details table per track (institution, brokerage) linked to the application, with owner/admin-only access, plus a private license table for insurance (state, line, license number, review status set only by admins).
- The selector reads the track to show or hide pricing and qualification fields; registration step 4 renders the track's form.
- Introductions: one `partner_introductions` table with a type (inquiry, collaboration, coverage), a founder-consented summary, and routing rules; partners see only introductions sent to them.
- Directory: shared search on catalog IDs, with track-specific filters and required disclaimers.

## Open questions

- Should banking and insurance partners show named representatives publicly, or only the institution?
- Do university partners need an agreement signed with Opsirix before their listing goes live?
- Should founders see partner-type-specific consent text before each introduction is sent?
