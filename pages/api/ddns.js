import { XMLParser } from "fast-xml-parser";

const ENDPOINT = "https://www.namesilo.com";
const parser = new XMLParser();

export default async function handler(req, res) {
  const { token, ip, host, ttl = 3600 } = req.query;
  const response = await fetch(
    `${ENDPOINT}/api/dnsListRecords?version=1&type=xml&key=${token}&domain=${process.env.DOMAIN}`
  );
  const data = await response.text();
  const parsed = parser.parse(data);
  const records = parsed.namesilo.reply.resource_record;
  const record = records.find(
    (item) => item.host === `${host}.${process.env.DOMAIN}`
  );

  try {
    await fetch(
      `${ENDPOINT}/api/dnsUpdateRecord?version=1&type=xml&key=${token}&domain=${process.env.DOMAIN}&rrid=${record.record_id}&rrhost=${host}&rrvalue=${ip}&rrttl=${ttl}`
    );
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, err });
  }
}
