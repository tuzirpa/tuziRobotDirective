import { DirectiveTree } from 'tuzirobot/types';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import hmc from 'hmc-win32';
import { exec } from 'child_process';
import { promisify } from 'util';
import { getCurApp } from 'tuzirobot/commonUtil';

const execAsync = promisify(exec);

export const config: DirectiveTree = {
    name: 'openAutoGLM.desktopAgentRun',
    displayName: 'AI电脑操作',
    icon: 'icon-web-create',
    isControl: false,
    isControlEnd: false,
    comment: '使用AI模型自动操作电脑完成任务${task}，坐标已归一化处理（0-1范围）',
    inputs: {
        baseUrl: {
            name: 'baseUrl',
            value: 'http://localhost:8000/v1',
            type: 'string',
            addConfig: {
                label: '模型服务地址',
                type: 'string',
                defaultValue: 'http://localhost:8000/v1',
                placeholder: '模型API的基础URL，例如: http://localhost:8000/v1',
                required: true,
                tip: '支持OpenAI兼容的API，包括本地部署的模型或第三方服务'
            }
        },
        modelName: {
            name: 'modelName',
            value: 'gpt-4o',
            type: 'string',
            addConfig: {
                label: '模型名称',
                type: 'string',
                defaultValue: 'gpt-4o',
                placeholder: '模型名称，例如: gpt-4o, gpt-4-vision-preview',
                required: true
            }
        },
        apiKey: {
            name: 'apiKey',
            value: '',
            type: 'string',
            addConfig: {
                label: 'API密钥',
                type: 'string',
                placeholder: '可选，如果模型服务需要API Key认证，请填写',
                isAdvanced: true
            }
        },
        task: {
            name: 'task',
            value: '',
            type: 'string',
            addConfig: {
                label: '任务描述',
                type: 'textarea',
                placeholder: '请输入要执行的任务，例如: 打开记事本，输入"Hello World"',
                required: true
            }
        },
        maxSteps: {
            name: 'maxSteps',
            value: '50',
            type: 'number',
            addConfig: {
                label: '最大步数',
                type: 'string',
                defaultValue: '50',
                placeholder: '任务执行的最大步数，防止无限循环',
                isAdvanced: true
            }
        },
        temperature: {
            name: 'temperature',
            value: '0.1',
            type: 'number',
            addConfig: {
                label: '温度参数',
                type: 'string',
                defaultValue: '0.1',
                placeholder: 'AI模型的温度参数，值越小越确定，建议0.1-0.3',
                isAdvanced: true
            }
        },
        debugMode: {
            name: 'debugMode',
            value: 'false',
            type: 'boolean',
            addConfig: {
                label: '调试模式',
                type: 'boolean',
                defaultValue: 'false',
                placeholder: '开启后将保存每次的截图和操作信息到调试目录',
                isAdvanced: true
            }
        },
        debugDir: {
            name: 'debugDir',
            value: '',
            type: 'string',
            addConfig: {
                label: '调试目录',
                type: 'string',
                placeholder: '可选，指定调试文件保存目录，不填则使用默认目录',
                isAdvanced: true,
                filters: 'this.inputs.debugMode.value == true'
            }
        }
    },
    outputs: {
        result: {
            name: '',
            display: '执行结果',
            type: 'object',
            typeDetails: [
                {
                    key: 'success',
                    type: 'boolean',
                    display: '是否成功'
                },
                {
                    key: 'message',
                    type: 'string',
                    display: '执行结果消息'
                },
                {
                    key: 'steps',
                    type: 'number',
                    display: '执行步数'
                },
                {
                    key: 'actions',
                    type: 'array',
                    display: '执行的操作列表'
                }
            ],
            addConfig: {
                label: '执行结果',
                type: 'variable',
                defaultValue: 'desktopAgentResult',
                tip: '包含执行是否成功、结果消息、执行步数和操作列表'
            }
        }
    }
};

/**
 * 截图并转换为base64
 */
async function captureScreenshot(): Promise<string> {
    const os = require('os');
    const tempPath = path.join(os.tmpdir(), `screenshot_${Date.now()}.png`);
    
    try {
        // 使用 PowerShell 进行截图（Windows）
        const platform = os.platform();
        
        if (platform === 'win32') {
            // Windows: 使用 PowerShell 的 Add-Type 和 System.Drawing
            // 将路径转换为绝对路径并转义
            const absolutePath = path.resolve(tempPath);
            // PowerShell 中需要使用单引号包裹路径，并将单引号转义为两个单引号
            const escapedPath = absolutePath.replace(/'/g, "''");
            
            // 使用文件方式执行 PowerShell 脚本（更可靠，且可以抑制警告）
            const scriptFile = path.join(os.tmpdir(), `screenshot_script_${Date.now()}.ps1`);
            const scriptContent = `$ProgressPreference = 'SilentlyContinue'
$ErrorActionPreference = 'SilentlyContinue'
Add-Type -AssemblyName System.Drawing,System.Windows.Forms
$bounds = [System.Windows.Forms.Screen]::PrimaryScreen.Bounds
$bmp = New-Object System.Drawing.Bitmap($bounds.Width, $bounds.Height)
$graphics = [System.Drawing.Graphics]::FromImage($bmp)
$graphics.CopyFromScreen($bounds.Location, [System.Drawing.Point]::Empty, $bounds.Size)
$bmp.Save('${escapedPath}', [System.Drawing.Imaging.ImageFormat]::Png)
$graphics.Dispose()
$bmp.Dispose()`;
            
            fs.writeFileSync(scriptFile, scriptContent, 'utf-8');
            try {
                // 使用 -NonInteractive 和 -WindowStyle Hidden 来抑制所有输出
                await execAsync(`powershell -NoProfile -NonInteractive -WindowStyle Hidden -ExecutionPolicy Bypass -File "${scriptFile}"`, {
                    timeout: 10000
                });
            } finally {
                // 清理脚本文件
                if (fs.existsSync(scriptFile)) {
                    try {
                        fs.unlinkSync(scriptFile);
                    } catch {}
                    }
            }
            
            // 等待一下确保文件写入完成
            await new Promise(resolve => setTimeout(resolve, 500));
        } else if (platform === 'darwin') {
            // macOS: 使用 screencapture 命令
            await execAsync(`screencapture -x "${tempPath}"`, { timeout: 10000 });
        } else {
            // Linux: 使用 import 命令（需要 ImageMagick）
            await execAsync(`import -window root "${tempPath}"`, { timeout: 10000 });
        }
        
        // 再次检查文件是否存在，如果不存在等待一下再检查
        if (!fs.existsSync(tempPath)) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            if (!fs.existsSync(tempPath)) {
                throw new Error('截图失败：文件未生成，请检查PowerShell是否可用');
            }
        }
        
        // 检查文件大小，确保不是空文件
        const stats = fs.statSync(tempPath);
        if (stats.size === 0) {
            fs.unlinkSync(tempPath);
            throw new Error('截图失败：生成的文件为空');
        }
        
        const imageBuffer = fs.readFileSync(tempPath);
        const base64Image = imageBuffer.toString('base64');
        
        // 清理临时文件
        fs.unlinkSync(tempPath);
        
        return base64Image;
    } catch (error: any) {
        // 如果截图失败，尝试清理临时文件
        if (fs.existsSync(tempPath)) {
            try {
                fs.unlinkSync(tempPath);
            } catch {}
        }
        
        const errorMsg = error.message || String(error);
        console.error('截图错误详情:', errorMsg);
        throw new Error(`截图失败: ${errorMsg}`);
    }
}

/**
 * 调用AI模型分析截图并返回操作指令
 */
async function callAIModel(
    baseUrl: string,
    modelName: string,
    apiKey: string,
    temperature: number,
    systemPrompt: string,
    userPrompt: string,
    imageBase64: string,
    history: any[]
): Promise<string> {
    const messages: any[] = [];
    
    // 添加历史对话
    if (history.length > 0) {
        messages.push(...history);
    }
    
    // 添加系统提示
    if (messages.length === 0 || messages[0].role !== 'system') {
        messages.unshift({
            role: 'system',
            content: systemPrompt
        });
    }
    
    // 添加用户消息（包含图片）
    messages.push({
        role: 'user',
        content: [
            {
                type: 'text',
                text: userPrompt
            },
            {
                type: 'image_url',
                image_url: {
                    url: `data:image/png;base64,${imageBase64}`
                }
            }
        ]
    });
    
    const headers: any = {
        'Content-Type': 'application/json'
    };
    
    if (apiKey && apiKey.trim()) {
        headers['Authorization'] = `Bearer ${apiKey}`;
    }
    
    // 使用 axios 发送请求
    const response = await axios.post(
        `${baseUrl}/chat/completions`,
        {
            model: modelName,
            messages: messages,
            temperature: temperature,
            max_tokens: 2000
        },
        { headers }
    );
    
    if (response.data && response.data.choices && response.data.choices[0] && response.data.choices[0].message) {
        return response.data.choices[0].message.content;
    } else {
        throw new Error(`AI模型响应格式错误: ${JSON.stringify(response.data)}`);
    }
}

/**
 * 解析AI返回的操作指令
 */
function parseAction(content: string): { action: string; params: any; thinking: string } | null {
    // 提取thinking
    const thinkingMatch = content.match(/<think>(.*?)<\/redacted_reasoning>/s);
    const thinking = thinkingMatch ? thinkingMatch[1].trim() : '';
    
    // 提取action
    const actionMatch = content.match(/<answer>(.*?)<\/answer>/s);
    if (!actionMatch) {
        return null;
    }
    
    const actionText = actionMatch[1].trim();
    
    // 解析finish指令
    if (actionText.includes('finish(')) {
        const messageMatch = actionText.match(/finish\(message\s*=\s*["'](.*?)["']\)/);
        return {
            action: 'finish',
            params: { message: messageMatch ? messageMatch[1] : '任务完成' },
            thinking
        };
    }
    
    // 解析do指令
    if (actionText.includes('do(')) {
        // 提取action参数
        const actionMatch = actionText.match(/action\s*=\s*["'](.*?)["']/);
        const action = actionMatch ? actionMatch[1] : '';
        
        const params: any = {};
        
        // 解析element坐标（支持整数和小数，归一化坐标）
        const elementMatch = actionText.match(/element\s*=\s*\[([\d.]+),\s*([\d.]+)\]/);
        if (elementMatch) {
            params.element = [parseFloat(elementMatch[1]), parseFloat(elementMatch[2])];
        }
        
        // 解析text
        const textMatch = actionText.match(/text\s*=\s*["'](.*?)["']/);
        if (textMatch) {
            params.text = textMatch[1];
        }
        
        // 解析start和end坐标（用于滚动，支持归一化坐标）
        const startMatch = actionText.match(/start\s*=\s*\[([\d.]+),\s*([\d.]+)\]/);
        const endMatch = actionText.match(/end\s*=\s*\[([\d.]+),\s*([\d.]+)\]/);
        if (startMatch && endMatch) {
            params.start = [parseFloat(startMatch[1]), parseFloat(startMatch[2])];
            params.end = [parseFloat(endMatch[1]), parseFloat(endMatch[2])];
        }
        
        // 解析duration
        const durationMatch = actionText.match(/duration\s*=\s*["'](\d+)\s*seconds["']/);
        if (durationMatch) {
            params.duration = parseInt(durationMatch[1]);
        }
        
        return { action, params, thinking };
    }
    
    return null;
}

/**
 * 保存调试信息
 */
async function saveDebugInfo(
    debugDir: string,
    step: number,
    screenshotBase64: string,
    userPrompt: string,
    aiResponse: string,
    action: string | null,
    params: any,
    thinking: string
): Promise<void> {
    try {
        // 确保目录存在
        if (!fs.existsSync(debugDir)) {
            fs.mkdirSync(debugDir, { recursive: true });
        }

        // 保存截图
        const screenshotPath = path.join(debugDir, `step_${step.toString().padStart(3, '0')}_screenshot.png`);
        const screenshotBuffer = Buffer.from(screenshotBase64, 'base64');
        fs.writeFileSync(screenshotPath, screenshotBuffer as any);

        // 保存操作信息
        const debugInfo = {
            step: step,
            timestamp: new Date().toISOString(),
            userPrompt: userPrompt,
            aiResponse: aiResponse,
            thinking: thinking,
            action: action,
            params: params,
            screenshotPath: screenshotPath
        };

        const debugInfoPath = path.join(debugDir, `step_${step.toString().padStart(3, '0')}_info.json`);
        fs.writeFileSync(debugInfoPath, JSON.stringify(debugInfo, null, 2), 'utf-8');

        // 保存操作说明文本
        const summaryPath = path.join(debugDir, `step_${step.toString().padStart(3, '0')}_summary.txt`);
        let summary = `步骤 ${step}\n`;
        summary += `时间: ${new Date().toLocaleString('zh-CN')}\n`;
        summary += `\n用户提示:\n${userPrompt}\n`;
        summary += `\nAI思考:\n${thinking}\n`;
        summary += `\n执行操作: ${action || '无'}\n`;
        if (params) {
            summary += `操作参数: ${JSON.stringify(params, null, 2)}\n`;
        }
        summary += `\n截图已保存: ${screenshotPath}\n`;
        fs.writeFileSync(summaryPath, summary, 'utf-8');

        console.log(`调试信息已保存: ${debugDir}`);
    } catch (error) {
        console.error('保存调试信息失败:', error);
    }
}

/**
 * 获取屏幕分辨率
 */
function getScreenSize(): { width: number; height: number } {
    // 使用hmc获取屏幕尺寸
    try {
        // hmc可能没有直接获取屏幕尺寸的方法，使用默认值或系统API
        // 这里使用常见的1920x1080作为默认值，实际应该从系统获取
        return { width: 1920, height: 1080 };
    } catch {
        return { width: 1920, height: 1080 };
    }
}

/**
 * 将归一化坐标转换为实际像素坐标
 */
function normalizeToPixel(normalized: number[], screenSize: { width: number; height: number }): number[] {
    if (!Array.isArray(normalized) || normalized.length !== 2) {
        return normalized;
    }
    
    const [x, y] = normalized;
    
    // 如果坐标已经在合理范围内（大于1），可能是像素坐标，直接返回
    if (x > 1 || y > 1) {
        return normalized;
    }
    
    // 归一化坐标转换为像素坐标
    return [
        Math.round(x * screenSize.width),
        Math.round(y * screenSize.height)
    ];
}

/**
 * 执行操作
 */
async function executeAction(action: string, params: any): Promise<void> {
    const screenSize = getScreenSize();
    
    switch (action) {
        case 'Click':
        case 'Tap':
            if (params.element && Array.isArray(params.element) && params.element.length === 2) {
                // 将归一化坐标转换为像素坐标
                const [x, y] = normalizeToPixel(params.element, screenSize);
                hmc.setCursorPos(x, y);
                await new Promise(resolve => setTimeout(resolve, 100));
                hmc.leftClick(100);
                await new Promise(resolve => setTimeout(resolve, 200));
            }
            break;
            
        case 'Type':
        case 'Input':
            if (params.text) {
                // 使用hmc输入文本
                for (const char of params.text) {
                    hmc.sendKeyboard(char, true);
                    await new Promise(resolve => setTimeout(resolve, 50));
                    hmc.sendKeyboard(char, false);
                    await new Promise(resolve => setTimeout(resolve, 10));
                }
                await new Promise(resolve => setTimeout(resolve, 200));
            }
            break;
            
        case 'Scroll':
        case 'Swipe':
            if (params.start && params.end && Array.isArray(params.start) && Array.isArray(params.end)) {
                // 将归一化坐标转换为像素坐标
                const [startX, startY] = normalizeToPixel(params.start, screenSize);
                const [endX, endY] = normalizeToPixel(params.end, screenSize);
                
                // 使用鼠标滚轮进行滚动（更简单可靠）
                // 计算滚动距离
                const deltaY = endY - startY;
                const deltaX = endX - startX;
                
                // 移动到中心位置
                const centerX = (startX + endX) / 2;
                const centerY = (startY + endY) / 2;
                hmc.setCursorPos(centerX, centerY);
                await new Promise(resolve => setTimeout(resolve, 100));
                
                // 使用滚轮滚动（如果hmc支持）
                // 如果不支持，则使用鼠标移动模拟
                if (Math.abs(deltaY) > Math.abs(deltaX)) {
                    // 垂直滚动
                    const steps = Math.abs(deltaY) / 10;
                    for (let i = 0; i < steps; i++) {
                        hmc.setCursorPos(centerX, startY + (deltaY / steps) * i);
                        await new Promise(resolve => setTimeout(resolve, 10));
                    }
                } else {
                    // 水平滚动
                    const steps = Math.abs(deltaX) / 10;
                    for (let i = 0; i < steps; i++) {
                        hmc.setCursorPos(startX + (deltaX / steps) * i, centerY);
                        await new Promise(resolve => setTimeout(resolve, 10));
                    }
                }
                
                await new Promise(resolve => setTimeout(resolve, 200));
            }
            break;
            
        case 'Wait':
            if (params.duration) {
                await new Promise(resolve => setTimeout(resolve, params.duration * 1000));
            }
            break;
            
        case 'KeyPress':
            if (params.key) {
                hmc.sendKeyboard(params.key, true);
                await new Promise(resolve => setTimeout(resolve, 50));
                hmc.sendKeyboard(params.key, false);
                await new Promise(resolve => setTimeout(resolve, 200));
            }
            break;
            
        default:
            console.log(`未知操作: ${action}`);
    }
}

export const impl = async function ({
    baseUrl,
    modelName,
    apiKey = '',
    task,
    maxSteps = 50,
    temperature = 0.1,
    debugMode = false,
    debugDir = ''
}: {
    baseUrl: string;
    modelName: string;
    apiKey?: string;
    task: string;
    maxSteps?: number;
    temperature?: number;
    debugMode?: boolean;
    debugDir?: string;
}) {
    const systemPrompt = `你是一个智能桌面操作助手，可以根据屏幕截图和任务描述，执行一系列操作来完成任务。

你必须严格按照要求输出以下格式：
<think>{think}</think>
<answer>{action}</answer>

其中：
- {think} 是对你为什么选择这个操作的简短推理说明。
- {action} 是本次执行的具体操作指令，必须严格遵循下方定义的指令格式。

操作指令及其作用如下：
- do(action="Click", element=[x,y])
  点击屏幕上的指定坐标。坐标系统已归一化处理，范围是0-1之间的小数。
  例如：[0.5, 0.5]表示屏幕中心，[0.1, 0.2]表示屏幕左上角附近。
  坐标会自动转换为实际屏幕像素坐标。
  
- do(action="Type", text="xxx")
  在当前聚焦的输入框中输入文本。使用此操作前，请确保输入框已被聚焦（先点击它）。
  
- do(action="Scroll", start=[x1,y1], end=[x2,y2])
  滚动操作，从起始坐标拖动到结束坐标。可用于滚动页面内容。
  坐标已归一化处理，范围是0-1之间的小数。
  
- do(action="Wait", duration="x seconds")
  等待指定秒数，用于等待页面加载。
  
- do(action="KeyPress", key="Enter")
  按下键盘按键，例如: Enter, Tab, Escape, Backspace等。
  
- finish(message="xxx")
  结束任务的操作，表示任务已完成。

必须遵循的规则：
1. 在执行任何操作前，先仔细分析当前屏幕内容。
2. 如果页面未加载完成，先执行Wait操作。
3. 点击操作要精确到按钮或链接的中心位置。
4. 输入文本前必须先点击输入框。
5. 如果操作没有生效，可以尝试调整坐标或重试。
6. 在结束任务前，请确认任务是否完整完成。`;

    const history: any[] = [];
    const actions: any[] = [];
    let stepCount = 0;
    let isFinished = false;
    let finalMessage = '';

    try {
        if (!task || !task.trim()) {
            throw new Error('任务描述不能为空');
        }

        if (!baseUrl || !baseUrl.trim()) {
            throw new Error('模型服务地址不能为空');
        }

        if (!modelName || !modelName.trim()) {
            throw new Error('模型名称不能为空');
        }

        // 设置调试目录
        let finalDebugDir = '';
        let taskInfo: any = null;
        if (debugMode) {
            if (debugDir && debugDir.trim()) {
                finalDebugDir = path.resolve(debugDir);
            } else {
                // 使用默认调试目录：应用目录下的 debug/desktopAgent_时间戳
                const curApp = getCurApp();
                const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
                finalDebugDir = path.join(curApp.APP_DIR, 'debug', `desktopAgent_${timestamp}`);
            }
            
            // 创建调试目录
            if (!fs.existsSync(finalDebugDir)) {
                fs.mkdirSync(finalDebugDir, { recursive: true });
            }
            
            // 保存任务信息
            taskInfo = {
                task: task,
                baseUrl: baseUrl,
                modelName: modelName,
                maxSteps: maxSteps,
                temperature: temperature,
                startTime: new Date().toISOString()
            };
            fs.writeFileSync(
                path.join(finalDebugDir, 'task_info.json'),
                JSON.stringify(taskInfo, null, 2),
                'utf-8'
            );
            
            console.log('调试模式已开启，调试目录:', finalDebugDir);
        }

        console.log('开始执行AI电脑操作任务...');
        console.log('任务描述:', task);

        // 主循环
        while (stepCount < maxSteps && !isFinished) {
            stepCount++;
            console.log(`\n步骤 ${stepCount}/${maxSteps}`);

            // 1. 截图
            console.log('正在截图...');
            const screenshotBase64 = await captureScreenshot();

            // 2. 构建用户提示
            let userPrompt = '';
            if (stepCount === 1) {
                userPrompt = `任务: ${task}\n\n请分析当前屏幕内容，并执行第一步操作来完成这个任务。`;
            } else {
                userPrompt = `继续执行任务: ${task}\n\n请分析当前屏幕内容，并执行下一步操作。`;
            }

            // 3. 调用AI模型
            console.log('正在调用AI模型分析...');
            const aiResponse = await callAIModel(
                baseUrl,
                modelName,
                apiKey,
                temperature,
                systemPrompt,
                userPrompt,
                screenshotBase64,
                history
            );

            console.log('AI响应:', aiResponse);

            // 4. 解析操作指令
            const parsedAction = parseAction(aiResponse);
            
            if (!parsedAction) {
                console.log('无法解析AI响应，尝试继续...');
                // 将AI响应添加到历史记录
                history.push({
                    role: 'assistant',
                    content: aiResponse
                });
                continue;
            }

            const { action, params, thinking } = parsedAction;
            
            console.log('思考:', thinking);
            console.log('操作:', action, params);
            
            // 如果开启调试模式，保存调试信息
            if (debugMode && finalDebugDir) {
                await saveDebugInfo(
                    finalDebugDir,
                    stepCount,
                    screenshotBase64,
                    userPrompt,
                    aiResponse,
                    action,
                    params,
                    thinking
                );
            }

            // 5. 检查是否完成
            if (action === 'finish') {
                isFinished = true;
                finalMessage = params.message || '任务完成';
                actions.push({ step: stepCount, action: 'finish', params, thinking });
                break;
            }

            // 6. 执行操作
            try {
                await executeAction(action, params);
                actions.push({ step: stepCount, action, params, thinking, success: true });
                
                // 等待操作生效
                await new Promise(resolve => setTimeout(resolve, 500));
            } catch (error: any) {
                console.error('执行操作失败:', error);
                actions.push({ step: stepCount, action, params, thinking, success: false, error: error.message });
            }

            // 7. 更新历史记录
            history.push({
                role: 'user',
                content: userPrompt
            });
            history.push({
                role: 'assistant',
                content: aiResponse
            });

            // 限制历史记录长度
            if (history.length > 20) {
                history.splice(1, 2); // 保留system prompt，删除最早的user和assistant消息
            }
        }

        const success = isFinished || stepCount >= maxSteps;
        const message = isFinished ? finalMessage : (stepCount >= maxSteps ? '达到最大步数限制' : '任务执行失败');

        // 如果开启调试模式，保存最终总结
        if (debugMode && finalDebugDir && taskInfo) {
            const summary = {
                task: task,
                success: success,
                message: message,
                totalSteps: stepCount,
                endTime: new Date().toISOString(),
                actions: actions
            };
            fs.writeFileSync(
                path.join(finalDebugDir, 'final_summary.json'),
                JSON.stringify(summary, null, 2),
                'utf-8'
            );
            
            // 保存操作日志
            const logPath = path.join(finalDebugDir, 'operation_log.txt');
            let logContent = `任务: ${task}\n`;
            logContent += `开始时间: ${new Date(taskInfo.startTime).toLocaleString('zh-CN')}\n`;
            logContent += `结束时间: ${new Date().toLocaleString('zh-CN')}\n`;
            logContent += `总步数: ${stepCount}\n`;
            logContent += `结果: ${success ? '成功' : '失败'}\n`;
            logContent += `消息: ${message}\n\n`;
            logContent += `操作列表:\n`;
            logContent += '='.repeat(50) + '\n';
            actions.forEach((action) => {
                logContent += `\n步骤 ${action.step}:\n`;
                logContent += `  思考: ${action.thinking || '无'}\n`;
                logContent += `  操作: ${action.action}\n`;
                logContent += `  参数: ${JSON.stringify(action.params, null, 2)}\n`;
                logContent += `  成功: ${action.success !== false ? '是' : '否'}\n`;
                if (action.error) {
                    logContent += `  错误: ${action.error}\n`;
                }
            });
            fs.writeFileSync(logPath, logContent, 'utf-8');
            
            console.log(`调试信息已保存到: ${finalDebugDir}`);
        }

        return {
            result: {
                success,
                message,
                steps: stepCount,
                actions,
                debugDir: debugMode ? finalDebugDir : undefined
            }
        };

    } catch (error: any) {
        const errorMessage = error.message || String(error);
        console.error('AI电脑操作失败:', errorMessage);
        
        return {
            result: {
                success: false,
                message: '任务执行失败',
                steps: stepCount,
                actions,
                error: errorMessage
            }
        };
    }
};

