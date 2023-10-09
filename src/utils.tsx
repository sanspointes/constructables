import { type JSX, Accessor, Context } from 'solid-js';

/**
 * Renders children with a given context
 * @template T - Type of context
 * @param children - Children tor ender
 * @param context - Context object with provider component
 * @param value - Value of context
 * @returns
 */
export function withContext<T>(
    children: Accessor<JSX.Element | JSX.Element[]>,
    context: Context<T>,
    value: T,
) {
    let result: JSX.Element | JSX.Element[];

    context.Provider({
        value,
        children: (() => {
            result = children();
            return '';
        }) as any as JSX.Element,
    });

    return () => result;
}
