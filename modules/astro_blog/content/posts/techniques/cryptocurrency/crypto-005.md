---
title: 第5章：虚拟货币钱包与安全
date: 2025-12-06
icon: circle-dot
author: Haiyue
category:
  - cryptocurrency
star: false
---

# 第5章：虚拟货币钱包与安全

::: tip 学习目标
- 理解钱包的工作原理
- 掌握热钱包和冷钱包的区别
- 学习私钥、公钥、助记词管理
- 了解常见的安全威胁和防护措施
:::

## 钱包基本原理

### 密钥对生成与管理

虚拟货币钱包本质上是管理密钥对和地址的工具：

```python
import hashlib
import secrets
import hmac
from typing import List, Tuple, Dict
from dataclasses import dataclass

@dataclass
class KeyPair:
    """密钥对"""
    private_key: str
    public_key: str
    address: str

class CryptographicWallet:
    """加密货币钱包"""

    def __init__(self, entropy_bits: int = 128):
        """
        初始化钱包
        entropy_bits: 熵位数（128, 256等）
        """
        self.entropy_bits = entropy_bits
        self.master_seed = None
        self.mnemonic = None
        self.accounts: Dict[str, KeyPair] = {}

    def generate_mnemonic(self, language: str = "english") -> List[str]:
        """生成助记词"""
        # 生成随机熵
        entropy = secrets.randbits(self.entropy_bits)
        entropy_bytes = entropy.to_bytes(self.entropy_bits // 8, 'big')

        # 计算校验和
        checksum_bits = self.entropy_bits // 32
        hash_bytes = hashlib.sha256(entropy_bytes).digest()
        checksum = int.from_bytes(hash_bytes, 'big') >> (256 - checksum_bits)

        # 组合熵和校验和
        total_bits = self.entropy_bits + checksum_bits
        combined = (entropy << checksum_bits) | checksum

        # 转换为助记词（简化实现）
        word_count = total_bits // 11
        mnemonic_words = []

        # 简化的BIP39单词列表（实际应使用完整的2048个单词）
        bip39_words = [
            "abandon", "ability", "able", "about", "above", "absent", "absorb",
            "abstract", "absurd", "abuse", "access", "accident", "account",
            "accuse", "achieve", "acid", "acoustic", "acquire", "across", "act",
            "action", "actor", "actress", "actual", "adapt", "add", "addict"
        ] * 80  # 扩展到足够数量

        for i in range(word_count):
            word_index = (combined >> (total_bits - (i + 1) * 11)) & 0x7FF
            word_index = word_index % len(bip39_words)
            mnemonic_words.append(bip39_words[word_index])

        self.mnemonic = mnemonic_words
        return mnemonic_words

    def create_seed_from_mnemonic(self, mnemonic: List[str],
                                  passphrase: str = "") -> bytes:
        """从助记词生成种子"""
        mnemonic_str = " ".join(mnemonic)
        salt = "mnemonic" + passphrase

        # 使用PBKDF2生成512位种子
        seed = hashlib.pbkdf2_hmac(
            'sha512',
            mnemonic_str.encode('utf-8'),
            salt.encode('utf-8'),
            2048,  # 迭代次数
            64     # 输出长度（512位）
        )

        self.master_seed = seed
        return seed

    def derive_key_pair(self, derivation_path: str = "m/44'/0'/0'/0/0") -> KeyPair:
        """根据派生路径生成密钥对（简化实现）"""
        if not self.master_seed:
            raise ValueError("必须先生成种子")

        # 简化的密钥派生（实际应使用BIP32标准）
        path_hash = hashlib.sha256(
            (derivation_path + str(len(self.accounts))).encode()
        ).digest()

        # 生成私钥
        private_key_bytes = hmac.new(
            self.master_seed,
            path_hash,
            hashlib.sha256
        ).digest()

        private_key = private_key_bytes.hex()

        # 生成公钥（简化：使用私钥哈希）
        public_key = hashlib.sha256(private_key_bytes).hexdigest()

        # 生成地址（简化：使用公钥的RIPEMD160）
        address_bytes = hashlib.new(
            'ripemd160',
            bytes.fromhex(public_key)
        ).digest()
        address = "1" + address_bytes.hex()  # 简化的地址格式

        key_pair = KeyPair(private_key, public_key, address)
        self.accounts[address] = key_pair

        return key_pair

    def sign_transaction(self, private_key: str, transaction_data: str) -> str:
        """签名交易（简化实现）"""
        # 实际应使用ECDSA算法
        signature = hmac.new(
            bytes.fromhex(private_key),
            transaction_data.encode(),
            hashlib.sha256
        ).hexdigest()

        return signature

    def verify_signature(self, public_key: str, transaction_data: str,
                        signature: str) -> bool:
        """验证签名（简化实现）"""
        # 这是简化实现，实际需要椭圆曲线密码学
        return len(signature) == 64  # 简单长度检查

    def export_wallet(self, password: str) -> Dict:
        """导出钱包（加密）"""
        if not self.mnemonic:
            raise ValueError("钱包未初始化")

        # 加密助记词
        encrypted_mnemonic = self._encrypt_data(" ".join(self.mnemonic), password)

        wallet_data = {
            "version": "1.0",
            "encrypted_mnemonic": encrypted_mnemonic,
            "accounts": {
                addr: {
                    "address": kp.address,
                    "public_key": kp.public_key
                    # 不导出私钥，通过助记词重新派生
                }
                for addr, kp in self.accounts.items()
            }
        }

        return wallet_data

    def import_wallet(self, wallet_data: Dict, password: str):
        """导入钱包"""
        try:
            # 解密助记词
            encrypted_mnemonic = wallet_data["encrypted_mnemonic"]
            mnemonic_str = self._decrypt_data(encrypted_mnemonic, password)
            self.mnemonic = mnemonic_str.split()

            # 重新生成种子和密钥
            self.create_seed_from_mnemonic(self.mnemonic)

            # 重新派生账户
            for i in range(len(wallet_data["accounts"])):
                self.derive_key_pair(f"m/44'/0'/0'/0/{i}")

            print("钱包导入成功")

        except Exception as e:
            raise ValueError(f"钱包导入失败: {e}")

    def _encrypt_data(self, data: str, password: str) -> str:
        """加密数据（简化实现）"""
        # 实际应使用AES等强加密算法
        password_hash = hashlib.sha256(password.encode()).digest()
        encrypted = bytes(a ^ b for a, b in zip(data.encode(), password_hash[:len(data.encode())]))
        return encrypted.hex()

    def _decrypt_data(self, encrypted_hex: str, password: str) -> str:
        """解密数据（简化实现）"""
        encrypted = bytes.fromhex(encrypted_hex)
        password_hash = hashlib.sha256(password.encode()).digest()
        decrypted = bytes(a ^ b for a, b in zip(encrypted, password_hash[:len(encrypted)]))
        return decrypted.decode()

# 钱包使用演示
print("=== 虚拟货币钱包演示 ===")

# 创建新钱包
wallet = CryptographicWallet(entropy_bits=128)

# 生成助记词
mnemonic = wallet.generate_mnemonic()
print(f"助记词: {' '.join(mnemonic)}")

# 生成种子
seed = wallet.create_seed_from_mnemonic(mnemonic)
print(f"种子 (hex): {seed.hex()[:32]}...")

# 派生密钥对
key_pair1 = wallet.derive_key_pair("m/44'/0'/0'/0/0")
key_pair2 = wallet.derive_key_pair("m/44'/0'/0'/0/1")

print(f"\n账户1:")
print(f"  地址: {key_pair1.address}")
print(f"  公钥: {key_pair1.public_key[:16]}...")
print(f"  私钥: {key_pair1.private_key[:16]}...")

print(f"\n账户2:")
print(f"  地址: {key_pair2.address}")

# 签名交易
tx_data = "Alice sends 1 BTC to Bob"
signature = wallet.sign_transaction(key_pair1.private_key, tx_data)
print(f"\n交易签名: {signature[:16]}...")

# 验证签名
is_valid = wallet.verify_signature(key_pair1.public_key, tx_data, signature)
print(f"签名验证: {is_valid}")
```

## 钱包类型分类

### 热钱包 vs 冷钱包

```python
from enum import Enum
import time
from abc import ABC, abstractmethod

class WalletType(Enum):
    """钱包类型"""
    HOT = "hot_wallet"          # 热钱包
    COLD = "cold_wallet"        # 冷钱包
    HARDWARE = "hardware_wallet"  # 硬件钱包
    PAPER = "paper_wallet"      # 纸钱包

class BaseWallet(ABC):
    """钱包基类"""

    def __init__(self, wallet_type: WalletType):
        self.wallet_type = wallet_type
        self.created_at = time.time()
        self.last_backup = None

    @abstractmethod
    def create_transaction(self, to_address: str, amount: float) -> Dict:
        pass

    @abstractmethod
    def sign_transaction(self, transaction: Dict) -> str:
        pass

    @abstractmethod
    def get_security_level(self) -> int:
        pass

class HotWallet(BaseWallet):
    """热钱包（联网）"""

    def __init__(self):
        super().__init__(WalletType.HOT)
        self.is_online = True
        self.auto_sync = True
        self.convenience_features = ["快速交易", "实时价格", "DApp连接"]

    def create_transaction(self, to_address: str, amount: float) -> Dict:
        """创建交易（热钱包）"""
        transaction = {
            "from": "hot_wallet_address",
            "to": to_address,
            "amount": amount,
            "timestamp": time.time(),
            "gas_price": self._get_current_gas_price(),
            "nonce": self._get_account_nonce()
        }

        print(f"热钱包交易创建: {amount} -> {to_address}")
        print(f"当前Gas价格: {transaction['gas_price']} Gwei")

        return transaction

    def sign_transaction(self, transaction: Dict) -> str:
        """签名交易"""
        # 热钱包可以立即签名
        signature = f"hot_sig_{hash(str(transaction)) % 100000}"
        print(f"热钱包即时签名: {signature}")
        return signature

    def get_security_level(self) -> int:
        """安全级别（1-10）"""
        return 6  # 中等安全性

    def connect_to_dapp(self, dapp_url: str) -> bool:
        """连接到DApp"""
        if self.is_online:
            print(f"已连接到DApp: {dapp_url}")
            return True
        return False

    def _get_current_gas_price(self) -> float:
        """获取当前Gas价格"""
        # 模拟从网络获取实时Gas价格
        return 25.0  # Gwei

    def _get_account_nonce(self) -> int:
        """获取账户nonce"""
        return int(time.time()) % 1000

class ColdWallet(BaseWallet):
    """冷钱包（离线）"""

    def __init__(self):
        super().__init__(WalletType.COLD)
        self.is_online = False
        self.air_gapped = True  # 物理隔离
        self.security_features = ["离线存储", "多重签名", "备份机制"]

    def create_transaction(self, to_address: str, amount: float) -> Dict:
        """创建交易（冷钱包）"""
        # 冷钱包需要手动输入网络参数
        transaction = {
            "from": "cold_wallet_address",
            "to": to_address,
            "amount": amount,
            "timestamp": time.time(),
            "gas_price": self._get_manual_gas_price(),
            "nonce": self._get_manual_nonce()
        }

        print(f"冷钱包交易创建: {amount} -> {to_address}")
        print("⚠️  需要手动设置网络参数")

        return transaction

    def sign_transaction(self, transaction: Dict) -> str:
        """离线签名交易"""
        print("🔒 开始离线签名流程...")
        print("1. 验证交易详情")
        print("2. 确认签名操作")
        print("3. 生成签名")

        signature = f"cold_sig_{hash(str(transaction)) % 100000}"
        print(f"冷钱包离线签名完成: {signature}")
        return signature

    def get_security_level(self) -> int:
        """安全级别（1-10）"""
        return 10  # 最高安全性

    def export_signed_transaction(self, transaction: Dict, signature: str) -> str:
        """导出已签名交易"""
        signed_tx = {
            "transaction": transaction,
            "signature": signature,
            "export_time": time.time()
        }

        # 模拟导出为二维码或文件
        export_data = f"signed_tx_{hash(str(signed_tx)) % 100000}.txt"
        print(f"已签名交易已导出: {export_data}")
        return export_data

    def _get_manual_gas_price(self) -> float:
        """手动设置Gas价格"""
        # 冷钱包用户需要手动查询并输入
        return 30.0  # Gwei

    def _get_manual_nonce(self) -> int:
        """手动设置nonce"""
        return 42  # 用户手动输入

class HardwareWallet(BaseWallet):
    """硬件钱包"""

    def __init__(self, device_model: str):
        super().__init__(WalletType.HARDWARE)
        self.device_model = device_model
        self.firmware_version = "1.0.0"
        self.is_connected = False
        self.pin_required = True

    def connect_device(self, pin: str) -> bool:
        """连接硬件设备"""
        if self._verify_pin(pin):
            self.is_connected = True
            print(f"✅ {self.device_model} 连接成功")
            return True
        else:
            print("❌ PIN码错误")
            return False

    def create_transaction(self, to_address: str, amount: float) -> Dict:
        """创建交易"""
        if not self.is_connected:
            raise Exception("硬件钱包未连接")

        transaction = {
            "from": "hardware_wallet_address",
            "to": to_address,
            "amount": amount,
            "timestamp": time.time()
        }

        print(f"硬件钱包交易准备: {amount} -> {to_address}")
        return transaction

    def sign_transaction(self, transaction: Dict) -> str:
        """硬件签名"""
        if not self.is_connected:
            raise Exception("硬件钱包未连接")

        print("🔐 请在硬件设备上确认交易...")
        print("1. 验证接收地址")
        print("2. 确认交易金额")
        print("3. 按下确认按钮")

        # 模拟用户确认
        user_confirmed = True  # 实际需要硬件交互

        if user_confirmed:
            signature = f"hw_sig_{hash(str(transaction)) % 100000}"
            print(f"✅ 硬件签名完成: {signature}")
            return signature
        else:
            raise Exception("用户取消交易")

    def get_security_level(self) -> int:
        """安全级别"""
        return 9  # 高安全性

    def _verify_pin(self, pin: str) -> bool:
        """验证PIN码"""
        return len(pin) >= 4  # 简化验证

# 钱包类型对比演示
print("\n=== 钱包类型对比演示 ===")

# 创建不同类型的钱包
hot_wallet = HotWallet()
cold_wallet = ColdWallet()
hardware_wallet = HardwareWallet("Ledger Nano S")

wallets = [
    ("热钱包", hot_wallet),
    ("冷钱包", cold_wallet),
    ("硬件钱包", hardware_wallet)
]

# 对比钱包特性
print("钱包特性对比:")
print(f"{'钱包类型':12} {'安全性':8} {'便利性':8} {'适用场景':20}")
print("-" * 60)

wallet_features = {
    "热钱包": {"安全性": 6, "便利性": 10, "场景": "日常小额交易"},
    "冷钱包": {"安全性": 10, "便利性": 3, "场景": "长期存储"},
    "硬件钱包": {"安全性": 9, "便利性": 7, "场景": "频繁交易+安全"}
}

for wallet_name, features in wallet_features.items():
    print(f"{wallet_name:12} {features['安全性']:8} {features['便利性']:8} {features['场景']:20}")

# 模拟交易流程对比
print(f"\n=== 交易流程对比 ===")

transaction_details = {
    "to_address": "1ABC...xyz",
    "amount": 0.5
}

for wallet_name, wallet in wallets:
    print(f"\n{wallet_name}交易流程:")
    try:
        if wallet_name == "硬件钱包":
            wallet.connect_device("1234")

        tx = wallet.create_transaction(**transaction_details)
        signature = wallet.sign_transaction(tx)
        print(f"安全级别: {wallet.get_security_level()}/10")

    except Exception as e:
        print(f"交易失败: {e}")
```

## 助记词与种子管理

### BIP39助记词标准

```python
import secrets
import hashlib
from typing import List, Optional

class BIP39:
    """BIP39助记词标准实现"""

    # 简化的BIP39单词表（实际标准包含2048个单词）
    WORDLIST = [
        "abandon", "ability", "able", "about", "above", "absent", "absorb", "abstract",
        "absurd", "abuse", "access", "accident", "account", "accuse", "achieve", "acid",
        "acoustic", "acquire", "across", "act", "action", "actor", "actress", "actual",
        "adapt", "add", "addict", "address", "adjust", "admit", "adult", "advance",
        # ... 实际应包含2048个单词
    ] * 64  # 扩展到2048个

    @classmethod
    def generate_mnemonic(cls, strength: int = 128) -> List[str]:
        """
        生成助记词
        strength: 熵强度 (128, 160, 192, 224, 256)
        """
        if strength not in [128, 160, 192, 224, 256]:
            raise ValueError("强度必须是 128, 160, 192, 224, 或 256")

        # 生成随机熵
        entropy_bytes = secrets.randbits(strength).to_bytes(strength // 8, 'big')

        # 计算校验和
        checksum_length = strength // 32
        hash_bytes = hashlib.sha256(entropy_bytes).digest()
        checksum = int.from_bytes(hash_bytes, 'big') >> (256 - checksum_length)

        # 组合熵和校验和
        entropy_with_checksum = (int.from_bytes(entropy_bytes, 'big') << checksum_length) | checksum
        total_bits = strength + checksum_length

        # 转换为助记词
        mnemonic_length = total_bits // 11
        mnemonic = []

        for i in range(mnemonic_length):
            word_index = (entropy_with_checksum >> (total_bits - (i + 1) * 11)) & 0x7FF
            word_index = word_index % len(cls.WORDLIST)
            mnemonic.append(cls.WORDLIST[word_index])

        return mnemonic

    @classmethod
    def mnemonic_to_seed(cls, mnemonic: List[str], passphrase: str = "") -> bytes:
        """将助记词转换为种子"""
        mnemonic_str = " ".join(mnemonic)
        salt = "mnemonic" + passphrase

        # 使用PBKDF2-HMAC-SHA512
        seed = hashlib.pbkdf2_hmac(
            'sha512',
            mnemonic_str.encode('utf-8'),
            salt.encode('utf-8'),
            2048,  # 迭代次数
            64     # 输出长度（512位）
        )

        return seed

    @classmethod
    def validate_mnemonic(cls, mnemonic: List[str]) -> bool:
        """验证助记词有效性"""
        if len(mnemonic) not in [12, 15, 18, 21, 24]:
            return False

        # 检查单词是否在词表中
        for word in mnemonic:
            if word not in cls.WORDLIST:
                return False

        # 验证校验和（简化实现）
        return True

    @classmethod
    def get_entropy_from_mnemonic(cls, mnemonic: List[str]) -> bytes:
        """从助记词恢复熵值"""
        if not cls.validate_mnemonic(mnemonic):
            raise ValueError("无效的助记词")

        # 转换为位序列
        total_bits = len(mnemonic) * 11
        entropy_bits = (total_bits * 32) // 33

        combined = 0
        for word in mnemonic:
            word_index = cls.WORDLIST.index(word)
            combined = (combined << 11) | word_index

        # 提取熵值
        entropy = combined >> (total_bits - entropy_bits)
        entropy_bytes = entropy.to_bytes(entropy_bits // 8, 'big')

        return entropy_bytes

class SecureMnemonicStorage:
    """安全助记词存储"""

    def __init__(self):
        self.encrypted_storage = {}

    def store_mnemonic(self, mnemonic: List[str], password: str,
                      storage_id: str) -> Dict:
        """安全存储助记词"""
        # 生成存储密钥
        storage_key = self._derive_storage_key(password, storage_id)

        # 加密助记词
        mnemonic_str = " ".join(mnemonic)
        encrypted_mnemonic = self._encrypt_aes(mnemonic_str, storage_key)

        # 生成校验和
        checksum = hashlib.sha256(mnemonic_str.encode()).hexdigest()[:8]

        storage_data = {
            "encrypted_mnemonic": encrypted_mnemonic.hex(),
            "checksum": checksum,
            "timestamp": time.time(),
            "version": "1.0"
        }

        self.encrypted_storage[storage_id] = storage_data

        return {
            "storage_id": storage_id,
            "checksum": checksum,
            "status": "success"
        }

    def retrieve_mnemonic(self, storage_id: str, password: str) -> List[str]:
        """检索助记词"""
        if storage_id not in self.encrypted_storage:
            raise ValueError("存储ID不存在")

        storage_data = self.encrypted_storage[storage_id]

        # 生成解密密钥
        storage_key = self._derive_storage_key(password, storage_id)

        try:
            # 解密助记词
            encrypted_bytes = bytes.fromhex(storage_data["encrypted_mnemonic"])
            decrypted_str = self._decrypt_aes(encrypted_bytes, storage_key)

            # 验证校验和
            checksum = hashlib.sha256(decrypted_str.encode()).hexdigest()[:8]
            if checksum != storage_data["checksum"]:
                raise ValueError("校验和验证失败")

            mnemonic = decrypted_str.split()

            # 验证助记词
            if not BIP39.validate_mnemonic(mnemonic):
                raise ValueError("助记词验证失败")

            return mnemonic

        except Exception as e:
            raise ValueError(f"助记词检索失败: {e}")

    def _derive_storage_key(self, password: str, storage_id: str) -> bytes:
        """派生存储密钥"""
        salt = storage_id.encode('utf-8')
        key = hashlib.pbkdf2_hmac(
            'sha256',
            password.encode('utf-8'),
            salt,
            100000,  # 迭代次数
            32       # 密钥长度
        )
        return key

    def _encrypt_aes(self, plaintext: str, key: bytes) -> bytes:
        """AES加密（简化实现）"""
        # 实际应使用AES-GCM等认证加密模式
        data = plaintext.encode('utf-8')
        key_hash = hashlib.sha256(key).digest()
        encrypted = bytes(a ^ b for a, b in zip(data, key_hash[:len(data)]))
        return encrypted

    def _decrypt_aes(self, ciphertext: bytes, key: bytes) -> str:
        """AES解密（简化实现）"""
        key_hash = hashlib.sha256(key).digest()
        decrypted = bytes(a ^ b for a, b in zip(ciphertext, key_hash[:len(ciphertext)]))
        return decrypted.decode('utf-8')

# 助记词管理演示
print("\n=== 助记词管理演示 ===")

# 生成助记词
print("生成不同强度的助记词:")
for strength in [128, 192, 256]:
    mnemonic = BIP39.generate_mnemonic(strength)
    word_count = len(mnemonic)
    print(f"{strength}位熵 ({word_count}个单词): {' '.join(mnemonic[:4])}...")

# 完整助记词示例
sample_mnemonic = BIP39.generate_mnemonic(128)
print(f"\n完整助记词示例: {' '.join(sample_mnemonic)}")

# 生成种子
seed = BIP39.mnemonic_to_seed(sample_mnemonic)
print(f"种子 (hex): {seed.hex()}")

# 带密码短语的种子生成
seed_with_passphrase = BIP39.mnemonic_to_seed(sample_mnemonic, "MySecretPassphrase")
print(f"带密码短语的种子: {seed_with_passphrase.hex()}")

# 安全存储演示
print(f"\n=== 助记词安全存储演示 ===")

storage = SecureMnemonicStorage()

# 存储助记词
storage_result = storage.store_mnemonic(
    mnemonic=sample_mnemonic,
    password="MyStrongPassword123!",
    storage_id="wallet_backup_001"
)

print(f"存储结果: {storage_result}")

# 检索助记词
try:
    retrieved_mnemonic = storage.retrieve_mnemonic(
        storage_id="wallet_backup_001",
        password="MyStrongPassword123!"
    )
    print(f"检索成功: {retrieved_mnemonic == sample_mnemonic}")
    print(f"检索的助记词: {' '.join(retrieved_mnemonic[:4])}...")

except ValueError as e:
    print(f"检索失败: {e}")
```

## 常见安全威胁与防护

### 安全威胁分类

```python
from enum import Enum
from typing import Dict, List
import re

class ThreatLevel(Enum):
    """威胁等级"""
    LOW = 1
    MEDIUM = 2
    HIGH = 3
    CRITICAL = 4

class ThreatType(Enum):
    """威胁类型"""
    PHISHING = "钓鱼攻击"
    MALWARE = "恶意软件"
    SOCIAL_ENGINEERING = "社会工程学"
    MAN_IN_THE_MIDDLE = "中间人攻击"
    CLIPBOARD_HIJACKING = "剪贴板劫持"
    FAKE_WALLET = "虚假钱包"
    PRIVATE_KEY_EXPOSURE = "私钥泄露"
    WEAK_PASSWORD = "弱密码"

@dataclass
class SecurityThreat:
    """安全威胁"""
    threat_type: ThreatType
    level: ThreatLevel
    description: str
    attack_vectors: List[str]
    prevention_measures: List[str]

class SecurityAnalyzer:
    """安全分析器"""

    def __init__(self):
        self.known_threats = self._initialize_threats()
        self.security_patterns = self._initialize_patterns()

    def _initialize_threats(self) -> Dict[ThreatType, SecurityThreat]:
        """初始化威胁数据库"""
        threats = {
            ThreatType.PHISHING: SecurityThreat(
                threat_type=ThreatType.PHISHING,
                level=ThreatLevel.HIGH,
                description="通过虚假网站或邮件窃取用户凭据",
                attack_vectors=[
                    "虚假交易所网站",
                    "钓鱼邮件",
                    "社交媒体链接",
                    "恶意广告"
                ],
                prevention_measures=[
                    "验证网站SSL证书",
                    "检查URL拼写",
                    "使用官方应用",
                    "启用双因素认证"
                ]
            ),

            ThreatType.MALWARE: SecurityThreat(
                threat_type=ThreatType.MALWARE,
                level=ThreatLevel.CRITICAL,
                description="恶意软件窃取私钥或篡改交易",
                attack_vectors=[
                    "键盘记录器",
                    "剪贴板病毒",
                    "假冒钱包软件",
                    "浏览器插件"
                ],
                prevention_measures=[
                    "使用杀毒软件",
                    "定期系统扫描",
                    "只从官方渠道下载软件",
                    "使用硬件钱包"
                ]
            ),

            ThreatType.CLIPBOARD_HIJACKING: SecurityThreat(
                threat_type=ThreatType.CLIPBOARD_HIJACKING,
                level=ThreatLevel.HIGH,
                description="恶意软件替换剪贴板中的地址",
                attack_vectors=[
                    "内存驻留病毒",
                    "后台监控程序",
                    "浏览器插件劫持"
                ],
                prevention_measures=[
                    "手动验证地址",
                    "使用地址簿",
                    "分段复制验证",
                    "使用硬件钱包确认"
                ]
            )
        }

        return threats

    def _initialize_patterns(self) -> Dict[str, re.Pattern]:
        """初始化安全模式匹配"""
        return {
            "suspicious_url": re.compile(r".*\.(tk|ml|ga|cf)/.*|.*xn--.*"),
            "weak_password": re.compile(r"^.{0,7}$|^[a-z]+$|^[A-Z]+$|^[0-9]+$"),
            "bitcoin_address": re.compile(r"^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$"),
            "ethereum_address": re.compile(r"^0x[a-fA-F0-9]{40}$")
        }

    def analyze_url_safety(self, url: str) -> Dict:
        """分析URL安全性"""
        risk_score = 0
        warnings = []

        # 检查可疑域名
        if self.security_patterns["suspicious_url"].match(url):
            risk_score += 30
            warnings.append("可疑的顶级域名")

        # 检查HTTPS
        if not url.startswith("https://"):
            risk_score += 20
            warnings.append("未使用HTTPS加密")

        # 检查常见钓鱼模式
        phishing_patterns = [
            "bin4nce", "coinb4se", "block-chain",
            "meta-mask", "my-ether-wallet"
        ]

        for pattern in phishing_patterns:
            if pattern in url.lower():
                risk_score += 50
                warnings.append(f"检测到钓鱼模式: {pattern}")

        # 评估风险等级
        if risk_score >= 50:
            risk_level = ThreatLevel.CRITICAL
        elif risk_score >= 30:
            risk_level = ThreatLevel.HIGH
        elif risk_score >= 15:
            risk_level = ThreatLevel.MEDIUM
        else:
            risk_level = ThreatLevel.LOW

        return {
            "url": url,
            "risk_score": risk_score,
            "risk_level": risk_level,
            "warnings": warnings,
            "safe": risk_score < 15
        }

    def validate_address(self, address: str, currency: str = "bitcoin") -> Dict:
        """验证地址格式"""
        if currency.lower() == "bitcoin":
            pattern = self.security_patterns["bitcoin_address"]
        elif currency.lower() == "ethereum":
            pattern = self.security_patterns["ethereum_address"]
        else:
            return {"valid": False, "error": "不支持的货币类型"}

        is_valid = bool(pattern.match(address))

        return {
            "address": address,
            "currency": currency,
            "valid": is_valid,
            "format_check": "通过" if is_valid else "失败"
        }

    def check_password_strength(self, password: str) -> Dict:
        """检查密码强度"""
        score = 0
        recommendations = []

        # 长度检查
        if len(password) >= 12:
            score += 25
        elif len(password) >= 8:
            score += 15
        else:
            recommendations.append("密码长度至少8位，建议12位以上")

        # 字符复杂性
        if re.search(r"[a-z]", password):
            score += 10
        else:
            recommendations.append("包含小写字母")

        if re.search(r"[A-Z]", password):
            score += 10
        else:
            recommendations.append("包含大写字母")

        if re.search(r"[0-9]", password):
            score += 10
        else:
            recommendations.append("包含数字")

        if re.search(r"[!@#$%^&*(),.?\":{}|<>]", password):
            score += 15
        else:
            recommendations.append("包含特殊字符")

        # 常见模式检查
        common_patterns = ["123456", "password", "qwerty", "abc", "111"]
        for pattern in common_patterns:
            if pattern in password.lower():
                score -= 20
                recommendations.append("避免使用常见模式")
                break

        # 评级
        if score >= 70:
            strength = "强"
        elif score >= 50:
            strength = "中等"
        elif score >= 30:
            strength = "弱"
        else:
            strength = "极弱"

        return {
            "score": max(0, score),
            "strength": strength,
            "recommendations": recommendations
        }

    def security_checklist(self) -> Dict:
        """安全检查清单"""
        return {
            "钱包安全": [
                "✓ 使用硬件钱包存储大额资金",
                "✓ 定期备份助记词",
                "✓ 使用强密码和2FA",
                "✓ 验证软件来源和完整性"
            ],
            "交易安全": [
                "✓ 双重确认接收地址",
                "✓ 检查交易费用合理性",
                "✓ 小额测试后再大额转账",
                "✓ 使用可信的RPC节点"
            ],
            "网络安全": [
                "✓ 使用VPN保护隐私",
                "✓ 避免公共WiFi进行交易",
                "✓ 定期更新软件和系统",
                "✓ 使用官方网站和应用"
            ],
            "存储安全": [
                "✓ 多重备份助记词",
                "✓ 物理安全存储",
                "✓ 避免数字化存储私钥",
                "✓ 定期检查备份有效性"
            ]
        }

# 安全分析演示
print("\n=== 虚拟货币安全分析演示 ===")

analyzer = SecurityAnalyzer()

# URL安全性分析
test_urls = [
    "https://www.binance.com",
    "http://bin4nce.tk/login",
    "https://metamask.io",
    "https://my-ether-wallet.com"
]

print("URL安全性分析:")
for url in test_urls:
    result = analyzer.analyze_url_safety(url)
    safety_status = "✅ 安全" if result["safe"] else "⚠️ 危险"
    print(f"  {url}")
    print(f"    {safety_status} (风险分数: {result['risk_score']})")
    if result["warnings"]:
        print(f"    警告: {', '.join(result['warnings'])}")
    print()

# 地址验证
print("地址格式验证:")
test_addresses = [
    ("1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2", "bitcoin"),
    ("0x742d35Cc6634C0532925a3b8D45d70c55e7c8f08", "ethereum"),
    ("invalid_address_123", "bitcoin")
]

for address, currency in test_addresses:
    result = analyzer.validate_address(address, currency)
    status = "✅ 有效" if result["valid"] else "❌ 无效"
    print(f"  {address[:20]}... ({currency}): {status}")

# 密码强度检查
print("\n密码强度分析:")
test_passwords = [
    "password123",
    "MyStr0ng!P@ssw0rd2024",
    "abc123",
    "Blockchain$Security#2024"
]

for password in test_passwords:
    result = analyzer.check_password_strength(password)
    print(f"  密码: {'*' * len(password)}")
    print(f"    强度: {result['strength']} ({result['score']}/100)")
    if result["recommendations"]:
        print(f"    建议: {', '.join(result['recommendations'][:2])}")
    print()

# 安全检查清单
print("=== 安全检查清单 ===")
checklist = analyzer.security_checklist()
for category, items in checklist.items():
    print(f"\n{category}:")
    for item in items:
        print(f"  {item}")
```

## 本章小结

本章全面学习了虚拟货币钱包和安全管理：

1. **钱包原理**：
   - 密钥对生成与管理
   - 助记词和种子机制
   - 地址派生算法

2. **钱包类型**：
   - **热钱包**：便利但风险较高
   - **冷钱包**：安全但使用不便
   - **硬件钱包**：平衡安全性与便利性

3. **助记词管理**：
   - BIP39标准实现
   - 安全存储和恢复
   - 密码短语保护

4. **安全威胁防护**：
   - 钓鱼攻击识别
   - 恶意软件防护
   - 密码安全管理
   - 地址验证机制

5. **最佳实践**：
   - 多重备份策略
   - 安全检查清单
   - 分级存储方案
   - 定期安全审计

理解和掌握这些安全概念对于安全使用虚拟货币至关重要。下一章我们将学习虚拟货币的交易基础知识。