import { getCurApp } from 'tuzirobot/commonUtil';
import { DirectiveTree } from 'tuzirobot/types';

export const config: DirectiveTree = {
    name: 'flowApp.getAppInfo',
    displayName: '获取应用信息',
    icon: 'icon-web-create',
    isControl: false,
    isControlEnd: false,
    comment: '获取应用信息,保存到变量中 ${appInfo}',
    inputs: {},
    outputs: {
        appInfo: {
            name: '',
            display: '数组项数据',
            type: 'object',
            typeDetails: [
                {
                    key: 'name',
                    type: 'string',
                    display: '名称'
                },
                {
                    key: 'id',
                    type: 'string',
                    display: 'ID'
                },
                {
                    key: 'appDir',
                    type: 'string',
                    display: '应用目录'
                },
                {
                    key: 'version',
                    type: 'string',
                    display: '版本'
                }
            ],
            addConfig: {
                label: '应用信息',
                type: 'variable',
                defaultValue: 'appInfo'
            }
        }
    },
};

export const impl = async function () {
    const app = getCurApp();
    return {
        appInfo : {
            id: app.APP_ID,
            name: app.APP_NAME,
            version: app.APP_VERSION,
            appDir: app.APP_DIR,
            startRunTime: app.startRunTime
        }
    };
};
