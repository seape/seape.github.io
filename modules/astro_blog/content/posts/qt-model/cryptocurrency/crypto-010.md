---
title: "第10章：虚拟货币挖矿技术"
date: "2024-12-06"
icon: "⛏️"
author: "Claude"
category: "Cryptocurrency"
---

# 第10章：虚拟货币挖矿技术

## 10.1 挖矿基础概念

### 10.1.1 什么是挖矿

挖矿是通过计算解决数学难题来验证交易并创建新区块的过程。这是区块链网络的核心安全机制之一。

```python
import hashlib
import time
import json
import random
from datetime import datetime

class Block:
    def __init__(self, index, transactions, previous_hash, timestamp=None):
        self.index = index
        self.transactions = transactions
        self.previous_hash = previous_hash
        self.timestamp = timestamp or datetime.now()
        self.nonce = 0
        self.hash = None

    def calculate_hash(self):
        """计算区块哈希"""
        block_string = json.dumps({
            'index': self.index,
            'transactions': self.transactions,
            'previous_hash': self.previous_hash,
            'timestamp': self.timestamp.isoformat(),
            'nonce': self.nonce
        }, sort_keys=True)
        return hashlib.sha256(block_string.encode()).hexdigest()

    def mine_block(self, difficulty):
        """挖矿过程 - 工作量证明"""
        target = "0" * difficulty
        start_time = time.time()
        hash_count = 0

        print(f"开始挖矿区块 {self.index}, 难度: {difficulty}")
        print(f"目标: 哈希必须以 {target} 开头")

        while True:
            self.hash = self.calculate_hash()
            hash_count += 1

            if self.hash[:difficulty] == target:
                end_time = time.time()
                mining_time = end_time - start_time
                hash_rate = hash_count / mining_time if mining_time > 0 else 0

                print(f"区块挖矿成功!")
                print(f"哈希: {self.hash}")
                print(f"Nonce: {self.nonce}")
                print(f"耗时: {mining_time:.2f}秒")
                print(f"尝试次数: {hash_count:,}")
                print(f"哈希率: {hash_rate:,.0f} H/s")
                break

            self.nonce += 1

            # 每10万次尝试显示一次进度
            if hash_count % 100000 == 0:
                elapsed = time.time() - start_time
                current_hash_rate = hash_count / elapsed if elapsed > 0 else 0
                print(f"进度: {hash_count:,} 次尝试, 当前哈希率: {current_hash_rate:,.0f} H/s")

class SimpleMiner:
    def __init__(self):
        self.blockchain = []
        self.pending_transactions = []
        self.mining_reward = 10
        self.difficulty = 4

    def create_genesis_block(self):
        """创建创世区块"""
        genesis_block = Block(0, [], "0")
        genesis_block.mine_block(self.difficulty)
        self.blockchain.append(genesis_block)
        return genesis_block

    def get_latest_block(self):
        """获取最新区块"""
        return self.blockchain[-1] if self.blockchain else None

    def add_transaction(self, transaction):
        """添加待确认交易"""
        self.pending_transactions.append(transaction)

    def mine_pending_transactions(self, mining_reward_address):
        """挖矿确认待处理交易"""
        # 添加挖矿奖励交易
        reward_transaction = {
            'from': None,  # None表示挖矿奖励
            'to': mining_reward_address,
            'amount': self.mining_reward
        }

        self.pending_transactions.append(reward_transaction)

        # 创建新区块
        previous_block = self.get_latest_block()
        new_block = Block(
            index=len(self.blockchain),
            transactions=self.pending_transactions.copy(),
            previous_hash=previous_block.hash if previous_block else "0"
        )

        # 挖矿
        new_block.mine_block(self.difficulty)

        # 添加到区块链
        self.blockchain.append(new_block)

        # 清空待处理交易
        self.pending_transactions = []

        return new_block

    def adjust_difficulty(self, target_time=10):
        """调整挖矿难度"""
        if len(self.blockchain) < 2:
            return

        latest_block = self.blockchain[-1]
        previous_block = self.blockchain[-2]

        # 计算实际出块时间
        actual_time = (latest_block.timestamp - previous_block.timestamp).total_seconds()

        # 调整难度
        if actual_time < target_time / 2:
            self.difficulty += 1
            print(f"挖矿过快，难度增加到: {self.difficulty}")
        elif actual_time > target_time * 2:
            self.difficulty = max(1, self.difficulty - 1)
            print(f"挖矿过慢，难度降低到: {self.difficulty}")

# 挖矿演示
print("虚拟货币挖矿演示")
print("=" * 50)

miner = SimpleMiner()

# 创建创世区块
print("创建创世区块...")
genesis = miner.create_genesis_block()

# 添加一些交易
transactions = [
    {'from': 'Alice', 'to': 'Bob', 'amount': 50},
    {'from': 'Bob', 'to': 'Charlie', 'amount': 25},
    {'from': 'Charlie', 'to': 'Alice', 'amount': 10}
]

for tx in transactions:
    miner.add_transaction(tx)

print(f"\n待确认交易数量: {len(miner.pending_transactions)}")

# 挖矿
print("\n开始挖矿...")
miner_address = "MinerRewardAddress123"
new_block = miner.mine_pending_transactions(miner_address)

print(f"\n区块链长度: {len(miner.blockchain)}")
print(f"最新区块包含交易数: {len(new_block.transactions)}")

# 显示区块链信息
print("\n区块链信息:")
for block in miner.blockchain:
    print(f"区块 {block.index}: {block.hash[:10]}... (交易: {len(block.transactions)})")
```

### 10.1.2 挖矿难度调整机制

```python
import matplotlib.pyplot as plt
import numpy as np

class DifficultyAdjustment:
    def __init__(self, target_time=600, adjustment_interval=2016):  # 比特币参数
        self.target_time = target_time  # 目标出块时间（秒）
        self.adjustment_interval = adjustment_interval  # 调整间隔（区块数）
        self.difficulty_history = []
        self.block_times = []

    def calculate_new_difficulty(self, actual_time_span, current_difficulty):
        """计算新难度"""
        expected_time_span = self.target_time * self.adjustment_interval

        # 限制调整幅度（比特币最大4倍调整）
        if actual_time_span < expected_time_span / 4:
            actual_time_span = expected_time_span / 4
        if actual_time_span > expected_time_span * 4:
            actual_time_span = expected_time_span * 4

        new_difficulty = current_difficulty * expected_time_span / actual_time_span
        return new_difficulty

    def simulate_mining(self, num_blocks=10000, hash_rate_changes=None):
        """模拟挖矿过程"""
        current_difficulty = 1.0
        current_hash_rate = 1000  # TH/s

        for block_num in range(num_blocks):
            # 模拟哈希率变化
            if hash_rate_changes and block_num in hash_rate_changes:
                current_hash_rate *= hash_rate_changes[block_num]
                print(f"区块 {block_num}: 哈希率变化到 {current_hash_rate:.0f} TH/s")

            # 计算出块时间（简化模型）
            expected_time = self.target_time * current_difficulty / current_hash_rate
            # 添加随机性
            actual_time = np.random.exponential(expected_time)

            self.block_times.append(actual_time)

            # 难度调整
            if (block_num + 1) % self.adjustment_interval == 0:
                total_time = sum(self.block_times[-self.adjustment_interval:])
                new_difficulty = self.calculate_new_difficulty(total_time, current_difficulty)

                print(f"区块 {block_num + 1}: 难度调整")
                print(f"  实际时间: {total_time:.0f}s ({total_time/3600:.1f}h)")
                print(f"  期望时间: {self.target_time * self.adjustment_interval:.0f}s")
                print(f"  难度: {current_difficulty:.6f} -> {new_difficulty:.6f}")
                print(f"  调整幅度: {new_difficulty/current_difficulty:.2f}x")

                current_difficulty = new_difficulty

            self.difficulty_history.append(current_difficulty)

        return self.difficulty_history, self.block_times

    def analyze_stability(self):
        """分析挖矿稳定性"""
        if len(self.block_times) < 100:
            return {}

        recent_times = self.block_times[-100:]  # 最近100个区块
        avg_time = np.mean(recent_times)
        std_time = np.std(recent_times)
        target_deviation = abs(avg_time - self.target_time) / self.target_time

        return {
            'average_block_time': avg_time,
            'target_block_time': self.target_time,
            'deviation_from_target': target_deviation,
            'standard_deviation': std_time,
            'stability_score': 1 / (1 + target_deviation)  # 0-1分数
        }

# 难度调整模拟
print("\n挖矿难度调整模拟")
print("=" * 40)

difficulty_system = DifficultyAdjustment(target_time=600, adjustment_interval=100)  # 简化参数

# 模拟哈希率变化场景
hash_rate_changes = {
    2000: 2.0,  # 区块2000处哈希率翻倍
    4000: 0.5,  # 区块4000处哈希率减半
    6000: 3.0,  # 区块6000处哈希率增加3倍
    8000: 0.3   # 区块8000处哈希率大幅下降
}

difficulties, block_times = difficulty_system.simulate_mining(
    num_blocks=10000,
    hash_rate_changes=hash_rate_changes
)

# 分析稳定性
stability = difficulty_system.analyze_stability()
print(f"\n挖矿稳定性分析:")
print(f"平均出块时间: {stability['average_block_time']:.0f}s")
print(f"目标出块时间: {stability['target_block_time']:.0f}s")
print(f"偏差程度: {stability['deviation_from_target']:.2%}")
print(f"稳定性评分: {stability['stability_score']:.3f}")
```

## 10.2 共识算法详解

### 10.2.1 工作量证明 (Proof of Work)

```python
import random
from concurrent.futures import ThreadPoolExecutor
import threading

class ProofOfWork:
    def __init__(self, difficulty=4):
        self.difficulty = difficulty
        self.target = 2 ** (256 - difficulty * 4)

    def validate_proof(self, block_data, nonce):
        """验证工作量证明"""
        hash_result = hashlib.sha256(f"{block_data}{nonce}".encode()).hexdigest()
        return int(hash_result, 16) < self.target

    def mine_block(self, block_data, start_nonce=0, max_nonce=None):
        """挖矿过程"""
        nonce = start_nonce
        start_time = time.time()

        while max_nonce is None or nonce < max_nonce:
            if self.validate_proof(block_data, nonce):
                end_time = time.time()
                return {
                    'success': True,
                    'nonce': nonce,
                    'hash': hashlib.sha256(f"{block_data}{nonce}".encode()).hexdigest(),
                    'time_taken': end_time - start_time,
                    'attempts': nonce - start_nonce + 1
                }
            nonce += 1

        return {'success': False, 'attempts': nonce - start_nonce}

class MiningPool:
    def __init__(self, difficulty=4, num_miners=4):
        self.pow = ProofOfWork(difficulty)
        self.num_miners = num_miners
        self.mining_results = []
        self.mining_active = False
        self.winner_found = threading.Event()

    def miner_worker(self, miner_id, block_data, nonce_range):
        """矿工工作函数"""
        start_nonce, end_nonce = nonce_range
        print(f"矿工 {miner_id} 开始挖矿: nonce范围 {start_nonce:,} - {end_nonce:,}")

        current_nonce = start_nonce
        start_time = time.time()

        while current_nonce < end_nonce and not self.winner_found.is_set():
            if self.pow.validate_proof(block_data, current_nonce):
                self.winner_found.set()
                end_time = time.time()

                result = {
                    'miner_id': miner_id,
                    'success': True,
                    'nonce': current_nonce,
                    'hash': hashlib.sha256(f"{block_data}{current_nonce}".encode()).hexdigest(),
                    'time_taken': end_time - start_time,
                    'attempts': current_nonce - start_nonce + 1
                }

                self.mining_results.append(result)
                print(f"🎉 矿工 {miner_id} 找到了解!")
                print(f"Nonce: {current_nonce}, 哈希: {result['hash'][:16]}...")
                return result

            current_nonce += 1

            # 每1万次检查一次是否有其他矿工找到解
            if current_nonce % 10000 == 0 and self.winner_found.is_set():
                break

        # 如果没找到解
        if not self.winner_found.is_set():
            end_time = time.time()
            result = {
                'miner_id': miner_id,
                'success': False,
                'time_taken': end_time - start_time,
                'attempts': current_nonce - start_nonce
            }
            self.mining_results.append(result)

        return None

    def start_mining(self, block_data):
        """开始分布式挖矿"""
        self.mining_results = []
        self.winner_found.clear()

        # 为每个矿工分配nonce范围
        range_size = 2 ** 20  # 每个矿工100万个nonce
        nonce_ranges = []
        for i in range(self.num_miners):
            start = i * range_size
            end = start + range_size
            nonce_ranges.append((start, end))

        print(f"开始{self.num_miners}个矿工并行挖矿...")
        print(f"目标: 哈希值前{self.pow.difficulty}位为0")

        # 使用线程池并行挖矿
        with ThreadPoolExecutor(max_workers=self.num_miners) as executor:
            futures = []
            for i, nonce_range in enumerate(nonce_ranges):
                future = executor.submit(self.miner_worker, i+1, block_data, nonce_range)
                futures.append(future)

            # 等待第一个成功的结果
            for future in futures:
                try:
                    result = future.result(timeout=10)  # 10秒超时
                    if result and result['success']:
                        break
                except:
                    continue

        return self.mining_results

    def get_mining_statistics(self):
        """获取挖矿统计"""
        if not self.mining_results:
            return {}

        total_attempts = sum(result['attempts'] for result in self.mining_results)
        total_time = max(result['time_taken'] for result in self.mining_results)
        winner = next((r for r in self.mining_results if r.get('success')), None)

        stats = {
            'total_miners': len(self.mining_results),
            'total_attempts': total_attempts,
            'total_time': total_time,
            'combined_hash_rate': total_attempts / total_time if total_time > 0 else 0,
            'winner': winner
        }

        return stats

# PoW挖矿演示
print("\n工作量证明挖矿演示")
print("=" * 40)

# 创建区块数据
block_data = {
    'index': 1,
    'transactions': ['Alice->Bob: 10 BTC', 'Bob->Charlie: 5 BTC'],
    'previous_hash': '000abc123def456...',
    'timestamp': datetime.now().isoformat()
}

block_string = json.dumps(block_data, sort_keys=True)

# 单个矿工挖矿
print("单个矿工挖矿:")
pow = ProofOfWork(difficulty=4)
result = pow.mine_block(block_string)

if result['success']:
    print(f"挖矿成功!")
    print(f"Nonce: {result['nonce']}")
    print(f"哈希: {result['hash']}")
    print(f"耗时: {result['time_taken']:.2f}秒")
    print(f"尝试次数: {result['attempts']:,}")
    hash_rate = result['attempts'] / result['time_taken'] if result['time_taken'] > 0 else 0
    print(f"哈希率: {hash_rate:,.0f} H/s")

# 多矿工竞争挖矿
print(f"\n多矿工竞争挖矿:")
mining_pool = MiningPool(difficulty=4, num_miners=4)
pool_results = mining_pool.start_mining(block_string)

stats = mining_pool.get_mining_statistics()
if stats:
    print(f"\n挖矿统计:")
    print(f"参与矿工数: {stats['total_miners']}")
    print(f"总尝试次数: {stats['total_attempts']:,}")
    print(f"总耗时: {stats['total_time']:.2f}秒")
    print(f"综合哈希率: {stats['combined_hash_rate']:,.0f} H/s")

    if stats['winner']:
        winner = stats['winner']
        print(f"获胜矿工: 矿工 {winner['miner_id']}")
        print(f"获胜时间: {winner['time_taken']:.2f}秒")
```

### 10.2.2 权益证明 (Proof of Stake)

```python
class ProofOfStake:
    def __init__(self):
        self.validators = {}
        self.total_stake = 0
        self.validator_history = {}
        self.slashing_conditions = []

    def add_validator(self, validator_id, stake_amount):
        """添加验证者"""
        if validator_id in self.validators:
            self.validators[validator_id]['stake'] += stake_amount
        else:
            self.validators[validator_id] = {
                'stake': stake_amount,
                'blocks_validated': 0,
                'rewards_earned': 0,
                'slashed': False,
                'join_time': datetime.now()
            }

        self.total_stake += stake_amount
        self._update_validator_weights()

    def _update_validator_weights(self):
        """更新验证者权重"""
        if self.total_stake > 0:
            for validator_id in self.validators:
                stake = self.validators[validator_id]['stake']
                self.validators[validator_id]['weight'] = stake / self.total_stake

    def select_validator(self, block_height, randomness_seed=None):
        """选择下一个区块验证者"""
        if not self.validators or self.total_stake == 0:
            return None

        # 使用可验证随机函数（VRF）的简化版本
        if randomness_seed is None:
            randomness_seed = block_height

        random.seed(randomness_seed)

        # 加权随机选择
        validators_list = []
        weights = []

        for validator_id, validator_data in self.validators.items():
            if not validator_data['slashed']:  # 被惩罚的验证者不能参与
                validators_list.append(validator_id)
                weights.append(validator_data['weight'])

        if not validators_list:
            return None

        selected_validator = random.choices(validators_list, weights=weights)[0]
        return selected_validator

    def validate_block(self, validator_id, block_data):
        """验证者验证区块"""
        if validator_id not in self.validators:
            return {'success': False, 'error': 'Validator not found'}

        validator = self.validators[validator_id]
        if validator['slashed']:
            return {'success': False, 'error': 'Validator is slashed'}

        # 模拟验证过程
        validation_time = time.time()

        # 基本验证检查
        validation_checks = {
            'format_valid': self._check_block_format(block_data),
            'transactions_valid': self._check_transactions(block_data),
            'previous_hash_valid': self._check_previous_hash(block_data)
        }

        all_valid = all(validation_checks.values())

        if all_valid:
            # 验证成功，给予奖励
            reward = self._calculate_reward(validator_id)
            validator['blocks_validated'] += 1
            validator['rewards_earned'] += reward

            result = {
                'success': True,
                'validator_id': validator_id,
                'validation_time': validation_time,
                'reward': reward,
                'checks': validation_checks
            }
        else:
            # 验证失败，可能的惩罚
            penalty = self._calculate_penalty(validator_id, validation_checks)

            result = {
                'success': False,
                'validator_id': validator_id,
                'validation_time': validation_time,
                'penalty': penalty,
                'checks': validation_checks
            }

        return result

    def _check_block_format(self, block_data):
        """检查区块格式"""
        required_fields = ['index', 'transactions', 'previous_hash', 'timestamp']
        return all(field in block_data for field in required_fields)

    def _check_transactions(self, block_data):
        """检查交易有效性"""
        # 简化检查
        transactions = block_data.get('transactions', [])
        return len(transactions) <= 1000  # 最大交易数限制

    def _check_previous_hash(self, block_data):
        """检查前一个区块哈希"""
        # 简化检查
        prev_hash = block_data.get('previous_hash', '')
        return len(prev_hash) == 64  # SHA256哈希长度

    def _calculate_reward(self, validator_id):
        """计算验证奖励"""
        base_reward = 10
        stake_bonus = self.validators[validator_id]['stake'] * 0.001
        return base_reward + stake_bonus

    def _calculate_penalty(self, validator_id, validation_checks):
        """计算惩罚"""
        failed_checks = sum(1 for check in validation_checks.values() if not check)
        penalty_rate = failed_checks * 0.1  # 每个失败检查10%惩罚

        validator = self.validators[validator_id]
        penalty = validator['stake'] * penalty_rate

        # 应用惩罚
        if penalty > 0:
            validator['stake'] = max(0, validator['stake'] - penalty)
            self.total_stake = max(0, self.total_stake - penalty)
            self._update_validator_weights()

        return penalty

    def implement_slashing(self, validator_id, reason):
        """实施罚没"""
        if validator_id not in self.validators:
            return False

        validator = self.validators[validator_id]
        slashed_amount = validator['stake']

        # 没收所有权益
        validator['stake'] = 0
        validator['slashed'] = True
        validator['slashing_reason'] = reason
        validator['slashing_time'] = datetime.now()

        self.total_stake -= slashed_amount
        self._update_validator_weights()

        print(f"验证者 {validator_id} 被罚没，原因: {reason}")
        print(f"罚没金额: {slashed_amount}")

        return True

    def get_validator_info(self, validator_id):
        """获取验证者信息"""
        if validator_id not in self.validators:
            return None

        validator = self.validators[validator_id]
        return {
            'validator_id': validator_id,
            'stake': validator['stake'],
            'weight': validator.get('weight', 0),
            'blocks_validated': validator['blocks_validated'],
            'rewards_earned': validator['rewards_earned'],
            'slashed': validator['slashed'],
            'join_time': validator['join_time']
        }

    def get_network_stats(self):
        """获取网络统计"""
        active_validators = sum(1 for v in self.validators.values() if not v['slashed'])
        total_blocks_validated = sum(v['blocks_validated'] for v in self.validators.values())

        return {
            'total_validators': len(self.validators),
            'active_validators': active_validators,
            'total_stake': self.total_stake,
            'total_blocks_validated': total_blocks_validated,
            'average_stake': self.total_stake / len(self.validators) if self.validators else 0
        }

# PoS演示
print("\n权益证明挖矿演示")
print("=" * 40)

pos_network = ProofOfStake()

# 添加验证者
validators_data = [
    ('Validator_A', 1000),
    ('Validator_B', 2000),
    ('Validator_C', 500),
    ('Validator_D', 1500)
]

print("添加验证者:")
for validator_id, stake in validators_data:
    pos_network.add_validator(validator_id, stake)
    info = pos_network.get_validator_info(validator_id)
    print(f"{validator_id}: 权益 {stake}, 权重 {info['weight']:.2%}")

# 模拟区块验证过程
print(f"\n模拟区块验证:")
for block_height in range(1, 6):
    # 选择验证者
    selected_validator = pos_network.select_validator(block_height)

    if selected_validator:
        print(f"\n区块 {block_height}:")
        print(f"选中验证者: {selected_validator}")

        # 创建测试区块
        test_block = {
            'index': block_height,
            'transactions': [f'tx_{i}' for i in range(random.randint(1, 10))],
            'previous_hash': 'a' * 64,  # 模拟哈希
            'timestamp': datetime.now().isoformat()
        }

        # 验证区块
        validation_result = pos_network.validate_block(selected_validator, test_block)

        if validation_result['success']:
            print(f"✅ 验证成功，奖励: {validation_result['reward']:.2f}")
        else:
            print(f"❌ 验证失败，惩罚: {validation_result.get('penalty', 0):.2f}")

# 显示验证者状态
print(f"\n验证者最终状态:")
for validator_id in pos_network.validators:
    info = pos_network.get_validator_info(validator_id)
    print(f"{validator_id}:")
    print(f"  权益: {info['stake']:.2f}")
    print(f"  已验证区块: {info['blocks_validated']}")
    print(f"  获得奖励: {info['rewards_earned']:.2f}")

# 网络统计
stats = pos_network.get_network_stats()
print(f"\n网络统计:")
print(f"验证者总数: {stats['total_validators']}")
print(f"活跃验证者: {stats['active_validators']}")
print(f"总权益: {stats['total_stake']:.2f}")
print(f"已验证区块总数: {stats['total_blocks_validated']}")
```

## 10.3 挖矿硬件与优化

### 10.3.1 挖矿硬件比较

```python
class MiningHardware:
    def __init__(self):
        self.hardware_specs = {}

    def add_hardware(self, name, specifications):
        """添加挖矿硬件规格"""
        self.hardware_specs[name] = specifications

    def calculate_profitability(self, hardware_name, coin_price, difficulty, power_cost_kwh):
        """计算挖矿收益率"""
        if hardware_name not in self.hardware_specs:
            return None

        specs = self.hardware_specs[hardware_name]
        hash_rate = specs['hash_rate']  # TH/s
        power_consumption = specs['power_consumption']  # W
        hardware_cost = specs['cost']  # USD

        # 计算每日收益（简化模型）
        network_hash_rate = difficulty * 7.2e12  # 简化的难度转换
        block_reward = 6.25  # BTC
        blocks_per_day = 144  # 每10分钟一个区块

        # 预期每日挖到的比特币
        daily_btc = (hash_rate * 1e12 / network_hash_rate) * block_reward * blocks_per_day

        # 收入和成本
        daily_revenue = daily_btc * coin_price  # USD
        daily_power_cost = (power_consumption / 1000) * 24 * power_cost_kwh  # USD
        daily_profit = daily_revenue - daily_power_cost

        # 回本时间
        roi_days = hardware_cost / daily_profit if daily_profit > 0 else float('inf')

        return {
            'hardware': hardware_name,
            'daily_btc': daily_btc,
            'daily_revenue': daily_revenue,
            'daily_power_cost': daily_power_cost,
            'daily_profit': daily_profit,
            'roi_days': roi_days,
            'roi_months': roi_days / 30,
            'annual_profit': daily_profit * 365,
            'efficiency': hash_rate / (power_consumption / 1000)  # TH/s per kW
        }

    def compare_hardware(self, coin_price, difficulty, power_cost_kwh):
        """比较所有硬件的收益率"""
        comparison = []

        for hardware_name in self.hardware_specs:
            profitability = self.calculate_profitability(
                hardware_name, coin_price, difficulty, power_cost_kwh
            )
            if profitability:
                comparison.append(profitability)

        # 按日收益排序
        comparison.sort(key=lambda x: x['daily_profit'], reverse=True)
        return comparison

    def optimize_mining_setup(self, budget, power_limit_kw, coin_price, difficulty, power_cost_kwh):
        """优化挖矿设置"""
        best_combinations = []

        for hardware_name, specs in self.hardware_specs.items():
            max_units = min(
                int(budget / specs['cost']),  # 预算限制
                int(power_limit_kw * 1000 / specs['power_consumption'])  # 功耗限制
            )

            if max_units > 0:
                total_cost = max_units * specs['cost']
                total_power = max_units * specs['power_consumption'] / 1000  # kW
                total_hash_rate = max_units * specs['hash_rate']

                # 计算总体收益
                profitability = self.calculate_profitability(
                    hardware_name, coin_price, difficulty, power_cost_kwh
                )

                if profitability and profitability['daily_profit'] > 0:
                    total_daily_profit = profitability['daily_profit'] * max_units

                    combination = {
                        'hardware': hardware_name,
                        'units': max_units,
                        'total_cost': total_cost,
                        'total_power_kw': total_power,
                        'total_hash_rate_th': total_hash_rate,
                        'daily_profit': total_daily_profit,
                        'roi_days': total_cost / total_daily_profit,
                        'efficiency': profitability['efficiency']
                    }

                    best_combinations.append(combination)

        # 按ROI排序
        best_combinations.sort(key=lambda x: x['roi_days'])
        return best_combinations

# 挖矿硬件数据库
mining_hardware = MiningHardware()

# 添加主要ASIC矿机规格
hardware_data = {
    'Antminer S19 Pro': {
        'hash_rate': 110,  # TH/s
        'power_consumption': 3250,  # W
        'cost': 2500,  # USD
        'manufacturer': 'Bitmain',
        'release_date': '2020'
    },
    'Whatsminer M30S++': {
        'hash_rate': 112,  # TH/s
        'power_consumption': 3472,  # W
        'cost': 2800,  # USD
        'manufacturer': 'MicroBT',
        'release_date': '2020'
    },
    'Antminer S19j Pro': {
        'hash_rate': 100,  # TH/s
        'power_consumption': 3050,  # W
        'cost': 2200,  # USD
        'manufacturer': 'Bitmain',
        'release_date': '2021'
    },
    'AvalonMiner 1246': {
        'hash_rate': 90,  # TH/s
        'power_consumption': 3420,  # W
        'cost': 2000,  # USD
        'manufacturer': 'Canaan',
        'release_date': '2020'
    },
    'Antminer S17+': {
        'hash_rate': 73,  # TH/s
        'power_consumption': 2920,  # W
        'cost': 1800,  # USD
        'manufacturer': 'Bitmain',
        'release_date': '2019'
    }
}

for name, specs in hardware_data.items():
    mining_hardware.add_hardware(name, specs)

# 设置挖矿参数
bitcoin_price = 45000  # USD
current_difficulty = 50e12  # 简化的难度值
electricity_cost = 0.06  # USD per kWh

print("挖矿硬件收益率比较")
print("=" * 60)
print(f"比特币价格: ${bitcoin_price:,}")
print(f"电费: ${electricity_cost}/kWh")
print()

# 比较所有硬件
comparison = mining_hardware.compare_hardware(
    bitcoin_price, current_difficulty, electricity_cost
)

print(f"{'硬件':<20} {'日收益':<10} {'ROI(月)':<10} {'效率':<12} {'年收益':<10}")
print("-" * 70)

for item in comparison:
    if item['roi_days'] < 1000:  # 只显示合理的ROI
        print(f"{item['hardware']:<20} "
              f"${item['daily_profit']:<9.2f} "
              f"{item['roi_months']:<9.1f} "
              f"{item['efficiency']:<11.1f} "
              f"${item['annual_profit']:<9.0f}")

# 优化挖矿设置
print(f"\n\n挖矿设置优化")
print("=" * 50)

budget = 50000  # $50K预算
power_limit = 20  # 20kW功耗限制

optimized_setups = mining_hardware.optimize_mining_setup(
    budget, power_limit, bitcoin_price, current_difficulty, electricity_cost
)

print(f"预算: ${budget:,}")
print(f"功耗限制: {power_limit}kW")
print()

if optimized_setups:
    best_setup = optimized_setups[0]
    print(f"推荐配置:")
    print(f"硬件: {best_setup['hardware']}")
    print(f"数量: {best_setup['units']} 台")
    print(f"总成本: ${best_setup['total_cost']:,}")
    print(f"总功耗: {best_setup['total_power_kw']:.1f} kW")
    print(f"总算力: {best_setup['total_hash_rate_th']:.0f} TH/s")
    print(f"日收益: ${best_setup['daily_profit']:.2f}")
    print(f"回本时间: {best_setup['roi_days']:.0f} 天 ({best_setup['roi_days']/30:.1f} 月)")

    print(f"\n所有可行方案:")
    for i, setup in enumerate(optimized_setups[:3]):  # 显示前3个方案
        print(f"{i+1}. {setup['hardware']}: {setup['units']}台, "
              f"ROI {setup['roi_days']:.0f}天, 日收益${setup['daily_profit']:.2f}")
```

### 10.3.2 挖矿池原理与实现

```python
import json
from collections import defaultdict

class MiningPool:
    def __init__(self, pool_name, fee_rate=0.025):
        self.pool_name = pool_name
        self.fee_rate = fee_rate  # 矿池费率
        self.miners = {}
        self.shares_submitted = defaultdict(int)
        self.blocks_found = []
        self.reward_distribution_history = []
        self.current_round_shares = defaultdict(int)

    def register_miner(self, miner_id, hash_rate):
        """注册矿工"""
        self.miners[miner_id] = {
            'hash_rate': hash_rate,  # TH/s
            'joined_time': datetime.now(),
            'shares_submitted': 0,
            'rewards_earned': 0,
            'last_activity': datetime.now()
        }
        print(f"矿工 {miner_id} 加入矿池，算力: {hash_rate} TH/s")

    def submit_share(self, miner_id, share_difficulty):
        """提交工作量证明份额"""
        if miner_id not in self.miners:
            return {'success': False, 'error': 'Miner not registered'}

        # 验证份额（简化）
        if self._validate_share(share_difficulty):
            self.shares_submitted[miner_id] += 1
            self.current_round_shares[miner_id] += 1
            self.miners[miner_id]['shares_submitted'] += 1
            self.miners[miner_id]['last_activity'] = datetime.now()

            return {
                'success': True,
                'shares_accepted': self.shares_submitted[miner_id],
                'round_shares': self.current_round_shares[miner_id]
            }
        else:
            return {'success': False, 'error': 'Invalid share'}

    def _validate_share(self, share_difficulty):
        """验证份额有效性"""
        # 简化的验证逻辑
        return random.random() > 0.1  # 90%的份额有效

    def find_block(self, finder_miner_id, block_reward=6.25):
        """发现区块"""
        block_info = {
            'block_height': len(self.blocks_found) + 1,
            'finder': finder_miner_id,
            'timestamp': datetime.now(),
            'reward': block_reward,
            'total_shares': sum(self.current_round_shares.values()),
            'shares_distribution': dict(self.current_round_shares)
        }

        self.blocks_found.append(block_info)
        print(f"🎉 区块 #{block_info['block_height']} 被发现！发现者: {finder_miner_id}")

        # 分发奖励
        self._distribute_rewards(block_info)

        # 重置当前轮次份额
        self.current_round_shares.clear()

        return block_info

    def _distribute_rewards(self, block_info):
        """分发区块奖励"""
        total_reward = block_info['reward']
        pool_fee = total_reward * self.fee_rate
        miners_reward = total_reward - pool_fee

        distribution = {
            'block_height': block_info['block_height'],
            'total_reward': total_reward,
            'pool_fee': pool_fee,
            'miners_reward': miners_reward,
            'distribution_method': 'PPS',  # Pay Per Share
            'miner_rewards': {}
        }

        total_shares = block_info['total_shares']
        if total_shares > 0:
            for miner_id, shares in block_info['shares_distribution'].items():
                miner_reward = (shares / total_shares) * miners_reward
                distribution['miner_rewards'][miner_id] = miner_reward

                # 更新矿工累计奖励
                if miner_id in self.miners:
                    self.miners[miner_id]['rewards_earned'] += miner_reward

        self.reward_distribution_history.append(distribution)

        print(f"奖励分发:")
        print(f"  总奖励: {total_reward:.4f} BTC")
        print(f"  矿池费用: {pool_fee:.4f} BTC ({self.fee_rate:.1%})")
        print(f"  矿工奖励: {miners_reward:.4f} BTC")
        print(f"  参与矿工: {len(distribution['miner_rewards'])}")

        return distribution

    def calculate_estimated_earnings(self, miner_id, time_period_hours=24):
        """计算预估收益"""
        if miner_id not in self.miners:
            return None

        miner = self.miners[miner_id]
        miner_hash_rate = miner['hash_rate']

        # 计算矿池总算力
        total_pool_hash_rate = sum(m['hash_rate'] for m in self.miners.values())

        if total_pool_hash_rate == 0:
            return None

        # 矿工在矿池中的份额
        pool_share = miner_hash_rate / total_pool_hash_rate

        # 估算矿池在网络中的份额（简化）
        estimated_network_hash_rate = 150e6  # 150 EH/s
        pool_network_share = total_pool_hash_rate * 1e12 / (estimated_network_hash_rate * 1e18)

        # 估算每日区块数和收益
        blocks_per_day = 144  # 比特币每日区块数
        estimated_pool_blocks = blocks_per_day * pool_network_share
        estimated_daily_reward = estimated_pool_blocks * 6.25 * (1 - self.fee_rate)

        miner_estimated_daily = estimated_daily_reward * pool_share
        miner_estimated_period = miner_estimated_daily * (time_period_hours / 24)

        return {
            'miner_id': miner_id,
            'time_period_hours': time_period_hours,
            'pool_share': pool_share,
            'estimated_daily_btc': miner_estimated_daily,
            'estimated_period_btc': miner_estimated_period,
            'pool_hash_rate': total_pool_hash_rate,
            'miner_hash_rate': miner_hash_rate
        }

    def get_pool_stats(self):
        """获取矿池统计"""
        total_hash_rate = sum(m['hash_rate'] for m in self.miners.values())
        total_shares = sum(self.shares_submitted.values())
        active_miners = len([m for m in self.miners.values()
                           if (datetime.now() - m['last_activity']).total_seconds() < 3600])

        return {
            'pool_name': self.pool_name,
            'total_miners': len(self.miners),
            'active_miners': active_miners,
            'total_hash_rate': total_hash_rate,
            'total_shares_submitted': total_shares,
            'blocks_found': len(self.blocks_found),
            'pool_fee_rate': self.fee_rate
        }

    def get_miner_stats(self, miner_id):
        """获取矿工统计"""
        if miner_id not in self.miners:
            return None

        miner = self.miners[miner_id]
        return {
            'miner_id': miner_id,
            'hash_rate': miner['hash_rate'],
            'shares_submitted': miner['shares_submitted'],
            'rewards_earned': miner['rewards_earned'],
            'joined_time': miner['joined_time'],
            'last_activity': miner['last_activity']
        }

# 矿池演示
print("比特币矿池演示")
print("=" * 40)

# 创建矿池
btc_pool = MiningPool("BitcoinPool", fee_rate=0.02)

# 注册矿工
miners_data = [
    ('Miner_001', 100),   # 100 TH/s
    ('Miner_002', 150),   # 150 TH/s
    ('Miner_003', 80),    # 80 TH/s
    ('Miner_004', 200),   # 200 TH/s
    ('Miner_005', 120)    # 120 TH/s
]

for miner_id, hash_rate in miners_data:
    btc_pool.register_miner(miner_id, hash_rate)

# 模拟挖矿过程
print(f"\n模拟挖矿过程:")
print("-" * 30)

# 模拟份额提交
for round_num in range(1, 4):
    print(f"\n挖矿轮次 {round_num}:")

    # 每个矿工提交一些份额
    for miner_id, hash_rate in miners_data:
        # 根据算力提交不同数量的份额
        shares_to_submit = int(hash_rate / 10) + random.randint(1, 5)

        for _ in range(shares_to_submit):
            result = btc_pool.submit_share(miner_id, 1.0)

    # 随机选择一个矿工发现区块
    finder = random.choice([m[0] for m in miners_data])
    block = btc_pool.find_block(finder)

# 显示矿池统计
pool_stats = btc_pool.get_pool_stats()
print(f"\n矿池统计:")
print(f"矿池名称: {pool_stats['pool_name']}")
print(f"总矿工数: {pool_stats['total_miners']}")
print(f"活跃矿工: {pool_stats['active_miners']}")
print(f"总算力: {pool_stats['total_hash_rate']:.0f} TH/s")
print(f"已发现区块: {pool_stats['blocks_found']}")
print(f"矿池费率: {pool_stats['pool_fee_rate']:.1%}")

# 显示矿工详细信息
print(f"\n矿工收益详情:")
print(f"{'矿工ID':<12} {'算力(TH/s)':<12} {'份额':<8} {'收益(BTC)':<12}")
print("-" * 50)

for miner_id, _ in miners_data:
    stats = btc_pool.get_miner_stats(miner_id)
    earnings = btc_pool.calculate_estimated_earnings(miner_id)

    if stats and earnings:
        print(f"{miner_id:<12} {stats['hash_rate']:<12.0f} "
              f"{stats['shares_submitted']:<8} {stats['rewards_earned']:<12.6f}")

# 显示预估收益
print(f"\n24小时预估收益:")
for miner_id, _ in miners_data[:3]:  # 显示前3个矿工
    earnings = btc_pool.calculate_estimated_earnings(miner_id, 24)
    if earnings:
        print(f"{miner_id}: {earnings['estimated_daily_btc']:.6f} BTC/天 "
              f"(矿池份额: {earnings['pool_share']:.2%})")
```

## 10.4 环保挖矿与可持续发展

### 10.4.1 能源消耗分析

```python
class MiningEnergyAnalyzer:
    def __init__(self):
        self.energy_sources = {}
        self.carbon_factors = {
            'coal': 0.820,      # kg CO2/kWh
            'natural_gas': 0.490,
            'oil': 0.778,
            'nuclear': 0.012,
            'hydro': 0.024,
            'wind': 0.011,
            'solar': 0.041,
            'geothermal': 0.038
        }

    def add_energy_source(self, source_name, energy_type, capacity_mw, cost_per_kwh):
        """添加能源来源"""
        self.energy_sources[source_name] = {
            'type': energy_type,
            'capacity_mw': capacity_mw,
            'cost_per_kwh': cost_per_kwh,
            'carbon_factor': self.carbon_factors.get(energy_type, 0.5)
        }

    def calculate_mining_footprint(self, mining_power_mw, energy_mix):
        """计算挖矿碳足迹"""
        total_carbon = 0
        total_cost = 0
        energy_breakdown = {}

        for source_name, percentage in energy_mix.items():
            if source_name in self.energy_sources:
                source = self.energy_sources[source_name]
                power_from_source = mining_power_mw * (percentage / 100)

                # 每日能耗 (MWh)
                daily_energy = power_from_source * 24

                # 碳排放 (kg CO2)
                daily_carbon = daily_energy * 1000 * source['carbon_factor']  # 转换为kWh

                # 能源成本 (USD)
                daily_cost = daily_energy * 1000 * source['cost_per_kwh']

                total_carbon += daily_carbon
                total_cost += daily_cost

                energy_breakdown[source_name] = {
                    'percentage': percentage,
                    'daily_energy_mwh': daily_energy,
                    'daily_carbon_kg': daily_carbon,
                    'daily_cost_usd': daily_cost,
                    'energy_type': source['type']
                }

        return {
            'total_power_mw': mining_power_mw,
            'daily_energy_mwh': mining_power_mw * 24,
            'daily_carbon_kg': total_carbon,
            'daily_cost_usd': total_cost,
            'annual_carbon_tons': total_carbon * 365 / 1000,
            'annual_cost_usd': total_cost * 365,
            'carbon_intensity_kg_per_mwh': total_carbon / (mining_power_mw * 24) if mining_power_mw > 0 else 0,
            'energy_breakdown': energy_breakdown
        }

    def compare_energy_scenarios(self, mining_power_mw, scenarios):
        """比较不同能源场景"""
        comparison = {}

        for scenario_name, energy_mix in scenarios.items():
            footprint = self.calculate_mining_footprint(mining_power_mw, energy_mix)
            comparison[scenario_name] = footprint

        return comparison

    def optimize_energy_mix(self, mining_power_mw, max_cost_per_day, max_carbon_per_day):
        """优化能源配比"""
        # 简化的优化算法
        best_mix = None
        best_score = 0

        # 尝试不同的能源组合
        renewable_sources = ['hydro', 'wind', 'solar', 'nuclear']
        fossil_sources = ['coal', 'natural_gas']

        for renewable_pct in range(0, 101, 10):
            fossil_pct = 100 - renewable_pct

            if fossil_pct > 0:
                # 分配化石燃料比例
                for coal_pct in range(0, fossil_pct + 1, 10):
                    gas_pct = fossil_pct - coal_pct

                    # 分配可再生能源比例
                    hydro_pct = renewable_pct * 0.4  # 水电占40%
                    wind_pct = renewable_pct * 0.3   # 风电占30%
                    solar_pct = renewable_pct * 0.2  # 太阳能占20%
                    nuclear_pct = renewable_pct * 0.1 # 核能占10%

                    energy_mix = {
                        'hydro': hydro_pct,
                        'wind': wind_pct,
                        'solar': solar_pct,
                        'nuclear': nuclear_pct,
                        'coal': coal_pct,
                        'natural_gas': gas_pct
                    }

                    # 只包含有能源来源的项目
                    energy_mix = {k: v for k, v in energy_mix.items()
                                if v > 0 and k in self.energy_sources}

                    if energy_mix:
                        footprint = self.calculate_mining_footprint(mining_power_mw, energy_mix)

                        # 检查约束条件
                        if (footprint['daily_cost_usd'] <= max_cost_per_day and
                            footprint['daily_carbon_kg'] <= max_carbon_per_day):

                            # 评分：低碳 + 低成本
                            score = (1 / (footprint['daily_carbon_kg'] + 1)) + \
                                   (1 / (footprint['daily_cost_usd'] + 1))

                            if score > best_score:
                                best_score = score
                                best_mix = {
                                    'energy_mix': energy_mix,
                                    'footprint': footprint,
                                    'score': score
                                }

        return best_mix

# 能源分析演示
print("挖矿能源消耗与碳足迹分析")
print("=" * 50)

analyzer = MiningEnergyAnalyzer()

# 添加能源来源
energy_sources_data = {
    'coal_plant': ('coal', 500, 0.03),
    'natural_gas_plant': ('natural_gas', 300, 0.05),
    'hydro_dam': ('hydro', 200, 0.02),
    'wind_farm': ('wind', 150, 0.03),
    'solar_farm': ('solar', 100, 0.04),
    'nuclear_plant': ('nuclear', 1000, 0.02),
    'geothermal_plant': ('geothermal', 50, 0.06)
}

for source_name, (energy_type, capacity, cost) in energy_sources_data.items():
    analyzer.add_energy_source(source_name, energy_type, capacity, cost)

# 定义不同的能源场景
scenarios = {
    '传统火电': {
        'coal_plant': 70,
        'natural_gas_plant': 30
    },
    '混合能源': {
        'coal_plant': 30,
        'natural_gas_plant': 20,
        'hydro_dam': 25,
        'wind_farm': 15,
        'solar_farm': 10
    },
    '绿色能源': {
        'hydro_dam': 40,
        'wind_farm': 30,
        'solar_farm': 20,
        'nuclear_plant': 10
    },
    '核能主导': {
        'nuclear_plant': 60,
        'hydro_dam': 20,
        'wind_farm': 15,
        'solar_farm': 5
    }
}

# 假设矿场功耗
mining_power = 50  # 50 MW

print(f"矿场功耗: {mining_power} MW")
print()

# 比较不同能源场景
comparison = analyzer.compare_energy_scenarios(mining_power, scenarios)

print(f"能源场景比较:")
print(f"{'场景':<12} {'日耗电':<10} {'日碳排放':<12} {'日成本':<10} {'年碳排放':<10}")
print(f"{'':12} {'(MWh)':<10} {'(kg CO2)':<12} {'(USD)':<10} {'(吨)':<10}")
print("-" * 65)

for scenario_name, footprint in comparison.items():
    print(f"{scenario_name:<12} "
          f"{footprint['daily_energy_mwh']:<10.0f} "
          f"{footprint['daily_carbon_kg']:<12.0f} "
          f"{footprint['daily_cost_usd']:<10.0f} "
          f"{footprint['annual_carbon_tons']:<10.0f}")

# 详细分析绿色能源场景
print(f"\n绿色能源场景详细分析:")
green_footprint = comparison['绿色能源']
print(f"碳排放强度: {green_footprint['carbon_intensity_kg_per_mwh']:.1f} kg CO2/MWh")
print(f"年度碳排放: {green_footprint['annual_carbon_tons']:.0f} 吨 CO2")
print(f"年度能源成本: ${green_footprint['annual_cost_usd']:,.0f}")

print(f"\n能源结构:")
for source, data in green_footprint['energy_breakdown'].items():
    print(f"  {source}: {data['percentage']:.0f}% "
          f"({data['daily_energy_mwh']:.1f} MWh/日, "
          f"{data['daily_carbon_kg']:.0f} kg CO2/日)")

# 优化能源配比
print(f"\n能源配比优化:")
max_daily_cost = 20000  # $20K/日
max_daily_carbon = 50000  # 50吨CO2/日

optimal_mix = analyzer.optimize_energy_mix(
    mining_power, max_daily_cost, max_daily_carbon
)

if optimal_mix:
    print(f"优化结果:")
    print(f"日成本: ${optimal_mix['footprint']['daily_cost_usd']:,.0f}")
    print(f"日碳排放: {optimal_mix['footprint']['daily_carbon_kg']:,.0f} kg")
    print(f"优化评分: {optimal_mix['score']:.3f}")

    print(f"推荐能源配比:")
    for source, percentage in optimal_mix['energy_mix'].items():
        source_type = analyzer.energy_sources[source]['type']
        print(f"  {source} ({source_type}): {percentage:.1f}%")
```

### 10.4.2 可持续挖矿解决方案

```python
class SustainableMining:
    def __init__(self):
        self.sustainability_metrics = {}
        self.green_technologies = {}
        self.carbon_offset_programs = {}

    def add_green_technology(self, tech_name, specifications):
        """添加绿色技术"""
        self.green_technologies[tech_name] = specifications

    def calculate_sustainability_score(self, mining_operation):
        """计算可持续性评分"""
        scores = {}

        # 能源评分 (40%)
        renewable_percentage = mining_operation.get('renewable_energy_pct', 0)
        energy_score = min(renewable_percentage / 100 * 100, 100)
        scores['energy'] = energy_score * 0.4

        # 效率评分 (25%)
        efficiency_j_per_th = mining_operation.get('efficiency_j_per_th', 50)
        max_efficiency = 20  # J/TH (最佳效率)
        efficiency_score = max(0, (max_efficiency / efficiency_j_per_th) * 100)
        scores['efficiency'] = min(efficiency_score, 100) * 0.25

        # 碳中和评分 (20%)
        carbon_neutral = mining_operation.get('carbon_neutral', False)
        carbon_offset_pct = mining_operation.get('carbon_offset_percentage', 0)
        if carbon_neutral:
            carbon_score = 100
        else:
            carbon_score = min(carbon_offset_pct, 100)
        scores['carbon'] = carbon_score * 0.2

        # 创新技术评分 (15%)
        green_tech_count = len(mining_operation.get('green_technologies', []))
        innovation_score = min(green_tech_count * 20, 100)
        scores['innovation'] = innovation_score * 0.15

        total_score = sum(scores.values())

        return {
            'total_score': total_score,
            'breakdown': scores,
            'grade': self._get_sustainability_grade(total_score)
        }

    def _get_sustainability_grade(self, score):
        """获取可持续性等级"""
        if score >= 90:
            return 'A+'
        elif score >= 80:
            return 'A'
        elif score >= 70:
            return 'B+'
        elif score >= 60:
            return 'B'
        elif score >= 50:
            return 'C'
        else:
            return 'D'

    def design_green_mining_facility(self, location, power_requirement_mw):
        """设计绿色挖矿设施"""
        # 基于地理位置推荐可再生能源
        renewable_recommendations = {
            'iceland': ['geothermal', 'hydro'],
            'texas': ['wind', 'solar'],
            'norway': ['hydro'],
            'canada': ['hydro', 'wind'],
            'china_sichuan': ['hydro'],
            'california': ['solar', 'wind'],
            'mongolia': ['wind'],
            'chile': ['solar']
        }

        recommended_sources = renewable_recommendations.get(location.lower(), ['solar', 'wind'])

        facility_design = {
            'location': location,
            'power_requirement_mw': power_requirement_mw,
            'renewable_sources': recommended_sources,
            'estimated_renewable_percentage': self._estimate_renewable_percentage(location),
            'green_technologies': self._recommend_green_technologies(power_requirement_mw),
            'sustainability_features': self._get_sustainability_features(location),
            'estimated_cost_premium': self._calculate_green_premium(power_requirement_mw)
        }

        return facility_design

    def _estimate_renewable_percentage(self, location):
        """估算可再生能源百分比"""
        renewable_potential = {
            'iceland': 95,
            'norway': 90,
            'canada': 80,
            'chile': 85,
            'china_sichuan': 85,
            'texas': 70,
            'california': 75,
            'mongolia': 60
        }
        return renewable_potential.get(location.lower(), 50)

    def _recommend_green_technologies(self, power_mw):
        """推荐绿色技术"""
        technologies = []

        if power_mw >= 10:
            technologies.extend([
                'immersion_cooling',
                'waste_heat_recovery',
                'smart_grid_integration'
            ])

        if power_mw >= 50:
            technologies.extend([
                'battery_storage',
                'carbon_capture',
                'ai_power_optimization'
            ])

        return technologies

    def _get_sustainability_features(self, location):
        """获取可持续性特性"""
        features = [
            'renewable_energy_sourcing',
            'energy_efficient_hardware',
            'carbon_footprint_monitoring',
            'environmental_impact_assessment'
        ]

        if location.lower() in ['iceland', 'norway', 'canada']:
            features.append('natural_cooling')
            features.append('cold_climate_optimization')

        return features

    def _calculate_green_premium(self, power_mw):
        """计算绿色升级成本"""
        base_cost_per_mw = 1000000  # $1M per MW base cost
        green_premium_percentage = 0.15  # 15% premium for green features

        return {
            'base_cost': base_cost_per_mw * power_mw,
            'green_premium_percentage': green_premium_percentage,
            'green_premium_cost': base_cost_per_mw * power_mw * green_premium_percentage,
            'total_cost': base_cost_per_mw * power_mw * (1 + green_premium_percentage)
        }

    def create_carbon_offset_plan(self, annual_carbon_tons):
        """创建碳抵消计划"""
        offset_projects = {
            'forest_restoration': {
                'cost_per_ton': 15,
                'verification': 'verified_carbon_standard',
                'co_benefits': ['biodiversity', 'water_protection'],
                'timeline': '20_years'
            },
            'renewable_energy': {
                'cost_per_ton': 25,
                'verification': 'gold_standard',
                'co_benefits': ['energy_access', 'job_creation'],
                'timeline': '10_years'
            },
            'direct_air_capture': {
                'cost_per_ton': 150,
                'verification': 'future_technology',
                'co_benefits': ['technology_advancement'],
                'timeline': 'permanent'
            },
            'methane_capture': {
                'cost_per_ton': 12,
                'verification': 'verified_carbon_standard',
                'co_benefits': ['air_quality', 'energy_recovery'],
                'timeline': '5_years'
            }
        }

        # 建议混合方案
        offset_plan = {
            'total_carbon_tons': annual_carbon_tons,
            'offset_portfolio': {
                'forest_restoration': 0.4,
                'renewable_energy': 0.3,
                'methane_capture': 0.2,
                'direct_air_capture': 0.1
            },
            'total_cost': 0,
            'projects': {}
        }

        for project_type, allocation in offset_plan['offset_portfolio'].items():
            tons_to_offset = annual_carbon_tons * allocation
            cost = tons_to_offset * offset_projects[project_type]['cost_per_ton']

            offset_plan['projects'][project_type] = {
                'tons': tons_to_offset,
                'cost': cost,
                'cost_per_ton': offset_projects[project_type]['cost_per_ton'],
                'details': offset_projects[project_type]
            }

            offset_plan['total_cost'] += cost

        return offset_plan

# 可持续挖矿演示
print("可持续挖矿解决方案")
print("=" * 40)

sustainable_mining = SustainableMining()

# 添加绿色技术
green_technologies = {
    'immersion_cooling': {
        'efficiency_improvement': 0.15,
        'cost_per_mw': 200000,
        'description': '浸没式液体冷却系统'
    },
    'waste_heat_recovery': {
        'efficiency_improvement': 0.10,
        'cost_per_mw': 150000,
        'description': '废热回收发电系统'
    },
    'solar_panels': {
        'renewable_capacity_mw': 0.8,
        'cost_per_mw': 800000,
        'description': '太阳能发电板'
    },
    'battery_storage': {
        'storage_capacity_mwh': 4,
        'cost_per_mw': 1000000,
        'description': '电池储能系统'
    }
}

for tech_name, specs in green_technologies.items():
    sustainable_mining.add_green_technology(tech_name, specs)

# 评估不同挖矿操作的可持续性
mining_operations = {
    '传统矿场': {
        'renewable_energy_pct': 10,
        'efficiency_j_per_th': 45,
        'carbon_neutral': False,
        'carbon_offset_percentage': 0,
        'green_technologies': []
    },
    '改进矿场': {
        'renewable_energy_pct': 50,
        'efficiency_j_per_th': 35,
        'carbon_neutral': False,
        'carbon_offset_percentage': 25,
        'green_technologies': ['immersion_cooling']
    },
    '绿色矿场': {
        'renewable_energy_pct': 85,
        'efficiency_j_per_th': 25,
        'carbon_neutral': False,
        'carbon_offset_percentage': 80,
        'green_technologies': ['immersion_cooling', 'waste_heat_recovery', 'solar_panels']
    },
    '碳中和矿场': {
        'renewable_energy_pct': 95,
        'efficiency_j_per_th': 20,
        'carbon_neutral': True,
        'carbon_offset_percentage': 100,
        'green_technologies': ['immersion_cooling', 'waste_heat_recovery', 'solar_panels', 'battery_storage']
    }
}

print("挖矿操作可持续性评估:")
print(f"{'操作类型':<12} {'总分':<8} {'等级':<6} {'能源':<8} {'效率':<8} {'碳中和':<8} {'创新':<8}")
print("-" * 70)

for operation_name, operation_data in mining_operations.items():
    score = sustainable_mining.calculate_sustainability_score(operation_data)
    print(f"{operation_name:<12} "
          f"{score['total_score']:<8.1f} "
          f"{score['grade']:<6} "
          f"{score['breakdown']['energy']:<8.1f} "
          f"{score['breakdown']['efficiency']:<8.1f} "
          f"{score['breakdown']['carbon']:<8.1f} "
          f"{score['breakdown']['innovation']:<8.1f}")

# 设计绿色挖矿设施
print(f"\n绿色挖矿设施设计方案:")
locations = ['iceland', 'texas', 'norway', 'chile']
power_requirement = 25  # 25 MW

for location in locations:
    design = sustainable_mining.design_green_mining_facility(location, power_requirement)

    print(f"\n{location.upper()} 方案:")
    print(f"  功耗需求: {design['power_requirement_mw']} MW")
    print(f"  推荐可再生能源: {', '.join(design['renewable_sources'])}")
    print(f"  预计可再生能源占比: {design['estimated_renewable_percentage']}%")
    print(f"  绿色技术: {', '.join(design['green_technologies'])}")
    print(f"  总投资: ${design['estimated_cost_premium']['total_cost']:,.0f}")
    print(f"  绿色升级溢价: {design['estimated_cost_premium']['green_premium_percentage']:.1%}")

# 碳抵消计划
print(f"\n碳抵消计划设计:")
annual_carbon = 10000  # 10,000吨CO2/年

offset_plan = sustainable_mining.create_carbon_offset_plan(annual_carbon)
print(f"年度碳排放: {offset_plan['total_carbon_tons']:,} 吨 CO2")
print(f"抵消总成本: ${offset_plan['total_cost']:,.0f}/年")
print(f"平均成本: ${offset_plan['total_cost']/annual_carbon:.0f}/吨 CO2")

print(f"\n抵消项目组合:")
for project_type, project_data in offset_plan['projects'].items():
    print(f"  {project_type}: {project_data['tons']:,.0f} 吨 "
          f"(${project_data['cost']:,.0f}, ${project_data['cost_per_ton']}/吨)")
```

## 10.5 课程总结

本章详细介绍了虚拟货币挖矿技术的各个方面：

### 关键要点
1. **挖矿原理**: 工作量证明是比特币安全性的基础
2. **共识机制**: PoW和PoS各有优劣，适用不同场景
3. **硬件演进**: ASIC矿机提供最佳效率和收益
4. **矿池模式**: 分散风险，稳定收益
5. **环保挑战**: 可持续发展是行业发展的重要方向

### 技术发展趋势
- 更高效的挖矿硬件
- 绿色能源的广泛应用
- 碳中和挖矿的实现
- 智能化矿场管理

### 投资建议
- 关注能源成本和政策环境
- 选择高效率的挖矿设备
- 考虑加入信誉良好的矿池
- 重视环保合规要求

挖矿技术的发展反映了整个加密货币生态系统的成熟。随着环保要求日益严格和技术不断进步，可持续挖矿将成为行业的核心竞争力。通过本章学习，你应该能够理解挖矿的技术原理、经济模型和发展方向。