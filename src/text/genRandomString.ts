import { DirectiveTree } from 'tuzirobot/types';

export const config: DirectiveTree = {
    name: 'text.genRandomString',
    icon: 'icon-web-create',
    displayName: '随机生成字符串',
    comment: '生成随机字符串 长度${len}',
    inputs: {
        len: {
            name: 'len',
            value: '',
            display: '',
            type: 'string',
            addConfig: {
                label: '长度',
                placeholder: '生成字符串的长度,默认长度为32',
                type: 'string',
                defaultValue: '',
                required: false
            }
        },
        possible: {
            name: 'possible',
            value: '',
            display: '',
            type: 'string',
            addConfig: {
                label: '可选字符',
                placeholder: '可选的字符,默认包含大小写字母和数字',
                type: 'string',
                defaultValue: '',
                required: false
            }
        }
    },

    outputs: {
        text: {
            name: '',
            display: '字符串',
            type: 'string',
            addConfig: {
                label: '生成的文本',
                type: 'variable',
                defaultValue: '随机文本'
            }
        }
    }
};

export const impl = async function ({ len, possible }: { len: string; possible: string }) {
    let lenNum = Number(len || '32');
    possible = possible || 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let text = '';
    for (let i = 0; i < lenNum; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return { text };
};
