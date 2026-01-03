---
title: 第 4 章：参数化测试与数据驱动
date: 2025-10-03
icon: circle-dot
author: Haiyue
category:
  - pytest
star: false
---

# 第 4 章：参数化测试与数据驱动

::: tip 学习目标
- 掌握 @pytest.mark.parametrize 装饰器
- 学习多参数和复杂数据的参数化
- 理解参数化测试的最佳实践
- 掌握动态参数生成
:::

### 知识点

#### 参数化测试概念

参数化测试允许使用不同的输入数据多次运行同一个测试函数，这样可以：

- **提高测试覆盖率**：用多组数据验证相同逻辑
- **减少代码重复**：避免为相似测试编写重复代码
- **数据驱动测试**：将测试数据与测试逻辑分离
- **边界值测试**：轻松测试各种边界条件

#### 参数化装饰器语法

```python
@pytest.mark.parametrize("参数名", [参数值列表])
@pytest.mark.parametrize("参数名1,参数名2", [(值1, 值2), ...])
@pytest.mark.parametrize("参数名", [值列表], ids=[标识列表])
```

#### 参数化的优势

| 优势 | 说明 |
|------|------|
| 代码复用 | 一个测试函数处理多种情况 |
| 清晰报告 | 每个参数组合都有独立的测试结果 |
| 易于维护 | 添加新测试数据只需修改参数列表 |
| 并行执行 | 不同参数的测试可以并行运行 |

### 示例代码

#### 基本参数化测试

```python
# test_parametrize_basic.py
import pytest

def add(a, b):
    """简单的加法函数"""
    return a + b

@pytest.mark.parametrize("a,b,expected", [
    (2, 3, 5),
    (0, 0, 0),
    (-1, 1, 0),
    (10, -5, 5),
    (100, 200, 300)
])
def test_add_function(a, b, expected):
    """参数化测试加法函数"""
    result = add(a, b)
    assert result == expected

# 单参数参数化
@pytest.mark.parametrize("number", [1, 2, 3, 4, 5])
def test_positive_numbers(number):
    """测试正数"""
    assert number > 0
    assert isinstance(number, int)

# 字符串参数化
@pytest.mark.parametrize("text", [
    "hello",
    "world",
    "pytest",
    "parametrize"
])
def test_string_length(text):
    """测试字符串长度"""
    assert len(text) > 0
    assert isinstance(text, str)
```

#### 复杂数据结构参数化

```python
# test_parametrize_complex.py
import pytest

# 字典参数化
@pytest.mark.parametrize("user_data", [
    {"name": "Alice", "age": 30, "email": "alice@example.com"},
    {"name": "Bob", "age": 25, "email": "bob@example.com"},
    {"name": "Charlie", "age": 35, "email": "charlie@example.com"}
])
def test_user_validation(user_data):
    """测试用户数据验证"""
    assert "name" in user_data
    assert "age" in user_data
    assert "email" in user_data
    assert user_data["age"] > 0
    assert "@" in user_data["email"]

# 列表参数化
@pytest.mark.parametrize("numbers", [
    [1, 2, 3],
    [10, 20, 30, 40],
    [100],
    [5, 5, 5, 5, 5]
])
def test_list_operations(numbers):
    """测试列表操作"""
    assert len(numbers) > 0
    assert sum(numbers) > 0
    assert max(numbers) >= min(numbers)

# 嵌套数据结构
@pytest.mark.parametrize("test_case", [
    {
        "input": {"username": "alice", "password": "secret123"},
        "expected": {"status": "success", "user_id": 1}
    },
    {
        "input": {"username": "bob", "password": "password456"},
        "expected": {"status": "success", "user_id": 2}
    },
    {
        "input": {"username": "invalid", "password": "wrong"},
        "expected": {"status": "error", "message": "Invalid credentials"}
    }
])
def test_login_scenarios(test_case):
    """测试登录场景"""
    def mock_login(username, password):
        """模拟登录函数"""
        users = {
            "alice": {"password": "secret123", "user_id": 1},
            "bob": {"password": "password456", "user_id": 2}
        }

        if username in users and users[username]["password"] == password:
            return {"status": "success", "user_id": users[username]["user_id"]}
        else:
            return {"status": "error", "message": "Invalid credentials"}

    input_data = test_case["input"]
    expected = test_case["expected"]

    result = mock_login(input_data["username"], input_data["password"])

    assert result["status"] == expected["status"]
    if "user_id" in expected:
        assert result["user_id"] == expected["user_id"]
    if "message" in expected:
        assert result["message"] == expected["message"]
```

#### 多重参数化和组合测试

```python
# test_multiple_parametrize.py
import pytest

# 多重参数化 - 笛卡尔积
@pytest.mark.parametrize("x", [1, 2, 3])
@pytest.mark.parametrize("y", [10, 20])
def test_multiplication_combinations(x, y):
    """测试乘法组合（3×2=6个测试）"""
    result = x * y
    assert result > 0
    assert result == x * y

# 操作系统和浏览器组合测试
@pytest.mark.parametrize("os", ["Windows", "macOS", "Linux"])
@pytest.mark.parametrize("browser", ["Chrome", "Firefox", "Safari"])
def test_browser_os_compatibility(os, browser):
    """测试浏览器和操作系统兼容性"""
    # 模拟兼容性检查
    incompatible = [
        ("Linux", "Safari"),
        ("Windows", "Safari")
    ]

    if (os, browser) in incompatible:
        pytest.skip(f"{browser} not available on {os}")

    # 执行兼容性测试
    assert f"Testing {browser} on {os}" is not None

# 数据类型和操作组合
@pytest.mark.parametrize("data_type", ["list", "tuple", "set"])
@pytest.mark.parametrize("operation", ["len", "bool", "iter"])
def test_data_type_operations(data_type, operation):
    """测试数据类型和操作组合"""
    # 创建测试数据
    test_data = {
        "list": [1, 2, 3],
        "tuple": (1, 2, 3),
        "set": {1, 2, 3}
    }

    data = test_data[data_type]

    if operation == "len":
        assert len(data) == 3
    elif operation == "bool":
        assert bool(data) is True
    elif operation == "iter":
        assert list(iter(data)) is not None
```

#### 自定义测试ID和描述

```python
# test_custom_ids.py
import pytest

# 使用 ids 参数自定义测试标识
@pytest.mark.parametrize("input,expected", [
    (2, 4),
    (3, 9),
    (4, 16),
    (5, 25)
], ids=["square_of_2", "square_of_3", "square_of_4", "square_of_5"])
def test_square_with_ids(input, expected):
    """带有自定义ID的平方测试"""
    assert input ** 2 == expected

# 使用函数生成测试ID
def test_id_func(val):
    """生成测试ID的函数"""
    if isinstance(val, dict):
        return f"user_{val.get('name', 'unknown')}"
    elif isinstance(val, list):
        return f"list_len_{len(val)}"
    else:
        return str(val)

@pytest.mark.parametrize("test_data", [
    {"name": "Alice", "age": 30},
    {"name": "Bob", "age": 25},
    [1, 2, 3, 4],
    [10, 20],
    "simple_string"
], ids=test_id_func)
def test_with_id_function(test_data):
    """使用函数生成ID的测试"""
    assert test_data is not None

# 使用 pytest.param 设置个别参数的标记
@pytest.mark.parametrize("value", [
    pytest.param(1, id="positive"),
    pytest.param(0, id="zero"),
    pytest.param(-1, id="negative"),
    pytest.param(1000, id="large_positive", marks=pytest.mark.slow),
    pytest.param(-1000, id="large_negative", marks=pytest.mark.slow)
])
def test_with_param_marks(value):
    """使用 pytest.param 的测试"""
    assert isinstance(value, int)
```

#### 动态参数生成

```python
# test_dynamic_params.py
import pytest

def generate_test_data():
    """动态生成测试数据"""
    base_cases = []

    # 生成数字测试用例
    for i in range(1, 6):
        base_cases.append((i, i * 2, i + i))

    # 生成边界值测试用例
    boundary_cases = [
        (0, 0, 0),
        (-1, -2, -1 + -1),
        (100, 200, 100 + 100)
    ]

    return base_cases + boundary_cases

@pytest.mark.parametrize("a,b,expected", generate_test_data())
def test_dynamic_addition(a, b, expected):
    """动态生成参数的加法测试"""
    assert a + a == expected
    assert a * 2 == b

# 从外部文件读取测试数据
def read_test_data_from_config():
    """从配置中读取测试数据"""
    # 模拟从文件或数据库读取
    return [
        {"url": "https://api.example.com/users", "method": "GET", "expected_status": 200},
        {"url": "https://api.example.com/posts", "method": "POST", "expected_status": 201},
        {"url": "https://api.example.com/invalid", "method": "GET", "expected_status": 404}
    ]

@pytest.mark.parametrize("api_config", read_test_data_from_config())
def test_api_endpoints(api_config):
    """API端点测试"""
    def mock_api_call(url, method):
        """模拟API调用"""
        if "invalid" in url:
            return 404
        elif method == "POST":
            return 201
        else:
            return 200

    result = mock_api_call(api_config["url"], api_config["method"])
    assert result == api_config["expected_status"]

# 条件性参数生成
def get_math_test_cases():
    """根据条件生成数学测试用例"""
    import sys

    basic_cases = [
        (2, 3, 5),
        (10, 5, 15)
    ]

    # 在特定Python版本下添加额外测试
    if sys.version_info >= (3, 8):
        basic_cases.append((100, 200, 300))

    return basic_cases

@pytest.mark.parametrize("a,b,expected", get_math_test_cases())
def test_conditional_math(a, b, expected):
    """条件性数学测试"""
    assert a + b == expected
```

#### 参数化与 Fixture 结合

```python
# test_params_with_fixtures.py
import pytest

@pytest.fixture
def database_connection():
    """数据库连接 fixture"""
    class MockDB:
        def __init__(self):
            self.data = {
                1: {"name": "Alice", "age": 30},
                2: {"name": "Bob", "age": 25},
                3: {"name": "Charlie", "age": 35}
            }

        def get_user(self, user_id):
            return self.data.get(user_id)

    return MockDB()

@pytest.mark.parametrize("user_id,expected_name", [
    (1, "Alice"),
    (2, "Bob"),
    (3, "Charlie")
])
def test_database_queries(database_connection, user_id, expected_name):
    """参数化数据库查询测试"""
    user = database_connection.get_user(user_id)
    assert user is not None
    assert user["name"] == expected_name

# 参数化 fixture
@pytest.fixture(params=["json", "xml", "yaml"])
def data_format(request):
    """参数化的数据格式 fixture"""
    return request.param

@pytest.fixture(params=[10, 100, 1000])
def sample_size(request):
    """参数化的样本大小 fixture"""
    return request.param

def test_data_processing(data_format, sample_size):
    """测试数据处理（会运行 3×3=9 次）"""
    assert data_format in ["json", "xml", "yaml"]
    assert sample_size in [10, 100, 1000]

    # 模拟数据处理
    processing_time = sample_size * 0.001  # 假设的处理时间
    if data_format == "xml":
        processing_time *= 1.5  # XML 处理更慢

    assert processing_time > 0
```

#### 条件跳过和标记

```python
# test_conditional_params.py
import pytest
import sys

@pytest.mark.parametrize("platform,feature", [
    pytest.param("windows", "ntfs", marks=pytest.mark.skipif(
        sys.platform != "win32", reason="Windows only")),
    pytest.param("linux", "ext4", marks=pytest.mark.skipif(
        sys.platform == "win32", reason="Linux only")),
    pytest.param("macos", "apfs", marks=pytest.mark.skipif(
        sys.platform != "darwin", reason="macOS only")),
    ("any", "generic")
])
def test_platform_features(platform, feature):
    """平台特定功能测试"""
    assert platform is not None
    assert feature is not None

# 慢速测试标记
@pytest.mark.parametrize("size", [
    10,
    100,
    pytest.param(10000, marks=pytest.mark.slow),
    pytest.param(100000, marks=pytest.mark.slow)
])
def test_performance_with_size(size):
    """性能测试（大数据集标记为慢速）"""
    # 模拟处理时间
    import time
    if size > 1000:
        time.sleep(0.01)  # 模拟慢速操作

    assert size > 0

# 预期失败的参数
@pytest.mark.parametrize("input_val,expected", [
    (1, 1),
    (2, 4),
    (3, 9),
    pytest.param(4, 15, marks=pytest.mark.xfail(reason="Known bug in square calculation"))
])
def test_square_with_known_bug(input_val, expected):
    """带有已知错误的平方测试"""
    result = input_val ** 2
    assert result == expected
```

### 参数化测试最佳实践

#### 测试数据组织

```python
# test_data_organization.py
import pytest

# 将测试数据分离到模块级别
VALID_EMAILS = [
    "user@example.com",
    "test.email+tag@domain.co.uk",
    "user123@test-domain.com"
]

INVALID_EMAILS = [
    "invalid-email",
    "@domain.com",
    "user@",
    ""
]

@pytest.mark.parametrize("email", VALID_EMAILS)
def test_valid_email_format(email):
    """测试有效邮箱格式"""
    assert "@" in email
    assert "." in email.split("@")[1]

@pytest.mark.parametrize("email", INVALID_EMAILS)
def test_invalid_email_format(email):
    """测试无效邮箱格式"""
    def is_valid_email(email_str):
        return "@" in email_str and "." in email_str.split("@")[1] if "@" in email_str else False

    assert not is_valid_email(email)
```

#### 运行参数化测试

```bash
# 运行所有参数化测试
pytest -v

# 运行特定参数的测试
pytest -k "square_of_3" -v

# 运行慢速测试
pytest -m slow -v

# 跳过慢速测试
pytest -m "not slow" -v

# 显示参数化测试的详细信息
pytest --collect-only
```

::: note 参数化测试技巧
1. **合理命名**：使用描述性的参数名和测试ID
2. **数据分离**：将测试数据与测试逻辑分离
3. **边界测试**：包含边界值和异常情况
4. **性能考虑**：对大数据集使用适当的标记
5. **可读性**：保持参数化测试的可读性和可维护性
:::

::: warning 注意事项
1. **避免过度参数化**：不要为了参数化而参数化
2. **内存使用**：大量参数可能消耗大量内存
3. **执行时间**：参数化测试会增加总执行时间
4. **调试难度**：参数化测试的调试可能更复杂
:::

### 参数化测试输出示例

```bash
$ pytest test_parametrize_basic.py -v

test_parametrize_basic.py::test_add_function[2-3-5] PASSED
test_parametrize_basic.py::test_add_function[0-0-0] PASSED
test_parametrize_basic.py::test_add_function[-1-1-0] PASSED
test_parametrize_basic.py::test_add_function[10--5-5] PASSED
test_parametrize_basic.py::test_add_function[100-200-300] PASSED
test_parametrize_basic.py::test_positive_numbers[1] PASSED
test_parametrize_basic.py::test_positive_numbers[2] PASSED
test_parametrize_basic.py::test_positive_numbers[3] PASSED
test_parametrize_basic.py::test_positive_numbers[4] PASSED
test_parametrize_basic.py::test_positive_numbers[5] PASSED
```

参数化测试是 pytest 的强大特性，能够显著提高测试覆盖率和代码复用性，是实现数据驱动测试的核心工具。