import { DirectiveTree } from "tuzirobot/types";

export const config: DirectiveTree = {
    name: "time.stringToTime",
    icon: "icon-time",
    displayName: "字符串转时间",
    comment: "将时间字符串 ${timeString} 以 ${timeFormat} 格式转换为时间对象，保存到 ${timeObject} 中",
    inputs: {
        timeString: {
            name: "timeString",
            value: "",
            type: "string",
            addConfig: {
                label: "时间字符串",
                type: "string",
                placeholder: "请输入时间字符串，如：2024-01-01 12:30:00",
                required: true
            }
        },
        timeFormat: {
            name: "timeFormat",
            value: "",
            type: "string",
            addConfig: {
                label: "时间格式",
                type: "select",
                placeholder: "请选择时间格式",
                defaultValue: "yyyy-MM-dd HH:mm:ss",
                options: [
                    {
                        label: "标准格式 (yyyy-MM-dd HH:mm:ss)",
                        value: "yyyy-MM-dd HH:mm:ss"
                    },
                    {
                        label: "日期格式 (yyyy-MM-dd)",
                        value: "yyyy-MM-dd"
                    },
                    {
                        label: "简化日期 (yyyy-M-d)",
                        value: "yyyy-M-d"
                    },
                    {
                        label: "时间格式 (HH:mm:ss)",
                        value: "HH:mm:ss"
                    },
                    {
                        label: "中文格式 (yyyy年MM月dd日 HH:mm:ss)",
                        value: "yyyy年MM月dd日 HH:mm:ss"
                    },
                    {
                        label: "美式格式 (MM/dd/yyyy HH:mm:ss)",
                        value: "MM/dd/yyyy HH:mm:ss"
                    },
                    {
                        label: "ISO格式 (yyyy-MM-ddTHH:mm:ss)",
                        value: "yyyy-MM-ddTHH:mm:ss"
                    },
                    {
                        label: "时间戳格式 (timestamp)",
                        value: "timestamp"
                    },
                    {
                        label: "自定义格式",
                        value: "custom"
                    }
                ],
                isAdvanced: false
            }
        },
        customFormat: {
            name: "customFormat",
            value: "",
            type: "string",
            addConfig: {
                label: "自定义格式",
                type: "string",
                placeholder: "请输入自定义格式，如：DD/MM/YYYY HH:mm",
                defaultValue: "",
                filters: "this.inputs.timeFormat.value === 'custom'"
            }
        }
    },
    outputs: {
        timeObject: {
            name: "timeObject",
            type: "date",
            display: "时间对象",
            addConfig: {
                label: "时间对象",
                type: "variable",
                defaultValue: "timeObject"
            }
        }
    }
};

export const impl = async function ({ 
    timeString, 
    timeFormat = "yyyy-MM-dd HH:mm:ss", 
    customFormat = ""
}: { 
    timeString: string; 
    timeFormat?: string; 
    customFormat?: string;
}) {
    try {
        let parsedDate: Date;

        // 处理时间戳格式
        if (timeFormat === "timestamp") {
            const timestamp = parseInt(timeString);
            if (isNaN(timestamp)) {
                throw new Error("无效的时间戳格式");
            }
            parsedDate = new Date(timestamp);
        } else {
            // 使用自定义格式或预设格式
            const format = timeFormat === "custom" ? customFormat : timeFormat;
            
            // 将格式字符串转换为正则表达式
            const regexPattern = convertFormatToRegex(format);
            const regex = new RegExp(regexPattern);
            
            if (!regex.test(timeString)) {
                throw new Error(`时间字符串格式不匹配，期望格式：${format},实际格式：${timeString}`);
            }

            // 解析时间字符串
            parsedDate = parseTimeString(timeString, format);
        }

        // 验证日期是否有效
        if (isNaN(parsedDate.getTime())) {
            throw new Error("解析的时间无效");
        }

        return {
            timeObject: parsedDate,
        };

    } catch (error) {
        throw error;
    }
};

// 将格式字符串转换为正则表达式
function convertFormatToRegex(format: string): string {
    return format
        .replace(/yyyy/g, '\\d{4}')
        .replace(/MM/g, '\\d{2}')
        .replace(/dd/g, '\\d{2}')
        .replace(/HH/g, '\\d{2}')
        .replace(/mm/g, '\\d{2}')
        .replace(/ss/g, '\\d{2}')
        .replace(/年/g, '年')
        .replace(/月/g, '月')
        .replace(/日/g, '日')
        .replace(/\//g, '\\/')
        .replace(/-/g, '\\-')
        .replace(/:/g, '\\:')
        .replace(/T/g, 'T')
        .replace(/ /g, ' ');
}

// 解析时间字符串
function parseTimeString(timeString: string, format: string): Date {
    // 创建解析映射
    const parseMap: { [key: string]: number } = {};
    
    // 最简单的方法：直接提取数字部分
    const numbers = timeString.match(/\d+/g) || [];
    
    // 根据格式字符串中的令牌顺序来分配数字
    const tokens = format.match(/yyyy|MM|M|dd|d|HH|mm|ss/g) || [];
    
    for (let i = 0; i < tokens.length && i < numbers.length; i++) {
        const token = tokens[i];
        const value = parseInt(numbers[i]);
        
        if (isNaN(value)) continue;
        
        switch (token) {
            case 'yyyy':
                parseMap.year = value;
                break;
            case 'MM':
            case 'M':
                parseMap.month = value - 1; // 月份从0开始
                break;
            case 'dd':
            case 'd':
                parseMap.day = value;
                break;
            case 'HH':
                parseMap.hour = value;
                break;
            case 'mm':
                parseMap.minute = value;
                break;
            case 'ss':
                parseMap.second = value;
                break;
        }
    }
    
    // 创建Date对象
    const date = new Date();
    if (parseMap.year) date.setFullYear(parseMap.year);
    if (parseMap.month !== undefined) date.setMonth(parseMap.month);
    if (parseMap.day) date.setDate(parseMap.day);
    if (parseMap.hour !== undefined) date.setHours(parseMap.hour);
    if (parseMap.minute !== undefined) date.setMinutes(parseMap.minute);
    if (parseMap.second !== undefined) date.setSeconds(parseMap.second);
    
    return date;
}

