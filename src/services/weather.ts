export type City = {
  name: string;
  country: string;
  region: string;
  latitude: number;
  longitude: number;
};

export type ForecastDay = {
  date: string;
  code: number;
  high: number;
  low: number;
  rain: number;
};

export type WeatherSnapshot = {
  city: City;
  temperature: number;
  apparent: number;
  humidity: number;
  wind: number;
  code: number;
  days: ForecastDay[];
};

type GeocodingResponse = {
  results?: Array<{
    name: string;
    country?: string;
    admin1?: string;
    latitude: number;
    longitude: number;
  }>;
};

export async function findCity(query: string): Promise<City> {
  const params = new URLSearchParams({
    name: query.trim(),
    count: "1",
    language: "zh",
    format: "json",
  });
  const response = await fetch(
    "https://geocoding-api.open-meteo.com/v1/search?" + params.toString(),
  );
  if (!response.ok) throw new Error("城市搜索服务暂时不可用，请稍后再试。");
  const data = (await response.json()) as GeocodingResponse;
  const result = data.results?.[0];
  if (!result) throw new Error("没有找到这个城市，试试输入英文名或附近的大城市。");
  return {
    name: result.name,
    country: result.country ?? "",
    region: result.admin1 ?? "",
    latitude: result.latitude,
    longitude: result.longitude,
  };
}

export async function getWeather(city: City): Promise<WeatherSnapshot> {
  const params = new URLSearchParams({
    latitude: String(city.latitude),
    longitude: String(city.longitude),
    current: "temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m",
    daily: "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max",
    timezone: "auto",
    forecast_days: "5",
  });
  const response = await fetch(
    "https://api.open-meteo.com/v1/forecast?" + params.toString(),
  );
  if (!response.ok) throw new Error("天气服务暂时不可用，请稍后再试。");
  const data = (await response.json()) as {
    current: {
      temperature_2m: number;
      relative_humidity_2m: number;
      apparent_temperature: number;
      weather_code: number;
      wind_speed_10m: number;
    };
    daily: {
      time: string[];
      weather_code: number[];
      temperature_2m_max: number[];
      temperature_2m_min: number[];
      precipitation_probability_max: number[];
    };
  };
  return {
    city,
    temperature: Math.round(data.current.temperature_2m),
    apparent: Math.round(data.current.apparent_temperature),
    humidity: data.current.relative_humidity_2m,
    wind: Math.round(data.current.wind_speed_10m),
    code: data.current.weather_code,
    days: data.daily.time.map((date, index) => ({
      date,
      code: data.daily.weather_code[index],
      high: Math.round(data.daily.temperature_2m_max[index]),
      low: Math.round(data.daily.temperature_2m_min[index]),
      rain: data.daily.precipitation_probability_max[index],
    })),
  };
}

export async function cityFromCoordinates(
  latitude: number,
  longitude: number,
): Promise<City> {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    language: "zh",
    format: "json",
  });
  const response = await fetch(
    "https://geocoding-api.open-meteo.com/v1/reverse?" + params.toString(),
  );
  if (!response.ok) throw new Error("位置已获取，但城市名称查询失败。");
  const data = (await response.json()) as GeocodingResponse;
  const result = data.results?.[0];
  return {
    name: result?.name ?? "当前位置",
    country: result?.country ?? "",
    region: result?.admin1 ?? "",
    latitude,
    longitude,
  };
}

