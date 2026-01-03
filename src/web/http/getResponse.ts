import { Frame, HTTPResponse, Page } from 'puppeteer-core';
import { DirectiveTree } from 'tuzirobot/types';

export const config: DirectiveTree = {
    name: 'web.http.getResponse',
    sort: 2,
    displayName: '获取监听请求结果列表',
    icon: 'icon-web-create',
    isControl: false,
    isControlEnd: false,
    description:
        '监听到数据返回监听到的数据列表',
    comment:
        '在网页${browserPage}中获取监听请求结果，结果数据存入${responseData}变量',
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
                autoComplete: true
            }
        },
        listenerObj: {
            name: 'listenerObj',
            value: '',
            display: '',
            type: 'variable',
            addConfig: {
                label: '网页请求监听对象',
                type: 'variable',
                filtersType: 'web.listenerObj',
                autoComplete: true
            }
        }
    },

    outputs: {
        responseData: {
            name: '',
            display: '请求结果数据列表',
            type: 'array',
            addConfig: {
                label: '请求结果数据列表',
                type: 'variable',
                placeholder: '请求结果数据列表',
                defaultValue: '请求结果数据列表'
            }
        }
    }
};

export const impl = async function ({
    browserPage,
    listenerObj
}: {
    browserPage: Page;
    listenerObj: any;
}) {
    browserPage.off('response', listenerObj.responseListener);
    listenerObj.resolve();
    const responseData = await (listenerObj.responsePromise as Promise<{}>);
    return { responseData };
};
