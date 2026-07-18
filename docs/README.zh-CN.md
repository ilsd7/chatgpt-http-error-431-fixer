# ChatGPT HTTP ERROR 431 Fixer

[English](../README.md) · [한국어](README.ko.md) · [日本語](README.ja.md) · [简体中文](README.zh-CN.md) · [Español](README.es.md)

> **完全本地运行** · **无网络访问** · **隐私优先**

通过安全清理累积的临时聊天 Cookie，防止在使用 ChatGPT 时反复出现 HTTP ERROR 431。

使用临时聊天时，系统会不断创建一个月后过期的 `conv_key_*` Cookie。频繁使用后，这些 Cookie 可能累积到数十个甚至更多，使请求头过大，并导致 Chromium 出现 HTTP ERROR 431（`Request Header Fields Too Large`）。本项目只删除这些累积的 Cookie，不会影响登录 Cookie 或其他 ChatGPT Cookie。

## 下载与安装

请从[最新的 GitHub Release](https://github.com/ilsd7/chatgpt-http-error-431-fixer/releases/latest)下载所需文件。

以解压方式加载的扩展程序和用户脚本不会自动更新。发布新版本后，请手动安装。

### Chromium：浏览器扩展程序

如需自动清理，请使用浏览器扩展程序。该扩展需要 Chromium 119 或更高版本。

1. 从 GitHub Release 附件中下载扩展程序 ZIP 并解压。
2. 打开 `chrome://extensions`。
3. 启用**开发者模式**。
4. 选择**加载已解压的扩展程序**，然后指定解压后的文件夹。

扩展程序会在浏览器启动时删除目标 Cookie，并在每次成功清理三小时后再次检查。如果临时聊天标签页仍处于打开状态，则会等待 30 分钟后重试。需要时也可以点击工具栏按钮，以相同方式检查临时聊天标签页后再执行清理。

Firefox 不支持 Manifest V3 后台 Service Worker，因此无法运行此扩展程序。请改用用户脚本。

### Firefox 或手动清理：用户脚本

如果希望自行决定何时删除 Cookie，请使用用户脚本。它不会自动删除 Cookie。

1. 安装 [Violentmonkey](https://violentmonkey.github.io/) 或 Tampermonkey Beta。
2. 在 Chromium 138 或更高版本中，打开用户脚本管理器的扩展程序详情，然后启用 **Allow User Scripts**。
3. 从 GitHub Release 附件中下载 `chatgpt-http-error-431-fixer.user.js`。
4. 将下载的文件导入用户脚本管理器，或者新建脚本并粘贴文件内容。

安装后，用户脚本管理器的菜单中会出现以下命令：

- **Count conv_key_* cookies**
- **Delete conv_key_* cookies now**

目标 Cookie 为 HttpOnly。使用 Violentmonkey 时，请同时启用以下两项设置：

1. 全局高级设置：**Allow GM_cookie to access HTTP-only cookies**
2. 脚本设置：**Allow access to HTTP-only cookies**

此权限范围较大，请只授予已检查并信任的脚本。

截至 2026 年 7 月，推荐使用 Violentmonkey，它可在 Chromium 和 Firefox 上运行。Tampermonkey Beta 也能使用，但不在本项目的常规测试范围内。Tampermonkey 稳定版和 FireMonkey 无法访问目标 HttpOnly Cookie。

## 会删除哪些 Cookie

只有同时满足以下条件时才会删除：

- 标准化后的域名与 `chatgpt.com` 完全一致
- 名称以 `conv_key_` 开头

普通 Cookie 和分区 Cookie 都会被检查。登录 Cookie 和其他 ChatGPT Cookie 均不在删除范围内。

## 隐私与安全

所有操作都在本地完成。本项目不包含分析、遥测、远程代码或外部库，也不会主动发起网络请求。Cookie 值不会被保存、记录、显示或发送。

扩展程序仅请求以下权限：

- `cookies`：查找并删除匹配的 `chatgpt.com` Cookie
- `alarms`：安排三小时后的检查和 30 分钟后的重试
- `storage`：记录最近一次成功清理的时间
- `https://chatgpt.com/*`：将 Cookie 和标签页访问范围限制在 ChatGPT

无需构建。发布文件直接包含仓库中的源代码，未经精简或转换，可以在安装前查看。本项目没有另外设置二进制文件验证流程。

漏洞报告方式请参阅[安全策略](../SECURITY.md)。

## 许可证

本项目采用 [Apache License 2.0](../LICENSE) 许可证。

## 其他信息

本工具并不能解决 HTTP ERROR 431 的所有成因，仅适用于由临时聊天 Cookie 累积导致的情况。

ChatGPT 是 OpenAI 的商标；本仓库是个人创建的独立项目。
