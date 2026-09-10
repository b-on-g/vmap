"use strict";
function require( path ){ return $node[ path ] };
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
    }
    $.$mol_test_complete = $mol_test_complete;
})($ || ($ = {}));

;
"use strict";

;
"use strict";

;
"use strict";

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

;
"use strict";

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
(function ($_1) {
    $mol_test_mocks.push($ => {
        $.$mol_after_work = $mol_after_mock_timeout;
    });
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
(function ($) {
    $mol_test({
        'null by default'() {
            const key = String(Math.random());
            $mol_assert_equal($mol_state_session.value(key), null);
        },
        'storing'() {
            const key = String(Math.random());
            $mol_state_session.value(key, '$mol_state_session_test');
            $mol_assert_equal($mol_state_session.value(key), '$mol_state_session_test');
            $mol_state_session.value(key, null);
            $mol_assert_equal($mol_state_session.value(key), null);
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
var $;
(function ($_1) {
    /**
     * Tests of the wire protocol: what goes in through `send` comes out of `read`,
     * and what is not ours does not. A fake `postMessage` stands in for the window.
     */
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
        /** The question goes down as a list of names, the answer comes up keyed by them. */
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
        'a message from another namespace is not ours'($) {
            $mol_assert_equal($bog_vmap_bridge_read({ data: { ns: 'somebody_else', kind: 'libs_set', parts: [] } }), null);
            $mol_assert_equal($bog_vmap_bridge_read({ data: 'text' }), null);
            $mol_assert_equal($bog_vmap_bridge_read({ data: { ns: $bog_vmap_bridge_ns } }), null);
        },
        /** Passing a peer at all turns the check on: an unknown source is refused. */
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

;
"use strict";
var $;
(function ($_1) {
    /**
     * `click_at` on the wire: the relayed click keeps its point and its modifiers,
     * and comes in only from the peer, like every other message.
     */
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
var $;
(function ($_1) {
    /** A box in world units, as the scene reports one. */
    const box = (x, y, width, height) => ({ x, y, width, height });
    $mol_test({
        /** World to screen: the same transform the scene puts on its stage, done here. */
        'a measured box in screen pixels of the pane'($) {
            $mol_assert_like($bog_vmap_app_pane_screen(box(10, 20, 30, 40), 2, [5, 7]), { left: 25, top: 47, width: 60, height: 80 });
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
"use strict";

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
    var $$;
    (function ($$) {
        $mol_test({
            async "Get and parse"($) {
                $mol_assert_equal(await $mol_wire_async($mol_fetch).text('data:text/plain,foo'), 'foo');
            },
        });
    })($$ = $_1.$$ || ($_1.$$ = {}));
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
    /**
     * Tests of `$bog_vmap_lang`: round trip, property editing and the wire emitter.
     *
     * Nothing here touches the network or the DOM. The wire tests run the emitted
     * tree through the real `$mol_view_tree2_to_text`, because the five traps of
     * section 1 all produce a green build and only differ in the generated JS.
     * Reading the wire by eye proves nothing, which is the whole reason they cost
     * so much time to find.
     *
     * `d` keeps `$` out of the string literals: mam builds its dependency graph by
     * a regexp over sources, literals included, so a bare `$mol_button` in a
     * fixture would drag a whole module into the bundle.
     */
    const d = '$';
    /**
     * The document of section 1: a free part, a wire from it, and a label buried
     * two levels deep inside `sub` that reads the wire.
     *
     * Already normalized, which is what makes it a byte for byte round trip. See
     * the lossiness test at the bottom for the form it is normalized FROM.
     */
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
    /** The same document as a person would write it, with nesting. */
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
    /** Two parts on the canvas and no wire between them yet. Normalized. */
    const pair_src = [
        `${d}bog_vmap_lang_test_pair ${d}mol_view`,
        `	Calc ${d}bog_vmap_lang_test_calc`,
        `	Price ${d}mol_view`,
        `	sub /`,
        `		<= Calc`,
        `		<= Price`,
        ``,
    ].join('\n');
    /** Two sources and two consumers, enough for a wire to have neighbours. */
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
    /**
     * A document with an artboard: `Board` carries a `sub` of its own, so its
     * children are laid out by tree, while `Loose` lies free on the canvas.
     *
     * Nothing marks the artboard as one. Section 8 says both are properties of the
     * same root class, and the only difference in the text is the `sub`.
     */
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
    /** Indices of the lines two texts differ at, trailing tail included. */
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
    /**
     * A document of two classes, already normalized, so that a neighbour surviving
     * a write can be asserted byte for byte rather than «close enough».
     *
     * Two properties each, and not one, on purpose. `$mol_tree2` writes a chain of
     * single children inline, so a class of one property comes back as one line
     * carrying the class, the base, the property and its value. Same tree, parses
     * back identically, but a fixture standing on it would be testing the
     * serializer's shorthand instead of the document.
     */
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
    /** The JS the compiler makes of a node, as a plain string. */
    function js_of($, node) {
        const tree = node.tree();
        return $.$mol_tree2_text_to_string($.$mol_view_tree2_to_text(tree.list([tree])));
    }
    $mol_test({
        /**
         * The main test of the module. Source is the truth, the tree is derived, an
         * edit lands back as text, and nothing else in the file moves.
         */
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
        /** A lone property folds back onto the class line, which is normal tree format. */
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
        /**
         * Taking a node off the page and undeclaring it are two facts, so the empty
         * `sub /` has to survive the first one — it is the shape an empty document
         * starts from, and a class left with no `sub` at all would be a third state
         * nobody asked for.
         */
        'dropping the last reference keeps an empty sub'($) {
            const node = doc(demo_src);
            node.sub_drop('Hero');
            $mol_assert_equal(node.source(), demo_src.replace('\tsub / <= Hero\n', '\tsub /\n'));
            $mol_assert_equal(node.prop_tree('sub').kids[0].kids.length, 0);
            // The declaration is untouched: a part out of `sub` still exists and
            // still has its ports, it just draws nothing.
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
        /**
         * The acceptance of the wire, run through the compiler rather than read.
         * `this.Calc().result()` is the whole point: the middle link is what the
         * `<=` form loses without a word.
         */
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
        /**
         * Trap one and two of section 1. Both are the middle form of `<=`: a
         * reference that carries a child. With the node declared the build dies
         * talking about default values, without it the build is green and the bundle
         * gets `Calc(){ return result }`.
         *
         * A reference takes a token, not a path, so neither is expressible.
         */
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
        /**
         * Trap two again, from the other side: `=` declares nothing, so a wire to a
         * node nobody declared compiles green and throws `is not a function` at run
         * time, at that node only, whenever somebody gets there.
         */
        'trap: a wire to an undeclared node is refused'($) {
            const node = doc(demo_src);
            $mol_assert_fail(() => node.wire_add({ name: 'w', node: 'Nope', prop: 'result' }), Error);
            $mol_assert_equal(node.source(), demo_src);
        },
        /** Trap three: `w = Field value?` throws `ReferenceError: next` on any read. */
        'trap: `?` on the right end only'($) {
            $mol_assert_fail(() => $.$bog_vmap_lang_wire_tree({ name: 'w', node: 'Field', prop: 'value?' }), Error);
        },
        /** Trap four: `w? = Field hint` never fails, writes just disappear. */
        'trap: `?` on the left end only'($) {
            $mol_assert_fail(() => $.$bog_vmap_lang_wire_tree({ name: 'w?', node: 'Field', prop: 'hint' }), Error);
        },
        /**
         * Trap five: `w = A B value` compiles to `this.A().B().value()`, but `upper`
         * hoisted `B` onto the root, so it is not a method of `A`.
         */
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
        /**
         * `$mol_view_tree2_normalize` runs the `upper` hack, so a nested declaration
         * comes out as a flat property of the root plus a bare reference in place.
         * That is why the round trip above is byte for byte only on an already
         * normalized source, and why the editor keeps documents in that form.
         *
         * Pinned here so nobody rediscovers it in stage 4.1 through a mangled file.
         */
        'normalize hoists nested declarations onto the root'($) {
            $mol_assert_equal(doc(nested_src).tree().toString(), demo_src);
            $mol_assert_equal(doc(demo_src).tree().toString(), demo_src);
        },
        'an empty source says so instead of throwing on undefined'($) {
            $mol_assert_fail(() => doc('').tree(), Error);
        },
        /**
         * A base has to be declared before its heir, because `extends` is evaluated
         * when the class is defined while the generator emits declarations in the
         * order it received them. Written heir first here on purpose.
         *
         * A sub-view reference is NOT a constraint: that one compiles to a call
         * resolved at call time, so `mid` may keep its place relative to `leaf`.
         */
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
        /**
         * The whole reason `$bog_vmap_lang_doc` exists. Before it, this edit left
         * the source holding one class: the node model writes the class it touched
         * as the entire text, so every neighbour was dropped without an error.
         */
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
        /**
         * The document keeps following its text after a write has been made through
         * it. A cell that both read and wrote `source` would freeze here, and the
         * document would go on showing the classes it had before — which is why
         * `class_source` is a plain method.
         */
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
        /**
         * What the whole text looks like after a write, pinned rather than assumed:
         * the classes follow one another with no blank line between them. That is
         * the canonical form, and the code editor of stage 4.1 will show it, so it
         * had better be written down somewhere that fails when it changes.
         */
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
        /**
         * Renaming a class moves the name of the class and nothing else about the
         * document: the properties keep their names, their order and their values,
         * so the pick, the placement and the wires of the editor — all keyed by
         * property name — have nothing to be orphaned by.
         */
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
        /**
         * The half a rename of the declaration alone would leave broken: an heir
         * spells its base, and a part spells the class it is declared with. Both
         * mentions live in ANOTHER class of the document, so both are rewritten in
         * the same write or the document stops compiling.
         */
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
        /** A literal is a data node, so a class name written inside one is text. */
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
        'a rename of a class the document lacks is refused'($) {
            const d1 = pair_doc();
            $mol_assert_fail(() => d1.class_rename(`${d}bog_vmap_lang_test_absent`, `${d}bog_vmap_lang_test_four`), Error);
        },
        /**
         * The canvas gesture in model terms. Two parts, no wire; after a link there
         * are exactly two new lines: the wire on the root and the reference in the
         * target declaration.
         */
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
        /**
         * What a delete of a part has to do first: a wire left with one end on a
         * part that is gone names a property nobody declares.
         */
        'unwiring a part takes both ends of its own wires and no others'($) {
            const node = doc(trio_src);
            node.link_add({ from: 'Calc', from_prop: 'result', to: 'Price', to_prop: 'title' });
            node.link_add({ from: 'Calc', from_prop: 'result', to: 'Note', to_prop: 'title' });
            node.link_add({ from: 'Calc_2', from_prop: 'result', to: 'Note', to_prop: 'hint' });
            node.links_drop('Calc');
            $mol_assert_like(node.links().map(link => [link.from, link.to, link.to_prop]), [['Calc_2', 'Note', 'hint']]);
            $mol_assert_like(node.wires().map(wire => wire.name), ['calc_2_result']);
            $mol_assert_equal(node.source().includes('calc_result'), false);
            // The parts are none of its business: taking them out is the caller's half.
            $mol_assert_ok(node.prop_names().includes('Calc'));
        },
        /**
         * A wire nobody reads is still a wire and still names its node, so it goes
         * with the node too. Reachable from a hand written document and from an
         * import, where a wire may well stand without a consumer.
         */
        'unwiring a part takes its wire even when nobody reads it'($) {
            const node = doc(trio_src);
            node.wire_add({ name: 'calc_result', node: 'Calc', prop: 'result', bidi: false });
            $mol_assert_like(node.wires().map(wire => wire.name), ['calc_result']);
            $mol_assert_like(node.links(), []);
            node.links_drop('Calc');
            $mol_assert_like(node.wires(), []);
            $mol_assert_equal(node.source().includes('calc_result'), false);
        },
        /** A part that only reads a wire goes off it alone; the wire lives while somebody else reads it. */
        'unwiring a consumer keeps the wire while another consumer holds it'($) {
            const node = doc(trio_src);
            node.link_add({ from: 'Calc', from_prop: 'result', to: 'Price', to_prop: 'title' });
            node.link_add({ from: 'Calc', from_prop: 'result', to: 'Note', to_prop: 'title' });
            node.links_drop('Price');
            $mol_assert_like(node.links().map(link => [link.from, link.to]), [['Calc', 'Note']]);
            $mol_assert_ok(node.source().includes('\tcalc_result = Calc result\n'));
            $mol_assert_equal(node.source().includes('Price ' + `${d}mol_view title`), false);
            // The last reader gone, the wire goes with it, as unplugging by hand does.
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
        /**
         * The five traps, from the side of the link rather than of the wire: whatever
         * the ends are, the reference in the target carries a bare name and the wire
         * is two tokens under `=`.
         */
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
        /**
         * The artboard fixture is a fixed point of normalization. Everything below
         * asserts against it, so a fixture the model would reformat on the first
         * write would make every one of those assertions about the serializer.
         */
        'a document with an artboard round trips byte for byte'($) {
            $mol_assert_equal(doc(board_src).source(), board_src);
        },
        'a node with a sub of its own is a container, one without is not'($) {
            const node = doc(board_src);
            $mol_assert_like(node.sub_names(), ['Board', 'Loose']);
            $mol_assert_like(node.sub_names('Board'), ['Head', 'Foot']);
            // Not «no children»: no `sub` at all, which is what a free part is.
            $mol_assert_equal(node.sub_names('Loose'), null);
            $mol_assert_equal(node.sub_names('Nobody'), null);
            // Every property of the document gets asked this, including the ones
            // whose children are not overrides at all: `sub` holds bare references,
            // and reading one as a property signature fails outright.
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
            // The reference is bare, like every other one in `sub`: a reference with
            // a child under it is the middle form of `<=` and declares a property.
            const refs = between.sub_list('Board').kids;
            $mol_assert_like(refs.map(ref => ref.type), ['<=', '<=', '<=']);
            $mol_assert_like(refs.map(ref => ref.kids[0].kids.length), [0, 0, 0]);
        },
        /**
         * Insertion writes into `sub` and NOWHERE else: the declaration of the
         * artboard keeps its style, its order and its line, and the node put inside
         * keeps the declaration it had.
         */
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
            // The declaration never moved: what changed is where it is drawn.
            $mol_assert_equal(node.prop_names().includes('Loose'), true);
        },
        /**
         * The position the user aimed at was read off a list that still held the
         * node being moved, so moving it down by one has to mean what it looked
         * like — otherwise a drag one place to the right does nothing at all.
         */
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
        /**
         * A free part becomes an artboard by growing a `sub`, which is the only
         * difference between the two, and an artboard that already has one is left
         * alone rather than emptied.
         */
        'a node is opened into a container by an empty sub'($) {
            const node = doc(board_src);
            node.sub_open('Loose');
            $mol_assert_like(node.sub_names('Loose'), []);
            node.sub_open('Board');
            $mol_assert_like(node.sub_names('Board'), ['Head', 'Foot']);
        },
        /**
         * Layout properties are ordinary keys of the ordinary `style` dictionary, so
         * an artboard exports as plain $mol and depends on nothing of ours.
         */
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
        /**
         * An inherited dictionary starts with `^`, and `^` has to stay at the head:
         * a dictionary redeclared without it REPLACES the one of the base instead of
         * extending it, so a document over `$mol_button` that grew one `style` key
         * would lose the rest in silence.
         */
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
            // A reference to something that is not a wire is not a link.
            $mol_assert_like(doc(`${d}bog_vmap_lang_test_x ${d}mol_view\n\tlabel \\a\n\tP ${d}mol_view title <= label\n`).links(), []);
        },
        /**
         * A rename is a rewrite of the whole class, not of one line: the name of a
         * node is spelled by everything that points at it. The property also keeps
         * its place — dropping and re-inserting moved it to the end, which reorders
         * the canvas for an edit that moves nothing.
         */
        'renaming a node rewrites the wire that reads it'($) {
            const node = doc(demo_src);
            node.property('Calc').title('Motor');
            $mol_assert_equal(node.source(), demo_src.replace(/Calc(?= |\n)/g, 'Motor'));
            $mol_assert_like(node.prop_names(), ['Price', 'Hero', 'Motor', 'calc_result', 'label', 'sub']);
            // The wire is alive and reads the node under its new name.
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
            // The sub of the renamed node itself is untouched.
            $mol_assert_like(node.sub_names('Stage'), ['Price']);
        },
        /** The other end: renaming the wire moves the name in the part that reads it. */
        'renaming a wire rewrites the binding that reads it'($) {
            const node = doc(demo_src);
            node.property('calc_result').title('total');
            $mol_assert_like(node.links(), [
                { from: 'Calc', from_prop: 'result', to: 'Price', to_prop: 'title', name: 'total', bidi: false },
            ]);
            $mol_assert_equal(node.source().includes('title <= total'), true);
            $mol_assert_equal(node.source().includes('calc_result'), false);
        },
        /**
         * The handle is not patched to follow the rename, and a reader of the name
         * recomputes off the text instead. Under the old shape the `name` method of
         * the live handle was overwritten, so the object addressed one property and
         * read another, past the graph.
         */
        'a reader of the name recomputes on a rename'($) {
            const node = doc(demo_src);
            const reader = $mol_wire_atom.solo(node, function names_reader() {
                return this.prop_names().join(' ');
            });
            $mol_assert_equal(reader.sync().includes('Calc'), true);
            node.property('Calc').title('Motor');
            $mol_assert_equal(reader.sync().includes('Motor'), true);
            $mol_assert_equal(reader.sync().includes('Calc'), false);
            // The handle of the old name addresses nothing now, and says so instead
            // of answering out of what was written through it.
            $mol_assert_equal(node.property('Calc').title(), '');
            $mol_assert_equal(node.property('Motor').title(), 'Motor');
        },
        'a rename onto a name already declared is refused'($) {
            const node = doc(demo_src);
            $mol_assert_fail(() => node.property('Calc').title('Price'), Error);
            // Nothing moved.
            $mol_assert_equal(node.source(), demo_src);
        },
        /** A sign travels with the rename: one write, or the document is unsigned between two. */
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
    /**
     * Tests of the pure half of `$bog_vmap_lib`: parsing, the `$mol_view` stub,
     * the inheritance walk and the united namespace.
     *
     * Nothing here touches the network. CI runs `node.test.js` and a live fetch
     * would make the build depend on a third party host being up.
     *
     * `d` keeps `$` out of the string literals: mam builds its dependency graph by
     * a regexp over sources, literals included, so a bare `$mol_button` in a
     * fixture would drag a whole module into the bundle.
     */
    const d = '$';
    const lib_src = [
        `${d}bog_vmap_lib_test_a ${d}mol_view`,
        `	title \\A`,
        `	count 0`,
        ``,
        `${d}bog_vmap_lib_test_b ${d}bog_vmap_lib_test_a`,
        `	count 1`,
        `	extra \\x`,
        ``,
    ].join('\n');
    const doc_src = [
        `${d}bog_vmap_lib_test_doc ${d}bog_vmap_lib_test_b`,
        `	own \\z`,
        ``,
    ].join('\n');
    $mol_test({
        'predef gives $mol_view its own ports'($) {
            const tree = $.$bog_vmap_lib_parse('');
            const index = $.$bog_vmap_lib_index(tree);
            $mol_assert_equal(index.has(`${d}mol_view`), true);
            const props = $.$bog_vmap_lib_props_map(index, `${d}mol_view`);
            $mol_assert_equal([...props.keys()].join(' '), 'dom_name style event field attr sub title');
        },
        'pack classes land next to the stub'($) {
            const index = $.$bog_vmap_lib_index($.$bog_vmap_lib_parse(lib_src));
            $mol_assert_equal([...index.keys()].join(' '), `${d}mol_view ${d}bog_vmap_lib_test_a ${d}bog_vmap_lib_test_b`);
            $mol_assert_equal(index.get(`${d}bog_vmap_lib_test_b`).type, `${d}bog_vmap_lib_test_a`);
        },
        'inheritance chain ends at the first undeclared name'($) {
            const index = $.$bog_vmap_lib_index($.$bog_vmap_lib_parse(lib_src));
            $mol_assert_equal($.$bog_vmap_lib_chain(index, `${d}bog_vmap_lib_test_b`).join(' '), `${d}bog_vmap_lib_test_b ${d}bog_vmap_lib_test_a ${d}mol_view ${d}mol_object`);
            $mol_assert_equal($.$bog_vmap_lib_chain(index, `${d}nowhere`).join(' '), `${d}nowhere`);
        },
        'props_map carries inherited ports and the most derived value'($) {
            const index = $.$bog_vmap_lib_index($.$bog_vmap_lib_parse(lib_src));
            const props = $.$bog_vmap_lib_props_map(index, `${d}bog_vmap_lib_test_b`);
            // seven from $mol_view, then title redeclared, then count and extra
            $mol_assert_equal([...props.keys()].join(' '), 'dom_name style event field attr sub title count extra');
            // redeclared in the subclass, so the subclass node wins
            $mol_assert_equal(props.get('count').kids[0].type, '1');
            // declared once in the middle of the chain
            $mol_assert_equal(props.get('title').kids[0].value, 'A');
        },
        'a malformed pack points at the row of the pack, not of the stub'($) {
            // `$mol_error_syntax` itself does not fit the `typeof Error` parameter,
            // its constructor takes three arguments
            const error = $mol_assert_fail(() => $.$bog_vmap_lib_parse(`${d}q ${d}w\n\t\t\toops \\\n`, 'pack.view.tree'), SyntaxError);
            // gluing the stub in front of the source, the way studio does, reports
            // this very row as `#10`, eight below where the user has to look
            $mol_assert_equal(String(error.span), 'pack.view.tree#2:1/3');
        },
        'a redeclared port keeps the position of its first declaration'($) {
            const index = $.$bog_vmap_lib_index($.$bog_vmap_lib_parse(lib_src));
            const keys = [...$.$bog_vmap_lib_props_map(index, `${d}bog_vmap_lib_test_b`).keys()];
            // `title` comes from $mol_view and is redeclared by _test_a
            $mol_assert_equal(keys.indexOf('title'), 6);
        },
        'every port names the class it came from'($) {
            const index = $.$bog_vmap_lib_index($.$bog_vmap_lib_parse(lib_src));
            const owner = $.$bog_vmap_lib_props_owner(index, `${d}bog_vmap_lib_test_b`);
            // the same keys as props_map, so «inherited» is one comparison away
            $mol_assert_equal([...owner.keys()].join(' '), [...$.$bog_vmap_lib_props_map(index, `${d}bog_vmap_lib_test_b`).keys()].join(' '));
            $mol_assert_equal(owner.get('sub'), `${d}mol_view`);
            $mol_assert_equal(owner.get('extra'), `${d}bog_vmap_lib_test_b`);
            // `title` is declared twice, the nearer declaration owns it
            $mol_assert_equal(owner.get('title'), `${d}bog_vmap_lib_test_a`);
            // `count` is declared in both classes, so the nearer one is the owner
            $mol_assert_equal(owner.get('count'), `${d}bog_vmap_lib_test_b`);
        },
        'a cycle in the namespace does not hang'($) {
            const src = [
                `${d}bog_vmap_lib_test_x ${d}bog_vmap_lib_test_y`,
                `	left \\`,
                ``,
                `${d}bog_vmap_lib_test_y ${d}bog_vmap_lib_test_x`,
                `	right \\`,
                ``,
            ].join('\n');
            const index = $.$bog_vmap_lib_index($.$bog_vmap_lib_parse(src));
            $mol_assert_equal($.$bog_vmap_lib_chain(index, `${d}bog_vmap_lib_test_x`).join(' '), `${d}bog_vmap_lib_test_x ${d}bog_vmap_lib_test_y`);
            $mol_assert_equal([...$.$bog_vmap_lib_props_map(index, `${d}bog_vmap_lib_test_x`).keys()].join(' '), 'right left');
        },
        'united resolves document classes against the library'($) {
            const lib = $.$bog_vmap_lib_parse(lib_src);
            const doc = $.$bog_vmap_lib_parse(doc_src);
            // the stub is part of every parse, drop it from the document side
            const doc_kids = doc.kids.filter(cl => cl.type !== `${d}mol_view`);
            const index = $.$bog_vmap_lib_index($.$bog_vmap_lib_united(lib, doc_kids));
            const props = $.$bog_vmap_lib_props_map(index, `${d}bog_vmap_lib_test_doc`);
            $mol_assert_equal([...props.keys()].join(' '), 'dom_name style event field attr sub title count extra own');
        },
        'a document class shadows a library class of the same name'($) {
            const lib = $.$bog_vmap_lib_parse(lib_src);
            const own = $.$bog_vmap_lib_parse([
                `${d}bog_vmap_lib_test_a ${d}mol_view`,
                `	mine \\`,
                ``,
            ].join('\n')).kids.filter(cl => cl.type !== `${d}mol_view`);
            const index = $.$bog_vmap_lib_index($.$bog_vmap_lib_united(lib, own));
            const props = $.$bog_vmap_lib_props_map(index, `${d}bog_vmap_lib_test_a`);
            // the library declaration of _test_a is gone, only the document one is left
            $mol_assert_equal(props.has('mine'), true);
            $mol_assert_equal(props.has('count'), false);
        },
        'united of nothing is the library itself'($) {
            const lib = $.$bog_vmap_lib_parse(lib_src);
            $mol_assert_equal($.$bog_vmap_lib_united(lib, []), lib);
        },
        'lists and search over a namespace'($) {
            const lib = $.$bog_vmap_lib.make({
                $,
                tree: () => $.$bog_vmap_lib_parse(lib_src),
            });
            $mol_assert_equal(lib.class_list().join(' '), `${d}mol_view ${d}bog_vmap_lib_test_a ${d}bog_vmap_lib_test_b`);
            $mol_assert_equal(lib.base_options().join(' '), `${d}bog_vmap_lib_test_b ${d}bog_vmap_lib_test_a ${d}mol_view`);
            $mol_assert_equal(lib.class_search('test_b').join(' '), `${d}bog_vmap_lib_test_b`);
            $mol_assert_equal(lib.class_search('').length, 3);
            $mol_assert_equal(lib.inherit_chain(`${d}bog_vmap_lib_test_a`).length, 3);
            $mol_assert_equal(lib.props_map(`${d}bog_vmap_lib_test_a`).size, 8);
            // props_of is the same set as a tree, most derived first
            $mol_assert_equal(lib.props_of(`${d}bog_vmap_lib_test_b`).kids[0].type, 'extra');
        },
        'the pack address drives both links'($) {
            const lib = $.$bog_vmap_lib.make({ $ });
            $mol_assert_equal(lib.tree_link(), 'https://mol.hyoo.ru/web.view.tree');
            $mol_assert_equal(lib.script_link(), 'https://mol.hyoo.ru/web.js');
            lib.pack('https://example.org/app/');
            $mol_assert_equal(lib.tree_link(), 'https://example.org/app/web.view.tree');
            $mol_assert_equal(lib.script_link(), 'https://example.org/app/web.js');
        },
        /**
         * A pack served from a sub path is the normal case: every app of ours sits
         * at `<user>.github.io/<repo>/`. Without the trailing slash `new URL` would
         * take `<repo>` for a file name and drop it.
         */
        'a pack address without a trailing slash keeps its last segment'($) {
            const lib = $.$bog_vmap_lib.make({ $ });
            lib.pack('https://b-on-g.github.io/gram');
            $mol_assert_equal(lib.tree_link(), 'https://b-on-g.github.io/gram/web.view.tree');
            $mol_assert_equal(lib.script_link(), 'https://b-on-g.github.io/gram/web.js');
            // the address the user typed is left alone, only the derived base grows
            $mol_assert_equal(lib.pack(), 'https://b-on-g.github.io/gram');
            $mol_assert_equal(lib.pack_base(), 'https://b-on-g.github.io/gram/');
            lib.pack('https://b-on-g.github.io/gram/');
            $mol_assert_equal(lib.tree_link(), 'https://b-on-g.github.io/gram/web.view.tree');
        },
        /**
         * The dev server keeps a module in `<pack>/<module>/-/`, so a sibling of the
         * page keeps the `-` as well. Both entry pages of a module live there, and
         * the editor is developed on `test.html`.
         */
        'a sibling module on the dev server keeps the build folder'($) {
            const page = 'http://localhost:9080/bog/vmap/app/-/test.html';
            $mol_assert_equal($bog_vmap_lib_sibling(page, 'scene'), 'http://localhost:9080/bog/vmap/scene/-/');
            $mol_assert_equal($bog_vmap_lib_sibling(page, 'part'), 'http://localhost:9080/bog/vmap/part/-/');
            $mol_assert_equal($bog_vmap_lib_sibling('http://localhost:9080/bog/vmap/app/-/index.html', 'scene'), 'http://localhost:9080/bog/vmap/scene/-/');
        },
        /**
         * A deploy publishes the editor at the root of the site and every other
         * module as a folder beneath it, so a sibling is a folder INSIDE the one the
         * editor is served from. The address of the pack is then `<site>/part/`,
         * which is where `web.view.tree` is, and the bundle of the sandbox is
         * `<site>/scene/web.js` — neither of them a page.
         */
        'a sibling module on a deploy is a folder under the editor'($) {
            $mol_assert_equal($bog_vmap_lib_sibling('https://b-on-g.github.io/vmap/', 'scene'), 'https://b-on-g.github.io/vmap/scene/');
            $mol_assert_equal($bog_vmap_lib_sibling('https://b-on-g.github.io/vmap/', 'part'), 'https://b-on-g.github.io/vmap/part/');
            $mol_assert_equal($bog_vmap_lib_sibling('https://b-on-g.github.io/vmap/index.html', 'part'), 'https://b-on-g.github.io/vmap/part/');
        },
        /**
         * A folder address without its slash reads the same: a last segment with no
         * dot in it is a folder, not a page file. GitHub Pages answers both.
         */
        'a page address without a trailing slash reads as a folder'($) {
            $mol_assert_equal($bog_vmap_lib_sibling('https://b-on-g.github.io/vmap', 'part'), 'https://b-on-g.github.io/vmap/part/');
            $mol_assert_equal($bog_vmap_lib_sibling('https://b-on-g.github.io/vmap?x=1#y', 'scene'), 'https://b-on-g.github.io/vmap/scene/');
        },
        /**
         * A dot in a FOLDER name does not make it a page. A versioned deploy is the
         * ordinary way to get one, and taking `v1.2` for a page would eat the
         * segment and point both addresses a level above where they live.
         */
        'a dot in a folder name is not a page file'($) {
            $mol_assert_equal($bog_vmap_lib_sibling('https://b-on-g.github.io/vmap/v1.2/', 'part'), 'https://b-on-g.github.io/vmap/v1.2/part/');
            $mol_assert_equal($bog_vmap_lib_sibling('https://b-on-g.github.io/vmap/v1.2/index.html', 'scene'), 'https://b-on-g.github.io/vmap/v1.2/scene/');
        },
        /**
         * The editor on a domain of its own is served from the root itself, so the
         * siblings are the first segment there. Nothing is eaten and no address
         * climbs above the root, which is the one thing that must never happen here.
         */
        'an editor served from the root of a site keeps its siblings under it'($) {
            $mol_assert_equal($bog_vmap_lib_sibling('https://vmap.example/', 'part'), 'https://vmap.example/part/');
            $mol_assert_equal($bog_vmap_lib_sibling('https://vmap.example/index.html', 'scene'), 'https://vmap.example/scene/');
            $mol_assert_equal($bog_vmap_lib_sibling('https://vmap.example', 'part'), 'https://vmap.example/part/');
        },
        /**
         * A `data:` address keeps the fetch offline while still going through the
         * real `$mol_fetch`, so `tree()` is covered end to end and CI stays free of
         * a third party host.
         */
        async 'a pack is fetched and parsed'($) {
            const lib = $.$bog_vmap_lib.make({
                $,
                tree_link: () => 'data:text/plain,' + encodeURIComponent(lib_src),
            });
            $mol_assert_equal((await $.$mol_wire_async(lib).class_list()).join(' '), `${d}mol_view ${d}bog_vmap_lib_test_a ${d}bog_vmap_lib_test_b`);
        },
        /**
         * The one behaviour a try/catch inside `tree()` would quietly destroy: a
         * dead pack has to reach the view as an error, not as an empty palette.
         */
        async 'an unreachable pack fails instead of emptying the palette'($) {
            const lib = $.$bog_vmap_lib.make({ $, tree_link: () => 'data:' });
            let failed = '';
            try {
                await $.$mol_wire_async(lib).class_list();
            }
            catch (error) {
                failed = error.constructor.name;
            }
            $mol_assert_equal(failed, '$mol_error_mix');
        },
        /**
         * The wording of a dead pack. A status line alone — «Not Found» — is true
         * and useless: it names neither the file that was missing nor the field to
         * correct, and that is exactly what reached the screen.
         */
        'a dead pack is worded with the address that was fetched'($) {
            const note = $.$bog_vmap_lib_pack_note('https://dead.test/web.view.tree', new Error('Not Found'));
            $mol_assert_ok(note.includes('Not Found'));
            $mol_assert_ok(note.includes('https://dead.test/web.view.tree'));
            // With no address to name — a library of lands alone — it says the one
            // thing it knows rather than an empty «Ожидался ».
            const bare = $.$bog_vmap_lib_pack_note('', new Error('Failed to fetch'));
            $mol_assert_equal(bare, 'Пак не отвечает: Failed to fetch');
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    /**
     * Tests of the inspector stand, and only of what does not need a network.
     *
     * The row list needs `$bog_vmap_lib`, which fetches a deployed pack, so it is
     * not touched here: a test that reaches the network is a test that fails on a
     * train. What IS tested is the thing that used to eat data — a document of
     * several classes, edited one class at a time.
     *
     * The guarantee itself belongs to `$bog_vmap_lang_doc` and is proven there. The
     * point here is narrower and still worth pinning: that the stand is wired to it
     * at all, rather than to the class model it looks like it could be wired to.
     */
    $mol_test({
        'the stand hands the inspector one class of a multi class document'($) {
            const stand = $.$bog_vmap_app_inspect_demo.make({ $ });
            const names = stand.names();
            $mol_assert_equal(names.length, 2);
            $mol_assert_ok(stand.class_source().startsWith(names[0]));
        },
        'picking a class switches what the stand hands over'($) {
            const stand = $.$bog_vmap_app_inspect_demo.make({ $ });
            const names = stand.names();
            stand.klass(names[1]);
            $mol_assert_ok(stand.class_source().startsWith(names[1]));
        },
        'an edit through the stand leaves the other class byte for byte'($) {
            const stand = $.$bog_vmap_app_inspect_demo.make({ $ });
            const other = stand.names()[1];
            const before = stand.Doc().class_source(other);
            stand.class_source(stand.class_source().replace('count 24', 'count 42'));
            $mol_assert_equal(stand.Doc().class_source(other), before);
            $mol_assert_ok(stand.class_source().includes('count 42'));
        },
        /**
         * The classes the inspector hands to the library: the one being edited plus
         * its siblings, and never a second copy of itself. `$bog_vmap_lib_index`
         * keeps the LAST declaration of a name, so a stale twin among the peers
         * would quietly shadow the class actually being edited.
         */
        'the inspected class is not duplicated by its own peers'($) {
            const stand = $.$bog_vmap_app_inspect_demo.make({ $ });
            const types = stand.Inspect().classes().map(tree => tree.type);
            $mol_assert_like(types, stand.names());
        },
        /**
         * The layout panel writes into the ordinary `style` dictionary of the node,
         * so what an artboard is made of is what a hand written $mol document would
         * carry, and an export has nothing to learn about artboards.
         */
        'layout properties land in the style of the node and read back'($) {
            const inspect = inspect_of($, [
                `${d}bog_vmap_app_inspect_test_page ${d}mol_view`,
                '	sub /',
                '',
            ].join('\n'));
            $mol_assert_equal(inspect.Flex().direction(), '');
            inspect.Flex().direction('column');
            inspect.Flex().gap('1rem');
            $mol_assert_equal(inspect.Flex().direction(), 'column');
            $mol_assert_equal(inspect.Flex().gap(), '1rem');
            $mol_assert_equal(inspect.Node().source(), [
                `${d}bog_vmap_app_inspect_test_page ${d}mol_view`,
                '	sub /',
                '	style *',
                '		^',
                '		flexDirection \\column',
                '		gap \\1rem',
                '',
            ].join('\n'));
            // Empty takes the key out again, and the dictionary keeps the rest.
            inspect.Flex().gap('');
            $mol_assert_equal(inspect.Flex().gap(), '');
            $mol_assert_equal(inspect.Node().source().includes('gap'), false);
            $mol_assert_equal(inspect.Flex().direction(), 'column');
        },
        /**
         * `^` first, always. A dictionary redeclared without it replaces the one of
         * the base instead of extending it, so a node that grew one layout key would
         * lose every style its class sets, without a word.
         */
        'the inherited head of the style dictionary is kept'($) {
            const inspect = inspect_of($, [
                `${d}bog_vmap_app_inspect_test_card ${d}mol_view`,
                '	style *',
                '		^',
                '		padding \\4px',
                '',
            ].join('\n'));
            inspect.Flex().across('center');
            $mol_assert_like(inspect.style_dict().kids.map(kid => kid.type), ['^', 'padding', 'alignItems']);
        },
        /**
         * `$mol_dom_render_styles` appends `px` to a number, so `flexGrow 1` comes
         * out as `flex-grow: 1px` — not a length, not a growth factor, dropped, and
         * the node does not stretch. The document has to carry text.
         */
        'stretching is written as text, because a number would get px'($) {
            const inspect = inspect_of($, [
                `${d}bog_vmap_app_inspect_test_cell ${d}mol_view`,
                '	sub /',
                '',
            ].join('\n'));
            inspect.Flex().grow(true);
            $mol_assert_equal(inspect.Flex().grow(), true);
            $mol_assert_ok(inspect.Node().source().includes('flexGrow \\1'));
            inspect.Flex().grow(false);
            $mol_assert_equal(inspect.Flex().grow(), false);
            $mol_assert_equal(inspect.Node().source().includes('flexGrow'), false);
        },
        /** The width of the page is the same kind of fact, set through the same key. */
        'the width switch sets the width of the artboard'($) {
            const inspect = inspect_of($, [
                `${d}bog_vmap_app_inspect_test_board ${d}mol_view`,
                '	style * width \\1280px',
                '	sub /',
                '',
            ].join('\n'));
            $mol_assert_equal(inspect.Flex().width(), '1280px');
            inspect.Flex().width('390px');
            $mol_assert_equal(inspect.Flex().width(), '390px');
            $mol_assert_ok(inspect.Node().source().includes('width \\390px'));
        },
        /**
         * Typing is not renaming. A rename rewrites the declaration and everything
         * that points at it, so a write per keystroke would rename the node to every
         * prefix of what is being typed and drag the whole document along.
         */
        'the name field renames on submit and not on a keystroke'($) {
            const inspect = inspect_of($, [
                `${d}bog_vmap_app_inspect_test_name ${d}mol_view`,
                '	sub /',
                '',
            ].join('\n'));
            $mol_assert_equal(inspect.title_value(), `${d}bog_vmap_app_inspect_test_name`);
            inspect.title_value(`${d}bog_vmap_app_inspect_test_hero`);
            // Typed, not committed: the field shows it, the document does not have it.
            $mol_assert_equal(inspect.title_value(), `${d}bog_vmap_app_inspect_test_hero`);
            $mol_assert_equal(inspect.class_title(), `${d}bog_vmap_app_inspect_test_name`);
            inspect.title_submit();
            $mol_assert_equal(inspect.class_title(), `${d}bog_vmap_app_inspect_test_hero`);
            $mol_assert_ok(inspect.Node().source().startsWith(`${d}bog_vmap_app_inspect_test_hero `));
        },
        /** A draft belongs to the name it started from, so a fresh name starts a fresh draft. */
        'the field follows the name once the rename lands'($) {
            const inspect = inspect_of($, [
                `${d}bog_vmap_app_inspect_test_name ${d}mol_view`,
                '	sub /',
                '',
            ].join('\n'));
            inspect.title_value(`${d}bog_vmap_app_inspect_test_hero`);
            inspect.title_submit();
            $mol_assert_equal(inspect.title_value(), `${d}bog_vmap_app_inspect_test_hero`);
            // Nothing to commit twice.
            inspect.title_submit();
            $mol_assert_equal(inspect.class_title(), `${d}bog_vmap_app_inspect_test_hero`);
        },
        /** No refusal, no strip: an empty strip in a panel this narrow reads as a bug. */
        'the refusal strip is there only while there is a refusal'($) {
            const inspect = inspect_of($, [
                `${d}bog_vmap_app_inspect_test_name ${d}mol_view`,
                '	sub /',
                '',
            ].join('\n'));
            $mol_assert_equal(inspect.sub().includes(inspect.Note()), false);
            const refused = $.$bog_vmap_app_inspect.make({
                $,
                source: () => `${d}bog_vmap_app_inspect_test_name ${d}mol_view\n\tsub /\n`,
                title_note: () => 'Имя занято',
            });
            // Right under the head, where the eye already is.
            $mol_assert_equal(refused.sub()[1], refused.Note());
        },
        /**
         * A source with no class in it is a state, not a failure.
         *
         * Every cell of this panel derives from one class, so with none they all
         * fail at once and the panel answers with a wall of red strips. It happened
         * on the deploy, where a pick outlived the document it was made in.
         */
        'a source naming no class leaves an invitation, not twenty failures'($) {
            const one = inspect_of($, '');
            $mol_assert_equal(one.class_ready(), false);
            // By identity and not by likeness: two live views compared deeply walk
            // into their own machinery, and what comes back says nothing about the
            // panel. Nothing else is even asked here, so nothing else can throw.
            $mol_assert_equal(one.sub().length, 1);
            $mol_assert_equal(one.sub()[0], one.Empty());
            // And a panel over a real class is whole. A SECOND inspector and not a
            // write into this one: the stand hands the source in as a plain closure,
            // so a write through it invalidates no cell and the failed parse would
            // stay cached — an artefact of the stand, not of the panel.
            const two = inspect_of($, `${d}my_card ${d}mol_view\n\ttitle \\Hi\n`);
            $mol_assert_equal(two.class_ready(), true);
            $mol_assert_ok(two.sub().length > 1);
        },
    });
    /** `d` keeps `$` out of the literals: mam reads them when building its graph. */
    const d = '$';
    /**
     * An inspector over one class held in a local variable.
     *
     * The library is never touched, so nothing here reaches the network: the layout
     * panel asks the document what it says and writes back into it, and inherited
     * ports are somebody else's question.
     */
    function inspect_of($, source) {
        let text = source;
        return $.$bog_vmap_app_inspect.make({
            $,
            source: (next) => next === undefined ? text : (text = next),
        });
    }
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    /**
     * The wire layer on numbers: where the dots go, how a wire bends, what hits,
     * what fits. Nothing here touches the DOM.
     */
    const box = (left, top, width = 100, height = 50) => ({ left, top, width, height });
    const port = (name, kind, next = false) => ({ name, next, kind });
    const dot = (over) => ({
        node: 'A',
        port: port('value', 'string'),
        side: 'in',
        lit: true,
        linked: false,
        ...over,
    });
    $mol_test({
        /**
         * The overlay is cut open exactly along the box of the picked part. A dot
         * inside the box would be clipped away and take no press, so every dot
         * must lie strictly outside, with its whole radius.
         */
        'ports sit outside the box on both sides, one row each'($) {
            const b = box(100, 200, 60, 30);
            for (let i = 0; i < 5; ++i) {
                const [ix, iy] = $bog_vmap_app_wire_port_point(b, 'in', i);
                const [ox, oy] = $bog_vmap_app_wire_port_point(b, 'out', i);
                $mol_assert_equal(ix + $bog_vmap_app_wire_radius < b.left, true);
                $mol_assert_equal(ox - $bog_vmap_app_wire_radius > b.left + b.width, true);
                $mol_assert_equal(iy, oy);
                $mol_assert_equal(iy, b.top + $bog_vmap_app_wire_row / 2 + i * $bog_vmap_app_wire_row);
            }
        },
        /** Rows are screen pixels: the same box twice as big on screen gives the same row height. */
        'port rows do not scale with the camera'($) {
            // The same world box at zoom 1 and at zoom 4.
            const small = $bog_vmap_app_wire_port_point(box(0, 0, 10, 10), 'out', 1);
            const big = $bog_vmap_app_wire_port_point(box(0, 0, 40, 40), 'out', 1);
            $mol_assert_equal(small[1], big[1]);
            $mol_assert_equal(big[0] - small[0], 30);
        },
        'a wire is one cubic Bezier from end to end'($) {
            const d = $bog_vmap_app_wire_curve([0, 0], [200, 100]);
            $mol_assert_equal(d, 'M 0 0 C 100 0, 100 100, 200 100');
            const mid = $bog_vmap_app_wire_curve_mid([0, 0], [200, 100]);
            $mol_assert_like(mid, [100, 50]);
        },
        /**
         * REPRO: two children of one container sit at the same left edge, so the
         * output of the upper one is to the RIGHT of the input of the lower one.
         * Horizontal tangents there loop the wire out past the box and back in from
         * the far side, which reads as a wire that is broken rather than short.
         */
        'a wire that runs backwards turns its tangents and stays between its ends'($) {
            // Upper child: box left 100, so its output dot is at 100 + 200 + 12.
            // Lower child: same left edge, so its input dot is at 100 - 12.
            const from = [312, 20];
            const to = [88, 120];
            const d = $bog_vmap_app_wire_curve(from, to);
            // Every control point stays within the span of the ends: no loop outside.
            const xs = d.match(/-?\d+(\.\d+)?/g).map(Number).filter((_, i) => i % 2 === 0);
            $mol_assert_equal(Math.max(...xs), from[0]);
            $mol_assert_equal(Math.min(...xs), to[0]);
            // The tangents are vertical: the curve steps down and comes in from above.
            $mol_assert_equal(d, 'M 312 20 C 312 70, 88 70, 88 120');
            // The label rides the curve, not the straight line between the ends.
            $mol_assert_like($bog_vmap_app_wire_curve_mid(from, to), [200, 70]);
        },
        /** A wire that runs forwards is unchanged: ends already point at each other. */
        'a short forward wire keeps a minimal reach'($) {
            $mol_assert_equal($bog_vmap_app_wire_curve([0, 0], [10, 0]), 'M 0 0 C 40 0, -30 0, 10 0');
        },
        'the dot under a point, last one on top'($) {
            const dots = [
                dot({ x: 10, y: 10, node: 'A' }),
                dot({ x: 14, y: 10, node: 'B' }),
                dot({ x: 100, y: 100, node: 'C' }),
            ];
            $mol_assert_equal($bog_vmap_app_wire_dot_at(dots, [12, 10])?.node, 'B');
            $mol_assert_equal($bog_vmap_app_wire_dot_at(dots, [5, 10])?.node, 'A');
            $mol_assert_equal($bog_vmap_app_wire_dot_at(dots, [100, 100 + $bog_vmap_app_wire_hit])?.node, 'C');
            $mol_assert_equal($bog_vmap_app_wire_dot_at(dots, [100, 100 + $bog_vmap_app_wire_hit + 1]), null);
            $mol_assert_equal($bog_vmap_app_wire_dot_at(dots, [50, 50]), null);
        },
        'compatibility by shape'($) {
            $mol_assert_equal($bog_vmap_app_wire_fits('number', 'number'), true);
            $mol_assert_equal($bog_vmap_app_wire_fits('string', 'locale'), true);
            $mol_assert_equal($bog_vmap_app_wire_fits('number', 'string'), false);
            $mol_assert_equal($bog_vmap_app_wire_fits('list', 'bool'), false);
            // Unknown shape on either end fits anything.
            $mol_assert_equal($bog_vmap_app_wire_fits('null', 'list'), true);
            $mol_assert_equal($bog_vmap_app_wire_fits('number', 'get'), true);
            $mol_assert_equal($bog_vmap_app_wire_fits('bind', 'number'), true);
        },
        /**
         * From a class of every shape, the ports one may wire: values and references,
         * never sub views, dictionaries or keyed properties.
         */
        'ports are the value shaped, unkeyed properties of the class'($) {
            const d = '$';
            const tree = $.$mol_tree2_from_string([
                `title \\Hi`,
                `count 3`,
                `enabled true`,
                `click? null`,
                `items /`,
                `label @ \\Loc`,
                `Icon ${d}mol_view`,
                `attr *`,
                `Item* ${d}mol_view`,
                `Row* null`,
                `bound <= other`,
                `both? <=> other?`,
                `wired = Calc result`,
                ``,
            ].join('\n'));
            const props = new Map(tree.kids.map(prop => [$.$mol_view_tree2_prop_parts(prop).name, prop]));
            const ports = $.$bog_vmap_app_wire_ports(props);
            $mol_assert_like(ports.map(port => `${port.name}${port.next ? '?' : ''}:${port.kind}`), ['title:string', 'count:number', 'enabled:bool', 'click?:null', 'items:list', 'label:locale', 'bound:get', 'both?:bind']);
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    $mol_test_mocks.push(context => {
        class $mol_state_arg_mock extends $mol_state_arg {
            static $ = context;
            static href(next) { return next || ''; }
            static go(next) {
                this.href(this.link(next));
            }
        }
        __decorate([
            $mol_mem
        ], $mol_state_arg_mock, "href", null);
        __decorate([
            $mol_action
        ], $mol_state_arg_mock, "go", null);
        context.$mol_state_arg = $mol_state_arg_mock;
    });
    $mol_test({
        'args as dictionary'($) {
            $.$mol_state_arg.href('#!foo=bar/xxx');
            $mol_assert_equal($.$mol_state_arg.dict(), { foo: 'bar', xxx: '' });
            $.$mol_state_arg.dict({ foo: null, yyy: '', lol: '123' });
            $mol_assert_equal($.$mol_state_arg.href().replace(/.*#/, '#'), '#!yyy/lol=123');
        },
        'one value from args'($) {
            $.$mol_state_arg.href('#!foo=bar/xxx');
            $mol_assert_equal($.$mol_state_arg.value('foo'), 'bar');
            $mol_assert_equal($.$mol_state_arg.value('xxx'), '');
            $.$mol_state_arg.value('foo', 'lol');
            $mol_assert_equal($.$mol_state_arg.href().replace(/.*#/, '#'), '#!foo=lol/xxx');
            $.$mol_state_arg.value('foo', '');
            $mol_assert_equal($.$mol_state_arg.href().replace(/.*#/, '#'), '#!foo/xxx');
            $.$mol_state_arg.value('foo', null);
            $mol_assert_equal($.$mol_state_arg.href().replace(/.*#/, '#'), '#!xxx');
        },
        'nested args'($) {
            const base = new $.$mol_state_arg('nested.');
            class Nested extends $mol_state_arg {
                constructor(prefix) {
                    super(base.prefix + prefix);
                }
                static value = (key, next) => base.value(key, next);
            }
            $.$mol_state_arg.href('#!foo=bar/nested.xxx=123');
            $mol_assert_equal(Nested.value('foo'), null);
            $mol_assert_equal(Nested.value('xxx'), '123');
            Nested.value('foo', 'lol');
            $mol_assert_equal($.$mol_state_arg.href().replace(/.*#/, '#'), '#!foo=bar/nested.xxx=123/nested.foo=lol');
        },
    });
})($ || ($ = {}));

;
"use strict";
/** @jsx $mol_jsx */
/** @jsxFrag $mol_jsx_frag */
var $;
(function ($) {
    $mol_test({
        'safe tag'() {
            $mol_assert_equal($mol_dom_serialize($$.$mol_dom_safe([$mol_jsx("div", null, "foo")])[0]), $mol_dom_serialize($mol_jsx("div", null, "foo")));
        },
        'bad tag'() {
            $mol_assert_equal($mol_dom_serialize($$.$mol_dom_safe([$mol_jsx("script", null, "alert('ahtung!')")])[0]), $mol_dom_serialize($mol_jsx($mol_jsx_frag, null, "alert('ahtung!')")));
        },
        'common attr'() {
            $mol_assert_equal($mol_dom_serialize($$.$mol_dom_safe([$mol_jsx("a", { id: "foo" }, "foo")])[0]), $mol_dom_serialize($mol_jsx("a", { id: "foo" }, "foo")));
        },
        'safe attr'() {
            $mol_assert_equal($mol_dom_serialize($$.$mol_dom_safe([$mol_jsx("a", { href: "https://example.org/" }, "foo")])[0]), $mol_dom_serialize($mol_jsx("a", { href: "https://example.org/" }, "foo")));
        },
        'bad attr'() {
            $mol_assert_equal($mol_dom_serialize($$.$mol_dom_safe([$mol_jsx("a", { onclick: "alert('ahtung!')" }, "foo")])[0]), $mol_dom_serialize($mol_jsx("a", null, "foo")));
        },
        'danger attr'() {
            $mol_assert_equal($mol_dom_serialize($$.$mol_dom_safe([$mol_jsx("a", { href: "javascript:alert('ahtung!')" }, "foo")])[0]), $mol_dom_serialize($mol_jsx("a", { href: "about:blank#javascript:alert('ahtung!')" }, "foo")));
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    /**
     * Tests of where a drop into an artboard lands.
     *
     * Pure geometry, so a fixture is a container and a few boxes. What the document
     * says about the layout never enters: the host does not compile it and has no
     * layout of its own, and the boxes are all it is told.
     */
    const box = (x, y, width, height) => ({ x, y, width, height });
    /** A page of three rows, stacked down the artboard. */
    const column = [box(0, 0, 400, 100), box(0, 100, 400, 100), box(0, 200, 400, 100)];
    /** The same three, laid side by side. */
    const row = [box(0, 0, 100, 300), box(100, 0, 100, 300), box(200, 0, 100, 300)];
    const board = box(0, 0, 400, 300);
    $mol_test({
        /**
         * Three sources, in this order and for this reason: what the node declares is
         * a line of the document rather than a guess; the boxes of the children are
         * the fallback and say nothing when there are fewer than two of them; a
         * column is the last resort and what a page is set to.
         */
        'the declared direction wins, then the geometry, then a column'($) {
            // Declared, and the children say the opposite. The declaration is right:
            // the boxes of a box that has just been re-declared are the old layout.
            $mol_assert_equal($bog_vmap_app_pane_slot_axis(column, 'row'), 'row');
            $mol_assert_equal($bog_vmap_app_pane_slot_axis(row, 'column'), 'column');
            // Nothing declared: read off where the children came out.
            $mol_assert_equal($bog_vmap_app_pane_slot_axis(column), 'column');
            $mol_assert_equal($bog_vmap_app_pane_slot_axis(row), 'row');
            $mol_assert_equal($bog_vmap_app_pane_slot_axis(column, ''), 'column');
            // Neither: a column. One child is exactly as silent as none, which is why
            // the declaration has to come first at all.
            $mol_assert_equal($bog_vmap_app_pane_slot_axis([]), 'column');
            $mol_assert_equal($bog_vmap_app_pane_slot_axis([column[0]]), 'column');
            $mol_assert_equal($bog_vmap_app_pane_slot_axis([column[0]], 'row'), 'row');
            // A direction we do not act on is not taken at its word: a reversed box
            // lays its children out backwards from the order `sub` lists them, so a
            // position counted along the boxes would be the mirror of the one written.
            $mol_assert_equal($bog_vmap_app_pane_slot_axis(row, 'row-reverse'), 'row');
            $mol_assert_equal($bog_vmap_app_pane_slot_axis(column, 'row-reverse'), 'column');
        },
        /** One child and a declared row: the position is counted across, not down. */
        'a declared direction decides where a lone child is passed'($) {
            const one = [box(0, 0, 100, 300)];
            const before = $bog_vmap_app_pane_slot('Board', board, one, [20, 150], 'row');
            const after = $bog_vmap_app_pane_slot('Board', board, one, [80, 150], 'row');
            $mol_assert_equal(before.index, 0);
            $mol_assert_equal(after.index, 1);
            // Undeclared, the same lone child is judged down the column instead, so
            // the very same point lands on the other side of it.
            $mol_assert_equal($bog_vmap_app_pane_slot('Board', board, one, [20, 200]).index, 1);
            $mol_assert_equal($bog_vmap_app_pane_slot('Board', board, one, [80, 200], 'row').index, 1);
            $mol_assert_equal($bog_vmap_app_pane_slot('Board', board, one, [20, 200], 'row').index, 0);
        },
        /**
         * The middle of a child decides, not the gap between children: children of a
         * flex box usually touch, and pointing at the upper half of one plainly means
         * «above this one».
         */
        'a point above the middle of a child goes before it'($) {
            const at = (y) => $bog_vmap_app_pane_slot('Board', board, column, [200, y]).index;
            $mol_assert_equal(at(10), 0);
            $mol_assert_equal(at(49), 0);
            $mol_assert_equal(at(51), 1);
            $mol_assert_equal(at(149), 1);
            $mol_assert_equal(at(151), 2);
            $mol_assert_equal(at(290), 3);
        },
        'a row is judged along the other axis'($) {
            const at = (x) => $bog_vmap_app_pane_slot('Board', board, row, [x, 150]).index;
            $mol_assert_equal(at(10), 0);
            $mol_assert_equal(at(120), 1);
            $mol_assert_equal(at(290), 3);
        },
        /** The line lies on the boundary and spans the container, flat across it. */
        'the line is drawn between the children, and at the edge at either end'($) {
            const head = $bog_vmap_app_pane_slot('Board', board, column, [200, 10]);
            $mol_assert_like(head.line, { x: 0, y: 0, width: 400, height: 0 });
            const between = $bog_vmap_app_pane_slot('Board', board, column, [200, 120]);
            $mol_assert_like(between.line, { x: 0, y: 100, width: 400, height: 0 });
            const tail = $bog_vmap_app_pane_slot('Board', board, column, [200, 290]);
            $mol_assert_like(tail.line, { x: 0, y: 300, width: 400, height: 0 });
            const across = $bog_vmap_app_pane_slot('Board', board, row, [120, 150]);
            $mol_assert_like(across.line, { x: 100, y: 0, width: 0, height: 300 });
        },
        /** An empty artboard takes the drop at its own top edge, at position zero. */
        'an empty container offers the one position it has'($) {
            const slot = $bog_vmap_app_pane_slot('Board', box(40, 60, 400, 300), [], [200, 200]);
            $mol_assert_equal(slot.index, 0);
            $mol_assert_like(slot.line, { x: 40, y: 60, width: 400, height: 0 });
        },
        /** A gap between children puts the line in the middle of it, not on a child. */
        'the line splits the gap when there is one'($) {
            const gapped = [box(0, 0, 400, 100), box(0, 140, 400, 100)];
            const slot = $bog_vmap_app_pane_slot('Board', board, gapped, [200, 120]);
            $mol_assert_equal(slot.index, 1);
            $mol_assert_equal(slot.line.y, 120);
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    /**
     * The overlay cut open, as arithmetic: no pane and no camera, just the
     * `clip-path` value the inner rectangle turns into.
     */
    $mol_test({
        'the hole is a polygon with the box cut out of it'($) {
            $mol_assert_equal($bog_vmap_app_pane_hole(null), 'none');
            $mol_assert_equal($bog_vmap_app_pane_hole({ left: 1, top: 2, width: 3, height: 4 }), 'polygon(evenodd, 0 0, 100% 0, 100% 100%, 0 100%, 0 0, 1px 2px, 4px 2px, 4px 6px, 1px 6px, 1px 2px)');
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    /**
     * The gate over the scene: what a press, a move and a release do, without a
     * browser. The pane is given a geometry and a fake peer window, and what is
     * checked is what it picks, what it sends and when the watchdog is armed.
     *
     * `d` keeps `$` out of the string literals — mam builds its dependency graph by
     * a regexp over sources, literals included.
     */
    const d = '$';
    const root = `${d}doc`;
    const calc = `${d}flow_calc`;
    const map = `${d}flow_map`;
    /**
     * A pane with a scene that has said `ready`, a known rectangle and a listening
     * peer. The clock is the test's own and moves only when the test says so, or a
     * push and its answer could land on the same millisecond.
     */
    const pane_make = ($, rect = {}, over = {}) => {
        const posted = [];
        const peer = {
            origin: 'null',
            postMessage(data) { posted.push(data); },
        };
        const clock = { now: 1000 };
        // Every name the geometry mentions is a node of the document, unless the
        // scenario says otherwise: these tests hand in the boxes themselves, and
        // what they hand in is what they mean. A scenario about the boundary
        // between the document and the insides of a pack class says so outright.
        const declared = () => {
            const names = new Set();
            for (const key of Object.keys(pane.sizes_last)) {
                for (const step of key.split('/').slice(1))
                    names.add(step);
            }
            return [...names];
        };
        const pane = $$.$bog_vmap_app_pane.make({
            $,
            doc_root: () => root,
            doc_names: declared,
            pane_rect: () => ({ left: 0, top: 0, width: 1000, height: 800, ...rect }),
            scene_peer: () => peer,
            now: () => clock.now,
            ...over,
        });
        pane.handshake(pane.scene_key(), 1);
        const answer = (data) => {
            clock.now++;
            pane.message_receive({ data: { ns: $bog_vmap_bridge_ns, ...data }, source: peer });
        };
        return { pane, peer, posted, clock, answer };
    };
    const box = (x, y, width = 100, height = 50) => ({ x, y, width, height });
    const pointer = (clientX, clientY, over = {}) => ({
        button: 0,
        buttons: 1,
        pointerId: 1,
        clientX,
        clientY,
        altKey: false,
        ctrlKey: false,
        metaKey: false,
        shiftKey: false,
        preventDefault() { },
        ...over,
    });
    const clicks = (posted) => posted.filter(m => m.kind === 'click_at');
    /** A timer that never fires by itself, so the test decides when time passes. */
    const timers_fake = ($) => {
        const made = [];
        $.$mol_after_timeout = class extends $mol_after_timeout {
            constructor(delay, task) {
                super(delay, task);
                clearTimeout(this.id);
                made.push(this);
            }
        };
        return made;
    };
    $mol_test({
        'a dropped part is carried by a drag across its body'($) {
            const stage = $bog_vmap_app_flow_stage($);
            stage.drop(calc, stage.client([200, 150]));
            $mol_assert_like(stage.app.spots(), { Calc: { x: 200, y: 150 } });
            // The overlay is whole: the body of the part just dropped is the handle.
            $mol_assert_equal(stage.pane.overlay_style().clipPath, 'none');
            const overlay = stage.overlay();
            const from = stage.part_center('Calc');
            stage.press(overlay, from);
            stage.move(overlay, [from[0] + 60, from[1] + 40]);
            stage.release(overlay, [from[0] + 60, from[1] + 40]);
            stage.redraw();
            $mol_assert_like(stage.app.spots(), { Calc: { x: 260, y: 190 } });
        },
        'the second click lets the pointer inside the part, Escape takes it back out'($) {
            const stage = $bog_vmap_app_flow_stage($);
            stage.drop(calc, stage.client([200, 150]));
            stage.drop(map, stage.client([400, 150]));
            // The first click on another part only picks it, and no click reaches the scene.
            const before = stage.scene.sent('click_at').length;
            stage.tap(stage.part_center('Calc'));
            $mol_assert_equal(stage.app.selected(), 'Calc');
            $mol_assert_equal(stage.pane.inside(), false);
            $mol_assert_equal(stage.pane.overlay_style().clipPath, 'none');
            $mol_assert_equal(stage.scene.sent('click_at').length, before);
            // The second one lets the pointer inside, and the click goes on to the component.
            stage.tap(stage.part_center('Calc'));
            $mol_assert_equal(stage.pane.inside(), true);
            $mol_assert_ok(stage.pane.overlay_style().clipPath.includes('200px 150px'));
            $mol_assert_equal(stage.scene.sent('click_at').length, before + 1);
            const dom = $.$mol_dom_context;
            dom.document.dispatchEvent(new dom.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
            stage.redraw();
            $mol_assert_equal(stage.pane.inside(), false);
            $mol_assert_equal(stage.app.selected(), 'Calc');
        },
        'the Delete key takes the picked part out of the document'($) {
            const stage = $bog_vmap_app_flow_stage($);
            stage.drop(calc, stage.client([100, 100]));
            stage.drop(map, stage.client([300, 100]));
            stage.tap(stage.part_center('Calc'));
            $mol_assert_equal(stage.app.selected(), 'Calc');
            const dom = $.$mol_dom_context;
            dom.document.dispatchEvent(new dom.KeyboardEvent('keydown', { key: 'Delete', bubbles: true }));
            stage.redraw();
            $mol_assert_equal(stage.app.doc_source().includes('Calc'), false);
            $mol_assert_equal(stage.app.selected(), null);
        },
        /**
         * The band: a modified sweep over the canvas takes everything it overlaps, and
         * from then on the whole set is one thing — it travels together and it goes
         * together.
         */
        'a band takes several parts, and they move and delete as one'($) {
            const stage = $bog_vmap_app_flow_stage($);
            stage.drop(calc, stage.client([100, 100]));
            stage.drop(map, stage.client([300, 100]));
            // Only the last dropped one is picked, as a drop leaves it.
            $mol_assert_like([...stage.app.picked()], ['Map']);
            // A sweep with the modifier down, from above and left of both to below
            // and right of both.
            const overlay = stage.overlay();
            const mods = { ctrlKey: true };
            stage.press(overlay, stage.client([50, 50]), mods);
            stage.move(overlay, stage.client([450, 200]), mods);
            $mol_assert_ok(stage.pane.band() !== null);
            stage.release(overlay, stage.client([450, 200]), mods);
            stage.redraw();
            stage.scene.flush();
            $mol_assert_like([...stage.app.picked()], ['Calc', 'Map']);
            $mol_assert_equal(stage.pane.band(), null);
            // Carried by the body of one of them, both travel by the same offset.
            const from = stage.part_center('Calc');
            stage.press(overlay, from);
            stage.move(overlay, [from[0] + 40, from[1] + 30]);
            stage.release(overlay, [from[0] + 40, from[1] + 30]);
            stage.redraw();
            $mol_assert_like(stage.app.spots(), {
                Calc: { x: 140, y: 130 },
                Map: { x: 340, y: 130 },
            });
            // And deleted together: out of the document, out of `sub`, out of the desk.
            stage.click(stage.button('Удалить'));
            const source = stage.app.doc_source();
            $mol_assert_equal(source.includes('Calc'), false);
            $mol_assert_equal(source.includes('Map'), false);
            $mol_assert_like(Object.keys(stage.app.spots()), []);
            $mol_assert_like([...stage.app.picked()], []);
        },
        /**
         * REPRO: a drop out of the palette while something is picked carried the
         * picked node to the point of the drop as well.
         */
        /**
         * REPRO end to end: a frame that boots and stops before any geometry. The
         * canvas used to sit in «ожидание сцены…» with no strip and no button, since
         * the watch was off until the frame had warmed.
         */
        'a scene that never came up says so, and says what to do about it'($) {
            const stage = $bog_vmap_app_flow_stage($, { mute: true });
            $mol_assert_equal(stage.pane.warmed(), false);
            $mol_assert_equal(stage.app.stalled(), false);
            // The watch is armed on the cold limit; time passes and it fires.
            const timer = stage.timers.at(-1);
            $mol_assert_ok(stage.pane.watchdog() !== null);
            $mol_assert_equal(stage.pane.watchdog().delay, stage.pane.cold_limit());
            stage.pane.watchdog().task();
            stage.redraw();
            $mol_assert_equal(stage.app.stalled(), true);
            const text = stage.text();
            $mol_assert_ok(text.includes('Сцена не запустилась'));
            $mol_assert_ok(text.includes('исправьте код в панели'));
            stage.button('Перезагрузить сцену');
            $mol_assert_ok(timer !== null);
        },
        /**
         * REPRO: entering a part gave it the pointer but not the keyboard. The scene
         * focuses the element under the click, and that alone left the active element
         * of the frame at `body` — typing went nowhere at all.
         */
        'entering a part hands the keyboard to the frame'($) {
            const stage = $bog_vmap_app_flow_stage($);
            stage.drop(calc, stage.client([200, 150]));
            // A drop picks the part, so a click on it would already be the second of
            // the pair. Bare canvas first, to start from nothing picked.
            stage.tap(stage.client([500, 400]));
            $mol_assert_equal(stage.app.selected(), null);
            let focused = 0;
            stage.frame().focus = () => { focused++; };
            // The first click only picks: the keyboard stays with the editor.
            stage.tap(stage.part_center('Calc'));
            $mol_assert_equal(stage.pane.inside(), false);
            $mol_assert_equal(focused, 0);
            // The second lets the pointer in, and the keys go with it.
            stage.tap(stage.part_center('Calc'));
            $mol_assert_equal(stage.pane.inside(), true);
            $mol_assert_equal(focused, 1);
        },
        /**
         * Inside a part the keys belong to the part, and the strip says so with the
         * way out. Nothing else on screen would explain why Delete stopped deleting.
         */
        'the strip says the pointer is inside a part, and how to get out'($) {
            const stage = $bog_vmap_app_flow_stage($);
            stage.drop(calc, stage.client([200, 150]));
            $mol_assert_equal(stage.text().includes('Внутри'), false);
            stage.tap(stage.part_center('Calc'));
            stage.tap(stage.part_center('Calc'));
            $mol_assert_equal(stage.pane.inside(), true);
            $mol_assert_ok(stage.text().includes('Внутри Calc'));
            $mol_assert_ok(stage.text().includes('Esc'));
            const dom = $.$mol_dom_context;
            dom.document.dispatchEvent(new dom.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
            stage.redraw();
            $mol_assert_equal(stage.pane.inside(), false);
            $mol_assert_equal(stage.text().includes('Внутри'), false);
        },
        /**
         * REPRO: a wire drawn onto an input that already carries one used to be
         * written straight over, leaving the previous source line in the document
         * with nobody reading it.
         */
        'REPRO rebinding an occupied input leaves no orphan behind'($) {
            const stage = $bog_vmap_app_flow_stage($);
            // Two sources of the same shape, names sharing a prefix on purpose.
            stage.drop(calc, stage.client([100, 100]));
            stage.drop(calc, stage.client([100, 300]));
            stage.drop(map, stage.client([400, 100]));
            const wire = (from, prop) => {
                stage.press(stage.overlay(), stage.port_dot(from, prop, 'out'));
                stage.move(stage.overlay(), stage.port_dot('Map', 'zoom', 'in'));
                stage.release(stage.overlay(), stage.port_dot('Map', 'zoom', 'in'));
                stage.redraw();
                stage.scene.flush();
            };
            stage.tap(stage.part_center('Calc'));
            wire('Calc', 'result');
            $mol_assert_ok(stage.app.doc_source().includes('calc_result = Calc result'));
            $mol_assert_like(stage.app.doc_wires().map(link => `${link.to}.${link.to_prop}`), ['Map.zoom']);
            // The same input, a different source: the first wire goes with its line,
            // and the wire lands on the part it was dropped on, prefix name and all.
            stage.tap(stage.part_center('Calc_2'));
            wire('Calc_2', 'result');
            const source = stage.app.doc_source();
            $mol_assert_equal(source.includes('calc_result ='), false);
            $mol_assert_ok(source.includes('calc_2_result = Calc_2 result'));
            $mol_assert_like(stage.app.doc_wires().map(link => `${link.to}.${link.to_prop} <= ${link.from}`), ['Map.zoom <= Calc_2']);
        },
        'REPRO a drop from the palette leaves the picked part where it was'($) {
            const stage = $bog_vmap_app_flow_stage($);
            stage.drop(calc, stage.client([100, 100]));
            $mol_assert_equal(stage.app.selected(), 'Calc');
            // Picked by a click, the way a person picks before reaching for the palette.
            stage.tap(stage.part_center('Calc'));
            $mol_assert_equal(stage.app.selected(), 'Calc');
            stage.drop(map, stage.client([400, 300]));
            $mol_assert_like(stage.app.spots(), {
                Calc: { x: 100, y: 100 },
                Map: { x: 400, y: 300 },
            });
        },
        'a part inside a page is carried to another position in its tree'($) {
            const stage = $bog_vmap_app_flow_stage($);
            stage.click(stage.button('Артборд'));
            const page = stage.pane.part_box('Page');
            stage.drop(calc, stage.client([page.left + 200, page.top + 40]));
            stage.drop(map, stage.client([page.left + 200, page.top + 250]));
            const node = stage.app.node();
            $mol_assert_like(node.sub_names('Page'), ['Calc', 'Map']);
            // Carry the second one above the first: press on it, drag up, release.
            const overlay = stage.overlay();
            const from = stage.part_center('Map');
            const to = stage.client([page.left + 200, page.top + 5]);
            stage.press(overlay, from);
            stage.move(overlay, to);
            stage.release(overlay, to);
            stage.redraw();
            stage.scene.flush();
            $mol_assert_like(node.sub_names('Page'), ['Map', 'Calc']);
        },
        /**
         * The first click picks and nothing else: the body of the node stays the
         * editor's, to carry it by. The second one on the same node lets the pointer
         * inside, and only then does the click go on to the live component, in world
         * units, with the camera undone the same way the hit test undoes it.
         */
        'the first click picks, the second lets the pointer in and relays it'($) {
            const { pane, posted } = pane_make($, { left: 10, top: 20 });
            pane.camera_shift(new $mol_vector_2d(100, 50));
            pane.camera_zoom(2);
            pane.sizes_last = { [`${root}/A`]: box(30, 40) };
            // World (50, 60) is screen 50*2+100+10, 60*2+50+20.
            pane.node_press(pointer(210, 190));
            pane.node_release(pointer(210, 190, { buttons: 0 }));
            $mol_assert_equal(pane.primary(), 'A');
            $mol_assert_equal(pane.inside(), false);
            $mol_assert_equal(clicks(posted).length, 0);
            pane.node_press(pointer(210, 190));
            pane.node_release(pointer(210, 190, { buttons: 0 }));
            $mol_assert_equal(pane.inside(), true);
            const sent = clicks(posted);
            $mol_assert_equal(sent.length, 1);
            $mol_assert_equal(sent[0].x, 50);
            $mol_assert_equal(sent[0].y, 60);
        },
        /** A pick of anything else closes the hole without anybody clearing it. */
        'picking another node puts the pointer back outside'($) {
            const { pane } = pane_make($);
            pane.sizes_last = { [`${root}/A`]: box(0, 0), [`${root}/B`]: box(300, 0) };
            pane.node_press(pointer(50, 25));
            pane.node_release(pointer(50, 25, { buttons: 0 }));
            pane.node_press(pointer(50, 25));
            pane.node_release(pointer(50, 25, { buttons: 0 }));
            $mol_assert_equal(pane.inside(), true);
            pane.node_press(pointer(350, 25));
            pane.node_release(pointer(350, 25, { buttons: 0 }));
            $mol_assert_equal(pane.primary(), 'B');
            $mol_assert_equal(pane.inside(), false);
            $mol_assert_equal(pane.overlay_style().clipPath, 'none');
            // And coming back to the first one starts from outside again: it is a
            // pick, not a return to where the pointer was left the time before.
            pane.node_press(pointer(50, 25));
            pane.node_release(pointer(50, 25, { buttons: 0 }));
            $mol_assert_equal(pane.primary(), 'A');
            $mol_assert_equal(pane.inside(), false);
        },
        'the modifiers travel with the click'($) {
            const { pane, posted } = pane_make($);
            pane.sizes_last = { [`${root}/A`]: box(0, 0) };
            pane.node_press(pointer(50, 25));
            pane.node_release(pointer(50, 25, { buttons: 0 }));
            pane.node_press(pointer(50, 25));
            pane.node_release(pointer(50, 25, { buttons: 0, shiftKey: true, metaKey: true }));
            $mol_assert_like(clicks(posted)[0].mods, { altKey: false, ctrlKey: false, metaKey: true, shiftKey: true });
        },
        /** A gesture that went somewhere is a drag of the part, not a click. */
        'movement past the threshold moves the part and relays nothing'($) {
            const { pane, posted } = pane_make($);
            pane.sizes_last = { [`${root}/A`]: box(0, 0) };
            pane.spots({ A: { x: 0, y: 0 } });
            pane.node_press(pointer(50, 25));
            pane.node_move(pointer(70, 25));
            pane.node_release(pointer(70, 25, { buttons: 0 }));
            $mol_assert_equal(pane.primary(), 'A');
            $mol_assert_equal(pane.spots().A.x, 20);
            $mol_assert_equal(pane.spots().A.y, 0);
            $mol_assert_equal(clicks(posted).length, 0);
        },
        /** The overlay may miss the moves — a pan captures the pointer away — so the release is measured too. */
        'a release far from the press is not a click even without moves in between'($) {
            const { pane, posted } = pane_make($);
            pane.node_press(pointer(50, 25));
            pane.node_release(pointer(90, 25, { buttons: 0 }));
            $mol_assert_equal(clicks(posted).length, 0);
        },
        'a wobble within the threshold is still a click'($) {
            const { pane, posted } = pane_make($);
            pane.sizes_last = { [`${root}/A`]: box(0, 0) };
            pane.node_press(pointer(50, 25));
            pane.node_release(pointer(50, 25, { buttons: 0 }));
            pane.node_press(pointer(50, 25));
            pane.node_move(pointer(52, 27));
            pane.node_release(pointer(51, 26, { buttons: 0 }));
            $mol_assert_equal(clicks(posted).length, 1);
        },
        /**
         * Bare canvas drops the pick and relays nothing: there is no node there to be
         * let inside of, and a click sent anyway would give the focus to the frame —
         * which is where the Delete of the editor stops arriving.
         */
        'a click on bare canvas drops the selection and relays nothing'($) {
            const { pane, posted } = pane_make($);
            pane.sizes_last = { [`${root}/A`]: box(0, 0) };
            pane.picked(['A']);
            pane.node_press(pointer(500, 500));
            pane.node_release(pointer(500, 500, { buttons: 0 }));
            $mol_assert_equal(pane.primary(), null);
            $mol_assert_equal(clicks(posted).length, 0);
        },
        'nothing is relayed while the scene is not listening'($) {
            const { pane, posted } = pane_make($);
            pane.handshake(pane.scene_key(), 0);
            pane.node_press(pointer(5, 5));
            pane.node_release(pointer(5, 5, { buttons: 0 }));
            $mol_assert_equal(posted.length, 0);
        },
        /**
         * REPRO: the zoom pivots on the middle of the canvas, and the FIRST one after
         * a load did not — the box it reads answers `null` until something has read
         * it once, and an unread box put the pivot in the corner.
         */
        'the first zoom after a load pivots on the middle of the canvas'($) {
            const { pane } = pane_make($);
            // Nothing has read the geometry yet, exactly as after a fresh load.
            pane.zoom_by(1.25);
            // 1000 x 800, so the middle is 500, 400; the pivot keeps it still.
            $mol_assert_equal(pane.camera_zoom(), 1.25);
            $mol_assert_like([...pane.camera_shift()], [-125, -100]);
        },
        /** The grip is a strip of screen pixels, so it does not shrink away when zooming out. */
        'the grip around a part is measured in screen pixels'($) {
            const { pane } = pane_make($);
            pane.sizes_last = { [`${root}/A`]: box(0, 0, 100, 100) };
            pane.camera_zoom(1);
            $mol_assert_equal(pane.node_at([106, 50]), 'A');
            $mol_assert_equal(pane.node_at([110, 50]), null);
            // At zoom 1/4 the same strip is four times wider in world units.
            pane.camera_zoom(.25);
            $mol_assert_equal(pane.node_at([130, 50]), 'A');
            $mol_assert_equal(pane.node_at([134, 50]), null);
        },
        'the hole follows the picked part through the camera'($) {
            const { pane } = pane_make($);
            pane.camera_shift(new $mol_vector_2d(100, 50));
            pane.camera_zoom(2);
            pane.sizes_last = { [`${root}/A`]: box(30, 40, 100, 50) };
            $mol_assert_equal(pane.overlay_style().clipPath, 'none');
            pane.picked(['A']);
            // Picked and no more: the ring is drawn, the overlay is still whole.
            $mol_assert_equal(pane.overlay_style().clipPath, 'none');
            $mol_assert_equal(pane.frame_showed(), true);
            pane.entered('A');
            $mol_assert_like(pane.frame_box(), { left: 160, top: 130, width: 200, height: 100 });
            $mol_assert_equal(pane.overlay_style().clipPath, 'polygon(evenodd, 0 0, 100% 0, 100% 100%, 0 100%, 0 0, 160px 130px, 360px 130px, 360px 230px, 160px 230px, 160px 130px)');
            $mol_assert_like(pane.frame_style('A'), { left: '160px', top: '130px', width: '200px', height: '100px' });
        },
        /**
         * The band takes what it OVERLAPS, and of a node and its container only the
         * outer one: a child carried inside its parent must not be carried twice.
         */
        'a band takes what it overlaps, containers and not their children'($) {
            const { pane } = pane_make($);
            pane.sizes_last = {
                [`${root}/A`]: box(0, 0, 100, 50),
                [`${root}/Page`]: box(200, 0, 300, 200),
                [`${root}/Page/B`]: box(200, 0, 100, 50),
            };
            // A sweep across the lot: the page comes, its child does not.
            pane.node_press(pointer(-10, -10, { ctrlKey: true }));
            pane.node_move(pointer(600, 300, { ctrlKey: true }));
            pane.node_release(pointer(600, 300, { ctrlKey: true, buttons: 0 }));
            $mol_assert_like([...pane.picked()], ['A', 'Page']);
            $mol_assert_equal(pane.band(), null);
            // A sweep that merely touches the corner of the first one still takes it.
            pane.node_press(pointer(90, 40, { ctrlKey: true }));
            pane.node_move(pointer(150, 100, { ctrlKey: true }));
            pane.node_release(pointer(150, 100, { ctrlKey: true, buttons: 0 }));
            $mol_assert_like([...pane.picked()], ['A']);
        },
        /** A band puts the pointer back outside, wherever it ends. */
        'a band takes the pointer out of the node it was let into'($) {
            const { pane } = pane_make($);
            pane.sizes_last = { [`${root}/A`]: box(0, 0) };
            pane.node_press(pointer(50, 25));
            pane.node_release(pointer(50, 25, { buttons: 0 }));
            pane.node_press(pointer(50, 25));
            pane.node_release(pointer(50, 25, { buttons: 0 }));
            $mol_assert_equal(pane.inside(), true);
            // A sweep that ends up picking the very same node, and nothing else.
            pane.node_press(pointer(-10, -10, { ctrlKey: true }));
            pane.node_move(pointer(150, 60, { ctrlKey: true }));
            pane.node_release(pointer(150, 60, { ctrlKey: true, buttons: 0 }));
            $mol_assert_like([...pane.picked()], ['A']);
            $mol_assert_equal(pane.inside(), false);
            $mol_assert_equal(pane.overlay_style().clipPath, 'none');
        },
        /**
         * REPRO: the hit test walks the insides of a pack class and picks a view the
         * document never declared. Everything below the part is the part's body.
         */
        'REPRO the hit test stops at the nodes the document declares'($) {
            const { pane } = pane_make($, {}, { doc_names: () => ['Calc'] });
            // A part of the document, and two views of its class inside it.
            pane.sizes_last = {
                [`${root}/Calc`]: box(0, 0, 200, 100),
                [`${root}/Calc/Head`]: box(0, 0, 200, 30),
                [`${root}/Calc/Head/String`]: box(10, 5, 80, 20),
            };
            $mol_assert_equal(pane.node_at([50, 15]), 'Calc');
            $mol_assert_equal(pane.node_at([100, 50]), 'Calc');
            $mol_assert_like(pane.part_names(), ['Calc']);
            // And the ring is the box of the part, not of the view inside it.
            pane.picked(['Calc']);
            $mol_assert_like(pane.frame_style('Calc'), { left: '0px', top: '0px', width: '200px', height: '100px' });
        },
        /** A node of the document inside an artboard is still reached, at any depth. */
        'REPRO the deepest node of the document wins, the pack inside it does not'($) {
            const { pane } = pane_make($, {}, { doc_names: () => ['Page', 'Calc'] });
            pane.sizes_last = {
                [`${root}/Page`]: box(0, 0, 400, 300),
                [`${root}/Page/Calc`]: box(0, 0, 200, 100),
                [`${root}/Page/Calc/Head`]: box(0, 0, 200, 30),
            };
            $mol_assert_equal(pane.node_at([100, 15]), 'Calc');
            $mol_assert_equal(pane.node_at([300, 200]), 'Page');
        },
        /**
         * REPRO: a press whose release never came back left the carry live, and the
         * next drag across the canvas — the one out of the palette — carried the
         * picked node with it, grabbed where it had last been pressed.
         */
        'REPRO a drag from the palette carries nothing of the canvas'($) {
            const { pane } = pane_make($);
            pane.sizes_last = { [`${root}/A`]: box(0, 0) };
            pane.spots({ A: { x: 0, y: 0 } });
            // Picked and grabbed in the middle; the release fell into the hole and
            // never reached the overlay, so the gesture was never ended.
            pane.node_press(pointer(50, 25));
            // The owner now carries a class across the canvas, button down.
            pane.carrying = () => true;
            pane.node_move(pointer(400, 300));
            pane.node_release(pointer(400, 300, { buttons: 0 }));
            $mol_assert_like(pane.spots(), { A: { x: 0, y: 0 } });
        },
        /**
         * REPRO: a node carried into a container is measured at a new path, and the
         * box under its old path kept answering to the same name. Two boxes for one
         * name is how a wire lands on the neighbour of the part it was dropped on.
         */
        'REPRO a node that moved leaves no box behind at its old path'($) {
            const { pane } = pane_make($, {}, { doc_names: () => ['Pair', 'Schet'] });
            pane.sizes_last = {
                [`${root}/Schet`]: box(700, 600),
                [`${root}/Pair`]: box(0, 0, 400, 300),
            };
            // Carried into the pair: the scene will measure it at the new path, and
            // the owner tells the canvas to forget where it used to be.
            pane.sizes_forget('Schet');
            $mol_assert_like(Object.keys(pane.sizes()), [`${root}/Pair`]);
            // And the new report puts it inside, with one box answering to the name.
            pane.sizes_last = { ...pane.sizes_last, [`${root}/Pair/Schet`]: box(10, 10) };
            pane.sizes_version(pane.sizes_version() + 1);
            $mol_assert_like(pane.part_size('Schet'), box(10, 10));
            $mol_assert_equal(pane.part_names().filter(name => name === 'Schet').length, 1);
            // Carried OUT of the pair, which is the case a rule written as a prefix of
            // the root path cannot see: the stale key is a deep one.
            pane.sizes_forget('Schet');
            $mol_assert_like(Object.keys(pane.sizes()), [`${root}/Pair`]);
        },
        /**
         * REPRO: two parts of one container whose names share a prefix. The dot the
         * pointer is over belongs to the part it is drawn on, and to no other.
         */
        'REPRO a port dot belongs to the part it is drawn on, prefix or not'($) {
            const ports = [
                { name: 'zoom', next: false, kind: 'number' },
                { name: 'marker', next: false, kind: 'string' },
            ];
            const { pane } = pane_make($, {}, {
                doc_names: () => ['Pair', 'Map', 'Map_2'],
                part_ports: () => ports,
                wires: () => [],
            });
            // Stacked inside the pair, sharing a left edge: Map_2 above Map.
            pane.sizes_last = {
                [`${root}/Pair`]: box(0, 0, 400, 500),
                [`${root}/Pair/Map_2`]: box(0, 0, 320, 220),
                [`${root}/Pair/Map`]: box(0, 220, 320, 220),
            };
            pane.wire_drag({ from: 'Pair', from_prop: 'x', kind: 'number' });
            const dots = pane.wire_dots();
            const at = (x, y) => $bog_vmap_app_wire_dot_at(dots, [x, y]);
            // The zoom dot of the upper map, and of the lower one.
            $mol_assert_equal(at(-12, 7)?.node, 'Map_2');
            $mol_assert_equal(at(-12, 227)?.node, 'Map');
            // One dot set per part, not two.
            $mol_assert_equal(dots.filter(dot => dot.node === 'Map').length, 2);
        },
        /** A modified click without a sweep takes nothing and clears nothing. */
        'a modified click leaves the picked set alone'($) {
            const { pane } = pane_make($);
            pane.sizes_last = { [`${root}/A`]: box(0, 0) };
            pane.picked(['A']);
            pane.node_press(pointer(500, 500, { ctrlKey: true }));
            pane.node_release(pointer(500, 500, { ctrlKey: true, buttons: 0 }));
            $mol_assert_like([...pane.picked()], ['A']);
            $mol_assert_equal(pane.band(), null);
        },
        /** Everything picked travels by the same offset, each from its own start. */
        'a carry moves the whole picked set'($) {
            const { pane } = pane_make($);
            pane.sizes_last = { [`${root}/A`]: box(0, 0), [`${root}/B`]: box(300, 0) };
            pane.spots({ A: { x: 0, y: 0 }, B: { x: 300, y: 0 } });
            pane.picked(['A', 'B']);
            pane.node_press(pointer(50, 25));
            pane.node_move(pointer(70, 45));
            pane.node_release(pointer(70, 45, { buttons: 0 }));
            $mol_assert_like(pane.spots(), { A: { x: 20, y: 20 }, B: { x: 320, y: 20 } });
        },
        'the hole is closed while a drop from the palette is on'($) {
            const { pane } = pane_make($);
            pane.sizes_last = { [`${root}/A`]: box(0, 0) };
            pane.picked(['A']);
            pane.entered('A');
            pane.carrying = () => true;
            $mol_assert_equal(pane.overlay_style().clipPath, 'none');
            // The ring itself stays: only the events stop going through.
            $mol_assert_equal(pane.frame_showed(), true);
        },
        /**
         * THE PULSE HAS NO MODE. It runs as soon as the scene has proved itself and
         * the bridge is up, asks once, and asks again only after an answer.
         */
        'the heartbeat pings once warmed and re-arms on the pong'($) {
            const timers = timers_fake($);
            const { pane, posted, clock, answer } = pane_make($);
            // Not warmed: no baseline, no pulse.
            $mol_assert_equal(pane.heartbeat(), null);
            pane.warmed(true);
            // The first read of the watch pushes everything to the fresh scene; let
            // the scene answer, so that what follows is about the pulse alone.
            pane.watchdog();
            answer({ kind: 'sizes', sizes: {} });
            $mol_assert_equal(pane.watchdog(), null);
            const first = pane.heartbeat();
            $mol_assert_equal(first, timers[timers.length - 1]);
            clock.now++;
            first.task();
            const pings = posted.filter(m => m.kind === 'ping');
            $mol_assert_equal(pings.length, 1);
            $mol_assert_equal(pings[0].nonce, 1);
            // The ping is a question: the watchdog is armed by it.
            $mol_assert_equal(pane.watchdog() !== null, true);
            answer({ kind: 'pong', nonce: 1 });
            // Answered: disarmed, and the next ping is scheduled.
            $mol_assert_equal(pane.watchdog(), null);
            $mol_assert_equal(pane.heartbeat() !== first, true);
        },
        'a silent scene is called stalled when the limit runs out'($) {
            const timers = timers_fake($);
            const { pane, clock } = pane_make($);
            pane.warmed(true);
            clock.now++;
            pane.heartbeat().task();
            const watch = pane.watchdog();
            $mol_assert_equal(watch, timers[timers.length - 1]);
            $mol_assert_equal(watch.delay, pane.answer_limit());
            $mol_assert_equal(pane.stalled(), false);
            watch.task();
            $mol_assert_equal(pane.stalled(), true);
        },
        /**
         * The button on the strip: a new frame element, the accusation withdrawn,
         * nothing sent until the new scene says `ready`, then everything re-sent.
         */
        'scene_restart gives a fresh frame and clears stalled'($) {
            timers_fake($);
            const { pane, posted, answer } = pane_make($);
            pane.warmed(true);
            pane.watchdog();
            answer({ kind: 'sizes', sizes: {} });
            const frame_before = pane.sub()[0];
            $mol_assert_equal(frame_before, pane.Scene(pane.scene_key()));
            pane.stalled(true);
            posted.length = 0;
            pane.scene_restart();
            $mol_assert_equal(pane.stalled(), false);
            $mol_assert_equal(pane.ready(), false);
            $mol_assert_equal(pane.warmed(), false);
            $mol_assert_equal(pane.sub()[0] !== frame_before, true);
            $mol_assert_equal(pane.sub()[0], pane.Scene(pane.scene_key()));
            $mol_assert_equal(pane.sub().length, 3);
            // a frame that has not spoken gets nothing and is accused of nothing
            $mol_assert_equal(pane.watchdog(), null);
            $mol_assert_equal(pane.heartbeat(), null);
            $mol_assert_equal(posted.length, 0);
            answer({ kind: 'ready' });
            pane.watchdog();
            $mol_assert_equal(pane.ready(), true);
            $mol_assert_like(posted.map(m => m.kind), 
            // the pack first: the scene compiles nothing until it has one
            ['pack_set', 'doc_set', 'css_set', 'libs_set', 'spots_set', 'camera_set']);
        },
        /**
         * The frame is isolated and has no address, and the ORDER of the two says so.
         *
         * `$mol_dom_render_attributes` writes the dictionary in key order, so a frame
         * that got its source before its sandbox is already loading unsandboxed —
         * with the attribute present in the DOM and the audit green. Reading the
         * dictionary is therefore the check, not reading the element.
         */
        'the frame is sandboxed first, addressed never and raised from markup'($) {
            const { pane } = pane_make($, {}, { scene_bundle: () => 'https://vmap.test/scene/web.js' });
            // read as entries and not by property name: dropping the attribute would
            // then be a type error and the build would stop before this ever ran,
            // leaving the last green bundle in place to be tested instead
            const attr = pane.Scene(pane.scene_key()).attr();
            const entries = Object.entries(attr);
            const keys = entries.map(([name]) => name);
            $mol_assert_equal(keys[0], 'sandbox');
            $mol_assert_equal(entries[0][1], 'allow-scripts');
            // `null` is removal. An empty `src` would load the page we stand on.
            $mol_assert_equal(attr.src, null);
            $mol_assert_ok(keys.indexOf('srcdoc') > 0);
            const html = String(attr.srcdoc);
            $mol_assert_ok(html.includes('src="https://vmap.test/scene/web.js"'));
            $mol_assert_ok(html.includes('color-scheme:dark'));
        },
        /**
         * One pack per realm, held by the key of the frame now that no address holds
         * it: the pack is IN the key, so naming another one addresses another frame.
         * That the element really is replaced when a person types a pack is
         * `flow.test.ts`, where the whole chain from the field down is real.
         *
         * The pack also goes out first, before the document and the libraries: the
         * scene refuses to compile until it has one.
         * @see ../../ARCHITECTURE.md section 5
         */
        'the pack keys the frame and goes down the wire first'($) {
            const one = pane_make($, {}, { pack_uri: () => 'https://one.test/web.js' });
            const two = pane_make($, {}, { pack_uri: () => 'https://two.test/web.js' });
            one.pane.watchdog();
            $mol_assert_equal(one.posted[0]?.kind, 'pack_set');
            $mol_assert_equal(one.posted[0]?.uri, 'https://one.test/web.js');
            $mol_assert_ok(one.pane.scene_key() !== two.pane.scene_key());
            $mol_assert_ok(one.pane.scene_key().includes('https://one.test/web.js'));
            // same generation, different pack, different frame
            $mol_assert_equal(one.pane.scene_generation(), two.pane.scene_generation());
            $mol_assert_ok(one.pane.sub()[0] !== two.pane.sub()[0]);
        },
        /** A click is a push like any other: it arms the watch, and geometry back disarms it. */
        'a relayed click arms the watchdog and sizes disarm it'($) {
            timers_fake($);
            const { pane, clock, answer } = pane_make($);
            pane.sizes_last = { [`${root}/A`]: box(0, 0) };
            pane.warmed(true);
            // The first read pushes the document and the rest; answered, the watch rests.
            pane.watchdog();
            answer({ kind: 'sizes', sizes: {} });
            $mol_assert_equal(pane.watchdog(), null);
            clock.now++;
            // Twice: the click that goes to the scene is the one that lets the
            // pointer inside, and the watch is armed by what is sent, not by a pick.
            pane.node_press(pointer(50, 25));
            pane.node_release(pointer(50, 25, { buttons: 0 }));
            pane.node_press(pointer(50, 25));
            pane.node_release(pointer(50, 25, { buttons: 0 }));
            $mol_assert_equal(pane.watchdog() !== null, true);
            answer({ kind: 'sizes', sizes: {} });
            $mol_assert_equal(pane.watchdog(), null);
        },
        /** Not warmed yet, the pulse is quiet and the watch is off, whatever was pushed. */
        /**
         * The pulse waits for the scene to prove itself; the watch does not, since
         * E9 — see the scenario below. A ping into a frame that has not loaded would
         * be a question asked of nobody, and every answer to it a false all clear.
         */
        'before the first sizes the pulse is quiet'($) {
            timers_fake($);
            const { pane } = pane_make($);
            pane.node_press(pointer(5, 5));
            pane.node_release(pointer(5, 5, { buttons: 0 }));
            $mol_assert_equal(pane.heartbeat(), null);
        },
        /**
         * REPRO: document code that loops on the first compile stops the scene before
         * any geometry, so the frame never warms. The watch used to be off until it
         * warmed, which left this one case with no strip, no button and no way out.
         */
        'a frame that never answered at all is called out, on a limit of its own'($) {
            const timers = timers_fake($);
            const { pane, clock, answer } = pane_make($);
            // The frame boots and says `ready`, which proves nothing but the boot.
            answer({ kind: 'ready' });
            // The host asks its questions; the scene compiles the document and stops.
            clock.now++;
            pane.watchdog();
            $mol_assert_equal(pane.warmed(), false);
            $mol_assert_ok(pane.watchdog() !== null);
            // The limit is the generous one, not the warm one.
            $mol_assert_equal(timers.at(-1).delay, pane.cold_limit());
            $mol_assert_ok(pane.cold_limit() > pane.answer_limit());
            timers.at(-1).task();
            $mol_assert_equal(pane.stalled(), true);
        },
        /**
         * THE WIRE GESTURE. Camera panned and zoomed, so screen and world differ:
         * a drag from the output dot of one part to the input dot of another puts
         * exactly two lines into the document, and the click channel stays quiet.
         */
        'a drag from an output to a fitting input writes exactly two lines'($) {
            const { pane, node, posted } = wired_make($);
            pane.camera_shift(new $mol_vector_2d(100, 50));
            pane.camera_zoom(2);
            // Calc at world (0,0) is screen (100,50) 200×100; Map at world (300,0) is screen (700,50).
            pane.sizes_last = { [`${root}/Calc`]: box(0, 0), [`${root}/Map`]: box(300, 0) };
            pane.picked(['Calc']);
            const before = node.source();
            // Output `result` is the first row: right of the box by the gap, half a row down.
            pane.node_press(pointer(312, 57));
            $mol_assert_like(pane.wire_drag(), { from: 'Calc', from_prop: 'result', kind: 'number' });
            $mol_assert_equal(pane.primary(), 'Calc');
            pane.node_move(pointer(600, 100));
            // In hand: the inputs of the other part, the number one lit, the string one not.
            $mol_assert_like(pane.wire_dots().map(dot => [dot.node, dot.port.name, dot.side, dot.x, dot.y, dot.lit]), [['Map', 'zoom', 'in', 688, 57, true], ['Map', 'marker', 'in', 688, 71, false]]);
            $mol_assert_equal(pane.wire_drag_geometry().startsWith('M 312 57 C'), true);
            pane.node_release(pointer(688, 57, { buttons: 0 }));
            $mol_assert_equal(pane.wire_drag(), null);
            // Two facts in the text: the wire at class level and the reference in the
            // target's declaration, the latter serialized on the declaration's own line.
            $mol_assert_equal(node.source().split('\n').length, before.split('\n').length + 1);
            $mol_assert_equal(node.source().includes('\tcalc_result = Calc result\n'), true);
            $mol_assert_equal(node.source().includes('zoom <= calc_result\n'), true);
            $mol_assert_like(node.wires(), [{ name: 'calc_result', node: 'Calc', prop: 'result', bidi: false }]);
            $mol_assert_like(node.links().map(link => [link.from, link.from_prop, link.to, link.to_prop]), [['Calc', 'result', 'Map', 'zoom']]);
            $mol_assert_equal(clicks(posted).length, 0);
            // Drawn from the same numbers the dots were.
            $mol_assert_equal(pane.wire_lines().length, 1);
            $mol_assert_equal(pane.wire_lines()[0].geometry.startsWith('M 312 57 C'), true);
            $mol_assert_equal(pane.wire_lines()[0].geometry.endsWith(', 688 57'), true);
            $mol_assert_equal(pane.wire_dots().find(dot => dot.port.name === 'zoom')?.linked, undefined);
            pane.picked(['Map']);
            $mol_assert_equal(pane.wire_dots().find(dot => dot.port.name === 'zoom' && dot.side === 'in')?.linked, true);
        },
        'a drag let go over nothing, or over an input of the wrong shape, writes nothing'($) {
            const { pane, node } = wired_make($);
            pane.sizes_last = { [`${root}/Calc`]: box(0, 0), [`${root}/Map`]: box(300, 0) };
            pane.picked(['Calc']);
            const before = node.source();
            pane.node_press(pointer(112, 7));
            pane.node_move(pointer(200, 200));
            pane.node_release(pointer(200, 200, { buttons: 0 }));
            $mol_assert_equal(node.source(), before);
            $mol_assert_equal(pane.wire_drag(), null);
            // `marker` is a string, the wire carries a number: the dot is there, unlit, and takes nothing.
            pane.node_press(pointer(112, 7));
            pane.node_release(pointer(288, 21, { buttons: 0 }));
            $mol_assert_equal(node.source(), before);
        },
        /** A dot sits on the grip strip of its part, and the wire is the finer target: no part is carried. */
        'a press on a dot is a wire even where the part would also be hit'($) {
            const { pane } = wired_make($);
            pane.camera_zoom(.5);
            pane.sizes_last = { [`${root}/Calc`]: box(0, 0) };
            pane.picked(['Calc']);
            // Box is 50 wide on screen, the dot at 62, the grip strip reaches 8 px past 50.
            pane.node_press(pointer(62, 7));
            $mol_assert_equal(pane.wire_drag() !== null, true);
            $mol_assert_equal(pane.drag, null);
            pane.node_release(pointer(62, 7, { buttons: 0 }));
        },
        /** Pressing a wired input unplugs it at once and leaves the wire in hand from the same source. */
        'a press on a wired input unplugs it and carries on from its source'($) {
            const { pane, node } = wired_make($);
            pane.sizes_last = { [`${root}/Calc`]: box(0, 0), [`${root}/Map`]: box(300, 0) };
            const before = node.source();
            node.link_add({ from: 'Calc', from_prop: 'result', to: 'Map', to_prop: 'zoom' });
            pane.picked(['Map']);
            pane.node_press(pointer(288, 7));
            $mol_assert_equal(node.source(), before);
            $mol_assert_like(pane.wire_drag(), { from: 'Calc', from_prop: 'result', kind: 'number' });
            // Let go over nothing: it stays unplugged.
            pane.node_release(pointer(500, 500, { buttons: 0 }));
            $mol_assert_equal(node.source(), before);
            $mol_assert_equal(node.links().length, 0);
            // The same again, put back where it was: the same two lines.
            node.link_add({ from: 'Calc', from_prop: 'result', to: 'Map', to_prop: 'zoom' });
            const wired = node.source();
            pane.node_press(pointer(288, 7));
            pane.node_release(pointer(288, 7, { buttons: 0 }));
            $mol_assert_equal(node.source(), wired);
        },
        /**
         * SECOND INVARIANT OF CULLING, seen from the wires: a part that left the
         * viewport is missing from the next report, and its wire keeps its last end.
         */
        'a wire is drawn from the last known box when one end is no longer reported'($) {
            const { pane, node, answer } = wired_make($);
            node.link_add({ from: 'Calc', from_prop: 'result', to: 'Map', to_prop: 'zoom' });
            // One end never measured: nothing to draw yet.
            answer({ kind: 'sizes', sizes: { [`${root}/Calc`]: box(0, 0) } });
            $mol_assert_equal(pane.wire_lines().length, 0);
            answer({ kind: 'sizes', sizes: { [`${root}/Map`]: box(300, 0) } });
            const drawn = pane.wire_lines();
            $mol_assert_equal(drawn.length, 1);
            // Map culled, Calc moved: the wire follows the one and keeps the other.
            answer({ kind: 'sizes', sizes: { [`${root}/Calc`]: box(0, 100) } });
            $mol_assert_equal(pane.wire_lines().length, 1);
            $mol_assert_equal(pane.wire_lines()[0].geometry.startsWith('M 112 107 C'), true);
            $mol_assert_equal(pane.wire_lines()[0].geometry.endsWith(', 288 7'), true);
        },
        /** The scene is asked for the wires on screen, and only for those, and asked again only when the set changes. */
        'values_want names the visible wires only'($) {
            const { pane, node, posted } = wired_make($, [
                `Calc ${d}my_calc`, `Map ${d}my_map`, `Calc_2 ${d}my_calc`, `Map_2 ${d}my_map`,
            ]);
            node.link_add({ from: 'Calc', from_prop: 'result', to: 'Map', to_prop: 'zoom' });
            node.link_add({ from: 'Calc_2', from_prop: 'result', to: 'Map_2', to_prop: 'zoom' });
            pane.sizes_last = {
                [`${root}/Calc`]: box(0, 0),
                [`${root}/Map`]: box(300, 0),
                [`${root}/Calc_2`]: box(5000, 5000),
                [`${root}/Map_2`]: box(5300, 5000),
            };
            pane.sizes_version(pane.sizes_version() + 1);
            const wants = () => posted.filter(m => m.kind === 'values_want').map(m => m.names);
            pane.values_push();
            $mol_assert_like(wants(), [['calc_result']]);
            // A pan that keeps the same wire on screen asks nothing new.
            pane.camera_shift(new $mol_vector_2d(10, 10));
            pane.values_push();
            $mol_assert_equal(wants().length, 1);
            // Over to the far pair.
            pane.camera_shift(new $mol_vector_2d(-5000, -5000));
            pane.values_push();
            $mol_assert_like(wants(), [['calc_result'], ['calc_2_result']]);
            // The answer lands on the wire as its label.
            $mol_assert_equal(pane.wire_lines().find(line => line.key === 'Map_2.zoom')?.label, '');
            pane.message_receive({ data: { ns: $bog_vmap_bridge_ns, kind: 'values', values: { calc_2_result: '42' } }, source: pane.scene_peer() });
            $mol_assert_equal(pane.wire_lines().find(line => line.key === 'Map_2.zoom')?.label, '42');
            // A question that owes no answer must not arm the watch. Asserted on the
            // stamp and no longer on `watchdog()` being null: since the cold frame is
            // watched too, the pushes of the boot arm it by themselves, and a null
            // there would stop meaning «this question was free».
            const stamped = pane.poke_at;
            pane.camera_shift(new $mol_vector_2d(-5000, -4000));
            pane.values_push();
            $mol_assert_equal(pane.poke_at, stamped);
        },
        /**
         * Inside an artboard the deepest node wins, or a page would swallow every
         * pick made on it: everything laid out inside it lies within its box.
         */
        'the pick goes to the deepest node under the point'($) {
            const { pane } = pane_make($);
            pane.sizes_last = {
                [`${root}/Board`]: box(0, 0, 400, 300),
                [`${root}/Board/Head`]: box(0, 0, 400, 100),
                [`${root}/Loose`]: box(600, 0, 100, 50),
            };
            $mol_assert_equal(pane.node_at([200, 50]), 'Head');
            $mol_assert_equal(pane.node_at([200, 200]), 'Board');
            $mol_assert_equal(pane.node_at([650, 25]), 'Loose');
            $mol_assert_equal(pane.node_at([900, 400]), null);
            // The box of a node is found at whatever depth it is drawn.
            $mol_assert_like(pane.part_size('Head'), box(0, 0, 400, 100));
            $mol_assert_like(pane.node_path('Head'), ['Board']);
            $mol_assert_like(pane.node_path('Loose'), []);
        },
        /**
         * The camera is undone once, by `world_point`, and everything downstream
         * works in world units — the hit test, the container and the position among
         * its children alike.
         */
        'a pan and a zoom do not move the slot a drop lands in'($) {
            const { pane } = pane_make($, {}, { containers: () => ['Board'] });
            pane.sizes_last = {
                [`${root}/Board`]: box(0, 0, 400, 300),
                [`${root}/Board/Head`]: box(0, 0, 400, 100),
                [`${root}/Board/Foot`]: box(0, 100, 400, 100),
            };
            const world = [200, 120];
            const flat = pane.insert_slot(world);
            $mol_assert_equal(flat.owner, 'Board');
            $mol_assert_equal(flat.index, 1);
            // The same world point through a moved and scaled camera: screen is
            // `world * zoom + shift`, and the press is given in screen pixels.
            pane.camera_shift(new $mol_vector_2d(100, 50));
            pane.camera_zoom(2);
            const point = pane.world_point(pointer(200 * 2 + 100, 120 * 2 + 50));
            $mol_assert_like([...point], [...world]);
            $mol_assert_like(pane.insert_slot(point), flat);
        },
        /**
         * The two ways of laying a node out, told apart by where the release
         * happened: inside an artboard the gesture means a position in the tree, on
         * bare canvas it means a coordinate.
         */
        'a drop inside an artboard goes into the tree, and no coordinate is written'($) {
            const moves = [];
            const { pane } = pane_make($, {}, {
                containers: () => ['Board'],
                tree_move: (next) => {
                    if (next)
                        moves.push(next);
                    return next ?? null;
                },
            });
            pane.sizes_last = {
                [`${root}/Board`]: box(0, 0, 400, 300),
                [`${root}/Board/Head`]: box(0, 0, 400, 100),
                [`${root}/Loose`]: box(600, 0, 100, 50),
            };
            pane.spots({ Loose: { x: 600, y: 0 } });
            pane.node_press(pointer(650, 25));
            pane.node_move(pointer(200, 120));
            // The line is drawn where the node would land, and the placement is
            // untouched while the pointer is over the page.
            $mol_assert_equal(pane.slot()?.owner, 'Board');
            $mol_assert_equal(pane.slot()?.index, 1);
            $mol_assert_like(pane.spots(), { Loose: { x: 600, y: 0 } });
            pane.node_release(pointer(200, 120, { buttons: 0 }));
            $mol_assert_like(moves, [{ name: 'Loose', owner: 'Board', index: 1 }]);
            $mol_assert_equal(pane.slot(), null);
            $mol_assert_like(pane.spots(), { Loose: { x: 600, y: 0 } });
        },
        'a drop on bare canvas still writes a coordinate and asks for no move'($) {
            const moves = [];
            const { pane } = pane_make($, {}, {
                containers: () => ['Board'],
                tree_move: (next) => {
                    if (next)
                        moves.push(next);
                    return next ?? null;
                },
            });
            pane.sizes_last = {
                [`${root}/Board`]: box(0, 0, 400, 300),
                [`${root}/Loose`]: box(600, 0, 100, 50),
            };
            pane.spots({ Loose: { x: 600, y: 0 } });
            pane.node_press(pointer(650, 25));
            pane.node_move(pointer(750, 125));
            pane.node_release(pointer(750, 125, { buttons: 0 }));
            $mol_assert_like(pane.spots(), { Loose: { x: 700, y: 100 } });
            $mol_assert_like(moves, []);
            $mol_assert_equal(pane.slot(), null);
        },
        /**
         * A node drawn inside an artboard has no coordinate to change: `spots`
         * positions the direct children of the root and nothing else, so a number
         * written for it would move nothing and lie in the desk layout for good.
         */
        'dragging a node that lives in a tree never writes a coordinate'($) {
            const moves = [];
            const { pane } = pane_make($, {}, {
                containers: () => ['Board'],
                tree_move: (next) => {
                    if (next)
                        moves.push(next);
                    return next ?? null;
                },
            });
            pane.sizes_last = {
                [`${root}/Board`]: box(0, 0, 400, 300),
                [`${root}/Board/Head`]: box(0, 0, 400, 100),
                [`${root}/Board/Foot`]: box(0, 100, 400, 100),
            };
            // Head taken by its own strip and carried below Foot.
            pane.node_press(pointer(200, 50));
            pane.node_move(pointer(200, 180));
            pane.node_release(pointer(200, 180, { buttons: 0 }));
            $mol_assert_like(pane.spots(), {});
            $mol_assert_like(moves, [{ name: 'Head', owner: 'Board', index: 2 }]);
        },
        /**
         * A row inside a column: the drop belongs to the innermost box it landed in,
         * and the position in it is counted along ITS direction, not its parent's.
         */
        'a container inside a container takes the drop itself'($) {
            const { pane } = pane_make($, {}, {
                containers: () => ['Page', 'Bar'],
                axis: (name) => name === 'Bar' ? 'row' : 'column',
            });
            pane.sizes_last = {
                [`${root}/Page`]: box(0, 0, 400, 600),
                [`${root}/Page/Head`]: box(0, 0, 400, 100),
                [`${root}/Page/Bar`]: box(0, 100, 400, 100),
                [`${root}/Page/Bar/Left`]: box(0, 100, 200, 100),
                [`${root}/Page/Bar/Right`]: box(200, 100, 200, 100),
                [`${root}/Page/Foot`]: box(0, 200, 400, 100),
            };
            // Inside the bar, which lies inside the page: the deeper one wins.
            const inner = pane.insert_slot([250, 150]);
            $mol_assert_equal(inner.owner, 'Bar');
            $mol_assert_equal(inner.index, 1);
            // Between the left and the right, across — the direction of the bar.
            $mol_assert_like(inner.line, { x: 200, y: 100, width: 0, height: 100 });
            // The same page, below the bar: the page takes it, counted downwards.
            const outer = pane.insert_slot([250, 400]);
            $mol_assert_equal(outer.owner, 'Page');
            $mol_assert_equal(outer.index, 3);
            // The pick follows the same rule, so what is picked and what a drop goes
            // into never disagree about which box the pointer is in.
            $mol_assert_equal(pane.node_at([250, 150]), 'Right');
        },
        /**
         * A container cannot become its own descendant, and a line drawn where the
         * drop would be refused is worse than no line at all.
         */
        'an artboard carried over itself offers no slot'($) {
            const { pane } = pane_make($, {}, { containers: () => ['Board', 'Inner'] });
            pane.sizes_last = {
                [`${root}/Board`]: box(0, 0, 400, 300),
                [`${root}/Board/Inner`]: box(0, 0, 400, 100),
            };
            $mol_assert_equal(pane.insert_slot([200, 50], 'Board'), null);
            $mol_assert_equal(pane.insert_slot([200, 50], 'Inner')?.owner, 'Board');
        },
    });
    /** Wirable ports of the two fixture classes, as the owner would hand them to the pane. */
    const ports = {
        [`${d}my_calc`]: [
            { name: 'result', next: false, kind: 'number' },
            { name: 'op', next: true, kind: 'string' },
        ],
        [`${d}my_map`]: [
            { name: 'zoom', next: true, kind: 'number' },
            { name: 'marker', next: true, kind: 'string' },
        ],
    };
    /**
     * A pane over a real document model: two parts, no wires yet. The pane reads
     * the wires and the ports through the same three properties the owner binds,
     * and writes through the same two events, so what is checked is the document.
     */
    function wired_make($, parts = [`Calc ${d}my_calc`, `Map ${d}my_map`]) {
        const node = $bog_vmap_lang_node.make({ $ });
        node.source([`${root} ${d}mol_view`, ...parts.map(part => '\t' + part), '\tsub /', ''].join('\n'));
        // To the fixed point of normalization, so that a write and its undo give the same bytes.
        node.tree(node.tree());
        const klass_of = (name) => node.props_tree().select(name).kids[0]?.kids[0]?.type ?? '';
        const made = pane_make($, {}, {
            wires: () => node.links(),
            part_ports: (name) => ports[klass_of(name)] ?? [],
            link_add: (next) => {
                if (next)
                    node.link_add(next);
                return next ?? null;
            },
            link_drop: (next) => {
                if (next)
                    node.link_drop(next.to, next.to_prop);
                return next ?? null;
            },
        });
        return { ...made, node };
    }
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    const png = new Uint8Array([0x1a, 0x0a, 0x00, 0x49, 0x48, 0x78, 0xda]);
    $mol_test({
        'base64 encode string'() {
            $mol_assert_equal($mol_base64_encode($mol_charset_encode('Hello, ΧΨΩЫ')), 'SGVsbG8sIM6nzqjOqdCr');
        },
        'base64 encode binary'() {
            $mol_assert_equal($mol_base64_encode(png), 'GgoASUh42g==');
        },
        'base64 encode string with plus'() {
            $mol_assert_equal($mol_base64_encode($mol_charset_encode('шоешпо')), '0YjQvtC10YjQv9C+');
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    const png = new Uint8Array([0x1a, 0x0a, 0x00, 0x49, 0x48, 0x78, 0xda]);
    const with_plus = new TextEncoder().encode('шоешпо');
    $mol_test({
        'base64 decode string'() {
            $mol_assert_equal($mol_base64_decode('SGVsbG8sIM6nzqjOqdCr'), new TextEncoder().encode('Hello, ΧΨΩЫ'));
        },
        'base64 decode binary'() {
            $mol_assert_equal($mol_base64_decode('GgoASUh42g=='), png);
        },
        'base64 decode binary - without equals'() {
            $mol_assert_equal($mol_base64_decode('GgoASUh42g'), png);
        },
        'base64 decode with plus'() {
            $mol_assert_equal($mol_base64_decode('0YjQvtC10YjQv9C+'), with_plus);
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    $mol_test({
        'empty hash'() {
            $mol_assert_equal($mol_crypto2_hash(new Uint8Array([])), new Uint8Array([218, 57, 163, 238, 94, 107, 75, 13, 50, 85, 191, 239, 149, 96, 24, 144, 175, 216, 7, 9]));
        },
        'three bytes hash'() {
            $mol_assert_equal($mol_crypto2_hash(new Uint8Array([255, 254, 253])), new Uint8Array([240, 150, 38, 243, 255, 128, 96, 0, 72, 215, 207, 228, 19, 149, 113, 52, 2, 125, 27, 77]));
        },
        'six bytes hash'() {
            $mol_assert_equal($mol_crypto2_hash(new Uint8Array([0, 255, 10, 250, 32, 128])), new Uint8Array([23, 25, 155, 181, 46, 200, 221, 83, 254, 0, 166, 68, 91, 255, 67, 140, 114, 88, 218, 155]));
        },
        'seven bytes hash'() {
            $mol_assert_equal($mol_crypto2_hash(new Uint8Array([1, 2, 3, 4, 5, 6, 7])), new Uint8Array([140, 31, 40, 252, 47, 72, 194, 113, 214, 196, 152, 240, 242, 73, 205, 222, 54, 92, 84, 197]));
        },
        'unaligned hash'() {
            const data = new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7]);
            $mol_assert_equal($mol_crypto2_hash(new Uint8Array(data.buffer, 1, 7)), new Uint8Array([140, 31, 40, 252, 47, 72, 194, 113, 214, 196, 152, 240, 242, 73, 205, 222, 54, 92, 84, 197]));
        },
        async 'reference'() {
            const data = new Uint8Array([255, 254, 253]);
            $mol_assert_equal($mol_crypto2_hash(data), new Uint8Array(await $mol_crypto_native.subtle.digest('SHA-1', data)));
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    var $$;
    (function ($$) {
        $mol_test({
            "Float schema"($) {
                $mol_assert_equal('$mol_schema_float', $mol_schema_float + '', $mol_key($mol_schema_float));
                $mol_assert_equal(true, $mol_schema_float.check(0));
                $mol_assert_equal(true, $mol_schema_float.check(Number.NaN));
                $mol_assert_equal(true, $mol_schema_float.check(Number.POSITIVE_INFINITY));
                $mol_assert_equal(false, $mol_schema_float.check(null));
                $mol_assert_equal(1.5, $mol_schema_float.cast(1.5));
                $mol_assert_equal(Number.NaN, $mol_schema_float.cast('0'));
                $mol_assert_equal(Number.EPSILON, $mol_schema_float.guard(Number.EPSILON));
                $mol_assert_fail(() => $mol_schema_float.guard('0'), 'Wrong type');
            },
        });
    })($$ = $_1.$$ || ($_1.$$ = {}));
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    var $$;
    (function ($$) {
        $mol_test({
            "String schema"($) {
                $mol_assert_equal('$mol_schema_string', $mol_schema_string + '', $mol_key($mol_schema_string));
                $mol_assert_equal(true, $mol_schema_string.check('foo'));
                $mol_assert_equal(false, $mol_schema_string.check(123));
                $mol_assert_equal('foo', $mol_schema_string.cast('foo'));
                $mol_assert_equal('', $mol_schema_string.cast(123));
                $mol_assert_equal('foo', $mol_schema_string.guard('foo'));
                $mol_assert_fail(() => $mol_schema_string.guard(123), 'Wrong type');
            },
        });
    })($$ = $_1.$$ || ($_1.$$ = {}));
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    var $$;
    (function ($$) {
        $mol_test({
            "Cache of maybe schema"($) {
                $mol_assert_equal($mol_schema_maybe($mol_schema_float), $mol_schema_maybe($mol_schema_float));
                $mol_assert_unique($mol_schema_maybe($mol_schema_float), $mol_schema_maybe($mol_schema_string));
            },
            "Optional value"($) {
                const Config = $mol_schema_maybe($mol_schema_string);
                $mol_assert_equal('$mol_schema_maybe<$mol_schema_string>', Config + '');
                $mol_assert_equal(true, Config.check('foo'));
                $mol_assert_equal(true, Config.check(undefined));
                $mol_assert_equal(true, Config.check(null));
                $mol_assert_equal(false, Config.check(0));
                $mol_assert_equal('foo', Config.cast('foo'));
                $mol_assert_equal(undefined, Config.cast(undefined));
                $mol_assert_equal(null, Config.cast(null));
                $mol_assert_equal(null, Config.cast(0));
                $mol_assert_equal('foo', Config.guard('foo'));
                $mol_assert_fail(() => Config.guard(123), 'Wrong type');
            },
        });
    })($$ = $_1.$$ || ($_1.$$ = {}));
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    var $$;
    (function ($$) {
        $mol_test({
            "Cache of instance schema"($) {
                $mol_assert_equal($mol_schema_instance(Uint8Array), $mol_schema_instance(Uint8Array));
                $mol_assert_unique($mol_schema_instance(Uint8Array), $mol_schema_instance(Int8Array));
            },
            "Class instance schema"($) {
                const Blob = $mol_schema_instance(Uint8Array);
                $mol_assert_equal('$mol_schema_instance<Uint8Array>', Blob + '', $mol_key(Blob));
                $mol_assert_equal(true, Blob.check(new Uint8Array));
                $mol_assert_equal(false, Blob.check(new Int8Array));
                $mol_assert_equal(false, Blob.check(null));
                $mol_assert_equal(new Uint8Array([0, 1]), Blob.cast(new Uint8Array([0, 1])));
                $mol_assert_fail(() => Blob.cast(new Int8Array), 'Wrong class');
                $mol_assert_equal(new Uint8Array, Blob.guard(new Uint8Array));
                $mol_assert_fail(() => Blob.guard(new Int8Array), 'Wrong class');
            },
            "Boxed instance schema"($) {
                const Str = $mol_schema_instance(String);
                $mol_assert_equal('$mol_schema_instance<String>', Str + '', $mol_key(Str));
                $mol_assert_equal(true, Str.check(Object('')));
                $mol_assert_equal(true, Str.check(''));
                $mol_assert_equal(true, Object('') instanceof Str);
            },
            "Schema instance schema"($) {
                const Str = $mol_schema_instance($mol_schema_instance(String));
                $mol_assert_equal('$mol_schema_instance<String>', Str + '', $mol_key(Str));
                $mol_assert_equal(true, Str.check(Object('')));
                $mol_assert_equal(true, Str.check(''));
                $mol_assert_equal(true, Object('') instanceof Str);
            },
        });
    })($$ = $_1.$$ || ($_1.$$ = {}));
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    var $$;
    (function ($$) {
        $mol_test({
            "Validation"($) {
                $mol_assert_fail(() => new $giper_baza_link('qwertyui_asdfghjk123'), 'Wrong Link');
            },
            "From integer"($) {
                $mol_assert_equal($giper_baza_link.from_int(178308648732587), new $giper_baza_link('qwertyui'));
            },
            "Pick Lord only"($) {
                $mol_assert_equal(new $giper_baza_link('qwertyui_asdfghjk_qazwsxed_zxcvbnm0').lord(), new $giper_baza_link('qwertyui_asdfghjk_qazwsxed').lord(), new $giper_baza_link('qwertyui_asdfghjk').lord(), new $giper_baza_link('qwertyui_asdfghjk'));
            },
            "Pick Land only"($) {
                $mol_assert_equal(new $giper_baza_link('qwertyui_asdfghjk__zxcvbnm0').land(), new $giper_baza_link('qwertyui_asdfghjk').land(), new $giper_baza_link('qwertyui_asdfghjk'));
                $mol_assert_equal(new $giper_baza_link('qwertyui_asdfghjk_qazwsxed_zxcvbnm0').land(), new $giper_baza_link('qwertyui_asdfghjk_qazwsxed').land(), new $giper_baza_link('qwertyui_asdfghjk_qazwsxed'));
            },
            "Pick Peer only"($) {
                $mol_assert_equal(new $giper_baza_link('qwertyui_asdfghjk_qazwsxed_zxcvbnm0').peer(), new $giper_baza_link('qwertyui_asdfghjk__zxcvbnm0').peer(), new $giper_baza_link('qwertyui'));
                $mol_assert_equal(new $giper_baza_link('___qazwsxed').peer(), new $giper_baza_link(''));
            },
            "Pick Head only"($) {
                $mol_assert_equal(new $giper_baza_link('qwertyui_asdfghjk_qazwsxed_zxcvbnm0').head(), new $giper_baza_link('qwertyui_asdfghjk__zxcvbnm0').head(), new $giper_baza_link('zxcvbnm0'));
                $mol_assert_equal(new $giper_baza_link('qwertyui_asdfghjk_qazwsxed').head(), new $giper_baza_link('qwertyui_asdfghjk').head(), new $giper_baza_link(''));
            },
            "Pick Area only"($) {
                $mol_assert_equal(new $giper_baza_link('qwertyui_asdfghjk_qazwsxed').area(), new $giper_baza_link('qwertyui_asdfghjk_qazwsxed_zxcvbnm0').area(), new $giper_baza_link('qazwsxed'));
                $mol_assert_equal(new $giper_baza_link('qwertyui_asdfghjk__zxcvbnm0').area(), new $giper_baza_link('qwertyui_asdfghjk').area(), new $giper_baza_link('').area(), new $giper_baza_link(''));
            },
            "Binary encoding"($) {
                const pawn = new $giper_baza_link('qwertyui_asdfghjk_qazwsxed_zxcvbnm0').toBin();
                const land = new $giper_baza_link('qwertyui_asdfghjk_qazwsxed').toBin();
                const lord = new $giper_baza_link('qwertyui_asdfghjk').toBin();
                const rel_pawn = new $giper_baza_link('___zxcvbnm0').toBin();
                const rel_root = new $giper_baza_link('').toBin();
                $mol_assert_equal(pawn.length, 24);
                $mol_assert_equal(land.length, 18);
                $mol_assert_equal(lord.length, 12);
                $mol_assert_equal(rel_pawn.length, 6);
                $mol_assert_equal(rel_root.length, 0);
                $mol_assert_equal($giper_baza_link.from_bin(pawn), new $giper_baza_link('qwertyui_asdfghjk_qazwsxed_zxcvbnm0'));
                $mol_assert_equal($giper_baza_link.from_bin(land), new $giper_baza_link('qwertyui_asdfghjk_qazwsxed'));
                $mol_assert_equal($giper_baza_link.from_bin(lord), new $giper_baza_link('qwertyui_asdfghjk'));
                $mol_assert_equal($giper_baza_link.from_bin(rel_pawn), new $giper_baza_link('zxcvbnm0'));
                $mol_assert_equal($giper_baza_link.from_bin(rel_root), new $giper_baza_link(''));
            },
            "Relate to base"($) {
                $mol_assert_equal(new $giper_baza_link('qwertyui_asdfghjk__zxcvbnm0').relate(new $giper_baza_link('QWERTYUI_ASDFGHJK')), new $giper_baza_link('qwertyui_asdfghjk__zxcvbnm0').relate(new $giper_baza_link('QWERTYUI_ASDFGHJK__ZXCVBNM0')), new $giper_baza_link('qwertyui_asdfghjk__zxcvbnm0'));
                $mol_assert_equal(new $giper_baza_link('qwertyui_asdfghjk_qazwsxed_zxcvbnm0').relate(new $giper_baza_link('qwertyui_asdfghjk_qazwsxed')), new $giper_baza_link('qwertyui_asdfghjk_qazwsxed_zxcvbnm0').relate(new $giper_baza_link('qwertyui_asdfghjk_qazwsxed_12345678')), new $giper_baza_link('qwertyui_asdfghjk__zxcvbnm0').relate(new $giper_baza_link('qwertyui_asdfghjk')), new $giper_baza_link('qwertyui_asdfghjk__zxcvbnm0').relate(new $giper_baza_link('qwertyui_asdfghjk__12345678')), new $giper_baza_link('___zxcvbnm0'));
                $mol_assert_equal(new $giper_baza_link('qwertyui_asdfghjk_qazwsxed').relate(new $giper_baza_link('qwertyui_asdfghjk_qazwsxed_zxcvbnm0')), new $giper_baza_link('qwertyui_asdfghjk_qazwsxed').relate(new $giper_baza_link('qwertyui_asdfghjk_qazwsxed')), new $giper_baza_link('qwertyui_asdfghjk').relate(new $giper_baza_link('qwertyui_asdfghjk__zxcvbnm0')), new $giper_baza_link('qwertyui_asdfghjk').relate(new $giper_baza_link('qwertyui_asdfghjk')), new $giper_baza_link(''));
            },
            "Resolve Link from base"($) {
                $mol_assert_equal(new $giper_baza_link('qwertyui_asdfghjk__zxcvbnm0').resolve(new $giper_baza_link('QWERTYUI_ASDFGHJK__ZXCVBNM0')), new $giper_baza_link('qwertyui_asdfghjk__zxcvbnm0').resolve(new $giper_baza_link('QWERTYUI_ASDFGHJK')), new $giper_baza_link('qwertyui_asdfghjk__zxcvbnm0').resolve(new $giper_baza_link('qwertyui_asdfghjk')), new $giper_baza_link('qwertyui_asdfghjk__zxcvbnm0'));
                $mol_assert_equal(new $giper_baza_link('___12345678').resolve(new $giper_baza_link('qwertyui_asdfghjk')), new $giper_baza_link('___12345678').resolve(new $giper_baza_link('qwertyui_asdfghjk__zxcvbnm0')), new $giper_baza_link('qwertyui_asdfghjk__12345678'));
                $mol_assert_equal(new $giper_baza_link('___12345678').resolve(new $giper_baza_link('qwertyui_asdfghjk_qazwsxed')), new $giper_baza_link('___12345678').resolve(new $giper_baza_link('qwertyui_asdfghjk_qazwsxed_zxcvbnm0')), new $giper_baza_link('qwertyui_asdfghjk_qazwsxed_12345678'));
                $mol_assert_equal(new $giper_baza_link('').resolve(new $giper_baza_link('qwertyui_asdfghjk')), new $giper_baza_link('').resolve(new $giper_baza_link('qwertyui_asdfghjk__zxcvbnm0')), new $giper_baza_link('qwertyui_asdfghjk'));
                $mol_assert_equal(new $giper_baza_link('').resolve(new $giper_baza_link('qwertyui_asdfghjk_qazwsxed')), new $giper_baza_link('').resolve(new $giper_baza_link('qwertyui_asdfghjk_qazwsxed_zxcvbnm0')), new $giper_baza_link('qwertyui_asdfghjk_qazwsxed'));
            },
            'Hashing'() {
                $mol_assert_equal($giper_baza_link.hash_bin(new Uint8Array([1, 2, 3])), new $giper_baza_link('cDeAcZjC_Kn0rCAc3'));
                $mol_assert_equal($giper_baza_link.hash_str('foo bar'), new $giper_baza_link('N3PeplFW_kJg4æmwi'));
            }
        });
    })($$ = $_1.$$ || ($_1.$$ = {}));
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    $mol_test({
        async 'str & bin sizes'() {
            const signer = await $$.$mol_crypto2_signer.generate();
            const auditor = signer.auditor();
            $mol_assert_equal(signer.toStringPrivate().length, $mol_crypto2_signer.size_str);
            $mol_assert_equal(auditor.toString().length, $mol_crypto2_auditor.size_str);
            $mol_assert_equal(signer.asArrayPrivate().length, $mol_crypto2_signer.size_bin);
            $mol_assert_equal(auditor.asArray().length, $mol_crypto2_auditor.size_bin);
            const data = new Uint8Array([1, 2, 3]);
            const sign = await signer.sign(data);
            $mol_assert_equal(sign.byteLength, $mol_crypto2_signer.size_sign);
        },
        async 'verify self signed with auto generated key'() {
            const Alice = await $$.$mol_crypto2_signer.generate();
            const data = new Uint8Array([1, 2, 3]);
            const sign = await Alice.sign(data);
            $mol_assert_equal(true, await Alice.auditor().verify(data, sign));
        },
        async 'verify signed with str exported auto generated key'() {
            const Alice = await $$.$mol_crypto2_signer.generate();
            const data = new Uint8Array([1, 2, 3]);
            const Bella = $mol_crypto2_signer.from(Alice.toString() + Alice.toStringPrivate());
            const sign = await Bella.sign(data);
            const Catie = $mol_crypto2_auditor.from(Alice.auditor().toString());
            $mol_assert_equal(true, await Catie.verify(data, sign));
            const Diana = $mol_crypto2_auditor.from(Alice.toString());
            $mol_assert_equal(true, await Diana.verify(data, sign));
        },
        async 'verify signed with bin exported auto generated key'() {
            const Alice = await $$.$mol_crypto2_signer.generate();
            const data = new Uint8Array([1, 2, 3]);
            const Bella = $mol_crypto2_signer.from(new Uint8Array([...Alice.asArray(), ...Alice.asArrayPrivate()]));
            const sign = await Bella.sign(data);
            const Catie = $mol_crypto2_auditor.from(Alice.auditor().asArray());
            $mol_assert_equal(true, await Catie.verify(data, sign));
            const Diana = $mol_crypto2_auditor.from(Alice.asArray());
            $mol_assert_equal(true, await Diana.verify(data, sign));
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    $mol_test({
        async 'Sizes'() {
            const secret = $mol_crypto_sacred.make();
            const key = secret.asArray();
            $mol_assert_equal(key.byteLength, $mol_crypto_sacred.size);
            const data = new Uint8Array([1, 2, 3]);
            const salt = $mol_crypto_salt();
            const closed = await secret.encrypt(data, salt);
            $mol_assert_equal(closed.byteLength, $mol_crypto_sacred.size);
            const self_closed = await secret.close(secret, salt);
            $mol_assert_equal(self_closed.byteLength, $mol_crypto_sacred.size);
        },
        async 'Decrypt self encrypted'() {
            const secret = $mol_crypto_sacred.make();
            const data = new Uint8Array([1, 2, 3]);
            const salt = $mol_crypto_salt();
            const closed = await secret.encrypt(data, salt);
            const opened = await secret.decrypt(closed, salt);
            $mol_assert_equal(data, opened);
        },
        async 'Decrypt encrypted with exported key'() {
            const data = new Uint8Array([1, 2, 3]);
            const salt = $mol_crypto_salt();
            const Alice = $mol_crypto_sacred.make();
            const closed = await Alice.encrypt(data, salt);
            const Bob = $mol_crypto_sacred.from(Alice.asArray());
            const opened = await Bob.decrypt(closed, salt);
            $mol_assert_equal(data, opened);
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    $mol_test({
        async 'str & bin sizes'() {
            const cipher = await $$.$mol_crypto2_cipher.generate();
            const socket = cipher.socket();
            $mol_assert_equal(cipher.toStringPrivate().length, $mol_crypto2_cipher.size_str);
            $mol_assert_equal(socket.toString().length, $mol_crypto2_socket.size_str);
            $mol_assert_equal(cipher.asArrayPrivate().length, $mol_crypto2_cipher.size_bin);
            $mol_assert_equal(socket.asArray().length, $mol_crypto2_socket.size_bin);
            const secret = await cipher.secret(socket);
            $mol_assert_equal(secret.byteLength, $mol_crypto2_cipher.size_secret);
        },
        async 'Shared secret from public & private keys'() {
            const A = await $mol_crypto2_cipher.generate();
            const B = await $mol_crypto2_cipher.generate();
            const SA = await A.secret(B.socket());
            const SB = await B.secret(A.socket());
            $mol_assert_equal(SA.asArray(), SB.asArray());
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    var $$;
    (function ($$) {
        $mol_test({
            async "Signing & encryption"($) {
                const Alice = await $mol_crypto2_private.generate();
                const Bella = await $mol_crypto2_private.generate();
                const secretA = await Alice.cipher().secret(Bella.socket());
                const secretB = await Bella.cipher().secret(Alice.socket());
                $mol_assert_equal(secretA, secretB);
                const data = new Uint8Array([1, 2, 3]);
                const nonce = $mol_crypto2_nonce();
                const closed = await secretA.encrypt(data, nonce);
                const digest = $mol_crypto2_hash(closed);
                const sign = await Alice.signer().sign(digest);
                $mol_assert_equal(true, await Alice.auditor().verify(digest, sign));
                $mol_assert_equal(data, await secretA.decrypt(closed, nonce));
            },
            async "Serial & Deserial"($) {
                const orig = await $mol_crypto2_private.generate();
                const bin = new Uint8Array([...orig.asArray(), ...orig.asArrayPrivate()]);
                const str = orig.toString() + orig.toStringPrivate();
                $mol_assert_equal(orig, $mol_crypto2_private.from(bin), $mol_crypto2_private.from(str));
            },
        });
    })($$ = $_1.$$ || ($_1.$$ = {}));
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    $mol_test_mocks.push($ => {
        class $giper_baza_auth_mock extends $.$giper_baza_auth {
            static current() {
                return this.from('_7uaNxSijvQDjZ-9a9r22hpcROZwhgBTaWZrcDIMwkU3e6xFHq_7h9-Dfxgif7E_szNlubYXJLUWFNt8x5ko3wb0YsrNPmwb8tahStoyKB_J5_gj8LqmJItGnwJHsGmRs17BgVIMzCEMbNqhiBiz6-dkW9PFWp346RUya2lNHzpk');
            }
            static embryos = [
                '_7bJySpjwMJr-9xpQtl3XIQhiiHIAJ3mJGJ9Z8XJXOMbKLhjUHMrA4RZzmscCgO0c7xnXnw_UFhwhDN7CRHOTca4x_vAJdIvjnNNRkBaYqJJRHBiLn6Cjf1Iv7ZYsHBZQZ72WxwYK8xKs8L3Kokv5RZ-jqBoozqc8JIFI1DWayJM',
                '_zOldFN6un21Kk9V_Z51D84ZJXdDoSfkxZZl5iNdSJ8mN-zcOuKh0tUTajmynoVmYG73krPQXIkIlGLAEwx5n03Fju-SIG0_fENxSNDRH8Pukvibs6nnMDPgXCYRvJi6gL8ZVwedP7LYkwa1qpsaUN7nmjWvhkkgVcVMLYK0Jk7g',
                '_8-GDFlnyEYoMzoeCiH1H7lBLuqMyZ1S_2ZEt0o4YIE4frZ1syTbDar0RqkFzC78BhVCYVykYxDTewnzyq4nEwG3y1Al3BskP59eYuDeaH0UKbBNF407K7kGJrMpJXZtMj0kZdX16E3aKfUmeLp0NL9VWFrAg6QiVQd1jJ5-MU5w',
                '_9GnExCEqMmBM5nBUnfdGBPjYSVHOUjHygAFipsPU0UU8mOgMS9JC8Wwkv0waX-JgfPrI_em3gPznH-2_C9MDcP03zEmIAoLRltMEBftax-lHJ52kciH3GUFAdQ1glc9Ej8ypgYHvfvO5gkQA6q0DhCEcWUPkOok5OvJre6iO358',
                '_y1XB55LywSvOEtuyr_hh3wjRaW7gFW_aebG1eSQFmcFTzFvw50xd9Vft_jXFvP3Cd9T4jL-eIPMizBX9gafRcaW8XDdjaWW6GDCJLeXBSoFQH4PpNjufNT7BaPCZfAwY_12rLEO66Pse1GrzdVHU6wSOciL99w56zQLgzFLHErc',
                '_62jup6y61Rt8SN8Oq1Lzu5GXA_WL7oxoRPkRPQNkiwvKz8z4D2p8g_Qa5QWvBYmFrgBwAZmarD1UJ1ucA_zUQbrgMUBmEiYv7S4AApUa1Obo6r2KQ_70BebGOo_F3lNUtzfNxEnMh4FRLShzu0hLlp6gZyFjW7aZKoqLRXR68bw',
                '_yXB4FEZnF35nrJxHpsiS3YB18ADNOwbrKIYKcXAdpAIjWy6A4-Nx6K44RWNvgnreWlACm6PaaymM6he1TaCAAyS8ouYHqSezBbGRPyKmKVXjcyHYfQ33W3tQvipwLM8YB3VcOAuvRBNaiQLLzPb9saE5HT2cU25EJE34hpAVm6I',
                '_6iVZXF5fD2ztELDFvmhTAJWMRNLBMRv3W6GArqcVLwcCM6WeoqPAySo05cG-XaqXTme0iC3Pzf5jvlHqY1GgAO4qfQcF3EWV66Uw9sYD1T_tu_rmKYjYT5YXyaxtki08r50YHA-Jw4obKcDHt6_sDONANUA7pCYjIeFGt0mv1Zs',
                '_yPV-YZgPu0_edJc3I8o1SUKqUucgYVKlbTrKqVyl3sxjQo3u73nGtQq190q3W_ebhVnQWLC8A4JFhbjWDCTzY8i7shadOvvSEeAfuPqsyK5JERqw-tbJm_0nvR8bShIcXzyrYDIg_ZBU_wNKbFzoCXHmh-CNsuKpb6NyBQPsIrU',
                '_-67MXDuic5c7e4Febc1QuI456bgmfeMnmp3rWcGWzcMIPytythDMqmZISsGGsLVFUOQxsGjm7s3ULV-307L3wd47B4K4BtUhTR5cyKMI4y5Ld-UstbevtgOURqLsc_XIhyFilGTJ8ORTRW7RI3O83xtRu-_0lRg9WcmnhWERBIU',
            ];
        }
        __decorate([
            $mol_mem
        ], $giper_baza_auth_mock, "current", null);
        $.$giper_baza_auth = $giper_baza_auth_mock;
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    $mol_test({
        'parse and serial'() {
            $mol_assert_equal(new $mol_time_duration('P42.1Y').toString(), 'P42.1YT');
            $mol_assert_equal(new $mol_time_duration('P42.1M').toString(), 'P42.1MT');
            $mol_assert_equal(new $mol_time_duration('P42.1D').toString(), 'P42.1DT');
            $mol_assert_equal(new $mol_time_duration('PT42.1h').toString(), 'PT42.1H');
            $mol_assert_equal(new $mol_time_duration('PT42.1m').toString(), 'PT42.1M');
            $mol_assert_equal(new $mol_time_duration('PT42.1s').toString(), 'PT42.1S');
            $mol_assert_equal(new $mol_time_duration('P1Y2M3DT4h5m6.7s').toString(), 'P1Y2M3DT4H5M6.7S');
        },
        'negatives'() {
            $mol_assert_equal(new $mol_time_duration('P-1Y-2M-3DT-4h-5m-6.7s').toString(), new $mol_time_duration('-P1Y2M3DT4h5m6.7s').toString(), 'P-1Y-2M-3DT-4H-5M-6.7S');
            $mol_assert_equal(new $mol_time_duration('-P-1Y-2M-3DT-4h-5m-6.7s').toString(), 'P1Y2M3DT4H5M6.7S');
        },
        'format typed'() {
            $mol_assert_equal(new $mol_time_duration('P1Y2M3DT4h5m6s').toString('P#Y#M#DT#h#m#s'), 'P1Y2M3DT4H5M6S');
        },
        'format readable'() {
            $mol_assert_equal(new $mol_time_duration('P1Y2M3DT4h5m6s').toString('hh:mm:ss.sss'), '04:05:06.000');
        },
        'normalization'() {
            $mol_assert_equal(new $mol_time_duration('P1Y2M3DT44h55m66s').normal.toString(), 'P1Y2M4DT20H56M6S');
            $mol_assert_equal(new $mol_time_duration('P-1Y-2M-3DT-44h-55m-66s').normal.toString(), 'P-1Y-2M-4DT-20H-56M-6S');
        },
        'comparison'() {
            const iso = 'P1Y1M1DT1h1m1s';
            $mol_assert_equal(new $mol_time_duration(iso), new $mol_time_duration(iso));
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    $mol_test({
        'parse and serial'() {
            $mol_assert_equal(new $mol_time_moment('2014').toString(), '2014');
            $mol_assert_equal(new $mol_time_moment('2014-01').toString(), '2014-01');
            $mol_assert_equal(new $mol_time_moment('2014-01-02').toString(), '2014-01-02');
            $mol_assert_equal(new $mol_time_moment('2014-01-02T03').toString(), '2014-01-02T03');
            $mol_assert_equal(new $mol_time_moment('2014-01-02T03:04').toString(), '2014-01-02T03:04');
            $mol_assert_equal(new $mol_time_moment('2014-01-02T03:04:05').toString(), '2014-01-02T03:04:05');
            $mol_assert_equal(new $mol_time_moment('2014-01-02T03:04:05.006').toString(), '2014-01-02T03:04:05.006');
            $mol_assert_equal(new $mol_time_moment('2014-01-02T03:04:05.006Z').toString(), '2014-01-02T03:04:05.006+00:00');
            $mol_assert_equal(new $mol_time_moment('2014-01-02T03:04:05.006+07:00').toString(), '2014-01-02T03:04:05.006+07:00');
            $mol_assert_equal(new $mol_time_moment('2014-01-02T03:04:05+07:08').toString(), '2014-01-02T03:04:05+07:08');
            $mol_assert_equal(new $mol_time_moment('2014-01-02T03:04+07:08').toString(), '2014-01-02T03:04+07:08');
            $mol_assert_equal(new $mol_time_moment('T03:04+07:08').toString(), 'T03:04+07:08');
            $mol_assert_equal(new $mol_time_moment('T03:04:05').toString(), 'T03:04:05');
            $mol_assert_equal(new $mol_time_moment('T03:04').toString(), 'T03:04');
            $mol_assert_equal(new $mol_time_moment('T03').toString(), 'T03');
        },
        'format simple'() {
            $mol_assert_equal(new $mol_time_moment('2014-01-02T01:02:03.000000').toString('AD YY-M-D h:m:s'), '21 14-1-2 1:2:3');
        },
        'format padded'() {
            $mol_assert_equal(new $mol_time_moment('2014-01-02T01:02:03.000').toString('YYYY-MM-DD hh:mm:ss'), '2014-01-02 01:02:03');
        },
        'format time zone'() {
            $mol_assert_equal(new $mol_time_moment('2014-01-02T01:02:03+05:00').toString('Z'), '+05:00');
        },
        'format names'() {
            new $mol_time_moment('2014-01-02T01:02:03.000').toString('Month Mon | WeekDay WD');
        },
        'shifting'() {
            $mol_assert_equal(new $mol_time_moment('T15:54:58.243+03:00').shift({}).toString(), 'T15:54:58.243+03:00');
            $mol_assert_equal(new $mol_time_moment('2014-01-02').shift('P1Y').toString(), '2015-01-02');
            $mol_assert_equal(new $mol_time_moment('2014-01-02').shift('P12M').toString(), '2015-01-02');
            $mol_assert_equal(new $mol_time_moment('2014-01-02').shift('P365D').toString(), '2015-01-02');
            $mol_assert_equal(new $mol_time_moment('2014-01-02').shift('PT8760h').toString(), '2015-01-02');
            $mol_assert_equal(new $mol_time_moment('2014-01').shift('PT8760h').toString(), '2015-01');
            $mol_assert_equal(new $mol_time_moment('2014-01').shift('PT-8760h').toString(), '2013-01');
        },
        'native from reduced'() {
            $mol_assert_equal(new $mol_time_moment('T15:00').native.toISOString().slice(0, -5), new $mol_time_moment().merge('T15:00:00').toOffset('Z').toString().slice(0, -6));
        },
        'normalization'() {
            $mol_assert_equal(new $mol_time_moment({ year: 2015, month: 6, day: 34 }).normal.toString(), '2015-08-04');
            $mol_assert_equal(new $mol_time_moment('2024-09-30 19:00+03:00').normal.month, 8);
        },
        'renormalization'() {
            $mol_assert_equal(new $mol_time_moment('2024-08').normal.toString(), '2024-08');
            $mol_assert_equal(new $mol_time_moment('2024-11').normal.toString(), '2024-11');
        },
        'iso week day'() {
            $mol_assert_equal(new $mol_time_moment('2017-09-17').weekday, $mol_time_moment_weekdays.sunday);
            $mol_assert_equal(new $mol_time_moment('2017-09-18').weekday, $mol_time_moment_weekdays.monday);
        },
        'change offset'() {
            $mol_assert_equal(new $mol_time_moment('2021-04-10 +03:00').toOffset('Z').toString(), '2021-04-09T21:00:00+00:00');
        },
        'comparison'() {
            const iso = '2021-01-02T03:04:05.678+09:10';
            $mol_assert_equal(new $mol_time_moment(iso), new $mol_time_moment(iso));
        },
        'array keeps zero offset'() {
            const moment = new $mol_time_moment('2026-01-25T16:37:36.129+00:00');
            const restored = new $mol_time_moment(moment.toArray());
            $mol_assert_equal(restored.offset?.count('PT1m'), 0);
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    $mol_test({
        'Watch one value'($) {
            class App extends $mol_object2 {
                static $ = $;
                static dict = new $mol_wire_dict();
                static lucky() {
                    return this.dict.get(777);
                }
            }
            __decorate([
                $mol_wire_solo
            ], App, "lucky", null);
            $mol_assert_equal(App.lucky(), undefined);
            App.dict.set(666, 6666);
            $mol_assert_equal(App.lucky(), undefined);
            App.dict.set(777, 7777);
            $mol_assert_equal(App.lucky(), 7777);
            App.dict.delete(777);
            $mol_assert_equal(App.lucky(), undefined);
        },
        'Watch item channel'($) {
            class App extends $mol_object2 {
                static $ = $;
                static dict = new $mol_wire_dict();
                static lucky() {
                    return this.dict.item(777);
                }
            }
            __decorate([
                $mol_wire_solo
            ], App, "lucky", null);
            $mol_assert_equal(App.lucky(), null);
            App.dict.item(666, 6666);
            $mol_assert_equal(App.lucky(), null);
            App.dict.item(777, 7777);
            $mol_assert_equal(App.lucky(), 7777);
            App.dict.item(777, null);
            $mol_assert_equal(App.lucky(), null);
        },
        'Watch size'($) {
            class App extends $mol_object2 {
                static $ = $;
                static dict = new $mol_wire_dict();
                static size() {
                    return this.dict.size;
                }
            }
            __decorate([
                $mol_wire_solo
            ], App, "size", null);
            $mol_assert_equal(App.size(), 0);
            App.dict.set(666, 6666);
            $mol_assert_equal(App.size(), 1);
            App.dict.set(777, 7777);
            $mol_assert_equal(App.size(), 2);
            App.dict.delete(777);
            $mol_assert_equal(App.size(), 1);
        },
        'Watch for-of'($) {
            class App extends $mol_object2 {
                static $ = $;
                static dict = new $mol_wire_dict();
                static sum() {
                    let keys = 0;
                    let vals = 0;
                    for (const [key, val] of this.dict) {
                        keys += key;
                        vals += val;
                    }
                    return [keys, vals];
                }
            }
            __decorate([
                $mol_wire_solo
            ], App, "sum", null);
            $mol_assert_like(App.sum(), [0, 0]);
            App.dict.set(111, 1111);
            $mol_assert_like(App.sum(), [111, 1111]);
            App.dict.set(222, 2222);
            $mol_assert_like(App.sum(), [333, 3333]);
            App.dict.delete(111);
            $mol_assert_like(App.sum(), [222, 2222]);
        },
        'Watch forEach'($) {
            class App extends $mol_object2 {
                static $ = $;
                static dict = new $mol_wire_dict();
                static sum() {
                    let keys = 0;
                    let vals = 0;
                    this.dict.forEach((val, key) => {
                        keys += key;
                        vals += val;
                    });
                    return [keys, vals];
                }
            }
            __decorate([
                $mol_wire_solo
            ], App, "sum", null);
            $mol_assert_like(App.sum(), [0, 0]);
            App.dict.set(111, 1111);
            $mol_assert_like(App.sum(), [111, 1111]);
            App.dict.set(222, 2222);
            $mol_assert_like(App.sum(), [333, 3333]);
            App.dict.delete(111);
            $mol_assert_like(App.sum(), [222, 2222]);
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    $mol_test({
        'ordered links'() {
            var graph = new $mol_graph();
            graph.link('A', 'B', 'E');
            $mol_assert_equal(graph.edge_out('A', 'B'), 'E');
            $mol_assert_equal(graph.edge_in('B', 'A'), 'E');
            $mol_assert_equal(graph.edge_out('B', 'A'), null);
            $mol_assert_equal(graph.edge_in('A', 'B'), null);
        },
        'nodes without edges'() {
            var graph = new $mol_graph();
            graph.nodes.add('A');
            graph.nodes.add('B');
            graph.nodes.add('C');
            graph.nodes.add('D');
            graph.acyclic(edge => 0);
            $mol_assert_equal([...graph.sorted].join(''), 'ABCD');
        },
        'partial ordering'() {
            var graph = new $mol_graph();
            graph.nodes.add('A');
            graph.nodes.add('B');
            graph.nodes.add('C');
            graph.nodes.add('D');
            graph.link('B', 'C', { priority: 0 });
            graph.acyclic(edge => edge.priority);
            $mol_assert_equal([...graph.sorted].join(''), 'ACBD');
        },
        'sorting must cut cycles at low priority edges A'() {
            var graph = new $mol_graph();
            graph.link('A', 'B', { priority: 0 });
            graph.link('B', 'C', { priority: -2 });
            graph.link('C', 'D', { priority: 0 });
            graph.link('D', 'A', { priority: -1 });
            graph.acyclic(edge => edge.priority);
            $mol_assert_equal([...graph.sorted].join(''), 'BADC');
        },
        'sorting must cut cycles at low priority edges B'() {
            var graph = new $mol_graph();
            graph.link('B', 'C', { priority: -2 });
            graph.link('C', 'D', { priority: 0 });
            graph.link('D', 'A', { priority: -1 });
            graph.link('A', 'B', { priority: 0 });
            graph.acyclic(edge => edge.priority);
            $mol_assert_equal([...graph.sorted].join(''), 'BADC');
        },
        'sorting must cut cycles at low priority edges C'() {
            var graph = new $mol_graph();
            graph.link('C', 'D', { priority: 0 });
            graph.link('D', 'A', { priority: -1 });
            graph.link('A', 'B', { priority: 0 });
            graph.link('B', 'C', { priority: -2 });
            graph.acyclic(edge => edge.priority);
            $mol_assert_equal([...graph.sorted].join(''), 'BADC');
        },
        'sorting must cut cycles at low priority edges D'() {
            var graph = new $mol_graph();
            graph.link('D', 'A', { priority: -1 });
            graph.link('A', 'B', { priority: 0 });
            graph.link('B', 'C', { priority: -2 });
            graph.link('C', 'D', { priority: 0 });
            graph.acyclic(edge => edge.priority);
            $mol_assert_equal([...graph.sorted].join(''), 'BADC');
        },
        'sorting must group cutted cycles'() {
            var graph = new $mol_graph();
            graph.link('A', 'B', 0);
            graph.link('B', 'C', 0);
            graph.link('C', 'D', -2);
            graph.link('D', 'E', 0);
            graph.link('E', 'C', 0);
            graph.acyclic(edge => edge);
            $mol_assert_equal([...graph.sorted].join(''), 'CEDBA');
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    $mol_test({
        'Is number'() {
            $mol_data_number(0);
        },
        'Is not number'() {
            $mol_assert_fail(() => {
                $mol_data_number('x');
            }, 'x is not a number');
        },
        'Is object number'() {
            $mol_assert_fail(() => {
                $mol_data_number(new Number(''));
            }, '0 is not a number');
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    $mol_test({
        'Is integer'() {
            $mol_data_integer(0);
        },
        'Is float'() {
            $mol_assert_fail(() => {
                $mol_data_integer(1.1);
            }, '1.1 is not an integer');
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    $mol_test({
        'tagged typing'() {
            const { Weight, Length } = $mol_data_tagged({
                Weight: $mol_data_integer,
                Length: $mol_data_integer,
            });
            Length(20); // Validate
            let len = Length(10); // Inferred type
            len = 20; // Explicit type
            let num = len; // Implicit cast
            len = Length(Weight(20)); // Explicit cast
            // len = 20 // Compile time error
            // len = Weight( 20 ) // Compile time error
            // len = Length( 20.1 ) // Run time error
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    $mol_test({
        'gift unit type'() {
            const gift = $giper_baza_unit_gift.make();
            gift.rank($giper_baza_rank_rule);
            $mol_assert_equal(gift.kind(), 'gift');
            $mol_assert_equal(gift.rank(), $giper_baza_rank_rule);
        },
        'data unit type'() {
            const unit = $giper_baza_unit_sand.make(2);
            unit.ball(new Uint8Array([0xFF, 0xFF]));
            $mol_assert_equal(unit.kind(), 'sand');
            $mol_assert_equal(unit.size(), 2);
            $mol_assert_equal(unit.ball(), new Uint8Array([0xFF, 0xFF]));
        },
        'big data unit type'() {
            const unit = $giper_baza_unit_sand.make(1000);
            unit.ball(new Uint8Array(1000));
            $mol_assert_equal(unit.kind(), 'sand');
            $mol_assert_equal(unit.size(), 1000);
            $mol_assert_equal(unit.ball(), new Uint8Array(1000));
        },
        'gift unit fields'() {
            const unit = $giper_baza_unit_gift.make();
            $mol_assert_equal(unit.time(), 0);
            $mol_assert_equal(unit.mate(), $giper_baza_link.hole);
            unit.time_tick(0xd1d2d3d4d5d6);
            unit.mate(new $giper_baza_link('ÆPv6æfj3_9vX08ÆLx'));
            $mol_assert_equal(unit.time_tick(), 0xd1d2d3d4d5d6);
            $mol_assert_equal(unit.mate(), new $giper_baza_link('ÆPv6æfj3_9vX08ÆLx'));
        },
        'data unit fields'() {
            const unit = $giper_baza_unit_sand.make(0);
            $mol_assert_equal(unit.time(), 0);
            $mol_assert_equal(unit.head(), $giper_baza_link.hole);
            $mol_assert_equal(unit.self(), $giper_baza_link.hole);
            $mol_assert_equal(unit.lead(), $giper_baza_link.hole);
            unit.time_tick(0xd1d2d3d4d5d6);
            unit.head(new $giper_baza_link('ÆPv6æfj3'));
            unit.self(new $giper_baza_link('Pv6æfj39'));
            unit.lead(new $giper_baza_link('v6æfj39v'));
            $mol_assert_equal(unit.time_tick(), 0xd1d2d3d4d5d6);
            $mol_assert_equal(unit.head(), new $giper_baza_link('ÆPv6æfj3'));
            $mol_assert_equal(unit.self(), new $giper_baza_link('Pv6æfj39'));
            $mol_assert_equal(unit.lead(), new $giper_baza_link('v6æfj39v'));
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    $mol_test({
        'triplets'() {
            $mol_assert_equal(new $mol_time_interval('2015-01-01/P1M').end.toString(), '2015-02-01');
            $mol_assert_equal(new $mol_time_interval('P1M/2015-02-01').start.toString(), '2015-01-01');
            $mol_assert_equal(new $mol_time_interval('2015-01-01/2015-02-01').duration.toString(), 'PT2678400S');
        },
        'comparison'() {
            const iso = '2021-01-02/2022-03-04';
            $mol_assert_like(new $mol_time_interval(iso), new $mol_time_interval(iso));
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    var $$;
    (function ($$) {
        $mol_test({
            "1 byte int"($) {
                $mol_assert_equal($mol_bigint_encode(0n), new Uint8Array(new Int8Array([0]).buffer));
                $mol_assert_equal($mol_bigint_encode(1n), new Uint8Array(new Int8Array([1]).buffer));
                $mol_assert_equal($mol_bigint_encode(-1n), new Uint8Array(new Int8Array([-1]).buffer));
                $mol_assert_equal($mol_bigint_encode(127n), new Uint8Array(new Int8Array([127]).buffer));
                $mol_assert_equal($mol_bigint_encode(-128n), new Uint8Array(new Int8Array([-128]).buffer));
            },
            "2 byte int"($) {
                $mol_assert_equal($mol_bigint_encode(128n), new Uint8Array(new Int16Array([128]).buffer));
                $mol_assert_equal($mol_bigint_encode(-129n), new Uint8Array(new Int16Array([-129]).buffer));
                $mol_assert_equal($mol_bigint_encode(128n * 256n - 1n), new Uint8Array(new Int16Array([128 * 256 - 1]).buffer));
                $mol_assert_equal($mol_bigint_encode(-128n * 256n), new Uint8Array(new Int16Array([-128 * 256]).buffer));
            },
            "3 byte int"($) {
                $mol_assert_equal($mol_bigint_encode(128n * 256n), new Uint8Array(new Int32Array([128 * 256]).buffer).slice(0, 3));
                $mol_assert_equal($mol_bigint_encode(-128n * 256n - 1n), new Uint8Array(new Int32Array([-128 * 256 - 1]).buffer).slice(0, 3));
                $mol_assert_equal($mol_bigint_encode(128n * 256n ** 2n - 1n), new Uint8Array(new Int32Array([128 * 256 ** 2 - 1]).buffer).slice(0, 3));
                $mol_assert_equal($mol_bigint_encode(-128n * 256n ** 2n), new Uint8Array(new Int32Array([-128 * 256 ** 2]).buffer).slice(0, 3));
            },
            "4 byte int"($) {
                $mol_assert_equal($mol_bigint_encode(128n * 256n ** 2n), new Uint8Array(new Int32Array([128 * 256 ** 2]).buffer));
                $mol_assert_equal($mol_bigint_encode(-128n * 256n ** 2n - 1n), new Uint8Array(new Int32Array([-128 * 256 ** 2 - 1]).buffer));
                $mol_assert_equal($mol_bigint_encode(128n * 256n ** 3n - 1n), new Uint8Array(new Int32Array([128 * 256 ** 3 - 1]).buffer));
                $mol_assert_equal($mol_bigint_encode(-128n * 256n ** 3n), new Uint8Array(new Int32Array([-128 * 256 ** 3]).buffer));
            },
            "8 byte int"($) {
                $mol_assert_equal($mol_bigint_encode(128n * 256n ** 7n - 1n), new Uint8Array(new BigInt64Array([128n * 256n ** 7n - 1n]).buffer));
                $mol_assert_equal($mol_bigint_encode(-128n * 256n ** 7n), new Uint8Array(new BigInt64Array([-128n * 256n ** 7n]).buffer));
            },
        });
    })($$ = $_1.$$ || ($_1.$$ = {}));
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    var $$;
    (function ($$) {
        function check(text, bytes) {
            const ideal = new Uint8Array(bytes);
            const actual = $mol_charset_ucf_encode(text);
            $mol_assert_equal($mol_charset_ucf_decode(actual), text);
            $mol_assert_equal(actual, ideal);
        }
        $mol_test({
            "Full ASCII compatible"($) {
                check('hi', [0x68, 0x69]);
            },
            "1B ASCII with diacritic"($) {
                check('allo\u0300', [0x61, 0x6C, 0x6C, 0x6F, 0xE2]);
            },
            "1B Cyrillic"($) {
                check('мир', [0x88, 0x3C, 0xE2, 0x40, 0xF8]);
            },
            "1B Cyrillic with nummbers and punctuation"($) {
                check('м.1', [0x88, 0x3C, 0x2E, 0x31, 0xF8]);
            },
            "2B Kanji"($) {
                check('美', [0xF9, 0x0E, 0x63, 0x87]);
            },
            "3B rare Kanji"($) {
                check('𲎯', [0xF7, 0x2F, 0x47, 0x0C, 0x89]);
            },
            "1B Kana"($) {
                check('しい', [0xE0, 0x57, 0x44, 0xA0]);
            },
            "2B Emoji"($) {
                check('🏴', [0xFF, 0x74, 0x4B, 0x81]);
            },
            "2B Emoji with 1B modifiers"($) {
                check('🏴‍☠', [0xFF, 0x74, 0x4B, 0xC1, 0x0D, 0x8C, 0xA9, 0xB4]);
            },
            "2B Emoji with 3B Tag"($) {
                check('🏴\u{E007F}', [0xFF, 0x74, 0x4B, 0xF8, 0x7F, 0x00, 0xF3, 0x89]);
            },
            "Mixed scripts"($) {
                check('allô 美しい мир, 🏴‍☠\n', [
                    0x61, 0x6C, 0x6C, 0x6F, 0xEA, 0x20, // allô 
                    0xF9, 0x0E, 0x63, 0xE7, 0x57, 0x44, 0x20, // 美しい 
                    0xA8, 0x3C, 0xE2, 0x40, 0x2C, 0x20, // мир, 
                    0xF7, 0x74, 0x4B, 0xC1, 0x0D, 0x8C, 0xA9, 0x0A, // 🏴‍☠\n
                    0xB4,
                ]);
            },
            "Wrong ending"($) {
                const bin = new Uint8Array([0x88, 0x3C, 0xE2, 0x40]);
                const error = $mol_assert_fail(() => $mol_charset_ucf_decode(bin), 'Wrong ending');
                $mol_assert_equal(error.cause.mode, 166);
                $mol_assert_equal(error.cause.text, 'мир');
            },
            "Wrong byte"($) {
                const bin = new Uint8Array([0xFF, 0x74, 0x4B, 0x74, 0x9B, 0x81]);
                const error = $mol_assert_fail(() => $mol_charset_ucf_decode(bin), 'Wrong byte');
                $mol_assert_equal(error.cause.pos, 4);
                $mol_assert_equal(error.cause.text, '🏴');
            },
            "Wrong 2B sequence length"($) {
                const bin = new Uint8Array([0x78, 0xF9, 0x0E]);
                const error = $mol_assert_fail(() => $mol_charset_ucf_decode(bin), 'Expected 2 bytes');
                $mol_assert_equal(error.cause.pos, 2);
                $mol_assert_equal(error.cause.text, 'x');
            },
            "Wrong 3B sequence length"($) {
                const bin = new Uint8Array([0x78, 0xF7, 0x2F, 0x47]);
                const error = $mol_assert_fail(() => $mol_charset_ucf_decode(bin), 'Expected 3 bytes');
                $mol_assert_equal(error.cause.pos, 2);
                $mol_assert_equal(error.cause.text, 'x');
            },
        });
    })($$ = $_1.$$ || ($_1.$$ = {}));
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    var $$;
    (function ($$) {
        $mol_test({
            "1 byte int"($) {
                $mol_assert_equal($mol_bigint_decode(new Uint8Array), 0n);
                $mol_assert_equal($mol_bigint_decode(new Uint8Array(new Int8Array([1]).buffer)), 1n);
                $mol_assert_equal($mol_bigint_decode(new Uint8Array(new Int8Array([-1]).buffer)), -1n);
                $mol_assert_equal($mol_bigint_decode(new Uint8Array(new Int8Array([127]).buffer)), 127n);
                $mol_assert_equal($mol_bigint_decode(new Uint8Array(new Int8Array([-128]).buffer)), -128n);
            },
            "2 byte int"($) {
                $mol_assert_equal($mol_bigint_decode(new Uint8Array(new Int16Array([128]).buffer)), 128n);
                $mol_assert_equal($mol_bigint_decode(new Uint8Array(new Int16Array([-129]).buffer)), -129n);
                $mol_assert_equal($mol_bigint_decode(new Uint8Array(new Int16Array([128 * 256 - 1]).buffer)), 128n * 256n - 1n);
                $mol_assert_equal($mol_bigint_decode(new Uint8Array(new Int16Array([-128 * 256]).buffer)), -128n * 256n);
            },
            "3 byte int"($) {
                $mol_assert_equal($mol_bigint_decode(new Uint8Array(new Int32Array([128 * 256]).buffer).slice(0, 3)), 128n * 256n);
                $mol_assert_equal($mol_bigint_decode(new Uint8Array(new Int32Array([-128 * 256 - 1]).buffer).slice(0, 3)), -128n * 256n - 1n);
                $mol_assert_equal($mol_bigint_decode(new Uint8Array(new Int32Array([128 * 256 ** 2 - 1]).buffer).slice(0, 3)), 128n * 256n ** 2n - 1n);
                $mol_assert_equal($mol_bigint_decode(new Uint8Array(new Int32Array([-128 * 256 ** 2]).buffer).slice(0, 3)), -128n * 256n ** 2n);
            },
            "4 byte int"($) {
                $mol_assert_equal($mol_bigint_decode(new Uint8Array(new Int32Array([128 * 256 ** 2]).buffer)), 128n * 256n ** 2n);
                $mol_assert_equal($mol_bigint_decode(new Uint8Array(new Int32Array([-128 * 256 ** 2 - 1]).buffer)), -128n * 256n ** 2n - 1n);
                $mol_assert_equal($mol_bigint_decode(new Uint8Array(new Int32Array([128 * 256 ** 3 - 1]).buffer)), 128n * 256n ** 3n - 1n);
                $mol_assert_equal($mol_bigint_decode(new Uint8Array(new Int32Array([-128 * 256 ** 3]).buffer)), -128n * 256n ** 3n);
            },
            "8 byte int"($) {
                $mol_assert_equal($mol_bigint_decode(new Uint8Array(new BigInt64Array([128n * 256n ** 7n - 1n]).buffer)), 128n * 256n ** 7n - 1n);
                $mol_assert_equal($mol_bigint_decode(new Uint8Array(new BigInt64Array([-128n * 256n ** 7n]).buffer)), -128n * 256n ** 7n);
            },
        });
    })($$ = $_1.$$ || ($_1.$$ = {}));
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    var $$;
    (function ($$) {
        $mol_test({
            "Zero int"($) {
                $mol_assert_equal($mol_bigint_decode($mol_bigint_encode(0n)), 0n);
            },
            "Large positive int"($) {
                $mol_assert_equal($mol_bigint_decode($mol_bigint_encode(12345678901234567890n)), 12345678901234567890n);
            },
            "Large negative int"($) {
                $mol_assert_equal($mol_bigint_decode($mol_bigint_encode(-12345678901234567890n)), -12345678901234567890n);
            },
        });
    })($$ = $_1.$$ || ($_1.$$ = {}));
})($ || ($ = {}));

;
"use strict";
/** @jsx $mol_jsx */
var $;
(function ($_1) {
    var $$;
    (function ($$) {
        const { uint, link, spec, blob, text, list, tupl, sint } = $mol_vary_tip;
        const { none, both, fp16, fp32, fp64 } = $mol_vary_spec;
        const { L1, L2, L4, L8, LA } = $mol_vary_len;
        const str = $mol_charset_ucf_encode;
        function check(vary, ideal, Vary = $mol_vary) {
            const pack = Vary.pack(vary);
            $mol_assert_equal(Vary.take(pack), vary);
            $mol_assert_equal(pack, new Uint8Array(ideal));
        }
        $mol_test({
            "vary pack logical"($) {
                check([null], [spec | none]);
                check([true], [$mol_vary_spec.true]);
                check([false], [$mol_vary_spec.fake]);
                check([undefined], [spec | both]);
            },
            "vary pack uint0"($) {
                check([0], [0]);
                check([27], [27]);
            },
            "vary pack uint1"($) {
                check([28], [uint | L1, 28]);
                check([255], [uint | L1, 255]);
            },
            "vary pack uint2"($) {
                check([256], [uint | L2, 0, 1]);
                check([256 ** 2 - 1], [uint | L2, 255, 255]);
            },
            "vary pack uint4"($) {
                check([256 ** 2], [uint | L4, 0, 0, 1, 0]);
                check([256 ** 4 - 1], [uint | L4, 255, 255, 255, 255]);
            },
            "vary pack uint8"($) {
                check([256 ** 4], [uint | L8, 0, 0, 0, 0, 1, 0, 0, 0]);
                check([Number.MAX_SAFE_INTEGER], [uint | L8, 255, 255, 255, 255, 255, 255, 31, 0]);
                check([256n ** 8n - 1n], [uint | L8, 255, 255, 255, 255, 255, 255, 255, 255]);
            },
            "vary pack sint0"($) {
                check([-1], [-1]);
                check([-27], [-27]);
            },
            "vary pack sint1"($) {
                check([-28,], [sint | -L1, -28]);
                check([-256 / 2], [sint | -L1, 128]);
            },
            "vary pack sint2"($) {
                check([-256 / 2 - 1], [sint | -L2, 127, 255]);
                check([-(256 ** 2) / 2], [sint | -L2, 0, 128]);
            },
            "vary pack sint4"($) {
                check([-(256 ** 2) / 2 - 1], [sint | -L4, 255, 127, 255, 255]);
                check([-(256 ** 4) / 2], [sint | -L4, 0, 0, 0, 128]);
            },
            "vary pack sint8"($) {
                check([-(256 ** 4) / 2 - 1], [sint | -L8, 255, 255, 255, 127, 255, 255, 255, 255]);
                check([Number.MIN_SAFE_INTEGER], [sint | -L8, 1, 0, 0, 0, 0, 0, 224, 255]);
                check([-(2n ** 63n)], [sint | -L8, 0, 0, 0, 0, 0, 0, 0, 128]);
            },
            "vary pack bigint"($) {
                check([2n ** 64n], [sint | -LA, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1]);
                check([2n ** 2111n], [sint | -LA, 0, 1, ...Array.from({ length: 263 }, () => 0), 128, 0]);
                check([-1n - 2n ** 64n], [sint | -LA, 0, 0, 255, 255, 255, 255, 255, 255, 255, 255, 254]);
                check([-1n - 2n ** 2111n], [sint | -LA, 0, 1, ...Array.from({ length: 263 }, () => 255), -129, 255]);
            },
            "vary pack float"($) {
                check([1.5], [fp64, ...new Uint8Array(new Float64Array([1.5]).buffer)]);
            },
            "vary pack list"($) {
                check([[1, 2, 3]], [list | 3, 1, 2, 3]);
                check([[[], [1], [2, 3]]], [list | 3, list | 0, list | 1, 1, list | 2, 2, 3]);
            },
            "vary pack dedup list"($) {
                const pair = [1, 2];
                check([[pair, pair]], [list | 2, list | 2, 1, 2, link | 0]);
                const seven = [7];
                const box = [seven];
                check([[box, box, seven]], [list | 3, list | 1, list | 1, 7, link | 1, link | 0]);
            },
            "vary pack cyclic list"($) {
                const foo = [];
                foo.push([foo]);
                $mol_assert_fail(() => $mol_vary.pack([foo]), 'Cyclic refs');
            },
            "vary pack dedup uint"($) {
                check([[28, 28]], [list | 2, uint | L1, 28, link | 0]);
                check([[2n ** 64n, 2n ** 64n]], [list | 2, sint | -LA, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, link | 0]);
            },
            "vary pack dedup float"($) {
                check([[1.5, 1.5]], [list | 2, fp64, ...new Uint8Array(new Float64Array([1.5]).buffer), link | 0]);
            },
            "vary pack text"($) {
                check(['foo'], [text | 3, ...str('foo')]);
                check(['абв'], [text | 5, ...str('абв')]);
                const long_lat = 'abcdefghijklmnopqrst';
                check([long_lat], [text | L1, 20, ...str(long_lat)]);
                const long_cyr = 'абвгдеёжзийклмнопрст';
                check([long_cyr], [text | L1, 22, ...str(long_cyr)]);
            },
            "vary pack dedup text"($) {
                check([["f", "f"]], [list | 2, text | 1, ...str('f'), link | 0]);
            },
            "vary pack blob"($) {
                check([new Uint8Array([1, 255])], [blob | 2, uint | L1, 1, 255]);
                check([new Int8Array([-128, 127])], [blob | 2, sint | ~L1, -128, 127]);
                check([new Uint32Array([255])], [blob | 4, uint | L4, 255, 0, 0, 0]);
                check([new Int32Array([-128])], [blob | 4, sint | ~L4, -128, 255, 255, 255]);
                check([new BigUint64Array([255n])], [blob | 8, uint | L8, 255, 0, 0, 0, 0, 0, 0, 0]);
                check([new BigInt64Array([-128n])], [blob | 8, sint | ~L8, -128, 255, 255, 255, 255, 255, 255, 255]);
                check([new Float32Array([1.5])], [blob | 4, fp32, ...new Uint8Array(new Float32Array([1.5]).buffer)]);
                check([new Float64Array([1.5])], [blob | 8, fp64, ...new Uint8Array(new Float64Array([1.5]).buffer)]);
            },
            "vary pack dedup blob"($) {
                const part = new Uint8Array([1, 2]);
                check([[part, part]], [list | 2, blob | 2, uint | L1, 1, 2, link | 0]);
            },
            "vary pack struct"($) {
                check([{ x: 1, y: 2 }], [tupl | 2, list | 2, text | 1, ...str('x'), text | 1, ...str('y'), 1, 2]);
                check([{ x: {}, y: { a: 1 } }], [tupl | 2, list | 2, text | 1, ...str('x'), text | 1, ...str('y'), tupl | 0, list | 0, tupl | 1, list | 1, text | 1, ...str('a'), 1]);
            },
            "vary pack struct shape dedup"($) {
                check([[{}, { foo: 1 }, { foo: 2 }]], [list | 3, tupl | 0, list | 0, tupl | 1, list | 1, text | 3, ...str('foo'), 1, tupl | 1, link | 3, 2]);
                check([{ x: 1, y: { x: 2, y: 3 } }], [tupl | 2, list | 2, text | 1, ...str('x'), text | 1, ...str('y'), 1, tupl | 2, link | 2, 2, 3]);
            },
            "vary pack struct full dedup"($) {
                const item = { x: 1 };
                check([[item, item]], [list | 2, tupl | 1, list | 1, text | 1, ...str('x'), 1, link | 2]);
                const part = { x: 1, y: 2 };
                check([{ x: part, y: part }], [tupl | 2, list | 2, text | 1, ...str('x'), text | 1, ...str('y'), tupl | 2, link | 2, 1, 2, link | 3]);
            },
            "vary pack cyclic struct"($) {
                const foo = { bar: null };
                foo.bar = foo;
                $mol_assert_fail(() => $mol_vary.pack([foo]), 'Cyclic refs');
            },
            "vary pack Map"($) {
                check([new Map([['foo', 1], [2, 'bar']])], [tupl | 2, list | 2, text | 4, ...str('keys'), text | 4, ...str('vals'), list | 2, text | 3, ...str('foo'), 2, list | 2, 1, text | 3, ...str('bar')]);
            },
            "vary pack Set"($) {
                check([new Set([7, 'foo'])], [tupl | 1, list | 1, text | 3, ...str('set'), list | 2, 7, text | 3, ...str('foo')]);
            },
            "vary pack Date"($) {
                const date1 = new Date('2025-01-02T03:04:05');
                check([date1], [tupl | 1, list | 1, text | $mol_vary_len.L1, 9, ...str('unix_time'), uint | L4, ...new Uint8Array(new Uint32Array([date1.valueOf() / 1000]).buffer)]);
                const date2 = new Date('2025-01-02T03:04:05.678');
                check([date2], [tupl | 1, list | 1, text | $mol_vary_len.L1, 9, ...str('unix_time'), fp64, ...new Uint8Array(new Float64Array([date2.valueOf() / 1000]).buffer)]);
            },
            "vary pack DOM Element"($) {
                $mol_assert_equal($mol_dom_serialize($mol_jsx("div", null,
                    $mol_jsx("span", null),
                    $mol_jsx("br", null),
                    " ")), $mol_dom_serialize($mol_vary.take($mol_vary.pack([$mol_jsx("div", null,
                        $mol_jsx("span", null),
                        $mol_jsx("br", null),
                        " ")]))[0]));
            },
            "vary pack custom types in rooms"($) {
                class Foo {
                    a;
                    b;
                    constructor(a, b) {
                        this.a = a;
                        this.b = b;
                    }
                    ;
                    [Symbol.iterator]() {
                        return [this.a, this.b].values();
                    }
                }
                const Vary = $mol_vary.zone();
                Vary.type({
                    type: Foo,
                    keys: ['summ', 'diff'],
                    lean: foo => [foo.a + foo.b, foo.a - foo.b],
                    rich: ([summ, diff]) => new Foo((summ + diff) / 2, (summ - diff) / 2),
                });
                // restore
                check([new Foo(4, 2)], [tupl | 2, list | 2, text | 4, ...str('summ'), text | 4, ...str('diff'), 6, 2], Vary);
                // isolated
                $mol_assert_equal($mol_vary.take($mol_vary.pack([new Foo(4, 2)])), [{ a: 4, b: 2 }]);
                // inherited
                $mol_assert_equal(Vary.take(Vary.pack([new Map([[1, 2]])])), [new Map([[1, 2]])]);
            },
            "vary pack sequences"($) {
                check([], []);
                check([7], [7]);
                check([3, 4], [3, 4]);
                check([['foo', 'foo'], ['bar', 'bar']], [list | 2, text | 3, ...str('foo'), link | 0, list | 2, text | 3, ...str('bar'), link | 0]);
            },
        });
    })($$ = $_1.$$ || ($_1.$$ = {}));
})($ || ($ = {}));

;
"use strict";
/** @jsx $mol_jsx */
var $;
(function ($_1) {
    var $$;
    (function ($$) {
        function check(vary) {
            $mol_assert_equal(vary, $giper_baza_vary.take($giper_baza_vary.pack([vary]))[0]);
        }
        $mol_test({
            "Bin"($) {
                check(null);
                check(new Uint8Array([1, 2, 3]));
            },
            "Bool"($) {
                check(false);
                check(true);
            },
            "Int"($) {
                check(0);
                check(4611686018427387904n);
            },
            "Real"($) {
                check(0);
                check(Math.PI);
                check(Number.NaN);
                check(Number.POSITIVE_INFINITY);
                check(Number.NEGATIVE_INFINITY);
                check(Number.MAX_SAFE_INTEGER);
                check(Number.MIN_SAFE_INTEGER);
                check(BigInt(Number.MAX_VALUE));
                check(Number.MIN_VALUE);
            },
            "Link"($) {
                check(new $giper_baza_link(''));
                check($giper_baza_link.from_int(123456789));
            },
            "Str"($) {
                check('');
                check('123');
                check('🐱‍👤');
            },
            "Time"($) {
                check(new $mol_time_moment('1984-08-04T09:05:13.666+03:00'));
                check(new $mol_time_moment);
            },
            "Dura"($) {
                check(new $mol_time_duration('P1Y2M3DT4h5m6.6s'));
            },
            "Span"($) {
                check(new $mol_time_interval('T09:00/PT9h'));
            },
            "JSON"($) {
                check({ foo: ['bar'] });
                check([{ foo: 'bar' }]);
            },
            "DOM"($) {
                const xml = ($mol_jsx("div", null,
                    $mol_jsx("span", { class: "bar" }, "xxx")));
                $mol_assert_equal($mol_dom_serialize($giper_baza_vary.take($giper_baza_vary.pack([xml]))[0]), $mol_dom_serialize(xml));
            },
            "Tree"($) {
                const tree = $.$mol_tree2_from_string(`
				foo \\bar
					foo \\bar
			`);
                $mol_assert_equal($.$mol_tree2_to_string($giper_baza_vary.take($giper_baza_vary.pack([tree]))[0]), $.$mol_tree2_to_string(tree));
            },
        });
    })($$ = $_1.$$ || ($_1.$$ = {}));
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    $mol_test({
        'Watch one value'($) {
            class App extends $mol_object2 {
                static $ = $;
                static set = new $mol_wire_set();
                static lucky() {
                    return this.set.has(777);
                }
            }
            __decorate([
                $mol_wire_solo
            ], App, "lucky", null);
            $mol_assert_equal(App.lucky(), false);
            App.set.add(666);
            $mol_assert_equal(App.lucky(), false);
            App.set.add(777);
            $mol_assert_equal(App.lucky(), true);
            App.set.delete(777);
            $mol_assert_equal(App.lucky(), false);
        },
        'Watch item channel'($) {
            class App extends $mol_object2 {
                static $ = $;
                static set = new $mol_wire_set();
                static lucky() {
                    return this.set.item(777);
                }
            }
            __decorate([
                $mol_wire_solo
            ], App, "lucky", null);
            $mol_assert_equal(App.lucky(), false);
            App.set.item(666, true);
            $mol_assert_equal(App.lucky(), false);
            App.set.item(777, true);
            $mol_assert_equal(App.lucky(), true);
            App.set.item(777, false);
            $mol_assert_equal(App.lucky(), false);
        },
        'Watch size'($) {
            class App extends $mol_object2 {
                static $ = $;
                static set = new $mol_wire_set();
                static size() {
                    return this.set.size;
                }
            }
            __decorate([
                $mol_wire_solo
            ], App, "size", null);
            $mol_assert_equal(App.size(), 0);
            App.set.add(666);
            $mol_assert_equal(App.size(), 1);
            App.set.add(777);
            $mol_assert_equal(App.size(), 2);
            App.set.delete(777);
            $mol_assert_equal(App.size(), 1);
        },
        'Watch for-of'($) {
            class App extends $mol_object2 {
                static $ = $;
                static set = new $mol_wire_set();
                static sum() {
                    let res = 0;
                    for (const val of this.set) {
                        res += val;
                    }
                    return res;
                }
            }
            __decorate([
                $mol_wire_solo
            ], App, "sum", null);
            $mol_assert_equal(App.sum(), 0);
            App.set.add(111);
            $mol_assert_equal(App.sum(), 111);
            App.set.add(222);
            $mol_assert_equal(App.sum(), 333);
            App.set.delete(111);
            $mol_assert_equal(App.sum(), 222);
        },
        'Watch forEach'($) {
            class App extends $mol_object2 {
                static $ = $;
                static set = new $mol_wire_set();
                static sum() {
                    let res = 0;
                    this.set.forEach(val => res += val);
                    return res;
                }
            }
            __decorate([
                $mol_wire_solo
            ], App, "sum", null);
            $mol_assert_equal(App.sum(), 0);
            App.set.add(111);
            $mol_assert_equal(App.sum(), 111);
            App.set.add(222);
            $mol_assert_equal(App.sum(), 333);
            App.set.delete(111);
            $mol_assert_equal(App.sum(), 222);
        },
    });
})($ || ($ = {}));

;
"use strict";
/** @jsx $mol_jsx */
/** @jsxFrag $mol_jsx_frag */
var $;
(function ($) {
    $mol_test({
        'same list'() {
            const list = $mol_jsx("body", null,
                $mol_jsx("p", { "data-rev": "old" }, "a"),
                $mol_jsx("p", { "data-rev": "old" }, "b"),
                $mol_jsx("p", { "data-rev": "old" }, "c"));
            $mol_reconcile({
                prev: [...list.children],
                from: 0,
                to: 3,
                next: 'abc',
                equal: (next, prev) => prev.textContent === next,
                drop: (prev, lead) => list.removeChild(prev),
                insert: (next, lead) => list.insertBefore($mol_jsx("p", { "data-rev": "new" }, next), lead ? lead.nextSibling : list.firstChild),
                replace: (next, prev, lead) => {
                    prev.textContent = next;
                    prev.setAttribute('data-rev', 'up');
                    return prev;
                },
            });
            $mol_assert_equal(list.outerHTML, ($mol_jsx("body", null,
                $mol_jsx("p", { "data-rev": "old" }, "a"),
                $mol_jsx("p", { "data-rev": "old" }, "b"),
                $mol_jsx("p", { "data-rev": "old" }, "c"))).outerHTML);
        },
        'insert items'() {
            const list = $mol_jsx("body", null,
                $mol_jsx("p", { "data-rev": "old" }, "a"),
                $mol_jsx("p", { "data-rev": "old" }, "b"),
                $mol_jsx("p", { "data-rev": "old" }, "c"),
                $mol_jsx("p", { "data-rev": "old" }, "d"));
            $mol_reconcile({
                prev: [...list.children],
                from: 1,
                to: 3,
                next: 'bXYc',
                equal: (next, prev) => prev.textContent === next,
                drop: (prev, lead) => list.removeChild(prev),
                insert: (next, lead) => list.insertBefore($mol_jsx("p", { "data-rev": "new" }, next), lead ? lead.nextSibling : list.firstChild),
                replace: (next, prev, lead) => {
                    prev.textContent = next;
                    prev.setAttribute('data-rev', 'up');
                    return prev;
                },
            });
            $mol_assert_equal(list.outerHTML, ($mol_jsx("body", null,
                $mol_jsx("p", { "data-rev": "old" }, "a"),
                $mol_jsx("p", { "data-rev": "old" }, "b"),
                $mol_jsx("p", { "data-rev": "new" }, "X"),
                $mol_jsx("p", { "data-rev": "new" }, "Y"),
                $mol_jsx("p", { "data-rev": "old" }, "c"),
                $mol_jsx("p", { "data-rev": "old" }, "d"))).outerHTML);
        },
        'append items'() {
            const list = $mol_jsx("body", null,
                $mol_jsx("p", { "data-rev": "old" }, "a"));
            $mol_reconcile({
                prev: [...list.children],
                from: 2,
                to: 3,
                next: 'bc',
                equal: (next, prev) => prev.textContent === next,
                drop: (prev, lead) => list.removeChild(prev),
                insert: (next, lead) => list.insertBefore($mol_jsx("p", { "data-rev": "new" }, next), lead ? lead.nextSibling : list.firstChild),
                replace: (next, prev, lead) => {
                    prev.textContent = next;
                    prev.setAttribute('data-rev', 'up');
                    return prev;
                },
            });
            $mol_assert_equal(list.outerHTML, ($mol_jsx("body", null,
                $mol_jsx("p", { "data-rev": "old" }, "a"),
                $mol_jsx("p", { "data-rev": "new" }, "b"),
                $mol_jsx("p", { "data-rev": "new" }, "c"))).outerHTML);
        },
        'split item'() {
            const list = $mol_jsx("body", null,
                $mol_jsx("p", { "data-rev": "old" }, "a"),
                $mol_jsx("p", { "data-rev": "old" }, "bc"),
                $mol_jsx("p", { "data-rev": "old" }, "d"));
            $mol_reconcile({
                prev: [...list.children],
                from: 0,
                to: 3,
                next: 'abcd',
                equal: (next, prev) => prev.textContent === next,
                drop: (prev, lead) => list.removeChild(prev),
                insert: (next, lead) => list.insertBefore($mol_jsx("p", { "data-rev": "new" }, next), lead ? lead.nextSibling : list.firstChild),
                replace: (next, prev, lead) => {
                    prev.textContent = next;
                    prev.setAttribute('data-rev', 'up');
                    return prev;
                },
            });
            $mol_assert_equal(list.outerHTML, ($mol_jsx("body", null,
                $mol_jsx("p", { "data-rev": "old" }, "a"),
                $mol_jsx("p", { "data-rev": "new" }, "b"),
                $mol_jsx("p", { "data-rev": "up" }, "c"),
                $mol_jsx("p", { "data-rev": "old" }, "d"))).outerHTML);
        },
        'drop items'() {
            const list = $mol_jsx("body", null,
                $mol_jsx("p", { "data-rev": "old" }, "A"),
                $mol_jsx("p", { "data-rev": "old" }, "B"),
                $mol_jsx("p", { "data-rev": "old" }, "x"),
                $mol_jsx("p", { "data-rev": "old" }, "y"),
                $mol_jsx("p", { "data-rev": "old" }, "C"),
                $mol_jsx("p", { "data-rev": "old" }, "D"));
            $mol_reconcile({
                prev: [...list.children],
                from: 1,
                to: 5,
                next: 'BC',
                equal: (next, prev) => prev.textContent === next,
                drop: (prev, lead) => list.removeChild(prev),
                insert: (next, lead) => list.insertBefore($mol_jsx("p", { "data-rev": "new" }, next), lead ? lead.nextSibling : list.firstChild),
                replace: (next, prev, lead) => {
                    prev.textContent = next;
                    prev.setAttribute('data-rev', 'up');
                    return prev;
                },
            });
            $mol_assert_equal(list.outerHTML, ($mol_jsx("body", null,
                $mol_jsx("p", { "data-rev": "old" }, "A"),
                $mol_jsx("p", { "data-rev": "old" }, "B"),
                $mol_jsx("p", { "data-rev": "old" }, "C"),
                $mol_jsx("p", { "data-rev": "old" }, "D"))).outerHTML);
        },
        'update items'() {
            const list = $mol_jsx("body", null,
                $mol_jsx("p", { "data-rev": "old" }, "a"),
                $mol_jsx("p", { "data-rev": "old" }, "B"),
                $mol_jsx("p", { "data-rev": "old" }, "C"),
                $mol_jsx("p", { "data-rev": "old" }, "d"));
            $mol_reconcile({
                prev: [...list.children],
                from: 1,
                to: 3,
                next: 'XY',
                equal: (next, prev) => prev.textContent === next,
                drop: (prev, lead) => list.removeChild(prev),
                insert: (next, lead) => list.insertBefore($mol_jsx("p", { "data-rev": "new" }, next), lead ? lead.nextSibling : list.firstChild),
                replace: (next, prev, lead) => {
                    prev.textContent = next;
                    prev.setAttribute('data-rev', 'up');
                    return prev;
                },
            });
            $mol_assert_equal(list.outerHTML, ($mol_jsx("body", null,
                $mol_jsx("p", { "data-rev": "old" }, "a"),
                $mol_jsx("p", { "data-rev": "up" }, "X"),
                $mol_jsx("p", { "data-rev": "up" }, "Y"),
                $mol_jsx("p", { "data-rev": "old" }, "d"))).outerHTML);
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    var $$;
    (function ($$) {
        $mol_test({
            "Boolean schema"($) {
                $mol_assert_equal('$mol_schema_boolean', $mol_schema_boolean + '', $mol_key($mol_schema_boolean));
                $mol_assert_equal(true, $mol_schema_boolean.check(false));
                $mol_assert_equal(true, $mol_schema_boolean.check(true));
                $mol_assert_equal(false, $mol_schema_boolean.check('true'));
                $mol_assert_equal(false, $mol_schema_boolean.check(0));
                $mol_assert_equal(false, $mol_schema_boolean.cast(false));
                $mol_assert_equal(false, $mol_schema_boolean.cast('true'));
                $mol_assert_equal(false, $mol_schema_boolean.guard(false));
                $mol_assert_fail(() => $mol_schema_boolean.guard(null), 'Wrong type');
            },
        });
    })($$ = $_1.$$ || ($_1.$$ = {}));
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    var $$;
    (function ($$) {
        $mol_test({
            "Integer schema"($) {
                $mol_assert_equal('$mol_schema_integer', $mol_schema_integer + '', $mol_key($mol_schema_integer));
                $mol_assert_equal(true, $mol_schema_integer.check(Number.MAX_SAFE_INTEGER));
                $mol_assert_equal(true, $mol_schema_integer.check(Number.MIN_SAFE_INTEGER));
                $mol_assert_equal(true, $mol_schema_integer.check(0));
                $mol_assert_equal(false, $mol_schema_integer.check(Number.EPSILON));
                $mol_assert_equal(false, $mol_schema_integer.check(Number.POSITIVE_INFINITY));
                $mol_assert_equal(false, $mol_schema_integer.check(Number.NEGATIVE_INFINITY));
                $mol_assert_equal(Number.MAX_SAFE_INTEGER, $mol_schema_integer.cast(Number.MAX_SAFE_INTEGER));
                $mol_assert_equal(0, $mol_schema_integer.cast(Number.EPSILON));
                $mol_assert_equal(0, $mol_schema_integer.cast(1.5));
                $mol_assert_equal(0, $mol_schema_integer.guard(0));
                $mol_assert_fail(() => $mol_schema_integer.guard(''), 'Wrong type');
                $mol_assert_fail(() => $mol_schema_integer.guard(Number.NaN), 'Non finite');
                $mol_assert_fail(() => $mol_schema_integer.guard(1.5), 'Non integer');
            },
        });
    })($$ = $_1.$$ || ($_1.$$ = {}));
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    var $$;
    (function ($$) {
        $mol_test({
            "BigInt schema"($) {
                $mol_assert_equal('$mol_schema_bigint', $mol_schema_bigint + '', $mol_key($mol_schema_bigint));
                $mol_assert_equal(true, $mol_schema_bigint.check(0n));
                $mol_assert_equal(false, $mol_schema_bigint.check(0));
                $mol_assert_equal(1n, $mol_schema_bigint.cast(1n));
                $mol_assert_equal(1n, $mol_schema_bigint.cast(1));
                $mol_assert_equal(0n, $mol_schema_bigint.guard(0n));
                $mol_assert_fail(() => $mol_schema_bigint.guard(1), 'Wrong type');
            },
        });
    })($$ = $_1.$$ || ($_1.$$ = {}));
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    $.$mol_schema_pattern = $mol_memo_key.func(function $mol_schema_pattern(Pattern) {
        return class $mol_schema_pattern_ extends $mol_schema_string {
            static Pattern = Pattern;
            static toString() {
                if (this !== $mol_schema_pattern_)
                    return super.toString();
                return '$mol_schema_pattern<' + $mol_key(Pattern) + '>';
            }
            static guard(value) {
                if (Pattern.test(super.guard(value)))
                    return value;
                return $mol_fail(new TypeError('Wrong string', { cause: { value, schema: this } }));
            }
            static cast(value) {
                return super.cast(value);
            }
            static default = '';
        };
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    var $$;
    (function ($$) {
        $mol_test({
            "Cache of pattern schema"($) {
                $mol_assert_equal($mol_schema_pattern(/foo/), $mol_schema_pattern(/foo/));
                $mol_assert_unique($mol_schema_pattern(/foo/), $mol_schema_pattern(/bar/));
            },
            "String pattern schema"($) {
                const Email = $mol_schema_pattern(/^.*@.*$/);
                $mol_assert_equal('$mol_schema_pattern</^.*@.*$/>', Email + '', $mol_key(Email));
                $mol_assert_equal(true, Email.check('foo@bar'));
                $mol_assert_equal(false, Email.check('foo'));
                $mol_assert_equal(false, Email.check(123));
                $mol_assert_equal('foo@bar', Email.cast('foo@bar'));
                $mol_assert_equal('', Email.cast('foo'));
                $mol_assert_equal('', Email.cast(123));
                $mol_assert_equal('foo@bar', Email.guard('foo@bar'));
                $mol_assert_fail(() => Email.guard('foo'), 'Wrong string');
            },
        });
    })($$ = $_1.$$ || ($_1.$$ = {}));
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    $mol_test({
        "Cache of dict schema"($) {
            $mol_assert_equal($mol_schema_dict([$mol_schema_string, $mol_schema_float]), $mol_schema_dict([$mol_schema_string, $mol_schema_float]));
            $mol_assert_unique($mol_schema_dict([$mol_schema_string, $mol_schema_float]), $mol_schema_dict([$mol_schema_string, $mol_schema_string]));
        },
        "Dictionary schema"($) {
            const Flags = $mol_schema_dict([$mol_schema_pattern(/^[a-z]+$/), $mol_schema_boolean]);
            $mol_assert_equal(true, Flags.check({}));
            $mol_assert_equal(true, Flags.check({ foo: false }));
            $mol_assert_equal(false, Flags.check({ f00: false }));
            $mol_assert_equal(false, Flags.check([]));
            $mol_assert_equal(false, Flags.check({ foo: 0 }));
            $mol_assert_equal({ foo: false }, Flags.cast({ foo: false, f00: true }));
            $mol_assert_equal({ foo: false }, Flags.cast({ foo: 123 }));
            $mol_assert_equal({}, Flags.guard({}));
            $mol_assert_equal({ foo: false }, Flags.guard({ foo: false }));
            $mol_assert_fail(() => Flags.guard({ foo: 123 }), 'Wrong val');
            $mol_assert_fail(() => Flags.guard({ f00: 123 }), 'Wrong key');
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    var $$;
    (function ($$) {
        $mol_test({
            "Cache of list schema"($) {
                $mol_assert_equal($mol_schema_list($mol_schema_float), $mol_schema_list($mol_schema_float));
                $mol_assert_unique($mol_schema_list($mol_schema_float), $mol_schema_list($mol_schema_string));
            },
            "Array schema"($) {
                const Vector = $mol_schema_list($mol_schema_float);
                $mol_assert_equal('$mol_schema_list<$mol_schema_float>', Vector + '');
                $mol_assert_equal(true, Vector.check([]));
                $mol_assert_equal(true, Vector.check([123]));
                $mol_assert_equal(false, Vector.check(['foo']));
                $mol_assert_equal([123], Vector.cast([123]));
                $mol_assert_equal([123, Number.NaN], Vector.cast([123, 'foo']));
                $mol_assert_equal([], Vector.guard([]));
                $mol_assert_equal([123], Vector.guard([123]));
                $mol_assert_fail(() => Vector.guard(0), 'Non array');
                $mol_assert_fail(() => Vector.guard([false]), 'Wrong item');
            },
        });
    })($$ = $_1.$$ || ($_1.$$ = {}));
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    function clone(base) {
        const land = $mol_wire_sync(base.$.$giper_baza_land).make({ $: base.$ });
        land.units_steal(base);
        return land;
    }
    function sync(left, right) {
        left.units_steal(right);
        right.units_steal(left);
    }
    $mol_test({
        'Basic list ops'($) {
            const land = $.$giper_baza_land.make({ $ });
            const list = land.Pawn($giper_baza_list).Data();
            $mol_assert_equal(list.items_vary(), []);
            list.items_vary([2, 3]);
            $mol_assert_equal(list.items_vary(), [2, 3]);
            $mol_assert_equal(list.has(1), false);
            list.add(1);
            $mol_assert_equal(list.items_vary(), [1, 2, 3]);
            $mol_assert_equal(list.has(1), true);
            list.add(3);
            $mol_assert_equal(list.items_vary(), [1, 2, 3]);
            list.splice([2]);
            $mol_assert_equal(list.items_vary(), [1, 2, 3, 2]);
            list.splice([2], 0);
            $mol_assert_equal(list.items_vary(), [2, 1, 2, 3, 2]);
            list.wipe(2);
            $mol_assert_equal(list.items_vary(), [2, 1, 3, 2]);
            list.move(2, 1);
            $mol_assert_equal(list.items_vary(), [2, 3, 1, 2]);
            list.move(1, 3);
            $mol_assert_equal(list.items_vary(), [2, 1, 3, 2]);
            list.cut(2);
            $mol_assert_equal(list.items_vary(), [1, 3]);
            $mol_assert_equal(list.has(2), false);
            list.cut(2);
            $mol_assert_equal(list.items_vary(), [1, 3]);
        },
        'Different types'($) {
            const land = $.$giper_baza_land.make({ $ });
            const list = land.Pawn($.$giper_baza_list).Data();
            list.items_vary([
                null,
                false,
                true,
                0n,
                4611686018427387904n,
                0,
                Math.PI,
                Number.NaN,
                Number.NEGATIVE_INFINITY,
                '',
                '1234567890123456789012345678901234567890',
                new Uint8Array([]),
                new Uint8Array([1, 2, 3]),
                new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0]),
                list.link(),
            ]);
            $mol_assert_equal(list.items_vary(), [
                false,
                true,
                0,
                4611686018427387904n,
                0,
                Math.PI,
                Number.NaN,
                Number.NEGATIVE_INFINITY,
                '',
                '1234567890123456789012345678901234567890',
                new Uint8Array([]),
                new Uint8Array([1, 2, 3]),
                new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0]),
                list.link(),
            ]);
        },
        async 'List merge'($) {
            const land1 = $.$giper_baza_land.make({ $ });
            const land2 = $.$giper_baza_land.make({ $ });
            const list1 = land1.Pawn($giper_baza_list).Data();
            const list2 = land2.Pawn($giper_baza_list).Data();
            list1.items_vary(['foo', 'xxx']);
            land2.tick();
            list2.items_vary(['foo', 'yyy']);
            await $mol_wire_async(land1).units_steal(land2);
            $mol_assert_equal(list1.items_vary(), ['foo', 'yyy', 'foo', 'xxx']);
        },
        'Insert before removed before changed'($) {
            const land = $.$giper_baza_land.make({ $ });
            const list = land.Pawn($giper_baza_list).Data();
            list.items_vary(['foo', 'bar']);
            list.items_vary(['xxx', 'foo', 'bar']);
            list.items_vary(['xxx', 'bars']);
            $mol_assert_equal(list.items_vary(), ['xxx', 'bars']);
        },
        'Many moves'($) {
            const land = $.$giper_baza_land.make({ $ });
            const list = land.Pawn($giper_baza_list).Data();
            list.items_vary(['foo', 'bar', 'lol']);
            list.move(2, 1);
            list.move(2, 1);
            list.move(0, 3);
            list.move(2, 1);
            $mol_assert_equal(list.items_vary(), ['bar', 'foo', 'lol']);
        },
        'Reorder separated sublists'($) {
            const land = $.$giper_baza_land.make({ $ });
            const list = land.Pawn($giper_baza_list).Data();
            list.items_vary([1, 2, 3, 4, 5, 6]);
            list.move(3, 5);
            list.move(3, 5);
            list.move(5, 4);
            list.move(0, 2);
            list.move(0, 2);
            list.move(2, 1);
            $mol_assert_equal(list.items_vary(), [1, 3, 2, 4, 6, 5]);
        },
        'Insert after moved right': $mol_wire_async(($) => {
            const base = $mol_wire_sync($.$giper_baza_land).make({ $ });
            base.Data($giper_baza_list).items_vary([1, 2, 3, 4]);
            const left = clone(base);
            left.Data($giper_baza_list).items_vary([1, 7, 2, 3, 4]);
            const right = clone(base);
            right.Data($giper_baza_list).move(0, 2);
            sync(left, right);
            $mol_assert_equal(left.Data($giper_baza_list).items_vary(), right.Data($giper_baza_list).items_vary(), [2, 1, 7, 3, 4]);
        }),
        'Insert before moved left': $mol_wire_async(($) => {
            const base = $mol_wire_sync($.$giper_baza_land).make({ $ });
            base.Data($giper_baza_list).items_vary([1, 2, 3, 4]);
            const left = clone(base);
            left.Data($giper_baza_list).move(1, 0);
            const right = clone(base);
            right.faces.sync(left.faces);
            right.Data($giper_baza_list).items_vary([1, 7, 2, 3, 4]);
            sync(left, right);
            $mol_assert_equal(left.Data($giper_baza_list).items_vary(), right.Data($giper_baza_list).items_vary(), [2, 1, 7, 3, 4]);
        }),
        'Move left after inserted': $mol_wire_async(($) => {
            const base = $mol_wire_sync($.$giper_baza_land).make({ $ });
            base.Data($giper_baza_list).items_vary([1, 2, 3, 4]);
            const left = clone(base);
            left.Data($giper_baza_list).items_vary([1, 7, 2, 3, 4]);
            const right = clone(base);
            right.faces.sync(left.faces);
            right.Data($giper_baza_list).move(1, 0);
            sync(left, right);
            $mol_assert_equal(left.Data($giper_baza_list).items_vary(), right.Data($giper_baza_list).items_vary(), [2, 1, 3, 7, 4]);
        }),
        'Insert before moved right': $mol_wire_async(($) => {
            const base = $mol_wire_sync($.$giper_baza_land).make({ $ });
            base.Data($giper_baza_list).items_vary([1, 2, 3, 4]);
            const left = clone(base);
            left.Data($giper_baza_list).move(1, 4);
            const right = clone(base);
            right.faces.sync(left.faces);
            right.Data($giper_baza_list).items_vary([1, 7, 2, 3, 4]);
            sync(left, right);
            $mol_assert_equal(left.Data($giper_baza_list).items_vary(), right.Data($giper_baza_list).items_vary(), [1, 7, 3, 4, 2]);
        }),
        'Move right after inserted': $mol_wire_async(($) => {
            const base = $mol_wire_sync($.$giper_baza_land).make({ $ });
            base.Data($giper_baza_list).items_vary([1, 2, 3, 4]);
            const left = clone(base);
            left.Data($giper_baza_list).items_vary([1, 7, 2, 3, 4]);
            const right = clone(base);
            right.faces.sync(left.faces);
            right.Data($giper_baza_list).move(1, 4);
            sync(left, right);
            $mol_assert_equal(left.Data($giper_baza_list).items_vary(), right.Data($giper_baza_list).items_vary(), [1, 3, 7, 4, 2]);
        }),
        'Insert after wiped': $mol_wire_async(($) => {
            const base = $mol_wire_sync($.$giper_baza_land).make({ $ });
            base.Data($giper_baza_list).items_vary([1, 2, 3, 4]);
            const left = clone(base);
            left.Data($giper_baza_list).items_vary([1, 3, 4]);
            const right = clone(base);
            right.faces.sync(left.faces);
            right.Data($giper_baza_list).items_vary([1, 2, 7, 3, 4]);
            sync(left, right);
            $mol_assert_equal(left.Data($giper_baza_list).items_vary(), right.Data($giper_baza_list).items_vary(), [1, 7, 3, 4]);
        }),
        'Wiped before inserted': $mol_wire_async(($) => {
            const base = $mol_wire_sync($.$giper_baza_land).make({ $ });
            base.Data($giper_baza_list).items_vary([1, 2, 3, 4]);
            const left = clone(base);
            left.Data($giper_baza_list).items_vary([1, 2, 7, 3, 4]);
            const right = clone(base);
            right.faces.sync(left.faces);
            right.Data($giper_baza_list).items_vary([1, 3, 4]);
            sync(left, right);
            $mol_assert_equal(left.Data($giper_baza_list).items_vary(), right.Data($giper_baza_list).items_vary(), [1, 7, 3, 4]);
        }),
        'Insert before wiped': $mol_wire_async(($) => {
            const base = $mol_wire_sync($.$giper_baza_land).make({ $ });
            base.Data($giper_baza_list).items_vary([1, 2, 3, 4]);
            const left = clone(base);
            left.Data($giper_baza_list).wipe(2);
            const right = clone(base);
            right.faces.sync(left.faces);
            right.Data($giper_baza_list).items_vary([1, 2, 7, 3, 4]);
            sync(left, right);
            $mol_assert_equal(left.Data($giper_baza_list).items_vary(), right.Data($giper_baza_list).items_vary(), [1, 2, 7, 4]);
        }),
        'Wiped after inserted': $mol_wire_async(($) => {
            const base = $mol_wire_sync($.$giper_baza_land).make({ $ });
            base.Data($giper_baza_list).items_vary([1, 2, 3, 4]);
            const left = clone(base);
            left.Data($giper_baza_list).items_vary([1, 2, 7, 3, 4]);
            const right = clone(base);
            right.faces.sync(left.faces);
            right.Data($giper_baza_list).wipe(2);
            sync(left, right);
            $mol_assert_equal(left.Data($giper_baza_list).items_vary(), right.Data($giper_baza_list).items_vary(), [1, 2, 7, 4]);
        }),
        'Insert after moved out': $mol_wire_async(($) => {
            const base = $mol_wire_sync($.$giper_baza_land).make({ $ });
            base.Data($giper_baza_list).items_vary([1, 2, 3, 4]);
            const left = clone(base);
            left.sand_move(left.Data($giper_baza_list).units()[1], new $giper_baza_link('11111111'), 0);
            const right = clone(base);
            right.faces.sync(left.faces);
            right.Data($giper_baza_list).items_vary([1, 2, 7, 3, 4]);
            sync(left, right);
            $mol_assert_equal(left.Data($giper_baza_list).items_vary(), right.Data($giper_baza_list).items_vary(), [1, 7, 3, 4]);
            $mol_assert_equal(left.Pawn($giper_baza_list).Head(new $giper_baza_link('11111111')).items_vary(), right.Pawn($giper_baza_list).Head(new $giper_baza_link('11111111')).items_vary(), [2]);
        }),
        'Move out before inserted': $mol_wire_async(($) => {
            const base = $mol_wire_sync($.$giper_baza_land).make({ $ });
            base.Data($giper_baza_list).items_vary([1, 2, 3, 4]);
            const left = clone(base);
            left.Data($giper_baza_list).items_vary([1, 2, 7, 3, 4]);
            const right = clone(base);
            right.faces.sync(left.faces);
            right.sand_move(right.Data($giper_baza_list).units()[1], new $giper_baza_link('11111111'), 0);
            sync(left, right);
            $mol_assert_equal(left.Data($giper_baza_list).items_vary(), right.Data($giper_baza_list).items_vary(), [1, 7, 3, 4]);
            $mol_assert_equal(left.Pawn($giper_baza_list).Head(new $giper_baza_link('11111111')).items_vary(), right.Pawn($giper_baza_list).Head(new $giper_baza_link('11111111')).items_vary(), [2]);
        }),
        'Insert before changed': $mol_wire_async(($) => {
            const base = $mol_wire_sync($.$giper_baza_land).make({ $ });
            base.Data($giper_baza_list).items_vary([1, 2, 3, 4]);
            const left = clone(base);
            left.Data($giper_baza_list).items_vary([1, 2, 7, 4]);
            const right = clone(base);
            right.faces.sync(left.faces);
            right.Data($giper_baza_list).items_vary([1, 2, 13, 3, 4]);
            sync(left, right);
            $mol_assert_equal(left.Data($giper_baza_list).items_vary(), right.Data($giper_baza_list).items_vary(), [1, 2, 13, 7, 4]);
        }),
        'Change after inserted': $mol_wire_async(($) => {
            const base = $mol_wire_sync($.$giper_baza_land).make({ $ });
            base.Data($giper_baza_list).items_vary([1, 2, 3, 4]);
            const left = clone(base);
            left.Data($giper_baza_list).items_vary([1, 2, 13, 3, 4]);
            const right = clone(base);
            right.faces.sync(left.faces);
            right.Data($giper_baza_list).items_vary([1, 2, 7, 4]);
            sync(left, right);
            $mol_assert_equal(left.Data($giper_baza_list).items_vary(), right.Data($giper_baza_list).items_vary(), [1, 2, 7, 13, 4]);
        }),
        'Insert between moved': $mol_wire_async(($) => {
            const base = $mol_wire_sync($.$giper_baza_land).make({ $ });
            base.Data($giper_baza_list).items_vary([1, 2, 3, 4, 5, 6]);
            const left = clone(base);
            left.Data($giper_baza_list).move(1, 5);
            left.Data($giper_baza_list).move(1, 5);
            const right = clone(base);
            right.faces.sync(left.faces);
            right.Data($giper_baza_list).items_vary([1, 2, 7, 3, 4, 5, 6]);
            sync(left, right);
            $mol_assert_equal(left.Data($giper_baza_list).items_vary(), right.Data($giper_baza_list).items_vary(), [1, 4, 5, 2, 7, 3, 6]);
        }),
        'Move near inserted': $mol_wire_async(($) => {
            const base = $mol_wire_sync($.$giper_baza_land).make({ $ });
            base.Data($giper_baza_list).items_vary([1, 2, 3, 4, 5, 6]);
            const left = clone(base);
            left.Data($giper_baza_list).items_vary([1, 2, 7, 3, 4, 5, 6]);
            const right = clone(base);
            right.faces.sync(left.faces);
            right.Data($giper_baza_list).move(1, 5);
            right.Data($giper_baza_list).move(1, 5);
            sync(left, right);
            $mol_assert_equal(left.Data($giper_baza_list).items_vary(), right.Data($giper_baza_list).items_vary(), [1, 4, 5, 2, 3, 7, 6]);
        }),
        async '3 transactions in same second must keep ordering'($) {
            const auth_left = $.$giper_baza_auth.grab();
            const auth_right = $.$giper_baza_auth.grab();
            const land_left = $.$giper_baza_land.make({ $, auth: () => auth_left });
            land_left.give(auth_right.pass(), $giper_baza_rank_post('just'));
            const land_right = $.$giper_baza_land.make({ $, auth: () => auth_right, link: () => land_left.link() });
            const list_left = land_left.Data($giper_baza_list);
            const list_right = land_right.Data($giper_baza_list);
            list_left.items_vary(['a', 'b', 'c', 'd']);
            $mol_assert_equal(list_left.items_vary(), ['a', 'b', 'c', 'd']);
            await $mol_wire_async(land_right).units_steal(land_left);
            $mol_assert_equal(list_right.items_vary(), ['a', 'b', 'c', 'd']);
            list_right.splice(['x'], 0, 0);
            $mol_assert_equal(list_right.items_vary(), ['x', 'a', 'b', 'c', 'd']);
            await $mol_wire_async(land_left).units_steal(land_right);
            $mol_assert_equal(list_left.items_vary(), ['x', 'a', 'b', 'c', 'd']);
            list_left.items_vary(['d', 'x', 'a', 'b', 'c']);
            $mol_assert_equal(list_left.items_vary(), ['d', 'x', 'a', 'b', 'c']);
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    var $$;
    (function ($$) {
        $mol_test({
            async 'Dictionary invariants'($) {
                const land = $giper_baza_land.make({ $ });
                const dict = land.Pawn($giper_baza_dict).Data();
                $mol_assert_equal(dict.keys(), []);
                dict.dive(123, $giper_baza_atom, null);
                dict.dive('xxx', $giper_baza_atom, null);
                $mol_assert_equal(dict.keys(), ['xxx', 123]);
                $mol_assert_equal(dict.has(123), true);
                $mol_assert_equal(dict.has('xxx'), true);
                $mol_assert_equal(dict.has('yyy'), false);
                $mol_assert_equal(dict.dive(123, $giper_baza_atom).vary(), null);
                $mol_assert_equal(dict.dive('xxx', $giper_baza_atom).vary(), null);
                dict.dive(123, $giper_baza_atom).vary(777);
                $mol_assert_equal(dict.dive(123, $giper_baza_atom).vary(), 777);
                dict.dive('xxx', $giper_baza_list).items_vary(['foo', 'bar']);
                $mol_assert_equal(dict.dive('xxx', $giper_baza_list).items_vary(), ['foo', 'bar']);
                dict.has(123, false);
                $mol_assert_equal(dict.keys(), ['xxx']);
            },
            async 'Dictionary merge'($) {
                const land1 = $giper_baza_land.make({ $ });
                const land2 = $giper_baza_land.make({ $ });
                const dict1 = land1.Pawn($giper_baza_dict).Data();
                const dict2 = land2.Pawn($giper_baza_dict).Data();
                dict1.dive(123, $giper_baza_atom, null).vary(666);
                land2.tick();
                dict2.dive(123, $giper_baza_atom, null).vary(777);
                await $mol_wire_async(land1).units_steal(land2);
                $mol_assert_equal(dict1.dive(123, $giper_baza_atom).vary(), 777);
                dict1.dive('xxx', $giper_baza_list, null).items_vary(['foo']);
                land2.tick();
                dict2.dive('xxx', $giper_baza_list, null).items_vary(['bar']);
                await $mol_wire_async(land1).units_steal(land2);
                $mol_assert_equal(dict1.dive('xxx', $giper_baza_list).items_vary(), ['bar', 'foo']);
            },
            async "Narrowed Dictionary with linked Dictionaries and others"($) {
                class User extends $giper_baza_dict.with({
                    Title: $giper_baza_atom_text,
                    Account: $giper_baza_atom_link.to(() => Account),
                    Articles: $giper_baza_list_link.to(() => Article),
                }) {
                }
                class Account extends $giper_baza_dict.with({
                    Title: $giper_baza_atom_text,
                    User: $giper_baza_atom_link.to(() => User),
                }) {
                }
                class Article extends $giper_baza_dict.with({
                    Title: $giper_baza_dict_to($giper_baza_atom_text),
                    Author: $giper_baza_atom_link.to(() => User),
                }) {
                }
                const land = $.$giper_baza_glob.home().land();
                const user = land.Pawn(User).Head(new $giper_baza_link('11111111'));
                $mol_assert_equal(user.Title()?.val() ?? null, null);
                $mol_assert_equal(user.Account()?.remote() ?? null, null);
                $mol_assert_equal(user.Articles()?.remote_list() ?? [], []);
                user.Title(null).val('Jin');
                $mol_assert_equal(user.Title().val() ?? '', 'Jin');
                const account = (await $mol_wire_async(user.Account(null)).ensure([[null, $giper_baza_rank_read]]));
                $mol_assert_equal(user.Account()?.remote() ?? null, account);
                $mol_assert_equal(account.User()?.remote() ?? null, null);
                account.User(null).remote(user);
                $mol_assert_equal(account.User()?.remote(), user);
                const articles = [
                    await $mol_wire_async(user.Articles(null)).make([[null, $giper_baza_rank_read]]),
                    await $mol_wire_async(user.Articles(null)).make([[null, $giper_baza_rank_read]]),
                ];
                $mol_assert_equal(user.Articles()?.remote_list().map(n => n[Symbol.toStringTag]), articles.map(n => n[Symbol.toStringTag]));
                articles[0].Title(null).key('en', 'auto').val('Hello!');
                $mol_assert_equal(articles[0].Title()?.key('en').val(), 'Hello!');
                $mol_assert_equal(articles[1].Title()?.key('ru')?.val() ?? null, null);
                $mol_assert_equal(articles[1].Title()?.key('ru')?.val() ?? null, null);
                $mol_assert_unique(user.land(), account.land(), ...articles.map(article => article.land()));
            },
        });
    })($$ = $_1.$$ || ($_1.$$ = {}));
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    $.$mol_schema_enum = $mol_memo_key.func(function $mol_schema_enum(Options) {
        return class $mol_schema_enum_ extends $mol_schema_any {
            static Options = Options;
            static toString() {
                if (this !== $mol_schema_enum_)
                    return super.toString();
                return '$mol_schema_enum<' + $mol_key(Options) + '>';
            }
            static guard(value) {
                if (Options.some(Option => Object.is(Option, value)))
                    return value;
                return $mol_fail(new TypeError('Wrong option', { cause: { value, schema: this } }));
            }
            static cast(value) {
                if (this.check(value))
                    return value;
                return Options[0];
            }
            static default = Options[0];
        };
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    var $$;
    (function ($$) {
        $mol_test({
            "Cache of enum schema"($) {
                $mol_assert_equal($mol_schema_enum(['foo']), $mol_schema_enum(['foo']));
                $mol_assert_unique($mol_schema_enum(['foo']), $mol_schema_enum(['bar']));
            },
            "Enum options"($) {
                const Config = $mol_schema_enum([123, 'foo']);
                $mol_assert_equal('$mol_schema_enum<[123,"foo"]>', Config + '', $mol_key(Config));
                $mol_assert_equal(true, Config.check(123));
                $mol_assert_equal(true, Config.check('foo'));
                $mol_assert_equal(false, Config.check(true));
                $mol_assert_equal(false, Config.check(321));
                $mol_assert_equal(false, Config.check('bar'));
                $mol_assert_equal(Config.cast(123), 123);
                $mol_assert_equal(Config.cast('foo'), 'foo');
                $mol_assert_equal(Config.cast('bar'), 123);
                $mol_assert_equal(123, Config.guard(123));
                $mol_assert_fail(() => Config.guard(321), 'Wrong option');
            },
        });
    })($$ = $_1.$$ || ($_1.$$ = {}));
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    var $$;
    (function ($$) {
        $mol_test({
            "Empty representation"($) {
                const land = $giper_baza_land.make({ $ });
                const reg = land.Pawn($giper_baza_atom_time).Data();
                $mol_assert_equal(reg.val(), null);
                reg.vary(null);
                $mol_assert_equal(reg.val(), null);
            },
            "Validation on set, cast on get"($) {
                const land = $.$giper_baza_glob.home().land();
                const head = new $giper_baza_link('22222222');
                const str = land.Pawn($giper_baza_atom.of($mol_schema_maybe($mol_schema_string))).Head(head);
                const mail = land.Pawn($giper_baza_atom.of($mol_schema_pattern(/.+@.+/))).Head(head);
                $mol_assert_equal(str.val(), null);
                $mol_assert_equal(mail.val(), null);
                $mol_assert_fail(() => str.val(123), 'Wrong type');
                $mol_assert_fail(() => mail.val('foo'), 'Wrong string');
                $mol_assert_equal(str.val(), null);
                $mol_assert_equal(mail.val(), null);
                str.val('foo');
                $mol_assert_equal(str.val(), 'foo');
                $mol_assert_equal(mail.val(), null);
                mail.val('foo@bar');
                $mol_assert_equal(str.val(), 'foo@bar');
                $mol_assert_equal(mail.val(), 'foo@bar');
            },
            "Hyper link to another land"($) {
                const land = $.$giper_baza_glob.home().land();
                const reg = land.Pawn($giper_baza_atom_link.to(() => $giper_baza_atom)).Head(new $giper_baza_link('11111111'));
                const remote = reg.ensure(land);
                $mol_assert_unique(reg.land(), remote.land());
                $mol_assert_equal(reg.vary(), remote.link());
                $mol_assert_equal(reg.remote(), remote);
            },
            "Register with linked Pawns"($) {
                const land = $.$giper_baza_glob.home().land();
                const str = land.Pawn($giper_baza_atom_text).Head(new $giper_baza_link('11111111'));
                const link = land.Pawn($giper_baza_atom_link.to(() => $giper_baza_atom_text)).Head(new $giper_baza_link('11111111'));
                $mol_assert_equal(link.remote(), null);
                link.remote(str);
                $mol_assert_equal(link.vary(), link.remote().link(), str.link());
            },
            "Enumerated reg type"($) {
                class FileType extends $giper_baza_atom.of($mol_schema_maybe($mol_schema_enum(['file', 'dir', 'link']))) {
                }
                const land = $.$giper_baza_glob.home().land();
                const type = land.Data(FileType);
                $mol_assert_equal(type.val(), null);
                type.val('file');
                $mol_assert_equal(type.val(), 'file');
                $mol_assert_fail(() => type.val('drive'), 'Wrong option');
                $mol_assert_equal(type.val(), 'file');
                type.vary('drive');
                $mol_assert_equal(type.val(), null);
            },
        });
    })($$ = $_1.$$ || ($_1.$$ = {}));
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    var $$;
    (function ($$) {
        $mol_test({
            "Empty release"($) {
                const pool = new $mol_memory_pool;
                $mol_assert_equal(pool.empty(), true);
                pool.release(0, 0);
                $mol_assert_equal(pool.acquire(8), 0);
                $mol_assert_equal(pool.empty(), false);
                pool.release(0, 8);
                $mol_assert_equal(pool.empty(), true);
            },
            "linear allocation"($) {
                const pool = new $mol_memory_pool;
                $mol_assert_equal(pool.acquire(8), 0);
                $mol_assert_equal(pool.acquire(16), 8);
                $mol_assert_equal(pool.acquire(32), 24);
            },
            "allocation in released"($) {
                const pool = new $mol_memory_pool;
                $mol_assert_equal(pool.acquire(8), 0);
                $mol_assert_equal(pool.acquire(16), 8);
                pool.release(0, 16);
                $mol_assert_equal(pool.acquire(8), 0);
                $mol_assert_equal(pool.acquire(16), 24);
                $mol_assert_equal(pool.acquire(8), 8);
            },
            "space limitation"($) {
                const pool = new $mol_memory_pool(10);
                pool.acquire(8);
                pool.release(2, 4);
                $mol_assert_fail(() => pool.acquire(6), 'No free space\nneed: 6\nhave: 4');
            },
            "double release"($) {
                const pool = new $mol_memory_pool;
                $mol_assert_fail(() => pool.release(0, 2), 'Double release');
                $mol_assert_fail(() => pool.release(2, 2), 'Release out of allocated');
                pool.acquire(16);
                pool.release(4, 8);
                $mol_assert_fail(() => pool.release(4, 8), 'Double release');
                $mol_assert_fail(() => pool.release(10, 4), 'Double release');
                $mol_assert_fail(() => pool.release(2, 4), 'Double release');
            },
        });
    })($$ = $_1.$$ || ($_1.$$ = {}));
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    var $$;
    (function ($$) {
        $mol_test({
            "faces serial and parse"($) {
                const land1 = new $giper_baza_link('12345678_12345678');
                const land2 = new $giper_baza_link('87654321_87654321');
                const land3 = new $giper_baza_link('87654321_00000000');
                const peer1 = new $giper_baza_link('12345678');
                const peer2 = new $giper_baza_link('87654321');
                const faces1 = new $giper_baza_face_map;
                faces1.peer_time(peer1.str, $giper_baza_time_now(), 0);
                faces1.peer_summ(peer1.str, 0);
                faces1.peer_time(peer2.str, $giper_baza_time_now(), 0);
                faces1.peer_summ(peer2.str, 64_000);
                const faces2 = new $giper_baza_face_map;
                faces2.peer_time(peer1.str, $giper_baza_time_now(), 0);
                faces2.peer_summ(peer1.str, 1);
                faces2.peer_time(peer2.str, $giper_baza_time_now(), 1);
                const faces3 = new $giper_baza_face_map;
                const parts = [
                    [land1.str, new $giper_baza_pack_part([], faces1)],
                    [land2.str, new $giper_baza_pack_part([], faces2)],
                    [land3.str, new $giper_baza_pack_part([], faces3)],
                ];
                const pack = $giper_baza_pack.make(parts);
                $mol_assert_equal(parts, pack.parts());
            },
            "units serial and parse"($) {
                const land = new $giper_baza_link('12345678_12345678');
                const pass = $.$giper_baza_auth.grab().pass();
                const gift = $giper_baza_unit_gift.make();
                const sand_small = $giper_baza_unit_sand.make(5);
                const ball = new Uint8Array($giper_baza_unit_sand.size_equator + 5);
                const sand_big = $giper_baza_unit_sand.make(ball.byteLength);
                sand_big.ball(ball);
                const seal = $giper_baza_unit_seal.make(15, true);
                const parts = [
                    [land.str, new $giper_baza_pack_part([pass, gift, sand_small, sand_big, seal])],
                ];
                const pack = $giper_baza_pack.make(parts);
                $mol_assert_equal(parts, pack.parts());
            },
        });
    })($$ = $_1.$$ || ($_1.$$ = {}));
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    $mol_test_mocks.push($ => {
        class $giper_baza_glob_mock extends $.$giper_baza_glob {
            static $ = $;
            static lands_touched = new $mol_wire_set();
        }
        $.$giper_baza_glob = $giper_baza_glob_mock;
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    $mol_test({
        async 'put, get, drop, count records and clear store'() {
            const db = await $$.$mol_db('$mol_db_test', mig => mig.store_make('letters'));
            const trans = db.change('letters');
            try {
                const { letters } = trans.stores;
                $mol_assert_like(await letters.get(1), undefined);
                $mol_assert_like(await letters.get(2), undefined);
                $mol_assert_like(await letters.count(), 0);
                await letters.put('a');
                await letters.put('b', 1);
                await letters.put('c', 2);
                $mol_assert_like(await letters.get(1), 'b');
                $mol_assert_like(await letters.get(2), 'c');
                $mol_assert_like(await letters.count(), 2);
                await letters.drop(1);
                $mol_assert_like(await letters.get(1), undefined);
                $mol_assert_like(await letters.count(), 1);
                await letters.clear();
                $mol_assert_like(await letters.count(), 0);
            }
            finally {
                trans.abort();
                db.kill();
            }
        },
        async 'select by query'() {
            const db = await $$.$mol_db('$mol_db_test', mig => mig.store_make('letters'));
            const trans = db.change('letters');
            try {
                const { letters } = trans.stores;
                await letters.put('a');
                await letters.put('b');
                await letters.put('c');
                await letters.put('d');
                $mol_assert_like(await letters.select(), ['a', 'b', 'c', 'd']);
                $mol_assert_like(await letters.select(null, 2), ['a', 'b']);
                $mol_assert_like(await letters.select($mol_dom_context.IDBKeyRange.bound(2, 3)), ['b', 'c']);
            }
            finally {
                trans.abort();
                db.kill();
            }
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    $mol_test({
        async 'take and drop db'() {
            const db = await $$.$mol_db('$mol_db_test');
            await db.kill();
        },
        async 'make and drop store in separate migrations'() {
            try {
                const db1 = await $$.$mol_db('$mol_db_test', mig => mig.store_make('temp'));
                db1.destructor();
                $mol_assert_like(db1.stores, ['temp']);
                $mol_assert_like(db1.version, 2);
                const db2 = await $$.$mol_db('$mol_db_test', mig => mig.store_make('temp'), mig => mig.store_drop('temp'));
                db2.destructor();
                $mol_assert_like(db2.stores, []);
                $mol_assert_like(db2.version, 3);
            }
            finally {
                const db0 = await $$.$mol_db('$mol_db_test');
                await db0.kill();
            }
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    $mol_test({
        async 'unique index'() {
            const db = await $$.$mol_db('$mol_db_test', mig => mig.store_make('users'), mig => mig.stores.users.index_make('names', ['name'], true));
            const trans = db.change('users');
            try {
                const { users } = trans.stores;
                await users.put({ name: 'Jin' }, 'jin');
                await users.put({ name: 'John' }, 'john');
                await users.put({ name: 'Bin' }, 'bin');
                const { names } = users.indexes;
                $mol_assert_like(await names.get(['Jin']), { name: 'Jin' });
                $mol_assert_like(await names.get(['John']), { name: 'John' });
                $mol_assert_like(await names.count(), 3);
                $mol_assert_like(await names.select($mol_dom_context.IDBKeyRange.bound(['J'], ['J\uFFFF'])), [{ name: 'Jin' }, { name: 'John' }]);
                try {
                    await users.put({ name: 'Jin' }, 'jin2');
                    $mol_fail(new Error('Exception expected'));
                }
                catch (error) {
                    $mol_assert_unique(error.message, 'Exception expected');
                }
            }
            finally {
                trans.abort();
                await db.kill();
            }
        },
        async 'multi path index'() {
            const db = await $$.$mol_db('$mol_db_test', mig => mig.store_make('users'), mig => mig.stores.users.index_make('names', ['first', 'last']));
            const trans = db.change('users');
            try {
                const { users } = trans.stores;
                await users.put({ first: 'Jin', last: 'Johnson' }, 'jin');
                await users.put({ first: 'John', last: 'Jinson' }, 'john');
                await users.put({ first: 'Bond', last: 'James' }, '007');
                const { names } = users.indexes;
                $mol_assert_like(await names.get(['Jin', 'Johnson']), { first: 'Jin', last: 'Johnson' });
                $mol_assert_like(await names.get(['John', 'Jinson']), { first: 'John', last: 'Jinson' });
                $mol_assert_like(await names.count(), 3);
                $mol_assert_like(await names.select($mol_dom_context.IDBKeyRange.bound(['Jin', 'Johnson'], ['John', 'Jinson'])), [{ first: 'Jin', last: 'Johnson' }, { first: 'John', last: 'Jinson' }]);
            }
            finally {
                trans.abort();
                await db.kill();
            }
        },
        async 'multiple indexes'() {
            const db = await $$.$mol_db('$mol_db_test', mig => mig.store_make('users'), mig => mig.stores.users.index_make('names', ['name'], true), mig => mig.stores.users.index_make('ages', ['age']));
            const trans = db.change('users');
            try {
                const { users } = trans.stores;
                await users.put({ name: 'Jin', age: 18 }, 'jin');
                await users.put({ name: 'John', age: 18 }, 'john');
                const { names, ages } = users.indexes;
                $mol_assert_like(await names.select(['Jin']), [{ name: 'Jin', age: 18 }]);
                $mol_assert_like(await names.select(['John']), [{ name: 'John', age: 18 }]);
                $mol_assert_like(await names.count(), 2);
                $mol_assert_like(await ages.select([18]), [{ name: 'Jin', age: 18 }, { name: 'John', age: 18 }]);
                $mol_assert_like(await ages.count(), 2);
            }
            finally {
                trans.abort();
                await db.kill();
            }
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    $mol_test_mocks.push($ => {
        class $giper_baza_mine_mock extends $.$giper_baza_mine_temp {
        }
        $.$giper_baza_mine = $giper_baza_mine_mock;
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    $mol_test_mocks.push($ => {
        class $mol_bus extends $.$mol_bus {
            send() { }
        }
        $.$mol_bus = $mol_bus;
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
    $mol_test_mocks.push($ => {
        class $giper_baza_land_mock extends $.$giper_baza_land {
            sync() {
                return this;
            }
        }
        $.$giper_baza_land = $giper_baza_land_mock;
    });
    $mol_test({
        async 'Give rights'($) {
            const auth0 = await $.$giper_baza_auth.grab();
            const auth1 = await $.$giper_baza_auth.grab();
            const auth2 = await $.$giper_baza_auth.grab();
            const land0 = $giper_baza_land.make({ $, auth: () => auth0 });
            const land1 = $giper_baza_land.make({ $, link: () => land0.link(), auth: () => auth1 });
            $mol_assert_equal(land0.lord_rank(land0.link()), $giper_baza_rank_rule);
            $mol_assert_equal(land0.lord_rank(auth1.pass().lord()), $giper_baza_rank_read);
            land1.give(auth2.pass(), $giper_baza_rank_post('just'));
            $mol_assert_equal(land0.pass_rank(auth1.pass()), $giper_baza_rank_read);
            land0.give(auth1.pass(), $giper_baza_rank_read);
            $mol_assert_equal(land0.pass_rank(auth1.pass()), $giper_baza_rank_read);
            land0.give(auth1.pass(), $giper_baza_rank_read);
            $mol_assert_equal(land0.pass_rank(auth1.pass()), $giper_baza_rank_read);
            land0.give(auth1.pass(), $giper_baza_rank_post('just'));
            $mol_assert_equal(land0.pass_rank(auth1.pass()), $giper_baza_rank_post('just'));
            land0.give(auth1.pass(), $giper_baza_rank_pull('just'));
            $mol_assert_equal(land0.pass_rank(auth1.pass()), $giper_baza_rank_pull('just'));
            land0.give(auth1.pass(), $giper_baza_rank_rule);
            $mol_assert_equal(land0.pass_rank(auth1.pass()), $giper_baza_rank_rule);
            land0.give(auth1.pass(), $giper_baza_rank_post('just'));
            $mol_assert_equal(land0.pass_rank(auth1.pass()), $giper_baza_rank_post('just'));
            await $mol_wire_async(land1).units_steal(land0);
            $mol_assert_equal(land1.pass_rank(auth1.pass()), $giper_baza_rank_post('just'));
            land1.give(auth2.pass(), $giper_baza_rank_post('just'));
        },
        async 'Post Data and pick Delta'($) {
            const auth1 = $.$giper_baza_auth.grab();
            const auth2 = $.$giper_baza_auth.grab();
            const land1 = $giper_baza_land.make({ $, auth: () => auth1 });
            const land2 = $giper_baza_land.make({ $, link: () => land1.link(), auth: () => auth2 });
            $mol_assert_equal(await $mol_wire_async(land1).diff_units(), []);
            land1.post($giper_baza_link.hole, $giper_baza_link.hole, new $giper_baza_link('AA111111'), new Uint8Array([1]));
            $mol_assert_equal((await $mol_wire_async(land1).diff_units()).length, 4);
            const face = land1.faces.clone();
            land1.post(new $giper_baza_link('AA111111'), $giper_baza_link.hole, new $giper_baza_link('AA222222'), new Uint8Array([2]));
            $mol_assert_equal((await $mol_wire_async(land1).diff_units()).length, 5);
            $mol_assert_equal((await $mol_wire_async(land1).diff_units(face)).length, 2);
            await $mol_wire_async(land2).units_steal(land1);
            land2.post(new $giper_baza_link('AA222222'), $giper_baza_link.hole, new $giper_baza_link('AA333333'), new Uint8Array([3]));
            $mol_assert_equal((await $mol_wire_async(land2).diff_units()).length, 5);
            $mol_assert_equal((await $mol_wire_async(land2).diff_units(face)).length, 2);
            land1.give(auth2.pass(), $giper_baza_rank_post('just'));
            await $mol_wire_async(land2).units_steal(land1);
            land2.post(new $giper_baza_link('AA222222'), $giper_baza_link.hole, new $giper_baza_link('AA333333'), new Uint8Array([5]));
            $mol_assert_equal((await $mol_wire_async(land2).diff_units()).length, 9);
            $mol_assert_equal((await $mol_wire_async(land2).diff_units(face)).length, 6);
            land1.give(auth2.pass(), $giper_baza_rank_read);
            await $mol_wire_async(land2).units_steal(land1);
            $mol_assert_equal((await $mol_wire_async(land2).diff_units()).length, 7);
        },
        async 'Land encryption'($) {
            const land = $mol_wire_async($giper_baza_land.make({ $ }));
            $mol_assert_equal(await land.encrypted(), false);
            await land.encrypted(true);
            $mol_assert_equal(await land.encrypted(), true);
            const material = await land.post($giper_baza_link.hole, $giper_baza_link.hole, null, new Uint8Array([1, 2, 3]));
            $mol_assert_equal((await land.sand_encode(material)).data().length, 16);
            $mol_assert_equal(await land.sand_decode(material), new Uint8Array([1, 2, 3]));
            $mol_assert_equal((await land.sand_ordered({ head: $giper_baza_link.hole, peer: $giper_baza_link.hole })).length, 1);
            const tombstone = await land.post($giper_baza_link.hole, $giper_baza_link.hole, material.self(), null);
            $mol_assert_equal((await land.sand_encode(tombstone)).data().length, 1);
            $mol_assert_equal(await land.sand_decode(tombstone), null);
            $mol_assert_equal((await land.sand_ordered({ head: $giper_baza_link.hole, peer: $giper_baza_link.hole })).length, 1);
        },
        'Land fork & merge': $mol_wire_async(($) => {
            const home = $.$giper_baza_glob.home().land();
            const left = home.fork();
            home.Data($giper_baza_list).items_vary(['foo', 'xxx']);
            $mol_assert_equal(home.Data($giper_baza_list).items_vary(), ['foo', 'xxx']);
            $mol_assert_equal(left.Data($giper_baza_list).items_vary(), ['foo', 'xxx']);
            left.faces.sync(home.faces);
            left.Data($giper_baza_list).items_vary(['foo', 'yyy']);
            $mol_assert_equal(left.Data($giper_baza_list).items_vary(), ['foo', 'yyy']);
            const right = home.fork();
            right.faces.sync(left.faces);
            right.Data($giper_baza_list).items_vary(['foo', 'zzz']);
            $mol_assert_equal(right.Data($giper_baza_list).items_vary(), ['foo', 'zzz']);
            const both = home.fork();
            $mol_assert_equal(both.Data($giper_baza_list).items_vary(), ['foo', 'xxx']);
            both.Tine().items_vary([right.link()]);
            $mol_assert_equal(both.Data($giper_baza_list).items_vary(), ['foo', 'zzz']);
            both.Tine().items_vary([left.link()]);
            $mol_assert_equal(both.Data($giper_baza_list).items_vary(), ['foo', 'yyy']);
            both.Tine().items_vary([right.link(), left.link()]);
            $mol_assert_equal(both.Data($giper_baza_list).items_vary(), ['foo', 'yyy']);
            both.Tine().items_vary([left.link(), right.link()]);
            $mol_assert_equal(both.Data($giper_baza_list).items_vary(), ['foo', 'zzz']);
        }),
        'Inner Links are relative to forked Land': $mol_wire_async(($) => {
            const Alice = $.$giper_baza_glob.home().land();
            const Bella = Alice.fork();
            const alice_val = Alice.Pawn($giper_baza_atom_text).Head(new $giper_baza_link('qwertyui'));
            const bella_val = Bella.Pawn($giper_baza_atom_text).Head(new $giper_baza_link('qwertyui'));
            alice_val.val('Alice');
            bella_val.val('Bella');
            const alice_link = Alice.Pawn($giper_baza_atom_link).Head(new $giper_baza_link('asdfghjk'));
            const bella_link = Bella.Pawn($giper_baza_atom_link).Head(new $giper_baza_link('asdfghjk'));
            alice_link.val(alice_val.link());
            $mol_assert_equal(alice_link.val(), alice_val.link());
            $mol_assert_unique(alice_link.val(), bella_link.val());
            $mol_assert_equal(bella_link.val(), bella_val.link());
        }),
        async 'Land Area inherits rights'($) {
            const area = await $mol_wire_async(() => {
                const base = $.$giper_baza_glob.land_grab([[null, $giper_baza_rank_post('just')]]);
                base.units_saving();
                return base.area_make();
            })();
            $mol_assert_equal(area.pass_rank(area.auth().pass()), $giper_baza_rank_rule);
            $mol_assert_equal(area.lord_rank($giper_baza_link.hole), $giper_baza_rank_post('just'));
        },
        // async 'Merge text changes'() {
        // 	const base = new $giper_baza_land( 1n, 1 )
        // 	base.chief.as( $hyoo_crowd_text ).str( 'Hello World and fun!' )
        // 	const left = base.fork( await $hyoo_crowd_peer.generate() )
        // 	const right = base.fork( await $hyoo_crowd_peer.generate() )
        // 	right.clock_data.tick( right.peer().id )
        // 	left.chief.as( $hyoo_crowd_text ).str( 'Hello Alice and fun!' )
        // 	right.chief.as( $hyoo_crowd_text ).str( 'Bye World and fun!' )
        // 	const left_delta = left.delta()
        // 	const right_delta = right.delta()
        // 	left.apply( right_delta )
        // 	right.apply( left_delta )
        // 	$mol_assert_equal(
        // 		left.chief.as( $hyoo_crowd_text ).str(),
        // 		right.chief.as( $hyoo_crowd_text ).str(),
        // 		'Bye Alice and fun!',
        // 	)
        // },
        // async 'Write into token'() {
        // 	const store = new $giper_baza_land( 1n, 1 )
        // 	store.chief.as( $hyoo_crowd_text ).str( 'foobar' )
        // 	store.chief.as( $hyoo_crowd_text ).write( 'xyz', 3 )
        // 	$mol_assert_equal( store.chief.as( $hyoo_crowd_list ).list(), [ 'fooxyzbar' ] )
        // },
        // async 'Write into token with split'() {
        // 	const store = new $giper_baza_land( 1n, 1 )
        // 	store.chief.as( $hyoo_crowd_text ).str( 'foobar' )
        // 	store.chief.as( $hyoo_crowd_text ).write( 'XYZ', 2, 4 )
        // 	$mol_assert_equal( store.chief.as( $hyoo_crowd_list ).list(), [ 'fo', 'XYZar' ] )
        // },
        // async 'Write over few tokens'() {
        // 	const store = new $giper_baza_land( 1n, 1 )
        // 	store.chief.as( $hyoo_crowd_text ).str( 'xxx foo bar yyy' )
        // 	store.chief.as( $hyoo_crowd_text ).write( 'X Y Z', 6, 9 )
        // 	$mol_assert_equal( store.chief.as( $hyoo_crowd_list ).list(), [ 'xxx', ' fo', 'X', ' Y', ' Zar', ' yyy' ] )
        // },
        // async 'Write whole token'() {
        // 	const store = new $giper_baza_land( 1n, 1 )
        // 	store.chief.as( $hyoo_crowd_text ).str( 'xxxFoo yyy' )
        // 	store.chief.as( $hyoo_crowd_text ).write( 'bar', 3, 7 )
        // 	$mol_assert_equal( store.chief.as( $hyoo_crowd_list ).list(), [ 'xxxbaryyy' ] )
        // },
        // async 'Write whole text'() {
        // 	const store = new $giper_baza_land( 1n, 1 )
        // 	store.chief.as( $hyoo_crowd_text ).str( 'foo bar' )
        // 	store.chief.as( $hyoo_crowd_text ).write( 'xxx', 0, 7 )
        // 	$mol_assert_equal( store.chief.as( $hyoo_crowd_list ).list(), [ 'xxx' ] )
        // },
        // async 'Write at the end'() {
        // 	const store = new $giper_baza_land( 1n, 1 )
        // 	store.chief.as( $hyoo_crowd_text ).str( 'foo' )
        // 	store.chief.as( $hyoo_crowd_text ).write( 'bar' )
        // 	$mol_assert_equal( store.chief.as( $hyoo_crowd_list ).list(), [ 'foobar' ] )
        // },
        // async 'Write between tokens'() {
        // 	const store = new $giper_baza_land( 1n, 1 )
        // 	store.chief.as( $hyoo_crowd_text ).str( 'foo bar' )
        // 	store.chief.as( $hyoo_crowd_text ).write( 'xxx', 4 )
        // 	$mol_assert_equal( store.chief.as( $hyoo_crowd_list ).list(), [ 'foo', ' xxxbar' ] )
        // },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    /**
     * Tests of the link list parser. Pure string work, nothing here goes anywhere.
     *
     * The land links below are shaped like real ones — groups of eight — but were
     * typed by hand and point at nothing. `d` keeps `$` out of the literals so mam
     * does not read a fixture as a dependency.
     */
    const d = '$';
    const land_a = 'AbCdEfGh_12345678_ZyXwVuTs';
    const land_b = 'QwErTyUi_09876543_MnBvCxZl';
    $mol_test({
        'an empty field is no pack, no lands and nothing refused'($) {
            $mol_assert_like($bog_vmap_lib_links_parse(''), { pack: null, lands: [], rejected: [] });
            $mol_assert_like($bog_vmap_lib_links_parse(' , ,\n'), { pack: null, lands: [], rejected: [] });
        },
        'one pack'($) {
            $mol_assert_like($bog_vmap_lib_links_parse('https://mol.hyoo.ru'), { pack: 'https://mol.hyoo.ru', lands: [], rejected: [] });
        },
        'spaces and a trailing comma are tolerated'($) {
            $mol_assert_like($bog_vmap_lib_links_parse('  https://mol.hyoo.ru , '), { pack: 'https://mol.hyoo.ru', lands: [], rejected: [] });
        },
        /**
         * The rule of section 5 for every field a person types into: what was typed
         * is stored as is, only what is derived from it is normalized.
         */
        'a pack without a slash is kept as typed and grows one in the derived address'($) {
            const links = $bog_vmap_lib_links_parse('https://b-on-g.github.io/gram');
            $mol_assert_equal(links.pack, 'https://b-on-g.github.io/gram');
            $mol_assert_equal($bog_vmap_lib_slashed(links.pack), 'https://b-on-g.github.io/gram/');
            // already slashed stays slashed, no doubling
            $mol_assert_equal($bog_vmap_lib_slashed('https://b-on-g.github.io/gram/'), 'https://b-on-g.github.io/gram/');
        },
        /** One pack per frame, and the person typing the second one is told why. */
        'a second pack is refused with a reason'($) {
            const links = $bog_vmap_lib_links_parse('https://mol.hyoo.ru, https://b-on-g.github.io/gram/');
            $mol_assert_equal(links.pack, 'https://mol.hyoo.ru');
            $mol_assert_like(links.lands, []);
            $mol_assert_like(links.rejected, [
                { link: 'https://b-on-g.github.io/gram/', reason: $bog_vmap_lib_links_reason.pack_second },
            ]);
            $mol_assert_equal($bog_vmap_lib_links_note(links), 'https://b-on-g.github.io/gram/: ' + $bog_vmap_lib_links_reason.pack_second);
        },
        'a pack and two lands'($) {
            $mol_assert_like($bog_vmap_lib_links_parse(`https://mol.hyoo.ru, ${land_a}, ${land_b}`), { pack: 'https://mol.hyoo.ru', lands: [land_a, land_b], rejected: [] });
        },
        'a land first and the pack second still gives one pack'($) {
            $mol_assert_like($bog_vmap_lib_links_parse(`${land_a}\nhttps://mol.hyoo.ru`), { pack: 'https://mol.hyoo.ru', lands: [land_a], rejected: [] });
        },
        'a repeated land is listed once'($) {
            $mol_assert_like($bog_vmap_lib_links_parse(`${land_a}, ${land_a}`).lands, [land_a]);
        },
        'garbage is refused, not guessed at'($) {
            const links = $bog_vmap_lib_links_parse(`hello, ${d}mol_view, ftp://x.y, abc_def`);
            $mol_assert_equal(links.pack, null);
            $mol_assert_like(links.lands, []);
            $mol_assert_like(links.rejected.map(item => item.link), ['hello', `${d}mol_view`, 'ftp://x.y', 'abc_def']);
            for (const item of links.rejected) {
                $mol_assert_equal(item.reason, $bog_vmap_lib_links_reason.unknown);
            }
        },
        'a link to a pawn inside a land is a land link too'($) {
            // four groups: peer, lord, area, head
            $mol_assert_equal($bog_vmap_lib_links_is_land(land_a + '_HeAdHeAd'), true);
            // the original grammar admits bare underscores, this one does not
            $mol_assert_equal($bog_vmap_lib_links_is_land('_'), false);
            $mol_assert_equal($bog_vmap_lib_links_is_land(''), false);
        },
        'a status text is empty when nothing was refused'($) {
            $mol_assert_equal($bog_vmap_lib_links_note($bog_vmap_lib_links_parse('https://mol.hyoo.ru')), '');
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    /**
     * Tests of the land library.
     *
     * A land is built locally, the way the database's own tests build one, so there
     * is no proof of work anywhere here and no master to wait for. `make( null )`
     * puts a part in the same land as its shelf, which is both the storage decision
     * and the reason this is testable at all.
     *
     * **`remote_list()` is never called, and that is the point of `shelf.parts()`.**
     * It resolves links through the static glob, which waits on a master that a test
     * does not have; the wait never ends, the run prints nothing, and every build
     * that runs the tests hangs. Reading through the shelf's own land is the same
     * answer without the wait.
     *
     * **Publishing a library into a land of its own is NOT tested.** Grabbing a land
     * mines proof of work — a fiber and seconds against a one second limit — and a
     * test of it would hang or flake, which reads exactly like a failed assertion.
     * What is testable is everything after: writing the sources and reading a class
     * tree out of them, against a land made by hand.
     */
    /**
     * Keeps `$` out of the fixtures. mam builds its dependency graph by a regexp
     * over sources, string literals included, so a bare class name in a document
     * fixture is read as a dependency of the module.
     */
    const d = '$';
    /** A land with no proof of work behind it, as the database's own tests make one. */
    function shelf($) {
        const land = $giper_baza_land.make({ $ });
        return land.Data($bog_vmap_lib_land_shelf);
    }
    /** Adds a component to a shelf, in the shelf's own land. */
    function part(shelf, source) {
        const one = shelf.Parts(null).make(null);
        one.tree(source);
        return one;
    }
    const card_src = `${d}my_card ${d}mol_view\n\tcaption \\Карточка\n\tprice 0\n`;
    const badge_src = `${d}my_badge ${d}my_card\n\tprice 1\n`;
    $mol_test({
        'a library with nothing published is empty and not broken'($) {
            const lib = $bog_vmap_lib_land.make({ $ });
            $mol_assert_like(lib.parts(), []);
            $mol_assert_equal(lib.source(), '');
            // The stub, and nothing else. An empty land is a state, not a failure.
            $mol_assert_like(lib.class_list(), [`${d}mol_view`]);
        },
        'components of a shelf come back in the order they were added'($) {
            const one = shelf($);
            part(one, card_src);
            part(one, badge_src);
            const lib = $bog_vmap_lib_land.make({ $, shelf: () => one });
            $mol_assert_like(lib.parts().map(p => p.tree()), [card_src, badge_src]);
        },
        /**
         * The requirement of the task in one assertion: what a land library answers
         * is what a pack library answers, down to the `$mol_view` stub that a pack
         * never carries in its own file.
         */
        'a land library lists its classes exactly as a pack would'($) {
            const one = shelf($);
            part(one, card_src);
            part(one, badge_src);
            const land = $bog_vmap_lib_land.make({ $, shelf: () => one });
            const pack = $bog_vmap_lib_any.make({
                $,
                tree: () => $.$bog_vmap_lib_parse(card_src + badge_src),
            });
            $mol_assert_like(land.class_list(), pack.class_list());
            $mol_assert_like([...land.props_map(`${d}my_badge`).keys()], [...pack.props_map(`${d}my_badge`).keys()]);
        },
        /**
         * A library is one namespace, so a component may inherit another component
         * of the same library. That only resolves because the sources are glued into
         * one tree before parsing, which is the reason `source()` exists at all.
         */
        'a component inherits another component of the same library'($) {
            const one = shelf($);
            part(one, card_src);
            part(one, badge_src);
            const lib = $bog_vmap_lib_land.make({ $, shelf: () => one });
            $mol_assert_like(lib.inherit_chain(`${d}my_badge`), [`${d}my_badge`, `${d}my_card`, `${d}mol_view`, `${d}mol_object`]);
            // Inherited and own ports together, exactly as for a pack class.
            const ports = [...lib.props_map(`${d}my_badge`).keys()];
            $mol_assert_ok(ports.includes('caption'));
            $mol_assert_ok(ports.includes('price'));
            $mol_assert_ok(ports.includes('sub'));
        },
        /**
         * Composing a land onto a pack, which section 5 says is the normal case.
         * The stub has to be absent from what is handed over, or it shadows the real
         * `$mol_view` of the pack: `index` keeps the LAST declaration of a name.
         */
        'classes handed to another library carry no stub'($) {
            const one = shelf($);
            part(one, card_src);
            const lib = $bog_vmap_lib_land.make({ $, shelf: () => one });
            $mol_assert_like(lib.class_trees().map(tree => tree.type), [`${d}my_card`]);
        },
        'a pack resolves the classes of a land handed to it'($) {
            const one = shelf($);
            part(one, card_src);
            const land = $bog_vmap_lib_land.make({ $, shelf: () => one });
            const pack = $bog_vmap_lib_any.make({ $, classes: () => land.class_trees() });
            $mol_assert_like(pack.class_list(), [`${d}mol_view`, `${d}my_card`]);
            $mol_assert_ok([...pack.props_map(`${d}my_card`).keys()].includes('caption'));
        },
        'handwritten bodies are keyed by the class the source declares'($) {
            const one = shelf($);
            const card = part(one, card_src);
            card.js('price(){ return 42 }');
            part(one, badge_src);
            const lib = $bog_vmap_lib_land.make({ $, shelf: () => one });
            $mol_assert_like(lib.js(), { [`${d}my_card`]: 'price(){ return 42 }' });
        },
        'the name of a class is read off its source': ($) => {
            $mol_assert_equal($bog_vmap_lib_land_name(card_src), `${d}my_card`);
            $mol_assert_equal($bog_vmap_lib_land_name(''), '');
            $mol_assert_equal($bog_vmap_lib_land_name('   \n'), '');
        },
        /**
         * The rule this project has now paid for three times: a read path must not
         * share a cell with a write path.
         *
         * Written through once, an `@ $mol_mem` accessor over a database atom freezes
         * at the written value forever — a later change to the atom is reported by
         * the atom and ignored by the cell. It only shows on the component you edited
         * yourself, so in a shared library it is invisible until two people are in it.
         *
         * The write below goes straight to the atom, which is what a remote edit
         * amounts to once it has merged.
         */
        'a part still hears its atom after being written through'($) {
            const one = shelf($);
            const card = part(one, card_src);
            $mol_assert_equal(card.tree(), card_src);
            card.Tree().val(badge_src);
            $mol_assert_equal(card.tree(), badge_src);
        },
        'a shelf still hears its atom after being written through'($) {
            const one = shelf($);
            one.title('Первая');
            $mol_assert_equal(one.title(), 'Первая');
            one.Title().val('Вторая');
            $mol_assert_equal(one.title(), 'Вторая');
        },
        /**
         * The premise the library rests on: a land syncs itself on every read of a
         * pawn, through `sand_ordered()`, so nobody has to ask. A `sync()` called by
         * hand used to sit in `parts()` on the belief that it did not.
         *
         * The counter goes on AFTER the part has been written and starts from zero,
         * so that a write cannot pay for the read. Counting from the start would
         * pass just as well with a land that only syncs when written to, and that is
         * a different statement — one that would not justify dropping the call.
         */
        'reading the parts of a shelf syncs their land unasked'($) {
            const one = shelf($);
            part(one, card_src);
            const lib = $bog_vmap_lib_land.make({ $, shelf: () => one });
            const land = one.land();
            let synced = 0;
            land.sync = () => { synced++; return land; };
            $mol_assert_equal(lib.parts().length, 1);
            $mol_assert_ok(synced > 0);
        },
        /**
         * The palette field in one object: a pack with a land on top. A land class
         * inheriting a pack class, and another land class inheriting that one, both
         * resolve their chain down into the pack — one namespace, as section 5 says.
         *
         * `land` is handed a local library so the link is never looked up; the link
         * itself is a placeholder shaped like a real one.
         */
        'a pack with a land stacked on it is one library from the outside'($) {
            const pack_src = `${d}my_base ${d}mol_view\n\tpack_port \\\n`;
            const tile_src = `${d}my_tile ${d}my_base\n\tcaption \\Плитка\n`;
            const hero_src = `${d}my_hero ${d}my_tile\n\tcaption \\Герой\n`;
            const one = shelf($);
            part(one, tile_src);
            part(one, hero_src);
            const lib = $bog_vmap_lib_land.make({ $, shelf: () => one });
            const stack = $bog_vmap_lib_land_stack.make({
                $,
                tree: () => $.$bog_vmap_lib_parse(pack_src),
                lands: () => ['AbCdEfGh_12345678_ZyXwVuTs'],
                land: () => lib,
            });
            $mol_assert_like(stack.class_list(), [`${d}mol_view`, `${d}my_base`, `${d}my_tile`, `${d}my_hero`]);
            // the chain runs from the land into the pack and down to the stub
            $mol_assert_like(stack.inherit_chain(`${d}my_hero`), [`${d}my_hero`, `${d}my_tile`, `${d}my_base`, `${d}mol_view`, `${d}mol_object`]);
            const ports = [...stack.props_map(`${d}my_hero`).keys()];
            $mol_assert_ok(ports.includes('pack_port'));
            $mol_assert_ok(ports.includes('caption'));
            $mol_assert_ok(ports.includes('sub'));
            // the nearer declaration wins the value
            $mol_assert_equal(stack.props_map(`${d}my_hero`).get('caption').kids[0].value, 'Герой');
            // what is handed to the palette and the inspector carries no stub
            $mol_assert_like(stack.land_trees().map(tree => tree.type), [`${d}my_tile`, `${d}my_hero`]);
        },
        /** What the scene receives: the three texts per component, in shelf order. */
        'the sources of a stack are the parts of its lands in order'($) {
            const one = shelf($);
            part(one, card_src);
            const badge = part(one, badge_src);
            badge.js('price(){ return 1 }');
            badge.css('[my_badge] { color: red }');
            const lib = $bog_vmap_lib_land.make({ $, shelf: () => one });
            const stack = $bog_vmap_lib_land_stack.make({
                $,
                lands: () => ['AbCdEfGh_12345678_ZyXwVuTs'],
                land: () => lib,
            });
            $mol_assert_like(stack.parts(), [
                { tree: card_src, js: '', css: '' },
                { tree: badge_src, js: 'price(){ return 1 }', css: '[my_badge] { color: red }' },
            ]);
        },
        /**
         * An author fixes a component and the consumer's scene has to follow: the
         * sources depend on the texts of the parts, not merely on the list of links.
         * The write goes straight to the atom, which is what a merged remote edit
         * amounts to, and the array the scene is sent changes with it.
         */
        'the sources of a stack follow an edit of a part'($) {
            const one = shelf($);
            const card = part(one, card_src);
            const lib = $bog_vmap_lib_land.make({ $, shelf: () => one });
            const stack = $bog_vmap_lib_land_stack.make({
                $,
                lands: () => ['AbCdEfGh_12345678_ZyXwVuTs'],
                land: () => lib,
            });
            $mol_assert_like(stack.parts(), [{ tree: card_src, js: '', css: '' }]);
            $mol_assert_like(stack.land_trees().map(tree => tree.type), [`${d}my_card`]);
            card.Tree().val(badge_src);
            // `null` makes the atom, the way `Parts( null )` makes the list above
            card.Css(null).val('[my_badge] { color: red }');
            $mol_assert_like(stack.parts(), [{ tree: badge_src, js: '', css: '[my_badge] { color: red }' }]);
            $mol_assert_like(stack.land_trees().map(tree => tree.type), [`${d}my_badge`]);
            // a component added later joins the list too
            part(one, card_src);
            $mol_assert_equal(stack.parts().length, 2);
        },
        'a stack with no lands is the pack alone'($) {
            const stack = $bog_vmap_lib_land_stack.make({
                $,
                tree: () => $.$bog_vmap_lib_parse(card_src),
            });
            $mol_assert_like(stack.class_list(), [`${d}mol_view`, `${d}my_card`]);
            $mol_assert_like(stack.parts(), []);
        },
        /**
         * The link grammar in `lib/links` is a COPY of the one in `$giper_baza_link`,
         * kept there so that `lib/` stays free of the database. This is the guard on
         * the copy: on a sample of tokens the two must agree. The original admits the
         * empty string and bare underscores, which the copy rules out on purpose, so
         * the comparison adds that one rule to the original.
         */
        'the link grammar copied into lib/links agrees with the database'($) {
            const samples = [
                'AbCdEfGh',
                'AbCdEfGh_12345678_ZyXwVuTs',
                'AbCdEfGh_12345678_ZyXwVuTs_HeAdHeAd',
                '_12345678',
                'AbCdEfGh_',
                'æÆ123456',
                'abc',
                'AbCdEfGh_1234567',
                'AbCdEfGh_12345678_ZyXwVuTs_HeAdHeAd_TooMany1',
                'https://mol.hyoo.ru',
                'hello world',
                '',
                '_',
            ];
            for (const token of samples) {
                const ours = $bog_vmap_lib_links_is_land(token);
                const theirs = $giper_baza_link.check(token) !== null && /[a-zæA-ZÆ0-9]{8}/.test(token);
                $mol_assert_equal(`${token}: ${ours}`, `${token}: ${theirs}`);
            }
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    /**
     * Tests of the document schema.
     *
     * Everything runs on bare lands made in place, with no master and no network.
     * Deliberately absent: `remote_list()`, which resolves links through the static
     * `glob.Land`, waits for a master that the tests do not have, and suspends for
     * ever; and land grabbing, which costs proof of work. A hanging test is worse
     * than a missing one here, because a failed `$mol_assert` and a hung run look
     * exactly alike — silence, no output — and the build hangs with it.
     *
     * `d` keeps `$` out of the string literals: mam builds its dependency graph by
     * a regexp over sources, literals included.
     */
    const d = '$';
    const src_root = `${d}bog_vmap_app_doc_test_page ${d}mol_view\n\tCalc ${d}bog_vmap_app_doc_test_calc\n\tcalc_result = Calc result\n\tsub / <= Calc\n`;
    const src_hero = `${d}bog_vmap_app_doc_test_hero ${d}mol_view title \\Hi\n`;
    /** Heads fixed by hand, so two peers address the same node without a list. */
    const head_root = new $giper_baza_link('11111111');
    const head_hero = new $giper_baza_link('22222222');
    /** A wire method leaves its original on the wrapper. That is how we spot one. */
    function wired(value) {
        return typeof value === 'function' && 'orig' in value;
    }
    function statics_own(Klass) {
        return Object.getOwnPropertyNames(Klass)
            .filter(name => !['length', 'name', 'prototype'].includes(name))
            .map(name => ({ name, value: Object.getOwnPropertyDescriptor(Klass, name)?.value }));
    }
    $mol_test({
        'three sources of a node survive a write and a read'($) {
            const land = $giper_baza_land.make({ $ });
            const node = land.Pawn($bog_vmap_app_doc_node).Head(head_root);
            $mol_assert_equal(node.source(), '');
            $mol_assert_equal(node.js(), '');
            $mol_assert_equal(node.css(), '');
            node.source(src_root);
            node.js('result(){ return 42 }');
            node.css('[bog_vmap_app_doc_test_page]{ color: red }');
            $mol_assert_equal(node.source(), src_root);
            $mol_assert_equal(node.js(), 'result(){ return 42 }');
            $mol_assert_equal(node.css(), '[bog_vmap_app_doc_test_page]{ color: red }');
        },
        /**
         * Coordinates in `atom_real`. The point of the test is the round trip itself:
         * `atom_bint` takes `3000n` and gives back `null`, which is why numbers here
         * are floats and why this is pinned rather than assumed.
         */
        'canvas coordinates survive a write and a read'($) {
            const land = $giper_baza_land.make({ $ });
            const doc = land.Pawn($bog_vmap_app_doc).Data();
            const spot = doc.Spots(null).key('Calc', null);
            $mol_assert_equal(spot.x(), 0);
            $mol_assert_equal(spot.y(), 0);
            spot.x(3000);
            spot.y(-12.5);
            $mol_assert_equal(spot.x(), 3000);
            $mol_assert_equal(spot.y(), -12.5);
            $mol_assert_equal(doc.Spots().key('Calc').x(), 3000);
        },
        /**
         * The payoff of one atom per node: two people editing two different nodes
         * both keep their text. One `sand_ordered` over the whole document would
         * lose one of the two.
         */
        async 'edits to different nodes merge without loss'($) {
            const land1 = $giper_baza_land.make({ $ });
            const land2 = $giper_baza_land.make({ $ });
            land1.Pawn($bog_vmap_app_doc_node).Head(head_root).source(src_root);
            land2.tick();
            land2.Pawn($bog_vmap_app_doc_node).Head(head_hero).source(src_hero);
            await $mol_wire_async(land1).units_steal(land2);
            $mol_assert_equal(land1.Pawn($bog_vmap_app_doc_node).Head(head_root).source(), src_root);
            $mol_assert_equal(land1.Pawn($bog_vmap_app_doc_node).Head(head_hero).source(), src_hero);
        },
        /**
         * The other half of the same trade, stated honestly: inside ONE node the
         * later write wins outright, there is no merge. Per node LWW is the choice
         * of section 9, not a shortcoming of this schema, and it stands until the
         * engine's own ordered text is fixed.
         */
        async 'edits to one node are last write wins'($) {
            const land1 = $giper_baza_land.make({ $ });
            const land2 = $giper_baza_land.make({ $ });
            land1.Pawn($bog_vmap_app_doc_node).Head(head_root).source(src_root);
            land2.tick();
            land2.Pawn($bog_vmap_app_doc_node).Head(head_root).source(src_hero);
            await $mol_wire_async(land1).units_steal(land2);
            $mol_assert_equal(land1.Pawn($bog_vmap_app_doc_node).Head(head_root).source(), src_hero);
        },
        /**
         * The regression that made every accessor here a plain method.
         *
         * With `@$mol_mem` on `source()` this fails: the node whose text you typed
         * yourself freezes at your version and never shows the merged one, for the
         * rest of the session. Read-only cells track fine, so the fault hides until
         * two people edit the same document — precisely the case section 9 is about.
         *
         * The same shape is inherited from `$giper_baza_entity.title()`, which is why
         * `doc.title()` is overridden rather than reused.
         */
        async 'a locally edited node still sees a remote edit'($) {
            const land1 = $giper_baza_land.make({ $ });
            const land2 = $giper_baza_land.make({ $ });
            const node1 = land1.Pawn($bog_vmap_app_doc_node).Head(head_root);
            node1.source(src_root);
            $mol_assert_equal(node1.source(), src_root);
            land2.tick();
            land2.Pawn($bog_vmap_app_doc_node).Head(head_root).Tree(null).val(src_hero);
            await $mol_wire_async(land1).units_steal(land2);
            $mol_assert_equal(node1.Tree().val(), src_hero);
            $mol_assert_equal(node1.source(), src_hero);
        },
        'a document titles itself and points at its root'($) {
            const land = $giper_baza_land.make({ $ });
            const doc = land.Pawn($bog_vmap_app_doc).Data();
            doc.title('Landing');
            $mol_assert_equal(doc.title(), 'Landing');
            $mol_assert_equal(doc.pack(), '');
            doc.pack('https://mol.hyoo.ru');
            $mol_assert_equal(doc.pack(), 'https://mol.hyoo.ru');
            const root = land.Pawn($bog_vmap_app_doc_node).Head(head_root);
            root.source(src_root);
            doc.Root(null).remote(root);
            /**
             * Read back as a raw link, not through `remote()`. The typed getter
             * resolves the target with the STATIC glob, which waits on a master the
             * tests do not have. Storing the link is the schema's whole job here.
             */
            $mol_assert_equal(doc.Root().val().str, root.link().str);
        },
        /**
         * The schema is exactly this and nothing else.
         *
         * Pinned key by key on purpose. Every field anybody is tempted to add here —
         * the class name, the property list, the wires — is recomputable from `Tree`,
         * and a stored copy of a derived thing is the first source of desync. Wires
         * in particular are two lines of the source text, see the note in `doc.ts`.
         */
        'nothing derivable is stored'($) {
            $mol_assert_like(Object.keys($bog_vmap_app_doc_node.schema), ['Tree', 'Js', 'Css']);
            $mol_assert_like(Object.keys($bog_vmap_app_doc_spot.schema), ['X', 'Y']);
            $mol_assert_like(Object.keys($bog_vmap_app_doc.schema), ['Title', 'Nodes', 'Root', 'Spots', 'Pack']);
            $mol_assert_like(Object.keys($bog_vmap_app_doc_home.schema), ['Docs']);
        },
        /**
         * The schema stays pure.
         *
         * `static @$mol_action` on an entity takes the class itself as the fiber
         * owner, so fibers stop deduplicating consistently and writes go missing
         * between devices with no error anywhere. It cost a rewrite once already.
         * Checked rather than reviewed, because the damage is silent and the
         * temptation to put one CRUD helper on the class is permanent.
         */
        'schema carries no static wire methods'($) {
            for (const Klass of $bog_vmap_app_doc_schema) {
                const wired_names = statics_own(Klass)
                    .filter(prop => wired(prop.value))
                    .map(prop => prop.name);
                $mol_assert_like(wired_names, []);
            }
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    /**
     * Tests of the store, on the home land built in place.
     *
     * No master, no network, no proof of work: `doc_land_config` answers `null`, so
     * a document is made in the home land itself instead of grabbing a land of its
     * own. Everything else is the real path — the glob, the list, the atoms.
     *
     * NOT covered, deliberately: grabbing a land per document. That is proof of
     * work, seconds against the one second a mol test is given, and a hanging test
     * is indistinguishable from a failed assertion — silence — and hangs every
     * build that runs the tests.
     *
     * `d` keeps `$` out of the string literals: mam builds its dependency graph by
     * a regexp over sources, literals included.
     */
    const d = '$';
    /**
     * The address is a static cell and would leak a `doc=` from one test into the
     * next. A subclass per test gets a cache of its own, the way the glob mock does.
     */
    $mol_test_mocks.push($ => {
        class $mol_state_arg_mock extends $.$mol_state_arg {
        }
        $.$mol_state_arg = $mol_state_arg_mock;
    });
    /**
     * Fixtures in canonical `tree2` formatting, the fixed point of the serializer:
     * a node with one child is written on one line. The store promises a byte for
     * byte round trip on exactly this shape, which is the shape `lang` writes.
     */
    const src_page = `${d}bog_vmap_app_store_test_page ${d}mol_view\n\tCalc ${d}bog_vmap_app_store_test_calc\n\tcalc_result = Calc result\n\tsub / <= Calc\n`;
    const src_calc = `${d}bog_vmap_app_store_test_calc ${d}mol_view\n\tresult 42\n\tstep 1\n`;
    const src_hero = `${d}bog_vmap_app_store_test_hero ${d}mol_view\n\ttitle \\Hi\n\tsub / <= title\n`;
    /** Documents in the home land: the same code path minus the proof of work. */
    function store($) {
        return $bog_vmap_app_store.make({
            $,
            doc_land_config: () => null,
        });
    }
    $mol_test({
        'no documents, no address: nothing is current and the text is empty'($) {
            const s = store($);
            $mol_assert_equal(s.doc_current(), null);
            $mol_assert_equal(s.source(), '');
            $mol_assert_like(s.spots(), {});
            $mol_assert_equal(s.title(), '');
            $mol_assert_like(s.doc_links(), []);
            $mol_assert_equal(s.stage(), 'making');
        },
        /** Byte for byte, on the canonical formatting `lang` writes. */
        'one class survives the round trip'($) {
            const s = store($);
            s.doc_add('Landing');
            s.source(src_page);
            $mol_assert_equal(s.source(), src_page);
            $mol_assert_equal(s.nodes(s.doc_current()).length, 1);
            $mol_assert_equal(s.stage(), 'ready');
        },
        'a document of several classes survives the round trip, one node per class'($) {
            const s = store($);
            const doc = s.doc_add('Landing');
            s.source(src_page + src_calc);
            $mol_assert_equal(s.source(), src_page + src_calc);
            const nodes = s.nodes(doc);
            $mol_assert_equal(nodes.length, 2);
            $mol_assert_equal(nodes[0].source(), src_page);
            $mol_assert_equal(nodes[1].source(), src_calc);
        },
        /**
         * The payoff of per node storage: editing one class rewrites one atom. The
         * neighbour keeps its node — the same link — and its text is untouched.
         */
        'editing one class leaves the other node alone'($) {
            const s = store($);
            const doc = s.doc_add('Landing');
            s.source(src_page + src_calc);
            const calc_before = s.nodes(doc)[1];
            const edited = src_page.replace('result', 'total');
            s.source(edited + src_calc);
            const nodes = s.nodes(doc);
            $mol_assert_equal(nodes.length, 2);
            $mol_assert_equal(nodes[0].source(), edited);
            $mol_assert_equal(nodes[1].link().str, calc_before.link().str);
            $mol_assert_equal(nodes[1].source(), src_calc);
        },
        'a class gone from the text leaves the document, a new one joins it in order'($) {
            const s = store($);
            const doc = s.doc_add('Landing');
            s.source(src_page + src_calc);
            s.source(src_hero + src_calc);
            $mol_assert_equal(s.source(), src_hero + src_calc);
            $mol_assert_equal(s.nodes(doc).length, 2);
            s.source(src_calc);
            $mol_assert_equal(s.source(), src_calc);
            $mol_assert_equal(s.nodes(doc).length, 1);
        },
        'the root is the class the document was made with'($) {
            const s = store($);
            const doc = s.doc_add('Landing', src_page + src_calc);
            $mol_assert_equal(s.doc_root(doc), `${d}bog_vmap_app_store_test_page`);
            $mol_assert_equal(s.source(), src_page + src_calc);
        },
        /**
         * WHY A RENAME HAS TO CARRY THE BODY AND THE STYLES BY HAND, measured at the
         * level where it happens.
         *
         * Classes are matched to nodes by NAME, so a class renamed in the text has no
         * match: a node is made for the new name with nothing in it, and the old one
         * leaves the list taking its `Js` and `Css` with it. Everything the editor
         * keeps about a class outside its text therefore has to be read BEFORE the
         * text is written and put back after — there is no name in between that
         * answers for it.
         */
        'a class renamed in the text arrives as an empty node and the old one leaves'($) {
            const s = store($);
            const doc = s.doc_add('Landing', src_page + src_calc);
            s.node(doc, `${d}bog_vmap_app_store_test_calc`).js('result(){ return 42 }');
            const renamed = src_calc.replace('_calc ', '_total ');
            s.source(src_page + renamed);
            $mol_assert_equal(s.nodes(doc).length, 2);
            $mol_assert_equal(s.node(doc, `${d}bog_vmap_app_store_test_calc`), null);
            // The new name is a new node, and it is empty. This is the loss the editor
            // closes above it, not a defect of the store: the text is the truth, and
            // the text says there is no such class any more.
            $mol_assert_equal(s.node_js(doc, `${d}bog_vmap_app_store_test_total`), '');
        },
        /**
         * THE PROMISE OF STAGE 1: a reload comes back to the same scene.
         *
         * Nothing else in the pack says a word about it, and nothing could: the
         * standing mocks switch persistence off on BOTH sides — `$giper_baza_land
         * .sync()`, the one method that loads and saves, is stubbed to a no-op, and
         * the mine is replaced by the empty base, whose `units_load` answers with
         * nothing. Both are put back here.
         *
         * The mine below keeps units in memory, in the shape the IndexedDB driver
         * uses in a browser: one record per unit, and the payload of a big one in a
         * store of its own. What is NOT covered is that driver itself, which needs a
         * browser; everything between the store and it is the product path exactly.
         *
         * A SESSION IS A SET OF CLASSES WITH FRESH CACHES and the same identity —
         * what a reloaded page has, its key restored out of local storage.
         *
         * **Each session keeps a live reader, and without one this test lies:** the
         * graph sweeps a cell nobody reads, the land object goes with it and comes
         * back empty, which looks exactly like the loss under test. Measured on the
         * stand this grew out of, where the first version reported a loss that was
         * its own doing.
         *
         * **Balls are half of what is being checked.** A text longer than a unit
         * holds inline lives in a ball beside it, and a mine that keeps units but
         * forgets balls gives back a document list with titles and documents with no
         * text at all — measured here by leaving `ball_load` out, and it is the same
         * picture the editor showed on a reloaded page of the deploy.
         */
        async 'a document written in one session comes back in the next'($) {
            /** The disk, shared by the sessions and by nothing else. */
            const disk = new Map();
            class mine extends $giper_baza_mine_temp {
                units_save(diff) {
                    const key = this.land().str;
                    let kept = disk.get(key);
                    if (!kept)
                        disk.set(key, kept = new Map);
                    for (const unit of diff.del)
                        kept.delete(unit.path());
                    for (const unit of diff.ins) {
                        const ball = unit instanceof $giper_baza_unit_sand && unit.big()
                            ? unit.ball()
                            : null;
                        kept.set(unit.path(), {
                            bin: unit.buffer.slice(unit.byteOffset, unit.byteOffset + unit.byteLength),
                            ball: ball && new Uint8Array(ball.buffer.slice(ball.byteOffset, ball.byteOffset + ball.byteLength)),
                        });
                        this.units_persisted.add(unit);
                    }
                }
                units_load() {
                    const kept = disk.get(this.land().str);
                    if (!kept)
                        return [];
                    const units = [...kept.values()].map(one => $giper_baza_unit_base.narrow(one.bin));
                    for (const unit of units)
                        this.units_persisted.add(unit);
                    return units;
                }
                ball_load(sand) {
                    return disk.get(this.land().str)?.get(sand.path())?.ball
                        ?? new Uint8Array();
                }
            }
            const session = () => {
                const ctx = Object.create($);
                // The real land, whose `sync()` loads and saves.
                ctx.$giper_baza_land = class extends $$.$giper_baza_land {
                };
                ctx.$giper_baza_mine = class extends mine {
                };
                const glob = class extends $.$giper_baza_glob {
                    static lands_touched = new $mol_wire_set();
                };
                glob.$ = ctx;
                ctx.$giper_baza_glob = glob;
                ctx.$mol_state_arg = class extends $.$mol_state_arg {
                };
                // A browser answers with a quota; the base class answers zero, and
                // zero reads as «storage full» to the sharding rule of `persisted()`.
                ctx.$mol_storage = class extends $.$mol_storage {
                    static total() { return 1e9; }
                    static used() { return 0; }
                };
                const store = $bog_vmap_app_store.make({
                    $: ctx,
                    doc_land_config: () => [[null, $giper_baza_rank_read]],
                });
                // What a view does: read, and stay subscribed.
                const eye = new $mol_wire_atom('eye', () => {
                    try {
                        return store.doc_links().length + ':' + store.source().length;
                    }
                    catch (error) {
                        if ($mol_promise_like(error))
                            return $mol_fail_hidden(error);
                        return -1;
                    }
                });
                /** A frame drawn. Suspends while a land loads, like any first frame. */
                const look = () => { try {
                    eye.fresh();
                }
                catch (error) { } };
                return { store, look };
            };
            const read = (store, name, ...args) => $mol_wire_async(store)[name](...args);
            const one = session();
            one.look();
            const made = await read(one.store, 'doc_add', 'Сцена 1', src_page);
            const link = made.link().str;
            one.look();
            // Saving is driven by the yard, which has no master here, so it is asked
            // for directly: what this checks is the round trip, not the timer.
            await $mol_wire_async(one.store.home().land()).units_saving();
            await $mol_wire_async(made.land()).units_saving();
            // A reload: same identity, same disk, every cache new.
            const two = session();
            two.look();
            $mol_assert_equal((await read(two.store, 'doc_links')).length, 1);
            $mol_assert_equal(await read(two.store, 'title'), 'Сцена 1');
            $mol_assert_equal(await read(two.store, 'source'), src_page);
            // And by the address, which is how a shared link opens.
            const three = session();
            await read(three.store, 'doc_arg', link);
            three.look();
            const current = await read(three.store, 'doc_current');
            $mol_assert_equal(current.link().str, link);
            $mol_assert_equal(await read(three.store, 'source'), src_page);
        },
        /**
         * The recorded choice can be moved, and that is what a rename of the root
         * needs: classes are matched to nodes by NAME, so a renamed class arrives as
         * a node of its own and nothing would move the pointer to it otherwise.
         */
        'the root can be pointed at another class of the document'($) {
            const s = store($);
            const doc = s.doc_add('Landing', src_page + src_calc);
            s.doc_root(doc, `${d}bog_vmap_app_store_test_calc`);
            $mol_assert_equal(s.doc_root(doc), `${d}bog_vmap_app_store_test_calc`);
            // A name the document does not carry is ignored: a pointer at a node
            // outside the list is the state this exists to prevent.
            s.doc_root(doc, `${d}bog_vmap_app_store_test_absent`);
            $mol_assert_equal(s.doc_root(doc), `${d}bog_vmap_app_store_test_calc`);
        },
        'two documents are independent'($) {
            const s = store($);
            const first = s.doc_add('First', src_page);
            const second = s.doc_add('Second', src_hero);
            $mol_assert_equal(s.source(), src_hero);
            s.source(src_hero + src_calc);
            $mol_assert_equal(s.doc_source(first), src_page);
            $mol_assert_equal(s.doc_source(second), src_hero + src_calc);
        },
        'picking a document changes the text'($) {
            const s = store($);
            const first = s.doc_add('First', src_page);
            const second = s.doc_add('Second', src_hero);
            $mol_assert_equal(s.source(), src_hero);
            s.doc_pick(first.link());
            $mol_assert_equal(s.doc_current().link().str, first.link().str);
            $mol_assert_equal(s.source(), src_page);
            $mol_assert_equal(s.title(), 'First');
            s.doc_pick(second.link());
            $mol_assert_equal(s.source(), src_hero);
            $mol_assert_equal(s.title(), 'Second');
            // No address means the last one made.
            s.doc_pick(null);
            $mol_assert_equal(s.doc_arg(), null);
            $mol_assert_equal(s.source(), src_hero);
        },
        'a malformed address counts as none'($) {
            const s = store($);
            s.doc_add('First', src_page);
            s.doc_arg('not a link at all');
            $mol_assert_equal(s.source(), src_page);
        },
        'title, pack and places survive a write and a read'($) {
            const s = store($);
            s.doc_add('Landing');
            s.title('Renamed');
            $mol_assert_equal(s.title(), 'Renamed');
            // Stored as typed. What the string means is the palette's business.
            s.pack('https://mol.hyoo.ru, aaaaaaaa_bbbbbbbb');
            $mol_assert_equal(s.pack(), 'https://mol.hyoo.ru, aaaaaaaa_bbbbbbbb');
            s.spots({ Hero: { x: 0, y: 0 }, Calc: { x: 100, y: -20.5 } });
            $mol_assert_like(s.spots(), { Calc: { x: 100, y: -20.5 }, Hero: { x: 0, y: 0 } });
            // A place gone from the dictionary is gone from the store too.
            s.spots({ Calc: { x: 110, y: -20.5 } });
            $mol_assert_like(s.spots(), { Calc: { x: 110, y: -20.5 } });
        },
        'class body and styles are kept per node'($) {
            const s = store($);
            const doc = s.doc_add('Landing', src_page + src_calc);
            s.node_js(doc, `${d}bog_vmap_app_store_test_calc`, 'result(){ return 42 }');
            s.node_css(doc, `${d}bog_vmap_app_store_test_calc`, '[calc]{ color: red }');
            $mol_assert_equal(s.node_js(doc, `${d}bog_vmap_app_store_test_calc`), 'result(){ return 42 }');
            $mol_assert_equal(s.node_css(doc, `${d}bog_vmap_app_store_test_calc`), '[calc]{ color: red }');
            $mol_assert_equal(s.node_js(doc, `${d}bog_vmap_app_store_test_page`), '');
            $mol_assert_equal(s.node_js(doc, `${d}bog_vmap_app_store_test_none`), '');
            // The sources are not disturbed by it.
            $mol_assert_equal(s.source(), src_page + src_calc);
        },
        'the list in the home land grows with every document'($) {
            const s = store($);
            $mol_assert_equal(s.doc_links().length, 0);
            $mol_assert_equal(s.title_next(), 'Сцена 1');
            const first = s.doc_add('First');
            $mol_assert_equal(s.doc_links().length, 1);
            const second = s.doc_add('Second');
            $mol_assert_equal(s.doc_links().length, 2);
            $mol_assert_equal(s.title_next(), 'Сцена 3');
            $mol_assert_like(s.doc_links().map(link => link.str), [first.link().str, second.link().str]);
            // Same list, read back as documents.
            $mol_assert_like(s.doc_links().map(link => s.doc(link).title()), ['First', 'Second']);
        },
        /**
         * Before there is a document the editor works on a draft, and the first
         * document is made out of it in one go: text, places and palette together,
         * so that nothing typed while the land was being grabbed is lost.
         */
        'the draft becomes the first document whole'($) {
            const s = store($);
            s.source(src_page);
            s.spots({ Calc: { x: 10, y: 20 } });
            s.pack('https://mol.hyoo.ru');
            $mol_assert_equal(s.doc_links().length, 0);
            $mol_assert_equal(s.source(), src_page);
            s.doc_first();
            $mol_assert_equal(s.doc_links().length, 1);
            $mol_assert_equal(s.doc_arg(), s.doc_current().link().str);
            $mol_assert_equal(s.source(), src_page);
            $mol_assert_like(s.spots(), { Calc: { x: 10, y: 20 } });
            $mol_assert_equal(s.pack(), 'https://mol.hyoo.ru');
            $mol_assert_equal(s.title(), 'Сцена 1');
            $mol_assert_equal(s.doc_root(s.doc_current()), `${d}bog_vmap_app_store_test_page`);
            // Made once. A second call with a document in place does nothing.
            s.doc_first();
            $mol_assert_equal(s.doc_links().length, 1);
        },
        /**
         * `boot` answers at once and hands the making to one fiber; the answer
         * follows the document afterwards. Read again and it is the same fiber, so
         * a second document is never started.
         */
        async 'boot makes the first document and then reports it'($) {
            const s = store($);
            $mol_assert_equal(s.boot(), 'making');
            const held = s.doc_first_task();
            $mol_assert_equal(s.doc_first_task().task === held.task, true);
            await held.task;
            $mol_assert_equal(s.doc_links().length, 1);
            $mol_assert_equal(s.boot(), 'ready');
            $mol_assert_equal(s.stage(), 'ready');
            // Still the one fiber, and still the one document.
            $mol_assert_equal(s.doc_first_task().task === held.task, true);
            $mol_assert_equal(s.doc_links().length, 1);
        },
        /**
         * The answer of `boot` is read afresh every time and cannot go stale: under
         * `@ $mol_mem` this is the case that answered «making» for the rest of the
         * session, the document having landed while the cell was still computing.
         */
        'boot reports the document it just made, in the same breath'($) {
            const s = store($);
            $mol_assert_equal(s.boot(), 'making');
            // Nothing awaited: with no proof of work the document is already there.
            $mol_assert_equal(s.doc_links().length, 1);
            $mol_assert_equal(s.boot(), 'ready');
            $mol_assert_equal(s.stage(), 'ready');
        },
        'boot leaves an existing document alone'($) {
            const s = store($);
            s.doc_add('First', src_page);
            $mol_assert_equal(s.boot(), 'ready');
            $mol_assert_equal(s.doc_links().length, 1);
            // No fiber was ever asked for: the cell holding it is untouched.
            $mol_assert_equal($mol_wire_probe(() => s.doc_first_task()), undefined);
        },
        /** The draft goes into the document `boot` makes, the same as into `doc_first`. */
        async 'the draft goes whole into the document boot makes'($) {
            const s = store($);
            s.source(src_page);
            s.spots({ Calc: { x: 10, y: 20 } });
            s.pack('https://mol.hyoo.ru');
            $mol_assert_equal(s.boot(), 'making');
            await s.doc_first_task().task;
            $mol_assert_equal(s.doc_links().length, 1);
            $mol_assert_equal(s.source(), src_page);
            $mol_assert_like(s.spots(), { Calc: { x: 10, y: 20 } });
            $mol_assert_equal(s.pack(), 'https://mol.hyoo.ru');
            $mol_assert_equal(s.title(), 'Сцена 1');
        },
        /**
         * A land still on its way suspends the fiber, which is what mining the
         * proof of work does in the editor. The reader is told «making» and is not
         * left on it: the moment the document lands, `boot` says `ready`. Repeated
         * reads while it waits get the same fiber and make no second document.
         */
        async 'a suspended land does not leave the reader on making for ever'($) {
            let open = () => { };
            const gate = new Promise(done => { open = () => done(); });
            let held = true;
            /** Suspends once on the way in, the way a land grab does. */
            class store_slow extends $bog_vmap_app_store {
                doc_first() {
                    if (held)
                        return $mol_fail_hidden(gate);
                    return super.doc_first();
                }
            }
            const s = store_slow.make({ $, doc_land_config: () => null });
            $mol_assert_equal(s.boot(), 'making');
            $mol_assert_equal(s.doc_links().length, 0);
            const task = s.doc_first_task();
            $mol_assert_equal(s.boot(), 'making');
            $mol_assert_equal(s.doc_first_task().task === task.task, true);
            $mol_assert_equal(s.doc_links().length, 0);
            held = false;
            open();
            await task.task;
            $mol_assert_equal(s.doc_links().length, 1);
            $mol_assert_equal(s.boot(), 'ready');
            $mol_assert_equal(s.stage(), 'ready');
        },
        /**
         * The draft is poured AFTER the document is already in the list, so there is
         * a window in which `boot` answers `ready` while the fiber still has work to
         * do. Whoever is reading `boot` — the application, every render — must not
         * end that fiber by looking away: the loss would be silent and would be the
         * text the user had typed.
         */
        async 'the draft survives a suspension after the document is already listed'($) {
            let open = () => { };
            const gate = new Promise(done => { open = () => done(); });
            let held = true;
            /** Suspends once while pouring, the way signing a unit does. */
            class store_late extends $bog_vmap_app_store {
                doc_source(doc, next) {
                    if (next !== undefined && held)
                        return $mol_fail_hidden(gate);
                    return super.doc_source(doc, next);
                }
            }
            const s = store_late.make({ $, doc_land_config: () => null });
            s.source(src_page);
            $mol_assert_equal(s.boot(), 'making');
            // The document is listed, the draft is not in it yet.
            $mol_assert_equal(s.doc_links().length, 1);
            $mol_assert_equal(s.doc_source(s.doc_current()), '');
            // The application reads `boot` again on that very change and is told
            // `ready`, so it stops asking for the fiber.
            $mol_assert_equal(s.boot(), 'ready');
            held = false;
            open();
            await s.doc_first_task().task;
            $mol_assert_equal(s.doc_links().length, 1);
            $mol_assert_equal(s.source(), src_page);
        },
        /**
         * The same window, with a reader that subscribes and then looks away — the
         * application, whose `auto()` reads `boot` from a cell. A cell nobody reads
         * is collected together with what it owns, so the fiber must not hang on
         * being read: it is held while it has work, and the draft lands whole.
         */
        async 'a reader that looks away does not take the fiber with it'($) {
            let open = () => { };
            const gate = new Promise(done => { open = () => done(); });
            let held = true;
            class store_late extends $bog_vmap_app_store {
                doc_source(doc, next) {
                    if (next !== undefined && held)
                        return $mol_fail_hidden(gate);
                    return super.doc_source(doc, next);
                }
            }
            const s = store_late.make({ $, doc_land_config: () => null });
            s.source(src_page);
            /** Stands for `auto()` of the application: a cell, and the only reader. */
            const reader = $mol_wire_atom.solo(s, function boot_reader() {
                return this.boot();
            });
            $mol_assert_equal(reader.sync(), 'making');
            $mol_assert_equal(s.doc_links().length, 1);
            // It runs again — a render, an edit, anything — and is told `ready`.
            reader.refresh();
            $mol_assert_equal(reader.sync(), 'ready');
            // The tick on which the graph collects whatever nobody reads any more.
            await new Promise(done => new $mol_after_tick(() => done(null)));
            held = false;
            open();
            await new Promise(done => new $mol_after_tick(() => done(null)));
            await new Promise(done => new $mol_after_tick(() => done(null)));
            $mol_assert_equal(s.doc_links().length, 1);
            $mol_assert_equal(s.source(), src_page);
        },
        /**
         * A link in the address opens somebody else's public document: it reads,
         * it says so, and a write into it changes nothing and throws nothing. The
         * owner is a second key; their land is copied into the reader's glob the way
         * the network would deliver it.
         */
        async 'a document of somebody else reads, refuses writes and says why'($) {
            const owner = await $.$giper_baza_auth.grab();
            const theirs = $giper_baza_land.make({ $, auth: () => owner });
            const helper = store($);
            const their_doc = theirs.Data($bog_vmap_app_doc);
            their_doc.title('Theirs');
            helper.doc_source(their_doc, src_hero);
            helper.doc_spots(their_doc, { Hero: { x: 5, y: 6 } });
            const s = store($);
            const link = their_doc.link();
            await $mol_wire_async(s.doc(link).land()).units_steal(theirs);
            s.doc_pick(link);
            $mol_assert_equal(s.source(), src_hero);
            $mol_assert_equal(s.title(), 'Theirs');
            $mol_assert_like(s.spots(), { Hero: { x: 5, y: 6 } });
            $mol_assert_equal(s.doc_editable(), false);
            $mol_assert_equal(s.stage(), 'readonly');
            s.source(src_page);
            s.title('Mine now');
            s.spots({ Hero: { x: 0, y: 0 } });
            s.pack('https://example.org');
            $mol_assert_equal(s.source(), src_hero);
            $mol_assert_equal(s.title(), 'Theirs');
            $mol_assert_like(s.spots(), { Hero: { x: 5, y: 6 } });
            $mol_assert_equal(s.pack(), '');
            // Our own list is untouched by looking at theirs.
            $mol_assert_equal(s.doc_links().length, 0);
        },
        /**
         * A write straight into the atom, past the store, is what a remote edit
         * looks like once it has landed. The store, having written this very node
         * itself, must hand out the new text: this is the regression an accessor
         * under `@ $mol_mem` fails, for the rest of the session.
         */
        'a node edited through the store still sees a write past it'($) {
            const s = store($);
            const doc = s.doc_add('Landing');
            s.source(src_page);
            $mol_assert_equal(s.source(), src_page);
            s.nodes(doc)[0].Tree(null).val(src_hero);
            $mol_assert_equal(s.source(), src_hero);
            $mol_assert_equal(s.nodes(doc).length, 1);
        },
        /**
         * The same, with the edit arriving from another peer by merge, the way the
         * network delivers it. Two lands of the same link; the second writes later
         * and wins, per node last-write-wins being the choice of section 9.
         */
        async 'a node edited through the store still sees a merged remote edit'($) {
            const s = store($);
            const doc = s.doc_add('Landing');
            s.source(src_page);
            const head = s.nodes(doc)[0].head();
            const home = s.home().land();
            // The peer writes LATER. The home land ticked once per unit it holds by
            // now, and a single tick of a fresh land is behind all of them.
            const peer = $giper_baza_land.make({ $ });
            const last = home.tick().time_tick;
            while (peer.tick().time_tick <= last)
                ;
            peer.Pawn($bog_vmap_app_doc_node).Head(head).Tree(null).val(src_hero);
            await $mol_wire_async(home).units_steal(peer);
            $mol_assert_equal(s.nodes(doc)[0].Tree().val(), src_hero);
            $mol_assert_equal(s.source(), src_hero);
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    /**
     * Tests of the palette: what the address and the land trees handed in become on
     * the way to the library. Nothing renders and nothing is fetched — the library
     * is never asked for its tree here.
     *
     * The FIELD is not here any more. It moved to the shelf, which is the level of
     * the panel that is always on screen, and its tests moved with it.
     */
    $mol_test({
        'the address handed in reaches the library, slash and all'($) {
            const palette = $bog_vmap_app_palette.make({
                $,
                pack_link: () => 'https://b-on-g.github.io/gram/',
            });
            $mol_assert_equal(palette.Lib().pack(), 'https://b-on-g.github.io/gram/');
            $mol_assert_equal(palette.Lib().script_link(), 'https://b-on-g.github.io/gram/web.js');
        },
        'no address gives an empty library, not a failure'($) {
            const palette = $bog_vmap_app_palette.make({ $ });
            $mol_assert_equal(palette.Lib().script_link(), '');
            $mol_assert_like(palette.Lib().class_list(), ['$' + 'mol_view']);
        },
        /**
         * A dead address is answered in words, not by the status line of the
         * response. `$mol_fetch` throws «Not Found» and nothing else, and that
         * reached the counter as the whole explanation.
         */
        'a pack that does not answer says so, and says what was looked for'($) {
            const palette = $bog_vmap_app_palette.make({
                $,
                pack_link: () => 'http://dead.test/',
                Lib: () => $bog_vmap_lib.make({
                    $,
                    pack: () => 'http://dead.test/',
                    tree: () => $mol_fail(new Error('Not Found')),
                }),
            });
            // No list, and the counter carries the reason instead of a number.
            $mol_assert_like(palette.class_list(), []);
            const note = palette.total();
            $mol_assert_ok(note.includes('Not Found'));
            $mol_assert_ok(note.includes('http://dead.test/web.view.tree'));
        },
        /** Land classes handed in by the owner resolve against the pack stub like any class. */
        'classes of the lands join the list'($) {
            const d = '$';
            const palette = $bog_vmap_app_palette.make({
                $,
                land_classes: () => $.$mol_tree2_from_string(`${d}my_card ${d}mol_view\n\tprice 0\n`).kids,
            });
            $mol_assert_like(palette.Lib().class_list(), [`${d}mol_view`, `${d}my_card`]);
            $mol_assert_ok([...palette.Lib().props_map(`${d}my_card`).keys()].includes('sub'));
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    /**
     * Tests of the list without a DOM: what it shows and what it writes, on a
     * store whose documents live in the home land built in place. `add()` itself is
     * not tested here — it hands the work to a fiber and answers at once; the store
     * method it calls is tested in `app/store/`.
     */
    const d = '$';
    /** Canonical `tree2` formatting, see the note in `app/store/store.test.ts`. */
    const src_page = `${d}bog_vmap_app_scenes_test_page ${d}mol_view\n\tCalc ${d}mol_view\n\tsub / <= Calc\n`;
    const src_hero = `${d}bog_vmap_app_scenes_test_hero ${d}mol_view\n\ttitle \\Hi\n\tsub / <= title\n`;
    function scenes($) {
        const store = $bog_vmap_app_store.make({
            $,
            doc_land_config: () => null,
        });
        const view = $bog_vmap_app_scenes.make({
            $,
            store: () => store,
        });
        return { store, view };
    }
    $mol_test({
        'nothing to pick and nothing to name while there are no documents'($) {
            const { view } = scenes($);
            $mol_assert_like(view.scene_links(), []);
            $mol_assert_equal(view.current(), '');
            $mol_assert_equal(view.current_exists(), false);
            $mol_assert_equal(view.title(), '');
            $mol_assert_equal(view.add_title(), 'Сцена 1');
        },
        'the list carries every document by title, the last one open'($) {
            const { store, view } = scenes($);
            const first = store.doc_add('First', src_page);
            const second = store.doc_add('Second', src_hero);
            $mol_assert_like(view.scene_links(), [first.link().str, second.link().str]);
            $mol_assert_like(view.scene_links().map(link => view.scene_title(link)), ['First', 'Second']);
            // The open one is the current row and the only one.
            $mol_assert_like(view.scene_links().map(link => view.scene_current(link)), [false, true]);
            $mol_assert_equal(view.current(), second.link().str);
            $mol_assert_equal(view.current_exists(), true);
            $mol_assert_equal(view.title(), 'Second');
            $mol_assert_equal(view.add_title(), 'Сцена 3');
        },
        'picking a document changes what the store reads'($) {
            const { store, view } = scenes($);
            const first = store.doc_add('First', src_page);
            store.doc_add('Second', src_hero);
            view.current(first.link().str);
            $mol_assert_equal(store.source(), src_page);
            $mol_assert_equal(view.title(), 'First');
            // Empty goes back to the default, the last one made.
            view.current('');
            $mol_assert_equal(store.source(), src_hero);
            // So does something that is not a link. (`nonsense` would be one: eight
            // letters is a valid link.)
            view.current(first.link().str);
            view.current('not a link');
            $mol_assert_equal(store.source(), src_hero);
        },
        'renaming writes the title of the open document and shows in the list'($) {
            const { store, view } = scenes($);
            const first = store.doc_add('First', src_page);
            const second = store.doc_add('Second', src_hero);
            view.title('Landing');
            $mol_assert_equal(second.title(), 'Landing');
            $mol_assert_equal(first.title(), 'First');
            $mol_assert_equal(view.scene_title(second.link().str), 'Landing');
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    /**
     * Tests of publishing, on lands built in place.
     *
     * No master and no proof of work: `shelf_land_config` hands in the home land,
     * so the library becomes an AREA of it — a land of its own with the shelf at
     * its root, exactly the shape a grabbed land has, minus the mining. That is what
     * lets the link be looked up by the stack the way another scene would.
     *
     * Publishing is called through `$mol_wire_async`, as the click does: making the
     * area encodes units, which is asynchronous, and outside a fiber that is a
     * `Promise` thrown at the caller.
     *
     * NOT covered, deliberately: grabbing the library land, which is proof of work,
     * seconds against the one second a test is given.
     *
     * `d` keeps `$` out of the string literals: mam builds its dependency graph by
     * a regexp over sources, literals included.
     */
    const d = '$';
    const src_button = `Button_minor ${d}mol_view\n\ttitle \\Hi\n\tminimal true\n`;
    const src_calc = `Calc ${d}mol_view\n\tresult 42\n`;
    const pack_src = `${d}mol_view ${d}mol_object\n\tpack_port \\\n\tsub /\n`;
    const klass_button = `${d}bog_vmap_pub_button_minor`;
    const klass_calc = `${d}bog_vmap_pub_calc`;
    function store($) {
        return $bog_vmap_app_publish_store.make({
            $,
            shelf_land_config: () => $.$giper_baza_glob.home().land(),
        });
    }
    function view($, s, part, source, classes = [], doc = '') {
        return $bog_vmap_app_publish.make({
            $,
            store: () => s,
            part: () => part,
            source: () => source,
            classes: () => classes,
            doc: () => doc,
        });
    }
    /** A click as the browser sends one: on the node of the button, bubbling. */
    function click($, node) {
        const event = $.$mol_dom_context.document.createEvent('mouseevent');
        event.initEvent('click', true, true);
        node.dispatchEvent(event);
    }
    /** A normalized document: every sub-view hoisted onto the root, two levels deep. */
    const doc_nested = [
        `${d}bog_vmap_app_page ${d}mol_view`,
        `\tPrice ${d}mol_text`,
        `\t\ttitle \\Hi`,
        `\tHero ${d}mol_view`,
        `\t\tsub / <= Price`,
        `\tCard ${d}mol_view`,
        `\t\tsub / <= Hero`,
        `\tsub / <= Card`,
        ``,
    ].join('\n');
    const src_card = `Card ${d}mol_view\n\tsub / <= Hero\n`;
    const klass_card = `${d}bog_vmap_pub_card`;
    /** The root class of the document, as the editor hands it in `classes`. */
    const root_class = `${d}my_site_page`;
    /** The same document under that root: what a person actually edits. */
    const doc_card = doc_nested.replace(`${d}bog_vmap_app_page`, root_class);
    /**
     * The stylesheet of the document: one rule per node, all of them addressed by
     * the root class, and one of them about a node the card does not carry.
     */
    const css_doc = [
        '[my_site_page_card] {\n\tpadding: 1rem;\n}',
        '[my_site_page_hero] {\n\tcolor: red;\n}',
        '[my_site_page_price] {\n\tfont-weight: bold;\n}',
        '[my_site_page_aside] {\n\tcolor: green;\n}',
    ].join('\n\n');
    const css_button = '[my_site_page_button_minor] {\n\tcolor: red;\n}';
    const css_button_out = '[bog_vmap_pub_button_minor] {\n\tcolor: red;\n}';
    $mol_test({
        'nothing published: no library, no link'($) {
            const s = store($);
            $mol_assert_equal(s.shelf(), null);
            $mol_assert_equal(s.link(), '');
            $mol_assert_like(s.shelf_links(), []);
        },
        /**
         * WHAT A COPY IS MADE OF, and the rule that made it come out a different
         * shape than the original.
         *
         * A rule written in a document addresses the sub view by the attribute mol
         * puts on it THERE — the root class plus the property. The copy is a class
         * of its own and carries an attribute of its own, so the rule as written
         * names an element that exists in no document but the one it came from, and
         * the styles of a published part never applied at all. It travels
         * re-addressed.
         */
        async 'the rule of a part is re-addressed to the class it goes out as'($) {
            const s = store($);
            await $mol_wire_async(s).publish('Button_minor', src_button, '', css_button, [root_class]);
            $mol_assert_equal(s.shelf().parts()[0].css(), css_button_out);
        },
        /**
         * E25, AND THE HALF OF THE MOVE THAT WAS MISSING.
         *
         * A part carries its own sub-views out with it — `inlined` puts their
         * declarations back into the tree — and in the document each of them is a
         * flat property of the ROOT, addressed `[<root>_<sub>]` exactly like the part
         * itself. In the copy they become properties of the copy instead, so mol
         * writes `[<copy>_<sub>]` on them. Moving the rule of the part alone left
         * every inner rule addressing the document it came from, and a detail with
         * sub-views of its own went out unstyled inside.
         *
         * Three rules out, each moved to where the copy carries that node; the rule
         * of the neighbour the card does not carry stays in the document.
         */
        async 'a part carries the rules of its sub-views, each re-addressed'($) {
            const s = store($);
            const inlined = s.inlined(src_card, doc_card);
            await $mol_wire_async(s).publish('Card', inlined.source, '', css_doc, [root_class]);
            $mol_assert_equal(s.shelf().parts()[0].css(), [
                '[bog_vmap_pub_card] {\n\tpadding: 1rem;\n}',
                '[bog_vmap_pub_card_hero] {\n\tcolor: red;\n}',
                '[bog_vmap_pub_card_price] {\n\tfont-weight: bold;\n}',
            ].join('\n\n'));
        },
        /**
         * The names the move is made by, read off the tree that goes out: every
         * declaration written under `<=` is hoisted by the compiler into a property
         * of the class the tree is compiled as, and that is what mol names the node
         * by. Bare references declare nothing and are not sub-views of the copy.
         */
        'sub-views of the copy are the declarations the published tree carries'($) {
            const s = store($);
            $mol_assert_like(s.sub_names(s.inlined(src_card, doc_card).source), ['Hero', 'Price']);
            // Nothing was put back: the reference stays bare and declares nothing.
            $mol_assert_like(s.sub_names(src_card), []);
        },
        /**
         * A part of the PACK declares no sub-views of its own, so none of its inner
         * nodes is addressed by a rule of the document and none is moved. They are
         * painted by the stylesheet of the pack in the copy exactly as in the
         * original: mol writes an attribute for every class of the chain.
         */
        'a part of the pack takes no rule of the document with it'($) {
            const s = store($);
            const source = `Calc ${d}bog_vmap_part_calc\n`;
            $mol_assert_like(s.sub_names(source), []);
            $mol_assert_equal(s.css_out(css_doc, 'Calc', source, root_class), '');
        },
        /**
         * The move matches the WHOLE attribute and not its beginning. A document
         * addresses nodes by names that prefix one another — `Card` and `Card_note`
         * are two nodes — and a move by the beginning renamed the neighbour along
         * with the part. The cut by property hides this from `css_out`, so it is
         * asked of the move itself, where the two answers differ.
         */
        'the move matches the whole attribute, not the beginning of it'($) {
            const s = store($);
            const css = '[my_site_page_card] {\n\tcolor: red;\n}\n\n[my_site_page_card_note] {\n\tcolor: blue;\n}';
            $mol_assert_equal(s.css_moved(css, 'my_site_page_card', 'bog_vmap_pub_card'), '[bog_vmap_pub_card] {\n\tcolor: red;\n}\n\n[my_site_page_card_note] {\n\tcolor: blue;\n}');
            // And through the cut only the rule of the part travels at all.
            $mol_assert_equal(s.css_out(css, 'Card', `Card ${d}mol_view\n`, root_class), '[bog_vmap_pub_card] {\n\tcolor: red;\n}');
        },
        /**
         * A rule written with the node name AS THE PERSON SEES IT.
         *
         * Mol lowercases the attribute it writes on the node, and an attribute
         * selector in HTML is matched without regard to case, so `[my_site_page_Card]`
         * paints the card in the document exactly as the lowered one does. The move
         * compared letter for letter against the lowered name, found nothing, and the
         * rule went to the library still addressing the document it came from — the
         * same «styles never applied» as before, only for the capital. Measured on
         * the deploy.
         */
        'a rule written with a capital in the name is re-addressed too'($) {
            const s = store($);
            $mol_assert_equal(s.css_moved('[my_site_page_Card] {\n\tcolor: red;\n}', 'my_site_page_card', 'bog_vmap_pub_card'), '[bog_vmap_pub_card] {\n\tcolor: red;\n}');
            // Through the cut as well: the slicing lowers the attribute to find the
            // property, and the move has to reach the very text it found.
            $mol_assert_equal(s.css_out('[my_site_page_Card] {\n\tcolor: red;\n}\n\n[my_site_page_Hero] {\n\tcolor: blue;\n}', 'Card', s.inlined(src_card, doc_card).source, root_class), '[bog_vmap_pub_card] {\n\tcolor: red;\n}\n\n[bog_vmap_pub_card_hero] {\n\tcolor: blue;\n}');
        },
        /**
         * A part taken from the pack goes out as an HEIR of the pack class and
         * carries no texts of its own — and that is right, not a loss: mol writes an
         * attribute for every class of the chain, so the copy is addressed by the
         * stylesheet of the pack exactly as the original is.
         */
        'a part of the pack goes out as an heir, with nothing copied'($) {
            const s = store($);
            const source = `Calc ${d}bog_vmap_part_calc\n`;
            $mol_assert_equal(s.class_source('Calc', source), `${klass_calc} ${d}bog_vmap_part_calc\n`);
            // Nothing of the document belongs to it: the editor hands over the body
            // and the stylesheet of the DOCUMENT, and a pack detail has no rule in it.
            $mol_assert_equal(s.css_moved('', 'my_site_page_calc', 'bog_vmap_pub_calc'), '');
            $mol_assert_equal(s.css_out('', 'Calc', source, root_class), '');
        },
        async 'a part of the document becomes a class of the library, body and styles with it'($) {
            const s = store($);
            const link = await $mol_wire_async(s).publish('Button_minor', src_button, 'title(){ return 1 }', css_button, [root_class]);
            const shelf = s.shelf();
            $mol_assert_ok(shelf);
            $mol_assert_equal(shelf.title(), 'Мои компоненты');
            const parts = shelf.parts();
            $mol_assert_equal(parts.length, 1);
            $mol_assert_equal(parts[0].tree(), `${klass_button} ${d}mol_view\n\ttitle \\Hi\n\tminimal true\n`);
            $mol_assert_equal(parts[0].js(), 'title(){ return 1 }');
            $mol_assert_equal(parts[0].css(), css_button_out);
            // The link is the land of the shelf, and the shelf sits at its root.
            $mol_assert_ok(link);
            $mol_assert_equal(link, s.link());
            $mol_assert_equal(link, shelf.land().link().str);
            $mol_assert_equal(shelf.land().Data($bog_vmap_lib_land_shelf).parts().length, 1);
        },
        async 'publishing the same part again updates its part and the list does not grow'($) {
            const s = store($);
            await $mol_wire_async(s).publish('Button_minor', src_button, 'title(){ return 1 }');
            const before = s.shelf().parts()[0];
            const edited = src_button.replace('Hi', 'Bye');
            await $mol_wire_async(s).publish('Button_minor', edited, 'title(){ return 2 }');
            const parts = s.shelf().parts();
            $mol_assert_equal(parts.length, 1);
            $mol_assert_equal(parts[0].link().str, before.link().str);
            $mol_assert_equal(parts[0].tree(), `${klass_button} ${d}mol_view\n\ttitle \\Bye\n\tminimal true\n`);
            $mol_assert_equal(parts[0].js(), 'title(){ return 2 }');
            // A body gone from the part is gone from the library too.
            await $mol_wire_async(s).publish('Button_minor', edited);
            $mol_assert_equal(s.shelf().parts()[0].js(), '');
            $mol_assert_equal(s.shelf().parts().length, 1);
        },
        async 'a second part is a second class of the same library'($) {
            const s = store($);
            const first = await $mol_wire_async(s).publish('Button_minor', src_button);
            const second = await $mol_wire_async(s).publish('Calc', src_calc);
            $mol_assert_equal(first, second);
            $mol_assert_equal(s.shelf_links().length, 1);
            $mol_assert_like(s.shelf().parts().map(part => $bog_vmap_lib_land_name(part.tree())), [klass_button, klass_calc]);
        },
        /**
         * The other side of the circle: the link is what another scene pastes into
         * its palette field, and the stack of W3 looks the land up by it. The class
         * comes back with its own ports and the ones of the pack class it extends.
         */
        async 'the published library reads through the stack as a pack would'($) {
            const s = store($);
            const link = await $mol_wire_async(s).publish('Button_minor', src_button, 'title(){ return 1 }', css_button, [root_class]);
            const stack = $bog_vmap_lib_land_stack.make({
                $,
                tree: () => $.$bog_vmap_lib_parse(pack_src),
                lands: () => [link],
            });
            $mol_assert_like(stack.class_list(), [`${d}mol_view`, klass_button]);
            $mol_assert_like(stack.inherit_chain(klass_button), [klass_button, `${d}mol_view`, `${d}mol_object`]);
            const ports = [...stack.props_map(klass_button).keys()];
            $mol_assert_ok(ports.includes('title'));
            $mol_assert_ok(ports.includes('minimal'));
            $mol_assert_ok(ports.includes('pack_port'));
            // What the scene is sent: the three texts.
            $mol_assert_like(stack.parts(), [{
                    tree: `${klass_button} ${d}mol_view\n\ttitle \\Hi\n\tminimal true\n`,
                    js: 'title(){ return 1 }',
                    css: css_button_out,
                }]);
        },
        async 'the link passes the palette field as a land and nothing else'($) {
            const s = store($);
            const link = await $mol_wire_async(s).publish('Calc', src_calc);
            const parsed = $bog_vmap_lib_links_parse(link);
            $mol_assert_equal(parsed.pack, null);
            $mol_assert_like(parsed.lands, [link]);
            $mol_assert_like(parsed.rejected, []);
            // Beside a pack, as the field of the other scene will have it.
            $mol_assert_like($bog_vmap_lib_links_parse(`https://mol.hyoo.ru, ${link}`).lands, [link]);
        },
        /**
         * The pointer survives the session: a second store over the same home land,
         * as the next page load has, finds the library and publishes into it rather
         * than making another.
         */
        async 'the library is found again through the home land'($) {
            const first = store($);
            const link = await $mol_wire_async(first).publish('Button_minor', src_button);
            const again = store($);
            $mol_assert_equal(again.link(), link);
            $mol_assert_equal(again.shelf().parts().length, 1);
            await $mol_wire_async(again).publish('Calc', src_calc);
            $mol_assert_equal(again.shelf_links().length, 1);
            $mol_assert_equal(first.shelf().parts().length, 2);
        },
        'the class name is the part name under the prefix of the pack'($) {
            const s = store($);
            $mol_assert_equal(s.class_name('Button_minor'), klass_button);
            $mol_assert_equal(s.class_name('Calc_2'), `${d}bog_vmap_pub_calc_2`);
            // Only the first token changes.
            $mol_assert_equal(s.class_source('Button_minor', src_button), `${klass_button} ${d}mol_view\n\ttitle \\Hi\n\tminimal true\n`);
        },
        /**
         * A bare `<=`, a `<=>` or a `=` inside a part points at the document, and
         * the library has no document: the part is refused with the names it hangs
         * on, and nothing is made — no library, no land.
         */
        'a part wired to the document is refused and names the wire'($) {
            const s = store($);
            const one_way = `Label ${d}mol_view\n\tsub / <= calc_result\n`;
            const two_way = `Field ${d}mol_string\n\tvalue? <=> field_value?\n`;
            const chain = `Label ${d}mol_view\n\tsum = Calc result\n`;
            const many = `Label ${d}mol_view\n\tsub / <= calc_result\n\tvalue? <=> field_value?\n\tsum = Calc result\n`;
            $mol_assert_like(s.bound_names(one_way), ['calc_result']);
            $mol_assert_like(s.bound_names(two_way), ['field_value']);
            $mol_assert_like(s.bound_names(chain), ['Calc']);
            $mol_assert_like(s.bound_names(many), ['calc_result', 'field_value', 'Calc']);
            $mol_assert_like(s.bound_names(src_button), []);
            $mol_assert_equal(s.refusal('Label', one_way), 'деталь Label ссылается на calc_result документа, отвяжите провод перед публикацией');
            $mol_assert_equal(s.refusal('Field', two_way), 'деталь Field ссылается на field_value документа, отвяжите провод перед публикацией');
            $mol_assert_equal(s.refusal('Label', many), 'деталь Label ссылается на calc_result, field_value, Calc документа, отвяжите провод перед публикацией');
            $mol_assert_equal(s.refusal('Button_minor', src_button), '');
            $mol_assert_fail(() => s.publish('Label', one_way), s.refusal('Label', one_way));
            $mol_assert_fail(() => s.publish('Field', two_way), s.refusal('Field', two_way));
            $mol_assert_fail(() => s.publish('Label', chain), 'деталь Label ссылается на Calc документа, отвяжите провод перед публикацией');
            $mol_assert_equal(s.shelf(), null);
        },
        /**
         * `<= title` inside a part reads `title` of the ROOT, whatever the part
         * overrides under the same name: published, the same line would read the
         * class itself and mean something else. Refused as a wire, by name.
         */
        'a reference to a name the part only overrides is still a wire to the document'($) {
            const s = store($);
            const free = `Label ${d}mol_view\n\tsub / <= title\n\ttitle \\Hi\n`;
            $mol_assert_like(s.bound_names(free), ['title']);
            $mol_assert_ok(s.refusal('Label', free).includes('title'));
        },
        /**
         * A reference WITH kids declares its name where it stands, through `upper`:
         * `<= Inner $mol_view …` travels with the class and resolves there. Not a
         * wire, so the part goes out. A wire inside that sub-view is still a wire.
         */
        async 'a part with a sub-view of its own is published, a wire inside the sub-view is not'($) {
            const s = store($);
            const nested = `Card ${d}mol_view\n\tsub /\n\t\t<= Inner ${d}mol_view\n\t\t\ttitle \\Hi\n\t\t<= Inner\n`;
            const nested_wired = `Card ${d}mol_view\n\tsub /\n\t\t<= Inner ${d}mol_view\n\t\t\ttitle <= root_title\n`;
            $mol_assert_like(s.bound_names(nested), []);
            $mol_assert_equal(s.refusal('Card', nested), '');
            $mol_assert_like(s.bound_names(nested_wired), ['root_title']);
            $mol_assert_fail(() => s.publish('Card', nested_wired), 'деталь Card ссылается на root_title документа, отвяжите провод перед публикацией');
            $mol_assert_equal(s.shelf(), null);
            await $mol_wire_async(s).publish('Card', nested);
            const parts = s.shelf().parts();
            $mol_assert_equal(parts.length, 1);
            $mol_assert_equal($bog_vmap_lib_land_name(parts[0].tree()), `${d}bog_vmap_pub_card`);
        },
        /**
         * The reverse of `upper`: the editor keeps `Hero` and `Price` hoisted onto
         * the root with bare `<= Hero` left in the card, and the published class
         * gets both declarations back in their places, so the library resolves the
         * whole tree and lists the sub-views as ports of the class.
         */
        async 'hoisted sub-views are put back into the part two levels down and the class carries them'($) {
            const s = store($);
            const { source, shared } = s.inlined(src_card, doc_nested);
            $mol_assert_like(shared, []);
            $mol_assert_like(s.bound_names(source), []);
            $mol_assert_equal(s.refusal('Card', source), '');
            const tree = s.tree(source);
            const hero = tree.select(`${d}mol_view`, 'sub', '/', '<=', 'Hero', `${d}mol_view`);
            $mol_assert_equal(hero.kids.length, 1);
            $mol_assert_equal(hero.select(`${d}mol_view`, 'sub', '/', '<=', 'Price', `${d}mol_text`, 'title', null).kids[0].value, 'Hi');
            // Bare in the part before, so it would have been refused.
            $mol_assert_like(s.bound_names(src_card), ['Hero']);
            // Without a document nothing is put back.
            $mol_assert_equal(s.inlined(src_card, '').source, src_card);
            const link = await $mol_wire_async(s).publish('Card', source);
            const stack = $bog_vmap_lib_land_stack.make({
                $,
                tree: () => $.$bog_vmap_lib_parse(pack_src),
                lands: () => [link],
            });
            $mol_assert_like(stack.class_list(), [`${d}mol_view`, klass_card]);
            const ports = [...stack.props_map(klass_card).keys()];
            $mol_assert_ok(ports.includes('Hero'));
            $mol_assert_ok(ports.includes('Price'));
            $mol_assert_ok(ports.includes('sub'));
        },
        /**
         * The click with the document at hand: the part goes out whole, and the
         * sub-view the root reads as well goes out as a copy, which the note says.
         */
        async 'a sub-view the document reads too goes out as a copy and the note names it'($) {
            const s = store($);
            const doc = doc_nested.replace('sub / <= Card', 'sub /\n\t\t<= Card\n\t\t<= Hero');
            const { shared } = s.inlined(src_card, doc);
            $mol_assert_like(shared, ['Hero']);
            // A wire to the sub-view counts as reading it too.
            const wired = doc_nested.replace('sub / <= Card', 'hero_sub = Hero sub\n\tsub / <= Card');
            $mol_assert_like(s.inlined(src_card, wired).shared, ['Hero']);
            const v = view($, s, 'Card', src_card, [], doc);
            await $mol_wire_async(v).publish();
            $mol_assert_equal(v.published(), klass_card);
            $mol_assert_like(v.shared(), ['Hero']);
            $mol_assert_equal(v.note(), `опубликовано ${klass_card}, под-виды Hero ушли копией, документ читает их и сам:`);
            $mol_assert_equal(s.shelf().parts().length, 1);
            // The part itself is read by the root and that is no copy.
            const plain = view($, s, 'Card', src_card, [], doc_nested);
            await $mol_wire_async(plain).publish();
            $mol_assert_equal(plain.note(), `опубликовано ${klass_card}:`);
        },
        /**
         * Values of the root stay wires after the sub-views are back: `title \Hi`
         * on the root is not a node, and a loop of sub-views leaves the repeated
         * name bare, so the refusal names it instead of the walk running forever.
         */
        'a value of the root and a loop of sub-views are still refused after inlining'($) {
            const s = store($);
            const doc_values = [
                `${d}bog_vmap_app_page ${d}mol_view`,
                `\ttitle \\Hi`,
                `\tCalc ${d}mol_view`,
                `\t\tresult 42`,
                `\tcalc_result = Calc result`,
                `\tLabel ${d}mol_view`,
                `\t\tsub / <= calc_result`,
                `\t\thint <= title`,
                `\tsub / <= Label`,
                ``,
            ].join('\n');
            const label = `Label ${d}mol_view\n\tsub / <= calc_result\n\thint <= title\n`;
            const { source } = s.inlined(label, doc_values);
            $mol_assert_equal(source, label);
            $mol_assert_like(s.bound_names(source), ['calc_result', 'title']);
            const doc_loop = [
                `${d}bog_vmap_app_page ${d}mol_view`,
                `\tA ${d}mol_view`,
                `\t\tsub / <= B`,
                `\tB ${d}mol_view`,
                `\t\tsub / <= A`,
                `\tsub / <= A`,
                ``,
            ].join('\n');
            const loop = s.inlined(`A ${d}mol_view\n\tsub / <= B\n`, doc_loop);
            $mol_assert_like(s.bound_names(loop.source), ['A']);
            $mol_assert_equal(s.refusal('A', loop.source), 'деталь A ссылается на A документа, отвяжите провод перед публикацией');
        },
        /** A base the document itself declares stays in the document. */
        'a part based on a class of the document is refused'($) {
            const s = store($);
            const classes = [`${d}bog_vmap_app_page`, `${d}bog_vmap_app_card`];
            const heir = `Promo ${d}bog_vmap_app_card\n\ttitle \\Hi\n`;
            $mol_assert_equal(s.refusal('Promo', heir, classes), `деталь Promo наследует класс ${d}bog_vmap_app_card документа, выберите базу из библиотеки перед публикацией`);
            $mol_assert_equal(s.refusal('Promo', heir), '');
            $mol_assert_equal(s.refusal('Button_minor', src_button, classes), '');
            $mol_assert_fail(() => s.publish('Promo', heir, '', '', classes), s.refusal('Promo', heir, classes));
            $mol_assert_equal(s.shelf(), null);
        },
        /**
         * The click on a wired part: the reason lands on the bar as the note, with
         * the name of the wire in it, and the library is not even made. A throw out
         * of the handler would go to the fiber and never reach the user.
         */
        'the click on a wired part shows the refusal and publishes nothing'($) {
            const s = store($);
            const wired = `Label ${d}mol_view\n\tsub / <= calc_result\n`;
            const v = view($, s, 'Label', wired);
            $mol_assert_equal(v.enabled(), true);
            $mol_assert_equal(v.publish(), null);
            $mol_assert_ok(v.note().includes('calc_result'));
            $mol_assert_ok(v.note().includes('Label'));
            $mol_assert_equal(v.published(), '');
            $mol_assert_equal(v.lib_link(), '');
            $mol_assert_equal(s.shelf(), null);
            $mol_assert_like(v.content(), [v.Publish(), v.Note()]);
            $mol_assert_like(v.Note().sub(), [v.note()]);
            const heir = view($, s, 'Promo', `Promo ${d}bog_vmap_app_page\n`, [`${d}bog_vmap_app_page`]);
            $mol_assert_equal(heir.publish(), null);
            $mol_assert_ok(heir.note().includes(`${d}bog_vmap_app_page`));
            $mol_assert_equal(s.shelf(), null);
        },
        /**
         * The whole way to the eye: a real click on the rendered button, and the
         * refusal read back off the DOM, not off a cell. What the cell holds and
         * what the screen shows are two different facts, and only the second one is
         * what a person sees.
         */
        async 'a click on the rendered button puts the refusal on the screen'($) {
            const s = store($);
            const v = view($, s, 'Label', `Label ${d}mol_view\n\tsub / <= calc_result\n`);
            const root = v.dom_tree();
            $mol_assert_equal(root.textContent.includes('calc_result'), false);
            click($, v.Publish().dom_tree());
            v.dom_tree();
            $mol_assert_ok(root.textContent.includes('деталь Label ссылается на calc_result документа, отвяжите провод перед публикацией'));
            $mol_assert_equal(s.shelf(), null);
            // A refusal is a state of the bar, not an error of the button.
            await Promise.resolve();
            $mol_assert_equal(v.Publish().error(), '');
        },
        /**
         * A node picked inside another part — the scene names what was clicked,
         * and that may be a button of a calculator — is not a property of the
         * document: its text is empty. Measured on the deploy: the click died in
         * the store with words nobody saw. Now the words are on the bar.
         */
        async 'a click on a part the document does not declare is refused in words'($) {
            const s = store($);
            const v = view($, s, 'Option(mul)', '');
            $mol_assert_equal(v.enabled(), true);
            const root = v.dom_tree();
            click($, v.Publish().dom_tree());
            v.dom_tree();
            $mol_assert_ok(root.textContent.includes('деталь Option(mul) не объявлена в документе, выберите деталь верхнего уровня'));
            $mol_assert_equal(s.shelf(), null);
            await Promise.resolve();
            $mol_assert_equal(v.Publish().error(), '');
        },
        /**
         * Whatever the reading of the texts throws is words on the bar as well: the
         * handler is a fiber, and a throw out of it is a speck and a promise nobody
         * awaits. A suspension is the one thing let through — it is how the fiber
         * waits for the land — and it comes out untouched, the bar as it was.
         */
        async 'an error while reading the part is words on the bar, a suspension passes through'($) {
            const s = store($);
            const v = view($, s, 'Label', '');
            v.source = () => $.$mol_fail(new Error('boom'));
            const root = v.dom_tree();
            click($, v.Publish().dom_tree());
            v.dom_tree();
            $mol_assert_ok(root.textContent.includes('не удалось опубликовать Label: boom'));
            $mol_assert_equal(s.shelf(), null);
            await Promise.resolve();
            $mol_assert_equal(v.Publish().error(), '');
            const wait = new Promise(() => { });
            v.source = () => { throw wait; };
            let caught = null;
            try {
                v.publish();
            }
            catch (error) {
                caught = error;
            }
            $mol_assert_equal(caught, wait);
            $mol_assert_equal(v.note(), 'не удалось опубликовать Label: boom');
        },
        /** After a refusal a clean part goes out, and the note follows. */
        async 'a refusal is cleared by the next successful click'($) {
            const s = store($);
            let source = `Label ${d}mol_view\n\tsub / <= calc_result\n`;
            const v = view($, s, 'Label', '');
            v.source = () => source;
            v.publish();
            $mol_assert_ok(v.note().includes('calc_result'));
            source = `Label ${d}mol_view\n\ttitle \\Hi\n`;
            await $mol_wire_async(v).publish();
            $mol_assert_equal(v.note(), `опубликовано ${d}bog_vmap_pub_label:`);
            $mol_assert_equal(s.shelf().parts().length, 1);
        },
        'the button is off without a pick and says so'($) {
            const s = store($);
            const v = view($, s, '', '');
            $mol_assert_equal(v.enabled(), false);
            $mol_assert_equal(v.class_name(), '');
            $mol_assert_equal(v.lib_link(), '');
            $mol_assert_equal(v.note(), '');
            $mol_assert_like(v.content(), [v.Publish()]);
            $mol_assert_equal(v.publish(), null);
            $mol_assert_equal(s.shelf(), null);
        },
        /**
         * The click, as a fiber: publishes the picked part and shows the link with a
         * note of what went out. The link stays on the bar after the note is stale.
         */
        async 'the click publishes the pick and shows the link'($) {
            const s = store($);
            const v = view($, s, 'Button_minor', src_button);
            $mol_assert_equal(v.enabled(), true);
            $mol_assert_equal(v.class_name(), klass_button);
            $mol_assert_ok(v.publish_hint().includes(klass_button));
            await $mol_wire_async(v).publish();
            $mol_assert_equal(v.published(), klass_button);
            $mol_assert_equal(v.note(), `опубликовано ${klass_button}:`);
            $mol_assert_equal(v.lib_link(), s.link());
            $mol_assert_ok(v.lib_link());
            $mol_assert_like(v.content(), [v.Publish(), v.Note(), v.Copy()]);
            $mol_assert_equal(v.Copy().text(), s.link());
            $mol_assert_equal(s.shelf().parts().length, 1);
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    /**
     * Tests of the shelf model: what a ready made item leaves in the document.
     *
     * No DOM and no network here. The wire of the pair is checked through
     * `links()` of the document itself rather than by reading the text, because a
     * wire written the wrong way still reads plausibly — the five traps of section
     * 1 all look like a wire and all build green.
     *
     * `d` keeps `$` out of the fixtures: mam builds its dependency graph by a
     * regexp over sources, string literals included.
     */
    const d = '$';
    const root_src = `${d}bog_vmap_app_shelf_test_page ${d}mol_view\n\tsub /\n`;
    function doc($, src = root_src) {
        const node = $bog_vmap_lang_node.make({ $ });
        node.source(src);
        return node;
    }
    /** The same free name rule the editor uses: the name, or the name with a number. */
    function freer(node) {
        return (head) => {
            const taken = new Set(node.prop_names());
            if (!taken.has(head))
                return head;
            for (let i = 2;; ++i) {
                const name = `${head}_${i}`;
                if (!taken.has(name))
                    return name;
            }
        };
    }
    function preset(id) {
        return $bog_vmap_app_shelf_presets().find(item => item.id === id).source;
    }
    $mol_test({
        'the field is stored as typed and what was refused is said under it'($) {
            const shelf = $bog_vmap_app_shelf.make({ $ });
            shelf.links('https://mol.hyoo.ru, https://b-on-g.github.io/gram/');
            // Stored exactly as typed: growing a slash here would make an address
            // impossible to finish typing.
            $mol_assert_equal(shelf.links(), 'https://mol.hyoo.ru, https://b-on-g.github.io/gram/');
            // One pack per frame, so the second is refused rather than dropped in
            // silence, and the refusal is on screen under the field.
            $mol_assert_equal(shelf.rejected_note(), 'https://b-on-g.github.io/gram/: ' + $bog_vmap_lib_links_reason.pack_second);
            $mol_assert_equal(shelf.source_content().includes(shelf.Note()), true);
            shelf.links('https://mol.hyoo.ru');
            $mol_assert_equal(shelf.source_content().includes(shelf.Note()), false);
        },
        'the objects of the application are its own classes, mol left out'($) {
            const d = '$';
            const shelf = $bog_vmap_app_shelf.make({
                $,
                class_list: () => [`${d}mol_view`, `${d}mol_button_minor`, `${d}bog_gram`, `${d}bog_gram_chat`],
            });
            // What the author of the application wrote, and nothing of the framework
            // their pack carries in its bundle.
            $mol_assert_like(shelf.app_list(), [`${d}bog_gram`, `${d}bog_gram_chat`]);
            $mol_assert_equal(shelf.apps_title(), 'Объекты приложения');
            // Each of them is an item like any other, and lays down the same way.
            $mol_assert_equal(shelf.item_title(`${d}bog_gram_chat`), 'Gram_chat');
            $mol_assert_ok(shelf.item(`${d}bog_gram_chat`).source.includes(`${d}bog_gram_chat`));
        },
        'a dead address takes down its own list and says why'($) {
            const shelf = $bog_vmap_app_shelf.make({
                $,
                pack_link: () => 'http://dead.test/',
                class_list: () => $mol_fail(new Error('Not Found')),
            });
            // The list is empty and the section says what happened, in place of it.
            $mol_assert_like(shelf.app_list(), []);
            $mol_assert_equal(shelf.apps_title(), 'Приложение не отвечает');
            $mol_assert_ok(shelf.app_error().includes('Not Found'));
            $mol_assert_ok(shelf.app_error().includes('http://dead.test/web.view.tree'));
            $mol_assert_equal(shelf.apps_content().includes(shelf.Apps_note()), true);
            $mol_assert_equal(shelf.apps_content().includes(shelf.App_list()), false);
            // And the shelf itself stands: the failure belongs to one list, not to
            // the panel around it.
            $mol_assert_ok(shelf.items().length > 4);
            $mol_assert_ok(shelf.stack_content().includes(shelf.Items()));
        },
        'nothing connected is a state and not a failure'($) {
            const shelf = $bog_vmap_app_shelf.make({ $ });
            $mol_assert_like(shelf.app_list(), []);
            $mol_assert_equal(shelf.apps_title(), 'Приложение не подключено');
            // The shelf itself stands whatever the address does.
            $mol_assert_ok(shelf.items().length > 4);
        },
        'files of a module give one source per class, as their author wrote them'($) {
            const text = [
                `${d}my_card ${d}mol_view`,
                `\tprice 0`,
                `${d}my_price ${d}my_card`,
                `\tprice 42`,
                ``,
            ].join('\n');
            const taken = $.$bog_vmap_app_shelf_intake([
                { name: 'card.view.tree', text },
                { name: 'card.view.css', text: '[my_card] { color: red }' },
            ]);
            // Two components and not one text: a library resolves neighbours by
            // name, so a class that inherits the one beside it still finds it.
            $mol_assert_equal(taken.classes.length, 2);
            $mol_assert_ok(taken.classes[0].tree.startsWith(`${d}my_card ${d}mol_view`));
            $mol_assert_ok(taken.classes[1].tree.includes(`${d}my_price ${d}my_card`));
            $mol_assert_like(taken.refused, []);
            // Plain CSS beside the tree comes along, on the first class of the file:
            // it is a stylesheet and not a program, and the library holds one.
            $mol_assert_equal(taken.classes[0].css, '[my_card] { color: red }');
            $mol_assert_equal(taken.classes[1].css, '');
        },
        'what cannot be taken is refused by name, with the reason on screen'($) {
            const taken = $.$bog_vmap_app_shelf_intake([
                { name: 'card.view.ts', text: 'namespace $ {}' },
                { name: 'web.view.tree', text: `${d}mol_view ${d}mol_object\n` },
                { name: 'empty.view.tree', text: '- just a comment\n' },
                // A stylesheet written as a program is a program.
                { name: 'card.view.css.ts', text: 'namespace $ {}' },
            ]);
            $mol_assert_like(taken.classes, []);
            $mol_assert_like(taken.refused.map(item => item.reason), [
                $bog_vmap_app_shelf_refuse.kind,
                $bog_vmap_app_shelf_refuse.built,
                $bog_vmap_app_shelf_refuse.empty,
                $bog_vmap_app_shelf_refuse.kind,
            ]);
            // The note names the file, so a person knows which one to fix.
            $mol_assert_ok($bog_vmap_app_shelf_intake_note(taken).includes('card.view.ts'));
        },
        async 'a class brought from a file keeps the name it came with'($) {
            const store = $bog_vmap_app_publish_store.make({
                $,
                shelf_land_config: () => $.$giper_baza_glob.home().land(),
            });
            const source = `${d}my_card ${d}mol_view\n\tprice 0\n`;
            // Through a fiber, as the panel does it: making the area encodes units.
            const link = await $mol_wire_async(store).import_class(source);
            const shelf = store.shelf();
            $mol_assert_equal(link, shelf.land().link().str);
            $mol_assert_equal(shelf.parts().length, 1);
            // Under its OWN name: renaming it would cut every reference a neighbour
            // of the same module makes to it, and cut it silently.
            $mol_assert_equal(shelf.parts()[0].tree(), source);
            // A second import of the same class replaces it instead of doubling it:
            // two declarations of one name and the library disagrees with itself
            // about which is real.
            await $mol_wire_async(store).import_class(`${d}my_card ${d}mol_view\n\tprice 42\n`);
            $mol_assert_equal(shelf.parts().length, 1);
            $mol_assert_ok(shelf.parts()[0].tree().includes('price 42'));
        },
        async 'files brought to the panel end up in the library, whose link joins the field'($) {
            const shelf = $bog_vmap_app_shelf.make({
                $,
                Store: () => $bog_vmap_app_publish_store.make({
                    $,
                    shelf_land_config: () => $.$giper_baza_glob.home().land(),
                }),
            });
            const source = `${d}my_card ${d}mol_view\n\tprice 0\n`;
            await $mol_wire_async(shelf).intake([
                { name: 'card.view.tree', text: async () => source },
                { name: 'card.view.css', text: async () => '[my_card] { color: red }' },
                { name: 'card.view.ts', text: async () => 'namespace $ {}' },
            ]);
            // What was taken is in the library, under its own name. In canonical
            // `tree2` formatting, which puts an only child on the line of its
            // parent: the splitter serializes each declaration through `tree2`, and
            // that form is what every other reader of the library expects.
            const parts = shelf.Store().shelf().parts();
            $mol_assert_equal(parts.length, 1);
            $mol_assert_equal(parts[0].tree(), `${d}my_card ${d}mol_view price 0\n`);
            $mol_assert_equal(parts[0].css(), '[my_card] { color: red }');
            // And the library is attached to the scene by the same field an address
            // goes into: from here on it is the library any other scene would get.
            $mol_assert_equal(shelf.links(), shelf.Store().link());
            // What was not taken is said on screen, by file name.
            $mol_assert_ok(shelf.import_note().includes('card.view.ts'));
            $mol_assert_ok(shelf.source_content().includes(shelf.Import_note()));
        },
        'a declaration that names no class is refused before anything is written'($) {
            const store = $bog_vmap_app_publish_store.make({
                $,
                shelf_land_config: () => $.$giper_baza_glob.home().land(),
            });
            // No land is made and nothing is written: the check is the first line.
            $mol_assert_fail(() => store.import_class(`card ${d}mol_view\n`), 'Объявление начинается с "card", а имя класса начинается с доллара');
            $mol_assert_equal(store.shelf(), null);
        },
        'the shelf offers ready made things and every one of them is a class'($) {
            const items = $bog_vmap_app_shelf_presets();
            $mol_assert_like(items.map(item => item.id), [
                'block', 'cell', 'plot', 'calc', 'map', 'pair',
                'input_string', 'input_number', 'input_select',
                'input_switch', 'input_check_box', 'input_paragraph',
            ]);
            for (const item of items) {
                $mol_assert_ok(item.title);
                $mol_assert_ok(item.hint);
                // Parses as a class, or the item could never be laid down.
                $mol_assert_ok($bog_vmap_lang_node.make({ $, source: () => item.source }).tree());
            }
        },
        'a one part item leaves a declaration and a name to place'($) {
            const node = doc($);
            const placed = $.$bog_vmap_app_shelf_apply(node, preset('calc'), freer(node));
            $mol_assert_like(placed, ['Calc']);
            $mol_assert_like(node.part_names(), ['Calc']);
            // Placement is the canvas's business, so `sub` is untouched here.
            $mol_assert_like(node.sub_names(''), []);
        },
        'overrides of a part come across'($) {
            const node = doc($);
            $.$bog_vmap_app_shelf_apply(node, preset('block'), freer(node));
            const style = node.over_tree('Block', 'style');
            $mol_assert_equal(Boolean(style), true);
            $mol_assert_equal(style.toString().includes('160px'), true);
        },
        'the pair lands as one node holding both parts, wired'($) {
            const node = doc($);
            const placed = $.$bog_vmap_app_shelf_apply(node, preset('pair'), freer(node));
            // One name to place: the wrapper. Both parts hang inside it by tree.
            $mol_assert_like(placed, ['Pair']);
            $mol_assert_like(node.sub_names('Pair'), ['Calc', 'Map']);
            const links = node.links();
            $mol_assert_equal(links.length, 1);
            $mol_assert_equal(links[0].from, 'Calc');
            $mol_assert_equal(links[0].from_prop, 'result');
            $mol_assert_equal(links[0].to, 'Map');
            $mol_assert_equal(links[0].to_prop, 'zoom');
        },
        'a second copy takes free names, and its wire and its tree follow them'($) {
            const node = doc($);
            $.$bog_vmap_app_shelf_apply(node, preset('pair'), freer(node));
            const placed = $.$bog_vmap_app_shelf_apply(node, preset('pair'), freer(node));
            $mol_assert_like(placed, ['Pair_2']);
            // The wrapper of the second copy holds the parts of the second copy and
            // not the first: a reference that did not follow the rename would be the
            // silent kind of wrong, drawing one calculator inside two boxes.
            $mol_assert_like(node.sub_names('Pair_2'), ['Calc_2', 'Map_2']);
            const links = node.links();
            $mol_assert_equal(links.length, 2);
            $mol_assert_like(links.map(link => [link.from, link.to]), [['Calc', 'Map'], ['Calc_2', 'Map_2']]);
        },
        'a class of the library lays down under a name of its own'($) {
            const node = doc($);
            const source = $bog_vmap_app_shelf_single(`${d}mol_button_minor`);
            const placed = $.$bog_vmap_app_shelf_apply(node, source, freer(node));
            $mol_assert_like(placed, ['Button_minor']);
            $mol_assert_equal(node.prop_decl('Button_minor')?.kids[0]?.type, `${d}mol_button_minor`);
        },
        'the wire is written once, by the model, and not copied as an override'($) {
            const node = doc($);
            $.$bog_vmap_app_shelf_apply(node, preset('pair'), freer(node));
            // Exactly one property carries the `=` operator, and the far end of the
            // wire reads it. Two wires for one link, or an override left behind by
            // the copy, would show up as a second one here.
            $mol_assert_equal(node.wires().length, 1);
            const zoom = node.over_tree('Map', 'zoom');
            $mol_assert_equal(zoom?.kids[0]?.type, '<=');
            $mol_assert_equal(zoom?.kids[0]?.kids[0]?.type, node.wires()[0].name);
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    $mol_test({
        '$mol_syntax2_md_flow'() {
            const check = (input, right) => {
                const tokens = [];
                $mol_syntax2_md_flow.tokenize(input, (...token) => tokens.push(token));
                $mol_assert_equal(tokens, right);
            };
            check('Hello,\nWorld..\r\n\r\n\nof Love!', [
                ['block', 'Hello,\n', ['Hello,', '\n'], 0],
                ['block', 'World..\r\n\r\n\n', ['World..', '\r\n\r\n\n'], 7],
                ['block', 'of Love!', ['of Love!', ''], 19],
            ]);
            check('# Header1\n\nHello!\n\n## Header2', [
                ['header', '# Header1\n\n', ['#', ' ', 'Header1', '\n\n'], 0],
                ['block', 'Hello!\n\n', ['Hello!', '\n\n'], 11],
                ['header', '## Header2', ['##', ' ', 'Header2', ''], 19],
            ]);
            check('```\nstart()\n```\n\n```jam.js\nrestart()\n```\n\nHello!\n\n```\nstop()\n```', [
                ['code', '```\nstart()\n```\n\n', ['```', '', 'start()\n', '```', '\n\n'], 0],
                ['code', '```jam.js\nrestart()\n```\n\n', ['```', 'jam.js', 'restart()\n', '```', '\n\n'], 17],
                ['block', 'Hello!\n\n', ['Hello!', '\n\n'], 42],
                ['code', '```\nstop()\n```', ['```', '', 'stop()\n', '```', ''], 50],
            ]);
            check('| header1 | header2\n|----|----\n| Cell11 | Cell12\n| Cell21 | Cell22\n\n| Cell11 | Cell12\n| Cell21 | Cell22\n', [
                ['table', '| header1 | header2\n|----|----\n| Cell11 | Cell12\n| Cell21 | Cell22\n\n', ['| header1 | header2\n|----|----\n| Cell11 | Cell12\n| Cell21 | Cell22\n', '\n'], 0],
                ['table', '| Cell11 | Cell12\n| Cell21 | Cell22\n', ['| Cell11 | Cell12\n| Cell21 | Cell22\n', ''], 68],
            ]);
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    /**
     * Tests of the slicing by property.
     *
     * Text in, text out, no view anywhere: the round trip of stage 4.2 is a
     * property of the strings alone.
     */
    const klass = 'bog_vmap_app_page';
    const body = [
        'title() {',
        '\treturn \'hi\'',
        '}',
        '',
        'rows( key, next ) {',
        '\tif( next ) return { a: 1 }',
        '\treturn []',
        '}',
    ].join('\n');
    const styles = [
        '[bog_vmap_app_page_calc] {',
        '\tcolor: red;',
        '}',
        '',
        '[bog_vmap_app_page_hero] {',
        '\tflex: 1;',
        '}',
    ].join('\n');
    $mol_test({
        'a class body is cut into its properties'($) {
            const props = $.$bog_vmap_app_code_props_js(body);
            $mol_assert_equal([...props.keys()].join(' '), 'title rows');
            $mol_assert_equal(props.get('title'), 'title() {\n\treturn \'hi\'\n}');
        },
        'a body with braces inside a property stays one property'($) {
            const props = $.$bog_vmap_app_code_props_js(body);
            $mol_assert_equal(props.get('rows'), 'rows( key, next ) {\n\tif( next ) return { a: 1 }\n\treturn []\n}');
        },
        'slicing a body and joining it back gives the same text'($) {
            const props = $.$bog_vmap_app_code_props_js(body);
            $mol_assert_equal($.$bog_vmap_app_code_joined(props), body);
        },
        'one property edited leaves the others byte for byte'($) {
            const props = $.$bog_vmap_app_code_props_js(body);
            const next = 'title() {\n\treturn \'bye\'\n}';
            $.$bog_vmap_app_code_with(props, 'title', next);
            $mol_assert_equal($.$bog_vmap_app_code_joined(props), next + '\n\n' + props.get('rows'));
        },
        'an unbalanced body fails instead of returning half a slicing'($) {
            $mol_assert_fail(() => $.$bog_vmap_app_code_props_js('title() {\n\treturn 1\n'), 'Curly braces is not balanced');
        },
        'text after the last property is kept and comes back on join'($) {
            const src = body + '\n\n// a note nobody parses';
            const props = $.$bog_vmap_app_code_props_js(src);
            $mol_assert_equal(props.get(''), '// a note nobody parses');
            $mol_assert_equal($.$bog_vmap_app_code_joined(props), src);
        },
        'a new property is appended before the leftovers, not after'($) {
            const props = $.$bog_vmap_app_code_props_js(body + '\n\n// note');
            $.$bog_vmap_app_code_with(props, 'extra', 'extra() {\n\t\n}');
            $mol_assert_equal([...props.keys()].join(' '), 'title rows extra ');
        },
        'styles are cut by the attribute of the node'($) {
            const props = $.$bog_vmap_app_code_props_css(styles, klass);
            $mol_assert_equal([...props.keys()].join(' '), 'calc hero');
            $mol_assert_equal(props.get('calc'), '[bog_vmap_app_page_calc] {\n\tcolor: red;\n}');
        },
        'slicing styles and joining them back gives the same text'($) {
            const props = $.$bog_vmap_app_code_props_css(styles, klass);
            $mol_assert_equal($.$bog_vmap_app_code_joined(props), styles);
        },
        'the leading sigil of a class name is not part of its attribute'($) {
            const props = $.$bog_vmap_app_code_props_css(styles, '$' + klass);
            $mol_assert_equal([...props.keys()].join(' '), 'calc hero');
        },
        'a rule about another class rides with the one after it'($) {
            const src = '[mol_view] {\n\tcolor: red;\n}\n\n' + styles;
            const props = $.$bog_vmap_app_code_props_css(src, klass);
            $mol_assert_equal([...props.keys()].join(' '), 'calc hero');
            $mol_assert_equal($.$bog_vmap_app_code_joined(props), src);
        },
        'unbalanced styles fail instead of returning half a slicing'($) {
            $mol_assert_fail(() => $.$bog_vmap_app_code_props_css('[bog_vmap_app_page_calc] {\n', klass), 'Curly braces is not balanced');
        },
        'the default method of a property follows its signature'($) {
            $mol_assert_equal($.$bog_vmap_app_code_js_default('title'), 'title(  ) {\n\t\n}');
            $mol_assert_equal($.$bog_vmap_app_code_js_default('rows', true), 'rows( key ) {\n\t\n}');
            $mol_assert_equal($.$bog_vmap_app_code_js_default('rows', true, true), 'rows( key, next ) {\n\t\n}');
        },
        'the default rule of a property addresses the node of that property'($) {
            $mol_assert_equal($.$bog_vmap_app_code_css_default('Calc', '$' + klass), '[bog_vmap_app_page_calc] {\n\t\n}');
        },
    });
})($ || ($ = {}));
(function ($_2) {
    /**
     * Tests of a failure of the scene finding its way onto the node.
     *
     * The strip says something is wrong somewhere; the mark says which node. Stage
     * 4.4 is the second sentence, and this file is about the host half of it: what
     * the bridge carries in `node` has to come out on that node and nowhere else.
     *
     * `d` keeps `$` out of the string literals — mam reads them for dependencies.
     */
    const d = '$';
    const root = `${d}bog_vmap_app_page`;
    /** A pane with a peer that answers, and a way to speak to it as the scene. */
    const pane_make = ($) => {
        const peer = { origin: 'null', postMessage() { } };
        const pane = $$.$bog_vmap_app_pane.make({
            $,
            doc_root: () => root,
            // The one node these scenarios are about. The canvas only knows the nodes
            // the document declares, and a mark stands on a node of the document.
            doc_names: () => ['Calc'],
            pane_rect: () => ({ left: 0, top: 0, width: 1000, height: 800 }),
            scene_peer: () => peer,
        });
        pane.handshake(pane.scene_key(), 1);
        const answer = (data) => pane.message_receive({ data: { ns: $bog_vmap_bridge_ns, ...data }, source: peer });
        return { pane, answer };
    };
    $mol_test({
        'a failure the scene attributes lands on that node'($) {
            const { pane, answer } = pane_make($);
            answer({ kind: 'error', at: 'runtime', message: 'boom', node: 'Calc' });
            $mol_assert_equal(pane.node_error('Calc'), 'исполнение — Calc: boom');
            $mol_assert_equal(pane.node_error('Hero'), '');
        },
        /** A guess would be worse than nothing: an unattributed failure stays on the strip. */
        'a failure with no node stays off every node'($) {
            const { pane, answer } = pane_make($);
            answer({ kind: 'error', at: 'compile', message: 'boom' });
            $mol_assert_equal(Object.keys(pane.errors()).length, 0);
            $mol_assert_equal(pane.error().includes('boom'), true);
        },
        'the two channels of one node are both shown on it'($) {
            const { pane, answer } = pane_make($);
            answer({ kind: 'error', at: 'compile', message: 'first', node: 'Calc' });
            answer({ kind: 'error', at: 'runtime', message: 'second', node: 'Calc' });
            $mol_assert_equal(pane.node_error('Calc'), 'компиляция — Calc: first\nисполнение — Calc: second');
        },
        /** The channel clears with `null`, and the node has to clear with it. */
        'a cleared channel takes the mark off the node'($) {
            const { pane, answer } = pane_make($);
            answer({ kind: 'error', at: 'runtime', message: 'boom', node: 'Calc' });
            answer({ kind: 'error', at: 'runtime', message: null, node: 'Calc' });
            $mol_assert_equal(pane.node_error('Calc'), '');
        },
        'a fresh scene starts with no failure on any node'($) {
            const { pane, answer } = pane_make($);
            answer({ kind: 'error', at: 'compile', message: 'boom', node: 'Calc' });
            answer({ kind: 'ready' });
            $mol_assert_equal(pane.node_error('Calc'), '');
        },
        /** A node nobody has measured has no corner to put a mark at. */
        'a mark is drawn only where the node has been measured'($) {
            const { pane, answer } = pane_make($);
            answer({ kind: 'error', at: 'runtime', message: 'boom', node: 'Calc' });
            $mol_assert_equal(pane.error_marks().length, 0);
            answer({
                kind: 'sizes',
                sizes: { [`${root}/Calc`]: { x: 10, y: 20, width: 100, height: 50 } },
            });
            $mol_assert_equal(pane.error_marks().length, 1);
            $mol_assert_equal(pane.mark_hint('Calc'), 'исполнение — Calc: boom');
        },
        /**
         * The case the marks exist for: code is written, it breaks, and the node
         * stops being drawn. Nothing is measured any more, so the mark has to stand
         * on the last box the node was seen at — otherwise it disappears exactly
         * when it is needed.
         */
        'a node that stops being drawn keeps its mark where it was'($) {
            const { pane, answer } = pane_make($);
            answer({
                kind: 'sizes',
                sizes: { [`${root}/Calc`]: { x: 10, y: 20, width: 100, height: 50 } },
            });
            // It broke: the scene draws it no more, so it measures it no more, and
            // the report simply stops mentioning it.
            answer({ kind: 'sizes', sizes: {} });
            answer({ kind: 'error', at: 'runtime', message: 'boom', node: 'Calc' });
            $mol_assert_equal(pane.error_marks().length, 1);
            $mol_assert_equal(pane.mark_style('Calc').left, '10px');
            $mol_assert_equal(pane.mark_style('Calc').top, '20px');
        },
        /**
         * A node that never drew has no corner to point at, and pointing at a made
         * up one would be the false mark. The text is not conditional on geometry,
         * so the panel of that node says it anyway.
         */
        'a node never drawn gets no mark, and is still told about'($) {
            const { pane, answer } = pane_make($);
            answer({ kind: 'error', at: 'compile', message: 'boom', node: 'Calc' });
            $mol_assert_equal(pane.error_marks().length, 0);
            $mol_assert_equal(pane.node_error('Calc'), 'компиляция — Calc: boom');
        },
        /** What the panel of the picked node shows is what the pane knows about it. */
        'the code panel shows the failure of the node it is editing'($) {
            const app = $bog_vmap_app.make({ $ });
            app.part_drop(`${d}mol_button_minor`, 100, 200);
            const name = app.selected();
            const pane = app.pane();
            pane.error_at('runtime', 'исполнение: boom');
            pane.error_node('runtime', name);
            $mol_assert_equal(app.code_error(), 'исполнение: boom');
            app.selected(null);
            $mol_assert_equal(app.code_error(), '');
        },
    });
})($ || ($ = {}));
(function ($_3) {
    /**
     * Tests of the code editor against the live document.
     *
     * The round trip is the whole point of stage 4.1: what the panel shows, written
     * back unchanged, has to leave the document byte for byte as it was, and what
     * the mouse does on the canvas has to show up in the text without anybody
     * pushing it there.
     *
     * `d` keeps `$` out of the string literals — mam reads them for dependencies.
     */
    const d = '$';
    /** An editor with one part on the canvas, picked, and its code panel. */
    const editor = ($, klass = `${d}mol_button_minor`) => {
        const app = $bog_vmap_app.make({ $ });
        app.part_drop(klass, 100, 200);
        const code = app.Code();
        return { app, code, name: app.selected() };
    };
    /**
     * The same, with the node bound to a name the class does not declare.
     *
     * That binding is the only thing that gives a node a method of its own to
     * write: `title <= greeting` asks for `greeting()`, and nothing generates it.
     */
    const wired = ($) => {
        const one = editor($);
        one.code.tree_text(`${one.name} ${d}mol_button_minor\n\ttitle <= greeting\n`);
        return one;
    };
    $mol_test({
        'the declaration of a node written back leaves the document alone'($) {
            const { app, code } = editor($);
            const before = app.doc_source();
            code.tree_text(code.tree_text());
            $mol_assert_equal(app.doc_source(), before);
        },
        'the whole document written back leaves it alone'($) {
            const { app, code } = editor($);
            code.whole(true);
            const before = app.doc_source();
            $mol_assert_equal(code.tree_text(), before);
            code.tree_text(code.tree_text());
            $mol_assert_equal(app.doc_source(), before);
        },
        'the declaration edited in the panel reaches the document'($) {
            const { app, code, name } = editor($);
            code.tree_text(`${name} ${d}mol_string\n\thint \\typed\n`);
            $mol_assert_equal(app.doc_source().includes('hint \\typed'), true);
            $mol_assert_equal(app.doc_source().includes(`${d}mol_string`), true);
        },
        /**
         * The one failure that would look like success: a broken text swallowed, the
         * document left holding something the user never wrote.
         */
        'a broken declaration is refused, and the document keeps the last good one'($) {
            const { app, code } = editor($);
            const before = app.doc_source();
            code.tree_text('Broken \\\n\t\t\tnonsense');
            $mol_assert_equal(app.doc_source(), before);
            $mol_assert_equal(code.note() !== '', true);
            // And what was typed is still in the field, where it can be fixed.
            $mol_assert_equal(code.tree_text(), 'Broken \\\n\t\t\tnonsense');
        },
        'a good text after a broken one clears the refusal and lands'($) {
            const { app, code, name } = editor($);
            code.tree_text('Broken \\\n\t\t\tnonsense');
            code.tree_text(`${name} ${d}mol_string\n`);
            $mol_assert_equal(code.note(), '');
            $mol_assert_equal(app.doc_source().includes(`${name} ${d}mol_string`), true);
        },
        /**
         * The other half of 4.1: the canvas and the panel are one text, so a drop
         * shows up in the panel with no path of its own.
         */
        'a part dropped with the mouse shows up in the text'($) {
            const { app, code } = editor($);
            code.whole(true);
            const before = code.tree_text();
            app.part_drop(`${d}mol_string`, 300, 400);
            $mol_assert_equal(code.tree_text() !== before, true);
            $mol_assert_equal(code.tree_text().includes(`${d}mol_string`), true);
        },
        'a text edit does not stop the panel following the mouse'($) {
            const { app, code, name } = editor($);
            code.tree_text(`${name} ${d}mol_string\n\thint \\typed\n`);
            app.part_drop(`${d}mol_check`, 500, 600);
            code.whole(true);
            $mol_assert_equal(code.tree_text().includes('hint \\typed'), true);
            $mol_assert_equal(code.tree_text().includes(`${d}mol_check`), true);
        },
        'a method written for a node lands in the body of its class'($) {
            const { app, code } = wired($);
            code.js_text(`greeting() {\n\treturn 'hi'\n}`);
            $mol_assert_equal(app.root_js().includes(`greeting()`), true);
        },
        /** The whole point of 4.2: one property and the whole text say the same thing. */
        'the slice of a node and the whole body agree'($) {
            const { app, code } = wired($);
            app.root_js(`greeting() {\n\treturn 'hi'\n}\n\nother() {\n\t\n}`);
            $mol_assert_equal(code.js_text(), `greeting() {\n\treturn 'hi'\n}`);
            code.whole(true);
            $mol_assert_equal(code.js_text(), app.root_js());
        },
        'editing one property leaves its neighbour byte for byte'($) {
            const { app, code } = wired($);
            app.root_js(`greeting() {\n\t\n}\n\nother() {\n\treturn 1\n}`);
            code.js_text(`greeting() {\n\treturn 2\n}`);
            $mol_assert_equal(app.root_js(), `greeting() {\n\treturn 2\n}\n\nother() {\n\treturn 1\n}`);
        },
        /**
         * THE TRAP THIS WHOLE SHAPE EXISTS TO AVOID. The name of a node is the name
         * of the factory of its sub-view in the generated class, so a handwritten
         * method of that name shadows the factory and the node leaves the canvas.
         * The panel must never put that name in front of a person as a suggestion.
         */
        'a method named after the node is never offered'($) {
            const plain = editor($);
            $mol_assert_equal(plain.code.js_text().includes(`${plain.name}(`), false);
            const one = wired($);
            $mol_assert_equal(one.code.js_text().includes(`${one.name}(`), false);
        },
        'a node whose declaration asks for nothing has no JS field at all'($) {
            const { code } = editor($);
            $mol_assert_equal(code.js_writable(), false);
            $mol_assert_equal(code.source_tabs()[1], code.Js_idle());
            $mol_assert_equal(code.js_idle_note() !== '', true);
        },
        'the method the declaration asks for is offered empty'($) {
            const { code } = wired($);
            $mol_assert_equal(code.js_writable(), true);
            $mol_assert_equal(code.source_tabs()[1], code.Js());
            $mol_assert_equal(code.js_text(), 'greeting(  ) {\n\t\n}');
        },
        /** The declaration is what decides, so a binding added later opens the field. */
        'a binding added to the declaration brings the method with it'($) {
            const { code, name } = editor($);
            $mol_assert_equal(code.js_writable(), false);
            code.tree_text(`${name} ${d}mol_button_minor\n\ttitle <= greeting\n`);
            $mol_assert_equal(code.js_writable(), true);
            $mol_assert_equal(code.js_text(), 'greeting(  ) {\n\t\n}');
        },
        /** A method the class already generates is not something to write by hand. */
        'a wire the class declares is not offered as a method'($) {
            const { app, code, name } = editor($);
            app.node().part_add('Motor', `${d}mol_view`);
            app.node().wire_add({ name: 'spin', node: 'Motor', prop: 'sub' });
            code.tree_text(`${name} ${d}mol_button_minor\n\ttitle <= spin\n`);
            $mol_assert_equal(code.js_writable(), false);
        },
        'a rule written for a node lands in the styles of its class'($) {
            const { app, code, name } = editor($);
            const rule = `[${app.doc_root().slice(1)}_${name.toLowerCase()}] {\n\tcolor: red;\n}`;
            code.css_text(rule);
            $mol_assert_equal(app.root_css(), rule);
            $mol_assert_equal(code.css_text(), rule);
        },
        'a node with no rule of its own is offered an empty one addressed to it'($) {
            const { app, code, name } = editor($);
            $mol_assert_equal(code.css_text(), `[${app.doc_root().slice(1)}_${name.toLowerCase()}] {\n\t\n}`);
        },
        /**
         * A body that cannot be cut is a state of the panel, not a lost document:
         * the text stays whole, the panel says so, and the switch is the way out.
         */
        'a body with unbalanced braces is reported, not swallowed'($) {
            const { app, code } = editor($);
            app.root_js('broken() {\n\treturn 1\n');
            $mol_assert_equal(code.sliceable(), false);
            $mol_assert_equal(code.note() !== '', true);
            code.whole(true);
            $mol_assert_equal(code.js_text(), 'broken() {\n\treturn 1\n');
        },
        /** The scene compiles what the panel writes, so the two texts have to travel. */
        'what the panel writes reaches the scene'($) {
            const { app, code, name } = wired($);
            code.js_text(`greeting() {\n\treturn 1\n}`);
            code.css_text(`[${app.doc_root().slice(1)}_${name.toLowerCase()}] {\n\tcolor: red;\n}`);
            $mol_assert_equal(app.doc_js()[app.doc_root()]?.includes(`greeting()`), true);
            $mol_assert_equal(app.doc_css().includes('color: red'), true);
        },
        /**
         * The divergence of section 10 shown where the mistake is made: the body runs
         * in the scene through `new Function` and would fail the export on `strict`.
         */
        'an untyped parameter is complained about as it is written'($) {
            const { code } = wired($);
            $mol_assert_equal(code.complaints().length, 0);
            code.js_text(`greeting( next ) {\n\treturn next\n}`);
            $mol_assert_equal(code.complaints().length, 1);
            $mol_assert_equal(code.complaints()[0].param, 'next');
            $mol_assert_equal(code.complaints()[0].method, 'greeting');
        },
        'a typed parameter is not complained about'($) {
            const { code } = wired($);
            code.js_text(`greeting( next?: string ) {\n\treturn next\n}`);
            $mol_assert_equal(code.complaints().length, 0);
        },
        /**
         * The complaint used to be filtered by the name of the node, which hid every
         * one a person could make: the method they must never write is the one named
         * after the node. It is checked on the text on screen now, so it shows in
         * both modes and its line number counts in the text the reader is looking at.
         */
        'the complaint is visible in both modes'($) {
            const { app, code } = wired($);
            app.root_js(`greeting( a ) {\n\t\n}\n\nother( b ) {\n\t\n}`);
            $mol_assert_equal(code.complaints().length, 1);
            $mol_assert_equal(code.complaints()[0].param, 'a');
            $mol_assert_equal(code.complaints()[0].line, 1);
            code.whole(true);
            $mol_assert_equal(code.complaints().length, 2);
            $mol_assert_equal(code.complaints()[1].param, 'b');
            $mol_assert_equal(code.complaints()[1].line, 5);
        },
        /**
         * A draft belongs to the text, not to the tab. Keyed by the tab alone, a
         * refused edit made on one node showed up under the name of the next node
         * picked — and correcting it there wrote it into that other node.
         */
        'a refused edit does not follow the panel to another node'($) {
            const { app, code, name } = editor($);
            app.part_drop(`${d}mol_string`, 300, 400);
            const second = app.selected();
            app.selected(name);
            code.tree_text('Broken \\\n\t\t\tnonsense');
            $mol_assert_equal(code.tree_text(), 'Broken \\\n\t\t\tnonsense');
            app.selected(second);
            $mol_assert_equal(code.tree_text().includes('nonsense'), false);
            $mol_assert_equal(code.tree_text().includes(second), true);
            // And it is still there when the node it was typed on comes back.
            app.selected(name);
            $mol_assert_equal(code.tree_text(), 'Broken \\\n\t\t\tnonsense');
        },
        /** A published component without its behaviour is a picture of a component. */
        'a published node carries its method and its rule'($) {
            const { app, code, name } = wired($);
            code.js_text(`greeting() {\n\treturn 1\n}`);
            code.css_text(`[${app.doc_root().slice(1)}_${name.toLowerCase()}] {\n\tcolor: red;\n}`);
            const publish = app.Publish();
            $mol_assert_equal(publish.js(), `greeting() {\n\treturn 1\n}`);
            $mol_assert_equal(publish.css().includes('color: red'), true);
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    /**
     * Tests of the export.
     *
     * The real acceptance is elsewhere and cannot be a unit test: the output has to
     * be dropped into `bog/` and built by mam. `bog/vmap/demo/` is that check,
     * generated by this code and kept as a standing one. What is here are the
     * decisions that would otherwise fail silently — placement, declaration order
     * and decorators — plus the refusals.
     *
     * `d` keeps `$` out of the string literals: mam builds its dependency graph by
     * a regexp over sources, literals included, so a fixture class name spelled
     * literally would be resolved as a module path.
     */
    const d = '$';
    const page = [
        `${d}bog_site_page ${d}mol_view`,
        `	Hero ${d}bog_site_hero`,
        `	greeting = Hero title`,
        `	sub / <= Hero`,
        ``,
    ].join('\n');
    const hero = `${d}bog_site_hero ${d}mol_view\n\ttitle \\Hi\n\tcount? 0\n\tplain \\x\n`;
    /**
     * Two artboards and one free part beside them: `Home` and `About` carry a `sub`
     * of their own and so are pages, `Loose` carries none and so is not.
     */
    const pages = [
        `${d}bog_site_page ${d}mol_view`,
        `	Head ${d}mol_view`,
        `	Loose ${d}mol_view`,
        `	Home ${d}mol_view sub / <= Head`,
        `	About ${d}mol_view sub /`,
        `	sub /`,
        `		<= Home`,
        `		<= About`,
        `		<= Loose`,
        ``,
    ].join('\n');
    /** Text of one file of the module, or empty when the module carries none. */
    function file_of(module, suffix) {
        return module.files.find(file => file.name.endsWith(suffix))?.text ?? '';
    }
    $mol_test({
        /**
         * Placement is not free. Mam turns a class name into a path by replacing every
         * underscore with a slash, so a module put anywhere else fails to build while
         * looking entirely correct — the one failure this whole task exists to rule out.
         */
        'module path comes from the class names'($) {
            $mol_assert_equal($.$bog_vmap_app_export_path([`${d}bog_site_page`, `${d}bog_site_hero`]), 'bog/site');
            $mol_assert_equal($.$bog_vmap_app_export_path([`${d}bog_site_page`]), 'bog/site/page');
            $mol_assert_equal($.$bog_vmap_app_export_path([`${d}bog_site_page`, `${d}bog_site_page_hero`]), 'bog/site/page');
        },
        'classes of different packs cannot be one module'($) {
            $mol_assert_fail(() => $.$bog_vmap_app_export_path([`${d}bog_site_page`, `${d}hyoo_other_page`]), Error);
            $mol_assert_fail(() => $.$bog_vmap_app_export_path([`${d}bog_one`, `${d}bog_two`]), Error);
            $mol_assert_fail(() => $.$bog_vmap_app_export_path([]), Error);
        },
        /**
         * `class $A extends $[ '$B' ]` takes its base at definition time and the
         * generator emits declarations in the order it got them, so an heir above its
         * base inherits `undefined`. The document is written heir first here on
         * purpose.
         */
        'a base is declared before its heir'($) {
            const own = `${d}bog_site_hero_big ${d}bog_site_hero\n\ttitle \\Big\n`;
            const module = $.$bog_vmap_app_export_build([
                { source: own },
                { source: page },
                { source: hero },
            ], `${d}bog_site_page`);
            const tree = file_of(module, '.view.tree');
            $mol_assert_equal(tree.indexOf(`${d}bog_site_hero `) < tree.indexOf(`${d}bog_site_hero_big `), true);
        },
        'the emitted declaration parses back into the same classes'($) {
            const module = $.$bog_vmap_app_export_build([{ source: page }, { source: hero }]);
            const back = $.$mol_view_tree2_normalize($.$mol_tree2_from_string(file_of(module, '.view.tree'), 'export'));
            /**
             * Input order, because neither is the base of the other. A sub-view
             * reference does NOT constrain the order: the generator writes a
             * `new this.$[ name ]()` resolved at call time, and only the `extends`
             * clause is evaluated when the class is defined.
             */
            $mol_assert_like(back.kids.map(cl => cl.type), [`${d}bog_site_page`, `${d}bog_site_hero`]);
        },
        /**
         * A property memoized in the preview has to be memoized in the export, or the
         * two drift and nothing says so: an override without a decorator simply has no
         * atom, so it returns a fresh value while the DOM keeps the old one.
         */
        'a hand written body carries its decorators'($) {
            const module = $.$bog_vmap_app_export_build([
                { source: page },
                { source: hero, js: 'count( next?: number ) {\n\treturn next ?? 7\n}\n' },
            ]);
            const ts = file_of(module, '.view.ts');
            $mol_assert_equal(ts.includes(`export class ${d}bog_site_hero extends $.${d}bog_site_hero {`), true);
            // Over the method, the way a person writes it, and nowhere else: the
            // expression form belongs to the scene, which cannot write a decorator
            // into the string it hands to `new Function`.
            $mol_assert_equal(ts.includes(`\t\t@ ${d}mol_mem\n\t\tcount( next?: number ) {`), true);
            $mol_assert_equal(ts.includes('.prototype'), false);
            /** `title` and `plain` carry no sign, so the generated base does not memoize them either. */
            $mol_assert_equal(ts.includes('"title"'), false);
            $mol_assert_equal(ts.includes('"plain"'), false);
        },
        /**
         * The file that goes out is still a file the editor can read back: the body
         * with decorators in it slices into exactly the properties it was cut from.
         * The export and the code panel cut with the same function, so this is a
         * check that the decorator did not land somewhere that breaks the cut.
         */
        'the decorated body slices back into the same properties'($) {
            const module = $.$bog_vmap_app_export_build([
                { source: page },
                { source: hero, js: 'count( next?: number ) {\n\treturn next ?? 7\n}\n' },
            ]);
            const ts = file_of(module, '.view.ts');
            const body = ts.slice(ts.indexOf('{', ts.indexOf('export class')) + 1, ts.lastIndexOf('\t}'));
            $mol_assert_like([...$.$bog_vmap_app_code_props_js(body).keys()], ['count']);
        },
        /** The decorator goes under the comment of the method, not above it. */
        'a documented method keeps its comment over the decorator'($) {
            const module = $.$bog_vmap_app_export_build([
                { source: page },
                {
                    source: hero,
                    js: '/** How many. */\ncount( next?: number ) {\n\treturn next ?? 7\n}\n',
                },
            ]);
            $mol_assert_equal(file_of(module, '.view.ts').includes(`\t\t/** How many. */\n\t\t@ ${d}mol_mem\n\t\tcount( next?: number ) {`), true);
        },
        /**
         * A body the slicer cannot cut keeps the old form: braces are counted, not
         * parsed, so a `}` inside a string defeats it. An ugly file is the right
         * trade — a body that loses its decorators loses its atoms silently.
         */
        'a body that cannot be sliced keeps the decorators after the class'($) {
            const module = $.$bog_vmap_app_export_build([
                { source: page },
                { source: hero, js: 'count( next?: number ) {\n\treturn next ?? "}"\n}\n' },
            ]);
            const ts = file_of(module, '.view.ts');
            $mol_assert_equal(ts.includes(`;( ${d}mol_mem( ${d}bog_site_hero.prototype, "count" ) )`), true);
        },
        'a class without a body gets no file of its own at all'($) {
            const module = $.$bog_vmap_app_export_build([{ source: page }, { source: hero }]);
            // Not an empty namespace: a module written by a person carries no file
            // with nothing in it.
            $mol_assert_equal(module.files.some(file => file.name.endsWith('.view.ts')), false);
            $mol_assert_equal(module.files.some(file => file.name.endsWith('.view.css')), false);
        },
        /**
         * The stylesheet goes out as a stylesheet. mam compiles every `.css` of a
         * module into the bundle, the way `mol/view/view/view.css` travels, so there
         * is nothing to attach and nothing to escape: user text that would have torn
         * a template literal apart is just text in a file.
         */
        'a stylesheet is a stylesheet, verbatim'($) {
            const css = '[bog_site_hero]{ content: "` ' + '${x}' + '" }';
            const module = $.$bog_vmap_app_export_build([
                { source: page },
                { source: hero, css },
            ]);
            $mol_assert_equal(file_of(module, '.view.css'), css + '\n');
            $mol_assert_equal(module.files.some(file => file.name.endsWith('.view.css.ts')), false);
        },
        'index.html instantiates the root class'($) {
            const module = $.$bog_vmap_app_export_build([{ source: page }, { source: hero }], `${d}bog_site_page`);
            $mol_assert_equal(module.root, `${d}bog_site_page`);
            $mol_assert_equal(file_of(module, 'index.html').includes(`mol_view_root="${d}bog_site_page"`), true);
        },
        /**
         * The module carries what a person would have written and nothing else: the
         * declaration, what mam needs to build it, and a page. A body and a
         * stylesheet appear only when the document has them.
         */
        'the module is the files a person would have written'($) {
            const module = $.$bog_vmap_app_export_build([{ source: page }, { source: hero }]);
            $mol_assert_equal(module.path, 'bog/site');
            $mol_assert_equal(module.name, 'site');
            $mol_assert_like(module.files.map(file => file.name), [
                'site.view.tree',
                'site.meta.tree',
                'index.html',
            ]);
            const full = $.$bog_vmap_app_export_build([
                { source: page },
                { source: hero, js: 'count( next?: number ) {\n\treturn next ?? 7\n}\n', css: '[bog_site_hero]{}' },
            ]);
            $mol_assert_like(full.files.map(file => file.name), [
                'site.view.tree',
                'site.view.ts',
                'site.view.css',
                'site.meta.tree',
                'index.html',
            ]);
        },
        'a root outside the document is refused'($) {
            $mol_assert_fail(() => $.$bog_vmap_app_export_build([{ source: page }, { source: hero }], `${d}bog_site_nope`), Error);
        },
        'a class declared twice is refused'($) {
            $mol_assert_fail(() => $.$bog_vmap_app_export_build([{ source: hero }, { source: hero }]), Error);
        },
        /**
         * The acceptance of the artboards: what an export carries of a page is the
         * tree it shows and the flex properties it was set with, and not one number
         * of the canvas.
         *
         * The placement of free parts cannot leak here by construction — it never
         * enters the document, it rides `spots` to the scene and is turned into
         * rules there — and this is the test that keeps that true from the far end,
         * where the leak would be shipped rather than merely visible.
         */
        'an artboard exports as the tree it shows, with no coordinate in it'($) {
            const board = [
                `${d}bog_site_page ${d}mol_view`,
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
            const tree = file_of($.$bog_vmap_app_export_build([{ source: board }]), '.view.tree');
            $mol_assert_equal(tree, board);
            // Nothing of the desk: no coordinates, and no absolute positioning to
            // apply them with.
            const css = file_of($.$bog_vmap_app_export_build([{ source: board }]), '.view.css');
            $mol_assert_equal(/\bleft\b|\btop\b|position/.test(css), false);
        },
        /**
         * Two artboards are two pages, and pages need an address. The router is a
         * class of its own rather than an edit of the document, because the document
         * goes out byte for byte the way the editor holds it.
         */
        'a document of two artboards exports with a router over them'($) {
            const module = $.$bog_vmap_app_export_build([{ source: pages }, { source: hero }]);
            const tree = file_of(module, '.view.tree');
            const ts = file_of(module, '.view.ts');
            // The document itself is untouched, and the router is one class after it.
            $mol_assert_equal(tree, pages + hero + `${d}bog_site_app ${d}mol_view\n\tDoc ${d}bog_site_page\n`);
            // The base of the router is declared above it, as every base has to be.
            $mol_assert_equal(tree.indexOf(`${d}bog_site_page `) < tree.indexOf(`${d}bog_site_app `), true);
            // Both pages are addressable, and the first one is what a bare address opens.
            $mol_assert_equal(ts.includes(`switch( this.$.${d}mol_state_arg.value( 'page' ) ) {`), true);
            $mol_assert_equal(ts.includes(`case "About": return [ doc.About() ]`), true);
            $mol_assert_equal(ts.includes(`default: return [ doc.Home() ]`), true);
            // A free part is not a page: it has no `sub` of its own, and the router
            // never names it.
            $mol_assert_equal(ts.includes('Loose'), false);
            // The page is reached through the document, which is declared and never
            // drawn, so nothing but the chosen page builds any DOM.
            $mol_assert_equal(ts.includes('const doc = this.Doc()'), true);
            $mol_assert_equal(module.root, `${d}bog_site_app`);
            $mol_assert_equal(file_of(module, 'index.html').includes(`mol_view_root="${d}bog_site_app"`), true);
        },
        /**
         * The router carries no coordinate either. Two artboards lie side by side on
         * the canvas by numbers that ride `spots`, and a page that came out placed
         * absolutely would be that desk shipped to a reader.
         */
        'a routed document ships no placement'($) {
            const module = $.$bog_vmap_app_export_build([{ source: pages }, { source: hero }]);
            $mol_assert_equal(/\bleft\b|\btop\b|position/.test(file_of(module, '.view.css')), false);
            $mol_assert_equal(/\bx\b|\by\b|spot/.test(file_of(module, '.view.ts')), false);
        },
        /**
         * A router over one page would be a class that always answers the same thing.
         * One page stays one page: no router class, no file to put it in, and the
         * document itself at the root.
         */
        'a document of one artboard gets no router'($) {
            const one = [
                `${d}bog_site_page ${d}mol_view`,
                `	Head ${d}mol_view`,
                `	Home ${d}mol_view sub / <= Head`,
                `	sub / <= Home`,
                ``,
            ].join('\n');
            const module = $.$bog_vmap_app_export_build([{ source: one }]);
            $mol_assert_equal(file_of(module, '.view.tree'), one);
            $mol_assert_equal(module.root, `${d}bog_site_page`);
            // One class, so the path is `bog/site/page` and the module is named after
            // its last segment.
            $mol_assert_like(module.files.map(file => file.name), ['page.view.tree', 'page.meta.tree', 'index.html']);
        },
        /**
         * Placement is not free for the router either: a name adding a segment to the
         * longest common prefix would move the whole module into a folder that does
         * not exist.
         */
        'the router leaves the module where the document put it'($) {
            const module = $.$bog_vmap_app_export_build([{ source: pages }, { source: hero }]);
            $mol_assert_equal(module.path, 'bog/site');
            $mol_assert_equal(module.root, `${d}bog_site_app`);
            $mol_assert_equal($.$bog_vmap_app_export_path([`${d}bog_site_page`, `${d}bog_site_hero`, module.root]), 'bog/site');
            // A document of a single class sits one segment deeper, and the router
            // follows it there instead of pulling it back up.
            const deep = $.$bog_vmap_app_export_build([{ source: pages }]);
            $mol_assert_equal(deep.path, 'bog/site/page');
            $mol_assert_equal(deep.root, `${d}bog_site_page_app`);
            $mol_assert_equal($.$bog_vmap_app_export_path([`${d}bog_site_page`, deep.root]), 'bog/site/page');
        },
        'a router named by the document takes the next free name'($) {
            const module = $.$bog_vmap_app_export_build([
                { source: pages },
                { source: `${d}bog_site_app ${d}mol_view\n\ttitle \\Taken\n` },
            ], `${d}bog_site_page`);
            $mol_assert_equal(module.root, `${d}bog_site_app2`);
            $mol_assert_equal(file_of(module, '.view.tree').includes(`${d}bog_site_app2 ${d}mol_view`), true);
        },
        /**
         * The divergence of section 10, caught where the author can still do
         * something about it. A body without types runs in the preview through
         * `new Function` and fails the export, which compiles it with `strict`.
         */
        'a body that would not pass strict is named before the export'($) {
            const notes = $.$bog_vmap_app_export_untyped('count( next ) {\n\treturn next ?? 7\n}\n');
            $mol_assert_equal(notes.length, 1);
            $mol_assert_equal(notes[0].method, 'count');
            $mol_assert_equal(notes[0].param, 'next');
            $mol_assert_equal(notes[0].line, 1);
            const error = $mol_assert_fail(() => $.$bog_vmap_app_export_build([
                { source: page },
                { source: hero, js: 'title() {\n\treturn "hi"\n}\n\ncount( next ) {\n\treturn next ?? 7\n}\n' },
            ]), Error);
            // The refusal names the class, the line, the method and the parameter —
            // everything needed to go and fix it.
            $mol_assert_equal(error.message.includes(`${d}bog_site_hero`), true);
            $mol_assert_equal(error.message.includes('строка 5'), true);
            $mol_assert_equal(error.message.includes('count'), true);
            $mol_assert_equal(error.message.includes('next'), true);
        },
        /**
         * What the check must NOT say, or the editor would cry over working code and
         * be turned off. A default value is a type, an arrow is typed by context, and
         * a statement is not a method.
         */
        'a typed body passes untouched'($) {
            const js = [
                `@ ${d}mol_mem`,
                'count( next?: number ) {',
                '	return next ?? 7',
                '}',
                '',
                'sum( rest = 0 ) {',
                '	return this.items().map( item => item.value() ).reduce( ( a: number, b: number )=> a + b, rest )',
                '}',
                '',
                'title() {',
                '	if( this.count() ) return "many"',
                '	for( const item of this.items() ) return "one"',
                '	return ""',
                '}',
                '',
            ].join('\n');
            $mol_assert_like($.$bog_vmap_app_export_untyped(js), []);
            const module = $.$bog_vmap_app_export_build([{ source: page }, { source: hero, js }]);
            $mol_assert_equal(file_of(module, '.view.ts').includes('count( next?: number )'), true);
        },
        /**
         * The forms a naive search for «a parameter without a type» gets wrong, one
         * assertion each.
         *
         * The two mistakes do not cost the same. A complaint refuses the export, so a
         * false one locks the author inside the editor with no way out, while a missed
         * one costs a build failure that explains itself. Every line below is
         * therefore an assertion of SILENCE, and the ones that are genuine errors
         * passed over — the destructuring, the object literal method — are silence on
         * purpose and named as misses in the docs.
         */
        'the check keeps quiet on everything it is not sure of'($) {
            const quiet = (js) => $mol_assert_like($.$bog_vmap_app_export_untyped(js), []);
            // A destructured parameter is an error of the same kind, and naming it
            // sensibly is beyond a search over text. Missed on purpose.
            quiet('render( { head, foot } ) {\n\treturn [ head, foot ]\n}\n');
            // An arrow written as a class property. Its parameter is untyped, and the
            // line is not a method head at all, so it is left alone.
            quiet('handler = ( event )=> event.type\n');
            // A `this` parameter is not a parameter of the caller.
            quiet('pick( this: $, id: string ) {\n\treturn id\n}\n');
            // A generic method, typed through its own type parameter.
            quiet('first< Item >( list: Item[] ) {\n\treturn list[0]\n}\n');
            // An overload signature carries no body, so it is not a head. Missed even
            // with an untyped parameter, and that is the safe direction.
            quiet('plus( a ): number\nplus( a: number ) {\n\treturn a\n}\n');
            // Optional and rest parameters, both typed.
            quiet('join( a?: string, ... rest: string[] ) {\n\treturn [ a, ... rest ]\n}\n');
            // A signature quoted inside a template literal is not a signature. This is
            // the one that would fire on text the author never meant as code.
            quiet('sample() {\n\treturn `\ncount( next ) {\n`\n}\n');
            // The same inside comments, both kinds.
            quiet('sample() {\n\treturn 1\n}\n// count( next ) {\n');
            quiet('sample() {\n\treturn 1\n}\n/*\ncount( next ) {\n*/\n');
            // A method of an object literal inside a body: indented, therefore a
            // statement rather than a head. Missed on purpose.
            quiet('config() {\n\treturn {\n\t\topen( next ) { return next },\n\t}\n}\n');
            // A call at the start of a line inside a method reads exactly like a head
            // to a search that ignores indentation.
            quiet('run() {\n\tsuper( next )\n\tthis.compute( x )\n}\n');
        },
        /**
         * The other half of the same rule: what the check IS sure of, it says. A body
         * that reaches the export in any of these shapes does not build.
         */
        'the check does say the parameter it is sure about'($) {
            const first = (js) => $.$bog_vmap_app_export_untyped(js)[0];
            // A `this` parameter beside an untyped one: only the second is named.
            const beside = $.$bog_vmap_app_export_untyped('pick( this: $, id ) {\n\treturn id\n}\n');
            $mol_assert_equal(beside.length, 1);
            $mol_assert_equal(beside[0].param, 'id');
            // A generic whose value parameter carries no type of its own.
            $mol_assert_equal(first('first< Item >( list ) {\n\treturn list[0]\n}\n').param, 'list');
            // A rest parameter, named without its dots and suggested with them.
            const rest = first('join( ... parts ) {\n\treturn parts\n}\n');
            $mol_assert_equal(rest.param, 'parts');
            $mol_assert_equal(rest.text.includes('... parts: number[]'), true);
            // An optional parameter without a type is untyped all the same.
            $mol_assert_equal(first('load( id? ) {\n\treturn id\n}\n').param, 'id');
            // A setter and an async method are heads like any other.
            $mol_assert_equal(first('set title( next ) {\n\treturn next\n}\n').method, 'title');
            $mol_assert_equal(first('async load( id ) {\n\treturn id\n}\n').method, 'load');
            // A head split over several lines is still one head, reported at the line
            // the author reads as its first.
            const split = first('sum(\n\ta: number,\n\tb,\n) {\n\treturn a + b\n}\n');
            $mol_assert_equal(split.param, 'b');
            $mol_assert_equal(split.line, 1);
            // A body written with an indent of its own is checked at that indent, or
            // the check would silently do nothing for a whole class of editors.
            const inset = first('\tcount( next ) {\n\t\treturn next\n\t}\n');
            $mol_assert_equal(inset.param, 'next');
            // The message is an instruction: what to write, spelled out.
            $mol_assert_equal(first('count( next ) {\n\treturn next\n}\n').text.includes('count( next?: number )'), true);
        },
        /**
         * WHAT STOPPED THE EXPORTED MODULE FROM BUILDING, measured 10.09.2026 on a
         * document dropped into a real folder of mam.
         *
         * A node bound to a name the class does not declare — `title <= greeting`,
         * with `greeting()` written by hand — is the shape section 1 tells people to
         * write, and the scene runs it because a body there is compiled without
         * types. The exported module is compiled WITH them: the declaration file
         * states the binding as `ReturnType< Klass['greeting'] >` against the
         * generated class, which declares no such thing, and mam stops on
         * `TS2339: Property 'greeting' does not exist`. Three correct files and no
         * bundle.
         *
         * So the declaration is written out, typed `any` by `null`, and the hand
         * written body in the subclass narrows it.
         */
        'a name only the hand written body answers is declared for it'($) {
            const source = [
                `${d}bog_site_page ${d}mol_view`,
                `	Hero ${d}bog_site_hero title <= greeting`,
                `	sub / <= Hero`,
                ``,
            ].join('\n');
            const js = 'greeting(): string {\n\treturn \'Hi\'\n}';
            const module = $.$bog_vmap_app_export_build([{ source, js }, { source: hero }], `${d}bog_site_page`);
            const tree = file_of(module, '.view.tree');
            $mol_assert_equal(tree.includes('\tgreeting null\n'), true);
            // Appended and nothing else touched: what the person wrote is still there.
            $mol_assert_equal(tree.includes(`\tHero ${d}bog_site_hero title <= greeting\n`), true);
        },
        /**
         * The other half, and the one that would do damage. A bare reference the body
         * does NOT answer is a property of the base class — or a plain mistake — and
         * declaring it here would shadow the first with `any` and bury the second
         * under a method that quietly returns nothing.
         */
        'a name the body does not answer is left alone'($) {
            const source = [
                `${d}bog_site_page ${d}mol_view`,
                `	Hero ${d}bog_site_hero title <= greeting`,
                `	Note ${d}mol_view sub / <= title`,
                `	title \\Hi`,
                `	sub / <= Hero`,
                ``,
            ].join('\n');
            // The body answers `greeting` and nothing else.
            const js = 'greeting(): string {\n\treturn \'Hi\'\n}';
            const model = $bog_vmap_lang_node.make({ $ });
            model.source(source);
            $mol_assert_like($.$bog_vmap_app_export_hooks(model.tree(), js), ['greeting']);
            // `title` is declared by the class, so nothing is written for it.
            const module = $.$bog_vmap_app_export_build([{ source, js }, { source: hero }]);
            $mol_assert_equal(file_of(module, '.view.tree').includes('title null'), false);
        },
        /** A document nobody wrote a body for gains nothing at all. */
        'a document without hand written code is written out unchanged'($) {
            const module = $.$bog_vmap_app_export_build([{ source: page }, { source: hero }]);
            $mol_assert_equal(file_of(module, '.view.tree').includes('null'), false);
        },
        'a cycle of bases is refused rather than hung'($) {
            $mol_assert_fail(() => $.$bog_vmap_app_export_build([
                { source: `${d}bog_site_a ${d}bog_site_b\n\tx \\1\n` },
                { source: `${d}bog_site_b ${d}bog_site_a\n\ty \\2\n` },
            ]), Error);
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    $mol_test_mocks.push($ => {
        class $giper_baza_yard_mock extends $.$giper_baza_yard {
            master() {
                return null;
            }
        }
        $.$giper_baza_yard = $giper_baza_yard_mock;
    });
    $giper_baza_yard.masters = () => {
        $giper_baza_glob.Seed();
        return ['http://localhost:9090/'];
    };
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    $mol_test({
        'empty string'() {
            $mol_assert_equal(''.match($giper_baza_text_tokens), null);
        },
        'new lines'() {
            $mol_assert_equal('\n\r\n'.match($giper_baza_text_tokens), ['\n', '\r\n']);
        },
        'numbers'() {
            $mol_assert_equal('123'.match($giper_baza_text_tokens), ['123']);
        },
        'emoji'() {
            $mol_assert_equal('😀😁'.match($giper_baza_text_tokens), ['😀', '😁']);
        },
        'emoji with modifier'() {
            $mol_assert_equal('👩🏿👩🏿'.match($giper_baza_text_tokens), ['👩🏿', '👩🏿']);
        },
        'combo emoji with modifier'() {
            $mol_assert_equal('👩🏿‍🤝‍🧑🏿👩🏿‍🤝‍🧑🏿'.match($giper_baza_text_tokens), ['👩🏿‍🤝‍🧑🏿', '👩🏿‍🤝‍🧑🏿']);
        },
        'word with spaces'() {
            $mol_assert_equal('foo1  bar2'.match($giper_baza_text_tokens), ['foo1', ' ', ' bar2']);
        },
        'word with diactric'() {
            $mol_assert_equal('Е́е́'.match($giper_baza_text_tokens), ['Е́е́']);
        },
        'word with punctuation'() {
            $mol_assert_equal('foo--bar'.match($giper_baza_text_tokens), ['foo', '--', 'bar']);
        },
        'CamelCase'() {
            $mol_assert_equal('Foo1BAR2'.match($giper_baza_text_tokens), ['Foo1', 'BAR2']);
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    $mol_test({
        'Change sequences'($) {
            const land = $giper_baza_land.make({ $ });
            const text = land.Data($giper_baza_text);
            const list = land.Data($giper_baza_list);
            $mol_assert_equal(text.str(), '');
            $mol_assert_equal(list.items_vary(), []);
            text.str('foo');
            $mol_assert_equal(text.str(), 'foo');
            $mol_assert_equal(list.items_vary(), ['foo']);
            text.str('foo bar');
            $mol_assert_equal(text.str(), 'foo bar');
            $mol_assert_equal(list.items_vary(), ['foo', ' bar']);
            text.str('foo lol bar');
            $mol_assert_equal(text.str(), 'foo lol bar');
            $mol_assert_equal(list.items_vary(), ['foo', ' lol', ' bar']);
            text.str('lol bar');
            $mol_assert_equal(text.str(), 'lol bar');
            $mol_assert_equal(list.items_vary(), ['lol', ' bar']);
            text.str('foo bar');
            $mol_assert_equal(text.str(), 'foo bar');
            $mol_assert_equal(list.items_vary(), ['foo', ' bar']);
            text.str('foo  bar');
            $mol_assert_equal(text.str(), 'foo  bar');
            $mol_assert_equal(list.items_vary(), ['foo', ' ', ' bar']);
            text.str('foo  BarBar');
            $mol_assert_equal(text.str(), 'foo  BarBar');
            $mol_assert_equal(list.items_vary(), ['foo', ' ', ' Bar', 'Bar']);
        },
        async 'str: Offset <=> Point'($) {
            const land = $giper_baza_land.make({ $ });
            const text = land.Data($giper_baza_text);
            text.str('fooBar');
            const [first, second] = text.units();
            $mol_assert_equal(text.point_by_offset(0), [first.self().str, 0, 0]);
            $mol_assert_equal(text.offset_by_point([first.self().str, 0, 0]), [first.self().str, 0]);
            $mol_assert_equal(text.point_by_offset(3), [first.self().str, 3, 0]);
            $mol_assert_equal(text.offset_by_point([first.self().str, 3, 0]), [first.self().str, 3]);
            $mol_assert_equal(text.offset_by_point([first.self().str, 5, 0]), [first.self().str, 5]);
            $mol_assert_equal(text.point_by_offset(5), [second.self().str, 2, 0]);
            $mol_assert_equal(text.offset_by_point([second.self().str, 2, 0]), [second.self().str, 5]);
            $mol_assert_equal(text.point_by_offset(6), [second.self().str, 3, 0]);
            $mol_assert_equal(text.offset_by_point([second.self().str, 3, 0]), [second.self().str, 6]);
            $mol_assert_equal(text.point_by_offset(7), ['', 1, 0]);
            $mol_assert_equal(text.offset_by_point(['', 1, 0]), ['', 7]);
        },
        async 'text: Offset <=> Point'($) {
            const land = $giper_baza_land.make({ $ });
            const text = land.Data($giper_baza_text);
            text.text('foo bar\n666 777');
            const [first, second] = text.pawns($giper_baza_text);
            $mol_assert_equal(text.point_by_offset(0), [first.units()[0].self().str, 0, 0]);
            $mol_assert_equal(text.offset_by_point([first.units()[0].self().str, 0, 0]), [first.units()[0].self().str, 0]);
            $mol_assert_equal(text.point_by_offset(8), [first.units()[2].self().str, 1, 0]);
            $mol_assert_equal(text.offset_by_point([first.units()[2].self().str, 1, 0]), [first.units()[2].self().str, 8]);
        },
        async 'Merge different sequences'($) {
            const land1 = $giper_baza_land.make({ $ });
            const land2 = $giper_baza_land.make({ $ });
            const text1 = land1.Pawn($giper_baza_text).Data();
            const text2 = land2.Pawn($giper_baza_text).Data();
            text1.str('foo bar.');
            land2.faces.stat.time = land1.faces.stat.time;
            text2.str('xxx yyy.');
            const delta1 = await $mol_wire_async(land1).diff_units();
            const delta2 = await $mol_wire_async(land2).diff_units();
            await $mol_wire_async(land1).diff_apply(delta2);
            await $mol_wire_async(land2).diff_apply(delta1);
            $mol_assert_equal(text1.str(), text2.str(), 'xxx yyy.foo bar.');
        },
        async 'Merge same insertions with different changes to same place'($) {
            const base = $giper_baza_land.make({ $ });
            base.Data($giper_baza_text).str('( )');
            const left = $giper_baza_land.make({ $ });
            await $mol_wire_async(left).units_steal(base);
            left.Data($giper_baza_text).str('( [ f ] )');
            left.Data($giper_baza_text).str('( [ foo ] )');
            const right = $giper_baza_land.make({ $ });
            await $mol_wire_async(right).units_steal(base);
            right.faces.sync(left.faces);
            right.Data($giper_baza_text).str('( [ f ] )');
            right.Data($giper_baza_text).str('( [ fu ] )');
            const left_delta = await $mol_wire_async(left).diff_units(base.faces);
            const right_delta = await $mol_wire_async(right).diff_units(base.faces);
            await $mol_wire_async(left).diff_apply(right_delta);
            await $mol_wire_async(right).diff_apply(left_delta);
            $mol_assert_equal(left.Data($giper_baza_text).str(), right.Data($giper_baza_text).str(), '( [ fu ] [ foo ] )');
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    $mol_test({
        'Special'() {
            $mol_assert_equal($mol_si_short(0), '0');
            $mol_assert_equal($mol_si_short(1 / 0), '∞');
            $mol_assert_equal($mol_si_short(-1 / 0), '-∞');
            $mol_assert_equal($mol_si_short(0 / 0), '∅');
        },
        'M'() {
            $mol_assert_equal($mol_si_short(0), '0');
            $mol_assert_equal($mol_si_short(0.999500), '1.00');
            $mol_assert_equal($mol_si_short(-0.999600), '-1.00');
            $mol_assert_equal($mol_si_short(999.4), '999');
            $mol_assert_equal($mol_si_short(-999.4), '-999');
        },
        'L'() {
            $mol_assert_equal($mol_si_short(999.5), '1.00k');
            $mol_assert_equal($mol_si_short(-999.5), '-1.00k');
            $mol_assert_equal($mol_si_short(999_400), '999k');
            $mol_assert_equal($mol_si_short(-999_400), '-999k');
        },
        'XL'() {
            $mol_assert_equal($mol_si_short(999_500), '1.00M');
            $mol_assert_equal($mol_si_short(-999_600), '-1.00M');
            $mol_assert_equal($mol_si_short(999_400_000), '999M');
            $mol_assert_equal($mol_si_short(-999_400_000), '-999M');
        },
        'S'() {
            $mol_assert_equal($mol_si_short(0.999400), '999m');
            $mol_assert_equal($mol_si_short(-0.999400), '-999m');
            $mol_assert_equal($mol_si_short(0.000_999_500), '1.00m');
            $mol_assert_equal($mol_si_short(-0.000_999_500), '-1.00m');
        },
        'XS'() {
            $mol_assert_equal($mol_si_short(0.000_999_400), '999µ');
            $mol_assert_equal($mol_si_short(-0.000_999_400), '-999µ');
            $mol_assert_equal($mol_si_short(0.000_000_999_600), '1.00µ');
            $mol_assert_equal($mol_si_short(-0.000_000_999_600), '-1.00µ');
        },
        'With unit'() {
            $mol_assert_equal($mol_si_short(0, 's'), '0 s');
            $mol_assert_equal($mol_si_short(1 / 0, 's'), '∞ s');
            $mol_assert_equal($mol_si_short(0 / 0, 's'), '∅ s');
            $mol_assert_equal($mol_si_short(123, 'Hz'), '123 Hz');
            $mol_assert_equal($mol_si_short(1234, 'g'), '1.23 kg');
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    $mol_test({
        'simple sort'() {
            const list = ['abc', 'ac', 'ab'];
            list.sort($mol_compare_text());
            $mol_assert_equal(`${list}`, 'ab,abc,ac');
        },
        'sort ignoring spaces around'() {
            const list = [' a', '\tb', ' b'];
            list.sort($mol_compare_text());
            $mol_assert_equal(`${list}`, ' a,\tb, b');
        },
        'sort ignoring letter case'() {
            const list = ['A', 'B', 'a'];
            list.sort($mol_compare_text());
            $mol_assert_equal(`${list}`, 'A,a,B');
        },
        'sort with custom serializer'() {
            const list = ['abc', 'ab', 'ac'];
            list.sort($mol_compare_text(str => str.split('').reverse().join('')));
            $mol_assert_equal(`${list}`, 'ab,ac,abc');
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    /**
     * The editor from the user's side: real clicks on real elements of a rendered
     * DOM, one scenario per test.
     *
     * These are not tests of methods. Every step is what a person does — press a
     * palette row, drag onto the canvas, type into a field, click a button — and
     * what is checked is where it leaves the document, the panels and the scene.
     * The stand and everything it fakes are in `flow_stage.test.ts`.
     *
     * `d` keeps `$` out of the string literals — mam builds its dependency graph by
     * a regexp over sources, literals included.
     */
    const d = '$';
    const calc = `${d}flow_calc`;
    const map = `${d}flow_map`;
    const button = `${d}flow_button`;
    $mol_test({
        /**
         * The editor opens: the head bar, the palette of the pack, the canvas and
         * the invitation in the properties panel. The pack is a fixture and the
         * network is fenced off — a fetch of anything else throws by name.
         */
        'the editor opens with its bar, its palette and its canvas'($) {
            const stage = $bog_vmap_app_flow_stage($);
            // The bar: everything the scenarios below press.
            stage.button('Новая сцена');
            stage.button('−');
            stage.button('+');
            stage.button('Сбросить вид');
            stage.button('Удалить');
            stage.button('В библиотеку');
            const text = stage.text();
            $mol_assert_ok(text.includes('Полка'));
            $mol_assert_ok(text.includes('Свойства'));
            $mol_assert_ok(text.includes('100%'));
            $mol_assert_ok(text.includes('Выберите узел на холсте'));
            // The panel opens on ready made things, not on a catalogue of classes.
            const shelf = [...stage.root.querySelectorAll('[bog_vmap_app_shelf_items] [bog_vmap_app_shelf_item_row]')].map(el => el.textContent);
            $mol_assert_like(shelf.slice(0, 6), [
                'Блок', 'Ячейка кода', 'График', 'Калькулятор', 'Карта', 'Калькулятор и карта',
            ]);
            // And the widgets of input under them, which is what drives the rest.
            $mol_assert_ok(shelf.includes('Поле'));
            $mol_assert_ok(shelf.includes('Выбор'));
            // Under them, the objects of the connected application: what its author
            // declared, by their own names and without a line of mol among them.
            const apps = [...stage.root.querySelectorAll('[bog_vmap_app_shelf_app_list] [bog_vmap_app_shelf_item_row]')].map(el => el.textContent);
            $mol_assert_like(apps, ['Button', 'Calc', 'Map']);
            // The classes of the pack are a level down, folded away until asked for,
            // and then they are all there, the `$mol_view` stub included.
            $mol_assert_equal(stage.root.querySelector('[bog_vmap_app_palette_class_row]'), null);
            stage.classes_open();
            const rows = [...stage.root.querySelectorAll('[bog_vmap_app_palette_class_row]')]
                .map(el => el.textContent);
            $mol_assert_like(rows, [`${d}mol_view`, button, calc, map]);
            // Nothing failed to draw except the frame, which stays suspended for
            // ever: jsdom never loads the sandbox page, so its `onload` never fires.
            $mol_assert_like(stage.broken(), [stage.pane.Scene(stage.pane.scene_key()).dom_id()]);
        },
        /**
         * The point of the shelf: a wired pair arrives whole, by one gesture.
         *
         * A wire is the thing nobody guesses on their own, so the shelf carries an
         * example of one already drawn. What lands is checked in the DOCUMENT and
         * not by eye: a wire written the wrong way still reads plausibly, and all
         * five traps of section 1 build green.
         */
        'a ready made pair lands wired, by one click on the shelf'($) {
            const stage = $bog_vmap_app_flow_stage($);
            stage.click(stage.shelf_row('Калькулятор и карта'));
            const node = stage.app.node();
            // Both parts and the box holding them, and the box is what lies on the
            // canvas: one thing to move, not two.
            $mol_assert_like(node.sub_names(''), ['Pair']);
            $mol_assert_like(node.sub_names('Pair'), ['Calc', 'Map']);
            $mol_assert_like(Object.keys(stage.app.spots()), ['Pair']);
            // The wire, from the result of the calculator into the zoom of the map.
            const links = node.links();
            $mol_assert_equal(links.length, 1);
            $mol_assert_like([links[0].from, links[0].from_prop, links[0].to, links[0].to_prop], ['Calc', 'result', 'Map', 'zoom']);
            // The scene compiles what the document says, byte for byte.
            $mol_assert_equal(stage.scene.last('doc_set').src, stage.app.doc_source());
            // Picked by the drop itself, as a dragged part is.
            $mol_assert_equal(stage.app.selected(), 'Pair');
        },
        /**
         * An application is added by its address, and its own objects are on the
         * shelf right after.
         *
         * Nothing is asked of whoever deployed it: a mol module carries the tree of
         * its classes beside its bundle, so any deployed application is a library
         * already. What the shelf shows is what its author wrote, without the
         * framework the bundle carries along.
         */
        'an application added by its address puts its objects on the shelf'($) {
            const stage = $bog_vmap_app_flow_stage($);
            stage.type(stage.field('Shelf().Links()'), $bog_vmap_app_flow_other);
            // The frame is a new one — a realm cannot unload a bundle — and it boots.
            stage.scene.hello();
            const apps = [...stage.root.querySelectorAll('[bog_vmap_app_shelf_app_list] [bog_vmap_app_shelf_item_row]')].map(el => el.textContent);
            $mol_assert_like(apps, ['Basket']);
            // And an object of somebody else's application lies down like any other.
            stage.click(stage.shelf_row('Basket'));
            $mol_assert_ok(stage.app.doc_source().includes(`Basket ${d}shop_basket`));
            $mol_assert_equal(stage.app.selected(), 'Basket');
        },
        /**
         * A component is carried out of the palette onto the canvas: it is declared,
         * placed, picked on the spot — the properties panel is open on it without a
         * second gesture — and a click on it goes on to the live component as well.
         */
        'a class carried from the palette becomes a part, picked and ready to press'($) {
            const stage = $bog_vmap_app_flow_stage($);
            stage.drop(calc, stage.client([200, 150]));
            // One declaration and one reference, and the placement beside them.
            const source = stage.app.doc_source();
            $mol_assert_ok(source.includes(`Calc ${calc}`));
            $mol_assert_ok(source.includes('<= Calc'));
            $mol_assert_like(stage.app.spots(), { Calc: { x: 200, y: 150 } });
            // The scene compiles what the document says, byte for byte.
            $mol_assert_equal(stage.scene.last('doc_set').src, source);
            // Picked by the drop itself: the ring is on the canvas and the inspector
            // is on the part, with the ports of its class in it.
            $mol_assert_equal(stage.app.selected(), 'Calc');
            $mol_assert_ok(stage.root.querySelector('[bog_vmap_app_pane_handle]') !== null);
            stage.field("Row('result').Value().Number().Num()");
            // A click on the part keeps the pick and goes on to the live component.
            stage.tap(stage.part_center('Calc'));
            $mol_assert_equal(stage.app.selected(), 'Calc');
            const click = stage.scene.last('click_at');
            $mol_assert_equal(click.x, 250);
            $mol_assert_equal(click.y, 175);
        },
        /**
         * A property typed into the inspector lands in the document as the line of
         * that property, and the scene is handed the document again.
         */
        'a value typed into the inspector goes into the document and to the scene'($) {
            const stage = $bog_vmap_app_flow_stage($);
            stage.drop(calc, stage.client([200, 150]));
            stage.tap(stage.part_center('Calc'));
            const before = stage.scene.sent('doc_set').length;
            stage.type(stage.field("Row('result').Value().Number().Num()"), '42');
            const source = stage.app.doc_source();
            $mol_assert_ok(source.includes(`Calc ${calc} result 42`));
            // The neighbouring lines are untouched: one property moved, not the class.
            $mol_assert_ok(source.includes('<= Calc'));
            $mol_assert_ok(stage.scene.sent('doc_set').length > before);
            $mol_assert_equal(stage.scene.last('doc_set').src, source);
        },
        /**
         * A wire drawn by hand: from the output dot of one part to the input dot of
         * another. Two lines go into the document, unplugging takes both away, and
         * the value the scene reports is shown on the wire.
         */
        'a wire drawn between two parts is written, labelled and unplugged'($) {
            const stage = $bog_vmap_app_flow_stage($);
            stage.drop(calc, stage.client([100, 100]));
            stage.drop(map, stage.client([400, 100]));
            stage.tap(stage.part_center('Calc'));
            const overlay = stage.overlay();
            const out = stage.port_dot('Calc', 'result', 'out');
            const into = stage.port_dot('Map', 'zoom', 'in');
            stage.press(overlay, out);
            stage.move(overlay, into);
            stage.release(overlay, into);
            stage.redraw();
            const source = stage.app.doc_source();
            $mol_assert_ok(source.includes('\tcalc_result = Calc result\n'));
            $mol_assert_ok(source.includes('zoom <= calc_result'));
            // The host asks the scene for the value of the wire it now draws.
            stage.scene.flush();
            $mol_assert_like(stage.scene.last('values_want').names, ['calc_result']);
            stage.scene.values({ calc_result: '42' });
            $mol_assert_like(stage.pane.wire_lines().map(line => [line.key, line.label]), [['Map.zoom', '42']]);
            // A press on the wired input pulls the wire out; let go over bare canvas
            // and both lines are gone from the document.
            stage.tap(stage.part_center('Map'));
            stage.press(overlay, stage.port_dot('Map', 'zoom', 'in'));
            stage.release(overlay, stage.client([550, 450]));
            stage.redraw();
            const after = stage.app.doc_source();
            $mol_assert_equal(after.includes('calc_result'), false);
            $mol_assert_like(stage.app.doc_wires(), []);
        },
        /**
         * The whole point of publishing: a part goes out as a class of the library,
         * its link goes into the palette field of a scene, and it is a component
         * again — droppable like any other.
         *
         * The library land is the home land here, so no proof of work, as in
         * `publish/publish.test.ts`. The link is resolved by the real stack through
         * the real database.
         */
        async 'a published part comes back through the palette field'($) {
            const stage = $bog_vmap_app_flow_stage($);
            const library = $bog_vmap_app_publish_store.make({
                $,
                shelf_land_config: () => $.$giper_baza_glob.home().land(),
            });
            stage.app.Publish().store = () => library;
            stage.drop(button, stage.client([200, 150]));
            stage.tap(stage.part_center('Button'));
            stage.click(stage.button('В библиотеку'));
            // Publishing encodes units, which is asynchronous even without the proof
            // of work; the click hands it to a fiber and answers at once.
            const link = await $bog_vmap_app_flow_settle(() => library.link());
            stage.redraw();
            $mol_assert_ok(link);
            $mol_assert_ok(stage.text().includes('опубликовано'));
            $mol_assert_ok(stage.text().includes(link));
            stage.type(stage.field('Shelf().Links()'), link);
            $mol_assert_like(stage.app.lands(), [link]);
            $mol_assert_like(stage.app.lib_classes().map(tree => tree.type), [`${d}bog_vmap_pub_button`]);
            // In the palette beside the classes of the pack, and it drops like them.
            stage.drop(`${d}bog_vmap_pub_button`, stage.client([400, 300]));
            $mol_assert_ok(stage.app.doc_source().includes(` ${d}bog_vmap_pub_button\n`));
            $mol_assert_equal(Object.keys(stage.app.spots()).length, 2);
        },
        /**
         * A second scene is a document of its own: made from the bar, it opens
         * empty, and going back brings the first one with everything on it.
         */
        async 'a second scene is a document of its own and the first one comes back'($) {
            const stage = $bog_vmap_app_flow_stage($);
            stage.drop(calc, stage.client([200, 150]));
            const first = stage.store.doc_current().link().str;
            const source = stage.app.doc_source();
            stage.click(stage.button('Новая сцена'));
            // The store makes the document in a fiber of its own, as the click does.
            await $bog_vmap_app_flow_settle(() => stage.store.doc_links().length > 1);
            stage.redraw();
            $mol_assert_equal(stage.store.doc_links().length, 2);
            $mol_assert_ok(stage.store.doc_current().link().str !== first);
            $mol_assert_equal(stage.app.doc_source(), `${stage.app.doc_root()} ${d}mol_view\n\tsub /\n`);
            $mol_assert_like(stage.app.spots(), {});
            // Back to the first one, by the same value the picker of the bar writes.
            const scenes = stage.app.Scenes();
            scenes.current(first);
            stage.redraw();
            $mol_assert_equal(stage.app.doc_source(), source);
            $mol_assert_like(stage.app.spots(), { Calc: { x: 200, y: 150 } });
        },
        /**
         * The sandbox is raised from markup, not from an address: there is exactly
         * one page in the project and the sandbox is not it.
         *
         * What the markup has to carry is checked here rather than argued: the
         * isolation, the absence of any address, and an ABSOLUTE address of the
         * bundle — an opaque origin has no base to resolve a relative one against.
         */
        'the frame is raised from markup and carries no address'($) {
            const stage = $bog_vmap_app_flow_stage($);
            const frame = stage.frame();
            $mol_assert_equal(frame.getAttribute('sandbox'), 'allow-scripts');
            $mol_assert_equal(frame.hasAttribute('src'), false);
            const html = frame.getAttribute('srcdoc') ?? '';
            const bundle = stage.app.scene_bundle();
            $mol_assert_ok(bundle.endsWith('/scene/web.js'));
            $mol_assert_ok(html.includes(`src="${bundle}"`));
            // the frame paints its own ground, see `scene_html()`
            $mol_assert_ok(html.includes('color-scheme:dark'));
        },
        /**
         * The pack travels the bridge, and it travels FIRST.
         *
         * The scene compiles nothing until it has been told a pack, because a class
         * picks its base once and a document built a moment early would inherit the
         * sandbox's own `$mol_view` for good. So the order of the first three
         * messages of a handshake is part of the contract, not an accident of how
         * the cells happen to be listed.
         */
        'the pack goes down the wire before the document and the libraries'($) {
            const stage = $bog_vmap_app_flow_stage($);
            const kinds = stage.scene.posted.map(message => message.kind);
            const pack = kinds.indexOf('pack_set');
            $mol_assert_ok(pack >= 0);
            $mol_assert_ok(pack < kinds.indexOf('doc_set'));
            $mol_assert_ok(pack < kinds.indexOf('libs_set'));
            $mol_assert_equal(stage.scene.last('pack_set')?.uri, stage.app.pack_script());
        },
        /**
         * One pack per frame, held by construction now that no address holds it: the
         * pack is part of the key of the frame, so naming another one gives a new
         * element and a realm that has never seen the first bundle. A land is
         * compiled into the sandbox instead, so a change of lands must not cost the
         * frame, its camera or its live instances.
         * @see ../ARCHITECTURE.md section 5
         */
        'a new pack gives a new frame, a new land keeps the old one'($) {
            const stage = $bog_vmap_app_flow_stage($);
            const field = stage.field('Shelf().Links()');
            const before = stage.frame();
            stage.type(field, 'http://pack.test/, AbCdEfGh');
            $mol_assert_ok(stage.frame() !== before);
            $mol_assert_like(stage.app.lands(), ['AbCdEfGh']);
            // the fresh frame has proved nothing yet, so nothing is pushed at it
            $mol_assert_equal(stage.pane.ready(), false);
            // it boots and gets the new pack first, exactly as the first one did
            const seen = stage.scene.posted.length;
            stage.scene.hello();
            $mol_assert_equal(stage.pane.ready(), true);
            $mol_assert_equal(stage.scene.posted[seen]?.kind, 'pack_set');
            $mol_assert_equal(stage.scene.last('pack_set')?.uri, 'http://pack.test/web.js');
            // a land rides the bridge, so the frame stands
            const kept = stage.frame();
            stage.type(field, 'http://pack.test/, AbCdEfGh, ZyXwVuTs');
            $mol_assert_equal(stage.frame(), kept);
            $mol_assert_like(stage.app.lands(), ['AbCdEfGh', 'ZyXwVuTs']);
        },
        /**
         * A change of pack must not be mistaken for a scene that died.
         *
         * The frame is replaced, and the new one then spends the whole cold load of
         * the pack saying nothing — 610 ms in the measurement of section 4, and much
         * worse on a slow line, against a watchdog limit of eight seconds. Two things
         * therefore have to hold across the swap, and they are checked apart because
         * they fail apart.
         *
         * NOTHING IS PUSHED at a window that has not booted. A push into a frame
         * still loading is lost silently, and the host would never learn that the
         * document it thinks it sent was never received.
         *
         * THE WATCH DOES NOT ARM. `warmed` is still true from the frame that just
         * went, so an armed watch here would accuse a perfectly healthy scene of
         * being stuck and offer to reload the very thing that is loading. This is
         * held by the handshake being kept per frame, not per pane.
         */
        'a change of pack raises no false alarm about the scene'($) {
            const stage = $bog_vmap_app_flow_stage($);
            const watch = () => stage.timers.filter(timer => timer.delay === stage.pane.answer_limit()).length;
            // real traffic first, so the scene has proved itself and the pulse is on
            stage.drop(calc, stage.client([200, 150]));
            $mol_assert_equal(stage.pane.warmed(), true);
            const sent = stage.scene.posted.length;
            const armed = watch();
            stage.type(stage.field('Shelf().Links()'), 'http://pack.test/');
            // a frame that has said nothing, and nothing said to it
            $mol_assert_equal(stage.pane.ready(), false);
            $mol_assert_equal(stage.scene.posted.length, sent);
            // and no claim made about its silence
            $mol_assert_equal(stage.pane.watchdog(), null);
            $mol_assert_equal(watch(), armed);
            $mol_assert_equal(stage.pane.stalled(), false);
            $mol_assert_equal(stage.text().includes('Сцена не отвечает'), false);
            // it boots, and only then does anything go out — the pack first
            stage.scene.hello();
            $mol_assert_equal(stage.pane.ready(), true);
            $mol_assert_equal(stage.scene.posted[sent]?.kind, 'pack_set');
            $mol_assert_equal(stage.scene.posted[sent]?.uri, 'http://pack.test/web.js');
        },
        /**
         * The palette field takes a pack and lands together, and refuses a second
         * pack out loud: the reason is under the field and the frame keeps the pack
         * it already loaded.
         */
        'the palette field takes a pack with lands and says why it refuses a second'($) {
            const stage = $bog_vmap_app_flow_stage($);
            const field = stage.field('Shelf().Links()');
            stage.type(field, 'http://pack.test/, AbCdEfGh');
            $mol_assert_equal(stage.app.pack_link(), 'http://pack.test/');
            $mol_assert_like(stage.app.lands(), ['AbCdEfGh']);
            const key = stage.pane.scene_key();
            $mol_assert_equal(stage.pane.pack_uri(), 'http://pack.test/web.js');
            stage.type(field, 'http://pack.test/, AbCdEfGh, http://other.test/');
            // The refusal is on screen, in the user's words, under the field.
            $mol_assert_ok(stage.text().includes($bog_vmap_lib_links_reason.pack_second));
            $mol_assert_ok(stage.text().includes('http://other.test/'));
            // The frame is the one it already was: no reload.
            $mol_assert_equal(stage.pane.scene_key(), key);
            $mol_assert_equal(stage.field('Shelf().Links()').value, 'http://pack.test/, AbCdEfGh, http://other.test/');
        },
        /**
         * The delete button takes the picked part out of the document, and the
         * camera cannot touch the document at all: panning and zooming leave the
         * text byte for byte where it was.
         */
        'delete takes the part out, and the camera leaves the document alone'($) {
            const stage = $bog_vmap_app_flow_stage($);
            stage.drop(calc, stage.client([100, 100]));
            stage.drop(map, stage.client([300, 100]));
            stage.tap(stage.part_center('Calc'));
            stage.click(stage.button('Удалить'));
            const source = stage.app.doc_source();
            $mol_assert_equal(source.includes('Calc'), false);
            $mol_assert_ok(source.includes(`Map ${map}`));
            $mol_assert_equal(stage.app.selected(), null);
            $mol_assert_like(Object.keys(stage.app.spots()), ['Map']);
            // A drag over bare canvas is a pan…
            const overlay = stage.overlay();
            stage.press(overlay, stage.client([450, 400]));
            stage.move(overlay, stage.client([500, 430]));
            stage.release(overlay, stage.client([500, 430]));
            stage.redraw();
            $mol_assert_like([...stage.pane.camera_shift()], [50, 30]);
            // …and the buttons of the bar are the zoom.
            stage.click(stage.button('+'));
            $mol_assert_ok(stage.text().includes('125%'));
            stage.click(stage.button('Сбросить вид'));
            $mol_assert_ok(stage.text().includes('100%'));
            $mol_assert_like([...stage.pane.camera_shift()], [0, 0]);
            $mol_assert_equal(stage.app.doc_source(), source);
        },
        /**
         * The artboard from the user's side: a page is put on the canvas, two parts
         * are dropped INTO it and go into its tree instead of onto the desk, and the
         * direction switch of the inspector decides how they stack — including where
         * the next drop goes in.
         */
        'a page takes the parts dropped into it and stacks them the way it is set'($) {
            const stage = $bog_vmap_app_flow_stage($);
            stage.click(stage.button('Артборд'));
            // Nothing marks a page as one: it is a view with a `sub` of its own.
            $mol_assert_equal(stage.app.selected(), 'Page');
            const node = stage.app.node();
            $mol_assert_like(node.sub_names('Page'), []);
            const page = stage.pane.part_box('Page');
            $mol_assert_ok(page);
            // Dropped inside the page, both go into its tree and neither takes a
            // coordinate: on the desk only the page itself lies.
            stage.drop(calc, stage.client([page.left + 200, page.top + 40]));
            stage.drop(map, stage.client([page.left + 200, page.top + 250]));
            $mol_assert_like(node.sub_names('Page'), ['Calc', 'Map']);
            $mol_assert_like(Object.keys(stage.app.spots()), ['Page']);
            $mol_assert_equal(stage.app.doc_source().includes('\t\tsub /\n\t\t\t<= Calc\n\t\t\t<= Map\n'), true);
            // The page is picked again by a click on the empty part of it.
            stage.tap(stage.client([page.left + 200, page.top + 250]));
            $mol_assert_equal(stage.app.selected(), 'Page');
            // The layout panel of the inspector turns the column into a row.
            stage.click(stage.check('рядом'));
            $mol_assert_ok(stage.app.doc_source().includes('flexDirection \\row'));
            $mol_assert_equal(stage.scene.last('doc_set').src, stage.app.doc_source());
            const first = stage.pane.part_box('Calc');
            const second = stage.pane.part_box('Map');
            $mol_assert_equal(first.top, second.top);
            $mol_assert_ok(second.left > first.left);
            // And the next drop is aimed by the same row: to the left of both is first.
            stage.drop(button, stage.client([page.left + 20, page.top + 20]));
            $mol_assert_like(node.sub_names('Page'), ['Button', 'Calc', 'Map']);
        },
        /**
         * A document opened by a link lives in a land of its own, and until that
         * land arrives every read of it suspends. THE SANDBOX MUST COME UP ANYWAY:
         * the markup of the frame is not the document's business, and an editor that
         * waits for the text before it raises the frame waits for ever on a document
         * whose master is not reachable — which is what «ожидание сцены…» was.
         */
        'the sandbox comes up while the document of the address is still on its way'($) {
            // Every read of the open document suspends, as an unsynced land does.
            const waiting = new Promise(() => { });
            const store = $bog_vmap_app_store.make({
                $,
                doc_land_config: () => null,
                source: () => { throw waiting; },
                spots: () => { throw waiting; },
                pack: () => { throw waiting; },
            });
            const stage = $bog_vmap_app_flow_stage($, { store });
            // The frame has its markup, so the scene boots and answers.
            $mol_assert_ok(stage.frame().getAttribute('srcdoc'));
            $mol_assert_equal(stage.pane.ready(), true);
            // The complaint itself: the head bar no longer says it is waiting.
            $mol_assert_equal(stage.text().includes('ожидание сцены'), false);
            // The palette of the document is unknown, so the standard one stands in
            // and is on screen rather than suspended.
            $mol_assert_equal(stage.app.links(), '');
            stage.classes_open();
            stage.class_row(calc);
        },
        /**
         * A scene that stopped answering is called out on a strip of its own, and
         * the button on it replaces the frame rather than talking to the stuck one.
         *
         * Time is the test's own: the timers of the stand never fire by themselves,
         * so the watchdog is asked to fire the moment its limit would have run out.
         */
        'a silent scene raises the strip and the button gives a fresh frame'($) {
            const stage = $bog_vmap_app_flow_stage($);
            stage.drop(calc, stage.client([200, 150]));
            $mol_assert_equal(stage.pane.stalled(), false);
            const frame = stage.frame();
            stage.scene.silence();
            // Something is pushed and never answered.
            stage.click(stage.button('+'));
            const watch = stage.timers.filter(timer => timer.delay === stage.pane.answer_limit()).at(-1);
            $mol_assert_ok(watch);
            watch.task();
            stage.redraw();
            $mol_assert_equal(stage.pane.stalled(), true);
            $mol_assert_ok(stage.text().includes('Сцена не отвечает'));
            stage.click(stage.button('Перезагрузить сцену'));
            $mol_assert_equal(stage.pane.stalled(), false);
            $mol_assert_equal(stage.pane.ready(), false);
            $mol_assert_equal(stage.text().includes('Сцена не отвечает'), false);
            // A frame element of its own, so the stuck document is gone with it.
            $mol_assert_ok(stage.frame() !== frame);
        },
        /**
         * Deleting a wired part takes its wires with it, from either end. A wire
         * left behind would name a node the document no longer declares, and the
         * scene compiles that into a call of a property nobody has.
         */
        'deleting a wired part leaves no wire to a node that is gone'($) {
            const stage = $bog_vmap_app_flow_stage($);
            stage.drop(calc, stage.client([100, 100]));
            stage.drop(map, stage.client([400, 100]));
            stage.tap(stage.part_center('Calc'));
            const overlay = stage.overlay();
            stage.press(overlay, stage.port_dot('Calc', 'result', 'out'));
            stage.move(overlay, stage.port_dot('Map', 'zoom', 'in'));
            stage.release(overlay, stage.port_dot('Map', 'zoom', 'in'));
            stage.redraw();
            $mol_assert_equal(stage.app.doc_wires().length, 1);
            // The source of the wire goes.
            stage.tap(stage.part_center('Calc'));
            stage.click(stage.button('Удалить'));
            $mol_assert_equal(stage.app.doc_source().includes('calc_result'), false);
            $mol_assert_like(stage.app.doc_wires(), []);
            $mol_assert_ok(stage.app.doc_source().includes(`Map ${map}`));
            // And the same from the other end: a wire drawn again and the consumer
            // deleted leaves the source part standing and no wire behind. The name
            // of the deleted part is free again, so the new one takes it.
            stage.drop(calc, stage.client([100, 300]));
            $mol_assert_equal(stage.app.selected(), 'Calc');
            stage.press(overlay, stage.port_dot('Calc', 'result', 'out'));
            stage.move(overlay, stage.port_dot('Map', 'zoom', 'in'));
            stage.release(overlay, stage.port_dot('Map', 'zoom', 'in'));
            stage.redraw();
            $mol_assert_equal(stage.app.doc_wires().length, 1);
            stage.tap(stage.part_center('Map'));
            stage.click(stage.button('Удалить'));
            $mol_assert_like(stage.app.doc_wires(), []);
            $mol_assert_equal(stage.app.doc_source().includes('calc_result'), false);
            $mol_assert_ok(stage.app.doc_source().includes(`Calc ${calc}`));
            $mol_assert_equal(stage.app.doc_source().includes(`Map ${map}`), false);
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    /**
     * Stand for the end to end scenarios of `flow.test.ts`: the whole editor in a
     * real DOM, with the sandbox replaced by a fake bridge peer.
     *
     * A `.test.ts` and not a plain module: nothing here may reach the product
     * bundle, and mam keeps test files out of it. Everything the stand fakes is
     * named below; the rest of the editor is the editor.
     *
     * `d` keeps `$` out of the string literals — mam builds its dependency graph by
     * a regexp over sources, literals included.
     */
    const d = '$';
    /**
     * Class tree of the donor pack, served instead of the network.
     *
     * Shaped like the `web.view.tree` of a deployed module, because that is what
     * the library parses: a class per block, properties under it. Two of them carry
     * a number and a string, which is what makes a wire between them possible.
     */
    $_1.$bog_vmap_app_flow_pack = [
        `${d}flow_button ${d}mol_view`,
        `\ttitle \\`,
        `\tenabled true`,
        `${d}flow_calc ${d}mol_view`,
        `\tresult 0`,
        `\top \\plus`,
        `${d}flow_map ${d}mol_view`,
        `\tzoom 0`,
        `\tmarker \\`,
        ``,
    ].join('\n');
    /**
     * A SECOND application, served at an address of its own.
     *
     * There to be added by hand: a person pastes the address of a deployed mol
     * application and its own classes join the shelf. One class is enough for that,
     * and a name of its own is what makes the difference visible.
     */
    $_1.$bog_vmap_app_flow_other = 'http://other.pack/';
    $_1.$bog_vmap_app_flow_other_pack = [
        `${d}shop_basket ${d}mol_view`,
        `\ttitle \\`,
        ``,
    ].join('\n');
    /** Where the pane sits in the viewport. jsdom lays nothing out, so it is told. */
    $_1.$bog_vmap_app_flow_rect = {
        left: 200, top: 50, width: 600, height: 500, right: 800, bottom: 550,
    };
    /** Size the fake scene reports for a part with nothing inside it. */
    $_1.$bog_vmap_app_flow_size = { width: 100, height: 50 };
    /** Size it reports for a container, big enough to aim a drop inside it. */
    $_1.$bog_vmap_app_flow_board = { width: 400, height: 300 };
    /**
     * Globals of a browser that node does not define and jsdom does not export.
     *
     * `$mol_view_selection` names `ShadowRoot` and `$mol_touch` names `PointerEvent`
     * bare, so a field or a gesture in a node test dies on a `ReferenceError` that
     * says nothing about the editor. Pointer capture is missing from jsdom
     * elements outright, and `$mol_touch` calls it without a guard.
     */
    function browser_gaps($) {
        const dom = $.$mol_dom_context;
        Object.assign(globalThis, {
            ShadowRoot: globalThis.ShadowRoot ?? dom.ShadowRoot,
            PointerEvent: globalThis.PointerEvent ?? dom.PointerEvent,
        });
        const proto = dom.Element.prototype;
        if (!proto.setPointerCapture)
            Object.assign(proto, {
                setPointerCapture() { },
                releasePointerCapture() { },
                hasPointerCapture() { return false; },
            });
    }
    /** The editor of the previous scenario, taken down before the next one starts. */
    let $bog_vmap_app_flow_last = null;
    /**
     * Waits for work a click handed to a fiber of its own: making a document,
     * publishing a part. Both answer at once and land later, so a scenario that
     * looked at the result on the next tick would sometimes be too early.
     */
    async function $bog_vmap_app_flow_settle(done, limit = 300) {
        const till = Date.now() + limit;
        while (!done() && Date.now() < till) {
            await new Promise(next => setTimeout(next, 2));
        }
        return done();
    }
    $_1.$bog_vmap_app_flow_settle = $bog_vmap_app_flow_settle;
    function $bog_vmap_app_flow_stage($, over = {}) {
        browser_gaps($);
        const dom = $.$mol_dom_context;
        // The editor of the previous scenario keeps window listeners alive, and its
        // document node keeps taking events; both go before this one is built.
        $bog_vmap_app_flow_last?.destructor();
        dom.document.body.innerHTML = '';
        const timers = [];
        class $mol_after_timeout_flow extends $mol_after_timeout {
            constructor(delay, task) {
                super(delay, task);
                clearTimeout(this.id);
                timers.push(this);
            }
        }
        $.$mol_after_timeout = $mol_after_timeout_flow;
        class $mol_fetch_flow extends $mol_fetch {
            static text(input) {
                const uri = String(input);
                if (uri === $_1.$bog_vmap_app_flow_other + 'web.view.tree')
                    return $_1.$bog_vmap_app_flow_other_pack;
                if (uri.endsWith('web.view.tree'))
                    return $_1.$bog_vmap_app_flow_pack;
                return $mol_fail(new Error('network in a test: ' + uri));
            }
        }
        $.$mol_fetch = $mol_fetch_flow;
        // A store of the scenario's own is how a document that is still loading, or
        // somebody else's, is put on the stand; the default one is a fresh document
        // in the home land, made here so that nothing waits on `boot`.
        const store = over.store ?? $bog_vmap_app_store.make({ $, doc_land_config: () => null });
        if (!over.store)
            store.doc_add('Сцена 1');
        const app = $bog_vmap_app.make({ $, store: () => store });
        $bog_vmap_app_flow_last = app;
        const posted = [];
        const queue = [];
        /** Which way a node stacks what is inside it, as its `style` says. */
        const direction = (name) => {
            const style = app.node().over_tree(name, 'style')?.kids[0] ?? null;
            return $bog_vmap_lang_dict_get(style, 'flexDirection')?.value
                ?? 'row'; // what `[mol_view]` is with no direction written
        };
        /**
         * Geometry of the document as a scene would measure it: free parts at their
         * spots, and whatever a container carries stacked inside it along the
         * direction the node declares.
         *
         * A rough flex box and nothing more — boxes of one size, laid end to end —
         * but enough for what the host does with the numbers: hit testing, the ring,
         * the ends of a wire, and aiming a drop between two children of a page.
         */
        const sizes = () => {
            const res = {};
            const node = app.node();
            const place = (name, path, x, y) => {
                const kids = node.sub_names(name);
                const box = { x, y, ...kids ? $_1.$bog_vmap_app_flow_board : $_1.$bog_vmap_app_flow_size };
                res[path] = box;
                if (!kids)
                    return box;
                const row = direction(name) === 'row';
                let at = 0;
                for (const kid of kids) {
                    if (!kid)
                        continue;
                    const inner = place(kid, path + '/' + kid, row ? x + at : x, row ? y : y + at);
                    at += row ? inner.width : inner.height;
                }
                return box;
            };
            const spots = app.spots();
            for (const name of Object.keys(spots)) {
                place(name, app.doc_root() + '/' + name, spots[name].x, spots[name].y);
            }
            return res;
        };
        /**
         * The far end of the bridge: records what the host sends and lines up the
         * answer a scene owes. Answered on `flush()` and not here, because a reply
         * posted from inside `postMessage` would write cells while the cell that
         * pushed is still computing.
         */
        let silent = false;
        let exposed = false;
        const peer = {
            /**
             * A frame in a sandbox has an opaque origin, and reading it from outside
             * throws — which is how the host tells a working sandbox from a missing
             * one. So the peer throws by default, and answers only for the scenario
             * that asks what happens when the sandbox is gone.
             */
            get origin() {
                if (exposed)
                    return 'http://localhost';
                return $mol_fail(new Error('SecurityError: cross-origin frame'));
            },
            postMessage(data) {
                const message = data;
                posted.push(message);
                if (silent)
                    return;
                if (message.kind === 'ping')
                    queue.push({ kind: 'pong', nonce: message.nonce });
                else if (message.kind !== 'values_want')
                    queue.push({ kind: 'sizes', sizes: sizes() });
            },
        };
        /** Hands one message to the host the way the frame does: a window event from the peer. */
        const deliver = (data) => {
            const event = new dom.MessageEvent('message', { data: { ns: $bog_vmap_bridge_ns, ...data } });
            Object.defineProperty(event, 'source', { value: peer });
            dom.dispatchEvent(event);
        };
        const scene = {
            posted,
            /** Everything of one kind the host has sent, in order. */
            sent(kind) {
                return posted.filter(message => message.kind === kind);
            },
            /** The last message of a kind, or undefined. */
            last(kind) {
                return this.sent(kind).at(-1);
            },
            /** Answers everything owed, then lets the editor redraw on the answers. */
            flush() {
                while (queue.length)
                    deliver(queue.shift());
                app.dom_tree();
            },
            /** Values of the wires, as the scene reports them. */
            values(values) {
                deliver({ kind: 'values', values });
                app.dom_tree();
            },
            /** From now on the scene takes everything and says nothing back. */
            silence() {
                silent = true;
                queue.length = 0;
            },
            /** The frame boots and announces itself, as a scene does on load. */
            hello() {
                deliver({ kind: 'ready' });
                app.dom_tree();
                this.flush();
            },
            /** The sandbox is gone: the origin of the frame reads back from the host. */
            expose() {
                exposed = true;
                app.dom_tree();
            },
        };
        const pane = app.Pane();
        pane.scene_peer = () => peer;
        const root = app.dom_tree();
        dom.document.body.appendChild(root);
        // The pane and the camera plugin read their rectangle through a cell that
        // only a browser ever refreshes, so both are told it outright.
        const rect = $_1.$bog_vmap_app_flow_rect;
        pane.dom_node().getBoundingClientRect = () => rect;
        pane.view_rect = () => rect;
        pane.Touch().view_rect = () => rect;
        // A muted stand is the frame that boots and then says nothing: the scene
        // announces itself and stops, which is what document code looping on the
        // first compile looks like from here. The editor never sees geometry, so it
        // never warms, and that is the state the cold watch exists for.
        if (over.mute) {
            deliver({ kind: 'ready' });
            silent = true;
            queue.length = 0;
            app.dom_tree();
        }
        else {
            deliver({ kind: 'ready' });
            app.dom_tree();
            scene.flush();
        }
        const found = (selector, note, match) => {
            const el = [...root.querySelectorAll(selector)].find(match);
            if (!el)
                $mol_fail(new Error(`nothing on screen: ${note}`));
            return el;
        };
        /**
         * A pointer event as a browser makes one: cancelable, so that
         * `preventDefault` in a handler really stops the camera, and bubbling, so
         * that a press on the overlay reaches the plugins of the pane.
         */
        const pointer = (type, point, over = {}) => {
            return new dom.PointerEvent(type, {
                bubbles: true,
                cancelable: true,
                clientX: point[0],
                clientY: point[1],
                button: 0,
                buttons: type === 'pointerup' ? 0 : 1,
                pointerId: 1,
                ...over,
            });
        };
        return {
            app, pane, store, scene, root, timers,
            /** Viewport point of a point in the screen space of the pane. */
            client(point) {
                return [rect.left + point[0], rect.top + point[1]];
            },
            /** The whole editor as text, for a coarse look at what is on screen. */
            text() {
                return root.textContent ?? '';
            },
            /** Views that failed to render, by their id. The frame is not one: see below. */
            broken() {
                return [...root.querySelectorAll('[mol_view_error]')].map(el => el.getAttribute('id'));
            },
            button(title) {
                return found('[role=button]', `button «${title}»`, el => el.textContent?.startsWith(title) ?? false);
            },
            /**
             * A checkbox or one option of a switch, by its label. Not a button:
             * `$mol_check` answers `role="checkbox"`, and the options of a switch are
             * checks, so the head bar toggles and the layout panel are found here.
             */
            check(title) {
                return found('[role=checkbox]', `check «${title}»`, el => el.textContent?.includes(title) ?? false);
            },
            /** A row of the palette, by the class it offers. */
            class_row(klass) {
                return found('[bog_vmap_app_palette_item]', `palette row ${klass}`, el => el.textContent === klass);
            },
            /** Unfolds the class list of the panel, the second level under the shelf. */
            classes_open() {
                app.Shelf().classes_showed(true);
                app.dom_tree();
                scene.flush();
            },
            /** A row of the scene list, addressed by the name of the document. */
            scene_row(title) {
                return found('[bog_vmap_app_scenes_scene_row]', `scene row ${title}`, el => el.textContent === title);
            },
            /** A row of the shelf, addressed by what it says. */
            shelf_row(title) {
                return found('[bog_vmap_app_shelf_item_row]', `shelf row ${title}`, el => el.textContent === title);
            },
            /** A text field, addressed by the tail of the id $mol builds out of the path to it. */
            field(tail) {
                return found('input, textarea', `field ${tail}`, el => el.getAttribute('id')?.endsWith(tail) ?? false);
            },
            overlay() {
                return root.querySelector('[bog_vmap_app_pane_overlay]');
            },
            /** The frame element itself, so that a restart can be seen to replace it. */
            frame() {
                return root.querySelector('iframe');
            },
            /** Types into a field the way a person does: the value, then the input event. */
            type(el, value) {
                el.value = value;
                el.dispatchEvent(new dom.Event('input', { bubbles: true }));
                app.dom_tree();
                scene.flush();
            },
            /**
             * Leaves a field, which is how a name is committed without pressing
             * Enter: the rename is bound to `blur` as well, because a person who
             * typed a name and clicked elsewhere meant it.
             */
            blur(el) {
                el.dispatchEvent(new dom.Event('blur', { bubbles: true }));
                app.dom_tree();
                scene.flush();
            },
            click(el) {
                el.dispatchEvent(new dom.MouseEvent('click', { bubbles: true, cancelable: true }));
                app.dom_tree();
                scene.flush();
            },
            press(el, point, over = {}) {
                el.dispatchEvent(pointer('pointerdown', point, over));
            },
            move(el, point, over = {}) {
                el.dispatchEvent(pointer('pointermove', point, over));
            },
            release(el, point, over = {}) {
                el.dispatchEvent(pointer('pointerup', point, over));
            },
            /**
             * Carries a class from the palette onto the canvas: a press on the row,
             * a move across the window, a release over the overlay. The pointer
             * moves on the window because that is where the editor listens for it.
             *
             * The class list is the SECOND level of the panel and is folded away
             * when the editor opens, so the gesture starts by opening it, exactly as
             * a person reaching for a primitive does.
             */
            drop(klass, point) {
                this.classes_open();
                this.press(this.class_row(klass), [10, 300]);
                dom.dispatchEvent(pointer('pointermove', point));
                this.release(this.overlay(), point);
                app.dom_tree();
                scene.flush();
            },
            /** A click on the canvas: press and release without moving. */
            tap(point, over = {}) {
                this.press(this.overlay(), point, over);
                this.release(this.overlay(), point, over);
                app.dom_tree();
                scene.flush();
            },
            /** Centre of a part on screen, as the scene has measured it. */
            part_center(name) {
                const box = pane.part_box(name);
                if (!box)
                    $mol_fail(new Error(`part ${name} is not measured`));
                return this.client([box.left + box.width / 2, box.top + box.height / 2]);
            },
            /**
             * Viewport point of the dot of a port, from the geometry the pane draws
             * the dots with: the box of the part and the row of the port among the
             * wirable ports of its class.
             */
            port_dot(name, port, side) {
                const box = pane.part_box(name);
                const index = app.part_ports(name).findIndex(known => known.name === port);
                if (!box || index < 0)
                    $mol_fail(new Error(`no port ${name}.${port} on screen`));
                return this.client($bog_vmap_app_wire_port_point(box, side, index));
            },
            redraw() {
                app.dom_tree();
            },
        };
    }
    $_1.$bog_vmap_app_flow_stage = $bog_vmap_app_flow_stage;
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    /**
     * Tests of the editor shell that need no DOM.
     *
     * Nothing here renders. What is checked is the rule that the canvas must not be
     * able to break: where the camera points is not part of the document.
     *
     * `d` keeps `$` out of the string literals — mam builds its dependency graph by
     * a regexp over sources, literals included, so a bare class name in a fixture
     * would drag a whole module into the bundle.
     */
    const d = '$';
    /**
     * A session of its own per test.
     *
     * `$mol_state_session` keeps its values on the CLASS — in `sessionStorage`
     * where there is one, in a field of the class where there is not — so without
     * this every test would inherit whatever the previous one folded away. A
     * subclass per test gets a store of its own, the same trick the address mock
     * uses in `app/store/store.test.ts`.
     */
    $mol_test_mocks.push($ => {
        // Generic, because the base is: a plain `extends` drops the type parameter
        // from the constructor and the assignment below is then refused.
        class $mol_state_session_mock extends $.$mol_state_session {
        }
        $.$mol_state_session = $mol_state_session_mock;
    });
    $mol_test({
        /**
         * FIRST INVARIANT OF CULLING: what is drawn may depend on the camera, what is
         * stored may not — not by a byte.
         *
         * Cheap to check and worth checking, because the tempting way to implement
         * culling is to push a document with the off screen parts left out of `sub`.
         * That reads as harmless, costs a full recompile per frame of panning, and
         * quietly makes the saved document a function of where the user was looking.
         * This test fails the moment anybody tries it.
         */
        'panning does not touch the document'($) {
            const app = $bog_vmap_app.make({ $ });
            app.part_drop(`${d}mol_button_minor`, 100, 200);
            app.part_drop(`${d}mol_string`, 300, 400);
            const before = app.doc_source();
            const pane = app.Pane();
            pane.camera_shift(new $mol_vector_2d(-900, -700));
            pane.camera_zoom(4);
            pane.camera_shift(new $mol_vector_2d(0, 0));
            pane.camera_zoom(1);
            $mol_assert_equal(app.doc_source(), before);
        },
        /** Placement is editor state and moves with the camera never, with a drag only. */
        'panning does not touch the placement'($) {
            const app = $bog_vmap_app.make({ $ });
            app.part_drop(`${d}mol_button_minor`, 100, 200);
            const before = JSON.stringify(app.spots());
            const pane = app.Pane();
            pane.camera_shift(new $mol_vector_2d(-500, -500));
            $mol_assert_equal(JSON.stringify(app.spots()), before);
        },
        /**
         * Boxes survive a report that does not mention them, because culling makes
         * silence mean «not drawn» rather than «has no size». Only a delete clears one.
         */
        'measured boxes survive a report without them'($) {
            const pane = $bog_vmap_app_pane.make({
                $,
                doc_root: () => `${d}doc`,
            });
            pane.sizes_last = {
                [`${d}doc/A`]: { x: 0, y: 0, width: 10, height: 10 },
                [`${d}doc/B`]: { x: 20, y: 0, width: 10, height: 10 },
            };
            // What a report looks like once `B` has been culled: it is simply absent.
            pane.sizes_last = { ...pane.sizes_last, [`${d}doc/A`]: { x: 5, y: 5, width: 10, height: 10 } };
            $mol_assert_equal(pane.sizes_last[`${d}doc/A`].x, 5);
            $mol_assert_equal(Boolean(pane.sizes_last[`${d}doc/B`]), true);
            pane.sizes_forget('B');
            $mol_assert_equal(Boolean(pane.sizes_last[`${d}doc/B`]), false);
            $mol_assert_equal(Boolean(pane.sizes_last[`${d}doc/A`]), true);
        },
        /** A part's own sub views go with it, or they would outlive their owner. */
        'forgetting a part forgets what was measured inside it'($) {
            const pane = $bog_vmap_app_pane.make({
                $,
                doc_root: () => `${d}doc`,
            });
            pane.sizes_last = {
                [`${d}doc/Icon`]: { x: 0, y: 0, width: 10, height: 10 },
                [`${d}doc/Icon/Path`]: { x: 0, y: 0, width: 8, height: 8 },
                [`${d}doc/Icons`]: { x: 0, y: 0, width: 10, height: 10 },
            };
            pane.sizes_forget('Icon');
            $mol_assert_equal(Boolean(pane.sizes_last[`${d}doc/Icon`]), false);
            $mol_assert_equal(Boolean(pane.sizes_last[`${d}doc/Icon/Path`]), false);
            // A name this one is a prefix of is a different part and must stay.
            $mol_assert_equal(Boolean(pane.sizes_last[`${d}doc/Icons`]), true);
        },
        /**
         * The whole way of a land from the field to the wire, on a land built by hand:
         * what the scene is sent is the parts of the shelf, in order, three texts each,
         * and the palette and the inspector are handed the classes of the same parts.
         *
         * `land()` is overridden on the library so no link is ever looked up; the link
         * in the field is shaped like a real one and points nowhere. No proof of work,
         * no master, so the test is well inside its second.
         */
        'the sources of the lands reach the scene as they lie in the shelf'($) {
            const land = $giper_baza_land.make({ $ });
            const shelf = land.Data($bog_vmap_lib_land_shelf);
            const card_src = `${d}my_card ${d}mol_view\n\tprice 0\n`;
            const badge_src = `${d}my_badge ${d}my_card\n`;
            const card = shelf.Parts(null).make(null);
            card.tree(card_src);
            card.css('[my_card] { color: red }');
            const badge = shelf.Parts(null).make(null);
            badge.tree(badge_src);
            badge.js('price(){ return 1 }');
            const lib = $bog_vmap_lib_land.make({ $, shelf: () => shelf });
            const app = $bog_vmap_app.make({ $ });
            app.Lib().land = () => lib;
            app.links('https://mol.hyoo.ru, AbCdEfGh_12345678_ZyXwVuTs');
            $mol_assert_like(app.libs(), [
                { tree: card_src, js: '', css: '[my_card] { color: red }' },
                { tree: badge_src, js: 'price(){ return 1 }', css: '' },
            ]);
            // the same classes for the palette and, beside the root, for the inspector
            $mol_assert_like(app.lib_classes().map(tree => tree.type), [`${d}my_card`, `${d}my_badge`]);
            const peers = app.node_peers().map(tree => tree.type);
            $mol_assert_like(peers, [`${d}my_card`, `${d}my_badge`, app.doc_root()]);
            // a field with no lands sends an empty list, not nothing
            app.links('https://mol.hyoo.ru');
            $mol_assert_like(app.libs(), []);
        },
        /**
         * Section 5 in one test: a pack cannot be unloaded from a realm, so a change
         * of pack is a change of the KEY of the frame and the element is replaced; a
         * land is compiled into the sandbox like the document, so a change of lands
         * leaves the key — and with it the frame, its camera and its live
         * instances — exactly where they were.
         *
         * The pack rides the bridge now rather than the address of the frame, so
         * what is read here is the key, which is what the guarantee actually rests
         * on. That a key really makes a new element is `flow.test.ts`.
         */
        'a change of lands keeps the frame, a change of pack replaces it'($) {
            const app = $bog_vmap_app.make({ $ });
            const pane = app.Pane();
            app.links('https://mol.hyoo.ru');
            const before = pane.scene_key();
            $mol_assert_equal(pane.pack_uri(), 'https://mol.hyoo.ru/web.js');
            app.links('https://mol.hyoo.ru, AbCdEfGh_12345678_ZyXwVuTs');
            $mol_assert_equal(pane.scene_key(), before);
            $mol_assert_like(app.lands(), ['AbCdEfGh_12345678_ZyXwVuTs']);
            // the slash grows in the derived address, the field keeps what was typed
            app.links('https://b-on-g.github.io/gram, AbCdEfGh_12345678_ZyXwVuTs');
            $mol_assert_ok(pane.scene_key() !== before);
            $mol_assert_equal(pane.pack_uri(), 'https://b-on-g.github.io/gram/web.js');
            $mol_assert_equal(app.links(), 'https://b-on-g.github.io/gram, AbCdEfGh_12345678_ZyXwVuTs');
            // a second pack is refused: the frame keeps the first
            app.links('https://b-on-g.github.io/gram, https://mol.hyoo.ru');
            $mol_assert_equal(pane.pack_uri(), 'https://b-on-g.github.io/gram/web.js');
            $mol_assert_equal(app.links_parsed().rejected.length, 1);
            // a field naming no pack falls back to the standard palette, see below
            app.links('AbCdEfGh_12345678_ZyXwVuTs');
            $mol_assert_ok(!app.pack_link().startsWith('https://b-on-g.github.io/gram'));
            $mol_assert_like(app.lands(), ['AbCdEfGh_12345678_ZyXwVuTs']);
        },
        /**
         * The two layouts of one pack, from the address of the editor page alone.
         *
         * The dev server keeps every module in `<pack>/<module>/-/`, while a deploy
         * publishes the editor at the root of the site and the other modules as
         * folders under it. Neither the sandbox nor the standard palette has a page
         * on either layout, so what is derived is a bundle and a folder, and nothing
         * is configured or typed. The derivation itself is covered in `lib`; here it
         * is that the editor asks for the right two siblings.
         */
        'the sandbox and the standard palette are found on both layouts'($) {
            // the address of the page is put in by hand rather than through `make`:
            // it is a method of the derived class, and `make` types its overrides
            // against the class the tree declares
            const dev = $bog_vmap_app.make({ $ });
            dev.page_uri = () => 'http://localhost:9080/bog/vmap/app/-/test.html';
            $mol_assert_equal(dev.scene_bundle(), 'http://localhost:9080/bog/vmap/scene/-/web.js');
            $mol_assert_equal(dev.pack_link(), 'http://localhost:9080/bog/vmap/part/-/');
            $mol_assert_equal(dev.pack_script(), 'http://localhost:9080/bog/vmap/part/-/web.js');
            const prod = $bog_vmap_app.make({ $ });
            prod.page_uri = () => 'https://b-on-g.github.io/vmap/';
            $mol_assert_equal(prod.scene_bundle(), 'https://b-on-g.github.io/vmap/scene/web.js');
            $mol_assert_equal(prod.pack_link(), 'https://b-on-g.github.io/vmap/part/');
            $mol_assert_equal(prod.pack_script(), 'https://b-on-g.github.io/vmap/part/web.js');
            // what a person typed is used as typed and never replaced by the sibling
            prod.links('https://mol.hyoo.ru');
            $mol_assert_equal(prod.pack_link(), 'https://mol.hyoo.ru/');
            $mol_assert_equal(prod.links(), 'https://mol.hyoo.ru');
        },
        /**
         * An artboard is a node with a `sub` of its own and a width, written in
         * plain `view.tree`. No class of ours, so an exported document depends on
         * nothing of this pack, and no mark on the side, so the text is the whole
         * truth about what is a page.
         */
        'an artboard is an ordinary node with a sub and a width'($) {
            const app = $bog_vmap_app.make({ $ });
            app.board_add();
            const source = app.doc_source();
            $mol_assert_ok(source.includes(`Page ${d}mol_view`));
            $mol_assert_ok(source.includes('width \\1280px'));
            // `[mol_view]` is `display: flex` with no direction, which is a ROW.
            $mol_assert_ok(source.includes('flexDirection \\column'));
            $mol_assert_like(app.node().sub_names(), ['Page']);
            $mol_assert_like(app.node().sub_names('Page'), []);
            $mol_assert_like(app.doc_containers(), ['Page']);
            $mol_assert_equal(app.selected(), 'Page');
            // It lies on the canvas like any free part, so a second one goes beside
            // the first rather than on top of it — that is what several pages are.
            $mol_assert_ok(Boolean(app.spots()['Page']));
            app.board_add();
            $mol_assert_like(app.doc_containers(), ['Page', 'Page_2']);
        },
        /**
         * Which way a container stacks is stated by the document, and the host reads
         * it out rather than guessing: the boxes of the children say nothing while
         * there are fewer than two of them, which is every page just made.
         */
        'the direction a container is set to comes off the document'($) {
            const app = $bog_vmap_app.make({ $ });
            app.board_add();
            $mol_assert_equal(app.doc_axis('Page'), 'column');
            app.part_drop(`${d}mol_button_minor`, 2000, 100);
            $mol_assert_equal(app.doc_axis('Button_minor'), '');
            // What the layout panel writes is what the canvas reads back.
            app.node().over_set('Page', 'style', app.node().tree().struct('style', [
                app.node().tree().struct('*', [
                    app.node().tree().struct('flexDirection', [app.node().tree().data('row')]),
                ]),
            ]));
            $mol_assert_equal(app.doc_axis('Page'), 'row');
        },
        /**
         * The same drop, two ways of being laid out, told apart by where the release
         * happened: inside a page it is a position in the tree, outside it is a
         * coordinate on the desk.
         */
        'a drop inside an artboard goes into its tree and gets no coordinate'($) {
            const app = $bog_vmap_app.make({ $ });
            const pane = app.Pane();
            app.board_add();
            pane.sizes_last = { [`${app.doc_root()}/Page`]: { x: 0, y: 0, width: 1280, height: 720 } };
            pane.sizes_version(pane.sizes_version() + 1);
            app.part_drop(`${d}mol_button_minor`, 100, 100);
            $mol_assert_like(app.node().sub_names('Page'), ['Button_minor']);
            $mol_assert_equal(app.spots()['Button_minor'], undefined);
            // Outside the page it is a free part with a coordinate, as before.
            app.part_drop(`${d}mol_string`, 2000, 100);
            $mol_assert_like(app.node().sub_names(), ['Page', 'String']);
            $mol_assert_like(app.spots()['String'], { x: 2000, y: 100 });
        },
        /** Carried into a page, a part loses the coordinate that no longer moves it. */
        'a part carried into an artboard leaves the placement'($) {
            const app = $bog_vmap_app.make({ $ });
            app.board_add();
            app.part_drop(`${d}mol_button_minor`, 2000, 100);
            $mol_assert_like(app.spots()['Button_minor'], { x: 2000, y: 100 });
            app.tree_move({ name: 'Button_minor', owner: 'Page', index: 0 });
            $mol_assert_like(app.node().sub_names('Page'), ['Button_minor']);
            $mol_assert_like(app.node().sub_names(), ['Page']);
            $mol_assert_equal(app.spots()['Button_minor'], undefined);
        },
        /**
         * A page goes with everything on it. Left behind, its children would stay
         * declared and referenced by nothing: nothing draws them, so nothing can
         * select them, so nothing can ever take them out again.
         */
        'deleting an artboard takes what is laid out inside it'($) {
            const app = $bog_vmap_app.make({ $ });
            app.board_add();
            app.part_drop(`${d}mol_button_minor`, 2000, 100);
            app.tree_move({ name: 'Button_minor', owner: 'Page', index: 0 });
            app.selected('Page');
            app.node_delete();
            const names = app.node().prop_names();
            $mol_assert_equal(names.includes('Page'), false);
            $mol_assert_equal(names.includes('Button_minor'), false);
            $mol_assert_like(app.node().sub_names(), []);
        },
        /**
         * The name of a node is the key of the pick, of the placement and of the
         * remembered box at once, so a rename that only touches the text orphans all
         * three: the node lives under the new name while the editor points at one
         * nothing declares.
         */
        'renaming a node carries the pick and the placement with it'($) {
            const app = $bog_vmap_app.make({ $ });
            app.part_drop(`${d}mol_button_minor`, 100, 200);
            app.selected('Button_minor');
            const spot = app.spots()['Button_minor'];
            $mol_assert_equal(Boolean(spot), true);
            app.node_rename('Button_minor', 'Send');
            $mol_assert_equal(app.node().prop_names().includes('Send'), true);
            $mol_assert_equal(app.node().prop_names().includes('Button_minor'), false);
            $mol_assert_equal(app.selected(), 'Send');
            $mol_assert_like(app.spots()['Send'], spot);
            $mol_assert_equal(app.spots()['Button_minor'], undefined);
        },
        /** A node drawn on a page keeps its place in that page under the new name. */
        'renaming a node on a board keeps it drawn'($) {
            const app = $bog_vmap_app.make({ $ });
            app.board_add();
            app.part_drop(`${d}mol_button_minor`, 2000, 100);
            app.tree_move({ name: 'Button_minor', owner: 'Page', index: 0 });
            app.node_rename('Button_minor', 'Send');
            $mol_assert_like(app.node().sub_names('Page'), ['Send']);
        },
        /**
         * The document refuses the rename, and the editor state must not move for a
         * rename that did not happen.
         */
        'a rename onto a name already taken changes nothing'($) {
            const app = $bog_vmap_app.make({ $ });
            app.part_drop(`${d}mol_button_minor`, 100, 200);
            app.part_drop(`${d}mol_string`, 300, 400);
            app.selected('Button_minor');
            const before = app.doc_source();
            const spots = JSON.stringify(app.spots());
            $mol_assert_fail(() => app.node_rename('Button_minor', 'String'), Error);
            $mol_assert_equal(app.doc_source(), before);
            $mol_assert_equal(JSON.stringify(app.spots()), spots);
            $mol_assert_equal(app.selected(), 'Button_minor');
        },
        /**
         * The field of the inspector renames through the editor, so the pick and the
         * placement travel with it. Bound rather than left to the class model the
         * inspector holds: that one knows the text and nothing else.
         */
        'the name field of the inspector renames the picked node'($) {
            const app = $bog_vmap_app.make({ $ });
            app.part_drop(`${d}mol_button_minor`, 100, 200);
            app.selected('Button_minor');
            $mol_assert_equal(app.node_title(), 'Button_minor');
            app.node_title('Send');
            $mol_assert_equal(app.selected(), 'Send');
            $mol_assert_equal(app.node().prop_names().includes('Send'), true);
            $mol_assert_equal(app.node_title(), 'Send');
            $mol_assert_equal(app.node_title_note(), '');
        },
        /**
         * The refusal has to reach the person in words: a throw out of a `$mol_string`
         * setter lands in `setCustomValidity`, which is not where anybody looks.
         */
        'a name already taken is refused in words and moves nothing'($) {
            const app = $bog_vmap_app.make({ $ });
            app.part_drop(`${d}mol_button_minor`, 100, 200);
            app.part_drop(`${d}mol_string`, 300, 400);
            app.selected('Button_minor');
            const before = app.doc_source();
            app.node_title('String');
            $mol_assert_equal(app.doc_source(), before);
            $mol_assert_equal(app.selected(), 'Button_minor');
            // The exact words, because words are the whole point of this path.
            $mol_assert_equal(app.node_title_note(), 'Имя «String» в этом документе уже занято. Узел по-прежнему называется «Button_minor»');
            // The message belongs to the node it is about, so another pick is clean.
            app.selected('String');
            $mol_assert_equal(app.node_title_note(), '');
        },
        /**
         * The interface is Russian and the field asks for a name, so a Russian name
         * is the first thing anybody types into it — and a node name is a property
         * name, which `view.tree` allows latin letters, digits and `_` and nothing
         * else. Left to the model this came back as `Bad property signature`, which
         * is neither the language of the person nor an answer to what they did.
         */
        'a name the language does not allow is refused in words and moves nothing'($) {
            const app = $bog_vmap_app.make({ $ });
            app.part_drop(`${d}mol_button_minor`, 100, 200);
            app.selected('Button_minor');
            const before = app.doc_source();
            app.node_title('Кнопка');
            $mol_assert_equal(app.doc_source(), before);
            $mol_assert_equal(app.selected(), 'Button_minor');
            $mol_assert_equal(app.node_title_note(), 'Имя «Кнопка» не годится: в имени узла только латинские буквы, цифры и подчёркивание.'
                + ' Узел по-прежнему называется «Button_minor»');
            // A space is the other everyday way to write a name nothing can address.
            app.node_title('Send button');
            $mol_assert_equal(app.doc_source(), before);
            $mol_assert_ok(app.node_title_note().startsWith('Имя «Send button» не годится'));
            // And a name the language does allow still goes through.
            app.node_title('Send');
            $mol_assert_equal(app.selected(), 'Send');
            $mol_assert_equal(app.node_title_note(), '');
        },
        /**
         * A wire spells the name of the node it reads, so a rename that misses it
         * leaves a wire pointing at a name nothing declares — and the canvas draws
         * it, because a wire is a line of the document like any other. The model is
         * proven to rewrite references; what is pinned here is that the field of the
         * inspector reaches that path and not some other one.
         */
        'renaming through the name field carries the wire'($) {
            const app = $bog_vmap_app.make({ $ });
            app.part_drop(`${d}mol_string`, 100, 200);
            app.part_drop(`${d}mol_button_minor`, 300, 400);
            app.link_add({ from: 'String', from_prop: 'value', to: 'Button_minor', to_prop: 'title' });
            $mol_assert_equal(app.doc_wires().length, 1);
            $mol_assert_equal(app.doc_wires()[0].from, 'String');
            app.selected('String');
            app.node_title('Field');
            $mol_assert_equal(app.selected(), 'Field');
            // One wire still, reading the node under its new name. Not dropped, and
            // not doubled by a second one left behind under the old name.
            $mol_assert_equal(app.doc_wires().length, 1);
            $mol_assert_equal(app.doc_wires()[0].from, 'Field');
            $mol_assert_equal(app.doc_wires()[0].to, 'Button_minor');
            $mol_assert_equal(app.node().prop_names().includes('String'), false);
        },
        /**
         * The button hands over the module the export builds, folder included.
         *
         * Names spelled out rather than compared against a second call of the same
         * builder: a comparison of the export with itself would pass on any wiring at
         * all, including one where the button downloads the wrong document.
         */
        'the download offers the module the export builds'($) {
            const app = $bog_vmap_app.make({ $ });
            app.part_drop(`${d}mol_button_minor`, 100, 200);
            const module = app.export_state().module;
            $mol_assert_equal(app.export_ready(), true);
            $mol_assert_equal(module.path, 'my/site/page');
            $mol_assert_equal(module.name, 'page');
            // A dropped component writes no body and no styles, so the module carries
            // neither file: what comes out is what a person would have written.
            $mol_assert_equal(module.files.map(file => file.name).join(' '), 'page.view.tree page.meta.tree index.html');
            // The declaration downloaded is the document, not a rendering of it.
            $mol_assert_equal(module.files[0].text, app.doc_source());
            // And the folder is on the button itself, where it is read without
            // hovering: section 10, the folder is not free and the author chose it.
            $mol_assert_equal(app.export_title(), 'Скачать my/site/page');
            $mol_assert_equal(app.export_file(), 'page.zip');
            $mol_assert_ok(app.export_hint().includes('npx mam my/site/page'));
        },
        /**
         * The archive carries the module folder inside, so unpacking at the root of a
         * checkout puts the files where mam resolves the class names to.
         */
        'the archive is the module in its folder'($) {
            const app = $bog_vmap_app.make({ $ });
            app.part_drop(`${d}mol_button_minor`, 100, 200);
            const bytes = $.$bog_vmap_app_export_zip_archive(app.export_state().module);
            const text = new TextDecoder().decode(bytes);
            $mol_assert_ok(text.includes('my/site/page/page.view.tree'));
            $mol_assert_ok(text.includes('my/site/page/index.html'));
            // Stored, not compressed, so the sources travel as themselves.
            $mol_assert_ok(text.includes(`${d}mol_button_minor`));
        },
        /** Two artboards make a site of two pages, and the download carries its router. */
        'a document of two artboards downloads with a router'($) {
            const app = $bog_vmap_app.make({ $ });
            app.doc_source([
                `${d}bog_vmap_app_page ${d}mol_view`,
                `	Home ${d}mol_view sub /`,
                `	About ${d}mol_view sub /`,
                `	sub /`,
                `		<= Home`,
                `		<= About`,
                ``,
            ].join('\n'));
            const module = app.export_state().module;
            $mol_assert_equal(module.root, `${d}bog_vmap_app_page_app`);
            $mol_assert_equal(module.path, 'bog/vmap/app/page');
            const tree = module.files[0].text;
            $mol_assert_ok(tree.includes(`${d}bog_vmap_app_page_app ${d}mol_view`));
            // The address key is the standard one, so a link between the pages is an
            // ordinary link written in the document itself. Addressed by name and not
            // by number: which files a module carries follows from what it has.
            const file_of = (suffix) => module.files.find(file => file.name.endsWith(suffix))?.text ?? '';
            $mol_assert_ok(file_of('.view.ts').includes(`${d}mol_state_arg`));
            $mol_assert_ok(file_of('index.html').includes(`${d}bog_vmap_app_page_app`));
        },
        /**
         * A body that works in the preview and would not compile refuses the whole
         * download, and the reason stands on the screen in words instead of in a
         * console. Without this the person meets it as a build failure on a machine
         * the editor never sees.
         */
        'an untyped body refuses the download and says why'($) {
            const app = $bog_vmap_app.make({ $ });
            app.part_drop(`${d}mol_button_minor`, 100, 200);
            app.root_js('greeting( who ) {\n\treturn who\n}\n');
            $mol_assert_equal(app.export_ready(), false);
            $mol_assert_equal(app.export_title(), 'Скачать');
            const notes = app.export_notes();
            $mol_assert_equal(notes.length, 2);
            $mol_assert_ok(notes[1].includes(`${d}my_site_page`));
            $mol_assert_ok(notes[1].includes('строка 1'));
            $mol_assert_ok(notes[1].includes('greeting'));
            $mol_assert_ok(notes[1].includes('who'));
            // The rows are on the screen, and they are the sentences themselves.
            $mol_assert_equal(app.export_rows().length, 2);
            $mol_assert_equal(app.export_text(1), notes[1]);
            $mol_assert_ok(app.body().includes(app.Export_note()));
            // And nothing can be taken out of the editor while it is refused.
            $mol_assert_fail(() => app.export_blob(), Error);
            // The strip goes as soon as the body is typed, and the button comes back.
            app.root_js('greeting( who: string ) {\n\treturn who\n}\n');
            $mol_assert_equal(app.export_ready(), true);
            $mol_assert_equal(app.export_notes().length, 0);
            $mol_assert_equal(app.body().includes(app.Export_note()), false);
        },
        /**
         * The button must not make the editor wait for the document.
         *
         * A document opened by a link lives in a land that suspends every read until
         * it syncs, and the toolbar is drawn from the same cell the button reads. A
         * suspension passed on from here suspends the whole editor, frame included,
         * and the sandbox never comes up — measured, the standing test of that
         * invariant went red the moment this was wired to the toolbar with a rethrow.
         */
        'a document still on its way holds nothing up'($) {
            const waiting = new Promise(() => { });
            const app = $bog_vmap_app.make({
                $,
                store: () => $bog_vmap_app_store.make({
                    $,
                    doc_land_config: () => null,
                    source: () => { throw waiting; },
                    spots: () => { throw waiting; },
                    pack: () => { throw waiting; },
                }),
            });
            // Nothing to download yet, and nothing to complain about either: a wait is
            // not a refusal, so no strip stands on the screen saying it is.
            $mol_assert_equal(app.export_ready(), false);
            $mol_assert_equal(app.export_notes().length, 0);
            $mol_assert_equal(app.body().includes(app.Export_note()), false);
            $mol_assert_equal(app.export_hint(), 'Документ ещё загружается');
        },
        /**
         * An untouched editor downloads too, and downloads a module that builds: an
         * empty page is a legal document, not a state to be guarded against.
         */
        'an untouched document downloads as the empty page'($) {
            const app = $bog_vmap_app.make({ $ });
            const module = app.export_state().module;
            $mol_assert_equal(app.export_ready(), true);
            $mol_assert_equal(module.root, `${d}my_site_page`);
            $mol_assert_equal(module.files[0].text, `${d}my_site_page ${d}mol_view sub /\n`);
            // Out of this pack, in a folder of the author's own: an untouched
            // document used to be unpacked inside the editor itself.
            $mol_assert_equal(module.path, 'my/site/page');
            // No body and no styles anywhere, so neither file is written at all.
            $mol_assert_like(module.files.map(file => file.name), ['page.view.tree', 'page.meta.tree', 'index.html']);
        },
        /**
         * THE INVARIANT OF A DOCUMENT OF SEVERAL CLASSES: an edit of one class is an
         * edit of one class.
         *
         * Measured before this was true: a drop off the palette left the text holding
         * the root alone, because the editor edited through a model of ONE class laid
         * over the WHOLE text — a write there serializes the class it touched as the
         * entire document. No error, no warning, the neighbour simply gone.
         */
        'an edit of the root leaves the other classes byte for byte'($) {
            const app = $bog_vmap_app.make({ $ });
            app.doc_source([
                `${d}bog_vmap_app_page ${d}mol_view sub /`,
                `${d}bog_vmap_app_card ${d}mol_view title \\Карточка`,
                ``,
            ].join('\n'));
            const before = app.doc_model().class_source(`${d}bog_vmap_app_card`);
            app.part_drop(`${d}mol_button_minor`, 100, 200);
            app.node_rename('Button_minor', 'Btn');
            app.node_delete();
            $mol_assert_equal(app.doc_model().class_source(`${d}bog_vmap_app_card`), before);
            $mol_assert_like(app.doc_model().names(), [
                `${d}bog_vmap_app_page`,
                `${d}bog_vmap_app_card`,
            ]);
        },
        /**
         * A base always stands above its heir in the exported file, whatever order
         * the document keeps them in: `class $A extends $[ '$B' ]` takes its base at
         * the moment it is declared, and the generator walks the file downwards. The
         * document is free to hold them in any order, and does — a class is added
         * where the text was typed.
         */
        'the exported file puts a base above its heir after an edit'($) {
            const app = $bog_vmap_app.make({ $ });
            app.doc_source([
                `${d}bog_vmap_app_page ${d}bog_vmap_app_base sub /`,
                `${d}bog_vmap_app_base ${d}mol_view title \\Основа`,
                ``,
            ].join('\n'));
            app.part_drop(`${d}mol_button_minor`, 100, 200);
            // The document keeps the order it was written in.
            $mol_assert_like(app.doc_model().names(), [
                `${d}bog_vmap_app_page`,
                `${d}bog_vmap_app_base`,
            ]);
            const tree = app.export_state().module.files[0].text;
            $mol_assert_ok(tree.indexOf(`${d}bog_vmap_app_base ${d}mol_view`)
                < tree.indexOf(`${d}bog_vmap_app_page ${d}bog_vmap_app_base`));
        },
        /**
         * The root class is the first class of the text and follows it, so renaming
         * it moves the folder the module is unpacked into — which is the whole reason
         * the name is editable at all. Section 10: the folder is not free.
         */
        'renaming the root moves the module and the folder on the button'($) {
            const app = $bog_vmap_app.make({ $ });
            app.part_drop(`${d}mol_button_minor`, 100, 200);
            $mol_assert_equal(app.export_state().module.path, 'my/site/page');
            app.root_title(`${d}my_shop_page`);
            $mol_assert_equal(app.doc_root(), `${d}my_shop_page`);
            $mol_assert_equal(app.root_title(), `${d}my_shop_page`);
            const module = app.export_state().module;
            $mol_assert_equal(module.path, 'my/shop/page');
            $mol_assert_equal(module.root, `${d}my_shop_page`);
            $mol_assert_equal(app.export_title(), 'Скачать my/shop/page');
            $mol_assert_ok(module.files[0].text.startsWith(`${d}my_shop_page `));
        },
        /**
         * A rename and its undo, because the two halves fail apart: the text is
         * rewritten by the model and the body and the styles are carried by hand, so
         * a rename that lost them on the way back would be a rename that loses them,
         * full stop. Everything has to come back to the byte it started from.
         */
        'a rename and the rename back leave the document as it was'($) {
            const app = $bog_vmap_app.make({ $ });
            app.doc_source([
                `${d}my_site_page ${d}mol_view sub /`,
                `${d}my_site_card ${d}mol_view title \\Карточка`,
                ``,
            ].join('\n'));
            app.part_drop(`${d}mol_button_minor`, 100, 200);
            app.root_js('greeting(){\n\treturn 1\n}\n');
            app.class_js(`${d}my_site_card`, 'note(){\n\treturn 2\n}\n');
            app.root_css('[my] {\n\tcolor: red;\n}');
            const source = app.doc_source();
            app.root_title(`${d}my_shop_page`);
            app.root_title(`${d}my_site_page`);
            $mol_assert_equal(app.doc_source(), source);
            $mol_assert_equal(app.doc_root(), `${d}my_site_page`);
            $mol_assert_equal(app.root_js(), 'greeting(){\n\treturn 1\n}\n');
            $mol_assert_equal(app.root_css(), '[my] {\n\tcolor: red;\n}');
            // The class that was never renamed kept its own body throughout.
            $mol_assert_equal(app.class_js(`${d}my_site_card`), 'note(){\n\treturn 2\n}\n');
        },
        /**
         * What a rename must not cost. The pick, the placement and the wires are keyed
         * by PROPERTY name, and a rename of the class touches no property — but the
         * handwritten body and the styles are stored per CLASS name, so those two are
         * carried by hand and would be lost silently without it.
         */
        'renaming the root carries the body and orphans nothing'($) {
            const app = $bog_vmap_app.make({ $ });
            app.part_drop(`${d}mol_string`, 100, 200);
            app.part_drop(`${d}mol_button_minor`, 300, 400);
            app.link_add({ from: 'String', from_prop: 'value', to: 'Button_minor', to_prop: 'title' });
            app.selected('String');
            app.root_js('greeting(){\n\treturn 1\n}\n');
            app.root_css('[my] {\n\tcolor: red;\n}');
            const source = app.doc_source();
            const spots = JSON.stringify(app.spots());
            const wires = JSON.stringify(app.doc_wires());
            app.root_title(`${d}my_shop_page`);
            $mol_assert_equal(app.root_js(), 'greeting(){\n\treturn 1\n}\n');
            $mol_assert_equal(app.root_css(), '[my] {\n\tcolor: red;\n}');
            $mol_assert_equal(app.selected(), 'String');
            $mol_assert_equal(JSON.stringify(app.spots()), spots);
            $mol_assert_equal(JSON.stringify(app.doc_wires()), wires);
            // The text differs in the class name and in nothing else.
            $mol_assert_equal(app.doc_source(), source.replace(`${d}my_site_page`, `${d}my_shop_page`));
        },
        /**
         * A name changed in the TEXT of a class is a rename too, and the body and the
         * styles have to follow it there as well.
         *
         * Measured before they did: they stayed under the old name, so what the scene
         * is handed — `doc_js` and `doc_css` — came out empty, and the behaviour the
         * person had written stopped working in the document with nothing on the
         * screen saying so. The text is the truth of section 1, so the fix is to
         * follow it rather than to forbid editing the name here.
         */
        'a class renamed in its own text carries its body and its styles'($) {
            const app = $bog_vmap_app.make({ $ });
            app.part_drop(`${d}mol_button_minor`, 100, 200);
            app.root_js('greeting(){\n\treturn 1\n}\n');
            app.root_css('[my] {\n\tcolor: red;\n}');
            app.code_whole(true);
            app.code_source(app.code_source().replace(`${d}my_site_page`, `${d}my_shop_page`));
            $mol_assert_equal(app.doc_root(), `${d}my_shop_page`);
            $mol_assert_equal(app.class_js(`${d}my_shop_page`), 'greeting(){\n\treturn 1\n}\n');
            $mol_assert_equal(app.class_css(`${d}my_shop_page`), '[my] {\n\tcolor: red;\n}');
            // What the scene is handed, which is where the loss actually showed.
            $mol_assert_equal(app.doc_js()[`${d}my_shop_page`], 'greeting(){\n\treturn 1\n}\n');
            $mol_assert_ok(app.doc_css().includes('color: red'));
        },
        /**
         * One name gone and one arrived is a rename. Two of either is somebody
         * rewriting the slot, and there is no telling which became which — a guess
         * would move a body into a class that never had one. Nothing travels, and
         * nothing is lost: what was stored still answers to the name it was stored
         * under.
         */
        'a slot rewritten into two classes carries nothing and loses nothing'($) {
            const app = $bog_vmap_app.make({ $ });
            app.part_drop(`${d}mol_button_minor`, 100, 200);
            app.root_js('greeting(){\n\treturn 1\n}\n');
            app.code_whole(true);
            app.code_source([
                `${d}my_shop_page ${d}mol_view sub /`,
                `${d}my_shop_card ${d}mol_view title \\Карточка`,
                ``,
            ].join('\n'));
            $mol_assert_like(app.doc_model().names(), [
                `${d}my_shop_page`,
                `${d}my_shop_card`,
            ]);
            $mol_assert_equal(app.class_js(`${d}my_shop_page`), '');
            $mol_assert_equal(app.class_js(`${d}my_shop_card`), '');
            // Still under the name it was written under, and still readable there.
            $mol_assert_equal(app.class_js(`${d}my_site_page`), 'greeting(){\n\treturn 1\n}\n');
        },
        /**
         * The other way a slot grows a class: the one on screen stays and a second is
         * typed under it. No name left the document, so nothing is a rename, and the
         * class that stayed keeps everything it had.
         */
        'a second class typed under the first carries nothing away from it'($) {
            const app = $bog_vmap_app.make({ $ });
            app.part_drop(`${d}mol_button_minor`, 100, 200);
            app.root_js('greeting(){\n\treturn 1\n}\n');
            app.code_whole(true);
            app.code_source(app.code_source() + `${d}my_site_card ${d}mol_view title \\Карточка\n`);
            $mol_assert_like(app.doc_model().names(), [
                `${d}my_site_page`,
                `${d}my_site_card`,
            ]);
            $mol_assert_equal(app.doc_root(), `${d}my_site_page`);
            $mol_assert_equal(app.class_js(`${d}my_site_page`), 'greeting(){\n\treturn 1\n}\n');
            $mol_assert_equal(app.class_js(`${d}my_site_card`), '');
        },
        /**
         * Typing is not renaming. Every letter of a name is a prefix of it, and most
         * prefixes of a class name are legal class names, so a field that wrote per
         * keystroke would rename the class — and remake the node that holds it — once
         * per letter. The field holds a draft and the rename happens on Enter or on
         * leaving it, exactly as the name of a node does in the inspector.
         */
        'the root name is committed on submit and not on a keystroke'($) {
            const app = $bog_vmap_app.make({ $ });
            app.part_drop(`${d}mol_button_minor`, 100, 200);
            const before = app.doc_source();
            app.root_draft(`${d}my`);
            app.root_draft(`${d}my_shop`);
            app.root_draft(`${d}my_shop_page`);
            $mol_assert_equal(app.doc_source(), before);
            $mol_assert_equal(app.doc_root(), `${d}my_site_page`);
            app.root_submit();
            $mol_assert_equal(app.doc_root(), `${d}my_shop_page`);
            // The draft is keyed by the name it started from, so the field now shows
            // the new name with nothing to clear.
            $mol_assert_equal(app.root_draft(), `${d}my_shop_page`);
        },
        /**
         * A name that cannot become a folder is refused where it was typed, in words,
         * and the document is left alone. Without the refusal the mistake would only
         * show up as `Root package not found` on a build machine.
         */
        'a root name that is not a module path is refused in words'($) {
            const app = $bog_vmap_app.make({ $ });
            app.part_drop(`${d}mol_button_minor`, 100, 200);
            const before = app.doc_source();
            $mol_assert_equal(app.root_title('Страница'), `${d}my_site_page`);
            $mol_assert_equal(app.doc_source(), before);
            $mol_assert_ok(app.root_title_note().includes('Страница'));
            $mol_assert_ok(app.body().includes(app.Root_note()));
            // And the name the document still carries. The field keeps the refused
            // one — there has to be something to correct — so without this the real
            // name would be nowhere on the screen at all.
            app.root_draft('Страница');
            app.root_submit();
            $mol_assert_equal(app.root_draft(), 'Страница');
            $mol_assert_ok(app.root_title_note().includes(`${d}my_site_page`));
            // A single segment is not a path either: mam resolves every underscore
            // into a folder, and the export refuses a prefix shorter than two.
            $mol_assert_equal(app.root_title(`${d}page`), `${d}my_site_page`);
            $mol_assert_equal(app.doc_source(), before);
            // And a name another class of the document already carries.
            app.doc_source(before + `${d}my_site_card ${d}mol_view title \\Карточка\n`);
            $mol_assert_equal(app.root_title(`${d}my_site_card`), `${d}my_site_page`);
            $mol_assert_ok(app.root_title_note().includes('already declared'));
        },
        /**
         * A pick belongs to the document it was made in.
         *
         * One pick for the whole editor left a ring hanging over the empty canvas of
         * a brand new scene and opened the inspector on a node that scene never had;
         * the panel then answered with a red strip in every field, grew the page and
         * pushed the head bar off screen. Seen on the deploy, 09.09.2026.
         */
        async 'a pick belongs to its scene, and a new scene opens with none'($) {
            const stage = $bog_vmap_app_flow_stage($);
            stage.drop(`${d}flow_calc`, stage.client([200, 150]));
            const first = stage.store.doc_current().link().str;
            $mol_assert_equal(stage.app.selected(), 'Calc');
            stage.click(stage.button('Новая сцена'));
            // The store makes the document in a fiber of its own, as the click does.
            await $bog_vmap_app_flow_settle(() => stage.store.doc_links().length > 1);
            stage.redraw();
            // Nothing picked, so no ring on the canvas and an invitation in the panel
            // instead of an inspector opened on a node the document does not have.
            $mol_assert_equal(stage.app.selected(), null);
            $mol_assert_equal(stage.root.querySelector('[bog_vmap_app_pane_handle]'), null);
            $mol_assert_ok(stage.text().includes('Выберите узел на холсте'));
            // Back to the first scene, and the pick is where it was left.
            const scenes = stage.app.Scenes();
            scenes.current(first);
            stage.redraw();
            $mol_assert_equal(stage.app.selected(), 'Calc');
        },
        /**
         * A pick that names nothing the document declares is no pick at all.
         *
         * The other half of the same defect, and the one that would come back
         * elsewhere: the panel asks the document rather than trusting the name, so a
         * document that does not parse gives an invitation and not twenty failures.
         */
        'a pick naming nothing in the document leaves the panel inviting'($) {
            const stage = $bog_vmap_app_flow_stage($);
            stage.drop(`${d}flow_calc`, stage.client([200, 150]));
            $mol_assert_equal(stage.app.selection_alive(), true);
            // The node goes out of the text under the pick, as a rename or an edit
            // in the code panel can do.
            stage.app.doc_source(`${stage.app.doc_root()} ${d}mol_view\n\tsub /\n`);
            stage.redraw();
            $mol_assert_equal(stage.app.selected(), 'Calc');
            $mol_assert_equal(stage.app.selection_alive(), false);
            $mol_assert_ok(stage.text().includes('Выберите узел на холсте'));
        },
        /**
         * A click is «add this», a drag is «add it HERE».
         *
         * Whoever clicked a shelf row aimed at nothing, so the piece must not fall
         * into whatever happens to cover the middle of the view. It did: a map asked
         * for by a click landed between the two halves of a wired pair, because the
         * pair was under the middle. Seen on the deploy 09.09.2026.
         */
        'a click puts a free part beside what covers the middle, never inside it'($) {
            const stage = $bog_vmap_app_flow_stage($);
            // A page under the middle of the canvas, which is where a board lands.
            stage.click(stage.button('Артборд'));
            const page = stage.app.selected();
            $mol_assert_ok(page);
            stage.click(stage.shelf_row('Блок'));
            const node = stage.app.node();
            const block = stage.app.selected();
            // Free on the canvas, and not a child of the page.
            $mol_assert_ok(node.sub_names('').includes(block));
            $mol_assert_equal(node.sub_names(page)?.includes(block) ?? false, false);
            // Beside it and not over it: a free part left in the middle of a page
            // would be drawn on top and read as a part of it.
            const box = stage.pane.part_size(page);
            const spot = stage.app.spots()[block];
            $mol_assert_ok(box);
            $mol_assert_ok(spot.y >= box.y + box.height);
            // And a SECOND click clears the block it just put there, not only the
            // page: two pieces at one point look like one thing on the canvas.
            stage.click(stage.shelf_row('Блок'));
            const next = stage.app.selected();
            const below = stage.app.spots()[next];
            const first = stage.pane.part_size(block);
            $mol_assert_ok(next !== block);
            $mol_assert_ok(below.y >= first.y + first.height);
        },
        /**
         * What is typed stays in the field after a refusal, and the name the node
         * still carries is on screen beside it.
         *
         * Two halves of one decision. Clearing the field would mean typing the whole
         * name again to fix one letter, which is the opposite of what a refusal is
         * for; keeping it means the panel shows a name the document does not have,
         * so the real one has to be visible or the person is left guessing which of
         * the two is true.
         */
        'a refused name stays in the field, and the real one is in the refusal'($) {
            const stage = $bog_vmap_app_flow_stage($);
            stage.drop(`${d}flow_calc`, stage.client([200, 150]));
            stage.tap(stage.part_center('Calc'));
            const field = stage.field('Inspect().Title()');
            stage.type(field, 'Кнопка');
            // The submit is a separate gesture: a rename per keystroke would rename
            // the node to every prefix of what is being typed.
            stage.blur(field);
            // Nothing moved, what was typed is still there to be fixed.
            $mol_assert_equal(stage.app.selected(), 'Calc');
            $mol_assert_equal(stage.field('Inspect().Title()').value, 'Кнопка');
            // And the panel says which name the node actually has.
            $mol_assert_ok(stage.text().includes('Узел по-прежнему называется «Calc»'));
        },
        /**
         * «Новая сцена» makes a document, opens it, and puts it in the ADDRESS —
         * checked through a real click on the button and a real click on a row.
         *
         * The address was the untested half: scenarios switched documents by calling
         * the picker directly, so nothing ever proved that a gesture reaches
         * `$mol_state_arg` at all. A report from the deploy that the list does not
         * grow and the address does not follow had no test to answer it.
         *
         * WHAT THIS CANNOT SAY ANYTHING ABOUT is the timing in a browser: the node
         * build of `$mol_state_arg` writes the address into a cell at once, while
         * the web build defers it into `$mol_after_frame`, that is into
         * `requestAnimationFrame` — which does not tick in a hidden tab. This test
         * proves the wiring; a frame is a thing only a visible window has.
         */
        async 'a click on «Новая сцена» makes a scene, and the address follows the pick'($) {
            const stage = $bog_vmap_app_flow_stage($);
            const first = stage.store.doc_current().link().str;
            $mol_assert_equal(stage.store.doc_links().length, 1);
            stage.click(stage.button('Новая сцена'));
            // The store makes the document in a fiber of its own, as the click does.
            await $bog_vmap_app_flow_settle(() => stage.store.doc_links().length > 1);
            stage.redraw();
            const second = stage.store.doc_current().link().str;
            $mol_assert_equal(stage.store.doc_links().length, 2);
            $mol_assert_ok(second !== first);
            // In the address, which is what a reload and a shared link read.
            $mol_assert_equal($.$mol_state_arg.value('doc'), second);
            // Both scenes are on screen, and a click on a row moves the address back.
            stage.click(stage.scene_row('Сцена 1'));
            $mol_assert_equal(stage.store.doc_current().link().str, first);
            $mol_assert_equal($.$mol_state_arg.value('doc'), first);
            // A THIRD and a FOURTH, because the report from the deploy was about the
            // fourth: the address is written by a fiber that has already run twice,
            // and a fiber replays its reads from its own cache — if the address were
            // rebuilt from a stale copy of itself, it would show up here.
            stage.click(stage.button('Новая сцена'));
            await $bog_vmap_app_flow_settle(() => stage.store.doc_links().length > 2);
            stage.click(stage.button('Новая сцена'));
            await $bog_vmap_app_flow_settle(() => stage.store.doc_links().length > 3);
            stage.redraw();
            const fourth = stage.store.doc_current().link().str;
            $mol_assert_equal(stage.store.doc_links().length, 4);
            $mol_assert_equal($.$mol_state_arg.value('doc'), fourth);
            // And back to the first from there, by a click on its row.
            stage.click(stage.scene_row('Сцена 1'));
            $mol_assert_equal($.$mol_state_arg.value('doc'), first);
        },
        /**
         * Folding a panel away survives a reload: the choice is in the session, so
         * a fresh editor in the same window opens as the last one was left.
         *
         * In the SESSION and not in the address: the address is a link somebody
         * shares, and a layout travelling with it would fold a stranger's panels.
         */
        'which panels are open outlives the page'($) {
            const one = $bog_vmap_app.make({ $ });
            // The editor opens with the two panels and no code.
            $mol_assert_equal(one.palette_showed(), true);
            $mol_assert_equal(one.inspect_showed(), true);
            $mol_assert_equal(one.code_showed(), false);
            one.palette_showed(false);
            one.code_showed(true);
            // A NEW instance is what a reload makes, and it finds the same layout.
            const two = $bog_vmap_app.make({ $ });
            $mol_assert_equal(two.palette_showed(), false);
            $mol_assert_equal(two.inspect_showed(), true);
            $mol_assert_equal(two.code_showed(), true);
            // And the canvas is drawn without the panel that was folded away.
            $mol_assert_equal(two.body_main().includes(two.Side()), false);
            $mol_assert_equal(two.body_main().includes(two.Code()), true);
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    /**
     * Tests of the archive.
     *
     * A format nobody in the project reads back: the readers are the unpacker of
     * the operating system and the archiver of the browser, and neither is here.
     * So the bytes are checked against the specification directly — signatures,
     * offsets, checksums — and the checksum against a value produced by zlib, which
     * is a witness of its own rather than this code agreeing with itself.
     *
     * `d` keeps `$` out of the string literals: mam builds its dependency graph by
     * a regexp over sources, literals included.
     */
    const d = '$';
    /** Little endian integer at a position, the way every zip reader takes one. */
    function number_at(bytes, at, size) {
        let value = 0;
        for (let i = size - 1; i >= 0; --i)
            value = value * 256 + bytes[at + i];
        return value;
    }
    function text_at(bytes, at, size) {
        return new TextDecoder().decode(bytes.slice(at, at + size));
    }
    /**
     * Entries as the central directory declares them, which is where a reader
     * looks. Walking the local headers instead would prove nothing about the
     * directory, and the directory is what an unpacker trusts.
     */
    function entries_of(bytes) {
        const count = number_at(bytes, bytes.length - 12, 2);
        let at = number_at(bytes, bytes.length - 6, 4);
        const out = [];
        for (let i = 0; i < count; ++i) {
            const name_size = number_at(bytes, at + 28, 2);
            out.push({
                signature: number_at(bytes, at, 4),
                crc: number_at(bytes, at + 16, 4),
                size: number_at(bytes, at + 24, 4),
                name: text_at(bytes, at + 46, name_size),
                offset: number_at(bytes, at + 42, 4),
            });
            at += 46 + name_size;
        }
        return out;
    }
    /** Content of one entry, read through its local header the way an unpacker does. */
    function body_of(bytes, offset) {
        const name_size = number_at(bytes, offset + 26, 2);
        const extra_size = number_at(bytes, offset + 28, 2);
        const size = number_at(bytes, offset + 18, 4);
        const at = offset + 30 + name_size + extra_size;
        return text_at(bytes, at, size);
    }
    const module = {
        path: 'bog/site',
        name: 'site',
        root: `${d}bog_site_page`,
        files: [
            { name: 'site.view.tree', text: `${d}bog_site_page ${d}mol_view\n\tsub /\n` },
            { name: 'index.html', text: '<!doctype html>\n' },
        ],
    };
    $mol_test({
        /**
         * The checksum against zlib, not against a second implementation of the same
         * table: a table wrong in the same way twice would pass any self comparison,
         * and a wrong checksum is exactly what makes an archive refuse to open.
         */
        'the checksum is the one every reader computes'($) {
            $mol_assert_equal($.$bog_vmap_app_export_zip_crc32(new TextEncoder().encode('hello')), 907060870);
            $mol_assert_equal($.$bog_vmap_app_export_zip_crc32(new TextEncoder().encode('привет')), 779501134);
            // An empty entry is a normal one, and its checksum is not a special case.
            $mol_assert_equal($.$bog_vmap_app_export_zip_crc32(new Uint8Array(0)), 0);
        },
        /** Signatures and counts, so that a reader finds the directory at all. */
        'the archive ends with a directory of every file'($) {
            const bytes = $.$bog_vmap_app_export_zip(module.files);
            $mol_assert_equal(number_at(bytes, 0, 4), 0x04034b50);
            $mol_assert_equal(number_at(bytes, bytes.length - 22, 4), 0x06054b50);
            $mol_assert_equal(number_at(bytes, bytes.length - 12, 2), 2);
            const entries = entries_of(bytes);
            $mol_assert_equal(entries.length, 2);
            $mol_assert_equal(entries[0].signature, 0x02014b50);
            $mol_assert_equal(entries[1].signature, 0x02014b50);
        },
        /**
         * THE POINT OF THE WHOLE FILE: what the directory promises is what lies at
         * the offset it promises it at. An archive whose offsets are off by a header
         * opens as empty, or as garbage, and nothing else in the editor would notice.
         */
        'every entry lies where the directory says it does'($) {
            const bytes = $.$bog_vmap_app_export_zip(module.files);
            for (const entry of entries_of(bytes)) {
                $mol_assert_equal(number_at(bytes, entry.offset, 4), 0x04034b50);
                const file = module.files.find(file => file.name === entry.name);
                $mol_assert_equal(body_of(bytes, entry.offset), file.text);
                $mol_assert_equal(entry.crc, $.$bog_vmap_app_export_zip_crc32(new TextEncoder().encode(file.text)));
            }
        },
        /**
         * Text is stored in UTF-8, and the size in the header is the size in bytes.
         * A size counted in characters cuts a russian comment in half, and the
         * document of a russian speaking author is the ordinary case here.
         */
        'non ascii text keeps its bytes'($) {
            const bytes = $.$bog_vmap_app_export_zip([
                { name: 'note.txt', text: 'привет' },
            ]);
            const entry = entries_of(bytes)[0];
            $mol_assert_equal(entry.size, 12);
            $mol_assert_equal(body_of(bytes, entry.offset), 'привет');
        },
        /** Bit 11 of the flags, without which a non ascii NAME arrives mojibake. */
        'names are marked as utf-8'($) {
            const bytes = $.$bog_vmap_app_export_zip(module.files);
            $mol_assert_equal(number_at(bytes, 6, 2), 0x0800);
        },
        /**
         * A date, and a fixed one. Zero shows up as `00-00-1980` and makes unpackers
         * complain; the wall clock would make one document produce different bytes on
         * every export, which no test could then pin down.
         */
        'entries carry a valid date and the same bytes every time'($) {
            const bytes = $.$bog_vmap_app_export_zip(module.files);
            $mol_assert_equal(number_at(bytes, 12, 2), 0x0021);
            const again = $.$bog_vmap_app_export_zip(module.files);
            $mol_assert_equal(bytes.length, again.length);
            $mol_assert_equal([...bytes].join(), [...again].join());
        },
        /**
         * The module folder travels INSIDE the archive, so unpacking at the root of a
         * checkout puts the module where its class names oblige it to be. Section 10:
         * a module in the wrong folder builds into `Root package not found` while
         * looking entirely correct.
         */
        'the archive carries the module folder'($) {
            const names = entries_of($.$bog_vmap_app_export_zip_archive(module))
                .map(entry => entry.name);
            $mol_assert_equal(names.join(' '), 'bog/site/site.view.tree bog/site/index.html');
        },
        /** An archive of nothing is still an archive: a directory of zero entries. */
        'an empty list makes an empty archive'($) {
            const bytes = $.$bog_vmap_app_export_zip([]);
            $mol_assert_equal(bytes.length, 22);
            $mol_assert_equal(number_at(bytes, 0, 4), 0x06054b50);
            $mol_assert_equal(entries_of(bytes).length, 0);
        },
    });
})($ || ($ = {}));


//# sourceMappingURL=web.test.js.map
