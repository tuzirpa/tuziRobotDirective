import { ElementHandle, Page } from 'puppeteer-core';
import { DirectiveTree } from 'tuzirobot/types';
import fs from 'fs/promises';
import { toSelector } from './utils';
export const config: DirectiveTree = {
    name: 'web.uploadFiles',
    icon: 'icon-web-upload',
    displayName: '上传多个文件',
    comment: '在页面${browserPage}中${clickElement ? "点击元素触发" : "点击选择器" + selector + "触发"}上传多文件',
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
                label: '元素选择器',
                placeholder: '请输入CSS或XPath选择器',
                elementLibrarySupport: true,
                type: 'textarea',
                tip: '此参数与点击元素必须选择一个'
            }
        },
        clickElement: {
            name: 'clickElement',
            value: '',
            display: '',
            type: 'variable',
            addConfig: {
                label: '点击元素',
                type: 'variable',
                filtersType: 'web.Element',
                autoComplete: true,
                tip: '此参数与元素选择器必须选择一个'
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
        },
        timeout: {
            name: 'timeout',
            value: '30',
            type: 'number',
            addConfig: {
                isAdvanced: true,
                label: '超时时间(秒)',
                type: 'string',
                defaultValue: '30',
                tip: '等待文件选择对话框出现的超时时间'
            }
        }
    },
    outputs: {}
};

export const impl = function ({
    browserPage,
    selector,
    filePaths,
    clickElement,
    timeout = 30
}: {
    browserPage: Page;
    selector?: string;
    filePaths: string[];
    clickElement?: ElementHandle;
    timeout?: number;
}) {
    return new Promise(async (resolve, reject) => {
        try {
            if (!browserPage) {
                throw new Error('浏览器页面对象不能为空');
            }
    
            if (!clickElement && !selector) {
                throw new Error('点击元素和选择器至少需要提供一个');
            }
    
            if (!Array.isArray(filePaths) || filePaths.length === 0) {
                throw new Error('文件路径列表不能为空');
            }
    
            // 验证所有文件是否存在
            for (const filePath of filePaths) {
                try {
                    await fs.access(filePath);
                } catch {
                    throw new Error(`文件不存在: ${filePath}`);
                }
            }
    
            // 触发文件上传操作
            setTimeout(async () => {
                try {
                    if (clickElement) {
                        await clickElement.click();
                    } else if (selector) {
                        selector = toSelector(selector);
                        await browserPage.click(selector);
                    }
                } catch (error: any) {
                    reject(new Error(`点击元素失败: ${error.message}`));
                }
            }, 0);
    
            // 等待文件选择对话框出现
            try {
                const fileChooser = await browserPage.waitForFileChooser({
                    timeout: timeout * 1000
                });
                await fileChooser.accept(filePaths);
            } catch (error: any) {
                reject(new Error(`等待文件选择对话框超时: ${error.message}`));
            } finally {
                // 关闭文件选择器拦截
                //@ts-ignore
                await browserPage._client().send('Page.setInterceptFileChooserDialog', {
                    enabled: false
                });
            }
            resolve(true);
        } catch (error) {
            reject(error);
        }
    })
    
}; 