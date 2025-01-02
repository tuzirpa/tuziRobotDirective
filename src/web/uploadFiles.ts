import { ElementHandle, JSHandle, Page } from 'puppeteer-core';
import { DirectiveTree } from 'tuzirobot/types';

export const config: DirectiveTree = {
    name: 'web.uploadFiles',
    icon: 'icon-web-upload',
    displayName: '上传多个文件',
    comment: '将页面${browserPage} 中选择元素${selector}，并上传多个文件${filePaths}。',
    inputs: {
        browserPage: {
            name: 'browserPage',
            value: '',
            display: '',
            type: 'variable',
            addConfig: {
                label: '标签页对象',
                type: 'variable',
                placeholder: '请选择标签页对象',
                filtersType: 'web.page',
                autoComplete: true,
                required: true
            }
        },
        selector: {
            name: 'selector',
            value: '',
            display: '',
            type: 'string',
            addConfig: {
                label: 'css选择器',
                placeholder: '请填写选择上传元素的css选择器,支持xpath //开头的xpath表达式',
                elementLibrarySupport: true,
                type: 'textarea',
                defaultValue: '',
                tip: '上传元素的css选择器'
            }
        },
        clickElement: {
            name: 'clickElement',
            value: '',
            display: '',
            type: 'variable',
            addConfig: {
                label: '点击元素',
                placeholder: '请填写触发点击上传的元素，此参数与 css选择器 必须选择一个，如果选择了css选择器，不需要填写此参数',
                type: 'textarea',
                defaultValue: '',
                tip: '此参数与 css选择器 必须选择一个，如果选择了css选择器，不需要填写此参数'
            }
        },
        timeout: {
            name: 'timeout',
            value: '',
            type: 'number',
            addConfig: {
                isAdvanced: true,
                label: '超时时间',
                type: 'string',
                defaultValue: 30
            }
        },
        filePaths: {
            name: 'filePaths',
            value: '',
            display: '',
            type: 'arrayObject',
            addConfig: {
                label: '文件路径列表',
                placeholder: '要上传的文件路径数组',
                type: 'variable',
                required: true,
                tip: '包含所有要上传文件路径的数组'
            }
        }
    },
    outputs: {}
};

export const impl = async function ({
    browserPage,
    selector,
    filePaths,
    clickElement,
    timeout = 30
}: {
    browserPage: Page;
    selector: string;
    filePaths: string[];
    timeout: number;
    clickElement: ElementHandle;
}) {
    if (!Array.isArray(filePaths) || filePaths.length === 0) {
        throw new Error('文件路径列表不能为空');
    }

    // 触发文件上传操作
    setTimeout(() => {
        if(clickElement) {
            clickElement.click();
            return;
        }
        if (selector.startsWith('//')) {
            selector = `::-p-xpath(${selector})`;
        }
        browserPage.click(selector);
    }, 0);

    // 等待文件选择对话框出现
    const fileChooser = await browserPage.waitForFileChooser({
        timeout: timeout * 1000
    });

    // 选择多个本地文件
    await fileChooser.accept(filePaths);

    //@ts-ignore
    browserPage._client().send('Page.setInterceptFileChooserDialog', {
        enabled: false
    });
}; 