export function GET() {
  return new Response("<!doctype html><html><body>测试页面正常</body></html>", {
    headers: {
      "content-type": "text/html; charset=utf-8"
    }
  });
}
