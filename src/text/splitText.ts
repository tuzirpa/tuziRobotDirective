import { DirectiveTree } from 'tuzirobot/types';

export const config: DirectiveTree = {
    name: 'text.splitText',
    icon: 'icon-web-create',
    displayName: '分割文本',
    comment: '分割${text}文本，分隔符${splitter}文本,并保存结果至${result}',
    inputs: {
        text: {
            name: 'text',
            value: '',
            display: '',
            type: 'string',
            addConfig: {
                label: '原始文本',
                placeholder: '原始文本',
                type: 'textarea',
                required: true
            }
        },
        splitter: {
            name: 'splitter',
            value: '',
            display: '',
            type: 'string',
            addConfig: {
                label: '分割符',
                placeholder: '分割符,如: , ; 也可为空，如果为空 则使用空字符串分割',
                type: 'textarea',
                defaultValue: '',
                required: false
            }
        }
    },

    outputs: {
        result: {
            name: '',
            display: '保存结果至',
            type: 'array',
            addConfig: {
                label: '保存结果至',
                type: 'variable',
                defaultValue: 'result'
            }
        }
    }
};

export const impl = async function ({ text, splitter }: { text: string; splitter: string }) {
    return { result: text.split(splitter) };
};
