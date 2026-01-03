---
title: 第7章：DeFi与智能合约应用
date: 2025-12-06
icon: circle-dot
author: Haiyue
category:
  - cryptocurrency
star: false
---

# 第7章：DeFi与智能合约应用

::: tip 学习目标
- 理解去中心化金融(DeFi)概念
- 了解流动性挖矿、质押等机制
- 学习智能合约的基本应用
- 认识NFT和其他创新应用
:::

## DeFi生态概述

去中心化金融(DeFi)是基于区块链的金融服务，通过智能合约实现传统金融功能的去中心化版本。

```python
import time
import math
from typing import Dict, List
from dataclasses import dataclass

@dataclass
class LiquidityPool:
    """流动性池"""
    token_a: str
    token_b: str
    reserve_a: float
    reserve_b: float
    total_shares: float
    fee_rate: float = 0.003  # 0.3%

    def get_price(self, token: str) -> float:
        """获取代币价格"""
        if token == self.token_a:
            return self.reserve_b / self.reserve_a
        elif token == self.token_b:
            return self.reserve_a / self.reserve_b
        return 0.0

    def add_liquidity(self, amount_a: float, amount_b: float) -> float:
        """添加流动性"""
        if self.total_shares == 0:
            # 首次添加流动性
            shares = math.sqrt(amount_a * amount_b)
        else:
            # 按比例添加流动性
            shares_a = amount_a * self.total_shares / self.reserve_a
            shares_b = amount_b * self.total_shares / self.reserve_b
            shares = min(shares_a, shares_b)

        self.reserve_a += amount_a
        self.reserve_b += amount_b
        self.total_shares += shares

        return shares

    def remove_liquidity(self, shares: float) -> tuple:
        """移除流动性"""
        if shares > self.total_shares:
            raise ValueError("份额不足")

        amount_a = shares * self.reserve_a / self.total_shares
        amount_b = shares * self.reserve_b / self.total_shares

        self.reserve_a -= amount_a
        self.reserve_b -= amount_b
        self.total_shares -= shares

        return amount_a, amount_b

    def swap(self, token_in: str, amount_in: float) -> float:
        """交换代币"""
        if token_in == self.token_a:
            reserve_in = self.reserve_a
            reserve_out = self.reserve_b
        elif token_in == self.token_b:
            reserve_in = self.reserve_b
            reserve_out = self.reserve_a
        else:
            raise ValueError("无效的输入代币")

        # AMM公式：x * y = k
        amount_in_with_fee = amount_in * (1 - self.fee_rate)
        amount_out = (amount_in_with_fee * reserve_out) / (reserve_in + amount_in_with_fee)

        # 更新储备量
        if token_in == self.token_a:
            self.reserve_a += amount_in
            self.reserve_b -= amount_out
        else:
            self.reserve_b += amount_in
            self.reserve_a -= amount_out

        return amount_out

class YieldFarming:
    """流动性挖矿"""

    def __init__(self, reward_token: str, reward_per_block: float):
        self.reward_token = reward_token
        self.reward_per_block = reward_per_block
        self.total_staked = 0.0
        self.last_reward_block = 0
        self.acc_reward_per_share = 0.0
        self.user_stakes: Dict[str, float] = {}
        self.user_debt: Dict[str, float] = {}

    def stake(self, user: str, amount: float):
        """质押LP代币"""
        self._update_pool()

        if user in self.user_stakes:
            # 计算待领取奖励
            pending = (self.user_stakes[user] * self.acc_reward_per_share / 1e12) - self.user_debt[user]
            if pending > 0:
                print(f"用户 {user} 获得奖励: {pending:.6f} {self.reward_token}")

        self.user_stakes[user] = self.user_stakes.get(user, 0) + amount
        self.total_staked += amount
        self.user_debt[user] = self.user_stakes[user] * self.acc_reward_per_share / 1e12

        print(f"用户 {user} 质押 {amount} LP代币")

    def unstake(self, user: str, amount: float):
        """取消质押"""
        if user not in self.user_stakes or self.user_stakes[user] < amount:
            raise ValueError("质押数量不足")

        self._update_pool()

        # 计算并发放奖励
        pending = (self.user_stakes[user] * self.acc_reward_per_share / 1e12) - self.user_debt[user]
        if pending > 0:
            print(f"用户 {user} 获得奖励: {pending:.6f} {self.reward_token}")

        self.user_stakes[user] -= amount
        self.total_staked -= amount
        self.user_debt[user] = self.user_stakes[user] * self.acc_reward_per_share / 1e12

        print(f"用户 {user} 取消质押 {amount} LP代币")

    def _update_pool(self):
        """更新奖励池"""
        current_block = int(time.time() // 10)  # 模拟区块号
        if current_block <= self.last_reward_block:
            return

        if self.total_staked > 0:
            blocks = current_block - self.last_reward_block
            reward = blocks * self.reward_per_block
            self.acc_reward_per_share += reward * 1e12 / self.total_staked

        self.last_reward_block = current_block

    def get_pending_reward(self, user: str) -> float:
        """查看待领取奖励"""
        if user not in self.user_stakes:
            return 0.0

        temp_acc = self.acc_reward_per_share
        current_block = int(time.time() // 10)

        if current_block > self.last_reward_block and self.total_staked > 0:
            blocks = current_block - self.last_reward_block
            reward = blocks * self.reward_per_block
            temp_acc += reward * 1e12 / self.total_staked

        return (self.user_stakes[user] * temp_acc / 1e12) - self.user_debt.get(user, 0)

# DeFi演示
print("=== DeFi生态演示 ===")

# 创建ETH/USDT流动性池
pool = LiquidityPool("ETH", "USDT", 0, 0, 0)

# 初始化流动性
initial_eth = 100
initial_usdt = 300000  # 1 ETH = 3000 USDT
shares = pool.add_liquidity(initial_eth, initial_usdt)

print(f"初始流动性池:")
print(f"ETH储备: {pool.reserve_a}")
print(f"USDT储备: {pool.reserve_b}")
print(f"ETH价格: ${pool.get_price('ETH'):,.2f}")
print(f"LP代币: {shares}")

# 交换操作
print(f"\n=== 代币交换 ===")
usdt_out = pool.swap("ETH", 1)
print(f"1 ETH换出: {usdt_out:.2f} USDT")
print(f"新的ETH价格: ${pool.get_price('ETH'):,.2f}")

eth_out = pool.swap("USDT", 3000)
print(f"3000 USDT换出: {eth_out:.6f} ETH")
print(f"新的ETH价格: ${pool.get_price('ETH'):,.2f}")

# 流动性挖矿
print(f"\n=== 流动性挖矿 ===")
farm = YieldFarming("FARM", 10.0)  # 每个区块奖励10个FARM代币

# 用户质押LP代币
farm.stake("alice", 50)
farm.stake("bob", 30)

time.sleep(1)  # 模拟时间推移

# 查看奖励
alice_reward = farm.get_pending_reward("alice")
bob_reward = farm.get_pending_reward("bob")

print(f"Alice待领取奖励: {alice_reward:.6f} FARM")
print(f"Bob待领取奖励: {bob_reward:.6f} FARM")

# 取消部分质押
farm.unstake("alice", 20)
```

## 借贷协议

```python
class LendingProtocol:
    """借贷协议"""

    def __init__(self):
        self.markets: Dict[str, Dict] = {}
        self.user_supplies: Dict[str, Dict[str, float]] = {}
        self.user_borrows: Dict[str, Dict[str, float]] = {}
        self.interest_rates: Dict[str, float] = {}

    def create_market(self, token: str, supply_rate: float, borrow_rate: float,
                     collateral_factor: float):
        """创建借贷市场"""
        self.markets[token] = {
            "total_supply": 0.0,
            "total_borrow": 0.0,
            "supply_rate": supply_rate,
            "borrow_rate": borrow_rate,
            "collateral_factor": collateral_factor,  # 抵押系数
            "price": 1.0  # USD价格
        }

    def supply(self, user: str, token: str, amount: float):
        """存入资产"""
        if token not in self.markets:
            raise ValueError("市场不存在")

        if user not in self.user_supplies:
            self.user_supplies[user] = {}

        self.user_supplies[user][token] = self.user_supplies[user].get(token, 0) + amount
        self.markets[token]["total_supply"] += amount

        print(f"{user} 存入 {amount} {token}")

    def borrow(self, user: str, token: str, amount: float):
        """借出资产"""
        if token not in self.markets:
            raise ValueError("市场不存在")

        # 检查借贷能力
        borrow_limit = self.get_borrow_limit(user)
        current_borrows = self.get_total_borrows(user)

        if current_borrows + amount > borrow_limit:
            raise ValueError("超过借贷限制")

        if user not in self.user_borrows:
            self.user_borrows[user] = {}

        self.user_borrows[user][token] = self.user_borrows[user].get(token, 0) + amount
        self.markets[token]["total_borrow"] += amount

        print(f"{user} 借出 {amount} {token}")

    def repay(self, user: str, token: str, amount: float):
        """还款"""
        if user not in self.user_borrows or token not in self.user_borrows[user]:
            raise ValueError("无借款记录")

        current_borrow = self.user_borrows[user][token]
        repay_amount = min(amount, current_borrow)

        self.user_borrows[user][token] -= repay_amount
        self.markets[token]["total_borrow"] -= repay_amount

        print(f"{user} 还款 {repay_amount} {token}")

    def get_borrow_limit(self, user: str) -> float:
        """计算借贷限制"""
        total_collateral_value = 0.0

        if user in self.user_supplies:
            for token, amount in self.user_supplies[user].items():
                if token in self.markets:
                    token_value = amount * self.markets[token]["price"]
                    collateral_value = token_value * self.markets[token]["collateral_factor"]
                    total_collateral_value += collateral_value

        return total_collateral_value

    def get_total_borrows(self, user: str) -> float:
        """计算总借款价值"""
        total_borrow_value = 0.0

        if user in self.user_borrows:
            for token, amount in self.user_borrows[user].items():
                if token in self.markets:
                    token_value = amount * self.markets[token]["price"]
                    total_borrow_value += token_value

        return total_borrow_value

    def liquidate(self, borrower: str, liquidator: str, token: str, amount: float):
        """清算"""
        # 检查是否需要清算
        borrow_limit = self.get_borrow_limit(borrower)
        total_borrows = self.get_total_borrows(borrower)

        if total_borrows <= borrow_limit:
            raise ValueError("账户健康，无需清算")

        # 执行清算逻辑
        liquidation_bonus = 0.05  # 5%清算奖励
        collateral_value = amount * (1 + liquidation_bonus)

        print(f"清算执行: {liquidator} 清算 {borrower} 的 {amount} {token}")
        print(f"清算奖励: {liquidation_bonus:.1%}")

# 借贷协议演示
print(f"\n=== 借贷协议演示 ===")

lending = LendingProtocol()

# 创建市场
lending.create_market("ETH", 0.02, 0.05, 0.75)  # 75%抵押率
lending.create_market("USDT", 0.01, 0.03, 0.9)   # 90%抵押率

# 设置价格
lending.markets["ETH"]["price"] = 3000
lending.markets["USDT"]["price"] = 1

# Alice存入ETH作为抵押
lending.supply("alice", "ETH", 2.0)

# 计算Alice的借贷能力
alice_limit = lending.get_borrow_limit("alice")
print(f"Alice借贷限制: ${alice_limit:,.2f}")

# Alice借出USDT
try:
    lending.borrow("alice", "USDT", 4000)
    print("借贷成功")
except ValueError as e:
    print(f"借贷失败: {e}")

# Alice借出较少的USDT
lending.borrow("alice", "USDT", 3000)

# 查看Alice的账户状态
alice_borrows = lending.get_total_borrows("alice")
print(f"Alice总借款价值: ${alice_borrows:,.2f}")
print(f"健康度: {(alice_limit / alice_borrows):.2f}")
```

## NFT生态系统

```python
import json
from typing import Optional

class NFTContract:
    """NFT合约"""

    def __init__(self, name: str, symbol: str):
        self.name = name
        self.symbol = symbol
        self.tokens: Dict[int, Dict] = {}
        self.owners: Dict[int, str] = {}
        self.approvals: Dict[int, str] = {}
        self.total_supply = 0

    def mint(self, to: str, token_id: int, metadata: Dict) -> bool:
        """铸造NFT"""
        if token_id in self.tokens:
            raise ValueError("Token ID已存在")

        self.tokens[token_id] = {
            "metadata": metadata,
            "minted_at": time.time(),
            "creator": to
        }
        self.owners[token_id] = to
        self.total_supply += 1

        print(f"NFT #{token_id} 铸造给 {to}")
        return True

    def transfer(self, from_addr: str, to: str, token_id: int) -> bool:
        """转移NFT"""
        if token_id not in self.owners:
            raise ValueError("Token不存在")

        if self.owners[token_id] != from_addr:
            raise ValueError("无权转移")

        self.owners[token_id] = to
        # 清除授权
        self.approvals.pop(token_id, None)

        print(f"NFT #{token_id} 从 {from_addr} 转移到 {to}")
        return True

    def approve(self, owner: str, spender: str, token_id: int):
        """授权NFT"""
        if self.owners[token_id] != owner:
            raise ValueError("只有所有者可以授权")

        self.approvals[token_id] = spender
        print(f"NFT #{token_id} 已授权给 {spender}")

    def get_metadata(self, token_id: int) -> Optional[Dict]:
        """获取元数据"""
        return self.tokens.get(token_id, {}).get("metadata")

    def owner_of(self, token_id: int) -> str:
        """获取所有者"""
        return self.owners.get(token_id, "")

class NFTMarketplace:
    """NFT市场"""

    def __init__(self):
        self.listings: Dict[str, Dict] = {}  # key: contract_token
        self.offers: Dict[str, List[Dict]] = {}
        self.sales_history: List[Dict] = []

    def list_nft(self, contract: NFTContract, token_id: int,
                seller: str, price: float, currency: str = "ETH"):
        """上架NFT"""
        if contract.owner_of(token_id) != seller:
            raise ValueError("只有所有者可以上架")

        listing_key = f"{contract.name}_{token_id}"
        self.listings[listing_key] = {
            "contract": contract,
            "token_id": token_id,
            "seller": seller,
            "price": price,
            "currency": currency,
            "listed_at": time.time(),
            "active": True
        }

        print(f"NFT #{token_id} 已上架，价格: {price} {currency}")

    def buy_nft(self, contract_name: str, token_id: int, buyer: str) -> bool:
        """购买NFT"""
        listing_key = f"{contract_name}_{token_id}"

        if listing_key not in self.listings:
            raise ValueError("NFT未上架")

        listing = self.listings[listing_key]

        if not listing["active"]:
            raise ValueError("NFT已下架")

        # 执行转移
        contract = listing["contract"]
        seller = listing["seller"]
        price = listing["price"]

        contract.transfer(seller, buyer, token_id)

        # 记录销售
        sale = {
            "contract_name": contract_name,
            "token_id": token_id,
            "seller": seller,
            "buyer": buyer,
            "price": price,
            "currency": listing["currency"],
            "timestamp": time.time()
        }

        self.sales_history.append(sale)
        listing["active"] = False

        print(f"NFT #{token_id} 售出: {seller} -> {buyer}, 价格: {price} {listing['currency']}")
        return True

    def make_offer(self, contract_name: str, token_id: int,
                  bidder: str, amount: float, currency: str = "ETH"):
        """出价"""
        offer_key = f"{contract_name}_{token_id}"

        if offer_key not in self.offers:
            self.offers[offer_key] = []

        offer = {
            "bidder": bidder,
            "amount": amount,
            "currency": currency,
            "timestamp": time.time(),
            "active": True
        }

        self.offers[offer_key].append(offer)
        print(f"出价: {bidder} 对 NFT #{token_id} 出价 {amount} {currency}")

    def get_floor_price(self, contract_name: str) -> float:
        """获取地板价"""
        prices = []

        for listing_key, listing in self.listings.items():
            if (listing["active"] and
                listing_key.startswith(contract_name) and
                listing["currency"] == "ETH"):
                prices.append(listing["price"])

        return min(prices) if prices else 0.0

    def get_collection_stats(self, contract_name: str) -> Dict:
        """获取集合统计"""
        # 统计销售历史
        sales = [s for s in self.sales_history
                if s["contract_name"] == contract_name and s["currency"] == "ETH"]

        if not sales:
            return {"floor_price": 0, "volume": 0, "sales": 0}

        total_volume = sum(s["price"] for s in sales)
        avg_price = total_volume / len(sales)
        floor_price = self.get_floor_price(contract_name)

        return {
            "floor_price": floor_price,
            "volume": total_volume,
            "average_price": avg_price,
            "sales_count": len(sales),
            "unique_holders": len(set(s["buyer"] for s in sales))
        }

# NFT演示
print(f"\n=== NFT生态演示 ===")

# 创建NFT集合
crypto_art = NFTContract("CryptoArt", "CA")
marketplace = NFTMarketplace()

# 艺术家铸造NFT
artists = ["artist1", "artist2", "artist3"]
artworks = [
    {"name": "Digital Dreams #1", "description": "Abstract digital art", "rarity": "Rare"},
    {"name": "Cyber Punk #42", "description": "Futuristic cityscape", "rarity": "Epic"},
    {"name": "Nature's Code", "description": "Generative nature art", "rarity": "Common"}
]

for i, (artist, metadata) in enumerate(zip(artists, artworks)):
    crypto_art.mint(artist, i+1, metadata)

# 上架NFT
marketplace.list_nft(crypto_art, 1, "artist1", 2.5, "ETH")
marketplace.list_nft(crypto_art, 2, "artist2", 5.0, "ETH")
marketplace.list_nft(crypto_art, 3, "artist3", 1.2, "ETH")

# 买家出价
marketplace.make_offer("CryptoArt", 1, "collector1", 2.0, "ETH")
marketplace.make_offer("CryptoArt", 1, "collector2", 2.3, "ETH")

# 购买NFT
marketplace.buy_nft("CryptoArt", 3, "collector1")
marketplace.buy_nft("CryptoArt", 1, "collector2")

# 查看集合统计
stats = marketplace.get_collection_stats("CryptoArt")
print(f"\nCryptoArt集合统计:")
print(f"地板价: {stats['floor_price']:.2f} ETH")
print(f"总交易量: {stats['volume']:.2f} ETH")
print(f"平均价格: {stats['average_price']:.2f} ETH")
print(f"销售数量: {stats['sales_count']}")
```

## 跨链桥接

```python
class CrossChainBridge:
    """跨链桥"""

    def __init__(self):
        self.chains = {
            "ethereum": {"native_token": "ETH", "bridge_fee": 0.01},
            "bsc": {"native_token": "BNB", "bridge_fee": 0.001},
            "polygon": {"native_token": "MATIC", "bridge_fee": 0.0001}
        }
        self.locked_tokens: Dict[str, Dict] = {}
        self.bridge_transactions = []

    def lock_and_mint(self, from_chain: str, to_chain: str, token: str,
                     amount: float, user: str) -> str:
        """锁定并铸造"""
        if from_chain not in self.chains or to_chain not in self.chains:
            raise ValueError("不支持的链")

        bridge_fee = self.chains[from_chain]["bridge_fee"]

        # 在源链锁定代币
        lock_key = f"{from_chain}_{token}"
        if lock_key not in self.locked_tokens:
            self.locked_tokens[lock_key] = 0.0

        self.locked_tokens[lock_key] += amount

        # 生成跨链交易
        tx_id = f"bridge_{len(self.bridge_transactions)}"
        bridge_tx = {
            "tx_id": tx_id,
            "from_chain": from_chain,
            "to_chain": to_chain,
            "token": token,
            "amount": amount,
            "user": user,
            "fee": bridge_fee,
            "status": "pending",
            "timestamp": time.time()
        }

        self.bridge_transactions.append(bridge_tx)

        print(f"跨链桥接: {amount} {token} 从 {from_chain} 到 {to_chain}")
        print(f"桥接费: {bridge_fee} {self.chains[from_chain]['native_token']}")
        print(f"交易ID: {tx_id}")

        # 模拟确认过程
        time.sleep(0.1)
        bridge_tx["status"] = "confirmed"

        return tx_id

    def burn_and_unlock(self, tx_id: str) -> bool:
        """销毁并解锁"""
        # 查找交易
        bridge_tx = None
        for tx in self.bridge_transactions:
            if tx["tx_id"] == tx_id:
                bridge_tx = tx
                break

        if not bridge_tx or bridge_tx["status"] != "confirmed":
            raise ValueError("无效的桥接交易")

        # 在目标链销毁代币，在源链解锁
        from_chain = bridge_tx["from_chain"]
        token = bridge_tx["token"]
        amount = bridge_tx["amount"]

        lock_key = f"{from_chain}_{token}"
        if lock_key in self.locked_tokens:
            self.locked_tokens[lock_key] -= amount

        bridge_tx["status"] = "completed"
        print(f"跨链解锁完成: {tx_id}")

        return True

    def get_bridge_stats(self) -> Dict:
        """获取桥接统计"""
        total_volume = {}
        total_fees = {}

        for tx in self.bridge_transactions:
            token = tx["token"]
            amount = tx["amount"]
            fee = tx["fee"]

            total_volume[token] = total_volume.get(token, 0) + amount
            total_fees[token] = total_fees.get(token, 0) + fee

        return {
            "total_transactions": len(self.bridge_transactions),
            "total_volume": total_volume,
            "total_fees": total_fees,
            "locked_tokens": self.locked_tokens
        }

# 跨链桥演示
print(f"\n=== 跨链桥接演示 ===")

bridge = CrossChainBridge()

# 跨链转移USDT
tx1 = bridge.lock_and_mint("ethereum", "bsc", "USDT", 1000, "user1")
tx2 = bridge.lock_and_mint("bsc", "polygon", "USDT", 500, "user2")

# 查看桥接统计
stats = bridge.get_bridge_stats()
print(f"\n桥接统计:")
print(f"总交易数: {stats['total_transactions']}")
print(f"总交易量: {stats['total_volume']}")
print(f"锁定代币: {stats['locked_tokens']}")

# 解锁操作
bridge.burn_and_unlock(tx1)
```

## 本章小结

本章深入学习了DeFi和智能合约的应用：

1. **DeFi核心机制**：
   - 自动化做市商(AMM)
   - 流动性挖矿奖励
   - 去中心化交换协议

2. **借贷协议**：
   - 抵押借贷机制
   - 利率计算模型
   - 清算保护机制

3. **NFT生态**：
   - NFT铸造和转移
   - 去中心化市场
   - 收藏品统计分析

4. **跨链技术**：
   - 锁定铸造机制
   - 桥接协议设计
   - 多链资产管理

这些创新应用展示了区块链技术在金融领域的巨大潜力，为传统金融服务提供了去中心化的替代方案。