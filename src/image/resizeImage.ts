import { DirectiveTree } from 'tuzirobot/types';
import { existsSync } from 'fs';
import { join, dirname, basename, extname } from 'path';
import sharp from 'sharp';

export const config: DirectiveTree = {
    name: 'image.resizeImage',
    sort: 4,
    displayName: '图片缩放',
    icon: 'icon-web-create',
    isControl: false,
    isControlEnd: false,
    comment: '缩放图片${imagePath}，可选择按比例缩放或指定尺寸，保存到${outputPath}',
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
        width: {
            name: 'width',
            value: 0,
            display: '',
            type: 'number',
            addConfig: {
                required: false,
                placeholder: '请输入目标宽度（可选）',
                label: '目标宽度',
                defaultValue: 0,
                type: 'number'
            }
        },
        height: {
            name: 'height',
            value: 0,
            display: '',
            type: 'number',
            addConfig: {
                required: false,
                placeholder: '请输入目标高度（可选）',
                label: '目标高度',
                defaultValue: 0,
                type: 'number'
            }
        },
        scale: {
            name: 'scale',
            value: 1,
            display: '',
            type: 'number',
            addConfig: {
                required: false,
                placeholder: '请输入缩放比例（可选）',
                label: '缩放比例',
                defaultValue: 1,
                type: 'number'
            }
        },
        maintainAspectRatio: {
            name: 'maintainAspectRatio',
            value: true,
            display: '',
            type: 'boolean',
            addConfig: {
                required: false,
                placeholder: '是否保持宽高比',
                label: '保持宽高比',
                defaultValue: true,
                type: 'boolean'
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
        },
        fit: {
            name: 'fit',
            value: 'cover',
            display: '',
            type: 'string',
            addConfig: {
                required: false,
                placeholder: '请选择缩放适应方式',
                label: '缩放适应方式',
                defaultValue: 'cover',
                type: 'select',
                options: [
                    { label: '覆盖', value: 'cover' },
                    { label: '包含', value: 'contain' },
                    { label: '填充', value: 'fill' },
                    { label: '内部', value: 'inside' },
                    { label: '外部', value: 'outside' }
                ]
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
    width, 
    height, 
    scale, 
    maintainAspectRatio = true, 
    outputPath, 
    quality = 90,
    fit = 'cover'
}: { 
    imagePath: string; 
    width?: number; 
    height?: number; 
    scale?: number; 
    maintainAspectRatio?: boolean; 
    outputPath?: string; 
    quality?: number; 
    fit?: string;
}) {
    try {
        const fullPath = imagePath;
        
        if (!existsSync(fullPath)) {
            throw new Error('图片文件不存在');
        }

        // 确定输出路径
        const finalOutputPath = outputPath || generateOutputPath(imagePath, 'resized');
        
        // 验证参数
        if (!width && !height && !scale) {
            throw new Error('必须指定宽度、高度或缩放比例');
        }

        if (scale && (scale <= 0 || scale > 10)) {
            throw new Error('缩放比例必须在0-10之间');
        }

        if (width && width <= 0) {
            throw new Error('宽度必须大于0');
        }

        if (height && height <= 0) {
            throw new Error('高度必须大于0');
        }

        // 使用sharp进行图片缩放
        try {
            const format = extname(imagePath).toLowerCase().substring(1);
            
            // 创建sharp实例
            let sharpInstance = await sharp(fullPath,{limitInputPixels:1000000000}).toBuffer().then(buffer => sharp(buffer));
            
            // 计算目标尺寸
            let targetWidth = width || 0;
            let targetHeight = height || 0;
            
            if (scale) {
                // 获取原图尺寸
                const metadata = await sharpInstance.metadata();
                targetWidth = Math.round((metadata.width || 0) * scale);
                targetHeight = Math.round((metadata.height || 0) * scale);
            }
            
            // 如果只指定了宽度或高度，保持宽高比
            if (maintainAspectRatio && (targetWidth && !targetHeight) || (!targetWidth && targetHeight)) {
                const metadata = await sharpInstance.metadata();
                const originalWidth = metadata.width || 0;
                const originalHeight = metadata.height || 0;
                
                if (targetWidth && !targetHeight) {
                    targetHeight = Math.round((originalHeight * targetWidth) / originalWidth);
                } else if (targetHeight && !targetWidth) {
                    targetWidth = Math.round((originalWidth * targetHeight) / originalHeight);
                }
            }
            
            // 应用缩放
            sharpInstance = sharpInstance.resize(targetWidth, targetHeight, {
                fit: fit as any,
                kernel: 'lanczos3',
                withoutEnlargement: false
            });

            // 根据格式设置输出选项
            if (format === 'jpg' || format === 'jpeg') {
                sharpInstance = sharpInstance.jpeg({ quality: quality });
            } else if (format === 'png') {
                sharpInstance = sharpInstance.png({ quality: quality });
            } else if (format === 'webp') {
                sharpInstance = sharpInstance.webp({ quality: quality / 100 });
            }

            // 保存缩放后的图片
            await sharpInstance.toFile(finalOutputPath);
            
            return { 
                success: true, 
                message: '图片缩放成功', 
                outputPath: finalOutputPath 
            };
        } catch (sharpError) {
            // 如果sharp失败，尝试使用jimp作为备选方案
            try {
                const Jimp = require('jimp');
                const image = await Jimp.read(fullPath);
                
                let targetWidth = width || 0;
                let targetHeight = height || 0;
                
                if (scale) {
                    targetWidth = Math.round(image.getWidth() * scale);
                    targetHeight = Math.round(image.getHeight() * scale);
                }
                
                if (maintainAspectRatio) {
                    if (targetWidth && !targetHeight) {
                        targetHeight = Math.round((image.getHeight() * targetWidth) / image.getWidth());
                    } else if (targetHeight && !targetWidth) {
                        targetWidth = Math.round((image.getWidth() * targetHeight) / image.getHeight());
                    }
                }
                
                // 缩放图片
                const resizedImage = image.resize(targetWidth, targetHeight);
                
                // 保存缩放后的图片
                await resizedImage.writeAsync(finalOutputPath);
                
                return { 
                    success: true, 
                    message: '图片缩放成功（使用Jimp）', 
                    outputPath: finalOutputPath 
                };
            } catch (jimpError) {
                throw new Error(`图片缩放失败: Sharp和Jimp都无法处理`);
            }
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        throw new Error(`图片缩放失败: ${errorMessage}`);
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
