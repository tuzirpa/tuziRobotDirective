import { Page, ElementHandle } from 'puppeteer-core';
import { DirectiveTree } from 'tuzirobot/types';
import fs from 'fs/promises';
import path from 'path';
import { getCurApp } from 'tuzirobot/commonUtil';

export const config: DirectiveTree = {
    name: 'web.pageScreenshotSaveFile',
    icon: 'icon-web-create',
    displayName: '页面中元素截图保存到本地',
    comment: '在页面${browserPage}中${element ? "对元素" : selector ? "对匹配选择器" + selector + "的元素" : ""}进行截图，并保存到本地${fileSavePath}',
    inputs: {
        browserPage: {
            name: 'browserPage',
            value: '',
            display: '',
            type: 'variable',
            addConfig: {
                required: true,
                label: '标签页对象',
                type: 'variable',
                filtersType: 'web.page',
                autoComplete: true
            }
        },
        element: {
            name: 'element',
            value: '',
            display: '',
            type: 'variable',
            addConfig: {
                label: '元素对象',
                type: 'variable',
                filtersType: 'web.Element',
                autoComplete: true,
                tip: '要截图的元素对象'
            }
        },
        selector: {
            name: 'selector',
            value: '',
            display: '',
            type: 'string',
            addConfig: {
                label: '元素选择器',
                placeholder: '请输入CSS或XPath选择器，不填写则截取整个页面',
                type: 'textarea',
                elementLibrarySupport: true,
                tip: '支持CSS或XPath选择器，不填写则截取整个页面'
            }
        },
        fileSavePath: {
            name: 'fileSavePath',
            value: '',
            display: '',
            type: 'string',
            addConfig: {
                required: false,
                label: '文件保存的目录',
                placeholder: '不填写则保存到应用的screenshot目录',
                type: 'filePath',
                openDirectory: true,
                tip: '不填写则保存到应用的screenshot目录'
            }
        },
        fileName: {
            name: 'fileName',
            value: '',
            type: 'string',
            addConfig: {
                label: '文件名',
                placeholder: '不填写则自动生成，例如: screenshot_20240318_001.png',
                type: 'string',
                tip: '可选，不填写则自动生成文件名'
            }
        }
    },
    outputs: {
        savedPath: {
            name: 'savedPath',
            type: 'string',
            display: '保存的文件路径',
            addConfig: {
                label: '保存的文件路径',
                type: 'variable'
            }
        }
    }
};

export const impl = async function ({
    browserPage,
    element,
    selector,
    fileSavePath,
    fileName
}: {
    browserPage: Page;
    element?: ElementHandle;
    selector?: string;
    fileSavePath?: string;
    fileName?: string;
}) {
    try {
        if (!browserPage) {
            throw new Error('浏览器页面对象不能为空');
        }

        // 确定保存目录
        const saveDir = fileSavePath || path.join(getCurApp().APP_DIR, 'screenshot');
        
        // 确保目录存在
        await fs.mkdir(saveDir, { recursive: true });

        let finalFileName: string;
        if (fileName) {
            // 如果提供了文件名，确保有.png后缀
            finalFileName = fileName.endsWith('.png') ? fileName : `${fileName}.png`;
        } else {
            // 自动生成文件名：screenshot_YYYYMMDD_XXX.png
            const date = new Date();
            const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
            let counter = 1;
            
            // 检查文件是否存在，如果存在则增加计数器
            while (true) {
                const paddedCounter = String(counter).padStart(3, '0');
                finalFileName = `screenshot_${dateStr}_${paddedCounter}.png`;
                const fullPath = path.join(saveDir, finalFileName);
                
                try {
                    await fs.access(fullPath);
                    counter++;
                } catch {
                    // 文件不存在，可以使用这个名字
                    break;
                }
            }
        }

        const fullPath = path.join(saveDir, finalFileName);

        if (element) {
            await element.screenshot({
                path: fullPath
            });
        } else if (selector) {
            if (selector.startsWith('//')) {
                selector = `::-p-xpath(${selector})`;
            }
            const targetElement = await browserPage.$(selector);
            if (!targetElement) {
                throw new Error('未找到匹配选择器的元素');
            }
            await targetElement.screenshot({
                path: fullPath
            });
        } else {
            await browserPage.screenshot({
                path: fullPath,
                fullPage: true
            });
        }

        console.log(`截图已保存为: ${fullPath}`);
        return { savedPath: fullPath };
    } catch (error) {
        console.error('截图保存失败:', error);
        throw error;
    }
};
