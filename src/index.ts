import { Accessor, Context, useContext } from "solid-js";
import { SolixiRoot, createRoot } from "./renderer";
import { ExtraPropHandler, wrapConstructable, WrapConstructableOptions } from "./elements";
import { Constructable } from "./types";
import { ClassTypeProps2 } from "./elements";

export type { SxiObject, SxiInstance } from './types';

type ConstructableRenderer<TContext extends object> = {
  useConstructableState: () => TContext,
  createRoot: <TRootObject extends object>(rootObject: TRootObject, context: TContext) => SolixiRoot<TContext, TRootObject>,
  wrapConstructable: <
    TSource extends Constructable,
    TExtraProps extends Record<string, ExtraPropHandler<TContext, TSource>>
  >(source: TSource, options: WrapConstructableOptions<TContext, TSource, TExtraProps>) 
    => (props: ClassTypeProps2<TContext, TSource, TExtraProps>) => Element | null;
}
/**
 * Creates a new type of renderer that returns functions for generating 
 * the root of the renderer, sharing the context around, and wrapping new Constructables.
 */
export const createRenderer = <TContext extends object>(context: Context<TContext>): ConstructableRenderer<TContext> => {
  const useConstructableState = () => {
    const state = useContext(context);
    if (!state) {
      throw new Error(
        "Constructable: Must use constructable state within constructable root.",
      );
    }
    return state;
  };

  return {
    useConstructableState,
    createRoot: <TRootObject>(rootObject: TRootObject | Accessor<TRootObject>, initialState: TContext) => {
      return createRoot<TContext, TRootObject>(rootObject, context, initialState);
    },
    wrapConstructable: <
      TSource extends Constructable,
      TExtraProps extends Record<string, ExtraPropHandler<TContext, TSource>>,
    >(
      source: TSource,
      options: WrapConstructableOptions<TContext, TSource, TExtraProps>,
    ) => {
      return wrapConstructable<TContext, TSource, TExtraProps>(source, options, useConstructableState);
    },
  };
};
