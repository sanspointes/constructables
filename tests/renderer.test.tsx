/* @jsxImportSource solid-js */
// import { render } from '@solidjs/testing-library';
import { describe, expect, it } from 'vitest';
import '@testing-library/jest-dom'; // 👈 this is imported in order to use the jest-dom matchers 
import { render } from '@solidjs/testing-library';
import { createSignal, onMount, splitProps } from 'solid-js';

import { createRenderer, SxiObject } from '../src';
import { JSX } from 'solid-js/jsx-runtime';
import { SolixiRoot } from '../src/renderer';
import { Constructable } from '../src/types';
import { Show } from 'solid-js';


class ClassNested {
  constructor(public value: number) {

  }
}

class ClassGraphNode {
  public id: number;
  constructor(id: number) {
    this.id = id;
  }
  nested = new ClassNested(1);


  children: ClassGraphNode[] = [];
  addChild(child: ClassGraphNode) {
    this.children.push(child);
  }
  removeChild(child: ClassGraphNode) {
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

const Nested = wrapConstructable(ClassNested, {
  defaultArgs: [0],
  attach: 'nested',
  extraProps: {},
})
const GraphNode = wrapConstructable(ClassGraphNode, {
  defaultArgs: [0],
  attach: (state, parent: SxiObject<typeof initialState, Constructable>, child) => {
    parent.addChild(child);
    state.mountedNodes.add(child.id);
    return () => { 
      parent.removeChild(child);
      state.mountedNodes.delete(child.id);
    }
  },
  extraProps: {
    ['nested-value']: (_ctx, _parent, child, value: number) => {
      child.nested.value = value;
    }
  },
})

type BasicRootProps<TRootObj> = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rootObject: TRootObj,
  children: JSX.Element | JSX.Element[],
  onCreated: (root: SolixiRoot<typeof initialState, TRootObj>) => void,
}
const BasicRoot = <TRootObj,>(props: BasicRootProps<TRootObj>) => {
  onMount(() => {
    const [propsWithChildren, rootProps] = splitProps(props, ['children']);
    // eslint-disable-next-line solid/reactivity
    const root = createRoot(rootProps.rootObject)

    root.render(propsWithChildren)

    // eslint-disable-next-line solid/reactivity
    rootProps.onCreated(root);
  })
  return <div>Root</div>
}

describe('createRenderer', () => {
  it('Should set the root object correctly', (): Promise<void> => {
    return new Promise((res) => {
      const rootObject = new ClassGraphNode(0);

      let parentNode: ClassGraphNode|undefined;
      let childNode: ClassGraphNode|undefined;

      render(() => (<BasicRoot rootObject={rootObject} onCreated={(root) => {
        expect(root.rootObject).toBe(rootObject);
        res();
      }}>
        <GraphNode ref={parentNode} args={[1]}>
          <GraphNode ref={childNode} args={[3]} />
        </GraphNode>
      </BasicRoot>
      ));
    })
  });

  it('Should set refs correctly.', (): Promise<void> => {
    return new Promise((res) => {
      const rootObject = new ClassGraphNode(0);

      let parentNode: ClassGraphNode|undefined;
      let childNode: ClassGraphNode|undefined;

      render(() => (<BasicRoot rootObject={rootObject} onCreated={() => {
        expect(parentNode).not.toBeUndefined();
        expect(childNode).not.toBeUndefined();
        res();
      }}>
        <GraphNode ref={parentNode} args={[1]}>
          <GraphNode ref={childNode} args={[3]} />
        </GraphNode>
      </BasicRoot>
      ));
    })
  });

  it('Should apply args correctly', (): Promise<void> => {
    return new Promise((res) => {
      const rootObject = new ClassGraphNode(0);

      let parentNode: ClassGraphNode|undefined;
      let childNode: ClassGraphNode|undefined;

      render(() => (<BasicRoot rootObject={rootObject} onCreated={(root) => {
        expect(parentNode).not.toBeUndefined();
        expect(parentNode?.id).toBe(1);
        expect(childNode).not.toBeUndefined();
        expect(childNode?.id).toBe(3);
        res();
      }}>
        <GraphNode ref={parentNode} args={[1]}>
          <GraphNode ref={childNode} args={[3]} />
        </GraphNode>
      </BasicRoot>
      ));
    })
  });

  it('Should apply props correctly', (): Promise<void> => {
    return new Promise((res) => {
      const rootObject = new ClassGraphNode(0);

      let parentNode: ClassGraphNode|undefined;
      let childNode: ClassGraphNode|undefined;

      render(() => (<BasicRoot rootObject={rootObject} onCreated={(root) => {
        expect(parentNode).not.toBeUndefined();
        expect(parentNode?.id).toBe(1);
        expect(childNode).not.toBeUndefined();
        expect(childNode?.id).toBe(3);
        res();
      }}>
        <GraphNode ref={parentNode} id={1}>
          <GraphNode ref={childNode} id={3} />
        </GraphNode>
      </BasicRoot>
      ));
    })
  });

  it('Should apply the attach function', (): Promise<void> => {
    return new Promise((res) => {
      const rootObject = new ClassGraphNode(0);

      let parentNode: ClassGraphNode|undefined;
      let childNode: ClassGraphNode|undefined;

      render(() => (<BasicRoot rootObject={rootObject} onCreated={() => {
        expect(parentNode).not.toBeUndefined();
        expect(parentNode?.children).length(1);
        expect(parentNode?.children[0]).toBe(childNode);
        res();
      }}>
        <GraphNode ref={parentNode} args={[1]}>
          <GraphNode ref={childNode} args={[3]} />
        </GraphNode>
      </BasicRoot>
      ));
    })
  });

  it('Should apply attach string', (): Promise<void> => {
    return new Promise((res) => {
      const rootObject = new ClassGraphNode(0);

      let parentNode: ClassGraphNode|undefined;
      let nestedNode: ClassNested|undefined;

      render(() => (<BasicRoot rootObject={rootObject} onCreated={() => {
        expect(nestedNode).not.toBeUndefined();
        expect(nestedNode?.value).toBe(3);
        expect(parentNode).not.toBeUndefined();
        expect(parentNode?.nested.value).toBe(3);
        res();
      }}>
        <GraphNode ref={parentNode} args={[1]}>
          <Nested ref={nestedNode} value={3} />
        </GraphNode>
      </BasicRoot>
      ));
    })
  });

  it('Should apply extraProps', (): Promise<void> => {
    return new Promise((res) => {
      const rootObject = new ClassGraphNode(0);

      let parentNode: ClassGraphNode|undefined;
      let childNode: ClassGraphNode|undefined;

      render(() => (<BasicRoot rootObject={rootObject} onCreated={() => {
        expect(parentNode).not.toBeUndefined();
        expect(parentNode?.nested.value).toBe(2);
        res();
      }}>
        <GraphNode ref={parentNode} args={[1]} nested-value={2}>
          <GraphNode ref={childNode} args={[3]} />
        </GraphNode>
      </BasicRoot>
      ));
    })
  });

  it('Show unmount and cleanup the attach function', (): Promise<void> => {
    return new Promise((res) => {
      const rootObject = new ClassGraphNode(0);

      let parentNode: ClassGraphNode|undefined;
      let childNode: ClassGraphNode|undefined;

      const [showChild, setShowChild] = createSignal(true);
      render(() => (<BasicRoot rootObject={rootObject} onCreated={() => {
        expect(parentNode).not.toBeUndefined();
        expect(parentNode?.children).includes(childNode);
        setShowChild(false);
        expect(parentNode?.children).not.includes(childNode);
        res();
      }}>
        <GraphNode ref={parentNode} args={[1]} nested-value={2}>
          <Show when={showChild}>
            <GraphNode ref={childNode} args={[3]} />
          </Show>
        </GraphNode>
      </BasicRoot>
      ));
    })
  });
});
