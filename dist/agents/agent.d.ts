import { VeniceCore } from '../core/venice-core';
import { ChatMessage } from '../model/chat';
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
export declare class VeniceAgent {
    private core;
    private chatApi;
    private config;
    private memory;
    private tools;
    constructor(core: VeniceCore, config: AgentConfig);
    /**
     * Send a message to the agent and get a response
     */
    chat(message: string, options?: {
        temperature?: number;
        maxTokens?: number;
        context?: Record<string, unknown>;
    }): Promise<AgentResponse>;
    /**
     * Add context to the agent's memory
     */
    addContext(key: string, value: unknown): void;
    /**
     * Get current context
     */
    getContext(): Record<string, unknown>;
    /**
     * Register a tool for the agent
     */
    registerTool(tool: AgentTool): void;
    /**
     * Execute a tool by name
     */
    executeTool(name: string, args: Record<string, unknown>): Promise<unknown>;
    /**
     * Clear conversation memory but keep context
     */
    clearMemory(): void;
    /**
     * Get conversation history
     */
    getHistory(): ChatMessage[];
    /**
     * Get agent info
     */
    getInfo(): AgentInfo;
    private addSystemMessage;
    private addMessage;
    private getMessagesWithContext;
    private extractToolCalls;
    private generateSessionId;
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
