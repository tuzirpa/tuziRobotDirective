import { typeToCode } from 'tuzirobot/commonUtil';
import { DirectiveInput, DirectiveTree } from 'tuzirobot/types';

export const config: DirectiveTree = {
    name: 'flowControl.test2',
    appendDirectiveNames: ['flowControl.if.end'],
    displayName: 'IF 条件',
    icon: 'icon-web-create',
    sort: 10,
    isControl: true,
    isControlEnd: false,
    comment: '判断${operand1} ${operator} ${operand2} 是否成立，如果成立，则执行以下操作',
    inputs: {},
    // inputs2: {
    //     tests: [
    //         {
    //             operand1: {
    //                 name: '条件操作数1',
    //                 value: '',
    //                 type: 'object',
    //                 addConfig: {
    //                     required: true,
    //                     type: 'object',
    //                     placeholder: '请输入对象',
    //                     label: '对象1'
    //                 }
    //             }
    //         },
    //         {
    //             operator: {
    //                 name: '关系',
    //                 value: '==',
    //                 display: '等于',
    //                 type: 'string',
    //                 addConfig: {
    //                     type: 'select',
    //                     label: '关系',
    //                     required: true,
    //                     options: [
    //                         { value: '==', label: '等于' },
    //                         { value: '!=', label: '不等于' },
    //                         { value: '>', label: '大于' },
    //                         { value: '<', label: '小于' },
    //                         { value: '>=', label: '大于等于' },
    //                         { value: '<=', label: '小于等于' },
    //                         { value: 'in', label: '包含' },
    //                         { value: 'notin', label: '不包含' },
    //                         { value: 'isTrue', label: '等于true' },
    //                         { value: 'noTrue', label: '不等true' },
    //                         { value: 'isNull', label: '是空值' },
    //                         { value: 'noNull', label: '不是空值' }
    //                     ],
    //                     defaultValue: '=='
    //                 }
    //             },
    //         },
    //         {
    //             operand2: {
    //                 name: '条件操作数2',
    //                 value: '',
    //                 type: 'object',
    //                 addConfig: {
    //                     type: 'object',
    //                     label: '对象2',
    //                     placeholder: '请输入对象',
    //                     filters: `!(this.inputs2.tests.value === 'isTrue' || this.inputs.operator.value === 'noTrue' || this.inputs.operator.value === 'isNull' || this.inputs.operator.value === 'noNull')`
    //                 }
    //             }
    //         }
    //     ]
    // },
    outputs: {},
    // async toCode(directive, block) {
    //     const {tests} = directive.inputs2;
    //     const test = tests.map(test => {
    //         const {operand1, operator, operand2} = test;
    //         const obj = {operand1: typeToCode(operand1), operator: operator.value, operand2: typeToCode(operand2)};
    //         return obj;
    //     });
    //     return `if (await robotUtil.system.flowControl.test2([${test.join(',')}],${block})) {`;
    // }
};

export const impl = async function (tests : {operand1: string, operator: string, operand2: string}[]) {
    /**
	 *
		{ value: 'in', label: '包含' },
		{ value: 'notin', label: '不包含' },
		{ value: 'isTrue', label: '等于true' },
		{ value: 'noTrue', label: '不等true' },
		{ value: 'isNull', label: '是空值' },
		{ value: 'noNull', label: '不是空值' }
	 */

    return tests.some(test => {
        const {operand1, operator, operand2} = test;
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
};
