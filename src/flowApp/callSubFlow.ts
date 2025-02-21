import { join } from 'path';
import { DirectiveTree } from 'tuzirobot/types';
import { flowModuleImport, getCurApp } from 'tuzirobot/commonUtil';
import fs from 'fs';

export const config: DirectiveTree = {
    name: 'flowApp.callSubFlow',
    displayName: '调用子流程',
    icon: 'icon-web-create',
    isControl: false,
    isControlEnd: false,
    comment: '调用子流程${flowName}, 参数为${params}, 并返回子流程的返回值保存到${returnVal}变量中',
    inputs: {
        flowName: {
            name: 'flowName',
            value: '',
            type: 'string',
            addConfig: {
                label: '子流程名称',
                type: 'select',
                required: true,
                getOptions: async (_directive, curUserApp) => {
                    return curUserApp.flows.map((flow) => {
                        return {
                            label: flow.aliasName || flow.name,
                            value: flow.name
                        };
                    });
                },
                defaultValue: '',
                tip: '子流程名称'
            }
        },
        params: {
            name: 'params',
            value: '',
            type: 'array',
            addConfig: {
                label: '参数',
                type: 'variable',
                multiple: true,
                required: false,
                defaultValue: '',
                tip: '子流程参数'
            }
        }
    },
    outputs: {
        returnVal: {
            name: '',
            display: '数组-子流程返回值',
            type: 'array',
            addConfig: {
                label: '返回值',
                type: 'variable',
                required: true,
                defaultValue: 'subFlowReturnVal',
                tip: '子流程返回的结果'
            }
        }
    }
};

export const impl = async function ({ flowName, params }: { flowName: string; params: string }) {
    const app = getCurApp();
    const flowPath = join(app.APP_DIR, flowName + '.js');
    // console.log("子流程路径：" + flowPath);
    //判断流程是否存在
    if (!fs.existsSync(flowPath)) {
        throw new Error(`子流程${flowName}不存在`);
    }
    const flow = flowModuleImport(app.APP_DIR, flowName);
    console.log('调用子流程：' + flowName + '，参数：' + params);
    return await flow({ _callParams: params });
};
