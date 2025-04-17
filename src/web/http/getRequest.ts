import { Page } from 'puppeteer-core';
import { DirectiveTree } from 'tuzirobot/types';

export const config: DirectiveTree = {
    name: 'web.http.getRequest',
    sort: 2,
    displayName: '获取监听请求数据列表',
    icon: 'icon-web-create',
    isControl: false,
    isControlEnd: false,
    description: '监听到请求返回监听到的数据列表',
    comment: '在网页${browserPage}中获取监听请求数据，结果数据存入${requestData}变量',
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
                filtersType: 'web.listenerRequestSend',
                autoComplete: true
            }
        }
    },
    outputs: {
        requestData: {
            name: '',
            display: '请求数据列表',
            type: 'array',
            addConfig: {
                label: '请求数据列表',
                type: 'variable',
                placeholder: '请求数据列表',
                defaultValue: '请求数据列表'
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
    browserPage.off('request', listenerObj.requestListener);
    listenerObj.resolve();
    const requestData = await listenerObj.requestPromise;
    return { requestData };
}; 