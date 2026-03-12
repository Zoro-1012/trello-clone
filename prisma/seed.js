async function main() {
  const { writeBoardState } = await import("../lib/board-repository.js");
  const { initialState } = await import("../lib/board-state.js");
  await writeBoardState(initialState);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
