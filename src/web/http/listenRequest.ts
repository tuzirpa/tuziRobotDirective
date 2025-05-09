import { Frame, HTTPResponse, Page, RemoteAddress } from 'puppeteer-core';
import { DirectiveTree } from 'tuzirobot/types';

export const config: DirectiveTree = {
    name: 'web.http.listenRequest',
    sort: 2,
    displayName: '开始监听网页请求响应',
    icon: 'icon-web-create',
    isControl: false,
    isControlEnd: false,
    comment:
        '在网页${browserPage}中开始监听${url}的资源请求，过滤${filterType}类型资源，${method}方法的请求，并返回监听对象${listenerObj}',
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
            display: 'GET',
            type: 'string',
            addConfig: {
                required: true,
                label: '请求方法',
                type: 'select',
                options: [
                    { value: 'ALL', label: '全部' },
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
            display: '全部',
            type: 'string',
            addConfig: {
                label: '筛选资源类型',
                type: 'select',
                options: [
                    //'Document' | 'Stylesheet' | 'Image' | 'Media' | 'Font' | 'Script' | 'TextTrack' | 'XHR' | 'Fetch' |
                    //  'Prefetch' | 'EventSource' | 'WebSocket' | 'Manifest' | 'SignedExchange' | 'Ping' |
                    //  'CSPViolationReport' | 'Preflight' | 'Other'
                    { value: '1', label: '全部' },
                    { value: 'xhr,fetch', label: 'Fetch/XHR' },
                    { value: 'image', label: '图片(Image)' },
                    { value: 'media', label: '媒体(Media)' },
                    { value: 'script', label: '脚本(Script)' },
                    { value: 'document', label: '文档(Document)' },
                    { value: 'stylesheet', label: '样式表(Stylesheet)' },
                    { value: 'font', label: '字体(Font)' },
                    { value: 'texttrack', label: '文本轨道(TextTrack)' },
                    { value: 'prefetch', label: '预取(Prefetch)' },
                    { value: 'eventsource', label: '事件源(EventSource)' },
                    { value: 'websocket', label: 'WebSocket(WebSocket)' },
                    { value: 'manifest', label: '清单(Manifest)' },
                    { value: 'signedexchange', label: '签名交换(SignedExchange)' },
                    { value: 'ping', label: 'Ping(Ping)' },
                    { value: 'cspviolationreport', label: 'CSP违规报告(CSPViolationReport)' },
                    { value: 'preflight', label: '预检(Preflight)' },
                    { value: 'other', label: '其他(Other)' }
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

export class ResponseData {
    status: number;
    url: string;
    headers: Record<string, string>;
    remoteAddress: RemoteAddress;
    constructor(public response: HTTPResponse) {
        this.response = response;
        this.status = response.status();
        this.url = response.url();
        this.headers = response.headers();
        this.remoteAddress = response.remoteAddress();
    }

    // buffer
}

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
    let resolve: (arg0: ResponseData[]) => void, reject;
    let responses: ResponseData[] = [];
    const responsePromise = new Promise<ResponseData[]>((resolve1, reject1) => {
        resolve = resolve1;
        reject = reject1;
    });
    const responseListener = async (response: HTTPResponse) => {
        const filterTypes = filterType.split(',');
        if (
            (filterType === '1' ||
                filterTypes.includes(response.request().resourceType().toLocaleLowerCase())) &&
            response.url().includes(url) &&
            (method === 'ALL' ||
                response.request().method().toLocaleLowerCase() === method.toLocaleLowerCase())
        ) {
            // resolve(response);
            console.log('监听到请求', response.url());
            responses.push(new ResponseData(response));
        }
    };

    browserPage.on('response', responseListener);
    return {
        listenerObj: {
            responseListener,
            responsePromise,
            resolve: () => {
                resolve(responses);
            }
        }
    };
};
