async function main() {
  const { writeBoardState } = await import("../backend/board-repository.js");
  const { initialState } = await import("../shared/board-state.js");
  await writeBoardState(initialState);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
