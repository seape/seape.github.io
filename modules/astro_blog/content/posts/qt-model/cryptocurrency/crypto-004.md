---
title: 第4章：主流虚拟货币介绍
date: 2025-12-06
icon: circle-dot
author: Haiyue
category:
  - cryptocurrency
star: false
---

# 第4章：主流虚拟货币介绍

::: tip 学习目标
- 了解以太坊及智能合约
- 认识其他主流币种（瑞波币、莱特币等）
- 理解不同虚拟货币的特点和应用场景
- 掌握代币与原生币的区别
:::

## 以太坊（Ethereum）

### 基本概念与特点

以太坊是由Vitalik Buterin于2015年创建的去中心化平台，支持智能合约和去中心化应用（DApps）。

::: note 以太坊核心特性
- **图灵完备**：支持复杂的编程逻辑
- **智能合约**：自动执行的代码合约
- **虚拟机**：以太坊虚拟机（EVM）执行环境
- **Gas机制**：计算资源定价系统
- **账户模型**：与比特币UTXO模型不同的状态管理
:::

### 智能合约实现

```python
import json
import hashlib
from typing import Dict, Any, List, Optional
from dataclasses import dataclass, field

@dataclass
class Account:
    """以太坊账户"""
    address: str
    balance: float = 0.0
    nonce: int = 0
    code: str = ""  # 合约代码
    storage: Dict[str, Any] = field(default_factory=dict)  # 合约存储

class EthereumVirtualMachine:
    """以太坊虚拟机（简化版）"""

    def __init__(self):
        self.accounts: Dict[str, Account] = {}
        self.gas_price = 20  # Gwei
        self.block_gas_limit = 30_000_000

    def create_account(self, address: str, initial_balance: float = 0.0):
        """创建账户"""
        self.accounts[address] = Account(address, initial_balance)

    def deploy_contract(self, deployer: str, contract_code: str,
                       constructor_args: List = None, gas_limit: int = 500_000):
        """部署智能合约"""
        if deployer not in self.accounts:
            raise ValueError("部署者账户不存在")

        # 生成合约地址
        deployer_account = self.accounts[deployer]
        contract_address = self._generate_contract_address(deployer, deployer_account.nonce)

        # 创建合约账户
        contract_account = Account(
            address=contract_address,
            balance=0.0,
            code=contract_code
        )

        # 执行构造函数
        if constructor_args:
            gas_used = self._execute_constructor(contract_account, constructor_args)
        else:
            gas_used = 21000  # 基础gas消耗

        # 计算gas费用
        gas_fee = (gas_used * self.gas_price) / 1e9  # 转换为ETH

        if self.accounts[deployer].balance < gas_fee:
            raise ValueError("余额不足支付gas费用")

        # 扣除gas费用
        self.accounts[deployer].balance -= gas_fee
        self.accounts[deployer].nonce += 1

        # 保存合约
        self.accounts[contract_address] = contract_account

        print(f"合约部署成功")
        print(f"合约地址: {contract_address}")
        print(f"Gas消耗: {gas_used:,}")
        print(f"Gas费用: {gas_fee:.6f} ETH")

        return contract_address

    def call_contract(self, caller: str, contract_address: str,
                     function_name: str, args: List = None,
                     value: float = 0.0, gas_limit: int = 100_000):
        """调用智能合约"""
        if caller not in self.accounts or contract_address not in self.accounts:
            raise ValueError("账户或合约不存在")

        contract = self.accounts[contract_address]
        if not contract.code:
            raise ValueError("不是合约地址")

        # 转账ETH到合约（如果有）
        if value > 0:
            if self.accounts[caller].balance < value:
                raise ValueError("余额不足")
            self.accounts[caller].balance -= value
            contract.balance += value

        # 执行合约函数
        gas_used = self._execute_contract_function(
            contract, function_name, args or []
        )

        # 计算和扣除gas费用
        gas_fee = (gas_used * self.gas_price) / 1e9
        self.accounts[caller].balance -= gas_fee
        self.accounts[caller].nonce += 1

        print(f"合约调用成功")
        print(f"函数: {function_name}")
        print(f"Gas消耗: {gas_used:,}")
        print(f"Gas费用: {gas_fee:.6f} ETH")

        return gas_used

    def _generate_contract_address(self, deployer: str, nonce: int) -> str:
        """生成合约地址"""
        # 简化地址生成：deployer + nonce 的哈希
        data = f"{deployer}{nonce}"
        return "0x" + hashlib.sha256(data.encode()).hexdigest()[:40]

    def _execute_constructor(self, contract: Account, args: List) -> int:
        """执行合约构造函数"""
        # 简化实现：基础gas消耗 + 参数处理
        base_gas = 21000
        arg_gas = len(args) * 1000
        return base_gas + arg_gas

    def _execute_contract_function(self, contract: Account,
                                  function_name: str, args: List) -> int:
        """执行合约函数"""
        # 简化的智能合约执行模拟
        gas_costs = {
            "transfer": 21000,
            "approve": 22000,
            "mint": 25000,
            "burn": 20000,
            "get_balance": 2000,
            "set_value": 20000
        }

        base_gas = gas_costs.get(function_name, 30000)

        # 模拟不同函数的执行
        if function_name == "transfer":
            # 转账函数
            if len(args) >= 2:
                recipient, amount = args[0], args[1]
                # 更新合约存储状态
                contract.storage[f"balance_{recipient}"] = \
                    contract.storage.get(f"balance_{recipient}", 0) + amount

        elif function_name == "set_value":
            # 设置存储值
            if len(args) >= 2:
                key, value = args[0], args[1]
                contract.storage[key] = value

        elif function_name == "get_balance":
            # 查询余额（只读，gas消耗较少）
            pass

        return base_gas + len(args) * 500

    def get_account_info(self, address: str) -> Dict:
        """获取账户信息"""
        if address not in self.accounts:
            return {"error": "账户不存在"}

        account = self.accounts[address]
        return {
            "address": account.address,
            "balance": account.balance,
            "nonce": account.nonce,
            "is_contract": bool(account.code),
            "storage_size": len(account.storage)
        }

# 以太坊智能合约演示
print("=== 以太坊智能合约演示 ===")

# 初始化EVM
evm = EthereumVirtualMachine()

# 创建账户
evm.create_account("0xAlice", 10.0)
evm.create_account("0xBob", 5.0)

print("初始账户状态:")
print(f"Alice: {evm.get_account_info('0xAlice')}")
print(f"Bob: {evm.get_account_info('0xBob')}")

# 部署ERC-20代币合约
token_contract_code = """
pragma solidity ^0.8.0;

contract SimpleToken {
    mapping(address => uint256) public balances;
    string public name = "SimpleToken";
    string public symbol = "SIM";
    uint256 public totalSupply;

    constructor(uint256 _totalSupply) {
        totalSupply = _totalSupply;
        balances[msg.sender] = _totalSupply;
    }

    function transfer(address _to, uint256 _amount) public {
        require(balances[msg.sender] >= _amount);
        balances[msg.sender] -= _amount;
        balances[_to] += _amount;
    }
}
"""

# Alice部署代币合约
contract_address = evm.deploy_contract(
    deployer="0xAlice",
    contract_code=token_contract_code,
    constructor_args=[1000000],  # 总供应量100万
    gas_limit=500_000
)

# 调用合约函数
print(f"\n=== 代币转账 ===")
evm.call_contract(
    caller="0xAlice",
    contract_address=contract_address,
    function_name="transfer",
    args=["0xBob", 1000]  # 转给Bob 1000个代币
)

print(f"\n最终账户状态:")
print(f"Alice: {evm.get_account_info('0xAlice')}")
print(f"Bob: {evm.get_account_info('0xBob')}")
print(f"代币合约: {evm.get_account_info(contract_address)}")
```

### Gas机制详解

```python
class GasCalculator:
    """Gas费用计算器"""

    # Gas价格表（简化版）
    GAS_COSTS = {
        # 基础操作
        "ADD": 3,
        "SUB": 3,
        "MUL": 5,
        "DIV": 5,
        "SLOAD": 200,    # 从存储读取
        "SSTORE": 20000, # 写入存储（新值）
        "SSTORE_UPDATE": 5000,  # 更新存储
        "CALL": 700,     # 外部调用
        "CREATE": 32000, # 创建合约

        # 交易类型
        "TX_BASE": 21000,           # 基础交易
        "TX_CREATE": 53000,         # 创建合约交易
        "TX_DATA_ZERO": 4,          # 每字节零数据
        "TX_DATA_NONZERO": 16,      # 每字节非零数据
    }

    @classmethod
    def estimate_transaction_gas(cls, tx_type: str, data_bytes: int = 0,
                                zero_bytes: int = 0) -> int:
        """估算交易Gas消耗"""
        base_cost = cls.GAS_COSTS.get(f"TX_{tx_type.upper()}", cls.GAS_COSTS["TX_BASE"])

        # 数据成本
        nonzero_bytes = max(0, data_bytes - zero_bytes)
        data_cost = (zero_bytes * cls.GAS_COSTS["TX_DATA_ZERO"] +
                    nonzero_bytes * cls.GAS_COSTS["TX_DATA_NONZERO"])

        return base_cost + data_cost

    @classmethod
    def estimate_contract_execution(cls, operations: List[str]) -> int:
        """估算合约执行Gas消耗"""
        total_gas = 0

        for operation in operations:
            total_gas += cls.GAS_COSTS.get(operation.upper(), 100)  # 默认100 gas

        return total_gas

    @classmethod
    def calculate_gas_fee(cls, gas_used: int, gas_price_gwei: float) -> float:
        """计算Gas费用（ETH）"""
        return (gas_used * gas_price_gwei) / 1e9

# Gas计算演示
print("\n=== Gas费用计算演示 ===")

calc = GasCalculator()

# 1. 简单转账
transfer_gas = calc.estimate_transaction_gas("BASE")
print(f"简单ETH转账Gas消耗: {transfer_gas:,}")

# 2. 合约部署
deploy_gas = calc.estimate_transaction_gas("CREATE", data_bytes=1000)
print(f"合约部署Gas消耗: {deploy_gas:,}")

# 3. 合约函数调用
contract_operations = ["SLOAD", "ADD", "SSTORE", "CALL"]
execution_gas = calc.estimate_contract_execution(contract_operations)
total_gas = calc.estimate_transaction_gas("BASE") + execution_gas
print(f"合约调用Gas消耗: {total_gas:,}")

# 4. 不同Gas价格下的费用
gas_prices = [20, 50, 100, 200]  # Gwei
print(f"\nGas费用对比（使用{total_gas:,} Gas）:")
for price in gas_prices:
    fee = calc.calculate_gas_fee(total_gas, price)
    print(f"  {price:3d} Gwei: {fee:.6f} ETH (${fee*2000:.2f} @ $2000/ETH)")
```

## 其他主流虚拟货币

### 瑞波币（XRP）

瑞波币专注于跨境支付解决方案：

```python
import time
from typing import List
from dataclasses import dataclass

@dataclass
class RippleTransaction:
    """瑞波交易"""
    sender: str
    receiver: str
    amount: float
    currency: str = "XRP"
    timestamp: float = None
    sequence: int = 0
    fee: float = 0.00001  # 极低的交易费用

    def __post_init__(self):
        if self.timestamp is None:
            self.timestamp = time.time()

class RippleLedger:
    """瑞波账本"""

    def __init__(self):
        self.accounts: Dict[str, Dict] = {}
        self.transaction_history: List[RippleTransaction] = []
        self.validators = [
            "ripple_validator_1",
            "ripple_validator_2",
            "ripple_validator_3"
        ]

    def create_account(self, address: str, initial_balance: float = 0.0):
        """创建账户（需要20 XRP激活）"""
        if initial_balance < 20:
            raise ValueError("瑞波账户需要至少20 XRP激活")

        self.accounts[address] = {
            "balance": initial_balance,
            "sequence": 0,
            "trust_lines": {},  # 信任线（用于其他货币）
            "reserve": 20  # 账户保证金
        }

    def process_payment(self, tx: RippleTransaction) -> bool:
        """处理支付交易"""
        sender_account = self.accounts.get(tx.sender)

        if not sender_account:
            print(f"发送方账户 {tx.sender} 不存在")
            return False

        # 检查余额（需保留保证金）
        available_balance = sender_account["balance"] - sender_account["reserve"]
        total_cost = tx.amount + tx.fee

        if available_balance < total_cost:
            print(f"余额不足：可用 {available_balance}，需要 {total_cost}")
            return False

        # 执行交易
        sender_account["balance"] -= total_cost
        sender_account["sequence"] += 1

        # 接收方账户处理
        if tx.receiver not in self.accounts:
            # 自动创建账户（如果金额足够）
            if tx.amount >= 20:
                self.create_account(tx.receiver, tx.amount)
            else:
                print(f"接收金额不足以激活账户")
                return False
        else:
            self.accounts[tx.receiver]["balance"] += tx.amount

        # 记录交易
        self.transaction_history.append(tx)

        print(f"交易成功：{tx.sender} -> {tx.receiver}: {tx.amount} {tx.currency}")
        return True

    def get_account_balance(self, address: str) -> Dict:
        """获取账户余额"""
        account = self.accounts.get(address)
        if not account:
            return {"error": "账户不存在"}

        return {
            "address": address,
            "balance": account["balance"],
            "available": account["balance"] - account["reserve"],
            "reserve": account["reserve"],
            "sequence": account["sequence"]
        }

# 瑞波支付演示
print("\n=== 瑞波币支付演示 ===")

# 初始化瑞波账本
ripple = RippleLedger()

# 创建账户
ripple.create_account("bank_a", 1000000.0)
ripple.create_account("bank_b", 500000.0)

print("银行账户状态:")
print(f"Bank A: {ripple.get_account_balance('bank_a')}")
print(f"Bank B: {ripple.get_account_balance('bank_b')}")

# 跨境支付
cross_border_payment = RippleTransaction(
    sender="bank_a",
    receiver="bank_b",
    amount=50000.0,
    currency="XRP"
)

success = ripple.process_payment(cross_border_payment)
print(f"跨境支付结果: {'成功' if success else '失败'}")

print(f"\n支付后账户状态:")
print(f"Bank A: {ripple.get_account_balance('bank_a')}")
print(f"Bank B: {ripple.get_account_balance('bank_b')}")

# 瑞波的优势展示
print(f"\n=== 瑞波优势对比 ===")
comparison_data = {
    "Bitcoin": {"tx_time": "10-60分钟", "fee": "$1-50", "tps": 7},
    "Ethereum": {"tx_time": "1-5分钟", "fee": "$1-100", "tps": 15},
    "XRP": {"tx_time": "3-5秒", "fee": "$0.0002", "tps": 1500}
}

print("性能对比:")
for coin, metrics in comparison_data.items():
    print(f"  {coin:10s}: {metrics['tx_time']:>12s} | {metrics['fee']:>8s} | {metrics['tps']:>4d} TPS")
```

### 莱特币（Litecoin）

莱特币是比特币的改进版本，号称"数字白银"：

```python
class LitecoinBlock:
    """莱特币区块"""

    def __init__(self, previous_hash: str, transactions: List[Dict]):
        self.previous_hash = previous_hash
        self.transactions = transactions
        self.timestamp = time.time()
        self.nonce = 0
        self.target_time = 150  # 2.5分钟目标出块时间
        self.block_reward = 12.5  # 当前区块奖励

    def mine_with_scrypt(self, difficulty: int) -> bool:
        """使用Scrypt算法挖矿（模拟）"""
        target = "0" * difficulty
        start_time = time.time()

        print(f"开始莱特币挖矿（Scrypt算法）...")

        for nonce in range(100000):  # 限制尝试次数
            # 模拟Scrypt哈希计算（实际比SHA-256更耗内存）
            candidate_data = f"{self.previous_hash}{self.timestamp}{nonce}"
            # 在实际实现中，这里会使用Scrypt算法
            hash_result = hashlib.sha256(candidate_data.encode()).hexdigest()

            if hash_result.startswith(target):
                end_time = time.time()
                print(f"莱特币挖矿成功！")
                print(f"Nonce: {nonce}")
                print(f"哈希: {hash_result}")
                print(f"用时: {end_time - start_time:.2f}秒")
                return True

        print("莱特币挖矿演示结束")
        return False

# 莱特币特性对比
print("\n=== 莱特币vs比特币对比 ===")

ltc_features = {
    "Bitcoin": {
        "算法": "SHA-256",
        "出块时间": "10分钟",
        "总供应量": "2100万",
        "当前奖励": "6.25 BTC",
        "难度调整": "2016块(~2周)"
    },
    "Litecoin": {
        "算法": "Scrypt",
        "出块时间": "2.5分钟",
        "总供应量": "8400万",
        "当前奖励": "12.5 LTC",
        "难度调整": "2016块(~3.5天)"
    }
}

for coin, features in ltc_features.items():
    print(f"\n{coin}:")
    for key, value in features.items():
        print(f"  {key}: {value}")

# 模拟莱特币挖矿
ltc_block = LitecoinBlock("previous_hash_123", [{"tx": "sample"}])
ltc_block.mine_with_scrypt(difficulty=3)
```

### 币安币（BNB）

币安币是币安交易所发行的平台代币：

```python
class BNBToken:
    """币安币智能合约（简化版）"""

    def __init__(self):
        self.name = "Binance Coin"
        self.symbol = "BNB"
        self.decimals = 18
        self.total_supply = 200_000_000  # 2亿总供应
        self.balances = {}
        self.burn_events = []  # 销毁记录

    def transfer(self, from_addr: str, to_addr: str, amount: float) -> bool:
        """代币转账"""
        if self.balances.get(from_addr, 0) < amount:
            return False

        self.balances[from_addr] = self.balances.get(from_addr, 0) - amount
        self.balances[to_addr] = self.balances.get(to_addr, 0) + amount
        return True

    def burn_tokens(self, amount: float) -> bool:
        """销毁代币（币安季度销毁）"""
        if self.total_supply < amount:
            return False

        self.total_supply -= amount
        self.burn_events.append({
            "amount": amount,
            "timestamp": time.time(),
            "remaining_supply": self.total_supply
        })

        print(f"BNB销毁: {amount:,.0f} BNB")
        print(f"剩余供应: {self.total_supply:,.0f} BNB")
        return True

    def calculate_trading_discount(self, trading_fee: float, bnb_balance: float) -> float:
        """计算交易费折扣"""
        if bnb_balance >= 100:  # VIP等级判断简化
            discount_rate = 0.25  # 25%折扣
            return trading_fee * (1 - discount_rate)
        return trading_fee

# BNB功能演示
print("\n=== 币安币功能演示 ===")

bnb = BNBToken()

# 模拟币安季度销毁
quarterly_burns = [2_123_456, 1_987_654, 2_456_789, 1_765_432]

print("币安季度BNB销毁:")
for i, burn_amount in enumerate(quarterly_burns, 1):
    bnb.burn_tokens(burn_amount)
    print(f"第{i}季度销毁完成\n")

# 交易费折扣演示
trading_fees = [100, 250, 500]  # USDT
bnb_holdings = [50, 150, 1000]  # BNB

print("BNB持仓交易费折扣:")
for fee, holding in zip(trading_fees, bnb_holdings):
    discounted_fee = bnb.calculate_trading_discount(fee, holding)
    discount_pct = (fee - discounted_fee) / fee * 100
    print(f"交易费: ${fee} | BNB持仓: {holding} | 折后费用: ${discounted_fee:.2f} ({discount_pct:.0f}%折扣)")
```

## 代币标准与分类

### ERC-20代币标准

```python
from abc import ABC, abstractmethod

class IERC20(ABC):
    """ERC-20代币接口标准"""

    @abstractmethod
    def total_supply(self) -> int:
        """返回代币总供应量"""
        pass

    @abstractmethod
    def balance_of(self, account: str) -> int:
        """返回账户余额"""
        pass

    @abstractmethod
    def transfer(self, to: str, amount: int) -> bool:
        """转账"""
        pass

    @abstractmethod
    def allowance(self, owner: str, spender: str) -> int:
        """返回授权额度"""
        pass

    @abstractmethod
    def approve(self, spender: str, amount: int) -> bool:
        """授权额度"""
        pass

    @abstractmethod
    def transfer_from(self, from_addr: str, to: str, amount: int) -> bool:
        """代理转账"""
        pass

class ERC20Token(IERC20):
    """ERC-20代币实现"""

    def __init__(self, name: str, symbol: str, decimals: int = 18,
                 total_supply: int = 0):
        self.name = name
        self.symbol = symbol
        self.decimals = decimals
        self._total_supply = total_supply
        self._balances: Dict[str, int] = {}
        self._allowances: Dict[str, Dict[str, int]] = {}

        # 将全部供应量分配给部署者
        if total_supply > 0:
            deployer = "0xDeployer"
            self._balances[deployer] = total_supply

    def total_supply(self) -> int:
        return self._total_supply

    def balance_of(self, account: str) -> int:
        return self._balances.get(account, 0)

    def transfer(self, to: str, amount: int) -> bool:
        return self._transfer("msg.sender", to, amount)

    def allowance(self, owner: str, spender: str) -> int:
        return self._allowances.get(owner, {}).get(spender, 0)

    def approve(self, spender: str, amount: int) -> bool:
        owner = "msg.sender"
        if owner not in self._allowances:
            self._allowances[owner] = {}
        self._allowances[owner][spender] = amount
        print(f"授权: {owner} -> {spender}: {amount}")
        return True

    def transfer_from(self, from_addr: str, to: str, amount: int) -> bool:
        spender = "msg.sender"
        current_allowance = self.allowance(from_addr, spender)

        if current_allowance < amount:
            print("授权额度不足")
            return False

        # 减少授权额度
        self._allowances[from_addr][spender] = current_allowance - amount

        # 执行转账
        return self._transfer(from_addr, to, amount)

    def _transfer(self, from_addr: str, to: str, amount: int) -> bool:
        if amount <= 0:
            return False

        from_balance = self.balance_of(from_addr)
        if from_balance < amount:
            print(f"余额不足: {from_balance} < {amount}")
            return False

        # 执行转账
        self._balances[from_addr] = from_balance - amount
        self._balances[to] = self.balance_of(to) + amount

        print(f"转账: {from_addr} -> {to}: {amount}")
        return True

# ERC-20代币演示
print("\n=== ERC-20代币演示 ===")

# 创建USDT代币
usdt = ERC20Token(
    name="Tether USD",
    symbol="USDT",
    decimals=6,
    total_supply=50_000_000_000 * (10**6)  # 500亿USDT
)

print(f"代币信息:")
print(f"  名称: {usdt.name}")
print(f"  符号: {usdt.symbol}")
print(f"  小数位: {usdt.decimals}")
print(f"  总供应: {usdt.total_supply() / (10**usdt.decimals):,.0f} {usdt.symbol}")

# 模拟转账操作
deployer = "0xDeployer"
alice = "0xAlice"
bob = "0xBob"

print(f"\n初始余额:")
print(f"部署者: {usdt.balance_of(deployer) / (10**usdt.decimals):,.0f} USDT")

# 部署者转账给Alice
transfer_amount = 1000 * (10**usdt.decimals)  # 1000 USDT
usdt._balances["msg.sender"] = usdt._balances[deployer]  # 模拟msg.sender
success = usdt.transfer(alice, transfer_amount)

print(f"转账结果: {success}")
print(f"Alice余额: {usdt.balance_of(alice) / (10**usdt.decimals):,.0f} USDT")

# Alice授权Bob代理转账
approve_amount = 500 * (10**usdt.decimals)  # 500 USDT
usdt._allowances["msg.sender"] = usdt._allowances.get(alice, {})
usdt.approve(bob, approve_amount)

# Bob代理转账
transfer_amount_2 = 200 * (10**usdt.decimals)  # 200 USDT
charlie = "0xCharlie"
success = usdt.transfer_from(alice, charlie, transfer_amount_2)

print(f"代理转账结果: {success}")
print(f"最终余额:")
print(f"  Alice: {usdt.balance_of(alice) / (10**usdt.decimals):,.0f} USDT")
print(f"  Charlie: {usdt.balance_of(charlie) / (10**usdt.decimals):,.0f} USDT")
print(f"  剩余授权: {usdt.allowance(alice, bob) / (10**usdt.decimals):,.0f} USDT")
```

### NFT标准（ERC-721）

```python
class ERC721Token:
    """ERC-721 NFT代币"""

    def __init__(self, name: str, symbol: str):
        self.name = name
        self.symbol = symbol
        self._owners: Dict[int, str] = {}  # tokenId -> owner
        self._token_approvals: Dict[int, str] = {}  # tokenId -> approved
        self._operator_approvals: Dict[str, Dict[str, bool]] = {}  # owner -> operator -> approved
        self._token_uris: Dict[int, str] = {}  # tokenId -> tokenURI
        self._token_counter = 0

    def mint(self, to: str, token_uri: str) -> int:
        """铸造NFT"""
        token_id = self._token_counter
        self._owners[token_id] = to
        self._token_uris[token_id] = token_uri
        self._token_counter += 1

        print(f"NFT铸造: Token #{token_id} -> {to}")
        print(f"元数据URI: {token_uri}")
        return token_id

    def owner_of(self, token_id: int) -> str:
        """获取NFT所有者"""
        return self._owners.get(token_id, "")

    def token_uri(self, token_id: int) -> str:
        """获取NFT元数据URI"""
        return self._token_uris.get(token_id, "")

    def transfer_from(self, from_addr: str, to: str, token_id: int) -> bool:
        """转移NFT"""
        if self._owners.get(token_id) != from_addr:
            print("只有所有者才能转移NFT")
            return False

        self._owners[token_id] = to
        # 清除授权
        self._token_approvals.pop(token_id, None)

        print(f"NFT转移: Token #{token_id} from {from_addr} to {to}")
        return True

    def approve(self, to: str, token_id: int):
        """授权NFT"""
        owner = self._owners.get(token_id)
        if not owner:
            raise ValueError("Token不存在")

        self._token_approvals[token_id] = to
        print(f"NFT授权: Token #{token_id} -> {to}")

    def get_collection_info(self) -> Dict:
        """获取集合信息"""
        unique_owners = set(self._owners.values())
        return {
            "name": self.name,
            "symbol": self.symbol,
            "total_supply": len(self._owners),
            "unique_owners": len(unique_owners),
            "floor_price": "根据市场确定"
        }

# NFT演示
print("\n=== NFT (ERC-721) 演示 ===")

# 创建CryptoPunks风格的NFT集合
crypto_art = ERC721Token("Crypto Art Collection", "CAC")

# 铸造NFT
artists = ["0xArtist1", "0xArtist2", "0xCollector1"]
artworks = [
    "https://ipfs.io/ipfs/QmABC.../punk1.json",
    "https://ipfs.io/ipfs/QmDEF.../abstract2.json",
    "https://ipfs.io/ipfs/QmGHI.../portrait3.json"
]

token_ids = []
for artist, artwork_uri in zip(artists, artworks):
    token_id = crypto_art.mint(artist, artwork_uri)
    token_ids.append(token_id)

print(f"\n集合信息:")
collection_info = crypto_art.get_collection_info()
for key, value in collection_info.items():
    print(f"  {key}: {value}")

# NFT交易
print(f"\n=== NFT交易 ===")
buyer = "0xCollector2"
selling_token_id = token_ids[0]

print(f"交易前所有者: {crypto_art.owner_of(selling_token_id)}")

# 执行NFT转移
success = crypto_art.transfer_from(
    crypto_art.owner_of(selling_token_id),
    buyer,
    selling_token_id
)

print(f"交易后所有者: {crypto_art.owner_of(selling_token_id)}")
print(f"NFT元数据: {crypto_art.token_uri(selling_token_id)}")
```

## 本章小结

本章全面介绍了主流虚拟货币的特点和应用：

1. **以太坊生态**：
   - 智能合约和EVM
   - Gas机制和费用计算
   - 丰富的DApp生态

2. **其他主流币种**：
   - **瑞波币**：快速跨境支付，3-5秒确认
   - **莱特币**：比特币改进版，2.5分钟出块
   - **币安币**：平台代币，交易费折扣

3. **代币标准**：
   - **ERC-20**：同质化代币标准
   - **ERC-721**：非同质化代币(NFT)标准
   - 不同标准的应用场景

4. **技术对比**：
   - 性能指标：TPS、确认时间、费用
   - 共识机制：PoW、PoS、联盟链
   - 应用场景：支付、智能合约、DeFi

每种虚拟货币都有其独特的技术特点和应用场景，理解这些差异有助于选择合适的区块链解决方案。下一章我们将学习虚拟货币的安全存储和钱包管理。