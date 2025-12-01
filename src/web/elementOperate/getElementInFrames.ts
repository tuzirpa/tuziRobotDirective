import { ElementHandle, Frame, Page } from 'puppeteer-core';
import { DirectiveTree } from 'tuzirobot/types';
import { toSelector } from '../utils';

export const config: DirectiveTree = {
    name: 'web.elementOperate.getElementInFrames',
    sort: 3,
    displayName: '在页面和iframe中获取元素',
    icon: 'icon-web-create',
    isControl: false,
    isControlEnd: false,
    comment: '在页面${browserPage}及其所有iframe中，使用CSS或XPath选择器${selector}获取元素,超时时间${timeout}秒,并保存到变量${webElement}',
    inputs: {
        browserPage: {
            name: 'browserPage',
            value: '',
            display: '',
            type: 'variable',
            addConfig: {
                label: '网页对象',
                type: 'variable',
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
                required: true,
                elementLibrarySupport: true,
                placeholder:
                    '请输入CSS或XPath选择器 (例如: #id, .class, input[type="text"], //div/span)',
                label: 'CSS或XPath选择器',
                type: 'textarea'
            }
        },
        timeout: {
            name: 'timeout',
            value: '',
            type: 'number',
            addConfig: {
                isAdvanced: true,
                label: '超时时间',
                placeholder:
                    '不填写或0禁用超时(永久等待到元素出现)，-1为直接获取（不等待，可能获取不到元素），单位：秒',
                type: 'string',
                defaultValue: '30'
            }
        },
        frameFilter: {
            name: 'frameFilter',
            value: '',
            type: 'string',
            addConfig: {
                isAdvanced: true,
                label: 'iframe过滤条件',
                placeholder: '指定iframe的name/id/src属性，留空则搜索所有iframe',
                type: 'string',
                defaultValue: '',
                tip: '支持iframe的name、id或src属性匹配，如果指定了条件，只在该iframe中搜索'
            }
        }
    },

    outputs: {
        webElement: {
            name: '',
            display: '元素对象',
            type: 'web.Element',
            addConfig: {
                label: '元素对象',
                type: 'variable',
                defaultValue: 'webElement'
            }
        },
        foundInFrame: {
            name: '',
            display: '',
            type: 'web.page',
            addConfig: {
                label: '找到位置(iframe)',
                type: 'variable',
                defaultValue: 'foundInFrame'
            }
        }
    }
};

export const impl = async function ({
    browserPage,
    selector,
    timeout,
    frameFilter
}: {
    browserPage: Page | Frame;
    selector: string;
    timeout: number;
    frameFilter: string;
}) {
    try {
        if (!browserPage) {
            throw new Error('浏览器页面对象不能为空');
        }

        let webElement;
        let foundInFrame = '';
        selector = toSelector(selector);

        // 获取页面对象（如果是Frame，需要获取主页面）
        const page = browserPage instanceof Page ? browserPage : browserPage.page();
        
        // 获取所有frames
        const frames = page.frames();
        
        // 根据frameFilter过滤frames
        let targetFrames: Frame[] = [];
        if (frameFilter) {
            for (const frame of frames) {
                try {
                    const frameElement = await frame.frameElement();
                    if (frameElement) {
                        const name = await frameElement.evaluate(el => el.getAttribute('name'));
                        const id = await frameElement.evaluate(el => el.getAttribute('id'));
                        const src = await frameElement.evaluate(el => el.getAttribute('src'));
                        
                        if (name === frameFilter || id === frameFilter || src === frameFilter) {
                            targetFrames.push(frame);
                        }
                    }
                } catch (error) {
                    continue;
                }
            }
            
            if (targetFrames.length === 0) {
                console.log(`未找到匹配 "${frameFilter}" 的iframe`);
                return { webElement: '', foundInFrame: '' };
            }
        } else {
            targetFrames = frames;
        }

        // 并行搜索所有目标frames和主页面
        const searchTasks = [];
        
        // 添加主页面搜索任务
        searchTasks.push(
            page.waitForSelector(selector, { timeout: timeout * 1000 })
                .then(element => ({ element, frame: 'main' }))
                .catch(() => null)
        );
        
        // 添加iframe搜索任务
        targetFrames.forEach(frame => {
            searchTasks.push(
                frame.waitForSelector(selector, { timeout: timeout * 1000 })
                    .then(element => ({ element, frame: 'iframe' }))
                    .catch(() => null)
            );
        });
        
        // 并行执行所有搜索任务，返回第一个找到的结果
        try {
            const result = await Promise.any(searchTasks);
            if (result && result.element) {
                webElement = result.element;
                foundInFrame = result.frame;
                console.log(`在${foundInFrame}中找到元素`);
                return { webElement, foundInFrame };
            }
        } catch (error) {
            // Promise.any 只有在所有Promise都reject时才会reject
            console.log('在所有页面和iframe中都未找到元素');
        }
        
        return { webElement: '', foundInFrame: '' };
        
    } catch (error) {
        console.log('搜索过程中发生错误:', error);
        return { webElement: '', foundInFrame: '' };
    }
};
