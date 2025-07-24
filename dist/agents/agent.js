"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VeniceAgent = void 0;
const chat_1 = require("../api/impl/chat");
const chat_2 = require("../model/chat");
class VeniceAgent {
    constructor(core, config) {
        this.core = core;
        this.chatApi = new chat_1.ChatApi(core);
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
    async chat(message, options) {
        // Add user message to memory
        this.addMessage({
            role: chat_2.ChatMessageRole.USER,
            content: message,
        });
        // Merge any additional context
        if (options?.context) {
            this.memory.context = { ...this.memory.context, ...options.context };
        }
        // Build chat request with context injection
        const chatRequest = {
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
                    role: chat_2.ChatMessageRole.ASSISTANT,
                    content: assistantMessage.answer ?? assistantMessage.content ?? '',
                });
                // Check for tool calls
                const toolCalls = await this.extractToolCalls(assistantMessage.content ?? '');
                return {
                    message: assistantMessage.answer ?? assistantMessage.content ?? '',
                    toolCalls,
                    sessionId: this.memory.sessionId,
                    context: this.memory.context,
                    thinkBlock: response.choices[0]?.thinkBlock,
                };
            }
            throw new Error('No response from model');
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            throw new Error(`Agent chat failed: ${errorMessage}`);
        }
    }
    /**
     * Add context to the agent's memory
     */
    addContext(key, value) {
        this.memory.context[key] = value;
    }
    /**
     * Get current context
     */
    getContext() {
        return { ...this.memory.context };
    }
    /**
     * Register a tool for the agent
     */
    registerTool(tool) {
        this.tools.set(tool.name, tool);
    }
    /**
     * Execute a tool by name
     */
    async executeTool(name, args) {
        const tool = this.tools.get(name);
        if (!tool) {
            throw new Error(`Tool '${name}' not found`);
        }
        return await tool.handler(args);
    }
    /**
     * Clear conversation memory but keep context
     */
    clearMemory() {
        const systemMessages = this.memory.messages.filter(m => m.role === chat_2.ChatMessageRole.SYSTEM);
        this.memory.messages = systemMessages;
    }
    /**
     * Get conversation history
     */
    getHistory() {
        return [...this.memory.messages];
    }
    /**
     * Get agent info
     */
    getInfo() {
        return {
            name: this.config.name,
            model: this.config.model,
            sessionId: this.memory.sessionId,
            messageCount: this.memory.messages.length,
            toolCount: this.tools.size,
            context: this.memory.context,
        };
    }
    addSystemMessage(content) {
        this.addMessage({
            role: chat_2.ChatMessageRole.SYSTEM,
            content,
        });
    }
    addMessage(message) {
        this.memory.messages.push(message);
        // Apply memory limit if configured
        if (this.config.memoryLimit != null &&
            this.config.memoryLimit > 0 &&
            this.memory.messages.length > this.config.memoryLimit) {
            // Keep system messages and recent messages
            const systemMessages = this.memory.messages.filter(m => m.role === chat_2.ChatMessageRole.SYSTEM);
            const recentMessages = this.memory.messages
                .filter(m => m.role !== chat_2.ChatMessageRole.SYSTEM)
                .slice(-this.config.memoryLimit + systemMessages.length);
            this.memory.messages = [...systemMessages, ...recentMessages];
        }
    }
    getMessagesWithContext() {
        // Inject context into system message if needed
        const messages = [...this.memory.messages];
        // Add context information to the last system message or create one
        if (Object.keys(this.memory.context).length > 0) {
            const contextString = `\n\nCurrent Context: ${JSON.stringify(this.memory.context, null, 2)}`;
            const lastSystemIndex = messages.map(m => m.role).lastIndexOf(chat_2.ChatMessageRole.SYSTEM);
            if (lastSystemIndex >= 0) {
                messages[lastSystemIndex] = {
                    ...messages[lastSystemIndex],
                    content: (messages[lastSystemIndex].content ?? '') + contextString,
                };
            }
            else {
                messages.unshift({
                    role: chat_2.ChatMessageRole.SYSTEM,
                    content: `Context: ${contextString}`,
                });
            }
        }
        return messages;
    }
    async extractToolCalls(content) {
        // Extract tool calls from response content
        // This could be enhanced to parse specific patterns or function call syntax
        const toolCalls = [];
        // Simple regex to find tool patterns like "TOOL:functionName(args)"
        const toolPattern = /TOOL:(\w+)\((.*?)\)/g;
        let match;
        while ((match = toolPattern.exec(content)) !== null) {
            try {
                const toolName = match[1];
                const argsString = match[2];
                const args = argsString.length > 0 ? JSON.parse(argsString) : {};
                if (this.tools.has(toolName)) {
                    const result = await this.executeTool(toolName, args);
                    toolCalls.push({
                        name: toolName,
                        args,
                        result,
                    });
                }
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                console.warn(`Failed to execute tool call: ${errorMessage}`);
            }
        }
        return toolCalls;
    }
    generateSessionId() {
        return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
}
exports.VeniceAgent = VeniceAgent;
