class Hook {
    constructor(args) {
        if (!Array.isArray(args)) args = [];
        this.args = args;
        this.taps = [];
        this.call = CALL_DELEGATE;
        this.callAsync = CALL_ASYNC_DELEGATE;
    }
    tap(options, fn) {
        this._tap("sync", options, fn);
    }
    tapAsync(options, fn) {
        this._tap("async", options, fn);
    }
    _tap(type, options, fn) {
        if (typeof options === 'string')
            options = { name: options };
        let tapInfo = { ...options, type, fn };
        this._insert(tapInfo);
    }
    _resetCompilation() {
        this.call = CALL_DELEGATE;
    }
    _insert(tapInfo) {
        this._resetCompilation();
        this.taps.push(tapInfo);
    }
    compile(options) {
        throw new Error("Abstract: should be overridden");
    }
    _createCall(type) {
        return this.compile({
            taps: this.taps,
            args: this.args,
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
module.exports = Hook;