import { Frame, HTTPResponse, Page } from 'puppeteer';
import { DirectiveTree } from '../../types';

export const config: DirectiveTree = {
    name: 'web.http.listenRequest',
    sort: 2,
    displayName: '开始监听网页请求',
    icon: 'icon-web-create',
    isControl: false,
    isControlEnd: false,
    comment:
        '在网页${browserPage}中开始监听${url}的资源请求，过滤${filterType}类型资源，并返回监听对象${listenerObj}。',
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
        url: {
            name: 'url',
            value: '',
            display: '',
            type: 'string',
            addConfig: {
                required: true,
                label: '资源路径Url',
                type: 'string'
            }
        },
        method: {
            name: 'method',
            value: '',
            display: '',
            type: 'string',
            addConfig: {
                required: true,
                label: '请求方法',
                type: 'select',
                options: [
                    { value: 'GET', label: 'GET' },
                    { value: 'POST', label: 'POST' },
                    { value: 'PUT', label: 'PUT' },
                    { value: 'DELETE', label: 'DELETE' },
                    { value: 'HEAD', label: 'HEAD' },
                    { value: 'OPTIONS', label: 'OPTIONS' },
                    { value: 'TRACE', label: 'TRACE' },
                    { value: 'CONNECT', label: 'CONNECT' }
                ],
                defaultValue: 'GET'
            }
        },
        filterType: {
            name: 'filterType',
            value: '',
            type: 'string',
            addConfig: {
                label: '筛选资源类型',
                type: 'select',
                options: [
                    { value: '1', label: '全部' },
                    { value: 'XHR', label: 'Fetch/XHR' },
                    { value: 'Stylesheet', label: 'CSS' },
                    { value: 'Script', label: 'JS' },
                    { value: 'Image', label: '图片' },
                    { value: 'Font', label: '字体' },
                    { value: 'Media', label: '媒体' },
                    { value: 'Document', label: '文档' },
                    { value: 'WebSocket', label: 'WebSocket' },
                    { value: 'Other', label: '其他' }
                ],
                defaultValue: '1'
            }
        }
    },

    outputs: {
        listenerObj: {
            name: '',
            display: '网页请求监听对象',
            type: 'web.listenerObj',
            addConfig: {
                label: '监听对象',
                type: 'variable',
                defaultValue: '网页请求监听对象'
            }
        }
    }
};

export const impl = async function ({
    browserPage,
    url,
    method,
    filterType
}: {
    browserPage: Page;
    url: string;
    method: string;
    filterType: string;
}) {
    let resolve: (arg0: HTTPResponse) => void, reject;
    const responsePromise = new Promise<HTTPResponse>((resolve1, reject1) => {
        resolve = resolve1;
        reject = reject1;
    });
    const responseListener = (response: HTTPResponse) => {
        if (
            (filterType === '1' || response.request().resourceType() === filterType) &&
            response.url().includes(url) &&
            response.request().method() === method
        ) {
            resolve(response);
        }
    };

    browserPage.on('response', responseListener);
    return { listenerObj: { responseListener, responsePromise } };
};