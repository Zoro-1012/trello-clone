import { createBoardRecord, readBoardState, writeBoardState } from "../../../lib/board-repository";

export async function GET() {
  return Response.json(await readBoardState());
}

export async function PUT(request) {
  const nextState = await request.json();
  return Response.json(await writeBoardState(nextState));
}

export async function POST(request) {
  const { title } = await request.json();
  return Response.json(await createBoardRecord(title || "Untitled Board"));
}
