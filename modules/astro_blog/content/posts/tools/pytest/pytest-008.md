---
title: 第 8 章：配置文件与命令行选项
date: 2025-10-03
icon: circle-dot
author: Haiyue
category:
  - pytest
star: false
---

# 第 8 章：配置文件与命令行选项

::: tip 学习目标
- 掌握 pytest.ini 配置文件的使用
- 学习 conftest.py 的作用和配置
- 理解命令行参数的使用
- 掌握测试环境的配置管理
:::

### 知识点

#### 配置文件层次结构

pytest 按以下优先级查找配置文件：

1. **pytest.ini** - 专用配置文件（推荐）
2. **pyproject.toml** - 现代 Python 项目配置
3. **tox.ini** - 与 tox 共享配置
4. **setup.cfg** - 传统 setuptools 配置

#### 配置文件作用域

- **项目根目录**：影响整个项目
- **子目录**：影响该目录及子目录
- **命令行**：覆盖文件配置（优先级最高）

### 示例代码

#### pytest.ini 完整配置

```ini
# pytest.ini - 推荐的配置方式
[tool:pytest]
# 测试发现
testpaths = tests
python_files = test_*.py *_test.py
python_functions = test_*
python_classes = Test*

# 最小版本要求
minversion = 6.0

# 命令行选项
addopts =
    -ra
    --strict-markers
    --strict-config
    --cov=src
    --cov-branch
    --cov-report=term-missing:skip-covered
    --cov-report=html:htmlcov
    --cov-report=xml
    --cov-fail-under=80

# 标记注册
markers =
    slow: 标记慢速测试
    integration: 集成测试
    unit: 单元测试
    smoke: 冒烟测试
    api: API 测试
    auth: 认证相关测试
    database: 数据库相关测试
    network: 需要网络的测试
    external: 依赖外部服务的测试
    parametrize: 参数化测试

# 过滤警告
filterwarnings =
    error
    ignore::UserWarning
    ignore::DeprecationWarning
    ignore::PendingDeprecationWarning
    ignore:.*HTTPSConnection.*:urllib3.exceptions.InsecureRequestWarning

# 测试超时
timeout = 300
timeout_method = thread

# 并行执行
addopts = -n auto

# 日志配置
log_cli = true
log_cli_level = INFO
log_cli_format = %(asctime)s [%(levelname)8s] %(name)s: %(message)s
log_cli_date_format = %Y-%m-%d %H:%M:%S

log_file = tests.log
log_file_level = DEBUG
log_file_format = %(asctime)s [%(levelname)8s] %(filename)s:%(lineno)d %(funcName)s(): %(message)s
log_file_date_format = %Y-%m-%d %H:%M:%S

# 自动使用 fixtures
usefixtures = clean_database

# 文档测试
doctest_optionflags = NORMALIZE_WHITESPACE IGNORE_EXCEPTION_DETAIL
doctest_encoding = utf-8

# 输出选项
console_output_style = progress
```

#### pyproject.toml 配置

```toml
# pyproject.toml - 现代配置方式
[build-system]
requires = ["setuptools>=61.0", "wheel"]
build-backend = "setuptools.build_meta"

[project]
name = "my-project"
version = "1.0.0"
dependencies = [
    "requests>=2.25.0",
]

[project.optional-dependencies]
test = [
    "pytest>=7.0.0",
    "pytest-cov>=4.0.0",
    "pytest-mock>=3.10.0",
]

[tool.pytest.ini_options]
testpaths = ["tests"]
python_files = ["test_*.py", "*_test.py"]
python_functions = ["test_*"]
python_classes = ["Test*"]

addopts = [
    "-ra",
    "--strict-markers",
    "--strict-config",
    "--cov=src",
    "--cov-report=term-missing:skip-covered",
    "--cov-report=html:htmlcov",
    "--cov-fail-under=80",
]

markers = [
    "slow: 慢速测试",
    "integration: 集成测试",
    "unit: 单元测试",
]

filterwarnings = [
    "error",
    "ignore::UserWarning",
    "ignore::DeprecationWarning",
]

[tool.coverage.run]
source = ["src"]
omit = [
    "*/tests/*",
    "*/test_*",
    "*/__pycache__/*",
    "*/venv/*",
    "*/virtualenv/*",
]

[tool.coverage.report]
exclude_lines = [
    "pragma: no cover",
    "def __repr__",
    "raise AssertionError",
    "raise NotImplementedError",
    "if __name__ == .__main__.:",
    "if TYPE_CHECKING:",
]
```

#### conftest.py 配置示例

```python
# conftest.py - 项目根目录
import pytest
import os
import tempfile
import logging
from pathlib import Path

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def pytest_addoption(parser):
    """添加命令行选项"""
    parser.addoption(
        "--env",
        action="store",
        default="test",
        help="运行环境: test, dev, staging, prod"
    )

    parser.addoption(
        "--slow",
        action="store_true",
        default=False,
        help="运行慢速测试"
    )

    parser.addoption(
        "--integration",
        action="store_true",
        default=False,
        help="运行集成测试"
    )

    parser.addoption(
        "--database-url",
        action="store",
        default="sqlite:///:memory:",
        help="数据库连接 URL"
    )

def pytest_configure(config):
    """pytest 配置钩子"""
    # 设置环境变量
    env = config.getoption("--env")
    os.environ["TEST_ENV"] = env

    # 注册自定义标记
    config.addinivalue_line(
        "markers", "env(name): 指定测试环境"
    )

    # 配置日志
    if config.getoption("--log-cli"):
        logging.getLogger().setLevel(logging.DEBUG)

def pytest_collection_modifyitems(config, items):
    """修改测试收集"""
    # 根据命令行选项跳过测试
    if not config.getoption("--slow"):
        skip_slow = pytest.mark.skip(reason="需要 --slow 选项")
        for item in items:
            if "slow" in item.keywords:
                item.add_marker(skip_slow)

    if not config.getoption("--integration"):
        skip_integration = pytest.mark.skip(reason="需要 --integration 选项")
        for item in items:
            if "integration" in item.keywords:
                item.add_marker(skip_integration)

    # 根据环境跳过测试
    env = config.getoption("--env")
    for item in items:
        env_markers = [mark for mark in item.iter_markers(name="env")]
        if env_markers:
            supported_envs = env_markers[0].args
            if env not in supported_envs:
                item.add_marker(pytest.mark.skip(
                    reason=f"测试不支持环境 {env}"
                ))

@pytest.fixture(scope="session")
def config(request):
    """配置 fixture"""
    return {
        "env": request.config.getoption("--env"),
        "database_url": request.config.getoption("--database-url"),
        "slow": request.config.getoption("--slow"),
        "integration": request.config.getoption("--integration"),
    }

@pytest.fixture(scope="session")
def temp_dir():
    """临时目录 fixture"""
    with tempfile.TemporaryDirectory() as tmpdir:
        yield Path(tmpdir)

@pytest.fixture(autouse=True)
def setup_test_env(config):
    """自动设置测试环境"""
    original_env = os.environ.copy()

    # 设置测试环境变量
    os.environ.update({
        "TESTING": "true",
        "TEST_ENV": config["env"],
        "DATABASE_URL": config["database_url"],
    })

    yield

    # 恢复原始环境变量
    os.environ.clear()
    os.environ.update(original_env)

@pytest.fixture
def clean_database(config):
    """清理数据库 fixture"""
    # 测试前清理
    logger.info(f"清理数据库: {config['database_url']}")

    yield

    # 测试后清理
    logger.info("测试完成，清理数据库")

# 自定义标记的钩子
def pytest_runtest_setup(item):
    """测试运行前的设置"""
    # 检查环境标记
    env_markers = list(item.iter_markers(name="env"))
    if env_markers:
        current_env = os.environ.get("TEST_ENV", "test")
        supported_envs = env_markers[0].args
        if current_env not in supported_envs:
            pytest.skip(f"测试需要环境: {supported_envs}, 当前环境: {current_env}")
```

#### 多环境配置管理

```python
# config/settings.py
import os
from dataclasses import dataclass
from typing import Optional

@dataclass
class DatabaseConfig:
    """数据库配置"""
    url: str
    pool_size: int = 5
    echo: bool = False

@dataclass
class APIConfig:
    """API 配置"""
    base_url: str
    timeout: int = 30
    api_key: Optional[str] = None

@dataclass
class TestConfig:
    """测试配置"""
    database: DatabaseConfig
    api: APIConfig
    debug: bool = False
    log_level: str = "INFO"

def get_test_config(env: str = "test") -> TestConfig:
    """根据环境获取配置"""
    configs = {
        "test": TestConfig(
            database=DatabaseConfig(
                url="sqlite:///:memory:",
                echo=False
            ),
            api=APIConfig(
                base_url="http://localhost:8000",
                timeout=5
            ),
            debug=True,
            log_level="DEBUG"
        ),
        "dev": TestConfig(
            database=DatabaseConfig(
                url=os.getenv("DEV_DATABASE_URL", "sqlite:///dev.db"),
                echo=True
            ),
            api=APIConfig(
                base_url=os.getenv("DEV_API_URL", "http://dev-api.example.com"),
                timeout=10,
                api_key=os.getenv("DEV_API_KEY")
            ),
            debug=True,
            log_level="DEBUG"
        ),
        "staging": TestConfig(
            database=DatabaseConfig(
                url=os.getenv("STAGING_DATABASE_URL"),
                pool_size=10
            ),
            api=APIConfig(
                base_url=os.getenv("STAGING_API_URL"),
                timeout=15,
                api_key=os.getenv("STAGING_API_KEY")
            ),
            debug=False,
            log_level="INFO"
        ),
        "prod": TestConfig(
            database=DatabaseConfig(
                url=os.getenv("PROD_DATABASE_URL"),
                pool_size=20
            ),
            api=APIConfig(
                base_url=os.getenv("PROD_API_URL"),
                timeout=30,
                api_key=os.getenv("PROD_API_KEY")
            ),
            debug=False,
            log_level="WARNING"
        )
    }

    if env not in configs:
        raise ValueError(f"不支持的环境: {env}")

    return configs[env]

# tests/conftest.py - 环境配置集成
@pytest.fixture(scope="session")
def test_config(config):
    """测试配置 fixture"""
    from config.settings import get_test_config
    return get_test_config(config["env"])
```

#### 命令行选项使用示例

```python
# test_command_line_options.py
import pytest
import os

def test_environment_config(config):
    """测试环境配置"""
    assert config["env"] in ["test", "dev", "staging", "prod"]
    assert os.environ["TEST_ENV"] == config["env"]

@pytest.mark.env("dev", "staging")
def test_development_feature(config):
    """只在开发和预发布环境运行"""
    assert config["env"] in ["dev", "staging"]

@pytest.mark.slow
def test_slow_operation():
    """慢速测试"""
    import time
    time.sleep(1)  # 模拟慢速操作
    assert True

@pytest.mark.integration
def test_database_integration(test_config):
    """集成测试"""
    assert test_config.database.url is not None

def test_api_configuration(test_config):
    """API 配置测试"""
    assert test_config.api.base_url.startswith("http")
    assert test_config.api.timeout > 0

# 命令行使用示例
"""
# 基本运行
pytest

# 指定环境
pytest --env=dev

# 运行慢速测试
pytest --slow

# 运行集成测试
pytest --integration

# 组合选项
pytest --env=staging --slow --integration

# 指定数据库
pytest --database-url=postgresql://user:pass@localhost/testdb

# 详细日志
pytest --log-cli --log-cli-level=DEBUG

# 并行运行
pytest -n 4

# 只运行特定标记
pytest -m "not slow"
pytest -m "integration and not slow"
"""
```

#### 高级配置技巧

```python
# advanced_config.py
import pytest
import sys
import platform
from pathlib import Path

def pytest_report_header(config):
    """自定义报告头部信息"""
    return [
        f"项目路径: {Path.cwd()}",
        f"Python 版本: {sys.version}",
        f"平台: {platform.platform()}",
        f"测试环境: {config.getoption('--env')}",
    ]

def pytest_sessionstart(session):
    """会话开始时的钩子"""
    print("\n🚀 开始测试会话")
    print(f"📊 发现 {len(session.items)} 个测试")

def pytest_sessionfinish(session, exitstatus):
    """会话结束时的钩子"""
    if exitstatus == 0:
        print("\n✅ 所有测试通过!")
    else:
        print(f"\n❌ 测试失败，退出码: {exitstatus}")

@pytest.hookimpl(tryfirst=True, hookwrapper=True)
def pytest_runtest_makereport(item, call):
    """生成测试报告的钩子"""
    outcome = yield
    rep = outcome.get_result()

    # 为失败的测试添加额外信息
    if rep.when == "call" and rep.failed:
        # 可以添加截图、环境信息等
        setattr(item, "rep_call", rep)

def pytest_runtest_teardown(item, nextitem):
    """测试清理阶段的钩子"""
    if hasattr(item, "rep_call") and item.rep_call.failed:
        print(f"\n🔍 测试失败: {item.name}")
        # 可以执行额外的清理或日志记录

# 条件性配置
def pytest_configure(config):
    """动态配置"""
    # 根据 Python 版本调整配置
    if sys.version_info < (3, 8):
        config.addinivalue_line(
            "markers", "py38plus: requires Python 3.8+"
        )

    # 根据平台调整配置
    if platform.system() == "Windows":
        config.addinivalue_line(
            "markers", "unix_only: Unix-only tests"
        )

# 插件管理
pytest_plugins = [
    "pytest_html",
    "pytest_cov",
    "pytest_mock",
    "pytest_xdist",
]

# 动态禁用插件
def pytest_configure(config):
    """动态插件配置"""
    # 在 CI 环境中禁用某些插件
    if os.environ.get("CI"):
        config.pluginmanager.set_blocked("pytest-qt")
```

#### 配置文件最佳实践

```python
# 项目结构最佳实践
"""
project/
├── pytest.ini              # 主配置文件
├── pyproject.toml          # 项目配置
├── conftest.py             # 全局配置
├── config/
│   ├── __init__.py
│   ├── settings.py         # 环境配置
│   └── test_data.py        # 测试数据
├── tests/
│   ├── conftest.py         # 测试专用配置
│   ├── unit/
│   │   └── conftest.py     # 单元测试配置
│   └── integration/
│       └── conftest.py     # 集成测试配置
└── src/
    └── ...
"""

# 配置验证
def validate_test_config():
    """验证测试配置"""
    required_env_vars = [
        "TEST_ENV",
        "DATABASE_URL"
    ]

    missing_vars = []
    for var in required_env_vars:
        if not os.environ.get(var):
            missing_vars.append(var)

    if missing_vars:
        raise EnvironmentError(
            f"缺少必需的环境变量: {', '.join(missing_vars)}"
        )

# 在 conftest.py 中使用
def pytest_sessionstart(session):
    """会话开始时验证配置"""
    try:
        validate_test_config()
        print("✅ 配置验证通过")
    except EnvironmentError as e:
        print(f"❌ 配置验证失败: {e}")
        pytest.exit("配置错误", returncode=1)
```

::: note 配置最佳实践
1. **使用 pytest.ini**：为 pytest 专用配置的首选方式
2. **环境分离**：不同环境使用不同的配置
3. **配置验证**：在测试开始前验证必要的配置
4. **文档化选项**：为自定义选项提供清晰的文档
5. **合理默认值**：为配置选项提供合理的默认值
:::

::: warning 注意事项
1. **配置覆盖顺序**：命令行 > 配置文件 > 默认值
2. **敏感信息**：不要在配置文件中硬编码敏感信息
3. **版本兼容性**：注意不同 pytest 版本的配置差异
4. **性能影响**：某些配置选项可能影响测试性能
:::

合理的配置管理是大型测试项目成功的关键，通过系统化的配置可以大大提高测试的可维护性和可扩展性。