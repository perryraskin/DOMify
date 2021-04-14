const got = require("got")
const fetchCss = require("fetch-css")

export default async function handler(req, res) {
  console.log(req.query)
  const { url } = req.query
  try {
    const response = await got(url)
    const [{ css }] = await fetchCss([{ url }])
    const data = JSON.stringify(response.body)
    // console.log(JSON.stringify(res.body))
    res.status(200).json({ body: response.body, json: JSON.parse(data), css })
    // res.status(200).json({ json: JSON.parse(data), css })
  } catch (error) {
    console.error(error.message)
    res.status(500).json({ error: error.message })
  }
}
