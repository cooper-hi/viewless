export function createModal<T = unknown>() {
  return function ModalStateCreator(
    set: (obj: Partial<ReturnType<typeof ModalStateCreator>>) => void,
    get: () => ReturnType<typeof ModalStateCreator>
  ) {
    return {
      visible: false,
      ctx: null as T | null,
      setCtx(ctx: T) {
        set({ ctx });
      },
      show(): void {
        set({ visible: true });
      },
      hide(): void {
        set({ visible: false, ctx: null as T });
      },
      open(ctx: T) {
        set({ visible: true, ctx });
      },
    };
  };
}
