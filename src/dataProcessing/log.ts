import { DirectiveTree } from '../types';

export const config: DirectiveTree = {
    name: 'dataProcessing.logPrint',
    displayName: '输出日志',
    icon: 'icon-web-create',
    isControl: false,
    isControlEnd: false,
    comment: '输出 ${level} 级别日志 , 内容: ${content}',
    inputs: {
        level: {
            name: 'level',
            value: '',
            display: '信息',
            type: 'string',
            addConfig: {
                required: true,
                label: '日志输出类型',
                type: 'select',
                options: [
                    {
                        label: '信息',
                        value: 'info'
                    },
                    {
                        label: '调试',
                        value: 'debug'
                    },
                    {
                        label: '警告',
                        value: 'warn'
                    },
                    {
                        label: '错误',
                        value: 'error'
                    }
                ],
                defaultValue: 'info',
                tip: '日志输出级别'
            }
        },
        content: {
            name: '要输出的内容',
            value: '',
            type: 'string',
            addConfig: {
                label: '输出内容',
                placeholder: '请输入要输出的内容',
                type: 'textarea',
                defaultValue: '',
                tip: '输出内容'
            }
        }
    },
    outputs: {}
};

export const impl = async function ({ content, level }: { content: string; level: string }) {
    switch (level) {
        case 'info':
            console.info(content);
            break;
        case 'debug':
            console.debug(content);
            break;
        case 'warn':
            console.warn(content);
            break;
        case 'error':
            console.error(content);
            break;
        default:
            console.log(content);
            break;
    }
};
