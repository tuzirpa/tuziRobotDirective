import { DirectiveTree } from 'tuzirobot/types';

export const config: DirectiveTree = {
    name: 'text.genRandomNumber',
    icon: 'icon-web-create',
    displayName: '获取随机数',
    comment: '生成随机数,范围${min}到${max},保存到变量${number}',
    inputs: {
        min: {
            name: 'min',
            value: '',
            display: '',
            type: 'string',
            addConfig: {
                label: '最小值',
                placeholder: '随机数的最小值,默认为0',
                type: 'string',
                defaultValue: '',
                required: false
            }
        },
        max: {
            name: 'max',
            value: '',
            display: '',
            type: 'string',
            addConfig: {
                label: '最大值',
                placeholder: '随机数的最大值,默认为100',
                type: 'string',
                defaultValue: '',
                required: false
            }
        }
    },

    outputs: {
        number: {
            name: '',
            display: '数字',
            type: 'number',
            addConfig: {
                label: '生成的随机数',
                type: 'variable',
                defaultValue: '随机数'
            }
        }
    }
};

export const impl = async function ({ min, max }: { min: string; max: string }) {
    let minNum = Number(min || '0');
    let maxNum = Number(max || '100');
    
    // 确保最小值小于最大值
    if (minNum > maxNum) {
        [minNum, maxNum] = [maxNum, minNum];
    }
    
    // 生成随机数（包含最小值和最大值）
    const randomNumber = Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum;
    
    return { number: randomNumber };
};

