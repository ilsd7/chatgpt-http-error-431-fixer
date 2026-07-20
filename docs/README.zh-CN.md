# ChatGPT HTTP ERROR 431 Fixer

[English](../README.md) · [한국어](README.ko.md) · [日本語](README.ja.md) · [简体中文](README.zh-CN.md) · [Español](README.es.md)

> **完全本地运行** · **无网络访问** · **隐私优先**

一款小工具，可安全清理累积的临时聊天 Cookie，防止在使用 ChatGPT 时反复出现 HTTP ERROR 431。

在 ChatGPT 网页版中使用临时聊天时，系统会不断创建一个月后过期的 `conv_key_*` Cookie。如果频繁使用临时聊天，这些 Cookie 可能累积到数十个甚至更多，导致请求头变大，并可能引发 HTTP ERROR 431（`Request Header Fields Too Large`）。

本项目只删除这些累积的 Cookie，不会影响登录 Cookie 或其他 ChatGPT Cookie。

## 下载与安装

[最新的 GitHub Release](https://github.com/ilsd7/chatgpt-http-error-431-fixer/releases/latest)中包含 Chromium 扩展程序和可手动安装的用户脚本。对于用户脚本，建议从 Greasy Fork 安装，以便通过用户脚本管理器接收更新。

以解压方式加载的 Chromium 扩展程序不会自动更新，发布新版本后请手动安装。

### Chromium：浏览器扩展程序

如需自动清理，请使用浏览器扩展程序。该扩展需要 Chromium 119 或更高版本。

1. 从 GitHub Release 附件中下载扩展程序 ZIP 并解压。
2. 打开 `chrome://extensions`。
3. 启用**开发者模式**。
4. 选择**加载已解压的扩展程序**并指定解压后的文件夹，或者将该文件夹拖到扩展程序页面中。

扩展程序会在安装后立即检查是否有临时聊天标签页处于打开状态；如果没有，就立即删除目标 Cookie。清理成功三小时后会进行检查；如果此时临时聊天标签页仍处于打开状态，则不会删除任何内容，而是每 30 分钟检查一次，直到该标签页关闭。

浏览器完全退出后再次启动时，扩展程序也会立即删除目标 Cookie。点击工具栏按钮后，扩展程序会先检查是否有打开的临时聊天标签页；如果没有，就立即删除目标 Cookie，并在徽章上显示删除数量。如果临时聊天标签页处于打开状态，则不会删除任何内容。

Firefox 不支持 Manifest V3 后台 Service Worker，因此无法运行此扩展程序。请改用用户脚本。

### Firefox 或手动清理：用户脚本

如果使用 Firefox，或不想安装浏览器扩展程序，可以使用用户脚本。用户脚本不支持自动清理；手动清理时，无论是否有临时聊天标签页处于打开状态，都会执行删除操作，请注意。Chromium 推荐使用上述浏览器扩展程序。

目前，Violentmonkey 会把 Firefox 专用的 `firstPartyDomain` 添加到 Chromium Cookie API 请求中，因此无法在 Chromium 中使用。目标 Cookie 为 HttpOnly，因此必须使用 Tampermonkey Beta。

1. 请根据浏览器安装相应的用户脚本管理器。
   - Firefox：[Violentmonkey](https://violentmonkey.github.io/) 或 [Tampermonkey Beta](https://www.tampermonkey.net/index.php?browser=firefox)
   - Chromium：[Tampermonkey Beta](https://www.tampermonkey.net/index.php?browser=chrome)
2. 在 Chromium 138 或更高版本中，打开用户脚本管理器的扩展程序详情，然后启用 **Allow User Scripts**。
3. 打开 [Greasy Fork 脚本页面](GREASY_FORK_SCRIPT_URL)，然后选择**安装此脚本**。
4. 在用户脚本管理器的确认页面中批准安装。

也可以从[最新的 GitHub Release](https://github.com/ilsd7/chatgpt-http-error-431-fixer/releases/latest)下载 `chatgpt-http-error-431-fixer.user.js`，然后将其导入用户脚本管理器。以这种方式手动安装的脚本不会自动更新。

安装后，用户脚本管理器的菜单中会出现以下命令：

- **Count conv_key_* cookies**
- **Delete conv_key_* cookies now**

在 Firefox 中使用 Violentmonkey 时，请同时启用以下两项设置：

1. 全局高级设置：**Allow GM_cookie to access HTTP-only cookies**
2. 脚本设置：**Allow access to HTTP-only cookies**

此权限范围较大，请只授予已检查并信任的脚本。

## 会删除哪些 Cookie

只有同时满足以下条件时才会删除：

- 标准化后的域名与 `chatgpt.com` 完全一致
- 名称以 `conv_key_` 开头

登录 Cookie 等其他 Cookie 不在删除范围内。

## 隐私与安全

所有操作都在本地完成。本项目不包含分析、遥测、远程代码或外部库，也不会主动发起网络请求。Cookie 值不会被保存、记录、显示或发送。

扩展程序仅请求以下权限：

- `cookies`：查找并删除匹配的 `chatgpt.com` Cookie
- `alarms`：安排三小时后的检查和 30 分钟后的重试
- `storage`：记录最近一次成功清理的时间
- `https://chatgpt.com/*`：将 Cookie 和标签页访问范围限制在 ChatGPT

无需构建。GitHub Release 文件和 Greasy Fork 上发布的用户脚本都直接包含仓库中的源代码，未经精简或转换，可以在安装前查看。本项目没有另外设置二进制文件验证流程。

漏洞报告方式请参阅[安全策略](../SECURITY.md)。

如遇其他问题，请通过 [GitHub Issues](https://github.com/ilsd7/chatgpt-http-error-431-fixer/issues) 告知我们。

## 许可证

本项目采用 [Apache License 2.0](../LICENSE) 许可证。

## 其他信息

本工具并不能解决 HTTP ERROR 431 的所有成因，仅适用于由临时聊天 Cookie 累积导致的情况。

ChatGPT 是 OpenAI 的商标；本仓库是个人创建的独立项目。
