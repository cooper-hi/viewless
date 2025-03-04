export function appModel(
  set: (obj: Partial<ReturnType<typeof appModel>>) => void,
  get: () => ReturnType<typeof appModel>
) {
  return {
    filterStatus: "all" as "all" | "completed" | "active",
    input: "",
    setFilterStatus: (filterStatus: "all" | "completed" | "active") => {
      set({ filterStatus });
    },
    setInput: (input: string) => {
      set({ input });
    },
  };
}
