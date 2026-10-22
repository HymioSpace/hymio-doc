# 安装与运行

自行开发应用或调试运行时，可以直接启动 Oath。完整 Hymio 产品使用 [Hymio 安装流程](../hymio/getting-started)。

## 安装命令

准备 Python 3.11+、uv、Docker 和 Compose：

```sh
git clone https://github.com/HymioSpace/Oath.git
cd Oath
bash scripts/oath-install
```

默认读取 `~/.oath/oath.toml`。在 `[agent.provider]` 设置 `model`、`api_base`、Vault 的 `credential` 别名和 `import_env` 变量名，不把 API Key 写入 TOML。

```sh
oath start
oath status
```

启动时从指定宿主机环境变量导入缺失的模型凭据，或通过隐藏输入读取。Worker 经 Vault 读取凭据，模型密钥不进入模型上下文或 Agent 服务环境。

## 本机接口

| Endpoint | 用途 |
| --- | --- |
| Gateway · WebSocket · `8765` | Gateway WebSocket |
| Biz · HTTP · `8766` | Biz HTTP：Trace 与 CLI API |

地址由运行环境决定，默认只监听运行服务的电脑，不能把文档中的端口当成已部署服务。受信模式接受外部用户 ID。向受信范围外开放前，先配置[鉴权模式](./configuration)。

仓库提供调试客户端：

```sh
.venv/bin/python scripts/terminal_client.py
```

支持 `/status`、`/retry`、`/cancel`、`/approve ID`、`/deny ID`、`/quit`，通过 `--json` 查看原始帧。

## 生命周期

```sh
oath restart  # 复用最近的有效启动参数
oath stop     # 保留数据卷
```

用 `--config PATH` 指定配置，`--name NAME` 区分本机部署。启动记录在健康检查通过后更新。启动失败不等于完整回滚，应检查 Compose 实际服务状态。

保留安装源码目录，当前镜像从命令对应的源码构建。备份持久卷和私有 Vault 恢复材料，包括 `~/.oath/data/private/vault-bootstrap.json`。
