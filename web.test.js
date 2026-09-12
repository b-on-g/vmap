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
var $;
(function ($_1) {
    const box = (x, y, width, height) => ({ x, y, width, height });
    $mol_test({
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
        $.$mol_after_timeout = $mol_after_mock_timeout;
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
var $;
(function ($_1) {
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
            $mol_assert_equal([...props.keys()].join(' '), 'dom_name style event field attr sub title count extra');
            $mol_assert_equal(props.get('count').kids[0].type, '1');
            $mol_assert_equal(props.get('title').kids[0].value, 'A');
        },
        'a malformed pack points at the row of the pack, not of the stub'($) {
            const error = $mol_assert_fail(() => $.$bog_vmap_lib_parse(`${d}q ${d}w\n\t\t\toops \\\n`, 'pack.view.tree'), SyntaxError);
            $mol_assert_equal(String(error.span), 'pack.view.tree#2:1/3');
        },
        'a redeclared port keeps the position of its first declaration'($) {
            const index = $.$bog_vmap_lib_index($.$bog_vmap_lib_parse(lib_src));
            const keys = [...$.$bog_vmap_lib_props_map(index, `${d}bog_vmap_lib_test_b`).keys()];
            $mol_assert_equal(keys.indexOf('title'), 6);
        },
        'every port names the class it came from'($) {
            const index = $.$bog_vmap_lib_index($.$bog_vmap_lib_parse(lib_src));
            const owner = $.$bog_vmap_lib_props_owner(index, `${d}bog_vmap_lib_test_b`);
            $mol_assert_equal([...owner.keys()].join(' '), [...$.$bog_vmap_lib_props_map(index, `${d}bog_vmap_lib_test_b`).keys()].join(' '));
            $mol_assert_equal(owner.get('sub'), `${d}mol_view`);
            $mol_assert_equal(owner.get('extra'), `${d}bog_vmap_lib_test_b`);
            $mol_assert_equal(owner.get('title'), `${d}bog_vmap_lib_test_a`);
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
        'a pack address without a trailing slash keeps its last segment'($) {
            const lib = $.$bog_vmap_lib.make({ $ });
            lib.pack('https://b-on-g.github.io/gram');
            $mol_assert_equal(lib.tree_link(), 'https://b-on-g.github.io/gram/web.view.tree');
            $mol_assert_equal(lib.script_link(), 'https://b-on-g.github.io/gram/web.js');
            $mol_assert_equal(lib.pack(), 'https://b-on-g.github.io/gram');
            $mol_assert_equal(lib.pack_base(), 'https://b-on-g.github.io/gram/');
            lib.pack('https://b-on-g.github.io/gram/');
            $mol_assert_equal(lib.tree_link(), 'https://b-on-g.github.io/gram/web.view.tree');
        },
        'a sibling module on the dev server keeps the build folder'($) {
            const page = 'http://localhost:9080/bog/vmap/app/-/test.html';
            $mol_assert_equal($bog_vmap_lib_sibling(page, 'scene'), 'http://localhost:9080/bog/vmap/scene/-/');
            $mol_assert_equal($bog_vmap_lib_sibling(page, 'part'), 'http://localhost:9080/bog/vmap/part/-/');
            $mol_assert_equal($bog_vmap_lib_sibling('http://localhost:9080/bog/vmap/app/-/index.html', 'scene'), 'http://localhost:9080/bog/vmap/scene/-/');
        },
        'a sibling module on a deploy is a folder under the editor'($) {
            $mol_assert_equal($bog_vmap_lib_sibling('https://b-on-g.github.io/vmap/', 'scene'), 'https://b-on-g.github.io/vmap/scene/');
            $mol_assert_equal($bog_vmap_lib_sibling('https://b-on-g.github.io/vmap/', 'part'), 'https://b-on-g.github.io/vmap/part/');
            $mol_assert_equal($bog_vmap_lib_sibling('https://b-on-g.github.io/vmap/index.html', 'part'), 'https://b-on-g.github.io/vmap/part/');
        },
        'a page address without a trailing slash reads as a folder'($) {
            $mol_assert_equal($bog_vmap_lib_sibling('https://b-on-g.github.io/vmap', 'part'), 'https://b-on-g.github.io/vmap/part/');
            $mol_assert_equal($bog_vmap_lib_sibling('https://b-on-g.github.io/vmap?x=1#y', 'scene'), 'https://b-on-g.github.io/vmap/scene/');
        },
        'a dot in a folder name is not a page file'($) {
            $mol_assert_equal($bog_vmap_lib_sibling('https://b-on-g.github.io/vmap/v1.2/', 'part'), 'https://b-on-g.github.io/vmap/v1.2/part/');
            $mol_assert_equal($bog_vmap_lib_sibling('https://b-on-g.github.io/vmap/v1.2/index.html', 'scene'), 'https://b-on-g.github.io/vmap/v1.2/scene/');
        },
        'an editor served from the root of a site keeps its siblings under it'($) {
            $mol_assert_equal($bog_vmap_lib_sibling('https://vmap.example/', 'part'), 'https://vmap.example/part/');
            $mol_assert_equal($bog_vmap_lib_sibling('https://vmap.example/index.html', 'scene'), 'https://vmap.example/scene/');
            $mol_assert_equal($bog_vmap_lib_sibling('https://vmap.example', 'part'), 'https://vmap.example/part/');
        },
        async 'a pack is fetched and parsed'($) {
            const lib = $.$bog_vmap_lib.make({
                $,
                tree_link: () => 'data:text/plain,' + encodeURIComponent(lib_src),
            });
            $mol_assert_equal((await $.$mol_wire_async(lib).class_list()).join(' '), `${d}mol_view ${d}bog_vmap_lib_test_a ${d}bog_vmap_lib_test_b`);
        },
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
        'a dead pack is worded with the address that was fetched'($) {
            const note = $.$bog_vmap_lib_pack_note('https://dead.test/web.view.tree', new Error('Not Found'));
            $mol_assert_ok(note.includes('Not Found'));
            $mol_assert_ok(note.includes('https://dead.test/web.view.tree'));
            const bare = $.$bog_vmap_lib_pack_note('', new Error('Failed to fetch'));
            $mol_assert_equal(bare, 'Пак не отвечает: Failed to fetch');
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
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
        'the inspected class is not duplicated by its own peers'($) {
            const stand = $.$bog_vmap_app_inspect_demo.make({ $ });
            const types = stand.Inspect().classes().map(tree => tree.type);
            $mol_assert_like(types, stand.names());
        },
        'layout properties land in the style of the node and read back'($) {
            const inspect = panel($, [
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
            inspect.Flex().gap('');
            $mol_assert_equal(inspect.Flex().gap(), '');
            $mol_assert_equal(inspect.Node().source().includes('gap'), false);
            $mol_assert_equal(inspect.Flex().direction(), 'column');
        },
        'the inherited head of the style dictionary is kept'($) {
            const inspect = panel($, [
                `${d}bog_vmap_app_inspect_test_card ${d}mol_view`,
                '	style *',
                '		^',
                '		padding \\4px',
                '',
            ].join('\n'));
            inspect.Flex().across('center');
            $mol_assert_like(inspect.style_dict().kids.map(kid => kid.type), ['^', 'padding', 'alignItems']);
        },
        'stretching is written as text, because a number would get px'($) {
            const inspect = panel($, [
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
        'the width switch sets the width of the artboard'($) {
            const inspect = panel($, [
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
        'every layout row is a form field with a stock control'($) {
            const inspect = panel($, [
                `${d}bog_vmap_app_inspect_test_board ${d}mol_view`,
                '	sub /',
                '',
            ].join('\n'));
            const flex = inspect.Flex();
            flex.dom_tree();
            $mol_assert_equal(flex.Width().dom_node().hasAttribute('mol_form_field'), true);
            $mol_assert_equal(flex.Width().name(), 'Ширина');
            $mol_assert_equal(flex.Width().control(), flex.Width_pick());
            $mol_assert_equal(flex.Gap().control(), flex.Gap_field());
            $mol_assert_ok(flex.Width_pick().dom_node().hasAttribute('mol_switch'));
            $mol_assert_ok(flex.Gap_field().dom_node().hasAttribute('mol_string'));
        },
        'the name field renames on submit and not on a keystroke'($) {
            const inspect = panel($, [
                `${d}bog_vmap_app_inspect_test_name ${d}mol_view`,
                '	sub /',
                '',
            ].join('\n'));
            $mol_assert_equal(inspect.title_value(), `${d}bog_vmap_app_inspect_test_name`);
            inspect.title_value(`${d}bog_vmap_app_inspect_test_hero`);
            $mol_assert_equal(inspect.title_value(), `${d}bog_vmap_app_inspect_test_hero`);
            $mol_assert_equal(inspect.class_title(), `${d}bog_vmap_app_inspect_test_name`);
            inspect.title_submit();
            $mol_assert_equal(inspect.class_title(), `${d}bog_vmap_app_inspect_test_hero`);
            $mol_assert_ok(inspect.Node().source().startsWith(`${d}bog_vmap_app_inspect_test_hero `));
        },
        'the field follows the name once the rename lands'($) {
            const inspect = panel($, [
                `${d}bog_vmap_app_inspect_test_name ${d}mol_view`,
                '	sub /',
                '',
            ].join('\n'));
            inspect.title_value(`${d}bog_vmap_app_inspect_test_hero`);
            inspect.title_submit();
            $mol_assert_equal(inspect.title_value(), `${d}bog_vmap_app_inspect_test_hero`);
            inspect.title_submit();
            $mol_assert_equal(inspect.class_title(), `${d}bog_vmap_app_inspect_test_hero`);
        },
        'the head of the panel is the head of a page'($) {
            const inspect = panel($, [
                `${d}bog_vmap_app_inspect_test_name ${d}mol_view`,
                '	sub /',
                '',
            ].join('\n'));
            const root = inspect.dom_tree();
            $mol_assert_ok(root.querySelector('[mol_page_head]'));
            $mol_assert_equal(inspect.Name().dom_node().hasAttribute('mol_string'), true);
            $mol_assert_equal(root.contains(inspect.Name().dom_node()), true);
            $mol_assert_equal(inspect.Name().value(), `${d}bog_vmap_app_inspect_test_name`);
            $mol_assert_equal(inspect.Name().dom_node().getAttribute('id').endsWith('Name()'), true);
        },
        'the refusal strip is there only while there is a refusal'($) {
            const inspect = panel($, [
                `${d}bog_vmap_app_inspect_test_name ${d}mol_view`,
                '	sub /',
                '',
            ].join('\n'));
            $mol_assert_equal(inspect.tools().includes(inspect.Note()), false);
            const refused = $.$bog_vmap_app_inspect.make({
                $,
                source: () => `${d}bog_vmap_app_inspect_test_name ${d}mol_view\n\tsub /\n`,
                pack: () => '',
                title_note: () => 'Имя занято',
            });
            $mol_assert_equal(refused.tools().includes(refused.Note()), true);
            $mol_assert_equal(refused.Note().message(), 'Имя занято');
        },
        'a source naming no class leaves an invitation, not twenty failures'($) {
            const one = panel($, '');
            $mol_assert_equal(one.class_ready(), false);
            $mol_assert_equal(one.body().length, 1);
            $mol_assert_equal(one.body()[0], one.Empty());
            const two = panel($, `${d}my_card ${d}mol_view\n\ttitle \\Hi\n`);
            $mol_assert_equal(two.class_ready(), true);
            $mol_assert_ok(two.body().length > 1);
        },
        'everything that can grow is inside the one scroll of the page'($) {
            const one = panel($, `${d}my_card ${d}mol_view\n\ttitle \\Hi\n`);
            $mol_assert_equal(one.Body() instanceof $mol_scroll, true);
            $mol_assert_equal(one.body_content().length, 1);
            $mol_assert_equal(one.body_content()[0], one.Body_content());
            const body = one.body();
            $mol_assert_equal(body.includes(one.Flex()), true);
            $mol_assert_equal(body.includes(one.Rows()), true);
            $mol_assert_equal(body.includes(one.Inherited()), true);
        },
        'every property row is a form field labelled by the signature'($) {
            const one = panel($, [
                `${d}bog_vmap_app_inspect_test_card ${d}mol_view`,
                '	title \\Hi',
                '	count 24',
                '',
            ].join('\n'));
            one.dom_tree();
            const row = one.Row('title');
            $mol_assert_equal(row.dom_node().hasAttribute('mol_form_field'), true);
            $mol_assert_equal(row.name(), 'title');
            $mol_assert_equal(one.Rows().dom_node().contains(row.dom_node()), true);
            $mol_assert_equal(row.control(), row.Value());
        },
        'the field of a row is the stock one for the kind of the value'($) {
            const one = panel($, [
                `${d}bog_vmap_app_inspect_test_card ${d}mol_view`,
                '	title \\Hi',
                '	count 24',
                '	dense false',
                '	style * padding \\4px',
                '	sub / <= Hero',
                `	Hero ${d}mol_view`,
                '	calc = Hero title',
                '',
            ].join('\n'));
            one.dom_tree();
            const value = (name) => one.Row(name).Value();
            $mol_assert_equal(value('title').Editor(), value('title').String());
            $mol_assert_equal(value('count').Editor(), value('count').Num());
            $mol_assert_equal(value('dense').Editor(), value('dense').Flag());
            $mol_assert_equal(value('style').Editor(), value('style').Seq());
            $mol_assert_equal(value('sub').Editor(), value('sub').Seq());
            $mol_assert_equal(value('calc').Editor(), value('calc').Wire());
            $mol_assert_equal(value('title').String().Text().dom_node().hasAttribute('mol_string'), true);
            $mol_assert_equal(value('count').Num().dom_node().hasAttribute('mol_string'), true);
            $mol_assert_equal(value('dense').Flag().dom_node().hasAttribute('mol_check'), true);
            $mol_assert_equal(value('style').Seq().dom_node().hasAttribute('mol_list'), true);
            $mol_assert_equal(value('calc').Wire().Origin().dom_node().hasAttribute('mol_select'), true);
        },
        'an edit in the field of a row reaches the document'($) {
            const one = panel($, [
                `${d}bog_vmap_app_inspect_test_card ${d}mol_view`,
                '	title \\Hi',
                '',
            ].join('\n'));
            one.dom_tree();
            const field = one.Row('title').Value()
                .String().Text();
            $mol_assert_equal(field.value(), 'Hi');
            field.value('Hey');
            $mol_assert_equal(one.row_value('title').text(), 'Hey');
            $mol_assert_ok(one.Node().source().includes('title \\Hey'));
        },
        'a number keeps the literal the document holds'($) {
            const one = panel($, [
                `${d}bog_vmap_app_inspect_test_card ${d}mol_view`,
                '	ratio 1e3',
                '',
            ].join('\n'));
            one.dom_tree();
            const value = one.Row('ratio').Value();
            $mol_assert_equal(value.Editor(), value.Num());
            $mol_assert_equal(value.num(), '1e3');
            value.num('2e4');
            $mol_assert_ok(one.Node().source().includes('ratio 2e4'));
        },
        'inherited rows live in the expander and own rows do not'($) {
            const one = pair($, [
                `${d}bog_vmap_app_inspect_test_card ${d}mol_view`,
                '	caption \\Карточка',
                `${d}bog_vmap_app_inspect_test_hero ${d}bog_vmap_app_inspect_test_card`,
                '	title \\Hi',
                '',
            ].join('\n'), `${d}bog_vmap_app_inspect_test_hero`);
            $mol_assert_equal(one.row_inherited('caption'), true);
            $mol_assert_equal(one.row_inherited('title'), false);
            $mol_assert_like(one.own_ports(), ['title']);
            $mol_assert_ok(one.inherited_ports().includes('caption'));
            $mol_assert_equal(one.inherited_ports().includes('title'), false);
            $mol_assert_equal(one.Inherited().expanded(), true);
            one.dom_tree();
            $mol_assert_equal(one.Inherited().dom_node().hasAttribute('mol_expander'), true);
            $mol_assert_equal(one.Inherited().dom_node().contains(one.Row('caption').dom_node()), true);
            $mol_assert_equal(one.Inherited().dom_node().contains(one.Row('title').dom_node()), false);
            $mol_assert_equal(one.Rows().dom_node().contains(one.Row('title').dom_node()), true);
        },
        'an inherited row offers no tools'($) {
            const one = pair($, [
                `${d}bog_vmap_app_inspect_test_card ${d}mol_view`,
                '	caption \\Карточка',
                `${d}bog_vmap_app_inspect_test_hero ${d}bog_vmap_app_inspect_test_card`,
                '	title \\Hi',
                '',
            ].join('\n'), `${d}bog_vmap_app_inspect_test_hero`);
            $mol_assert_equal(one.Row('caption').tools().length, 0);
            $mol_assert_equal(one.Row('title').tools().length, 3);
            $mol_assert_equal(one.Row('caption').bid(), `${d}bog_vmap_app_inspect_test_card`);
        },
        'the inherited group opens by default and closing it hides the rows'($) {
            const one = pair($, [
                `${d}bog_vmap_app_inspect_test_card ${d}mol_view`,
                '	caption \\Карточка',
                `${d}bog_vmap_app_inspect_test_hero ${d}bog_vmap_app_inspect_test_card`,
                '	title \\Hi',
                '',
            ].join('\n'), `${d}bog_vmap_app_inspect_test_hero`);
            $mol_assert_equal(one.inherited_shown(), true);
            one.dom_tree();
            $mol_assert_ok(one.Inherited().dom_node().querySelector('[mol_form_field]'));
            one.inherited_shown(false);
            one.dom_tree();
            $mol_assert_equal(one.Inherited().dom_node().querySelector('[mol_form_field]'), null);
        },
    });
    const d = '$';
    function browser_gaps($) {
        const dom = $.$mol_dom_context;
        Object.assign(globalThis, {
            ShadowRoot: globalThis.ShadowRoot ?? dom.ShadowRoot,
            PointerEvent: globalThis.PointerEvent ?? dom.PointerEvent,
        });
    }
    function panel($, source, peers = []) {
        browser_gaps($);
        let text = source;
        return $.$bog_vmap_app_inspect.make({
            $,
            source: (next) => next === undefined ? text : (text = next),
            peers: () => peers,
            pack: () => '',
        });
    }
    function pair($, source, klass) {
        browser_gaps($);
        let text = source;
        const doc = $.$bog_vmap_lang_doc.make({
            $,
            source: (next) => next === undefined ? text : (text = next),
        });
        return $.$bog_vmap_app_inspect.make({
            $,
            source: (next) => doc.class_source(klass, next),
            peers: () => doc.trees(),
            pack: () => '',
        });
    }
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    const box = (left, top, width = 100, height = 50) => ({ left, top, width, height });
    const port = (name, kind, next = false) => ({ name, next, own: true, kind });
    const dot = (over) => ({
        node: 'A',
        port: port('value', 'string'),
        side: 'in',
        lit: true,
        linked: false,
        ...over,
    });
    $mol_test({
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
        'port rows do not scale with the camera'($) {
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
        'a wire that runs backwards turns its tangents and stays between its ends'($) {
            const from = [312, 20];
            const to = [88, 120];
            const d = $bog_vmap_app_wire_curve(from, to);
            const xs = d.match(/-?\d+(\.\d+)?/g).map(Number).filter((_, i) => i % 2 === 0);
            $mol_assert_equal(Math.max(...xs), from[0]);
            $mol_assert_equal(Math.min(...xs), to[0]);
            $mol_assert_equal(d, 'M 312 20 C 312 70, 88 70, 88 120');
            $mol_assert_like($bog_vmap_app_wire_curve_mid(from, to), [200, 70]);
        },
        'a short forward wire keeps a minimal reach'($) {
            $mol_assert_equal($bog_vmap_app_wire_curve([0, 0], [10, 0]), 'M 0 0 C 40 0, -30 0, 10 0');
        },
        'the dot under a point, the nearest one, and on a tie the one on top'($) {
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
        'a point inside the reach of two dots goes to the nearer, not the later'($) {
            const dots = [
                dot({ x: 10, y: 10, node: 'A', port: port('near', 'number') }),
                dot({ x: 15, y: 10, node: 'B', port: port('far', 'number') }),
            ];
            $mol_assert_equal($bog_vmap_app_wire_dot_at(dots, [11, 10])?.node, 'A');
            $mol_assert_equal($bog_vmap_app_wire_dot_at(dots, [14, 10])?.node, 'B');
        },
        'a column of a short part does not reach into the part below it'($) {
            const height = 17;
            const above = box(0, 0, 200, height);
            const below = box(0, height, 200, height);
            const own = $bog_vmap_app_wire_side_point(above, 'in');
            const next = $bog_vmap_app_wire_side_point(below, 'in');
            $mol_assert_equal(own[0], next[0]);
            $mol_assert_equal(Math.abs(own[1] - next[1]) > $bog_vmap_app_wire_hit, true);
            $mol_assert_like(own, [0 - $bog_vmap_app_wire_gap, $bog_vmap_app_wire_row / 2]);
        },
        'opening the column leaves the point of the first port where it was'($) {
            for (const b of [box(0, 0, 200, 17), box(100, 200, 60, 30), box(-40, -10, 1280, 720)]) {
                for (const side of ['in', 'out']) {
                    $mol_assert_like($bog_vmap_app_wire_side_point(b, side), $bog_vmap_app_wire_port_point(b, side, 0));
                }
            }
        },
        'a point on the dot column counts as over the part, a point a row above does not'($) {
            const b = box(100, 200, 60, 30);
            const [x, y] = $bog_vmap_app_wire_side_point(b, 'in');
            $mol_assert_equal($bog_vmap_app_wire_over(b, [x, y]), true);
            $mol_assert_equal($bog_vmap_app_wire_over(b, [b.left + 10, b.top + 1]), true);
            $mol_assert_equal($bog_vmap_app_wire_over(b, [x, b.top - 1]), false);
            $mol_assert_equal($bog_vmap_app_wire_over(b, [x - $bog_vmap_app_wire_hit - 1, y]), false);
        },
        'compatibility by shape'($) {
            $mol_assert_equal($bog_vmap_app_wire_fits('number', 'number'), true);
            $mol_assert_equal($bog_vmap_app_wire_fits('string', 'locale'), true);
            $mol_assert_equal($bog_vmap_app_wire_fits('number', 'string'), false);
            $mol_assert_equal($bog_vmap_app_wire_fits('list', 'bool'), false);
            $mol_assert_equal($bog_vmap_app_wire_fits('null', 'list'), true);
            $mol_assert_equal($bog_vmap_app_wire_fits('number', 'get'), true);
            $mol_assert_equal($bog_vmap_app_wire_fits('bind', 'number'), true);
        },
        'a two way wire takes only a port declared with a sign'($) {
            const signed = port('value', 'number', true);
            const plain = port('result', 'number');
            $mol_assert_equal($bog_vmap_app_wire_takes('number', signed, false), true);
            $mol_assert_equal($bog_vmap_app_wire_takes('number', plain, false), true);
            $mol_assert_equal($bog_vmap_app_wire_takes('number', signed, true), true);
            $mol_assert_equal($bog_vmap_app_wire_takes('number', plain, true), false);
        },
        'an unfitting shape is refused whichever way the wire runs'($) {
            const signed = port('value', 'string', true);
            $mol_assert_equal($bog_vmap_app_wire_takes('number', signed, false), false);
            $mol_assert_equal($bog_vmap_app_wire_takes('number', signed, true), false);
            $mol_assert_equal($bog_vmap_app_wire_takes('locale', signed, true), true);
        },
        'the label of a two way wire carries the sign, of a one way one only the value'($) {
            $mol_assert_equal($bog_vmap_app_wire_label({ label: '42', bidi: false }), '42');
            $mol_assert_equal($bog_vmap_app_wire_label({ label: '42', bidi: true }), '⇄ 42');
            $mol_assert_equal($bog_vmap_app_wire_label({ label: '', bidi: false }), '');
            $mol_assert_equal($bog_vmap_app_wire_label({ label: '', bidi: true }), '⇄');
        },
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
            const owners = new Map([...props.keys()].map(name => [name, `${d}my_part`]));
            const ports = $.$bog_vmap_app_wire_ports(props, owners, `${d}my_part`);
            $mol_assert_like(ports.map(port => `${port.name}${port.next ? '?' : ''}:${port.kind}`), ['title:string', 'count:number', 'enabled:bool', 'click?:null', 'items:list', 'label:locale', 'bound:get', 'both?:bind']);
            $mol_assert_equal(ports.every(port => port.own), true);
        },
        'a port inherited from the base class is not the part own'($) {
            const d = '$';
            const tree = $.$mol_tree2_from_string([`title \\Hi`, `count 3`, ``].join('\n'));
            const props = new Map(tree.kids.map(prop => [$.$mol_view_tree2_prop_parts(prop).name, prop]));
            const owners = new Map([
                ['title', `${d}mol_view`],
                ['count', `${d}my_part`],
            ]);
            const ports = $.$bog_vmap_app_wire_ports(props, owners, `${d}my_part`);
            $mol_assert_like(ports.map(port => `${port.name}:${port.own}`), ['title:false', 'count:true']);
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
(function ($_1) {
    const d = '$';
    const src_root = `${d}bog_vmap_app_doc_test_page ${d}mol_view\n\tCalc ${d}bog_vmap_app_doc_test_calc\n\tcalc_result = Calc result\n\tsub / <= Calc\n`;
    const src_hero = `${d}bog_vmap_app_doc_test_hero ${d}mol_view title \\Hi\n`;
    const head_root = new $giper_baza_link('11111111');
    const head_hero = new $giper_baza_link('22222222');
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
        async 'edits to one node are last write wins'($) {
            const land1 = $giper_baza_land.make({ $ });
            const land2 = $giper_baza_land.make({ $ });
            land1.Pawn($bog_vmap_app_doc_node).Head(head_root).source(src_root);
            land2.tick();
            land2.Pawn($bog_vmap_app_doc_node).Head(head_root).source(src_hero);
            await $mol_wire_async(land1).units_steal(land2);
            $mol_assert_equal(land1.Pawn($bog_vmap_app_doc_node).Head(head_root).source(), src_hero);
        },
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
            $mol_assert_equal(doc.Root().val().str, root.link().str);
        },
        'nothing derivable is stored'($) {
            $mol_assert_like(Object.keys($bog_vmap_app_doc_node.schema), ['Tree', 'Js', 'Css']);
            $mol_assert_like(Object.keys($bog_vmap_app_doc_snap.schema), ['Time', 'Author', 'Tree', 'Js', 'Css', 'Places']);
            $mol_assert_like(Object.keys($bog_vmap_app_doc_spot.schema), ['X', 'Y']);
            $mol_assert_like(Object.keys($bog_vmap_app_doc.schema), ['Title', 'Nodes', 'Root', 'Spots', 'Pack', 'Snaps']);
            $mol_assert_like(Object.keys($bog_vmap_app_doc_home.schema), ['Docs']);
        },
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
(function ($) {
    function check(str, query) {
        $mol_assert_like(str, $hyoo_harp_to_string(query));
        $mol_assert_like(query, $hyoo_harp_from_string(str));
    }
    $mol_test({
        'root'() {
            check('', {});
        },
        'only field'() {
            check('user%3D777', {
                'user=777': {},
            });
        },
        'primary key'() {
            check('user=jin%2C777!=', {
                user: {
                    '=': [['jin,777!']],
                },
            });
        },
        'single fetch'() {
            check('friend(age%24)', {
                friend: {
                    age$: {},
                },
            });
        },
        'fetch and primary key'() {
            check('user=jin()=(friend)', {
                'user': {
                    '=': [['jin()']],
                    friend: {},
                },
            });
        },
        'multiple fetch'() {
            check('age;friend', {
                age: {},
                friend: {},
            });
        },
        'common query string back compatible'() {
            $mol_assert_like($hyoo_harp_from_string('user=jin&age=100500'), {
                user: {
                    '=': [['jin']],
                },
                age: {
                    '=': [['100500']],
                },
            });
        },
        'common pathname back compatible'() {
            $mol_assert_like($hyoo_harp_from_string('users/jin/comments'), {
                users: {},
                jin: {},
                comments: {},
            });
        },
        'deep fetch'() {
            check('my(friend(age);name);stat', {
                my: {
                    friend: {
                        age: {},
                    },
                    name: {},
                },
                stat: {},
            });
        },
        'orders'() {
            check('+age;-name', {
                age: {
                    '+': true
                },
                name: {
                    '+': false
                },
            });
        },
        'filter types'() {
            check('sex=female=;status!=married=', {
                sex: {
                    '=': [['female']],
                },
                status: {
                    '!=': [['married']],
                },
            });
        },
        'filter ranges'() {
            check('sex=female=;age=18@25=;weight=@50=;height=150@=;hobby=paint=singing=', {
                sex: {
                    '=': [['female']],
                },
                age: {
                    '=': [['18', '25']],
                },
                weight: {
                    '=': [['', '50']],
                },
                height: {
                    '=': [['150', '']],
                },
                hobby: {
                    '=': [['paint'], ['singing']],
                },
            });
        },
        'unescaped values'() {
            $mol_assert_like($hyoo_harp_from_string('foo=jin=777=;bar=jin!=666='), {
                foo: {
                    '=': [['jin'], ['777']],
                },
                bar: {
                    '=': [['jin!'], ['666']],
                },
            });
        },
        'slicing'() {
            check('friend(_num=0@100=)', {
                friend: {
                    _num: { '=': [['0', '100']] },
                },
            });
        },
        'complex'() {
            check('pullRequest(state=closed=merged=;+repository(name;private);-updateTime;_num=0@100=)', {
                pullRequest: {
                    state: {
                        '=': [
                            ['closed'],
                            ['merged'],
                        ]
                    },
                    repository: {
                        '+': true,
                        name: {},
                        private: {},
                    },
                    updateTime: {
                        '+': false,
                    },
                    _num: {
                        '=': [['0', '100']],
                    },
                },
            });
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    $mol_test({
        'Is string'() {
            $mol_data_string('');
        },
        'Is not string'() {
            $mol_assert_fail(() => {
                $mol_data_string(0);
            }, '0 is not a string');
        },
        'Is object string'() {
            $mol_assert_fail(() => {
                $mol_data_string(new String('x'));
            }, 'x is not a string');
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    $mol_test({
        'Is first'() {
            $mol_data_variant($mol_data_number, $mol_data_string)(0);
        },
        'Is second'() {
            $mol_data_variant($mol_data_number, $mol_data_string)('');
        },
        'Is false'() {
            $mol_assert_fail(() => {
                $mol_data_variant($mol_data_number, $mol_data_string)(false);
            }, 'false is not any of variants');
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    const Age = $mol_data_optional($mol_data_number);
    const Age_or_zero = $mol_data_optional($mol_data_number, () => 0);
    $mol_test({
        'Is not present'() {
            $mol_assert_equal(Age(undefined), undefined);
        },
        'Is present'() {
            $mol_assert_equal(Age(0), 0);
        },
        'Fallbacked'() {
            $mol_assert_equal(Age_or_zero(undefined), 0);
        },
        'Is null'() {
            $mol_assert_fail(() => Age(null), 'null is not a number');
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
        'Fit to record'() {
            const User = $mol_data_record({ age: $mol_data_number });
            User({ age: 0 });
        },
        'Extends record'() {
            const User = $mol_data_record({ age: $mol_data_number });
            User({ age: 0, name: 'Jin' });
        },
        // 'Recursive record' () {
        // 	const User = $mol_data_record({
        // 		name : $mol_data_string ,
        // 		get kids() { return $mol_data_array( User ) } ,
        // 	})
        // 	User({
        // 		name : 'Jin' ,
        // 		kids : [
        // 			{
        // 				name : 'John' ,
        // 				kids : [] ,
        // 			}
        // 		] ,
        // 	})
        // } ,
        'Shrinks record'() {
            $mol_assert_fail(() => {
                const User = $mol_data_record({ age: $mol_data_number, name: $mol_data_string });
                User({ age: 0 });
            }, '["name"] undefined is not a string');
        },
        'Shrinks deep record'() {
            $mol_assert_fail(() => {
                const User = $mol_data_record({ wife: $mol_data_record({ age: $mol_data_number }) });
                User({ wife: {} });
            }, '["wife"] ["age"] undefined is not a number');
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    $mol_test({
        'Is empty array'() {
            $mol_data_array($mol_data_number)([]);
        },
        'Is array'() {
            $mol_data_array($mol_data_number)([1, 2]);
        },
        'Is not array'() {
            $mol_assert_fail(() => {
                $mol_data_array($mol_data_number)({ [0]: 1, length: 1, map: () => { } });
            }, '[object Object] is not an array');
        },
        'Has wrong item'() {
            $mol_assert_fail(() => {
                $mol_data_array($mol_data_number)([1, '1']);
            }, '[1] 1 is not a number');
        },
        'Has wrong deep item'() {
            $mol_assert_fail(() => {
                $mol_data_array($mol_data_array($mol_data_number))([[], [0, 0, false]]);
            }, '[1] [2] false is not a number');
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    $mol_test({
        'Is boolean - true'() {
            $mol_data_boolean(true);
        },
        'Is boolean - false'() {
            $mol_data_boolean(false);
        },
        'Is not boolean'() {
            $mol_assert_fail(() => {
                $mol_data_boolean('x');
            }, 'x is not a boolean');
        },
        'Is object boolean'() {
            $mol_assert_fail(() => {
                $mol_data_boolean(new Boolean(''));
            }, 'false is not a boolean');
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    /**
     * Checks for value of given enum and returns expected type.
     * @see https://mol.hyoo.ru/#!section=demos/demo=mol_data_enum_demo
     */
    function $mol_data_enum(name, dict) {
        const index = {};
        for (let key in dict) {
            if (Number.isNaN(Number(key))) {
                index[dict[key]] = key;
            }
        }
        return $mol_data_setup((value) => {
            if (typeof index[value] !== 'string') {
                return $mol_fail(new $mol_data_error(`${value} is not value of ${name} enum`));
            }
            return value;
        }, { name, dict });
    }
    $.$mol_data_enum = $mol_data_enum;
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    let sex;
    (function (sex) {
        sex[sex["male"] = 0] = "male";
        sex[sex["female"] = 1] = "female";
    })(sex || (sex = {}));
    let gender;
    (function (gender) {
        gender["bisexual"] = "bisexual";
        gender["trans"] = "transgender";
    })(gender || (gender = {}));
    // Test disabled due https://github.com/microsoft/TypeScript/issues/46112
    // const Sex = $mol_data_enum( 'sex' , sex )
    // type sex_value =  $mol_type_assert< typeof Sex.Value , sex >
    $mol_test({
        'config of enum'() {
            const Sex = $mol_data_enum('sex', sex);
            $mol_assert_like(Sex.config, {
                name: 'sex',
                dict: sex,
            });
        },
        'name of enum'() {
            const Sex = $mol_data_enum('sex', sex);
            $mol_assert_equal(Sex.config.name, 'sex');
        },
        'Is right value of enum'() {
            const Sex = $mol_data_enum('sex', sex);
            $mol_assert_equal(Sex(0), sex.male);
        },
        'Is wrong value of enum'() {
            const Sex = $mol_data_enum('sex', sex);
            $mol_assert_fail(() => Sex(2), `2 is not value of sex enum`);
        },
        'Is name instead of value'() {
            const Sex = $mol_data_enum('sex', sex);
            $mol_assert_fail(() => Sex('male'), `male is not value of sex enum`);
        },
        'Is common object field'() {
            const Sex = $mol_data_enum('sex', sex);
            $mol_assert_fail(() => Sex('__proto__'), `__proto__ is not value of sex enum`);
        },
    });
    // Test disabled due https://github.com/microsoft/TypeScript/issues/46112
    // type gender_value =  $mol_type_assert< typeof Gender.Value , gender >
    $mol_test({
        'config of enum'() {
            const Gender = $mol_data_enum('gender', gender);
            $mol_assert_like(Gender.config, {
                name: 'gender',
                dict: gender,
            });
        },
        'Is right value of enum'() {
            const Gender = $mol_data_enum('gender', gender);
            $mol_assert_equal(Gender('transgender'), gender.trans);
        },
        'Is wrong value of enum'() {
            const Gender = $mol_data_enum('gender', gender);
            $mol_assert_fail(() => Gender('xxx'), `xxx is not value of gender enum`);
        },
        'Is name instead of value'() {
            const Gender = $mol_data_enum('gender', gender);
            $mol_assert_fail(() => Gender('trans'), `trans is not value of gender enum`);
        },
        'Is common object field'() {
            const Gender = $mol_data_enum('gender', gender);
            $mol_assert_fail(() => Gender('__proto__'), `__proto__ is not value of gender enum`);
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    $mol_test({
        'type safe build & parse'() {
            let States;
            (function (States) {
                States["opened"] = "opened";
                States["closed"] = "closed";
            })(States || (States = {}));
            const State = $hyoo_harp_scheme({}, $mol_data_enum('States', States));
            const Str = $hyoo_harp_scheme({}, $mol_data_string);
            const Bool = $hyoo_harp_scheme({}, $mol_data_boolean);
            const Repository = $hyoo_harp_scheme({
                name: $mol_data_optional(Str),
                isPrivate: $mol_data_optional(Bool),
                // pullRequests: PullRequest,
            });
            const PullRequest = $hyoo_harp_scheme({
                state: $mol_data_optional(State),
                updated_at: $mol_data_optional(Str),
                repository: $mol_data_optional(Repository),
            });
            const Request = $hyoo_harp_scheme({
                pullRequest: $mol_data_optional(PullRequest),
            });
            const uri = 'pullRequest(state=closed=;-updated_at;repository(name;isPrivate);_num=0@100=)';
            let query = Request({
                pullRequest: {
                    state: { '=': [[States.closed]] }, // filter
                    updated_at: { '+': false }, // order
                    repository: {
                        name: {},
                        isPrivate: {},
                    },
                    _num: { '=': [[0, 100]] }, // slice
                }
            });
            $mol_assert_like(uri, Request.build(query));
            $mol_assert_like(query, Request.parse(uri));
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    $mol_test({
        'save and load buffers'($) {
            const land = $giper_baza_land.make({ $ });
            const file = land.Data($giper_baza_file);
            const source = new Uint8Array(2 ** 15 + 1);
            source[2 ** 15] = 255;
            file.buffer(source);
            $mol_assert_equal(file.chunks().length, 2);
            $mol_assert_equal(file.buffer(), source);
        },
        async 'save and load blobs'($) {
            const land = $giper_baza_land.make({ $ });
            const file = land.Data($giper_baza_file);
            const source = new Uint8Array(2 ** 16 + 1);
            source[2 ** 16 + 1] = 255;
            await $mol_wire_async(file).blob(new $mol_blob([source], { type: 'test/test' }));
            $mol_assert_equal('test/test', file.blob().type);
            $mol_assert_equal(source, new Uint8Array(await file.blob().arrayBuffer()));
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
(function ($_1) {
    const d = '$';
    const master = 'https://baza.test/';
    function land($) {
        return $giper_baza_land.make({ $ });
    }
    function assets($, at = master) {
        return $bog_vmap_asset.make({ $, master: () => at });
    }
    function yard_of($, seen, ports) {
        const Yard = class extends $giper_baza_yard {
            masters() {
                return ports;
            }
            face_port_land([port, land]) {
                return seen(land.str);
            }
        };
        return Yard.make({ $ });
    }
    function mirror_of(land, shift = {}) {
        const mirror = new $giper_baza_face_map;
        for (const [peer, face] of land.faces) {
            mirror.peer_time(peer, face.time + (shift.time ?? 0), face.tick);
            mirror.peer_summ(peer, face.summ + (shift.summ ?? 0));
        }
        return mirror;
    }
    function assets_of($, file, yard) {
        return $bog_vmap_asset.make({
            $,
            master: () => master,
            pawn: () => file,
            yard: () => yard,
        });
    }
    function file_of($, name = 'logo.png', head = '11111111') {
        const one = land($).Pawn($giper_baza_file).Head(new $giper_baza_link(head));
        one.buffer(new Uint8Array([137, 80, 78, 71]));
        one.type('image/png');
        one.name(name);
        return one;
    }
    $mol_test({
        'an address is made from the master and read back as the same link'($) {
            const file = file_of($);
            const uri = assets($).uri(file);
            $mol_assert_ok(uri.startsWith(master + '?BAZA:file='));
            $mol_assert_equal($bog_vmap_asset_link(uri), file.link().str);
        },
        'a master written without a trailing slash gets exactly one'($) {
            const file = file_of($);
            const uri = assets($, 'https://baza.test').uri(file);
            $mol_assert_ok(uri.startsWith('https://baza.test/?BAZA:file='));
            $mol_assert_equal($bog_vmap_asset_link(uri), file.link().str);
        },
        'without a master there is no address at all'($) {
            $mol_assert_equal(assets($, '').uri(file_of($)), '');
        },
        'the address carries the file name for whoever saves it'($) {
            const uri = assets($).uri(file_of($, 'logo.png'));
            $mol_assert_ok(uri.includes(';name=logo.png'));
        },
        'what is not an address reads as no link'($) {
            $mol_assert_equal($bog_vmap_asset_link('https://example.org/pic.png'), null);
            $mol_assert_equal($bog_vmap_asset_link('aaaaaaaa'), null);
            $mol_assert_equal($bog_vmap_asset_link('https://baza.test/?BAZA:file='), null);
            $mol_assert_equal($bog_vmap_asset_link('https://baza.test/?BAZA:file=not a link'), null);
        },
        'the assets of a document are listed once each, in order of mention'($) {
            const one = assets($);
            const a = file_of($, 'a.png', '11111111');
            const b = file_of($, 'b.png', '22222222');
            const source = [
                `${d}my_page ${d}mol_view`,
                `	Logo ${d}mol_image uri \\${one.uri(b)}`,
                `	Hero ${d}mol_image uri \\${one.uri(a)}`,
                `	Again ${d}mol_image uri \\${one.uri(b)}`,
                '',
            ].join('\n');
            $mol_assert_like($bog_vmap_asset_links(source), [b.link().str, a.link().str]);
        },
        'a document mentioning no asset lists none'($) {
            $mol_assert_like($bog_vmap_asset_links(`${d}my_page ${d}mol_view\n\ttitle \\Hi\n`), []);
        },
        'bytes, name and mime survive the round trip through a file'($) {
            const file = land($).Data($giper_baza_file);
            const bytes = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);
            file.buffer(bytes);
            file.type('image/png');
            file.name('logo.png');
            $mol_assert_like([...file.buffer()], [...bytes]);
            $mol_assert_equal(file.type(), 'image/png');
            $mol_assert_equal(file.name(), 'logo.png');
        },
        'a file larger than one chunk comes back whole'($) {
            const file = land($).Data($giper_baza_file);
            const bytes = new Uint8Array(2 ** 15 + 100);
            for (let i = 0; i < bytes.length; ++i)
                bytes[i] = i % 251;
            file.buffer(bytes);
            const back = file.buffer();
            $mol_assert_equal(back.byteLength, bytes.byteLength);
            $mol_assert_equal(back[0], bytes[0]);
            $mol_assert_equal(back[2 ** 15 - 1], bytes[2 ** 15 - 1]);
            $mol_assert_equal(back[2 ** 15], bytes[2 ** 15]);
            $mol_assert_equal(back[back.length - 1], bytes[bytes.length - 1]);
        },
        'an address that is not one resolves to no file at all'($) {
            const one = assets($);
            $mol_assert_equal(one.file('not an address'), null);
            $mol_assert_equal(one.bytes('not an address'), null);
            $mol_assert_equal(one.mime('not an address'), '');
            $mol_assert_equal(one.name('not an address'), '');
        },
        'reading a file syncs its land unasked'($) {
            const one = land($);
            const file = one.Data($giper_baza_file);
            file.name('logo.png');
            let synced = 0;
            one.sync = () => { synced++; return one; };
            $mol_assert_equal(file.name(), 'logo.png');
            $mol_assert_ok(synced > 0);
        },
        async 'a dropped file goes into a land and comes back as an address'($) {
            const bytes = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);
            const one = $bog_vmap_asset.make({
                $,
                master: () => master,
                land: () => $giper_baza_land.make({ $ }),
            });
            const file = await $mol_wire_async(one).made(new $mol_blob([bytes], { type: 'image/png' }));
            $mol_assert_like([...file.buffer()], [...bytes]);
            $mol_assert_equal(file.type(), 'image/png');
            const uri = one.uri(file);
            $mol_assert_ok(uri.startsWith(master + '?BAZA:file='));
            $mol_assert_equal($bog_vmap_asset_link(uri), file.link().str);
            const put = await $mol_wire_async(one).put(new $mol_blob([bytes], { type: 'image/png' }));
            $mol_assert_ok(!!$bog_vmap_asset_link(put));
        },
        'a land no master has answered about is still on its way'($) {
            const file = file_of($);
            const link = file.link().str;
            const one = assets_of($, file, yard_of($, () => null, [$mol_rest_port.make({})]));
            $mol_assert_equal(one.filled(link), true);
            $mol_assert_equal(one.sent(link), false);
            $mol_assert_equal(one.ready(link), false);
        },
        'units the master has not seen yet keep the asset on its way'($) {
            const file = file_of($);
            const link = file.link().str;
            const land = file.land();
            const port = $mol_rest_port.make({});
            $mol_assert_ok(land.faces.size > 0);
            const by_summ = assets_of($, file, yard_of($, () => mirror_of(land, { summ: -1 }), [port]));
            $mol_assert_equal(by_summ.sent(link), false);
            const by_time = assets_of($, file, yard_of($, () => mirror_of(land, { time: -1 }), [port]));
            $mol_assert_equal(by_time.sent(link), false);
            const empty = assets_of($, file, yard_of($, () => new $giper_baza_face_map, [port]));
            $mol_assert_equal(empty.sent(link), false);
        },
        'a land the master reports back in full counts as sent'($) {
            const file = file_of($);
            const link = file.link().str;
            const land = file.land();
            const one = assets_of($, file, yard_of($, () => mirror_of(land), [$mol_rest_port.make({})]));
            $mol_assert_equal(one.sent(link), true);
            $mol_assert_equal(one.ready(link), true);
        },
        'the mirror is looked up by the land of the asset'($) {
            const file = file_of($);
            const land = file.land();
            const asked = [];
            const one = assets_of($, file, yard_of($, at => {
                asked.push(at);
                return at === 'another land' ? mirror_of(land) : null;
            }, [$mol_rest_port.make({})]));
            $mol_assert_equal(one.sent(file.link().str), false);
            $mol_assert_like(asked, [land.link().str]);
        },
        'without a master port nothing counts as sent'($) {
            const file = file_of($);
            const land = file.land();
            const one = assets_of($, file, yard_of($, () => mirror_of(land), []));
            $mol_assert_equal(one.sent(file.link().str), false);
        },
        'bytes that are not here yet leave the asset unready'($) {
            const empty = land($).Pawn($giper_baza_file).Head(new $giper_baza_link('33333333'));
            const link = empty.link().str;
            const one = assets_of($, empty, yard_of($, () => mirror_of(empty.land()), [$mol_rest_port.make({})]));
            $mol_assert_equal(one.filled(link), false);
            $mol_assert_equal(one.sent(link), true);
            $mol_assert_equal(one.ready(link), false);
        },
        'the master is the one that is not the page itself'($) {
            $.$giper_baza_yard = class extends $giper_baza_yard {
                static masters_default = ['https://page.test/'];
                static masters() {
                    return ['https://page.test/', 'https://baza.test/'];
                }
            };
            const yard = $.$giper_baza_yard.make({ $ });
            $mol_assert_equal($bog_vmap_asset.make({ $, yard: () => yard }).master(), 'https://baza.test/');
        },
        'the master is the one the application talks to right now'($) {
            $.$giper_baza_yard = class extends $giper_baza_yard {
                static masters_default = ['https://page.test/'];
                static masters() {
                    return ['https://page.test/', 'https://one.test/', 'https://two.test/'];
                }
            };
            const yard = $.$giper_baza_yard.make({ $ });
            const one = $bog_vmap_asset.make({ $, yard: () => yard });
            $mol_assert_equal(one.master(), 'https://one.test/');
            yard.master_cursor(2);
            $mol_assert_equal(one.master(), 'https://two.test/');
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
    const d = '$';
    $mol_test_mocks.push($ => {
        class $mol_state_arg_mock extends $.$mol_state_arg {
        }
        $.$mol_state_arg = $mol_state_arg_mock;
    });
    const src_page = `${d}bog_vmap_app_store_test_page ${d}mol_view\n\tCalc ${d}bog_vmap_app_store_test_calc\n\tcalc_result = Calc result\n\tsub / <= Calc\n`;
    const src_calc = `${d}bog_vmap_app_store_test_calc ${d}mol_view\n\tresult 42\n\tstep 1\n`;
    const src_hero = `${d}bog_vmap_app_store_test_hero ${d}mol_view\n\ttitle \\Hi\n\tsub / <= title\n`;
    function store($) {
        return $bog_vmap_app_store.make({
            $,
            doc_land_config: () => null,
        });
    }
    function $bog_vmap_app_store_test_mine(disk) {
        return class extends $giper_baza_mine_temp {
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
        };
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
        'a class renamed in the text arrives as an empty node and the old one leaves'($) {
            const s = store($);
            const doc = s.doc_add('Landing', src_page + src_calc);
            s.node(doc, `${d}bog_vmap_app_store_test_calc`).js('result(){ return 42 }');
            const renamed = src_calc.replace('_calc ', '_total ');
            s.source(src_page + renamed);
            $mol_assert_equal(s.nodes(doc).length, 2);
            $mol_assert_equal(s.node(doc, `${d}bog_vmap_app_store_test_calc`), null);
            $mol_assert_equal(s.node_js(doc, `${d}bog_vmap_app_store_test_total`), '');
        },
        async 'a document written in one session comes back in the next'($) {
            const disk = new Map;
            const mine = $bog_vmap_app_store_test_mine(disk);
            const session = () => {
                const ctx = Object.create($);
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
                ctx.$mol_storage = class extends $.$mol_storage {
                    static total() { return 1e9; }
                    static used() { return 0; }
                };
                const store = $bog_vmap_app_store.make({
                    $: ctx,
                    doc_land_config: () => [[null, $giper_baza_rank_read]],
                });
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
            await $mol_wire_async(one.store.home().land()).units_saving();
            await $mol_wire_async(made.land()).units_saving();
            const two = session();
            two.look();
            $mol_assert_equal((await read(two.store, 'doc_links')).length, 1);
            $mol_assert_equal(await read(two.store, 'title'), 'Сцена 1');
            $mol_assert_equal(await read(two.store, 'source'), src_page);
            const three = session();
            await read(three.store, 'doc_arg', link);
            three.look();
            const current = await read(three.store, 'doc_current');
            $mol_assert_equal(current.link().str, link);
            $mol_assert_equal(await read(three.store, 'source'), src_page);
        },
        async 'a document opened by a link survives a restart with the quota unknown'($) {
            const disk = new Map;
            const mine = $bog_vmap_app_store_test_mine(disk);
            const owner = await $.$giper_baza_auth.grab();
            const theirs = $giper_baza_land.make({ $, auth: () => owner });
            const their_doc = theirs.Data($bog_vmap_app_doc);
            their_doc.title('Theirs');
            store($).doc_source(their_doc, src_hero);
            const link = their_doc.link();
            const session = () => {
                const ctx = Object.create($);
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
                ctx.$mol_storage = class extends $.$mol_storage {
                    static total() { return 0; }
                    static used() { return 0; }
                    static portion() { return 1; }
                };
                const store = $bog_vmap_app_store.make({
                    $: ctx,
                    doc_land_config: () => null,
                });
                const eye = new $mol_wire_atom('eye', () => {
                    try {
                        return store.source().length;
                    }
                    catch (error) {
                        if ($mol_promise_like(error))
                            return $mol_fail_hidden(error);
                        return -1;
                    }
                });
                return { store, look: () => { try {
                        eye.fresh();
                    }
                    catch (error) { } } };
            };
            const read = (store, name, ...args) => $mol_wire_async(store)[name](...args);
            const one = session();
            one.store.doc_pick(link);
            one.look();
            $mol_assert_equal(one.store.boot(), 'ready');
            await $mol_wire_async(one.store.doc(link).land()).units_steal(theirs);
            one.look();
            $mol_assert_equal(await read(one.store, 'source'), src_hero);
            await $mol_wire_async(one.store.doc(link).land()).units_saving();
            $mol_assert_equal((disk.get(link.land().str)?.size ?? 0) > 0, true);
            const two = session();
            two.store.doc_pick(link);
            two.look();
            $mol_assert_equal(await read(two.store, 'source'), src_hero);
            $mol_assert_equal(await read(two.store, 'title'), 'Theirs');
        },
        'the root can be pointed at another class of the document'($) {
            const s = store($);
            const doc = s.doc_add('Landing', src_page + src_calc);
            s.doc_root(doc, `${d}bog_vmap_app_store_test_calc`);
            $mol_assert_equal(s.doc_root(doc), `${d}bog_vmap_app_store_test_calc`);
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
            s.pack('https://mol.hyoo.ru, aaaaaaaa_bbbbbbbb');
            $mol_assert_equal(s.pack(), 'https://mol.hyoo.ru, aaaaaaaa_bbbbbbbb');
            s.spots({ Hero: { x: 0, y: 0 }, Calc: { x: 100, y: -20.5 } });
            $mol_assert_like(s.spots(), { Calc: { x: 100, y: -20.5 }, Hero: { x: 0, y: 0 } });
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
            $mol_assert_like(s.doc_links().map(link => s.doc(link).title()), ['First', 'Second']);
        },
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
            s.doc_first();
            $mol_assert_equal(s.doc_links().length, 1);
        },
        async 'boot makes the first document and then reports it'($) {
            const s = store($);
            $mol_assert_equal(s.boot(), 'making');
            const held = s.doc_first_task();
            $mol_assert_equal(s.doc_first_task().task === held.task, true);
            await held.task;
            $mol_assert_equal(s.doc_links().length, 1);
            $mol_assert_equal(s.boot(), 'ready');
            $mol_assert_equal(s.stage(), 'ready');
            $mol_assert_equal(s.doc_first_task().task === held.task, true);
            $mol_assert_equal(s.doc_links().length, 1);
        },
        'boot reports the document it just made, in the same breath'($) {
            const s = store($);
            $mol_assert_equal(s.boot(), 'making');
            $mol_assert_equal(s.doc_links().length, 1);
            $mol_assert_equal(s.boot(), 'ready');
            $mol_assert_equal(s.stage(), 'ready');
        },
        'boot leaves an existing document alone'($) {
            const s = store($);
            s.doc_add('First', src_page);
            $mol_assert_equal(s.boot(), 'ready');
            $mol_assert_equal(s.doc_links().length, 1);
            $mol_assert_equal($mol_wire_probe(() => s.doc_first_task()), undefined);
        },
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
        async 'a suspended land does not leave the reader on making for ever'($) {
            let open = () => { };
            const gate = new Promise(done => { open = () => done(); });
            let held = true;
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
        async 'the draft survives a suspension after the document is already listed'($) {
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
            $mol_assert_equal(s.boot(), 'making');
            $mol_assert_equal(s.doc_links().length, 1);
            $mol_assert_equal(s.doc_source(s.doc_current()), '');
            $mol_assert_equal(s.boot(), 'ready');
            held = false;
            open();
            await s.doc_first_task().task;
            $mol_assert_equal(s.doc_links().length, 1);
            $mol_assert_equal(s.source(), src_page);
        },
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
            const reader = $mol_wire_atom.solo(s, function boot_reader() {
                return this.boot();
            });
            $mol_assert_equal(reader.sync(), 'making');
            $mol_assert_equal(s.doc_links().length, 1);
            reader.refresh();
            $mol_assert_equal(reader.sync(), 'ready');
            await new Promise(done => new $mol_after_tick(() => done(null)));
            held = false;
            open();
            await new Promise(done => new $mol_after_tick(() => done(null)));
            await new Promise(done => new $mol_after_tick(() => done(null)));
            $mol_assert_equal(s.doc_links().length, 1);
            $mol_assert_equal(s.source(), src_page);
        },
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
            $mol_assert_equal(s.doc_links().length, 0);
        },
        'a node edited through the store still sees a write past it'($) {
            const s = store($);
            const doc = s.doc_add('Landing');
            s.source(src_page);
            $mol_assert_equal(s.source(), src_page);
            s.nodes(doc)[0].Tree(null).val(src_hero);
            $mol_assert_equal(s.source(), src_hero);
            $mol_assert_equal(s.nodes(doc).length, 1);
        },
        async 'a node edited through the store still sees a merged remote edit'($) {
            const s = store($);
            const doc = s.doc_add('Landing');
            s.source(src_page);
            const head = s.nodes(doc)[0].head();
            const home = s.home().land();
            const peer = $giper_baza_land.make({ $ });
            const last = home.tick().time_tick;
            while (peer.tick().time_tick <= last)
                ;
            peer.Pawn($bog_vmap_app_doc_node).Head(head).Tree(null).val(src_hero);
            await $mol_wire_async(home).units_steal(peer);
            $mol_assert_equal(s.nodes(doc)[0].Tree().val(), src_hero);
            $mol_assert_equal(s.source(), src_hero);
        },
        'a snapshot keeps the whole document and reads back'($) {
            const s = store($);
            const doc = s.doc_add('Landing');
            s.source(src_page + src_calc);
            s.node_js(doc, `${d}bog_vmap_app_store_test_calc`, 'return 1');
            s.node_css(doc, `${d}bog_vmap_app_store_test_page`, ':host { color: red }');
            s.spots({ Hero: { x: 10, y: 20 } });
            const state = s.doc_state(doc);
            const snap = s.snap_add(doc, state, 1757000000000);
            $mol_assert_equal(s.snaps(doc).length, 1);
            $mol_assert_equal(snap.time(), 1757000000000);
            $mol_assert_equal(snap.author(), doc.land().auth().pass().lord().str);
            $mol_assert_like(s.snap_state(snap), state);
            $mol_assert_like(s.snap_state(snap), {
                source: src_page + src_calc,
                js: { [`${d}bog_vmap_app_store_test_calc`]: 'return 1' },
                css: { [`${d}bog_vmap_app_store_test_page`]: ':host { color: red }' },
                spots: { Hero: { x: 10, y: 20 } },
            });
        },
        'the document goes back to the state of a snapshot'($) {
            const s = store($);
            const doc = s.doc_add('Landing');
            s.source(src_page);
            s.node_css(doc, `${d}bog_vmap_app_store_test_page`, ':host { color: red }');
            s.spots({ Hero: { x: 10, y: 20 } });
            const snap = s.snap_add(doc, s.doc_state(doc), 1);
            s.source(src_page + src_calc);
            s.node_css(doc, `${d}bog_vmap_app_store_test_page`, '');
            s.spots({ Hero: { x: 300, y: 400 } });
            s.doc_state(doc, s.snap_state(snap));
            $mol_assert_equal(s.source(), src_page);
            $mol_assert_equal(s.node_css(doc, `${d}bog_vmap_app_store_test_page`), ':host { color: red }');
            $mol_assert_equal(s.nodes(doc).length, 1);
            $mol_assert_like(s.spots(), { Hero: { x: 10, y: 20 } });
        },
        'the oldest snapshots are evicted down to the limit'($) {
            class store_short extends $bog_vmap_app_store {
                snap_limit() {
                    return 3;
                }
            }
            const s = store_short.make({ $, doc_land_config: () => null });
            const doc = s.doc_add('Landing');
            s.source(src_page);
            for (let time = 1; time <= 5; ++time)
                s.snap_add(doc, s.doc_state(doc), time);
            const snaps = s.snaps(doc);
            $mol_assert_equal(snaps.length, 3);
            $mol_assert_like(snaps.map(snap => snap.time()), [3, 4, 5]);
            $mol_assert_equal(snaps[0].source(), src_page);
        },
        async 'a snapshot written in one session comes back in the next'($) {
            const disk = new Map;
            const mine = $bog_vmap_app_store_test_mine(disk);
            const session = () => {
                const ctx = Object.create($);
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
                ctx.$mol_storage = class extends $.$mol_storage {
                    static total() { return 1e9; }
                    static used() { return 0; }
                };
                const store = $bog_vmap_app_store.make({
                    $: ctx,
                    doc_land_config: () => [[null, $giper_baza_rank_read]],
                });
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
                return { store, look: () => { try {
                        eye.fresh();
                    }
                    catch (error) { } } };
            };
            const read = (store, name, ...args) => $mol_wire_async(store)[name](...args);
            const one = session();
            one.look();
            const made = await read(one.store, 'doc_add', 'Сцена 1', src_page);
            const link = made.link().str;
            one.look();
            const state = await read(one.store, 'doc_state', made);
            await read(one.store, 'snap_add', made, state, 1757);
            one.look();
            await $mol_wire_async(one.store.home().land()).units_saving();
            await $mol_wire_async(made.land()).units_saving();
            const two = session();
            await read(two.store, 'doc_arg', link);
            two.look();
            const doc = await read(two.store, 'doc_current');
            const snaps = await read(two.store, 'snaps', doc);
            $mol_assert_equal(snaps.length, 1);
            $mol_assert_equal(await $mol_wire_async(snaps[0]).time(), 1757);
            const back = await read(two.store, 'snap_state', snaps[0]);
            $mol_assert_equal(back.source, src_page);
        },
        async 'a file put into the base is addressed from the document'($) {
            const s = store($);
            s.doc_add('Landing');
            s.assets = () => $bog_vmap_asset.make({
                $,
                master: () => 'https://baza.test/',
                land: () => $giper_baza_land.make({ $ }),
            });
            const uri = await $mol_wire_async(s).asset_put(new $mol_blob([new Uint8Array([137, 80, 78, 71])], { type: 'image/png' }));
            s.source(`${d}bog_vmap_app_store_test_page ${d}mol_view\n\tLogo ${d}mol_image uri \\${uri}\n\tsub / <= Logo\n`);
            $mol_assert_ok(s.source().includes(uri));
            $mol_assert_equal(s.asset_links().length, 1);
            $mol_assert_ok(uri.includes(s.asset_links()[0]));
        },
        'the store lists the assets that have not reached the master'($) {
            let polled = 0;
            $.$mol_state_time = class extends $mol_state_time {
                static now() {
                    polled++;
                    return 0;
                }
            };
            const arrived = new Set();
            const assets = $bog_vmap_asset.make({
                $,
                master: () => 'https://baza.test/',
                ready: (link) => arrived.has(link),
            });
            const s = store($);
            s.assets = () => assets;
            const land = $giper_baza_land.make({ $ });
            const one = land.Pawn($giper_baza_file).Head(new $giper_baza_link('11111111'));
            one.name('one.png');
            const two = land.Pawn($giper_baza_file).Head(new $giper_baza_link('22222222'));
            two.name('two.png');
            s.source(`${d}bog_vmap_app_store_test_page ${d}mol_view\n`
                + `\tLogo ${d}mol_image uri \\${assets.uri(one)}\n`
                + `\tHero ${d}mol_image uri \\${assets.uri(two)}\n`
                + `\tsub / <= Logo\n`);
            const links = s.asset_links();
            $mol_assert_equal(links.length, 2);
            arrived.add(links[0]);
            $mol_assert_like(s.assets_pending(), [links[1]]);
            $mol_assert_ok(polled > 0);
        },
        'a document without assets asks about nothing and polls nothing'($) {
            let polled = 0;
            $.$mol_state_time = class extends $mol_state_time {
                static now() {
                    polled++;
                    return 0;
                }
            };
            const s = store($);
            s.source(src_hero);
            $mol_assert_like(s.assets_pending(), []);
            $mol_assert_equal(polled, 0);
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    const box = (x, y, width, height) => ({ x, y, width, height });
    const column = [box(0, 0, 400, 100), box(0, 100, 400, 100), box(0, 200, 400, 100)];
    const row = [box(0, 0, 100, 300), box(100, 0, 100, 300), box(200, 0, 100, 300)];
    const board = box(0, 0, 400, 300);
    $mol_test({
        'the declared direction wins, then the geometry, then a column'($) {
            $mol_assert_equal($bog_vmap_app_pane_slot_axis(column, 'row'), 'row');
            $mol_assert_equal($bog_vmap_app_pane_slot_axis(row, 'column'), 'column');
            $mol_assert_equal($bog_vmap_app_pane_slot_axis(column), 'column');
            $mol_assert_equal($bog_vmap_app_pane_slot_axis(row), 'row');
            $mol_assert_equal($bog_vmap_app_pane_slot_axis(column, ''), 'column');
            $mol_assert_equal($bog_vmap_app_pane_slot_axis([]), 'column');
            $mol_assert_equal($bog_vmap_app_pane_slot_axis([column[0]]), 'column');
            $mol_assert_equal($bog_vmap_app_pane_slot_axis([column[0]], 'row'), 'row');
            $mol_assert_equal($bog_vmap_app_pane_slot_axis(row, 'row-reverse'), 'row');
            $mol_assert_equal($bog_vmap_app_pane_slot_axis(column, 'row-reverse'), 'column');
        },
        'a declared direction decides where a lone child is passed'($) {
            const one = [box(0, 0, 100, 300)];
            const before = $bog_vmap_app_pane_slot('Board', board, one, [20, 150], 'row');
            const after = $bog_vmap_app_pane_slot('Board', board, one, [80, 150], 'row');
            $mol_assert_equal(before.index, 0);
            $mol_assert_equal(after.index, 1);
            $mol_assert_equal($bog_vmap_app_pane_slot('Board', board, one, [20, 200]).index, 1);
            $mol_assert_equal($bog_vmap_app_pane_slot('Board', board, one, [80, 200], 'row').index, 1);
            $mol_assert_equal($bog_vmap_app_pane_slot('Board', board, one, [20, 200], 'row').index, 0);
        },
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
        'an empty container offers the one position it has'($) {
            const slot = $bog_vmap_app_pane_slot('Board', box(40, 60, 400, 300), [], [200, 200]);
            $mol_assert_equal(slot.index, 0);
            $mol_assert_like(slot.line, { x: 40, y: 60, width: 400, height: 0 });
        },
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
    const d = '$';
    const root = `${d}doc`;
    const calc = `${d}flow_calc`;
    const map = `${d}flow_map`;
    const pane_make = ($, rect = {}, over = {}) => {
        const posted = [];
        const peer = {
            origin: 'null',
            postMessage(data) { posted.push(data); },
        };
        const declared = () => {
            const names = new Set();
            for (const key of Object.keys(pane.sizes())) {
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
            ...over,
        });
        pane.handshake(pane.scene_key(), 1);
        const answer = (data) => {
            pane.message_receive({ data: { ns: $bog_vmap_bridge_ns, ...data }, source: peer });
        };
        return { pane, peer, posted, answer };
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
            const before = stage.scene.sent('click_at').length;
            stage.tap(stage.part_center('Calc'));
            $mol_assert_equal(stage.app.selected(), 'Calc');
            $mol_assert_equal(stage.pane.inside(), false);
            $mol_assert_equal(stage.pane.overlay_style().clipPath, 'none');
            $mol_assert_equal(stage.scene.sent('click_at').length, before);
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
        async 'leaving a part takes the focus back off the frame'($) {
            const stage = $bog_vmap_app_flow_stage($);
            const dom = $.$mol_dom_context;
            stage.drop(calc, stage.client([200, 150]));
            stage.tap(stage.client([500, 400]));
            stage.tap(stage.part_center('Calc'));
            stage.tap(stage.part_center('Calc'));
            $mol_assert_equal(stage.pane.inside(), true);
            stage.frame().focus();
            $mol_assert_equal(dom.document.activeElement, stage.frame());
            dom.document.dispatchEvent(new dom.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
            stage.redraw();
            await Promise.resolve();
            await Promise.resolve();
            $mol_assert_equal(stage.pane.inside(), false);
            $mol_assert_equal(dom.document.activeElement === stage.frame(), false);
            $mol_assert_equal(dom.document.activeElement, stage.pane.dom_node());
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
        'a band takes several parts, and they move and delete as one'($) {
            const stage = $bog_vmap_app_flow_stage($);
            stage.drop(calc, stage.client([100, 100]));
            stage.drop(map, stage.client([300, 100]));
            $mol_assert_like([...stage.app.picked()], ['Map']);
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
            const from = stage.part_center('Calc');
            stage.press(overlay, from);
            stage.move(overlay, [from[0] + 40, from[1] + 30]);
            stage.release(overlay, [from[0] + 40, from[1] + 30]);
            stage.redraw();
            $mol_assert_like(stage.app.spots(), {
                Calc: { x: 140, y: 130 },
                Map: { x: 340, y: 130 },
            });
            stage.click(stage.button('Удалить'));
            const source = stage.app.doc_source();
            $mol_assert_equal(source.includes('Calc'), false);
            $mol_assert_equal(source.includes('Map'), false);
            $mol_assert_like(Object.keys(stage.app.spots()), []);
            $mol_assert_like([...stage.app.picked()], []);
        },
        'a scene that never came up says so, and says what to do about it'($) {
            const stage = $bog_vmap_app_flow_stage($, { mute: true });
            $mol_assert_equal(stage.pane.warmed(), false);
            $mol_assert_equal(stage.app.stalled(), false);
            const timer = stage.timers.at(-1);
            $mol_assert_ok(stage.pane.watchdog() !== null);
            $mol_assert_equal(stage.pane.watchdog().delay, stage.pane.cold_limit());
            const watch = stage.pane.watchdog();
            watch.task();
            stage.redraw();
            $mol_assert_equal(stage.app.stalled(), false);
            $mol_assert_equal(stage.pane.restart_tries(), 1);
            watch.task();
            stage.redraw();
            $mol_assert_equal(stage.app.stalled(), true);
            const text = stage.text();
            $mol_assert_ok(text.includes('Сцена не запустилась'));
            $mol_assert_ok(text.includes('уже исправлен'));
            $mol_assert_ok(text.includes('ещё раз'));
            $mol_assert_ok(text.includes('сначала исправьте код'));
            stage.button('Перезагрузить сцену');
            $mol_assert_ok(timer !== null);
        },
        'entering a part hands the keyboard to the frame'($) {
            const stage = $bog_vmap_app_flow_stage($);
            stage.drop(calc, stage.client([200, 150]));
            stage.tap(stage.client([500, 400]));
            $mol_assert_equal(stage.app.selected(), null);
            let focused = 0;
            stage.frame().focus = () => { focused++; };
            stage.tap(stage.part_center('Calc'));
            $mol_assert_equal(stage.pane.inside(), false);
            $mol_assert_equal(focused, 0);
            stage.tap(stage.part_center('Calc'));
            $mol_assert_equal(stage.pane.inside(), true);
            $mol_assert_equal(focused, 1);
        },
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
        'REPRO rebinding an occupied input leaves no orphan behind'($) {
            const stage = $bog_vmap_app_flow_stage($);
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
            const zoom = stage.pane.camera_zoom();
            const inside = (x, y) => stage.client([
                page.left + x * zoom,
                page.top + y * zoom,
            ]);
            stage.drop(calc, inside(200, 40));
            stage.drop(map, inside(200, 250));
            const node = stage.app.node();
            $mol_assert_like(node.sub_names('Page'), ['Calc', 'Map']);
            const overlay = stage.overlay();
            const from = stage.part_center('Map');
            const to = inside(200, 5);
            stage.press(overlay, from);
            stage.move(overlay, to);
            stage.release(overlay, to);
            stage.redraw();
            stage.scene.flush();
            $mol_assert_like(node.sub_names('Page'), ['Map', 'Calc']);
        },
        'the first click picks, the second lets the pointer in and relays it'($) {
            const { pane, posted } = pane_make($, { left: 10, top: 20 });
            pane.camera_shift(new $mol_vector_2d(100, 50));
            pane.camera_zoom(2);
            pane.sizes({ [`${root}/A`]: box(30, 40) });
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
        'a release far from its press is not a way into the node'($) {
            const { pane } = pane_make($);
            pane.sizes({ [`${root}/A`]: box(0, 0) });
            pane.spots({ A: { x: 0, y: 0 } });
            pane.node_press(pointer(50, 25));
            pane.node_release(pointer(50, 25, { buttons: 0 }));
            $mol_assert_equal(pane.primary(), 'A');
            $mol_assert_equal(pane.inside(), false);
            pane.node_press(pointer(50, 25));
            pane.node_release(pointer(250, 225, { buttons: 0 }));
            $mol_assert_equal(pane.inside(), false);
        },
        'a second click that drifts a few pixels still lets the pointer inside'($) {
            const { pane } = pane_make($);
            pane.sizes({ [`${root}/A`]: box(0, 0) });
            pane.spots({ A: { x: 0, y: 0 } });
            pane.node_press(pointer(50, 25));
            pane.node_release(pointer(50, 25, { buttons: 0 }));
            $mol_assert_equal(pane.primary(), 'A');
            $mol_assert_equal(pane.inside(), false);
            pane.node_press(pointer(50, 25));
            pane.node_release(pointer(55, 25, { buttons: 0 }));
            $mol_assert_equal(pane.inside(), true);
        },
        'two separate clicks with a keystroke between them let the pointer in'($) {
            const stage = $bog_vmap_app_flow_stage($);
            stage.drop(calc, stage.client([200, 150]));
            stage.drop(map, stage.client([400, 150]));
            stage.tap(stage.part_center('Calc'));
            $mol_assert_equal(stage.app.selected(), 'Calc');
            $mol_assert_equal(stage.pane.inside(), false);
            const dom = $.$mol_dom_context;
            dom.document.dispatchEvent(new dom.KeyboardEvent('keydown', { key: '9', bubbles: true }));
            stage.redraw();
            $mol_assert_equal(stage.app.selected(), 'Calc');
            const centre = stage.part_center('Calc');
            stage.press(stage.overlay(), centre);
            stage.release(stage.overlay(), [centre[0] + 3, centre[1] + 3]);
            stage.redraw();
            stage.scene.flush();
            $mol_assert_equal(stage.pane.inside(), true);
        },
        'picking another node puts the pointer back outside'($) {
            const { pane } = pane_make($);
            pane.sizes({ [`${root}/A`]: box(0, 0), [`${root}/B`]: box(300, 0) });
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
            pane.node_press(pointer(50, 25));
            pane.node_release(pointer(50, 25, { buttons: 0 }));
            $mol_assert_equal(pane.primary(), 'A');
            $mol_assert_equal(pane.inside(), false);
        },
        'Escape relayed from the frame steps out of the node, then out of the pick'($) {
            const { pane, answer } = pane_make($);
            pane.sizes({ [`${root}/A`]: box(0, 0) });
            pane.node_press(pointer(50, 25));
            pane.node_release(pointer(50, 25, { buttons: 0 }));
            pane.node_press(pointer(50, 25));
            pane.node_release(pointer(50, 25, { buttons: 0 }));
            $mol_assert_equal(pane.inside(), true);
            answer({ kind: 'key', key: 'Escape' });
            $mol_assert_equal(pane.inside(), false);
            $mol_assert_equal(pane.primary(), 'A');
            answer({ kind: 'key', key: 'Escape' });
            $mol_assert_equal(pane.primary(), null);
            $mol_assert_like(pane.picked(), []);
        },
        'the modifiers travel with the click'($) {
            const { pane, posted } = pane_make($);
            pane.sizes({ [`${root}/A`]: box(0, 0) });
            pane.node_press(pointer(50, 25));
            pane.node_release(pointer(50, 25, { buttons: 0 }));
            pane.node_press(pointer(50, 25));
            pane.node_release(pointer(50, 25, { buttons: 0, shiftKey: true, metaKey: true }));
            $mol_assert_like(clicks(posted)[0].mods, { altKey: false, ctrlKey: false, metaKey: true, shiftKey: true });
        },
        'movement past the threshold moves the part and relays nothing'($) {
            const { pane, posted } = pane_make($);
            pane.sizes({ [`${root}/A`]: box(0, 0) });
            pane.spots({ A: { x: 0, y: 0 } });
            pane.node_press(pointer(50, 25));
            pane.node_move(pointer(70, 25));
            pane.node_release(pointer(70, 25, { buttons: 0 }));
            $mol_assert_equal(pane.primary(), 'A');
            $mol_assert_equal(pane.spots().A.x, 20);
            $mol_assert_equal(pane.spots().A.y, 0);
            $mol_assert_equal(clicks(posted).length, 0);
        },
        'the ring carries the live offset only until a fresh report arrives'($) {
            const { pane } = pane_make($);
            pane.sizes({ [`${root}/A`]: box(0, 0) });
            pane.spots({ A: { x: 0, y: 0 } });
            pane.node_press(pointer(50, 25));
            pane.node_move(pointer(70, 25));
            $mol_assert_equal(pane.sizes()[`${root}/A`].x, 0);
            $mol_assert_equal(pane.part_box('A').left, 20);
            pane.sizes({ [`${root}/A`]: box(20, 0) });
            $mol_assert_equal(pane.part_box('A').left, 20);
        },
        'a release far from the press is not a click even without moves in between'($) {
            const { pane, posted } = pane_make($);
            pane.node_press(pointer(50, 25));
            pane.node_release(pointer(90, 25, { buttons: 0 }));
            $mol_assert_equal(clicks(posted).length, 0);
        },
        'a wobble within the threshold is still a click'($) {
            const { pane, posted } = pane_make($);
            pane.sizes({ [`${root}/A`]: box(0, 0) });
            pane.node_press(pointer(50, 25));
            pane.node_release(pointer(50, 25, { buttons: 0 }));
            pane.node_press(pointer(50, 25));
            pane.node_move(pointer(52, 27));
            pane.node_release(pointer(51, 26, { buttons: 0 }));
            $mol_assert_equal(clicks(posted).length, 1);
        },
        'a click on bare canvas drops the selection and relays nothing'($) {
            const { pane, posted } = pane_make($);
            pane.sizes({ [`${root}/A`]: box(0, 0) });
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
        'the first zoom after a load pivots on the middle of the canvas'($) {
            const { pane } = pane_make($);
            pane.zoom_by(1.25);
            $mol_assert_equal(pane.camera_zoom(), 1.25);
            $mol_assert_like([...pane.camera_shift()], [-125, -100]);
        },
        'the grip around a part is measured in screen pixels'($) {
            const { pane } = pane_make($);
            pane.sizes({ [`${root}/A`]: box(0, 0, 100, 100) });
            pane.camera_zoom(1);
            $mol_assert_equal(pane.node_at([106, 50]), 'A');
            $mol_assert_equal(pane.node_at([110, 50]), null);
            pane.camera_zoom(.25);
            $mol_assert_equal(pane.node_at([130, 50]), 'A');
            $mol_assert_equal(pane.node_at([134, 50]), null);
        },
        'the hole follows the picked part through the camera'($) {
            const { pane } = pane_make($);
            pane.camera_shift(new $mol_vector_2d(100, 50));
            pane.camera_zoom(2);
            pane.sizes({ [`${root}/A`]: box(30, 40, 100, 50) });
            $mol_assert_equal(pane.overlay_style().clipPath, 'none');
            pane.picked(['A']);
            $mol_assert_equal(pane.overlay_style().clipPath, 'none');
            $mol_assert_equal(pane.frame_showed(), true);
            pane.entered('A');
            $mol_assert_like(pane.frame_box(), { left: 160, top: 130, width: 200, height: 100 });
            $mol_assert_equal(pane.overlay_style().clipPath, 'polygon(evenodd, 0 0, 100% 0, 100% 100%, 0 100%, 0 0, 160px 130px, 360px 130px, 360px 230px, 160px 230px, 160px 130px)');
            $mol_assert_like(pane.frame_style('A'), { left: '160px', top: '130px', width: '200px', height: '100px' });
        },
        'a band takes what it overlaps, containers and not their children'($) {
            const { pane } = pane_make($);
            pane.sizes({
                [`${root}/A`]: box(0, 0, 100, 50),
                [`${root}/Page`]: box(200, 0, 300, 200),
                [`${root}/Page/B`]: box(200, 0, 100, 50),
            });
            pane.node_press(pointer(-10, -10, { ctrlKey: true }));
            pane.node_move(pointer(600, 300, { ctrlKey: true }));
            pane.node_release(pointer(600, 300, { ctrlKey: true, buttons: 0 }));
            $mol_assert_like([...pane.picked()], ['A', 'Page']);
            $mol_assert_equal(pane.band(), null);
            pane.node_press(pointer(90, 40, { ctrlKey: true }));
            pane.node_move(pointer(150, 100, { ctrlKey: true }));
            pane.node_release(pointer(150, 100, { ctrlKey: true, buttons: 0 }));
            $mol_assert_like([...pane.picked()], ['A']);
        },
        'a band takes the pointer out of the node it was let into'($) {
            const { pane } = pane_make($);
            pane.sizes({ [`${root}/A`]: box(0, 0) });
            pane.node_press(pointer(50, 25));
            pane.node_release(pointer(50, 25, { buttons: 0 }));
            pane.node_press(pointer(50, 25));
            pane.node_release(pointer(50, 25, { buttons: 0 }));
            $mol_assert_equal(pane.inside(), true);
            pane.node_press(pointer(-10, -10, { ctrlKey: true }));
            pane.node_move(pointer(150, 60, { ctrlKey: true }));
            pane.node_release(pointer(150, 60, { ctrlKey: true, buttons: 0 }));
            $mol_assert_like([...pane.picked()], ['A']);
            $mol_assert_equal(pane.inside(), false);
            $mol_assert_equal(pane.overlay_style().clipPath, 'none');
        },
        'REPRO the hit test stops at the nodes the document declares'($) {
            const { pane } = pane_make($, {}, { doc_names: () => ['Calc'] });
            pane.sizes({
                [`${root}/Calc`]: box(0, 0, 200, 100),
                [`${root}/Calc/Head`]: box(0, 0, 200, 30),
                [`${root}/Calc/Head/String`]: box(10, 5, 80, 20),
            });
            $mol_assert_equal(pane.node_at([50, 15]), 'Calc');
            $mol_assert_equal(pane.node_at([100, 50]), 'Calc');
            $mol_assert_like(pane.part_names(), ['Calc']);
            pane.picked(['Calc']);
            $mol_assert_like(pane.frame_style('Calc'), { left: '0px', top: '0px', width: '200px', height: '100px' });
        },
        'REPRO the deepest node of the document wins, the pack inside it does not'($) {
            const { pane } = pane_make($, {}, { doc_names: () => ['Page', 'Calc'] });
            pane.sizes({
                [`${root}/Page`]: box(0, 0, 400, 300),
                [`${root}/Page/Calc`]: box(0, 0, 200, 100),
                [`${root}/Page/Calc/Head`]: box(0, 0, 200, 30),
            });
            $mol_assert_equal(pane.node_at([100, 15]), 'Calc');
            $mol_assert_equal(pane.node_at([300, 200]), 'Page');
        },
        'REPRO a drag from the palette carries nothing of the canvas'($) {
            const { pane } = pane_make($);
            pane.sizes({ [`${root}/A`]: box(0, 0) });
            pane.spots({ A: { x: 0, y: 0 } });
            pane.node_press(pointer(50, 25));
            pane.carrying = () => true;
            pane.node_move(pointer(400, 300));
            pane.node_release(pointer(400, 300, { buttons: 0 }));
            $mol_assert_like(pane.spots(), { A: { x: 0, y: 0 } });
        },
        'REPRO a node that moved leaves no box behind at its old path'($) {
            const { pane, answer } = pane_make($, {}, { doc_names: () => ['Pair', 'Schet'] });
            answer({ kind: 'sizes', sizes: {
                    [`${root}/Schet`]: box(700, 600),
                    [`${root}/Pair`]: box(0, 0, 400, 300),
                } });
            answer({ kind: 'sizes', sizes: { [`${root}/Pair/Schet`]: box(10, 10) } });
            $mol_assert_like(Object.keys(pane.sizes()), [`${root}/Pair`, `${root}/Pair/Schet`]);
            $mol_assert_like(pane.part_size('Schet'), box(10, 10));
            $mol_assert_equal(pane.part_names().filter(name => name === 'Schet').length, 1);
            answer({ kind: 'sizes', sizes: { [`${root}/Schet`]: box(700, 600) } });
            $mol_assert_like(Object.keys(pane.sizes()), [`${root}/Pair`, `${root}/Schet`]);
            $mol_assert_like(pane.part_size('Schet'), box(700, 600));
            $mol_assert_equal(pane.part_names().filter(name => name === 'Schet').length, 1);
        },
        'a node the report leaves out keeps the box it had'($) {
            const { pane, answer } = pane_make($, {}, { doc_names: () => ['Pair', 'Schet'] });
            answer({ kind: 'sizes', sizes: {
                    [`${root}/Schet`]: box(700, 600),
                    [`${root}/Pair`]: box(0, 0, 400, 300),
                } });
            answer({ kind: 'sizes', sizes: { [`${root}/Pair`]: box(0, 0, 400, 400) } });
            $mol_assert_like(pane.part_size('Schet'), box(700, 600));
            $mol_assert_like(pane.part_size('Pair'), box(0, 0, 400, 400));
        },
        'REPRO a port dot belongs to the part it is drawn on, prefix or not'($) {
            const ports = [
                { name: 'zoom', next: false, own: true, kind: 'number' },
                { name: 'marker', next: false, own: true, kind: 'string' },
            ];
            const { pane } = pane_make($, {}, {
                doc_names: () => ['Pair', 'Map', 'Map_2'],
                part_ports: () => ports,
                wires: () => [],
            });
            pane.sizes({
                [`${root}/Pair`]: box(0, 0, 400, 500),
                [`${root}/Pair/Map_2`]: box(0, 0, 320, 220),
                [`${root}/Pair/Map`]: box(0, 220, 320, 220),
            });
            pane.wire_drag({ from: 'Pair', from_prop: 'x', kind: 'number' });
            pane.wire_point([-12, 227]);
            const dots = pane.wire_dots();
            const at = (x, y) => $bog_vmap_app_wire_dot_at(dots, [x, y]);
            $mol_assert_equal(at(-12, 227)?.node, 'Map');
            $mol_assert_equal(at(-12, 7)?.node, 'Map_2');
            $mol_assert_equal(dots.filter(dot => dot.node === 'Map').length, 2);
            $mol_assert_equal(dots.filter(dot => dot.node === 'Map_2').length, 1);
        },
        'a folded dot whose first port is of the wrong shape stands on the row it carries'($) {
            const ports = [
                { name: 'result', next: false, own: true, kind: 'number' },
                { name: 'op', next: false, own: true, kind: 'string' },
            ];
            const { pane } = pane_make($, {}, {
                doc_names: () => ['Calc', 'Map'],
                part_ports: () => ports,
                wires: () => [],
            });
            pane.sizes({
                [`${root}/Calc`]: box(0, 0, 200, 50),
                [`${root}/Map`]: box(400, 0, 200, 50),
            });
            pane.wire_drag({ from: 'Map', from_prop: 'marker', kind: 'string' });
            pane.wire_point([-9999, -9999]);
            const folded = pane.wire_dots().filter(dot => dot.node === 'Calc');
            const row = $bog_vmap_app_wire_port_point(pane.part_box('Calc'), 'in', 1);
            $mol_assert_equal(folded.length, 1);
            $mol_assert_equal(folded[0].port.name, 'op');
            $mol_assert_equal(folded[0].x, row[0]);
            $mol_assert_equal(folded[0].y, row[1]);
            pane.wire_point([folded[0].x, folded[0].y]);
            const opened = pane.wire_dots();
            const under = $bog_vmap_app_wire_dot_at(opened, [folded[0].x, folded[0].y]);
            $mol_assert_equal(opened.filter(dot => dot.node === 'Calc').length, 2);
            $mol_assert_equal(under?.node, 'Calc');
            $mol_assert_equal(under?.port.name, 'op');
            $mol_assert_equal(under?.lit, true);
        },
        'a stack of short parts keeps every dot on the part it belongs to'($) {
            const own = ['left', 'right', 'op', 'result'];
            const base = ['dom_name', 'title', 'style', 'minimal_height'];
            const ports = [
                ...own.map(name => ({ name, next: false, own: true, kind: 'number' })),
                ...base.map(name => ({ name, next: false, own: false, kind: 'number' })),
            ];
            const { pane } = pane_make($, {}, {
                doc_names: () => ['Fuel', 'Cost', 'Total'],
                part_ports: () => ports,
                wires: () => [],
            });
            pane.sizes({
                [`${root}/Fuel`]: box(0, 0, 200, 17),
                [`${root}/Cost`]: box(0, 17, 200, 17),
                [`${root}/Total`]: box(0, 34, 200, 17),
            });
            pane.wire_drag({ from: 'Board', from_prop: 'x', kind: 'number' });
            pane.wire_point([100, 8]);
            const dots = pane.wire_dots();
            const at = (x, y) => $bog_vmap_app_wire_dot_at(dots, [x, y]);
            $mol_assert_equal(dots.some(dot => base.includes(dot.port.name)), false);
            $mol_assert_equal(dots.filter(dot => dot.node === 'Fuel').length, own.length);
            $mol_assert_equal(dots.filter(dot => dot.node === 'Cost').length, 1);
            $mol_assert_equal(dots.filter(dot => dot.node === 'Total').length, 1);
            const left = $bog_vmap_app_wire_port_point(pane.part_box('Fuel'), 'in', 0);
            $mol_assert_equal(at(left[0], left[1])?.node, 'Fuel');
            $mol_assert_equal(at(left[0], left[1])?.port.name, 'left');
            const cost = $bog_vmap_app_wire_side_point(pane.part_box('Cost'), 'in');
            const total = $bog_vmap_app_wire_side_point(pane.part_box('Total'), 'in');
            $mol_assert_equal(Math.abs(cost[1] - total[1]) > $bog_vmap_app_wire_hit, true);
            $mol_assert_equal(at(cost[0], cost[1])?.node, 'Cost');
            $mol_assert_equal(at(total[0], total[1])?.node, 'Total');
            pane.wire_point(cost);
            const opened = pane.wire_dots().filter(dot => dot.node === 'Cost');
            $mol_assert_equal(opened.length, own.length);
            $mol_assert_like([opened[0].x, opened[0].y], [cost[0], cost[1]]);
            $mol_assert_equal(opened[0].port.name, 'left');
        },
        'a modified click leaves the picked set alone'($) {
            const { pane } = pane_make($);
            pane.sizes({ [`${root}/A`]: box(0, 0) });
            pane.picked(['A']);
            pane.node_press(pointer(500, 500, { ctrlKey: true }));
            pane.node_release(pointer(500, 500, { ctrlKey: true, buttons: 0 }));
            $mol_assert_like([...pane.picked()], ['A']);
            $mol_assert_equal(pane.band(), null);
        },
        'a carry moves the whole picked set'($) {
            const { pane } = pane_make($);
            pane.sizes({ [`${root}/A`]: box(0, 0), [`${root}/B`]: box(300, 0) });
            pane.spots({ A: { x: 0, y: 0 }, B: { x: 300, y: 0 } });
            pane.picked(['A', 'B']);
            pane.node_press(pointer(50, 25));
            pane.node_move(pointer(70, 45));
            pane.node_release(pointer(70, 45, { buttons: 0 }));
            $mol_assert_like(pane.spots(), { A: { x: 20, y: 20 }, B: { x: 320, y: 20 } });
        },
        'the hole is closed while a drop from the palette is on'($) {
            const { pane } = pane_make($);
            pane.sizes({ [`${root}/A`]: box(0, 0) });
            pane.picked(['A']);
            pane.entered('A');
            pane.carrying = () => true;
            $mol_assert_equal(pane.overlay_style().clipPath, 'none');
            $mol_assert_equal(pane.frame_showed(), true);
        },
        'the heartbeat pings once warmed and re-arms on the pong'($) {
            const timers = timers_fake($);
            const { pane, posted, answer } = pane_make($);
            $mol_assert_equal(pane.heartbeat(), null);
            pane.warmed(true);
            pane.watchdog();
            answer({ kind: 'sizes', sizes: {} });
            $mol_assert_equal(pane.watchdog(), null);
            const first = pane.heartbeat();
            $mol_assert_equal(first, timers[timers.length - 1]);
            first.task();
            const pings = posted.filter(m => m.kind === 'ping');
            $mol_assert_equal(pings.length, 1);
            const nonce = pings[0].nonce;
            $mol_assert_equal(nonce > 0, true);
            $mol_assert_equal(pane.watchdog() !== null, true);
            answer({ kind: 'pong', nonce });
            $mol_assert_equal(pane.watchdog(), null);
            $mol_assert_equal(pane.heartbeat() !== first, true);
        },
        'a silent scene is called stalled when the limit runs out'($) {
            const timers = timers_fake($);
            const { pane } = pane_make($);
            pane.warmed(true);
            pane.heartbeat().task();
            const watch = pane.watchdog();
            $mol_assert_equal(watch, timers[timers.length - 1]);
            $mol_assert_equal(watch.delay, pane.answer_limit());
            $mol_assert_equal(pane.stalled(), false);
            watch.task();
            $mol_assert_equal(pane.stalled(), true);
        },
        'a restart takes the old frame down before it puts a new one up'($) {
            const timers = timers_fake($);
            const { pane } = pane_make($);
            const frame_before = pane.Scene(pane.scene_key());
            $mol_assert_equal(pane.sub()[0], frame_before);
            pane.scene_restart();
            $mol_assert_equal(pane.scene_shown(), false);
            $mol_assert_equal(pane.sub().includes(frame_before), false);
            $mol_assert_equal(pane.sub().some(kid => kid === pane.Scene(pane.scene_key())), false);
            $mol_assert_equal(pane.sub()[0], pane.Overlay());
            const remount = timers.at(-1);
            $mol_assert_equal(remount.delay, pane.remount_delay());
            remount.task();
            $mol_assert_equal(pane.scene_shown(), true);
            $mol_assert_equal(pane.sub()[0], pane.Scene(pane.scene_key()));
            $mol_assert_equal(pane.sub()[0] !== frame_before, true);
        },
        'scene_restart gives a fresh frame and clears stalled'($) {
            const timers = timers_fake($);
            const { pane, posted, answer } = pane_make($);
            pane.warmed(true);
            pane.watchdog();
            answer({ kind: 'sizes', sizes: {} });
            const frame_before = pane.sub()[0];
            $mol_assert_equal(frame_before, pane.Scene(pane.scene_key()));
            pane.stalled(true);
            posted.length = 0;
            pane.scene_restart();
            timers.at(-1).task();
            $mol_assert_equal(pane.stalled(), false);
            $mol_assert_equal(pane.ready(), false);
            $mol_assert_equal(pane.warmed(), false);
            $mol_assert_equal(pane.sub()[0] !== frame_before, true);
            $mol_assert_equal(pane.sub()[0], pane.Scene(pane.scene_key()));
            $mol_assert_equal(pane.sub().length, 4);
            $mol_assert_equal(pane.sub()[3], pane.Marks());
            $mol_assert_equal(pane.watchdog(), null);
            $mol_assert_equal(pane.heartbeat(), null);
            $mol_assert_equal(posted.length, 0);
            answer({ kind: 'ready' });
            pane.watchdog();
            $mol_assert_equal(pane.ready(), true);
            $mol_assert_like(posted.map(m => m.kind), ['pack_set', 'theme_set', 'doc_set', 'css_set', 'libs_set', 'spots_set', 'camera_set']);
        },
        'the frame is sandboxed first, addressed never and raised from markup'($) {
            const { pane } = pane_make($, {}, { scene_bundle: () => 'https://vmap.test/scene/web.js' });
            const attr = pane.Scene(pane.scene_key()).attr();
            const entries = Object.entries(attr);
            const keys = entries.map(([name]) => name);
            $mol_assert_equal(keys[0], 'sandbox');
            $mol_assert_equal(entries[0][1], 'allow-scripts');
            $mol_assert_equal(attr.src, null);
            $mol_assert_ok(keys.indexOf('srcdoc') > 0);
            const html = String(attr.srcdoc);
            $mol_assert_ok(html.includes('src="https://vmap.test/scene/web.js"'));
            $mol_assert_ok(html.includes('color-scheme:dark'));
        },
        'the pack keys the frame and goes down the wire first'($) {
            const one = pane_make($, {}, { pack_uri: () => 'https://one.test/web.js' });
            const two = pane_make($, {}, { pack_uri: () => 'https://two.test/web.js' });
            one.pane.watchdog();
            $mol_assert_equal(one.posted[0]?.kind, 'pack_set');
            $mol_assert_equal(one.posted[0]?.uri, 'https://one.test/web.js');
            $mol_assert_ok(one.pane.scene_key() !== two.pane.scene_key());
            $mol_assert_ok(one.pane.scene_key().includes('https://one.test/web.js'));
            $mol_assert_equal(one.pane.scene_generation(), two.pane.scene_generation());
            $mol_assert_ok(one.pane.sub()[0] !== two.pane.sub()[0]);
        },
        'a relayed click arms the watchdog and sizes disarm it'($) {
            timers_fake($);
            const { pane, answer } = pane_make($);
            pane.sizes({ [`${root}/A`]: box(0, 0) });
            pane.warmed(true);
            pane.watchdog();
            answer({ kind: 'sizes', sizes: {} });
            $mol_assert_equal(pane.watchdog(), null);
            pane.node_press(pointer(50, 25));
            pane.node_release(pointer(50, 25, { buttons: 0 }));
            pane.node_press(pointer(50, 25));
            pane.node_release(pointer(50, 25, { buttons: 0 }));
            $mol_assert_equal(pane.watchdog() !== null, true);
            answer({ kind: 'sizes', sizes: {} });
            $mol_assert_equal(pane.watchdog(), null);
        },
        'before the first sizes the pulse is quiet'($) {
            timers_fake($);
            const { pane } = pane_make($);
            pane.node_press(pointer(5, 5));
            pane.node_release(pointer(5, 5, { buttons: 0 }));
            $mol_assert_equal(pane.heartbeat(), null);
        },
        'a frame that never answered at all is called out, on a limit of its own'($) {
            const timers = timers_fake($);
            const { pane, answer } = pane_make($);
            answer({ kind: 'ready' });
            pane.watchdog();
            $mol_assert_equal(pane.warmed(), false);
            $mol_assert_ok(pane.watchdog() !== null);
            $mol_assert_equal(timers.at(-1).delay, pane.cold_limit());
            $mol_assert_ok(pane.cold_limit() > pane.answer_limit());
            const generation = pane.scene_generation();
            const watch = timers.at(-1);
            watch.task();
            $mol_assert_equal(pane.stalled(), false);
            $mol_assert_equal(pane.restart_tries(), 1);
            $mol_assert_equal(pane.scene_generation(), generation + 1);
            watch.task();
            $mol_assert_equal(pane.stalled(), true);
            $mol_assert_equal(pane.restart_tries(), 1);
            $mol_assert_equal(pane.scene_generation(), generation + 1);
        },
        'the pack channel of the scene lands in its own note and a fresh frame clears it'($) {
            const { pane, answer } = pane_make($);
            $mol_assert_equal(pane.pack_note(), '');
            answer({ kind: 'error', at: 'pack', message: 'Загрузка библиотеки компонентов… http://dead.test/web.js' });
            $mol_assert_equal(pane.pack_note(), 'Загрузка библиотеки компонентов… http://dead.test/web.js');
            $mol_assert_equal(pane.error().includes('библиотеки'), false);
            $mol_assert_like(pane.errors(), {});
            answer({ kind: 'ready' });
            $mol_assert_equal(pane.pack_note(), '');
        },
        'a frame held up by the pack is called out at once, without a pointless relaunch'($) {
            const timers = timers_fake($);
            const { pane, answer } = pane_make($);
            answer({ kind: 'ready' });
            pane.watchdog();
            answer({ kind: 'sizes', sizes: {} });
            $mol_assert_equal(pane.watchdog(), null);
            answer({ kind: 'error', at: 'pack', message: 'Загрузка библиотеки компонентов… http://dead.test/web.js' });
            pane.warmed(false);
            $mol_assert_ok(pane.watchdog() !== null);
            $mol_assert_equal(timers.at(-1).delay, pane.cold_limit());
            const generation = pane.scene_generation();
            timers.at(-1).task();
            $mol_assert_equal(pane.stalled(), true);
            $mol_assert_equal(pane.restart_tries(), 0);
            $mol_assert_equal(pane.scene_generation(), generation);
        },
        'a scene that comes up gets its automatic retry back for next time'($) {
            const timers = timers_fake($);
            const { pane, answer } = pane_make($);
            answer({ kind: 'ready' });
            pane.watchdog();
            timers.at(-1).task();
            $mol_assert_equal(pane.restart_tries(), 1);
            answer({ kind: 'sizes', sizes: {} });
            $mol_assert_equal(pane.warmed(), true);
            $mol_assert_equal(pane.restart_tries(), 0);
        },
        'a drag from an output to a fitting input writes exactly two lines'($) {
            const { pane, node, posted } = wired_make($);
            pane.camera_shift(new $mol_vector_2d(100, 50));
            pane.camera_zoom(2);
            pane.sizes({ [`${root}/Calc`]: box(0, 0), [`${root}/Map`]: box(300, 0) });
            pane.picked(['Calc']);
            const before = node.source();
            pane.node_press(pointer(312, 57));
            $mol_assert_like(pane.wire_drag(), { from: 'Calc', from_prop: 'result', kind: 'number' });
            $mol_assert_equal(pane.primary(), 'Calc');
            pane.node_move(pointer(600, 100));
            $mol_assert_like(pane.wire_dots().map(dot => [dot.node, dot.port.name, dot.side, dot.x, dot.y, dot.lit]), [['Map', 'zoom', 'in', 688, 57, true]]);
            pane.node_move(pointer(710, 60));
            $mol_assert_like(pane.wire_dots().map(dot => [dot.node, dot.port.name, dot.side, dot.x, dot.y, dot.lit]), [['Map', 'zoom', 'in', 688, 57, true], ['Map', 'marker', 'in', 688, 71, false]]);
            $mol_assert_equal(pane.wire_drag_geometry().startsWith('M 312 57 C'), true);
            pane.node_release(pointer(688, 57, { buttons: 0 }));
            $mol_assert_equal(pane.wire_drag(), null);
            $mol_assert_equal(node.source().split('\n').length, before.split('\n').length + 1);
            $mol_assert_equal(node.source().includes('\tcalc_result = Calc result\n'), true);
            $mol_assert_equal(node.source().includes('zoom <= calc_result\n'), true);
            $mol_assert_like(node.wires(), [{ name: 'calc_result', node: 'Calc', prop: 'result', bidi: false }]);
            $mol_assert_like(node.links().map(link => [link.from, link.from_prop, link.to, link.to_prop]), [['Calc', 'result', 'Map', 'zoom']]);
            $mol_assert_equal(clicks(posted).length, 0);
            $mol_assert_equal(pane.wire_lines().length, 1);
            $mol_assert_equal(pane.wire_lines()[0].geometry.startsWith('M 312 57 C'), true);
            $mol_assert_equal(pane.wire_lines()[0].geometry.endsWith(', 688 57'), true);
            $mol_assert_equal(pane.wire_dots().find(dot => dot.port.name === 'zoom')?.linked, undefined);
            const folded = pane.wire_lines()[0].geometry;
            pane.picked(['Map']);
            $mol_assert_equal(pane.wire_lines()[0].geometry, folded);
            $mol_assert_equal(pane.wire_dots().find(dot => dot.port.name === 'zoom' && dot.side === 'in')?.linked, true);
        },
        'a drag let go over nothing, or over an input of the wrong shape, writes nothing'($) {
            const { pane, node } = wired_make($);
            pane.sizes({ [`${root}/Calc`]: box(0, 0), [`${root}/Map`]: box(300, 0) });
            pane.picked(['Calc']);
            const before = node.source();
            pane.node_press(pointer(112, 7));
            pane.node_move(pointer(200, 200));
            pane.node_release(pointer(200, 200, { buttons: 0 }));
            $mol_assert_equal(node.source(), before);
            $mol_assert_equal(pane.wire_drag(), null);
            pane.node_press(pointer(112, 7));
            pane.node_release(pointer(288, 21, { buttons: 0 }));
            $mol_assert_equal(node.source(), before);
        },
        'a press on a dot is a wire even where the part would also be hit'($) {
            const { pane } = wired_make($);
            pane.camera_zoom(.5);
            pane.sizes({ [`${root}/Calc`]: box(0, 0) });
            pane.picked(['Calc']);
            pane.node_press(pointer(62, 7));
            $mol_assert_equal(pane.wire_drag() !== null, true);
            $mol_assert_equal(pane.drag(), null);
            pane.node_release(pointer(62, 7, { buttons: 0 }));
        },
        'a press on a wired input unplugs it and carries on from its source'($) {
            const { pane, node } = wired_make($);
            pane.sizes({ [`${root}/Calc`]: box(0, 0), [`${root}/Map`]: box(300, 0) });
            const before = node.source();
            node.link_add({ from: 'Calc', from_prop: 'result', to: 'Map', to_prop: 'zoom' });
            pane.picked(['Map']);
            pane.node_press(pointer(288, 7));
            $mol_assert_equal(node.source(), before);
            $mol_assert_like(pane.wire_drag(), { from: 'Calc', from_prop: 'result', kind: 'number' });
            pane.node_release(pointer(500, 500, { buttons: 0 }));
            $mol_assert_equal(node.source(), before);
            $mol_assert_equal(node.links().length, 0);
            node.link_add({ from: 'Calc', from_prop: 'result', to: 'Map', to_prop: 'zoom' });
            const wired = node.source();
            pane.node_press(pointer(288, 7));
            pane.node_release(pointer(288, 7, { buttons: 0 }));
            $mol_assert_equal(node.source(), wired);
        },
        'a drag with the shift held between two signed ports writes a two way wire'($) {
            const { pane, node } = wired_make($);
            pane.sizes({ [`${root}/Calc`]: box(0, 0), [`${root}/Map`]: box(300, 0) });
            pane.picked(['Calc']);
            const out = pane.port_point('Calc', 'op', 'out');
            pane.node_press(pointer(out[0], out[1], { shiftKey: true }));
            $mol_assert_equal(pane.wire_bidi(), true);
            pane.node_move(pointer(320, 20, { shiftKey: true }));
            const into = pane.wire_dots().find(dot => dot.port.name === 'marker');
            $mol_assert_equal(into.lit, true);
            pane.node_release(pointer(into.x, into.y, { buttons: 0, shiftKey: true }));
            $mol_assert_equal(pane.wire_bidi(), false);
            $mol_assert_equal(pane.wire_shift(), false);
            $mol_assert_equal(node.source().includes('\tcalc_op? = Calc op?\n'), true);
            $mol_assert_equal(node.source().includes('marker? <=> calc_op?\n'), true);
            $mol_assert_like(node.wires(), [{ name: 'calc_op', node: 'Calc', prop: 'op', bidi: true }]);
            $mol_assert_equal(node.links()[0].bidi, true);
            $mol_assert_equal(pane.wire_lines()[0].bidi, true);
            $mol_assert_equal(pane.Wire().label_text('Map.marker'), '⇄');
        },
        'the same drag without the shift stays one way'($) {
            const { pane, node } = wired_make($);
            pane.sizes({ [`${root}/Calc`]: box(0, 0), [`${root}/Map`]: box(300, 0) });
            pane.picked(['Calc']);
            const out = pane.port_point('Calc', 'op', 'out');
            pane.node_press(pointer(out[0], out[1]));
            $mol_assert_equal(pane.wire_bidi(), false);
            pane.node_move(pointer(320, 20));
            const into = pane.wire_dots().find(dot => dot.port.name === 'marker');
            pane.node_release(pointer(into.x, into.y, { buttons: 0 }));
            $mol_assert_equal(node.source().includes('\tcalc_op = Calc op\n'), true);
            $mol_assert_equal(node.source().includes('marker <= calc_op\n'), true);
            $mol_assert_equal(node.links()[0].bidi, false);
            $mol_assert_equal(pane.wire_lines()[0].bidi, false);
            $mol_assert_equal(pane.Wire().label_text('Map.marker'), '');
        },
        'with the shift held an input without a sign is dark and takes nothing'($) {
            const { pane, node } = wired_make($);
            pane.sizes({ [`${root}/Calc`]: box(0, 0), [`${root}/Map`]: box(300, 0) });
            pane.picked(['Map']);
            const before = node.source();
            const out = pane.port_point('Map', 'zoom', 'out');
            pane.node_press(pointer(out[0], out[1], { shiftKey: true }));
            pane.node_move(pointer(50, 20, { shiftKey: true }));
            const dark = pane.wire_dots().find(dot => dot.port.name === 'result');
            $mol_assert_equal(dark.lit, false);
            pane.node_release(pointer(dark.x, dark.y, { buttons: 0, shiftKey: true }));
            $mol_assert_equal(node.source(), before);
            $mol_assert_like(node.links(), []);
            pane.node_press(pointer(out[0], out[1]));
            pane.node_move(pointer(50, 20));
            const open = pane.wire_dots().find(dot => dot.port.name === 'result');
            $mol_assert_equal(open.lit, true);
            pane.node_release(pointer(open.x, open.y, { buttons: 0 }));
            $mol_assert_equal(node.source().includes('\tmap_zoom = Map zoom\n'), true);
            $mol_assert_equal(node.links()[0].bidi, false);
        },
        'the shift let go in the middle of a drag leaves a one way wire'($) {
            const { pane, node } = wired_make($);
            pane.sizes({ [`${root}/Calc`]: box(0, 0), [`${root}/Map`]: box(300, 0) });
            pane.picked(['Calc']);
            const out = pane.port_point('Calc', 'op', 'out');
            pane.node_press(pointer(out[0], out[1], { shiftKey: true }));
            pane.node_move(pointer(320, 20, { shiftKey: true }));
            $mol_assert_equal(pane.wire_bidi(), true);
            pane.node_move(pointer(320, 20));
            $mol_assert_equal(pane.wire_bidi(), false);
            const into = pane.wire_dots().find(dot => dot.port.name === 'marker');
            pane.node_release(pointer(into.x, into.y, { buttons: 0 }));
            $mol_assert_equal(node.links()[0].bidi, false);
        },
        'a wire is drawn from the last known box when one end is no longer reported'($) {
            const { pane, node, answer } = wired_make($);
            node.link_add({ from: 'Calc', from_prop: 'result', to: 'Map', to_prop: 'zoom' });
            answer({ kind: 'sizes', sizes: { [`${root}/Calc`]: box(0, 0) } });
            $mol_assert_equal(pane.wire_lines().length, 0);
            answer({ kind: 'sizes', sizes: { [`${root}/Map`]: box(300, 0) } });
            const drawn = pane.wire_lines();
            $mol_assert_equal(drawn.length, 1);
            answer({ kind: 'sizes', sizes: { [`${root}/Calc`]: box(0, 100) } });
            $mol_assert_equal(pane.wire_lines().length, 1);
            $mol_assert_equal(pane.wire_lines()[0].geometry.startsWith('M 112 107 C'), true);
            $mol_assert_equal(pane.wire_lines()[0].geometry.endsWith(', 288 7'), true);
            const folded = pane.wire_lines()[0].geometry;
            pane.picked(['Calc']);
            $mol_assert_equal(pane.wire_lines()[0].geometry, folded);
        },
        'values_want names the visible wires and the output ports of the visible free parts'($) {
            const { pane, node, posted } = wired_make($, [
                `Calc ${d}my_calc`, `Map ${d}my_map`, `Calc_2 ${d}my_calc`, `Map_2 ${d}my_map`,
            ]);
            node.link_add({ from: 'Calc', from_prop: 'result', to: 'Map', to_prop: 'zoom' });
            node.link_add({ from: 'Calc_2', from_prop: 'result', to: 'Map_2', to_prop: 'zoom' });
            pane.sizes({
                [`${root}/Calc`]: box(0, 0),
                [`${root}/Map`]: box(300, 0),
                [`${root}/Calc_2`]: box(5000, 5000),
                [`${root}/Map_2`]: box(5300, 5000),
            });
            const wants = () => posted.filter(m => m.kind === 'values_want').map(m => m.names);
            pane.values_push();
            $mol_assert_like(wants(), [['calc_result', 'Calc.result', 'Calc.op', 'Map.marker']]);
            pane.camera_shift(new $mol_vector_2d(10, 10));
            pane.values_push();
            $mol_assert_equal(wants().length, 1);
            pane.camera_shift(new $mol_vector_2d(-5000, -5000));
            pane.values_push();
            $mol_assert_like(wants(), [
                ['calc_result', 'Calc.result', 'Calc.op', 'Map.marker'],
                ['calc_2_result', 'Calc_2.result', 'Calc_2.op', 'Map_2.marker'],
            ]);
            $mol_assert_equal(pane.wire_lines().find(line => line.key === 'Map_2.zoom')?.label, '');
            pane.message_receive({ data: { ns: $bog_vmap_bridge_ns, kind: 'values', values: { calc_2_result: '42' } }, source: pane.scene_peer() });
            $mol_assert_equal(pane.wire_lines().find(line => line.key === 'Map_2.zoom')?.label, '42');
            const stamped = pane.poke_at;
            pane.camera_shift(new $mol_vector_2d(-5000, -4000));
            pane.values_push();
            $mol_assert_equal(pane.poke_at, stamped);
        },
        'no value is drawn under a part until the scene answers with sizes'($) {
            const { pane, answer } = wired_make($);
            const sizes = { [`${root}/Calc`]: box(0, 0), [`${root}/Map`]: box(300, 0) };
            pane.sizes(sizes);
            pane.values({ 'Calc.result': '42' });
            $mol_assert_equal(pane.warmed(), false);
            $mol_assert_equal(pane.value_labels().length, 0);
            answer({ kind: 'sizes', sizes });
            $mol_assert_equal(pane.warmed(), true);
            $mol_assert_equal(pane.value_labels().length, 1);
            $mol_assert_equal(pane.value_labels()[0], pane.Label('Calc'));
            $mol_assert_like(pane.Label('Calc').lines(), ['result: 42']);
            $mol_assert_like(pane.label_style('Calc'), { left: '0px', top: '50px' });
        },
        'an output port is one the part declares itself and no wire feeds'($) {
            const { pane, node, answer } = wired_make($);
            const sizes = { [`${root}/Calc`]: box(0, 0), [`${root}/Map`]: box(300, 0) };
            answer({ kind: 'sizes', sizes });
            $mol_assert_like(pane.part_ports('Calc').map(port => port.name), ['result', 'op', 'title']);
            $mol_assert_like(pane.part_outs('Calc').map(port => port.name), ['result', 'op']);
            $mol_assert_like(pane.parts_visible(), ['Calc', 'Map']);
            $mol_assert_like(pane.ports_visible(), ['Calc.result', 'Calc.op', 'Map.zoom', 'Map.marker']);
            node.link_add({ from: 'Calc', from_prop: 'result', to: 'Map', to_prop: 'zoom' });
            $mol_assert_like(pane.part_outs('Map').map(port => port.name), ['marker']);
            $mol_assert_like(pane.ports_visible(), ['Calc.result', 'Calc.op', 'Map.marker']);
        },
        'a port answered with an empty text gets no line, and a part with no line no label'($) {
            const { pane, answer } = wired_make($);
            answer({ kind: 'sizes', sizes: { [`${root}/Calc`]: box(0, 0), [`${root}/Map`]: box(300, 0) } });
            $mol_assert_equal(pane.value_labels().length, 0);
            pane.values({ 'Calc.result': '', 'Calc.title': 'наследство', 'Map.marker': 'дом' });
            $mol_assert_like(pane.label_lines('Calc'), []);
            $mol_assert_like(pane.label_lines('Map'), ['marker: дом']);
            $mol_assert_equal(pane.value_labels().length, 1);
            $mol_assert_equal(pane.value_labels()[0], pane.Label('Map'));
        },
        'a table value becomes a row of cells, a plain one a single line'($) {
            const { pane, answer } = wired_make($);
            answer({ kind: 'sizes', sizes: { [`${root}/Calc`]: box(0, 0) } });
            pane.values({ 'Calc.result': 'city\tsum\nМосква\t7' });
            const label = pane.Label('Calc');
            $mol_assert_like(label.lines(), ['result', 'city\tsum', 'Москва\t7']);
            $mol_assert_equal(label.rows().length, 3);
            $mol_assert_equal(label.row_cells('0').length, 1);
            $mol_assert_equal(label.row_cells('2').length, 2);
            $mol_assert_equal(label.row_cells('2')[1], label.Cell('2/1'));
            $mol_assert_equal(label.cell_text('0/0'), 'result');
            $mol_assert_equal(label.cell_text('1/1'), 'sum');
            $mol_assert_equal(label.cell_text('2/0'), 'Москва');
            $mol_assert_equal(label.cell_text('2/1'), '7');
        },
        'a part carried off the screen stops being asked and stops being labelled'($) {
            const { pane, answer } = wired_make($);
            answer({ kind: 'sizes', sizes: { [`${root}/Calc`]: box(0, 0) } });
            pane.values({ 'Calc.result': '42' });
            $mol_assert_like(pane.ports_visible(), ['Calc.result', 'Calc.op']);
            $mol_assert_equal(pane.value_labels().length, 1);
            pane.camera_shift(new $mol_vector_2d(-2000, 0));
            $mol_assert_like(pane.ports_visible(), []);
            $mol_assert_equal(pane.value_labels().length, 0);
        },
        'the pick goes to the deepest node under the point'($) {
            const { pane } = pane_make($);
            pane.sizes({
                [`${root}/Board`]: box(0, 0, 400, 300),
                [`${root}/Board/Head`]: box(0, 0, 400, 100),
                [`${root}/Loose`]: box(600, 0, 100, 50),
            });
            $mol_assert_equal(pane.node_at([200, 50]), 'Head');
            $mol_assert_equal(pane.node_at([200, 200]), 'Board');
            $mol_assert_equal(pane.node_at([650, 25]), 'Loose');
            $mol_assert_equal(pane.node_at([900, 400]), null);
            $mol_assert_like(pane.part_size('Head'), box(0, 0, 400, 100));
            $mol_assert_like(pane.node_path('Head'), ['Board']);
            $mol_assert_like(pane.node_path('Loose'), []);
        },
        'a pan and a zoom do not move the slot a drop lands in'($) {
            const { pane } = pane_make($, {}, { containers: () => ['Board'] });
            pane.sizes({
                [`${root}/Board`]: box(0, 0, 400, 300),
                [`${root}/Board/Head`]: box(0, 0, 400, 100),
                [`${root}/Board/Foot`]: box(0, 100, 400, 100),
            });
            const world = [200, 120];
            const flat = pane.insert_slot(world);
            $mol_assert_equal(flat.owner, 'Board');
            $mol_assert_equal(flat.index, 1);
            pane.camera_shift(new $mol_vector_2d(100, 50));
            pane.camera_zoom(2);
            const point = pane.world_point(pointer(200 * 2 + 100, 120 * 2 + 50));
            $mol_assert_like([...point], [...world]);
            $mol_assert_like(pane.insert_slot(point), flat);
        },
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
            pane.sizes({
                [`${root}/Board`]: box(0, 0, 400, 300),
                [`${root}/Board/Head`]: box(0, 0, 400, 100),
                [`${root}/Loose`]: box(600, 0, 100, 50),
            });
            pane.spots({ Loose: { x: 600, y: 0 } });
            pane.node_press(pointer(650, 25));
            pane.node_move(pointer(200, 120));
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
            pane.sizes({
                [`${root}/Board`]: box(0, 0, 400, 300),
                [`${root}/Loose`]: box(600, 0, 100, 50),
            });
            pane.spots({ Loose: { x: 600, y: 0 } });
            pane.node_press(pointer(650, 25));
            pane.node_move(pointer(750, 125));
            pane.node_release(pointer(750, 125, { buttons: 0 }));
            $mol_assert_like(pane.spots(), { Loose: { x: 700, y: 100 } });
            $mol_assert_like(moves, []);
            $mol_assert_equal(pane.slot(), null);
        },
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
            pane.sizes({
                [`${root}/Board`]: box(0, 0, 400, 300),
                [`${root}/Board/Head`]: box(0, 0, 400, 100),
                [`${root}/Board/Foot`]: box(0, 100, 400, 100),
            });
            pane.node_press(pointer(200, 50));
            pane.node_move(pointer(200, 180));
            pane.node_release(pointer(200, 180, { buttons: 0 }));
            $mol_assert_like(pane.spots(), {});
            $mol_assert_like(moves, [{ name: 'Head', owner: 'Board', index: 2 }]);
        },
        'a container inside a container takes the drop itself'($) {
            const { pane } = pane_make($, {}, {
                containers: () => ['Page', 'Bar'],
                axis: (name) => name === 'Bar' ? 'row' : 'column',
            });
            pane.sizes({
                [`${root}/Page`]: box(0, 0, 400, 600),
                [`${root}/Page/Head`]: box(0, 0, 400, 100),
                [`${root}/Page/Bar`]: box(0, 100, 400, 100),
                [`${root}/Page/Bar/Left`]: box(0, 100, 200, 100),
                [`${root}/Page/Bar/Right`]: box(200, 100, 200, 100),
                [`${root}/Page/Foot`]: box(0, 200, 400, 100),
            });
            const inner = pane.insert_slot([250, 150]);
            $mol_assert_equal(inner.owner, 'Bar');
            $mol_assert_equal(inner.index, 1);
            $mol_assert_like(inner.line, { x: 200, y: 100, width: 0, height: 100 });
            const outer = pane.insert_slot([250, 400]);
            $mol_assert_equal(outer.owner, 'Page');
            $mol_assert_equal(outer.index, 3);
            $mol_assert_equal(pane.node_at([250, 150]), 'Right');
        },
        'an artboard carried over itself offers no slot'($) {
            const { pane } = pane_make($, {}, { containers: () => ['Board', 'Inner'] });
            pane.sizes({
                [`${root}/Board`]: box(0, 0, 400, 300),
                [`${root}/Board/Inner`]: box(0, 0, 400, 100),
            });
            $mol_assert_equal(pane.insert_slot([200, 50], 'Board'), null);
            $mol_assert_equal(pane.insert_slot([200, 50], 'Inner')?.owner, 'Board');
        },
    });
    const ports = {
        [`${d}my_calc`]: [
            { name: 'result', next: false, own: true, kind: 'number' },
            { name: 'op', next: true, own: true, kind: 'string' },
            { name: 'title', next: false, own: false, kind: 'string' },
        ],
        [`${d}my_map`]: [
            { name: 'zoom', next: true, own: true, kind: 'number' },
            { name: 'marker', next: true, own: true, kind: 'string' },
        ],
    };
    function wired_make($, parts = [`Calc ${d}my_calc`, `Map ${d}my_map`]) {
        const node = $bog_vmap_lang_node.make({ $ });
        node.source([`${root} ${d}mol_view`, ...parts.map(part => '\t' + part), '\tsub /', ''].join('\n'));
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
(function ($_2) {
    const d = '$';
    const root = `${d}bog_vmap_app_page`;
    const pane_make = ($) => {
        const peer = { origin: 'null', postMessage() { } };
        const pane = $$.$bog_vmap_app_pane.make({
            $,
            doc_root: () => root,
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
        'the mark of a failure reaches the screen'($) {
            const { pane, answer } = pane_make($);
            answer({
                kind: 'sizes',
                sizes: { [`${root}/Calc`]: { x: 10, y: 20, width: 100, height: 50 } },
            });
            answer({ kind: 'error', at: 'runtime', message: 'boom', node: 'Calc' });
            pane.dom_tree();
            const node = pane.Mark('Calc').dom_tree();
            $mol_assert_equal(node.getAttribute('title'), 'исполнение — Calc: boom');
            $mol_assert_equal(pane.dom_node().contains(node), true);
        },
        'a node that stops being drawn keeps its mark where it was'($) {
            const { pane, answer } = pane_make($);
            answer({
                kind: 'sizes',
                sizes: { [`${root}/Calc`]: { x: 10, y: 20, width: 100, height: 50 } },
            });
            answer({ kind: 'sizes', sizes: {} });
            answer({ kind: 'error', at: 'runtime', message: 'boom', node: 'Calc' });
            $mol_assert_equal(pane.error_marks().length, 1);
            $mol_assert_equal(pane.mark_style('Calc').left, '10px');
            $mol_assert_equal(pane.mark_style('Calc').top, '20px');
        },
        'a node never drawn gets no mark, and is still told about'($) {
            const { pane, answer } = pane_make($);
            answer({ kind: 'error', at: 'compile', message: 'boom', node: 'Calc' });
            $mol_assert_equal(pane.error_marks().length, 0);
            $mol_assert_equal(pane.node_error('Calc'), 'компиляция — Calc: boom');
        },
        'the code panel shows the failure of the node it is editing'($) {
            const app = $bog_vmap_app.make({ $ });
            app.part_drop(`${d}mol_button_minor`, 100, 200);
            const name = app.selected();
            const pane = app.Pane();
            pane.error_at('runtime', 'исполнение: boom');
            pane.error_node('runtime', name);
            $mol_assert_equal(app.code_error(), 'исполнение: boom');
            app.selected(null);
            $mol_assert_equal(app.code_error(), '');
        },
        'a file dropped on the canvas is handed on with the point it landed at'($) {
            const { pane } = pane_make($);
            const dropped = [];
            pane.files_drop = next => {
                if (next)
                    dropped.push(next);
                return next ?? null;
            };
            const file = new $mol_blob([new Uint8Array([137])], { type: 'image/png' });
            let prevented = 0;
            pane.file_take({
                clientX: 200,
                clientY: 150,
                preventDefault: () => { prevented++; },
                dataTransfer: { files: [file] },
            });
            $mol_assert_equal(prevented, 1);
            $mol_assert_equal(dropped.length, 1);
            $mol_assert_equal(dropped[0].files[0], file);
            $mol_assert_like([dropped[0].x, dropped[0].y], [200, 150]);
        },
        'a drag that carries no file hands nothing on'($) {
            const { pane } = pane_make($);
            const dropped = [];
            pane.files_drop = next => {
                if (next)
                    dropped.push(next);
                return next ?? null;
            };
            pane.file_take({
                clientX: 200,
                clientY: 150,
                preventDefault: () => { },
                dataTransfer: { files: [] },
            });
            $mol_assert_equal(dropped.length, 0);
        },
        'a drag over the canvas is claimed, or the browser opens the file itself'($) {
            const { pane } = pane_make($);
            let prevented = 0;
            pane.file_over({ preventDefault: () => { prevented++; } });
            $mol_assert_equal(prevented, 1);
        },
        async 'a file whose write suspends still becomes a node, though the drag empties itself'($) {
            const uri = 'https://baza.test/?BAZA:file=TQzejQsT_m3PFV7J3;name=logo.png';
            let waited = 0;
            const store = $bog_vmap_app_store.make({
                $,
                doc_land_config: () => null,
                asset_put: () => {
                    if (waited++ === 0)
                        $mol_fail_hidden(Promise.resolve());
                    return uri;
                },
            });
            store.doc_add('Сцена 1');
            const stage = $bog_vmap_app_flow_stage($, { store });
            const dom = $.$mol_dom_context;
            const carried = [new dom.File([new Uint8Array([137, 80, 78, 71])], 'logo.png', { type: 'image/png' })];
            let taken = 0;
            const point = stage.client([300, 200]);
            const drop = new dom.Event('drop', { bubbles: true, cancelable: true });
            Object.defineProperty(drop, 'clientX', { value: point[0] });
            Object.defineProperty(drop, 'clientY', { value: point[1] });
            Object.defineProperty(drop, 'dataTransfer', {
                value: { get files() { return taken++ ? [] : carried; } },
            });
            stage.overlay().dispatchEvent(drop);
            await $bog_vmap_app_flow_settle(() => waited > 1);
            stage.redraw();
            $mol_assert_equal(waited, 2);
            $mol_assert_equal(taken, 1);
            $mol_assert_equal(stage.app.selected(), 'Image');
            $mol_assert_ok(stage.app.doc_source().includes(`uri \\${uri}`));
            $mol_assert_like(stage.app.spots(), { Image: { x: 300, y: 200 } });
        },
    });
})($ || ($ = {}));
(function ($_3) {
    const d = '$';
    const root = `${d}bog_vmap_app_board`;
    const pane_make = ($, width, height) => {
        const peer = { origin: 'null', postMessage() { } };
        const pane = $$.$bog_vmap_app_pane.make({
            $,
            doc_root: () => root,
            doc_names: () => ['Near', 'Far'],
            pane_rect: () => ({ left: 0, top: 0, width, height }),
            scene_peer: () => peer,
        });
        const screen = (box) => {
            const zoom = pane.camera_zoom();
            const shift = pane.camera_shift();
            return {
                left: box.x * zoom + shift[0],
                top: box.y * zoom + shift[1],
                right: (box.x + box.width) * zoom + shift[0],
                bottom: (box.y + box.height) * zoom + shift[1],
            };
        };
        const inside = (box) => {
            const seen = screen(box);
            return seen.left >= 0 && seen.top >= 0 && seen.right <= width && seen.bottom <= height;
        };
        return { pane, screen, inside };
    };
    $mol_test({
        'a board wider than the pane is fitted whole and centred'($) {
            const { pane, screen, inside } = pane_make($, 600, 500);
            const board = { x: -340, y: 250, width: 1280, height: 720 };
            $mol_assert_ok(Boolean(pane.camera_fit([board])));
            $mol_assert_equal(pane.camera_zoom(), (600 - 48) / 1280);
            $mol_assert_equal(inside(board), true);
            const seen = screen(board);
            $mol_assert_equal(Math.round((seen.left + seen.right) / 2), 300);
            $mol_assert_equal(Math.round((seen.top + seen.bottom) / 2), 250);
        },
        'fitting a small box never zooms past life size'($) {
            const { pane, inside } = pane_make($, 600, 500);
            const box = { x: 0, y: 0, width: 40, height: 20 };
            pane.camera_fit([box]);
            $mol_assert_equal(pane.camera_zoom(), 1);
            $mol_assert_equal(inside(box), true);
        },
        'reset view brings every free node into the frame'($) {
            const { pane, inside } = pane_make($, 600, 500);
            const near = { x: -600, y: -400, width: 200, height: 100 };
            const far = { x: 1800, y: 900, width: 200, height: 100 };
            pane.sizes({ [`${root}/Near`]: near, [`${root}/Far`]: far });
            pane.camera_shift(new $mol_vector_2d(700, 700));
            pane.camera_zoom(4);
            pane.camera_reset();
            $mol_assert_equal(inside(near), true);
            $mol_assert_equal(inside(far), true);
        },
        'reset view on an empty document goes back to the origin'($) {
            const { pane } = pane_make($, 600, 500);
            pane.camera_shift(new $mol_vector_2d(700, 700));
            pane.camera_zoom(4);
            pane.camera_reset();
            $mol_assert_equal(pane.camera_zoom(), 1);
            $mol_assert_like([...pane.camera_shift()], [0, 0]);
        },
        'a node laid out inside a board does not stretch the reset'($) {
            const { pane, inside } = pane_make($, 600, 500);
            const board = { x: 500, y: 400, width: 400, height: 300 };
            pane.sizes({
                [`${root}/Near`]: board,
                [`${root}/Near/Far`]: { x: 520, y: 420, width: 100, height: 50 },
            });
            pane.camera_reset();
            $mol_assert_equal(pane.camera_zoom(), 1);
            $mol_assert_equal(inside(board), true);
        },
    });
})($ || ($ = {}));
(function ($_4) {
    const d = '$';
    const root = `${d}bog_vmap_app_hover`;
    const ports = [
        { name: 'result', next: false, own: true, kind: 'number' },
        { name: 'op', next: true, own: true, kind: 'string' },
        { name: 'title', next: false, own: false, kind: 'string' },
    ];
    const pane_make = ($) => {
        const peer = { origin: 'null', postMessage() { } };
        const pane = $$.$bog_vmap_app_pane.make({
            $,
            doc_root: () => root,
            doc_names: () => ['Calc', 'Map'],
            pane_rect: () => ({ left: 0, top: 0, width: 1000, height: 800 }),
            scene_peer: () => peer,
            part_ports: () => ports,
            wires: () => [],
        });
        pane.sizes({
            [`${root}/Calc`]: { x: 0, y: 0, width: 100, height: 50 },
            [`${root}/Map`]: { x: 300, y: 0, width: 100, height: 50 },
        });
        return pane;
    };
    const pointer = (clientX, clientY) => ({
        button: 0,
        buttons: 0,
        pointerId: 1,
        clientX,
        clientY,
        altKey: false,
        ctrlKey: false,
        metaKey: false,
        shiftKey: false,
        preventDefault() { },
    });
    const dots_of = (pane, node) => {
        return pane.wire_dots().filter(dot => dot.node === node);
    };
    $mol_test({
        'the ports of the node under the pointer come out named'($) {
            const pane = pane_make($);
            $mol_assert_equal(dots_of(pane, 'Map').length, 0);
            pane.node_move(pointer(350, 25));
            $mol_assert_equal(pane.hovered(), 'Map');
            const dots = dots_of(pane, 'Map');
            $mol_assert_equal(dots.length, 4);
            $mol_assert_equal(dots.every(dot => Boolean(dot.port.name)), true);
            $mol_assert_like([...new Set(dots.map(dot => dot.port.name))].sort(), ['op', 'result']);
        },
        'the pointer off the parts leaves the named ports to the picked one'($) {
            const pane = pane_make($);
            pane.picked(['Calc']);
            pane.node_move(pointer(350, 25));
            $mol_assert_equal(dots_of(pane, 'Calc').length, 4);
            $mol_assert_equal(dots_of(pane, 'Map').length, 4);
            pane.node_move(pointer(700, 400));
            $mol_assert_equal(pane.hovered(), null);
            $mol_assert_equal(dots_of(pane, 'Calc').length, 4);
            $mol_assert_equal(dots_of(pane, 'Map').length, 0);
        },
        'the pointer gone off the canvas takes the hover with it'($) {
            const pane = pane_make($);
            pane.node_move(pointer(350, 25));
            $mol_assert_equal(pane.hovered(), 'Map');
            pane.node_away();
            $mol_assert_equal(pane.hovered(), null);
            $mol_assert_equal(dots_of(pane, 'Map').length, 0);
        },
        'the picked node stays named while the pointer hovers another'($) {
            const pane = pane_make($);
            pane.picked(['Calc']);
            pane.node_move(pointer(350, 25));
            const picked = dots_of(pane, 'Calc');
            $mol_assert_equal(picked.length, 4);
            $mol_assert_like([...new Set(picked.map(dot => dot.port.name))].sort(), ['op', 'result']);
        },
        'a drag in progress keeps the hover out of the dots'($) {
            const pane = pane_make($);
            pane.picked(['Calc']);
            pane.wire_drag({ from: 'Calc', from_prop: 'result', kind: 'number' });
            pane.node_move(pointer(350, 25));
            $mol_assert_equal(pane.hovered(), null);
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
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
        'a pack without a slash is kept as typed and grows one in the derived address'($) {
            const links = $bog_vmap_lib_links_parse('https://b-on-g.github.io/gram');
            $mol_assert_equal(links.pack, 'https://b-on-g.github.io/gram');
            $mol_assert_equal($bog_vmap_lib_slashed(links.pack), 'https://b-on-g.github.io/gram/');
            $mol_assert_equal($bog_vmap_lib_slashed('https://b-on-g.github.io/gram/'), 'https://b-on-g.github.io/gram/');
        },
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
            $mol_assert_equal($bog_vmap_lib_links_is_land(land_a + '_HeAdHeAd'), true);
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
    const d = '$';
    function shelf($) {
        const land = $giper_baza_land.make({ $ });
        return land.Data($bog_vmap_lib_land_shelf);
    }
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
            $mol_assert_like(lib.class_list(), [`${d}mol_view`]);
        },
        'components of a shelf come back in the order they were added'($) {
            const one = shelf($);
            part(one, card_src);
            part(one, badge_src);
            const lib = $bog_vmap_lib_land.make({ $, shelf: () => one });
            $mol_assert_like(lib.parts().map(p => p.tree()), [card_src, badge_src]);
        },
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
        'a component inherits another component of the same library'($) {
            const one = shelf($);
            part(one, card_src);
            part(one, badge_src);
            const lib = $bog_vmap_lib_land.make({ $, shelf: () => one });
            $mol_assert_like(lib.inherit_chain(`${d}my_badge`), [`${d}my_badge`, `${d}my_card`, `${d}mol_view`, `${d}mol_object`]);
            const ports = [...lib.props_map(`${d}my_badge`).keys()];
            $mol_assert_ok(ports.includes('caption'));
            $mol_assert_ok(ports.includes('price'));
            $mol_assert_ok(ports.includes('sub'));
        },
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
            $mol_assert_like(stack.inherit_chain(`${d}my_hero`), [`${d}my_hero`, `${d}my_tile`, `${d}my_base`, `${d}mol_view`, `${d}mol_object`]);
            const ports = [...stack.props_map(`${d}my_hero`).keys()];
            $mol_assert_ok(ports.includes('pack_port'));
            $mol_assert_ok(ports.includes('caption'));
            $mol_assert_ok(ports.includes('sub'));
            $mol_assert_equal(stack.props_map(`${d}my_hero`).get('caption').kids[0].value, 'Герой');
            $mol_assert_like(stack.land_trees().map(tree => tree.type), [`${d}my_tile`, `${d}my_hero`]);
        },
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
            card.Css(null).val('[my_badge] { color: red }');
            $mol_assert_like(stack.parts(), [{ tree: badge_src, js: '', css: '[my_badge] { color: red }' }]);
            $mol_assert_like(stack.land_trees().map(tree => tree.type), [`${d}my_badge`]);
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
            $mol_assert_like(palette.class_list(), []);
            const note = palette.total();
            $mol_assert_ok(note.includes('Not Found'));
            $mol_assert_ok(note.includes('http://dead.test/web.view.tree'));
        },
        'classes of the lands join the list'($) {
            const d = '$';
            const palette = $bog_vmap_app_palette.make({
                $,
                land_classes: () => $.$mol_tree2_from_string(`${d}my_card ${d}mol_view\n\tprice 0\n`).kids,
            });
            $mol_assert_like(palette.Lib().class_list(), [`${d}mol_view`, `${d}my_card`]);
            $mol_assert_ok([...palette.Lib().props_map(`${d}my_card`).keys()].includes('sub'));
        },
        'the list of classes is a field whose bid counts what is shown'($) {
            const palette = $bog_vmap_app_palette.make({ $, compact: () => true });
            const dom = palette.dom_tree();
            const classes = dom.querySelector('[bog_vmap_app_palette_classes]');
            $mol_assert_ok(classes.matches('[mol_form_field]'));
            $mol_assert_ok(classes.textContent.includes('Классы пака'));
            $mol_assert_ok(classes.querySelector('[mol_form_field_bid]').textContent.includes('классов'));
            $mol_assert_ok(classes.querySelector('[bog_vmap_app_palette_class_row]'));
            $mol_assert_equal(dom.querySelector('[bog_vmap_app_palette_ports]'), null);
        },
        'every port is a field with its name, its declaration and the class it came from'($) {
            const d = '$';
            const palette = $bog_vmap_app_palette.make({
                $,
                land_classes: () => $.$mol_tree2_from_string(`${d}my_card ${d}mol_view\n\tprice 0\n`).kids,
                selected: () => `${d}my_card`,
            });
            const dom = palette.dom_tree();
            const ports = [...dom.querySelectorAll('[bog_vmap_app_palette_port]')];
            $mol_assert_ok(ports.length > 1);
            for (const port of ports)
                $mol_assert_ok(port.matches('[mol_form_field]'));
            const bid = (el) => el.querySelector('[mol_form_field_bid]').textContent;
            const own = ports.find(el => el.textContent.includes('price'));
            $mol_assert_ok(own);
            $mol_assert_equal(bid(own), '');
            $mol_assert_ok(own.textContent.includes('0'));
            const sub = ports.find(el => el.textContent.includes('sub'));
            $mol_assert_ok(sub);
            $mol_assert_ok(bid(sub).includes(`${d}mol_view`));
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    const d = '$';
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
            $mol_assert_equal(view.doc_title(), '');
            $mol_assert_equal(view.add_title(), 'Сцена 1');
        },
        'the list carries every document by title, the last one open'($) {
            const { store, view } = scenes($);
            const first = store.doc_add('First', src_page);
            const second = store.doc_add('Second', src_hero);
            $mol_assert_like(view.scene_links(), [first.link().str, second.link().str]);
            $mol_assert_like(view.scene_links().map(link => view.scene_title(link)), ['First', 'Second']);
            $mol_assert_like(view.scene_links().map(link => view.scene_current(link)), [false, true]);
            $mol_assert_equal(view.current(), second.link().str);
            $mol_assert_equal(view.current_exists(), true);
            $mol_assert_equal(view.doc_title(), 'Second');
            $mol_assert_equal(view.add_title(), 'Сцена 3');
        },
        'picking a document changes what the store reads'($) {
            const { store, view } = scenes($);
            const first = store.doc_add('First', src_page);
            store.doc_add('Second', src_hero);
            view.current(first.link().str);
            $mol_assert_equal(store.source(), src_page);
            $mol_assert_equal(view.doc_title(), 'First');
            view.current('');
            $mol_assert_equal(store.source(), src_hero);
            view.current(first.link().str);
            view.current('not a link');
            $mol_assert_equal(store.source(), src_hero);
        },
        'renaming writes the title of the open document and shows in the list'($) {
            const { store, view } = scenes($);
            const first = store.doc_add('First', src_page);
            const second = store.doc_add('Second', src_hero);
            view.doc_title('Landing');
            $mol_assert_equal(second.title(), 'Landing');
            $mol_assert_equal(first.title(), 'First');
            $mol_assert_equal(view.scene_title(second.link().str), 'Landing');
        },
        'the list of documents is a page with the name field and the add button in its tools'($) {
            const { store, view } = scenes($);
            store.doc_add('First', src_page);
            const dom = view.dom_tree();
            $mol_assert_ok(dom.querySelector('[mol_page_head]'));
            $mol_assert_equal(view.title(), 'Сцены');
            const tools = dom.querySelector('[mol_page_tools]');
            $mol_assert_ok(tools.contains(view.Name().dom_node()));
            $mol_assert_ok(tools.contains(view.Add().dom_node()));
            $mol_assert_ok(dom.querySelector('[mol_page_body]').contains(view.List().dom_node()));
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
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
    function click($, node) {
        const event = $.$mol_dom_context.document.createEvent('mouseevent');
        event.initEvent('click', true, true);
        node.dispatchEvent(event);
    }
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
    const root_class = `${d}my_site_page`;
    const doc_card = doc_nested.replace(`${d}bog_vmap_app_page`, root_class);
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
        async 'the rule of a part is re-addressed to the class it goes out as'($) {
            const s = store($);
            await $mol_wire_async(s).publish('Button_minor', src_button, '', css_button, [root_class]);
            $mol_assert_equal(s.shelf().parts()[0].css(), css_button_out);
        },
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
        'sub-views of the copy are the declarations the published tree carries'($) {
            const s = store($);
            $mol_assert_like(s.sub_names(s.inlined(src_card, doc_card).source), ['Hero', 'Price']);
            $mol_assert_like(s.sub_names(src_card), []);
        },
        'a part of the pack takes no rule of the document with it'($) {
            const s = store($);
            const source = `Calc ${d}bog_vmap_part_calc\n`;
            $mol_assert_like(s.sub_names(source), []);
            $mol_assert_equal(s.css_out(css_doc, 'Calc', source, root_class), '');
        },
        'the move matches the whole attribute, not the beginning of it'($) {
            const s = store($);
            const css = '[my_site_page_card] {\n\tcolor: red;\n}\n\n[my_site_page_card_note] {\n\tcolor: blue;\n}';
            $mol_assert_equal(s.css_moved(css, 'my_site_page_card', 'bog_vmap_pub_card'), '[bog_vmap_pub_card] {\n\tcolor: red;\n}\n\n[my_site_page_card_note] {\n\tcolor: blue;\n}');
            $mol_assert_equal(s.css_out(css, 'Card', `Card ${d}mol_view\n`, root_class), '[bog_vmap_pub_card] {\n\tcolor: red;\n}');
        },
        'a rule written with a capital in the name is re-addressed too'($) {
            const s = store($);
            $mol_assert_equal(s.css_moved('[my_site_page_Card] {\n\tcolor: red;\n}', 'my_site_page_card', 'bog_vmap_pub_card'), '[bog_vmap_pub_card] {\n\tcolor: red;\n}');
            $mol_assert_equal(s.css_out('[my_site_page_Card] {\n\tcolor: red;\n}\n\n[my_site_page_Hero] {\n\tcolor: blue;\n}', 'Card', s.inlined(src_card, doc_card).source, root_class), '[bog_vmap_pub_card] {\n\tcolor: red;\n}\n\n[bog_vmap_pub_card_hero] {\n\tcolor: blue;\n}');
        },
        'a part of the pack goes out as an heir, with nothing copied'($) {
            const s = store($);
            const source = `Calc ${d}bog_vmap_part_calc\n`;
            $mol_assert_equal(s.class_source('Calc', source), `${klass_calc} ${d}bog_vmap_part_calc\n`);
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
            $mol_assert_like($bog_vmap_lib_links_parse(`https://mol.hyoo.ru, ${link}`).lands, [link]);
        },
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
            $mol_assert_equal(s.class_source('Button_minor', src_button), `${klass_button} ${d}mol_view\n\ttitle \\Hi\n\tminimal true\n`);
        },
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
        'a reference to a name the part only overrides is still a wire to the document'($) {
            const s = store($);
            const free = `Label ${d}mol_view\n\tsub / <= title\n\ttitle \\Hi\n`;
            $mol_assert_like(s.bound_names(free), ['title']);
            $mol_assert_ok(s.refusal('Label', free).includes('title'));
        },
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
            $mol_assert_like(s.bound_names(src_card), ['Hero']);
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
        async 'a sub-view the document reads too goes out as a copy and the note names it'($) {
            const s = store($);
            const doc = doc_nested.replace('sub / <= Card', 'sub /\n\t\t<= Card\n\t\t<= Hero');
            const { shared } = s.inlined(src_card, doc);
            $mol_assert_like(shared, ['Hero']);
            const wired = doc_nested.replace('sub / <= Card', 'hero_sub = Hero sub\n\tsub / <= Card');
            $mol_assert_like(s.inlined(src_card, wired).shared, ['Hero']);
            const v = view($, s, 'Card', src_card, [], doc);
            await $mol_wire_async(v).publish();
            $mol_assert_equal(v.published(), klass_card);
            $mol_assert_like(v.shared(), ['Hero']);
            $mol_assert_equal(v.note(), `опубликовано ${klass_card}, под-виды Hero ушли копией, документ читает их и сам:`);
            $mol_assert_equal(s.shelf().parts().length, 1);
            const plain = view($, s, 'Card', src_card, [], doc_nested);
            await $mol_wire_async(plain).publish();
            $mol_assert_equal(plain.note(), `опубликовано ${klass_card}:`);
        },
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
        async 'a click on the rendered button puts the refusal on the screen'($) {
            const s = store($);
            const v = view($, s, 'Label', `Label ${d}mol_view\n\tsub / <= calc_result\n`);
            const root = v.dom_tree();
            $mol_assert_equal(root.textContent.includes('calc_result'), false);
            click($, v.Publish().dom_tree());
            v.dom_tree();
            $mol_assert_ok(root.textContent.includes('деталь Label ссылается на calc_result документа, отвяжите провод перед публикацией'));
            $mol_assert_equal(s.shelf(), null);
            await Promise.resolve();
            $mol_assert_equal(v.Publish().error(), '');
        },
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
    const d = '$';
    const root_src = `${d}bog_vmap_app_shelf_test_page ${d}mol_view\n\tsub /\n`;
    function doc($, src = root_src) {
        const node = $bog_vmap_lang_node.make({ $ });
        node.source(src);
        return node;
    }
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
            $mol_assert_equal(shelf.links(), 'https://mol.hyoo.ru, https://b-on-g.github.io/gram/');
            $mol_assert_equal(shelf.rejected_note(), 'https://b-on-g.github.io/gram/: ' + $bog_vmap_lib_links_reason.pack_second);
            shelf.links('https://mol.hyoo.ru');
            $mol_assert_equal(shelf.rejected_note(), '');
        },
        'the objects of the application are its own classes, mol left out'($) {
            const d = '$';
            const shelf = $bog_vmap_app_shelf.make({
                $,
                class_list: () => [`${d}mol_view`, `${d}mol_button_minor`, `${d}bog_gram`, `${d}bog_gram_chat`],
            });
            $mol_assert_like(shelf.app_list(), [`${d}bog_gram`, `${d}bog_gram_chat`]);
            $mol_assert_equal(shelf.apps_title(), 'Объекты приложения');
            $mol_assert_equal(shelf.item_title(`${d}bog_gram_chat`), 'Gram_chat');
            $mol_assert_ok(shelf.item(`${d}bog_gram_chat`).source.includes(`${d}bog_gram_chat`));
        },
        'a dead address takes down its own list and says why'($) {
            const shelf = $bog_vmap_app_shelf.make({
                $,
                pack_link: () => 'http://dead.test/',
                class_list: () => $mol_fail(new Error('Not Found')),
            });
            $mol_assert_like(shelf.app_list(), []);
            $mol_assert_equal(shelf.apps_title(), 'Приложение не отвечает');
            $mol_assert_ok(shelf.app_error().includes('Not Found'));
            $mol_assert_ok(shelf.app_error().includes('http://dead.test/web.view.tree'));
            const dom = shelf.dom_tree();
            const apps = dom.querySelector('[bog_vmap_app_shelf_apps]');
            $mol_assert_ok(apps.querySelector('[mol_form_field_bid]').textContent.includes('Not Found'));
            $mol_assert_equal(apps.querySelector('[bog_vmap_app_shelf_item_row]'), null);
            $mol_assert_ok(shelf.items().length > 4);
            $mol_assert_ok(shelf.body().includes(shelf.Parts()));
        },
        'nothing connected is a state and not a failure'($) {
            const shelf = $bog_vmap_app_shelf.make({ $ });
            $mol_assert_like(shelf.app_list(), []);
            $mol_assert_equal(shelf.apps_title(), 'Приложение не подключено');
            $mol_assert_ok(shelf.items().length > 4);
        },
        'the shelf is a page: heading and filter pinned, groups scroll in its body'($) {
            const shelf = $bog_vmap_app_shelf.make({ $ });
            const body = shelf.body();
            $mol_assert_equal(body.length, 3);
            $mol_assert_equal(body[0] === shelf.Source(), true);
            $mol_assert_equal(body[1] === shelf.Parts(), true);
            $mol_assert_equal(body[2] === shelf.Apps(), true);
            $mol_assert_equal(body.filter(view => view instanceof $mol_scroll).length, 0);
            const dom = shelf.dom_tree();
            const head = dom.querySelector('[mol_page_head]');
            $mol_assert_ok(head.textContent.includes('Полка'));
            $mol_assert_ok(head.querySelector('[bog_vmap_app_shelf_filter]'));
            $mol_assert_ok(head.querySelector('[bog_vmap_app_shelf_level]'));
            $mol_assert_equal(head.querySelector('[bog_vmap_app_shelf_items]'), null);
            const page = dom.querySelector('[mol_page_body]');
            $mol_assert_ok(page.querySelector('[bog_vmap_app_shelf_items]'));
            $mol_assert_ok(page.querySelector('[bog_vmap_app_shelf_pack_row]'));
        },
        'the pack, its address and its files sit in one expander, refusal under the field'($) {
            const shelf = $bog_vmap_app_shelf.make({ $ });
            shelf.links('https://mol.hyoo.ru, https://b-on-g.github.io/gram/');
            const dom = shelf.dom_tree();
            const source = dom.querySelector('[bog_vmap_app_shelf_source]');
            $mol_assert_ok(source.matches('[mol_expander]'));
            $mol_assert_ok(source.textContent.includes('Пак компонентов'));
            $mol_assert_ok(source.querySelector('[bog_vmap_app_shelf_pack_row]'));
            const field = dom.querySelector('[bog_vmap_app_shelf_links_field]');
            $mol_assert_ok(field.matches('[mol_form_field]'));
            $mol_assert_ok(field.querySelector('[bog_vmap_app_shelf_links]'));
            $mol_assert_ok(field.querySelector('[mol_form_field_bid]')
                .textContent.includes($bog_vmap_lib_links_reason.pack_second));
        },
        'the filter narrows both the parts and the objects of the application'($) {
            const shelf = $bog_vmap_app_shelf.make({
                $,
                class_list: () => [`${d}bog_gram`, `${d}bog_gram_chat`, `${d}bog_other`],
            });
            const parts = () => shelf.items_shown().map(item => item.id);
            const apps = () => shelf.shown(shelf.app_list());
            $mol_assert_ok(parts().includes('block'));
            $mol_assert_equal(apps().length, 3);
            shelf.filter('калькулятор');
            $mol_assert_like(parts(), ['calc', 'pair']);
            $mol_assert_like(apps(), []);
            shelf.filter('gram_chat');
            $mol_assert_like(parts(), []);
            $mol_assert_like(apps(), [`${d}bog_gram_chat`]);
            const rows = [...shelf.dom_tree().querySelectorAll('[bog_vmap_app_shelf_app_list] [bog_vmap_app_shelf_item_row]')].map(el => el.textContent);
            $mol_assert_like(rows, ['Gram_chat']);
            shelf.filter('');
            $mol_assert_ok(parts().includes('block'));
            $mol_assert_equal(apps().length, 3);
        },
        'the shelf is cut down to what the pack at hand can build'($) {
            const shelf = (classes) => $$.$bog_vmap_app_shelf.make({
                $,
                pack_link: () => 'https://pack.test/',
                pack_classes: () => classes,
            });
            const ids = (one) => one.items().map(item => item.id);
            const rich = ids(shelf([
                `${d}mol_view`, `${d}mol_string`, `${d}mol_number`,
                `${d}bog_vmap_part_calc`, `${d}bog_vmap_part_map`,
            ]));
            const poor = ids(shelf([`${d}mol_view`, `${d}mol_string`]));
            $mol_assert_equal(rich.includes('calc'), true);
            $mol_assert_equal(rich.includes('pair'), true);
            $mol_assert_equal(rich.includes('input_number'), true);
            $mol_assert_equal(poor.includes('calc'), false);
            $mol_assert_equal(poor.includes('pair'), false);
            $mol_assert_equal(poor.includes('input_number'), false);
            $mol_assert_equal(poor.includes('block'), true);
            $mol_assert_equal(poor.includes('input_string'), true);
        },
        'until the pack answers the shelf keeps offering everything'($) {
            const shelf = $$.$bog_vmap_app_shelf.make({
                $,
                pack_link: () => 'https://pack.test/',
                pack_classes: () => $mol_fail(new Error('Not Found')),
            });
            $mol_assert_equal(shelf.items().length, $bog_vmap_app_shelf_presets().length);
        },
        'a preset asks for every class its source names but its own head'($) {
            $mol_assert_like($.$bog_vmap_app_shelf_needs(preset('calc')), [`${d}mol_view`, `${d}bog_vmap_part_calc`]);
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
            $mol_assert_equal(taken.classes.length, 2);
            $mol_assert_ok(taken.classes[0].tree.startsWith(`${d}my_card ${d}mol_view`));
            $mol_assert_ok(taken.classes[1].tree.includes(`${d}my_price ${d}my_card`));
            $mol_assert_like(taken.refused, []);
            $mol_assert_equal(taken.classes[0].css, '[my_card] { color: red }');
            $mol_assert_equal(taken.classes[1].css, '');
        },
        'what cannot be taken is refused by name, with the reason on screen'($) {
            const taken = $.$bog_vmap_app_shelf_intake([
                { name: 'card.view.ts', text: 'namespace $ {}' },
                { name: 'web.view.tree', text: `${d}mol_view ${d}mol_object\n` },
                { name: 'empty.view.tree', text: '- just a comment\n' },
                { name: 'card.view.css.ts', text: 'namespace $ {}' },
            ]);
            $mol_assert_like(taken.classes, []);
            $mol_assert_like(taken.refused.map(item => item.reason), [
                $bog_vmap_app_shelf_refuse.kind,
                $bog_vmap_app_shelf_refuse.built,
                $bog_vmap_app_shelf_refuse.empty,
                $bog_vmap_app_shelf_refuse.kind,
            ]);
            $mol_assert_ok($bog_vmap_app_shelf_intake_note(taken).includes('card.view.ts'));
        },
        async 'a class brought from a file keeps the name it came with'($) {
            const store = $bog_vmap_app_publish_store.make({
                $,
                shelf_land_config: () => $.$giper_baza_glob.home().land(),
            });
            const source = `${d}my_card ${d}mol_view\n\tprice 0\n`;
            const link = await $mol_wire_async(store).import_class(source);
            const shelf = store.shelf();
            $mol_assert_equal(link, shelf.land().link().str);
            $mol_assert_equal(shelf.parts().length, 1);
            $mol_assert_equal(shelf.parts()[0].tree(), source);
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
            const parts = shelf.Store().shelf().parts();
            $mol_assert_equal(parts.length, 1);
            $mol_assert_equal(parts[0].tree(), `${d}my_card ${d}mol_view price 0\n`);
            $mol_assert_equal(parts[0].css(), '[my_card] { color: red }');
            $mol_assert_equal(shelf.links(), shelf.Store().link());
            $mol_assert_ok(shelf.import_note().includes('card.view.ts'));
            $mol_assert_ok(shelf.dom_tree()
                .querySelector('[bog_vmap_app_shelf_import_field] [mol_form_field_bid]')
                .textContent.includes('card.view.ts'));
        },
        'a declaration that names no class is refused before anything is written'($) {
            const store = $bog_vmap_app_publish_store.make({
                $,
                shelf_land_config: () => $.$giper_baza_glob.home().land(),
            });
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
                $mol_assert_ok($bog_vmap_lang_node.make({ $, source: () => item.source }).tree());
            }
        },
        'a one part item leaves a declaration and a name to place'($) {
            const node = doc($);
            const placed = $.$bog_vmap_app_shelf_apply(node, preset('calc'), freer(node));
            $mol_assert_like(placed, ['Calc']);
            $mol_assert_like(node.part_names(), ['Calc']);
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
            $mol_assert_equal(node.wires().length, 1);
            const zoom = node.over_tree('Map', 'zoom');
            $mol_assert_equal(zoom?.kids[0]?.type, '<=');
            $mol_assert_equal(zoom?.kids[0]?.kids[0]?.type, node.wires()[0].name);
        },
        'the second level replaces the shelf instead of stacking under it'($) {
            const shelf = $bog_vmap_app_shelf.make({ $ });
            $mol_assert_equal(shelf.classes_showed(), false);
            $mol_assert_equal(shelf.body().includes(shelf.Parts()), true);
            $mol_assert_equal(shelf.body().includes(shelf.Apps()), true);
            $mol_assert_equal(shelf.body().includes(shelf.Palette()), false);
            shelf.classes_showed(true);
            $mol_assert_equal(shelf.body().includes(shelf.Parts()), false);
            $mol_assert_equal(shelf.body().includes(shelf.Apps()), false);
            $mol_assert_equal(shelf.body().includes(shelf.Palette()), true);
            $mol_assert_equal(shelf.body().includes(shelf.Source()), true);
        },
        'swapping the pack keeps the lands and drops only the old address'($) {
            const swap = $bog_vmap_app_shelf_pack_swap;
            const one = 'https://one.pack/';
            const two = 'https://two.pack/';
            const land = 'aaaaaaaa_bbbbbbbb';
            $mol_assert_equal(swap('', one), one);
            $mol_assert_equal(swap(one, two), two);
            $mol_assert_equal(swap(`${one}, ${land}`, two), `${two}, ${land}`);
            $mol_assert_equal(swap(`${land}, ${one}`, two), `${two}, ${land}`);
            $mol_assert_equal(swap(`${one}, ${land}`, ''), land);
            $mol_assert_equal(swap(land, ''), land);
        },
        'every pack the shelf offers names itself and points at a folder'($) {
            const offers = $bog_vmap_app_shelf_packs();
            $mol_assert_equal(offers.length, new Set(offers.map(one => one.id)).size);
            for (const offer of offers) {
                $mol_assert_ok(offer.title);
                $mol_assert_ok(offer.hint);
                if (offer.link)
                    $mol_assert_equal(offer.link.endsWith('/'), true);
            }
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    $mol_test_mocks.push($ => {
        class $mol_state_arg_mock extends $.$mol_state_arg {
        }
        $.$mol_state_arg = $mol_state_arg_mock;
    });
    class $bog_vmap_app_history_test_doc extends $mol_object {
        state(next) {
            return next ?? { source: '', js: {}, css: {}, spots: {} };
        }
        source(next) {
            const state = this.state();
            if (next === undefined)
                return state.source;
            this.state({ ...state, source: next });
            return next;
        }
        css(klass, next) {
            const state = this.state();
            this.state({ ...state, css: { ...state.css, [klass]: next } });
        }
        spot(name, x, y) {
            const state = this.state();
            this.state({ ...state, spots: { ...state.spots, [name]: { x, y } } });
        }
    }
    __decorate([
        $mol_mem
    ], $bog_vmap_app_history_test_doc.prototype, "state", null);
    function $bog_vmap_app_history_test_pair($, delay = 0) {
        const doc = $bog_vmap_app_history_test_doc.make({ $ });
        const one = $$.$bog_vmap_app_history.make({
            $,
            doc_key: () => 'doc',
            step_delay: () => delay,
            state: (next) => doc.state(next),
        });
        const eye = new $mol_wire_atom('history_tape', () => {
            const tape = one.tape('doc');
            return tape.states.length + ':' + tape.pos;
        });
        eye.fresh();
        const commit = async () => {
            await $mol_wire_async(one).step(one.slug());
            eye.fresh();
        };
        return { doc, one, commit };
    }
    const d = '$';
    const src_one = `${d}bog_vmap_app_history_test_page ${d}mol_view\n\ttitle \\One\n\tsub / <= title\n`;
    const src_two = `${d}bog_vmap_app_history_test_page ${d}mol_view\n\ttitle \\Two\n\tsub / <= title\n`;
    function $bog_vmap_app_history_test_land($) {
        const store = $bog_vmap_app_store.make({ $, doc_land_config: () => null });
        const doc = store.doc_add('Landing');
        const one = $$.$bog_vmap_app_history.make({
            $,
            store: () => store,
            step_delay: () => 0,
            snap_delay: () => 0,
            state: (next) => store.doc_state(doc, next),
        });
        return { store, doc, one };
    }
    async function $bog_vmap_app_history_test_peers($, writable) {
        const auth_own = await $.$giper_baza_auth.grab();
        const auth_mate = await $.$giper_baza_auth.grab();
        const land_own = $giper_baza_land.make({ $, auth: () => auth_own });
        const land_mate = $giper_baza_land.make({
            $,
            link: () => land_own.link(),
            auth: () => auth_mate,
        });
        if (writable)
            land_own.give(auth_mate.pass(), $giper_baza_rank_post('just'));
        const peer = (land, lord) => {
            const doc = land.Data($bog_vmap_app_doc);
            const store = $bog_vmap_app_store.make({ $, doc_current: () => doc });
            const one = $$.$bog_vmap_app_history.make({
                $,
                store: () => store,
                step_delay: () => 0,
                snap_delay: () => 0,
                state: (next) => store.doc_state(doc, next),
            });
            return { land, doc, store, one, lord };
        };
        const sync = (from, to) => $mol_wire_async(to.land).units_steal(from.land);
        return {
            own: peer(land_own, auth_own.pass().lord().str),
            mate: peer(land_mate, auth_mate.pass().lord().str),
            sync,
        };
    }
    function $bog_vmap_app_history_test_times(store, doc) {
        return store.snaps(doc).map(snap => snap.time());
    }
    function $bog_vmap_app_history_test_stroke(next) {
        return {
            code: 'KeyZ',
            command: true,
            shift: false,
            alt: false,
            tag: 'DIV',
            editable: false,
            ...next,
        };
    }
    $mol_test({
        async 'three edits and two undos give the state of the first edit'($) {
            const { doc, one, commit } = $bog_vmap_app_history_test_pair($);
            await commit();
            doc.source('one');
            await commit();
            doc.source('two');
            await commit();
            doc.source('three');
            await commit();
            one.undo();
            one.undo();
            $mol_assert_equal(doc.source(), 'one');
        },
        async 'redo after two undos gives the state of the second edit'($) {
            const { doc, one, commit } = $bog_vmap_app_history_test_pair($);
            await commit();
            doc.source('one');
            await commit();
            doc.source('two');
            await commit();
            doc.source('three');
            await commit();
            one.undo();
            one.undo();
            one.redo();
            $mol_assert_equal(doc.source(), 'two');
        },
        async 'an edit after an undo cuts the tail off'($) {
            const { doc, one, commit } = $bog_vmap_app_history_test_pair($);
            await commit();
            doc.source('one');
            await commit();
            doc.source('two');
            await commit();
            one.undo();
            $mol_assert_equal(doc.source(), 'one');
            $mol_assert_equal(one.redoable(), true);
            doc.source('other');
            await commit();
            $mol_assert_equal(one.redoable(), false);
            one.undo();
            $mol_assert_equal(doc.source(), 'one');
        },
        async 'the ring starts from the state at hand'($) {
            const { doc, one, commit } = $bog_vmap_app_history_test_pair($);
            doc.source('typed at once');
            await commit();
            $mol_assert_equal(one.ring('doc').length, 1);
            $mol_assert_equal(one.ring('doc')[0].source, 'typed at once');
            $mol_assert_equal(one.undoable(), false);
        },
        async 'a step whose text has already moved on is dropped'($) {
            const { doc, one, commit } = $bog_vmap_app_history_test_pair($);
            await commit();
            doc.source('o');
            const stale = one.slug();
            doc.source('one');
            one.slug();
            await $mol_wire_async(one).step(stale);
            $mol_assert_equal(one.ring('doc').length, 1);
            $mol_assert_equal(one.undoable(), false);
        },
        async 'the same state twice adds no step'($) {
            const { doc, one, commit } = $bog_vmap_app_history_test_pair($);
            await commit();
            doc.source('one');
            await commit();
            await commit();
            await commit();
            $mol_assert_equal(one.ring('doc').length, 2);
            $mol_assert_equal(one.undoable(), true);
            one.undo();
            $mol_assert_equal(doc.source(), '');
            $mol_assert_equal(one.undoable(), false);
        },
        async 'a style is part of the step and comes back with it'($) {
            const { doc, one, commit } = $bog_vmap_app_history_test_pair($);
            doc.source('page');
            await commit();
            doc.css('page', 'color: red');
            await commit();
            $mol_assert_equal(one.ring('doc').length, 2);
            one.undo();
            $mol_assert_equal(Object.keys(doc.state().css).length, 0);
            $mol_assert_equal(doc.source(), 'page');
        },
        async 'undo at the oldest step and redo at the newest change nothing'($) {
            const { doc, one, commit } = $bog_vmap_app_history_test_pair($);
            await commit();
            doc.source('one');
            await commit();
            one.redo();
            $mol_assert_equal(doc.source(), 'one');
            one.undo();
            one.undo();
            $mol_assert_equal(doc.source(), '');
        },
        'a stroke of Z with a command key means undo, with shift means redo'($) {
            const one = $$.$bog_vmap_app_history.make({ $ });
            $mol_assert_equal(one.stroke_kind($bog_vmap_app_history_test_stroke({})), 'undo');
            $mol_assert_equal(one.stroke_kind($bog_vmap_app_history_test_stroke({ shift: true })), 'redo');
        },
        'a stroke without a command key or with alt is not ours'($) {
            const one = $$.$bog_vmap_app_history.make({ $ });
            $mol_assert_equal(one.stroke_kind($bog_vmap_app_history_test_stroke({ command: false })), null);
            $mol_assert_equal(one.stroke_kind($bog_vmap_app_history_test_stroke({ alt: true })), null);
            $mol_assert_equal(one.stroke_kind($bog_vmap_app_history_test_stroke({ code: 'KeyY' })), null);
        },
        'a stroke typed into a field or into the scene frame is left alone'($) {
            const one = $$.$bog_vmap_app_history.make({ $ });
            for (const tag of ['INPUT', 'TEXTAREA', 'SELECT', 'IFRAME']) {
                $mol_assert_equal(one.stroke_kind($bog_vmap_app_history_test_stroke({ tag })), null);
            }
            $mol_assert_equal(one.stroke_kind($bog_vmap_app_history_test_stroke({ editable: true })), null);
        },
        'a snapshot of an unchanged document is not written twice'($) {
            const { store, doc, one } = $bog_vmap_app_history_test_land($);
            store.source(src_one);
            one.snap_make(100);
            $mol_assert_equal(store.snaps(doc).length, 1);
            one.snap_make(200);
            $mol_assert_equal(store.snaps(doc).length, 1);
            store.source(src_two);
            one.snap_make(300);
            $mol_assert_equal(store.snaps(doc).length, 2);
        },
        'restoring a snapshot puts the current state into the history first'($) {
            const { store, doc, one } = $bog_vmap_app_history_test_land($);
            store.source(src_one);
            one.snap_make(100);
            store.source(src_two);
            one.snap_revert(store.snaps(doc)[0].link().str);
            $mol_assert_equal(store.source(), src_one);
            $mol_assert_equal(store.snaps(doc).length, 2);
            $mol_assert_equal(store.snap_state(store.snaps(doc)[1]).source, src_two);
        },
        async 'a pause in editing leaves a snapshot'($) {
            const { store, doc, one } = $bog_vmap_app_history_test_land($);
            store.source(src_one);
            await $mol_wire_async(one).snap_step(one.slug());
            $mol_assert_equal(store.snaps(doc).length, 1);
            $mol_assert_equal(store.snap_state(store.snaps(doc)[0]).source, src_one);
        },
        'the newest snapshot comes first and every row shows its own moment'($) {
            const { store, doc, one } = $bog_vmap_app_history_test_land($);
            store.source(src_one);
            one.snap_make(1757000000000);
            store.source(src_two);
            one.snap_make(1757000060000);
            const links = one.snap_links();
            $mol_assert_equal(links.length, 2);
            $mol_assert_equal(one.snap_preview(links[0]), src_two);
            $mol_assert_equal(one.snap_preview(links[1]), src_one);
            $mol_assert_equal(one.snap_moment(links[0]) === one.snap_moment(links[1]), false);
            $mol_assert_equal(one.snap_author(links[0]), doc.land().auth().pass().lord().str);
        },
        'a snapshot is signed with the class that changed and by how much'($) {
            const { store, one } = $bog_vmap_app_history_test_land($);
            store.source(src_one);
            one.snap_make(1);
            store.source(src_one.replace('\tsub / <= title\n', '\tsub / <= title\n\tCard $mol_view\n'));
            one.snap_make(2);
            const links = one.snap_links();
            $mol_assert_equal(one.snap_change(links[1]), 'первый снимок');
            $mol_assert_equal(one.snap_change(links[0]), 'bog_vmap_app_history_test_page Card +1');
        },
        'two snapshots in a row are signed differently'($) {
            const { store, one } = $bog_vmap_app_history_test_land($);
            store.source(src_one);
            one.snap_make(1);
            store.source(src_two);
            one.snap_make(2);
            const links = one.snap_links();
            $mol_assert_equal(one.snap_change(links[0]) === one.snap_change(links[1]), false);
        },
        'a style written without touching the tree is named in the signature'($) {
            const { store, one } = $bog_vmap_app_history_test_land($);
            store.source(src_one);
            one.snap_make(1);
            store.node_css(store.doc_current(), `${d}bog_vmap_app_history_test_page`, '[x] {}');
            one.snap_make(2);
            $mol_assert_equal(one.snap_change(one.snap_links()[0]), 'bog_vmap_app_history_test_page стиль +1');
        },
        'the button on an unchanged document says so instead of keeping quiet'($) {
            const { store, doc, one } = $bog_vmap_app_history_test_land($);
            store.source(src_one);
            one.snap_press();
            $mol_assert_equal(store.snaps(doc).length, 1);
            $mol_assert_equal(one.note(), '');
            one.snap_press();
            $mol_assert_equal(store.snaps(doc).length, 1);
            $mol_assert_equal(one.note(), 'Изменений с прошлого снимка нет');
        },
        'the note goes away as soon as the document moves on'($) {
            const { store, one } = $bog_vmap_app_history_test_land($);
            store.source(src_one);
            one.snap_press();
            one.snap_press();
            $mol_assert_equal(one.note() !== '', true);
            store.source(src_two);
            $mol_assert_equal(one.note(), '');
        },
        'a long snapshot is previewed trimmed'($) {
            const { store, one } = $bog_vmap_app_history_test_land($);
            const long = src_one.replace(/\n$/, '')
                + Array.from({ length: 40 }, (_, index) => `\n\tItem${index} ${d}mol_view`).join('')
                + '\n';
            store.source(long);
            one.snap_make(1);
            const preview = one.snap_preview(one.snap_links()[0]);
            $mol_assert_equal(preview.split('\n').length, one.preview_limit() + 1);
            $mol_assert_equal(preview.endsWith('…'), true);
        },
        async 'a place of a part is part of the step and comes back with it'($) {
            const { doc, one, commit } = $bog_vmap_app_history_test_pair($);
            doc.source('page');
            doc.spot('Hero', 10, 20);
            await commit();
            doc.spot('Hero', 300, 400);
            await commit();
            $mol_assert_equal(one.ring('doc').length, 2);
            one.undo();
            $mol_assert_like(doc.state().spots, { Hero: { x: 10, y: 20 } });
        },
        'a snapshot carries the places of the parts'($) {
            const { store, doc, one } = $bog_vmap_app_history_test_land($);
            store.source(src_one);
            store.spots({ Hero: { x: 10, y: 20 } });
            one.snap_make(100);
            store.spots({ Hero: { x: 300, y: 400 } });
            one.snap_revert(store.snaps(doc)[0].link().str);
            $mol_assert_like(store.spots(), { Hero: { x: 10, y: 20 } });
            $mol_assert_like(store.snap_state(store.snaps(doc)[1]).spots, { Hero: { x: 300, y: 400 } });
        },
        'the panel is a page with the three steps in its tools'($) {
            const dom = $.$mol_dom_context;
            const { one } = $bog_vmap_app_history_test_land($);
            dom.document.body.appendChild(one.dom_tree());
            const node = one.dom_node();
            $mol_assert_equal(node.querySelectorAll('[mol_page_head]').length, 1);
            $mol_assert_equal(node.querySelectorAll('[mol_page_tools] [mol_button_minor]').length, 3);
        },
        'every snapshot is a button with a labeler inside a list'($) {
            const dom = $.$mol_dom_context;
            const { store, one } = $bog_vmap_app_history_test_land($);
            store.source(src_one);
            one.snap_make(100);
            store.source(src_two);
            one.snap_make(200);
            dom.document.body.appendChild(one.dom_tree());
            const rows = one.dom_node().querySelectorAll('[mol_list] > [bog_vmap_app_history_snap]');
            $mol_assert_equal(rows.length, 2);
            $mol_assert_equal(rows[0].hasAttribute('mol_button_minor'), true);
            $mol_assert_equal(rows[0].querySelectorAll('[mol_labeler]').length, 1);
            $mol_assert_equal(rows[0].textContent.includes(one.snap_moment(one.snap_links()[0])), true);
        },
        'a press on the row of a snapshot asks to go back to it'($) {
            const dom = $.$mol_dom_context;
            const store = $bog_vmap_app_store.make({ $, doc_land_config: () => null });
            const doc = store.doc_add('Landing');
            const asked = [];
            const one = $$.$bog_vmap_app_history.make({
                $,
                store: () => store,
                step_delay: () => 0,
                snap_delay: () => 0,
                state: (next) => store.doc_state(doc, next),
                snap_back: (link, next) => {
                    asked.push(link);
                    return null;
                },
            });
            store.source(src_one);
            one.snap_make(100);
            store.source(src_two);
            one.snap_make(200);
            dom.document.body.appendChild(one.dom_tree());
            const rows = one.dom_node().querySelectorAll('[mol_list] > [bog_vmap_app_history_snap]');
            $mol_assert_equal(rows.length, 2);
            $mol_assert_equal(one.editable(), true);
            rows[0].click();
            $mol_assert_equal(asked.join(' '), one.snap_links()[0]);
        },
        async 'a document of somebody else refuses a snapshot in words and turns the button off'($) {
            const { own, mate, sync } = await $bog_vmap_app_history_test_peers($, false);
            own.store.doc_source(own.doc, src_one);
            await sync(own, mate);
            $mol_assert_equal(mate.store.doc_source(mate.doc), src_one);
            $mol_assert_equal(mate.one.editable(), false);
            $mol_assert_equal(mate.one.Take().enabled(), false);
            $mol_assert_equal(own.one.Take().enabled(), true);
            const before = (await $mol_wire_async(mate.land).diff_units()).length;
            mate.one.snap_press();
            $mol_assert_equal(mate.one.note(), 'Чужая сцена: снимок в неё не пишется');
            $mol_assert_equal(mate.one.snap_make(100), null);
            $mol_assert_equal(mate.store.snaps(mate.doc).length, 0);
            $mol_assert_equal((await $mol_wire_async(mate.land).diff_units()).length, before);
            await sync(mate, own);
            $mol_assert_equal(own.store.snaps(own.doc).length, 0);
        },
        async 'two peers with the right to write take snapshots in turn and both see both in one order'($) {
            const { own, mate, sync } = await $bog_vmap_app_history_test_peers($, true);
            await sync(own, mate);
            $mol_assert_equal(mate.one.editable(), true);
            $mol_assert_equal(mate.one.Take().enabled(), true);
            own.store.doc_source(own.doc, src_one);
            own.one.snap_make(100);
            await sync(own, mate);
            mate.store.doc_source(mate.doc, src_two);
            mate.one.snap_make(200);
            await sync(mate, own);
            $mol_assert_equal(own.store.snaps(own.doc).length, 2);
            $mol_assert_like(own.store.snaps(own.doc).map(snap => snap.link().str), mate.store.snaps(mate.doc).map(snap => snap.link().str));
            $mol_assert_like(own.one.snap_links(), mate.one.snap_links());
            $mol_assert_like($bog_vmap_app_history_test_times(own.store, own.doc), [100, 200]);
            $mol_assert_like($bog_vmap_app_history_test_times(mate.store, mate.doc), [100, 200]);
            $mol_assert_like(mate.store.snaps(mate.doc).map(snap => mate.store.snap_state(snap).source), [src_one, src_two]);
            $mol_assert_like(own.store.snaps(own.doc).map(snap => snap.author()), [own.lord, mate.lord]);
            $mol_assert_like(mate.store.snaps(mate.doc).map(snap => snap.author()), [own.lord, mate.lord]);
        },
        async 'a return to a snapshot at one peer reaches the other'($) {
            const { own, mate, sync } = await $bog_vmap_app_history_test_peers($, true);
            await sync(own, mate);
            own.store.doc_source(own.doc, src_one);
            own.one.snap_make(100);
            own.store.doc_source(own.doc, src_two);
            await sync(own, mate);
            $mol_assert_equal(mate.store.doc_source(mate.doc), src_two);
            own.one.snap_revert(own.store.snaps(own.doc)[0].link().str);
            $mol_assert_equal(own.store.doc_source(own.doc), src_one);
            await sync(own, mate);
            $mol_assert_equal(mate.store.doc_source(mate.doc), src_one);
            $mol_assert_equal(mate.store.snaps(mate.doc).length, 2);
            $mol_assert_equal(mate.store.snap_state(mate.store.snaps(mate.doc)[1]).source, src_two);
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
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
    const d = '$';
    const editor = ($, klass = `${d}mol_button_minor`) => {
        const app = $bog_vmap_app.make({ $ });
        app.part_drop(klass, 100, 200);
        const code = app.Code();
        return { app, code, name: app.selected() };
    };
    const stroke = (code) => ({
        code: 'KeyZ',
        metaKey: true,
        ctrlKey: false,
        altKey: false,
        shiftKey: false,
        target: code.Tree().Edit().dom_node(),
        preventDefault() { },
    });
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
        'a broken declaration is refused, and the document keeps the last good one'($) {
            const { app, code } = editor($);
            const before = app.doc_source();
            code.tree_text('Broken \\\n\t\t\tnonsense');
            $mol_assert_equal(app.doc_source(), before);
            $mol_assert_equal(code.note() !== '', true);
            $mol_assert_equal(code.tree_text(), 'Broken \\\n\t\t\tnonsense');
        },
        'a good text after a broken one clears the refusal and lands'($) {
            const { app, code, name } = editor($);
            code.tree_text('Broken \\\n\t\t\tnonsense');
            code.tree_text(`${name} ${d}mol_string\n`);
            $mol_assert_equal(code.note(), '');
            $mol_assert_equal(app.doc_source().includes(`${name} ${d}mol_string`), true);
        },
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
        'a binding added to the declaration brings the method with it'($) {
            const { code, name } = editor($);
            $mol_assert_equal(code.js_writable(), false);
            code.tree_text(`${name} ${d}mol_button_minor\n\ttitle <= greeting\n`);
            $mol_assert_equal(code.js_writable(), true);
            $mol_assert_equal(code.js_text(), 'greeting(  ) {\n\t\n}');
        },
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
        'a body with unbalanced braces is reported, not swallowed'($) {
            const { app, code } = editor($);
            app.root_js('broken() {\n\treturn 1\n');
            $mol_assert_equal(code.sliceable(), false);
            $mol_assert_equal(code.note() !== '', true);
            code.whole(true);
            $mol_assert_equal(code.js_text(), 'broken() {\n\treturn 1\n');
        },
        'what the panel writes reaches the scene'($) {
            const { app, code, name } = wired($);
            code.js_text(`greeting() {\n\treturn 1\n}`);
            code.css_text(`[${app.doc_root().slice(1)}_${name.toLowerCase()}] {\n\tcolor: red;\n}`);
            $mol_assert_equal(app.doc_js()[app.doc_root()]?.includes(`greeting()`), true);
            $mol_assert_equal(app.doc_css().includes('color: red'), true);
        },
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
            app.selected(name);
            $mol_assert_equal(code.tree_text(), 'Broken \\\n\t\t\tnonsense');
        },
        'a published node carries its method and its rule'($) {
            const { app, code, name } = wired($);
            code.js_text(`greeting() {\n\treturn 1\n}`);
            code.css_text(`[${app.doc_root().slice(1)}_${name.toLowerCase()}] {\n\tcolor: red;\n}`);
            const publish = app.Publish();
            $mol_assert_equal(publish.js(), `greeting() {\n\treturn 1\n}`);
            $mol_assert_equal(publish.css().includes('color: red'), true);
        },
        'a press on the strip left of the field puts the caret in the field'($) {
            const dom = $.$mol_dom_context;
            const panel = $bog_vmap_app_code.make({
                $,
                klass: () => `${d}bog_vmap_app_code_press_page`,
                prop: () => '',
                hooks: () => [],
                whole: () => true,
                source: (next) => next ?? `${d}bog_vmap_app_code_press_page ${d}mol_view\n\tsub /\n`,
                node_source: (next) => next ?? '',
                js: (next) => next ?? '',
                css: (next) => next ?? '',
                error: () => '',
            });
            dom.document.body.appendChild(panel.dom_tree());
            const field = panel.Tree().Edit().dom_node();
            $mol_assert_equal(dom.document.activeElement === field, false);
            panel.tree_press(new dom.Event('pointerdown'));
            $mol_assert_equal(dom.document.activeElement === field, true);
        },
        'a declaration typed key by key gives the same tree as a block paste'($) {
            const add = `\tPage ${d}mol_view\n\t\tsub / <= Button_minor\n`;
            const block = editor($);
            block.code.whole(true);
            block.code.tree_text(block.code.tree_text() + add);
            const typed = editor($);
            typed.code.whole(true);
            for (const char of add)
                typed.code.tree_text(typed.code.tree_text() + char);
            $mol_assert_equal(typed.app.doc_source(), block.app.doc_source());
        },
        'a field left by focus shows the canonical text again'($) {
            const dom = $.$mol_dom_context;
            const { app, code } = editor($);
            code.whole(true);
            dom.document.body.appendChild(code.dom_tree());
            code.tree_text(code.tree_text() + `\tPage ${d}mol_view\n\t\tsub / <= Button_minor\n`);
            $mol_assert_equal(code.tree_text() === app.doc_source(), false);
            code.field_leave({ relatedTarget: dom.document.body });
            $mol_assert_equal(code.tree_text(), app.doc_source());
        },
        'the whole class wiped out is refused and the document stays'($) {
            const { app, code } = editor($);
            code.whole(true);
            const before = app.doc_source();
            code.tree_text('');
            $mol_assert_equal(app.doc_source(), before);
            $mol_assert_equal(code.note(), $.$bog_vmap_app_code_blank);
        },
        'a node declaration wiped out is refused as well'($) {
            const { app, code } = editor($);
            const before = app.doc_source();
            code.tree_text(' \n\t\n');
            $mol_assert_equal(app.doc_source(), before);
            $mol_assert_equal(code.note(), $.$bog_vmap_app_code_blank);
        },
        'undo with the caret in a field rolls the typed text back'($) {
            const dom = $.$mol_dom_context;
            const { app, code } = editor($);
            app.code_showed(true);
            code.whole(true);
            dom.document.body.appendChild(code.dom_tree());
            code.tree_text(code.tree_text() + `\tPage ${d}mol_view\n\t\tsub / <= Button_minor\n`);
            $mol_assert_equal(code.field_dirty(), true);
            $mol_assert_equal(app.code_undo(stroke(code)), true);
            $mol_assert_equal(code.field_dirty(), false);
            $mol_assert_equal(code.tree_text(), app.doc_source());
        },
        'undo with the caret in an untouched field walks the ring'($) {
            const dom = $.$mol_dom_context;
            const { app, code } = editor($);
            app.code_showed(true);
            code.whole(true);
            dom.document.body.appendChild(code.dom_tree());
            const history = app.History();
            const key = history.doc_key();
            history.step_push(key, history.doc_state());
            const before = app.doc_source();
            code.tree_text(code.tree_text() + `\tPage ${d}mol_view\n\t\tsub / <= Button_minor\n`);
            code.field_undo();
            history.step_push(key, history.doc_state());
            $mol_assert_equal(code.field_dirty(), false);
            $mol_assert_equal(app.doc_source() === before, false);
            $mol_assert_equal(app.code_undo(stroke(code)), true);
            $mol_assert_equal(app.doc_source(), before);
        },
        'the root renamed and renamed back leaves the style matching'($) {
            const { app, code, name } = editor($);
            code.css_text(`[${$.$bog_vmap_app_code_attr(app.doc_root())}_${name.toLowerCase()}] {\n\tcolor: red;\n}`);
            const before = app.root_css();
            app.root_title(`${d}my_shop_page`);
            $mol_assert_equal(app.doc_root(), `${d}my_shop_page`);
            $mol_assert_equal(app.root_css().includes('[my_shop_page_button_minor]'), true);
            app.root_title(`${d}my_site_page`);
            $mol_assert_equal(app.root_css(), before);
        },
        'a press on a closed tab opens it'($) {
            const { code } = editor($);
            const deck = code.Sources();
            deck.Switch().option_checked('2', true);
            $mol_assert_equal(deck.current(), '2');
        },
        'a repeated press on the open tab keeps it open'($) {
            const { code } = editor($);
            const deck = code.Sources();
            deck.Switch().option_checked('2', true);
            deck.Switch().option_checked('2', false);
            $mol_assert_equal(deck.current(), '2');
        },
        'the panel is a page whose head carries the scope of the edit'($) {
            const dom = $.$mol_dom_context;
            const { code } = editor($);
            code.whole(true);
            dom.document.body.appendChild(code.dom_tree());
            const head = code.dom_node().querySelectorAll('[mol_page_head]');
            const title = head[0].querySelector('[mol_page_title]');
            $mol_assert_equal(head.length, 1);
            $mol_assert_equal(title.textContent, code.scope_note());
            $mol_assert_equal(title.textContent.includes(code.klass()), true);
        },
        'the check of the whole class stands in the tools of the page'($) {
            const dom = $.$mol_dom_context;
            const { code } = editor($);
            dom.document.body.appendChild(code.dom_tree());
            $mol_assert_equal(code.tools().length, 1);
            $mol_assert_equal(code.tools()[0] === code.Scope(), true);
            $mol_assert_equal(code.dom_node().querySelectorAll('[mol_page_tools] [mol_check]').length, 1);
        },
        'the deck stands in the body and every tab holds a field'($) {
            const dom = $.$mol_dom_context;
            const { code } = editor($);
            code.whole(true);
            dom.document.body.appendChild(code.dom_tree());
            $mol_assert_equal(code.dom_node().querySelectorAll('[mol_page_body] [mol_deck]').length, 1);
            for (const tab of ['0', '1', '2']) {
                code.Sources().current(tab);
                $mol_assert_equal(code.dom_tree().querySelectorAll('[mol_textarea]').length, 1);
            }
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    const d = '$';
    const page = [
        `${d}bog_site_page ${d}mol_view`,
        `	Hero ${d}bog_site_hero`,
        `	greeting = Hero title`,
        `	sub / <= Hero`,
        ``,
    ].join('\n');
    const hero = `${d}bog_site_hero ${d}mol_view\n\ttitle \\Hi\n\tcount? 0\n\tplain \\x\n`;
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
    function file_of(module, suffix) {
        return module.files.find(file => file.name.endsWith(suffix))?.text ?? '';
    }
    const theme = `\tplugins /\n\t\t<= Theme ${d}mol_theme_auto\n`;
    $mol_test({
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
            $mol_assert_like(back.kids.map(cl => cl.type), [`${d}bog_site_page`, `${d}bog_site_hero`]);
        },
        'a hand written body carries its decorators'($) {
            const module = $.$bog_vmap_app_export_build([
                { source: page },
                { source: hero, js: 'count( next?: number ) {\n\treturn next ?? 7\n}\n' },
            ]);
            const ts = file_of(module, '.view.ts');
            $mol_assert_equal(ts.includes(`export class ${d}bog_site_hero extends $.${d}bog_site_hero {`), true);
            $mol_assert_equal(ts.includes(`\t\t@ ${d}mol_mem\n\t\tcount( next?: number ) {`), true);
            $mol_assert_equal(ts.includes('.prototype'), false);
            $mol_assert_equal(ts.includes('"title"'), false);
            $mol_assert_equal(ts.includes('"plain"'), false);
        },
        'the decorated body slices back into the same properties'($) {
            const module = $.$bog_vmap_app_export_build([
                { source: page },
                { source: hero, js: 'count( next?: number ) {\n\treturn next ?? 7\n}\n' },
            ]);
            const ts = file_of(module, '.view.ts');
            const body = ts.slice(ts.indexOf('{', ts.indexOf('export class')) + 1, ts.lastIndexOf('\t}'));
            $mol_assert_like([...$.$bog_vmap_app_code_props_js(body).keys()], ['count']);
        },
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
            $mol_assert_equal(module.files.some(file => file.name.endsWith('.view.ts')), false);
            $mol_assert_equal(module.files.some(file => file.name.endsWith('.view.css')), false);
        },
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
        'the exported root follows the scheme of the system'($) {
            const module = $.$bog_vmap_app_export_build([{ source: page }, { source: hero }]);
            const tree = file_of(module, '.view.tree');
            $mol_assert_equal(tree, page + theme + hero);
            $mol_assert_equal(tree.split('plugins /').length, 2);
        },
        'the theme plugin lands on the router, not on the page under it'($) {
            const module = $.$bog_vmap_app_export_build([{ source: pages }, { source: hero }]);
            const tree = file_of(module, '.view.tree');
            $mol_assert_equal(module.root, `${d}bog_site_app`);
            $mol_assert_ok(tree.endsWith(`${d}bog_site_app ${d}mol_view\n${theme}\tDoc ${d}bog_site_page\n`));
            $mol_assert_equal(tree.split('plugins /').length, 2);
        },
        'a document that plugs something in itself is left alone'($) {
            const own = [
                `${d}bog_site_page ${d}mol_view`,
                `	plugins /`,
                `		<= Hotkey ${d}mol_hotkey`,
                `	sub /`,
                ``,
            ].join('\n');
            const tree = file_of($.$bog_vmap_app_export_build([{ source: own }]), '.view.tree');
            $mol_assert_equal(tree.split('plugins /').length, 2);
            $mol_assert_equal(tree.includes(`${d}mol_theme_auto`), false);
            $mol_assert_ok(tree.includes(`Hotkey ${d}mol_hotkey`));
        },
        'a root with a name of its own gets the next free one'($) {
            const own = [
                `${d}bog_site_page ${d}mol_view`,
                `	Theme ${d}mol_view`,
                `	sub /`,
                ``,
            ].join('\n');
            const tree = file_of($.$bog_vmap_app_export_build([{ source: own }]), '.view.tree');
            $mol_assert_ok(tree.includes(`\t\t<= Theme2 ${d}mol_theme_auto\n`));
        },
        'the workflow builds the module by the stock action and nothing by hand'($) {
            const module = $.$bog_vmap_app_export_build([{ source: page }, { source: hero }]);
            const yml = file_of(module, '.github/workflows/deploy.yml');
            $mol_assert_ok(yml.includes('uses: hyoo-ru/mam_build@master2'));
            $mol_assert_ok(yml.includes(`package: '${module.path}'`));
            $mol_assert_ok(yml.includes(`folder: '${module.path}/-'`));
            $mol_assert_equal(yml.includes('git clone'), false);
            $mol_assert_equal(yml.includes('npm start'), false);
            $mol_assert_equal(yml.includes('bog/vmap'), false);
            $mol_assert_equal(file_of(module, '.gitattributes'), '*\t-text\n');
            $mol_assert_ok(file_of(module, '.gitignore').startsWith('-*'));
        },
        'the readme names the module path, not the editor'($) {
            const module = $.$bog_vmap_app_export_build([{ source: page }, { source: hero }]);
            const readme = file_of(module, 'README.md');
            $mol_assert_ok(readme.startsWith(`# ${module.name}\n`));
            $mol_assert_ok(readme.includes(`npm start ${module.path}`));
            $mol_assert_equal(readme.includes('bog/vmap'), false);
        },
        'the module is the files a person would have written'($) {
            const module = $.$bog_vmap_app_export_build([{ source: page }, { source: hero }]);
            $mol_assert_equal(module.path, 'bog/site');
            $mol_assert_equal(module.name, 'site');
            $mol_assert_like(module.files.map(file => file.name), [
                'site.view.tree',
                'site.meta.tree',
                'index.html',
                'README.md',
                '.gitattributes',
                '.gitignore',
                '.github/workflows/deploy.yml',
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
                'README.md',
                '.gitattributes',
                '.gitignore',
                '.github/workflows/deploy.yml',
            ]);
        },
        'a root outside the document is refused'($) {
            $mol_assert_fail(() => $.$bog_vmap_app_export_build([{ source: page }, { source: hero }], `${d}bog_site_nope`), Error);
        },
        'a class declared twice is refused'($) {
            $mol_assert_fail(() => $.$bog_vmap_app_export_build([{ source: hero }, { source: hero }]), Error);
        },
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
            $mol_assert_equal(tree, board + theme);
            const css = file_of($.$bog_vmap_app_export_build([{ source: board }]), '.view.css');
            $mol_assert_equal(/\bleft\b|\btop\b|position/.test(css), false);
        },
        'a document of two artboards exports with a router over them'($) {
            const module = $.$bog_vmap_app_export_build([{ source: pages }, { source: hero }]);
            const tree = file_of(module, '.view.tree');
            const ts = file_of(module, '.view.ts');
            $mol_assert_equal(tree, pages + hero + `${d}bog_site_app ${d}mol_view\n` + theme + `\tDoc ${d}bog_site_page\n`);
            $mol_assert_equal(tree.indexOf(`${d}bog_site_page `) < tree.indexOf(`${d}bog_site_app `), true);
            $mol_assert_equal(ts.includes(`switch( this.$.${d}mol_state_arg.value( 'page' ) ) {`), true);
            $mol_assert_equal(ts.includes(`case "About": return [ doc.About() ]`), true);
            $mol_assert_equal(ts.includes(`default: return [ doc.Home() ]`), true);
            $mol_assert_equal(ts.includes('Loose'), false);
            $mol_assert_equal(ts.includes('const doc = this.Doc()'), true);
            $mol_assert_equal(module.root, `${d}bog_site_app`);
            $mol_assert_equal(file_of(module, 'index.html').includes(`mol_view_root="${d}bog_site_app"`), true);
        },
        'a routed document ships no placement'($) {
            const module = $.$bog_vmap_app_export_build([{ source: pages }, { source: hero }]);
            $mol_assert_equal(/\bleft\b|\btop\b|position/.test(file_of(module, '.view.css')), false);
            $mol_assert_equal(/\bx\b|\by\b|spot/.test(file_of(module, '.view.ts')), false);
        },
        'a document of one artboard gets no router'($) {
            const one = [
                `${d}bog_site_page ${d}mol_view`,
                `	Head ${d}mol_view`,
                `	Home ${d}mol_view sub / <= Head`,
                `	sub / <= Home`,
                ``,
            ].join('\n');
            const module = $.$bog_vmap_app_export_build([{ source: one }]);
            $mol_assert_equal(file_of(module, '.view.tree'), one + theme);
            $mol_assert_equal(module.root, `${d}bog_site_page`);
            $mol_assert_like(module.files.map(file => file.name), [
                'page.view.tree',
                'page.meta.tree',
                'index.html',
                'README.md',
                '.gitattributes',
                '.gitignore',
                '.github/workflows/deploy.yml',
            ]);
        },
        'the router leaves the module where the document put it'($) {
            const module = $.$bog_vmap_app_export_build([{ source: pages }, { source: hero }]);
            $mol_assert_equal(module.path, 'bog/site');
            $mol_assert_equal(module.root, `${d}bog_site_app`);
            $mol_assert_equal($.$bog_vmap_app_export_path([`${d}bog_site_page`, `${d}bog_site_hero`, module.root]), 'bog/site');
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
            $mol_assert_equal(error.message.includes(`${d}bog_site_hero`), true);
            $mol_assert_equal(error.message.includes('строка 5'), true);
            $mol_assert_equal(error.message.includes('count'), true);
            $mol_assert_equal(error.message.includes('next'), true);
        },
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
        'the check keeps quiet on everything it is not sure of'($) {
            const quiet = (js) => $mol_assert_like($.$bog_vmap_app_export_untyped(js), []);
            quiet('render( { head, foot } ) {\n\treturn [ head, foot ]\n}\n');
            quiet('handler = ( event )=> event.type\n');
            quiet('pick( this: $, id: string ) {\n\treturn id\n}\n');
            quiet('first< Item >( list: Item[] ) {\n\treturn list[0]\n}\n');
            quiet('plus( a ): number\nplus( a: number ) {\n\treturn a\n}\n');
            quiet('join( a?: string, ... rest: string[] ) {\n\treturn [ a, ... rest ]\n}\n');
            quiet('sample() {\n\treturn `\ncount( next ) {\n`\n}\n');
            quiet('sample() {\n\treturn 1\n}\n// count( next ) {\n');
            quiet('sample() {\n\treturn 1\n}\n/*\ncount( next ) {\n*/\n');
            quiet('config() {\n\treturn {\n\t\topen( next ) { return next },\n\t}\n}\n');
            quiet('run() {\n\tsuper( next )\n\tthis.compute( x )\n}\n');
        },
        'the check does say the parameter it is sure about'($) {
            const first = (js) => $.$bog_vmap_app_export_untyped(js)[0];
            const beside = $.$bog_vmap_app_export_untyped('pick( this: $, id ) {\n\treturn id\n}\n');
            $mol_assert_equal(beside.length, 1);
            $mol_assert_equal(beside[0].param, 'id');
            $mol_assert_equal(first('first< Item >( list ) {\n\treturn list[0]\n}\n').param, 'list');
            const rest = first('join( ... parts ) {\n\treturn parts\n}\n');
            $mol_assert_equal(rest.param, 'parts');
            $mol_assert_equal(rest.text.includes('... parts: number[]'), true);
            $mol_assert_equal(first('load( id? ) {\n\treturn id\n}\n').param, 'id');
            $mol_assert_equal(first('set title( next ) {\n\treturn next\n}\n').method, 'title');
            $mol_assert_equal(first('async load( id ) {\n\treturn id\n}\n').method, 'load');
            const split = first('sum(\n\ta: number,\n\tb,\n) {\n\treturn a + b\n}\n');
            $mol_assert_equal(split.param, 'b');
            $mol_assert_equal(split.line, 1);
            const inset = first('\tcount( next ) {\n\t\treturn next\n\t}\n');
            $mol_assert_equal(inset.param, 'next');
            $mol_assert_equal(first('count( next ) {\n\treturn next\n}\n').text.includes('count( next?: number )'), true);
        },
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
            $mol_assert_equal(tree.includes(`\tHero ${d}bog_site_hero title <= greeting\n`), true);
        },
        'a name the body does not answer is left alone'($) {
            const source = [
                `${d}bog_site_page ${d}mol_view`,
                `	Hero ${d}bog_site_hero title <= greeting`,
                `	Note ${d}mol_view sub / <= title`,
                `	title \\Hi`,
                `	sub / <= Hero`,
                ``,
            ].join('\n');
            const js = 'greeting(): string {\n\treturn \'Hi\'\n}';
            const model = $bog_vmap_lang_node.make({ $ });
            model.source(source);
            $mol_assert_like($.$bog_vmap_app_export_hooks(model.tree(), js), ['greeting']);
            const module = $.$bog_vmap_app_export_build([{ source, js }, { source: hero }]);
            $mol_assert_equal(file_of(module, '.view.tree').includes('title null'), false);
        },
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
        'the address of an asset leaves the export exactly as it entered'($) {
            const uri = 'https://baza.test/?BAZA:file=TQzejQsT_m3PFV7J3;name=logo.png';
            const module = $.$bog_vmap_app_export_build([
                { source: `${d}bog_site_page ${d}mol_view\n\tLogo ${d}mol_image uri \\${uri}\n\tsub / <= Logo\n` },
            ]);
            const tree = file_of(module, '.view.tree');
            $mol_assert_ok(tree.includes(`uri \\${uri}`));
            $mol_assert_equal(module.files.some(file => file.name.startsWith('assets/')), false);
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    const d = '$';
    const measured = ($) => {
        const peer = { origin: 'null', postMessage() { } };
        const pane = $$.$bog_vmap_app_pane.make({
            $,
            doc_root: () => `${d}doc`,
            scene_peer: () => peer,
        });
        pane.handshake(pane.scene_key(), 1);
        const report = (sizes) => pane.message_receive({ data: { ns: $bog_vmap_bridge_ns, kind: 'sizes', sizes }, source: peer });
        return { pane, report };
    };
    $mol_test_mocks.push($ => {
        class $mol_state_session_mock extends $.$mol_state_session {
            static store = {};
            static native() {
                const store = this.store;
                return {
                    getItem: (key) => store[key] ?? null,
                    setItem: (key, value) => { store[key] = value; },
                    removeItem: (key) => { delete store[key]; },
                };
            }
        }
        $.$mol_state_session = $mol_state_session_mock;
    });
    $mol_test({
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
        'panning does not touch the placement'($) {
            const app = $bog_vmap_app.make({ $ });
            app.part_drop(`${d}mol_button_minor`, 100, 200);
            const before = JSON.stringify(app.spots());
            const pane = app.Pane();
            pane.camera_shift(new $mol_vector_2d(-500, -500));
            $mol_assert_equal(JSON.stringify(app.spots()), before);
        },
        'measured boxes survive a report without them'($) {
            const { pane, report } = measured($);
            report({
                [`${d}doc/A`]: { x: 0, y: 0, width: 10, height: 10 },
                [`${d}doc/B`]: { x: 20, y: 0, width: 10, height: 10 },
            });
            report({ [`${d}doc/A`]: { x: 5, y: 5, width: 10, height: 10 } });
            $mol_assert_equal(pane.sizes()[`${d}doc/A`].x, 5);
            $mol_assert_equal(Boolean(pane.sizes()[`${d}doc/B`]), true);
        },
        'a part measured at a new path takes its insides with it'($) {
            const { pane, report } = measured($);
            report({
                [`${d}doc/Icon`]: { x: 0, y: 0, width: 10, height: 10 },
                [`${d}doc/Icon/Path`]: { x: 0, y: 0, width: 8, height: 8 },
                [`${d}doc/Icons`]: { x: 0, y: 0, width: 10, height: 10 },
            });
            report({
                [`${d}doc/Board/Icon`]: { x: 30, y: 0, width: 10, height: 10 },
                [`${d}doc/Board/Icon/Path`]: { x: 30, y: 0, width: 8, height: 8 },
            });
            $mol_assert_equal(Boolean(pane.sizes()[`${d}doc/Icon`]), false);
            $mol_assert_equal(Boolean(pane.sizes()[`${d}doc/Icon/Path`]), false);
            $mol_assert_equal(Boolean(pane.sizes()[`${d}doc/Icons`]), true);
            $mol_assert_equal(pane.sizes()[`${d}doc/Board/Icon`].x, 30);
        },
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
            $mol_assert_like(app.lib_classes().map(tree => tree.type), [`${d}my_card`, `${d}my_badge`]);
            const peers = app.node_peers().map(tree => tree.type);
            $mol_assert_like(peers, [`${d}my_card`, `${d}my_badge`, app.doc_root()]);
            app.links('https://mol.hyoo.ru');
            $mol_assert_like(app.libs(), []);
        },
        'a change of lands keeps the frame, a change of pack replaces it'($) {
            const app = $bog_vmap_app.make({ $ });
            const pane = app.Pane();
            app.links('https://mol.hyoo.ru');
            const before = pane.scene_key();
            $mol_assert_equal(pane.pack_uri(), 'https://mol.hyoo.ru/web.js');
            app.links('https://mol.hyoo.ru, AbCdEfGh_12345678_ZyXwVuTs');
            $mol_assert_equal(pane.scene_key(), before);
            $mol_assert_like(app.lands(), ['AbCdEfGh_12345678_ZyXwVuTs']);
            app.links('https://b-on-g.github.io/gram, AbCdEfGh_12345678_ZyXwVuTs');
            $mol_assert_ok(pane.scene_key() !== before);
            $mol_assert_equal(pane.pack_uri(), 'https://b-on-g.github.io/gram/web.js');
            $mol_assert_equal(app.links(), 'https://b-on-g.github.io/gram, AbCdEfGh_12345678_ZyXwVuTs');
            app.links('https://b-on-g.github.io/gram, https://mol.hyoo.ru');
            $mol_assert_equal(pane.pack_uri(), 'https://b-on-g.github.io/gram/web.js');
            $mol_assert_equal(app.links_parsed().rejected.length, 1);
            app.links('AbCdEfGh_12345678_ZyXwVuTs');
            $mol_assert_ok(!app.pack_link().startsWith('https://b-on-g.github.io/gram'));
            $mol_assert_like(app.lands(), ['AbCdEfGh_12345678_ZyXwVuTs']);
        },
        'the sandbox and the standard palette are found on both layouts'($) {
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
            prod.links('https://mol.hyoo.ru');
            $mol_assert_equal(prod.pack_link(), 'https://mol.hyoo.ru/');
            $mol_assert_equal(prod.links(), 'https://mol.hyoo.ru');
        },
        'an artboard is an ordinary node with a sub and a width'($) {
            const app = $bog_vmap_app.make({ $ });
            app.board_add();
            const source = app.doc_source();
            $mol_assert_ok(source.includes(`Page ${d}mol_view`));
            $mol_assert_ok(source.includes('width \\1280px'));
            $mol_assert_ok(source.includes('flexDirection \\column'));
            $mol_assert_like(app.node().sub_names(), ['Page']);
            $mol_assert_like(app.node().sub_names('Page'), []);
            $mol_assert_like(app.doc_containers(), ['Page']);
            $mol_assert_equal(app.selected(), 'Page');
            $mol_assert_ok(Boolean(app.spots()['Page']));
            app.board_add();
            $mol_assert_like(app.doc_containers(), ['Page', 'Page_2']);
        },
        'an artboard carried into the download takes a colour with its background'($) {
            const app = $bog_vmap_app.make({ $ });
            app.board_add();
            const module = app.export_state().module;
            const tree = module.files.find(file => file.name.endsWith('.view.tree')).text;
            const styled = (prop) => tree.split('\n')
                .map(line => line.trim())
                .find(line => line.startsWith(prop + ' \\'))
                ?.slice(prop.length + 2) ?? '';
            $mol_assert_equal(styled('background'), 'var(--mol_theme_back)');
            $mol_assert_equal(styled('color'), 'var(--mol_theme_text)');
            $mol_assert_equal(/#[0-9a-f]{3,8}/i.test(tree), false);
        },
        'a new artboard lands where the camera shows the whole of it'($) {
            const app = $bog_vmap_app.make({ $ });
            const pane = app.Pane();
            pane.view_rect = () => ({
                left: 0, top: 0, width: 600, height: 500, right: 600, bottom: 500,
            });
            app.board_add();
            const size = app.board_size();
            const spot = app.spots()['Page'];
            const zoom = pane.camera_zoom();
            const shift = pane.camera_shift();
            $mol_assert_equal(zoom, (600 - 48) / size.width);
            const left = spot.x * zoom + shift[0];
            const top = spot.y * zoom + shift[1];
            $mol_assert_equal(Math.round(left), 24);
            $mol_assert_equal(Math.round(left + size.width * zoom), 576);
            $mol_assert_ok(top >= 0);
            $mol_assert_ok(top + size.height * zoom <= 500);
        },
        'the direction a container is set to comes off the document'($) {
            const app = $bog_vmap_app.make({ $ });
            app.board_add();
            $mol_assert_equal(app.doc_axis('Page'), 'column');
            app.part_drop(`${d}mol_button_minor`, 2000, 100);
            $mol_assert_equal(app.doc_axis('Button_minor'), '');
            app.node().over_set('Page', 'style', app.node().tree().struct('style', [
                app.node().tree().struct('*', [
                    app.node().tree().struct('flexDirection', [app.node().tree().data('row')]),
                ]),
            ]));
            $mol_assert_equal(app.doc_axis('Page'), 'row');
        },
        'a drop inside an artboard goes into its tree and gets no coordinate'($) {
            const app = $bog_vmap_app.make({ $ });
            const pane = app.Pane();
            app.board_add();
            pane.sizes({ [`${app.doc_root()}/Page`]: { x: 0, y: 0, width: 1280, height: 720 } });
            app.part_drop(`${d}mol_button_minor`, 100, 100);
            $mol_assert_like(app.node().sub_names('Page'), ['Button_minor']);
            $mol_assert_equal(app.spots()['Button_minor'], undefined);
            app.part_drop(`${d}mol_string`, 2000, 100);
            $mol_assert_like(app.node().sub_names(), ['Page', 'String']);
            $mol_assert_like(app.spots()['String'], { x: 2000, y: 100 });
        },
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
        'renaming a node on a board keeps it drawn'($) {
            const app = $bog_vmap_app.make({ $ });
            app.board_add();
            app.part_drop(`${d}mol_button_minor`, 2000, 100);
            app.tree_move({ name: 'Button_minor', owner: 'Page', index: 0 });
            app.node_rename('Button_minor', 'Send');
            $mol_assert_like(app.node().sub_names('Page'), ['Send']);
        },
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
        'a name already taken is refused in words and moves nothing'($) {
            const app = $bog_vmap_app.make({ $ });
            app.part_drop(`${d}mol_button_minor`, 100, 200);
            app.part_drop(`${d}mol_string`, 300, 400);
            app.selected('Button_minor');
            const before = app.doc_source();
            app.node_title('String');
            $mol_assert_equal(app.doc_source(), before);
            $mol_assert_equal(app.selected(), 'Button_minor');
            $mol_assert_equal(app.node_title_note(), 'Имя «String» в этом документе уже занято. Узел по-прежнему называется «Button_minor»');
            app.selected('String');
            $mol_assert_equal(app.node_title_note(), '');
        },
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
            app.node_title('Send button');
            $mol_assert_equal(app.doc_source(), before);
            $mol_assert_ok(app.node_title_note().startsWith('Имя «Send button» не годится'));
            app.node_title('Send');
            $mol_assert_equal(app.selected(), 'Send');
            $mol_assert_equal(app.node_title_note(), '');
        },
        'a name that opens with a digit is refused, because it becomes a method name'($) {
            const app = $bog_vmap_app.make({ $ });
            app.part_drop(`${d}mol_button_minor`, 100, 200);
            app.selected('Button_minor');
            const before = app.doc_source();
            app.node_title('9bad');
            $mol_assert_equal(app.doc_source(), before);
            $mol_assert_equal(app.selected(), 'Button_minor');
            $mol_assert_equal(app.node_title_note(), 'Имя «9bad» не годится: имя узла становится именем метода, а оно не начинается'
                + ' с цифры. Узел по-прежнему называется «Button_minor»');
            app.node_title('bad9');
            $mol_assert_equal(app.selected(), 'bad9');
            $mol_assert_equal(app.node_title_note(), '');
        },
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
            $mol_assert_equal(app.doc_wires().length, 1);
            $mol_assert_equal(app.doc_wires()[0].from, 'Field');
            $mol_assert_equal(app.doc_wires()[0].to, 'Button_minor');
            $mol_assert_equal(app.node().prop_names().includes('String'), false);
        },
        'the download offers the module the export builds'($) {
            const app = $bog_vmap_app.make({ $ });
            app.part_drop(`${d}mol_button_minor`, 100, 200);
            const module = app.export_state().module;
            $mol_assert_equal(app.export_ready(), true);
            $mol_assert_equal(module.path, 'my/site/page');
            $mol_assert_equal(module.name, 'page');
            $mol_assert_equal(module.files.map(file => file.name).join(' '), 'page.view.tree page.meta.tree index.html README.md'
                + ' .gitattributes .gitignore .github/workflows/deploy.yml');
            $mol_assert_equal(module.files[0].text, app.doc_source() + `\tplugins /\n\t\t<= Theme ${d}mol_theme_auto\n`);
            $mol_assert_equal(app.export_title(), 'Скачать my/site/page');
            $mol_assert_equal(app.export_file(), 'page.zip');
            $mol_assert_ok(app.export_hint().includes('npx mam my/site/page'));
        },
        'the archive is the module in its folder'($) {
            const app = $bog_vmap_app.make({ $ });
            app.part_drop(`${d}mol_button_minor`, 100, 200);
            const bytes = $.$bog_vmap_app_export_zip_archive(app.export_state().module);
            const text = new TextDecoder().decode(bytes);
            $mol_assert_ok(text.includes('my/site/page/page.view.tree'));
            $mol_assert_ok(text.includes('my/site/page/index.html'));
            $mol_assert_ok(text.includes(`${d}mol_button_minor`));
        },
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
            const file_of = (suffix) => module.files.find(file => file.name.endsWith(suffix))?.text ?? '';
            $mol_assert_ok(file_of('.view.ts').includes(`${d}mol_state_arg`));
            $mol_assert_ok(file_of('index.html').includes(`${d}bog_vmap_app_page_app`));
        },
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
            $mol_assert_equal(app.export_rows().length, 2);
            $mol_assert_equal(app.export_text(1), notes[1]);
            $mol_assert_ok(app.notes().includes(app.Export_row(1)));
            $mol_assert_equal(app.Canvas().foot().includes(app.Export_row(1)), true);
            $mol_assert_fail(() => app.export_blob(), Error);
            app.root_js('greeting( who: string ) {\n\treturn who\n}\n');
            $mol_assert_equal(app.export_ready(), true);
            $mol_assert_equal(app.export_notes().length, 0);
            $mol_assert_equal(app.export_rows().length, 0);
        },
        'the download warns while the assets are still leaving'($) {
            const app = $bog_vmap_app.make({
                $,
                store: () => $bog_vmap_app_store.make({
                    $,
                    doc_land_config: () => null,
                    stage: () => 'ready',
                    asset_links: () => ['one', 'two', 'three'],
                    assets_pending: () => ['three'],
                }),
            });
            $mol_assert_ok(app.export_state().module);
            $mol_assert_equal(app.export_ready(), true);
            $mol_assert_equal(app.status(), 'ассеты ещё уходят на сервер: 2 из 3');
            $mol_assert_equal(app.export_hint(), 'Скачать можно, но ассеты ещё уходят на сервер: 2 из 3');
        },
        'assets that reached the master leave the download silent'($) {
            const app = $bog_vmap_app.make({
                $,
                store: () => $bog_vmap_app_store.make({
                    $,
                    doc_land_config: () => null,
                    stage: () => 'ready',
                    asset_links: () => ['one'],
                    assets_pending: () => [],
                }),
            });
            $mol_assert_equal(app.export_ready(), true);
            $mol_assert_equal(app.assets_note(), '');
            $mol_assert_ok(app.export_hint().includes('npx mam my/site/page'));
        },
        'a document still on its way says nothing about its assets'($) {
            const waiting = new Promise(() => { });
            const app = $bog_vmap_app.make({
                $,
                store: () => $bog_vmap_app_store.make({
                    $,
                    doc_land_config: () => null,
                    stage: () => 'ready',
                    source: () => { throw waiting; },
                    assets_pending: () => { throw waiting; },
                }),
            });
            $mol_assert_equal(app.assets_note(), '');
            $mol_assert_equal(app.export_ready(), false);
        },
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
            $mol_assert_equal(app.export_ready(), false);
            $mol_assert_equal(app.export_notes().length, 0);
            $mol_assert_equal(app.export_rows().length, 0);
            $mol_assert_equal(app.export_hint(), 'Документ ещё загружается');
        },
        'an untouched document downloads as the empty page'($) {
            const app = $bog_vmap_app.make({ $ });
            const module = app.export_state().module;
            $mol_assert_equal(app.export_ready(), true);
            $mol_assert_equal(module.root, `${d}my_site_page`);
            $mol_assert_equal(module.files[0].text, `${d}my_site_page ${d}mol_view sub /\n\tplugins /\n\t\t<= Theme ${d}mol_theme_auto\n`);
            $mol_assert_equal(module.path, 'my/site/page');
            $mol_assert_like(module.files.map(file => file.name), [
                'page.view.tree',
                'page.meta.tree',
                'index.html',
                'README.md',
                '.gitattributes',
                '.gitignore',
                '.github/workflows/deploy.yml',
            ]);
        },
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
        'the exported file puts a base above its heir after an edit'($) {
            const app = $bog_vmap_app.make({ $ });
            app.doc_source([
                `${d}bog_vmap_app_page ${d}bog_vmap_app_base sub /`,
                `${d}bog_vmap_app_base ${d}mol_view title \\Основа`,
                ``,
            ].join('\n'));
            app.part_drop(`${d}mol_button_minor`, 100, 200);
            $mol_assert_like(app.doc_model().names(), [
                `${d}bog_vmap_app_page`,
                `${d}bog_vmap_app_base`,
            ]);
            const tree = app.export_state().module.files[0].text;
            $mol_assert_ok(tree.indexOf(`${d}bog_vmap_app_base ${d}mol_view`)
                < tree.indexOf(`${d}bog_vmap_app_page ${d}bog_vmap_app_base`));
        },
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
            $mol_assert_equal(app.class_js(`${d}my_site_card`), 'note(){\n\treturn 2\n}\n');
        },
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
            $mol_assert_equal(app.doc_source(), source.replace(`${d}my_site_page`, `${d}my_shop_page`));
        },
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
            $mol_assert_equal(app.doc_js()[`${d}my_shop_page`], 'greeting(){\n\treturn 1\n}\n');
            $mol_assert_ok(app.doc_css().includes('color: red'));
        },
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
            $mol_assert_equal(app.class_js(`${d}my_site_page`), 'greeting(){\n\treturn 1\n}\n');
        },
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
            $mol_assert_equal(app.root_draft(), `${d}my_shop_page`);
        },
        'a root name that is not a module path is refused in words'($) {
            const app = $bog_vmap_app.make({ $ });
            app.part_drop(`${d}mol_button_minor`, 100, 200);
            const before = app.doc_source();
            $mol_assert_equal(app.root_title('Страница'), `${d}my_site_page`);
            $mol_assert_equal(app.doc_source(), before);
            $mol_assert_ok(app.root_title_note().includes('Страница'));
            $mol_assert_ok(app.notes().includes(app.Root_note()));
            $mol_assert_ok(app.Canvas().foot().includes(app.Root_note()));
            $mol_assert_equal(app.Canvas().body().includes(app.Root_note()), false);
            app.root_draft('Страница');
            app.root_submit();
            $mol_assert_equal(app.root_draft(), 'Страница');
            $mol_assert_ok(app.root_title_note().includes(`${d}my_site_page`));
            $mol_assert_equal(app.root_title(`${d}page`), `${d}my_site_page`);
            $mol_assert_equal(app.doc_source(), before);
            app.doc_source(before + `${d}my_site_card ${d}mol_view title \\Карточка\n`);
            $mol_assert_equal(app.root_title(`${d}my_site_card`), `${d}my_site_page`);
            $mol_assert_ok(app.root_title_note().includes('already declared'));
        },
        async 'a pick belongs to its scene, and a new scene opens with none'($) {
            const stage = $bog_vmap_app_flow_stage($);
            stage.drop(`${d}flow_calc`, stage.client([200, 150]));
            const first = stage.store.doc_current().link().str;
            $mol_assert_equal(stage.app.selected(), 'Calc');
            stage.click(stage.button('Новая сцена'));
            await $bog_vmap_app_flow_settle(() => stage.store.doc_links().length > 1);
            stage.redraw();
            $mol_assert_equal(stage.app.selected(), null);
            $mol_assert_equal(stage.root.querySelector('[bog_vmap_app_pane_handle]'), null);
            $mol_assert_ok(stage.text().includes('Выберите узел на холсте'));
            const scenes = stage.app.Scenes();
            scenes.current(first);
            stage.redraw();
            $mol_assert_equal(stage.app.selected(), 'Calc');
        },
        'a pick naming nothing in the document leaves the panel inviting'($) {
            const stage = $bog_vmap_app_flow_stage($);
            stage.drop(`${d}flow_calc`, stage.client([200, 150]));
            $mol_assert_equal(stage.app.selection_alive(), true);
            stage.app.doc_source(`${stage.app.doc_root()} ${d}mol_view\n\tsub /\n`);
            stage.redraw();
            $mol_assert_equal(stage.app.selected(), 'Calc');
            $mol_assert_equal(stage.app.selection_alive(), false);
            $mol_assert_ok(stage.text().includes('Выберите узел на холсте'));
        },
        'a click puts a free part beside what covers the middle, never inside it'($) {
            const stage = $bog_vmap_app_flow_stage($);
            stage.click(stage.button('Артборд'));
            const page = stage.app.selected();
            $mol_assert_ok(page);
            stage.click(stage.shelf_row('Блок'));
            const node = stage.app.node();
            const block = stage.app.selected();
            $mol_assert_ok(node.sub_names('').includes(block));
            $mol_assert_equal(node.sub_names(page)?.includes(block) ?? false, false);
            const box = stage.pane.part_size(page);
            const spot = stage.app.spots()[block];
            $mol_assert_ok(box);
            $mol_assert_ok(spot.y >= box.y + box.height);
            stage.click(stage.shelf_row('Блок'));
            const next = stage.app.selected();
            const below = stage.app.spots()[next];
            const first = stage.pane.part_size(block);
            $mol_assert_ok(next !== block);
            $mol_assert_ok(below.y >= first.y + first.height);
        },
        'a refused name stays in the field, and the real one is in the refusal'($) {
            const stage = $bog_vmap_app_flow_stage($);
            stage.drop(`${d}flow_calc`, stage.client([200, 150]));
            stage.tap(stage.part_center('Calc'));
            const field = stage.field('Inspect().Name()');
            stage.type(field, 'Кнопка');
            stage.blur(field);
            $mol_assert_equal(stage.app.selected(), 'Calc');
            $mol_assert_equal(stage.field('Inspect().Name()').value, 'Кнопка');
            $mol_assert_ok(stage.text().includes('Узел по-прежнему называется «Calc»'));
        },
        async 'a click on «Новая сцена» makes a scene, and the address follows the pick'($) {
            const stage = $bog_vmap_app_flow_stage($);
            const first = stage.store.doc_current().link().str;
            $mol_assert_equal(stage.store.doc_links().length, 1);
            stage.click(stage.button('Новая сцена'));
            await $bog_vmap_app_flow_settle(() => stage.store.doc_links().length > 1);
            stage.redraw();
            const second = stage.store.doc_current().link().str;
            $mol_assert_equal(stage.store.doc_links().length, 2);
            $mol_assert_ok(second !== first);
            $mol_assert_equal($.$mol_state_arg.value('doc'), second);
            stage.click(stage.scene_row('Сцена 1'));
            $mol_assert_equal(stage.store.doc_current().link().str, first);
            $mol_assert_equal($.$mol_state_arg.value('doc'), first);
            stage.click(stage.button('Новая сцена'));
            await $bog_vmap_app_flow_settle(() => stage.store.doc_links().length > 2);
            stage.click(stage.button('Новая сцена'));
            await $bog_vmap_app_flow_settle(() => stage.store.doc_links().length > 3);
            stage.redraw();
            const fourth = stage.store.doc_current().link().str;
            $mol_assert_equal(stage.store.doc_links().length, 4);
            $mol_assert_equal($.$mol_state_arg.value('doc'), fourth);
            stage.click(stage.scene_row('Сцена 1'));
            $mol_assert_equal($.$mol_state_arg.value('doc'), first);
        },
        'the canvas page carries the tools, the pane and the notes'($) {
            const app = $bog_vmap_app.make({ $ });
            const pages = app.pages();
            $mol_assert_equal(pages.length, 4);
            $mol_assert_equal(pages[0], app.Scenes());
            $mol_assert_equal(pages[1], app.Shelf());
            $mol_assert_equal(pages[2], app.Canvas());
            $mol_assert_equal(pages[3], app.Idle());
            const tools = app.Canvas().tools();
            for (const tool of [
                app.Palette_check(),
                app.Inspect_check(),
                app.Code_check(),
                app.History_check(),
                app.Board(),
                app.Delete(),
                app.Root_name(),
                app.Publish(),
                app.Download(),
                app.Zoom_out(),
                app.Zoom_reset(),
                app.Zoom_in(),
                app.Lights(),
                app.Status(),
            ])
                $mol_assert_ok(tools.includes(tool));
            $mol_assert_equal(app.Canvas().body()[0], app.Pane());
            $mol_assert_equal(app.Canvas().foot().length, 0);
            $mol_assert_equal(app.floats().length, 0);
        },
        'which panels are open outlives the page'($) {
            const one = $bog_vmap_app.make({ $ });
            $mol_assert_equal(one.palette_showed(), true);
            $mol_assert_equal(one.inspect_showed(), true);
            $mol_assert_equal(one.code_showed(), false);
            one.palette_showed(false);
            one.code_showed(true);
            const two = $bog_vmap_app.make({ $ });
            $mol_assert_equal(two.palette_showed(), false);
            $mol_assert_equal(two.inspect_showed(), true);
            $mol_assert_equal(two.code_showed(), true);
            $mol_assert_equal(two.pages().includes(two.Shelf()), false);
            $mol_assert_equal(two.pages().includes(two.Scenes()), false);
            $mol_assert_equal(two.pages().includes(two.Code()), true);
        },
        'an image dropped on the canvas becomes a node addressed at the file'($) {
            const uri = 'https://baza.test/?BAZA:file=TQzejQsT_m3PFV7J3;name=logo.png';
            const store = $bog_vmap_app_store.make({ $, asset_put: () => uri });
            const app = $bog_vmap_app.make({ $, store: () => store });
            const file = new $.$mol_dom_context.File([new Uint8Array([137, 80, 78, 71])], 'logo.png', { type: 'image/png' });
            app.files_drop({ files: [file], x: 100, y: 200, owner: '', index: -1 });
            const name = app.selected();
            const source = app.doc_source();
            $mol_assert_equal(name, 'Image');
            $mol_assert_ok(source.includes(`Image ${d}mol_image`));
            $mol_assert_ok(source.includes(`uri \\${uri}`));
            $mol_assert_like(app.spots()[name], { x: 100, y: 200 });
        },
        'a file that is not an image becomes a link carrying its name'($) {
            const uri = 'https://baza.test/?BAZA:file=TQzejQsT_m3PFV7J3;name=notes.pdf';
            const store = $bog_vmap_app_store.make({ $, asset_put: () => uri });
            const app = $bog_vmap_app.make({ $, store: () => store });
            const file = new $.$mol_dom_context.File([new Uint8Array([37])], 'notes.pdf', { type: 'application/pdf' });
            app.files_drop({ files: [file], x: 10, y: 20, owner: '', index: -1 });
            const source = app.doc_source();
            $mol_assert_equal(app.selected(), 'File');
            $mol_assert_ok(source.includes(`File ${d}mol_link`));
            $mol_assert_ok(source.includes(`uri \\${uri}`));
            $mol_assert_ok(source.includes('title \\notes.pdf'));
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    const d = '$';
    $_1.$bog_vmap_app_flow_parts = [
        `${d}mol_string ${d}mol_view`,
        `\tvalue? \\`,
        `${d}mol_number ${d}mol_view`,
        `\tvalue? 0`,
        `${d}mol_select ${d}mol_view`,
        `\tvalue? \\`,
        `${d}mol_switch ${d}mol_view`,
        `\tvalue? \\`,
        `${d}mol_check_box ${d}mol_view`,
        `\tchecked? false`,
        `${d}mol_paragraph ${d}mol_view`,
        `\ttitle \\`,
        `${d}bog_vmap_part_cell ${d}mol_view`,
        `\tresult \\`,
        `${d}bog_vmap_part_plot ${d}mol_view`,
        `\tseries /`,
        `${d}bog_vmap_part_calc ${d}mol_view`,
        `\tresult 0`,
        `${d}bog_vmap_part_map ${d}mol_view`,
        `\tzoom 0`,
    ];
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
        ...$_1.$bog_vmap_app_flow_parts,
        ``,
    ].join('\n');
    $_1.$bog_vmap_app_flow_other = 'http://other.pack/';
    $_1.$bog_vmap_app_flow_other_pack = [
        `${d}shop_basket ${d}mol_view`,
        `\ttitle \\`,
        ``,
    ].join('\n');
    $_1.$bog_vmap_app_flow_ui = $bog_vmap_app_shelf_packs().find(offer => offer.id === 'builderui').link;
    $_1.$bog_vmap_app_flow_ui_pack = [
        `${d}bog_builderui_card ${d}mol_view`,
        `\ttitle \\`,
        ``,
    ].join('\n');
    $_1.$bog_vmap_app_flow_rect = {
        left: 200, top: 50, width: 600, height: 500, right: 800, bottom: 550,
    };
    $_1.$bog_vmap_app_flow_size = { width: 100, height: 50 };
    $_1.$bog_vmap_app_flow_board = { width: 400, height: 300 };
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
    let $bog_vmap_app_flow_last = null;
    let $bog_vmap_app_flow_host = null;
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
        $bog_vmap_app_flow_last?.destructor();
        $bog_vmap_app_flow_host?.remove();
        const host = dom.document.createElement('div');
        host.setAttribute('bog_vmap_app_flow_host', '');
        host.style.position = 'fixed';
        host.style.left = '-20000px';
        host.style.top = '0';
        dom.document.body.appendChild(host);
        $bog_vmap_app_flow_host = host;
        const timers = [];
        class $mol_after_timeout_flow extends $mol_after_timeout {
            constructor(delay, task) {
                super(delay, task);
                clearTimeout(this.id);
                timers.push(this);
            }
        }
        $.$mol_after_timeout = $mol_after_timeout_flow;
        const kept = {};
        class $mol_state_local_flow extends $mol_state_local {
            static value(key, next) {
                if (next === undefined)
                    return JSON.parse(kept[key] ?? 'null');
                if (next === null)
                    delete kept[key];
                else
                    kept[key] = JSON.stringify(next);
                return next;
            }
        }
        __decorate([
            $mol_mem_key
        ], $mol_state_local_flow, "value", null);
        $.$mol_state_local = $mol_state_local_flow;
        class $mol_fetch_flow extends $mol_fetch {
            static text(input) {
                const uri = String(input);
                if (uri === $_1.$bog_vmap_app_flow_other + 'web.view.tree')
                    return $_1.$bog_vmap_app_flow_other_pack;
                if (uri === $_1.$bog_vmap_app_flow_ui + 'web.view.tree')
                    return $_1.$bog_vmap_app_flow_ui_pack;
                if (uri.endsWith('web.view.tree'))
                    return $_1.$bog_vmap_app_flow_pack;
                return $mol_fail(new Error('network in a test: ' + uri));
            }
        }
        $.$mol_fetch = $mol_fetch_flow;
        const store = over.store ?? $bog_vmap_app_store.make({ $, doc_land_config: () => null });
        if (!over.store)
            store.doc_add('Сцена 1');
        const app = $bog_vmap_app.make({ $, store: () => store });
        $bog_vmap_app_flow_last = app;
        const posted = [];
        const queue = [];
        const direction = (name) => {
            const style = app.node().over_tree(name, 'style')?.kids[0] ?? null;
            return $bog_vmap_lang_dict_get(style, 'flexDirection')?.value
                ?? 'row'; // what `[mol_view]` is with no direction written
        };
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
        let silent = false;
        let exposed = false;
        const peer = {
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
        const deliver = (data) => {
            const event = new dom.MessageEvent('message', { data: { ns: $bog_vmap_bridge_ns, ...data } });
            Object.defineProperty(event, 'source', { value: peer });
            dom.dispatchEvent(event);
        };
        const scene = {
            posted,
            sent(kind) {
                return posted.filter(message => message.kind === kind);
            },
            last(kind) {
                return this.sent(kind).at(-1);
            },
            flush() {
                while (queue.length)
                    deliver(queue.shift());
                app.dom_tree();
            },
            values(values) {
                deliver({ kind: 'values', values });
                app.dom_tree();
            },
            silence() {
                silent = true;
                queue.length = 0;
            },
            pack_note(message) {
                deliver({ kind: 'error', at: 'pack', message });
                app.dom_tree();
            },
            hello() {
                deliver({ kind: 'ready' });
                app.dom_tree();
                this.flush();
            },
            expose() {
                exposed = true;
                app.dom_tree();
            },
        };
        const pane = app.Pane();
        pane.scene_peer = () => peer;
        const root = app.dom_tree();
        host.appendChild(root);
        const rect = $_1.$bog_vmap_app_flow_rect;
        pane.dom_node().getBoundingClientRect = () => rect;
        pane.view_rect = () => rect;
        pane.Touch().view_rect = () => rect;
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
            app, pane, store, scene, root, timers, kept,
            client(point) {
                return [rect.left + point[0], rect.top + point[1]];
            },
            text() {
                return root.textContent ?? '';
            },
            broken() {
                return [...root.querySelectorAll('[mol_view_error]')].map(el => el.getAttribute('id'));
            },
            button(title) {
                return found('[role=button]', `button «${title}»`, el => el.textContent?.startsWith(title) ?? false);
            },
            check(title) {
                return found('[role=checkbox]', `check «${title}»`, el => el.textContent?.includes(title) ?? false);
            },
            class_row(klass) {
                return found('[bog_vmap_app_palette_item]', `palette row ${klass}`, el => el.textContent === klass);
            },
            classes_open() {
                app.Shelf().classes_showed(true);
                app.dom_tree();
                scene.flush();
            },
            scene_row(title) {
                return found('[bog_vmap_app_scenes_scene_row]', `scene row ${title}`, el => el.textContent === title);
            },
            shelf_row(title) {
                return found('[bog_vmap_app_shelf_item_row]', `shelf row ${title}`, el => el.textContent === title);
            },
            pack_row(title) {
                return found('[bog_vmap_app_shelf_pack_row]', `pack row ${title}`, el => el.textContent === title);
            },
            lights_toggle() {
                return found('[bog_vmap_app_lights]', 'lights toggle', () => true);
            },
            theme_worn() {
                return root.getAttribute('mol_theme');
            },
            field(tail) {
                return found('input, textarea', `field ${tail}`, el => el.getAttribute('id')?.endsWith(tail) ?? false);
            },
            overlay() {
                return root.querySelector('[bog_vmap_app_pane_overlay]');
            },
            frame() {
                return root.querySelector('iframe');
            },
            type(el, value) {
                el.value = value;
                el.dispatchEvent(new dom.Event('input', { bubbles: true }));
                app.dom_tree();
                scene.flush();
            },
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
            drop(klass, point) {
                this.classes_open();
                this.press(this.class_row(klass), [10, 300]);
                dom.dispatchEvent(pointer('pointermove', point));
                this.release(this.overlay(), point);
                app.dom_tree();
                scene.flush();
            },
            tap(point, over = {}) {
                this.press(this.overlay(), point, over);
                this.release(this.overlay(), point, over);
                app.dom_tree();
                scene.flush();
            },
            part_center(name) {
                const box = pane.part_box(name);
                if (!box)
                    $mol_fail(new Error(`part ${name} is not measured`));
                return this.client([box.left + box.width / 2, box.top + box.height / 2]);
            },
            port_dot(name, port, side) {
                const box = pane.part_box(name);
                const index = pane.part_dots(name).findIndex(known => known.name === port);
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
(function ($_2) {
    const d = '$';
    const calc = `${d}flow_calc`;
    const map = `${d}flow_map`;
    const button = `${d}flow_button`;
    const number = `${d}mol_number`;
    $mol_test({
        'the editor opens with the head of its canvas, its palette and its canvas'($) {
            const stage = $_2.$bog_vmap_app_flow_stage($);
            stage.button('Новая сцена');
            stage.button('Удалить');
            stage.button('В библиотеку');
            const canvas = stage.pane.dom_node();
            const tools = stage.root.querySelector('[bog_vmap_app_canvas_tools]');
            for (const title of ['−', '100%', '+']) {
                $mol_assert_equal(tools.contains(stage.button(title)), true);
                $mol_assert_equal(canvas.contains(stage.button(title)), false);
            }
            $mol_assert_equal(canvas.querySelector('[role=button]'), null);
            const text = stage.text();
            $mol_assert_ok(text.includes('Полка'));
            $mol_assert_ok(text.includes('Свойства'));
            $mol_assert_ok(text.includes('100%'));
            $mol_assert_ok(text.includes('Выберите узел на холсте'));
            const shelf = [...stage.root.querySelectorAll('[bog_vmap_app_shelf_items] [bog_vmap_app_shelf_item_row]')].map(el => el.textContent);
            $mol_assert_like(shelf.slice(0, 6), [
                'Блок', 'Ячейка кода', 'График', 'Калькулятор', 'Карта', 'Калькулятор и карта',
            ]);
            $mol_assert_ok(shelf.includes('Поле'));
            $mol_assert_ok(shelf.includes('Выбор'));
            const apps = [...stage.root.querySelectorAll('[bog_vmap_app_shelf_app_list] [bog_vmap_app_shelf_item_row]')].map(el => el.textContent);
            $mol_assert_like(apps, [
                'Button', 'Calc', 'Map',
                'Vmap_part_cell', 'Vmap_part_plot', 'Vmap_part_calc', 'Vmap_part_map',
            ]);
            $mol_assert_equal(stage.root.querySelector('[bog_vmap_app_palette_class_row]'), null);
            stage.classes_open();
            const rows = [...stage.root.querySelectorAll('[bog_vmap_app_palette_class_row]')]
                .map(el => el.textContent);
            $mol_assert_like(rows, [
                `${d}mol_view`, button, calc, map,
                ...$_2.$bog_vmap_app_flow_parts.filter(line => line[0] === '$').map(line => line.split(' ')[0]),
            ]);
            $mol_assert_like(stage.broken(), [stage.pane.Scene(stage.pane.scene_key()).dom_id()]);
        },
        'a ready made pair lands wired, by one click on the shelf'($) {
            const stage = $_2.$bog_vmap_app_flow_stage($);
            stage.click(stage.shelf_row('Калькулятор и карта'));
            const node = stage.app.node();
            $mol_assert_like(node.sub_names(''), ['Pair']);
            $mol_assert_like(node.sub_names('Pair'), ['Calc', 'Map']);
            $mol_assert_like(Object.keys(stage.app.spots()), ['Pair']);
            const links = node.links();
            $mol_assert_equal(links.length, 1);
            $mol_assert_like([links[0].from, links[0].from_prop, links[0].to, links[0].to_prop], ['Calc', 'result', 'Map', 'zoom']);
            $mol_assert_equal(stage.scene.last('doc_set').src, stage.app.doc_source());
            $mol_assert_equal(stage.app.selected(), 'Pair');
        },
        'an application added by its address puts its objects on the shelf'($) {
            const stage = $_2.$bog_vmap_app_flow_stage($);
            stage.type(stage.field('Shelf().Links()'), $_2.$bog_vmap_app_flow_other);
            stage.scene.hello();
            const apps = [...stage.root.querySelectorAll('[bog_vmap_app_shelf_app_list] [bog_vmap_app_shelf_item_row]')].map(el => el.textContent);
            $mol_assert_like(apps, ['Basket']);
            stage.click(stage.shelf_row('Basket'));
            $mol_assert_ok(stage.app.doc_source().includes(`Basket ${d}shop_basket`));
            $mol_assert_equal(stage.app.selected(), 'Basket');
        },
        'a class carried from the palette becomes a part, picked and ready to press'($) {
            const stage = $_2.$bog_vmap_app_flow_stage($);
            stage.drop(calc, stage.client([200, 150]));
            const source = stage.app.doc_source();
            $mol_assert_ok(source.includes(`Calc ${calc}`));
            $mol_assert_ok(source.includes('<= Calc'));
            $mol_assert_like(stage.app.spots(), { Calc: { x: 200, y: 150 } });
            $mol_assert_equal(stage.scene.last('doc_set').src, source);
            $mol_assert_equal(stage.app.selected(), 'Calc');
            $mol_assert_ok(stage.root.querySelector('[bog_vmap_app_pane_handle]') !== null);
            stage.field("Row('result').Value().Num()");
            stage.tap(stage.part_center('Calc'));
            $mol_assert_equal(stage.app.selected(), 'Calc');
            const click = stage.scene.last('click_at');
            $mol_assert_equal(click.x, 250);
            $mol_assert_equal(click.y, 175);
        },
        'a value typed into the inspector goes into the document and to the scene'($) {
            const stage = $_2.$bog_vmap_app_flow_stage($);
            stage.drop(calc, stage.client([200, 150]));
            stage.tap(stage.part_center('Calc'));
            const before = stage.scene.sent('doc_set').length;
            stage.type(stage.field("Row('result').Value().Num()"), '42');
            const source = stage.app.doc_source();
            $mol_assert_ok(source.includes(`Calc ${calc} result 42`));
            $mol_assert_ok(source.includes('<= Calc'));
            $mol_assert_ok(stage.scene.sent('doc_set').length > before);
            $mol_assert_equal(stage.scene.last('doc_set').src, source);
        },
        'a wire drawn between two parts is written, labelled and unplugged'($) {
            const stage = $_2.$bog_vmap_app_flow_stage($);
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
            stage.scene.flush();
            $mol_assert_like(stage.scene.last('values_want').names, ['calc_result', 'Calc.result', 'Calc.op', 'Map.marker']);
            stage.scene.values({ calc_result: '42', 'Calc.result': '42', 'Calc.op': 'plus' });
            $mol_assert_like(stage.pane.wire_lines().map(line => [line.key, line.label]), [['Map.zoom', '42']]);
            $mol_assert_like(stage.pane.label_lines('Calc'), ['result: 42', 'op: plus']);
            stage.tap(stage.part_center('Map'));
            stage.press(overlay, stage.port_dot('Map', 'zoom', 'in'));
            stage.release(overlay, stage.client([550, 450]));
            stage.redraw();
            const after = stage.app.doc_source();
            $mol_assert_equal(after.includes('calc_result'), false);
            $mol_assert_like(stage.app.doc_wires(), []);
        },
        async 'a drag with the shift held writes a two way wire, and one undo takes it back'($) {
            const stage = $_2.$bog_vmap_app_flow_stage($);
            const history = stage.app.History();
            const stepped = async () => {
                const source = stage.app.doc_source();
                const taken = () => history.ring(history.doc_key()).at(-1)?.source === source;
                for (let i = 0; i < 10 && !taken(); ++i) {
                    stage.timers.filter(timer => timer.delay === history.step_delay()).at(-1)?.task();
                    await $_2.$bog_vmap_app_flow_settle(taken, 30);
                    stage.redraw();
                }
                $mol_assert_equal(taken(), true);
            };
            stage.drop(number, stage.client([100, 100]));
            stage.drop(number, stage.client([400, 100]));
            stage.tap(stage.part_center('Number'));
            await stepped();
            const before = stage.app.doc_source();
            const overlay = stage.overlay();
            const out = stage.port_dot('Number', 'value', 'out');
            const into = stage.port_dot('Number_2', 'value', 'in');
            stage.press(overlay, out, { shiftKey: true });
            stage.move(overlay, into, { shiftKey: true });
            stage.release(overlay, into, { shiftKey: true });
            stage.redraw();
            const source = stage.app.doc_source();
            $mol_assert_ok(source.includes('\tnumber_value? = Number value?\n'));
            $mol_assert_ok(source.includes('value? <=> number_value?\n'));
            $mol_assert_equal(stage.app.doc_wires()[0].bidi, true);
            $mol_assert_equal(stage.pane.Wire().label_text('Number_2.value'), '⇄');
            stage.scene.values({ number_value: '7' });
            $mol_assert_equal(stage.pane.Wire().label_text('Number_2.value'), '⇄ 7');
            await stepped();
            history.undo();
            stage.redraw();
            $mol_assert_equal(stage.app.doc_source(), before);
            $mol_assert_like(stage.app.doc_wires(), []);
        },
        async 'a published part comes back through the palette field'($) {
            const stage = $_2.$bog_vmap_app_flow_stage($);
            const library = $bog_vmap_app_publish_store.make({
                $,
                shelf_land_config: () => $.$giper_baza_glob.home().land(),
            });
            stage.app.Publish().store = () => library;
            stage.drop(button, stage.client([200, 150]));
            stage.tap(stage.part_center('Button'));
            stage.click(stage.button('В библиотеку'));
            const link = await $_2.$bog_vmap_app_flow_settle(() => library.link());
            stage.redraw();
            $mol_assert_ok(link);
            $mol_assert_ok(stage.text().includes('опубликовано'));
            $mol_assert_ok(stage.text().includes(link));
            stage.type(stage.field('Shelf().Links()'), link);
            $mol_assert_like(stage.app.lands(), [link]);
            $mol_assert_like(stage.app.lib_classes().map(tree => tree.type), [`${d}bog_vmap_pub_button`]);
            stage.drop(`${d}bog_vmap_pub_button`, stage.client([400, 300]));
            $mol_assert_ok(stage.app.doc_source().includes(` ${d}bog_vmap_pub_button\n`));
            $mol_assert_equal(Object.keys(stage.app.spots()).length, 2);
        },
        async 'a second scene is a document of its own and the first one comes back'($) {
            const stage = $_2.$bog_vmap_app_flow_stage($);
            stage.drop(calc, stage.client([200, 150]));
            const first = stage.store.doc_current().link().str;
            const source = stage.app.doc_source();
            stage.click(stage.button('Новая сцена'));
            await $_2.$bog_vmap_app_flow_settle(() => stage.store.doc_links().length > 1);
            stage.redraw();
            $mol_assert_equal(stage.store.doc_links().length, 2);
            $mol_assert_ok(stage.store.doc_current().link().str !== first);
            $mol_assert_equal(stage.app.doc_source(), `${stage.app.doc_root()} ${d}mol_view\n\tsub /\n`);
            $mol_assert_like(stage.app.spots(), {});
            const scenes = stage.app.Scenes();
            scenes.current(first);
            stage.redraw();
            $mol_assert_equal(stage.app.doc_source(), source);
            $mol_assert_like(stage.app.spots(), { Calc: { x: 200, y: 150 } });
        },
        'the frame is raised from markup and carries no address'($) {
            const stage = $_2.$bog_vmap_app_flow_stage($);
            const frame = stage.frame();
            $mol_assert_equal(frame.getAttribute('sandbox'), 'allow-scripts');
            $mol_assert_equal(frame.hasAttribute('src'), false);
            const html = frame.getAttribute('srcdoc') ?? '';
            const bundle = stage.app.scene_bundle();
            $mol_assert_ok(bundle.endsWith('/scene/web.js'));
            $mol_assert_ok(html.includes(`src="${bundle}"`));
            $mol_assert_ok(html.includes('color-scheme:dark'));
        },
        'the pack goes down the wire before the document and the libraries'($) {
            const stage = $_2.$bog_vmap_app_flow_stage($);
            const kinds = stage.scene.posted.map(message => message.kind);
            const pack = kinds.indexOf('pack_set');
            $mol_assert_ok(pack >= 0);
            $mol_assert_ok(pack < kinds.indexOf('doc_set'));
            $mol_assert_ok(pack < kinds.indexOf('libs_set'));
            $mol_assert_equal(stage.scene.last('pack_set')?.uri, stage.app.pack_script());
        },
        'a new pack gives a new frame, a new land keeps the old one'($) {
            const stage = $_2.$bog_vmap_app_flow_stage($);
            const field = stage.field('Shelf().Links()');
            const before = stage.frame();
            stage.type(field, 'http://pack.test/, AbCdEfGh');
            $mol_assert_ok(stage.frame() !== before);
            $mol_assert_like(stage.app.lands(), ['AbCdEfGh']);
            $mol_assert_equal(stage.pane.ready(), false);
            const seen = stage.scene.posted.length;
            stage.scene.hello();
            $mol_assert_equal(stage.pane.ready(), true);
            $mol_assert_equal(stage.scene.posted[seen]?.kind, 'pack_set');
            $mol_assert_equal(stage.scene.last('pack_set')?.uri, 'http://pack.test/web.js');
            const kept = stage.frame();
            stage.type(field, 'http://pack.test/, AbCdEfGh, ZyXwVuTs');
            $mol_assert_equal(stage.frame(), kept);
            $mol_assert_like(stage.app.lands(), ['AbCdEfGh', 'ZyXwVuTs']);
        },
        'a change of pack raises no false alarm about the scene'($) {
            const stage = $_2.$bog_vmap_app_flow_stage($);
            const watch = () => stage.timers.filter(timer => timer.delay === stage.pane.answer_limit()).length;
            stage.drop(calc, stage.client([200, 150]));
            $mol_assert_equal(stage.pane.warmed(), true);
            const sent = stage.scene.posted.length;
            const armed = watch();
            stage.type(stage.field('Shelf().Links()'), 'http://pack.test/');
            $mol_assert_equal(stage.pane.ready(), false);
            $mol_assert_equal(stage.scene.posted.length, sent);
            $mol_assert_equal(stage.pane.watchdog(), null);
            $mol_assert_equal(watch(), armed);
            $mol_assert_equal(stage.pane.stalled(), false);
            $mol_assert_equal(stage.text().includes('Сцена не отвечает'), false);
            stage.scene.hello();
            $mol_assert_equal(stage.pane.ready(), true);
            $mol_assert_equal(stage.scene.posted[sent]?.kind, 'pack_set');
            $mol_assert_equal(stage.scene.posted[sent]?.uri, 'http://pack.test/web.js');
        },
        'the palette field takes a pack with lands and says why it refuses a second'($) {
            const stage = $_2.$bog_vmap_app_flow_stage($);
            const field = stage.field('Shelf().Links()');
            stage.type(field, 'http://pack.test/, AbCdEfGh');
            $mol_assert_equal(stage.app.pack_link(), 'http://pack.test/');
            $mol_assert_like(stage.app.lands(), ['AbCdEfGh']);
            const key = stage.pane.scene_key();
            $mol_assert_equal(stage.pane.pack_uri(), 'http://pack.test/web.js');
            stage.type(field, 'http://pack.test/, AbCdEfGh, http://other.test/');
            $mol_assert_ok(stage.text().includes($bog_vmap_lib_links_reason.pack_second));
            $mol_assert_ok(stage.text().includes('http://other.test/'));
            $mol_assert_equal(stage.pane.scene_key(), key);
            $mol_assert_equal(stage.field('Shelf().Links()').value, 'http://pack.test/, AbCdEfGh, http://other.test/');
        },
        'delete takes the part out, and the camera leaves the document alone'($) {
            const stage = $_2.$bog_vmap_app_flow_stage($);
            stage.drop(calc, stage.client([100, 100]));
            stage.drop(map, stage.client([300, 100]));
            stage.tap(stage.part_center('Calc'));
            stage.click(stage.button('Удалить'));
            const source = stage.app.doc_source();
            $mol_assert_equal(source.includes('Calc'), false);
            $mol_assert_ok(source.includes(`Map ${map}`));
            $mol_assert_equal(stage.app.selected(), null);
            $mol_assert_like(Object.keys(stage.app.spots()), ['Map']);
            const overlay = stage.overlay();
            stage.press(overlay, stage.client([450, 400]));
            stage.move(overlay, stage.client([500, 430]));
            stage.release(overlay, stage.client([500, 430]));
            stage.redraw();
            $mol_assert_like([...stage.pane.camera_shift()], [50, 30]);
            stage.click(stage.button('+'));
            $mol_assert_ok(stage.text().includes('125%'));
            stage.click(stage.button('125%'));
            $mol_assert_ok(stage.text().includes('100%'));
            const size = $_2.$bog_vmap_app_flow_size;
            const shift = stage.pane.camera_shift();
            $mol_assert_like([300 + size.width / 2 + shift[0], 100 + size.height / 2 + shift[1]], [$_2.$bog_vmap_app_flow_rect.width / 2, $_2.$bog_vmap_app_flow_rect.height / 2]);
            $mol_assert_equal(stage.app.doc_source(), source);
        },
        'a page takes the parts dropped into it and stacks them the way it is set'($) {
            const stage = $_2.$bog_vmap_app_flow_stage($);
            stage.click(stage.button('Артборд'));
            $mol_assert_equal(stage.app.selected(), 'Page');
            const node = stage.app.node();
            $mol_assert_like(node.sub_names('Page'), []);
            const page = stage.pane.part_box('Page');
            $mol_assert_ok(page);
            const zoom = stage.pane.camera_zoom();
            const inside = (x, y) => stage.client([
                page.left + x * zoom,
                page.top + y * zoom,
            ]);
            stage.drop(calc, inside(200, 40));
            stage.drop(map, inside(200, 250));
            $mol_assert_like(node.sub_names('Page'), ['Calc', 'Map']);
            $mol_assert_like(Object.keys(stage.app.spots()), ['Page']);
            $mol_assert_equal(stage.app.doc_source().includes('\t\tsub /\n\t\t\t<= Calc\n\t\t\t<= Map\n'), true);
            stage.tap(inside(200, 250));
            $mol_assert_equal(stage.app.selected(), 'Page');
            stage.click(stage.check('рядом'));
            $mol_assert_ok(stage.app.doc_source().includes('flexDirection \\row'));
            $mol_assert_equal(stage.scene.last('doc_set').src, stage.app.doc_source());
            const first = stage.pane.part_box('Calc');
            const second = stage.pane.part_box('Map');
            $mol_assert_equal(first.top, second.top);
            $mol_assert_ok(second.left > first.left);
            stage.drop(button, inside(20, 20));
            $mol_assert_like(node.sub_names('Page'), ['Button', 'Calc', 'Map']);
        },
        'the sandbox comes up while the document of the address is still on its way'($) {
            const waiting = new Promise(() => { });
            const store = $bog_vmap_app_store.make({
                $,
                doc_land_config: () => null,
                source: () => { throw waiting; },
                spots: () => { throw waiting; },
                pack: () => { throw waiting; },
            });
            const stage = $_2.$bog_vmap_app_flow_stage($, { store });
            $mol_assert_ok(stage.frame().getAttribute('srcdoc'));
            $mol_assert_equal(stage.pane.ready(), true);
            $mol_assert_equal(stage.text().includes('сцена на связи'), false);
            $mol_assert_equal(stage.app.links(), '');
            stage.classes_open();
            stage.class_row(calc);
        },
        'a silent scene raises the strip and the button gives a fresh frame'($) {
            const stage = $_2.$bog_vmap_app_flow_stage($);
            stage.drop(calc, stage.client([200, 150]));
            $mol_assert_equal(stage.pane.stalled(), false);
            const frame = stage.frame();
            stage.scene.silence();
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
            $mol_assert_ok(stage.frame() !== frame);
        },
        'the stand keeps to its own corner and leaves the page it was opened on alone'($) {
            const dom = $.$mol_dom_context;
            const live = dom.document.createElement('div');
            live.setAttribute('id', 'flow_live_mark');
            dom.document.body.appendChild(live);
            const stage = $_2.$bog_vmap_app_flow_stage($);
            stage.drop(calc, stage.client([200, 150]));
            $mol_assert_equal(live.isConnected, true);
            $mol_assert_equal(stage.root.isConnected, true);
            $mol_assert_equal(stage.root.parentElement === dom.document.body, false);
            $_2.$bog_vmap_app_flow_stage($);
            $mol_assert_equal(live.isConnected, true);
            $mol_assert_equal(stage.root.isConnected, false);
            live.remove();
        },
        'a pack that never answers names itself in the header instead of a green lie'($) {
            const stage = $_2.$bog_vmap_app_flow_stage($);
            const note = 'Загрузка библиотеки компонентов… http://localhost:9080/bog/vmap/part/-/web.js';
            stage.drop(calc, stage.client([200, 150]));
            $mol_assert_ok(stage.text().includes('сцена на связи'));
            stage.scene.silence();
            stage.pane.warmed(false);
            stage.scene.pack_note(note);
            stage.redraw();
            $mol_assert_equal(stage.pane.pack_note(), note);
            $mol_assert_ok(stage.text().includes(note));
            $mol_assert_equal(stage.text().includes('сцена на связи'), false);
        },
        'a dead pack skips the pointless relaunch and the plate hands the default pack back'($) {
            const stage = $_2.$bog_vmap_app_flow_stage($);
            const dead = 'https://dead.test/';
            stage.drop(calc, stage.client([200, 150]));
            stage.app.links(dead);
            stage.scene.silence();
            stage.pane.warmed(false);
            stage.scene.pack_note('Загрузка библиотеки компонентов… ' + dead + 'web.js');
            stage.redraw();
            const generation = stage.pane.scene_generation();
            $mol_assert_ok(stage.pane.watchdog() !== null);
            const watch = stage.timers.filter(timer => timer.delay === stage.pane.cold_limit()).at(-1);
            $mol_assert_ok(watch);
            watch.task();
            stage.redraw();
            $mol_assert_equal(stage.pane.stalled(), true);
            $mol_assert_equal(stage.pane.restart_tries(), 0);
            $mol_assert_equal(stage.pane.scene_generation(), generation);
            $mol_assert_ok(stage.text().includes('верните пак по умолчанию'));
            stage.click(stage.button('Вернуть пак по умолчанию'));
            stage.redraw();
            $mol_assert_equal(stage.app.links(), '');
            $mol_assert_equal(stage.app.links_parsed().pack, null);
            $mol_assert_equal(stage.pane.scene_generation(), generation + 1);
            $mol_assert_equal(stage.pane.stalled(), false);
        },
        'the default pack comes back without taking the lands of the shelf with it'($) {
            const stage = $_2.$bog_vmap_app_flow_stage($);
            const land = 'AbCdEfGh';
            stage.app.links('https://dead.test/, ' + land);
            $mol_assert_like(stage.app.links_parsed().lands, [land]);
            stage.app.pack_default();
            $mol_assert_equal(stage.app.links(), land);
            $mol_assert_equal(stage.app.links_parsed().pack, null);
            $mol_assert_like(stage.app.links_parsed().lands, [land]);
        },
        'deleting a wired part leaves no wire to a node that is gone'($) {
            const stage = $_2.$bog_vmap_app_flow_stage($);
            stage.drop(calc, stage.client([100, 100]));
            stage.drop(map, stage.client([400, 100]));
            stage.tap(stage.part_center('Calc'));
            const overlay = stage.overlay();
            stage.press(overlay, stage.port_dot('Calc', 'result', 'out'));
            stage.move(overlay, stage.port_dot('Map', 'zoom', 'in'));
            stage.release(overlay, stage.port_dot('Map', 'zoom', 'in'));
            stage.redraw();
            $mol_assert_equal(stage.app.doc_wires().length, 1);
            stage.tap(stage.part_center('Calc'));
            stage.click(stage.button('Удалить'));
            $mol_assert_equal(stage.app.doc_source().includes('calc_result'), false);
            $mol_assert_like(stage.app.doc_wires(), []);
            $mol_assert_ok(stage.app.doc_source().includes(`Map ${map}`));
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
        'a file dropped on the canvas reaches the scene and the export by one address'($) {
            const uri = 'https://baza.test/?BAZA:file=TQzejQsT_m3PFV7J3;name=logo.png';
            const store = $bog_vmap_app_store.make({
                $,
                doc_land_config: () => null,
                asset_put: () => uri,
            });
            store.doc_add('Сцена 1');
            const stage = $_2.$bog_vmap_app_flow_stage($, { store });
            const dom = $.$mol_dom_context;
            const point = stage.client([300, 200]);
            const drop = new dom.Event('drop', { bubbles: true, cancelable: true });
            Object.defineProperty(drop, 'clientX', { value: point[0] });
            Object.defineProperty(drop, 'clientY', { value: point[1] });
            Object.defineProperty(drop, 'dataTransfer', {
                value: {
                    files: [new dom.File([new Uint8Array([137, 80, 78, 71])], 'logo.png', { type: 'image/png' })],
                },
            });
            stage.overlay().dispatchEvent(drop);
            stage.redraw();
            const source = stage.app.doc_source();
            $mol_assert_ok(source.includes(`uri \\${uri}`));
            $mol_assert_like(stage.app.spots(), { Image: { x: 300, y: 200 } });
            $mol_assert_equal(stage.app.selected(), 'Image');
            $mol_assert_equal(stage.scene.last('doc_set').src, source);
            const module = stage.app.export_state().module;
            const tree = module.files.find(file => file.name.endsWith('.view.tree')).text;
            $mol_assert_ok(tree.includes(`uri \\${uri}`));
        },
        'entering a node does not move the canvas down by a row'($) {
            const stage = $_2.$bog_vmap_app_flow_stage($);
            stage.drop(calc, stage.client([200, 150]));
            const column = stage.app.Canvas().body();
            stage.tap(stage.part_center('Calc'));
            stage.tap(stage.part_center('Calc'));
            stage.redraw();
            $mol_assert_ok(stage.app.inside_note());
            $mol_assert_equal(stage.pane.inside(), true);
            const after = stage.app.Canvas().body();
            $mol_assert_equal(after.length, column.length);
            for (let i = 0; i < column.length; ++i)
                $mol_assert_equal(after[i], column[i]);
            const note = stage.app.Inside_note().dom_node();
            $mol_assert_equal(stage.root.querySelector('[bog_vmap_app_canvas_foot]').contains(note), true);
            $mol_assert_equal(stage.root.querySelector('[bog_vmap_app_canvas_body]').contains(note), false);
        },
    });
})($ || ($ = {}));
(function ($_3) {
    const d = '$';
    const card = `${d}bog_builderui_card`;
    $mol_test({
        'the light switch is worn by the editor and told to the scene'($) {
            const stage = $_3.$bog_vmap_app_flow_stage($);
            $mol_assert_equal(stage.theme_worn(), '$mol_theme_dark');
            stage.click(stage.lights_toggle());
            $mol_assert_equal(stage.theme_worn(), '$mol_theme_light');
            $mol_assert_equal(stage.scene.last('theme_set').theme, '$mol_theme_light');
            stage.click(stage.lights_toggle());
            $mol_assert_equal(stage.theme_worn(), '$mol_theme_dark');
            $mol_assert_equal(stage.scene.last('theme_set').theme, '$mol_theme_dark');
        },
        'the light choice is kept under a key of this app, not one shared by the origin'($) {
            const stage = $_3.$bog_vmap_app_flow_stage($);
            stage.click(stage.lights_toggle());
            const keys = Object.keys(stage.kept);
            $mol_assert_equal(keys.length, 1);
            $mol_assert_ok(keys[0].startsWith('$bog_vmap_app'));
            $mol_assert_equal(stage.kept[keys[0]], 'true');
        },
        'the shell is a book of pages and the canvas carries its tools in its own head'($) {
            const stage = $_3.$bog_vmap_app_flow_stage($);
            const app = stage.app;
            $mol_assert_ok(stage.root.hasAttribute('mol_book2'));
            const head = stage.root.querySelector('[bog_vmap_app_canvas_head]');
            $mol_assert_ok(head.hasAttribute('mol_page_head'));
            $mol_assert_equal(app.Canvas().title(), 'Холст');
            const tools = stage.root.querySelector('[bog_vmap_app_canvas_tools]');
            const inside = (view) => tools.contains(view.dom_node());
            $mol_assert_ok(inside(app.Palette_check()));
            $mol_assert_ok(inside(app.Inspect_check()));
            $mol_assert_ok(inside(app.Code_check()));
            $mol_assert_ok(inside(app.History_check()));
            $mol_assert_ok(inside(app.Board()));
            $mol_assert_ok(inside(app.Delete()));
            $mol_assert_ok(inside(app.Root_name()));
            $mol_assert_ok(inside(app.Publish()));
            $mol_assert_ok(inside(app.Download()));
            $mol_assert_ok(inside(app.Zoom_out()));
            $mol_assert_ok(inside(app.Zoom_reset()));
            $mol_assert_ok(inside(app.Zoom_in()));
            $mol_assert_ok(inside(app.Lights()));
            $mol_assert_ok(inside(app.Status()));
            $mol_assert_ok(app.Canvas().body().includes(app.Pane()));
            $mol_assert_equal(stage.root.querySelector('[bog_vmap_app_canvas_foot]').childElementCount, 0);
        },
        'the percent in the canvas tools zooms and gives the view back'($) {
            const stage = $_3.$bog_vmap_app_flow_stage($);
            stage.pane.camera_shift(new $mol_vector_2d(700, 700));
            stage.redraw();
            stage.click(stage.button('+'));
            $mol_assert_equal(stage.pane.camera_zoom(), 1.25);
            $mol_assert_ok(stage.button('125%'));
            stage.click(stage.button('−'));
            $mol_assert_equal(stage.pane.camera_zoom(), 1);
            stage.click(stage.button('+'));
            stage.click(stage.button('125%'));
            $mol_assert_equal(stage.pane.camera_zoom(), 1);
            $mol_assert_like([...stage.pane.camera_shift()], [0, 0]);
            $mol_assert_ok(stage.button('100%'));
        },
        'each check in the canvas tools adds and removes its page'($) {
            const stage = $_3.$bog_vmap_app_flow_stage($);
            const app = stage.app;
            const showed = (page) => stage.root.contains(page.dom_node());
            $mol_assert_ok(showed(app.Scenes()));
            $mol_assert_ok(showed(app.Shelf()));
            $mol_assert_ok(showed(app.Idle()));
            $mol_assert_equal(showed(app.Code()), false);
            $mol_assert_equal(showed(app.History()), false);
            stage.click(app.Palette_check().dom_node());
            $mol_assert_equal(showed(app.Scenes()), false);
            $mol_assert_equal(showed(app.Shelf()), false);
            stage.click(app.Inspect_check().dom_node());
            $mol_assert_equal(showed(app.Idle()), false);
            stage.click(app.Code_check().dom_node());
            $mol_assert_ok(showed(app.Code()));
            stage.click(app.History_check().dom_node());
            $mol_assert_ok(showed(app.History()));
            stage.click(app.Palette_check().dom_node());
            $mol_assert_ok(showed(app.Scenes()));
            $mol_assert_ok(showed(app.Shelf()));
        },
        'the shelf offers the packs by name, and the current one is marked'($) {
            const stage = $_3.$bog_vmap_app_flow_stage($);
            const offers = [...stage.root.querySelectorAll('[bog_vmap_app_shelf_pack_row]')]
                .map(el => el.textContent);
            $mol_assert_like(offers, ['Детали vmap', 'Builderui']);
            const marked = () => [...stage.root.querySelectorAll('[bog_vmap_app_shelf_pack_current]')]
                .map(el => el.textContent);
            $mol_assert_like(marked(), ['Детали vmap']);
            stage.click(stage.pack_row('Builderui'));
            stage.scene.hello();
            $mol_assert_like(marked(), ['Builderui']);
        },
        'the pack chosen on the shelf is the one the scene is sent to load'($) {
            const stage = $_3.$bog_vmap_app_flow_stage($);
            stage.click(stage.pack_row('Builderui'));
            stage.scene.hello();
            $mol_assert_equal(stage.app.links(), $_3.$bog_vmap_app_flow_ui);
            $mol_assert_equal(stage.scene.last('pack_set').uri, $_3.$bog_vmap_app_flow_ui + 'web.js');
            const apps = [...stage.root.querySelectorAll('[bog_vmap_app_shelf_app_list] [bog_vmap_app_shelf_item_row]')].map(el => el.textContent);
            $mol_assert_like(apps, ['Builderui_card']);
        },
        'a class of the chosen pack lands on the canvas and gets measured'($) {
            const stage = $_3.$bog_vmap_app_flow_stage($);
            stage.click(stage.pack_row('Builderui'));
            stage.scene.hello();
            stage.drop(card, stage.client([200, 150]));
            $mol_assert_ok(stage.app.doc_source().includes(`Builderui_card ${card}`));
            $mol_assert_like(stage.app.spots(), { Builderui_card: { x: 200, y: 150 } });
            $mol_assert_like(stage.pane.part_box('Builderui_card'), {
                left: 200, top: 150, width: 100, height: 50,
            });
        },
        'a pack taken back gives the editor its own parts again'($) {
            const stage = $_3.$bog_vmap_app_flow_stage($);
            stage.click(stage.pack_row('Builderui'));
            stage.scene.hello();
            stage.click(stage.pack_row('Детали vmap'));
            stage.scene.hello();
            $mol_assert_equal(stage.app.links(), '');
            const apps = [...stage.root.querySelectorAll('[bog_vmap_app_shelf_app_list] [bog_vmap_app_shelf_item_row]')].map(el => el.textContent);
            $mol_assert_like(apps, [
                'Button', 'Calc', 'Map',
                'Vmap_part_cell', 'Vmap_part_plot', 'Vmap_part_calc', 'Vmap_part_map',
            ]);
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    const d = '$';
    function number_at(bytes, at, size) {
        let value = 0;
        for (let i = size - 1; i >= 0; --i)
            value = value * 256 + bytes[at + i];
        return value;
    }
    function text_at(bytes, at, size) {
        return new TextDecoder().decode(bytes.slice(at, at + size));
    }
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
        'the checksum is the one every reader computes'($) {
            $mol_assert_equal($.$bog_vmap_app_export_zip_crc32(new TextEncoder().encode('hello')), 907060870);
            $mol_assert_equal($.$bog_vmap_app_export_zip_crc32(new TextEncoder().encode('привет')), 779501134);
            $mol_assert_equal($.$bog_vmap_app_export_zip_crc32(new Uint8Array(0)), 0);
        },
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
        'every entry lies where the directory says it does'($) {
            const bytes = $.$bog_vmap_app_export_zip(module.files);
            for (const entry of entries_of(bytes)) {
                $mol_assert_equal(number_at(bytes, entry.offset, 4), 0x04034b50);
                const file = module.files.find(file => file.name === entry.name);
                $mol_assert_equal(body_of(bytes, entry.offset), file.text);
                $mol_assert_equal(entry.crc, $.$bog_vmap_app_export_zip_crc32(new TextEncoder().encode(file.text)));
            }
        },
        'non ascii text keeps its bytes'($) {
            const bytes = $.$bog_vmap_app_export_zip([
                { name: 'note.txt', text: 'привет' },
            ]);
            const entry = entries_of(bytes)[0];
            $mol_assert_equal(entry.size, 12);
            $mol_assert_equal(body_of(bytes, entry.offset), 'привет');
        },
        'names are marked as utf-8'($) {
            const bytes = $.$bog_vmap_app_export_zip(module.files);
            $mol_assert_equal(number_at(bytes, 6, 2), 0x0800);
        },
        'entries carry a valid date and the same bytes every time'($) {
            const bytes = $.$bog_vmap_app_export_zip(module.files);
            $mol_assert_equal(number_at(bytes, 12, 2), 0x0021);
            const again = $.$bog_vmap_app_export_zip(module.files);
            $mol_assert_equal(bytes.length, again.length);
            $mol_assert_equal([...bytes].join(), [...again].join());
        },
        'the archive carries the module folder'($) {
            const names = entries_of($.$bog_vmap_app_export_zip_archive(module))
                .map(entry => entry.name);
            $mol_assert_equal(names.join(' '), 'bog/site/site.view.tree bog/site/index.html');
        },
        'an empty list makes an empty archive'($) {
            const bytes = $.$bog_vmap_app_export_zip([]);
            $mol_assert_equal(bytes.length, 22);
            $mol_assert_equal(number_at(bytes, 0, 4), 0x06054b50);
            $mol_assert_equal(entries_of(bytes).length, 0);
        },
    });
})($ || ($ = {}));


//# sourceMappingURL=web.test.js.map
