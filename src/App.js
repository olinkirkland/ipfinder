import { Map, Marker } from 'pigeon-maps';
import { useEffect, useState } from 'react';
import { stamenToner } from 'pigeon-maps/providers';

const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
];

function App() {
  const [ip, setIp] = useState();
  const [ipData, setIpData] = useState();
  const [time, setTime] = useState();
  const [date, setDate] = useState();
  const [weather, setWeather] = useState();

  // Current IP
  useEffect(() => {
    getIp();
  }, []);

  function getIp() {
    fetch('https://api.ipify.org?format=json').then((response) => {
      response.json().then(({ ip }) => {
        setIp(ip);
      });
    });
  }

  // IP Data
  useEffect(() => {
    if (!ip) return;

    let knownIpData = {};
    try {
      knownIpData = JSON.parse(localStorage.getItem('knownIpData'));
    } catch (error) {
      console.log(
        'There was a problem loading known ip data from local storage'
      );
    }

    if (knownIpData[ip]) {
      setIpData(knownIpData[ip]);
      console.log(`Found data for ip address ${ip} in local storage`);
      return;
    }

    console.log(`Getting data for ip address ${ip}`);
    fetch(
      `https://geo.ipify.org/api/v2/country,city?apiKey=${process.env.REACT_APP_GEOIPIFY}&ipAddress=${ip}`
    ).then((response) => {
      response.json().then((data) => {
        console.log(data);
        setIpData(data);

        // Set to local storage
        knownIpData[ip] = data;
        localStorage.setItem('knownIpData', JSON.stringify(knownIpData));
      });
    });
  }, [ip]);

  // Weather
  useEffect(() => {
    if (!ipData) return;
    fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${ipData.location.lat}&lon=${ipData.location.lng}&appid=${process.env.REACT_APP_OPEN_WEATHER}`
    ).then((response) => {
      response.json().then((data) => {
        console.log(data);
        setWeather(data);
      });
    });
  }, [ipData]);

  // Time
  useEffect(() => {
    const intervalId = setInterval(
      () => updateTime(ipData ? ipData.location.timezone : ''),
      200
    );
    return () => clearInterval(intervalId);
  }, [ipData]);

  function updateTime(offset) {
    let now = new Date();
    now = new Date(`${now.toUTCString()}${offset.replaceAll(':', '')}`);
    setTime(`${now.toLocaleTimeString()}`);
    setDate(`${months[now.getMonth()]} ${now.getDay()}, ${now.getFullYear()}`);
  }

  function kelvinToCelcius(value) {
    return Math.floor((value - 273.15) * 100) / 100;
  }

  function getTemperatureIcon() {
    const t = kelvinToCelcius(weather.main.temp);
    if (t <= 0) return 'empty';
    if (t <= 10) return 'quarter';
    if (t <= 15) return 'half';
    if (t <= 20) return 'three-quarters';
    return 'full';
  }

  function getWeatherDescription() {
    const arr = weather.weather;
    return arr.map((w) => w.description);
  }

  function getWeatherIcon() {
    const arr = weather.weather;
    return `http://openweathermap.org/img/w/${arr[0].icon}.png`;
  }

  function clearAndReload() {
    setIp();
    setIpData();
    localStorage.setItem('knownIpData', {});
    getIp();
  }

  return (
    <>
      <article>
        {!ipData && (
          <section id="loading">
            <p>Loading</p>
          </section>
        )}

        {ipData && weather && (
          <section id="info">
            <p>Your public IP address</p>
            <h1>{ip}</h1>
            <ul className="info-grid">
              <li className="info-item">
                <p className="info-label">Location</p>
                <div className="info-body">
                  <i className="fas fa-map-marker-alt"></i>
                  <a
                    href={`https://google.com/maps/search/${ipData.location.city}, ${ipData.location.region}, ${ipData.location.country}`}
                    target="_blank"
                  >
                    {ipData.location.city}, {ipData.location.region}
                    <img
                      className="flag"
                      src={`https://flagcdn.com/h24/${ipData.location.country.toLowerCase()}.png`}
                      alt=""
                    />
                  </a>
                </div>
              </li>
              <li className="info-item">
                <p className="info-label">Service Provider</p>
                <div className="info-body">
                  <i className="fas fa-external-link-alt"></i>{' '}
                  <a
                    href={`${ipData.as.domain}`}
                    target="_blank"
                  >{`${ipData.isp}`}</a>
                </div>
              </li>
              <li className="info-item">
                <p className="info-label">{`Time in ${ipData.location.city}`}</p>
                <div className="info-body">
                  <i className="fas fa-clock"></i> <p>{time}</p>
                  <p className="muted"> • </p>
                  <p className="muted">{date}</p>
                </div>
              </li>
              <li className="info-item">
                <p className="info-label">{`Weather in ${ipData.location.city}`}</p>
                <div className="info-body">
                  <i
                    className={`fas fa-thermometer-${getTemperatureIcon()}`}
                  ></i>
                  <p>{`${kelvinToCelcius(weather.main.temp)} °C`}</p>
                  <p className="muted"> • </p>
                  <p className="capitalized">{getWeatherDescription()}</p>
                </div>
              </li>
            </ul>

            <div className="refresh-container">
              <a onClick={clearAndReload}>Reload data</a>
            </div>
          </section>
        )}

        {ipData && (
          <section id="map">
            <Map
              height={300}
              width={300}
              defaultCenter={[ipData.location.lat, ipData.location.lng]}
              defaultZoom={10}
              provider={stamenToner}
              dprs={[1, 2]}
            >
              <Marker
                width={50}
                anchor={[ipData.location.lat, ipData.location.lng]}
              />
            </Map>
          </section>
        )}
      </article>
    </>
  );
}

export default App;
