"use strict";
"use strict";
Error.stackTraceLimit = 50;
var $;
(function ($) {
})($ || ($ = {}));
module.exports = $;

;
"use strict"

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
	var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
	if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
	else for (var i = decorators.length - 1; i >= 0; i--) if ((d = decorators[i])) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
	return c > 3 && r && Object.defineProperty(target, key, r), r;
};

var $ = ( typeof module === 'object' ) ? ( module['export'+'s'] = globalThis ) : globalThis
$.$$ = $

;
"use strict";
var $;
(function ($) {
})($ || ($ = {}));

;
"use strict";

;
"use strict";
var $;
(function ($) {
    const mod = require /****/('module');
    const internals = mod.builtinModules;
    function $node_internal_check(name) {
        if (name.startsWith('node:'))
            return true;
        return internals.includes(name);
    }
    $.$node_internal_check = $node_internal_check;
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    function $mol_promise_like(val) {
        try {
            return val && typeof val === 'object' && 'then' in val && typeof val.then === 'function';
        }
        catch {
            return false;
        }
    }
    $.$mol_promise_like = $mol_promise_like;
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    function $mol_fail(error) {
        throw error;
    }
    $.$mol_fail = $mol_fail;
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    function $mol_fail_hidden(error) {
        throw error; /// Use 'Never Pause Here' breakpoint in DevTools or simply blackbox this script
    }
    $.$mol_fail_hidden = $mol_fail_hidden;
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    const catched = new WeakSet();
    function $mol_fail_catch(error) {
        if (typeof error !== 'object')
            return false;
        if ($mol_promise_like(error))
            $mol_fail_hidden(error);
        if (catched.has(error))
            return false;
        catched.add(error);
        return true;
    }
    $.$mol_fail_catch = $mol_fail_catch;
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    function $mol_try(handler) {
        try {
            return handler();
        }
        catch (error) {
            console.error(error);
            return error;
        }
    }
    $.$mol_try = $mol_try;
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    function $mol_fail_log(error) {
        if ($mol_promise_like(error))
            return false;
        if (!$mol_fail_catch(error))
            return false;
        $mol_try(() => { $mol_fail_hidden(error); });
        return true;
    }
    $.$mol_fail_log = $mol_fail_log;
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    const path = require /****/('path');
    const mod = require /****/('module');
    const localRequire = mod.createRequire(path.join(process.cwd(), 'package.json'));
    function $node_autoinstall(name) {
        try {
            localRequire.resolve(name);
        }
        catch {
            this.$mol_run.spawn({ command: ['npm', 'install', '--omit=dev', name], dir: '.' });
            try {
                this.$mol_run.spawn({ command: ['npm', 'install', '--omit=dev', '@types/' + name], dir: '.' });
            }
            catch (e) {
                if (this.$mol_promise_like(e))
                    this.$mol_fail_hidden(e);
                this.$mol_fail_log(e);
            }
        }
    }
    $.$node_autoinstall = $node_autoinstall;
})($ || ($ = {}));

;
"use strict";
var $node = new Proxy({ require }, {
    get(target, name, wrapper) {
        if (target[name])
            return target[name];
        if ($.$node_internal_check(name))
            return target.require(name);
        if (name[0] === '.')
            return target.require(name);
        $.$node_autoinstall(name);
        return target.require(name);
    },
    set(target, name, value) {
        target[name] = value;
        return true;
    },
});
require = (req => Object.assign(function require(name) {
    return $node[name];
}, req))(require);

;
"use strict";
var $;
(function ($) {
    const named = new WeakSet();
    function $mol_func_name(func) {
        let name = func.name;
        if (name?.length > 1)
            return name;
        if (named.has(func))
            return name;
        for (let key in this) {
            try {
                if (this[key] !== func)
                    continue;
                name = key;
                Object.defineProperty(func, 'name', { value: name });
                break;
            }
            catch { }
        }
        named.add(func);
        return name;
    }
    $.$mol_func_name = $mol_func_name;
    function $mol_func_name_from(target, source) {
        Object.defineProperty(target, 'name', { value: source.name });
        return target;
    }
    $.$mol_func_name_from = $mol_func_name_from;
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    function cause_serialize(cause) {
        return JSON.stringify(cause, null, '  ')
            .replace(/\(/, '<')
            .replace(/\)/, ' >');
    }
    function frame_normalize(frame) {
        return (typeof frame === 'string' ? frame : cause_serialize(frame))
            .trim()
            .replace(/at /gm, '   at ')
            .replace(/^(?!    +at )(.*)/gm, '    at | $1 (#)');
    }
    class $mol_error_mix extends AggregateError {
        cause;
        name = $$.$mol_func_name(this.constructor).replace(/^\$/, '') + '_Error';
        constructor(message, cause = {}, ...errors) {
            super(errors, message, { cause });
            this.cause = cause;
            const desc = Object.getOwnPropertyDescriptor(this, 'stack');
            const stack_get = () => desc?.get?.() ?? super.stack ?? desc?.value ?? this.message;
            Object.defineProperty(this, 'stack', {
                get: () => stack_get() + '\n' + [
                    this.cause ?? 'no cause',
                    ...this.errors.flatMap(e => [
                        String(e.stack),
                        ...e instanceof $mol_error_mix || !e.cause ? [] : [e.cause]
                    ])
                ].map(frame_normalize).join('\n')
            });
            // в nodejs, что б не дублировалось cause в консоли
            Object.defineProperty(this, 'cause', {
                get: () => cause
            });
        }
        static [Symbol.toPrimitive]() {
            return this.toString();
        }
        static toString() {
            return $$.$mol_func_name(this);
        }
        static make(...params) {
            return new this(...params);
        }
    }
    $.$mol_error_mix = $mol_error_mix;
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    $.$mol_ambient_ref = Symbol('$mol_ambient_ref');
    function $mol_ambient(overrides) {
        return Object.setPrototypeOf(overrides, this || $);
    }
    $.$mol_ambient = $mol_ambient;
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    const instances = new WeakSet();
    /**
     * Proxy that delegates all to lazy returned target.
     *
     * 	$mol_delegate( Array.prototype , ()=> fetch_array() )
     */
    function $mol_delegate(proto, target) {
        const proxy = new Proxy(proto, {
            get: (_, field) => {
                const obj = target();
                let val = Reflect.get(obj, field);
                if (typeof val === 'function') {
                    val = val.bind(obj);
                }
                return val;
            },
            has: (_, field) => Reflect.has(target(), field),
            set: (_, field, value) => Reflect.set(target(), field, value),
            getOwnPropertyDescriptor: (_, field) => Reflect.getOwnPropertyDescriptor(target(), field),
            ownKeys: () => Reflect.ownKeys(target()),
            getPrototypeOf: () => Reflect.getPrototypeOf(target()),
            setPrototypeOf: (_, donor) => Reflect.setPrototypeOf(target(), donor),
            isExtensible: () => Reflect.isExtensible(target()),
            preventExtensions: () => Reflect.preventExtensions(target()),
            apply: (_, self, args) => Reflect.apply(target(), self, args),
            construct: (_, args, retarget) => Reflect.construct(target(), args, retarget),
            defineProperty: (_, field, descr) => Reflect.defineProperty(target(), field, descr),
            deleteProperty: (_, field) => Reflect.deleteProperty(target(), field),
        });
        instances.add(proxy);
        return proxy;
    }
    $.$mol_delegate = $mol_delegate;
    Reflect.defineProperty($mol_delegate, Symbol.hasInstance, {
        value: (obj) => instances.has(obj),
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    $.$mol_owning_map = new WeakMap();
    function $mol_owning_allow(having) {
        try {
            if (!having)
                return false;
            if (typeof having !== 'object' && typeof having !== 'function')
                return false;
            if (having instanceof $mol_delegate)
                return false;
            if (typeof having['destructor'] !== 'function')
                return false;
            return true;
        }
        catch {
            return false;
        }
    }
    $.$mol_owning_allow = $mol_owning_allow;
    function $mol_owning_get(having, Owner) {
        if (!$mol_owning_allow(having))
            return null;
        while (true) {
            const owner = $.$mol_owning_map.get(having);
            if (!owner)
                return owner;
            if (!Owner)
                return owner;
            if (owner instanceof Owner)
                return owner;
            having = owner;
        }
    }
    $.$mol_owning_get = $mol_owning_get;
    function $mol_owning_check(owner, having) {
        if (!$mol_owning_allow(having))
            return false;
        if ($.$mol_owning_map.get(having) !== owner)
            return false;
        return true;
    }
    $.$mol_owning_check = $mol_owning_check;
    function $mol_owning_catch(owner, having) {
        if (!$mol_owning_allow(having))
            return false;
        if ($.$mol_owning_map.get(having))
            return false;
        $.$mol_owning_map.set(having, owner);
        return true;
    }
    $.$mol_owning_catch = $mol_owning_catch;
})($ || ($ = {}));

;
"use strict";

;
"use strict";
var $;
(function ($) {
    $.$mol_key_handle = Symbol.for('$mol_key_handle');
    $.$mol_key_store = new WeakMap();
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    if (!Symbol.dispose)
        Symbol.dispose = Symbol('Symbol.dispose');
    class $mol_object2 {
        static $ = $;
        [Symbol.toStringTag];
        [$mol_ambient_ref] = null;
        get $() {
            if (this[$mol_ambient_ref])
                return this[$mol_ambient_ref];
            const owner = $mol_owning_get(this);
            return this[$mol_ambient_ref] = owner?.$ || this.constructor.$ || $mol_object2.$;
        }
        set $(next) {
            if (this[$mol_ambient_ref])
                $mol_fail_hidden(new Error('Context already defined'));
            this[$mol_ambient_ref] = next;
        }
        static create(init) {
            const obj = new this;
            if (init)
                init(obj);
            return obj;
        }
        static [Symbol.toPrimitive]() {
            return this.toString();
        }
        static toString() {
            return this[Symbol.toStringTag] || this.$.$mol_func_name(this);
        }
        static toJSON() {
            return this.toString();
        }
        static [$mol_key_handle]() {
            return this.toString();
        }
        destructor() { }
        static destructor() { }
        [Symbol.dispose]() {
            this.destructor();
        }
        //[ Symbol.toPrimitive ]( hint: string ) {
        //	return hint === 'number' ? this.valueOf() : this.toString()
        //}
        toString() {
            return this[Symbol.toStringTag] || this.constructor.name + '<>';
        }
    }
    $.$mol_object2 = $mol_object2;
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    let $$;
    (function ($$) {
        let $;
    })($$ = $_1.$$ || ($_1.$$ = {}));
    $_1.$mol_object_field = Symbol('$mol_object_field');
    class $mol_object extends $mol_object2 {
        static make(config) {
            return super.create(obj => {
                for (let key in config)
                    obj[key] = config[key];
            });
        }
    }
    $_1.$mol_object = $mol_object;
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    function $mol_env() {
        return {};
    }
    $.$mol_env = $mol_env;
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    $.$mol_env = function $mol_env() {
        return this.process.env;
    };
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    /** Generates unique identifier. */
    function $mol_guid(length = 8, exists = () => false) {
        for (;;) {
            let id = Math.random().toString(36).substring(2, length + 2).toUpperCase();
            if (exists(id))
                continue;
            return id;
        }
    }
    $.$mol_guid = $mol_guid;
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    /** Special status statuses. */
    let $mol_wire_cursor;
    (function ($mol_wire_cursor) {
        /** Update required. */
        $mol_wire_cursor[$mol_wire_cursor["stale"] = -1] = "stale";
        /** Some of (transitive) pub update required. */
        $mol_wire_cursor[$mol_wire_cursor["doubt"] = -2] = "doubt";
        /** Actual state but may be dropped. */
        $mol_wire_cursor[$mol_wire_cursor["fresh"] = -3] = "fresh";
        /** State will never be changed. */
        $mol_wire_cursor[$mol_wire_cursor["final"] = -4] = "final";
    })($mol_wire_cursor = $.$mol_wire_cursor || ($.$mol_wire_cursor = {}));
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    /**
     * Collects subscribers in compact array. 28B
     */
    class $mol_wire_pub extends Object {
        constructor(id = `$mol_wire_pub:${$mol_guid()}`) {
            super();
            this[Symbol.toStringTag] = id;
        }
        [Symbol.toStringTag];
        data = [];
        // Derived objects should be Arrays.
        static get [Symbol.species]() {
            return Array;
        }
        /**
         * Index of first subscriber.
         */
        sub_from = 0; // 4B
        /**
         * All current subscribers.
         */
        get sub_list() {
            const res = [];
            for (let i = this.sub_from; i < this.data.length; i += 2) {
                res.push(this.data[i]);
            }
            return res;
        }
        /**
         * Has any subscribers or not.
         */
        get sub_empty() {
            return this.sub_from === this.data.length;
        }
        /**
         * Subscribe subscriber to this publisher events and return position of subscriber that required to unsubscribe.
         */
        sub_on(sub, pub_pos) {
            const pos = this.data.length;
            this.data.push(sub, pub_pos);
            return pos;
        }
        /**
         * Unsubscribe subscriber from this publisher events by subscriber position provided by `on(pub)`.
         */
        sub_off(sub_pos) {
            if (!(sub_pos < this.data.length)) {
                $mol_fail(new Error(`Wrong pos ${sub_pos}`));
            }
            const end = this.data.length - 2;
            if (sub_pos !== end) {
                this.peer_move(end, sub_pos);
            }
            this.data.length = end;
            if (end === this.sub_from)
                this.reap();
        }
        /**
         * Called when last sub was unsubscribed.
         **/
        reap() { }
        /**
         * Autowire this publisher with current subscriber.
         **/
        promote() {
            $mol_wire_auto()?.track_next(this);
        }
        /**
         * Enforce actualization. Should not throw errors.
         */
        fresh() { }
        /**
         * Allow to put data to caches in the subtree.
         */
        complete() { }
        get incompleted() {
            return false;
        }
        /**
         * Notify subscribers about self changes.
         */
        emit(quant = $mol_wire_cursor.stale) {
            for (let i = this.sub_from; i < this.data.length; i += 2) {
                ;
                this.data[i].absorb(quant, this.data[i + 1]);
            }
        }
        /**
         * Moves peer from one position to another. Doesn't clear data at old position!
         */
        peer_move(from_pos, to_pos) {
            const peer = this.data[from_pos];
            const self_pos = this.data[from_pos + 1];
            this.data[to_pos] = peer;
            this.data[to_pos + 1] = self_pos;
            peer.peer_repos(self_pos, to_pos);
        }
        /**
         * Updates self position in the peer.
         */
        peer_repos(peer_pos, self_pos) {
            this.data[peer_pos + 1] = self_pos;
        }
    }
    $.$mol_wire_pub = $mol_wire_pub;
})($ || ($ = {}));

;
"use strict";

;
"use strict";
var $;
(function ($) {
    $.$mol_wire_auto_sub = null;
    /**
     * When fulfilled, all publishers are promoted to this subscriber on access to its.
     */
    function $mol_wire_auto(next = $.$mol_wire_auto_sub) {
        return $.$mol_wire_auto_sub = next;
    }
    $.$mol_wire_auto = $mol_wire_auto;
    /**
     * Affection queue. Used to prevent accidental stack overflow on emit.
     */
    $.$mol_wire_affected = [];
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    // https://docs.google.com/document/d/1FTascZXT9cxfetuPRT2eXPQKXui4nWFivUnS_335T3U/preview#
    $['devtoolsFormatters'] ||= [];
    function $mol_dev_format_register(config) {
        $['devtoolsFormatters'].push(config);
    }
    $.$mol_dev_format_register = $mol_dev_format_register;
    $.$mol_dev_format_head = Symbol('$mol_dev_format_head');
    $.$mol_dev_format_body = Symbol('$mol_dev_format_body');
    function $mol_dev_format_button(label, click) {
        return $mol_dev_format_auto({
            [$.$mol_dev_format_head]() {
                return $.$mol_dev_format_span({ color: 'cornflowerblue' }, label);
            },
            [$.$mol_dev_format_body]() {
                Promise.resolve().then(click);
                return $.$mol_dev_format_span({});
            }
        });
    }
    $mol_dev_format_register({
        header: (val, config = false) => {
            if (config)
                return null;
            if (!val)
                return null;
            if ($.$mol_dev_format_head in val) {
                try {
                    return val[$.$mol_dev_format_head]();
                }
                catch (error) {
                    return $.$mol_dev_format_accent($mol_dev_format_native(val), '💨', $mol_dev_format_native(error), '');
                }
            }
            if (typeof val === 'function') {
                return $mol_dev_format_native(val);
            }
            if (val instanceof Error) {
                return $.$mol_dev_format_span({}, $mol_dev_format_native(val), ' ', $mol_dev_format_button('throw', () => $mol_fail_hidden(val)));
            }
            if (val instanceof Promise) {
                return $.$mol_dev_format_shade($mol_dev_format_native(val), ' ', val[Symbol.toStringTag] ?? '');
            }
            if (Symbol.toStringTag in val) {
                return $mol_dev_format_native(val);
            }
            return null;
        },
        hasBody: (val, config = false) => {
            if (config)
                return false;
            if (!val)
                return false;
            // if( Error.isError( val ) ) true
            if (val[$.$mol_dev_format_body])
                return true;
            return false;
        },
        body: (val, config = false) => {
            if (config)
                return null;
            if (!val)
                return null;
            if ($.$mol_dev_format_body in val) {
                try {
                    return val[$.$mol_dev_format_body]();
                }
                catch (error) {
                    return $.$mol_dev_format_accent($mol_dev_format_native(val), '💨', $mol_dev_format_native(error), '');
                }
            }
            // if( Error.isError( val ) ) {
            // 	return $mol_dev_format_native( val )
            // }
            return null;
        },
    });
    function $mol_dev_format_native(obj) {
        if (typeof obj === 'undefined')
            return $.$mol_dev_format_shade('undefined');
        // if( ![ 'object', 'function', 'symbol' ].includes( typeof obj )  ) return obj
        return [
            'object',
            {
                object: obj,
                config: true,
            },
        ];
    }
    $.$mol_dev_format_native = $mol_dev_format_native;
    function $mol_dev_format_auto(obj) {
        if (obj == null)
            return $.$mol_dev_format_shade(String(obj));
        return [
            'object',
            {
                object: obj,
                config: false,
            },
        ];
    }
    $.$mol_dev_format_auto = $mol_dev_format_auto;
    function $mol_dev_format_element(element, style, ...content) {
        const styles = [];
        for (let key in style)
            styles.push(`${key} : ${style[key]}`);
        return [
            element,
            {
                style: styles.join(' ; '),
            },
            ...content,
        ];
    }
    $.$mol_dev_format_element = $mol_dev_format_element;
    $.$mol_dev_format_span = $mol_dev_format_element.bind(null, 'span');
    $.$mol_dev_format_div = $mol_dev_format_element.bind(null, 'div');
    $.$mol_dev_format_ol = $mol_dev_format_element.bind(null, 'ol');
    $.$mol_dev_format_li = $mol_dev_format_element.bind(null, 'li');
    $.$mol_dev_format_table = $mol_dev_format_element.bind(null, 'table');
    $.$mol_dev_format_tr = $mol_dev_format_element.bind(null, 'tr');
    $.$mol_dev_format_td = $mol_dev_format_element.bind(null, 'td');
    $.$mol_dev_format_accent = $.$mol_dev_format_span.bind(null, {
        'color': 'magenta',
    });
    $.$mol_dev_format_strong = $.$mol_dev_format_span.bind(null, {
        'font-weight': 'bold',
    });
    $.$mol_dev_format_string = $.$mol_dev_format_span.bind(null, {
        'color': 'green',
    });
    $.$mol_dev_format_shade = $.$mol_dev_format_span.bind(null, {
        'color': 'gray',
    });
    $.$mol_dev_format_indent = $.$mol_dev_format_div.bind(null, {
        'margin-inline-start': '13px'
    });
    class Stack extends Array {
        // [ Symbol.toPrimitive ]() {
        // 	return this.toString()
        // }
        match(...args) {
            return this.toString().match(...args);
        }
        split(...args) {
            return this.toString().split(...args);
        }
        toString() {
            return this.join('\n');
        }
    }
    class Call extends Object {
        type;
        function;
        method;
        eval;
        source;
        offset;
        pos;
        object;
        flags;
        [Symbol.toStringTag];
        constructor(call) {
            super();
            this.type = call.getTypeName() ?? '';
            this.function = call.getFunctionName() ?? '';
            this.method = call.getMethodName() ?? '';
            if (this.method === this.function)
                this.method = '';
            // const func = c.getFunction()
            this.pos = [call.getEnclosingLineNumber() ?? 0, call.getEnclosingColumnNumber() ?? 0];
            this.eval = call.getEvalOrigin() ?? '';
            this.source = call.getScriptNameOrSourceURL() ?? '';
            this.object = call.getThis();
            this.offset = call.getPosition();
            const flags = [];
            if (call.isAsync())
                flags.push('async');
            if (call.isConstructor())
                flags.push('constructor');
            if (call.isEval())
                flags.push('eval');
            if (call.isNative())
                flags.push('native');
            if (call.isPromiseAll())
                flags.push('PromiseAll');
            if (call.isToplevel())
                flags.push('top');
            this.flags = flags;
            const type = this.type ? this.type + '.' : '';
            const func = this.function || '<anon>';
            const method = this.method ? ' [' + this.method + '] ' : '';
            this[Symbol.toStringTag] = `${type}${func}${method}`;
        }
        [Symbol.toPrimitive]() {
            return this.toString();
        }
        toString() {
            const object = this.object || '';
            const label = this[Symbol.toStringTag];
            const source = `${this.source}:${this.pos.join(':')} #${this.offset}`;
            return `\tat ${object}${label} (${source})`;
        }
        [$.$mol_dev_format_head]() {
            return $.$mol_dev_format_div({}, $mol_dev_format_native(this), $.$mol_dev_format_shade(' '), ...this.object ? [
                $mol_dev_format_native(this.object),
            ] : [], ...this.method ? [$.$mol_dev_format_shade(' ', ' [', this.method, ']')] : [], $.$mol_dev_format_shade(' ', this.flags.join(', ')));
        }
    }
    Error.prepareStackTrace ??= (error, stack) => new Stack(...stack.map(call => new Call(call)));
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    /**
     * Publisher that can auto collect other publishers. 32B
     *
     * 	P1 P2 P3 P4 S1 S2 S3
     * 	^           ^
     * 	pubs_from   subs_from
     */
    class $mol_wire_pub_sub extends $mol_wire_pub {
        pub_from = 0; // 4B
        cursor = $mol_wire_cursor.stale; // 4B
        get temp() {
            return false;
        }
        get pub_list() {
            const res = [];
            const max = this.cursor >= 0 ? this.cursor : this.sub_from;
            for (let i = this.pub_from; i < max; i += 2) {
                if (this.data[i])
                    res.push(this.data[i]);
            }
            return res;
        }
        track_on() {
            this.cursor = this.pub_from;
            const sub = $mol_wire_auto();
            $mol_wire_auto(this);
            return sub;
        }
        promote() {
            if (this.cursor >= this.pub_from) {
                $mol_fail(new Error('Circular subscription'));
            }
            super.promote();
        }
        track_next(pub) {
            if (this.cursor < 0)
                $mol_fail(new Error('Promo to non begun sub'));
            if (this.cursor < this.sub_from) {
                const next = this.data[this.cursor];
                if (pub === undefined)
                    return next ?? null;
                if (next === pub) {
                    this.cursor += 2;
                    return next;
                }
                if (next) {
                    if (this.sub_from < this.data.length) {
                        this.peer_move(this.sub_from, this.data.length);
                    }
                    this.peer_move(this.cursor, this.sub_from);
                    this.sub_from += 2;
                }
            }
            else {
                if (pub === undefined)
                    return null;
                if (this.sub_from < this.data.length) {
                    this.peer_move(this.sub_from, this.data.length);
                }
                this.sub_from += 2;
            }
            this.data[this.cursor] = pub;
            this.data[this.cursor + 1] = pub.sub_on(this, this.cursor);
            this.cursor += 2;
            return pub;
        }
        track_off(sub) {
            $mol_wire_auto(sub);
            if (this.cursor < 0) {
                $mol_fail(new Error('End of non begun sub'));
            }
            for (let cursor = this.pub_from; cursor < this.cursor; cursor += 2) {
                const pub = this.data[cursor];
                pub.fresh();
            }
            this.cursor = $mol_wire_cursor.fresh;
        }
        pub_off(sub_pos) {
            this.data[sub_pos] = undefined;
            this.data[sub_pos + 1] = undefined;
        }
        destructor() {
            for (let cursor = this.data.length - 2; cursor >= this.sub_from; cursor -= 2) {
                const sub = this.data[cursor];
                const pos = this.data[cursor + 1];
                sub.pub_off(pos);
            }
            this.data.length = this.sub_from;
            this.cursor = this.pub_from;
            this.track_cut();
            this.cursor = $mol_wire_cursor.stale;
        }
        track_cut() {
            if (this.cursor < this.pub_from) {
                $mol_fail(new Error('Cut of non begun sub'));
            }
            let end = this.data.length;
            for (let cursor = this.cursor; cursor < this.sub_from; cursor += 2) {
                const pub = this.data[cursor];
                pub?.sub_off(this.data[cursor + 1]);
                end -= 2;
                if (this.sub_from <= end)
                    this.peer_move(end, cursor);
            }
            this.data.length = end;
            this.sub_from = this.cursor;
        }
        complete() { }
        complete_pubs() {
            const limit = this.cursor < 0 ? this.sub_from : this.cursor;
            for (let cursor = this.pub_from; cursor < limit; cursor += 2) {
                const pub = this.data[cursor];
                if (pub?.incompleted)
                    return;
            }
            for (let cursor = this.pub_from; cursor < limit; cursor += 2) {
                const pub = this.data[cursor];
                pub?.complete();
            }
        }
        absorb(quant = $mol_wire_cursor.stale, pos = -1) {
            if (this.cursor === $mol_wire_cursor.final)
                return;
            if (this.cursor >= quant)
                return;
            this.cursor = quant;
            this.emit($mol_wire_cursor.doubt);
            // if( pos >= 0 && pos < this.sub_from - 2 ) {
            // 	const pub = this.data[ pos ] as $mol_wire_pub
            // 	if( pub instanceof $mol_wire_task ) return
            // 	for(
            // 		let cursor = this.pub_from;
            // 		cursor < this.sub_from;
            // 		cursor += 2
            // 	) {
            // 		const pub = this.data[ cursor ] as $mol_wire_pub
            // 		if( pub instanceof $mol_wire_task ) {
            // 			pub.destructor()
            // 		}
            // 	}
            // }
        }
        [$mol_dev_format_head]() {
            return $mol_dev_format_native(this);
        }
        /**
         * Is subscribed to any publisher or not.
         */
        get pub_empty() {
            return this.sub_from === this.pub_from;
        }
    }
    $.$mol_wire_pub_sub = $mol_wire_pub_sub;
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    class $mol_after_tick extends $mol_object2 {
        task;
        static promise = null;
        cancelled = false;
        constructor(task) {
            super();
            this.task = task;
            if (!$mol_after_tick.promise)
                $mol_after_tick.promise = Promise.resolve().then(() => {
                    $mol_after_tick.promise = null;
                });
            $mol_after_tick.promise.then(() => {
                if (this.cancelled)
                    return;
                task();
            });
        }
        destructor() {
            this.cancelled = true;
        }
    }
    $.$mol_after_tick = $mol_after_tick;
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    const wrappers = new WeakMap();
    /**
     * Suspendable task with support both sync/async api.
     *
     * 	A1 A2 A3 A4 P1 P2 P3 P4 S1 S2 S3
     * 	^           ^           ^
     * 	args_from   pubs_from   subs_from
     **/
    class $mol_wire_fiber extends $mol_wire_pub_sub {
        task;
        host;
        static warm = true;
        static planning = new Set();
        static reaping = new Set();
        static plan_task = null;
        static plan() {
            if (this.plan_task)
                return;
            this.plan_task = new $mol_after_tick(() => {
                try {
                    this.sync();
                }
                finally {
                    $mol_wire_fiber.plan_task = null;
                }
            });
        }
        static sync() {
            // Sync whole fiber graph
            while (this.planning.size) {
                for (const fiber of this.planning) {
                    this.planning.delete(fiber);
                    if (fiber.cursor >= 0)
                        continue;
                    if (fiber.cursor === $mol_wire_cursor.final)
                        continue;
                    fiber.fresh();
                }
            }
            // Collect garbage
            while (this.reaping.size) {
                const fibers = this.reaping;
                this.reaping = new Set;
                for (const fiber of fibers) {
                    if (!fiber.sub_empty)
                        continue;
                    fiber.destructor();
                }
            }
        }
        cache = undefined;
        get args() {
            return this.data.slice(0, this.pub_from);
        }
        result() {
            if ($mol_promise_like(this.cache))
                return;
            if (this.cache instanceof Error)
                return;
            return this.cache;
        }
        get incompleted() {
            return $mol_promise_like(this.cache);
        }
        field() {
            return this.task.name + '()';
        }
        constructor(id, task, host, args) {
            super(id);
            this.task = task;
            this.host = host;
            if (args)
                this.data.push(...args);
            this.pub_from = this.sub_from = args?.length ?? 0;
        }
        plan() {
            $mol_wire_fiber.planning.add(this);
            $mol_wire_fiber.plan();
            return this;
        }
        reap() {
            $mol_wire_fiber.reaping.add(this);
            $mol_wire_fiber.plan();
        }
        toString() {
            return this[Symbol.toStringTag];
        }
        toJSON() {
            return this[Symbol.toStringTag];
        }
        [$mol_dev_format_head]() {
            const cursor = {
                [$mol_wire_cursor.stale]: '🔴',
                [$mol_wire_cursor.doubt]: '🟡',
                [$mol_wire_cursor.fresh]: '🟢',
                [$mol_wire_cursor.final]: '🔵',
            }[this.cursor] ?? this.cursor.toString();
            return $mol_dev_format_div({}, $mol_owning_check(this, this.cache)
                ? $mol_dev_format_shade(cursor)
                : $mol_dev_format_shade(this[Symbol.toStringTag], cursor), $mol_dev_format_auto(this.cache));
        }
        [$mol_dev_format_body]() { return null; }
        get $() {
            return (this.host ?? this.task)['$'];
        }
        emit(quant = $mol_wire_cursor.stale) {
            if (this.sub_empty)
                this.plan();
            else
                super.emit(quant);
        }
        fresh() {
            if (this.cursor === $mol_wire_cursor.fresh)
                return;
            if (this.cursor === $mol_wire_cursor.final)
                return;
            check: if (this.cursor === $mol_wire_cursor.doubt) {
                for (let i = this.pub_from; i < this.sub_from; i += 2) {
                    ;
                    this.data[i]?.fresh();
                    if (this.cursor !== $mol_wire_cursor.doubt)
                        break check;
                }
                this.cursor = $mol_wire_cursor.fresh;
                return;
            }
            const bu = this.track_on();
            let result;
            try {
                switch (this.pub_from) {
                    case 0:
                        result = this.task.call(this.host);
                        break;
                    case 1:
                        result = this.task.call(this.host, this.data[0]);
                        break;
                    default:
                        result = this.task.call(this.host, ...this.args);
                        break;
                }
                if ($mol_promise_like(result)) {
                    if (wrappers.has(result)) {
                        result = wrappers.get(result).then(a => a);
                    }
                    else {
                        const put = (res) => {
                            if (this.cache === result)
                                this.put(res);
                            return res;
                        };
                        wrappers.set(result, result = Object.assign(result.then(put, put), { destructor: result.destructor || (() => { }) }));
                        wrappers.set(result, result);
                        const error = new Error(`Promise in ${this}`);
                        Object.defineProperty(result, 'stack', { get: () => error.stack });
                    }
                }
            }
            catch (error) {
                if (error instanceof Error || $mol_promise_like(error)) {
                    result = error;
                }
                else {
                    result = new Error(String(error), { cause: error });
                }
                if ($mol_promise_like(result)) {
                    if (wrappers.has(result)) {
                        result = wrappers.get(result);
                    }
                    else {
                        const put = (v) => {
                            if (this.cache === result)
                                this.absorb();
                            return v;
                        };
                        wrappers.set(result, result = Object.assign(result.then(put, put), { destructor: result.destructor || (() => { }) }));
                        const error = new Error(`Promise in ${this}`);
                        Object.defineProperty(result, 'stack', { get: () => error.stack });
                    }
                }
            }
            if (!$mol_promise_like(result)) {
                this.track_cut();
            }
            this.track_off(bu);
            this.put(result);
            return this;
        }
        refresh() {
            this.cursor = $mol_wire_cursor.stale;
            this.fresh();
        }
        /**
         * Synchronous execution. Throws Promise when waits async task (SuspenseAPI provider).
         * Should be called inside SuspenseAPI consumer (ie fiber).
         */
        sync() {
            if (!$mol_wire_fiber.warm) {
                return this.result();
            }
            this.promote();
            this.fresh();
            if (this.cache instanceof Error) {
                return $mol_fail_hidden(this.cache);
            }
            if ($mol_promise_like(this.cache)) {
                return $mol_fail_hidden(this.cache);
            }
            return this.cache;
        }
        /**
         * Asynchronous execution.
         * It's SuspenseAPI consumer. So SuspenseAPI providers can be called inside.
         */
        async async_raw() {
            while (true) {
                this.fresh();
                if (this.cache instanceof Error) {
                    $mol_fail_hidden(this.cache);
                }
                if (!$mol_promise_like(this.cache))
                    return this.cache;
                await Promise.race([this.cache, this.step()]);
                if (!$mol_promise_like(this.cache))
                    return this.cache;
                if (this.cursor === $mol_wire_cursor.final) {
                    // never ends on destructed fiber
                    await new Promise(() => { });
                }
            }
        }
        async() {
            const promise = this.async_raw();
            if (!promise.destructor)
                promise.destructor = () => this.destructor();
            return promise;
        }
        step() {
            return new Promise(done => {
                const sub = new $mol_wire_pub_sub;
                const prev = sub.track_on();
                sub.track_next(this);
                sub.track_off(prev);
                sub.absorb = () => {
                    done(null);
                    setTimeout(() => sub.destructor());
                };
            });
        }
        destructor() {
            super.destructor();
            $mol_wire_fiber.planning.delete(this);
            if (!$mol_owning_check(this, this.cache))
                return;
            try {
                this.cache.destructor();
            }
            catch (result) {
                if ($mol_promise_like(result)) {
                    const error = new Error(`Promise in ${this}.destructor()`);
                    Object.defineProperty(result, 'stack', { get: () => error.stack });
                }
                $mol_fail_hidden(result);
            }
        }
    }
    $.$mol_wire_fiber = $mol_wire_fiber;
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    $.$mol_compare_deep_cache = new WeakMap();
    /**
     * Deeply compares two values. Returns true if equal.
     * Define `Symbol.toPrimitive` to customize.
     */
    function $mol_compare_deep(left, right) {
        if (Object.is(left, right))
            return true;
        if (left === null)
            return false;
        if (right === null)
            return false;
        if (typeof left !== 'object')
            return false;
        if (typeof right !== 'object')
            return false;
        const left_proto = Reflect.getPrototypeOf(left);
        const right_proto = Reflect.getPrototypeOf(right);
        if (left_proto !== right_proto)
            return false;
        if (left instanceof Boolean)
            return Object.is(left.valueOf(), right['valueOf']());
        if (left instanceof Number)
            return Object.is(left.valueOf(), right['valueOf']());
        if (left instanceof String)
            return Object.is(left.valueOf(), right['valueOf']());
        if (left instanceof Date)
            return Object.is(left.valueOf(), right['valueOf']());
        if (left instanceof RegExp)
            return left.source === right.source && left.flags === right.flags;
        if (left instanceof Error)
            return left.message === right.message && $mol_compare_deep(left.stack, right.stack);
        let left_cache = $.$mol_compare_deep_cache.get(left);
        if (left_cache) {
            const right_cache = left_cache.get(right);
            if (typeof right_cache === 'boolean')
                return right_cache;
        }
        else {
            left_cache = new WeakMap();
            $.$mol_compare_deep_cache.set(left, left_cache);
        }
        left_cache.set(right, true);
        let result;
        try {
            if (!left_proto)
                result = compare_pojo(left, right);
            else if (!Reflect.getPrototypeOf(left_proto))
                result = compare_pojo(left, right);
            else if (Symbol.toPrimitive in left)
                result = compare_primitive(left, right);
            else if (Array.isArray(left))
                result = compare_array(left, right);
            else if (left instanceof Set)
                result = compare_set(left, right);
            else if (left instanceof Map)
                result = compare_map(left, right);
            else if (ArrayBuffer.isView(left))
                result = compare_buffer(left, right);
            else if (Symbol.iterator in left)
                result = compare_iterator(left[Symbol.iterator](), right[Symbol.iterator]());
            else
                result = false;
        }
        finally {
            left_cache.set(right, result);
        }
        return result;
    }
    $.$mol_compare_deep = $mol_compare_deep;
    function compare_array(left, right) {
        const len = left.length;
        if (len !== right.length)
            return false;
        for (let i = 0; i < len; ++i) {
            if (!$mol_compare_deep(left[i], right[i]))
                return false;
        }
        return true;
    }
    function compare_buffer(left, right) {
        const len = left.byteLength;
        if (len !== right.byteLength)
            return false;
        if (left instanceof DataView)
            return compare_buffer(new Uint8Array(left.buffer, left.byteOffset, left.byteLength), new Uint8Array(right.buffer, right.byteOffset, right.byteLength));
        for (let i = 0; i < len; ++i) {
            if (left[i] !== right[i])
                return false;
        }
        return true;
    }
    function compare_iterator(left, right) {
        while (true) {
            const left_next = left.next();
            const right_next = right.next();
            if (left_next.done !== right_next.done)
                return false;
            if (left_next.done)
                break;
            if (!$mol_compare_deep(left_next.value, right_next.value))
                return false;
        }
        return true;
    }
    function compare_set(left, right) {
        if (left.size !== right.size)
            return false;
        return compare_iterator(left.values(), right.values());
    }
    function compare_map(left, right) {
        if (left.size !== right.size)
            return false;
        return compare_iterator(left.keys(), right.keys())
            && compare_iterator(left.values(), right.values());
    }
    function compare_pojo(left, right) {
        const left_keys = Object.getOwnPropertyNames(left);
        const right_keys = Object.getOwnPropertyNames(right);
        if (!compare_array(left_keys, right_keys))
            return false;
        for (let key of left_keys) {
            if (!$mol_compare_deep(left[key], right[key]))
                return false;
        }
        const left_syms = Object.getOwnPropertySymbols(left);
        const right_syms = Object.getOwnPropertySymbols(right);
        if (!compare_array(left_syms, right_syms))
            return false;
        for (let key of left_syms) {
            if (!$mol_compare_deep(left[key], right[key]))
                return false;
        }
        return true;
    }
    function compare_primitive(left, right) {
        return Object.is(left[Symbol.toPrimitive]('default'), right[Symbol.toPrimitive]('default'));
    }
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    /** Log begin of collapsed group only when some logged inside, returns func to close group */
    function $mol_log3_area_lazy(event) {
        const self = this.$;
        const stack = self.$mol_log3_stack;
        const deep = stack.length;
        let logged = false;
        stack.push(() => {
            logged = true;
            self.$mol_log3_area.call(self, event);
        });
        return () => {
            if (logged)
                self.console.groupEnd();
            if (stack.length > deep)
                stack.length = deep;
        };
    }
    $.$mol_log3_area_lazy = $mol_log3_area_lazy;
    $.$mol_log3_stack = [];
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    /** Position in any resource. */
    class $mol_span extends $mol_object2 {
        uri;
        source;
        row;
        col;
        length;
        constructor(uri, source, row, col, length) {
            super();
            this.uri = uri;
            this.source = source;
            this.row = row;
            this.col = col;
            this.length = length;
            this[Symbol.toStringTag] = this.uri + ('#' + this.row + ':' + this.col + '/' + this.length);
        }
        /** Span for begin of unknown resource */
        static unknown = $mol_span.begin('?');
        /** Makes new span for begin of resource. */
        static begin(uri, source = '') {
            return new $mol_span(uri, source, 1, 1, 0);
        }
        /** Makes new span for end of resource. */
        static end(uri, source) {
            return new $mol_span(uri, source, 1, source.length + 1, 0);
        }
        /** Makes new span for entire resource. */
        static entire(uri, source) {
            return new $mol_span(uri, source, 1, 1, source.length);
        }
        toString() {
            return this[Symbol.toStringTag];
        }
        toJSON() {
            return {
                uri: this.uri,
                row: this.row,
                col: this.col,
                length: this.length
            };
        }
        /** Makes new error for this span. */
        error(message, Class = Error) {
            return new Class(`${message} (${this})`);
        }
        /** Makes new span for same uri. */
        span(row, col, length) {
            return new $mol_span(this.uri, this.source, row, col, length);
        }
        /** Makes new span after end of this. */
        after(length = 0) {
            return new $mol_span(this.uri, this.source, this.row, this.col + this.length, length);
        }
        /** Makes new span between begin and end. */
        slice(begin, end = -1) {
            let len = this.length;
            if (begin < 0)
                begin += len;
            if (end < 0)
                end += len;
            if (begin < 0 || begin > len)
                this.$.$mol_fail(this.error(`Begin value '${begin}' out of range`, RangeError));
            if (end < 0 || end > len)
                this.$.$mol_fail(this.error(`End value '${end}' out of range`, RangeError));
            if (end < begin)
                this.$.$mol_fail(this.error(`End value '${end}' can't be less than begin value`, RangeError));
            return this.span(this.row, this.col + begin, end - begin);
        }
    }
    $.$mol_span = $mol_span;
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    /** Serializes tree to string in tree format. */
    function $mol_tree2_to_string(tree) {
        let output = [];
        function dump(tree, prefix = '') {
            if (tree.type.length) {
                if (!prefix.length) {
                    prefix = "\t";
                }
                output.push(tree.type);
                if (tree.kids.length == 1) {
                    output.push(' ');
                    dump(tree.kids[0], prefix);
                    return;
                }
                output.push("\n");
            }
            else if (tree.value.length || prefix.length) {
                output.push("\\" + tree.value + "\n");
            }
            for (const kid of tree.kids) {
                output.push(prefix);
                dump(kid, prefix + "\t");
            }
        }
        dump(tree);
        return output.join('');
    }
    $.$mol_tree2_to_string = $mol_tree2_to_string;
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    function $mol_maybe(value) {
        return (value == null) ? [] : [value];
    }
    $.$mol_maybe = $mol_maybe;
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    /**
     * Abstract Syntax Tree with human readable serialization.
     * Avoid direct instantiation. Use static factories instead.
     * @see https://github.com/nin-jin/tree.d
     */
    class $mol_tree2 extends Object {
        type;
        value;
        kids;
        span;
        constructor(
        /** Type of structural node, `value` should be empty */
        type, 
        /** Content of data node, `type` should be empty */
        value, 
        /** Child nodes */
        kids, 
        /** Position in most far source resource */
        span) {
            super();
            this.type = type;
            this.value = value;
            this.kids = kids;
            this.span = span;
            this[Symbol.toStringTag] = type || '\\' + value;
        }
        /** Makes collection node. */
        static list(kids, span = $mol_span.unknown) {
            return new $mol_tree2('', '', kids, span);
        }
        /** Makes new derived collection node. */
        list(kids) {
            return $mol_tree2.list(kids, this.span);
        }
        /** Makes data node for any string. */
        static data(value, kids = [], span = $mol_span.unknown) {
            const chunks = value.split('\n');
            if (chunks.length > 1) {
                let kid_span = span.span(span.row, span.col, 0);
                const data = chunks.map(chunk => {
                    kid_span = kid_span.after(chunk.length);
                    return new $mol_tree2('', chunk, [], kid_span);
                });
                kids = [...data, ...kids];
                value = '';
            }
            return new $mol_tree2('', value, kids, span);
        }
        /** Makes new derived data node. */
        data(value, kids = []) {
            return $mol_tree2.data(value, kids, this.span);
        }
        /** Makes struct node. */
        static struct(type, kids = [], span = $mol_span.unknown) {
            if (/[ \n\t\\]/.test(type)) {
                $$.$mol_fail(span.error(`Wrong type ${JSON.stringify(type)}`));
            }
            return new $mol_tree2(type, '', kids, span);
        }
        /** Makes new derived structural node. */
        struct(type, kids = []) {
            return $mol_tree2.struct(type, kids, this.span);
        }
        /** Makes new derived node with different kids id defined. */
        clone(kids, span = this.span) {
            return new $mol_tree2(this.type, this.value, kids, span);
        }
        /** Returns multiline text content. */
        text() {
            var values = [];
            for (var kid of this.kids) {
                if (kid.type)
                    continue;
                values.push(kid.value);
            }
            return this.value + values.join('\n');
        }
        /** Parses tree format. */
        /** @deprecated Use $mol_tree2_from_string */
        static fromString(str, uri = 'unknown') {
            return $$.$mol_tree2_from_string(str, uri);
        }
        /** Serializes to tree format. */
        toString() {
            return $$.$mol_tree2_to_string(this);
        }
        /** Makes new tree with node overrided by path. */
        insert(value, ...path) {
            return this.update($mol_maybe(value), ...path)[0];
        }
        /** Makes new tree with node overrided by path. */
        update(value, ...path) {
            if (path.length === 0)
                return value;
            const type = path[0];
            if (typeof type === 'string') {
                let replaced = false;
                const sub = this.kids.flatMap((item, index) => {
                    if (item.type !== type)
                        return item;
                    replaced = true;
                    return item.update(value, ...path.slice(1));
                }).filter(Boolean);
                if (!replaced && value) {
                    sub.push(...this.struct(type, []).update(value, ...path.slice(1)));
                }
                return [this.clone(sub)];
            }
            else if (typeof type === 'number') {
                const ins = (this.kids[type] || this.list([]))
                    .update(value, ...path.slice(1));
                return [this.clone([
                        ...this.kids.slice(0, type),
                        ...ins,
                        ...this.kids.slice(type + 1),
                    ])];
            }
            else {
                const kids = ((this.kids.length === 0) ? [this.list([])] : this.kids)
                    .flatMap(item => item.update(value, ...path.slice(1)));
                return [this.clone(kids)];
            }
        }
        /** Query nodes by path. */
        select(...path) {
            let next = [this];
            for (const type of path) {
                if (!next.length)
                    break;
                const prev = next;
                next = [];
                for (var item of prev) {
                    switch (typeof (type)) {
                        case 'string':
                            for (var child of item.kids) {
                                if (child.type == type) {
                                    next.push(child);
                                }
                            }
                            break;
                        case 'number':
                            if (type < item.kids.length)
                                next.push(item.kids[type]);
                            break;
                        default: next.push(...item.kids);
                    }
                }
            }
            return this.list(next);
        }
        /** Filter kids by path or value. */
        filter(path, value) {
            const sub = this.kids.filter(item => {
                var found = item.select(...path);
                if (value === undefined) {
                    return Boolean(found.kids.length);
                }
                else {
                    return found.kids.some(child => child.value == value);
                }
            });
            return this.clone(sub);
        }
        hack_self(belt, context = {}) {
            let handle = belt[this.type] || belt[''];
            if (!handle || handle === Object.prototype[this.type]) {
                handle = (input, belt, context) => [
                    input.clone(input.hack(belt, context), context.span)
                ];
            }
            try {
                return handle(this, belt, context);
            }
            catch (error) {
                error.message += `\n${this.clone([])}${this.span}`;
                $mol_fail_hidden(error);
            }
        }
        /** Transform tree through context with transformers */
        hack(belt, context = {}) {
            return [].concat(...this.kids.map(child => child.hack_self(belt, context)));
        }
        /** Makes Error with node coordinates. */
        error(message, Class = Error) {
            return this.span.error(`${message}\n${this.clone([])}`, Class);
        }
    }
    $.$mol_tree2 = $mol_tree2;
    class $mol_tree2_empty extends $mol_tree2 {
        constructor() {
            super('', '', [], $mol_span.unknown);
        }
    }
    $.$mol_tree2_empty = $mol_tree2_empty;
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    /** Syntax error with cordinates and source line snippet. */
    class $mol_error_syntax extends SyntaxError {
        reason;
        line;
        span;
        constructor(reason, line, span) {
            super(`${reason}\n${span}\n${line.substring(0, span.col - 1).replace(/\S/g, ' ')}${''.padEnd(span.length, '!')}\n${line}`);
            this.reason = reason;
            this.line = line;
            this.span = span;
        }
    }
    $.$mol_error_syntax = $mol_error_syntax;
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    /** Parses tree format from string. */
    function $mol_tree2_from_string(str, uri = '?') {
        const span = $mol_span.entire(uri, str);
        var root = $mol_tree2.list([], span);
        var stack = [root];
        var pos = 0, row = 0, min_indent = 0;
        while (str.length > pos) {
            var indent = 0;
            var line_start = pos;
            row++;
            // read indent
            while (str.length > pos && str[pos] == '\t') {
                indent++;
                pos++;
            }
            if (!root.kids.length) {
                min_indent = indent;
            }
            indent -= min_indent;
            // invalid tab size
            if (indent < 0 || indent >= stack.length) {
                const sp = span.span(row, 1, pos - line_start);
                // skip error line
                while (str.length > pos && str[pos] != '\n') {
                    pos++;
                }
                if (indent < 0) {
                    if (str.length > pos) {
                        this.$mol_fail(new this.$mol_error_syntax(`Too few tabs`, str.substring(line_start, pos), sp));
                    }
                }
                else {
                    this.$mol_fail(new this.$mol_error_syntax(`Too many tabs`, str.substring(line_start, pos), sp));
                }
            }
            stack.length = indent + 1;
            var parent = stack[indent];
            // parse types
            while (str.length > pos && str[pos] != '\\' && str[pos] != '\n') {
                // type can not contain space and tab
                var error_start = pos;
                while (str.length > pos && (str[pos] == ' ' || str[pos] == '\t')) {
                    pos++;
                }
                if (pos > error_start) {
                    let line_end = str.indexOf('\n', pos);
                    if (line_end === -1)
                        line_end = str.length;
                    const sp = span.span(row, error_start - line_start + 1, pos - error_start);
                    this.$mol_fail(new this.$mol_error_syntax(`Wrong nodes separator`, str.substring(line_start, line_end), sp));
                }
                // read type
                var type_start = pos;
                while (str.length > pos &&
                    str[pos] != '\\' &&
                    str[pos] != ' ' &&
                    str[pos] != '\t' &&
                    str[pos] != '\n') {
                    pos++;
                }
                if (pos > type_start) {
                    let next = new $mol_tree2(str.slice(type_start, pos), '', [], span.span(row, type_start - line_start + 1, pos - type_start));
                    const parent_kids = parent.kids;
                    parent_kids.push(next);
                    parent = next;
                }
                // read one space if exists
                if (str.length > pos && str[pos] == ' ') {
                    pos++;
                }
            }
            // read data
            if (str.length > pos && str[pos] == '\\') {
                var data_start = pos;
                while (str.length > pos && str[pos] != '\n') {
                    pos++;
                }
                let next = new $mol_tree2('', str.slice(data_start + 1, pos), [], span.span(row, data_start - line_start + 2, pos - data_start - 1));
                const parent_kids = parent.kids;
                parent_kids.push(next);
                parent = next;
            }
            // now must be end of text
            if (str.length === pos && stack.length > 0) {
                const sp = span.span(row, pos - line_start + 1, 1);
                this.$mol_fail(new this.$mol_error_syntax(`Unexpected EOF, LF required`, str.substring(line_start, str.length), sp));
            }
            stack.push(parent);
            pos++;
        }
        return root;
    }
    $.$mol_tree2_from_string = $mol_tree2_from_string;
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    function $mol_array_chunks(array, rule) {
        const br = typeof rule === 'number' ? (_, i) => i % rule === 0 : rule;
        let chunk = [];
        const chunks = [];
        for (let i = 0; i < array.length; ++i) {
            const item = array[i];
            if (br(item, i)) {
                if (chunk.length)
                    chunks.push(chunk);
                chunk = [];
            }
            chunk.push(item);
        }
        if (chunk.length)
            chunks.push(chunk);
        return chunks;
    }
    $.$mol_array_chunks = $mol_array_chunks;
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    function $mol_tree2_from_json(json, span = $mol_span.unknown) {
        if (typeof json === 'boolean' || typeof json === 'number' || json === null) {
            return new $mol_tree2(String(json), '', [], span);
        }
        if (typeof json === 'string') {
            return $mol_tree2.data(json, [], span);
        }
        if (typeof json.toJSON === 'function') {
            return $mol_tree2_from_json(json.toJSON());
        }
        if (Array.isArray(json)) {
            const sub = json.map(json => $mol_tree2_from_json(json, span));
            return new $mol_tree2('/', '', sub, span);
        }
        if (ArrayBuffer.isView(json)) {
            const buf = new Uint8Array(json.buffer, json.byteOffset, json.byteLength);
            const codes = [...buf].map(b => b.toString(16).toUpperCase().padStart(2, '0'));
            const str = $mol_array_chunks(codes, 8).map(c => c.join(' ')).join('\n');
            return $mol_tree2.data(str, [], span);
        }
        if (json instanceof Date) {
            return new $mol_tree2('', json.toISOString(), [], span);
        }
        if (json.toString !== Object.prototype.toString) {
            return $mol_tree2.data(json.toString(), [], span);
        }
        if (json instanceof Error) {
            const { name, message, stack } = json;
            json = { ...json, name, message, stack };
        }
        const sub = [];
        for (var key in json) {
            const val = json[key];
            if (val === undefined)
                continue;
            const subsub = $mol_tree2_from_json(val, span);
            if (/^[^\n\t\\ ]+$/.test(key)) {
                sub.push(new $mol_tree2(key, '', [subsub], span));
            }
            else {
                sub.push($mol_tree2.data(key, [subsub], span));
            }
        }
        return new $mol_tree2('*', '', sub, span);
    }
    $.$mol_tree2_from_json = $mol_tree2_from_json;
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    /** Module for working with terminal. Text coloring when output in terminal */
    class $mol_term_color {
        static reset = this.ansi(0, 0);
        static bold = this.ansi(1, 22);
        static italic = this.ansi(3, 23);
        static underline = this.ansi(4, 24);
        static inverse = this.ansi(7, 27);
        static hidden = this.ansi(8, 28);
        static strike = this.ansi(9, 29);
        static gray = this.ansi(90, 39);
        static red = this.ansi(91, 39);
        static green = this.ansi(92, 39);
        static yellow = this.ansi(93, 39);
        static blue = this.ansi(94, 39);
        static magenta = this.ansi(95, 39);
        static cyan = this.ansi(96, 39);
        static Gray = (str) => this.inverse(this.gray(str));
        static Red = (str) => this.inverse(this.red(str));
        static Green = (str) => this.inverse(this.green(str));
        static Yellow = (str) => this.inverse(this.yellow(str));
        static Blue = (str) => this.inverse(this.blue(str));
        static Magenta = (str) => this.inverse(this.magenta(str));
        static Cyan = (str) => this.inverse(this.cyan(str));
        static ansi(open, close) {
            if (typeof process === 'undefined')
                return String;
            if (!process.stdout.isTTY)
                return String;
            const prefix = `\x1b[${open}m`;
            const postfix = `\x1b[${close}m`;
            const suffix_regexp = new RegExp(postfix.replace('[', '\\['), 'g');
            return function colorer(str) {
                str = String(str);
                if (str === '')
                    return str;
                const suffix = str.replace(suffix_regexp, prefix);
                return prefix + suffix + postfix;
            };
        }
    }
    $.$mol_term_color = $mol_term_color;
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    function $mol_log3_node_make(level, output, type, color) {
        return function $mol_log3_logger(event) {
            if (!event.time)
                event = { ...event, time: new Date().toISOString() };
            let tree = this.$mol_tree2_from_json(event);
            tree = tree.struct(type, tree.kids);
            let str = color(tree.toString());
            this.console[level](str);
            const self = this;
            return () => self.console.groupEnd();
        };
    }
    $.$mol_log3_node_make = $mol_log3_node_make;
    $.$mol_log3_come = $mol_log3_node_make('info', 'stdout', 'come', $mol_term_color.blue);
    $.$mol_log3_done = $mol_log3_node_make('info', 'stdout', 'done', $mol_term_color.green);
    $.$mol_log3_fail = $mol_log3_node_make('error', 'stderr', 'fail', $mol_term_color.red);
    $.$mol_log3_warn = $mol_log3_node_make('warn', 'stderr', 'warn', $mol_term_color.yellow);
    $.$mol_log3_rise = $mol_log3_node_make('log', 'stdout', 'rise', $mol_term_color.magenta);
    $.$mol_log3_area = $mol_log3_node_make('log', 'stdout', 'area', $mol_term_color.cyan);
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    /** One-shot fiber */
    class $mol_wire_task extends $mol_wire_fiber {
        static getter(task) {
            return function $mol_wire_task_get(host, args) {
                const sub = $mol_wire_auto();
                const existen = sub?.track_next();
                let cause = '';
                reuse: if (existen) {
                    if (!existen.temp)
                        break reuse;
                    if (existen.host !== host) {
                        cause = 'host';
                        break reuse;
                    }
                    if (existen.task !== task) {
                        cause = 'task';
                        break reuse;
                    }
                    if (!$mol_compare_deep(existen.args, args)) {
                        cause = 'args';
                        break reuse;
                    }
                    return existen;
                }
                const key = (host?.[Symbol.toStringTag] ?? host) + ('.' + task.name + '<#>');
                const next = new $mol_wire_task(key, task, host, args);
                // Disabled because non-idempotency is required for try-catch
                if (existen?.temp) {
                    $$.$mol_log3_warn({
                        place: '$mol_wire_task',
                        message: `Different ${cause} on restart`,
                        sub,
                        prev: existen,
                        next,
                        hint: 'Maybe required additional memoization',
                    });
                }
                return next;
            };
        }
        get temp() {
            return true;
        }
        complete() {
            if ($mol_promise_like(this.cache))
                return;
            this.destructor();
        }
        put(next) {
            const prev = this.cache;
            this.cache = next;
            if ($mol_promise_like(next)) {
                this.cursor = $mol_wire_cursor.fresh;
                if (next !== prev)
                    this.emit();
                if ($mol_owning_catch(this, next)) {
                    try {
                        next[Symbol.toStringTag] = this[Symbol.toStringTag];
                    }
                    catch { // Promises throw in strict mode
                        Object.defineProperty(next, Symbol.toStringTag, { value: this[Symbol.toStringTag] });
                    }
                }
                return next;
            }
            this.cursor = $mol_wire_cursor.final;
            if (this.sub_empty)
                this.destructor();
            else if (next !== prev)
                this.emit();
            return next;
        }
        destructor() {
            super.destructor();
            this.cursor = $mol_wire_cursor.final;
        }
    }
    $.$mol_wire_task = $mol_wire_task;
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    const factories = new WeakMap();
    function factory(val) {
        let make = factories.get(val);
        if (make)
            return make;
        make = $mol_func_name_from((...args) => new val(...args), val);
        factories.set(val, make);
        return make;
    }
    const getters = new WeakMap();
    function get_prop(host, field) {
        let props = getters.get(host);
        let get_val = props?.[field];
        if (get_val)
            return get_val;
        get_val = (next) => {
            if (next !== undefined)
                host[field] = next;
            return host[field];
        };
        Object.defineProperty(get_val, 'name', { value: field });
        if (!props) {
            props = {};
            getters.set(host, props);
        }
        props[field] = get_val;
        return get_val;
    }
    /**
     * Convert asynchronous (promise-based) API to synchronous by wrapping function and method calls in a fiber.
     * @see https://mol.hyoo.ru/#!section=docs/=1fcpsq_1wh0h2
     */
    function $mol_wire_sync(obj) {
        return new Proxy(obj, {
            get(obj, field) {
                let val = obj[field];
                const temp = $mol_wire_task.getter(typeof val === 'function' ? val : get_prop(obj, field));
                if (typeof val !== 'function')
                    return temp(obj, []).sync();
                return function $mol_wire_sync(...args) {
                    const fiber = temp(obj, args);
                    return fiber.sync();
                };
            },
            set(obj, field, next) {
                const temp = $mol_wire_task.getter(get_prop(obj, field));
                temp(obj, [next]).sync();
                return true;
            },
            construct(obj, args) {
                const temp = $mol_wire_task.getter(factory(obj));
                return temp(obj, args).sync();
            },
            apply(obj, self, args) {
                const temp = $mol_wire_task.getter(obj);
                return temp(self, args).sync();
            },
        });
    }
    $.$mol_wire_sync = $mol_wire_sync;
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    class $mol_run_error extends $mol_error_mix {
    }
    $.$mol_run_error = $mol_run_error;
    $.$mol_run_spawn = (...args) => $node['child_process'].spawn(...args);
    $.$mol_run_spawn_sync = (...args) => $node['child_process'].spawnSync(...args);
    class $mol_run extends $mol_object {
        static async_enabled() {
            return Boolean(this.$.$mol_env()['MOL_RUN_ASYNC']);
        }
        static spawn(options) {
            const sync = !this.async_enabled() || !Boolean($mol_wire_auto());
            const env = options.env ?? this.$.$mol_env();
            return $mol_wire_sync(this).spawn_async({ ...options, sync, env });
        }
        static spawn_async({ dir, sync, timeout, command, env }) {
            const args_raw = typeof command === 'string' ? command.split(' ') : command;
            const [app, ...args] = args_raw;
            const opts = { shell: true, cwd: dir, env };
            const log_object = {
                place: `${this}.spawn()`,
                message: 'Run',
                command: args_raw.join(' '),
                dir: $node.path.relative('', dir),
            };
            if (sync) {
                this.$.$mol_log3_come({
                    hint: 'Run inside fiber',
                    ...log_object
                });
                let error;
                let res;
                try {
                    res = this.$.$mol_run_spawn_sync(app, args, opts);
                    error = res.error;
                }
                catch (err) {
                    error = err;
                }
                if (!res || error || res.status) {
                    throw new $mol_run_error(this.error_message(res), { ...log_object, status: res?.status, signal: res?.signal }, ...(error ? [error] : []));
                }
                return res;
            }
            let sub;
            try {
                sub = this.$.$mol_run_spawn(app, args, {
                    ...opts,
                    stdio: ['pipe', 'inherit', 'inherit'],
                });
            }
            catch (error) {
                throw new $mol_run_error(this.error_message(undefined), log_object, error);
            }
            const pid = sub.pid ?? 0;
            this.$.$mol_log3_come({
                ...log_object,
                pid,
            });
            let timeout_kill = false;
            let timer;
            const std_data = [];
            const error_data = [];
            const add = (std_chunk, error_chunk) => {
                if (std_chunk)
                    std_data.push(std_chunk);
                if (error_chunk)
                    error_data.push(error_chunk);
                if (!timeout)
                    return;
                clearTimeout(timer);
                timer = setTimeout(() => {
                    const signal = timeout_kill ? 'SIGKILL' : 'SIGTERM';
                    timeout_kill = true;
                    add();
                    sub.kill(signal);
                }, timeout);
            };
            add();
            sub.stdout?.on('data', data => add(data));
            sub.stderr?.on('data', data => add(undefined, data));
            const result_promise = new Promise((done, fail) => {
                const close = (error, status = null, signal = null) => {
                    if (!timer && timeout)
                        return;
                    clearTimeout(timer);
                    timer = undefined;
                    const res = {
                        pid,
                        signal,
                        get stdout() { return Buffer.concat(std_data); },
                        get stderr() { return Buffer.concat(error_data); }
                    };
                    if (error || status || timeout_kill)
                        return fail(new $mol_run_error(this.error_message(res) + (timeout_kill ? ', timeout' : ''), { ...log_object, pid, status, signal, timeout_kill }, ...error ? [error] : []));
                    this.$.$mol_log3_done({
                        ...log_object,
                        pid,
                    });
                    done(res);
                };
                sub.on('disconnect', () => close(new Error('Disconnected')));
                sub.on('error', err => close(err));
                sub.on('exit', (status, signal) => close(null, status, signal));
            });
            return Object.assign(result_promise, { destructor: () => {
                    clearTimeout(timer);
                    sub.kill('SIGKILL');
                } });
        }
        static error_message(res) {
            return res?.stderr.toString() || res?.stdout.toString() || 'Run error';
        }
    }
    $.$mol_run = $mol_run;
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    $.$mol_dom_context = new $node.jsdom.JSDOM('', { url: `http://${process.env.DOMAIN || 'localhost'}/` }).window;
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    $.$mol_dom = $mol_dom_context;
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    function $mol_style_attach(id, text) {
        const doc = $mol_dom_context.document;
        if (!doc)
            return null;
        const elid = `$mol_style_attach:${id}`;
        let el = doc.getElementById(elid);
        if (!el) {
            el = doc.createElement('style');
            el.id = elid;
            doc.head.appendChild(el);
        }
        if (el.innerHTML != text)
            el.innerHTML = text;
        return el;
    }
    $.$mol_style_attach = $mol_style_attach;
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    class $mol_promise extends Promise {
        done;
        fail;
        constructor(executor) {
            let done;
            let fail;
            super((d, f) => {
                done = d;
                fail = f;
                executor?.(d, f);
            });
            this.done = done;
            this.fail = fail;
        }
    }
    $.$mol_promise = $mol_promise;
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    class $mol_promise_blocker extends $mol_promise {
        static [Symbol.toStringTag] = '$mol_promise_blocker';
    }
    $.$mol_promise_blocker = $mol_promise_blocker;
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    class $mol_decor {
        value;
        constructor(value) {
            this.value = value;
        }
        prefix() { return ''; }
        valueOf() { return this.value; }
        postfix() { return ''; }
        toString() {
            return `${this.prefix()}${this.valueOf()}${this.postfix()}`;
        }
    }
    $.$mol_decor = $mol_decor;
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    /**
     * CSS Units
     * @see https://mol.hyoo.ru/#!section=docs/=xwq9q5_f966fg
     */
    class $mol_style_unit extends $mol_decor {
        literal;
        constructor(value, literal) {
            super(value);
            this.literal = literal;
        }
        postfix() {
            return this.literal;
        }
        static per(value) { return `${value}%`; }
        static px(value) { return `${value}px`; }
        static mm(value) { return `${value}mm`; }
        static cm(value) { return `${value}cm`; }
        static Q(value) { return `${value}Q`; }
        static in(value) { return `${value}in`; }
        static pc(value) { return `${value}pc`; }
        static pt(value) { return `${value}pt`; }
        static cap(value) { return `${value}cap`; }
        static ch(value) { return `${value}ch`; }
        static em(value) { return `${value}em`; }
        static rem(value) { return `${value}rem`; }
        static ex(value) { return `${value}ex`; }
        static ic(value) { return `${value}ic`; }
        static lh(value) { return `${value}lh`; }
        static rlh(value) { return `${value}rlh`; }
        static vh(value) { return `${value}vh`; }
        static vw(value) { return `${value}vw`; }
        static vi(value) { return `${value}vi`; }
        static vb(value) { return `${value}vb`; }
        static vmin(value) { return `${value}vmin`; }
        static vmax(value) { return `${value}vmax`; }
        static deg(value) { return `${value}deg`; }
        static rad(value) { return `${value}rad`; }
        static grad(value) { return `${value}grad`; }
        static turn(value) { return `${value}turn`; }
        static s(value) { return `${value}s`; }
        static ms(value) { return `${value}ms`; }
    }
    $.$mol_style_unit = $mol_style_unit;
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    const { per } = $mol_style_unit;
    /**
     * CSS Functions
     * @see https://mol.hyoo.ru/#!section=docs/=xwq9q5_f966fg
     */
    class $mol_style_func extends $mol_decor {
        name;
        constructor(name, value) {
            super(value);
            this.name = name;
        }
        prefix() { return this.name + '('; }
        postfix() { return ')'; }
        static linear_gradient(value) {
            return new $mol_style_func('linear-gradient', value);
        }
        static radial_gradient(value) {
            return new $mol_style_func('radial-gradient', value);
        }
        static calc(value) {
            return new $mol_style_func('calc', value);
        }
        static vary(name, defaultValue) {
            return new $mol_style_func('var', defaultValue ? [name, defaultValue] : name);
        }
        static url(href) {
            return new $mol_style_func('url', JSON.stringify(href));
        }
        static hsla(hue, saturation, lightness, alpha) {
            return new $mol_style_func('hsla', [hue, per(saturation), per(lightness), alpha]);
        }
        static clamp(min, mid, max) {
            return new $mol_style_func('clamp', [min, mid, max]);
        }
        static rgba(red, green, blue, alpha) {
            return new $mol_style_func('rgba', [red, green, blue, alpha]);
        }
        static scale(zoom) {
            return new $mol_style_func('scale', [zoom]);
        }
        static linear(...breakpoints) {
            return new $mol_style_func("linear", breakpoints.map((e) => Array.isArray(e)
                ? String(e[0]) +
                    " " +
                    (typeof e[1] === "number" ? e[1] + "%" : e[1].toString())
                : String(e)));
        }
        static cubic_bezier(x1, y1, x2, y2) {
            return new $mol_style_func('cubic-bezier', [x1, y1, x2, y2]);
        }
        static steps(value, step_position) {
            return new $mol_style_func('steps', [value, step_position]);
        }
        static blur(value) {
            return new $mol_style_func('blur', value ?? "");
        }
        static brightness(value) {
            return new $mol_style_func('brightness', value ?? "");
        }
        static contrast(value) {
            return new $mol_style_func('contrast', value ?? "");
        }
        static drop_shadow(color, x_offset, y_offset, blur_radius) {
            return new $mol_style_func("drop-shadow", blur_radius
                ? [color, x_offset, y_offset, blur_radius]
                : [color, x_offset, y_offset]);
        }
        static grayscale(value) {
            return new $mol_style_func('grayscale', value ?? "");
        }
        static hue_rotate(value) {
            return new $mol_style_func('hue-rotate', value ?? "");
        }
        static invert(value) {
            return new $mol_style_func('invert', value ?? "");
        }
        static opacity(value) {
            return new $mol_style_func('opacity', value ?? "");
        }
        static sepia(value) {
            return new $mol_style_func('sepia', value ?? "");
        }
        static saturate(value) {
            return new $mol_style_func('saturate', value ?? "");
        }
    }
    $.$mol_style_func = $mol_style_func;
})($ || ($ = {}));

;
"use strict";

;
"use strict";

;
"use strict";
var $;
(function ($) {
    /** Create record of CSS variables. */
    function $mol_style_prop(prefix, keys) {
        const record = keys.reduce((rec, key) => {
            rec[key] = $mol_style_func.vary(`--${prefix}_${key}`);
            return rec;
        }, {});
        return record;
    }
    $.$mol_style_prop = $mol_style_prop;
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    /**
     * Theme css variables
     * @see https://mol.hyoo.ru/#!section=demos/demo=mol_textarea_demo
     */
    $.$mol_theme = $mol_style_prop('mol_theme', [
        'back',
        'hover',
        'card',
        'current',
        'special',
        'text',
        'control',
        'shade',
        'line',
        'focus',
        'field',
        'image',
        'spirit',
        'hue',
        'hue_spread',
    ]);
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    $mol_style_attach("mol/theme/theme.css", ":root {\n\t--mol_theme_hue: 240deg;\n\t--mol_theme_hue_spread: 90deg;\n\tcolor-scheme: dark light;\n}\n\nbody, :where([mol_theme]) {\n\tcolor: var(--mol_theme_text);\n\tfill: var(--mol_theme_text);\n\tbackground-color: var(--mol_theme_back);\n}\n\t\n:root, [mol_theme=\"$mol_theme_dark\"], :where([mol_theme=\"$mol_theme_dark\"]) [mol_theme]  {\n\n\t--mol_theme_luma: -1;\n\t--mol_theme_image: invert(1) hue-rotate( 180deg );\n\t--mol_theme_spirit: hsl( 0deg, 0%, 0%, .75 );\n\n\t--mol_theme_back: hsl( var(--mol_theme_hue), 20%, 10% );\n\t--mol_theme_card: hsl( var(--mol_theme_hue), 50%, 20%, .25 );\n\t--mol_theme_field: hsl( var(--mol_theme_hue), 50%, 8%, .25 );\n\t--mol_theme_hover: hsl( var(--mol_theme_hue), 0%, 50%, .1 );\n\t\n\t--mol_theme_text: hsl( var(--mol_theme_hue), 0%, 80% );\n\t--mol_theme_shade: hsl( var(--mol_theme_hue), 0%, 60%, 1 );\n\t--mol_theme_line: hsl( var(--mol_theme_hue), 0%, 50%, .25 );\n\t--mol_theme_focus: hsl( calc( var(--mol_theme_hue) + 180deg ), 100%, 65% );\n\t\n\t--mol_theme_control: hsl( var(--mol_theme_hue), 60%, 65% );\n\t--mol_theme_current: hsl( calc( var(--mol_theme_hue) - var(--mol_theme_hue_spread) ), 60%, 65% );\n\t--mol_theme_special: hsl( calc( var(--mol_theme_hue) + var(--mol_theme_hue_spread) ), 60%, 65% );\n\n} @supports( color: oklch( 0% 0 0deg ) ) {\n:root, [mol_theme=\"$mol_theme_dark\"], :where([mol_theme=\"$mol_theme_dark\"]) [mol_theme]  {\n\t\n\t--mol_theme_back: oklch( 20% .03 var(--mol_theme_hue) );\n\t--mol_theme_card: oklch( 30% .05 var(--mol_theme_hue) / .25 );\n\t--mol_theme_field: oklch( 15% 0 var(--mol_theme_hue) / .25 );\n\t--mol_theme_hover: oklch( 70% 0 var(--mol_theme_hue) / .1 );\n\t\n\t--mol_theme_text: oklch( 80% 0 var(--mol_theme_hue) );\n\t--mol_theme_shade: oklch( 60% 0 var(--mol_theme_hue) );\n\t--mol_theme_line: oklch( 60% 0 var(--mol_theme_hue) / .25 );\n\t--mol_theme_focus: oklch( 80% .2 calc( var(--mol_theme_hue) + 180deg ) );\n\t\n\t--mol_theme_control: oklch( 70% .1 var(--mol_theme_hue) );\n\t--mol_theme_current: oklch( 70% .2 calc( var(--mol_theme_hue) - var(--mol_theme_hue_spread) ) );\n\t--mol_theme_special: oklch( 70% .2 calc( var(--mol_theme_hue) + var(--mol_theme_hue_spread) ) );\n\n} }\n\n[mol_theme=\"$mol_theme_light\"], :where([mol_theme=\"$mol_theme_light\"]) [mol_theme] {\n\t\n\t--mol_theme_luma: 1;\n\t--mol_theme_image: none;\n\t--mol_theme_spirit: hsl( 0deg, 0%, 100%, .75 );\n\t\n\t--mol_theme_back: hsl( var(--mol_theme_hue), 20%, 92% );\n\t--mol_theme_card: hsl( var(--mol_theme_hue), 50%, 100%, .5 );\n\t--mol_theme_field: hsl( var(--mol_theme_hue), 50%, 100%, .75 );\n\t--mol_theme_hover: hsl( var(--mol_theme_hue), 0%, 50%, .1 );\n\t\n\t--mol_theme_text: hsl( var(--mol_theme_hue), 0%, 0% );\n\t--mol_theme_shade: hsl( var(--mol_theme_hue), 0%, 40%, 1 );\n\t--mol_theme_line: hsl( var(--mol_theme_hue), 0%, 50%, .25 );\n\t--mol_theme_focus: hsl( calc( var(--mol_theme_hue) + 180deg ), 100%, 40% );\n\t\n\t--mol_theme_control: hsl( var(--mol_theme_hue), 80%, 30% );\n\t--mol_theme_current: hsl( calc( var(--mol_theme_hue) - var(--mol_theme_hue_spread) ), 80%, 30% );\n\t--mol_theme_special: hsl( calc( var(--mol_theme_hue) + var(--mol_theme_hue_spread) ), 80%, 30% );\n\n} @supports( color: oklch( 0% 0 0deg ) ) {\n[mol_theme=\"$mol_theme_light\"], :where([mol_theme=\"$mol_theme_light\"]) [mol_theme] {\n\t--mol_theme_back: oklch( 92% .01 var(--mol_theme_hue) );\n\t--mol_theme_card: oklch( 99% .01 var(--mol_theme_hue) / .5 );\n\t--mol_theme_field: oklch( 100% 0 var(--mol_theme_hue) / .5 );\n\t--mol_theme_hover: oklch( 50% 0 var(--mol_theme_hue) / .1 );\n\t\n\t--mol_theme_text: oklch( 20% 0 var(--mol_theme_hue) );\n\t--mol_theme_shade: oklch( 60% 0 var(--mol_theme_hue) );\n\t--mol_theme_line: oklch( 50% 0 var(--mol_theme_hue) / .25 );\n\t--mol_theme_focus: oklch( 60% .2 calc( var(--mol_theme_hue) + 180deg ) );\n\t\n\t--mol_theme_control: oklch( 40% .15 var(--mol_theme_hue) );\n\t--mol_theme_current: oklch( 50% .2 calc( var(--mol_theme_hue) - var(--mol_theme_hue_spread) ) );\n\t--mol_theme_special: oklch( 50% .2 calc( var(--mol_theme_hue) + var(--mol_theme_hue_spread) ) );\n\n} }\n\n:where( :root, [mol_theme=\"$mol_theme_dark\"] ) [mol_theme=\"$mol_theme_base\"] {\n\t--mol_theme_back: oklch( 25% .075 var(--mol_theme_hue) );\n\t--mol_theme_card: oklch( 35% .1 var(--mol_theme_hue) / .25 );\n}\n:where( [mol_theme=\"$mol_theme_light\"] ) [mol_theme=\"$mol_theme_base\"] {\n\t--mol_theme_back: oklch( 85% .075 var(--mol_theme_hue) );\n\t--mol_theme_card: oklch( 98% .03 var(--mol_theme_hue) / .25 );\n}\n\n:where( :root, [mol_theme=\"$mol_theme_dark\"] ) [mol_theme=\"$mol_theme_current\"] {\n\t--mol_theme_back: oklch( 25% .05 calc( var(--mol_theme_hue) - var(--mol_theme_hue_spread) ) );\n\t--mol_theme_card: oklch( 35% .1 calc( var(--mol_theme_hue) - var(--mol_theme_hue_spread) ) / .25 );\n}\n:where( [mol_theme=\"$mol_theme_light\"] ) [mol_theme=\"$mol_theme_current\"] {\n\t--mol_theme_back: oklch( 85% .05 calc( var(--mol_theme_hue) - var(--mol_theme_hue_spread) ) );\n\t--mol_theme_card: oklch( 98% .03 calc( var(--mol_theme_hue) - var(--mol_theme_hue_spread) ) / .25 );\n}\n\n:where( :root, [mol_theme=\"$mol_theme_dark\"] ) [mol_theme=\"$mol_theme_special\"] {\n\t--mol_theme_back: oklch( 25% .05 calc( var(--mol_theme_hue) + var(--mol_theme_hue_spread) ) );\n\t--mol_theme_card: oklch( 35% .1 calc( var(--mol_theme_hue) + var(--mol_theme_hue_spread) ) / .25 );\n}\n:where( [mol_theme=\"$mol_theme_light\"] ) [mol_theme=\"$mol_theme_special\"] {\n\t--mol_theme_back: oklch( 85% .05 calc( var(--mol_theme_hue) + var(--mol_theme_hue_spread) ) );\n\t--mol_theme_card: oklch( 98% .03 calc( var(--mol_theme_hue) + var(--mol_theme_hue_spread) ) / .25 );\n}\n\n:where( :root, [mol_theme=\"$mol_theme_dark\"] ) [mol_theme=\"$mol_theme_accent\"] {\n\t--mol_theme_back: oklch( 35% .1 calc( var(--mol_theme_hue) + 180deg ) );\n\t--mol_theme_card: oklch( 45% .15 calc( var(--mol_theme_hue) + 180deg ) / .25 );\n}\n:where( [mol_theme=\"$mol_theme_light\"] ) [mol_theme=\"$mol_theme_accent\"] {\n\t--mol_theme_back: oklch( 83% .1 calc( var(--mol_theme_hue) + 180deg ) );\n\t--mol_theme_card: oklch( 98% .03 calc( var(--mol_theme_hue) + 180deg ) / .25 );\n}\n\n");
})($ || ($ = {}));

;
"use strict";
// namespace $ {
// 	$mol_style_attach( '$mol_theme_lights', `:root { --mol_theme_back: oklch( ${ $$.$mol_lights() ? 92 : 20 }% .01 var(--mol_theme_hue) ) }` )
// }

;
"use strict";
var $;
(function ($) {
    /**
     * Gap in CSS
     * @see https://page.hyoo.ru/#!=msdb74_bm7nsq
     */
    $.$mol_gap = $mol_style_prop('mol_gap', [
        'page',
        'block',
        'text',
        'emoji',
        'round',
        'space',
        'blur',
    ]);
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    $mol_style_attach("mol/gap/gap.css", ":root {\n\t--mol_gap_page: 3rem;\n\t--mol_gap_block: .75rem;\n\t--mol_gap_text: .5rem .75rem;\n\t--mol_gap_emoji: .5rem;\n\t--mol_gap_round: .25rem;\n\t--mol_gap_space: .25rem;\n\t--mol_gap_blur: .5rem;\n}\n");
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    function $mol_dom_render_children(el, childNodes) {
        const node_set = new Set(childNodes);
        let nextNode = el.firstChild;
        for (let view of childNodes) {
            if (view == null)
                continue;
            if (view instanceof $mol_dom_context.Node) {
                while (true) {
                    if (!nextNode) {
                        el.appendChild(view);
                        break;
                    }
                    if (nextNode == view) {
                        nextNode = nextNode.nextSibling;
                        break;
                    }
                    else {
                        if (node_set.has(nextNode)) {
                            el.insertBefore(view, nextNode);
                            break;
                        }
                        else {
                            const nn = nextNode.nextSibling;
                            el.removeChild(nextNode);
                            nextNode = nn;
                        }
                    }
                }
            }
            else {
                if (nextNode && nextNode.nodeName === '#text') {
                    const str = String(view);
                    if (nextNode.nodeValue !== str)
                        nextNode.nodeValue = str;
                    nextNode = nextNode.nextSibling;
                }
                else {
                    const textNode = $mol_dom_context.document.createTextNode(String(view));
                    el.insertBefore(textNode, nextNode);
                }
            }
        }
        while (nextNode) {
            const currNode = nextNode;
            nextNode = currNode.nextSibling;
            el.removeChild(currNode);
        }
    }
    $.$mol_dom_render_children = $mol_dom_render_children;
})($ || ($ = {}));

;
"use strict";

;
"use strict";
var $;
(function ($) {
    $.$mol_jsx_prefix = '';
    $.$mol_jsx_crumbs = '';
    $.$mol_jsx_booked = null;
    $.$mol_jsx_document = {
        getElementById: () => null,
        createElementNS: (space, name) => $mol_dom_context.document.createElementNS(space, name),
        createDocumentFragment: () => $mol_dom_context.document.createDocumentFragment(),
    };
    $.$mol_jsx_frag = '';
    /**
     * JSX adapter that makes DOM tree.
     * Generates global unique ids for every DOM-element by components tree with ids.
     * Ensures all local ids are unique.
     * Can reuse an existing nodes by GUIDs when used inside [`mol_jsx_attach`](https://github.com/hyoo-ru/mam_mol/tree/master/jsx/attach).
     */
    function $mol_jsx(Elem, props, ...childNodes) {
        const id = props && props.id || '';
        const guid = id ? $.$mol_jsx_prefix ? $.$mol_jsx_prefix + '/' + id : id : $.$mol_jsx_prefix;
        const crumbs_self = id ? $.$mol_jsx_crumbs.replace(/(\S+)/g, `$1_${id.replace(/\/.*/i, '')}`) : $.$mol_jsx_crumbs;
        if (Elem && $.$mol_jsx_booked) {
            if ($.$mol_jsx_booked.has(id)) {
                $mol_fail(new Error(`JSX already has tag with id ${JSON.stringify(guid)}`));
            }
            else {
                $.$mol_jsx_booked.add(id);
            }
        }
        let node = guid ? $.$mol_jsx_document.getElementById(guid) : null;
        if ($.$mol_jsx_prefix) {
            const prefix_ext = $.$mol_jsx_prefix;
            const booked_ext = $.$mol_jsx_booked;
            const crumbs_ext = $.$mol_jsx_crumbs;
            for (const field in props) {
                const func = props[field];
                if (typeof func !== 'function')
                    continue;
                const wrapper = function (...args) {
                    const prefix = $.$mol_jsx_prefix;
                    const booked = $.$mol_jsx_booked;
                    const crumbs = $.$mol_jsx_crumbs;
                    try {
                        $.$mol_jsx_prefix = prefix_ext;
                        $.$mol_jsx_booked = booked_ext;
                        $.$mol_jsx_crumbs = crumbs_ext;
                        return func.call(this, ...args);
                    }
                    finally {
                        $.$mol_jsx_prefix = prefix;
                        $.$mol_jsx_booked = booked;
                        $.$mol_jsx_crumbs = crumbs;
                    }
                };
                $mol_func_name_from(wrapper, func);
                props[field] = wrapper;
            }
        }
        if (typeof Elem !== 'string') {
            if ('prototype' in Elem) {
                const view = node && node[String(Elem)] || new Elem;
                Object.assign(view, props);
                view[Symbol.toStringTag] = guid;
                view.childNodes = childNodes;
                if (!view.ownerDocument)
                    view.ownerDocument = $.$mol_jsx_document;
                view.className = (crumbs_self ? crumbs_self + ' ' : '') + (Elem['name'] || Elem);
                node = view.valueOf();
                node[String(Elem)] = view;
                return node;
            }
            else {
                const prefix = $.$mol_jsx_prefix;
                const booked = $.$mol_jsx_booked;
                const crumbs = $.$mol_jsx_crumbs;
                try {
                    $.$mol_jsx_prefix = guid;
                    $.$mol_jsx_booked = new Set;
                    $.$mol_jsx_crumbs = (crumbs_self ? crumbs_self + ' ' : '') + (Elem['name'] || Elem);
                    return Elem(props, ...childNodes);
                }
                finally {
                    $.$mol_jsx_prefix = prefix;
                    $.$mol_jsx_booked = booked;
                    $.$mol_jsx_crumbs = crumbs;
                }
            }
        }
        if (!node) {
            node = Elem
                ? $.$mol_jsx_document.createElementNS(props?.xmlns ?? 'http://www.w3.org/1999/xhtml', Elem)
                : $.$mol_jsx_document.createDocumentFragment();
        }
        $mol_dom_render_children(node, [].concat(...childNodes));
        if (!Elem)
            return node;
        if (guid)
            node.id = guid;
        for (const key in props) {
            if (key === 'id')
                continue;
            if (typeof props[key] === 'string') {
                if (typeof node[key] === 'string')
                    node[key] = props[key];
                node.setAttribute(key, props[key]);
            }
            else if (props[key] &&
                typeof props[key] === 'object' &&
                Reflect.getPrototypeOf(props[key]) === Reflect.getPrototypeOf({})) {
                if (typeof node[key] === 'object') {
                    Object.assign(node[key], props[key]);
                    continue;
                }
            }
            else {
                node[key] = props[key];
            }
        }
        if ($.$mol_jsx_crumbs)
            node.className = (props?.['class'] ? props['class'] + ' ' : '') + crumbs_self;
        return node;
    }
    $.$mol_jsx = $mol_jsx;
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    class $mol_window extends $mol_object {
        static size() {
            return {
                width: 1024,
                height: 768,
            };
        }
    }
    $.$mol_window = $mol_window;
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    const TypedArray = Object.getPrototypeOf(Uint8Array);
    /** Returns string key for any value. */
    function $mol_key(value) {
        primitives: {
            if (typeof value === 'bigint')
                return value.toString() + 'n';
            if (typeof value === 'symbol')
                return `Symbol(${value.description})`;
            if (!value)
                return JSON.stringify(value); // 0, null, ""
            if (typeof value !== 'object' && typeof value !== 'function')
                return JSON.stringify(value); // boolean, number, string
        }
        caching: {
            let key = $mol_key_store.get(value);
            if (key)
                return key;
        }
        objects: {
            if (value instanceof TypedArray) {
                return `${value[Symbol.toStringTag]}([${[...value].map(v => $mol_key(v))}])`;
            }
            if (Array.isArray(value))
                return `[${value.map(v => $mol_key(v))}]`;
            if (value instanceof RegExp)
                return value.toString();
            if (value instanceof Date)
                return `Date(${value.valueOf()})`;
        }
        structures: {
            const proto = Reflect.getPrototypeOf(value);
            if (!proto || !Reflect.getPrototypeOf(proto)) {
                return `{${Object.entries(value).map(([k, v]) => JSON.stringify(k) + ':' + $mol_key(v))}}`;
            }
        }
        handlers: {
            if ($mol_key_handle in value) {
                return value[$mol_key_handle]();
            }
        }
        containers: {
            const key = JSON.stringify('#' + $mol_guid());
            $mol_key_store.set(value, key);
            return key;
        }
    }
    $.$mol_key = $mol_key;
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    class $mol_after_timeout extends $mol_object2 {
        delay;
        task;
        id;
        constructor(delay, task) {
            super();
            this.delay = delay;
            this.task = task;
            this.id = setTimeout(task, delay);
        }
        destructor() {
            clearTimeout(this.id);
        }
    }
    $.$mol_after_timeout = $mol_after_timeout;
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    class $mol_after_frame extends $mol_after_timeout {
        task;
        constructor(task) {
            super(16, task);
            this.task = task;
        }
    }
    $.$mol_after_frame = $mol_after_frame;
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    /**
     * Decorates method to fiber to ensure it is executed only once inside other fiber.
     */
    function $mol_wire_method(host, field, descr) {
        if (!descr)
            descr = Reflect.getOwnPropertyDescriptor(host, field);
        const orig = descr?.value ?? host[field];
        const sup = Reflect.getPrototypeOf(host);
        if (typeof sup[field] === 'function') {
            Object.defineProperty(orig, 'name', { value: sup[field].name });
        }
        const temp = $mol_wire_task.getter(orig);
        const value = function (...args) {
            const fiber = temp(this ?? null, args);
            return fiber.sync();
        };
        Object.defineProperty(value, 'name', { value: orig.name + ' ' });
        Object.assign(value, { orig });
        const descr2 = { ...descr, value };
        Reflect.defineProperty(host, field, descr2);
        return descr2;
    }
    $.$mol_wire_method = $mol_wire_method;
})($ || ($ = {}));

;
"use strict";

;
"use strict";

;
"use strict";
var $;
(function ($) {
    /** Long-living fiber. */
    class $mol_wire_atom extends $mol_wire_fiber {
        static solo(host, task) {
            const field = task.name + '()';
            const existen = Object.getOwnPropertyDescriptor(host ?? task, field)?.value;
            if (existen)
                return existen;
            const prefix = host?.[Symbol.toStringTag] ?? (host instanceof Function ? $$.$mol_func_name(host) : host);
            const key = prefix + ('.' + task.name + '<>');
            const fiber = new $mol_wire_atom(key, task, host, []);
            (host ?? task)[field] = fiber;
            return fiber;
        }
        static plex(host, task, key) {
            const field = task.name + '()';
            let dict = Object.getOwnPropertyDescriptor(host ?? task, field)?.value;
            const prefix = host?.[Symbol.toStringTag] ?? (host instanceof Function ? $$.$mol_func_name(host) : host);
            const key_str = $mol_key(key);
            if (dict) {
                const existen = dict.get(key_str);
                if (existen)
                    return existen;
            }
            else {
                dict = (host ?? task)[field] = new Map();
            }
            const id = prefix + ('.' + task.name) + ('<' + key_str.replace(/^"|"$/g, "'") + '>');
            const fiber = new $mol_wire_atom(id, task, host, [key]);
            dict.set(key_str, fiber);
            return fiber;
        }
        static watching = new Set();
        static watcher = null;
        static watch() {
            $mol_wire_atom.watcher = new $mol_after_frame($mol_wire_atom.watch);
            for (const atom of $mol_wire_atom.watching) {
                if (atom.cursor === $mol_wire_cursor.final) {
                    $mol_wire_atom.watching.delete(atom);
                }
                else {
                    atom.cursor = $mol_wire_cursor.stale;
                    atom.fresh();
                }
            }
        }
        watch() {
            if (!$mol_wire_atom.watcher) {
                $mol_wire_atom.watcher = new $mol_after_frame($mol_wire_atom.watch);
            }
            $mol_wire_atom.watching.add(this);
        }
        /**
         * Update atom value through another temp fiber.
         */
        resync(args) {
            // enforce pulling tasks abort
            for (let cursor = this.pub_from; cursor < this.sub_from; cursor += 2) {
                const pub = this.data[cursor];
                if (pub && pub instanceof $mol_wire_task) {
                    pub.destructor();
                }
            }
            return this.put(this.task.call(this.host, ...args));
        }
        once() {
            return this.sync();
        }
        channel() {
            return Object.assign((next) => {
                if (next !== undefined)
                    return this.resync([...this.args, next]);
                if (!$mol_wire_fiber.warm)
                    return this.result();
                if ($mol_wire_auto()?.temp) {
                    return this.once();
                }
                else {
                    return this.sync();
                }
            }, { atom: this });
        }
        destructor() {
            super.destructor();
            if (this.pub_from === 0) {
                ;
                (this.host ?? this.task)[this.field()] = null;
            }
            else {
                const key = $mol_key(this.args[0]);
                const map = (this.host ?? this.task)[this.field()];
                if (!map.has(key))
                    this.$.$mol_log3_warn({
                        place: this,
                        message: 'Absent key on destruction',
                        hint: 'Check for $mol_key(key) is not changed',
                    });
                map.delete(key);
            }
        }
        put(next) {
            const prev = this.cache;
            update: if (next !== prev) {
                try {
                    if ($mol_compare_deep(prev, next))
                        break update;
                }
                catch (error) {
                    $mol_fail_log(error);
                }
                if ($mol_owning_check(this, prev)) {
                    prev.destructor();
                }
                if ($mol_owning_catch(this, next)) {
                    try {
                        next[Symbol.toStringTag] = this[Symbol.toStringTag];
                    }
                    catch { // Promises throw in strict mode
                        Object.defineProperty(next, Symbol.toStringTag, { value: this[Symbol.toStringTag] });
                    }
                }
                if (!this.sub_empty)
                    this.emit();
            }
            this.cache = next;
            this.cursor = $mol_wire_cursor.fresh;
            if ($mol_promise_like(next))
                return next;
            this.complete_pubs();
            return next;
        }
    }
    __decorate([
        $mol_wire_method
    ], $mol_wire_atom.prototype, "resync", null);
    __decorate([
        $mol_wire_method
    ], $mol_wire_atom.prototype, "once", null);
    $.$mol_wire_atom = $mol_wire_atom;
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    /** Decorates solo object channel to [mol_wire_atom](../atom/atom.ts). */
    function $mol_wire_solo(host, field, descr) {
        if (!descr)
            descr = Reflect.getOwnPropertyDescriptor(host, field);
        const orig = descr?.value ?? host[field];
        const sup = Reflect.getPrototypeOf(host);
        if (typeof sup[field] === 'function') {
            Object.defineProperty(orig, 'name', { value: sup[field].name });
        }
        const descr2 = {
            ...descr,
            value: function (...args) {
                let atom = $mol_wire_atom.solo(this, orig);
                if ((args.length === 0) || (args[0] === undefined)) {
                    if (!$mol_wire_fiber.warm)
                        return atom.result();
                    if ($mol_wire_auto()?.temp) {
                        return atom.once();
                    }
                    else {
                        return atom.sync();
                    }
                }
                return atom.resync(args);
            }
        };
        Reflect.defineProperty(descr2.value, 'name', { value: orig.name + ' ' });
        Reflect.defineProperty(descr2.value, 'length', { value: orig.length });
        Object.assign(descr2.value, { orig });
        Reflect.defineProperty(host, field, descr2);
        return descr2;
    }
    $.$mol_wire_solo = $mol_wire_solo;
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    /** Reactive memoizing multiplexed property decorator. */
    function $mol_wire_plex(host, field, descr) {
        if (!descr)
            descr = Reflect.getOwnPropertyDescriptor(host, field);
        const orig = descr?.value ?? host[field];
        const sup = Reflect.getPrototypeOf(host);
        if (typeof sup[field] === 'function') {
            Object.defineProperty(orig, 'name', { value: sup[field].name });
        }
        const descr2 = {
            ...descr,
            value: function (...args) {
                let atom = $mol_wire_atom.plex(this, orig, args[0]);
                if ((args.length === 1) || (args[1] === undefined)) {
                    if (!$mol_wire_fiber.warm)
                        return atom.result();
                    if ($mol_wire_auto()?.temp) {
                        return atom.once();
                    }
                    else {
                        return atom.sync();
                    }
                }
                return atom.resync(args);
            }
        };
        Reflect.defineProperty(descr2.value, 'name', { value: orig.name + ' ' });
        Reflect.defineProperty(descr2.value, 'length', { value: orig.length });
        Object.assign(descr2.value, { orig });
        Reflect.defineProperty(host, field, descr2);
        return descr2;
    }
    $.$mol_wire_plex = $mol_wire_plex;
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    /**
     * Reactive memoizing solo property decorator from [mol_wire](../wire/README.md)
     * @example
     * '@' $mol_mem
     * name(next?: string) {
     * 	return next ?? 'default'
     * }
     * @see https://mol.hyoo.ru/#!section=docs/=qxmh6t_sinbmb
     */
    $.$mol_mem = $mol_wire_solo;
    /**
     * Reactive memoizing multiplexed property decorator [mol_wire](../wire/README.md)
     * @example
     * '@' $mol_mem_key
     * name(id: number, next?: string) {
     *  return next ?? 'default'
     * }
     * @see https://mol.hyoo.ru/#!section=docs/=qxmh6t_sinbmb
     */
    $.$mol_mem_key = $mol_wire_plex;
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    function $mol_guard_defined(value) {
        return value !== null && value !== undefined;
    }
    $.$mol_guard_defined = $mol_guard_defined;
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    class $mol_view_selection extends $mol_object {
        static focused(next, notify) {
            const parents = [];
            let element = next?.[0] ?? $mol_dom_context.document.activeElement;
            while (element?.shadowRoot) {
                element = element.shadowRoot.activeElement;
            }
            while (element) {
                parents.push(element);
                const parent = element.parentNode;
                if (parent instanceof ShadowRoot)
                    element = parent.host;
                else
                    element = parent;
            }
            if (!next || notify)
                return parents;
            new $mol_after_tick(() => {
                const element = this.focused()[0];
                if (element)
                    element.focus();
                else
                    $mol_dom_context.blur();
            });
            return parents;
        }
    }
    __decorate([
        $mol_mem
    ], $mol_view_selection, "focused", null);
    $.$mol_view_selection = $mol_view_selection;
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    class $mol_wrapper extends $mol_object2 {
        static wrap;
        static run(task) {
            return this.func(task)();
        }
        static func(func) {
            return this.wrap(func);
        }
        static get class() {
            return (Class) => {
                const construct = (target, args) => new Class(...args);
                const handler = {
                    construct: this.func(construct)
                };
                handler[Symbol.toStringTag] = Class.name + '#';
                return new Proxy(Class, handler);
            };
        }
        static get method() {
            return (obj, name, descr = Reflect.getOwnPropertyDescriptor(obj, name)) => {
                descr.value = this.func(descr.value);
                return descr;
            };
        }
        static get field() {
            return (obj, name, descr = Reflect.getOwnPropertyDescriptor(obj, name)) => {
                descr.get = descr.set = this.func(descr.get);
                return descr;
            };
        }
    }
    $.$mol_wrapper = $mol_wrapper;
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    class $mol_memo extends $mol_wrapper {
        static wrap(task) {
            const store = new WeakMap();
            const fun = function (next) {
                if (next === undefined && store.has(this ?? fun))
                    return store.get(this ?? fun);
                const val = task.call(this, next) ?? next;
                store.set(this ?? fun, val);
                return val;
            };
            Reflect.defineProperty(fun, 'name', { value: task.name + ' ' });
            return fun;
        }
    }
    $.$mol_memo = $mol_memo;
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    function $mol_dom_qname(name) {
        return name.replace(/\W/g, '').replace(/^(?=\d+)/, '_');
    }
    $.$mol_dom_qname = $mol_dom_qname;
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    /** Run code without state changes */
    function $mol_wire_probe(task, def) {
        const warm = $mol_wire_fiber.warm;
        try {
            $mol_wire_fiber.warm = false;
            const res = task();
            if (res === undefined)
                return def;
            return res;
        }
        finally {
            $mol_wire_fiber.warm = warm;
        }
    }
    $.$mol_wire_probe = $mol_wire_probe;
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    /**
     * Real-time refresh current atom.
     * Don't use if possible. May reduce performance.
     */
    function $mol_wire_watch() {
        const atom = $mol_wire_auto();
        if (atom instanceof $mol_wire_atom) {
            atom.watch();
        }
        else {
            $mol_fail(new Error('Atom is required for watching'));
        }
    }
    $.$mol_wire_watch = $mol_wire_watch;
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    /**
     * Returns closure that returns constant value.
     * @example
     * const rnd = $mol_const( Math.random() )
     */
    function $mol_const(value) {
        const getter = (() => value);
        getter['()'] = value;
        getter[Symbol.toStringTag] = value;
        getter[$mol_dev_format_head] = () => $mol_dev_format_span({}, '()=> ', $mol_dev_format_auto(value));
        return getter;
    }
    $.$mol_const = $mol_const;
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    /**
     * Disable reaping of current subscriber
     */
    function $mol_wire_solid() {
        let current = $mol_wire_auto();
        if (current.temp)
            current = current.host;
        if (current.reap !== nothing) {
            current?.sub_on(sub, sub.data.length);
        }
        current.reap = nothing;
    }
    $.$mol_wire_solid = $mol_wire_solid;
    const nothing = () => { };
    const sub = new $mol_wire_pub_sub;
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    function $mol_dom_render_attributes(el, attrs) {
        for (let name in attrs) {
            let val = attrs[name];
            if (val === undefined) {
                continue;
            }
            else if (val === null || val === false) {
                if (!el.hasAttribute(name))
                    continue;
                el.removeAttribute(name);
            }
            else {
                const str = String(val);
                if (el.getAttribute(name) === str)
                    continue;
                el.setAttribute(name, str);
            }
        }
    }
    $.$mol_dom_render_attributes = $mol_dom_render_attributes;
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    function $mol_dom_render_events(el, events, passive = false) {
        for (let name in events) {
            el.addEventListener(name, events[name], { passive });
        }
    }
    $.$mol_dom_render_events = $mol_dom_render_events;
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    function $mol_error_message(error) {
        return String((error instanceof Error ? error.message : null) || error) || 'Unknown';
    }
    $.$mol_error_message = $mol_error_message;
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    function $mol_dom_render_styles(el, styles) {
        for (let name in styles) {
            let val = styles[name];
            const style = el.style;
            const kebab = (name) => name.replace(/[A-Z]/g, letter => '-' + letter.toLowerCase());
            if (typeof val === 'number') {
                style.setProperty(kebab(name), `${val}px`);
            }
            else {
                style.setProperty(kebab(name), val);
            }
        }
    }
    $.$mol_dom_render_styles = $mol_dom_render_styles;
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    function $mol_dom_render_fields(el, fields) {
        for (let key in fields) {
            const val = fields[key];
            if (val === undefined)
                continue;
            if (val === el[key])
                continue;
            el[key] = val;
        }
    }
    $.$mol_dom_render_fields = $mol_dom_render_fields;
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    /** Convert a pseudo-synchronous (Suspense API) API to an explicit asynchronous one (for integrating with external systems). */
    function $mol_wire_async(obj) {
        let fiber;
        const temp = $mol_wire_task.getter(obj);
        return new Proxy(obj, {
            get(obj, field) {
                const val = obj[field];
                if (typeof val !== 'function')
                    return val;
                let fiber;
                const temp = $mol_wire_task.getter(val);
                return function $mol_wire_async(...args) {
                    fiber?.destructor();
                    fiber = temp(obj, args);
                    return fiber.async();
                };
            },
            apply(obj, self, args) {
                fiber?.destructor();
                fiber = temp(self, args);
                return fiber.async();
            },
        });
    }
    $.$mol_wire_async = $mol_wire_async;
})($ || ($ = {}));

;
"use strict";

;
"use strict";

;
"use strict";
var $;
(function ($) {
    $mol_style_attach("mol/view/view/view.css", "@view-transition {\n\tnavigation: auto;\n}\n\n[mol_view] {\n\ttransition-property: height, width, min-height, min-width, max-width, max-height, transform, scale, translate, rotate;\n\ttransition-duration: .2s;\n\ttransition-timing-function: ease-out;\n\t-webkit-appearance: none;\n\tbox-sizing: border-box;\n\tdisplay: flex;\n\tflex-shrink: 0;\n\tcontain: style;\n\tscrollbar-color: var(--mol_theme_line) transparent;\n\tscrollbar-width: thin;\n\t/* text-wrap-style: pretty; dont work in textarea */\n\tunicode-bidi: plaintext\n}\n\n[mol_view]::selection {\n\tbackground: var(--mol_theme_line);\n}\t\n\n[mol_view]::-webkit-scrollbar {\n\twidth: .25rem;\n\theight: .25rem;\n}\n\n[mol_view]::-webkit-scrollbar-corner {\n\tbackground-color: var(--mol_theme_line);\n}\n\n[mol_view]::-webkit-scrollbar-track {\n\tbackground-color: transparent;\n}\n\n[mol_view]::-webkit-scrollbar-thumb {\n\tbackground-color: var(--mol_theme_line);\n\tborder-radius: var(--mol_gap_round);\n}\n\n[mol_view] > * {\n\tword-break: inherit;\n}\n\n[mol_view_root] {\n\tmargin: 0;\n\tpadding: 0;\n\twidth: 100%;\n\theight: 100%;\n\tbox-sizing: border-box;\n\tfont-family: system-ui, 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;\n\tfont-size: 1rem;\n\tline-height: 1.5rem;\n\t/* background: var(--mol_theme_back);\n\tcolor: var(--mol_theme_text); */\n\tcontain: unset; /** Fixes bg ignoring when applied to body on Chrome */\n\ttab-size: 4;\n\t/*overscroll-behavior: contain; /** Disable navigation gestures **/\n}\n\n@media print {\n\t[mol_view_root] {\n\t\theight: auto;\n\t}\n}\n[mol_view][mol_view_error]:not([mol_view_error=\"Promise\"], [mol_view_error=\"$mol_promise_blocker\"]) {\n\tbackground-image: repeating-linear-gradient(\n\t\t-45deg,\n\t\t#f92323,\n\t\t#f92323 .5rem,\n\t\t#ff3d3d .5rem,\n\t\t#ff3d3d 1.5rem\n\t);\n\tcolor: black;\n\talign-items: center;\n\tjustify-content: center;\n}\n\n@keyframes mol_view_wait {\n\tfrom {\n\t\topacity: .25;\n\t}\n\t20% {\n\t\topacity: .75;\n\t}\n\tto {\n\t\topacity: .25;\n\t}\n}\n\n:where([mol_view][mol_view_error=\"$mol_promise_blocker\"]),\n:where([mol_view][mol_view_error=\"Promise\"]) {\n\tbackground: var(--mol_theme_hover);\n}\n\n[mol_view][mol_view_error=\"Promise\"] {\n\tanimation: mol_view_wait 1s steps(20,end) infinite;\n}\n");
})($ || ($ = {}));

;
"use strict";
/** @jsx $mol_jsx */
var $;
(function ($) {
    function $mol_view_visible_width() {
        return $mol_window.size().width;
    }
    $.$mol_view_visible_width = $mol_view_visible_width;
    function $mol_view_visible_height() {
        return $mol_window.size().height;
    }
    $.$mol_view_visible_height = $mol_view_visible_height;
    function $mol_view_state_key(suffix) {
        return suffix;
    }
    $.$mol_view_state_key = $mol_view_state_key;
    /**
     * The base class for all visual components. It provides the infrastructure for reactive lazy rendering, handling exceptions.
     * @see https://mol.hyoo.ru/#!section=docs/=vv2nig_s5zr0f
     */
    /// Reactive statefull lazy ViewModel
    class $mol_view extends $mol_object {
        static Root(id) {
            return new this;
        }
        static roots() {
            return [...$mol_dom.document.querySelectorAll('[mol_view_root]:not([mol_view_root=""])')].map((node, index) => {
                const name = node.getAttribute('mol_view_root');
                const View = this.$[name];
                if (!View) {
                    $mol_fail_log(new Error(`Autobind unknown view class`, { cause: { name } }));
                    return null;
                }
                const view = View.Root(index);
                view.dom_node(node);
                return view;
            }).filter($mol_guard_defined);
        }
        static auto() {
            const roots = this.roots();
            if (!roots.length)
                return;
            for (const root of roots) {
                try {
                    root.dom_tree();
                }
                catch (error) {
                    $mol_fail_log(error);
                }
            }
            try {
                document.title = roots[0].title();
            }
            catch (error) {
                $mol_fail_log(error);
            }
            descr: try {
                const descr = roots[0].hint();
                if (!descr)
                    break descr;
                const head = $mol_dom.document.head;
                let node = head.querySelector('meta[name="description"]');
                if (node)
                    node.content = descr;
                else
                    head.append($mol_jsx("meta", { name: "description", content: descr }));
            }
            catch (error) {
                $mol_fail_log(error);
            }
        }
        title() {
            return this.toString().match(/.*\.(\w+)/)?.[1] ?? this.toString();
        }
        hint() {
            return '';
        }
        focused(next) {
            let node = this.dom_node();
            const value = $mol_view_selection.focused(next === undefined ? undefined : (next ? [node] : []));
            return value.indexOf(node) !== -1;
        }
        state_key(suffix = '') {
            return this.$.$mol_view_state_key(suffix);
        }
        /// Name of element that created when element not found in DOM
        dom_name() {
            return $mol_dom_qname(this.constructor.toString()) || 'div';
        }
        /// NameSpace of element that created when element not found in DOM
        dom_name_space() { return 'http://www.w3.org/1999/xhtml'; }
        /// Raw child views
        sub() {
            return [];
        }
        /// Visible sub views with defined ambient context
        /// Render all by default
        sub_visible() {
            return this.sub();
        }
        /// Minimal width that used for lazy rendering
        minimal_width() {
            let min = 0;
            try {
                const sub = this.sub();
                if (!sub)
                    return 0;
                sub.forEach(view => {
                    if (view instanceof $mol_view) {
                        min = Math.max(min, view.minimal_width());
                    }
                });
            }
            catch (error) {
                $mol_fail_log(error);
                return 24;
            }
            return min;
        }
        maximal_width() {
            return this.minimal_width();
        }
        /// Minimal height that used for lazy rendering
        minimal_height() {
            let min = 0;
            try {
                for (const view of this.sub() ?? []) {
                    if (view instanceof $mol_view) {
                        min = Math.max(min, view.minimal_height());
                    }
                }
            }
            catch (error) {
                $mol_fail_log(error);
                return 24;
            }
            return min;
        }
        static watchers = new Set();
        view_rect() {
            if ($mol_wire_probe(() => this.view_rect()) === undefined) {
                $mol_wire_watch();
                return null; // don't touch DOM to prevent instant reflow
            }
            else {
                const { width, height, left, right, top, bottom } = this.dom_node().getBoundingClientRect();
                return { width, height, left, right, top, bottom }; // pick to optimize compare
            }
        }
        dom_id() {
            return this.toString().replace(/</g, '(').replace(/>/g, ')').replaceAll(/"/g, "'");
        }
        dom_node_external(next) {
            const node = next ?? $mol_dom_context.document.createElementNS(this.dom_name_space(), this.dom_name());
            const id = this.dom_id();
            node.setAttribute('id', id);
            node.toString = $mol_const('<#' + id + '>');
            return node;
        }
        dom_node(next) {
            $mol_wire_solid();
            const node = this.dom_node_external(next);
            $mol_dom_render_attributes(node, this.attr_static());
            const events = this.event_async();
            $mol_dom_render_events(node, events);
            return node;
        }
        dom_final() {
            this.render();
            const sub = this.sub_visible();
            if (!sub)
                return;
            for (const el of sub) {
                if (el && typeof el === 'object' && 'dom_final' in el) {
                    el['dom_final']();
                }
            }
            return this.dom_node();
        }
        dom_tree(next) {
            const node = this.dom_node(next);
            render: try {
                $mol_dom_render_attributes(node, { mol_view_error: null });
                try {
                    this.render();
                }
                finally {
                    for (let plugin of this.plugins()) {
                        if (plugin instanceof $mol_plugin) {
                            plugin.dom_tree();
                        }
                    }
                }
            }
            catch (error) {
                $mol_fail_log(error);
                const mol_view_error = $mol_promise_like(error)
                    ? error.constructor[Symbol.toStringTag] ?? 'Promise'
                    : error.name || error.constructor.name;
                $mol_dom_render_attributes(node, { mol_view_error });
                if ($mol_promise_like(error))
                    break render;
                try {
                    ;
                    node.innerText = this.$.$mol_error_message(error).replace(/^|$/mg, '\xA0\xA0');
                }
                catch { }
            }
            try {
                this.auto();
            }
            catch (error) {
                $mol_fail_log(error);
            }
            return node;
        }
        dom_node_actual() {
            const node = this.dom_node();
            const attr = this.attr();
            const style = this.style();
            $mol_dom_render_attributes(node, attr);
            $mol_dom_render_styles(node, style);
            return node;
        }
        auto() {
            return [];
        }
        render() {
            const node = this.dom_node_actual();
            const sub = this.sub_visible();
            if (!sub)
                return;
            const nodes = sub.map(child => {
                if (child == null)
                    return null;
                return (child instanceof $mol_view)
                    ? child.dom_node()
                    : child instanceof $mol_dom_context.Node
                        ? child
                        : String(child);
            });
            $mol_dom_render_children(node, nodes);
            for (const el of sub)
                if (el && typeof el === 'object' && 'dom_tree' in el)
                    el['dom_tree']();
            $mol_dom_render_fields(node, this.field());
        }
        static view_classes() {
            const proto = this.prototype;
            let current = proto;
            const classes = [];
            while (current) {
                if (current.constructor.name !== classes.at(-1)?.name) {
                    classes.push(current.constructor);
                }
                if (!(current instanceof $mol_view))
                    break;
                current = Object.getPrototypeOf(current);
            }
            return classes;
        }
        static _view_names;
        static view_names(suffix) {
            let cache = Reflect.getOwnPropertyDescriptor(this, '_view_names')?.value;
            if (!cache)
                cache = this._view_names = new Map;
            const cached = cache.get(suffix);
            if (cached)
                return cached;
            const names = [];
            const suffix2 = '_' + suffix[0].toLowerCase() + suffix.substring(1);
            for (const Class of this.view_classes()) {
                if (suffix in Class.prototype)
                    names.push(this.$.$mol_func_name(Class) + suffix2);
                else
                    break;
            }
            cache.set(suffix, names);
            return names;
        }
        view_names_owned() {
            const names = [];
            let owner = $mol_owning_get(this);
            if (!(owner?.host instanceof $mol_view))
                return names;
            const suffix = owner.task.name.trim();
            const suffix2 = '_' + suffix[0].toLowerCase() + suffix.substring(1);
            names.push(...owner.host.constructor.view_names(suffix));
            for (let prefix of owner.host.view_names_owned()) {
                names.push(prefix + suffix2);
            }
            return names;
        }
        view_names() {
            const names = new Set();
            for (let name of this.view_names_owned())
                names.add(name);
            for (let Class of this.constructor.view_classes()) {
                const name = this.$.$mol_func_name(Class);
                if (name)
                    names.add(name);
            }
            return names;
        }
        theme(next) {
            return next;
        }
        attr_static() {
            let attrs = {};
            for (let name of this.view_names())
                attrs[name.replace(/\$/g, '').replace(/^(?=\d)/, '_').toLowerCase()] = '';
            return attrs;
        }
        attr() {
            return {
                mol_theme: this.theme(),
            };
        }
        style() {
            return {};
        }
        field() {
            return {};
        }
        event() {
            return {};
        }
        event_async() {
            return { ...$mol_wire_async(this.event()) };
        }
        plugins() {
            return [];
        }
        [$mol_dev_format_head]() {
            return $mol_dev_format_span({}, $mol_dev_format_native(this));
        }
        /** Deep search view by predicate. */
        *view_find(check, path = []) {
            if (path.length === 0 && check(this))
                return yield [this];
            try {
                const checked = new Set();
                const sub = this.sub();
                for (const item of sub) {
                    if (!(item instanceof $mol_view))
                        continue;
                    if (!check(item))
                        continue;
                    checked.add(item);
                    yield [...path, this, item];
                }
                for (const item of sub) {
                    if (!(item instanceof $mol_view))
                        continue;
                    if (checked.has(item))
                        continue;
                    yield* item.view_find(check, [...path, this]);
                }
            }
            catch (error) {
                if ($mol_promise_like(error))
                    $mol_fail_hidden(error);
                $mol_fail_log(error);
            }
        }
        /** Renders path of views to DOM. */
        force_render(path) {
            const kids = this.sub();
            const index = kids.findIndex(item => {
                if (item instanceof $mol_view) {
                    return path.has(item);
                }
                else {
                    return false;
                }
            });
            if (index >= 0) {
                kids[index].force_render(path);
            }
        }
        /** Renders view to DOM and scroll to it. */
        ensure_visible(view, align = "start") {
            const path = this.view_find(v => v === view).next().value;
            this.force_render(new Set(path));
            try {
                this.dom_final();
            }
            finally {
                view.dom_node().scrollIntoView({ block: align });
            }
        }
        bring() {
            const win = this.$.$mol_dom_context;
            if (win.parent !== win.self && !win.document.hasFocus())
                return;
            // new this.$.$mol_after_frame( ()=> {
            // 	this.dom_node().scrollIntoView({ block: 'start', inline: 'nearest' })
            // } )
            new this.$.$mol_after_timeout(0, () => {
                this.focused(true);
            });
        }
        destructor() {
            const node = $mol_wire_probe(() => this.dom_node());
            if (!node)
                return;
            const events = $mol_wire_probe(() => this.event_async());
            if (!events)
                return;
            for (let event_name in events) {
                node.removeEventListener(event_name, events[event_name]);
            }
        }
    }
    __decorate([
        $mol_mem
    ], $mol_view.prototype, "title", null);
    __decorate([
        $mol_mem
    ], $mol_view.prototype, "focused", null);
    __decorate([
        $mol_memo.method
    ], $mol_view.prototype, "dom_name", null);
    __decorate([
        $mol_mem
    ], $mol_view.prototype, "minimal_width", null);
    __decorate([
        $mol_mem
    ], $mol_view.prototype, "minimal_height", null);
    __decorate([
        $mol_mem
    ], $mol_view.prototype, "view_rect", null);
    __decorate([
        $mol_memo.method
    ], $mol_view.prototype, "dom_id", null);
    __decorate([
        $mol_mem
    ], $mol_view.prototype, "dom_node", null);
    __decorate([
        $mol_mem
    ], $mol_view.prototype, "dom_final", null);
    __decorate([
        $mol_mem
    ], $mol_view.prototype, "dom_tree", null);
    __decorate([
        $mol_mem
    ], $mol_view.prototype, "dom_node_actual", null);
    __decorate([
        $mol_mem
    ], $mol_view.prototype, "render", null);
    __decorate([
        $mol_memo.method
    ], $mol_view.prototype, "view_names_owned", null);
    __decorate([
        $mol_memo.method
    ], $mol_view.prototype, "view_names", null);
    __decorate([
        $mol_mem
    ], $mol_view.prototype, "event_async", null);
    __decorate([
        $mol_mem_key
    ], $mol_view, "Root", null);
    __decorate([
        $mol_mem
    ], $mol_view, "roots", null);
    __decorate([
        $mol_mem
    ], $mol_view, "auto", null);
    __decorate([
        $mol_memo.method
    ], $mol_view, "view_classes", null);
    $.$mol_view = $mol_view;
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    class $mol_vector extends Array {
        get length() {
            return super.length;
        }
        constructor(...values) { super(...values); }
        map(convert, self) {
            return super.map(convert, self);
        }
        merged(patches, combine) {
            return this.map((value, index) => combine(value, patches[index]));
        }
        limited(limits) {
            return this.merged(limits, (value, [min, max]) => (value < min) ? min : (value > max) ? max : value);
        }
        added0(diff) {
            return this.map(value => value + diff);
        }
        added1(diff) {
            return this.merged(diff, (a, b) => a + b);
        }
        substracted1(diff) {
            return this.merged(diff, (a, b) => a - b);
        }
        multed0(mult) {
            return this.map(value => value * mult);
        }
        multed1(mults) {
            return this.merged(mults, (a, b) => a * b);
        }
        divided1(mults) {
            return this.merged(mults, (a, b) => a / b);
        }
        powered0(mult) {
            return this.map(value => value ** mult);
        }
        expanded1(point) {
            return this.merged(point, (range, value) => range.expanded0(value));
        }
        expanded2(point) {
            return this.merged(point, (range1, range2) => {
                let next = range1;
                const Range = range1.constructor;
                if (range1[0] > range2[0])
                    next = new Range(range2[0], next.max);
                if (range1[1] < range2[1])
                    next = new Range(next.min, range2[1]);
                return next;
            });
        }
        center() {
            const Result = this[0].constructor;
            return new Result(...this[0].map((_, i) => this.reduce((sum, point) => sum + point[i], 0) / this.length));
        }
        distance() {
            let distance = 0;
            for (let i = 1; i < this.length; ++i) {
                distance += this[i - 1].reduce((sum, min, j) => sum + (min - this[i][j]) ** 2, 0) ** (1 / this[i].length);
            }
            return distance;
        }
        transponed() {
            return this[0].map((_, i) => this.map(row => row[i]));
        }
        get x() { return this[0]; }
        set x(next) { this[0] = next; }
        get y() { return this[1]; }
        set y(next) { this[1] = next; }
        get z() { return this[2]; }
        set z(next) { this[2] = next; }
    }
    $.$mol_vector = $mol_vector;
    class $mol_vector_1d extends $mol_vector {
    }
    $.$mol_vector_1d = $mol_vector_1d;
    class $mol_vector_2d extends $mol_vector {
    }
    $.$mol_vector_2d = $mol_vector_2d;
    class $mol_vector_3d extends $mol_vector {
    }
    $.$mol_vector_3d = $mol_vector_3d;
    class $mol_vector_range extends $mol_vector {
        0;
        1;
        constructor(min, max = min) {
            super(min, max);
            this[0] = min;
            this[1] = max;
        }
        get min() { return this[0]; }
        set min(next) { this[0] = next; }
        get max() { return this[1]; }
        set max(next) { this[1] = next; }
        get inversed() {
            return new this.constructor(this.max, this.min);
        }
        expanded0(value) {
            const Range = this.constructor;
            let range = this;
            if (value > range.max)
                range = new Range(range.min, value);
            if (value < range.min)
                range = new Range(value, range.max);
            return range;
        }
    }
    $.$mol_vector_range = $mol_vector_range;
    $.$mol_vector_range_full = new $mol_vector_range(Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY);
    class $mol_vector_matrix extends $mol_vector {
        added2(diff) {
            return this.merged(diff, (a, b) => a.map((a2, index) => a2 + b[index]));
        }
        multed2(diff) {
            return this.merged(diff, (a, b) => a.map((a2, index) => a2 * b[index]));
        }
    }
    $.$mol_vector_matrix = $mol_vector_matrix;
})($ || ($ = {}));

;
	($.$mol_svg) = class $mol_svg extends ($.$mol_view) {
		dom_name(){
			return "svg";
		}
		dom_name_space(){
			return "http://www.w3.org/2000/svg";
		}
		font_size(){
			return 16;
		}
		font_family(){
			return "";
		}
		style_size(){
			return {};
		}
	};


;
"use strict";
var $;
(function ($) {
    /** State of time moment */
    class $mol_state_time extends $mol_object {
        static task(precision, reset) {
            if (precision) {
                return new $mol_after_timeout(precision, () => this.task(precision, null));
            }
            else {
                return new $mol_after_frame(() => this.task(precision, null));
            }
        }
        static now(precision) {
            this.task(precision);
            return Date.now();
        }
    }
    __decorate([
        $mol_mem_key
    ], $mol_state_time, "task", null);
    __decorate([
        $mol_mem_key
    ], $mol_state_time, "now", null);
    $.$mol_state_time = $mol_state_time;
})($ || ($ = {}));

;
"use strict";


;
"use strict";
var $;
(function ($) {
    var $$;
    (function ($$) {
        /** Base SVG component to display SVG images or icons. */
        class $mol_svg extends $.$mol_svg {
            computed_style() {
                const win = this.$.$mol_dom_context;
                const style = win.getComputedStyle(this.dom_node());
                if (!style['font-size'])
                    $mol_state_time.now(0);
                return style;
            }
            font_size() {
                return parseInt(this.computed_style()['font-size']) || 16;
            }
            font_family() {
                return this.computed_style()['font-family'];
            }
        }
        __decorate([
            $mol_mem
        ], $mol_svg.prototype, "computed_style", null);
        __decorate([
            $mol_mem
        ], $mol_svg.prototype, "font_size", null);
        __decorate([
            $mol_mem
        ], $mol_svg.prototype, "font_family", null);
        $$.$mol_svg = $mol_svg;
    })($$ = $.$$ || ($.$$ = {}));
})($ || ($ = {}));

;
	($.$mol_svg_root) = class $mol_svg_root extends ($.$mol_svg) {
		view_box(){
			return "0 0 100 100";
		}
		aspect(){
			return "xMidYMid";
		}
		dom_name(){
			return "svg";
		}
		attr(){
			return {
				...(super.attr()), 
				"viewBox": (this.view_box()), 
				"preserveAspectRatio": (this.aspect())
			};
		}
	};


;
"use strict";
var $;
(function ($) {
    $mol_style_attach("mol/svg/root/root.view.css", "[mol_svg_root] {\n\toverflow: hidden;\n}\n");
})($ || ($ = {}));

;
"use strict";


;
	($.$mol_svg_group) = class $mol_svg_group extends ($.$mol_svg) {
		dom_name(){
			return "g";
		}
	};


;
"use strict";


;
	($.$mol_svg_title) = class $mol_svg_title extends ($.$mol_svg) {
		dom_name(){
			return "title";
		}
		sub(){
			return [(this.title())];
		}
	};


;
"use strict";


;
	($.$mol_plot_graph) = class $mol_plot_graph extends ($.$mol_svg_group) {
		type(){
			return "solid";
		}
		color(){
			return "";
		}
		viewport_x(){
			const obj = new this.$.$mol_vector_range(Infinity, -Infinity);
			return obj;
		}
		viewport_y(){
			const obj = new this.$.$mol_vector_range(Infinity, -Infinity);
			return obj;
		}
		dimensions_pane_x(){
			const obj = new this.$.$mol_vector_range(Infinity, -Infinity);
			return obj;
		}
		dimensions_pane_y(){
			const obj = new this.$.$mol_vector_range(Infinity, -Infinity);
			return obj;
		}
		dimensions_x(){
			const obj = new this.$.$mol_vector_range(Infinity, -Infinity);
			return obj;
		}
		dimensions_y(){
			const obj = new this.$.$mol_vector_range(Infinity, -Infinity);
			return obj;
		}
		gap_x(){
			const obj = new this.$.$mol_vector_range(0, 0);
			return obj;
		}
		gap_y(){
			const obj = new this.$.$mol_vector_range(0, 0);
			return obj;
		}
		title(){
			return "";
		}
		hint(){
			return (this.title());
		}
		series_x(){
			return [];
		}
		series_y(){
			return [];
		}
		attr(){
			return {...(super.attr()), "mol_plot_graph_type": (this.type())};
		}
		style(){
			return {...(super.style()), "color": (this.color())};
		}
		viewport(){
			const obj = new this.$.$mol_vector_2d((this.viewport_x()), (this.viewport_y()));
			return obj;
		}
		shift(){
			return [0, 0];
		}
		scale(){
			return [1, 1];
		}
		cursor_position(){
			const obj = new this.$.$mol_vector_2d(NaN, NaN);
			return obj;
		}
		dimensions_pane(){
			const obj = new this.$.$mol_vector_2d((this.dimensions_pane_x()), (this.dimensions_pane_y()));
			return obj;
		}
		dimensions(){
			const obj = new this.$.$mol_vector_2d((this.dimensions_x()), (this.dimensions_y()));
			return obj;
		}
		size_real(){
			const obj = new this.$.$mol_vector_2d(0, 0);
			return obj;
		}
		gap(){
			const obj = new this.$.$mol_vector_2d((this.gap_x()), (this.gap_y()));
			return obj;
		}
		repos_x(id){
			return 0;
		}
		repos_y(id){
			return 0;
		}
		indexes(){
			return [];
		}
		points(){
			return [];
		}
		front(){
			return [];
		}
		back(){
			return [];
		}
		Hint(){
			const obj = new this.$.$mol_svg_title();
			(obj.title) = () => ((this.hint()));
			return obj;
		}
		hue(next){
			if(next !== undefined) return next;
			return +NaN;
		}
		Sample(){
			return null;
		}
	};
	($mol_mem(($.$mol_plot_graph.prototype), "viewport_x"));
	($mol_mem(($.$mol_plot_graph.prototype), "viewport_y"));
	($mol_mem(($.$mol_plot_graph.prototype), "dimensions_pane_x"));
	($mol_mem(($.$mol_plot_graph.prototype), "dimensions_pane_y"));
	($mol_mem(($.$mol_plot_graph.prototype), "dimensions_x"));
	($mol_mem(($.$mol_plot_graph.prototype), "dimensions_y"));
	($mol_mem(($.$mol_plot_graph.prototype), "gap_x"));
	($mol_mem(($.$mol_plot_graph.prototype), "gap_y"));
	($mol_mem(($.$mol_plot_graph.prototype), "viewport"));
	($mol_mem(($.$mol_plot_graph.prototype), "cursor_position"));
	($mol_mem(($.$mol_plot_graph.prototype), "dimensions_pane"));
	($mol_mem(($.$mol_plot_graph.prototype), "dimensions"));
	($mol_mem(($.$mol_plot_graph.prototype), "size_real"));
	($mol_mem(($.$mol_plot_graph.prototype), "gap"));
	($mol_mem(($.$mol_plot_graph.prototype), "Hint"));
	($mol_mem(($.$mol_plot_graph.prototype), "hue"));
	($.$mol_plot_graph_sample) = class $mol_plot_graph_sample extends ($.$mol_view) {
		type(){
			return "solid";
		}
		color(){
			return "black";
		}
		attr(){
			return {...(super.attr()), "mol_plot_graph_type": (this.type())};
		}
		style(){
			return {...(super.style()), "color": (this.color())};
		}
	};


;
"use strict";

;
"use strict";


;
"use strict";
var $;
(function ($) {
    var $$;
    (function ($$) {
        class $mol_plot_graph extends $.$mol_plot_graph {
            viewport() {
                const size = this.size_real();
                return new this.$.$mol_vector_2d(new this.$.$mol_vector_range(0, size.x), new this.$.$mol_vector_range(0, size.y));
            }
            indexes() {
                return this.series_x().map((_, i) => i);
            }
            repos_x(val) {
                return val;
            }
            repos_y(val) {
                return val;
            }
            points() {
                const [shift_x, shift_y] = this.shift();
                const [scale_x, scale_y] = this.scale();
                const series_x = this.series_x();
                const series_y = this.series_y();
                return this.indexes().map(index => {
                    let point_x = Math.round(shift_x + this.repos_x(series_x[index]) * scale_x);
                    let point_y = Math.round(shift_y + this.repos_y(series_y[index]) * scale_y);
                    point_x = Math.max(Number.MIN_SAFE_INTEGER, Math.min(point_x, Number.MAX_SAFE_INTEGER));
                    point_y = Math.max(Number.MIN_SAFE_INTEGER, Math.min(point_y, Number.MAX_SAFE_INTEGER));
                    return [point_x, point_y];
                });
            }
            series_x() {
                return this.series_y().map((val, index) => index);
            }
            dimensions() {
                let next = new this.$.$mol_vector_2d($mol_vector_range_full.inversed, $mol_vector_range_full.inversed);
                const series_x = this.series_x();
                const series_y = this.series_y();
                for (let i = 0; i < series_x.length; i++) {
                    if (series_x[i] > next.x.max)
                        next.x.max = this.repos_x(series_x[i]);
                    if (series_x[i] < next.x.min)
                        next.x.min = this.repos_x(series_x[i]);
                    if (series_y[i] > next.y.max)
                        next.y.max = this.repos_y(series_y[i]);
                    if (series_y[i] < next.y.min)
                        next.y.min = this.repos_y(series_y[i]);
                }
                return next;
            }
            color() {
                const hue = this.hue();
                return hue ? `hsl( ${hue} , 100% , 35% )` : '';
            }
            front() {
                return [this];
            }
        }
        __decorate([
            $mol_mem
        ], $mol_plot_graph.prototype, "indexes", null);
        __decorate([
            $mol_mem
        ], $mol_plot_graph.prototype, "series_x", null);
        __decorate([
            $mol_mem
        ], $mol_plot_graph.prototype, "dimensions", null);
        $$.$mol_plot_graph = $mol_plot_graph;
    })($$ = $.$$ || ($.$$ = {}));
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    $mol_style_attach("mol/plot/graph/graph.view.css", "[mol_plot_graph] {\n\tstroke: currentColor;\n}\n\n[mol_plot_graph_sample] {\n\tborder-width: 0;\n\tborder-style: solid;\n}\n\n[mol_plot_graph_type=\"dashed\"] {\n\tstroke-dasharray: 4 4;\n\tborder-style: dashed;\n}\n");
})($ || ($ = {}));

;
	($.$mol_svg_rect) = class $mol_svg_rect extends ($.$mol_svg) {
		width(){
			return "0";
		}
		height(){
			return "0";
		}
		pos_x(){
			return "";
		}
		pos_y(){
			return "";
		}
		dom_name(){
			return "rect";
		}
		pos(){
			return [];
		}
		attr(){
			return {
				...(super.attr()), 
				"width": (this.width()), 
				"height": (this.height()), 
				"x": (this.pos_x()), 
				"y": (this.pos_y())
			};
		}
	};


;
"use strict";


;
"use strict";
var $;
(function ($) {
    var $$;
    (function ($$) {
        class $mol_svg_rect extends $.$mol_svg_rect {
            pos_x() {
                return this.pos()[0];
            }
            pos_y() {
                return this.pos()[1];
            }
        }
        $$.$mol_svg_rect = $mol_svg_rect;
    })($$ = $.$$ || ($.$$ = {}));
})($ || ($ = {}));

;
	($.$mol_svg_path) = class $mol_svg_path extends ($.$mol_svg) {
		geometry(){
			return "";
		}
		dom_name(){
			return "path";
		}
		attr(){
			return {...(super.attr()), "d": (this.geometry())};
		}
	};


;
"use strict";


;
	($.$mol_svg_text) = class $mol_svg_text extends ($.$mol_svg) {
		pos_x(){
			return "";
		}
		pos_y(){
			return "";
		}
		align(){
			return "middle";
		}
		align_hor(){
			return (this.align());
		}
		align_vert(){
			return "baseline";
		}
		text(){
			return "";
		}
		dom_name(){
			return "text";
		}
		pos(){
			return [];
		}
		attr(){
			return {
				...(super.attr()), 
				"x": (this.pos_x()), 
				"y": (this.pos_y()), 
				"text-anchor": (this.align_hor()), 
				"alignment-baseline": (this.align_vert())
			};
		}
		sub(){
			return [(this.text())];
		}
	};


;
"use strict";


;
"use strict";
var $;
(function ($) {
    var $$;
    (function ($$) {
        class $mol_svg_text extends $.$mol_svg_text {
            pos_x() {
                return this.pos()[0];
            }
            pos_y() {
                return this.pos()[1];
            }
        }
        $$.$mol_svg_text = $mol_svg_text;
    })($$ = $.$$ || ($.$$ = {}));
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    $mol_style_attach("mol/svg/text/text.view.css", "[mol_svg_text] {\n\tfill: currentColor;\n\tstroke: none;\n}\n");
})($ || ($ = {}));

;
	($.$mol_plot_ruler) = class $mol_plot_ruler extends ($.$mol_plot_graph) {
		background_x(){
			return "0";
		}
		background_y(){
			return "0";
		}
		background_width(){
			return "100%";
		}
		background_height(){
			return "14";
		}
		Background(){
			const obj = new this.$.$mol_svg_rect();
			(obj.pos_x) = () => ((this.background_x()));
			(obj.pos_y) = () => ((this.background_y()));
			(obj.width) = () => ((this.background_width()));
			(obj.height) = () => ((this.background_height()));
			return obj;
		}
		curve(){
			return "";
		}
		Curve(){
			const obj = new this.$.$mol_svg_path();
			(obj.geometry) = () => ((this.curve()));
			return obj;
		}
		labels_formatted(){
			return [];
		}
		title_pos_x(){
			return "0";
		}
		title_pos_y(){
			return "100%";
		}
		title_align(){
			return "start";
		}
		Title(){
			const obj = new this.$.$mol_svg_text();
			(obj.pos_x) = () => ((this.title_pos_x()));
			(obj.pos_y) = () => ((this.title_pos_y()));
			(obj.align) = () => ((this.title_align()));
			(obj.text) = () => ((this.title()));
			return obj;
		}
		label_pos_x(id){
			return "";
		}
		label_pos_y(id){
			return "";
		}
		label_pos(id){
			return [(this.label_pos_x(id)), (this.label_pos_y(id))];
		}
		label_text(id){
			return "";
		}
		label_align(){
			return "";
		}
		step(){
			return 0;
		}
		scale_axis(){
			return 1;
		}
		scale_step(){
			return 1;
		}
		shift_axis(){
			return 1;
		}
		dimensions_axis(){
			const obj = new this.$.$mol_vector_range(Infinity, -Infinity);
			return obj;
		}
		viewport_axis(){
			const obj = new this.$.$mol_vector_range(Infinity, -Infinity);
			return obj;
		}
		axis_points(){
			return [];
		}
		normalize(next){
			if(next !== undefined) return next;
			return 0;
		}
		precision(){
			return 1;
		}
		sub(){
			return [
				(this.Background()), 
				(this.Curve()), 
				(this.labels_formatted()), 
				(this.Title())
			];
		}
		Label(id){
			const obj = new this.$.$mol_svg_text();
			(obj.pos) = () => ((this.label_pos(id)));
			(obj.text) = () => ((this.label_text(id)));
			(obj.align) = () => ((this.label_align()));
			return obj;
		}
	};
	($mol_mem(($.$mol_plot_ruler.prototype), "Background"));
	($mol_mem(($.$mol_plot_ruler.prototype), "Curve"));
	($mol_mem(($.$mol_plot_ruler.prototype), "Title"));
	($mol_mem(($.$mol_plot_ruler.prototype), "dimensions_axis"));
	($mol_mem(($.$mol_plot_ruler.prototype), "viewport_axis"));
	($mol_mem(($.$mol_plot_ruler.prototype), "normalize"));
	($mol_mem_key(($.$mol_plot_ruler.prototype), "Label"));


;
"use strict";
var $;
(function ($) {
    function $mol_math_round_expand(val, gap = 1) {
        if (val === 0)
            return 0;
        const val_abs = Math.abs(val);
        const val_sign = val ? Math.round(val / val_abs) : 0;
        const digits = Math.floor(Math.log(val_abs) / Math.log(10));
        const precission = Math.pow(10, digits - gap);
        const val_expanded = precission * Math.ceil(val_abs / precission);
        return val_sign * val_expanded;
    }
    $.$mol_math_round_expand = $mol_math_round_expand;
})($ || ($ = {}));

;
"use strict";


;
"use strict";
var $;
(function ($) {
    var $$;
    (function ($$) {
        class $mol_plot_ruler extends $.$mol_plot_ruler {
            labels_formatted() {
                return this.axis_points().map((point, index) => this.Label(index));
            }
            step() {
                const scale = Math.abs(this.scale_step());
                const dims = this.dimensions_axis();
                const range = dims.max - dims.min;
                const min_width = (Math.abs(Math.log10(range)) + 2) * 15;
                const size = $mol_math_round_expand(range, -1);
                const count = Math.max(1, Math.pow(10, Math.floor(Math.log(size * scale / min_width) / Math.log(10))));
                let step = size / count;
                const step_max = min_width * 2 / scale;
                if (step > step_max)
                    step /= 2;
                if (step > step_max)
                    step /= 2;
                return Math.max(step, Math.abs(dims.min) / 1e10, Math.abs(dims.max) / 1e10);
            }
            snap_to_grid(coord) {
                const viewport = this.viewport_axis();
                const scale = this.scale_axis();
                const shift = this.shift_axis();
                const step = this.step();
                const val = Math.round(coord / step) * step;
                if (scale == 0)
                    return val;
                const step_scaled = step * scale;
                const scaled = val * scale + shift;
                let count = 0;
                if (scaled < viewport.min)
                    count = (scaled - viewport.min) / step_scaled;
                if (scaled > viewport.max)
                    count = (scaled - viewport.max) / step_scaled;
                return val - Math.floor(count) * step;
            }
            axis_points() {
                const dims = this.dimensions_axis();
                const start = this.snap_to_grid(dims.min);
                const end = this.snap_to_grid(dims.max);
                const step = this.step();
                const next = [];
                for (let val = start; val <= end; val += step) {
                    next.push(val);
                }
                return next;
            }
            precision() {
                const step = this.step();
                return Math.max(0, Math.min(15, (step - Math.floor(step)).toString().length - 2));
            }
            label_text(index) {
                const point = this.axis_points()[index];
                return point.toFixed(this.precision());
            }
            font_size() {
                return this.Background().font_size();
            }
            back() {
                return [this.Curve()];
            }
            front() {
                return [
                    // this.Background(),
                    ...this.labels_formatted(),
                    this.Title()
                ];
            }
        }
        __decorate([
            $mol_mem
        ], $mol_plot_ruler.prototype, "step", null);
        __decorate([
            $mol_mem
        ], $mol_plot_ruler.prototype, "axis_points", null);
        __decorate([
            $mol_mem
        ], $mol_plot_ruler.prototype, "precision", null);
        $$.$mol_plot_ruler = $mol_plot_ruler;
    })($$ = $.$$ || ($.$$ = {}));
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    $mol_style_attach("mol/plot/ruler/ruler.view.css", "[mol_plot_ruler_curve] {\n\tcolor: var(--mol_theme_line);\n\tstroke-width: 1px;\n\tstroke: currentColor;\n}\n\n[mol_plot_ruler_label] {\n\tcolor: var(--mol_theme_text);\n\ttext-shadow: 0 -1px var(--mol_theme_back), 0px 1px var(--mol_theme_back);\n}\n\n[mol_plot_ruler_title] {\n\tcolor: var(--mol_theme_shade);\n\tbackground-color: var(--mol_theme_back);\n\ttext-shadow: 0 -1px var(--mol_theme_back), 0px 1px var(--mol_theme_back);\n}\n\n[mol_plot_ruler_background] {\n\tstroke: none;\n\tfill: var(--mol_theme_back);\n\topacity: 0.8;\n}\n");
})($ || ($ = {}));

;
	($.$mol_plot_ruler_hor) = class $mol_plot_ruler_hor extends ($.$mol_plot_ruler) {
		title_align(){
			return "start";
		}
		label_align(){
			return "middle";
		}
		title_pos_x(){
			return "0";
		}
		title_pos_y(){
			return "100%";
		}
		label_pos_y(id){
			return (this.title_pos_y());
		}
		background_width(){
			return "100%";
		}
	};


;
"use strict";


;
"use strict";
var $;
(function ($) {
    var $$;
    (function ($$) {
        class $mol_plot_ruler_hor extends $.$mol_plot_ruler_hor {
            dimensions_axis() {
                return this.dimensions_pane().x;
            }
            viewport_axis() {
                return new this.$.$mol_vector_range(0, this.size_real().x);
            }
            scale_axis() {
                return this.scale()[0];
            }
            scale_step() {
                return this.scale()[0];
            }
            shift_axis() {
                return this.shift()[0];
            }
            curve() {
                const [shift] = this.shift();
                const [scale] = this.scale();
                return this.axis_points().map(point => {
                    let scaled = Math.round(point * scale + shift);
                    scaled = Math.max(Number.MIN_SAFE_INTEGER, Math.min(scaled, Number.MAX_SAFE_INTEGER));
                    return `M ${scaled} 1000 V 0`;
                }).join(' ');
            }
            label_pos_x(index) {
                return (this.axis_points()[index] * this.scale()[0] + this.shift()[0]).toFixed(3);
            }
            background_y() {
                return String(this.size_real()[1] - this.font_size());
            }
            title_pos_y() {
                return String(this.size_real()[1]);
            }
            background_height() {
                return String(this.font_size());
            }
        }
        $$.$mol_plot_ruler_hor = $mol_plot_ruler_hor;
    })($$ = $.$$ || ($.$$ = {}));
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    $mol_style_attach("mol/plot/ruler/hor/hor.view.css", "[mol_plot_ruler_hor_label] {\n\ttransform: translateY( -4px );\n}\n\n[mol_plot_ruler_hor_title] {\n\ttransform: translateY( -4px );\n}\n");
})($ || ($ = {}));

;
	($.$mol_plot_ruler_vert) = class $mol_plot_ruler_vert extends ($.$mol_plot_ruler) {
		title_align(){
			return "end";
		}
		label_align(){
			return "end";
		}
		title_pos_y(){
			return "14";
		}
		label_pos_x(id){
			return (this.title_pos_x());
		}
		background_height(){
			return "100%";
		}
		background_width(){
			return (this.title_pos_x());
		}
	};


;
"use strict";


;
"use strict";
var $;
(function ($) {
    var $$;
    (function ($$) {
        class $mol_plot_ruler_vert extends $.$mol_plot_ruler_vert {
            dimensions_axis() {
                return this.dimensions_pane().y;
            }
            viewport_axis() {
                return new this.$.$mol_vector_range(0, this.size_real().y);
            }
            scale_axis() {
                return this.scale()[1];
            }
            scale_step() {
                return -this.scale()[1];
            }
            shift_axis() {
                return this.shift()[1];
            }
            curve() {
                const [, shift] = this.shift();
                const [, scale] = this.scale();
                return this.axis_points().map(point => {
                    let scaled = Math.round(point * scale + shift);
                    scaled = Math.max(Number.MIN_SAFE_INTEGER, Math.min(scaled, Number.MAX_SAFE_INTEGER));
                    return `M 0 ${scaled} H 2000`;
                }).join(' ');
            }
            title_pos_x() {
                return String(this.gap().x.min);
            }
            label_pos_y(index) {
                return (this.axis_points()[index] * this.scale()[1] + this.shift()[1]).toFixed(3);
            }
        }
        $$.$mol_plot_ruler_vert = $mol_plot_ruler_vert;
    })($$ = $.$$ || ($.$$ = {}));
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    $mol_style_attach("mol/plot/ruler/vert/vert.view.css", "[mol_plot_ruler_vert_label] {\n\ttransform: translateY( 4px );\n}\n");
})($ || ($ = {}));

;
	($.$bog_vmap_scene_grid) = class $bog_vmap_scene_grid extends ($.$mol_svg_root) {
		rulers(){
			return [];
		}
		aspect(){
			return "none";
		}
		shift(){
			const obj = new this.$.$mol_vector_2d(0, 0);
			return obj;
		}
		scale(){
			const obj = new this.$.$mol_vector_2d(1, 1);
			return obj;
		}
		sub(){
			return (this.rulers());
		}
		Ruler_hor(){
			const obj = new this.$.$bog_vmap_scene_grid_hor();
			(obj.title) = () => ("");
			return obj;
		}
		Ruler_vert(){
			const obj = new this.$.$bog_vmap_scene_grid_vert();
			(obj.title) = () => ("");
			return obj;
		}
	};
	($mol_mem(($.$bog_vmap_scene_grid.prototype), "shift"));
	($mol_mem(($.$bog_vmap_scene_grid.prototype), "scale"));
	($mol_mem(($.$bog_vmap_scene_grid.prototype), "Ruler_hor"));
	($mol_mem(($.$bog_vmap_scene_grid.prototype), "Ruler_vert"));
	($.$bog_vmap_scene_grid_hor) = class $bog_vmap_scene_grid_hor extends ($.$mol_plot_ruler_hor) {
		title(){
			return "";
		}
	};
	($.$bog_vmap_scene_grid_vert) = class $bog_vmap_scene_grid_vert extends ($.$mol_plot_ruler_vert) {
		title(){
			return "";
		}
	};


;
"use strict";


;
"use strict";
var $;
(function ($) {
    var $$;
    (function ($$) {
        class $bog_vmap_scene_grid extends $.$bog_vmap_scene_grid {
            size_real() {
                const rect = this.view_rect();
                if (!rect)
                    return new this.$.$mol_vector_2d(1, 1);
                return new this.$.$mol_vector_2d(rect.width, rect.height);
            }
            view_box() {
                const size = this.size_real();
                return `0 0 ${size.x} ${size.y}`;
            }
            viewport() {
                const size = this.size_real();
                return new this.$.$mol_vector_2d(new this.$.$mol_vector_range(0, size.x), new this.$.$mol_vector_range(0, size.y));
            }
            gap() {
                return new this.$.$mol_vector_2d(new this.$.$mol_vector_range(0, 0), new this.$.$mol_vector_range(0, 0));
            }
            dimensions_viewport() {
                const shift = this.shift().multed0(-1);
                const scale = this.scale().powered0(-1);
                return this.viewport().map((range, index) => range.added0(shift[index]).multed0(scale[index]).sort((a, b) => a - b));
            }
            rulers() {
                const rulers = [this.Ruler_hor(), this.Ruler_vert()];
                for (const ruler of rulers) {
                    ruler.shift = () => this.shift();
                    ruler.scale = () => this.scale();
                    ruler.size_real = () => this.size_real();
                    ruler.viewport = () => this.viewport();
                    ruler.gap = () => this.gap();
                    ruler.dimensions_pane = () => this.dimensions_viewport();
                }
                return rulers.flatMap(ruler => ruler.back());
            }
        }
        __decorate([
            $mol_mem
        ], $bog_vmap_scene_grid.prototype, "size_real", null);
        __decorate([
            $mol_mem
        ], $bog_vmap_scene_grid.prototype, "dimensions_viewport", null);
        __decorate([
            $mol_mem
        ], $bog_vmap_scene_grid.prototype, "rulers", null);
        $$.$bog_vmap_scene_grid = $bog_vmap_scene_grid;
        class $bog_vmap_scene_grid_hor extends $.$bog_vmap_scene_grid_hor {
            curve() {
                const [shift] = this.shift();
                const [scale] = this.scale();
                const height = Math.ceil(this.size_real()[1]);
                return this.axis_points().map(point => {
                    const pos = Math.round(point * scale + shift);
                    return `M ${pos} ${height} V 0`;
                }).join(' ');
            }
        }
        $$.$bog_vmap_scene_grid_hor = $bog_vmap_scene_grid_hor;
        class $bog_vmap_scene_grid_vert extends $.$bog_vmap_scene_grid_vert {
            curve() {
                const [, shift] = this.shift();
                const [, scale] = this.scale();
                const width = Math.ceil(this.size_real()[0]);
                return this.axis_points().map(point => {
                    const pos = Math.round(point * scale + shift);
                    return `M 0 ${pos} H ${width}`;
                }).join(' ');
            }
        }
        $$.$bog_vmap_scene_grid_vert = $bog_vmap_scene_grid_vert;
    })($$ = $.$$ || ($.$$ = {}));
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    /** Plugin is component without its own DOM element, but instead uses the owner DOM element */
    class $mol_plugin extends $mol_view {
        dom_node_external(next) {
            return next ?? $mol_owning_get(this).host.dom_node();
        }
        render() {
            this.dom_node_actual();
        }
    }
    $.$mol_plugin = $mol_plugin;
})($ || ($ = {}));

;
	($.$bog_vmap_scene) = class $bog_vmap_scene extends ($.$mol_view) {
		grid_shift(){
			const obj = new this.$.$mol_vector_2d(0, 0);
			return obj;
		}
		grid_scale(){
			const obj = new this.$.$mol_vector_2d(1, 1);
			return obj;
		}
		Grid(){
			const obj = new this.$.$bog_vmap_scene_grid();
			(obj.shift) = () => ((this.grid_shift()));
			(obj.scale) = () => ((this.grid_scale()));
			return obj;
		}
		camera_transform(){
			return "none";
		}
		stage(){
			return [];
		}
		Stage(){
			const obj = new this.$.$mol_view();
			(obj.style) = () => ({"transform": (this.camera_transform())});
			(obj.sub) = () => ((this.stage()));
			return obj;
		}
		pack_note(){
			return "";
		}
		sub(){
			return [(this.Grid()), (this.Stage())];
		}
		Wait(){
			const obj = new this.$.$mol_view();
			(obj.sub) = () => ([(this.pack_note())]);
			return obj;
		}
	};
	($mol_mem(($.$bog_vmap_scene.prototype), "grid_shift"));
	($mol_mem(($.$bog_vmap_scene.prototype), "grid_scale"));
	($mol_mem(($.$bog_vmap_scene.prototype), "Grid"));
	($mol_mem(($.$bog_vmap_scene.prototype), "Stage"));
	($mol_mem(($.$bog_vmap_scene.prototype), "Wait"));


;
"use strict";
var $;
(function ($) {
    function $bog_vmap_scene_cull(spots, sizes, view, slack, names) {
        const left = view.x - slack;
        const top = view.y - slack;
        const right = view.x + view.width + slack;
        const bottom = view.y + view.height + slack;
        const shown = new Set();
        for (const name of names) {
            const size = sizes[name];
            const spot = spots[name];
            if (!size && !spot) {
                shown.add(name);
                continue;
            }
            const x = spot ? spot.x : size.x;
            const y = spot ? spot.y : size.y;
            const width = size ? size.width : 0;
            const height = size ? size.height : 0;
            if (x > right)
                continue;
            if (y > bottom)
                continue;
            if (x + width < left)
                continue;
            if (y + height < top)
                continue;
            shown.add(name);
        }
        return shown;
    }
    $.$bog_vmap_scene_cull = $bog_vmap_scene_cull;
    function $bog_vmap_scene_cull_viewport(camera, screen) {
        const zoom = camera.zoom > 0 ? camera.zoom : 1;
        return {
            x: camera.x,
            y: camera.y,
            width: screen.width / zoom,
            height: screen.height / zoom,
        };
    }
    $.$bog_vmap_scene_cull_viewport = $bog_vmap_scene_cull_viewport;
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    $.$bog_vmap_bridge_ns = 'bog_vmap';
    /** Puts a message on the wire. Target is the peer window. */
    function $bog_vmap_bridge_send(target, message) {
        target.postMessage({ ns: $.$bog_vmap_bridge_ns, ...message }, '*');
    }
    $.$bog_vmap_bridge_send = $bog_vmap_bridge_send;
    function $bog_vmap_bridge_read(event, peer) {
        if (arguments.length > 1 && event.source !== peer)
            return null;
        const data = event.data;
        if (!data || typeof data !== 'object')
            return null;
        const record = data;
        if (record.ns !== $.$bog_vmap_bridge_ns)
            return null;
        if (typeof record.kind !== 'string')
            return null;
        return data;
    }
    $.$bog_vmap_bridge_read = $bog_vmap_bridge_read;
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    /** Dynamic sources import. */
    class $mol_import extends $mol_object2 {
        static module(uri) {
            $mol_wire_solid();
            return $mol_wire_sync(this).module_async(uri);
        }
        static module_async(uri) {
            return import(uri);
        }
        static script(uri) {
            $mol_wire_solid();
            return $mol_wire_sync(this).script_async(uri);
        }
        static script_async(uri) {
            const doc = $mol_dom_context.document;
            const script = doc.createElement('script');
            script.src = uri;
            doc.head.appendChild(script);
            return new Promise((done, fail) => {
                script.onload = () => done($mol_dom_context);
                script.onerror = () => fail(new Error(`Can not import ${uri}`));
            });
        }
        static style(uri) {
            return $mol_wire_sync(this).style_async(uri);
        }
        static style_async(uri) {
            const doc = $mol_dom_context.document;
            const style = doc.createElement('link');
            style.rel = 'stylesheet';
            style.href = uri;
            doc.head.appendChild(style);
            return new Promise((done, fail) => {
                style.onload = () => done(style.sheet);
                style.onerror = () => fail(new Error(`Can not import ${uri}`));
            });
        }
    }
    __decorate([
        $mol_mem_key
    ], $mol_import, "module", null);
    __decorate([
        $mol_mem_key
    ], $mol_import, "script", null);
    __decorate([
        $mol_mem_key
    ], $mol_import, "style", null);
    $.$mol_import = $mol_import;
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    class $mol_view_tree2_error extends Error {
        spans;
        constructor(message, spans) {
            super(message);
            this.spans = spans;
        }
        toJSON() {
            return {
                message: this.message,
                spans: this.spans
            };
        }
    }
    $.$mol_view_tree2_error = $mol_view_tree2_error;
    class $mol_view_tree2_error_suggestions {
        suggestions;
        constructor(suggestions) {
            this.suggestions = suggestions;
        }
        toString() {
            return this.suggestions.map(suggestion => `\`${suggestion}\``).join(', ');
        }
        toJSON() {
            return this.suggestions;
        }
    }
    $.$mol_view_tree2_error_suggestions = $mol_view_tree2_error_suggestions;
    function $mol_view_tree2_error_str(strings, ...parts) {
        const spans = [];
        for (const part of parts) {
            if (part instanceof $mol_span)
                spans.push(part);
            if (Array.isArray(part) && part.length > 0 && part[0] instanceof $mol_span)
                spans.push(...part);
        }
        return new $mol_view_tree2_error(join(strings, parts), spans);
    }
    $.$mol_view_tree2_error_str = $mol_view_tree2_error_str;
    function join(strings, objects) {
        let result = '';
        let obj_pos = 0;
        let obj_len = objects.length;
        for (const str of strings) {
            result += str;
            if (obj_pos < obj_len) {
                const obj = objects[obj_pos++];
                if (Array.isArray(obj))
                    result += obj.map(item => `\`${item}\``).join(', ');
                else
                    result += `\`${String(obj)}\``;
            }
        }
        return result;
    }
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    function $mol_view_tree2_child(tree) {
        if (tree.kids.length === 0) {
            return this.$mol_fail($mol_view_tree2_error_str `Required one child at ${tree.span}`);
        }
        if (tree.kids.length > 1) {
            return this.$mol_fail($mol_view_tree2_error_str `Should be only one child at ${tree.span}`);
        }
        return tree.kids[0];
    }
    $.$mol_view_tree2_child = $mol_view_tree2_child;
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    function $mol_view_tree2_classes(defs) {
        return defs.clone(defs.hack({
            '-': () => []
        }));
    }
    $.$mol_view_tree2_classes = $mol_view_tree2_classes;
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    function $mol_view_tree2_normalize(defs) {
        return defs.clone($mol_view_tree2_classes(defs).kids.map(cl => cl.clone([
            this.$mol_view_tree2_class_super(cl).clone(this.$mol_view_tree2_class_props(cl))
        ])));
    }
    $.$mol_view_tree2_normalize = $mol_view_tree2_normalize;
})($ || ($ = {}));

;
"use strict";

;
"use strict";

;
"use strict";

;
"use strict";

;
"use strict";
var $;
(function ($) {
    let x = /x/[Symbol.matchAll];
    /** Type safe reguar expression builder */
    class $mol_regexp extends RegExp {
        groups;
        /** Prefer to use $mol_regexp.from */
        constructor(source, flags = 'gsu', groups = []) {
            super(source, flags);
            this.groups = groups;
        }
        *[Symbol.matchAll](str) {
            const index = this.lastIndex;
            this.lastIndex = 0;
            try {
                while (this.lastIndex < str.length) {
                    const found = this.exec(str);
                    if (!found)
                        break;
                    yield found;
                }
            }
            finally {
                this.lastIndex = index;
            }
        }
        /** Parses input and returns found capture groups or null */
        [Symbol.match](str) {
            const res = [...this[Symbol.matchAll](str)].filter(r => r.groups).map(r => r[0]);
            if (!res.length)
                return null;
            return res;
        }
        /** Splits string by regexp edges */
        [Symbol.split](str) {
            const res = [];
            let token_last = null;
            for (let token of this[Symbol.matchAll](str)) {
                if (token.groups && (token_last ? token_last.groups : true))
                    res.push('');
                res.push(token[0]);
                token_last = token;
            }
            if (!res.length)
                res.push('');
            return res;
        }
        test(str) {
            return Boolean(str.match(this));
        }
        exec(str) {
            const from = this.lastIndex;
            if (from >= str.length)
                return null;
            const res = super.exec(str);
            if (res === null) {
                this.lastIndex = str.length;
                if (!str)
                    return null;
                return Object.assign([str.slice(from)], {
                    index: from,
                    input: str,
                });
            }
            if (from === this.lastIndex) {
                $mol_fail(new Error('Captured empty substring'));
            }
            const groups = {};
            const skipped = str.slice(from, this.lastIndex - res[0].length);
            if (skipped) {
                this.lastIndex = this.lastIndex - res[0].length;
                return Object.assign([skipped], {
                    index: from,
                    input: res.input,
                });
            }
            for (let i = 0; i < this.groups.length; ++i) {
                const group = this.groups[i];
                groups[group] = groups[group] || res[i + 1] || '';
            }
            return Object.assign(res, { groups });
        }
        generate(params) {
            return null;
        }
        get native() {
            return new RegExp(this.source, this.flags);
        }
        /** Makes regexp that greedy repeats this pattern with delimiter */
        static separated(chunk, sep) {
            return $mol_regexp.from([
                $mol_regexp.repeat_greedy([[chunk], sep], 0),
                chunk,
            ]);
        }
        /** Makes regexp that non-greedy repeats this pattern from min to max count */
        static repeat(source, min = 0, max = Number.POSITIVE_INFINITY) {
            const regexp = $mol_regexp.from(source);
            const upper = Number.isFinite(max) ? max : '';
            const str = `(?:${regexp.source}){${min},${upper}}?`;
            const regexp2 = new $mol_regexp(str, regexp.flags, regexp.groups);
            regexp2.generate = params => {
                const res = regexp.generate(params);
                if (res)
                    return res;
                if (min > 0)
                    return res;
                return '';
            };
            return regexp2;
        }
        /** Makes regexp that greedy repeats this pattern from min to max count */
        static repeat_greedy(source, min = 0, max = Number.POSITIVE_INFINITY) {
            const regexp = $mol_regexp.from(source);
            const upper = Number.isFinite(max) ? max : '';
            const str = `(?:${regexp.source}){${min},${upper}}`;
            const regexp2 = new $mol_regexp(str, regexp.flags, regexp.groups);
            regexp2.generate = params => {
                const res = regexp.generate(params);
                if (res)
                    return res;
                if (min > 0)
                    return res;
                return '';
            };
            return regexp2;
        }
        /** Makes regexp that match any of options */
        static vary(sources, flags = 'gsu') {
            const groups = [];
            const chunks = sources.map(source => {
                const regexp = $mol_regexp.from(source);
                groups.push(...regexp.groups);
                return regexp.source;
            });
            return new $mol_regexp(`(?:${chunks.join('|')})`, flags, groups);
        }
        /** Makes regexp that allow absent of this pattern */
        static optional(source) {
            return $mol_regexp.repeat_greedy(source, 0, 1);
        }
        /** Makes regexp that look ahead for pattern */
        static force_after(source) {
            const regexp = $mol_regexp.from(source);
            return new $mol_regexp(`(?=${regexp.source})`, regexp.flags, regexp.groups);
        }
        /** Makes regexp that look ahead for pattern */
        static forbid_after(source) {
            const regexp = $mol_regexp.from(source);
            return new $mol_regexp(`(?!${regexp.source})`, regexp.flags, regexp.groups);
        }
        /** Converts some js values to regexp */
        static from(source, { ignoreCase, multiline } = {
            ignoreCase: false,
            multiline: false,
        }) {
            let flags = 'gsu';
            if (multiline)
                flags += 'm';
            if (ignoreCase)
                flags += 'i';
            if (typeof source === 'number') {
                const src = `\\u{${source.toString(16)}}`;
                const regexp = new $mol_regexp(src, flags);
                regexp.generate = () => src;
                return regexp;
            }
            if (typeof source === 'string') {
                const src = source.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                const regexp = new $mol_regexp(src, flags);
                regexp.generate = () => source;
                return regexp;
            }
            else if (source instanceof $mol_regexp) {
                const regexp = new $mol_regexp(source.source, flags, source.groups);
                regexp.generate = params => source.generate(params);
                return regexp;
            }
            if (source instanceof RegExp) {
                const test = new RegExp('|' + source.source);
                const groups = Array.from({ length: test.exec('').length - 1 }, (_, i) => String(i + 1));
                const regexp = new $mol_regexp(source.source, source.flags, groups);
                regexp.generate = () => '';
                return regexp;
            }
            if (Array.isArray(source)) {
                const patterns = source.map(src => Array.isArray(src)
                    ? $mol_regexp.optional(src)
                    : $mol_regexp.from(src));
                const chunks = patterns.map(pattern => pattern.source);
                const groups = [];
                let index = 0;
                for (const pattern of patterns) {
                    for (let group of pattern.groups) {
                        if (Number(group) >= 0) {
                            groups.push(String(index++));
                        }
                        else {
                            groups.push(group);
                        }
                    }
                }
                const regexp = new $mol_regexp(chunks.join(''), flags, groups);
                regexp.generate = params => {
                    let res = '';
                    for (const pattern of patterns) {
                        let sub = pattern.generate(params);
                        if (sub === null)
                            return '';
                        res += sub;
                    }
                    return res;
                };
                return regexp;
            }
            else {
                const groups = [];
                const chunks = Object.keys(source).map(name => {
                    groups.push(name);
                    const regexp = $mol_regexp.from(source[name]);
                    groups.push(...regexp.groups);
                    return `(${regexp.source})`;
                });
                const regexp = new $mol_regexp(`(?:${chunks.join('|')})`, flags, groups);
                const validator = new RegExp('^' + regexp.source + '$', flags);
                regexp.generate = (params) => {
                    for (let option in source) {
                        if (option in params) {
                            if (typeof params[option] === 'boolean') {
                                if (!params[option])
                                    continue;
                            }
                            else {
                                const str = String(params[option]);
                                if (str.match(validator))
                                    return str;
                                $mol_fail(new Error(`Wrong param: ${option}=${str}`));
                            }
                        }
                        else {
                            if (typeof source[option] !== 'object')
                                continue;
                        }
                        const res = $mol_regexp.from(source[option]).generate(params);
                        if (res)
                            return res;
                    }
                    return null;
                };
                return regexp;
            }
        }
        /** Makes regexp which includes only unicode category */
        static unicode_only(...category) {
            return new $mol_regexp(`\\p{${category.join('=')}}`);
        }
        /** Makes regexp which excludes unicode category */
        static unicode_except(...category) {
            return new $mol_regexp(`\\P{${category.join('=')}}`);
        }
        static char_range(from, to) {
            return new $mol_regexp(`${$mol_regexp.from(from).source}-${$mol_regexp.from(to).source}`);
        }
        static char_only(...allowed) {
            const regexp = allowed.map(f => $mol_regexp.from(f).source).join('');
            return new $mol_regexp(`[${regexp}]`);
        }
        static char_except(...forbidden) {
            const regexp = forbidden.map(f => $mol_regexp.from(f).source).join('');
            return new $mol_regexp(`[^${regexp}]`);
        }
        static decimal_only = $mol_regexp.from(/\d/gsu);
        static decimal_except = $mol_regexp.from(/\D/gsu);
        static latin_only = $mol_regexp.from(/\w/gsu);
        static latin_except = $mol_regexp.from(/\W/gsu);
        static space_only = $mol_regexp.from(/\s/gsu);
        static space_except = $mol_regexp.from(/\S/gsu);
        static word_break_only = $mol_regexp.from(/\b/gsu);
        static word_break_except = $mol_regexp.from(/\B/gsu);
        static tab = $mol_regexp.from(/\t/gsu);
        static slash_back = $mol_regexp.from(/\\/gsu);
        static nul = $mol_regexp.from(/\0/gsu);
        static char_any = $mol_regexp.from(/./gsu);
        static begin = $mol_regexp.from(/^/gsu);
        static end = $mol_regexp.from(/$/gsu);
        static or = $mol_regexp.from(/|/gsu);
        static line_end = $mol_regexp.from({
            win_end: [['\r'], '\n'],
            mac_end: '\r',
        });
    }
    $.$mol_regexp = $mol_regexp;
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    const { begin, end, latin_only, or, optional, repeat_greedy } = $mol_regexp;
    $.$mol_view_tree2_prop_signature = $mol_regexp.from([
        begin,
        { name: repeat_greedy(latin_only, 1) },
        { key: optional(['*', repeat_greedy(latin_only, 0)]) },
        { next: optional(['?', repeat_greedy(latin_only, 0)]) },
        end,
    ]);
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    function $mol_view_tree2_prop_parts(prop) {
        const groups = [...prop.type.matchAll($mol_view_tree2_prop_signature)][0]?.groups;
        if (!groups) {
            this.$mol_fail($mol_view_tree2_error_str `Required prop like some*? at ${prop.span}`);
        }
        return {
            name: groups.name,
            key: groups.key,
            next: groups.next ? '?' : ''
        };
    }
    $.$mol_view_tree2_prop_parts = $mol_view_tree2_prop_parts;
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    const regular_regex = /^\w+$/;
    function $mol_view_tree2_prop_quote(name) {
        if (regular_regex.test(name.value))
            return name;
        return name.data(JSON.stringify(name.value));
    }
    $.$mol_view_tree2_prop_quote = $mol_view_tree2_prop_quote;
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    const class_regex = /^[$A-Z][$\w<>\[\]()"'?|,]+$/;
    function $mol_view_tree2_class_match(klass) {
        if (!klass?.type)
            return false;
        if (klass.type === 'NaN' || klass.type === 'Infinity')
            return false;
        return class_regex.test(klass.type);
    }
    $.$mol_view_tree2_class_match = $mol_view_tree2_class_match;
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    const err = $mol_view_tree2_error_str;
    function $mol_view_tree2_class_super(klass) {
        if (!$mol_view_tree2_class_match(klass))
            return this.$mol_fail(err `Wrong class name at ${klass.span}`);
        const superclass = klass.kids.length === 1 ? klass.kids[0] : undefined;
        if (!superclass)
            return this.$mol_fail(err `No super class at ${klass.span}`);
        if (!$mol_view_tree2_class_match(superclass))
            return this.$mol_fail(err `Wrong super class name ${JSON.stringify(superclass.type).replace(/(^"|"$)/g, "")} at ${superclass.span}`);
        return superclass;
    }
    $.$mol_view_tree2_class_super = $mol_view_tree2_class_super;
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    const err = $mol_view_tree2_error_str;
    const is_writable = (input) => input.type.includes('?');
    function $mol_view_tree2_class_props(klass) {
        let props = this.$mol_view_tree2_class_super(klass);
        // ! syntax to * and ?val syntax to ?
        props = props.clone(props.hack({
            '': (node, belt) => {
                const next = node.type.indexOf('?');
                const id = node.type.indexOf('!');
                let normal = node.type;
                const ch = node.type[id + 1];
                if (id !== -1 && ch?.toUpperCase() !== ch?.toLowerCase())
                    normal = `${normal.substring(0, id)}*${next === -1 ? '' : '?'}`;
                else if (next !== -1)
                    normal = normal.substring(0, next + 1);
                if (node.type === normal)
                    return [node.clone(node.hack(belt))];
                console.warn(`Syntax ${node.type} at ${node.span} is deprecated. Use ${normal} instead`);
                return [node.struct(normal, node.hack(belt))];
            }
        }));
        const props_inner = {};
        const add_inner = (prop) => {
            const { name } = this.$mol_view_tree2_prop_parts(prop);
            const prev = props_inner[name];
            if (prev && prev.kids[0]?.toString() !== prop.kids[0]?.toString()) {
                this.$mol_fail(err `Need an equal default values at ${prev.span} vs ${prop.span}`);
            }
            props_inner[name] = prop;
        };
        const upper = (operator, belt, context) => {
            const prop = this.$mol_view_tree2_child(operator);
            const defs = prop.hack(belt, { factory: prop });
            if (defs.length)
                add_inner(prop.clone(defs));
            return [operator.clone([prop.clone([])])];
        };
        const props_root = props.hack({
            '<=': upper,
            '<=>': upper,
            '^': (operator, belt, context) => {
                if (operator.kids.length === 0)
                    return [operator];
                return upper(operator, belt, context);
            },
            '': (left, belt, context) => {
                let right;
                const operator = left.kids[0];
                if (operator?.type === '=>' && context.factory) {
                    right = operator.kids[0];
                    if (!right)
                        this.$mol_fail(err `Need a child ${operator.span}`);
                    if (!context.factory)
                        this.$mol_fail(err `Need a parent ${left.span}`);
                    if (is_writable(left) !== is_writable(right))
                        this.$mol_fail(err `Left and right operands are not compatible at ${operator.span}`);
                    add_inner(right.clone([
                        right.struct('=', [
                            context.factory.struct(context.factory.type.replace(/\*.*/, '*'), [left.clone([])]),
                        ]),
                    ]));
                }
                else if (operator?.type === "<=>") {
                    const right = operator.kids[0];
                    if (!right)
                        this.$mol_fail(err `Need a child ${operator.span}`);
                    if (!is_writable(left))
                        this.$mol_fail(err `Expected writable at ${left.span}`);
                    if (!is_writable(right))
                        this.$mol_fail(err `Expected writable at ${right.span}`);
                }
                else if (context.factory && operator?.type === "<=" && is_writable(left)) {
                    this.$mol_fail(err `Expected readonly at ${left.span}`);
                }
                if (right)
                    context = { factory: right.clone([]) };
                else if (operator && !context.factory && $mol_view_tree2_class_match(operator)) {
                    context = { factory: left.clone([]) };
                }
                const hacked = left.clone(left.hack(belt, context));
                return [hacked];
            }
        }, { factory: undefined });
        for (const prop of props_root)
            add_inner(prop);
        return Object.values(props_inner);
    }
    $.$mol_view_tree2_class_props = $mol_view_tree2_class_props;
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    /**
     * Decorates method to fiber to ensure it is executed only once inside other fiber from [mol_wire](../wire/README.md)
     * @see https://mol.hyoo.ru/#!section=docs/=1fcpsq_1wh0h2
     */
    $.$mol_action = $mol_wire_method;
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    function $bog_vmap_lang_token(token, role) {
        const parts = [...token.matchAll($mol_view_tree2_prop_signature)][0]?.groups;
        if (!parts || parts.name !== token)
            this.$mol_fail(new Error(`${role} must be a bare name, got ${JSON.stringify(token)}`));
        return token;
    }
    $.$bog_vmap_lang_token = $bog_vmap_lang_token;
    function $bog_vmap_lang_class_ok(name) {
        return /^\$[a-z][a-z0-9]*(_[a-z0-9]+)+$/.test(name);
    }
    $.$bog_vmap_lang_class_ok = $bog_vmap_lang_class_ok;
    function $bog_vmap_lang_attr(klass) {
        return klass.replace(/\$/g, '').toLowerCase();
    }
    $.$bog_vmap_lang_attr = $bog_vmap_lang_attr;
    function $bog_vmap_lang_quoted(text) {
        return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
    function $bog_vmap_lang_css_rename(css, from, to) {
        if (!css || from === to)
            return css;
        const head = $bog_vmap_lang_attr(from);
        if (!head)
            return css;
        return css.replace(new RegExp('\\[' + $bog_vmap_lang_quoted(head) + '(?=[\\]_=~^*|$\\s])', 'g'), '[' + $bog_vmap_lang_attr(to));
    }
    $.$bog_vmap_lang_css_rename = $bog_vmap_lang_css_rename;
    function $bog_vmap_lang_js_rename(js, from, to) {
        if (!js || from === to)
            return js;
        return js.replace(new RegExp('([^\\w$]|^)' + $bog_vmap_lang_quoted(from) + '(?![\\w])', 'g'), (_all, before) => before + to);
    }
    $.$bog_vmap_lang_js_rename = $bog_vmap_lang_js_rename;
    function $bog_vmap_lang_wire_tree(wire) {
        const sign = wire.bidi ? '?' : '';
        const name = this.$bog_vmap_lang_token(wire.name, 'Wire name') + sign;
        const node = this.$bog_vmap_lang_token(wire.node, 'Wire node');
        const prop = this.$bog_vmap_lang_token(wire.prop, 'Wire prop') + sign;
        return $mol_tree2.struct(name, [
            $mol_tree2.struct('=', [
                $mol_tree2.struct(node, [
                    $mol_tree2.struct(prop),
                ]),
            ]),
        ]);
    }
    $.$bog_vmap_lang_wire_tree = $bog_vmap_lang_wire_tree;
    function $bog_vmap_lang_ref_tree(name) {
        return $mol_tree2.struct('<=', [
            $mol_tree2.struct(this.$bog_vmap_lang_token(name, 'Reference')),
        ]);
    }
    $.$bog_vmap_lang_ref_tree = $bog_vmap_lang_ref_tree;
    function $bog_vmap_lang_part_tree(name, klass) {
        const base = $mol_tree2.struct(klass);
        if (!$mol_view_tree2_class_match(base))
            this.$mol_fail(new Error(`Part class must be a class name, got ${JSON.stringify(klass)}`));
        return $mol_tree2.struct(this.$bog_vmap_lang_token(name, 'Part name'), [base]);
    }
    $.$bog_vmap_lang_part_tree = $bog_vmap_lang_part_tree;
    function $bog_vmap_lang_dict_get(dict, key) {
        if (dict?.type !== '*')
            return null;
        const found = dict.kids.find(kid => kid.type === key);
        return found?.kids[0] ?? null;
    }
    $.$bog_vmap_lang_dict_get = $bog_vmap_lang_dict_get;
    function $bog_vmap_lang_dict_set(dict, key, value) {
        const name = this.$bog_vmap_lang_token(key, 'Dictionary key');
        if (!value)
            return dict.clone(dict.kids.filter(kid => kid.type !== name));
        const entry = dict.struct(name, [value]);
        if (!dict.kids.some(kid => kid.type === name)) {
            return dict.clone([...dict.kids, entry]);
        }
        return dict.clone(dict.kids.map(kid => kid.type === name ? entry : kid));
    }
    $.$bog_vmap_lang_dict_set = $bog_vmap_lang_dict_set;
    function $bog_vmap_lang_sorted(defs) {
        const by_name = new Map();
        for (const def of defs)
            by_name.set(def.type, def);
        const sorted = [];
        const done = new Set();
        const path = new Set();
        const walk = (def) => {
            if (done.has(def.type))
                return;
            if (path.has(def.type))
                this.$mol_fail(new Error(`Circular inheritance around ${def.type}`));
            path.add(def.type);
            const base = by_name.get(def.kids[0]?.type ?? '');
            if (base && base !== def)
                walk(base);
            path.delete(def.type);
            done.add(def.type);
            sorted.push(def);
        };
        for (const def of defs)
            walk(def);
        return sorted;
    }
    $.$bog_vmap_lang_sorted = $bog_vmap_lang_sorted;
    class $bog_vmap_lang_doc extends $mol_object {
        source(next) {
            return next ?? '';
        }
        trees() {
            return this.$.$mol_view_tree2_normalize(this.$.$mol_tree2_from_string(this.source().replace(/\n?$/, '\n'))).kids;
        }
        names() {
            return this.trees().map(tree => tree.type);
        }
        class_source(name, next) {
            const trees = this.trees();
            const index = trees.findIndex(tree => tree.type === name);
            if (next === undefined)
                return trees[index]?.toString() ?? '';
            const parsed = this.$.$mol_view_tree2_normalize(this.$.$mol_tree2_from_string(next.replace(/\n?$/, '\n'))).kids;
            const kept = index < 0
                ? [...trees, ...parsed]
                : [...trees.slice(0, index), ...parsed, ...trees.slice(index + 1)];
            this.source(this.$.$mol_tree2.list(kept).toString());
            return next;
        }
        class_rename(from, to) {
            if (from === to)
                return;
            const trees = this.trees();
            if (!trees.some(tree => tree.type === from))
                return this.$.$mol_fail(new Error(`Class ${JSON.stringify(from)} is not declared in the document`));
            if (trees.some(tree => tree.type === to))
                return this.$.$mol_fail(new Error(`Class ${JSON.stringify(to)} is already declared in the document`));
            const renamed = (tree) => {
                const kids = tree.kids.map(renamed);
                return tree.type === from ? tree.struct(to, kids) : tree.clone(kids);
            };
            this.source(this.$.$mol_tree2.list(trees.map(renamed)).toString());
        }
        node(name) {
            return $bog_vmap_lang_node.make({
                source: (next) => this.class_source(name, next),
            });
        }
    }
    __decorate([
        $mol_mem
    ], $bog_vmap_lang_doc.prototype, "source", null);
    __decorate([
        $mol_mem
    ], $bog_vmap_lang_doc.prototype, "trees", null);
    __decorate([
        $mol_mem
    ], $bog_vmap_lang_doc.prototype, "names", null);
    __decorate([
        $mol_action
    ], $bog_vmap_lang_doc.prototype, "class_rename", null);
    __decorate([
        $mol_mem_key
    ], $bog_vmap_lang_doc.prototype, "node", null);
    $.$bog_vmap_lang_doc = $bog_vmap_lang_doc;
    class $bog_vmap_lang_node extends $mol_object {
        source(next) {
            return next ?? '';
        }
        tree(next) {
            const source = this.source(next && next.toString()).replace(/\n?$/, '\n');
            const tree = this.$.$mol_view_tree2_normalize(this.$.$mol_tree2_from_string(source)).kids[0];
            if (!tree)
                return this.$.$mol_fail(new Error('No class declared in the source'));
            return tree;
        }
        name(next) {
            const tree = this.tree();
            if (!next)
                return tree.type;
            this.tree(tree.struct(next, tree.kids));
            return next;
        }
        base(next) {
            const self = this.tree();
            const base = this.$.$mol_view_tree2_class_super(self);
            if (!next)
                return base.type;
            this.tree(self.clone([base.struct(next, base.kids)]));
            return next;
        }
        prop_names() {
            return this.$.$mol_view_tree2_class_props(this.tree())
                .map(tree => this.$.$mol_view_tree2_prop_parts(tree).name);
        }
        props_tree() {
            return this.tree().list(this.$.$mol_view_tree2_class_props(this.tree()));
        }
        prop_fullname(name) {
            if (/[*?!]/.test(name))
                return name;
            for (const tree of this.props_tree().kids) {
                const sign = tree?.type ?? '';
                const meta = [...sign.matchAll($mol_view_tree2_prop_signature)][0]?.groups
                    ?? { name: '', key: '', next: '' };
                if (meta.name === name)
                    return `${meta.name}${meta.key || ''}${meta.next || ''}`;
            }
            return '';
        }
        prop_tree(name, next) {
            const sign = this.prop_fullname(name);
            if (next !== undefined) {
                this.tree(this.tree().insert(next, this.base(), sign));
                return next;
            }
            return this.props_tree().select(sign).kids[0] ?? null;
        }
        prop_add(name) {
            const tree = this.tree();
            this.tree(tree.insert(tree.struct(name, [tree.struct('null')]), null, name));
        }
        prop_drop(name) {
            this.prop_tree(name, null);
        }
        prop_rename(name, next) {
            const to = [...next.matchAll($mol_view_tree2_prop_signature)][0]?.groups?.name;
            if (!to)
                return this.$.$mol_fail(new Error(`Bad property signature ${JSON.stringify(next)}`));
            if (to !== name && this.prop_names().includes(to))
                return this.$.$mol_fail(new Error(`Property ${JSON.stringify(to)} is already declared in ${this.name()}`));
            const self = this.tree();
            const base = self.kids[0];
            if (!base)
                return;
            const refs = (tree) => {
                const kids = tree.kids.map(refs);
                const head = kids[0];
                if (head?.type === name
                    && (tree.type === '<=' || tree.type === '<=>' || tree.type === '='))
                    return tree.clone([head.struct(to, head.kids), ...kids.slice(1)]);
                return tree.clone(kids);
            };
            const props = base.kids.map(prop => {
                const meta = [...prop.type.matchAll($mol_view_tree2_prop_signature)][0]?.groups;
                return meta?.name === name ? prop.struct(next, prop.kids) : prop;
            });
            this.tree(self.clone([base.clone(props.map(refs))]));
        }
        property(name) {
            return $bog_vmap_lang_prop.make({
                name: $mol_const(name),
                tree: next => this.prop_tree(name, next),
                node: $mol_const(this),
            });
        }
        part_add(name, klass) {
            const tree = this.tree();
            this.tree(tree.insert(this.$.$bog_vmap_lang_part_tree(name, klass), null, name));
        }
        wire_add(wire) {
            const next = this.$.$bog_vmap_lang_wire_tree(wire);
            if (!this.prop_names().includes(wire.node))
                this.$.$mol_fail(new Error(`Wire node ${JSON.stringify(wire.node)} is not declared in ${this.name()}`));
            const prev = this.prop_fullname(wire.name);
            if (prev && prev !== next.type)
                this.prop_drop(wire.name);
            this.tree(this.tree().insert(next, null, next.type));
        }
        wires() {
            const wires = [];
            for (const prop of this.props_tree().kids) {
                const op = prop.kids[0];
                if (op?.type !== '=')
                    continue;
                const node = op.kids[0];
                const far = node?.kids[0];
                if (!node || !far)
                    continue;
                const meta = this.$.$mol_view_tree2_prop_parts(prop);
                wires.push({
                    name: meta.name,
                    node: node.type,
                    prop: this.$.$mol_view_tree2_prop_parts(far).name,
                    bidi: Boolean(meta.next),
                });
            }
            return wires;
        }
        part_names() {
            return this.props_tree().kids
                .filter(prop => {
                const val = prop.kids[0];
                return val && $mol_view_tree2_class_match(val);
            })
                .map(prop => this.$.$mol_view_tree2_prop_parts(prop).name);
        }
        links() {
            const wires = new Map(this.wires().map(wire => [wire.name, wire]));
            const links = [];
            for (const decl of this.props_tree().kids) {
                const klass = decl.kids[0];
                if (!klass || !$mol_view_tree2_class_match(klass))
                    continue;
                const to = this.$.$mol_view_tree2_prop_parts(decl).name;
                for (const over of klass.kids) {
                    const op = over.kids[0];
                    if (op?.type !== '<=' && op?.type !== '<=>')
                        continue;
                    const ref = op.kids[0];
                    if (!ref || ref.kids.length)
                        continue;
                    const wire = wires.get(this.$.$mol_view_tree2_prop_parts(ref).name);
                    if (!wire)
                        continue;
                    links.push({
                        from: wire.node,
                        from_prop: wire.prop,
                        to,
                        to_prop: this.$.$mol_view_tree2_prop_parts(over).name,
                        name: wire.name,
                        bidi: Boolean(wire.bidi) && op.type === '<=>',
                    });
                }
            }
            return links;
        }
        link_reaches(from, to) {
            const seen = new Set();
            const queue = [from];
            while (queue.length) {
                const at = queue.shift();
                if (at === to)
                    return true;
                if (seen.has(at))
                    continue;
                seen.add(at);
                for (const link of this.links())
                    if (link.from === at)
                        queue.push(link.to);
            }
            return false;
        }
        link_name(from, prop, bidi) {
            const base = `${from.toLowerCase()}_${prop}`;
            const taken = new Set(this.prop_names());
            for (let i = 1;; ++i) {
                const name = i === 1 ? base : `${base}_${i}`;
                const wire = this.wires().find(wire => wire.name === name);
                if (wire) {
                    if (wire.node === from && wire.prop === prop && wire.bidi === bidi)
                        return name;
                    continue;
                }
                if (!taken.has(name))
                    return name;
            }
        }
        link_add(link) {
            const bidi = Boolean(link.bidi);
            if (link.from === link.to)
                this.$.$mol_fail(new Error(`Part ${JSON.stringify(link.to)} cannot be wired to itself`));
            const parts = new Set(this.part_names());
            for (const end of [link.from, link.to])
                if (!parts.has(end))
                    this.$.$mol_fail(new Error(`Part ${JSON.stringify(end)} is not declared in ${this.name()}`));
            if (this.link_reaches(link.to, link.from))
                this.$.$mol_fail(new Error(`Wire ${link.from} → ${link.to} closes a loop: ${link.to} already feeds ${link.from}`));
            const to_prop = this.$.$bog_vmap_lang_token(link.to_prop, 'Target port');
            const name = this.link_name(link.from, link.from_prop, bidi);
            this.wire_add({ name, node: link.from, prop: link.from_prop, bidi });
            const ref = bidi
                ? $mol_tree2.struct('<=>', [$mol_tree2.struct(name + '?')])
                : this.$.$bog_vmap_lang_ref_tree(name);
            this.link_target(link.to, to_prop, $mol_tree2.struct(to_prop + (bidi ? '?' : ''), [ref]));
            return name;
        }
        link_target(to, to_prop, next) {
            this.over_set(to, to_prop, next);
        }
        link_drop(to, to_prop) {
            const link = this.links().find(link => link.to === to && link.to_prop === to_prop);
            if (!link)
                return;
            this.link_target(to, to_prop, null);
            const used = this.links().some(other => other.name === link.name);
            if (!used)
                this.prop_drop(link.name);
        }
        links_drop(node) {
            for (const link of [...this.links()]) {
                if (link.from !== node && link.to !== node)
                    continue;
                this.link_drop(link.to, link.to_prop);
            }
            for (const wire of [...this.wires()]) {
                if (wire.node !== node)
                    continue;
                this.prop_drop(wire.name);
            }
        }
        prop_decl(name) {
            const sign = this.prop_fullname(name);
            return sign ? this.props_tree().select(sign).kids[0] ?? null : null;
        }
        sub_list(owner = '') {
            const prop = owner ? this.over_tree(owner, 'sub') : this.prop_decl('sub');
            const list = prop?.kids[0] ?? null;
            return list?.type[0] === '/' ? list : null;
        }
        sub_names(owner = '') {
            const list = this.sub_list(owner);
            return list && list.kids.map(ref => ref.kids[0]?.type ?? '');
        }
        sub_holder(name) {
            for (const owner of ['', ...this.part_names()]) {
                if (this.sub_names(owner)?.includes(name))
                    return owner;
            }
            return null;
        }
        sub_within(owner, name) {
            const seen = new Set();
            const queue = [owner];
            while (queue.length) {
                const at = queue.shift();
                if (at === name)
                    return true;
                if (seen.has(at))
                    continue;
                seen.add(at);
                for (const kid of this.sub_names(at) ?? [])
                    if (kid)
                        queue.push(kid);
            }
            return false;
        }
        sub_write(owner, list) {
            const sub = list.struct('sub', [list]);
            if (owner)
                return this.over_set(owner, 'sub', sub);
            this.tree(this.tree().insert(sub, null, this.prop_fullname('sub') || 'sub'));
        }
        sub_open(owner) {
            if (this.sub_list(owner))
                return;
            this.sub_write(owner, this.tree().struct('/'));
        }
        over_tree(owner, prop) {
            const klass = this.prop_decl(owner)?.kids[0];
            if (!klass || !$mol_view_tree2_class_match(klass))
                return null;
            return klass.kids.find(over => this.$.$mol_view_tree2_prop_parts(over).name === prop) ?? null;
        }
        over_set(owner, prop, next) {
            const decl = this.prop_decl(owner);
            const klass = decl?.kids[0];
            if (!decl || !klass || !$mol_view_tree2_class_match(klass))
                return;
            const named = (over) => this.$.$mol_view_tree2_prop_parts(over).name === prop;
            const kids = klass.kids.some(named)
                ? klass.kids.flatMap(over => named(over) ? next ? [next] : [] : [over])
                : next ? [...klass.kids, next] : klass.kids;
            this.prop_tree(owner, decl.clone([klass.clone(kids)]));
        }
        sub_check(name, owner) {
            if (!owner)
                return;
            if (name === owner)
                this.$.$mol_fail(new Error(`Node ${JSON.stringify(name)} cannot be put inside itself`));
            if (this.sub_within(name, owner))
                this.$.$mol_fail(new Error(`Node ${JSON.stringify(name)} cannot be put inside ${JSON.stringify(owner)}, which it already holds`));
        }
        sub_insert(name, index, owner = '') {
            const ref = this.$.$bog_vmap_lang_ref_tree(name);
            this.sub_check(name, owner);
            const list = this.sub_list(owner) ?? ref.struct('/');
            const kids = [...list.kids];
            kids.splice(Math.max(0, Math.min(index, kids.length)), 0, ref);
            this.sub_write(owner, list.clone(kids));
        }
        sub_move(name, index, owner = '') {
            this.sub_check(name, owner);
            const from = this.sub_holder(name);
            if (from === owner) {
                const at = this.sub_names(owner).indexOf(name);
                if (at >= 0 && at < index)
                    index -= 1;
            }
            if (from !== null)
                this.sub_drop(name);
            this.sub_insert(name, index, owner);
        }
        sub_add(name) {
            this.sub_insert(name, Infinity);
        }
        sub_drop(name) {
            const owner = this.sub_holder(name);
            if (owner === null)
                return;
            const list = this.sub_list(owner);
            this.sub_write(owner, list.clone(list.kids.filter(ref => ref.kids[0]?.type !== name)));
        }
    }
    __decorate([
        $mol_mem
    ], $bog_vmap_lang_node.prototype, "source", null);
    __decorate([
        $mol_mem
    ], $bog_vmap_lang_node.prototype, "tree", null);
    __decorate([
        $mol_mem
    ], $bog_vmap_lang_node.prototype, "name", null);
    __decorate([
        $mol_mem
    ], $bog_vmap_lang_node.prototype, "base", null);
    __decorate([
        $mol_mem
    ], $bog_vmap_lang_node.prototype, "prop_names", null);
    __decorate([
        $mol_mem
    ], $bog_vmap_lang_node.prototype, "props_tree", null);
    __decorate([
        $mol_mem_key
    ], $bog_vmap_lang_node.prototype, "prop_fullname", null);
    __decorate([
        $mol_mem_key
    ], $bog_vmap_lang_node.prototype, "prop_tree", null);
    __decorate([
        $mol_action
    ], $bog_vmap_lang_node.prototype, "prop_add", null);
    __decorate([
        $mol_action
    ], $bog_vmap_lang_node.prototype, "prop_drop", null);
    __decorate([
        $mol_action
    ], $bog_vmap_lang_node.prototype, "prop_rename", null);
    __decorate([
        $mol_mem_key
    ], $bog_vmap_lang_node.prototype, "property", null);
    __decorate([
        $mol_action
    ], $bog_vmap_lang_node.prototype, "part_add", null);
    __decorate([
        $mol_action
    ], $bog_vmap_lang_node.prototype, "wire_add", null);
    __decorate([
        $mol_mem
    ], $bog_vmap_lang_node.prototype, "wires", null);
    __decorate([
        $mol_mem
    ], $bog_vmap_lang_node.prototype, "links", null);
    __decorate([
        $mol_action
    ], $bog_vmap_lang_node.prototype, "link_add", null);
    __decorate([
        $mol_action
    ], $bog_vmap_lang_node.prototype, "link_drop", null);
    __decorate([
        $mol_action
    ], $bog_vmap_lang_node.prototype, "links_drop", null);
    __decorate([
        $mol_action
    ], $bog_vmap_lang_node.prototype, "sub_open", null);
    __decorate([
        $mol_action
    ], $bog_vmap_lang_node.prototype, "sub_insert", null);
    __decorate([
        $mol_action
    ], $bog_vmap_lang_node.prototype, "sub_move", null);
    __decorate([
        $mol_action
    ], $bog_vmap_lang_node.prototype, "sub_add", null);
    __decorate([
        $mol_action
    ], $bog_vmap_lang_node.prototype, "sub_drop", null);
    $.$bog_vmap_lang_node = $bog_vmap_lang_node;
    class $bog_vmap_lang_prop extends $mol_object {
        name() {
            return this.$.$mol_fail(new Error('Not defined'));
        }
        node() {
            return this.$.$mol_fail(new Error('Not defined'));
        }
        tree(next) {
            return this.$.$mol_fail(new Error('Not defined'));
        }
        as(Prop) {
            return Prop.make({
                name: () => this.name(),
                tree: next => this.tree(next),
            });
        }
        meta(next) {
            const tree = this.tree();
            const sign = tree?.type ?? '';
            let meta = [...sign.matchAll($mol_view_tree2_prop_signature)][0]?.groups
                ?? { name: '', key: '', next: '' };
            if (next) {
                const made = { ...meta, ...next };
                const sign = `${made.name}${made.key || ''}${made.next || ''}`;
                if (made.name === meta.name)
                    this.tree(tree.struct(sign, tree.kids));
                else
                    this.node().prop_rename(meta.name, sign);
                meta = made;
            }
            return meta;
        }
        title(next) {
            return this.meta(next === undefined ? undefined : { name: next }).name;
        }
        key(next) {
            return Boolean(this.meta(next === undefined ? undefined : { key: next ? '*' : '' }).key);
        }
        next(next) {
            return Boolean(this.meta(next === undefined ? undefined : { next: next ? '?' : '' }).next);
        }
    }
    $.$bog_vmap_lang_prop = $bog_vmap_lang_prop;
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    function $bog_vmap_scene_order(libs, doc) {
        const all = [...libs, ...doc];
        const last = new Map();
        all.forEach((def, index) => last.set(def.type, index));
        const unique = all.filter((def, index) => last.get(def.type) === index);
        return this.$bog_vmap_lang_sorted(unique);
    }
    $.$bog_vmap_scene_order = $bog_vmap_scene_order;
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    function atoms_of(holder) {
        if (holder instanceof Map)
            return [...holder.values()];
        if (holder && typeof holder === 'object')
            return [holder];
        return [];
    }
    function view_like(value) {
        return typeof value?.dom_node === 'function';
    }
    function $bog_vmap_scene_swap(root, klass_of, shape_of) {
        const report = { swapped: 0, moved: 0, stale: 0, dropped: 0, failed: 0 };
        const seen = new Set();
        const queue = [root];
        while (queue.length) {
            const inst = queue.pop();
            if (seen.has(inst))
                continue;
            seen.add(inst);
            const name = inst.constructor?.name ?? '';
            const shape = name ? shape_of(name) : null;
            if (shape) {
                const klass = klass_of(name);
                if (typeof klass === 'function' && klass.prototype !== Object.getPrototypeOf(inst)) {
                    Object.setPrototypeOf(inst, klass.prototype);
                    report.swapped += 1;
                }
            }
            for (const field of Object.getOwnPropertyNames(inst)) {
                if (!field.endsWith('()'))
                    continue;
                const holder = Reflect.get(inst, field);
                const atoms = atoms_of(holder);
                if (!atoms.length)
                    continue;
                const prop = field.slice(0, -2).trim();
                for (const atom of atoms) {
                    for (const kid of kids_of(atom))
                        queue.push(kid);
                    if (!(atom.cache instanceof Error))
                        continue;
                    Reflect.set(atom, 'cursor', $mol_wire_cursor.stale);
                    atom.emit();
                    report.failed += 1;
                }
                if (!shape)
                    continue;
                retarget(inst, field, prop, atoms, shape, report);
            }
        }
        return report;
    }
    $.$bog_vmap_scene_swap = $bog_vmap_scene_swap;
    function kids_of(atom) {
        const value = atom.result();
        if (view_like(value))
            return [value];
        if (Array.isArray(value))
            return value.filter(view_like);
        return [];
    }
    function retarget(inst, field, prop, atoms, shape, report) {
        const wrapper = Reflect.get(inst, prop);
        const next = typeof wrapper === 'function' ? Reflect.get(wrapper, 'orig') : null;
        const decorated = typeof next === 'function';
        const keyed_was = Reflect.get(inst, field) instanceof Map;
        const keyed_now = shape.keyed.has(prop);
        const broken = shape.declared.has(prop)
            ? (!decorated || keyed_was !== keyed_now)
            : (!decorated && !(prop in inst));
        if (broken) {
            for (const atom of atoms) {
                atom.emit();
                atom.destructor();
            }
            Reflect.deleteProperty(inst, field);
            report.dropped += atoms.length;
            return;
        }
        if (!decorated)
            return;
        for (const atom of atoms) {
            const prev = atom.task;
            if (prev === next)
                continue;
            Reflect.set(atom, 'task', next);
            report.moved += 1;
            if (String(prev) === String(next))
                continue;
            Reflect.set(atom, 'cursor', $mol_wire_cursor.stale);
            atom.emit();
            report.stale += 1;
        }
    }
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    function $bog_vmap_scene_cells(Klass, keyed, changeable) {
        const proto = Klass.prototype;
        for (const name of Object.getOwnPropertyNames(proto)) {
            if (name === 'constructor' || name === 'destructor')
                continue;
            const descr = Object.getOwnPropertyDescriptor(proto, name);
            const method = descr.value;
            if (typeof method !== 'function')
                continue;
            if (keyed.includes(name)) {
                $mol_mem_key(proto, name, descr);
                continue;
            }
            if (changeable.includes(name)) {
                $mol_mem(proto, name, descr);
                continue;
            }
            if (method.length)
                continue;
            if (method.constructor !== Function)
                continue;
            $mol_mem(proto, name, descr);
        }
    }
    $.$bog_vmap_scene_cells = $bog_vmap_scene_cells;
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    function $mol_tree2_text_to_string(text) {
        let res = '';
        function visit(text, prefix, inline) {
            if (text.type === 'indent') {
                if (inline)
                    res += '\n';
                for (let kid of text.kids) {
                    visit(kid, prefix + '\t', false);
                }
                if (inline)
                    res += prefix;
            }
            else if (text.type === 'line') {
                if (!inline)
                    res += prefix;
                for (let kid of text.kids) {
                    visit(kid, prefix, true);
                }
                if (!inline)
                    res += '\n';
            }
            else {
                if (!inline)
                    res += prefix;
                res += text.text();
                if (!inline)
                    res += '\n';
            }
        }
        for (let kid of text.kids) {
            visit(kid, '', false);
        }
        return res;
    }
    $.$mol_tree2_text_to_string = $mol_tree2_text_to_string;
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    function $mol_vlq_encode(val) {
        const sign = val < 0 ? 1 : 0;
        if (sign)
            val = -val;
        let index = sign | ((val & 0b1111) << 1);
        val >>>= 4;
        let res = '';
        while (val) {
            index |= 1 << 5;
            res += alphabet[index];
            if (!val)
                break;
            index = val & 0b11111;
            val >>>= 5;
        }
        res += alphabet[index];
        return res;
    }
    $.$mol_vlq_encode = $mol_vlq_encode;
})($ || ($ = {}));

;
"use strict";

;
"use strict";
var $;
(function ($) {
    function $mol_tree2_text_to_sourcemap(tree) {
        let col = 1;
        let prev_span;
        let prev_index = 0;
        let prev_col = 1;
        let mappings = '';
        let line = [];
        const file_indexes = new Map();
        const file_sources = new Map();
        function span2index(span) {
            if (file_indexes.has(span.uri))
                return file_indexes.get(span.uri);
            const index = file_indexes.size;
            file_indexes.set(span.uri, index);
            file_sources.set(span.uri, span.source);
            return index;
        }
        function next_line() {
            if (!line.length)
                return;
            mappings += line.join(',') + ';';
            line = [];
            col = 1;
            prev_col = 1;
        }
        function visit(text, prefix, inline) {
            function indent() {
                col += prefix;
            }
            if (inline && text.type === 'indent')
                next_line();
            if (prev_span !== text.span || col === 1) {
                const index = span2index(text.span);
                line.push($mol_vlq_encode(col - prev_col) +
                    $mol_vlq_encode(index - prev_index) +
                    $mol_vlq_encode(text.span.row - (prev_span?.row ?? 1)) +
                    $mol_vlq_encode(text.span.col - (prev_span?.col ?? 1)));
                prev_col = col;
                prev_span = text.span;
                prev_index = index;
            }
            if (text.type === 'indent') {
                for (let kid of text.kids) {
                    visit(kid, prefix + 1, false);
                }
                if (inline)
                    next_line();
            }
            else if (text.type === 'line') {
                if (!inline)
                    indent();
                for (let kid of text.kids) {
                    visit(kid, prefix, true);
                }
                if (!inline)
                    next_line();
            }
            else {
                if (!inline)
                    indent();
                col += text.text().length;
                if (!inline)
                    next_line();
            }
        }
        for (let kid of tree.kids) {
            visit(kid, 0, false);
        }
        next_line();
        const map = {
            version: 3,
            sources: [...file_sources.keys()],
            sourcesContent: [...file_sources.values()],
            mappings,
        };
        return map;
    }
    $.$mol_tree2_text_to_sourcemap = $mol_tree2_text_to_sourcemap;
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    function $mol_sourcemap_url(uri, type = 'js') {
        if (type === 'css')
            return `\n/*# sourceMappingURL=${uri}*/`;
        return `\n//# sourceMappingURL=${uri}`;
    }
    $.$mol_sourcemap_url = $mol_sourcemap_url;
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    const prefix = '# sourceMappingURL=data:application/json,';
    const end_comment = ' */';
    function $mol_sourcemap_dataurl_decode(data) {
        const index = data.lastIndexOf(prefix);
        if (index === -1)
            return undefined;
        data = data.substring(index + prefix.length);
        if (data.endsWith(end_comment))
            data = data.substring(0, data.length - end_comment.length);
        const decoded = this.decodeURIComponent(data);
        try {
            const map = JSON.parse(decoded);
            if (!map)
                return undefined;
            if (typeof map.mappings === 'string' && map.mappings.startsWith(';;')) {
                map.mappings = map.mappings.substring(2);
            }
            return map;
        }
        catch (e) {
            if (e instanceof Error)
                e.message += ', origin=' + decoded;
            $mol_fail_hidden(e);
        }
    }
    $.$mol_sourcemap_dataurl_decode = $mol_sourcemap_dataurl_decode;
    function $mol_sourcemap_dataurl_encode(map, type = 'js') {
        const str = JSON.stringify({ ...map, mappings: ';;' + map.mappings });
        return this.$mol_sourcemap_url('data:application/json,' + this.encodeURIComponent(str), type);
    }
    $.$mol_sourcemap_dataurl_encode = $mol_sourcemap_dataurl_encode;
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    function $mol_tree2_text_to_string_mapped(text, type) {
        const code = this.$mol_tree2_text_to_string(text);
        const map = this.$mol_tree2_text_to_sourcemap(text);
        const chunk = this.$mol_sourcemap_dataurl_encode(map, type);
        return code + chunk;
    }
    $.$mol_tree2_text_to_string_mapped = $mol_tree2_text_to_string_mapped;
    function $mol_tree2_text_to_string_mapped_js(text) {
        return this.$mol_tree2_text_to_string_mapped(text, 'js');
    }
    $.$mol_tree2_text_to_string_mapped_js = $mol_tree2_text_to_string_mapped_js;
    function $mol_tree2_text_to_string_mapped_css(text) {
        return this.$mol_tree2_text_to_string_mapped(text, 'css');
    }
    $.$mol_tree2_text_to_string_mapped_css = $mol_tree2_text_to_string_mapped_css;
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    function $mol_tree2_js_is_number(type) {
        return type.match(/[\+\-]*NaN/) || !Number.isNaN(Number(type));
    }
    $.$mol_tree2_js_is_number = $mol_tree2_js_is_number;
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    function is_identifier(tree) {
        if (tree.type)
            return false;
        return /^[a-z_$][a-z_$0-9]*$/i.test(tree.text());
    }
    function $mol_tree2_js_to_text(js) {
        function sequence(open, separator, close) {
            return (input, belt) => [
                input.struct('line', [
                    ...open ? [input.data(open)] : [],
                    input.struct(separator && input.kids.length > 2 ? 'indent' : 'line', [].concat(...input.kids.map((kid, index) => [
                        kid.struct('line', [
                            ...kid.list([kid]).hack(belt),
                            ...(separator && index < input.kids.length - 1) ? [input.data(separator)] : [],
                        ]),
                    ]))),
                    ...close ? [input.data(close)] : [],
                ]),
            ];
        }
        function block(open, separator, close) {
            return (input, belt) => [
                ...open ? [input.data(open)] : [],
                ...input.kids.length === 0 ? [] : [input.struct('indent', input.kids.map((kid, index) => kid.struct('line', [
                        ...kid.list([kid]).hack(belt),
                        ...(separator) ? [input.data(separator)] : [],
                    ])))],
                ...close ? [input.data(close)] : [],
            ];
        }
        function duplet(open, separator, close) {
            return (input, belt) => [
                input.struct('line', [
                    ...open ? [input.data(open)] : [],
                    ...input.list(input.kids.slice(0, 1)).hack(belt),
                    ...(separator && input.kids.length > 1) ? [input.data(separator)] : [],
                    ...input.list(input.kids.slice(1, 2)).hack(belt),
                    ...close ? [input.data(close)] : [],
                ]),
            ];
        }
        function triplet(open, separator12, separator23, close) {
            return (input, belt) => [
                input.struct('line', [
                    ...open ? [input.data(open)] : [],
                    ...input.list(input.kids.slice(0, 1)).hack(belt),
                    ...(separator12 && input.kids.length > 1) ? [input.data(separator12)] : [],
                    ...input.list(input.kids.slice(1, 2)).hack(belt),
                    ...(separator23 && input.kids.length > 2) ? [input.data(separator23)] : [],
                    ...input.list(input.kids.slice(2, 3)).hack(belt),
                    ...close ? [input.data(close)] : [],
                ]),
            ];
        }
        return js.list(js.hack({
            '+': sequence('+'),
            '-': sequence('-'),
            '!': sequence('!'),
            '~': sequence('~'),
            'return': sequence('return '),
            'break': sequence('break '),
            'continue': sequence('continue '),
            'yield': sequence('yield '),
            'yield*': sequence('yield* '),
            'await': sequence('await '),
            'void': sequence('void '),
            'delete': sequence('delete '),
            'typeof': sequence('typeof '),
            'new': sequence('new '),
            '...': sequence('...'),
            '@++': sequence('', '', '++'),
            '@--': sequence('', '', '--'),
            '(in)': sequence('(', ' in ', ')'),
            '(instanceof)': sequence('(', ' instanceof ', ')'),
            '(+)': sequence('(', ' + ', ')'),
            '(-)': sequence('(', ' - ', ')'),
            '(*)': sequence('(', ' * ', ')'),
            '(/)': sequence('(', ' / ', ')'),
            '(%)': sequence('(', ' % ', ')'),
            '(**)': sequence('(', ' ** ', ')'),
            '(<)': sequence('(', ' < ', ')'),
            '(<=)': sequence('(', ' <= ', ')'),
            '(>)': sequence('(', ' > ', ')'),
            '(>=)': sequence('(', ' >= ', ')'),
            '(==)': sequence('(', ' == ', ')'),
            '(!=)': sequence('(', ' != ', ')'),
            '(===)': sequence('(', ' === ', ')'),
            '(!==)': sequence('(', ' !== ', ')'),
            '(<<)': sequence('(', ' << ', ')'),
            '(>>)': sequence('(', ' >> ', ')'),
            '(>>>)': sequence('(', ' >>> ', ')'),
            '(&)': sequence('(', ' & ', ')'),
            '(|)': sequence('(', ' | ', ')'),
            '(^)': sequence('(', ' ^ ', ')'),
            '(&&)': sequence('(', ' && ', ')'),
            '(||)': sequence('(', ' || ', ')'),
            '(,)': sequence('(', ', ', ')'),
            '{;}': block('{', ';', '}'),
            ';': block('', ';', ''),
            '[,]': sequence('[', ', ', ']'),
            '{,}': sequence('{', ', ', '}'),
            '()': sequence('(', '', ')'),
            '{}': block('{', '', '}'),
            '[]': (input, belt) => {
                const first = input.kids[0];
                if (!is_identifier(first))
                    return sequence('[', '', ']')(input, belt);
                else
                    return [input.data('.' + first.text())];
            },
            '?.[]': (input, belt) => {
                const first = input.kids[0];
                if (!is_identifier(first))
                    return sequence('?.[', '', ']')(input, belt);
                else
                    return [input.data('?.' + first.text())];
            },
            ':': (input, belt) => input.kids[0].type
                ? duplet('[', ']: ')(input, belt)
                : duplet('', ': ')(input, belt),
            'let': duplet('let ', ' = '),
            'const': duplet('const ', ' = '),
            'var': duplet('var ', ' = '),
            '=': duplet('', ' = '),
            '+=': duplet('', ' += '),
            '-=': duplet('', ' -= '),
            '*=': duplet('', ' *= '),
            '/=': duplet('', ' /= '),
            '%=': duplet('', ' %= '),
            '**=': duplet('', ' **= '),
            '<<=': duplet('', ' <<= '),
            '>>=': duplet('', ' >>= '),
            '>>>=': duplet('', ' >>>= '),
            '&=': duplet('', ' &= '),
            '|=': duplet('', ' |= '),
            '^=': duplet('', ' ^= '),
            '&&=': duplet('', ' &&= '),
            '||=': duplet('', ' ||= '),
            '=>': duplet('', ' => '),
            'async=>': duplet('async ', ' => '),
            'function': triplet('function '),
            'function*': triplet('function* '),
            'async': triplet('async function '),
            'async*': triplet('async function* '),
            'class': triplet('class ', ' '),
            'extends': sequence('extends ', '', ' '),
            'if': triplet('if', ' ', 'else'),
            '?:': triplet('', ' ? ', ' : '),
            '.': (input, belt) => {
                const first = input.kids[0];
                if (!is_identifier(first))
                    return triplet('[', ']')(input, belt);
                else
                    return [
                        input.data(first.text()),
                        ...input.list(input.kids.slice(1)).hack(belt),
                    ];
            },
            'get': triplet('get [', ']'),
            'set': triplet('set [', ']'),
            'static': triplet('static [', ']'),
            '/./': sequence(),
            '.global': sequence('g'),
            '.multiline': sequence('m'),
            '.ignoreCase': sequence('i'),
            '.source': (input, belt) => [
                input.data('/'),
                input.data(JSON.stringify(input.text()).slice(1, -1)),
                input.data('/'),
            ],
            '``': (input, belt) => {
                return [
                    input.struct('line', [
                        input.data('`'),
                        ...[].concat(...input.kids.map(kid => {
                            if (kid.type) {
                                return [
                                    kid.data('${'),
                                    ...kid.list([kid]).hack(belt),
                                    kid.data('}'),
                                ];
                            }
                            else {
                                return [
                                    input.data(JSON.stringify(kid.text()).slice(1, -1)),
                                ];
                            }
                        })),
                        input.data('`'),
                    ]),
                ];
            },
            '': (input, belt) => {
                // string
                if (!input.type)
                    return [
                        input.data(JSON.stringify(input.text())),
                    ];
                // variable
                if (/^[\w$#][\w0-9$]*$/i.test(input.type))
                    return [
                        input.data(input.type),
                        // ... input.hack( context ),
                    ];
                // number
                if ($mol_tree2_js_is_number(input.type))
                    return [
                        input.data(input.type)
                    ];
                $mol_fail(new SyntaxError(`Wrong node type`));
            },
        }));
    }
    $.$mol_tree2_js_to_text = $mol_tree2_js_to_text;
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    class $mol_storage extends $mol_object2 {
        /** Is storage a long term. */
        static persisted(next) {
            return false;
        }
        /** Total storage quota in bytes. */
        static total() {
            return 0;
        }
        /** Total storage usage in bytes. */
        static used() {
            return 0;
        }
        /** Minimum available free space in bytes. */
        static free() {
            return this.total() - this.used();
        }
        /** Fulfillness of storage. */
        static portion() {
            const total = this.total();
            if (!total)
                return 1;
            return this.used() / total;
        }
        /**
         * Fulfillness logarithmic level.
         * `0` - empty
         * `1` - half free
         * `2` - quart free
         * `Infinity` - fulfilled
         */
        static level() {
            return Math.floor(-Math.log2(1 - this.portion()));
        }
    }
    $.$mol_storage = $mol_storage;
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    class $mol_storage_node extends $mol_storage {
        static persisted() {
            return true;
        }
        static stats() {
            $mol_state_time.now(1000);
            return $node.fs.statfsSync('.');
        }
        static total() {
            const { blocks, bsize } = this.stats();
            return blocks * bsize;
        }
        static used() {
            const { blocks, bfree, bsize } = this.stats();
            return (blocks - bfree) * bsize;
        }
        static free() {
            const { bfree, bsize } = this.stats();
            return bfree * bsize;
        }
        static portion() {
            const { blocks, bfree } = this.stats();
            if (!blocks)
                return 1;
            return (blocks - bfree) / blocks;
        }
    }
    __decorate([
        $mol_mem
    ], $mol_storage_node, "stats", null);
    $.$mol_storage_node = $mol_storage_node;
    $.$mol_storage = $.$mol_storage_node;
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    class $mol_state_local extends $mol_object {
        static 'native()';
        static native() {
            if (this['native()'])
                return this['native()'];
            check: try {
                const native = $mol_dom_context.localStorage;
                if (!native)
                    break check;
                native.setItem('', '');
                native.removeItem('');
                return this['native()'] = native;
            }
            catch (error) {
                console.warn(error);
            }
            return this['native()'] = {
                getItem(key) {
                    return this[':' + key];
                },
                setItem(key, value) {
                    this[':' + key] = value;
                },
                removeItem(key) {
                    this[':' + key] = void 0;
                }
            };
        }
        static changes(next) { return next; }
        static value(key, next) {
            this.changes();
            if (next === void 0)
                return JSON.parse(this.native().getItem(key) || 'null');
            if (next === null) {
                this.native().removeItem(key);
            }
            else {
                this.native().setItem(key, JSON.stringify(next));
                this.$.$mol_storage.persisted(true);
            }
            return next;
        }
        prefix() { return ''; }
        value(key, next) {
            return $mol_state_local.value(this.prefix() + '.' + key, next);
        }
    }
    __decorate([
        $mol_mem
    ], $mol_state_local, "changes", null);
    __decorate([
        $mol_mem_key
    ], $mol_state_local, "value", null);
    $.$mol_state_local = $mol_state_local;
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    class $mol_lock extends $mol_object {
        promise = null;
        async wait() {
            let next = () => { };
            let destructed = false;
            const task = $mol_wire_auto();
            if (!task)
                return next;
            const destructor = task.destructor.bind(task);
            task.destructor = () => {
                destructor();
                destructed = true;
                next();
            };
            let promise;
            do {
                promise = this.promise;
                await promise;
                if (destructed)
                    return next;
            } while (promise !== this.promise);
            this.promise = new Promise(done => { next = done; });
            return next;
        }
        grab() { return $mol_wire_sync(this).wait(); }
    }
    $.$mol_lock = $mol_lock;
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    $.$mol_mem_cached = $mol_wire_probe;
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    function $mol_compare_array(a, b) {
        if (a === b)
            return true;
        if (Object.getPrototypeOf(a) !== Object.getPrototypeOf(b))
            return false;
        if (a.length !== b.length)
            return false;
        for (let i = 0; i < a.length; i++)
            if (a[i] !== b[i])
                return false;
        return true;
    }
    $.$mol_compare_array = $mol_compare_array;
})($ || ($ = {}));

;
"use strict";

;
"use strict";
var $;
(function ($) {
    const decoders = {};
    function $mol_charset_decode(buffer, encoding = 'utf8') {
        let decoder = decoders[encoding];
        if (!decoder)
            decoder = decoders[encoding] = new TextDecoder(encoding);
        return decoder.decode(buffer);
    }
    $.$mol_charset_decode = $mol_charset_decode;
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    let buf = new Uint8Array(2 ** 12); // 4KB Mem Page
    /** Temporary buffer. Recursive usage isn't supported. */
    function $mol_charset_buffer(size) {
        if (buf.byteLength < size)
            buf = new Uint8Array(size);
        return buf;
    }
    $.$mol_charset_buffer = $mol_charset_buffer;
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    function $mol_charset_encode(str) {
        const buf = $mol_charset_buffer(str.length * 3);
        return buf.slice(0, $mol_charset_encode_to(str, buf));
    }
    $.$mol_charset_encode = $mol_charset_encode;
    function $mol_charset_encode_to(str, buf, from = 0) {
        let pos = from;
        for (let i = 0; i < str.length; i++) {
            let code = str.charCodeAt(i);
            if (code < 0x80) { // ASCII - 1 octet
                buf[pos++] = code;
            }
            else if (code < 0x800) { // 2 octet
                buf[pos++] = 0xc0 | (code >> 6);
                buf[pos++] = 0x80 | (code & 0x3f);
            }
            else if (code < 0xd800 || code >= 0xe000) { // 3 octet
                buf[pos++] = 0xe0 | (code >> 12);
                buf[pos++] = 0x80 | ((code >> 6) & 0x3f);
                buf[pos++] = 0x80 | (code & 0x3f);
            }
            else { // surrogate pair
                const point = ((code - 0xd800) << 10) + str.charCodeAt(++i) + 0x2400;
                buf[pos++] = 0xf0 | (point >> 18);
                buf[pos++] = 0x80 | ((point >> 12) & 0x3f);
                buf[pos++] = 0x80 | ((point >> 6) & 0x3f);
                buf[pos++] = 0x80 | (point & 0x3f);
            }
        }
        return pos - from;
    }
    $.$mol_charset_encode_to = $mol_charset_encode_to;
    function $mol_charset_encode_size(str) {
        let size = 0;
        for (let i = 0; i < str.length; i++) {
            let code = str.charCodeAt(i);
            if (code < 0x80)
                size += 1;
            else if (code < 0x800)
                size += 2;
            else if (code < 0xd800 || code >= 0xe000)
                size += 3;
            else
                size += 4;
        }
        return size;
    }
    $.$mol_charset_encode_size = $mol_charset_encode_size;
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    class $mol_file_transaction extends $mol_object {
        path() { return ''; }
        modes() { return []; }
        write(options) {
            throw new Error('Not implemented');
        }
        read() {
            throw new Error('Not implemented');
        }
        truncate(size) {
            throw new Error('Not implemented');
        }
        flush() {
            throw new Error('Not implemented');
        }
        close() {
            throw new Error('Not implemented');
        }
        destructor() {
            this.close();
        }
    }
    $.$mol_file_transaction = $mol_file_transaction;
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    let file_modes;
    (function (file_modes) {
        /** create if it doesn't already exist */
        file_modes[file_modes["create"] = $node.fs.constants.O_CREAT] = "create";
        /** truncate to zero size if it already exists */
        file_modes[file_modes["exists_truncate"] = $node.fs.constants.O_TRUNC] = "exists_truncate";
        /** throw exception if it already exists */
        file_modes[file_modes["exists_fail"] = $node.fs.constants.O_EXCL] = "exists_fail";
        file_modes[file_modes["read_only"] = $node.fs.constants.O_RDONLY] = "read_only";
        file_modes[file_modes["write_only"] = $node.fs.constants.O_WRONLY] = "write_only";
        file_modes[file_modes["read_write"] = $node.fs.constants.O_RDWR] = "read_write";
        /** data will be appended to the end */
        file_modes[file_modes["append"] = $node.fs.constants.O_APPEND] = "append";
    })(file_modes || (file_modes = {}));
    function mode_mask(modes) {
        return modes.reduce((res, mode) => res | file_modes[mode], 0);
    }
    class $mol_file_transaction_node extends $mol_file_transaction {
        descr() {
            $mol_wire_solid();
            return $node.fs.openSync(this.path(), mode_mask(this.modes()));
        }
        write({ buffer, offset = 0, length, position = null }) {
            if (Array.isArray(buffer)) {
                return $node.fs.writevSync(this.descr(), buffer, position ?? undefined);
            }
            if (typeof buffer === 'string') {
                return $node.fs.writeSync(this.descr(), buffer, position);
            }
            length = length ?? buffer.byteLength;
            return $node.fs.writeSync(this.descr(), buffer, offset, length, position);
        }
        truncate(size) {
            $node.fs.ftruncateSync(this.descr());
        }
        read() {
            return $mol_file_node_buffer_normalize($node.fs.readFileSync(this.descr()));
        }
        flush() {
            $node.fs.fsyncSync(this.descr());
        }
        close() {
            $node.fs.closeSync(this.descr());
        }
    }
    __decorate([
        $mol_mem
    ], $mol_file_transaction_node.prototype, "descr", null);
    $.$mol_file_transaction_node = $mol_file_transaction_node;
    $.$mol_file_transaction = $mol_file_transaction_node;
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    class $mol_file_base extends $mol_object {
        static absolute(path) {
            return this.make({
                path: $mol_const(path)
            });
        }
        static relative(path) {
            throw new Error('Not implemented yet');
        }
        static base = '';
        path() {
            return '.';
        }
        parent() {
            return this.resolve('..');
        }
        exists_cut() { return this.exists(); }
        root() {
            const path = this.path();
            const base = this.constructor.base;
            // Если путь выше или равен base или если parent такойже как и this - считаем это корнем
            return base.startsWith(path) || this == this.parent();
        }
        stat(next, virt) {
            const path = this.path();
            const parent = this.parent();
            // Отслеживать проверку наличия родительской папки не стоит до корня диска
            // Лучше ограничить mam-ом
            if (!this.root()) {
                /*
                Если parent папка удалилась, надо ресетнуть все объекты в ней на любой глубине.
                Например, rm -rf с последующим git pull: parent папка может удалиться, потом создасться,
                а текущая папка успеет только удалиться до момента выполнения stat.
                Поэтому parent.exists() не запустит перевычисления, нужна именно parent.version()

                Однако, parent.version() меняется не только при удалении, будет ложное срабатывание
                С этим придется мириться, красивого решения пока нет.
                */
                parent.version();
            }
            parent.watcher();
            if (virt)
                return next ?? null;
            return next ?? this.info(path);
        }
        static changed = new Set;
        static frame = null;
        static changed_add(type, path) {
            if (/([\/\\]\.|___$)/.test(path))
                return;
            const file = this.relative(path.at(-1) === '/' ? path.slice(0, -1) : path);
            // console.log(type, path)
            // add (change): добавился файл - у parent надо обновить список sub, если он был заюзан
            // change, unlink (rename): обновился или удалился файл - ресетим
            // addDir (change), добавилась папка, у parent обновляем список директорий в sub
            // дочерние ресетим
            // unlinkDir (rename), удалилась папка, ресетим ее
            // stat у всех дочерних обновится сам, т.к. связан с parent.version()
            this.changed.add(file);
            if (!this.watching)
                return;
            // throttle, пока события поступают не сбрасываем.
            // аналог awaitWriteFinish из chokidar
            // интервалы между change-сообщениями модифицируемого файла должны быть меньше watch_debounce
            this.frame?.destructor();
            this.frame = new this.$.$mol_after_timeout(this.watch_debounce(), () => {
                if (!this.watching)
                    return;
                this.watching = false;
                $mol_wire_async(this).flush();
            });
        }
        /**
         * Должно быть больше, чем время между событиями от вотчера при записи внешним процессом.
         * Иначе запуск ресетов паралельно с изменением может привести к неконсистентности.
         */
        static watch_debounce() { return 500; }
        static flush() {
            // Пока flush работает, вотчер сюда не заходит, но может добавлять новые изменения
            // на каждом перезапуске они применятся
            // Пока run выполняется, изменения накапливаются, в конце run вызывается flush
            // Пока применяются изменения, run должен ожидать конца flush
            for (const file of this.changed) {
                const parent = file.parent();
                try {
                    if ($mol_wire_probe(() => parent.sub()))
                        parent.sub(null);
                    file.reset();
                }
                catch (error) {
                    if ($mol_fail_catch(error))
                        $mol_fail_log(error);
                }
            }
            this.changed.clear();
            this.watching = true;
            // this.watch_wd?.destructor()
            // this.watch_wd = null
        }
        static watching = true;
        static lock = new $mol_lock;
        static watch_off(path) {
            this.watching = false;
            // run должен ожидать конца flush
            this.flush();
            this.watching = false;
            /*
            watch запаздывает и событие может прилететь через 3 сек после окончания сайд эффекта
            поэтому добавляем папку, которую меняет side_effect
            Когда дойдет до выполнения flush, он ресетнет ее
            
            Иначе будут лишние срабатывания
            Например, удалили hyoo/board, watch ресетит и exists начинает отдавать false, срабатывает git clone
            Сразу после него событие addDir еще не успело прийти,
            на следующем перезапуске вызывается git pull, т.к.
            с точки зрения реактивной системы hyoo/board еще не существует.
            */
            this.changed.add(this.absolute(path));
        }
        // protected static watch_wd = null as null | $mol_after_timeout
        static unwatched(side_effect, affected_dir) {
            // ждем, пока выполнится предыдущий unwatched
            const unlock = this.lock.grab();
            this.watch_off(affected_dir);
            try {
                const result = side_effect();
                this.flush();
                unlock();
                return result;
            }
            catch (e) {
                if (!$mol_promise_like(e)) {
                    this.flush();
                    unlock();
                }
                $mol_fail_hidden(e);
            }
        }
        reset() {
            this.stat(null);
        }
        modified() { return this.stat()?.mtime ?? null; }
        version() {
            const next = this.stat()?.mtime.getTime().toString(36).toUpperCase() ?? '';
            // console.log('version', next, this.path())
            return next;
        }
        info(path) { return null; }
        ensure() { }
        drop() { }
        copy(to) { }
        read() { return new Uint8Array; }
        write(buffer) { }
        kids() {
            return [];
        }
        readable(opts) {
            return new ReadableStream;
        }
        writable(opts) {
            return new WritableStream;
        }
        // open( ... modes: readonly $mol_file_mode[] ) { return 0 }
        buffer(next) {
            // Если версия пустая - возвращаем пустой буфер
            let readed = new Uint8Array();
            if (next === undefined) {
                // Если меняется версия файла, буфер надо перечитать
                if (this.version())
                    readed = this.read();
            }
            const prev = $mol_mem_cached(() => this.buffer());
            const changed = prev === undefined || !$mol_compare_array(prev, next ?? readed);
            if (prev !== undefined && changed) {
                // Логируем, если повторно читаем/пишем и буфер поменялся
                this.$.$mol_log3_rise({
                    place: `$mol_file_node.buffer()`,
                    message: 'Changed',
                    path: this.relate(),
                });
            }
            if (next === undefined)
                return changed ? readed : prev;
            // Если буфер при записи не поменялся и файл не удаляли перед этим - не записываем новую версию.
            // Если записывать, это приведет к смене mtime и вотчер снова триггернется, даже если содержимое файла не поменялось.
            // В этом алгоритме есть изъян.
            // Если файл записали, потом отключили вотчер, кто-то из вне его поменял, потом включили вотчер, снова записали тот же буфер,
            // то буфер не запишется на диск, т.к. кэш не консистентен с диском.
            if (!changed && this.exists())
                return prev;
            this.parent().exists(true);
            this.stat(this.stat_make(next.length), 'virt');
            this.write(next);
            return next;
        }
        stat_make(size) {
            const now = new Date();
            return {
                type: 'file',
                size,
                atime: now,
                mtime: now,
                ctime: now,
            };
        }
        clone(to) {
            if (!this.exists())
                return null;
            const target = this.constructor.absolute(to);
            try {
                this.version();
                target.parent().exists(true);
                this.copy(to);
                target.reset();
                return target;
            }
            catch (error) {
                if ($mol_fail_catch(error)) {
                    console.error(error);
                }
            }
            return null;
        }
        // static watch_root = ''
        // static watcher_warned = false
        watcher() {
            // const constructor = this.constructor as typeof $mol_file_base
            // if (! constructor.watcher_warned) {
            // 	console.warn(`${constructor}.watcher() not implemented`)
            // 	constructor.watcher_warned = true
            // }
            return {
                destructor() { }
            };
        }
        exists(next) {
            const exists = Boolean(this.stat());
            // console.log('exists current', exists, 'next', next, this.path())
            if (next === undefined)
                return exists;
            if (next === exists)
                return exists;
            if (next) {
                this.parent().exists(true);
                this.ensure();
            }
            else {
                this.drop();
            }
            this.reset();
            return next;
        }
        type() {
            return this.stat()?.type ?? '';
        }
        name() {
            return this.path().replace(/^.*\//, '');
        }
        ext() {
            const match = /((?:\.\w+)+)$/.exec(this.path());
            return match ? match[1].substring(1) : '';
        }
        text(next, virt) {
            // Если записываем text, и вотчер ресетнул записанный файл,
            // то надо снова его обновить, вызвать логику, которая делала пуш в text.
            // Например файл удалили, потом снова создали, версия поменялась - перезаписываем
            // Если использовать version, то вновь созданный файл, через вотчер запустит свое пересоздание
            if (next !== undefined)
                this.exists();
            return this.text_int(next, virt);
        }
        text_int(next, virt) {
            if (virt) {
                this.stat(this.stat_make(0), 'virt');
                return next;
            }
            if (next === undefined) {
                return $mol_charset_decode(this.buffer());
            }
            else {
                const buffer = $mol_charset_encode(next);
                this.buffer(buffer);
                return next;
            }
        }
        sub(reset) {
            if (!this.exists())
                return [];
            if (this.type() !== 'dir')
                return [];
            this.version();
            // Если дочерний file удалился, список надо обновить
            return this.kids().filter(file => file.exists());
        }
        resolve(path) {
            throw new Error('implement');
        }
        relate(base = this.constructor.relative('.')) {
            const base_path = base.path();
            const path = this.path();
            return path.startsWith(base_path) ? path.slice(base_path.length) : path;
        }
        find(include, exclude) {
            const found = [];
            const sub = this.sub();
            for (const child of sub) {
                const child_path = child.path();
                if (exclude && child_path.match(exclude))
                    continue;
                if (!include || child_path.match(include))
                    found.push(child);
                if (child.type() === 'dir') {
                    const sub_child = child.find(include, exclude);
                    for (const child of sub_child)
                        found.push(child);
                }
            }
            return found;
        }
        size() {
            switch (this.type()) {
                case 'file': return this.stat()?.size ?? 0;
                default: return 0;
            }
        }
        toJSON() {
            return this.path();
        }
        open(...modes) {
            return this.$.$mol_file_transaction.make({
                path: () => this.path(),
                modes: () => modes
            });
        }
    }
    __decorate([
        $mol_action
    ], $mol_file_base.prototype, "exists_cut", null);
    __decorate([
        $mol_mem
    ], $mol_file_base.prototype, "stat", null);
    __decorate([
        $mol_mem
    ], $mol_file_base.prototype, "modified", null);
    __decorate([
        $mol_mem
    ], $mol_file_base.prototype, "version", null);
    __decorate([
        $mol_mem_key
    ], $mol_file_base.prototype, "readable", null);
    __decorate([
        $mol_mem_key
    ], $mol_file_base.prototype, "writable", null);
    __decorate([
        $mol_mem
    ], $mol_file_base.prototype, "buffer", null);
    __decorate([
        $mol_action
    ], $mol_file_base.prototype, "stat_make", null);
    __decorate([
        $mol_mem_key
    ], $mol_file_base.prototype, "clone", null);
    __decorate([
        $mol_mem
    ], $mol_file_base.prototype, "exists", null);
    __decorate([
        $mol_mem
    ], $mol_file_base.prototype, "type", null);
    __decorate([
        $mol_mem
    ], $mol_file_base.prototype, "text_int", null);
    __decorate([
        $mol_mem
    ], $mol_file_base.prototype, "sub", null);
    __decorate([
        $mol_mem
    ], $mol_file_base.prototype, "size", null);
    __decorate([
        $mol_action
    ], $mol_file_base.prototype, "open", null);
    __decorate([
        $mol_mem_key
    ], $mol_file_base, "absolute", null);
    __decorate([
        $mol_action
    ], $mol_file_base, "flush", null);
    __decorate([
        $mol_action
    ], $mol_file_base, "watch_off", null);
    $.$mol_file_base = $mol_file_base;
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    class $mol_file extends $mol_file_base {
    }
    $.$mol_file = $mol_file;
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    function stat_convert(stat) {
        if (!stat)
            return null;
        let type;
        if (stat.isDirectory())
            type = 'dir';
        if (stat.isFile())
            type = 'file';
        if (stat.isSymbolicLink())
            type = 'link';
        if (!type)
            return $mol_fail(new Error(`Unsupported file type`));
        return {
            type,
            size: Number(stat.size),
            atime: stat.atime,
            mtime: stat.mtime,
            ctime: stat.ctime
        };
    }
    function $mol_file_node_buffer_normalize(buf) {
        return new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength);
    }
    $.$mol_file_node_buffer_normalize = $mol_file_node_buffer_normalize;
    class $mol_file_node extends $mol_file {
        static relative(path) {
            return this.absolute($node.path.resolve(this.base, path).replace(/\\/g, '/'));
        }
        watcher(reset) {
            const path = this.path();
            const root = this.root();
            // Если папки/файла нет, watch упадет с ошибкой
            // exists обратится к parent.version и parent.watcher
            // Поэтому у root-папки и выше не надо вызывать exists, иначе поднимется выше base до корня диска
            // exists вызывать надо, что б пересоздавать вотчер при появлении папки или файла
            if (!root && !this.exists())
                return super.watcher();
            let watcher;
            try {
                // Между exists и watch файл может удалиться, в любом случае надо обрабатывать ENOENT
                watcher = $node.fs.watch(path);
            }
            catch (error) {
                if (!(error instanceof Error))
                    error = new Error('Unknown watch error', { cause: error });
                error.message += '\n' + path;
                if (root || error.code !== 'ENOENT') {
                    this.$.$mol_fail_log(error);
                }
                // Если файла нет - вотчер не создается, создастся потом, когда exists поменяется на true.
                // Если создание упало с другой ошибкой - не ломаем работу mol_file, деградируем до не реактивной fs.
                return super.watcher();
            }
            watcher.on('change', (type, name) => {
                if (!name)
                    return;
                const path = $node.path.join(this.path(), name.toString());
                this.constructor.changed_add(type, path);
            });
            watcher.on('error', e => this.$.$mol_fail_log(e));
            let destructed = false;
            watcher.on('close', () => {
                // Если в процессе работы вотчер сам закрылся, надо его переоткрыть
                if (!destructed)
                    setTimeout(() => $mol_wire_async(this).watcher(null), 500);
            });
            return {
                destructor() {
                    destructed = true;
                    watcher.close();
                }
            };
        }
        info(path) {
            try {
                return stat_convert($node.fs.statSync(path));
            }
            catch (error) {
                if (this.$.$mol_fail_catch(error)) {
                    if (error.code === 'ENOENT')
                        return null;
                    if (error.code === 'EPERM')
                        return null;
                    error.message += '\n' + path;
                    this.$.$mol_fail_hidden(error);
                }
            }
            return null;
        }
        ensure() {
            const path = this.path();
            try {
                $node.fs.mkdirSync(path, { recursive: true });
                return null;
            }
            catch (e) {
                if (this.$.$mol_fail_catch(e)) {
                    if (e.code === 'EEXIST')
                        return null;
                    e.message += '\n' + path;
                    this.$.$mol_fail_hidden(e);
                }
            }
        }
        copy(to) {
            $node.fs.copyFileSync(this.path(), to);
        }
        drop() {
            $node.fs.unlinkSync(this.path());
        }
        read() {
            const path = this.path();
            try {
                return $mol_file_node_buffer_normalize($node.fs.readFileSync(path));
            }
            catch (error) {
                if (!$mol_promise_like(error)) {
                    error.message += '\n' + path;
                }
                $mol_fail_hidden(error);
            }
        }
        write(buffer) {
            const path = this.path();
            try {
                $node.fs.writeFileSync(path, buffer);
            }
            catch (error) {
                if (this.$.$mol_fail_catch(error)) {
                    error.message += '\n' + path;
                }
                return this.$.$mol_fail_hidden(error);
            }
        }
        kids() {
            const path = this.path();
            try {
                const kids = $node.fs.readdirSync(path)
                    .filter(name => !/^\.+$/.test(name))
                    .map(name => this.resolve(name));
                return kids;
            }
            catch (e) {
                if (this.$.$mol_fail_catch(e)) {
                    if (e.code === 'ENOENT')
                        return [];
                    e.message += '\n' + path;
                }
                $mol_fail_hidden(e);
            }
        }
        resolve(path) {
            return this.constructor
                .relative($node.path.join(this.path(), path));
        }
        relate(base = this.constructor.relative('.')) {
            return $node.path.relative(base.path(), this.path()).replace(/\\/g, '/');
        }
        readable(opts) {
            const { Readable } = $node['node:stream'];
            const stream = $node.fs.createReadStream(this.path(), {
                flags: 'r',
                autoClose: true,
                start: opts?.start,
                end: opts?.end,
                encoding: 'binary',
            });
            return Readable.toWeb(stream);
        }
        writable(opts) {
            const { Writable } = $node['node:stream'];
            const stream = $node.fs.createWriteStream(this.path(), {
                flags: 'w+',
                autoClose: true,
                start: opts?.start,
                encoding: 'binary',
            });
            return Writable.toWeb(stream);
        }
    }
    __decorate([
        $mol_mem
    ], $mol_file_node.prototype, "watcher", null);
    __decorate([
        $mol_action
    ], $mol_file_node.prototype, "info", null);
    __decorate([
        $mol_action
    ], $mol_file_node.prototype, "ensure", null);
    __decorate([
        $mol_action
    ], $mol_file_node.prototype, "copy", null);
    __decorate([
        $mol_action
    ], $mol_file_node.prototype, "drop", null);
    __decorate([
        $mol_action
    ], $mol_file_node.prototype, "read", null);
    __decorate([
        $mol_action
    ], $mol_file_node.prototype, "write", null);
    __decorate([
        $mol_mem_key
    ], $mol_file_node.prototype, "readable", null);
    __decorate([
        $mol_mem
    ], $mol_file_node.prototype, "writable", null);
    $.$mol_file_node = $mol_file_node;
    $.$mol_file = $mol_file_node;
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    class $mol_state_local_node extends $mol_state_local {
        static dir() {
            const base = process.env.XDG_DATA_HOME || ($node.os.homedir() + '/.local/share');
            return $mol_file.absolute(base).resolve('./mol_state_local');
        }
        static value(key, next) {
            const file = this.dir().resolve(encodeURIComponent(key) + '.json');
            if (next === null) {
                file.exists(false);
                return null;
            }
            const arg = next === undefined ? undefined : JSON.stringify(next);
            return JSON.parse(file.text(arg) || 'null');
        }
    }
    __decorate([
        $mol_mem
    ], $mol_state_local_node, "dir", null);
    __decorate([
        $mol_mem_key
    ], $mol_state_local_node, "value", null);
    $.$mol_state_local_node = $mol_state_local_node;
    $.$mol_state_local = $mol_state_local_node;
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    /**
     * Localisation in $mol framework
     * @see https://mol.hyoo.ru/#!section=docs/=s5aqnb_odub8l
     */
    class $mol_locale extends $mol_object {
        static lang_default() {
            return 'en';
        }
        static lang(next) {
            return this.$.$mol_state_local.value('locale', next) || $mol_dom_context.navigator.language.replace(/-.*/, '') || this.lang_default();
        }
        static langs_rtl() {
            return ['ar', 'he', 'fa', 'ur', 'yi', 'ps', 'ug', 'sd'];
        }
        static direction() {
            const lang = this.lang();
            let direction;
            try {
                direction = new Intl.Locale(lang).getTextInfo().direction;
            }
            catch (e) {
                $mol_fail_log(e);
            }
            return direction ?? (this.langs_rtl().includes(lang) ? 'rtl' : 'ltr');
        }
        static source(lang) {
            return JSON.parse(this.$.$mol_file.relative(`web.locale=${lang}.json`).text().toString());
        }
        static texts(lang, next) {
            if (next)
                return next;
            try {
                return this.source(lang).valueOf();
            }
            catch (error) {
                if ($mol_fail_catch(error)) {
                    const def = this.lang_default();
                    if (lang === def)
                        throw error;
                }
            }
            return {};
        }
        static text(key) {
            const lang = this.lang();
            const target = this.texts(lang)[key];
            if (target)
                return target;
            this.warn(key);
            const en = this.texts('en')[key];
            if (!en)
                return key;
            return en;
        }
        static warn(key) {
            console.warn(`Not translated to "${this.lang()}": ${key}`);
            return null;
        }
    }
    __decorate([
        $mol_mem
    ], $mol_locale, "lang_default", null);
    __decorate([
        $mol_mem
    ], $mol_locale, "lang", null);
    __decorate([
        $mol_mem
    ], $mol_locale, "direction", null);
    __decorate([
        $mol_mem_key
    ], $mol_locale, "source", null);
    __decorate([
        $mol_mem_key
    ], $mol_locale, "texts", null);
    __decorate([
        $mol_mem_key
    ], $mol_locale, "text", null);
    __decorate([
        $mol_mem_key
    ], $mol_locale, "warn", null);
    $.$mol_locale = $mol_locale;
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    const err = $mol_view_tree2_error_str;
    function name_of(prop) {
        return this.$mol_view_tree2_prop_parts(prop).name;
    }
    function params_of(prop, bidi = true) {
        const { key, next } = this.$mol_view_tree2_prop_parts(prop);
        return prop.struct('(,)', [
            ...key
                ? [prop.struct('id')]
                : [],
            ...(bidi && next) ? [prop.struct('next')] : [],
        ]);
    }
    function args_of(prop, bidi = true) {
        const { key, next } = this.$mol_view_tree2_prop_parts(prop);
        return prop.struct('(,)', [
            ...key
                ? key.length > 1
                    ? [prop.data(key.slice(1))]
                    : [prop.struct('id')]
                : [],
            ...(bidi && next) ? [prop.struct('next')] : [],
        ]);
    }
    function call_method_name(child, optional) {
        return child.struct(optional ? '?.[]' : '[]', [
            child.data(name_of.call(this, child))
        ]);
    }
    function call_of(bind, bidi = true) {
        if (bind.kids.length === 0) {
            return this.$mol_fail(err `Required one child at ${bind.span}`);
        }
        const chain = [bind.struct('this')];
        for (const child of bind.kids) {
            chain.push(call_method_name.call(this, child, chain.length > 1), args_of.call(this, child, bidi));
        }
        return bind.struct('()', chain);
    }
    const localized_string = $$.$mol_tree2_from_string(`
		()
			this
			[] \\$
			[] \\$mol_locale
			[] \\text
			(,) #key
	`, 'localized_string');
    function klass_body(acc, prop) {
        const { klass, members, addons } = acc;
        const { name, key, next } = this.$mol_view_tree2_prop_parts(prop);
        const decorate = () => {
            return prop.struct('()', [
                prop.struct(key ? '$mol_mem_key' : '$mol_mem'),
                prop.struct('(,)', [
                    prop.struct('()', [
                        klass.struct('$'),
                        prop.struct('[]', [
                            klass.data(klass.type),
                        ]),
                        prop.struct('[]', [
                            prop.data('prototype'),
                        ]),
                    ]),
                    prop.data(name),
                ]),
            ]);
        };
        const op = prop.kids[0];
        const is_delegate = op?.type === '<=>' || op?.type === '=';
        if (!is_delegate && next)
            addons.push(decorate());
        const val = prop.hack({
            '@': (locale, belt, context) => {
                const chain = context.chain?.join('_');
                return localized_string.hack({
                    '#key': key => [locale.data(`${klass.type}_${name}${chain ? `_${chain}` : ''}`)],
                });
            },
            '<=': bind => [call_of.call(this, bind, false)],
            '<=>': bind => [call_of.call(this, bind, true)],
            '=>': bind => [],
            '^': (ref, belt, context) => [
                ref.struct('...', [
                    // prop ^ foo
                    ref.kids[0]?.type
                        ? ref.struct('()', [
                            ref.struct('this'),
                            ref.struct('[]', [ref.data(name_of.call(this, ref.kids[0]))]),
                            args_of.call(this, ref.kids[0])
                        ])
                        // Having $having foo / ^
                        : context.chain
                            ? ref.struct('()', [
                                ref.struct('this'),
                                ref.struct('[]', [ref.data('$')]),
                                ref.struct('[]', [ref.data(op.type)]),
                                ref.struct('[]', [ref.data('prototype')]),
                                ref.struct('[]', [ref.data(context.chain[0])]),
                                ref.struct('[]', [ref.data('call')]),
                                ref.struct('(,)', [ref.struct('obj')]),
                                ...context.chain.slice(1).map(field => ref.struct('[]', [ref.data(field)]))
                            ])
                            // prop ^
                            : ref.struct('()', [
                                ref.struct('super'),
                                ref.struct('[]', [ref.data(name)]),
                                ref.struct('(,)')
                            ]),
                ]),
            ],
            '=': bind => [bind.struct('()', [
                    bind.struct('this'),
                    ...bind.hack({ '': (method, belt, ctx) => [
                            call_method_name.call(this, method, (ctx.item_index++) > 0),
                            args_of.call(this, method),
                            ...method.hack(belt),
                        ] }, { item_index: 0 }),
                ])],
            '': (input, belt, context) => {
                if (input.type[0] === '*') {
                    return [
                        input.struct('{,}', input.kids.map(field => {
                            if (field.type === '^')
                                return field.list([field]).hack(belt, context)[0];
                            const field_name = (field.type || field.value).replace(/\?\w*$/, '');
                            return field.struct(':', [
                                field.data(field_name),
                                field.kids[0].type === '<=>'
                                    ? field.struct('=>', [
                                        params_of.call(this, field),
                                        ...field.hack(belt),
                                    ])
                                    : field.hack(belt, { ...context, chain: [...context.chain ?? [], field_name] })[0],
                            ]);
                        }).filter(this.$mol_guard_defined))
                    ];
                }
                if (input.type[0] === '/')
                    return [
                        input.struct('[,]', input.hack(belt, context)),
                    ];
                if (input.type && $mol_tree2_js_is_number(input.type))
                    return [
                        input
                    ];
                if ($mol_view_tree2_class_match(input)) {
                    if (!next)
                        addons.push(decorate());
                    const overrides = [];
                    for (const over of input.kids) {
                        if (over.type[0] === '/')
                            continue;
                        const bind = over.kids[0];
                        if (bind.type === '=>')
                            continue;
                        const over_name = name_of.call(this, over);
                        const body = [
                            args_of.call(this, over),
                            over.struct('()', over.hack(belt, { chain: [over.type] })),
                        ];
                        overrides.push(over.struct('=', [
                            over.struct('()', [
                                over.struct('obj'),
                                over.struct('[]', [
                                    over.data(over_name),
                                ]),
                            ]),
                            over.struct('=>', body),
                        ]));
                    }
                    return [
                        input.struct('const', [
                            input.struct('obj'),
                            input.struct('new', [
                                input.struct('this'),
                                input.struct('[]', [
                                    input.data('$'),
                                ]),
                                input.struct('[]', [
                                    input.data(input.type.replace(/<.+>/g, '')),
                                ]),
                                input.struct('(,)', input.select('/', null).hack(belt)),
                            ]),
                        ]),
                        ...overrides,
                        input.struct('obj'),
                    ];
                }
                return [input];
            },
        });
        members.push(prop.struct('.', [
            prop.data(name),
            params_of.call(this, prop),
            prop.struct('{;}', [
                ...next && !is_delegate ? [
                    prop.struct('if', [
                        prop.struct('(!==)', [
                            prop.struct('next'),
                            prop.struct('undefined'),
                        ]),
                        prop.struct('return', [
                            prop.struct('next'),
                        ]),
                    ]),
                ] : [],
                ...val.slice(0, -1),
                prop.struct('return', val.slice(-1)),
            ]),
        ]));
        return acc;
    }
    function $mol_view_tree2_to_js(descr) {
        descr = $mol_view_tree2_classes(descr);
        const definitions = [];
        for (const klass of descr.kids) {
            const parent = klass.kids[0];
            const props = this.$mol_view_tree2_class_props(klass);
            const addons = [];
            const members = [];
            const acc = { klass, addons, members };
            for (const prop of props) {
                try {
                    klass_body.call(this, acc, prop);
                }
                catch (e) {
                    e.message += ` at ${prop.span}`;
                    $mol_fail_hidden(e);
                }
            }
            definitions.push(klass.struct('=', [
                klass.struct('()', [
                    klass.struct('$'),
                    klass.struct('[]', [
                        klass.data(klass.type),
                    ]),
                ]),
                klass.struct('class', [
                    klass.struct(klass.type),
                    parent.struct('extends', [
                        parent.struct('()', [
                            parent.struct('$'),
                            parent.struct('[]', [
                                parent.data(parent.type),
                            ]),
                        ]),
                    ]),
                    klass.struct('{}', members),
                ]),
            ]), ...addons);
        }
        return descr.list([
            descr.struct(';', definitions)
        ]);
    }
    $.$mol_view_tree2_to_js = $mol_view_tree2_to_js;
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    function $bog_vmap_scene_click(realm, x, y, mods) {
        const target = realm.document.elementFromPoint(x, y);
        if (!target)
            return null;
        const Pointer = realm.PointerEvent ?? realm.MouseEvent;
        const common = {
            bubbles: true,
            cancelable: true,
            composed: true,
            clientX: x,
            clientY: y,
            button: 0,
            ...mods,
        };
        const pointer = {
            ...common,
            pointerId: 1,
            pointerType: 'mouse',
            isPrimary: true,
        };
        target.dispatchEvent(new Pointer('pointerdown', { ...pointer, buttons: 1 }));
        for (let el = target; el; el = el.parentElement) {
            if ((el.tabIndex ?? -1) < 0 && !el.isContentEditable)
                continue;
            el.focus?.();
            break;
        }
        target.dispatchEvent(new Pointer('pointerup', { ...pointer, buttons: 0 }));
        target.dispatchEvent(new realm.MouseEvent('click', { ...common, buttons: 0, detail: 1 }));
        return target;
    }
    $.$bog_vmap_scene_click = $bog_vmap_scene_click;
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    class $mol_dom_listener extends $mol_object {
        _node;
        _event;
        _handler;
        _config;
        constructor(_node, _event, _handler, _config = { passive: true }) {
            super();
            this._node = _node;
            this._event = _event;
            this._handler = _handler;
            this._config = _config;
            this._node.addEventListener(this._event, this._handler, this._config);
        }
        destructor() {
            this._node.removeEventListener(this._event, this._handler, this._config);
            super.destructor();
        }
    }
    $.$mol_dom_listener = $mol_dom_listener;
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    function $bog_vmap_scene_measure(root, how) {
        const sizes = {};
        const nodes = [];
        const base = root.dom_node().getBoundingClientRect();
        const zoom = how.zoom || 1;
        const put = (key, view) => {
            const node = view.dom_node();
            if (!node.isConnected)
                return;
            const box = node.getBoundingClientRect();
            sizes[key] = {
                x: (box.left - base.left) / zoom,
                y: (box.top - base.top) / zoom,
                width: box.width / zoom,
                height: box.height / zoom,
            };
            nodes.push(node);
        };
        const walk = (view, path, depth) => {
            if (depth > 16)
                return;
            let index = 0;
            for (const kid of how.kids_of(view)) {
                const sub = how.view_of(kid);
                if (!sub)
                    continue;
                const key = path + '/' + (how.prop_of(sub) || index);
                index++;
                put(key, sub);
                walk(sub, key, depth + 1);
            }
        };
        put(how.key, root);
        walk(root, how.key, 0);
        return { sizes, nodes };
    }
    $.$bog_vmap_scene_measure = $bog_vmap_scene_measure;
    function $bog_vmap_scene_measure_watch(watcher, prev, next) {
        const kept = new Set(next);
        for (const node of prev)
            if (!kept.has(node))
                watcher.unobserve(node);
        for (const node of kept)
            if (!prev.has(node))
                watcher.observe(node);
        return kept;
    }
    $.$bog_vmap_scene_measure_watch = $bog_vmap_scene_measure_watch;
})($ || ($ = {}));

;
"use strict";

;
"use strict";

;
"use strict";

;
"use strict";

;
"use strict";
var $;
(function ($) {
    function $mol_style_sheet(Component, config0) {
        let rules = [];
        const block = $mol_dom_qname($mol_ambient({}).$mol_func_name(Component));
        const kebab = (name) => name.replace(/[A-Z]/g, letter => '-' + letter.toLowerCase());
        const make_class = (prefix, path, config) => {
            const props = [];
            const selector = (prefix, path) => {
                if (path.length === 0)
                    return prefix || `[${block}]`;
                let res = `[${block}_${path.join('_')}]`;
                if (prefix)
                    res = prefix + ' :where(' + res + ')';
                return res;
            };
            for (const key of Object.keys(config).reverse()) {
                if (/^(--)?[a-z]/.test(key)) {
                    const addProp = (keys, val) => {
                        if (Array.isArray(val)) {
                            if (val[0] && [Array, Object].includes(val[0].constructor)) {
                                val = val.map(v => {
                                    return Object.entries(v).map(([n, a]) => {
                                        if (a === true)
                                            return kebab(n);
                                        if (a === false)
                                            return null;
                                        return String(a);
                                    }).filter(Boolean).join(' ');
                                }).join(',');
                            }
                            else {
                                val = val.join(' ');
                            }
                            props.push(`\t${keys.join('-')}: ${val};\n`);
                        }
                        else if (val.constructor === Object) {
                            for (let suffix of Object.keys(val).reverse()) {
                                addProp([...keys, kebab(suffix)], val[suffix]);
                            }
                        }
                        else {
                            props.push(`\t${keys.join('-')}: ${val};\n`);
                        }
                    };
                    addProp([kebab(key)], config[key]);
                }
                else if (/^[A-Z]/.test(key)) {
                    make_class(prefix, [...path, key.toLowerCase()], config[key]);
                }
                else if (key[0] === '$') {
                    make_class(selector(prefix, path) + ' :where([' + $mol_dom_qname(key) + '])', [], config[key]);
                }
                else if (key === '>') {
                    const types = config[key];
                    for (let type of Object.keys(types).reverse()) {
                        make_class(selector(prefix, path) + ' > :where([' + $mol_dom_qname(type) + '])', [], types[type]);
                    }
                }
                else if (key === '@') {
                    const attrs = config[key];
                    for (let name of Object.keys(attrs).reverse()) {
                        for (let val in attrs[name]) {
                            make_class(selector(prefix, path) + ':where([' + name + '=' + JSON.stringify(val) + '])', [], attrs[name][val]);
                        }
                    }
                }
                else if (key === '@media' || key === '@container') {
                    const media = config[key];
                    for (let query of Object.keys(media).reverse()) {
                        rules.push('}\n');
                        make_class(prefix, path, media[query]);
                        rules.push(`${key} ${query} {\n`);
                    }
                }
                else if (key === '@starting-style') {
                    const styles = config[key];
                    rules.push('}\n');
                    make_class(prefix, path, styles);
                    rules.push(`${key} {\n`);
                }
                else if (key[0] === '[' && key[key.length - 1] === ']') {
                    const attr = key.slice(1, -1);
                    const vals = config[key];
                    for (let val of Object.keys(vals).reverse()) {
                        make_class(selector(prefix, path) + ':where([' + attr + '=' + JSON.stringify(val) + '])', [], vals[val]);
                    }
                }
                else {
                    make_class(selector(prefix, path) + key, [], config[key]);
                }
            }
            if (props.length) {
                rules.push(`${selector(prefix, path)} {\n${props.reverse().join('')}}\n`);
            }
        };
        make_class('', [], config0);
        return rules.reverse().join('');
    }
    $.$mol_style_sheet = $mol_style_sheet;
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    /**
     * CSS in TS.
     * Statically typed CSS style sheets. Following samples show which CSS code are generated from TS code.
     * @see https://mol.hyoo.ru/#!section=docs/=xwq9q5_f966fg
     */
    function $mol_style_define(Component, config) {
        return $mol_style_attach(Component.name, $mol_style_sheet(Component, config));
    }
    $.$mol_style_define = $mol_style_define;
})($ || ($ = {}));

;
"use strict";


;
"use strict";
var $;
(function ($) {
    var $$;
    (function ($$) {
        const style_scope = 'bog_vmap_scene:';
        const spots_id = 'bog_vmap_spots:stage';
        const libs_id = 'bog_vmap_libs:stage';
        const spot_name_ok = /^[a-zA-Z_]\w*$/;
        const cull_slack_min = 400;
        const class_name_ok = /^\$[a-zA-Z][\w$]*$/;
        const unmounted = { made: null, pack: '', root: '', supers: {}, error: '', klass: '' };
        class $bog_vmap_scene extends $.$bog_vmap_scene {
            error_sent(at, next) {
                return next === undefined ? null : next;
            }
            doc_src(next) {
                return next ?? '';
            }
            doc_root(next) {
                return next ?? '';
            }
            doc_js(next) {
                return next ?? {};
            }
            doc_css(next) {
                return next ?? '';
            }
            spots(next) {
                return next ?? {};
            }
            sizes_seen(next) {
                return next ?? {};
            }
            screen() {
                const rect = this.view_rect();
                return rect && { width: rect.width, height: rect.height };
            }
            shown() {
                const spots = this.spots();
                const names = Object.keys(spots);
                if (!names.length)
                    return new Set();
                const screen = this.screen();
                if (!screen)
                    return new Set(names);
                const view = this.$.$bog_vmap_scene_cull_viewport(this.camera(), screen);
                const slack = Math.max(cull_slack_min, Math.max(view.width, view.height) / 2);
                return this.$.$bog_vmap_scene_cull(spots, this.sizes_seen(), view, slack, names);
            }
            sub_shown(kids) {
                const spots = this.spots();
                const shown = this.shown();
                return kids.filter(kid => {
                    if (!this.view_like(kid))
                        return true;
                    const prop = this.view_prop(kid);
                    if (!prop)
                        return true;
                    if (!(prop in spots))
                        return true;
                    return shown.has(prop);
                });
            }
            cull_attach(made) {
                Object.defineProperty(made, 'sub_visible', {
                    configurable: true,
                    writable: true,
                    value: () => this.sub_shown(made.sub() ?? []),
                });
            }
            camera(next) {
                return next ?? { x: 0, y: 0, zoom: 1 };
            }
            grid_shift() {
                const { x, y, zoom } = this.camera();
                return new this.$.$mol_vector_2d(-x * zoom, -y * zoom);
            }
            grid_scale() {
                const zoom = this.camera().zoom;
                return new this.$.$mol_vector_2d(zoom, zoom);
            }
            camera_transform() {
                const { x, y, zoom } = this.camera();
                return `translate(${-x * zoom}px,${-y * zoom}px) scale(${zoom})`;
            }
            pack_uri(next) {
                return next ?? '';
            }
            importer() {
                const importer = this.$.$mol_import;
                return { script: (uri) => importer.script(uri) };
            }
            pack_ready() {
                const uri = this.pack_uri();
                if (!uri)
                    return uri;
                this.importer().script(uri);
                this.$.$mol_try = handler => {
                    try {
                        return handler();
                    }
                    catch (error) {
                        return error;
                    }
                };
                return uri;
            }
            pack_note() {
                const uri = this.pack_uri();
                if (!uri)
                    return 'Ожидание библиотеки компонентов…';
                try {
                    this.pack_ready();
                    return '';
                }
                catch (error) {
                    if (this.$.$mol_promise_like(error))
                        return `Загрузка библиотеки компонентов… ${uri}`;
                    return String(error?.message ?? error);
                }
            }
            pack_task() {
                const note = this.pack_note();
                return new this.$.$mol_after_timeout(60, () => this.error_post('pack', note, ''));
            }
            sandbox() {
                const host = this.$;
                const sandbox = Object.create(host);
                Object.defineProperty(sandbox, '$', { value: sandbox, writable: true, configurable: true });
                return sandbox;
            }
            libs(next) {
                return next ?? [];
            }
            libs_parsed() {
                const defs = [];
                const js = {};
                for (const part of this.libs()) {
                    const src = part.tree.replace(/\n?$/, '\n');
                    const kids = this.$.$mol_view_tree2_normalize(this.$.$mol_tree2_from_string(src, 'lib.view.tree')).kids;
                    defs.push(...kids);
                    const name = kids[0]?.type;
                    if (name && part.js)
                        js[name] = part.js;
                }
                return { defs: defs, js: js };
            }
            doc_tree() {
                const src = this.doc_src().replace(/\n?$/, '\n');
                const defs = this.$.$mol_view_tree2_normalize(this.$.$mol_tree2_from_string(src, 'vmap.view.tree'));
                return defs.clone(this.$.$bog_vmap_scene_order(this.libs_parsed().defs, defs.kids));
            }
            supers() {
                const map = {};
                for (const def of this.doc_tree().kids)
                    map[def.type] = def.kids[0]?.type ?? '';
                return map;
            }
            shapes() {
                const own = {};
                for (const def of this.doc_tree().kids) {
                    const declared = new Set();
                    const keyed = new Set();
                    for (const prop of def.kids[0]?.kids ?? []) {
                        const parts = this.$.$mol_view_tree2_prop_parts(prop);
                        declared.add(parts.name);
                        if (parts.key)
                            keyed.add(parts.name);
                    }
                    own[def.type] = { declared, keyed };
                }
                const supers = this.supers();
                for (const name of Object.keys(own)) {
                    const seen = new Set([name]);
                    for (let base = supers[name]; base && own[base] && !seen.has(base); base = supers[base]) {
                        seen.add(base);
                        for (const prop of own[base].declared)
                            own[name].declared.add(prop);
                        for (const prop of own[base].keyed)
                            own[name].keyed.add(prop);
                    }
                }
                return own;
            }
            cells_code(self) {
                const keyed = [];
                const changeable = [];
                for (const prop of self.kids[0]?.kids ?? []) {
                    const { name, key, next } = this.$.$mol_view_tree2_prop_parts(prop);
                    if (key)
                        keyed.push(name);
                    else if (next)
                        changeable.push(name);
                }
                return `$.$bog_vmap_scene_cells( $[ ${JSON.stringify(self.type)} ], ${JSON.stringify(keyed)}, ${JSON.stringify(changeable)} );`;
            }
            code_parts() {
                const root = this.doc_root();
                if (!class_name_ok.test(root))
                    this.$.$mol_fail(new Error(`Root class name ${JSON.stringify(root)} is not an identifier`));
                const tree = this.doc_tree();
                if (!tree.kids.some(def => def.type === root))
                    this.$.$mol_fail(new Error(`Class ${root} is not declared by the document`));
                const bodies = { ...this.libs_parsed().js, ...this.doc_js() };
                const parts = [];
                for (const def of tree.kids) {
                    const name = def.type;
                    if (!class_name_ok.test(name))
                        this.$.$mol_fail(this.fault_named(new Error(`Class name ${JSON.stringify(name)} is not an identifier`), name));
                    try {
                        parts.push({ klass: name, js: this.class_code(tree, def, bodies[name]).join('\n') });
                    }
                    catch (error) {
                        this.$.$mol_fail(this.fault_named(error, name));
                    }
                }
                return parts;
            }
            code() {
                return this.code_parts().map(part => part.js).join('\n');
            }
            fault_named(error, klass) {
                return Object.assign(error, { klass });
            }
            class_code(tree, def, js) {
                const name = def.type;
                const chunks = [];
                chunks.push(';' + this.$.$mol_tree2_text_to_string_mapped_js(this.$.$mol_tree2_js_to_text(this.$.$mol_view_tree2_to_js(tree.clone([def])))));
                if (!js)
                    return chunks;
                const cls = JSON.stringify(name);
                chunks.push(`;$[ ${cls} ] = class ${name} extends $[ ${cls} ] {`, js, '}', ';' + this.cells_code(def) + ';');
                return chunks;
            }
            build() {
                const code = this.code();
                const sandbox = this.sandbox();
                const root = this.doc_root();
                try {
                    new Function('$', code)(sandbox);
                }
                catch (error) {
                    this.$.$mol_fail(this.fault_named(error, this.culprit()));
                }
                const Root = Reflect.get(sandbox, root);
                if (typeof Root !== 'function')
                    this.$.$mol_fail(new Error(`Class ${root} is not registered by the compiled code`));
                return { Root: Root };
            }
            culprit() {
                const scratch = Object.create(this.sandbox());
                Object.defineProperty(scratch, '$', { value: scratch, writable: true, configurable: true });
                for (const part of this.code_parts()) {
                    try {
                        new Function('$', part.js)(scratch);
                    }
                    catch {
                        return part.klass;
                    }
                }
                return '';
            }
            identity_kept(live, pack, root, supers) {
                if (!live.made)
                    return false;
                if (live.pack !== pack)
                    return false;
                if (live.root !== root)
                    return false;
                for (const name of Object.keys(supers)) {
                    const was = live.supers[name];
                    if (was !== undefined && was !== supers[name])
                        return false;
                }
                return true;
            }
            mount() {
                const prev = $mol_wire_probe(() => this.mount()) ?? unmounted;
                const src = this.doc_src();
                const root = this.doc_root();
                const pack = this.pack_uri();
                if (!src.trim() || !root || !pack)
                    return unmounted;
                try {
                    this.pack_ready();
                    const Root = this.build().Root;
                    const supers = this.supers();
                    if (this.identity_kept(prev, pack, root, supers)) {
                        this.$.$bog_vmap_scene_swap(prev.made, name => Reflect.get(this.sandbox(), name), name => this.shapes()[name] ?? null);
                        return { ...prev, supers: { ...prev.supers, ...supers }, error: '', klass: '' };
                    }
                    const made = Root.make({ $: this.sandbox() });
                    this.cull_attach(made);
                    return { made, pack, root, supers, error: '', klass: '' };
                }
                catch (error) {
                    if (this.$.$mol_promise_like(error))
                        return this.$.$mol_fail_hidden(error);
                    return {
                        ...prev,
                        error: String(error?.message ?? error),
                        klass: String(error?.klass ?? ''),
                    };
                }
            }
            instance() {
                return this.mount().made;
            }
            compile_error() {
                return this.mount().error;
            }
            compile_class() {
                return this.mount().klass;
            }
            css_attach() {
                const root = this.doc_root();
                const css = this.doc_css();
                const id = root && style_scope + root;
                this.styles_sweep(id);
                if (!id)
                    return null;
                return this.$.$mol_style_attach(id, css);
            }
            spots_attach() {
                return this.$.$mol_style_attach(spots_id, this.spots_css());
            }
            libs_css_attach() {
                const css = this.libs().map(part => part.css).filter(Boolean).join('\n');
                return this.$.$mol_style_attach(libs_id, css);
            }
            spots_css() {
                const attr = this.doc_root().replace(/^\$/, '');
                if (!attr || !class_name_ok.test(this.doc_root()))
                    return '';
                const rules = [`[${attr}] { position: relative !important; }`];
                for (const [name, spot] of Object.entries(this.spots())) {
                    if (!spot_name_ok.test(name))
                        continue;
                    if (!Number.isFinite(spot?.x) || !Number.isFinite(spot?.y))
                        continue;
                    rules.push(`[${attr}] > [${attr}_${name.toLowerCase()}] {`
                        + ` position: absolute !important;`
                        + ` left: ${spot.x}px !important;`
                        + ` top: ${spot.y}px !important;`
                        + ` }`);
                }
                return rules.join('\n') + '\n';
            }
            styles_sweep(keep) {
                const doc = this.$.$mol_dom_context.document;
                if (!doc)
                    return;
                const prefix = '$mol_style_attach:' + style_scope;
                const kept = keep && '$mol_style_attach:' + keep;
                for (const el of Array.from(doc.head.querySelectorAll(`style[id^="${prefix}"]`))) {
                    if (el.id === kept)
                        continue;
                    el.remove();
                }
            }
            theme(next) {
                return next ?? null;
            }
            scheme() {
                return this.theme()?.includes('light') ? 'light' : 'dark';
            }
            scheme_attach() {
                const scheme = this.scheme();
                this.$.$mol_dom_context.document.documentElement.style.colorScheme = scheme;
                return scheme;
            }
            stage() {
                this.css_attach();
                this.spots_attach();
                this.libs_css_attach();
                if (this.pack_note())
                    return [this.Wait()];
                const made = this.instance();
                return made ? [made.dom_tree()] : [];
            }
            post(message) {
                this.$.$bog_vmap_bridge_send(this.peer(), message);
            }
            values_wanted(next) {
                return next ?? [];
            }
            values_at(next) {
                return next ?? 0;
            }
            values_period() {
                return 250;
            }
            now() {
                return Date.now();
            }
            values_task() {
                const names = this.values_wanted();
                if (!names.length)
                    return null;
                const made = this.instance();
                if (!made)
                    return null;
                const values = this.$.$bog_vmap_scene_values(made, names);
                const sent_at = $mol_wire_probe(() => this.values_at()) ?? 0;
                const wait = Math.max(0, this.values_period() - (this.now() - sent_at));
                return new this.$.$mol_after_timeout(wait, () => {
                    this.values_at(this.now());
                    this.post({ kind: 'values', values });
                });
            }
            peer() {
                return this.$.$mol_dom_context.parent;
            }
            message_receive(event) {
                if (!event)
                    return;
                const message = this.$.$bog_vmap_bridge_read(event, this.peer());
                if (!message)
                    return;
                switch (message.kind) {
                    case 'doc_set': {
                        this.doc_root(message.root);
                        this.doc_src(message.src);
                        const bodies = message.js;
                        this.doc_js(bodies && typeof bodies === 'object' ? bodies : {});
                        return;
                    }
                    case 'pack_set':
                        this.pack_uri(String(message.uri ?? ''));
                        return;
                    case 'theme_set':
                        this.theme(String(message.theme ?? ''));
                        return;
                    case 'css_set':
                        this.doc_css(message.css);
                        return;
                    case 'libs_set':
                        this.libs(Array.isArray(message.parts) ? message.parts : []);
                        return;
                    case 'spots_set':
                        this.spots(message.spots);
                        return;
                    case 'camera_set':
                        this.camera(message.camera);
                        return;
                    case 'values_want':
                        this.values_wanted(Array.isArray(message.names) ? message.names.map(String) : []);
                        return;
                    case 'click_at': {
                        this.click_apply(message.x, message.y, message.mods);
                        this.report_send();
                        return;
                    }
                    case 'ping':
                        this.post({ kind: 'pong', nonce: message.nonce });
                        return;
                }
            }
            click_apply(x, y, mods) {
                const camera = this.camera();
                const zoom = camera.zoom || 1;
                this.$.$bog_vmap_scene_click(this.$.$mol_dom_context, (x - camera.x) * zoom, (y - camera.y) * zoom, mods);
            }
            message_listener() {
                return new this.$.$mol_dom_listener(this.$.$mol_dom_context, 'message', $mol_wire_async(this).message_receive);
            }
            boot() {
                return new this.$.$mol_after_tick(() => this.post({ kind: 'ready' }));
            }
            key_listener() {
                return new this.$.$mol_dom_listener(this.$.$mol_dom_context, 'keydown', $mol_wire_async(this).key_relay);
            }
            key_relay(event) {
                if (event?.key !== 'Escape')
                    return;
                this.post({ kind: 'key', key: 'Escape' });
            }
            resize_watch() {
                const observer = new ResizeObserver(() => this.report_send());
                return { observer, destructor: () => observer.disconnect() };
            }
            resize_seen = new Set();
            resize_sync(nodes) {
                this.resize_seen = this.$.$bog_vmap_scene_measure_watch(this.resize_watch().observer, this.resize_seen, nodes);
            }
            report_task() {
                this.doc_src();
                this.doc_root();
                this.doc_js();
                this.doc_css();
                this.libs();
                this.spots();
                this.camera();
                const made = this.instance();
                if (made)
                    try {
                        made.dom_final();
                    }
                    catch { }
                return new this.$.$mol_after_timeout(120, () => this.report_send());
            }
            report_send() {
                try {
                    this.report_post();
                }
                catch (error) {
                    if (this.$.$mol_promise_like(error))
                        return;
                    this.post({ kind: 'error', at: 'runtime', message: 'report: ' + String(error?.message ?? error) });
                }
            }
            report_post() {
                const made = this.instance();
                const compiled = this.compile_error();
                this.error_post('compile', compiled, compiled && made ? this.class_node(made, this.compile_class()) : '');
                const measured = made ? this.sizes_of(made) : { sizes: {}, nodes: [] };
                const sizes = measured.sizes;
                this.resize_sync(measured.nodes);
                this.sizes_remember(sizes);
                this.post({ kind: 'sizes', sizes });
                const failed = made ? this.render_error(made) : { message: '', node: '' };
                this.error_post('runtime', failed.message, failed.node);
            }
            sizes_remember(sizes) {
                const prefix = this.doc_root() + '/';
                const seen = { ...this.sizes_seen() };
                for (const key of Object.keys(sizes)) {
                    if (!key.startsWith(prefix))
                        continue;
                    const name = key.slice(prefix.length);
                    if (name.includes('/'))
                        continue;
                    seen[name] = sizes[key];
                }
                this.sizes_seen(seen);
            }
            render_error(made) {
                const found = this.$.$bog_vmap_scene_seek(made, this.walk_of(made), view => this.view_broken(view) !== '');
                if (!found)
                    return { message: '', node: '' };
                return { message: this.view_broken(found.view), node: this.part_of(found.path) };
            }
            part_of(path) {
                const prefix = this.doc_root() + '/';
                if (!path.startsWith(prefix))
                    return '';
                return path.slice(prefix.length).split('/')[0] ?? '';
            }
            view_broken(view) {
                let node;
                try {
                    node = view.dom_node();
                }
                catch {
                    return '';
                }
                const broken = node.getAttribute('mol_view_error');
                if (!broken || broken === 'Promise' || broken === '$mol_promise_blocker')
                    return '';
                const text = (node.textContent ?? '').replace(/\s+/g, ' ').trim().slice(0, 500);
                return text ? `${broken}: ${text}` : broken;
            }
            class_node(made, klass) {
                if (!klass)
                    return '';
                if (klass === this.doc_root())
                    return '';
                const found = this.$.$bog_vmap_scene_seek(made, this.walk_of(made), view => view.constructor?.name === klass);
                return found ? this.part_of(found.path) : '';
            }
            walk_of(made) {
                return {
                    key: this.doc_root(),
                    view_of: (kid) => this.view_like(kid) ? kid : null,
                    kids_of: (view) => { try {
                        return view.sub() ?? [];
                    }
                    catch {
                        return [];
                    } },
                    prop_of: (view) => this.view_prop(view),
                };
            }
            error_post(at, message, node) {
                const next = message || null;
                if (($mol_wire_probe(() => this.error_sent(at)) ?? null) === next)
                    return;
                this.error_sent(at, next);
                this.post({ kind: 'error', at, message: next, node });
            }
            sizes_of(root) {
                return this.$.$bog_vmap_scene_measure(root, {
                    ...this.walk_of(root),
                    zoom: this.camera().zoom,
                });
            }
            view_like(kid) {
                return typeof kid?.dom_node === 'function';
            }
            view_prop(view) {
                const owner = this.$.$mol_owning_get(view);
                const name = owner?.task?.name?.trim();
                if (!name)
                    return '';
                const key = owner.args?.[0];
                return key === undefined ? name : `${name}(${String(key)})`;
            }
            auto() {
                return [
                    ...super.auto(),
                    this.message_listener(),
                    this.key_listener(),
                    this.resize_watch(),
                    this.boot(),
                    this.pack_task(),
                    this.report_task(),
                    this.values_task(),
                    this.scheme_attach(),
                ];
            }
        }
        __decorate([
            $mol_mem_key
        ], $bog_vmap_scene.prototype, "error_sent", null);
        __decorate([
            $mol_mem
        ], $bog_vmap_scene.prototype, "doc_src", null);
        __decorate([
            $mol_mem
        ], $bog_vmap_scene.prototype, "doc_root", null);
        __decorate([
            $mol_mem
        ], $bog_vmap_scene.prototype, "doc_js", null);
        __decorate([
            $mol_mem
        ], $bog_vmap_scene.prototype, "doc_css", null);
        __decorate([
            $mol_mem
        ], $bog_vmap_scene.prototype, "spots", null);
        __decorate([
            $mol_mem
        ], $bog_vmap_scene.prototype, "sizes_seen", null);
        __decorate([
            $mol_mem
        ], $bog_vmap_scene.prototype, "shown", null);
        __decorate([
            $mol_mem
        ], $bog_vmap_scene.prototype, "camera", null);
        __decorate([
            $mol_mem
        ], $bog_vmap_scene.prototype, "grid_shift", null);
        __decorate([
            $mol_mem
        ], $bog_vmap_scene.prototype, "grid_scale", null);
        __decorate([
            $mol_mem
        ], $bog_vmap_scene.prototype, "pack_uri", null);
        __decorate([
            $mol_mem
        ], $bog_vmap_scene.prototype, "importer", null);
        __decorate([
            $mol_mem
        ], $bog_vmap_scene.prototype, "pack_ready", null);
        __decorate([
            $mol_mem
        ], $bog_vmap_scene.prototype, "pack_note", null);
        __decorate([
            $mol_mem
        ], $bog_vmap_scene.prototype, "pack_task", null);
        __decorate([
            $mol_mem
        ], $bog_vmap_scene.prototype, "sandbox", null);
        __decorate([
            $mol_mem
        ], $bog_vmap_scene.prototype, "libs", null);
        __decorate([
            $mol_mem
        ], $bog_vmap_scene.prototype, "libs_parsed", null);
        __decorate([
            $mol_mem
        ], $bog_vmap_scene.prototype, "doc_tree", null);
        __decorate([
            $mol_mem
        ], $bog_vmap_scene.prototype, "supers", null);
        __decorate([
            $mol_mem
        ], $bog_vmap_scene.prototype, "shapes", null);
        __decorate([
            $mol_mem
        ], $bog_vmap_scene.prototype, "code_parts", null);
        __decorate([
            $mol_mem
        ], $bog_vmap_scene.prototype, "code", null);
        __decorate([
            $mol_mem
        ], $bog_vmap_scene.prototype, "build", null);
        __decorate([
            $mol_mem
        ], $bog_vmap_scene.prototype, "mount", null);
        __decorate([
            $mol_mem
        ], $bog_vmap_scene.prototype, "instance", null);
        __decorate([
            $mol_mem
        ], $bog_vmap_scene.prototype, "compile_error", null);
        __decorate([
            $mol_mem
        ], $bog_vmap_scene.prototype, "compile_class", null);
        __decorate([
            $mol_mem
        ], $bog_vmap_scene.prototype, "css_attach", null);
        __decorate([
            $mol_mem
        ], $bog_vmap_scene.prototype, "spots_attach", null);
        __decorate([
            $mol_mem
        ], $bog_vmap_scene.prototype, "libs_css_attach", null);
        __decorate([
            $mol_mem
        ], $bog_vmap_scene.prototype, "theme", null);
        __decorate([
            $mol_mem
        ], $bog_vmap_scene.prototype, "scheme_attach", null);
        __decorate([
            $mol_mem
        ], $bog_vmap_scene.prototype, "stage", null);
        __decorate([
            $mol_mem
        ], $bog_vmap_scene.prototype, "values_wanted", null);
        __decorate([
            $mol_mem
        ], $bog_vmap_scene.prototype, "values_at", null);
        __decorate([
            $mol_mem
        ], $bog_vmap_scene.prototype, "values_task", null);
        __decorate([
            $mol_mem
        ], $bog_vmap_scene.prototype, "message_listener", null);
        __decorate([
            $mol_mem
        ], $bog_vmap_scene.prototype, "boot", null);
        __decorate([
            $mol_mem
        ], $bog_vmap_scene.prototype, "key_listener", null);
        __decorate([
            $mol_mem
        ], $bog_vmap_scene.prototype, "resize_watch", null);
        __decorate([
            $mol_mem
        ], $bog_vmap_scene.prototype, "report_task", null);
        $$.$bog_vmap_scene = $bog_vmap_scene;
    })($$ = $.$$ || ($.$$ = {}));
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    var $$;
    (function ($$) {
        $mol_style_define($bog_vmap_scene, {
            position: 'relative',
            width: '100%',
            height: '100%',
            overflow: 'hidden',
            background: { color: $mol_theme.back },
            flex: { direction: 'column' },
            align: { items: 'flex-start' },
            Grid: {
                position: 'absolute',
                top: 0,
                left: 0,
                zIndex: 0,
                width: '100%',
                height: '100%',
                fill: 'none',
                stroke: String($mol_theme.line),
                strokeWidth: '1px',
                pointerEvents: 'none',
            },
            Stage: {
                position: 'relative',
                zIndex: 1,
                flex: { direction: 'column' },
                align: { items: 'flex-start' },
                transformOrigin: '0 0',
                transition: 'none',
            },
            Wait: {
                padding: $mol_gap.block,
                maxWidth: '22rem',
                color: $mol_theme.text,
                background: { color: $mol_theme.card },
                border: { radius: $mol_gap.round },
                boxShadow: '0 .125rem .75rem rgba(0,0,0,.2)',
                whiteSpace: 'normal',
                overflowWrap: 'anywhere',
            },
        });
    })($$ = $.$$ || ($.$$ = {}));
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    function $bog_vmap_scene_value_text(val, limit = 40) {
        let text;
        if (val === undefined)
            text = 'undefined';
        else if (val === null)
            text = 'null';
        else if (typeof val === 'function')
            text = 'function';
        else if (typeof val !== 'object')
            text = String(val);
        else if (Array.isArray(val) || Object.getPrototypeOf(val) === Object.prototype) {
            try {
                text = JSON.stringify(val);
            }
            catch {
                text = String(val);
            }
        }
        else
            text = String(val);
        text = text.replace(/\s+/g, ' ').trim();
        return text.length > limit ? text.slice(0, limit - 1) + '…' : text;
    }
    $.$bog_vmap_scene_value_text = $bog_vmap_scene_value_text;
    function $bog_vmap_scene_values_columns(list) {
        const columns = [];
        for (const item of list) {
            for (const key of Object.keys(item))
                if (!columns.includes(key))
                    columns.push(key);
        }
        return columns;
    }
    $.$bog_vmap_scene_values_columns = $bog_vmap_scene_values_columns;
    function $bog_vmap_scene_values_table(val, rows = 3, limit = 40) {
        if (!Array.isArray(val) || !val.length)
            return null;
        const plain = (item) => Boolean(item)
            && typeof item === 'object'
            && !Array.isArray(item)
            && Object.getPrototypeOf(item) === Object.prototype;
        if (!val.every(plain))
            return null;
        const shown = val.slice(0, rows);
        const columns = $bog_vmap_scene_values_columns(shown);
        if (!columns.length)
            return null;
        const lines = [columns.join('\t')];
        for (const item of shown) {
            lines.push(columns.map(column => column in item ? $bog_vmap_scene_value_text(item[column], limit) : '').join('\t'));
        }
        if (val.length > shown.length)
            lines.push('… ещё ' + (val.length - shown.length));
        return lines.join('\n');
    }
    $.$bog_vmap_scene_values_table = $bog_vmap_scene_values_table;
    function $bog_vmap_scene_values_show(val, limit = 40, rows = 3) {
        return $bog_vmap_scene_values_table(val, rows, limit) ?? $bog_vmap_scene_value_text(val, limit);
    }
    $.$bog_vmap_scene_values_show = $bog_vmap_scene_values_show;
    function $bog_vmap_scene_values_pick(root, name) {
        let host = root;
        for (const step of name.split('.')) {
            if (!host || (typeof host !== 'object' && typeof host !== 'function')) {
                throw new Error('нет свойства ' + name);
            }
            const method = Reflect.get(host, step);
            if (typeof method !== 'function')
                throw new Error('нет свойства ' + name);
            host = method.call(host);
        }
        return host;
    }
    $.$bog_vmap_scene_values_pick = $bog_vmap_scene_values_pick;
    function $bog_vmap_scene_values(root, names, limit = 40, rows = 3) {
        const values = {};
        for (const name of names) {
            try {
                values[name] = $bog_vmap_scene_values_show($bog_vmap_scene_values_pick(root, name), limit, rows);
            }
            catch (error) {
                if (this.$mol_promise_like(error))
                    return this.$mol_fail_hidden(error);
                values[name] = '⚠ ' + $bog_vmap_scene_value_text(String(error?.message ?? error), limit);
            }
        }
        return values;
    }
    $.$bog_vmap_scene_values = $bog_vmap_scene_values;
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    function $bog_vmap_scene_seek(root, how, probe) {
        if (probe(root))
            return { path: how.key, view: root };
        const walk = (view, path, depth) => {
            if (depth > 16)
                return null;
            let index = 0;
            for (const kid of how.kids_of(view)) {
                const sub = how.view_of(kid);
                if (!sub)
                    continue;
                const key = path + '/' + (how.prop_of(sub) || index);
                index++;
                if (probe(sub))
                    return { path: key, view: sub };
                const deeper = walk(sub, key, depth + 1);
                if (deeper)
                    return deeper;
            }
            return null;
        };
        return walk(root, how.key, 0);
    }
    $.$bog_vmap_scene_seek = $bog_vmap_scene_seek;
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    function $mol_test(set) {
        for (let name in set) {
            const code = set[name];
            const test = (typeof code === 'string') ? new Function('', code) : code;
            $_1.$mol_test_all.push(test);
        }
        $mol_test_schedule();
    }
    $_1.$mol_test = $mol_test;
    $_1.$mol_test_mocks = [];
    $_1.$mol_test_all = [];
    async function $mol_test_run() {
        for (var test of $_1.$mol_test_all) {
            let context = Object.create($$);
            for (let mock of $_1.$mol_test_mocks)
                await mock(context);
            const res = test(context);
            if ($mol_promise_like(res)) {
                await new Promise((done, fail) => {
                    res.then(done, fail);
                    setTimeout(() => fail(new Error('Test timeout: ' + test.name)), 1000);
                });
            }
        }
        $$.$mol_log3_done({
            place: '$mol_test',
            message: 'All tests passed',
            count: $_1.$mol_test_all.length,
        });
    }
    $_1.$mol_test_run = $mol_test_run;
    let scheduled = false;
    function $mol_test_schedule() {
        if (scheduled)
            return;
        scheduled = true;
        setTimeout(async () => {
            scheduled = false;
            await $mol_test_run();
            $$.$mol_test_complete();
        }, 1000);
    }
    $_1.$mol_test_schedule = $mol_test_schedule;
    $_1.$mol_test_mocks.push(context => {
        let seed = 0;
        context.Math = Object.create(Math);
        context.Math.random = () => Math.sin(seed++);
        const forbidden = ['XMLHttpRequest', 'fetch'];
        for (let api of forbidden) {
            context[api] = new Proxy(function () { }, {
                get() {
                    $mol_fail_hidden(new Error(`${api} is forbidden in tests`));
                },
                apply() {
                    $mol_fail_hidden(new Error(`${api} is forbidden in tests`));
                },
            });
        }
    });
    $mol_test({
        'mocked Math.random'($) {
            console.assert($.Math.random() === 0);
            console.assert($.Math.random() === Math.sin(1));
        },
        'forbidden XMLHttpRequest'($) {
            try {
                console.assert(void new $.XMLHttpRequest);
            }
            catch (error) {
                console.assert(error.message === 'XMLHttpRequest is forbidden in tests');
            }
        },
        'forbidden fetch'($) {
            try {
                console.assert(void $.fetch(''));
            }
            catch (error) {
                console.assert(error.message === 'fetch is forbidden in tests');
            }
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    function $mol_test_complete() {
        process.exit(0);
    }
    $.$mol_test_complete = $mol_test_complete;
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    $mol_test({
        'FQN of anon function'($) {
            const $$ = Object.assign($, { $mol_func_name_test: (() => () => { })() });
            $mol_assert_equal($$.$mol_func_name_test.name, '');
            $mol_assert_equal($$.$mol_func_name($$.$mol_func_name_test), '$mol_func_name_test');
            $mol_assert_equal($$.$mol_func_name_test.name, '$mol_func_name_test');
        },
    });
})($ || ($ = {}));

;
"use strict";

;
"use strict";

;
"use strict";

;
"use strict";

;
"use strict";
var $;
(function ($) {
    function $mol_dom_serialize(node) {
        const serializer = new $mol_dom_context.XMLSerializer;
        return serializer.serializeToString(node);
    }
    $.$mol_dom_serialize = $mol_dom_serialize;
})($ || ($ = {}));

;
"use strict";
/** @jsx $mol_jsx */
/** @jsxFrag $mol_jsx_frag */
var $;
(function ($) {
    $mol_test({
        'Make empty div'() {
            $mol_assert_equal(($mol_jsx("div", null)).outerHTML, '<div></div>');
        },
        'Define native field'() {
            const dom = $mol_jsx("input", { value: '123' });
            $mol_assert_equal(dom.outerHTML, '<input value="123">');
            $mol_assert_equal(dom.value, '123');
        },
        'Define classes'() {
            const dom = $mol_jsx("div", { class: 'foo bar' });
            $mol_assert_equal(dom.outerHTML, '<div class="foo bar"></div>');
        },
        'Define styles'() {
            const dom = $mol_jsx("div", { style: { color: 'red' } });
            $mol_assert_equal(dom.outerHTML, '<div style="color: red;"></div>');
        },
        'Define dataset'() {
            const dom = $mol_jsx("div", { dataset: { foo: 'bar' } });
            $mol_assert_equal(dom.outerHTML, '<div data-foo="bar"></div>');
        },
        'Define attributes'() {
            const dom = $mol_jsx("div", { lang: "ru", hidden: true });
            $mol_assert_equal(dom.outerHTML, '<div lang="ru" hidden=""></div>');
        },
        'Define child nodes'() {
            const dom = $mol_jsx("div", null,
                "hello",
                $mol_jsx("strong", null, "world"),
                "!");
            $mol_assert_equal(dom.outerHTML, '<div>hello<strong>world</strong>!</div>');
        },
        'Make fragment'() {
            const dom = $mol_jsx($mol_jsx_frag, null,
                $mol_jsx("br", null),
                $mol_jsx("hr", null));
            $mol_assert_equal($mol_dom_serialize(dom), '<br xmlns="http://www.w3.org/1999/xhtml" /><hr xmlns="http://www.w3.org/1999/xhtml" />');
        },
        'Spread fragment'() {
            const dom = $mol_jsx("div", null,
                $mol_jsx($mol_jsx_frag, null,
                    $mol_jsx("br", null),
                    $mol_jsx("hr", null)));
            $mol_assert_equal(dom.outerHTML, '<div><br><hr></div>');
        },
        'Function as component'() {
            const Button = (props, target) => {
                return $mol_jsx("button", { title: props.hint }, target());
            };
            const dom = $mol_jsx(Button, { id: "foo", hint: "click me" }, () => 'hey!');
            $mol_assert_equal(dom.outerHTML, '<button id="foo" title="click me" class="Button">hey!</button>');
        },
        'Nested guid generation'() {
            const Foo = () => {
                return $mol_jsx("div", null,
                    $mol_jsx(Bar, { id: "bar" },
                        $mol_jsx("img", { id: "icon" })));
            };
            const Bar = (props, icon) => {
                return $mol_jsx("span", null,
                    icon,
                    $mol_jsx("i", { id: "label" }));
            };
            const dom = $mol_jsx(Foo, { id: "foo" });
            $mol_assert_equal(dom.outerHTML, '<div id="foo" class="Foo"><span id="foo/bar" class="Foo_bar Bar"><img id="foo/icon" class="Foo_icon"><i id="foo/bar/label" class="Foo_bar_label Bar_label"></i></span></div>');
        },
        'Fail on non unique ids'() {
            const App = () => {
                return $mol_jsx("div", null,
                    $mol_jsx("span", { id: "bar" }),
                    $mol_jsx("span", { id: "bar" }));
            };
            $mol_assert_fail(() => $mol_jsx(App, { id: "foo" }), 'JSX already has tag with id "foo/bar"');
        },
        'Owner based guid generationn'() {
            const Foo = () => {
                return $mol_jsx("div", null,
                    $mol_jsx(Bar, { id: "middle", icon: () => $mol_jsx("img", { id: "icon" }) }));
            };
            const Bar = (props) => {
                return $mol_jsx("span", null, props.icon());
            };
            const dom = $mol_jsx(Foo, { id: "app" });
            $mol_assert_equal(dom.outerHTML, '<div id="app" class="Foo"><span id="app/middle" class="Foo_middle Bar"><img id="app/icon" class="Foo_icon"></span></div>');
        },
        'Fail on same ids from different caller'() {
            const Foo = () => {
                return $mol_jsx("div", null,
                    $mol_jsx("img", { id: "icon" }),
                    $mol_jsx(Bar, { id: "bar", icon: () => $mol_jsx("img", { id: "icon" }) }));
            };
            const Bar = (props) => {
                return $mol_jsx("span", null, props.icon());
            };
            $mol_assert_fail(() => $mol_jsx(Foo, { id: "foo" }), 'JSX already has tag with id "foo/icon"');
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    /** Lazy computed lists with native Array interface. $mol_range2_array is mutable but all derived ranges are immutable. */
    function $mol_range2(item = index => index, size = () => Number.POSITIVE_INFINITY) {
        const source = typeof item === 'function' ? new $mol_range2_array() : item;
        if (typeof item !== 'function') {
            item = index => source[index];
            size = () => source.length;
        }
        return new Proxy(source, {
            get(target, field) {
                if (typeof field === 'string') {
                    if (field === 'length')
                        return size();
                    const index = Number(field);
                    if (index < 0)
                        return undefined;
                    if (index >= size())
                        return undefined;
                    if (index === Math.trunc(index))
                        return item(index);
                }
                return $mol_range2_array.prototype[field];
            },
            set(target, field) {
                return $mol_fail(new TypeError(`Lazy range is read only (trying to set field ${JSON.stringify(field)})`));
            },
            ownKeys(target) {
                return [...Array(size())].map((v, i) => String(i)).concat('length');
            },
            getOwnPropertyDescriptor(target, field) {
                if (field === "length")
                    return {
                        value: size(),
                        writable: true,
                        enumerable: false,
                        configurable: false,
                    };
                const index = Number(field);
                if (index === Math.trunc(index))
                    return {
                        get: () => this.get(target, field, this),
                        enumerable: true,
                        configurable: true,
                    };
                return Object.getOwnPropertyDescriptor(target, field);
            }
        });
    }
    $.$mol_range2 = $mol_range2;
    class $mol_range2_array extends Array {
        // Lazy
        concat(...tail) {
            if (tail.length === 0)
                return this;
            if (tail.length > 1) {
                let list = this;
                for (let item of tail)
                    list = list.concat(item);
                return list;
            }
            return $mol_range2(index => index < this.length ? this[index] : tail[0][index - this.length], () => this.length + tail[0].length);
        }
        // Lazy
        filter(check, context) {
            const filtered = [];
            let cursor = -1;
            return $mol_range2(index => {
                while (cursor < this.length && index >= filtered.length - 1) {
                    const val = this[++cursor];
                    if (check(val, cursor, this))
                        filtered.push(val);
                }
                return filtered[index];
            }, () => cursor < this.length ? Number.POSITIVE_INFINITY : filtered.length);
        }
        // Diligent
        forEach(proceed, context) {
            for (let [key, value] of this.entries())
                proceed.call(context, value, key, this);
        }
        // Lazy
        map(proceed, context) {
            return $mol_range2(index => proceed.call(context, this[index], index, this), () => this.length);
        }
        // Diligent
        reduce(merge, result) {
            let index = 0;
            if (arguments.length === 1) {
                result = this[index++];
            }
            for (; index < this.length; ++index) {
                result = merge(result, this[index], index, this);
            }
            return result;
        }
        // Lazy
        toReversed() {
            return $mol_range2(index => this[this.length - 1 - index], () => this.length);
        }
        // Lazy
        slice(from = 0, to = this.length) {
            return $mol_range2(index => this[from + index], () => Math.min(to, this.length) - from);
        }
        // Lazy
        some(check, context) {
            for (let index = 0; index < this.length; ++index) {
                if (check.call(context, this[index], index, this))
                    return true;
            }
            return false;
        }
        every(check, context) {
            for (let index = 0; index < this.length; ++index) {
                if (!check.call(context, this[index], index, this))
                    return false;
            }
            return true;
        }
        reverse() {
            return $mol_fail(new TypeError(`Mutable reverse is forbidden. Use toReversed instead.`));
        }
        sort() {
            return $mol_fail(new TypeError(`Mutable sort is forbidden. Use toSorted instead.`));
        }
        indexOf(needle) {
            return this.findIndex(item => item === needle);
        }
        [Symbol.toPrimitive]() {
            return $mol_guid();
        }
    }
    $.$mol_range2_array = $mol_range2_array;
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    $mol_test({
        'lazy calls'() {
            let calls = 0;
            const list = $mol_range2(index => (++calls, index), () => 10);
            $mol_assert_equal(true, list instanceof Array);
            $mol_assert_equal(list.length, 10);
            $mol_assert_equal(list[-1], undefined);
            $mol_assert_equal(list[0], 0);
            $mol_assert_equal(list[9], 9);
            $mol_assert_equal(list[9.5], undefined);
            $mol_assert_equal(list[10], undefined);
            $mol_assert_equal(calls, 2);
        },
        'infinity list'() {
            let calls = 0;
            const list = $mol_range2(index => (++calls, index));
            $mol_assert_equal(list.length, Number.POSITIVE_INFINITY);
            $mol_assert_equal(list[0], 0);
            $mol_assert_equal(list[4], 4);
            $mol_assert_equal(list[Number.MAX_SAFE_INTEGER], Number.MAX_SAFE_INTEGER);
            $mol_assert_equal(list[Number.POSITIVE_INFINITY], undefined);
            $mol_assert_equal(calls, 3);
        },
        'stringify'() {
            const list = $mol_range2(i => i, () => 5);
            $mol_assert_equal(list.toString(), '0,1,2,3,4');
            $mol_assert_equal(list.join(';'), '0;1;2;3;4');
        },
        'for-of'() {
            let log = '';
            for (let i of $mol_range2(i => i + 1, () => 5)) {
                log += i;
            }
            $mol_assert_equal(log, '12345');
        },
        'for-in'() {
            let log = '';
            for (let i in $mol_range2(i => i, () => 5)) {
                log += i;
            }
            $mol_assert_equal(log, '01234');
        },
        'forEach'() {
            let log = '';
            $mol_range2(i => i, () => 5).forEach(i => log += i);
            $mol_assert_equal(log, '01234');
        },
        'reduce'() {
            let calls = 0;
            const list = $mol_range2().slice(1, 6);
            $mol_assert_equal(list.reduce((s, v) => s + v), 15);
            $mol_assert_equal(list.reduce((s, v) => s + v, 5), 20);
        },
        'lazy concat'() {
            let calls1 = 0;
            let calls2 = 0;
            const list = $mol_range2(index => (++calls1, index), () => 5).concat([0, 1, 2, 3, 4], $mol_range2(index => (++calls2, index), () => 5));
            $mol_assert_equal(true, list instanceof Array);
            $mol_assert_equal(list.length, 15);
            $mol_assert_equal(list[0], 0);
            $mol_assert_equal(list[4], 4);
            $mol_assert_equal(list[5], 0);
            $mol_assert_equal(list[9], 4);
            $mol_assert_equal(list[10], 0);
            $mol_assert_equal(list[14], 4);
            $mol_assert_equal(list[15], undefined);
            $mol_assert_equal(calls1, 2);
            $mol_assert_equal(calls2, 2);
        },
        'lazy filter'() {
            let calls = 0;
            const list = $mol_range2(index => (++calls, index), () => 15).filter(v => v % 2).slice(0, 3);
            $mol_assert_equal(true, list instanceof Array);
            $mol_assert_equal(list.length, 3);
            $mol_assert_equal(list[0], 1);
            $mol_assert_equal(list[2], 5);
            $mol_assert_equal(list[3], undefined);
            $mol_assert_equal(calls, 8);
        },
        'lazy reverse'() {
            let calls = 0;
            const list = $mol_range2(index => (++calls, index), () => 10).toReversed().slice(0, 3);
            $mol_assert_equal(true, list instanceof Array);
            $mol_assert_equal(list.length, 3);
            $mol_assert_equal(list[0], 9);
            $mol_assert_equal(list[2], 7);
            $mol_assert_equal(list[3], undefined);
            $mol_assert_equal(calls, 2);
        },
        'lazy map'() {
            let calls1 = 0;
            let calls2 = 0;
            const source = $mol_range2(index => (++calls1, index), () => 5);
            const target = source.map((item, index, self) => {
                ++calls2;
                $mol_assert_equal(source, self);
                return index + 10;
            }, () => 5);
            $mol_assert_equal(true, target instanceof Array);
            $mol_assert_equal(target.length, 5);
            $mol_assert_equal(target[0], 10);
            $mol_assert_equal(target[4], 14);
            $mol_assert_equal(target[5], undefined);
            $mol_assert_equal(calls1, 2);
            $mol_assert_equal(calls2, 2);
        },
        'lazy slice'() {
            let calls = 0;
            const list = $mol_range2(index => (++calls, index), () => 10).slice(3, 7);
            $mol_assert_equal(true, list instanceof Array);
            $mol_assert_equal(list.length, 4);
            $mol_assert_equal(list[0], 3);
            $mol_assert_equal(list[3], 6);
            $mol_assert_equal(list[4], undefined);
            $mol_assert_equal(calls, 2);
        },
        'lazy some'() {
            let calls = 0;
            $mol_assert_equal(true, $mol_range2(index => (++calls, index), () => 5).some(v => v >= 2));
            $mol_assert_equal(calls, 3);
            $mol_assert_equal(false, $mol_range2(i => i, () => 0).some(v => true));
            $mol_assert_equal(true, $mol_range2(i => i).some(v => v > 5));
        },
        'lazy every'() {
            let calls = 0;
            $mol_assert_equal(false, $mol_range2(index => (++calls, index), () => 5).every(v => v < 2));
            $mol_assert_equal(calls, 3);
            $mol_assert_equal(true, $mol_range2(i => i, () => 0).every(v => false));
            $mol_assert_equal(false, $mol_range2(i => i).every(v => v < 5));
        },
        'lazyfy'() {
            let calls = 0;
            const list = $mol_range2([0, 1, 2, 3, 4, 5]).map(i => (++calls, i + 10)).slice(2);
            $mol_assert_equal(true, list instanceof Array);
            $mol_assert_equal(list.length, 4);
            $mol_assert_equal(calls, 0);
            $mol_assert_equal(list[0], 12);
            $mol_assert_equal(list[3], 15);
            $mol_assert_equal(list[4], undefined);
            $mol_assert_equal(calls, 2);
        },
        'prevent modification'() {
            const list = $mol_range2(i => i, () => 5);
            $mol_assert_fail(() => list.push(4), TypeError);
            $mol_assert_fail(() => list.pop(), TypeError);
            $mol_assert_fail(() => list.unshift(4), TypeError);
            $mol_assert_fail(() => list.shift(), TypeError);
            $mol_assert_fail(() => list.splice(1, 2), TypeError);
            $mol_assert_fail(() => list[1] = 2, TypeError);
            $mol_assert_fail(() => list.reverse(), TypeError);
            $mol_assert_fail(() => list.sort(), TypeError);
            $mol_assert_equal(list.toString(), '0,1,2,3,4');
        }
    });
})($ || ($ = {}));

;
"use strict";
/** @jsx $mol_jsx */
var $;
(function ($) {
    $mol_test({
        'nulls & undefineds'() {
            $mol_assert_ok($mol_compare_deep(null, null));
            $mol_assert_ok($mol_compare_deep(undefined, undefined));
            $mol_assert_not($mol_compare_deep(undefined, null));
            $mol_assert_not($mol_compare_deep({}, null));
        },
        'number'() {
            $mol_assert_ok($mol_compare_deep(1, 1));
            $mol_assert_ok($mol_compare_deep(Number.NaN, Number.NaN));
            $mol_assert_not($mol_compare_deep(1, 2));
            $mol_assert_ok($mol_compare_deep(Object(1), Object(1)));
            $mol_assert_not($mol_compare_deep(Object(1), Object(2)));
        },
        'POJO'() {
            $mol_assert_ok($mol_compare_deep({}, {}));
            $mol_assert_not($mol_compare_deep({ a: 1 }, { b: 2 }));
            $mol_assert_not($mol_compare_deep({ a: 1 }, { a: 2 }));
            $mol_assert_not($mol_compare_deep({}, { a: undefined }));
            $mol_assert_not($mol_compare_deep({ a: 1, b: 2 }, { b: 2, a: 1 }));
            $mol_assert_ok($mol_compare_deep({ a: { b: 1 } }, { a: { b: 1 } }));
            $mol_assert_ok($mol_compare_deep(Object.create(null), Object.create(null)));
        },
        'Array'() {
            $mol_assert_ok($mol_compare_deep([], []));
            $mol_assert_ok($mol_compare_deep([1, [2]], [1, [2]]));
            $mol_assert_not($mol_compare_deep([1, 2], [1, 3]));
            $mol_assert_not($mol_compare_deep([1, 2,], [1, 3, undefined]));
            $mol_assert_not($mol_compare_deep($mol_range2().slice(0, 0), new Array()));
            $mol_assert_not($mol_compare_deep($mol_range2(), $mol_range2()));
        },
        'Non POJO are different'() {
            class Thing extends Object {
            }
            $mol_assert_not($mol_compare_deep(new Thing, new Thing));
            $mol_assert_not($mol_compare_deep(() => 1, () => 1));
            $mol_assert_not($mol_compare_deep(new RangeError('Test error'), new RangeError('Test error')));
        },
        'POJO with symbols'() {
            const sym = Symbol();
            $mol_assert_ok($mol_compare_deep({ [sym]: true }, { [sym]: true }));
            $mol_assert_not($mol_compare_deep({ [Symbol()]: true }, { [Symbol()]: true }));
        },
        'same POJOs with cyclic reference'() {
            const a = { foo: {} };
            a['self'] = a;
            const b = { foo: {} };
            b['self'] = b;
            $mol_assert_ok($mol_compare_deep(a, b));
        },
        'same POJOs with cyclic reference with cache warmup'() {
            const obj1 = { test: 1, obj3: null };
            const obj1_copy = { test: 1, obj3: null };
            const obj2 = { test: 2, obj1 };
            const obj2_copy = { test: 2, obj1: obj1_copy };
            const obj3 = { test: 3, obj2 };
            const obj3_copy = { test: 3, obj2: obj2_copy };
            obj1.obj3 = obj3;
            obj1_copy.obj3 = obj3_copy;
            // warmup cache
            $mol_assert_not($mol_compare_deep(obj1, {}));
            $mol_assert_not($mol_compare_deep(obj2, {}));
            $mol_assert_not($mol_compare_deep(obj3, {}));
            $mol_assert_ok($mol_compare_deep(obj3, obj3_copy));
        },
        'Date'() {
            $mol_assert_ok($mol_compare_deep(new Date(12345), new Date(12345)));
            $mol_assert_not($mol_compare_deep(new Date(12345), new Date(12346)));
        },
        'RegExp'() {
            $mol_assert_ok($mol_compare_deep(/\x22/mig, /\x22/mig));
            $mol_assert_not($mol_compare_deep(/\x22/mig, /\x21/mig));
            $mol_assert_not($mol_compare_deep(/\x22/mig, /\x22/mg));
        },
        'Error'() {
            $mol_assert_not($mol_compare_deep(new Error('xxx'), new Error('xxx')));
            const fail = (message) => new Error(message);
            $mol_assert_ok($mol_compare_deep(...['xxx', 'xxx'].map(msg => new Error(msg))));
            $mol_assert_not($mol_compare_deep(...['xxx', 'yyy'].map(msg => new Error(msg))));
        },
        'Map'() {
            $mol_assert_ok($mol_compare_deep(new Map, new Map));
            $mol_assert_ok($mol_compare_deep(new Map([[1, [2]]]), new Map([[1, [2]]])));
            $mol_assert_ok($mol_compare_deep(new Map([[[1], 2]]), new Map([[[1], 2]])));
            $mol_assert_not($mol_compare_deep(new Map([[1, 2]]), new Map([[1, 3]])));
            $mol_assert_not($mol_compare_deep(new Map([[[1], 2]]), new Map([[[3], 2]])));
        },
        'Set'() {
            $mol_assert_ok($mol_compare_deep(new Set, new Set));
            $mol_assert_ok($mol_compare_deep(new Set([1, [2]]), new Set([1, [2]])));
            $mol_assert_not($mol_compare_deep(new Set([1]), new Set([2])));
        },
        'Uint8Array'() {
            $mol_assert_ok($mol_compare_deep(new Uint8Array, new Uint8Array));
            $mol_assert_ok($mol_compare_deep(new Uint8Array([0]), new Uint8Array([0])));
            $mol_assert_not($mol_compare_deep(new Uint8Array([0]), new Uint8Array([1])));
        },
        'DataView'() {
            $mol_assert_ok($mol_compare_deep(new DataView(new Uint8Array().buffer), new DataView(new Uint8Array().buffer)));
            $mol_assert_ok($mol_compare_deep(new DataView(new Uint8Array([0]).buffer), new DataView(new Uint8Array([0]).buffer)));
            $mol_assert_not($mol_compare_deep(new DataView(new Uint8Array([0]).buffer), new DataView(new Uint8Array([1]).buffer)));
        },
        'Serializale'() {
            class User {
                name;
                rand;
                constructor(name, rand = Math.random()) {
                    this.name = name;
                    this.rand = rand;
                }
                [Symbol.toPrimitive](mode) {
                    return this.name;
                }
            }
            $mol_assert_ok($mol_compare_deep(new User('Jin'), new User('Jin')));
            $mol_assert_not($mol_compare_deep(new User('Jin'), new User('John')));
        },
        'Iterable'() {
            $mol_assert_ok($mol_compare_deep(new URLSearchParams({ foo: 'bar' }), new URLSearchParams({ foo: 'bar' })));
            $mol_assert_not($mol_compare_deep(new URLSearchParams({ foo: 'xxx' }), new URLSearchParams({ foo: 'yyy' })));
            $mol_assert_not($mol_compare_deep(new URLSearchParams({ foo: 'xxx', bar: 'yyy' }), new URLSearchParams({ bar: 'yyy', foo: 'xxx' })));
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    /**
     * Argument must be Truthy
     * @deprecated use $mol_assert_equal instead
     */
    function $mol_assert_ok(value) {
        if (value)
            return;
        $mol_fail(new Error(`${value} ≠ true`));
    }
    $.$mol_assert_ok = $mol_assert_ok;
    /**
     * Argument must be Falsy
     * @deprecated use $mol_assert_equal instead
     */
    function $mol_assert_not(value) {
        if (!value)
            return;
        $mol_fail(new Error(`${value} ≠ false`));
    }
    $.$mol_assert_not = $mol_assert_not;
    /**
     * Handler must throw an error.
     * @example
     * $mol_assert_fail( ()=>{ throw new Error( 'Parse error' ) } ) // Passes because throws error
     * $mol_assert_fail( ()=>{ throw new Error( 'Parse error' ) } , 'Parse error' ) // Passes because throws right message
     * $mol_assert_fail( ()=>{ throw new Error( 'Parse error' ) } , Error ) // Passes because throws right class
     * @see https://mol.hyoo.ru/#!section=docs/=9q9dv3_fgxjsf
     */
    function $mol_assert_fail(handler, ErrorRight) {
        const fail = $.$mol_fail;
        try {
            $.$mol_fail = $.$mol_fail_hidden;
            handler();
        }
        catch (error) {
            $.$mol_fail = fail;
            if (typeof ErrorRight === 'string') {
                $mol_assert_equal(error.message ?? error, ErrorRight);
            }
            else {
                $mol_assert_equal(error instanceof ErrorRight, true);
            }
            return error;
        }
        finally {
            $.$mol_fail = fail;
        }
        $mol_fail(new Error('Not failed', { cause: { expect: ErrorRight } }));
    }
    $.$mol_assert_fail = $mol_assert_fail;
    /** @deprecated Use $mol_assert_equal */
    function $mol_assert_like(...args) {
        $mol_assert_equal(...args);
    }
    $.$mol_assert_like = $mol_assert_like;
    /**
     * All arguments must not be structural equal to each other.
     * @example
     * $mol_assert_unique( 1 , 2 , 3 ) // Passes
     * $mol_assert_unique( 1 , 1 , 2 ) // Fails because 1 === 1
     * @see https://mol.hyoo.ru/#!section=docs/=9q9dv3_fgxjsf
     */
    function $mol_assert_unique(...args) {
        for (let i = 0; i < args.length; ++i) {
            for (let j = 0; j < args.length; ++j) {
                if (i === j)
                    continue;
                if (!$mol_compare_deep(args[i], args[j]))
                    continue;
                return $mol_fail(new Error(`Uniquesess assertion failure`, { cause: { [i]: args[i], [i]: args[i] } }));
            }
        }
    }
    $.$mol_assert_unique = $mol_assert_unique;
    /**
     * All arguments must be structural equal each other.
     * @example
     * $mol_assert_like( [1] , [1] , [1] ) // Passes
     * $mol_assert_like( [1] , [1] , [2] ) // Fails because 1 !== 2
     * @see https://mol.hyoo.ru/#!section=docs/=9q9dv3_fgxjsf
     */
    function $mol_assert_equal(...args) {
        for (let i = 1; i < args.length; ++i) {
            if ($mol_compare_deep(args[0], args[i]))
                continue;
            return $mol_fail(new Error(`Equality assertion failure`, { cause: { 0: args[0], [i]: args[i] } }));
        }
    }
    $.$mol_assert_equal = $mol_assert_equal;
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    $mol_test({
        'must be false'() {
            $mol_assert_not(0);
        },
        'must be true'() {
            $mol_assert_ok(1);
        },
        'two must be equal'() {
            $mol_assert_equal(2, 2);
        },
        'three must be equal'() {
            $mol_assert_equal(2, 2, 2);
        },
        'two must be unique'() {
            $mol_assert_unique([2], [3]);
        },
        'three must be unique'() {
            $mol_assert_unique([1], [2], [3]);
        },
        'two must be alike'() {
            $mol_assert_equal([3], [3]);
        },
        'three must be alike'() {
            $mol_assert_equal([3], [3], [3]);
        },
        'two object must be alike'() {
            $mol_assert_equal({ a: 1 }, { a: 1 });
        },
        'three object must be alike'() {
            $mol_assert_equal({ a: 1 }, { a: 1 }, { a: 1 });
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    $mol_test_mocks.push($ => {
        $.$mol_log3_come = () => { };
        $.$mol_log3_done = () => { };
        $.$mol_log3_fail = () => { };
        $.$mol_log3_warn = () => { };
        $.$mol_log3_rise = () => { };
        $.$mol_log3_area = () => () => { };
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    $mol_test({
        'return result without errors'() {
            $mol_assert_equal($mol_try(() => false), false);
        },
        //'return error if thrown'() {
        //	
        //	const error = new Error( '$mol_try test error' )
        //	$mol_assert_equal( $mol_try( ()=> { throw error } ) , error )
        //	
        //} ,
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    $mol_test_mocks.push($ => $.$mol_fail_log = () => false);
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    $mol_test({
        'get'() {
            const proxy = $mol_delegate({}, () => ({ foo: 777 }));
            $mol_assert_equal(proxy.foo, 777);
        },
        'has'() {
            const proxy = $mol_delegate({}, () => ({ foo: 777 }));
            $mol_assert_equal('foo' in proxy, true);
        },
        'set'() {
            const target = { foo: 777 };
            const proxy = $mol_delegate({}, () => target);
            proxy.foo = 123;
            $mol_assert_equal(target.foo, 123);
        },
        'getOwnPropertyDescriptor'() {
            const proxy = $mol_delegate({}, () => ({ foo: 777 }));
            $mol_assert_like(Object.getOwnPropertyDescriptor(proxy, 'foo'), {
                value: 777,
                writable: true,
                enumerable: true,
                configurable: true,
            });
        },
        'ownKeys'() {
            const proxy = $mol_delegate({}, () => ({ foo: 777, [Symbol.toStringTag]: 'bar' }));
            $mol_assert_like(Reflect.ownKeys(proxy), ['foo', Symbol.toStringTag]);
        },
        'getPrototypeOf'() {
            class Foo {
            }
            const proxy = $mol_delegate({}, () => new Foo);
            $mol_assert_equal(Object.getPrototypeOf(proxy), Foo.prototype);
        },
        'setPrototypeOf'() {
            class Foo {
            }
            const target = {};
            const proxy = $mol_delegate({}, () => target);
            Object.setPrototypeOf(proxy, Foo.prototype);
            $mol_assert_equal(Object.getPrototypeOf(target), Foo.prototype);
        },
        'instanceof'() {
            class Foo {
            }
            const proxy = $mol_delegate({}, () => new Foo);
            $mol_assert_ok(proxy instanceof Foo);
            $mol_assert_ok(proxy instanceof $mol_delegate);
        },
        'autobind'() {
            class Foo {
            }
            const proxy = $mol_delegate({}, () => new Foo);
            $mol_assert_ok(proxy instanceof Foo);
            $mol_assert_ok(proxy instanceof $mol_delegate);
        },
    });
})($ || ($ = {}));

;
"use strict";

;
"use strict";
var $;
(function ($_1) {
    $mol_test({
        'Collect deps'() {
            const pub1 = new $mol_wire_pub;
            const pub2 = new $mol_wire_pub;
            const sub = new $mol_wire_pub_sub;
            const bu1 = sub.track_on();
            try {
                pub1.promote();
                pub2.promote();
                pub2.promote();
            }
            finally {
                sub.track_cut();
                sub.track_off(bu1);
            }
            pub1.emit();
            pub2.emit();
            $mol_assert_like(sub.pub_list, [pub1, pub2, pub2]);
            const bu2 = sub.track_on();
            try {
                pub1.promote();
                pub1.promote();
                pub2.promote();
            }
            finally {
                sub.track_cut();
                sub.track_off(bu2);
            }
            pub1.emit();
            pub2.emit();
            $mol_assert_like(sub.pub_list, [pub1, pub1, pub2]);
        },
        'cyclic detection'($) {
            const sub1 = new $mol_wire_pub_sub;
            const sub2 = new $mol_wire_pub_sub;
            const bu1 = sub1.track_on();
            try {
                const bu2 = sub2.track_on();
                try {
                    $mol_assert_fail(() => sub1.promote(), 'Circular subscription');
                }
                finally {
                    sub2.track_cut();
                    sub2.track_off(bu2);
                }
            }
            finally {
                sub1.track_cut();
                sub1.track_off(bu1);
            }
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    /// @todo right orderinng
    $.$mol_after_mock_queue = [];
    function $mol_after_mock_warp() {
        const queue = $.$mol_after_mock_queue.splice(0);
        for (const task of queue)
            task();
    }
    $.$mol_after_mock_warp = $mol_after_mock_warp;
    class $mol_after_mock_commmon extends $mol_object2 {
        task;
        promise = Promise.resolve();
        cancelled = false;
        id;
        constructor(task) {
            super();
            this.task = task;
            $.$mol_after_mock_queue.push(task);
        }
        destructor() {
            const index = $.$mol_after_mock_queue.indexOf(this.task);
            if (index >= 0)
                $.$mol_after_mock_queue.splice(index, 1);
        }
    }
    $.$mol_after_mock_commmon = $mol_after_mock_commmon;
    class $mol_after_mock_timeout extends $mol_after_mock_commmon {
        delay;
        constructor(delay, task) {
            super(task);
            this.delay = delay;
        }
    }
    $.$mol_after_mock_timeout = $mol_after_mock_timeout;
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    $mol_test_mocks.push($ => {
        $.$mol_after_tick = $mol_after_mock_commmon;
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    $mol_test({
        'Sync execution'() {
            class Sync extends $mol_object2 {
                static calc(a, b) {
                    return a + b;
                }
            }
            __decorate([
                $mol_wire_method
            ], Sync, "calc", null);
            $mol_assert_equal(Sync.calc(1, 2), 3);
        },
        async 'async <=> sync'() {
            class SyncAsync extends $mol_object2 {
                static async val(a) {
                    return a;
                }
                static sum(a, b) {
                    const syn = $mol_wire_sync(this);
                    return syn.val(a) + syn.val(b);
                }
                static async calc(a, b) {
                    return 5 + await $mol_wire_async(this).sum(a, b);
                }
            }
            $mol_assert_equal(await SyncAsync.calc(1, 2), 8);
        },
        async 'Idempotence control'() {
            class Idempotence extends $mol_object2 {
                static logs_idemp = 0;
                static logs_unidemp = 0;
                static log_idemp() {
                    this.logs_idemp += 1;
                }
                static log_unidemp() {
                    this.logs_unidemp += 1;
                }
                static async val(a) {
                    return a;
                }
                static sum(a, b) {
                    this.log_idemp();
                    this.log_unidemp();
                    const syn = $mol_wire_sync(this);
                    return syn.val(a) + syn.val(b);
                }
                static async calc(a, b) {
                    return 5 + await $mol_wire_async(this).sum(a, b);
                }
            }
            __decorate([
                $mol_wire_method
            ], Idempotence, "log_idemp", null);
            $mol_assert_equal(await Idempotence.calc(1, 2), 8);
            $mol_assert_equal(Idempotence.logs_idemp, 1);
            $mol_assert_equal(Idempotence.logs_unidemp, 3);
        },
        async 'Error handling'() {
            class Handle extends $mol_object2 {
                static async sum(a, b) {
                    $mol_fail(new Error('test error ' + (a + b)));
                }
                static check() {
                    try {
                        return $mol_wire_sync(Handle).sum(1, 2);
                    }
                    catch (error) {
                        if ($mol_promise_like(error))
                            $mol_fail_hidden(error);
                        $mol_assert_equal(error.message, 'test error 3');
                    }
                }
            }
            await $mol_wire_async(Handle).check();
        },
    });
})($ || ($ = {}));

;
"use strict";

;
"use strict";
var $;
(function ($_1) {
    $mol_test_mocks.push($ => {
        $.$mol_after_timeout = $mol_after_mock_timeout;
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    $mol_test({
        'test types'($) {
            class A {
                static a() {
                    return '';
                }
                static b() {
                    return $mol_wire_async(this).a();
                }
            }
        },
        async 'Latest method calls wins'($) {
            class NameLogger extends $mol_object2 {
                static $ = $;
                static first = [];
                static last = [];
                static send(next) {
                    $mol_wire_sync(this.first).push(next);
                    $$.$mol_wait_timeout(0);
                    this.last.push(next);
                }
            }
            const name = $mol_wire_async(NameLogger).send;
            name('john');
            const promise = name('jin');
            $.$mol_after_mock_warp();
            await promise;
            $mol_assert_equal(NameLogger.first, ['john', 'jin']);
            $mol_assert_equal(NameLogger.last, ['jin']);
        },
        async 'Latest function calls wins'($) {
            const first = [];
            const last = [];
            function send_name(next) {
                $mol_wire_sync(first).push(next);
                $$.$mol_wait_timeout(0);
                last.push(next);
            }
            const name = $mol_wire_async(send_name);
            name('john');
            const promise = name('jin');
            $.$mol_after_mock_warp();
            await promise;
            $mol_assert_equal(first, ['john', 'jin']);
            $mol_assert_equal(last, ['jin']);
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    $mol_test({
        'test types'($) {
            class A {
                static a() {
                    return Promise.resolve('');
                }
                static b() {
                    return $mol_wire_sync(this).a();
                }
            }
        },
        async 'test method from host'($) {
            let count = 0;
            class A {
                static a() {
                    return $mol_wire_sync(this).b();
                }
                static b() { return Promise.resolve(++count); }
            }
            $mol_assert_equal(await $mol_wire_async(A).a(), 1, count);
        },
        async 'test function'($) {
            let count = 0;
            class A {
                static a() {
                    return $mol_wire_sync(this.b)();
                }
                static b() { return Promise.resolve(++count); }
            }
            $mol_assert_equal(await $mol_wire_async(A).a(), 1, count);
        },
        async 'test construct itself'($) {
            class A {
                static instances = [];
                static a() {
                    const a = new ($mol_wire_sync(A))();
                    this.instances.push(a);
                    $mol_wire_sync(this).b();
                }
                static b() { return Promise.resolve(); }
            }
            await $mol_wire_async(A).a();
            $mol_assert_equal(A.instances.length, 2);
            $mol_assert_equal(A.instances[0] instanceof A, true);
            $mol_assert_equal(A.instances[0], A.instances[1]);
        }
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    class $mol_after_work extends $mol_object2 {
        delay;
        task;
        id;
        constructor(delay, task) {
            super();
            this.delay = delay;
            this.task = task;
            this.id = requestIdleCallback(task, { timeout: delay });
        }
        destructor() {
            cancelIdleCallback(this.id);
        }
    }
    $.$mol_after_work = $mol_after_work;
    if (typeof requestIdleCallback !== 'function') {
        $.$mol_after_work = $mol_after_timeout;
    }
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    $mol_test_mocks.push($ => {
        $.$mol_after_work = $mol_after_mock_timeout;
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    function $mol_wait_rest_async() {
        return new Promise(done => {
            new this.$mol_after_work(16, () => done(null));
        });
    }
    $.$mol_wait_rest_async = $mol_wait_rest_async;
    function $mol_wait_rest() {
        return this.$mol_wire_sync(this).$mol_wait_rest_async();
    }
    $.$mol_wait_rest = $mol_wait_rest;
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    var $$;
    (function ($$) {
        $mol_test_mocks.push($ => {
            $.$mol_wait_timeout = function $mol_wait_timeout_mock(timeout) { };
            $.$mol_wait_timeout_async = async function $mol_wait_timeout_async_mock(timeout) { };
        });
    })($$ = $_1.$$ || ($_1.$$ = {}));
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    function $mol_wait_timeout_async(timeout) {
        const promise = new $mol_promise();
        const task = new this.$mol_after_timeout(timeout, () => promise.done());
        return Object.assign(promise, {
            destructor: () => task.destructor()
        });
    }
    $.$mol_wait_timeout_async = $mol_wait_timeout_async;
    function $mol_wait_timeout(timeout) {
        return this.$mol_wire_sync(this).$mol_wait_timeout_async(timeout);
    }
    $.$mol_wait_timeout = $mol_wait_timeout;
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    var $$;
    (function ($$) {
        $mol_test_mocks.push($ => {
            $.$mol_wait_rest = function $mol_wait_rest_mock() { };
            $.$mol_wait_rest_async = async function $mol_wait_rest_async_mock() { };
        });
    })($$ = $_1.$$ || ($_1.$$ = {}));
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    $mol_test({
        // https://github.com/nin-jin/slides/tree/master/reactivity#component-states
        'Cached channel'($) {
            class App extends $mol_object2 {
                static $ = $;
                static value(next = 1) {
                    return next + 1;
                }
            }
            __decorate([
                $mol_wire_solo
            ], App, "value", null);
            $mol_assert_equal(App.value(), 2);
            App.value(2);
            $mol_assert_equal(App.value(), 3);
        },
        'Read Pushed'($) {
            class App extends $mol_object2 {
                static $ = $;
                static value(next = 0) {
                    return next;
                }
            }
            __decorate([
                $mol_wire_solo
            ], App, "value", null);
            $mol_assert_equal(App.value(1), 1);
            $mol_assert_equal(App.value(), 1);
        },
        'Mem overrides mem'($) {
            class Base extends $mol_object2 {
                static $ = $;
                static value(next = 1) {
                    return next + 1;
                }
            }
            __decorate([
                $mol_wire_solo
            ], Base, "value", null);
            class Middle extends Base {
                static value(next) {
                    return super.value(next) + 1;
                }
            }
            __decorate([
                $mol_wire_solo
            ], Middle, "value", null);
            class App extends Middle {
                static value(next) {
                    return super.value(next) * 3;
                }
            }
            __decorate([
                $mol_wire_solo
            ], App, "value", null);
            $mol_assert_equal(App.value(), 9);
            $mol_assert_equal(App.value(5), 21);
            $mol_assert_equal(App.value(), 21);
        },
        // https://github.com/nin-jin/slides/tree/master/reactivity#wish-consistency
        'Auto recalculation of cached values'($) {
            class App extends $mol_object2 {
                static $ = $;
                static xxx(next) {
                    return next || 1;
                }
                static yyy() {
                    return this.xxx() + 1;
                }
                static zzz() {
                    return this.yyy() + 1;
                }
            }
            __decorate([
                $mol_wire_solo
            ], App, "xxx", null);
            __decorate([
                $mol_wire_solo
            ], App, "yyy", null);
            __decorate([
                $mol_wire_solo
            ], App, "zzz", null);
            $mol_assert_equal(App.yyy(), 2);
            $mol_assert_equal(App.zzz(), 3);
            App.xxx(5);
            $mol_assert_equal(App.zzz(), 7);
        },
        // https://github.com/nin-jin/slides/tree/master/reactivity#wish-reasonability
        'Skip recalculation when actually no dependency changes'($) {
            const log = [];
            class App extends $mol_object2 {
                static $ = $;
                static xxx(next) {
                    log.push('xxx');
                    return next || 1;
                }
                static yyy() {
                    log.push('yyy');
                    return [Math.sign(this.xxx())];
                }
                static zzz() {
                    log.push('zzz');
                    return this.yyy()[0] + 1;
                }
            }
            __decorate([
                $mol_wire_solo
            ], App, "xxx", null);
            __decorate([
                $mol_wire_solo
            ], App, "yyy", null);
            __decorate([
                $mol_wire_solo
            ], App, "zzz", null);
            App.zzz();
            $mol_assert_like(log, ['zzz', 'yyy', 'xxx']);
            App.xxx(5);
            $mol_assert_like(log, ['zzz', 'yyy', 'xxx', 'xxx']);
            App.zzz();
            $mol_assert_like(log, ['zzz', 'yyy', 'xxx', 'xxx', 'yyy']);
        },
        // https://github.com/nin-jin/slides/tree/master/reactivity#flow-auto
        'Flow: Auto'($) {
            class App extends $mol_object2 {
                static get $() { return $; }
                static source(next = 1) { return next; }
                static condition(next = true) { return next; }
                static counter = 0;
                static result() {
                    const res = this.condition() ? this.source() : 0;
                    return res + this.counter++;
                }
            }
            __decorate([
                $mol_wire_solo
            ], App, "source", null);
            __decorate([
                $mol_wire_solo
            ], App, "condition", null);
            __decorate([
                $mol_wire_solo
            ], App, "result", null);
            $mol_assert_equal(App.result(), 1);
            $mol_assert_equal(App.counter, 1);
            App.source(10);
            $mol_assert_equal(App.result(), 11);
            $mol_assert_equal(App.counter, 2);
            App.condition(false);
            $mol_assert_equal(App.result(), 2);
            $mol_assert_equal(App.counter, 3);
            $mol_wire_fiber.sync();
            $mol_assert_equal(App.source(), 1);
            App.source(20);
            $mol_assert_equal(App.result(), 2);
            $mol_assert_equal(App.counter, 3);
            App.condition(true);
            $mol_assert_equal(App.result(), 23);
            $mol_assert_equal(App.counter, 4);
        },
        // https://github.com/nin-jin/slides/tree/master/reactivity#dupes-equality
        'Dupes: Equality'($) {
            let counter = 0;
            class App extends $mol_object2 {
                static $ = $;
                static foo(next) {
                    return next ?? { numbs: [1] };
                }
                static bar() {
                    return { ...this.foo(), count: ++counter };
                }
            }
            __decorate([
                $mol_wire_solo
            ], App, "foo", null);
            __decorate([
                $mol_wire_solo
            ], App, "bar", null);
            $mol_assert_like(App.bar(), { numbs: [1], count: 1 });
            App.foo({ numbs: [1] });
            $mol_assert_like(App.bar(), { numbs: [1], count: 1 });
            App.foo({ numbs: [2] });
            $mol_assert_like(App.bar(), { numbs: [2], count: 2 });
        },
        // https://github.com/nin-jin/slides/tree/master/reactivity#cycle-fail
        'Cycle: Fail'($) {
            class App extends $mol_object2 {
                static $ = $;
                static foo() {
                    return this.bar() + 1;
                }
                static bar() {
                    return this.foo() + 1;
                }
                static test() {
                    $mol_assert_fail(() => App.foo(), 'Circular subscription');
                }
            }
            __decorate([
                $mol_wire_solo
            ], App, "foo", null);
            __decorate([
                $mol_wire_solo
            ], App, "bar", null);
            __decorate([
                $mol_wire_method
            ], App, "test", null);
            App.test();
        },
        // https://github.com/nin-jin/slides/tree/master/reactivity#wish-stability
        // 'Update deps on push'( $ ) {
        // 	class App extends $mol_object2 {
        // 		static $ = $
        // 		@ $mol_wire_solo
        // 		static left( next = false ) {
        // 			return next
        // 		}
        // 		@ $mol_wire_solo
        // 		static right( next = false ) {
        // 			return next
        // 		}
        // 		@ $mol_wire_solo
        // 		static res( next?: boolean ) {
        // 			return this.left( next ) && this.right()
        // 		}
        // 	}
        // 	$mol_assert_equal( App.res(), false )
        // 	$mol_assert_equal( App.res( true ), false )
        // 	$mol_assert_equal( App.right( true ), true )
        // 	$mol_assert_equal( App.res(), true )
        // } ,
        // https://github.com/nin-jin/slides/tree/master/reactivity#wish-stability
        'Different order of pull and push'($) {
            class App extends $mol_object2 {
                static $ = $;
                static store(next = 0) {
                    return next;
                }
                static fast(next) {
                    return this.store(next);
                }
                static slow(next) {
                    if (next !== undefined)
                        this.slow(); // enforce pull before push
                    return this.store(next);
                }
            }
            __decorate([
                $mol_wire_solo
            ], App, "store", null);
            __decorate([
                $mol_wire_solo
            ], App, "fast", null);
            __decorate([
                $mol_wire_solo
            ], App, "slow", null);
            App.fast();
            $mol_assert_equal(App.slow(666), 666);
            $mol_assert_equal(App.fast(), App.slow(), 666);
            App.store(777);
            $mol_assert_equal(App.fast(), App.slow(), 777);
        },
        // https://github.com/nin-jin/slides/tree/master/reactivity#wish-stability
        'Actions inside invariant'($) {
            class App extends $mol_object2 {
                static $ = $;
                static count(next = 0) {
                    return next;
                }
                static count2() {
                    return this.count();
                }
                static res() {
                    const count = this.count2();
                    if (!count)
                        this.count(count + 1);
                    return count + 1;
                }
            }
            __decorate([
                $mol_wire_solo
            ], App, "count", null);
            __decorate([
                $mol_wire_solo
            ], App, "count2", null);
            __decorate([
                $mol_wire_solo
            ], App, "res", null);
            $mol_assert_like(App.res(), 1);
            App.count(5);
            $mol_assert_like(App.res(), 6);
        },
        async 'Toggle with async'($) {
            class App extends $mol_object2 {
                static $ = $;
                static checked(next = false) {
                    $$.$mol_wait_timeout(0);
                    return next;
                }
                static toggle() {
                    const prev = this.checked();
                    $mol_assert_unique(this.checked(!prev), prev);
                    // $mol_assert_equal( this.checked() , prev )
                }
                static res() {
                    return this.checked();
                }
                static test() {
                    $mol_assert_equal(App.res(), false);
                    App.toggle();
                    $mol_assert_equal(App.res(), true);
                }
            }
            __decorate([
                $mol_wire_solo
            ], App, "checked", null);
            __decorate([
                $mol_wire_method
            ], App, "toggle", null);
            __decorate([
                $mol_wire_solo
            ], App, "res", null);
            __decorate([
                $mol_wire_method
            ], App, "test", null);
            await $mol_wire_async(App).test();
        },
        // // https://github.com/nin-jin/slides/tree/master/reactivity#wish-stability
        // 'Stable order of multiple root'( $ ) {
        // 	class App extends $mol_object2 {
        // 		static $ = $
        // 		static counter = 0
        // 		@ $mol_wire_solo
        // 		static left_trigger( next = 0 ) {
        // 			return next
        // 		}
        // 		@ $mol_wire_solo
        // 		static left_root() {
        // 			this.left_trigger()
        // 			return ++ this.counter
        // 		}
        // 		@ $mol_wire_solo
        // 		static right_trigger( next = 0 ) {
        // 			return next
        // 		}
        // 		@ $mol_wire_solo
        // 		static right_root() {
        // 			this.right_trigger()
        // 			return ++ this.counter
        // 		}
        // 	}
        // 	$mol_assert_equal( App.left_root(), 1 )
        // 	$mol_assert_equal( App.right_root(), 2 )
        // 	App.right_trigger( 1 )
        // 	App.left_trigger( 1 )
        // 	$mol_wire_fiber.sync()
        // 	$mol_assert_equal( App.right_root(), 4 )
        // 	$mol_assert_equal( App.left_root(), 3 )
        // } ,
        // https://github.com/nin-jin/slides/tree/master/reactivity#error-store
        'Restore after error'($) {
            class App extends $mol_object2 {
                static get $() { return $; }
                static condition(next = false) { return next; }
                static broken() {
                    if (this.condition()) {
                        $mol_fail(new Error('test error'));
                    }
                    return 1;
                }
                static result() {
                    return this.broken();
                }
            }
            __decorate([
                $mol_wire_solo
            ], App, "condition", null);
            __decorate([
                $mol_wire_solo
            ], App, "broken", null);
            __decorate([
                $mol_wire_solo
            ], App, "result", null);
            $mol_assert_equal(App.result(), 1);
            App.condition(true);
            $mol_assert_fail(() => App.result(), 'test error');
            App.condition(false);
            $mol_assert_equal(App.result(), 1);
        },
        async 'Wait for data'($) {
            class App extends $mol_object2 {
                static $ = $;
                static async source() {
                    return 'Jin';
                }
                static middle() {
                    return $mol_wire_sync(this).source();
                }
                static target() {
                    return this.middle();
                }
                static test() {
                    $mol_assert_equal(App.target(), 'Jin');
                }
            }
            __decorate([
                $mol_wire_solo
            ], App, "middle", null);
            __decorate([
                $mol_wire_solo
            ], App, "target", null);
            __decorate([
                $mol_wire_method
            ], App, "test", null);
            await $mol_wire_async(App).test();
        },
        'Auto destroy on long alone'($) {
            let destroyed = false;
            class App extends $mol_object2 {
                static $ = $;
                static showing(next = true) {
                    return next;
                }
                static details() {
                    return {
                        destructor() {
                            destroyed = true;
                        }
                    };
                }
                static render() {
                    return this.showing() ? this.details() : null;
                }
            }
            __decorate([
                $mol_wire_solo
            ], App, "showing", null);
            __decorate([
                $mol_wire_solo
            ], App, "details", null);
            __decorate([
                $mol_wire_solo
            ], App, "render", null);
            const details = App.render();
            $mol_assert_ok(details);
            App.showing(false);
            $mol_assert_not(App.render());
            App.showing(true);
            $mol_assert_equal(App.render(), details);
            $mol_wire_fiber.sync();
            $mol_assert_not(destroyed);
            App.showing(false);
            $mol_wire_fiber.sync();
            $mol_assert_ok(destroyed);
            App.showing(true);
            $mol_assert_unique(App.render(), details);
        },
        // https://github.com/nin-jin/slides/tree/master/reactivity#wish-stability
        async 'Hold pubs while wait async task'($) {
            class App extends $mol_object2 {
                static $ = $;
                static counter = 0;
                static resets(next) {
                    return ($mol_wire_probe(() => this.resets()) ?? -1) + 1;
                }
                static async wait() { }
                static value() {
                    return ++this.counter;
                }
                static result() {
                    if (this.resets())
                        $mol_wire_sync(this).wait();
                    return this.value();
                }
            }
            __decorate([
                $mol_wire_solo
            ], App, "resets", null);
            __decorate([
                $mol_wire_solo
            ], App, "value", null);
            __decorate([
                $mol_wire_solo
            ], App, "result", null);
            $mol_assert_equal(App.result(), 1);
            App.resets(null);
            $mol_wire_fiber.sync();
            $mol_assert_equal(await $mol_wire_async(App).result(), 1);
        },
        'Owned value has js-path name'() {
            class App extends $mol_object2 {
                static title() {
                    return new $mol_object2;
                }
            }
            __decorate([
                $mol_wire_solo
            ], App, "title", null);
            $mol_assert_equal(`${App.title()}`, 'App.title<>');
        },
        'Unsubscribe from temp pubs on complete'($) {
            class Random extends $mol_object2 {
                static $ = $;
                static seed() {
                    return Math.random();
                }
                static resets(next) {
                    return Math.random();
                }
                static value() {
                    this.resets();
                    return this.seed();
                }
            }
            __decorate([
                $mol_wire_method
            ], Random, "seed", null);
            __decorate([
                $mol_wire_solo
            ], Random, "resets", null);
            __decorate([
                $mol_wire_solo
            ], Random, "value", null);
            const first = Random.value();
            Random.resets(null);
            $mol_assert_unique(Random.value(), first);
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    $mol_test({
        async 'Error caching'($) {
            const next_cached = 123;
            class Some extends $mol_object2 {
                static $ = $;
                static data(id, next) {
                    if (next)
                        return next;
                    setTimeout(() => {
                        $mol_wire_async(this).data(id, next_cached);
                    }, 10);
                    $mol_fail_hidden(new Promise(() => { }));
                }
                static run() {
                    return this.data('1');
                }
            }
            __decorate([
                $mol_wire_plex
            ], Some, "data", null);
            __decorate([
                $mol_wire_method
            ], Some, "run", null);
            const val = await $mol_wire_async(Some).run();
            $mol_assert_equal(val, next_cached);
        },
        'Memoize by single simple key'($) {
            class Team extends $mol_object2 {
                static $ = $;
                static user_name(user, next) {
                    return next ?? user;
                }
                static user_names() {
                    return [
                        this.user_name('jin'),
                        this.user_name('john'),
                    ];
                }
            }
            __decorate([
                $mol_wire_plex
            ], Team, "user_name", null);
            __decorate([
                $mol_wire_solo
            ], Team, "user_names", null);
            $mol_assert_like(Team.user_names(), ['jin', 'john']);
            Team.user_name('jin', 'JIN');
            $mol_assert_like(Team.user_names(), ['JIN', 'john']);
        },
        'Memoize by single complex key'($) {
            class Map extends $mol_object2 {
                static $ = $;
                static tile(pos) {
                    return new String(`/tile=${pos}`);
                }
                static test() {
                    $mol_assert_like(this.tile([0, 1]), new String('/tile=0,1'));
                    $mol_assert_equal(this.tile([0, 1]), this.tile([0, 1]));
                }
            }
            __decorate([
                $mol_wire_plex
            ], Map, "tile", null);
            __decorate([
                $mol_wire_method
            ], Map, "test", null);
            Map.test();
        },
        'Owned value has js-path name'() {
            class App extends $mol_object2 {
                static like(friend) {
                    return new $mol_object2;
                }
                static relation([friend, props]) {
                    return new $mol_object2;
                }
            }
            __decorate([
                $mol_wire_plex
            ], App, "like", null);
            __decorate([
                $mol_wire_plex
            ], App, "relation", null);
            $mol_assert_equal(`${App.like(123)}`, 'App.like<123>');
            $mol_assert_equal(`${App.relation([123, [456]])}`, 'App.relation<[123,[456]]>');
        },
        'Deep deps'($) {
            class Fib extends $mol_object2 {
                static $ = $;
                static sums = 0;
                static value(index, next) {
                    if (next)
                        return next;
                    if (index < 2)
                        return 1;
                    ++this.sums;
                    return this.value(index - 1) + this.value(index - 2);
                }
            }
            __decorate([
                $mol_wire_plex
            ], Fib, "value", null);
            $mol_assert_equal(Fib.value(4), 5);
            $mol_assert_equal(Fib.sums, 3);
            Fib.value(1, 2);
            $mol_assert_equal(Fib.value(4), 8);
            $mol_assert_equal(Fib.sums, 6);
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    $mol_test({
        'Previous value'() {
            class Cache extends $mol_object2 {
                static store(next) {
                    if (!next)
                        return {};
                    return {
                        ...$mol_wire_probe(() => this.store()) ?? {},
                        ...next,
                    };
                }
            }
            __decorate([
                $mol_wire_solo
            ], Cache, "store", null);
            $mol_assert_like(Cache.store(), {});
            $mol_assert_like(Cache.store({ foo: 666 }), { foo: 666 });
            $mol_assert_like(Cache.store({ bar: 777 }), { foo: 666, bar: 777 });
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    $mol_test({
        'span for same uri'($) {
            const span = new $mol_span('test.ts', '', 1, 3, 4);
            const child = span.span(4, 5, 8);
            $mol_assert_equal(child.uri, 'test.ts');
            $mol_assert_equal(child.row, 4);
            $mol_assert_equal(child.col, 5);
            $mol_assert_equal(child.length, 8);
        },
        'span after of given position'($) {
            const span = new $mol_span('test.ts', '', 1, 3, 4);
            const child = span.after(11);
            $mol_assert_equal(child.uri, 'test.ts');
            $mol_assert_equal(child.row, 1);
            $mol_assert_equal(child.col, 7);
            $mol_assert_equal(child.length, 11);
        },
        'slice span - regular'($) {
            const span = new $mol_span('test.ts', '', 1, 3, 5);
            const child = span.slice(1, 4);
            $mol_assert_equal(child.row, 1);
            $mol_assert_equal(child.col, 4);
            $mol_assert_equal(child.length, 3);
            const child2 = span.slice(2, 2);
            $mol_assert_equal(child2.col, 5);
            $mol_assert_equal(child2.length, 0);
        },
        'slice span - negative'($) {
            const span = new $mol_span('test.ts', '', 1, 3, 5);
            const child = span.slice(-3, -1);
            $mol_assert_equal(child.row, 1);
            $mol_assert_equal(child.col, 5);
            $mol_assert_equal(child.length, 2);
        },
        'slice span - out of range'($) {
            const span = new $mol_span('test.ts', '', 1, 3, 5);
            $mol_assert_fail(() => span.slice(-1, 3), `End value '3' can't be less than begin value (test.ts#1:3/5)`);
            $mol_assert_fail(() => span.slice(1, 6), `End value '6' out of range (test.ts#1:3/5)`);
            $mol_assert_fail(() => span.slice(1, 10), `End value '10' out of range (test.ts#1:3/5)`);
        },
        'error handling'($) {
            const span = new $mol_span('test.ts', '', 1, 3, 4);
            const error = span.error('Some error');
            $mol_assert_equal(error.message, 'Some error (test.ts#1:3/4)');
        }
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    $mol_test({
        'all cases of using maybe'() {
            $mol_assert_equal($mol_maybe(0)[0], 0);
            $mol_assert_equal($mol_maybe(false)[0], false);
            $mol_assert_equal($mol_maybe(null)[0], void 0);
            $mol_assert_equal($mol_maybe(void 0)[0], void 0);
            $mol_assert_equal($mol_maybe(void 0).map(v => v.toString())[0], void 0);
            $mol_assert_equal($mol_maybe(0).map(v => v.toString())[0], '0');
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    function check(tree, ideal) {
        $mol_assert_equal(tree.toString(), $$.$mol_tree2_from_string(ideal).toString());
    }
    $mol_test({
        'inserting'($) {
            check($.$mol_tree2_from_string(`
					a b c d
				`).insert($mol_tree2.struct('x'), 'a', 'b', 'c'), `
					a b x
				`);
            check($.$mol_tree2_from_string(`
					a b
				`).insert($mol_tree2.struct('x'), 'a', 'b', 'c', 'd'), `
					a b c x
				`);
            check($.$mol_tree2_from_string(`
					a b c d
				`)
                .insert($mol_tree2.struct('x'), 0, 0, 0), `
					a b x
				`);
            check($.$mol_tree2_from_string(`
					a b
				`)
                .insert($mol_tree2.struct('x'), 0, 0, 0, 0), `
					a b \\
						x
				`);
            check($.$mol_tree2_from_string(`
					a b c d
				`)
                .insert($mol_tree2.struct('x'), null, null, null), `
					a b x
				`);
            check($.$mol_tree2_from_string(`
					a b
				`)
                .insert($mol_tree2.struct('x'), null, null, null, null), `
					a b \\
						x
				`);
        },
        'updating'($) {
            check($.$mol_tree2_from_string(`
					a b c d
				`).update([], 'a', 'b', 'c')[0], `
					a b
				`);
            check($.$mol_tree2_from_string(`
					a b c d
				`).update([$mol_tree2.struct('x')])[0], `
					x
				`);
            check($.$mol_tree2_from_string(`
					a b c d
				`).update([$mol_tree2.struct('x'), $mol_tree2.struct('y')], 'a', 'b', 'c')[0], `
					a b
						x
						y
				`);
        },
        'deleting'($) {
            const base = $.$mol_tree2_from_string(`
				a b c d
			`);
            check(base.insert(null, 'a', 'b', 'c'), `
					a b
				`);
            check(base.update(base.select('a', 'b', 'c', null).kids, 'a', 'b', 'c')[0], `
					a b d
				`);
            check(base.insert(null, 0, 0, 0), `
					a b
				`);
        },
        'hack'($) {
            const res = $.$mol_tree2_from_string(`
				foo bar xxx
			`)
                .hack({
                'bar': (input, belt) => [input.struct('777', input.hack(belt))],
            });
            $mol_assert_equal(res.map(String), ['foo 777 xxx\n']);
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    $mol_test({
        'empty array'() {
            $mol_assert_equal($mol_array_chunks([], () => true), []);
        },
        'one chunk'() {
            $mol_assert_equal($mol_array_chunks([1, 2, 3, 4, 5], () => false), [[1, 2, 3, 4, 5]]);
        },
        'fixed size chunk'() {
            $mol_assert_equal($mol_array_chunks([1, 2, 3, 4, 5], 3), [[1, 2, 3], [4, 5]]);
        },
        'first empty chunk'() {
            $mol_assert_equal($mol_array_chunks([1, 2, 3, 4, 5], (_, i) => i === 0), [[1, 2, 3, 4, 5]]);
        },
        'chunk for every item'() {
            $mol_assert_equal($mol_array_chunks([1, 2, 3, 4, 5], () => true), [[1], [2], [3], [4], [5]]);
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    $mol_test({
        'tree parsing'($) {
            $mol_assert_equal($.$mol_tree2_from_string("foo\nbar\n").kids.length, 2);
            $mol_assert_equal($.$mol_tree2_from_string("foo\nbar\n").kids[1].type, "bar");
            $mol_assert_equal($.$mol_tree2_from_string("foo\n\n\n").kids.length, 1);
            $mol_assert_equal($.$mol_tree2_from_string("=foo\n\\bar\n").kids.length, 2);
            $mol_assert_equal($.$mol_tree2_from_string("=foo\n\\bar\n").kids[1].value, "bar");
            $mol_assert_equal($.$mol_tree2_from_string("foo bar \\pol\n").kids[0].kids[0].kids[0].value, "pol");
            $mol_assert_equal($.$mol_tree2_from_string("foo bar\n\t\\pol\n\t\\men\n").kids[0].kids[0].kids[1].value, "men");
            $mol_assert_equal($.$mol_tree2_from_string('foo bar \\text\n').toString(), 'foo bar \\text\n');
        },
        'Too many tabs'($) {
            const tree = `
				foo
						bar
			`;
            $mol_assert_fail(() => {
                $.$mol_tree2_from_string(tree, 'test');
            }, 'Too many tabs\ntest#3:1/6\n!!!!!!\n\t\t\t\t\t\tbar');
        },
        'Too few tabs'($) {
            const tree = `
					foo
				bar
			`;
            $mol_assert_fail(() => {
                $.$mol_tree2_from_string(tree, 'test');
            }, 'Too few tabs\ntest#3:1/4\n!!!!\n\t\t\t\tbar');
        },
        'Wrong nodes separator at start'($) {
            const tree = `foo\n \tbar\n`;
            $mol_assert_fail(() => {
                $.$mol_tree2_from_string(tree, 'test');
            }, 'Wrong nodes separator\ntest#2:1/2\n!!\n \tbar');
        },
        'Wrong nodes separator in the middle'($) {
            const tree = `foo  bar\n`;
            $mol_assert_fail(() => {
                $.$mol_tree2_from_string(tree, 'test');
            }, 'Wrong nodes separator\ntest#1:5/1\n    !\nfoo  bar');
        },
        'Unexpected EOF, LF required'($) {
            const tree = `	foo`;
            $mol_assert_fail(() => {
                $.$mol_tree2_from_string(tree, 'test');
            }, 'Unexpected EOF, LF required\ntest#1:5/1\n	   !\n	foo');
        },
        'Errors skip and collect'($) {
            const tree = `foo  bar`;
            const errors = [];
            const $$ = $.$mol_ambient({
                $mol_fail: (error) => {
                    errors.push(error.message);
                    return null;
                }
            });
            const res = $$.$mol_tree2_from_string(tree, 'test');
            $mol_assert_like(errors, [
                'Wrong nodes separator\ntest#1:5/1\n    !\nfoo  bar',
                'Unexpected EOF, LF required\ntest#1:9/1\n        !\nfoo  bar',
            ]);
            $mol_assert_equal(res.toString(), 'foo bar\n');
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    $mol_test({
        'fromJSON'() {
            $mol_assert_equal($mol_tree2_from_json([]).toString(), '/\n');
            $mol_assert_equal($mol_tree2_from_json([false, true]).toString(), '/\n\tfalse\n\ttrue\n');
            $mol_assert_equal($mol_tree2_from_json([0, 1, 2.3]).toString(), '/\n\t0\n\t1\n\t2.3\n');
            $mol_assert_equal($mol_tree2_from_json(new Uint16Array([1, 10, 255, 256, 65535])).toString(), '\\01 00 0A 00 FF 00 00 01\n\\FF FF\n');
            $mol_assert_equal($mol_tree2_from_json(['', 'foo', 'bar\nbaz']).toString(), '/\n\t\\\n\t\\foo\n\t\\\n\t\t\\bar\n\t\t\\baz\n');
            $mol_assert_equal($mol_tree2_from_json({ 'foo': false, 'bar\nbaz': 'lol' }).toString(), '*\n\tfoo false\n\t\\\n\t\t\\bar\n\t\t\\baz\n\t\t\\lol\n');
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    $mol_test({
        'auto name'() {
            class Invalid extends $mol_error_mix {
            }
            const mix = new Invalid('foo');
            $mol_assert_equal(mix.name, 'Invalid_Error');
        },
        'simpe mix'() {
            const mix = new $mol_error_mix('foo', {}, new Error('bar'), new Error('lol'));
            $mol_assert_equal(mix.message, 'foo');
            $mol_assert_equal(mix.errors.map(e => e.message), ['bar', 'lol']);
        },
        'provide additional info'() {
            class Invalid extends $mol_error_mix {
            }
            const mix = new $mol_error_mix('Wrong password', {}, new Invalid('Too short', { value: 'p@ssw0rd', hint: '> 8 letters' }), new Invalid('Too simple', { value: 'p@ssw0rd', hint: 'need capital letter' }));
            const hints = [];
            if (mix instanceof $mol_error_mix) {
                for (const er of mix.errors) {
                    if (er instanceof Invalid) {
                        hints.push(er.cause?.hint ?? '');
                    }
                }
            }
            $mol_assert_equal(hints, ['> 8 letters', 'need capital letter']);
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    $mol_test({
        'init with overload'() {
            class X extends $mol_object {
                foo() {
                    return 1;
                }
            }
            var x = X.make({
                foo: () => 2,
            });
            $mol_assert_equal(x.foo(), 2);
        },
        'Context in instance inherits from class'($) {
            const custom = $.$mol_ambient({});
            class X extends $.$mol_object {
                static $ = custom;
            }
            $mol_assert_equal(new X().$, custom);
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    $mol_test({
        async 'exec timeout auto kill child process'($) {
            let close_mock = () => { };
            const error_message = 'Run error, timeout';
            function mol_run_spawn_sync_mock() {
                return {
                    output: [],
                    stdout: error_message,
                    stderr: '',
                    status: 0,
                    signal: null,
                    pid: 123,
                };
            }
            function mol_run_spawn_mock() {
                return {
                    on(name, cb) {
                        if (name === 'exit')
                            close_mock = cb;
                    },
                    kill() { close_mock(); }
                };
            }
            const context_mock = $.$mol_ambient({
                $mol_run_spawn_sync: mol_run_spawn_sync_mock,
                $mol_run_spawn: mol_run_spawn_mock
            });
            class $mol_run_mock extends $mol_run {
                static get $() { return context_mock; }
                static async_enabled() {
                    return true;
                }
            }
            let message = '';
            try {
                const res = await $mol_wire_async($mol_run_mock).spawn({
                    command: 'sleep 10',
                    dir: '.',
                    timeout: 10,
                    env: { 'MOL_RUN_ASYNC': '1' }
                });
            }
            catch (e) {
                message = e.message;
            }
            $mol_assert_equal(message, error_message);
        }
    });
})($ || ($ = {}));

;
"use strict";
/** @jsx $mol_jsx */
var $;
(function ($) {
    $mol_test({
        'Primitives'() {
            $mol_assert_equal($mol_key(null), 'null');
            $mol_assert_equal($mol_key(false), 'false');
            $mol_assert_equal($mol_key(true), 'true');
            $mol_assert_equal($mol_key(0), '0');
            $mol_assert_equal($mol_key(1n << 64n), '18446744073709551616n');
            $mol_assert_equal($mol_key(''), '""');
        },
        'Array & POJO'() {
            $mol_assert_equal($mol_key([null]), '[null]');
            $mol_assert_equal($mol_key({ foo: 0 }), '{"foo":0}');
            $mol_assert_equal($mol_key({ foo: [false] }), '{"foo":[false]}');
        },
        'Uint8Array'() {
            $mol_assert_equal($mol_key(new Uint8Array([1, 2])), 'Uint8Array([1,2])');
            $mol_assert_equal($mol_key([new Uint8Array([1, 2])]), '[Uint8Array([1,2])]');
            $mol_assert_equal($mol_key({ foo: new Uint8Array([1, 2]) }), '{"foo":Uint8Array([1,2])}');
        },
        'Function'() {
            const func = () => { };
            $mol_assert_equal($mol_key(func), $mol_key(func));
            $mol_assert_unique($mol_key(func), $mol_key(() => { }));
        },
        'Objects'() {
            class User {
            }
            const jin = new User();
            $mol_assert_equal($mol_key(jin), $mol_key(jin));
            $mol_assert_unique($mol_key(jin), $mol_key(new User()));
        },
        'Elements'() {
            const foo = $mol_jsx("div", null, "bar");
            $mol_assert_equal($mol_key(foo), $mol_key(foo));
            $mol_assert_unique($mol_key(foo), $mol_key($mol_jsx("div", null, "bar")));
        },
        'Custom JSON representation'() {
            class User {
                toJSON() { return 'jin'; }
            }
            $mol_assert_unique([$mol_key(new User)], [$mol_key(new User)]);
        },
        'Custom key handler'() {
            class User {
                name;
                age;
                constructor(name, age) {
                    this.name = name;
                    this.age = age;
                }
                [$mol_key_handle]() { return `User(${JSON.stringify(this.name)})`; }
            }
            $mol_assert_equal($mol_key([new User('jin', 16)]), $mol_key([new User('jin', 18)]), '[User("jin")]');
        },
        'Special native classes'() {
            $mol_assert_equal($mol_key(new Date('xyz')), 'Date(NaN)');
            $mol_assert_equal($mol_key(new Date(12345)), 'Date(12345)');
            $mol_assert_equal($mol_key(/./), '/./');
            $mol_assert_equal($mol_key(/\./gimsu), '/\\./gimsu');
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    $mol_test_mocks.push($ => {
        $.$mol_after_frame = $mol_after_mock_commmon;
    });
})($ || ($ = {}));

;
"use strict";

;
"use strict";
var $;
(function ($) {
    /** Watch and logs reactive states. Logger automatically added to test bundle which is adding to `test.html`. */
    class $mol_wire_log extends $mol_object2 {
        static watch(task) {
            return task;
        }
        static track(fiber) {
            const prev = $mol_wire_probe(() => this.track(fiber));
            let next;
            try {
                next = fiber.sync();
            }
            finally {
                for (const pub of fiber.pub_list) {
                    if (pub instanceof $mol_wire_fiber) {
                        this.track(pub);
                    }
                }
            }
            if (fiber.host === this)
                return next;
            if ($mol_compare_deep(prev, next)) {
                this.$.$mol_log3_rise({
                    message: '💧 Same',
                    place: fiber,
                });
            }
            else if (prev !== undefined) {
                this.$.$mol_log3_rise({
                    message: '🔥 Next',
                    place: fiber,
                    prev,
                });
            }
            return next;
        }
        static active() {
            try {
                this.watch()?.();
            }
            catch (error) {
                $mol_fail_log(error);
            }
            finally {
                for (const pub of $mol_wire_auto().pub_list) {
                    if (pub instanceof $mol_wire_fiber) {
                        this.track(pub);
                    }
                }
            }
        }
    }
    __decorate([
        $mol_mem
    ], $mol_wire_log, "watch", null);
    __decorate([
        $mol_mem_key
    ], $mol_wire_log, "track", null);
    __decorate([
        $mol_mem
    ], $mol_wire_log, "active", null);
    $.$mol_wire_log = $mol_wire_log;
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    $mol_wire_log.active();
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    $mol_test({
        'libs_set survives the wire'($) {
            const parts = [
                { tree: 'my_card mol_view\n\tprice 0\n', js: 'price(){ return 1 }', css: '' },
                { tree: 'my_badge my_card\n', js: '', css: '[my_badge] { color: red }' },
            ];
            const sent = [];
            $bog_vmap_bridge_send({ postMessage: (data) => { sent.push(data); } }, { kind: 'libs_set', parts });
            $mol_assert_equal(sent.length, 1);
            const message = $bog_vmap_bridge_read({ data: sent[0] });
            $mol_assert_equal(message?.kind, 'libs_set');
            if (message?.kind !== 'libs_set')
                return;
            $mol_assert_like(message.parts, parts);
        },
        'values_want and values survive the wire'($) {
            const sent = [];
            const target = { postMessage: (data) => { sent.push(data); } };
            $bog_vmap_bridge_send(target, { kind: 'values_want', names: ['calc_result', 'calc_value'] });
            $bog_vmap_bridge_send(target, { kind: 'values', values: { calc_result: '42', calc_value: 'Error: boom' } });
            const want = $bog_vmap_bridge_read({ data: sent[0] });
            $mol_assert_equal(want?.kind, 'values_want');
            if (want?.kind !== 'values_want')
                return;
            $mol_assert_like(want.names, ['calc_result', 'calc_value']);
            const got = $bog_vmap_bridge_read({ data: sent[1] });
            $mol_assert_equal(got?.kind, 'values');
            if (got?.kind !== 'values')
                return;
            $mol_assert_like(got.values, { calc_result: '42', calc_value: 'Error: boom' });
        },
        'a port of a part is asked for by a dotted name and answered by a table'($) {
            const sent = [];
            const target = { postMessage: (data) => { sent.push(data); } };
            const table = 'city\tsum\nМосква\t7\nПитер\t9';
            $bog_vmap_bridge_send(target, { kind: 'values_want', names: ['calc_result', 'Calc.result', 'Calc.rows'] });
            $bog_vmap_bridge_send(target, { kind: 'values', values: { 'Calc.result': '42', 'Calc.rows': table } });
            const want = $bog_vmap_bridge_read({ data: sent[0] });
            if (want?.kind !== 'values_want')
                return $mol_assert_equal(want?.kind, 'values_want');
            $mol_assert_like(want.names, ['calc_result', 'Calc.result', 'Calc.rows']);
            const got = $bog_vmap_bridge_read({ data: sent[1] });
            if (got?.kind !== 'values')
                return $mol_assert_equal(got?.kind, 'values');
            $mol_assert_equal(got.values['Calc.result'], '42');
            $mol_assert_like(got.values['Calc.rows'].split('\n').map(line => line.split('\t')), [
                ['city', 'sum'],
                ['Москва', '7'],
                ['Питер', '9'],
            ]);
        },
        'a message from another namespace is not ours'($) {
            $mol_assert_equal($bog_vmap_bridge_read({ data: { ns: 'somebody_else', kind: 'libs_set', parts: [] } }), null);
            $mol_assert_equal($bog_vmap_bridge_read({ data: 'text' }), null);
            $mol_assert_equal($bog_vmap_bridge_read({ data: { ns: $bog_vmap_bridge_ns } }), null);
        },
        'a message from a window other than the peer is dropped'($) {
            const peer = {};
            const stranger = {};
            const data = { ns: $bog_vmap_bridge_ns, kind: 'ready' };
            $mol_assert_equal($bog_vmap_bridge_read({ data, source: stranger }, peer), null);
            $mol_assert_equal($bog_vmap_bridge_read({ data, source: peer }, peer)?.kind, 'ready');
            $mol_assert_equal($bog_vmap_bridge_read({ data, source: stranger }, null), null);
        },
    });
})($ || ($ = {}));
(function ($_2) {
    $mol_test({
        'click_at survives the wire with its point and modifiers'($) {
            const posted = [];
            const target = { postMessage(data) { posted.push(data); } };
            const mods = { altKey: false, ctrlKey: true, metaKey: false, shiftKey: false };
            $bog_vmap_bridge_send(target, { kind: 'click_at', x: 12.5, y: -3, mods });
            $mol_assert_equal(posted.length, 1);
            const read = $bog_vmap_bridge_read({ data: posted[0], source: target }, target);
            $mol_assert_equal(read?.kind, 'click_at');
            if (read?.kind !== 'click_at')
                return;
            $mol_assert_equal(read.x, 12.5);
            $mol_assert_equal(read.y, -3);
            $mol_assert_like(read.mods, mods);
        },
        'a click_at from a stranger is dropped'($) {
            const peer = {};
            const stranger = {};
            const data = { ns: $bog_vmap_bridge_ns, kind: 'click_at', x: 1, y: 2, mods: {} };
            $mol_assert_equal($bog_vmap_bridge_read({ data, source: stranger }, peer), null);
            $mol_assert_equal($bog_vmap_bridge_read({ data, source: peer }, peer)?.kind, 'click_at');
        },
    });
})($ || ($ = {}));

;
"use strict";

;
"use strict";
var $;
(function ($) {
    $mol_test({
        'run callback'() {
            class Plus1 extends $mol_wrapper {
                static wrap(task) {
                    return function (...args) {
                        return task.call(this, ...args) + 1;
                    };
                }
            }
            $mol_assert_equal(Plus1.run(() => 2), 3);
        },
        'wrap function'() {
            class Plus1 extends $mol_wrapper {
                static wrap(task) {
                    return function (...args) {
                        return task.call(this, ...args) + 1;
                    };
                }
            }
            const obj = {
                level: 2,
                pow: Plus1.func(function (a) {
                    return a ** this.level;
                })
            };
            $mol_assert_equal(obj.pow(2), 5);
        },
        'decorate field getter'() {
            class Plus1 extends $mol_wrapper {
                static last = 0;
                static wrap(task) {
                    return function (...args) {
                        return Plus1.last = (task.call(this, ...args) || 0) + 1;
                    };
                }
            }
            class Foo {
                static get two() {
                    return 1;
                }
                static set two(next) { }
            }
            __decorate([
                Plus1.field
            ], Foo, "two", null);
            $mol_assert_equal(Foo.two, 2);
            Foo.two = 3;
            $mol_assert_equal(Plus1.last, 2);
            $mol_assert_equal(Foo.two, 2);
        },
        'decorate instance method'() {
            class Plus1 extends $mol_wrapper {
                static wrap(task) {
                    return function (...args) {
                        return task.call(this, ...args) + 1;
                    };
                }
            }
            class Foo1 {
                level = 2;
                pow(a) {
                    return a ** this.level;
                }
            }
            __decorate([
                Plus1.method
            ], Foo1.prototype, "pow", null);
            const Foo2 = Foo1;
            const foo = new Foo2;
            $mol_assert_equal(foo.pow(2), 5);
        },
        'decorate static method'() {
            class Plus1 extends $mol_wrapper {
                static wrap(task) {
                    return function (...args) {
                        return task.call(this, ...args) + 1;
                    };
                }
            }
            class Foo {
                static level = 2;
                static pow(a) {
                    return a ** this.level;
                }
            }
            __decorate([
                Plus1.method
            ], Foo, "pow", null);
            $mol_assert_equal(Foo.pow(2), 5);
        },
        'decorate class'() {
            class BarInc extends $mol_wrapper {
                static wrap(task) {
                    return function (...args) {
                        const foo = task.call(this, ...args);
                        foo.bar++;
                        return foo;
                    };
                }
            }
            let Foo = class Foo {
                bar;
                constructor(bar) {
                    this.bar = bar;
                }
            };
            Foo = __decorate([
                BarInc.class
            ], Foo);
            $mol_assert_equal(new Foo(2).bar, 3);
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    $mol_test({
        'memoize field'() {
            class Foo {
                static one = 1;
                static get two() {
                    return ++this.one;
                }
                static set two(next) { }
            }
            __decorate([
                $mol_memo.field
            ], Foo, "two", null);
            $mol_assert_equal(Foo.two, 2);
            $mol_assert_equal(Foo.two, 2);
            Foo.two = 3;
            $mol_assert_equal(Foo.two, 3);
            $mol_assert_equal(Foo.two, 3);
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    $mol_test({
        'const returns stored value'() {
            const foo = { bar: $mol_const(Math.random()) };
            $mol_assert_equal(foo.bar(), foo.bar());
            $mol_assert_equal(foo.bar(), foo.bar['()']);
        },
    });
})($ || ($ = {}));

;
"use strict";

;
"use strict";

;
"use strict";
var $;
(function ($_1) {
    $mol_test({
        'id auto generation'($) {
            class $mol_view_test_item extends $mol_view {
            }
            class $mol_view_test_block extends $mol_view {
                static $ = $;
                element(id) {
                    return new $mol_view_test_item();
                }
            }
            __decorate([
                $mol_mem_key
            ], $mol_view_test_block.prototype, "element", null);
            var x = $mol_view_test_block.Root(0);
            $mol_assert_equal(x.dom_node().id, '$mol_view_test_block.Root(0)');
            $mol_assert_equal(x.element(0).dom_node().id, '$mol_view_test_block.Root(0).element(0)');
        },
        'caching ref to dom node'($) {
            var x = new class extends $mol_view {
            };
            x.$ = $;
            $mol_assert_equal(x.dom_node(), x.dom_node());
        },
        'content render'($) {
            class $mol_view_test extends $mol_view {
                sub() {
                    return ['lol', 5];
                }
            }
            var x = new $mol_view_test();
            x.$ = $;
            var node = x.dom_tree();
            $mol_assert_equal(node.innerHTML, 'lol5');
        },
        'bem attributes generation'($) {
            class $mol_view_test_item extends $mol_view {
            }
            class $mol_view_test_block extends $mol_view {
                Element(id) {
                    return new $mol_view_test_item();
                }
            }
            __decorate([
                $mol_mem_key
            ], $mol_view_test_block.prototype, "Element", null);
            var x = new $mol_view_test_block();
            x.$ = $;
            $mol_assert_equal(x.dom_node().getAttribute('mol_view_test_block'), '');
            $mol_assert_equal(x.dom_node().getAttribute('mol_view'), '');
            $mol_assert_equal(x.Element(0).dom_node().getAttribute('mol_view_test_block_element'), '');
            $mol_assert_equal(x.Element(0).dom_node().getAttribute('mol_view_test_item'), '');
            $mol_assert_equal(x.Element(0).dom_node().getAttribute('mol_view'), '');
        },
        'render custom attributes'($) {
            class $mol_view_test extends $mol_view {
                attr() {
                    return {
                        'href': '#haha',
                        'required': true,
                        'hidden': false,
                    };
                }
            }
            var x = new $mol_view_test();
            x.$ = $;
            var node = x.dom_tree();
            $mol_assert_equal(node.getAttribute('href'), '#haha');
            $mol_assert_equal(node.getAttribute('required'), 'true');
            $mol_assert_equal(node.getAttribute('hidden'), null);
        },
        'render custom fields'($) {
            class $mol_view_test extends $mol_view {
                field() {
                    return {
                        'hidden': true
                    };
                }
            }
            var x = new $mol_view_test();
            x.$ = $;
            var node = x.dom_tree();
            $mol_assert_equal(node.hidden, true);
        },
        'attach event handlers'($) {
            var clicked = false;
            class $mol_view_test extends $mol_view {
                event() {
                    return {
                        'click': (next) => this.event_click(next)
                    };
                }
                event_click(next) {
                    clicked = true;
                }
            }
            var x = new $mol_view_test();
            x.$ = $;
            var node = x.dom_node();
            node.click();
            $mol_assert_ok(clicked);
        },
    });
})($ || ($ = {}));

;
"use strict";

;
"use strict";

;
"use strict";
var $;
(function ($) {
    $mol_test({
        'escape'() {
            const specials = $mol_regexp.from('.*+?^${}()|[]\\');
            $mol_assert_equal(specials.source, '\\.\\*\\+\\?\\^\\$\\{\\}\\(\\)\\|\\[\\]\\\\');
        },
        'char code'() {
            const space = $mol_regexp.from(32);
            $mol_assert_like(' '.match(space), [' ']);
        },
        'repeat fixed'() {
            const { repeat, decimal_only: digit } = $mol_regexp;
            const year = repeat(digit, 4, 4);
            $mol_assert_like('#2020#'.match(year), ['2020']);
        },
        'greedy repeat'() {
            const { repeat, repeat_greedy, latin_only: letter } = $mol_regexp;
            $mol_assert_like('abc'.match(repeat(letter, 1, 2)), ['a', 'b', 'c']);
            $mol_assert_like('abc'.match(repeat_greedy(letter, 1, 2)), ['ab', 'c']);
        },
        'repeat range'() {
            const { repeat_greedy, decimal_only: digit } = $mol_regexp;
            const year = repeat_greedy(digit, 2, 4);
            $mol_assert_like('#2#'.match(year), null);
            $mol_assert_like('#20#'.match(year), ['20']);
            $mol_assert_like('#2020#'.match(year), ['2020']);
            $mol_assert_like('#20201#'.match(year), ['2020']);
        },
        'repeat from'() {
            const { repeat_greedy, latin_only: letter } = $mol_regexp;
            const name = repeat_greedy(letter, 2);
            $mol_assert_like('##'.match(name), null);
            $mol_assert_like('#a#'.match(name), null);
            $mol_assert_like('#ab#'.match(name), ['ab']);
            $mol_assert_like('#abc#'.match(name), ['abc']);
        },
        'from string'() {
            const regexp = $mol_regexp.from('[\\d]');
            $mol_assert_equal(regexp.source, '\\[\\\\d\\]');
            $mol_assert_equal(regexp.flags, 'gsu');
        },
        'from regexp'() {
            const regexp = $mol_regexp.from(/[\d]/i);
            $mol_assert_equal(regexp.source, '[\\d]');
            $mol_assert_equal(regexp.flags, 'i');
        },
        'split'() {
            const regexp = $mol_regexp.from(';');
            $mol_assert_like('aaa;bbb;ccc'.split(regexp), ['aaa', ';', 'bbb', ';', 'ccc']);
            $mol_assert_like('aaa;;ccc'.split(regexp), ['aaa', ';', '', ';', 'ccc']);
            $mol_assert_like('aaa'.split(regexp), ['aaa']);
            $mol_assert_like(''.split(regexp), ['']);
        },
        'test for matching'() {
            const regexp = $mol_regexp.from('foo');
            $mol_assert_like(regexp.test(''), false);
            $mol_assert_like(regexp.test('fo'), false);
            $mol_assert_like(regexp.test('foo'), true);
            $mol_assert_like(regexp.test('foobar'), true);
            $mol_assert_like(regexp.test('barfoo'), true);
        },
        'case ignoring'() {
            const xxx = $mol_regexp.from('x', { ignoreCase: true });
            $mol_assert_like(xxx.flags, 'gisu');
            $mol_assert_like(xxx.exec('xx')[0], 'x');
            $mol_assert_like(xxx.exec('XX')[0], 'X');
        },
        'multiline mode'() {
            const { end, from } = $mol_regexp;
            const xxx = from(['x', end], { multiline: true });
            $mol_assert_like(xxx.exec('x\ny')[0], 'x');
            $mol_assert_like(xxx.flags, 'gmsu');
        },
        'flags override'() {
            const triplet = $mol_regexp.from($mol_regexp.from(/.../, { ignoreCase: true }), { multiline: true });
            $mol_assert_like(triplet.toString(), '/.../gmsu');
        },
        'sequence'() {
            const { begin, end, decimal_only: digit, repeat, from } = $mol_regexp;
            const year = repeat(digit, 4, 4);
            const dash = '-';
            const month = repeat(digit, 2, 2);
            const day = repeat(digit, 2, 2);
            const date = from([begin, year, dash, month, dash, day, end]);
            $mol_assert_like(date.exec('2020-01-02')[0], '2020-01-02');
        },
        'optional'() {
            const name = $mol_regexp.from(['A', ['4']]);
            $mol_assert_equal('AB'.match(name)[0], 'A');
            $mol_assert_equal('A4'.match(name)[0], 'A4');
        },
        'anon variants'() {
            const name = $mol_regexp.from(['A', $mol_regexp.vary(['4', '5'])]);
            $mol_assert_equal('AB'.match(name), null);
            $mol_assert_equal('A4'.match(name)[0], 'A4');
            $mol_assert_equal('A5'.match(name)[0], 'A5');
        },
        'only groups'() {
            const regexp = $mol_regexp.from({ dog: '@' });
            $mol_assert_like([...'#'.matchAll(regexp)][0].groups, undefined);
            $mol_assert_like([...'@'.matchAll(regexp)][0].groups, { dog: '@' });
        },
        'catch skipped'() {
            const regexp = $mol_regexp.from(/(@)(\d?)/g);
            $mol_assert_like([...'[[@]]'.matchAll(regexp)].map(f => [...f]), [
                ['[['],
                ['@', '@', ''],
                [']]'],
            ]);
        },
        'enum variants'() {
            let Sex;
            (function (Sex) {
                Sex["male"] = "male";
                Sex["female"] = "female";
            })(Sex || (Sex = {}));
            const sexism = $mol_regexp.from(Sex);
            $mol_assert_like([...''.matchAll(sexism)].length, 0);
            $mol_assert_like([...'trans'.matchAll(sexism)][0].groups, undefined);
            $mol_assert_like([...'male'.matchAll(sexism)][0].groups, { male: 'male', female: '' });
            $mol_assert_like([...'female'.matchAll(sexism)][0].groups, { male: '', female: 'female' });
        },
        'recursive only groups'() {
            let Sex;
            (function (Sex) {
                Sex["male"] = "male";
                Sex["female"] = "female";
            })(Sex || (Sex = {}));
            const sexism = $mol_regexp.from({ Sex });
            $mol_assert_like([...''.matchAll(sexism)].length, 0);
            $mol_assert_like([...'male'.matchAll(sexism)][0].groups, { Sex: 'male', male: 'male', female: '' });
            $mol_assert_like([...'female'.matchAll(sexism)][0].groups, { Sex: 'female', male: '', female: 'female' });
        },
        'sequence with groups'() {
            const { begin, end, decimal_only: digit, repeat, from } = $mol_regexp;
            const year = repeat(digit, 4, 4);
            const dash = '-';
            const month = repeat(digit, 2, 2);
            const day = repeat(digit, 2, 2);
            const regexp = from([begin, { year }, dash, { month }, dash, { day }, end]);
            const found = [...'2020-01-02'.matchAll(regexp)];
            $mol_assert_like(found[0].groups, {
                year: '2020',
                month: '01',
                day: '02',
            });
        },
        'sequence with groups of mixed type'() {
            const prefix = '/';
            const postfix = '/';
            const regexp = $mol_regexp.from([{ prefix }, /(\w+)/, { postfix }, /([gumi]*)/]);
            $mol_assert_like([...'/foo/mi'.matchAll(regexp)], [
                Object.assign(["/foo/mi", "/", "foo", "/", "mi"], {
                    groups: {
                        prefix: '/',
                        postfix: '/',
                    },
                    index: 0,
                    input: "/",
                }),
            ]);
        },
        'recursive sequence with groups'() {
            const { begin, end, decimal_only: digit, repeat, from } = $mol_regexp;
            const year = repeat(digit, 4, 4);
            const dash = '-';
            const month = repeat(digit, 2, 2);
            const day = repeat(digit, 2, 2);
            const regexp = from([
                begin, { date: [{ year }, dash, { month }] }, dash, { day }, end
            ]);
            const found = [...'2020-01-02'.matchAll(regexp)];
            $mol_assert_like(found[0].groups, {
                date: '2020-01',
                year: '2020',
                month: '01',
                day: '02',
            });
        },
        'parse multiple'() {
            const { decimal_only: digit, from } = $mol_regexp;
            const regexp = from({ digit });
            $mol_assert_like([...'123'.matchAll(regexp)].map(f => f.groups), [
                { digit: '1' },
                { digit: '2' },
                { digit: '3' },
            ]);
        },
        'named variants'() {
            const { begin, or, end, from } = $mol_regexp;
            const sexism = from([
                begin, 'sex = ', { sex: ['male', or, 'female'] }, end
            ]);
            $mol_assert_like([...'sex = male'.matchAll(sexism)][0].groups, { sex: 'male' });
            $mol_assert_like([...'sex = female'.matchAll(sexism)][0].groups, { sex: 'female' });
            $mol_assert_like([...'sex = malefemale'.matchAll(sexism)][0].groups, undefined);
        },
        'force after'() {
            const { latin_only: letter, force_after, from } = $mol_regexp;
            const regexp = from([letter, force_after('.')]);
            $mol_assert_like('x.'.match(regexp), ['x']);
            $mol_assert_like('x,'.match(regexp), null);
        },
        'forbid after'() {
            const { latin_only: letter, forbid_after, from } = $mol_regexp;
            const regexp = from([letter, forbid_after('.')]);
            $mol_assert_like('x.'.match(regexp), null);
            $mol_assert_like('x,'.match(regexp), ['x']);
        },
        'char except'() {
            const { char_except, latin_only, tab } = $mol_regexp;
            const name = char_except(latin_only, tab);
            $mol_assert_like('a'.match(name), null);
            $mol_assert_like('\t'.match(name), null);
            $mol_assert_like('('.match(name), ['(']);
        },
        'unicode only'() {
            const { unicode_only, from } = $mol_regexp;
            const name = from([
                unicode_only('Script', 'Cyrillic'),
                unicode_only('Hex_Digit'),
            ]);
            $mol_assert_like('FF'.match(name), null);
            $mol_assert_like('ФG'.match(name), null);
            $mol_assert_like('ФF'.match(name), ['ФF']);
        },
        'generate by optional with inner group'() {
            const { begin, end, from } = $mol_regexp;
            const animals = from([begin, '#', ['^', { dog: '@' }], end]);
            $mol_assert_equal(animals.generate({}), '#');
            $mol_assert_equal(animals.generate({ dog: false }), '#');
            $mol_assert_equal(animals.generate({ dog: true }), '#^@');
            $mol_assert_fail(() => animals.generate({ dog: '$' }), 'Wrong param: dog=$');
        },
        'generate by optional with inner group with variants'() {
            const { begin, end, from } = $mol_regexp;
            const animals = from([begin, '#', ['^', { animal: { dog: '@', fox: '&' } }], end]);
            $mol_assert_equal(animals.generate({}), '#');
            $mol_assert_equal(animals.generate({ dog: true }), '#^@');
            $mol_assert_equal(animals.generate({ fox: true }), '#^&');
            $mol_assert_fail(() => animals.generate({ dog: '$' }), 'Wrong param: dog=$');
        },
        'complex example'() {
            const { begin, end, char_only, char_range, latin_only, slash_back, repeat_greedy, from, } = $mol_regexp;
            const atom_char = char_only(latin_only, "!#$%&'*+/=?^`{|}~-");
            const atom = repeat_greedy(atom_char, 1);
            const dot_atom = from([atom, repeat_greedy(['.', atom])]);
            const name_letter = char_only(char_range(0x01, 0x08), 0x0b, 0x0c, char_range(0x0e, 0x1f), 0x21, char_range(0x23, 0x5b), char_range(0x5d, 0x7f));
            const quoted_pair = from([
                slash_back,
                char_only(char_range(0x01, 0x09), 0x0b, 0x0c, char_range(0x0e, 0x7f))
            ]);
            const name = repeat_greedy({ name_letter, quoted_pair });
            const quoted_name = from(['"', { name }, '"']);
            const local_part = from({ dot_atom, quoted_name });
            const domain = dot_atom;
            const mail = from([begin, local_part, '@', { domain }, end]);
            $mol_assert_equal('foo..bar@example.org'.match(mail), null);
            $mol_assert_equal('foo..bar"@example.org'.match(mail), null);
            $mol_assert_like([...'foo.bar@example.org'.matchAll(mail)][0].groups, {
                dot_atom: "foo.bar",
                quoted_name: "",
                name: "",
                name_letter: "",
                quoted_pair: "",
                domain: "example.org",
            });
            $mol_assert_like([...'"foo..bar"@example.org'.matchAll(mail)][0].groups, {
                dot_atom: "",
                quoted_name: '"foo..bar"',
                name: "foo..bar",
                name_letter: "r",
                quoted_pair: "",
                domain: "example.org",
            });
            $mol_assert_equal(mail.generate({ dot_atom: 'foo.bar', domain: 'example.org' }), 'foo.bar@example.org');
            $mol_assert_equal(mail.generate({ name: 'foo..bar', domain: 'example.org' }), '"foo..bar"@example.org');
            $mol_assert_fail(() => mail.generate({ dot_atom: 'foo..bar', domain: 'example.org' }), 'Wrong param: dot_atom=foo..bar');
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    function get_parts(str) {
        return $$.$mol_view_tree2_prop_parts($mol_tree2.struct(str));
    }
    $mol_test({
        'wrong order'($) {
            $mol_assert_fail(() => {
                get_parts('some_bla?*');
            }, 'Required prop like some*? at `?#1:1/0`');
        },
        'empty'($) {
            $mol_assert_fail(() => {
                get_parts('');
            }, 'Required prop like some*? at `?#1:1/0`');
        },
        'prop in upper case'($) {
            const parts = get_parts('Close_icon');
            $mol_assert_equal(parts.name, 'Close_icon');
            $mol_assert_equal(parts.key, '');
            $mol_assert_equal(parts.next, '');
        },
        'prop with index'($) {
            const parts = get_parts('some_bla*');
            $mol_assert_equal(parts.name, 'some_bla');
            $mol_assert_equal(parts.key, '*');
            $mol_assert_equal(parts.next, '');
        },
        'prop with index and value'($) {
            const parts = get_parts('some_bla*?');
            $mol_assert_equal(parts.name, 'some_bla');
            $mol_assert_equal(parts.key, '*');
            $mol_assert_equal(parts.next, '?');
        },
        'legacy indexed'($) {
            const parts = get_parts('Some*default');
            $mol_assert_equal(parts.name, 'Some');
            $mol_assert_equal(parts.key, '*default');
            $mol_assert_equal(parts.next, '');
        },
        'legacy indexed value'($) {
            const parts = get_parts('Some*k?v');
            $mol_assert_equal(parts.name, 'Some');
            $mol_assert_equal(parts.key, '*k');
            $mol_assert_equal(parts.next, '?');
        }
    });
})($ || ($ = {}));

;
	($.$mol_hotkey) = class $mol_hotkey extends ($.$mol_plugin) {
		keydown(next){
			if(next !== undefined) return next;
			return null;
		}
		event(){
			return {...(super.event()), "keydown": (next) => (this.keydown(next))};
		}
		key(){
			return {};
		}
		mod_ctrl(){
			return false;
		}
		mod_alt(){
			return false;
		}
		mod_shift(){
			return false;
		}
	};
	($mol_mem(($.$mol_hotkey.prototype), "keydown"));


;
"use strict";
var $;
(function ($) {
    /**
    * Key names code for hotkey
    * @see [mol_hotkey](../../hotkey/hotkey.view.ts)
    */
    let $mol_keyboard_code;
    (function ($mol_keyboard_code) {
        $mol_keyboard_code[$mol_keyboard_code["backspace"] = 8] = "backspace";
        $mol_keyboard_code[$mol_keyboard_code["tab"] = 9] = "tab";
        $mol_keyboard_code[$mol_keyboard_code["enter"] = 13] = "enter";
        $mol_keyboard_code[$mol_keyboard_code["shift"] = 16] = "shift";
        $mol_keyboard_code[$mol_keyboard_code["ctrl"] = 17] = "ctrl";
        $mol_keyboard_code[$mol_keyboard_code["alt"] = 18] = "alt";
        $mol_keyboard_code[$mol_keyboard_code["pause"] = 19] = "pause";
        $mol_keyboard_code[$mol_keyboard_code["capsLock"] = 20] = "capsLock";
        $mol_keyboard_code[$mol_keyboard_code["escape"] = 27] = "escape";
        $mol_keyboard_code[$mol_keyboard_code["space"] = 32] = "space";
        $mol_keyboard_code[$mol_keyboard_code["pageUp"] = 33] = "pageUp";
        $mol_keyboard_code[$mol_keyboard_code["pageDown"] = 34] = "pageDown";
        $mol_keyboard_code[$mol_keyboard_code["end"] = 35] = "end";
        $mol_keyboard_code[$mol_keyboard_code["home"] = 36] = "home";
        $mol_keyboard_code[$mol_keyboard_code["left"] = 37] = "left";
        $mol_keyboard_code[$mol_keyboard_code["up"] = 38] = "up";
        $mol_keyboard_code[$mol_keyboard_code["right"] = 39] = "right";
        $mol_keyboard_code[$mol_keyboard_code["down"] = 40] = "down";
        $mol_keyboard_code[$mol_keyboard_code["insert"] = 45] = "insert";
        $mol_keyboard_code[$mol_keyboard_code["delete"] = 46] = "delete";
        $mol_keyboard_code[$mol_keyboard_code["key0"] = 48] = "key0";
        $mol_keyboard_code[$mol_keyboard_code["key1"] = 49] = "key1";
        $mol_keyboard_code[$mol_keyboard_code["key2"] = 50] = "key2";
        $mol_keyboard_code[$mol_keyboard_code["key3"] = 51] = "key3";
        $mol_keyboard_code[$mol_keyboard_code["key4"] = 52] = "key4";
        $mol_keyboard_code[$mol_keyboard_code["key5"] = 53] = "key5";
        $mol_keyboard_code[$mol_keyboard_code["key6"] = 54] = "key6";
        $mol_keyboard_code[$mol_keyboard_code["key7"] = 55] = "key7";
        $mol_keyboard_code[$mol_keyboard_code["key8"] = 56] = "key8";
        $mol_keyboard_code[$mol_keyboard_code["key9"] = 57] = "key9";
        $mol_keyboard_code[$mol_keyboard_code["A"] = 65] = "A";
        $mol_keyboard_code[$mol_keyboard_code["B"] = 66] = "B";
        $mol_keyboard_code[$mol_keyboard_code["C"] = 67] = "C";
        $mol_keyboard_code[$mol_keyboard_code["D"] = 68] = "D";
        $mol_keyboard_code[$mol_keyboard_code["E"] = 69] = "E";
        $mol_keyboard_code[$mol_keyboard_code["F"] = 70] = "F";
        $mol_keyboard_code[$mol_keyboard_code["G"] = 71] = "G";
        $mol_keyboard_code[$mol_keyboard_code["H"] = 72] = "H";
        $mol_keyboard_code[$mol_keyboard_code["I"] = 73] = "I";
        $mol_keyboard_code[$mol_keyboard_code["J"] = 74] = "J";
        $mol_keyboard_code[$mol_keyboard_code["K"] = 75] = "K";
        $mol_keyboard_code[$mol_keyboard_code["L"] = 76] = "L";
        $mol_keyboard_code[$mol_keyboard_code["M"] = 77] = "M";
        $mol_keyboard_code[$mol_keyboard_code["N"] = 78] = "N";
        $mol_keyboard_code[$mol_keyboard_code["O"] = 79] = "O";
        $mol_keyboard_code[$mol_keyboard_code["P"] = 80] = "P";
        $mol_keyboard_code[$mol_keyboard_code["Q"] = 81] = "Q";
        $mol_keyboard_code[$mol_keyboard_code["R"] = 82] = "R";
        $mol_keyboard_code[$mol_keyboard_code["S"] = 83] = "S";
        $mol_keyboard_code[$mol_keyboard_code["T"] = 84] = "T";
        $mol_keyboard_code[$mol_keyboard_code["U"] = 85] = "U";
        $mol_keyboard_code[$mol_keyboard_code["V"] = 86] = "V";
        $mol_keyboard_code[$mol_keyboard_code["W"] = 87] = "W";
        $mol_keyboard_code[$mol_keyboard_code["X"] = 88] = "X";
        $mol_keyboard_code[$mol_keyboard_code["Y"] = 89] = "Y";
        $mol_keyboard_code[$mol_keyboard_code["Z"] = 90] = "Z";
        $mol_keyboard_code[$mol_keyboard_code["metaLeft"] = 91] = "metaLeft";
        $mol_keyboard_code[$mol_keyboard_code["metaRight"] = 92] = "metaRight";
        $mol_keyboard_code[$mol_keyboard_code["select"] = 93] = "select";
        $mol_keyboard_code[$mol_keyboard_code["numpad0"] = 96] = "numpad0";
        $mol_keyboard_code[$mol_keyboard_code["numpad1"] = 97] = "numpad1";
        $mol_keyboard_code[$mol_keyboard_code["numpad2"] = 98] = "numpad2";
        $mol_keyboard_code[$mol_keyboard_code["numpad3"] = 99] = "numpad3";
        $mol_keyboard_code[$mol_keyboard_code["numpad4"] = 100] = "numpad4";
        $mol_keyboard_code[$mol_keyboard_code["numpad5"] = 101] = "numpad5";
        $mol_keyboard_code[$mol_keyboard_code["numpad6"] = 102] = "numpad6";
        $mol_keyboard_code[$mol_keyboard_code["numpad7"] = 103] = "numpad7";
        $mol_keyboard_code[$mol_keyboard_code["numpad8"] = 104] = "numpad8";
        $mol_keyboard_code[$mol_keyboard_code["numpad9"] = 105] = "numpad9";
        $mol_keyboard_code[$mol_keyboard_code["multiply"] = 106] = "multiply";
        $mol_keyboard_code[$mol_keyboard_code["add"] = 107] = "add";
        $mol_keyboard_code[$mol_keyboard_code["subtract"] = 109] = "subtract";
        $mol_keyboard_code[$mol_keyboard_code["decimal"] = 110] = "decimal";
        $mol_keyboard_code[$mol_keyboard_code["divide"] = 111] = "divide";
        $mol_keyboard_code[$mol_keyboard_code["F1"] = 112] = "F1";
        $mol_keyboard_code[$mol_keyboard_code["F2"] = 113] = "F2";
        $mol_keyboard_code[$mol_keyboard_code["F3"] = 114] = "F3";
        $mol_keyboard_code[$mol_keyboard_code["F4"] = 115] = "F4";
        $mol_keyboard_code[$mol_keyboard_code["F5"] = 116] = "F5";
        $mol_keyboard_code[$mol_keyboard_code["F6"] = 117] = "F6";
        $mol_keyboard_code[$mol_keyboard_code["F7"] = 118] = "F7";
        $mol_keyboard_code[$mol_keyboard_code["F8"] = 119] = "F8";
        $mol_keyboard_code[$mol_keyboard_code["F9"] = 120] = "F9";
        $mol_keyboard_code[$mol_keyboard_code["F10"] = 121] = "F10";
        $mol_keyboard_code[$mol_keyboard_code["F11"] = 122] = "F11";
        $mol_keyboard_code[$mol_keyboard_code["F12"] = 123] = "F12";
        $mol_keyboard_code[$mol_keyboard_code["numLock"] = 144] = "numLock";
        $mol_keyboard_code[$mol_keyboard_code["scrollLock"] = 145] = "scrollLock";
        $mol_keyboard_code[$mol_keyboard_code["semicolon"] = 186] = "semicolon";
        $mol_keyboard_code[$mol_keyboard_code["equals"] = 187] = "equals";
        $mol_keyboard_code[$mol_keyboard_code["comma"] = 188] = "comma";
        $mol_keyboard_code[$mol_keyboard_code["dash"] = 189] = "dash";
        $mol_keyboard_code[$mol_keyboard_code["period"] = 190] = "period";
        $mol_keyboard_code[$mol_keyboard_code["forwardSlash"] = 191] = "forwardSlash";
        $mol_keyboard_code[$mol_keyboard_code["graveAccent"] = 192] = "graveAccent";
        $mol_keyboard_code[$mol_keyboard_code["bracketOpen"] = 219] = "bracketOpen";
        $mol_keyboard_code[$mol_keyboard_code["slashBack"] = 220] = "slashBack";
        $mol_keyboard_code[$mol_keyboard_code["slashBackLeft"] = 226] = "slashBackLeft";
        $mol_keyboard_code[$mol_keyboard_code["bracketClose"] = 221] = "bracketClose";
        $mol_keyboard_code[$mol_keyboard_code["quoteSingle"] = 222] = "quoteSingle";
    })($mol_keyboard_code = $.$mol_keyboard_code || ($.$mol_keyboard_code = {}));
})($ || ($ = {}));

;
"use strict";


;
"use strict";
var $;
(function ($) {
    var $$;
    (function ($$) {
        /**
         * Plugin which adds handlers for keyboard keys.
         * @see [mol_keyboard_code](../keyboard/code/code.ts)
         */
        class $mol_hotkey extends $.$mol_hotkey {
            key() {
                return super.key();
            }
            keydown(event) {
                if (!event)
                    return;
                if (event.defaultPrevented)
                    return;
                let name = $mol_keyboard_code[event.keyCode];
                if (this.mod_ctrl() !== (event.ctrlKey || event.metaKey))
                    return;
                if (this.mod_alt() !== event.altKey)
                    return;
                if (this.mod_shift() !== event.shiftKey)
                    return;
                const handle = this.key()[name];
                if (handle)
                    handle(event);
            }
        }
        $$.$mol_hotkey = $mol_hotkey;
    })($$ = $.$$ || ($.$$ = {}));
})($ || ($ = {}));

;
	($.$mol_string) = class $mol_string extends ($.$mol_view) {
		selection_watcher(){
			return null;
		}
		error_report(){
			return null;
		}
		disabled(){
			return false;
		}
		value(next){
			if(next !== undefined) return next;
			return "";
		}
		value_changed(next){
			return (this.value(next));
		}
		hint(){
			return "";
		}
		hint_visible(){
			return (this.hint());
		}
		spellcheck(){
			return true;
		}
		autocomplete_native(){
			return "";
		}
		selection_end(){
			return 0;
		}
		selection_start(){
			return 0;
		}
		keyboard(){
			return "text";
		}
		enter(){
			return "go";
		}
		length_max(){
			return +Infinity;
		}
		type(next){
			if(next !== undefined) return next;
			return "text";
		}
		event_change(next){
			if(next !== undefined) return next;
			return null;
		}
		submit_with_ctrl(){
			return false;
		}
		submit(next){
			if(next !== undefined) return next;
			return null;
		}
		Submit(){
			const obj = new this.$.$mol_hotkey();
			(obj.mod_ctrl) = () => ((this.submit_with_ctrl()));
			(obj.key) = () => ({"enter": (next) => (this.submit(next))});
			return obj;
		}
		dom_name(){
			return "input";
		}
		enabled(){
			return true;
		}
		minimal_height(){
			return 40;
		}
		autocomplete(){
			return false;
		}
		selection(next){
			if(next !== undefined) return next;
			return [0, 0];
		}
		auto(){
			return [(this.selection_watcher()), (this.error_report())];
		}
		field(){
			return {
				...(super.field()), 
				"disabled": (this.disabled()), 
				"value": (this.value_changed()), 
				"placeholder": (this.hint_visible()), 
				"spellcheck": (this.spellcheck()), 
				"autocomplete": (this.autocomplete_native()), 
				"selectionEnd": (this.selection_end()), 
				"selectionStart": (this.selection_start()), 
				"inputMode": (this.keyboard()), 
				"enterkeyhint": (this.enter())
			};
		}
		attr(){
			return {
				...(super.attr()), 
				"maxlength": (this.length_max()), 
				"type": (this.type())
			};
		}
		event(){
			return {...(super.event()), "input": (next) => (this.event_change(next))};
		}
		plugins(){
			return [(this.Submit())];
		}
	};
	($mol_mem(($.$mol_string.prototype), "value"));
	($mol_mem(($.$mol_string.prototype), "type"));
	($mol_mem(($.$mol_string.prototype), "event_change"));
	($mol_mem(($.$mol_string.prototype), "submit"));
	($mol_mem(($.$mol_string.prototype), "Submit"));
	($mol_mem(($.$mol_string.prototype), "selection"));


;
"use strict";
var $;
(function ($) {
    /**
     * Z-index values for layers
     * https://page.hyoo.ru/#!=xthcpx_wqmiba
     */
    $.$mol_layer = $mol_style_prop('mol_layer', [
        'hover',
        'focus',
        'speck',
        'float',
        'popup',
    ]);
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    $mol_style_attach("mol/layer/layer.css", ":root {\n\t--mol_layer_hover: 1;\n\t--mol_layer_focus: 2;\n\t--mol_layer_speck: 3;\n\t--mol_layer_float: 4;\n\t--mol_layer_popup: 5;\n}\n");
})($ || ($ = {}));

;
"use strict";

;
"use strict";


;
"use strict";
var $;
(function ($) {
    var $$;
    (function ($$) {
        /**
         * An input field for entering single line text.
         * @see https://mol.hyoo.ru/#!section=demos/demo=mol_string_demo
         */
        class $mol_string extends $.$mol_string {
            event_change(next) {
                if (!next)
                    return;
                const el = this.dom_node();
                const from = el.selectionStart;
                const to = el.selectionEnd;
                el.value = this.value_changed(el.value);
                if (to === null)
                    return;
                el.selectionEnd = to;
                el.selectionStart = from;
                this.selection_change(next);
            }
            value_changed(next) {
                const el = this.dom_node();
                try {
                    el.setCustomValidity('');
                    return this.value(next);
                }
                catch (error) {
                    $mol_fail_log(error);
                    if (error instanceof Error) {
                        el.setCustomValidity(error.message);
                        el.reportValidity();
                    }
                    return next ?? $mol_mem_cached(() => this.value_changed()) ?? '';
                }
            }
            error_report() {
                try {
                    if (this.focused())
                        this.value();
                }
                catch (error) {
                    const el = this.dom_node();
                    if (error instanceof Error) {
                        el.setCustomValidity(error.message);
                        el.reportValidity();
                    }
                }
            }
            hint_visible() {
                return (this.enabled() ? this.hint() : '') || ' ';
            }
            disabled() {
                return !this.enabled();
            }
            autocomplete_native() {
                return this.autocomplete() ? 'on' : 'off';
            }
            selection_watcher() {
                return new $mol_dom_listener(this.$.$mol_dom_context.document, 'selectionchange', $mol_wire_async(event => this.selection_change(event)));
            }
            selection_change(event) {
                const el = this.dom_node();
                if (el !== this.$.$mol_dom_context.document.activeElement)
                    return;
                const [from, to] = this.selection([
                    el.selectionStart,
                    el.selectionEnd,
                ]);
                el.selectionEnd = to;
                el.selectionStart = from;
                if (to !== from && el.selectionEnd === el.selectionStart) {
                    el.selectionEnd = to;
                }
            }
            selection_start() {
                const el = this.dom_node();
                if (!this.focused())
                    return undefined;
                if (el.selectionStart == null)
                    return undefined;
                return this.selection()[0];
            }
            selection_end() {
                const el = this.dom_node();
                if (!this.focused())
                    return undefined;
                if (el.selectionEnd == null)
                    return undefined;
                return this.selection()[1];
            }
        }
        __decorate([
            $mol_action
        ], $mol_string.prototype, "event_change", null);
        __decorate([
            $mol_mem
        ], $mol_string.prototype, "value_changed", null);
        __decorate([
            $mol_mem
        ], $mol_string.prototype, "error_report", null);
        __decorate([
            $mol_mem
        ], $mol_string.prototype, "selection_watcher", null);
        $$.$mol_string = $mol_string;
    })($$ = $.$$ || ($.$$ = {}));
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    $mol_style_attach("mol/string/string.view.css", "[mol_string] {\n\tbox-sizing: border-box;\n\toutline-offset: 0;\n\tborder: none;\n\tborder-radius: var(--mol_gap_round);\n\twhite-space: pre-line;\n\toverflow: hidden;\n\ttext-overflow: ellipsis;\n\tpadding: var(--mol_gap_text);\n\ttext-align: start;\n\tposition: relative;\n\tfont: inherit;\n\tflex: 1 1 auto;\n\tbackground: transparent;\n\tmin-width: 0;\n\tcolor: inherit;\n\tbackground: var(--mol_theme_field);\n}\n\n[mol_string]:disabled:not(:placeholder-shown) {\n\tbackground-color: transparent;\n\tcolor: var(--mol_theme_text);\n}\n\n[mol_string]:where(:not(:disabled)) {\n\tbox-shadow: inset 0 0 0 1px var(--mol_theme_line);\n}\n\n[mol_string]:where(:not(:disabled)):hover {\n\tbox-shadow: inset 0 0 0 2px var(--mol_theme_line);\n\tz-index: var(--mol_layer_hover);\n}\n\n[mol_string]:focus {\n\toutline: none;\n\tz-index: var(--mol_layer_focus);\n\tcolor: var(--mol_theme_text);\n\tbox-shadow: inset 0 0 0 1px var(--mol_theme_focus);\n}\n\n[mol_string]::placeholder {\n\tcolor: var(--mol_theme_shade);\n}\n\n[mol_string]::-ms-clear {\n\tdisplay: none;\n}\n");
})($ || ($ = {}));

;
	($.$mol_paragraph) = class $mol_paragraph extends ($.$mol_view) {
		line_height(){
			return 24;
		}
		letter_width(){
			return 7;
		}
		width_limit(){
			return +Infinity;
		}
		row_width(){
			return 0;
		}
		sub(){
			return [(this.title())];
		}
	};


;
"use strict";


;
"use strict";
var $;
(function ($) {
    var $$;
    (function ($$) {
        class $mol_paragraph extends $.$mol_paragraph {
            maximal_width() {
                let width = 0;
                const letter = this.letter_width();
                for (const kid of this.sub()) {
                    if (!kid)
                        continue;
                    if (kid instanceof $mol_view) {
                        width += kid.maximal_width();
                    }
                    else if (typeof kid !== 'object') {
                        width += String(kid).length * letter;
                    }
                }
                return width;
            }
            width_limit() {
                return this.$.$mol_window.size().width;
            }
            minimal_width() {
                return this.letter_width();
            }
            row_width() {
                return Math.max(Math.min(this.width_limit(), this.maximal_width()), this.letter_width());
            }
            minimal_height() {
                return Math.max(1, Math.ceil(this.maximal_width() / this.row_width())) * this.line_height();
            }
        }
        __decorate([
            $mol_mem
        ], $mol_paragraph.prototype, "maximal_width", null);
        __decorate([
            $mol_mem
        ], $mol_paragraph.prototype, "row_width", null);
        __decorate([
            $mol_mem
        ], $mol_paragraph.prototype, "minimal_height", null);
        $$.$mol_paragraph = $mol_paragraph;
    })($$ = $.$$ || ($.$$ = {}));
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    $mol_style_attach("mol/paragraph/paragraph.view.css", ":where([mol_paragraph]) {\n\tmargin: 0;\n\tmax-width: 100%;\n}\n");
})($ || ($ = {}));

;
	($.$mol_dimmer) = class $mol_dimmer extends ($.$mol_paragraph) {
		parts(){
			return [];
		}
		string(id){
			return "";
		}
		haystack(){
			return "";
		}
		needle(){
			return "";
		}
		sub(){
			return (this.parts());
		}
		Low(id){
			const obj = new this.$.$mol_paragraph();
			(obj.sub) = () => ([(this.string(id))]);
			return obj;
		}
		High(id){
			const obj = new this.$.$mol_paragraph();
			(obj.sub) = () => ([(this.string(id))]);
			return obj;
		}
	};
	($mol_mem_key(($.$mol_dimmer.prototype), "Low"));
	($mol_mem_key(($.$mol_dimmer.prototype), "High"));


;
"use strict";
var $;
(function ($) {
    var $$;
    (function ($$) {
        $mol_test({
            'Empty needle'() {
                const app = new $mol_dimmer;
                app.needle = () => '  ';
                app.haystack = () => 'foo  bar';
                $mol_assert_like(app.strings(), ['foo  bar']);
            },
            'Empty haystack'() {
                const app = new $mol_dimmer;
                app.needle = () => 'foo  bar';
                app.haystack = () => '';
                $mol_assert_like(app.strings(), ['']);
            },
            'Not found'() {
                const app = new $mol_dimmer;
                app.needle = () => 'foo';
                app.haystack = () => ' bar ';
                $mol_assert_like(app.strings(), [' bar ']);
            },
            'One found'() {
                const app = new $mol_dimmer;
                app.needle = () => 'foo';
                app.haystack = () => ' barfoo ';
                $mol_assert_like(app.strings(), [' bar', 'foo', ' ']);
            },
            'Multiple found'() {
                const app = new $mol_dimmer;
                app.needle = () => 'foo';
                app.haystack = () => ' foobarfoo foo';
                $mol_assert_like(app.strings(), [' ', 'foo', 'bar', 'foo', ' ', 'foo']);
            },
            'Fuzzy search'() {
                const app = new $mol_dimmer;
                app.needle = () => 'foo bar';
                app.haystack = () => ' barfoo ';
                $mol_assert_like(app.strings(), [' ', 'bar', '', 'foo', ' ']);
            },
        });
    })($$ = $.$$ || ($.$$ = {}));
})($ || ($ = {}));

;
"use strict";


;
"use strict";
var $;
(function ($) {
    var $$;
    (function ($$) {
        /**
         * Output text with dimmed mismatched substrings.
         * @see https://mol.hyoo.ru/#!section=demos/demo=mol_dimmer_demo
         */
        class $mol_dimmer extends $.$mol_dimmer {
            parts() {
                const needle = this.needle();
                if (needle.length < 2)
                    return [this.haystack()];
                let chunks = [];
                let strings = this.strings();
                for (let index = 0; index < strings.length; index++) {
                    if (strings[index] === '')
                        continue;
                    chunks.push((index % 2) ? this.High(index) : this.Low(index));
                }
                return chunks;
            }
            strings() {
                const options = this.needle().split(/\s+/g).filter(Boolean);
                if (!options.length)
                    return [this.haystack()];
                const variants = { ...options };
                const regexp = $mol_regexp.from({ needle: variants }, { ignoreCase: true });
                return this.haystack().split(regexp);
            }
            string(index) {
                return this.strings()[index];
            }
            *view_find(check, path = []) {
                if (check(this, this.haystack())) {
                    yield [...path, this];
                }
            }
        }
        __decorate([
            $mol_mem
        ], $mol_dimmer.prototype, "strings", null);
        $$.$mol_dimmer = $mol_dimmer;
    })($$ = $.$$ || ($.$$ = {}));
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    $mol_style_attach("mol/dimmer/dimmer.view.css", "[mol_dimmer] {\n\tdisplay: block;\n\tmax-width: 100%;\n}\n\n[mol_dimmer_low] {\n\tdisplay: inline;\n\topacity: 0.8;\n}\n\n[mol_dimmer_high] {\n\tdisplay: inline;\n\tcolor: var(--mol_theme_focus);\n\ttext-shadow: 0 0;\n}\n");
})($ || ($ = {}));

;
	($.$mol_speck) = class $mol_speck extends ($.$mol_view) {
		value(){
			return null;
		}
		theme(){
			return "$mol_theme_accent";
		}
		sub(){
			return [(this.value())];
		}
	};


;
"use strict";
var $;
(function ($) {
    $mol_style_attach("mol/speck/speck.view.css", "[mol_speck] {\n\tfont-size: .75rem;\n\tborder-radius: 1rem;\n\tmargin: -0.5rem -0.2rem;\n\talign-self: flex-start;\n\tmin-height: 1em;\n\tmin-width: .75rem;\n\tvertical-align: sub;\n\tpadding: 0 .2rem;\n\tposition: absolute;\n\tz-index: var(--mol_layer_speck);\n\ttext-align: center;\n\tline-height: .9;\n\tdisplay: inline-block;\n\twhite-space: nowrap;\n\ttext-overflow: ellipsis;\n\tuser-select: none;\n\tbox-shadow: 0 0 3px rgba(0,0,0,.5);\n}\n");
})($ || ($ = {}));

;
"use strict";


;
	($.$mol_button) = class $mol_button extends ($.$mol_view) {
		event_activate(next){
			if(next !== undefined) return next;
			return null;
		}
		activate(next){
			return (this.event_activate(next));
		}
		clicks(next){
			if(next !== undefined) return next;
			return null;
		}
		event_key_press(next){
			if(next !== undefined) return next;
			return null;
		}
		key_press(next){
			return (this.event_key_press(next));
		}
		disabled(){
			return false;
		}
		tab_index(){
			return 0;
		}
		hint(){
			return "";
		}
		hint_safe(){
			return (this.hint());
		}
		error(){
			return "";
		}
		enabled(){
			return true;
		}
		click(next){
			if(next !== undefined) return next;
			return null;
		}
		event_click(next){
			if(next !== undefined) return next;
			return null;
		}
		status(next){
			if(next !== undefined) return next;
			return [];
		}
		event(){
			return {
				...(super.event()), 
				"click": (next) => (this.activate(next)), 
				"dblclick": (next) => (this.clicks(next)), 
				"keydown": (next) => (this.key_press(next))
			};
		}
		attr(){
			return {
				...(super.attr()), 
				"disabled": (this.disabled()), 
				"role": "button", 
				"tabindex": (this.tab_index()), 
				"title": (this.hint_safe())
			};
		}
		sub(){
			return [(this.title())];
		}
		Speck(){
			const obj = new this.$.$mol_speck();
			(obj.value) = () => ((this.error()));
			return obj;
		}
	};
	($mol_mem(($.$mol_button.prototype), "event_activate"));
	($mol_mem(($.$mol_button.prototype), "clicks"));
	($mol_mem(($.$mol_button.prototype), "event_key_press"));
	($mol_mem(($.$mol_button.prototype), "click"));
	($mol_mem(($.$mol_button.prototype), "event_click"));
	($mol_mem(($.$mol_button.prototype), "status"));
	($mol_mem(($.$mol_button.prototype), "Speck"));


;
"use strict";
var $;
(function ($_1) {
    var $$;
    (function ($$) {
        $mol_test({
            'handle clicks by default'($) {
                let clicked = false;
                const clicker = $mol_button.make({
                    $,
                    click: (event) => { clicked = true; },
                });
                const element = clicker.dom_tree();
                const event = $mol_dom_context.document.createEvent('mouseevent');
                event.initEvent('click', true, true);
                element.dispatchEvent(event);
                $mol_assert_ok(clicked);
            },
            'no handle clicks if disabled'($) {
                let clicked = false;
                const clicker = $mol_button.make({
                    $,
                    click: (event) => { clicked = true; },
                    enabled: () => false,
                });
                const element = clicker.dom_tree();
                const event = $mol_dom_context.document.createEvent('mouseevent');
                event.initEvent('click', true, true);
                element.dispatchEvent(event);
                $mol_assert_not(clicked);
            },
            async 'Store error'($) {
                const clicker = $mol_button.make({
                    $,
                    click: (event) => $.$mol_fail(new Error('Test error')),
                });
                const event = $mol_dom_context.document.createEvent('mouseevent');
                $mol_assert_fail(() => clicker.event_activate(event), 'Test error');
                await Promise.resolve();
                $mol_assert_equal(clicker.status()[0].message, 'Test error');
            },
        });
    })($$ = $_1.$$ || ($_1.$$ = {}));
})($ || ($ = {}));

;
"use strict";


;
"use strict";
var $;
(function ($) {
    var $$;
    (function ($$) {
        /**
         * Simple button.
         * @see https://mol.hyoo.ru/#!section=demos/demo=mol_button_demo
         */
        class $mol_button extends $.$mol_button {
            disabled() {
                return !this.enabled();
            }
            event_activate(next) {
                if (!next)
                    return;
                if (!this.enabled())
                    return;
                try {
                    this.event_click(next);
                    this.click(next);
                    this.status([null]);
                }
                catch (error) {
                    // Calling actions from catch section, if throwing promise breaks idempotency
                    Promise.resolve().then(() => this.status([error]));
                    $mol_fail_hidden(error);
                }
            }
            event_key_press(event) {
                if (event.keyCode === $mol_keyboard_code.enter) {
                    return this.activate(event);
                }
            }
            tab_index() {
                return this.enabled() ? super.tab_index() : -1;
            }
            error() {
                const error = this.status()?.[0];
                if (!error)
                    return '';
                if ($mol_promise_like(error)) {
                    return $mol_fail_hidden(error);
                }
                return this.$.$mol_error_message(error);
            }
            hint_safe() {
                try {
                    return this.hint();
                }
                catch (error) {
                    $mol_fail_log(error);
                    return '';
                }
            }
            sub_visible() {
                return [
                    ...this.error() ? [this.Speck()] : [],
                    ...this.sub(),
                ];
            }
        }
        $$.$mol_button = $mol_button;
    })($$ = $.$$ || ($.$$ = {}));
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    $mol_style_attach("mol/button/button.view.css", "[mol_button] {\n\tborder: none;\n\tfont: inherit;\n\tdisplay: inline-flex;\n\tflex-shrink: 0;\n\ttext-decoration: inherit;\n\tcursor: inherit;\n\tposition: relative;\n\tbox-sizing: border-box;\n\tword-break: normal;\n\tcursor: default;\n\tuser-select: none;\n\t-webkit-user-select: none;\n\tborder-radius: var(--mol_gap_round);\n\tbackground: transparent;\n\tcolor: inherit;\n}\n\n[mol_button]:where(:not(:disabled)):hover {\n\tz-index: var(--mol_layer_hover);\n}\n\n[mol_button]:focus {\n\toutline: none;\n\tz-index: var(--mol_layer_focus);\n}\n");
})($ || ($ = {}));

;
	($.$mol_button_typed) = class $mol_button_typed extends ($.$mol_button) {
		minimal_height(){
			return 40;
		}
		minimal_width(){
			return 40;
		}
	};


;
"use strict";
var $;
(function ($) {
    $mol_style_attach("mol/button/typed/typed.view.css", "[mol_button_typed] {\n\talign-content: center;\n\talign-items: center;\n\tpadding: var(--mol_gap_text);\n\tborder-radius: var(--mol_gap_round);\n\tgap: var(--mol_gap_space);\n\tuser-select: none;\n\tcursor: pointer;\n\tmin-width: 2.5rem;\n\tmin-height: 2.5rem;\n}\n\n[mol_button_typed][disabled] {\n\tpointer-events: none;\n}\n\n[mol_button_typed]:hover ,\n[mol_button_typed]:focus-visible {\n\tbox-shadow: inset 0 0 0 100vmax var(--mol_theme_hover);\n}\n\n[mol_button_typed]:active {\n\tcolor: var(--mol_theme_focus);\n}\n");
})($ || ($ = {}));

;
"use strict";


;
	($.$mol_button_minor) = class $mol_button_minor extends ($.$mol_button_typed) {};


;
"use strict";
var $;
(function ($) {
    $mol_style_attach("mol/button/minor/minor.view.css", "[mol_button_minor]:where(:not([disabled])) {\n\tcolor: var(--mol_theme_control);\n}\n");
})($ || ($ = {}));

;
"use strict";


;
"use strict";
var $;
(function ($_1) {
    var $$;
    (function ($$) {
        const d = '$';
        const file_name = '/mol/view/tree2/class/props.test.ts';
        function normalize($, src, dest) {
            const mod = $.$mol_tree2_from_string(src, file_name);
            const input = $.$mol_view_tree2_class_props(mod.kids[0]).join('');
            const output = dest ? $$.$mol_tree2_from_string(dest, 'reference').toString() : '';
            return { input, output };
        }
        $mol_test({
            'dupes merge'($) {
                const src = `
				${d}my_test ${d}my_super
					query? \\
					Query $mol_string
						value? <=> query? \\
					Suggest_label ${d}mol_dimmer
						needle <= query? \\
						key * escape? <=> clear? null
					Clear ${d}mol_button_minor
						click? <=> clear? null
			`;
                const dest = `
				query? \\
				clear? null
				Query $mol_string value? <=> query?
				Suggest_label $mol_dimmer
					needle <= query?
					key * escape? <=> clear?
				Clear $mol_button_minor click? <=> clear?
			`;
                const res = normalize($, src, dest);
                $mol_assert_equal(res.input, res.output);
            },
            'left and bidi common'($) {
                const src = `
				${d}my_test ${d}my_super
					title @ \\title
					sub2 /
						<= Close_icon ${d}mol_icon_cross
					sub /
						<= Title ${d}mol_view
							sub /
								<= title
						<= Close ${d}mol_button
							title \\close
							click? <=> close? null
			`;
                const dest = `
				Close_icon ${d}mol_icon_cross
				Title ${d}mol_view sub / <= title
				close? null
				Close ${d}mol_button
					title \\close
					click? <=> close?
				title @ \\title
				sub2 / <= Close_icon
				sub /
					<= Title
					<= Close
			`;
                const res = normalize($, src, dest);
                $mol_assert_equal(res.input, res.output);
            },
            'right bind levels'($) {
                const src = `
				${d}my_test ${d}my_super
					Dog ${d}mol_view_tree2_class_test_dog
						Mouth => Dog_mouth
							animation => dog_animation
					plugins /
						<= Human* ${d}mol_view_tree2_class_test_human
							Mouth => Human_mouth
								animation => human_animation
									text => human_text
			`;
                const dest = `
				Dog_mouth = Dog Mouth
				dog_animation = Dog_mouth animation
				Human_mouth = Human* Mouth
				human_animation = Human_mouth animation
				human_text = human_animation text
				Human* $mol_view_tree2_class_test_human Mouth => Human_mouth animation => human_animation text => human_text
				Dog $mol_view_tree2_class_test_dog Mouth => Dog_mouth animation => dog_animation
				plugins / <= Human*
			`;
                const res = normalize($, src, dest);
                $mol_assert_equal(res.input, res.output);
            },
            'good right bind dupes'($) {
                const src = `
				${d}my_test ${d}my_super
					Suggest_label ${d}mol_dimmer
						clear? => clear?
					Clear ${d}mol_button_minor
						click?e <=> clear?e
			`;
                const dest = `
				clear? = Suggest_label clear?
				Suggest_label $mol_dimmer clear? => clear?
				Clear $mol_button_minor click? <=> clear?
			`;
                const res = normalize($, src, dest);
                $mol_assert_equal(res.input, res.output);
            },
            'conflicting right bind dupes'($) {
                const src = `
				${d}my_test ${d}my_super
					Suggest_label ${d}mol_dimmer
						clear => clear
					Clear ${d}mol_button_minor
						click? <=> clear? null
			`;
                $mol_assert_fail(() => normalize($, src).input, `Need an equal default values at \`/mol/view/tree2/class/props.test.ts#4:16/5\` vs \`/mol/view/tree2/class/props.test.ts#6:18/6\`
<=>
/mol/view/tree2/class/props.test.ts#6:14/3
click?
/mol/view/tree2/class/props.test.ts#6:7/6
$mol_button_minor
/mol/view/tree2/class/props.test.ts#5:12/17
Clear
/mol/view/tree2/class/props.test.ts#5:6/5`);
            },
        });
    })($$ = $_1.$$ || ($_1.$$ = {}));
})($ || ($ = {}));

;
"use strict";

;
"use strict";

;
"use strict";

;
"use strict";

;
"use strict";
var $;
(function ($) {
    function $mol_data_setup(value, config) {
        return Object.assign(value, {
            config,
            Value: null
        });
    }
    $.$mol_data_setup = $mol_data_setup;
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    $mol_test({
        'config by value'() {
            const N = $mol_data_setup((a) => a, 5);
            $mol_assert_equal(N.config, 5);
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    function $mol_func_is_class(func) {
        return Object.getOwnPropertyDescriptor(func, 'prototype')?.writable === false;
    }
    $.$mol_func_is_class = $mol_func_is_class;
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    $mol_test({
        'function'() {
            $mol_assert_not($mol_func_is_class(function () { }));
        },
        'generator'() {
            $mol_assert_not($mol_func_is_class(function* () { }));
        },
        'async'() {
            $mol_assert_not($mol_func_is_class(async function () { }));
        },
        'arrow'() {
            $mol_assert_not($mol_func_is_class(() => null));
        },
        'named class'() {
            $mol_assert_ok($mol_func_is_class(class Foo {
            }));
        },
        'unnamed class'() {
            $mol_assert_ok($mol_func_is_class(class {
            }));
        },
    });
})($ || ($ = {}));

;
"use strict";

;
"use strict";

;
"use strict";
var $;
(function ($) {
    /**
     * Combines list of unary functions/classes to one function.
     *
     * 	const reparse = $mol_data_pipe( JSON.stringify , JSON.parse )
     **/
    function $mol_data_pipe(...funcs) {
        return $mol_data_setup(function (input) {
            let value = input;
            for (const func of funcs)
                value = $mol_func_is_class(func) ? new func(value) : func.call(this, value);
            return value;
        }, { funcs });
    }
    $.$mol_data_pipe = $mol_data_pipe;
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    $mol_test({
        // @todo enable on strict
        // 'no functions'() {
        // 	const stringify = $mol_data_pipe()
        // 	type Type = $mol_type_assert<
        // 		typeof stringify,
        // 		( input : never )=> never
        // 	>
        // },
        'single function'() {
            const stringify = $mol_data_pipe((input) => input.toString());
            $mol_assert_equal(stringify(5), '5');
        },
        'two functions'() {
            const isLong = $mol_data_pipe((input) => input.toString(), (input) => input.length > 2);
            $mol_assert_equal(isLong(5.0), false);
            $mol_assert_equal(isLong(5.1), true);
        },
        'three functions'() {
            const pattern = $mol_data_pipe((input) => input.toString(), (input) => new RegExp(input), (input) => input.toString());
            $mol_assert_equal(pattern(5), '/5/');
        },
        'classes'() {
            class Box {
                value;
                constructor(value) {
                    this.value = value;
                }
            }
            const boxify = $mol_data_pipe((input) => input.toString(), Box);
            $mol_assert_ok(boxify(5) instanceof Box);
            $mol_assert_like(boxify(5).value, '5');
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    const convert = $mol_data_pipe($mol_tree2_from_string, $mol_tree2_js_to_text, $mol_tree2_text_to_string);
    $mol_test({
        'boolean'() {
            $mol_assert_equal(convert(`
					true
				`), 'true\n');
        },
        'number'() {
            $mol_assert_equal(convert(`
					1.2
				`), '1.2\n');
            $mol_assert_equal(convert(`
					1e+2
				`), '1e+2\n');
            $mol_assert_equal(convert(`
					-Infinity
				`), '-Infinity\n');
            $mol_assert_equal(convert(`
					NaN
				`), 'NaN\n');
        },
        'variable'() {
            $mol_assert_equal(convert(`
					a
				`), 'a\n');
            $mol_assert_equal(convert(`
					$
				`), '$\n');
            $mol_assert_equal(convert(`
					a0
				`), 'a0\n');
        },
        'string'() {
            $mol_assert_equal(convert(`
					\\
						\\foo
						\\bar
				`), '"foo\\nbar"\n');
            $mol_assert_equal(convert(`
					\`\`
						\\foo
						bar
				`), '`foo${bar}`\n');
        },
        'wrong name'() {
            $mol_assert_fail(() => convert(`
					foo+bar
				`), 'Wrong node type\nfoo+bar\n?#2:6/7');
        },
        'array'() {
            $mol_assert_equal(convert(`
					[,]
				`), '[]\n');
            $mol_assert_equal(convert(`
					[,]
						1
						2
				`), '[1, 2]\n');
        },
        'last'() {
            $mol_assert_equal(convert(`
					(,)
						1
						2
				`), '(1, 2)\n');
        },
        'scope'() {
            $mol_assert_equal(convert(`
					{;}
						1
						2
				`), '{\n\t1;\n\t2;\n}\n');
        },
        'object'() {
            $mol_assert_equal(convert(`
					{,}
				`), '{}\n');
            $mol_assert_equal(convert(`
					{,}
						foo
						bar
				`), '{foo, bar}\n');
            $mol_assert_equal(convert(`
					{,}
						:
							\\foo
							1
						:
							bar
							2
				`), '{"foo": 1, [bar]: 2}\n');
        },
        'regexp'() {
            $mol_assert_equal(convert(`
					/./
						.source \\foo\\n
						.multiline
						.ignoreCase
						.global
				`), '/foo\\\\n/mig\n');
        },
        'unary'() {
            $mol_assert_equal(convert(`
					void yield* yield await ~ ! - + 1
				`), 'void yield* yield await ~!-+1\n');
        },
        'binary'() {
            $mol_assert_equal(convert(`
					(+)
						1
						2
						3
				`), '(\n\t1 + \n\t2 + \n\t3\n)\n');
            $mol_assert_equal(convert(`
					@++ foo
				`), 'foo++\n');
        },
        'chain'() {
            $mol_assert_equal(convert(`
					()
						foo
						[] \\bar
						[] 1
				`), '(foo.bar[1])\n');
            $mol_assert_equal(convert(`
					()
						foo
						[] 1
						(,)
				`), '(foo[1]())\n');
            $mol_assert_equal(convert(`
					()
						[,] 0
						[] 1
						(,)
							2
							3
				`), '([0][1](2, 3))\n');
        },
        'function'() {
            $mol_assert_equal(convert(`
					=>
						(,)
						1
				`), '() => 1\n');
            $mol_assert_equal(convert(`
					async=>
						(,)
						1
				`), 'async () => 1\n');
            $mol_assert_equal(convert(`
					function
						foo
						(,)
						{;}
				`), 'function foo(){}\n');
            $mol_assert_equal(convert(`
					function
						(,) foo
						{;} debugger
				`), 'function (foo){\n\tdebugger;\n}\n');
            $mol_assert_equal(convert(`
					function*
						(,)
						{;}
				`), 'function* (){}\n');
            $mol_assert_equal(convert(`
					async
						(,)
						{;}
				`), 'async function (){}\n');
            $mol_assert_equal(convert(`
					async*
						(,) foo
						{;} debugger
				`), 'async function* (foo){\n\tdebugger;\n}\n');
        },
        'class'() {
            $mol_assert_equal(convert(`
					class
						Foo
						{}
				`), 'class Foo {}\n');
            $mol_assert_equal(convert(`
					class
						Foo
						extends Bar
						{}
				`), 'class Foo extends Bar {}\n');
            $mol_assert_equal(convert(`
					class {}
						.
							\\foo
							(,)
							{;}
				`), 'class {\n\tfoo(){}\n}\n');
            $mol_assert_equal(convert(`
					class {}
						static
							\\foo
							(,)
							{;}
				`), 'class {\n\tstatic ["foo"](){}\n}\n');
            $mol_assert_equal(convert(`
					class {}
						get
							\\foo
							(,)
							{;}
				`), 'class {\n\tget ["foo"](){}\n}\n');
            $mol_assert_equal(convert(`
					class {}
						set
							\\foo
							(,) bar
							{;}
				`), 'class {\n\tset ["foo"](bar){}\n}\n');
        },
        'if'() {
            $mol_assert_equal(convert(`
					?:
						1
						2
						3
				`), '1 ? 2 : 3\n');
            $mol_assert_equal(convert(`
					if
						() 1
						{;} 2
				`), 'if(1) {\n\t2;\n}\n');
            $mol_assert_equal(convert(`
					if
						() 1
						{;} 2
						{;} 3
				`), 'if(1) {\n\t2;\n}else{\n\t3;\n}\n');
        },
        'assign'() {
            $mol_assert_equal(convert(`
					=
						foo
						bar
				`), 'foo = bar\n');
            $mol_assert_equal(convert(`
					=
						[,]
							foo
							bar
						[,]
							1
							2
				`), '[foo, bar] = [1, 2]\n');
            $mol_assert_equal(convert(`
					let foo
				`), 'let foo\n');
            $mol_assert_equal(convert(`
					let
						foo
						bar
				`), 'let foo = bar\n');
            $mol_assert_equal(convert(`
					+=
						foo
						bar
				`), 'foo += bar\n');
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    class TestClass extends Uint8Array {
    }
    $mol_test({
        'Uint8Array vs itself'() {
            $mol_assert_ok($mol_compare_array(new Uint8Array, new Uint8Array));
            $mol_assert_ok($mol_compare_array(new Uint8Array([0]), new Uint8Array([0])));
            $mol_assert_not($mol_compare_array(new Uint8Array([0]), new Uint8Array([1])));
        },
        'Uint8Array vs subclassed array'() {
            $mol_assert_not($mol_compare_array(new Uint8Array, new TestClass));
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    $mol_test({
        'decode utf8 string'() {
            const str = 'Hello, ΧΨΩЫ';
            const encoded = new Uint8Array([72, 101, 108, 108, 111, 44, 32, 206, 167, 206, 168, 206, 169, 208, 171]);
            $mol_assert_equal($mol_charset_decode(encoded), str);
            $mol_assert_equal($mol_charset_decode(encoded, 'utf8'), str);
        },
        'decode empty string'() {
            const encoded = new Uint8Array([]);
            $mol_assert_equal($mol_charset_decode(encoded), '');
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    $mol_test({
        'encode empty'() {
            $mol_assert_equal($mol_charset_encode(''), new Uint8Array([]));
        },
        'encode 1 octet'() {
            $mol_assert_equal($mol_charset_encode('F'), new Uint8Array([0x46]));
        },
        'encode 2 octet'() {
            $mol_assert_equal($mol_charset_encode('Б'), new Uint8Array([0xd0, 0x91]));
        },
        'encode 3 octet'() {
            $mol_assert_equal($mol_charset_encode('ह'), new Uint8Array([0xe0, 0xa4, 0xb9]));
        },
        'encode 4 octet'() {
            $mol_assert_equal($mol_charset_encode('𐍈'), new Uint8Array([0xf0, 0x90, 0x8d, 0x88]));
        },
        'encode surrogate pair'() {
            $mol_assert_equal($mol_charset_encode('😀'), new Uint8Array([0xf0, 0x9f, 0x98, 0x80]));
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    $mol_test({
        'local get set delete'() {
            var key = '$mol_state_local_test:' + Math.random();
            $mol_assert_equal($mol_state_local.value(key), null);
            $mol_state_local.value(key, 123);
            $mol_assert_equal($mol_state_local.value(key), 123);
            $mol_state_local.value(key, null);
            $mol_assert_equal($mol_state_local.value(key), null);
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    $mol_test_mocks.push(context => {
        class $mol_state_local_mock extends $mol_state_local {
            static state = {};
            static value(key, next = this.state[key]) {
                return this.state[key] = (next || null);
            }
        }
        __decorate([
            $mol_mem_key
        ], $mol_state_local_mock, "value", null);
        context.$mol_state_local = $mol_state_local_mock;
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    $mol_test_mocks.push($ => {
        class $mol_locale_mock extends $mol_locale {
            lang(next = 'en') { return next; }
            static source(lang) {
                return {};
            }
        }
        __decorate([
            $mol_mem
        ], $mol_locale_mock.prototype, "lang", null);
        __decorate([
            $mol_mem_key
        ], $mol_locale_mock, "source", null);
        $.$mol_locale = $mol_locale_mock;
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    $mol_test({
        'min'() {
            $mol_assert_equal($mol_vlq_encode(Number.MIN_SAFE_INTEGER), '//////H');
        },
        'negative'() {
            $mol_assert_equal($mol_vlq_encode(-1), 'D');
        },
        'zero'() {
            $mol_assert_equal($mol_vlq_encode(0), 'A');
        },
        'binom'() {
            $mol_assert_equal($mol_vlq_encode(67), 'mE');
        },
        'max'() {
            $mol_assert_equal($mol_vlq_encode(Number.MAX_SAFE_INTEGER), '+/////H');
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    $mol_test({
        'sample source mapped lang'($) {
            const source = {
                script1: `1@\n2`,
                script2: `***`
            };
            const span = {
                script1: $mol_span.entire('script1', source.script1),
                script2: $mol_span.entire('script2', source.script2),
            };
            const tree = $mol_tree2.list([
                $mol_tree2.struct('line', [
                    $mol_tree2.data('"use strict";', [], span.script1.after()),
                    $mol_tree2.data('console.log(11);', [], span.script1.slice(0, 1)),
                    $mol_tree2.data('console.log(21);', [], span.script2),
                    $mol_tree2.data('console.log(12);', [], span.script1.span(2, 1, 1)),
                ], span.script1),
            ], span.script1);
            $mol_assert_like($.$mol_tree2_text_to_string(tree), '"use strict";console.log(11);console.log(21);console.log(12);\n');
            $mol_assert_like($.$mol_tree2_text_to_sourcemap(tree), {
                "version": 3,
                "sources": [
                    "script1",
                    "script2"
                ],
                "sourcesContent": [source.script1, source.script2],
                "mappings": "AAAA,AAAI,aAAJ,gBCAA,gBDCA;"
            });
        }
    });
})($ || ($ = {}));

;
	($.$mol_view_tree2_to_js_test_ex_array_slot_foo) = class $mol_view_tree2_to_js_test_ex_array_slot_foo extends ($.$mol_object) {
		ins1(){
			return "ins1";
		}
		sub_ins1(){
			return 1;
		}
		sub_ins(){
			return [(this.sub_ins1())];
		}
		ins2(){
			return "ins2";
		}
		insert(){
			return [
				2, 
				3, 
				(this.ins1()), 
				...(this.sub_ins()), 
				(this.ins2())
			];
		}
		foot2(){
			return "foot2";
		}
		foot(){
			return [
				1, 
				true, 
				"foot1", 
				...(this.insert()), 
				(this.foot2())
			];
		}
	};


;
	($.$mol_view_tree2_to_js_test_ex_simple_nan_foo) = class $mol_view_tree2_to_js_test_ex_simple_nan_foo extends ($.$mol_object) {
		a(){
			return NaN;
		}
		b(){
			return +NaN;
		}
		c(){
			return -NaN;
		}
		d(){
			return +Infinity;
		}
		e(){
			return -Infinity;
		}
		f(){
			return Infinity;
		}
	};


;
	($.$mol_view_tree2_to_js_test_ex_structural_foo) = class $mol_view_tree2_to_js_test_ex_structural_foo extends ($.$mol_object) {
		lol(){
			return 2;
		}
		bar(){
			return {
				"alpha": 1, 
				"beta": {}, 
				"xxx": (this.lol())
			};
		}
	};


;
	($.$mol_view_tree2_to_js_test_ex_array_union_foo) = class $mol_view_tree2_to_js_test_ex_array_union_foo extends ($.$mol_object) {
		foo(){
			return "c";
		}
		bar(){
			return [
				"a", 
				(this.foo()), 
				"b"
			];
		}
	};


;
	($.$mol_view_tree2_to_js_test_ex_array_number_foo) = class $mol_view_tree2_to_js_test_ex_array_number_foo extends ($.$mol_object) {
		bar(){
			return [
				-NaN, 
				-Infinity, 
				+Infinity, 
				0
			];
		}
	};


;
	($.$mol_view_tree2_to_js_test_ex_bidi_indexed_foo) = class $mol_view_tree2_to_js_test_ex_bidi_indexed_foo extends ($.$mol_object) {
		owner(id, next){
			if(next !== undefined) return next;
			return null;
		}
		indexed(id, next){
			return (this.owner(id, next));
		}
	};
	($mol_mem_key(($.$mol_view_tree2_to_js_test_ex_bidi_indexed_foo.prototype), "owner"));


;
	($.$mol_view_tree2_to_js_test_ex_array_boolean_foo) = class $mol_view_tree2_to_js_test_ex_array_boolean_foo extends ($.$mol_object) {
		bar(){
			return [false, true];
		}
	};


;
	($.$mol_view_tree2_to_js_test_ex_array_indexed_foo) = class $mol_view_tree2_to_js_test_ex_array_indexed_foo extends ($.$mol_object) {
		tag1(id){
			return "t1";
		}
		tag2(id){
			return "t2";
		}
		slot(id){
			return [(this.tag2(id))];
		}
		tags(id){
			return [(this.tag1(id)), ...(this.slot(id))];
		}
	};


;
	($.$mol_view_tree2_to_js_test_ex_bidi_chaining_foo) = class $mol_view_tree2_to_js_test_ex_bidi_chaining_foo extends ($.$mol_object) {
		c(next){
			if(next !== undefined) return next;
			return null;
		}
		b(next){
			return (this.c(next));
		}
		a(next){
			return (this.b(next));
		}
	};
	($mol_mem(($.$mol_view_tree2_to_js_test_ex_bidi_chaining_foo.prototype), "c"));


;
	($.$mol_view_tree2_to_js_test_ex_bidi_fallback_foo) = class $mol_view_tree2_to_js_test_ex_bidi_fallback_foo extends ($.$mol_object) {
		bar2(next){
			if(next !== undefined) return next;
			return 1;
		}
		bar1(next){
			return (this.bar2(next));
		}
	};
	($mol_mem(($.$mol_view_tree2_to_js_test_ex_bidi_fallback_foo.prototype), "bar2"));


;
	($.$mol_view_tree2_to_js_test_ex_left_chaining_foo) = class $mol_view_tree2_to_js_test_ex_left_chaining_foo extends ($.$mol_object) {
		d(next){
			if(next !== undefined) return next;
			return 0;
		}
		c(next){
			if(next !== undefined) return next;
			return (this.d());
		}
		b(){
			return (this.c());
		}
		a(){
			return (this.b());
		}
	};
	($mol_mem(($.$mol_view_tree2_to_js_test_ex_left_chaining_foo.prototype), "d"));
	($mol_mem(($.$mol_view_tree2_to_js_test_ex_left_chaining_foo.prototype), "c"));


;
	($.$mol_view_tree2_to_js_test_ex_right_indexed_foo) = class $mol_view_tree2_to_js_test_ex_right_indexed_foo extends ($.$mol_object) {
		a(next){
			if(next !== undefined) return next;
			return {"some": 123};
		}
	};
	($mol_mem(($.$mol_view_tree2_to_js_test_ex_right_indexed_foo.prototype), "a"));
	($.$mol_view_tree2_to_js_test_ex_right_indexed_bar) = class $mol_view_tree2_to_js_test_ex_right_indexed_bar extends ($.$mol_object) {
		b(id){
			return (this.Cls(id).a());
		}
		Cls(id){
			const obj = new this.$.$mol_view_tree2_to_js_test_ex_right_indexed_foo();
			return obj;
		}
	};
	($mol_mem_key(($.$mol_view_tree2_to_js_test_ex_right_indexed_bar.prototype), "Cls"));


;
	($.$mol_view_tree2_to_js_test_ex_simple_string_foo) = class $mol_view_tree2_to_js_test_ex_simple_string_foo extends ($.$mol_object) {
		hardcoded(){
			return "First\nSecond";
		}
		localized(){
			return (this.$.$mol_locale.text("$mol_view_tree2_to_js_test_ex_simple_string_foo_localized"));
		}
	};


;
	($.$mol_view_tree2_to_js_test_ex_left_read_only_foo) = class $mol_view_tree2_to_js_test_ex_left_read_only_foo extends ($.$mol_object) {
		bar2(next){
			if(next !== undefined) return next;
			return 1;
		}
		bar1(){
			return (this.bar2());
		}
	};
	($mol_mem(($.$mol_view_tree2_to_js_test_ex_left_read_only_foo.prototype), "bar2"));


;
	($.$mol_view_tree2_to_js_test_ex_right_hierarchy_foo) = class $mol_view_tree2_to_js_test_ex_right_hierarchy_foo extends ($.$mol_object) {
		indexed_title(id, next){
			return (this.Indexed(id).title(next));
		}
		indexed_id(id){
			return 0;
		}
		prj_domain(id){
			return (this.prj().domain(id));
		}
		prj_user(id){
			return (this.prj_domain(id).user());
		}
		prj_user_id(id){
			return (this.prj_user(id).id());
		}
		Indexed(id){
			const obj = new this.$.$mol_view_tree2_to_js_test_ex_right_hierarchy_bar();
			(obj.id) = () => ((this.indexed_id(id)));
			return obj;
		}
		prj(){
			const obj = new this.$.$mol_view_tree2_to_js_test_ex_right_hierarchy_bar();
			return obj;
		}
	};
	($mol_mem_key(($.$mol_view_tree2_to_js_test_ex_right_hierarchy_foo.prototype), "Indexed"));
	($mol_mem(($.$mol_view_tree2_to_js_test_ex_right_hierarchy_foo.prototype), "prj"));


;
	($.$mol_view_tree2_to_js_test_ex_right_read_only_foo) = class $mol_view_tree2_to_js_test_ex_right_read_only_foo extends ($.$mol_object) {
		a(id, next){
			if(next !== undefined) return next;
			return null;
		}
	};
	($mol_mem_key(($.$mol_view_tree2_to_js_test_ex_right_read_only_foo.prototype), "a"));
	($.$mol_view_tree2_to_js_test_ex_right_read_only_bar) = class $mol_view_tree2_to_js_test_ex_right_read_only_bar extends ($.$mol_object) {
		b(id, next){
			return (this.Obj().a(id, next));
		}
		Obj(){
			const obj = new this.$.$mol_view_tree2_to_js_test_ex_right_read_only_foo();
			return obj;
		}
	};
	($mol_mem(($.$mol_view_tree2_to_js_test_ex_right_read_only_bar.prototype), "Obj"));


;
	($.$mol_view_tree2_to_js_test_ex_structural_dict_foo) = class $mol_view_tree2_to_js_test_ex_structural_dict_foo extends ($.$mol_object) {
		bar(){
			return {"alpha": 1, "beta": "a"};
		}
	};


;
	($.$mol_view_tree2_to_js_test_ex_array_with_types_foo) = class $mol_view_tree2_to_js_test_ex_array_with_types_foo extends ($.$mol_object) {
		arr(){
			return [];
		}
	};


;
	($.$mol_view_tree2_to_js_test_ex_array_inheritance_foo) = class $mol_view_tree2_to_js_test_ex_array_inheritance_foo extends ($.$mol_object) {
		arr(){
			return ["v1"];
		}
	};
	($.$mol_view_tree2_to_js_test_ex_array_inheritance_bar) = class $mol_view_tree2_to_js_test_ex_array_inheritance_bar extends ($.$mol_view_tree2_to_js_test_ex_array_inheritance_foo) {
		arr(){
			return [
				"v3", 
				...(super.arr()), 
				"v4"
			];
		}
	};


;
	($.$mol_view_tree2_to_js_test_ex_bidi_legacy_value_foo) = class $mol_view_tree2_to_js_test_ex_bidi_legacy_value_foo extends ($.$mol_object) {
		b(next){
			if(next !== undefined) return next;
			return 1;
		}
		a(next){
			return (this.b(next));
		}
	};
	($mol_mem(($.$mol_view_tree2_to_js_test_ex_bidi_legacy_value_foo.prototype), "b"));


;
	($.$mol_view_tree2_to_js_test_ex_simple_typed_null_foo) = class $mol_view_tree2_to_js_test_ex_simple_typed_null_foo extends ($.$mol_object) {
		a(){
			return null;
		}
	};


;
	($.$mol_view_tree2_to_js_test_ex_bidi_in_dictionary_foo) = class $mol_view_tree2_to_js_test_ex_bidi_in_dictionary_foo extends ($.$mol_object) {
		run(next){
			if(next !== undefined) return next;
			return null;
		}
		event(){
			return {"click": (next) => (this.run(next))};
		}
	};
	($mol_mem(($.$mol_view_tree2_to_js_test_ex_bidi_in_dictionary_foo.prototype), "run"));


;
	($.$mol_scroll) = class $mol_scroll extends ($.$mol_view) {
		tabindex(){
			return -1;
		}
		event_scroll(next){
			if(next !== undefined) return next;
			return null;
		}
		scroll_top(next){
			if(next !== undefined) return next;
			return 0;
		}
		scroll_left(next){
			if(next !== undefined) return next;
			return 0;
		}
		attr(){
			return {...(super.attr()), "tabindex": (this.tabindex())};
		}
		event(){
			return {...(super.event()), "scroll": (next) => (this.event_scroll(next))};
		}
	};
	($mol_mem(($.$mol_scroll.prototype), "event_scroll"));
	($mol_mem(($.$mol_scroll.prototype), "scroll_top"));
	($mol_mem(($.$mol_scroll.prototype), "scroll_left"));


;
"use strict";
var $;
(function ($) {
    class $mol_print extends $mol_object {
        static before() {
            return new $mol_dom_listener(this.$.$mol_dom_context, 'beforeprint', () => {
                this.active(true);
            });
        }
        static after() {
            return new $mol_dom_listener(this.$.$mol_dom_context, 'afterprint', () => {
                this.active(false);
            });
        }
        static active(next) {
            this.before();
            this.after();
            return next || false;
        }
    }
    __decorate([
        $mol_mem
    ], $mol_print, "before", null);
    __decorate([
        $mol_mem
    ], $mol_print, "after", null);
    __decorate([
        $mol_mem
    ], $mol_print, "active", null);
    $.$mol_print = $mol_print;
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    class $mol_style_sheet_test1 extends $mol_view {
        Item() { return new $mol_view; }
    }
    $.$mol_style_sheet_test1 = $mol_style_sheet_test1;
    class $mol_style_sheet_test2 extends $mol_view {
        List() { return new $mol_style_sheet_test1; }
    }
    $.$mol_style_sheet_test2 = $mol_style_sheet_test2;
    $mol_test({
        'component block styles'() {
            class $mol_style_sheet_test extends $mol_view {
            }
            const sheet = $mol_style_sheet($mol_style_sheet_test, {
                display: 'block',
                zIndex: 1,
            });
            $mol_assert_equal(sheet, '[mol_style_sheet_test] {\n\tdisplay: block;\n\tz-index: 1;\n}\n');
        },
        'various units'() {
            class $mol_style_sheet_test extends $mol_view {
            }
            const sheet = $mol_style_sheet($mol_style_sheet_test, {
                width: '50%',
                height: '50px',
            });
            $mol_assert_equal(sheet, '[mol_style_sheet_test] {\n\twidth: 50%;\n\theight: 50px;\n}\n');
        },
        'various functions'() {
            class $mol_style_sheet_test extends $mol_view {
            }
            const { calc } = $mol_style_func;
            const sheet = $mol_style_sheet($mol_style_sheet_test, {
                width: calc(`100% - 1px`),
            });
            $mol_assert_equal(sheet, '[mol_style_sheet_test] {\n\twidth: calc(100% - 1px);\n}\n');
        },
        'property groups'() {
            class $mol_style_sheet_test extends $mol_view {
            }
            const sheet = $mol_style_sheet($mol_style_sheet_test, {
                flex: {
                    grow: 5,
                    shrink: 10,
                }
            });
            $mol_assert_equal(sheet, '[mol_style_sheet_test] {\n\tflex-grow: 5;\n\tflex-shrink: 10;\n}\n');
        },
        'custom properties'() {
            class $mol_style_sheet_test extends $mol_view {
            }
            const sheet = $mol_style_sheet($mol_style_sheet_test, {
                '--isVariable': 'yes',
                '--is_variable': 'no',
            });
            $mol_assert_equal(sheet, '[mol_style_sheet_test] {\n\t--is-variable: yes;\n\t--is_variable: no;\n}\n');
        },
        'custom property groups'() {
            class $mol_style_sheet_test extends $mol_view {
            }
            const sheet = $mol_style_sheet($mol_style_sheet_test, {
                '--variable': {
                    test1: '5px',
                    test2: '10px',
                },
            });
            $mol_assert_equal(sheet, '[mol_style_sheet_test] {\n\t--variable-test1: 5px;\n\t--variable-test2: 10px;\n}\n');
        },
        'property shorthand'() {
            class $mol_style_sheet_test extends $mol_view {
            }
            const sheet = $mol_style_sheet($mol_style_sheet_test, {
                padding: ['5px', 'auto'],
                margin: ['10px', 'auto'],
            });
            $mol_assert_equal(sheet, '[mol_style_sheet_test] {\n\tpadding: 5px auto;\n\tmargin: 10px auto;\n}\n');
        },
        'sequenced values'() {
            class $mol_style_sheet_test extends $mol_view {
            }
            const { url } = $mol_style_func;
            const sheet = $mol_style_sheet($mol_style_sheet_test, {
                background: {
                    image: [[url('foo')], [url('bar')]],
                    size: [['cover'], ['contain']],
                },
            });
            $mol_assert_equal(sheet, '[mol_style_sheet_test] {\n\tbackground-image: url("foo"),url("bar");\n\tbackground-size: cover,contain;\n}\n');
        },
        'sequenced structs'() {
            class $mol_style_sheet_test extends $mol_view {
            }
            const sheet = $mol_style_sheet($mol_style_sheet_test, {
                box: {
                    shadow: [
                        {
                            inset: true,
                            x: 0,
                            y: 0,
                            blur: '0.5rem',
                            spread: 0,
                            color: 'red',
                        },
                        {
                            inset: false,
                            x: 0,
                            y: 0,
                            blur: '0.5rem',
                            spread: 0,
                            color: 'blue',
                        },
                    ],
                },
            });
            $mol_assert_equal(sheet, '[mol_style_sheet_test] {\n\tbox-shadow: inset 0 0 0.5rem 0 red,0 0 0.5rem 0 blue;\n}\n');
        },
        'component block styles with pseudo class'() {
            class $mol_style_sheet_test extends $mol_view {
            }
            const sheet = $mol_style_sheet($mol_style_sheet_test, {
                color: 'red',
                ':focus': {
                    display: 'block',
                },
            });
            $mol_assert_equal(sheet, '[mol_style_sheet_test] {\n\tcolor: red;\n}\n[mol_style_sheet_test]:focus {\n\tdisplay: block;\n}\n');
        },
        'component block styles with pseudo element'() {
            class $mol_style_sheet_test extends $mol_view {
            }
            const sheet = $mol_style_sheet($mol_style_sheet_test, {
                color: 'red',
                '::first-line': {
                    display: 'block',
                },
            });
            $mol_assert_equal(sheet, '[mol_style_sheet_test] {\n\tcolor: red;\n}\n[mol_style_sheet_test]::first-line {\n\tdisplay: block;\n}\n');
        },
        'component block styles with media query'() {
            class $mol_style_sheet_test extends $mol_view {
            }
            const sheet = $mol_style_sheet($mol_style_sheet_test, {
                color: 'red',
                '@media': {
                    'print': {
                        display: 'block',
                    },
                    '(max-width: 640px)': {
                        display: 'inline',
                    },
                },
            });
            $mol_assert_equal(sheet, '[mol_style_sheet_test] {\n\tcolor: red;\n}\n@media print {\n[mol_style_sheet_test] {\n\tdisplay: block;\n}\n}\n@media (max-width: 640px) {\n[mol_style_sheet_test] {\n\tdisplay: inline;\n}\n}\n');
        },
        'component block styles with attribute value'() {
            class $mol_style_sheet_test extends $mol_view {
                attr() {
                    return {
                        mol_theme: '$mol_theme_dark'
                    };
                }
            }
            const sheet = $mol_style_sheet($mol_style_sheet_test, {
                color: 'red',
                '@': {
                    mol_theme: {
                        '$mol_theme_dark': {
                            display: 'block',
                        },
                    },
                    disabled: {
                        'true': {
                            width: '100%',
                        },
                    },
                },
            });
            $mol_assert_equal(sheet, '[mol_style_sheet_test] {\n\tcolor: red;\n}\n[mol_style_sheet_test]:where([mol_theme="$mol_theme_dark"]) {\n\tdisplay: block;\n}\n[mol_style_sheet_test]:where([disabled="true"]) {\n\twidth: 100%;\n}\n');
        },
        'component block styles with attribute value (short syntax)'() {
            class $mol_style_sheet_test extends $mol_view {
                attr() {
                    return {
                        mol_theme: '$mol_theme_dark'
                    };
                }
            }
            const sheet = $mol_style_sheet($mol_style_sheet_test, {
                color: 'red',
                '[mol_theme]': {
                    '$mol_theme_dark': {
                        display: 'block',
                    },
                },
                '[disabled]': {
                    'true': {
                        width: '100%',
                    },
                    'false': {
                        width: '50%',
                    },
                },
            });
            $mol_assert_equal(sheet, '[mol_style_sheet_test] {\n\tcolor: red;\n}\n[mol_style_sheet_test]:where([mol_theme="$mol_theme_dark"]) {\n\tdisplay: block;\n}\n[mol_style_sheet_test]:where([disabled="true"]) {\n\twidth: 100%;\n}\n[mol_style_sheet_test]:where([disabled="false"]) {\n\twidth: 50%;\n}\n');
        },
        'component element styles'() {
            class $mol_style_sheet_test extends $mol_view {
                Item() { return new $mol_view; }
            }
            const sheet = $mol_style_sheet($mol_style_sheet_test, {
                color: 'red',
                Item: {
                    display: 'block',
                },
            });
            $mol_assert_equal(sheet, '[mol_style_sheet_test] {\n\tcolor: red;\n}\n[mol_style_sheet_test_item] {\n\tdisplay: block;\n}\n');
        },
        'component element of element styles'() {
            const sheet = $mol_style_sheet($mol_style_sheet_test2, {
                width: '100%',
                List: {
                    color: 'red',
                    Item: {
                        display: 'block',
                    },
                },
            });
            $mol_assert_equal(sheet, '[mol_style_sheet_test2] {\n\twidth: 100%;\n}\n[mol_style_sheet_test2_list] {\n\tcolor: red;\n}\n[mol_style_sheet_test2_list_item] {\n\tdisplay: block;\n}\n');
        },
        'component element styles with block attribute value'() {
            class $mol_style_sheet_test extends $mol_view {
                Item() { return new $mol_view; }
                attr() {
                    return {
                        mol_theme: '$mol_theme_dark',
                        disabled: true,
                    };
                }
            }
            const sheet = $mol_style_sheet($mol_style_sheet_test, {
                '@': {
                    mol_theme: {
                        '$mol_theme_dark': {
                            Item: {
                                color: 'red',
                            },
                        },
                    },
                },
            });
            $mol_assert_equal(sheet, '[mol_style_sheet_test]:where([mol_theme="$mol_theme_dark"]) :where([mol_style_sheet_test_item]) {\n\tcolor: red;\n}\n');
        },
        'inner component styles by class'() {
            const sheet = $mol_style_sheet($mol_style_sheet_test2, {
                color: 'red',
                $mol_style_sheet_test1: {
                    display: 'block',
                },
            });
            $mol_assert_equal(sheet, '[mol_style_sheet_test2] {\n\tcolor: red;\n}\n[mol_style_sheet_test2] :where([mol_style_sheet_test1]) {\n\tdisplay: block;\n}\n');
        },
        'child component styles by class'() {
            const sheet = $mol_style_sheet($mol_style_sheet_test2, {
                color: 'red',
                '>': {
                    $mol_style_sheet_test1: {
                        display: 'block',
                    },
                    $mol_style_sheet_test2: {
                        display: 'inline',
                    },
                },
            });
            $mol_assert_equal(sheet, '[mol_style_sheet_test2] {\n\tcolor: red;\n}\n[mol_style_sheet_test2] > :where([mol_style_sheet_test1]) {\n\tdisplay: block;\n}\n[mol_style_sheet_test2] > :where([mol_style_sheet_test2]) {\n\tdisplay: inline;\n}\n');
        },
    });
})($ || ($ = {}));

;
"use strict";


;
"use strict";
var $;
(function ($) {
    var $$;
    (function ($$) {
        /**
         * Scrolling pane.
         * @see https://mol.hyoo.ru/#!section=demos/demo=mol_scroll_demo
         */
        class $mol_scroll extends $.$mol_scroll {
            scroll_top(next, cache) {
                const el = this.dom_node();
                if (next !== undefined && !cache)
                    el.scrollTop = next;
                return el.scrollTop;
            }
            scroll_left(next, cache) {
                const el = this.dom_node();
                if (next !== undefined && !cache)
                    el.scrollLeft = next;
                return el.scrollLeft;
            }
            event_scroll(next) {
                const el = this.dom_node();
                this.scroll_left(el.scrollLeft, 'cache');
                this.scroll_top(el.scrollTop, 'cache');
            }
            minimal_height() {
                return this.$.$mol_print.active() ? null : 0;
            }
            minimal_width() {
                return this.$.$mol_print.active() ? null : 0;
            }
        }
        __decorate([
            $mol_mem
        ], $mol_scroll.prototype, "scroll_top", null);
        __decorate([
            $mol_mem
        ], $mol_scroll.prototype, "scroll_left", null);
        $$.$mol_scroll = $mol_scroll;
    })($$ = $.$$ || ($.$$ = {}));
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    var $$;
    (function ($$) {
        const { per, rem, px } = $mol_style_unit;
        $mol_style_define($mol_scroll, {
            display: 'grid',
            overflow: 'auto',
            flex: {
                direction: 'column',
                grow: 1,
                shrink: 1,
                // basis: 0,
            },
            outline: 'none',
            align: {
                self: 'stretch',
                items: 'flex-start',
            },
            boxSizing: 'border-box',
            willChange: 'scroll-position',
            scroll: {
                padding: [rem(.75), 0],
            },
            maxHeight: per(100),
            maxWidth: per(100),
            webkitOverflowScrolling: 'touch',
            contain: 'content',
            '>': {
                $mol_view: {
                    // transform: 'translateZ(0)', // enforce gpu scroll in all agents
                    gridArea: '1/1',
                },
            },
            '::before': {
                display: 'none',
            },
            '::after': {
                display: 'none',
            },
            '::-webkit-scrollbar': {
                width: rem(.25),
                height: rem(.25),
            },
            '@media': {
                'print': {
                    overflow: 'hidden',
                    contain: 'none',
                    maxHeight: 'unset',
                },
            },
        });
    })($$ = $.$$ || ($.$$ = {}));
})($ || ($ = {}));

;
	($.$mol_page) = class $mol_page extends ($.$mol_view) {
		tabindex(){
			return -1;
		}
		Logo(){
			return null;
		}
		title_content(){
			return [(this.Logo()), (this.title())];
		}
		Title(){
			const obj = new this.$.$mol_view();
			(obj.dom_name) = () => ("h1");
			(obj.sub) = () => ((this.title_content()));
			return obj;
		}
		tools(){
			return [];
		}
		Tools(){
			const obj = new this.$.$mol_view();
			(obj.sub) = () => ((this.tools()));
			return obj;
		}
		head(){
			return [(this.Title()), (this.Tools())];
		}
		Head(){
			const obj = new this.$.$mol_view();
			(obj.minimal_height) = () => (64);
			(obj.dom_name) = () => ("header");
			(obj.sub) = () => ((this.head()));
			return obj;
		}
		body_scroll_top(next){
			return (this.Body().scroll_top(next));
		}
		body(){
			return [];
		}
		Body_content(){
			const obj = new this.$.$mol_view();
			(obj.sub) = () => ((this.body()));
			return obj;
		}
		body_content(){
			return [(this.Body_content())];
		}
		Body(){
			const obj = new this.$.$mol_scroll();
			(obj.sub) = () => ((this.body_content()));
			return obj;
		}
		foot(){
			return [];
		}
		Foot(){
			const obj = new this.$.$mol_view();
			(obj.dom_name) = () => ("footer");
			(obj.sub) = () => ((this.foot()));
			return obj;
		}
		dom_name(){
			return "article";
		}
		attr(){
			return {...(super.attr()), "tabIndex": (this.tabindex())};
		}
		sub(){
			return [
				(this.Head()), 
				(this.Body()), 
				(this.Foot())
			];
		}
	};
	($mol_mem(($.$mol_page.prototype), "Title"));
	($mol_mem(($.$mol_page.prototype), "Tools"));
	($mol_mem(($.$mol_page.prototype), "Head"));
	($mol_mem(($.$mol_page.prototype), "Body_content"));
	($mol_mem(($.$mol_page.prototype), "Body"));
	($mol_mem(($.$mol_page.prototype), "Foot"));


;
"use strict";


;
"use strict";
var $;
(function ($) {
    var $$;
    (function ($$) {
        const { per, rem } = $mol_style_unit;
        const { hsla, blur } = $mol_style_func;
        $mol_style_define($mol_page, {
            display: 'flex',
            flex: {
                basis: 'auto',
                direction: 'column',
            },
            position: 'relative',
            alignSelf: 'stretch',
            maxWidth: per(100),
            maxHeight: per(100),
            boxSizing: 'border-box',
            color: $mol_theme.text,
            // backdropFilter: blur( `3px` ), enforces layering
            // zIndex: 0 ,
            ':focus': {
                outline: 'none',
            },
            Head: {
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'flex-end',
                flex: 'none',
                position: 'relative',
                margin: 0,
                minHeight: rem(4),
                padding: $mol_gap.block,
                background: {
                    color: $mol_theme.card,
                },
                border: {
                    radius: $mol_gap.round,
                },
                box: {
                    shadow: [
                        [0, `-0.5rem`, `0.5rem`, `-0.5rem`, hsla(0, 0, 0, .25)],
                        [0, `0.5rem`, `0.5rem`, `-0.5rem`, hsla(0, 0, 0, .25)],
                    ],
                },
                zIndex: 2,
                '@media': {
                    'print': {
                        box: {
                            shadow: [[0, `1px`, 0, 0, hsla(0, 0, 0, .25)]],
                        },
                    },
                },
            },
            Title: {
                minHeight: rem(2),
                margin: 0,
                padding: $mol_gap.text,
                gap: $mol_gap.text,
                wordBreak: 'normal',
                textShadow: '0 0',
                font: {
                    size: 'inherit',
                    weight: 'normal',
                },
                flex: {
                    grow: 1,
                    shrink: 1,
                    basis: 'auto',
                },
            },
            Tools: {
                flex: {
                    basis: 'auto',
                    grow: 0,
                    shrink: 1,
                },
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'flex-start',
                flexWrap: 'wrap',
                '@media': {
                    'print': {
                        display: 'none',
                    },
                },
            },
            Body: {
                flex: {
                    grow: 1000,
                    shrink: 1,
                    basis: per(100),
                },
            },
            Body_content: {
                padding: $mol_gap.block,
                minHeight: 0,
                minWidth: 0,
                flex: {
                    direction: 'column',
                    shrink: 1,
                    grow: 1,
                },
                justify: {
                    self: 'stretch',
                },
            },
            Foot: {
                display: 'flex',
                justifyContent: 'space-between',
                flex: 'none',
                margin: 0,
                background: {
                    color: $mol_theme.card,
                },
                border: {
                    radius: $mol_gap.round,
                },
                box: {
                    shadow: [
                        [0, `-0.5rem`, `0.5rem`, `-0.5rem`, hsla(0, 0, 0, .25)],
                        [0, `0.5rem`, `0.5rem`, `-0.5rem`, hsla(0, 0, 0, .25)],
                    ],
                },
                zIndex: 1,
                padding: $mol_gap.block,
                ':empty': {
                    display: 'none',
                },
            },
        });
    })($$ = $.$$ || ($.$$ = {}));
})($ || ($ = {}));

;
	($.$mol_view_tree2_to_js_test_ex_right_in_left_foo) = class $mol_view_tree2_to_js_test_ex_right_in_left_foo extends ($.$mol_object) {
		a(){
			return null;
		}
	};
	($.$mol_view_tree2_to_js_test_ex_right_in_left_bar) = class $mol_view_tree2_to_js_test_ex_right_in_left_bar extends ($.$mol_object) {
		b(){
			return (this.Cls().a());
		}
		Cls(){
			const obj = new this.$.$mol_view_tree2_to_js_test_ex_right_in_left_foo();
			return obj;
		}
		Menu_title(){
			return (this.Menu().Title());
		}
		Menu(){
			const obj = new this.$.$mol_page();
			return obj;
		}
		foo(){
			return (this.Cls());
		}
		pages(){
			return [(this.Menu())];
		}
	};
	($mol_mem(($.$mol_view_tree2_to_js_test_ex_right_in_left_bar.prototype), "Cls"));
	($mol_mem(($.$mol_view_tree2_to_js_test_ex_right_in_left_bar.prototype), "Menu"));


;
	($.$mol_view_tree2_to_js_test_ex_simple_empty_class_foo) = class $mol_view_tree2_to_js_test_ex_simple_empty_class_foo extends ($.$mol_object) {};


;
	($.$mol_view_tree2_to_js_test_ex_simple_two_classes_foo) = class $mol_view_tree2_to_js_test_ex_simple_two_classes_foo extends ($.$mol_object) {
		str(){
			return "some";
		}
	};
	($.$mol_view_tree2_to_js_test_ex_simple_two_classes_bar) = class $mol_view_tree2_to_js_test_ex_simple_two_classes_bar extends ($.$mol_view_tree2_to_js_test_ex_simple_two_classes_foo) {
		str(){
			return "some2";
		}
	};


;
	($.$mol_view_tree2_to_js_test_ex_simple_factory_props_bar) = class $mol_view_tree2_to_js_test_ex_simple_factory_props_bar extends ($.$mol_object) {
		sub(){
			return [];
		}
		loc(){
			return "v2";
		}
		deep(){
			return {"loc": (this.$.$mol_locale.text("$mol_view_tree2_to_js_test_ex_simple_factory_props_bar_deep_loc"))};
		}
		some(){
			return false;
		}
	};
	($.$mol_view_tree2_to_js_test_ex_simple_factory_props_foo) = class $mol_view_tree2_to_js_test_ex_simple_factory_props_foo extends ($.$mol_object) {
		button(){
			const obj = new this.$.$mol_view_tree2_to_js_test_ex_simple_factory_props_bar();
			(obj.some) = () => (true);
			(obj.loc) = () => ((this.$.$mol_locale.text("$mol_view_tree2_to_js_test_ex_simple_factory_props_foo_button_loc")));
			(obj.deep) = () => ({"loc": (this.$.$mol_locale.text("$mol_view_tree2_to_js_test_ex_simple_factory_props_foo_button_deep_loc"))});
			(obj.sub) = () => ([1]);
			return obj;
		}
	};
	($mol_mem(($.$mol_view_tree2_to_js_test_ex_simple_factory_props_foo.prototype), "button"));


;
	($.$mol_view_tree2_to_js_test_ex_simple_default_indexed_foo) = class $mol_view_tree2_to_js_test_ex_simple_default_indexed_foo extends ($.$mol_object) {
		a_b(id, next){
			if(next !== undefined) return next;
			return 0;
		}
		legacy(id, next){
			if(next !== undefined) return next;
			return 0;
		}
	};
	($mol_mem_key(($.$mol_view_tree2_to_js_test_ex_simple_default_indexed_foo.prototype), "a_b"));
	($mol_mem_key(($.$mol_view_tree2_to_js_test_ex_simple_default_indexed_foo.prototype), "legacy"));


;
	($.$mol_view_tree2_to_js_test_ex_structural_complex_key_foo) = class $mol_view_tree2_to_js_test_ex_structural_complex_key_foo extends ($.$mol_object) {
		dictionary(){
			return {
				"raw data key": "1", 
				"key2": "2", 
				"key3": "3"
			};
		}
	};


;
	($.$mol_view_tree2_to_js_test_ex_array_constructor_tuple_foo) = class $mol_view_tree2_to_js_test_ex_array_constructor_tuple_foo extends ($.$mol_object) {
		text(){
			return "123";
		}
		text_blob(next){
			if(next !== undefined) return next;
			const obj = new this.$.$mol_view_tree2_to_js_test_ex_klass_tuple([(this.text())], {"type": "text/plain"});
			return obj;
		}
		blobs(){
			return [(this.text_blob())];
		}
	};
	($mol_mem(($.$mol_view_tree2_to_js_test_ex_array_constructor_tuple_foo.prototype), "text_blob"));


;
	($.$mol_view_tree2_to_js_test_ex_left_second_level_index_bar) = class $mol_view_tree2_to_js_test_ex_left_second_level_index_bar extends ($.$mol_object) {
		localized(){
			return "";
		}
	};
	($.$mol_view_tree2_to_js_test_ex_left_second_level_index_foo) = class $mol_view_tree2_to_js_test_ex_left_second_level_index_foo extends ($.$mol_object) {
		some(id, next){
			if(next !== undefined) return next;
			return (this.$.$mol_locale.text("$mol_view_tree2_to_js_test_ex_left_second_level_index_foo_some"));
		}
		owner(id, next){
			if(next !== undefined) return next;
			const obj = new this.$.$mol_view_tree2_to_js_test_ex_left_second_level_index_bar();
			(obj.localized) = () => ((this.some(id)));
			return obj;
		}
		cls(id){
			return (this.owner(id));
		}
	};
	($mol_mem_key(($.$mol_view_tree2_to_js_test_ex_left_second_level_index_foo.prototype), "some"));
	($mol_mem_key(($.$mol_view_tree2_to_js_test_ex_left_second_level_index_foo.prototype), "owner"));


;
	($.$mol_view_tree2_to_js_test_ex_structural_quoted_props_foo) = class $mol_view_tree2_to_js_test_ex_structural_quoted_props_foo extends ($.$mol_object) {
		bar(){
			return {"a$": 1, "b-t": {}};
		}
	};


;
	($.$mol_view_tree2_to_js_test_ex_structural_spread_other_foo) = class $mol_view_tree2_to_js_test_ex_structural_spread_other_foo extends ($.$mol_object) {
		test(){
			return {"aaa": 123};
		}
		field(){
			return {"bbb": 321, ...(this.test())};
		}
	};


;
	($.$mol_view_tree2_to_js_test_ex_array_of_array_or_object_foo) = class $mol_view_tree2_to_js_test_ex_array_of_array_or_object_foo extends ($.$mol_object) {
		complex(){
			return [
				"1", 
				[true], 
				["1", 21], 
				{"a": 1, "str": "some"}
			];
		}
	};


;
	($.$mol_view_tree2_to_js_test_ex_bidi_localized_in_object_foo) = class $mol_view_tree2_to_js_test_ex_bidi_localized_in_object_foo extends ($.$mol_object) {
		outer(next){
			if(next !== undefined) return next;
			return (this.$.$mol_locale.text("$mol_view_tree2_to_js_test_ex_bidi_localized_in_object_foo_outer"));
		}
		obj(){
			return {"loc": (next) => (this.outer(next))};
		}
	};
	($mol_mem(($.$mol_view_tree2_to_js_test_ex_bidi_localized_in_object_foo.prototype), "outer"));


;
	($.$mol_view_tree2_to_js_test_ex_bidi_with_default_object_foo) = class $mol_view_tree2_to_js_test_ex_bidi_with_default_object_foo extends ($.$mol_object) {
		owner(next){
			if(next !== undefined) return next;
			const obj = new this.$.$mol_object();
			return obj;
		}
		class(next){
			return (this.owner(next));
		}
	};
	($mol_mem(($.$mol_view_tree2_to_js_test_ex_bidi_with_default_object_foo.prototype), "owner"));


;
	($.$mol_view_tree2_to_js_test_ex_left_in_array_and_object_bar) = class $mol_view_tree2_to_js_test_ex_left_in_array_and_object_bar extends ($.$mol_object) {
		rows(){
			return [];
		}
	};
	($.$mol_view_tree2_to_js_test_ex_left_in_array_and_object_foo) = class $mol_view_tree2_to_js_test_ex_left_in_array_and_object_foo extends ($.$mol_object) {
		content(){
			return [];
		}
		Obj(){
			const obj = new this.$.$mol_view_tree2_to_js_test_ex_left_in_array_and_object_bar();
			(obj.rows) = () => ((this.content()));
			return obj;
		}
		obj(){
			return {"prop": (this.Obj())};
		}
		arr(){
			return [(this.Obj())];
		}
	};
	($mol_mem(($.$mol_view_tree2_to_js_test_ex_left_in_array_and_object_foo.prototype), "Obj"));


;
	($.$mol_view_tree2_to_js_test_ex_bidi_indexed_second_level_bar) = class $mol_view_tree2_to_js_test_ex_bidi_indexed_second_level_bar extends ($.$mol_object) {
		expanded(){
			return "";
		}
	};
	($.$mol_view_tree2_to_js_test_ex_bidi_indexed_second_level_foo) = class $mol_view_tree2_to_js_test_ex_bidi_indexed_second_level_foo extends ($.$mol_object) {
		owner(id, next){
			if(next !== undefined) return next;
			return "w";
		}
		indexed(id, next){
			if(next !== undefined) return next;
			const obj = new this.$.$mol_view_tree2_to_js_test_ex_bidi_indexed_second_level_bar();
			(obj.expanded) = (next) => ((this.owner(id, next)));
			return obj;
		}
	};
	($mol_mem_key(($.$mol_view_tree2_to_js_test_ex_bidi_indexed_second_level_foo.prototype), "owner"));
	($mol_mem_key(($.$mol_view_tree2_to_js_test_ex_bidi_indexed_second_level_foo.prototype), "indexed"));


;
	($.$mol_view_tree2_to_js_test_ex_array_spread_other_bar) = class $mol_view_tree2_to_js_test_ex_array_spread_other_bar extends ($.$mol_object) {
		sup(){
			return ["v1"];
		}
		arr(){
			return ["v2", ...(this.sup())];
		}
	};


;
	($.$mol_view_tree2_to_js_test_ex_simple_factory_inheritance_bar) = class $mol_view_tree2_to_js_test_ex_simple_factory_inheritance_bar extends ($.$mol_object) {
		config(){
			return {"ips": ["127.0.0.1"]};
		}
	};
	($.$mol_view_tree2_to_js_test_ex_simple_factory_inheritance_foo) = class $mol_view_tree2_to_js_test_ex_simple_factory_inheritance_foo extends ($.$mol_object) {
		addon(){
			return ["1.1.1.1"];
		}
		Having(){
			const obj = new this.$.$mol_view_tree2_to_js_test_ex_simple_factory_inheritance_bar();
			(obj.config) = () => ({"ips": [
				...(this.$.$mol_view_tree2_to_js_test_ex_simple_factory_inheritance_bar.prototype.config.call(obj).ips), 
				"0.0.0.0", 
				...(this.addon())
			]});
			return obj;
		}
	};
	($mol_mem(($.$mol_view_tree2_to_js_test_ex_simple_factory_inheritance_foo.prototype), "Having"));


;
	($.$mol_view_tree2_to_js_test_ex_structural_with_inheritance_foo) = class $mol_view_tree2_to_js_test_ex_structural_with_inheritance_foo extends ($.$mol_object) {
		field(){
			return {"xxx": 123, "xxy": "test"};
		}
	};
	($.$mol_view_tree2_to_js_test_ex_structural_with_inheritance_bar) = class $mol_view_tree2_to_js_test_ex_structural_with_inheritance_bar extends ($.$mol_view_tree2_to_js_test_ex_structural_with_inheritance_foo) {
		field(){
			return {
				"yyy": 234, 
				...(super.field()), 
				"zzz": 345
			};
		}
	};


;
	($.$mol_view_tree2_to_js_test_ex_bidi_localized_default_value_foo) = class $mol_view_tree2_to_js_test_ex_bidi_localized_default_value_foo extends ($.$mol_object) {
		b(next){
			if(next !== undefined) return next;
			return (this.$.$mol_locale.text("$mol_view_tree2_to_js_test_ex_bidi_localized_default_value_foo_b"));
		}
		a(next){
			return (this.b(next));
		}
	};
	($mol_mem(($.$mol_view_tree2_to_js_test_ex_bidi_localized_default_value_foo.prototype), "b"));


;
	($.$mol_view_tree2_to_js_test_ex_simple_mutable_and_read_only_foo) = class $mol_view_tree2_to_js_test_ex_simple_mutable_and_read_only_foo extends ($.$mol_object) {
		readonly(){
			return null;
		}
		mutable(next){
			if(next !== undefined) return next;
			return null;
		}
	};
	($mol_mem(($.$mol_view_tree2_to_js_test_ex_simple_mutable_and_read_only_foo.prototype), "mutable"));


;
	($.$mol_view_tree2_to_js_test_ex_structural_localized_prop_value_foo) = class $mol_view_tree2_to_js_test_ex_structural_localized_prop_value_foo extends ($.$mol_object) {
		bar(){
			return {"loc": (this.$.$mol_locale.text("$mol_view_tree2_to_js_test_ex_structural_localized_prop_value_foo_bar_loc")), "baz": {"loc2": (this.$.$mol_locale.text("$mol_view_tree2_to_js_test_ex_structural_localized_prop_value_foo_bar_baz_loc2"))}};
		}
	};


;
	($.$mol_view_tree2_to_js_test_ex_left_with_separate_default_and_comment_bar) = class $mol_view_tree2_to_js_test_ex_left_with_separate_default_and_comment_bar extends ($.$mol_object) {
		rows(){
			return [];
		}
	};
	($.$mol_view_tree2_to_js_test_ex_left_with_separate_default_and_comment_foo) = class $mol_view_tree2_to_js_test_ex_left_with_separate_default_and_comment_foo extends ($.$mol_object) {
		content(){
			return 123;
		}
		Obj(){
			const obj = new this.$.$mol_view_tree2_to_js_test_ex_left_with_separate_default_and_comment_bar();
			(obj.rows) = () => ([(this.content())]);
			return obj;
		}
	};
	($mol_mem(($.$mol_view_tree2_to_js_test_ex_left_with_separate_default_and_comment_foo.prototype), "Obj"));


;
	($.$mol_view_tree2_to_js_test_ex_bidi_with_separate_default_in_right_part_foo) = class $mol_view_tree2_to_js_test_ex_bidi_with_separate_default_in_right_part_foo extends ($.$mol_object) {
		b(next){
			if(next !== undefined) return next;
			return false;
		}
		a(next){
			return (this.b(next));
		}
	};
	($mol_mem(($.$mol_view_tree2_to_js_test_ex_bidi_with_separate_default_in_right_part_foo.prototype), "b"));


;
	($.$mol_view_tree2_to_js_test_ex_bidi_doubing_right_part_with_same_default_foo) = class $mol_view_tree2_to_js_test_ex_bidi_doubing_right_part_with_same_default_foo extends ($.$mol_object) {
		b(next){
			if(next !== undefined) return next;
			return false;
		}
		a(next){
			return (this.b(next));
		}
		c(next){
			return (this.b(next));
		}
	};
	($mol_mem(($.$mol_view_tree2_to_js_test_ex_bidi_doubing_right_part_with_same_default_foo.prototype), "b"));


;
"use strict";
var $;
(function ($) {
    class $mol_view_tree2_to_js_test_ex_klass_tuple extends $mol_object {
        tuple;
        some;
        constructor(tuple = [], some) {
            super();
            this.tuple = tuple;
            this.some = some;
        }
    }
    $.$mol_view_tree2_to_js_test_ex_klass_tuple = $mol_view_tree2_to_js_test_ex_klass_tuple;
})($ || ($ = {}));

;
"use strict";


;
"use strict";


;
"use strict";


;
"use strict";


;
"use strict";


;
"use strict";


;
"use strict";


;
"use strict";


;
"use strict";


;
"use strict";


;
"use strict";


;
"use strict";


;
"use strict";


;
"use strict";


;
"use strict";


;
"use strict";


;
"use strict";


;
"use strict";


;
"use strict";


;
"use strict";


;
"use strict";


;
"use strict";


;
"use strict";


;
"use strict";


;
"use strict";


;
"use strict";


;
"use strict";


;
"use strict";


;
"use strict";


;
"use strict";


;
"use strict";


;
"use strict";


;
"use strict";
var $;
(function ($) {
    class $mol_view_tree2_to_js_test_ex_right_hierarchy_bar extends $mol_object {
        title(next) {
            return 123 + (next ?? 0);
        }
        id() {
            return 0;
        }
        domain(id) {
            return {
                user() {
                    return {
                        id() {
                            return 1 + id;
                        }
                    };
                }
            };
        }
    }
    __decorate([
        $mol_mem
    ], $mol_view_tree2_to_js_test_ex_right_hierarchy_bar.prototype, "title", null);
    __decorate([
        $mol_mem_key
    ], $mol_view_tree2_to_js_test_ex_right_hierarchy_bar.prototype, "domain", null);
    $.$mol_view_tree2_to_js_test_ex_right_hierarchy_bar = $mol_view_tree2_to_js_test_ex_right_hierarchy_bar;
})($ || ($ = {}));

;
"use strict";


;
"use strict";


;
"use strict";


;
"use strict";


;
"use strict";


;
"use strict";


;
"use strict";


;
"use strict";


;
"use strict";


;
"use strict";


;
"use strict";


;
"use strict";


;
"use strict";


;
"use strict";


;
"use strict";
var $;
(function ($_1) {
    const str2js = (function (data, url) {
        const tree = this.$mol_tree2_from_string(data, url);
        const js_tree = this.$mol_view_tree2_to_js(tree);
        const js_text = this.$mol_tree2_js_to_text(js_tree);
        const js_str = this.$mol_tree2_text_to_string_mapped_js(js_text);
        return js_str;
    }).bind($);
    function $mol_view_tree2_to_js_test_run(tree) {
        class $mol_view_mock extends $mol_object {
        }
        const $ = { $mol_object: $mol_view_mock };
        $mol_view_mock[$mol_ambient_ref] = $;
        const src_uri = `.view.tree`;
        const js = str2js(tree, src_uri);
        eval(js);
        return $;
    }
    $_1.$mol_view_tree2_to_js_test_run = $mol_view_tree2_to_js_test_run;
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    $mol_test({
        'Bidi bind fallback'($) {
            const _foo = $mol_view_tree2_to_js_test_ex_bidi_fallback_foo;
            const foo = _foo.make({});
            $mol_assert_equal(foo.bar1(), foo.bar2(), 1);
            $mol_assert_equal(foo.bar2(2), foo.bar1(), 2);
            $mol_assert_equal(foo.bar1(1), foo.bar1(), 1);
            $mol_assert_equal(foo.bar1(1), foo.bar2(), 1);
            $mol_assert_equal(foo.bar2(3), foo.bar2(), foo.bar1(), 3);
        },
        'Bidi bind legacy value'($) {
            const _foo = $mol_view_tree2_to_js_test_ex_bidi_legacy_value_foo;
            const foo = _foo.make({ $ });
            $mol_assert_like(foo.a(), foo.b(), 1);
            $mol_assert_like(foo.b(2), foo.a(), 2);
        },
        'Bidi bind in dictionary'($) {
            const _foo = $mol_view_tree2_to_js_test_ex_bidi_in_dictionary_foo;
            $mol_assert_like(_foo.make({ $ }).event().click({}), {});
        },
        'Bidi bind chaining'($) {
            const _foo = $mol_view_tree2_to_js_test_ex_bidi_chaining_foo;
            const foo = _foo.make({ $ });
            $mol_assert_like(foo.c(), foo.b(), foo.a());
        },
        'Bidi bind indexed'($) {
            const _foo = $mol_view_tree2_to_js_test_ex_bidi_indexed_foo;
            const foo = _foo.make({ $ });
            foo.owner(1, 'a');
            foo.owner(2, 'b'),
                $mol_assert_like(foo.owner(1), foo.indexed(1), 'a');
            $mol_assert_like(foo.owner(1, 'a2'), foo.indexed(1), 'a2');
            $mol_assert_like(foo.owner(2), foo.indexed(2), 'b');
        },
        'Bidi bind indexed second level'($) {
            const _foo = $mol_view_tree2_to_js_test_ex_bidi_indexed_second_level_foo;
            const _bar = $mol_view_tree2_to_js_test_ex_bidi_indexed_second_level_bar;
            _foo.$.$mol_view_tree2_to_js_test_ex_bidi_indexed_second_level_bar = _bar;
            const foo = _foo.make({ $ });
            foo.owner(1, 'a');
            foo.owner(2, 'b');
            $mol_assert_like(foo.owner(1), foo.indexed(1).expanded(), 'a');
            $mol_assert_like(foo.owner(2), foo.indexed(2).expanded(), 'b');
        },
        'Bidi bind doubing right part with same default'($) {
            const _foo = $mol_view_tree2_to_js_test_ex_bidi_doubing_right_part_with_same_default_foo;
            const foo = _foo.make({ $ });
            $mol_assert_like(foo.b(), foo.c(), foo.a(), false);
        },
        'Bidi bind with separate default in right part'($) {
            const _foo = $mol_view_tree2_to_js_test_ex_bidi_with_separate_default_in_right_part_foo;
            const foo = _foo.make({ $ });
            $mol_assert_like(foo.b(), foo.a());
        },
        'Bidi bind index from outer scope throws error'($) {
            $mol_assert_fail(() => {
                $mol_view_tree2_to_js_test_run(`
					Foo $mol_view
						a!? $mol_view
							expanded? <=> cell_test_expanded!? null
				`);
            }, `Required prop like some*? at \`.view.tree#4:22/20\`
<=>
.view.tree#4:18/3
expanded?
.view.tree#4:8/9
$mol_view
.view.tree#3:11/9
a!?
.view.tree#3:7/3`);
        },
        'Bidi bind with default object'($) {
            const _foo = $mol_view_tree2_to_js_test_ex_bidi_with_default_object_foo;
            const foo = _foo.make({ $ });
            const view = new $mol_object;
            foo.owner(view);
            $mol_assert_like(foo.owner(), foo.class(), view);
        },
        'Bidi bind localized default value'($) {
            const _foo = $mol_view_tree2_to_js_test_ex_bidi_localized_default_value_foo;
            const foo = _foo.make({ $ });
            $mol_assert_like(foo.b(), foo.a(), `$mol_view_tree2_to_js_test_ex_bidi_localized_default_value_foo_b`);
        },
        'Bidi bind localized in object'($) {
            const _foo = $mol_view_tree2_to_js_test_ex_bidi_localized_in_object_foo;
            const foo = _foo.make({ $ });
            $mol_assert_like(foo.obj().loc(), foo.outer(), `$mol_view_tree2_to_js_test_ex_bidi_localized_in_object_foo_outer`);
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    $mol_test({
        'Left bind read only'($) {
            const _foo = $mol_view_tree2_to_js_test_ex_left_read_only_foo;
            const foo = _foo.make({ $ });
            $mol_assert_like(foo.bar1(), 
            // @ts-ignore
            foo.bar1(2), foo.bar1(), foo.bar2(), 1);
            $mol_assert_like(foo.bar2(2), foo.bar1(), 2);
        },
        'Left bind second level index'($) {
            const _foo = $mol_view_tree2_to_js_test_ex_left_second_level_index_foo;
            const foo = _foo.make({ $ });
            $mol_assert_ok(foo.owner(1) instanceof $mol_object);
            $mol_assert_like(foo.some(1), foo.some(1), `$mol_view_tree2_to_js_test_ex_left_second_level_index_foo_some`);
            $mol_assert_equal(foo.owner(1), foo.cls(1));
            $mol_assert_equal(foo.owner(1).localized(), foo.some(1));
            $mol_assert_equal(foo.cls(2), foo.owner(2));
        },
        'Left bind in array and object'($) {
            const _foo = $mol_view_tree2_to_js_test_ex_left_in_array_and_object_foo;
            const foo = _foo.make({ $ });
            $mol_assert_equal(foo.obj().prop, foo.arr()[0], foo.Obj());
        },
        'Left bind with separate default and comment'($) {
            const _foo = $mol_view_tree2_to_js_test_ex_left_with_separate_default_and_comment_foo;
            const foo = _foo.make({ $ });
            $mol_assert_like(foo.Obj().rows(), [123]);
        },
        'Left bind chaining'($) {
            const _foo = $mol_view_tree2_to_js_test_ex_left_chaining_foo;
            const foo = _foo.make({ $ });
            $mol_assert_equal(foo.d(), foo.c(), foo.b(), foo.a(), 0);
            $mol_assert_equal(foo.d(1), foo.c(), foo.b(), foo.a(), 1);
            $mol_assert_equal(
            // @ts-ignore
            foo.a(2), 
            // @ts-ignore
            foo.b(2), foo.c(), foo.d(), 1);
            $mol_assert_equal(foo.c(2), foo.b(), foo.a(), 2);
            $mol_assert_equal(foo.d(1), 1);
            $mol_assert_equal(foo.d(3), foo.c(), foo.b(), foo.a(), 3);
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    $mol_test({
        'Array boolean'($) {
            const _foo = $mol_view_tree2_to_js_test_ex_array_boolean_foo;
            const foo = _foo.make({ $ });
            $mol_assert_like(foo.bar(), [false, true]);
        },
        'Array number'($) {
            const _foo = $mol_view_tree2_to_js_test_ex_array_number_foo;
            const foo = _foo.make({ $ });
            $mol_assert_like(foo.bar(), [
                Number.NaN,
                Number.NEGATIVE_INFINITY,
                Number.POSITIVE_INFINITY,
                0,
            ]);
        },
        'Array with types'($) {
            const _foo = $mol_view_tree2_to_js_test_ex_array_with_types_foo;
            const foo = _foo.make({ $ });
            $mol_assert_like(foo.arr(), []);
        },
        'Array of array or object'($) {
            const _foo = $mol_view_tree2_to_js_test_ex_array_of_array_or_object_foo;
            const foo = _foo.make({ $ });
            // type a1 = $mol_type_assert<
            // 	ReturnType<typeof foo.complex>,
            // 	readonly (readonly(number | string)[] | Record<string, number | string>)[]
            // >
            $mol_assert_like(foo.complex(), ['1', [true], ['1', 21], { a: 1, str: 'some' }]);
        },
        'Array inheritance'($) {
            const _bar = $mol_view_tree2_to_js_test_ex_array_inheritance_bar;
            $mol_assert_like(_bar.make({ $ }).arr(), ['v3', 'v1', 'v4']);
        },
        'Array spread other'($) {
            const _bar = $mol_view_tree2_to_js_test_ex_array_spread_other_bar;
            const bar = _bar.make({ $ });
            $mol_assert_like(bar.arr(), ['v2', 'v1']);
            $mol_assert_like(bar.arr()[1], bar.sup()[0]);
        },
        'Array slot'($) {
            const _foo = $mol_view_tree2_to_js_test_ex_array_slot_foo;
            const foo = _foo.make({ $ });
            $mol_assert_like(foo.foot(), [1, true, 'foot1', 2, 3, 'ins1', 1, 'ins2', 'foot2']);
        },
        'Array indexed'($) {
            const _foo = $mol_view_tree2_to_js_test_ex_array_indexed_foo;
            const foo = _foo.make({ $ });
            $mol_assert_like(foo.tags(1), ['t1', 't2']);
            $mol_assert_like(foo.slot(1), ['t2']);
        },
        'Array union'($) {
            const _foo = $mol_view_tree2_to_js_test_ex_array_union_foo;
            const foo = _foo.make({ $ });
            $mol_assert_like(foo.bar(), ['a', 'c', 'b']);
        },
        'Array constructor tuple'($) {
            const _foo = $mol_view_tree2_to_js_test_ex_array_constructor_tuple_foo;
            const foo = _foo.make({ $ });
            $mol_assert_like(foo.text_blob().tuple, ['123']);
            $mol_assert_like(foo.blobs(), [
                foo.text_blob(),
            ]);
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    $mol_test({
        'Right bind read only'($) {
            const _bar = $mol_view_tree2_to_js_test_ex_right_read_only_bar;
            const bar = _bar.make({ $: _bar.$ });
            $mol_assert_like(bar.Obj().a(1), bar.b(1));
        },
        'Right bind in left bind'($) {
            const _bar = $mol_view_tree2_to_js_test_ex_right_in_left_bar;
            const bar = _bar.make({ $: _bar.$ });
            $mol_assert_like(bar.foo(), bar.Cls());
            $mol_assert_like(bar.foo().a(), bar.Cls().a(), bar.b());
        },
        'Right bind indexed'($) {
            const _bar = $mol_view_tree2_to_js_test_ex_right_indexed_bar;
            const bar = _bar.make({ $: _bar.$ });
            $mol_assert_equal(bar.Cls(1).a(), bar.b(1));
            $mol_assert_like(bar.b(1), { some: 123 });
            $mol_assert_equal(bar.Cls(1).a() === bar.b(2), false);
        },
        'Right hierarchy'($) {
            const _foo = $mol_view_tree2_to_js_test_ex_right_hierarchy_foo;
            const foo = _foo.make({ $: _foo.$ });
            $mol_assert_like(foo.prj_user_id(1), 2);
        },
        'Right mixed args'($) {
            const _foo = $mol_view_tree2_to_js_test_ex_right_hierarchy_foo;
            const foo = _foo.make({ $: _foo.$ });
            foo.indexed_id = id => id + 25;
            $mol_assert_like(foo.indexed_title(1), 123);
            $mol_assert_like(foo.Indexed(0).id(), 25);
            $mol_assert_like(foo.Indexed(1).id(), 26);
            $mol_assert_like(foo.indexed_title(0, 2), 125);
        }
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    $mol_test({
        'simple empty class'($) {
            const _foo = $mol_view_tree2_to_js_test_ex_simple_empty_class_foo;
            $mol_assert_ok(_foo.make({ $ }) instanceof _foo);
        },
        'simple mutable and read only channels'($) {
            const _foo = $mol_view_tree2_to_js_test_ex_simple_mutable_and_read_only_foo;
            const foo = _foo.make({ $ });
            $mol_assert_equal(foo.readonly(), 
            // @ts-ignore
            foo.readonly(1), foo.readonly(), null);
            $mol_assert_equal(foo.mutable(), null);
            $mol_assert_equal(foo.mutable(2), foo.mutable(), 2);
        },
        'simple string channel'($) {
            const _foo = $mol_view_tree2_to_js_test_ex_simple_string_foo;
            $mol_assert_equal(_foo.make({ $ }).hardcoded(), 'First\nSecond');
            $mol_assert_equal(_foo.make({ $ }).localized(), `$mol_view_tree2_to_js_test_ex_simple_string_foo_localized`);
        },
        'simple default indexed channel'($) {
            const _foo = $mol_view_tree2_to_js_test_ex_simple_default_indexed_foo;
            const foo = _foo.make({ $ });
            $mol_assert_equal(foo.a_b(0, 1), foo.a_b(0), 1);
            $mol_assert_equal(foo.legacy(0, 1), foo.legacy(0), 1);
        },
        'simple throw if cyrillic name'($) {
            $mol_assert_fail(() => {
                $mol_view_tree2_to_js_test_run(`
					Foo $mol_object
						sub / <= Чlose_icon $mol_object
				`);
            }, `Required prop like some*? at \`.view.tree#3:16/10\`
<=
.view.tree#3:13/2
/
.view.tree#3:11/1
sub
.view.tree#3:7/3`);
        },
        'simple empty legacy indexed channel throws error'($) {
            $mol_assert_fail(() => {
                $mol_view_tree2_to_js_test_run(`
					Foo $mol_object
						a!? null
				`);
            }, 'Required prop like some*? at `.view.tree#3:7/3`');
            $mol_assert_fail(() => {
                $mol_view_tree2_to_js_test_run(`
					Foo $mol_object
						b! 1
				`);
            }, 'Required prop like some*? at `.view.tree#3:7/2`');
        },
        'simple two classes'($) {
            const _foo = $mol_view_tree2_to_js_test_ex_simple_two_classes_foo;
            const _bar = $mol_view_tree2_to_js_test_ex_simple_two_classes_bar;
            const a = _foo.make({ $ });
            const b = _bar.make({ $ });
            $mol_assert_ok(b instanceof _foo);
            $mol_assert_ok(b instanceof _bar);
            $mol_assert_equal(a.str(), 'some');
            $mol_assert_equal(b.str(), 'some2');
        },
        'simple commented node'($) {
            const { Foo } = $mol_view_tree2_to_js_test_run(`
				- Foo $mol_object
					a!? $mol_object
						expanded <=> cell_test_expanded!? null
			`);
            $mol_assert_ok(Foo === undefined);
        },
        'simple factory props'($) {
            const _foo = $mol_view_tree2_to_js_test_ex_simple_factory_props_foo;
            const foo = _foo.make({ $ });
            $mol_assert_ok(typeof foo.button().sub === 'function');
            $mol_assert_ok(typeof foo.button().some === 'function');
            $mol_assert_equal(foo.button().loc(), `$mol_view_tree2_to_js_test_ex_simple_factory_props_foo_button_loc`);
            $mol_assert_equal(foo.button().deep().loc, `$mol_view_tree2_to_js_test_ex_simple_factory_props_foo_button_deep_loc`);
            $mol_assert_equal(foo.button().sub()[0], 1);
        },
        'simple factory inheritance'($) {
            const _foo = $mol_view_tree2_to_js_test_ex_simple_factory_inheritance_foo;
            const foo = _foo.make({ $ });
            $mol_assert_equal(foo.Having().config(), { ips: ['127.0.0.1', '0.0.0.0', '1.1.1.1'] });
        },
        'simple nan'($) {
            const _foo = $mol_view_tree2_to_js_test_ex_simple_nan_foo;
            const foo = _foo.make({ $ });
            $mol_assert_equal(foo.a(), foo.b(), foo.c(), NaN);
            $mol_assert_equal(foo.d(), Infinity);
            $mol_assert_equal(foo.e(), -Infinity);
            $mol_assert_equal(foo.f(), Infinity);
        },
        'simple typed null'($) {
            const _foo = $mol_view_tree2_to_js_test_ex_simple_typed_null_foo;
            const foo = _foo.make({ $ });
            $mol_assert_equal(foo.a(), null);
        },
        'extra char'($) {
            $mol_assert_fail(() => {
                $mol_view_tree2_to_js_test_run(`
					Foo $mol_object
						item_чount 50
				`);
            }, 'Required prop like some*? at `.view.tree#3:7/10`');
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    $mol_test({
        'Structural channel'($) {
            const _foo = $mol_view_tree2_to_js_test_ex_structural_foo;
            $mol_assert_like(_foo.make({ $ }).bar(), {
                alpha: 1,
                beta: {},
                xxx: 2,
            });
        },
        'Structural dict'($) {
            const _foo = $mol_view_tree2_to_js_test_ex_structural_dict_foo;
            $mol_assert_like(_foo.make({ $ }).bar(), {
                alpha: 1,
                beta: 'a',
            });
        },
        'Structural channel with inheritance'($) {
            const _bar = $mol_view_tree2_to_js_test_ex_structural_with_inheritance_bar;
            $mol_assert_like(_bar.make({ $ }).field(), {
                yyy: 234,
                xxx: 123,
                xxy: 'test',
                zzz: 345,
            });
        },
        'Structural channel spread other'($) {
            const _foo = $mol_view_tree2_to_js_test_ex_structural_spread_other_foo;
            const foo = _foo.make({ $ });
            $mol_assert_like(foo.field(), {
                bbb: 321,
                aaa: 123,
            });
        },
        'Structural channel localized prop value'($) {
            const _foo = $mol_view_tree2_to_js_test_ex_structural_localized_prop_value_foo;
            const foo = _foo.make({ $ });
            $mol_assert_like(foo.bar(), {
                'loc': `$mol_view_tree2_to_js_test_ex_structural_localized_prop_value_foo_bar_loc`,
                'baz': { 'loc2': `$mol_view_tree2_to_js_test_ex_structural_localized_prop_value_foo_bar_baz_loc2` }
            });
        },
        'Structural channel quoted props'($) {
            const _foo = $mol_view_tree2_to_js_test_ex_structural_quoted_props_foo;
            $mol_assert_like(_foo.make({ $ }).bar(), {
                'a$': 1,
                'b-t': {},
            });
        },
        'Structural complex key'($) {
            const _foo = $mol_view_tree2_to_js_test_ex_structural_complex_key_foo;
            const foo = _foo.make({ $ });
            $mol_assert_like(foo.dictionary(), {
                'raw data key': '1',
                'key2': '2',
                'key3': '3'
            });
        }
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    function $mol_view_tree2_to_text(tree) {
        return this.$mol_tree2_js_to_text(this.$mol_view_tree2_to_js(tree));
    }
    $.$mol_view_tree2_to_text = $mol_view_tree2_to_text;
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    const d = '$';
    const demo_src = [
        `${d}bog_vmap_lang_test_demo ${d}mol_view`,
        `	Price ${d}mol_view title <= calc_result`,
        `	Hero ${d}mol_view sub / <= Price`,
        `	Calc ${d}bog_vmap_lang_test_calc`,
        `	calc_result = Calc result`,
        `	label \\Total`,
        `	sub / <= Hero`,
        ``,
    ].join('\n');
    const nested_src = [
        `${d}bog_vmap_lang_test_demo ${d}mol_view`,
        `	Calc ${d}bog_vmap_lang_test_calc`,
        `	calc_result = Calc result`,
        `	label \\Total`,
        `	sub /`,
        `		<= Hero ${d}mol_view`,
        `			sub /`,
        `				<= Price ${d}mol_view`,
        `					title <= calc_result`,
        ``,
    ].join('\n');
    const pair_src = [
        `${d}bog_vmap_lang_test_pair ${d}mol_view`,
        `	Calc ${d}bog_vmap_lang_test_calc`,
        `	Price ${d}mol_view`,
        `	sub /`,
        `		<= Calc`,
        `		<= Price`,
        ``,
    ].join('\n');
    const trio_src = [
        `${d}bog_vmap_lang_test_pair ${d}mol_view`,
        `	Calc ${d}bog_vmap_lang_test_calc`,
        `	Calc_2 ${d}bog_vmap_lang_test_calc`,
        `	Price ${d}mol_view`,
        `	Note ${d}mol_view`,
        `	sub /`,
        `		<= Calc`,
        `		<= Price`,
        ``,
    ].join('\n');
    const board_src = [
        `${d}bog_vmap_lang_test_board ${d}mol_view`,
        `	Head ${d}mol_view`,
        `	Foot ${d}mol_view`,
        `	Loose ${d}mol_view`,
        `	Board ${d}mol_view`,
        `		style *`,
        `			width \\1280px`,
        `			flexDirection \\column`,
        `		sub /`,
        `			<= Head`,
        `			<= Foot`,
        `	sub /`,
        `		<= Board`,
        `		<= Loose`,
        ``,
    ].join('\n');
    function lines_diff(left, right) {
        const a = left.split('\n');
        const b = right.split('\n');
        const diff = [];
        for (let i = 0; i < Math.max(a.length, b.length); ++i) {
            if (a[i] !== b[i])
                diff.push(i);
        }
        return diff;
    }
    function doc(src) {
        const node = $bog_vmap_lang_node.make({});
        node.source(src);
        return node;
    }
    function pair_doc() {
        const one = $bog_vmap_lang_doc.make({});
        one.source([
            `${d}bog_vmap_lang_test_one ${d}mol_view`,
            `	label \\Первая`,
            `	count 1`,
            `${d}bog_vmap_lang_test_two ${d}mol_view`,
            `	caption \\Вторая`,
            `	count 2`,
            ``,
        ].join('\n'));
        return one;
    }
    function js_of($, node) {
        const tree = node.tree();
        return $.$mol_tree2_text_to_string($.$mol_view_tree2_to_text(tree.list([tree])));
    }
    $mol_test({
        'round trip: editing one property moves exactly one line'($) {
            const node = doc(demo_src);
            const label = node.prop_tree('label');
            node.prop_tree('label', label.clone([label.data('Sum')]));
            $mol_assert_like(lines_diff(demo_src, node.source()), [5]);
            $mol_assert_equal(node.source().split('\n')[5], '\tlabel \\Sum');
        },
        'round trip: redrawing a wire moves exactly one line'($) {
            const node = doc(demo_src);
            node.wire_add({ name: 'calc_result', node: 'Calc', prop: 'total' });
            $mol_assert_like(lines_diff(demo_src, node.source()), [4]);
            $mol_assert_equal(node.source().split('\n')[4], '\tcalc_result = Calc total');
        },
        'class name change'($) {
            const node = doc(`${d}name ${d}mol_view\n`);
            $mol_assert_equal(node.name(), `${d}name`);
            node.name(`${d}changed`);
            $mol_assert_equal(node.source(), `${d}changed ${d}mol_view\n`);
        },
        'base class name change'($) {
            const node = doc(`${d}name ${d}mol_view\n`);
            $mol_assert_equal(node.base(), `${d}mol_view`);
            node.base(`${d}mol_object`);
            $mol_assert_equal(node.source(), `${d}name ${d}mol_object\n`);
        },
        'property add'($) {
            const node = doc(`${d}bog_vmap_lang_test_num ${d}mol_view\n\tvalue? NaN\n`);
            node.prop_add('items');
            $mol_assert_equal(node.source(), `${d}bog_vmap_lang_test_num ${d}mol_view\n\tvalue? NaN\n\titems null\n`);
        },
        'property drop'($) {
            const node = doc(`${d}bog_vmap_lang_test_num ${d}mol_view\n\tvalue? NaN\n\titems null\n`);
            node.prop_drop('items');
            $mol_assert_equal(node.source(), `${d}bog_vmap_lang_test_num ${d}mol_view value? NaN\n`);
        },
        'property name list'($) {
            const node = doc(demo_src);
            $mol_assert_like(node.prop_names(), ['Price', 'Hero', 'Calc', 'calc_result', 'label', 'sub']);
        },
        'signature by bare name'($) {
            const node = doc(`${d}bog_vmap_lang_test_sign ${d}mol_view\n\ta null\n\tb? null\n\tc* null\n\td*? null\n`);
            $mol_assert_equal(node.prop_fullname('a'), 'a');
            $mol_assert_equal(node.prop_fullname('b'), 'b?');
            $mol_assert_equal(node.prop_fullname('c'), 'c*');
            $mol_assert_equal(node.prop_fullname('d'), 'd*?');
        },
        'free part is declared at class level, without an operator'($) {
            const node = doc(demo_src);
            node.part_add('Sum', `${d}bog_vmap_lang_test_calc`);
            $mol_assert_equal(node.source(), demo_src + `\tSum ${d}bog_vmap_lang_test_calc\n`);
            const part = node.prop_tree('Sum');
            $mol_assert_equal(part.kids.length, 1);
            $mol_assert_equal(part.kids[0].type, `${d}bog_vmap_lang_test_calc`);
        },
        'reference inside sub carries no value'($) {
            const node = doc(demo_src);
            node.sub_add('Price');
            $mol_assert_equal(node.source(), demo_src.replace('\tsub / <= Hero\n', '\tsub /\n\t\t<= Hero\n\t\t<= Price\n'));
            const refs = node.prop_tree('sub').kids[0].kids;
            $mol_assert_like(refs.map(ref => ref.type), ['<=', '<=']);
            $mol_assert_like(refs.map(ref => ref.kids[0].kids.length), [0, 0]);
        },
        'dropping the last reference keeps an empty sub'($) {
            const node = doc(demo_src);
            node.sub_drop('Hero');
            $mol_assert_equal(node.source(), demo_src.replace('\tsub / <= Hero\n', '\tsub /\n'));
            $mol_assert_equal(node.prop_tree('sub').kids[0].kids.length, 0);
            $mol_assert_equal(node.prop_names().includes('Hero'), true);
        },
        'dropping one reference leaves the others in order'($) {
            const node = doc(demo_src);
            node.sub_add('Price');
            node.sub_add('Calc');
            node.sub_drop('Price');
            const refs = node.prop_tree('sub').kids[0].kids;
            $mol_assert_like(refs.map(ref => ref.kids[0].type), ['Hero', 'Calc']);
        },
        'dropping a reference that is not there changes nothing'($) {
            const node = doc(demo_src);
            node.sub_drop('Nope');
            $mol_assert_equal(node.source(), demo_src);
        },
        'wire compiles to a two link call'($) {
            const js = js_of($, doc(demo_src));
            $mol_assert_equal(js.includes('this.Calc().result()'), true);
            $mol_assert_equal(js.includes('this.calc_result()'), true);
        },
        'two way wire passes next through both ends'($) {
            const node = doc(`${d}bog_vmap_lang_test_bidi ${d}mol_view\n\tField ${d}mol_view\n\tsub / <= Field\n`);
            node.wire_add({ name: 'deep', node: 'Field', prop: 'value', bidi: true });
            $mol_assert_equal(node.source(), `${d}bog_vmap_lang_test_bidi ${d}mol_view\n\tField ${d}mol_view\n\tsub / <= Field\n\tdeep? = Field value?\n`);
            const js = js_of($, node);
            $mol_assert_equal(js.includes('deep(next){'), true);
            $mol_assert_equal(js.includes('this.Field().value(next)'), true);
        },
        'wire serializes to two tokens'($) {
            const one = $.$bog_vmap_lang_wire_tree({ name: 'calc_result', node: 'Calc', prop: 'result' });
            $mol_assert_equal(one.toString(), 'calc_result = Calc result\n');
            const two = $.$bog_vmap_lang_wire_tree({ name: 'deep', node: 'Field', prop: 'value', bidi: true });
            $mol_assert_equal(two.toString(), 'deep? = Field value?\n');
        },
        'trap: a reference with a child is not a wire'($) {
            $mol_assert_fail(() => $.$bog_vmap_lang_ref_tree('Calc result'), Error);
            const ref = $.$bog_vmap_lang_ref_tree('calc_result');
            $mol_assert_equal(ref.toString(), '<= calc_result\n');
            $mol_assert_equal(ref.kids[0].kids.length, 0);
        },
        'trap: a wire is never emitted with the `<=` operator'($) {
            const wire = $.$bog_vmap_lang_wire_tree({ name: 'w', node: 'Calc', prop: 'result' });
            $mol_assert_equal(wire.kids[0].type, '=');
        },
        'trap: a wire to an undeclared node is refused'($) {
            const node = doc(demo_src);
            $mol_assert_fail(() => node.wire_add({ name: 'w', node: 'Nope', prop: 'result' }), Error);
            $mol_assert_equal(node.source(), demo_src);
        },
        'trap: `?` on the right end only'($) {
            $mol_assert_fail(() => $.$bog_vmap_lang_wire_tree({ name: 'w', node: 'Field', prop: 'value?' }), Error);
        },
        'trap: `?` on the left end only'($) {
            $mol_assert_fail(() => $.$bog_vmap_lang_wire_tree({ name: 'w?', node: 'Field', prop: 'hint' }), Error);
        },
        'trap: more than two tokens'($) {
            $mol_assert_fail(() => $.$bog_vmap_lang_wire_tree({ name: 'w', node: 'A', prop: 'B value' }), Error);
            $mol_assert_fail(() => $.$bog_vmap_lang_wire_tree({ name: 'w', node: 'A B', prop: 'value' }), Error);
        },
        'trap: a key sign smuggled through a token'($) {
            $mol_assert_fail(() => $.$bog_vmap_lang_wire_tree({ name: 'w', node: 'Field', prop: 'value*' }), Error);
        },
        'property signature is edited through the model'($) {
            const node = doc(`${d}bog_vmap_lang_test_prop ${d}mol_view value null\n`);
            const prop = node.property('value');
            $mol_assert_equal(prop.title(), 'value');
            $mol_assert_equal(prop.key(), false);
            $mol_assert_equal(prop.next(), false);
            prop.next(true);
            $mol_assert_equal(node.source(), `${d}bog_vmap_lang_test_prop ${d}mol_view value? null\n`);
            $mol_assert_equal(node.property('value').next(), true);
            node.property('value').key(true);
            $mol_assert_equal(node.source(), `${d}bog_vmap_lang_test_prop ${d}mol_view value*? null\n`);
        },
        'normalize hoists nested declarations onto the root'($) {
            $mol_assert_equal(doc(nested_src).tree().toString(), demo_src);
            $mol_assert_equal(doc(demo_src).tree().toString(), demo_src);
        },
        'an empty source says so instead of throwing on undefined'($) {
            $mol_assert_fail(() => doc('').tree(), Error);
        },
        'declarations are sorted base first'($) {
            const of = (src) => doc(src).tree();
            const leaf = of(`${d}bog_vmap_lang_test_leaf ${d}mol_view\n\ttitle \\L\n`);
            const top = of(`${d}bog_vmap_lang_test_top ${d}bog_vmap_lang_test_mid\n\ttitle \\T\n`);
            const mid = of(`${d}bog_vmap_lang_test_mid ${d}bog_vmap_lang_test_leaf\n\ttitle \\M\n`);
            $mol_assert_like($.$bog_vmap_lang_sorted([top, mid, leaf]).map(def => def.type), [
                `${d}bog_vmap_lang_test_leaf`,
                `${d}bog_vmap_lang_test_mid`,
                `${d}bog_vmap_lang_test_top`,
            ]);
        },
        'a base the document does not declare is left alone'($) {
            const one = doc(demo_src).tree();
            $mol_assert_like($.$bog_vmap_lang_sorted([one]).map(def => def.type), [one.type]);
        },
        'a cycle of bases fails instead of hanging'($) {
            const a = doc(`${d}bog_vmap_lang_test_a ${d}bog_vmap_lang_test_b\n\tx \\1\n`).tree();
            const b = doc(`${d}bog_vmap_lang_test_b ${d}bog_vmap_lang_test_a\n\ty \\2\n`).tree();
            $mol_assert_fail(() => $.$bog_vmap_lang_sorted([a, b]), Error);
        },
        'editing one class leaves its neighbours byte for byte'($) {
            const d1 = pair_doc();
            const before = d1.class_source(`${d}bog_vmap_lang_test_two`);
            d1.node(`${d}bog_vmap_lang_test_one`).prop_tree('label', $mol_tree2.struct('label', [$mol_tree2.data('Изменено')]));
            $mol_assert_equal(d1.class_source(`${d}bog_vmap_lang_test_two`), before);
            $mol_assert_like(d1.names(), [
                `${d}bog_vmap_lang_test_one`,
                `${d}bog_vmap_lang_test_two`,
            ]);
        },
        'the edit itself lands in the class it was made on'($) {
            const d1 = pair_doc();
            d1.node(`${d}bog_vmap_lang_test_one`).prop_tree('label', $mol_tree2.struct('label', [$mol_tree2.data('Изменено')]));
            $mol_assert_equal(d1.node(`${d}bog_vmap_lang_test_one`).prop_tree('label').toString().trim(), 'label \\Изменено');
        },
        'a write through a class does not deafen the document to its own text'($) {
            const d1 = pair_doc();
            d1.node(`${d}bog_vmap_lang_test_one`).prop_tree('label', $mol_tree2.struct('label', [$mol_tree2.data('Изменено')]));
            d1.source(`${d}bog_vmap_lang_test_three ${d}mol_view\n\tx \\1\n`);
            $mol_assert_like(d1.names(), [`${d}bog_vmap_lang_test_three`]);
        },
        'a node under a name the document lacks appends a class'($) {
            const d1 = pair_doc();
            d1.node(`${d}bog_vmap_lang_test_new`).source(`${d}bog_vmap_lang_test_new ${d}mol_view\n\tz \\9\n`);
            $mol_assert_like(d1.names(), [
                `${d}bog_vmap_lang_test_one`,
                `${d}bog_vmap_lang_test_two`,
                `${d}bog_vmap_lang_test_new`,
            ]);
        },
        'a class of the document reads back as its own source'($) {
            const d1 = pair_doc();
            $mol_assert_equal(d1.class_source(`${d}bog_vmap_lang_test_two`), `${d}bog_vmap_lang_test_two ${d}mol_view\n\tcaption \\Вторая\n\tcount 2\n`);
        },
        'the document glues its classes back with no separator'($) {
            const d1 = pair_doc();
            d1.node(`${d}bog_vmap_lang_test_one`).prop_tree('count', $mol_tree2.struct('count', [$mol_tree2.struct('7')]));
            $mol_assert_equal(d1.source(), [
                `${d}bog_vmap_lang_test_one ${d}mol_view`,
                `	label \\Первая`,
                `	count 7`,
                `${d}bog_vmap_lang_test_two ${d}mol_view`,
                `	caption \\Вторая`,
                `	count 2`,
                ``,
            ].join('\n'));
        },
        'renaming a class touches the class name alone'($) {
            const d1 = pair_doc();
            d1.class_rename(`${d}bog_vmap_lang_test_one`, `${d}my_site_page`);
            $mol_assert_equal(d1.source(), [
                `${d}my_site_page ${d}mol_view`,
                `	label \\Первая`,
                `	count 1`,
                `${d}bog_vmap_lang_test_two ${d}mol_view`,
                `	caption \\Вторая`,
                `	count 2`,
                ``,
            ].join('\n'));
        },
        'a rename rewrites the mentions of the class in its neighbours'($) {
            const d1 = $bog_vmap_lang_doc.make({});
            d1.source([
                `${d}bog_vmap_lang_test_base ${d}mol_view`,
                `	label \\Первая`,
                `${d}bog_vmap_lang_test_heir ${d}bog_vmap_lang_test_base`,
                `	Card ${d}bog_vmap_lang_test_base`,
                `	sub / <= Card`,
                ``,
            ].join('\n'));
            d1.class_rename(`${d}bog_vmap_lang_test_base`, `${d}bog_vmap_lang_test_root`);
            $mol_assert_equal(d1.source(), [
                `${d}bog_vmap_lang_test_root ${d}mol_view label \\Первая`,
                `${d}bog_vmap_lang_test_heir ${d}bog_vmap_lang_test_root`,
                `	Card ${d}bog_vmap_lang_test_root`,
                `	sub / <= Card`,
                ``,
            ].join('\n'));
        },
        'a rename does not reach into a string'($) {
            const d1 = $bog_vmap_lang_doc.make({});
            d1.source(`${d}bog_vmap_lang_test_one ${d}mol_view\n\tlabel \\${d}bog_vmap_lang_test_one\n`);
            d1.class_rename(`${d}bog_vmap_lang_test_one`, `${d}bog_vmap_lang_test_four`);
            $mol_assert_equal(d1.source(), `${d}bog_vmap_lang_test_four ${d}mol_view label \\${d}bog_vmap_lang_test_one\n`);
        },
        'a rename onto a name the document already carries is refused'($) {
            const d1 = pair_doc();
            $mol_assert_fail(() => d1.class_rename(`${d}bog_vmap_lang_test_one`, `${d}bog_vmap_lang_test_two`), Error);
            $mol_assert_like(d1.names(), [
                `${d}bog_vmap_lang_test_one`,
                `${d}bog_vmap_lang_test_two`,
            ]);
        },
        'a rename moves the selector of the class and of its nodes'($) {
            const css = '[my_site_page] {\n\tcolor: red;\n}\n\n[my_site_page_calc] {\n\tflex: 1;\n}\n';
            const next = $.$bog_vmap_lang_css_rename(css, `${d}my_site_page`, `${d}my_shop_page`);
            $mol_assert_equal(next, '[my_shop_page] {\n\tcolor: red;\n}\n\n[my_shop_page_calc] {\n\tflex: 1;\n}\n');
        },
        'a rename leaves the rules of other classes where they were'($) {
            const css = '[mol_view] {\n\tcolor: red;\n}\n\n[my_site_pager] {\n\tflex: 1;\n}\n';
            $mol_assert_equal($.$bog_vmap_lang_css_rename(css, `${d}my_site_page`, `${d}my_shop_page`), css);
        },
        'a rename moves the mentions of the class inside a body'($) {
            const js = `title() {\n\treturn this.$.${d}my_site_page_calc ? '${d}my_site_page' : ''\n}\n`;
            $mol_assert_equal($.$bog_vmap_lang_js_rename(js, `${d}my_site_page`, `${d}my_shop_page`), `title() {\n\treturn this.$.${d}my_site_page_calc ? '${d}my_shop_page' : ''\n}\n`);
        },
        'a class renamed and renamed back gives the styles and the body byte for byte'($) {
            const css = '[my_site_page] {\n\tcolor: red;\n}\n\n[my_site_page_calc] {\n\tflex: 1;\n}\n';
            const js = `title() {\n\treturn '${d}my_site_page'\n}\n`;
            const from = `${d}my_site_page`;
            const to = `${d}my_shop_page`;
            $mol_assert_equal($.$bog_vmap_lang_css_rename($.$bog_vmap_lang_css_rename(css, from, to), to, from), css);
            $mol_assert_equal($.$bog_vmap_lang_js_rename($.$bog_vmap_lang_js_rename(js, from, to), to, from), js);
        },
        'a rename of a class the document lacks is refused'($) {
            const d1 = pair_doc();
            $mol_assert_fail(() => d1.class_rename(`${d}bog_vmap_lang_test_absent`, `${d}bog_vmap_lang_test_four`), Error);
        },
        'a link writes exactly two lines, in canonical form'($) {
            const node = doc(pair_src);
            const name = node.link_add({ from: 'Calc', from_prop: 'result', to: 'Price', to_prop: 'title' });
            $mol_assert_equal(name, 'calc_result');
            $mol_assert_equal(node.source(), [
                `${d}bog_vmap_lang_test_pair ${d}mol_view`,
                `	Calc ${d}bog_vmap_lang_test_calc`,
                `	Price ${d}mol_view title <= calc_result`,
                `	sub /`,
                `		<= Calc`,
                `		<= Price`,
                `	calc_result = Calc result`,
                ``,
            ].join('\n'));
            $mol_assert_like(node.links(), [
                { from: 'Calc', from_prop: 'result', to: 'Price', to_prop: 'title', name: 'calc_result', bidi: false },
            ]);
        },
        'a repeated link does not duplicate anything'($) {
            const node = doc(pair_src);
            node.link_add({ from: 'Calc', from_prop: 'result', to: 'Price', to_prop: 'title' });
            const once = node.source();
            node.link_add({ from: 'Calc', from_prop: 'result', to: 'Price', to_prop: 'title' });
            $mol_assert_equal(node.source(), once);
            $mol_assert_equal(node.links().length, 1);
        },
        'one wire feeds two ports and survives the drop of one of them'($) {
            const node = doc(pair_src);
            node.link_add({ from: 'Calc', from_prop: 'result', to: 'Price', to_prop: 'title' });
            node.link_add({ from: 'Calc', from_prop: 'result', to: 'Price', to_prop: 'hint' });
            $mol_assert_equal(node.wires().length, 1);
            $mol_assert_equal(node.links().length, 2);
            node.link_drop('Price', 'hint');
            $mol_assert_equal(node.wires().length, 1);
            $mol_assert_equal(node.links().length, 1);
        },
        'unplugging removes both lines'($) {
            const node = doc(pair_src);
            node.link_add({ from: 'Calc', from_prop: 'result', to: 'Price', to_prop: 'title' });
            node.link_drop('Price', 'title');
            $mol_assert_equal(node.source(), pair_src);
            $mol_assert_equal(node.links().length, 0);
            $mol_assert_equal(node.wires().length, 0);
        },
        'unplugging a port that is not wired changes nothing'($) {
            const node = doc(pair_src);
            node.link_drop('Price', 'title');
            $mol_assert_equal(node.source(), pair_src);
        },
        'unwiring a part takes both ends of its own wires and no others'($) {
            const node = doc(trio_src);
            node.link_add({ from: 'Calc', from_prop: 'result', to: 'Price', to_prop: 'title' });
            node.link_add({ from: 'Calc', from_prop: 'result', to: 'Note', to_prop: 'title' });
            node.link_add({ from: 'Calc_2', from_prop: 'result', to: 'Note', to_prop: 'hint' });
            node.links_drop('Calc');
            $mol_assert_like(node.links().map(link => [link.from, link.to, link.to_prop]), [['Calc_2', 'Note', 'hint']]);
            $mol_assert_like(node.wires().map(wire => wire.name), ['calc_2_result']);
            $mol_assert_equal(node.source().includes('calc_result'), false);
            $mol_assert_ok(node.prop_names().includes('Calc'));
        },
        'unwiring a part takes its wire even when nobody reads it'($) {
            const node = doc(trio_src);
            node.wire_add({ name: 'calc_result', node: 'Calc', prop: 'result', bidi: false });
            $mol_assert_like(node.wires().map(wire => wire.name), ['calc_result']);
            $mol_assert_like(node.links(), []);
            node.links_drop('Calc');
            $mol_assert_like(node.wires(), []);
            $mol_assert_equal(node.source().includes('calc_result'), false);
        },
        'unwiring a consumer keeps the wire while another consumer holds it'($) {
            const node = doc(trio_src);
            node.link_add({ from: 'Calc', from_prop: 'result', to: 'Price', to_prop: 'title' });
            node.link_add({ from: 'Calc', from_prop: 'result', to: 'Note', to_prop: 'title' });
            node.links_drop('Price');
            $mol_assert_like(node.links().map(link => [link.from, link.to]), [['Calc', 'Note']]);
            $mol_assert_ok(node.source().includes('\tcalc_result = Calc result\n'));
            $mol_assert_equal(node.source().includes('Price ' + `${d}mol_view title`), false);
            node.links_drop('Note');
            $mol_assert_like(node.links(), []);
            $mol_assert_equal(node.source().includes('calc_result'), false);
        },
        'a two way link puts the sign on both ends of both lines'($) {
            const node = doc(pair_src);
            node.link_add({ from: 'Calc', from_prop: 'value', to: 'Price', to_prop: 'title', bidi: true });
            const lines = node.source().split('\n');
            $mol_assert_equal(lines.includes('\tcalc_value? = Calc value?'), true);
            $mol_assert_equal(lines.includes('\tPrice $mol_view title? <=> calc_value?'.replace('$', d)), true);
            $mol_assert_equal(node.links()[0].bidi, true);
            const js = js_of($, node);
            $mol_assert_equal(js.includes('this.Calc().value(next)'), true);
        },
        'a link takes a free name when the obvious one is taken'($) {
            const node = doc(pair_src);
            node.prop_add('calc_result');
            const name = node.link_add({ from: 'Calc', from_prop: 'result', to: 'Price', to_prop: 'title' });
            $mol_assert_equal(name, 'calc_result_2');
            $mol_assert_equal(node.prop_tree('calc_result').kids[0].type, 'null');
        },
        'a link to an undeclared part is refused and writes nothing'($) {
            const node = doc(pair_src);
            $mol_assert_fail(() => node.link_add({ from: 'Calc', from_prop: 'result', to: 'Nope', to_prop: 'title' }), Error);
            $mol_assert_fail(() => node.link_add({ from: 'Nope', from_prop: 'result', to: 'Price', to_prop: 'title' }), Error);
            $mol_assert_fail(() => node.link_add({ from: 'Calc', from_prop: 'result', to: 'Calc', to_prop: 'title' }), Error);
            $mol_assert_equal(node.source(), pair_src);
        },
        'a loop of wires is refused with the reason'($) {
            const node = doc(pair_src);
            node.link_add({ from: 'Calc', from_prop: 'result', to: 'Price', to_prop: 'title' });
            const before = node.source();
            let message = '';
            try {
                node.link_add({ from: 'Price', from_prop: 'title', to: 'Calc', to_prop: 'hint' });
            }
            catch (error) {
                message = error.message;
            }
            $mol_assert_equal(/loop/.test(message), true);
            $mol_assert_equal(node.source(), before);
        },
        'trap: a link never emits a reference with a child or a sign on one end'($) {
            const node = doc(pair_src);
            $mol_assert_fail(() => node.link_add({ from: 'Calc', from_prop: 'result', to: 'Price', to_prop: 'title?' }), Error);
            $mol_assert_fail(() => node.link_add({ from: 'Calc', from_prop: 'result?', to: 'Price', to_prop: 'title' }), Error);
            $mol_assert_fail(() => node.link_add({ from: 'Calc', from_prop: 'Inner result', to: 'Price', to_prop: 'title' }), Error);
            $mol_assert_fail(() => node.link_add({ from: 'Calc', from_prop: 'result', to: 'Price', to_prop: 'a b' }), Error);
            $mol_assert_equal(node.source(), pair_src);
            node.link_add({ from: 'Calc', from_prop: 'result', to: 'Price', to_prop: 'title' });
            const over = node.prop_tree('Price').kids[0].kids[0];
            $mol_assert_equal(over.type, 'title');
            $mol_assert_equal(over.kids[0].type, '<=');
            $mol_assert_equal(over.kids[0].kids[0].kids.length, 0);
            const wire = node.prop_tree('calc_result');
            $mol_assert_equal(wire.kids[0].type, '=');
            $mol_assert_equal(wire.kids[0].kids.length, 1);
            $mol_assert_equal(wire.kids[0].kids[0].kids.length, 1);
            $mol_assert_equal(wire.kids[0].kids[0].kids[0].kids.length, 0);
        },
        'a document with an artboard round trips byte for byte'($) {
            $mol_assert_equal(doc(board_src).source(), board_src);
        },
        'a node with a sub of its own is a container, one without is not'($) {
            const node = doc(board_src);
            $mol_assert_like(node.sub_names(), ['Board', 'Loose']);
            $mol_assert_like(node.sub_names('Board'), ['Head', 'Foot']);
            $mol_assert_equal(node.sub_names('Loose'), null);
            $mol_assert_equal(node.sub_names('Nobody'), null);
            $mol_assert_equal(node.sub_names('sub'), null);
            $mol_assert_equal(node.over_tree('sub', 'sub'), null);
            $mol_assert_equal(node.sub_holder('Head'), 'Board');
            $mol_assert_equal(node.sub_holder('Loose'), '');
            $mol_assert_equal(node.sub_holder('Nobody'), null);
        },
        'a node is inserted into sub at the head, in the middle and at the tail'($) {
            const at_head = doc(board_src);
            at_head.sub_insert('Loose', 0, 'Board');
            $mol_assert_like(at_head.sub_names('Board'), ['Loose', 'Head', 'Foot']);
            const between = doc(board_src);
            between.sub_insert('Loose', 1, 'Board');
            $mol_assert_like(between.sub_names('Board'), ['Head', 'Loose', 'Foot']);
            const at_tail = doc(board_src);
            at_tail.sub_insert('Loose', 2, 'Board');
            $mol_assert_like(at_tail.sub_names('Board'), ['Head', 'Foot', 'Loose']);
            const refs = between.sub_list('Board').kids;
            $mol_assert_like(refs.map(ref => ref.type), ['<=', '<=', '<=']);
            $mol_assert_like(refs.map(ref => ref.kids[0].kids.length), [0, 0, 0]);
        },
        'insertion touches the sub and nothing around it'($) {
            const node = doc(board_src);
            node.sub_insert('Loose', 1, 'Board');
            const lines = node.source().split('\n');
            $mol_assert_like(lines.slice(0, 10), board_src.split('\n').slice(0, 10));
            $mol_assert_equal(lines[10], '\t\t\t<= Loose');
            $mol_assert_equal(lines.length, board_src.split('\n').length + 1);
            const style = node.over_tree('Board', 'style').kids[0];
            $mol_assert_like(style.kids.map(kid => kid.type), ['width', 'flexDirection']);
        },
        'a node moves from the canvas into an artboard and back'($) {
            const node = doc(board_src);
            node.sub_move('Loose', 1, 'Board');
            $mol_assert_like(node.sub_names(), ['Board']);
            $mol_assert_like(node.sub_names('Board'), ['Head', 'Loose', 'Foot']);
            node.sub_move('Loose', 0);
            $mol_assert_like(node.sub_names(), ['Loose', 'Board']);
            $mol_assert_like(node.sub_names('Board'), ['Head', 'Foot']);
            $mol_assert_equal(node.prop_names().includes('Loose'), true);
        },
        'moving inside one parent counts positions on the list the user saw'($) {
            const node = doc(board_src);
            node.sub_move('Head', 2, 'Board');
            $mol_assert_like(node.sub_names('Board'), ['Foot', 'Head']);
            node.sub_move('Head', 0, 'Board');
            $mol_assert_like(node.sub_names('Board'), ['Head', 'Foot']);
        },
        'a node cannot be put inside itself or under its own child'($) {
            const node = doc(board_src);
            $mol_assert_fail(() => node.sub_insert('Board', 0, 'Board'), Error);
            $mol_assert_fail(() => node.sub_move('Board', 0, 'Head'), Error);
            $mol_assert_equal(node.source(), board_src);
        },
        'deleting reaches the sub of an artboard, not only the sub of the class'($) {
            const node = doc(board_src);
            node.sub_drop('Head');
            $mol_assert_like(node.sub_names('Board'), ['Foot']);
            $mol_assert_like(node.sub_names(), ['Board', 'Loose']);
            node.prop_drop('Head');
            $mol_assert_equal(node.prop_names().includes('Head'), false);
        },
        'a node is opened into a container by an empty sub'($) {
            const node = doc(board_src);
            node.sub_open('Loose');
            $mol_assert_like(node.sub_names('Loose'), []);
            node.sub_open('Board');
            $mol_assert_like(node.sub_names('Board'), ['Head', 'Foot']);
        },
        'a dictionary key is set, replaced where it stands and dropped'($) {
            const node = doc(board_src);
            const style = node.over_tree('Board', 'style').kids[0];
            $mol_assert_equal($bog_vmap_lang_dict_get(style, 'width').type, '');
            $mol_assert_equal($bog_vmap_lang_dict_get(style, 'width').value, '1280px');
            $mol_assert_equal($bog_vmap_lang_dict_get(style, 'gap'), null);
            const narrow = $.$bog_vmap_lang_dict_set(style, 'width', style.data('390px'));
            $mol_assert_like(narrow.kids.map(kid => kid.type), ['width', 'flexDirection']);
            $mol_assert_equal($bog_vmap_lang_dict_get(narrow, 'width').value, '390px');
            const gapped = $.$bog_vmap_lang_dict_set(style, 'gap', style.data('1rem'));
            $mol_assert_like(gapped.kids.map(kid => kid.type), ['width', 'flexDirection', 'gap']);
            const bare = $.$bog_vmap_lang_dict_set(style, 'width', null);
            $mol_assert_like(bare.kids.map(kid => kid.type), ['flexDirection']);
            $mol_assert_fail(() => $.$bog_vmap_lang_dict_set(style, 'a b', style.data('1')), Error);
        },
        'a dictionary key never moves the inherited head'($) {
            const dict = $mol_tree2.struct('*', [$mol_tree2.struct('^')]);
            const one = $.$bog_vmap_lang_dict_set(dict, 'flexGrow', dict.data('1'));
            $mol_assert_like(one.kids.map(kid => kid.type), ['^', 'flexGrow']);
            const two = $.$bog_vmap_lang_dict_set(one, 'flexGrow', dict.data('2'));
            $mol_assert_like(two.kids.map(kid => kid.type), ['^', 'flexGrow']);
            $mol_assert_equal($bog_vmap_lang_dict_get(two, 'flexGrow').value, '2');
        },
        'links are read back from a hand written document'($) {
            const node = doc(demo_src);
            $mol_assert_like(node.links(), [
                { from: 'Calc', from_prop: 'result', to: 'Price', to_prop: 'title', name: 'calc_result', bidi: false },
            ]);
            $mol_assert_like(doc(`${d}bog_vmap_lang_test_x ${d}mol_view\n\tlabel \\a\n\tP ${d}mol_view title <= label\n`).links(), []);
        },
        'renaming a node rewrites the wire that reads it'($) {
            const node = doc(demo_src);
            node.property('Calc').title('Motor');
            $mol_assert_equal(node.source(), demo_src.replace(/Calc(?= |\n)/g, 'Motor'));
            $mol_assert_like(node.prop_names(), ['Price', 'Hero', 'Motor', 'calc_result', 'label', 'sub']);
            $mol_assert_like(node.links(), [
                { from: 'Motor', from_prop: 'result', to: 'Price', to_prop: 'title', name: 'calc_result', bidi: false },
            ]);
        },
        'renaming a node rewrites the sub that draws it'($) {
            const node = doc(demo_src);
            node.property('Hero').title('Stage');
            $mol_assert_like(node.sub_names(), ['Stage']);
            $mol_assert_equal(node.sub_holder('Stage'), '');
            $mol_assert_equal(node.sub_holder('Hero'), null);
            $mol_assert_like(node.sub_names('Stage'), ['Price']);
        },
        'renaming a wire rewrites the binding that reads it'($) {
            const node = doc(demo_src);
            node.property('calc_result').title('total');
            $mol_assert_like(node.links(), [
                { from: 'Calc', from_prop: 'result', to: 'Price', to_prop: 'title', name: 'total', bidi: false },
            ]);
            $mol_assert_equal(node.source().includes('title <= total'), true);
            $mol_assert_equal(node.source().includes('calc_result'), false);
        },
        'a reader of the name recomputes on a rename'($) {
            const node = doc(demo_src);
            const reader = $mol_wire_atom.solo(node, function names_reader() {
                return this.prop_names().join(' ');
            });
            $mol_assert_equal(reader.sync().includes('Calc'), true);
            node.property('Calc').title('Motor');
            $mol_assert_equal(reader.sync().includes('Motor'), true);
            $mol_assert_equal(reader.sync().includes('Calc'), false);
            $mol_assert_equal(node.property('Calc').title(), '');
            $mol_assert_equal(node.property('Motor').title(), 'Motor');
        },
        'a rename onto a name already declared is refused'($) {
            const node = doc(demo_src);
            $mol_assert_fail(() => node.property('Calc').title('Price'), Error);
            $mol_assert_equal(node.source(), demo_src);
        },
        'a rename carries the sign of the property'($) {
            const node = doc(`${d}bog_vmap_lang_test_sign ${d}mol_view value? null\n`);
            node.property('value').title('title');
            $mol_assert_equal(node.source(), `${d}bog_vmap_lang_test_sign ${d}mol_view title? null\n`);
            $mol_assert_equal(node.property('title').next(), true);
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    const d = '$';
    const defs = ($, src) => $.$mol_tree2_from_string(src).kids;
    const names = (trees) => trees.map(tree => tree.type).join(' ');
    $mol_test({
        'the document comes after the libraries'($) {
            const libs = defs($, `${d}l_a ${d}mol_view\n${d}l_b ${d}l_a\n`);
            const doc = defs($, `${d}doc ${d}l_b\n${d}doc_part ${d}mol_view\n`);
            $mol_assert_equal(names($.$bog_vmap_scene_order(libs, doc)), `${d}l_a ${d}l_b ${d}doc ${d}doc_part`);
        },
        'a heir written above its base moves below it'($) {
            const libs = defs($, `${d}l_b ${d}l_a\n${d}l_a ${d}mol_view\n`);
            $mol_assert_equal(names($.$bog_vmap_scene_order(libs, [])), `${d}l_a ${d}l_b`);
        },
        'a base the list does not declare is left to the sandbox'($) {
            const doc = defs($, `${d}doc ${d}mol_button_minor\n`);
            $mol_assert_equal(names($.$bog_vmap_scene_order([], doc)), `${d}doc`);
        },
        'a document class shadows a library class of the same name'($) {
            const libs = defs($, `${d}x ${d}mol_view\n\tfrom_lib \\\n`);
            const doc = defs($, `${d}x ${d}mol_view\n\tfrom_doc \\\n`);
            const sorted = $.$bog_vmap_scene_order(libs, doc);
            $mol_assert_equal(names(sorted), `${d}x`);
            $mol_assert_equal(sorted[0].kids[0].kids[0].type, 'from_doc');
        },
        'a cycle is a readable failure'($) {
            const libs = defs($, `${d}a ${d}b\n${d}b ${d}a\n`);
            $mol_assert_fail(() => $.$bog_vmap_scene_order(libs, []), `Circular inheritance around ${d}a`);
        },
        'nothing in gives nothing out'($) {
            $mol_assert_equal($.$bog_vmap_scene_order([], []).length, 0);
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    $mol_test({
        'Vector limiting'() {
            let point = new $mol_vector_3d(7, 10, 13);
            const res = point.limited([[1, 5], [15, 20], [5, 10]]);
            $mol_assert_equal(res.x, 5);
            $mol_assert_equal(res.y, 15);
            $mol_assert_equal(res.z, 10);
        },
        'Vector adding scalar'() {
            let point = new $mol_vector_3d(1, 2, 3);
            let res = point.added0(5);
            $mol_assert_equal(res.x, 6);
            $mol_assert_equal(res.y, 7);
            $mol_assert_equal(res.z, 8);
        },
        'Vector adding vector'() {
            let point = new $mol_vector_3d(1, 2, 3);
            let res = point.added1([5, 10, 15]);
            $mol_assert_equal(res.x, 6);
            $mol_assert_equal(res.y, 12);
            $mol_assert_equal(res.z, 18);
        },
        'Vector multiplying scalar'() {
            let point = new $mol_vector_3d(2, 3, 4);
            let res = point.multed0(-1);
            $mol_assert_equal(res.x, -2);
            $mol_assert_equal(res.y, -3);
            $mol_assert_equal(res.z, -4);
        },
        'Vector multiplying vector'() {
            let point = new $mol_vector_3d(2, 3, 4);
            let res = point.multed1([5, 2, -2]);
            $mol_assert_equal(res.x, 10);
            $mol_assert_equal(res.y, 6);
            $mol_assert_equal(res.z, -8);
        },
        'Matrix adding matrix'() {
            let matrix = new $mol_vector_matrix(...[[1, 2], [3, 4], [5, 6]]);
            let res = matrix.added2([[10, 20], [30, 40], [50, 60]]);
            $mol_assert_equal(res[0][0], 11);
            $mol_assert_equal(res[0][1], 22);
            $mol_assert_equal(res[1][0], 33);
            $mol_assert_equal(res[1][1], 44);
            $mol_assert_equal(res[2][0], 55);
            $mol_assert_equal(res[2][1], 66);
        },
        'Matrix multiplying matrix'() {
            let matrix = new $mol_vector_matrix(...[[2, 3], [4, 5], [6, 7]]);
            let res = matrix.multed2([[2, 3], [4, 5], [6, 7]]);
            $mol_assert_equal(res[0][0], 4);
            $mol_assert_equal(res[0][1], 9);
            $mol_assert_equal(res[1][0], 16);
            $mol_assert_equal(res[1][1], 25);
            $mol_assert_equal(res[2][0], 36);
            $mol_assert_equal(res[2][1], 49);
        },
        'Range expanding'() {
            let range = $mol_vector_range_full.inversed;
            const expanded = range.expanded0(10).expanded0(5);
            $mol_assert_like([...expanded], [5, 10]);
        },
        'Vector of range expanding by vector'() {
            let dimensions = new $mol_vector_2d($mol_vector_range_full.inversed, $mol_vector_range_full.inversed);
            const expanded = dimensions.expanded1([1, 7]).expanded1([3, 5]);
            $mol_assert_like([...expanded.x], [1, 3]);
            $mol_assert_like([...expanded.y], [5, 7]);
        },
        'Vector of range expanding by vector of range'() {
            let dimensions = new $mol_vector_2d($mol_vector_range_full.inversed, $mol_vector_range_full.inversed);
            const expanded = dimensions
                .expanded2([[1, 3], [7, 9]])
                .expanded2([[2, 4], [6, 8]]);
            $mol_assert_like([...expanded.x], [1, 4]);
            $mol_assert_like([...expanded.y], [6, 9]);
        },
        'Vector of infinity range expanding by vector of range'() {
            let dimensions = new $mol_vector_2d($mol_vector_range_full.inversed, $mol_vector_range_full.inversed);
            const next = new $mol_vector_2d($mol_vector_range_full.inversed, $mol_vector_range_full.inversed);
            const expanded = next
                .expanded2(dimensions);
            $mol_assert_like([...expanded.x], [Infinity, -Infinity]);
            $mol_assert_like([...expanded.y], [Infinity, -Infinity]);
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    const view = { x: 0, y: 0, width: 1000, height: 800 };
    const box = (x, y, width = 100, height = 40) => ({ x, y, width, height });
    $mol_test({
        'a part inside the viewport is shown'($) {
            const shown = $bog_vmap_scene_cull({ A: { x: 100, y: 100 } }, { A: box(100, 100) }, view, 0, ['A']);
            $mol_assert_equal(shown.has('A'), true);
        },
        'a part far outside is dropped'($) {
            const shown = $bog_vmap_scene_cull({ A: { x: 5000, y: 5000 } }, { A: box(5000, 5000) }, view, 0, ['A']);
            $mol_assert_equal(shown.has('A'), false);
        },
        'a part that only overlaps by its size is shown'($) {
            const shown = $bog_vmap_scene_cull({ A: { x: -50, y: 100 } }, { A: box(-50, 100) }, view, 0, ['A']);
            $mol_assert_equal(shown.has('A'), true);
        },
        'slack widens the viewport on every side'($) {
            const spots = { A: { x: -300, y: 100 }, B: { x: 1200, y: 100 } };
            const sizes = { A: box(-300, 100), B: box(1200, 100) };
            const tight = $bog_vmap_scene_cull(spots, sizes, view, 0, ['A', 'B']);
            $mol_assert_equal(tight.size, 0);
            const loose = $bog_vmap_scene_cull(spots, sizes, view, 400, ['A', 'B']);
            $mol_assert_equal(loose.size, 2);
        },
        'a part nothing is known about is shown'($) {
            const shown = $bog_vmap_scene_cull({}, {}, view, 0, ['A']);
            $mol_assert_equal(shown.has('A'), true);
        },
        'a placed part with no measurement is judged by its spot'($) {
            const near = $bog_vmap_scene_cull({ A: { x: 100, y: 100 } }, {}, view, 0, ['A']);
            $mol_assert_equal(near.has('A'), true);
            const far = $bog_vmap_scene_cull({ A: { x: 5000, y: 5000 } }, {}, view, 0, ['A']);
            $mol_assert_equal(far.has('A'), false);
        },
        'placement wins over the last measured origin'($) {
            const shown = $bog_vmap_scene_cull({ A: { x: 100, y: 100 } }, { A: box(9000, 9000) }, view, 0, ['A']);
            $mol_assert_equal(shown.has('A'), true);
        },
        'only the names asked about come back'($) {
            const shown = $bog_vmap_scene_cull({ A: { x: 10, y: 10 }, B: { x: 10, y: 10 } }, {}, view, 0, ['A']);
            $mol_assert_like([...shown], ['A']);
        },
        'viewport of a camera is the screen divided by the zoom'($) {
            $mol_assert_like($bog_vmap_scene_cull_viewport({ x: 10, y: 20, zoom: 2 }, { width: 1000, height: 800 }), { x: 10, y: 20, width: 500, height: 400 });
            $mol_assert_like($bog_vmap_scene_cull_viewport({ x: 0, y: 0, zoom: .5 }, { width: 1000, height: 800 }), { x: 0, y: 0, width: 2000, height: 1600 });
        },
        'a zoom of zero does not make the world infinite'($) {
            $mol_assert_like($bog_vmap_scene_cull_viewport({ x: 0, y: 0, zoom: 0 }, { width: 1000, height: 800 }), { x: 0, y: 0, width: 1000, height: 800 });
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    $mol_test({
        'zero argument methods of a body become cells, the rest stay methods'($) {
            class Probe {
                count = 0;
                plain() { return ++this.count; }
                with_arg(x) { return x; }
                async later() { return 1; }
            }
            $bog_vmap_scene_cells(Probe, [], []);
            const probe = new Probe;
            $mol_assert_equal(probe.plain(), 1);
            $mol_assert_equal(probe.plain(), 1);
            $mol_assert_ok(Reflect.get(probe, 'plain()'));
            $mol_assert_equal(probe.with_arg(5), 5);
            $mol_assert_equal(Reflect.get(probe, 'with_arg()'), undefined);
            $mol_assert_ok($mol_promise_like(probe.later()));
            $mol_assert_equal(Reflect.get(probe, 'later()'), undefined);
        },
        'the tree decides for keyed and changeable methods'($) {
            class Probe {
                row(id) { return id; }
                note(next) { return next ?? ''; }
            }
            $bog_vmap_scene_cells(Probe, ['row'], ['note']);
            const probe = new Probe;
            $mol_assert_equal(probe.row('a'), 'a');
            $mol_assert_ok(Reflect.get(probe, 'row()') instanceof Map);
            $mol_assert_equal(probe.note('typed'), 'typed');
            $mol_assert_equal(probe.note(), 'typed');
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    const recorder = (log) => class {
        type = '';
        constructor(type, init = {}) {
            log.push({ type, init });
            this.type = type;
        }
    };
    const element = (tabIndex, parent = null, isContentEditable = false) => {
        const seen = [];
        const el = {
            tabIndex,
            isContentEditable,
            parentElement: parent,
            focused: 0,
            focus() { el.focused++; },
            dispatchEvent(event) { seen.push(event.type); return true; },
            seen,
        };
        return el;
    };
    const mods = { altKey: false, ctrlKey: false, metaKey: true, shiftKey: false };
    $mol_test({
        'a focusable element gets focus and the three events in order'($) {
            const made = [];
            const el = element(0);
            const realm = {
                document: { elementFromPoint: () => el },
                PointerEvent: recorder(made),
                MouseEvent: recorder(made),
            };
            const hit = $bog_vmap_scene_click(realm, 40, 50, mods);
            $mol_assert_equal(hit, el);
            $mol_assert_like(el.seen, ['pointerdown', 'pointerup', 'click']);
            $mol_assert_equal(el.focused, 1);
        },
        'every event bubbles and carries the point and the modifiers'($) {
            const made = [];
            const el = element(0);
            $bog_vmap_scene_click({
                document: { elementFromPoint: () => el },
                PointerEvent: recorder(made),
                MouseEvent: recorder(made),
            }, 40, 50, mods);
            $mol_assert_equal(made.length, 3);
            for (const { init } of made) {
                $mol_assert_equal(init.bubbles, true);
                $mol_assert_equal(init.clientX, 40);
                $mol_assert_equal(init.clientY, 50);
                $mol_assert_equal(init.metaKey, true);
                $mol_assert_equal(init.ctrlKey, false);
                $mol_assert_equal(init.button, 0);
            }
            $mol_assert_equal(made[0].init.buttons, 1);
            $mol_assert_equal(made[1].init.buttons, 0);
            $mol_assert_equal(made[2].init.buttons, 0);
            $mol_assert_equal(made[0].init.pointerType, 'mouse');
            $mol_assert_equal(made[1].init.pointerType, 'mouse');
            $mol_assert_equal(made[2].init.pointerType, undefined);
        },
        'focus goes to the nearest focusable ancestor'($) {
            const button = element(0);
            const label = element(-1, button);
            $bog_vmap_scene_click({
                document: { elementFromPoint: () => label },
                MouseEvent: recorder([]),
            }, 0, 0, mods);
            $mol_assert_equal(label.focused, 0);
            $mol_assert_equal(button.focused, 1);
            $mol_assert_like(label.seen, ['pointerdown', 'pointerup', 'click']);
            $mol_assert_like(button.seen, []);
        },
        'nothing focusable means nothing focused, events still go'($) {
            const root = element(-1);
            const leaf = element(-1, root);
            $bog_vmap_scene_click({
                document: { elementFromPoint: () => leaf },
                MouseEvent: recorder([]),
            }, 0, 0, mods);
            $mol_assert_equal(leaf.focused, 0);
            $mol_assert_equal(root.focused, 0);
            $mol_assert_equal(leaf.seen.length, 3);
        },
        'a click on the scene root moves the focus nowhere'($) {
            const root = element(-1);
            let blurred = 0;
            const realm = {
                document: {
                    elementFromPoint: () => root,
                    activeElement: { blur() { blurred++; } },
                },
                MouseEvent: recorder([]),
            };
            $bog_vmap_scene_click(realm, 0, 0, mods);
            $mol_assert_equal(root.focused, 0);
            $mol_assert_equal(blurred, 0);
            $mol_assert_equal(root.seen.length, 3);
        },
        'an editable element counts as focusable'($) {
            const el = element(-1, null, true);
            $bog_vmap_scene_click({
                document: { elementFromPoint: () => el },
                MouseEvent: recorder([]),
            }, 0, 0, mods);
            $mol_assert_equal(el.focused, 1);
        },
        'nothing under the point dispatches nothing and does not fail'($) {
            const made = [];
            const hit = $bog_vmap_scene_click({
                document: { elementFromPoint: () => null },
                PointerEvent: recorder(made),
                MouseEvent: recorder(made),
            }, 0, 0, mods);
            $mol_assert_equal(hit, null);
            $mol_assert_equal(made.length, 0);
        },
        'a target without focus is left alone'($) {
            const seen = [];
            const el = {
                tabIndex: 0,
                dispatchEvent(event) { seen.push(event.type); return true; },
            };
            $bog_vmap_scene_click({
                document: { elementFromPoint: () => el },
                MouseEvent: recorder([]),
            }, 0, 0, mods);
            $mol_assert_equal(seen.length, 3);
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    function node(left, top, width, height, isConnected = true) {
        return {
            isConnected,
            getBoundingClientRect: () => ({ left, top, width, height }),
        };
    }
    function view(prop, box, kids = []) {
        return { prop, box, kids, dom_node: () => box };
    }
    function measure(root, zoom = 1) {
        return $bog_vmap_scene_measure(root, {
            key: 'doc',
            zoom,
            view_of: kid => kid?.dom_node ? kid : null,
            kids_of: made => made.kids,
            prop_of: made => made.prop,
        });
    }
    function doc(width) {
        return view('Doc', node(0, 0, 2000, 1000), [
            view('Board', node(100, 100, width, 600), [
                view('Head', node(100, 100, width, 40)),
                view('Body', node(100, 140, width, 560)),
            ]),
            view('Loose', node(1500, 100, 80, 24)),
        ]);
    }
    $mol_test({
        'every node of the document is measured, not only the free parts'($) {
            const { sizes } = measure(doc(1280));
            $mol_assert_like(Object.keys(sizes), [
                'doc',
                'doc/Board',
                'doc/Board/Head',
                'doc/Board/Body',
                'doc/Loose',
            ]);
            $mol_assert_like(sizes['doc/Board/Head'], { x: 100, y: 100, width: 1280, height: 40 });
        },
        'a narrower artboard reports narrower nodes inside it'($) {
            const wide = measure(doc(1280)).sizes;
            const narrow = measure(doc(390)).sizes;
            $mol_assert_equal(wide['doc/Board'].width, 1280);
            $mol_assert_equal(narrow['doc/Board'].width, 390);
            $mol_assert_equal(narrow['doc/Board/Body'].width, 390);
            $mol_assert_like(wide['doc/Loose'], narrow['doc/Loose']);
        },
        'boxes are reported in world units, relative to the root'($) {
            const { sizes } = measure(doc(1280), 2);
            $mol_assert_like(sizes['doc/Board'], { x: 50, y: 50, width: 640, height: 300 });
        },
        'a node out of the document is not measured'($) {
            const { sizes, nodes } = measure(view('Doc', node(0, 0, 100, 100), [
                view('Gone', node(0, 0, 10, 10, false)),
                view('Here', node(0, 0, 10, 10)),
            ]));
            $mol_assert_like(Object.keys(sizes), ['doc', 'doc/Here']);
            $mol_assert_equal(nodes.length, 2);
        },
        'the observer is handed every measured node'($) {
            const { nodes } = measure(doc(1280));
            $mol_assert_equal(nodes.length, 5);
        },
        'watching adds what is new, drops what is gone and leaves the rest alone'($) {
            const log = [];
            const watcher = {
                observe: (node) => log.push('+' + node),
                unobserve: (node) => log.push('-' + node),
            };
            const first = $bog_vmap_scene_measure_watch(watcher, new Set(), ['a', 'b']);
            $mol_assert_like(log, ['+a', '+b']);
            const second = $bog_vmap_scene_measure_watch(watcher, first, ['b', 'c']);
            $mol_assert_like(log, ['+a', '+b', '-a', '+c']);
            $mol_assert_like([...second], ['b', 'c']);
            $bog_vmap_scene_measure_watch(watcher, second, []);
            $mol_assert_like(log, ['+a', '+b', '-a', '+c', '-b', '-c']);
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    const d = '$';
    const pack = 'https://pack.test/web.js';
    function scene($, uri = pack) {
        const loaded = [];
        const ctx = Object.create($);
        Reflect.set(ctx, '$mol_import', class extends $mol_import {
            static script_async(uri) {
                loaded.push(uri);
                return Promise.resolve(uri);
            }
        });
        const made = $bog_vmap_scene.make({ $: ctx });
        if (uri)
            made.pack_uri(uri);
        return { made, loaded, ctx };
    }
    function deliver($, made, data) {
        const dom = $.$mol_dom_context;
        const event = new dom.MessageEvent('message', { data: { ns: $bog_vmap_bridge_ns, ...data } });
        Object.defineProperty(event, 'source', { value: made.peer() });
        made.message_receive(event);
    }
    async function settled(read, limit = 300) {
        const till = Date.now() + limit;
        for (;;) {
            try {
                return read();
            }
            catch (error) {
                if (!$mol_promise_like(error))
                    return $mol_fail(error);
                if (Date.now() > till)
                    return $mol_fail(new Error('the pack never landed'));
                await new Promise(next => setTimeout(next, 2));
            }
        }
    }
    function wired(made) {
        const sent = [];
        made.post = (message) => { sent.push(message); };
        const observer = { observe: () => { }, unobserve: () => { }, disconnect: () => { } };
        made.resize_watch = () => ({ observer: observer, destructor: () => { } });
        return sent;
    }
    function failure(sent, at) {
        const errors = sent.filter(m => m.kind === 'error' && m.at === at);
        return errors[errors.length - 1];
    }
    function held(ctx) {
        Reflect.set(ctx, '$mol_after_timeout', class extends $mol_after_timeout {
            constructor(delay, task) {
                super(delay, task);
                clearTimeout(this.id);
            }
        });
    }
    async function grown(made, root, src) {
        made.doc_root(root);
        made.doc_src(src);
        return await settled(() => made.instance());
    }
    function boxed(made) {
        const box = $mol_wire_atom.solo({}, function box(next) { return next ?? null; });
        made.view_rect = () => box.sync();
        return (width, height) => {
            box.put({ width, height, left: 0, top: 0, right: width, bottom: height });
        };
    }
    async function two($) {
        const { made } = scene($);
        const root = `${d}visible_page`;
        const doc = await grown(made, root, `${root} ${d}mol_view\n\tsub /\n\t\t<= Near ${d}mol_view\n\t\t<= Far ${d}mol_view\n`);
        return { made, doc, root, sized: boxed(made) };
    }
    $mol_test({
        'a scene with no pack compiles nothing and says what it waits for'($) {
            const { made, loaded } = scene($, '');
            const root = `${d}scene_probe_page`;
            made.doc_root(root);
            made.doc_src(`${root} ${d}mol_view\n\tsub /\n`);
            $mol_assert_equal(made.pack_uri(), '');
            $mol_assert_equal(made.instance(), null);
            $mol_assert_like(loaded, []);
            $mol_assert_equal(Reflect.get(made.sandbox(), root), undefined);
            $mol_assert_equal(made.pack_note(), 'Ожидание библиотеки компонентов…');
        },
        async 'a scene compiles once the pack has been named'($) {
            const { made, loaded } = scene($, '');
            const root = `${d}scene_probe_page`;
            made.doc_root(root);
            made.doc_src(`${root} ${d}mol_view\n\tsub /\n`);
            deliver($, made, { kind: 'pack_set', uri: pack });
            $mol_assert_equal(made.pack_uri(), pack);
            $mol_assert_ok(await settled(() => made.instance()));
            $mol_assert_like(loaded, [pack]);
            $mol_assert_equal(typeof Reflect.get(made.sandbox(), root), 'function');
            $mol_assert_equal(made.pack_note(), '');
        },
        'a pack named by a stranger is not heard'($) {
            const { made, loaded } = scene($, '');
            const dom = $.$mol_dom_context;
            const root = `${d}scene_probe_page`;
            made.doc_root(root);
            made.doc_src(`${root} ${d}mol_view\n\tsub /\n`);
            const event = new dom.MessageEvent('message', {
                data: { ns: $bog_vmap_bridge_ns, kind: 'pack_set', uri: 'https://evil.test/web.js' },
            });
            Object.defineProperty(event, 'source', { value: {} });
            made.message_receive(event);
            $mol_assert_equal(made.pack_uri(), '');
            $mol_assert_like(loaded, []);
            $mol_assert_equal(made.instance(), null);
        },
        async 'the pack is imported once, whatever the pack does to the importer'($) {
            const { made, loaded, ctx } = scene($, '');
            const root = `${d}scene_import_page`;
            Reflect.set(ctx, '$mol_import', class extends $mol_import {
                static script_async(uri) {
                    loaded.push('first:' + uri);
                    Reflect.set(ctx, '$mol_import', class extends $mol_import {
                        static script_async(uri) {
                            loaded.push('second:' + uri);
                            return Promise.resolve(uri);
                        }
                    });
                    return Promise.resolve(uri);
                }
            });
            made.pack_uri(pack);
            await grown(made, root, `${root} ${d}mol_view\n\tsub /\n`);
            $mol_assert_like(loaded, ['first:' + pack]);
        },
        async 'escape pressed inside the frame is relayed, other keys are not'($) {
            const { made } = scene($);
            const sent = wired(made);
            const dom = $.$mol_dom_context;
            made.key_listener();
            dom.dispatchEvent(new dom.KeyboardEvent('keydown', { key: 'a' }));
            dom.dispatchEvent(new dom.KeyboardEvent('keydown', { key: 'Escape' }));
            await new Promise(next => setTimeout(next, 10));
            $mol_assert_like(sent.filter(m => m.kind === 'key'), [{ kind: 'key', key: 'Escape' }]);
        },
        async 'a failure of the document raises no second failure of the scene'($) {
            const { made, ctx } = scene($, '');
            const root = `${d}scene_try_page`;
            let dispatched = 0;
            Reflect.set(ctx, '$mol_try', (handler) => { dispatched++; return handler(); });
            made.pack_uri(pack);
            await grown(made, root, `${root} ${d}mol_view\n\tsub /\n`);
            const boom = new Error('bang');
            $mol_assert_equal(made.$.$mol_try(() => { throw boom; }), boom);
            $mol_assert_equal(made.$.$mol_try(() => 'ok'), 'ok');
            $mol_assert_equal(dispatched, 0);
        },
        async 'an edit of one class leaves the instances of its neighbour alone'($) {
            const { made } = scene($);
            const root = `${d}hot_two_page`;
            const src = (tag) => `${root} ${d}mol_view\n`
                + `\tsub /\n\t\t<= Kid ${d}hot_two_kid\n\t\t<= Tail ${d}hot_two_tail\n`
                + `${d}hot_two_kid ${d}mol_view\n\tnote? \\\n`
                + `${d}hot_two_tail ${d}mol_view\n\ttag \\${tag}\n`;
            const first = await grown(made, root, src('one'));
            const kid = first.Kid();
            const tail = first.Tail();
            kid.note('typed by hand');
            const second = await grown(made, root, src('two'));
            $mol_assert_equal(second, first);
            $mol_assert_equal(second.Kid(), kid);
            $mol_assert_equal(second.Tail(), tail);
            $mol_assert_equal(kid.note(), 'typed by hand');
            $mol_assert_equal(tail.tag(), 'two');
        },
        async 'an heir declared above its base follows an edit of that base'($) {
            const { made } = scene($);
            const root = `${d}hot_heir_page`;
            const src = (tag) => `${root} ${d}mol_view\n\tsub /\n\t\t<= Kid ${d}hot_heir_kid\n`
                + `${d}hot_heir_kid ${d}hot_heir_base\n`
                + `${d}hot_heir_base ${d}mol_view\n\ttag \\${tag}\n`;
            const first = await grown(made, root, src('one'));
            $mol_assert_equal(first.Kid().tag(), 'one');
            const second = await grown(made, root, src('two'));
            $mol_assert_equal(second, first);
            $mol_assert_equal(second.Kid().tag(), 'two');
        },
        async 'the sandbox is one per document and holds the fresh classes'($) {
            const { made } = scene($);
            const root = `${d}hot_box_page`;
            const src = (tag) => `${root} ${d}mol_view\n\tsub /\n\t\t<= Kid ${d}hot_box_kid\n`
                + `${d}hot_box_kid ${d}mol_view\n\ttag \\${tag}\n`;
            const first = await grown(made, root, src('one'));
            const box = made.sandbox();
            const kid = first.Kid();
            await grown(made, root, src('two'));
            $mol_assert_equal(made.sandbox(), box);
            $mol_assert_equal(kid.$, box);
            $mol_assert_equal(Reflect.get(box, `${d}hot_box_kid`), kid.constructor);
        },
        async 'written values survive a recompile'($) {
            const { made } = scene($);
            const root = `${d}hot_state_page`;
            const src = (tag) => `${root} ${d}mol_view\n`
                + `\ttag \\${tag}\n`
                + `\tcount? 0\n`
                + `\tslot*id? \\\n`
                + `\ttext? \\\n`;
            const first = await grown(made, root, src('one'));
            first.count(7);
            first.slot('left', 'held');
            first.text('typed by hand');
            const second = await grown(made, root, src('two'));
            $mol_assert_equal(second, first);
            $mol_assert_equal(second.tag(), 'two');
            $mol_assert_equal(second.count(), 7);
            $mol_assert_equal(second.slot('left'), 'held');
            $mol_assert_equal(second.text(), 'typed by hand');
        },
        async 'a changed base rebuilds instead of swapping'($) {
            const { made } = scene($);
            const root = `${d}hot_base_page`;
            const src = (base) => `${root} ${d}mol_view\n\tsub /\n\t\t<= Kid ${d}hot_base_kid\n`
                + `${d}hot_base_kid ${d}hot_base_${base}\n`
                + `${d}hot_base_one ${d}mol_view\n\ttag \\one\n`
                + `${d}hot_base_two ${d}mol_view\n\ttag \\two\n`;
            const first = await grown(made, root, src('one'));
            $mol_assert_equal(first.Kid().tag(), 'one');
            const second = await grown(made, root, src('two'));
            $mol_assert_equal(second === first, false);
            $mol_assert_equal(second.Kid().tag(), 'two');
        },
        async 'a changed pack rebuilds instead of swapping'($) {
            const { made } = scene($);
            const root = `${d}hot_pack_page`;
            const src = `${root} ${d}mol_view\n\ttag \\one\n`;
            const first = await grown(made, root, src);
            made.pack_uri('https://other.test/web.js');
            const second = await settled(() => made.instance());
            $mol_assert_equal(second === first, false);
        },
        async 'a property that turns keyed leaves no atom of the old shape'($) {
            const { made } = scene($);
            const root = `${d}hot_shape_page`;
            const solo = `${root} ${d}mol_view\n\tnote? \\\n`;
            const keyed = `${root} ${d}mol_view\n\tnote*id? \\\n`;
            const first = await grown(made, root, solo);
            first.note('written');
            $mol_assert_equal(first.note(), 'written');
            $mol_assert_ok(Reflect.get(first, 'note()'));
            const second = await grown(made, root, keyed);
            $mol_assert_equal(second, first);
            $mol_assert_equal(made.compile_error(), '');
            $mol_assert_equal(Reflect.get(second, 'note()'), undefined);
            $mol_assert_equal(second.note('a'), '');
            $mol_assert_equal(second.note('a', 'again'), 'again');
            $mol_assert_ok(Reflect.get(second, 'note()') instanceof Map);
        },
        'the scene orders declarations by the sort of the language'($) {
            const asked = [];
            const ctx = Object.create($);
            Reflect.set(ctx, '$bog_vmap_lang_sorted', (defs) => {
                asked.push(defs.length);
                return [...defs].reverse();
            });
            const defs = $.$mol_tree2_from_string(`${d}hot_sort_a ${d}mol_view\n${d}hot_sort_b ${d}mol_view\n`).kids;
            const out = ctx.$bog_vmap_scene_order([], defs);
            $mol_assert_like(asked, [2]);
            $mol_assert_like(out.map(def => def.type), [`${d}hot_sort_b`, `${d}hot_sort_a`]);
        },
        async 'a compile failure leaves the living instance whole'($) {
            const { made } = scene($);
            const root = `${d}hot_fail_page`;
            const src = (tag) => `${root} ${d}mol_view\n\ttag \\${tag}\n\tnote? \\\n`;
            const first = await grown(made, root, src('one'));
            first.note('typed by hand');
            const broken = await grown(made, root, src('one') + `${d}hot_fail_kid ${d}hot_fail_ghost\n`);
            $mol_assert_equal(broken, first);
            $mol_assert_ok(made.compile_error());
            $mol_assert_equal(first.note(), 'typed by hand');
            const fixed = await grown(made, root, src('two'));
            $mol_assert_equal(fixed, first);
            $mol_assert_equal(made.compile_error(), '');
            $mol_assert_equal(fixed.tag(), 'two');
            $mol_assert_equal(fixed.note(), 'typed by hand');
        },
        async 'a runtime failure names the node it belongs to'($) {
            const { made } = scene($);
            const sent = wired(made);
            const root = `${d}hot_blame_page`;
            const first = await grown(made, root, `${root} ${d}mol_view\n\tsub /\n\t\t<= Tail ${d}hot_blame_tail\n`
                + `${d}hot_blame_tail ${d}mol_view\n\tsub /\n\t\t<= Deep ${d}hot_blame_deep\n`
                + `${d}hot_blame_deep ${d}mol_view\n\tsub /\n\t\t<= boom \\\n`);
            made.doc_js({ [`${d}hot_blame_deep`]: 'boom() { throw new Error( "bang" ) }' });
            await settled(() => made.instance());
            try {
                first.dom_tree();
            }
            catch { }
            $mol_assert_equal(made.render_error(first).node, 'Tail');
            $mol_assert_ok(made.render_error(first).message);
            made.report_send();
            const failed = failure(sent, 'runtime');
            $mol_assert_equal(failed?.node, 'Tail');
            $mol_assert_ok(failed?.message);
        },
        'a scene with no pack yet says so upwards, not only on its own canvas'($) {
            const { made, ctx } = scene($, '');
            const sent = wired(made);
            held(ctx);
            made.pack_task();
            $mol_assert_equal(failure(sent, 'pack'), undefined);
            made.pack_task().task();
            $mol_assert_equal(failure(sent, 'pack')?.message, 'Ожидание библиотеки компонентов…');
        },
        async 'a pack that answered clears the note it sent upwards'($) {
            const { made, ctx } = scene($, '');
            const sent = wired(made);
            held(ctx);
            made.pack_task().task();
            $mol_assert_equal(failure(sent, 'pack')?.message, 'Ожидание библиотеки компонентов…');
            deliver($, made, { kind: 'pack_set', uri: pack });
            await settled(() => made.pack_ready());
            made.pack_task().task();
            $mol_assert_equal(failure(sent, 'pack')?.message, null);
        },
        async 'a failure with no node to blame reports an empty one'($) {
            const { made } = scene($);
            const sent = wired(made);
            const root = `${d}hot_blank_page`;
            await grown(made, root, `${root} ${d}mol_view\n\ttag \\one\n`);
            made.error_post('runtime', 'something nobody owns', '');
            const failed = failure(sent, 'runtime');
            $mol_assert_equal(failed?.message, 'something nobody owns');
            $mol_assert_equal(failed?.node, '');
        },
        async 'the last failure sent is a cell, and it wakes its reader'($) {
            const { made } = scene($);
            wired(made);
            const root = `${d}hot_edge_page`;
            await grown(made, root, `${root} ${d}mol_view\n\ttag \\one\n`);
            const seen = {};
            const atom = $mol_wire_atom.solo(seen, function watcher() { return made.error_sent('runtime'); });
            $mol_assert_equal(atom.sync(), null);
            made.error_post('runtime', 'first', '');
            $mol_assert_equal(atom.sync(), 'first');
            $mol_assert_equal(made.error_sent('compile'), null);
            made.error_post('runtime', '', '');
            $mol_assert_equal(atom.sync(), null);
        },
        async 'a compile failure names the node of the class that broke'($) {
            const { made } = scene($);
            const sent = wired(made);
            const root = `${d}hot_guilt_page`;
            const src = (kid) => `${root} ${d}mol_view\n\tsub /\n\t\t<= Kid ${d}hot_guilt_kid\n`
                + `${d}hot_guilt_kid ${kid}\n\ttag \\one\n`;
            const first = await grown(made, root, src(`${d}mol_view`));
            $mol_assert_ok(first.Kid());
            await grown(made, root, src(`${d}hot_guilt_ghost`));
            $mol_assert_ok(made.compile_error());
            $mol_assert_equal(made.compile_class(), `${d}hot_guilt_kid`);
            made.report_send();
            $mol_assert_equal(failure(sent, 'compile')?.node, 'Kid');
        },
        async 'a reader of the compile failure is woken when it changes'($) {
            const { made } = scene($);
            const root = `${d}hot_wake_page`;
            const src = (tag) => `${root} ${d}mol_view\n\ttag \\${tag}\n`;
            await grown(made, root, src('one'));
            const seen = {};
            const atom = $mol_wire_atom.solo(seen, function watcher() { return made.compile_error(); });
            $mol_assert_equal(atom.sync(), '');
            await grown(made, root, src('one') + `${d}hot_wake_kid ${d}hot_wake_ghost\n`);
            $mol_assert_ok(atom.sync());
            $mol_assert_equal(atom.sync(), made.compile_error());
        },
        async 'the reported node is a part name, not a path and not a class'($) {
            const { made } = scene($);
            const root = `${d}hot_shape_name_page`;
            const first = await grown(made, root, `${root} ${d}mol_view\n\tsub /\n\t\t<= Tail ${d}hot_shape_name_tail\n`
                + `${d}hot_shape_name_tail ${d}mol_view\n\tsub /\n\t\t<= Deep ${d}hot_shape_name_deep\n`
                + `${d}hot_shape_name_deep ${d}mol_view\n\tsub /\n\t\t<= boom \\\n`);
            made.doc_js({ [`${d}hot_shape_name_deep`]: 'boom() { throw new Error( "bang" ) }' });
            await settled(() => made.instance());
            try {
                first.dom_tree();
            }
            catch { }
            const node = made.render_error(first).node;
            $mol_assert_equal(node.includes('/'), false);
            $mol_assert_equal(node.startsWith('$'), false);
            const walk = made.walk_of(first);
            const parts = walk.kids_of(first)
                .map(kid => walk.view_of(kid))
                .filter(Boolean)
                .map(view => walk.prop_of(view));
            $mol_assert_equal(parts.includes(node), true);
        },
        async 'a failure of the root itself is reported with no node'($) {
            const { made } = scene($);
            const root = `${d}hot_top_page`;
            const first = await grown(made, root, `${root} ${d}mol_view\n\tsub /\n\t\t<= boom \\\n`);
            made.doc_js({ [root]: 'boom() { throw new Error( "bang" ) }' });
            await settled(() => made.instance());
            try {
                first.dom_tree();
            }
            catch { }
            const failed = made.render_error(first);
            $mol_assert_ok(failed.message);
            $mol_assert_equal(failed.node, '');
        },
        async 'a property memoized twice keeps its state across an edit'($) {
            const { made } = scene($);
            const root = `${d}hot_twice_page`;
            const src = (tag) => `${root} ${d}mol_view\n\ttag \\${tag}\n\tnote? \\\n`;
            made.doc_root(root);
            made.doc_src(src('one'));
            made.doc_js({ [root]: 'note( next ) { return next ?? "from body" }' });
            const first = await settled(() => made.instance());
            $mol_assert_equal(first.note(), 'from body');
            $mol_assert_like(Object.getOwnPropertyNames(first).filter(key => key.endsWith('()')), ['note ()']);
            first.note('typed by hand');
            const second = await grown(made, root, src('two'));
            $mol_assert_equal(second, first);
            $mol_assert_equal(second.tag(), 'two');
            $mol_assert_equal(second.note(), 'typed by hand');
            $mol_assert_equal(made.compile_error(), '');
        },
        async 'an edit of a handwritten body reaches the rendered text'($) {
            const { made } = scene($);
            const root = `${d}hot_paint_page`;
            const kid = `${d}hot_paint_kid`;
            made.doc_js({ [kid]: 'greeting() { return "Живая" }' });
            const first = await grown(made, root, `${root} ${d}mol_view\n\tsub /\n\t\t<= Knopka ${kid}\n`
                + `${kid} ${d}mol_view\n\tsub /\n\t\t<= greeting \\\n`);
            first.dom_tree();
            $mol_assert_equal(first.Knopka().dom_node().textContent, 'Живая');
            made.doc_js({ [kid]: 'greeting() { return "Ожила" }' });
            $mol_assert_equal(await settled(() => made.instance()), first);
            first.dom_tree();
            $mol_assert_equal(first.Knopka().dom_node().textContent, 'Ожила');
        },
        async 'a method that appears heals the node that failed for want of it'($) {
            const { made } = scene($);
            const root = `${d}hot_heal_page`;
            const kid = `${d}hot_heal_kid`;
            made.doc_js({ [kid]: 'title() { return this.greeting() }' });
            const first = await grown(made, root, `${root} ${d}mol_view\n\tsub /\n\t\t<= Knopka ${kid}\n`
                + `${kid} ${d}mol_view\n\tsub /\n\t\t<= title \\\n`);
            first.dom_tree();
            const node = first.Knopka().dom_node();
            $mol_assert_equal(node.getAttribute('mol_view_error'), 'TypeError');
            made.doc_js({ [kid]: 'title() { return this.greeting() }\ngreeting() { return "Живая" }' });
            $mol_assert_equal(await settled(() => made.instance()), first);
            first.dom_tree();
            $mol_assert_equal(node.getAttribute('mol_view_error'), null);
            $mol_assert_equal(node.textContent, 'Живая');
        },
        async 'sub() stays whole while sub_visible() is culled'($) {
            const { made, doc, sized } = await two($);
            sized(1000, 800);
            made.spots({ Near: { x: 0, y: 0 }, Far: { x: 9000, y: 9000 } });
            $mol_assert_equal(doc.sub().length, 2);
            $mol_assert_equal(doc.sub_visible().length, 1);
            $mol_assert_equal(made.walk_of(doc).kids_of(doc).length, 2);
        },
        async 'the viewport is the box of the scene'($) {
            const { made, sized } = await two($);
            made.spots({ Near: { x: 0, y: 0 }, Far: { x: 600, y: 0 } });
            sized(100, 100);
            $mol_assert_equal(made.shown().has('Far'), false);
            sized(2000, 800);
            $mol_assert_equal(made.shown().has('Far'), true);
        },
        async 'nothing is culled until the scene has a box'($) {
            const { made, doc } = await two($);
            made.view_rect = () => null;
            made.spots({ Near: { x: 0, y: 0 }, Far: { x: 9000, y: 9000 } });
            $mol_assert_equal(doc.sub_visible().length, 2);
        },
        async 'a box that arrives wakes the culling'($) {
            const { made, root, sized } = await two($);
            sized(1000, 800);
            made.spots({ Near: { x: 0, y: 0 }, Far: { x: -700, y: 0 } });
            const seen = {};
            const atom = $mol_wire_atom.solo(seen, function watcher() { return made.shown().has('Far'); });
            $mol_assert_equal(atom.sync(), false);
            made.sizes_remember({ [root + '/Far']: { x: -700, y: 0, width: 400, height: 40 } });
            $mol_assert_equal(atom.sync(), true);
        },
        async 'a report that leaves a part out does not forget its box'($) {
            const { made, root } = await two($);
            made.sizes_remember({ [root + '/Far']: { x: 1, y: 2, width: 3, height: 4 } });
            made.sizes_remember({ [root + '/Near']: { x: 5, y: 6, width: 7, height: 8 } });
            $mol_assert_like(Object.keys(made.sizes_seen()), ['Far', 'Near']);
        },
        'the address of an asset reaches the document untouched'($) {
            const { made } = scene($);
            const uri = 'https://baza.test/?BAZA:file=TQzejQsT_m3PFV7J3;name=logo.png';
            made.doc_root(`${d}visible_asset`);
            made.doc_src(`${d}visible_asset ${d}mol_view\n\ttitle \\${uri}\n`);
            $mol_assert_ok(made.doc_tree().toString().includes(uri));
        },
        'the theme named by the host is worn by the scene and by the frame'($) {
            const { made } = scene($);
            const dom = $.$mol_dom_context;
            $mol_assert_equal(made.theme(), null);
            $mol_assert_equal(made.scheme(), 'dark');
            deliver($, made, { kind: 'theme_set', theme: '$mol_theme_light' });
            $mol_assert_equal(made.theme(), '$mol_theme_light');
            $mol_assert_equal(made.dom_node_actual().getAttribute('mol_theme'), '$mol_theme_light');
            $mol_assert_equal(made.scheme(), 'light');
            made.scheme_attach();
            $mol_assert_equal(dom.document.documentElement.style.colorScheme, 'light');
            deliver($, made, { kind: 'theme_set', theme: '$mol_theme_dark' });
            $mol_assert_equal(made.scheme(), 'dark');
            made.scheme_attach();
            $mol_assert_equal(dom.document.documentElement.style.colorScheme, 'dark');
        },
        'a theme named by a stranger is not heard'($) {
            const { made } = scene($);
            const dom = $.$mol_dom_context;
            const event = new dom.MessageEvent('message', {
                data: { ns: $bog_vmap_bridge_ns, kind: 'theme_set', theme: '$mol_theme_light' },
            });
            Object.defineProperty(event, 'source', { value: {} });
            made.message_receive(event);
            $mol_assert_equal(made.theme(), null);
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    $mol_test({
        'values are read by name and cut to a line'($) {
            const root = {
                calc_result() { return 42; },
                calc_title() { return '  два\n слова  '; },
                calc_list() { return [1, 'a']; },
                calc_long() { return 'x'.repeat(100); },
            };
            const values = $.$bog_vmap_scene_values(root, ['calc_result', 'calc_title', 'calc_list', 'calc_long'], 10);
            $mol_assert_like(values, {
                calc_result: '42',
                calc_title: 'два слова',
                calc_list: '[1,"a"]',
                calc_long: 'xxxxxxxxx…',
            });
        },
        'a read that throws becomes the text of the error'($) {
            const root = {
                good() { return 'ok'; },
                bad() { throw new Error('boom'); },
            };
            const values = $.$bog_vmap_scene_values(root, ['good', 'bad', 'absent']);
            $mol_assert_equal(values.good, 'ok');
            $mol_assert_equal(values.bad, '⚠ boom');
            $mol_assert_equal(/absent/.test(values.absent), true);
        },
        'a suspension is not an error and is rethrown'($) {
            const wait = new Promise(() => { });
            const root = { slow() { throw wait; } };
            let caught = null;
            try {
                $.$bog_vmap_scene_values(root, ['slow']);
            }
            catch (error) {
                caught = error;
            }
            $mol_assert_equal(caught, wait);
        },
        'values go out at once, then no more often than the period'($) {
            const made = [];
            $.$mol_after_timeout = class extends $mol_after_timeout {
                constructor(delay, task) {
                    super(delay, task);
                    clearTimeout(this.id);
                    made.push(this);
                }
            };
            const posted = [];
            const clock = { now: 1000 };
            const root = { calc_result() { return 7; } };
            const scene = $$.$bog_vmap_scene.make({
                $,
                instance: () => root,
                peer: () => ({ postMessage(data) { posted.push(data); } }),
                now: () => clock.now,
            });
            $mol_assert_equal(scene.values_task(), null);
            scene.values_wanted(['calc_result']);
            const first = scene.values_task();
            $mol_assert_equal(first.delay, 0);
            first.task();
            $mol_assert_like(posted.filter(m => m.kind === 'values').map(m => m.values), [{ calc_result: '7' }]);
            clock.now += 100;
            scene.values_wanted(['calc_result', 'nope']);
            const second = scene.values_task();
            $mol_assert_equal(second !== first, true);
            $mol_assert_equal(second.delay, 150);
            scene.values_wanted([]);
            $mol_assert_equal(scene.values_task(), null);
        },
        async 'the stamp of the last send lives in the graph and wakes nobody'($) {
            const made = [];
            $.$mol_after_timeout = class extends $mol_after_timeout {
                constructor(delay, task) {
                    super(delay, task);
                    clearTimeout(this.id);
                    made.push(this);
                }
            };
            const posted = [];
            const clock = { now: 1000 };
            const root = { calc_result() { return 7; } };
            const scene = $$.$bog_vmap_scene.make({
                $,
                instance: () => root,
                peer: () => ({ postMessage(data) { posted.push(data); } }),
                now: () => clock.now,
            });
            scene.values_wanted(['calc_result']);
            scene.values_task().task();
            const sent = posted.filter(m => m.kind === 'values').length;
            $mol_assert_equal(sent, 1);
            $mol_assert_equal(scene.values_at(), 1000);
            const built = made.length;
            await new Promise(next => setTimeout(next, 10));
            $mol_assert_equal(made.length, built);
            $mol_assert_equal(posted.filter(m => m.kind === 'values').length, 1);
            clock.now += 100;
            scene.values_wanted(['calc_result', 'nope']);
            $mol_assert_equal(scene.values_task().delay, 150);
        },
        'a dotted name walks from the root through the part to its port'($) {
            const part = {
                result() { return 42; },
                title() { return 'сумма'; },
            };
            const root = {
                Calc() { return part; },
                calc_result() { return 1; },
            };
            $mol_assert_like($.$bog_vmap_scene_values(root, ['Calc.result', 'Calc.title', 'calc_result']), { 'Calc.result': '42', 'Calc.title': 'сумма', calc_result: '1' });
        },
        'a dotted name that leads nowhere names itself in the error'($) {
            const root = {
                Calc() { return { result() { return 1; } }; },
                flat() { return 5; },
            };
            const values = $.$bog_vmap_scene_values(root, ['Calc.absent', 'Nope.result', 'flat.result']);
            $mol_assert_equal(values['Calc.absent'], '⚠ нет свойства Calc.absent');
            $mol_assert_equal(values['Nope.result'], '⚠ нет свойства Nope.result');
            $mol_assert_equal(values['flat.result'], '⚠ нет свойства flat.result');
        },
        'a list of records becomes a table of columns and the first rows'($) {
            const root = {
                rows() {
                    return [
                        { city: 'Москва', sum: 7 },
                        { city: 'Питер', sum: 9 },
                        { city: 'Казань', sum: 3 },
                        { city: 'Пермь', sum: 1 },
                    ];
                },
            };
            const values = $.$bog_vmap_scene_values(root, ['rows']);
            $mol_assert_like(values.rows.split('\n').map(line => line.split('\t')), [
                ['city', 'sum'],
                ['Москва', '7'],
                ['Питер', '9'],
                ['Казань', '3'],
                ['… ещё 1'],
            ]);
        },
        'a wider record widens the table, and a long cell is cut'($) {
            const root = {
                rows() {
                    return [
                        { name: 'x'.repeat(20) },
                        { name: 'y', note: 'z' },
                    ];
                },
            };
            const values = $.$bog_vmap_scene_values(root, ['rows'], 10);
            $mol_assert_like(values.rows.split('\n').map(line => line.split('\t')), [
                ['name', 'note'],
                ['xxxxxxxxx…', ''],
                ['y', 'z'],
            ]);
        },
        'a plain value stays on one line, so a newline can only mean a table'($) {
            const root = {
                text() { return 'два\nслова'; },
                list() { return [1, 2]; },
                empty() { return []; },
                mixed() { return [{ a: 1 }, 2]; },
                deep() { return { a: { b: 'раз\nдва' } }; },
                bad() { throw new Error('сломалось\nи вот почему'); },
                absent: 1,
            };
            const names = ['text', 'list', 'empty', 'mixed', 'deep', 'bad', 'absent', 'nope'];
            const values = $.$bog_vmap_scene_values(root, names);
            $mol_assert_equal(values.text, 'два слова');
            $mol_assert_equal(values.list, '[1,2]');
            $mol_assert_equal(values.empty, '[]');
            $mol_assert_equal(values.mixed, '[{"a":1},2]');
            $mol_assert_equal(values.bad, '⚠ сломалось и вот почему');
            for (const name of names) {
                $mol_assert_equal(values[name].includes('\n'), false);
                $mol_assert_equal(values[name].includes('\t'), false);
            }
        },
        'a function value is the name of its type, not its source'($) {
            const root = { hook() { return (a) => a + 1; } };
            $mol_assert_equal($.$bog_vmap_scene_values(root, ['hook']).hook, 'function');
        },
        'a view like value is its own id, not a JSON walk'($) {
            const root = {
                view() { return $mol_object.make({}); },
                nil() { return null; },
            };
            const values = $.$bog_vmap_scene_values(root, ['view', 'nil']);
            $mol_assert_equal(typeof values.view, 'string');
            $mol_assert_equal(values.view.length > 0, true);
            $mol_assert_equal(values.nil, 'null');
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    const how = (key) => ({
        key,
        view_of: (kid) => kid?.name === undefined ? null : kid,
        kids_of: (view) => view.kids ?? [],
        prop_of: (view) => view.name,
    });
    const bad = (view) => !!view.bad;
    $mol_test({
        'the path of a node is the root and every property down to it'($) {
            const tree = { name: 'root', kids: [
                    { name: 'Head' },
                    { name: 'Tail', kids: [{ name: 'Deep', bad: true }] },
                ] };
            $mol_assert_equal($bog_vmap_scene_seek(tree, how('doc'), bad)?.path, 'doc/Tail/Deep');
        },
        'the root is asked before any child'($) {
            const tree = { name: 'root', bad: true, kids: [{ name: 'Kid', bad: true }] };
            const found = $bog_vmap_scene_seek(tree, how('doc'), bad);
            $mol_assert_equal(found?.path, 'doc');
            $mol_assert_equal(found?.view, tree);
        },
        'nothing to blame comes back as nothing, not as the root'($) {
            const tree = { name: 'root', kids: [{ name: 'Kid' }] };
            $mol_assert_equal($bog_vmap_scene_seek(tree, how('doc'), bad), null);
        },
        'an unnamed child is addressed by its index'($) {
            const tree = { name: 'root', kids: [{ name: '' }, { name: '', bad: true }] };
            $mol_assert_equal($bog_vmap_scene_seek(tree, how('doc'), bad)?.path, 'doc/1');
        },
        'text between views does not take an index'($) {
            const tree = { name: 'root', kids: ['just text', { name: '', bad: true }] };
            $mol_assert_equal($bog_vmap_scene_seek(tree, how('doc'), bad)?.path, 'doc/0');
        },
        'a cycle is cut by the depth limit'($) {
            const loop = { name: 'Loop' };
            loop.kids = [loop];
            $mol_assert_equal($bog_vmap_scene_seek(loop, how('doc'), bad), null);
        },
    });
})($ || ($ = {}));


//# sourceMappingURL=node.test.js.map
