---
title: 第 5 章：测试标记与分组
date: 2025-10-03
icon: circle-dot
author: Haiyue
category:
  - pytest
star: false
---

# 第 5 章：测试标记与分组

::: tip 学习目标
- 掌握自定义标记的创建和使用
- 学习内置标记的应用
- 理解测试分组和选择性运行
- 掌握标记的组合使用
:::

### 知识点

#### 测试标记概念

测试标记（Markers）是 pytest 提供的一种给测试添加元数据的机制，允许：

- **测试分类**：将测试按功能、类型或优先级分组
- **选择性运行**：根据标记运行特定的测试子集
- **条件执行**：基于环境或条件跳过或运行测试
- **测试管理**：更好地组织和管理大型测试套件

#### 内置标记

| 标记 | 功能 |
|------|------|
| `@pytest.mark.skip` | 无条件跳过测试 |
| `@pytest.mark.skipif` | 条件性跳过测试 |
| `@pytest.mark.xfail` | 预期失败的测试 |
| `@pytest.mark.parametrize` | 参数化测试 |
| `@pytest.mark.filterwarnings` | 过滤警告 |

#### 自定义标记

可以创建自定义标记来满足特定需求：
- 功能模块标记（如 `@pytest.mark.auth`、`@pytest.mark.api`）
- 测试类型标记（如 `@pytest.mark.unit`、`@pytest.mark.integration`）
- 优先级标记（如 `@pytest.mark.critical`、`@pytest.mark.low_priority`）

### 示例代码

#### 基本标记使用

```python
# test_basic_marks.py
import pytest
import sys

@pytest.mark.skip(reason="功能尚未实现")
def test_unimplemented_feature():
    """跳过未实现的功能测试"""
    assert False  # 这个测试会被跳过

@pytest.mark.skipif(sys.version_info < (3, 8), reason="需要 Python 3.8+")
def test_python38_feature():
    """条件性跳过测试"""
    # 使用 Python 3.8+ 的新特性
    result = "hello"
    assert result := "hello"  # 海象操作符

@pytest.mark.xfail(reason="已知的 bug，等待修复")
def test_known_bug():
    """预期失败的测试"""
    assert 1 == 2  # 这个测试预期会失败

@pytest.mark.xfail(sys.platform == "win32", reason="在 Windows 上失败")
def test_unix_specific():
    """在特定平台上预期失败"""
    import os
    assert os.name == "posix"

# 条件性预期失败
@pytest.mark.xfail(
    condition=sys.version_info < (3, 9),
    reason="Python 3.9+ 中修复的 bug"
)
def test_version_specific_fix():
    """版本特定的修复测试"""
    # 模拟在旧版本中存在 bug 的功能
    result = "test"
    assert len(result) == 4
```

#### 自定义标记示例

```python
# test_custom_marks.py
import pytest

# 在 pytest.ini 或 pyproject.toml 中注册自定义标记
# 或者使用 pytestmark 声明

# 功能模块标记
@pytest.mark.auth
def test_user_login():
    """用户登录测试"""
    assert True

@pytest.mark.auth
def test_user_logout():
    """用户登出测试"""
    assert True

@pytest.mark.api
def test_api_endpoint():
    """API 端点测试"""
    assert True

# 测试类型标记
@pytest.mark.unit
def test_calculate_sum():
    """单元测试"""
    assert 2 + 2 == 4

@pytest.mark.integration
def test_database_integration():
    """集成测试"""
    # 模拟数据库集成测试
    assert True

@pytest.mark.e2e
def test_end_to_end_workflow():
    """端到端测试"""
    # 模拟完整的用户工作流
    assert True

# 性能和优先级标记
@pytest.mark.slow
def test_slow_operation():
    """慢速测试"""
    import time
    time.sleep(0.1)  # 模拟慢速操作
    assert True

@pytest.mark.critical
def test_critical_functionality():
    """关键功能测试"""
    assert True

@pytest.mark.smoke
def test_basic_smoke():
    """冒烟测试"""
    assert True

# 环境标记
@pytest.mark.dev
def test_development_feature():
    """开发环境测试"""
    assert True

@pytest.mark.prod
def test_production_ready():
    """生产环境测试"""
    assert True
```

#### 多重标记和组合标记

```python
# test_multiple_marks.py
import pytest

@pytest.mark.auth
@pytest.mark.critical
@pytest.mark.unit
def test_authentication_core():
    """核心认证单元测试"""
    assert True

@pytest.mark.api
@pytest.mark.integration
@pytest.mark.slow
def test_api_integration_slow():
    """慢速 API 集成测试"""
    import time
    time.sleep(0.05)
    assert True

@pytest.mark.smoke
@pytest.mark.critical
def test_smoke_critical():
    """关键冒烟测试"""
    assert True

# 使用 pytestmark 为整个模块添加标记
pytestmark = [pytest.mark.database, pytest.mark.integration]

def test_user_creation():
    """用户创建测试（自动继承模块标记）"""
    assert True

def test_user_deletion():
    """用户删除测试（自动继承模块标记）"""
    assert True

# 测试类级别的标记
@pytest.mark.api
class TestAPIOperations:
    """API 操作测试类"""

    @pytest.mark.get
    def test_get_request(self):
        """GET 请求测试"""
        assert True

    @pytest.mark.post
    @pytest.mark.slow
    def test_post_request(self):
        """POST 请求测试"""
        assert True

    @pytest.mark.delete
    @pytest.mark.critical
    def test_delete_request(self):
        """DELETE 请求测试"""
        assert True
```

#### 动态标记和条件标记

```python
# test_dynamic_marks.py
import pytest
import os

def pytest_collection_modifyitems(config, items):
    """动态修改测试项目的标记"""
    for item in items:
        # 为所有包含 "slow" 的测试添加 slow 标记
        if "slow" in item.nodeid:
            item.add_marker(pytest.mark.slow)

        # 为特定模块添加标记
        if "database" in str(item.fspath):
            item.add_marker(pytest.mark.database)

# 条件性标记装饰器
def requires_network(func):
    """需要网络连接的装饰器"""
    return pytest.mark.skipif(
        not os.getenv("NETWORK_TESTS"),
        reason="需要设置 NETWORK_TESTS 环境变量"
    )(func)

def requires_docker(func):
    """需要 Docker 的装饰器"""
    import subprocess
    try:
        subprocess.run(["docker", "--version"],
                      capture_output=True, check=True)
        docker_available = True
    except (subprocess.CalledProcessError, FileNotFoundError):
        docker_available = False

    return pytest.mark.skipif(
        not docker_available,
        reason="需要 Docker 环境"
    )(func)

@requires_network
def test_api_call():
    """需要网络的 API 调用测试"""
    # 模拟网络 API 调用
    assert True

@requires_docker
def test_container_deployment():
    """需要 Docker 的容器部署测试"""
    # 模拟容器部署测试
    assert True

# 基于配置的条件标记
@pytest.mark.skipif(
    not pytest.config.getoption("--run-expensive"),
    reason="需要 --run-expensive 选项"
)
def test_expensive_operation():
    """昂贵操作测试"""
    assert True
```

#### 参数化与标记结合

```python
# test_params_with_marks.py
import pytest

@pytest.mark.parametrize("input_val,expected", [
    pytest.param(1, 2, marks=pytest.mark.fast),
    pytest.param(2, 4, marks=pytest.mark.fast),
    pytest.param(1000, 2000, marks=pytest.mark.slow),
    pytest.param(10000, 20000, marks=[pytest.mark.slow, pytest.mark.heavy])
])
def test_double_function(input_val, expected):
    """参数化测试与标记结合"""
    result = input_val * 2
    assert result == expected

@pytest.mark.parametrize("browser", [
    pytest.param("chrome", marks=pytest.mark.stable),
    pytest.param("firefox", marks=pytest.mark.stable),
    pytest.param("safari", marks=pytest.mark.skipif(
        os.name == 'nt', reason="Safari not available on Windows")),
    pytest.param("edge", marks=pytest.mark.experimental)
])
def test_browser_compatibility(browser):
    """浏览器兼容性测试"""
    assert browser in ["chrome", "firefox", "safari", "edge"]

# 标记的参数化
@pytest.mark.parametrize("env", ["dev", "staging", "prod"])
@pytest.mark.parametrize("feature", ["auth", "payment", "reporting"])
def test_feature_across_environments(env, feature):
    """跨环境功能测试"""
    # 根据环境和功能组合进行测试
    if env == "prod" and feature == "experimental":
        pytest.skip("生产环境不运行实验性功能")

    assert True
```

#### 标记配置和注册

```python
# pytest.ini 配置示例
"""
[tool:pytest]
markers =
    auth: 认证相关测试
    api: API 相关测试
    unit: 单元测试
    integration: 集成测试
    e2e: 端到端测试
    slow: 慢速测试
    fast: 快速测试
    critical: 关键测试
    smoke: 冒烟测试
    dev: 开发环境测试
    prod: 生产环境测试
    database: 数据库相关测试
    network: 需要网络的测试
    experimental: 实验性功能测试
"""

# conftest.py 中注册标记
def pytest_configure(config):
    """注册自定义标记"""
    config.addinivalue_line(
        "markers", "auth: 认证相关测试"
    )
    config.addinivalue_line(
        "markers", "api: API 相关测试"
    )
    config.addinivalue_line(
        "markers", "slow: 慢速测试，可能需要较长时间"
    )

# 添加命令行选项
def pytest_addoption(parser):
    """添加自定义命令行选项"""
    parser.addoption(
        "--run-slow",
        action="store_true",
        default=False,
        help="运行标记为 slow 的测试"
    )
    parser.addoption(
        "--run-expensive",
        action="store_true",
        default=False,
        help="运行昂贵的测试"
    )

def pytest_collection_modifyitems(config, items):
    """根据命令行选项修改测试收集"""
    if not config.getoption("--run-slow"):
        # 如果没有 --run-slow 选项，跳过慢速测试
        skip_slow = pytest.mark.skip(reason="需要 --run-slow 选项运行")
        for item in items:
            if "slow" in item.keywords:
                item.add_marker(skip_slow)
```

### 运行特定标记的测试

#### 命令行使用示例

```bash
# 运行特定标记的测试
pytest -m "auth"                    # 运行认证测试
pytest -m "api and not slow"       # 运行 API 测试但排除慢速测试
pytest -m "critical or smoke"      # 运行关键或冒烟测试
pytest -m "unit and not integration" # 运行单元测试但排除集成测试

# 运行多个标记的组合
pytest -m "(auth or api) and critical"  # 运行关键的认证或 API 测试

# 查看所有可用的标记
pytest --markers

# 查看会运行哪些测试（不实际运行）
pytest -m "smoke" --collect-only

# 运行未标记的测试
pytest -m "not slow"

# 详细输出显示标记信息
pytest -v -m "critical"
```

#### 标记表达式语法

| 表达式 | 说明 |
|--------|------|
| `auth` | 有 auth 标记的测试 |
| `not slow` | 没有 slow 标记的测试 |
| `auth and critical` | 同时有 auth 和 critical 标记 |
| `auth or api` | 有 auth 或 api 标记的测试 |
| `(auth or api) and not slow` | 有 auth 或 api 但没有 slow 标记 |

#### 实际使用场景

```python
# test_real_world_marks.py
import pytest

# CI/CD 管道中的不同阶段
@pytest.mark.pr_check  # Pull Request 检查
@pytest.mark.fast
def test_basic_functionality():
    """PR 检查的基本功能测试"""
    assert True

@pytest.mark.nightly  # 夜间构建
@pytest.mark.slow
@pytest.mark.integration
def test_comprehensive_integration():
    """夜间构建的综合集成测试"""
    assert True

@pytest.mark.release  # 发布前测试
@pytest.mark.e2e
@pytest.mark.critical
def test_release_readiness():
    """发布准备测试"""
    assert True

# 基于环境的测试
@pytest.mark.local_only
def test_local_development():
    """仅本地开发环境运行"""
    assert True

@pytest.mark.cloud_only
def test_cloud_infrastructure():
    """仅云环境运行"""
    assert True

# 功能开关测试
@pytest.mark.feature_flag("new_ui")
def test_new_ui_feature():
    """新 UI 功能测试"""
    assert True

@pytest.mark.beta_feature
def test_beta_functionality():
    """Beta 功能测试"""
    assert True
```

::: note 标记使用最佳实践
1. **一致命名**：使用一致的标记命名约定
2. **文档化标记**：在 pytest.ini 中注册和文档化所有标记
3. **合理分组**：根据功能、类型、优先级等合理分组
4. **避免过度标记**：不要为每个测试添加过多标记
5. **CI/CD 集成**：在 CI/CD 管道中使用标记控制测试执行
:::

::: warning 注意事项
1. **标记拼写**：确保标记名称拼写正确，错误的标记名会被忽略
2. **性能影响**：过多的标记可能影响测试收集性能
3. **维护成本**：标记系统需要定期维护和清理
4. **团队约定**：团队需要就标记使用达成一致约定
:::

测试标记是组织和管理大型测试套件的强大工具，合理使用标记可以显著提高测试效率和可维护性。