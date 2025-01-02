import { DirectiveTree } from "tuzirobot/types";

export const config: DirectiveTree = {
    name: "time.formatTime",
    icon: "icon-time",
    displayName: "时间格式化",
    comment: "将时间${time}格式化为${format}格式，结果保存到${formattedTime}中",
    inputs: {
        time: {
            name: "time",
            value: "",
            type: "variable",
            addConfig: {
                label: "时间",
                type: "variable",
                placeholder: "请选择要格式化的时间",
                required: true,
                autoComplete: true,
                filtersType: "date"
            }
        },
        format: {
            name: "format",
            value: "",
            type: "string",
            addConfig: {
                label: "格式",
                type: "select",
                required: true,
                defaultValue: "yyyy-MM-dd HH:mm:ss",
                options: [
                    {
                        label: "yyyy-MM-dd HH:mm:ss",
                        value: "yyyy-MM-dd HH:mm:ss"
                    },
                    {
                        label: "yyyy-MM-dd",
                        value: "yyyy-MM-dd"
                    },
                    {
                        label: "HH:mm:ss",
                        value: "HH:mm:ss"
                    },
                    {
                        label: "yyyy年MM月dd日",
                        value: "yyyy年MM月dd日"
                    },
                    {
                        label: "时间戳(毫秒)",
                        value: "timestamp"
                    },
                    {
                        label: "自定义格式",
                        value: "custom"
                    }
                ]
            }
        },
        customFormat: {
            name: "customFormat",
            value: "",
            type: "string",
            addConfig: {
                label: "自定义格式",
                type: "string",
                placeholder: "例如: yyyy年MM月dd日 HH时mm分ss秒",
                tip: "yyyy: 年, MM: 月, dd: 日, HH: 时, mm: 分, ss: 秒",
                filters: "this.inputs.format.value=='custom'"
            }
        }
    },
    outputs: {
        formattedTime: {
            name: "formattedTime",
            type: "string",
            display: "格式化后的时间字符串",
            addConfig: {
                label: "格式化结果",
                type: "variable",
                defaultValue: "formattedTime"
            }
        }
    }
};

export const impl = async function ({
    time,
    format,
    customFormat
}: {
    time: Date;
    format: string;
    customFormat?: string;
}) {
    if (format === "timestamp") {
        return { formattedTime: time.getTime().toString() };
    }

    const formatString = format === "custom" ? (customFormat || format) : format;
    
    const pad = (num: number) => String(num).padStart(2, '0');
    
    const year = time.getFullYear();
    const month = pad(time.getMonth() + 1);
    const day = pad(time.getDate());
    const hours = pad(time.getHours());
    const minutes = pad(time.getMinutes());
    const seconds = pad(time.getSeconds());

    let result = formatString
        .replace('yyyy', year.toString())
        .replace('MM', month)
        .replace('dd', day)
        .replace('HH', hours)
        .replace('mm', minutes)
        .replace('ss', seconds);

    return { formattedTime: result };
}; 