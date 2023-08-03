import { Context, createMemo, JSX, Accessor } from "solid-js";
import { createStore, SetStoreFunction } from "solid-js/store";
import { withContext } from "./utils";
import { Constructable, SxiObject } from "./types";
import { parentChildren, prepareObject, resolve } from "./elements";


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

export type SolixiRoot<TContext extends object, TRootObject extends SxiObject<TContext, Constructable>> = {
  rootObject: TRootObject|undefined,
  state: TContext;
  render: (props: { children: JSX.Element | JSX.Element[] }) => void;
}

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
  TRootObject extends InstanceType<Constructable>,
>(
  rootObject: TRootObject | Accessor<TRootObject>,
  context: Context<TContext>,
  contextValue: TContext
): SolixiRoot<TContext, TRootObject> => {

  const root: SolixiRoot<TContext, TRootObject> = {
    rootObject: undefined,
    state: contextValue,
    render(props) {
      console.log('ROOT: Rendering root');
      const instance = prepareObject(resolve(rootObject), contextValue, 'root', {}, {attach: null, extraProps: {}, defaultArgs:[  'never' ]});
      this.rootObject = instance as SxiObject<TContext, Constructable>;

      const childrenWithContext = createMemo(
        withContext(() => props.children, context, contextValue),
      );

      parentChildren(contextValue, () => instance.object, {
        get children() {
          return childrenWithContext();
        }
      })
    }
  }

  return root;
}
