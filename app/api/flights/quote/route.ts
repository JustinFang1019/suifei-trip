import { env } from "cloudflare:workers";

type SerpEnvironment = { SERPAPI_API_KEY?: string };

type FlightSegment = {
  departure_airport: { id: string; name?: string; time: string };
  arrival_airport: { id: string; name?: string; time: string };
  airline?: string;
  flight_number?: string;
};

type FlightOption = {
  flights: FlightSegment[];
  price: number;
  total_duration?: number;
  departure_token?: string;
  booking_token?: string;
};

type SerpFlightsResult = {
  error?: string;
  best_flights?: FlightOption[];
  other_flights?: FlightOption[];
  search_metadata?: { google_flights_url?: string; status?: string };
};

const IATA = /^[A-Z]{3}$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;

function response(body: unknown, status = 200) {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

function optionsOf(result: SerpFlightsResult, directOnly: boolean) {
  return [...(result.best_flights || []), ...(result.other_flights || [])]
    .filter((option) => !directOnly || option.flights.length === 1)
    .sort((a, b) => a.price - b.price);
}

function itinerary(option: FlightOption) {
  return {
    duration: option.total_duration,
    segments: option.flights.map((flight) => ({
      from: flight.departure_airport.id,
      to: flight.arrival_airport.id,
      departureAt: flight.departure_airport.time,
      arrivalAt: flight.arrival_airport.time,
      flight: flight.flight_number || flight.airline || "",
    })),
  };
}

async function search(params: URLSearchParams) {
  const result = await fetch(`https://serpapi.com/search.json?${params.toString()}`);
  const json = await result.json() as SerpFlightsResult;
  if (!result.ok && !json.error) throw new Error("即時航班查詢失敗");
  if (json.error && !json.error.includes("hasn't returned any results")) throw new Error(json.error);
  return json;
}

function googleFlightsUrl(origin: string, destination: string, departureDate: string, returnDate: string, directOnly: boolean) {
  const params = new URLSearchParams({
    hl: "zh-TW",
    curr: "TWD",
    q: `${origin} 到 ${destination} ${departureDate} 至 ${returnDate}${directOnly ? " 直飛" : ""}`,
  });
  return `https://www.google.com/travel/flights?${params.toString()}`;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const origin = (url.searchParams.get("origin") || "").toUpperCase();
  const destination = (url.searchParams.get("destination") || "").toUpperCase();
  const departureDate = url.searchParams.get("departureDate") || "";
  const returnDate = url.searchParams.get("returnDate") || "";
  const adults = Math.min(9, Math.max(1, Number(url.searchParams.get("adults") || 1)));
  const directOnly = url.searchParams.get("directOnly") === "true";

  if (!IATA.test(origin) || !IATA.test(destination) || !DATE.test(departureDate) || !DATE.test(returnDate)) {
    return response({ error: "航班查詢條件不完整。" }, 400);
  }

  const runtime = env as unknown as SerpEnvironment;
  if (!runtime.SERPAPI_API_KEY) {
    return response({ status: "unconfigured", error: "即時航班資料尚未連接。" }, 503);
  }

  const params = new URLSearchParams({
    engine: "google_flights",
    api_key: runtime.SERPAPI_API_KEY,
    departure_id: origin,
    arrival_id: destination,
    outbound_date: departureDate,
    return_date: returnDate,
    type: "1",
    adults: String(adults),
    travel_class: "1",
    currency: "TWD",
    gl: "tw",
    hl: "zh-tw",
    stops: directOnly ? "1" : "0",
    sort_by: "2",
    deep_search: "true",
    no_cache: "true",
  });

  try {
    const outboundResult = await search(params);
    const fallbackUrl = outboundResult.search_metadata?.google_flights_url || googleFlightsUrl(origin, destination, departureDate, returnDate, directOnly);
    if (outboundResult.error) {
      return response({ status: directOnly ? "no_direct" : "no_results", directOnly, checkedAt: new Date().toISOString(), bookingUrl: fallbackUrl });
    }
    const outboundOptions = optionsOf(outboundResult, directOnly);

    for (const outbound of outboundOptions.slice(0, 3)) {
      if (!outbound.departure_token) continue;
      const returnParams = new URLSearchParams(params);
      returnParams.set("departure_token", outbound.departure_token);
      const returnResult = await search(returnParams);
      if (returnResult.error) continue;
      const returnOptions = optionsOf(returnResult, directOnly);
      const inbound = returnOptions[0];
      if (!inbound) continue;

      const airlines = [...new Set([...outbound.flights, ...inbound.flights].map((flight) => flight.airline).filter(Boolean))];
      return response({
        status: "live",
        source: "Google Flights（SerpApi）",
        checkedAt: new Date().toISOString(),
        directOnly,
        price: inbound.price || outbound.price,
        currency: "TWD",
        offerCount: outboundOptions.length,
        airlines,
        bookingUrl: returnResult.search_metadata?.google_flights_url || fallbackUrl,
        itineraries: [itinerary(outbound), itinerary(inbound)],
      });
    }

    return response({ status: directOnly ? "no_direct" : "no_results", directOnly, checkedAt: new Date().toISOString(), bookingUrl: fallbackUrl });
  } catch (error) {
    return response({ error: error instanceof Error ? error.message : "即時航班查詢失敗。" }, 502);
  }
}
