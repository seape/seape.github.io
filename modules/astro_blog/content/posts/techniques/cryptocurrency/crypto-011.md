---
title: "第11章：实战项目：构建简单区块链"
date: "2024-12-06"
icon: "🔗"
author: "Claude"
category: "Cryptocurrency"
---

# 第11章：实战项目：构建简单区块链

## 11.1 项目概览与架构设计

### 11.1.1 项目目标

本章将指导你从零开始构建一个完整的区块链系统，包含以下核心功能：

```python
"""
SimpleCoin 区块链项目
====================

功能特性：
1. 基础区块链结构
2. 工作量证明共识机制
3. 交易系统
4. 数字钱包
5. 点对点网络
6. REST API接口
7. 简单的Web界面

技术栈：
- Python 3.8+
- Flask (Web API)
- Cryptography (密码学)
- Requests (网络通信)
- SQLite (数据存储)
"""

import hashlib
import json
import time
import threading
from datetime import datetime
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import rsa, padding
from cryptography.hazmat.backends import default_backend
import base64
import sqlite3
import requests
from flask import Flask, jsonify, request, render_template
import logging

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class SimpleCoinConfig:
    """区块链配置"""
    GENESIS_REWARD = 50
    MINING_REWARD = 10
    MINING_DIFFICULTY = 4
    BLOCK_TIME_TARGET = 10  # 秒
    DIFFICULTY_ADJUSTMENT_INTERVAL = 10  # 区块
    MAX_TRANSACTIONS_PER_BLOCK = 100
    NETWORK_PORT = 5000

    # 数据库配置
    DATABASE_PATH = 'simplecoin.db'

    # API端点
    API_VERSION = 'v1'

config = SimpleCoinConfig()

print("SimpleCoin 区块链项目架构")
print("=" * 50)
print("核心组件:")
print("1. Transaction - 交易系统")
print("2. Block - 区块结构")
print("3. Blockchain - 区块链主类")
print("4. Wallet - 数字钱包")
print("5. Network - P2P网络")
print("6. Miner - 挖矿模块")
print("7. API - REST接口")
print("8. WebUI - Web界面")
```

### 11.1.2 核心数据结构

```python
class Transaction:
    """交易类"""

    def __init__(self, sender, recipient, amount, timestamp=None):
        self.sender = sender  # 发送者公钥哈希
        self.recipient = recipient  # 接收者公钥哈希
        self.amount = amount
        self.timestamp = timestamp or datetime.now().timestamp()
        self.signature = None
        self.transaction_id = None

    def calculate_hash(self):
        """计算交易哈希"""
        tx_string = json.dumps({
            'sender': self.sender,
            'recipient': self.recipient,
            'amount': self.amount,
            'timestamp': self.timestamp
        }, sort_keys=True)
        return hashlib.sha256(tx_string.encode()).hexdigest()

    def sign_transaction(self, private_key):
        """签名交易"""
        if self.sender is None:  # 挖矿奖励交易
            return

        tx_hash = self.calculate_hash().encode()
        signature = private_key.sign(
            tx_hash,
            padding.PSS(
                mgf=padding.MGF1(hashes.SHA256()),
                salt_length=padding.PSS.MAX_LENGTH
            ),
            hashes.SHA256()
        )
        self.signature = base64.b64encode(signature).decode()
        self.transaction_id = self.calculate_hash()

    def verify_signature(self, public_key):
        """验证交易签名"""
        if self.sender is None:  # 挖矿奖励交易
            return True

        if not self.signature:
            return False

        try:
            signature = base64.b64decode(self.signature.encode())
            tx_hash = self.calculate_hash().encode()

            public_key.verify(
                signature,
                tx_hash,
                padding.PSS(
                    mgf=padding.MGF1(hashes.SHA256()),
                    salt_length=padding.PSS.MAX_LENGTH
                ),
                hashes.SHA256()
            )
            return True
        except Exception as e:
            logger.error(f"签名验证失败: {e}")
            return False

    def to_dict(self):
        """转换为字典"""
        return {
            'transaction_id': self.transaction_id,
            'sender': self.sender,
            'recipient': self.recipient,
            'amount': self.amount,
            'timestamp': self.timestamp,
            'signature': self.signature
        }

    @classmethod
    def from_dict(cls, data):
        """从字典创建交易"""
        tx = cls(
            sender=data['sender'],
            recipient=data['recipient'],
            amount=data['amount'],
            timestamp=data['timestamp']
        )
        tx.signature = data.get('signature')
        tx.transaction_id = data.get('transaction_id')
        return tx

class Block:
    """区块类"""

    def __init__(self, index, transactions, previous_hash, timestamp=None):
        self.index = index
        self.transactions = transactions
        self.previous_hash = previous_hash
        self.timestamp = timestamp or datetime.now().timestamp()
        self.nonce = 0
        self.hash = None
        self.merkle_root = self.calculate_merkle_root()

    def calculate_merkle_root(self):
        """计算Merkle根"""
        if not self.transactions:
            return '0' * 64

        # 简化的Merkle树实现
        tx_hashes = [tx.calculate_hash() for tx in self.transactions]

        while len(tx_hashes) > 1:
            new_hashes = []
            for i in range(0, len(tx_hashes), 2):
                if i + 1 < len(tx_hashes):
                    combined = tx_hashes[i] + tx_hashes[i + 1]
                else:
                    combined = tx_hashes[i] + tx_hashes[i]
                new_hashes.append(hashlib.sha256(combined.encode()).hexdigest())
            tx_hashes = new_hashes

        return tx_hashes[0]

    def calculate_hash(self):
        """计算区块哈希"""
        block_string = json.dumps({
            'index': self.index,
            'previous_hash': self.previous_hash,
            'timestamp': self.timestamp,
            'merkle_root': self.merkle_root,
            'nonce': self.nonce
        }, sort_keys=True)
        return hashlib.sha256(block_string.encode()).hexdigest()

    def mine_block(self, difficulty):
        """挖矿"""
        target = "0" * difficulty
        start_time = time.time()
        attempts = 0

        logger.info(f"开始挖矿区块 {self.index}, 难度: {difficulty}")

        while True:
            self.hash = self.calculate_hash()
            attempts += 1

            if self.hash[:difficulty] == target:
                end_time = time.time()
                mining_time = end_time - start_time
                hash_rate = attempts / mining_time if mining_time > 0 else 0

                logger.info(f"区块 {self.index} 挖矿成功!")
                logger.info(f"哈希: {self.hash}")
                logger.info(f"Nonce: {self.nonce}")
                logger.info(f"耗时: {mining_time:.2f}秒")
                logger.info(f"哈希率: {hash_rate:.0f} H/s")
                break

            self.nonce += 1

            # 每100万次尝试显示一次进度
            if attempts % 1000000 == 0:
                logger.info(f"挖矿进度: {attempts:,} 次尝试")

    def to_dict(self):
        """转换为字典"""
        return {
            'index': self.index,
            'transactions': [tx.to_dict() for tx in self.transactions],
            'previous_hash': self.previous_hash,
            'timestamp': self.timestamp,
            'nonce': self.nonce,
            'hash': self.hash,
            'merkle_root': self.merkle_root
        }

    @classmethod
    def from_dict(cls, data):
        """从字典创建区块"""
        transactions = [Transaction.from_dict(tx_data) for tx_data in data['transactions']]
        block = cls(
            index=data['index'],
            transactions=transactions,
            previous_hash=data['previous_hash'],
            timestamp=data['timestamp']
        )
        block.nonce = data['nonce']
        block.hash = data['hash']
        block.merkle_root = data['merkle_root']
        return block

# 测试数据结构
print("\n测试基础数据结构:")

# 创建测试交易
tx1 = Transaction("Alice", "Bob", 50)
tx1.transaction_id = tx1.calculate_hash()

tx2 = Transaction("Bob", "Charlie", 25)
tx2.transaction_id = tx2.calculate_hash()

print(f"交易1 ID: {tx1.transaction_id[:16]}...")
print(f"交易2 ID: {tx2.transaction_id[:16]}...")

# 创建测试区块
test_block = Block(1, [tx1, tx2], "0" * 64)
print(f"区块Merkle根: {test_block.merkle_root[:16]}...")
print(f"区块计算哈希: {test_block.calculate_hash()[:16]}...")
```

## 11.2 区块链核心实现

### 11.2.1 主区块链类

```python
class SimpleCoinBlockchain:
    """SimpleCoin区块链主类"""

    def __init__(self):
        self.chain = []
        self.pending_transactions = []
        self.mining_reward = config.MINING_REWARD
        self.difficulty = config.MINING_DIFFICULTY

        # 创建创世区块
        self.create_genesis_block()

        # 初始化数据库
        self.init_database()

        # 网络节点列表
        self.network_nodes = set()

    def init_database(self):
        """初始化数据库"""
        conn = sqlite3.connect(config.DATABASE_PATH)
        cursor = conn.cursor()

        # 创建区块表
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS blocks (
                block_index INTEGER PRIMARY KEY,
                block_hash TEXT UNIQUE,
                previous_hash TEXT,
                timestamp REAL,
                nonce INTEGER,
                merkle_root TEXT,
                block_data TEXT
            )
        ''')

        # 创建交易表
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS transactions (
                transaction_id TEXT PRIMARY KEY,
                block_index INTEGER,
                sender TEXT,
                recipient TEXT,
                amount REAL,
                timestamp REAL,
                signature TEXT,
                FOREIGN KEY (block_index) REFERENCES blocks (block_index)
            )
        ''')

        # 创建UTXO表
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS utxos (
                transaction_id TEXT,
                output_index INTEGER,
                recipient TEXT,
                amount REAL,
                spent INTEGER DEFAULT 0,
                PRIMARY KEY (transaction_id, output_index)
            )
        ''')

        conn.commit()
        conn.close()

    def create_genesis_block(self):
        """创建创世区块"""
        genesis_transaction = Transaction(
            sender=None,
            recipient="genesis",
            amount=config.GENESIS_REWARD
        )
        genesis_transaction.transaction_id = genesis_transaction.calculate_hash()

        genesis_block = Block(0, [genesis_transaction], "0")
        genesis_block.mine_block(self.difficulty)

        self.chain.append(genesis_block)
        logger.info("创世区块已创建")

    def get_latest_block(self):
        """获取最新区块"""
        return self.chain[-1] if self.chain else None

    def add_transaction(self, transaction):
        """添加交易到待确认池"""
        # 验证交易
        if not self.validate_transaction(transaction):
            return False

        self.pending_transactions.append(transaction)
        logger.info(f"交易已添加到交易池: {transaction.transaction_id[:16]}...")
        return True

    def validate_transaction(self, transaction):
        """验证交易"""
        try:
            # 检查基本字段
            if transaction.amount <= 0:
                logger.error("交易金额必须大于0")
                return False

            if transaction.sender == transaction.recipient:
                logger.error("发送者和接收者不能相同")
                return False

            # 挖矿奖励交易特殊处理
            if transaction.sender is None:
                return True

            # 检查余额
            sender_balance = self.get_balance(transaction.sender)
            if sender_balance < transaction.amount:
                logger.error(f"余额不足: {sender_balance} < {transaction.amount}")
                return False

            # 验证签名（这里简化处理，实际需要公钥）
            if not transaction.signature:
                logger.error("交易未签名")
                return False

            return True

        except Exception as e:
            logger.error(f"交易验证失败: {e}")
            return False

    def get_balance(self, address):
        """获取地址余额"""
        balance = 0

        for block in self.chain:
            for transaction in block.transactions:
                if transaction.sender == address:
                    balance -= transaction.amount
                if transaction.recipient == address:
                    balance += transaction.amount

        # 检查待确认交易
        for transaction in self.pending_transactions:
            if transaction.sender == address:
                balance -= transaction.amount

        return balance

    def mine_pending_transactions(self, mining_reward_address):
        """挖矿确认待处理交易"""
        # 创建挖矿奖励交易
        reward_transaction = Transaction(
            sender=None,
            recipient=mining_reward_address,
            amount=self.mining_reward
        )
        reward_transaction.transaction_id = reward_transaction.calculate_hash()

        # 选择交易（简化实现，取前N个）
        transactions_to_include = self.pending_transactions[:config.MAX_TRANSACTIONS_PER_BLOCK]
        transactions_to_include.append(reward_transaction)

        # 创建新区块
        previous_block = self.get_latest_block()
        new_block = Block(
            index=len(self.chain),
            transactions=transactions_to_include,
            previous_hash=previous_block.hash if previous_block else "0"
        )

        # 挖矿
        new_block.mine_block(self.difficulty)

        # 添加到链
        if self.add_block(new_block):
            # 从待确认池中移除已确认交易
            for tx in transactions_to_include[:-1]:  # 除了奖励交易
                if tx in self.pending_transactions:
                    self.pending_transactions.remove(tx)

            # 调整难度
            self.adjust_difficulty()

            # 保存到数据库
            self.save_block_to_db(new_block)

            logger.info(f"新区块已挖出: {new_block.hash[:16]}...")
            return new_block

        return None

    def add_block(self, new_block):
        """添加区块到链"""
        # 验证区块
        if not self.validate_block(new_block):
            return False

        self.chain.append(new_block)
        return True

    def validate_block(self, block):
        """验证区块"""
        try:
            # 检查区块索引
            expected_index = len(self.chain)
            if block.index != expected_index:
                logger.error(f"区块索引错误: {block.index} != {expected_index}")
                return False

            # 检查前一个区块哈希
            if len(self.chain) > 0:
                previous_block = self.chain[-1]
                if block.previous_hash != previous_block.hash:
                    logger.error("前一个区块哈希不匹配")
                    return False

            # 验证区块哈希
            if block.hash != block.calculate_hash():
                logger.error("区块哈希验证失败")
                return False

            # 验证工作量证明
            if not block.hash.startswith("0" * self.difficulty):
                logger.error("工作量证明验证失败")
                return False

            # 验证Merkle根
            if block.merkle_root != block.calculate_merkle_root():
                logger.error("Merkle根验证失败")
                return False

            # 验证所有交易
            for transaction in block.transactions:
                if not self.validate_transaction(transaction):
                    logger.error(f"区块包含无效交易: {transaction.transaction_id}")
                    return False

            return True

        except Exception as e:
            logger.error(f"区块验证失败: {e}")
            return False

    def adjust_difficulty(self):
        """调整挖矿难度"""
        if len(self.chain) % config.DIFFICULTY_ADJUSTMENT_INTERVAL != 0:
            return

        if len(self.chain) < config.DIFFICULTY_ADJUSTMENT_INTERVAL:
            return

        # 计算最近N个区块的平均出块时间
        recent_blocks = self.chain[-config.DIFFICULTY_ADJUSTMENT_INTERVAL:]
        time_span = recent_blocks[-1].timestamp - recent_blocks[0].timestamp
        average_time = time_span / (len(recent_blocks) - 1)

        # 调整难度
        if average_time < config.BLOCK_TIME_TARGET / 2:
            self.difficulty += 1
            logger.info(f"难度增加到: {self.difficulty}")
        elif average_time > config.BLOCK_TIME_TARGET * 2:
            self.difficulty = max(1, self.difficulty - 1)
            logger.info(f"难度降低到: {self.difficulty}")

    def save_block_to_db(self, block):
        """保存区块到数据库"""
        try:
            conn = sqlite3.connect(config.DATABASE_PATH)
            cursor = conn.cursor()

            # 保存区块
            cursor.execute('''
                INSERT OR REPLACE INTO blocks
                (block_index, block_hash, previous_hash, timestamp, nonce, merkle_root, block_data)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ''', (
                block.index,
                block.hash,
                block.previous_hash,
                block.timestamp,
                block.nonce,
                block.merkle_root,
                json.dumps(block.to_dict())
            ))

            # 保存交易
            for tx in block.transactions:
                cursor.execute('''
                    INSERT OR REPLACE INTO transactions
                    (transaction_id, block_index, sender, recipient, amount, timestamp, signature)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                ''', (
                    tx.transaction_id,
                    block.index,
                    tx.sender,
                    tx.recipient,
                    tx.amount,
                    tx.timestamp,
                    tx.signature
                ))

            conn.commit()
            conn.close()

        except Exception as e:
            logger.error(f"保存区块到数据库失败: {e}")

    def validate_chain(self):
        """验证整个链"""
        for i in range(1, len(self.chain)):
            current_block = self.chain[i]
            previous_block = self.chain[i - 1]

            # 验证当前区块
            if not self.validate_block_standalone(current_block):
                return False

            # 验证链接
            if current_block.previous_hash != previous_block.hash:
                return False

        return True

    def validate_block_standalone(self, block):
        """独立验证区块（不依赖链状态）"""
        # 验证哈希
        if block.hash != block.calculate_hash():
            return False

        # 验证工作量证明
        if not block.hash.startswith("0" * self.difficulty):
            return False

        # 验证Merkle根
        if block.merkle_root != block.calculate_merkle_root():
            return False

        return True

    def get_chain_info(self):
        """获取链信息"""
        return {
            'length': len(self.chain),
            'latest_block_hash': self.chain[-1].hash if self.chain else None,
            'difficulty': self.difficulty,
            'pending_transactions': len(self.pending_transactions),
            'total_network_nodes': len(self.network_nodes)
        }

# 测试区块链核心功能
print("\n测试区块链核心功能:")

blockchain = SimpleCoinBlockchain()
print(f"区块链初始化完成，链长度: {len(blockchain.chain)}")

# 创建测试交易
test_tx1 = Transaction("Alice", "Bob", 30)
test_tx1.signature = "dummy_signature_1"  # 简化测试
test_tx1.transaction_id = test_tx1.calculate_hash()

test_tx2 = Transaction("Bob", "Charlie", 15)
test_tx2.signature = "dummy_signature_2"  # 简化测试
test_tx2.transaction_id = test_tx2.calculate_hash()

# 添加交易
blockchain.add_transaction(test_tx1)
blockchain.add_transaction(test_tx2)

print(f"待确认交易数量: {len(blockchain.pending_transactions)}")

# 挖矿
print("开始挖矿...")
mined_block = blockchain.mine_pending_transactions("Miner1")

if mined_block:
    print(f"挖矿成功! 新区块哈希: {mined_block.hash[:16]}...")
    print(f"区块包含交易数: {len(mined_block.transactions)}")
    print(f"链长度: {len(blockchain.chain)}")

# 查看余额
print(f"Miner1余额: {blockchain.get_balance('Miner1')}")

# 链信息
chain_info = blockchain.get_chain_info()
print(f"链信息: {chain_info}")
```

### 11.2.2 数字钱包实现

```python
class SimpleCoinWallet:
    """SimpleCoin数字钱包"""

    def __init__(self, blockchain):
        self.blockchain = blockchain
        self.private_key = None
        self.public_key = None
        self.address = None

        # 生成密钥对
        self.generate_keypair()

    def generate_keypair(self):
        """生成RSA密钥对"""
        self.private_key = rsa.generate_private_key(
            public_exponent=65537,
            key_size=2048,
            backend=default_backend()
        )
        self.public_key = self.private_key.public_key()

        # 从公钥生成地址
        public_key_bytes = self.public_key.public_bytes(
            encoding=serialization.Encoding.DER,
            format=serialization.PublicFormat.SubjectPublicKeyInfo
        )

        self.address = hashlib.sha256(public_key_bytes).hexdigest()[:40]

    def get_balance(self):
        """获取钱包余额"""
        return self.blockchain.get_balance(self.address)

    def create_transaction(self, recipient, amount):
        """创建交易"""
        # 检查余额
        balance = self.get_balance()
        if balance < amount:
            raise ValueError(f"余额不足: {balance} < {amount}")

        # 创建交易
        transaction = Transaction(self.address, recipient, amount)

        # 签名交易
        transaction.sign_transaction(self.private_key)

        return transaction

    def send_money(self, recipient, amount):
        """发送资金"""
        try:
            transaction = self.create_transaction(recipient, amount)

            # 添加到区块链
            if self.blockchain.add_transaction(transaction):
                logger.info(f"交易创建成功: {amount} 发送给 {recipient[:16]}...")
                return transaction
            else:
                raise ValueError("交易添加失败")

        except Exception as e:
            logger.error(f"发送资金失败: {e}")
            return None

    def get_transaction_history(self):
        """获取交易历史"""
        transactions = []

        for block in self.blockchain.chain:
            for tx in block.transactions:
                if tx.sender == self.address or tx.recipient == self.address:
                    tx_info = {
                        'transaction_id': tx.transaction_id,
                        'block_index': block.index,
                        'timestamp': datetime.fromtimestamp(tx.timestamp).strftime('%Y-%m-%d %H:%M:%S'),
                        'sender': tx.sender,
                        'recipient': tx.recipient,
                        'amount': tx.amount,
                        'type': 'sent' if tx.sender == self.address else 'received'
                    }
                    transactions.append(tx_info)

        return sorted(transactions, key=lambda x: x['timestamp'], reverse=True)

    def export_private_key(self):
        """导出私钥"""
        private_key_bytes = self.private_key.private_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PrivateFormat.PKCS8,
            encryption_algorithm=serialization.NoEncryption()
        )
        return base64.b64encode(private_key_bytes).decode()

    def import_private_key(self, private_key_b64):
        """导入私钥"""
        try:
            private_key_bytes = base64.b64decode(private_key_b64.encode())
            self.private_key = serialization.load_pem_private_key(
                private_key_bytes,
                password=None,
                backend=default_backend()
            )
            self.public_key = self.private_key.public_key()

            # 重新生成地址
            public_key_bytes = self.public_key.public_bytes(
                encoding=serialization.Encoding.DER,
                format=serialization.PublicFormat.SubjectPublicKeyInfo
            )

            self.address = hashlib.sha256(public_key_bytes).hexdigest()[:40]
            return True

        except Exception as e:
            logger.error(f"导入私钥失败: {e}")
            return False

    def get_wallet_info(self):
        """获取钱包信息"""
        return {
            'address': self.address,
            'balance': self.get_balance(),
            'transaction_count': len(self.get_transaction_history()),
            'public_key_hash': hashlib.sha256(
                self.public_key.public_bytes(
                    encoding=serialization.Encoding.DER,
                    format=serialization.PublicFormat.SubjectPublicKeyInfo
                )
            ).hexdigest()[:16]
        }

# 钱包管理器
class WalletManager:
    """钱包管理器"""

    def __init__(self, blockchain):
        self.blockchain = blockchain
        self.wallets = {}

    def create_wallet(self, name):
        """创建新钱包"""
        if name in self.wallets:
            raise ValueError(f"钱包 {name} 已存在")

        wallet = SimpleCoinWallet(self.blockchain)
        self.wallets[name] = wallet

        logger.info(f"钱包 {name} 创建成功，地址: {wallet.address[:16]}...")
        return wallet

    def get_wallet(self, name):
        """获取钱包"""
        return self.wallets.get(name)

    def list_wallets(self):
        """列出所有钱包"""
        wallet_list = []
        for name, wallet in self.wallets.items():
            wallet_list.append({
                'name': name,
                'address': wallet.address,
                'balance': wallet.get_balance()
            })
        return wallet_list

    def transfer(self, from_wallet_name, to_address, amount):
        """钱包间转账"""
        from_wallet = self.get_wallet(from_wallet_name)
        if not from_wallet:
            raise ValueError(f"钱包 {from_wallet_name} 不存在")

        return from_wallet.send_money(to_address, amount)

# 测试钱包功能
print("\n测试钱包功能:")

wallet_manager = WalletManager(blockchain)

# 创建钱包
alice_wallet = wallet_manager.create_wallet("Alice")
bob_wallet = wallet_manager.create_wallet("Bob")

print(f"Alice地址: {alice_wallet.address[:20]}...")
print(f"Bob地址: {bob_wallet.address[:20]}...")

# 给Alice一些初始资金（通过挖矿）
print("为Alice挖矿获取资金...")
blockchain.mine_pending_transactions(alice_wallet.address)

print(f"Alice余额: {alice_wallet.get_balance()}")

# Alice向Bob转账
print("Alice向Bob转账20个币...")
tx = alice_wallet.send_money(bob_wallet.address, 20)

if tx:
    print(f"转账交易ID: {tx.transaction_id[:16]}...")
    print(f"待确认交易数: {len(blockchain.pending_transactions)}")

    # 挖矿确认交易
    print("挖矿确认交易...")
    blockchain.mine_pending_transactions("Miner2")

    print(f"Alice余额: {alice_wallet.get_balance()}")
    print(f"Bob余额: {bob_wallet.get_balance()}")

# 查看交易历史
print("\nAlice的交易历史:")
alice_history = alice_wallet.get_transaction_history()
for tx_info in alice_history[:3]:  # 显示最近3笔
    print(f"  {tx_info['type']}: {tx_info['amount']} ({tx_info['timestamp']})")
```

## 11.3 网络层与P2P通信

### 11.3.1 P2P网络实现

```python
class SimpleCoinNetwork:
    """SimpleCoin P2P网络"""

    def __init__(self, blockchain, port=5000):
        self.blockchain = blockchain
        self.port = port
        self.nodes = set()
        self.is_running = False

        # Flask应用
        self.app = Flask(__name__)
        self.setup_routes()

    def setup_routes(self):
        """设置API路由"""

        @self.app.route('/blockchain', methods=['GET'])
        def get_blockchain():
            """获取区块链"""
            chain_data = [block.to_dict() for block in self.blockchain.chain]
            return jsonify({
                'chain': chain_data,
                'length': len(chain_data)
            })

        @self.app.route('/mine', methods=['POST'])
        def mine_block():
            """挖矿"""
            data = request.get_json()
            miner_address = data.get('miner_address')

            if not miner_address:
                return jsonify({'error': '需要提供矿工地址'}), 400

            block = self.blockchain.mine_pending_transactions(miner_address)

            if block:
                # 广播新区块
                self.broadcast_block(block)

                return jsonify({
                    'message': '挖矿成功',
                    'block': block.to_dict()
                })
            else:
                return jsonify({'error': '挖矿失败'}), 500

        @self.app.route('/transactions/new', methods=['POST'])
        def new_transaction():
            """创建新交易"""
            data = request.get_json()

            required_fields = ['sender', 'recipient', 'amount']
            if not all(field in data for field in required_fields):
                return jsonify({'error': '缺少必要字段'}), 400

            transaction = Transaction(
                sender=data['sender'],
                recipient=data['recipient'],
                amount=data['amount']
            )

            # 简化签名处理
            transaction.signature = data.get('signature', 'unsigned')
            transaction.transaction_id = transaction.calculate_hash()

            if self.blockchain.add_transaction(transaction):
                # 广播交易
                self.broadcast_transaction(transaction)

                return jsonify({
                    'message': '交易已添加',
                    'transaction_id': transaction.transaction_id
                })
            else:
                return jsonify({'error': '交易添加失败'}), 400

        @self.app.route('/balance/<address>', methods=['GET'])
        def get_balance(address):
            """获取余额"""
            balance = self.blockchain.get_balance(address)
            return jsonify({'address': address, 'balance': balance})

        @self.app.route('/nodes/register', methods=['POST'])
        def register_nodes():
            """注册新节点"""
            data = request.get_json()
            nodes = data.get('nodes', [])

            for node in nodes:
                self.nodes.add(node)

            return jsonify({
                'message': f'已注册 {len(nodes)} 个新节点',
                'total_nodes': list(self.nodes)
            })

        @self.app.route('/nodes/resolve', methods=['GET'])
        def consensus():
            """共识算法 - 解决冲突"""
            replaced = self.resolve_conflicts()

            if replaced:
                return jsonify({
                    'message': '链已被替换',
                    'new_chain': [block.to_dict() for block in self.blockchain.chain]
                })
            else:
                return jsonify({
                    'message': '当前链是权威链',
                    'chain': [block.to_dict() for block in self.blockchain.chain]
                })

        @self.app.route('/info', methods=['GET'])
        def get_info():
            """获取节点信息"""
            return jsonify({
                'node_id': f"node_{self.port}",
                'port': self.port,
                'blockchain_info': self.blockchain.get_chain_info(),
                'connected_nodes': list(self.nodes)
            })

        @self.app.route('/block/receive', methods=['POST'])
        def receive_block():
            """接收其他节点广播的区块"""
            data = request.get_json()
            block_data = data.get('block')

            if not block_data:
                return jsonify({'error': '缺少区块数据'}), 400

            try:
                block = Block.from_dict(block_data)

                if self.blockchain.add_block(block):
                    logger.info(f"接收到新区块: {block.hash[:16]}...")
                    return jsonify({'message': '区块已添加'})
                else:
                    return jsonify({'error': '区块验证失败'}), 400

            except Exception as e:
                logger.error(f"接收区块失败: {e}")
                return jsonify({'error': '区块处理失败'}), 500

        @self.app.route('/transaction/receive', methods=['POST'])
        def receive_transaction():
            """接收其他节点广播的交易"""
            data = request.get_json()
            tx_data = data.get('transaction')

            if not tx_data:
                return jsonify({'error': '缺少交易数据'}), 400

            try:
                transaction = Transaction.from_dict(tx_data)

                if self.blockchain.add_transaction(transaction):
                    logger.info(f"接收到新交易: {transaction.transaction_id[:16]}...")
                    return jsonify({'message': '交易已添加'})
                else:
                    return jsonify({'error': '交易验证失败'}), 400

            except Exception as e:
                logger.error(f"接收交易失败: {e}")
                return jsonify({'error': '交易处理失败'}), 500

    def start(self, host='127.0.0.1'):
        """启动节点"""
        self.is_running = True
        logger.info(f"启动SimpleCoin节点，端口: {self.port}")

        # 在新线程中启动Flask
        def run_flask():
            self.app.run(host=host, port=self.port, debug=False, threaded=True)

        flask_thread = threading.Thread(target=run_flask)
        flask_thread.daemon = True
        flask_thread.start()

        return flask_thread

    def stop(self):
        """停止节点"""
        self.is_running = False

    def register_node(self, node_address):
        """注册节点"""
        self.nodes.add(node_address)
        logger.info(f"已注册节点: {node_address}")

    def broadcast_transaction(self, transaction):
        """广播交易"""
        for node in self.nodes:
            try:
                url = f"http://{node}/transaction/receive"
                data = {'transaction': transaction.to_dict()}
                response = requests.post(url, json=data, timeout=5)

                if response.status_code == 200:
                    logger.info(f"交易已广播到 {node}")
                else:
                    logger.warning(f"广播交易到 {node} 失败: {response.status_code}")

            except Exception as e:
                logger.error(f"广播交易到 {node} 失败: {e}")

    def broadcast_block(self, block):
        """广播区块"""
        for node in self.nodes:
            try:
                url = f"http://{node}/block/receive"
                data = {'block': block.to_dict()}
                response = requests.post(url, json=data, timeout=5)

                if response.status_code == 200:
                    logger.info(f"区块已广播到 {node}")
                else:
                    logger.warning(f"广播区块到 {node} 失败: {response.status_code}")

            except Exception as e:
                logger.error(f"广播区块到 {node} 失败: {e}")

    def resolve_conflicts(self):
        """解决链冲突 - 最长链规则"""
        neighbors = self.nodes
        new_chain = None
        max_length = len(self.blockchain.chain)

        for node in neighbors:
            try:
                url = f"http://{node}/blockchain"
                response = requests.get(url, timeout=5)

                if response.status_code == 200:
                    data = response.json()
                    length = data['length']
                    chain_data = data['chain']

                    # 检查链是否更长且有效
                    if length > max_length:
                        # 验证链
                        temp_chain = [Block.from_dict(block_data) for block_data in chain_data]

                        if self.validate_chain(temp_chain):
                            max_length = length
                            new_chain = temp_chain

            except Exception as e:
                logger.error(f"从节点 {node} 获取链失败: {e}")

        # 替换链
        if new_chain:
            self.blockchain.chain = new_chain
            logger.info("链已被替换为更长的有效链")
            return True

        return False

    def validate_chain(self, chain):
        """验证链"""
        if not chain:
            return False

        # 检查创世区块
        if chain[0].index != 0:
            return False

        # 验证每个区块
        for i in range(1, len(chain)):
            current_block = chain[i]
            previous_block = chain[i - 1]

            # 验证区块哈希
            if current_block.hash != current_block.calculate_hash():
                return False

            # 验证链接
            if current_block.previous_hash != previous_block.hash:
                return False

            # 验证工作量证明
            if not current_block.hash.startswith("0" * self.blockchain.difficulty):
                return False

        return True

# 测试P2P网络
print("\n测试P2P网络:")

# 创建第一个节点
node1_blockchain = SimpleCoinBlockchain()
node1_network = SimpleCoinNetwork(node1_blockchain, port=5001)

# 启动节点
import time
thread1 = node1_network.start()
time.sleep(1)  # 等待节点启动

print(f"节点1已启动，端口: 5001")

# 测试API调用
try:
    # 测试获取区块链信息
    response = requests.get('http://127.0.0.1:5001/info')
    if response.status_code == 200:
        info = response.json()
        print(f"节点信息: {info['node_id']}")
        print(f"区块链长度: {info['blockchain_info']['length']}")

    # 测试创建交易
    tx_data = {
        'sender': 'Alice',
        'recipient': 'Bob',
        'amount': 50,
        'signature': 'test_signature'
    }

    response = requests.post('http://127.0.0.1:5001/transactions/new', json=tx_data)
    if response.status_code == 200:
        result = response.json()
        print(f"交易已创建: {result['transaction_id'][:16]}...")

    # 测试挖矿
    mine_data = {'miner_address': 'Miner1'}
    response = requests.post('http://127.0.0.1:5001/mine', json=mine_data)
    if response.status_code == 200:
        result = response.json()
        print(f"挖矿成功: {result['block']['hash'][:16]}...")

except Exception as e:
    print(f"API测试失败: {e}")
```

### 11.3.2 多节点网络测试

```python
class NetworkSimulator:
    """网络模拟器"""

    def __init__(self, num_nodes=3):
        self.nodes = []
        self.wallets = []
        self.num_nodes = num_nodes

    def setup_network(self):
        """设置网络"""
        print(f"设置{self.num_nodes}节点网络...")

        # 创建节点
        for i in range(self.num_nodes):
            port = 5010 + i
            blockchain = SimpleCoinBlockchain()
            network = SimpleCoinNetwork(blockchain, port)
            wallet_manager = WalletManager(blockchain)

            self.nodes.append({
                'id': f"node_{i}",
                'port': port,
                'blockchain': blockchain,
                'network': network,
                'wallet_manager': wallet_manager,
                'thread': None
            })

        # 启动所有节点
        for node in self.nodes:
            thread = node['network'].start()
            node['thread'] = thread
            time.sleep(0.5)  # 错开启动时间

        # 节点互相注册
        self.connect_nodes()

    def connect_nodes(self):
        """连接所有节点"""
        print("连接网络节点...")

        for i, node in enumerate(self.nodes):
            other_nodes = []
            for j, other_node in enumerate(self.nodes):
                if i != j:
                    other_nodes.append(f"127.0.0.1:{other_node['port']}")

            # 注册其他节点
            try:
                url = f"http://127.0.0.1:{node['port']}/nodes/register"
                data = {'nodes': other_nodes}
                response = requests.post(url, json=data, timeout=5)

                if response.status_code == 200:
                    print(f"节点 {node['id']} 已连接到网络")

            except Exception as e:
                print(f"连接节点 {node['id']} 失败: {e}")

    def simulate_transactions(self):
        """模拟交易"""
        print("\n模拟交易场景...")

        # 为每个节点创建钱包
        for i, node in enumerate(self.nodes):
            wallet = node['wallet_manager'].create_wallet(f"wallet_{i}")
            print(f"节点{i}钱包地址: {wallet.address[:20]}...")

        time.sleep(1)

        # 第一个节点挖矿获得初始资金
        try:
            url = f"http://127.0.0.1:{self.nodes[0]['port']}/mine"
            wallet_0 = self.nodes[0]['wallet_manager'].get_wallet("wallet_0")
            mine_data = {'miner_address': wallet_0.address}

            response = requests.post(url, json=mine_data, timeout=10)
            if response.status_code == 200:
                print("节点0挖矿成功，获得初始资金")

        except Exception as e:
            print(f"挖矿失败: {e}")

        time.sleep(2)

        # 创建转账交易
        try:
            wallet_0 = self.nodes[0]['wallet_manager'].get_wallet("wallet_0")
            wallet_1 = self.nodes[1]['wallet_manager'].get_wallet("wallet_1")

            if wallet_0 and wallet_1:
                # 节点0向节点1转账
                tx = wallet_0.send_money(wallet_1.address, 5)
                if tx:
                    print(f"转账交易已创建: {tx.transaction_id[:16]}...")

                    time.sleep(1)

                    # 节点1挖矿确认交易
                    url = f"http://127.0.0.1:{self.nodes[1]['port']}/mine"
                    mine_data = {'miner_address': wallet_1.address}

                    response = requests.post(url, json=mine_data, timeout=10)
                    if response.status_code == 200:
                        print("节点1挖矿成功，交易已确认")

        except Exception as e:
            print(f"转账失败: {e}")

    def check_network_consensus(self):
        """检查网络共识"""
        print("\n检查网络共识...")

        chain_hashes = []

        for node in self.nodes:
            try:
                url = f"http://127.0.0.1:{node['port']}/blockchain"
                response = requests.get(url, timeout=5)

                if response.status_code == 200:
                    data = response.json()
                    chain_length = data['length']

                    if chain_length > 0:
                        latest_hash = data['chain'][-1]['hash']
                        chain_hashes.append((node['id'], chain_length, latest_hash[:16]))

            except Exception as e:
                print(f"检查节点 {node['id']} 失败: {e}")

        print("网络状态:")
        for node_id, length, hash_prefix in chain_hashes:
            print(f"  {node_id}: 长度={length}, 最新哈希={hash_prefix}...")

        # 检查是否达成共识
        unique_hashes = set(hash_prefix for _, _, hash_prefix in chain_hashes)
        if len(unique_hashes) == 1:
            print("✅ 网络已达成共识")
        else:
            print("❌ 网络未达成共识，存在分叉")

    def get_network_stats(self):
        """获取网络统计"""
        stats = {
            'total_nodes': len(self.nodes),
            'active_nodes': 0,
            'total_transactions': 0,
            'total_blocks': 0
        }

        for node in self.nodes:
            try:
                url = f"http://127.0.0.1:{node['port']}/info"
                response = requests.get(url, timeout=5)

                if response.status_code == 200:
                    stats['active_nodes'] += 1
                    data = response.json()
                    blockchain_info = data['blockchain_info']
                    stats['total_blocks'] = max(stats['total_blocks'], blockchain_info['length'])

            except:
                pass

        return stats

    def shutdown_network(self):
        """关闭网络"""
        print("关闭网络...")
        for node in self.nodes:
            try:
                node['network'].stop()
            except:
                pass

# 运行网络模拟
print("\n运行多节点网络模拟:")

# 创建网络模拟器
simulator = NetworkSimulator(num_nodes=3)

try:
    # 设置网络
    simulator.setup_network()
    time.sleep(2)

    # 检查初始状态
    stats = simulator.get_network_stats()
    print(f"网络统计: 活跃节点 {stats['active_nodes']}/{stats['total_nodes']}")

    # 模拟交易
    simulator.simulate_transactions()
    time.sleep(3)

    # 检查共识
    simulator.check_network_consensus()

    # 最终统计
    final_stats = simulator.get_network_stats()
    print(f"\n最终统计:")
    print(f"活跃节点: {final_stats['active_nodes']}")
    print(f"区块总数: {final_stats['total_blocks']}")

finally:
    # 清理
    simulator.shutdown_network()
    print("网络模拟结束")
```

## 11.4 Web界面与用户交互

### 11.4.1 Web API接口

```python
class SimpleCoinWebAPI:
    """SimpleCoin Web API"""

    def __init__(self, blockchain, wallet_manager, network):
        self.blockchain = blockchain
        self.wallet_manager = wallet_manager
        self.network = network

        self.app = Flask(__name__)
        self.app.config['SECRET_KEY'] = 'simplecoin-secret-key'

        self.setup_web_routes()

    def setup_web_routes(self):
        """设置Web路由"""

        @self.app.route('/')
        def index():
            """首页"""
            return render_template('index.html')

        @self.app.route('/api/blockchain/info')
        def api_blockchain_info():
            """区块链信息API"""
            return jsonify(self.blockchain.get_chain_info())

        @self.app.route('/api/blocks')
        def api_get_blocks():
            """获取区块列表API"""
            blocks = []
            for block in self.blockchain.chain:
                block_info = {
                    'index': block.index,
                    'hash': block.hash,
                    'previous_hash': block.previous_hash,
                    'timestamp': datetime.fromtimestamp(block.timestamp).strftime('%Y-%m-%d %H:%M:%S'),
                    'nonce': block.nonce,
                    'transaction_count': len(block.transactions),
                    'merkle_root': block.merkle_root
                }
                blocks.append(block_info)

            return jsonify(blocks)

        @self.app.route('/api/block/<int:index>')
        def api_get_block(index):
            """获取特定区块API"""
            if index < 0 or index >= len(self.blockchain.chain):
                return jsonify({'error': '区块不存在'}), 404

            block = self.blockchain.chain[index]
            block_data = block.to_dict()

            # 格式化时间戳
            block_data['timestamp_formatted'] = datetime.fromtimestamp(block.timestamp).strftime('%Y-%m-%d %H:%M:%S')

            return jsonify(block_data)

        @self.app.route('/api/transactions/pending')
        def api_pending_transactions():
            """获取待确认交易API"""
            pending = []
            for tx in self.blockchain.pending_transactions:
                tx_info = {
                    'transaction_id': tx.transaction_id,
                    'sender': tx.sender,
                    'recipient': tx.recipient,
                    'amount': tx.amount,
                    'timestamp': datetime.fromtimestamp(tx.timestamp).strftime('%Y-%m-%d %H:%M:%S')
                }
                pending.append(tx_info)

            return jsonify(pending)

        @self.app.route('/api/wallets')
        def api_list_wallets():
            """钱包列表API"""
            return jsonify(self.wallet_manager.list_wallets())

        @self.app.route('/api/wallet/create', methods=['POST'])
        def api_create_wallet():
            """创建钱包API"""
            data = request.get_json()
            name = data.get('name')

            if not name:
                return jsonify({'error': '需要提供钱包名称'}), 400

            try:
                wallet = self.wallet_manager.create_wallet(name)
                return jsonify({
                    'message': f'钱包 {name} 创建成功',
                    'address': wallet.address,
                    'balance': wallet.get_balance()
                })
            except ValueError as e:
                return jsonify({'error': str(e)}), 400

        @self.app.route('/api/wallet/<wallet_name>/info')
        def api_wallet_info(wallet_name):
            """钱包信息API"""
            wallet = self.wallet_manager.get_wallet(wallet_name)
            if not wallet:
                return jsonify({'error': '钱包不存在'}), 404

            return jsonify(wallet.get_wallet_info())

        @self.app.route('/api/wallet/<wallet_name>/history')
        def api_wallet_history(wallet_name):
            """钱包交易历史API"""
            wallet = self.wallet_manager.get_wallet(wallet_name)
            if not wallet:
                return jsonify({'error': '钱包不存在'}), 404

            return jsonify(wallet.get_transaction_history())

        @self.app.route('/api/transfer', methods=['POST'])
        def api_transfer():
            """转账API"""
            data = request.get_json()

            required_fields = ['from_wallet', 'to_address', 'amount']
            if not all(field in data for field in required_fields):
                return jsonify({'error': '缺少必要字段'}), 400

            try:
                amount = float(data['amount'])
                if amount <= 0:
                    return jsonify({'error': '转账金额必须大于0'}), 400

                transaction = self.wallet_manager.transfer(
                    data['from_wallet'],
                    data['to_address'],
                    amount
                )

                if transaction:
                    return jsonify({
                        'message': '转账成功',
                        'transaction_id': transaction.transaction_id
                    })
                else:
                    return jsonify({'error': '转账失败'}), 500

            except ValueError as e:
                return jsonify({'error': str(e)}), 400
            except Exception as e:
                return jsonify({'error': f'转账处理失败: {str(e)}'}), 500

        @self.app.route('/api/mine', methods=['POST'])
        def api_mine():
            """挖矿API"""
            data = request.get_json()
            miner_address = data.get('miner_address')

            if not miner_address:
                return jsonify({'error': '需要提供矿工地址'}), 400

            try:
                block = self.blockchain.mine_pending_transactions(miner_address)

                if block:
                    # 广播新区块
                    self.network.broadcast_block(block)

                    return jsonify({
                        'message': '挖矿成功',
                        'block_index': block.index,
                        'block_hash': block.hash,
                        'transactions': len(block.transactions),
                        'reward': self.blockchain.mining_reward
                    })
                else:
                    return jsonify({'error': '挖矿失败'}), 500

            except Exception as e:
                return jsonify({'error': f'挖矿处理失败: {str(e)}'}), 500

        @self.app.route('/api/network/stats')
        def api_network_stats():
            """网络统计API"""
            return jsonify({
                'connected_nodes': len(self.network.nodes),
                'node_list': list(self.network.nodes),
                'blockchain_info': self.blockchain.get_chain_info()
            })

# 创建HTML模板目录和文件
import os

def create_web_templates():
    """创建Web模板"""

    # 创建templates目录
    if not os.path.exists('templates'):
        os.makedirs('templates')

    # 创建index.html
    index_html = """
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SimpleCoin 区块链浏览器</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .header {
            text-align: center;
            color: #333;
            border-bottom: 2px solid #007bff;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }

        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }

        .stat-card {
            background: linear-gradient(135deg, #007bff, #0056b3);
            color: white;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
        }

        .stat-card h3 {
            margin: 0 0 10px 0;
            font-size: 1.2em;
        }

        .stat-card .value {
            font-size: 2em;
            font-weight: bold;
        }

        .section {
            margin-bottom: 30px;
        }

        .section h2 {
            color: #333;
            border-left: 4px solid #007bff;
            padding-left: 15px;
            margin-bottom: 20px;
        }

        .table {
            width: 100%;
            border-collapse: collapse;
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        .table th,
        .table td {
            padding: 12px 15px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }

        .table th {
            background-color: #007bff;
            color: white;
            font-weight: bold;
        }

        .table tr:hover {
            background-color: #f8f9fa;
        }

        .btn {
            background-color: #007bff;
            color: white;
            padding: 10px 20px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
            margin: 5px;
        }

        .btn:hover {
            background-color: #0056b3;
        }

        .btn-success {
            background-color: #28a745;
        }

        .btn-success:hover {
            background-color: #1e7e34;
        }

        .form-group {
            margin-bottom: 15px;
        }

        .form-group label {
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
        }

        .form-group input,
        .form-group select {
            width: 100%;
            padding: 8px 12px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 14px;
        }

        .hash {
            font-family: 'Courier New', monospace;
            color: #666;
            word-break: break-all;
        }

        .loading {
            text-align: center;
            padding: 20px;
            color: #666;
        }

        .error {
            background-color: #f8d7da;
            color: #721c24;
            padding: 10px;
            border-radius: 4px;
            margin-bottom: 15px;
        }

        .success {
            background-color: #d4edda;
            color: #155724;
            padding: 10px;
            border-radius: 4px;
            margin-bottom: 15px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>SimpleCoin 区块链浏览器</h1>
            <p>实时区块链数据查看与交互界面</p>
        </div>

        <div class="stats" id="stats">
            <!-- 统计信息将通过JavaScript加载 -->
        </div>

        <div class="section">
            <h2>钱包管理</h2>
            <div style="margin-bottom: 20px;">
                <button class="btn" onclick="createWallet()">创建钱包</button>
                <button class="btn" onclick="refreshWallets()">刷新钱包</button>
            </div>
            <div id="wallets-section">
                <!-- 钱包列表将通过JavaScript加载 -->
            </div>
        </div>

        <div class="section">
            <h2>转账</h2>
            <div style="max-width: 500px;">
                <div class="form-group">
                    <label for="from-wallet">发送钱包:</label>
                    <select id="from-wallet">
                        <option value="">选择钱包</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="to-address">接收地址:</label>
                    <input type="text" id="to-address" placeholder="输入接收地址">
                </div>
                <div class="form-group">
                    <label for="amount">金额:</label>
                    <input type="number" id="amount" min="0" step="0.01" placeholder="输入转账金额">
                </div>
                <button class="btn btn-success" onclick="transfer()">发送转账</button>
            </div>
            <div id="transfer-result"></div>
        </div>

        <div class="section">
            <h2>挖矿</h2>
            <div style="margin-bottom: 20px;">
                <select id="miner-wallet">
                    <option value="">选择矿工钱包</option>
                </select>
                <button class="btn btn-success" onclick="mine()">开始挖矿</button>
            </div>
            <div id="mining-result"></div>
        </div>

        <div class="section">
            <h2>区块链</h2>
            <div style="margin-bottom: 20px;">
                <button class="btn" onclick="refreshBlocks()">刷新区块</button>
            </div>
            <div id="blocks-section">
                <!-- 区块列表将通过JavaScript加载 -->
            </div>
        </div>

        <div class="section">
            <h2>待确认交易</h2>
            <div style="margin-bottom: 20px;">
                <button class="btn" onclick="refreshPendingTransactions()">刷新交易池</button>
            </div>
            <div id="pending-transactions-section">
                <!-- 待确认交易将通过JavaScript加载 -->
            </div>
        </div>
    </div>

    <script>
        // API调用函数
        async function apiCall(url, method = 'GET', data = null) {
            try {
                const options = {
                    method: method,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                };

                if (data) {
                    options.body = JSON.stringify(data);
                }

                const response = await fetch(url, options);
                const result = await response.json();

                if (!response.ok) {
                    throw new Error(result.error || 'API调用失败');
                }

                return result;
            } catch (error) {
                console.error('API调用错误:', error);
                throw error;
            }
        }

        // 显示消息函数
        function showMessage(elementId, message, type = 'success') {
            const element = document.getElementById(elementId);
            const className = type === 'success' ? 'success' : 'error';
            element.innerHTML = `<div class="${className}">${message}</div>`;
        }

        // 加载统计信息
        async function loadStats() {
            try {
                const stats = await apiCall('/api/blockchain/info');
                const networkStats = await apiCall('/api/network/stats');

                const statsHtml = `
                    <div class="stat-card">
                        <h3>区块总数</h3>
                        <div class="value">${stats.length}</div>
                    </div>
                    <div class="stat-card">
                        <h3>挖矿难度</h3>
                        <div class="value">${stats.difficulty}</div>
                    </div>
                    <div class="stat-card">
                        <h3>待确认交易</h3>
                        <div class="value">${stats.pending_transactions}</div>
                    </div>
                    <div class="stat-card">
                        <h3>网络节点</h3>
                        <div class="value">${networkStats.connected_nodes}</div>
                    </div>
                `;

                document.getElementById('stats').innerHTML = statsHtml;
            } catch (error) {
                console.error('加载统计信息失败:', error);
            }
        }

        // 加载钱包列表
        async function loadWallets() {
            try {
                const wallets = await apiCall('/api/wallets');

                let walletsHtml = '<table class="table"><thead><tr><th>名称</th><th>地址</th><th>余额</th><th>操作</th></tr></thead><tbody>';

                wallets.forEach(wallet => {
                    walletsHtml += `
                        <tr>
                            <td>${wallet.name}</td>
                            <td class="hash">${wallet.address.substring(0, 20)}...</td>
                            <td>${wallet.balance}</td>
                            <td>
                                <button class="btn" onclick="viewWalletHistory('${wallet.name}')">查看历史</button>
                            </td>
                        </tr>
                    `;
                });

                walletsHtml += '</tbody></table>';
                document.getElementById('wallets-section').innerHTML = walletsHtml;

                // 更新钱包选择器
                updateWalletSelectors(wallets);

            } catch (error) {
                document.getElementById('wallets-section').innerHTML = '<div class="error">加载钱包失败: ' + error.message + '</div>';
            }
        }

        // 更新钱包选择器
        function updateWalletSelectors(wallets) {
            const fromWalletSelect = document.getElementById('from-wallet');
            const minerWalletSelect = document.getElementById('miner-wallet');

            fromWalletSelect.innerHTML = '<option value="">选择钱包</option>';
            minerWalletSelect.innerHTML = '<option value="">选择钱包</option>';

            wallets.forEach(wallet => {
                const option = `<option value="${wallet.name}">${wallet.name} (${wallet.balance} 币)</option>`;
                fromWalletSelect.innerHTML += option;
                minerWalletSelect.innerHTML += option;
            });
        }

        // 创建钱包
        async function createWallet() {
            const name = prompt('请输入钱包名称:');
            if (!name) return;

            try {
                const result = await apiCall('/api/wallet/create', 'POST', { name: name });
                alert(result.message);
                loadWallets();
            } catch (error) {
                alert('创建钱包失败: ' + error.message);
            }
        }

        // 刷新钱包
        function refreshWallets() {
            loadWallets();
        }

        // 转账
        async function transfer() {
            const fromWallet = document.getElementById('from-wallet').value;
            const toAddress = document.getElementById('to-address').value;
            const amount = parseFloat(document.getElementById('amount').value);

            if (!fromWallet || !toAddress || !amount || amount <= 0) {
                showMessage('transfer-result', '请填写完整的转账信息', 'error');
                return;
            }

            try {
                const result = await apiCall('/api/transfer', 'POST', {
                    from_wallet: fromWallet,
                    to_address: toAddress,
                    amount: amount
                });

                showMessage('transfer-result', result.message, 'success');

                // 清空表单
                document.getElementById('to-address').value = '';
                document.getElementById('amount').value = '';

                // 刷新钱包和待确认交易
                setTimeout(() => {
                    loadWallets();
                    refreshPendingTransactions();
                }, 1000);

            } catch (error) {
                showMessage('transfer-result', '转账失败: ' + error.message, 'error');
            }
        }

        // 挖矿
        async function mine() {
            const minerWallet = document.getElementById('miner-wallet').value;
            if (!minerWallet) {
                showMessage('mining-result', '请选择矿工钱包', 'error');
                return;
            }

            showMessage('mining-result', '正在挖矿，请稍候...', 'success');

            try {
                // 获取矿工地址
                const walletInfo = await apiCall(`/api/wallet/${minerWallet}/info`);

                const result = await apiCall('/api/mine', 'POST', {
                    miner_address: walletInfo.address
                });

                showMessage('mining-result', `挖矿成功! 区块 #${result.block_index}, 获得奖励: ${result.reward} 币`, 'success');

                // 刷新数据
                setTimeout(() => {
                    loadStats();
                    loadWallets();
                    refreshBlocks();
                    refreshPendingTransactions();
                }, 1000);

            } catch (error) {
                showMessage('mining-result', '挖矿失败: ' + error.message, 'error');
            }
        }

        // 加载区块列表
        async function loadBlocks() {
            try {
                const blocks = await apiCall('/api/blocks');

                let blocksHtml = '<table class="table"><thead><tr><th>区块</th><th>哈希</th><th>时间</th><th>交易数</th><th>Nonce</th></tr></thead><tbody>';

                // 显示最新的10个区块
                blocks.slice(-10).reverse().forEach(block => {
                    blocksHtml += `
                        <tr onclick="viewBlock(${block.index})" style="cursor: pointer;">
                            <td>#${block.index}</td>
                            <td class="hash">${block.hash.substring(0, 20)}...</td>
                            <td>${block.timestamp}</td>
                            <td>${block.transaction_count}</td>
                            <td>${block.nonce}</td>
                        </tr>
                    `;
                });

                blocksHtml += '</tbody></table>';
                document.getElementById('blocks-section').innerHTML = blocksHtml;

            } catch (error) {
                document.getElementById('blocks-section').innerHTML = '<div class="error">加载区块失败: ' + error.message + '</div>';
            }
        }

        // 查看区块详情
        async function viewBlock(index) {
            try {
                const block = await apiCall(`/api/block/${index}`);

                let transactionsHtml = '<h4>交易列表:</h4><table class="table"><thead><tr><th>交易ID</th><th>发送者</th><th>接收者</th><th>金额</th></tr></thead><tbody>';

                block.transactions.forEach(tx => {
                    transactionsHtml += `
                        <tr>
                            <td class="hash">${tx.transaction_id ? tx.transaction_id.substring(0, 16) + '...' : 'N/A'}</td>
                            <td class="hash">${tx.sender || '挖矿奖励'}</td>
                            <td class="hash">${tx.recipient ? tx.recipient.substring(0, 16) + '...' : 'N/A'}</td>
                            <td>${tx.amount}</td>
                        </tr>
                    `;
                });

                transactionsHtml += '</tbody></table>';

                const blockDetails = `
                    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-top: 20px;">
                        <h3>区块 #${block.index} 详情</h3>
                        <p><strong>哈希:</strong> <span class="hash">${block.hash}</span></p>
                        <p><strong>前一个区块哈希:</strong> <span class="hash">${block.previous_hash}</span></p>
                        <p><strong>时间:</strong> ${block.timestamp_formatted}</p>
                        <p><strong>Nonce:</strong> ${block.nonce}</p>
                        <p><strong>Merkle根:</strong> <span class="hash">${block.merkle_root}</span></p>
                        ${transactionsHtml}
                        <button class="btn" onclick="loadBlocks()">返回区块列表</button>
                    </div>
                `;

                document.getElementById('blocks-section').innerHTML = blockDetails;

            } catch (error) {
                alert('获取区块详情失败: ' + error.message);
            }
        }

        // 刷新区块
        function refreshBlocks() {
            loadBlocks();
        }

        // 加载待确认交易
        async function loadPendingTransactions() {
            try {
                const transactions = await apiCall('/api/transactions/pending');

                if (transactions.length === 0) {
                    document.getElementById('pending-transactions-section').innerHTML = '<p>当前没有待确认交易</p>';
                    return;
                }

                let transactionsHtml = '<table class="table"><thead><tr><th>交易ID</th><th>发送者</th><th>接收者</th><th>金额</th><th>时间</th></tr></thead><tbody>';

                transactions.forEach(tx => {
                    transactionsHtml += `
                        <tr>
                            <td class="hash">${tx.transaction_id.substring(0, 16)}...</td>
                            <td class="hash">${tx.sender ? tx.sender.substring(0, 16) + '...' : '挖矿奖励'}</td>
                            <td class="hash">${tx.recipient.substring(0, 16)}...</td>
                            <td>${tx.amount}</td>
                            <td>${tx.timestamp}</td>
                        </tr>
                    `;
                });

                transactionsHtml += '</tbody></table>';
                document.getElementById('pending-transactions-section').innerHTML = transactionsHtml;

            } catch (error) {
                document.getElementById('pending-transactions-section').innerHTML = '<div class="error">加载待确认交易失败: ' + error.message + '</div>';
            }
        }

        // 刷新待确认交易
        function refreshPendingTransactions() {
            loadPendingTransactions();
        }

        // 查看钱包历史
        async function viewWalletHistory(walletName) {
            try {
                const history = await apiCall(`/api/wallet/${walletName}/history`);

                if (history.length === 0) {
                    alert('该钱包暂无交易历史');
                    return;
                }

                let historyHtml = '<h4>' + walletName + ' 交易历史:</h4><table class="table"><thead><tr><th>类型</th><th>对方</th><th>金额</th><th>时间</th><th>区块</th></tr></thead><tbody>';

                history.forEach(tx => {
                    const counterparty = tx.type === 'sent' ? tx.recipient : tx.sender || '挖矿奖励';
                    historyHtml += `
                        <tr>
                            <td>${tx.type === 'sent' ? '发送' : '接收'}</td>
                            <td class="hash">${counterparty === '挖矿奖励' ? counterparty : counterparty.substring(0, 16) + '...'}</td>
                            <td>${tx.amount}</td>
                            <td>${tx.timestamp}</td>
                            <td>#${tx.block_index}</td>
                        </tr>
                    `;
                });

                historyHtml += '</tbody></table>';

                // 在新窗口显示或者替换当前页面内容
                const newWindow = window.open('', '_blank');
                newWindow.document.write(`
                    <html>
                        <head>
                            <title>${walletName} 交易历史</title>
                            <style>
                                body { font-family: Arial, sans-serif; padding: 20px; }
                                .table { width: 100%; border-collapse: collapse; }
                                .table th, .table td { padding: 10px; border: 1px solid #ddd; text-align: left; }
                                .table th { background-color: #f8f9fa; }
                                .hash { font-family: 'Courier New', monospace; color: #666; }
                            </style>
                        </head>
                        <body>
                            ${historyHtml}
                        </body>
                    </html>
                `);

            } catch (error) {
                alert('获取交易历史失败: ' + error.message);
            }
        }

        // 页面加载时初始化
        document.addEventListener('DOMContentLoaded', function() {
            loadStats();
            loadWallets();
            loadBlocks();
            loadPendingTransactions();

            // 设置定时刷新
            setInterval(() => {
                loadStats();
                refreshPendingTransactions();
            }, 30000); // 30秒刷新一次
        });
    </script>
</body>
</html>
    """

    with open('templates/index.html', 'w', encoding='utf-8') as f:
        f.write(index_html)

    print("Web模板已创建: templates/index.html")

# 创建Web模板
create_web_templates()

# 测试完整的Web应用
print("\n创建完整的Web应用:")

# 创建集成的区块链应用
class SimpleCoinApp:
    """SimpleCoin完整应用"""

    def __init__(self, port=5000):
        self.port = port
        self.blockchain = SimpleCoinBlockchain()
        self.wallet_manager = WalletManager(self.blockchain)
        self.network = SimpleCoinNetwork(self.blockchain, port)
        self.web_api = SimpleCoinWebAPI(self.blockchain, self.wallet_manager, self.network)

        # 合并Flask应用
        self.setup_combined_app()

    def setup_combined_app(self):
        """设置合并的Flask应用"""
        # 将API路由添加到web应用
        for rule in self.network.app.url_map.iter_rules():
            if rule.endpoint != 'static':
                self.web_api.app.add_url_rule(
                    rule.rule,
                    rule.endpoint + '_network',
                    self.network.app.view_functions[rule.endpoint],
                    methods=list(rule.methods)
                )

    def start(self, host='127.0.0.1'):
        """启动应用"""
        print(f"启动SimpleCoin完整应用，端口: {self.port}")
        print(f"Web界面: http://{host}:{self.port}")
        print(f"API文档: http://{host}:{self.port}/info")

        # 创建初始钱包
        self.setup_initial_wallets()

        # 启动Web服务器
        self.web_api.app.run(host=host, port=self.port, debug=False, threaded=True)

    def setup_initial_wallets(self):
        """设置初始钱包"""
        try:
            # 创建演示钱包
            alice = self.wallet_manager.create_wallet("Alice")
            bob = self.wallet_manager.create_wallet("Bob")
            miner = self.wallet_manager.create_wallet("Miner")

            # 给Miner挖矿获得初始资金
            self.blockchain.mine_pending_transactions(miner.address)

            # Miner给Alice和Bob一些资金
            alice_tx = miner.send_money(alice.address, 100)
            bob_tx = miner.send_money(bob.address, 50)

            if alice_tx and bob_tx:
                # 挖矿确认交易
                self.blockchain.mine_pending_transactions(miner.address)

            print("初始钱包和资金已设置完成")
            print(f"Alice余额: {alice.get_balance()}")
            print(f"Bob余额: {bob.get_balance()}")
            print(f"Miner余额: {miner.get_balance()}")

        except Exception as e:
            print(f"设置初始钱包失败: {e}")

# 启动完整应用（注释掉以避免在测试环境中启动）
"""
if __name__ == "__main__":
    app = SimpleCoinApp(port=8000)
    app.start()
"""

print("\nSimpleCoin区块链项目完成!")
print("项目包含以下组件:")
print("1. ✅ 完整的区块链实现")
print("2. ✅ 数字钱包系统")
print("3. ✅ P2P网络协议")
print("4. ✅ REST API接口")
print("5. ✅ Web用户界面")
print("6. ✅ 数据库持久化")
print("7. ✅ 挖矿和共识机制")
print("8. ✅ 交易验证和签名")

print(f"\n要启动应用，请运行:")
print("python simplecoin_app.py")
print("然后访问 http://localhost:8000")
```

## 11.5 课程总结

本章通过构建SimpleCoin区块链项目，我们完成了以下实战内容：

### 项目成就
1. **完整区块链**: 实现了包含区块、交易、挖矿的完整区块链
2. **数字钱包**: 构建了具备密钥生成、签名验证的钱包系统
3. **P2P网络**: 开发了节点通信和共识同步机制
4. **Web界面**: 创建了用户友好的区块链浏览器和管理界面
5. **API服务**: 提供了完整的REST API接口

### 技术要点
- **密码学应用**: RSA签名、哈希算法、Merkle树
- **共识机制**: 工作量证明和链同步
- **网络编程**: HTTP API、P2P通信
- **数据管理**: SQLite存储、事务处理
- **Web开发**: Flask后端、HTML/JS前端

### 扩展方向
1. **性能优化**: 实现UTXO模型、批量验证
2. **安全增强**: 多重签名、硬件钱包支持
3. **共识升级**: 实现权益证明或其他共识算法
4. **智能合约**: 添加虚拟机和合约执行
5. **可扩展性**: 分片、侧链、状态通道

### 学习价值
通过这个项目，你已经：
- 掌握了区块链的核心技术原理
- 具备了端到端的区块链开发能力
- 理解了去中心化系统的设计思路
- 积累了密码学和网络编程实战经验

这个SimpleCoin项目为你提供了一个完整的区块链技术实践基础，可以在此基础上继续探索更高级的区块链应用开发。