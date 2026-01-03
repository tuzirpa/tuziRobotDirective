import { DirectiveTree } from 'tuzirobot/types';
import axios from 'axios';

export const config: DirectiveTree = {
    name: 'wangbang.getTaobaoItem',
    displayName: '获取淘宝商品详情',
    icon: 'icon-http',
    comment: '获取淘宝商品详情，商品ID为${numIid}',
    inputs: {
        numIid: {
            name: 'numIid',
            value: '',
            type: 'string',
            addConfig: {
                label: '商品ID',
                type: 'string',
                required: true,
                placeholder: '请输入淘宝商品ID，例如: 687768519975'
            }
        },
        key: {
            name: 'key',
            value: 't3348460285',
            type: 'string',
            addConfig: {
                label: 'API密钥',
                type: 'string',
                defaultValue: 't3348460285',
                isAdvanced: true
            }
        },
        secret: {
            name: 'secret',
            value: '20221027',
            type: 'string',
            addConfig: {
                label: 'API密钥Secret',
                type: 'string',
                defaultValue: '20221027',
                isAdvanced: true
            }
        },
        isPromotion: {
            name: 'isPromotion',
            value: '1',
            type: 'string',
            addConfig: {
                label: '是否促销',
                type: 'select',
                defaultValue: '1',
                options: [
                    { label: '是', value: '1' },
                    { label: '否', value: '0' }
                ],
                isAdvanced: true
            }
        },
        lang: {
            name: 'lang',
            value: 'zh-CN',
            type: 'string',
            addConfig: {
                label: '语言',
                type: 'string',
                defaultValue: 'zh-CN',
                isAdvanced: true
            }
        }
    },
    outputs: {
        item: {
            name: '',
            display: '商品详情',
            type: 'variable',
            addConfig: {
                label: '商品详情',
                type: 'variable',
                defaultValue: 'taobaoItem'
            }
        }
    }
};

interface TaobaoApiResponse {
    item?: {
        num_iid: string;
        title: string;
        price: string;
        orginal_price: string;
        pic_url: string;
        detail_url: string;
        desc: string;
        item_imgs?: Array<{ url: string }>;
        props_list?: Record<string, string>;
        props_img?: Record<string, string>;
        props?: Array<{
            name: string;
            value: string;
        }>;
        skus?: {
            sku?: Array<{
                price: number;
                properties: string;
                properties_name: string;
                quantity: number;
                sku_id: string;
            }>;
        };
        [key: string]: any;
    };
    error?: string;
    error_code?: string;
}

interface SkuGroup {
    skuName: string;
    skuList: Array<{
        name: string;
        remarks: string;
        image: string;
    }>;
}

interface ItemProp {
    name: string;
    value: string;
}

interface SimplifiedItem {
    numIid: string;
    title: string;
    price: string;
    originalPrice: string;
    picUrl: string;
    detailUrl: string;
    desc: string;
    descImgs: string[];
    itemImgs: string[];
    skuGroups: SkuGroup[];
    props: ItemProp[];
    [key: string]: any;
}

/**
 * 清理图片URL中的重复部分
 */
function cleanImageUrl(url: string): string {
    if (!url) return url;
    // 处理类似 https://img.alicdn.com/imgextra///img.alicdn.com/imgextra/xxx 的重复URL
    // 替换为 https://img.alicdn.com/imgextra/xxx
    let cleaned = url.replace(/https?:\/\/img\.alicdn\.com\/imgextra\/+\/img\.alicdn\.com\/imgextra\//g, 'https://img.alicdn.com/imgextra/');
    // 处理多个斜杠的情况
    cleaned = cleaned.replace(/https?:\/\/img\.alicdn\.com\/imgextra\/+/g, 'https://img.alicdn.com/imgextra/');
    return cleaned;
}

/**
 * 从商品描述HTML中提取图片URL列表
 */
function extractDescImages(desc: string): string[] {
    if (!desc) return [];
    
    const images: string[] = [];
    // 匹配 <img> 标签中的 src 属性
    // 支持格式: <img src="xxx"> 或 <img align="xxx" src="xxx">
    const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
    let match;
    
    while ((match = imgRegex.exec(desc)) !== null) {
        if (match[1]) {
            const imageUrl = cleanImageUrl(match[1]);
            // 过滤掉隐藏的图片（style包含display:none）
            if (!imageUrl.includes('display:none') && !imageUrl.includes('o0b.cn')) {
                images.push(imageUrl);
            }
        }
    }
    
    return images;
}

/**
 * 解析SKU值名称和备注
 */
function parseSkuValue(propValue: string): { name: string; remarks: string } {
    // 例如: "尺码:M 【适合95-120斤】" -> name: "M", remarks: "【适合95-120斤】"
    const match = propValue.match(/^[^:]+:([^【]+)(.*)$/);
    if (match) {
        return {
            name: match[1].trim(),
            remarks: match[2].trim()
        };
    }
    // 如果没有匹配到，尝试简单分割
    const parts = propValue.split(':');
    if (parts.length >= 2) {
        const valuePart = parts.slice(1).join(':');
        const remarksMatch = valuePart.match(/^([^【]+)(.*)$/);
        if (remarksMatch) {
            return {
                name: remarksMatch[1].trim(),
                remarks: remarksMatch[2].trim()
            };
        }
        return {
            name: valuePart.trim(),
            remarks: ''
        };
    }
    return {
        name: propValue,
        remarks: ''
    };
}

/**
 * 转换SKU数据为简化格式
 */
function transformSkus(
    skus: Array<{
        properties: string;
        properties_name: string;
    }>,
    propsList: Record<string, string>,
    propsImg: Record<string, string>
): SkuGroup[] {
    // 按属性类型分组
    const skuGroupsMap: Record<string, {
        skuName: string;
        skuList: Map<string, { name: string; remarks: string; image: string }>;
    }> = {};

    for (const sku of skus) {
        // 解析 properties_name，例如: "20509:28315:尺码:M 【适合95-120斤】;1627207:405430677:颜色:灰绿色加棉"
        const propPairs = sku.properties_name.split(';');
        
        for (const propPair of propPairs) {
            // 格式: "20509:28315:尺码:M 【适合95-120斤】"
            // 或者: "1627207:405430677:颜色:灰绿色加棉"
            const parts = propPair.split(':');
            if (parts.length >= 4) {
                const propKey = `${parts[0]}:${parts[1]}`;
                const skuName = parts[2];
                // 从第4部分开始，可能包含冒号，所以需要合并
                const valuePart = parts.slice(3).join(':');
                
                // 解析值名称和备注
                // 例如: "M 【适合95-120斤】" -> name: "M", remarks: "【适合95-120斤】"
                // 例如: "灰绿色加棉" -> name: "灰绿色加棉", remarks: ""
                let name = valuePart.trim();
                let remarks = '';
                
                // 尝试提取备注（【】中的内容）
                const remarksMatch = valuePart.match(/^(.+?)(【.+?】.*)$/);
                if (remarksMatch) {
                    name = remarksMatch[1].trim();
                    remarks = remarksMatch[2].trim();
                }
                
                // 获取图片并清理URL
                const image = cleanImageUrl(propsImg[propKey] || '');
                
                // 按SKU名称分组
                if (!skuGroupsMap[skuName]) {
                    skuGroupsMap[skuName] = {
                        skuName,
                        skuList: new Map()
                    };
                }
                
                // 使用 name + remarks 作为 key，避免重复
                const key = `${name}_${remarks}`;
                if (!skuGroupsMap[skuName].skuList.has(key)) {
                    skuGroupsMap[skuName].skuList.set(key, {
                        name,
                        remarks,
                        image
                    });
                }
            }
        }
    }

    // 转换为数组格式
    return Object.values(skuGroupsMap).map(group => ({
        skuName: group.skuName,
        skuList: Array.from(group.skuList.values())
    }));
}

export const impl = async function ({
    numIid,
    key = 't3348460285',
    secret = '20221027',
    isPromotion = '1',
    lang = 'zh-CN'
}: {
    numIid: string;
    key?: string;
    secret?: string;
    isPromotion?: string;
    lang?: string;
}): Promise<{ item: SimplifiedItem }> {
    try {
        // 构建API URL
        const url = `https://api-gw.onebound.cn/taobao/item_get/?key=${key}&num_iid=${numIid}&is_promotion=${isPromotion}&lang=${lang}&secret=${secret}`;

        // 发起请求
        const response = await axios.get<TaobaoApiResponse>(url, {
            timeout: 30000
        });

        const data = response.data;

        // 检查错误
        if (data.error || data.error_code !== '0000') {
            throw new Error(data.error || `API返回错误，错误码: ${data.error_code}`);
        }

        if (!data.item) {
            throw new Error('API返回数据中没有商品信息');
        }

        const item = data.item;

        // 转换SKU数据
        const skuGroups: SkuGroup[] = [];
        if (item.skus?.sku && item.props_list) {
            skuGroups.push(...transformSkus(
                item.skus.sku,
                item.props_list,
                item.props_img || {}
            ));
        }

        // 提取商品图片列表
        const itemImgs: string[] = [];
        if (item.item_imgs) {
            itemImgs.push(...item.item_imgs.map(img => cleanImageUrl(img.url)));
        }
        
        // 从描述中提取详情图片列表
        const descImgs = extractDescImages(item.desc || '');

        // 提取商品属性
        const props: ItemProp[] = [];
        if (item.props && Array.isArray(item.props)) {
            props.push(...item.props.map(prop => ({
                name: prop.name || '',
                value: prop.value || ''
            })));
        }

        // 构建简化后的商品数据
        const simplifiedItem: SimplifiedItem = {
            numIid: item.num_iid,
            title: item.title,
            price: item.price,
            originalPrice: item.orginal_price || item.price,
            picUrl: cleanImageUrl(item.pic_url),
            detailUrl: item.detail_url,
            desc: item.desc || '',
            descImgs,
            itemImgs,
            skuGroups,
            props,
            // 保留其他字段
            brand: item.brand,
            nick: item.nick,
            num: item.num,
            totalSold: item.total_sold,
            sellerId: item.seller_id,
            shopId: item.shop_id,
            tmall: item.tmall,
            updateTime: item.update_time
        };

        return {
            item: simplifiedItem
        };
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(`获取淘宝商品详情失败: ${error.message}`);
        }
        throw error;
    }
};

