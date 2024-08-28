import { DirectiveTree } from 'tuzirobot/types';
import hmc from 'hmc-win32';
export const config: DirectiveTree = {
    name: 'clipboard.setClipboardText',
    icon: 'icon-web-create',
    displayName: '写入文本到剪贴板',
    comment: '写入文本${text}到剪贴板',
    inputs: {
        text: {
            name: 'text',
            value: '',
            display: '',
            type: 'string',
            addConfig: {
                required: true,
                placeholder: '要写入剪贴板的文本内容',
                label: '文本内容',
                type: 'textarea',
                defaultValue: ''
            }
        }
    },

    outputs: {}
};

export const impl = async function ({ text }: { text: string }) {
    hmc.setClipboardText(text);
};
