import { log } from 'console';
import { DirectiveTree } from 'tuzirobot/types';
import { typeToCode } from 'tuzirobot/commonUtil';
export const config: DirectiveTree = {
    name: 'web.setOneTimerTask',
    icon: 'icon-web-create',
    isControl: true,
    appendDirectiveNames: ['web.setOneTimerTaskEnd'],
    displayName: '定时任务',
    comment: '设置定时任务，在${time}秒后执行,并将任务保存到变量${timerTask}中',
    inputs: {
        timingType: {
            name: 'timingType',
            value: '',
            display: '',
            type: 'number',
            addConfig: {
                label: '定时类型',
                placeholder: '选择定时类型',
                type: 'select',
                required: true,
                options: [
                    {
                        label: '单次执行',
                        value: '0'
                    },
                    {
                        label: '重复执行',
                        value: '1'
                    }
                ],
                defaultValue: '0'
            }
        },
        time: {
            name: 'time',
            value: '',
            display: '',
            type: 'number',
            addConfig: {
                label: '多少秒后执行',
                placeholder: '请输入秒数',
                type: 'string',
                required: true
            }
        }
    },

    outputs: {
        timerTask: {
            name: '',
            display: '定时器任务ID',
            type: 'timer.timerTask',
            addConfig: {
                label: '定时器任务ID',
                type: 'variable',
                defaultValue: 'timerTask'
            }
        }
    },

    async toCode(directive, block) {
        const { time, timingType } = directive.inputs;
        const { timerTask } = directive.outputs;

        return `var oneTimerTask = await robotUtil.system.web.setOneTimerTask(${
            timingType.value == '1'
        },${typeToCode(time)},${block});const ${timerTask.name} = oneTimerTask(async () => {`;
    }
};

export const impl = async function (loop: boolean, time: number) {
    if (loop) {
        console.log('重复定时任务执行时间', time + '秒');
    } else {
        console.log(
            '单次定时任务执行时间',
            new Date(new Date().getTime() + time * 1000).toLocaleString()
        );
    }

    return function (fun: Function) {
        if (loop) {
            return setInterval(fun, time * 1000);
        }
        return setTimeout(fun, time * 1000);
    };
};
