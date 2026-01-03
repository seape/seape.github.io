---
title: 第 10 章：测试报告与代码覆盖率
date: 2025-10-03
icon: circle-dot
author: Haiyue
category:
  - pytest
star: false
---

# 第 10 章：测试报告与代码覆盖率

::: tip 学习目标
- 掌握多种测试报告格式的生成
- 学习代码覆盖率的测量和分析
- 理解测试质量的评估方法
- 掌握持续集成中的报告配置
:::

### 知识点

#### 测试报告类型

| 报告类型 | 用途 | 输出格式 |
|----------|------|----------|
| 控制台报告 | 开发调试 | 文本 |
| HTML 报告 | 可视化查看 | HTML |
| XML 报告 | CI/CD 集成 | XML |
| JSON 报告 | 程序化处理 | JSON |
| JUnit 报告 | Jenkins 集成 | XML |

#### 代码覆盖率指标

- **行覆盖率**：被执行的代码行比例
- **分支覆盖率**：被执行的分支比例
- **函数覆盖率**：被调用的函数比例
- **条件覆盖率**：条件表达式的覆盖情况

### 示例代码

#### 基本报告配置

```python
# pytest.ini
[tool:pytest]
addopts =
    -v
    --tb=short
    --strict-markers
    --strict-config
    --cov=src
    --cov-report=term-missing
    --cov-report=html:htmlcov
    --cov-report=xml:coverage.xml
    --html=reports/report.html
    --self-contained-html
```

#### 生成 HTML 测试报告

```bash
# 安装依赖
pip install pytest-html

# 生成 HTML 报告
pytest --html=reports/report.html --self-contained-html

# 生成带 CSS 自定义的报告
pytest --html=reports/report.html --css=custom.css
```

#### 代码覆盖率测试

```python
# 安装 pytest-cov
# pip install pytest-cov

# 基本覆盖率命令
pytest --cov=src                          # 基本覆盖率
pytest --cov=src --cov-report=html        # HTML 覆盖率报告
pytest --cov=src --cov-report=term-missing # 显示未覆盖行
pytest --cov=src --cov-fail-under=80      # 覆盖率低于80%时失败

# 多模块覆盖率
pytest --cov=src --cov=tests --cov-report=html

# 排除特定文件
pytest --cov=src --cov-report=html --cov-config=.coveragerc
```

#### 覆盖率配置文件

```ini
# .coveragerc
[run]
source = src
omit =
    */tests/*
    */venv/*
    */__pycache__/*
    */migrations/*
    */settings/*
    manage.py

[report]
exclude_lines =
    pragma: no cover
    def __repr__
    raise AssertionError
    raise NotImplementedError
    if __name__ == .__main__.:
    if TYPE_CHECKING:

[html]
directory = htmlcov
title = My Project Coverage Report

[xml]
output = coverage.xml
```

#### 自定义测试报告插件

```python
# conftest.py - 自定义报告钩子
import pytest
from datetime import datetime

def pytest_html_report_title(report):
    """自定义 HTML 报告标题"""
    report.title = "项目测试报告"

def pytest_html_results_summary(prefix, summary, postfix):
    """自定义结果摘要"""
    prefix.extend([
        "<p>测试执行时间: {}</p>".format(datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
    ])

@pytest.hookimpl(hookwrapper=True)
def pytest_runtest_makereport(item, call):
    """自定义测试结果报告"""
    outcome = yield
    report = outcome.get_result()

    # 添加自定义属性
    setattr(item, "rep_" + report.when, report)

    # 为失败的测试添加额外信息
    if report.when == "call" and report.failed:
        # 可以添加截图、日志等
        extra = getattr(report, 'extra', [])
        if extra:
            report.extra = extra

def pytest_html_results_table_header(cells):
    """自定义表头"""
    cells.insert(2, "<th>描述</th>")
    cells.insert(3, "<th>执行时间</th>")

def pytest_html_results_table_row(report, cells):
    """自定义表格行"""
    # 添加测试描述
    if hasattr(report, 'description'):
        cells.insert(2, f"<td>{report.description}</td>")
    else:
        cells.insert(2, "<td>无描述</td>")

    # 添加执行时间
    if hasattr(report, 'duration'):
        cells.insert(3, f"<td>{report.duration:.3f}s</td>")
    else:
        cells.insert(3, "<td>N/A</td>")
```

#### 性能报告生成

```python
# test_performance_reporting.py
import pytest
import time
from pytest_benchmark import fixture

# 安装 pytest-benchmark: pip install pytest-benchmark

def fibonacci(n):
    """计算斐波那契数列"""
    if n < 2:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

def fibonacci_optimized(n, memo={}):
    """优化的斐波那契计算"""
    if n in memo:
        return memo[n]
    if n < 2:
        return n
    memo[n] = fibonacci_optimized(n-1, memo) + fibonacci_optimized(n-2, memo)
    return memo[n]

class TestPerformance:
    """性能测试类"""

    def test_fibonacci_performance(self, benchmark):
        """测试斐波那契性能"""
        result = benchmark(fibonacci, 20)
        assert result == 6765

    def test_fibonacci_optimized_performance(self, benchmark):
        """测试优化后的斐波那契性能"""
        result = benchmark(fibonacci_optimized, 20)
        assert result == 6765

    @pytest.mark.parametrize("n", [10, 15, 20])
    def test_fibonacci_scale(self, benchmark, n):
        """测试不同规模的性能"""
        result = benchmark(fibonacci_optimized, n)
        assert result >= 0

    def test_slow_operation(self, benchmark):
        """测试慢速操作"""
        def slow_function():
            time.sleep(0.1)  # 模拟慢速操作
            return "completed"

        result = benchmark(slow_function)
        assert result == "completed"

# 运行性能测试
# pytest --benchmark-only --benchmark-html=benchmark_report.html
```

#### 多格式报告生成

```python
# test_multi_format_reports.py
import pytest
import json
import xml.etree.ElementTree as ET

class TestReportFormats:
    """测试多种报告格式"""

    def test_json_output(self):
        """生成 JSON 数据的测试"""
        data = {"name": "test", "value": 42}
        assert isinstance(data, dict)
        assert data["name"] == "test"

    def test_xml_parsing(self):
        """XML 解析测试"""
        xml_data = "<root><item>test</item></root>"
        root = ET.fromstring(xml_data)
        assert root.tag == "root"
        assert root.find("item").text == "test"

    @pytest.mark.slow
    def test_large_dataset(self):
        """大数据集测试"""
        large_list = list(range(10000))
        assert len(large_list) == 10000
        assert sum(large_list) == 49995000

# 生成多种格式报告的命令
# pytest --html=report.html --junitxml=junit.xml --json-report --json-report-file=report.json
```

#### CI/CD 集成报告

```yaml
# .github/workflows/test-report.yml
name: Test and Report

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v3

    - name: Set up Python
      uses: actions/setup-python@v4
      with:
        python-version: '3.10'

    - name: Install dependencies
      run: |
        pip install -r requirements.txt
        pip install pytest pytest-cov pytest-html pytest-json-report

    - name: Run tests with coverage
      run: |
        pytest \
          --cov=src \
          --cov-report=html:htmlcov \
          --cov-report=xml:coverage.xml \
          --cov-report=term-missing \
          --html=reports/pytest_report.html \
          --self-contained-html \
          --json-report \
          --json-report-file=reports/report.json \
          --junitxml=reports/junit.xml

    - name: Upload coverage to Codecov
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage.xml

    - name: Archive test results
      uses: actions/upload-artifact@v3
      if: always()
      with:
        name: test-results
        path: |
          reports/
          htmlcov/

    - name: Publish test results
      uses: dorny/test-reporter@v1
      if: always()
      with:
        name: PyTest Results
        path: reports/junit.xml
        reporter: java-junit
```

#### 覆盖率分析和优化

```python
# src/calculator.py - 示例代码，用于覆盖率分析
class Calculator:
    """计算器类"""

    def add(self, a, b):
        """加法"""
        return a + b

    def subtract(self, a, b):
        """减法"""
        return a - b

    def multiply(self, a, b):
        """乘法"""
        if a == 0 or b == 0:  # 分支1
            return 0
        return a * b  # 分支2

    def divide(self, a, b):
        """除法"""
        if b == 0:  # 分支1
            raise ValueError("Division by zero")
        return a / b  # 分支2

    def power(self, base, exponent):
        """幂运算"""
        if exponent == 0:  # 分支1
            return 1
        elif exponent < 0:  # 分支2
            return 1 / self.power(base, abs(exponent))
        else:  # 分支3
            return base * self.power(base, exponent - 1)

    def factorial(self, n):
        """阶乘"""
        if n < 0:  # 分支1 - 边界情况
            raise ValueError("Factorial of negative number")
        elif n == 0 or n == 1:  # 分支2 - 基础情况
            return 1
        else:  # 分支3 - 递归情况
            return n * self.factorial(n - 1)

# 测试文件，展示不同覆盖率水平
# tests/test_calculator_coverage.py

class TestCalculatorCoverage:
    """计算器覆盖率测试"""

    @pytest.fixture
    def calc(self):
        return Calculator()

    def test_basic_operations(self, calc):
        """基本操作测试 - 部分覆盖率"""
        assert calc.add(2, 3) == 5
        assert calc.subtract(5, 3) == 2
        # 注意：这里没有测试 multiply 和 divide

    def test_multiply_with_zero(self, calc):
        """乘法零值测试 - 覆盖特定分支"""
        assert calc.multiply(0, 5) == 0
        assert calc.multiply(3, 0) == 0

    def test_multiply_normal(self, calc):
        """乘法正常情况测试"""
        assert calc.multiply(3, 4) == 12

    def test_divide_success(self, calc):
        """除法成功测试"""
        assert calc.divide(10, 2) == 5

    def test_divide_by_zero(self, calc):
        """除零测试 - 异常分支"""
        with pytest.raises(ValueError, match="Division by zero"):
            calc.divide(10, 0)

    def test_power_comprehensive(self, calc):
        """幂运算全面测试 - 高覆盖率"""
        # 测试所有分支
        assert calc.power(2, 0) == 1      # 指数为0
        assert calc.power(2, 3) == 8      # 正指数
        assert calc.power(2, -2) == 0.25  # 负指数

    def test_factorial_comprehensive(self, calc):
        """阶乘全面测试"""
        # 测试所有分支
        assert calc.factorial(0) == 1      # 边界情况
        assert calc.factorial(1) == 1      # 边界情况
        assert calc.factorial(5) == 120    # 正常情况

        # 测试异常情况
        with pytest.raises(ValueError):
            calc.factorial(-1)

# 覆盖率报告分析脚本
# analyze_coverage.py
import json
import sys

def analyze_coverage_report(json_file):
    """分析覆盖率报告"""
    try:
        with open(json_file, 'r') as f:
            data = json.load(f)

        files = data.get('files', {})

        print("📊 覆盖率分析报告")
        print("=" * 50)

        total_lines = 0
        covered_lines = 0

        for filename, info in files.items():
            if filename.startswith('src/'):  # 只分析源代码
                lines = info.get('summary', {}).get('num_statements', 0)
                covered = info.get('summary', {}).get('covered_lines', 0)
                missing = info.get('summary', {}).get('missing_lines', 0)

                coverage = (covered / lines * 100) if lines > 0 else 0

                print(f"📁 {filename}")
                print(f"   总行数: {lines}")
                print(f"   覆盖行数: {covered}")
                print(f"   未覆盖行数: {missing}")
                print(f"   覆盖率: {coverage:.1f}%")

                if missing > 0:
                    missing_lines = info.get('missing_lines', [])
                    print(f"   未覆盖行: {missing_lines}")

                print()

                total_lines += lines
                covered_lines += covered

        overall_coverage = (covered_lines / total_lines * 100) if total_lines > 0 else 0
        print(f"🎯 总体覆盖率: {overall_coverage:.1f}%")

        # 覆盖率等级评估
        if overall_coverage >= 90:
            print("✅ 覆盖率优秀")
        elif overall_coverage >= 80:
            print("🟡 覆盖率良好")
        elif overall_coverage >= 70:
            print("🟠 覆盖率一般")
        else:
            print("❌ 覆盖率需要改进")

    except FileNotFoundError:
        print(f"❌ 覆盖率报告文件 {json_file} 不存在")
        sys.exit(1)
    except json.JSONDecodeError:
        print(f"❌ 无法解析 JSON 文件 {json_file}")
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("用法: python analyze_coverage.py <coverage.json>")
        sys.exit(1)

    analyze_coverage_report(sys.argv[1])
```

#### 报告命令汇总

```bash
# 基本测试报告
pytest -v                                    # 详细输出
pytest --tb=short                           # 简短错误信息
pytest --tb=long                            # 详细错误信息

# HTML 报告
pytest --html=report.html                   # 生成 HTML 报告
pytest --html=report.html --self-contained-html  # 自包含 HTML

# 覆盖率报告
pytest --cov=src                            # 基本覆盖率
pytest --cov=src --cov-report=html          # HTML 覆盖率
pytest --cov=src --cov-report=term-missing  # 显示未覆盖行
pytest --cov=src --cov-report=xml           # XML 覆盖率

# 多种格式
pytest --html=report.html --junitxml=junit.xml --cov=src --cov-report=html

# 性能报告
pytest --benchmark-only                     # 只运行性能测试
pytest --benchmark-html=benchmark.html      # 性能 HTML 报告

# JSON 报告
pytest --json-report --json-report-file=report.json
```

::: note 报告最佳实践
1. **选择合适的报告格式**：开发用 HTML，CI/CD 用 XML
2. **设置覆盖率目标**：通常 80% 以上为良好
3. **关注未覆盖的代码**：重点关注关键业务逻辑
4. **定期分析报告**：将报告纳入代码审查流程
5. **自动化报告生成**：在 CI/CD 中自动生成和发布报告
:::

::: warning 注意事项
1. **覆盖率不等于质量**：高覆盖率不意味着测试质量高
2. **避免为了覆盖率而测试**：关注有意义的测试用例
3. **性能影响**：覆盖率收集会略微影响测试性能
4. **报告存储**：大项目的报告文件可能很大，注意存储空间
:::

测试报告和代码覆盖率是评估测试质量和项目健康状况的重要工具，合理使用能够显著提高软件质量。