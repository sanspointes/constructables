import { Accessor, Context, useContext } from 'solid-js';
import { SolixiRoot, createRoot } from './renderer';
import {
    ExtraPropHandler,
    wrapConstructable,
    WrapConstructableOptions,
    ClassProps,
} from './elements';
import { Constructable, SxiObjectMetadata } from './types';

export type { ClassProps, Constructable };

export type { SxiObject, SxiInstance } from './types';
export { type ExtraPropHandler };

type ConstructableRenderer<TContext extends object> = {
    useConstructableState: () => TContext;
    createRoot: <TRootObject extends Constructable>(
        rootObject:
            | InstanceType<TRootObject>
            | Accessor<InstanceType<TRootObject>>,
        context: TContext,
    ) => SolixiRoot<TContext, SxiObjectMetadata<TContext, TRootObject>>;
    wrapConstructable: <
        TSource extends Constructable,
        TExtraProps extends Record<string, ExtraPropHandler<TContext, TSource>>,
    >(
        source: TSource,
        options: WrapConstructableOptions<TContext, TSource, TExtraProps>,
    ) => (props: ClassProps<TContext, TSource, TExtraProps>) => Element | null;
};
/**
 * Creates a new type of renderer that returns functions for generating
 * the root of the renderer, sharing the context around, and wrapping new Constructables.
 */
export const createRenderer = <TContext extends object>(
    context: Context<TContext>,
): ConstructableRenderer<TContext> => {
    const useConstructableState = () => {
        const state = useContext(context);
        if (!state) {
            throw new Error(
                'Constructable: Must use constructable state within constructable root.',
            );
        }
        return state;
    };

    return {
        useConstructableState,
        createRoot: <TRootObject extends Constructable>(
            rootObject:
                | InstanceType<TRootObject>
                | Accessor<InstanceType<TRootObject>>,
            initialState: TContext,
        ) => {
            return createRoot<TContext, TRootObject>(
                rootObject,
                context,
                initialState,
            );
        },
        wrapConstructable: <
            TSource extends Constructable,
            TExtraProps extends Record<
                string,
                ExtraPropHandler<TContext, TSource>
            >,
        >(
            source: TSource,
            options: WrapConstructableOptions<TContext, TSource, TExtraProps>,
        ) => {
            return wrapConstructable<TContext, TSource, TExtraProps>(
                source,
                options,
                useConstructableState,
            );
        },
    };
};
