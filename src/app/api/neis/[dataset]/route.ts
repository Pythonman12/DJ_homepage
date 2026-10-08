import { getNeisData, NeisError } from "@/lib/neis-server";
import type { NeisDataset } from "@/lib/neis";

const datasets: NeisDataset[] = [
  "school",
  "meals",
  "timetable",
  "schedule",
  "classes",
  "departments",
];

export async function GET(
  request: Request,
  context: { params: Promise<{ dataset: string }> },
) {
  const { dataset } = await context.params;
  if (!datasets.includes(dataset as NeisDataset)) {
    return Response.json(
      { error: "지원하지 않는 정보입니다." },
      { status: 404 },
    );
  }
  try {
    const result = await getNeisData(
      dataset as NeisDataset,
      new URL(request.url).searchParams,
    );
    return Response.json(result, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof NeisError) {
      return Response.json(
        { error: error.message, code: error.code },
        { status: error.status },
      );
    }
    return Response.json(
      { error: "정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요." },
      { status: 500 },
    );
  }
}
