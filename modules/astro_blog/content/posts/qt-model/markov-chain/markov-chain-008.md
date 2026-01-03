---
title: "第8章：市场制度转换模型实践"
date: 2025-10-02
icon: circle-dot
author: Haiyue
category:
  - markov-chain
star: false
---
# 第8章：市场制度转换模型实践

::: tip 学习目标
- 实现马尔科夫制转换模型
- 识别牛市和熊市的状态转换
- 使用EM算法进行参数估计
- 构建基于制度转换的投资策略
:::

## 知识点总结

### 1. 马尔科夫制转换模型(MS-AR)

**基本形式**：
$$r_t = \mu_{s_t} + \phi_{s_t}r_{t-1} + \sigma_{s_t}\epsilon_t$$

其中：
- $s_t \in \{1,2,...,k\}$ 是制度状态
- $\mu_{s_t}, \phi_{s_t}, \sigma_{s_t}$ 是状态依赖参数
- $\epsilon_t \sim N(0,1)$

### 2. EM算法参数估计

**E步**：计算状态概率
$$\xi_t(i,j) = P(s_t=i, s_{t+1}=j | r_{1:T}, \theta^{(k)})$$
$$\gamma_t(i) = P(s_t=i | r_{1:T}, \theta^{(k)})$$

**M步**：更新参数
$$\mu_i^{(k+1)} = \frac{\sum_{t=1}^T \gamma_t(i)(r_t - \phi_i r_{t-1})}{\sum_{t=1}^T \gamma_t(i)}$$

## 示例代码

```python
import numpy as np
import pandas as pd
from scipy.optimize import minimize
from scipy.special import logsumexp
import matplotlib.pyplot as plt

class MarkovSwitchingAR:
    """马尔科夫制转换自回归模型"""

    def __init__(self, n_states=2, order=1):
        self.n_states = n_states
        self.order = order
        self.params = {}

    def fit(self, data, max_iter=100, tol=1e-6):
        """使用EM算法估计参数"""
        # 初始化参数
        self._initialize_parameters(data)

        log_likelihood_old = -np.inf

        for iteration in range(max_iter):
            # E步：计算状态概率
            gamma, xi, log_likelihood = self._e_step(data)

            # M步：更新参数
            self._m_step(data, gamma, xi)

            # 检查收敛
            if abs(log_likelihood - log_likelihood_old) < tol:
                print(f"EM算法在第{iteration+1}次迭代后收敛")
                break

            log_likelihood_old = log_likelihood

        return self

    def _initialize_parameters(self, data):
        """初始化参数"""
        # 简单初始化
        self.params['mu'] = np.random.normal(0, 0.01, self.n_states)
        self.params['phi'] = np.random.uniform(0.1, 0.9, (self.n_states, self.order))
        self.params['sigma'] = np.random.uniform(0.01, 0.05, self.n_states)
        self.params['transition'] = np.random.dirichlet(np.ones(self.n_states), self.n_states)

    def predict_regime(self, data):
        """预测制度状态"""
        gamma, _, _ = self._e_step(data)
        return np.argmax(gamma, axis=1)

# 示例：构建投资策略
def regime_switching_strategy(returns, regimes):
    """基于制度转换的投资策略"""
    positions = np.zeros_like(returns)

    # 牛市做多，熊市做空或空仓
    bull_regime = 0  # 假设状态0是牛市
    bear_regime = 1  # 假设状态1是熊市

    for t in range(len(returns)):
        if regimes[t] == bull_regime:
            positions[t] = 1.0  # 满仓做多
        elif regimes[t] == bear_regime:
            positions[t] = -0.5  # 半仓做空
        else:
            positions[t] = 0.0  # 空仓

    strategy_returns = positions[:-1] * returns[1:]
    return strategy_returns, positions

# 生成示例数据并应用模型
np.random.seed(42)
T = 500

# 模拟两制度数据
true_regimes = np.random.choice([0, 1], T, p=[0.7, 0.3])
mu_true = [0.02, -0.01]
sigma_true = [0.15, 0.25]

returns = np.zeros(T)
for t in range(T):
    regime = true_regimes[t]
    returns[t] = np.random.normal(mu_true[regime], sigma_true[regime])

# 拟合模型
ms_model = MarkovSwitchingAR(n_states=2)
ms_model.fit(returns)

# 预测制度
predicted_regimes = ms_model.predict_regime(returns)

# 构建策略
strategy_rets, positions = regime_switching_strategy(returns, predicted_regimes)

print(f"策略年化收益率: {np.mean(strategy_rets) * 252:.2%}")
print(f"策略年化波动率: {np.std(strategy_rets) * np.sqrt(252):.2%}")
print(f"基准年化收益率: {np.mean(returns) * 252:.2%}")
print(f"基准年化波动率: {np.std(returns) * np.sqrt(252):.2%}")
```

## 理论分析

### Hamilton滤波器

**滤波概率**：
$$P(s_t=j|r_{1:t}) = \frac{f(r_t|s_t=j,r_{1:t-1})P(s_t=j|r_{1:t-1})}{\sum_{i=1}^k f(r_t|s_t=i,r_{1:t-1})P(s_t=i|r_{1:t-1})}$$

**预测概率**：
$$P(s_{t+1}=j|r_{1:t}) = \sum_{i=1}^k P_{ij}P(s_t=i|r_{1:t})$$

### 模型选择

**信息准则**：
- AIC: $-2\log L + 2p$
- BIC: $-2\log L + p\log T$
- HQ: $-2\log L + 2p\log\log T$

## 数学公式总结

1. **制度转换AR模型**：$r_t = \mu_{s_t} + \sum_{i=1}^p \phi_{i,s_t}r_{t-i} + \sigma_{s_t}\epsilon_t$

2. **转移概率**：$P_{ij} = P(s_{t+1}=j|s_t=i)$

3. **EM算法更新**：
   - $\hat{\mu}_i = \frac{\sum_t \gamma_t(i)y_t}{\sum_t \gamma_t(i)}$
   - $\hat{\sigma}_i^2 = \frac{\sum_t \gamma_t(i)(y_t-\hat{\mu}_i)^2}{\sum_t \gamma_t(i)}$

4. **对数似然**：$\ell = \sum_{t=1}^T \log\sum_{j=1}^k \alpha_t(j)$

::: warning 应用注意事项
- 制度识别存在滞后性
- 需要足够的样本来估计参数
- 模型选择（状态数）很重要
- 制度可能随时间改变特征
:::