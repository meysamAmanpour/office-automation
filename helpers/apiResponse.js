import { NextResponse } from "next/server"

export function success(
  data = null,
  message = "Success",
  status = 200,
  meta = null,
) {
  return NextResponse.json(
    {
      success: true,
      message,
      data,
      ...(meta && { meta }),
      timestamp: new Date().toISOString(),
    },
    { status },
  )
}

export function failure(message = "Error", status = 400, errors = null) {
  return NextResponse.json(
    {
      success: false,
      message,
      errors,
      timestamp: new Date().toISOString(),
    },
    { status },
  )
}
