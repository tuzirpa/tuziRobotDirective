import { DirectiveTree } from 'tuzirobot/types';

export const config: DirectiveTree = {
    name: 'text.appendText',
    icon: 'icon-web-create',
    displayName: '追加文本内容',
    comment: '原始${text}文本后面追加${appendText}文本,并保存结果至${result}',
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
        appendText: {
            name: 'appendText',
            value: '',
            display: '',
            type: 'string',
            addConfig: {
                label: '追加文本',
                placeholder: '追加文本',
                type: 'textarea',
                required: true
            }
        }
    },

    outputs: {
        result: {
            name: '',
            display: '保存结果至',
            type: 'string',
            addConfig: {
                label: '保存结果至',
                type: 'variable',
                defaultValue: 'result'
            }
        }
    }
};

export const impl = async function ({ text, appendText }: { text: string; appendText: string }) {
    return { result: text.concat(appendText) };
};
