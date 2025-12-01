import { DirectiveTree } from "tuzirobot/types";

export const config: DirectiveTree = {
    name: "time.calculateTimeDifference",
    icon: "icon-time",
    displayName: "计算时间差值",
    comment: "计算${startTime}和${endTime}之间的差值，以${unit}为单位，结果保存到${difference}中",
    inputs: {
        startTime: {
            name: "startTime",
            value: "",
            type: "variable",
            addConfig: {
                label: "开始时间",
                type: "variable",
                placeholder: "请选择开始时间",
                required: true,
                autoComplete: true,
                filtersType: "date"
            }
        },
        endTime: {
            name: "endTime",
            value: "",
            type: "variable",
            addConfig: {
                label: "结束时间",
                type: "variable",
                placeholder: "请选择结束时间",
                required: true,
                autoComplete: true,
                filtersType: "date"
            }
        },
        unit: {
            name: "unit",
            value: "",
            type: "string",
            addConfig: {
                label: "差值单位",
                type: "select",
                required: true,
                defaultValue: "day",
                options: [
                    { label: "年", value: "year" },
                    { label: "月", value: "month" },
                    { label: "日", value: "day" },
                    { label: "小时", value: "hour" },
                    { label: "分钟", value: "minute" },
                    { label: "秒", value: "second" },
                    { label: "毫秒", value: "millisecond" }
                ]
            }
        },
        includeNegative: {
            name: "includeNegative",
            value: "",
            type: "boolean",
            addConfig: {
                label: "允许负值",
                type: "select",
                defaultValue: "true",
                options: [
                    { label: "是", value: "true" },
                    { label: "否", value: "false" }
                ],
                isAdvanced: true
            }
        }
    },
    outputs: {
        difference: {
            name: "difference",
            type: "number",
            display: "时间差值",
            addConfig: {
                label: "时间差值",
                type: "variable",
                defaultValue: "timeDifference"
            }
        }
    }
};

export const impl = async function ({
    startTime,
    endTime,
    unit,
    includeNegative
}: {
    startTime: Date;
    endTime: Date;
    unit: string;
    includeNegative?: boolean;
}) {
    try {
        // 验证输入时间
        if (!startTime || !endTime) {
            throw new Error("开始时间和结束时间不能为空");
        }

        if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
            throw new Error("无效的时间格式");
        }

        const start = new Date(startTime);
        const end = new Date(endTime);
        
        // 计算毫秒差值
        const diffInMs = end.getTime() - start.getTime();
        
        let difference: number;
        let absoluteDifference: number;

        // 根据单位计算差值
        switch (unit) {
            case "millisecond":
                difference = diffInMs;
                absoluteDifference = Math.abs(diffInMs);
                break;
                
            case "second":
                difference = Math.floor(diffInMs / 1000);
                absoluteDifference = Math.abs(difference);
                break;
                
            case "minute":
                difference = Math.floor(diffInMs / (1000 * 60));
                absoluteDifference = Math.abs(difference);
                break;
                
            case "hour":
                difference = Math.floor(diffInMs / (1000 * 60 * 60));
                absoluteDifference = Math.abs(difference);
                break;
                
            case "day":
                difference = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
                absoluteDifference = Math.abs(difference);
                break;
                
            case "month":
                // 月份计算比较复杂，使用近似值
                const yearDiff = end.getFullYear() - start.getFullYear();
                const monthDiff = end.getMonth() - start.getMonth();
                difference = yearDiff * 12 + monthDiff;
                
                // 如果天数差异较大，调整月份差值
                const dayDiff = end.getDate() - start.getDate();
                if (dayDiff > 15) {
                    difference += 1;
                } else if (dayDiff < -15) {
                    difference -= 1;
                }
                absoluteDifference = Math.abs(difference);
                break;
                
            case "year":
                // 年份计算
                const yearDifference = end.getFullYear() - start.getFullYear();
                const monthDifference = end.getMonth() - start.getMonth();
                const dayDifference = end.getDate() - start.getDate();
                
                difference = yearDifference;
                
                // 如果月份和天数差异较大，调整年份差值
                if (monthDifference > 6 || (monthDifference === 6 && dayDifference > 0)) {
                    difference += 1;
                } else if (monthDifference < -6 || (monthDifference === -6 && dayDifference < 0)) {
                    difference -= 1;
                }
                
                absoluteDifference = Math.abs(difference);
                break;
                
            default:
                throw new Error(`不支持的单位: ${unit}`);
        }

        // 如果不允许负值，返回绝对值
        const finalDifference = includeNegative ? difference : absoluteDifference;

        return {
            difference: finalDifference,
        };

    } catch (error) {
        throw error;
    }
};
