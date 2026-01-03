---
title: 第6章：虚拟货币交易基础
date: 2025-12-06
icon: circle-dot
author: Haiyue
category:
  - cryptocurrency
star: false
---

# 第6章：虚拟货币交易基础

::: tip 学习目标
- 了解虚拟货币交易所的运作机制
- 掌握基本的交易操作流程
- 理解订单类型和交易费用
- 学习K线图和基础技术分析
:::

## 交易所运作机制

### 中心化交易所(CEX)

```python
import time
import uuid
from typing import Dict, List, Optional
from enum import Enum
from dataclasses import dataclass
import heapq

class OrderType(Enum):
    MARKET = "market"    # 市价单
    LIMIT = "limit"      # 限价单
    STOP = "stop"        # 止损单
    STOP_LIMIT = "stop_limit"  # 止损限价单

class OrderSide(Enum):
    BUY = "buy"
    SELL = "sell"

class OrderStatus(Enum):
    PENDING = "pending"
    PARTIAL = "partial"
    FILLED = "filled"
    CANCELLED = "cancelled"

@dataclass
class Order:
    """订单数据结构"""
    order_id: str
    user_id: str
    symbol: str
    side: OrderSide
    order_type: OrderType
    amount: float
    price: float
    filled_amount: float = 0.0
    status: OrderStatus = OrderStatus.PENDING
    timestamp: float = None

    def __post_init__(self):
        if self.timestamp is None:
            self.timestamp = time.time()

class MatchingEngine:
    """订单匹配引擎"""

    def __init__(self, symbol: str):
        self.symbol = symbol
        # 使用堆来维护订单簿
        self.buy_orders = []   # 最大堆（价格高的优先）
        self.sell_orders = []  # 最小堆（价格低的优先）
        self.trades = []
        self.last_price = 0.0

    def add_order(self, order: Order) -> List[Dict]:
        """添加订单并尝试匹配"""
        matches = []

        if order.order_type == OrderType.MARKET:
            matches = self._execute_market_order(order)
        elif order.order_type == OrderType.LIMIT:
            matches = self._execute_limit_order(order)

        return matches

    def _execute_market_order(self, order: Order) -> List[Dict]:
        """执行市价单"""
        matches = []
        remaining_amount = order.amount

        if order.side == OrderSide.BUY:
            # 买单：从最低卖价开始匹配
            while remaining_amount > 0 and self.sell_orders:
                best_sell = heapq.heappop(self.sell_orders)[1]
                match_result = self._match_orders(order, best_sell, remaining_amount)

                if match_result:
                    matches.append(match_result)
                    remaining_amount -= match_result['amount']

                    # 如果卖单未完全成交，重新加入订单簿
                    if best_sell.filled_amount < best_sell.amount:
                        heapq.heappush(self.sell_orders, (best_sell.price, best_sell))

        else:  # SELL
            # 卖单：从最高买价开始匹配
            while remaining_amount > 0 and self.buy_orders:
                best_buy = heapq.heappop(self.buy_orders)[1]
                match_result = self._match_orders(order, best_buy, remaining_amount)

                if match_result:
                    matches.append(match_result)
                    remaining_amount -= match_result['amount']

                    # 如果买单未完全成交，重新加入订单簿
                    if best_buy.filled_amount < best_buy.amount:
                        heapq.heappush(self.buy_orders, (-best_buy.price, best_buy))

        # 更新订单状态
        order.filled_amount = order.amount - remaining_amount
        order.status = OrderStatus.FILLED if remaining_amount == 0 else OrderStatus.PARTIAL

        return matches

    def _execute_limit_order(self, order: Order) -> List[Dict]:
        """执行限价单"""
        matches = []
        remaining_amount = order.amount

        if order.side == OrderSide.BUY:
            # 买单：只匹配价格低于等于限价的卖单
            while remaining_amount > 0 and self.sell_orders:
                if self.sell_orders[0][1].price > order.price:
                    break

                best_sell = heapq.heappop(self.sell_orders)[1]
                match_result = self._match_orders(order, best_sell, remaining_amount)

                if match_result:
                    matches.append(match_result)
                    remaining_amount -= match_result['amount']

                    if best_sell.filled_amount < best_sell.amount:
                        heapq.heappush(self.sell_orders, (best_sell.price, best_sell))

        else:  # SELL
            # 卖单：只匹配价格高于等于限价的买单
            while remaining_amount > 0 and self.buy_orders:
                if -self.buy_orders[0][0] < order.price:
                    break

                best_buy = heapq.heappop(self.buy_orders)[1]
                match_result = self._match_orders(order, best_buy, remaining_amount)

                if match_result:
                    matches.append(match_result)
                    remaining_amount -= match_result['amount']

                    if best_buy.filled_amount < best_buy.amount:
                        heapq.heappush(self.buy_orders, (-best_buy.price, best_buy))

        # 如果订单未完全成交，加入订单簿
        if remaining_amount > 0:
            order.filled_amount = order.amount - remaining_amount
            order.status = OrderStatus.PARTIAL if order.filled_amount > 0 else OrderStatus.PENDING

            if order.side == OrderSide.BUY:
                heapq.heappush(self.buy_orders, (-order.price, order))
            else:
                heapq.heappush(self.sell_orders, (order.price, order))
        else:
            order.filled_amount = order.amount
            order.status = OrderStatus.FILLED

        return matches

    def _match_orders(self, taker_order: Order, maker_order: Order, max_amount: float) -> Optional[Dict]:
        """匹配两个订单"""
        # 计算成交量（取较小值）
        available_amount = maker_order.amount - maker_order.filled_amount
        trade_amount = min(max_amount, available_amount)

        if trade_amount <= 0:
            return None

        # 成交价格使用maker订单的价格
        trade_price = maker_order.price

        # 更新订单状态
        maker_order.filled_amount += trade_amount
        if maker_order.filled_amount >= maker_order.amount:
            maker_order.status = OrderStatus.FILLED
        else:
            maker_order.status = OrderStatus.PARTIAL

        # 记录交易
        trade = {
            "trade_id": str(uuid.uuid4()),
            "symbol": self.symbol,
            "amount": trade_amount,
            "price": trade_price,
            "timestamp": time.time(),
            "taker_order_id": taker_order.order_id,
            "maker_order_id": maker_order.order_id,
            "taker_side": taker_order.side.value,
            "maker_side": maker_order.side.value
        }

        self.trades.append(trade)
        self.last_price = trade_price

        return trade

    def get_order_book(self, depth: int = 10) -> Dict:
        """获取订单簿"""
        # 买单（按价格降序）
        buy_orders = sorted([order for _, order in self.buy_orders],
                          key=lambda x: x.price, reverse=True)[:depth]

        # 卖单（按价格升序）
        sell_orders = sorted([order for _, order in self.sell_orders],
                           key=lambda x: x.price)[:depth]

        return {
            "symbol": self.symbol,
            "bids": [(order.price, order.amount - order.filled_amount) for order in buy_orders],
            "asks": [(order.price, order.amount - order.filled_amount) for order in sell_orders],
            "last_price": self.last_price
        }

class CentralizedExchange:
    """中心化交易所"""

    def __init__(self, name: str):
        self.name = name
        self.matching_engines: Dict[str, MatchingEngine] = {}
        self.user_balances: Dict[str, Dict[str, float]] = {}
        self.fee_rate = 0.001  # 0.1%手续费
        self.order_history: Dict[str, List[Order]] = {}

    def add_trading_pair(self, symbol: str):
        """添加交易对"""
        self.matching_engines[symbol] = MatchingEngine(symbol)

    def deposit(self, user_id: str, currency: str, amount: float):
        """用户充值"""
        if user_id not in self.user_balances:
            self.user_balances[user_id] = {}

        current_balance = self.user_balances[user_id].get(currency, 0.0)
        self.user_balances[user_id][currency] = current_balance + amount

        print(f"用户 {user_id} 充值 {amount} {currency}")

    def place_order(self, user_id: str, symbol: str, side: OrderSide,
                   order_type: OrderType, amount: float, price: float = 0.0) -> str:
        """下单"""
        if symbol not in self.matching_engines:
            raise ValueError(f"交易对 {symbol} 不存在")

        # 检查余额
        base_currency, quote_currency = symbol.split('/')

        if side == OrderSide.BUY:
            # 买单需要quote货币
            required_balance = amount * price if order_type == OrderType.LIMIT else amount * self.get_market_price(symbol)
            available_balance = self.user_balances.get(user_id, {}).get(quote_currency, 0.0)

            if available_balance < required_balance:
                raise ValueError(f"余额不足：需要 {required_balance} {quote_currency}")

        else:  # SELL
            # 卖单需要base货币
            available_balance = self.user_balances.get(user_id, {}).get(base_currency, 0.0)

            if available_balance < amount:
                raise ValueError(f"余额不足：需要 {amount} {base_currency}")

        # 创建订单
        order_id = str(uuid.uuid4())
        order = Order(
            order_id=order_id,
            user_id=user_id,
            symbol=symbol,
            side=side,
            order_type=order_type,
            amount=amount,
            price=price
        )

        # 执行订单匹配
        matching_engine = self.matching_engines[symbol]
        matches = matching_engine.add_order(order)

        # 处理成交结果
        for match in matches:
            self._process_trade(match)

        # 记录订单历史
        if user_id not in self.order_history:
            self.order_history[user_id] = []
        self.order_history[user_id].append(order)

        print(f"订单 {order_id} 已提交，成交 {len(matches)} 笔")

        return order_id

    def _process_trade(self, trade: Dict):
        """处理交易成交"""
        symbol = trade["symbol"]
        base_currency, quote_currency = symbol.split('/')
        amount = trade["amount"]
        price = trade["price"]
        volume = amount * price

        # 获取taker和maker用户ID
        # 实际实现中需要从订单中获取用户ID
        taker_user = "taker_user"  # 简化
        maker_user = "maker_user"  # 简化

        # 计算手续费
        taker_fee = volume * self.fee_rate
        maker_fee = volume * self.fee_rate * 0.5  # maker享受50%折扣

        print(f"交易成交: {amount} {base_currency} @ {price} {quote_currency}")
        print(f"Taker手续费: {taker_fee} {quote_currency}")
        print(f"Maker手续费: {maker_fee} {quote_currency}")

    def get_market_price(self, symbol: str) -> float:
        """获取市场价格"""
        if symbol in self.matching_engines:
            return self.matching_engines[symbol].last_price or 50000.0  # 默认价格
        return 0.0

    def get_user_balance(self, user_id: str) -> Dict[str, float]:
        """获取用户余额"""
        return self.user_balances.get(user_id, {})

    def get_order_book(self, symbol: str, depth: int = 10) -> Dict:
        """获取订单簿"""
        if symbol in self.matching_engines:
            return self.matching_engines[symbol].get_order_book(depth)
        return {}

# 交易所演示
print("=== 中心化交易所演示 ===")

# 创建交易所
exchange = CentralizedExchange("CryptoExchange")
exchange.add_trading_pair("BTC/USDT")

# 用户充值
exchange.deposit("user1", "BTC", 1.0)
exchange.deposit("user1", "USDT", 60000.0)
exchange.deposit("user2", "BTC", 2.0)
exchange.deposit("user2", "USDT", 100000.0)

print(f"用户1余额: {exchange.get_user_balance('user1')}")
print(f"用户2余额: {exchange.get_user_balance('user2')}")

# 下单交易
print(f"\n=== 开始交易 ===")

# 用户1下限价买单
exchange.place_order("user1", "BTC/USDT", OrderSide.BUY, OrderType.LIMIT, 0.1, 50000.0)

# 用户2下限价卖单
exchange.place_order("user2", "BTC/USDT", OrderSide.SELL, OrderType.LIMIT, 0.05, 49500.0)

# 查看订单簿
order_book = exchange.get_order_book("BTC/USDT")
print(f"\n订单簿:")
print(f"买单 (Bids): {order_book.get('bids', [])}")
print(f"卖单 (Asks): {order_book.get('asks', [])}")
print(f"最新价格: {order_book.get('last_price', 0)}")
```

## 订单类型与交易策略

### 高级订单类型

```python
class AdvancedOrderType(Enum):
    """高级订单类型"""
    TRAILING_STOP = "trailing_stop"      # 跟踪止损
    ICEBERG = "iceberg"                  # 冰山订单
    TWA = "time_weighted_average"        # 时间加权平均
    BRACKET = "bracket"                  # 括号订单

@dataclass
class AdvancedOrder(Order):
    """高级订单"""
    trigger_price: float = 0.0           # 触发价格
    trail_amount: float = 0.0            # 跟踪金额
    visible_size: float = 0.0            # 可见数量（冰山订单）
    time_in_force: str = "GTC"           # 有效期（GTC/IOC/FOK）
    stop_loss_price: float = 0.0         # 止损价格
    take_profit_price: float = 0.0       # 止盈价格

class TradingStrategy:
    """交易策略"""

    def __init__(self, name: str):
        self.name = name
        self.positions: Dict[str, float] = {}
        self.pnl = 0.0
        self.trade_history = []

    def dca_strategy(self, symbol: str, total_amount: float,
                    intervals: int, price_levels: List[float]) -> List[Order]:
        """定投策略 (Dollar Cost Averaging)"""
        orders = []
        amount_per_order = total_amount / intervals

        for i, price in enumerate(price_levels[:intervals]):
            order = Order(
                order_id=f"dca_{i}_{uuid.uuid4()}",
                user_id="dca_trader",
                symbol=symbol,
                side=OrderSide.BUY,
                order_type=OrderType.LIMIT,
                amount=amount_per_order,
                price=price
            )
            orders.append(order)

        print(f"DCA策略生成 {len(orders)} 个订单，总投资额: {total_amount}")
        return orders

    def grid_trading_strategy(self, symbol: str, center_price: float,
                             grid_size: float, grid_count: int,
                             order_amount: float) -> List[Order]:
        """网格交易策略"""
        orders = []

        # 生成买单网格（低于中心价格）
        for i in range(1, grid_count + 1):
            buy_price = center_price - (grid_size * i)
            buy_order = Order(
                order_id=f"grid_buy_{i}_{uuid.uuid4()}",
                user_id="grid_trader",
                symbol=symbol,
                side=OrderSide.BUY,
                order_type=OrderType.LIMIT,
                amount=order_amount,
                price=buy_price
            )
            orders.append(buy_order)

        # 生成卖单网格（高于中心价格）
        for i in range(1, grid_count + 1):
            sell_price = center_price + (grid_size * i)
            sell_order = Order(
                order_id=f"grid_sell_{i}_{uuid.uuid4()}",
                user_id="grid_trader",
                symbol=symbol,
                side=OrderSide.SELL,
                order_type=OrderType.LIMIT,
                amount=order_amount,
                price=sell_price
            )
            orders.append(sell_order)

        print(f"网格策略生成 {len(orders)} 个订单")
        return orders

    def momentum_strategy(self, price_history: List[float],
                         volume_history: List[float]) -> str:
        """动量策略信号"""
        if len(price_history) < 20:
            return "HOLD"

        # 计算移动平均线
        ma_20 = sum(price_history[-20:]) / 20
        ma_5 = sum(price_history[-5:]) / 5

        # 计算价格动量
        price_momentum = (price_history[-1] - price_history[-10]) / price_history[-10]

        # 计算成交量动量
        avg_volume = sum(volume_history[-10:]) / 10
        volume_momentum = volume_history[-1] / avg_volume

        # 策略逻辑
        if (ma_5 > ma_20 and price_momentum > 0.02 and volume_momentum > 1.5):
            signal = "BUY"
        elif (ma_5 < ma_20 and price_momentum < -0.02):
            signal = "SELL"
        else:
            signal = "HOLD"

        print(f"动量策略信号: {signal}")
        print(f"  价格动量: {price_momentum:.2%}")
        print(f"  成交量动量: {volume_momentum:.2f}")

        return signal

    def arbitrage_opportunity(self, exchange1_price: float,
                            exchange2_price: float,
                            fee_rate: float = 0.002) -> Dict:
        """套利机会分析"""
        # 计算价差
        price_diff = abs(exchange1_price - exchange2_price)
        price_diff_pct = price_diff / min(exchange1_price, exchange2_price)

        # 计算总费用（买入费用 + 卖出费用 + 转账费用）
        total_fee_rate = fee_rate * 2 + 0.001  # 假设0.1%转账费用

        # 判断是否有套利机会
        profit_margin = price_diff_pct - total_fee_rate

        if profit_margin > 0:
            # 确定套利方向
            if exchange1_price < exchange2_price:
                direction = "买入交易所1，卖出交易所2"
                buy_exchange = "交易所1"
                sell_exchange = "交易所2"
            else:
                direction = "买入交易所2，卖出交易所1"
                buy_exchange = "交易所2"
                sell_exchange = "交易所1"

            return {
                "opportunity": True,
                "direction": direction,
                "buy_exchange": buy_exchange,
                "sell_exchange": sell_exchange,
                "price_difference": price_diff,
                "profit_margin": profit_margin,
                "estimated_profit_pct": f"{profit_margin:.2%}"
            }
        else:
            return {
                "opportunity": False,
                "reason": "套利利润不足以覆盖交易成本"
            }

# 交易策略演示
print("\n=== 交易策略演示 ===")

strategy = TradingStrategy("Multi-Strategy Bot")

# 1. DCA策略
print("1. 定投策略 (DCA):")
dca_price_levels = [50000, 49000, 48000, 47000, 46000]
dca_orders = strategy.dca_strategy("BTC/USDT", 10000.0, 5, dca_price_levels)

for i, order in enumerate(dca_orders):
    print(f"  订单{i+1}: {order.amount} BTC @ ${order.price}")

# 2. 网格交易策略
print(f"\n2. 网格交易策略:")
grid_orders = strategy.grid_trading_strategy("BTC/USDT", 50000.0, 1000.0, 3, 0.01)

buy_orders = [o for o in grid_orders if o.side == OrderSide.BUY]
sell_orders = [o for o in grid_orders if o.side == OrderSide.SELL]

print(f"  买单网格:")
for order in buy_orders:
    print(f"    {order.amount} BTC @ ${order.price}")

print(f"  卖单网格:")
for order in sell_orders:
    print(f"    {order.amount} BTC @ ${order.price}")

# 3. 动量策略
print(f"\n3. 动量策略分析:")
price_data = [48000, 48500, 49000, 49200, 49800, 50100, 50500, 51000, 51200, 51500,
              51800, 52000, 51800, 51600, 52100, 52500, 52800, 53000, 53200, 53500]
volume_data = [100, 120, 150, 180, 200, 250, 300, 280, 320, 350,
               380, 400, 350, 300, 450, 500, 520, 600, 650, 700]

signal = strategy.momentum_strategy(price_data, volume_data)

# 4. 套利机会分析
print(f"\n4. 套利机会分析:")
exchange_prices = [
    ("Binance", 50000),
    ("Coinbase", 50150),
    ("Kraken", 49950)
]

for i in range(len(exchange_prices)):
    for j in range(i+1, len(exchange_prices)):
        ex1_name, ex1_price = exchange_prices[i]
        ex2_name, ex2_price = exchange_prices[j]

        arbitrage = strategy.arbitrage_opportunity(ex1_price, ex2_price)

        if arbitrage["opportunity"]:
            print(f"  {ex1_name} vs {ex2_name}: 套利机会!")
            print(f"    {arbitrage['direction']}")
            print(f"    预期利润: {arbitrage['estimated_profit_pct']}")
        else:
            print(f"  {ex1_name} vs {ex2_name}: 无套利机会")
```

## K线图与技术分析

### K线数据处理

```python
import math
from typing import List, Tuple

@dataclass
class Candlestick:
    """K线数据"""
    timestamp: float
    open: float
    high: float
    low: float
    close: float
    volume: float

    @property
    def body_size(self) -> float:
        """实体大小"""
        return abs(self.close - self.open)

    @property
    def upper_shadow(self) -> float:
        """上影线长度"""
        return self.high - max(self.open, self.close)

    @property
    def lower_shadow(self) -> float:
        """下影线长度"""
        return min(self.open, self.close) - self.low

    @property
    def is_bullish(self) -> bool:
        """是否为阳线"""
        return self.close > self.open

    @property
    def is_doji(self) -> bool:
        """是否为十字星"""
        return self.body_size <= (self.high - self.low) * 0.1

class TechnicalAnalysis:
    """技术分析工具"""

    @staticmethod
    def sma(prices: List[float], period: int) -> List[float]:
        """简单移动平均线 (SMA)"""
        if len(prices) < period:
            return []

        sma_values = []
        for i in range(period - 1, len(prices)):
            avg = sum(prices[i - period + 1:i + 1]) / period
            sma_values.append(avg)

        return sma_values

    @staticmethod
    def ema(prices: List[float], period: int) -> List[float]:
        """指数移动平均线 (EMA)"""
        if len(prices) < period:
            return []

        ema_values = []
        multiplier = 2 / (period + 1)

        # 第一个EMA值使用SMA
        sma_first = sum(prices[:period]) / period
        ema_values.append(sma_first)

        # 后续EMA计算
        for i in range(period, len(prices)):
            ema = (prices[i] * multiplier) + (ema_values[-1] * (1 - multiplier))
            ema_values.append(ema)

        return ema_values

    @staticmethod
    def rsi(prices: List[float], period: int = 14) -> List[float]:
        """相对强弱指数 (RSI)"""
        if len(prices) < period + 1:
            return []

        gains = []
        losses = []

        # 计算价格变化
        for i in range(1, len(prices)):
            change = prices[i] - prices[i-1]
            if change > 0:
                gains.append(change)
                losses.append(0)
            else:
                gains.append(0)
                losses.append(abs(change))

        rsi_values = []

        # 计算RSI
        for i in range(period - 1, len(gains)):
            avg_gain = sum(gains[i - period + 1:i + 1]) / period
            avg_loss = sum(losses[i - period + 1:i + 1]) / period

            if avg_loss == 0:
                rsi = 100
            else:
                rs = avg_gain / avg_loss
                rsi = 100 - (100 / (1 + rs))

            rsi_values.append(rsi)

        return rsi_values

    @staticmethod
    def macd(prices: List[float], fast_period: int = 12,
             slow_period: int = 26, signal_period: int = 9) -> Tuple[List[float], List[float], List[float]]:
        """MACD指标"""
        # 计算快慢EMA
        ema_fast = TechnicalAnalysis.ema(prices, fast_period)
        ema_slow = TechnicalAnalysis.ema(prices, slow_period)

        # 对齐数据长度
        start_idx = slow_period - fast_period
        ema_fast = ema_fast[start_idx:]

        # 计算MACD线
        macd_line = [fast - slow for fast, slow in zip(ema_fast, ema_slow)]

        # 计算信号线
        signal_line = TechnicalAnalysis.ema(macd_line, signal_period)

        # 计算直方图
        histogram = []
        signal_start = len(macd_line) - len(signal_line)
        for i in range(len(signal_line)):
            histogram.append(macd_line[signal_start + i] - signal_line[i])

        return macd_line, signal_line, histogram

    @staticmethod
    def bollinger_bands(prices: List[float], period: int = 20,
                       std_multiplier: float = 2) -> Tuple[List[float], List[float], List[float]]:
        """布林带"""
        if len(prices) < period:
            return [], [], []

        sma = TechnicalAnalysis.sma(prices, period)
        upper_band = []
        lower_band = []

        for i in range(period - 1, len(prices)):
            price_slice = prices[i - period + 1:i + 1]
            std_dev = math.sqrt(sum((p - sma[i - period + 1]) ** 2 for p in price_slice) / period)

            upper_band.append(sma[i - period + 1] + (std_dev * std_multiplier))
            lower_band.append(sma[i - period + 1] - (std_dev * std_multiplier))

        return sma, upper_band, lower_band

    @staticmethod
    def support_resistance(candlesticks: List[Candlestick], window: int = 20) -> Tuple[List[float], List[float]]:
        """支撑阻力位识别"""
        highs = [c.high for c in candlesticks]
        lows = [c.low for c in candlesticks]

        resistance_levels = []
        support_levels = []

        # 寻找局部高点和低点
        for i in range(window, len(candlesticks) - window):
            # 阻力位（局部高点）
            is_resistance = True
            current_high = candlesticks[i].high

            for j in range(i - window, i + window + 1):
                if j != i and candlesticks[j].high >= current_high:
                    is_resistance = False
                    break

            if is_resistance:
                resistance_levels.append(current_high)

            # 支撑位（局部低点）
            is_support = True
            current_low = candlesticks[i].low

            for j in range(i - window, i + window + 1):
                if j != i and candlesticks[j].low <= current_low:
                    is_support = False
                    break

            if is_support:
                support_levels.append(current_low)

        return support_levels, resistance_levels

# 技术分析演示
print("\n=== 技术分析演示 ===")

# 生成模拟价格数据
import random
base_price = 50000
prices = [base_price]

for i in range(100):
    # 模拟价格随机游走
    change = random.gauss(0, 500)  # 正态分布变化
    new_price = max(prices[-1] + change, 1000)  # 确保价格为正
    prices.append(new_price)

print(f"价格数据: {len(prices)} 个数据点")
print(f"价格区间: ${min(prices):,.0f} - ${max(prices):,.0f}")

# 1. 移动平均线
sma_20 = TechnicalAnalysis.sma(prices, 20)
ema_12 = TechnicalAnalysis.ema(prices, 12)

print(f"\n移动平均线:")
print(f"SMA(20)最新值: ${sma_20[-1]:,.2f}")
print(f"EMA(12)最新值: ${ema_12[-1]:,.2f}")

# 2. RSI指标
rsi = TechnicalAnalysis.rsi(prices, 14)
current_rsi = rsi[-1]

print(f"\nRSI指标:")
print(f"当前RSI: {current_rsi:.2f}")

if current_rsi > 70:
    rsi_signal = "超买区域，考虑卖出"
elif current_rsi < 30:
    rsi_signal = "超卖区域，考虑买入"
else:
    rsi_signal = "中性区域"

print(f"RSI信号: {rsi_signal}")

# 3. MACD指标
macd_line, signal_line, histogram = TechnicalAnalysis.macd(prices)

print(f"\nMACD指标:")
print(f"MACD线: {macd_line[-1]:,.2f}")
print(f"信号线: {signal_line[-1]:,.2f}")
print(f"直方图: {histogram[-1]:,.2f}")

# MACD信号判断
if len(histogram) >= 2:
    if histogram[-1] > 0 and histogram[-2] <= 0:
        macd_signal = "金叉信号，看涨"
    elif histogram[-1] < 0 and histogram[-2] >= 0:
        macd_signal = "死叉信号，看跌"
    else:
        macd_signal = "无明确信号"
    print(f"MACD信号: {macd_signal}")

# 4. 布林带
sma_bb, upper_band, lower_band = TechnicalAnalysis.bollinger_bands(prices, 20)
current_price = prices[-1]

print(f"\n布林带:")
print(f"上轨: ${upper_band[-1]:,.2f}")
print(f"中轨: ${sma_bb[-1]:,.2f}")
print(f"下轨: ${lower_band[-1]:,.2f}")
print(f"当前价格: ${current_price:,.2f}")

# 布林带信号
bb_position = (current_price - lower_band[-1]) / (upper_band[-1] - lower_band[-1])
print(f"价格在布林带中的位置: {bb_position:.2%}")

if bb_position > 0.8:
    bb_signal = "接近上轨，可能回调"
elif bb_position < 0.2:
    bb_signal = "接近下轨，可能反弹"
else:
    bb_signal = "在布林带中部，趋势待观察"

print(f"布林带信号: {bb_signal}")

# 生成K线数据
candlesticks = []
for i in range(1, min(50, len(prices))):
    # 模拟K线数据
    close_price = prices[i]
    open_price = prices[i-1]
    high_price = max(open_price, close_price) + random.uniform(0, abs(close_price - open_price) * 0.5)
    low_price = min(open_price, close_price) - random.uniform(0, abs(close_price - open_price) * 0.5)
    volume = random.uniform(100, 1000)

    candlestick = Candlestick(
        timestamp=time.time() + i * 3600,  # 1小时间隔
        open=open_price,
        high=high_price,
        low=low_price,
        close=close_price,
        volume=volume
    )
    candlesticks.append(candlestick)

# 支撑阻力位分析
if len(candlesticks) >= 40:
    support_levels, resistance_levels = TechnicalAnalysis.support_resistance(candlesticks, 5)

    print(f"\n支撑阻力位分析:")
    print(f"支撑位数量: {len(support_levels)}")
    print(f"阻力位数量: {len(resistance_levels)}")

    if support_levels:
        print(f"最近支撑位: ${max(support_levels):,.2f}")
    if resistance_levels:
        print(f"最近阻力位: ${min(resistance_levels):,.2f}")

# K线形态分析
print(f"\n最新K线形态分析:")
latest_candle = candlesticks[-1]
print(f"类型: {'阳线' if latest_candle.is_bullish else '阴线'}")
print(f"实体大小: ${latest_candle.body_size:,.2f}")
print(f"上影线: ${latest_candle.upper_shadow:,.2f}")
print(f"下影线: ${latest_candle.lower_shadow:,.2f}")

if latest_candle.is_doji:
    print("形态: 十字星 - 市场犹豫不决")
elif latest_candle.upper_shadow > latest_candle.body_size * 2:
    print("形态: 射击之星/倒锤头 - 可能见顶")
elif latest_candle.lower_shadow > latest_candle.body_size * 2:
    print("形态: 锤头线 - 可能见底")
else:
    print("形态: 普通K线")
```

## 本章小结

本章深入学习了虚拟货币交易的核心知识：

1. **交易所机制**：
   - 订单匹配引擎原理
   - 买卖订单簿维护
   - 交易撮合算法
   - 手续费计算

2. **订单类型**：
   - **市价单**：立即成交，价格波动风险
   - **限价单**：指定价格，可能部分成交
   - **止损单**：风险控制，自动止损
   - **高级订单**：冰山单、跟踪止损等

3. **交易策略**：
   - **DCA策略**：分批建仓，降低风险
   - **网格交易**：震荡市场套利
   - **动量策略**：趋势跟随
   - **套利策略**：跨平台价差获利

4. **技术分析**：
   - **移动平均线**：趋势识别
   - **RSI指标**：超买超卖判断
   - **MACD指标**：动量分析
   - **布林带**：波动性分析
   - **支撑阻力**：关键价格位

5. **风险管理**：
   - 仓位控制
   - 止损设置
   - 分散投资
   - 情绪控制

掌握这些交易基础知识是进行虚拟货币投资的重要前提。下一章我们将深入学习DeFi和智能合约的应用。