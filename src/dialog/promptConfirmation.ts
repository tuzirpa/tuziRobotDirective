import { DirectiveTree } from 'tuzirobot/types';
import { invokeApi } from 'tuzirobot/commonUtil';
export const config: DirectiveTree = {
    name: 'dialog.promptConfirmation',
    sort: 2,
    displayName: '弹出确认框',
    icon: 'icon-web-create',
    isControl: false,
    isControlEnd: false,
    comment: '弹出一个确认框，用户需要确认后才能继续执行后续指令。设置的提示语 ${message}',
    inputs: {
        message: {
            name: 'message',
            value: '',
            type: 'string',
            addConfig: {
                label: '提示语',
                placeholder: '请输入提示语',
                type: 'string',
                defaultValue: '请输入内容'
            }
        }
    },

    outputs: {}
};

export const impl = async function ({ message }: { message: string }) {
    //运行一个electron 并打开文件选择器
    const content = await invokeApi('dialog.promptConfirmation', { message });
    return { content };
};
