import { ElementHandle, Frame, Page } from 'puppeteer-core';
import { DirectiveTree } from 'tuzirobot/types';
import { toSelector } from '../utils';
export const config: DirectiveTree = {
    name: 'web.elementOperate.overlayElement',
    sort: 4,
    displayName: '在元素上覆盖蒙版',
    icon: 'icon-overlay',
    isControl: false,
    isControlEnd: false,
    comment: '在页面${browserPage}中，在指定的元素上覆盖一层蒙版',
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
        elementHandle: {
            name: 'elementHandle',
            value: '',
            display: '',
            type: 'variable',
            addConfig: {
                label: '元素对象',
                placeholder: '请输入元素对象',
                type: 'variable',
                filtersType: 'web.Element',
                tip: '直接传入元素对象'
            }
        },
        selector: {
            name: 'selector',
            value: '',
            display: '',
            type: 'string',
            addConfig: {
                label: '选择器',
                placeholder: '请输入 CSS 或 XPath 选择器',
                type: 'textarea',
                elementLibrarySupport: true,
                tip: '支持 CSS 或 XPath 选择器'
            }
        },
        overlayColor: {
            name: 'overlayColor',
            value: 'rgba(0, 0, 0, 0.5)',
            type: 'string',
            addConfig: {
                label: '蒙版颜色',
                placeholder: '请输入蒙版颜色 (例如: rgba(0, 0, 0, 0.5))',
                type: 'string'
            }
        }
    },
    outputs: {
        overlayObj: {
            name: '',
            type: 'web.elementOperate.overlayElement',
            display: '覆盖蒙版对象',
            typeDetails:[
                {
                    type: 'web.Element',
                    display: '元素对象',
                    key: 'element'
                },
                {
                    type: 'web.Element',
                    display: '覆盖蒙版对象',
                    key: 'overlay'
                }
            ],
            addConfig: {
                label: '覆盖蒙版对象',
                type: 'variable',
                defaultValue: 'overlayObj'
            }
        }
    }
};

export const impl = async function ({
    browserPage,
    elementHandle,
    selector,
    overlayColor
}: {
    browserPage: Page | Frame;
    elementHandle: ElementHandle | null; // 元素对象
    selector: string; // CSS 或 XPath 选择器
    overlayColor: string;
}) {
    try {
        if (!browserPage) {
            throw new Error('浏览器页面对象不能为空');
        }

        let el: ElementHandle | null = elementHandle;

        // 如果没有传入元素对象，则尝试使用选择器查找元素
        if (!el && selector) {
             // 转换XPath选择器
            selector = toSelector(selector);
            el = await browserPage.$(selector);
        }

        if (!el) {
            throw new Error('未找到指定的元素');
        }

        // 在页面上下文中创建蒙版
        const overlay = await browserPage.evaluateHandle((el, color) => {
            const rect = el.getBoundingClientRect(); // 存储元素的位置信息
            const overlay = document.createElement('div');
            overlay.style.position = 'fixed'; // 使用 fixed 定位
            overlay.style.top = `${rect.top}px`;
            overlay.style.left = `${rect.left}px`;
            overlay.style.width = `${rect.width}px`;
            overlay.style.height = `${rect.height}px`;
            overlay.style.zIndex = `${Date.now()}`;
            overlay.style.backgroundColor = color;
            overlay.style.pointerEvents = 'none'; // 允许点击穿透
            document.body.appendChild(overlay); // 将蒙版添加到 body
            return overlay;
        }, el, overlayColor);

        // 返回找到的元素对象
        return {overlayObj: { element: el, overlay: overlay}};

    } catch (error) {
        console.error('覆盖蒙版失败:', error);
        throw error;
    }
};