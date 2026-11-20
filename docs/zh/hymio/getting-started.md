# 安装与启动

Hymio 支持自托管。本机启动器组合应用后端、Casdoor 身份服务与 Oath。可以先使用对话和附件；
个人记忆与云电脑是可选服务 / 能力。

## 真实案例：从登录到手机收到第一条回复

本轮演示在已运行的部署中，用原生 iOS 注册独立账号，打开「对话」请求两天旅行打包清单；模型实际返回了中文内容。随后在 Web 用同一账号登录，能直接看到手机上的请求与回复。

服务准备完成后，可以用这个小目标检查安装结果：**能登录 → 能发送 → 能收到模型回复 → 另一端能接回同一内容**。只看到首页或连接成功，不足以说明整条链路已可用。截图和后续操作见[多端互通](./ios)。

## 准备环境

使用 macOS 或 Linux，安装并启动 Docker，准备 [uv](https://docs.astral.sh/uv/)、Node.js 22.12 或更新版本，以及 pnpm 11。桌面构建还需要 Rust 和平台工具。当前本机启动器面向开发体验，不是生产安装器。

## 启动 Web

把两个仓库克隆到同一个父目录：

```sh
git clone https://github.com/HymioSpace/Oath.git
git clone https://github.com/HymioSpace/Hymio.git
(cd Oath && bash scripts/oath-install)
cd Hymio
bash scripts/hymio-install
hymio init
hymio start --client web --timeout 900
```

如果命令未进入 PATH，运行 `uv tool update-shell` 后重新打开终端。初始化会通过隐藏输入读取模型凭据，私有配置保存在 `~/.hymio/config.toml`，不要提交这个文件。

启动成功后，在运行服务的电脑上使用终端显示的 Web 地址注册账号。这个地址属于你启动的应用，不是文档站提供的公共服务。首次启动可能下载依赖与构建服务镜像，先通过 `hymio status` 和 `hymio logs -f` 查看进度，避免重复启动。

## 需要时，再开通云电脑

私下配置 Provider 凭据，并用产品用户 ID 指定管理员。管理员在独立平台中为已注册账号开通资源，详见[云设备与管理](./devices)。

## 启用个人记忆

统一启动器有意不内嵌 Nostalgia。请在私有网络中运行
[Nostalgia 服务](../nostalgia/operations)，再通过 Backend 私有配置的
`nostalgia_connections_file`，为已登录 Hymio 用户配置独立 endpoint 与 bearer token。不要把
token 放进客户端或 prompt。

Dreaming 的 proposal URL 指向 Hymio 私有 adapter，并以 token 文件认证。重启后分别验证三个状态：

1. 新写的手记出现在足迹；
2. 服务不可用时显示读取错误，而不是伪造空账号；
3. 成功 dream 增加带依据的理解，同时不删除原文。

完整 Provider 与备份约定见[Nostalgia 部署](../nostalgia/operations)。

## 在 iPhone 继续

原生客户端连接 Hymio 后端，手机本身不运行 Oath 或云桌面。在手机上开始、电脑上继续的实际案例见[多端互通](./ios)。

## 连接个人设备

打开 **我的 → 我的设备 → 连接 Mac 或 Android**，在 HymioDevice 输入一次性配对码。设备主动
建立出站连接，不需要家庭网络开放入站端口。屏幕、无障碍与通知权限保留在本机；Mac 的 Shell
在用户明确开启前保持关闭。

## 部署到公网

使用 HTTPS，按产品部署文档配置。身份、Provider 密钥、数据备份与资源权限由运营者维护，不放进文档站。

接下来阅读本站[配置与部署](./configuration)，了解私有配置、局域网访问和公网部署的要求；需要管理用户资源时，阅读[管理平台](./admin)。
