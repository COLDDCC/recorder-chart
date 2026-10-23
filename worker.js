/* Edge entry for recorder-chart.com (Cloudflare Workers static assets).
   1. 301 every www.recorder-chart.com request to the apex domain, so
      Google stops indexing www copies (it had picked up the www PDFs).
   2. Add a rel=canonical Link header to PDFs (they can't carry a <link>).
   Everything else is served unchanged from the static assets. */
const APEX = "recorder-chart.com";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.hostname === "www." + APEX) {
      url.hostname = APEX;
      url.protocol = "https:";
      return Response.redirect(url.toString(), 301);
    }
    const res = await env.ASSETS.fetch(request);
    if (url.pathname.endsWith(".pdf") && res.status === 200) {
      const out = new Response(res.body, res);
      out.headers.set("Link", "<https://" + APEX + url.pathname + '>; rel="canonical"');
      return out;
    }
    return res;
  }
};
