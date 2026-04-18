import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    env: {
      owner: process.env.NEXT_PUBLIC_GITHUB_OWNER,
      repo: process.env.NEXT_PUBLIC_GITHUB_REPO,
      token: process.env.GITHUB_TOKEN ? 'set' : 'unset',
      keys: Object.keys(process.env).sort()
    }
  });
}
