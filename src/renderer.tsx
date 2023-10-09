import { Context, createMemo, JSX, Accessor } from 'solid-js';
import { withContext } from './utils';
import { Constructable, SxiObject, SxiObjectMetadata } from './types';
import { parentChildren, prepareObject, resolve } from './elements';

// type SxiProviderProps<TCanvas extends Canvas> = {
//   onCreated?: (state: SxiState) => void;
//   state: SxiState;
//   children: JSX.Element;
//   rootElement: TCanvas;
// }
// const SxiProvider = <TCanvas extends Canvas>(props: SxiProviderProps<TCanvas>) => {
//   return (
//     <SxiContext.Provider value={props.state}>
//       {props.children}
//     </SxiContext.Provider/>
//   );
// }

export type SolixiRoot<
    TContext extends object,
    TRootObject extends SxiObject<TContext, Constructable>,
> = {
    rootObject: TRootObject | undefined;
    state: TContext;
    render: (props: { children: JSX.Element | JSX.Element[] }) => void;
};

/**
 * Creates a root object for the Constructables to add to.
 * @template TRootObject extends InstanceType<Constructable> -
 * @template TContext -
 * @param rootObject -
 * @param context -
 * @param contextValue -
 * @param initialState -
 * @returns
 */
export const createRoot = <
    TContext extends object,
    TRootObject extends Constructable,
>(
    rootObject: InstanceType<TRootObject> | Accessor<InstanceType<TRootObject>>,
    context: Context<TContext>,
    contextValue: TContext,
): SolixiRoot<TContext, SxiObject<TContext, TRootObject>> => {
    console.debug('CNST: Creating Root', context, contextValue);

    const root: SolixiRoot<TContext, SxiObject<TContext, TRootObject>> = {
        rootObject: undefined,
        state: contextValue,
        render(props) {
            console.debug('CNST: Rendering root', context, contextValue);
            const ro = resolve(rootObject) as InstanceType<TRootObject> &
                SxiObjectMetadata<TContext, TRootObject>;
            const instance = prepareObject(
                ro,
                contextValue,
                'root',
                {},
                {
                    attach: null,
                    extraProps: {},
                    defaultArgs:
                        [] as unknown as ConstructorParameters<TRootObject>,
                },
            );
            this.rootObject = instance.object as SxiObject<
                TContext,
                TRootObject
            >;

            const childrenWithContext = createMemo(
                withContext(() => props.children, context, contextValue),
            );

            parentChildren(contextValue, () => instance.object, {
                get children() {
                    return childrenWithContext();
                },
            });
        },
    };

    return root;
};
