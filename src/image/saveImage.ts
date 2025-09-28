import { DirectiveTree } from 'tuzirobot/types';
import { existsSync, mkdirSync } from 'fs';
import { join, dirname, extname } from 'path';
import sharp from 'sharp';

export const config: DirectiveTree = {
    name: 'image.saveImage',
    sort: 6,
    displayName: '保存图片',
    icon: 'icon-web-create',
    isControl: false,
    isControlEnd: false,
    comment: '保存图片${imagePath}到${outputPath}，可选择转换格式和质量',
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
        outputPath: {
            name: 'outputPath',
            value: '',
            display: '',
            type: 'string',
            addConfig: {
                required: true,
                placeholder: '请填写输出文件路径',
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
        format: {
            name: 'format',
            value: '',
            display: '',
            type: 'string',
            addConfig: {
                required: false,
                placeholder: '请选择输出格式（可选）',
                label: '输出格式',
                defaultValue: '',
                type: 'select',
                options: [
                    { label: '自动', value: '' },
                    { label: 'PNG', value: 'png' },
                    { label: 'JPEG', value: 'jpg' },
                    { label: 'WebP', value: 'webp' },
                    { label: 'TIFF', value: 'tiff' },
                    { label: 'GIF', value: 'gif' }
                ]
            }
        },
        overwrite: {
            name: 'overwrite',
            value: false,
            display: '',
            type: 'boolean',
            addConfig: {
                required: false,
                placeholder: '是否覆盖现有文件',
                label: '覆盖现有文件',
                defaultValue: false,
                type: 'boolean'
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
    outputPath, 
    quality = 90, 
    format, 
    overwrite = false 
}: { 
    imagePath: string; 
    outputPath: string; 
    quality?: number; 
    format?: string; 
    overwrite?: boolean; 
}) {
    try {
        const fullPath = imagePath;
        
        if (!existsSync(fullPath)) {
            throw new Error('图片文件不存在');
        }

        // 验证输出路径
        if (!outputPath) {
            throw new Error('必须指定输出路径');
        }

        const finalOutputPath = outputPath;
        
        // 检查是否覆盖现有文件
        if (existsSync(finalOutputPath) && !overwrite) {
            throw new Error('输出文件已存在，请设置overwrite为true或选择其他路径');
        }

        // 创建输出目录
        const outputDir = dirname(finalOutputPath);
        if (!existsSync(outputDir)) {
            mkdirSync(outputDir, { recursive: true });
        }

        // 如果指定了格式转换
        if (format) {
            const supportedFormats = ['png', 'jpg', 'jpeg', 'webp', 'tiff', 'gif'];
            const targetFormat = format.toLowerCase();
            
            if (!supportedFormats.includes(targetFormat)) {
                throw new Error(`不支持的输出格式: ${targetFormat}。支持的格式: ${supportedFormats.join(', ')}`);
            }

            // 使用sharp进行格式转换和保存
            try {
                // 创建sharp实例
                let sharpInstance = await sharp(fullPath,{limitInputPixels:1000000000}).toBuffer().then(buffer => sharp(buffer));
                
                // 根据输出格式设置保存选项
                switch (targetFormat) {
                    case 'jpg':
                    case 'jpeg':
                        sharpInstance = sharpInstance.jpeg({ 
                            quality: quality,
                            progressive: true,
                            mozjpeg: true
                        });
                        break;
                    case 'png':
                        sharpInstance = sharpInstance.png({ 
                            quality: quality,
                            adaptiveFiltering: true
                        });
                        break;
                    case 'webp':
                        sharpInstance = sharpInstance.webp({ 
                            quality: quality / 100,
                            effort: 6
                        });
                        break;
                    case 'tiff':
                        sharpInstance = sharpInstance.tiff({ 
                            quality: quality,
                            compression: 'lzw'
                        });
                        break;
                    case 'gif':
                        sharpInstance = sharpInstance.gif();
                        break;
                }
                
                // 保存转换后的图片
                await sharpInstance.toFile(finalOutputPath);
                
                // 确保sharp实例被正确关闭
                await sharpInstance.destroy();
                
                return { 
                    success: true, 
                    message: `图片保存成功，格式: ${targetFormat}`, 
                    outputPath: finalOutputPath 
                };
            } catch (sharpError) {
                // 如果sharp失败，尝试使用jimp作为备选方案
                try {
                    const Jimp = require('jimp');
                    const image = await Jimp.read(fullPath);
                    
                    // 根据格式保存
                    switch (targetFormat) {
                        case 'jpg':
                        case 'jpeg':
                            await image.quality(quality).writeAsync(finalOutputPath);
                            break;
                        case 'png':
                            await image.writeAsync(finalOutputPath);
                            break;
                        default:
                            // Jimp不支持所有格式，使用PNG作为备选
                            await image.writeAsync(finalOutputPath.replace(/\.[^/.]+$/, '.png'));
                            break;
                    }
                    
                    return { 
                        success: true, 
                        message: `图片保存成功（使用Jimp），格式: ${targetFormat}`, 
                        outputPath: finalOutputPath 
                    };
                } catch (jimpError) {
                    throw new Error(`图片保存失败: Sharp和Jimp都无法处理`);
                }
            }
        } else {
            // 直接保存，不转换格式
            try {
                const sharpInstance = await sharp(fullPath,{limitInputPixels:1000000000}).toBuffer().then(buffer => sharp(buffer));
                await sharpInstance.toFile(finalOutputPath);
                
                // 确保sharp实例被正确关闭
                await sharpInstance.destroy();
                
                return { 
                    success: true, 
                    message: '图片保存成功', 
                    outputPath: finalOutputPath 
                };
            } catch (sharpError) {
                // 如果sharp失败，使用jimp作为备选方案
                try {
                    const Jimp = require('jimp');
                    const image = await Jimp.read(fullPath);
                    await image.writeAsync(finalOutputPath);
                    
                    return { 
                        success: true, 
                        message: '图片保存成功（使用Jimp）', 
                        outputPath: finalOutputPath 
                    };
                } catch (jimpError) {
                    throw new Error(`图片保存失败: Sharp和Jimp都无法处理`);
                }
            }
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        throw new Error(`图片保存失败: ${errorMessage}`);
    }
};
