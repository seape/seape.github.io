---
title: "第6章：Prompts模板系统"
date: 2025-09-01
icon: circle-dot
author: Haiyue
category:
  - aws
star: false
---
# 第6章：Prompts模板系统

## 学习目标
1. 理解Prompts的作用和设计原则
2. 学会创建可复用的prompt模板
3. 掌握参数化prompt的实现
4. 学习prompt的版本管理和优化
5. 实现动态prompt生成系统

## 1. Prompts概念概述

### 1.1 什么是Prompts
Prompts是MCP协议中用于向AI模型提供预定义提示模板的机制。它们的主要作用是：
- 提供结构化的提示模板
- 支持参数化和动态内容生成
- 实现提示的复用和标准化
- 简化复杂任务的提示构建

### 1.2 Prompts的优势
1. **一致性** - 确保相同任务使用相同的提示格式
2. **可维护性** - 集中管理和更新提示模板
3. **参数化** - 支持动态参数填充
4. **复用性** - 模板可在多个场景中复用
5. **版本控制** - 支持提示模板的版本管理

## 2. Prompt结构和类型

### 2.1 Prompt基本结构
```typescript
interface Prompt {
  name: string;           // 提示名称
  description?: string;   // 提示描述
  arguments?: Array<{     // 参数定义
    name: string;
    description?: string;
    required?: boolean;
  }>;
}

interface PromptMessage {
  role: "user" | "assistant" | "system";
  content: {
    type: "text" | "image";
    text?: string;
    image?: string;  // base64 encoded
  };
}

interface GetPromptResult {
  messages: PromptMessage[];
  description?: string;
}
```

### 2.2 Prompt类型分类
1. **系统提示** - 设定AI角色和行为规则
2. **任务提示** - 定义具体任务的执行模板
3. **对话提示** - 结构化对话流程模板
4. **分析提示** - 数据分析和处理模板
5. **创作提示** - 内容生成和创作模板

## 3. 基础Prompt系统实现

### 3.1 Prompt管理器基础架构
```typescript
import { Server } from "@modelcontextprotocol/sdk/server/index.js";

interface PromptTemplate {
  name: string;
  description: string;
  arguments: PromptArgument[];
  template: string;
  version: string;
  category: string;
}

interface PromptArgument {
  name: string;
  description: string;
  type: "string" | "number" | "boolean" | "array" | "object";
  required: boolean;
  default?: any;
}

class PromptManager {
  private server: Server;
  private templates: Map<string, PromptTemplate> = new Map();

  constructor(server: Server) {
    this.server = server;
    this.setupPromptHandlers();
    this.initializeDefaultTemplates();
  }

  private setupPromptHandlers() {
    // 列出可用提示
    this.server.setRequestHandler("prompts/list", async () => {
      return {
        prompts: Array.from(this.templates.values()).map(template => ({
          name: template.name,
          description: template.description,
          arguments: template.arguments
        }))
      };
    });

    // 获取特定提示
    this.server.setRequestHandler("prompts/get", async (request) => {
      const { name, arguments: args } = request.params;
      return await this.getPrompt(name, args || {});
    });
  }

  async getPrompt(name: string, args: Record<string, any>): Promise<GetPromptResult> {
    const template = this.templates.get(name);
    if (!template) {
      throw new Error(`Prompt template not found: ${name}`);
    }

    // 验证参数
    this.validateArguments(template, args);

    // 渲染模板
    const renderedContent = this.renderTemplate(template.template, args);

    return {
      description: template.description,
      messages: [{
        role: "user",
        content: {
          type: "text",
          text: renderedContent
        }
      }]
    };
  }

  private validateArguments(template: PromptTemplate, args: Record<string, any>) {
    for (const arg of template.arguments) {
      if (arg.required && !(arg.name in args)) {
        throw new Error(`Required argument '${arg.name}' is missing`);
      }

      if (arg.name in args) {
        this.validateArgumentType(arg, args[arg.name]);
      }
    }
  }

  private validateArgumentType(arg: PromptArgument, value: any) {
    switch (arg.type) {
      case "string":
        if (typeof value !== "string") {
          throw new Error(`Argument '${arg.name}' must be a string`);
        }
        break;
      case "number":
        if (typeof value !== "number") {
          throw new Error(`Argument '${arg.name}' must be a number`);
        }
        break;
      case "boolean":
        if (typeof value !== "boolean") {
          throw new Error(`Argument '${arg.name}' must be a boolean`);
        }
        break;
      case "array":
        if (!Array.isArray(value)) {
          throw new Error(`Argument '${arg.name}' must be an array`);
        }
        break;
    }
  }

  private renderTemplate(template: string, args: Record<string, any>): string {
    let rendered = template;
    
    // 简单的模板渲染 - 替换 {{variableName}} 格式的变量
    for (const [key, value] of Object.entries(args)) {
      const regex = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g');
      rendered = rendered.replace(regex, String(value));
    }

    return rendered;
  }

  private initializeDefaultTemplates() {
    // 初始化一些默认模板
    this.addTemplate({
      name: "code_review",
      description: "Code review prompt template",
      version: "1.0.0",
      category: "development",
      arguments: [
        {
          name: "code",
          description: "Code to review",
          type: "string",
          required: true
        },
        {
          name: "language",
          description: "Programming language",
          type: "string",
          required: true
        }
      ],
      template: `Please review the following {{language}} code:

\`\`\`{{language}}
{{code}}
\`\`\`

Please provide feedback on:
1. Code quality and best practices
2. Potential bugs or issues
3. Performance considerations
4. Suggestions for improvement`
    });
  }

  addTemplate(template: PromptTemplate) {
    this.templates.set(template.name, template);
  }
}
```

### 3.2 高级模板渲染引擎
```typescript
import Handlebars from "handlebars";

class AdvancedTemplateRenderer {
  private handlebars: typeof Handlebars;

  constructor() {
    this.handlebars = Handlebars.create();
    this.registerHelpers();
  }

  private registerHelpers() {
    // 条件判断助手
    this.handlebars.registerHelper("if_eq", function(a, b, options) {
      return a === b ? options.fn(this) : options.inverse(this);
    });

    // 循环索引助手
    this.handlebars.registerHelper("index_plus_one", function(index) {
      return index + 1;
    });

    // 日期格式化助手
    this.handlebars.registerHelper("format_date", function(date, format) {
      return new Date(date).toLocaleDateString();
    });

    // 数组长度助手
    this.handlebars.registerHelper("length", function(array) {
      return Array.isArray(array) ? array.length : 0;
    });

    // JSON序列化助手
    this.handlebars.registerHelper("json", function(obj) {
      return JSON.stringify(obj, null, 2);
    });
  }

  render(template: string, context: Record<string, any>): string {
    const compiledTemplate = this.handlebars.compile(template);
    return compiledTemplate(context);
  }
}

// 使用高级渲染器的Prompt管理器
class EnhancedPromptManager extends PromptManager {
  private renderer: AdvancedTemplateRenderer;

  constructor(server: Server) {
    super(server);
    this.renderer = new AdvancedTemplateRenderer();
  }

  protected renderTemplate(template: string, args: Record<string, any>): string {
    return this.renderer.render(template, args);
  }
}
```

## 4. 复杂Prompt模板示例

### 4.1 代码生成模板
```typescript
const codeGenerationTemplate: PromptTemplate = {
  name: "code_generation",
  description: "Generate code based on specifications",
  version: "1.0.0",
  category: "development",
  arguments: [
    {
      name: "language",
      description: "Programming language",
      type: "string",
      required: true
    },
    {
      name: "functionality",
      description: "Description of required functionality",
      type: "string",
      required: true
    },
    {
      name: "framework",
      description: "Framework or library to use",
      type: "string",
      required: false
    },
    {
      name: "constraints",
      description: "Specific constraints or requirements",
      type: "array",
      required: false,
      default: []
    }
  ],
  template: `Generate {{language}} code for the following functionality:

**Functionality**: {{functionality}}

{{#if framework}}
**Framework**: {{framework}}
{{/if}}

{{#if constraints}}
**Constraints**:
{{#each constraints}}
- {{this}}
{{/each}}
{{/if}}

Please provide:
1. Clean, well-commented code
2. Error handling where appropriate
3. Brief explanation of the approach
4. Usage examples

Code:
`
};
```

### 4.2 数据分析模板
```typescript
const dataAnalysisTemplate: PromptTemplate = {
  name: "data_analysis",
  description: "Analyze data and provide insights",
  version: "1.0.0",
  category: "analysis",
  arguments: [
    {
      name: "data",
      description: "Data to analyze (JSON format)",
      type: "string",
      required: true
    },
    {
      name: "analysis_type",
      description: "Type of analysis to perform",
      type: "string",
      required: true
    },
    {
      name: "metrics",
      description: "Specific metrics to calculate",
      type: "array",
      required: false,
      default: []
    }
  ],
  template: `Please analyze the following data:

\`\`\`json
{{data}}
\`\`\`

**Analysis Type**: {{analysis_type}}

{{#if metrics}}
**Focus on these metrics**:
{{#each metrics}}
- {{this}}
{{/each}}
{{/if}}

Please provide:
1. Key findings and patterns
2. Statistical summary
3. Visualizations suggestions
4. Actionable insights
5. Recommendations

Analysis:
`
};
```

### 4.3 多轮对话模板
```typescript
const conversationTemplate: PromptTemplate = {
  name: "conversation_flow",
  description: "Structure multi-turn conversation",
  version: "1.0.0",
  category: "conversation",
  arguments: [
    {
      name: "role",
      description: "AI assistant role",
      type: "string",
      required: true
    },
    {
      name: "context",
      description: "Conversation context",
      type: "string",
      required: true
    },
    {
      name: "previous_messages",
      description: "Previous conversation messages",
      type: "array",
      required: false,
      default: []
    }
  ],
  template: `You are a {{role}}.

**Context**: {{context}}

{{#if previous_messages}}
**Previous conversation**:
{{#each previous_messages}}
{{#if_eq role "user"}}
User: {{content}}
{{else}}
Assistant: {{content}}
{{/if_eq}}
{{/each}}
{{/if}}

Please continue the conversation naturally, maintaining consistency with your role and the established context.
`
};
```

## 5. 动态Prompt系统

### 5.1 条件化Prompt生成
```typescript
interface ConditionalPrompt {
  name: string;
  conditions: PromptCondition[];
  templates: Record<string, string>;
  default_template: string;
}

interface PromptCondition {
  field: string;
  operator: "eq" | "neq" | "gt" | "lt" | "contains" | "in";
  value: any;
  template_key: string;
}

class ConditionalPromptManager {
  private conditionalPrompts: Map<string, ConditionalPrompt> = new Map();

  addConditionalPrompt(prompt: ConditionalPrompt) {
    this.conditionalPrompts.set(prompt.name, prompt);
  }

  generatePrompt(name: string, args: Record<string, any>): string {
    const conditionalPrompt = this.conditionalPrompts.get(name);
    if (!conditionalPrompt) {
      throw new Error(`Conditional prompt not found: ${name}`);
    }

    // 评估条件
    for (const condition of conditionalPrompt.conditions) {
      if (this.evaluateCondition(condition, args)) {
        return conditionalPrompt.templates[condition.template_key];
      }
    }

    return conditionalPrompt.default_template;
  }

  private evaluateCondition(condition: PromptCondition, args: Record<string, any>): boolean {
    const fieldValue = args[condition.field];
    
    switch (condition.operator) {
      case "eq":
        return fieldValue === condition.value;
      case "neq":
        return fieldValue !== condition.value;
      case "gt":
        return fieldValue > condition.value;
      case "lt":
        return fieldValue < condition.value;
      case "contains":
        return String(fieldValue).includes(String(condition.value));
      case "in":
        return Array.isArray(condition.value) && condition.value.includes(fieldValue);
      default:
        return false;
    }
  }
}
```

### 5.2 上下文感知Prompt系统
```typescript
interface ContextAwarePrompt {
  name: string;
  base_template: string;
  context_modifiers: ContextModifier[];
}

interface ContextModifier {
  context_type: string;
  context_value: any;
  modification: PromptModification;
}

interface PromptModification {
  type: "prepend" | "append" | "replace" | "insert";
  position?: string;
  content: string;
}

class ContextAwarePromptManager {
  private contextPrompts: Map<string, ContextAwarePrompt> = new Map();
  private currentContext: Map<string, any> = new Map();

  setContext(key: string, value: any) {
    this.currentContext.set(key, value);
  }

  generateContextualPrompt(name: string, args: Record<string, any>): string {
    const contextPrompt = this.contextPrompts.get(name);
    if (!contextPrompt) {
      throw new Error(`Context-aware prompt not found: ${name}`);
    }

    let prompt = contextPrompt.base_template;

    // 应用上下文修改器
    for (const modifier of contextPrompt.context_modifiers) {
      if (this.shouldApplyModifier(modifier)) {
        prompt = this.applyModification(prompt, modifier.modification);
      }
    }

    return prompt;
  }

  private shouldApplyModifier(modifier: ContextModifier): boolean {
    const contextValue = this.currentContext.get(modifier.context_type);
    return contextValue === modifier.context_value;
  }

  private applyModification(prompt: string, modification: PromptModification): string {
    switch (modification.type) {
      case "prepend":
        return modification.content + "\n\n" + prompt;
      case "append":
        return prompt + "\n\n" + modification.content;
      case "replace":
        return modification.content;
      case "insert":
        if (modification.position) {
          return prompt.replace(modification.position, modification.content);
        }
        return prompt;
      default:
        return prompt;
    }
  }
}
```

## 6. Prompt版本管理和优化

### 6.1 版本控制系统
```typescript
interface PromptVersion {
  version: string;
  template: string;
  changelog: string;
  deprecated: boolean;
  created_at: Date;
}

class PromptVersionManager {
  private versions: Map<string, Map<string, PromptVersion>> = new Map();

  addVersion(promptName: string, version: PromptVersion) {
    if (!this.versions.has(promptName)) {
      this.versions.set(promptName, new Map());
    }
    
    const promptVersions = this.versions.get(promptName)!;
    promptVersions.set(version.version, version);
  }

  getVersion(promptName: string, version: string): PromptVersion | undefined {
    return this.versions.get(promptName)?.get(version);
  }

  getLatestVersion(promptName: string): PromptVersion | undefined {
    const promptVersions = this.versions.get(promptName);
    if (!promptVersions) return undefined;

    const versions = Array.from(promptVersions.values())
      .filter(v => !v.deprecated)
      .sort((a, b) => b.created_at.getTime() - a.created_at.getTime());

    return versions[0];
  }

  deprecateVersion(promptName: string, version: string) {
    const promptVersion = this.getVersion(promptName, version);
    if (promptVersion) {
      promptVersion.deprecated = true;
    }
  }

  listVersions(promptName: string): PromptVersion[] {
    const promptVersions = this.versions.get(promptName);
    return promptVersions ? Array.from(promptVersions.values()) : [];
  }
}
```

### 6.2 A/B测试系统
```typescript
interface PromptVariant {
  name: string;
  template: string;
  weight: number;  // 0-100
  metrics: PromptMetrics;
}

interface PromptMetrics {
  usage_count: number;
  success_rate: number;
  average_response_time: number;
  user_satisfaction: number;
}

class PromptABTester {
  private variants: Map<string, PromptVariant[]> = new Map();
  private random = Math.random;

  addVariant(promptName: string, variant: PromptVariant) {
    if (!this.variants.has(promptName)) {
      this.variants.set(promptName, []);
    }
    
    this.variants.get(promptName)!.push(variant);
  }

  selectVariant(promptName: string): PromptVariant | undefined {
    const variants = this.variants.get(promptName);
    if (!variants || variants.length === 0) return undefined;

    const totalWeight = variants.reduce((sum, v) => sum + v.weight, 0);
    const randomValue = this.random() * totalWeight;
    
    let currentWeight = 0;
    for (const variant of variants) {
      currentWeight += variant.weight;
      if (randomValue <= currentWeight) {
        variant.metrics.usage_count++;
        return variant;
      }
    }

    return variants[0];
  }

  recordSuccess(promptName: string, variantName: string) {
    const variants = this.variants.get(promptName);
    const variant = variants?.find(v => v.name === variantName);
    if (variant) {
      variant.metrics.success_rate = this.calculateSuccessRate(variant);
    }
  }

  private calculateSuccessRate(variant: PromptVariant): number {
    // 实现成功率计算逻辑
    return variant.metrics.success_rate; // 简化实现
  }

  getBestPerformingVariant(promptName: string): PromptVariant | undefined {
    const variants = this.variants.get(promptName);
    if (!variants) return undefined;

    return variants.reduce((best, current) => {
      const bestScore = this.calculateVariantScore(best);
      const currentScore = this.calculateVariantScore(current);
      return currentScore > bestScore ? current : best;
    });
  }

  private calculateVariantScore(variant: PromptVariant): number {
    const { success_rate, user_satisfaction, usage_count } = variant.metrics;
    
    // 加权评分算法
    return (success_rate * 0.4) + 
           (user_satisfaction * 0.4) + 
           (Math.log(usage_count + 1) * 0.2);
  }
}
```

## 7. 完整Prompt Server实现

### 7.1 企业级Prompt Server
```typescript
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

class EnterprisePromptServer {
  private server: Server;
  private promptManager: EnhancedPromptManager;
  private versionManager: PromptVersionManager;
  private abTester: PromptABTester;
  private conditionalManager: ConditionalPromptManager;

  constructor() {
    this.server = new Server(
      {
        name: "enterprise-prompt-server",
        version: "1.0.0"
      },
      {
        capabilities: {
          prompts: {}
        }
      }
    );

    this.promptManager = new EnhancedPromptManager(this.server);
    this.versionManager = new PromptVersionManager();
    this.abTester = new PromptABTester();
    this.conditionalManager = new ConditionalPromptManager();

    this.setupAdvancedHandlers();
    this.loadPromptLibrary();
  }

  private setupAdvancedHandlers() {
    // 获取特定版本的提示
    this.server.setRequestHandler("prompts/get_version", async (request) => {
      const { name, version, arguments: args } = request.params;
      
      const promptVersion = this.versionManager.getVersion(name, version);
      if (!promptVersion) {
        throw new Error(`Prompt version not found: ${name}@${version}`);
      }

      return {
        description: `${name} (version ${version})`,
        messages: [{
          role: "user",
          content: {
            type: "text",
            text: this.renderTemplate(promptVersion.template, args || {})
          }
        }]
      };
    });

    // A/B测试变体选择
    this.server.setRequestHandler("prompts/get_variant", async (request) => {
      const { name, arguments: args } = request.params;
      
      const variant = this.abTester.selectVariant(name);
      if (!variant) {
        throw new Error(`No variants available for prompt: ${name}`);
      }

      return {
        description: `${name} (variant: ${variant.name})`,
        messages: [{
          role: "user",
          content: {
            type: "text",
            text: this.renderTemplate(variant.template, args || {})
          }
        }],
        metadata: {
          variant: variant.name,
          usage_count: variant.metrics.usage_count
        }
      };
    });

    // 条件化提示生成
    this.server.setRequestHandler("prompts/get_conditional", async (request) => {
      const { name, arguments: args } = request.params;
      
      const template = this.conditionalManager.generatePrompt(name, args || {});
      
      return {
        description: `${name} (conditional)`,
        messages: [{
          role: "user",
          content: {
            type: "text",
            text: this.renderTemplate(template, args || {})
          }
        }]
      };
    });
  }

  private loadPromptLibrary() {
    // 加载提示模板库
    const templates = [
      codeGenerationTemplate,
      dataAnalysisTemplate,
      conversationTemplate,
      // 添加更多模板...
    ];

    templates.forEach(template => {
      this.promptManager.addTemplate(template);
      
      // 添加版本信息
      this.versionManager.addVersion(template.name, {
        version: template.version,
        template: template.template,
        changelog: `Initial version of ${template.name}`,
        deprecated: false,
        created_at: new Date()
      });
    });
  }

  private renderTemplate(template: string, args: Record<string, any>): string {
    return this.promptManager.renderTemplate(template, args);
  }

  async start() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("Enterprise Prompt Server running on stdio");
  }
}

// 启动服务器
const server = new EnterprisePromptServer();
server.start().catch(console.error);
```

## 8. 最佳实践

### 8.1 Prompt设计原则
1. **明确性** - 指令清晰明确，避免歧义
2. **结构化** - 使用清晰的格式和分段
3. **上下文** - 提供足够的背景信息
4. **示例** - 包含输入输出示例
5. **约束** - 明确输出格式和限制

### 8.2 模板组织策略
1. **分类管理** - 按功能域分类组织
2. **命名规范** - 使用一致的命名约定
3. **参数标准化** - 统一参数命名和类型
4. **文档完整** - 详细的模板文档说明
5. **测试覆盖** - 全面的模板测试用例

### 8.3 性能优化
1. **模板缓存** - 缓存编译后的模板
2. **懒加载** - 按需加载模板内容
3. **压缩存储** - 压缩大型模板内容
4. **批量操作** - 支持批量模板处理
5. **异步渲染** - 异步模板渲染处理

## 小结

通过本章学习，我们掌握了：
- Prompts的基本概念和架构设计
- 如何实现灵活的模板系统
- 动态和条件化提示生成
- 版本管理和A/B测试机制
- 企业级Prompt Server的完整实现

Prompt系统为MCP Server提供了强大的提示模板能力，使AI模型能够获得结构化、一致的指令，是构建高质量AI应用的重要组件。