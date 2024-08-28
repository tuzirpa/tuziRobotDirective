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
    const coordinateOut = {
        x: coordinate?.x,
        y: coordinate?.y,
        width: coordinate?.width,
        height: coordinate?.height
    };
    return { coordinate: coordinateOut };
};
