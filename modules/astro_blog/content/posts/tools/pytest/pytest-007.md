---
title: 第 7 章：Mock 与测试替身
date: 2025-10-03
icon: circle-dot
author: Haiyue
category:
  - pytest
star: false
---

# 第 7 章：Mock 与测试替身

::: tip 学习目标
- 理解 Mock 的概念和应用场景
- 掌握 unittest.mock 的使用
- 学习依赖注入和隔离测试
- 掌握 pytest-mock 插件的使用
:::

### 知识点

#### Mock 概念与用途

Mock（模拟对象）是测试中的替身技术，用于：

- **隔离依赖**：隔离被测试代码与外部依赖
- **控制行为**：精确控制依赖的行为和返回值
- **验证交互**：验证方法调用次数和参数
- **提高速度**：避免真实的网络、数据库调用

#### 测试替身类型

| 类型 | 说明 | 使用场景 |
|------|------|----------|
| **Dummy** | 占位对象，不被使用 | 满足接口要求 |
| **Fake** | 简化的工作实现 | 内存数据库 |
| **Stub** | 预设响应的对象 | 固定返回值 |
| **Spy** | 记录调用信息的对象 | 验证交互 |
| **Mock** | 完全可控的测试替身 | 复杂交互测试 |

#### Mock 工具对比

```python
# unittest.mock - Python 内置
from unittest.mock import Mock, patch, MagicMock

# pytest-mock - pytest 集成
pytest.MonkeyPatch, mocker fixture

# responses - HTTP 请求 mock
import responses
```

### 示例代码

#### 基本 Mock 使用

```python
# test_mock_basic.py
import pytest
from unittest.mock import Mock, MagicMock, patch

# 被测试的代码
class EmailService:
    """邮件服务"""
    def __init__(self, smtp_client):
        self.smtp_client = smtp_client

    def send_email(self, to_email, subject, body):
        """发送邮件"""
        try:
            result = self.smtp_client.send(
                to=to_email,
                subject=subject,
                body=body
            )
            return {"status": "success", "message_id": result.message_id}
        except Exception as e:
            return {"status": "error", "error": str(e)}

    def send_bulk_emails(self, email_list):
        """批量发送邮件"""
        results = []
        for email_data in email_list:
            result = self.send_email(
                email_data["to"],
                email_data["subject"],
                email_data["body"]
            )
            results.append(result)
        return results

class TestEmailService:
    """邮件服务测试"""

    def test_send_email_success(self):
        """测试成功发送邮件"""
        # 创建 mock 对象
        mock_smtp_client = Mock()
        mock_result = Mock()
        mock_result.message_id = "msg_123456"
        mock_smtp_client.send.return_value = mock_result

        # 创建服务实例
        email_service = EmailService(mock_smtp_client)

        # 执行测试
        result = email_service.send_email(
            "test@example.com",
            "Test Subject",
            "Test Body"
        )

        # 验证结果
        assert result["status"] == "success"
        assert result["message_id"] == "msg_123456"

        # 验证 mock 调用
        mock_smtp_client.send.assert_called_once_with(
            to="test@example.com",
            subject="Test Subject",
            body="Test Body"
        )

    def test_send_email_failure(self):
        """测试发送邮件失败"""
        # 创建抛出异常的 mock
        mock_smtp_client = Mock()
        mock_smtp_client.send.side_effect = ConnectionError("SMTP server unavailable")

        email_service = EmailService(mock_smtp_client)

        result = email_service.send_email(
            "test@example.com",
            "Test Subject",
            "Test Body"
        )

        # 验证错误处理
        assert result["status"] == "error"
        assert "SMTP server unavailable" in result["error"]

    def test_bulk_email_sending(self):
        """测试批量邮件发送"""
        mock_smtp_client = Mock()
        mock_result = Mock()
        mock_result.message_id = "msg_123"
        mock_smtp_client.send.return_value = mock_result

        email_service = EmailService(mock_smtp_client)

        email_list = [
            {"to": "user1@example.com", "subject": "Subject 1", "body": "Body 1"},
            {"to": "user2@example.com", "subject": "Subject 2", "body": "Body 2"}
        ]

        results = email_service.send_bulk_emails(email_list)

        # 验证结果
        assert len(results) == 2
        assert all(r["status"] == "success" for r in results)

        # 验证调用次数
        assert mock_smtp_client.send.call_count == 2
```

#### 使用 patch 装饰器

```python
# test_patch_decorator.py
import requests
from unittest.mock import patch, Mock

# 被测试的代码
class APIClient:
    """API 客户端"""
    def __init__(self, base_url):
        self.base_url = base_url

    def get_user(self, user_id):
        """获取用户信息"""
        response = requests.get(f"{self.base_url}/users/{user_id}")
        response.raise_for_status()
        return response.json()

    def create_user(self, user_data):
        """创建用户"""
        response = requests.post(
            f"{self.base_url}/users",
            json=user_data
        )
        response.raise_for_status()
        return response.json()

    def get_user_with_retry(self, user_id, max_retries=3):
        """带重试的用户获取"""
        import time

        for attempt in range(max_retries):
            try:
                return self.get_user(user_id)
            except requests.RequestException:
                if attempt == max_retries - 1:
                    raise
                time.sleep(1)

class TestAPIClient:
    """API 客户端测试"""

    @patch('requests.get')
    def test_get_user_success(self, mock_get):
        """测试成功获取用户"""
        # 设置 mock 返回值
        mock_response = Mock()
        mock_response.json.return_value = {
            "id": 1,
            "name": "John Doe",
            "email": "john@example.com"
        }
        mock_response.raise_for_status.return_value = None
        mock_get.return_value = mock_response

        # 执行测试
        client = APIClient("https://api.example.com")
        user = client.get_user(1)

        # 验证结果
        assert user["id"] == 1
        assert user["name"] == "John Doe"
        assert user["email"] == "john@example.com"

        # 验证调用
        mock_get.assert_called_once_with("https://api.example.com/users/1")

    @patch('requests.get')
    def test_get_user_not_found(self, mock_get):
        """测试用户不存在"""
        # 设置 mock 抛出异常
        mock_response = Mock()
        mock_response.raise_for_status.side_effect = requests.HTTPError("404 Not Found")
        mock_get.return_value = mock_response

        client = APIClient("https://api.example.com")

        with pytest.raises(requests.HTTPError):
            client.get_user(999)

    @patch('requests.post')
    def test_create_user(self, mock_post):
        """测试创建用户"""
        # 设置 mock 返回值
        mock_response = Mock()
        mock_response.json.return_value = {
            "id": 2,
            "name": "Jane Doe",
            "email": "jane@example.com"
        }
        mock_response.raise_for_status.return_value = None
        mock_post.return_value = mock_response

        client = APIClient("https://api.example.com")
        user_data = {"name": "Jane Doe", "email": "jane@example.com"}

        result = client.create_user(user_data)

        # 验证结果
        assert result["id"] == 2
        assert result["name"] == "Jane Doe"

        # 验证调用参数
        mock_post.assert_called_once_with(
            "https://api.example.com/users",
            json=user_data
        )

    @patch('time.sleep')
    @patch('requests.get')
    def test_get_user_with_retry(self, mock_get, mock_sleep):
        """测试重试机制"""
        # 设置前两次调用失败，第三次成功
        mock_response_success = Mock()
        mock_response_success.json.return_value = {"id": 1, "name": "John"}
        mock_response_success.raise_for_status.return_value = None

        mock_get.side_effect = [
            requests.RequestException("Network error"),
            requests.RequestException("Timeout"),
            mock_response_success
        ]

        client = APIClient("https://api.example.com")
        result = client.get_user_with_retry(1)

        # 验证结果
        assert result["id"] == 1
        assert result["name"] == "John"

        # 验证重试次数
        assert mock_get.call_count == 3
        assert mock_sleep.call_count == 2  # 前两次失败后的 sleep
```

#### pytest-mock 插件使用

```python
# test_pytest_mock.py
# 需要安装: pip install pytest-mock

import requests
import os
from pathlib import Path

# 被测试的代码
class FileManager:
    """文件管理器"""

    def read_config(self, config_path):
        """读取配置文件"""
        if not os.path.exists(config_path):
            raise FileNotFoundError(f"配置文件不存在: {config_path}")

        with open(config_path, 'r') as f:
            return f.read()

    def write_log(self, message):
        """写入日志"""
        log_path = Path("app.log")
        with open(log_path, 'a') as f:
            import datetime
            timestamp = datetime.datetime.now().isoformat()
            f.write(f"[{timestamp}] {message}\n")

class WeatherService:
    """天气服务"""

    def __init__(self, api_key):
        self.api_key = api_key
        self.base_url = "https://api.weather.com"

    def get_current_weather(self, city):
        """获取当前天气"""
        url = f"{self.base_url}/current"
        params = {
            "city": city,
            "key": self.api_key
        }

        response = requests.get(url, params=params)
        response.raise_for_status()

        data = response.json()
        return {
            "city": data["location"]["city"],
            "temperature": data["current"]["temp_c"],
            "description": data["current"]["condition"]["text"]
        }

class TestWithPytestMock:
    """使用 pytest-mock 的测试"""

    def test_file_manager_read_config(self, mocker):
        """测试读取配置文件"""
        # mock os.path.exists
        mocker.patch('os.path.exists', return_value=True)

        # mock open 和文件内容
        mock_open = mocker.mock_open(read_data="config_content")
        mocker.patch('builtins.open', mock_open)

        file_manager = FileManager()
        content = file_manager.read_config("/path/to/config.ini")

        assert content == "config_content"
        mock_open.assert_called_once_with("/path/to/config.ini", 'r')

    def test_file_manager_config_not_found(self, mocker):
        """测试配置文件不存在"""
        # mock os.path.exists 返回 False
        mocker.patch('os.path.exists', return_value=False)

        file_manager = FileManager()

        with pytest.raises(FileNotFoundError, match="配置文件不存在"):
            file_manager.read_config("/nonexistent/config.ini")

    def test_file_manager_write_log(self, mocker):
        """测试写入日志"""
        # mock datetime
        mock_datetime = mocker.patch('datetime.datetime')
        mock_datetime.now.return_value.isoformat.return_value = "2023-01-01T12:00:00"

        # mock open
        mock_open = mocker.mock_open()
        mocker.patch('builtins.open', mock_open)

        file_manager = FileManager()
        file_manager.write_log("Test message")

        # 验证文件写入
        mock_open.assert_called_once_with(Path("app.log"), 'a')
        mock_open().write.assert_called_once_with("[2023-01-01T12:00:00] Test message\n")

    def test_weather_service_success(self, mocker):
        """测试天气服务成功响应"""
        # mock requests.get
        mock_response = mocker.Mock()
        mock_response.json.return_value = {
            "location": {"city": "Beijing"},
            "current": {
                "temp_c": 25.0,
                "condition": {"text": "Sunny"}
            }
        }
        mock_response.raise_for_status.return_value = None

        mock_get = mocker.patch('requests.get', return_value=mock_response)

        weather_service = WeatherService("test_api_key")
        result = weather_service.get_current_weather("Beijing")

        # 验证结果
        assert result["city"] == "Beijing"
        assert result["temperature"] == 25.0
        assert result["description"] == "Sunny"

        # 验证 API 调用
        mock_get.assert_called_once_with(
            "https://api.weather.com/current",
            params={"city": "Beijing", "key": "test_api_key"}
        )

    def test_weather_service_api_error(self, mocker):
        """测试 API 错误"""
        mock_response = mocker.Mock()
        mock_response.raise_for_status.side_effect = requests.HTTPError("API Error")

        mocker.patch('requests.get', return_value=mock_response)

        weather_service = WeatherService("test_api_key")

        with pytest.raises(requests.HTTPError):
            weather_service.get_current_weather("Invalid City")
```

#### 高级 Mock 技巧

```python
# test_advanced_mock.py
import pytest
from unittest.mock import Mock, MagicMock, PropertyMock, call
import asyncio

# 被测试的代码
class DatabaseConnection:
    """数据库连接类"""

    def __init__(self, connection_string):
        self.connection_string = connection_string
        self._connected = False

    @property
    def connected(self):
        return self._connected

    def connect(self):
        """连接数据库"""
        # 模拟连接逻辑
        self._connected = True
        return True

    def execute_query(self, query, params=None):
        """执行查询"""
        if not self.connected:
            raise RuntimeError("数据库未连接")

        # 模拟查询执行
        return {"query": query, "params": params, "rows": []}

    def close(self):
        """关闭连接"""
        self._connected = False

class UserRepository:
    """用户仓库"""

    def __init__(self, db_connection):
        self.db = db_connection

    def find_user_by_id(self, user_id):
        """根据 ID 查找用户"""
        if not self.db.connected:
            self.db.connect()

        result = self.db.execute_query(
            "SELECT * FROM users WHERE id = ?",
            (user_id,)
        )

        if result["rows"]:
            return result["rows"][0]
        return None

    def create_user(self, user_data):
        """创建用户"""
        if not self.db.connected:
            self.db.connect()

        query = "INSERT INTO users (name, email) VALUES (?, ?)"
        params = (user_data["name"], user_data["email"])

        result = self.db.execute_query(query, params)
        return {"id": 1, **user_data}  # 模拟返回

class AsyncAPIClient:
    """异步 API 客户端"""

    async def fetch_data(self, url):
        """异步获取数据"""
        import aiohttp
        async with aiohttp.ClientSession() as session:
            async with session.get(url) as response:
                return await response.json()

class TestAdvancedMock:
    """高级 Mock 技巧测试"""

    def test_mock_property(self, mocker):
        """测试 mock 属性"""
        # 创建 mock 数据库连接
        mock_db = Mock(spec=DatabaseConnection)

        # mock 属性
        type(mock_db).connected = PropertyMock(return_value=True)

        repo = UserRepository(mock_db)

        # connected 属性应该返回 True
        assert mock_db.connected is True

        # 不应该调用 connect，因为已经连接
        repo.find_user_by_id(1)
        mock_db.connect.assert_not_called()

    def test_mock_side_effect_function(self):
        """测试 side_effect 函数"""
        def mock_execute_query(query, params=None):
            """自定义的 mock 函数"""
            if "SELECT" in query and params and params[0] == 1:
                return {"rows": [{"id": 1, "name": "John", "email": "john@example.com"}]}
            elif "INSERT" in query:
                return {"rows": [], "last_insert_id": 1}
            else:
                return {"rows": []}

        mock_db = Mock()
        mock_db.connected = True
        mock_db.execute_query.side_effect = mock_execute_query

        repo = UserRepository(mock_db)

        # 测试查找用户
        user = repo.find_user_by_id(1)
        assert user["name"] == "John"

        # 测试创建用户
        new_user = repo.create_user({"name": "Jane", "email": "jane@example.com"})
        assert new_user["name"] == "Jane"

    def test_mock_call_tracking(self):
        """测试调用跟踪"""
        mock_db = Mock()
        mock_db.connected = False
        mock_db.execute_query.return_value = {"rows": []}

        repo = UserRepository(mock_db)

        # 执行多个操作
        repo.find_user_by_id(1)
        repo.find_user_by_id(2)
        repo.create_user({"name": "Test", "email": "test@example.com"})

        # 验证调用次数
        assert mock_db.connect.call_count == 3
        assert mock_db.execute_query.call_count == 3

        # 验证调用顺序
        expected_calls = [
            call("SELECT * FROM users WHERE id = ?", (1,)),
            call("SELECT * FROM users WHERE id = ?", (2,)),
            call("INSERT INTO users (name, email) VALUES (?, ?)", ("Test", "test@example.com"))
        ]
        mock_db.execute_query.assert_has_calls(expected_calls)

    def test_mock_context_manager(self, mocker):
        """测试 mock 上下文管理器"""
        # mock 数据库连接作为上下文管理器
        mock_db = mocker.MagicMock()
        mock_db.__enter__.return_value = mock_db
        mock_db.execute_query.return_value = {"rows": [{"id": 1, "name": "Test"}]}

        # 使用上下文管理器
        with mock_db as db:
            result = db.execute_query("SELECT * FROM users")

        # 验证上下文管理器调用
        mock_db.__enter__.assert_called_once()
        mock_db.__exit__.assert_called_once()
        assert result["rows"][0]["name"] == "Test"

    @pytest.mark.asyncio
    async def test_async_mock(self, mocker):
        """测试异步 mock"""
        # mock aiohttp 模块
        mock_session = mocker.AsyncMock()
        mock_response = mocker.AsyncMock()
        mock_response.json.return_value = {"data": "test_data"}

        mock_session.__aenter__.return_value = mock_session
        mock_session.get.return_value.__aenter__.return_value = mock_response

        # mock aiohttp.ClientSession
        mocker.patch('aiohttp.ClientSession', return_value=mock_session)

        client = AsyncAPIClient()
        result = await client.fetch_data("https://api.example.com/data")

        assert result["data"] == "test_data"

    def test_mock_partial_methods(self):
        """测试部分方法 mock"""
        # 创建真实对象，但 mock 特定方法
        db = DatabaseConnection("test://connection")

        # mock execute_query 方法，但保留其他方法
        with patch.object(db, 'execute_query') as mock_execute:
            mock_execute.return_value = {"rows": [{"id": 1, "name": "Mocked User"}]}

            repo = UserRepository(db)

            # connect 方法是真实的
            assert not db.connected

            user = repo.find_user_by_id(1)

            # connect 被真实调用
            assert db.connected

            # execute_query 被 mock
            assert user["name"] == "Mocked User"
            mock_execute.assert_called_once()

    def test_mock_chained_calls(self):
        """测试链式调用 mock"""
        mock_api = Mock()

        # 设置链式调用
        mock_api.users.get.return_value.json.return_value = {
            "id": 1,
            "name": "John"
        }

        # 模拟 API 调用
        result = mock_api.users.get(1).json()

        assert result["name"] == "John"
        mock_api.users.get.assert_called_once_with(1)

    def test_mock_configuration(self):
        """测试 mock 配置"""
        # 使用 spec 确保 mock 对象具有正确的接口
        mock_db = Mock(spec=DatabaseConnection)

        # 这将工作，因为 DatabaseConnection 有 connect 方法
        mock_db.connect()

        # 这将引发 AttributeError，因为 DatabaseConnection 没有 invalid_method
        with pytest.raises(AttributeError):
            mock_db.invalid_method()

    def test_spy_pattern(self, mocker):
        """测试间谍模式"""
        # 创建真实对象
        db = DatabaseConnection("test://connection")

        # 使用 spy 监视真实方法
        spy_connect = mocker.spy(db, 'connect')

        # 调用真实方法
        db.connect()

        # 验证方法被调用
        spy_connect.assert_called_once()

        # 真实功能仍然工作
        assert db.connected is True
```

#### Mock 最佳实践

```python
# test_mock_best_practices.py
import pytest
from unittest.mock import Mock, patch
from contextlib import contextmanager

class TestMockBestPractices:
    """Mock 最佳实践示例"""

    def test_mock_return_value_vs_side_effect(self):
        """return_value vs side_effect 的使用"""
        mock_func = Mock()

        # 使用 return_value 返回固定值
        mock_func.return_value = "fixed_result"
        assert mock_func() == "fixed_result"

        # 使用 side_effect 返回不同值
        mock_func.side_effect = ["result1", "result2", "result3"]
        assert mock_func() == "result1"
        assert mock_func() == "result2"
        assert mock_func() == "result3"

        # side_effect 也可以是函数
        mock_func.side_effect = lambda x: f"processed_{x}"
        assert mock_func("input") == "processed_input"

    def test_mock_with_spec(self):
        """使用 spec 限制 mock 行为"""
        # 没有 spec 的 mock 可以调用任何属性
        loose_mock = Mock()
        loose_mock.any_method()  # 不会报错

        # 有 spec 的 mock 只能调用指定类的方法
        class RealClass:
            def real_method(self):
                pass

        strict_mock = Mock(spec=RealClass)
        strict_mock.real_method()  # 正常

        with pytest.raises(AttributeError):
            strict_mock.fake_method()  # 会报错

    @contextmanager
    def temporary_mock(self, target, **kwargs):
        """临时 mock 上下文管理器"""
        with patch(target, **kwargs) as mock:
            yield mock

    def test_custom_mock_context(self):
        """自定义 mock 上下文"""
        with self.temporary_mock('time.sleep', return_value=None) as mock_sleep:
            import time
            time.sleep(1)
            mock_sleep.assert_called_once_with(1)

    def test_mock_cleanup(self):
        """确保 mock 清理"""
        original_function = len

        with patch('builtins.len', return_value=42):
            assert len([1, 2, 3]) == 42  # mock 生效

        # patch 结束后，原始函数恢复
        assert len([1, 2, 3]) == 3

    def test_avoid_over_mocking(self):
        """避免过度 mock"""
        # 不好的做法：mock 太多内部细节
        # 好的做法：只 mock 外部依赖

        class Calculator:
            def add(self, a, b):
                return a + b

            def multiply(self, a, b):
                return a * b

            def complex_calculation(self, x, y):
                sum_result = self.add(x, y)
                return self.multiply(sum_result, 2)

        calc = Calculator()

        # 不要 mock 内部方法 add 和 multiply
        # 直接测试 complex_calculation 的结果
        result = calc.complex_calculation(3, 4)
        assert result == 14  # (3 + 4) * 2

    def test_mock_assertions(self):
        """Mock 断言最佳实践"""
        mock_func = Mock()

        # 调用 mock
        mock_func("arg1", "arg2", key="value")

        # 详细断言
        mock_func.assert_called_once_with("arg1", "arg2", key="value")

        # 检查调用次数
        assert mock_func.call_count == 1

        # 检查是否被调用
        assert mock_func.called

        # 重置 mock
        mock_func.reset_mock()
        assert not mock_func.called
```

::: note Mock 最佳实践
1. **明确边界**：只 mock 外部依赖，不 mock 被测试的代码
2. **使用 spec**：使用 `spec` 参数确保 mock 对象的接口正确
3. **验证交互**：不仅验证返回值，还要验证方法调用
4. **避免过度 mock**：过多的 mock 会使测试变得脆弱
5. **清理 mock**：确保 mock 在测试结束后被正确清理
:::

::: warning 常见陷阱
1. **mock 错误的对象**：确保 mock 的是正确的导入路径
2. **过度 mock**：不要 mock 被测试代码的内部方法
3. **忘记验证**：创建 mock 后要验证其交互
4. **状态污染**：确保 mock 不会影响其他测试
:::

Mock 是隔离测试和控制依赖的强大工具，正确使用 Mock 可以编写更加可靠和快速的测试。