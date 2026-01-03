---
title: 第 1 章：Pytest 入门基础
date: 2025-10-03
icon: circle-dot
author: Haiyue
category:
  - pytest
star: false
---

# 第 1 章：Pytest 入门基础

::: tip 学习目标
- 理解 pytest 的核心概念和优势
- 掌握 pytest 的安装和基本使用
- 编写第一个测试用例
- 了解测试发现机制和命名规则
:::

### 知识点

#### Pytest 概述与优势

- **简洁的语法**：使用标准的 assert 语句，无需特殊的断言方法
- **自动测试发现**：自动发现并运行测试文件和测试函数
- **丰富的插件生态**：拥有数百个插件扩展功能
- **详细的失败信息**：提供清晰的错误报告和调试信息
- **Fixture 支持**：强大的测试数据和资源管理机制
- **参数化测试**：轻松实现数据驱动测试

#### 安装与环境配置

```bash
# 使用 pip 安装 pytest
pip install pytest

# 验证安装
pytest --version
```

#### 测试发现机制

Pytest 遵循以下命名约定自动发现测试：

| 类型 | 命名规则 |
|------|----------|
| 测试文件 | `test_*.py` 或 `*_test.py` |
| 测试函数 | `test_*` |
| 测试类 | `Test*` |
| 测试方法 | `test_*` |

#### 基本命令

```bash
# 运行所有测试
pytest

# 运行指定文件
pytest test_example.py

# 运行指定目录
pytest tests/

# 详细输出
pytest -v

# 显示局部变量
pytest -l
```

### 示例代码

#### 第一个测试文件

```python
# test_basic.py
def add(a, b):
    """简单的加法函数"""
    return a + b

def test_add_positive_numbers():
    """测试正数相加"""
    result = add(2, 3)
    assert result == 5  # 使用标准 assert 语句

def test_add_negative_numbers():
    """测试负数相加"""
    result = add(-2, -3)
    assert result == -5

def test_add_zero():
    """测试与零相加"""
    result = add(5, 0)
    assert result == 5
```

#### 运行测试

```bash
# 在命令行运行
$ pytest test_basic.py -v

# 输出示例：
# ========================= test session starts =========================
# collected 3 items
#
# test_basic.py::test_add_positive_numbers PASSED            [ 33%]
# test_basic.py::test_add_negative_numbers PASSED            [ 66%]
# test_basic.py::test_add_zero PASSED                        [100%]
#
# ========================= 3 passed in 0.01s =========================
```

#### 测试类的使用

```python
# test_calculator.py
class Calculator:
    """简单的计算器类"""

    def add(self, a, b):
        return a + b

    def subtract(self, a, b):
        return a - b

class TestCalculator:
    """计算器测试类"""

    def setup_method(self):
        """每个测试方法前执行"""
        self.calc = Calculator()

    def test_addition(self):
        """测试加法功能"""
        assert self.calc.add(2, 3) == 5
        assert self.calc.add(-1, 1) == 0

    def test_subtraction(self):
        """测试减法功能"""
        assert self.calc.subtract(5, 3) == 2
        assert self.calc.subtract(0, 5) == -5
```

### 测试失败示例

```python
# test_failure_example.py
def divide(a, b):
    """除法函数（有意包含错误）"""
    return a / b  # 没有处理除零情况

def test_divide_success():
    """测试正常除法"""
    assert divide(10, 2) == 5

def test_divide_by_zero():
    """测试除零情况（这个测试会失败）"""
    # 这里我们期望抛出异常，但函数直接崩溃了
    result = divide(10, 0)
    assert result is None  # 这行永远不会执行
```

运行失败的测试会得到详细的错误信息：

```bash
$ pytest test_failure_example.py -v

# 输出包含：
# FAILURES
# test_failure_example.py::test_divide_by_zero - ZeroDivisionError: division by zero
# 以及详细的调用栈信息
```

### 项目结构最佳实践

```
project/
├── src/
│   └── calculator.py          # 源代码
├── tests/
│   ├── __init__.py           # 使 tests 成为包
│   ├── test_calculator.py    # 测试文件
│   └── conftest.py           # pytest 配置文件
├── pytest.ini               # pytest 配置
└── requirements.txt          # 依赖文件
```

::: note 提示
- 使用 `assert` 语句进行断言，pytest 会自动提供详细的失败信息
- 测试函数名应该描述测试的具体场景
- 每个测试应该独立，不依赖其他测试的结果
- 遵循 AAA 模式：Arrange（准备）、Act（执行）、Assert（断言）
:::

::: warning 注意事项
- 确保测试文件和函数遵循命名约定
- 避免在测试中使用复杂的逻辑
- 测试应该快速执行，避免耗时操作
:::

### 常用命令选项

| 选项 | 功能 |
|------|------|
| `-v, --verbose` | 显示详细输出 |
| `-q, --quiet` | 简化输出 |
| `-s` | 显示 print 输出 |
| `-x, --exitfirst` | 遇到第一个失败就停止 |
| `--tb=short` | 简化错误跟踪信息 |
| `--collect-only` | 只收集测试，不运行 |

这样，我们就完成了 pytest 的入门基础学习，为后续深入学习各种高级特性打下了坚实的基础。