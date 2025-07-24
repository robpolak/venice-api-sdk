import { VeniceCore } from '../core/venice-core';
import { ChatApi } from '../api/impl/chat';
import { ChatCompletionRequest, ChatMessage, ChatMessageRole } from '../model/chat';

export interface AgentConfig {
  name: string;
  model: string;
  systemPrompt?: string;
  context?: Record<string, unknown>;
  temperature?: number;
  maxTokens?: number;
  tools?: AgentTool[];
  memoryLimit?: number;
}

export interface AgentTool {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
  handler: (args: Record<string, unknown>) => Promise<unknown>;
}

export interface AgentMemory {
  sessionId: string;
  messages: ChatMessage[];
  context: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export class VeniceAgent {
  private core: VeniceCore;
  private chatApi: ChatApi;
  private config: AgentConfig;
  private memory: AgentMemory;
  private tools: Map<string, AgentTool>;

  constructor(core: VeniceCore, config: AgentConfig) {
    this.core = core;
    this.chatApi = new ChatApi(core);
    this.config = config;
    this.tools = new Map();

    // Initialize memory with system context
    this.memory = {
      sessionId: this.generateSessionId(),
      messages: [],
      context: config.context ?? {},
      metadata: {
        created: Date.now(),
        model: config.model,
        name: config.name,
      },
    };

    // Add system message if provided
    if (config.systemPrompt != null && config.systemPrompt.length > 0) {
      this.addSystemMessage(config.systemPrompt);
    }

    // Register tools
    if (config.tools) {
      config.tools.forEach(tool => this.registerTool(tool));
    }
  }

  /**
   * Send a message to the agent and get a response
   */
  public async chat(
    message: string,
    options?: {
      temperature?: number;
      maxTokens?: number;
      context?: Record<string, unknown>;
    }
  ): Promise<AgentResponse> {
    // Add user message to memory
    this.addMessage({
      role: ChatMessageRole.USER,
      content: message,
    });

    // Merge any additional context
    if (options?.context) {
      this.memory.context = { ...this.memory.context, ...options.context };
    }

    // Build chat request with context injection
    const chatRequest: ChatCompletionRequest = {
      model: this.config.model,
      messages: this.getMessagesWithContext(),
      temperature: options?.temperature ?? this.config.temperature ?? 0.7,
      max_tokens: options?.maxTokens ?? this.config.maxTokens,
    };

    try {
      const response = await this.chatApi.createChatCompletion(chatRequest);
      const assistantMessage = response.choices[0]?.message;

      if (assistantMessage != null) {
        // Add assistant response to memory
        this.addMessage({
          role: ChatMessageRole.ASSISTANT,
          content: assistantMessage.answer ?? assistantMessage.content ?? '',
        });

        // Check for tool calls
        const toolCalls = await this.extractToolCalls(assistantMessage.content ?? '');

        return {
          message: assistantMessage.answer ?? assistantMessage.content ?? '',
          toolCalls,
          sessionId: this.memory.sessionId,
          context: this.memory.context,
          thinkBlock: (response.choices[0] as { thinkBlock?: string })?.thinkBlock,
        };
      }

      throw new Error('No response from model');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Agent chat failed: ${errorMessage}`);
    }
  }

  /**
   * Add context to the agent's memory
   */
  public addContext(key: string, value: unknown): void {
    this.memory.context[key] = value;
  }

  /**
   * Get current context
   */
  public getContext(): Record<string, unknown> {
    return { ...this.memory.context };
  }

  /**
   * Register a tool for the agent
   */
  public registerTool(tool: AgentTool): void {
    this.tools.set(tool.name, tool);
  }

  /**
   * Execute a tool by name
   */
  public async executeTool(name: string, args: Record<string, unknown>): Promise<unknown> {
    const tool = this.tools.get(name);
    if (!tool) {
      throw new Error(`Tool '${name}' not found`);
    }
    return await tool.handler(args);
  }

  /**
   * Clear conversation memory but keep context
   */
  public clearMemory(): void {
    const systemMessages = this.memory.messages.filter(m => m.role === ChatMessageRole.SYSTEM);
    this.memory.messages = systemMessages;
  }

  /**
   * Get conversation history
   */
  public getHistory(): ChatMessage[] {
    return [...this.memory.messages];
  }

  /**
   * Get agent info
   */
  public getInfo(): AgentInfo {
    return {
      name: this.config.name,
      model: this.config.model,
      sessionId: this.memory.sessionId,
      messageCount: this.memory.messages.length,
      toolCount: this.tools.size,
      context: this.memory.context,
    };
  }

  private addSystemMessage(content: string): void {
    this.addMessage({
      role: ChatMessageRole.SYSTEM,
      content,
    });
  }

  private addMessage(message: ChatMessage): void {
    this.memory.messages.push(message);

    // Apply memory limit if configured
    if (
      this.config.memoryLimit != null &&
      this.config.memoryLimit > 0 &&
      this.memory.messages.length > this.config.memoryLimit
    ) {
      // Keep system messages and recent messages
      const systemMessages = this.memory.messages.filter(m => m.role === ChatMessageRole.SYSTEM);
      const recentMessages = this.memory.messages
        .filter(m => m.role !== ChatMessageRole.SYSTEM)
        .slice(-this.config.memoryLimit + systemMessages.length);

      this.memory.messages = [...systemMessages, ...recentMessages];
    }
  }

  private getMessagesWithContext(): ChatMessage[] {
    // Inject context into system message if needed
    const messages = [...this.memory.messages];

    // Add context information to the last system message or create one
    if (Object.keys(this.memory.context).length > 0) {
      const contextString = `\n\nCurrent Context: ${JSON.stringify(this.memory.context, null, 2)}`;

      const lastSystemIndex = messages.map(m => m.role).lastIndexOf(ChatMessageRole.SYSTEM);
      if (lastSystemIndex >= 0) {
        messages[lastSystemIndex] = {
          ...messages[lastSystemIndex],
          content: (messages[lastSystemIndex].content ?? '') + contextString,
        };
      } else {
        messages.unshift({
          role: ChatMessageRole.SYSTEM,
          content: `Context: ${contextString}`,
        });
      }
    }

    return messages;
  }

  private async extractToolCalls(content: string): Promise<ToolCall[]> {
    // Extract tool calls from response content
    // This could be enhanced to parse specific patterns or function call syntax
    const toolCalls: ToolCall[] = [];

    // Simple regex to find tool patterns like "TOOL:functionName(args)"
    const toolPattern = /TOOL:(\w+)\((.*?)\)/g;
    let match;

    while ((match = toolPattern.exec(content)) !== null) {
      try {
        const toolName = match[1];
        const argsString = match[2];
        const args: Record<string, unknown> =
          argsString.length > 0 ? (JSON.parse(argsString) as Record<string, unknown>) : {};

        if (this.tools.has(toolName)) {
          const result = await this.executeTool(toolName, args);
          toolCalls.push({
            name: toolName,
            args,
            result,
          });
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.warn(`Failed to execute tool call: ${errorMessage}`);
      }
    }

    return toolCalls;
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export interface AgentResponse {
  message: string;
  toolCalls: ToolCall[];
  sessionId: string;
  context: Record<string, unknown>;
  thinkBlock?: string;
}

export interface ToolCall {
  name: string;
  args: Record<string, unknown>;
  result: unknown;
}

export interface AgentInfo {
  name: string;
  model: string;
  sessionId: string;
  messageCount: number;
  toolCount: number;
  context: Record<string, unknown>;
}
