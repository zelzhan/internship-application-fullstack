addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})
/**
 * Respond with hello worker text
 * @param {Request} request
 */
async function handleRequest(request) {
  const response = await fetch("https://cfw-takehome.developers.workers.dev/api/variants")
  data = await response.json()
  let random = Math.floor(Math.random() * 2)

  cookie = request.headers.get('Cookie')

  if (cookie) {
    cookie = parseCookie(cookie)
    random = cookie['random']  
  }

  let response2 = await fetch(data.variants[random])

  if (!cookie || (cookie && (cookie != 1 || cookie != 0))) {
    response2 = new Response(response2.body, response2)
    response2.headers.set('Set-Cookie', [`random=${random}`])
  }
  
  random = parseInt(random) + 1


  return await new HTMLRewriter()
            .on('title', new TitleRewriter("My awesome title"))
            .on('h1#title', new TitleRewriter(`Awesome Variant Number ${random}!`))
            .on('p#description', new TitleRewriter("My GitHub profile is awesome"))
            .on('a#url', new AttributeRewriter("href"))
            .on('a#url', new TitleRewriter("Clink here to get my profile"))
            .transform(response2)
}


const parseCookie = str =>
  str
    .split(';')
    .map(v => v.split('='))
    .reduce((acc, v) => {
      acc[decodeURIComponent(v[0].trim())] = decodeURIComponent(v[1].trim());
      return acc;
    }, {});


class TitleRewriter {
  constructor(attributeName) {
    this.attributeName = attributeName
  }

  element(element) {
    element.setInnerContent(this.attributeName)
  }
}

class AttributeRewriter {
  constructor(attributeName) {
    this.attributeName = attributeName
  }
 
  element(element) {
    const attribute = element.getAttribute(this.attributeName)
    if (attribute) {
      element.setAttribute(
        this.attributeName,
        attribute.replace('https://cloudflare.com', 'https://github.com/zelzhan')
      )
    }
  }
}
