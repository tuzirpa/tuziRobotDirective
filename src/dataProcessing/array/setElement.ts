import { DirectiveTree } from "tuzirobot/types";

export const config: DirectiveTree = {
    name: "dataProcessing.array.setElement",
    displayName: "修改数组元素",
    comment: "修改数组${array}中下标${index}位置的元素值为${value}",
    inputs: {
        array: {
            name: "array",
            value: "",
            display: "数组对象",
            type: "variable",
            addConfig: {
                label: "数组对象",
                type: "variable",
                filtersType: "array",
                required: true,
            },
        },
        index: {
            name: "index",
            value: "",
            display: "数组下标",
            type: "number",
            addConfig: {
                label: "数组下标",
                type: "string",
                defaultValue: "1",
                required: true,
            },
        },
        value: {
            name: "value",
            value: "",
            display: "新的元素值",
            type: "object",
            addConfig: {
                label: "新的元素值",
                placeholder: "请输入新的元素值",
                type: "object",
                defaultValue: "",
                required: true,
            },
        },
    },
    outputs: {},
};

export const impl = async function ({
    array,
    index,
    value,
}: {
    array: Array<any>;
    index: number;
    value: any;
}) {
    if (index < 0 || index >= array.length) {
        throw new Error(`数组下标${index}超出范围`);
    }
    array[index] = value;
}; 