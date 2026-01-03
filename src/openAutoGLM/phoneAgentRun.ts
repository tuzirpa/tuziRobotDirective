import { DirectiveTree } from 'tuzirobot/types';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { getCurApp } from 'tuzirobot/commonUtil';

const execAsync = promisify(exec);

export const config: DirectiveTree = {
    name: 'openAutoGLM.phoneAgentRun',
    displayName: 'AI手机操作',
    icon: 'icon-web-create',
    isControl: false,
    isControlEnd: false,
    comment: '使用AI模型自动操作手机完成任务${task}',
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
                tip: '可以是本地部署的模型服务，也可以是第三方服务（如智谱BigModel、ModelScope等）'
            }
        },
        modelName: {
            name: 'modelName',
            value: 'autoglm-phone-9b',
            type: 'string',
            addConfig: {
                label: '模型名称',
                type: 'string',
                defaultValue: 'autoglm-phone-9b',
                placeholder: '模型名称，例如: autoglm-phone-9b',
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
                placeholder: '请输入要执行的任务，例如: 打开微信，对文件传输助手发送消息：你好',
                required: true
            }
        },
        deviceType: {
            name: 'deviceType',
            value: 'adb',
            type: 'string',
            addConfig: {
                label: '设备类型',
                type: 'select',
                defaultValue: 'adb',
                options: [
                    { label: 'Android (ADB)', value: 'adb' },
                    { label: 'HarmonyOS (HDC)', value: 'hdc' },
                    { label: 'iOS', value: 'ios' }
                ],
                isAdvanced: true
            }
        },
        deviceId: {
            name: 'deviceId',
            value: '',
            type: 'string',
            addConfig: {
                label: '设备ID',
                type: 'string',
                placeholder: '可选，多设备时指定设备ID，例如: 192.168.1.100:5555',
                isAdvanced: true,
                tip: '如果不填写，将使用第一个连接的设备'
            }
        },
        maxSteps: {
            name: 'maxSteps',
            value: '100',
            type: 'number',
            addConfig: {
                label: '最大步数',
                type: 'string',
                defaultValue: '100',
                placeholder: '任务执行的最大步数，防止无限循环',
                isAdvanced: true
            }
        },
        lang: {
            name: 'lang',
            value: 'cn',
            type: 'string',
            addConfig: {
                label: '语言',
                type: 'select',
                defaultValue: 'cn',
                options: [
                    { label: '中文', value: 'cn' },
                    { label: 'English', value: 'en' }
                ],
                isAdvanced: true
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
                    key: 'output',
                    type: 'string',
                    display: '完整输出信息'
                },
                {
                    key: 'error',
                    type: 'string',
                    display: '错误信息（如果失败）'
                }
            ],
            addConfig: {
                label: '执行结果',
                type: 'variable',
                defaultValue: 'phoneAgentResult',
                tip: '包含执行是否成功、结果消息、完整输出和错误信息'
            }
        }
    }
};

export const impl = async function ({
    baseUrl,
    modelName,
    apiKey = '',
    task,
    deviceType = 'adb',
    deviceId = '',
    maxSteps = 100,
    lang = 'cn'
}: {
    baseUrl: string;
    modelName: string;
    apiKey?: string;
    task: string;
    deviceType?: string;
    deviceId?: string;
    maxSteps?: number;
    lang?: string;
}) {
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

        // 获取 Open-AutoGLM 项目路径
        const curApp = getCurApp();
        const openAutoGLMPath = path.join(curApp.APP_DIR, 'Open-AutoGLM', 'Open-AutoGLM');
        
        // 检查项目是否存在
        const fs = require('fs');
        if (!fs.existsSync(openAutoGLMPath)) {
            throw new Error(`Open-AutoGLM 项目路径不存在: ${openAutoGLMPath}`);
        }

        const mainPyPath = path.join(openAutoGLMPath, 'main.py');
        if (!fs.existsSync(mainPyPath)) {
            throw new Error(`main.py 文件不存在: ${mainPyPath}`);
        }

        // 构建命令参数
        const args: string[] = [];
        
        // 基础参数
        args.push(`--base-url`, baseUrl);
        args.push(`--model`, modelName);
        
        // 可选参数
        if (apiKey && apiKey.trim()) {
            args.push(`--apikey`, apiKey);
        }
        
        if (deviceType && deviceType !== 'adb') {
            args.push(`--device-type`, deviceType);
        }
        
        if (deviceId && deviceId.trim()) {
            args.push(`--device-id`, deviceId);
        }
        
        if (maxSteps && maxSteps > 0) {
            args.push(`--max-steps`, String(maxSteps));
        }
        
        if (lang && lang !== 'cn') {
            args.push(`--lang`, lang);
        }
        
        // 任务描述
        args.push(task);

        // 构建完整命令（使用数组形式，exec会自动处理参数转义）
        const command = `python`;
        const fullArgs = [mainPyPath, ...args];
        
        // 转义参数中的特殊字符
        const escapedArgs = fullArgs.map(arg => {
            // 如果参数包含空格或特殊字符，用引号包裹
            if (arg.includes(' ') || arg.includes('"') || arg.includes("'")) {
                return `"${arg.replace(/"/g, '\\"')}"`;
            }
            return arg;
        });
        
        const fullCommand = `${command} ${escapedArgs.join(' ')}`;
        console.log('执行命令:', fullCommand);

        // 执行命令
        const { stdout, stderr } = await execAsync(fullCommand, {
            cwd: openAutoGLMPath,
            maxBuffer: 10 * 1024 * 1024, // 10MB buffer
            timeout: 600000 // 10分钟超时
        });

        const output = stdout || '';
        const errorOutput = stderr || '';

        // 判断是否成功（通常如果有错误会在stderr中，但也要看返回码）
        const success = !errorOutput.includes('Error') && !errorOutput.includes('error');

        return {
            result: {
                success: success,
                message: success ? '任务执行完成' : '任务执行失败',
                output: output + (errorOutput ? '\n' + errorOutput : ''),
                error: errorOutput || (success ? '' : '执行过程中出现错误')
            }
        };

    } catch (error: any) {
        const errorMessage = error.message || String(error);
        console.error('AI手机操作失败:', errorMessage);
        
        return {
            result: {
                success: false,
                message: '任务执行失败',
                output: '',
                error: errorMessage
            }
        };
    }
};

