import { DirectiveTree } from "tuzirobot/types";

export const config: DirectiveTree = {
    name: "time.calculateTime",
    icon: "icon-time",
    displayName: "时间计算",
    comment: "对时间${baseTime}进行${operation}操作，${value}${unit}，结果保存到${result}中",
    inputs: {
        baseTime: {
            name: "baseTime",
            value: "",
            type: "variable",
            addConfig: {
                label: "基准时间",
                type: "variable",
                placeholder: "请选择基准时间",
                required: true,
                autoComplete: true,
                filtersType: "date"
            }
        },
        operation: {
            name: "operation",
            value: "",
            type: "string",
            addConfig: {
                label: "操作",
                type: "select",
                required: true,
                defaultValue: "add",
                options: [
                    { label: "增加", value: "add" },
                    { label: "减少", value: "subtract" }
                ]
            }
        },
        value: {
            name: "value",
            value: "",
            type: "number",
            addConfig: {
                label: "数值",
                type: "string",
                required: true,
                placeholder: "请输入数值",
                defaultValue: "1"
            }
        },
        unit: {
            name: "unit",
            value: "",
            type: "string",
            addConfig: {
                label: "单位",
                type: "select",
                required: true,
                defaultValue: "day",
                options: [
                    { label: "年", value: "year" },
                    { label: "月", value: "month" },
                    { label: "日", value: "day" },
                    { label: "小时", value: "hour" },
                    { label: "分钟", value: "minute" },
                    { label: "秒", value: "second" }
                ]
            }
        }
    },
    outputs: {
        result: {
            name: "result",
            type: "date",
            display: "计算结果",
            addConfig: {
                label: "计算结果",
                type: "variable",
                defaultValue: "calculatedTime"
            }
        }
    }
};

export const impl = async function ({
    baseTime,
    operation,
    value,
    unit
}: {
    baseTime: Date;
    operation: "add" | "subtract";
    value: number;
    unit: string;
}) {
    const date = new Date(baseTime);
    const amount = (operation === "add" ? 1 : -1) * value;

    switch (unit) {
        case "year": date.setFullYear(date.getFullYear() + amount); break;
        case "month": date.setMonth(date.getMonth() + amount); break;
        case "day": date.setDate(date.getDate() + amount); break;
        case "hour": date.setHours(date.getHours() + amount); break;
        case "minute": date.setMinutes(date.getMinutes() + amount); break;
        case "second": date.setSeconds(date.getSeconds() + amount); break;
    }

    return { result: date };
}; 