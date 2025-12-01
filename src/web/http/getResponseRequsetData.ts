import { Frame, HTTPResponse, Page } from 'puppeteer-core';
import { DirectiveTree } from 'tuzirobot/types';
import { ResponseData } from './listenRequest';

export const config: DirectiveTree = {
    name: 'web.http.getResponseRequsetData',
    sort: 2,
    displayName: '获取网页请求发送数据-响应阶段',
    icon: 'icon-web-create',
    isControl: false,
    isControlEnd: false,
    description:
        '监听到数据返回时，返回数据 数据包含 url、method、remoteAddress、headers、body、buffer、json 等信息',
    comment:
        '在网页${browserPage}中获取监听请求发送数据，结果数据存入${requestData}变量',
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
        responseData: {
            name: 'responseData',
            value: '',
            display: '',
            type: 'variable',
            addConfig: {
                label: '请求结果数据对象',
                type: 'variable',
                placeholder: '请求结果数据对象,从请求结果数据列表中选择比如: 请求结果数据列表[0]'
            }
        }
    },

    outputs: {
        requestData: {
            name: '',
            display: '请求发送数据',
            type: 'string',
            addConfig: {
                label: '请求发送数据',
                type: 'variable',
                defaultValue: '请求发送数据'
            }
        }
    }
};

export const impl = async function ({
    responseData
}: {
    responseData: ResponseData;
}) {
    const body = responseData.response.request().postData();
    return { requestData: body };
};
