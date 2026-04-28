import { Page, ElementHandle } from 'puppeteer-core';
import { DirectiveTree } from 'tuzirobot/types';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { toSelector } from '../utils';

export const config: DirectiveTree = {
    name: 'web.captcha.aiCaptchaSolver',
    displayName: 'AI验证码识别',
    icon: 'icon-web-create',
    isControl: false,
    isControlEnd: false,
    comment: '在页面${browserPage}中使用AI识别并执行验证码操作，模型：${modelName}',
    inputs: {
        browserPage: {
            name: 'browserPage',
            value: '',
            display: '',
            type: 'variable',
            addConfig: {
                required: true,
                label: '标签页对象',
                type: 'variable',
                filtersType: 'web.page',
                autoComplete: true
            }
        },
        captchaSelector: {
            name: 'captchaSelector',
            value: '',
            type: 'string',
            addConfig: {
                label: '验证码区域选择器',
                type: 'textarea',
                placeholder: '验证码区域的CSS/XPath选择器，不填则截取整个页面',
                elementLibrarySupport: true,
                tip: '填写验证码所在区域的选择器可以提高识别精度'
            }
        },
        captchaElement: {
            name: 'captchaElement',
            value: '',
            display: '',
            type: 'variable',
            addConfig: {
                label: '验证码区域元素',
                type: 'variable',
                filtersType: 'web.Element',
                autoComplete: true,
                tip: '直接传入验证码区域的元素对象（与选择器二选一）'
            }
        },
        baseUrl: {
            name: 'baseUrl',
            value: 'https://ark.cn-beijing.volces.com/api/v3',
            type: 'string',
            addConfig: {
                label: '模型服务地址',
                type: 'string',
                required: true,
                defaultValue: 'https://ark.cn-beijing.volces.com/api/v3',
                placeholder: '豆包/智谱/通义/OpenAI 的 API 地址',
                tip: '豆包: https://ark.cn-beijing.volces.com/api/v3\n智谱: https://open.bigmodel.cn/api/paas/v4\n自动识别 API 格式'
            }
        },
        modelName: {
            name: 'modelName',
            value: 'doubao-seed-2-0-pro-260215',
            type: 'string',
            addConfig: {
                label: '模型名称',
                type: 'string',
                required: true,
                defaultValue: 'doubao-seed-2-0-pro-260215',
                placeholder: '例如: doubao-seed-2-0-pro-260215, glm-4v, gpt-4o',
                tip: '视觉大模型名称，需支持图片输入'
            }
        },
        apiKey: {
            name: 'apiKey',
            value: '',
            type: 'string',
            addConfig: {
                label: 'API密钥',
                type: 'string',
                required: true,
                placeholder: '模型服务的 API Key'
            }
        },

        captchaType: {
            name: 'captchaType',
            value: 'slider',
            type: 'string',
            addConfig: {
                label: '验证码类型',
                type: 'select',
                required: true,
                defaultValue: 'slider',
                options: [
                    { label: '滑块验证码', value: 'slider' },
                    { label: '点选验证码', value: 'click' },
                    { label: '图形验证码(文本)', value: 'text' },
                    { label: '自定义(使用自定义提示词)', value: 'custom' }
                ],
                tip: '选择验证码类型以使用对应的识别策略'
            }
        },
        customPrompt: {
            name: 'customPrompt',
            value: '',
            type: 'string',
            addConfig: {
                label: '自定义提示词',
                type: 'textarea',
                placeholder: '验证码类型选"自定义"时生效，输入给 AI 的系统提示词',
                tip: '自定义模式下的系统提示词',
                filters: 'this.inputs.captchaType.value === "custom"'
            }
        },
        maxRetries: {
            name: 'maxRetries',
            value: '3',
            type: 'number',
            addConfig: {
                label: '最大重试次数',
                type: 'string',
                defaultValue: '3',
                placeholder: '识别失败时的最大重试次数',
                isAdvanced: true
            }
        },
        actionDelay: {
            name: 'actionDelay',
            value: '100',
            type: 'number',
            addConfig: {
                label: '操作间隔(毫秒)',
                type: 'string',
                defaultValue: '100',
                placeholder: '每个操作之间的等待时间',
                isAdvanced: true
            }
        },
        temperature: {
            name: 'temperature',
            value: '0.1',
            type: 'number',
            addConfig: {
                label: '温度参数',
                type: 'string',
                defaultValue: '0.1',
                placeholder: 'AI 温度参数，值越小结果越确定',
                isAdvanced: true
            }
        },
        recognitionRounds: {
            name: 'recognitionRounds',
            value: '3',
            type: 'number',
            addConfig: {
                label: '识别次数（取中位数）',
                type: 'string',
                defaultValue: '3',
                placeholder: '同一截图调用AI多次取中位数，次数越多越精确但越慢，建议3~5',
                isAdvanced: true,
                tip: '多次识别取中位数可有效降低坐标误差，设为1则单次识别'
            }
        },
        normalizeSize: {
            name: 'normalizeSize',
            value: '1000',
            type: 'number',
            addConfig: {
                label: '归一化尺寸',
                type: 'string',
                defaultValue: '1000',
                placeholder: '截图归一化到此尺寸(正方形)，默认1000',
                isAdvanced: true
            }
        },
        dragOffsetX: {
            name: 'dragOffsetX',
            value: '0',
            type: 'number',
            addConfig: {
                label: '拖动X偏移(像素)',
                type: 'string',
                defaultValue: '0',
                placeholder: '拖动终点水平方向修正，正数右移，负数左移',
                isAdvanced: true,
                tip: '用于修正AI识别的拖动终点偏差，单位像素。例如总是偏左10px，填10',
                filters: 'this.inputs.captchaType.value === "slider"'
            }
        },
        dragOffsetY: {
            name: 'dragOffsetY',
            value: '0',
            type: 'number',
            addConfig: {
                label: '拖动Y偏移(像素)',
                type: 'string',
                defaultValue: '0',
                placeholder: '拖动终点垂直方向修正，正数下移，负数上移',
                isAdvanced: true,
                tip: '一般滑块只需调X偏移，Y偏移保持0即可',
                filters: 'this.inputs.captchaType.value === "slider"'
            }
        },
        debugDir: {
            name: 'debugDir',
            value: '',
            type: 'string',
            addConfig: {
                label: '调试输出目录',
                type: 'string',
                openDirectory: true,
                placeholder: '填写后会保存截图原图和标注了操作动作的调试图',
                isAdvanced: true,
                tip: '留空则不输出调试图。填写目录后每次识别会保存：原始截图 + 标注动作位置的调试图'
            }
        }
    },
    outputs: {
        result: {
            name: '',
            display: '识别结果',
            type: 'object',
            typeDetails: [
                { key: 'success', type: 'boolean', display: '是否成功' },
                { key: 'text', type: 'string', display: 'AI原始返回文本' },
                { key: 'actions', type: 'array', display: '执行的操作列表' },
                { key: 'retries', type: 'number', display: '重试次数' }
            ],
            addConfig: {
                label: '识别结果',
                type: 'variable',
                defaultValue: 'captchaResult',
                tip: '包含识别是否成功、AI原始文本、操作列表、重试次数'
            }
        }
    }
};

// ─── 内置提示词 ───

/**
 * 坐标精度：使用 0~9999 的整数坐标，对应图片从左上角(0,0)到右下角(9999,9999)。
 * 执行时除以 10000 转换为比例值。
 */
const COORD_SCALE = 10000;

const SYSTEM_PROMPTS: Record<string, string> = {
    slider: `你是一个网页滑块验证码自动化执行专家。
规则：
1. 坐标使用 0~9999 的整数，(0,0)表示图片左上角，(9999,9999)表示图片右下角。
2. 这是滑块验证码，你必须且只能返回一个 drag 操作，表示从滑块按钮拖动到缺口位置。绝对不要返回 click 或 move。
3. 仔细观察图片，找到滑块按钮的中心位置作为拖动起点(x1,y1)，找到背景图上缺口的中心位置作为拖动终点(x2,y2)。
4. 滑块按钮通常在图片底部滑动轨道的最左侧，缺口通常在背景图中某个位置，拖动方向为水平（y1 和 y2 相同）。
5. 只返回 JSON，不解释、不闲聊。
6. 严格按以下 JSON 格式返回（只有一个 drag）：

{"actions":[{"type":"drag","x1":1200,"y1":8500,"x2":6800,"y2":8500}]}`,

    click: `你是一个网页点选验证码自动化执行专家。
规则：
1. 坐标使用 0~9999 的整数，(0,0)表示图片左上角，(9999,9999)表示图片右下角。
2. 根据验证码提示文字，按正确顺序找到需要点击的每个目标的中心位置。
3. 只返回 JSON，不解释、不闲聊。
4. 严格按以下 JSON 格式返回：

{"actions":[{"type":"click","x":3500,"y":4200},{"type":"click","x":6200,"y":5800},{"type":"click","x":1800,"y":7300}]}`,

    text: `你是一个网页图形验证码识别专家。
规则：
1. 识别图片中的验证码文字或数字。
2. 如果有数学运算(如 3+5=?)，直接返回计算结果。
3. 只返回 JSON，不解释、不闲聊。
4. 严格按以下 JSON 格式返回：

{"text":"Xk9P"}`
};

// ─── 操作指令解析和执行 ───

interface ParsedAction {
    type: 'move' | 'click' | 'drag' | 'text';
    params: number[];
    raw: string;
    textValue?: string;
}

/**
 * 从 AI 返回的文本中提取 JSON。
 * 兼容：纯 JSON、markdown ```json 代码块包裹、前后带多余文字等情况。
 */
function extractJson(text: string): string {
    const fenceMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)```/);
    if (fenceMatch) return fenceMatch[1].trim();

    const braceMatch = text.match(/\{[\s\S]*\}/);
    if (braceMatch) return braceMatch[0];

    return text.trim();
}

function parseAIResponse(aiText: string, captchaType: string): ParsedAction[] {
    const jsonStr = extractJson(aiText);
    let parsed: any;
    try {
        parsed = JSON.parse(jsonStr);
    } catch {
        throw new Error(`AI 返回内容不是合法 JSON: ${aiText}`);
    }

    const actions: ParsedAction[] = [];

    if (captchaType === 'text') {
        const textVal = parsed.text ?? parsed.result ?? jsonStr;
        actions.push({
            type: 'text',
            params: [],
            raw: JSON.stringify(parsed),
            textValue: String(textVal)
        });
        return actions;
    }

    const items: any[] = parsed.actions || parsed.steps || (Array.isArray(parsed) ? parsed : []);
    for (const item of items) {
        const t = (item.type || '').toLowerCase();
        if (t === 'move') {
            actions.push({
                type: 'move',
                params: [Number(item.x) / COORD_SCALE, Number(item.y) / COORD_SCALE],
                raw: JSON.stringify(item)
            });
        } else if (t === 'click') {
            actions.push({
                type: 'click',
                params: [Number(item.x) / COORD_SCALE, Number(item.y) / COORD_SCALE],
                raw: JSON.stringify(item)
            });
        } else if (t === 'drag') {
            actions.push({
                type: 'drag',
                params: [
                    Number(item.x1) / COORD_SCALE, Number(item.y1) / COORD_SCALE,
                    Number(item.x2) / COORD_SCALE, Number(item.y2) / COORD_SCALE
                ],
                raw: JSON.stringify(item)
            });
        }
    }

    return actions;
}

function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 在页面坐标系内执行 AI 返回的操作指令。
 * offsetX/offsetY: 验证码区域在页面中的左上角偏移（用于元素截图场景）。
 * areaW/areaH: 验证码区域的实际宽高像素。
 */
async function executeActions(
    page: Page,
    actions: ParsedAction[],
    offsetX: number,
    offsetY: number,
    areaW: number,
    areaH: number,
    actionDelay: number,
    dragEndOffsetX: number = 0,
    dragEndOffsetY: number = 0
): Promise<void> {
    for (let i = 0; i < actions.length; i++) {
        const action = actions[i];
        switch (action.type) {
            case 'move': {
                const x = Math.round(offsetX + action.params[0] * areaW);
                const y = Math.round(offsetY + action.params[1] * areaH);
                console.debug(`[${i + 1}/${actions.length}] move → 页面像素(${x}, ${y})  比例(${action.params[0]}, ${action.params[1]})`);
                await page.mouse.move(x, y, { steps: 20 });
                break;
            }
            case 'click': {
                const x = Math.round(offsetX + action.params[0] * areaW);
                const y = Math.round(offsetY + action.params[1] * areaH);
                console.debug(`[${i + 1}/${actions.length}] click → 页面像素(${x}, ${y})  比例(${action.params[0]}, ${action.params[1]})`);
                await page.mouse.click(x, y);
                break;
            }
            case 'drag': {
                const x1 = Math.round(offsetX + action.params[0] * areaW);
                const y1 = Math.round(offsetY + action.params[1] * areaH);
                const x2 = Math.round(offsetX + action.params[2] * areaW + dragEndOffsetX);
                const y2 = Math.round(offsetY + action.params[3] * areaH + dragEndOffsetY);
                const offsetInfo = (dragEndOffsetX || dragEndOffsetY) ? ` (修正: x${dragEndOffsetX>=0?'+':''}${dragEndOffsetX} y${dragEndOffsetY>=0?'+':''}${dragEndOffsetY})` : '';
                console.debug(`[${i + 1}/${actions.length}] drag → 起点(${x1}, ${y1}) 终点(${x2}, ${y2})${offsetInfo}`);

                await page.mouse.move(x1, y1, { steps: 10 });
                await delay(50 + Math.random() * 50);
                await page.mouse.down();
                await delay(30);

                const dragSteps = 30 + Math.floor(Math.random() * 10);
                for (let s = 1; s <= dragSteps; s++) {
                    const t = s / dragSteps;
                    const easeT = 1 - Math.pow(1 - t, 3);
                    const cx = x1 + (x2 - x1) * easeT;
                    const cy = y1 + (y2 - y1) * easeT + (Math.random() - 0.5) * 2;
                    await page.mouse.move(cx, cy);
                    await delay(8 + Math.random() * 8);
                }

                await delay(50 + Math.random() * 80);
                await page.mouse.up();
                break;
            }
            case 'text': {
                console.debug(`[${i + 1}/${actions.length}] text → "${action.textValue}"`);
                break;
            }
        }
        await delay(actionDelay);
    }
}

// ─── 调试图：在原始截图上标注动作位置 ───

async function saveDebugImages(
    debugDir: string,
    screenshotBase64: string,
    actions: ParsedAction[],
    box: { x: number; y: number; width: number; height: number },
    attempt: number,
    page: Page
): Promise<void> {
    try {
        if (!fs.existsSync(debugDir)) {
            fs.mkdirSync(debugDir, { recursive: true });
        }

        const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
        const prefix = `captcha_${ts}_attempt${attempt}`;

        // 保存原始截图
        const rawPath = path.join(debugDir, `${prefix}_raw.png`);
        const rawBuf = Buffer.from(screenshotBase64, 'base64');
        fs.writeFileSync(rawPath, new Uint8Array(rawBuf.buffer, rawBuf.byteOffset, rawBuf.byteLength));
        console.debug(`调试原图已保存: ${rawPath}`);

        // 通过 page.evaluate 用 canvas 在内存中画标注图
        const annotatedBase64 = await page.evaluate(
            (imgBase64: string, acts: Array<{ type: string; params: number[] }>, w: number, h: number) => {
                return new Promise<string>((resolve) => {
                    const img = new Image();
                    img.onload = () => {
                        const canvas = document.createElement('canvas');
                        canvas.width = img.width;
                        canvas.height = img.height;
                        const ctx = canvas.getContext('2d')!;
                        ctx.drawImage(img, 0, 0);

                        const scaleX = img.width / w;
                        const scaleY = img.height / h;

                        for (const act of acts) {
                            if (act.type === 'move') {
                                const x = act.params[0] * w * scaleX;
                                const y = act.params[1] * h * scaleY;
                                // 蓝色十字
                                ctx.strokeStyle = '#0088ff';
                                ctx.lineWidth = 2;
                                ctx.beginPath();
                                ctx.moveTo(x - 10, y); ctx.lineTo(x + 10, y);
                                ctx.moveTo(x, y - 10); ctx.lineTo(x, y + 10);
                                ctx.stroke();
                                ctx.fillStyle = '#0088ff';
                                ctx.font = '12px Arial';
                                ctx.fillText(`move(${act.params[0].toFixed(4)},${act.params[1].toFixed(4)})`, x + 12, y - 4);
                            } else if (act.type === 'click') {
                                const x = act.params[0] * w * scaleX;
                                const y = act.params[1] * h * scaleY;
                                // 红色圆圈
                                ctx.strokeStyle = '#ff0000';
                                ctx.lineWidth = 2;
                                ctx.beginPath();
                                ctx.arc(x, y, 8, 0, Math.PI * 2);
                                ctx.stroke();
                                ctx.fillStyle = '#ff0000';
                                ctx.font = '12px Arial';
                                ctx.fillText(`click(${act.params[0].toFixed(4)},${act.params[1].toFixed(4)})`, x + 12, y - 4);
                            } else if (act.type === 'drag') {
                                const x1 = act.params[0] * w * scaleX;
                                const y1 = act.params[1] * h * scaleY;
                                const x2 = act.params[2] * w * scaleX;
                                const y2 = act.params[3] * h * scaleY;
                                // 绿色起点圆 + 红色终点圆 + 箭头线
                                ctx.strokeStyle = '#00cc00';
                                ctx.lineWidth = 2;
                                ctx.beginPath();
                                ctx.arc(x1, y1, 8, 0, Math.PI * 2);
                                ctx.stroke();
                                ctx.fillStyle = '#00cc00';
                                ctx.font = '12px Arial';
                                ctx.fillText('起点', x1 + 12, y1 - 4);

                                ctx.strokeStyle = '#ff0000';
                                ctx.beginPath();
                                ctx.arc(x2, y2, 8, 0, Math.PI * 2);
                                ctx.stroke();
                                ctx.fillStyle = '#ff0000';
                                ctx.fillText('终点', x2 + 12, y2 - 4);

                                // 拖动箭头线
                                ctx.strokeStyle = '#ff6600';
                                ctx.lineWidth = 2;
                                ctx.setLineDash([6, 3]);
                                ctx.beginPath();
                                ctx.moveTo(x1, y1);
                                ctx.lineTo(x2, y2);
                                ctx.stroke();
                                ctx.setLineDash([]);

                                // 箭头头
                                const angle = Math.atan2(y2 - y1, x2 - x1);
                                ctx.fillStyle = '#ff6600';
                                ctx.beginPath();
                                ctx.moveTo(x2, y2);
                                ctx.lineTo(x2 - 10 * Math.cos(angle - 0.4), y2 - 10 * Math.sin(angle - 0.4));
                                ctx.lineTo(x2 - 10 * Math.cos(angle + 0.4), y2 - 10 * Math.sin(angle + 0.4));
                                ctx.closePath();
                                ctx.fill();

                                // 像素坐标标注
                                ctx.fillStyle = '#333';
                                ctx.font = '11px Arial';
                                ctx.fillText(`(${Math.round(x1/scaleX)},${Math.round(y1/scaleY)})→(${Math.round(x2/scaleX)},${Math.round(y2/scaleY)})`, Math.min(x1, x2), Math.min(y1, y2) - 12);
                            }
                        }
                        resolve(canvas.toDataURL('image/png').split(',')[1]);
                    };
                    img.src = 'data:image/png;base64,' + imgBase64;
                });
            },
            screenshotBase64,
            actions.map(a => ({ type: a.type, params: a.params })),
            box.width,
            box.height
        );

        const annotatedPath = path.join(debugDir, `${prefix}_action.png`);
        const annBuf = Buffer.from(annotatedBase64, 'base64');
        fs.writeFileSync(annotatedPath, new Uint8Array(annBuf.buffer, annBuf.byteOffset, annBuf.byteLength));
        console.log(`调试动作图已保存: ${annotatedPath}`);
    } catch (e: any) {
        console.error('保存调试图失败:', e.message);
    }
}

// ─── 截图并转 base64（整页截图 → sharp 裁切 → 等比放大） ───

async function screenshotToBase64(
    page: Page,
    captchaElement?: ElementHandle | null,
    captchaSelector?: string,
    normalizeSize?: number
): Promise<{ base64: string; box: { x: number; y: number; width: number; height: number } }> {
    // 1. 整页截图
    const fullBuf = await page.screenshot({ encoding: 'binary' }) as Buffer;

    // 2. 确定裁切区域
    let targetElement: ElementHandle | null = captchaElement || null;
    if (!targetElement && captchaSelector) {
        const sel = toSelector(captchaSelector);
        targetElement = await page.$(sel);
        if (!targetElement) {
            throw new Error(`未找到验证码选择器对应的元素: ${captchaSelector}`);
        }
    }

    let box: { x: number; y: number; width: number; height: number };

    if (targetElement) {
        const boundingBox = await targetElement.boundingBox();
        if (!boundingBox) {
            throw new Error('无法获取验证码元素的位置信息');
        }
        box = boundingBox;
    } else {
        const viewport = page.viewport() || { width: 1920, height: 1080 };
        box = { x: 0, y: 0, width: viewport.width, height: viewport.height };
    }

    // 3. 用 sharp 从整页截图中裁切元素区域
    const cropX = Math.max(0, Math.round(box.x));
    const cropY = Math.max(0, Math.round(box.y));
    const cropW = Math.round(box.width);
    const cropH = Math.round(box.height);

    let sharpInstance = sharp(fullBuf).extract({
        left: cropX, top: cropY, width: cropW, height: cropH
    });
    console.debug(`整页截图裁切: left=${cropX} top=${cropY} ${cropW}x${cropH}`);

    // 4. 等比放大：按长边缩放到 normalizeSize，短边按比例跟随
    if (normalizeSize && normalizeSize > 0) {
        const maxSide = Math.max(cropW, cropH);
        if (maxSide < normalizeSize) {
            const scale = normalizeSize / maxSide;
            const newW = Math.round(cropW * scale);
            const newH = Math.round(cropH * scale);
            console.debug(`等比放大: ${cropW}x${cropH} → ${newW}x${newH} (×${scale.toFixed(2)})`);
            sharpInstance = sharpInstance.resize(newW, newH, {
                fit: 'fill',
                kernel: sharp.kernel.lanczos3
            });
        }
    }

    const resultBuf = await sharpInstance.png().toBuffer();
    return { base64: resultBuf.toString('base64'), box };
}

// ─── 调用 AI 视觉模型（统一 OpenAI Chat 兼容格式，豆包/智谱/通义/GPT 通用） ───

async function callVisionModel(
    baseUrl: string,
    modelName: string,
    apiKey: string,
    temperature: number,
    systemPrompt: string,
    imageBase64: string
): Promise<string> {
    const base = baseUrl.replace(/\/$/, '');
    const url = base + '/chat/completions';

    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (apiKey) {
        headers['Authorization'] = `Bearer ${apiKey}`;
    }

    const body: Record<string, any> = {
        model: modelName,
        temperature,
        messages: [
            { role: 'system', content: systemPrompt },
            {
                role: 'user',
                content: [
                    { type: 'text', text: '请识别这张验证码图片，严格按要求的JSON格式返回结果。' },
                    {
                        type: 'image_url',
                        image_url: { url: `data:image/png;base64,${imageBase64}` }
                    }
                ]
            }
        ]
    };

    console.debug('调用视觉模型:', url, '模型:', modelName);
    try {
        const resp = await axios.post(url, body, { headers, timeout: 180000 });
        const content = resp.data?.choices?.[0]?.message?.content;
        if (!content) {
            console.error('API 响应结构:', JSON.stringify(resp.data).slice(0, 500));
            throw new Error('AI 模型返回内容为空');
        }
        return content.trim();
    } catch (err: any) {
        if (err.response) {
            console.error('API 请求失败:', err.response.status, JSON.stringify(err.response.data).slice(0, 800));
        }
        throw err;
    }
}

// ─── 主实现 ───

function median(arr: number[]): number {
    const sorted = [...arr].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

export const impl = async function ({
    browserPage,
    captchaSelector,
    captchaElement,
    baseUrl,
    modelName,
    apiKey,
    captchaType,
    customPrompt,
    maxRetries,
    actionDelay,
    temperature,
    normalizeSize,
    recognitionRounds,
    dragOffsetX,
    dragOffsetY,
    debugDir
}: {
    browserPage: Page;
    captchaSelector?: string;
    captchaElement?: ElementHandle;
    baseUrl: string;
    modelName: string;
    apiKey: string;
    captchaType: string;
    customPrompt?: string;
    maxRetries: number;
    actionDelay: number;
    temperature: number;
    normalizeSize: number;
    recognitionRounds?: number;
    dragOffsetX?: number;
    dragOffsetY?: number;
    debugDir?: string;
}) {
    if (!browserPage) {
        throw new Error('标签页对象不能为空');
    }

    const systemPrompt = captchaType === 'custom'
        ? (customPrompt || '请识别这张验证码图片并返回结果。')
        : (SYSTEM_PROMPTS[captchaType] || SYSTEM_PROMPTS.slider);

    let lastError: Error | null = null;
    const retries = maxRetries || 3;
    const delayMs = actionDelay || 100;

    const rounds = Math.max(1, recognitionRounds || 1);

    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            console.log(`验证码识别第 ${attempt} 次尝试，识别轮数: ${rounds}`);

            // 1. 截图（只截一次，多轮识别复用同一张图；若配置了 normalizeSize 则放大）
            const { base64, box } = await screenshotToBase64(
                browserPage, captchaElement, captchaSelector, normalizeSize
            );
            console.debug(`截图完成，区域: ${box.width}x${box.height} at (${box.x},${box.y})`);

            // 保存原始截图到调试目录
            if (debugDir) {
                try {
                    if (!fs.existsSync(debugDir)) fs.mkdirSync(debugDir, { recursive: true });
                    const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
                    const rawPath = path.join(debugDir, `captcha_${ts}_attempt${attempt}_raw.png`);
                    const dbgBuf = Buffer.from(base64, 'base64');
                    fs.writeFileSync(rawPath, new Uint8Array(dbgBuf.buffer, dbgBuf.byteOffset, dbgBuf.byteLength));
                    console.debug(`调试原图已保存: ${rawPath}`);
                } catch (e: any) {
                    console.error('保存调试原图失败:', e.message);
                }
            }

            // 2. 多轮调用 AI + 取中位数
            let actions: ParsedAction[];

            if (captchaType === 'slider' && rounds > 1) {
                // 滑块模式：多轮识别 → 收集所有坐标 → 取中位数
                const allX1: number[] = [], allY1: number[] = [], allX2: number[] = [], allY2: number[] = [];

                for (let r = 1; r <= rounds; r++) {
                    try {
                        const aiText = await callVisionModel(baseUrl, modelName, apiKey, temperature, systemPrompt, base64);
                        console.debug(`第 ${r}/${rounds} 轮 AI 返回: ${aiText}`);
                        const roundActions = parseAIResponse(aiText, captchaType);
                        const drag = roundActions.find(a => a.type === 'drag');
                        if (drag) {
                            allX1.push(drag.params[0]); allY1.push(drag.params[1]);
                            allX2.push(drag.params[2]); allY2.push(drag.params[3]);
                        }
                    } catch (e: any) {
                        console.warn(`第 ${r}/${rounds} 轮识别失败，跳过:`, e.message);
                    }
                }
                if (allX1.length === 0) throw new Error('所有识别轮次都未返回有效 drag 指令');

                const mx1 = median(allX1), my1 = median(allY1);
                const mx2 = median(allX2), my2 = median(allY2);
                console.log(`多轮中位数: x1=[${allX1.map(v => (v * COORD_SCALE).toFixed(0)).join(',')}]→${(mx1 * COORD_SCALE).toFixed(0)}, x2=[${allX2.map(v => (v * COORD_SCALE).toFixed(0)).join(',')}]→${(mx2 * COORD_SCALE).toFixed(0)}`);

                actions = [{
                    type: 'drag',
                    params: [mx1, my1, mx2, my2],
                    raw: `中位数 drag(${mx1.toFixed(4)},${my1.toFixed(4)},${mx2.toFixed(4)},${my2.toFixed(4)})`
                }];
            } else {
                // 非滑块 或 单轮识别
                const aiText = await callVisionModel(baseUrl, modelName, apiKey, temperature, systemPrompt, base64);
                console.log('AI 返回:', aiText);
                actions = parseAIResponse(aiText, captchaType);
            }

            if (actions.length === 0) {
                throw new Error('AI 返回内容无法解析为有效指令');
            }
            console.debug('最终操作指令:', JSON.stringify(actions.map(a => a.raw)));

            // 3. 执行
            if (captchaType !== 'text') {
                await executeActions(
                    browserPage, actions,
                    box.x, box.y, box.width, box.height,
                    delayMs,
                    dragOffsetX || 0, dragOffsetY || 0
                );
                console.log(`已执行 ${actions.length} 条操作指令`);
            } else {
                console.log('文本验证码识别结果:', actions[0]?.textValue);
            }

            // 保存动作标注调试图
            if (debugDir) {
                await saveDebugImages(debugDir, base64, actions, box, attempt, browserPage);
            }

            return {
                result: {
                    success: true,
                    text: actions.map(a => a.raw).join('; '),
                    actions: actions.map(a => ({
                        type: a.type,
                        params: a.params,
                        raw: a.raw,
                        ...(a.textValue ? { textValue: a.textValue } : {})
                    })),
                    retries: attempt - 1
                }
            };
        } catch (err: any) {
            lastError = err;
            console.error(`验证码识别第 ${attempt} 次尝试失败:`, err.message || err);
            if (attempt < retries) {
                await delay(1000 + Math.random() * 1000);
            }
        }
    }

    throw new Error(`验证码识别失败，已重试 ${retries} 次。最后一次错误: ${lastError?.message}`);
};
