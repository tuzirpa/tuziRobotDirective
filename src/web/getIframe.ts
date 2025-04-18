import { Page } from 'puppeteer-core';
import { DirectiveTree } from 'tuzirobot/types';
export const config: DirectiveTree = {
    name: 'web.getIframe',
    icon: 'icon-web-create',
    displayName: '获取iframe',
    comment: '在页面${browserPage}中获取子页面url 包含 ${iframeSelector}保存到${webIframe}',
    inputs: {
        browserPage: {
            name: 'browserPage',
            value: '',
            display: '',
            type: 'variable',
            addConfig: {
                label: '标签页对象',
                placeholder: '选择标签页对象',
                type: 'variable',
                filtersType: 'web.page',
                autoComplete: true
            }
        },
        iframeSelector: {
            name: 'iframeSrc',
            value: '',
            display: '',
            type: 'string',
            addConfig: {
                label: 'iframe的url',
                placeholder: '请输入iframe的url（src属性）',
                type: 'string'
            }
        }
    },

    outputs: {
        webIframe: {
            name: '',
            display: 'iframe页面',
            type: 'web.iframe',
            addConfig: {
                label: '对象',
                type: 'variable',
                defaultValue: 'webFrame'
            }
        }
    }
};

export const impl = async function ({
    browserPage,
    iframeSelector
}: {
    browserPage: Page;
    iframeSelector: string;
}) {
    const frames = browserPage.frames();
    const webIframe = frames.find((frame) => frame.url().includes(iframeSelector));
    return { webIframe };
};
