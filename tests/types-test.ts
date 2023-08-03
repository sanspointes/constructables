/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-namespace */

import { ClassTypeProps2, ExtraPropsHandlers, WrapConstructableOptions, wrapConstructable } from "../src/elements";
import type { AttachStrategy, Constructable, NonFunctionKeys, Overwrite, SxiObject } from "../src/types";
import type { ExtraPropHandler } from "../src/elements";

class TestSource {
  defaultField = 'help!';
  constructor(public id: number, public name: string) {

  }

  getId(): number {
    return this.id;
  }
  getName(): string {
    return this.name;
  }
}
//
// @ts-ignore
namespace TestNonFunctionKeys {
  type Obj = {
    key1: string,
    key2(): void,
  }

  type keys = NonFunctionKeys<Obj>;

  // @ts-expect-no-error; Good
  let success: keys = 'key1';
  // @ts-expect-error; Bad
  let fail: keys = 'key2';



  type TestSourceNonFunctionKeys = NonFunctionKeys<InstanceType<typeof TestSource>>;

  success;
}

// @ts-ignore
namespace TestOverwrite {
  type Obj1 = {
    key1: string,
    key2(): void,
  }
  type Obj2 = {
    key2: number,
    key3: boolean,
  }

  type Obj = Overwrite<Obj1, Obj2>;

  // @ts-expect-no-error; Good
  let success: Obj = {
    key1: 'hello',
    key2: 1,
    key3: false,
  }

  let fail: Obj = {
    key1: 'hello',
    // @ts-expect-error; Bad
    key2: () => {

    },
    key3: false,
  }

  success;
  fail;
}

namespace TestExtraPropHandler {
  type TContext = {
    ctxValue: number,
  }
  const handler: ExtraPropHandler<TContext, typeof TestSource> = (parent, object) => {
    const obj: SxiObject<TContext, typeof TestSource> = object;
  };
}

namespace TestAttachStrategy {
  type TContext = {
    ctxValue: number,
  }
  const strategy1: AttachStrategy<TContext, typeof TestSource> = (parent, child) => {
    return () => { };
  }
  const strategy2: AttachStrategy<TContext, typeof TestSource> = 'hello';
}

namespace TestClassTypeProps {
  type TSource = typeof TestSource;
  type TContext = {
    ctxValue: number,
  }
  const extraProps: ExtraPropsHandlers<TContext, TSource> = {
    prop1: (ctx: TContext, parent: unknown, child: SxiObject<TContext, typeof TestSource>, value: string) => {

    },
  }

  type MyProps = ClassTypeProps2<TContext, TSource, typeof extraProps>;
}

namespace TestWrapConstructableOptions {
  type TContext = {
    ctxValue: number,
  }
  const getCtx = (): TContext => {
    return {
      ctxValue: 1,
    }
  }
  const v = wrapConstructable(TestSource, {
    defaultArgs: [1, 'default'],

    attach: (ctx, parent, child) => {
      const ctx2: TContext = ctx;
      return () => {

      }
    },
    extraProps: {
      extraProp1: (ctx, parent, child, value: string) => {

      }
    }
  }, getCtx);

  v({
  })
  v({
    args: [5, 'other-name'],
  })
  v({
    args: [5, 'other-name'],
    id: 5,
    name: 'override-other-name',
    defaultField: 'no help required',
    // @ts-expect-error ; Should not be able to access functions
    getName,
  })
}
