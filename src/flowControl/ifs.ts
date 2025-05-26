import { typeToCode } from 'tuzirobot/commonUtil';
import { DirectiveInput, DirectiveTree } from 'tuzirobot/types';

export const config: DirectiveTree = {
    name: 'flowControl.test2',
    appendDirectiveNames: ['flowControl.if.end'],
    displayName: 'IF 多条件',
    icon: 'icon-web-create',
    sort: 10,
    isControl: true,
    isControlEnd: false,
    comment: '判断 多条件 是否成立，如果成立，则执行以下操作',
    inputs: {
        // 条件是否同时成立
        andOr: {
            name: 'andOr',
            value: '',
            type: 'string',
            addConfig: {
                label: '多条件关系',
                type: 'select',
                options: [
                    { label: '全部条件同时成立', value: 'and' },
                    { label: '只要一个成立', value: 'or' }
                ],
                defaultValue: 'and'
            }
        },
    },
    inputs2: {
        tests: {
            name: '条件列表',
            value: [
                {
                    name: '条件操作数1',
                    value: '',
                    type: 'object',
                    addConfig: {
                        required: true,
                        type: 'object',
                        placeholder: '请输入对象',
                        label: '对象1'
                    }
                },
                {
                    name: '关系',
                    value: '==',
                    display: '等于',
                    type: 'string',
                    addConfig: {
                        type: 'select',
                        label: '关系',
                        required: true,
                        options: [
                            { value: '==', label: '等于' },
                            { value: '!=', label: '不等于' },
                            { value: '>', label: '大于' },
                            { value: '<', label: '小于' },
                            { value: '>=', label: '大于等于' },
                            { value: '<=', label: '小于等于' },
                            { value: 'in', label: '包含' },
                            { value: 'notin', label: '不包含' },
                            { value: 'isTrue', label: '等于true' },
                            { value: 'noTrue', label: '不等true' },
                            { value: 'isNull', label: '是空值' },
                            { value: 'noNull', label: '不是空值' }
                        ],
                        defaultValue: '=='
                    }
                },
                {
                    name: '条件操作数2',
                    value: '',
                    type: 'object',
                    addConfig: {
                        type: 'object',
                        label: '对象2',
                        placeholder: '请输入对象',
                        filters: `!(this.inputs2.tests.value === 'isTrue' || this.inputs.operator.value === 'noTrue' || this.inputs.operator.value === 'isNull' || this.inputs.operator.value === 'noNull')`
                    }
                }
            ]
        }
    },
    outputs: {},
    async toCode(directive, block) {
        // const {tests} = directive.inputs2!;
        const paramArr: string[] = [];
        paramArr.push('{');
        const inputValueArr: string[] = [];
        const inputKeys2 = Object.keys(directive.inputs2!);
        if (inputKeys2.length > 0) {
            inputKeys2.forEach((key) => {
                //@ts-ignore
                const input = directive.inputs2[key];
                let inputCode: string[] = [];
                input.values?.forEach(ivalue=>{
                    let iInputCode: string[] = [];
                    ivalue.forEach(item=>{
                        let codeValue = '';
                        if (item.type === 'variable') {
                            codeValue = item.value === '' ? 'undefined' : item.value;
                        } else if (item.type === 'array') {
                            codeValue = `[${item.value}]`;
                        } else if (item.type === 'arrayObject') {
                            codeValue = `${item.value}`;
                        } else {
                            codeValue = typeToCode(item);
                        }
                        iInputCode.push(`${codeValue}`);
                    })
                    inputCode.push(`[${iInputCode.join(',')}]`);
                })
                inputValueArr.push(`"${key}":[${inputCode}]`);
            });
        }
        paramArr.push(inputValueArr.join(','));
        paramArr.push('}');
        const params = paramArr.join('');
        const {andOr} = directive.inputs;

        return `if (await robotUtil.system.flowControl.test2(${params},${typeToCode(andOr)},${block})) {`;
    }
};

export const impl = async function ({tests} : {tests : [any,string,any][]},andOr : 'and'|'or') {
    /**
	 *
		{ value: 'in', label: '包含' },
		{ value: 'notin', label: '不包含' },
		{ value: 'isTrue', label: '等于true' },
		{ value: 'noTrue', label: '不等true' },
		{ value: 'isNull', label: '是空值' },
		{ value: 'noNull', label: '不是空值' }
	 */
    if(andOr == 'or'){
        return tests.some(test => {
            const [operand1, operator, operand2] = test;
            if (operator === 'isNull') {
                console.debug('isNull', operand1);
                return !operand1;
            } else if (operator === 'noNull') {
                return !!operand1;
            } else if (operator === 'isTrue') {
                return operand1 === 'true';
            } else if (operator === 'noTrue') {
                return operand1 !== 'true';
            } else if (operator === 'in') {
                return operand1.includes(operand2);
            } else if (operator === 'notin') {
                return !operand1.includes(operand2);
            } else if (operator === 'startsWith') {
                return operand1.startsWith(operand2);
            } else if (operator === 'endsWith') {
                return operand1.endsWith(operand2);
            } else if (operator === '==') {
                return operand1 == operand2;
            } else if (operator === '!=') {
                return operand1 != operand2;
            } else if (operator === '>') {
                return Number(operand1) > Number(operand2);
            } else if (operator === '<') {
                return Number(operand1) < Number(operand2);
            } else if (operator === '>=') {
                return Number(operand1) >= Number(operand2);
            } else if (operator === '<=') {
                return Number(operand1) <= Number(operand2);
            }
        });
    }else{
        return tests.every(test => {
            const [operand1, operator, operand2] = test;
            if (operator === 'isNull') {
                console.debug('isNull', operand1);
                return !operand1;
            } else if (operator === 'noNull') {
                return !!operand1;
            } else if (operator === 'isTrue') {
                return operand1 === 'true';
            } else if (operator === 'noTrue') {
                return operand1 !== 'true';
            } else if (operator === 'in') {
                return operand1.includes(operand2);
            } else if (operator === 'notin') {
                return !operand1.includes(operand2);
            } else if (operator === 'startsWith') {
                return operand1.startsWith(operand2);
            } else if (operator === 'endsWith') {
                return operand1.endsWith(operand2);
            } else if (operator === '==') {
                return operand1 == operand2;
            } else if (operator === '!=') {
                return operand1 != operand2;
            } else if (operator === '>') {
                return Number(operand1) > Number(operand2);
            } else if (operator === '<') {
                return Number(operand1) < Number(operand2);
            } else if (operator === '>=') {
                return Number(operand1) >= Number(operand2);
            } else if (operator === '<=') {
                return Number(operand1) <= Number(operand2);
            }
        });
    }
};
