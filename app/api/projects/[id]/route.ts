import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    success: true,
    message: "Project API ready",
  });
}

export async function PUT() {
  return NextResponse.json({
    success: true,
    message: "Project update API ready",
  });
}

export async function DELETE() {
  return NextResponse.json({
    success: true,
    message: "Project delete API ready",
  });
}
