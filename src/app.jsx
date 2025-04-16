import React, { useState } from "react";

const haversineDistance = ([lat1, lon1], [lat2, lon2]) => {
  const toRad = (val) => (val * Math.PI) / 180;
  const R = 6371; // Радиус Земли в километрах
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Возвращаем расстояние в километрах
};

// Убедимся, что в адресах корректно возвращаются координаты
const fetchCoords = async (address) => {
  const apiKey = "74796fe5-c44e-403a-b715-a6e954b3118e"; // 🔑 Вставьте сюда свой API-ключ
  const url = `https://geocode-maps.yandex.ru/1.x/?format=json&apikey=${apiKey}&geocode=${encodeURIComponent(address)}, Москва`;
  const res = await fetch(url);
  const data = await res.json();
  
  if (!data.response.GeoObjectCollection.featureMember.length) {
    throw new Error('Координаты не найдены');
  }

  const pos = data.response.GeoObjectCollection.featureMember[0].GeoObject.Point.pos;
  const [lon, lat] = pos.split(" ").map(Number);
  
  // Выведем координаты для проверки
  console.log(`Координаты для адреса "${address}":`, lat, lon);

  return [lat, lon];
};

const ShelterSearch = () => {
  const [station, setStation] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const shelters = [
    { name: "Айка", address: "Московская обл., Рузский р-он, пос. Бороденки, ул. Сосновая, д.24" },
    { name: "БелоПес", address: "Московская область Луховицкий округ, посёлок Белоомут, СНТ Звезда, 62 участок" },
    { name: "Беригиня", address: "г.о. Наро-Фоминский, д. Скугорово, ул. Дачная, 21. Координаты: 55.479413, 36.509892" },
    { name: "Биозона", address: "пгт Белоозерский, Воскресенский район Московской области, ул. Коммунальная, д.7" },
    { name: "Бирюлево", address: "Востряковский пр-д, вл. 10А" },
    { name: "Татьяна Бурдова", address: "Тульская область, Заокский р-н, д. Железня, уч. 101. (Для навигатора - дом 95)" },
    { name: "Верные друзья", address: "г.Калуга ул.Азаровская д.46 к.2." },
    { name: "Волонтеры Одинцово", address: "Москва" }, // Пример, укажите актуальные данные
    // Добавьте другие приюты...
  ];

  const handleSearch = async () => {
    setLoading(true);
    try {
      // Получаем координаты станции
      const stationCoords = await fetchCoords(station);

      // Получаем координаты для каждого приюта и рассчитываем расстояния
      const distances = await Promise.all(
        shelters.map(async (shelter) => {
          const shelterCoords = await fetchCoords(shelter.address);
          return {
            ...shelter,
            distance: haversineDistance(stationCoords, shelterCoords),
          };
        })
      );

      // Сортируем приюты по расстоянию
      const sorted = distances.sort((a, b) => a.distance - b.distance);

      // Выводим все приюты с расстояниями для отладки
      console.log('Все приюты с расстояниями:', sorted);

      let nearestShelters;
      if (sorted[0].distance <= 1.5) {
        nearestShelters = [sorted[0]]; // Показать ближайший приют
      } else {
        nearestShelters = sorted.slice(0, 2); // Можно изменить на количество приютов, которое нужно показывать
      }

      setResult({ nearestShelters, stationCoords });
    } catch (e) {
      alert("Ошибка при геокодировании адресов.");
      console.error(e);
    }
    setLoading(false);
  };

  return (
    <div>
      <h1>Поиск ближайших приютов</h1>
      <div>
        <label>
          Введите адрес станции метро или населённого пункта:
          <input
            type="text"
            value={station}
            onChange={(e) => setStation(e.target.value)}
          />
        </label>
        <button onClick={handleSearch} disabled={loading}>
          {loading ? "Загружается..." : "Найти приюты"}
        </button>
      </div>

      {result && (
        <div>
          <h2>Ближайшие приюты:</h2>
          <ul>
            {result.nearestShelters.map((shelter, index) => (
              <li key={index}>
                <strong>{shelter.name}</strong>
                <br />
                Адрес: {shelter.address}
                <br />
                Расстояние: {shelter.distance.toFixed(2)} км
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ShelterSearch;
