import hmc from 'hmc-win32';
import { DirectiveTree } from 'tuzirobot/types';
import { getTuziAppInfo } from 'tuzirobot/commonUtil';
import { exec } from 'child_process';
import path from 'path';


const config: DirectiveTree = {
    name: 'move.move',
    displayName: '移动鼠标',
    icon: 'icon-web-create',
    isControl: false,
    isControlEnd: false,
    comment: '真实模拟鼠标移动到指定坐标',
    inputs: {
        x: {
            name: 'x',
            value: '',
            display: '',
            type: 'number',
            addConfig: {
                label: '屏幕X坐标',
                placeholder: '请输入屏幕X坐标',
                required: true,
                type: 'string'
            }
        },
        y: {
            name: 'y',
            value: '',
            display: '',
            type: 'number',
            addConfig: {
                label: '屏幕Y坐标',
                placeholder: '请输入屏幕Y坐标',
                required: true,
                type: 'string'
            }
        },
        //是否启动模拟移动
        simulateMove: {
            name: 'simulateMove',
            value: '',
            display: '',
            type: 'boolean',
            addConfig: {
                label: '是否启动模拟移动',
                placeholder: '请输入是否启动模拟移动',
                required: true,
                type: 'boolean'
            }
        },
        delay: {
            name: 'delay',
            value: '',
            display: '',
            type: 'number',
            addConfig: {
                label: '延迟时间（毫秒）',
                placeholder: '请输入延迟时间',
                required: false,
                filters: 'this.inputs.simulateMove.value == true',
                type: 'string',
                defaultValue: "1000"
            }
        }
    },
    outputs: {}
};
const impl = async function ({ x, y, simulateMove, delay }: { x: number; y: number, simulateMove : boolean, delay?: number }) {
    if (typeof x !== 'number' || typeof y !== 'number') {
        throw new Error('坐标必须是数字');
    }
    if(!simulateMove){
        hmc.setCursorPos(x, y);
    }else{

        // 模拟鼠标移动
        async function simulateMouseMove(startX:number, startY:number, endX:number, endY:number) {
           // 移动到起始点
           hmc.setCursorPos(startX, startY);

           // 计算每次移动的步长
           const steps = 30;
           const dx = (endX - startX) / steps;
           const dy = (endY - startY) / steps;

           for (let i = 0; i < steps; i++) {
               const newX = startX + dx * i;
               const newY = startY + dy * i;

               // 模拟鼠标移动到新位置
               hmc.setCursorPos(newX, newY);

               // 添加随机延迟，模拟真实移动
               const delay = Math.random() * 100;
               await new Promise(resolve => setTimeout(resolve, delay));
           }

           // 移动到目标点
           hmc.setCursorPos(endX, endY);
        }

        // 获取当前鼠标位置作为起始点 暂时有bug 获取到的位置 
        // const currentPosition = hmc.getCursorPos();
        // 定义 .exe 文件的路径
        const tuziAppInfo = getTuziAppInfo();
        const exePath = path.join(tuziAppInfo.USER_DIR, "keyMouseTool.exe");

        // 调用 .exe 文件并传递 JSON 数据
        const currentPosition = await new Promise<{ x: number; y: number }>((resolve, reject) => {
            exec(`${exePath} KeyMouse GetCursorPos`, (error, stdout, stderr) => {
                if (error) {
                    console.error(`执行错误: ${error}`);
                    return;
                }

                resolve(JSON.parse(stdout));
            });
        })
        const startX = currentPosition?.x || 0;
        const startY = currentPosition?.y || 0;
        console.log(startX,startY,x,y);
        await simulateMouseMove(startX, startY, x, y);

    }

};

export { config, impl };
