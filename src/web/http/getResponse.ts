import { Frame, HTTPResponse, Page } from 'puppeteer';
import { DirectiveTree } from '../../types';

export const config: DirectiveTree = {
    name: 'web.http.getResponse',
    sort: 2,
    displayName: '等待获取网页请求结果',
    icon: 'icon-web-create',
    isControl: false,
    isControlEnd: false,
    description:
        '监听到数据返回时，返回数据 数据包含 url、method、remoteAddress、headers、body、buffer、json 等信息',
    comment: '',
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
        },
        timeout: {
            name: 'timeout',
            value: '30',
            type: 'number',
            addConfig: {
                label: '超时',
                type: 'string',
                required: true,
                defaultValue: '30',
                tip: '超时时间，单位：秒'
            }
        }
    },

    outputs: {
        responseData: {
            name: '',
            display: '请求结果数据',
            type: 'web.listenerObj',
            addConfig: {
                label: '请求结果数据',
                type: 'variable',
                defaultValue: '请求结果数据'
            }
        }
    }
};

export const impl = async function ({
    browserPage,
    listenerObj,
    timeout
}: {
    browserPage: Page;
    listenerObj: any;
    timeout: number;
}) {
    const startTime = Date.now();
    let resData: HTTPResponse | undefined;
    (listenerObj.responsePromise as Promise<HTTPResponse>)
        .then((res) => {
            resData = res;
        })
        .catch((err) => {
            throw new Error(err);
        })
        .finally(() => {
            browserPage?.off('response', listenerObj.responseListener);
        });

    const endTime = startTime + timeout * 1000;
    while (endTime > Date.now()) {
        if (resData) {
            const url = resData?.url();
            const body = await resData?.text();
            const remoteAddress = await resData?.remoteAddress();
            const status = await resData?.status();
            const headers = await resData?.headers();
            const buffer = await resData?.buffer();
            const responseData = {
                status,
                url,
                remoteAddress,
                headers,
                body,
                buffer
            };
            return { responseData };
        }
        await new Promise((resolve) => setTimeout(resolve, 100));
    }
    throw new Error('获取网页请求结果超时');
};