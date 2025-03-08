import { typeToCode } from 'tuzirobot/commonUtil';
import { DirectiveTree } from 'tuzirobot/types';

export const config: DirectiveTree = {
    name: 'flowControl.if',
    appendDirectiveNames: ['flowControl.if.end'],
    key: 'flowControl.test',
    displayName: 'IF 条件',
    icon: 'icon-web-create',
    sort: 10,
    isControl: true,
    isControlEnd: false,
    comment: '判断${operand1} ${operator} ${operand2} 是否成立，如果成立，则执行以下操作',
    inputs: {
        operand1: {
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
        operator: {
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
                    { value: 'startsWith', label: '文本开头是' },
                    { value: 'endsWith', label: '文本结尾是' },
                    { value: 'isNull', label: '是空值' },
                    { value: 'noNull', label: '不是空值' }
                ],
                defaultValue: '=='
            }
        },
        operand2: {
            name: '条件操作数2',
            value: '',
            type: 'object',
            addConfig: {
                type: 'object',
                label: '对象2',
                placeholder: '请输入对象',
                /**
                 * { value: 'isTrue', label: '等于true' },
                    { value: 'noTrue', label: '不等true' },
                    { value: 'isNull', label: '是空值' },
                    { value: 'noNull', label: '不是空值' }
                 */
                filters: `!(this.inputs.operator.value === 'isTrue' || this.inputs.operator.value === 'noTrue' || this.inputs.operator.value === 'isNull' || this.inputs.operator.value === 'noNull')`
            }
        }
    },
    outputs: {},
    async toCode(directive, block) {
        const { operand1, operator, operand2 } = directive.inputs;

        return `if (await robotUtil.system.flowControl.test( ${typeToCode(operand1)}, '${
            operator.value
        }',${typeToCode(operand2)},${block})) {`;
    }
};

export const impl = async function (operand1: string, operator: string, operand2: string) {
    /**
	 *
		{ value: 'in', label: '包含' },
		{ value: 'notin', label: '不包含' },
		{ value: 'isTrue', label: '等于true' },
		{ value: 'noTrue', label: '不等true' },
		{ value: 'isNull', label: '是空值' },
		{ value: 'noNull', label: '不是空值' }
	 */
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
    // const result = eval(`'${operand1}'${operator}'${operand2}'`);
    return false;
};
