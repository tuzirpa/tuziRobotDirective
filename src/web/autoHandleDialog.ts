import { Dialog, Page } from 'puppeteer-core';
import { DirectiveTree } from 'tuzirobot/types';

export const config: DirectiveTree = {
    name: 'web.autoHandleDialog',
    icon: 'icon-web-create',
    displayName: '自动处理浏览器弹窗',
    comment: '在页面${browserPage}中自动处理浏览器弹窗，支持自动接受或拒绝，比如alert, prompt, confirm 或者 beforeunload。',
    inputs: {
        browserPage: {
            name: 'browserPage',
            value: '',
            display: '',
            type: 'variable',
            addConfig: {
                label: '浏览器页面',
                type: 'variable',
                filtersType: 'web.page',
                autoComplete: true
            }
        },
        action: {
            name: 'action',
            value: 'accept',
            display: '处理动作',
            type: 'string',
            addConfig: {
                label: '处理动作',
                type: 'select',
                options: [
                    { label: '自动接受弹窗', value: 'accept' },
                    { label: '自动拒绝弹窗', value: 'dismiss' }
                ],
                defaultValue: 'accept',
                required: true,
                tip: '选择如何处理弹窗'
            }
        },
        promptText: {
            name: 'promptText',
            value: '',
            display: '提示文本',
            type: 'string',
            addConfig: {
                label: '提示文本',
                type: 'string',
                defaultValue: '',
                required: false,
                tip: '当遇到prompt类型弹窗时，输入要填入的文本'
            }
        }
    },

    outputs: {
        autoDialog: {
            name: 'autoDialog',
            display: '自动确认弹窗',
            type: 'variable',
            addConfig: {
                label: '自动确认弹窗',
                type: 'variable',
                defaultValue: '',
                required: false,
                tip: '自动确认弹窗'
            }
        },
    }
};

export const impl = async function ({
    browserPage,
    action,
    promptText
}: {
    browserPage: Page;
    action: 'accept' | 'dismiss';
    promptText?: string;
}) {

    const handleDialog = async (dialog: Dialog) => {
        const message = dialog.message();
        const type = dialog.type();
        
        console.debug(`检测到弹窗: 类型=${type}, 消息=${message}`);
        
        try {
            if (action === 'accept') {
                if (type === 'prompt' && promptText) {
                    await dialog.accept(promptText);
                    console.debug(`接受prompt弹窗，输入文本: ${promptText}`);
                } else {
                    await dialog.accept();
                    console.debug('接受弹窗');
                }
            } else {
                await dialog.dismiss();
                console.debug('拒绝弹窗');
            }
            console.debug('弹窗处理完成');
        } catch (error) {
            console.error('处理弹窗失败:', error);
        }
    }
    try {
        // 设置弹窗处理监听器
        browserPage.on('dialog', handleDialog);
        console.debug('弹窗监听器已设置');
    } catch (error) {
        console.error('设置弹窗监听器失败:', error);
    }

    return {
        cancel: () => {
            browserPage.off('dialog', handleDialog);
        }
    };
}; 