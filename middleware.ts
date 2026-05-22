export const config = { matcher: '/((?!assets/|favicon.ico).*)' };

export default function middleware(request: Request) {
  const auth = request.headers.get('authorization');
  const expected = 'Basic ' + btoa('preview:preview');
  if (auth !== expected) {
    return new Response('Authentication required', {
      status: 401,
      headers: { 'WWW-Authenticate': 'Basic realm="Preview"' },
    });
  }
}
