import { NextRequest, NextResponse } from 'next/server';

const SUPPORTED_PROTOCOLS = new Set(['http:', 'https:']);

export async function POST(req: NextRequest) {
  const requestId = Math.random().toString(36).slice(2);

  try {
    const { url } = (await req.json()) as { url?: string };

    if (!url || typeof url !== 'string' || !url.trim()) {
      const error = 'Missing image URL';
      console.error(`${error} [requestId=${requestId}]`);
      return NextResponse.json({ error }, { status: 400 });
    }

    let parsedUrl: URL;

    try {
      parsedUrl = new URL(url);
    } catch (error) {
      console.error(`Invalid image URL [requestId=${requestId}]:`, error);
      return NextResponse.json({ error: 'Invalid image URL' }, { status: 400 });
    }

    if (!SUPPORTED_PROTOCOLS.has(parsedUrl.protocol)) {
      const error = 'Unsupported image URL protocol';
      console.error(`${error} [requestId=${requestId}]`);
      return NextResponse.json({ error }, { status: 400 });
    }

    const upstreamResponse = await fetch(parsedUrl, {
      headers: {
        Accept:
          'image/avif,image/webp,image/apng,image/svg+xml,image/*;q=0.8,*/*;q=0.5',
      },
      cache: 'no-store',
    });

    if (!upstreamResponse.ok) {
      const error = `Upstream download failed with status ${upstreamResponse.status}`;
      console.error(`${error} [requestId=${requestId}]`);
      return NextResponse.json({ error }, { status: upstreamResponse.status });
    }

    const arrayBuffer = await upstreamResponse.arrayBuffer();
    const contentType =
      upstreamResponse.headers.get('content-type') || 'application/octet-stream';

    const rawFilename = parsedUrl.pathname.split('/').pop() || 'image';
    const sanitizedFilename = rawFilename.split('?')[0] || 'image';

    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': String(arrayBuffer.byteLength),
        'Content-Disposition': `attachment; filename="${sanitizedFilename}"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error(
      `Unexpected error downloading image [requestId=${requestId}]:`,
      error
    );
    return NextResponse.json(
      { error: 'Failed to download image. Please try again later.' },
      { status: 500 }
    );
  }
}
