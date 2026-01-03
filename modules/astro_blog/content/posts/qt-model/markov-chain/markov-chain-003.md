---
title: "第3章：连续时间马尔科夫过程"
date: 2025-10-02
icon: circle-dot
author: Haiyue
category:
  - markov-chain
star: false
---
# 第3章：连续时间马尔科夫过程

## 3.1 连续时间马尔科夫过程的定义

### 3.1.1 基本定义
设 $\{X(t), t \geq 0\}$ 是定义在连续时间集合上的随机过程，状态空间为 $S$。如果对于任意的 $0 \leq t_0 < t_1 < \cdots < t_n < t$ 和任意状态 $i_0, i_1, \ldots, i_n, j \in S$，有：

$$P(X(t) = j | X(t_0) = i_0, X(t_1) = i_1, \ldots, X(t_n) = i_n) = P(X(t) = j | X(t_n) = i_n)$$

则称 $\{X(t)\}$ 为连续时间马尔科夫过程。

### 3.1.2 齐次性
如果转移概率只依赖于时间间隔而不依赖于起始时间，即：
$$P(X(t+s) = j | X(s) = i) = P(X(t) = j | X(0) = i)$$

则称为**时间齐次连续时间马尔科夫过程**。

### 3.1.3 右连续性
连续时间马尔科夫过程通常假设路径是右连续的，即：
$$\lim_{s \downarrow t} X(s) = X(t)$$

这保证了过程的数学处理的完整性。

## 3.2 转移函数和生成矩阵

### 3.2.1 转移函数
定义转移函数：
$$P_{ij}(t) = P(X(t) = j | X(0) = i), \quad t \geq 0$$

**性质**：
1. **初始条件**：$P_{ij}(0) = \delta_{ij}$（Kronecker delta）
2. **Chapman-Kolmogorov方程**：
   $$P_{ij}(s+t) = \sum_{k \in S} P_{ik}(s) P_{kj}(t)$$
3. **矩阵形式**：$P(s+t) = P(s)P(t)$

### 3.2.2 生成矩阵（Q矩阵）
**定义**：生成矩阵 $Q = (q_{ij})$ 定义为：
$$q_{ij} = \lim_{h \downarrow 0} \frac{P_{ij}(h) - \delta_{ij}}{h}$$

**物理意义**：
- $q_{ii} = -\sum_{j \neq i} q_{ij}$：从状态 $i$ 的总离开率
- $q_{ij}$ (当 $i \neq j$)：从状态 $i$ 跳转到状态 $j$ 的瞬时转移率

### 3.2.3 Kolmogorov微分方程

**前向方程**：
$$\frac{d}{dt} P_{ij}(t) = \sum_{k \in S} P_{ik}(t) q_{kj}$$

**后向方程**：
$$\frac{d}{dt} P_{ij}(t) = \sum_{k \in S} q_{ik} P_{kj}(t)$$

**矩阵形式**：
$$\frac{d}{dt} P(t) = P(t) Q = Q P(t)$$

**解**：
$$P(t) = e^{Qt} = \sum_{n=0}^{\infty} \frac{(Qt)^n}{n!}$$

## 3.3 泊松过程

### 3.3.1 定义与性质
**泊松过程** $\{N(t), t \geq 0\}$ 是计数过程，具有以下性质：

1. **独立增量**：不相交时间区间内的增量相互独立
2. **平稳增量**：增量的分布只依赖于时间间隔长度
3. **有限性**：在有限时间内事件数目有限

```mermaid
graph LR
    A[t=0] -->|λh| B[事件发生]
    A -->|1-λh| C[无事件]
    B --> D[N(t+h) = N(t) + 1]
    C --> E[N(t+h) = N(t)]
```

### 3.3.2 数学特征
对于强度为 $\lambda$ 的泊松过程：

**概率质量函数**：
$$P(N(t) = n) = \frac{(\lambda t)^n e^{-\lambda t}}{n!}, \quad n = 0, 1, 2, \ldots$$

**期望和方差**：
$$E[N(t)] = \lambda t, \quad \text{Var}[N(t)] = \lambda t$$

**到达时间间隔**：
设 $T_n$ 为第 $n$ 次事件的到达时间，则到达时间间隔 $S_n = T_n - T_{n-1}$ 服从参数为 $\lambda$ 的指数分布：
$$f_{S_n}(s) = \lambda e^{-\lambda s}, \quad s > 0$$

### 3.3.3 复合泊松过程
**定义**：设 $\{N(t)\}$ 是强度为 $\lambda$ 的泊松过程，$\{Y_i\}$ 是独立同分布的随机变量序列，则：
$$X(t) = \sum_{i=1}^{N(t)} Y_i$$

称为复合泊松过程。

**特征函数**：
$$\phi_{X(t)}(u) = \exp\left(\lambda t (\phi_Y(u) - 1)\right)$$

其中 $\phi_Y(u)$ 是 $Y_i$ 的特征函数。

## 3.4 生灭过程

### 3.4.1 定义
**生灭过程**是状态空间为非负整数 $\{0, 1, 2, \ldots\}$ 的连续时间马尔科夫过程，其转移只能在相邻状态之间发生：

- 从状态 $n$ 跳转到状态 $n+1$（出生），转移率为 $\lambda_n$
- 从状态 $n$ 跳转到状态 $n-1$（死亡），转移率为 $\mu_n$

### 3.4.2 生成矩阵
生灭过程的生成矩阵具有三对角结构：

$$Q = \begin{pmatrix}
-\lambda_0 & \lambda_0 & 0 & 0 & \cdots \\
\mu_1 & -(\lambda_1 + \mu_1) & \lambda_1 & 0 & \cdots \\
0 & \mu_2 & -(\lambda_2 + \mu_2) & \lambda_2 & \cdots \\
\vdots & \vdots & \vdots & \vdots & \ddots
\end{pmatrix}$$

### 3.4.3 平稳分布
对于不可约的生灭过程，平稳分布 $\pi = (\pi_0, \pi_1, \ldots)$ 满足：
$$\pi Q = 0$$

**详细平衡条件**：
$$\pi_n \lambda_n = \pi_{n+1} \mu_{n+1}, \quad n \geq 0$$

**解**：
$$\pi_n = \pi_0 \prod_{k=1}^n \frac{\lambda_{k-1}}{\mu_k}, \quad n \geq 1$$

其中 $\pi_0$ 由归一化条件确定：
$$\pi_0 = \left(1 + \sum_{n=1}^{\infty} \prod_{k=1}^n \frac{\lambda_{k-1}}{\mu_k}\right)^{-1}$$

## 3.5 马尔科夫跳跃过程

### 3.5.1 构造方法
马尔科夫跳跃过程可以通过以下方式构造：

1. **等待时间**：在状态 $i$ 的等待时间 $T_i$ 服从参数为 $\nu_i = -q_{ii}$ 的指数分布
2. **跳转概率**：从状态 $i$ 跳转到状态 $j$ 的概率为：
   $$p_{ij} = \frac{q_{ij}}{\nu_i}, \quad j \neq i$$

### 3.5.2 跳跃时间和跳跃链
设 $\{T_n\}$ 为跳跃时间序列，$\{Y_n\}$ 为跳跃链，则：
$$X(t) = Y_n, \quad \text{当 } T_n \leq t < T_{n+1}$$

**跳跃链的转移矩阵**：
$$P = (p_{ij})_{i,j \in S}$$

```mermaid
graph TB
    A[状态 i] -->|等待时间 ~ Exp(νᵢ)| B[准备跳转]
    B -->|概率 pᵢⱼ| C[状态 j]
    B -->|概率 pᵢₖ| D[状态 k]
    B -->|概率 pᵢₗ| E[状态 l]
```

## 3.6 Python实现与应用

```python
import numpy as np
import matplotlib.pyplot as plt
from scipy.linalg import expm
from scipy.stats import expon, poisson
import seaborn as sns

class ContinuousTimeMarkovChain:
    """连续时间马尔科夫链类"""

    def __init__(self, generator_matrix, state_names=None):
        """
        初始化连续时间马尔科夫链

        Parameters:
        -----------
        generator_matrix : array-like
            生成矩阵 Q
        state_names : list, optional
            状态名称
        """
        self.Q = np.array(generator_matrix, dtype=float)
        self.n_states = self.Q.shape[0]

        if state_names is None:
            self.state_names = [f"State_{i}" for i in range(self.n_states)]
        else:
            self.state_names = state_names

        self._validate_generator_matrix()

    def _validate_generator_matrix(self):
        """验证生成矩阵"""
        if self.Q.shape[0] != self.Q.shape[1]:
            raise ValueError("生成矩阵必须是方阵")

        # 检查对角元素为负，非对角元素非负
        for i in range(self.n_states):
            if self.Q[i, i] > 0:
                raise ValueError(f"对角元素 Q[{i},{i}] 必须非正")
            for j in range(self.n_states):
                if i != j and self.Q[i, j] < 0:
                    raise ValueError(f"非对角元素 Q[{i},{j}] 必须非负")

        # 检查行和为0
        row_sums = np.sum(self.Q, axis=1)
        if not np.allclose(row_sums, 0.0, atol=1e-10):
            raise ValueError("生成矩阵每行和必须为0")

    def transition_matrix(self, t):
        """计算时间t的转移矩阵 P(t) = exp(Qt)"""
        return expm(self.Q * t)

    def stationary_distribution(self):
        """计算平稳分布"""
        # 求解 πQ = 0，即 Q^T π = 0
        # 添加归一化约束
        A = np.vstack([self.Q.T, np.ones(self.n_states)])
        b = np.append(np.zeros(self.n_states), 1)

        # 最小二乘解
        pi, _, _, _ = np.linalg.lstsq(A, b, rcond=None)

        # 确保非负性
        pi = np.abs(pi)
        pi = pi / np.sum(pi)

        return pi

    def simulate_jump_chain(self, initial_state, max_time, seed=None):
        """模拟马尔科夫跳跃过程"""
        if seed is not None:
            np.random.seed(seed)

        # 计算跳转率和跳转概率
        rates = -np.diag(self.Q)
        P_jump = np.zeros_like(self.Q)

        for i in range(self.n_states):
            if rates[i] > 0:
                for j in range(self.n_states):
                    if i != j:
                        P_jump[i, j] = self.Q[i, j] / rates[i]

        # 模拟路径
        times = [0.0]
        states = [initial_state]
        current_state = initial_state
        current_time = 0.0

        while current_time < max_time:
            # 等待时间
            if rates[current_state] > 0:
                waiting_time = np.random.exponential(1.0 / rates[current_state])
            else:
                # 吸收状态
                break

            current_time += waiting_time

            if current_time >= max_time:
                break

            # 选择下一状态
            if np.sum(P_jump[current_state, :]) > 0:
                next_state = np.random.choice(
                    self.n_states,
                    p=P_jump[current_state, :]
                )
            else:
                break

            times.append(current_time)
            states.append(next_state)
            current_state = next_state

        return times, states

    def plot_sample_path(self, times, states, figsize=(12, 6)):
        """绘制样本路径"""
        plt.figure(figsize=figsize)

        # 绘制阶梯函数
        for i in range(len(times) - 1):
            plt.hlines(states[i], times[i], times[i+1], colors='blue', linewidth=2)
            if i < len(times) - 2:
                plt.vlines(times[i+1], states[i], states[i+1], colors='red', linestyles='dashed', alpha=0.7)

        # 最后一段
        if len(times) > 1:
            plt.hlines(states[-1], times[-1], times[-1] + (times[-1] - times[-2]) * 0.1, colors='blue', linewidth=2)

        plt.xlabel('时间')
        plt.ylabel('状态')
        plt.title('连续时间马尔科夫链样本路径')
        plt.grid(True, alpha=0.3)

        # 设置y轴刻度为状态名称
        plt.yticks(range(self.n_states), self.state_names)
        plt.tight_layout()
        plt.show()

class PoissonProcess:
    """泊松过程类"""

    def __init__(self, rate):
        """
        初始化泊松过程

        Parameters:
        -----------
        rate : float
            泊松过程的强度参数 λ
        """
        self.rate = rate

    def simulate(self, max_time, seed=None):
        """模拟泊松过程"""
        if seed is not None:
            np.random.seed(seed)

        times = [0.0]
        current_time = 0.0

        while current_time < max_time:
            # 下一事件的等待时间
            inter_arrival = np.random.exponential(1.0 / self.rate)
            current_time += inter_arrival

            if current_time < max_time:
                times.append(current_time)

        return times

    def count_process(self, times, max_time):
        """根据事件时间生成计数过程"""
        # 创建细粒度时间网格
        t_grid = np.linspace(0, max_time, int(max_time * 100) + 1)
        counts = np.zeros_like(t_grid)

        for i, t in enumerate(t_grid):
            counts[i] = np.sum(np.array(times) <= t)

        return t_grid, counts

    def plot_sample_path(self, times, max_time, figsize=(12, 6)):
        """绘制泊松过程样本路径"""
        t_grid, counts = self.count_process(times, max_time)

        plt.figure(figsize=figsize)
        plt.step(t_grid, counts, where='post', linewidth=2, label=f'λ = {self.rate}')

        # 标记事件时间
        for t in times[1:]:  # 跳过时间0
            plt.axvline(x=t, color='red', linestyle='--', alpha=0.5)

        plt.xlabel('时间')
        plt.ylabel('事件计数 N(t)')
        plt.title(f'泊松过程样本路径 (λ = {self.rate})')
        plt.legend()
        plt.grid(True, alpha=0.3)
        plt.tight_layout()
        plt.show()

        return t_grid, counts

class BirthDeathProcess:
    """生灭过程类"""

    def __init__(self, birth_rates, death_rates, state_names=None):
        """
        初始化生灭过程

        Parameters:
        -----------
        birth_rates : array-like
            出生率序列 [λ₀, λ₁, λ₂, ...]
        death_rates : array-like
            死亡率序列 [μ₀, μ₁, μ₂, ...]，μ₀ 通常为 0
        """
        self.birth_rates = np.array(birth_rates)
        self.death_rates = np.array(death_rates)
        self.n_states = len(birth_rates)

        if state_names is None:
            self.state_names = [f"State_{i}" for i in range(self.n_states)]
        else:
            self.state_names = state_names

        # 构造生成矩阵
        self.Q = self._build_generator_matrix()

    def _build_generator_matrix(self):
        """构造生成矩阵"""
        Q = np.zeros((self.n_states, self.n_states))

        for i in range(self.n_states):
            # 出生转移
            if i < self.n_states - 1:
                Q[i, i + 1] = self.birth_rates[i]

            # 死亡转移
            if i > 0:
                Q[i, i - 1] = self.death_rates[i]

            # 对角元素
            Q[i, i] = -(Q[i, :].sum() - Q[i, i])

        return Q

    def stationary_distribution(self):
        """计算平稳分布"""
        pi = np.zeros(self.n_states)
        pi[0] = 1.0

        # 递推计算
        for n in range(1, self.n_states):
            if self.death_rates[n] > 0:
                product = 1.0
                for k in range(1, n + 1):
                    product *= self.birth_rates[k - 1] / self.death_rates[k]
                pi[n] = product
            else:
                pi[n] = 0.0

        # 归一化
        total = np.sum(pi)
        if total > 0:
            pi = pi / total
        else:
            # 如果无穷级数发散，返回均匀分布
            pi = np.ones(self.n_states) / self.n_states

        return pi

# 应用示例1：M/M/1 排队模型
def mm1_queue_example():
    """M/M/1 排队系统示例"""
    print("M/M/1 排队系统分析")
    print("=" * 30)

    # 参数
    arrival_rate = 2.0  # 到达率 λ
    service_rate = 3.0  # 服务率 μ
    max_capacity = 10   # 最大容量

    # 构造生灭过程
    birth_rates = [arrival_rate] * max_capacity  # 最后一个状态无出生
    birth_rates[-1] = 0  # 容量限制

    death_rates = [0] + [service_rate] * (max_capacity - 1)

    queue = BirthDeathProcess(birth_rates, death_rates,
                            [f"队长_{i}" for i in range(max_capacity)])

    # 计算平稳分布
    pi = queue.stationary_distribution()

    print("\\n平稳分布（各队长的概率）：")
    for i, prob in enumerate(pi):
        if prob > 1e-6:
            print(f"队长 {i}: {prob:.4f}")

    # 性能指标
    print("\\n性能指标：")
    mean_customers = np.sum(np.arange(max_capacity) * pi)
    prob_empty = pi[0]
    prob_full = pi[-1]

    print(f"系统平均顾客数: {mean_customers:.3f}")
    print(f"系统空闲概率: {prob_empty:.3f}")
    print(f"系统满载概率: {prob_full:.3f}")

    # 理论值（无限容量M/M/1）
    rho = arrival_rate / service_rate
    if rho < 1:
        theoretical_mean = rho / (1 - rho)
        print(f"理论平均顾客数（无限容量）: {theoretical_mean:.3f}")

    return queue

# 应用示例2：电话交换机模型
def telephone_exchange_example():
    """电话交换机生灭过程模型"""
    print("\\n电话交换机模型")
    print("=" * 25)

    # 参数
    call_rate = 5.0      # 呼叫到达率
    line_capacity = 8    # 线路数
    service_rate = 1.0   # 每条线路的服务率

    # 生灭过程参数
    birth_rates = [call_rate] * (line_capacity + 1)
    birth_rates[-1] = 0  # 满载时无新呼叫

    death_rates = [0] + [i * service_rate for i in range(1, line_capacity + 1)]

    exchange = BirthDeathProcess(birth_rates, death_rates,
                               [f"忙线_{i}" for i in range(line_capacity + 1)])

    # 计算平稳分布
    pi = exchange.stationary_distribution()

    print("\\n平稳分布：")
    for i, prob in enumerate(pi):
        print(f"忙线 {i}: {prob:.4f}")

    # 阻塞概率（Erlang B公式的数值结果）
    blocking_prob = pi[-1]
    print(f"\\n呼叫阻塞概率: {blocking_prob:.4f}")

    # 系统利用率
    utilization = np.sum(np.arange(1, line_capacity + 1) * pi[1:]) / line_capacity
    print(f"系统利用率: {utilization:.3f}")

    return exchange

# 应用示例3：人口模型
def population_model_example():
    """简单人口增长模型"""
    print("\\n人口增长模型")
    print("=" * 20)

    # 参数
    max_population = 15
    birth_rate_per_individual = 0.5
    death_rate_per_individual = 0.3

    # 生灭过程参数（依赖于人口大小）
    birth_rates = [i * birth_rate_per_individual for i in range(max_population)]
    birth_rates.append(0)  # 达到最大容量

    death_rates = [0] + [i * death_rate_per_individual for i in range(1, max_population + 1)]

    population = BirthDeathProcess(birth_rates, death_rates,
                                 [f"人口_{i}" for i in range(max_population + 1)])

    # 计算平稳分布
    pi = population.stationary_distribution()

    print("\\n人口分布：")
    for i, prob in enumerate(pi):
        if prob > 1e-6:
            print(f"人口 {i}: {prob:.4f}")

    # 期望人口
    expected_population = np.sum(np.arange(max_population + 1) * pi)
    print(f"\\n期望人口规模: {expected_population:.2f}")

    # 灭绝概率
    extinction_prob = pi[0]
    print(f"人口灭绝概率: {extinction_prob:.4f}")

    return population

# 泊松过程示例
def poisson_process_example():
    """泊松过程应用示例"""
    print("\\n泊松过程应用")
    print("=" * 20)

    # 创建不同强度的泊松过程
    rates = [1.0, 2.0, 3.0]
    max_time = 10.0

    plt.figure(figsize=(15, 5))

    for i, rate in enumerate(rates):
        poisson_proc = PoissonProcess(rate)
        times = poisson_proc.simulate(max_time, seed=42 + i)

        plt.subplot(1, 3, i + 1)
        t_grid, counts = poisson_proc.count_process(times, max_time)

        plt.step(t_grid, counts, where='post', linewidth=2)
        plt.axhline(y=rate * max_time, color='red', linestyle='--',
                   label=f'期望值 λt = {rate * max_time}')

        # 标记事件时间
        for t in times[1:]:
            plt.axvline(x=t, color='gray', linestyle=':', alpha=0.5)

        plt.xlabel('时间')
        plt.ylabel('事件计数 N(t)')
        plt.title(f'泊松过程 (λ = {rate})')
        plt.legend()
        plt.grid(True, alpha=0.3)

    plt.tight_layout()
    plt.show()

    # 验证泊松分布
    print("\\n验证泊松分布（λ=2, t=5）：")
    rate = 2.0
    time_interval = 5.0
    expected_count = rate * time_interval

    # 模拟多次实现
    n_simulations = 1000
    counts = []

    poisson_proc = PoissonProcess(rate)
    for i in range(n_simulations):
        times = poisson_proc.simulate(time_interval, seed=i)
        counts.append(len(times) - 1)  # 减去初始时间0

    # 比较经验分布和理论分布
    empirical_mean = np.mean(counts)
    empirical_var = np.var(counts)

    print(f"经验均值: {empirical_mean:.3f}")
    print(f"理论均值: {expected_count:.3f}")
    print(f"经验方差: {empirical_var:.3f}")
    print(f"理论方差: {expected_count:.3f}")

    return counts

# 运行所有示例
if __name__ == "__main__":
    print("第3章：连续时间马尔科夫过程应用示例\\n")

    # MM1排队系统
    mm1_queue = mm1_queue_example()

    # 电话交换机
    exchange = telephone_exchange_example()

    # 人口模型
    population = population_model_example()

    # 泊松过程
    poisson_counts = poisson_process_example()

    # 可视化生灭过程的生成矩阵
    try:
        plt.figure(figsize=(12, 4))

        models = [
            (mm1_queue, "M/M/1 排队"),
            (exchange, "电话交换机"),
            (population, "人口模型")
        ]

        for i, (model, title) in enumerate(models):
            plt.subplot(1, 3, i + 1)
            sns.heatmap(model.Q, annot=True, fmt='.2f', cmap='RdBu_r',
                       center=0, square=True, cbar_kws={'shrink': 0.8})
            plt.title(f"{title}\\n生成矩阵")
            plt.xlabel("状态")
            plt.ylabel("状态")

        plt.tight_layout()
        plt.show()

    except ImportError:
        print("\\n需要安装seaborn库来显示热力图")
```

## 3.7 随机微分方程与扩散过程

### 3.7.1 扩散过程简介
**扩散过程**是连续时间、连续状态的马尔科夫过程，通常由随机微分方程（SDE）描述：

$$dX(t) = \mu(X(t), t) dt + \sigma(X(t), t) dW(t)$$

其中：
- $\mu(x, t)$：漂移系数
- $\sigma(x, t)$：扩散系数
- $W(t)$：布朗运动

### 3.7.2 几何布朗运动
**几何布朗运动**是金融建模中的重要扩散过程：

$$dS(t) = \mu S(t) dt + \sigma S(t) dW(t)$$

**解**：
$$S(t) = S(0) \exp\left(\left(\mu - \frac{\sigma^2}{2}\right)t + \sigma W(t)\right)$$

这是Black-Scholes模型的基础。

## 3.8 章节小结

本章学习了连续时间马尔科夫过程的核心理论：

**主要概念**：
1. **连续时间马尔科夫性质**：在连续时间框架下的无记忆性
2. **生成矩阵**：刻画瞬时转移率的矩阵
3. **Kolmogorov方程**：描述转移概率演化的微分方程
4. **泊松过程**：最重要的计数过程
5. **生灭过程**：具有特殊结构的马尔科夫过程

**关键公式**：
- 转移概率：$P(t) = e^{Qt}$
- Kolmogorov方程：$\frac{d}{dt}P(t) = QP(t) = P(t)Q$
- 泊松过程：$P(N(t) = n) = \frac{(\lambda t)^n e^{-\lambda t}}{n!}$
- 平稳分布：$\pi Q = 0$

**实际应用**：
1. **排队论**：M/M/1排队系统建模
2. **通信系统**：电话交换机容量分析
3. **人口动态**：生物种群增长模型
4. **金融风险**：违约时间和信用风险建模

连续时间马尔科夫过程为金融中的利率模型、信用风险模型等提供了重要的理论基础。