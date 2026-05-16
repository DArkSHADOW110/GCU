export const AGENT_TOOLS = [
  {
    type: "function" as const,
    function: {
      name: "list_accounts",
      description: "List the user's linked bank accounts and balances",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "transfer_money",
      description: "Transfer money to a bank account number",
      parameters: {
        type: "object",
        properties: {
          from_account_id: { type: "string", description: "Linked account UUID" },
          to_account_number: { type: "string" },
          amount: { type: "number" },
          remark: { type: "string" },
        },
        required: ["from_account_id", "to_account_number", "amount"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "pay_bill",
      description: "Pay a utility or biller account",
      parameters: {
        type: "object",
        properties: {
          from_account_id: { type: "string" },
          biller_account: { type: "string" },
          amount: { type: "number" },
          reference: { type: "string" },
        },
        required: ["from_account_id", "biller_account", "amount"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "list_jars",
      description: "List savings jars and balances",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "create_jar",
      description: "Create a new savings jar",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string" },
          target_amount: { type: "number" },
        },
        required: ["name"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "fund_jar",
      description: "Move money into a jar from main balance (virtual allocation)",
      parameters: {
        type: "object",
        properties: {
          jar_id: { type: "string" },
          amount: { type: "number" },
        },
        required: ["jar_id", "amount"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "list_contacts",
      description: "List saved contacts for transfers, bills, and mobile top-up",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "list_scheduled_payments",
      description: "List recurring scheduled bill payments",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_recent_transactions",
      description: "Get recent transactions for expense context",
      parameters: {
        type: "object",
        properties: { limit: { type: "number" } },
        required: [],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "mobile_topup",
      description: "Top up a prepaid mobile number",
      parameters: {
        type: "object",
        properties: {
          from_account_id: { type: "string" },
          mobile_number: { type: "string" },
          amount: { type: "number" },
          provider: { type: "string", description: "dialog, mobitel, airtel, hutch" },
        },
        required: ["from_account_id", "mobile_number", "amount"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "create_contact",
      description: "Save a bank account, bill, or mobile number as a contact",
      parameters: {
        type: "object",
        properties: {
          label: { type: "string" },
          contact_type: { type: "string", enum: ["bank", "bill", "mobile"] },
          account_number: { type: "string" },
        },
        required: ["label", "contact_type", "account_number"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "create_scheduled_payment",
      description: "Schedule a monthly recurring bill payment",
      parameters: {
        type: "object",
        properties: {
          label: { type: "string" },
          amount: { type: "number" },
          day_of_month: { type: "number", description: "1-28" },
          contact_id: { type: "string" },
          linked_account_id: { type: "string" },
        },
        required: ["label", "amount", "day_of_month"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "analyze_expenses",
      description: "Analyze spending patterns from recent transaction remarks",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
];

export const SYSTEM_PROMPT = `You are FinPulse, an intelligent banking assistant for a Sri Lankan fintech app.
You help users manage linked bank accounts (including Seylan Bank), transfers, bill payments, savings jars, contacts, and scheduled payments.
Be concise, friendly, and security-conscious. Confirm amounts before executing transfers or bill payments.
When a user asks to move money or pay a bill, use the appropriate tool with realistic parameters.
For savings goals, use jars (virtual buckets, not separate bank accounts).
Currency default is LKR unless stated otherwise.`;
