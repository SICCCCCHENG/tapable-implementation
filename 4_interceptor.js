// 所有钩子都提供额外的拦截器API
// call: (...args) => void当你的钩子触发之前, (就是call()之前), 就会触发这个函数, 你可以访问钩子的参数.多个钩子执行一次
// tap: (tap: Tap) => void 每个钩子执行之前(多个钩子执行多个), 就会触发这个函数
// register: (tap: Tap) => Tap | undefined 每添加一个Tap都会触发 你interceptor上的register, 你下一个拦截器的register 函数得到的参数 取决于你上一个register返回的值, 所以你最好返回一个 tap 钩子.
//     Context(上下文) 插件和拦截器都可以选择加入一个可选的 context对象, 这个可以被用于传递随意的值到队列中的插件和拦截器


const {SyncHook} = require('./tapable');
const syncHook = new SyncHook(["name","age"]);
syncHook.intercept({
    register:(tapInfo)=>{//当你新注册一个回调函数的时候触发
        console.log(`拦截器1开始register`);
        return tapInfo;
    },
    tap:(tapInfo)=>{//每个回调函数都会触发一次
        console.log(`拦截器1开始tap`);
    },
    call:(name,age)=>{//每个call触发，所有的回调只会总共触发一次
        console.log(`拦截器1开始call`,name,age);
    }
});
syncHook.intercept({
    register:(tapInfo)=>{//当你新注册一个回调函数的时候触发
        console.log(`拦截器2开始register`);
        return tapInfo;
    },
    tap:(tapInfo)=>{//每个回调函数都会触发一次
        console.log(`拦截器2开始tap`);
    },
    call:(name,age)=>{//每个call触发，所有的回调只会总共触发一次
        console.log(`拦截器2开始call`,name,age);
    }
});


syncHook.tap({name:'回调函数A'},(name,age)=>{
    console.log(`回调A`,name,age);
 });
 //console.log(syncHook.taps[0]);
 syncHook.tap({name:'回调函数B'},(name,age)=>{
     console.log('回调B',name,age);
 });
 debugger
 syncHook.call('zhufeng',10);
 
 /**
 拦截器1开始register
 拦截器2开始register
 拦截器1开始register
 拦截器2开始register
 
 拦截器1开始call zhufeng 10
 拦截器2开始call zhufeng 10
 
 拦截器1开始tap
 拦截器2开始tap
 回调A zhufeng 10
 
 拦截器1开始tap
 拦截器2开始tap
 回调B zhufeng 10
 */


//  (function anonymous(name, age) {
//     var _x = this._x;
//     var _taps = this.taps;
  
//     var _interceptors = this.interceptors;
//     _interceptors[0].call(name, age);
//     _interceptors[1].call(name, age);
  
//     var _tap0 = _taps[0];
//     _interceptors[0].tap(_tap0);
//     _interceptors[1].tap(_tap0);
//     var _fn0 = _x[0];
//     _fn0(name, age);
  
//     var _tap1 = _taps[1];
//     _interceptors[0].tap(_tap1);
//     _interceptors[1].tap(_tap1);
//     var _fn1 = _x[1];
//     _fn1(name, age);
//   });
  