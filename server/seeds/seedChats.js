const Chat = require('../models/Chat');
const Message = require('../models/Message');

const seedChats = async (users, workspaces, documents) => {
  const [alice, david, bob] = users;
  const [legalWs, hrWs] = workspaces;

  const legalDocs = documents.filter(d => d.workspace.toString() === legalWs._id.toString());
  const hrDocs = documents.filter(d => d.workspace.toString() === hrWs._id.toString());

  const chatsData = [
    {
      workspace: legalWs._id,
      user: alice._id,
      title: 'Vendor Contract Review',
      mode: 'document',
      targetDocument: legalDocs[0]?._id || null,
      messageCount: 6,
      messages: [
        { role: 'user', content: 'Summarize the key terms of this vendor contract.' },
        { role: 'assistant', content: 'The vendor contract with TechSupply Inc establishes a 12-month software and infrastructure services agreement. Key terms include: (1) Annual service fee of $120,000 paid quarterly, (2) 99.9% uptime SLA with penalty clauses, (3) 30-day termination notice required, (4) Automatic renewal unless cancelled 60 days prior to term end, (5) IP ownership remains with TechSupply for proprietary tools while custom deliverables transfer to your organization.' },
        { role: 'user', content: 'What are the risks in this contract?' },
        { role: 'assistant', content: 'The main risks identified in this contract are: (1) **Auto-renewal risk** — the contract auto-renews if not cancelled 60 days before term end, which could result in an unintended 12-month commitment. (2) **Data sovereignty clause** — Section 8.3 allows TechSupply to store data in any jurisdiction, which may conflict with GDPR requirements. (3) **Limited liability cap** — liability is capped at 3 months of fees paid, which may be insufficient for a major service disruption. (4) **Price escalation** — Section 5.2 allows up to 8% annual price increase without renegotiation.' },
        { role: 'user', content: 'What action items should I take?' },
        { role: 'assistant', content: 'Based on the contract review, here are the recommended action items:\n\n1. **Set renewal reminder** 75 days before contract end date to ensure timely cancellation decision\n2. **Negotiate data sovereignty clause** — request an addendum specifying EU/US data residency\n3. **Request SLA credit history** from TechSupply to assess penalty clause effectiveness\n4. **Review price escalation clause** and negotiate a lower cap (4-5% maximum)\n5. **Obtain legal sign-off** on IP ownership clauses before execution\n6. **Add cybersecurity addendum** requiring ISO 27001 compliance verification' },
      ],
    },
    {
      workspace: hrWs._id,
      user: david._id,
      title: 'Remote Work Policy Analysis',
      mode: 'document',
      targetDocument: hrDocs[0]?._id || null,
      messageCount: 4,
      messages: [
        { role: 'user', content: 'What are the eligibility requirements for remote work?' },
        { role: 'assistant', content: 'According to the Remote Work Policy 2025, eligibility requirements include: (1) Minimum 6 months of employment tenure, (2) Performance rating of "Meets Expectations" or above in the last review cycle, (3) Role must be classified as "remote-compatible" by the department head, (4) Reliable home internet connection (minimum 25 Mbps), (5) Dedicated workspace meeting ergonomic standards, (6) Manager approval required for hybrid arrangements exceeding 3 days per week.' },
        { role: 'user', content: 'What are the performance monitoring requirements?' },
        { role: 'assistant', content: 'The performance monitoring requirements for remote workers per the 2025 policy are: (1) **Daily check-ins** via team communication platform during core hours (10 AM - 3 PM local time), (2) **Weekly 1:1s** with direct manager required for fully remote employees, (3) **Monthly productivity reviews** using KPI dashboards, (4) **Quarterly in-person attendance** — at least one week per quarter at primary office, (5) **Response time SLA** — must respond to messages within 2 hours during core hours, (6) **Time tracking** required for client-billable roles using approved software.' },
      ],
    },
    {
      workspace: legalWs._id,
      user: bob._id,
      title: 'NDA Key Terms',
      mode: 'workspace',
      targetDocument: null,
      messageCount: 2,
      messages: [
        { role: 'user', content: 'List all NDAs in this workspace and their expiry dates.' },
        { role: 'assistant', content: 'Based on the documents in the Legal Team workspace, I found the following NDAs:\n\n1. **Mutual NDA — Apex Partners** — 2-year term, effective from signing date. Covers joint development project confidential information.\n\n2. **Employee NDA Template 2025** — Ongoing (no fixed expiry). Updated template for all new hires, includes social media and post-employment restrictions.\n\nBoth NDAs include standard confidentiality protections, with the Apex Partners NDA additionally covering technical specifications and financial projections shared during partnership discussions.' },
      ],
    },
  ];

  const created = [];

  for (const chatData of chatsData) {
    const { messages: msgs, ...chatFields } = chatData;

    const chat = await Chat.create({
      ...chatFields,
      lastMessageAt: new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 3),
    });

    const messageIds = [];
    for (const m of msgs) {
      const msg = await Message.create({
        chat: chat._id,
        role: m.role,
        content: m.content,
        model: m.role === 'assistant' ? 'mock' : undefined,
        tokens: m.role === 'assistant' ? Math.ceil(m.content.length / 4) : 0,
        sources: m.role === 'assistant' && chat.targetDocument ? [
          { excerpt: 'Relevant section from document...', page: 1, relevanceScore: 0.92 },
        ] : [],
        suggestedFollowUps: m.role === 'assistant' ? [
          'Can you elaborate on the key findings?',
          'What are the most critical risks?',
          'What action items should I prioritize?',
        ] : [],
      });
      messageIds.push(msg._id);
    }

    await Chat.findByIdAndUpdate(chat._id, { messages: messageIds });
    created.push(chat);
    console.log(`  ✓ Chat: "${chat.title}" (${msgs.length} messages)`);
  }

  return created;
};

module.exports = seedChats;
