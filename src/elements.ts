import {
    Accessor,
    children,
    createMemo,
    createRenderEffect,
    JSX,
    mapArray,
    on,
    onCleanup,
    splitProps,
} from 'solid-js';
import {
    AttachStrategy,
    Constructable,
    NonFunctionKeys,
    Overwrite,
    SxiInstance,
    SxiObject,
} from './types';

export const INTERNAL_PROPS = ['children', 'ref', 'args'];

export function resolve<T>(value: Accessor<T> | T): T {
    return typeof value === 'function'
        ? (value as Accessor<T>)()
        : (value as T);
}

export const parentChildren = <
    TContext extends object,
    TSource extends Constructable,
>(
    context: TContext,
    getObject: Accessor<SxiObject<TContext, TSource>>,
    props: ClassTypeReservedProps<TSource>,
) => {
    const childNodes = children(() => {
        const result = resolve(props.children);
        return Array.isArray(result) ? result : [result];
    });

    const parent = getObject();
    createRenderEffect(
        mapArray(
            childNodes as unknown as Accessor<
                SxiObject<TContext, Constructable>[]
            >,
            (_child: SxiObject<TContext, Constructable>) => {
                const child = resolve(_child) as SxiObject<
                    TContext,
                    Constructable
                >;

                /* <Show/> will return undefined if it's hidden */
                if (!child?.__sxi || !parent?.__sxi) {
                    // console.warn(
                    //   "CNST: Attempting to attach child to parent but internal state not set. Ignoring...",
                    //   child,
                    //   parent,
                    // );
                    return;
                }

                const { attach } = child.__sxi;
                // Default attach behaviour, setting a field on the parent
                if (!attach) {
                    return;
                } else if (typeof attach === 'string') {
                    // @ts-expect-error; Impossible to know runtime fields of parent
                    parent[attach] = child;
                    onCleanup(() => {
                        // @ts-expect-error; Impossible to know runtime fields of parent
                        if (parent[attach] === child) {
                            // @ts-expect-error; Impossible to know runtime fields of parent
                            parent[attach] = undefined;
                        }
                    });
                } else if (attach instanceof Function) {
                    const cleanup = attach(context, parent, child);
                    onCleanup(() => {
                        cleanup();
                    });
                } else {
                    console.error({ child, parent });
                    throw new Error(
                        'CNST: Error attaching child to parent.  The attach strategy is not a string, null, or an attach strategy function. See above for child/parent objects.',
                    );
                }

                // Update internal state
                child.__sxi.parent = parent.__sxi;
                parent.__sxi.children.push(child.__sxi);
                onCleanup(() => {
                    const childIndex = parent.__sxi.children.findIndex(
                        (c) => c === child.__sxi,
                    );
                    if (childIndex >= 0) {
                        parent.__sxi.children.splice(childIndex, 1);
                    }
                });
            },
        ),
    );
};

/**
 * Reactively manages props using either the extra prop handler or just setting the field on the class.
 */
export const applyProps = <
    TContext extends object,
    TSource extends Constructable,
>(
    object: SxiObject<TContext, TSource>,
    props: Record<string, Accessor<unknown> | unknown>,
    extraPropHandlers: ExtraPropsHandlers<TContext, TSource>,
) =>
    createRenderEffect(
        mapArray(
            () => Object.keys(props),
            (key) => {
                /* We wrap it in an effect only if a prop is a getter or a function */
                const descriptors = Object.getOwnPropertyDescriptor(props, key);
                const isGetterField = !!descriptors?.get;
                const isEvent = key.startsWith('on');
                const isGetterFunction =
                    typeof descriptors?.value === 'function' && !isEvent;

                const applyProp = (value: unknown) => {
                    const v = isEvent ? value : resolve(value);

                    const handler = extraPropHandlers[key];
                    if (handler) {
                        handler(
                            object.__sxi.solixi,
                            object.__sxi.parent?.object,
                            object,
                            v,
                        );
                    } // @ts-expect-error; Impossible to know runtime fields of object
                    else object[key] = v;
                };

                isGetterField
                    ? createRenderEffect(on(() => props[key], applyProp))
                    : isGetterFunction
                    ? // @ts-expect-error; Bad typing
                      createRenderEffect(on(props[key], applyProp))
                    : applyProp(props[key]);
            },
        ),
    );

export const useObject = <
    TContext extends object,
    TSource extends Constructable,
>(
    context: TContext,
    options: WrapConstructableOptions<
        TContext,
        TSource,
        Record<string, ExtraPropHandler<TContext, TSource>>
    >,
    getObject: Accessor<SxiObject<TContext, TSource>>,
    props: ClassProps<TContext, TSource, ExtraPropsHandlers<TContext, TSource>>,
) => {
    // Old internal props ['ref', 'args', 'object', 'attach', 'children']
    const [internalProps, externalProps] = splitProps(props, INTERNAL_PROPS);

    // Manage parent / child relations
    parentChildren(context, getObject, internalProps);

    createRenderEffect(
        () =>
            // @ts-expect-error; I can't be bothered to fix this.  `ref` is converted to a function by solid.
            internalProps.ref instanceof Function &&
            internalProps['ref'](getObject()),
    );

    // Apply props to object on change.
    createRenderEffect(() => {
        applyProps(getObject(), externalProps, options.extraProps);
    });
};
/**
 * Wraps an object in a SxiInstance<T>
 * @template T extends Constructable - Type of obj to wrap
 * @param target - Obj to wrap
 * @param state - Shared SxiState
 * @param type - Type string
 * @param props - Props
 * @returns
 */
export const prepareObject = <
    TContext extends object,
    TSource extends Constructable,
    TExtraProps extends Record<string, ExtraPropHandler<TContext, TSource>>,
>(
    target: InstanceType<TSource> & { __sxi?: SxiInstance<TContext, TSource> },
    state: TContext,
    type: string,
    props: ClassProps<TContext, TSource, TExtraProps>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    options: WrapConstructableOptions<TContext, TSource, TExtraProps>,
) => {
    const object: InstanceType<TSource> & {
        __sxi?: SxiInstance<TContext, TSource>;
    } = target;

    const instance: SxiInstance<TContext, TSource> = object?.__sxi ?? {
        solixi: state,
        type,
        parent: null as unknown as SxiInstance<TContext, Constructable>,
        object: object as SxiObject<TContext, TSource>,
        children: [],
        attach: options.attach,
    };

    if (object) {
        object.__sxi = instance;
    }

    if (props.ref) {
        props.ref(object);
    }
    return instance;
};

export type ExtraPropHandler<
    TContext extends object,
    TSource extends Constructable,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    V = any,
> = (
    ctx: TContext,
    parent: SxiObject<TContext, Constructable> | undefined,
    object: SxiObject<TContext, TSource>,
    value: V,
) => void | (() => void);

export type ExtraPropsHandlers<
    TContext extends object,
    TSource extends Constructable,
> = { [k: string]: ExtraPropHandler<TContext, TSource> };

type ExtraPropsSignature<
    TContext extends object,
    T extends ExtraPropsHandlers<TContext, Constructable>,
> = {
    [K in keyof T]: Parameters<T[K]>[3];
};
export type ClassTypeReservedProps<TSource extends Constructable> = {
    ref?: InstanceType<TSource> | ((instance: InstanceType<TSource>) => void);
    args?: ConstructorParameters<TSource>;
    children?: JSX.Element | null;
};

export type ClassProps<
    TContext extends object,
    TSource extends Constructable,
    TExtraProps extends ExtraPropsHandlers<TContext, TSource>,
> = Partial<
    Overwrite<
        Pick<InstanceType<TSource>, NonFunctionKeys<InstanceType<TSource>>>, // Set all fields on instance type.
        ExtraPropsSignature<TContext, TExtraProps> &
            ClassTypeReservedProps<TSource> // Overwride defaults with extra props + reserved props types.
    >
>;

export type WrapConstructableOptions<
    TContext extends object,
    TSource extends Constructable,
    TExtraProps extends Record<string, ExtraPropHandler<TContext, TSource>>,
> = {
    // How to attach this object to the parent
    attach: AttachStrategy<TContext, TSource>;
    // Default args incase args is emitted in props
    defaultArgs:
        | ConstructorParameters<TSource>
        | ((context: TContext) => ConstructorParameters<TSource>);
    // Extra props and their handlers
    extraProps: TExtraProps;
};

/**
 * Wraps a Constructable class in a SolidJS component, to be used in JSX.
 *
 * @template TSource extends Constructable -
 * @param source - Class to wrap
 * @param options - Options defining how to attach parent -> children + add extra behaviours like
 * @returns
 */
export const wrapConstructable = <
    TContext extends object,
    TSource extends Constructable,
    TExtraProps extends Record<string, ExtraPropHandler<TContext, TSource>>,
>(
    source: TSource,
    options: WrapConstructableOptions<TContext, TSource, TExtraProps>,
    useState: () => TContext,
) => {
    const Component = (props: ClassProps<TContext, TSource, TExtraProps>) => {
        const state = useState();

        const getObject = createMemo(() => {
            const getDefaultArgs = () => {
                if (typeof options.defaultArgs === 'function') {
                    return options.defaultArgs(state);
                } else {
                    return options.defaultArgs;
                }
            };
            const args: ConstructorParameters<TSource> =
                (props.args as ConstructorParameters<TSource>) ??
                getDefaultArgs();

            const sourceObject = new source(
                ...args,
            ) as unknown as InstanceType<TSource> & {
                __sxi?: SxiInstance<TContext, TSource>;
            };
            const instance = prepareObject<TContext, TSource, TExtraProps>(
                sourceObject,
                state,
                source.name,
                props,
                options,
            );
            return instance.object;
        });

        useObject(
            state,
            options,
            getObject,
            props as unknown as ClassProps<
                TContext,
                TSource,
                ExtraPropsHandlers<TContext, TSource>
            >,
        );

        return getObject as unknown as Element;
    };
    Object.defineProperty(Component, 'name', {
        value: source.name,
        writable: false,
    });
    return Component;
};
