class Hook {
    constructor(args) {
        if (!Array.isArray(args)) args = [];
        this.args = args;
        this.taps = [];
        this.call = CALL_DELEGATE;
        this.callAsync = CALL_ASYNC_DELEGATE;
        this.promise = PROMISE_DELEGATE;
        this.interceptors = [];
    }
    tap(options, fn) {
        this._tap("sync", options, fn);
    }
    tapAsync(options, fn) {
        this._tap("async", options, fn);
    }
    tapPromise(options, fn) {
        this._tap("promise", options, fn);
    }
    _tap(type, options, fn) {
        if (typeof options === 'string')
            options = { name: options };
        let tapInfo = { ...options, type, fn };
        tapInfo = this._runRegisterInterceptors(tapInfo);
        this._insert(tapInfo);
    }
    _runRegisterInterceptors(tapInfo) {
        for (const interceptor of this.interceptors) {
            if (interceptor.register) {
                let newTapInfo = interceptor.register(tapInfo);
                if (newTapInfo) {
                    tapInfo = newTapInfo;
                }
            }
        }
        return tapInfo;
    }
    intercept(interceptor) {
        this.interceptors.push(interceptor);
    }
    _resetCompilation() {
        this.call = CALL_DELEGATE;
    }
    _insert(tapInfo) {
        this._resetCompilation();
        let stage = 0;
        if (typeof tapInfo.stage === "number") {
            stage = tapInfo.stage;
        }
        let i = this.taps.length;
        while (i > 0) {
            i--;
            const x = this.taps[i];
            this.taps[i + 1] = x;
            const xStage = x.stage || 0;
            if (xStage > stage) {
                continue;
            }
            i++;
            break;
        }
        this.taps[i] = tapInfo;
    }
    compile(options) {
        throw new Error("Abstract: should be overridden");
    }
    _createCall(type) {
        return this.compile({
            taps: this.taps,
            args: this.args,
            interceptors: this.interceptors,
            type
        });
    }
}
const CALL_DELEGATE = function (...args) {
    this.call = this._createCall("sync");
    // 最终调用
    return this.call(...args);
};

const CALL_ASYNC_DELEGATE = function (...args) {
    this.callAsync = this._createCall("async");
    return this.callAsync(...args);
};

const PROMISE_DELEGATE = function (...args) {
    this.promise = this._createCall("promise");
    return this.promise(...args);
};

module.exports = Hook;