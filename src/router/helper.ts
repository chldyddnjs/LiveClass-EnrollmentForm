import { lazy, type ComponentType } from 'react';

// any를 사용하지 않고 제네릭을 명시하여 완벽한 타입을 추론합니다.
export function lazyImport<
  T extends Record<string, ComponentType>, 
  K extends keyof T
>(
  factory: () => Promise<T>,
  name: K
) {
  return lazy(async () => {
    const module = await factory();
    return { default: module[name] };
  });
}
