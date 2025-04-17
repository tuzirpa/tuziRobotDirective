import { ElementHandle, Frame, Page } from 'puppeteer-core';
import { DirectiveTree } from 'tuzirobot/types';
import fs from 'fs/promises';
import path from 'path';
import { getCurApp } from 'tuzirobot/commonUtil';
import { toSelector } from '../utils';
export const config: DirectiveTree = {
    name: 'web.elementOperate.saveImageElement',
    sort: 16,
    displayName: '保存图片节点到本地',
    icon: 'icon-web-create',
    isControl: false,
    isControlEnd: false,
    comment: '在页面${browserPage}中${element ? "将图片元素" : "将匹配选择器" + selector + "的图片元素"}保存到本地${fileSavePath}',
    inputs: {
        browserPage: {
            name: 'browserPage',
            value: '',
            display: '',
            type: 'variable',
            addConfig: {
                required: true,
                label: '网页对象',
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
                label: '图片元素对象',
                type: 'variable',
                filtersType: 'web.Element',
                autoComplete: true,
                tip: '要保存的图片元素对象'
            }
        },
        selector: {
            name: 'selector',
            value: '',
            display: '',
            type: 'string',
            addConfig: {
                label: '图片元素选择器',
                placeholder: '请输入CSS或XPath选择器',
                type: 'textarea',
                elementLibrarySupport: true,
                tip: '支持CSS或XPath选择器'
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
                placeholder: '不填写则保存到应用的images目录',
                type: 'filePath',
                openDirectory: true,
                tip: '不填写则保存到应用的images目录'
            }
        },
        fileName: {
            name: 'fileName',
            value: '',
            type: 'string',
            addConfig: {
                label: '文件名',
                placeholder: '不填写则自动生成，例如: image_20240318_001.png',
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
    browserPage: Page | Frame;
    element?: ElementHandle;
    selector?: string;
    fileSavePath?: string;
    fileName?: string;
}) {
    try {
        if (!browserPage) {
            throw new Error('浏览器页面对象不能为空');
        }
        if (!element && !selector) {
            throw new Error('图片元素对象和选择器至少需要提供一个');
        }

        // 确定保存目录
        const saveDir = fileSavePath || path.join(getCurApp().APP_DIR, 'images');
        
        // 确保目录存在
        await fs.mkdir(saveDir, { recursive: true });

        // 获取目标元素
        let targetElement = element;
        if (!targetElement && selector) {
            selector = toSelector(selector);
            targetElement = await browserPage.$(selector) || undefined;
            if (!targetElement) {
                throw new Error('未找到匹配选择器的图片元素');
            }
        }

        // 获取图片URL和数据
        const imageData = await browserPage.evaluate((el) => {
            if (el?.tagName.toLowerCase() !== 'img') {
                throw new Error('目标元素不是图片节点');
            }
            const imgEl = el as HTMLImageElement;
            const src = imgEl.src;
            if (!src) {
                throw new Error('图片src属性为空');
            }
            // 检查是否是base64格式
            if (src.startsWith('data:image/')) {
                const base64Data = src.split(',')[1];
                return { isBase64: true, data: base64Data } as const;
            }
            return { isBase64: false, url: src } as const;
        }, targetElement);
        
        let imageBuffer: Buffer;
        if (imageData.isBase64) {
            // 直接从base64解码
            imageBuffer = Buffer.from(imageData.data, 'base64');
        } else {
            // 从URL获取图片数据
            const imageResponse = await browserPage.evaluate(async (url) => {
                const response = await fetch(url);
                const buffer = await response.arrayBuffer();
                return Array.from(new Uint8Array(buffer));
            }, imageData.url);
            imageBuffer = Buffer.from(imageResponse);
        }

        // 生成文件名
        let finalFileName: string;
        if (fileName) {
            finalFileName = fileName;
            // 如果没有扩展名，尝试从src获取或使用默认值
            if (!path.extname(fileName)) {
                if (imageData.isBase64) {
                    // 从base64 MIME类型获取扩展名
                    const mimeMatch = imageData.data.match(/^data:image\/(\w+);/);
                    finalFileName += mimeMatch ? `.${mimeMatch[1]}` : '.png';
                } else {
                    const urlExt = path.extname(new URL(imageData.url).pathname);
                    finalFileName += urlExt || '.png';
                }
            }
        } else {
            const date = new Date();
            const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
            let counter = 1;
            
            while (true) {
                const paddedCounter = String(counter).padStart(3, '0');
                finalFileName = `image_${dateStr}_${paddedCounter}.png`;
                const fullPath = path.join(saveDir, finalFileName);
                
                try {
                    await fs.access(fullPath);
                    counter++;
                } catch {
                    break;
                }
            }
        }

        const fullPath = path.join(saveDir, finalFileName);
        
        // 保存图片
        await fs.writeFile(fullPath, imageBuffer);

        console.log(`图片已保存为: ${fullPath}`);
        return { savedPath: fullPath };

    } catch (error) {
        console.error('保存图片失败:', error);
        throw error;
    }
}; 