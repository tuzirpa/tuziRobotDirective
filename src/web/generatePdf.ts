import { Page } from 'puppeteer-core';
import { DirectiveTree } from '../types';
export const config: DirectiveTree = {
    name: 'web.pageGeneratePdf',
    icon: 'icon-web-create',
    displayName: '页面生成PDF',
    comment: '将页面${browserPage} 生成PDF文件，并保存到本地${fileSavePath}。',
    inputs: {
        browserPage: {
            name: 'browserPage',
            value: '',
            display: '',
            type: 'variable',
            addConfig: {
                label: '标签页对象',
                type: 'variable',
                filtersType: 'web.page',
                autoComplete: true
            }
        },

        fileSavePath: {
            name: 'fileSavePath',
            value: '',
            display: '',
            type: 'string',
            addConfig: {
                label: '文件保存路径',
                placeholder: '选择要文件保存路径',
                type: 'filePath',
                defaultValue: '',
                required: true,
                openDirectory: true,
                tip: '文件保存路径'
            }
        }
    },

    outputs: {}
};

export const impl = async function ({
    browserPage,
    fileSavePath
}: {
    browserPage: Page;
    fileSavePath: string;
}) {
    let filePath = fileSavePath + '/' + new Date().getTime() + '.pdf';
    console.log('开始生成PDF文件...');
    console.log(filePath);
    console.log(browserPage);

    await browserPage.pdf({
        format: 'a4', //打印背景,默认为false
        printBackground: true, //不展示页眉
        displayHeaderFooter: true, //页眉与页脚样式,可在此处展示页码等

        path: filePath
    });

    console.log('PDF文件保存成功！');
};
