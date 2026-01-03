---
title: 第 2 章：测试用例编写基础
date: 2025-10-03
icon: circle-dot
author: Haiyue
category:
  - pytest
star: false
---

# 第 2 章：测试用例编写基础

::: tip 学习目标
- 掌握断言（assert）的使用方法
- 理解测试函数的结构和规范
- 学习测试数据的组织方式
- 掌握基本的测试模式
:::

### 知识点

#### 断言基础

断言是测试的核心，pytest 使用 Python 的标准 `assert` 语句，提供了强大的自省能力：

- **基本断言**：检查表达式是否为真
- **比较断言**：比较两个值是否相等、大小关系等
- **包含断言**：检查元素是否在容器中
- **类型断言**：检查对象类型
- **异常断言**：验证是否抛出预期异常

#### 测试函数结构

遵循 **AAA 模式**：
- **Arrange（准备）**：设置测试数据和环境
- **Act（执行）**：调用被测试的功能
- **Assert（断言）**：验证结果是否符合预期

#### 测试命名约定

- 测试函数名应该清楚描述测试场景
- 使用 `test_` 前缀
- 建议格式：`test_<功能>_<条件>_<预期结果>`

### 示例代码

#### 基本断言示例

```python
# test_assertions.py

def test_basic_assertions():
    """基本断言示例"""
    # 相等断言
    assert 2 + 2 == 4
    assert "hello" == "hello"

    # 不等断言
    assert 3 != 2
    assert "hello" != "world"

    # 布尔断言
    assert True
    assert not False

    # None 断言
    value = None
    assert value is None

    non_none_value = "test"
    assert non_none_value is not None

def test_comparison_assertions():
    """比较断言示例"""
    # 数值比较
    assert 5 > 3
    assert 2 < 10
    assert 5 >= 5
    assert 3 <= 3

    # 字符串比较
    assert "apple" < "banana"  # 字典序
    assert len("hello") == 5

def test_container_assertions():
    """容器断言示例"""
    my_list = [1, 2, 3, 4, 5]
    my_dict = {"name": "Alice", "age": 30}
    my_set = {1, 2, 3}

    # 成员检查
    assert 3 in my_list
    assert 6 not in my_list
    assert "name" in my_dict
    assert "address" not in my_dict

    # 长度检查
    assert len(my_list) == 5
    assert len(my_dict) == 2

    # 空容器检查
    empty_list = []
    assert not empty_list  # 空列表为 False
    assert len(empty_list) == 0
```

#### 字符串和类型断言

```python
# test_string_types.py

def test_string_assertions():
    """字符串断言示例"""
    text = "Hello, World!"

    # 字符串包含
    assert "Hello" in text
    assert "goodbye" not in text

    # 字符串方法
    assert text.startswith("Hello")
    assert text.endswith("!")
    assert text.isupper() == False
    assert text.lower() == "hello, world!"

    # 空字符串
    empty_str = ""
    assert not empty_str
    assert len(empty_str) == 0

def test_type_assertions():
    """类型断言示例"""
    # 基本类型检查
    assert isinstance(42, int)
    assert isinstance(3.14, float)
    assert isinstance("hello", str)
    assert isinstance([1, 2, 3], list)
    assert isinstance({"key": "value"}, dict)

    # 继承关系检查
    class Animal:
        pass

    class Dog(Animal):
        pass

    my_dog = Dog()
    assert isinstance(my_dog, Dog)
    assert isinstance(my_dog, Animal)  # 继承关系

    # 类型不匹配
    assert not isinstance("123", int)
```

#### 数值和精度断言

```python
# test_numeric.py
import math

def test_numeric_assertions():
    """数值断言示例"""
    # 整数运算
    assert 2 + 3 == 5
    assert 10 - 4 == 6
    assert 3 * 4 == 12
    assert 15 // 4 == 3  # 整数除法
    assert 15 % 4 == 3   # 取余

    # 浮点数比较（注意精度问题）
    result = 0.1 + 0.2
    # 直接比较可能失败：assert result == 0.3
    # 使用精度比较
    assert abs(result - 0.3) < 1e-10

    # 更好的方式：使用 math.isclose()
    assert math.isclose(result, 0.3, rel_tol=1e-9)

    # 无穷大和 NaN
    assert math.isinf(float('inf'))
    assert math.isnan(float('nan'))

def test_range_assertions():
    """范围断言示例"""
    value = 15

    # 范围检查
    assert 10 <= value <= 20
    assert value in range(10, 21)

    # 列表范围
    scores = [85, 92, 78, 96, 88]
    assert all(score >= 0 for score in scores)
    assert all(score <= 100 for score in scores)
    assert any(score > 90 for score in scores)
```

#### 复杂数据结构断言

```python
# test_complex_data.py

def test_list_assertions():
    """列表断言示例"""
    numbers = [1, 2, 3, 4, 5]

    # 列表内容
    assert numbers[0] == 1
    assert numbers[-1] == 5
    assert numbers[1:3] == [2, 3]

    # 列表操作
    assert sorted(numbers) == numbers  # 已排序
    assert sum(numbers) == 15
    assert max(numbers) == 5
    assert min(numbers) == 1

    # 列表比较
    other_numbers = [1, 2, 3, 4, 5]
    assert numbers == other_numbers
    assert numbers is not other_numbers  # 不是同一个对象

def test_dict_assertions():
    """字典断言示例"""
    user = {
        "id": 1,
        "name": "Alice",
        "email": "alice@example.com",
        "age": 30
    }

    # 键值检查
    assert user["name"] == "Alice"
    assert user.get("phone") is None
    assert user.get("phone", "N/A") == "N/A"

    # 键和值的存在
    assert "name" in user
    assert "Alice" in user.values()
    assert ("id", 1) in user.items()

    # 字典结构
    expected_keys = {"id", "name", "email", "age"}
    assert set(user.keys()) == expected_keys

def test_nested_data_assertions():
    """嵌套数据结构断言"""
    data = {
        "users": [
            {"id": 1, "name": "Alice", "active": True},
            {"id": 2, "name": "Bob", "active": False}
        ],
        "total": 2
    }

    # 嵌套访问
    assert data["total"] == 2
    assert len(data["users"]) == 2
    assert data["users"][0]["name"] == "Alice"
    assert data["users"][1]["active"] == False

    # 复杂条件
    active_users = [user for user in data["users"] if user["active"]]
    assert len(active_users) == 1
    assert active_users[0]["name"] == "Alice"
```

#### 自定义断言函数

```python
# test_custom_assertions.py

def is_even(number):
    """检查数字是否为偶数"""
    return number % 2 == 0

def is_valid_email(email):
    """简单的邮箱验证"""
    return "@" in email and "." in email

def test_custom_assertions():
    """自定义断言函数示例"""
    # 使用自定义断言函数
    assert is_even(4)
    assert not is_even(5)

    assert is_valid_email("user@example.com")
    assert not is_valid_email("invalid-email")

# 更复杂的自定义断言
def assert_user_valid(user):
    """验证用户对象是否有效"""
    assert isinstance(user, dict), "用户必须是字典类型"
    assert "id" in user, "用户必须有 ID"
    assert "name" in user, "用户必须有姓名"
    assert isinstance(user["id"], int), "用户 ID 必须是整数"
    assert isinstance(user["name"], str), "用户姓名必须是字符串"
    assert len(user["name"]) > 0, "用户姓名不能为空"

def test_user_validation():
    """用户验证测试"""
    valid_user = {"id": 1, "name": "Alice"}
    assert_user_valid(valid_user)

    # 这个测试会通过，因为用户数据有效
```

#### 错误信息和调试

```python
# test_debugging.py

def test_assertion_messages():
    """带有自定义错误信息的断言"""
    user_age = 17

    # 带有自定义错误信息
    assert user_age >= 18, f"用户年龄 {user_age} 不满足最低要求 18 岁"

    # 这个测试会失败，并显示自定义消息

def test_debugging_info():
    """调试信息示例"""
    numbers = [1, 2, 3, 4, 5]
    target = 6

    # pytest 会自动显示变量值
    assert target in numbers  # 失败时会显示 numbers 的内容

    # 复杂表达式的调试
    result = sum(numbers)
    expected = 20  # 错误的期望值
    assert result == expected  # 会显示 result=15, expected=20
```

### 测试组织最佳实践

#### 测试类组织

```python
# test_calculator_class.py

class TestCalculator:
    """计算器测试类"""

    def setup_method(self):
        """每个测试方法前执行"""
        self.calc = Calculator()

    def test_addition(self):
        """测试加法"""
        assert self.calc.add(2, 3) == 5
        assert self.calc.add(-1, 1) == 0
        assert self.calc.add(0, 0) == 0

    def test_subtraction(self):
        """测试减法"""
        assert self.calc.subtract(5, 3) == 2
        assert self.calc.subtract(0, 5) == -5

    def test_multiplication(self):
        """测试乘法"""
        assert self.calc.multiply(3, 4) == 12
        assert self.calc.multiply(-2, 3) == -6
        assert self.calc.multiply(0, 5) == 0

class Calculator:
    def add(self, a, b):
        return a + b

    def subtract(self, a, b):
        return a - b

    def multiply(self, a, b):
        return a * b
```

::: note 测试编写技巧
1. **一个测试一个断言**：每个测试函数最好只验证一个行为
2. **测试命名清晰**：从测试名称就能理解测试的目的
3. **使用描述性变量名**：让测试代码自文档化
4. **避免复杂逻辑**：测试本身应该简单明了
:::

::: warning 常见陷阱
1. **浮点数精度**：直接比较浮点数可能因精度问题失败
2. **对象引用比较**：使用 `==` 比较内容，使用 `is` 比较引用
3. **可变对象**：注意列表、字典等可变对象的修改影响
4. **异步操作**：异步代码需要特殊的测试方法
:::

### 断言最佳实践总结

| 场景 | 推荐做法 | 避免做法 |
|------|----------|----------|
| 浮点数比较 | `math.isclose()` | 直接 `==` |
| 异常测试 | `pytest.raises()` | try/except |
| 容器检查 | `in` 操作符 | 遍历查找 |
| 类型检查 | `isinstance()` | `type() ==` |
| 自定义错误信息 | `assert expr, msg` | 只用 `assert expr` |

这样我们就掌握了 pytest 中断言的各种用法和测试用例编写的基础技能，为进一步学习高级特性奠定了坚实基础。