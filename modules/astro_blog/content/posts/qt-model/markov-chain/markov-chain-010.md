---
title: "第10章：利率期限结构建模实践"
date: 2025-10-02
icon: circle-dot
author: Haiyue
category:
  - markov-chain
star: false
---
# 第10章：利率期限结构建模实践

::: tip 学习目标
- 实现Hull-White利率模型
- 建立基于马尔科夫的利率树
- 进行债券和衍生品定价
- 分析利率风险管理
:::

## 知识点总结

### 1. 利率期限结构基础

利率期限结构描述了不同期限的无风险利率之间的关系。在马尔科夫框架下，我们将利率建模为一个连续时间马尔科夫过程。

**即期利率曲线**：
$$r(T) = \text{时刻0到期限T的即期利率}$$

**远期利率**：
$$f(t,T) = \text{在时刻t看时刻T的瞬时远期利率}$$

**关系式**：
$$f(0,T) = r(T) + T \frac{dr(T)}{dT}$$

### 2. Hull-White模型

Hull-White模型是最常用的单因子利率模型，描述短期利率的动态：

**随机微分方程**：
$$dr_t = (\theta(t) - a r_t)dt + \sigma dW_t$$

其中：
- $r_t$ 是短期利率
- $\theta(t)$ 是时变的均值回复水平
- $a$ 是均值回复速度
- $\sigma$ 是波动率
- $W_t$ 是布朗运动

```mermaid
graph TD
    A[短期利率 r₀] --> B[时刻 t₁]
    B --> C[时刻 t₂]
    C --> D[时刻 t₃]
    D --> E[时刻 T]

    A -.->|θ(t)| F[均值回复水平]
    B -.->|θ(t)| F
    C -.->|θ(t)| F
    D -.->|θ(t)| F

    style F fill:#e8f5e8
    style A fill:#e1f5fe
    style E fill:#fff3e0
```

### 3. 债券定价公式

在Hull-White模型下，零息债券价格有解析解：

$$P(t,T) = A(t,T) e^{-B(t,T) r_t}$$

其中：
$$B(t,T) = \frac{1-e^{-a(T-t)}}{a}$$

$$A(t,T) = \exp\left(\int_t^T \theta(s) B(s,T) ds - \frac{\sigma^2}{2a^2}(B(t,T) - T + t)\left(1 - e^{-2a(T-t)}\right)\right)$$

### 4. 利率树构建

为了定价复杂衍生品，我们构建离散的利率树：

**三叉树方法**：
- 每个节点有三个分支：上升、平稳、下降
- 分支概率根据模型参数计算
- 确保树的收敛性和数值稳定性

## 示例代码

### 示例1：Hull-White模型实现

```python
import numpy as np
import matplotlib.pyplot as plt
from scipy.optimize import minimize
from scipy.interpolate import interp1d
import pandas as pd

class HullWhiteModel:
    """
    Hull-White单因子利率模型
    """

    def __init__(self, a=0.1, sigma=0.01):
        """
        初始化Hull-White模型

        Parameters:
        a: 均值回复速度
        sigma: 波动率
        """
        self.a = a
        self.sigma = sigma
        self.theta = None  # 时变函数，通过校准确定

    def set_theta_function(self, theta_func):
        """设置theta函数"""
        self.theta = theta_func

    def bond_price(self, r, t, T):
        """
        计算零息债券价格

        Parameters:
        r: 当前短期利率
        t: 当前时间
        T: 到期时间

        Returns:
        债券价格
        """
        if t >= T:
            return 1.0

        tau = T - t
        B = (1 - np.exp(-self.a * tau)) / self.a if self.a != 0 else tau

        # 简化的A(t,T)计算（假设theta为常数）
        if self.theta is None:
            theta_avg = 0.03  # 假设平均theta为3%
        else:
            theta_avg = self.theta(t) if callable(self.theta) else self.theta

        A = np.exp(theta_avg * B - self.sigma**2 / (4 * self.a) * B**2 * (1 - np.exp(-2 * self.a * tau)))

        return A * np.exp(-B * r)

    def simulate_paths(self, r0, T, n_steps, n_paths, theta_func=None):
        """
        蒙特卡洛模拟利率路径

        Parameters:
        r0: 初始利率
        T: 总时间
        n_steps: 时间步数
        n_paths: 路径数
        theta_func: theta函数

        Returns:
        时间网格和利率路径
        """
        dt = T / n_steps
        times = np.linspace(0, T, n_steps + 1)
        rates = np.zeros((n_paths, n_steps + 1))
        rates[:, 0] = r0

        for i in range(n_steps):
            t = times[i]
            theta_t = theta_func(t) if theta_func else 0.03

            # 欧拉-马尔科夫方法
            dW = np.random.normal(0, np.sqrt(dt), n_paths)
            dr = (theta_t - self.a * rates[:, i]) * dt + self.sigma * dW
            rates[:, i + 1] = rates[:, i] + dr

        return times, rates

    def calibrate_to_yield_curve(self, market_yields, maturities):
        """
        校准模型到市场收益率曲线

        Parameters:
        market_yields: 市场收益率
        maturities: 对应期限

        Returns:
        校准后的参数
        """
        def objective(params):
            a_new, sigma_new = params
            model_yields = []

            for T in maturities:
                # 使用当前参数计算模型收益率
                # 这里简化处理，实际应该用更复杂的校准方法
                r0 = market_yields[0]  # 假设r0为最短期利率
                price = self.bond_price_analytical(r0, 0, T, a_new, sigma_new)
                yield_model = -np.log(price) / T if T > 0 else r0
                model_yields.append(yield_model)

            # 计算误差
            model_yields = np.array(model_yields)
            return np.sum((market_yields - model_yields)**2)

        # 优化
        initial_guess = [self.a, self.sigma]
        bounds = [(0.01, 1.0), (0.001, 0.1)]
        result = minimize(objective, initial_guess, bounds=bounds, method='L-BFGS-B')

        if result.success:
            self.a, self.sigma = result.x
            return result.x
        else:
            print("校准失败")
            return None

    def bond_price_analytical(self, r, t, T, a=None, sigma=None):
        """解析解计算债券价格（简化版）"""
        a = a or self.a
        sigma = sigma or self.sigma

        tau = T - t
        if tau <= 0:
            return 1.0

        B = (1 - np.exp(-a * tau)) / a if a != 0 else tau
        A = np.exp(-sigma**2 / (4 * a) * B**2 * (1 - np.exp(-2 * a * tau)))

        return A * np.exp(-B * r)

def generate_sample_yield_curve():
    """生成示例收益率曲线"""
    maturities = np.array([0.25, 0.5, 1, 2, 3, 5, 7, 10, 15, 20, 30])

    # Nelson-Siegel模型参数
    beta0, beta1, beta2, tau = 0.04, -0.01, 0.02, 2.0

    yields = beta0 + beta1 * (1 - np.exp(-maturities/tau)) / (maturities/tau) + \
             beta2 * ((1 - np.exp(-maturities/tau)) / (maturities/tau) - np.exp(-maturities/tau))

    return maturities, yields

# 生成示例收益率曲线
maturities, market_yields = generate_sample_yield_curve()

print("示例收益率曲线:")
yield_df = pd.DataFrame({
    '期限(年)': maturities,
    '收益率(%)': market_yields * 100
})
print(yield_df)

# 创建Hull-White模型
hw_model = HullWhiteModel(a=0.1, sigma=0.01)

print(f"\n初始参数:")
print(f"均值回复速度 a: {hw_model.a}")
print(f"波动率 σ: {hw_model.sigma}")

# 校准模型
print(f"\n正在校准模型到市场收益率曲线...")
calibrated_params = hw_model.calibrate_to_yield_curve(market_yields, maturities)

if calibrated_params is not None:
    print(f"校准后参数:")
    print(f"均值回复速度 a: {calibrated_params[0]:.4f}")
    print(f"波动率 σ: {calibrated_params[1]:.4f}")
```

### 示例2：利率路径模拟和可视化

```python
# 设置theta函数（简化为常数）
def theta_function(t):
    return 0.03 + 0.01 * np.sin(2 * np.pi * t)  # 周期性变化的theta

hw_model.set_theta_function(theta_function)

# 模拟利率路径
r0 = market_yields[0]  # 初始利率
T = 10  # 模拟10年
n_steps = 1000
n_paths = 1000

print(f"\n模拟参数:")
print(f"初始利率: {r0:.2%}")
print(f"模拟期间: {T}年")
print(f"时间步数: {n_steps}")
print(f"路径数: {n_paths}")

times, rate_paths = hw_model.simulate_paths(r0, T, n_steps, n_paths, theta_function)

# 可视化利率路径
fig, axes = plt.subplots(2, 2, figsize=(15, 12))

# 子图1：部分利率路径
axes[0, 0].plot(times, rate_paths[:50].T, alpha=0.3, linewidth=0.5)
axes[0, 0].plot(times, np.mean(rate_paths, axis=0), 'r-', linewidth=2, label='平均路径')
axes[0, 0].set_title('Hull-White模型利率路径样本')
axes[0, 0].set_xlabel('时间(年)')
axes[0, 0].set_ylabel('利率')
axes[0, 0].legend()
axes[0, 0].grid(True, alpha=0.3)

# 子图2：利率分布演化
time_points = [1, 3, 5, 10]
colors = ['blue', 'green', 'orange', 'red']

for i, (t_point, color) in enumerate(zip(time_points, colors)):
    t_idx = int(t_point * n_steps / T)
    rates_at_t = rate_paths[:, t_idx]
    axes[0, 1].hist(rates_at_t, bins=50, alpha=0.6, density=True,
                   color=color, label=f't={t_point}年')

axes[0, 1].set_title('不同时点的利率分布')
axes[0, 1].set_xlabel('利率')
axes[0, 1].set_ylabel('密度')
axes[0, 1].legend()
axes[0, 1].grid(True, alpha=0.3)

# 子图3：利率统计特征随时间变化
mean_rates = np.mean(rate_paths, axis=0)
std_rates = np.std(rate_paths, axis=0)
percentile_5 = np.percentile(rate_paths, 5, axis=0)
percentile_95 = np.percentile(rate_paths, 95, axis=0)

axes[1, 0].plot(times, mean_rates, 'b-', linewidth=2, label='均值')
axes[1, 0].fill_between(times, percentile_5, percentile_95, alpha=0.3,
                       color='blue', label='90%置信区间')
axes[1, 0].plot(times, mean_rates + 2*std_rates, 'r--', alpha=0.7, label='均值±2σ')
axes[1, 0].plot(times, mean_rates - 2*std_rates, 'r--', alpha=0.7)
axes[1, 0].set_title('利率统计特征演化')
axes[1, 0].set_xlabel('时间(年)')
axes[1, 0].set_ylabel('利率')
axes[1, 0].legend()
axes[1, 0].grid(True, alpha=0.3)

# 子图4：收益率曲线比较
model_maturities = np.linspace(0.25, 10, 20)
model_yields = []

for T in model_maturities:
    # 计算模型预测的收益率
    price = hw_model.bond_price(r0, 0, T)
    model_yield = -np.log(price) / T if T > 0 else r0
    model_yields.append(model_yield)

axes[1, 1].plot(maturities, market_yields * 100, 'bo-', label='市场收益率', markersize=6)
axes[1, 1].plot(model_maturities, np.array(model_yields) * 100, 'r-',
               label='Hull-White模型', linewidth=2)
axes[1, 1].set_title('收益率曲线对比')
axes[1, 1].set_xlabel('期限(年)')
axes[1, 1].set_ylabel('收益率(%)')
axes[1, 1].legend()
axes[1, 1].grid(True, alpha=0.3)

plt.tight_layout()
plt.show()

# 计算利率统计信息
print(f"\n利率路径统计信息:")
print(f"初始利率: {r0:.2%}")
print(f"10年后平均利率: {mean_rates[-1]:.2%}")
print(f"10年后利率标准差: {std_rates[-1]:.2%}")
print(f"10年后利率范围: [{percentile_5[-1]:.2%}, {percentile_95[-1]:.2%}]")
```

### 示例3：三叉树利率模型

```python
class TrinomialTree:
    """
    Hull-White模型的三叉树实现
    """

    def __init__(self, hw_model, T, n_steps):
        """
        初始化三叉树

        Parameters:
        hw_model: Hull-White模型
        T: 总时间
        n_steps: 时间步数
        """
        self.hw_model = hw_model
        self.T = T
        self.n_steps = n_steps
        self.dt = T / n_steps
        self.tree = {}
        self.probabilities = {}

    def build_tree(self, r0):
        """构建利率树"""
        # 时间步长
        dt = self.dt
        a = self.hw_model.a
        sigma = self.hw_model.sigma

        # 空间步长
        dr = sigma * np.sqrt(3 * dt)

        # 初始化树
        self.tree[0] = {0: r0}
        self.probabilities[0] = {0: 1.0}

        # 构建树的每一层
        for i in range(self.n_steps):
            self.tree[i + 1] = {}
            self.probabilities[i + 1] = {}

            for j in self.tree[i]:
                r = self.tree[i][j]
                prob = self.probabilities[i][j]

                # 计算均值回复的漂移
                theta_t = 0.03  # 简化为常数
                drift = (theta_t - a * r) * dt

                # 三个分支的利率值
                r_up = r + drift + dr
                r_mid = r + drift
                r_down = r + drift - dr

                # 计算分支概率
                # 这是简化版本，实际应该更精确地匹配矩
                p_up = 1/6 + (r * a * dt - drift)**2 / (2 * dr**2) + (r * a * dt - drift) / (2 * dr)
                p_down = 1/6 + (r * a * dt - drift)**2 / (2 * dr**2) - (r * a * dt - drift) / (2 * dr)
                p_mid = 2/3 - (r * a * dt - drift)**2 / (dr**2)

                # 确保概率为正且和为1
                p_up = max(0, min(1, p_up))
                p_down = max(0, min(1, p_down))
                p_mid = max(0, min(1, 1 - p_up - p_down))

                # 归一化
                total_prob = p_up + p_mid + p_down
                if total_prob > 0:
                    p_up /= total_prob
                    p_mid /= total_prob
                    p_down /= total_prob

                # 添加到树中
                for k, (r_new, p_new) in enumerate([(r_up, p_up), (r_mid, p_mid), (r_down, p_down)]):
                    node_id = 3 * j + k

                    if node_id in self.tree[i + 1]:
                        self.probabilities[i + 1][node_id] += prob * p_new
                    else:
                        self.tree[i + 1][node_id] = r_new
                        self.probabilities[i + 1][node_id] = prob * p_new

    def price_zero_coupon_bond(self, face_value=1.0):
        """
        使用树定价零息债券

        Parameters:
        face_value: 面值

        Returns:
        债券价格
        """
        # 从到期日向前推
        bond_values = {}

        # 到期日价值
        for j in self.tree[self.n_steps]:
            bond_values[(self.n_steps, j)] = face_value

        # 向前递推
        for i in range(self.n_steps - 1, -1, -1):
            for j in self.tree[i]:
                r = self.tree[i][j]

                # 计算期望值
                expected_value = 0
                for k in range(3):  # 三个分支
                    next_node = 3 * j + k
                    if next_node in self.tree[i + 1]:
                        # 分支概率（简化计算）
                        p = 1/3  # 简化为等概率
                        expected_value += p * bond_values.get((i + 1, next_node), 0)

                # 贴现
                bond_values[(i, j)] = expected_value * np.exp(-r * self.dt)

        return bond_values[(0, 0)]

    def price_bond_option(self, strike, option_type='call', bond_maturity=None):
        """
        定价债券期权

        Parameters:
        strike: 执行价格
        option_type: 期权类型 ('call' or 'put')
        bond_maturity: 标的债券到期日

        Returns:
        期权价格
        """
        if bond_maturity is None:
            bond_maturity = self.T

        # 期权价值
        option_values = {}

        # 到期日价值
        for j in self.tree[self.n_steps]:
            r = self.tree[self.n_steps][j]

            # 计算标的债券价值
            bond_price = self.hw_model.bond_price(r, self.T, bond_maturity)

            # 期权内在价值
            if option_type == 'call':
                payoff = max(0, bond_price - strike)
            else:
                payoff = max(0, strike - bond_price)

            option_values[(self.n_steps, j)] = payoff

        # 向前递推
        for i in range(self.n_steps - 1, -1, -1):
            for j in self.tree[i]:
                r = self.tree[i][j]

                # 计算期望值
                expected_value = 0
                for k in range(3):
                    next_node = 3 * j + k
                    if next_node in self.tree[i + 1]:
                        p = 1/3  # 简化为等概率
                        expected_value += p * option_values.get((i + 1, next_node), 0)

                # 贴现
                option_values[(i, j)] = expected_value * np.exp(-r * self.dt)

        return option_values[(0, 0)]

# 创建三叉树
tree = TrinomialTree(hw_model, T=2, n_steps=20)
tree.build_tree(r0)

# 定价零息债券
zcb_price = tree.price_zero_coupon_bond()
analytical_price = hw_model.bond_price(r0, 0, 2)

print(f"\n零息债券定价比较 (2年期):")
print(f"三叉树价格: {zcb_price:.6f}")
print(f"解析解价格: {analytical_price:.6f}")
print(f"价格差异: {abs(zcb_price - analytical_price):.6f}")

# 定价债券期权
call_price = tree.price_bond_option(strike=0.9, option_type='call', bond_maturity=3)
put_price = tree.price_bond_option(strike=0.9, option_type='put', bond_maturity=3)

print(f"\n债券期权定价 (执行价=0.9, 标的3年期债券):")
print(f"看涨期权价格: {call_price:.6f}")
print(f"看跌期权价格: {put_price:.6f}")

# 验证看涨看跌平价关系
current_bond_price = hw_model.bond_price(r0, 0, 3)
strike = 0.9
discount_factor = hw_model.bond_price(r0, 0, 2)

put_call_parity_diff = call_price - put_price - (current_bond_price - strike * discount_factor)
print(f"看涨看跌平价验证误差: {put_call_parity_diff:.8f}")
```

### 示例4：利率风险管理

```python
class InterestRateRiskManager:
    """
    利率风险管理工具
    """

    def __init__(self, hw_model):
        self.hw_model = hw_model

    def calculate_duration(self, bond_cashflows, bond_times, current_rate):
        """
        计算修正久期

        Parameters:
        bond_cashflows: 债券现金流
        bond_times: 现金流时间
        current_rate: 当前利率

        Returns:
        修正久期
        """
        # 当前债券价格
        current_price = sum(cf * self.hw_model.bond_price(current_rate, 0, t)
                           for cf, t in zip(bond_cashflows, bond_times))

        # 计算利率微小变化时的价格变化
        dr = 0.0001  # 1个基点
        price_up = sum(cf * self.hw_model.bond_price(current_rate + dr, 0, t)
                      for cf, t in zip(bond_cashflows, bond_times))
        price_down = sum(cf * self.hw_model.bond_price(current_rate - dr, 0, t)
                        for cf, t in zip(bond_cashflows, bond_times))

        # 修正久期
        modified_duration = -(price_up - price_down) / (2 * dr * current_price)
        return modified_duration, current_price

    def calculate_convexity(self, bond_cashflows, bond_times, current_rate):
        """计算凸性"""
        dr = 0.0001
        current_price = sum(cf * self.hw_model.bond_price(current_rate, 0, t)
                           for cf, t in zip(bond_cashflows, bond_times))

        price_up = sum(cf * self.hw_model.bond_price(current_rate + dr, 0, t)
                      for cf, t in zip(bond_cashflows, bond_times))
        price_down = sum(cf * self.hw_model.bond_price(current_rate - dr, 0, t)
                        for cf, t in zip(bond_cashflows, bond_times))

        convexity = (price_up + price_down - 2 * current_price) / (dr**2 * current_price)
        return convexity

    def portfolio_risk_analysis(self, portfolio):
        """
        投资组合利率风险分析

        Parameters:
        portfolio: 投资组合信息 [{'weight': w, 'cashflows': cf, 'times': t}, ...]

        Returns:
        风险指标
        """
        current_rate = 0.03  # 假设当前利率

        portfolio_duration = 0
        portfolio_convexity = 0
        portfolio_value = 0

        bond_details = []

        for bond in portfolio:
            weight = bond['weight']
            cashflows = bond['cashflows']
            times = bond['times']

            # 计算单个债券的风险指标
            duration, price = self.calculate_duration(cashflows, times, current_rate)
            convexity = self.calculate_convexity(cashflows, times, current_rate)

            # 计算权重
            bond_value = weight * price
            portfolio_value += bond_value

            bond_details.append({
                'weight': weight,
                'price': price,
                'duration': duration,
                'convexity': convexity,
                'value': bond_value
            })

        # 计算投资组合加权平均
        for bond in bond_details:
            value_weight = bond['value'] / portfolio_value
            portfolio_duration += value_weight * bond['duration']
            portfolio_convexity += value_weight * bond['convexity']

        return {
            'portfolio_duration': portfolio_duration,
            'portfolio_convexity': portfolio_convexity,
            'portfolio_value': portfolio_value,
            'bond_details': bond_details
        }

    def hedge_ratio(self, hedged_instrument, hedging_instrument, current_rate):
        """计算对冲比率"""
        # 计算被对冲工具的久期
        duration_hedged, price_hedged = self.calculate_duration(
            hedged_instrument['cashflows'],
            hedged_instrument['times'],
            current_rate
        )

        # 计算对冲工具的久期
        duration_hedging, price_hedging = self.calculate_duration(
            hedging_instrument['cashflows'],
            hedging_instrument['times'],
            current_rate
        )

        # 对冲比率
        hedge_ratio = (duration_hedged * price_hedged) / (duration_hedging * price_hedging)

        return hedge_ratio

# 创建风险管理器
risk_manager = InterestRateRiskManager(hw_model)

# 定义示例投资组合
portfolio = [
    {
        'weight': 1000000,  # 100万面值
        'cashflows': [50000, 50000, 50000, 1050000],  # 5%年息，3年期
        'times': [1, 2, 3, 3]
    },
    {
        'weight': 2000000,  # 200万面值
        'cashflows': [40000, 40000, 40000, 40000, 40000, 1040000],  # 4%年息，5年期
        'times': [1, 2, 3, 4, 5, 5]
    },
    {
        'weight': 1500000,  # 150万面值零息债券
        'cashflows': [1500000],  # 10年期零息债券
        'times': [10]
    }
]

# 进行风险分析
risk_analysis = risk_manager.portfolio_risk_analysis(portfolio)

print(f"\n投资组合利率风险分析:")
print("=" * 50)
print(f"投资组合总价值: {risk_analysis['portfolio_value']:,.0f}")
print(f"投资组合修正久期: {risk_analysis['portfolio_duration']:.2f}")
print(f"投资组合凸性: {risk_analysis['portfolio_convexity']:.2f}")

print(f"\n各债券详细信息:")
for i, bond in enumerate(risk_analysis['bond_details']):
    print(f"债券{i+1}:")
    print(f"  面值: {bond['weight']:,.0f}")
    print(f"  当前价值: {bond['value']:,.0f}")
    print(f"  修正久期: {bond['duration']:.2f}")
    print(f"  凸性: {bond['convexity']:.2f}")

# 利率冲击分析
rate_shocks = [-0.02, -0.01, -0.005, 0, 0.005, 0.01, 0.02]  # 利率变化
portfolio_values = []

current_rate = 0.03
base_value = risk_analysis['portfolio_value']

for shock in rate_shocks:
    new_rate = current_rate + shock
    shocked_value = 0

    for bond in portfolio:
        bond_value = sum(cf * hw_model.bond_price(new_rate, 0, t)
                        for cf, t in zip(bond['cashflows'], bond['times']))
        shocked_value += bond['weight'] / bond['cashflows'][-1] * bond_value  # 调整权重

    portfolio_values.append(shocked_value)

# 可视化利率风险
plt.figure(figsize=(12, 8))

# 子图1：利率冲击分析
plt.subplot(2, 2, 1)
pnl_values = [(val - base_value) / base_value * 100 for val in portfolio_values]
plt.plot(np.array(rate_shocks) * 100, pnl_values, 'bo-', linewidth=2, markersize=6)
plt.title('投资组合利率敏感性分析')
plt.xlabel('利率变化 (基点)')
plt.ylabel('组合价值变化 (%)')
plt.grid(True, alpha=0.3)

# 使用久期和凸性的近似公式
duration_approx = []
for shock in rate_shocks:
    approx_change = (-risk_analysis['portfolio_duration'] * shock +
                    0.5 * risk_analysis['portfolio_convexity'] * shock**2) * 100
    duration_approx.append(approx_change)

plt.plot(np.array(rate_shocks) * 100, duration_approx, 'r--',
         linewidth=2, label='久期+凸性近似')
plt.legend()

# 子图2：各债券久期分布
plt.subplot(2, 2, 2)
durations = [bond['duration'] for bond in risk_analysis['bond_details']]
weights = [bond['value']/risk_analysis['portfolio_value'] for bond in risk_analysis['bond_details']]
labels = [f'债券{i+1}' for i in range(len(durations))]

plt.bar(labels, durations, color=['blue', 'green', 'orange'], alpha=0.7)
plt.title('各债券修正久期')
plt.ylabel('修正久期')
plt.grid(True, alpha=0.3, axis='y')

# 在柱状图上添加权重信息
for i, (dur, weight) in enumerate(zip(durations, weights)):
    plt.text(i, dur + 0.1, f'权重: {weight:.1%}', ha='center', va='bottom')

# 子图3：收益率曲线移动情景
plt.subplot(2, 2, 3)
scenarios = {
    '平行上移+100bp': 0.01,
    '平行下移-100bp': -0.01,
    '陡峭化': 0,  # 简化处理
    '平坦化': 0   # 简化处理
}

scenario_impacts = []
for scenario, shock in scenarios.items():
    if scenario in ['平行上移+100bp', '平行下移-100bp']:
        impact = (-risk_analysis['portfolio_duration'] * shock +
                 0.5 * risk_analysis['portfolio_convexity'] * shock**2) * 100
    else:
        impact = 0  # 简化处理，实际需要更复杂的计算
    scenario_impacts.append(impact)

colors = ['red' if x < 0 else 'green' for x in scenario_impacts]
plt.bar(range(len(scenarios)), scenario_impacts, color=colors, alpha=0.7)
plt.title('不同利率情景下的组合影响')
plt.xticks(range(len(scenarios)), scenarios.keys(), rotation=45)
plt.ylabel('价值变化 (%)')
plt.grid(True, alpha=0.3, axis='y')

# 子图4：对冲策略分析
plt.subplot(2, 2, 4)
hedge_instruments = ['2年期国债', '5年期国债', '10年期国债', '30年期国债']
hedge_durations = [1.9, 4.5, 8.5, 18.0]  # 假设久期
hedge_effectiveness = []

for dur in hedge_durations:
    # 简化的对冲有效性计算
    effectiveness = 1 - abs(risk_analysis['portfolio_duration'] - dur) / risk_analysis['portfolio_duration']
    effectiveness = max(0, effectiveness)
    hedge_effectiveness.append(effectiveness)

plt.bar(hedge_instruments, hedge_effectiveness, color='purple', alpha=0.7)
plt.title('不同对冲工具的有效性')
plt.ylabel('对冲有效性')
plt.xticks(rotation=45)
plt.grid(True, alpha=0.3, axis='y')

plt.tight_layout()
plt.show()

print(f"\n利率风险管理建议:")
print(f"1. 投资组合久期为 {risk_analysis['portfolio_duration']:.2f}，对利率变化较敏感")
print(f"2. 利率上升100bp将导致组合价值下降约 {risk_analysis['portfolio_duration']:.1f}%")
print(f"3. 建议使用久期接近的工具进行对冲")
print(f"4. 凸性为正值，对利率下降更有利")
```

## 理论分析

### Hull-White模型的数学性质

**均值回复性质**：
Hull-White模型的解为：
$$r_t = r_0 e^{-at} + \int_0^t \theta(s) e^{-a(t-s)} ds + \sigma \int_0^t e^{-a(t-s)} dW_s$$

**方差结构**：
$$\text{Var}(r_t) = \frac{\sigma^2}{2a}(1-e^{-2at})$$

**长期方差**：
$$\lim_{t \to \infty} \text{Var}(r_t) = \frac{\sigma^2}{2a}$$

### 债券定价的仿射性质

Hull-White模型属于仿射期限结构模型，债券价格具有指数仿射形式：
$$P(t,T) = \exp(A(t,T) - B(t,T) r_t)$$

这使得：
1. 债券价格有解析解
2. 利率衍生品定价相对简单
3. 校准过程更加高效

### 利率树的收敛性

三叉树方法的收敛条件：
1. **稳定性条件**：$\Delta t \leq \frac{1}{a}$
2. **概率非负性**：所有分支概率 $\geq 0$
3. **矩匹配**：正确匹配前两阶矩

## 数学公式总结

1. **Hull-White SDE**：$dr_t = (\theta(t) - ar_t)dt + \sigma dW_t$

2. **债券价格公式**：$P(t,T) = A(t,T)e^{-B(t,T)r_t}$

3. **B函数**：$B(t,T) = \frac{1-e^{-a(T-t)}}{a}$

4. **修正久期**：$D_{mod} = -\frac{1}{P}\frac{\partial P}{\partial r}$

5. **凸性**：$C = \frac{1}{P}\frac{\partial^2 P}{\partial r^2}$

6. **对冲比率**：$h = \frac{D_H \cdot P_H}{D_I \cdot P_I}$

::: warning 模型应用注意事项
- Hull-White模型假设利率可以为负，在低利率环境下需要谨慎
- 模型校准需要高质量的市场数据
- 三叉树的精度与计算时间需要权衡
- 实际应用中需要考虑流动性和信用风险
- 模型参数需要定期重新校准
:::