import { DirectiveTree } from "tuzirobot/types";

export const config: DirectiveTree = {
    name: "time.getCurrentTime",
    icon: "icon-time",
    displayName: "获取当前时间",
    comment: "获取当前时间，并保存到变量${currentTime}中",
    inputs: {
        timeZone: {
            name: "timeZone",
            value: "",
            type: "string",
            addConfig: {
                label: "时区",
                type: "select",
                placeholder: "请选择时区",
                defaultValue: "Asia/Shanghai",
                options: [
                    {
                        label: "北京时间",
                        value: "Asia/Shanghai"
                    },
                    {
                        label: "UTC",
                        value: "UTC"
                    }
                ],
                isAdvanced: true
            }
        }
    },
    outputs: {
        currentTime: {
            name: "currentTime",
            type: "date",
            display: "当前时间",
            addConfig: {
                label: "当前时间",
                type: "variable",
                defaultValue: "currentTime"
            }
        }
    }
};

export const impl = async function ({ timeZone = "Asia/Shanghai" }: { timeZone?: string }) {
    const currentTime = new Date().toLocaleString("zh-CN", { timeZone });
    return { currentTime: new Date(currentTime) };
}; 