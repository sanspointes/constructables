/* @jsxImportSource solid-js */
import { createRenderer, SxiObject } from '../src';
import { JSX } from 'solid-js/jsx-runtime';
import { onMount, splitProps, createRenderEffect, createSignal, Show, For } from 'solid-js';
import { SolixiRoot } from '../src/renderer';
import { Constructable } from '../src/types';
import { render } from 'solid-js/web';

class ClassNested {
  constructor(public value: number) {

  }
}

class ClassGraphNode {
  titleEl = document.createElement('div');
  childrenWrapper = document.createElement('div')
  private _id: number;
  constructor(id: number, public el = document.createElement('div')) {
    console.log('Constructing ClassGraphNode', id);
    this.titleEl.innerHTML = `GraphNode: ${id}`;
    this.titleEl.className ="graph-node-title";
    this.el.appendChild(this.titleEl);
    this.childrenWrapper.className ="graph-node-children-wrapper";
    el.style.border =  '1px solid black';

    this.childrenWrapper.style.display = 'flex';

    this.el.appendChild(this.childrenWrapper);
  } 

  set id (id: number) {
    this.titleEl.innerHTML = `GraphNode: ${id}`;
    this._id = id;
  }

  get id (): number {
    return this._id;
  }

  children: ClassGraphNode[] = [];
  addChild(child: ClassGraphNode) {
    console.log(`${this.id} adding child ${child.id}`);
    this.children.push(child);
    this.childrenWrapper.appendChild(child.el);
  }
  removeChild(child: ClassGraphNode) {
    if (child.el.parentElement === this.childrenWrapper) this.childrenWrapper.removeChild(child.el);
    const childIndex = this.children.findIndex(c => c === child);
    if (childIndex >= 0) {
      this.children.splice(childIndex, 1);
    }
  }
}

const initialState = {
  mountedNodes: new Set<number>(),
}

const {
  createRoot,
  wrapConstructable,
} = createRenderer(initialState);

const GraphNode = wrapConstructable(ClassGraphNode, {
  defaultArgs: [0],
  attach: (state, parent: SxiObject<typeof initialState, Constructable>, child) => {
    parent.addChild(child);
    console.log(`Attaching GraphNode ${child.id} -> ${parent.id}`)
    state.mountedNodes.add(child.id);
    return () => { 
      parent.removeChild(child);
      console.log(`Detatching GraphNode ${child.id} -> ${parent.id}`)
      state.mountedNodes.delete(child.id);
    }
  },
  extraProps: {},
})
const Nested = wrapConstructable(ClassNested, {
  defaultArgs: [0],
  attach: 'nested',
  extraProps: {},
})

type BasicRootProps<TRootObj> = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rootObject: TRootObj,
  children: JSX.Element | null,
  onCreated?: (root: SolixiRoot<typeof initialState, TRootObj>) => void,
}
const BasicRoot = <TRootObj,>(props: BasicRootProps<TRootObj>) => {
  const [propsWithChildren, rootProps] = splitProps(props, ['children']);
  // eslint-disable-next-line solid/reactivity
  const root = createRoot(rootProps.rootObject)

  createRenderEffect(() => {
    root.render(propsWithChildren)
  })

  onMount(() => {
    if (rootProps.onCreated) rootProps.onCreated(root);
  })

  return null;
}

const App = () => {
  let rootEl: HTMLDivElement|undefined;
  let graphNode1: ClassGraphNode|undefined;
  let graphNode2: ClassGraphNode|undefined;
  let nested1: ClassNested|undefined;
  let nested2: ClassNested|undefined;

  const [showChild, setShowChild] = createSignal(true);
  const [childId, setChildId] = createSignal(2);
  const toggleChild = () => {
    setShowChild(!showChild())
    console.log('Showing child?', showChild());
  }
  const incremenentChildId = () => {
    setChildId(childId() + 1);
  }

  const [rootObject, setRootObject] = createSignal<ClassGraphNode|undefined>(undefined);
  onMount(() => {
    setTimeout(() => {
      setRootObject(new ClassGraphNode(0, rootEl));
    }, 2000);
  })

  const onCreated = () => {
    console.log('graphNode1: ', graphNode1);
    console.log('graphNode2: ', graphNode2);
    console.log('nested1: ', nested1);
    console.log('nested2: ', nested2);
    console.log('RootObj.el === rootEl?: ', rootObject.el === rootEl);
  }

  const [objs, setObjs] = createSignal(new Array(5).fill(0).map((_, i) => i));
  const addObject = () => {
    setObjs([...objs(), objs().length + 1]);
  }
  return (
    <div>
      <button onClick={toggleChild}>ToggleChild</button>
      <button onClick={incremenentChildId}>Increment</button>
      <button onClick={addObject}>Add</button>
      <div id="custom-renderer-root" ref={rootEl} />

      <Show when={rootObject}>
        <BasicRoot rootObject={rootObject} onCreated={onCreated}>
          <GraphNode ref={graphNode1} args={[1]}>
            <Nested ref={nested1} args={[1]} />
            <GraphNode args={[3]} >
              <GraphNode args={[4]} />
            </GraphNode>
            {/* Conditional logic */}
            {showChild() && (
              <GraphNode ref={graphNode2} id={showChild() ? 1000 : childId()} >
                <Nested ref={nested2} value={childId()} />
              </GraphNode>
            )}

            {/* Conditional logic */}
            <For each={objs()}>
              {(item) => <GraphNode id={item + 5} />}
            </For>
          </GraphNode>
        </BasicRoot> 
      </Show>
    </div>
  );
}

render(() => (<App />), document.body);
