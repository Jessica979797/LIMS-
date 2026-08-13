/* Umi Max 项目全局类型声明 */

// CSS Modules
declare module '*.less' {
  const classes: { readonly [key: string]: string };
  export default classes;
}
declare module '*.css' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

// 静态资源
declare module '*.svg';
declare module '*.png';
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.gif';
declare module '*.webp';
