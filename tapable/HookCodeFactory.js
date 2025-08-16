class HookCodeFactory {
    setup(hookInstance, options) {
        hookInstance._x = options.taps.map(item => item.fn);
    }
    init(options) {
        this.options = options;
    }
    deinit() {
        this.options = null;
    }
    args(options = {}) {
        let { before, after } = options;
        let allArgs = this.options.args || [];
        if (before) allArgs = [before, ...allArgs];
        if (after) allArgs = [...allArgs, after];
        if (allArgs.length > 0)
            return allArgs.join(', ');
        return "";
    }
    header() {
        let code = "";
        code += "var _x = this._x;\n";
        return code;
    }
    create(options) {
        this.init(options);
        let fn;
        switch (this.options.type) {
            case 'sync':
                fn = new Function(
                    this.args(),
                    this.header() + this.content()
                )
                break;
            case 'async':
                fn = new Function(
                    this.args({ after: '_callback' }),
                    this.header() + this.content({ onDone: () => " _callback();\n" })
                )
                break;
            case 'promise':
                let tapsContent = this.content({ onDone: () => " _resolve();\n" });
                let content = `return new Promise(function (_resolve, _reject) {
                         ${tapsContent}
                     })`;
                fn = new Function(
                    this.args(),
                    this.header() + content
                )
                break;
            default:
                break;
        }
        this.deinit();
        return fn;
    }
    callTapsParallel({ onDone }) {
        let code = `var _counter = ${this.options.taps.length};\n`;
        code += `
                var _done = function () {
                    ${onDone()}
                };
            `;
        for (let j = 0; j < this.options.taps.length; j++) {
            const content = this.callTap(j);
            code += content;
        }
        return code;
    }
    callTapsSeries() {
        if (this.options.taps.length === 0) {
            return '';
        }
        let code = "";
        for (let j = 0; j < this.options.taps.length; j++) {
            const content = this.callTap(j);
            code += content;
        }
        return code;
    }
    callTap(tapIndex) {
        let code = "";
        code += `var _fn${tapIndex} = _x[${tapIndex}];\n`
        let tap = this.options.taps[tapIndex];
        switch (tap.type) {
            case 'sync':
                code += `_fn${tapIndex}(${this.args()});\n`;
                break;
            case 'async':
                code += ` 
                   _fn${tapIndex}(${this.args({
                    after: `function (_err${tapIndex}) {
                       if (--_counter === 0) _done();
                   }`})});
               `;
                break;
            case 'promise':
                code = `
                  var _fn${tapIndex} = _x[${tapIndex}];
                  var _promise${tapIndex} = _fn${tapIndex}(${this.args()});
                  _promise${tapIndex}.then(
                      function () {
                       if (--_counter === 0) _done();
                      }
                  );
              `;
            default:
                break;
        }
        return code;
    }
}
module.exports = HookCodeFactory;