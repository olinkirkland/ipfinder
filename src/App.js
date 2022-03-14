import { useEffect, useState } from 'react';

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

  // Current IP
  useEffect(() => {
    fetch('https://api.ipify.org?format=json').then((response) => {
      response.json().then(({ ip }) => {
        setIp(ip);
      });
    });
  }, []);

  // IP Data
  useEffect(() => {
    if (!ip) return;

    console.log(`Getting data for ip address ${ip}`);
    const api = process.env.REACT_APP_GEOIPIFY;
    fetch(
      `https://geo.ipify.org/api/v2/country?apiKey=${api}&ipAddress=${ip}`
    ).then((response) => {
      response.json().then((data) => {
        setIpData(data);
      });
    });
  }, [ip]);

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

  return (
    <>
      <article>
        {!ipData && (
          <section id="loading">
            <p>Loading</p>
          </section>
        )}

        {ipData && (
          <section id="info">
            <p>Your public IP address</p>
            <h1>{ip}</h1>
            <ul className="info-grid">
              <li className="info-item">
                <p className="info-label">Location</p>
                <div className="info-body">
                  <i className="fas fa-map-marker-alt"></i>
                  <a
                    href={`https://google.com/maps/search/${ipData.location.region}, ${ipData.location.country}`}
                    target="_blank"
                  >
                    {ipData.location.region}
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
                <p className="info-label">{`Local time in ${ipData.location.region}`}</p>
                <div className="info-body">
                  <i className="fas fa-clock"></i> <p>{time}</p>
                  <p className="muted"> • </p>
                  <p className="muted">{date}</p>
                </div>
              </li>
            </ul>
          </section>
        )}

        {ipData && (
          <section id="map">
            <p>Map</p>
          </section>
        )}
      </article>
    </>
  );
}

export default App;
