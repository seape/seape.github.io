---
title: "第8章：投资策略与风险管理"
date: "2024-12-06"
icon: "📊"
author: "Claude"
category: "Cryptocurrency"
---

# 第8章：投资策略与风险管理

## 8.1 虚拟货币投资基础

### 8.1.1 投资前的准备工作

虚拟货币投资具有高风险、高收益的特点，投资者需要做好充分准备：

```python
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import yfinance as yf
from datetime import datetime, timedelta
import warnings
warnings.filterwarnings('ignore')

class CryptoInvestmentAnalyzer:
    def __init__(self):
        self.portfolio = {}
        self.investment_history = []

    def add_investment(self, symbol, amount, price, date=None):
        """添加投资记录"""
        if date is None:
            date = datetime.now()

        investment = {
            'symbol': symbol,
            'amount': amount,
            'price': price,
            'value': amount * price,
            'date': date
        }

        self.investment_history.append(investment)

        if symbol in self.portfolio:
            self.portfolio[symbol]['amount'] += amount
            self.portfolio[symbol]['total_invested'] += investment['value']
        else:
            self.portfolio[symbol] = {
                'amount': amount,
                'total_invested': investment['value']
            }

        print(f"添加投资: {amount} {symbol} @ ${price}")

    def calculate_portfolio_value(self, current_prices):
        """计算投资组合当前价值"""
        total_value = 0
        portfolio_summary = {}

        for symbol, holdings in self.portfolio.items():
            if symbol in current_prices:
                current_value = holdings['amount'] * current_prices[symbol]
                profit_loss = current_value - holdings['total_invested']
                profit_loss_pct = (profit_loss / holdings['total_invested']) * 100

                portfolio_summary[symbol] = {
                    'amount': holdings['amount'],
                    'avg_cost': holdings['total_invested'] / holdings['amount'],
                    'current_price': current_prices[symbol],
                    'current_value': current_value,
                    'total_invested': holdings['total_invested'],
                    'profit_loss': profit_loss,
                    'profit_loss_pct': profit_loss_pct
                }

                total_value += current_value

        return portfolio_summary, total_value

# 创建投资分析器
analyzer = CryptoInvestmentAnalyzer()

# 模拟投资记录
analyzer.add_investment('BTC', 0.5, 45000)
analyzer.add_investment('ETH', 2.0, 3000)
analyzer.add_investment('BTC', 0.3, 50000)

# 当前价格（模拟）
current_prices = {
    'BTC': 48000,
    'ETH': 3200
}

portfolio, total_value = analyzer.calculate_portfolio_value(current_prices)
print("\n投资组合分析:")
print(f"总投资价值: ${total_value:,.2f}")
print("\n详细持仓:")
for symbol, data in portfolio.items():
    print(f"{symbol}:")
    print(f"  持有数量: {data['amount']}")
    print(f"  平均成本: ${data['avg_cost']:,.2f}")
    print(f"  当前价格: ${data['current_price']:,.2f}")
    print(f"  当前价值: ${data['current_value']:,.2f}")
    print(f"  盈亏: ${data['profit_loss']:,.2f} ({data['profit_loss_pct']:.2f}%)")
```

### 8.1.2 市场分析工具

```python
class TechnicalAnalysis:
    def __init__(self):
        self.indicators = {}

    def calculate_sma(self, prices, window):
        """简单移动平均线"""
        return prices.rolling(window=window).mean()

    def calculate_ema(self, prices, window):
        """指数移动平均线"""
        return prices.ewm(span=window).mean()

    def calculate_rsi(self, prices, window=14):
        """相对强弱指数"""
        delta = prices.diff()
        gain = (delta.where(delta > 0, 0)).rolling(window=window).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(window=window).mean()
        rs = gain / loss
        rsi = 100 - (100 / (1 + rs))
        return rsi

    def calculate_bollinger_bands(self, prices, window=20, num_std=2):
        """布林带"""
        sma = self.calculate_sma(prices, window)
        std = prices.rolling(window=window).std()
        upper_band = sma + (std * num_std)
        lower_band = sma - (std * num_std)
        return upper_band, sma, lower_band

    def generate_signals(self, prices):
        """生成交易信号"""
        # 计算技术指标
        sma_20 = self.calculate_sma(prices, 20)
        sma_50 = self.calculate_sma(prices, 50)
        rsi = self.calculate_rsi(prices)
        upper_band, middle_band, lower_band = self.calculate_bollinger_bands(prices)

        signals = pd.DataFrame(index=prices.index)
        signals['price'] = prices
        signals['sma_20'] = sma_20
        signals['sma_50'] = sma_50
        signals['rsi'] = rsi
        signals['upper_band'] = upper_band
        signals['lower_band'] = lower_band

        # 生成买卖信号
        signals['signal'] = 0

        # 买入信号：短期均线上穿长期均线 且 RSI < 30
        buy_condition = (signals['sma_20'] > signals['sma_50']) & (signals['rsi'] < 30)
        signals.loc[buy_condition, 'signal'] = 1

        # 卖出信号：短期均线下穿长期均线 且 RSI > 70
        sell_condition = (signals['sma_20'] < signals['sma_50']) & (signals['rsi'] > 70)
        signals.loc[sell_condition, 'signal'] = -1

        return signals

# 生成示例价格数据
np.random.seed(42)
dates = pd.date_range(start='2023-01-01', end='2024-01-01', freq='D')
initial_price = 40000
returns = np.random.normal(0.001, 0.03, len(dates))
prices = [initial_price]

for r in returns[1:]:
    prices.append(prices[-1] * (1 + r))

price_series = pd.Series(prices, index=dates)

# 技术分析
ta = TechnicalAnalysis()
signals = ta.generate_signals(price_series)

print("技术分析信号（最近5天）:")
print(signals.tail()[['price', 'sma_20', 'sma_50', 'rsi', 'signal']])
```

## 8.2 投资策略详解

### 8.2.1 长期持有策略（HODL）

```python
class HODLStrategy:
    def __init__(self, initial_investment=10000):
        self.initial_investment = initial_investment
        self.holdings = {}
        self.strategy_name = "HODL Strategy"

    def execute_strategy(self, symbol, price_data):
        """执行长期持有策略"""
        # 在第一天买入并持有
        initial_price = price_data.iloc[0]
        amount = self.initial_investment / initial_price

        self.holdings[symbol] = {
            'amount': amount,
            'buy_price': initial_price,
            'buy_date': price_data.index[0]
        }

        # 计算每日价值
        portfolio_values = []
        for date, price in price_data.items():
            current_value = amount * price
            portfolio_values.append(current_value)

        return pd.Series(portfolio_values, index=price_data.index)

    def calculate_performance(self, final_value):
        """计算策略表现"""
        total_return = (final_value - self.initial_investment) / self.initial_investment
        return {
            'strategy': self.strategy_name,
            'initial_investment': self.initial_investment,
            'final_value': final_value,
            'total_return': total_return,
            'total_return_pct': total_return * 100
        }

# 执行HODL策略
hodl = HODLStrategy(10000)
hodl_values = hodl.execute_strategy('BTC', price_series)
hodl_performance = hodl.calculate_performance(hodl_values.iloc[-1])

print("HODL策略表现:")
print(f"初始投资: ${hodl_performance['initial_investment']:,.2f}")
print(f"最终价值: ${hodl_performance['final_value']:,.2f}")
print(f"总收益率: {hodl_performance['total_return_pct']:.2f}%")
```

### 8.2.2 定投策略（DCA）

```python
class DCAStrategy:
    def __init__(self, monthly_investment=1000):
        self.monthly_investment = monthly_investment
        self.strategy_name = "Dollar Cost Averaging"
        self.investments = []

    def execute_strategy(self, symbol, price_data):
        """执行定投策略"""
        portfolio_values = []
        total_amount = 0
        current_value = 0

        # 每月定投
        monthly_dates = price_data.resample('M').first().index

        for date in price_data.index:
            if date in monthly_dates:
                # 执行投资
                price = price_data[date]
                amount = self.monthly_investment / price
                total_amount += amount

                investment = {
                    'date': date,
                    'price': price,
                    'amount': amount,
                    'investment': self.monthly_investment
                }
                self.investments.append(investment)

            current_price = price_data[date]
            current_value = total_amount * current_price
            portfolio_values.append(current_value)

        return pd.Series(portfolio_values, index=price_data.index)

    def calculate_performance(self, final_value):
        """计算策略表现"""
        total_invested = len(self.investments) * self.monthly_investment
        total_return = (final_value - total_invested) / total_invested

        return {
            'strategy': self.strategy_name,
            'total_invested': total_invested,
            'final_value': final_value,
            'total_return': total_return,
            'total_return_pct': total_return * 100,
            'num_investments': len(self.investments)
        }

# 执行定投策略
dca = DCAStrategy(1000)
dca_values = dca.execute_strategy('BTC', price_series)
dca_performance = dca.calculate_performance(dca_values.iloc[-1])

print("\n定投策略表现:")
print(f"总投资次数: {dca_performance['num_investments']}")
print(f"总投资金额: ${dca_performance['total_invested']:,.2f}")
print(f"最终价值: ${dca_performance['final_value']:,.2f}")
print(f"总收益率: {dca_performance['total_return_pct']:.2f}%")
```

### 8.2.3 趋势跟随策略

```python
class TrendFollowingStrategy:
    def __init__(self, initial_capital=10000, short_window=20, long_window=50):
        self.initial_capital = initial_capital
        self.short_window = short_window
        self.long_window = long_window
        self.strategy_name = "Trend Following"
        self.trades = []

    def execute_strategy(self, symbol, price_data):
        """执行趋势跟随策略"""
        # 计算移动平均线
        short_ma = price_data.rolling(window=self.short_window).mean()
        long_ma = price_data.rolling(window=self.long_window).mean()

        portfolio_values = []
        cash = self.initial_capital
        position = 0  # 持仓数量

        for i, (date, price) in enumerate(price_data.items()):
            if i < self.long_window:
                portfolio_values.append(self.initial_capital)
                continue

            current_short_ma = short_ma.iloc[i]
            current_long_ma = long_ma.iloc[i]
            prev_short_ma = short_ma.iloc[i-1]
            prev_long_ma = long_ma.iloc[i-1]

            # 买入信号：短期均线上穿长期均线
            if (current_short_ma > current_long_ma and
                prev_short_ma <= prev_long_ma and
                position == 0 and cash > 0):

                position = cash / price
                cash = 0
                self.trades.append({
                    'date': date,
                    'action': 'BUY',
                    'price': price,
                    'amount': position
                })

            # 卖出信号：短期均线下穿长期均线
            elif (current_short_ma < current_long_ma and
                  prev_short_ma >= prev_long_ma and
                  position > 0):

                cash = position * price
                self.trades.append({
                    'date': date,
                    'action': 'SELL',
                    'price': price,
                    'amount': position
                })
                position = 0

            # 计算当前组合价值
            current_value = cash + (position * price)
            portfolio_values.append(current_value)

        return pd.Series(portfolio_values, index=price_data.index)

    def calculate_performance(self, portfolio_values):
        """计算策略表现"""
        final_value = portfolio_values.iloc[-1]
        total_return = (final_value - self.initial_capital) / self.initial_capital

        return {
            'strategy': self.strategy_name,
            'initial_capital': self.initial_capital,
            'final_value': final_value,
            'total_return': total_return,
            'total_return_pct': total_return * 100,
            'num_trades': len(self.trades)
        }

# 执行趋势跟随策略
trend = TrendFollowingStrategy(10000)
trend_values = trend.execute_strategy('BTC', price_series)
trend_performance = trend.calculate_performance(trend_values)

print("\n趋势跟随策略表现:")
print(f"初始资金: ${trend_performance['initial_capital']:,.2f}")
print(f"最终价值: ${trend_performance['final_value']:,.2f}")
print(f"总收益率: {trend_performance['total_return_pct']:.2f}%")
print(f"交易次数: {trend_performance['num_trades']}")
```

## 8.3 风险管理

### 8.3.1 风险度量指标

```python
class RiskAnalyzer:
    def __init__(self):
        self.risk_metrics = {}

    def calculate_volatility(self, returns):
        """计算波动率"""
        return returns.std() * np.sqrt(252)  # 年化波动率

    def calculate_var(self, returns, confidence_level=0.05):
        """计算风险价值（VaR）"""
        return np.percentile(returns, confidence_level * 100)

    def calculate_cvar(self, returns, confidence_level=0.05):
        """计算条件风险价值（CVaR）"""
        var = self.calculate_var(returns, confidence_level)
        return returns[returns <= var].mean()

    def calculate_max_drawdown(self, portfolio_values):
        """计算最大回撤"""
        peak = portfolio_values.expanding().max()
        drawdown = (portfolio_values - peak) / peak
        return drawdown.min()

    def calculate_sharpe_ratio(self, returns, risk_free_rate=0.02):
        """计算夏普比率"""
        excess_returns = returns.mean() * 252 - risk_free_rate
        volatility = self.calculate_volatility(returns)
        return excess_returns / volatility

    def comprehensive_risk_analysis(self, portfolio_values):
        """综合风险分析"""
        returns = portfolio_values.pct_change().dropna()

        metrics = {
            'volatility': self.calculate_volatility(returns),
            'var_5%': self.calculate_var(returns, 0.05),
            'cvar_5%': self.calculate_cvar(returns, 0.05),
            'max_drawdown': self.calculate_max_drawdown(portfolio_values),
            'sharpe_ratio': self.calculate_sharpe_ratio(returns)
        }

        return metrics

# 风险分析
risk_analyzer = RiskAnalyzer()

# 分析各策略的风险
strategies = {
    'HODL': hodl_values,
    'DCA': dca_values,
    'Trend Following': trend_values
}

print("\n策略风险分析:")
print("-" * 60)
print(f"{'策略':<15} {'波动率':<10} {'最大回撤':<10} {'夏普比率':<10}")
print("-" * 60)

for name, values in strategies.items():
    if len(values) > 1:
        risk_metrics = risk_analyzer.comprehensive_risk_analysis(values)
        print(f"{name:<15} {risk_metrics['volatility']:<10.2%} "
              f"{risk_metrics['max_drawdown']:<10.2%} "
              f"{risk_metrics['sharpe_ratio']:<10.2f}")
```

### 8.3.2 头寸管理

```python
class PositionSizing:
    def __init__(self, total_capital):
        self.total_capital = total_capital

    def kelly_criterion(self, win_probability, avg_win, avg_loss):
        """凯利公式计算最优仓位大小"""
        if avg_loss <= 0:
            return 0
        b = avg_win / avg_loss  # 赔率
        p = win_probability  # 胜率
        kelly_fraction = (b * p - (1 - p)) / b
        return max(0, min(kelly_fraction, 0.25))  # 限制最大25%

    def fixed_percentage(self, percentage=0.02):
        """固定百分比风险"""
        return self.total_capital * percentage

    def volatility_based_sizing(self, volatility, target_risk=0.02):
        """基于波动率的头寸规模"""
        if volatility <= 0:
            return 0
        position_size = (target_risk * self.total_capital) / volatility
        return position_size

# 头寸管理示例
position_sizer = PositionSizing(100000)

# 假设交易统计
win_prob = 0.6
avg_win = 0.05
avg_loss = 0.03

kelly_size = position_sizer.kelly_criterion(win_prob, avg_win, avg_loss)
fixed_size = position_sizer.fixed_percentage(0.02)

print(f"\n头寸管理建议:")
print(f"凯利公式建议仓位: {kelly_size:.2%}")
print(f"固定2%风险仓位: ${fixed_size:,.2f}")
```

### 8.3.3 投资组合优化

```python
import scipy.optimize as optimize

class PortfolioOptimizer:
    def __init__(self, expected_returns, cov_matrix):
        self.expected_returns = expected_returns
        self.cov_matrix = cov_matrix
        self.num_assets = len(expected_returns)

    def portfolio_stats(self, weights):
        """计算组合统计指标"""
        portfolio_return = np.sum(weights * self.expected_returns)
        portfolio_variance = np.dot(weights.T, np.dot(self.cov_matrix, weights))
        portfolio_std = np.sqrt(portfolio_variance)
        sharpe_ratio = portfolio_return / portfolio_std
        return portfolio_return, portfolio_std, sharpe_ratio

    def negative_sharpe(self, weights):
        """负夏普比率（用于最小化）"""
        return -self.portfolio_stats(weights)[2]

    def optimize_sharpe(self):
        """最大化夏普比率"""
        constraints = {'type': 'eq', 'fun': lambda x: np.sum(x) - 1}
        bounds = tuple((0, 1) for _ in range(self.num_assets))
        initial_guess = np.array([1/self.num_assets] * self.num_assets)

        result = optimize.minimize(
            self.negative_sharpe,
            initial_guess,
            method='SLSQP',
            bounds=bounds,
            constraints=constraints
        )

        return result.x

    def efficient_frontier(self, num_portfolios=100):
        """生成有效前沿"""
        min_ret = self.expected_returns.min()
        max_ret = self.expected_returns.max()
        target_returns = np.linspace(min_ret, max_ret, num_portfolios)

        efficient_portfolios = []

        for target in target_returns:
            constraints = [
                {'type': 'eq', 'fun': lambda x: np.sum(x) - 1},
                {'type': 'eq', 'fun': lambda x: np.sum(x * self.expected_returns) - target}
            ]
            bounds = tuple((0, 1) for _ in range(self.num_assets))
            initial_guess = np.array([1/self.num_assets] * self.num_assets)

            result = optimize.minimize(
                lambda x: np.dot(x.T, np.dot(self.cov_matrix, x)),
                initial_guess,
                method='SLSQP',
                bounds=bounds,
                constraints=constraints
            )

            if result.success:
                ret, std, sharpe = self.portfolio_stats(result.x)
                efficient_portfolios.append({
                    'return': ret,
                    'std': std,
                    'sharpe': sharpe,
                    'weights': result.x
                })

        return efficient_portfolios

# 投资组合优化示例
assets = ['BTC', 'ETH', 'BNB', 'ADA']
expected_returns = np.array([0.15, 0.12, 0.10, 0.08])  # 年化收益率
cov_matrix = np.array([
    [0.04, 0.02, 0.015, 0.01],
    [0.02, 0.03, 0.012, 0.008],
    [0.015, 0.012, 0.025, 0.006],
    [0.01, 0.008, 0.006, 0.02]
])  # 协方差矩阵

optimizer = PortfolioOptimizer(expected_returns, cov_matrix)
optimal_weights = optimizer.optimize_sharpe()

print(f"\n最优投资组合配置:")
for i, asset in enumerate(assets):
    print(f"{asset}: {optimal_weights[i]:.2%}")

ret, std, sharpe = optimizer.portfolio_stats(optimal_weights)
print(f"\n组合表现:")
print(f"预期收益率: {ret:.2%}")
print(f"预期波动率: {std:.2%}")
print(f"夏普比率: {sharpe:.2f}")
```

## 8.4 风险管理实践

### 8.4.1 止损策略

```python
class StopLossManager:
    def __init__(self):
        self.stop_loss_orders = {}

    def set_stop_loss(self, symbol, entry_price, stop_loss_pct=0.1):
        """设置止损"""
        stop_price = entry_price * (1 - stop_loss_pct)
        self.stop_loss_orders[symbol] = {
            'entry_price': entry_price,
            'stop_price': stop_price,
            'stop_loss_pct': stop_loss_pct
        }
        print(f"设置止损: {symbol} 入场价格 ${entry_price:.2f}, 止损价格 ${stop_price:.2f}")

    def trailing_stop_loss(self, symbol, current_price, trailing_pct=0.05):
        """移动止损"""
        if symbol not in self.stop_loss_orders:
            return False

        order = self.stop_loss_orders[symbol]
        new_stop_price = current_price * (1 - trailing_pct)

        # 只有当新止损价格高于当前止损价格时才更新
        if new_stop_price > order['stop_price']:
            order['stop_price'] = new_stop_price
            print(f"更新移动止损: {symbol} 新止损价格 ${new_stop_price:.2f}")
            return True
        return False

    def check_stop_loss(self, symbol, current_price):
        """检查是否触发止损"""
        if symbol not in self.stop_loss_orders:
            return False

        stop_price = self.stop_loss_orders[symbol]['stop_price']
        if current_price <= stop_price:
            print(f"触发止损: {symbol} 当前价格 ${current_price:.2f} <= 止损价格 ${stop_price:.2f}")
            return True
        return False

# 止损管理示例
stop_manager = StopLossManager()
stop_manager.set_stop_loss('BTC', 45000, 0.1)

# 模拟价格变动
prices = [46000, 47000, 44000, 43000, 48000, 40000]

for price in prices:
    print(f"\n当前价格: ${price}")

    # 检查移动止损
    stop_manager.trailing_stop_loss('BTC', price, 0.05)

    # 检查是否触发止损
    if stop_manager.check_stop_loss('BTC', price):
        print("执行止损卖出")
        break
```

### 8.4.2 资金管理规则

```python
class RiskManagementRules:
    def __init__(self, total_capital, max_risk_per_trade=0.02, max_portfolio_risk=0.20):
        self.total_capital = total_capital
        self.max_risk_per_trade = max_risk_per_trade
        self.max_portfolio_risk = max_portfolio_risk
        self.current_positions = {}
        self.total_risk = 0

    def calculate_position_size(self, entry_price, stop_loss_price):
        """计算头寸大小"""
        if entry_price <= stop_loss_price:
            return 0

        risk_per_share = entry_price - stop_loss_price
        risk_amount = self.total_capital * self.max_risk_per_trade
        position_size = risk_amount / risk_per_share

        return position_size

    def can_open_position(self, position_risk):
        """检查是否可以开新仓位"""
        new_total_risk = self.total_risk + position_risk
        return new_total_risk <= self.max_portfolio_risk

    def add_position(self, symbol, entry_price, stop_loss_price, position_size):
        """添加新仓位"""
        position_risk = (entry_price - stop_loss_price) * position_size / self.total_capital

        if self.can_open_position(position_risk):
            self.current_positions[symbol] = {
                'entry_price': entry_price,
                'stop_loss_price': stop_loss_price,
                'position_size': position_size,
                'risk': position_risk
            }
            self.total_risk += position_risk
            print(f"开仓: {symbol}, 仓位大小: {position_size:.4f}, 风险: {position_risk:.2%}")
            return True
        else:
            print(f"风险过高，无法开仓 {symbol}")
            return False

    def close_position(self, symbol):
        """平仓"""
        if symbol in self.current_positions:
            position = self.current_positions[symbol]
            self.total_risk -= position['risk']
            del self.current_positions[symbol]
            print(f"平仓: {symbol}")

    def get_risk_summary(self):
        """获取风险摘要"""
        return {
            'total_capital': self.total_capital,
            'total_risk': self.total_risk,
            'risk_percentage': self.total_risk * 100,
            'available_risk': (self.max_portfolio_risk - self.total_risk) * 100,
            'active_positions': len(self.current_positions)
        }

# 资金管理示例
risk_manager = RiskManagementRules(100000)

# 计算头寸大小
entry_price = 45000
stop_loss_price = 43000
position_size = risk_manager.calculate_position_size(entry_price, stop_loss_price)

print(f"推荐头寸大小: {position_size:.6f} BTC")
print(f"投资金额: ${position_size * entry_price:.2f}")

# 开仓
risk_manager.add_position('BTC', entry_price, stop_loss_price, position_size)

# 风险摘要
risk_summary = risk_manager.get_risk_summary()
print(f"\n风险管理摘要:")
print(f"总资金: ${risk_summary['total_capital']:,.2f}")
print(f"当前风险: {risk_summary['risk_percentage']:.2f}%")
print(f"可用风险: {risk_summary['available_risk']:.2f}%")
print(f"活跃头寸: {risk_summary['active_positions']}")
```

## 8.5 投资心理学

### 8.5.1 常见认知偏差

```python
class TradingPsychologyAnalyzer:
    def __init__(self):
        self.trading_log = []
        self.biases_detected = []

    def log_trade(self, symbol, action, price, reason, emotion_score=5):
        """记录交易"""
        trade = {
            'timestamp': datetime.now(),
            'symbol': symbol,
            'action': action,
            'price': price,
            'reason': reason,
            'emotion_score': emotion_score  # 1-10, 1=极度恐惧, 10=极度贪婪
        }
        self.trading_log.append(trade)

    def detect_revenge_trading(self, window_hours=24):
        """检测报复性交易"""
        if len(self.trading_log) < 2:
            return False

        recent_trades = []
        current_time = datetime.now()

        for trade in self.trading_log:
            if (current_time - trade['timestamp']).total_seconds() / 3600 <= window_hours:
                recent_trades.append(trade)

        if len(recent_trades) >= 5:  # 24小时内超过5次交易
            self.biases_detected.append({
                'bias': 'Revenge Trading',
                'description': '短时间内过度频繁交易',
                'timestamp': current_time
            })
            return True
        return False

    def detect_fomo(self, emotion_threshold=8):
        """检测FOMO（错失恐惧症）"""
        if not self.trading_log:
            return False

        last_trade = self.trading_log[-1]
        if (last_trade['action'] == 'BUY' and
            last_trade['emotion_score'] >= emotion_threshold and
            '涨' in last_trade['reason']):

            self.biases_detected.append({
                'bias': 'FOMO',
                'description': '在价格上涨时情绪化买入',
                'timestamp': last_trade['timestamp']
            })
            return True
        return False

    def detect_loss_aversion(self):
        """检测损失厌恶"""
        buy_trades = [t for t in self.trading_log if t['action'] == 'BUY']
        sell_trades = [t for t in self.trading_log if t['action'] == 'SELL']

        if len(buy_trades) > len(sell_trades) * 2:  # 买入远多于卖出
            self.biases_detected.append({
                'bias': 'Loss Aversion',
                'description': '不愿意实现亏损',
                'timestamp': datetime.now()
            })
            return True
        return False

    def get_psychology_report(self):
        """生成心理分析报告"""
        return {
            'total_trades': len(self.trading_log),
            'biases_detected': self.biases_detected,
            'average_emotion_score': np.mean([t['emotion_score'] for t in self.trading_log]) if self.trading_log else 0,
            'recommendations': self.generate_recommendations()
        }

    def generate_recommendations(self):
        """生成改善建议"""
        recommendations = []

        bias_types = [b['bias'] for b in self.biases_detected]

        if 'Revenge Trading' in bias_types:
            recommendations.append("设置每日最大交易次数限制")

        if 'FOMO' in bias_types:
            recommendations.append("制定明确的买入策略，避免情绪化决策")

        if 'Loss Aversion' in bias_types:
            recommendations.append("严格执行止损策略")

        if not recommendations:
            recommendations.append("继续保持理性交易")

        return recommendations

# 交易心理分析示例
psychology = TradingPsychologyAnalyzer()

# 模拟交易记录
trades = [
    ('BTC', 'BUY', 45000, '技术分析显示突破', 6),
    ('ETH', 'BUY', 3000, '看到新闻说要涨', 9),
    ('BTC', 'SELL', 46000, '获利了结', 5),
    ('BNB', 'BUY', 300, '别人都在买', 8),
    ('ADA', 'BUY', 0.5, '价格在涨', 9),
    ('DOT', 'BUY', 25, 'FOMO', 10)
]

for symbol, action, price, reason, emotion in trades:
    psychology.log_trade(symbol, action, price, reason, emotion)
    psychology.detect_fomo()
    psychology.detect_revenge_trading()

psychology.detect_loss_aversion()

report = psychology.get_psychology_report()
print("交易心理分析报告:")
print(f"总交易次数: {report['total_trades']}")
print(f"平均情绪评分: {report['average_emotion_score']:.1f}/10")
print(f"\n检测到的认知偏差:")
for bias in report['biases_detected']:
    print(f"- {bias['bias']}: {bias['description']}")
print(f"\n改善建议:")
for rec in report['recommendations']:
    print(f"- {rec}")
```

## 8.6 课程总结

本章详细介绍了虚拟货币投资策略与风险管理的各个方面：

### 关键要点
1. **投资策略多样化**: HODL、DCA、趋势跟随等策略各有优劣
2. **风险管理至关重要**: 使用技术指标量化和控制风险
3. **头寸管理**: 合理的资金分配是成功的关键
4. **心理控制**: 识别和克服认知偏差

### 实践建议
- 制定明确的投资计划和风险管理规则
- 使用技术分析工具辅助决策
- 严格执行止损策略
- 保持理性，避免情绪化交易
- 分散投资，不要把鸡蛋放在一个篮子里

虚拟货币投资需要专业知识、严格纪律和持续学习。通过本章的学习，你应该能够构建适合自己的投资策略和风险管理体系。