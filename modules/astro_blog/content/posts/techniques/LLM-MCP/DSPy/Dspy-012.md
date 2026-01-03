---
title: "第12章：实战项目：智能知识问答系统"
icon: circle-dot
order: 12
category:
  - DSPy
tag:
  - 项目实战
  - 知识问答
  - 系统架构
  - 完整项目
---

# 第12章：实战项目：智能知识问答系统

## 学习目标

通过本章学习，你将能够：

1. **综合运用DSPy技术**：集成前面章节学到的所有DSPy核心概念和技术
2. **构建完整系统架构**：设计和实现一个生产级的智能问答系统
3. **实现端到端流程**：从数据处理到模型训练，从API设计到前端展示
4. **掌握项目最佳实践**：代码组织、错误处理、性能优化、监控告警
5. **学会系统部署和维护**：容器化部署、自动化测试、持续集成

## 知识点总结

### 1. 项目架构设计
- 微服务架构模式
- 数据流设计
- API设计规范
- 前后端分离

### 2. 核心功能模块
- 知识库管理
- 问答处理引擎
- 用户交互界面
- 管理后台

### 3. 系统集成
- RAG检索增强
- 多模型协作
- 缓存优化
- 监控告警

## 项目概述

我们将构建一个名为"IntelliQA"的智能知识问答系统，该系统具备以下特性：

- **多知识源支持**：文档、网页、数据库等
- **智能问答**：基于DSPy的多步推理
- **实时学习**：用户反馈驱动的模型优化
- **多租户架构**：支持多个组织独立使用
- **可视化管理**：知识库管理和系统监控

## 详细实现

### 1. 项目结构设计

```python
# 项目目录结构
"""
intelliqa/
├── backend/
│   ├── app/
│   │   ├── core/           # 核心配置和工具
│   │   ├── models/         # 数据模型
│   │   ├── services/       # 业务逻辑层
│   │   ├── api/           # API路由
│   │   └── dspy/          # DSPy相关模块
│   ├── tests/             # 测试代码
│   ├── docker/            # Docker配置
│   └── requirements.txt
├── frontend/              # 前端代码
├── docs/                 # 项目文档
└── deployment/           # 部署脚本
"""

import dspy
from typing import List, Dict, Any, Optional
from dataclasses import dataclass
from datetime import datetime
import logging
from pathlib import Path

@dataclass
class ProjectConfig:
    """项目配置类"""
    app_name: str = "IntelliQA"
    version: str = "1.0.0"
    debug: bool = False
    
    # 数据库配置
    database_url: str = "postgresql://user:pass@localhost/intelliqa"
    redis_url: str = "redis://localhost:6379"
    
    # 向量数据库配置
    vector_db_type: str = "chromadb"
    vector_db_path: str = "./data/vectordb"
    
    # DSPy配置
    default_lm: str = "gpt-3.5-turbo"
    temperature: float = 0.1
    max_tokens: int = 2048
    
    # 系统配置
    log_level: str = "INFO"
    api_rate_limit: int = 100  # 每分钟请求数
    cache_ttl: int = 3600      # 缓存过期时间(秒)

# 全局配置实例
config = ProjectConfig()
```

### 2. 核心数据模型

```python
from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey, Float
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
import uuid

Base = declarative_base()

class Organization(Base):
    """组织/租户模型"""
    __tablename__ = "organizations"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(100), nullable=False)
    description = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=True)
    
    # 关联关系
    knowledge_bases = relationship("KnowledgeBase", back_populates="organization")
    users = relationship("User", back_populates="organization")

class KnowledgeBase(Base):
    """知识库模型"""
    __tablename__ = "knowledge_bases"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(100), nullable=False)
    description = Column(Text)
    org_id = Column(String, ForeignKey("organizations.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # 知识库配置
    embedding_model = Column(String(50), default="text-embedding-ada-002")
    chunk_size = Column(Integer, default=1000)
    chunk_overlap = Column(Integer, default=200)
    
    # 关联关系
    organization = relationship("Organization", back_populates="knowledge_bases")
    documents = relationship("Document", back_populates="knowledge_base")

class Document(Base):
    """文档模型"""
    __tablename__ = "documents"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String(200), nullable=False)
    content = Column(Text, nullable=False)
    source_type = Column(String(20))  # file, url, text
    source_path = Column(String(500))
    kb_id = Column(String, ForeignKey("knowledge_bases.id"))
    
    # 处理状态
    status = Column(String(20), default="pending")  # pending, processing, completed, failed
    processed_at = Column(DateTime)
    error_message = Column(Text)
    
    # 统计信息
    chunk_count = Column(Integer, default=0)
    token_count = Column(Integer, default=0)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # 关联关系
    knowledge_base = relationship("KnowledgeBase", back_populates="documents")
    chunks = relationship("DocumentChunk", back_populates="document")

class DocumentChunk(Base):
    """文档片段模型"""
    __tablename__ = "document_chunks"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    document_id = Column(String, ForeignKey("documents.id"))
    content = Column(Text, nullable=False)
    chunk_index = Column(Integer, nullable=False)
    
    # 向量化信息
    vector_id = Column(String)  # 向量数据库中的ID
    
    # 关联关系
    document = relationship("Document", back_populates="chunks")

class QuerySession(Base):
    """查询会话模型"""
    __tablename__ = "query_sessions"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"))
    kb_id = Column(String, ForeignKey("knowledge_bases.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # 关联关系
    queries = relationship("Query", back_populates="session")

class Query(Base):
    """查询记录模型"""
    __tablename__ = "queries"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    session_id = Column(String, ForeignKey("query_sessions.id"))
    question = Column(Text, nullable=False)
    answer = Column(Text)
    
    # 性能指标
    response_time = Column(Float)  # 响应时间(秒)
    token_usage = Column(Integer)  # 使用的token数
    
    # 用户反馈
    rating = Column(Integer)  # 1-5分评分
    feedback = Column(Text)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # 关联关系
    session = relationship("QuerySession", back_populates="queries")
```

### 3. DSPy核心模块

```python
import dspy
from typing import List, Dict, Any, Optional, Tuple
import chromadb
from chromadb.utils import embedding_functions
import numpy as np
from dataclasses import dataclass

class IntelliQASignature(dspy.Signature):
    """智能问答签名"""
    context = dspy.InputField(desc="相关的上下文信息")
    question = dspy.InputField(desc="用户问题")
    history = dspy.InputField(desc="对话历史", default="")
    answer = dspy.OutputField(desc="详细准确的答案")
    confidence = dspy.OutputField(desc="答案置信度(0-1)")
    sources = dspy.OutputField(desc="信息来源列表")

class ContextualRetrievalSignature(dspy.Signature):
    """上下文检索签名"""
    query = dspy.InputField(desc="用户查询")
    knowledge_domain = dspy.InputField(desc="知识领域", default="")
    expanded_query = dspy.OutputField(desc="扩展后的查询")
    key_concepts = dspy.OutputField(desc="关键概念列表")

class AnswerVerificationSignature(dspy.Signature):
    """答案验证签名"""
    question = dspy.InputField(desc="原始问题")
    answer = dspy.InputField(desc="生成的答案")
    context = dspy.InputField(desc="参考上下文")
    is_accurate = dspy.OutputField(desc="答案是否准确(true/false)")
    issues = dspy.OutputField(desc="发现的问题列表")
    suggestions = dspy.OutputField(desc="改进建议")

class IntelliQAEngine(dspy.Module):
    """智能问答引擎"""
    
    def __init__(self, knowledge_base_id: str):
        super().__init__()
        self.kb_id = knowledge_base_id
        
        # 初始化DSPy模块
        self.query_expander = dspy.ChainOfThought(ContextualRetrievalSignature)
        self.answer_generator = dspy.ChainOfThought(IntelliQASignature)
        self.answer_verifier = dspy.ChainOfThought(AnswerVerificationSignature)
        
        # 初始化向量数据库
        self.vector_client = chromadb.PersistentClient(
            path=f"{config.vector_db_path}/{knowledge_base_id}"
        )
        self.collection = self.vector_client.get_or_create_collection(
            name="knowledge_chunks",
            embedding_function=embedding_functions.OpenAIEmbeddingFunction(
                api_key=config.openai_api_key,
                model_name="text-embedding-ada-002"
            )
        )
    
    def retrieve_context(self, query: str, top_k: int = 5) -> List[Dict[str, Any]]:
        """检索相关上下文"""
        # 扩展查询
        expanded = self.query_expander(
            query=query,
            knowledge_domain=self._get_knowledge_domain()
        )
        
        # 使用扩展查询检索
        results = self.collection.query(
            query_texts=[expanded.expanded_query],
            n_results=top_k,
            include=["documents", "metadatas", "distances"]
        )
        
        contexts = []
        if results["documents"]:
            for doc, metadata, distance in zip(
                results["documents"][0],
                results["metadatas"][0],
                results["distances"][0]
            ):
                contexts.append({
                    "content": doc,
                    "source": metadata.get("source", ""),
                    "score": 1 - distance,  # 转换为相似度分数
                    "metadata": metadata
                })
        
        return contexts
    
    def generate_answer(self, question: str, context: List[Dict], history: str = "") -> Dict[str, Any]:
        """生成答案"""
        # 构建上下文字符串
        context_str = "\n\n".join([
            f"来源: {ctx['source']}\n内容: {ctx['content']}"
            for ctx in context[:3]  # 使用前3个最相关的上下文
        ])
        
        # 生成答案
        result = self.answer_generator(
            context=context_str,
            question=question,
            history=history
        )
        
        # 验证答案
        verification = self.answer_verifier(
            question=question,
            answer=result.answer,
            context=context_str
        )
        
        return {
            "answer": result.answer,
            "confidence": float(result.confidence),
            "sources": self._extract_sources(result.sources),
            "verification": {
                "is_accurate": verification.is_accurate.lower() == "true",
                "issues": verification.issues.split(";") if verification.issues else [],
                "suggestions": verification.suggestions.split(";") if verification.suggestions else []
            },
            "context_used": context
        }
    
    def forward(self, question: str, history: str = "") -> Dict[str, Any]:
        """完整的问答流程"""
        try:
            # 1. 检索相关上下文
            context = self.retrieve_context(question)
            
            if not context:
                return {
                    "answer": "抱歉，我在知识库中没有找到相关信息来回答您的问题。",
                    "confidence": 0.0,
                    "sources": [],
                    "verification": {"is_accurate": False, "issues": ["无相关上下文"], "suggestions": []},
                    "context_used": []
                }
            
            # 2. 生成答案
            result = self.generate_answer(question, context, history)
            
            # 3. 后处理
            result["answer"] = self._post_process_answer(result["answer"])
            
            return result
            
        except Exception as e:
            logging.error(f"问答处理错误: {str(e)}")
            return {
                "answer": "处理您的问题时发生错误，请稍后重试。",
                "confidence": 0.0,
                "sources": [],
                "verification": {"is_accurate": False, "issues": [str(e)], "suggestions": []},
                "context_used": []
            }
    
    def _get_knowledge_domain(self) -> str:
        """获取知识领域"""
        # 这里可以基于知识库的元数据或配置确定领域
        return "通用知识"
    
    def _extract_sources(self, sources_str: str) -> List[str]:
        """提取信息源"""
        if not sources_str:
            return []
        return [s.strip() for s in sources_str.split(";") if s.strip()]
    
    def _post_process_answer(self, answer: str) -> str:
        """后处理答案"""
        # 移除多余的空行
        lines = [line.strip() for line in answer.split("\n")]
        lines = [line for line in lines if line]
        
        # 确保答案结构清晰
        if len(lines) > 1:
            return "\n\n".join(lines)
        return answer.strip()
```

### 4. 知识库管理服务

```python
import asyncio
import aiofiles
from typing import List, Dict, Any, Optional, AsyncGenerator
from pathlib import Path
import mimetypes
from urllib.parse import urlparse
import requests
from bs4 import BeautifulSoup
import PyPDF2
import docx
from langchain.text_splitter import RecursiveCharacterTextSplitter
import hashlib
import json

class KnowledgeBaseService:
    """知识库管理服务"""
    
    def __init__(self, kb_id: str, db_session, vector_client):
        self.kb_id = kb_id
        self.db = db_session
        self.vector_client = vector_client
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
            separators=["\n\n", "\n", ".", "!", "?", ",", " ", ""]
        )
    
    async def add_document(self, title: str, content: str = "", 
                          source_type: str = "text", source_path: str = "") -> str:
        """添加文档到知识库"""
        try:
            # 创建文档记录
            doc = Document(
                title=title,
                content=content if content else await self._extract_content(source_path, source_type),
                source_type=source_type,
                source_path=source_path,
                kb_id=self.kb_id,
                status="processing"
            )
            
            self.db.add(doc)
            self.db.commit()
            
            # 异步处理文档
            asyncio.create_task(self._process_document(doc.id))
            
            return doc.id
            
        except Exception as e:
            logging.error(f"添加文档失败: {str(e)}")
            raise
    
    async def _extract_content(self, source_path: str, source_type: str) -> str:
        """提取文档内容"""
        if source_type == "file":
            return await self._extract_file_content(source_path)
        elif source_type == "url":
            return await self._extract_web_content(source_path)
        else:
            return ""
    
    async def _extract_file_content(self, file_path: str) -> str:
        """提取文件内容"""
        path = Path(file_path)
        mime_type, _ = mimetypes.guess_type(file_path)
        
        try:
            if mime_type == "text/plain":
                async with aiofiles.open(file_path, "r", encoding="utf-8") as f:
                    return await f.read()
            
            elif mime_type == "application/pdf":
                return await self._extract_pdf_content(file_path)
            
            elif mime_type in ["application/vnd.openxmlformats-officedocument.wordprocessingml.document"]:
                return self._extract_docx_content(file_path)
            
            else:
                # 尝试以文本形式读取
                async with aiofiles.open(file_path, "r", encoding="utf-8") as f:
                    return await f.read()
                    
        except Exception as e:
            logging.error(f"提取文件内容失败 {file_path}: {str(e)}")
            return ""
    
    async def _extract_pdf_content(self, file_path: str) -> str:
        """提取PDF内容"""
        try:
            content = []
            with open(file_path, "rb") as file:
                reader = PyPDF2.PdfReader(file)
                for page in reader.pages:
                    text = page.extract_text()
                    if text.strip():
                        content.append(text)
            return "\n\n".join(content)
        except Exception as e:
            logging.error(f"PDF提取失败: {str(e)}")
            return ""
    
    def _extract_docx_content(self, file_path: str) -> str:
        """提取Word文档内容"""
        try:
            doc = docx.Document(file_path)
            content = []
            for paragraph in doc.paragraphs:
                if paragraph.text.strip():
                    content.append(paragraph.text)
            return "\n\n".join(content)
        except Exception as e:
            logging.error(f"Word文档提取失败: {str(e)}")
            return ""
    
    async def _extract_web_content(self, url: str) -> str:
        """提取网页内容"""
        try:
            response = requests.get(url, timeout=10)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, "html.parser")
            
            # 移除脚本和样式
            for script in soup(["script", "style"]):
                script.decompose()
            
            # 提取文本
            text = soup.get_text()
            
            # 清理文本
            lines = (line.strip() for line in text.splitlines())
            chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
            text = "\n".join(chunk for chunk in chunks if chunk)
            
            return text
            
        except Exception as e:
            logging.error(f"网页内容提取失败 {url}: {str(e)}")
            return ""
    
    async def _process_document(self, doc_id: str):
        """处理文档 - 分块和向量化"""
        try:
            # 获取文档
            doc = self.db.query(Document).filter(Document.id == doc_id).first()
            if not doc:
                return
            
            # 文本分块
            chunks = self.text_splitter.split_text(doc.content)
            
            # 批量插入向量数据库
            await self._add_chunks_to_vector_db(doc, chunks)
            
            # 更新文档状态
            doc.status = "completed"
            doc.processed_at = datetime.utcnow()
            doc.chunk_count = len(chunks)
            doc.token_count = sum(len(chunk.split()) for chunk in chunks)
            
            self.db.commit()
            
        except Exception as e:
            logging.error(f"文档处理失败 {doc_id}: {str(e)}")
            # 更新错误状态
            doc = self.db.query(Document).filter(Document.id == doc_id).first()
            if doc:
                doc.status = "failed"
                doc.error_message = str(e)
                self.db.commit()
    
    async def _add_chunks_to_vector_db(self, doc: Document, chunks: List[str]):
        """添加文档块到向量数据库"""
        collection = self.vector_client.get_or_create_collection(
            name=f"kb_{self.kb_id}",
            embedding_function=embedding_functions.OpenAIEmbeddingFunction(
                api_key=config.openai_api_key
            )
        )
        
        # 准备数据
        chunk_ids = []
        chunk_contents = []
        metadatas = []
        
        for i, chunk in enumerate(chunks):
            chunk_id = f"{doc.id}_chunk_{i}"
            chunk_ids.append(chunk_id)
            chunk_contents.append(chunk)
            metadatas.append({
                "document_id": doc.id,
                "document_title": doc.title,
                "source": doc.source_path or doc.title,
                "chunk_index": i,
                "content_hash": hashlib.md5(chunk.encode()).hexdigest()
            })
            
            # 保存到数据库
            db_chunk = DocumentChunk(
                document_id=doc.id,
                content=chunk,
                chunk_index=i,
                vector_id=chunk_id
            )
            self.db.add(db_chunk)
        
        # 批量添加到向量数据库
        collection.add(
            ids=chunk_ids,
            documents=chunk_contents,
            metadatas=metadatas
        )
        
        self.db.commit()
    
    def search_documents(self, query: str, limit: int = 10) -> List[Dict]:
        """搜索文档"""
        docs = self.db.query(Document).filter(
            Document.kb_id == self.kb_id,
            Document.status == "completed"
        ).limit(limit).all()
        
        return [
            {
                "id": doc.id,
                "title": doc.title,
                "source_type": doc.source_type,
                "source_path": doc.source_path,
                "chunk_count": doc.chunk_count,
                "created_at": doc.created_at.isoformat(),
                "content_preview": doc.content[:200] + "..." if len(doc.content) > 200 else doc.content
            }
            for doc in docs
        ]
    
    def delete_document(self, doc_id: str) -> bool:
        """删除文档"""
        try:
            # 删除向量数据库中的数据
            collection = self.vector_client.get_collection(f"kb_{self.kb_id}")
            
            # 获取文档的所有chunk ID
            chunks = self.db.query(DocumentChunk).filter(
                DocumentChunk.document_id == doc_id
            ).all()
            
            chunk_ids = [chunk.vector_id for chunk in chunks]
            if chunk_ids:
                collection.delete(ids=chunk_ids)
            
            # 删除数据库记录
            self.db.query(DocumentChunk).filter(
                DocumentChunk.document_id == doc_id
            ).delete()
            
            self.db.query(Document).filter(
                Document.id == doc_id
            ).delete()
            
            self.db.commit()
            return True
            
        except Exception as e:
            logging.error(f"删除文档失败 {doc_id}: {str(e)}")
            self.db.rollback()
            return False
    
    def get_statistics(self) -> Dict[str, Any]:
        """获取知识库统计信息"""
        total_docs = self.db.query(Document).filter(
            Document.kb_id == self.kb_id
        ).count()
        
        completed_docs = self.db.query(Document).filter(
            Document.kb_id == self.kb_id,
            Document.status == "completed"
        ).count()
        
        total_chunks = self.db.query(DocumentChunk).join(Document).filter(
            Document.kb_id == self.kb_id
        ).count()
        
        total_tokens = self.db.query(Document).filter(
            Document.kb_id == self.kb_id,
            Document.status == "completed"
        ).with_entities(Document.token_count).all()
        
        total_token_count = sum(count[0] or 0 for count in total_tokens)
        
        return {
            "total_documents": total_docs,
            "completed_documents": completed_docs,
            "total_chunks": total_chunks,
            "total_tokens": total_token_count,
            "processing_documents": total_docs - completed_docs
        }
```

### 5. RESTful API设计

```python
from fastapi import FastAPI, HTTPException, Depends, BackgroundTasks, UploadFile, File
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
import uvicorn
from datetime import datetime
import time

# 请求/响应模型
class CreateKnowledgeBaseRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None
    embedding_model: str = "text-embedding-ada-002"
    chunk_size: int = Field(1000, ge=100, le=4000)
    chunk_overlap: int = Field(200, ge=0, le=1000)

class AddDocumentRequest(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    content: Optional[str] = None
    source_type: str = Field("text", regex="^(text|file|url)$")
    source_path: Optional[str] = None

class QueryRequest(BaseModel):
    question: str = Field(..., min_length=1, max_length=1000)
    session_id: Optional[str] = None
    history: Optional[str] = ""
    max_context: int = Field(5, ge=1, le=10)

class QueryResponse(BaseModel):
    answer: str
    confidence: float
    sources: List[str]
    response_time: float
    context_used: List[Dict[str, Any]]
    verification: Dict[str, Any]

class FeedbackRequest(BaseModel):
    query_id: str
    rating: int = Field(..., ge=1, le=5)
    feedback: Optional[str] = None

# FastAPI应用
app = FastAPI(
    title="IntelliQA API",
    description="智能知识问答系统API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS设置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 生产环境应该限制具体域名
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 安全认证
security = HTTPBearer()

class APIService:
    """API服务类"""
    
    def __init__(self):
        self.engines: Dict[str, IntelliQAEngine] = {}
        self.kb_services: Dict[str, KnowledgeBaseService] = {}
    
    def get_engine(self, kb_id: str) -> IntelliQAEngine:
        """获取问答引擎"""
        if kb_id not in self.engines:
            self.engines[kb_id] = IntelliQAEngine(kb_id)
        return self.engines[kb_id]
    
    def get_kb_service(self, kb_id: str) -> KnowledgeBaseService:
        """获取知识库服务"""
        if kb_id not in self.kb_services:
            # 这里应该注入真实的数据库连接和向量客户端
            self.kb_services[kb_id] = KnowledgeBaseService(kb_id, None, None)
        return self.kb_services[kb_id]

api_service = APIService()

# 认证依赖
def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """获取当前用户（简化版）"""
    # 这里应该实现真实的JWT验证
    token = credentials.credentials
    if not token or token == "invalid":
        raise HTTPException(status_code=401, detail="Invalid token")
    return {"user_id": "user123", "org_id": "org123"}

# API路由
@app.post("/api/v1/knowledge-bases", response_model=Dict[str, str])
async def create_knowledge_base(
    request: CreateKnowledgeBaseRequest,
    current_user: Dict = Depends(get_current_user)
):
    """创建知识库"""
    try:
        # 创建知识库记录
        kb = KnowledgeBase(
            name=request.name,
            description=request.description,
            org_id=current_user["org_id"],
            embedding_model=request.embedding_model,
            chunk_size=request.chunk_size,
            chunk_overlap=request.chunk_overlap
        )
        
        # 这里应该保存到数据库
        # db.add(kb)
        # db.commit()
        
        return {"knowledge_base_id": kb.id, "status": "created"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/knowledge-bases/{kb_id}/documents", response_model=Dict[str, str])
async def add_document(
    kb_id: str,
    request: AddDocumentRequest,
    background_tasks: BackgroundTasks,
    current_user: Dict = Depends(get_current_user)
):
    """添加文档到知识库"""
    try:
        kb_service = api_service.get_kb_service(kb_id)
        doc_id = await kb_service.add_document(
            title=request.title,
            content=request.content or "",
            source_type=request.source_type,
            source_path=request.source_path or ""
        )
        
        return {"document_id": doc_id, "status": "processing"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/knowledge-bases/{kb_id}/upload", response_model=Dict[str, str])
async def upload_document(
    kb_id: str,
    file: UploadFile = File(...),
    background_tasks: BackgroundTasks,
    current_user: Dict = Depends(get_current_user)
):
    """上传文档文件"""
    try:
        # 保存文件
        file_path = f"./uploads/{kb_id}/{file.filename}"
        Path(file_path).parent.mkdir(parents=True, exist_ok=True)
        
        async with aiofiles.open(file_path, "wb") as f:
            content = await file.read()
            await f.write(content)
        
        # 添加到知识库
        kb_service = api_service.get_kb_service(kb_id)
        doc_id = await kb_service.add_document(
            title=file.filename,
            source_type="file",
            source_path=file_path
        )
        
        return {"document_id": doc_id, "status": "processing"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/knowledge-bases/{kb_id}/query", response_model=QueryResponse)
async def query_knowledge_base(
    kb_id: str,
    request: QueryRequest,
    current_user: Dict = Depends(get_current_user)
):
    """查询知识库"""
    start_time = time.time()
    
    try:
        engine = api_service.get_engine(kb_id)
        
        # 执行查询
        result = engine.forward(
            question=request.question,
            history=request.history
        )
        
        # 计算响应时间
        response_time = time.time() - start_time
        
        # 保存查询记录
        # 这里应该保存到数据库
        
        return QueryResponse(
            answer=result["answer"],
            confidence=result["confidence"],
            sources=result["sources"],
            response_time=response_time,
            context_used=result["context_used"],
            verification=result["verification"]
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/knowledge-bases/{kb_id}/documents")
async def list_documents(
    kb_id: str,
    limit: int = 20,
    offset: int = 0,
    current_user: Dict = Depends(get_current_user)
):
    """获取文档列表"""
    try:
        kb_service = api_service.get_kb_service(kb_id)
        documents = kb_service.search_documents(query="", limit=limit)
        
        return {
            "documents": documents[offset:offset+limit],
            "total": len(documents),
            "limit": limit,
            "offset": offset
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/v1/knowledge-bases/{kb_id}/documents/{doc_id}")
async def delete_document(
    kb_id: str,
    doc_id: str,
    current_user: Dict = Depends(get_current_user)
):
    """删除文档"""
    try:
        kb_service = api_service.get_kb_service(kb_id)
        success = kb_service.delete_document(doc_id)
        
        if success:
            return {"status": "deleted"}
        else:
            raise HTTPException(status_code=404, detail="Document not found")
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/knowledge-bases/{kb_id}/statistics")
async def get_knowledge_base_statistics(
    kb_id: str,
    current_user: Dict = Depends(get_current_user)
):
    """获取知识库统计信息"""
    try:
        kb_service = api_service.get_kb_service(kb_id)
        stats = kb_service.get_statistics()
        return stats
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/queries/{query_id}/feedback")
async def submit_feedback(
    query_id: str,
    request: FeedbackRequest,
    current_user: Dict = Depends(get_current_user)
):
    """提交查询反馈"""
    try:
        # 这里应该更新查询记录的反馈信息
        # query = db.query(Query).filter(Query.id == query_id).first()
        # query.rating = request.rating
        # query.feedback = request.feedback
        # db.commit()
        
        return {"status": "feedback_submitted"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/health")
async def health_check():
    """健康检查"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "version": config.version
    }

# 启动服务
if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=config.debug,
        log_level=config.log_level.lower()
    )
```

### 6. 前端界面实现

```typescript
// types/api.ts - API类型定义
export interface KnowledgeBase {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  documentCount: number;
  status: 'active' | 'inactive';
}

export interface Document {
  id: string;
  title: string;
  sourceType: 'text' | 'file' | 'url';
  sourcePath: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  chunkCount: number;
  createdAt: string;
  contentPreview: string;
}

export interface QueryRequest {
  question: string;
  sessionId?: string;
  history?: string;
  maxContext?: number;
}

export interface QueryResponse {
  answer: string;
  confidence: number;
  sources: string[];
  responseTime: number;
  contextUsed: Array<{
    content: string;
    source: string;
    score: number;
  }>;
  verification: {
    isAccurate: boolean;
    issues: string[];
    suggestions: string[];
  };
}

// services/api.ts - API服务
import axios from 'axios';

class ApiService {
  private baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  private api = axios.create({
    baseURL: this.baseURL,
    timeout: 30000,
  });

  constructor() {
    // 请求拦截器 - 添加认证
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // 响应拦截器 - 错误处理
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('API Error:', error);
        throw error;
      }
    );
  }

  // 知识库相关API
  async createKnowledgeBase(data: {
    name: string;
    description?: string;
    embeddingModel?: string;
    chunkSize?: number;
    chunkOverlap?: number;
  }): Promise<{ knowledge_base_id: string; status: string }> {
    const response = await this.api.post('/api/v1/knowledge-bases', data);
    return response.data;
  }

  async getKnowledgeBases(): Promise<KnowledgeBase[]> {
    const response = await this.api.get('/api/v1/knowledge-bases');
    return response.data;
  }

  async getKnowledgeBaseStats(kbId: string): Promise<any> {
    const response = await this.api.get(`/api/v1/knowledge-bases/${kbId}/statistics`);
    return response.data;
  }

  // 文档相关API
  async addDocument(kbId: string, data: {
    title: string;
    content?: string;
    sourceType: string;
    sourcePath?: string;
  }): Promise<{ document_id: string; status: string }> {
    const response = await this.api.post(`/api/v1/knowledge-bases/${kbId}/documents`, data);
    return response.data;
  }

  async uploadDocument(kbId: string, file: File): Promise<{ document_id: string; status: string }> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await this.api.post(
      `/api/v1/knowledge-bases/${kbId}/upload`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  }

  async getDocuments(kbId: string, params?: {
    limit?: number;
    offset?: number;
  }): Promise<{
    documents: Document[];
    total: number;
    limit: number;
    offset: number;
  }> {
    const response = await this.api.get(`/api/v1/knowledge-bases/${kbId}/documents`, {
      params,
    });
    return response.data;
  }

  async deleteDocument(kbId: string, docId: string): Promise<{ status: string }> {
    const response = await this.api.delete(`/api/v1/knowledge-bases/${kbId}/documents/${docId}`);
    return response.data;
  }

  // 查询相关API
  async queryKnowledgeBase(kbId: string, data: QueryRequest): Promise<QueryResponse> {
    const response = await this.api.post(`/api/v1/knowledge-bases/${kbId}/query`, data);
    return response.data;
  }

  async submitFeedback(queryId: string, data: {
    rating: number;
    feedback?: string;
  }): Promise<{ status: string }> {
    const response = await this.api.post(`/api/v1/queries/${queryId}/feedback`, data);
    return response.data;
  }
}

export default new ApiService();

// components/KnowledgeBaseManager.tsx - 知识库管理组件
import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Chip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  CloudUpload as UploadIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import ApiService from '../services/api';

const KnowledgeBaseManager: React.FC = () => {
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>([]);
  const [selectedKB, setSelectedKB] = useState<string | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // 创建知识库表单数据
  const [kbFormData, setKbFormData] = useState({
    name: '',
    description: '',
    embeddingModel: 'text-embedding-ada-002',
    chunkSize: 1000,
    chunkOverlap: 200,
  });

  // 加载知识库列表
  useEffect(() => {
    loadKnowledgeBases();
  }, []);

  // 当选择知识库时加载文档
  useEffect(() => {
    if (selectedKB) {
      loadDocuments();
    }
  }, [selectedKB]);

  const loadKnowledgeBases = async () => {
    try {
      setLoading(true);
      const kbs = await ApiService.getKnowledgeBases();
      setKnowledgeBases(kbs);
    } catch (error) {
      console.error('Failed to load knowledge bases:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDocuments = async () => {
    if (!selectedKB) return;
    
    try {
      setLoading(true);
      const result = await ApiService.getDocuments(selectedKB);
      setDocuments(result.documents);
    } catch (error) {
      console.error('Failed to load documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateKB = async () => {
    try {
      setLoading(true);
      await ApiService.createKnowledgeBase(kbFormData);
      setCreateDialogOpen(false);
      setKbFormData({
        name: '',
        description: '',
        embeddingModel: 'text-embedding-ada-002',
        chunkSize: 1000,
        chunkOverlap: 200,
      });
      await loadKnowledgeBases();
    } catch (error) {
      console.error('Failed to create knowledge base:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || !selectedKB) return;
    
    try {
      setLoading(true);
      for (let i = 0; i < files.length; i++) {
        await ApiService.uploadDocument(selectedKB, files[i]);
      }
      setUploadDialogOpen(false);
      await loadDocuments();
    } catch (error) {
      console.error('Failed to upload files:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDocument = async (docId: string) => {
    if (!selectedKB || !confirm('确定要删除这个文档吗？')) return;
    
    try {
      setLoading(true);
      await ApiService.deleteDocument(selectedKB, docId);
      await loadDocuments();
    } catch (error) {
      console.error('Failed to delete document:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusChip = (status: string) => {
    const statusConfig = {
      pending: { color: 'default' as const, label: '待处理' },
      processing: { color: 'warning' as const, label: '处理中' },
      completed: { color: 'success' as const, label: '已完成' },
      failed: { color: 'error' as const, label: '失败' },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Chip size="small" color={config.color} label={config.label} />;
  };

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        知识库管理
      </Typography>

      {/* 知识库列表 */}
      <Grid container spacing={3} mb={3}>
        {knowledgeBases.map((kb) => (
          <Grid item xs={12} md={6} lg={4} key={kb.id}>
            <Card
              sx={{
                cursor: 'pointer',
                border: selectedKB === kb.id ? 2 : 0,
                borderColor: 'primary.main',
              }}
              onClick={() => setSelectedKB(kb.id)}
            >
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {kb.name}
                </Typography>
                <Typography color="text.secondary" gutterBottom>
                  {kb.description || '无描述'}
                </Typography>
                <Typography variant="body2">
                  文档数量: {kb.documentCount}
                </Typography>
                <Typography variant="body2">
                  创建时间: {new Date(kb.createdAt).toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
        
        {/* 创建新知识库卡片 */}
        <Grid item xs={12} md={6} lg={4}>
          <Card
            sx={{
              cursor: 'pointer',
              border: '2px dashed',
              borderColor: 'grey.300',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 150,
            }}
            onClick={() => setCreateDialogOpen(true)}
          >
            <Box textAlign="center">
              <AddIcon sx={{ fontSize: 48, color: 'grey.500' }} />
              <Typography color="text.secondary">
                创建新知识库
              </Typography>
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* 文档管理区域 */}
      {selectedKB && (
        <Card>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h5">
                文档管理
              </Typography>
              <Button
                variant="contained"
                startIcon={<UploadIcon />}
                onClick={() => setUploadDialogOpen(true)}
              >
                上传文档
              </Button>
            </Box>

            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>标题</TableCell>
                    <TableCell>类型</TableCell>
                    <TableCell>状态</TableCell>
                    <TableCell>块数量</TableCell>
                    <TableCell>创建时间</TableCell>
                    <TableCell>操作</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {documents.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell>
                        <Typography variant="body2">
                          {doc.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {doc.contentPreview}
                        </Typography>
                      </TableCell>
                      <TableCell>{doc.sourceType}</TableCell>
                      <TableCell>{getStatusChip(doc.status)}</TableCell>
                      <TableCell>{doc.chunkCount}</TableCell>
                      <TableCell>
                        {new Date(doc.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteDocument(doc.id)}
                          disabled={loading}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* 创建知识库对话框 */}
      <Dialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>创建新知识库</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="知识库名称"
            fullWidth
            variant="outlined"
            value={kbFormData.name}
            onChange={(e) => setKbFormData({ ...kbFormData, name: e.target.value })}
          />
          <TextField
            margin="dense"
            label="描述"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={kbFormData.description}
            onChange={(e) => setKbFormData({ ...kbFormData, description: e.target.value })}
          />
          <TextField
            margin="dense"
            label="分块大小"
            type="number"
            fullWidth
            variant="outlined"
            value={kbFormData.chunkSize}
            onChange={(e) => setKbFormData({ ...kbFormData, chunkSize: parseInt(e.target.value) })}
          />
          <TextField
            margin="dense"
            label="分块重叠"
            type="number"
            fullWidth
            variant="outlined"
            value={kbFormData.chunkOverlap}
            onChange={(e) => setKbFormData({ ...kbFormData, chunkOverlap: parseInt(e.target.value) })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>取消</Button>
          <Button onClick={handleCreateKB} variant="contained" disabled={loading}>
            创建
          </Button>
        </DialogActions>
      </Dialog>

      {/* 文件上传对话框 */}
      <Dialog
        open={uploadDialogOpen}
        onClose={() => setUploadDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>上传文档</DialogTitle>
        <DialogContent>
          <Box
            border="2px dashed"
            borderColor="grey.300"
            borderRadius={1}
            p={3}
            textAlign="center"
          >
            <input
              type="file"
              multiple
              accept=".txt,.pdf,.docx,.md"
              onChange={(e) => handleFileUpload(e.target.files)}
              style={{ display: 'none' }}
              id="file-upload"
            />
            <label htmlFor="file-upload">
              <Button
                variant="outlined"
                component="span"
                startIcon={<UploadIcon />}
                disabled={loading}
              >
                选择文件
              </Button>
            </label>
            <Typography variant="body2" color="text.secondary" mt={1}>
              支持 .txt, .pdf, .docx, .md 格式
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUploadDialogOpen(false)}>关闭</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default KnowledgeBaseManager;
```

## 实践练习

### 练习1：基础功能测试
实现一个简单的测试用例，验证系统的基本功能：

```python
import asyncio
import pytest
from unittest.mock import Mock, patch

class TestIntelliQASystem:
    """IntelliQA系统测试"""
    
    def setup_method(self):
        """测试初始化"""
        self.kb_id = "test_kb_001"
        self.mock_db = Mock()
        self.mock_vector_client = Mock()
        
        # 创建测试用的知识库服务
        self.kb_service = KnowledgeBaseService(
            self.kb_id, 
            self.mock_db, 
            self.mock_vector_client
        )
        
        # 创建测试用的问答引擎
        self.qa_engine = IntelliQAEngine(self.kb_id)
    
    @pytest.mark.asyncio
    async def test_add_text_document(self):
        """测试添加文本文档"""
        # 准备测试数据
        title = "测试文档"
        content = "这是一个测试文档，包含一些测试内容。"
        
        # 执行添加文档
        doc_id = await self.kb_service.add_document(
            title=title,
            content=content,
            source_type="text"
        )
        
        # 验证结果
        assert doc_id is not None
        assert len(doc_id) > 0
    
    def test_query_processing(self):
        """测试查询处理"""
        # 模拟上下文数据
        mock_context = [
            {
                "content": "Python是一种编程语言",
                "source": "test_doc",
                "score": 0.95
            }
        ]
        
        # 模拟检索结果
        with patch.object(self.qa_engine, 'retrieve_context', return_value=mock_context):
            result = self.qa_engine.forward("什么是Python？")
            
            # 验证结果结构
            assert "answer" in result
            assert "confidence" in result
            assert "sources" in result
            assert isinstance(result["confidence"], float)
            assert 0 <= result["confidence"] <= 1
    
    def test_document_chunking(self):
        """测试文档分块"""
        # 准备长文本
        long_text = "这是一段很长的文本。" * 100
        
        # 执行分块
        chunks = self.kb_service.text_splitter.split_text(long_text)
        
        # 验证分块结果
        assert len(chunks) > 1
        assert all(len(chunk) <= 1000 for chunk in chunks)
    
    @pytest.mark.asyncio
    async def test_error_handling(self):
        """测试错误处理"""
        # 测试无效文档
        with pytest.raises(Exception):
            await self.kb_service.add_document(
                title="",  # 空标题
                content="",
                source_type="invalid_type"
            )
    
    def test_performance_metrics(self):
        """测试性能指标"""
        import time
        
        # 模拟查询
        start_time = time.time()
        result = self.qa_engine.forward("测试问题")
        end_time = time.time()
        
        # 验证响应时间
        response_time = end_time - start_time
        assert response_time < 5.0  # 响应时间应小于5秒

# 运行测试
if __name__ == "__main__":
    pytest.main([__file__, "-v"])
```

### 练习2：性能优化
实现缓存和批处理优化：

```python
import redis
import pickle
from typing import List, Dict, Any
import hashlib
import asyncio
from concurrent.futures import ThreadPoolExecutor

class OptimizedIntelliQAEngine(IntelliQAEngine):
    """优化版智能问答引擎"""
    
    def __init__(self, knowledge_base_id: str):
        super().__init__(knowledge_base_id)
        
        # Redis缓存
        self.redis_client = redis.Redis(
            host='localhost',
            port=6379,
            decode_responses=False
        )
        
        # 线程池用于并发处理
        self.executor = ThreadPoolExecutor(max_workers=4)
        
        # 缓存配置
        self.cache_ttl = 3600  # 1小时
        self.enable_cache = True
    
    def _get_cache_key(self, query: str, context_hash: str) -> str:
        """生成缓存键"""
        content = f"{query}:{context_hash}:{self.kb_id}"
        return f"qa_cache:{hashlib.md5(content.encode()).hexdigest()}"
    
    def _get_context_hash(self, context: List[Dict]) -> str:
        """计算上下文哈希"""
        content = "".join([ctx["content"] for ctx in context])
        return hashlib.md5(content.encode()).hexdigest()
    
    async def retrieve_context_batch(self, queries: List[str], top_k: int = 5) -> List[List[Dict]]:
        """批量检索上下文"""
        tasks = []
        for query in queries:
            task = asyncio.create_task(
                asyncio.get_event_loop().run_in_executor(
                    self.executor,
                    self.retrieve_context,
                    query,
                    top_k
                )
            )
            tasks.append(task)
        
        results = await asyncio.gather(*tasks)
        return results
    
    def forward(self, question: str, history: str = "") -> Dict[str, Any]:
        """优化版问答处理"""
        try:
            # 1. 检索上下文
            context = self.retrieve_context(question)
            if not context:
                return self._empty_response("无相关上下文")
            
            # 2. 检查缓存
            context_hash = self._get_context_hash(context)
            cache_key = self._get_cache_key(question, context_hash)
            
            if self.enable_cache:
                cached_result = self._get_from_cache(cache_key)
                if cached_result:
                    return cached_result
            
            # 3. 生成答案
            result = self.generate_answer(question, context, history)
            
            # 4. 缓存结果
            if self.enable_cache:
                self._save_to_cache(cache_key, result)
            
            return result
            
        except Exception as e:
            return self._error_response(str(e))
    
    def _get_from_cache(self, cache_key: str) -> Optional[Dict[str, Any]]:
        """从缓存获取结果"""
        try:
            cached_data = self.redis_client.get(cache_key)
            if cached_data:
                return pickle.loads(cached_data)
        except Exception as e:
            logging.warning(f"缓存读取失败: {str(e)}")
        return None
    
    def _save_to_cache(self, cache_key: str, result: Dict[str, Any]):
        """保存到缓存"""
        try:
            self.redis_client.setex(
                cache_key,
                self.cache_ttl,
                pickle.dumps(result)
            )
        except Exception as e:
            logging.warning(f"缓存保存失败: {str(e)}")
    
    def _empty_response(self, message: str) -> Dict[str, Any]:
        """空响应"""
        return {
            "answer": message,
            "confidence": 0.0,
            "sources": [],
            "verification": {"is_accurate": False, "issues": [message], "suggestions": []},
            "context_used": []
        }
    
    def _error_response(self, error: str) -> Dict[str, Any]:
        """错误响应"""
        return {
            "answer": "处理您的问题时发生错误，请稍后重试。",
            "confidence": 0.0,
            "sources": [],
            "verification": {"is_accurate": False, "issues": [error], "suggestions": []},
            "context_used": []
        }
    
    async def warm_up_cache(self, common_queries: List[str]):
        """预热缓存"""
        logging.info("开始预热缓存...")
        
        tasks = []
        for query in common_queries:
            task = asyncio.create_task(
                asyncio.get_event_loop().run_in_executor(
                    self.executor,
                    self.forward,
                    query
                )
            )
            tasks.append(task)
        
        await asyncio.gather(*tasks)
        logging.info("缓存预热完成")
```

### 练习3：监控和告警
实现系统监控和告警机制：

```python
import logging
from typing import Dict, Any, List
from dataclasses import dataclass, asdict
from datetime import datetime, timedelta
import json
import smtplib
from email.mime.text import MimeText
from email.mime.multipart import MimeMultipart
import threading
import time
from collections import defaultdict, deque

@dataclass
class SystemMetrics:
    """系统指标"""
    timestamp: datetime
    queries_per_minute: int
    average_response_time: float
    error_rate: float
    cache_hit_rate: float
    active_connections: int
    memory_usage: float
    cpu_usage: float

@dataclass
class Alert:
    """告警信息"""
    id: str
    level: str  # info, warning, error, critical
    title: str
    description: str
    timestamp: datetime
    resolved: bool = False
    metadata: Dict[str, Any] = None

class MonitoringService:
    """监控服务"""
    
    def __init__(self):
        self.metrics_history = deque(maxlen=1000)  # 保留最近1000条记录
        self.active_alerts = {}
        self.alert_rules = []
        self.query_times = deque(maxlen=100)  # 最近100次查询的响应时间
        self.error_counts = defaultdict(int)
        self.cache_stats = {"hits": 0, "misses": 0}
        
        # 启动监控线程
        self.monitoring_thread = threading.Thread(target=self._monitoring_loop, daemon=True)
        self.monitoring_thread.start()
        
        # 配置告警规则
        self._setup_alert_rules()
    
    def _setup_alert_rules(self):
        """设置告警规则"""
        self.alert_rules = [
            {
                "name": "high_response_time",
                "condition": lambda m: m.average_response_time > 5.0,
                "level": "warning",
                "title": "响应时间过长",
                "description": lambda m: f"平均响应时间: {m.average_response_time:.2f}秒"
            },
            {
                "name": "high_error_rate",
                "condition": lambda m: m.error_rate > 0.1,
                "level": "error",
                "title": "错误率过高",
                "description": lambda m: f"错误率: {m.error_rate:.2%}"
            },
            {
                "name": "low_cache_hit_rate",
                "condition": lambda m: m.cache_hit_rate < 0.3,
                "level": "warning",
                "title": "缓存命中率低",
                "description": lambda m: f"缓存命中率: {m.cache_hit_rate:.2%}"
            },
            {
                "name": "high_memory_usage",
                "condition": lambda m: m.memory_usage > 0.8,
                "level": "error",
                "title": "内存使用率过高",
                "description": lambda m: f"内存使用率: {m.memory_usage:.2%}"
            }
        ]
    
    def record_query_time(self, response_time: float):
        """记录查询响应时间"""
        self.query_times.append(response_time)
    
    def record_error(self, error_type: str):
        """记录错误"""
        self.error_counts[error_type] += 1
    
    def record_cache_hit(self, hit: bool):
        """记录缓存命中"""
        if hit:
            self.cache_stats["hits"] += 1
        else:
            self.cache_stats["misses"] += 1
    
    def get_current_metrics(self) -> SystemMetrics:
        """获取当前系统指标"""
        import psutil
        
        # 计算查询频率（每分钟）
        now = datetime.now()
        one_minute_ago = now - timedelta(minutes=1)
        recent_queries = len([t for t in self.query_times 
                             if (now - one_minute_ago).total_seconds() < 60])
        
        # 计算平均响应时间
        avg_response_time = sum(self.query_times) / len(self.query_times) if self.query_times else 0
        
        # 计算错误率
        total_errors = sum(self.error_counts.values())
        total_requests = len(self.query_times)
        error_rate = total_errors / max(total_requests, 1)
        
        # 计算缓存命中率
        total_cache_requests = self.cache_stats["hits"] + self.cache_stats["misses"]
        cache_hit_rate = self.cache_stats["hits"] / max(total_cache_requests, 1)
        
        # 系统资源使用情况
        memory_usage = psutil.virtual_memory().percent / 100
        cpu_usage = psutil.cpu_percent() / 100
        
        return SystemMetrics(
            timestamp=now,
            queries_per_minute=recent_queries,
            average_response_time=avg_response_time,
            error_rate=error_rate,
            cache_hit_rate=cache_hit_rate,
            active_connections=0,  # 这里需要从应用层获取
            memory_usage=memory_usage,
            cpu_usage=cpu_usage
        )
    
    def _monitoring_loop(self):
        """监控循环"""
        while True:
            try:
                # 收集指标
                metrics = self.get_current_metrics()
                self.metrics_history.append(metrics)
                
                # 检查告警规则
                self._check_alerts(metrics)
                
                # 等待下一次检查
                time.sleep(60)  # 每分钟检查一次
                
            except Exception as e:
                logging.error(f"监控循环错误: {str(e)}")
                time.sleep(10)
    
    def _check_alerts(self, metrics: SystemMetrics):
        """检查告警规则"""
        for rule in self.alert_rules:
            try:
                if rule["condition"](metrics):
                    # 触发告警
                    alert_id = f"{rule['name']}_{int(time.time())}"
                    if rule["name"] not in self.active_alerts:
                        alert = Alert(
                            id=alert_id,
                            level=rule["level"],
                            title=rule["title"],
                            description=rule["description"](metrics),
                            timestamp=metrics.timestamp
                        )
                        self.active_alerts[rule["name"]] = alert
                        self._send_alert(alert)
                else:
                    # 告警恢复
                    if rule["name"] in self.active_alerts:
                        alert = self.active_alerts[rule["name"]]
                        alert.resolved = True
                        self._send_recovery_notification(alert)
                        del self.active_alerts[rule["name"]]
                        
            except Exception as e:
                logging.error(f"检查告警规则失败 {rule['name']}: {str(e)}")
    
    def _send_alert(self, alert: Alert):
        """发送告警"""
        logging.warning(f"告警触发: {alert.title} - {alert.description}")
        
        # 这里可以集成多种通知方式
        # 1. 邮件通知
        self._send_email_alert(alert)
        
        # 2. Webhook通知
        self._send_webhook_alert(alert)
        
        # 3. 短信通知（生产环境）
        # self._send_sms_alert(alert)
    
    def _send_recovery_notification(self, alert: Alert):
        """发送恢复通知"""
        logging.info(f"告警恢复: {alert.title}")
    
    def _send_email_alert(self, alert: Alert):
        """发送邮件告警"""
        try:
            # 邮件配置（应该从配置文件读取）
            smtp_server = "smtp.gmail.com"
            smtp_port = 587
            sender_email = "your-email@gmail.com"
            sender_password = "your-password"
            recipient_email = "admin@yourcompany.com"
            
            # 创建邮件
            msg = MimeMultipart()
            msg["From"] = sender_email
            msg["To"] = recipient_email
            msg["Subject"] = f"[{alert.level.upper()}] {alert.title}"
            
            body = f"""
            告警详情:
            - 级别: {alert.level}
            - 标题: {alert.title}
            - 描述: {alert.description}
            - 时间: {alert.timestamp}
            
            请及时处理。
            """
            
            msg.attach(MimeText(body, "plain"))
            
            # 发送邮件
            with smtplib.SMTP(smtp_server, smtp_port) as server:
                server.starttls()
                server.login(sender_email, sender_password)
                server.send_message(msg)
                
        except Exception as e:
            logging.error(f"发送邮件告警失败: {str(e)}")
    
    def _send_webhook_alert(self, alert: Alert):
        """发送Webhook告警"""
        try:
            import requests
            
            webhook_url = "https://your-webhook-url.com/alerts"
            
            payload = {
                "alert": asdict(alert),
                "system": "IntelliQA",
                "environment": "production"
            }
            
            requests.post(webhook_url, json=payload, timeout=10)
            
        except Exception as e:
            logging.error(f"发送Webhook告警失败: {str(e)}")
    
    def get_dashboard_data(self) -> Dict[str, Any]:
        """获取仪表盘数据"""
        current_metrics = self.get_current_metrics()
        recent_metrics = list(self.metrics_history)[-50:]  # 最近50条记录
        
        return {
            "current_metrics": asdict(current_metrics),
            "metrics_history": [asdict(m) for m in recent_metrics],
            "active_alerts": [asdict(alert) for alert in self.active_alerts.values()],
            "system_health": self._calculate_health_score(current_metrics)
        }
    
    def _calculate_health_score(self, metrics: SystemMetrics) -> Dict[str, Any]:
        """计算系统健康评分"""
        score = 100
        issues = []
        
        if metrics.average_response_time > 3.0:
            score -= 20
            issues.append("响应时间较慢")
        
        if metrics.error_rate > 0.05:
            score -= 30
            issues.append("错误率较高")
        
        if metrics.cache_hit_rate < 0.5:
            score -= 15
            issues.append("缓存效率低")
        
        if metrics.memory_usage > 0.8:
            score -= 25
            issues.append("内存使用率高")
        
        if metrics.cpu_usage > 0.8:
            score -= 20
            issues.append("CPU使用率高")
        
        return {
            "score": max(score, 0),
            "status": "excellent" if score >= 90 else "good" if score >= 70 else "warning" if score >= 50 else "critical",
            "issues": issues
        }

# 全局监控服务实例
monitoring_service = MonitoringService()
```

## 最佳实践

### 1. 代码组织
- **模块化设计**：将功能分解为独立的模块
- **依赖注入**：使用依赖注入提高可测试性
- **配置管理**：将配置与代码分离

### 2. 错误处理
- **优雅降级**：确保系统在部分功能失效时仍能工作
- **错误记录**：详细记录错误信息用于调试
- **用户友好**：向用户提供清晰的错误提示

### 3. 性能优化
- **缓存策略**：合理使用缓存提高响应速度
- **异步处理**：使用异步I/O处理并发请求
- **资源管理**：合理管理数据库连接和内存使用

### 4. 安全考虑
- **输入验证**：严格验证所有用户输入
- **权限控制**：实现细粒度的权限管理
- **数据加密**：敏感数据加密存储和传输

### 5. 部署和维护
- **容器化**：使用Docker进行统一部署
- **监控告警**：实现全面的系统监控
- **自动化测试**：建立完整的测试体系

## 总结

通过这个实战项目，我们成功构建了一个完整的智能知识问答系统，该系统集成了DSPy的核心技术，包括：

1. **系统架构**：采用微服务架构，实现了前后端分离
2. **核心功能**：知识库管理、智能问答、用户管理等
3. **技术集成**：RAG检索、向量数据库、缓存优化等
4. **生产特性**：监控告警、错误处理、性能优化等

这个项目展示了如何将DSPy技术应用到实际的生产环境中，为构建类似的AI应用提供了完整的参考范例。
