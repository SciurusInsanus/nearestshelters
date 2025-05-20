import React, { useState } from "react";

const shelters = [
  { name: "САО приют", address: "ул. Примерная, д.1", coords: [55.894495, 37.551807], phone: "+79999999999", volunteer: "Анастасия" },
  { name: "ЮАО приют", address: "ул. Южная, д.5", coords: [55.630120, 37.718357], phone: "+79888888888", volunteer: "Ирина" },
  { name: "ЦАО приют", address: "ул. Центральная, д.10", coords: [55.760984, 37.620393], phone: "+79777777777", volunteer: "Ольга" },
];

const haversineDistance = ([lat1, lon1], [lat2, lon2]) => {
  const toRad = (val) => (val * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const fetchCoords = async (stationName) => {
  const apiKey = "74796fe5-c44e-403a-b715-a6e954b3118e";
  const url = `https://geocode-maps.yandex.ru/1.x/?format=json&apikey=${apiKey}&geocode=метро ${encodeURIComponent(
    stationName
  )}, Москва`;
  const res = await fetch(url);
  const data = await res.json();
  const pos = data.response.GeoObjectCollection.featureMember[0].GeoObject.Point.pos;
  const [lon, lat] = pos.split(" ").map(Number);
  return [lat, lon];
};

const NearestShelters = () => {
  const [station, setStation] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState("");

  const handleSearch = async () => {
    setLoading(true);
    try {
      const stationCoords = await fetchCoords(station);

      const distances = shelters.map((shelter) => ({
        ...shelter,
        distance: haversineDistance(stationCoords, shelter.coords),
      }));

      const sorted = distances.sort((a, b) => a.distance - b.distance);
      const nearest = sorted.slice(0, 2).map((shelter) => ({
        ...shelter,
        distance: shelter.distance.toFixed(2),
      }));

      setResult({ nearest, stationCoords });
    } catch (e) {
      alert("Ошибка при геокодировании станции.");
    }
    setLoading(false);
  };

  const generateLetter = () => {
    if (!result) return "";
    const { nearest } = result;
    return `${username}, добрый день!

Благодарим вас за неравнодушие к бездомным животным и обращение в наш фонд!

Перечисленные вами вещи в хорошем состоянии (без значительных повреждений и загрязнений), а также корм с неистекшим сроком годности с радостью примут в приютах.

Контакт волонтера приюта, с которым можно будет обсудить передачу помощи: ${nearest[0].phone}, ${nearest[0].volunteer}.
Не затруднит ли вас связаться с волонтером самостоятельно, чтобы согласовать все детали напрямую? Когда будете звонить, можно сказать, что контакт дали в фонде «РЭЙ».

Если передать помощь не получится по какой-либо причине, пожалуйста, напишите нам снова.

Спасибо!`;
  };

  return (
    <div className="p-4 max-w-xl mx-auto bg-white shadow rounded-xl">
      <h2 className="text-xl font-bold mb-4">Поиск ближайших приютов</h2>

      <input
        type="text"
        placeholder="Введите станцию метро"
        className="p-2 mb-4 border border-gray-300 rounded"
        value={station}
        onChange={(e) => setStation(e.target.value)}
      />
      <input
        type="text"
        placeholder="Введите ваше имя"
        className="p-2 mb-4 border border-gray-300 rounded"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      <button
        onClick={handleSearch}
        className="p-2 bg-green-500 text-white rounded"
      >
        Найти приюты
      </button>

      {loading ? (
        <div className="mt-4 p-2 text-gray-500">Загрузка...</div>
      ) : result ? (
        <div className="mt-4 p-2 bg-gray-100 rounded">
          <p className="font-bold">Ближайшие приюты:</p>
          <ul>
            {result.nearest.map((shelter, index) => (
              <li key={index}>
                {shelter.name} — {shelter.distance} км
              </li>
            ))}
          </ul>

          <div className="mt-4">
            <p className="font-bold">✉️ Сгенерированное письмо:</p>
            <pre className="bg-white p-4 border rounded text-sm whitespace-pre-wrap">{generateLetter()}</pre>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default NearestShelters;
