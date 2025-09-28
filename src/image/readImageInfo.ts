import { DirectiveTree } from 'tuzirobot/types';
import { existsSync, statSync } from 'fs';
import { join } from 'path';
import sharp from 'sharp';

export const config: DirectiveTree = {
    name: 'image.readImageInfo',
    sort: 2,
    displayName: '读取图片信息',
    icon: 'icon-web-create',
    isControl: false,
    isControlEnd: false,
    comment: '读取图片文件${imagePath}的信息，包括尺寸、格式、文件大小等，保存到变量${imageInfo}',
    inputs: {
        imagePath: {
            name: 'imagePath',
            value: '',
            display: '',
            type: 'string',
            addConfig: {
                required: true,
                placeholder: '请填写图片文件路径',
                label: '图片文件路径',
                defaultValue: '',
                type: 'filePath',
                extensions: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'tiff', 'svg']
            }
        }
    },
    outputs: {
        imageInfo: {
            name: '',
            display: '图片信息',
            type: 'object',
            typeDetails: 
                [
                {
                    key: 'width',
                    type: 'number',
                    display: '图片宽度'
                },
                {
                    key: 'height',
                    type: 'number',
                    display: '图片高度'
                },
                {
                    key: 'format',
                    type: 'string',
                    display: '图片格式'
                },
                {
                    key: 'size',
                    type: 'number',
                    display: '图片大小'
                },
                {
                    key: 'path',
                    type: 'string',
                    display: '图片路径'
                },
                
                {
                    key: 'exists',
                    type: 'boolean',
                    display: '图片是否存在'
                },
                
                {
                    key: 'channels',
                    type: 'number',
                    display: '图片通道数'
                },
                
                {
                    key: 'depth',
                    type: 'number',
                    display: '图片深度'
                },
                
                {
                    key: 'hasProfile',
                    type: 'boolean',
                    display: '图片是否包含配置文件'
                },
                
                {
                    key: 'hasAlpha',
                    type: 'boolean',
                    display: '图片是否包含透明通道'
                },
                
                {
                    key: 'orientation',
                    type: 'number',
                    display: '图片方向'
                }
            ]
            ,
            addConfig: {
                required: true,
                label: '图片信息对象',
                defaultValue: 'imageInfo',
                type: 'variable'
            }
        }
    }
};

export const impl = async function ({ imagePath }: { imagePath: string }) {
    try {
        const fullPath = imagePath;
        const exists = existsSync(fullPath);
        
        if (!exists) {
            throw new Error('图片文件不存在');
        }

        // 使用sharp获取图片信息
        const metadata = await sharp(fullPath,{limitInputPixels:1000000000}).toBuffer().then(buffer => sharp(buffer).metadata());
        
        // 获取文件大小
        const stats = statSync(fullPath);
        const size = stats.size;

        // 获取文件扩展名作为格式
        const format = imagePath.split('.').pop()?.toLowerCase() || 'unknown';

        const imageInfo = {
            width: metadata.width || 0,
            height: metadata.height || 0,
            format: metadata.format || format,
            size: size,
            path: fullPath,
            exists: true,
            // 额外的sharp信息
            channels: metadata.channels,
            depth: metadata.density,
            hasProfile: metadata.hasProfile,
            hasAlpha: metadata.hasAlpha,
            orientation: metadata.orientation
        };

        return { imageInfo };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        throw new Error(`读取图片信息失败: ${errorMessage}`);
    }
};
