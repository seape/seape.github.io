---
title: "第9章：安全性和权限控制"
date: 2025-09-01
icon: circle-dot
author: Haiyue
category:
  - aws
star: false
---
# 第9章：安全性和权限控制

## 学习目标
1. 理解MCP的安全模型和威胁防护
2. 实现身份验证和授权机制
3. 掌握资源访问权限控制
4. 学习输入验证和数据净化
5. 实现安全审计和监控

## 1. MCP安全威胁模型

### 1.1 潜在安全威胁
```typescript
enum SecurityThreat {
  UNAUTHORIZED_ACCESS = "unauthorized_access",     // 未授权访问
  PRIVILEGE_ESCALATION = "privilege_escalation",   // 权限提升
  DATA_INJECTION = "data_injection",               // 数据注入
  RESOURCE_EXHAUSTION = "resource_exhaustion",     // 资源耗尽
  INFORMATION_DISCLOSURE = "info_disclosure",      // 信息泄露
  REPLAY_ATTACK = "replay_attack",                 // 重放攻击
  MALICIOUS_PAYLOAD = "malicious_payload",         // 恶意载荷
  SYSTEM_COMPROMISE = "system_compromise"          // 系统妥协
}

interface ThreatAssessment {
  threat: SecurityThreat;
  severity: "low" | "medium" | "high" | "critical";
  likelihood: "rare" | "unlikely" | "possible" | "likely";
  impact: string;
  mitigations: string[];
}

class SecurityThreatAnalyzer {
  private threats: ThreatAssessment[] = [
    {
      threat: SecurityThreat.UNAUTHORIZED_ACCESS,
      severity: "high",
      likelihood: "likely",
      impact: "Unauthorized users could access sensitive resources and tools",
      mitigations: [
        "Implement strong authentication",
        "Use role-based access control",
        "Enable audit logging"
      ]
    },
    {
      threat: SecurityThreat.DATA_INJECTION,
      severity: "critical",
      likelihood: "possible",
      impact: "Malicious data could be injected into system operations",
      mitigations: [
        "Input validation and sanitization",
        "Parameterized queries",
        "Output encoding"
      ]
    }
    // 更多威胁评估...
  ];

  getThreatAssessments(): ThreatAssessment[] {
    return this.threats;
  }

  getHighRiskThreats(): ThreatAssessment[] {
    return this.threats.filter(t => 
      t.severity === "high" || t.severity === "critical"
    );
  }
}
```

### 1.2 安全架构设计
```typescript
interface SecurityArchitecture {
  layers: {
    authentication: AuthenticationLayer;
    authorization: AuthorizationLayer;
    validation: ValidationLayer;
    encryption: EncryptionLayer;
    auditing: AuditingLayer;
  };
  policies: SecurityPolicy[];
  controls: SecurityControl[];
}

interface SecurityPolicy {
  name: string;
  description: string;
  rules: PolicyRule[];
  enforcement: "strict" | "lenient" | "advisory";
}

interface SecurityControl {
  id: string;
  type: "preventive" | "detective" | "corrective";
  description: string;
  implementation: () => Promise<boolean>;
}
```

## 2. 身份验证系统

### 2.1 多种认证方式支持
```typescript
enum AuthenticationMethod {
  API_KEY = "api_key",
  JWT = "jwt", 
  OAUTH2 = "oauth2",
  CERTIFICATE = "certificate",
  BASIC_AUTH = "basic_auth"
}

interface AuthenticationCredential {
  method: AuthenticationMethod;
  value: string;
  metadata?: Record<string, any>;
}

interface AuthenticationResult {
  success: boolean;
  user?: AuthenticatedUser;
  error?: string;
  expiresAt?: Date;
}

interface AuthenticatedUser {
  id: string;
  username: string;
  roles: string[];
  permissions: string[];
  metadata: Record<string, any>;
}

abstract class AuthenticationProvider {
  abstract authenticate(credential: AuthenticationCredential): Promise<AuthenticationResult>;
  abstract validateToken(token: string): Promise<AuthenticationResult>;
  abstract refreshToken?(token: string): Promise<AuthenticationResult>;
}

class ApiKeyAuthProvider extends AuthenticationProvider {
  private apiKeys: Map<string, AuthenticatedUser> = new Map();
  private hasher: PasswordHasher;

  constructor(hasher: PasswordHasher) {
    super();
    this.hasher = hasher;
  }

  async authenticate(credential: AuthenticationCredential): Promise<AuthenticationResult> {
    if (credential.method !== AuthenticationMethod.API_KEY) {
      return { success: false, error: "Invalid authentication method" };
    }

    const apiKey = credential.value;
    const hashedKey = await this.hasher.hash(apiKey);
    const user = this.apiKeys.get(hashedKey);

    if (!user) {
      return { success: false, error: "Invalid API key" };
    }

    return { 
      success: true, 
      user,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24小时
    };
  }

  async validateToken(token: string): Promise<AuthenticationResult> {
    // API Key通常不过期，但可以检查是否被撤销
    return this.authenticate({ method: AuthenticationMethod.API_KEY, value: token });
  }

  addApiKey(apiKey: string, user: AuthenticatedUser): void {
    const hashedKey = this.hasher.hashSync(apiKey);
    this.apiKeys.set(hashedKey, user);
  }

  revokeApiKey(apiKey: string): void {
    const hashedKey = this.hasher.hashSync(apiKey);
    this.apiKeys.delete(hashedKey);
  }
}

class JWTAuthProvider extends AuthenticationProvider {
  private secretKey: string;
  private algorithm: string = "HS256";

  constructor(secretKey: string) {
    super();
    this.secretKey = secretKey;
  }

  async authenticate(credential: AuthenticationCredential): Promise<AuthenticationResult> {
    if (credential.method !== AuthenticationMethod.JWT) {
      return { success: false, error: "Invalid authentication method" };
    }

    try {
      const decoded = this.verifyJWT(credential.value);
      
      const user: AuthenticatedUser = {
        id: decoded.sub,
        username: decoded.username,
        roles: decoded.roles || [],
        permissions: decoded.permissions || [],
        metadata: decoded.metadata || {}
      };

      return {
        success: true,
        user,
        expiresAt: new Date(decoded.exp * 1000)
      };

    } catch (error) {
      return { success: false, error: "Invalid JWT token" };
    }
  }

  async validateToken(token: string): Promise<AuthenticationResult> {
    return this.authenticate({ method: AuthenticationMethod.JWT, value: token });
  }

  private verifyJWT(token: string): any {
    // 简化的JWT验证实现
    // 实际应用中应使用专业的JWT库如jsonwebtoken
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error("Invalid JWT format");
    }

    const header = JSON.parse(Buffer.from(parts[0], 'base64').toString());
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
    
    // 验证签名
    const signature = parts[2];
    const expectedSignature = this.signJWT(parts[0] + '.' + parts[1]);
    
    if (signature !== expectedSignature) {
      throw new Error("Invalid JWT signature");
    }

    // 检查过期时间
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      throw new Error("JWT token expired");
    }

    return payload;
  }

  private signJWT(data: string): string {
    // 简化的签名实现
    const crypto = require('crypto');
    return crypto.createHmac('sha256', this.secretKey)
      .update(data)
      .digest('base64url');
  }
}
```

### 2.2 密码安全处理
```typescript
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

interface PasswordPolicy {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  maxAge: number; // days
  historyCount: number; // prevent reusing last N passwords
}

class PasswordHasher {
  private saltRounds: number = 12;

  async hash(password: string): Promise<string> {
    return bcrypt.hash(password, this.saltRounds);
  }

  hashSync(password: string): string {
    return bcrypt.hashSync(password, this.saltRounds);
  }

  async verify(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  verifySync(password: string, hash: string): boolean {
    return bcrypt.compareSync(password, hash);
  }
}

class PasswordValidator {
  private policy: PasswordPolicy;

  constructor(policy: PasswordPolicy) {
    this.policy = policy;
  }

  validate(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (password.length < this.policy.minLength) {
      errors.push(`Password must be at least ${this.policy.minLength} characters long`);
    }

    if (this.policy.requireUppercase && !/[A-Z]/.test(password)) {
      errors.push("Password must contain at least one uppercase letter");
    }

    if (this.policy.requireLowercase && !/[a-z]/.test(password)) {
      errors.push("Password must contain at least one lowercase letter");
    }

    if (this.policy.requireNumbers && !/\d/.test(password)) {
      errors.push("Password must contain at least one number");
    }

    if (this.policy.requireSpecialChars && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push("Password must contain at least one special character");
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  generateSecurePassword(length: number = 16): string {
    const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    let password = "";
    
    for (let i = 0; i < length; i++) {
      const randomIndex = crypto.randomInt(0, charset.length);
      password += charset[randomIndex];
    }

    return password;
  }
}
```

## 3. 授权和权限控制

### 3.1 基于角色的访问控制(RBAC)
```typescript
interface Permission {
  resource: string;    // 资源类型，如 "tools", "resources", "prompts"
  action: string;      // 操作类型，如 "read", "write", "execute"
  conditions?: string[]; // 额外条件
}

interface Role {
  name: string;
  description: string;
  permissions: Permission[];
  inheritFrom?: string[];  // 继承其他角色
}

interface AccessRequest {
  user: AuthenticatedUser;
  resource: string;
  action: string;
  context?: Record<string, any>;
}

class RoleBasedAccessControl {
  private roles: Map<string, Role> = new Map();
  private userRoles: Map<string, string[]> = new Map();

  defineRole(role: Role): void {
    this.roles.set(role.name, role);
  }

  assignRole(userId: string, roleName: string): void {
    const currentRoles = this.userRoles.get(userId) || [];
    if (!currentRoles.includes(roleName)) {
      currentRoles.push(roleName);
      this.userRoles.set(userId, currentRoles);
    }
  }

  revokeRole(userId: string, roleName: string): void {
    const currentRoles = this.userRoles.get(userId) || [];
    const updatedRoles = currentRoles.filter(role => role !== roleName);
    this.userRoles.set(userId, updatedRoles);
  }

  checkAccess(request: AccessRequest): boolean {
    const userRoles = this.getUserEffectiveRoles(request.user.id);
    const requiredPermission: Permission = {
      resource: request.resource,
      action: request.action
    };

    return userRoles.some(role => 
      this.roleHasPermission(role, requiredPermission, request.context)
    );
  }

  private getUserEffectiveRoles(userId: string): Role[] {
    const roleNames = this.userRoles.get(userId) || [];
    const effectiveRoles: Role[] = [];

    for (const roleName of roleNames) {
      const role = this.roles.get(roleName);
      if (role) {
        effectiveRoles.push(role);
        // 递归添加继承的角色
        this.addInheritedRoles(role, effectiveRoles);
      }
    }

    return effectiveRoles;
  }

  private addInheritedRoles(role: Role, roles: Role[]): void {
    if (!role.inheritFrom) return;

    for (const inheritedRoleName of role.inheritFrom) {
      const inheritedRole = this.roles.get(inheritedRoleName);
      if (inheritedRole && !roles.includes(inheritedRole)) {
        roles.push(inheritedRole);
        this.addInheritedRoles(inheritedRole, roles);
      }
    }
  }

  private roleHasPermission(role: Role, required: Permission, context?: Record<string, any>): boolean {
    return role.permissions.some(permission => {
      if (permission.resource !== required.resource || permission.action !== required.action) {
        return false;
      }

      // 检查额外条件
      if (permission.conditions && context) {
        return this.evaluateConditions(permission.conditions, context);
      }

      return true;
    });
  }

  private evaluateConditions(conditions: string[], context: Record<string, any>): boolean {
    // 简化的条件评估实现
    return conditions.every(condition => {
      // 例如: "user.department == 'engineering'"
      const [left, operator, right] = condition.split(' ');
      const leftValue = this.getValueFromContext(left, context);
      const rightValue = right.replace(/['"]/g, '');

      switch (operator) {
        case '==':
          return leftValue === rightValue;
        case '!=':
          return leftValue !== rightValue;
        case 'in':
          return Array.isArray(leftValue) && leftValue.includes(rightValue);
        default:
          return false;
      }
    });
  }

  private getValueFromContext(path: string, context: Record<string, any>): any {
    return path.split('.').reduce((obj, key) => obj?.[key], context);
  }
}
```

### 3.2 细粒度权限控制
```typescript
interface ResourceAccessPolicy {
  resourceType: string;
  resourceId?: string;
  policy: {
    allow: Permission[];
    deny: Permission[];
    conditions?: AccessCondition[];
  };
}

interface AccessCondition {
  type: "time" | "ip" | "user_attribute" | "resource_attribute";
  operator: "equals" | "not_equals" | "in" | "not_in" | "greater_than" | "less_than";
  value: any;
}

class FinegrainedAccessControl {
  private policies: Map<string, ResourceAccessPolicy[]> = new Map();
  private rbac: RoleBasedAccessControl;

  constructor(rbac: RoleBasedAccessControl) {
    this.rbac = rbac;
  }

  addResourcePolicy(policy: ResourceAccessPolicy): void {
    const key = policy.resourceId || policy.resourceType;
    const policies = this.policies.get(key) || [];
    policies.push(policy);
    this.policies.set(key, policies);
  }

  checkResourceAccess(request: AccessRequest & { resourceId?: string }): boolean {
    // 首先检查RBAC权限
    if (!this.rbac.checkAccess(request)) {
      return false;
    }

    // 然后检查资源特定的策略
    const resourcePolicies = this.getApplicablePolicies(request.resource, request.resourceId);
    
    if (resourcePolicies.length === 0) {
      return true; // 没有特定策略，依赖RBAC结果
    }

    return this.evaluateResourcePolicies(resourcePolicies, request);
  }

  private getApplicablePolicies(resourceType: string, resourceId?: string): ResourceAccessPolicy[] {
    const policies: ResourceAccessPolicy[] = [];
    
    // 获取资源类型级别的策略
    const typePolicies = this.policies.get(resourceType) || [];
    policies.push(...typePolicies);

    // 获取特定资源实例的策略
    if (resourceId) {
      const instancePolicies = this.policies.get(resourceId) || [];
      policies.push(...instancePolicies);
    }

    return policies;
  }

  private evaluateResourcePolicies(policies: ResourceAccessPolicy[], request: AccessRequest): boolean {
    for (const policy of policies) {
      // 检查拒绝规则（优先级最高）
      if (this.matchesPermissions(policy.policy.deny, request)) {
        if (this.evaluateAccessConditions(policy.policy.conditions, request)) {
          return false;
        }
      }
    }

    // 检查允许规则
    for (const policy of policies) {
      if (this.matchesPermissions(policy.policy.allow, request)) {
        if (this.evaluateAccessConditions(policy.policy.conditions, request)) {
          return true;
        }
      }
    }

    return false;
  }

  private matchesPermissions(permissions: Permission[], request: AccessRequest): boolean {
    return permissions.some(permission =>
      permission.resource === request.resource && permission.action === request.action
    );
  }

  private evaluateAccessConditions(conditions: AccessCondition[] | undefined, request: AccessRequest): boolean {
    if (!conditions || conditions.length === 0) {
      return true;
    }

    return conditions.every(condition => this.evaluateCondition(condition, request));
  }

  private evaluateCondition(condition: AccessCondition, request: AccessRequest): boolean {
    let contextValue: any;

    switch (condition.type) {
      case "time":
        contextValue = new Date().getHours();
        break;
      case "ip":
        contextValue = request.context?.clientIp;
        break;
      case "user_attribute":
        contextValue = request.user.metadata[condition.value];
        break;
      case "resource_attribute":
        contextValue = request.context?.[condition.value];
        break;
      default:
        return false;
    }

    switch (condition.operator) {
      case "equals":
        return contextValue === condition.value;
      case "not_equals":
        return contextValue !== condition.value;
      case "in":
        return Array.isArray(condition.value) && condition.value.includes(contextValue);
      case "not_in":
        return Array.isArray(condition.value) && !condition.value.includes(contextValue);
      case "greater_than":
        return contextValue > condition.value;
      case "less_than":
        return contextValue < condition.value;
      default:
        return false;
    }
  }
}
```

## 4. 输入验证和数据净化

### 4.1 输入验证框架
```typescript
import { z } from 'zod';

interface ValidationRule {
  field: string;
  type: "string" | "number" | "boolean" | "array" | "object";
  required: boolean;
  constraints?: ValidationConstraint[];
}

interface ValidationConstraint {
  type: "min_length" | "max_length" | "pattern" | "range" | "enum" | "custom";
  value: any;
  message?: string;
}

class InputValidator {
  private schemas: Map<string, z.ZodSchema> = new Map();

  registerSchema(name: string, schema: z.ZodSchema): void {
    this.schemas.set(name, schema);
  }

  validate(schemaName: string, data: any): { valid: boolean; errors: string[]; data?: any } {
    const schema = this.schemas.get(schemaName);
    if (!schema) {
      return { valid: false, errors: [`Schema not found: ${schemaName}`] };
    }

    try {
      const validData = schema.parse(data);
      return { valid: true, errors: [], data: validData };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map(err => 
          `${err.path.join('.')}: ${err.message}`
        );
        return { valid: false, errors };
      }
      return { valid: false, errors: [error.message] };
    }
  }

  // 创建常用的验证schema
  createToolCallSchema(): z.ZodSchema {
    return z.object({
      name: z.string().min(1).max(100).regex(/^[a-zA-Z_][a-zA-Z0-9_]*$/),
      arguments: z.record(z.any()).optional()
    });
  }

  createResourceRequestSchema(): z.ZodSchema {
    return z.object({
      uri: z.string().url().or(z.string().regex(/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//)),
      method: z.enum(["GET", "POST", "PUT", "DELETE"]).optional()
    });
  }

  createPromptRequestSchema(): z.ZodSchema {
    return z.object({
      name: z.string().min(1).max(100),
      arguments: z.record(z.union([
        z.string(),
        z.number(),
        z.boolean(),
        z.array(z.any()),
        z.object({}).passthrough()
      ])).optional()
    });
  }
}
```

### 4.2 数据净化系统
```typescript
interface SanitizationConfig {
  allowedTags?: string[];
  allowedAttributes?: Record<string, string[]>;
  maxStringLength?: number;
  maxArrayLength?: number;
  maxObjectDepth?: number;
}

class DataSanitizer {
  private config: SanitizationConfig;

  constructor(config: SanitizationConfig = {}) {
    this.config = {
      allowedTags: ['b', 'i', 'em', 'strong', 'code', 'pre'],
      allowedAttributes: {
        'a': ['href'],
        'img': ['src', 'alt']
      },
      maxStringLength: 10000,
      maxArrayLength: 1000,
      maxObjectDepth: 10,
      ...config
    };
  }

  sanitize(data: any, depth: number = 0): any {
    if (depth > this.config.maxObjectDepth!) {
      throw new Error("Maximum object depth exceeded");
    }

    if (typeof data === 'string') {
      return this.sanitizeString(data);
    }

    if (Array.isArray(data)) {
      return this.sanitizeArray(data, depth);
    }

    if (typeof data === 'object' && data !== null) {
      return this.sanitizeObject(data, depth);
    }

    return data;
  }

  private sanitizeString(str: string): string {
    if (str.length > this.config.maxStringLength!) {
      str = str.substring(0, this.config.maxStringLength!);
    }

    // 移除潜在的恶意内容
    str = str.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    str = str.replace(/javascript:/gi, '');
    str = str.replace(/on\w+\s*=/gi, '');

    // HTML标签净化
    if (this.config.allowedTags && this.config.allowedTags.length > 0) {
      str = this.sanitizeHtml(str);
    } else {
      // 如果不允许任何标签，则转义HTML
      str = str.replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#x27;');
    }

    return str;
  }

  private sanitizeArray(arr: any[], depth: number): any[] {
    if (arr.length > this.config.maxArrayLength!) {
      arr = arr.slice(0, this.config.maxArrayLength!);
    }

    return arr.map(item => this.sanitize(item, depth + 1));
  }

  private sanitizeObject(obj: Record<string, any>, depth: number): Record<string, any> {
    const sanitized: Record<string, any> = {};

    for (const [key, value] of Object.entries(obj)) {
      // 净化键名
      const sanitizedKey = this.sanitizeString(key);
      sanitized[sanitizedKey] = this.sanitize(value, depth + 1);
    }

    return sanitized;
  }

  private sanitizeHtml(html: string): string {
    // 简化的HTML净化实现
    // 实际应用中应使用专业的库如DOMPurify
    const allowedTags = this.config.allowedTags!;
    const allowedAttributes = this.config.allowedAttributes!;

    return html.replace(/<(\/?[^>]+)>/g, (match, tag) => {
      const tagMatch = tag.match(/^\/?([\w-]+)/);
      if (!tagMatch) return '';

      const tagName = tagMatch[1].toLowerCase();
      if (!allowedTags.includes(tagName)) return '';

      // 检查属性
      if (allowedAttributes[tagName]) {
        const allowedAttrs = allowedAttributes[tagName];
        tag = tag.replace(/(\w+)=["']?([^"'\s>]+)["']?/g, (attrMatch, name, value) => {
          return allowedAttrs.includes(name.toLowerCase()) ? attrMatch : '';
        });
      }

      return `<${tag}>`;
    });
  }
}
```

## 5. 安全审计和监控

### 5.1 安全事件记录
```typescript
enum SecurityEventType {
  AUTHENTICATION_SUCCESS = "auth_success",
  AUTHENTICATION_FAILURE = "auth_failure",
  AUTHORIZATION_DENIED = "authz_denied",
  PRIVILEGE_ESCALATION_ATTEMPT = "privilege_escalation",
  SUSPICIOUS_ACTIVITY = "suspicious_activity",
  DATA_ACCESS = "data_access",
  CONFIGURATION_CHANGE = "config_change",
  SECURITY_POLICY_VIOLATION = "policy_violation"
}

interface SecurityEvent {
  id: string;
  type: SecurityEventType;
  timestamp: Date;
  userId?: string;
  sessionId?: string;
  clientIp?: string;
  userAgent?: string;
  resource?: string;
  action?: string;
  result: "success" | "failure" | "blocked";
  details: Record<string, any>;
  severity: "low" | "medium" | "high" | "critical";
}

class SecurityAuditor {
  private events: SecurityEvent[] = [];
  private alertThresholds: Map<SecurityEventType, number> = new Map();
  private alertCallbacks: Map<SecurityEventType, (events: SecurityEvent[]) => void> = new Map();

  constructor() {
    this.setupDefaultThresholds();
  }

  private setupDefaultThresholds(): void {
    this.alertThresholds.set(SecurityEventType.AUTHENTICATION_FAILURE, 5);
    this.alertThresholds.set(SecurityEventType.AUTHORIZATION_DENIED, 10);
    this.alertThresholds.set(SecurityEventType.PRIVILEGE_ESCALATION_ATTEMPT, 1);
    this.alertThresholds.set(SecurityEventType.SUSPICIOUS_ACTIVITY, 3);
  }

  recordEvent(event: Omit<SecurityEvent, 'id' | 'timestamp'>): void {
    const fullEvent: SecurityEvent = {
      ...event,
      id: this.generateEventId(),
      timestamp: new Date()
    };

    this.events.push(fullEvent);
    this.checkAlertConditions(fullEvent);

    // 限制内存中的事件数量
    if (this.events.length > 10000) {
      this.events.shift();
    }
  }

  private generateEventId(): string {
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private checkAlertConditions(event: SecurityEvent): void {
    const threshold = this.alertThresholds.get(event.type);
    if (!threshold) return;

    const recentEvents = this.getRecentEvents(event.type, 15 * 60 * 1000); // 15分钟内
    
    if (recentEvents.length >= threshold) {
      this.triggerAlert(event.type, recentEvents);
    }
  }

  private getRecentEvents(type: SecurityEventType, timeWindowMs: number): SecurityEvent[] {
    const cutoff = new Date(Date.now() - timeWindowMs);
    return this.events.filter(event => 
      event.type === type && event.timestamp >= cutoff
    );
  }

  private triggerAlert(type: SecurityEventType, events: SecurityEvent[]): void {
    const callback = this.alertCallbacks.get(type);
    if (callback) {
      callback(events);
    } else {
      console.error(`Security alert: ${events.length} ${type} events in the last 15 minutes`);
    }
  }

  setAlertCallback(type: SecurityEventType, callback: (events: SecurityEvent[]) => void): void {
    this.alertCallbacks.set(type, callback);
  }

  getEvents(filter?: {
    type?: SecurityEventType;
    userId?: string;
    startTime?: Date;
    endTime?: Date;
    severity?: string;
  }): SecurityEvent[] {
    let filtered = this.events;

    if (filter) {
      if (filter.type) {
        filtered = filtered.filter(e => e.type === filter.type);
      }
      if (filter.userId) {
        filtered = filtered.filter(e => e.userId === filter.userId);
      }
      if (filter.startTime) {
        filtered = filtered.filter(e => e.timestamp >= filter.startTime!);
      }
      if (filter.endTime) {
        filtered = filtered.filter(e => e.timestamp <= filter.endTime!);
      }
      if (filter.severity) {
        filtered = filtered.filter(e => e.severity === filter.severity);
      }
    }

    return filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  generateSecurityReport(timeRange: { start: Date; end: Date }): string {
    const events = this.getEvents({
      startTime: timeRange.start,
      endTime: timeRange.end
    });

    const report = [
      "=== Security Audit Report ===",
      `Time Range: ${timeRange.start.toISOString()} to ${timeRange.end.toISOString()}`,
      `Total Events: ${events.length}`,
      ""
    ];

    // 按类型统计
    const eventsByType: Record<string, number> = {};
    events.forEach(event => {
      eventsByType[event.type] = (eventsByType[event.type] || 0) + 1;
    });

    report.push("Events by Type:");
    for (const [type, count] of Object.entries(eventsByType)) {
      report.push(`  ${type}: ${count}`);
    }
    report.push("");

    // 按严重程度统计
    const eventsBySeverity: Record<string, number> = {};
    events.forEach(event => {
      eventsBySeverity[event.severity] = (eventsBySeverity[event.severity] || 0) + 1;
    });

    report.push("Events by Severity:");
    for (const [severity, count] of Object.entries(eventsBySeverity)) {
      report.push(`  ${severity}: ${count}`);
    }
    report.push("");

    // 高风险事件
    const criticalEvents = events.filter(e => e.severity === "critical");
    if (criticalEvents.length > 0) {
      report.push("Critical Events:");
      criticalEvents.forEach(event => {
        report.push(`  ${event.timestamp.toISOString()}: ${event.type} - ${event.details.description || 'No description'}`);
      });
    }

    return report.join("\n");
  }
}
```

### 5.2 实时威胁检测
```typescript
interface ThreatPattern {
  name: string;
  description: string;
  conditions: ThreatCondition[];
  severity: "low" | "medium" | "high" | "critical";
  action: "log" | "alert" | "block";
}

interface ThreatCondition {
  field: string;
  operator: "equals" | "contains" | "greater_than" | "pattern";
  value: any;
  timeWindow?: number; // milliseconds
  threshold?: number;
}

class ThreatDetectionEngine {
  private patterns: ThreatPattern[] = [];
  private eventHistory: SecurityEvent[] = [];
  private blockedIPs: Set<string> = new Set();
  private blockedUsers: Set<string> = new Set();

  constructor() {
    this.initializeDefaultPatterns();
  }

  private initializeDefaultPatterns(): void {
    // 暴力破解检测
    this.addPattern({
      name: "brute_force_attack",
      description: "Multiple authentication failures from same IP",
      conditions: [
        {
          field: "type",
          operator: "equals",
          value: SecurityEventType.AUTHENTICATION_FAILURE
        },
        {
          field: "clientIp",
          operator: "equals",
          value: "{{clientIp}}",
          timeWindow: 5 * 60 * 1000, // 5分钟
          threshold: 5
        }
      ],
      severity: "high",
      action: "block"
    });

    // 权限提升尝试
    this.addPattern({
      name: "privilege_escalation",
      description: "Attempt to access unauthorized resources",
      conditions: [
        {
          field: "type",
          operator: "equals",
          value: SecurityEventType.AUTHORIZATION_DENIED
        },
        {
          field: "userId",
          operator: "equals",
          value: "{{userId}}",
          timeWindow: 10 * 60 * 1000, // 10分钟
          threshold: 3
        }
      ],
      severity: "critical",
      action: "alert"
    });
  }

  addPattern(pattern: ThreatPattern): void {
    this.patterns.push(pattern);
  }

  analyzeEvent(event: SecurityEvent): ThreatDetectionResult[] {
    const results: ThreatDetectionResult[] = [];
    
    this.eventHistory.push(event);
    
    // 限制历史记录大小
    if (this.eventHistory.length > 5000) {
      this.eventHistory.shift();
    }

    for (const pattern of this.patterns) {
      const result = this.evaluatePattern(pattern, event);
      if (result.matched) {
        results.push(result);
        this.handleThreatDetection(result);
      }
    }

    return results;
  }

  private evaluatePattern(pattern: ThreatPattern, currentEvent: SecurityEvent): ThreatDetectionResult {
    const matchedConditions: boolean[] = [];

    for (const condition of pattern.conditions) {
      if (condition.threshold && condition.timeWindow) {
        // 时间窗口内的阈值检测
        const matched = this.evaluateThresholdCondition(condition, currentEvent);
        matchedConditions.push(matched);
      } else {
        // 单个事件条件检测
        const matched = this.evaluateEventCondition(condition, currentEvent);
        matchedConditions.push(matched);
      }
    }

    const allMatched = matchedConditions.every(Boolean);

    return {
      patternName: pattern.name,
      matched: allMatched,
      severity: pattern.severity,
      action: pattern.action,
      event: currentEvent,
      matchedConditions: matchedConditions.length,
      totalConditions: pattern.conditions.length
    };
  }

  private evaluateThresholdCondition(condition: ThreatCondition, currentEvent: SecurityEvent): boolean {
    const timeWindow = condition.timeWindow!;
    const threshold = condition.threshold!;
    const cutoff = new Date(currentEvent.timestamp.getTime() - timeWindow);

    // 获取时间窗口内的相关事件
    const relevantEvents = this.eventHistory.filter(event => {
      if (event.timestamp < cutoff) return false;
      
      // 根据条件字段匹配事件
      const fieldValue = this.getFieldValue(condition.field, event);
      const currentFieldValue = this.getFieldValue(condition.field, currentEvent);
      
      return this.compareValues(fieldValue, condition.operator, condition.value) &&
             fieldValue === currentFieldValue;
    });

    return relevantEvents.length >= threshold;
  }

  private evaluateEventCondition(condition: ThreatCondition, event: SecurityEvent): boolean {
    const fieldValue = this.getFieldValue(condition.field, event);
    return this.compareValues(fieldValue, condition.operator, condition.value);
  }

  private getFieldValue(field: string, event: SecurityEvent): any {
    const fields = field.split('.');
    let value: any = event;

    for (const f of fields) {
      value = value?.[f];
    }

    return value;
  }

  private compareValues(actual: any, operator: string, expected: any): boolean {
    switch (operator) {
      case "equals":
        return actual === expected;
      case "contains":
        return typeof actual === 'string' && actual.includes(expected);
      case "greater_than":
        return typeof actual === 'number' && actual > expected;
      case "pattern":
        return typeof actual === 'string' && new RegExp(expected).test(actual);
      default:
        return false;
    }
  }

  private handleThreatDetection(result: ThreatDetectionResult): void {
    switch (result.action) {
      case "log":
        console.log(`Threat detected: ${result.patternName}`, result);
        break;
      case "alert":
        this.sendAlert(result);
        break;
      case "block":
        this.blockSource(result);
        break;
    }
  }

  private sendAlert(result: ThreatDetectionResult): void {
    console.error(`SECURITY ALERT: ${result.patternName}`, {
      severity: result.severity,
      event: result.event,
      timestamp: new Date().toISOString()
    });

    // 这里可以集成外部告警系统
  }

  private blockSource(result: ThreatDetectionResult): void {
    const event = result.event;
    
    if (event.clientIp) {
      this.blockedIPs.add(event.clientIp);
      console.error(`Blocked IP: ${event.clientIp} due to ${result.patternName}`);
    }

    if (event.userId) {
      this.blockedUsers.add(event.userId);
      console.error(`Blocked user: ${event.userId} due to ${result.patternName}`);
    }
  }

  isBlocked(clientIp?: string, userId?: string): boolean {
    if (clientIp && this.blockedIPs.has(clientIp)) {
      return true;
    }

    if (userId && this.blockedUsers.has(userId)) {
      return true;
    }

    return false;
  }

  unblock(clientIp?: string, userId?: string): void {
    if (clientIp) {
      this.blockedIPs.delete(clientIp);
    }

    if (userId) {
      this.blockedUsers.delete(userId);
    }
  }
}

interface ThreatDetectionResult {
  patternName: string;
  matched: boolean;
  severity: "low" | "medium" | "high" | "critical";
  action: "log" | "alert" | "block";
  event: SecurityEvent;
  matchedConditions: number;
  totalConditions: number;
}
```

## 6. 集成安全中间件

### 6.1 安全中间件系统
```typescript
class SecurityMiddleware {
  private authProviders: Map<AuthenticationMethod, AuthenticationProvider> = new Map();
  private accessControl: FinegrainedAccessControl;
  private validator: InputValidator;
  private sanitizer: DataSanitizer;
  private auditor: SecurityAuditor;
  private threatDetector: ThreatDetectionEngine;

  constructor(
    accessControl: FinegrainedAccessControl,
    validator: InputValidator,
    sanitizer: DataSanitizer,
    auditor: SecurityAuditor,
    threatDetector: ThreatDetectionEngine
  ) {
    this.accessControl = accessControl;
    this.validator = validator;
    this.sanitizer = sanitizer;
    this.auditor = auditor;
    this.threatDetector = threatDetector;
  }

  addAuthProvider(method: AuthenticationMethod, provider: AuthenticationProvider): void {
    this.authProviders.set(method, provider);
  }

  createSecureHandler<T>(
    schemaName: string,
    handler: (request: any, user: AuthenticatedUser) => Promise<T>
  ) {
    return async (request: any): Promise<T> => {
      const startTime = Date.now();
      let user: AuthenticatedUser | undefined;

      try {
        // 1. 提取客户端信息
        const clientInfo = this.extractClientInfo(request);

        // 2. 检查是否被阻止
        if (this.threatDetector.isBlocked(clientInfo.ip, clientInfo.userId)) {
          throw new Error("Access blocked due to security policy");
        }

        // 3. 身份验证
        user = await this.authenticate(request);

        // 4. 输入验证
        const validation = this.validator.validate(schemaName, request);
        if (!validation.valid) {
          throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
        }

        // 5. 数据净化
        const sanitizedRequest = this.sanitizer.sanitize(validation.data || request);

        // 6. 权限检查
        const accessRequest: AccessRequest = {
          user,
          resource: this.extractResourceFromRequest(sanitizedRequest),
          action: this.extractActionFromRequest(sanitizedRequest),
          context: { ...clientInfo, originalRequest: request }
        };

        if (!this.accessControl.checkResourceAccess(accessRequest)) {
          // 记录权限被拒绝事件
          this.auditor.recordEvent({
            type: SecurityEventType.AUTHORIZATION_DENIED,
            userId: user.id,
            sessionId: clientInfo.sessionId,
            clientIp: clientInfo.ip,
            userAgent: clientInfo.userAgent,
            resource: accessRequest.resource,
            action: accessRequest.action,
            result: "blocked",
            details: { reason: "Insufficient permissions" },
            severity: "medium"
          });

          throw new Error("Access denied");
        }

        // 7. 执行业务逻辑
        const result = await handler(sanitizedRequest, user);

        // 8. 记录成功事件
        this.auditor.recordEvent({
          type: SecurityEventType.DATA_ACCESS,
          userId: user.id,
          sessionId: clientInfo.sessionId,
          clientIp: clientInfo.ip,
          userAgent: clientInfo.userAgent,
          resource: accessRequest.resource,
          action: accessRequest.action,
          result: "success",
          details: { 
            responseTime: Date.now() - startTime,
            method: request.method 
          },
          severity: "low"
        });

        return result;

      } catch (error) {
        // 记录错误事件
        const securityEvent: Omit<SecurityEvent, 'id' | 'timestamp'> = {
          type: error.message.includes("Access denied") 
            ? SecurityEventType.AUTHORIZATION_DENIED 
            : SecurityEventType.SUSPICIOUS_ACTIVITY,
          userId: user?.id,
          sessionId: this.extractClientInfo(request).sessionId,
          clientIp: this.extractClientInfo(request).ip,
          userAgent: this.extractClientInfo(request).userAgent,
          resource: this.extractResourceFromRequest(request),
          action: this.extractActionFromRequest(request),
          result: "failure",
          details: { 
            error: error.message,
            responseTime: Date.now() - startTime 
          },
          severity: "medium"
        };

        this.auditor.recordEvent(securityEvent);
        
        // 威胁检测
        const threats = this.threatDetector.analyzeEvent({
          ...securityEvent,
          id: 'temp',
          timestamp: new Date()
        });

        throw error;
      }
    };
  }

  private async authenticate(request: any): Promise<AuthenticatedUser> {
    const authHeader = request.headers?.authorization;
    if (!authHeader) {
      throw new Error("Authentication required");
    }

    // 尝试不同的认证方式
    for (const [method, provider] of this.authProviders) {
      try {
        const credential = this.extractCredential(authHeader, method);
        if (credential) {
          const result = await provider.authenticate(credential);
          if (result.success && result.user) {
            return result.user;
          }
        }
      } catch (error) {
        continue; // 尝试下一个认证提供者
      }
    }

    throw new Error("Authentication failed");
  }

  private extractCredential(authHeader: string, method: AuthenticationMethod): AuthenticationCredential | null {
    switch (method) {
      case AuthenticationMethod.API_KEY:
        if (authHeader.startsWith('ApiKey ')) {
          return {
            method: AuthenticationMethod.API_KEY,
            value: authHeader.substring(7)
          };
        }
        break;
      case AuthenticationMethod.JWT:
        if (authHeader.startsWith('Bearer ')) {
          return {
            method: AuthenticationMethod.JWT,
            value: authHeader.substring(7)
          };
        }
        break;
    }
    return null;
  }

  private extractClientInfo(request: any): { ip?: string; userAgent?: string; sessionId?: string; userId?: string } {
    return {
      ip: request.headers?.['x-forwarded-for'] || request.connection?.remoteAddress,
      userAgent: request.headers?.['user-agent'],
      sessionId: request.headers?.['x-session-id'],
      userId: request.headers?.['x-user-id']
    };
  }

  private extractResourceFromRequest(request: any): string {
    // 从请求中提取资源类型
    if (request.method?.startsWith('tools/')) return 'tools';
    if (request.method?.startsWith('resources/')) return 'resources';
    if (request.method?.startsWith('prompts/')) return 'prompts';
    return 'unknown';
  }

  private extractActionFromRequest(request: any): string {
    // 从请求中提取操作类型
    const method = request.method || '';
    if (method.includes('/list')) return 'list';
    if (method.includes('/read')) return 'read';
    if (method.includes('/call')) return 'execute';
    if (method.includes('/get')) return 'read';
    return 'unknown';
  }
}
```

## 7. 最佳实践

### 7.1 安全开发原则
1. **深度防御** - 多层安全控制机制
2. **最小权限** - 只授予必要的最小权限
3. **零信任** - 不信任任何用户或系统
4. **失败安全** - 失败时默认拒绝访问
5. **持续监控** - 实时监控安全状态

### 7.2 配置和部署安全
1. **密钥管理** - 使用专业的密钥管理系统
2. **环境隔离** - 开发、测试、生产环境隔离
3. **定期更新** - 及时更新依赖和安全补丁
4. **安全配置** - 使用安全的默认配置
5. **备份恢复** - 定期备份和灾难恢复测试

### 7.3 监控和响应
1. **安全仪表板** - 可视化安全状态
2. **自动响应** - 自动化威胁响应机制
3. **事件关联** - 关联分析安全事件
4. **威胁情报** - 集成外部威胁情报
5. **定期评估** - 定期安全评估和渗透测试

## 小结

通过本章学习，我们掌握了：
- MCP安全威胁模型和防护策略
- 身份验证和授权系统的实现
- 细粒度权限控制机制
- 输入验证和数据净化技术
- 安全审计和威胁检测系统

安全性是MCP Server的重要基础，需要从设计阶段就考虑安全问题，实施多层次的安全防护机制，确保系统的安全可靠运行。