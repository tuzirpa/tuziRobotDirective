import { DirectiveTree } from 'tuzirobot/types';

export const config: DirectiveTree = {
    name: 'flowApp.getStartupArgs',
    displayName: '提取脚本启动参数',
    icon: 'icon-web-create',
    isControl: false,
    isControlEnd: false,
    comment: '提取脚本启动参数，保存到${result}，${key}为空时返回所有参数，否则返回指定参数值',
    inputs: {
        key: {
            name: 'key',
            value: '',
            type: 'string',
            addConfig: {
                label: '参数键名',
                type: 'string',
                placeholder: '可选，输入参数键名获取指定参数值，例如: name, -p, --port',
                tip: '不填则返回所有解析后的参数对象'
            }
        }
    },
    outputs: {
        result: {
            name: '',
            display: '启动参数结果',
            type: 'object',
            typeDetails: [
                {
                    key: 'args',
                    type: 'array',
                    display: '原始参数数组（当key为空时返回）'
                },
                {
                    key: 'argsString',
                    type: 'string',
                    display: '参数字符串（当key为空时返回）'
                },
                {
                    key: 'parsed',
                    type: 'object',
                    display: '解析后的参数对象（当key为空时返回）'
                },
                {
                    key: 'key',
                    type: 'string',
                    display: '查找的参数键名（当key不为空时返回）'
                },
                {
                    key: 'value',
                    type: 'string',
                    display: '参数值（当key不为空时返回）'
                },
                {
                    key: 'found',
                    type: 'boolean',
                    display: '是否找到参数（当key不为空时返回）'
                }
            ],
            addConfig: {
                label: '启动参数结果',
                type: 'variable',
                defaultValue: 'startupArgs',
                tip: '当key为空时，返回对象包含：args(数组)、argsString(字符串)、parsed(解析后的对象)。当key不为空时，返回对象包含：key(键名)、value(值)、found(是否找到)'
            }
        }
    }
};

/**
 * 解析启动参数，支持多种格式：
 * - 短参数: -p 8080, -h
 * - 长参数: --port 8080, --help
 * - 键值对: name=666, key=value
 * - 布尔标志: --debug, -v (无值参数)
 */
function parseArgs(args: string[]): Record<string, string | boolean> {
    const parsed: Record<string, string | boolean> = {};
    let i = 0;
    
    while (i < args.length) {
        const arg = args[i];
        
        // 处理键值对格式: name=666, key=value
        if (arg.includes('=') && !arg.startsWith('-')) {
            const [key, ...valueParts] = arg.split('=');
            const value = valueParts.join('='); // 支持值中包含=的情况
            parsed[key] = value;
            i++;
            continue;
        }
        
        // 处理短参数: -p 8080
        if (arg.startsWith('-') && !arg.startsWith('--') && arg.length > 1) {
            const key = arg.substring(1);
            
            // 检查下一个参数是否是值（不是以-开头）
            if (i + 1 < args.length && !args[i + 1].startsWith('-')) {
                parsed[key] = args[i + 1];
                i += 2;
            } else {
                // 布尔标志，无值
                parsed[key] = true;
                i++;
            }
            continue;
        }
        
        // 处理长参数: --port 8080, --help
        if (arg.startsWith('--')) {
            const key = arg.substring(2);
            
            // 处理 --key=value 格式
            if (key.includes('=')) {
                const [k, ...valueParts] = key.split('=');
                const value = valueParts.join('=');
                parsed[k] = value;
                i++;
                continue;
            }
            
            // 检查下一个参数是否是值
            if (i + 1 < args.length && !args[i + 1].startsWith('-')) {
                parsed[key] = args[i + 1];
                i += 2;
            } else {
                // 布尔标志，无值
                parsed[key] = true;
                i++;
            }
            continue;
        }
        
        // 普通参数（无键名，按索引存储）
        const indexKey = `_${i}`;
        parsed[indexKey] = arg;
        i++;
    }
    
    return parsed;
}

export const impl = async function ({ key = '' }: { key?: string }) {
    // process.argv 包含：
    // [0] - Node.js 可执行文件路径
    // [1] - 脚本文件路径
    // [2+] - 用户传入的参数
    
    // 获取所有启动参数（排除前两个系统参数）
    const allArgs = process.argv.slice(2);
    
    // 将参数数组转换为字符串（用空格连接）
    const argsString = allArgs.join(' ');
    
    // 解析参数为对象
    const argsObject = parseArgs(allArgs);
    
    // 如果指定了key，返回对应的值
    let value: string | boolean | undefined = undefined;
    if (key) {
        // 支持多种key格式查找
        let searchKey = key;
        
        // 如果key是 -p 格式，去掉 - 查找
        if (key.startsWith('-') && !key.startsWith('--')) {
            searchKey = key.substring(1);
        }
        // 如果key是 --port 格式，去掉 -- 查找
        else if (key.startsWith('--')) {
            searchKey = key.substring(2);
        }
        
        // 使用处理后的key查找
        if (argsObject.hasOwnProperty(searchKey)) {
            value = argsObject[searchKey];
        }
        
        // 判断是否找到
        const found = value !== undefined;
        const finalValue = found ? (value === true ? 'true' : String(value)) : '';
        
        // 如果指定了key，只返回该参数的值
        return {
            result: {
                key: key,
                value: finalValue,
                found: found
            }
        };
    }
    
    // 如果没有指定key，返回所有参数信息
    return {
        result: {
            args: allArgs,
            argsString: argsString,
            parsed: argsObject
        }
    };
};

