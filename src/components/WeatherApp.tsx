import { useEffect, useState, type FormEvent } from "react";
import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSnow,
  Droplets,
  Heart,
  LocateFixed,
  MapPin,
  Search,
  Sun,
  Wind,
} from "lucide-react";
import {
  cityFromCoordinates,
  findCity,
  getWeather,
  type City,
  type WeatherSnapshot,
} from "../services/weather";
import { useLocalStorageState } from "../hooks/useLocalStorageState";

const defaultCity: City = {
  name: "北京",
  country: "中国",
  region: "北京市",
  latitude: 39.9042,
  longitude: 116.4074,
};

function weatherLabel(code: number) {
  if (code === 0) return "晴朗";
  if (code === 1) return "大致晴朗";
  if (code === 2) return "局部多云";
  if (code === 3) return "阴天";
  if (code === 45 || code === 48) return "有雾";
  if (code >= 51 && code <= 57) return "毛毛雨";
  if (code >= 61 && code <= 67) return "降雨";
  if (code >= 71 && code <= 77) return "降雪";
  if (code >= 80 && code <= 82) return "阵雨";
  if (code === 85 || code === 86) return "阵雪";
  if (code >= 95) return "雷暴";
  return "多云";
}

function WeatherGlyph({ code, size = 34 }: { code: number; size?: number }) {
  if (code === 0 || code === 1) return <Sun size={size} strokeWidth={1.6} />;
  if (code === 2) return <Cloud size={size} strokeWidth={1.6} />;
  if (code === 45 || code === 48) return <CloudFog size={size} strokeWidth={1.6} />;
  if (code >= 51 && code <= 57) return <CloudDrizzle size={size} strokeWidth={1.6} />;
  if (code >= 61 && code <= 67) return <CloudRain size={size} strokeWidth={1.6} />;
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return <CloudSnow size={size} strokeWidth={1.6} />;
  if (code >= 95) return <CloudLightning size={size} strokeWidth={1.6} />;
  return <Cloud size={size} strokeWidth={1.6} />;
}

function weekday(date: string, index: number) {
  if (index === 0) return "今天";
  return new Intl.DateTimeFormat("zh-CN", { weekday: "short" }).format(new Date(date + "T12:00:00"));
}

function locationName(city: City) {
  return [city.region, city.name, city.country].filter(Boolean).join(" · ");
}

export default function WeatherApp() {
  const [favorites, setFavorites] = useLocalStorageState<City[]>("folio-lab.weather-favorites", []);
  const [weather, setWeather] = useState<WeatherSnapshot | null>(null);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [locationBusy, setLocationBusy] = useState(false);

  const loadCity = async (city: City) => {
    setLoading(true);
    setError("");
    setQuery(city.name);
    try {
      setWeather(await getWeather(city));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "天气查询失败，请稍后重试。");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadCity(defaultCity);
  }, []);

  const handleSearch = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError("");
    try {
      const city = await findCity(query);
      setWeather(await getWeather(city));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "天气查询失败，请稍后重试。");
    } finally {
      setLoading(false);
    }
  };

  const locate = () => {
    if (!navigator.geolocation) {
      setError("此浏览器暂不支持定位，请直接搜索城市。");
      return;
    }
    setLocationBusy(true);
    setError("");
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const city = await cityFromCoordinates(
            position.coords.latitude,
            position.coords.longitude,
          );
          setWeather(await getWeather(city));
          setQuery(city.name);
        } catch (reason) {
          setError(reason instanceof Error ? reason.message : "获取当前位置天气失败。");
        } finally {
          setLocationBusy(false);
        }
      },
      () => {
        setError("定位未开启。你也可以输入城市名称进行查询。");
        setLocationBusy(false);
      },
      { enableHighAccuracy: false, timeout: 10000 },
    );
  };

  const isFavorite = weather
    ? favorites.some((city) => city.latitude === weather.city.latitude && city.longitude === weather.city.longitude)
    : false;

  const toggleFavorite = () => {
    if (!weather) return;
    if (isFavorite) {
      setFavorites((current) => current.filter((city) => city.latitude !== weather.city.latitude || city.longitude !== weather.city.longitude));
    } else {
      setFavorites((current) => [weather.city, ...current]);
    }
  };

  return (
    <div className="weather-layout">
      <section className="weather-main panel">
        <div className="weather-header">
          <div><div className="eyebrow"><span className="eyebrow-line" />此刻天气</div><h2>给今天，<span className="muted">一点天气线索。</span></h2></div>
          <div className="weather-api-chip"><span />OPEN-METEO API</div>
        </div>

        <form className="weather-searchbar" onSubmit={handleSearch}>
          <Search size={17} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="输入城市名称，例如：上海" aria-label="城市名称" />
          <button type="button" className="locate-button" onClick={locate} disabled={locationBusy} aria-label="定位当前位置"><LocateFixed size={17} />{locationBusy ? "定位中" : "定位"}</button>
          <button className="button button-primary search-submit" type="submit" disabled={loading}>查询 <Search size={15} /></button>
        </form>

        {error && <div className="weather-error" role="status">{error}</div>}

        {loading && !weather ? (
          <div className="weather-loading"><span className="loading-orbit" /><strong>正在读取天气...</strong><small>连接到 Open-Meteo 公开天气服务</small></div>
        ) : weather ? (
          <div className="weather-result">
            <div className="current-weather">
              <div className="current-place"><span><MapPin size={14} />当前位置</span><strong>{weather.city.name}</strong><small>{locationName(weather.city)}</small></div>
              <button className={isFavorite ? "favorite-toggle active" : "favorite-toggle"} onClick={toggleFavorite} aria-label={isFavorite ? "取消收藏城市" : "收藏城市"}><Heart size={16} fill={isFavorite ? "currentColor" : "none"} />{isFavorite ? "已收藏" : "收藏城市"}</button>
              <div className={"current-temp weather-code-" + weather.code}>
                <span className="current-weather-icon"><WeatherGlyph code={weather.code} size={42} /></span>
                <strong>{weather.temperature}<sup>°</sup></strong>
                <span>{weatherLabel(weather.code)}</span>
                <small>体感 {weather.apparent}°</small>
              </div>
              <div className="weather-metrics">
                <div><span><Droplets size={15} />湿度</span><strong>{weather.humidity}<small>%</small></strong></div>
                <div><span><Wind size={15} />风速</span><strong>{weather.wind}<small> km/h</small></strong></div>
                <div><span><Cloud size={15} />降水</span><strong>{weather.days[0]?.rain ?? 0}<small>%</small></strong></div>
              </div>
            </div>
            <div className="forecast-section">
              <div className="forecast-title"><div><span className="eyebrow-line" />未来五天</div><span className="mono">5-DAY FORECAST</span></div>
              <div className="forecast-list">
                {weather.days.map((day, index) => (
                  <div className="forecast-day" key={day.date}>
                    <span className="forecast-weekday">{weekday(day.date, index)}</span>
                    <span className={"forecast-icon weather-code-" + day.code}><WeatherGlyph code={day.code} size={21} /></span>
                    <span className="forecast-label">{weatherLabel(day.code)}</span>
                    <span className="forecast-temps"><strong>{day.high}°</strong><small>{day.low}°</small></span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="weather-loading"><span className="loading-orbit" /><strong>输入城市，开始查询</strong><small>天气与未来五天预报会显示在这里</small></div>
        )}
        <div className="weather-source">天气数据由 Open-Meteo 提供 · 搜索与定位后自动显示预报</div>
      </section>

      <aside className="weather-side">
        <section className="favorites-panel panel">
          <div className="panel-header compact">
            <div><div className="eyebrow"><span className="eyebrow-line" />常用地点</div><h2>我的收藏 <span className="favorite-count">{favorites.length}</span></h2></div>
            <Heart size={17} className="favorite-header-icon" />
          </div>
          {favorites.length === 0 ? (
            <div className="favorites-empty"><span><Heart size={17} /></span><strong>还没有收藏城市</strong><p>查询一个常去的城市，点「收藏城市」即可快速查看。</p></div>
          ) : (
            <div className="favorites-list">{favorites.map((city) => (
              <div className="favorite-city" key={city.latitude + "-" + city.longitude}>
                <button onClick={() => void loadCity(city)}><span className="favorite-city-icon"><MapPin size={15} /></span><span><strong>{city.name}</strong><small>{city.region || city.country}</small></span></button>
                <button className="remove-favorite" onClick={() => setFavorites((current) => current.filter((item) => item.latitude !== city.latitude || item.longitude !== city.longitude))} aria-label={"删除收藏 " + city.name}><span>×</span></button>
              </div>
            ))}</div>
          )}
        </section>
        <section className="weather-note-card">
          <div className="weather-note-art"><span className="weather-sun" /><span className="weather-cloud" /></div>
          <strong>出门前看一眼</strong>
          <p>了解天气变化，让每天的安排更从容。</p>
        </section>
      </aside>
    </div>
  );
}

