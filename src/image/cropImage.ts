import { DirectiveTree } from 'tuzirobot/types';
import { existsSync } from 'fs';
import { join, dirname, basename, extname } from 'path';
import sharp from 'sharp';
import { buffer } from 'stream/consumers';

export const config: DirectiveTree = {
    name: 'image.cropImage',
    sort: 3,
    displayName: '图片裁切',
    icon: 'icon-web-create',
    isControl: false,
    isControlEnd: false,
    comment: '裁切图片${imagePath}，从坐标(${x},${y})开始，裁切尺寸为${width}x${height}，保存到${outputPath}',
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
        },
        x: {
            name: 'x',
            value: 0,
            display: '',
            type: 'number',
            addConfig: {
                required: true,
                placeholder: '请输入裁切起始X坐标',
                label: '裁切起始X坐标',
                defaultValue: 0,
                type: 'number'
            }
        },
        y: {
            name: 'y',
            value: 0,
            display: '',
            type: 'number',
            addConfig: {
                required: true,
                placeholder: '请输入裁切起始Y坐标',
                label: '裁切起始Y坐标',
                defaultValue: 0,
                type: 'number'
            }
        },
        width: {
            name: 'width',
            value: 100,
            display: '',
            type: 'number',
            addConfig: {
                required: true,
                placeholder: '请输入裁切宽度',
                label: '裁切宽度',
                defaultValue: 100,
                type: 'number'
            }
        },
        height: {
            name: 'height',
            value: 100,
            display: '',
            type: 'number',
            addConfig: {
                required: true,
                placeholder: '请输入裁切高度',
                label: '裁切高度',
                defaultValue: 100,
                type: 'number'
            }
        },
        outputPath: {
            name: 'outputPath',
            value: '',
            display: '',
            type: 'string',
            addConfig: {
                required: false,
                placeholder: '请填写输出文件路径（可选）',
                label: '输出文件路径',
                defaultValue: '',
                type: 'filePath'
            }
        },
        quality: {
            name: 'quality',
            value: 90,
            display: '',
            type: 'number',
            addConfig: {
                required: false,
                placeholder: '请输入输出质量（1-100）',
                label: '输出质量',
                defaultValue: 90,
                type: 'number'
            }
        }
    },
    outputs: {
        success: {
            name: '',
            display: '是否成功',
            type: 'boolean',
            addConfig: {
                required: true,
                label: '操作是否成功',
                defaultValue: 'success',
                type: 'variable'
            }
        },
        message: {
            name: '',
            display: '操作结果',
            type: 'string',
            addConfig: {
                required: true,
                label: '操作结果消息',
                defaultValue: 'message',
                type: 'variable'
            }
        },
        outputPath: {
            name: '',
            display: '输出路径',
            type: 'string',
            addConfig: {
                required: true,
                label: '输出文件路径',
                defaultValue: 'outputPath',
                type: 'variable'
            }
        }
    }
};

export const impl = async function ({ 
    imagePath, 
    x, 
    y, 
    width, 
    height, 
    outputPath,
    quality = 90
}: { 
    imagePath: string; 
    x: number; 
    y: number; 
    width: number; 
    height: number; 
    outputPath?: string; 
    quality?: number;
}) {
    try {
        const fullPath = imagePath;
        
        if (!existsSync(fullPath)) {
            throw new Error('图片文件不存在');
        }

        // 确定输出路径
        const finalOutputPath = outputPath || generateOutputPath(imagePath, 'cropped');
        
        // 验证裁切参数
        if (width <= 0 || height <= 0) {
            throw new Error('裁切尺寸必须大于0');
        }

        if (x < 0 || y < 0) {
            throw new Error('裁切坐标不能为负数');
        }

        // 使用sharp进行图片裁切
        try {
            const format = extname(imagePath).toLowerCase().substring(1);
            
            // 创建sharp实例并裁切
            let sharpInstance = await sharp(fullPath,{limitInputPixels:1000000000}).toBuffer().then(buffer => sharp(buffer).extract({
                left: x,
                top: y,
                width: width,
                height: height
            }));

            // 根据格式设置输出选项
            if (format === 'jpg' || format === 'jpeg') {
                sharpInstance = sharpInstance.jpeg({ quality: quality });
            } else if (format === 'png') {
                sharpInstance = sharpInstance.png({ quality: quality });
            } else if (format === 'webp') {
                sharpInstance = sharpInstance.webp({ quality: quality / 100 });
            }

            // 保存裁切后的图片
            await sharpInstance.toFile(finalOutputPath);
            
            // 确保sharp实例被正确关闭
            await sharpInstance.destroy();
            
            return { 
                success: true, 
                message: '图片裁切成功', 
                outputPath: finalOutputPath 
            };
        } catch (sharpError) {
            // 如果sharp失败，尝试使用jimp作为备选方案
            try {
                const Jimp = require('jimp');
                const image = await Jimp.read(fullPath);
                
                // 裁切图片
                const croppedImage = image.crop(x, y, width, height);
                
                // 保存裁切后的图片
                await croppedImage.writeAsync(finalOutputPath);
                
                return { 
                    success: true, 
                    message: '图片裁切成功（使用Jimp）', 
                    outputPath: finalOutputPath 
                };
            } catch (jimpError) {
                throw new Error(`图片裁切失败: Sharp和Jimp都无法处理`);
            }
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        throw new Error(`图片裁切失败: ${errorMessage}`);
    }
}

/**
 * 生成输出文件路径
 */
function generateOutputPath(originalPath: string, suffix: string): string {
    const dir = dirname(originalPath);
    const name = basename(originalPath, extname(originalPath));
    const ext = extname(originalPath);
    return join(dir, `${name}_${suffix}${ext}`);
}
