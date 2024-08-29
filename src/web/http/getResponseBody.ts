import { Frame, HTTPResponse, Page } from 'puppeteer-core';
import { DirectiveTree } from 'tuzirobot/types';

export const config: DirectiveTree = {
    name: 'web.http.getResponse',
    sort: 2,
    displayName: '等待获取网页请求结果',
    icon: 'icon-web-create',
    isControl: false,
    isControlEnd: false,
    description:
        '监听到数据返回时，返回数据 数据包含 url、method、remoteAddress、headers、body、buffer、json 等信息',
    comment:
        '在网页${browserPage}中获取监听请求结果，超时时间为${timeout}秒，结果数据存入${responseData}变量',
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
            display: '请求结果数据',
            type: 'web.listenerObj',
            typeDetails: [
                {
                    key: 'status',
                    display: '状态码',
                    type: 'number'
                },
                {
                    key: 'url',
                    display: '请求地址',
                    type: 'string'
                },
                {
                    key: 'remoteAddress',
                    display: '远程地址',
                    type: 'string'
                },
                {
                    key: 'headers',
                    display: '请求头',
                    type: 'object',
                    typeDetails: [
                        {
                            key: 'content-type',
                            display: '内容类型',
                            type: 'object',
                            typeDetails: [
                                {
                                    key: 'value',
                                    display: '值',
                                    type: 'string'
                                }
                            ]
                        },
                        {
                            key: 'content-length',
                            display: '内容长度',
                            type: 'number'
                        }
                    ]
                },
                {
                    key: 'body',
                    display: '请求体',
                    type: 'string'
                },
                {
                    key: 'buffer',
                    display: '请求数据',
                    type: 'buffer'
                }
            ],
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
    listenerObj
}: {
    browserPage: Page;
    listenerObj: any;
}) {
    browserPage.off('response', listenerObj.responseListener);
    listenerObj.resolve();
    const responseData = await (listenerObj.responsePromise as Promise<{}>);
    return { responseData };

    // const endTime = startTime + timeout * 1000;
    // while (endTime > Date.now()) {
    //     if (resData) {
    //         const url = resData?.url();
    //         const body = await resData?.text();
    //         const remoteAddress = await resData?.remoteAddress();
    //         const status = await resData?.status();
    //         const headers = await resData?.headers();
    //         const buffer = await resData?.buffer();
    //         const responseData = {
    //             status,
    //             url,
    //             remoteAddress,
    //             headers,
    //             body,
    //             buffer
    //         };
    //         return { responseData };
    //     }
    //     await new Promise((resolve) => setTimeout(resolve, 100));
    // }
    // throw new Error('获取网页请求结果超时');
};
