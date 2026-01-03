---
title: 第 6 章：异常测试与边界情况
date: 2025-10-03
icon: circle-dot
author: Haiyue
category:
  - pytest
star: false
---

# 第 6 章：异常测试与边界情况

::: tip 学习目标
- 掌握 pytest.raises 的使用
- 学习异常信息的验证
- 理解边界值测试的重要性
- 掌握错误处理的测试方法
:::

### 知识点

#### 异常测试的重要性

异常测试是软件测试的关键组成部分，确保程序在遇到错误情况时能够：

- **正确抛出异常**：在应该失败的时候失败
- **提供有意义的错误信息**：帮助用户和开发者理解问题
- **保持系统稳定**：不因异常导致系统崩溃
- **符合 API 契约**：按照文档规范处理错误

#### pytest.raises 上下文管理器

`pytest.raises` 是专门用于测试异常的工具：

```python
with pytest.raises(ExceptionType):
    # 期望抛出异常的代码

with pytest.raises(ExceptionType, match="错误信息模式"):
    # 验证异常类型和错误信息
```

#### 边界值测试策略

- **等价类划分**：将输入分为有效和无效等价类
- **边界值分析**：测试边界值和边界值附近的值
- **异常路径测试**：测试各种异常情况

### 示例代码

#### 基本异常测试

```python
# test_exception_basic.py
import pytest

def divide(a, b):
    """除法函数"""
    if b == 0:
        raise ValueError("除数不能为零")
    if not isinstance(a, (int, float)) or not isinstance(b, (int, float)):
        raise TypeError("参数必须是数字类型")
    return a / b

def test_divide_by_zero():
    """测试除零异常"""
    with pytest.raises(ValueError):
        divide(10, 0)

def test_divide_invalid_type():
    """测试类型错误异常"""
    with pytest.raises(TypeError):
        divide("10", 5)

    with pytest.raises(TypeError):
        divide(10, "5")

def test_divide_success():
    """测试正常除法"""
    assert divide(10, 2) == 5.0
    assert divide(7, 3) == pytest.approx(2.333, rel=1e-2)

# 验证异常信息
def test_divide_error_messages():
    """测试异常错误信息"""
    with pytest.raises(ValueError, match="除数不能为零"):
        divide(10, 0)

    with pytest.raises(TypeError, match="参数必须是数字类型"):
        divide("abc", 5)
```

#### 详细异常信息验证

```python
# test_exception_details.py
import pytest
import re

class CustomError(Exception):
    """自定义异常类"""
    def __init__(self, message, code=None):
        super().__init__(message)
        self.code = code

def process_user_data(user_data):
    """处理用户数据"""
    if not isinstance(user_data, dict):
        raise TypeError("用户数据必须是字典类型")

    if "name" not in user_data:
        raise CustomError("缺少必需字段: name", code="MISSING_NAME")

    if len(user_data["name"]) < 2:
        raise CustomError("姓名长度不能少于2个字符", code="NAME_TOO_SHORT")

    if "age" in user_data and user_data["age"] < 0:
        raise ValueError("年龄不能为负数")

    return {"status": "success", "user": user_data}

def test_exception_with_details():
    """测试异常详细信息"""
    # 测试异常类型和消息
    with pytest.raises(TypeError, match="用户数据必须是字典类型"):
        process_user_data("not a dict")

    # 测试自定义异常和错误代码
    with pytest.raises(CustomError) as exc_info:
        process_user_data({})

    assert exc_info.value.code == "MISSING_NAME"
    assert "缺少必需字段: name" in str(exc_info.value)

    # 测试异常属性
    with pytest.raises(CustomError) as exc_info:
        process_user_data({"name": "A"})

    exception = exc_info.value
    assert exception.code == "NAME_TOO_SHORT"
    assert "姓名长度不能少于2个字符" in str(exception)

def test_regex_match():
    """使用正则表达式匹配异常信息"""
    with pytest.raises(ValueError, match=r"年龄不能为负数"):
        process_user_data({"name": "Alice", "age": -5})

    # 更复杂的正则匹配
    with pytest.raises(CustomError, match=r"缺少必需字段: \w+"):
        process_user_data({})
```

#### 边界值测试

```python
# test_boundary_values.py
import pytest

def validate_age(age):
    """验证年龄"""
    if not isinstance(age, int):
        raise TypeError("年龄必须是整数")
    if age < 0:
        raise ValueError("年龄不能为负数")
    if age > 150:
        raise ValueError("年龄不能超过150")
    return True

def validate_score(score):
    """验证分数（0-100）"""
    if not isinstance(score, (int, float)):
        raise TypeError("分数必须是数字")
    if score < 0:
        raise ValueError("分数不能低于0")
    if score > 100:
        raise ValueError("分数不能超过100")
    return True

class TestBoundaryValues:
    """边界值测试类"""

    @pytest.mark.parametrize("age", [0, 1, 149, 150])
    def test_valid_age_boundaries(self, age):
        """测试有效年龄边界值"""
        assert validate_age(age) is True

    @pytest.mark.parametrize("age", [-1, 151])
    def test_invalid_age_boundaries(self, age):
        """测试无效年龄边界值"""
        with pytest.raises(ValueError):
            validate_age(age)

    def test_age_type_validation(self):
        """测试年龄类型验证"""
        invalid_types = [1.5, "25", None, [], {}]
        for invalid_age in invalid_types:
            with pytest.raises(TypeError):
                validate_age(invalid_age)

    @pytest.mark.parametrize("score", [0, 0.1, 50, 99.9, 100])
    def test_valid_score_boundaries(self, score):
        """测试有效分数边界值"""
        assert validate_score(score) is True

    @pytest.mark.parametrize("score", [-0.1, 100.1])
    def test_invalid_score_boundaries(self, score):
        """测试无效分数边界值"""
        with pytest.raises(ValueError):
            validate_score(score)
```

#### 列表和字符串边界测试

```python
# test_collection_boundaries.py
import pytest

def get_item(items, index):
    """安全获取列表项"""
    if not isinstance(items, list):
        raise TypeError("items 必须是列表类型")
    if not isinstance(index, int):
        raise TypeError("索引必须是整数")
    if index < 0 or index >= len(items):
        raise IndexError("索引超出范围")
    return items[index]

def substring(text, start, length):
    """安全截取子字符串"""
    if not isinstance(text, str):
        raise TypeError("text 必须是字符串")
    if not isinstance(start, int) or not isinstance(length, int):
        raise TypeError("start 和 length 必须是整数")
    if start < 0:
        raise ValueError("start 不能为负数")
    if length < 0:
        raise ValueError("length 不能为负数")
    if start >= len(text):
        raise IndexError("start 超出字符串长度")
    return text[start:start + length]

class TestCollectionBoundaries:
    """集合边界测试"""

    def test_list_valid_boundaries(self):
        """测试列表有效边界"""
        items = [1, 2, 3, 4, 5]

        # 边界值：第一个和最后一个元素
        assert get_item(items, 0) == 1
        assert get_item(items, 4) == 5

    def test_list_invalid_boundaries(self):
        """测试列表无效边界"""
        items = [1, 2, 3]

        # 负索引
        with pytest.raises(IndexError):
            get_item(items, -1)

        # 超出范围的索引
        with pytest.raises(IndexError):
            get_item(items, 3)

        # 空列表边界
        empty_list = []
        with pytest.raises(IndexError):
            get_item(empty_list, 0)

    def test_string_boundaries(self):
        """测试字符串边界"""
        text = "Hello"

        # 有效边界
        assert substring(text, 0, 1) == "H"
        assert substring(text, 4, 1) == "o"
        assert substring(text, 0, 5) == "Hello"

        # 边界情况
        assert substring(text, 0, 0) == ""
        assert substring(text, 2, 10) == "llo"  # 超出长度会自动截断

        # 无效边界
        with pytest.raises(IndexError):
            substring(text, 5, 1)  # start 等于长度

        with pytest.raises(ValueError):
            substring(text, -1, 1)  # 负 start

        with pytest.raises(ValueError):
            substring(text, 0, -1)  # 负 length
```

#### 网络和文件系统异常测试

```python
# test_external_exceptions.py
import pytest
import os
import tempfile
from unittest.mock import patch, mock_open

def read_config_file(file_path):
    """读取配置文件"""
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"配置文件不存在: {file_path}")

    if not os.access(file_path, os.R_OK):
        raise PermissionError(f"无权限读取文件: {file_path}")

    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            if not content.strip():
                raise ValueError("配置文件不能为空")
            return content
    except UnicodeDecodeError:
        raise ValueError("配置文件编码错误")

def make_api_request(url, timeout=30):
    """模拟 API 请求"""
    if not url.startswith(('http://', 'https://')):
        raise ValueError("URL 必须以 http:// 或 https:// 开头")

    if timeout <= 0:
        raise ValueError("超时时间必须大于0")

    # 模拟网络异常
    if "timeout" in url:
        raise TimeoutError("请求超时")
    if "notfound" in url:
        raise ConnectionError("无法连接到服务器")

    return {"status": "success", "data": "mock response"}

class TestFileSystemExceptions:
    """文件系统异常测试"""

    def test_file_not_found(self):
        """测试文件不存在异常"""
        with pytest.raises(FileNotFoundError, match="配置文件不存在"):
            read_config_file("/nonexistent/file.txt")

    def test_empty_file(self):
        """测试空文件异常"""
        with tempfile.NamedTemporaryFile(mode='w', delete=False) as f:
            temp_path = f.name

        try:
            with pytest.raises(ValueError, match="配置文件不能为空"):
                read_config_file(temp_path)
        finally:
            os.unlink(temp_path)

    @patch("builtins.open", mock_open(read_data="valid content"))
    def test_valid_file_content(self):
        """测试有效文件内容"""
        with patch("os.path.exists", return_value=True), \
             patch("os.access", return_value=True):
            result = read_config_file("mock_file.txt")
            assert result == "valid content"

    @patch("builtins.open", side_effect=UnicodeDecodeError("utf-8", b"", 0, 1, "invalid"))
    def test_encoding_error(self):
        """测试编码错误"""
        with patch("os.path.exists", return_value=True), \
             patch("os.access", return_value=True):
            with pytest.raises(ValueError, match="配置文件编码错误"):
                read_config_file("invalid_encoding.txt")

class TestNetworkExceptions:
    """网络异常测试"""

    def test_invalid_url(self):
        """测试无效 URL"""
        invalid_urls = ["ftp://example.com", "file:///path", "invalid-url"]

        for url in invalid_urls:
            with pytest.raises(ValueError, match="URL 必须以 http:// 或 https:// 开头"):
                make_api_request(url)

    def test_invalid_timeout(self):
        """测试无效超时时间"""
        with pytest.raises(ValueError, match="超时时间必须大于0"):
            make_api_request("https://api.example.com", timeout=0)

        with pytest.raises(ValueError, match="超时时间必须大于0"):
            make_api_request("https://api.example.com", timeout=-1)

    def test_network_timeout(self):
        """测试网络超时"""
        with pytest.raises(TimeoutError, match="请求超时"):
            make_api_request("https://timeout.example.com")

    def test_connection_error(self):
        """测试连接错误"""
        with pytest.raises(ConnectionError, match="无法连接到服务器"):
            make_api_request("https://notfound.example.com")

    def test_successful_request(self):
        """测试成功请求"""
        result = make_api_request("https://api.example.com")
        assert result["status"] == "success"
```

#### 上下文管理器异常测试

```python
# test_context_manager_exceptions.py
import pytest
from contextlib import contextmanager

class DatabaseConnection:
    """模拟数据库连接"""
    def __init__(self, connection_string):
        if not connection_string:
            raise ValueError("连接字符串不能为空")
        self.connection_string = connection_string
        self.connected = False

    def connect(self):
        """连接数据库"""
        if "invalid" in self.connection_string:
            raise ConnectionError("无法连接到数据库")
        self.connected = True

    def disconnect(self):
        """断开数据库连接"""
        self.connected = False

    def __enter__(self):
        self.connect()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.disconnect()
        # 如果有异常，不要抑制它
        return False

@contextmanager
def temporary_setting(setting_name, value):
    """临时设置上下文管理器"""
    original_value = os.environ.get(setting_name)
    try:
        os.environ[setting_name] = value
        yield
    except Exception as e:
        # 记录异常但继续清理
        print(f"异常发生: {e}")
        raise
    finally:
        if original_value is None:
            os.environ.pop(setting_name, None)
        else:
            os.environ[setting_name] = original_value

class TestContextManagerExceptions:
    """上下文管理器异常测试"""

    def test_database_connection_success(self):
        """测试成功的数据库连接"""
        with DatabaseConnection("valid://connection"):
            pass  # 连接应该成功建立和关闭

    def test_database_connection_invalid_string(self):
        """测试无效连接字符串"""
        with pytest.raises(ValueError, match="连接字符串不能为空"):
            DatabaseConnection("")

    def test_database_connection_failure(self):
        """测试数据库连接失败"""
        with pytest.raises(ConnectionError, match="无法连接到数据库"):
            with DatabaseConnection("invalid://connection"):
                pass

    def test_exception_in_context(self):
        """测试上下文中的异常"""
        with pytest.raises(RuntimeError, match="上下文中的错误"):
            with DatabaseConnection("valid://connection") as db:
                assert db.connected is True
                raise RuntimeError("上下文中的错误")

    def test_temporary_setting_context(self):
        """测试临时设置上下文管理器"""
        import os

        # 设置测试环境变量
        test_var = "TEST_VARIABLE"
        test_value = "test_value"

        # 确保测试变量不存在
        os.environ.pop(test_var, None)

        with temporary_setting(test_var, test_value):
            assert os.environ[test_var] == test_value

        # 上下文退出后变量应该被清理
        assert test_var not in os.environ

    def test_temporary_setting_with_exception(self):
        """测试临时设置中发生异常"""
        import os

        test_var = "TEST_VARIABLE"
        test_value = "test_value"

        os.environ.pop(test_var, None)

        with pytest.raises(ValueError, match="测试异常"):
            with temporary_setting(test_var, test_value):
                assert os.environ[test_var] == test_value
                raise ValueError("测试异常")

        # 即使发生异常，变量也应该被清理
        assert test_var not in os.environ
```

::: note 异常测试最佳实践
1. **具体异常类型**：测试具体的异常类型，而不是通用的 Exception
2. **验证错误信息**：使用 match 参数验证错误信息的准确性
3. **边界值覆盖**：全面测试边界值和边界外的值
4. **异常属性**：测试自定义异常的特殊属性
5. **清理资源**：确保异常情况下资源得到正确清理
:::

::: warning 常见陷阱
1. **异常被吞没**：确保测试真的会抛出预期的异常
2. **错误的异常类型**：验证抛出的是正确类型的异常
3. **副作用**：注意异常测试可能产生的副作用
4. **资源泄漏**：异常情况下的资源管理
:::

异常测试和边界情况测试是保证软件健壮性的重要手段，通过全面的异常测试可以确保软件在各种异常情况下都能正确处理。