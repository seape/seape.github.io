---
title: "第05章：检索增强生成 (RAG) 与DSPy"
date: 2025-09-01
icon: circle-dot
author: Haiyue
category:
  - aws
star: false
---
# 第05章：检索增强生成 (RAG) 与DSPy

::: tip 学习目标
- 在DSPy中实现检索增强生成
- 配置和使用向量数据库
- 设计检索策略和评估指标
- 构建多跳检索系统
- 优化检索和生成的协同效果
:::

## 知识点

### 1. RAG 系统基础架构

检索增强生成（Retrieval-Augmented Generation, RAG）是一种结合信息检索和文本生成的技术，能够让语言模型访问外部知识库。

#### RAG 系统的核心组件

```python
import dspy
import numpy as np
from typing import List, Dict, Any, Optional
import json
from pathlib import Path

class RAGSystem:
    """完整的RAG系统架构"""
    
    def __init__(self, 
                 vector_store=None,
                 embedding_model=None,
                 retrieval_k: int = 5,
                 rerank: bool = True):
        
        self.vector_store = vector_store
        self.embedding_model = embedding_model
        self.retrieval_k = retrieval_k
        self.rerank = rerank
        
        # 初始化DSPy组件
        self.setup_dspy_modules()
    
    def setup_dspy_modules(self):
        """设置DSPy模块"""
        
        # 查询理解和重写
        self.query_rewriter = dspy.ChainOfThought(
            "original_query -> reasoning, rewritten_query",
            instructions="分析用户查询的意图，重写为更适合检索的形式。考虑同义词、相关概念和检索关键词。"
        )
        
        # 检索相关性判断
        self.relevance_judge = dspy.ChainOfThought(
            "query, document -> reasoning, relevance_score",
            instructions="判断文档与查询的相关性，给出1-10的相关性评分和详细理由。"
        )
        
        # 答案生成
        self.answer_generator = dspy.ChainOfThought(
            "query, retrieved_contexts -> reasoning, answer",
            instructions="基于检索到的相关文档，生成准确、完整的答案。确保答案有事实依据。"
        )
        
        # 答案验证
        self.answer_verifier = dspy.ChainOfThought(
            "query, answer, contexts -> reasoning, verification_result",
            instructions="验证生成的答案是否与检索的文档一致，是否完整回答了问题。"
        )
    
    def process_query(self, query: str) -> Dict[str, Any]:
        """处理查询的完整流程"""
        
        # 1. 查询重写
        rewritten = self.query_rewriter(original_query=query)
        
        # 2. 检索文档
        retrieved_docs = self.retrieve_documents(rewritten.rewritten_query)
        
        # 3. 重排序（如果启用）
        if self.rerank:
            retrieved_docs = self.rerank_documents(query, retrieved_docs)
        
        # 4. 生成答案
        contexts = self.prepare_contexts(retrieved_docs)
        answer_result = self.answer_generator(
            query=query, 
            retrieved_contexts=contexts
        )
        
        # 5. 验证答案
        verification = self.answer_verifier(
            query=query,
            answer=answer_result.answer,
            contexts=contexts
        )
        
        return {
            'original_query': query,
            'rewritten_query': rewritten.rewritten_query,
            'retrieved_documents': retrieved_docs,
            'answer': answer_result.answer,
            'reasoning': answer_result.reasoning,
            'verification': verification.verification_result,
            'confidence_score': self.calculate_confidence(verification)
        }
    
    def retrieve_documents(self, query: str) -> List[Dict]:
        """检索相关文档"""
        if not self.vector_store:
            # 模拟检索结果
            return self.mock_retrieval(query)
        
        # 实际的向量检索实现
        query_embedding = self.embedding_model.encode(query)
        results = self.vector_store.similarity_search(
            query_embedding, 
            k=self.retrieval_k
        )
        
        return [
            {
                'content': doc.page_content,
                'metadata': doc.metadata,
                'score': score
            }
            for doc, score in results
        ]
    
    def rerank_documents(self, query: str, documents: List[Dict]) -> List[Dict]:
        """重排序文档"""
        scored_docs = []
        
        for doc in documents:
            # 使用DSPy模块计算相关性得分
            relevance_result = self.relevance_judge(
                query=query,
                document=doc['content']
            )
            
            try:
                # 提取数字评分
                import re
                score_match = re.search(r'(\d+(?:\.\d+)?)', relevance_result.relevance_score)
                score = float(score_match.group(1)) if score_match else 5.0
            except:
                score = 5.0
            
            doc['rerank_score'] = score
            doc['rerank_reasoning'] = relevance_result.reasoning
            scored_docs.append(doc)
        
        # 按重排序分数排序
        return sorted(scored_docs, key=lambda x: x['rerank_score'], reverse=True)
    
    def prepare_contexts(self, documents: List[Dict]) -> str:
        """准备上下文字符串"""
        contexts = []
        for i, doc in enumerate(documents, 1):
            context = f"文档 {i}:\n{doc['content']}\n"
            if 'metadata' in doc and doc['metadata']:
                context += f"来源: {doc['metadata'].get('source', 'Unknown')}\n"
            contexts.append(context)
        
        return "\n".join(contexts)
    
    def calculate_confidence(self, verification_result) -> float:
        """计算置信度得分"""
        # 简单的置信度计算
        if "高置信度" in verification_result.verification_result or "完全正确" in verification_result.verification_result:
            return 0.9
        elif "中等置信度" in verification_result.verification_result or "基本正确" in verification_result.verification_result:
            return 0.7
        elif "低置信度" in verification_result.verification_result or "部分正确" in verification_result.verification_result:
            return 0.5
        else:
            return 0.3
    
    def mock_retrieval(self, query: str) -> List[Dict]:
        """模拟检索结果用于演示"""
        mock_docs = [
            {
                'content': '人工智能是计算机科学的一个分支，致力于创建能够执行通常需要人类智能的任务的系统。',
                'metadata': {'source': 'AI_textbook.pdf', 'page': 1},
                'score': 0.95
            },
            {
                'content': '机器学习是人工智能的一个子领域，专注于开发算法，使计算机能够从数据中学习和改进。',
                'metadata': {'source': 'ML_guide.pdf', 'page': 12},
                'score': 0.89
            },
            {
                'content': '深度学习使用多层神经网络来模拟人脑的工作方式，在图像识别和自然语言处理方面取得了重大突破。',
                'metadata': {'source': 'DL_research.pdf', 'page': 5},
                'score': 0.87
            }
        ]
        return mock_docs

# 使用示例
def demonstrate_rag_system():
    """演示RAG系统的使用"""
    
    # 初始化RAG系统
    rag = RAGSystem(retrieval_k=3, rerank=True)
    
    # 处理查询
    query = "什么是人工智能？"
    result = rag.process_query(query)
    
    print("🔍 RAG系统处理结果:")
    print(f"原始查询: {result['original_query']}")
    print(f"重写查询: {result['rewritten_query']}")
    print(f"答案: {result['answer']}")
    print(f"置信度: {result['confidence_score']:.2f}")
    print(f"验证结果: {result['verification']}")
    
    return result

# result = demonstrate_rag_system()
```

### 2. 向量数据库集成

向量数据库是RAG系统的核心组件，负责存储和检索文档嵌入。

```python
class VectorStoreManager:
    """向量数据库管理器"""
    
    def __init__(self, 
                 store_type='faiss',  # 'faiss', 'chroma', 'pinecone'
                 embedding_dim=768,
                 distance_metric='cosine'):
        
        self.store_type = store_type
        self.embedding_dim = embedding_dim
        self.distance_metric = distance_metric
        self.vector_store = None
        self.documents = []
        self.embeddings = []
        
        self.initialize_store()
    
    def initialize_store(self):
        """初始化向量存储"""
        if self.store_type == 'faiss':
            self.initialize_faiss()
        elif self.store_type == 'chroma':
            self.initialize_chroma()
        else:
            raise ValueError(f"Unsupported store type: {self.store_type}")
    
    def initialize_faiss(self):
        """初始化FAISS向量存储"""
        try:
            import faiss
            
            # 创建FAISS索引
            if self.distance_metric == 'cosine':
                # 余弦相似度使用内积，需要归一化
                self.index = faiss.IndexFlatIP(self.embedding_dim)
            else:
                # L2距离
                self.index = faiss.IndexFlatL2(self.embedding_dim)
                
            print(f"✅ FAISS索引初始化完成，维度: {self.embedding_dim}")
            
        except ImportError:
            print("❌ FAISS未安装，请运行: pip install faiss-cpu")
            raise
    
    def initialize_chroma(self):
        """初始化Chroma向量存储"""
        try:
            import chromadb
            
            self.chroma_client = chromadb.Client()
            self.collection = self.chroma_client.create_collection(
                name="documents",
                metadata={"hnsw:space": self.distance_metric}
            )
            
            print("✅ Chroma数据库初始化完成")
            
        except ImportError:
            print("❌ Chroma未安装，请运行: pip install chromadb")
            raise
    
    def add_documents(self, documents: List[str], metadatas: List[Dict] = None):
        """添加文档到向量存储"""
        
        # 生成文档嵌入
        embeddings = self.generate_embeddings(documents)
        
        if self.store_type == 'faiss':
            self.add_to_faiss(documents, embeddings, metadatas)
        elif self.store_type == 'chroma':
            self.add_to_chroma(documents, embeddings, metadatas)
    
    def generate_embeddings(self, texts: List[str]) -> np.ndarray:
        """生成文本嵌入"""
        # 这里使用简单的模拟嵌入，实际应用中应使用真实的嵌入模型
        embeddings = []
        for text in texts:
            # 模拟嵌入生成
            embedding = np.random.rand(self.embedding_dim).astype('float32')
            
            # 如果使用余弦相似度，需要归一化
            if self.distance_metric == 'cosine':
                embedding = embedding / np.linalg.norm(embedding)
            
            embeddings.append(embedding)
        
        return np.array(embeddings)
    
    def add_to_faiss(self, documents: List[str], embeddings: np.ndarray, metadatas: List[Dict]):
        """添加文档到FAISS"""
        # 添加到索引
        self.index.add(embeddings)
        
        # 保存文档和元数据
        for i, doc in enumerate(documents):
            self.documents.append(doc)
            if metadatas and i < len(metadatas):
                self.documents[-1] = {
                    'content': doc,
                    'metadata': metadatas[i],
                    'id': len(self.documents) - 1
                }
        
        print(f"📚 添加了 {len(documents)} 个文档到FAISS")
    
    def add_to_chroma(self, documents: List[str], embeddings: np.ndarray, metadatas: List[Dict]):
        """添加文档到Chroma"""
        ids = [f"doc_{i}" for i in range(len(self.documents), len(self.documents) + len(documents))]
        
        self.collection.add(
            embeddings=embeddings.tolist(),
            documents=documents,
            metadatas=metadatas or [{}] * len(documents),
            ids=ids
        )
        
        self.documents.extend(documents)
        print(f"📚 添加了 {len(documents)} 个文档到Chroma")
    
    def similarity_search(self, query: str, k: int = 5) -> List[Dict]:
        """相似性搜索"""
        query_embedding = self.generate_embeddings([query])[0]
        
        if self.store_type == 'faiss':
            return self.search_faiss(query_embedding, k)
        elif self.store_type == 'chroma':
            return self.search_chroma(query_embedding, k)
    
    def search_faiss(self, query_embedding: np.ndarray, k: int) -> List[Dict]:
        """在FAISS中搜索"""
        scores, indices = self.index.search(query_embedding.reshape(1, -1), k)
        
        results = []
        for i, (score, idx) in enumerate(zip(scores[0], indices[0])):
            if idx < len(self.documents):
                doc = self.documents[idx]
                if isinstance(doc, dict):
                    results.append({
                        'content': doc['content'],
                        'metadata': doc['metadata'],
                        'score': float(score),
                        'rank': i + 1
                    })
                else:
                    results.append({
                        'content': doc,
                        'metadata': {},
                        'score': float(score),
                        'rank': i + 1
                    })
        
        return results
    
    def search_chroma(self, query_embedding: np.ndarray, k: int) -> List[Dict]:
        """在Chroma中搜索"""
        results = self.collection.query(
            query_embeddings=[query_embedding.tolist()],
            n_results=k
        )
        
        formatted_results = []
        for i in range(len(results['documents'][0])):
            formatted_results.append({
                'content': results['documents'][0][i],
                'metadata': results['metadatas'][0][i] if results['metadatas'][0] else {},
                'score': 1.0 - results['distances'][0][i],  # 转换距离为相似度
                'rank': i + 1
            })
        
        return formatted_results
    
    def get_statistics(self) -> Dict:
        """获取数据库统计信息"""
        stats = {
            'total_documents': len(self.documents),
            'store_type': self.store_type,
            'embedding_dim': self.embedding_dim,
            'distance_metric': self.distance_metric
        }
        
        if self.store_type == 'faiss':
            stats['index_size'] = self.index.ntotal
        
        return stats

# 高级检索策略
class AdvancedRetriever:
    """高级检索器，支持多种检索策略"""
    
    def __init__(self, vector_store: VectorStoreManager):
        self.vector_store = vector_store
        self.retrieval_strategies = {
            'semantic': self.semantic_search,
            'hybrid': self.hybrid_search,
            'multi_query': self.multi_query_search,
            'contextual': self.contextual_search
        }
    
    def semantic_search(self, query: str, k: int = 5) -> List[Dict]:
        """语义搜索"""
        return self.vector_store.similarity_search(query, k)
    
    def hybrid_search(self, query: str, k: int = 5, alpha: float = 0.7) -> List[Dict]:
        """混合搜索（语义+关键词）"""
        # 语义搜索结果
        semantic_results = self.semantic_search(query, k * 2)
        
        # 关键词搜索结果
        keyword_results = self.keyword_search(query, k * 2)
        
        # 混合排序
        combined_results = self.combine_search_results(
            semantic_results, keyword_results, alpha
        )
        
        return combined_results[:k]
    
    def keyword_search(self, query: str, k: int) -> List[Dict]:
        """关键词搜索（简化版BM25）"""
        query_terms = query.lower().split()
        scored_docs = []
        
        for i, doc_data in enumerate(self.vector_store.documents):
            if isinstance(doc_data, dict):
                doc_text = doc_data['content'].lower()
                metadata = doc_data.get('metadata', {})
            else:
                doc_text = doc_data.lower()
                metadata = {}
            
            # 简化的BM25评分
            score = 0
            for term in query_terms:
                term_freq = doc_text.count(term)
                if term_freq > 0:
                    # 简化的BM25公式
                    score += term_freq / (term_freq + 1.2) * 2.2
            
            if score > 0:
                scored_docs.append({
                    'content': doc_data['content'] if isinstance(doc_data, dict) else doc_data,
                    'metadata': metadata,
                    'score': score,
                    'rank': 0  # 将在排序后设置
                })
        
        # 按得分排序
        scored_docs.sort(key=lambda x: x['score'], reverse=True)
        
        # 设置排名
        for i, doc in enumerate(scored_docs[:k]):
            doc['rank'] = i + 1
        
        return scored_docs[:k]
    
    def combine_search_results(self, semantic_results: List[Dict], 
                              keyword_results: List[Dict], 
                              alpha: float) -> List[Dict]:
        """组合搜索结果"""
        # 创建文档到得分的映射
        doc_scores = {}
        
        # 语义搜索结果
        for result in semantic_results:
            doc_id = hash(result['content'])
            doc_scores[doc_id] = {
                'doc': result,
                'semantic_score': result['score'] * alpha,
                'keyword_score': 0
            }
        
        # 关键词搜索结果
        for result in keyword_results:
            doc_id = hash(result['content'])
            if doc_id in doc_scores:
                doc_scores[doc_id]['keyword_score'] = result['score'] * (1 - alpha)
            else:
                doc_scores[doc_id] = {
                    'doc': result,
                    'semantic_score': 0,
                    'keyword_score': result['score'] * (1 - alpha)
                }
        
        # 计算最终得分
        final_results = []
        for doc_id, scores in doc_scores.items():
            final_score = scores['semantic_score'] + scores['keyword_score']
            doc = scores['doc'].copy()
            doc['score'] = final_score
            doc['semantic_score'] = scores['semantic_score']
            doc['keyword_score'] = scores['keyword_score']
            final_results.append(doc)
        
        # 排序
        final_results.sort(key=lambda x: x['score'], reverse=True)
        
        # 更新排名
        for i, doc in enumerate(final_results):
            doc['rank'] = i + 1
        
        return final_results
    
    def multi_query_search(self, query: str, k: int = 5) -> List[Dict]:
        """多查询搜索"""
        # 生成查询变体
        query_variants = self.generate_query_variants(query)
        
        all_results = []
        for variant in query_variants:
            results = self.semantic_search(variant, k)
            all_results.extend(results)
        
        # 去重和重排序
        unique_results = self.deduplicate_results(all_results)
        return unique_results[:k]
    
    def generate_query_variants(self, query: str) -> List[str]:
        """生成查询变体"""
        # 简化版查询变体生成
        variants = [query]
        
        # 添加同义词替换（这里使用简单的规则）
        synonyms = {
            'AI': ['人工智能', '机器智能'],
            '机器学习': ['ML', '自动学习'],
            '深度学习': ['DL', '神经网络学习']
        }
        
        for original, syns in synonyms.items():
            if original in query:
                for syn in syns:
                    variants.append(query.replace(original, syn))
        
        return variants[:3]  # 限制变体数量
    
    def contextual_search(self, query: str, context: str = "", k: int = 5) -> List[Dict]:
        """上下文感知搜索"""
        # 将查询和上下文结合
        if context:
            enhanced_query = f"{context} {query}"
        else:
            enhanced_query = query
        
        return self.semantic_search(enhanced_query, k)
    
    def deduplicate_results(self, results: List[Dict]) -> List[Dict]:
        """去重搜索结果"""
        seen_contents = set()
        unique_results = []
        
        for result in results:
            content_hash = hash(result['content'])
            if content_hash not in seen_contents:
                seen_contents.add(content_hash)
                unique_results.append(result)
        
        # 按得分重新排序
        unique_results.sort(key=lambda x: x['score'], reverse=True)
        
        return unique_results

# 使用示例
def demonstrate_vector_store():
    """演示向量存储的使用"""
    
    # 初始化向量存储
    vector_store = VectorStoreManager(store_type='faiss', embedding_dim=768)
    
    # 准备文档
    documents = [
        "人工智能是模拟人类智能的技术",
        "机器学习是人工智能的重要分支",
        "深度学习使用神经网络进行学习",
        "自然语言处理让机器理解人类语言",
        "计算机视觉让机器能够看到和理解图像"
    ]
    
    metadatas = [
        {"source": "AI_basics.pdf", "chapter": 1},
        {"source": "ML_guide.pdf", "chapter": 2},
        {"source": "DL_tutorial.pdf", "chapter": 1},
        {"source": "NLP_handbook.pdf", "chapter": 3},
        {"source": "CV_principles.pdf", "chapter": 1}
    ]
    
    # 添加文档
    vector_store.add_documents(documents, metadatas)
    
    # 初始化高级检索器
    retriever = AdvancedRetriever(vector_store)
    
    # 测试不同检索策略
    query = "什么是机器学习？"
    
    print("🔍 语义搜索结果:")
    semantic_results = retriever.semantic_search(query, k=3)
    for result in semantic_results:
        print(f"  得分: {result['score']:.3f} - {result['content']}")
    
    print("\n🔍 混合搜索结果:")
    hybrid_results = retriever.hybrid_search(query, k=3)
    for result in hybrid_results:
        print(f"  得分: {result['score']:.3f} - {result['content']}")
    
    return vector_store, retriever

# vector_store, retriever = demonstrate_vector_store()
```

### 3. 多跳检索系统

多跳检索能够通过多轮检索来回答复杂问题，特别适合需要综合多个信息源的场景。

```python
class MultiHopRAG(dspy.Module):
    """多跳检索系统"""
    
    def __init__(self, 
                 retriever,
                 max_hops: int = 3,
                 min_confidence: float = 0.7):
        
        super().__init__()
        self.retriever = retriever
        self.max_hops = max_hops
        self.min_confidence = min_confidence
        
        # DSPy模块
        self.question_decomposer = dspy.ChainOfThought(
            "complex_question -> reasoning, sub_questions",
            instructions="将复杂问题分解为多个简单的子问题，每个子问题应该能够独立回答。"
        )
        
        self.answer_synthesizer = dspy.ChainOfThought(
            "original_question, sub_answers -> reasoning, final_answer",
            instructions="基于子问题的答案，综合生成对原始问题的完整回答。"
        )
        
        self.hop_planner = dspy.ChainOfThought(
            "question, current_context -> reasoning, next_query",
            instructions="基于当前上下文和问题，决定下一步检索的查询。"
        )
        
        self.termination_judge = dspy.ChainOfThought(
            "question, gathered_info -> reasoning, should_continue",
            instructions="判断是否已收集足够信息回答问题，输出'继续'或'停止'。"
        )
    
    def forward(self, question: str):
        """多跳检索的主要流程"""
        
        # 分解问题
        decomposition = self.question_decomposer(complex_question=question)
        sub_questions = self.parse_sub_questions(decomposition.sub_questions)
        
        print(f"🔍 问题分解结果: {len(sub_questions)} 个子问题")
        for i, sq in enumerate(sub_questions, 1):
            print(f"  {i}. {sq}")
        
        # 多跳检索
        hop_results = []
        current_context = ""
        
        for hop in range(self.max_hops):
            print(f"\n🔄 第 {hop + 1} 跳检索")
            
            # 决定下一个查询
            if hop == 0:
                next_query = question
            else:
                hop_plan = self.hop_planner(
                    question=question,
                    current_context=current_context
                )
                next_query = hop_plan.next_query
            
            print(f"查询: {next_query}")
            
            # 执行检索
            retrieved_docs = self.retriever.semantic_search(next_query, k=5)
            
            # 更新上下文
            new_context = self.format_retrieved_docs(retrieved_docs)
            current_context = self.update_context(current_context, new_context)
            
            hop_results.append({
                'hop': hop + 1,
                'query': next_query,
                'retrieved_docs': retrieved_docs,
                'context': new_context
            })
            
            # 判断是否应该继续
            termination = self.termination_judge(
                question=question,
                gathered_info=current_context
            )
            
            print(f"终止判断: {termination.should_continue}")
            
            if "停止" in termination.should_continue:
                print("🏁 收集到足够信息，停止检索")
                break
        
        # 综合答案
        final_answer = self.synthesize_answer(question, hop_results, current_context)
        
        return dspy.Prediction(
            question=question,
            sub_questions=sub_questions,
            hop_results=hop_results,
            final_context=current_context,
            answer=final_answer.answer,
            reasoning=final_answer.reasoning
        )
    
    def parse_sub_questions(self, sub_questions_text: str) -> List[str]:
        """解析子问题"""
        import re
        
        # 使用正则表达式提取子问题
        questions = re.findall(r'\d+[.\)]?\s*(.+?)(?=\d+[.\)]|$)', sub_questions_text, re.MULTILINE)
        
        # 清理和过滤
        cleaned_questions = []
        for q in questions:
            q = q.strip().rstrip('?') + '?'
            if len(q) > 5:  # 过滤太短的问题
                cleaned_questions.append(q)
        
        return cleaned_questions[:5]  # 限制子问题数量
    
    def format_retrieved_docs(self, docs: List[Dict]) -> str:
        """格式化检索到的文档"""
        formatted_docs = []
        
        for i, doc in enumerate(docs, 1):
            doc_text = f"文档{i}: {doc['content']}\n"
            if doc.get('metadata'):
                doc_text += f"来源: {doc['metadata'].get('source', 'Unknown')}\n"
            formatted_docs.append(doc_text)
        
        return "\n".join(formatted_docs)
    
    def update_context(self, current_context: str, new_context: str) -> str:
        """更新上下文，避免过长"""
        combined = current_context + "\n" + new_context if current_context else new_context
        
        # 简单的长度控制
        max_length = 2000
        if len(combined) > max_length:
            # 保留最新的信息
            combined = "..." + combined[-max_length:]
        
        return combined
    
    def synthesize_answer(self, question: str, hop_results: List[Dict], context: str):
        """综合答案"""
        
        # 收集所有子答案
        sub_answers = []
        for hop_result in hop_results:
            sub_answers.append(f"第{hop_result['hop']}跳: {hop_result['query']}")
        
        # 生成最终答案
        synthesis_result = self.answer_synthesizer(
            original_question=question,
            sub_answers=context
        )
        
        return synthesis_result

# 自适应RAG系统
class AdaptiveRAG(dspy.Module):
    """自适应RAG系统，根据问题类型选择最佳策略"""
    
    def __init__(self, retriever):
        super().__init__()
        self.retriever = retriever
        
        # 不同的RAG策略
        self.simple_rag = self.create_simple_rag()
        self.multi_hop_rag = MultiHopRAG(retriever)
        
        # 问题分类器
        self.question_classifier = dspy.ChainOfThought(
            "question -> reasoning, complexity, strategy",
            instructions="""分析问题的复杂度和类型：
            - 简单问题：可以直接通过单次检索回答
            - 复杂问题：需要多步推理或多次检索
            - 策略选择：'simple' 或 'multi_hop'"""
        )
    
    def create_simple_rag(self):
        """创建简单RAG模块"""
        class SimpleRAG(dspy.Module):
            def __init__(self, retriever):
                super().__init__()
                self.retriever = retriever
                self.generator = dspy.ChainOfThought(
                    "question, context -> reasoning, answer"
                )
            
            def forward(self, question):
                docs = self.retriever.semantic_search(question, k=5)
                context = "\n".join([doc['content'] for doc in docs])
                result = self.generator(question=question, context=context)
                return dspy.Prediction(
                    answer=result.answer,
                    reasoning=result.reasoning,
                    retrieved_docs=docs
                )
        
        return SimpleRAG(self.retriever)
    
    def forward(self, question: str):
        """自适应选择RAG策略"""
        
        # 分类问题
        classification = self.question_classifier(question=question)
        
        print(f"🤖 问题分析: {classification.complexity}")
        print(f"🎯 选择策略: {classification.strategy}")
        
        # 根据分类选择策略
        if "multi_hop" in classification.strategy.lower() or "复杂" in classification.complexity:
            result = self.multi_hop_rag(question)
        else:
            result = self.simple_rag(question)
        
        # 添加策略信息
        result.strategy_used = classification.strategy
        result.complexity_analysis = classification.complexity
        
        return result

# 使用示例和测试
def test_multi_hop_rag():
    """测试多跳RAG系统"""
    
    # 模拟向量存储
    class MockRetriever:
        def semantic_search(self, query, k=5):
            # 模拟不同查询的检索结果
            mock_responses = {
                "人工智能的历史": [
                    {'content': '人工智能概念最早由Alan Turing在1950年提出', 'score': 0.9, 'metadata': {'source': 'AI_history.pdf'}},
                    {'content': '1956年达特茅斯会议标志着AI领域的正式诞生', 'score': 0.85, 'metadata': {'source': 'AI_timeline.pdf'}},
                ],
                "机器学习发展": [
                    {'content': '机器学习在1980年代开始快速发展', 'score': 0.88, 'metadata': {'source': 'ML_development.pdf'}},
                    {'content': '深度学习在2010年代取得重大突破', 'score': 0.92, 'metadata': {'source': 'DL_breakthrough.pdf'}},
                ],
                "默认": [
                    {'content': f'关于"{query}"的相关信息...', 'score': 0.7, 'metadata': {'source': 'general.pdf'}}
                ]
            }
            
            # 根据查询返回相应结果
            for key, docs in mock_responses.items():
                if key in query:
                    return docs
            
            return mock_responses["默认"]
    
    # 初始化多跳RAG
    mock_retriever = MockRetriever()
    multi_hop = MultiHopRAG(mock_retriever, max_hops=2)
    
    # 测试复杂问题
    complex_question = "人工智能的历史发展经历了哪些重要阶段，机器学习在其中起到了什么作用？"
    
    print("🚀 测试多跳RAG系统")
    print(f"问题: {complex_question}")
    
    result = multi_hop(complex_question)
    
    print(f"\n📝 最终答案: {result.answer}")
    print(f"\n🔍 检索了 {len(result.hop_results)} 跳")
    
    return result

# 执行测试
# test_result = test_multi_hop_rag()
```

### 4. 检索评估和优化

```python
class RAGEvaluator:
    """RAG系统评估器"""
    
    def __init__(self):
        self.evaluation_metrics = {
            'retrieval_precision': self.calculate_retrieval_precision,
            'retrieval_recall': self.calculate_retrieval_recall,
            'answer_relevance': self.evaluate_answer_relevance,
            'answer_faithfulness': self.evaluate_answer_faithfulness,
            'answer_completeness': self.evaluate_answer_completeness
        }
    
    def evaluate_rag_system(self, 
                           rag_system,
                           test_dataset: List[Dict],
                           ground_truth: List[Dict]) -> Dict:
        """全面评估RAG系统"""
        
        results = []
        
        for i, test_case in enumerate(test_dataset):
            print(f"📊 评估测试案例 {i+1}/{len(test_dataset)}")
            
            # 获取RAG系统的输出
            rag_output = rag_system.process_query(test_case['question'])
            
            # 计算各项指标
            case_metrics = {}
            
            for metric_name, metric_func in self.evaluation_metrics.items():
                try:
                    score = metric_func(
                        test_case,
                        rag_output,
                        ground_truth[i] if i < len(ground_truth) else {}
                    )
                    case_metrics[metric_name] = score
                except Exception as e:
                    print(f"⚠️  计算指标 {metric_name} 时出错: {e}")
                    case_metrics[metric_name] = 0.0
            
            results.append({
                'question': test_case['question'],
                'rag_output': rag_output,
                'metrics': case_metrics
            })
        
        # 计算总体统计
        overall_metrics = self.calculate_overall_metrics(results)
        
        return {
            'individual_results': results,
            'overall_metrics': overall_metrics,
            'summary': self.generate_evaluation_summary(overall_metrics)
        }
    
    def calculate_retrieval_precision(self, test_case: Dict, rag_output: Dict, ground_truth: Dict) -> float:
        """计算检索精确率"""
        retrieved_docs = rag_output.get('retrieved_documents', [])
        relevant_docs = ground_truth.get('relevant_documents', [])
        
        if not retrieved_docs:
            return 0.0
        
        relevant_retrieved = 0
        for doc in retrieved_docs:
            if any(rel_doc in doc['content'] for rel_doc in relevant_docs):
                relevant_retrieved += 1
        
        return relevant_retrieved / len(retrieved_docs)
    
    def calculate_retrieval_recall(self, test_case: Dict, rag_output: Dict, ground_truth: Dict) -> float:
        """计算检索召回率"""
        retrieved_docs = rag_output.get('retrieved_documents', [])
        relevant_docs = ground_truth.get('relevant_documents', [])
        
        if not relevant_docs:
            return 1.0
        
        found_relevant = 0
        for rel_doc in relevant_docs:
            if any(rel_doc in doc['content'] for doc in retrieved_docs):
                found_relevant += 1
        
        return found_relevant / len(relevant_docs)
    
    def evaluate_answer_relevance(self, test_case: Dict, rag_output: Dict, ground_truth: Dict) -> float:
        """评估答案相关性"""
        # 使用DSPy模块评估答案相关性
        relevance_evaluator = dspy.ChainOfThought(
            "question, answer -> reasoning, relevance_score",
            instructions="评估答案与问题的相关性，给出0-1的分数。1表示完全相关，0表示完全不相关。"
        )
        
        try:
            result = relevance_evaluator(
                question=test_case['question'],
                answer=rag_output['answer']
            )
            
            # 提取数字评分
            import re
            score_match = re.search(r'(\d*\.?\d+)', result.relevance_score)
            if score_match:
                score = float(score_match.group(1))
                return min(max(score, 0.0), 1.0)  # 确保在0-1范围内
            
        except Exception as e:
            print(f"相关性评估失败: {e}")
        
        return 0.5  # 默认中等相关性
    
    def evaluate_answer_faithfulness(self, test_case: Dict, rag_output: Dict, ground_truth: Dict) -> float:
        """评估答案忠实性（是否基于检索内容）"""
        faithfulness_evaluator = dspy.ChainOfThought(
            "answer, retrieved_contexts -> reasoning, faithfulness_score",
            instructions="评估答案是否忠实于检索到的上下文，给出0-1的分数。1表示完全忠实，0表示完全背离。"
        )
        
        try:
            contexts = "\n".join([doc['content'] for doc in rag_output.get('retrieved_documents', [])])
            
            result = faithfulness_evaluator(
                answer=rag_output['answer'],
                retrieved_contexts=contexts
            )
            
            import re
            score_match = re.search(r'(\d*\.?\d+)', result.faithfulness_score)
            if score_match:
                score = float(score_match.group(1))
                return min(max(score, 0.0), 1.0)
            
        except Exception as e:
            print(f"忠实性评估失败: {e}")
        
        return 0.5
    
    def evaluate_answer_completeness(self, test_case: Dict, rag_output: Dict, ground_truth: Dict) -> float:
        """评估答案完整性"""
        expected_answer = ground_truth.get('expected_answer', '')
        actual_answer = rag_output['answer']
        
        if not expected_answer:
            return 0.5  # 没有参考答案时返回中等分数
        
        # 简单的完整性度量：检查关键概念是否被提及
        expected_concepts = set(expected_answer.lower().split())
        actual_concepts = set(actual_answer.lower().split())
        
        if not expected_concepts:
            return 1.0
        
        covered_concepts = len(expected_concepts & actual_concepts)
        return covered_concepts / len(expected_concepts)
    
    def calculate_overall_metrics(self, results: List[Dict]) -> Dict:
        """计算总体指标"""
        overall = {}
        
        # 计算每个指标的平均值
        for metric_name in self.evaluation_metrics.keys():
            scores = [r['metrics'][metric_name] for r in results if metric_name in r['metrics']]
            if scores:
                overall[metric_name] = {
                    'mean': sum(scores) / len(scores),
                    'min': min(scores),
                    'max': max(scores),
                    'std': self.calculate_std(scores)
                }
        
        # 计算综合分数
        if overall:
            composite_scores = []
            for result in results:
                metrics = result['metrics']
                if metrics:
                    # 加权平均（可以根据需要调整权重）
                    weights = {
                        'retrieval_precision': 0.2,
                        'retrieval_recall': 0.2,
                        'answer_relevance': 0.3,
                        'answer_faithfulness': 0.2,
                        'answer_completeness': 0.1
                    }
                    
                    weighted_score = sum(
                        metrics.get(metric, 0) * weight 
                        for metric, weight in weights.items()
                    )
                    composite_scores.append(weighted_score)
            
            if composite_scores:
                overall['composite_score'] = {
                    'mean': sum(composite_scores) / len(composite_scores),
                    'min': min(composite_scores),
                    'max': max(composite_scores),
                    'std': self.calculate_std(composite_scores)
                }
        
        return overall
    
    def calculate_std(self, scores: List[float]) -> float:
        """计算标准差"""
        if len(scores) < 2:
            return 0.0
        
        mean = sum(scores) / len(scores)
        variance = sum((x - mean) ** 2 for x in scores) / (len(scores) - 1)
        return variance ** 0.5
    
    def generate_evaluation_summary(self, overall_metrics: Dict) -> str:
        """生成评估总结"""
        summary = []
        summary.append("🎯 RAG系统评估总结")
        summary.append("=" * 40)
        
        if 'composite_score' in overall_metrics:
            composite = overall_metrics['composite_score']
            summary.append(f"📊 综合得分: {composite['mean']:.3f} (±{composite['std']:.3f})")
        
        summary.append("\n📈 详细指标:")
        for metric_name, stats in overall_metrics.items():
            if metric_name != 'composite_score':
                summary.append(f"  {metric_name}: {stats['mean']:.3f} (±{stats['std']:.3f})")
        
        # 性能建议
        summary.append("\n💡 优化建议:")
        
        if overall_metrics.get('retrieval_precision', {}).get('mean', 0) < 0.6:
            summary.append("  - 检索精确率较低，建议优化检索策略或重排序算法")
        
        if overall_metrics.get('retrieval_recall', {}).get('mean', 0) < 0.6:
            summary.append("  - 检索召回率较低，建议扩大检索范围或改进查询扩展")
        
        if overall_metrics.get('answer_faithfulness', {}).get('mean', 0) < 0.7:
            summary.append("  - 答案忠实性不足，建议加强对检索内容的依赖")
        
        return "\n".join(summary)

# 使用示例
def run_rag_evaluation():
    """运行RAG评估示例"""
    
    # 准备测试数据
    test_dataset = [
        {
            'question': '什么是机器学习？',
        },
        {
            'question': '深度学习的主要特点是什么？',
        }
    ]
    
    ground_truth = [
        {
            'expected_answer': '机器学习是人工智能的一个分支，让计算机能够从数据中学习',
            'relevant_documents': ['机器学习是人工智能的一个分支']
        },
        {
            'expected_answer': '深度学习使用多层神经网络，能够自动提取特征',
            'relevant_documents': ['深度学习使用神经网络']
        }
    ]
    
    # 创建模拟RAG系统
    class MockRAGSystem:
        def process_query(self, query):
            return {
                'answer': f'关于"{query}"的答案...',
                'retrieved_documents': [
                    {'content': '相关文档内容...', 'score': 0.8}
                ]
            }
    
    # 执行评估
    evaluator = RAGEvaluator()
    rag_system = MockRAGSystem()
    
    results = evaluator.evaluate_rag_system(rag_system, test_dataset, ground_truth)
    
    print(results['summary'])
    
    return results

# evaluation_results = run_rag_evaluation()
```

## 实践练习

### 练习1：构建领域特定RAG系统

```python
class DomainSpecificRAG:
    """领域特定RAG系统练习"""
    
    def __init__(self, domain: str):
        self.domain = domain
        # TODO: 实现领域特定的RAG系统
        pass
    
    def add_domain_documents(self, documents):
        """添加领域文档"""
        # TODO: 实现领域文档处理
        pass
    
    def query_with_domain_context(self, query):
        """带领域上下文的查询"""
        # TODO: 实现领域相关的查询处理
        pass

# 练习任务：
# 1. 选择一个特定领域（如医疗、法律、技术）
# 2. 实现领域特定的文档预处理
# 3. 设计领域相关的评估指标
```

### 练习2：实时RAG系统

```python
class RealTimeRAG:
    """实时RAG系统练习"""
    
    def __init__(self):
        # TODO: 实现实时更新的RAG系统
        pass
    
    def update_knowledge_base(self, new_documents):
        """实时更新知识库"""
        # TODO: 实现增量更新
        pass
    
    def handle_concurrent_queries(self, queries):
        """处理并发查询"""
        # TODO: 实现并发处理
        pass

# 练习任务：
# 1. 实现增量索引更新
# 2. 设计缓存策略
# 3. 优化并发性能
```

## 最佳实践

### 1. 检索优化策略

```python
def retrieval_optimization_guide():
    """检索优化策略指南"""
    
    strategies = {
        '查询优化': [
            '查询扩展：添加同义词和相关术语',
            '查询重写：将复杂查询分解为简单查询',
            '多查询生成：生成多个查询变体'
        ],
        
        '检索策略': [
            '混合检索：结合语义搜索和关键词搜索',
            '多跳检索：针对复杂问题进行多轮检索',
            '上下文感知检索：考虑对话历史和上下文'
        ],
        
        '重排序优化': [
            '相关性重排序：使用更精确的相关性模型',
            '多样性重排序：确保结果的多样性',
            '时间加权：考虑信息的时效性'
        ],
        
        '答案生成': [
            '上下文压缩：提取最相关的信息片段',
            '多文档融合：综合多个文档的信息',
            '答案验证：检查答案的事实性和一致性'
        ]
    }
    
    return strategies

# 性能监控
class RAGPerformanceMonitor:
    """RAG性能监控器"""
    
    def __init__(self):
        self.metrics = {
            'latency': [],
            'retrieval_accuracy': [],
            'answer_quality': []
        }
    
    def monitor_query_performance(self, query_func):
        """监控查询性能的装饰器"""
        import time
        import functools
        
        @functools.wraps(query_func)
        def wrapper(*args, **kwargs):
            start_time = time.time()
            result = query_func(*args, **kwargs)
            end_time = time.time()
            
            # 记录延迟
            latency = end_time - start_time
            self.metrics['latency'].append(latency)
            
            # 记录其他指标
            self.record_performance_metrics(result)
            
            return result
        
        return wrapper
    
    def record_performance_metrics(self, result):
        """记录性能指标"""
        # TODO: 实现指标记录逻辑
        pass
    
    def generate_performance_report(self):
        """生成性能报告"""
        if self.metrics['latency']:
            avg_latency = sum(self.metrics['latency']) / len(self.metrics['latency'])
            print(f"平均延迟: {avg_latency:.3f}秒")
        
        # TODO: 生成更详细的报告
```

通过本章的学习，你应该掌握了在DSPy中实现检索增强生成系统的完整方法。RAG系统是现代AI应用的重要组成部分，能够让语言模型访问外部知识并生成更准确的答案。在实际应用中，要根据具体的业务需求和数据特点来选择合适的检索策略和优化方法。