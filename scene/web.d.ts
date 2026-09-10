declare let _$_: {
    new (): {};
} & typeof globalThis;
declare class $ extends _$_ {
}
declare namespace $ {
    export type $ = typeof $$;
    export class $$ extends $ {
        static $: $;
    }
    namespace $$ {
        type $$ = $;
    }
    export {};
}

declare namespace $ {
    var $mol_dom_context: typeof globalThis;
}

declare namespace $ {
}

declare namespace $ {
    var $mol_dom: typeof globalThis;
}

declare namespace $ {
    function $mol_style_attach(id: string, text: string): HTMLStyleElement | null;
}

declare namespace $ {
    class $mol_promise<Result = void> extends Promise<Result> {
        done: (value: Result | PromiseLike<Result>) => void;
        fail: (reason?: any) => void;
        constructor(executor?: (done: (value: Result | PromiseLike<Result>) => void, fail: (reason?: any) => void) => void);
    }
}

declare namespace $ {
    class $mol_promise_blocker<Result> extends $mol_promise<Result> {
        static [Symbol.toStringTag]: string;
    }
}

declare namespace $ {
    class $mol_decor<Value> {
        readonly value: Value;
        constructor(value: Value);
        prefix(): string;
        valueOf(): Value;
        postfix(): string;
        toString(): string;
    }
}

declare namespace $ {
    type $mol_style_unit_length = '%' | 'px' | 'cm' | 'mm' | 'Q' | 'in' | 'pc' | 'pt' | 'cap' | 'ch' | 'em' | 'rem' | 'ex' | 'ic' | 'lh' | 'rlh' | 'vh' | 'vw' | 'vi' | 'vb' | 'vmin' | 'vmax';
    type $mol_style_unit_angle = 'deg' | 'rad' | 'grad' | 'turn';
    type $mol_style_unit_time = 's' | 'ms';
    type $mol_style_unit_any = $mol_style_unit_length | $mol_style_unit_angle | $mol_style_unit_time;
    type $mol_style_unit_str<Quanity extends $mol_style_unit_any = $mol_style_unit_any> = `${number}${Quanity}`;
    /**
     * CSS Units
     * @see https://mol.hyoo.ru/#!section=docs/=xwq9q5_f966fg
     */
    class $mol_style_unit<Literal extends $mol_style_unit_any> extends $mol_decor<number> {
        readonly literal: Literal;
        constructor(value: number, literal: Literal);
        postfix(): Literal;
        static per(value: number): `${number}%`;
        static px(value: number): `${number}px`;
        static mm(value: number): `${number}mm`;
        static cm(value: number): `${number}cm`;
        static Q(value: number): `${number}Q`;
        static in(value: number): `${number}in`;
        static pc(value: number): `${number}pc`;
        static pt(value: number): `${number}pt`;
        static cap(value: number): `${number}cap`;
        static ch(value: number): `${number}ch`;
        static em(value: number): `${number}em`;
        static rem(value: number): `${number}rem`;
        static ex(value: number): `${number}ex`;
        static ic(value: number): `${number}ic`;
        static lh(value: number): `${number}lh`;
        static rlh(value: number): `${number}rlh`;
        static vh(value: number): `${number}vh`;
        static vw(value: number): `${number}vw`;
        static vi(value: number): `${number}vi`;
        static vb(value: number): `${number}vb`;
        static vmin(value: number): `${number}vmin`;
        static vmax(value: number): `${number}vmax`;
        static deg(value: number): `${number}deg`;
        static rad(value: number): `${number}rad`;
        static grad(value: number): `${number}grad`;
        static turn(value: number): `${number}turn`;
        static s(value: number): `${number}s`;
        static ms(value: number): `${number}ms`;
    }
}

declare namespace $ {
    type $mol_style_func_name = 'calc' | 'hsla' | 'rgba' | 'var' | 'clamp' | 'scale' | 'cubic-bezier' | 'linear' | 'steps' | $mol_style_func_image | $mol_style_func_filter;
    type $mol_style_func_image = 'url' | 'linear-gradient' | 'radial-gradient' | 'conic-gradient';
    type $mol_style_func_filter = 'blur' | 'brightness' | 'contrast' | 'drop-shadow' | 'grayscale' | 'hue-rotate' | 'invert' | 'opacity' | 'sepia' | 'saturate';
    /**
     * CSS Functions
     * @see https://mol.hyoo.ru/#!section=docs/=xwq9q5_f966fg
     */
    class $mol_style_func<Name extends $mol_style_func_name, Value = unknown> extends $mol_decor<Value> {
        readonly name: Name;
        constructor(name: Name, value: Value);
        prefix(): string;
        postfix(): string;
        static linear_gradient<Value>(value: Value): $mol_style_func<"linear-gradient", Value>;
        static radial_gradient<Value>(value: Value): $mol_style_func<"radial-gradient", Value>;
        static calc<Value>(value: Value): $mol_style_func<"calc", Value>;
        static vary<Name extends string, Value extends string>(name: Name, defaultValue?: Value): $mol_style_func<"var", Name | (Name | Value)[]>;
        static url<Href extends string>(href: Href): $mol_style_func<"url", string>;
        static hsla(hue: number | $mol_style_func<'var'>, saturation: number, lightness: number, alpha: number): $mol_style_func<"hsla", (number | `${number}%` | $mol_style_func<"var", unknown>)[]>;
        static clamp(min: $mol_style_unit_str<any>, mid: $mol_style_unit_str<any>, max: $mol_style_unit_str<any>): $mol_style_func<"clamp", `${number}${any}`[]>;
        static rgba(red: number | $mol_style_func<'var'>, green: number | $mol_style_func<'var'>, blue: number | $mol_style_func<'var'>, alpha: number | $mol_style_func<'var'>): $mol_style_func<"rgba", (number | $mol_style_func<"var", unknown>)[]>;
        static scale(zoom: number): $mol_style_func<"scale", number[]>;
        static linear(...breakpoints: Array<number | [number, number | $mol_style_unit_str<'%'>]>): $mol_style_func<"linear", string[]>;
        static cubic_bezier(x1: number, y1: number, x2: number, y2: number): $mol_style_func<"cubic-bezier", number[]>;
        static steps(value: number, step_position: 'jump-start' | 'jump-end' | 'jump-none' | 'jump-both' | 'start' | 'end'): $mol_style_func<"steps", (number | "end" | "start" | "jump-start" | "jump-end" | "jump-none" | "jump-both")[]>;
        static blur(value?: $mol_style_unit_str<$mol_style_unit_length>): $mol_style_func<"blur", string>;
        static brightness(value?: number | $mol_style_unit_str<'%'>): $mol_style_func<"brightness", string | number>;
        static contrast(value?: number | $mol_style_unit_str<'%'>): $mol_style_func<"contrast", string | number>;
        static drop_shadow(color: $mol_style_properties_color, x_offset: $mol_style_unit_str<$mol_style_unit_length>, y_offset: $mol_style_unit_str<$mol_style_unit_length>, blur_radius?: $mol_style_unit_str<$mol_style_unit_length>): $mol_style_func<"drop-shadow", readonly [$mol_style_properties_color, `${number}%` | `${number}px` | `${number}mm` | `${number}cm` | `${number}Q` | `${number}in` | `${number}pc` | `${number}pt` | `${number}cap` | `${number}ch` | `${number}em` | `${number}rem` | `${number}ex` | `${number}ic` | `${number}lh` | `${number}rlh` | `${number}vh` | `${number}vw` | `${number}vi` | `${number}vb` | `${number}vmin` | `${number}vmax`, `${number}%` | `${number}px` | `${number}mm` | `${number}cm` | `${number}Q` | `${number}in` | `${number}pc` | `${number}pt` | `${number}cap` | `${number}ch` | `${number}em` | `${number}rem` | `${number}ex` | `${number}ic` | `${number}lh` | `${number}rlh` | `${number}vh` | `${number}vw` | `${number}vi` | `${number}vb` | `${number}vmin` | `${number}vmax`, `${number}%` | `${number}px` | `${number}mm` | `${number}cm` | `${number}Q` | `${number}in` | `${number}pc` | `${number}pt` | `${number}cap` | `${number}ch` | `${number}em` | `${number}rem` | `${number}ex` | `${number}ic` | `${number}lh` | `${number}rlh` | `${number}vh` | `${number}vw` | `${number}vi` | `${number}vb` | `${number}vmin` | `${number}vmax`] | readonly [$mol_style_properties_color, `${number}%` | `${number}px` | `${number}mm` | `${number}cm` | `${number}Q` | `${number}in` | `${number}pc` | `${number}pt` | `${number}cap` | `${number}ch` | `${number}em` | `${number}rem` | `${number}ex` | `${number}ic` | `${number}lh` | `${number}rlh` | `${number}vh` | `${number}vw` | `${number}vi` | `${number}vb` | `${number}vmin` | `${number}vmax`, `${number}%` | `${number}px` | `${number}mm` | `${number}cm` | `${number}Q` | `${number}in` | `${number}pc` | `${number}pt` | `${number}cap` | `${number}ch` | `${number}em` | `${number}rem` | `${number}ex` | `${number}ic` | `${number}lh` | `${number}rlh` | `${number}vh` | `${number}vw` | `${number}vi` | `${number}vb` | `${number}vmin` | `${number}vmax`]>;
        static grayscale(value?: number | $mol_style_unit_str<'%'>): $mol_style_func<"grayscale", string | number>;
        static hue_rotate(value?: 0 | $mol_style_unit_str<$mol_style_unit_angle>): $mol_style_func<"hue-rotate", string | 0>;
        static invert(value?: number | $mol_style_unit_str<'%'>): $mol_style_func<"invert", string | number>;
        static opacity(value?: number | $mol_style_unit_str<'%'>): $mol_style_func<"opacity", string | number>;
        static sepia(value?: number | $mol_style_unit_str<'%'>): $mol_style_func<"sepia", string | number>;
        static saturate(value?: number | $mol_style_unit_str<'%'>): $mol_style_func<"saturate", string | number>;
    }
}

declare namespace $ {
    /** Replaces properties of `Base` record by properties from `Over`. */
    type $mol_type_override<Base, Over> = Omit<Base, keyof Over> & Over;
}

declare namespace $ {
    export type $mol_style_properties = Partial<$mol_type_override<CSSStyleDeclaration, Overrides>>;
    type Common = 'inherit' | 'initial' | 'unset' | 'revert' | 'revert-layer' | 'none' | $mol_style_func<'var'>;
    type Portion = `${number}${'%'}` | number;
    type Space = '' | ' ';
    type Var = `var(--${string})`;
    type Calc = `calc(${string})`;
    type Angle = number | `${number}${'deg' | 'turn'}` | Var | Calc | 'none';
    export type $mol_style_properties_color = 'aliceblue' | 'antiquewhite' | 'aqua' | 'aquamarine' | 'azure' | 'beige' | 'bisque' | 'black' | 'blanchedalmond' | 'blue' | 'blueviolet' | 'brown' | 'burlywood' | 'cadetblue' | 'chartreuse' | 'chocolate' | 'coral' | 'cornflowerblue' | 'cornsilk' | 'crimson' | 'cyan' | 'darkblue' | 'darkcyan' | 'darkgoldenrod' | 'darkgray' | 'darkgreen' | 'darkgrey' | 'darkkhaki' | 'darkmagenta' | 'darkolivegreen' | 'darkorange' | 'darkorchid' | 'darkred' | 'darksalmon' | 'darkseagreen' | 'darkslateblue' | 'darkslategrey' | 'darkturquoise' | 'darkviolet' | 'deeppink' | 'deepskyblue' | 'dimgray' | 'dimgrey' | 'dodgerblue' | 'firebrick' | 'floralwhite' | 'forestgreen' | 'fuchsia' | 'gainsboro' | 'ghostwhite' | 'gold' | 'goldenrod' | 'gray' | 'green' | 'greenyellow' | 'grey' | 'honeydew' | 'hotpink' | 'indianred' | 'indigo' | 'ivory' | 'khaki' | 'lavender' | 'lavenderblush' | 'lawngreen' | 'lemonchiffon' | 'lightblue' | 'lightcoral' | 'lightcyan' | 'lightgoldenrodyellow' | 'lightgray' | 'lightgreen' | 'lightgrey' | 'lightpink' | 'lightsalmon' | 'lightseagreen' | 'lightskyblue' | 'lightslategray' | 'lightslategrey' | 'lightsteelblue' | 'lightyellow' | 'lime' | 'limegreen' | 'linen' | 'magenta' | 'maroon' | 'mediumaquamarine' | 'mediumblue' | 'mediumorchid' | 'mediumpurple' | 'mediumseagreen' | 'mediumslateblue' | 'mediumspringgreen' | 'mediumturquoise' | 'mediumvioletred' | 'midnightblue' | 'mintcream' | 'mistyrose' | 'moccasin' | 'navajowhite' | 'navy' | 'oldlace' | 'olive' | 'olivedrab' | 'orange' | 'orangered' | 'orchid' | 'palegoldenrod' | 'palegreen' | 'paleturquoise' | 'palevioletred' | 'papayawhip' | 'peachpuff' | 'peru' | 'pink' | 'plum' | 'powderblue' | 'purple' | 'rebeccapurple' | 'red' | 'rosybrown' | 'royalblue' | 'saddlebrown' | 'salmon' | 'sandybrown' | 'seagreen' | 'seashell' | 'sienna' | 'silver' | 'skyblue' | 'slateblue' | 'slategray' | 'slategrey' | 'snow' | 'springgreen' | 'steelblue' | 'tan' | 'teal' | 'thistle' | 'tomato' | 'turquoise' | 'violet' | 'wheat' | 'white' | 'whitesmoke' | 'yellow' | 'yellowgreen' | 'transparent' | 'currentcolor' | $mol_style_func<'hsla' | 'rgba' | 'var'> | `#${string}` | `hsl(${Space}${Angle} ${Portion} ${Portion}${'' | `${Space}/${Space}${Portion}`}${Space})`;
    type Length = 0 | `${number}${$mol_style_unit_length}` | $mol_style_func<'calc' | 'var' | 'clamp'>;
    type Size = 'auto' | 'max-content' | 'min-content' | 'fit-content' | Length | Common;
    type Sides<Value> = {
        top?: Value;
        right?: Value;
        bottom?: Value;
        left?: Value;
        blockStart?: Value;
        blockEnd?: Value;
        inlineStart?: Value;
        inlineEnd?: Value;
    };
    type Directions<Value> = Value | readonly [Value, Value] | Sides<Value>;
    type Edges<Value> = {
        topLeft?: Value;
        topRight?: Value;
        bottomLeft?: Value;
        bottomRight?: Value;
    };
    type Borders<Value> = Value | readonly [Value, Value] | (Sides<Value> & Edges<Value>);
    type Single_animation_composition = 'replace' | 'add' | 'accumulate';
    type Single_animation_direction = 'normal' | 'reverse' | 'alternate' | 'alternate-reverse';
    type Single_animation_fill_mode = 'none' | 'forwards' | 'backwards' | 'both';
    type Single_animation_iteration_count = 'infinite' | number;
    type Single_animation_play_state = 'running' | 'paused';
    type Easing_function = Linear_easing_function | Cubic_bezier_easing_function | Step_easing_function;
    type Linear_easing_function = 'linear' | $mol_style_func<'linear'>;
    type Cubic_bezier_easing_function = 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | $mol_style_func<'cubic-bezier'>;
    type Step_easing_function = 'step-start' | 'step-end' | $mol_style_func<'steps'>;
    type Compat_auto = 'searchfield' | 'textarea' | 'push-button' | 'slider-horizontal' | 'checkbox' | 'radio' | 'menulist' | 'listbox' | 'meter' | 'progress-bar' | 'button';
    type Compat_special = 'textfield' | 'menulist-button';
    type Mix_blend_mode = Blend_mode | 'plus-darker' | 'plus-lighter';
    type Blend_mode = 'normal' | 'multiply' | 'screen' | 'overlay' | 'darken' | 'lighten' | 'color-dodge' | 'color-burn' | 'hard-light' | 'soft-light' | 'difference' | 'exclusion' | 'hue' | 'saturation' | 'color' | 'luminosity';
    type Box = 'border-box' | 'padding-box' | 'content-box';
    type Baseline_position = 'baseline' | `${'first' | 'last'} baseline`;
    type Content_distribution = 'space-between' | 'space-around' | 'space-evenly' | 'stretch';
    type Self_position = 'center' | 'start' | 'end' | 'self-start' | 'self-end' | 'flex-start' | 'flex-end';
    type Content_position = 'center' | 'start' | 'end' | 'flex-start' | 'flex-end';
    type Span_align = 'none' | 'start' | 'end' | 'center' | $mol_style_func<'var'>;
    type Snap_axis = 'x' | 'y' | 'block' | 'inline' | 'both' | $mol_style_func<'var'>;
    type Overflow = 'visible' | 'hidden' | 'clip' | 'scroll' | 'auto' | 'overlay' | Common;
    type Overflow_position = 'unsafe' | 'safe';
    type ContainRule = 'size' | 'layout' | 'style' | 'paint' | $mol_style_func<'var'>;
    type Repeat = 'repeat-x' | 'repeat-y' | 'repeat' | 'space' | 'round' | 'no-repeat' | $mol_style_func<'var'>;
    type BG_size = Length | 'auto' | 'contain' | 'cover';
    interface Overrides {
        /**
         * Sets the accent color for user-interface controls generated by some elements.
         * @see https://developer.mozilla.org/en-US/docs/Web/CSS/accent-color
         */
        accentColor?: $mol_style_properties_color | Common;
        align?: {
            /**
             * Distribution of space between and around content items along a flexbox's cross-axis or a grid's block axis.
             * @see https://developer.mozilla.org/en-US/docs/Web/CSS/align-content
             */
            content?: 'normal' | Baseline_position | Content_distribution | Content_position | `${Overflow_position} ${Content_position}` | Common;
            /**
             * Sets the align-self value on all direct children as a group.
             * In Flexbox, it controls the alignment of items on the Cross Axis.
             * In Grid Layout, it controls the alignment of items on the Block Axis within their grid area.
             * @see https://developer.mozilla.org/en-US/docs/Web/CSS/align-items
             */
            items?: 'normal' | 'stretch' | Baseline_position | Self_position | `${Overflow_position} ${Self_position}` | Common;
            /**
             * Overrides a grid or flex item's align-items value.
             * In Grid, it aligns the item inside the grid area.
             * In Flexbox, it aligns the item on the cross axis.
             * @see https://developer.mozilla.org/en-US/docs/Web/CSS/align-self
             */
            self?: 'auto' | 'normal' | 'stretch' | Baseline_position | Self_position | `${Overflow_position} ${Self_position}` | Common;
        };
        justify?: {
            /**
             * Distribution of space between and around content items along the main-axis of a flex container, and the inline axis of a grid container.
             * @see https://developer.mozilla.org/en-US/docs/Web/CSS/justify-content
             */
            content?: 'normal' | Baseline_position | Content_distribution | Content_position | `${Overflow_position} ${Content_position}` | Common;
            /**
             * Sets the justify-self value on all direct children as a group.
             * @see https://developer.mozilla.org/en-US/docs/Web/CSS/justify-items
             */
            items?: 'normal' | 'stretch' | Baseline_position | Self_position | `${Overflow_position} ${Self_position}` | Common;
            /**
             * Way a box is justified inside its alignment container along the appropriate axis.
             * @see https://developer.mozilla.org/en-US/docs/Web/CSS/justify-self
             */
            self?: 'auto' | 'normal' | 'stretch' | Baseline_position | Self_position | `${Overflow_position} ${Self_position}` | Common;
        };
        /**
         * resets all of an element's properties except unicode-bidi, direction, and CSS Custom Properties.
         * It can set properties to their initial or inherited values, or to the values specified in another cascade layer or stylesheet origin.
         * @see https://developer.mozilla.org/en-US/docs/Web/CSS/all
         */
        all?: Common;
        animation?: {
            /**
             * Specifies the composite operation to use when multiple animations affect the same property simultaneously.
             * @see https://developer.mozilla.org/en-US/docs/Web/CSS/animation-composition
             */
            composition?: Single_animation_composition | Single_animation_composition[][] | Common;
            /**
             * Specifies the amount of time to wait from applying the animation to an element before beginning to perform the animation.
             * The animation can start later, immediately from its beginning, or immediately and partway through the animation.
             * @see https://developer.mozilla.org/en-US/docs/Web/CSS/animation-delay
             */
            delay?: $mol_style_unit_str<$mol_style_unit_time> | $mol_style_unit_str<$mol_style_unit_time>[][] | Common;
            /**
             * Sets whether an animation should play forward, backward, or alternate back and forth between playing the sequence forward and backward.
             * @see https://developer.mozilla.org/en-US/docs/Web/CSS/animation-direction
             */
            direction?: Single_animation_direction | Single_animation_direction[][] | Common;
            /**
             * Sets the length of time that an animation takes to complete one cycle.
             * @see https://developer.mozilla.org/en-US/docs/Web/CSS/animation-duration
             */
            duration?: $mol_style_unit_str<$mol_style_unit_time> | $mol_style_unit_str<$mol_style_unit_time>[][] | Common;
            /**
             * Sets how a CSS animation applies styles to its target before and after its execution.
             * @see https://developer.mozilla.org/en-US/docs/Web/CSS/animation-fill-mode
             */
            fillMode?: Single_animation_fill_mode | Single_animation_fill_mode[][] | Common;
            /**
             * Sets the number of times an animation sequence should be played before stopping.
             * @see https://developer.mozilla.org/en-US/docs/Web/CSS/animation-iteration-count
             */
            iterationCount?: Single_animation_iteration_count | Single_animation_iteration_count[][] | Common;
            /**
             * Specifies the names of one or more keyframes at-rules that describe the animation to apply to an element.
             * Multiple keyframe at-rules are specified as a comma-separated list of names.
             * If the specified name does not match any keyframe at-rule, no properties are animated.
             * @see https://developer.mozilla.org/en-US/docs/Web/CSS/animation-name
             */
            name?: 'none' | string & {} | ('none' | string & {})[][] | Common;
            /**
             * Sets whether an animation is running or paused.
             * @see https://developer.mozilla.org/en-US/docs/Web/CSS/animation-play-state
             */
            playState?: Single_animation_play_state | Single_animation_play_state[][] | Common;
            /**
             * Sets how an animation progresses through the duration of each cycle.
             * @see https://developer.mozilla.org/en-US/docs/Web/CSS/animation-timing-function
             */
            timingFunction?: Easing_function | Easing_function[][] | Common;
        };
        /**
         * Used to control native appearance of UI controls, that are based on operating system's theme.
         * @see https://developer.mozilla.org/en-US/docs/Web/CSS/appearance
         */
        appearance?: 'none' | 'auto' | Compat_auto | Compat_special | Common;
        /**
         * Sets a preferred aspect ratio for the box, which will be used in the calculation of auto sizes and some other layout functions.
         * @see https://developer.mozilla.org/en-US/docs/Web/CSS/aspect-ratio
         */
        aspectRatio?: 'auto' | number | `${number} / ${number}`;
        /**
         * lets you apply graphical effects such as blurring or color shifting to the area behind an element.
         * Because it applies to everything behind the element, to see the effect you must make the element
         * or its background at least partially transparent.
         * @see https://developer.mozilla.org/en-US/docs/Web/CSS/backdrop-filter
         */
        backdropFilter: $mol_style_func<$mol_style_func_filter> | $mol_style_func<'url'> | ($mol_style_func<$mol_style_func_filter> | $mol_style_func<'url'>)[][] | 'none' | Common;
        /**
         * Sets whether the back face of an element is visible when turned towards the user.
         * @see https://developer.mozilla.org/en-US/docs/Web/CSS/backface-visibility
         */
        backfaceVisibility: 'visible' | 'hidden' | Common;
        /**
         * How the browser distributes space between and around content items along the main-axis of a flex container, and the inline axis of a grid container.
         * @see https://developer.mozilla.org/ru/docs/Web/CSS/justify-content
         */
        justifyContent?: 'start' | 'end' | 'flex-start' | 'flex-end' | 'left' | 'right' | 'space-between' | 'space-around' | 'space-evenly' | 'normal' | 'stretch' | 'center' | Common;
        /** @see https://developer.mozilla.org/en-US/docs/Web/CSS/gap */
        gap?: Length | readonly [Length, Length] | Common;
        /**
         * All background style properties.
         * @see https://developer.mozilla.org/ru/docs/Web/CSS/background
         * */
        background?: 'none' | {
            /**
             * Sets whether a background image's position is fixed within the viewport, or scrolls with its containing block.
             * @see https://developer.mozilla.org/en-US/docs/Web/CSS/background-attachment
             */
            attachment?: 'scroll' | 'fixed' | 'local' | ('scroll' | 'fixed' | 'local')[][] | Common;
            /**
             * Sets how an element's background images should blend with each other and with the element's background color.
             * @see https://developer.mozilla.org/en-US/docs/Web/CSS/background-blend-mode
             */
            blendMode?: Mix_blend_mode | Mix_blend_mode[][] | Common;
            /**
             * Sets whether an element's background extends underneath its border box, padding box, or content box.
             * @see https://developer.mozilla.org/en-US/docs/Web/CSS/background-clip
             */
            clip?: Box | Box[][] | Common;
            /**
             * Background color.
             * @see https://developer.mozilla.org/ru/docs/Web/CSS/background-color
             */
            color?: $mol_style_properties_color | Common;
            /**
             * Background images.
             * @see https://developer.mozilla.org/ru/docs/Web/CSS/background-image
             */
            image?: readonly (readonly [$mol_style_func<$mol_style_func_image> | string & {}])[] | 'none' | Common;
            /**
             * How background images are repeated.
             * @see https://developer.mozilla.org/ru/docs/Web/CSS/background-repeat
             */
            repeat?: Repeat | [Repeat, Repeat] | Common;
            /** @see https://developer.mozilla.org/ru/docs/Web/CSS/background-position */
            position?: 'left' | 'right' | 'top' | 'bottom' | 'center' | Common;
            /** @see https://developer.mozilla.org/ru/docs/Web/CSS/background-size */
            size?: (BG_size | [BG_size] | [BG_size, BG_size])[];
        };
        /** @see https://developer.mozilla.org/ru/docs/Web/CSS/box-shadow */
        box?: {
            /**
             * Shadow effects around an element's frame.
             * @see https://developer.mozilla.org/ru/docs/Web/CSS/box-shadow
             */
            shadow?: readonly ([
                ...[inset: 'inset'] | [],
                x: Length,
                y: Length,
                blur: Length,
                spread: Length,
                color: $mol_style_properties_color
            ] | {
                inset?: boolean;
                x: Length;
                y: Length;
                blur: Length;
                spread: Length;
                color: $mol_style_properties_color;
            })[] | 'none' | Common;
        };
        /** @see https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/rx */
        rx?: Length | Common;
        /** @see https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/ry */
        ry?: Length | Common;
        /** @see https://developer.mozilla.org/ru/docs/Web/CSS/font */
        font?: {
            /**
             * Whether a font should be styled.
             * @see https://developer.mozilla.org/ru/docs/Web/CSS/font-style
             */
            style?: 'normal' | 'italic' | Common;
            /**
             * Weight (or boldness) of the font.
             * @see https://developer.mozilla.org/ru/docs/Web/CSS/font-weight
             */
            weight?: 'normal' | 'bold' | 'lighter' | 'bolder' | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | Common;
            /**
             * Size of the font. Changing the font size also updates the sizes of the font size-relative length units.
             * @see https://developer.mozilla.org/ru/docs/Web/CSS/font-size
             */
            size?: 'xx-small' | 'x-small' | 'small' | 'medium' | 'large' | 'x-large' | 'xx-large' | 'xxx-large' | 'smaller' | 'larger' | Length | Common;
            /**
             * Prioritized list of one or more font family names and/or generic family names.
             * @see https://developer.mozilla.org/ru/docs/Web/CSS/font-family
             */
            family?: string & {} | 'serif' | 'sans-serif' | 'monospace' | 'cursive' | 'fantasy' | 'system-ui' | 'ui-serif' | 'ui-sans-serif' | 'ui-monospace' | 'ui-rounded' | 'emoji' | 'math' | 'fangsong' | Common;
        };
        /**
         * Foreground color value of text and text decorations, and sets the `currentcolor` value.
         * @see https://developer.mozilla.org/en-US/docs/Web/CSS/color
         */
        color?: $mol_style_properties_color | Common;
        /**
         * Whether an element is treated as a block or inline element and the layout used for its children, such as flow layout, grid or flex.
         * @see https://developer.mozilla.org/en-US/docs/Web/CSS/display
         */
        display?: 'block' | 'inline' | 'run-in' | 'list-item' | 'none' | 'flow' | 'flow-root' | 'table' | 'flex' | 'grid' | 'contents' | 'table-row-group' | 'table-header-group' | 'table-footer-group' | 'table-column-group' | 'table-row' | 'table-cell' | 'table-column' | 'table-caption' | 'inline-block' | 'inline-table' | 'inline-flex' | 'inline-grid' | 'ruby' | 'ruby-base' | 'ruby-text' | 'ruby-base-container' | 'ruby-text-container' | Common;
        /**
         * What to do when an element's content is too big to fit in its block formatting context. It is a shorthand for `overflowX` and `overflowY`.
         * @see https://developer.mozilla.org/en-US/docs/Web/CSS/overflow
         */
        overflow?: Overflow | {
            /**
             * What shows when content overflows a block-level element's left and right edges.
             * @see https://developer.mozilla.org/en-US/docs/Web/CSS/overflow-x
             */
            x?: Overflow | Common;
            /**
             * What shows when content overflows a block-level element's top and bottom edges.
             * @see https://developer.mozilla.org/en-US/docs/Web/CSS/overflow-y
             */
            y?: Overflow | Common;
            /**
             * A way to opt out of the browser's scroll anchoring behavior, which adjusts scroll position to minimize content shifts.
             * @see https://developer.mozilla.org/en-US/docs/Web/CSS/overflow-anchor
             */
            anchor?: 'auto' | 'none' | Common;
        };
        /**
         * Indicate that an element and its contents are, as much as possible, independent of the rest of the document tree. This allows the browser to recalculate layout, style, paint, size, or any combination of them for a limited area of the DOM and not the entire page, leading to obvious performance benefits.
         * @see https://developer.mozilla.org/en-US/docs/Web/CSS/contain
         */
        contain?: 'none' | 'strict' | 'content' | ContainRule | readonly ContainRule[] | Common;
        /**
         * How white space inside an element is handled.
         * @see https://developer.mozilla.org/en-US/docs/Web/CSS/white-space
         */
        whiteSpace?: 'normal' | 'nowrap' | 'break-spaces' | 'pre' | 'pre-wrap' | 'pre-line' | Common;
        /** @see https://developer.mozilla.org/en-US/docs/Web/CSS/-webkit-overflow-scrolling */
        webkitOverflowScrolling?: 'auto' | 'touch' | Common;
        /** @see https://developer.mozilla.org/en-US/docs/Web/CSS/scrollbar-color */
        scrollbar?: {
            /**
             * Color of thumb and track of scrollbars.
             * @see https://developer.mozilla.org/en-US/docs/Web/CSS/scrollbar-color
             */
            color?: readonly [$mol_style_properties_color, $mol_style_properties_color] | 'auto' | Common;
            /**
             * Maximum thickness of scrollbars.
             * @see https://developer.mozilla.org/en-US/docs/Web/CSS/scrollbar-width
             */
            width?: 'auto' | 'thin' | 'none' | Common;
        };
        /** @see https://developer.mozilla.org/en-US/docs/Web/CSS/scroll-behavior */
        scroll?: {
            /** @see https://developer.mozilla.org/en-US/docs/Web/CSS/scroll-snap-align */
            snap?: {
                /**
                 * How strictly snap points are enforced on the scroll container in case there is one.
                 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/scroll-snap-type
                 */
                type: 'none' | Snap_axis | readonly [Snap_axis, 'mandatory' | 'proximity'] | Common;
                /**
                 * Whether the scroll container is allowed to "pass over" possible snap positions.
                 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/scroll-snap-stop
                 */
                stop: 'normal' | 'always' | Common;
                /**
                 * The box’s snap position as an alignment of its snap area (as the alignment subject) within its snap container’s snapport (as the alignment container). The two values specify the snapping alignment in the block axis and inline axis, respectively. If only one value is specified, the second value defaults to the same value.
                 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/scroll-snap-align
                 */
                align: Span_align | readonly [Span_align, Span_align] | Common;
            };
            /**
             * Offsets for the optimal viewing region of the scrollport: the region used as the target region for placing things in view of the user.
             * @see https://developer.mozilla.org/en-US/docs/Web/CSS/scroll-padding
             */
            padding?: Directions<Length | 'auto'>;
        };
        /**
         * Element's width. By default, it sets the width of the content area, but if `boxSizing` is set to `border-box`, it sets the width of the border area.
         * @see https://developer.mozilla.org/en-US/docs/Web/CSS/width
         */
        width?: Size;
        /**
         * Minimum width of an element. It prevents the used value of the `width` property from becoming smaller than the value specified for `minWidth`.
         * @see https://developer.mozilla.org/en-US/docs/Web/CSS/min-width
         */
        minWidth?: Size;
        /**
         * Maximum width of an element. It prevents the used value of the `width` property from becoming larger than the value specified for `maxWidth`.
         * @see https://developer.mozilla.org/en-US/docs/Web/CSS/max-width
         */
        maxWidth?: Size;
        /**
         * Height of an element. By default, the property defines the height of the content area. If box-sizing is set to border-box, however, it instead determines the height of the border area.
         * @see https://developer.mozilla.org/en-US/docs/Web/CSS/height
         */
        height?: Size;
        /**
         * Minimum height of an element. It prevents the used value of the `height` property from becoming smaller than the value specified for `minHeight`.
         * @see https://developer.mozilla.org/en-US/docs/Web/CSS/min-height
         */
        minHeight?: Size;
        /**
         * Maximum height of an element. It prevents the used value of the `height` property from becoming larger than the value specified for `maxHeight`.
         * @see https://developer.mozilla.org/en-US/docs/Web/CSS/max-height
         */
        maxHeight?: Size;
        /**
         * Margin area on all four sides of an element.
         * @see https://developer.mozilla.org/en-US/docs/Web/CSS/margin
         */
        margin?: Directions<Length | 'auto'>;
        /**
         * Padding area on all four sides of an element.
         * @see https://developer.mozilla.org/en-US/docs/Web/CSS/padding
         */
        padding?: Directions<Length | 'auto'>;
        /**
         * How an element is positioned in a document. The `top`, `right`, `bottom`, and `left` properties determine the final location of positioned elements.
         * @see https://developer.mozilla.org/en-US/docs/Web/CSS/position
         */
        position?: 'static' | 'relative' | 'absolute' | 'sticky' | 'fixed' | Common;
        /** @see https://developer.mozilla.org/en-US/docs/Web/CSS/top */
        top?: Length | 'auto' | Common;
        /** @see https://developer.mozilla.org/en-US/docs/Web/CSS/right */
        right?: Length | 'auto' | Common;
        /** @see https://developer.mozilla.org/en-US/docs/Web/CSS/bottom */
        bottom?: Length | 'auto' | Common;
        /** @see https://developer.mozilla.org/en-US/docs/Web/CSS/left */
        left?: Length | 'auto' | Common;
        /** @see https://developer.mozilla.org/en-US/docs/Web/CSS/border */
        border?: Borders<{
            /**
             * Rounds the corners of an element's outer border edge. You can set a single radius to make circular corners, or two radii to make elliptical corners.
             * @see https://developer.mozilla.org/en-US/docs/Web/CSS/border-radius
             */
            radius?: Length | [Length, Length];
            /**
             * Line style for all four sides of an element's border.
             * @see https://developer.mozilla.org/en-US/docs/Web/CSS/border-radius
             */
            style?: 'none' | 'hidden' | 'dotted' | 'dashed' | 'solid' | 'double' | 'groove' | 'ridge' | 'inset' | 'outset' | Common;
            /**
             * Color of element's border.
             * @see https://developer.mozilla.org/en-US/docs/Web/CSS/border-color
             */
            color?: $mol_style_properties_color | Common;
            /**
             * Width of element's border.
             * @see https://developer.mozilla.org/en-US/docs/Web/CSS/border-width
             */
            width?: Length | Common;
        }>;
        /**
         * How a flex item will grow or shrink to fit the space available in its flex container. It is a shorthand for `flexGrow`, `flexShrink`, and `flexBasis`.
         * @see https://developer.mozilla.org/en-US/docs/Web/CSS/flex
         */
        flex?: 'none' | 'auto' | {
            /**
             * Growing weight of the flex item. Negative values are considered invalid. Defaults to 1 when omitted.
             * @see https://developer.mozilla.org/en-US/docs/Web/CSS/flex-grow
             */
            grow?: number | Common;
            /**
             * Shrinking weight of the flex item. Negative values are considered invalid. Defaults to 1 when omitted.
             * @see https://developer.mozilla.org/en-US/docs/Web/CSS/flex-shrink
             */
            shrink?: number | Common;
            /**
             * Preferred size of the flex item. A value of 0 must have a unit to avoid being interpreted as a flexibility. Defaults to 0 when omitted.
             * @see https://developer.mozilla.org/en-US/docs/Web/CSS/flex-basis
             */
            basis?: Size | Common;
            /**
             * How flex items are placed in the flex container defining the main axis and the direction (normal or reversed).
             * @see https://developer.mozilla.org/en-US/docs/Web/CSS/flex-basis
             */
            direction?: 'row' | 'row-reverse' | 'column' | 'column-reverse' | Common;
            /**
             * Whether flex items are forced onto one line or can wrap onto multiple lines. If wrapping is allowed, it sets the direction that lines are stacked.
             * @see https://developer.mozilla.org/en-US/docs/Web/CSS/flex-wrap
             */
            wrap?: 'wrap' | 'nowrap' | 'wrap-reverse' | Common;
        };
        container?: {
            name?: string;
            type?: Container_type | readonly Container_type[];
        };
        /**
         * Z-order of a positioned element and its descendants or flex items. Overlapping elements with a larger z-index cover those with a smaller one.
         * @see https://developer.mozilla.org/en-US/docs/Web/CSS/z-index
         */
        zIndex: number | Common;
        /**
         * Degree to which content behind an element is hidden, and is the opposite of transparency.
         * @see https://developer.mozilla.org/en-US/docs/Web/CSS/opacity
         */
        opacity: number | Common;
    }
    type Container_type = 'normal' | 'size' | 'inline-size' | 'scroll-state' | 'anchored';
    export {};
}

declare namespace $ {
    /** Create record of CSS variables. */
    function $mol_style_prop<Keys extends string[]>(prefix: string, keys: Keys): Record<Keys[number], $mol_style_func<"var", unknown>>;
}

declare namespace $ {
    /**
     * Theme css variables
     * @see https://mol.hyoo.ru/#!section=demos/demo=mol_textarea_demo
     */
    const $mol_theme: Record<"image" | "line" | "text" | "focus" | "hue" | "back" | "hover" | "card" | "current" | "special" | "control" | "shade" | "field" | "spirit" | "hue_spread", $mol_style_func<"var", unknown>>;
}

declare namespace $ {
}

declare namespace $ {
    /**
     * Gap in CSS
     * @see https://page.hyoo.ru/#!=msdb74_bm7nsq
     */
    let $mol_gap: Record<"space" | "text" | "blur" | "page" | "block" | "round" | "emoji", $mol_style_func<"var", unknown>>;
}

declare namespace $ {
}

declare namespace $ {
    function $mol_fail(error: any): never;
}

declare namespace $ {
    function $mol_func_name(this: $, func: Function): string;
    function $mol_func_name_from<Target extends Function>(target: Target, source: Function): Target;
}

declare namespace $ {
    function $mol_dom_render_children(el: Element | DocumentFragment, childNodes: NodeList | Array<Node | string | null>): void;
}

declare namespace $ {
    /**
     * Recursive `Partial`.
     *
     * 	let props : $mol_type_partial_deep< HTMLElement > = { style : { display : 'block' } }
     */
    type $mol_type_partial_deep<Val> = Val extends object ? Val extends Function ? Val : {
        [field in keyof Val]?: $mol_type_partial_deep<Val[field]> | undefined;
    } : Val;
}

declare namespace $ {
    let $mol_jsx_prefix: string;
    let $mol_jsx_crumbs: string;
    let $mol_jsx_booked: null | Set<string>;
    let $mol_jsx_document: $mol_jsx.JSX.ElementClass['ownerDocument'];
    const $mol_jsx_frag = "";
    /**
     * JSX adapter that makes DOM tree.
     * Generates global unique ids for every DOM-element by components tree with ids.
     * Ensures all local ids are unique.
     * Can reuse an existing nodes by GUIDs when used inside [`mol_jsx_attach`](https://github.com/hyoo-ru/mam_mol/tree/master/jsx/attach).
     */
    function $mol_jsx<Props extends $mol_jsx.JSX.IntrinsicAttributes, Children extends Array<Node | string>>(Elem: string | ((props: Props, ...children: Children) => Element), props: Props, ...childNodes: Children): Element | DocumentFragment;
    namespace $mol_jsx.JSX {
        interface Element extends HTMLElement {
            class?: string;
        }
        interface ElementClass {
            attributes: {};
            ownerDocument: Pick<Document, 'getElementById' | 'createElementNS' | 'createDocumentFragment'>;
            childNodes: Array<Node | string>;
            valueOf(): Element;
        }
        type OrString<Dict> = {
            [key in keyof Dict]: Dict[key] | string;
        };
        /** Props for html elements */
        type IntrinsicElements = {
            [key in keyof ElementTagNameMap]?: $.$mol_type_partial_deep<OrString<Element & IntrinsicAttributes & ElementTagNameMap[key]>>;
        };
        /** Additional undeclared props */
        interface IntrinsicAttributes {
            id?: string;
            xmlns?: string;
        }
        interface ElementAttributesProperty {
            attributes: {};
        }
        interface ElementChildrenAttribute {
        }
    }
}

declare namespace $ {
    const $mol_ambient_ref: unique symbol;
    /** @deprecated use $ instead */
    type $mol_ambient_context = $;
    function $mol_ambient(this: $ | void, overrides: Partial<$>): $;
}

declare namespace $ {
    /**
     * Proxy that delegates all to lazy returned target.
     *
     * 	$mol_delegate( Array.prototype , ()=> fetch_array() )
     */
    function $mol_delegate<Value extends object>(proto: Value, target: () => Value): Value;
}

declare namespace $ {
    const $mol_owning_map: WeakMap<any, any>;
    function $mol_owning_allow<Having>(having: Having): having is Having & {
        destructor(): void;
    };
    function $mol_owning_get<Having, Owner extends object>(having: Having, Owner?: {
        new (): Owner;
    }): Owner | null;
    function $mol_owning_check<Owner, Having>(owner: Owner, having: Having): having is Having & {
        destructor(): void;
    };
    function $mol_owning_catch<Owner, Having>(owner: Owner, having: Having): boolean;
}

declare namespace $ {
    function $mol_fail_hidden(error: any): never;
}

declare namespace $ {
    type $mol_type_writable<T> = {
        -readonly [P in keyof T]: T[P];
    };
}

declare namespace $ {
    const $mol_key_handle: unique symbol;
    const $mol_key_store: WeakMap<object, string>;
}

declare namespace $ {
    class $mol_object2 {
        static $: $;
        [Symbol.toStringTag]: string;
        [$mol_ambient_ref]: $;
        get $(): $;
        set $(next: $);
        static create<Instance>(this: new (init?: (instance: any) => void) => Instance, init?: (instance: $mol_type_writable<Instance>) => void): Instance;
        static [Symbol.toPrimitive](): any;
        static toString(): any;
        static toJSON(): any;
        static [$mol_key_handle](): any;
        destructor(): void;
        static destructor(): void;
        [Symbol.dispose](): void;
        toString(): string;
    }
}

declare namespace $ {
    namespace $$ { }
    const $mol_object_field: unique symbol;
    class $mol_object extends $mol_object2 {
        static make<This extends typeof $mol_object>(this: This, config: Partial<InstanceType<This>>): InstanceType<This>;
    }
}

declare namespace $ {
    /** Generates unique identifier. */
    function $mol_guid(length?: number, exists?: (id: string) => boolean): string;
}

declare namespace $ {
    /** Special status statuses. */
    enum $mol_wire_cursor {
        /** Update required. */
        stale = -1,
        /** Some of (transitive) pub update required. */
        doubt = -2,
        /** Actual state but may be dropped. */
        fresh = -3,
        /** State will never be changed. */
        final = -4
    }
}

declare namespace $ {
    /**
     * Collects subscribers in compact array. 28B
     */
    class $mol_wire_pub extends Object {
        constructor(id?: string);
        [Symbol.toStringTag]: string;
        data: unknown[];
        static get [Symbol.species](): ArrayConstructor;
        /**
         * Index of first subscriber.
         */
        protected sub_from: number;
        /**
         * All current subscribers.
         */
        get sub_list(): readonly $mol_wire_sub[];
        /**
         * Has any subscribers or not.
         */
        get sub_empty(): boolean;
        /**
         * Subscribe subscriber to this publisher events and return position of subscriber that required to unsubscribe.
         */
        sub_on(sub: $mol_wire_pub, pub_pos: number): number;
        /**
         * Unsubscribe subscriber from this publisher events by subscriber position provided by `on(pub)`.
         */
        sub_off(sub_pos: number): void;
        /**
         * Called when last sub was unsubscribed.
         **/
        reap(): void;
        /**
         * Autowire this publisher with current subscriber.
         **/
        promote(): void;
        /**
         * Enforce actualization. Should not throw errors.
         */
        fresh(): void;
        /**
         * Allow to put data to caches in the subtree.
         */
        complete(): void;
        get incompleted(): boolean;
        /**
         * Notify subscribers about self changes.
         */
        emit(quant?: $mol_wire_cursor): void;
        /**
         * Moves peer from one position to another. Doesn't clear data at old position!
         */
        peer_move(from_pos: number, to_pos: number): void;
        /**
         * Updates self position in the peer.
         */
        peer_repos(peer_pos: number, self_pos: number): void;
    }
}

declare namespace $ {
    /** Generic subscriber interface */
    interface $mol_wire_sub extends $mol_wire_pub {
        temp: boolean;
        pub_list: $mol_wire_pub[];
        /**
         * Begin auto wire to publishers.
         * Returns previous auto subscriber that must me transfer to the `end`.
         */
        track_on(): $mol_wire_sub | null;
        /**
         * Returns next auto wired publisher. It can be easely repormoted.
         * Or promotes next publisher to auto wire its togeter.
         * Must be used only between `track_on` and `track_off`.
         */
        track_next(pub?: $mol_wire_pub): $mol_wire_pub | null;
        pub_off(pub_pos: number): void;
        /**
         * Unsubscribes from unpromoted publishers.
         */
        track_cut(sub: $mol_wire_pub | null): void;
        /**
         * Ends auto wire to publishers.
         */
        track_off(sub: $mol_wire_pub | null): void;
        /**
         * Receive notification about publisher changes.
         */
        absorb(quant: $mol_wire_cursor, pos: number): void;
        /**
         * Unsubscribes from all publishers.
         */
        destructor(): void;
    }
}

declare namespace $ {
    let $mol_wire_auto_sub: $mol_wire_sub | null;
    /**
     * When fulfilled, all publishers are promoted to this subscriber on access to its.
     */
    function $mol_wire_auto(next?: $mol_wire_sub | null): $mol_wire_sub | null;
    /**
     * Affection queue. Used to prevent accidental stack overflow on emit.
     */
    const $mol_wire_affected: ($mol_wire_sub | number)[];
}

declare namespace $ {
    function $mol_dev_format_register(config: {
        header: (val: any, config: any) => any;
        hasBody: (val: any, config: any) => false;
    } | {
        header: (val: any, config: any) => any;
        hasBody: (val: any, config: any) => boolean;
        body: (val: any, config: any) => any;
    }): void;
    const $mol_dev_format_head: unique symbol;
    const $mol_dev_format_body: unique symbol;
    function $mol_dev_format_native(obj: any): any[];
    function $mol_dev_format_auto(obj: any): any[];
    function $mol_dev_format_element(element: string, style: object, ...content: any[]): any[];
    let $mol_dev_format_span: (style: object, ...content: any[]) => any[];
    let $mol_dev_format_div: (style: object, ...content: any[]) => any[];
    let $mol_dev_format_ol: (style: object, ...content: any[]) => any[];
    let $mol_dev_format_li: (style: object, ...content: any[]) => any[];
    let $mol_dev_format_table: (style: object, ...content: any[]) => any[];
    let $mol_dev_format_tr: (style: object, ...content: any[]) => any[];
    let $mol_dev_format_td: (style: object, ...content: any[]) => any[];
    let $mol_dev_format_accent: (...args: any[]) => any[];
    let $mol_dev_format_strong: (...args: any[]) => any[];
    let $mol_dev_format_string: (...args: any[]) => any[];
    let $mol_dev_format_shade: (...args: any[]) => any[];
    let $mol_dev_format_indent: (...args: any[]) => any[];
}

declare namespace $ {
    /**
     * Publisher that can auto collect other publishers. 32B
     *
     * 	P1 P2 P3 P4 S1 S2 S3
     * 	^           ^
     * 	pubs_from   subs_from
     */
    class $mol_wire_pub_sub extends $mol_wire_pub implements $mol_wire_sub {
        protected pub_from: number;
        protected cursor: $mol_wire_cursor;
        get temp(): boolean;
        get pub_list(): $mol_wire_pub[];
        track_on(): $mol_wire_sub | null;
        promote(): void;
        track_next(pub?: $mol_wire_pub): $mol_wire_pub | null;
        track_off(sub: $mol_wire_sub | null): void;
        pub_off(sub_pos: number): void;
        destructor(): void;
        track_cut(): void;
        complete(): void;
        complete_pubs(): void;
        absorb(quant?: $mol_wire_cursor, pos?: number): void;
        [$mol_dev_format_head](): any[];
        /**
         * Is subscribed to any publisher or not.
         */
        get pub_empty(): boolean;
    }
}

declare namespace $ {
    class $mol_after_tick extends $mol_object2 {
        task: () => void;
        static promise: Promise<void> | null;
        cancelled: boolean;
        constructor(task: () => void);
        destructor(): void;
    }
}

declare namespace $ {
    function $mol_promise_like(val: any): val is Promise<any>;
}

declare namespace $ {
    /**
     * Suspendable task with support both sync/async api.
     *
     * 	A1 A2 A3 A4 P1 P2 P3 P4 S1 S2 S3
     * 	^           ^           ^
     * 	args_from   pubs_from   subs_from
     **/
    abstract class $mol_wire_fiber<Host, Args extends readonly unknown[], Result> extends $mol_wire_pub_sub {
        readonly task: (this: Host, ...args: Args) => Result;
        readonly host?: Host | undefined;
        static warm: boolean;
        static planning: Set<$mol_wire_fiber<any, any, any>>;
        static reaping: Set<$mol_wire_fiber<any, any, any>>;
        static plan_task: $mol_after_tick | null;
        static plan(): void;
        static sync(): void;
        cache: Result | Error | Promise<Result | Error>;
        get args(): Args;
        result(): Result | undefined;
        get incompleted(): boolean;
        field(): string;
        constructor(id: string, task: (this: Host, ...args: Args) => Result, host?: Host | undefined, args?: Args);
        plan(): this;
        reap(): void;
        toString(): string;
        toJSON(): string;
        [$mol_dev_format_head](): any[];
        [$mol_dev_format_body](): null;
        get $(): any;
        emit(quant?: $mol_wire_cursor): void;
        fresh(): this | undefined;
        refresh(): void;
        abstract put(next: Result | Error | Promise<Result | Error>): Result | Error | Promise<Result | Error>;
        /**
         * Synchronous execution. Throws Promise when waits async task (SuspenseAPI provider).
         * Should be called inside SuspenseAPI consumer (ie fiber).
         */
        sync(): Awaited<Result>;
        /**
         * Asynchronous execution.
         * It's SuspenseAPI consumer. So SuspenseAPI providers can be called inside.
         */
        async_raw(): Promise<Result>;
        async(): Promise<Result> & {
            destructor(): void;
        };
        step(): Promise<null>;
        destructor(): void;
    }
}

declare namespace $ {
    /** Returns string key for any value. */
    function $mol_key<Value>(value: Value): string;
}

declare namespace $ {
    class $mol_after_frame extends $mol_object2 {
        task: () => void;
        static _promise: Promise<void> | null;
        static get promise(): Promise<void>;
        cancelled: boolean;
        promise: Promise<void>;
        constructor(task: () => void);
        destructor(): void;
    }
}

declare namespace $ {
    let $mol_compare_deep_cache: WeakMap<any, WeakMap<any, boolean>>;
    /**
     * Deeply compares two values. Returns true if equal.
     * Define `Symbol.toPrimitive` to customize.
     */
    function $mol_compare_deep<Value>(left: Value, right: Value): boolean;
}

declare namespace $ {
    /** Logger event data */
    type $mol_log3_event<Fields> = {
        [key in string]: unknown;
    } & {
        /** Time of event creation */
        time?: string;
        /** Place of event creation */
        place: unknown;
        /** Short description of event */
        message: string;
    } & Fields;
    /** Logger function */
    type $mol_log3_logger<Fields, Res = void> = (this: $, event: $mol_log3_event<Fields>) => Res;
    /** Log begin of some task */
    let $mol_log3_come: $mol_log3_logger<{}>;
    /** Log end of some task */
    let $mol_log3_done: $mol_log3_logger<{}>;
    /** Log error */
    let $mol_log3_fail: $mol_log3_logger<{}>;
    /** Log warning message */
    let $mol_log3_warn: $mol_log3_logger<{
        hint: string;
    }>;
    /** Log some generic event */
    let $mol_log3_rise: $mol_log3_logger<{}>;
    /** Log begin of log group, returns func to close group */
    let $mol_log3_area: $mol_log3_logger<{}, () => void>;
    /** Log begin of collapsed group only when some logged inside, returns func to close group */
    function $mol_log3_area_lazy(this: $, event: $mol_log3_event<{}>): () => void;
    let $mol_log3_stack: (() => void)[];
}

declare namespace $ {
    /**
     * Extracts keys from `Input` which values extends `Upper` and extendable by `Lower`.
     *
     * 	type MathConstants = $mol_type_keys_extract< Math , number > // "E" | "PI" ...
     */
    type $mol_type_keys_extract<Input, Upper, Lower = never> = {
        [Field in keyof Input]: unknown extends Input[Field] ? never : Input[Field] extends never ? never : Input[Field] extends Upper ? [
            Lower
        ] extends [Input[Field]] ? Field : never : never;
    }[keyof Input];
}

declare namespace $ {
    function $mol_log3_web_make(level: $mol_type_keys_extract<Console, Function>, color: string): (this: $, event: $mol_log3_event<{}>) => () => void;
}

declare namespace $ {
    /** One-shot fiber */
    class $mol_wire_task<Host, Args extends readonly unknown[], Result> extends $mol_wire_fiber<Host, Args, Result> {
        static getter<Host, Args extends readonly unknown[], Result>(task: (this: Host, ...args: Args) => Result): (host: Host, args: Args) => $mol_wire_task<Host, Args, Result>;
        get temp(): boolean;
        complete(): void;
        put(next: Result | Error | Promise<Result | Error>): Error | Result | Promise<Error | Result>;
        destructor(): void;
    }
}

declare namespace $ {
    /**
     * Decorates method to fiber to ensure it is executed only once inside other fiber.
     */
    function $mol_wire_method<Host extends object, Args extends readonly any[]>(host: Host, field: PropertyKey, descr?: TypedPropertyDescriptor<(...args: Args) => any>): {
        value: (this: Host, ...args: Args) => any;
        enumerable?: boolean;
        configurable?: boolean;
        writable?: boolean;
        get?: (() => (...args: Args) => any) | undefined;
        set?: ((value: (...args: Args) => any) => void) | undefined;
    };
}

declare namespace $ {
    /**
     * Returns `Tuple` without first element.
     *
     * 	$mol_type_tail<[ 1 , 2 , 3 ]> // [ 2, 3 ]
     */
    type $mol_type_tail<Tuple extends readonly any[]> = ((...tail: Tuple) => any) extends ((head: any, ...tail: infer Tail) => any) ? Tail : never;
}

declare namespace $ {
    /**
     * Returns last element of `Tuple`.
     *
     * 	$mol_type_tail<[ 1 , 2 , 3 ]> // 3
     */
    type $mol_type_foot<Tuple extends readonly any[]> = Tuple['length'] extends 0 ? never : Tuple[$mol_type_tail<Tuple>['length']];
}

declare namespace $ {
    function $mol_fail_catch(error: unknown): boolean;
}

declare namespace $ {
    function $mol_try<Result>(handler: () => Result): Result | Error;
}

declare namespace $ {
    function $mol_try_web<Result>(handler2: () => Result): Result | Error;
}

declare namespace $ {
    function $mol_fail_log(error: unknown): boolean;
}

declare namespace $ {
    /** Long-living fiber. */
    class $mol_wire_atom<Host, Args extends readonly unknown[], Result> extends $mol_wire_fiber<Host, Args, Result> {
        static solo<Host, Args extends readonly unknown[], Result>(host: Host, task: (this: Host, ...args: Args) => Result): $mol_wire_atom<Host, Args, Result>;
        static plex<Host, Args extends readonly unknown[], Result>(host: Host, task: (this: Host, ...args: Args) => Result, key: Args[0]): $mol_wire_atom<Host, Args, Result>;
        static watching: Set<$mol_wire_atom<any, any, any>>;
        static watcher: $mol_after_frame | null;
        static watch(): void;
        watch(): void;
        /**
         * Update atom value through another temp fiber.
         */
        resync(args: Args): Error | Result | Promise<Error | Result>;
        once(): Awaited<Result>;
        channel(): ((next?: $mol_type_foot<Args>) => Awaited<Result>) & {
            atom: $mol_wire_atom<Host, Args, Result>;
        };
        destructor(): void;
        put(next: Result | Error | Promise<Result | Error>): Error | Result | Promise<Error | Result>;
    }
}

declare namespace $ {
    /** Decorates solo object channel to [mol_wire_atom](../atom/atom.ts). */
    export function $mol_wire_solo<Args extends any[]>(host: object, field: string, descr?: TypedPropertyDescriptor<(...args: Args) => any>): TypedPropertyDescriptor<(...args: First_optional<Args>) => any>;
    type First_optional<Args extends any[]> = Args extends [] ? [] : [Args[0] | undefined, ...$mol_type_tail<Args>];
    export {};
}

declare namespace $ {
    /** Reactive memoizing multiplexed property decorator. */
    function $mol_wire_plex<Args extends [any, ...any[]]>(host: object, field: string, descr?: TypedPropertyDescriptor<(...args: Args) => any>): {
        value: (this: typeof host, ...args: Args) => any;
        enumerable?: boolean;
        configurable?: boolean;
        writable?: boolean;
        get?: (() => (...args: Args) => any) | undefined;
        set?: ((value: (...args: Args) => any) => void) | undefined;
    };
}

declare namespace $ {
    /**
     * Reactive memoizing solo property decorator from [mol_wire](../wire/README.md)
     * @example
     * '@' $mol_mem
     * name(next?: string) {
     * 	return next ?? 'default'
     * }
     * @see https://mol.hyoo.ru/#!section=docs/=qxmh6t_sinbmb
     */
    let $mol_mem: typeof $mol_wire_solo;
    /**
     * Reactive memoizing multiplexed property decorator [mol_wire](../wire/README.md)
     * @example
     * '@' $mol_mem_key
     * name(id: number, next?: string) {
     *  return next ?? 'default'
     * }
     * @see https://mol.hyoo.ru/#!section=docs/=qxmh6t_sinbmb
     */
    let $mol_mem_key: typeof $mol_wire_plex;
}

declare namespace $ {
    class $mol_window extends $mol_object {
        static size(): {
            width: number;
            height: number;
        };
        static resizes(next?: Event): Event | undefined;
    }
}

declare namespace $ {
    function $mol_guard_defined<T>(value: T): value is NonNullable<T>;
}

declare namespace $ {
    class $mol_view_selection extends $mol_object {
        static focused(next?: Element[], notify?: 'notify'): Element[];
    }
}

declare namespace $ {
    function $mol_maybe<Value>(value: Value | null | undefined): Value[];
}

declare namespace $ {
    /**
    * Key names code for hotkey
    * @see [mol_hotkey](../../hotkey/hotkey.view.ts)
    */
    enum $mol_keyboard_code {
        backspace = 8,
        tab = 9,
        enter = 13,
        shift = 16,
        ctrl = 17,
        alt = 18,
        pause = 19,
        capsLock = 20,
        escape = 27,
        space = 32,
        pageUp = 33,
        pageDown = 34,
        end = 35,
        home = 36,
        left = 37,
        up = 38,
        right = 39,
        down = 40,
        insert = 45,
        delete = 46,
        key0 = 48,
        key1 = 49,
        key2 = 50,
        key3 = 51,
        key4 = 52,
        key5 = 53,
        key6 = 54,
        key7 = 55,
        key8 = 56,
        key9 = 57,
        A = 65,
        B = 66,
        C = 67,
        D = 68,
        E = 69,
        F = 70,
        G = 71,
        H = 72,
        I = 73,
        J = 74,
        K = 75,
        L = 76,
        M = 77,
        N = 78,
        O = 79,
        P = 80,
        Q = 81,
        R = 82,
        S = 83,
        T = 84,
        U = 85,
        V = 86,
        W = 87,
        X = 88,
        Y = 89,
        Z = 90,
        metaLeft = 91,
        metaRight = 92,
        select = 93,
        numpad0 = 96,
        numpad1 = 97,
        numpad2 = 98,
        numpad3 = 99,
        numpad4 = 100,
        numpad5 = 101,
        numpad6 = 102,
        numpad7 = 103,
        numpad8 = 104,
        numpad9 = 105,
        multiply = 106,
        add = 107,
        subtract = 109,
        decimal = 110,
        divide = 111,
        F1 = 112,
        F2 = 113,
        F3 = 114,
        F4 = 115,
        F5 = 116,
        F6 = 117,
        F7 = 118,
        F8 = 119,
        F9 = 120,
        F10 = 121,
        F11 = 122,
        F12 = 123,
        numLock = 144,
        scrollLock = 145,
        semicolon = 186,
        equals = 187,
        comma = 188,
        dash = 189,
        period = 190,
        forwardSlash = 191,
        graveAccent = 192,
        bracketOpen = 219,
        slashBack = 220,
        slashBackLeft = 226,
        bracketClose = 221,
        quoteSingle = 222
    }
}

declare namespace $ {
}

declare namespace $ {
    class $mol_wrapper extends $mol_object2 {
        static wrap: (task: (...ags: any[]) => any) => (...ags: any[]) => any;
        static run<Result>(task: () => Result): Result;
        static func<Args extends any[], Result, Host = void>(func: (this: Host, ...args: Args) => Result): (this: Host, ...args: Args) => Result;
        static get class(): <Class extends new (...args: any[]) => any>(Class: Class) => Class;
        static get method(): (obj: object, name: PropertyKey, descr?: TypedPropertyDescriptor<any>) => TypedPropertyDescriptor<any>;
        static get field(): <Host extends object, Field extends keyof Host, Args extends any[], Result>(obj: Host, name: Field, descr?: TypedPropertyDescriptor<Result>) => TypedPropertyDescriptor<Result>;
    }
}

declare namespace $ {
    class $mol_memo extends $mol_wrapper {
        static wrap<This extends object, Value>(task: (this: This, next?: Value) => Value): (this: This, next?: Value) => Value | undefined;
    }
}

declare namespace $ {
    function $mol_dom_qname(name: string): string;
}

declare namespace $ {
    /** Run code without state changes */
    function $mol_wire_probe<Value>(task: () => Value, def?: Value): Value | undefined;
}

declare namespace $ {
    /**
     * Real-time refresh current atom.
     * Don't use if possible. May reduce performance.
     */
    function $mol_wire_watch(): void;
}

declare namespace $ {
    /**
     * Returns closure that returns constant value.
     * @example
     * const rnd = $mol_const( Math.random() )
     */
    function $mol_const<Value>(value: Value): {
        (): Value;
        '()': Value;
    };
}

declare namespace $ {
    /**
     * Disable reaping of current subscriber
     */
    function $mol_wire_solid(): void;
}

declare namespace $ {
    function $mol_dom_render_attributes(el: Element, attrs: {
        [key: string]: string | number | boolean | null;
    }): void;
}

declare namespace $ {
    function $mol_dom_render_events(el: Element, events: {
        [key: string]: (event: Event) => any;
    }, passive?: boolean): void;
}

declare namespace $ {
    function $mol_error_message(this: $, error: unknown): string;
}

declare namespace $ {
    function $mol_dom_render_styles(el: Element, styles: {
        [key: string]: string | number;
    }): void;
}

declare namespace $ {
    function $mol_dom_render_fields(el: Element, fields: {
        [key: string]: any;
    }): void;
}

declare namespace $ {
    /** Convert a pseudo-synchronous (Suspense API) API to an explicit asynchronous one (for integrating with external systems). */
    export function $mol_wire_async<Host extends object>(obj: Host): ObjectOrFunctionResultPromisify<Host>;
    type FunctionResultPromisify<Some> = Some extends (...args: infer Args) => infer Res ? Res extends PromiseLike<unknown> ? Some : (...args: Args) => Promise<Res> : Some;
    type MethodsResultPromisify<Host extends Object> = {
        [K in keyof Host]: FunctionResultPromisify<Host[K]>;
    };
    type ObjectOrFunctionResultPromisify<Some> = (Some extends (...args: any) => unknown ? FunctionResultPromisify<Some> : {}) & (Some extends Object ? MethodsResultPromisify<Some> : Some);
    export {};
}

declare namespace $ {
    class $mol_after_timeout extends $mol_object2 {
        delay: number;
        task: () => void;
        id: any;
        constructor(delay: number, task: () => void);
        destructor(): void;
    }
}

declare namespace $ {
    /**
     * Picks keys from `Input` which values extends `Upper`.
     *
     * 	type MathConstants = $mol_type_pick< Math , number > // { E , PI , ... }
     */
    type $mol_type_pick<Input, Upper> = Pick<Input, $mol_type_keys_extract<Input, Upper>>;
}

declare namespace $ {
}

/** @jsx $mol_jsx */
declare namespace $ {
    type $mol_view_content = $mol_view | Node | string | number | boolean | null;
    function $mol_view_visible_width(): number;
    function $mol_view_visible_height(): number;
    function $mol_view_state_key(suffix: string): string;
    /**
     * The base class for all visual components. It provides the infrastructure for reactive lazy rendering, handling exceptions.
     * @see https://mol.hyoo.ru/#!section=docs/=vv2nig_s5zr0f
     */
    class $mol_view extends $mol_object {
        static Root<This extends typeof $mol_view>(this: This, id: number): InstanceType<This>;
        static roots(): $mol_view[];
        static auto(): void;
        title(): string;
        hint(): string;
        focused(next?: boolean): boolean;
        state_key(suffix?: string): string;
        dom_name(): string;
        dom_name_space(): string;
        sub(): readonly $mol_view_content[];
        sub_visible(): readonly $mol_view_content[];
        minimal_width(): number;
        maximal_width(): number;
        minimal_height(): number;
        static watchers: Set<$mol_view>;
        view_rect(): {
            width: number;
            height: number;
            left: number;
            right: number;
            top: number;
            bottom: number;
        } | null;
        dom_id(): string;
        dom_node_external(next?: Element): Element;
        dom_node(next?: Element): Element;
        dom_final(): Element | undefined;
        dom_tree(next?: Element): Element;
        dom_node_actual(): Element;
        auto(): any;
        render(): void;
        static view_classes(): (typeof $mol_view)[];
        static _view_names?: Map<string, string[]>;
        static view_names(suffix: string): string[];
        view_names_owned(): string[];
        view_names(): Set<string>;
        theme(next?: string | null): string | null | undefined;
        attr_static(): {
            [key: string]: string | number | boolean | null;
        };
        attr(): {};
        style(): {
            [key: string]: string | number;
        };
        field(): {
            [key: string]: any;
        };
        event(): {
            [key: string]: (event: Event) => void;
        };
        event_async(): {
            [x: string]: (event: Event) => Promise<void>;
        };
        plugins(): readonly $mol_view[];
        [$mol_dev_format_head](): any[];
        /** Deep search view by predicate. */
        view_find(check: (path: $mol_view, text?: string) => boolean, path?: $mol_view[]): Generator<$mol_view[]>;
        /** Renders path of views to DOM. */
        force_render(path: Set<$mol_view>): void;
        /** Renders view to DOM and scroll to it. */
        ensure_visible(view: $mol_view, align?: ScrollLogicalPosition): void;
        bring(): void;
        destructor(): void;
    }
    type $mol_view_all = $mol_type_pick<$, typeof $mol_view>;
}

interface Window {
    cordova: any;
}
declare namespace $ {
}

declare namespace $ {
    class $mol_vector<Value, Length extends number> extends Array<Value> {
        get length(): Length;
        constructor(...values: Value[] & {
            length: Length;
        });
        map<Res>(convert: (value: Value, index: number, array: this) => Res, self?: any): $mol_vector<Res, Length>;
        merged<Patch>(patches: readonly Patch[] & {
            length: Length;
        }, combine: (value: Value, patch: Patch) => Value): this;
        limited(this: $mol_vector<number, Length>, limits: readonly (readonly [number, number])[] & {
            length: Length;
        }): this;
        added0(this: $mol_vector<number, Length>, diff: number): this;
        added1(this: $mol_vector<number, Length>, diff: readonly number[] & {
            length: Length;
        }): this;
        substracted1(this: $mol_vector<number, Length>, diff: readonly number[] & {
            length: Length;
        }): this;
        multed0(this: $mol_vector<number, Length>, mult: number): this;
        multed1(this: $mol_vector<number, Length>, mults: readonly number[] & {
            length: Length;
        }): this;
        divided1(this: $mol_vector<number, Length>, mults: readonly number[] & {
            length: Length;
        }): this;
        powered0(this: $mol_vector<number, Length>, mult: number): this;
        expanded1(this: $mol_vector<$mol_vector_range<number>, Length>, point: readonly number[] & {
            length: Length;
        }): this;
        expanded2(this: $mol_vector<$mol_vector_range<number>, Length>, point: readonly (readonly [number, number])[] & {
            length: Length;
        }): this;
        center<Item extends $mol_vector<number, number>>(this: $mol_vector<Item, Length>): Item;
        distance(this: $mol_vector<$mol_vector<number, number>, Length>): number;
        transponed(this: $mol_vector<$mol_vector<number, number>, Length>): $mol_vector<$mol_vector<number, Length>, typeof this[0]['length']>;
        get x(): Value;
        set x(next: Value);
        get y(): Value;
        set y(next: Value);
        get z(): Value;
        set z(next: Value);
    }
    class $mol_vector_1d<Value> extends $mol_vector<Value, 1> {
    }
    class $mol_vector_2d<Value> extends $mol_vector<Value, 2> {
    }
    class $mol_vector_3d<Value> extends $mol_vector<Value, 3> {
    }
    class $mol_vector_range<Value> extends $mol_vector<Value, 2> {
        0: Value;
        1: Value;
        constructor(min: Value, max?: Value);
        get min(): Value;
        set min(next: Value);
        get max(): Value;
        set max(next: Value);
        get inversed(): $mol_vector_range<Value>;
        expanded0(value: Value): $mol_vector_range<Value>;
    }
    let $mol_vector_range_full: $mol_vector_range<number>;
    class $mol_vector_matrix<Width extends number, Height extends number> extends $mol_vector<readonly number[] & {
        length: Width;
    }, Height> {
        added2(diff: readonly (readonly number[] & {
            length: Width;
        })[] & {
            length: Height;
        }): this;
        multed2(diff: readonly (readonly number[] & {
            length: Width;
        })[] & {
            length: Height;
        }): this;
    }
}

declare namespace $ {
    /** State of time moment */
    class $mol_state_time extends $mol_object {
        static task(precision: number, reset?: null): $mol_after_timeout | $mol_after_frame;
        static now(precision: number): number;
    }
}

declare namespace $ {

	export class $mol_svg extends $mol_view {
		dom_name( ): string
		dom_name_space( ): string
		font_size( ): number
		font_family( ): string
		style_size( ): Record<string, any>
	}
	
}

//# sourceMappingURL=svg.view.tree.d.ts.map
declare namespace $.$$ {
    /** Base SVG component to display SVG images or icons. */
    class $mol_svg extends $.$mol_svg {
        computed_style(): Record<string, any>;
        font_size(): number;
        font_family(): any;
    }
}

declare namespace $ {
}

declare namespace $ {

	export class $mol_svg_root extends $mol_svg {
		view_box( ): string
		aspect( ): string
		dom_name( ): string
		attr( ): ({ 
			'viewBox': ReturnType< $mol_svg_root['view_box'] >,
			'preserveAspectRatio': ReturnType< $mol_svg_root['aspect'] >,
		})  & ReturnType< $mol_svg['attr'] >
	}
	
}

//# sourceMappingURL=root.view.tree.d.ts.map
declare namespace $ {

	export class $mol_svg_group extends $mol_svg {
		dom_name( ): string
	}
	
}

//# sourceMappingURL=group.view.tree.d.ts.map
declare namespace $ {

	export class $mol_svg_title extends $mol_svg {
		dom_name( ): string
		sub( ): readonly(any)[]
	}
	
}

//# sourceMappingURL=title.view.tree.d.ts.map
declare namespace $ {
    /**
     * Fails if `Actual` type is not subtype of `Expected`.
     */
    type $mol_type_enforce<Actual extends Expected, Expected> = Actual;
}

declare namespace $ {

	type $mol_vector_range__mol_plot_graph_1 = $mol_type_enforce<
		[ number, number ]
		,
		ConstructorParameters< typeof $mol_vector_range<number> >
	>
	type $mol_vector_range__mol_plot_graph_2 = $mol_type_enforce<
		[ number, number ]
		,
		ConstructorParameters< typeof $mol_vector_range<number> >
	>
	type $mol_vector_range__mol_plot_graph_3 = $mol_type_enforce<
		[ number, number ]
		,
		ConstructorParameters< typeof $mol_vector_range<number> >
	>
	type $mol_vector_range__mol_plot_graph_4 = $mol_type_enforce<
		[ number, number ]
		,
		ConstructorParameters< typeof $mol_vector_range<number> >
	>
	type $mol_vector_range__mol_plot_graph_5 = $mol_type_enforce<
		[ number, number ]
		,
		ConstructorParameters< typeof $mol_vector_range<number> >
	>
	type $mol_vector_range__mol_plot_graph_6 = $mol_type_enforce<
		[ number, number ]
		,
		ConstructorParameters< typeof $mol_vector_range<number> >
	>
	type $mol_vector_range__mol_plot_graph_7 = $mol_type_enforce<
		[ number, number ]
		,
		ConstructorParameters< typeof $mol_vector_range<number> >
	>
	type $mol_vector_range__mol_plot_graph_8 = $mol_type_enforce<
		[ number, number ]
		,
		ConstructorParameters< typeof $mol_vector_range<number> >
	>
	type $mol_vector_2d__mol_plot_graph_9 = $mol_type_enforce<
		[ ReturnType< $mol_plot_graph['viewport_x'] >, ReturnType< $mol_plot_graph['viewport_y'] > ]
		,
		ConstructorParameters< typeof $mol_vector_2d<$mol_vector_range<number>> >
	>
	type $mol_vector_2d__mol_plot_graph_10 = $mol_type_enforce<
		[ number, number ]
		,
		ConstructorParameters< typeof $mol_vector_2d<number> >
	>
	type $mol_vector_2d__mol_plot_graph_11 = $mol_type_enforce<
		[ ReturnType< $mol_plot_graph['dimensions_pane_x'] >, ReturnType< $mol_plot_graph['dimensions_pane_y'] > ]
		,
		ConstructorParameters< typeof $mol_vector_2d<$mol_vector_range<number>> >
	>
	type $mol_vector_2d__mol_plot_graph_12 = $mol_type_enforce<
		[ ReturnType< $mol_plot_graph['dimensions_x'] >, ReturnType< $mol_plot_graph['dimensions_y'] > ]
		,
		ConstructorParameters< typeof $mol_vector_2d<$mol_vector_range<number>> >
	>
	type $mol_vector_2d__mol_plot_graph_13 = $mol_type_enforce<
		[ number, number ]
		,
		ConstructorParameters< typeof $mol_vector_2d<number> >
	>
	type $mol_vector_2d__mol_plot_graph_14 = $mol_type_enforce<
		[ ReturnType< $mol_plot_graph['gap_x'] >, ReturnType< $mol_plot_graph['gap_y'] > ]
		,
		ConstructorParameters< typeof $mol_vector_2d<$mol_vector_range<number>> >
	>
	type $mol_svg_title__title_mol_plot_graph_15 = $mol_type_enforce<
		ReturnType< $mol_plot_graph['hint'] >
		,
		ReturnType< $mol_svg_title['title'] >
	>
	export class $mol_plot_graph extends $mol_svg_group {
		type( ): string
		color( ): string
		viewport_x( ): $mol_vector_range<number>
		viewport_y( ): $mol_vector_range<number>
		dimensions_pane_x( ): $mol_vector_range<number>
		dimensions_pane_y( ): $mol_vector_range<number>
		dimensions_x( ): $mol_vector_range<number>
		dimensions_y( ): $mol_vector_range<number>
		gap_x( ): $mol_vector_range<number>
		gap_y( ): $mol_vector_range<number>
		title( ): string
		hint( ): ReturnType< $mol_plot_graph['title'] >
		series_x( ): readonly(number)[]
		series_y( ): readonly(number)[]
		attr( ): ({ 
			'mol_plot_graph_type': ReturnType< $mol_plot_graph['type'] >,
		})  & ReturnType< $mol_svg_group['attr'] >
		style( ): ({ 
			'color': ReturnType< $mol_plot_graph['color'] >,
		})  & ReturnType< $mol_svg_group['style'] >
		viewport( ): $mol_vector_2d<$mol_vector_range<number>>
		shift( ): readonly(number)[]
		scale( ): readonly(number)[]
		cursor_position( ): $mol_vector_2d<number>
		dimensions_pane( ): $mol_vector_2d<$mol_vector_range<number>>
		dimensions( ): $mol_vector_2d<$mol_vector_range<number>>
		size_real( ): $mol_vector_2d<number>
		gap( ): $mol_vector_2d<$mol_vector_range<number>>
		repos_x( id: any): number
		repos_y( id: any): number
		indexes( ): readonly(number)[]
		points( ): readonly(readonly(number)[])[]
		front( ): readonly($mol_svg)[]
		back( ): readonly($mol_svg)[]
		Hint( ): $mol_svg_title
		hue( next?: number ): number
		Sample( ): any
	}
	
	export class $mol_plot_graph_sample extends $mol_view {
		type( ): string
		color( ): string
		attr( ): ({ 
			'mol_plot_graph_type': ReturnType< $mol_plot_graph_sample['type'] >,
		})  & ReturnType< $mol_view['attr'] >
		style( ): ({ 
			'color': ReturnType< $mol_plot_graph_sample['color'] >,
		})  & ReturnType< $mol_view['style'] >
	}
	
}

//# sourceMappingURL=graph.view.tree.d.ts.map
declare namespace $.$$ {
    class $mol_plot_graph extends $.$mol_plot_graph {
        viewport(): $mol_vector_2d<$mol_vector_range<number>>;
        indexes(): readonly number[];
        repos_x(val: number): number;
        repos_y(val: number): number;
        points(): readonly (readonly number[])[];
        series_x(): readonly number[];
        dimensions(): $mol_vector_2d<$mol_vector_range<number>>;
        color(): string;
        front(): readonly $.$mol_svg[];
    }
}

declare namespace $ {
}

declare namespace $ {

	export class $mol_svg_rect extends $mol_svg {
		width( ): string
		height( ): string
		pos_x( ): string
		pos_y( ): string
		dom_name( ): string
		pos( ): readonly(any)[]
		attr( ): ({ 
			'width': ReturnType< $mol_svg_rect['width'] >,
			'height': ReturnType< $mol_svg_rect['height'] >,
			'x': ReturnType< $mol_svg_rect['pos_x'] >,
			'y': ReturnType< $mol_svg_rect['pos_y'] >,
		})  & ReturnType< $mol_svg['attr'] >
	}
	
}

//# sourceMappingURL=rect.view.tree.d.ts.map
declare namespace $.$$ {
    class $mol_svg_rect extends $.$mol_svg_rect {
        pos_x(): any;
        pos_y(): any;
    }
}

declare namespace $ {

	export class $mol_svg_path extends $mol_svg {
		geometry( ): string
		dom_name( ): string
		attr( ): ({ 
			'd': ReturnType< $mol_svg_path['geometry'] >,
		})  & ReturnType< $mol_svg['attr'] >
	}
	
}

//# sourceMappingURL=path.view.tree.d.ts.map
declare namespace $ {

	export class $mol_svg_text extends $mol_svg {
		pos_x( ): string
		pos_y( ): string
		align( ): string
		align_hor( ): ReturnType< $mol_svg_text['align'] >
		align_vert( ): string
		text( ): string
		dom_name( ): string
		pos( ): readonly(any)[]
		attr( ): ({ 
			'x': ReturnType< $mol_svg_text['pos_x'] >,
			'y': ReturnType< $mol_svg_text['pos_y'] >,
			'text-anchor': ReturnType< $mol_svg_text['align_hor'] >,
			'alignment-baseline': ReturnType< $mol_svg_text['align_vert'] >,
		})  & ReturnType< $mol_svg['attr'] >
		sub( ): readonly(any)[]
	}
	
}

//# sourceMappingURL=text.view.tree.d.ts.map
declare namespace $.$$ {
    class $mol_svg_text extends $.$mol_svg_text {
        pos_x(): any;
        pos_y(): any;
    }
}

declare namespace $ {
}

declare namespace $ {
    function $mol_math_round_expand(val: number, gap?: number): number;
}

declare namespace $ {

	type $mol_svg_rect__pos_x_mol_plot_ruler_1 = $mol_type_enforce<
		ReturnType< $mol_plot_ruler['background_x'] >
		,
		ReturnType< $mol_svg_rect['pos_x'] >
	>
	type $mol_svg_rect__pos_y_mol_plot_ruler_2 = $mol_type_enforce<
		ReturnType< $mol_plot_ruler['background_y'] >
		,
		ReturnType< $mol_svg_rect['pos_y'] >
	>
	type $mol_svg_rect__width_mol_plot_ruler_3 = $mol_type_enforce<
		ReturnType< $mol_plot_ruler['background_width'] >
		,
		ReturnType< $mol_svg_rect['width'] >
	>
	type $mol_svg_rect__height_mol_plot_ruler_4 = $mol_type_enforce<
		ReturnType< $mol_plot_ruler['background_height'] >
		,
		ReturnType< $mol_svg_rect['height'] >
	>
	type $mol_svg_path__geometry_mol_plot_ruler_5 = $mol_type_enforce<
		ReturnType< $mol_plot_ruler['curve'] >
		,
		ReturnType< $mol_svg_path['geometry'] >
	>
	type $mol_svg_text__pos_x_mol_plot_ruler_6 = $mol_type_enforce<
		ReturnType< $mol_plot_ruler['title_pos_x'] >
		,
		ReturnType< $mol_svg_text['pos_x'] >
	>
	type $mol_svg_text__pos_y_mol_plot_ruler_7 = $mol_type_enforce<
		ReturnType< $mol_plot_ruler['title_pos_y'] >
		,
		ReturnType< $mol_svg_text['pos_y'] >
	>
	type $mol_svg_text__align_mol_plot_ruler_8 = $mol_type_enforce<
		ReturnType< $mol_plot_ruler['title_align'] >
		,
		ReturnType< $mol_svg_text['align'] >
	>
	type $mol_svg_text__text_mol_plot_ruler_9 = $mol_type_enforce<
		ReturnType< $mol_plot_ruler['title'] >
		,
		ReturnType< $mol_svg_text['text'] >
	>
	type $mol_vector_range__mol_plot_ruler_10 = $mol_type_enforce<
		[ number, number ]
		,
		ConstructorParameters< typeof $mol_vector_range<number> >
	>
	type $mol_vector_range__mol_plot_ruler_11 = $mol_type_enforce<
		[ number, number ]
		,
		ConstructorParameters< typeof $mol_vector_range<number> >
	>
	type $mol_svg_text__pos_mol_plot_ruler_12 = $mol_type_enforce<
		ReturnType< $mol_plot_ruler['label_pos'] >
		,
		ReturnType< $mol_svg_text['pos'] >
	>
	type $mol_svg_text__text_mol_plot_ruler_13 = $mol_type_enforce<
		ReturnType< $mol_plot_ruler['label_text'] >
		,
		ReturnType< $mol_svg_text['text'] >
	>
	type $mol_svg_text__align_mol_plot_ruler_14 = $mol_type_enforce<
		ReturnType< $mol_plot_ruler['label_align'] >
		,
		ReturnType< $mol_svg_text['align'] >
	>
	export class $mol_plot_ruler extends $mol_plot_graph {
		background_x( ): string
		background_y( ): string
		background_width( ): string
		background_height( ): string
		Background( ): $mol_svg_rect
		curve( ): string
		Curve( ): $mol_svg_path
		labels_formatted( ): readonly(any)[]
		title_pos_x( ): string
		title_pos_y( ): string
		title_align( ): string
		Title( ): $mol_svg_text
		label_pos_x( id: any): string
		label_pos_y( id: any): string
		label_pos( id: any): readonly(any)[]
		label_text( id: any): string
		label_align( ): string
		step( ): number
		scale_axis( ): number
		scale_step( ): number
		shift_axis( ): number
		dimensions_axis( ): $mol_vector_range<number>
		viewport_axis( ): $mol_vector_range<number>
		axis_points( ): readonly(number)[]
		normalize( next?: number ): number
		precision( ): number
		sub( ): readonly(any)[]
		Label( id: any): $mol_svg_text
	}
	
}

//# sourceMappingURL=ruler.view.tree.d.ts.map
declare namespace $.$$ {
    class $mol_plot_ruler extends $.$mol_plot_ruler {
        labels_formatted(): $.$mol_svg_text[];
        step(): number;
        snap_to_grid(coord: number): number;
        axis_points(): number[];
        precision(): number;
        label_text(index: number): string;
        font_size(): number;
        back(): $mol_svg_path[];
        front(): readonly $.$mol_svg[];
    }
}

declare namespace $ {
}

declare namespace $ {

	export class $mol_plot_ruler_hor extends $mol_plot_ruler {
		title_align( ): string
		label_align( ): string
		title_pos_x( ): string
		title_pos_y( ): string
		label_pos_y( id: any): ReturnType< $mol_plot_ruler_hor['title_pos_y'] >
		background_width( ): string
	}
	
}

//# sourceMappingURL=hor.view.tree.d.ts.map
declare namespace $.$$ {
    class $mol_plot_ruler_hor extends $.$mol_plot_ruler_hor {
        dimensions_axis(): $mol_vector_range<number>;
        viewport_axis(): $mol_vector_range<number>;
        scale_axis(): number;
        scale_step(): number;
        shift_axis(): number;
        curve(): string;
        label_pos_x(index: number): string;
        background_y(): string;
        title_pos_y(): string;
        background_height(): string;
    }
}

declare namespace $ {
}

declare namespace $ {

	export class $mol_plot_ruler_vert extends $mol_plot_ruler {
		title_align( ): string
		label_align( ): string
		title_pos_y( ): string
		label_pos_x( id: any): ReturnType< $mol_plot_ruler_vert['title_pos_x'] >
		background_height( ): string
		background_width( ): ReturnType< $mol_plot_ruler_vert['title_pos_x'] >
	}
	
}

//# sourceMappingURL=vert.view.tree.d.ts.map
declare namespace $.$$ {
    class $mol_plot_ruler_vert extends $.$mol_plot_ruler_vert {
        dimensions_axis(): $mol_vector_range<number>;
        viewport_axis(): $mol_vector_range<number>;
        scale_axis(): number;
        scale_step(): number;
        shift_axis(): number;
        curve(): string;
        title_pos_x(): string;
        label_pos_y(index: number): string;
    }
}

declare namespace $ {
}

declare namespace $ {
    /** Plugin is component without its own DOM element, but instead uses the owner DOM element */
    class $mol_plugin extends $mol_view {
        dom_node_external(next?: Element): Element;
        render(): void;
    }
}

declare namespace $ {

	type $mol_vector_2d__mol_touch_1 = $mol_type_enforce<
		[ number, number ]
		,
		ConstructorParameters< typeof $mol_vector_2d<number> >
	>
	type $mol_vector_2d__mol_touch_2 = $mol_type_enforce<
		[ number, number ]
		,
		ConstructorParameters< typeof $mol_vector_2d<number> >
	>
	type $mol_vector_2d__mol_touch_3 = $mol_type_enforce<
		[ number, number ]
		,
		ConstructorParameters< typeof $mol_vector_2d<number> >
	>
	export class $mol_touch extends $mol_plugin {
		event_start( next?: any ): any
		event_move( next?: any ): any
		event_end( next?: any ): any
		event_leave( next?: any ): any
		event_wheel( next?: any ): any
		start_zoom( next?: number ): number
		start_distance( next?: number ): number
		zoom( next?: number ): number
		allow_draw( ): boolean
		allow_pan( ): boolean
		allow_zoom( ): boolean
		action_type( next?: string ): string
		action_point( next?: $mol_vector_2d<number> ): $mol_vector_2d<number>
		start_pan( next?: readonly(any)[] ): readonly(any)[]
		pan( next?: $mol_vector_2d<number> ): $mol_vector_2d<number>
		pointer_center( ): $mol_vector_2d<number>
		start_pos( next?: any ): any
		swipe_precision( ): number
		swipe_right( next?: any ): any
		swipe_bottom( next?: any ): any
		swipe_left( next?: any ): any
		swipe_top( next?: any ): any
		swipe_from_right( next?: any ): any
		swipe_from_bottom( next?: any ): any
		swipe_from_left( next?: any ): any
		swipe_from_top( next?: any ): any
		swipe_to_right( next?: any ): any
		swipe_to_bottom( next?: any ): any
		swipe_to_left( next?: any ): any
		swipe_to_top( next?: any ): any
		draw_start( next?: any ): any
		draw( next?: any ): any
		draw_end( next?: any ): any
		style( ): ({ 
			'touch-action': string,
			'overscroll-behavior': string,
		})  & ReturnType< $mol_plugin['style'] >
		event( ): ({ 
			pointerdown( next?: ReturnType< $mol_touch['event_start'] > ): ReturnType< $mol_touch['event_start'] >,
			pointermove( next?: ReturnType< $mol_touch['event_move'] > ): ReturnType< $mol_touch['event_move'] >,
			pointerup( next?: ReturnType< $mol_touch['event_end'] > ): ReturnType< $mol_touch['event_end'] >,
			pointerleave( next?: ReturnType< $mol_touch['event_leave'] > ): ReturnType< $mol_touch['event_leave'] >,
			wheel( next?: ReturnType< $mol_touch['event_wheel'] > ): ReturnType< $mol_touch['event_wheel'] >,
		})  & ReturnType< $mol_plugin['event'] >
	}
	
}

//# sourceMappingURL=touch.view.tree.d.ts.map
declare namespace $.$$ {
    /**
     * Plugin for touch gestures.
     * @see [mol_plugin](../plugin/readme.md)
     */
    class $mol_touch extends $.$mol_touch {
        auto(): void;
        pointer_events(next?: readonly PointerEvent[]): readonly PointerEvent[];
        pointer_coords(): $mol_vector<$mol_vector_2d<number>, number>;
        pointer_center(): $mol_vector_2d<number>;
        event_coords(event: PointerEvent | WheelEvent): $mol_vector_2d<number>;
        action_point(): $mol_vector_2d<number>;
        event_eat(event: PointerEvent | WheelEvent): string;
        event_start(event: PointerEvent): void;
        event_move(event: PointerEvent): void;
        event_end(event: PointerEvent): void;
        event_leave(event: PointerEvent): void;
        swipe_left(event: PointerEvent): void;
        swipe_right(event: PointerEvent): void;
        swipe_top(event: PointerEvent): void;
        swipe_bottom(event: PointerEvent): void;
        event_wheel(event: WheelEvent): void;
    }
}

declare namespace $ {
    let $mol_mem_cached: typeof $mol_wire_probe;
}

declare namespace $ {

	type $mol_vector_range__mol_plot_pane_1 = $mol_type_enforce<
		[ ReturnType< $mol_plot_pane['gap_left'] >, ReturnType< $mol_plot_pane['gap_right'] > ]
		,
		ConstructorParameters< typeof $mol_vector_range<number> >
	>
	type $mol_vector_range__mol_plot_pane_2 = $mol_type_enforce<
		[ ReturnType< $mol_plot_pane['gap_bottom'] >, ReturnType< $mol_plot_pane['gap_top'] > ]
		,
		ConstructorParameters< typeof $mol_vector_range<number> >
	>
	type $mol_vector_range__mol_plot_pane_3 = $mol_type_enforce<
		[ number, number ]
		,
		ConstructorParameters< typeof $mol_vector_range<number> >
	>
	type $mol_vector_range__mol_plot_pane_4 = $mol_type_enforce<
		[ number, number ]
		,
		ConstructorParameters< typeof $mol_vector_range<number> >
	>
	type $mol_vector_range__mol_plot_pane_5 = $mol_type_enforce<
		[ number, number ]
		,
		ConstructorParameters< typeof $mol_vector_range<number> >
	>
	type $mol_vector_range__mol_plot_pane_6 = $mol_type_enforce<
		[ number, number ]
		,
		ConstructorParameters< typeof $mol_vector_range<number> >
	>
	type $mol_vector_range__mol_plot_pane_7 = $mol_type_enforce<
		[ number, number ]
		,
		ConstructorParameters< typeof $mol_vector_range<number> >
	>
	type $mol_vector_range__mol_plot_pane_8 = $mol_type_enforce<
		[ number, number ]
		,
		ConstructorParameters< typeof $mol_vector_range<number> >
	>
	type $mol_vector_range__mol_plot_pane_9 = $mol_type_enforce<
		[ number, number ]
		,
		ConstructorParameters< typeof $mol_vector_range<number> >
	>
	type $mol_vector_range__mol_plot_pane_10 = $mol_type_enforce<
		[ number, number ]
		,
		ConstructorParameters< typeof $mol_vector_range<number> >
	>
	type $mol_touch__zoom_mol_plot_pane_11 = $mol_type_enforce<
		ReturnType< $mol_plot_pane['zoom'] >
		,
		ReturnType< $mol_touch['zoom'] >
	>
	type $mol_touch__pan_mol_plot_pane_12 = $mol_type_enforce<
		ReturnType< $mol_plot_pane['shift'] >
		,
		ReturnType< $mol_touch['pan'] >
	>
	type $mol_touch__allow_draw_mol_plot_pane_13 = $mol_type_enforce<
		ReturnType< $mol_plot_pane['allow_draw'] >
		,
		ReturnType< $mol_touch['allow_draw'] >
	>
	type $mol_touch__allow_pan_mol_plot_pane_14 = $mol_type_enforce<
		ReturnType< $mol_plot_pane['allow_pan'] >
		,
		ReturnType< $mol_touch['allow_pan'] >
	>
	type $mol_touch__allow_zoom_mol_plot_pane_15 = $mol_type_enforce<
		ReturnType< $mol_plot_pane['allow_zoom'] >
		,
		ReturnType< $mol_touch['allow_zoom'] >
	>
	type $mol_touch__draw_start_mol_plot_pane_16 = $mol_type_enforce<
		ReturnType< $mol_plot_pane['draw_start'] >
		,
		ReturnType< $mol_touch['draw_start'] >
	>
	type $mol_touch__draw_mol_plot_pane_17 = $mol_type_enforce<
		ReturnType< $mol_plot_pane['draw'] >
		,
		ReturnType< $mol_touch['draw'] >
	>
	type $mol_touch__draw_end_mol_plot_pane_18 = $mol_type_enforce<
		ReturnType< $mol_plot_pane['draw_end'] >
		,
		ReturnType< $mol_touch['draw_end'] >
	>
	type $mol_vector_2d__mol_plot_pane_19 = $mol_type_enforce<
		[ ReturnType< $mol_plot_pane['gap_x'] >, ReturnType< $mol_plot_pane['gap_y'] > ]
		,
		ConstructorParameters< typeof $mol_vector_2d<$mol_vector_range<number>> >
	>
	type $mol_vector_2d__mol_plot_pane_20 = $mol_type_enforce<
		[ ReturnType< $mol_plot_pane['shift_limit_x'] >, ReturnType< $mol_plot_pane['shift_limit_y'] > ]
		,
		ConstructorParameters< typeof $mol_vector_2d<$mol_vector_range<number>> >
	>
	type $mol_vector_2d__mol_plot_pane_21 = $mol_type_enforce<
		[ number, number ]
		,
		ConstructorParameters< typeof $mol_vector_2d<number> >
	>
	type $mol_vector_2d__mol_plot_pane_22 = $mol_type_enforce<
		[ number, number ]
		,
		ConstructorParameters< typeof $mol_vector_2d<number> >
	>
	type $mol_vector_2d__mol_plot_pane_23 = $mol_type_enforce<
		[ ReturnType< $mol_plot_pane['scale_limit_x'] >, ReturnType< $mol_plot_pane['scale_limit_y'] > ]
		,
		ConstructorParameters< typeof $mol_vector_2d<$mol_vector_range<number>> >
	>
	type $mol_vector_2d__mol_plot_pane_24 = $mol_type_enforce<
		[ number, number ]
		,
		ConstructorParameters< typeof $mol_vector_2d<number> >
	>
	type $mol_vector_2d__mol_plot_pane_25 = $mol_type_enforce<
		[ number, number ]
		,
		ConstructorParameters< typeof $mol_vector_2d<number> >
	>
	type $mol_vector_2d__mol_plot_pane_26 = $mol_type_enforce<
		[ number, number ]
		,
		ConstructorParameters< typeof $mol_vector_2d<number> >
	>
	type $mol_vector_2d__mol_plot_pane_27 = $mol_type_enforce<
		[ number, number ]
		,
		ConstructorParameters< typeof $mol_vector_2d<number> >
	>
	type $mol_vector_2d__mol_plot_pane_28 = $mol_type_enforce<
		[ ReturnType< $mol_plot_pane['dimensions_x'] >, ReturnType< $mol_plot_pane['dimensions_y'] > ]
		,
		ConstructorParameters< typeof $mol_vector_2d<$mol_vector_range<number>> >
	>
	type $mol_vector_2d__mol_plot_pane_29 = $mol_type_enforce<
		[ ReturnType< $mol_plot_pane['dimensions_viewport_x'] >, ReturnType< $mol_plot_pane['dimensions_viewport_y'] > ]
		,
		ConstructorParameters< typeof $mol_vector_2d<$mol_vector_range<number>> >
	>
	export class $mol_plot_pane extends $mol_svg_root {
		gap_x( ): $mol_vector_range<number>
		gap_y( ): $mol_vector_range<number>
		shift_limit_x( ): $mol_vector_range<number>
		shift_limit_y( ): $mol_vector_range<number>
		scale_limit_x( ): $mol_vector_range<number>
		scale_limit_y( ): $mol_vector_range<number>
		dimensions_x( ): $mol_vector_range<number>
		dimensions_y( ): $mol_vector_range<number>
		dimensions_viewport_x( ): $mol_vector_range<number>
		dimensions_viewport_y( ): $mol_vector_range<number>
		graphs_sorted( ): readonly($mol_svg)[]
		graphs( ): readonly($mol_plot_graph)[]
		graphs_positioned( ): ReturnType< $mol_plot_pane['graphs'] >
		graphs_visible( ): ReturnType< $mol_plot_pane['graphs_positioned'] >
		zoom( next?: number ): number
		cursor_position( ): ReturnType< ReturnType< $mol_plot_pane['Touch'] >['pointer_center'] >
		allow_draw( ): boolean
		allow_pan( ): boolean
		allow_zoom( ): boolean
		action_type( ): ReturnType< ReturnType< $mol_plot_pane['Touch'] >['action_type'] >
		action_point( ): ReturnType< ReturnType< $mol_plot_pane['Touch'] >['action_point'] >
		draw_start( next?: any ): any
		draw( next?: any ): any
		draw_end( next?: any ): any
		Touch( ): $mol_touch
		aspect( ): string
		hue_base( next?: number ): number
		hue_shift( next?: number ): number
		gap_hor( ): number
		gap_vert( ): number
		gap_left( ): ReturnType< $mol_plot_pane['gap_hor'] >
		gap_right( ): ReturnType< $mol_plot_pane['gap_hor'] >
		gap_top( ): ReturnType< $mol_plot_pane['gap_vert'] >
		gap_bottom( ): ReturnType< $mol_plot_pane['gap_vert'] >
		gap( ): $mol_vector_2d<$mol_vector_range<number>>
		shift_limit( ): $mol_vector_2d<$mol_vector_range<number>>
		shift_default( ): $mol_vector_2d<number>
		shift( next?: $mol_vector_2d<number> ): $mol_vector_2d<number>
		scale_limit( ): $mol_vector_2d<$mol_vector_range<number>>
		scale_default( ): $mol_vector_2d<number>
		scale( next?: $mol_vector_2d<number> ): $mol_vector_2d<number>
		scale_x( next?: number ): number
		scale_y( next?: number ): number
		size( ): $mol_vector_2d<number>
		size_real( ): $mol_vector_2d<number>
		dimensions( ): $mol_vector_2d<$mol_vector_range<number>>
		dimensions_viewport( ): $mol_vector_2d<$mol_vector_range<number>>
		sub( ): ReturnType< $mol_plot_pane['graphs_sorted'] >
		graphs_colored( ): ReturnType< $mol_plot_pane['graphs_visible'] >
		plugins( ): readonly(any)[]
	}
	
}

//# sourceMappingURL=pane.view.tree.d.ts.map
declare namespace $.$$ {
    /**
     * Fastest plot lib for vector graphics.
     * @see https://mol.hyoo.ru/#!section=demos/demo=mol_plot_demo
     */
    class $mol_plot_pane extends $.$mol_plot_pane {
        dimensions(): $mol_vector_2d<$mol_vector_range<number>>;
        size(): $mol_vector_2d<number>;
        graph_hue(index: number): number;
        graphs_colored(): $.$mol_plot_graph[];
        size_real(): $mol_vector_2d<number>;
        view_box(): string;
        scale_limit(): $mol_vector_2d<$mol_vector_range<number>>;
        scale_default(): $mol_vector_2d<number>;
        scale(next?: $mol_vector_2d<number>): $mol_vector_2d<number>;
        scale_x(next?: number): number;
        scale_y(next?: number): number;
        shift_limit(): $mol_vector_2d<$mol_vector_range<number>>;
        shift_default(): $mol_vector_2d<number>;
        graph_touched: boolean;
        shift(next?: $mol_vector_2d<number>): $mol_vector_2d<number>;
        reset(event?: Event): void;
        graphs_visible(): $.$mol_plot_graph[];
        graphs_positioned(): readonly $.$mol_plot_graph[];
        dimensions_viewport(): $mol_vector<$mol_vector_range<number>, 2>;
        viewport(): $mol_vector_2d<$mol_vector_range<number>>;
        graphs_sorted(): $.$mol_svg[];
    }
}

declare namespace $ {
}

declare namespace $ {

	type $mol_vector_2d__bog_vmap_scene_grid_1 = $mol_type_enforce<
		[ number, number ]
		,
		ConstructorParameters< typeof $mol_vector_2d<number> >
	>
	type $mol_vector_2d__bog_vmap_scene_grid_2 = $mol_type_enforce<
		[ number, number ]
		,
		ConstructorParameters< typeof $mol_vector_2d<number> >
	>
	type $bog_vmap_scene_grid_hor__title_bog_vmap_scene_grid_3 = $mol_type_enforce<
		string
		,
		ReturnType< $bog_vmap_scene_grid_hor['title'] >
	>
	type $bog_vmap_scene_grid_vert__title_bog_vmap_scene_grid_4 = $mol_type_enforce<
		string
		,
		ReturnType< $bog_vmap_scene_grid_vert['title'] >
	>
	export class $bog_vmap_scene_grid extends $mol_svg_root {
		rulers( ): readonly($mol_svg)[]
		aspect( ): string
		shift( ): $mol_vector_2d<number>
		scale( ): $mol_vector_2d<number>
		sub( ): ReturnType< $bog_vmap_scene_grid['rulers'] >
		Ruler_hor( ): $bog_vmap_scene_grid_hor
		Ruler_vert( ): $bog_vmap_scene_grid_vert
	}
	
	export class $bog_vmap_scene_grid_hor extends $mol_plot_ruler_hor {
		title( ): string
	}
	
	export class $bog_vmap_scene_grid_vert extends $mol_plot_ruler_vert {
		title( ): string
	}
	
}

//# sourceMappingURL=grid.view.tree.d.ts.map
declare namespace $.$$ {
    /**
     * Infinite background grid. Feeds two rulers of the plotting module the same way
     * its pane feeds its graphs, and renders only their curves.
     * @see ../../ARCHITECTURE.md section 8
     */
    class $bog_vmap_scene_grid extends $.$bog_vmap_scene_grid {
        size_real(): $mol_vector_2d<number>;
        view_box(): string;
        viewport(): $mol_vector_2d<$mol_vector_range<number>>;
        gap(): $mol_vector_2d<$mol_vector_range<number>>;
        /** Viewport in world coordinates, by the formula from $mol_plot_pane. */
        dimensions_viewport(): $mol_vector<$mol_vector_range<number>, 2>;
        rulers(): $mol_svg_path[];
    }
    /** Base clamps its lines to 1000px tall. The canvas is whatever the window is. */
    class $bog_vmap_scene_grid_hor extends $.$bog_vmap_scene_grid_hor {
        curve(): string;
    }
    /** Same story, base clamps its lines to 2000px wide. */
    class $bog_vmap_scene_grid_vert extends $.$bog_vmap_scene_grid_vert {
        curve(): string;
    }
}

declare namespace $ {
    /** A rectangle in world units. Same shape the bridge reports geometry in. */
    type $bog_vmap_scene_cull_box = {
        readonly x: number;
        readonly y: number;
        readonly width: number;
        readonly height: number;
    };
    /**
     * Which free parts the scene has to draw for a given viewport.
     *
     * Pure arithmetic, deliberately kept out of the view: this is the whole of the
     * culling decision, and a decision worth testing is worth being able to test
     * without a DOM, a camera or a compiled document.
     *
     * **Culling decides what is DRAWN and never what is STORED.** Nothing here
     * touches the document, and nothing it returns is written back anywhere: the
     * source of a document must not depend on where the camera happens to point,
     * not by a byte. That is the first invariant of the feature and the reason this
     * function takes geometry and returns names, rather than taking a document.
     *
     * @param spots where the host placed each part, world coordinates
     * @param sizes last measured box of each part, by the same names
     * @param view world rectangle currently on screen
     * @param slack world units added to every side of the viewport
     */
    function $bog_vmap_scene_cull(spots: {
        readonly [name: string]: {
            readonly x: number;
            readonly y: number;
        };
    }, sizes: {
        readonly [name: string]: $bog_vmap_scene_cull_box;
    }, view: $bog_vmap_scene_cull_box, slack: number, names: readonly string[]): Set<string>;
    /**
     * The world rectangle a viewport covers under a camera.
     *
     * The camera is the world point at the top left plus an isotropic zoom, so the
     * world is `screen / zoom` wide. A zoom of zero would make that infinite, and
     * the host clamps it well away from there, but a division that can produce
     * `Infinity` on a message from outside is not worth leaving open.
     */
    function $bog_vmap_scene_cull_viewport(camera: {
        readonly x: number;
        readonly y: number;
        readonly zoom: number;
    }, screen: {
        readonly width: number;
        readonly height: number;
    }): $bog_vmap_scene_cull_box;
}

declare namespace $ {
    /**
     * Wire protocol between the vmap host and its sandboxed scene.
     *
     * The scene lives in an opaque origin, so `postMessage` is the only channel.
     * Everything here is plain data: it must survive a structured clone.
     *
     * Direction is part of the type on purpose. The host owns the document text,
     * the camera and the geometry; the scene only compiles, renders and measures.
     * @see ../ARCHITECTURE.md section 4
     */
    const $bog_vmap_bridge_ns = "bog_vmap";
    type $bog_vmap_bridge_camera = {
        /** World coordinate under the left edge of the viewport. */
        readonly x: number;
        /** World coordinate under the top edge of the viewport. */
        readonly y: number;
        /** Isotropic zoom, as in Figma. Never per-axis. */
        readonly zoom: number;
    };
    type $bog_vmap_bridge_rect = {
        readonly x: number;
        readonly y: number;
        readonly width: number;
        readonly height: number;
    };
    /** Texts and nothing else: the scene has no way to reach the land itself. */
    type $bog_vmap_bridge_part = {
        readonly tree: string;
        readonly js: string;
        readonly css: string;
    };
    /** Modifier keys of a relayed click. Named as `MouseEventInit` names them, so they spread straight into one. */
    type $bog_vmap_bridge_mods = {
        readonly altKey: boolean;
        readonly ctrlKey: boolean;
        readonly metaKey: boolean;
        readonly shiftKey: boolean;
    };
    /**
     * Host to scene. `doc_set` carries the whole document, not a patch: the scene
     * holds no source of truth of its own and must never have to merge.
     */
    type $bog_vmap_bridge_down = {
        readonly kind: 'doc_set';
        /**
         * Declaration order is NOT guaranteed: sorting is the scene's job,
         * because only the scene knows the whole set of classes going into
         * one compiled string — the document's own plus everything its
         * libraries contribute.
         */
        readonly src: string;
        /**
         * Hand written bodies, keyed by class name, absent for a class without
         * one. Without them every property stays undecorated, and an undecorated
         * property is invisible to the hot swap of stage 4.
         */
        readonly js: {
            readonly [klass: string]: string;
        };
        /** Name of the root class to instantiate. */
        readonly root: string;
    } | {
        readonly kind: 'css_set';
        /** Styles travel apart from the source so that a CSS edit keeps live state. */
        readonly css: string;
    } | {
        readonly kind: 'camera_set';
        readonly camera: $bog_vmap_bridge_camera;
    } | {
        /**
         * World coordinates, and a channel of its own apart from `css_set` —
         * that is the whole point: the scene hangs these as its own style
         * element, so the document's styles never carry them and the export
         * cannot see them even by accident. Placement is editor state, not
         * site content.
         *
         * Scaffolding until artboards (stage 6): inside an artboard layout is
         * a plain flex tree, and only free details lie by coordinates. The
         * "everything absolute" model was considered and rejected.
         */
        readonly kind: 'spots_set';
        readonly spots: {
            readonly [node: string]: {
                readonly x: number;
                readonly y: number;
            };
        };
    } | {
        /**
         * There are no editor modes: the overlay takes every gesture, so a plain
         * click — press and release without movement — is relayed here and the
         * scene replays it on the element under the point, with focus. One click
         * therefore both picks a part on the host and presses the live component.
         *
         * World coordinates, not screen ones: each side resolves its own camera,
         * so neither has to know the other's pixel geometry.
         *
         * Answered like every other push, with `sizes`: a click is the most
         * likely thing to start a loop in document code, so a scene that takes
         * one and says nothing back is exactly what the watchdog has to notice.
         */
        readonly kind: 'click_at';
        readonly x: number;
        readonly y: number;
        readonly mods: $bog_vmap_bridge_mods;
    } | {
        /**
         * Ordinary traffic already carries a pulse: every push of the host is
         * answered with `sizes`. One blind spot is left — document code hung
         * while nobody was pushing it, because the live component was pressed by
         * a real event through the hole in the overlay. So the pulse runs always,
         * from the first `sizes` on.
         */
        readonly kind: 'ping';
        readonly nonce: number;
    } | {
        readonly kind: 'asset_put';
        readonly id: string;
        readonly mime: string;
        /** Bytes, not a blob: URL. A host blob: URL is dead in an opaque origin. */
        readonly bytes: ArrayBuffer;
    } | {
        /**
         * Sources of the land libraries attached to the document.
         *
         * A land arrives as text and is compiled into the same sandbox as the
         * document, so a change of the list is a recompile — unlike `pack_set`,
         * which travels the same wire but is answered by a fresh frame, because a
         * realm cannot unload a bundle. The whole list every time, in the order
         * the classes should be declared — the scene sorts by inheritance anyway
         * and merges nothing.
         *
         * The host reads the lands, because only the host may touch the
         * database; the scene sees strings.
         * @see ../ARCHITECTURE.md sections 4 and 5
         */
        readonly kind: 'libs_set';
        readonly parts: readonly $bog_vmap_bridge_part[];
    } | {
        /**
         * Donor pack the scene is to load into its realm, as an absolute URL of
         * the `web.js` of a deployed module. Empty means no pack, which the scene
         * answers by compiling nothing at all.
         *
         * On the bridge and not in the address of the frame, because the frame
         * has no address: it is raised from markup handed to it, so there is no
         * query string to carry anything. The rule of section 5 — one pack per
         * realm, a second one poisons the palette silently — is held by the host
         * instead: the address of the pack is part of the key of the frame, so a
         * different pack is a different frame element and a fresh realm.
         *
         * Sent first of everything after the handshake. A document compiled
         * before the pack lands inherits the base view class of the scene's own
         * bundle and no later load can move it, so the scene waits for this
         * message before it compiles anything.
         * @see ../ARCHITECTURE.md sections 4 and 5
         */
        readonly kind: 'pack_set';
        readonly uri: string;
    } | {
        /**
         * Which wires the host wants values for: the root properties of the
         * wires drawn on screen right now, and only those. The whole list every
         * time; an empty list stops the flow. The host knows what is visible,
         * the scene knows the values, so the question goes down and the answer
         * comes up as `values`.
         */
        readonly kind: 'values_want';
        readonly names: readonly string[];
    };
    /** Scene to host. */
    type $bog_vmap_bridge_up = {
        readonly kind: 'ready';
    } | {
        /** Answers `ping` with the same nonce: a live thread, not a live frame. */
        readonly kind: 'pong';
        readonly nonce: number;
    } | {
        /**
         * Geometry of the nodes DRAWN this round, not of every node there is.
         *
         * With culling, silence about a node means «was not drawn» and not «is
         * gone», so the host must MERGE rather than replace: otherwise the boxes
         * of everything just hidden are wiped, and the selection ring, which is
         * drawn out of exactly those, blinks at the edge of the canvas. Absence
         * therefore has to be said by someone explicitly, and that someone is the
         * removal of a node from the document.
         */
        readonly kind: 'sizes';
        readonly sizes: {
            readonly [node: string]: $bog_vmap_bridge_rect;
        };
    } | {
        /**
         * Current values of the wires the host asked for in `values_want`,
         * keyed by the root property of the wire, as short text. A read that
         * throws comes back as the text of the error, so a broken wire is
         * labelled rather than the scene taken down. Throttled by the scene.
         */
        readonly kind: 'values';
        readonly values: {
            readonly [wire: string]: string;
        };
    } | {
        readonly kind: 'asset_want';
        readonly id: string;
    } | {
        /**
         * A key pressed while the focus was inside the frame, relayed for the
         * editor to act on: with the pointer let inside a part the keydown lands
         * in the document of the frame and the host's listener never sees it.
         * Only keys the editor reacts to travel — `Escape` — never what is being
         * typed into the document.
         */
        readonly kind: 'key';
        readonly key: 'Escape';
    } | {
        readonly kind: 'error';
        /** Channel. The two clear independently. */
        readonly at: 'compile' | 'runtime';
        /**
         * `null` means the channel is clear again. Errors are edge-triggered, so
         * a repeated identical failure stays silent, and without an explicit
         * clear the host could not tell a fixed document from a still broken one.
         * Null rather than an empty string on purpose: an empty error text is a
         * plausible bug and must not read as good news.
         */
        readonly message: string | null;
        /** Node the failure belongs to, when the scene can attribute it. */
        readonly node?: string;
    };
    type $bog_vmap_bridge_message = $bog_vmap_bridge_down | $bog_vmap_bridge_up;
    /** Puts a message on the wire. Target is the peer window. */
    function $bog_vmap_bridge_send<Message extends $bog_vmap_bridge_message>(target: {
        postMessage(data: unknown, origin: string): void;
    }, message: Message): void;
    /**
     * Takes a message off the wire, or null when it is not ours. The channel has no
     * origin to check against — the scene runs in an opaque one — so anything able
     * to reach this window can post here, and unknown shapes are dropped.
     *
     * Always pass `peer` on the host side. Without it any window that posts a
     * `ready` takes the channel over: seen for real on stage 1, where a stray debug
     * frame stole the bridge and the host spent an hour posting into a dead window.
     * Identity comes from the frame element, never from `event.source`.
     *
     * Passing the argument at all turns the check on, so a peer not known yet
     * rejects everything instead of letting everything through. Omitting it is the
     * only way to opt out, and only the scene may: it has one correspondent and
     * answers into the same window.
     */
    function $bog_vmap_bridge_read<Message extends $bog_vmap_bridge_message>(event: {
        data?: unknown;
        source?: unknown;
    }, peer?: unknown): Message | null;
}

declare namespace $ {
    /**
     * Convert asynchronous (promise-based) API to synchronous by wrapping function and method calls in a fiber.
     * @see https://mol.hyoo.ru/#!section=docs/=1fcpsq_1wh0h2
     */
    export function $mol_wire_sync<Host extends object>(obj: Host): ObjectOrFunctionResultAwaited<Host>;
    type FunctionResultAwaited<Some> = Some extends (...args: infer Args) => infer Res ? (...args: Args) => Awaited<Res> : Some;
    type ConstructorResultAwaited<Some> = Some extends new (...args: infer Args) => infer Res ? new (...args: Args) => Res : {};
    type MethodsResultAwaited<Host extends Object> = {
        [K in keyof Host]: FunctionResultAwaited<Host[K]>;
    };
    type ObjectOrFunctionResultAwaited<Some> = (Some extends (...args: any) => unknown ? FunctionResultAwaited<Some> : {}) & (Some extends Object ? MethodsResultAwaited<Some> & ConstructorResultAwaited<Some> : Some);
    export {};
}

declare namespace $ {
    /** Dynamic sources import. */
    class $mol_import extends $mol_object2 {
        static module(uri: string): any;
        static module_async(uri: string): Promise<any>;
        static script(uri: string): any;
        static script_async(uri: string): Promise<any>;
        static style(uri: string): any;
        static style_async(uri: string): any;
    }
}

declare namespace $ {
    /** Position in any resource. */
    class $mol_span extends $mol_object2 {
        readonly uri: string;
        readonly source: string;
        readonly row: number;
        readonly col: number;
        readonly length: number;
        constructor(uri: string, source: string, row: number, col: number, length: number);
        /** Span for begin of unknown resource */
        static unknown: $mol_span;
        /** Makes new span for begin of resource. */
        static begin(uri: string, source?: string): $mol_span;
        /** Makes new span for end of resource. */
        static end(uri: string, source: string): $mol_span;
        /** Makes new span for entire resource. */
        static entire(uri: string, source: string): $mol_span;
        toString(): string;
        toJSON(): {
            uri: string;
            row: number;
            col: number;
            length: number;
        };
        /** Makes new error for this span. */
        error(message: string, Class?: ErrorConstructor): Error;
        /** Makes new span for same uri. */
        span(row: number, col: number, length: number): $mol_span;
        /** Makes new span after end of this. */
        after(length?: number): $mol_span;
        /** Makes new span between begin and end. */
        slice(begin: number, end?: number): $mol_span;
    }
}

declare namespace $ {
    /** Syntax error with cordinates and source line snippet. */
    class $mol_error_syntax extends SyntaxError {
        reason: string;
        line: string;
        span: $mol_span;
        constructor(reason: string, line: string, span: $mol_span);
    }
}

declare namespace $ {
    /** Parses tree format from string. */
    function $mol_tree2_from_string(this: $, str: string, uri?: string): $mol_tree2;
}

declare namespace $ {
    /** Serializes tree to string in tree format. */
    function $mol_tree2_to_string(this: $, tree: $mol_tree2): string;
}

declare namespace $ {
    /** Path by types in tree. */
    type $mol_tree2_path = Array<string | number | null>;
    /** Hask tool for processing node. */
    type $mol_tree2_hack<Context> = (input: $mol_tree2, belt: $mol_tree2_belt<Context>, context: Context) => readonly $mol_tree2[];
    /** Collection of hask tools for processing tree. */
    type $mol_tree2_belt<Context> = Record<string, $mol_tree2_hack<Context>>;
    /**
     * Abstract Syntax Tree with human readable serialization.
     * Avoid direct instantiation. Use static factories instead.
     * @see https://github.com/nin-jin/tree.d
     */
    class $mol_tree2 extends Object {
        /** Type of structural node, `value` should be empty */
        readonly type: string;
        /** Content of data node, `type` should be empty */
        readonly value: string;
        /** Child nodes */
        readonly kids: readonly $mol_tree2[];
        /** Position in most far source resource */
        readonly span: $mol_span;
        constructor(
        /** Type of structural node, `value` should be empty */
        type: string, 
        /** Content of data node, `type` should be empty */
        value: string, 
        /** Child nodes */
        kids: readonly $mol_tree2[], 
        /** Position in most far source resource */
        span: $mol_span);
        /** Makes collection node. */
        static list(kids: readonly $mol_tree2[], span?: $mol_span): $mol_tree2;
        /** Makes new derived collection node. */
        list(kids: readonly $mol_tree2[]): $mol_tree2;
        /** Makes data node for any string. */
        static data(value: string, kids?: readonly $mol_tree2[], span?: $mol_span): $mol_tree2;
        /** Makes new derived data node. */
        data(value: string, kids?: readonly $mol_tree2[]): $mol_tree2;
        /** Makes struct node. */
        static struct(type: string, kids?: readonly $mol_tree2[], span?: $mol_span): $mol_tree2;
        /** Makes new derived structural node. */
        struct(type: string, kids?: readonly $mol_tree2[]): $mol_tree2;
        /** Makes new derived node with different kids id defined. */
        clone(kids: readonly $mol_tree2[], span?: $mol_span): $mol_tree2;
        /** Returns multiline text content. */
        text(): string;
        /** Parses tree format. */
        /** @deprecated Use $mol_tree2_from_string */
        static fromString(str: string, uri?: string): $mol_tree2;
        /** Serializes to tree format. */
        toString(): string;
        /** Makes new tree with node overrided by path. */
        insert(value: $mol_tree2 | null, ...path: $mol_tree2_path): $mol_tree2;
        /** Makes new tree with node overrided by path. */
        update(value: readonly $mol_tree2[], ...path: $mol_tree2_path): readonly $mol_tree2[];
        /** Query nodes by path. */
        select(...path: $mol_tree2_path): $mol_tree2;
        /** Filter kids by path or value. */
        filter(path: string[], value?: string): $mol_tree2;
        hack_self<Context extends {
            span?: $mol_span;
            [key: string]: unknown;
        } = {}>(belt: $mol_tree2_belt<Context>, context?: Context): readonly $mol_tree2[];
        /** Transform tree through context with transformers */
        hack<Context extends {
            span?: $mol_span;
            [key: string]: unknown;
        } = {}>(belt: $mol_tree2_belt<Context>, context?: Context): $mol_tree2[];
        /** Makes Error with node coordinates. */
        error(message: string, Class?: ErrorConstructor): Error;
    }
    class $mol_tree2_empty extends $mol_tree2 {
        constructor();
    }
}

declare namespace $ {
    class $mol_view_tree2_error extends Error {
        readonly spans: readonly $mol_span[];
        constructor(message: string, spans: readonly $mol_span[]);
        toJSON(): {
            message: string;
            spans: readonly $mol_span[];
        };
    }
    class $mol_view_tree2_error_suggestions {
        readonly suggestions: readonly string[];
        constructor(suggestions: readonly string[]);
        toString(): string;
        toJSON(): readonly string[];
    }
    function $mol_view_tree2_error_str(strings: readonly string[], ...parts: readonly ($mol_span | readonly $mol_span[] | string | number | $mol_view_tree2_error_suggestions)[]): $mol_view_tree2_error;
}

declare namespace $ {
    function $mol_view_tree2_child(this: $, tree: $mol_tree2): $mol_tree2;
}

declare namespace $ {
    function $mol_view_tree2_classes(defs: $mol_tree2): $mol_tree2;
}

declare namespace $ {
    function $mol_view_tree2_normalize(this: $, defs: $mol_tree2): $mol_tree2;
}

declare namespace $ {
    /**
     * Return `unknown` when `A` and `B` are the same type. `never` otherwise.
     *
     * 	$mol_type_equals< unknown , any > & number // true
     * 	$mol_type_equals< never , never > & number // false
     */
    type $mol_type_equals<A, B> = (<X>() => X extends A ? 1 : 2) extends (<X>() => X extends B ? 1 : 2) ? true : false;
}

declare namespace $ {
    /**
     * Reqursive converts intersection of records to record of intersections
     *
     * 	// { a : { x : 1 , y : 2 } }
     * 	$mol_type_merge< { a : { x : 1 } }&{ a : { y : 2 } } >
     */
    type $mol_type_merge<Intersection> = Intersection extends (...a: any[]) => any ? Intersection : Intersection extends new (...a: any[]) => any ? Intersection : Intersection extends object ? $mol_type_merge_object<Intersection> extends Intersection ? true extends $mol_type_equals<{
        [Key in keyof Intersection]: Intersection[Key];
    }, Intersection> ? Intersection : {
        [Key in keyof Intersection]: $mol_type_merge<Intersection[Key]>;
    } : Intersection : Intersection;
    /**
     * Flat converts intersection of records to record of intersections
     *
     * 	// { a: 1, b: 2 }
     * 	$mol_type_merge< { a: 1 } & { b: 2 } >
     */
    type $mol_type_merge_object<Intersection> = {
        [Key in keyof Intersection]: Intersection[Key];
    };
}

declare namespace $ {
    /**
     * Converts union of types to intersection of same types
     *
     * 	$mol_type_intersect< number | string > // number & string
     */
    type $mol_type_intersect<Union> = (Union extends any ? (_: Union) => void : never) extends ((_: infer Intersection) => void) ? Intersection : never;
}

declare namespace $ {
    type $mol_unicode_category = [$mol_unicode_category_binary] | ['General_Category', $mol_char_category_general] | ['Script', $mol_unicode_category_script] | ['Script_Extensions', $mol_unicode_category_script];
    type $mol_unicode_category_binary = 'ASCII' | 'ASCII_Hex_Digit' | 'Alphabetic' | 'Any' | 'Assigned' | 'Bidi_Control' | 'Bidi_Mirrored' | 'Case_Ignorable' | 'Cased' | 'Changes_When_Casefolded' | 'Changes_When_Casemapped' | 'Changes_When_Lowercased' | 'Changes_When_NFKC_Casefolded' | 'Changes_When_Titlecased' | 'Changes_When_Uppercased' | 'Dash' | 'Default_Ignorable_Code_Point' | 'Deprecated' | 'Diacritic' | 'Emoji' | 'Emoji_Component' | 'Emoji_Modifier' | 'Emoji_Modifier_Base' | 'Emoji_Presentation' | 'Extended_Pictographic' | 'Extender' | 'Grapheme_Base' | 'Grapheme_Extend' | 'Hex_Digit' | 'IDS_Binary_Operator' | 'IDS_Trinary_Operator' | 'ID_Continue' | 'ID_Start' | 'Ideographic' | 'Join_Control' | 'Logical_Order_Exception' | 'Lowercase' | 'Math' | 'Noncharacter_Code_Point' | 'Pattern_Syntax' | 'Pattern_White_Space' | 'Quotation_Mark' | 'Radical' | 'Regional_Indicator' | 'Sentence_Terminal' | 'Soft_Dotted' | 'Terminal_Punctuation' | 'Unified_Ideograph' | 'Uppercase' | 'Variation_Selector' | 'White_Space' | 'XID_Continue' | 'XID_Start';
    type $mol_char_category_general = 'Cased_Letter' | 'Close_Punctuation' | 'Connector_Punctuation' | 'Control' | 'Currency_Symbol' | 'Dash_Punctuation' | 'Decimal_Number' | 'Enclosing_Mark' | 'Final_Punctuation' | 'Format' | 'Initial_Punctuation' | 'Letter' | 'Letter_Number' | 'Line_Separator' | 'Lowercase_Letter' | 'Mark' | 'Math_Symbol' | 'Modifier_Letter' | 'Modifier_Symbol' | 'Nonspacing_Mark' | 'Number' | 'Open_Punctuation' | 'Other' | 'Other_Letter' | 'Other_Number' | 'Other_Punctuation' | 'Other_Symbol' | 'Paragraph_Separator' | 'Private_Use' | 'Punctuation' | 'Separator' | 'Space_Separator' | 'Spacing_Mark' | 'Surrogate' | 'Symbol' | 'Titlecase_Letter' | 'Unassigned' | 'Uppercase_Letter';
    type $mol_unicode_category_script = 'Adlam' | 'Ahom' | 'Anatolian_Hieroglyphs' | 'Arabic' | 'Armenian' | 'Avestan' | 'Balinese' | 'Bamum' | 'Bassa_Vah' | 'Batak' | 'Bengali' | 'Bhaiksuki' | 'Bopomofo' | 'Brahmi' | 'Braille' | 'Buginese' | 'Buhid' | 'Canadian_Aboriginal' | 'Carian' | 'Caucasian_Albanian' | 'Chakma' | 'Cham' | 'Chorasmian' | 'Cherokee' | 'Common' | 'Coptic' | 'Cuneiform' | 'Cypriot' | 'Cyrillic' | 'Deseret' | 'Devanagari' | 'Dives_Akuru' | 'Dogra' | 'Duployan' | 'Egyptian_Hieroglyphs' | 'Elbasan' | 'Elymaic' | 'Ethiopic' | 'Georgian' | 'Glagolitic' | 'Gothic' | 'Grantha' | 'Greek' | 'Gujarati' | 'Gunjala_Gondi' | 'Gurmukhi' | 'Han' | 'Hangul' | 'Hanifi_Rohingya' | 'Hanunoo' | 'Hatran' | 'Hebrew' | 'Hiragana' | 'Imperial_Aramaic' | 'Inherited' | 'Inscriptional_Pahlavi' | 'Inscriptional_Parthian' | 'Javanese' | 'Kaithi' | 'Kannada' | 'Katakana' | 'Kayah_Li' | 'Kharoshthi' | 'Khitan_Small_Script' | 'Khmer' | 'Khojki' | 'Khudawadi' | 'Lao' | 'Latin' | 'Lepcha' | 'Limbu' | 'Linear_A' | 'Linear_B' | 'Lisu' | 'Lycian' | 'Lydian' | 'Mahajani' | 'Makasar' | 'Malayalam' | 'Mandaic' | 'Manichaean' | 'Marchen' | 'Medefaidrin' | 'Masaram_Gondi' | 'Meetei_Mayek' | 'Mende_Kikakui' | 'Meroitic_Cursive' | 'Meroitic_Hieroglyphs' | 'Miao' | 'Modi' | 'Mongolian' | 'Mro' | 'Multani' | 'Myanmar' | 'Nabataean' | 'Nandinagari' | 'New_Tai_Lue' | 'Newa' | 'Nko' | 'Nushu' | 'Nyiakeng_Puachue_Hmong' | 'Ogham' | 'Ol_Chiki' | 'Old_Hungarian' | 'Old_Italic' | 'Old_North_Arabian' | 'Old_Permic' | 'Old_Persian' | 'Old_Sogdian' | 'Old_South_Arabian' | 'Old_Turkic' | 'Oriya' | 'Osage' | 'Osmanya' | 'Pahawh_Hmong' | 'Palmyrene' | 'Pau_Cin_Hau' | 'Phags_Pa' | 'Phoenician' | 'Psalter_Pahlavi' | 'Rejang' | 'Runic' | 'Samaritan' | 'Saurashtra' | 'Sharada' | 'Shavian' | 'Siddham' | 'SignWriting' | 'Sinhala' | 'Sogdian' | 'Sora_Sompeng' | 'Soyombo' | 'Sundanese' | 'Syloti_Nagri' | 'Syriac' | 'Tagalog' | 'Tagbanwa' | 'Tai_Le' | 'Tai_Tham' | 'Tai_Viet' | 'Takri' | 'Tamil' | 'Tangut' | 'Telugu' | 'Thaana' | 'Thai' | 'Tibetan' | 'Tifinagh' | 'Tirhuta' | 'Ugaritic' | 'Vai' | 'Wancho' | 'Warang_Citi' | 'Yezidi' | 'Yi' | 'Zanabazar_Square';
}

interface String {
    match<RE extends RegExp>(regexp: RE): ReturnType<RE[typeof Symbol.match]>;
    matchAll<RE extends RegExp>(regexp: RE): ReturnType<RE[typeof Symbol.matchAll]>;
}
declare namespace $ {
    type Groups_to_params<T> = {
        [P in keyof T]?: T[P] | boolean | undefined;
    };
    export type $mol_regexp_source = number | string | RegExp | {
        [key in string]: $mol_regexp_source;
    } | readonly [$mol_regexp_source, ...$mol_regexp_source[]];
    export type $mol_regexp_groups<Source extends $mol_regexp_source> = Source extends number ? {} : Source extends string ? {} : Source extends $mol_regexp_source[] ? $mol_type_merge<$mol_type_intersect<{
        [key in Extract<keyof Source, number>]: $mol_regexp_groups<Source[key]>;
    }[Extract<keyof Source, number>]>> : Source extends RegExp ? Record<string, string> extends NonNullable<NonNullable<ReturnType<Source['exec']>>['groups']> ? {} : NonNullable<NonNullable<ReturnType<Source['exec']>>['groups']> : Source extends {
        readonly [key in string]: $mol_regexp_source;
    } ? $mol_type_merge<$mol_type_intersect<{
        [key in keyof Source]: $mol_type_merge<$mol_type_override<{
            readonly [k in Extract<keyof Source, string>]: string;
        }, {
            readonly [k in key]: Source[key] extends string ? Source[key] : string;
        }> & $mol_regexp_groups<Source[key]>>;
    }[keyof Source]>> : never;
    /** Type safe reguar expression builder */
    export class $mol_regexp<Groups extends Record<string, string>> extends RegExp {
        readonly groups: (Extract<keyof Groups, string>)[];
        /** Prefer to use $mol_regexp.from */
        constructor(source: string, flags?: string, groups?: (Extract<keyof Groups, string>)[]);
        [Symbol.matchAll](str: string): RegExpStringIterator<RegExpExecArray & $mol_type_override<RegExpExecArray, {
            groups?: {
                [key in keyof Groups]: string;
            };
        }>>;
        /** Parses input and returns found capture groups or null */
        [Symbol.match](str: string): null | RegExpMatchArray;
        /** Splits string by regexp edges */
        [Symbol.split](str: string): string[];
        test(str: string): boolean;
        exec(str: string): RegExpExecArray & $mol_type_override<RegExpExecArray, {
            groups?: {
                [key in keyof Groups]: string;
            };
        }> | null;
        generate(params: Groups_to_params<Groups>): string | null;
        get native(): RegExp;
        /** Makes regexp that greedy repeats this pattern with delimiter */
        static separated<Chunk extends $mol_regexp_source, Sep extends $mol_regexp_source>(chunk: Chunk, sep: Sep): $mol_regexp<[$mol_regexp<[[Chunk], Sep] extends infer T ? T extends [[Chunk], Sep] ? T extends $mol_regexp_source[] ? $mol_type_merge<$mol_type_intersect<{ [key in Extract<keyof T, number>]: $mol_regexp_groups<T[key]>; }[Extract<keyof T, number>]>> : T extends RegExp ? Record<string, string> extends NonNullable<NonNullable<ReturnType<T["exec"]>>["groups"]> ? {} : NonNullable<NonNullable<ReturnType<T["exec"]>>["groups"]> : T extends {
            readonly [x: string]: $mol_regexp_source;
        } ? $mol_type_merge<$mol_type_intersect<{ [key_1 in keyof T]: $mol_type_merge<Omit<{ readonly [k in Extract<keyof T, string>]: string; }, key_1> & { readonly [k_1 in key_1]: T[key_1] extends string ? T[key_1] : string; } & $mol_regexp_groups<T[key_1]>>; }[keyof T]>> : never : never : never>, Chunk] extends infer T_1 ? T_1 extends [$mol_regexp<[[Chunk], Sep] extends infer T_2 ? T_2 extends [[Chunk], Sep] ? T_2 extends $mol_regexp_source[] ? $mol_type_merge<$mol_type_intersect<{ [key_4 in Extract<keyof T_2, number>]: $mol_regexp_groups<T_2[key_4]>; }[Extract<keyof T_2, number>]>> : T_2 extends RegExp ? Record<string, string> extends NonNullable<NonNullable<ReturnType<T_2["exec"]>>["groups"]> ? {} : NonNullable<NonNullable<ReturnType<T_2["exec"]>>["groups"]> : T_2 extends {
            readonly [x: string]: $mol_regexp_source;
        } ? $mol_type_merge<$mol_type_intersect<{ [key_5 in keyof T_2]: $mol_type_merge<Omit<{ readonly [k in Extract<keyof T_2, string>]: string; }, key_5> & { readonly [k_1 in key_5]: T_2[key_5] extends string ? T_2[key_5] : string; } & $mol_regexp_groups<T_2[key_5]>>; }[keyof T_2]>> : never : never : never>, Chunk] ? T_1 extends $mol_regexp_source[] ? $mol_type_merge<$mol_type_intersect<{ [key_2 in Extract<keyof T_1, number>]: $mol_regexp_groups<T_1[key_2]>; }[Extract<keyof T_1, number>]>> : T_1 extends RegExp ? Record<string, string> extends NonNullable<NonNullable<ReturnType<T_1["exec"]>>["groups"]> ? {} : NonNullable<NonNullable<ReturnType<T_1["exec"]>>["groups"]> : T_1 extends {
            readonly [x: string]: $mol_regexp_source;
        } ? $mol_type_merge<$mol_type_intersect<{ [key_3 in keyof T_1]: $mol_type_merge<Omit<{ readonly [k in Extract<keyof T_1, string>]: string; }, key_3> & { readonly [k_1 in key_3]: T_1[key_3] extends string ? T_1[key_3] : string; } & $mol_regexp_groups<T_1[key_3]>>; }[keyof T_1]>> : never : never : never>;
        /** Makes regexp that non-greedy repeats this pattern from min to max count */
        static repeat<Source extends $mol_regexp_source>(source: Source, min?: number, max?: number): $mol_regexp<$mol_regexp_groups<Source>>;
        /** Makes regexp that greedy repeats this pattern from min to max count */
        static repeat_greedy<Source extends $mol_regexp_source>(source: Source, min?: number, max?: number): $mol_regexp<$mol_regexp_groups<Source>>;
        /** Makes regexp that match any of options */
        static vary<Sources extends readonly $mol_regexp_source[]>(sources: Sources, flags?: string): $mol_regexp<$mol_regexp_groups<Sources[number]>>;
        /** Makes regexp that allow absent of this pattern */
        static optional<Source extends $mol_regexp_source>(source: Source): $mol_regexp<$mol_regexp_groups<Source>>;
        /** Makes regexp that look ahead for pattern */
        static force_after(source: $mol_regexp_source): $mol_regexp<Record<string, string>>;
        /** Makes regexp that look ahead for pattern */
        static forbid_after(source: $mol_regexp_source): $mol_regexp<Record<string, string>>;
        /** Converts some js values to regexp */
        static from<Source extends $mol_regexp_source>(source: Source, { ignoreCase, multiline }?: Partial<Pick<RegExp, 'ignoreCase' | 'multiline'>>): $mol_regexp<$mol_regexp_groups<Source>>;
        /** Makes regexp which includes only unicode category */
        static unicode_only(...category: $mol_unicode_category): $mol_regexp<Record<string, string>>;
        /** Makes regexp which excludes unicode category */
        static unicode_except(...category: $mol_unicode_category): $mol_regexp<Record<string, string>>;
        static char_range(from: number, to: number): $mol_regexp<{}>;
        static char_only(...allowed: readonly [$mol_regexp_source, ...$mol_regexp_source[]]): $mol_regexp<{}>;
        static char_except(...forbidden: readonly [$mol_regexp_source, ...$mol_regexp_source[]]): $mol_regexp<{}>;
        static decimal_only: $mol_regexp<{}>;
        static decimal_except: $mol_regexp<{}>;
        static latin_only: $mol_regexp<{}>;
        static latin_except: $mol_regexp<{}>;
        static space_only: $mol_regexp<{}>;
        static space_except: $mol_regexp<{}>;
        static word_break_only: $mol_regexp<{}>;
        static word_break_except: $mol_regexp<{}>;
        static tab: $mol_regexp<{}>;
        static slash_back: $mol_regexp<{}>;
        static nul: $mol_regexp<{}>;
        static char_any: $mol_regexp<{}>;
        static begin: $mol_regexp<{}>;
        static end: $mol_regexp<{}>;
        static or: $mol_regexp<{}>;
        static line_end: $mol_regexp<{
            readonly win_end: string;
            readonly mac_end: string;
        }>;
    }
    export {};
}

declare namespace $ {
    let $mol_view_tree2_prop_signature: $mol_regexp<{
        readonly name: string;
        readonly key: string;
        readonly next: string;
    }>;
}

declare namespace $ {
    function $mol_view_tree2_prop_parts(this: $, prop: $mol_tree2): {
        name: string;
        key: string;
        next: string;
    };
}

declare namespace $ {
    function $mol_view_tree2_prop_quote(name: $mol_tree2): $mol_tree2;
}

declare namespace $ {
    function $mol_view_tree2_class_match(klass?: $mol_tree2): boolean;
}

declare namespace $ {
    function $mol_view_tree2_class_super(this: $, klass: $mol_tree2): $mol_tree2;
}

declare namespace $ {
    function $mol_view_tree2_class_props(this: $, klass: $mol_tree2): $mol_tree2[];
}

declare namespace $ {
    /**
     * Decorates method to fiber to ensure it is executed only once inside other fiber from [mol_wire](../wire/README.md)
     * @see https://mol.hyoo.ru/#!section=docs/=1fcpsq_1wh0h2
     */
    let $mol_action: typeof $mol_wire_method;
}

declare namespace $ {
    /**
     * Document model over a `view.tree` AST.
     *
     * A vmap document is one `view.tree` class, so the source text is the truth and
     * the tree is derived from it. Every edit goes through the tree and is written
     * straight back as text, which is what makes source export free.
     *
     * Port of the component and property models of studio, plus the wire emitter,
     * which studio has no equivalent of. Deviations are marked at their place.
     *
     * Pure model: knows nothing about DOM, compiles nothing, executes nothing.
     * @see ../ARCHITECTURE.md sections 1 and 2
     */
    /**
     * Serializes to exactly `name = Node prop`, an `=` operator over exactly two
     * tokens. The shape of this type is the whole safety story: there is no field
     * for the operator, no field for a third token, and one flag for both ends, so
     * none of the five traps of section 1 is even expressible.
     */
    type $bog_vmap_lang_wire = {
        /** Property of the class the wire lands in, bare name. */
        readonly name: string;
        /** Property holding the source node, bare name. Must be declared. */
        readonly node: string;
        /** Property of that node, bare name. */
        readonly prop: string;
        /** Two-way. Puts `?` on BOTH ends, never on one. */
        readonly bidi?: boolean;
    };
    /**
     * A wire with its consumer: `from.from_prop` feeds `to.to_prop` through the
     * root property `name`. Two lines of the class and nothing else.
     */
    type $bog_vmap_lang_link = {
        readonly from: string;
        readonly from_prop: string;
        readonly to: string;
        readonly to_prop: string;
        readonly name: string;
        readonly bidi: boolean;
    };
    /**
     * Bare means: no `*`, no `?`, no `!`, no spaces, nothing but a name. Signs are
     * never carried by a token, they are produced from `bidi`. That single rule
     * kills three of the five traps at once, because every one of them is a token
     * that smuggles something in:
     *
     * - `value?` as the right token gives `w = Field value?`, which compiles to
     *   `value(next)` with no `next` in scope, so the wire throws `ReferenceError`
     *   on ANY read;
     * - `w?` as the left token gives `w? = Field hint`, which compiles to a setter
     *   whose right end ignores it, so writes vanish with no error at all;
     * - `B value` as a token gives `w = A B value`, which compiles to
     *   `this.A().B().value()`, and `B` was hoisted onto the root by `upper`, so it
     *   is not a method of `A` and never will be.
     *
     * The grammar is the stock signature regexp itself rather than one of our own,
     * so a token this accepts is a token the compiler accepts.
     */
    function $bog_vmap_lang_token(this: $, token: string, role: string): string;
    /**
     * Stricter than the compiler on purpose. The stock class match takes anything
     * starting with a dollar or a capital, generics and quotes included, because it
     * also has to recognize the classes of somebody else's code; a class
     * WE write has to survive one more step, and that step is mam resolving the
     * name into a folder. Every underscore is a level of folders, so the name is a
     * dollar and at least two lowercase segments, and nothing else fits in a path.
     *
     * A refusal here is a message to a person, so this answers yes or no and leaves
     * the wording to the caller, who knows in what language to say it.
     */
    function $bog_vmap_lang_class_ok(name: string): boolean;
    /**
     * The operator is `=` and nothing else. `<= Node prop` looks like the same thing
     * and is not: it goes through the `upper` hack, which takes the kids of the
     * reference as default values, so it declares a property `Node` valued `prop`
     * and silently drops the `.prop()` link from the generated call. Either the
     * build dies with a message about default values, or the build is green and the
     * bundle carries `Node(){ return prop }`, a bare identifier that throws at the
     * one node the wire was drawn to, whenever somebody gets there.
     *
     * @see ../ARCHITECTURE.md section 1
     */
    function $bog_vmap_lang_wire_tree(this: $, wire: $bog_vmap_lang_wire): $mol_tree2;
    /**
     * A bare reference `<= name`, the form that goes into `sub`. Bare means
     * childless: a reference with a child is the middle of the three forms of `<=`,
     * the only dangerous one, and the guard against it is that this takes a token
     * instead of a path.
     */
    function $bog_vmap_lang_ref_tree(this: $, name: string): $mol_tree2;
    /**
     * A free part is a name and a class at class level, with no operator between
     * them: a plain property of the root class, so the compiler makes it a lazy
     * memoized singleton and it creates no DOM, because it is not in `sub`. That is
     * the whole mechanism behind a detail lying free on the canvas.
     */
    function $bog_vmap_lang_part_tree(this: $, name: string, klass: string): $mol_tree2;
    /** Value of one key of a `*` dictionary, or `null` when the key is not there. */
    function $bog_vmap_lang_dict_get(dict: $mol_tree2 | null, key: string): $mol_tree2 | null;
    /**
     * A key already there is replaced where it stands, so `^` keeps the head of the
     * dictionary it has to keep: a redeclared dictionary REPLACES the one of the
     * base instead of extending it, and `^` is the line that undoes that. Writing a
     * key must never be able to move it, and appending is the only other option.
     */
    function $bog_vmap_lang_dict_set(this: $, dict: $mol_tree2, key: string, value: $mol_tree2 | null): $mol_tree2;
    /**
     * Class declarations reordered so that a base always precedes its heir. A
     * generated class resolves its base at definition time, and the generator emits
     * declarations in the order it received them. A heir written above its base
     * therefore inherits the PREVIOUS version of it, or `undefined` on a first run,
     * and says nothing about it.
     *
     * Bases the list does not declare — anything from a library — are left alone:
     * they are already in the namespace before our code runs.
     *
     * The scene carries an equivalent of this for the same reason. The two should
     * become one, and this is the side to keep: sorting declarations is a property
     * of the language, not of whoever happens to compile them.
     */
    function $bog_vmap_lang_sorted(this: $, defs: readonly $mol_tree2[]): readonly $mol_tree2[];
    /**
     * A document: several `view.tree` classes in one text.
     *
     * The node model below models one CLASS, and rightly so — but a document is not
     * one class, and using the node as if it were silently eats the others: its
     * read takes the first kid and its write serializes that one tree over the
     * whole source, so editing one property of the first class drops the second
     * from the text. No error, no warning.
     *
     * This level owns the text, cuts it into classes for reading, and puts one back
     * without reserializing its neighbours from anything but their own trees. It
     * hands out nodes whose `source` is a slice of it, so everything already
     * written against the node model keeps working unchanged — that is the point of
     * adding a level instead of widening the one below.
     *
     * A class is addressed BY NAME, which is what the editor speaks and what
     * survives reordering. Two things follow, both real:
     *
     * - renaming a class through its node writes under the OLD name, which is
     *   correct — the slot is found and replaced — but the caller then holds a stale
     *   key and has to re-read `names()`;
     * - two classes of one name are one class here, the first. That is already
     *   broken further down: the class index of the library model keeps the LAST of
     *   a duplicate pair, so a document with two would disagree with itself about
     *   which is real.
     *
     * @see ../ARCHITECTURE.md section 1
     */
    class $bog_vmap_lang_doc extends $mol_object {
        /** The truth. */
        source(next?: string): string;
        /**
         * Read only, and that is deliberate. A cell that both reads and writes
         * `source` would be a cell frozen by its own write — a write to a memoized
         * cell freezes its dependencies — and the document would stop following the
         * text after the first edit made through it, which is the one failure that
         * looks exactly like success.
         */
        trees(): readonly $mol_tree2[];
        names(): string[];
        /**
         * Writing rebuilds the text from the trees of all the classes with this one
         * replaced, so a neighbour comes back out of its own tree and nothing else.
         * On an already normalized document that is byte for byte; the first write
         * to a hand written one normalizes the whole text at once, which is the same
         * lossy step the node model has always taken, now taken over the document
         * rather than over one class.
         *
         * A name the document does not carry appends, so that handing a node a
         * source is also how a class is added.
         *
         * NOT memoized, for the reason spelled out at `trees`: this is the write
         * path, and a cell on a write path freezes at what was written. The read is
         * two lookups over `trees()`, which is a cell already, so there is nothing
         * to gain either.
         */
        class_source(name: string, next?: string): string;
        /**
         * A class name is spelled in more places than its own declaration: it is the
         * base of an heir (`site_card site_page`, both with a leading dollar) and the
         * value of a part declared with it (`Card site_card`, same). Retyping the
         * declaration alone leaves those
         * spelling a class nobody declares, which compiles into `Class extends value
         * undefined` or into a part of a class that is not there — so the mentions
         * are rewritten in the SAME write, over every class of the document.
         *
         * A mention is any tree node typed exactly with the old name. Only structural
         * tokens carry a type in `tree2`; a literal is a data node, so a class name
         * written inside a string is not touched and cannot be.
         *
         * A name already declared is refused, like the rename of a property: two
         * classes of one name is a document that disagrees with itself about which is
         * real, and the class index of a library keeps the last of such a pair.
         *
         * Whoever holds a `node( from )` has to ask for `node( to )` afterwards; the
         * old handle addresses a class the document no longer carries, exactly as the
         * property handle does after `prop_rename`.
         */
        class_rename(from: string, to: string): undefined;
        /**
         * `source` is replaced with a slice of the document on the instance itself.
         * Everything else of the node model — the tree, the property list, the wire
         * emitter — is derived from `source` and so needs no changes at all: the
         * node cannot tell that its text is a part of a larger one.
         */
        node(name: string): $bog_vmap_lang_node;
    }
    /** One node of the document: a single `view.tree` class. */
    class $bog_vmap_lang_node extends $mol_object {
        /** The truth. Everything else is derived from it. */
        source(next?: string): string;
        /**
         * Normalization is lossy: it runs the `upper` hack, so a named sub view
         * nested in `sub` comes out as a flat property of the root plus a bare
         * reference left in place. Hoisted properties land BEFORE the ones already
         * at the top, because they are added during the traversal rather than in the
         * final loop.
         *
         * That flat form is the canonical shape of a document, not a compromise: it
         * is the model of section 1 spelled out in the text itself. Round trip is
         * therefore byte for byte only on a normalized source, which is what the
         * editor holds, because every write serializes the whole class.
         *
         * @see ../ARCHITECTURE.md section 1, «Канонический вид документа»
         *
         * Deviation from studio: an empty or classless source fails with a message
         * instead of `Cannot read properties of undefined`. In an editor an empty
         * buffer is a normal transient state and has to say so.
         */
        tree(next?: $mol_tree2): $mol_tree2;
        name(next?: string): string;
        base(next?: string): string;
        prop_names(): string[];
        props_tree(): $mol_tree2;
        /**
         * Full signature of a property by its bare name: `d` gives back `d*?`.
         *
         * Deviation from studio: the early exit is spelled as a test for any sign
         * instead of `name.indexOf('*') + name.indexOf('?') + name.indexOf('!') > -3`,
         * which is the same condition written as arithmetic on three `-1`s.
         */
        prop_fullname(name: string): string;
        /** Writing `null` drops the property. */
        prop_tree(name: string, next?: $mol_tree2 | null): $mol_tree2 | null;
        prop_add(name: string): void;
        prop_drop(name: string): void;
        /**
         * `next` is a whole signature, `d*?` and not `d`, because a rename and a
         * change of sign arrive together from the inspector and two writes would
         * leave the document renamed but unsigned in between.
         *
         * **A reference is rewritten, never dropped.** A node is named by the
         * property it occupies, so a rename moves the name every `sub` list, every
         * wire end and every binding spells. Dropping them instead — which is what
         * `links_drop` does for a delete — would silently cut the wires of a node
         * that is still there; the two operations are opposites and must not share
         * a path. Anything of the shape `<= name`, `<=> name` or `= name prop` at
         * any depth is such a reference.
         *
         * The declaration is retyped IN PLACE, among the kids of the base, and only
         * there: an override of the same name under a part is a port of that part
         * and none of our business. In place also keeps the property where it was —
         * dropping it and inserting it back moved it to the end of the class, which
         * reorders the canvas for a rename that should not move anything.
         *
         * A name already taken is refused rather than merged: two properties of one
         * name is a document nothing can address afterwards.
         */
        prop_rename(name: string, next: string): undefined;
        property(name: string): $bog_vmap_lang_prop;
        /**
         * Deviation from studio, which has no free parts: the write goes through the
         * `null` step of the path instead of `base()`, so it lands in the class body
         * whatever the base is currently called. Same reason `prop_add` does it.
         */
        part_add(name: string, klass: string): void;
        /**
         * The node end has to be declared already, as a free part or as a sub-view.
         * `=` declares nothing, that is exactly why it has no collision with `upper`,
         * so a wire to an undeclared node compiles green and throws `is not a
         * function` at run time. Refusing here is the only place it can be caught.
         *
         * The far end, `wire.prop`, is NOT checked: whether the node's class has such
         * a port is known only to the component library, and this module knows
         * nothing of libraries, deliberately. The inspector draws wires from the port
         * list, so the question does not arise there either.
         */
        wire_add(wire: $bog_vmap_lang_wire): void;
        /**
         * Wires declared by the class: every property whose value is the `=`
         * operator. `bidi` is read off the left end alone, because the emitter never
         * writes the two signs apart; a hand written wire with one sign is reported
         * as it is and left for the compiler to complain about.
         */
        wires(): readonly $bog_vmap_lang_wire[];
        /**
         * Properties whose value is a class name, with the overrides written under
         * it. That is where a consumer of a wire lives: a part declaration with a
         * port bound to the name of the wire.
         */
        part_names(): string[];
        /**
         * Wires together with who reads them. A wire nobody reads is not a link,
         * and a reference to a name that is not a wire is a plain binding of the
         * part and none of this module's business.
         */
        links(): readonly $bog_vmap_lang_link[];
        /** Whether `to` is already fed, directly or through others, by `from`. */
        link_reaches(from: string, to: string): boolean;
        /**
         * An existing wire to the same end is reused, an unrelated property of the
         * same name is stepped around with a suffix.
         */
        link_name(from: string, prop: string, bidi: boolean): string;
        /**
         * Two lines and no more. The wire `name = From prop` goes through `wire_add`
         * with every guard it has, and the consumer is a bare reference in the
         * declaration of the target part, `to_prop <= name`, or `to_prop? <=> name?`
         * for a two way wire. The reference is built by the bare reference emitter,
         * so it can carry nothing under the name and never turns into the middle
         * form of `<=`.
         *
         * Refused, with nothing written: a part wired to itself, an undeclared end,
         * and a target the source already depends on, because a loop of wires is a
         * loop of fibers and the scene would hang on the first read.
         */
        link_add(link: {
            readonly from: string;
            readonly from_prop: string;
            readonly to: string;
            readonly to_prop: string;
            readonly bidi?: boolean;
        }): string;
        /**
         * One override of one part, which is what `over_set` is; a wire has no
         * special way of writing its end and must not grow one, or the two would
         * drift apart on the first fix to either.
         */
        link_target(to: string, to_prop: string, next: $mol_tree2 | null): void;
        /**
         * Unplugs a port: the reference goes from the target, and the wire goes from
         * the class when nobody else reads it. Both lines, or the first alone when
         * the second is still in use.
         */
        link_drop(to: string, to_prop: string): void;
        /**
         * Unplugs every wire with an end on a part: the ones it feeds and the ones
         * it reads. What a delete of that part has to do before it takes the part
         * out, or the document keeps a wire to a node that is no longer declared —
         * which compiles into a call of a property nobody declares.
         *
         * Through `link_drop`, so a wire read by somebody else keeps its line
         * exactly as it does when a port is unplugged by hand; a wire from this part
         * that nobody reads has no consumer to unplug and goes in the second pass.
         * Both ends of every OTHER wire are left alone.
         */
        links_drop(node: string): void;
        /**
         * Not through `prop_tree()`: that one is a keyed cell the writes below go
         * through, and a read taken from a written cell freezes at what was written.
         * `props_tree()` is a plain derivation of the source and stays live.
         */
        prop_decl(name: string): $mol_tree2 | null;
        /**
         * The empty owner is the class, a named one is a part. Both are one shape
         * because `upper` has already flattened them: the class carries `sub` as a
         * property, a part carries it as an override under its class name, and under
         * either sits the same list of bare references.
         */
        sub_list(owner?: string): $mol_tree2 | null;
        /**
         * `null` when the node declares no `sub` and so is not a container.
         *
         * A node WITH a `sub` is an artboard: children of it are laid out by tree,
         * by ordinary flex, while everything else lies free by coordinates. That is
         * the whole difference between the two, and it is a difference in the text
         * rather than a mark on the side, see section 8.
         *
         * Content that is not a bare reference — a literal string in `sub` — takes
         * its place in the list as an empty name, so that an index here is an index
         * there.
         */
        sub_names(owner?: string): readonly string[] | null;
        /** Whose `sub` references this name: a part, `''` for the class, `null` for nobody. */
        sub_holder(name: string): string | null;
        /** Whether `name` is `owner` itself or lies somewhere under it. */
        sub_within(owner: string, name: string): boolean;
        /**
         * An override already there is replaced where it stands, never dropped and
         * appended: the order of the lines under a part is text the user reads, and
         * a `sub` that jumped to the bottom on every insertion would rewrite the
         * declaration around an edit that changed one child.
         */
        sub_write(owner: string, list: $mol_tree2): void;
        /** Makes a node a container by giving it an empty `sub`, if it has none. */
        sub_open(owner: string): void;
        /**
         * Only under a PART: a property whose value is a class name. Under anything
         * else the children are not overrides at all — under `sub` they are bare
         * `<=` references — and reading them as property signatures fails on the
         * first one, which is how every property of the document gets asked whether
         * it is an artboard.
         */
        over_tree(owner: string, prop: string): $mol_tree2 | null;
        /**
         * In place, because the order of the lines under a part is text the user
         * reads: an override that jumped to the bottom every time its value changed
         * would rewrite the declaration around an edit that changed one line.
         */
        over_set(owner: string, prop: string, next: $mol_tree2 | null): void;
        /**
         * A cycle in `sub` is not a badly drawn document, it is a class whose
         * `dom_tree()` never returns: the scene would hang on the first render, and
         * the document that hangs it is the one that got saved.
         */
        sub_check(name: string, owner: string): void;
        /**
         * The position is where the insertion line was drawn, so it is clamped
         * rather than checked: a drop at the end of a list the document has since
         * shortened is an ordinary race of a gesture against a document, and landing
         * at the end is the answer to it.
         */
        sub_insert(name: string, index: number, owner?: string): void;
        /**
         * Taken out first and put back after, so reparenting and reordering are one
         * operation with one shape. Within one parent the index is corrected for the
         * hole the node itself leaves, because the position the user aimed at was
         * read off a list that still had it.
         *
         * The refusal is checked BEFORE the node is taken out, not left to the
         * insertion: a move that fails halfway is a document with the node gone from
         * the page and nothing in its place, written and saved.
         */
        sub_move(name: string, index: number, owner?: string): void;
        sub_add(name: string): void;
        /**
         * The empty list is kept rather than the whole property dropped: `sub /` with
         * nothing under it is the shape an empty document starts from, so deleting
         * the last node returns the source to exactly that, instead of to a class
         * with no `sub` at all.
         *
         * Only the reference goes. Dropping the declaration as well is two facts, so
         * it is two calls — the same split as `part_add` plus `sub_add` on the way
         * in. A node taken out of `sub` but still declared is a free part that draws
         * nothing and keeps its ports, which is a legitimate state, not a leftover.
         *
         * The reference is looked for wherever it is, the class and every part of it
         * alike. A node inside an artboard is referenced by that artboard and not by
         * the class, and deleting it has to reach there too — otherwise the document
         * keeps drawing a node nothing declares any more.
         */
        sub_drop(name: string): void;
    }
    /**
     * One property of a node, with its signature. `name`, `tree` and `node` are
     * handed in by the owner through `make`.
     */
    class $bog_vmap_lang_prop extends $mol_object {
        name(): string;
        node(): $bog_vmap_lang_node;
        tree(next?: $mol_tree2): $mol_tree2;
        /** Re-binds the same property to another model class. */
        as<Prop extends typeof $bog_vmap_lang_prop>(Prop: Prop): InstanceType<Prop>;
        /**
         * A rename goes to the node, because it is not a fact about this property
         * alone: everything that spells the old name has to be rewritten in the same
         * write. A change of sign is local and is written here.
         *
         * Deviation from studio: this handle is NOT patched to follow the rename.
         * Studio overwrites the `name` method of the live property object, which
         * leaves an object addressing one name and reading another past the graph;
         * here the handle simply stops addressing anything, and the caller asks the
         * node for the property under its new name — a keyed cell, so that is one
         * read and no state.
         *
         * **Plain method, and so are the three below.** Every accessor here only
         * delegates into `tree()`, which is a cell already, and an accessor of that
         * shape under a memoizing decorator freezes at the value written THROUGH it:
         * after a rename the handle goes on reporting the new name although it
         * addresses a property no longer under it, which is the very
         * object-past-the-graph the patching above was dropped for. There is a test.
         */
        meta(next?: {
            readonly name?: string;
            readonly key?: string;
            readonly next?: string;
        }): {
            [key: string]: string;
        } & {
            readonly name: string;
            readonly key: string;
            readonly next: string;
        };
        title(next?: string): string;
        key(next?: boolean): boolean;
        next(next?: boolean): boolean;
    }
}

declare namespace $ {
    /**
     * Order of the declarations going into one `new Function`: the libraries, then
     * the document, every base before its heir, and one declaration per name.
     *
     * Libraries first because the document is written against them, and a stable
     * sort keeps that unless a library class inherits a document class — legal,
     * odd, and then the base still comes first. The sort itself is the canonical
     * sort of the language module: ordering declarations is a property of the
     * language, and the scene's own copy of it was the second one too many.
     *
     * A name declared twice keeps the LAST declaration and drops the earlier one,
     * which is the rule the class index of the library model already lives by and the rule the
     * sandbox enforces on its own: two declarations of one class in one source
     * would define the second over the first anyway, only with the first still
     * having been extended by anyone declared in between. Dropping it up front makes
     * «the document shadows the library» hold for heirs as well.
     *
     * No class name is spelled out in this comment on purpose: mam reads doc
     * comments for dependencies, and a one segment name here failed the build of
     * the scene with «Root package not found».
     *
     * Bases the list does not declare — the classes of the pack, already in the
     * sandbox — are left alone, as the sort leaves them.
     */
    function $bog_vmap_scene_order(this: $, libs: readonly $mol_tree2[], doc: readonly $mol_tree2[]): readonly $mol_tree2[];
}

declare namespace $ {
    /** Shape of one recompiled class: what it declares and what of that is keyed. */
    type $bog_vmap_scene_swap_shape = {
        readonly declared: ReadonlySet<string>;
        readonly keyed: ReadonlySet<string>;
    };
    /** Counters of one hot swap, for tests and for the log. */
    type $bog_vmap_scene_swap_report = {
        /** Instances whose prototype was moved onto the freshly compiled class. */
        swapped: number;
        /** Atoms whose implementation was redirected onto the new one. */
        moved: number;
        /** Atoms whose implementation actually changed, so subscribers were woken. */
        stale: number;
        /** Atoms dropped because the property changed shape or stopped being a cell. */
        dropped: number;
        /** Atoms holding a failure, woken whatever changed: they have nothing to keep. */
        failed: number;
    };
    /**
     * Moves a live component onto the freshly compiled classes, keeping its state.
     *
     * A cell lives as an OWN field of the instance, so replacing the prototype
     * touches no value, no subscription and no DOM node — caret, focus and scroll
     * position included. The one thing the prototype does not reach is the
     * implementation a fiber captured in its constructor, and that is what is
     * redirected here, taking the new one off the wrapper the decorator left it on.
     *
     * The walk goes over the atom caches and never over `sub()`: free parts are not
     * in `sub` at all, `sub()` of a generated class is not memoized, so calling it
     * would run user code and could create children that do not exist yet, and a
     * child temporarily out of `sub` is still a live instance.
     *
     * Instances of classes the document does not declare — components of the donor
     * pack — keep their prototype and are only walked through, because a document
     * class may well sit inside one.
     * @see ../../ARCHITECTURE.md section 3, ../../spike/S2.md
     */
    function $bog_vmap_scene_swap(this: $, root: object, klass_of: (name: string) => unknown, shape_of: (name: string) => $bog_vmap_scene_swap_shape | null): $bog_vmap_scene_swap_report;
}

declare namespace $ {
    /**
     * Makes a cell of every method a handwritten body defines: keyed and
     * changeable ones as the tree says, the way studio's `source_js_decorators()`
     * does, and every zero argument method besides, whatever the tree says. The
     * generated code calls it right after the class, since a decorator cannot be
     * written into a string for `new Function`, and it reads the class rather
     * than the text, so a nested `if( x ) {` cannot pass for a method.
     *
     * Without an atom the hot swap has nothing to wake when the text of a method
     * changes: its callers keep the old value and the DOM keeps the old text.
     */
    function $bog_vmap_scene_cells(Klass: {
        readonly prototype: object;
    }, keyed: readonly string[], changeable: readonly string[]): void;
}

declare namespace $ {
    function $mol_tree2_text_to_string(this: $, text: $mol_tree2): string;
}

declare namespace $ {
    function $mol_vlq_encode(val: number): string;
}

declare namespace $ {
    type $mol_sourcemap_segment = [number] | [number, number, number, number] | [number, number, number, number, number];
    type $mol_sourcemap_line = $mol_sourcemap_segment[];
    type $mol_sourcemap_mappings = $mol_sourcemap_line[];
    interface $mol_sourcemap_raw {
        version: number;
        sources: string[];
        names?: string[];
        sourceRoot?: string;
        sourcesContent?: (string | null)[];
        mappings: string | $mol_sourcemap_line[];
        file?: string;
    }
}

declare namespace $ {
    function $mol_tree2_text_to_sourcemap(this: $, tree: $mol_tree2): $mol_sourcemap_raw;
}

declare namespace $ {
    function $mol_sourcemap_url(this: $, uri: string, type?: "js" | "css"): string;
}

declare namespace $ {
    function $mol_sourcemap_dataurl_decode(this: $, data: string): $mol_sourcemap_raw | undefined;
    function $mol_sourcemap_dataurl_encode(this: $, map: $mol_sourcemap_raw, type?: "js" | "css"): string;
}

declare namespace $ {
    function $mol_tree2_text_to_string_mapped(this: $, text: $mol_tree2, type: 'js' | 'css'): string;
    function $mol_tree2_text_to_string_mapped_js(this: $, text: $mol_tree2): string;
    function $mol_tree2_text_to_string_mapped_css(this: $, text: $mol_tree2): string;
}

declare namespace $ {
    function $mol_tree2_js_is_number(type: string): boolean | RegExpMatchArray;
}

declare namespace $ {
    function $mol_tree2_js_to_text(this: $, js: $mol_tree2): $mol_tree2;
}

declare namespace $ {
    class $mol_storage extends $mol_object2 {
        /** Is storage a long term. */
        static persisted(next?: boolean): boolean;
        /** Total storage quota in bytes. */
        static total(): number;
        /** Total storage usage in bytes. */
        static used(): number;
        /** Minimum available free space in bytes. */
        static free(): number;
        /** Fulfillness of storage. */
        static portion(): number;
        /**
         * Fulfillness logarithmic level.
         * `0` - empty
         * `1` - half free
         * `2` - quart free
         * `Infinity` - fulfilled
         */
        static level(): number;
    }
}

declare namespace $ {
    let $mol_mem_persist: typeof $mol_wire_solid;
}

declare namespace $ {
    function $mol_wait_user_async(this: $): Promise<unknown>;
    function $mol_wait_user(this: $): unknown;
}

declare namespace $ {
    class $mol_storage_web extends $mol_storage {
        static native(): StorageManager;
        static persisted(next?: boolean, cache?: 'cache'): boolean;
        static estimate(): StorageEstimate;
        static total(): number;
        static used(): number;
        static free(): number;
        static portion(): number;
        static dir(): FileSystemDirectoryHandle;
    }
}

declare namespace $ {
    class $mol_state_local<Value> extends $mol_object {
        static 'native()': Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;
        static native(): Storage | {
            getItem(key: string): any;
            setItem(key: string, value: string): void;
            removeItem(key: string): void;
        };
        static changes(next?: StorageEvent): StorageEvent | undefined;
        static value<Value>(key: string, next?: Value | null): Value | null;
        prefix(): string;
        value(key: string, next?: Value): Value | null;
    }
}

declare namespace $ {
}

declare namespace $ {
    class $mol_lock extends $mol_object {
        protected promise: null | Promise<void>;
        wait(): Promise<() => void>;
        grab(): () => void;
    }
}

declare namespace $ {
    function $mol_compare_array<Value extends ArrayLike<unknown>>(a: Value, b: Value): boolean;
}

declare namespace $ {
    type $mol_charset_encoding = 'utf8' | 'utf-16le' | 'utf-16be' | 'ibm866' | 'iso-8859-2' | 'iso-8859-3' | 'iso-8859-4' | 'iso-8859-5' | 'iso-8859-6' | 'iso-8859-7' | 'iso-8859-8' | 'iso-8859-8i' | 'iso-8859-10' | 'iso-8859-13' | 'iso-8859-14' | 'iso-8859-15' | 'iso-8859-16' | 'koi8-r' | 'koi8-u' | 'koi8-r' | 'macintosh' | 'windows-874' | 'windows-1250' | 'windows-1251' | 'windows-1252' | 'windows-1253' | 'windows-1254' | 'windows-1255' | 'windows-1256' | 'windows-1257' | 'windows-1258' | 'x-mac-cyrillic' | 'gbk' | 'gb18030' | 'hz-gb-2312' | 'big5' | 'euc-jp' | 'iso-2022-jp' | 'shift-jis' | 'euc-kr' | 'iso-2022-kr';
}

declare namespace $ {
    function $mol_charset_decode(buffer: AllowSharedBufferSource, encoding?: $mol_charset_encoding): string;
}

declare namespace $ {
    /** Temporary buffer. Recursive usage isn't supported. */
    function $mol_charset_buffer(size: number): Uint8Array<ArrayBuffer>;
}

declare namespace $ {
    function $mol_charset_encode(str: string): Uint8Array<ArrayBuffer>;
    function $mol_charset_encode_to(str: string, buf: Uint8Array<ArrayBuffer>, from?: number): number;
    function $mol_charset_encode_size(str: string): number;
}

declare namespace $ {
    type $mol_file_transaction_mode = 'create' | 'exists_truncate' | 'exists_fail' | 'read_only' | 'write_only' | 'read_write' | 'append';
    type $mol_file_transaction_buffer = ArrayBufferView;
    class $mol_file_transaction extends $mol_object {
        path(): string;
        modes(): readonly $mol_file_transaction_mode[];
        write(options: {
            buffer: ArrayBufferView | string | readonly ArrayBufferView[];
            offset?: number | null;
            length?: number | null;
            position?: number | null;
        }): number;
        read(): Uint8Array<ArrayBuffer>;
        truncate(size: number): void;
        flush(): void;
        close(): void;
        destructor(): void;
    }
}

declare namespace $ {
    class $mol_file_base extends $mol_object {
        static absolute<This extends typeof $mol_file_base>(this: This, path: string): InstanceType<This>;
        static relative<This extends typeof $mol_file_base>(this: This, path: string): InstanceType<This>;
        static base: string;
        path(): string;
        parent(): this;
        exists_cut(): boolean;
        protected root(): boolean;
        protected stat(next?: $mol_file_stat | null, virt?: 'virt'): $mol_file_stat | null;
        protected static changed: Set<$mol_file_base>;
        protected static frame: null | $mol_after_timeout;
        protected static changed_add(type: 'change' | 'rename', path: string): void;
        /**
         * Должно быть больше, чем время между событиями от вотчера при записи внешним процессом.
         * Иначе запуск ресетов паралельно с изменением может привести к неконсистентности.
         */
        static watch_debounce(): number;
        static flush(): void;
        protected static watching: boolean;
        protected static lock: $mol_lock;
        protected static watch_off(path: string): void;
        static unwatched<Result>(side_effect: () => Result, affected_dir: string): Result;
        reset(): void;
        modified(): Date | null;
        version(): string;
        protected info(path: string): null | $mol_file_stat;
        protected ensure(): void;
        protected drop(): void;
        protected copy(to: string): void;
        protected read(): Uint8Array<ArrayBuffer>;
        protected write(buffer: Uint8Array<ArrayBuffer>): void;
        protected kids(): readonly this[];
        readable(opts: {
            start?: number;
            end?: number;
        }): ReadableStream<Uint8Array<ArrayBuffer>>;
        writable(opts: {
            start?: number;
        }): WritableStream<Uint8Array<ArrayBuffer>>;
        buffer(next?: Uint8Array<ArrayBuffer>): Uint8Array<ArrayBuffer>;
        stat_make(size: number): {
            readonly type: "file";
            readonly size: number;
            readonly atime: Date;
            readonly mtime: Date;
            readonly ctime: Date;
        };
        clone(to: string): this | null;
        watcher(): {
            destructor(): void;
        };
        exists(next?: boolean): boolean;
        type(): "" | $mol_file_type;
        name(): string;
        ext(): string;
        text(next?: string, virt?: 'virt'): string;
        text_int(next?: string, virt?: 'virt'): string;
        sub(reset?: null): this[];
        resolve(path: string): this;
        relate(base?: $mol_file_base): string;
        find(include?: RegExp, exclude?: RegExp): this[];
        size(): number;
        toJSON(): string;
        open(...modes: readonly $mol_file_transaction_mode[]): $mol_file_transaction;
    }
}

declare namespace $ {
    type $mol_file_type = 'file' | 'dir' | 'link';
    interface $mol_file_stat {
        type: $mol_file_type;
        size: number;
        atime: Date;
        mtime: Date;
        ctime: Date;
    }
    class $mol_file extends $mol_file_base {
    }
}

declare namespace $ {
    enum $mol_rest_code {
        'Continue' = 100,
        'Switching protocols' = 101,
        'Processing' = 102,
        'OK' = 200,
        'Created' = 201,
        'Accepted' = 202,
        'Non-Authoritative Information' = 203,
        'No Content' = 204,
        'Reset Content' = 205,
        'Partial Content' = 206,
        'Multi Status' = 207,
        'Already Reported' = 208,
        'IM Used' = 226,
        'Multiple Choices' = 300,
        'Moved Permanently' = 301,
        'Found' = 302,
        'See Other' = 303,
        'Not Modified' = 304,
        'Use Proxy' = 305,
        'Temporary Redirect' = 307,
        'Bad Request' = 400,
        'Unauthorized' = 401,
        'Payment Required' = 402,
        'Forbidden' = 403,
        'Not Found' = 404,
        'Method Not Allowed' = 405,
        'Not Acceptable' = 406,
        'Proxy Authentication Required' = 407,
        'Request Timeout' = 408,
        'Conflict' = 409,
        'Gone' = 410,
        'Length Required' = 411,
        'Precondition Failed' = 412,
        'Request Entity Too Large' = 413,
        'Request URI Too Long' = 414,
        'Unsupported Media Type' = 415,
        'Requested Range Not Satisfiable' = 416,
        'Expectation Failed' = 417,
        'Teapot' = 418,
        'Unprocessable Entity' = 422,
        'Locked' = 423,
        'Failed Dependency' = 424,
        'Upgrade Required' = 426,
        'Precondition Required' = 428,
        'Too Many Requests' = 429,
        'Request Header Fields Too Large' = 431,
        'Unavailable For Legal Reasons' = 451,
        'Internal Server Error' = 500,
        'Not Implemented' = 501,
        'Bad Gateway' = 502,
        'Service Unavailable' = 503,
        'Gateway Timeout' = 504,
        'HTTP Version Not Supported' = 505,
        'Insufficient Storage' = 507,
        'Loop Detected' = 508,
        'Not Extended' = 510,
        'Network Authentication Required' = 511,
        'Network Read Timeout Error' = 598,
        'Network Connect Timeout Error' = 599
    }
}

declare namespace $ {
    class $mol_error_mix<Cause extends {} = {}> extends AggregateError {
        readonly cause: Cause;
        name: string;
        constructor(message: string, cause?: Cause, ...errors: readonly Error[]);
        static [Symbol.toPrimitive](): string;
        static toString(): string;
        static make(...params: ConstructorParameters<typeof $mol_error_mix>): $mol_error_mix<{}>;
    }
}

declare namespace $ {
    function $mol_error_fence<Data>(task: () => Data, fallback: (parent: Error) => Error | Data | PromiseLike<Data>, loading?: (parent: PromiseLike<Data>) => Error | Data | PromiseLike<Data>): Data;
}

declare namespace $ {
    function $mol_error_enriched<V>(cause: {}, cb: () => V): V;
}

declare namespace $ {
    function $mol_dom_parse(text: string, type?: DOMParserSupportedType): Document;
}

declare namespace $ {
    class $mol_fetch_response extends $mol_object {
        readonly native: Response;
        readonly request: $mol_fetch_request;
        status(): "unknown" | "success" | "inform" | "redirect" | "wrong" | "failed";
        code(): number;
        ok(): boolean;
        message(): string;
        headers(): Headers;
        mime(): string | null;
        stream(): ReadableStream<Uint8Array<ArrayBuffer>> | null;
        text(): string;
        json(): unknown;
        blob(): Blob;
        buffer(): ArrayBuffer;
        xml(): Document;
        xhtml(): Document;
        html(): Document;
    }
    class $mol_fetch_request extends $mol_object {
        readonly native: Request;
        response_async(): Promise<Response> & {
            destructor: () => void;
        };
        response(): $mol_fetch_response;
        success(): $mol_fetch_response;
    }
    class $mol_fetch extends $mol_object {
        static request(input: RequestInfo, init?: RequestInit): $mol_fetch_request;
        static response(input: RequestInfo, init?: RequestInit): $mol_fetch_response;
        static success(input: RequestInfo, init?: RequestInit): $mol_fetch_response;
        static stream(input: RequestInfo, init?: RequestInit): ReadableStream<Uint8Array<ArrayBuffer>> | null;
        static text(input: RequestInfo, init?: RequestInit): string;
        static json(input: RequestInfo, init?: RequestInit): unknown;
        static blob(input: RequestInfo, init?: RequestInit): Blob;
        static buffer(input: RequestInfo, init?: RequestInit): ArrayBuffer;
        static xml(input: RequestInfo, init?: RequestInit): Document;
        static xhtml(input: RequestInfo, init?: RequestInit): Document;
        static html(input: RequestInfo, init?: RequestInit): Document;
    }
}

declare namespace $ {
    class $mol_file_webdav extends $mol_file_base {
        static relative<This extends typeof $mol_file>(this: This, path: string): InstanceType<This>;
        resolve(path: string): this;
        static headers(): Record<string, string>;
        headers(): Record<string, string>;
        protected fetch(init: RequestInit): $mol_fetch_response;
        protected read(): Uint8Array<ArrayBuffer>;
        protected write(body: Uint8Array<ArrayBuffer>): void;
        protected ensure(): void;
        protected drop(): void;
        protected copy(to: string): void;
        protected kids(): this[];
        readable(opts: {
            start?: number;
            end?: number;
        }): ReadableStream<Uint8Array<ArrayBuffer>>;
        protected info(): $mol_file_stat | null;
    }
}

declare namespace $ {
    class $mol_file_web extends $mol_file_webdav {
        static base: string;
        version(): string;
        protected info(): $mol_file_stat | null;
    }
}

declare namespace $ {
    interface $mol_locale_dict {
        [key: string]: string;
    }
    /**
     * Localisation in $mol framework
     * @see https://mol.hyoo.ru/#!section=docs/=s5aqnb_odub8l
     */
    class $mol_locale extends $mol_object {
        static lang_default(): string;
        static lang(next?: string): string;
        static langs_rtl(): string[];
        static direction(): "ltr" | "rtl";
        static source(lang: string): any;
        static texts(lang: string, next?: $mol_locale_dict): $mol_locale_dict;
        static text(key: string): string;
        static warn(key: string): null;
    }
}

declare namespace $ {
    function $mol_view_tree2_to_js(this: $, descr: $mol_tree2): $mol_tree2;
}

declare namespace $ {
    /** Modifier keys of the click, named as `MouseEventInit` names them. */
    type $bog_vmap_scene_click_mods = {
        readonly altKey: boolean;
        readonly ctrlKey: boolean;
        readonly metaKey: boolean;
        readonly shiftKey: boolean;
    };
    /**
     * What is under the point. The shape of a DOM element, and only the part of
     * it this needs, so a test can hand in a plain object.
     */
    type $bog_vmap_scene_click_target = {
        readonly tabIndex?: number;
        readonly isContentEditable?: boolean;
        readonly parentElement?: $bog_vmap_scene_click_target | null;
        focus?(): void;
        dispatchEvent(event: Event): boolean;
    };
    /** The window the document lives in, again only as far as this needs it. */
    type $bog_vmap_scene_click_realm = {
        readonly document: {
            elementFromPoint(x: number, y: number): $bog_vmap_scene_click_target | null;
        };
        readonly PointerEvent?: new (type: string, init?: PointerEventInit) => Event;
        readonly MouseEvent: new (type: string, init?: MouseEventInit) => Event;
    };
    /**
     * Replays a click the host overlay took on the element under the point.
     *
     * The overlay takes every gesture so that the editor's own state — selection,
     * dragging, the camera — cannot be forged or hidden by document code. The price
     * is that a real click never reaches the sandbox, and this is where it is paid
     * back: the host relays the point, the scene finds the element and hands it
     * `pointerdown`, `pointerup` and `click`, bubbling, so anything listening on the
     * element or above it fires as it would for a real press.
     *
     * Focus is given by hand, because it is the default action of a real
     * `mousedown` and synthetic events run no default actions. The focus goes to
     * the nearest focusable ancestor of the target, which is how a real click
     * focuses a button by its label: `tabIndex` is `-1` on anything not focusable
     * and `0` or more on anything that is, natively or by attribute. Once the
     * element is focused, the keyboard follows into the frame on its own.
     *
     * Between `pointerdown` and `pointerup`, as in the real sequence. Nothing is
     * dispatched when the point hits nothing, and that is the only way out.
     *
     * @param x client coordinate in the realm's own viewport
     * @param y client coordinate in the realm's own viewport
     * @returns the element the events went to, or `null` when there was none
     */
    function $bog_vmap_scene_click(realm: $bog_vmap_scene_click_realm, x: number, y: number, mods: $bog_vmap_scene_click_mods): $bog_vmap_scene_click_target | null;
}

declare namespace $ {
    class $mol_dom_listener extends $mol_object {
        _node: any;
        _event: string;
        _handler: (event: any) => any;
        _config: boolean | {
            passive: boolean;
        };
        constructor(_node: any, _event: string, _handler: (event: any) => any, _config?: boolean | {
            passive: boolean;
        });
        destructor(): void;
    }
}

declare namespace $ {
    /** As much of a DOM node as measuring needs. */
    type $bog_vmap_scene_measure_rect = {
        readonly isConnected: boolean;
        getBoundingClientRect(): {
            readonly left: number;
            readonly top: number;
            readonly width: number;
            readonly height: number;
        };
    };
    /** What the walk of one rendered document came out to. */
    type $bog_vmap_scene_measure_result<Node> = {
        readonly sizes: {
            readonly [node: string]: $bog_vmap_scene_cull_box;
        };
        readonly nodes: readonly Node[];
    };
    /**
     * Geometry of a rendered document, in world units, and the nodes it was read off.
     *
     * Pure, and out of the view for the reason the culling decision is: this is the
     * whole of what the host learns about the layout, and a walk worth testing is
     * worth testing without a compiled document. Everything that knows about the
     * framework — what counts as a view, what a view's children are, which property
     * holds it — is handed in, so the function itself knows only rectangles and paths.
     *
     * The nodes come back beside the sizes because the two are one question asked
     * twice: what the host is told about, and what has to be watched for changing
     * behind the graph's back. Watching the root alone leaves every node inside an
     * artboard of fixed width unwatched, and a reflow INSIDE a box that keeps its
     * own size is exactly what an artboard is made of.
     *
     * @param key path of the root, which every deeper path is built onto
     * @param zoom camera zoom the measured pixels are divided by, so the host, which
     *        owns the camera, is told world units
     */
    function $bog_vmap_scene_measure<View extends {
        dom_node(): $bog_vmap_scene_measure_rect;
    }>(root: View, how: {
        readonly key: string;
        readonly zoom: number;
        /** The kid as a view, or `null` when it is not one. */
        readonly view_of: (kid: unknown) => View | null;
        /** Children of a view, or none when they cannot be read. */
        readonly kids_of: (view: View) => readonly unknown[];
        /** Property the view is held by, empty when it is held by nothing named. */
        readonly prop_of: (view: View) => string;
    }): $bog_vmap_scene_measure_result<ReturnType<View['dom_node']>>;
    /**
     * Brings the watched set to exactly `next`, and says what it now is.
     *
     * Only the difference is touched: a node already watched is left alone rather
     * than re-observed, because `ResizeObserver` delivers a first box on every fresh
     * `observe()`, and re-observing the whole tree after every report would answer
     * its own delivery with another report, forever.
     */
    function $bog_vmap_scene_measure_watch<Node>(watcher: {
        observe(node: Node): void;
        unobserve(node: Node): void;
    }, prev: ReadonlySet<Node>, next: readonly Node[]): Set<Node>;
}

declare namespace $ {
    type $mol_style_pseudo_class = ':active' | ':any' | ':any-link' | ':checked' | ':default' | ':defined' | ':dir(rtl)' | ':dir(ltr)' | ':disabled' | ':empty' | ':enabled' | ':first' | ':first-child' | ':first-of-type' | ':fullscreen' | ':focus' | ':focus-visible' | ':focus-within' | ':hover' | ':indeterminate' | ':in-range' | ':invalid' | ':last-child' | ':last-of-type' | ':left' | ':link' | `:not(${string})` | `:nth-child(${string})` | `:nth-last-child(${string})` | `:nth-of-type(${string})` | `:nth-last-of-type(${string})` | ':only-child' | ':only-of-type' | ':optional' | ':out-of-range' | ':placeholder-shown' | ':read-only' | ':read-write' | ':required' | ':right' | ':root' | ':scope' | ':target' | ':valid' | ':visited';
}

declare namespace $ {
    type $mol_style_pseudo_element = '::after' | '::before' | '::cue' | '::first-letter' | '::first-line' | '::selection' | '::slotted' | '::backdrop' | '::placeholder' | '::marker' | '::spelling-error' | '::grammar-error' | '::-webkit-calendar-picker-indicator' | '::-webkit-color-swatch' | '::-webkit-color-swatch-wrapper' | '::-webkit-details-marker' | '::-webkit-file-upload-button' | '::-webkit-image-inner-element' | '::-webkit-inner-spin-button' | '::-webkit-input-placeholder' | '::-webkit-input-speech-button' | '::-webkit-keygen-select' | '::-webkit-media-controls-panel' | '::-webkit-media-controls-timeline-container' | '::-webkit-media-slider-container' | '::-webkit-meter-bar' | '::-webkit-meter-even-less-good-value' | '::-webkit-meter-optimum-value' | '::-webkit-meter-suboptimal-value' | '::-webkit-progress-bar' | '::-webkit-progress-value' | '::-webkit-resizer' | '::-webkit-resizer:window-inactive' | '::-webkit-scrollbar' | '::-webkit-scrollbar-button' | '::-webkit-scrollbar-button:disabled' | '::-webkit-scrollbar-button:double-button:horizontal:end:decrement' | '::-webkit-scrollbar-button:double-button:horizontal:end:increment' | '::-webkit-scrollbar-button:double-button:horizontal:end:increment:corner-present' | '::-webkit-scrollbar-button:double-button:horizontal:start:decrement' | '::-webkit-scrollbar-button:double-button:horizontal:start:increment' | '::-webkit-scrollbar-button:double-button:vertical:end:decrement' | '::-webkit-scrollbar-button:double-button:vertical:end:increment' | '::-webkit-scrollbar-button:double-button:vertical:end:increment:corner-present' | '::-webkit-scrollbar-button:double-button:vertical:start:decrement' | '::-webkit-scrollbar-button:double-button:vertical:start:increment' | '::-webkit-scrollbar-button:end' | '::-webkit-scrollbar-button:end:decrement' | '::-webkit-scrollbar-button:end:increment' | '::-webkit-scrollbar-button:horizontal' | '::-webkit-scrollbar-button:horizontal:decrement' | '::-webkit-scrollbar-button:horizontal:decrement:active' | '::-webkit-scrollbar-button:horizontal:decrement:hover' | '::-webkit-scrollbar-button:horizontal:decrement:window-inactive' | '::-webkit-scrollbar-button:horizontal:end' | '::-webkit-scrollbar-button:horizontal:end:decrement' | '::-webkit-scrollbar-button:horizontal:end:increment' | '::-webkit-scrollbar-button:horizontal:end:increment:corner-present' | '::-webkit-scrollbar-button:horizontal:increment' | '::-webkit-scrollbar-button:horizontal:increment:active' | '::-webkit-scrollbar-button:horizontal:increment:hover' | '::-webkit-scrollbar-button:horizontal:increment:window-inactive' | '::-webkit-scrollbar-button:horizontal:start' | '::-webkit-scrollbar-button:horizontal:start:decrement' | '::-webkit-scrollbar-button:horizontal:start:increment' | '::-webkit-scrollbar-button:start' | '::-webkit-scrollbar-button:start:decrement' | '::-webkit-scrollbar-button:start:increment' | '::-webkit-scrollbar-button:vertical' | '::-webkit-scrollbar-button:vertical:decrement' | '::-webkit-scrollbar-button:vertical:decrement:active' | '::-webkit-scrollbar-button:vertical:decrement:hover' | '::-webkit-scrollbar-button:vertical:decrement:window-inactive' | '::-webkit-scrollbar-button:vertical:end' | '::-webkit-scrollbar-button:vertical:end:decrement' | '::-webkit-scrollbar-button:vertical:end:increment' | '::-webkit-scrollbar-button:vertical:end:increment:corner-present' | '::-webkit-scrollbar-button:vertical:increment' | '::-webkit-scrollbar-button:vertical:increment:active' | '::-webkit-scrollbar-button:vertical:increment:hover' | '::-webkit-scrollbar-button:vertical:increment:window-inactive' | '::-webkit-scrollbar-button:vertical:start' | '::-webkit-scrollbar-button:vertical:start:decrement' | '::-webkit-scrollbar-button:vertical:start:increment' | '::-webkit-scrollbar-corner' | '::-webkit-scrollbar-corner:window-inactive' | '::-webkit-scrollbar-thumb' | '::-webkit-scrollbar-thumb:horizontal' | '::-webkit-scrollbar-thumb:horizontal:active' | '::-webkit-scrollbar-thumb:horizontal:hover' | '::-webkit-scrollbar-thumb:horizontal:window-inactive' | '::-webkit-scrollbar-thumb:vertical' | '::-webkit-scrollbar-thumb:vertical:active' | '::-webkit-scrollbar-thumb:vertical:hover' | '::-webkit-scrollbar-thumb:vertical:window-inactive' | '::-webkit-scrollbar-track' | '::-webkit-scrollbar-track-piece' | '::-webkit-scrollbar-track-piece:disabled' | '::-webkit-scrollbar-track-piece:end' | '::-webkit-scrollbar-track-piece:horizontal:decrement' | '::-webkit-scrollbar-track-piece:horizontal:decrement:active' | '::-webkit-scrollbar-track-piece:horizontal:decrement:hover' | '::-webkit-scrollbar-track-piece:horizontal:end' | '::-webkit-scrollbar-track-piece:horizontal:end:corner-present' | '::-webkit-scrollbar-track-piece:horizontal:end:double-button' | '::-webkit-scrollbar-track-piece:horizontal:end:no-button' | '::-webkit-scrollbar-track-piece:horizontal:end:no-button:corner-present' | '::-webkit-scrollbar-track-piece:horizontal:end:single-button' | '::-webkit-scrollbar-track-piece:horizontal:increment' | '::-webkit-scrollbar-track-piece:horizontal:increment:active' | '::-webkit-scrollbar-track-piece:horizontal:increment:hover' | '::-webkit-scrollbar-track-piece:horizontal:start' | '::-webkit-scrollbar-track-piece:horizontal:start:double-button' | '::-webkit-scrollbar-track-piece:horizontal:start:no-button' | '::-webkit-scrollbar-track-piece:horizontal:start:single-button' | '::-webkit-scrollbar-track-piece:start' | '::-webkit-scrollbar-track-piece:vertical:decrement' | '::-webkit-scrollbar-track-piece:vertical:decrement:active' | '::-webkit-scrollbar-track-piece:vertical:decrement:hover' | '::-webkit-scrollbar-track-piece:vertical:end' | '::-webkit-scrollbar-track-piece:vertical:end:corner-present' | '::-webkit-scrollbar-track-piece:vertical:end:double-button' | '::-webkit-scrollbar-track-piece:vertical:end:no-button' | '::-webkit-scrollbar-track-piece:vertical:end:no-button:corner-present' | '::-webkit-scrollbar-track-piece:vertical:end:single-button' | '::-webkit-scrollbar-track-piece:vertical:increment' | '::-webkit-scrollbar-track-piece:vertical:increment:active' | '::-webkit-scrollbar-track-piece:vertical:increment:hover' | '::-webkit-scrollbar-track-piece:vertical:start' | '::-webkit-scrollbar-track-piece:vertical:start:double-button' | '::-webkit-scrollbar-track-piece:vertical:start:no-button' | '::-webkit-scrollbar-track-piece:vertical:start:single-button' | '::-webkit-scrollbar-track:disabled' | '::-webkit-scrollbar-track:horizontal' | '::-webkit-scrollbar-track:horizontal:disabled' | '::-webkit-scrollbar-track:horizontal:disabled:corner-present' | '::-webkit-scrollbar-track:vertical:disabled' | '::-webkit-scrollbar-track:vertical:disabled:corner-present' | '::-webkit-scrollbar:horizontal' | '::-webkit-scrollbar:horizontal:corner-present' | '::-webkit-scrollbar:horizontal:window-inactive' | '::-webkit-scrollbar:vertical' | '::-webkit-scrollbar:vertical:corner-present' | '::-webkit-scrollbar:vertical:window-inactive' | '::-webkit-search-cancel-button' | '::-webkit-search-decoration' | '::-webkit-search-results-button' | '::-webkit-search-results-decoration' | '::-webkit-slider-container' | '::-webkit-slider-runnable-track' | '::-webkit-slider-thumb' | '::-webkit-slider-thumb:disabled' | '::-webkit-slider-thumb:hover' | '::-webkit-textfield-decoration-container' | '::-webkit-validation-bubble' | '::-webkit-validation-bubble-arrow' | '::-webkit-validation-bubble-arrow-clipper' | '::-webkit-validation-bubble-heading' | '::-webkit-validation-bubble-message' | '::-webkit-validation-bubble-text-block';
}

declare namespace $ {
    /** Returns error type, that don't match to normal value. */
    type $mol_type_error<Message, Info = {}> = Message & {
        $mol_type_error: Info;
    };
}

declare namespace $ {
    type Attrs<View extends $mol_view, Config, Attrs = ReturnType<View['attr']>> = {
        [name in keyof Attrs]?: {
            [val in keyof Config[Extract<name, keyof Config>]]: $mol_style_guard<View, Config[Extract<name, keyof Config>][val]>;
        };
    };
    type Medias<View extends $mol_view, Config> = {
        [query in keyof Config]: $mol_style_guard<View, Config[query]>;
    };
    type Keys<View extends $mol_view> = '>' | '@' | keyof $mol_style_properties | $mol_style_pseudo_element | $mol_style_pseudo_class | $mol_type_keys_extract<View, () => $mol_view> | `$${string}`;
    export type $mol_style_guard<View extends $mol_view, Config> = {
        [key in Keys<View>]?: unknown;
    } & $mol_style_properties & {
        [key in keyof Config]: key extends keyof $mol_style_properties ? $mol_style_properties[key] : key extends '>' | $mol_style_pseudo_class | $mol_style_pseudo_element ? $mol_style_guard<View, Config[key]> : key extends '@' ? Attrs<View, Config[key]> : key extends ('@media' | '@container') ? Medias<View, Config[key]> : key extends '@starting-style' ? $mol_style_guard<View, Config[key]> : key extends `[${string}]` ? {
            [val in keyof Config[key]]: $mol_style_guard<View, Config[key][val]>;
        } : key extends `--${string}` ? any : key extends keyof $ ? $mol_style_guard<InstanceType<Extract<$[key], typeof $mol_view>>, Config[key]> : key extends keyof View ? View[key] extends (id?: any) => infer Sub ? Sub extends $mol_view ? $mol_style_guard<Sub, Config[key]> : $mol_type_error<'Property returns non $mol_view', {
            Returns: Sub;
        }> : $mol_type_error<'Field is not a Property'> : key extends `$${string}` ? $mol_type_error<'Unknown View Class'> : $mol_type_error<'Unknown CSS Property'>;
    };
    export {};
}

declare namespace $ {
    function $mol_style_sheet<Component extends $mol_view, Config extends $mol_style_guard<Component, Config>>(Component: new () => Component, config0: Config): string;
}

declare namespace $ {
    /**
     * CSS in TS.
     * Statically typed CSS style sheets. Following samples show which CSS code are generated from TS code.
     * @see https://mol.hyoo.ru/#!section=docs/=xwq9q5_f966fg
     */
    function $mol_style_define<Component extends $mol_view, Config extends $mol_style_guard<Component, Config>>(Component: new () => Component, config: Config): HTMLStyleElement | null;
}

declare namespace $ {

	type $mol_vector_2d__bog_vmap_scene_1 = $mol_type_enforce<
		[ number, number ]
		,
		ConstructorParameters< typeof $mol_vector_2d<number> >
	>
	type $mol_vector_2d__bog_vmap_scene_2 = $mol_type_enforce<
		[ number, number ]
		,
		ConstructorParameters< typeof $mol_vector_2d<number> >
	>
	type $bog_vmap_scene_grid__shift_bog_vmap_scene_3 = $mol_type_enforce<
		ReturnType< $bog_vmap_scene['grid_shift'] >
		,
		ReturnType< $bog_vmap_scene_grid['shift'] >
	>
	type $bog_vmap_scene_grid__scale_bog_vmap_scene_4 = $mol_type_enforce<
		ReturnType< $bog_vmap_scene['grid_scale'] >
		,
		ReturnType< $bog_vmap_scene_grid['scale'] >
	>
	type $mol_view__style_bog_vmap_scene_5 = $mol_type_enforce<
		({ 
			'transform': ReturnType< $bog_vmap_scene['camera_transform'] >,
		}) 
		,
		ReturnType< $mol_view['style'] >
	>
	type $mol_view__sub_bog_vmap_scene_6 = $mol_type_enforce<
		ReturnType< $bog_vmap_scene['stage'] >
		,
		ReturnType< $mol_view['sub'] >
	>
	type $mol_view__sub_bog_vmap_scene_7 = $mol_type_enforce<
		readonly(any)[]
		,
		ReturnType< $mol_view['sub'] >
	>
	export class $bog_vmap_scene extends $mol_view {
		grid_shift( ): $mol_vector_2d<number>
		grid_scale( ): $mol_vector_2d<number>
		Grid( ): $bog_vmap_scene_grid
		camera_transform( ): string
		stage( ): readonly($mol_view_content)[]
		Stage( ): $mol_view
		pack_note( ): string
		sub( ): readonly(any)[]
		Wait( ): $mol_view
	}
	
}

//# sourceMappingURL=scene.view.tree.d.ts.map
declare namespace $.$$ {
    /** One compile round: the live root, the identity it was built under, the failure. */
    type mounted = {
        readonly made: $mol_view | null;
        readonly pack: string;
        readonly root: string;
        readonly supers: {
            readonly [klass: string]: string;
        };
        readonly error: string;
        readonly klass: string;
    };
    /**
     * Sandbox application of the editor.
     *
     * Takes a document over the bridge, compiles it, renders it, answers with
     * measured geometry and errors. It has no network, no Giper Baza and no
     * access to the user's keys — that is the whole point of the boundary.
     *
     * @see ../ARCHITECTURE.md sections 3 and 4
     */
    export class $bog_vmap_scene extends $.$bog_vmap_scene {
        /**
         * Last failure sent per stage, `null` when the stage is clear. See `error_post()`.
         *
         * A cell and not a field: this is what went out on the wire last, which is a
         * projection of state outward, and the pane keeps its six the same way. Kept
         * outside the graph it was a value nobody could wake on and no test could
         * read without reaching into the object.
         */
        error_sent(at: 'compile' | 'runtime', next?: string | null): string | null;
        /** Document source, view.tree text. Full document, never a patch. */
        doc_src(next?: string): string;
        /** Name of the class to instantiate. */
        doc_root(next?: string): string;
        /** Hand written class bodies, methods only, keyed by class name. */
        doc_js(next?: {
            readonly [klass: string]: string;
        }): {
            readonly [klass: string]: string;
        };
        /** Styles. Travel apart from the source, see `css_attach()`. */
        doc_css(next?: string): string;
        /**
         * Where free parts sit on the canvas, in world coordinates.
         *
         * Editor scaffolding, and a channel of its own for exactly that reason: the
         * document's own styles never carry a coordinate, so an export cannot pick
         * one up even by mistake. Not a property of the page being built.
         * @see ../bridge/bridge.ts, `spots_set`
         */
        spots(next?: {
            readonly [node: string]: {
                readonly x: number;
                readonly y: number;
            };
        }): {
            readonly [node: string]: {
                readonly x: number;
                readonly y: number;
            };
        };
        /**
         * Last measured box of every free part, remembered across culling.
         *
         * Merged by `sizes_remember()`, never replaced: a part just culled is not in
         * the DOM, so its absence from a report is not «no size» but «not drawn», and
         * taking it for a size would flip the part between shown and hidden forever.
         */
        sizes_seen(next?: {
            readonly [name: string]: $bog_vmap_scene_cull_box;
        }): {
            readonly [name: string]: $bog_vmap_scene_cull_box;
        };
        /**
         * Viewport of the canvas: the frame's own box, which is the scene's, since
         * the scene fills the frame. `null` until the first layout — `view_rect()`
         * refuses to touch the DOM in the middle of a render, and polls after.
         */
        screen(): {
            width: number;
            height: number;
        } | null;
        /**
         * Names of the placed parts the canvas has to draw right now. Parts nobody
         * placed are drawn unconditionally, and so is everything while the viewport
         * is unknown: culling by a coordinate or a box nobody has is a guess, and a
         * part hidden on a guess would never be measured out of it.
         */
        shown(): Set<string>;
        /**
         * Children of the document root, minus the ones off screen.
         *
         * Culling changes what is drawn and never what is stored: nothing here
         * reaches the document text. A child whose owning property cannot be read
         * is kept, because a case this does not understand is one it must not hide.
         */
        sub_shown(kids: readonly $mol_view_content[]): $mol_view_content[];
        /**
         * Puts the filter between the document root and the DOM, as `sub_visible()`:
         * the hook the renderer draws by and the standard list narrows the same way,
         * so `sub()` stays whole for every other reader — the walks, the seek, the
         * values. An own property, which the prototype swap of a rebuild leaves be.
         */
        cull_attach(made: $mol_view): void;
        /** Delivered assets: id to `blob:` URL of this realm. */
        assets(next?: {
            readonly [id: string]: string;
        }): {
            readonly [id: string]: string;
        };
        camera(next?: $bog_vmap_bridge_camera): $bog_vmap_bridge_camera;
        /**
         * Pan of the grid, in screen pixels.
         *
         * The same numbers `camera_transform()` puts in its `translate`, and they
         * have to be, or the lines would drift away from the nodes they are behind.
         * The camera is stated in world units because the host thinks in world units;
         * a ruler draws in screen pixels, so the conversion happens here and nowhere
         * else.
         */
        grid_shift(): $mol_vector_2d<number>;
        /** The rulers want a scale per axis, the camera is one isotropic number. */
        grid_scale(): $mol_vector_2d<number>;
        camera_transform(): string;
        /**
         * The frame has no address of its own — it is raised from markup — so the pack
         * arrives by message. One pack per realm still holds by construction: a realm
         * cannot unload a bundle, so the host makes the address part of the key of the
         * frame, and a second pack arrives in a frame that never saw a first.
         *
         * Empty until the message lands, and that is an ORDINARY state rather than an
         * impossible one, which is why `instance()` refuses to compile in it.
         * @see ../ARCHITECTURE.md section 5
         */
        pack_uri(next?: string): string;
        /**
         * The importer of THIS bundle, resolved once. The pack rewrites the importer
         * in the global `$` as it lands, and read late-bound after that the name
         * gives the pack's copy, whose cache is empty — which loads the pack again,
         * and again, six hundred script tags a second. Measured in headless Chrome.
         * A record around the class, which a cell would otherwise stamp and own.
         */
        importer(): {
            script: (uri: string) => any;
        };
        /**
         * Suspends until the pack bundle is in the realm, then stays resolved.
         * Everything that compiles reads this first: a class picks its base once, at
         * definition time, and a document compiled before the pack lands would keep
         * the base class of the scene's own bundle for good. A cross-origin
         * `<script src>` needs no permission of its own inside the boundary.
         */
        pack_ready(): string;
        /**
         * Why the canvas is empty, or an empty string when it is not.
         *
         * The suspension is caught here rather than in `stage()` so that the wait
         * has a face. Catching costs no reactivity: a suspending read promotes the
         * dependency before it throws, so this cell is subscribed to
         * `pack_ready()` either way and recomputes when the pack lands.
         */
        pack_note(): string;
        /**
         * One sandbox per document, never recreated.
         *
         * Reads nothing reactive, so the cell is computed once and never goes
         * stale. That is the requirement, not an accident: the base object of the
         * framework caches its context on first read, so a fresh
         * `Object.create( $ )` would silently cut already built instances off the
         * classes compiled after it.
         */
        sandbox(): typeof $$;
        /**
         * Texts and nothing else: the scene has no database and no keys, so a land is
         * read by the host and arrives as the three strings of each component. On the
         * bridge and not in the frame address, unlike the pack — a land is compiled
         * into the sandbox like the document and inherits the base class already
         * there, so a change of the list is a recompile, not a reload.
         * @see ../ARCHITECTURE.md section 5
         */
        libs(next?: readonly $bog_vmap_bridge_part[]): readonly $bog_vmap_bridge_part[];
        /**
         * The name of a class is read off its own tree rather than carried beside it,
         * the same rule the land model lives by: one source of truth for a derivable
         * fact. A part with no class declares nothing and keys nothing.
         *
         * Read inside `code()`, so a malformed library fails on the compile channel
         * with the name of the file it came from, like a malformed document does.
         */
        libs_parsed(): {
            defs: readonly $mol_tree2[];
            js: {
                readonly [klass: string]: string;
            };
        };
        /**
         * Normalized declarations of the libraries and the document, in the order
         * they can be defined in: libraries first, a base before its heir, one
         * declaration per name. The ordering helper of this module does it, and the
         * sort inside it is the canonical one from `lang` — the scene used to carry a
         * copy, and two copies of a sort are one divergence away from `Class
         * extends value undefined`.
         */
        doc_tree(): $mol_tree2;
        /**
         * Base class of every declaration, by name.
         *
         * The declarations are already normalized, so the single kid of a class is
         * its base and nothing else can be there.
         */
        supers(): {
            readonly [klass: string]: string;
        };
        /**
         * The hot swap reads this to tell a property that lost its cell from one that
         * changed between solo and keyed, and both questions are asked of a live
         * instance — whose atoms come from the whole chain, not from the last
         * declaration alone. So a base declared by the document is folded into its
         * heir, while a base from the pack is left out on purpose: its properties are
         * not ours to judge and their shape does not change under us.
         */
        shapes(): {
            readonly [klass: string]: $bog_vmap_scene_swap_shape;
        };
        /**
         * The call that makes cells of the handwritten body, emitted right after the
         * class: a decorator cannot be written into the string handed to
         * `new Function`. What the tree says is keyed or changeable goes along as
         * data, the rest the cells helper reads off the class itself.
         */
        cells_code(self: $mol_tree2): string;
        /**
         * Emitted class by class in topological order, and the handwritten body of a
         * class goes right after its own declaration, before the next class is
         * declared at all. Generating every declaration first and wrapping them
         * afterwards would look tidier and be wrong: the wrapper is a NEW class, so a
         * subclass built earlier keeps the unwrapped base in its prototype chain and
         * loses the handwritten methods of its parent.
         *
         * Class name and CSS go in as data through `JSON.stringify`: a user CSS with a
         * backtick or a `${` would tear the string apart otherwise.
         */
        code_parts(): readonly {
            readonly klass: string;
            readonly js: string;
        }[];
        /**
         * Generated source of the whole document, one string.
         *
         * Kept apart from the pieces because the pieces are what names a failure:
         * the whole document goes into ONE `new Function`, and a failure there says
         * nothing about which class caused it.
         */
        code(): string;
        /** Marks a failure with the class whose text caused it. */
        fault_named(error: Error, klass: string): Error & {
            klass: string;
        };
        /**
         * Generated source of one class: its declaration, then its handwritten body.
         *
         * Apart from `code()` so that a failure can be caught around one class and
         * named by it. The body wraps the declaration in a NEW class, which is why
         * the two are emitted together and never in two passes over the document.
         */
        class_code(tree: $mol_tree2, def: $mol_tree2, js: string | undefined): string[];
        /**
         * Compiles the document into the sandbox, overwriting classes in place.
         *
         * Returns a plain record rather than the class itself. A class has a
         * static `destructor`, so an atom would take ownership of it and stamp
         * `Symbol.toStringTag` with the atom id — and `dom_name()` is derived from
         * the string form of the constructor, which reads exactly that stamp. A
         * plain object has no `destructor` and stays untouched.
         */
        build(): {
            readonly Root: typeof $mol_view;
        };
        /**
         * The whole document goes into ONE `new Function`, so a failure there — a base
         * nobody declared, a syntax error in a handwritten body — carries no name.
         * Splitting the fast path into a call per class to keep that name would cost
         * every keystroke for the sake of the rare round that fails, so the search
         * runs only once something already went wrong.
         *
         * Into a scratch context and not into the sandbox: the retry must not add
         * half a generation of classes to the one the living component is using.
         */
        culprit(): string;
        /**
         * May the live instance be moved onto the freshly compiled classes. Three
         * things it cannot survive: another pack (the context of a live instance is
         * cached under a symbol private to a bundle), another root class (another
         * document), a changed base of any class it has ever been compiled with (a
         * DOM node takes `attr_static()` off its base once). A class it has never
         * seen takes nothing away. @see ../ARCHITECTURE.md section 3
         */
        identity_kept(live: mounted, pack: string, root: string, supers: {
            readonly [klass: string]: string;
        }): boolean;
        /**
         * The live root instance, the identity it was built under and why the last
         * compile failed, in one value: one computation, one cell. `instance()` and
         * `compile_error()` split it so that each moves only its own readers. A plain
         * record, which the owning catch of the framework refuses to stamp or destroy.
         *
         * An edit moves the living component onto the new classes instead of
         * building another one: cells are own fields of an instance, so a prototype
         * swap keeps every value, every subscription and the DOM node with its caret,
         * focus and scroll, which no snapshot carries. 6.1 ms against 8.7 ms for a
         * rebuild on the S2 bench, and flat in the size of the component.
         *
         * What it built last time is read off its own cache through a probe, the way
         * `view_rect()` does. A failed rebuild answers with that instance, so
         * `instance()` keeps its value and the living component stays whole.
         */
        mount(): mounted;
        /**
         * The live root instance.
         *
         * A cell of its own over `mount()`, so that a failure appearing or clearing
         * moves the error and nothing else: the value here stays the same object and
         * no subscriber of the document is woken by a message on the error channel.
         */
        instance(): $mol_view | null;
        /**
         * Why the last compile failed, or an empty string.
         *
         * In the graph rather than in a field, so that a reader wakes when it
         * changes. It used to be a plain field written from inside the cell that
         * builds the instance, which is the second forbidden case of section 13: not
         * a projection outwards but a write past the cells, and the label on the node
         * would light up a round late or not at all.
         */
        compile_error(): string;
        /** Class whose text failed to compile, when the failure names one. */
        compile_class(): string;
        /**
         * What keeps a CSS edit cheap: `doc_css()` is read here and nowhere else, so
         * restyling moves this cell alone while `sandbox()` and `instance()` stand
         * still together with all the live state.
         *
         * Not named `style()`: that name is taken by the base view and must return a
         * dictionary of CSS properties for the rendered node.
         */
        css_attach(): HTMLStyleElement | null;
        /**
         * Placement of the free parts, hung as a style element of the scene's own.
         *
         * Apart from `css_attach()` on purpose, and not merely tidier: the document
         * CSS is what an export writes out, so a world coordinate that ever lands in
         * it ships the editor's desk layout into a deployed site. Here it cannot,
         * because the host sends coordinates and the scene alone turns them into
         * rules — the document text never sees them at all.
         *
         * Absolute positioning is TEMPORARY, scaffolding until artboards of stage 6:
         * inside an artboard the layout is a plain flex tree and only free parts
         * lie by coordinates.
         */
        spots_attach(): HTMLStyleElement | null;
        /**
         * Under a constant id outside `style_scope`, like the placement: the sweep on
         * every compile of the document must not take the library styles with it. Read
         * off the raw parts and not off `libs_parsed()`, so a library that fails to
         * parse fails on the compile channel and does not take the styles of its
         * neighbours down with it.
         */
        libs_css_attach(): HTMLStyleElement | null;
        /**
         * World coordinates go into `left`/`top` unchanged: the stage sits under one
         * `transform` with `transform-origin: 0 0`, so the root class is at world zero
         * and its offset children are already in world units.
         *
         * **`!important` is not laziness here, it is the only thing that works.**
         * Half the standard library positions itself, and a bare attribute selector
         * declaring `position: relative` ties on specificity, so the cascade falls
         * through to source order — and this element is attached before the pack
         * script has even been fetched, which puts every pack rule after it. Measured:
         * three components dropped at one x, two landed on it, the text field came out
         * 122 px to the right, offset by exactly the width of its in-flow neighbour,
         * because it stayed `relative` and read `left` as a shift from its static
         * position. Two of three looked right by luck, and the pack is somebody else's
         * CSS we do not get to renumber.
         *
         * Margins are left alone, and a component carrying its own lands offset by
         * them — the standard badge has a negative one and comes out 8 px above the
         * point it was aimed at. Overriding that would be the editor deciding how
         * somebody else's component looks.
         */
        spots_css(): string;
        /**
         * Drops style elements of the previous compilation.
         *
         * The attach helper never removes them, and a class renamed while the
         * user types leaves one behind on every keystroke — hundreds per editing
         * session. Only elements of this scene are swept, never someone else's,
         * and never the placement element: it lives under `spots_id`, outside this
         * prefix, precisely so a document edit cannot take the canvas apart.
         */
        styles_sweep(keep: string): void;
        /**
         * Swaps `asset:` for `blob:`. The bytes arrive over the bridge and the URL
         * is made here: one minted by the host belongs to the host origin and does
         * not open in an opaque one. An id with no bytes yet is left in place.
         */
        assets_apply(text: string): string;
        /** Every text of the document an address can stand in. */
        texts(): string[];
        /** Ids the document mentions and the host has not delivered, in order of mention. */
        assets_missing(): string[];
        /**
         * Asks the host for one asset. Once, for as long as the id stays missing:
         * the cell is read by `assets_push()` while it is, swept when it is not, and
         * made anew — asking again — should the id ever go missing again.
         */
        asset_ask(id: string): string;
        /** Projection of `assets_missing()` onto the wire, read from `auto()`. */
        assets_push(): string[];
        stage(): readonly $mol_view_content[];
        post(message: $bog_vmap_bridge_up): void;
        /** Wires the host wants labelled: root property names, the whole list each time. */
        values_wanted(next?: readonly string[]): readonly string[];
        /**
         * Wall clock of the last `values` sent, in the graph rather than beside it.
         *
         * It stays a CLOCK READING and not a serial number, and that is the one thing
         * to keep straight about it. A serial number is what an ORDER wants — «did the
         * answer come after the question», where two events inside one millisecond read
         * as simultaneous and the pane's watchdog once disarmed over exactly that. This
         * stamp answers a different question, «how long ago», and a counter cannot
         * answer it at all: the throttle subtracts it from `now()` to get the wait that
         * is left. Two sends in one millisecond give the full wait, which is the safe
         * side of the rounding.
         */
        values_at(next?: number): number;
        /** Shortest gap between two `values` messages, in ms. */
        values_period(): number;
        /** The clock. A method so that a test can move it by hand. */
        now(): number;
        /**
         * Labels of the wanted wires, sent to the host no more often than
         * `values_period()`.
         *
         * The values are read here, inside the cell, so the document's own atoms wake
         * it: the graph is shared with the document, see section 4. Every change
         * restarts the timer with whatever is left of the period, so a wire that
         * changes on every frame costs one message per period and a wire that
         * changes once is reported at once.
         *
         * `values_at` is a cell, and it is read here through a probe — deliberately,
         * so that this cell does NOT subscribe to it. Nothing else
         * writes the stamp: it changes only as a consequence of this very cell's
         * timer having fired, and at that moment the message has just gone out and
         * there is nothing to recompute. Were the read a subscribing one, the write
         * would invalidate this cell, the recomputed wait would be a full period,
         * and a fresh timer would resend values already on the wire — one extra
         * message per period, for ever. Same reason `mount()` probes its own past.
         * Measured in `values.test.ts`, on a hand moved clock: first send at delay 0,
         * a change 100 ms later waits the remaining 150, and the stamp is still there
         * after a tick on which nobody looked at it.
         */
        values_task(): $mol_after_timeout | null;
        /**
         * The one window the scene talks to.
         *
         * A plain field, never a cell: a cross-origin `Window` written into an atom
         * is walked by the framework's deep comparison, which reads `location.href`
         * and throws `SecurityError` — and the handler then dies silently. Identity
         * comparison alone touches no property and is safe.
         */
        peer(): Window;
        message_receive(event?: MessageEvent): void;
        /**
         * Replays a click the host overlay took, on whatever is under that point here.
         *
         * The host sends world coordinates and this side owns the same camera the
         * stage is drawn with, so the point on this window is `(world - camera) *
         * zoom` — the inverse of what `sizes_of` does to a measured box. The replay
         * itself lives in the click helper of this module, where it is tested.
         */
        click_apply(x: number, y: number, mods: $bog_vmap_bridge_mods): void;
        message_listener(): $mol_dom_listener;
        boot(): $mol_after_tick;
        /**
         * Relays `Escape` to the host. With the pointer let inside a part the focus
         * is in this frame, so the key never reaches the editor's own listener, and
         * the only way out was a click past the box. Nothing else travels: what is
         * typed into the document stays in the document.
         */
        key_listener(): $mol_dom_listener;
        key_relay(event?: KeyboardEvent): void;
        /**
         * The wire graph does not see layout, and that is a whole class of silent
         * staleness, not one occasion. A frame with no layout at all — a hidden tab, a
         * collapsed panel — measures 0x0; a late font or a decoded image resizes the
         * document with nothing in the graph moving. In every case the host would keep
         * the stale numbers until the next edit. The observer covers all of them at
         * once, because its first delivery happens exactly when the box first exists.
         *
         * The wrapper is here to give the observer a `destructor`: a bare
         * `ResizeObserver` is not ownable, so the atom would leave the previous one
         * connected on every rebuild.
         *
         * The set of watched nodes is not decided here — it is every node the last
         * report measured, which `resize_sync()` hands over. The root alone is not
         * enough and stops being enough the moment there is an artboard: a page of
         * fixed width keeps its own box while everything inside it reflows, so the
         * one observer that used to be here would never fire and the host would sit
         * on the boxes of the previous layout.
         */
        resize_watch(): {
            observer: ResizeObserver;
            destructor: () => void;
        };
        /**
         * Nodes the observer is watching right now. A plain field on purpose: it is a
         * mirror of what `ResizeObserver` already holds, read by nobody but the one
         * method that keeps the two in step, so putting it in the graph would add a
         * cell that can never wake anything.
         */
        resize_seen: Set<Element>;
        /** Watches exactly the nodes of the last measurement, and nothing else. */
        resize_sync(nodes: readonly Element[]): void;
        /**
         * Debounced answer to the host.
         *
         * A timeout and not an animation frame: the scene lives in an iframe, and a
         * background tab stops firing animation frames.
         *
         * The cell depends on the rendered tree, not only on the sources. The
         * report reads geometry and failures off the DOM, and a timer started
         * from a source change alone can easily fire before the frame is
         * committed — then the sizes are of the previous layout and a render
         * error is not on the node yet.
         */
        report_task(): $mol_after_timeout;
        report_send(): void;
        report_post(): void;
        /**
         * Keeps the boxes of the free parts for the next culling round, merged into
         * `sizes_seen()`. Only the direct children of the root are kept, the same
         * set `shown()` judges: one path segment is exactly one free part.
         */
        sizes_remember(sizes: {
            readonly [node: string]: $bog_vmap_bridge_rect;
        }): void;
        /**
         * The failure of the last render, and the node it belongs to.
         *
         * The walk goes over the views and not over the DOM, even though a failing
         * element is a `querySelector` away. The host addresses a node by the path
         * `sizes` was keyed with, and the attribute the element carries is a
         * different vocabulary: lowercased and joined by underscores, so `My_box`
         * and `my/Box` reach the host as one string and neither of them matches. A
         * label put on the wrong node is worse than no label at all.
         *
         * A document whose own render throws is the common case, so the root is
         * asked first — that is inside the walk, which starts there.
         */
        render_error(made: $mol_view): {
            message: string;
            node: string;
        };
        /**
         * The free part a path falls inside, which is how the host names a node.
         *
         * One segment and never the whole path: the host looks a node up by the name
         * it was given in `sizes`, and there only the direct children of the root are
         * kept — one path segment is exactly one free part. A deeper path is reported
         * by the part that CONTAINS it rather than by its own last segment, and that
         * is not a rounding but the honest answer: the failure really is inside that
         * part, while a bare last segment would collide with a part of the same name
         * elsewhere and put the mark on the wrong node, silently.
         *
         * The root itself is no node of the canvas, so it comes back empty and the
         * failure stays in the status line, where a failure of the whole document
         * belongs.
         */
        part_of(path: string): string;
        /**
         * The failure written on the node of one view, or an empty string.
         *
         * A suspension is not a failure: the framework writes the same attribute while
         * a fiber waits, and reporting that would light the node up on every load.
         */
        view_broken(view: $mol_view): string;
        /**
         * Node of the first live instance of a class, by the path the host uses.
         *
         * This is how a COMPILE failure gets a node. The failure names a class, and
         * a class is not a node — but the tree still standing on the screen is the
         * one built from the previous text, so the instance of the class just broken
         * is exactly the node the user is looking at. When the class has no live
         * instance, or is the root itself, there is nothing better to say than the
         * root, and when it is not named at all the answer is empty.
         */
        class_node(made: $mol_view, klass: string): string;
        /**
         * How to walk a rendered document: the three things the walks need to know
         * about the framework, in one place because both of them need the same three
         * and a second copy would be a second vocabulary.
         */
        walk_of(made: $mol_view): {
            key: string;
            view_of: (kid: unknown) => $mol_view | null;
            kids_of: (view: $mol_view) => readonly $mol_view_content[];
            prop_of: (view: $mol_view) => string;
        };
        /**
         * Reports a failure only when it changes, and `null` once it is gone.
         *
         * Without the explicit clear the host cannot tell a failure that is
         * still there from one that has just been fixed: the scene would simply
         * go quiet, and quiet is indistinguishable from broken. Edge triggering
         * also stops the same message being resent on every report round.
         *
         * `null` rather than an empty string, because an empty error text is a
         * plausible bug and must not read as good news. The two stages clear
         * independently.
         */
        error_post(at: 'compile' | 'runtime', message: string, node: string): void;
        /**
         * Geometry of the document, in world units, and the nodes it was read off.
         *
         * The walk itself knows nothing of the framework; what a view is, what its
         * children are and which property holds it are the three things this class
         * knows and hands over.
         */
        sizes_of(root: $mol_view): $bog_vmap_scene_measure_result<Element>;
        /**
         * Is this piece of content a view, told by shape rather than by class.
         *
         * Not a fix for a break: measured, an `instanceof` against the base class
         * reports all seven nodes here, pack built ones included. It works by a
         * coincidence of scope, and the coincidence is worth spelling out because the
         * same operator does the opposite one file away.
         *
         * The base class named in THIS file compiles to a bare identifier, and no
         * declaration of that name stands in the emitted closure around it, so the
         * name goes up the scope chain to the global — which is where the donor pack
         * puts its own classes, and which is therefore the very class the document
         * extends. Late binding, check passes. The same text inside the framework's
         * own file sits next to the declaration and binds early, which is exactly why
         * `render()` refuses a pack built document and why it is mounted as a DOM node.
         *
         * So the operator holds only while this method stays in a file that does not
         * declare that name, and while the pack is the last writer of the global.
         * Neither is a property of what is being asked. Shape is.
         * @see ../ARCHITECTURE.md section 4
         */
        view_like(kid: unknown): kid is $mol_view;
        /**
         * Property the view is held by, taken from the owning atom.
         *
         * That is the flat property name of the root class — see section 1 of
         * the architecture — which is exactly the handle the host addresses a
         * node with, at any depth of nesting.
         */
        view_prop(view: $mol_view): string;
        auto(): any[];
    }
    export {};
}

declare namespace $.$$ {
}

declare namespace $ {
    /**
     * A value of the document as a short label for a wire.
     *
     * Text and numbers as they are, arrays and plain objects as JSON, anything
     * else — a view, a class — by its own `toString`, which for an object of the
     * framework is its id. Whitespace is folded and the tail cut: a label sits on
     * one line.
     */
    function $bog_vmap_scene_value_text(val: unknown, limit?: number): string;
    /**
     * Current values of the named wires, read off the root instance.
     *
     * A wire is a property of the root class, so its value is one call. A call that
     * throws is reported as the text of the error under that name, and the others
     * are still read: a broken wire is a label, not a dead scene. A suspension is
     * the one exception and is rethrown, so the cell calling this waits for the
     * value instead of labelling a loading wire as broken.
     */
    function $bog_vmap_scene_values(this: $, root: object, names: readonly string[], limit?: number): {
        readonly [name: string]: string;
    };
}

declare namespace $ {
    /** A node of the document, by the path the host addresses it with. */
    type $bog_vmap_scene_found<View> = {
        readonly path: string;
        readonly view: View;
    };
    /**
     * First node of a rendered document the probe accepts, and its path.
     *
     * The path is built exactly as the measuring walk builds it, and that is
     * the whole reason this exists as a walk of its own rather than as a read of the
     * DOM. A failing element does carry an attribute naming it, but that attribute
     * is lowercased and joined by underscores, so `My_box` and `my/Box` arrive as the
     * same string and neither matches the key the host was given in `sizes`. A label
     * placed by a name that does not match is worse than no label.
     *
     * Pure, and out of the view for the reason the measurement is: everything that
     * knows about the framework is handed in, so the walk itself knows only paths.
     *
     * @param key path of the root, which every deeper path is built onto
     */
    function $bog_vmap_scene_seek<View>(root: View, how: {
        readonly key: string;
        /** The kid as a view, or `null` when it is not one. */
        readonly view_of: (kid: unknown) => View | null;
        /** Children of a view, or none when they cannot be read. */
        readonly kids_of: (view: View) => readonly unknown[];
        /** Property the view is held by, empty when it is held by nothing named. */
        readonly prop_of: (view: View) => string;
    }, probe: (view: View) => boolean): $bog_vmap_scene_found<View> | null;
}

export = $;
//# sourceMappingURL=web.d.ts.map
