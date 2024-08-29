//动态导入当前目录下所有js文件，并将其导出为一个对象
import requireDir from 'require-dir';
import fs from 'fs';
import { DirectiveTree } from 'tuzirobot/types';

const exportsModule: any = {};
type Directive = { localFile: string; name: string; impl: any; children?: Directive[] };
const directives: Directive[] = require('./directive');

function loadModule(directive: Directive) {
    if (directive.children && directive.children.length > 0) {
        directive.children.forEach((child) => {
            loadModule(child);
        });
    } else {
        const tModule = require(directive.localFile);

        const config = tModule.config;
        if (config && config.name) {
            //xxx.yyy
            const keys = config.key || config.name;
            const namespace = keys.split('.');
            let t1: any, t2: any;
            const configName = namespace.pop();
            namespace.forEach((name: string, index: number) => {
                if (index === 0) {
                    t1 = exportsModule[name] || {};
                    exportsModule[name] = t1;
                } else {
                    t1[name] = t1[name] || {};
                    t2 = t1[name];
                    t1 = t2;
                }
            });

            t1[configName] = tModule.impl;
        }
    }
}
directives.forEach((directive) => {
    loadModule(directive);
});

module.exports = exportsModule;

// const modules = requireDir('./', {
//     filter: function (fullPath: string) {
//         const stat = fs.statSync(fullPath);
//         if (stat.isDirectory()) {
//             return true;
//         }

//         return fullPath.endsWith('.js');
//     },
//     recurse: true
// });

// function loadModule(module: { [key: string]: any }) {
//     for (let key in module) {
//         if (module.hasOwnProperty(key)) {
//             const tModule = module[key];
//             const config = tModule.config;
//             if (config && config.name) {
//                 //xxx.yyy
//                 const keys = config.key || config.name;
//                 const namespace = keys.split('.');
//                 let t1: any, t2: any;
//                 const configName = namespace.pop();
//                 namespace.forEach((name: string, index: number) => {
//                     if (index === 0) {
//                         t1 = exports[name] || {};
//                         exports[name] = t1;
//                     } else {
//                         t1[name] = t1[name] || {};
//                         t2 = t1[name];
//                         t1 = t2;
//                     }
//                 });

//                 t1[configName] = tModule.impl;
//             } else {
//                 console.log(key);
//                 loadModule(tModule);
//             }
//         }
//     }
// }

// loadModule(modules);
