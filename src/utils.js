import { Redis } from '@upstash/redis'

export function num(n) {
    if (n > 1000000) return `${(n / 1000000).toFixed(1).replace('.0', '')}M`;
    if (n > 1000) return `${(n / 1000).toFixed(1).replace('.0', '')}K`;
    return n.toString();
  }





export const loadEntities = async (tweetID) => {
  
  // for later

  const redis = new Redis({
    url: "https://us1-rapid-doberman-37429.upstash.io",
    token: "AZI1ACQgYWZiOGQwMzUtMDI2YS00NDYyLWEzMDQtM2UxMjgzY2M1NTA0ZTFlMDUzYmM2M2Q2NGI4NGFhN2IyZjhiYmU4OWQzOTk=",
  })
  
  const RawEntities = await redis.get(tweetID)

  // convert string to object
  const entities = JSON.parse(RawEntities)

  return entities

}