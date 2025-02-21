import { ElementHandle, Frame, Page } from 'puppeteer-core';
import { DirectiveTree } from 'tuzirobot/types';

export const config: DirectiveTree = {
    name: 'web.getElement_xy',
    sort: 2,
    displayName: '获取元素的坐标',
    icon: 'icon-web-create',
    isControl: false,
    isControlEnd: false,
    comment: '获取元素${element}的坐标, 返回坐标对象${coordinate}',
    inputs: {
        element: {
            name: 'element',
            value: '',
            display: '',
            type: 'variable',
            addConfig: {
                required: true,
                label: '元素对象',
                type: 'variable',
                filtersType: 'web.Element',
                autoComplete: true
            }
        }
    },

    outputs: {
        coordinate: {
            name: '',
            display: '坐标对象',
            type: 'web.coordinate',
            typeDetails: [
                {
                    key: 'x',
                    type: 'number',
                    display: 'X坐标'
                },
                {
                    key: 'y',
                    type: 'number',
                    display: 'X坐标'
                },
                {
                    key: 'width',
                    type: 'number',
                    display: '宽度'
                },
                {
                    key: 'height',
                    type: 'number',
                    display: '高度'
                },
                {
                    key: 'screenX',
                    type: 'number',
                    display: '屏幕X坐标'
                },
                {
                    key: 'screenY',
                    type: 'number',
                    display: '屏幕Y坐标'
                }
            ],
            addConfig: {
                label: '坐标对象',
                type: 'variable',

                defaultValue: 'coordinate'
            }
        }
    }
};

export const impl = async function ({ element }: { element: ElementHandle }) {
    const coordinate = await element.boundingBox();
    const frame = element.frame;
    const coordinateOut = {
        x: coordinate?.x,
        y: coordinate?.y,
        width: coordinate?.width,
        height: coordinate?.height
    };
    const screenXY = await frame.evaluate((element) => {
        const rect = element.getBoundingClientRect(); // 获取元素相对于视口的位置

        // 获取浏览器窗口的边框和标题栏的尺寸
        const windowBorderLeft = (window.outerWidth - window.innerWidth) / 2;
        const windowBorderTop = (window.outerHeight - window.innerHeight) - windowBorderLeft;

        // 计算元素相对于屏幕的位置
        const screenX = rect.left + screenLeft + windowBorderLeft;
        const screenY = rect.top + screenTop + windowBorderTop;

        return {screenX,screenY}
    },element);
    console.log(screenXY.screenX,screenXY.screenY)
    return { coordinate: {...coordinateOut,...screenXY} };
};
