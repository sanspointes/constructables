import {
  createMemo,
  createRenderEffect,
  on,
  JSX,
  mapArray,
  splitProps,
  children,
  Accessor,
  onCleanup,
} from "solid-js";
import {
  AttachStrategy,
  Constructable,
  NonFunctionKeys,

  Overwrite,

  SxiInstance,
  SxiObject,
  WrapFieldsWithAccessor,
} from "./types";

export const INTERNAL_PROPS = ["children", "ref", "args"];

export function resolve<T>(value: Accessor<T> | T): T {
  return typeof value === 'function' ? (value as Accessor<T>)() : value as T
}

export const parentChildren = <
  TContext extends object,
  TSource extends Constructable
>(
  context: TContext,
  getObject: Accessor<SxiObject<TContext, TSource>>,
  props: ClassTypeReservedProps<TContext, TSource>
) => {
  const childNodes = children(() => {
    const result = resolve(props.children)
    return Array.isArray(result) ? result : [result]
  });

  const parent = getObject()
  createRenderEffect(
    mapArray(childNodes as unknown as Accessor<(SxiObject<TContext, Constructable>)[]>, (_child) => {
      const child: SxiObject<TContext, Constructable> = resolve(_child)

      /* <Show/> will return undefined if it's hidden */
      if (!child?.__sxi || !parent?.__sxi) {
        console.warn('CNST: Attempting to attach child to parent but internal state not set. Ignoring...', child, parent);
        return;
      }

      const { attach } = child.__sxi;
      // Default attach behaviour, setting a field on the parent
      if (!attach) {
        return;
      } else if (typeof(attach) === 'string') {
        parent[attach] = child;
        onCleanup(() => {
          if (parent[attach] === child) {
            parent[attach] = undefined;
          }
        });
      } else if (attach instanceof Function) {
        console.log('Attach function');
        const cleanup = attach(context, parent, child);
        onCleanup(() => {
          console.log('Cleanup ');
          cleanup();
        });
      } else {
        console.error({ child, parent });
        throw new Error('CNST: Error attaching child to parent.  The attach strategy is not a string, null, or an attach strategy function. See above for child/parent objects.');
      }

      // Update internal state
      child.__sxi.parent = parent;
      parent.__sxi.children.push(child);
      onCleanup(() => {
        const childIndex = parent.__sxi.children.findIndex(c => c === child);
        if (childIndex >= 0) {
          parent.__sxi.children.splice(childIndex, 1);
        }
      })
    })
  );
}


/**
 * Reactively manages props using either the extra prop handler or just setting the field on the class.
 */
export const applyProps = <TContext extends object, TSource extends Constructable>(
  object: SxiObject<TContext, TSource>,
  props: Record<string, Accessor<unknown>|unknown>,
  extraPropHandlers: ExtraPropsHandlers<TContext, TSource>,
) =>
  createRenderEffect(mapArray(() => Object.keys(props) , (key) => {
    console.log(`Starting to manage prop "${key}" for `, object.__sxi.type);
    /* We wrap it in an effect only if a prop is a getter or a function */
    const descriptors = Object.getOwnPropertyDescriptor(props, key);
    const isGetterField = !!descriptors?.get
    const isEvent = key.startsWith('on');
    const isGetterFunction = typeof descriptors?.value === "function" && !isEvent;

    const applyProp = (value: unknown) => {
      const v = isEvent ? value : resolve(value);
      
      if (extraPropHandlers[key]) extraPropHandlers[key](object.__sxi.state, object.__sxi.parent, object, v);
      else object[key] = v;
    }

    isGetterField
      ? createRenderEffect(on(() => props[key], applyProp))
      : isGetterFunction 
        ? createRenderEffect(on(props[key], applyProp))
        : applyProp(props[key]);
  }));


export const useObject = <TContext extends object, TSource extends Constructable>(
  context: TContext,
  options: WrapConstructableOptions<TContext, TSource, Record<string, ExtraPropHandler<TContext, TSource>>>,
  getObject: Accessor<SxiObject<TContext, TSource>>,
  props: ClassTypeProps2<TContext, TSource, ExtraPropsHandlers<TContext, TSource>>
) => {
  // Old internal props ['ref', 'args', 'object', 'attach', 'children']
  const [internalProps, externalProps] = splitProps(props, INTERNAL_PROPS);

  // Manage parent / child relations
  parentChildren(context, getObject, internalProps);

  // @ts-expect-error; I can't be bothered to fix this.  `ref` is converted to a function by solid.
  createRenderEffect(() => internalProps.ref instanceof Function && internalProps.ref(getObject()))

  // Apply props to object on change.
  createRenderEffect(() => {
    applyProps(getObject(), externalProps, options.extraProps);
  })
}
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
  props: ClassTypeProps2<TContext, TSource, TExtraProps>,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  options: WrapConstructableOptions<TContext, TSource, TExtraProps>,
) => {
  console.debug(`CNST: Preparing ${type}`);
  const object: InstanceType<TSource> & { __sxi?: SxiInstance<TContext, TSource> } = target;

  const instance: SxiInstance<TContext, TSource> = object?.__sxi ?? {
    solixi: state,
    type,
    parent: null as unknown as SxiInstance<TContext, Constructable>,
    object: object as SxiObject<TContext, TSource>,
    children: [],
    attach: options.attach,
    props,
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
  parent: SxiObject<TContext, Constructable>,
  object: SxiObject<TContext, TSource>,
  value: V,
) => void | (() => void);

export type ExtraPropsHandlers<
  TContext extends object,
  TSource extends Constructable,
> = { [k: string]: ExtraPropHandler<TContext, TSource> };

type ExtraPropsSignature<TContext extends object, T extends ExtraPropsHandlers<TContext, Constructable>> = {
  [K in keyof T]: Parameters<T[K]>[3]
}
export type ClassTypeReservedProps<TContext extends object, TSource extends Constructable> = {
  ref?: InstanceType<TSource>|SxiObject<TContext, TSource>,
  args?: ConstructorParameters<TSource>,
  children?: JSX.Element | null
}


export type ClassTypeProps2<
  TContext extends object,
  TSource extends Constructable,
  TExtraProps extends ExtraPropsHandlers<TContext, TSource>,
> = Partial<WrapFieldsWithAccessor<Overwrite<
  Pick<InstanceType<TSource>, NonFunctionKeys<InstanceType<TSource>>>, // Set all fields on instance type.
  ExtraPropsSignature<TContext, TExtraProps> & ClassTypeReservedProps<TContext, TSource> // Overwride defaults with extra props + reserved props types.
>>>;
  

export type WrapConstructableOptions<
  TContext extends object,
  TSource extends Constructable,
  TExtraProps extends Record<string, ExtraPropHandler<TContext, TSource>>,
> = {
  // How to attach this object to the parent
  attach: AttachStrategy<TContext, TSource>;
  // Default args incase args is emitted in props
  defaultArgs: ConstructorParameters<TSource> | ((context: TContext) => ConstructorParameters<TSource>);
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
  TObject extends InstanceType<TSource> = InstanceType<TSource>,
>(
  source: TSource,
  options: WrapConstructableOptions<TContext, TSource, TExtraProps>,
  useState: () => TContext,
) => {
  const Component = (
    props: ClassTypeProps2<TContext, TSource, TExtraProps>
  ) => {
    const state = useState();

    const getObject = createMemo(() => {
      const getDefaultArgs = () => {
        if (typeof(options.defaultArgs) === "function") {
          return options.defaultArgs(state);
        } else {
          return options.defaultArgs;
        }
      }
      const args: ConstructorParameters<TSource> = props.args ?? getDefaultArgs();

      const sourceObject: TObject = new source(...args);
      const instance = prepareObject<TContext, TSource, TExtraProps>(
        sourceObject,
        state,
        source.name,
        props,
        options,
      );
      return instance.object;
    });

    useObject(state, options, getObject, props)

    return getObject as unknown as Element;
  };
  return Component;
};
