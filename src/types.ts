import { Accessor } from "solid-js";
import { JSX } from "solid-js/h/jsx-runtime";

/*
 * UTILITY TYPES
 */
export type NonFunctionKeys<T> = {
  // eslint-disable-next-line @typescript-eslint/ban-types
  [K in keyof T]: T[K] extends Function ? never : K;
}[keyof T];
export type WrapFieldsWithAccessor<T> = {
  // eslint-disable-next-line @typescript-eslint/ban-types
  [K in keyof T]: Accessor<T[K]> | T[K];
};

export type Overwrite<T, O> = Omit<T, keyof O> & O;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Constructable = new (...args: any[]) => any;
export type Args<T> = T extends Constructable ? ConstructorParameters<T>
  : unknown[];

// eslint-disable-next-line @typescript-eslint/ban-types
export interface ClassType<T> extends Function {
  new (...args: unknown[]): T;
}

// Attach
export type AttachFnStrategy<
  TContext extends object,
  TSource extends Constructable,
> = (
  state: TContext,
  parent: SxiObject<TContext, Constructable>,
  child: SxiObject<TContext, TSource>,
) => () => void;
/**
 * Strategy for attaching/detatching a child to a parent.  Can either be a string, representing the function field on the parent
 * where the child is passed in as a parameter, or a method that provides access to both the parent and child.
 */
export type AttachStrategy<
  TContext extends object,
  TSource extends Constructable,
> = null | string | AttachFnStrategy<TContext, TSource>;

// INSTANCE TYPES
//

export type ClassT<
  TContext extends object,
  TSource extends Constructable,
  O extends SxiObject<TContext, TSource> = SxiObject<TContext, TSource>,
> = {
  args?: ConstructorParameters<TSource>;
  object?: O;
  visible?: boolean;
  attach?: AttachStrategy<TContext, TSource>;
  children?: JSX.Element | null,
};

export type SxiObjectMetadata<
  TContext extends object,
  TSource extends Constructable,
> = {
  __sxi: SxiInstance<TContext, TSource>;
};
export type SxiObject<
  TContext extends object,
  TSource extends Constructable,
> =
  & InstanceType<TSource>
  & SxiObjectMetadata<TContext, TSource>;

/**
 * Internal state for a SxiObject, stored under the object's `__sxi` iey.
 */
export type SxiInstance<
  TContext extends object,
  TSource extends Constructable,
> = {
  solixi: TContext;
  type: string;
  parent?: SxiInstance<TContext, TSource>;
  object: SxiObject<TContext, TSource>;
  children: SxiInstance<TContext, TSource>[];
  attach: AttachStrategy<TContext, TSource>;
};

