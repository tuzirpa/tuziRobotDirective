# 浏览器弹窗处理指令

## 概述

`web.autoHandleDialog` 指令用于自动处理浏览器中的各种弹窗，支持自动接受或拒绝弹窗，无需人工干预。

## 支持的弹窗类型

- **alert**: 警告弹窗 - 显示信息，只有一个确定按钮
- **confirm**: 确认弹窗 - 显示信息，有确定和取消按钮
- **prompt**: 输入弹窗 - 显示信息，有输入框和确定/取消按钮
- **beforeunload**: 页面离开确认弹窗 - 用户离开页面时触发

## 指令参数

### 输入参数

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| browserPage | Page | 是 | 浏览器页面对象 |
| action | string | 是 | 处理动作：'accept'（接受）或 'dismiss'（拒绝） |
| promptText | string | 否 | 当遇到prompt弹窗时输入的文本 |

### 输出参数

| 参数名 | 类型 | 说明 |
|--------|------|------|
| dialogMessage | string | 弹窗中显示的消息内容 |
| dialogType | string | 弹窗类型（alert/confirm/prompt/beforeunload） |
| isHandled | boolean | 是否成功处理了弹窗 |

## 使用示例

### 基本用法

```javascript
// 自动接受所有弹窗
const result = await web.autoHandleDialog({
    browserPage: page,
    action: 'accept'
});
```

### 处理prompt弹窗

```javascript
// 自动接受弹窗，并为prompt类型输入指定文本
const result = await web.autoHandleDialog({
    browserPage: page,
    action: 'accept',
    promptText: '张三'
});
```

### 自动拒绝弹窗

```javascript
// 自动拒绝所有弹窗
const result = await web.autoHandleDialog({
    browserPage: page,
    action: 'dismiss'
});
```

## 完整工作流程示例

```javascript
async function automateWithDialogHandling() {
    // 1. 创建浏览器和页面
    const browser = await web.webCreate();
    const page = await web.createPage({ browser });
    
    // 2. 设置弹窗处理策略
    const dialogResult = await web.autoHandleDialog({
        browserPage: page,
        action: 'accept',
        promptText: '自动化测试'
    });
    
    // 3. 导航到目标页面
    await web.pageGotoUrl({
        browserPage: page,
        url: 'https://example.com'
    });
    
    // 4. 执行可能触发弹窗的操作
    await web.pageExecuteScript({
        browserPage: page,
        script: `
            // 这些操作可能会触发弹窗
            if (confirm('是否继续操作？')) {
                const name = prompt('请输入姓名:', '');
                alert('欢迎 ' + name + '!');
            }
        `
    });
    
    // 5. 检查处理结果
    if (dialogResult.isHandled) {
        console.log('弹窗已处理:', dialogResult.dialogMessage);
        console.log('弹窗类型:', dialogResult.dialogType);
    }
    
    // 6. 清理资源
    await web.closePage({ browserPage: page });
    await web.closeBrowser({ browser });
}
```

## 注意事项

1. **时机重要**: 弹窗监听器必须在弹窗出现之前设置
2. **持续监听**: 监听器会持续工作，直到页面关闭
3. **prompt处理**: 对于prompt弹窗，如果不提供promptText，将使用空字符串
4. **错误处理**: 指令包含完整的错误处理机制
5. **日志记录**: 所有操作都会记录详细的调试日志

## 最佳实践

1. **提前设置**: 在页面操作开始前就设置好弹窗处理策略
2. **统一处理**: 为整个自动化流程设置统一的弹窗处理策略
3. **监控结果**: 检查isHandled参数确认弹窗是否被正确处理
4. **日志分析**: 利用console.debug日志分析弹窗处理过程

## 技术实现

该指令基于Puppeteer的Dialog API实现，通过监听页面的'dialog'事件来自动处理弹窗。指令会：

1. 设置事件监听器
2. 根据配置的动作处理弹窗
3. 返回处理结果信息
4. 提供完整的错误处理

## 相关指令

- `web.webCreate`: 创建浏览器实例
- `web.createPage`: 创建页面
- `web.pageExecuteScript`: 执行JavaScript脚本
- `web.closePage`: 关闭页面
- `web.closeBrowser`: 关闭浏览器 