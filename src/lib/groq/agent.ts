import type { ChatCompletionMessageParam } from "groq-sdk/resources/chat/completions";
import { executeAgentTool } from "@/lib/groq/actions";
import { getGroqClient, GROQ_MODEL } from "@/lib/groq/client";
export { analyzeExpenses } from "@/lib/groq/expense-analysis";
import { AGENT_TOOLS, SYSTEM_PROMPT } from "@/lib/groq/tools";
import * as chatRepo from "@/lib/repositories/chat";
import type { User } from "@/types/database";

export async function runAgentChat(
  user: User,
  userMessage: string
): Promise<{ reply: string; toolResults?: unknown[] }> {
  const groq = getGroqClient();
  if (!groq) {
    return {
      reply:
        "Groq API is not configured. Add GROQ_API_KEY to your environment to enable the AI assistant.",
    };
  }

  await chatRepo.saveMessage(user.id, "user", userMessage);
  const history = await chatRepo.getRecentMessages(user.id, 20);

  const messages: ChatCompletionMessageParam[] = [
    { role: "system", content: SYSTEM_PROMPT },
    ...history.map((m) => ({
      role: m.role as "user" | "assistant" | "system",
      content: m.content,
    })),
    { role: "user", content: userMessage },
  ];

  let completion = await groq.chat.completions.create({
    model: GROQ_MODEL,
    messages,
    tools: AGENT_TOOLS,
    tool_choice: "auto",
    temperature: 0.4,
    max_tokens: 1024,
  });

  let choice = completion.choices[0]?.message;
  const toolResults: unknown[] = [];

  while (choice?.tool_calls?.length) {
    messages.push({
      role: "assistant",
      content: choice.content ?? "",
      tool_calls: choice.tool_calls,
    });

    for (const call of choice.tool_calls) {
      const fn = call.function;
      let parsed: Record<string, unknown> = {};
      try {
        parsed = JSON.parse(fn.arguments || "{}") as Record<string, unknown>;
      } catch {
        parsed = {};
      }
      const result = await executeAgentTool(user, fn.name, parsed);
      toolResults.push({ tool: fn.name, result });
      messages.push({
        role: "tool",
        tool_call_id: call.id,
        content: JSON.stringify(result),
      });
    }

    completion = await groq.chat.completions.create({
      model: GROQ_MODEL,
      messages,
      tools: AGENT_TOOLS,
      temperature: 0.4,
      max_tokens: 1024,
    });
    choice = completion.choices[0]?.message;
  }

  const reply =
    choice?.content?.trim() ||
    "I completed the requested actions. Let me know if you need anything else.";

  await chatRepo.saveMessage(user.id, "assistant", reply, {
    toolResults: toolResults.length ? toolResults : undefined,
  });

  return { reply, toolResults: toolResults.length ? toolResults : undefined };
}
