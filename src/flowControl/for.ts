import fs from 'fs';
import { typeToCode } from 'tuzirobot/commonUtil';
import { DirectiveTree } from "tuzirobot/types";

export const config: DirectiveTree = {
    name: 'flowControl.for',
    key: 'flowControl.rangeIterator',
    appendDirectiveNames: ['flowControl.for.end'],
    displayName: 'For 循环',
    icon: 'icon-web-create',
    sort: 20,
    isControl: true,
    isLoop: true,
    isControlEnd: false,
    comment: '从${startIndex} 开始循环到${endIndex}(不包含) 结束，步长为${step}，循环位置保存至${index}',
    inputs: {
        startIndex: {
            name: '开始数值',
            value: '',
            type: 'string',
            addConfig: {
                required: true,
                type: 'string',
                label: '开始数值',
                defaultValue: '0'
            }
        },
        endIndex: {
            name: '结束数值',
            value: '',
            type: 'string',
            addConfig: {
                type: 'string',
                label: '结束数值',
                required: true
            }
        },
        step: {
            name: '增长值（步长）',
            value: '',
            type: 'string',
            addConfig: {
                required: true,
                type: 'string',
                label: '增长值（步长）',
                defaultValue: '1'
            }
        },
        loopType: {
            name: '循环类型',
            value: '',
            type: 'string',
            addConfig: {
                required: true,
                type: 'select',
                label: '循环类型',
                
                defaultValue: 'number',
                options: [
                    {
                        label: '正常模式(Number)',
                        value: 'number'
                    },
                    {
                        label: '大数模式(BigInt)',
                        value: 'bigint'
                    }
                ]
            }
        }
    },
    outputs: {
        index: {
            name: 'loop_index',
            type: 'number',
            display: '数字',
            addConfig: {
                required: true,
                type: 'variable',
                label: '循环位置保存至'
            }
        }
    },
    async toCode(directive: DirectiveTree, block: string) {
        let { startIndex, endIndex, step, loopType } = directive.inputs;
        const { index } = directive.outputs;
        return `for (let ${
            index.name
        } of await robotUtil.system.flowControl.rangeIterator(BigInt(${typeToCode(
            startIndex
        )}), BigInt(${typeToCode(endIndex)}), BigInt(${typeToCode(step)}),${typeToCode(loopType)},${block})) {`;
    }
};

export const impl = async function (start: number, end: number, step: number, loopType: string) {
    loopType = loopType || 'number';
    function* range() {
		for (let i = start; i < end; i += step) {
            //i 的返回如果在 number 范围内，则返回 number，否则返回 bigint
            if (loopType === 'number') {
                if (i <= Number.MAX_SAFE_INTEGER) {
                    yield Number(i);
                } else {
                    throw new Error('超出最大安全整数范围:' + i);
                }
            } else {
                yield i;
            }
        }
	}
	return range();
};
