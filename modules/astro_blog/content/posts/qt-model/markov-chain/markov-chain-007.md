---
title: "第7章：股票价格建模实践"
date: 2025-10-02
icon: circle-dot
author: Haiyue
category:
  - markov-chain
star: false
---
# 第7章：股票价格建模实践

::: tip 学习目标
- 使用马尔科夫链建模股票价格运动
- 实现基于状态的股票收益率模型
- 编写Python代码进行参数估计
- 进行模型验证和回测分析
:::

## 知识点总结

### 1. 股票价格的马尔科夫建模框架

**离散化收益率状态**：
将连续的收益率分布离散化为有限状态：
$$S_t \in \{\text{大涨}, \text{小涨}, \text{持平}, \text{小跌}, \text{大跌}\}$$

**状态定义准则**：
- 基于分位数：如20%、40%、60%、80%分位数
- 基于波动率：±0.5σ, ±1σ, ±2σ
- 基于技术分析：突破、支撑、阻力位

### 2. 多状态马尔科夫模型

**状态转移矩阵** $P$：
$$P_{ij} = P(S_{t+1} = j | S_t = i)$$

**平稳分布**：
$$\pi = \pi P, \quad \sum_i \pi_i = 1$$

**期望收益率**：
$$E[R_{t+1} | S_t = i] = \sum_j \mu_j P_{ij}$$

### 3. 状态依赖的风险模型

**条件方差**：
$$\text{Var}(R_{t+1} | S_t = i) = \sum_j \sigma_j^2 P_{ij}$$

**条件VaR**：
$$\text{VaR}_\alpha(S_t = i) = \inf\{x : P(R_{t+1} \leq x | S_t = i) \geq \alpha\}$$

## 示例代码

### 示例1：构建股票价格马尔科夫链

```python
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import yfinance as yf
from scipy import stats
from sklearn.preprocessing import KBinsDiscretizer
import seaborn as sns

class StockMarkovModel:
    """
    股票价格马尔科夫链模型
    """

    def __init__(self, n_states=5):
        self.n_states = n_states
        self.state_labels = None
        self.transition_matrix = None
        self.state_boundaries = None
        self.discretizer = None

    def fit(self, returns, method='quantile'):
        """
        拟合马尔科夫链模型

        Parameters:
        returns: 收益率序列
        method: 状态划分方法 ('quantile', 'kmeans', 'fixed')
        """
        returns = np.array(returns)

        # 状态离散化
        if method == 'quantile':
            self.discretizer = KBinsDiscretizer(
                n_bins=self.n_states,
                encode='ordinal',
                strategy='quantile',
                subsample=None
            )
        elif method == 'kmeans':
            self.discretizer = KBinsDiscretizer(
                n_bins=self.n_states,
                encode='ordinal',
                strategy='kmeans'
            )
        elif method == 'fixed':
            # 基于标准差的固定划分
            std_returns = np.std(returns)
            boundaries = [-2*std_returns, -0.5*std_returns, 0.5*std_returns, 2*std_returns]
            self.state_boundaries = boundaries

        if method != 'fixed':
            states = self.discretizer.fit_transform(returns.reshape(-1, 1)).astype(int).flatten()
            self.state_boundaries = self.discretizer.bin_edges_[0]
        else:
            states = self._discretize_fixed(returns)

        # 创建状态标签
        self.state_labels = [f'状态{i}' for i in range(self.n_states)]

        # 估计转移概率矩阵
        self.transition_matrix = self._estimate_transition_matrix(states)

        return states

    def _discretize_fixed(self, returns):
        """固定阈值离散化"""
        states = np.zeros(len(returns), dtype=int)
        boundaries = self.state_boundaries

        for i, ret in enumerate(returns):
            if ret <= boundaries[0]:
                states[i] = 0  # 大跌
            elif ret <= boundaries[1]:
                states[i] = 1  # 小跌
            elif ret <= boundaries[2]:
                states[i] = 2  # 持平
            elif ret <= boundaries[3]:
                states[i] = 3  # 小涨
            else:
                states[i] = 4  # 大涨

        return states

    def _estimate_transition_matrix(self, states):
        """估计转移概率矩阵"""
        n_obs = len(states)
        transition_counts = np.zeros((self.n_states, self.n_states))

        # 计算转移次数
        for t in range(n_obs - 1):
            i, j = states[t], states[t + 1]
            transition_counts[i, j] += 1

        # 转换为概率（行归一化）
        row_sums = transition_counts.sum(axis=1, keepdims=True)
        transition_matrix = np.divide(
            transition_counts,
            row_sums,
            out=np.zeros_like(transition_counts),
            where=row_sums != 0
        )

        return transition_matrix

    def predict_next_state_probs(self, current_state):
        """预测下一状态概率分布"""
        return self.transition_matrix[current_state]

    def simulate_path(self, initial_state, n_steps, seed=None):
        """模拟状态路径"""
        if seed is not None:
            np.random.seed(seed)

        path = np.zeros(n_steps, dtype=int)
        path[0] = initial_state

        for t in range(1, n_steps):
            probs = self.transition_matrix[path[t-1]]
            path[t] = np.random.choice(self.n_states, p=probs)

        return path

    def calculate_stationary_distribution(self):
        """计算平稳分布"""
        eigenvals, eigenvecs = np.linalg.eig(self.transition_matrix.T)
        stationary_idx = np.argmin(np.abs(eigenvals - 1))
        stationary = np.real(eigenvecs[:, stationary_idx])
        return stationary / np.sum(stationary)

def download_stock_data(symbol='AAPL', period='2y'):
    """下载股票数据"""
    try:
        stock = yf.Ticker(symbol)
        data = stock.history(period=period)
        returns = data['Close'].pct_change().dropna()
        return data, returns
    except:
        # 如果下载失败，生成模拟数据
        print(f"无法下载{symbol}数据，使用模拟数据")
        np.random.seed(42)
        n_days = 500
        returns = np.random.normal(0.001, 0.02, n_days)  # 模拟日收益率
        dates = pd.date_range('2022-01-01', periods=n_days, freq='D')
        prices = 100 * np.cumprod(1 + returns)
        data = pd.DataFrame({
            'Close': prices,
            'Open': prices * (1 + np.random.normal(0, 0.001, n_days)),
            'High': prices * (1 + np.abs(np.random.normal(0, 0.005, n_days))),
            'Low': prices * (1 - np.abs(np.random.normal(0, 0.005, n_days))),
            'Volume': np.random.randint(1000000, 10000000, n_days)
        }, index=dates)
        returns = pd.Series(returns, index=dates)
        return data, returns

# 下载股票数据
print("正在获取股票数据...")
stock_data, stock_returns = download_stock_data('AAPL', '2y')

print(f"数据期间: {stock_data.index[0].date()} 到 {stock_data.index[-1].date()}")
print(f"总交易日数: {len(stock_returns)}")
print(f"平均日收益率: {stock_returns.mean():.4f}")
print(f"日收益率标准差: {stock_returns.std():.4f}")

# 构建马尔科夫链模型
markov_model = StockMarkovModel(n_states=5)
states = markov_model.fit(stock_returns, method='quantile')

print(f"\n转移概率矩阵:")
print(markov_model.transition_matrix)

# 计算平稳分布
stationary_dist = markov_model.calculate_stationary_distribution()
print(f"\n平稳分布: {stationary_dist}")

# 状态边界
print(f"\n状态边界: {markov_model.state_boundaries}")
```

### 示例2：模型分析与可视化

```python
def analyze_markov_model(returns, states, model):
    """分析马尔科夫模型特征"""
    results = {}

    # 各状态统计特征
    for state in range(model.n_states):
        state_mask = (states == state)
        state_returns = returns[state_mask]

        if len(state_returns) > 0:
            results[state] = {
                'frequency': np.mean(state_mask),
                'mean_return': np.mean(state_returns),
                'std_return': np.std(state_returns),
                'min_return': np.min(state_returns),
                'max_return': np.max(state_returns),
                'skewness': stats.skew(state_returns),
                'kurtosis': stats.kurtosis(state_returns)
            }

    # 转移分析
    persistence = np.diag(model.transition_matrix)
    expected_duration = 1 / (1 - persistence)

    results['transition_analysis'] = {
        'persistence': persistence,
        'expected_duration': expected_duration,
        'stationary_distribution': model.calculate_stationary_distribution()
    }

    return results

# 分析模型
analysis_results = analyze_markov_model(stock_returns.values, states, markov_model)

print("各状态分析结果:")
print("=" * 50)
for state in range(markov_model.n_states):
    if state in analysis_results:
        result = analysis_results[state]
        print(f"\n状态 {state}:")
        print(f"  出现频率: {result['frequency']:.1%}")
        print(f"  平均收益率: {result['mean_return']:.4f}")
        print(f"  收益率标准差: {result['std_return']:.4f}")
        print(f"  收益率范围: [{result['min_return']:.4f}, {result['max_return']:.4f}]")
        print(f"  偏度: {result['skewness']:.2f}")
        print(f"  峰度: {result['kurtosis']:.2f}")

trans_analysis = analysis_results['transition_analysis']
print(f"\n转移分析:")
print(f"状态持续性: {trans_analysis['persistence']}")
print(f"期望持续期: {trans_analysis['expected_duration']}")

# 可视化分析
fig, axes = plt.subplots(3, 3, figsize=(18, 15))

# 子图1：收益率时序图
axes[0, 0].plot(stock_data.index, stock_returns, linewidth=0.8, alpha=0.7)
axes[0, 0].set_title('股票日收益率时序图')
axes[0, 0].set_ylabel('收益率')
axes[0, 0].grid(True, alpha=0.3)

# 子图2：价格走势图
axes[0, 1].plot(stock_data.index, stock_data['Close'], linewidth=1.5)
axes[0, 1].set_title('股票价格走势')
axes[0, 1].set_ylabel('价格')
axes[0, 1].grid(True, alpha=0.3)

# 子图3：状态序列
axes[0, 2].plot(stock_data.index[1:], states, linewidth=1, alpha=0.8)
axes[0, 2].set_title('马尔科夫状态序列')
axes[0, 2].set_ylabel('状态')
axes[0, 2].set_ylim(-0.5, markov_model.n_states - 0.5)
axes[0, 2].grid(True, alpha=0.3)

# 子图4：转移概率矩阵热图
im = axes[1, 0].imshow(markov_model.transition_matrix, cmap='Blues', aspect='auto')
axes[1, 0].set_title('转移概率矩阵')
axes[1, 0].set_xlabel('下一状态')
axes[1, 0].set_ylabel('当前状态')

# 添加数值标注
for i in range(markov_model.n_states):
    for j in range(markov_model.n_states):
        text = axes[1, 0].text(j, i, f'{markov_model.transition_matrix[i, j]:.2f}',
                              ha="center", va="center", color="black", fontsize=8)

plt.colorbar(im, ax=axes[1, 0])

# 子图5：各状态收益率分布
colors = plt.cm.Set1(np.linspace(0, 1, markov_model.n_states))
for state in range(markov_model.n_states):
    state_returns = stock_returns.values[states == state]
    if len(state_returns) > 0:
        axes[1, 1].hist(state_returns, bins=30, alpha=0.6, density=True,
                       label=f'状态{state}', color=colors[state])

axes[1, 1].set_title('各状态收益率分布')
axes[1, 1].set_xlabel('收益率')
axes[1, 1].set_ylabel('密度')
axes[1, 1].legend()
axes[1, 1].grid(True, alpha=0.3)

# 子图6：状态频率条形图
state_frequencies = [analysis_results[s]['frequency'] if s in analysis_results else 0
                    for s in range(markov_model.n_states)]
axes[1, 2].bar(range(markov_model.n_states), state_frequencies, color=colors, alpha=0.7)
axes[1, 2].set_title('各状态出现频率')
axes[1, 2].set_xlabel('状态')
axes[1, 2].set_ylabel('频率')
axes[1, 2].grid(True, alpha=0.3, axis='y')

# 子图7：状态持续时间分析
durations = {i: [] for i in range(markov_model.n_states)}
current_state = states[0]
current_duration = 1

for t in range(1, len(states)):
    if states[t] == current_state:
        current_duration += 1
    else:
        durations[current_state].append(current_duration)
        current_state = states[t]
        current_duration = 1

durations[current_state].append(current_duration)

avg_durations = [np.mean(durations[s]) if durations[s] else 0
                for s in range(markov_model.n_states)]
axes[2, 0].bar(range(markov_model.n_states), avg_durations, color=colors, alpha=0.7)
axes[2, 0].set_title('平均状态持续时间')
axes[2, 0].set_xlabel('状态')
axes[2, 0].set_ylabel('平均持续天数')
axes[2, 0].grid(True, alpha=0.3, axis='y')

# 子图8：累积收益率（按状态着色）
cumulative_returns = stock_returns.cumsum()
for state in range(markov_model.n_states):
    state_mask = (states == state)
    if np.any(state_mask):
        state_indices = np.where(state_mask)[0]
        axes[2, 1].scatter(stock_data.index[1:][state_mask],
                          cumulative_returns.iloc[state_mask],
                          c=[colors[state]], s=1, alpha=0.6, label=f'状态{state}')

axes[2, 1].set_title('累积收益率（按状态着色）')
axes[2, 1].set_xlabel('日期')
axes[2, 1].set_ylabel('累积收益率')
axes[2, 1].legend()
axes[2, 1].grid(True, alpha=0.3)

# 子图9：平稳分布vs经验分布
empirical_dist = [np.mean(states == s) for s in range(markov_model.n_states)]
stationary_dist = markov_model.calculate_stationary_distribution()

x = np.arange(markov_model.n_states)
width = 0.35

axes[2, 2].bar(x - width/2, empirical_dist, width, label='经验分布', alpha=0.7)
axes[2, 2].bar(x + width/2, stationary_dist, width, label='平稳分布', alpha=0.7)
axes[2, 2].set_title('平稳分布 vs 经验分布')
axes[2, 2].set_xlabel('状态')
axes[2, 2].set_ylabel('概率')
axes[2, 2].legend()
axes[2, 2].grid(True, alpha=0.3, axis='y')

plt.tight_layout()
plt.show()
```

### 示例3：预测与回测

```python
class MarkovTradingStrategy:
    """
    基于马尔科夫链的交易策略
    """

    def __init__(self, markov_model, lookback_window=20):
        self.markov_model = markov_model
        self.lookback_window = lookback_window

    def generate_signals(self, returns, states):
        """
        生成交易信号

        Parameters:
        returns: 收益率序列
        states: 状态序列

        Returns:
        signals: 交易信号 (1=买入, 0=持有, -1=卖出)
        """
        n_obs = len(states)
        signals = np.zeros(n_obs)

        for t in range(self.lookback_window, n_obs):
            current_state = states[t]

            # 预测下一期状态概率
            next_state_probs = self.markov_model.predict_next_state_probs(current_state)

            # 计算期望收益率
            state_returns = []
            for s in range(self.markov_model.n_states):
                state_mask = (states[:t] == s)
                if np.any(state_mask):
                    state_returns.append(np.mean(returns[:t][state_mask]))
                else:
                    state_returns.append(0)

            expected_return = np.sum(next_state_probs * state_returns)

            # 生成信号
            if expected_return > 0.001:  # 阈值可调
                signals[t] = 1  # 买入
            elif expected_return < -0.001:
                signals[t] = -1  # 卖出
            else:
                signals[t] = 0  # 持有

        return signals

    def backtest(self, returns, states, transaction_cost=0.001):
        """
        回测策略表现

        Parameters:
        returns: 收益率序列
        states: 状态序列
        transaction_cost: 交易成本

        Returns:
        backtest_results: 回测结果
        """
        signals = self.generate_signals(returns, states)
        n_obs = len(returns)

        # 计算策略收益
        strategy_returns = np.zeros(n_obs)
        positions = np.zeros(n_obs)

        position = 0  # 初始仓位

        for t in range(1, n_obs):
            # 更新仓位
            if signals[t] != signals[t-1]:
                # 有交易发生，扣除交易成本
                strategy_returns[t] = returns[t] * signals[t] - transaction_cost
                position = signals[t]
            else:
                # 无交易，按当前仓位获得收益
                strategy_returns[t] = returns[t] * position

            positions[t] = position

        # 计算基准收益（买入持有）
        benchmark_returns = returns

        # 性能指标
        total_return_strategy = np.prod(1 + strategy_returns) - 1
        total_return_benchmark = np.prod(1 + benchmark_returns) - 1

        annual_return_strategy = (1 + total_return_strategy) ** (252 / len(returns)) - 1
        annual_return_benchmark = (1 + total_return_benchmark) ** (252 / len(returns)) - 1

        volatility_strategy = np.std(strategy_returns) * np.sqrt(252)
        volatility_benchmark = np.std(benchmark_returns) * np.sqrt(252)

        sharpe_strategy = annual_return_strategy / volatility_strategy if volatility_strategy > 0 else 0
        sharpe_benchmark = annual_return_benchmark / volatility_benchmark if volatility_benchmark > 0 else 0

        # 最大回撤
        cum_strategy = np.cumprod(1 + strategy_returns)
        cum_benchmark = np.cumprod(1 + benchmark_returns)

        max_drawdown_strategy = np.max(1 - cum_strategy / np.maximum.accumulate(cum_strategy))
        max_drawdown_benchmark = np.max(1 - cum_benchmark / np.maximum.accumulate(cum_benchmark))

        # 交易统计
        trade_count = np.sum(np.diff(signals) != 0)
        win_rate = np.mean(strategy_returns[strategy_returns != 0] > 0) if trade_count > 0 else 0

        results = {
            'strategy_returns': strategy_returns,
            'benchmark_returns': benchmark_returns,
            'signals': signals,
            'positions': positions,
            'total_return_strategy': total_return_strategy,
            'total_return_benchmark': total_return_benchmark,
            'annual_return_strategy': annual_return_strategy,
            'annual_return_benchmark': annual_return_benchmark,
            'volatility_strategy': volatility_strategy,
            'volatility_benchmark': volatility_benchmark,
            'sharpe_strategy': sharpe_strategy,
            'sharpe_benchmark': sharpe_benchmark,
            'max_drawdown_strategy': max_drawdown_strategy,
            'max_drawdown_benchmark': max_drawdown_benchmark,
            'trade_count': trade_count,
            'win_rate': win_rate
        }

        return results

# 创建交易策略
strategy = MarkovTradingStrategy(markov_model, lookback_window=30)

# 回测
print("正在进行策略回测...")
backtest_results = strategy.backtest(stock_returns.values, states)

# 打印回测结果
print("\n策略回测结果:")
print("=" * 50)
print(f"策略总收益: {backtest_results['total_return_strategy']:.2%}")
print(f"基准总收益: {backtest_results['total_return_benchmark']:.2%}")
print(f"策略年化收益: {backtest_results['annual_return_strategy']:.2%}")
print(f"基准年化收益: {backtest_results['annual_return_benchmark']:.2%}")
print(f"策略年化波动率: {backtest_results['volatility_strategy']:.2%}")
print(f"基准年化波动率: {backtest_results['volatility_benchmark']:.2%}")
print(f"策略夏普比率: {backtest_results['sharpe_strategy']:.2f}")
print(f"基准夏普比率: {backtest_results['sharpe_benchmark']:.2f}")
print(f"策略最大回撤: {backtest_results['max_drawdown_strategy']:.2%}")
print(f"基准最大回撤: {backtest_results['max_drawdown_benchmark']:.2%}")
print(f"交易次数: {backtest_results['trade_count']}")
print(f"胜率: {backtest_results['win_rate']:.1%}")

# 可视化回测结果
fig, axes = plt.subplots(2, 2, figsize=(15, 10))

# 子图1：累积收益对比
cum_strategy = np.cumprod(1 + backtest_results['strategy_returns'])
cum_benchmark = np.cumprod(1 + backtest_results['benchmark_returns'])

axes[0, 0].plot(stock_data.index[1:], cum_strategy, label='马尔科夫策略', linewidth=2)
axes[0, 0].plot(stock_data.index[1:], cum_benchmark, label='买入持有', linewidth=2)
axes[0, 0].set_title('累积收益对比')
axes[0, 0].set_ylabel('累积收益')
axes[0, 0].legend()
axes[0, 0].grid(True, alpha=0.3)

# 子图2：交易信号
axes[0, 1].plot(stock_data.index[1:], backtest_results['signals'], drawstyle='steps-post')
axes[0, 1].set_title('交易信号')
axes[0, 1].set_ylabel('信号 (1=买入, 0=持有, -1=卖出)')
axes[0, 1].set_ylim(-1.5, 1.5)
axes[0, 1].grid(True, alpha=0.3)

# 子图3：滚动收益对比
window = 60  # 60天滚动窗口
if len(backtest_results['strategy_returns']) > window:
    rolling_strategy = pd.Series(backtest_results['strategy_returns']).rolling(window).sum()
    rolling_benchmark = pd.Series(backtest_results['benchmark_returns']).rolling(window).sum()

    axes[1, 0].plot(stock_data.index[1:], rolling_strategy, label='策略', alpha=0.8)
    axes[1, 0].plot(stock_data.index[1:], rolling_benchmark, label='基准', alpha=0.8)
    axes[1, 0].set_title(f'{window}天滚动收益对比')
    axes[1, 0].set_ylabel('滚动收益')
    axes[1, 0].legend()
    axes[1, 0].grid(True, alpha=0.3)

# 子图4：收益率分布对比
axes[1, 1].hist(backtest_results['strategy_returns'], bins=50, alpha=0.7,
               density=True, label='策略收益率')
axes[1, 1].hist(backtest_results['benchmark_returns'], bins=50, alpha=0.7,
               density=True, label='基准收益率')
axes[1, 1].set_title('收益率分布对比')
axes[1, 1].set_xlabel('日收益率')
axes[1, 1].set_ylabel('密度')
axes[1, 1].legend()
axes[1, 1].grid(True, alpha=0.3)

plt.tight_layout()
plt.show()
```

### 示例4：模型诊断与验证

```python
def model_diagnostics(returns, states, markov_model, n_simulations=1000):
    """
    模型诊断和验证

    Parameters:
    returns: 实际收益率序列
    states: 拟合的状态序列
    markov_model: 马尔科夫模型
    n_simulations: 蒙特卡洛模拟次数

    Returns:
    diagnostic_results: 诊断结果
    """
    results = {}

    # 1. 残差分析
    residuals = []
    for t in range(len(states)):
        state = states[t]
        state_returns = returns[states == state]
        if len(state_returns) > 1:
            residual = returns[t] - np.mean(state_returns)
            residuals.append(residual)

    residuals = np.array(residuals)

    # 2. 似然比检验
    # 计算模型对数似然
    log_likelihood = 0
    for t in range(1, len(states)):
        current_state = states[t-1]
        next_state = states[t]
        prob = markov_model.transition_matrix[current_state, next_state]
        if prob > 0:
            log_likelihood += np.log(prob)

    # 3. 蒙特卡洛验证
    simulated_stats = []
    for _ in range(n_simulations):
        # 模拟状态路径
        sim_states = markov_model.simulate_path(states[0], len(states))

        # 计算统计量
        state_freq = [np.mean(sim_states == s) for s in range(markov_model.n_states)]
        simulated_stats.append(state_freq)

    simulated_stats = np.array(simulated_stats)

    # 实际状态频率
    actual_freq = [np.mean(states == s) for s in range(markov_model.n_states)]

    # 计算p值
    p_values = []
    for s in range(markov_model.n_states):
        p_val = np.mean(simulated_stats[:, s] >= actual_freq[s])
        p_values.append(min(p_val, 1 - p_val) * 2)  # 双侧检验

    results = {
        'residuals': residuals,
        'log_likelihood': log_likelihood,
        'simulated_stats': simulated_stats,
        'actual_frequencies': actual_freq,
        'p_values': p_values,
        'residual_stats': {
            'mean': np.mean(residuals),
            'std': np.std(residuals),
            'skewness': stats.skew(residuals),
            'kurtosis': stats.kurtosis(residuals),
            'ljung_box': stats.acorr_ljungbox(residuals, lags=10, return_df=True) if len(residuals) > 10 else None
        }
    }

    return results

# 进行模型诊断
print("正在进行模型诊断...")
diagnostics = model_diagnostics(stock_returns.values, states, markov_model)

print("\n模型诊断结果:")
print("=" * 50)
print(f"模型对数似然: {diagnostics['log_likelihood']:.2f}")
print(f"残差均值: {diagnostics['residual_stats']['mean']:.6f}")
print(f"残差标准差: {diagnostics['residual_stats']['std']:.4f}")
print(f"残差偏度: {diagnostics['residual_stats']['skewness']:.2f}")
print(f"残差峰度: {diagnostics['residual_stats']['kurtosis']:.2f}")

print(f"\n状态频率检验p值:")
for s, p_val in enumerate(diagnostics['p_values']):
    print(f"状态{s}: {p_val:.3f}")

# 可视化诊断结果
fig, axes = plt.subplots(2, 3, figsize=(18, 12))

# 子图1：残差时序图
axes[0, 0].plot(diagnostics['residuals'])
axes[0, 0].set_title('模型残差时序图')
axes[0, 0].set_ylabel('残差')
axes[0, 0].grid(True, alpha=0.3)

# 子图2：残差分布
axes[0, 1].hist(diagnostics['residuals'], bins=30, density=True, alpha=0.7)
axes[0, 1].set_title('残差分布')
axes[0, 1].set_xlabel('残差')
axes[0, 1].set_ylabel('密度')
axes[0, 1].grid(True, alpha=0.3)

# 子图3：残差Q-Q图
from scipy import stats as scipy_stats
scipy_stats.probplot(diagnostics['residuals'], dist="norm", plot=axes[0, 2])
axes[0, 2].set_title('残差Q-Q图')
axes[0, 2].grid(True, alpha=0.3)

# 子图4：状态频率验证
actual_freq = diagnostics['actual_frequencies']
sim_stats = diagnostics['simulated_stats']

for s in range(markov_model.n_states):
    axes[1, 0].hist(sim_stats[:, s], bins=30, alpha=0.6, density=True,
                   label=f'状态{s}模拟')
    axes[1, 0].axvline(actual_freq[s], color=f'C{s}', linestyle='--',
                      label=f'状态{s}实际')

axes[1, 0].set_title('状态频率验证')
axes[1, 0].set_xlabel('频率')
axes[1, 0].set_ylabel('密度')
axes[1, 0].legend()
axes[1, 0].grid(True, alpha=0.3)

# 子图5：转移概率热图
im = axes[1, 1].imshow(markov_model.transition_matrix, cmap='RdBu_r', aspect='auto')
axes[1, 1].set_title('转移概率矩阵热图')
axes[1, 1].set_xlabel('下一状态')
axes[1, 1].set_ylabel('当前状态')
plt.colorbar(im, ax=axes[1, 1])

# 子图6：模型拟合度
fitted_probs = []
for t in range(1, len(states)):
    current_state = states[t-1]
    next_state = states[t]
    prob = markov_model.transition_matrix[current_state, next_state]
    fitted_probs.append(prob)

axes[1, 2].hist(fitted_probs, bins=20, density=True, alpha=0.7)
axes[1, 2].set_title('转移概率分布')
axes[1, 2].set_xlabel('转移概率')
axes[1, 2].set_ylabel('密度')
axes[1, 2].grid(True, alpha=0.3)

plt.tight_layout()
plt.show()

# Ljung-Box检验结果
if diagnostics['residual_stats']['ljung_box'] is not None:
    print(f"\nLjung-Box检验结果（残差自相关性）:")
    lb_results = diagnostics['residual_stats']['ljung_box']
    for lag in range(min(5, len(lb_results))):
        p_value = lb_results.iloc[lag]['lb_pvalue']
        print(f"滞后{lag+1}期: p值 = {p_value:.4f}")
```

## 理论分析

### 股票价格的马尔科夫建模理论

**状态空间设计**：
选择状态数量 $k$ 需要平衡：
- **拟合度**：更多状态提供更好的拟合
- **参数效率**：状态数过多导致参数过多
- **样本充足性**：每个状态需要足够的观测

**信息准则**：
$$\text{AIC} = -2\log L + 2p$$
$$\text{BIC} = -2\log L + p\log n$$

其中 $p = k^2 + k - 1$ 是自由参数个数。

### 预测性能评估

**状态预测准确率**：
$$\text{Accuracy} = \frac{1}{T-1}\sum_{t=1}^{T-1} \mathbf{1}_{\{\hat{S}_{t+1} = S_{t+1}\}}$$

**概率校准**：
$$\text{Brier Score} = \frac{1}{T-1}\sum_{t=1}^{T-1}\sum_{j=1}^k (\hat{p}_{t,j} - \mathbf{1}_{\{S_{t+1}=j\}})^2$$

### 风险管理应用

**动态VaR**：
$$\text{VaR}_t(\alpha) = \inf\{x : \sum_{j=1}^k P(S_{t+1}=j|S_t) \cdot P(R_{t+1} \leq x | S_{t+1}=j) \geq \alpha\}$$

**期望损失**：
$$\text{ES}_t(\alpha) = \sum_{j=1}^k P(S_{t+1}=j|S_t) \cdot \text{ES}_j(\alpha)$$

## 数学公式总结

1. **转移概率估计**：$\hat{P}_{ij} = \frac{N_{ij}}{\sum_k N_{ik}}$

2. **对数似然函数**：$\ell = \sum_{t=1}^{T-1} \log P_{S_t, S_{t+1}}$

3. **平稳分布**：$\pi = \pi P$

4. **期望持续时间**：$E[D_i] = \frac{1}{1-P_{ii}}$

5. **条件期望收益**：$E[R_{t+1}|S_t=i] = \sum_j \mu_j P_{ij}$

::: warning 实践注意事项
- 状态划分方法显著影响模型性能
- 需要充足的历史数据支持参数估计
- 模型假设市场制度的平稳性
- 交易成本对策略收益有重要影响
:::